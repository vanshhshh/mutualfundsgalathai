#!/bin/bash

# Setup script for Mutual Fund Insight Engine

echo "🎯 Setting up Mutual Fund Insight Engine..."
echo ""

# Backend setup
echo "📦 Backend setup..."
cd backend
cp .env.example .env
echo "✅ Backend .env created"

npm install
echo "✅ Backend dependencies installed"

npm run prisma:generate
echo "✅ Prisma client generated"

cd ..

# Frontend setup
echo ""
echo "📦 Frontend setup..."
cd frontend
cp .env.local.example .env.local
echo "✅ Frontend .env.local created"

npm install
echo "✅ Frontend dependencies installed"

cd ..

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update backend/.env with your PostgreSQL URL and OpenAI API key"
echo "2. Run the backend: cd backend && npm run dev"
echo "3. In another terminal, run the frontend: cd frontend && npm run dev"
echo "4. Open http://localhost:3001 in your browser"
echo ""
echo "🚀 Happy coding!"
