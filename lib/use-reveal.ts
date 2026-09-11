"use client";

import { useEffect, useState, type RefObject } from "react";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * One shared scroll-reveal treatment for the homepage's sections — same
 * duration/easing/offset everywhere, so the motion reads as one system
 * instead of a different animation per section. Fires once, the first time
 * the element crosses into view; with prefers-reduced-motion the section is
 * just always visible (derived below, never synced into state).
 *
 * The caller owns the ref (create it with useRef and pass it in) — keeping
 * ref creation at the call site, rather than returned from this hook, is
 * what the React Compiler's ref-safety analysis expects.
 */
export function useReveal(ref: RefObject<HTMLElement | null>): boolean {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return; // already rendered visible below — nothing to observe
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, ref]);

  return reduced || visible;
}

/** The shared reveal transition's classes, given whether it should be shown yet. */
export function revealClassName(visible: boolean): string {
  return (
    "transition-[opacity,transform] duration-700 ease-out " +
    (visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0")
  );
}
