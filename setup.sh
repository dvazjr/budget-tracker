#!/bin/bash

# Budget Tracker - Setup Helper Script
# This script automates the local setup process

set -e

echo "🚀 Budget Tracker - Local Setup Helper"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ first."
    echo "   Download from: https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo -e "${GREEN}✓ npm found: $(npm --version)${NC}"

# Check if .env.local exists
echo ""
echo -e "${BLUE}Checking environment setup...${NC}"
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠ .env.local not found${NC}"
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo -e "${YELLOW}✓ Created .env.local${NC}"
    echo ""
    echo -e "${YELLOW}⚠ IMPORTANT: Edit .env.local with your credentials:${NC}"
    echo "  1. NEXT_PUBLIC_SUPABASE_URL"
    echo "  2. NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  3. SUPABASE_SERVICE_ROLE_KEY"
    echo "  4. DATABASE_URL"
    echo "  5. NEXTAUTH_SECRET (generate: openssl rand -base64 32)"
    echo "  6. GEMINI_API_KEY"
    echo ""
    read -p "Press Enter after filling .env.local..."
else
    echo -e "${GREEN}✓ .env.local already exists${NC}"
fi

# Install dependencies
echo ""
echo -e "${BLUE}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Run Prisma migrations
echo ""
echo -e "${BLUE}Setting up database...${NC}"
npx prisma migrate dev --name init
echo -e "${GREEN}✓ Database migrations complete${NC}"

# Success message
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Make sure all environment variables are set in .env.local"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "For help, see README.md or GOOD_MORNING.md"
