import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

    const debt = await prisma.debtItem.create({
      data: {
        budgetId: budget.id,
        name: debtData.name,
        accountNumber: debtData.accountNumber || null,
        type: debtData.type,
        category: debtData.category,
        balance: debtData.balance ? parseFloat(debtData.balance) : null,
        creditLimit: debtData.creditLimit
          ? parseFloat(debtData.creditLimit)
          : null,
        interestRate: debtData.interestRate ? parseFloat(debtData.interestRate) : null,
        minimumPayment: debtData.minimumPayment
          ? parseFloat(debtData.minimumPayment)
          : null,
        monthlyPayment: debtData.monthlyPayment
          ? parseFloat(debtData.monthlyPayment)
          : null,
        payoffDate: debtData.payoffDate ? new Date(debtData.payoffDate) : null,
        term: debtData.term ? parseInt(debtData.term) : null,
        source: debtData.source || "manual",
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
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, ...updateData } = await request.json();

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
        ...updateData,
        balance: updateData.balance ? parseFloat(updateData.balance) : undefined,
        creditLimit: updateData.creditLimit
          ? parseFloat(updateData.creditLimit)
          : undefined,
        interestRate: updateData.interestRate
          ? parseFloat(updateData.interestRate)
          : undefined,
        minimumPayment: updateData.minimumPayment
          ? parseFloat(updateData.minimumPayment)
          : undefined,
        monthlyPayment: updateData.monthlyPayment
          ? parseFloat(updateData.monthlyPayment)
          : undefined,
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
