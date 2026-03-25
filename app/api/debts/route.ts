import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { rejectCrossOrigin } from "@/lib/cors";

const VALID_TYPES = new Set(["revolving", "loan", "utility", "recurring"]);
const VALID_SOURCES = new Set(["manual", "pdf_upload", "default"]);
const MAX_STRING_LENGTH = 200;

function sanitizeString(val: unknown, maxLen = MAX_STRING_LENGTH): string {
  return String(val ?? "").trim().slice(0, maxLen);
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current month budget
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
      return NextResponse.json([]);
    }

    // Convert Decimal/String fields to proper numbers for frontend
    const formattedDebts = budget.debts.map((debt: any) => ({
      ...debt,
      balance: debt.balance ? parseFloat(debt.balance) : undefined,
      creditLimit: debt.creditLimit ? parseFloat(debt.creditLimit) : undefined,
      interestRate: debt.interestRate ? parseFloat(debt.interestRate) : undefined,
      minimumPayment: debt.minimumPayment ? parseFloat(debt.minimumPayment) : undefined,
      monthlyPayment: debt.monthlyPayment ? parseFloat(debt.monthlyPayment) : undefined,
      term: debt.term ? parseInt(debt.term) : undefined,
    }));

    return NextResponse.json(formattedDebts);
  } catch (error) {
    console.error("Debts GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch debts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const corsError = rejectCrossOrigin(request);
  if (corsError) return corsError;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const debtData = await request.json();

    const name = sanitizeString(debtData.name);
    if (!name) {
      return NextResponse.json({ error: "Debt name is required" }, { status: 400 });
    }

    const type = sanitizeString(debtData.type);
    if (!VALID_TYPES.has(type)) {
      return NextResponse.json({ error: "Invalid debt type" }, { status: 400 });
    }

    const source = sanitizeString(debtData.source || "manual");
    const validatedSource = VALID_SOURCES.has(source) ? source : "manual";

    const debt = await prisma.debtItem.create({
      data: {
        budgetId: budget.id,
        name,
        accountNumber: debtData.accountNumber ? sanitizeString(debtData.accountNumber, 4) : null,
        type,
        category: sanitizeString(debtData.category, 50),
        balance: debtData.balance ? parseFloat(debtData.balance) : null,
        creditLimit: debtData.creditLimit ? parseFloat(debtData.creditLimit) : null,
        interestRate: debtData.interestRate ? parseFloat(debtData.interestRate) : null,
        minimumPayment: debtData.minimumPayment ? parseFloat(debtData.minimumPayment) : null,
        monthlyPayment: debtData.monthlyPayment ? parseFloat(debtData.monthlyPayment) : null,
        payoffDate: debtData.payoffDate ? new Date(debtData.payoffDate) : null,
        term: debtData.term ? parseInt(debtData.term) : null,
        source: validatedSource,
      },
    });

    // Convert Decimal/String fields to proper numbers for frontend
    const formattedDebt = {
      ...debt,
      balance: debt.balance ? parseFloat(debt.balance as any) : undefined,
      creditLimit: debt.creditLimit ? parseFloat(debt.creditLimit as any) : undefined,
      interestRate: debt.interestRate ? parseFloat(debt.interestRate as any) : undefined,
      minimumPayment: debt.minimumPayment ? parseFloat(debt.minimumPayment as any) : undefined,
      monthlyPayment: debt.monthlyPayment ? parseFloat(debt.monthlyPayment as any) : undefined,
      term: debt.term ? parseInt(debt.term as any) : undefined,
    };

    return NextResponse.json(formattedDebt, { status: 201 });
  } catch (error) {
    console.error("Debt POST error:", error);
    return NextResponse.json(
      { error: "Failed to create debt" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const corsError = rejectCrossOrigin(request);
  if (corsError) return corsError;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Debt ID is required" }, { status: 400 });
    }

    // Validate type if provided
    if (updateData.type !== undefined && !VALID_TYPES.has(sanitizeString(updateData.type))) {
      return NextResponse.json({ error: "Invalid debt type" }, { status: 400 });
    }

    // Verify debt belongs to user
    const debt = await prisma.debtItem.findUnique({
      where: { id },
      include: { budget: true },
    });

    if (!debt || debt.budget.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updated = await prisma.debtItem.update({
      where: { id },
      data: {
        ...(updateData.name !== undefined && { name: sanitizeString(updateData.name) }),
        ...(updateData.type !== undefined && { type: sanitizeString(updateData.type) }),
        ...(updateData.category !== undefined && { category: sanitizeString(updateData.category, 50) }),
        ...(updateData.accountNumber !== undefined && { accountNumber: sanitizeString(updateData.accountNumber, 4) }),
        balance: updateData.balance ? parseFloat(updateData.balance) : undefined,
        creditLimit: updateData.creditLimit ? parseFloat(updateData.creditLimit) : undefined,
        interestRate: updateData.interestRate ? parseFloat(updateData.interestRate) : undefined,
        minimumPayment: updateData.minimumPayment ? parseFloat(updateData.minimumPayment) : undefined,
        monthlyPayment: updateData.monthlyPayment ? parseFloat(updateData.monthlyPayment) : undefined,
        ...(updateData.includeInAnalysis !== undefined && { includeInAnalysis: Boolean(updateData.includeInAnalysis) }),
      },
    });

    // Convert Decimal/String fields to proper numbers for frontend
    const formattedUpdated = {
      ...updated,
      balance: updated.balance ? parseFloat(updated.balance as any) : undefined,
      creditLimit: updated.creditLimit ? parseFloat(updated.creditLimit as any) : undefined,
      interestRate: updated.interestRate ? parseFloat(updated.interestRate as any) : undefined,
      minimumPayment: updated.minimumPayment ? parseFloat(updated.minimumPayment as any) : undefined,
      monthlyPayment: updated.monthlyPayment ? parseFloat(updated.monthlyPayment as any) : undefined,
      term: updated.term ? parseInt(updated.term as any) : undefined,
    };

    return NextResponse.json(formattedUpdated);
  } catch (error) {
    console.error("Debt PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update debt" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const corsError = rejectCrossOrigin(request);
  if (corsError) return corsError;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Debt ID required" },
        { status: 400 }
      );
    }

    // Verify debt belongs to user
    const debt = await prisma.debtItem.findUnique({
      where: { id },
      include: { budget: true },
    });

    if (!debt || debt.budget.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.debtItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Debt DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete debt" },
      { status: 500 }
    );
  }
}
