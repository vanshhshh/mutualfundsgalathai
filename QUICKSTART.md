# 🚀 Quick Start Guide

Get the Mutual Fund Insight Engine running in 5 minutes!

## Prerequisites

- **Node.js** 18+ - [Download](https://nodejs.org/)
- **PostgreSQL** 14+ - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)
- **Groq API Key** - [Get one](https://console.groq.com/keys)

## 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/mutualfundsgalathai.git
cd mutualfundsgalathai
```

## 2️⃣ Run Setup Script

### macOS/Linux
```bash
chmod +x setup.dev.sh
./setup.dev.sh
```

### Windows (PowerShell)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup.dev.ps1
```

## 3️⃣ Configure Environment

### Backend - `backend/.env`
```env
DATABASE_URL=postgresql://user:password@localhost:5432/mutual_funds
GROQ_API_KEY=gsk-your-api-key-here
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001
```

### Frontend - `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 4️⃣ Setup Database

```bash
# Using Docker (recommended)
docker run --name postgres-mutual-funds \
  -e POSTGRES_USER=mutual_funds \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=mutual_funds \
  -p 5432:5432 \
  -d postgres:15-alpine
```

Or use your existing PostgreSQL instance and update `DATABASE_URL`.

## 5️⃣ Start Development Servers

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

**Expected output:**
```
🚀 Server running on http://localhost:3000
📊 Environment: development
🗄️ Database: PostgreSQL
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

**Expected output:**
```
- Local:        http://localhost:3001
```

## 6️⃣ Open in Browser

🎉 **Visit**: http://localhost:3001

You should see:
- Centered search bar
- "Search any mutual fund"
- Feature highlights

## 🧪 Try It Out

### 1. Search for a Fund
- Type "Axis" in the search bar
- Click on "Axis Bluechip Fund"

### 2. View Fund Details
You should see:
- ✅ Summary card with AI verdict
- ✅ Key metrics (expense ratio, returns, etc.)
- ✅ Hidden risks section
- ✅ AI-powered insights
- ✅ Portfolio breakdown
- ✅ Performance chart

### 3. Compare Funds
- (Coming soon in UI, API ready)

## 📊 Database Setup

### Run Migrations
```bash
cd backend
npm run prisma:migrate
```

### Seed Sample Data
```bash
npm run seed
```

This will create 5 sample mutual funds with realistic data.

### View Database
```bash
npm run prisma:studio
```

Opens Prisma Studio at http://localhost:5555

## 🔍 Verify Everything Works

### Check Backend Health
```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 45.123
}
```

### Check Frontend
```bash
curl http://localhost:3001
```

### Search Funds API
```bash
curl "http://localhost:3000/api/funds/search?q=Axis&limit=5"
```

## 🛠️ Common Issues

### PostgreSQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database name exists

### Groq API Error
```
401 Unauthorized
```

**Solution:**
- Verify Groq API key is correct
- Check key has sufficient credits
- Regenerate key if needed

### Port Already in Use
```
Error: listen EADDRINUSE :::3000
```

**Solution:**
```bash
# Kill process on port 3000
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module not found
```
Cannot find module '@prisma/client'
```

**Solution:**
```bash
cd backend
npm install
npm run prisma:generate
```

## 📚 Next Steps

### Read Documentation
- [Architecture Guide](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)

### Explore Code
- Frontend: `frontend/src/app`
- Backend: `backend/src`
- Database: `backend/prisma/schema.prisma`

### Make Your First Change

1. Edit `frontend/src/app/page.tsx`
2. Change heading text
3. See changes reflected instantly (Hot Reload)

### Deploy to Production

```bash
# Build
npm run build

# Deploy using Docker or Vercel/Heroku
# See DEPLOYMENT.md for details
```

## 🆘 Need Help?

### Check Logs
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs
npm run dev -- --debug
```

### Common Errors

| Error | Solution |
|-------|----------|
| `ENOENT: no such file` | Run `setup.dev.sh` or `setup.dev.ps1` |
| `TypeError: Cannot read property 'query'` | Ensure backend is running |
| `CORS error` | Check FRONTEND_URL in backend/.env |
| `Prisma not found` | Run `npm run prisma:generate` |

### Discord/Community
Join our community for support:
- GitHub Issues
- GitHub Discussions
- Email: support@mutualfundsgalathai.co.in

## 🎉 Success!

You're all set! The frontend is running and can communicate with the backend. Start building amazing features!

**What to build next?**
- [ ] Add watchlist feature
- [ ] Implement user authentication
- [ ] Create comparison feature UI
- [ ] Add fund ratings
- [ ] Build portfolio analyzer

---

**Happy coding! 🚀**

*Remember: Always test locally before deploying to production.*
