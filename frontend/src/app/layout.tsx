import type { Metadata } from 'next';
import { Manrope, Sora } from 'next/font/google';
import Header from '@/components/Header';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'MUTUALFUNDSGALATHAI - Understand Before You Invest',
  description: 'Search any mutual fund, understand it instantly, see hidden risks, and make confident investment decisions with MUTUALFUNDSGALATHAI.',
  keywords: 'mutual fund, investment, finance, risk analysis',
  openGraph: {
    title: 'MUTUALFUNDSGALATHAI',
    description: 'The only decision intelligence platform for mutual funds',
    siteName: 'MUTUALFUNDSGALATHAI',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${sora.variable}`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
