"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IncomeFormProps {
  onSuccess?: () => void;
}

export function IncomeForm({ onSuccess }: IncomeFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mainIncome, setMainIncome] = useState("");
  const [sideIncome, setSideIncome] = useState("");
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    const main = parseFloat(mainIncome) || 0;
    const side = parseFloat(sideIncome) || 0;
    setTotalIncome(main + side);
  }, [mainIncome, sideIncome]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!mainIncome) {
      setError("Main income is required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainIncome: parseFloat(mainIncome),
          sideIncome: parseFloat(sideIncome) || 0,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update income");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError("Failed to save income. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Income</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Main Income *</label>
              <Input
                type="number"
                placeholder="e.g., 5000"
                value={mainIncome}
                onChange={(e) => setMainIncome(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Side Income (Optional)</label>
              <Input
                type="number"
                placeholder="e.g., 500"
                value={sideIncome}
                onChange={(e) => setSideIncome(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded">
            <p className="text-sm text-gray-600">
              <strong>Total Monthly Income:</strong>
            </p>
            <p className="text-2xl font-bold text-green-700">
              ${totalIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Income"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
