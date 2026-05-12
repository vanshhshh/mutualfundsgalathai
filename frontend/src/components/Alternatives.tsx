'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FundDetails } from '@/lib/api';
import { formatPercent } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface AlternativesProps {
  fund: FundDetails;
}

export default function Alternatives({ fund }: AlternativesProps) {
  const alternatives = fund.alternatives || [];

  if (alternatives.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Better Alternatives</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alternatives.map((alt, i) => (
          <motion.div
            key={alt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="metric-card group cursor-pointer"
          >
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{alt.name}</h3>
            <p className="text-sm text-blue-600 font-medium mb-3">{alt.reason}</p>
            <div className="space-y-2 text-xs text-gray-600 mb-4">
              <p>
                Expense Ratio:{' '}
                <span className="font-semibold text-gray-900">
                  {alt.expenseRatio === null ? 'N/A' : `${alt.expenseRatio}%`}
                </span>
              </p>
              {alt.returns1Y !== null && alt.returns1Y !== undefined && (
                <p>
                  1Y Return: <span className="font-semibold text-gray-900">{formatPercent(alt.returns1Y)}</span>
                </p>
              )}
            </div>
            <Link
              href={`/funds/${alt.id}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View Fund <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
