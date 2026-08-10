export type RegionalPricing = {
  currencySymbol: string;
  currencyCode: string;
  proMonthlyPrice: number;
  proMonthlyFormatted: string;
  proAnnualPrice: number;
  proAnnualFormatted: string;
  freePriceFormatted: string;
  regionName: string;
  flag: string;
};

export function getRegionalPricing(_phone?: string, _country?: string): RegionalPricing {
  return {
    currencySymbol: "₹",
    currencyCode: "INR",
    proMonthlyPrice: 299,
    proMonthlyFormatted: "₹299",
    proAnnualPrice: 249,
    proAnnualFormatted: "₹249",
    freePriceFormatted: "₹0",
    regionName: "India",
    flag: "🇮🇳",
  };
}

