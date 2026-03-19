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

    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get("budgetId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!budgetId) {
      return NextResponse.json(
        { error: "Budget ID required" },
        { status: 400 }
      );
    }

    // Verify budget belongs to user
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget || budget.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshots = await prisma.budgetSnapshot.findMany({
      where: { budgetId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(snapshots);
  } catch (error) {
    console.error("Snapshots GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch snapshots" },
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
    const snapshotId = searchParams.get("id");

    if (!snapshotId) {
      return NextResponse.json(
        { error: "Snapshot ID required" },
        { status: 400 }
      );
    }

    // Verify snapshot belongs to user's budget
    const snapshot = await prisma.budgetSnapshot.findUnique({
      where: { id: snapshotId },
      include: { budget: true },
    });

    if (!snapshot || snapshot.budget.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.budgetSnapshot.delete({
      where: { id: snapshotId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Snapshot DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete snapshot" },
      { status: 500 }
    );
  }
}
