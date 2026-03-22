"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DebtFormProps {
  onSuccess: () => void;
}

export function DebtForm({ onSuccess }: DebtFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
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

    const isExpense = formData.type === "expense";

    if (!formData.name) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (!isExpense && (!formData.balance || !formData.interestRate)) {
      setError("Balance and interest rate are required for debts");
      setLoading(false);
      return;
    }

    if (isExpense && !formData.monthlyPayment) {
      setError("Monthly payment is required for expenses");
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
        accountNumber: "",
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
          <label className="text-sm font-medium">Account Number (Last 4)</label>
          <Input
            name="accountNumber"
            placeholder="e.g., 1234 (last 4 digits)"
            value={formData.accountNumber}
            onChange={handleChange}
            disabled={loading}
            maxLength={4}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Type *</label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revolving">Revolving (Credit Card)</SelectItem>
              <SelectItem value="loan">Loan</SelectItem>
              <SelectItem value="utility">Utility</SelectItem>
              <SelectItem value="expense">Monthly Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Category *</label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="auto_loan">Auto Loan</SelectItem>
              <SelectItem value="personal_loan">Personal Loan</SelectItem>
              <SelectItem value="student_loan">Student Loan</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="internet">Internet</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="gasoline">Gasoline</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.type !== "expense" && (
          <>
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
          </>
        )}

        {formData.type === "expense" && (
          <div className="col-span-2">
            <label className="text-sm font-medium">Monthly Payment *</label>
            <Input
              name="monthlyPayment"
              type="number"
              placeholder="0.00"
              value={formData.monthlyPayment}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        )}

        {formData.type !== "expense" && (
          <>
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
          </>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Adding debt..." : "Add Debt"}
      </Button>
    </form>
  );
}
