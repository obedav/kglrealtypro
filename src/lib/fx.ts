export type Currency = "NGN" | "USD" | "GBP" | "AED";
export type FxRates = Record<Currency, number>;

// Fallback rates (updated 2026-09-03). Live rates are fetched server-side
// at /api/fx-rates and surfaced via CurrencyProvider.
export const FALLBACK_RATES: FxRates = {
  NGN: 1,
  USD: 1650,
  GBP: 2120,
  AED: 449,
};

export function formatNGN(amountNGN: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountNGN);
}

export function convertFromNGN(
  amountNGN: number,
  to: Currency,
  rates: FxRates = FALLBACK_RATES,
): number {
  return amountNGN / rates[to];
}

export function formatPrice(
  amountNGN: number,
  currency: Currency,
  rates: FxRates = FALLBACK_RATES,
): string {
  const value = convertFromNGN(amountNGN, currency, rates);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

// Server-side live rate fetch — called by /api/fx-rates with Next.js cache.
// Falls back to FALLBACK_RATES on any error so the site never breaks.
export async function fetchLiveRates(): Promise<FxRates> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/NGN", {
      next: { revalidate: 21600 }, // 6 hours
    });
    if (!res.ok) return FALLBACK_RATES;
    const data = (await res.json()) as { result: string; rates?: Record<string, number> };
    if (data.result !== "success" || !data.rates) return FALLBACK_RATES;
    const r = data.rates;
    return {
      NGN: 1,
      USD: r.USD ? 1 / r.USD : FALLBACK_RATES.USD,
      GBP: r.GBP ? 1 / r.GBP : FALLBACK_RATES.GBP,
      AED: r.AED ? 1 / r.AED : FALLBACK_RATES.AED,
    };
  } catch {
    return FALLBACK_RATES;
  }
}
