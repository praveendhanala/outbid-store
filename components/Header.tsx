import Link from "next/link";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border py-5">
      <Link href="/" className="font-display text-lg font-bold">
        outbid.store
      </Link>
      <nav className="flex items-center gap-6 text-sm text-muted">
        <Link href="/#leaderboard" className="hover:text-foreground transition-colors">
          leaderboard
        </Link>
        <Link href="/categories" className="hover:text-foreground transition-colors">
          categories
        </Link>
        <Link href="/about" className="hover:text-foreground transition-colors">
          about
        </Link>
      </nav>
    </header>
  );
}
