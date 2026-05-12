module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        'bg-light': '#FAFAFA',
        'card': '#FFFFFF',
        'border': '#E5E7EB',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'risk-low': '#10B981',
        'risk-moderate': '#F59E0B',
        'risk-high': '#EF4444',
      },
      backdropFilter: {
        'md': 'blur(12px)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
