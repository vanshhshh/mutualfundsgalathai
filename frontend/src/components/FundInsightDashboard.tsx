'use client';

import React from 'react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  FileSearch,
  Gauge,
  Landmark,
  Layers3,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import type { FundDetails } from '@/lib/api';
import { formatCurrency, formatPercent } from '@/lib/utils';

interface FundInsightDashboardProps {
  fund: FundDetails;
  onBuyClick: () => void;
}

function clampScore(value: number | undefined): number {
  if (value === undefined || Number.isNaN(value)) return 5;
  return Math.max(0, Math.min(10, value));
}

function scoreColor(score: number): string {
  if (score >= 7) return 'text-emerald-700';
  if (score >= 5) return 'text-amber-700';
  return 'text-red-700';
}

function MiniScore({ label, value }: { label: string; value: number }) {
  const score = clampScore(value);

  return (
    <div className="rounded-2xl border border-[#d7e3f7] bg-white/82 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
        <p className={`text-lg font-black ${scoreColor(score)}`}>{score.toFixed(1)}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#174ec4] to-[#38a3ff]"
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );
}

function signalTone(value: boolean): string {
  return value ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900';
}

export default function FundInsightDashboard({ fund, onBuyClick }: FundInsightDashboardProps) {
  const explanation = fund.aiExplanation;
  const scores = explanation?.scores;
  const finalVerdict = explanation?.final_verdict.classification || 'Review Needed';
  const dataWarning = explanation?.data_integrity_check.status?.toLowerCase() === 'warning';
  const isVerifiedFactsheet = fund.source?.mode === 'verified-override';
  const sourceBadge =
    fund.source?.mode === 'verified-override'
      ? 'Verified factsheet'
      : fund.source?.mode === 'amfi-mfdata-enriched'
        ? 'AMFI + mfdata'
      : fund.source?.mode === 'amfi-only'
        ? 'AMFI verified'
        : fund.source?.mode === 'unverified'
          ? 'Unverified'
          : 'AI assisted';
  const hasHighRiskSignal =
    fund.riskLevel === 'Very High' ||
    fund.riskLevel === 'High' ||
    (fund.volatility !== null && fund.volatility !== undefined && fund.volatility > 15);
  const riskLabel = isVerifiedFactsheet ? 'Riskometer' : 'NAV volatility';
  const riskValue = isVerifiedFactsheet
    ? fund.riskLevel
    : fund.volatility === null || fund.volatility === undefined
      ? 'N/A'
      : `${fund.volatility.toFixed(2)}%`;
  const hasBenchmark =
    fund.performance?.benchmarkReturns1Y !== null &&
    fund.performance?.benchmarkReturns1Y !== undefined &&
    fund.performance?.benchmarkReturns3Y !== null &&
    fund.performance?.benchmarkReturns3Y !== undefined &&
    fund.performance?.benchmarkReturns5Y !== null &&
    fund.performance?.benchmarkReturns5Y !== undefined;
  const topHoldings = (fund.holdings || [])
    .filter((holding) => holding.percentage !== null && holding.percentage !== undefined)
    .slice(0, 5);
  const alpha1Y =
    fund.performance?.returns1Y !== null &&
    fund.performance?.returns1Y !== undefined &&
    fund.performance?.benchmarkReturns1Y !== null &&
    fund.performance?.benchmarkReturns1Y !== undefined
      ? fund.performance.returns1Y - fund.performance.benchmarkReturns1Y
      : null;

  const fitSignals = [
    {
      title: 'Best suited for',
      text: hasHighRiskSignal
        ? 'Investors with a long horizon who can sit through sharp drawdowns.'
        : 'Investors who want a more measured fund profile.',
      icon: CheckCircle2,
    },
    {
      title: 'Use it as',
      text: fund.category.toLowerCase().includes('mid')
        ? 'A satellite mid-cap allocation, not the whole equity portfolio.'
        : 'One part of a diversified portfolio.',
      icon: Layers3,
    },
    {
      title: 'Judge it by',
      text: `Returns versus ${fund.performance?.benchmarkName || 'its benchmark'}, cost, manager continuity, and portfolio spread.`,
      icon: FileSearch,
    },
  ];

  const redFlags = [
    {
      label: 'High volatility',
      active: !!fund.riskFlags?.highVolatility,
      text: fund.volatility === null || fund.volatility === undefined ? 'Volatility unavailable' : `${fund.volatility.toFixed(2)}% standard deviation`,
    },
    {
      label: 'High concentration',
      active: !!fund.riskFlags?.highConcentration,
      text:
        fund.concentration === null || fund.concentration === undefined
          ? 'Concentration unavailable'
          : `${fund.concentration.toFixed(2)}% in top holdings shown`,
    },
    {
      label: 'Data warning',
      active: dataWarning,
      text: explanation?.data_integrity_check.message || 'Source quality looks usable',
    },
  ];

  return (
    <section className="mb-8 overflow-hidden rounded-[28px] border border-[#c7d8f3] bg-white shadow-[0_24px_80px_rgba(22,47,95,0.14)]">
      <div className="relative grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(56,163,255,0.18),rgba(56,163,255,0)_30%),radial-gradient(circle_at_86%_14%,rgba(23,78,196,0.14),rgba(23,78,196,0)_28%)]" />

        <div className="relative p-5 sm:p-8">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="brand-chip">Fund Insight Desk</span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
              {sourceBadge}
            </span>
            <span className="rounded-full border border-[#d7e3f7] bg-white px-3 py-1 text-xs font-bold text-slate-600">
              {fund.source?.planBasis || 'Plan basis not confirmed'}
            </span>
          </div>

          <h1 className="headline-font max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-5xl">
            {fund.name}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {explanation?.bottom_line || explanation?.verdict || 'Review the fund through returns, risk, cost, holdings, and source quality before deciding.'}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-[#d7e3f7] bg-white/86 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Decision</p>
              <p className="mt-2 text-lg font-black text-[#123ea2]">{finalVerdict}</p>
            </div>
            <div className="rounded-2xl border border-[#d7e3f7] bg-white/86 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{riskLabel}</p>
              <p className="mt-2 text-lg font-black text-red-700">{riskValue}</p>
            </div>
            <div className="rounded-2xl border border-[#d7e3f7] bg-white/86 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Direct TER</p>
              <p className="mt-2 text-lg font-black text-slate-950">
                {fund.expenseRatio === null ? 'N/A' : `${fund.expenseRatio}%`}
              </p>
            </div>
            <div className="rounded-2xl border border-[#d7e3f7] bg-white/86 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">AUM</p>
              <p className="mt-2 text-lg font-black text-slate-950">{formatCurrency(fund.aum)}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#174ec4] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(23,78,196,0.24)] transition hover:bg-[#123ea2]"
              onClick={onBuyClick}
            >
              <ShoppingCart size={17} />
              Buy the Fund
            </button>
            {fund.currentNav && (
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
                AMFI NAV {fund.currentNav.nav === null ? 'N/A' : `Rs ${fund.currentNav.nav.toFixed(4)}`} as of{' '}
                {fund.currentNav.date}
              </div>
            )}
          </div>
        </div>

        <div className="relative border-t border-[#d7e3f7] bg-[#f8fbff]/92 p-5 sm:p-8 lg:border-l lg:border-t-0">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#174ec4]" />
            <h2 className="font-bold text-slate-950">Identity and freshness check</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Matched scheme</p>
              <p className="mt-1 font-semibold text-slate-950">{fund.currentNav?.schemeName || fund.name}</p>
              <p className="mt-1 text-slate-600">
                {fund.currentNav?.schemeCode ? `AMFI ${fund.currentNav.schemeCode}` : 'AMFI match unavailable'}
                {fund.currentNav?.isin ? ` - ISIN ${fund.currentNav.isin}` : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Manager</p>
                <p className="mt-1 font-semibold text-slate-950">{fund.manager?.name || fund.fundManager || 'N/A'}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {fund.manager?.tenureYears ? `${fund.manager.tenureYears.toFixed(1)} years shown` : 'Tenure not confirmed'}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Source date</p>
                <p className="mt-1 font-semibold text-slate-950">{fund.source?.asOfDate || fund.source?.navAsOfDate || 'N/A'}</p>
                <p className="mt-1 text-xs text-slate-500">{fund.source?.provider || 'Source unavailable'}</p>
              </div>
            </div>
            {fund.source?.notes?.[0] && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-950">
                {fund.source.notes[0]}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-[#d7e3f7] bg-[#f4f8ff] p-5 sm:p-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-[#d7e3f7] bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Gauge className="h-5 w-5 text-[#174ec4]" />
            <h2 className="font-bold text-slate-950">Scoreboard</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <MiniScore label={hasBenchmark ? 'Alpha' : 'Return trend'} value={scores?.alpha_score ?? 5} />
            <MiniScore label="Risk control" value={scores?.risk_score ?? 5} />
            <MiniScore label="Cost" value={scores?.cost_efficiency_score ?? 5} />
            <MiniScore label="Trust" value={scores?.trust_score ?? 5} />
          </div>
        </div>

        <div className="rounded-3xl border border-[#d7e3f7] bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Landmark className="h-5 w-5 text-[#174ec4]" />
            <h2 className="font-bold text-slate-950">Investor fit</h2>
          </div>
          <div className="space-y-3">
            {fitSignals.map((signal) => {
              const Icon = signal.icon;
              return (
                <div key={signal.title} className="flex gap-3 rounded-2xl bg-[#f8fbff] p-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#174ec4]" />
                  <div>
                    <p className="font-semibold text-slate-950">{signal.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{signal.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-[#d7e3f7] bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h2 className="font-bold text-slate-950">Do not ignore</h2>
          </div>
          <div className="space-y-3">
            {redFlags.map((flag) => (
              <div key={flag.label} className={`rounded-2xl border p-3 ${signalTone(flag.active)}`}>
                <div className="flex items-center gap-2">
                  {flag.active ? <AlertTriangle size={17} /> : <CheckCircle2 size={17} />}
                  <p className="font-semibold">{flag.label}</p>
                </div>
                <p className="mt-1 text-sm">{flag.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-[#d7e3f7] bg-white p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-[#d7e3f7] bg-[#f8fbff] p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#174ec4]" />
            <h2 className="font-bold text-slate-950">Return story</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">1Y</p>
              <p className="mt-1 text-lg font-black text-slate-950">{formatPercent(fund.performance?.returns1Y)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">3Y</p>
              <p className="mt-1 text-lg font-black text-slate-950">{formatPercent(fund.performance?.returns3Y)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">5Y</p>
              <p className="mt-1 text-lg font-black text-slate-950">{formatPercent(fund.performance?.returns5Y)}</p>
            </div>
          </div>
          <p className="mt-4 rounded-2xl bg-white p-3 text-sm leading-relaxed text-slate-600">
            {alpha1Y === null
              ? 'Benchmark alpha is unavailable for the latest 1Y period.'
              : `Latest 1Y alpha versus ${fund.performance?.benchmarkName || 'benchmark'} is ${alpha1Y >= 0 ? '+' : ''}${alpha1Y.toFixed(2)}%.`}
            {fund.source?.navHistoryProvider && (
              <span className="mt-2 block text-xs font-semibold text-slate-500">
                NAV history source: {fund.source.navHistoryProvider}
                {fund.source.navHistoryAsOfDate ? ` as of ${fund.source.navHistoryAsOfDate}` : ''}
              </span>
            )}
          </p>
        </div>

        <div className="rounded-3xl border border-[#d7e3f7] bg-[#f8fbff] p-5">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#174ec4]" />
            <h2 className="font-bold text-slate-950">What you own</h2>
          </div>
          {topHoldings.length ? (
            <div className="space-y-3">
              {topHoldings.map((holding) => (
                <div key={holding.id}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <p className="font-semibold text-slate-950">{holding.stockName}</p>
                    <p className="font-bold text-slate-700">{holding.percentage?.toFixed(2)}%</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#174ec4] to-[#38a3ff]"
                      style={{ width: `${Math.min((holding.percentage || 0) * 8, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{holding.sector || 'Sector unavailable'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Holdings are not available from the current source, so portfolio-level judgement should be limited.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
