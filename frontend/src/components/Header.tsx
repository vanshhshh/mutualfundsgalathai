'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { label: 'Search', href: '/' },
    { label: 'Compare', href: '/compare' },
    { label: 'How It Works', href: '/#workflow' },
    { label: 'Risk Radar', href: '/#features' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#d9e4f7] bg-white/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,58,140,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#174ec4] to-[#38a3ff] rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm tracking-wide">MG</span>
            </div>
            <div className="leading-tight">
              <p className="headline-font text-xs tracking-[0.22em] text-[#174ec4] font-semibold">
                MUTUALFUNDSGALATHAI
              </p>
              <p className="text-[11px] text-gray-500">Mutual Fund Decision Desk</p>
            </div>
          </Link>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-gray-700 hover:text-[#174ec4] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/compare"
              className="rounded-full bg-[#174ec4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123ea2] transition-colors"
            >
              Start Comparing
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-lg px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-[#174ec4]"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/compare"
              className="block rounded-lg bg-[#174ec4] px-4 py-2 text-white text-center font-semibold"
              onClick={() => setIsOpen(false)}
            >
              Start Comparing
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
