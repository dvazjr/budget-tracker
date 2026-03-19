/**
 * Financial Analytics Utilities
 * Provides calculations for debt analysis and financial metrics
 */

export interface DebtItem {
  id: string;
  name: string;
  type: "revolving" | "loan" | "utility";
  category: string;
  balance: number;
  creditLimit?: number;
  interestRate: number;
  minimumPayment?: number;
  monthlyPayment?: number;
  payoffDate?: string;
  term?: number;
}

/**
 * Calculate total debt across all items
 */
export function calculateTotalDebt(debts: DebtItem[]): number {
  return debts.reduce((sum, debt) => sum + debt.balance, 0);
}

/**
 * Calculate monthly obligations (minimum/fixed payments)
 */
export function calculateMonthlyObligations(debts: DebtItem[]): number {
  return debts.reduce(
    (sum, debt) => sum + (debt.monthlyPayment || debt.minimumPayment || 0),
    0
  );
}

/**
 * Calculate debt-to-income ratio
 */
export function calculateDebtToIncomeRatio(
  totalDebt: number,
  monthlyIncome: number
): number {
  if (monthlyIncome === 0) return 0;
  return parseFloat((totalDebt / monthlyIncome).toFixed(2));
}

/**
 * Break down debt by type
 */
export function debtBreakdownByType(debts: DebtItem[]): {
  revolving: number;
  loan: number;
  utility: number;
} {
  return {
    revolving: debts
      .filter((d) => d.type === "revolving")
      .reduce((sum, d) => sum + d.balance, 0),
    loan: debts
      .filter((d) => d.type === "loan")
      .reduce((sum, d) => sum + d.balance, 0),
    utility: debts
      .filter((d) => d.type === "utility")
      .reduce((sum, d) => sum + d.balance, 0),
  };
}

/**
 * Calculate total interest paid over time (simplified)
 * Assumes payments are made on schedule
 */
export function estimateTotalInterestPaid(debt: DebtItem): number {
  const monthlyRate = debt.interestRate / 100 / 12;
  const monthlyPayment = debt.monthlyPayment || debt.minimumPayment || 0;

  if (!monthlyPayment || monthlyPayment === 0) return 0;

  let balance = debt.balance;
  let totalInterest = 0;
  let months = 0;
  const maxMonths = 600; // 50 year safety limit

  while (balance > 0 && months < maxMonths) {
    const interest = balance * monthlyRate;
    totalInterest += interest;
    balance = balance + interest - monthlyPayment;
    months++;
  }

  return Math.max(0, totalInterest);
}

/**
 * Get debts sorted by balance (snowball method)
 */
export function sortBySnowball(debts: DebtItem[]): DebtItem[] {
  return [...debts].sort((a, b) => a.balance - b.balance);
}

/**
 * Get debts sorted by interest rate (avalanche method)
 */
export function sortByAvalanche(debts: DebtItem[]): DebtItem[] {
  return [...debts].sort((a, b) => b.interestRate - a.interestRate);
}

/**
 * Calculate interest paid this month for a debt
 */
export function monthlyInterestCharge(debt: DebtItem): number {
  return (debt.balance * debt.interestRate) / 100 / 12;
}

/**
 * Get high-interest debts (above 15%)
 */
export function getHighInterestDebts(debts: DebtItem[]): DebtItem[] {
  return debts.filter((d) => d.interestRate > 15);
}

/**
 * Calculate credit utilization ratio
 */
export function calculateCreditUtilization(debts: DebtItem[]): number {
  const revolvingDebts = debts.filter((d) => d.type === "revolving");

  const totalBalance = revolvingDebts.reduce((sum, d) => sum + d.balance, 0);
  const totalLimit = revolvingDebts.reduce(
    (sum, d) => sum + (d.creditLimit || 0),
    0
  );

  if (totalLimit === 0) return 0;
  return parseFloat(((totalBalance / totalLimit) * 100).toFixed(2));
}

/**
 * Get spending insights based on debt patterns
 */
export function getSpendingInsights(
  debts: DebtItem[],
  monthlyIncome: number
): string[] {
  const insights: string[] = [];
  const totalDebt = calculateTotalDebt(debts);
  const monthlyObligations = calculateMonthlyObligations(debts);
  const debtToIncome = calculateDebtToIncomeRatio(totalDebt, monthlyIncome);
  const highInterestDebts = getHighInterestDebts(debts);
  const creditUtil = calculateCreditUtilization(debts);

  // Insight 1: Debt-to-income ratio
  if (debtToIncome > 3) {
    insights.push(
      "Your debt is more than 3x your monthly income. Focus on either increasing income or aggressively paying down debt."
    );
  } else if (debtToIncome > 1.5) {
    insights.push(
      "Your debt-to-income ratio suggests you're carrying a significant debt burden. Consider allocating extra funds to debt payoff."
    );
  }

  // Insight 2: Monthly obligations vs income
  if (monthlyObligations / monthlyIncome > 0.5) {
    insights.push(
      "More than 50% of your monthly income goes to debt payments. Look for ways to reduce expenses or increase income."
    );
  }

  // Insight 3: High-interest debt
  if (highInterestDebts.length > 0) {
    insights.push(
      `You have ${highInterestDebts.length} high-interest debt(s) costing you significant money. Prioritizing these can save thousands in interest.`
    );
  }

  // Insight 4: Credit utilization
  if (creditUtil > 70) {
    insights.push(
      "Your credit card utilization is high (>70%). Paying down credit cards will improve your credit score and save on interest."
    );
  }

  // Insight 5: Positive note
  if (insights.length === 0) {
    insights.push(
      "Your debt metrics look reasonable. Stay consistent with payments and you'll be debt-free soon!"
    );
  }

  return insights;
}

/**
 * Estimate payoff timeline (simplified)
 */
export function estimatePayoffMonths(debt: DebtItem): number {
  const monthlyRate = debt.interestRate / 100 / 12;
  const monthlyPayment = debt.monthlyPayment || debt.minimumPayment || 0;

  if (!monthlyPayment || monthlyPayment === 0) return 0;

  let balance = debt.balance;
  let months = 0;
  const maxMonths = 600;

  while (balance > 0 && months < maxMonths) {
    const interest = balance * monthlyRate;
    balance = balance + interest - monthlyPayment;
    months++;
  }

  return months;
}

/**
 * Format months into readable format
 */
export function formatPayoffTime(months: number): string {
  if (months === 0) return "Unknown";
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} months`;
  } else if (remainingMonths === 0) {
    return `${years} ${years === 1 ? "year" : "years"}`;
  } else {
    return `${years} ${years === 1 ? "year" : "years"}, ${remainingMonths} months`;
  }
}
