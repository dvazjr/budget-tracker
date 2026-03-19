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
  }, [session]);

  if (loading) return <div>Loading...</div>;
  if (!budget) return <div>No budget found</div>;

  const totalIncome = budget.mainIncome + budget.sideIncome;
  const totalDebt = budget.debts.reduce((sum, d) => sum + d.balance, 0);
  const debtToIncome = totalIncome > 0 ? (totalDebt / totalIncome).toFixed(2) : 0;

  // Calculate debt breakdown
  const revolvingDebt = budget.debts
    .filter((d) => d.type === "revolving")
    .reduce((sum, d) => sum + d.balance, 0);

  const loanDebt = budget.debts
    .filter((d) => d.type === "loan")
    .reduce((sum, d) => sum + d.balance, 0);

  const utilityDebt = budget.debts
    .filter((d) => d.type === "utility")
    .reduce((sum, d) => sum + d.balance, 0);

  const debtData = [
    { name: "Revolving", value: revolvingDebt },
    { name: "Loans", value: loanDebt },
    { name: "Utilities", value: utilityDebt },
  ].filter((d) => d.value > 0);

  const COLORS = ["#ef4444", "#f59e0b", "#10b981"];

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Main: ${budget.mainIncome.toLocaleString()} + Side: ${budget.sideIncome.toLocaleString()}
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
              ${totalDebt.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {budget.debts.length} debt items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Debt-to-Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{debtToIncome}x</div>
            <p className="text-xs text-gray-500 mt-1">
              Total debt vs monthly income
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
              $
              {budget.debts
                .reduce((sum, d) => sum + (d.monthlyPayment || d.minimumPayment || 0), 0)
                .toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total minimum/fixed payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Income vs Monthly Obligations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: "Income vs Obligations",
                    Income: totalIncome,
                    Obligations: budget.debts.reduce(
                      (sum, d) => sum + (d.monthlyPayment || d.minimumPayment || 0),
                      0
                    ),
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Income" fill="#10b981" />
                <Bar dataKey="Obligations" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
