# Environment Variables Setup Guide

This guide walks you through getting all the values for your `.env.local` file.

---

## What You Need

You'll need to create accounts and get API keys from 3 services:

1. **Supabase** - Database & File Storage
2. **Google Gemini** - AI for statement analysis
3. **NextAuth** - Authentication (generated)

---

## Step 1: Supabase Setup

### Create Account

1. Go to https://supabase.com
2. Click **"Sign Up"**
3. Sign up with GitHub (recommended) or email
4. Create organization
5. Create new project

Wait for project to be ready (2-3 minutes).

### Get Database URL

1. In Supabase dashboard, click **Project Settings** (bottom left)
2. Click **Database** tab
3. Find **"Connection String"** section
4. Select **Prisma** from dropdown
5. Click **Copy**
6. This is your `DATABASE_URL`

Example:
```
postgresql://postgres.xxxxx:password@db.xxxxx.supabase.co:5432/postgres
```

### Get API Keys

1. Click **Settings** (bottom left)
2. Click **API** tab
3. Under **Project API Keys**, you'll see:

**NEXT_PUBLIC_SUPABASE_URL** (Project URL)
```
https://xxxxx.supabase.co
```

**NEXT_PUBLIC_SUPABASE_ANON_KEY** (Anon public key)
```
eyJhbGciOiJIUzI1NiIs...
```

**SUPABASE_SERVICE_ROLE_KEY** (Service role secret)
```
eyJhbGciOiJIUzI1NiIs...
```

### Create Storage Bucket

1. In Supabase dashboard, click **Storage** (left menu)
2. Click **Create New Bucket**
3. Name: `budget-tracker-uploads`
4. Set to **Private** (important!)
5. Click **Create**

---

## Step 2: Google Gemini API

### Create API Key

1. Go to https://ai.google.dev
2. Click **"Get API Key"**
3. Click **"Create API key in Google Cloud Console"**
4. If prompted, create new project named "Budget Tracker"
5. Wait for project creation
6. Copy the API key

This is your `GEMINI_API_KEY`

Example:
```
AIzaSyD-...your_key...
```

### Enable API

1. Make sure Generative Language API is enabled
2. Check quota and usage (free tier: 15 req/min, 500k tokens/month)

---

## Step 3: Generate NextAuth Secret

This is a random security token for your app.

### On Mac/Linux:
```bash
openssl rand -base64 32
```

Copy the output → `NEXTAUTH_SECRET`

### On Windows (PowerShell):
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Copy the output → `NEXTAUTH_SECRET`

Example:
```
abc123xyz789/QwErTyUiOpAsdfghjkl==
```

---

## Step 4: Fill Your .env.local

Create file `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Database
DATABASE_URL=postgresql://postgres.xxxxx:password@db.xxxxx.supabase.co:5432/postgres

# NextAuth
NEXTAUTH_SECRET=abc123xyz789/QwErTyUiOpAsdfghjkl==
NEXTAUTH_URL=http://localhost:3000

# Gemini API
GEMINI_API_KEY=AIzaSyD-...your_key...

# Storage
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=budget-tracker-uploads
```

---

## Verification

To verify everything is set up:

```bash
# Check if .env.local is valid
./verify.sh

# Or manually check
grep -v "^#" .env.local | grep -v "^$"
```

You should see all 8 variables with values (not placeholder text).

---

## For Vercel Deployment

When deploying to Vercel:

1. Go to Vercel project settings
2. Click **Environment Variables**
3. Add all 8 variables from your `.env.local`

**IMPORTANT:** Add both public and secret variables:
- Variables starting with `NEXT_PUBLIC_` are safe to be public
- Others should be marked as secret

---

## Troubleshooting

### "Cannot find DATABASE_URL"
- Check you copied the **Prisma** connection string
- Not the URI, not the JDBC string - specifically Prisma
- It should start with `postgresql://`

### "Invalid Supabase URL"
- Should start with `https://`
- Should end with `.supabase.co`
- Should not include any paths or trailing slashes

### "Gemini API returning error"
- Check key is correct
- Verify API is enabled in Google Cloud Console
- Check you haven't exceeded rate limits
- Try generating a new key

### "NextAuth not working"
- Secret must be at least 32 characters
- On Windows, use PowerShell (not CMD)
- Include all special characters (=, /, +)

### ".env.local won't load"
- File must be named exactly `.env.local` (not `.env`)
- Must be in project root directory
- Restart dev server after creating file

---

## Security Notes

⚠️ **IMPORTANT:**
- Never share your `.env.local` file
- Never commit it to Git (it's in `.gitignore`)
- The `SUPABASE_SERVICE_ROLE_KEY` is very sensitive - keep it private
- In production, use Vercel's environment variable management

---

## Using Helper Script

If you prefer, the setup script can help:

```bash
# Make executable
chmod +x setup.sh

# Run setup
./setup.sh
```

This will:
1. Check prerequisites
2. Create `.env.local` from template
3. Prompt you to fill in values
4. Install dependencies
5. Run database migrations

---

## Quick Reference

| Variable | Source | Format | Example |
|----------|--------|--------|---------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase → Settings → API | URL | https://xxxx.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase → Settings → API | Token | eyJ... |
| SUPABASE_SERVICE_ROLE_KEY | Supabase → Settings → API | Token | eyJ... |
| DATABASE_URL | Supabase → Settings → Database | PostgreSQL | postgresql://... |
| NEXTAUTH_SECRET | Generate locally | Base64 | abc123... |
| NEXTAUTH_URL | Your app | URL | http://localhost:3000 |
| GEMINI_API_KEY | Google Gemini | Token | AIza... |
| NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET | Created in Storage | String | budget-tracker-uploads |

---

## Next Steps

Once all variables are set:

1. Run `npm install`
2. Run `npx prisma migrate dev`
3. Run `npm run dev`
4. Open http://localhost:3000
5. Start using your app!

---

Need help? Check:
- [README.md](./README.md) - Full setup guide
- [GOOD_MORNING.md](./GOOD_MORNING.md) - Wake-up guide
- [TROUBLESHOOTING](./README.md#troubleshooting) - Common issues
