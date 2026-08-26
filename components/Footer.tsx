import Link from "next/link";

const LINKS: { href: string; label: string }[] = [
  { href: "/about", label: "about" },
  { href: "/rules", label: "rules" },
  { href: "/faqs", label: "faqs" },
  { href: "/terms", label: "terms" },
  { href: "/privacy", label: "privacy" },
  { href: "/disclaimer", label: "disclaimer" },
  { href: "/contact", label: "contact" },
];

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-3 border-t border-border py-8 text-center text-xs text-muted">
      <p className="max-w-sm">
        A pay-to-rank leaderboard for stores.
      </p>
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-foreground transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
