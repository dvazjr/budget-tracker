import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

interface Budget {
  id: string;
  userId: string;
  monthYear: string;
  mainIncome: number;
  sideIncome: number;
  createdAt: string;
  updatedAt: string;
}

interface DebtItem {
  id: string;
  budgetId: string;
  type: string;
  category: string;
  name: string;
  balance: number;
  creditLimit?: number;
  interestRate: number;
  minimumPayment?: number;
  monthlyPayment?: number;
  payoffDate?: string;
  term?: number;
  source: string;
}

export function useBudget() {
  const { data: session, status } = useSession();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudget = useCallback(async () => {
    if (status !== "authenticated") return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/budget");
      if (!res.ok) throw new Error("Failed to fetch budget");

      const data = await res.json();
      setBudget(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [status]);

  const fetchDebts = useCallback(async () => {
    if (status !== "authenticated") return;

    try {
      const res = await fetch("/api/debts");
      if (!res.ok) throw new Error("Failed to fetch debts");

      const data = await res.json();
      setDebts(data);
    } catch (err) {
      console.error("Error fetching debts:", err);
    }
  }, [status]);

  const updateBudget = useCallback(
    async (mainIncome: number, sideIncome: number) => {
      try {
        const res = await fetch("/api/budget", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mainIncome, sideIncome }),
        });

        if (!res.ok) throw new Error("Failed to update budget");

        const data = await res.json();
        setBudget(data);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        throw err;
      }
    },
    []
  );

  const addDebt = useCallback(async (debtData: Partial<DebtItem>) => {
    try {
      const res = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(debtData),
      });

      if (!res.ok) throw new Error("Failed to add debt");

      const data = await res.json();
      setDebts((prev) => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  }, []);

  const updateDebt = useCallback(
    async (debtId: string, debtData: Partial<DebtItem>) => {
      try {
        const res = await fetch("/api/debts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: debtId, ...debtData }),
        });

        if (!res.ok) throw new Error("Failed to update debt");

        const data = await res.json();
        setDebts((prev) =>
          prev.map((d) => (d.id === debtId ? data : d))
        );
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        throw err;
      }
    },
    []
  );

  const deleteDebt = useCallback(async (debtId: string) => {
    try {
      const res = await fetch(`/api/debts?id=${debtId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete debt");

      setDebts((prev) => prev.filter((d) => d.id !== debtId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    if (status === "authenticated") {
      fetchBudget();
      fetchDebts();
    }
  }, [status, fetchBudget, fetchDebts]);

  return {
    budget,
    debts,
    loading,
    error,
    fetchBudget,
    fetchDebts,
    updateBudget,
    addDebt,
    updateDebt,
    deleteDebt,
  };
}
