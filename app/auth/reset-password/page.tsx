"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/auth/signin"), 3000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="p-3 bg-green-50 text-green-700 rounded text-sm">
          Password updated successfully! Redirecting to sign in...
        </div>
        <p className="text-center text-sm text-gray-600">
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            Sign In now
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">Enter your new password below.</p>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
          {error}
          {!token && (
            <span>
              {" "}
              <Link href="/auth/forgot-password" className="underline">
                Request a new one.
              </Link>
            </span>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">New Password</label>
        <Input
          type="password"
          placeholder="Min. 8 chars, uppercase, lowercase, number"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading || !token}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Confirm Password</label>
        <Input
          type="password"
          placeholder="Repeat your new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          disabled={loading || !token}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading || !token}>
        {loading ? "Updating..." : "Set New Password"}
      </Button>

      <p className="text-center text-sm text-gray-600">
        <Link href="/auth/signin" className="text-blue-600 hover:underline">
          Back to Sign In
        </Link>
      </p>
    </form>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
