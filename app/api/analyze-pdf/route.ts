import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeDebtStatement } from "@/lib/gemini";
import { supabaseServer } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fileId, pdfText } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID required" },
        { status: 400 }
      );
    }

    // Get file from database
    const uploadedFile = await prisma.uploadedFile.findUnique({
      where: { id: fileId },
      include: { budget: true },
    });

    if (!uploadedFile || uploadedFile.budget.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Download file from Supabase Storage
    const { data, error: downloadError } = await supabaseServer.storage
      .from("budget-tracker-uploads")
      .download(uploadedFile.fileUrl);

    if (downloadError) {
      console.error("Supabase download error:", downloadError);
      return NextResponse.json(
        { error: "Failed to download file" },
        { status: 500 }
      );
    }

    let textContent = "";

    // Check file type and extract accordingly
    if (uploadedFile.fileName.toLowerCase().endsWith(".pdf")) {
      // For PDF files, we expect the text to be already extracted on the client
      if (!pdfText) {
        return NextResponse.json(
          { error: "PDF text required. Extract on client side." },
          { status: 400 }
        );
      }
      textContent = pdfText;
    } else {
      // For images, convert to base64 and let Gemini Vision handle it
      const arrayBuffer = await data.arrayBuffer();
      textContent = Buffer.from(arrayBuffer).toString("base64");
    }

    // Try to analyze with Gemini, but don't fail if it doesn't work
    let analysis;
    let createdDebts = [];

    try {
      analysis = await analyzeDebtStatement(textContent);

      // Create debt items from analysis
      for (const debtData of analysis.debts) {
        // Only create if confidence > 60%
        if (debtData.confidence < 60) {
          continue;
        }

        const debt = await prisma.debtItem.create({
          data: {
            budgetId: uploadedFile.budgetId,
            name: debtData.name,
            type: debtData.type,
            category: debtData.category,
            balance: debtData.balance,
            creditLimit: debtData.creditLimit || null,
            interestRate: debtData.interestRate,
            minimumPayment: debtData.minimumPayment || null,
            monthlyPayment: debtData.monthlyPayment || null,
            payoffDate: debtData.payoffDate
              ? new Date(debtData.payoffDate)
              : null,
            term: debtData.term || null,
            source: "pdf_upload",
            extractedData: debtData,
            uploadedFileId: fileId,
          },
        });

        createdDebts.push(debt);
      }
    } catch (geminiError) {
      console.error("Gemini analysis failed, but file uploaded successfully:", geminiError);
      // File is uploaded, user can manually add debts
    }

    return NextResponse.json({
      success: true,
      file: uploadedFile,
      analysis: analysis || null,
      createdDebts: createdDebts,
      message: createdDebts.length > 0
        ? `Extracted ${createdDebts.length} debt items from the statement.`
        : "File uploaded successfully. Please add debt information manually.",
    });
  } catch (error) {
    console.error("PDF analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze document" },
      { status: 500 }
    );
  }
}
