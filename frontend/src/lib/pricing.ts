export type RegionalPricing = {
  currencySymbol: string;
  currencyCode: string;
  proMonthlyPrice: number;
  proMonthlyFormatted: string;
  businessMonthlyPrice: number;
  businessMonthlyFormatted: string;
  freePriceFormatted: string;
  regionName: string;
  flag: string;
};

export function getRegionalPricing(_phone?: string, _country?: string): RegionalPricing {
  return {
    currencySymbol: "₹",
    currencyCode: "INR",
    proMonthlyPrice: 199,
    proMonthlyFormatted: "₹199",
    businessMonthlyPrice: 399,
    businessMonthlyFormatted: "₹399",
    freePriceFormatted: "₹0",
    regionName: "India",
    flag: "🇮🇳",
  };
}

