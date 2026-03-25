import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFinancialAnalysis } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`analysis:${ip}`, { limit: 10, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const budget = await prisma.budget.findUnique({
      where: {
        userId_monthYear: {
          userId: session.user.id,
          monthYear,
        },
      },
      include: {
        debts: true,
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      );
    }

    // Generate analysis using Gemini
    const analysis = await generateFinancialAnalysis({
      mainIncome: parseFloat(budget.mainIncome as any) || 0,
      sideIncome: parseFloat(budget.sideIncome as any) || 0,
      debts: budget.debts,
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}
