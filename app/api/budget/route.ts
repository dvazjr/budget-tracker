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

    let budget = await prisma.budget.findUnique({
      where: {
        userId_monthYear: {
          userId: session.user.id,
          monthYear,
        },
      },
      include: {
        debts: true,
        snapshots: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // Create budget if it doesn't exist
    if (!budget) {
      budget = await prisma.budget.create({
        data: {
          userId: session.user.id,
          monthYear,
          debts: {
            create: [
              {
                name: "Food",
                type: "recurring",
                category: "food",
                monthlyPayment: 0,
                source: "default",
                includeInAnalysis: true,
              },
              {
                name: "Gasoline",
                type: "recurring",
                category: "gasoline",
                monthlyPayment: 0,
                source: "default",
                includeInAnalysis: true,
              },
              {
                name: "Entertainment",
                type: "recurring",
                category: "entertainment",
                monthlyPayment: 0,
                source: "default",
                includeInAnalysis: true,
              },
            ],
          },
        },
        include: {
          debts: true,
          snapshots: true,
        },
      });
    }

    // Convert Decimal/String fields to proper numbers for frontend
    const formattedBudget = {
      ...budget,
      mainIncome: parseFloat(budget.mainIncome as any) || 0,
      sideIncome: parseFloat(budget.sideIncome as any) || 0,
      debts: budget.debts.map((debt: any) => ({
        ...debt,
        balance: debt.balance ? parseFloat(debt.balance) : undefined,
        creditLimit: debt.creditLimit ? parseFloat(debt.creditLimit) : undefined,
        interestRate: debt.interestRate ? parseFloat(debt.interestRate) : undefined,
        minimumPayment: debt.minimumPayment ? parseFloat(debt.minimumPayment) : undefined,
        monthlyPayment: debt.monthlyPayment ? parseFloat(debt.monthlyPayment) : undefined,
        term: debt.term ? parseInt(debt.term) : undefined,
      })),
    };

    return NextResponse.json(formattedBudget);
  } catch (error) {
    console.error("Budget GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget" },
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

    const { mainIncome, sideIncome, monthYear } = await request.json();

    const budgetMonthYear =
      monthYear ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

    const budget = await prisma.budget.upsert({
      where: {
        userId_monthYear: {
          userId: session.user.id,
          monthYear: budgetMonthYear,
        },
      },
      update: {
        mainIncome: parseFloat(mainIncome) || 0,
        sideIncome: parseFloat(sideIncome) || 0,
      },
      create: {
        userId: session.user.id,
        monthYear: budgetMonthYear,
        mainIncome: parseFloat(mainIncome) || 0,
        sideIncome: parseFloat(sideIncome) || 0,
      },
      include: {
        debts: true,
      },
    });

    // Create snapshot for tracking changes
    await prisma.budgetSnapshot.create({
      data: {
        budgetId: budget.id,
        snapshotData: budget,
      },
    });

    // Convert Decimal/String fields to proper numbers for frontend
    const formattedBudget = {
      ...budget,
      mainIncome: parseFloat(budget.mainIncome as any) || 0,
      sideIncome: parseFloat(budget.sideIncome as any) || 0,
      debts: budget.debts.map((debt: any) => ({
        ...debt,
        balance: debt.balance ? parseFloat(debt.balance) : undefined,
        creditLimit: debt.creditLimit ? parseFloat(debt.creditLimit) : undefined,
        interestRate: debt.interestRate ? parseFloat(debt.interestRate) : undefined,
        minimumPayment: debt.minimumPayment ? parseFloat(debt.minimumPayment) : undefined,
        monthlyPayment: debt.monthlyPayment ? parseFloat(debt.monthlyPayment) : undefined,
        term: debt.term ? parseInt(debt.term) : undefined,
      })),
    };

    return NextResponse.json(formattedBudget);
  } catch (error) {
    console.error("Budget POST error:", error);
    return NextResponse.json(
      { error: "Failed to update budget" },
      { status: 500 }
    );
  }
}
