'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, PlusCircle, CheckCircle2, ShoppingCart, ArrowRight } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import { fundApi, Fund, type CompareResponse, type CompareFund } from '@/lib/api';
import { formatPercent } from '@/lib/utils';
import BuyFundModal from '@/components/BuyFundModal';
import Link from 'next/link';

export default function Compare() {
  const [selectedFunds, setSelectedFunds] = useState<Fund[]>([]);
  const [comparison, setComparison] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [buyFund, setBuyFund] = useState<Fund | CompareFund | null>(null);

  const toNumberOrNull = (value: unknown): number | null => {
    return typeof value === 'number' ? value : null;
  };

  const metrics: Array<{
    label: string;
    key: keyof CompareFund;
    format: (value: unknown) => string;
  }> = [
    {
      label: 'Expense Ratio',
      key: 'expenseRatio',
      format: (value: unknown) => {
        const numericValue = toNumberOrNull(value);
        return numericValue === null ? 'N/A' : `${numericValue}%`;
      },
    },
    {
      label: '1Y Return',
      key: 'returns1Y',
      format: (value: unknown) => formatPercent(toNumberOrNull(value)),
    },
    {
      label: '3Y Return',
      key: 'returns3Y',
      format: (value: unknown) => formatPercent(toNumberOrNull(value)),
    },
    {
      label: '5Y Return',
      key: 'returns5Y',
      format: (value: unknown) => formatPercent(toNumberOrNull(value)),
    },
    {
      label: 'Volatility',
      key: 'volatility',
      format: (value: unknown) => {
        const numericValue = toNumberOrNull(value);
        return numericValue === null ? 'N/A' : `${numericValue.toFixed(2)}%`;
      },
    },
    {
      label: 'Risk Level',
      key: 'riskLevel',
      format: (value: unknown) => (typeof value === 'string' ? value : 'N/A'),
    },
  ];

  const handleAddFund = (fund: Fund) => {
    if (selectedFunds.some(f => f.id === fund.id)) return;
    if (selectedFunds.length >= 3) return;

    setSelectedFunds([...selectedFunds, fund]);
    setComparison(null);
  };

  const handleRemoveFund = (fundId: string) => {
    setSelectedFunds(selectedFunds.filter(f => f.id !== fundId));
    setComparison(null);
  };

  const handleCompare = async () => {
    if (selectedFunds.length < 2) {
      alert('Select at least 2 funds to compare');
      return;
    }

    setLoading(true);
    try {
      const data = await fundApi.compare(selectedFunds.map(f => f.id));
      setComparison(data);
    } catch (error) {
      console.error('Comparison error:', error);
      alert('Failed to generate comparison');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen page-atmosphere">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <span className="brand-chip mb-3">Comparison Lab</span>
          <h1 className="headline-font text-4xl font-bold text-slate-900 mb-2">Compare Funds Side by Side</h1>
          <p className="text-slate-600">Select up to 3 funds and generate a practical AI-backed comparison.</p>
        </div>

        {/* Fund Selection */}
        <div className="mb-8 metric-card">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Add Funds to Compare
          </label>
          <SearchBar
            placeholder="Search and add a fund to compare"
            onSelectFund={handleAddFund}
            maxResults={10}
            showBuyActions={false}
          />
          <p className="text-xs text-slate-500 mt-3">
            Tip: Pick funds from the same category for a fair risk-return comparison.
          </p>
        </div>

        {/* Selected Funds */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Selected ({selectedFunds.length}/3)
          </h2>

          {selectedFunds.length === 0 ? (
            <div className="metric-card text-center py-10">
              <PlusCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-slate-600">No funds selected yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedFunds.map((fund) => (
                <div key={fund.id} className="metric-card relative">
                  <button
                    onClick={() => handleRemoveFund(fund.id)}
                    className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={16} className="text-gray-600" />
                  </button>
                  <div className="pr-8">
                    <h3 className="font-semibold text-gray-900 mb-1">{fund.name}</h3>
                    <p className="text-xs text-gray-600">{fund.amc}</p>
                    <p className="text-xs text-gray-600">{fund.category}</p>
                    {fund.currentNav && (
                      <p className="mt-2 text-xs font-medium text-emerald-700">
                        AMFI NAV {fund.currentNav.nav === null ? 'N/A' : `Rs ${fund.currentNav.nav.toFixed(4)}`} as of{' '}
                        {fund.currentNav.date}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedFunds.length >= 2 && (
            <button
              onClick={handleCompare}
              disabled={loading}
              className="mt-5 px-6 py-2.5 bg-[#174ec4] text-white rounded-full hover:bg-[#123ea2] disabled:opacity-50 transition font-semibold"
            >
              {loading ? 'Generating Comparison...' : 'Generate Comparison'}
            </button>
          )}
        </motion.div>

        {/* Comparison Results */}
        {comparison && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="headline-font text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              Comparison Results
            </h2>

            {/* AI Comparison Summary */}
            <div className="metric-card">
              <h3 className="font-semibold text-gray-900 mb-3">AI Summary</h3>
              <p className="text-gray-700 leading-relaxed">{comparison.comparison}</p>
            </div>

            {/* Side-by-side metrics */}
            <div className="overflow-x-auto metric-card p-0">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="bg-white border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Metric
                    </th>
                    {comparison.funds.map((fund: CompareFund) => (
                      <th
                        key={fund.id}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-900"
                      >
                        {fund.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric) => (
                    <tr key={metric.key} className="border-b border-gray-100 hover:bg-blue-50/60">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {metric.label}
                      </td>
                      {comparison.funds.map((fund: CompareFund) => (
                        <td
                          key={fund.id}
                          className="px-4 py-3 text-sm text-gray-700"
                        >
                          {metric.format(fund[metric.key as keyof typeof fund])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparison.funds.map((fund) => (
                <div key={fund.id} className="metric-card">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Next step</p>
                  <h3 className="mt-2 font-semibold text-slate-950 line-clamp-2">{fund.name}</h3>
                  {fund.currentNav && (
                    <p className="mt-2 text-xs text-emerald-700">
                      AMFI NAV {fund.currentNav.nav === null ? 'N/A' : `Rs ${fund.currentNav.nav.toFixed(4)}`} as of{' '}
                      {fund.currentNav.date}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/funds/${fund.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#174ec4]/25 px-3 py-2 text-xs font-semibold text-[#174ec4] hover:bg-blue-50"
                    >
                      View
                      <ArrowRight size={14} />
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#174ec4] px-3 py-2 text-xs font-semibold text-white hover:bg-[#123ea2]"
                      onClick={() => setBuyFund(fund)}
                    >
                      <ShoppingCart size={14} />
                      Buy the Fund
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear & Compare Again */}
            <button
              onClick={() => {
                setSelectedFunds([]);
                setComparison(null);
              }}
              className="px-6 py-2 bg-gray-200 text-gray-900 rounded-full hover:bg-gray-300 transition font-medium"
            >
              Compare Different Funds
            </button>
          </motion.div>
        )}
      </div>
      <BuyFundModal fund={buyFund} isOpen={!!buyFund} onClose={() => setBuyFund(null)} />
    </main>
  );
}
