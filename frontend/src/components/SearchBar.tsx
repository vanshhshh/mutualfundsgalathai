'use client';

import React, { useState } from 'react';
import { fundApi, Fund } from '@/lib/api';
import { ArrowRight, Loader, Search, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import BuyFundModal from '@/components/BuyFundModal';

interface SearchBarProps {
  placeholder?: string;
  maxResults?: number;
  onSelectFund?: (fund: Fund) => void;
  showBuyActions?: boolean;
}

export default function SearchBar({
  placeholder = 'Search any mutual fund',
  maxResults = 8,
  onSelectFund,
  showBuyActions,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buyFund, setBuyFund] = useState<Fund | null>(null);

  const shouldShowBuyActions = showBuyActions ?? !onSelectFund;

  const handleSearch = async (q: string) => {
    setQuery(q);
    setError(null);

    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const data = await fundApi.search(q, maxResults);
      setResults(data);
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setError('Unable to fetch funds right now');
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFund = (fund: Fund) => {
    setIsOpen(false);
    setQuery(fund.name);

    if (onSelectFund) {
      onSelectFund(fund);
      setQuery('');
      return;
    }

    router.push(`/funds/${fund.id}`);
  };

  const handleBuyFund = (fund: Fund) => {
    setIsOpen(false);
    setBuyFund(fund);
  };

  return (
    <div className="relative z-50 w-full">
      <div className="glassmorphism">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Search size={20} className="shrink-0 text-[#1959db]" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(event) => handleSearch(event.target.value)}
            onFocus={() => (results.length > 0 || loading || error) && setIsOpen(true)}
            className="flex-1 bg-transparent text-base text-gray-900 outline-none placeholder-gray-500"
          />
          {loading ? (
            <Loader size={20} className="animate-spin text-[#1959db]" />
          ) : (
            <span className="hidden sm:inline brand-chip">Live Search</span>
          )}
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full z-50 mt-2 max-h-[520px] w-full overflow-y-auto rounded-2xl border border-[#d7e3f7] bg-white shadow-[0_18px_40px_rgba(14,36,74,0.16)]"
        >
          {error ? (
            <div className="p-4 text-center text-sm text-red-600">{error}</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {loading ? 'Searching...' : 'No funds found'}
            </div>
          ) : (
            <ul>
              {results.map((fund, index) => (
                <motion.li
                  key={fund.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 transition last:border-b-0 hover:bg-blue-50 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => handleSelectFund(fund)}
                    >
                      <div className="font-medium text-gray-900">{fund.name}</div>
                      <div className="mt-1 text-xs text-gray-600">
                        {fund.amc} - {fund.category}
                      </div>
                      {fund.currentNav && (
                        <div className="mt-2 text-xs font-medium text-emerald-700">
                          AMFI NAV:{' '}
                          {fund.currentNav.nav === null ? 'N/A' : `Rs ${fund.currentNav.nav.toFixed(4)}`} as of{' '}
                          {fund.currentNav.date}
                        </div>
                      )}
                    </button>

                    <div className="flex shrink-0 items-center gap-2">
                      {shouldShowBuyActions && (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#174ec4]/25 bg-white px-3 py-2 text-xs font-semibold text-[#174ec4] hover:bg-[#174ec4] hover:text-white"
                          onClick={() => handleBuyFund(fund)}
                        >
                          <ShoppingCart size={14} />
                          Buy the Fund
                        </button>
                      )}
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#174ec4] px-3 py-2 text-xs font-semibold text-white hover:bg-[#123ea2]"
                        onClick={() => handleSelectFund(fund)}
                      >
                        View
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      )}

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}

      <BuyFundModal fund={buyFund} isOpen={!!buyFund} onClose={() => setBuyFund(null)} />
    </div>
  );
}
