import { Fund, RiskFlags } from "../types";

/**
 * Calculate risk flags based on fund metrics
 */
export function calculateRiskFlags(fund: Fund): RiskFlags {
  return {
    highExpense:
      fund.expenseRatio !== null &&
      fund.categoryAvgExpense !== null &&
      fund.expenseRatio > fund.categoryAvgExpense,
    highConcentration: fund.concentration ? fund.concentration > 40 : false,
    highVolatility: fund.volatility ? fund.volatility > 15 : false,
    lowConsistency: fund.consistency ? fund.consistency < 50 : false,
  };
}

/**
 * Determine risk level based on metrics
 */
export function determineRiskLevel(volatility: number | null | undefined): string {
  if (!volatility) return "Unknown";
  if (volatility < 8) return "Low";
  if (volatility < 15) return "Moderate";
  return "High";
}

/**
 * Suggest alternatives for a fund
 */
export interface AlternativeFund {
  id: string;
  name: string;
  reason: string;
  expenseRatio: number | null;
  returns1Y: number | null;
}

export function suggestAlternatives(
  funds: any[], // Array of funds from DB
  targetFundId: string
): AlternativeFund[] {
  const targetFund = funds.find((f) => f.id === targetFundId);
  if (!targetFund) return [];

  const alternatives = funds
    .filter((f) => f.id !== targetFundId && f.category === targetFund.category)
    .map((f) => {
      let reason = "";
      if (
        f.expenseRatio !== null &&
        targetFund.expenseRatio !== null &&
        f.expenseRatio < targetFund.expenseRatio
      ) {
        reason = "Lower expense ratio";
      } else if (
        f.performance?.returns1Y &&
        targetFund.performance?.returns1Y &&
        f.performance.returns1Y > targetFund.performance.returns1Y
      ) {
        reason = "Better recent returns";
      } else if (f.volatility && targetFund.volatility && f.volatility < targetFund.volatility) {
        reason = "Lower volatility";
      }

      return {
        id: f.id,
        name: f.name,
        reason,
        expenseRatio: f.expenseRatio,
        returns1Y: f.performance?.returns1Y || null,
      };
    })
    .slice(0, 3);

  return alternatives;
}
