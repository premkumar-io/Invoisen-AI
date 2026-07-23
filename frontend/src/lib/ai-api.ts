import { api } from "@/lib/api";

/**
 * Interface for the data returned by the AI tax suggestion endpoint.
 * This should be kept in sync with the backend's `TaxInfo` interface.
 */
export interface TaxSuggestion {
  taxType: "GST" | "VAT" | "Sales Tax" | "None";
  rate: number;
  description: string;
}

/**
 * Interface for the data returned by the AI client autofill endpoint.
 */
export interface ClientSuggestion {
  name: string;
  email: string;
  address: string;
  phone: string;
  gstNumber: string;
  company: string;
}

/**
 * Fetches a tax suggestion from the backend based on a country code.
 *
 * @param countryCode The two-letter ISO country code (e.g., 'IN', 'US').
 * @returns A promise that resolves to a tax suggestion object, or null if no
 *          suggestion is applicable or an error occurs during the fetch.
 */
export async function getTaxSuggestion(
  countryCode: string | undefined,
): Promise<TaxSuggestion | null> {
  if (!countryCode) {
    return null;
  }
  try {
    const response = await api.post<TaxSuggestion>("/ai/tax-suggestion", { country: countryCode });
    if (response.success) {
      return response.data;
    }
    console.error("Failed to fetch tax suggestion:", response.error);
    return null;
  } catch (error) {
    console.error("Failed to fetch tax suggestion:", error);
    return null;
  }
}

/**
 * Fetches client profile suggestions from the backend based on a query.
 *
 * @param query The name or email to search for.
 * @returns A promise that resolves to an array of client suggestions, or null on error.
 */
export async function getClientSuggestions(query: string): Promise<ClientSuggestion[] | null> {
  if (!query || query.length < 2) {
    return [];
  }
  try {
    const response = await api.post<ClientSuggestion[]>("/ai/client-autofill", { query });
    if (response.success) {
      return response.data;
    }
    console.error("Failed to fetch client suggestions:", response.error);
    return null;
  } catch (error) {
    console.error("Failed to fetch client suggestions:", error);
    return null;
  }
}
