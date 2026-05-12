import { z } from "zod";

// Fund types
export const FundSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  amc: z.string(),
  fundManager: z.string().nullable(),
  aum: z.number().nullable(),
  expenseRatio: z.number().nullable(),
  categoryAvgExpense: z.number().nullable(),
  volatility: z.number().nullable(),
  concentration: z.number().nullable(),
  consistency: z.number().nullable(),
  riskLevel: z.string(),
});

export type Fund = z.infer<typeof FundSchema>;

// Performance types
export const PerformanceSchema = z.object({
  id: z.string(),
  fundId: z.string(),
  returns1Y: z.number().nullable(),
  returns3Y: z.number().nullable(),
  returns5Y: z.number().nullable(),
  returnsYTD: z.number().nullable(),
  benchmarkReturns1Y: z.number().nullable(),
  benchmarkReturns3Y: z.number().nullable(),
  benchmarkReturns5Y: z.number().nullable(),
  benchmarkName: z.string(),
});

export type Performance = z.infer<typeof PerformanceSchema>;

// Holding types
export const HoldingSchema = z.object({
  id: z.string(),
  fundId: z.string(),
  stockName: z.string(),
  companyName: z.string().nullable(),
  sector: z.string().nullable(),
  percentage: z.number().nullable(),
});

export type Holding = z.infer<typeof HoldingSchema>;

// AI Explanation types
export const AIExplanationSchema = z.object({
  verdict: z.string(),
  alpha_engine: z.object({
    excess_return_vs_benchmark: z.object({
      one_year: z.number().nullable(),
      three_year: z.number().nullable(),
      five_year: z.number().nullable(),
    }),
    alpha_classification: z.string(),
    alpha_consistency_note: z.string(),
    luck_vs_skill_assessment: z.string(),
  }),
  cost_value_engine: z.object({
    expense_ratio_assessment: z.string(),
    cost_efficiency_verdict: z.string(),
  }),
  portfolio_intelligence: z.object({
    concentration_assessment: z.string(),
    holdings_quality: z.array(z.string()),
    sector_risk_mapping: z.array(z.string()),
  }),
  risk_engine: z.object({
    volatility_context: z.string(),
    hidden_risks: z.array(z.string()),
  }),
  manager_intelligence: z.object({
    tenure_assessment: z.string(),
    alignment_with_performance: z.string(),
  }),
  data_integrity_check: z.object({
    status: z.string(),
    message: z.string(),
  }),
  news_sentiment_layer: z.object({
    summary: z.string(),
    signals: z.array(z.string()),
  }),
  scores: z.object({
    alpha_score: z.number(),
    risk_score: z.number(),
    cost_efficiency_score: z.number(),
    trust_score: z.number(),
  }),
  final_verdict: z.object({
    classification: z.string(),
    rationale: z.array(z.string()),
  }),
  contrarian_insights: z.array(z.string()),
  reality_check: z.array(z.string()),
  bottom_line: z.string(),
});

export type AIExplanation = z.infer<typeof AIExplanationSchema>;

// API Request types
export const FundSearchSchema = z.object({
  q: z.string().trim().min(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type FundSearchRequest = z.infer<typeof FundSearchSchema>;

// Risk computation
export interface RiskFlags {
  highExpense: boolean;
  highConcentration: boolean;
  highVolatility: boolean;
  lowConsistency: boolean;
}

export interface FundWithDetails extends Fund {
  performance?: Performance;
  holdings?: Holding[];
  riskFlags?: RiskFlags;
  aiExplanation?: AIExplanation;
}
