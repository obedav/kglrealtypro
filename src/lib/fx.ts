export type Currency = "NGN" | "USD" | "GBP" | "AED";

// Rates last updated: 2026-05-11. Update before launch and consider moving
// to a DB table or a scheduled fetch (e.g. exchangerate-api.com) once traffic
// grows — stale rates erode trust with international buyers.
const FX_RATE_TO_NGN: Record<Currency, number> = {
  NGN: 1,
  USD: 1580,
  GBP: 2010,
  AED: 430,
};

export function formatNGN(amountNGN: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountNGN);
}

export function convertFromNGN(amountNGN: number, to: Currency): number {
  return amountNGN / FX_RATE_TO_NGN[to];
}

export function formatPrice(amountNGN: number, currency: Currency): string {
  const value = convertFromNGN(amountNGN, currency);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
