#!/usr/bin/env bash

# Production build and deployment script

set -e

echo "🚀 Building Mutual Fund Insight Engine..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Frontend build
echo -e "${YELLOW}Building frontend...${NC}"
cd frontend
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"

# Backend build
echo -e "${YELLOW}Building backend...${NC}"
cd ../backend
npm run build
echo -e "${GREEN}✓ Backend built${NC}"

cd ..

echo -e "${GREEN}✨ Build complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Set environment variables in your deployment platform"
echo "2. Run migrations: npm run prisma:migrate"
echo "3. Deploy frontend and backend applications"
echo "4. Point domain to your deployment"
echo ""
echo -e "${GREEN}Happy deploying!${NC}"
