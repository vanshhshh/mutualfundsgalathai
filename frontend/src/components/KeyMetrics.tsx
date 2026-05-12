'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FundDetails } from '@/lib/api';
import { formatCurrency, formatPercent } from '@/lib/utils';

interface KeyMetricsProps {
  fund: FundDetails;
}

export default function KeyMetrics({ fund }: KeyMetricsProps) {
  const metrics = [
    {
      label: 'Expense Ratio',
      value: fund.expenseRatio === null ? 'N/A' : `${fund.expenseRatio}%`,
      subtext:
        fund.categoryAvgExpense === null
          ? 'Category avg: N/A'
          : `Category avg: ${fund.categoryAvgExpense}%`,
    },
    {
      label: 'AUM',
      value: formatCurrency(fund.aum),
      subtext: 'Assets under management',
    },
    {
      label: '1Y Return',
      value: formatPercent(fund.performance?.returns1Y),
      subtext: fund.performance?.benchmarkReturns1Y
        ? `vs Benchmark: ${formatPercent(fund.performance.benchmarkReturns1Y)}`
        : '',
    },
    {
      label: '3Y Return',
      value: formatPercent(fund.performance?.returns3Y),
      subtext: fund.performance?.benchmarkReturns3Y
        ? `vs Benchmark: ${formatPercent(fund.performance.benchmarkReturns3Y)}`
        : '',
    },
    {
      label: '5Y Return',
      value: formatPercent(fund.performance?.returns5Y),
      subtext: fund.performance?.benchmarkReturns5Y
        ? `vs Benchmark: ${formatPercent(fund.performance.benchmarkReturns5Y)}`
        : '',
    },
    {
      label: 'Volatility',
      value: fund.volatility !== null && fund.volatility !== undefined ? `${fund.volatility.toFixed(2)}%` : 'N/A',
      subtext: 'Annualized volatility',
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Key Metrics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="metric-card"
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {metric.label}
            </p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
            {metric.subtext && <p className="text-xs text-gray-600">{metric.subtext}</p>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
