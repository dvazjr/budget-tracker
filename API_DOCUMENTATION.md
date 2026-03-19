# Budget Tracker API Documentation

Complete reference for all API endpoints.

---

## Base URL

```
http://localhost:3000/api    (Development)
https://your-domain.com/api  (Production)
```

All endpoints require authentication unless otherwise noted.

---

## Authentication

### Sign Up

**Endpoint:** `POST /api/auth/signup`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "message": "User created successfully"
}
```

**Errors:**
- `400` - Email and password required
- `409` - User already exists
- `500` - Server error

---

### Sign In

**Endpoint:** `POST /api/auth/signin` (via NextAuth)

**Method:** Use NextAuth client-side:
```typescript
import { signIn } from "next-auth/react";

await signIn("credentials", {
  email: "user@example.com",
  password: "password",
  redirect: false
});
```

---

### Sign Out

**Endpoint:** Via NextAuth client-side:
```typescript
import { signOut } from "next-auth/react";

await signOut({ redirect: true });
```

---

## Budget Management

### Get Current Budget

**Endpoint:** `GET /api/budget`

**Authentication:** Required ✅

**Response (200):**
```json
{
  "id": "budget-uuid",
  "userId": "user-uuid",
  "monthYear": "2026-03",
  "mainIncome": 5000,
  "sideIncome": 500,
  "debts": [
    {
      "id": "debt-uuid",
      "name": "Chase Credit Card",
      "balance": 5000,
      "interestRate": 18.5,
      "type": "revolving"
    }
  ],
  "createdAt": "2026-03-01T00:00:00Z",
  "updatedAt": "2026-03-19T12:00:00Z"
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Budget not found
- `500` - Server error

---

### Update Budget (Income)

**Endpoint:** `POST /api/budget`

**Authentication:** Required ✅

**Body:**
```json
{
  "mainIncome": 5000,
  "sideIncome": 500,
  "monthYear": "2026-03"  // Optional, defaults to current month
}
```

**Response (200):**
```json
{
  "id": "budget-uuid",
  "userId": "user-uuid",
  "monthYear": "2026-03",
  "mainIncome": 5000,
  "sideIncome": 500,
  "debts": [],
  "createdAt": "2026-03-01T00:00:00Z",
  "updatedAt": "2026-03-19T14:30:00Z"
}
```

**Validation:**
- `mainIncome` - Required, must be ≥ 0
- `sideIncome` - Optional, must be ≥ 0

---

## Debt Management

### Get All Debts

**Endpoint:** `GET /api/debts`

**Authentication:** Required ✅

**Query Parameters:**
```
None (gets current month's debts)
```

**Response (200):**
```json
[
  {
    "id": "debt-uuid",
    "budgetId": "budget-uuid",
    "name": "Chase Sapphire Credit Card",
    "type": "revolving",
    "category": "credit_card",
    "balance": 5000,
    "creditLimit": 15000,
    "interestRate": 18.5,
    "minimumPayment": 150,
    "source": "manual",
    "createdAt": "2026-03-19T12:00:00Z",
    "updatedAt": "2026-03-19T12:00:00Z"
  },
  {
    "id": "debt-uuid-2",
    "budgetId": "budget-uuid",
    "name": "Toyota Camry Loan",
    "type": "loan",
    "category": "auto_loan",
    "balance": 15000,
    "interestRate": 4.5,
    "monthlyPayment": 350,
    "payoffDate": "2028-12-31",
    "term": 24,
    "source": "manual",
    "createdAt": "2026-03-19T13:00:00Z",
    "updatedAt": "2026-03-19T13:00:00Z"
  }
]
```

---

### Create Debt

**Endpoint:** `POST /api/debts`

**Authentication:** Required ✅

**Body:**
```json
{
  "name": "Chase Credit Card",
  "type": "revolving",
  "category": "credit_card",
  "balance": 5000,
  "creditLimit": 15000,
  "interestRate": 18.5,
  "minimumPayment": 150,
  "monthlyPayment": null,
  "payoffDate": null,
  "term": null,
  "source": "manual"
}
```

**Required Fields:**
- `name` - Debt name
- `type` - "revolving", "loan", or "utility"
- `category` - Debt category
- `balance` - Current balance (≥ 0)
- `interestRate` - Annual rate (0-100)

**Optional Fields:**
- `creditLimit` - For revolving debt
- `minimumPayment` - For revolving debt
- `monthlyPayment` - For loans/utilities
- `payoffDate` - Expected payoff date
- `term` - Months remaining

**Response (201):**
```json
{
  "id": "new-debt-uuid",
  "budgetId": "budget-uuid",
  "name": "Chase Credit Card",
  "type": "revolving",
  "category": "credit_card",
  "balance": 5000,
  "creditLimit": 15000,
  "interestRate": 18.5,
  "minimumPayment": 150,
  "source": "manual",
  "createdAt": "2026-03-19T15:00:00Z",
  "updatedAt": "2026-03-19T15:00:00Z"
}
```

**Errors:**
- `400` - Missing required fields
- `401` - Unauthorized
- `500` - Server error

---

### Update Debt

**Endpoint:** `PUT /api/debts`

**Authentication:** Required ✅

**Body:**
```json
{
  "id": "debt-uuid",
  "balance": 4500,
  "minimumPayment": 140,
  "interestRate": 18.5
}
```

Only include fields you want to update. `id` is required.

**Response (200):**
```json
{
  "id": "debt-uuid",
  "budgetId": "budget-uuid",
  "name": "Chase Credit Card",
  "balance": 4500,
  "minimumPayment": 140,
  "interestRate": 18.5,
  "updatedAt": "2026-03-19T16:00:00Z"
}
```

---

### Delete Debt

**Endpoint:** `DELETE /api/debts?id=debt-uuid`

**Authentication:** Required ✅

**Query Parameters:**
- `id` - Debt ID to delete (required)

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- `400` - No ID provided
- `401` - Unauthorized (not owner)
- `404` - Debt not found
- `500` - Server error

---

## File Upload & Analysis

### Upload Statement

**Endpoint:** `POST /api/upload`

**Authentication:** Required ✅

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` - PDF or image file (max 10MB)

**Supported Types:**
- `application/pdf`
- `image/jpeg`
- `image/png`
- `image/jpg`

**Response (200):**
```json
{
  "success": true,
  "file": {
    "id": "file-uuid",
    "budgetId": "budget-uuid",
    "fileName": "statement.pdf",
    "fileUrl": "path/to/file",
    "uploadedAt": "2026-03-19T17:00:00Z"
  },
  "message": "File uploaded. Ready for AI analysis."
}
```

**Errors:**
- `400` - No file provided, invalid type, file too large
- `401` - Unauthorized
- `500` - Upload failed

---

### Analyze Statement

**Endpoint:** `POST /api/analyze-pdf`

**Authentication:** Required ✅

**Body:**
```json
{
  "fileId": "file-uuid",
  "pdfText": "extracted text from PDF"  // For PDFs
}
```

For images, omit `pdfText`.

**Response (200):**
```json
{
  "success": true,
  "analysis": {
    "debts": [
      {
        "name": "Chase Sapphire",
        "type": "revolving",
        "category": "credit_card",
        "balance": 5000,
        "creditLimit": 15000,
        "interestRate": 18.5,
        "minimumPayment": 150,
        "confidence": 95
      }
    ],
    "rawText": "Summary of extracted text"
  },
  "createdDebts": [
    {
      "id": "debt-uuid",
      "name": "Chase Sapphire",
      "balance": 5000,
      "source": "pdf_upload"
    }
  ],
  "message": "Extracted 1 debt item from the statement."
}
```

**Confidence Score:**
- 0-60% - Low confidence (manual review recommended)
- 60-80% - Medium confidence
- 80-100% - High confidence

**Errors:**
- `400` - No file ID or PDF text
- `401` - Unauthorized
- `404` - File not found
- `500` - Analysis failed

---

## Financial Analysis

### Get AI Analysis

**Endpoint:** `GET /api/analysis`

**Authentication:** Required ✅

**Response (200):**
```json
{
  "summary": "Your financial situation shows...",
  "debtToIncome": "Your debt-to-income ratio of 3.5x indicates...",
  "strategies": [
    {
      "name": "Debt Snowball",
      "overview": "Pay smallest balance first...",
      "pros": [
        "Quick psychological wins",
        "Motivation to continue",
        "Simple to execute"
      ],
      "cons": [
        "May pay more interest",
        "Takes longer overall"
      ],
      "estimatedPayoffTime": "4 years"
    },
    {
      "name": "Debt Avalanche",
      "overview": "Pay highest interest first...",
      "pros": [
        "Saves the most money",
        "Fastest payoff",
        "Mathematically optimal"
      ],
      "cons": [
        "Fewer early wins",
        "Requires discipline"
      ],
      "estimatedPayoffTime": "3.5 years"
    },
    {
      "name": "Balanced Approach",
      "overview": "Hybrid strategy combining both methods...",
      "pros": [
        "Balanced wins and savings",
        "Flexible approach"
      ],
      "cons": [
        "More complex to track"
      ],
      "estimatedPayoffTime": "3.8 years"
    }
  ],
  "spendingInsights": [
    "Your credit card utilization is high at 33%...",
    "You have $450/month in obligations...",
    "High-interest debt should be prioritized..."
  ],
  "incomeIdeas": [
    "Freelancing in your current field could add $500-1000/month",
    "Teaching or tutoring: $200-400 per session",
    "Seasonal gig work aligned with your skills"
  ]
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Budget not found
- `500` - Analysis generation failed

---

## Change Tracking

### Get Budget Snapshots

**Endpoint:** `GET /api/snapshots?budgetId=budget-uuid&limit=10`

**Authentication:** Required ✅

**Query Parameters:**
- `budgetId` - Budget ID (required)
- `limit` - Max results (1-100, default 10)

**Response (200):**
```json
[
  {
    "id": "snapshot-uuid",
    "budgetId": "budget-uuid",
    "snapshotData": {
      "id": "budget-uuid",
      "mainIncome": 5000,
      "sideIncome": 500,
      "debts": [...]
    },
    "createdAt": "2026-03-19T16:00:00Z"
  },
  {
    "id": "snapshot-uuid-2",
    "budgetId": "budget-uuid",
    "snapshotData": {...},
    "createdAt": "2026-03-19T14:00:00Z"
  }
]
```

---

### Delete Snapshot

**Endpoint:** `DELETE /api/snapshots?id=snapshot-uuid`

**Authentication:** Required ✅

**Query Parameters:**
- `id` - Snapshot ID (required)

**Response (200):**
```json
{
  "success": true
}
```

---

## Rate Limits & Quotas

### Supabase
- Database: 500MB (free tier)
- File Storage: 1GB (free tier)

### Gemini API
- Requests: 15 per minute
- Tokens: 500,000 per month
- Free tier only

### Vercel
- Bandwidth: 100GB per month
- Functions: Unlimited (within reasonable limits)

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in) |
| 404 | Not Found (resource doesn't exist) |
| 409 | Conflict (duplicate, etc) |
| 500 | Server Error |

---

## Error Response Format

All errors return:
```json
{
  "error": "Human-readable error message"
}
```

---

## Examples

### Complete Flow

```bash
# 1. Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'

# 2. Sign in (done via NextAuth in UI)

# 3. Update income
curl -X POST http://localhost:3000/api/budget \
  -H "Authorization: Bearer session-token" \
  -d '{
    "mainIncome": 5000,
    "sideIncome": 500
  }'

# 4. Add debt
curl -X POST http://localhost:3000/api/debts \
  -d '{
    "name": "Credit Card",
    "type": "revolving",
    "category": "credit_card",
    "balance": 5000,
    "interestRate": 18.5
  }'

# 5. Get debts
curl http://localhost:3000/api/debts

# 6. Get analysis
curl http://localhost:3000/api/analysis
```

---

For more examples and integration help, see:
- [README.md](./README.md) - Setup guide
- [FEATURE_IMPLEMENTATION_GUIDE.md](./FEATURE_IMPLEMENTATION_GUIDE.md) - How to use in code
