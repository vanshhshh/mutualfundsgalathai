import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High' | 'Unknown';

export interface Fund {
  id: string;
  name: string;
  category: string;
  amc: string;
  fundManager?: string | null;
  aum: number | null;
  expenseRatio: number | null;
  categoryAvgExpense: number | null;
  volatility?: number | null;
  concentration?: number | null;
  consistency?: number | null;
  riskLevel: RiskLevel;
  currentNav?: CurrentNav | null;
  purchaseLinks?: PurchaseLink[];
}

export interface CurrentNav {
  schemeCode: string;
  isin: string | null;
  schemeName: string;
  nav: number | null;
  date: string;
  source: 'AMFI';
}

export interface PurchaseLink {
  platform: string;
  url: string;
  confidence: 'exact' | 'high' | 'assisted';
  note: string;
}

export interface Performance {
  returns1Y?: number | null;
  returns3Y?: number | null;
  returns5Y?: number | null;
  returnsYTD?: number | null;
  benchmarkReturns1Y?: number | null;
  benchmarkReturns3Y?: number | null;
  benchmarkReturns5Y?: number | null;
  benchmarkName: string;
}

export interface Holding {
  id: string;
  stockName: string;
  companyName?: string | null;
  sector?: string | null;
  percentage: number | null;
}

export interface AIExplanation {
  verdict: string;
  alpha_engine: {
    excess_return_vs_benchmark: {
      one_year: number | null;
      three_year: number | null;
      five_year: number | null;
    };
    alpha_classification: string;
    alpha_consistency_note: string;
    luck_vs_skill_assessment: string;
  };
  cost_value_engine: {
    expense_ratio_assessment: string;
    cost_efficiency_verdict: string;
  };
  portfolio_intelligence: {
    concentration_assessment: string;
    holdings_quality: string[];
    sector_risk_mapping: string[];
  };
  risk_engine: {
    volatility_context: string;
    hidden_risks: string[];
  };
  manager_intelligence: {
    tenure_assessment: string;
    alignment_with_performance: string;
  };
  data_integrity_check: {
    status: string;
    message: string;
  };
  news_sentiment_layer: {
    summary: string;
    signals: string[];
  };
  scores: {
    alpha_score: number;
    risk_score: number;
    cost_efficiency_score: number;
    trust_score: number;
  };
  final_verdict: {
    classification: string;
    rationale: string[];
  };
  contrarian_insights: string[];
  reality_check: string[];
  bottom_line: string;
}

export interface FundDetails extends Fund {
  performance?: Performance;
  holdings?: Holding[];
  drawdown?: number | null;
  manager?: {
    name: string | null;
    tenureYears: number | null;
    pastPerformance: string | null;
  };
  externalSignals?: {
    negativeNews: string[];
    sectorRisks: string[];
  };
  riskFlags?: {
    highExpense: boolean;
    highConcentration: boolean;
    highVolatility: boolean;
    lowConsistency: boolean;
  };
  aiExplanation?: AIExplanation;
  alternatives?: Array<{
    id: string;
    name: string;
    reason: string;
    expenseRatio: number | null;
    returns1Y?: number | null;
  }>;
  source?: {
    provider: string;
    mode: string;
    noFabricationPolicy?: string;
    planBasis?: string;
    asOfDate?: string;
    navProvider?: string;
    navAsOfDate?: string;
    navHistoryProvider?: string;
    navHistoryAsOfDate?: string;
    holdingsShown?: number;
    totalHoldings?: number;
    notes?: string[];
  };
}

export interface CompareFund {
  id: string;
  name: string;
  amc?: string;
  expenseRatio: number | null;
  returns1Y?: number | null;
  returns3Y?: number | null;
  returns5Y?: number | null;
  volatility?: number | null;
  riskLevel: RiskLevel;
  currentNav?: CurrentNav | null;
  purchaseLinks?: PurchaseLink[];
}

export interface CompareResponse {
  funds: CompareFund[];
  comparison: string;
  source?: {
    provider: string;
    mode: string;
  };
}

export const fundApi = {
  search: async (query: string, limit: number = 10) => {
    const response = await apiClient.get('/funds/search', {
      params: { q: query, limit },
    });
    return response.data;
  },

  getById: async (fundId: string): Promise<FundDetails> => {
    const response = await apiClient.get(`/funds/${fundId}`);
    return response.data;
  },

  compare: async (fundIds: string[]): Promise<CompareResponse> => {
    const response = await apiClient.post('/funds/compare', { fundIds });
    return response.data;
  },
};

export default apiClient;
