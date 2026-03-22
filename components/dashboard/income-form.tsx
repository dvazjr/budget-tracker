"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IncomeFormProps {
  onSuccess?: () => void;
}

export function IncomeForm({ onSuccess }: IncomeFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mainIncomeType, setMainIncomeType] = useState<"monthly" | "annual" | "hourly">("monthly");
  const [sideIncomeType, setSideIncomeType] = useState<"monthly" | "annual" | "hourly">("monthly");
  const [mainIncomeValue, setMainIncomeValue] = useState("");
  const [sideIncomeValue, setSideIncomeValue] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [sideHoursPerWeek, setSideHoursPerWeek] = useState("10");

  const [mainMonthly, setMainMonthly] = useState(0);
  const [sideMonthly, setSideMonthly] = useState(0);
  const [totalMonthly, setTotalMonthly] = useState(0);

  // Load current budget data on mount
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const res = await fetch("/api/budget");
        const data = await res.json();
        if (data.mainIncome) {
          setMainIncomeValue(data.mainIncome.toString());
          setMainMonthly(data.mainIncome);
        }
        if (data.sideIncome) {
          setSideIncomeValue(data.sideIncome.toString());
          setSideMonthly(data.sideIncome);
        }
      } catch (error) {
        console.error("Error fetching budget:", error);
      }
    };
    fetchBudget();
  }, []);

  // Calculate monthly income based on input type
  useEffect(() => {
    const value = parseFloat(mainIncomeValue) || 0;
    let monthly = 0;

    if (mainIncomeType === "monthly") {
      monthly = value;
    } else if (mainIncomeType === "annual") {
      monthly = value / 12;
    } else if (mainIncomeType === "hourly") {
      const hours = parseFloat(hoursPerWeek) || 0;
      monthly = value * hours * 4.33; // Average weeks per month
    }

    setMainMonthly(monthly);
  }, [mainIncomeValue, mainIncomeType, hoursPerWeek]);

  useEffect(() => {
    const value = parseFloat(sideIncomeValue) || 0;
    let monthly = 0;

    if (sideIncomeType === "monthly") {
      monthly = value;
    } else if (sideIncomeType === "annual") {
      monthly = value / 12;
    } else if (sideIncomeType === "hourly") {
      const hours = parseFloat(sideHoursPerWeek) || 0;
      monthly = value * hours * 4.33;
    }

    setSideMonthly(monthly);
  }, [sideIncomeValue, sideIncomeType, sideHoursPerWeek]);

  useEffect(() => {
    setTotalMonthly(mainMonthly + sideMonthly);
  }, [mainMonthly, sideMonthly]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    if (!mainIncomeValue) {
      setError("Main income is required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainIncome: mainMonthly,
          sideIncome: sideMonthly,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update income");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError("Failed to save income. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const weekly = totalMonthly / 4.33;
  const daily = totalMonthly / 30;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 text-green-700 rounded text-sm">
              ✓ Income saved successfully!
            </div>
          )}

          {/* Main Income */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Main Income *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select value={mainIncomeType} onValueChange={(value: any) => setMainIncomeType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual (Salary)</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.01"
                placeholder={
                  mainIncomeType === "monthly" ? "e.g., 5000" :
                  mainIncomeType === "annual" ? "e.g., 60000" :
                  "e.g., 25"
                }
                value={mainIncomeValue}
                onChange={(e) => setMainIncomeValue(e.target.value)}
                disabled={loading}
              />
            </div>
            {mainIncomeType === "hourly" && (
              <Input
                type="number"
                placeholder="Hours per week (e.g., 40)"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                disabled={loading}
              />
            )}
          </div>

          {/* Side Income */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Side Income (Optional)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select value={sideIncomeType} onValueChange={(value: any) => setSideIncomeType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.01"
                placeholder={
                  sideIncomeType === "monthly" ? "e.g., 500" :
                  sideIncomeType === "annual" ? "e.g., 6000" :
                  "e.g., 20"
                }
                value={sideIncomeValue}
                onChange={(e) => setSideIncomeValue(e.target.value)}
                disabled={loading}
              />
            </div>
            {sideIncomeType === "hourly" && (
              <Input
                type="number"
                placeholder="Hours per week (e.g., 10)"
                value={sideHoursPerWeek}
                onChange={(e) => setSideHoursPerWeek(e.target.value)}
                disabled={loading}
              />
            )}
          </div>

          {/* Income Breakdown */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg space-y-3">
            <p className="text-sm font-medium text-gray-700">Income Breakdown</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600">Monthly</p>
                <p className="text-2xl font-bold text-green-700">
                  ${totalMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Annual</p>
                <p className="text-xl font-bold text-gray-800">
                  ${(totalMonthly * 12).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Weekly</p>
                <p className="text-lg font-semibold text-gray-700">
                  ${weekly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Daily</p>
                <p className="text-lg font-semibold text-gray-700">
                  ${daily.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Income"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
