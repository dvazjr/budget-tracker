/**
 * Application Constants
 * Centralized configuration values
 */

// Debt Types
export const DEBT_TYPES = {
  REVOLVING: "revolving",
  LOAN: "loan",
  UTILITY: "utility",
} as const;

export const DEBT_TYPE_LABELS = {
  revolving: "Revolving Debt",
  loan: "Loan",
  utility: "Utility",
} as const;

export const DEBT_TYPE_COLORS = {
  revolving: "#ef4444", // red
  loan: "#3b82f6", // blue
  utility: "#10b981", // green
} as const;

// Debt Categories
export const DEBT_CATEGORIES = {
  CREDIT_CARD: "credit_card",
  AUTO_LOAN: "auto_loan",
  PERSONAL_LOAN: "personal_loan",
  STUDENT_LOAN: "student_loan",
  MORTGAGE: "mortgage",
  MEDICAL: "medical",
  ELECTRIC: "electric",
  WATER: "water",
  GAS: "gas",
  INTERNET: "internet",
  PHONE: "phone",
  INSURANCE: "insurance",
  SUBSCRIPTION: "subscription",
  OTHER: "other",
} as const;

export const DEBT_CATEGORY_LABELS: Record<string, string> = {
  credit_card: "Credit Card",
  auto_loan: "Auto Loan",
  personal_loan: "Personal Loan",
  student_loan: "Student Loan",
  mortgage: "Mortgage",
  medical: "Medical Debt",
  electric: "Electric Bill",
  water: "Water Bill",
  gas: "Gas Bill",
  internet: "Internet",
  phone: "Phone Bill",
  insurance: "Insurance",
  subscription: "Subscription",
  other: "Other",
};

// File Upload Settings
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_TYPES: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
  ALLOWED_EXTENSIONS: [".pdf", ".jpg", ".jpeg", ".png"],
} as const;

// Financial Thresholds
export const FINANCIAL_THRESHOLDS = {
  DEBT_TO_INCOME_WARNING: 1.5,
  DEBT_TO_INCOME_CRITICAL: 3,
  OBLIGATIONS_TO_INCOME_WARNING: 0.4,
  OBLIGATIONS_TO_INCOME_CRITICAL: 0.5,
  HIGH_INTEREST_RATE: 15,
  HIGH_CREDIT_UTILIZATION: 70,
} as const;

// Payment Frequencies
export const PAYMENT_FREQUENCIES = {
  MONTHLY: "monthly",
  BIWEEKLY: "biweekly",
  WEEKLY: "weekly",
  ANNUAL: "annual",
} as const;

// API Configuration
export const API = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "",
  TIMEOUT: 30000,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  INPUT: "yyyy-MM-dd",
  FULL: "EEEE, MMMM dd, yyyy",
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  THEME: "budget-tracker-theme",
  PREFERENCES: "budget-tracker-preferences",
} as const;

// Routes
export const ROUTES = {
  HOME: "/",
  SIGNIN: "/auth/signin",
  SIGNUP: "/auth/signup",
  DASHBOARD: "/dashboard",
  DASHBOARD_OVERVIEW: "/dashboard/overview",
  DASHBOARD_DEBTS: "/dashboard/debts",
  DASHBOARD_ANALYSIS: "/dashboard/analysis",
} as const;

// Messages
export const MESSAGES = {
  LOADING: "Loading...",
  SAVING: "Saving...",
  ERROR_GENERIC: "An error occurred. Please try again.",
  ERROR_NETWORK: "Network error. Please check your connection.",
  SUCCESS_SAVED: "Saved successfully!",
  SUCCESS_DELETED: "Deleted successfully!",
  CONFIRM_DELETE: "Are you sure? This cannot be undone.",
} as const;

// Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  BUDGET_MIN: 0,
  DEBT_MIN: 0.01,
  INTEREST_MIN: 0,
  INTEREST_MAX: 100,
} as const;
