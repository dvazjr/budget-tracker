# Budget Tracker - Feature Implementation Guide

This guide helps you add new features to the Budget Tracker application.

---

## Architecture Overview

### File Structure by Concern

```
Feature Implementation:
1. Database Layer     → prisma/schema.prisma
2. API Layer         → app/api/[feature]/route.ts
3. Data Layer        → lib/[feature].ts (utilities/calculations)
4. State Management  → hooks/use[Feature].ts (if complex)
5. Components        → components/[section]/[feature].tsx
6. Pages             → app/[section]/[feature]/page.tsx
```

### Tech Stack Reminder

- **Frontend:** React 18 + TypeScript
- **Backend:** Next.js API routes
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (session-based)
- **Storage:** Supabase Storage
- **AI:** Google Gemini API

---

## Feature: Export Budget to PDF

### Step 1: Create API Route

**File:** `app/api/export/route.ts`

```typescript
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch user's budget and debts
  const budget = await prisma.budget.findUnique({
    where: { userId: session.user.id, monthYear: "..." },
    include: { debts: true }
  });

  // Generate PDF (use a library like pdfkit or html2pdf)
  // Return PDF as response
}
```

### Step 2: Create Component

**File:** `components/dashboard/export-button.tsx`

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportButton() {
  const handleExport = async () => {
    const response = await fetch("/api/export", {
      method: "POST",
    });
    
    const blob = await response.blob();
    // Download file
  };

  return (
    <Button onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export to PDF
    </Button>
  );
}
```

### Step 3: Add to Page

Add the `ExportButton` to the dashboard layout or page.

---

## Feature: Debt Payoff Simulator

### Step 1: Create Simulation Utility

**File:** `lib/simulator.ts`

```typescript
export function simulatePayoffScenario(
  debts: DebtItem[],
  monthlyExtraPayment: number,
  strategy: "snowball" | "avalanche" | "balanced"
) {
  // Simulate paying off debts month by month
  // Return timeline and metrics
}
```

### Step 2: Create Component

**File:** `components/dashboard/payoff-simulator.tsx`

```typescript
"use client";

import { useState } from "react";
import { simulatePayoffScenario } from "@/lib/simulator";

export function PayoffSimulator({ debts }: { debts: DebtItem[] }) {
  const [extraPayment, setExtraPayment] = useState(0);
  const [scenario, setScenario] = useState<ScenarioResult | null>(null);

  const handleSimulate = () => {
    const result = simulatePayoffScenario(debts, extraPayment, "snowball");
    setScenario(result);
  };

  return (
    // UI for simulator
  );
}
```

### Step 3: Add to Analysis Page

```typescript
<PayoffSimulator debts={debts} />
```

---

## Feature: Budget Goals

### Step 1: Update Database Schema

**File:** `prisma/schema.prisma`

```prisma
model BudgetGoal {
  id        String   @id @default(cuid())
  budgetId  String
  budget    Budget   @relation(fields: [budgetId], references: [id])
  
  name      String
  targetAmount Decimal
  deadline  DateTime
  category  String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("budget_goals")
}

model Budget {
  // ... existing fields
  goals     BudgetGoal[]
}
```

### Step 2: Create API Route

**File:** `app/api/goals/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // Create goal
}

export async function GET(request: NextRequest) {
  // Get goals
}

export async function PUT(request: NextRequest) {
  // Update goal
}

export async function DELETE(request: NextRequest) {
  // Delete goal
}
```

### Step 3: Create Component & Page

**File:** `components/dashboard/goal-form.tsx` and `app/dashboard/goals/page.tsx`

### Step 4: Run Migration

```bash
npx prisma migrate dev --name add_budget_goals
```

---

## Feature: Spending Categories

### Step 1: Create Category Management Utility

**File:** `lib/categories.ts`

```typescript
export const SPENDING_CATEGORIES = [
  { id: "groceries", label: "Groceries", icon: "🛒" },
  { id: "utilities", label: "Utilities", icon: "⚡" },
  // ... more categories
];

export function createCustomCategory(name: string, color: string) {
  // Implementation
}
```

### Step 2: Add to Budget Model

```prisma
model BudgetCategory {
  id        String   @id @default(cuid())
  budgetId  String
  budget    Budget   @relation(fields: [budgetId], references: [id])
  
  name      String
  color     String
  icon      String?
  
  @@map("budget_categories")
}
```

### Step 3: Create Category Manager UI

**File:** `components/dashboard/category-manager.tsx`

---

## Feature: Spending Tracker

### Step 1: Update Schema

```prisma
model Expense {
  id          String   @id @default(cuid())
  budgetId    String
  budget      Budget   @relation(fields: [budgetId], references: [id])
  
  description String
  amount      Decimal
  category    String
  date        DateTime
  
  @@map("expenses")
}
```

### Step 2: Create API

**File:** `app/api/expenses/route.ts`

### Step 3: Create UI

**File:** `components/dashboard/expense-form.tsx` and `components/dashboard/expense-list.tsx`

---

## Feature: Budget Alerts/Notifications

### Step 1: Create Alert Utility

**File:** `lib/alerts.ts`

```typescript
export function checkBudgetAlerts(budget: Budget): Alert[] {
  const alerts: Alert[] = [];
  
  // Check if debt increased
  if (hasDebtIncreased(budget)) {
    alerts.push({
      type: "warning",
      message: "Your debt increased since last month"
    });
  }
  
  // Check if DTI ratio is worsening
  if (isDTIWorsening(budget)) {
    alerts.push({
      type: "error",
      message: "Your debt-to-income ratio is worsening"
    });
  }
  
  return alerts;
}
```

### Step 2: Create Alert Component

**File:** `components/dashboard/alerts.tsx`

### Step 3: Add to Dashboard

```typescript
const alerts = checkBudgetAlerts(budget);
<AlertBanner alerts={alerts} />
```

---

## Feature: Multi-Currency Support

### Step 1: Add Currency to Budget

```prisma
model Budget {
  // ... existing fields
  currency  String @default("USD")
}
```

### Step 2: Create Currency Utilities

**File:** `lib/currency.ts`

```typescript
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "CAD"];

export function formatCurrency(amount: number, currency: string) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  });
  return formatter.format(amount);
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string
) {
  // Fetch exchange rate and convert
}
```

### Step 3: Update Components to Use Currency

Replace hardcoded `$` with dynamic currency symbol.

---

## Feature: Recurring Expenses

### Step 1: Create Recurring Model

```prisma
model RecurringExpense {
  id          String   @id @default(cuid())
  budgetId    String
  budget      Budget   @relation(fields: [budgetId], references: [id])
  
  description String
  amount      Decimal
  frequency   String  // "monthly", "weekly", etc.
  startDate   DateTime
  endDate     DateTime?
  
  @@map("recurring_expenses")
}
```

### Step 2: Create Calculation

**File:** `lib/recurring.ts`

```typescript
export function calculateMonthlyRecurring(
  expenses: RecurringExpense[]
): number {
  return expenses.reduce((sum, exp) => {
    const monthlyAmount = exp.frequency === "weekly" ? exp.amount * 4.33 : exp.amount;
    return sum + monthlyAmount;
  }, 0);
}
```

---

## Feature: Dark Mode

### Step 1: Add Theme Provider

**File:** `app/layout.tsx`

```typescript
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout() {
  return (
    <html>
      <body>
        <ThemeProvider defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 2: Create Theme Switcher

**File:** `components/theme-switcher.tsx`

### Step 3: Update CSS

Tailwind already supports dark mode - just add `dark:` classes to components.

---

## Feature: Data Export/Import

### Step 1: Create Export Utility

**File:** `lib/export.ts`

```typescript
export function exportBudgetAsJSON(budget: Budget): string {
  return JSON.stringify(budget, null, 2);
}

export function exportBudgetAsCSV(debts: DebtItem[]): string {
  // Format as CSV
}
```

### Step 2: Create Import Utility

**File:** `lib/import.ts`

```typescript
export async function importBudgetFromJSON(
  json: string,
  userId: string
) {
  const data = JSON.parse(json);
  // Validate and import
}
```

### Step 3: Create UI

**File:** `components/dashboard/import-export.tsx`

---

## Testing New Features

### Unit Testing Example

**File:** `lib/__tests__/analytics.test.ts`

```typescript
import { calculateDebtToIncomeRatio } from "@/lib/analytics";

describe("Analytics", () => {
  it("calculates debt-to-income correctly", () => {
    const ratio = calculateDebtToIncomeRatio(30000, 5000);
    expect(ratio).toBe(6);
  });
});
```

### Integration Testing

Test with full API and database flow.

---

## Common Patterns

### Pattern 1: Protected API Route

```typescript
import { getServerSession } from "next-auth/next";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Your logic here
}
```

### Pattern 2: Data Fetching Hook

```typescript
export function useFeature() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feature")
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
```

### Pattern 3: Form Component

```typescript
export function FeatureForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/feature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } catch (err) {
      setError("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

---

## Deployment Considerations

When adding features:

1. **Database:** Always create migrations before deploying
2. **Environment Variables:** Add any new secrets to `.env.example`
3. **API Keys:** Store sensitive keys in environment variables
4. **Testing:** Test feature in production-like environment
5. **Performance:** Check for N+1 queries with Prisma
6. **Security:** Validate all inputs and verify authentication
7. **Documentation:** Update README if needed

---

## Performance Optimization

### Database Optimization

```typescript
// Bad - N+1 query
const budgets = await prisma.budget.findMany();
for (const budget of budgets) {
  const debts = await prisma.debtItem.findMany({
    where: { budgetId: budget.id }
  });
}

// Good - Include relations
const budgets = await prisma.budget.findMany({
  include: { debts: true }
});
```

### Component Optimization

```typescript
import { useMemo } from "react";

export function ExpensiveComponent({ data }) {
  // Memoize expensive calculations
  const calculated = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);

  return <div>{calculated}</div>;
}
```

### Query Optimization

```typescript
// Only select needed fields
const debts = await prisma.debtItem.findMany({
  select: { id: true, name: true, balance: true },
  where: { budgetId: budgetId }
});
```

---

## Troubleshooting Feature Development

### Issue: Prisma Schema Changes Don't Work
```bash
npx prisma migrate dev --name add_new_field
```

### Issue: API Route Not Found
- Check file is in `app/api/[path]/route.ts`
- Restart dev server

### Issue: Component Not Rendering
- Check component is imported correctly
- Verify props are passed
- Check browser console for errors

### Issue: Database Query Times Out
- Add indexes to frequently queried fields
- Use `.include()` for related data instead of multiple queries
- Limit result sets with `.take()`

---

## Git Workflow for Features

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes
git add .
git commit -m "Add feature: description"

# Push and create PR
git push origin feature/feature-name
```

---

## Resources

- Prisma Docs: https://prisma.io/docs
- Next.js Docs: https://nextjs.org/docs
- React Docs: https://react.dev
- Tailwind: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com

---

## Feature Checklist

Before considering a feature complete:

- [ ] Database schema updated (if needed)
- [ ] API routes created and tested
- [ ] Components created with proper styling
- [ ] Error handling implemented
- [ ] Loading states shown
- [ ] Form validation works
- [ ] Mobile responsive
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] Performance acceptable
- [ ] Tests written
- [ ] Code reviewed

---

**Happy developing! 🚀**
