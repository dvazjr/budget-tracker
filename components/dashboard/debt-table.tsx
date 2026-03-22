"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DebtItem {
  id: string;
  name: string;
  accountNumber?: string;
  type: string;
  category: string;
  balance?: number;
  creditLimit?: number;
  interestRate?: number;
  minimumPayment?: number;
  monthlyPayment?: number;
  payoffDate?: string;
  term?: number;
  includeInAnalysis?: boolean;
  source: string;
}

interface DebtTableProps {
  debts: DebtItem[];
  onDelete: (debtId: string) => void;
  onToggleAnalysis?: (debtId: string, include: boolean) => void;
  onUpdatePayment?: (debtId: string, amount: number) => void;
}

export function DebtTable({ debts, onDelete, onToggleAnalysis, onUpdatePayment }: DebtTableProps) {
  const [sortBy, setSortBy] = useState<"balance" | "rate" | "payment">("balance");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const sortedDebts = [...debts].sort((a, b) => {
    if (sortBy === "balance") {
      return (b.balance || 0) - (a.balance || 0);
    } else if (sortBy === "rate") {
      return (b.interestRate || 0) - (a.interestRate || 0);
    } else {
      const aPayment = a.monthlyPayment || a.minimumPayment || 0;
      const bPayment = b.monthlyPayment || b.minimumPayment || 0;
      return bPayment - aPayment;
    }
  });

  const typeColors = {
    revolving: "bg-red-50 text-red-700",
    loan: "bg-blue-50 text-blue-700",
    utility: "bg-green-50 text-green-700",
    expense: "bg-purple-50 text-purple-700",
    recurring: "bg-orange-50 text-orange-700",
  };

  const handleSavePayment = (debtId: string) => {
    const amount = parseFloat(editValue);
    if (!isNaN(amount) && amount >= 0 && onUpdatePayment) {
      onUpdatePayment(debtId, amount);
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleStartEdit = (debt: DebtItem) => {
    setEditingId(debt.id);
    setEditValue((debt.monthlyPayment || debt.minimumPayment || 0).toString());
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
        <Button
          size="sm"
          variant={sortBy === "payment" ? "default" : "outline"}
          onClick={() => setSortBy("payment")}
        >
          Sort by Payment Amount
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
              <th className="px-4 py-3 text-center font-semibold">In Analysis</th>
              <th className="px-4 py-3 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedDebts.map((debt) => {
              const lastFour = debt.accountNumber ? `****${debt.accountNumber.slice(-4)}` : null;
              const termInfo = debt.term ? `${debt.term} payments left` : null;

              return (
                <tr key={debt.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {debt.name}
                      {lastFour && <span className="ml-2 text-gray-600">({lastFour})</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                      {debt.category}
                      {termInfo && <span className="ml-2">• {termInfo}</span>}
                    </div>
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
                    {debt.balance != null ? `$${debt.balance.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">{debt.interestRate != null ? `${debt.interestRate}%` : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    {editingId === debt.id && debt.type === "recurring" ? (
                      <div className="flex items-center gap-1 justify-end">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleSavePayment(debt.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSavePayment(debt.id);
                            if (e.key === "Escape") {
                              setEditingId(null);
                              setEditValue("");
                            }
                          }}
                          autoFocus
                          className="w-24 px-2 py-1 border rounded text-right"
                        />
                      </div>
                    ) : (
                      <span
                        onClick={() => debt.type === "recurring" && handleStartEdit(debt)}
                        className={debt.type === "recurring" ? "cursor-pointer hover:bg-gray-100 px-2 py-1 rounded" : ""}
                      >
                        ${(debt.monthlyPayment || debt.minimumPayment || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onToggleAnalysis?.(debt.id, !debt.includeInAnalysis)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        debt.includeInAnalysis !== false ? "bg-green-600" : "bg-gray-300"
                      }`}
                      title={debt.includeInAnalysis !== false ? "Included in analysis" : "Excluded from analysis"}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          debt.includeInAnalysis !== false ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {debt.type !== "recurring" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(debt.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-blue-50 rounded text-sm text-blue-700">
        <p>
          <strong>Total Balance (Included in Analysis):</strong> $
          {debts
            .filter((d) => d.includeInAnalysis !== false)
            .reduce((sum, d) => sum + (d.balance || 0), 0)
            .toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </p>
        <p>
          <strong>Total Monthly Obligations (Included in Analysis):</strong> $
          {debts
            .filter((d) => d.includeInAnalysis !== false)
            .reduce((sum, d) => sum + (d.monthlyPayment || d.minimumPayment || 0), 0)
            .toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </p>
      </div>
    </div>
  );
}
