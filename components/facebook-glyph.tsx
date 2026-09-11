/** Authored Facebook glyph — single-colour, inherits currentColor. Not in
 * lucide-react (brand icons were dropped from that package); mirrors
 * whatsapp-glyph.tsx's pattern instead of pulling in an icon library. */
export function FacebookGlyph({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M13.5 21.5v-8.2h2.75l.41-3.2h-3.16V8.08c0-.93.26-1.56 1.59-1.56h1.7V3.65A22.9 22.9 0 0 0 14.3 3.5c-2.44 0-4.11 1.49-4.11 4.22v2.36H7.43v3.2h2.76v8.22h3.31Z" />
    </svg>
  );
}
