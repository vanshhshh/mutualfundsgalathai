'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShieldCheck, Radar, LineChart, Sparkles, ArrowRight, SearchCheck, Scale, ShoppingCart } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import ProductPromo from '@/components/ProductPromo';

export default function Home() {
  const features = [
    {
      title: 'Decision-First Interface',
      description: 'Verdict comes first, numbers follow. You know the direction before you parse every metric.',
      icon: Sparkles,
    },
    {
      title: 'Risk Radar',
      description: 'Concentration, volatility, expense drag, and consistency are surfaced in plain language.',
      icon: Radar,
    },
    {
      title: 'Trust Through Structure',
      description: 'Source checks separate AMFI facts, verified factsheets, and unavailable fields.',
      icon: ShieldCheck,
    },
  ];

  const workflow = [
    {
      title: 'Search',
      description: 'Find a real scheme and see AMFI NAV freshness when a Direct Growth match is available.',
      icon: SearchCheck,
    },
    {
      title: 'Audit',
      description: 'Read the verdict, source dates, costs, return context, and hidden risk flags in one flow.',
      icon: ShieldCheck,
    },
    {
      title: 'Compare',
      description: 'Shortlist two or three funds before deciding where the trade-off actually sits.',
      icon: Scale,
    },
    {
      title: 'Buy',
      description: 'Open the fund on Groww, Zerodha Coin, Dhan, ET Money, or Upstox when exact links are available.',
      icon: ShoppingCart,
    },
  ];

  return (
    <main className="min-h-screen page-atmosphere overflow-hidden">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative">
        <div className="absolute -top-28 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-blue-300/40 to-cyan-200/30 blur-3xl pointer-events-none" />
        <div className="absolute top-56 -left-28 w-72 h-72 rounded-full bg-gradient-to-br from-indigo-200/35 to-sky-200/25 blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 relative"
        >
          <span className="brand-chip mb-5">Built for Clarity, Not Noise</span>
          <h1 className="headline-font text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">
            MUTUALFUNDSGALATHAI
          </h1>
          <p className="text-xl sm:text-2xl text-slate-700 mb-6 font-medium">
            Understand before you invest.
          </p>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Search any mutual fund, surface hidden risk signals, and get practical AI guidance designed for real investor decisions.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 max-w-3xl mx-auto"
        >
          <SearchBar />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14"
        >
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 rounded-full bg-[#174ec4] px-6 py-3 text-white font-semibold hover:bg-[#123ea2] transition-colors"
          >
            Compare Funds
            <ArrowRight size={16} />
          </Link>
          <span className="text-sm text-slate-600 inline-flex items-center gap-2">
            <LineChart size={16} className="text-[#174ec4]" />
            AMFI NAV + deterministic insight engine
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.36 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16"
        >
          {[
            { metric: '<10s', label: 'Fund understanding time' },
            { metric: '3-Layer', label: 'Risk visibility stack' },
            { metric: '1 Verdict', label: 'Clarity-first recommendation' },
          ].map((item) => (
            <div key={item.label} className="metric-card text-center">
              <p className="headline-font text-2xl font-bold text-[#123ea2]">{item.metric}</p>
              <p className="mt-1 text-sm text-slate-600">{item.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.section
          id="workflow"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mb-16 rounded-3xl border border-[#d7e3f7] bg-white/78 p-5 shadow-[0_16px_45px_rgba(22,47,95,0.09)] backdrop-blur"
        >
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="brand-chip mb-3">Cleaner Investing Flow</span>
              <h2 className="headline-font text-2xl font-bold text-slate-950">From search to purchase handoff</h2>
            </div>
            <p className="max-w-xl text-sm text-slate-600">
              The site keeps source freshness visible, separates analysis from live NAV data, and sends users to
              external apps only after they review the fund.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {workflow.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl border border-[#d7e3f7] bg-[#f8fbff] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#174ec4]">
                      <Icon size={19} />
                    </div>
                    <span className="text-xs font-bold text-slate-400">0{index + 1}</span>
                  </div>
                  <h3 className="font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        <ProductPromo />

        {/* Features Grid */}
        <motion.div
          id="features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="metric-card"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-[#174ec4] flex items-center justify-center mb-4">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
            </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#d7e3f7] bg-white/70 backdrop-blur py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="headline-font text-sm tracking-[0.2em] text-[#174ec4] font-semibold">
              MUTUALFUNDSGALATHAI
            </p>
            <p className="text-xs text-slate-600 mt-1">Decision intelligence for mutual fund investors</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <Link href="/" className="hover:text-[#174ec4]">Search</Link>
            <Link href="/compare" className="hover:text-[#174ec4]">Compare</Link>
            <span className="hidden sm:inline text-slate-400">|</span>
            <p className="text-xs sm:text-sm">2026 MUTUALFUNDSGALATHAI</p>
          </div>
          <div className="text-xs text-slate-500">
            Built for long-term investors in India
          </div>
        </div>
      </footer>
    </main>
  );
}
