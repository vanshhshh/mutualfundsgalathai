import axios from "axios";
import { getCache, setCache } from "../utils/cache";
import {
  type RealtimeFund,
  type RealtimeFundDetails,
  type RealtimeHolding,
  type RealtimePerformance,
} from "./groqFundService";

const MFDATA_BASE_URL = "https://mfdata.in/api/v1";
const MFDATA_CACHE_TTL_MS = 1000 * 60 * 60 * 6;

interface MfdataSchemeProfile {
  family_id?: number | null;
  amfi_code?: string | null;
  isin?: string | null;
  name?: string | null;
  plan_type?: string | null;
  option_type?: string | null;
  nav?: number | null;
  nav_date?: string | null;
  expense_ratio?: number | null;
  risk_label?: string | null;
  aum?: number | null;
  benchmark?: string | null;
  category?: string | null;
  amc_name?: string | null;
  returns?: {
    as_of_date?: string | null;
    return_1y?: number | null;
    return_3y?: number | null;
    return_5y?: number | null;
  } | null;
  ratios?: {
    as_of_date?: string | null;
    returns?: {
      sharpe_ratio?: number | null;
      jensens_alpha?: number | null;
      information_ratio?: number | null;
    } | null;
    risk?: {
      std_deviation?: number | null;
      beta?: number | null;
      sortino_ratio?: number | null;
      r_squared?: number | null;
    } | null;
    category_averages?: {
      sharpe?: number | null;
      beta?: number | null;
    } | null;
  } | null;
}

interface MfdataHolding {
  stock_name?: string | null;
  sector?: string | null;
  weight_pct?: number | null;
}

interface MfdataHoldingsProfile {
  month?: string | null;
  total_aum?: number | null;
  equity_pct?: number | null;
  debt_pct?: number | null;
  other_pct?: number | null;
  fetched_at?: string | null;
  equity_holdings?: MfdataHolding[] | null;
}

interface MfdataManager {
  name?: string | null;
  tenure_years?: number | null;
  start_date?: string | null;
}

interface MfdataPeopleProfile {
  managers?: MfdataManager[] | null;
  avg_tenure?: number | null;
}

interface MfdataApiResponse<T> {
  status?: string;
  data?: T;
}

export interface MfdataEnrichment {
  profile: MfdataSchemeProfile;
  holdings: MfdataHoldingsProfile | null;
  people: MfdataPeopleProfile | null;
  sourceDate: string | null;
  notes: string[];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function rupeesToCrore(value: number | null | undefined): number | null {
  if (!isFiniteNumber(value)) {
    return null;
  }

  return Number((value / 10_000_000).toFixed(2));
}

function normalizeRiskLabel(value: string | null | undefined): string {
  if (!value) {
    return "Unknown";
  }

  const cleaned = value.replace(/\brisk\b/gi, "").replace(/\s+/g, " ").trim();
  return cleaned || "Unknown";
}

function cleanDate(value: string | null | undefined): string | null {
  return value && value.trim() ? value.trim() : null;
}

function sourceDateFrom(profile: MfdataSchemeProfile, holdings: MfdataHoldingsProfile | null): string | null {
  return (
    cleanDate(profile.returns?.as_of_date) ||
    cleanDate(profile.ratios?.as_of_date) ||
    cleanDate(profile.nav_date) ||
    cleanDate(holdings?.month) ||
    null
  );
}

async function getMfdata<T>(path: string): Promise<T | null> {
  const cacheKey = `mfdata-${path}`;
  const cached = getCache<T>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get<MfdataApiResponse<T>>(`${MFDATA_BASE_URL}${path}`, {
      timeout: 12000,
    });
    const data = response.data?.data ?? null;
    if (data) {
      setCache(cacheKey, data, MFDATA_CACHE_TTL_MS);
    }
    return data;
  } catch (error) {
    console.error(`mfdata.in error for ${path}:`, error);
    return null;
  }
}

export async function getMfdataSchemeProfile(schemeCode: string): Promise<MfdataSchemeProfile | null> {
  return getMfdata<MfdataSchemeProfile>(`/schemes/${encodeURIComponent(schemeCode)}`);
}

async function getMfdataFamilyHoldings(familyId: number): Promise<MfdataHoldingsProfile | null> {
  return getMfdata<MfdataHoldingsProfile>(`/families/${familyId}/holdings`);
}

async function getMfdataFamilyPeople(familyId: number): Promise<MfdataPeopleProfile | null> {
  return getMfdata<MfdataPeopleProfile>(`/families/${familyId}/people`);
}

export async function getMfdataEnrichment(schemeCode: string): Promise<MfdataEnrichment | null> {
  const profile = await getMfdataSchemeProfile(schemeCode);
  if (!profile?.family_id) {
    return profile
      ? {
          profile,
          holdings: null,
          people: null,
          sourceDate: sourceDateFrom(profile, null),
          notes: ["mfdata.in returned scheme-level data, but no family id for holdings/manager enrichment."],
        }
      : null;
  }

  const [holdings, people] = await Promise.all([
    getMfdataFamilyHoldings(profile.family_id),
    getMfdataFamilyPeople(profile.family_id),
  ]);
  const notes = [
    "AUM, direct TER, benchmark, risk label, ratios, and portfolio data are enriched from mfdata.in using the exact AMFI scheme code.",
  ];

  if (!holdings?.equity_holdings?.length) {
    notes.push("mfdata.in did not return equity holdings for this scheme family.");
  }

  if (!people?.managers?.length) {
    notes.push("mfdata.in did not return verified manager names for this scheme family.");
  }

  return {
    profile,
    holdings,
    people,
    sourceDate: sourceDateFrom(profile, holdings),
    notes,
  };
}

export async function getMfdataProfileEnrichment(schemeCode: string): Promise<MfdataEnrichment | null> {
  const profile = await getMfdataSchemeProfile(schemeCode);
  return profile
    ? {
        profile,
        holdings: null,
        people: null,
        sourceDate: sourceDateFrom(profile, null),
        notes: [
          "AUM, direct TER, benchmark, risk label, and ratio fields are enriched from mfdata.in using the exact AMFI scheme code.",
        ],
      }
    : null;
}

function holdingsFromMfdata(
  fundId: string,
  holdings: MfdataHoldingsProfile | null
): RealtimeHolding[] | null {
  const rows = (holdings?.equity_holdings || [])
    .filter((holding) => holding.stock_name && isFiniteNumber(holding.weight_pct))
    .sort((a, b) => (b.weight_pct || 0) - (a.weight_pct || 0));

  if (!rows.length) {
    return null;
  }

  return rows.map((holding, index) => ({
    id: `${fundId}-mfdata-holding-${index}`,
    fundId,
    stockName: holding.stock_name || "Unknown holding",
    companyName: holding.stock_name || null,
    sector: holding.sector || null,
    percentage: holding.weight_pct ?? null,
  }));
}

function performanceFromMfdata(
  fundId: string,
  profile: MfdataSchemeProfile,
  existing?: RealtimePerformance
): RealtimePerformance | undefined {
  const returns = profile.returns;
  if (!returns && !profile.benchmark && !existing) {
    return undefined;
  }

  return {
    id: existing?.id || `mfdata-perf-${fundId}`,
    fundId,
    returns1Y: existing?.returns1Y ?? returns?.return_1y ?? null,
    returns3Y: existing?.returns3Y ?? returns?.return_3y ?? null,
    returns5Y: existing?.returns5Y ?? returns?.return_5y ?? null,
    returnsYTD: existing?.returnsYTD ?? null,
    benchmarkReturns1Y: existing?.benchmarkReturns1Y ?? null,
    benchmarkReturns3Y: existing?.benchmarkReturns3Y ?? null,
    benchmarkReturns5Y: existing?.benchmarkReturns5Y ?? null,
    benchmarkName: existing?.benchmarkName || profile.benchmark || "Benchmark unavailable",
  };
}

export function enrichSearchFundWithMfdata(
  fund: RealtimeFund,
  enrichment: MfdataEnrichment | null
): RealtimeFund {
  if (!enrichment) {
    return fund;
  }

  const { profile } = enrichment;
  const aumCr = rupeesToCrore(profile.aum);
  const volatility = profile.ratios?.risk?.std_deviation ?? null;

  return {
    ...fund,
    category: profile.category || fund.category,
    amc: profile.amc_name || fund.amc,
    aum: fund.aum ?? aumCr,
    expenseRatio: fund.expenseRatio ?? profile.expense_ratio ?? null,
    volatility: fund.volatility ?? volatility,
    riskLevel: fund.riskLevel === "Unknown" ? normalizeRiskLabel(profile.risk_label) : fund.riskLevel,
  };
}

export function enrichFundDetailsWithMfdata(
  fund: RealtimeFundDetails,
  enrichment: MfdataEnrichment | null
): RealtimeFundDetails {
  if (!enrichment) {
    return fund;
  }

  const { profile, holdings, people } = enrichment;
  const aumCr = rupeesToCrore(profile.aum ?? holdings?.total_aum);
  const mfHoldings = holdingsFromMfdata(fund.id, holdings);
  const topThreeConcentration =
    mfHoldings && mfHoldings.length >= 3
      ? Number(
          mfHoldings
            .slice(0, 3)
            .reduce((sum, holding) => sum + (holding.percentage || 0), 0)
            .toFixed(2)
        )
      : null;
  const manager = people?.managers?.find((candidate) => candidate.name);
  const volatility = profile.ratios?.risk?.std_deviation ?? null;

  return {
    ...fund,
    category: profile.category || fund.category,
    amc: profile.amc_name || fund.amc,
    aum: fund.aum ?? aumCr,
    expenseRatio: fund.expenseRatio ?? profile.expense_ratio ?? null,
    volatility: fund.volatility ?? volatility,
    concentration: fund.concentration ?? topThreeConcentration,
    riskLevel: fund.riskLevel === "Unknown" ? normalizeRiskLabel(profile.risk_label) : fund.riskLevel,
    fundManager: fund.fundManager ?? manager?.name ?? null,
    performance: performanceFromMfdata(fund.id, profile, fund.performance),
    holdings: fund.holdings?.length ? fund.holdings : mfHoldings || [],
    manager: {
      name: fund.manager?.name ?? manager?.name ?? null,
      tenureYears: fund.manager?.tenureYears ?? manager?.tenure_years ?? people?.avg_tenure ?? null,
      pastPerformance: fund.manager?.pastPerformance ?? null,
    },
    externalSignals: {
      negativeNews: fund.externalSignals?.negativeNews || [],
      sectorRisks: [
        ...(fund.externalSignals?.sectorRisks || []),
        ...(holdings?.equity_pct !== null && holdings?.equity_pct !== undefined
          ? [`Equity allocation shown by mfdata.in is ${holdings.equity_pct.toFixed(2)}%.`]
          : []),
        ...(profile.ratios?.risk?.beta !== null && profile.ratios?.risk?.beta !== undefined
          ? [`Portfolio beta shown by mfdata.in is ${profile.ratios.risk.beta.toFixed(2)}.`]
          : []),
      ],
    },
  };
}
