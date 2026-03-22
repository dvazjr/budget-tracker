"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Budget {
  id: string;
  mainIncome: number;
  sideIncome: number;
  debts: any[];
}

export default function OverviewPage() {
  const { data: session } = useSession();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchBudget = async () => {
      try {
        const res = await fetch("/api/budget");
        const data = await res.json();
        setBudget(data);
      } catch (error) {
        console.error("Error fetching budget:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudget();

    // Refetch when page becomes visible (e.g., navigating back from another page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchBudget();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchBudget);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchBudget);
    };
  }, [session]);

  if (loading) return <div>Loading...</div>;
  if (!budget) return <div>No budget found</div>;

  // Filter to only include debts marked for analysis
  const includedDebts = budget.debts.filter((d) => d.includeInAnalysis !== false);

  const totalIncome = budget.mainIncome + budget.sideIncome;
  const totalDebt = includedDebts.reduce((sum, d) => sum + (d.balance || 0), 0);
  const totalMonthlyPayments = includedDebts.reduce((sum, d) => sum + (d.monthlyPayment || d.minimumPayment || 0), 0);
  const debtToIncomeRatio = totalIncome > 0 ? ((totalMonthlyPayments / totalIncome) * 100).toFixed(1) : "0";
  const paymentToIncome = totalIncome > 0 ? ((totalMonthlyPayments / totalIncome) * 100).toFixed(1) : "0";
  const leftoverIncome = totalIncome - totalMonthlyPayments;

  // Calculate debt breakdown (only for included debts)
  const revolvingDebt = includedDebts
    .filter((d) => d.type === "revolving")
    .reduce((sum, d) => sum + (d.balance || 0), 0);

  const loanDebt = includedDebts
    .filter((d) => d.type === "loan")
    .reduce((sum, d) => sum + (d.balance || 0), 0);

  const utilityDebt = includedDebts
    .filter((d) => d.type === "utility")
    .reduce((sum, d) => sum + (d.balance || 0), 0);

  const debtData = [
    { name: "Revolving", value: revolvingDebt },
    { name: "Loans", value: loanDebt },
    { name: "Utilities", value: utilityDebt },
  ].filter((d) => d.value > 0);

  // Income breakdown chart
  const incomeBreakdownData = [
    { name: "Monthly Payments", value: totalMonthlyPayments, fill: "#ef4444" },
    { name: "Available Income", value: leftoverIncome > 0 ? leftoverIncome : 0, fill: "#10b981" },
  ];

  const COLORS = ["#ef4444", "#f59e0b", "#10b981"];

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Main: ${budget.mainIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })} + Side: ${budget.sideIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Debt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {includedDebts.length} debt {includedDebts.length === 1 ? 'item' : 'items'} included
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Obligations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalMonthlyPayments.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {paymentToIncome}% of income
            </p>
          </CardContent>
        </Card>

        <Card className={leftoverIncome >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Available Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${leftoverIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${leftoverIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              After minimum payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Debt-to-Income Indicator */}
      <Card>
        <CardHeader>
          <CardTitle>Debt-to-Income Ratio: {debtToIncomeRatio}%</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Monthly Debt Payments vs Monthly Income</span>
              <span className="font-semibold">
                ${totalMonthlyPayments.toLocaleString()} ÷ ${totalIncome.toLocaleString()} = {debtToIncomeRatio}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full ${
                  parseFloat(debtToIncomeRatio) <= 36 ? "bg-green-500" :
                  parseFloat(debtToIncomeRatio) <= 43 ? "bg-yellow-500" :
                  "bg-red-500"
                }`}
                style={{ width: `${Math.min(parseFloat(debtToIncomeRatio), 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {parseFloat(debtToIncomeRatio) <= 36 && "✅ Excellent! Your debt-to-income ratio is healthy."}
              {parseFloat(debtToIncomeRatio) > 36 && parseFloat(debtToIncomeRatio) <= 43 && "⚠️ Moderate debt load. Consider accelerating payments."}
              {parseFloat(debtToIncomeRatio) > 43 && parseFloat(debtToIncomeRatio) < 90 && "🚨 High debt burden. Focus on aggressive debt reduction."}
              {parseFloat(debtToIncomeRatio) >= 90 && "🔴 Critical debt situation. Seek professional financial counseling."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Income Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) =>
                    `${name}: $${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                  }
                  outerRadius={80}
                  dataKey="value"
                >
                  {incomeBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Debt Breakdown by Type */}
        {debtData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Debt Breakdown by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={debtData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) =>
                      `${name}: $${(value / 1000).toFixed(0)}k`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {debtData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Income vs Obligations Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Cash Flow Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: "Your Monthly Finances",
                    "Total Income": totalIncome,
                    "Debt Payments": totalMonthlyPayments,
                    "Available": leftoverIncome > 0 ? leftoverIncome : 0,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Total Income" fill="#3b82f6" />
                <Bar dataKey="Debt Payments" fill="#ef4444" />
                <Bar dataKey="Available" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}