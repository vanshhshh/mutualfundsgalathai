'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FundDetails } from '@/lib/api';
import {
  AlertCircle,
  Scale,
  ShieldAlert,
  Briefcase,
  Newspaper,
  Lightbulb,
  SearchCheck,
} from 'lucide-react';

interface AIExplanationProps {
  fund: FundDetails;
}

function formatPercent(value: number | null): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  return `${value.toFixed(2)}%`;
}

function scoreTone(score: number): string {
  if (score >= 7.5) {
    return 'text-emerald-700';
  }
  if (score >= 5) {
    return 'text-amber-700';
  }
  return 'text-red-700';
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-card">
      <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${scoreTone(value)}`}>{value.toFixed(1)}/10</p>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items.length) {
    return <p className="text-sm text-gray-500">No additional confirmed signals.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="text-sm text-gray-700">
          • {item}
        </li>
      ))}
    </ul>
  );
}

export default function AIExplanationPanel({ fund }: AIExplanationProps) {
  const explanation = fund.aiExplanation;

  if (!explanation) {
    return (
      <div className="mb-8 p-6 sm:p-8 bg-white border border-gray-200 rounded-lg text-center">
        <p className="text-gray-600">Loading insights...</p>
      </div>
    );
  }

  const dataIntegrityWarning = explanation.data_integrity_check.status.toLowerCase() === 'warning';

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Institutional Audit Memo</h2>
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="metric-card border border-red-200 bg-red-50/60"
        >
          <h3 className="font-semibold text-red-800 mb-2">Core Verdict</h3>
          <p className="text-red-900 leading-relaxed font-medium">{explanation.verdict}</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ScoreCard label="Alpha Score" value={explanation.scores.alpha_score} />
          <ScoreCard label="Risk Score" value={explanation.scores.risk_score} />
          <ScoreCard label="Cost Efficiency" value={explanation.scores.cost_efficiency_score} />
          <ScoreCard label="Trust Score" value={explanation.scores.trust_score} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="metric-card border border-indigo-200 bg-indigo-50/60"
        >
          <h3 className="font-semibold text-indigo-900 mb-2">Final Verdict</h3>
          <p className="text-indigo-950 font-semibold">{explanation.final_verdict.classification}</p>
          <ul className="mt-2 space-y-1">
            {explanation.final_verdict.rationale.map((line, index) => (
              <li key={index} className="text-sm text-indigo-900">
                • {line}
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="metric-card"
          >
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-red-600" />
              Alpha Engine
            </h3>
            <p className="text-sm text-gray-700">
              Excess Return vs Benchmark: 1Y{' '}
              {formatPercent(explanation.alpha_engine.excess_return_vs_benchmark.one_year)}, 3Y{' '}
              {formatPercent(explanation.alpha_engine.excess_return_vs_benchmark.three_year)}, 5Y{' '}
              {formatPercent(explanation.alpha_engine.excess_return_vs_benchmark.five_year)}
            </p>
            <p className="text-sm text-gray-700 mt-2">
              Classification: <span className="font-semibold">{explanation.alpha_engine.alpha_classification}</span>
            </p>
            <p className="text-sm text-gray-700 mt-2">{explanation.alpha_engine.alpha_consistency_note}</p>
            <p className="text-sm text-gray-700 mt-2">{explanation.alpha_engine.luck_vs_skill_assessment}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="metric-card"
          >
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Cost vs Value Engine
            </h3>
            <p className="text-sm text-gray-700">{explanation.cost_value_engine.expense_ratio_assessment}</p>
            <p className="text-sm font-semibold text-gray-900 mt-2">
              {explanation.cost_value_engine.cost_efficiency_verdict}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="metric-card"
          >
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              Portfolio Intelligence
            </h3>
            <p className="text-sm text-gray-700 mb-2">{explanation.portfolio_intelligence.concentration_assessment}</p>
            <p className="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-2">Holdings Quality</p>
            <BulletList items={explanation.portfolio_intelligence.holdings_quality} />
            <p className="text-xs font-semibold tracking-wide uppercase text-gray-500 mt-3 mb-2">
              Sector Risk Mapping
            </p>
            <BulletList items={explanation.portfolio_intelligence.sector_risk_mapping} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="metric-card"
          >
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              Risk Engine
            </h3>
            <p className="text-sm text-gray-700 mb-2">{explanation.risk_engine.volatility_context}</p>
            <BulletList items={explanation.risk_engine.hidden_risks} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="metric-card"
          >
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-red-600" />
              Fund Manager Intelligence
            </h3>
            <p className="text-sm text-gray-700">{explanation.manager_intelligence.tenure_assessment}</p>
            <p className="text-sm text-gray-700 mt-2">
              {explanation.manager_intelligence.alignment_with_performance}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`metric-card ${
              dataIntegrityWarning ? 'border border-amber-200 bg-amber-50/70' : 'border border-emerald-200 bg-emerald-50/70'
            }`}
          >
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <SearchCheck className="w-5 h-5 text-red-600" />
              Data Integrity Check
            </h3>
            <p className="text-sm text-gray-700">
              Status: <span className="font-semibold uppercase">{explanation.data_integrity_check.status}</span>
            </p>
            <p className="text-sm text-gray-700 mt-2">{explanation.data_integrity_check.message}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="metric-card"
          >
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-red-600" />
              News + Sentiment Layer
            </h3>
            <p className="text-sm text-gray-700 mb-2">{explanation.news_sentiment_layer.summary}</p>
            <BulletList items={explanation.news_sentiment_layer.signals} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="metric-card"
          >
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-red-600" />
              What Most Investors Miss
            </h3>
            <BulletList items={explanation.contrarian_insights} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="metric-card"
          >
            <h3 className="font-semibold text-gray-900 mb-3">Reality Check</h3>
            <BulletList items={explanation.reality_check} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="metric-card border border-amber-200 bg-amber-50/70"
        >
          <h3 className="font-semibold text-amber-900 mb-2">Bottom Line</h3>
          <p className="text-amber-900 leading-relaxed">{explanation.bottom_line}</p>
        </motion.div>
      </div>
    </div>
  );
}
