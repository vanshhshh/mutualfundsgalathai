# Architecture Guide

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│              (Next.js + TypeScript + Tailwind)              │
│                                                              │
│  ├─ Homepage: Search interface                             │
│  ├─ Fund Details: Comprehensive analysis                   │
│  ├─ Compare: Side-by-side fund comparison                  │
│  └─ Components: Reusable UI elements                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ API Calls
                     │ (Axios)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│           (Express.js + TypeScript + Prisma)               │
│                                                              │
│  ├─ Routes: RESTful endpoints                               │
│  ├─ Services: Business logic & AI integration              │
│  ├─ Database: PostgreSQL with Prisma ORM                    │
│  └─ Middleware: CORS, error handling                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Queries
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                                │
│                    PostgreSQL                                │
│                                                              │
│  ├─ Funds: Metadata & computed metrics                      │
│  ├─ Performance: Historical returns & benchmarks            │
│  ├─ Holdings: Stock positions & sectors                     │
│  └─ AI Explanations: Cached insights                        │
└──────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Directory Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   ├── globals.css         # Global styles
│   │   ├── funds/
│   │   │   └── [id]/page.tsx   # Fund details page
│   │   └── compare/page.tsx    # Compare page
│   │
│   ├── components/
│   │   ├── Header.tsx          # Navigation
│   │   ├── SearchBar.tsx       # Search with autocomplete
│   │   ├── SummaryCard.tsx     # Fund summary
│   │   ├── KeyMetrics.tsx      # KPI cards
│   │   ├── HiddenRisks.tsx     # Risk flags
│   │   ├── AIExplanationPanel.tsx
│   │   ├── PortfolioBreakdown.tsx
│   │   ├── PerformanceSection.tsx
│   │   ├── Alternatives.tsx    # Alternative funds
│   │   └── Skeletons.tsx       # Loading placeholders
│   │
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   └── utils.ts            # Helper functions
│   │
│   └── types/
│       └── index.ts            # TypeScript definitions
│
└── package.json
```

### Key Components

#### SearchBar
- Auto-complete functionality
- Debounced API calls
- Dropdown suggestions
- Keyboard navigation

#### Fund Details Page
1. **SummaryCard** - AI verdict at top
2. **KeyMetrics** - Important numbers
3. **HiddenRisks** - Flagged issues
4. **AIExplanationPanel** - Detailed insights
5. **PortfolioBreakdown** - Holdings & sectors
6. **PerformanceSection** - Charts & trends
7. **Alternatives** - Better options

### State Management
- React hooks (useState, useEffect)
- URL params for fund ID
- API caching in browser

### Styling
- Tailwind CSS utility classes
- Custom CSS for glassmorphism
- Responsive grid layouts
- Dark mode ready (future)

## Backend Architecture

### Directory Structure
```
backend/
├── src/
│   ├── index.ts               # Entry point
│   │
│   ├── routes/
│   │   ├── funds.ts           # Fund endpoints
│   │   └── health.ts          # Health checks
│   │
│   ├── services/
│   │   ├── aiService.ts       # OpenAI integration
│   │   └── fundService.ts     # Business logic
│   │
│   ├── utils/
│   │   ├── errors.ts          # Error handling
│   │   └── cache.ts           # In-memory cache
│   │
│   └── types/
│       └── index.ts           # Type definitions
│
├── prisma/
│   └── schema.prisma          # Database schema
│
└── package.json
```

### API Endpoints

#### Search
```
GET /api/funds/search?q=keyword&limit=10
```
- Query database
- Return ranked results
- Cache results

#### Get Details
```
GET /api/funds/:id
```
- Fetch fund metadata
- Get performance history
- Get holdings
- Generate/fetch AI insights
- Suggest alternatives

#### Compare
```
POST /api/funds/compare
{ fundIds: ["id1", "id2", "id3"] }
```
- Compare metrics
- Generate AI comparison
- Return side-by-side data

### Data Flow

```
Request → Validation → Database Query → Processing → AI Processing → Response
```

1. **Request Validation**: Zod schemas
2. **Database Query**: Prisma
3. **Processing**: Type conversion & calculations
4. **AI Processing**: OpenAI API
5. **Response**: Formatted JSON

### Error Handling

```typescript
throw new AppError("Fund not found", 404, "FUND_NOT_FOUND");
```

- Custom error class
- Status code & code property
- Centralized error handler middleware

## Database Schema

### Fund Table
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR UNIQUE
category        VARCHAR
amc             VARCHAR
fundManager     VARCHAR
aum             FLOAT
expenseRatio    FLOAT
riskLevel       VARCHAR
volatility      FLOAT
concentration  FLOAT
consistency    FLOAT
```

### Performance Table
```sql
fundId          FOREIGN KEY
returns1Y       FLOAT
returns3Y       FLOAT
returns5Y       FLOAT
benchmarkReturns1Y FLOAT
benchmarkReturns3Y FLOAT
benchmarkReturns5Y FLOAT
```

### Holdings Table
```sql
fundId          FOREIGN KEY
stockName       VARCHAR
companyName     VARCHAR
sector          VARCHAR
percentage      FLOAT
```

### AIExplanation Table
```sql
fundId          FOREIGN KEY
summary         TEXT
risks           TEXT (JSON)
strengths       TEXT (JSON)
suitability     TEXT (JSON)
verdict         TEXT
```

## Data Flow Example: Get Fund Details

```
User clicks fund in search results
                ↓
URL changes to /funds/fund-id-1
                ↓
Frontend calls GET /api/funds/fund-id-1
                ↓
Backend receives request
                ↓
Query Fund basics (name, category, amc)
                ↓
Query Performance (returns, benchmarks)
                ↓
Query Holdings (top stocks, sectors)
                ↓
Check if AIExplanation cached
├─ If cached: Use cached data
└─ If not cached:
    ├─ Compute risk flags
    ├─ Call OpenAI API
    ├─ Cache result
    └─ Return result
                ↓
Query alternative funds
                ↓
Build complete response
                ↓
Return JSON to frontend
                ↓
Frontend renders SummaryCard
Frontend renders KeyMetrics
Frontend renders HiddenRisks
... (other components)
```

## AI Integration

### OpenAI API Usage

```typescript
// Input data structured
const input = {
  fundName: string,
  expenseRatio: number,
  volatility: number,
  concentration: number,
  returns1Y: number,
  consistency: number,
  riskLevel: string
};

// Output format
{
  summary: string,
  risks: string[],
  strengths: string[],
  suitability: {
    good_for: string[],
    avoid_for: string[]
  },
  verdict: string
}
```

### Caching Strategy
- Cache AI explanations in database
- Update on fund data change
- 30-day TTL
- Manual refresh option

## Performance Optimizations

### Frontend
- Lazy load charts & images
- Code splitting by route
- Static site generation for homepage
- API response caching

### Backend
- In-memory caching
- Database query optimization
- Connection pooling
- Response compression

### Network
- Gzip compression
- CDN for static assets
- HTTP caching headers
- API response pagination

## Security Measures

- ✅ CORS properly configured
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma)
- ✅ Rate limiting (planned)
- ✅ HTTPS in production
- ✅ Environment variable management

## Monitoring & Logging

```typescript
// Request logging
app.use((req, res, next) => {
  console.log(`[${timestamp}] ${method} ${path}`);
  next();
});

// Error logging
errorHandler((err, req, res, next) => {
  console.error(err);
  res.status(err.status).json(err);
});
```

## Scaling Considerations

### Vertical
- Increase server resources
- Optimize database queries
- Cache more aggressively

### Horizontal
- Load balance requests
- Distribute database
- Separate read/write replicas

### Database
- Indexes on common queries
- Partitioning large tables
- Connection pooling

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: Active
