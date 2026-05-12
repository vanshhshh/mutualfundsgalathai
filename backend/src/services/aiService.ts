import Groq from "groq-sdk";
import { z } from "zod";
import { AIExplanation } from "../types";

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const scoreValueSchema = z.preprocess((value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 5;
  }

  return Math.min(10, Math.max(0, numeric));
}, z.number().min(0).max(10));

const InstitutionalAuditSchema = z.object({
  verdict: z.string().min(1),
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
    alpha_score: scoreValueSchema,
    risk_score: scoreValueSchema,
    cost_efficiency_score: scoreValueSchema,
    trust_score: scoreValueSchema,
  }),
  final_verdict: z.object({
    classification: z.string(),
    rationale: z.array(z.string()).min(1),
  }),
  contrarian_insights: z.array(z.string()).min(1),
  reality_check: z.array(z.string()).min(1),
  bottom_line: z.string().min(1),
});

let groqClient: Groq | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function currentDateLabel(): string {
  return new Date().toISOString().slice(0, 10);
}

function getGroqClient(): Groq | null {
  if (groqClient) {
    return groqClient;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }

  groqClient = new Groq({
    apiKey,
  });

  return groqClient;
}

export interface AIExplanationInput {
  fundName: string;
  category: string;
  expenseRatio: number | null;
  categoryAvgExpense: number | null;
  aum: number | null;
  volatility: number | null;
  drawdown: number | null;
  concentration: number | null;
  returns1Y: number | null;
  returns3Y: number | null;
  returns5Y: number | null;
  holdingsCount: number;
  knownHoldingAllocation: number;
  benchmarkReturns: {
    benchmarkName: string | null;
    returns1Y: number | null;
    returns3Y: number | null;
    returns5Y: number | null;
  };
  consistency: number | null;
  topHoldings: Array<{
    stockName: string;
    percentage: number | null;
    sector: string | null;
  }>;
  sectorAllocation: Array<{
    sector: string;
    percentage: number;
  }>;
  fundManager: {
    name: string | null;
    tenureYears: number | null;
    pastPerformance: string | null;
  };
  externalSignals: {
    negativeNews: string[];
    sectorRisks: string[];
  };
}

type CategoryIntelligenceMode = "arbitrage" | "equity" | "debt" | "other";

function detectCategoryIntelligenceMode(category: string): CategoryIntelligenceMode {
  const normalized = category.toLowerCase();

  if (normalized.includes("arbitrage")) {
    return "arbitrage";
  }

  if (
    normalized.includes("debt") ||
    normalized.includes("bond") ||
    normalized.includes("gilt") ||
    normalized.includes("liquid") ||
    normalized.includes("money market") ||
    normalized.includes("overnight") ||
    normalized.includes("income") ||
    normalized.includes("duration") ||
    normalized.includes("credit risk")
  ) {
    return "debt";
  }

  if (
    normalized.includes("equity") ||
    normalized.includes("elss") ||
    normalized.includes("large cap") ||
    normalized.includes("mid cap") ||
    normalized.includes("small cap") ||
    normalized.includes("flexi cap") ||
    normalized.includes("multi cap") ||
    normalized.includes("focused") ||
    normalized.includes("value") ||
    normalized.includes("contra") ||
    normalized.includes("thematic") ||
    normalized.includes("sectoral") ||
    normalized.includes("index")
  ) {
    return "equity";
  }

  return "other";
}

function getCategoryIntelligenceInstructions(
  mode: CategoryIntelligenceMode,
  rawCategory: string
): string {
  if (mode === "arbitrage") {
    return `Detected Mode: Arbitrage Fund (from category: ${rawCategory})
- Ignore stock concentration and sector allocation as primary risk flags unless there is direct spread-book evidence.
- Focus on return consistency, expense ratio versus arbitrage peers, and spread stability/execution quality.
- Expected profile is low return (roughly 4-7%) and very low volatility.
- Do NOT label low absolute return as weak alpha for arbitrage if consistency and peer-relative value are intact.`;
  }

  if (mode === "debt") {
    return `Detected Mode: Debt Fund (from category: ${rawCategory})
- Focus on credit risk, duration risk, and interest-rate sensitivity as primary lenses.
- Avoid equity-style portfolio concentration commentary unless debt concentration data clearly supports it.
- If credit quality or duration data is missing, explicitly mark that as unavailable and reduce trust.`;
  }

  if (mode === "equity") {
    return `Detected Mode: Equity Fund (from category: ${rawCategory})
- Apply full alpha, portfolio, concentration, and sector-risk analysis as primary decision lenses.`;
  }

  return `Detected Mode: Other / Mixed (from category: ${rawCategory})
- Infer the closest valid lens from available evidence.
- Explicitly disclose any category ambiguity and avoid category-specific assumptions not supported by data.`;
}

function appendUnique(items: string[], line: string): string[] {
  if (items.some((item) => item.trim().toLowerCase() === line.trim().toLowerCase())) {
    return items;
  }

  return [...items, line];
}

function normalizeSentence(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeBulletList(items: string[], fallback: string): string[] {
  const cleaned = items
    .map((item) => normalizeSentence(item))
    .filter(Boolean);

  return cleaned.length ? cleaned : [fallback];
}

function applyCategoryIntelligenceGuardrails(
  explanation: AIExplanation,
  mode: CategoryIntelligenceMode
): AIExplanation {
  if (mode === "arbitrage") {
    return {
      ...explanation,
      alpha_engine: {
        ...explanation.alpha_engine,
        alpha_consistency_note: `${explanation.alpha_engine.alpha_consistency_note} Category-adjusted: arbitrage funds are judged by consistency and spread capture, not equity-style absolute returns.`,
      },
      portfolio_intelligence: {
        ...explanation.portfolio_intelligence,
        concentration_assessment:
          "Category-adjusted: stock and sector concentration are not primary risk signals for arbitrage funds unless spread-book concentration evidence is explicit.",
        sector_risk_mapping: appendUnique(
          explanation.portfolio_intelligence.sector_risk_mapping,
          "Category-adjusted: sector allocation concerns are secondary in arbitrage; spread stability is the core risk."
        ),
      },
      risk_engine: {
        ...explanation.risk_engine,
        hidden_risks: appendUnique(
          explanation.risk_engine.hidden_risks,
          "Primary arbitrage risk is spread instability and execution slippage, not broad sector direction."
        ),
      },
    };
  }

  if (mode === "debt") {
    let hiddenRisks = explanation.risk_engine.hidden_risks;
    hiddenRisks = appendUnique(
      hiddenRisks,
      "Debt-fund priority risk: credit deterioration in underlying issuers can impair capital stability."
    );
    hiddenRisks = appendUnique(
      hiddenRisks,
      "Debt-fund priority risk: duration positioning drives sensitivity to policy-rate and yield-curve moves."
    );
    hiddenRisks = appendUnique(
      hiddenRisks,
      "Debt-fund priority risk: interest-rate regime shifts can compress mark-to-market returns."
    );

    return {
      ...explanation,
      portfolio_intelligence: {
        ...explanation.portfolio_intelligence,
        concentration_assessment:
          "Category-adjusted: debt funds should be judged primarily by credit and duration structure rather than equity-style stock concentration.",
      },
      risk_engine: {
        ...explanation.risk_engine,
        hidden_risks: hiddenRisks,
      },
    };
  }

  if (mode === "equity") {
    return {
      ...explanation,
      alpha_engine: {
        ...explanation.alpha_engine,
        alpha_consistency_note: `${explanation.alpha_engine.alpha_consistency_note} Category-adjusted: full equity alpha and portfolio structure lenses applied.`,
      },
    };
  }

  return explanation;
}

function formatNullableNumber(
  value: number | null,
  decimals: number = 2,
  suffix: string = ""
): string {
  if (value === null) {
    return "Unknown";
  }

  return `${value.toFixed(decimals)}${suffix}`;
}

function formatList(values: string[]): string {
  if (!values.length) {
    return "Unknown";
  }

  return values.join("; ");
}

function formatTopHoldings(
  holdings: Array<{ stockName: string; percentage: number | null; sector: string | null }>
): string {
  if (!holdings.length) {
    return "Unknown";
  }

  return holdings
    .map(
      (holding) =>
        `${holding.stockName} (${formatNullableNumber(holding.percentage, 2, "%")}, sector: ${holding.sector || "Unknown"})`
    )
    .join("; ");
}

function formatSectorAllocation(
  sectorAllocation: Array<{ sector: string; percentage: number }>
): string {
  if (!sectorAllocation.length) {
    return "Unknown";
  }

  return sectorAllocation
    .map((sector) => `${sector.sector}: ${sector.percentage.toFixed(2)}%`)
    .join("; ");
}

function calculateExcessReturn(
  fundReturn: number | null,
  benchmarkReturn: number | null
): number | null {
  if (fundReturn === null || benchmarkReturn === null) {
    return null;
  }

  return Number((fundReturn - benchmarkReturn).toFixed(2));
}

function calculateAverage(values: Array<number | null>): number | null {
  const present = values.filter((value): value is number => value !== null);
  if (!present.length) {
    return null;
  }

  const total = present.reduce((sum, value) => sum + value, 0);
  return Number((total / present.length).toFixed(2));
}

function buildHeuristicFallback(
  input: AIExplanationInput,
  categoryMode: CategoryIntelligenceMode
): AIExplanation {
  const excess1Y = calculateExcessReturn(input.returns1Y, input.benchmarkReturns.returns1Y);
  const excess3Y = calculateExcessReturn(input.returns3Y, input.benchmarkReturns.returns3Y);
  const excess5Y = calculateExcessReturn(input.returns5Y, input.benchmarkReturns.returns5Y);
  const averageExcess = calculateAverage([excess1Y, excess3Y, excess5Y]);
  const costDelta =
    input.expenseRatio !== null && input.categoryAvgExpense !== null
      ? Number((input.expenseRatio - input.categoryAvgExpense).toFixed(2))
      : null;
  const knownCoverage = Number(input.knownHoldingAllocation.toFixed(2));
  const hasThinPortfolioData = input.holdingsCount < 3 || knownCoverage < 20;

  const alphaClassification =
    averageExcess === null
      ? "Insufficient data"
      : averageExcess >= 1
        ? "Strong alpha"
        : averageExcess >= 0.2
          ? "Moderate alpha"
          : averageExcess > -0.5
            ? "Weak alpha"
            : "No alpha";

  const alphaScore =
    averageExcess === null
      ? 4
      : averageExcess >= 1
        ? 8
        : averageExcess >= 0.2
          ? 6
          : averageExcess > -0.5
            ? 5
            : 3;

  const costScore =
    costDelta === null ? 5 : costDelta <= 0 ? 8 : costDelta <= 0.15 ? 6 : 4;

  const riskScoreBase =
    input.volatility === null ? 5 : input.volatility < 8 ? 8 : input.volatility < 15 ? 6 : 4;

  const riskScore =
    categoryMode === "debt" && input.volatility !== null && input.volatility < 5
      ? Math.min(9, riskScoreBase + 1)
      : riskScoreBase;

  const trustBase = input.fundManager.tenureYears !== null && input.fundManager.tenureYears >= 5 ? 7 : 5;
  const trustScore = Math.max(3, trustBase - (hasThinPortfolioData ? 2 : 0));

  const dataIntegrityStatus = hasThinPortfolioData ? "warning" : "ok";
  const dataIntegrityMessage = hasThinPortfolioData
    ? "Analysis uses partial portfolio data, so structure-level conclusions should be treated cautiously."
    : "Available holdings and performance inputs are coherent enough for a directional review.";

  const categorySpecificRisk =
    categoryMode === "arbitrage"
      ? "Spread compression and execution slippage matter more here than stock-level narratives."
      : categoryMode === "debt"
        ? "Duration and credit quality are the first risks to monitor, even when headline volatility is low."
        : "Concentration and benchmark-relative consistency matter more than one strong trailing period.";

  const noNegativeSignals = input.externalSignals.negativeNews.length === 0;

  return applyCategoryIntelligenceGuardrails(
    {
      verdict: normalizeSentence(
        categoryMode === "arbitrage"
          ? "This arbitrage fund should be judged on spread capture discipline, and the biggest limitation right now is incomplete structural disclosure."
          : categoryMode === "debt"
            ? "This debt-fund review is directionally useful, but missing spread-book detail limits conviction on credit and duration quality."
            : averageExcess !== null && averageExcess >= 0
              ? "The fund looks directionally competitive, but conviction is capped by incomplete structure-level evidence."
              : "The fund is not beating its benchmark decisively enough to ignore the current data gaps."
      ),
      alpha_engine: {
        excess_return_vs_benchmark: {
          one_year: excess1Y,
          three_year: excess3Y,
          five_year: excess5Y,
        },
        alpha_classification: alphaClassification,
        alpha_consistency_note: normalizeSentence(
          categoryMode === "arbitrage"
            ? "Peer-relative spread capture appears steady across the available periods."
            : averageExcess === null
              ? "Benchmark-relative return evidence is incomplete."
              : `Benchmark-relative return pattern is ${averageExcess >= 0 ? "positive" : "soft"} across the available timeframes.`
        ),
        luck_vs_skill_assessment: normalizeSentence(
          excess1Y !== null &&
          excess3Y !== null &&
          Math.sign(excess1Y) === Math.sign(excess3Y)
            ? "Available return windows point more to repeatable process than a one-off burst."
            : "Timeframe evidence is mixed, so skill cannot be separated cleanly from cycle effects."
        ),
      },
      cost_value_engine: {
        expense_ratio_assessment: normalizeSentence(
          costDelta === null
            ? "Peer cost context is incomplete."
            : costDelta <= 0
              ? "Expense ratio is at or below category average, which helps the value case."
              : `Expense ratio sits ${costDelta.toFixed(2)}% above category average, so execution quality has to justify the premium.`
        ),
        cost_efficiency_verdict:
          costDelta === null
            ? "Inconclusive due to data"
            : costDelta <= 0.15
              ? "Justified cost"
              : "Overpaying for mediocre alpha",
      },
      portfolio_intelligence: {
        concentration_assessment: normalizeSentence(
          input.concentration === null
            ? "Portfolio concentration could not be fully verified."
            : input.concentration > 40
              ? `Top holdings concentration at ${input.concentration.toFixed(2)}% is elevated and deserves active monitoring.`
              : `Top holdings concentration at ${input.concentration.toFixed(2)}% is within a manageable range for the stated category.`
        ),
        holdings_quality: normalizeBulletList(
          input.topHoldings.map((holding) => `${holding.stockName} carries visible weight in the portfolio.`),
          "Holdings disclosure is too thin for a strong quality call."
        ),
        sector_risk_mapping: normalizeBulletList(
          input.externalSignals.sectorRisks,
          categorySpecificRisk
        ),
      },
      risk_engine: {
        volatility_context: normalizeSentence(
          input.volatility === null
            ? "Volatility data is unavailable, so risk has to be inferred from category and return profile."
            : `Reported volatility at ${input.volatility.toFixed(2)}% is ${input.volatility < 8 ? "low" : input.volatility < 15 ? "moderate" : "high"} for this setup.`
        ),
        hidden_risks: normalizeBulletList(
          [
            hasThinPortfolioData ? "Portfolio disclosure is thin enough to weaken structural confidence." : "",
            categorySpecificRisk,
            ...input.externalSignals.negativeNews,
          ],
          "No additional hidden risk was confirmed beyond normal category behavior."
        ),
      },
      manager_intelligence: {
        tenure_assessment: normalizeSentence(
          input.fundManager.tenureYears === null
            ? "Manager tenure could not be verified."
            : input.fundManager.tenureYears > 5
              ? `Manager tenure of ${input.fundManager.tenureYears.toFixed(1)} years adds credibility.`
              : `Manager tenure of ${input.fundManager.tenureYears.toFixed(1)} years is still building a full-cycle record.`
        ),
        alignment_with_performance: normalizeSentence(
          input.fundManager.pastPerformance || "A strong tenure-to-outcome link could not be fully validated."
        ),
      },
      data_integrity_check: {
        status: dataIntegrityStatus,
        message: dataIntegrityMessage,
      },
      news_sentiment_layer: {
        summary: noNegativeSignals
          ? "No significant negative signals detected"
          : "Some external negatives deserve monitoring.",
        signals: noNegativeSignals
          ? ["No significant negative signals detected"]
          : normalizeBulletList(
              input.externalSignals.negativeNews,
              "No significant negative signals detected"
            ),
      },
      scores: {
        alpha_score: alphaScore,
        risk_score: riskScore,
        cost_efficiency_score: costScore,
        trust_score: trustScore,
      },
      final_verdict: {
        classification:
          averageExcess !== null && averageExcess >= 0.5 && costScore >= 6 && trustScore >= 6
            ? "Selective Buy"
            : "Hold / Neutral",
        rationale: normalizeBulletList(
          [
            averageExcess !== null && averageExcess >= 0
              ? "Available benchmark-relative return data is acceptable."
              : "Benchmark-relative return profile is not compelling.",
            costDelta !== null && costDelta <= 0 ? "Cost discipline helps the case." : "",
            hasThinPortfolioData
              ? "Incomplete portfolio disclosure reduces conviction."
              : "Current data quality is usable for a directional call.",
          ],
          "Evidence is mixed."
        ),
      },
      contrarian_insights: normalizeBulletList(
        [
          categorySpecificRisk,
          averageExcess !== null && averageExcess >= 0 && costDelta !== null && costDelta <= 0
            ? "Cost control can matter as much as flashy short-term returns."
            : "",
        ],
        "The biggest edge often comes from avoiding category-misread risk."
      ),
      reality_check: normalizeBulletList(
        [
          "This review falls back to deterministic logic when the AI response is rate-limited or malformed.",
          hasThinPortfolioData ? "Thin holdings data limits structure-level confidence." : "",
        ],
        "Model and data quality both limit precision."
      ),
      bottom_line: normalizeSentence(
        categoryMode === "debt"
          ? "Reasonable for investors who want lower-volatility debt exposure, but conviction should rise only with clearer credit and duration transparency."
          : categoryMode === "arbitrage"
            ? "Useful mainly for low-volatility cash-parking style allocations, provided you accept that spread-book detail is still sparse."
            : averageExcess !== null && averageExcess >= 0
              ? "Worth considering if you are comfortable with the category-specific risks and the current level of disclosure."
              : "Not a strong fresh-buy case until benchmark-relative execution or disclosure quality improves."
      ),
    },
    categoryMode
  );
}

export async function generateFundExplanation(
  input: AIExplanationInput,
  options?: { preferDeterministic?: boolean }
): Promise<AIExplanation> {
  const groq = getGroqClient();
  const categoryMode = detectCategoryIntelligenceMode(input.category);
  const fallback = buildHeuristicFallback(input, categoryMode);

  if (options?.preferDeterministic) {
    return fallback;
  }

  if (!groq) {
    return fallback;
  }

  const benchmarkText = `Benchmark Name: ${input.benchmarkReturns.benchmarkName || "Unknown"}; 1Y: ${formatNullableNumber(
    input.benchmarkReturns.returns1Y,
    2,
    "%"
  )}; 3Y: ${formatNullableNumber(input.benchmarkReturns.returns3Y, 2, "%")}; 5Y: ${formatNullableNumber(
    input.benchmarkReturns.returns5Y,
    2,
    "%"
  )}`;

  const excess1Y = calculateExcessReturn(input.returns1Y, input.benchmarkReturns.returns1Y);
  const excess3Y = calculateExcessReturn(input.returns3Y, input.benchmarkReturns.returns3Y);
  const excess5Y = calculateExcessReturn(input.returns5Y, input.benchmarkReturns.returns5Y);
  const expensePremium =
    input.expenseRatio !== null && input.categoryAvgExpense !== null
      ? Number((input.expenseRatio - input.categoryAvgExpense).toFixed(2))
      : null;
  const categoryInstructions = getCategoryIntelligenceInstructions(categoryMode, input.category);

  const prompt = `You are a top-tier buy-side fund analyst + risk officer. Your job is NOT to describe a mutual fund - your job is to audit it, challenge it, and expose hidden strengths and risks using institutional-grade reasoning.

Analysis date: ${currentDateLabel()}.

You must behave like capital is at stake.

---

# STRICT RULES

- No generic statements.
- No fear-mongering without evidence.
- No blind trust in input data - verify logically.
- Do not imply any metric is newer than the input/source date. If freshness is unclear, call that out as a data limitation.
- Always reason in relative terms versus benchmark and category.
- If something is normal, explicitly state it is normal.
- If something is wrong, explicitly call it out.
- Prefer insight over description.

---

# CATEGORY INTELLIGENCE

${categoryInstructions}

- If category context is ignored, analysis is invalid.
- Every engine and score must reflect the detected category lens.

---

# INPUT DATA

- Fund name: ${input.fundName}
- Category: ${input.category}
- Expense ratio: ${formatNullableNumber(input.expenseRatio, 2, "%")}
- Category average expense: ${formatNullableNumber(input.categoryAvgExpense, 2, "%")}
- AUM: ${formatNullableNumber(input.aum, 2)}
- Returns 1Y: ${formatNullableNumber(input.returns1Y, 2, "%")}
- Returns 3Y: ${formatNullableNumber(input.returns3Y, 2, "%")}
- Returns 5Y: ${formatNullableNumber(input.returns5Y, 2, "%")}
- Benchmark returns: ${benchmarkText}
- Volatility: ${formatNullableNumber(input.volatility, 2, "%")}
- Drawdown: ${formatNullableNumber(input.drawdown, 2, "%")}
- Top holdings: ${formatTopHoldings(input.topHoldings)}
- Top 3 concentration: ${formatNullableNumber(input.concentration, 2, "%")}
- Sector allocation: ${formatSectorAllocation(input.sectorAllocation)}
- Fund manager: ${input.fundManager.name || "Unknown"}
- Tenure: ${formatNullableNumber(input.fundManager.tenureYears, 2, " years")}
- Manager past performance: ${input.fundManager.pastPerformance || "Unknown"}
- Negative news: ${formatList(input.externalSignals.negativeNews)}
- Sector risks: ${formatList(input.externalSignals.sectorRisks)}

# PRE-COMPUTED REFERENCE METRICS

- Excess return vs benchmark (1Y): ${formatNullableNumber(excess1Y, 2, "%")}
- Excess return vs benchmark (3Y): ${formatNullableNumber(excess3Y, 2, "%")}
- Excess return vs benchmark (5Y): ${formatNullableNumber(excess5Y, 2, "%")}
- Expense premium vs category: ${formatNullableNumber(expensePremium, 2, "%")}
- Holdings count available: ${input.holdingsCount}
- Known holding allocation coverage: ${input.knownHoldingAllocation.toFixed(2)}%

---

# ANALYSIS ENGINE REQUIREMENTS

1) Alpha engine
- Compare returns versus benchmark across timeframes.
- Classify alpha as one of: Strong alpha, Moderate alpha, Weak alpha, No alpha, Insufficient data.
- Distinguish luck versus skill using timeframe consistency.

2) Cost versus value engine
- Judge whether cost is justified relative to benchmark outperformance and consistency.

3) Portfolio intelligence engine
- Top 3 concentration thresholds:
  - <25% = low
  - 25-40% = normal
  - >40% = high
- Do not flag normal concentration as risk.
- Evaluate holdings quality and whether sector exposure is a macro bet disguised as diversification.

4) Risk engine
- Volatility thresholds:
  - <12% = low
  - 12-18% = normal
  - >18% = high
- No generic market-risk statements unless explicitly tied to structure.

5) Manager intelligence
- Tenure bands:
  - <3 years = unproven
  - 3-5 years = developing
  - >5 years = credible

6) Data integrity check
- If holdings count is too low or allocations are inconsistent, set a warning and explain why.

7) News and sentiment layer
- If no significant negatives exist, say exactly: "No significant negative signals detected".

---

# OUTPUT FORMAT

{
  "verdict": "One sharp sentence summarizing the biggest institutional concern",
  "alpha_engine": {
    "excess_return_vs_benchmark": {"one_year": number or null, "three_year": number or null, "five_year": number or null},
    "alpha_classification": "Strong alpha|Moderate alpha|Weak alpha|No alpha|Insufficient data",
    "alpha_consistency_note": "Short analytical line",
    "luck_vs_skill_assessment": "Short analytical line"
  },
  "cost_value_engine": {
    "expense_ratio_assessment": "Short analytical line",
    "cost_efficiency_verdict": "Justified cost|Overpaying for mediocre alpha|Inconclusive due to data"
  },
  "portfolio_intelligence": {
    "concentration_assessment": "Short analytical line",
    "holdings_quality": ["item 1", "item 2"],
    "sector_risk_mapping": ["item 1", "item 2"]
  },
  "risk_engine": {
    "volatility_context": "Short analytical line",
    "hidden_risks": ["item 1", "item 2"]
  },
  "manager_intelligence": {
    "tenure_assessment": "Short analytical line",
    "alignment_with_performance": "Short analytical line"
  },
  "data_integrity_check": {
    "status": "ok|warning",
    "message": "Short line"
  },
  "news_sentiment_layer": {
    "summary": "Short line",
    "signals": ["item 1", "item 2"]
  },
  "scores": {
    "alpha_score": 0-10,
    "risk_score": 0-10,
    "cost_efficiency_score": 0-10,
    "trust_score": 0-10
  },
  "final_verdict": {
    "classification": "High Conviction Buy|Selective Buy|Hold / Neutral|Avoid",
    "rationale": ["line 1", "line 2"]
  },
  "contrarian_insights": ["insight 1", "insight 2"],
  "reality_check": ["limitation 1", "limitation 2"],
  "bottom_line": "Clear, blunt conclusion about who should avoid or consider this fund"
}

Return raw JSON only.`;

  try {
    let content = "{}";

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await groq.chat.completions.create({
          model: GROQ_MODEL,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 1100,
        });

        content = response.choices[0]?.message?.content || "{}";
        break;
      } catch (error: any) {
        const retryAfterHeader = error?.headers?.get?.("retry-after");
        const retryAfterSeconds = Number(retryAfterHeader);
        const shouldRetry = error?.status === 429 && attempt < 2;

        if (!shouldRetry) {
          throw error;
        }

        const waitMs = Number.isFinite(retryAfterSeconds)
          ? Math.max(1000, retryAfterSeconds * 1000)
          : 1500 * (attempt + 1);

        await sleep(waitMs);
      }
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON response from Groq");
    }

    const parsed = InstitutionalAuditSchema.safeParse(JSON.parse(jsonMatch[0]));
    if (!parsed.success) {
      throw new Error("Groq critical analysis failed schema validation");
    }

    return applyCategoryIntelligenceGuardrails(parsed.data, categoryMode);
  } catch (error) {
    console.error("Error generating explanation:", error);
    return fallback;
  }
}

export async function generateComparison(
  fund1Name: string,
  fund1Data: {
    expenseRatio: number | null;
    returns1Y: number | null;
    volatility: number | null;
  },
  fund2Name: string,
  fund2Data: {
    expenseRatio: number | null;
    returns1Y: number | null;
    volatility: number | null;
  }
): Promise<string> {
  const groq = getGroqClient();
  if (!groq) {
    return "AI comparison is unavailable; compare expense ratio, returns, and volatility directly.";
  }

  const prompt = `Compare these two mutual funds briefly.

Analysis date: ${currentDateLabel()}. Do not imply any metric is newer than the supplied data.

Fund 1: ${fund1Name}
- Expense: ${formatNullableNumber(fund1Data.expenseRatio, 2, "%")}
- 1Y Return: ${formatNullableNumber(fund1Data.returns1Y, 2, "%")}
- Volatility: ${formatNullableNumber(fund1Data.volatility, 2, "%")}

Fund 2: ${fund2Name}
- Expense: ${formatNullableNumber(fund2Data.expenseRatio, 2, "%")}
- 1Y Return: ${formatNullableNumber(fund2Data.returns1Y, 2, "%")}
- Volatility: ${formatNullableNumber(fund2Data.volatility, 2, "%")}

Provide a 2-3 sentence comparison highlighting key differences. Focus on which is better for whom and why. Be direct and avoid jargon.`;

  try {
    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error generating comparison:", error);
    return "Comparison unable to be generated at this time.";
  }
}
