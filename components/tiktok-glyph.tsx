/** Authored TikTok glyph — single-colour, inherits currentColor. Not in
 * lucide-react (brand icons were dropped from that package); mirrors
 * whatsapp-glyph.tsx's pattern instead of pulling in an icon library. */
export function TiktokGlyph({
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
      <path d="M16.6 2h-3.2v13.2c0 1.5-1.2 2.7-2.7 2.7a2.7 2.7 0 0 1-2.7-2.7 2.7 2.7 0 0 1 2.7-2.7c.28 0 .55.04.8.12V9.4a5.9 5.9 0 0 0-.8-.06A5.9 5.9 0 0 0 4.8 15.2a5.9 5.9 0 0 0 5.9 5.9 5.9 5.9 0 0 0 5.9-5.9V8.4a8.1 8.1 0 0 0 4.6 1.42V6.6a4.9 4.9 0 0 1-4.6-4.6Z" />
    </svg>
  );
}
