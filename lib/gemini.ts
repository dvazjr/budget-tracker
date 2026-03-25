const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

interface DebtExtractionResult {
  debts: Array<{
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
    confidence: number;
  }>;
  rawText: string;
}

interface AnalysisResult {
  summary: string;
  debtToIncome: string;
  strategies: Array<{
    name: string;
    overview: string;
    pros: string[];
    cons: string[];
    estimatedPayoffTime: string;
  }>;
  spendingInsights: string[];
  incomeIdeas: string[];
}

export async function analyzeDebtStatement(
  pdfText: string
): Promise<DebtExtractionResult> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const prompt = `You are a financial document analyzer. Extract ALL debt information from the following statement text.

For each debt item found, provide:
- name: The name/description of the debt
- type: One of "revolving" (credit cards), "loan" (auto/personal/student loans), or "utility" (recurring services)
- category: More specific category (credit_card, auto_loan, personal_loan, electric, internet, etc.)
- balance: Current balance owed (numeric, no currency symbols)
- creditLimit: (only for credit cards) Credit limit if available
- interestRate: Annual interest rate as a number (e.g., 18.5 for 18.5%)
- minimumPayment: (for revolving debt) Minimum monthly payment
- monthlyPayment: (for loans/utilities) Fixed monthly payment
- payoffDate: (for loans) Expected payoff date in YYYY-MM-DD format if available
- term: (for loans) Months remaining if available
- confidence: Your confidence level (0-100) that this extraction is accurate

Return ONLY valid JSON in this format:
{
  "debts": [
    {
      "name": "Chase Sapphire Credit Card",
      "type": "revolving",
      "category": "credit_card",
      "balance": 5000,
      "creditLimit": 15000,
      "interestRate": 18.5,
      "minimumPayment": 150,
      "confidence": 95
    }
  ],
  "rawText": "summary of what was found"
}

STATEMENT TEXT:
${pdfText}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error("No response from Gemini API");
    }

    // Parse JSON from response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from response");
    }

    const result = JSON.parse(jsonMatch[0]) as DebtExtractionResult;
    return result;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw error;
  }
}

export async function generateFinancialAnalysis(budgetData: {
  mainIncome: number;
  sideIncome: number;
  debts: any[];
}): Promise<AnalysisResult> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const totalIncome = budgetData.mainIncome + budgetData.sideIncome;
  const totalDebt = budgetData.debts.reduce((sum, d) => sum + d.balance, 0);
  const debtToIncome = totalIncome > 0 ? totalDebt / totalIncome : 0;

  const debtBreakdown = budgetData.debts.map((d) => ({
    name: d.name,
    balance: d.balance,
    type: d.type,
    rate: d.interestRate,
    payment: d.monthlyPayment || d.minimumPayment || 0,
  }));

  const prompt = `You are a helpful financial advisor. Based on this budget data, provide personalized, encouraging advice.

BUDGET DATA:
- Monthly Income: $${totalIncome.toFixed(2)}
  - Main Income: $${budgetData.mainIncome.toFixed(2)}
  - Side Income: $${budgetData.sideIncome.toFixed(2)}
- Total Debt: $${totalDebt.toFixed(2)}
- Debt-to-Income Ratio: ${debtToIncome.toFixed(2)}x

DEBT DETAILS:
${debtBreakdown
  .map(
    (d) =>
      `- ${d.name} (${d.type}): $${d.balance.toFixed(2)} @ ${d.rate}% APR, Monthly Payment: $${d.payment.toFixed(2)}`
  )
  .join("\n")}

Please provide:
1. A brief, encouraging summary of their financial situation (2-3 sentences, be friendly and honest)
2. Analysis of their debt-to-income ratio and what it means
3. Three specific debt payoff strategies (Snowball, Avalanche, and one other relevant strategy) with pros/cons for their situation
4. 3-5 specific spending insights inferred from their debt patterns
5. 3-5 income growth ideas tailored to their situation (if income is low)

Return ONLY valid JSON in this format:
{
  "summary": "...",
  "debtToIncome": "...",
  "strategies": [
    {
      "name": "Debt Snowball",
      "overview": "...",
      "pros": ["...", "..."],
      "cons": ["...", "..."],
      "estimatedPayoffTime": "X years"
    }
  ],
  "spendingInsights": ["...", "..."],
  "incomeIdeas": ["...", "..."]
}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error("No response from Gemini API");
    }

    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from response");
    }

    const result = JSON.parse(jsonMatch[0]) as AnalysisResult;
    return result;
  } catch (error) {
    console.error("Financial analysis error:", error);
    throw error;
  }
}
