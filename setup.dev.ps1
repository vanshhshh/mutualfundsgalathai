# Development setup script for Windows (PowerShell)

Write-Host "🎯 Setting up development environment..." -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    $LASTEXITCODE -eq 0
}

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

if (!(Test-CommandExists node)) {
    Write-Host "❌ Node.js is not installed. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

if (!(Test-CommandExists git)) {
    Write-Host "❌ Git is not installed. Please install from https://git-scm.com/" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All prerequisites met" -ForegroundColor Green
Write-Host ""

# Backend setup
Write-Host "📦 Setting up backend..." -ForegroundColor Yellow
Set-Location backend

if (!(Test-Path .env)) {
    Copy-Item .env.example -Destination .env
    Write-Host "✅ Backend .env created (edit with your credentials)" -ForegroundColor Green
} else {
    Write-Host "✅ Backend .env already exists" -ForegroundColor Green
}

npm install
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

npm run prisma:generate
Write-Host "✅ Prisma client generated" -ForegroundColor Green

Set-Location ..

# Frontend setup
Write-Host ""
Write-Host "📦 Setting up frontend..." -ForegroundColor Yellow
Set-Location frontend

if (!(Test-Path .env.local)) {
    Copy-Item .env.local.example -Destination .env.local
    Write-Host "✅ Frontend .env.local created" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend .env.local already exists" -ForegroundColor Green
}

npm install
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green

Set-Location ..

# Create log directory
if (!(Test-Path logs)) {
    New-Item -ItemType Directory -Name logs | Out-Null
}

Write-Host ""
Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Important Notes:" -ForegroundColor Cyan
Write-Host "1. Update backend\.env with your PostgreSQL connection:"
Write-Host "   DATABASE_URL=postgresql://user:password@localhost:5432/mutual_funds" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update backend\.env with OpenAI API key:" -ForegroundColor Cyan
Write-Host "   OPENAI_API_KEY=sk-..." -ForegroundColor Gray
Write-Host ""
Write-Host "3. Create PostgreSQL database (if using local)" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 To start development:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   PowerShell 1 - Backend:" -ForegroundColor Gray
Write-Host "   cd backend; npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   PowerShell 2 - Frontend:" -ForegroundColor Gray
Write-Host "   cd frontend; npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "📍 Open http://localhost:3001 in your browser" -ForegroundColor Yellow
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Green
