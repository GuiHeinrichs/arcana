"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Cards" },
  { href: "/top", label: "Top Cards" },
  { href: "/builder", label: "Deck Builder" },
] as const;

export function HeaderNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="flex items-center gap-1">
      {LINKS.map((link) => {
        const isActive = link.href === pathname;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 font-display text-sm font-medium uppercase tracking-wide transition-colors ${
              isActive ? "text-amber" : "text-muted hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
