"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Currency, FxRates } from "@/lib/fx";
import { FALLBACK_RATES } from "@/lib/fx";

const CURRENCIES: readonly Currency[] = ["NGN", "USD", "GBP", "AED"];
const STORAGE_KEY = "kgl:currency";

type CurrencyContextValue = {
  currency: Currency;
  rates: FxRates;
  setCurrency: (c: Currency) => void;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "NGN",
  rates: FALLBACK_RATES,
  setCurrency: () => {},
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("NGN");
  const [rates, setRates] = useState<FxRates>(FALLBACK_RATES);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Currency | null;
      if (saved && (CURRENCIES as readonly string[]).includes(saved)) {
        setCurrencyState(saved);
      }
    } catch {
      // localStorage blocked (private browsing, etc.)
    }

    fetch("/api/fx-rates")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.NGN === "number") setRates(data as FxRates);
      })
      .catch(() => {}); // keep FALLBACK_RATES on any error
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      // ignore
    }
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, rates, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext);
}

export { CURRENCIES };
