'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import { FundDetails } from '@/lib/api';

interface HiddenRisksProps {
  fund: FundDetails;
}

export default function HiddenRisks({ fund }: HiddenRisksProps) {
  const risks = [];

  if (fund.riskFlags?.highExpense) {
    risks.push({
      title: 'Higher Costs',
      description: `Expense ratio ${fund.expenseRatio ?? 'N/A'}% exceeds category average (${fund.categoryAvgExpense ?? 'N/A'}%)`,
      icon: TrendingUp,
    });
  }

  if (fund.riskFlags?.highConcentration) {
    risks.push({
      title: 'Concentrated Bets',
      description: `Top 3 holdings represent ${fund.concentration !== null && fund.concentration !== undefined ? fund.concentration.toFixed(2) : 'N/A'}% of portfolio`,
      icon: Zap,
    });
  }

  if (fund.riskFlags?.highVolatility) {
    risks.push({
      title: 'High Volatility',
      description: `Volatility of ${fund.volatility !== null && fund.volatility !== undefined ? fund.volatility.toFixed(2) : 'N/A'}% indicates larger price swings`,
      icon: BarChart3,
    });
  }

  if (fund.riskFlags?.lowConsistency) {
    risks.push({
      title: 'Inconsistent Returns',
      description: 'Returns vary significantly year to year, making future behavior harder to predict.',
      icon: AlertCircle,
    });
  }

  if (risks.length === 0) {
    return (
      <div className="mb-8 p-6 sm:p-8 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-700 text-center">No major hidden risks detected for this fund.</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">What&apos;s Not Obvious</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {risks.map((risk, i) => {
          const IconComponent = risk.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="metric-card"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <IconComponent className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{risk.title}</h3>
                  <p className="text-sm text-gray-600">{risk.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
