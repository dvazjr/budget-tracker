/**
 * Loan & Debt Calculation Utilities
 * Provides detailed financial calculations for different debt types
 */

/**
 * Calculate monthly payment for a loan
 * Using the standard loan payment formula
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (months === 0 || principal === 0) return 0;

  const monthlyRate = annualRate / 100 / 12;

  // If no interest, divide evenly
  if (monthlyRate === 0) {
    return principal / months;
  }

  // Standard loan payment formula
  return (
    (principal *
      (monthlyRate * Math.pow(1 + monthlyRate, months))) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

/**
 * Calculate remaining balance on a loan after X months of payments
 */
export function calculateRemainingBalance(
  originalPrincipal: number,
  annualRate: number,
  totalMonths: number,
  monthsPaid: number
): number {
  if (monthsPaid >= totalMonths) return 0;

  const monthlyPayment = calculateMonthlyPayment(
    originalPrincipal,
    annualRate,
    totalMonths
  );
  const monthlyRate = annualRate / 100 / 12;

  const remainingMonths = totalMonths - monthsPaid;

  if (monthlyRate === 0) {
    return originalPrincipal - monthlyPayment * monthsPaid;
  }

  return (
    (monthlyPayment * (Math.pow(1 + monthlyRate, remainingMonths) - 1)) /
    (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths))
  );
}

/**
 * Calculate total interest paid on a loan
 */
export function calculateTotalInterest(
  principal: number,
  annualRate: number,
  months: number
): number {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, months);
  const totalPaid = monthlyPayment * months;
  return totalPaid - principal;
}

/**
 * Calculate interest paid in a given month
 */
export function calculateMonthlyInterest(
  currentBalance: number,
  annualRate: number
): number {
  return (currentBalance * annualRate) / 100 / 12;
}

/**
 * Create an amortization schedule
 */
export function createAmortizationSchedule(
  principal: number,
  annualRate: number,
  months: number,
  limit: number = 12
): Array<{
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}> {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, months);
  const schedule = [];

  let balance = principal;

  for (let month = 1; month <= Math.min(months, limit); month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
    });
  }

  return schedule;
}

/**
 * Calculate how much extra monthly payment accelerates payoff
 */
export function calculatePayoffAcceleration(
  principal: number,
  annualRate: number,
  monthlyPayment: number,
  extraMonthlyPayment: number
): {
  standardMonths: number;
  acceleratedMonths: number;
  monthsSaved: number;
  interestSaved: number;
} {
  const monthlyRate = annualRate / 100 / 12;

  // Calculate months with standard payment
  let balance = principal;
  let standardMonths = 0;
  const maxIterations = 1200;

  while (balance > 0 && standardMonths < maxIterations) {
    const interest = balance * monthlyRate;
    balance = balance + interest - monthlyPayment;
    standardMonths++;
  }

  // Calculate months with extra payment
  balance = principal;
  let acceleratedMonths = 0;

  while (balance > 0 && acceleratedMonths < maxIterations) {
    const interest = balance * monthlyRate;
    balance = balance + interest - (monthlyPayment + extraMonthlyPayment);
    acceleratedMonths++;
  }

  const monthsSaved = standardMonths - acceleratedMonths;
  const standardInterest = calculateTotalInterest(principal, annualRate, standardMonths);
  const acceleratedInterest = calculateTotalInterest(
    principal,
    annualRate,
    acceleratedMonths
  );
  const interestSaved = standardInterest - acceleratedInterest;

  return {
    standardMonths,
    acceleratedMonths,
    monthsSaved,
    interestSaved: Math.max(0, interestSaved),
  };
}

/**
 * Compare two payoff strategies (e.g., snowball vs avalanche)
 */
export function comparePayoffStrategies(
  debts: Array<{ name: string; balance: number; rate: number }>,
  monthlyPayment: number
): {
  strategy: string;
  totalMonths: number;
  totalInterest: number;
  payoffOrder: string[];
}[] {
  // This is a simplified comparison
  // Real implementation would simulate both strategies over time

  const debtsWithMetrics = debts.map((d) => ({
    ...d,
    totalInterest: calculateTotalInterest(d.balance, d.rate, 60), // 5-year estimate
  }));

  return [
    {
      strategy: "Snowball (Smallest Balance First)",
      totalMonths: 0, // Would calculate
      totalInterest: 0,
      payoffOrder: debts
        .sort((a, b) => a.balance - b.balance)
        .map((d) => d.name),
    },
    {
      strategy: "Avalanche (Highest Interest First)",
      totalMonths: 0,
      totalInterest: 0,
      payoffOrder: debts
        .sort((a, b) => b.rate - a.rate)
        .map((d) => d.name),
    },
  ];
}
