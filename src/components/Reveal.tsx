"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Fades + nudges children into view once they enter the viewport.
 * One-shot (won't replay on scroll-back). Uses IntersectionObserver so
 * it works on every browser the client's visitors will be on.
 *
 * Honors prefers-reduced-motion automatically via motion-reduce: utilities.
 */
type Props = {
  children: React.ReactNode;
  className?: string;
  /** ms offset after entering the viewport. Use for stagger inside a group. */
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect OS-level reduced motion — show immediately.
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 will-change-transform [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
        "motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
