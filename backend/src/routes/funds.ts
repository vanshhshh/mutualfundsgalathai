import { Router, Request, Response } from "express";
import { AIExplanation, FundSearchSchema } from "../types";
import { generateFundExplanation } from "../services/aiService";
import { calculateRiskFlags } from "../services/fundService";
import {
  getFundDetailsFromGroq,
  type RealtimeFundDetails,
  resolveFundIdentity,
  searchFundsFromGroq,
} from "../services/groqFundService";
import {
  getVerifiedFundRecord,
  searchVerifiedFunds,
} from "../services/verifiedFundService";
import {
  enrichFundWithMarketProfile,
  getAmfiOnlyFundDetails,
  getFundMarketProfile,
  getNavPerformanceForScheme,
  type NavPerformanceProfile,
  searchAmfiFunds,
} from "../services/amfiService";
import {
  enrichFundDetailsWithMfdata,
  enrichSearchFundWithMfdata,
  getMfdataEnrichment,
  getMfdataProfileEnrichment,
  type MfdataEnrichment,
} from "../services/mfdataService";

const router = Router();

function normalizeResultKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function allowGroqFacts(): boolean {
  return process.env.ALLOW_GROQ_FACTS === "true";
}

function buildExactDataUnavailableExplanation(fundName: string): AIExplanation {
  const unavailable = "Verified factsheet data is not available for this scheme yet, so MUTUALFUNDSGALATHAI is showing only exact AMFI identity/NAV fields and withholding judgement.";

  return {
    verdict: unavailable,
    alpha_engine: {
      excess_return_vs_benchmark: {
        one_year: null,
        three_year: null,
        five_year: null,
      },
      alpha_classification: "Insufficient verified data",
      alpha_consistency_note: "No verified return series is available for this exact scheme class.",
      luck_vs_skill_assessment: "Skill cannot be assessed without verified direct-plan returns and benchmark data.",
    },
    cost_value_engine: {
      expense_ratio_assessment: "Verified TER is unavailable for this fund in the local factsheet registry.",
      cost_efficiency_verdict: "Inconclusive due to data",
    },
    portfolio_intelligence: {
      concentration_assessment: "Verified holdings are unavailable, so concentration is not rated.",
      holdings_quality: ["Holdings are withheld until a verified factsheet source is available."],
      sector_risk_mapping: ["Sector exposure is withheld until a verified factsheet source is available."],
    },
    risk_engine: {
      volatility_context: "Verified volatility/riskometer data is unavailable.",
      hidden_risks: ["Do not judge this fund from AMFI NAV alone; NAV identifies the scheme but does not describe portfolio risk."],
    },
    manager_intelligence: {
      tenure_assessment: "Verified fund-manager data is unavailable.",
      alignment_with_performance: "Manager attribution is withheld until verified.",
    },
    data_integrity_check: {
      status: "warning",
      message: `Only AMFI scheme identity/NAV is verified for ${fundName}. Other analysis fields are intentionally withheld.`,
    },
    news_sentiment_layer: {
      summary: "No verified news layer available",
      signals: ["No external news layer is attached to AMFI-only records."],
    },
    scores: {
      alpha_score: 0,
      risk_score: 0,
      cost_efficiency_score: 0,
      trust_score: 2,
    },
    final_verdict: {
      classification: "Not Rated",
      rationale: [
        "AMFI confirms the scheme identity and NAV only.",
        "Factsheet-level AUM, TER, manager, holdings, and returns are not verified in this registry yet.",
      ],
    },
    contrarian_insights: ["The safest answer is sometimes N/A; missing verified data should not be replaced with model guesses."],
    reality_check: ["This page intentionally avoids Groq-filled market facts."],
    bottom_line: unavailable,
  };
}

function buildVerifiedFactsheetLimitedExplanation(fundName: string): AIExplanation {
  const unavailable = "Verified identity, NAV, TER, AUM, manager, risk, and holdings are available, but verified direct-plan trailing returns are not wired yet, so this fund is not rated.";

  return {
    verdict: unavailable,
    alpha_engine: {
      excess_return_vs_benchmark: {
        one_year: null,
        three_year: null,
        five_year: null,
      },
      alpha_classification: "Insufficient verified direct-plan return data",
      alpha_consistency_note: "Direct-plan return and benchmark-return fields are intentionally withheld until a verified source is wired.",
      luck_vs_skill_assessment: "Manager skill cannot be judged from holdings and NAV alone.",
    },
    cost_value_engine: {
      expense_ratio_assessment: "Verified direct-plan TER is available in the fund factsheet.",
      cost_efficiency_verdict: "Inconclusive due to data",
    },
    portfolio_intelligence: {
      concentration_assessment: "Verified holdings are available; use the portfolio table for concentration and sector review.",
      holdings_quality: ["Holdings are sourced from the verified AMC factsheet."],
      sector_risk_mapping: ["Sector exposure is shown from verified holdings, but no return judgement is made."],
    },
    risk_engine: {
      volatility_context: "Verified volatility/risk facts are available where shown on the page.",
      hidden_risks: ["A complete buy/avoid judgement needs verified direct-plan return history and benchmark comparison."],
    },
    manager_intelligence: {
      tenure_assessment: "Verified manager information is available where shown on the page.",
      alignment_with_performance: "Manager-performance alignment is not rated without verified direct-plan performance history.",
    },
    data_integrity_check: {
      status: "warning",
      message: `Factsheet-level data is verified for ${fundName}, but return judgement is withheld because direct-plan returns are not verified in this registry yet.`,
    },
    news_sentiment_layer: {
      summary: "No verified news layer available",
      signals: ["No external news layer is attached to this verified factsheet record."],
    },
    scores: {
      alpha_score: 0,
      risk_score: 0,
      cost_efficiency_score: 0,
      trust_score: 7,
    },
    final_verdict: {
      classification: "Not Rated",
      rationale: [
        "Factsheet fields are verified.",
        "Direct-plan trailing returns are not verified here yet.",
      ],
    },
    contrarian_insights: ["A clean factsheet record is not the same thing as an investment recommendation."],
    reality_check: ["The app now refuses to infer missing return data from Groq."],
    bottom_line: unavailable,
  };
}

function scoreFromVolatility(volatility: number | null): number {
  if (volatility === null) return 4;
  if (volatility < 10) return 8;
  if (volatility < 15) return 6;
  if (volatility < 20) return 4;
  return 2;
}

function scoreFromReturn(value: number | null): number {
  if (value === null) return 0;
  if (value >= 15) return 8;
  if (value >= 10) return 6;
  if (value >= 6) return 4;
  if (value >= 0) return 2;
  return 1;
}

function buildNavPerformanceExplanation(
  fund: RealtimeFundDetails,
  navProfile: NavPerformanceProfile,
  holdingsCount: number,
  knownHoldingAllocation: number,
  sectorAllocation: Array<{ sector: string; percentage: number }>,
  mfdataEnrichment: MfdataEnrichment | null
): AIExplanation {
  const fundName = fund.name;
  const { returns1Y, returns3Y, returns5Y } = navProfile.performance;
  const volatility = navProfile.volatility;
  const drawdown = navProfile.drawdown;
  const expenseRatio = fund.expenseRatio;
  const hasStructuredEnrichment = Boolean(mfdataEnrichment);
  const returnScore = Math.max(
    scoreFromReturn(returns1Y),
    scoreFromReturn(returns3Y),
    scoreFromReturn(returns5Y)
  );
  const riskScore = scoreFromVolatility(volatility);
  const costScore =
    expenseRatio === null || expenseRatio === undefined
      ? 0
      : expenseRatio <= 0.5
        ? 8
        : expenseRatio <= 1
          ? 6
          : expenseRatio <= 1.5
            ? 4
            : 2;
  const trustScore = hasStructuredEnrichment ? (holdingsCount > 5 ? 7 : 6) : 5;
  const classification =
    returnScore >= 7 && riskScore >= 5 && costScore >= 5
      ? "Positive Research Candidate"
      : returnScore >= 5 && riskScore >= 4
        ? "Reasonable Research Candidate"
        : returnScore >= 3
          ? "Watch Closely"
          : "Weak Trend";
  const volatilityText =
    volatility === null
      ? "volatility is unavailable"
      : `${volatility.toFixed(2)}% annualized volatility from AMFI NAV history`;
  const drawdownText =
    drawdown === null ? "drawdown is unavailable" : `${drawdown.toFixed(2)}% max drawdown over the measured NAV window`;
  const concentrationText =
    fund.concentration === null || fund.concentration === undefined
      ? "Top-holding concentration is unavailable."
      : `Top three known holdings add up to ${fund.concentration.toFixed(2)}%.`;
  const costText =
    expenseRatio === null || expenseRatio === undefined
      ? "Direct-plan TER is unavailable from the connected structured source."
      : `Direct-plan TER is ${expenseRatio.toFixed(2)}%.`;
  const topSectors = sectorAllocation
    .slice(0, 3)
    .map((sector) => `${sector.sector} ${sector.percentage.toFixed(2)}%`);
  const dataMessage = hasStructuredEnrichment
    ? `AMFI NAV history uses ${navProfile.dataPoints} points as of ${navProfile.asOfDate}; mfdata.in enrichment adds ${holdingsCount} equity holdings with ${knownHoldingAllocation.toFixed(2)}% known allocation coverage.`
    : `NAV history uses ${navProfile.dataPoints} AMFI-sourced points as of ${navProfile.asOfDate}. Non-NAV facts remain unavailable.`;

  return {
    verdict: `${fundName} is a ${classification.toLowerCase()} based on AMFI NAV history${hasStructuredEnrichment ? " plus structured mfdata.in enrichment" : ""}.`,
    alpha_engine: {
      excess_return_vs_benchmark: {
        one_year: null,
        three_year: null,
        five_year: null,
      },
      alpha_classification: "Benchmark alpha unavailable",
      alpha_consistency_note: `AMFI-sourced NAV returns: 1Y ${returns1Y ?? "N/A"}%, 3Y ${returns3Y ?? "N/A"}%, 5Y ${returns5Y ?? "N/A"}%.`,
      luck_vs_skill_assessment:
        "This is NAV-performance analysis, not manager skill attribution, because benchmark and portfolio facts are not fully verified here.",
    },
    cost_value_engine: {
      expense_ratio_assessment: costText,
      cost_efficiency_verdict:
        costScore >= 7
          ? "Low cost"
          : costScore >= 5
            ? "Reasonable cost"
            : expenseRatio === null || expenseRatio === undefined
              ? "Inconclusive due to data"
              : "Cost needs scrutiny",
    },
    portfolio_intelligence: {
      concentration_assessment: concentrationText,
      holdings_quality: fund.holdings?.length
        ? fund.holdings.slice(0, 5).map((holding) => holding.stockName)
        : ["Holdings are not available from the connected structured source."],
      sector_risk_mapping: topSectors.length ? topSectors : ["Sector allocation is unavailable."],
    },
    risk_engine: {
      volatility_context: `NAV-derived risk: ${volatilityText}; ${drawdownText}.`,
      hidden_risks: [
        "Benchmark alpha remains unavailable unless benchmark return history is connected for the exact period.",
        ...(fund.riskLevel !== "Unknown" ? [`Connected risk label: ${fund.riskLevel}.`] : []),
      ],
    },
    manager_intelligence: {
      tenure_assessment:
        fund.manager?.name || fund.fundManager
          ? `Manager shown by connected data: ${fund.manager?.name || fund.fundManager}.`
          : "Manager data is unavailable from the connected structured source.",
      alignment_with_performance:
        "Manager-performance alignment is not rated without verified manager and benchmark data.",
    },
    data_integrity_check: {
      status: hasStructuredEnrichment ? "ok" : "warning",
      message: dataMessage,
    },
    news_sentiment_layer: {
      summary: "No verified news layer available",
      signals: ["No external news layer is attached to AMFI NAV records."],
    },
    scores: {
      alpha_score: returnScore,
      risk_score: riskScore,
      cost_efficiency_score: costScore,
      trust_score: trustScore,
    },
    final_verdict: {
      classification,
      rationale: [
        "Scheme identity and NAV history are verified from AMFI-sourced data.",
        hasStructuredEnrichment
          ? "AUM, TER, risk label, ratios, and holdings are filled from mfdata.in when available for the exact AMFI scheme code."
          : "Verdict is limited to NAV trend and volatility because structured enrichment was unavailable.",
      ],
    },
    contrarian_insights: [
      "A strong NAV trend can still hide portfolio, style, liquidity, or manager-transition risk.",
    ],
    reality_check: [
      "This page refuses to fill unavailable fields from Groq; missing facts stay visible.",
    ],
    bottom_line: `${classification}: use this as a research verdict from connected data, not a standalone investment instruction.`,
  };
}

function buildStructuredEnrichmentExplanation(
  fund: RealtimeFundDetails,
  holdingsCount: number,
  knownHoldingAllocation: number,
  sectorAllocation: Array<{ sector: string; percentage: number }>,
  mfdataEnrichment: MfdataEnrichment
): AIExplanation {
  const returns1Y = fund.performance?.returns1Y ?? null;
  const returns3Y = fund.performance?.returns3Y ?? null;
  const returns5Y = fund.performance?.returns5Y ?? null;
  const returnScore = Math.max(
    scoreFromReturn(returns1Y),
    scoreFromReturn(returns3Y),
    scoreFromReturn(returns5Y)
  );
  const riskScore = scoreFromVolatility(fund.volatility);
  const expenseRatio = fund.expenseRatio;
  const costScore =
    expenseRatio === null || expenseRatio === undefined
      ? 0
      : expenseRatio <= 0.5
        ? 8
        : expenseRatio <= 1
          ? 6
          : expenseRatio <= 1.5
            ? 4
            : 2;
  const classification =
    returnScore >= 7 && riskScore >= 5 && costScore >= 5
      ? "Positive Research Candidate"
      : returnScore >= 5 && riskScore >= 4
        ? "Reasonable Research Candidate"
        : returnScore >= 3
          ? "Watch Closely"
          : "Weak Trend";
  const topSectors = sectorAllocation
    .slice(0, 3)
    .map((sector) => `${sector.sector} ${sector.percentage.toFixed(2)}%`);

  return {
    verdict: `${fund.name} is a ${classification.toLowerCase()} based on connected structured data from mfdata.in and AMFI scheme identity.`,
    alpha_engine: {
      excess_return_vs_benchmark: {
        one_year: null,
        three_year: null,
        five_year: null,
      },
      alpha_classification: "Benchmark alpha unavailable",
      alpha_consistency_note: `Connected returns: 1Y ${returns1Y ?? "N/A"}%, 3Y ${returns3Y ?? "N/A"}%, 5Y ${returns5Y ?? "N/A"}%.`,
      luck_vs_skill_assessment:
        "Return trend is shown, but manager skill is not fully attributed without benchmark return history for the same exact periods.",
    },
    cost_value_engine: {
      expense_ratio_assessment:
        expenseRatio === null || expenseRatio === undefined
          ? "Direct TER is unavailable from mfdata.in."
          : `Direct TER is ${expenseRatio.toFixed(2)}%.`,
      cost_efficiency_verdict:
        costScore >= 7 ? "Low cost" : costScore >= 5 ? "Reasonable cost" : "Cost needs scrutiny",
    },
    portfolio_intelligence: {
      concentration_assessment:
        fund.concentration === null || fund.concentration === undefined
          ? "Top-holding concentration is unavailable."
          : `Top three known holdings add up to ${fund.concentration.toFixed(2)}%.`,
      holdings_quality: fund.holdings?.length
        ? fund.holdings.slice(0, 5).map((holding) => holding.stockName)
        : ["Holdings are unavailable from the connected structured source."],
      sector_risk_mapping: topSectors.length ? topSectors : ["Sector allocation is unavailable."],
    },
    risk_engine: {
      volatility_context:
        fund.volatility === null || fund.volatility === undefined
          ? `Connected risk label: ${fund.riskLevel}. Volatility is unavailable.`
          : `Connected risk label: ${fund.riskLevel}; standard deviation is ${fund.volatility.toFixed(2)}%.`,
      hidden_risks: [
        "This verdict uses structured third-party enrichment; check the AMC factsheet before final investment action.",
        "Benchmark alpha remains unavailable until exact benchmark return history is connected.",
      ],
    },
    manager_intelligence: {
      tenure_assessment:
        fund.manager?.name || fund.fundManager
          ? `Manager shown by connected data: ${fund.manager?.name || fund.fundManager}.`
          : "Manager name is unavailable from mfdata.in for this family.",
      alignment_with_performance:
        "Manager-performance alignment is not rated without verified manager tenure and benchmark attribution.",
    },
    data_integrity_check: {
      status: "ok",
      message: `mfdata.in enrichment adds ${holdingsCount} holdings with ${knownHoldingAllocation.toFixed(2)}% known allocation coverage as of ${mfdataEnrichment.sourceDate || "the latest connected source date"}. AMFI still verifies the scheme identity and live NAV.`,
    },
    news_sentiment_layer: {
      summary: "No verified news layer available",
      signals: ["No external news layer is attached to this record."],
    },
    scores: {
      alpha_score: returnScore,
      risk_score: riskScore,
      cost_efficiency_score: costScore,
      trust_score: holdingsCount > 5 ? 7 : 6,
    },
    final_verdict: {
      classification,
      rationale: [
        "AMFI confirms the exact scheme identity, ISIN, and live NAV.",
        "mfdata.in fills AUM, TER, risk label, returns, ratios, and holdings when available for the exact AMFI code.",
      ],
    },
    contrarian_insights: [
      "A rich data page is still not a buy order; small-cap and sector exposures can swing sharply.",
    ],
    reality_check: [
      "Groq is not used to fill factual market data by default.",
    ],
    bottom_line: `${classification}: useful for research, with source labels visible for every connected data layer.`,
  };
}

// Search funds
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q, limit } = FundSearchSchema.parse(req.query);

    const verified = searchVerifiedFunds(q, limit);
    const amfi = await searchAmfiFunds(q, limit);
    const live = allowGroqFacts() ? await searchFundsFromGroq(q, limit) : [];
    const funds = [...verified, ...amfi, ...live].filter((fund, index, array) => {
      const fundKey = normalizeResultKey(fund.name);
      return array.findIndex((candidate) => normalizeResultKey(candidate.name) === fundKey) === index;
    });

    const enrichedCandidates = await Promise.all(
      funds.slice(0, limit * 2).map((fund) => enrichFundWithMarketProfile(fund))
    );
    const enrichedFunds = enrichedCandidates.filter((fund, index, array) => {
      const fundKey = fund.currentNav?.isin || normalizeResultKey(fund.name);
      return array.findIndex((candidate) => (candidate.currentNav?.isin || normalizeResultKey(candidate.name)) === fundKey) === index;
    });
    const structuredFunds = await Promise.all(
      enrichedFunds.slice(0, limit).map(async (fund) => {
        const mfdata = fund.currentNav?.schemeCode
          ? await getMfdataProfileEnrichment(fund.currentNav.schemeCode)
          : null;
        return enrichSearchFundWithMfdata(fund, mfdata);
      })
    );

    res.json(structuredFunds);
  } catch (error) {
    console.error("Search error:", error);
    res.status(400).json({ error: "Invalid search parameters" });
  }
});

// Get fund details
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const identity = resolveFundIdentity(req.params.id);
    const verifiedRecord = getVerifiedFundRecord(identity);
    const amfiOnlyFund = verifiedRecord ? null : await getAmfiOnlyFundDetails(identity);
    let fund = verifiedRecord?.details || amfiOnlyFund || (allowGroqFacts() ? await getFundDetailsFromGroq(identity) : null);

    if (!fund) {
      return res.status(404).json({ error: "Fund not found" });
    }

    const marketProfile = await getFundMarketProfile(fund.name, fund.amc);
    const mfdataEnrichment = marketProfile.currentNav?.schemeCode
      ? await getMfdataEnrichment(marketProfile.currentNav.schemeCode)
      : null;
    fund = enrichFundDetailsWithMfdata(fund, mfdataEnrichment);

    const navProfile = marketProfile.currentNav?.schemeCode
      ? await getNavPerformanceForScheme(marketProfile.currentNav.schemeCode, fund.id)
      : null;

    if (navProfile) {
      const keepExistingBenchmarkPerformance = Boolean(
        fund.performance?.benchmarkReturns1Y !== null &&
          fund.performance?.benchmarkReturns1Y !== undefined &&
          fund.performance?.benchmarkReturns3Y !== null &&
          fund.performance?.benchmarkReturns3Y !== undefined &&
          fund.performance?.benchmarkReturns5Y !== null &&
          fund.performance?.benchmarkReturns5Y !== undefined
      );

      fund = {
        ...fund,
        performance: keepExistingBenchmarkPerformance
          ? fund.performance
          : {
              ...navProfile.performance,
              benchmarkName: fund.performance?.benchmarkName || navProfile.performance.benchmarkName,
            },
        volatility: fund.volatility ?? navProfile.volatility,
        drawdown: fund.drawdown ?? navProfile.drawdown,
      };
    }

    // Calculate risk flags
    const riskFlags = calculateRiskFlags(fund);

    const topHoldings = (fund.holdings || [])
      .filter((holding) => holding.percentage !== null)
      .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
      .slice(0, 5)
      .map((holding) => ({
        stockName: holding.stockName,
        percentage: holding.percentage,
        sector: holding.sector,
      }));

    const holdingsCount = (fund.holdings || []).length;
    const knownHoldingAllocation = (fund.holdings || []).reduce(
      (sum, holding) => sum + (holding.percentage || 0),
      0
    );

    const sectorTotals = new Map<string, number>();
    (fund.holdings || []).forEach((holding) => {
      if (holding.percentage === null) {
        return;
      }

      const sector = holding.sector || "Unknown";
      sectorTotals.set(sector, (sectorTotals.get(sector) || 0) + holding.percentage);
    });

    const sectorAllocation = Array.from(sectorTotals.entries())
      .map(([sector, percentage]) => ({
        sector,
        percentage,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 8);

    const hasBenchmarkReturns = Boolean(
      fund.performance?.returns1Y !== null &&
      fund.performance?.returns1Y !== undefined &&
      fund.performance?.returns3Y !== null &&
      fund.performance?.returns3Y !== undefined &&
      fund.performance?.returns5Y !== null &&
      fund.performance?.returns5Y !== undefined &&
      fund.performance?.benchmarkReturns1Y !== null &&
      fund.performance?.benchmarkReturns1Y !== undefined &&
      fund.performance?.benchmarkReturns3Y !== null &&
      fund.performance?.benchmarkReturns3Y !== undefined &&
      fund.performance?.benchmarkReturns5Y !== null &&
      fund.performance?.benchmarkReturns5Y !== undefined
    );

    const aiExplanation =
      navProfile && !hasBenchmarkReturns
        ? buildNavPerformanceExplanation(
            fund,
            navProfile,
            holdingsCount,
            knownHoldingAllocation,
            sectorAllocation,
            mfdataEnrichment
          )
      : mfdataEnrichment && !verifiedRecord
        ? buildStructuredEnrichmentExplanation(
            fund,
            holdingsCount,
            knownHoldingAllocation,
            sectorAllocation,
            mfdataEnrichment
          )
      : amfiOnlyFund && !verifiedRecord
        ? buildExactDataUnavailableExplanation(fund.name)
        : verifiedRecord && !hasBenchmarkReturns
          ? buildVerifiedFactsheetLimitedExplanation(fund.name)
        : await generateFundExplanation(
            {
              fundName: fund.name,
              category: fund.category,
              expenseRatio: fund.expenseRatio,
              categoryAvgExpense: fund.categoryAvgExpense,
              aum: fund.aum,
              volatility: fund.volatility,
              drawdown: fund.drawdown,
              concentration: fund.concentration,
              returns1Y: fund.performance?.returns1Y || null,
              returns3Y: fund.performance?.returns3Y || null,
              returns5Y: fund.performance?.returns5Y || null,
              holdingsCount,
              knownHoldingAllocation,
              benchmarkReturns: {
                benchmarkName: fund.performance?.benchmarkName || null,
                returns1Y: fund.performance?.benchmarkReturns1Y || null,
                returns3Y: fund.performance?.benchmarkReturns3Y || null,
                returns5Y: fund.performance?.benchmarkReturns5Y || null,
              },
              consistency: fund.consistency,
              topHoldings,
              sectorAllocation,
              fundManager: {
                name: fund.manager?.name || fund.fundManager || null,
                tenureYears: fund.manager?.tenureYears || null,
                pastPerformance: fund.manager?.pastPerformance || null,
              },
              externalSignals: {
                negativeNews: fund.externalSignals?.negativeNews || [],
                sectorRisks: fund.externalSignals?.sectorRisks || [],
              },
            },
            {
              preferDeterministic: verifiedRecord?.preferDeterministicExplanation,
            }
          );

    const source = verifiedRecord?.source || {
      provider: mfdataEnrichment ? "AMFI + mfdata.in" : marketProfile.currentNav ? "AMFI" : "Unavailable",
      mode: mfdataEnrichment ? "amfi-mfdata-enriched" : marketProfile.currentNav ? "amfi-only" : "unverified",
      noFabricationPolicy: "unverified-facts-returned-as-null",
      planBasis: marketProfile.currentNav ? "Direct Plan - Growth" : undefined,
      asOfDate: mfdataEnrichment?.sourceDate || marketProfile.currentNav?.date,
      holdingsShown: fund.holdings?.length || undefined,
      totalHoldings: mfdataEnrichment?.holdings?.equity_holdings?.length || undefined,
      notes: mfdataEnrichment
        ? [
            "AMFI verifies scheme identity, ISIN, NAV, and NAV date. mfdata.in enriches AUM, TER, risk label, benchmark, ratios, and holdings when available for the exact AMFI code.",
            ...mfdataEnrichment.notes,
            "Groq is disabled as a default factual data source to prevent stale or hallucinated fund facts.",
          ]
        : [
            "AMFI verifies scheme identity, ISIN, NAV, and NAV date. It does not provide AUM, TER, manager, holdings, or returns.",
            "Groq is disabled as a default factual data source to prevent stale or hallucinated fund facts.",
          ],
    };

    res.json({
      ...fund,
      riskFlags,
      aiExplanation,
      alternatives: fund.alternatives,
      currentNav: marketProfile.currentNav,
      purchaseLinks: marketProfile.purchaseLinks,
      source: {
        ...source,
        navProvider: marketProfile.currentNav ? "AMFI" : undefined,
        navAsOfDate: marketProfile.currentNav?.date,
        navHistoryProvider: navProfile ? "MFapi / AMFI NAV history" : undefined,
        navHistoryAsOfDate: navProfile?.asOfDate,
      },
    });
  } catch (error) {
    console.error("Fund detail error:", error);
    res.status(500).json({ error: "Failed to fetch fund details" });
  }
});

// Compare funds
router.post("/compare", async (req: Request, res: Response) => {
  try {
    const { fundIds } = req.body;

    if (!Array.isArray(fundIds) || fundIds.length < 2) {
      return res.status(400).json({ error: "At least 2 fund IDs required" });
    }

    const identities = fundIds.slice(0, 3).map((id: string) => resolveFundIdentity(id));
    const resolved = await Promise.all(
      identities.map((identity) => {
        const verifiedRecord = getVerifiedFundRecord(identity);
        return verifiedRecord?.details || getAmfiOnlyFundDetails(identity);
      })
    );
    const funds = resolved.filter((fund): fund is RealtimeFundDetails => fund !== null);

    if (funds.length < 2) {
      return res.status(404).json({ error: "Funds not found" });
    }

    const comparison =
      "Comparison uses only verified facts available in this app. Any missing metric is intentionally shown as N/A instead of being inferred.";

    const enrichedFunds = await Promise.all(
      funds.map(async (f) => {
        const marketProfile = await getFundMarketProfile(f.name, f.amc);
        const mfdataEnrichment = marketProfile.currentNav?.schemeCode
          ? await getMfdataEnrichment(marketProfile.currentNav.schemeCode)
          : null;
        const navProfile = marketProfile.currentNav?.schemeCode
          ? await getNavPerformanceForScheme(marketProfile.currentNav.schemeCode, f.id)
          : null;
        let details = enrichFundDetailsWithMfdata(f, mfdataEnrichment);

        if (navProfile) {
          const keepExistingBenchmarkPerformance = Boolean(
            details.performance?.benchmarkReturns1Y !== null &&
              details.performance?.benchmarkReturns1Y !== undefined &&
              details.performance?.benchmarkReturns3Y !== null &&
              details.performance?.benchmarkReturns3Y !== undefined &&
              details.performance?.benchmarkReturns5Y !== null &&
              details.performance?.benchmarkReturns5Y !== undefined
          );

          details = {
            ...details,
            performance: keepExistingBenchmarkPerformance
              ? details.performance
              : {
                  ...navProfile.performance,
                  benchmarkName: details.performance?.benchmarkName || navProfile.performance.benchmarkName,
                },
            volatility: details.volatility ?? navProfile.volatility,
          };
        }

        return enrichFundWithMarketProfile({
          id: details.id,
          name: details.name,
          amc: details.amc,
          expenseRatio: details.expenseRatio,
          returns1Y: details.performance?.returns1Y,
          returns3Y: details.performance?.returns3Y,
          returns5Y: details.performance?.returns5Y,
          volatility: details.volatility,
          riskLevel: details.riskLevel,
        });
      })
    );

    res.json({
      funds: enrichedFunds,
      comparison,
      source: {
        provider: "Verified registry + AMFI",
        mode: "verified-facts-only",
      },
    });
  } catch (error) {
    console.error("Comparison error:", error);
    res.status(500).json({ error: "Failed to compare funds" });
  }
});

export default router;
