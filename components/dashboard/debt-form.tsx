"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface DebtFormProps {
  onSuccess: () => void;
}

export function DebtForm({ onSuccess }: DebtFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "revolving",
    category: "credit_card",
    balance: "",
    creditLimit: "",
    interestRate: "",
    minimumPayment: "",
    monthlyPayment: "",
    payoffDate: "",
    term: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name || !formData.balance || !formData.interestRate) {
      setError("Name, balance, and interest rate are required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to add debt");
      }

      // Reset form
      setFormData({
        name: "",
        type: "revolving",
        category: "credit_card",
        balance: "",
        creditLimit: "",
        interestRate: "",
        minimumPayment: "",
        monthlyPayment: "",
        payoffDate: "",
        term: "",
      });

      onSuccess();
    } catch (err) {
      setError("Failed to add debt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Debt Name *</label>
          <Input
            name="name"
            placeholder="e.g., Chase Credit Card"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-input rounded-md text-sm"
            disabled={loading}
          >
            <option value="revolving">Revolving (Credit Card)</option>
            <option value="loan">Loan</option>
            <option value="utility">Utility</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-input rounded-md text-sm"
            disabled={loading}
          >
            <option value="credit_card">Credit Card</option>
            <option value="auto_loan">Auto Loan</option>
            <option value="personal_loan">Personal Loan</option>
            <option value="student_loan">Student Loan</option>
            <option value="electric">Electric</option>
            <option value="water">Water</option>
            <option value="internet">Internet</option>
            <option value="phone">Phone</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Balance *</label>
          <Input
            name="balance"
            type="number"
            placeholder="0.00"
            value={formData.balance}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Interest Rate (%) *</label>
          <Input
            name="interestRate"
            type="number"
            placeholder="18.5"
            value={formData.interestRate}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Credit Limit</label>
          <Input
            name="creditLimit"
            type="number"
            placeholder="Optional"
            value={formData.creditLimit}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Minimum Payment</label>
          <Input
            name="minimumPayment"
            type="number"
            placeholder="Optional"
            value={formData.minimumPayment}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Monthly Payment</label>
          <Input
            name="monthlyPayment"
            type="number"
            placeholder="Optional"
            value={formData.monthlyPayment}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Payoff Date</label>
          <Input
            name="payoffDate"
            type="date"
            value={formData.payoffDate}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Term (months)</label>
          <Input
            name="term"
            type="number"
            placeholder="Optional"
            value={formData.term}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Adding debt..." : "Add Debt"}
      </Button>
    </form>
  );
}
