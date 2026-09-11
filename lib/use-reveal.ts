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
 * threshold MUST stay 0 (or very small) rather than some larger fraction: an
 * IntersectionObserver's ratio is intersecting-area / the TARGET's own full
 * height, so for a section taller than viewport-height / threshold, that
 * ratio is geometrically incapable of ever being reached — no fix, this
 * silently and permanently kills the reveal instead of firing late. That bit
 * the "Unidades Seleccionadas" section on mobile: single-column card
 * stacking plus a growing catalog made it tall enough that a 0.15 threshold
 * could never be satisfied on a phone viewport, so it never faded in.
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
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
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
