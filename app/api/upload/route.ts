import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const force = formData.get("force") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and images allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max 10MB." },
        { status: 400 }
      );
    }

    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    let budget = await prisma.budget.findUnique({
      where: {
        userId_monthYear: {
          userId: session.user.id,
          monthYear,
        },
      },
    });

    if (!budget) {
      budget = await prisma.budget.create({
        data: {
          userId: session.user.id,
          monthYear,
        },
      });
    }

    // Check for duplicate filename (unless force flag is set)
    if (!force) {
      const existingFile = await prisma.uploadedFile.findFirst({
        where: {
          budgetId: budget.id,
          fileName: file.name,
        },
      });

      if (existingFile) {
        return NextResponse.json({
          warning: true,
          duplicate: true,
          message: `⚠️ This file "${file.name}" appears to have been uploaded before. Do you want to upload it again?`,
          existingFile,
        }, { status: 409 });
      }
    }

    // Upload to Supabase Storage
    const fileName = `${session.user.id}/${Date.now()}-${file.name}`;
    const { data, error: uploadError } = await supabaseServer.storage
      .from("budget-tracker-uploads")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Save file reference to database
    const uploadedFile = await prisma.uploadedFile.create({
      data: {
        budgetId: budget.id,
        fileName: file.name,
        fileUrl: data.path,
      },
    });

    return NextResponse.json({
      success: true,
      file: uploadedFile,
      message: "File uploaded. Ready for AI analysis.",
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
