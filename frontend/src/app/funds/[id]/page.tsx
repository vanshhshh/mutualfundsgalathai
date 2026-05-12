'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fundApi, type FundDetails as FundDetailsModel } from '@/lib/api';
import { Loader, AlertCircle, ShoppingCart, ShieldCheck } from 'lucide-react';
import KeyMetrics from '@/components/KeyMetrics';
import HiddenRisks from '@/components/HiddenRisks';
import AIExplanationPanel from '@/components/AIExplanationPanel';
import PortfolioBreakdown from '@/components/PortfolioBreakdown';
import PerformanceSection from '@/components/PerformanceSection';
import Alternatives from '@/components/Alternatives';
import BuyFundModal from '@/components/BuyFundModal';
import FundInsightDashboard from '@/components/FundInsightDashboard';

export default function FundDetailsPage() {
  const params = useParams();
  const fundId = params.id as string;
  const [fund, setFund] = useState<FundDetailsModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBuyOpen, setIsBuyOpen] = useState(false);

  useEffect(() => {
    const fetchFund = async () => {
      if (!fundId) return;

      try {
        setLoading(true);
        const data = await fundApi.getById(fundId);
        setFund(data);
      } catch (err) {
        console.error('Error fetching fund:', err);
        setError('Failed to load fund details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFund();
  }, [fundId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading fund insights...</p>
        </div>
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error || 'Fund not found'}</p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen page-atmosphere">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <FundInsightDashboard fund={fund} onBuyClick={() => setIsBuyOpen(true)} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <KeyMetrics fund={fund} />
            <HiddenRisks fund={fund} />
          </div>

          <div className="lg:col-span-1">
            <div className="metric-card sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Fund Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Fund Manager</p>
                  <p className="font-medium text-gray-900">{fund.fundManager || 'N/A'}</p>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-gray-600">Category</p>
                  <p className="font-medium text-gray-900">{fund.category}</p>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-gray-600">AMC</p>
                  <p className="font-medium text-gray-900">{fund.amc}</p>
                </div>
                {fund.source?.planBasis && (
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-gray-600">Plan Basis</p>
                    <p className="font-medium text-gray-900">{fund.source.planBasis}</p>
                  </div>
                )}
                {fund.source?.asOfDate && (
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-gray-600">Data As Of</p>
                    <p className="font-medium text-gray-900">{fund.source.asOfDate}</p>
                  </div>
                )}
                {fund.source?.provider && (
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-gray-600">Source</p>
                    <p className="font-medium text-gray-900">{fund.source.provider}</p>
                  </div>
                )}
                {fund.currentNav && (
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-gray-600">Live NAV Source</p>
                    <p className="font-medium text-gray-900">
                      AMFI - {fund.currentNav.date}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Scheme code {fund.currentNav.schemeCode}
                      {fund.currentNav.isin ? `, ISIN ${fund.currentNav.isin}` : ''}
                    </p>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#174ec4] px-4 py-2.5 font-semibold text-white transition hover:bg-[#123ea2]"
                onClick={() => setIsBuyOpen(true)}
              >
                <ShoppingCart size={16} />
                Buy the Fund
              </button>
              <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs text-emerald-900">
                <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                <p>
                  NAV and ISIN are enriched from AMFI when a Direct Growth match is found. Analysis fields still show
                  their own source date.
                </p>
              </div>
            </div>
          </div>
        </div>

        <AIExplanationPanel fund={fund} />
        <PortfolioBreakdown fund={fund} />
        <PerformanceSection fund={fund} />
        <Alternatives fund={fund} />
      </div>
      <BuyFundModal fund={fund} isOpen={isBuyOpen} onClose={() => setIsBuyOpen(false)} />
    </main>
  );
}
