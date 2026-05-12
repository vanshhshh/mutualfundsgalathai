'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, TrendingUp, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import type { FundDetails } from '@/lib/api';
import {
  getRiskBgColor,
  getRiskBorderColor,
  getRiskTextColor,
  type RiskLevel,
} from '@/lib/utils';

interface SummaryCardProps {
  fund: FundDetails;
  onBuyClick?: () => void;
}

export default function SummaryCard({ fund, onBuyClick }: SummaryCardProps) {
  const riskLevel = (fund.riskLevel || 'Moderate') as RiskLevel;
  const verdict = fund.aiExplanation?.verdict || 'Loading verdict...';

  const riskIcon = () => {
    switch (riskLevel) {
      case 'Low':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Moderate':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'High':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'Very High':
        return <AlertCircle className="w-5 h-5 text-red-800" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glassmorphism p-6 sm:p-8 mb-8 border ${getRiskBorderColor(riskLevel)} ${getRiskBgColor(riskLevel)}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{fund.name}</h1>
            <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
              {fund.category}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              {riskIcon()}
              <span className={`text-sm font-semibold ${getRiskTextColor(riskLevel)}`}>
                {riskLevel} Risk
              </span>
            </div>
            <span className="text-xs text-gray-500">• {fund.amc}</span>
          </div>

          <div className="text-lg sm:text-xl text-gray-800 font-medium leading-relaxed max-w-2xl">
            "{verdict}"
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            {onBuyClick && (
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#174ec4] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123ea2]"
                onClick={onBuyClick}
              >
                <ShoppingCart size={16} />
                Buy the Fund
              </button>
            )}
            {fund.currentNav && (
              <div className="rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-medium text-emerald-800">
                AMFI NAV {fund.currentNav.nav === null ? 'N/A' : `Rs ${fund.currentNav.nav.toFixed(4)}`} as of{' '}
                {fund.currentNav.date}
              </div>
            )}
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <span className="text-xs text-gray-600">Insight Ready</span>
        </div>
      </div>
    </motion.div>
  );
}
