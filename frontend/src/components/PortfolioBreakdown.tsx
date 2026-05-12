'use client';

import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { FundDetails } from '@/lib/api';

interface PortfolioBreakdownProps {
  fund: FundDetails;
}

const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'];

export default function PortfolioBreakdown({ fund }: PortfolioBreakdownProps) {
  const holdings = fund.holdings || [];
  const shownHoldings = fund.source?.holdingsShown ?? holdings.length;
  const totalHoldings = fund.source?.totalHoldings ?? holdings.length;
  const holdingsHeading =
    totalHoldings > shownHoldings
      ? `Disclosed Holdings (${shownHoldings} of ${totalHoldings})`
      : `All Holdings (${holdings.length})`;

  const topHoldings = holdings
    .filter((holding) => holding.percentage !== null && holding.percentage !== undefined)
    .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))
    .slice(0, 5);

  const sectorMap = new Map<string, number>();
  holdings.forEach((h) => {
    if (h.percentage === null || h.percentage === undefined) {
      return;
    }

    const sector = h.sector || 'Other';
    sectorMap.set(sector, (sectorMap.get(sector) || 0) + h.percentage);
  });

  const sectorData = Array.from(sectorMap.entries()).map(([sector, percentage]) => ({
    name: sector,
    value: parseFloat(percentage.toFixed(1)),
  }));

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Portfolio Breakdown</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="metric-card">
          <h3 className="font-semibold text-gray-900 mb-4">Top Holdings</h3>
          {topHoldings.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topHoldings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="stockName"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Bar dataKey="percentage" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-center py-8">No holding data available</p>
          )}
        </div>

        <div className="metric-card">
          <h3 className="font-semibold text-gray-900 mb-4">Sector Allocation</h3>
          {sectorData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }: { value?: number }) => `${value ?? 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-center py-8">No sector data available</p>
          )}
        </div>
      </div>

      <div className="mt-6 metric-card">
        <h3 className="font-semibold text-gray-900 mb-2">{holdingsHeading}</h3>
        {totalHoldings > shownHoldings && (
          <p className="text-xs text-gray-600 mb-4">
            Showing verified disclosed holdings from the official factsheet rather than inferring the full portfolio.
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-600 font-semibold">Stock</th>
                <th className="text-left py-2 px-2 text-gray-600 font-semibold">Sector</th>
                <th className="text-right py-2 px-2 text-gray-600 font-semibold">Allocation</th>
              </tr>
            </thead>
            <tbody>
              {holdings.slice(0, 10).map((holding) => (
                <tr key={holding.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-2 font-medium text-gray-900">{holding.stockName}</td>
                  <td className="py-2 px-2 text-gray-600">{holding.sector || '-'}</td>
                  <td className="py-2 px-2 text-right font-medium text-gray-900">
                    {holding.percentage === null || holding.percentage === undefined
                      ? 'N/A'
                      : `${holding.percentage.toFixed(2)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
