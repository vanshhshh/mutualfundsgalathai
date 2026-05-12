export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High' | 'Unknown';

export const getRiskColor = (risk: RiskLevel): string => {
  switch (risk) {
    case 'Low':
      return 'risk-low';
    case 'Moderate':
      return 'risk-moderate';
    case 'High':
    case 'Very High':
      return 'risk-high';
    default:
      return 'gray-500';
  }
};

export const getRiskBgColor = (risk: RiskLevel): string => {
  switch (risk) {
    case 'Low':
      return 'bg-green-50';
    case 'Moderate':
      return 'bg-yellow-50';
    case 'High':
      return 'bg-red-50';
    case 'Very High':
      return 'bg-red-100';
    default:
      return 'bg-gray-50';
  }
};

export const getRiskBorderColor = (risk: RiskLevel): string => {
  switch (risk) {
    case 'Low':
      return 'border-green-200';
    case 'Moderate':
      return 'border-yellow-200';
    case 'High':
      return 'border-red-200';
    case 'Very High':
      return 'border-red-300';
    default:
      return 'border-gray-200';
  }
};

export const getRiskTextColor = (risk: RiskLevel): string => {
  switch (risk) {
    case 'Low':
      return 'text-green-700';
    case 'Moderate':
      return 'text-yellow-700';
    case 'High':
      return 'text-red-700';
    case 'Very High':
      return 'text-red-800';
    default:
      return 'text-gray-700';
  }
};

export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';

  return `Rs ${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)} Cr`;
};

export const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};
