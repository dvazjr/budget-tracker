import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeDebtStatement } from "@/lib/gemini";
import { supabaseServer } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { rejectCrossOrigin } from "@/lib/cors";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const corsError = rejectCrossOrigin(request);
  if (corsError) return corsError;

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
      if (!pdfText || typeof pdfText !== "string") {
        return NextResponse.json(
          { error: "PDF text required. Extract on client side." },
          { status: 400 }
        );
      }
      // Cap text size to prevent prompt injection via oversized documents
      textContent = pdfText.slice(0, 50_000);
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

      const VALID_AI_TYPES = new Set(["revolving", "loan", "utility"]);

      // Create debt items from analysis
      for (const debtData of analysis.debts) {
        // Only create if confidence > 60%
        if (debtData.confidence < 60) {
          continue;
        }

        // Sanitize and validate all AI-generated fields before persisting.
        // A crafted PDF could cause Gemini to return malicious or oversized values.
        const name = String(debtData.name ?? "").trim().slice(0, 200);
        const type = VALID_AI_TYPES.has(debtData.type) ? debtData.type : "revolving";
        const category = String(debtData.category ?? "").trim().slice(0, 50);
        const balance = isFinite(Number(debtData.balance)) ? Math.abs(Number(debtData.balance)) : null;
        const creditLimit = isFinite(Number(debtData.creditLimit)) ? Math.abs(Number(debtData.creditLimit)) : null;
        const interestRate = isFinite(Number(debtData.interestRate)) && Number(debtData.interestRate) >= 0 && Number(debtData.interestRate) <= 100
          ? Number(debtData.interestRate) : null;
        const minimumPayment = isFinite(Number(debtData.minimumPayment)) ? Math.abs(Number(debtData.minimumPayment)) : null;
        const monthlyPayment = isFinite(Number(debtData.monthlyPayment)) ? Math.abs(Number(debtData.monthlyPayment)) : null;
        const term = Number.isInteger(Number(debtData.term)) && Number(debtData.term) > 0 ? Number(debtData.term) : null;

        let payoffDate: Date | null = null;
        if (debtData.payoffDate && /^\d{4}-\d{2}-\d{2}$/.test(debtData.payoffDate)) {
          const d = new Date(debtData.payoffDate);
          if (!isNaN(d.getTime())) payoffDate = d;
        }

        if (!name) continue;

        const debt = await prisma.debtItem.create({
          data: {
            budgetId: uploadedFile.budgetId,
            name,
            type,
            category,
            balance,
            creditLimit,
            interestRate,
            minimumPayment,
            monthlyPayment,
            payoffDate,
            term,
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
