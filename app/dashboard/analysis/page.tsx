"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie,
  Cell,
} from "recharts";

interface DebtItem {
  id: string;
  name: string;
  type: string;
  balance?: number;
  interestRate?: number;
  minimumPayment?: number;
  monthlyPayment?: number;
  includeInAnalysis?: boolean;
}

interface Budget {
  mainIncome: number;
  sideIncome: number;
  debts: DebtItem[];
}

interface PayoffStrategy {
  name: string;
  description: string;
  totalMonths: number;
  totalInterest: number;
  monthlyPayments: { month: number; remaining: number; paid: number }[];
}

export default function AnalysisPage() {
  const { data: session } = useSession();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [extraPayment, setExtraPayment] = useState(0);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchBudget = async () => {
      try {
        const res = await fetch("/api/budget");
        const data = await res.json();
        setBudget(data);
        // Reset AI summary when budget data changes so it regenerates
        setAiSummary("");
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

  // Generate AI summary when budget data is available
  useEffect(() => {
    const generateSummary = async () => {
      if (!budget || loading) return;

      const analyzedDebts = budget.debts.filter((d: DebtItem) => d.includeInAnalysis !== false);
      const debtItems = analyzedDebts.filter((d: DebtItem) => d.type !== "expense" && d.type !== "recurring" && d.balance != null && d.interestRate != null);

      if (debtItems.length === 0 || aiSummary || summaryLoading) return;

      const totalIncome = budget.mainIncome + budget.sideIncome;
      const totalDebt = debtItems.reduce((sum: number, d: DebtItem) => sum + (d.balance || 0), 0);
      const totalMinPayments = analyzedDebts.reduce(
        (sum: number, d: DebtItem) => sum + (d.monthlyPayment || d.minimumPayment || 0),
        0
      );
      const availableForExtra = totalIncome - totalMinPayments;
      const debtToIncomeRatio = totalIncome > 0 ? (totalMinPayments / totalIncome) * 100 : 0;

      setSummaryLoading(true);
      try {
        const prompt = `You are a helpful financial advisor. Analyze this person's debt situation and provide encouraging, actionable advice in 2-3 paragraphs.

Financial Situation:
- Monthly Income: $${totalIncome.toLocaleString()}
- Total Debt: $${totalDebt.toLocaleString()}
- Monthly Debt Payments: $${totalMinPayments.toLocaleString()}
- Debt-to-Income Ratio: ${debtToIncomeRatio.toFixed(1)}%
- Available for Extra Payments: $${availableForExtra.toLocaleString()}

${debtToIncomeRatio > 90 ? 'WARNING: This person has a very high debt-to-income ratio (over 90%). They may be in financial distress.' : ''}

Provide:
1. An honest but encouraging assessment of their situation
2. 2-3 specific, actionable steps they can take immediately
3. Encouragement and realistic hope

Be warm, supportive, and specific. Avoid generic advice. Keep it under 200 words.`;

        const res = await fetch("/api/ai-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        const data = await res.json();
        setAiSummary(data.summary);
      } catch (error) {
        console.error("Error generating AI summary:", error);
        setAiSummary("Unable to generate AI summary at this time.");
      } finally {
        setSummaryLoading(false);
      }
    };

    generateSummary();
  }, [budget, loading, aiSummary, summaryLoading]);

  if (loading) return <div>Loading...</div>;
  if (!budget || budget.debts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Debts to Analyze</h2>
        <p className="text-gray-600">Add some debts to see payoff strategies and analysis.</p>
      </div>
    );
  }

  // Filter debts to only include those marked for analysis and exclude expenses from strategy calculations
  const analyzedDebts = budget.debts.filter((d) => d.includeInAnalysis !== false);
  const debtItems = analyzedDebts.filter((d) => d.type !== "expense" && d.balance != null && d.interestRate != null);

  if (debtItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Debts Selected for Analysis</h2>
        <p className="text-gray-600">Add debts (not expenses) and mark them for analysis to see payoff strategies.</p>
      </div>
    );
  }

  const totalIncome = budget.mainIncome + budget.sideIncome;
  const totalDebt = debtItems.reduce((sum, d) => sum + (d.balance || 0), 0);
  const totalMinPayments = analyzedDebts.reduce(
    (sum, d) => sum + (d.monthlyPayment || d.minimumPayment || 0),
    0
  );

  // Calculate debt payoff strategies
  const calculateSnowball = (debts: DebtItem[], extraPayment: number): PayoffStrategy => {
    const sorted = [...debts].sort((a, b) => (a.balance || 0) - (b.balance || 0));
    return simulatePayoff(sorted, extraPayment, "Debt Snowball");
  };

  const calculateAvalanche = (debts: DebtItem[], extraPayment: number): PayoffStrategy => {
    const sorted = [...debts].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
    return simulatePayoff(sorted, extraPayment, "Debt Avalanche");
  };

  const calculateHighestBalance = (debts: DebtItem[], extraPayment: number): PayoffStrategy => {
    const sorted = [...debts].sort((a, b) => (b.balance || 0) - (a.balance || 0));
    return simulatePayoff(sorted, extraPayment, "Highest Balance First");
  };

  const simulatePayoff = (
    orderedDebts: DebtItem[],
    extraPayment: number,
    strategyName: string
  ): PayoffStrategy => {
    const debts = orderedDebts.map((d) => ({
      ...d,
      currentBalance: d.balance || 0,
      minPayment: d.monthlyPayment || d.minimumPayment || 0,
    }));

    let month = 0;
    let totalInterest = 0;
    const monthlyPayments: { month: number; remaining: number; paid: number }[] = [];

    while (debts.some((d) => d.currentBalance > 0) && month < 600) {
      month++;
      let availableExtra = extraPayment;

      debts.forEach((debt) => {
        if (debt.currentBalance > 0) {
          const interest = (debt.currentBalance * ((debt.interestRate || 0) / 100)) / 12;
          totalInterest += interest;
          debt.currentBalance += interest;

          const payment = Math.min(debt.minPayment, debt.currentBalance);
          debt.currentBalance -= payment;
        }
      });

      for (const debt of debts) {
        if (debt.currentBalance > 0 && availableExtra > 0) {
          const extraApplied = Math.min(availableExtra, debt.currentBalance);
          debt.currentBalance -= extraApplied;
          availableExtra -= extraApplied;
        }
      }

      const remaining = debts.reduce((sum, d) => sum + Math.max(0, d.currentBalance), 0);
      monthlyPayments.push({
        month,
        remaining,
        paid: totalDebt - remaining,
      });
    }

    return {
      name: strategyName,
      description: getStrategyDescription(strategyName),
      totalMonths: month,
      totalInterest,
      monthlyPayments: monthlyPayments.filter((_, i) => i % 6 === 0 || i === monthlyPayments.length - 1),
    };
  };

  const getStrategyDescription = (name: string): string => {
    switch (name) {
      case "Debt Snowball":
        return "Pay off smallest debts first for psychological wins";
      case "Debt Avalanche":
        return "Pay off highest interest rate debts first to save money";
      case "Highest Balance First":
        return "Pay off largest debts first to reduce total burden";
      default:
        return "";
    }
  };

  const availableForExtra = totalIncome - totalMinPayments;
  const suggestedExtra = Math.max(0, Math.floor(availableForExtra * 0.5));

  const snowball = calculateSnowball(debtItems, extraPayment);
  const avalanche = calculateAvalanche(debtItems, extraPayment);
  const highestBalance = calculateHighestBalance(debtItems, extraPayment);

  const strategies = [snowball, avalanche, highestBalance];

  const comparisonData = strategies.map((s) => ({
    name: s.name.replace("Debt ", ""),
    Months: s.totalMonths,
    Interest: Math.round(s.totalInterest),
  }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

  const debtToIncomeRatio = totalIncome > 0 ? (totalMinPayments / totalIncome) * 100 : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Debt Payoff Analysis</h1>
        <p className="text-gray-600">
          Compare different strategies to find the best way to become debt-free
        </p>
      </div>

      {/* AI Summary */}
      <Card className={debtToIncomeRatio > 90 ? "border-red-300 bg-red-50" : "border-blue-300 bg-blue-50"}>
        <CardHeader>
          <CardTitle className={debtToIncomeRatio > 90 ? "text-red-900" : "text-blue-900"}>
            🤖 AI Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <p className="text-gray-600">Analyzing your financial situation...</p>
          ) : (
            <div className="prose prose-sm max-w-none">
              <p className={debtToIncomeRatio > 90 ? "text-red-800" : "text-blue-800"} style={{ whiteSpace: "pre-line" }}>
                {aiSummary}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extra Payment Slider */}
      <Card>
        <CardHeader>
          <CardTitle>Extra Monthly Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">
                Available after minimum payments: ${availableForExtra.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </label>
              <input
                type="range"
                min="0"
                max={Math.max(availableForExtra, 100)}
                step="50"
                value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
              />
              <div className="flex justify-between mt-2">
                <span className="text-2xl font-bold text-green-600">
                  ${extraPayment.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                {suggestedExtra > 0 && extraPayment === 0 && (
                  <button
                    onClick={() => setExtraPayment(suggestedExtra)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Use suggested: ${suggestedExtra.toLocaleString()}
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {strategies.map((strategy, idx) => (
          <Card key={strategy.name} className="relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: COLORS[idx] }}
            />
            <CardHeader>
              <CardTitle className="text-lg">{strategy.name}</CardTitle>
              <p className="text-sm text-gray-600">{strategy.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Time to Debt-Free</p>
                <p className="text-3xl font-bold" style={{ color: COLORS[idx] }}>
                  {Math.floor(strategy.totalMonths / 12)}y {strategy.totalMonths % 12}m
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Interest Paid</p>
                <p className="text-xl font-semibold">
                  ${strategy.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Strategy Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="Months" fill="#3b82f6" name="Months to Payoff" />
                <Bar yAxisId="right" dataKey="Interest" fill="#ef4444" name="Interest Paid ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debt Payoff Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" type="number" label={{ value: "Months", position: "insideBottom", offset: -5 }} />
                <YAxis label={{ value: "Debt Remaining ($)", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Legend />
                {strategies.map((strategy, idx) => (
                  <Line
                    key={strategy.name}
                    data={strategy.monthlyPayments}
                    type="monotone"
                    dataKey="remaining"
                    stroke={COLORS[idx]}
                    name={strategy.name}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Strategy */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">💡 Recommended Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {avalanche.totalInterest < snowball.totalInterest ? (
              <>
                <p className="text-lg font-semibold text-green-900">
                  Debt Avalanche (Highest Interest First)
                </p>
                <p className="text-gray-700">
                  This strategy will save you{" "}
                  <strong>
                    ${(snowball.totalInterest - avalanche.totalInterest).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </strong>{" "}
                  in interest compared to the Snowball method and get you debt-free{" "}
                  <strong>
                    {snowball.totalMonths - avalanche.totalMonths} months faster
                  </strong>
                  .
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-green-900">Debt Snowball (Smallest First)</p>
                <p className="text-gray-700">
                  While this may cost slightly more in interest, you will get psychological wins by
                  eliminating smaller debts quickly, which can help you stay motivated.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}