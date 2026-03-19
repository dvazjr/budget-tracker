"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    redirect("/dashboard/overview");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold text-gray-900">
            Take Control of Your Finances
          </h1>
          <p className="text-xl text-gray-600">
            Smart budget tracking, debt analysis, and personalized financial
            insights powered by AI. Upload your statements and get actionable
            recommendations in seconds.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" variant="default">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline">
                Create Account
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="font-semibold text-lg mb-2">Smart Analysis</h3>
              <p className="text-gray-600">
                AI-powered debt analysis from your uploaded statements
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <div className="text-3xl mb-4">💡</div>
              <h3 className="font-semibold text-lg mb-2">
                Personalized Strategies
              </h3>
              <p className="text-gray-600">
                Multiple payoff strategies tailored to your situation
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="font-semibold text-lg mb-2">Progress Tracking</h3>
              <p className="text-gray-600">
                Monitor your financial health over time with snapshots
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
