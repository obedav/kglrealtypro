"use client";

import { useCurrency } from "@/lib/currency-context";
import { formatPrice } from "@/lib/fx";

export function PriceDisplay({ priceNGN }: { priceNGN: number }) {
  const { currency } = useCurrency();
  return <>{formatPrice(priceNGN, currency)}</>;
}
