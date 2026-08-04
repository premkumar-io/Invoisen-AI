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

export function getRegionalPricing(phone?: string, country?: string): RegionalPricing {
  const cleanPhone = (phone || "").replace(/[\s\-\(\)]/g, "");
  const cleanCountry = (country || "").trim().toUpperCase();

  // 1. India check (+91, 91, or IN)
  if (
    cleanPhone.startsWith("+91") ||
    cleanPhone.startsWith("91") ||
    cleanCountry === "IN" ||
    cleanCountry === "INDIA"
  ) {
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

  // 2. UK check (+44, 44, or GB / UK)
  if (
    cleanPhone.startsWith("+44") ||
    cleanPhone.startsWith("44") ||
    cleanCountry === "GB" ||
    cleanCountry === "UK" ||
    cleanCountry === "UNITED KINGDOM"
  ) {
    return {
      currencySymbol: "£",
      currencyCode: "GBP",
      proMonthlyPrice: 8.99,
      proMonthlyFormatted: "£8.99",
      proAnnualPrice: 6.99,
      proAnnualFormatted: "£6.99",
      freePriceFormatted: "£0",
      regionName: "United Kingdom",
      flag: "🇬🇧",
    };
  }

  // 3. Europe check (+33, +49, +34, +39, etc. or EU countries)
  const euPhonePrefixes = ["+33", "+49", "+34", "+39", "+31", "+32", "+43", "+351", "+30", "+353", "+358"];
  const isEU = euPhonePrefixes.some((p) => cleanPhone.startsWith(p));
  if (isEU || ["FR", "DE", "ES", "IT", "NL", "BE", "AT", "PT", "GR", "IE", "FI"].includes(cleanCountry)) {
    return {
      currencySymbol: "€",
      currencyCode: "EUR",
      proMonthlyPrice: 9.99,
      proMonthlyFormatted: "€9.99",
      proAnnualPrice: 7.99,
      proAnnualFormatted: "€7.99",
      freePriceFormatted: "€0",
      regionName: "Europe",
      flag: "🇪🇺",
    };
  }

  // 4. Default USA / International ($9.99)
  return {
    currencySymbol: "$",
    currencyCode: "USD",
    proMonthlyPrice: 9.99,
    proMonthlyFormatted: "$9.99",
    proAnnualPrice: 7.99,
    proAnnualFormatted: "$7.99",
    freePriceFormatted: "$0",
    regionName: "International",
    flag: "🇺🇸",
  };
}
