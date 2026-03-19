"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          💰 Budget Tracker
        </Link>

        <div className="flex items-center gap-4">
          {session?.user?.email && (
            <span className="text-sm text-gray-600">{session.user.email}</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}
