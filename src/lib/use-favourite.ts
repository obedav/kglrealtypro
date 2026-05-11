"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "kgl:favourites";

function readStored(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? (arr as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeStored(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore quota / private-browsing errors
  }
}

export function useFavourite(id: string) {
  const [isFav, setIsFav] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setIsFav(readStored().has(id));
  }, [id]);

  const toggle = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsFav((prev) => {
        const stored = readStored();
        if (prev) stored.delete(id);
        else stored.add(id);
        writeStored(stored);
        return !prev;
      });
    },
    [id],
  );

  return { isFav, toggle };
}
