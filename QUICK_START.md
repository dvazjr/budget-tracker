# 🚀 Budget Tracker - Quick Start Card

## **What You Have**
Complete, production-ready budget tracking app with AI-powered debt analysis.

---

## **3 Essential Setup Steps**

### **STEP 1: Create Accounts** (10 min)
```
1. Supabase → supabase.com → Sign up
   - Create new project
   - Copy Project URL & Keys
   - Create storage bucket: "budget-tracker-uploads"

2. Google Gemini → ai.google.dev → Get API Key
   - Click "Get API Key"
   - Create new API key (free tier)
```

### **STEP 2: Setup Locally** (5 min)
```bash
# Clone repo
git clone https://github.com/dvazjr/budget-tracker.git
cd budget-tracker

# Install
npm install

# Create .env.local (copy .env.example)
# Fill in:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - DATABASE_URL (from Supabase)
# - NEXTAUTH_SECRET (generate: openssl rand -base64 32)
# - GEMINI_API_KEY

# Run migrations
npx prisma migrate dev --name init

# Start dev server
npm run dev
```

### **STEP 3: Deploy** (5 min)
```bash
# Push to GitHub
git push origin main

# Go to vercel.com
# → New Project → Import GitHub repo
# → Add environment variables
# → Deploy!
```

---

## **Key Features**

| Feature | Status |
|---------|--------|
| 👤 Auth (signup/login) | ✅ Complete |
| 💰 Income tracking | ✅ Complete |
| 💳 Debt management | ✅ Complete |
| 📄 PDF/image upload | ✅ Complete |
| 🤖 AI analysis | ✅ Complete |
| 📊 Visualizations | ✅ Complete |
| 💾 Data persistence | ✅ Complete |
| 🔐 Security | ✅ Complete |

---

## **File Structure**

```
app/          → Pages & API routes
components/   → React components
lib/          → Utilities & integrations
prisma/       → Database schema
types/        → TypeScript definitions
public/       → Static files
```

---

## **Important Files**

| File | Purpose |
|------|---------|
| `.env.example` | Copy to `.env.local` and fill values |
| `prisma/schema.prisma` | Database structure |
| `README.md` | Full setup guide |
| `PROJECT_SUMMARY.md` | Detailed overview |

---

## **Default Routes**

```
/                 → Landing page
/auth/signin      → Sign in
/auth/signup      → Sign up
/dashboard/...    → Protected pages
```

---

## **Environment Variables Needed**

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=budget-tracker-uploads
```

---

## **API Endpoints**

**Auth:**
- `POST /api/auth/signup` - Register
- `POST /api/auth/signin` - Login

**Budget:**
- `GET /api/budget` - Get income
- `POST /api/budget` - Update income

**Debts:**
- `GET /api/debts` - Get all debts
- `POST /api/debts` - Add debt
- `PUT /api/debts` - Update debt
- `DELETE /api/debts?id=X` - Delete debt

**Analysis:**
- `POST /api/upload` - Upload file
- `POST /api/analyze-pdf` - Analyze statement
- `GET /api/analysis` - Get recommendations

---

## **Commands**

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint

# Database
npx prisma migrate dev   # Create migration
npx prisma studio       # Open database UI
npx prisma reset        # Reset database (careful!)
```

---

## **Testing Locally**

1. Sign up with test email
2. Add main income: $5000
3. Add test debt: Credit card $2000 @ 18%
4. OR upload a statement PDF
5. Go to Analysis → see recommendations
6. Try all tabs: Overview, Debts, Analysis

---

## **Troubleshooting Quick Fixes**

**"Database connection error"**
- Check DATABASE_URL is correct
- Verify Supabase project is active

**"Gemini API error"**
- Check API key is correct
- Verify API is enabled in Google Cloud

**"File upload fails"**
- Check file size < 10MB
- Verify storage bucket exists & is named correctly

**"Migrations fail"**
- Run: `npx prisma migrate reset` (caution: deletes data)
- Then: `npx prisma migrate dev --name init`

---

## **Deployment Checklist**

- [ ] All env vars set in Supabase
- [ ] All env vars set in Vercel
- [ ] Database migrations run
- [ ] Storage bucket created
- [ ] Gemini API key working
- [ ] GitHub repo created & synced
- [ ] Vercel project created
- [ ] Production URL working

---

## **Free Tier Limits** 💰

- **Supabase**: 500MB DB, 1GB storage
- **Gemini API**: 15 req/min, 500k tokens/month
- **Vercel**: 100GB bandwidth/month
- **Total Cost**: $0 (unless you exceed limits)

---

## **Support Links**

- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs
- Gemini: https://ai.google.dev/docs
- Prisma: https://prisma.io/docs

---

## **What's Next?**

After launch:
1. Get feedback from users
2. Add more customization
3. Implement mobile app
4. Add goal tracking
5. Build community features

---

**Made with ❤️ for your financial journey**

Happy budgeting! 💰📊
