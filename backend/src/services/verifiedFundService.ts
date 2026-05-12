import {
  type RealtimeAlternative,
  type RealtimeFund,
  type RealtimeFundDetails,
  type RealtimeHolding,
  type RealtimePerformance,
} from "./groqFundService";

interface FundIdentity {
  name: string;
  amc?: string;
}

export interface VerifiedFundSource {
  provider: string;
  mode: string;
  noFabricationPolicy: string;
  planBasis?: string;
  asOfDate?: string;
  holdingsShown?: number;
  totalHoldings?: number;
  notes?: string[];
}

interface VerifiedFundRecord {
  aliases: string[];
  searchFund: RealtimeFund;
  details: RealtimeFundDetails;
  source: VerifiedFundSource;
  preferDeterministicExplanation: boolean;
}

function buildFundId(name: string, amc: string): string {
  return Buffer.from(`${name}::${amc}`, "utf8").toString("base64url");
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

const adityaAmc = "Aditya Birla Sun Life Asset Management Company Ltd";
const adityaName = "Aditya Birla Sun Life PSU Equity Fund";
const adityaId = buildFundId(adityaName, adityaAmc);

const adityaHoldingRows: Array<[string, string, number]> = [
  ["State Bank of India", "Banking", 18.77],
  ["NTPC Limited", "Power", 9.17],
  ["Power Grid Corporation of India Limited", "Power", 6.85],
  ["Bharat Electronics Limited", "Aerospace & Defense", 5.37],
  ["Bharat Heavy Electricals Limited", "Electrical Equipment", 4.51],
  ["GAIL (India) Limited", "Gas", 4.36],
  ["Oil & Natural Gas Corporation Limited", "Oil", 4.2],
  ["Bank of Maharashtra", "Banking", 3.82],
  ["Bank of Baroda", "Banking", 3.78],
  ["Bank of India", "Banking", 3.65],
  ["Coal India Limited", "Consumable Fuels", 3.45],
  ["NMDC Limited", "Minerals & Mining", 3.31],
  ["PNB Housing Finance Limited", "Finance", 2.77],
  ["Hindustan Aeronautics Limited", "Aerospace & Defense", 2.18],
  ["Indian Oil Corporation Limited", "Petroleum Products", 1.94],
];

const adityaHoldings: RealtimeHolding[] = adityaHoldingRows.map(([stockName, sector, percentage], index) => ({
  id: `${adityaId}-holding-${index}`,
  fundId: adityaId,
  stockName,
  companyName: stockName,
  sector,
  percentage,
}));

const adityaPerformance: RealtimePerformance = {
  id: `perf-${adityaId}`,
  fundId: adityaId,
  returns1Y: 7.99,
  returns3Y: 27.59,
  returns5Y: 25.96,
  returnsYTD: null,
  benchmarkReturns1Y: 10.89,
  benchmarkReturns3Y: 31.07,
  benchmarkReturns5Y: 28.2,
  benchmarkName: "BSE PSU TRI",
};

const kotakMidcapAmc = "Kotak Mahindra Asset Management Company Limited";
const kotakMidcapName = "Kotak Midcap Fund";
const kotakMidcapId = buildFundId(kotakMidcapName, kotakMidcapAmc);

const kotakMidcapHoldingRows: Array<[string, string, number]> = [
  ["GE Vernova T&D India Limited", "Electrical Equipment", 5.33],
  ["Fortis Healthcare India Ltd", "Healthcare Services", 3.97],
  ["Ipca Laboratories Ltd", "Pharmaceuticals and Biotechnology", 3.45],
  ["Mphasis Ltd", "IT - Software", 2.93],
  ["KEI Industries Ltd", "Industrial Products", 2.66],
  ["Indian Bank", "Banks", 2.65],
  ["Bharat Electronics Ltd", "Aerospace and Defense", 2.42],
  ["JK Cement Ltd", "Cement and Cement Products", 2.21],
  ["Solar Industries India Limited", "Chemicals and Petrochemicals", 2.14],
  ["Vishal Mega Mart Limited", "Retailing", 2.1],
  ["Apar Industries Limited", "Electrical Equipment", 2.01],
  ["Bharti Hexacom Ltd", "Telecom - Services", 2.01],
  ["Schaeffler India Ltd", "Auto Components", 2.0],
  ["Coromandel International Ltd", "Fertilizers and Agrochemicals", 1.97],
  ["L&T Finance Holdings Ltd", "Finance", 1.89],
  ["Oracle Financial Services Software Ltd", "IT - Software", 1.85],
  ["Oberoi Realty Ltd", "Realty", 1.83],
  ["Swiggy Ltd", "Retailing", 1.79],
  ["JB Chemicals & Pharmaceuticals Ltd", "Pharmaceuticals and Biotechnology", 1.79],
  ["Dixon Technologies India Ltd", "Consumer Durables", 1.76],
];

const kotakMidcapHoldings: RealtimeHolding[] = kotakMidcapHoldingRows.map(
  ([stockName, sector, percentage], index) => ({
    id: `${kotakMidcapId}-holding-${index}`,
    fundId: kotakMidcapId,
    stockName,
    companyName: stockName,
    sector,
    percentage,
  })
);

const kotakMidcapPerformance: RealtimePerformance = {
  id: `perf-${kotakMidcapId}`,
  fundId: kotakMidcapId,
  returns1Y: 4.26,
  returns3Y: 19.25,
  returns5Y: 17.61,
  returnsYTD: null,
  benchmarkReturns1Y: 2.26,
  benchmarkReturns3Y: 20.34,
  benchmarkReturns5Y: 17.5,
  benchmarkName: "NIFTY Midcap 150 TRI",
};

const miraeLargeCapAmc = "Mirae Asset Investment Managers (India) Pvt. Ltd.";
const miraeLargeCapName = "Mirae Asset Large Cap Fund";
const miraeLargeCapId = buildFundId(miraeLargeCapName, miraeLargeCapAmc);

const miraeLargeCapHoldingRows: Array<[string, string, number]> = [
  ["HDFC Bank Ltd", "Banks", 9.23],
  ["ICICI Bank Ltd", "Banks", 8.55],
  ["Reliance Industries Ltd", "Petroleum Products", 5.76],
  ["Bharti Airtel Ltd", "Telecom - Services", 5.56],
  ["Infosys Ltd", "IT - Software", 4.95],
  ["Axis Bank Ltd", "Banks", 3.91],
  ["State Bank of India", "Banks", 3.81],
  ["Larsen & Toubro Ltd", "Construction", 3.37],
  ["ITC Ltd", "Diversified FMCG", 2.83],
  ["Tata Consultancy Services Ltd", "IT - Software", 2.61],
];

const miraeLargeCapHoldings: RealtimeHolding[] = miraeLargeCapHoldingRows.map(
  ([stockName, sector, percentage], index) => ({
    id: `${miraeLargeCapId}-holding-${index}`,
    fundId: miraeLargeCapId,
    stockName,
    companyName: stockName,
    sector,
    percentage,
  })
);

const miraeLargeCapPerformance: RealtimePerformance = {
  id: `perf-${miraeLargeCapId}`,
  fundId: miraeLargeCapId,
  returns1Y: null,
  returns3Y: null,
  returns5Y: null,
  returnsYTD: null,
  benchmarkReturns1Y: null,
  benchmarkReturns3Y: null,
  benchmarkReturns5Y: null,
  benchmarkName: "NIFTY 100 TRI",
};

const verifiedFunds: VerifiedFundRecord[] = [
  {
    aliases: [
      miraeLargeCapName,
      "Mirae Asset Large Cap Fund Direct Growth",
      "Mirae Large Cap Fund",
    ],
    searchFund: {
      id: miraeLargeCapId,
      name: miraeLargeCapName,
      category: "Large Cap Fund",
      amc: miraeLargeCapAmc,
      fundManager: "Gaurav K Misra",
      aum: 35342.63,
      expenseRatio: 0.58,
      categoryAvgExpense: null,
      volatility: 13.43,
      drawdown: null,
      concentration: 23.54,
      consistency: null,
      riskLevel: "Very High",
    },
    details: {
      id: miraeLargeCapId,
      name: miraeLargeCapName,
      category: "Large Cap Fund",
      amc: miraeLargeCapAmc,
      fundManager: "Gaurav K Misra",
      aum: 35342.63,
      expenseRatio: 0.58,
      categoryAvgExpense: null,
      volatility: 13.43,
      drawdown: null,
      concentration: 23.54,
      consistency: null,
      riskLevel: "Very High",
      performance: miraeLargeCapPerformance,
      holdings: miraeLargeCapHoldings,
      alternatives: [] as RealtimeAlternative[],
      manager: {
        name: "Gaurav K Misra",
        tenureYears: 7.17,
        pastPerformance:
          "Gaurav K Misra has managed the fund since January 31, 2019, according to Mirae Asset's March 2026 factsheet.",
      },
      externalSignals: {
        negativeNews: [],
        sectorRisks: [
          "Large-cap equity riskometer is Very High in the March 2026 Mirae Asset factsheet.",
          "The top three holdings shown account for 23.54% of the portfolio, so concentration should be watched but is not the 53.81% figure from the stale Groq result.",
        ],
      },
    },
    source: {
      provider: "Official Mirae Asset MF / AMFI",
      mode: "verified-override",
      noFabricationPolicy: "official-factsheet-and-amfi-override",
      planBasis: "Direct Plan - Growth",
      asOfDate: "March 31, 2026",
      holdingsShown: miraeLargeCapHoldings.length,
      totalHoldings: 64,
      notes: [
        "AUM, direct-plan TER, riskometer, standard deviation, manager, and top holdings use Mirae Asset's March 2026 factsheet.",
        "Current NAV and ISIN are enriched from AMFI scheme code 118825 / ISIN INF769K01AX2.",
        "Direct-plan trailing returns are intentionally not filled until a verified direct-plan return source is wired.",
      ],
    },
    preferDeterministicExplanation: true,
  },
  {
    aliases: [
      kotakMidcapName,
      "Kotak Midcap Fund Direct Growth",
      "Kotak Mid Cap Fund",
      "Kotak Emerging Equity Fund",
      "Kotak Emerging Equity Scheme",
      "Kotak Emerging Equity Scheme Direct Growth",
      "Kotak Emerging Equity Fund Direct Growth",
    ],
    searchFund: {
      id: kotakMidcapId,
      name: kotakMidcapName,
      category: "Mid Cap Fund",
      amc: kotakMidcapAmc,
      fundManager: "Atul Bhole",
      aum: 55675.98,
      expenseRatio: 0.38,
      categoryAvgExpense: null,
      volatility: 16.78,
      drawdown: null,
      concentration: 12.75,
      consistency: null,
      riskLevel: "Very High",
    },
    details: {
      id: kotakMidcapId,
      name: kotakMidcapName,
      category: "Mid Cap Fund",
      amc: kotakMidcapAmc,
      fundManager: "Atul Bhole",
      aum: 55675.98,
      expenseRatio: 0.38,
      categoryAvgExpense: null,
      volatility: 16.78,
      drawdown: null,
      concentration: 12.75,
      consistency: null,
      riskLevel: "Very High",
      performance: kotakMidcapPerformance,
      holdings: kotakMidcapHoldings,
      alternatives: [] as RealtimeAlternative[],
      manager: {
        name: "Atul Bhole",
        tenureYears: 2.27,
        pastPerformance:
          "Atul Bhole has managed Kotak Midcap Fund since January 22, 2024, according to Kotak's March 2026 factsheet.",
      },
      externalSignals: {
        negativeNews: [],
        sectorRisks: [
          "Mid-cap strategy risk: portfolio outcomes can swing sharply when liquidity or valuations compress.",
          "Factsheet shows 73.39% mid-cap and 14.01% small-cap exposure as of March 31, 2026.",
        ],
      },
    },
    source: {
      provider: "Official Kotak MF / AMFI",
      mode: "verified-override",
      noFabricationPolicy: "official-factsheet-and-amfi-override",
      planBasis: "Direct Plan - Growth",
      asOfDate: "March 31, 2026",
      holdingsShown: kotakMidcapHoldings.length,
      totalHoldings: 72,
      notes: [
        "Kotak Emerging Equity Fund is now identified as Kotak Midcap Fund for current Direct Plan - Growth data.",
        "AUM, direct-plan TER, standard deviation, riskometer, manager, market-cap allocation, and holdings use Kotak MF March 2026 factsheet data.",
        "Current NAV and ISIN are enriched from AMFI scheme code 119775 / ISIN INF174K01LT0.",
      ],
    },
    preferDeterministicExplanation: true,
  },
  {
    aliases: [
      adityaName,
      "Aditya Birla Sun Life PSU Fund",
      "ABSL PSU Equity Fund",
      "Aditya Birla PSU Equity Fund",
    ],
    searchFund: {
      id: adityaId,
      name: adityaName,
      category: "Thematic Equity - PSU",
      amc: adityaAmc,
      fundManager: "Dhaval Gala",
      aum: 5334.01,
      expenseRatio: 0.59,
      categoryAvgExpense: null,
      volatility: 22.85,
      drawdown: null,
      concentration: 34.79,
      consistency: null,
      riskLevel: "Very High",
    },
    details: {
      id: adityaId,
      name: adityaName,
      category: "Thematic Equity - PSU",
      amc: adityaAmc,
      fundManager: "Dhaval Gala",
      aum: 5334.01,
      expenseRatio: 0.59,
      categoryAvgExpense: null,
      volatility: 22.85,
      drawdown: null,
      concentration: 34.79,
      consistency: null,
      riskLevel: "Very High",
      performance: adityaPerformance,
      holdings: adityaHoldings,
      alternatives: [] as RealtimeAlternative[],
      manager: {
        name: "Dhaval Gala",
        tenureYears: 3.5,
        pastPerformance: null,
      },
      externalSignals: {
        negativeNews: [],
        sectorRisks: [],
      },
    },
    source: {
      provider: "Official AMC / AMFI",
      mode: "verified-override",
      noFabricationPolicy: "official-factsheet-and-amfi-override",
      planBasis: "Direct Plan - Growth",
      asOfDate: "March 30, 2026",
      holdingsShown: adityaHoldings.length,
      totalHoldings: 32,
      notes: [
        "Returns use the official Direct Plan - Growth performance from the Aditya Birla Sun Life April 2026 brochure.",
        "AUM, TER, volatility, top holdings, and count of securities use the official March 2026 AMC factsheet.",
        "Riskometer and fund-manager record use the AMFI Scheme Summary Document current as of April 2026.",
      ],
    },
    preferDeterministicExplanation: true,
  },
];

export function searchVerifiedFunds(query: string, limit: number): RealtimeFund[] {
  const normalizedQuery = normalizeKey(query);

  return verifiedFunds
    .filter((record) =>
      record.aliases.some((alias) => normalizeKey(alias).includes(normalizedQuery)) ||
      normalizedQuery.includes(normalizeKey(record.details.name))
    )
    .slice(0, limit)
    .map((record) => record.searchFund);
}

export function getVerifiedFundRecord(identity: FundIdentity): VerifiedFundRecord | null {
  const normalizedName = normalizeKey(identity.name);
  const normalizedAmc = identity.amc ? normalizeKey(identity.amc) : null;

  for (const record of verifiedFunds) {
    const nameMatch = record.aliases.some((alias) => normalizeKey(alias) === normalizedName);
    const amcMatch = !normalizedAmc || normalizeKey(record.details.amc) === normalizedAmc;

    if (nameMatch && amcMatch) {
      return record;
    }
  }

  return null;
}
