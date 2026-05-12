import axios from "axios";
import { getCache, setCache } from "../utils/cache";
import {
  type RealtimeFund,
  type RealtimeFundDetails,
  type RealtimePerformance,
} from "./groqFundService";

const AMFI_NAV_URL = "https://portal.amfiindia.com/spages/NAVAll.txt";
const AMFI_CACHE_KEY = "amfi-nav-all";
const AMFI_CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const MFAPI_BASE_URL = "https://api.mfapi.in/mf";
const MFAPI_CACHE_TTL_MS = 1000 * 60 * 60 * 6;

export interface AmfiScheme {
  schemeCode: string;
  isin: string | null;
  reinvestmentIsin: string | null;
  schemeName: string;
  nav: number | null;
  date: string;
  amc: string;
  category: string;
}

export interface CurrentNav {
  schemeCode: string;
  isin: string | null;
  schemeName: string;
  nav: number | null;
  date: string;
  source: "AMFI";
}

export interface PurchaseLink {
  platform: string;
  url: string;
  confidence: "exact" | "high" | "assisted";
  note: string;
}

export interface FundMarketProfile {
  amfiScheme: AmfiScheme | null;
  currentNav: CurrentNav | null;
  purchaseLinks: PurchaseLink[];
}

interface MfapiNavPoint {
  date: string;
  nav: string;
}

interface MfapiHistoryResponse {
  meta?: {
    scheme_code?: number;
    scheme_name?: string;
    isin_growth?: string | null;
  };
  data?: MfapiNavPoint[];
  status?: string;
}

export interface NavPerformanceProfile {
  performance: RealtimePerformance;
  volatility: number | null;
  drawdown: number | null;
  dataPoints: number;
  asOfDate: string | null;
}

const etMoneyIdsByIsin: Record<string, string> = {
  INF879O01027: "19232",
  INF209KB1O82: "40971",
  INF174K01LT0: "16693",
};

const upstoxIdsByIsin: Record<string, string> = {
  INF879O01027: "100060",
  INF209KB1O82: "104995",
  INF174K01LT0: "105114",
};

const etMoneySlugByIsin: Record<string, string> = {
  INF174K01LT0: "kotak-emerging-equity-fund-direct-growth",
};

const upstoxPathByIsin: Record<string, string> = {
  INF174K01LT0: "kotak-emerging-equity-scheme-direct-growth-105114",
};

const preferredDirectGrowthIsinByAlias: Record<string, string> = {
  [canonicalSchemeName("Kotak Emerging Equity Fund")]: "INF174K01LT0",
  [canonicalSchemeName("Kotak Emerging Equity Scheme")]: "INF174K01LT0",
  [canonicalSchemeName("Kotak Midcap Fund")]: "INF174K01LT0",
  [canonicalSchemeName("Kotak Mid Cap Fund")]: "INF174K01LT0",
  [canonicalSchemeName("Axis Bluechip Fund")]: "INF846K01DP8",
  [canonicalSchemeName("Axis Large Cap Fund")]: "INF846K01DP8",
};

function buildFundId(name: string, amc: string): string {
  return Buffer.from(`${name}::${amc}`, "utf8").toString("base64url");
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalSchemeName(value: string): string {
  const ignored = new Set([
    "direct",
    "regular",
    "plan",
    "growth",
    "option",
    "idcw",
    "dividend",
    "payout",
    "reinvestment",
    "monthly",
    "quarterly",
    "weekly",
    "daily",
    "bonus",
  ]);

  return normalizeText(value)
    .split(" ")
    .filter((token) => token && !ignored.has(token))
    .join(" ");
}

function isDirectGrowthScheme(schemeName: string): boolean {
  const normalized = normalizeText(schemeName);

  return (
    normalized.includes("direct") &&
    normalized.includes("growth") &&
    !/\b(idcw|dividend|payout|reinvestment|bonus)\b/.test(normalized)
  );
}

function cleanField(value: string | undefined): string | null {
  const cleaned = (value || "").trim();
  return cleaned && cleaned !== "-" ? cleaned : null;
}

function parseAmfiNavText(text: string): AmfiScheme[] {
  const schemes: AmfiScheme[] = [];
  const lines = text.replace(/\r/g, "").split("\n");
  let currentCategory = "Unknown";
  let currentAmc = "Unknown AMC";

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("Scheme Code;")) {
      continue;
    }

    if (!line.includes(";")) {
      if (/^(Open|Close|Interval) Ended Schemes/i.test(line)) {
        currentCategory = line;
      } else {
        currentAmc = line;
      }
      continue;
    }

    const parts = line.split(";");
    if (parts.length < 6 || !/^\d+$/.test(parts[0]?.trim() || "")) {
      continue;
    }

    const nav = Number(parts[4]);

    schemes.push({
      schemeCode: parts[0].trim(),
      isin: cleanField(parts[1]),
      reinvestmentIsin: cleanField(parts[2]),
      schemeName: parts[3].trim(),
      nav: Number.isFinite(nav) ? nav : null,
      date: parts[5].trim(),
      amc: currentAmc,
      category: currentCategory,
    });
  }

  return schemes;
}

export async function getAmfiSchemes(): Promise<AmfiScheme[]> {
  const cached = getCache<AmfiScheme[]>(AMFI_CACHE_KEY);
  if (cached) {
    return cached;
  }

  const response = await axios.get<string>(AMFI_NAV_URL, {
    responseType: "text",
    timeout: 12000,
  });
  const schemes = parseAmfiNavText(response.data);
  setCache(AMFI_CACHE_KEY, schemes, AMFI_CACHE_TTL_MS);
  return schemes;
}

function tokenSet(value: string): Set<string> {
  return new Set(
    canonicalSchemeName(value)
      .split(" ")
      .filter((token) => token.length > 1)
  );
}

function tokenScore(a: string, b: string): number {
  const aTokens = tokenSet(a);
  const bTokens = tokenSet(b);
  if (!aTokens.size || !bTokens.size) {
    return 0;
  }

  let intersection = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) {
      intersection += 1;
    }
  }

  const union = new Set([...Array.from(aTokens), ...Array.from(bTokens)]).size;
  return intersection / union;
}

function scoreSchemeMatch(scheme: AmfiScheme, fundName: string, amc?: string | null): number {
  const target = canonicalSchemeName(fundName);
  const candidate = canonicalSchemeName(scheme.schemeName);

  let score = 0;
  if (target === candidate) {
    score = 1;
  } else if (target.length > 8 && candidate.includes(target)) {
    score = 0.94;
  } else if (candidate.length > 8 && target.includes(candidate)) {
    score = 0.9;
  } else {
    score = tokenScore(target, candidate);
  }

  if (amc) {
    const amcScore = tokenScore(amc, scheme.amc);
    if (amcScore >= 0.35) {
      score += 0.06;
    }
  }

  return Math.min(score, 1);
}

export async function findBestAmfiScheme(
  fundName: string,
  amc?: string | null
): Promise<AmfiScheme | null> {
  try {
    const schemes = await getAmfiSchemes();
    const preferredIsin = preferredDirectGrowthIsinByAlias[canonicalSchemeName(fundName)];
    if (preferredIsin) {
      const preferred = schemes.find((scheme) => scheme.isin === preferredIsin);
      if (preferred) {
        return preferred;
      }
    }

    const directGrowthSchemes = schemes.filter((scheme) => isDirectGrowthScheme(scheme.schemeName));
    const candidates = directGrowthSchemes.length ? directGrowthSchemes : schemes;

    let best: { scheme: AmfiScheme; score: number } | null = null;

    for (const scheme of candidates) {
      const score = scoreSchemeMatch(scheme, fundName, amc);
      if (!best || score > best.score) {
        best = { scheme, score };
      }
    }

    return best && best.score >= 0.58 ? best.scheme : null;
  } catch (error) {
    console.error("AMFI match error:", error);
    return null;
  }
}

function stripPlanWordsForSlug(value: string): string {
  return value
    .replace(/\b(direct|regular)\b/gi, " ")
    .replace(/\b(plan|growth|option|idcw|dividend|payout|reinvestment|bonus)\b/gi, " ")
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function displaySchemeName(value: string): string {
  return stripPlanWordsForSlug(value);
}

function slugify(value: string): string {
  return normalizeText(value)
    .replace(/\band\b/g, "and")
    .replace(/\s+/g, "-");
}

function platformSlug(fundName: string, scheme?: AmfiScheme | null): string {
  const base = stripPlanWordsForSlug(scheme?.schemeName || fundName);
  return slugify(`${base} direct growth`);
}

function growwSlug(fundName: string, scheme?: AmfiScheme | null): string {
  const canonical = canonicalSchemeName(scheme?.schemeName || fundName);

  if (canonical === canonicalSchemeName("Parag Parikh Flexi Cap Fund")) {
    return "parag-parikh-long-term-value-fund-direct-growth";
  }

  if (canonical === canonicalSchemeName("Kotak Midcap Fund")) {
    return "kotak-emerging-equity-scheme-direct-growth";
  }

  return platformSlug(fundName, scheme);
}

export async function getFundMarketProfile(
  fundName: string,
  amc?: string | null
): Promise<FundMarketProfile> {
  const amfiScheme = await findBestAmfiScheme(fundName, amc);
  const currentNav: CurrentNav | null = amfiScheme
    ? {
        schemeCode: amfiScheme.schemeCode,
        isin: amfiScheme.isin,
        schemeName: amfiScheme.schemeName,
        nav: amfiScheme.nav,
        date: amfiScheme.date,
        source: "AMFI",
      }
    : null;

  const slug = platformSlug(fundName, amfiScheme);
  const groww = growwSlug(fundName, amfiScheme);
  const links: PurchaseLink[] = [
    {
      platform: "Groww",
      url: `https://groww.in/mutual-funds/${groww}`,
      confidence: "high",
      note: "Direct Growth scheme page generated from the scheme name. Verify plan before investing.",
    },
    {
      platform: "Dhan",
      url: `https://dhan.co/mutual-funds/${slug}/`,
      confidence: "high",
      note: "Direct Growth scheme page generated from the scheme name. Verify plan before investing.",
    },
  ];

  if (amfiScheme?.isin) {
    links.splice(1, 0, {
      platform: "Zerodha Coin",
      url: `https://coin.zerodha.com/mf/fund/${amfiScheme.isin}`,
      confidence: "exact",
      note: "Exact Coin route built from the AMFI ISIN for this Direct Growth scheme.",
    });

    const etMoneyId = etMoneyIdsByIsin[amfiScheme.isin];
    if (etMoneyId) {
      const etMoneySlug = etMoneySlugByIsin[amfiScheme.isin] || slug;
      links.push({
        platform: "ET Money",
        url: `https://www.etmoney.com/mutual-funds/${etMoneySlug}/${etMoneyId}`,
        confidence: "exact",
        note: "Exact ET Money scheme page verified for this ISIN.",
      });
    }

    const upstoxId = upstoxIdsByIsin[amfiScheme.isin];
    if (upstoxId) {
      const upstoxPath = upstoxPathByIsin[amfiScheme.isin] || `${slug}-details-${upstoxId}`;
      links.push({
        platform: "Upstox",
        url: `https://upstox.com/mutual-funds/${upstoxPath}/`,
        confidence: "exact",
        note: "Exact Upstox scheme page verified for this ISIN.",
      });
    }
  }

  return {
    amfiScheme,
    currentNav,
    purchaseLinks: links,
  };
}

function parseMfapiDate(value: string): Date | null {
  const [day, month, year] = value.split("-").map((part) => Number(part));
  if (!day || !month || !year) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
}

function addYears(date: Date, years: number): Date {
  const next = new Date(date.getTime());
  next.setUTCFullYear(next.getUTCFullYear() + years);
  return next;
}

function annualizedReturn(latestNav: number, baseNav: number, years: number): number | null {
  if (latestNav <= 0 || baseNav <= 0 || years <= 0) {
    return null;
  }

  const value = years <= 1 ? latestNav / baseNav - 1 : Math.pow(latestNav / baseNav, 1 / years) - 1;
  return Number((value * 100).toFixed(2));
}

function standardDeviation(values: number[]): number | null {
  if (values.length < 2) {
    return null;
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function nearestNavOnOrBefore(
  history: Array<{ date: Date; nav: number; label: string }>,
  targetDate: Date
): number | null {
  const exactOrBefore = history.find((point) => point.date.getTime() <= targetDate.getTime());
  return exactOrBefore?.nav ?? null;
}

async function getMfapiHistory(schemeCode: string): Promise<MfapiHistoryResponse | null> {
  const cacheKey = `mfapi-history-${schemeCode}`;
  const cached = getCache<MfapiHistoryResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get<MfapiHistoryResponse>(`${MFAPI_BASE_URL}/${schemeCode}`, {
      timeout: 15000,
    });
    setCache(cacheKey, response.data, MFAPI_CACHE_TTL_MS);
    return response.data;
  } catch (error) {
    console.error("MFAPI history error:", error);
    return null;
  }
}

export async function getNavPerformanceForScheme(
  schemeCode: string,
  fundId: string
): Promise<NavPerformanceProfile | null> {
  const response = await getMfapiHistory(schemeCode);
  const parsed = (response?.data || [])
    .map((point) => {
      const date = parseMfapiDate(point.date);
      const nav = Number(point.nav);
      return date && Number.isFinite(nav) ? { date, nav, label: point.date } : null;
    })
    .filter((point): point is { date: Date; nav: number; label: string } => point !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (parsed.length < 2) {
    return null;
  }

  const latest = parsed[0];
  const returns1Y = annualizedReturn(latest.nav, nearestNavOnOrBefore(parsed, addYears(latest.date, -1)) || 0, 1);
  const returns3Y = annualizedReturn(latest.nav, nearestNavOnOrBefore(parsed, addYears(latest.date, -3)) || 0, 3);
  const returns5Y = annualizedReturn(latest.nav, nearestNavOnOrBefore(parsed, addYears(latest.date, -5)) || 0, 5);

  const threeYearsAgo = addYears(latest.date, -3);
  const recent = parsed
    .filter((point) => point.date.getTime() >= threeYearsAgo.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const dailyReturns: number[] = [];
  let peak = recent[0]?.nav || latest.nav;
  let maxDrawdown = 0;

  for (let index = 1; index < recent.length; index += 1) {
    const previous = recent[index - 1].nav;
    const current = recent[index].nav;
    if (previous > 0 && current > 0) {
      dailyReturns.push(current / previous - 1);
    }
    peak = Math.max(peak, current);
    if (peak > 0) {
      maxDrawdown = Math.min(maxDrawdown, current / peak - 1);
    }
  }

  const dailyStd = standardDeviation(dailyReturns);
  const volatility = dailyStd === null ? null : Number((dailyStd * Math.sqrt(252) * 100).toFixed(2));
  const drawdown = Number((maxDrawdown * 100).toFixed(2));

  return {
    performance: {
      id: `nav-perf-${fundId}`,
      fundId,
      returns1Y,
      returns3Y,
      returns5Y,
      returnsYTD: null,
      benchmarkReturns1Y: null,
      benchmarkReturns3Y: null,
      benchmarkReturns5Y: null,
      benchmarkName: "Benchmark unavailable",
    },
    volatility,
    drawdown,
    dataPoints: parsed.length,
    asOfDate: latest.label,
  };
}

export async function searchAmfiFunds(query: string, limit: number): Promise<RealtimeFund[]> {
  const schemes = await getAmfiSchemes();
  const normalizedQuery = canonicalSchemeName(query);
  const queryTokens = normalizedQuery.split(" ").filter((token) => token.length > 1);
  const preferredIsin = preferredDirectGrowthIsinByAlias[normalizedQuery];
  const preferredScheme = preferredIsin
    ? schemes.find((scheme) => scheme.isin === preferredIsin)
    : undefined;

  const matched = schemes
    .filter((scheme) => isDirectGrowthScheme(scheme.schemeName))
    .map((scheme) => ({
      scheme,
      score:
        canonicalSchemeName(scheme.schemeName).includes(normalizedQuery) ||
        queryTokens.every((token) => canonicalSchemeName(scheme.schemeName).includes(token))
          ? 1
          : tokenScore(query, scheme.schemeName),
    }))
    .filter((candidate) => candidate.score >= 0.55)
    .sort((a, b) => b.score - a.score)
    .map(({ scheme }) => scheme);

  const schemesToReturn = [
    ...(preferredScheme ? [preferredScheme] : []),
    ...matched.filter((scheme) => scheme.isin !== preferredScheme?.isin),
  ].slice(0, limit);

  return schemesToReturn
    .map((scheme) => {
      const name = displaySchemeName(scheme.schemeName);

      return {
        id: buildFundId(name, scheme.amc),
        name,
        category: scheme.category,
        amc: scheme.amc,
        fundManager: null,
        aum: null,
        expenseRatio: null,
        categoryAvgExpense: null,
        volatility: null,
        drawdown: null,
        concentration: null,
        consistency: null,
        riskLevel: "Unknown",
      };
    });
}

export async function getAmfiOnlyFundDetails(identity: {
  name: string;
  amc?: string | null;
}): Promise<RealtimeFundDetails | null> {
  const scheme = await findBestAmfiScheme(identity.name, identity.amc);
  if (!scheme) {
    return null;
  }

  const name = displaySchemeName(scheme.schemeName);
  const id = buildFundId(name, scheme.amc);

  return {
    id,
    name,
    category: scheme.category,
    amc: scheme.amc,
    fundManager: null,
    aum: null,
    expenseRatio: null,
    categoryAvgExpense: null,
    volatility: null,
    drawdown: null,
    concentration: null,
    consistency: null,
    riskLevel: "Unknown",
    holdings: [],
    alternatives: [],
    manager: {
      name: null,
      tenureYears: null,
      pastPerformance: null,
    },
    externalSignals: {
      negativeNews: [],
      sectorRisks: [],
    },
  };
}

export async function enrichFundWithMarketProfile<T extends { name: string; amc?: string | null }>(
  fund: T
): Promise<T & { currentNav: CurrentNav | null; purchaseLinks: PurchaseLink[] }> {
  const profile = await getFundMarketProfile(fund.name, fund.amc);
  return {
    ...fund,
    currentNav: profile.currentNav,
    purchaseLinks: profile.purchaseLinks,
  };
}
