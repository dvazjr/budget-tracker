#!/bin/bash

# Budget Tracker - Setup Verification Script
# Checks if everything is properly configured

echo "🔍 Budget Tracker - Setup Verification"
echo "========================================"
echo ""

ERRORS=0
WARNINGS=0

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not found"
    ((ERRORS++))
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm not found"
    ((ERRORS++))
fi

# Check .env.local
echo ""
if [ -f .env.local ]; then
    echo "✅ .env.local exists"
    
    # Check for required variables
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "DATABASE_URL"
        "NEXTAUTH_SECRET"
        "GEMINI_API_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env.local; then
            value=$(grep "^$var=" .env.local | cut -d'=' -f2)
            if [ -z "$value" ] || [ "$value" = "your_*_here" ]; then
                echo "⚠️  $var is not set"
                ((WARNINGS++))
            else
                echo "✅ $var is set"
            fi
        else
            echo "⚠️  $var is missing"
            ((WARNINGS++))
        fi
    done
else
    echo "❌ .env.local not found"
    echo "   Run: cp .env.example .env.local"
    ((ERRORS++))
fi

# Check node_modules
echo ""
if [ -d node_modules ]; then
    echo "✅ node_modules exists"
else
    echo "⚠️  node_modules not found"
    echo "   Run: npm install"
    ((WARNINGS++))
fi

# Check Prisma
echo ""
if command -v npx &> /dev/null; then
    echo "✅ npm/npx available"
    
    if npx prisma --version &> /dev/null; then
        echo "✅ Prisma: $(npx prisma --version 2>/dev/null)"
    else
        echo "⚠️  Prisma not set up yet"
        echo "   Run: npx prisma migrate dev"
        ((WARNINGS++))
    fi
else
    echo "⚠️  npx not available"
    ((WARNINGS++))
fi

# Summary
echo ""
echo "========================================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ Everything looks good!"
    echo ""
    echo "You can now run: npm run dev"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Some warnings (see above)"
    echo ""
    echo "You can try running, but fix warnings first"
    exit 0
else
    echo "❌ Setup errors found (see above)"
    echo ""
    echo "Fix errors before running the app"
    exit 1
fi
