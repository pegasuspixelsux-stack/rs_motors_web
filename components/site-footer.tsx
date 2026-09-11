import Link from "next/link";
import { Wordmark } from "./wordmark";
import { SocialLinks } from "./social-links";
import { NAV_LINKS } from "@/lib/site";

/** Site footer — shared by the homepage and every route. */
export function Footer() {
  return (
    <footer className="border-t border-hairline px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-[1320px] flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Wordmark height={15} />
          <span className="tnum text-[12px] text-ink-faint">
            © {new Date().getFullYear()} · Maldonado, Uruguay
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[12px] font-medium text-ink-faint transition-colors hover:text-ink-dim"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <SocialLinks
            className="grid size-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-surface hover:text-ink-dim"
            iconSize={14}
          />
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-[1320px] items-center justify-center gap-3 border-t border-hairline pt-6 text-center">
        <a
          href="https://github.com/pegasuspixelsux-stack"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-ink-faint/70 transition-colors hover:text-ink-faint"
        >
          Diseño por Pegasus Pixels
        </a>
        <span className="text-ink-faint/40">·</span>
        <Link
          href="/admin"
          className="text-[11px] text-ink-faint/70 transition-colors hover:text-ink-faint"
        >
          Panel de administración
        </Link>
      </div>
    </footer>
  );
}
