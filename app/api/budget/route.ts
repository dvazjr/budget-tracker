import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
        },
        include: {
          debts: true,
          snapshots: true,
        },
      });
    }

    return NextResponse.json(budget);
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

    return NextResponse.json(budget);
  } catch (error) {
    console.error("Budget POST error:", error);
    return NextResponse.json(
      { error: "Failed to update budget" },
      { status: 500 }
    );
  }
}
