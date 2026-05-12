import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  // Clear existing data
  await prisma.holding.deleteMany();
  await prisma.performance.deleteMany();
  await prisma.aIExplanation.deleteMany();
  await prisma.fund.deleteMany();

  // Sample funds data
  const fundsData = [
    {
      name: "Axis Bluechip Fund",
      category: "Large Cap",
      amc: "Axis Asset Management",
      fundManager: "Deepak Notani",
      aum: 25000,
      expenseRatio: 0.95,
      categoryAvgExpense: 0.85,
      volatility: 9.5,
      concentration: 35.2,
      consistency: 78,
    },
    {
      name: "Mirae Asset Large Cap Fund",
      category: "Large Cap",
      amc: "Mirae Asset Global Investments",
      fundManager: "Neelam Sud",
      aum: 32000,
      expenseRatio: 0.75,
      categoryAvgExpense: 0.85,
      volatility: 8.8,
      concentration: 28.5,
      consistency: 82,
    },
    {
      name: "HDFC Mid-Cap Opportunities Fund",
      category: "Mid Cap",
      amc: "HDFC Asset Management",
      fundManager: "Priya Nair",
      aum: 18500,
      expenseRatio: 1.25,
      categoryAvgExpense: 1.15,
      volatility: 16.2,
      concentration: 42.1,
      consistency: 65,
    },
    {
      name: "Kotak Standard Multicap Fund",
      category: "Multicap",
      amc: "Kotak Mahindra Asset Management",
      fundManager: "Harsha Upadhyaya",
      aum: 28000,
      expenseRatio: 0.65,
      categoryAvgExpense: 0.72,
      volatility: 11.5,
      concentration: 38.0,
      consistency: 75,
    },
    {
      name: "Balanced Value Fund",
      category: "Balanced",
      amc: "Value Research",
      fundManager: "Amit Kumar",
      aum: 12000,
      expenseRatio: 0.5,
      categoryAvgExpense: 0.55,
      volatility: 6.2,
      concentration: 22.0,
      consistency: 88,
    },
  ];

  // Create funds with performance and holdings
  for (const fundData of fundsData) {
    const fund = await prisma.fund.create({
      data: {
        ...fundData,
        riskLevel: fundData.volatility < 8 ? "Low" : fundData.volatility < 15 ? "Moderate" : "High",
        performance: {
          create: {
            returns1Y: Math.random() * 20 + 5,
            returns3Y: Math.random() * 15 + 10,
            returns5Y: Math.random() * 12 + 12,
            returnsYTD: Math.random() * 15 + 3,
            benchmarkReturns1Y: 12.5,
            benchmarkReturns3Y: 11.2,
            benchmarkReturns5Y: 13.8,
            benchmarkName: "Nifty 50",
          },
        },
      },
      include: {
        performance: true,
      },
    });

    // Add holdings
    const holdings = [
      { stockName: "RELIANCE", sector: "Energy", percentage: 8.5 },
      { stockName: "INFY", sector: "IT", percentage: 7.2 },
      { stockName: "HDFC", sector: "Financial Services", percentage: 6.8 },
      { stockName: "TCS", sector: "IT", percentage: 5.9 },
      { stockName: "MARUTI", sector: "Automobiles", percentage: 5.1 },
      { stockName: "BHARTIARTL", sector: "Telecom", percentage: 4.3 },
      { stockName: "SUNPHARMA", sector: "Pharma", percentage: 3.8 },
    ];

    for (const holding of holdings) {
      await prisma.holding.create({
        data: {
          fundId: fund.id,
          ...holding,
          companyName: `${holding.stockName} Ltd.`,
        },
      });
    }
  }

  console.log("✅ Database seeded successfully!");
}

seed()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
