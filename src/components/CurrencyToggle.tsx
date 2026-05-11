"use client";

import { useCurrency, CURRENCIES } from "@/lib/currency-context";

const LABELS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  AED: "د.إ",
};

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      role="group"
      aria-label="Display currency"
      className="flex items-center divide-x divide-border overflow-hidden rounded-md border text-xs font-medium"
    >
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          aria-pressed={currency === c}
          className={`px-2.5 py-1.5 transition-colors ${
            currency === c
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {LABELS[c] ?? c} {c}
        </button>
      ))}
    </div>
  );
}
