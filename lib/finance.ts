/**
 * Financing assumptions used for the "cuota estimada" shown on every card and
 * as the default in the calculator. These are illustrative — every quote is
 * "sujeto a aprobación crediticia" and confirmed with the financiera.
 */
export const FINANCE = {
  downPaymentPct: 0.3,
  termMonths: 60,
  apr: 0.0697,
} as const;

/** Fixed-rate amortised monthly payment. */
export function monthlyPayment(
  price: number,
  {
    downPct = FINANCE.downPaymentPct,
    months = FINANCE.termMonths,
    apr = FINANCE.apr,
  }: { downPct?: number; months?: number; apr?: number } = {},
): number {
  const principal = price * (1 - downPct);
  if (principal <= 0) return 0;
  const r = apr / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}
