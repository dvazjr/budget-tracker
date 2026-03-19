"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/dashboard/navbar";
import OverviewTab from "./overview/page";
import DebtsTab from "./debts/page";
import AnalysisTab from "./analysis/page";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="debts">Debts</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">{children}</TabsContent>
          <TabsContent value="debts">{children}</TabsContent>
          <TabsContent value="analysis">{children}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
