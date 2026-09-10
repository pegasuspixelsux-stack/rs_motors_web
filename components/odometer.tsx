"use client";

import { useEffect, useRef, useState } from "react";
import { fmtInt } from "@/lib/format";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

type Props = {
  value: number;
  /** ms */
  duration?: number;
  prefix?: string;
  suffix?: string;
  /** pad the integer part to at least this many digits with leading zeros */
  pad?: number;
  className?: string;
  /** start the roll only once the element scrolls into view */
  whenVisible?: boolean;
};

/**
 * A number that eases from its previous value to the next with a soft settle.
 * Honours prefers-reduced-motion (renders the value directly, no animation).
 */
export function Odometer({
  value,
  duration = 1000,
  prefix,
  suffix,
  pad = 0,
  className = "",
  whenVisible = false,
}: Props) {
  const reduced = useReducedMotion();
  const [animated, setAnimated] = useState(0);
  const [armed, setArmed] = useState(!whenVisible);
  const fromRef = useRef(0);
  const nodeRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!whenVisible || armed) return;
    const el = nodeRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setArmed(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [whenVisible, armed]);

  useEffect(() => {
    if (reduced || !armed) return;
    const from = fromRef.current;
    const delta = value - from;
    if (delta === 0) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setAnimated(from + delta * easeOutExpo(t));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, reduced, armed]);

  const shown = reduced || !armed ? value : animated;
  let text = fmtInt(shown);
  if (pad > 0) {
    const digits = text.replace(/\D/g, "");
    if (digits.length < pad) text = "0".repeat(pad - digits.length) + text;
  }

  return (
    <span ref={nodeRef} className={`tnum ${className}`}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
