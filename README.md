# 🚀 Mutual Fund Insight Engine

A production-grade, decision-intelligence platform for analyzing mutual funds with a clean, trustworthy UI inspired by Apple and Notion.

**Domain**: mutualfundsgalathai.co.in

## 🎯 Product Vision

Not another data-dump platform. This is a **DECISION INTELLIGENCE** product where users can:

- **Search** any mutual fund instantly
- **Understand** it in less than 10 seconds
- **See** hidden risks clearly
- **Decide** whether to invest or avoid confidently

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI** (component library)
- **Framer Motion** (subtle animations)
- **Recharts** (data visualization)

### Backend
- **Node.js + Express** (TypeScript)
- **PostgreSQL** (database)
- **Prisma** (ORM)
- **Groq API** (AI insights)

## 📁 Project Structure

```
mutualfundsgalathai/
├── backend/              # Express API server
│   ├── src/
│   │   ├── index.ts     # Entry point
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic & AI
│   │   └── types/       # TypeScript types
│   ├── prisma/          # Database schema
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/             # Next.js application
│   ├── src/
│   │   ├── app/         # Next.js App Router
│   │   ├── components/  # React components
│   │   ├── lib/         # Utilities & API client
│   │   └── types/       # Types
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Groq API Key

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your PostgreSQL URL and Groq API key

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

**Backend runs on**: http://localhost:3000

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Ensure NEXT_PUBLIC_API_URL points to your backend

# Start development server
npm run dev
```

**Frontend runs on**: http://localhost:3001

## 🎨 Design System

### Colors
- **Background**: #FAFAFA (off-white)
- **Card**: #FFFFFF
- **Border**: #E5E7EB
- **Primary Text**: #111827
- **Secondary Text**: #6B7280
- **Accent Blue**: #2563EB

### Risk Indicators
- 🟢 **Green** → Low risk
- 🟡 **Yellow** → Moderate risk
- 🔴 **Red** → High risk

### Typography
- Clean, highly readable
- Large headings
- Generous spacing
- No clutter

## 📊 Core Features

### 1. **Homepage**
- Centered search bar: "Search any mutual fund"
- Subtext: "Understand before you invest"
- Auto-suggestions dropdown
- Minimal navigation
- No clutter, no overload

### 2. **Fund Details Page** (Core Product)

**Structure**:
1. **Summary Card** (Top) - AI verdict in one line
2. **Key Metrics** - Expense ratio, AUM, returns, benchmark comparison
3. **What's Not Obvious** - Hidden risks (concentration, volatility, consistency)
4. **AI Explanation Panel** - Summary, risks, strengths, suitability
5. **Portfolio Breakdown** - Top holdings & sector allocation
6. **Performance Chart** - Fund vs benchmark comparison
7. **Alternatives** - Better options with reasons
8. **Compare Feature** - Compare 2-3 funds side-by-side

### 3. **Risk Analysis Engine**

Deterministic rules:
```
- If expenseRatio > categoryAvg → flag "High Cost"
- If top3Holdings > 40% → flag "High Concentration"
- If volatility > 15% → flag "High Volatility"
- If inconsistent returns → flag "Low Consistency"
```

### 4. **AI Integration**

Uses Groq to generate:
- Fund summaries (human language, no jargon)
- Risk assessments
- Suitability analysis
- Fund comparisons
- 1-line verdicts

## 📡 API Endpoints

### Search
```
GET /api/funds/search?q=keyword&limit=10
Returns: Array of matching funds
```

### Fund Details
```
GET /api/funds/:id
Returns: Complete fund details with AI insights, holdings, performance
```

### Compare Funds
```
POST /api/funds/compare
Body: { fundIds: ["id1", "id2", "id3"] }
Returns: Comparison with AI-generated insights
```

## 🗄️ Database Schema

### Fund
- Basic metadata (name, category, AMC, fund manager, AUM)
- Computed metrics (expense ratio comparisons, volatility, concentration)
- Risk flags

### Performance
- 1Y, 3Y, 5Y returns
- Benchmark comparisons
- YTD returns

### Holdings
- Top stock positions
- Sector allocation
- Ownership percentages

### AIExplanation
- Cached AI insights
- Summaries, risks, strengths
- Suitability info
- One-line verdicts

## ⚙️ Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/mutual_funds
GROQ_API_KEY=your_api_key
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🎯 UX Principles

✅ User should understand fund in **< 10 seconds**  
✅ Show **verdict FIRST**, data later  
✅ **No clutter** anywhere  
✅ **No overwhelming charts**  
✅ **Clarity > aesthetics**  

## 🔍 Data Logic

No AI for basic computations. Use deterministic rules:

```typescript
// Example risk flag calculation
const riskFlags = {
  highExpense: fund.expenseRatio > fund.categoryAvgExpense,
  highConcentration: fund.concentration > 40,
  highVolatility: fund.volatility > 15,
  lowConsistency: fund.consistency < 50
};
```

## 🚀 Performance

- Fast load times (< 2s target)
- Lazy load charts
- API response caching
- Optimized images
- Code splitting

## 📚 Optional Features (Future)

- [ ] User authentication (Firebase/JWT)
- [ ] Watchlist functionality
- [ ] Portfolio analyzer
- [ ] Daily fund updates (cron jobs)
- [ ] AI chat: "Explain my portfolio"
- [ ] Email alerts for fund changes
- [ ] Fund comparison saved view

## 🔐 Security & Compliance

- Input validation with Zod
- CORS configured
- Environment variable management
- Rate limiting (recommended)
- User data privacy (if auth added)

## 📝 Development Notes

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/fund-search

# Make changes and commit
git add .
git commit -m "Add fund search functionality"

# Push to remote
git push origin feature/fund-search
```

### Code Style
- Use TypeScript everywhere
- Follow Tailwind naming conventions
- Keep components under 300 lines
- Use Framer Motion for subtle animations only
- No comment clutter - code should be self-documenting

### Testing
- Add unit tests for API endpoints
- Add integration tests for fund search
- Test AI prompt outputs
- Performance testing

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Prisma ORM](https://www.prisma.io)
- [Express.js](https://expressjs.com)
- [Groq API](https://console.groq.com/docs/quickstart)

## 📞 Support

For issues or feedback, create a GitHub issue or contact us.

## 📄 License

MIT License - See LICENSE file for details

---

**Made with ❤️ for Indian investors**

*"Investment is a long journey. We make it crystal clear."*
