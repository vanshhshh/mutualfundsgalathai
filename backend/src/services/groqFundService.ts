import Groq from "groq-sdk";
import { z } from "zod";
import { determineRiskLevel } from "./fundService";

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const nullableNumber = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === "unknown" || trimmed.toLowerCase() === "n/a") {
      return null;
    }

    const parsed = Number(trimmed.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  return null;
}, z.number().nullable());

const nullableString = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === "unknown" || trimmed.toLowerCase() === "n/a") {
      return null;
    }

    return trimmed;
  }

  return null;
}, z.string().nullable());

const SearchFundSchema = z.object({
  name: nullableString.default(null),
  category: nullableString.default(null),
  amc: nullableString.default(null),
  fundManager: nullableString.default(null),
  aum: nullableNumber.default(null),
  expenseRatio: nullableNumber.default(null),
  categoryAvgExpense: nullableNumber.default(null),
  volatility: nullableNumber.default(null),
  concentration: nullableNumber.default(null),
  consistency: nullableNumber.default(null),
});

const SearchResponseSchema = z.object({
  funds: z.array(SearchFundSchema).default([]),
});

const HoldingSchema = z.object({
  stockName: nullableString.default(null),
  companyName: nullableString.default(null),
  sector: nullableString.default(null),
  percentage: nullableNumber.default(null),
});

const AlternativeSchema = z.object({
  name: nullableString.default(null),
  amc: nullableString.default(null),
  reason: nullableString.default(null),
  expenseRatio: nullableNumber.default(null),
  returns1Y: nullableNumber.default(null),
});

const ManagerSchema = z.object({
  name: nullableString.default(null),
  tenureYears: nullableNumber.default(null),
  pastPerformance: nullableString.default(null),
});

const ExternalSignalsSchema = z.object({
  negativeNews: z.array(z.string()).default([]),
  sectorRisks: z.array(z.string()).default([]),
});

const DetailResponseSchema = z.object({
  name: z.string().min(2),
  category: nullableString.default(null),
  amc: nullableString.default(null),
  fundManager: nullableString.default(null),
  aum: nullableNumber.default(null),
  expenseRatio: nullableNumber.default(null),
  categoryAvgExpense: nullableNumber.default(null),
  volatility: nullableNumber.default(null),
  drawdown: nullableNumber.default(null),
  concentration: nullableNumber.default(null),
  consistency: nullableNumber.default(null),
  manager: ManagerSchema.optional(),
  externalSignals: ExternalSignalsSchema.optional(),
  performance: z
    .object({
      returns1Y: nullableNumber.default(null),
      returns3Y: nullableNumber.default(null),
      returns5Y: nullableNumber.default(null),
      returnsYTD: nullableNumber.default(null),
      benchmarkReturns1Y: nullableNumber.default(null),
      benchmarkReturns3Y: nullableNumber.default(null),
      benchmarkReturns5Y: nullableNumber.default(null),
      benchmarkName: nullableString.default(null),
    })
    .optional(),
  holdings: z.array(HoldingSchema).default([]).catch([]),
  alternatives: z.array(AlternativeSchema).default([]).catch([]),
});

export interface RealtimeFund {
  id: string;
  name: string;
  category: string;
  amc: string;
  fundManager: string | null;
  aum: number | null;
  expenseRatio: number | null;
  categoryAvgExpense: number | null;
  volatility: number | null;
  drawdown: number | null;
  concentration: number | null;
  consistency: number | null;
  riskLevel: string;
}

export interface RealtimeManager {
  name: string | null;
  tenureYears: number | null;
  pastPerformance: string | null;
}

export interface RealtimeExternalSignals {
  negativeNews: string[];
  sectorRisks: string[];
}

export interface RealtimePerformance {
  id: string;
  fundId: string;
  returns1Y: number | null;
  returns3Y: number | null;
  returns5Y: number | null;
  returnsYTD: number | null;
  benchmarkReturns1Y: number | null;
  benchmarkReturns3Y: number | null;
  benchmarkReturns5Y: number | null;
  benchmarkName: string;
}

export interface RealtimeHolding {
  id: string;
  fundId: string;
  stockName: string;
  companyName: string | null;
  sector: string | null;
  percentage: number | null;
}

export interface RealtimeAlternative {
  id: string;
  name: string;
  reason: string;
  expenseRatio: number | null;
  returns1Y: number | null;
}

export interface RealtimeFundDetails extends RealtimeFund {
  performance?: RealtimePerformance;
  holdings: RealtimeHolding[];
  alternatives: RealtimeAlternative[];
  manager: RealtimeManager;
  externalSignals: RealtimeExternalSignals;
}

interface FundIdentity {
  name: string;
  amc?: string;
}

let groqClient: Groq | null = null;

function getGroqClient(): Groq | null {
  if (groqClient) {
    return groqClient;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }

  groqClient = new Groq({ apiKey });
  return groqClient;
}

function normalizeText(value: string | null | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function parseJsonBlock(content: string): unknown {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Groq response did not contain a JSON object");
  }

  return JSON.parse(jsonMatch[0]);
}

function buildFundId(name: string, amc: string): string {
  return Buffer.from(`${name}::${amc}`, "utf8").toString("base64url");
}

function currentDateLabel(): string {
  return new Date().toISOString().slice(0, 10);
}

function decodeFundId(id: string): FundIdentity | null {
  try {
    const decoded = Buffer.from(id, "base64url").toString("utf8");
    if (!decoded.includes("::")) {
      return null;
    }

    const [name, amc] = decoded.split("::");
    if (!name || !name.trim()) {
      return null;
    }

    return {
      name: name.trim(),
      amc: amc?.trim() || undefined,
    };
  } catch {
    return null;
  }
}

function normalizeFund(fund: z.infer<typeof SearchFundSchema>): RealtimeFund {
  const name = normalizeText(fund.name, "Unknown Fund");
  const amc = normalizeText(fund.amc, "Unknown AMC");
  const category = normalizeText(fund.category, "Unknown");

  return {
    id: buildFundId(name, amc),
    name,
    category,
    amc,
    fundManager: fund.fundManager,
    aum: fund.aum,
    expenseRatio: fund.expenseRatio,
    categoryAvgExpense: fund.categoryAvgExpense,
    volatility: fund.volatility,
    drawdown: null,
    concentration: fund.concentration,
    consistency: fund.consistency,
    riskLevel: determineRiskLevel(fund.volatility),
  };
}

async function askGroqForJson(prompt: string, maxTokens: number): Promise<unknown> {
  const groq = getGroqClient();
  if (!groq) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.1,
    max_tokens: maxTokens,
    messages: [
      {
        role: "system",
        content:
          "You are a strict financial data extraction assistant. Never fabricate values. If unknown, return null. Respond with raw JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return parseJsonBlock(response.choices[0]?.message?.content || "{}");
}

export function resolveFundIdentity(idOrName: string): FundIdentity {
  const decoded = decodeFundId(idOrName);
  if (decoded) {
    return decoded;
  }

  try {
    return { name: decodeURIComponent(idOrName) };
  } catch {
    return { name: idOrName };
  }
}

export async function searchFundsFromGroq(query: string, limit: number): Promise<RealtimeFund[]> {
  const prompt = `Find up to ${limit} Indian mutual fund schemes matching this query: "${query}".

As-of date: ${currentDateLabel()}.

Rules:
- Return only schemes you are reasonably confident are real.
- If a field is unknown, set it to null.
- Do not estimate or invent numbers.
- Do not imply a value is current as of the as-of date unless you are confident. Current NAV/ISIN will be verified separately through AMFI.
- Keep numeric values as plain numbers (no percent sign, no currency symbol).

Return JSON in this exact format:
{
  "funds": [
    {
      "name": "string",
      "category": "string or null",
      "amc": "string or null",
      "fundManager": "string or null",
      "aum": number or null,
      "expenseRatio": number or null,
      "categoryAvgExpense": number or null,
      "volatility": number or null,
      "concentration": number or null,
      "consistency": number or null
    }
  ]
}`;

  try {
    const parsed = SearchResponseSchema.parse(await askGroqForJson(prompt, 1400));
    return parsed.funds
      .filter((fund) => fund.name && fund.name.trim().length >= 2)
      .slice(0, limit)
      .map(normalizeFund);
  } catch (error) {
    console.error("Groq search parse error:", error);
    return [];
  }
}

export async function getFundDetailsFromGroq(identity: FundIdentity): Promise<RealtimeFundDetails | null> {
  const amcHint = identity.amc ? ` and AMC "${identity.amc}"` : "";

  const prompt = `Provide mutual fund details for "${identity.name}"${amcHint}.

As-of date: ${currentDateLabel()}.

Rules:
- Return only data you are reasonably confident about.
- If unknown, return null.
- Do not fabricate numbers, holdings, or performance.
- Do not claim live/current NAV; AMFI will be used separately for current NAV and ISIN.
- Numeric values must be plain numbers without symbols.
- Holdings should include only top holdings that are known.

Return JSON in this exact format:
{
  "name": "string",
  "category": "string or null",
  "amc": "string or null",
  "fundManager": "string or null",
  "aum": number or null,
  "expenseRatio": number or null,
  "categoryAvgExpense": number or null,
  "volatility": number or null,
  "drawdown": number or null,
  "concentration": number or null,
  "consistency": number or null,
  "manager": {
    "name": "string or null",
    "tenureYears": number or null,
    "pastPerformance": "string or null"
  },
  "externalSignals": {
    "negativeNews": ["string"],
    "sectorRisks": ["string"]
  },
  "performance": {
    "returns1Y": number or null,
    "returns3Y": number or null,
    "returns5Y": number or null,
    "returnsYTD": number or null,
    "benchmarkReturns1Y": number or null,
    "benchmarkReturns3Y": number or null,
    "benchmarkReturns5Y": number or null,
    "benchmarkName": "string or null"
  },
  "holdings": [
    {
      "stockName": "string or null",
      "companyName": "string or null",
      "sector": "string or null",
      "percentage": number or null
    }
  ],
  "alternatives": [
    {
      "name": "string or null",
      "amc": "string or null",
      "reason": "string or null",
      "expenseRatio": number or null,
      "returns1Y": number or null
    }
  ]
}`;

  try {
    const parsed = DetailResponseSchema.parse(await askGroqForJson(prompt, 2200));

    const name = normalizeText(parsed.name, identity.name);
    const amc = normalizeText(parsed.amc, identity.amc || "Unknown AMC");
    const category = normalizeText(parsed.category, "Unknown");
    const fundId = buildFundId(name, amc);

    const manager: RealtimeManager = {
      name: parsed.manager?.name || parsed.fundManager,
      tenureYears: parsed.manager?.tenureYears ?? null,
      pastPerformance: parsed.manager?.pastPerformance ?? null,
    };

    const externalSignals: RealtimeExternalSignals = {
      negativeNews: (parsed.externalSignals?.negativeNews || []).map((item) => item.trim()).filter(Boolean),
      sectorRisks: (parsed.externalSignals?.sectorRisks || []).map((item) => item.trim()).filter(Boolean),
    };

    const performance: RealtimePerformance | undefined = parsed.performance
      ? {
          id: `perf-${fundId}`,
          fundId,
          returns1Y: parsed.performance.returns1Y,
          returns3Y: parsed.performance.returns3Y,
          returns5Y: parsed.performance.returns5Y,
          returnsYTD: parsed.performance.returnsYTD,
          benchmarkReturns1Y: parsed.performance.benchmarkReturns1Y,
          benchmarkReturns3Y: parsed.performance.benchmarkReturns3Y,
          benchmarkReturns5Y: parsed.performance.benchmarkReturns5Y,
          benchmarkName: normalizeText(parsed.performance.benchmarkName, "Unknown Benchmark"),
        }
      : undefined;

    const holdings: RealtimeHolding[] = parsed.holdings
      .filter((holding) => holding.stockName !== null)
      .map((holding, index) => ({
        id: `${fundId}-holding-${index}`,
        fundId,
        stockName: holding.stockName!,
        companyName: holding.companyName,
        sector: holding.sector,
        percentage: holding.percentage,
      }));

    const alternatives: RealtimeAlternative[] = parsed.alternatives
      .filter((alt) => alt.name !== null)
      .map((alt, index) => {
      const altName = alt.name!;
      const altAmc = alt.amc || `alt-${index}`;
      return {
        id: buildFundId(altName, altAmc),
        name: altName,
        reason: normalizeText(alt.reason, "Reason unavailable"),
        expenseRatio: alt.expenseRatio,
        returns1Y: alt.returns1Y,
      };
    });

    return {
      id: fundId,
      name,
      category,
      amc,
      fundManager: parsed.fundManager,
      aum: parsed.aum,
      expenseRatio: parsed.expenseRatio,
      categoryAvgExpense: parsed.categoryAvgExpense,
      volatility: parsed.volatility,
      drawdown: parsed.drawdown,
      concentration: parsed.concentration,
      consistency: parsed.consistency,
      riskLevel: determineRiskLevel(parsed.volatility),
      performance,
      holdings,
      alternatives,
      manager,
      externalSignals,
    };
  } catch (error) {
    console.error("Groq detail parse error:", error);
    return null;
  }
}
