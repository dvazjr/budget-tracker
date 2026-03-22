"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DebtForm } from "@/components/dashboard/debt-form";
import { FileUpload } from "@/components/dashboard/file-upload";
import { DebtTable } from "@/components/dashboard/debt-table";
import { IncomeForm } from "@/components/dashboard/income-form";

interface DebtItem {
  id: string;
  name: string;
  type: string;
  category: string;
  balance: number;
  creditLimit?: number;
  interestRate: number;
  minimumPayment?: number;
  monthlyPayment?: number;
  payoffDate?: string;
  term?: number;
  includeInAnalysis?: boolean;
  source: string;
}

export default function DebtsPage() {
  const { data: session } = useSession();
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchDebts();

    // Refetch when page becomes visible (e.g., navigating back from another page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDebts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchDebts);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchDebts);
    };
  }, [session]);

  const fetchDebts = async () => {
    try {
      const res = await fetch("/api/debts");
      const data = await res.json();

      // Separate recurring expenses from regular debts
      const recurringExpenses = data.filter((d: DebtItem) => d.type === "recurring");
      const regularDebts = data.filter((d: DebtItem) => d.type !== "recurring");

      // Put recurring expenses at the top
      setDebts([...recurringExpenses, ...regularDebts]);
    } catch (error) {
      console.error("Error fetching debts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDebt = async (debtId: string) => {
    if (!confirm("Are you sure you want to delete this debt?")) return;

    try {
      await fetch(`/api/debts?id=${debtId}`, { method: "DELETE" });
      setDebts(debts.filter((d) => d.id !== debtId));
    } catch (error) {
      console.error("Error deleting debt:", error);
    }
  };

  const handleToggleAnalysis = async (debtId: string, include: boolean) => {
    try {
      const res = await fetch("/api/debts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: debtId, includeInAnalysis: include }),
      });

      if (res.ok) {
        setDebts(debts.map((d) => (d.id === debtId ? { ...d, includeInAnalysis: include } : d)));
      }
    } catch (error) {
      console.error("Error toggling analysis:", error);
    }
  };

  const handleUpdatePayment = async (debtId: string, amount: number) => {
    try {
      const res = await fetch("/api/debts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: debtId, monthlyPayment: amount }),
      });

      if (res.ok) {
        setDebts(debts.map((d) => (d.id === debtId ? { ...d, monthlyPayment: amount } : d)));
      }
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Income Input Section */}
      <IncomeForm onSuccess={fetchDebts} />

      {/* Add Debt Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Debt Manually</CardTitle>
          </CardHeader>
          <CardContent>
            <DebtForm onSuccess={fetchDebts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Statements</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload onSuccess={fetchDebts} />
          </CardContent>
        </Card>
      </div>

      {/* Debts List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Debts ({debts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {debts.length === 0 ? (
            <p className="text-gray-500">
              No debts added yet. Start by adding a debt or uploading a statement.
            </p>
          ) : (
            <DebtTable debts={debts} onDelete={handleDeleteDebt} onToggleAnalysis={handleToggleAnalysis} onUpdatePayment={handleUpdatePayment} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
