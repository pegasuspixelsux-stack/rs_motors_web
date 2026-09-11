import { InstagramGlyph } from "./instagram-glyph";
import { FacebookGlyph } from "./facebook-glyph";
import { TiktokGlyph } from "./tiktok-glyph";
import { SITE } from "@/lib/site";

const SOCIALS = [
  {
    href: SITE.instagramUrl,
    label: `Instagram — @${SITE.instagramHandle}`,
    Glyph: InstagramGlyph,
  },
  { href: SITE.facebookUrl, label: "Facebook", Glyph: FacebookGlyph },
  { href: SITE.tiktokUrl, label: "TikTok", Glyph: TiktokGlyph },
];

/** Shared Instagram/Facebook/TikTok icon row — used by the nav and footer. */
export function SocialLinks({
  className,
  iconSize = 16,
}: {
  className?: string;
  iconSize?: number;
}) {
  return (
    <>
      {SOCIALS.map(({ href, label, Glyph }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={className}
        >
          <Glyph size={iconSize} />
        </a>
      ))}
    </>
  );
}
