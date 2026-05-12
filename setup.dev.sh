#!/usr/bin/env bash

# Development setup script for Windows (PowerShell version)

echo "🎯 Setting up development environment..."
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install it from https://nodejs.org/"
    exit 1
fi

if ! command_exists git; then
    echo "❌ Git is not installed. Please install it from https://git-scm.com/"
    exit 1
fi

echo "✅ All prerequisites met"
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd backend

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Backend .env.example copied to .env (edit with your credentials)"
else
    echo "✅ Backend .env already exists"
fi

npm install
echo "✅ Backend dependencies installed"

npm run prisma:generate
echo "✅ Prisma client generated"

cd ..

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
cd frontend

if [ ! -f .env.local ]; then
    cp .env.local.example .env.local
    echo "✅ Frontend .env.local.example copied to .env.local"
else
    echo "✅ Frontend .env.local already exists"
fi

npm install
echo "✅ Frontend dependencies installed"

cd ..

# Create directories
mkdir -p logs

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Important Notes:"
echo "1. Update backend/.env with your PostgreSQL connection string:"
echo "   DATABASE_URL=postgresql://user:password@localhost:5432/mutual_funds"
echo ""
echo "2. Update backend/.env with OpenAI API key:"
echo "   OPENAI_API_KEY=sk-..."
echo ""
echo "3. Create PostgreSQL database (if using local)"
echo ""
echo "🚀 To start development:"
echo ""
echo "   Terminal 1 - Backend:"
echo "   cd backend && npm run dev"
echo ""
echo "   Terminal 2 - Frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "📍 Open http://localhost:3001 in your browser"
echo ""
echo "Happy coding! 🎉"
