'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Gauge,
  LineChart,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const sceneCopy = [
  {
    eyebrow: 'Scene 01 / Search',
    title: 'Ask for any mutual fund.',
    body: 'Start with the fund name and get a decision-ready view in seconds.',
  },
  {
    eyebrow: 'Scene 02 / Verdict',
    title: 'See the answer first.',
    body: 'A clear recommendation leads, while the supporting numbers stay close.',
  },
  {
    eyebrow: 'Scene 03 / Risk Radar',
    title: 'Spot the hidden drag.',
    body: 'Expense, volatility, consistency, and concentration risks surface together.',
  },
  {
    eyebrow: 'Scene 04 / Compare',
    title: 'Compare choices side by side.',
    body: 'Shortlist alternatives without losing the original fund context.',
  },
  {
    eyebrow: 'Scene 05 / Decide',
    title: 'Invest with fewer blind spots.',
    body: 'MUTUALFUNDSGALATHAI turns noisy facts into a practical next step.',
  },
];

const riskSignals = [
  { label: 'Expense drag', value: '0.68%', tone: 'good' },
  { label: 'Volatility band', value: 'High', tone: 'watch' },
  { label: 'Top 10 holding weight', value: '47%', tone: 'alert' },
];

export default function ProductPromo() {
  return (
    <section className="promo-section" aria-label="20 second MUTUALFUNDSGALATHAI product promo">
      <div className="promo-shell">
        <div className="promo-copy-stack">
          <span className="brand-chip">20-Second Product Promo</span>
          {sceneCopy.map((scene, index) => (
            <div className={`promo-copy promo-copy-${index + 1}`} key={scene.title}>
              <p className="promo-eyebrow">{scene.eyebrow}</p>
              <h2>{scene.title}</h2>
              <p>{scene.body}</p>
            </div>
          ))}
          <div className="promo-actions">
            <Link href="/compare" className="promo-primary-action">
              Compare Funds
              <ArrowRight size={16} />
            </Link>
            <div className="promo-timer" aria-hidden="true">
              <span />
            </div>
          </div>
        </div>

        <div className="promo-stage" aria-hidden="true">
          <div className="promo-gridline promo-gridline-a" />
          <div className="promo-gridline promo-gridline-b" />
          <div className="promo-orbit promo-orbit-a" />
          <div className="promo-orbit promo-orbit-b" />

          <div className="promo-device">
            <div className="promo-device-bar">
              <div>
                <span />
                <span />
                <span />
              </div>
              <p>MUTUALFUNDSGALATHAI</p>
            </div>

            <div className="promo-search-card">
              <Search size={17} />
              <span>Parag Parikh Flexi Cap Fund</span>
              <Sparkles size={16} />
            </div>

            <div className="promo-verdict-card">
              <div className="promo-verdict-header">
                <CheckCircle2 size={20} />
                <span>Decision Verdict</span>
              </div>
              <strong>Worth considering</strong>
              <p>Strong consistency, moderate expense drag, watch portfolio concentration.</p>
            </div>

            <div className="promo-chart-card">
              <div className="promo-chart-head">
                <LineChart size={17} />
                <span>Performance vs Benchmark</span>
              </div>
              <div className="promo-chart">
                <span className="promo-bar promo-bar-1" />
                <span className="promo-bar promo-bar-2" />
                <span className="promo-bar promo-bar-3" />
                <span className="promo-bar promo-bar-4" />
                <span className="promo-bar promo-bar-5" />
              </div>
            </div>

            <div className="promo-radar-card">
              <div className="promo-radar-visual">
                <Radar size={60} />
                <span />
              </div>
              <div className="promo-risks">
                {riskSignals.map((risk) => (
                  <div className={`promo-risk promo-risk-${risk.tone}`} key={risk.label}>
                    <span>{risk.label}</span>
                    <strong>{risk.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="promo-compare-card">
              <div>
                <p>Fund A</p>
                <strong>8.4</strong>
                <span>Risk-adjusted score</span>
              </div>
              <div>
                <p>Fund B</p>
                <strong>7.1</strong>
                <span>Risk-adjusted score</span>
              </div>
            </div>

            <div className="promo-ai-card">
              <BrainCircuit size={20} />
              <p>AI explanation backed by deterministic fund checks.</p>
            </div>

            <div className="promo-final-badge">
              <ShieldCheck size={22} />
              <div>
                <span>Investor-ready</span>
                <strong>Clarity before capital</strong>
              </div>
            </div>

            <div className="promo-floating promo-floating-risk">
              <AlertTriangle size={15} />
              Hidden risk found
            </div>
            <div className="promo-floating promo-floating-score">
              <Gauge size={15} />
              Score refreshed
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
