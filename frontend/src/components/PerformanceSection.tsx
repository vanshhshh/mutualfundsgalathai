'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FundDetails } from '@/lib/api';

interface PerformanceSectionProps {
  fund: FundDetails;
}

export default function PerformanceSection({ fund }: PerformanceSectionProps) {
  // Prepare performance data
  const performanceData = [
    {
      period: '1Y',
      fund: fund.performance?.returns1Y ?? null,
      benchmark: fund.performance?.benchmarkReturns1Y ?? null,
    },
    {
      period: '3Y',
      fund: fund.performance?.returns3Y ?? null,
      benchmark: fund.performance?.benchmarkReturns3Y ?? null,
    },
    {
      period: '5Y',
      fund: fund.performance?.returns5Y ?? null,
      benchmark: fund.performance?.benchmarkReturns5Y ?? null,
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Performance</h2>
      <div className="metric-card">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="period" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
              formatter={(value) => {
                if (value === null || value === undefined) {
                  return 'N/A';
                }

                return `${(value as number).toFixed(2)}%`;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="fund"
              stroke="#2563EB"
              strokeWidth={2}
              dot={{ fill: '#2563EB', r: 5 }}
              name="Fund Return"
            />
            <Line
              type="monotone"
              dataKey="benchmark"
              stroke="#9CA3AF"
              strokeWidth={2}
              dot={{ fill: '#9CA3AF', r: 5 }}
              name={fund.performance?.benchmarkName || 'Benchmark'}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
