"use client";

import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/dashboard/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  const tabs = [
    { name: "Overview", path: "/dashboard/overview" },
    { name: "Debts", path: "/dashboard/debts" },
    { name: "Analysis", path: "/dashboard/analysis" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full max-w-md">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                href={tab.path}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 ${
                  pathname === tab.path
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:bg-background/50"
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
