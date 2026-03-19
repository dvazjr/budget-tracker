"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  source: string;
}

interface DebtTableProps {
  debts: DebtItem[];
  onDelete: (debtId: string) => void;
}

export function DebtTable({ debts, onDelete }: DebtTableProps) {
  const [sortBy, setSortBy] = useState<"balance" | "rate">("balance");

  const sortedDebts = [...debts].sort((a, b) => {
    if (sortBy === "balance") {
      return b.balance - a.balance;
    } else {
      return b.interestRate - a.interestRate;
    }
  });

  const typeColors = {
    revolving: "bg-red-50 text-red-700",
    loan: "bg-blue-50 text-blue-700",
    utility: "bg-green-50 text-green-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={sortBy === "balance" ? "default" : "outline"}
          onClick={() => setSortBy("balance")}
        >
          Sort by Balance
        </Button>
        <Button
          size="sm"
          variant={sortBy === "rate" ? "default" : "outline"}
          onClick={() => setSortBy("rate")}
        >
          Sort by Interest Rate
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Type</th>
              <th className="px-4 py-3 text-right font-semibold">Balance</th>
              <th className="px-4 py-3 text-right font-semibold">Interest Rate</th>
              <th className="px-4 py-3 text-right font-semibold">Payment</th>
              <th className="px-4 py-3 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedDebts.map((debt) => (
              <tr key={debt.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{debt.name}</div>
                  <div className="text-xs text-gray-500">{debt.category}</div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      typeColors[debt.type as keyof typeof typeColors]
                    }`}
                  >
                    {debt.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  ${debt.balance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </td>
                <td className="px-4 py-3 text-right">{debt.interestRate}%</td>
                <td className="px-4 py-3 text-right">
                  ${(debt.monthlyPayment || debt.minimumPayment || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </td>
                <td className="px-4 py-3 text-center">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(debt.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-blue-50 rounded text-sm text-blue-700">
        <p>
          <strong>Total Balance:</strong> $
          {debts
            .reduce((sum, d) => sum + d.balance, 0)
            .toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </p>
        <p>
          <strong>Total Monthly Obligations:</strong> $
          {debts
            .reduce((sum, d) => sum + (d.monthlyPayment || d.minimumPayment || 0), 0)
            .toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </p>
      </div>
    </div>
  );
}
