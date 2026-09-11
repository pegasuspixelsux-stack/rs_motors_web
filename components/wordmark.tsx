import { RSMark } from "./rs-mark";

/** RS mark + tracked "MOTORS" — the shared brand lockup (nav, footer, card overlays). */
export function Wordmark({
  height = 20,
  priority = false,
}: {
  height?: number;
  priority?: boolean;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <RSMark height={height} priority={priority} />
      <span
        className="font-semibold tracking-[0.14em] text-ink"
        style={{ fontSize: height * 0.62 }}
      >
        MOTORS
      </span>
    </span>
  );
}
