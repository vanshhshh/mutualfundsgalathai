-- CreateTable
CREATE TABLE "Fund" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amc" TEXT NOT NULL,
    "fundManager" TEXT,
    "aum" DOUBLE PRECISION NOT NULL,
    "expenseRatio" DOUBLE PRECISION NOT NULL,
    "categoryAvgExpense" DOUBLE PRECISION NOT NULL,
    "volatility" DOUBLE PRECISION,
    "concentration" DOUBLE PRECISION,
    "consistency" DOUBLE PRECISION,
    "riskLevel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Performance" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "returns1Y" DOUBLE PRECISION,
    "returns3Y" DOUBLE PRECISION,
    "returns5Y" DOUBLE PRECISION,
    "returnsYTD" DOUBLE PRECISION,
    "benchmarkReturns1Y" DOUBLE PRECISION,
    "benchmarkReturns3Y" DOUBLE PRECISION,
    "benchmarkReturns5Y" DOUBLE PRECISION,
    "benchmarkName" TEXT NOT NULL DEFAULT 'Nifty 50',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holding" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "stockName" TEXT NOT NULL,
    "companyName" TEXT,
    "sector" TEXT,
    "percentage" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIExplanation" (
    "id" TEXT NOT NULL,
    "fundId" TEXT,
    "summary" TEXT NOT NULL,
    "risks" TEXT NOT NULL,
    "strengths" TEXT NOT NULL,
    "suitability" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIExplanation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundComparison" (
    "id" TEXT NOT NULL,
    "fund1Id" TEXT NOT NULL,
    "fund2Id" TEXT NOT NULL,
    "comparisonText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchlistItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchLog" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "resultsCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fund_name_key" ON "Fund"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Performance_fundId_key" ON "Performance"("fundId");

-- CreateIndex
CREATE UNIQUE INDEX "Holding_fundId_stockName_key" ON "Holding"("fundId", "stockName");

-- CreateIndex
CREATE UNIQUE INDEX "FundComparison_fund1Id_fund2Id_key" ON "FundComparison"("fund1Id", "fund2Id");

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistItem_userId_fundId_key" ON "WatchlistItem"("userId", "fundId");

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holding" ADD CONSTRAINT "Holding_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundComparison" ADD CONSTRAINT "FundComparison_fund1Id_fkey" FOREIGN KEY ("fund1Id") REFERENCES "Fund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundComparison" ADD CONSTRAINT "FundComparison_fund2Id_fkey" FOREIGN KEY ("fund2Id") REFERENCES "Fund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE CASCADE ON UPDATE CASCADE;
