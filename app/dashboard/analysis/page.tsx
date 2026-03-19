"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Analysis {
  summary: string;
  debtToIncome: string;
  strategies: any[];
  spendingInsights: string[];
  incomeIdeas: string[];
}

export default function AnalysisPage() {
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analysis");
      const data = await res.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Error generating analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      generateAnalysis();
    }
  }, [session]);

  if (loading) return <div>Generating analysis...</div>;
  if (!analysis) return <div>No analysis available</div>;

  return (
    <div className="space-y-8">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Health Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
        </CardContent>
      </Card>

      {/* Debt-to-Income Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Debt-to-Income Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {analysis.debtToIncome}
          </p>
        </CardContent>
      </Card>

      {/* Payoff Strategies */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Debt Payoff Strategies</h2>
        {analysis.strategies.map((strategy, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle>{strategy.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold mb-2">Overview:</p>
                <p className="text-gray-700">{strategy.overview}</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Pros:</p>
                <ul className="list-disc pl-5 text-gray-700">
                  {strategy.pros.map((pro: string, i: number) => (
                    <li key={i}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">Cons:</p>
                <ul className="list-disc pl-5 text-gray-700">
                  {strategy.cons.map((con: string, i: number) => (
                    <li key={i}>{con}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Spending Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Habits & Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.spendingInsights.map((insight, idx) => (
              <li key={idx} className="flex gap-2 text-gray-700">
                <span className="text-blue-600">→</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Income Ideas */}
      <Card>
        <CardHeader>
          <CardTitle>Income Growth Ideas</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.incomeIdeas.map((idea, idx) => (
              <li key={idx} className="flex gap-2 text-gray-700">
                <span className="text-green-600">+</span>
                <span>{idea}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
