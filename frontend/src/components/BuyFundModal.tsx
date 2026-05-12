'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, ExternalLink, ShieldCheck, Smartphone, X } from 'lucide-react';
import type { CurrentNav, PurchaseLink } from '@/lib/api';

interface BuyableFund {
  name: string;
  amc?: string | null;
  currentNav?: CurrentNav | null;
  purchaseLinks?: PurchaseLink[];
}

interface BuyFundModalProps {
  fund: BuyableFund | null;
  isOpen: boolean;
  onClose: () => void;
}

const platformAccent: Record<string, string> = {
  Groww: 'from-emerald-500 to-teal-500',
  'Zerodha Coin': 'from-sky-500 to-blue-600',
  Dhan: 'from-violet-500 to-indigo-600',
  'ET Money': 'from-amber-500 to-orange-500',
  Upstox: 'from-purple-500 to-fuchsia-500',
};

function fallbackSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function fallbackLinks(fundName: string): PurchaseLink[] {
  const base = fundName
    .replace(/\b(direct|regular|plan|growth|option|idcw|dividend)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const slug = fallbackSlug(`${base} direct growth`);

  return [
    {
      platform: 'Groww',
      url: `https://groww.in/mutual-funds/${slug}`,
      confidence: 'assisted',
      note: 'Best-effort Direct Growth page generated from the scheme name. Verify before investing.',
    },
    {
      platform: 'Dhan',
      url: `https://dhan.co/mutual-funds/${slug}/`,
      confidence: 'assisted',
      note: 'Best-effort Direct Growth page generated from the scheme name. Verify before investing.',
    },
  ];
}

function confidenceLabel(link: PurchaseLink): string {
  if (link.confidence === 'exact') return 'Exact fund link';
  if (link.confidence === 'high') return 'Scheme page';
  return 'Search-assisted';
}

export default function BuyFundModal({ fund, isOpen, onClose }: BuyFundModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !fund) {
    return null;
  }

  const links = fund.purchaseLinks?.length ? fund.purchaseLinks : fallbackLinks(fund.name);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close buy options"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-[101] w-full max-w-2xl overflow-hidden rounded-3xl border border-[#c9d8f2] bg-white shadow-[0_28px_90px_rgba(15,45,100,0.28)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#d7e3f7] bg-[#f4f8ff] px-5 py-4 sm:px-6">
          <div>
            <span className="brand-chip mb-3">Buy the Fund</span>
            <h2 className="headline-font text-xl font-bold text-slate-950 sm:text-2xl">{fund.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{fund.amc || 'Mutual fund platform options'}</p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-slate-500 hover:bg-white hover:text-slate-900"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          {fund.currentNav && (
            <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck size={17} />
                AMFI NAV verified
              </div>
              <div>
                {fund.currentNav.nav === null ? 'NAV unavailable' : `NAV Rs ${fund.currentNav.nav.toFixed(4)}`} as of{' '}
                {fund.currentNav.date}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {links.map((link) => (
              <a
                key={`${link.platform}-${link.url}`}
                href={link.url}
                rel="noreferrer"
                className="group rounded-2xl border border-[#d7e3f7] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#174ec4] hover:shadow-[0_16px_34px_rgba(23,78,196,0.14)]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${
                      platformAccent[link.platform] || 'from-slate-500 to-slate-700'
                    } text-white`}
                  >
                    <Smartphone size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold text-slate-950">{link.platform}</h3>
                      <ExternalLink size={16} className="text-[#174ec4] group-hover:translate-x-0.5 transition" />
                    </div>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#174ec4]">
                      {confidenceLabel(link)}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{link.note}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p>
              These links open external investment platforms. Confirm scheme name, Direct/Regular plan, Growth/IDCW
              option, costs, and risk before placing an order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
