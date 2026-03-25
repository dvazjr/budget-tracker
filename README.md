# Personal Budget Tracker

A full-stack web application for tracking personal finances, analyzing debt, and getting AI-powered financial recommendations. Upload your statements, and let AI extract debt data and provide personalized payoff strategies.

## Features

✨ **Core Features:**
- 📊 **Smart Dashboard** - Visual overview of income, debt, and financial health
- 💳 **Debt Management** - Track revolving debt, loans, and utilities
- 📤 **PDF/Image Upload** - AI-powered extraction from bank and credit card statements
- 🤖 **AI Analysis** - Get personalized debt payoff strategies and financial insights
- 📈 **Change Tracking** - Monitor your financial progress over time
- 🔐 **Secure Authentication** - Email/password signup and login

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (via Supabase)
- **Storage:** Supabase Storage
- **AI/ML:** Google Gemini API
- **Authentication:** NextAuth.js
- **Deployment:** Vercel

## Getting Started

### Prerequisites

1. **Node.js** - Version 18+ (download from [nodejs.org](https://nodejs.org))
2. **Git** - For version control
3. **Supabase Account** - Free at [supabase.com](https://supabase.com)
4. **Google Gemini API Key** - Free at [ai.google.dev](https://ai.google.dev)
5. **Vercel Account** - (optional, for deployment)

### Step 1: Clone the Repository

```bash
git clone https://github.com/dvazjr/budget-tracker.git
cd budget-tracker
npm install
```

### Step 2: Setup Supabase

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Create a new project
3. Go to **Project Settings → Database**
4. Copy your:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Service Role Key (SUPABASE_SERVICE_ROLE_KEY)

5. Create a new storage bucket:
   - Go to **Storage → Buckets**
   - Create a bucket named: `budget-tracker-uploads`
   - Make it private (restrict access to authenticated users)

6. Run migrations to create database tables:
   ```bash
   npx prisma migrate dev --name init
   ```

### Step 3: Get Gemini API Key

1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Create a new API key (free tier available)
4. Copy the key

### Step 4: Setup Environment Variables

1. Create a `.env.local` file in the project root:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your credentials:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # Database (Supabase provides this)
   DATABASE_URL=postgresql://...your_connection_string_here

   # NextAuth
   NEXTAUTH_SECRET=generate_with: openssl rand -base64 32
   NEXTAUTH_URL=http://localhost:3000

   # Gemini API
   GEMINI_API_KEY=your_gemini_key_here

   # Storage
   NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=budget-tracker-uploads
   ```

3. Generate NEXTAUTH_SECRET:
   ```bash
   # On Mac/Linux:
   openssl rand -base64 32

   # On Windows (PowerShell):
   [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
   ```

### Step 5: Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Step 6: Create Your Account

1. Click "Create Account"
2. Sign up with your email and password (min 8 characters)
3. Start adding debts or uploading statements

## Usage Guide

### Adding Debts Manually

1. Go to **Debts tab**
2. Click "Add Debt Manually"
3. Fill in debt details (name, balance, interest rate, etc.)
4. Click "Add Debt"

### Uploading Statements

1. Go to **Debts tab**
2. Click "Upload Statements"
3. Select a PDF or image of your bank/credit card statement
4. AI will extract debt information automatically
5. Review extracted data and confirm

### Viewing Analysis

1. Go to **Analysis tab**
2. See your financial health summary
3. Review debt-to-income ratio
4. Explore three debt payoff strategies:
   - **Debt Snowball** - Pay smallest balance first (psychological wins)
   - **Debt Avalanche** - Pay highest interest first (save money)
   - **Balanced Approach** - Custom strategy based on your situation
5. Get spending insights and income growth ideas

### Dashboard Overview

1. **Overview Tab:**
   - Key metrics (income, total debt, debt-to-income ratio)
   - Debt breakdown by type (pie chart)
   - Income vs obligations comparison

2. **Debts Tab:**
   - Add debts manually or upload statements
   - View all debts in sortable table
   - Delete debts if needed

3. **Analysis Tab:**
   - AI-generated financial recommendations
   - Payoff strategy details
   - Spending insights
   - Income growth ideas

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables (same as `.env.local`)
5. Click "Deploy"

Your app will be live in seconds!

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Budget
- `GET /api/budget` - Get current month budget
- `POST /api/budget` - Update income

### Debts
- `GET /api/debts` - Get all debts
- `POST /api/debts` - Create new debt
- `PUT /api/debts` - Update debt
- `DELETE /api/debts?id=...` - Delete debt

### Files
- `POST /api/upload` - Upload statement file
- `POST /api/analyze-pdf` - Analyze statement with AI

### Analysis
- `GET /api/analysis` - Generate financial analysis

## Database Schema

### Users
- id, email, password (hashed), name, timestamps

### Budgets
- id, userId, monthYear, mainIncome, sideIncome, timestamps

### DebtItems
- id, budgetId, type, category, name, balance, interestRate, payments, terms, etc.

### UploadedFiles
- id, budgetId, fileName, fileUrl, timestamps

### BudgetSnapshots
- id, budgetId, snapshotData (full budget state), createdAt

## File Upload Limits

- Maximum file size: 10MB
- Supported formats: PDF, JPG, PNG
- All files encrypted in Supabase Storage

## Troubleshooting

### "Gemini API error"
- Check your API key is correct
- Verify you've enabled the Generative Language API in Google Cloud
- Check request limits (free tier has daily limits)

### "Database connection error"
- Verify DATABASE_URL is correct
- Check Supabase project is active
- Run: `npx prisma db push` to sync schema

### "File upload fails"
- Check file size (<10MB)
- Verify file format (PDF or image)
- Ensure storage bucket exists and is named `budget-tracker-uploads`

### "Storage bucket not found"
- Go to Supabase Storage
- Create new bucket named: `budget-tracker-uploads`
- Set it to private (auth users only)

## Security Notes

- ✅ Passwords hashed with bcryptjs
- ✅ Environment variables never committed to Git
- ✅ All API routes protected with NextAuth session
- ✅ Files stored securely in Supabase Storage
- ✅ No sensitive data in URLs or logs
- ✅ CSRF protection via NextAuth

## Development

### Project Structure

```
budget-tracker/
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Auth pages
│   ├── dashboard/        # Dashboard pages
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # shadcn/ui components
│   └── dashboard/        # Dashboard components
├── lib/
│   ├── prisma.ts         # Prisma client
│   ├── supabase.ts       # Supabase client
│   ├── gemini.ts         # Gemini AI integration
│   └── pdfParser.ts      # PDF text extraction
├── prisma/
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

### Running Tests

```bash
npm run test
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# View database in UI (use Supabase Dashboard instead - more reliable)
# Go to: https://supabase.com/dashboard > Your Project > Table Editor
```

## Future Enhancements

- 📱 Mobile app version
- 📊 More advanced analytics and forecasting
- 💰 Integration with bank APIs for automatic syncing
- 📧 Email reports and reminders
- 🌙 Dark mode support
- 🌍 Multi-currency support
- 🤝 Family/shared budgets

## Contributing

Feel free to fork, modify, and improve! Submit pull requests for new features or bug fixes.

## License

MIT License - feel free to use for personal or commercial projects

## Support

Have questions? Issues?
- Check the Troubleshooting section above
- Create an issue on GitHub
- Email: support@budgettracker.app (Coming soon)

---

**Built with ❤️ by Danny Vazquez**

Happy budgeting! 💰
