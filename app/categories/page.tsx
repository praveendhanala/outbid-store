import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CATEGORIES, CATEGORY_INFO } from "@/lib/data";
import { formatUsd, formatNumber } from "@/lib/format";
import { getLeaderboard } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = CATEGORIES.filter((c) => c !== "all");
  const stores = await getLeaderboard();

  const rows = categories.map((category) => {
    // A store counts toward every category it's listed under.
    const inCategory = stores.filter((s) => s.categories.includes(category));
    const topBid = inCategory.reduce((max, s) => Math.max(max, s.bid), 0);
    return {
      category,
      description: CATEGORY_INFO[category],
      storeCount: inCategory.length,
      topBid,
    };
  });

  return (
    <div className="mx-auto max-w-2xl px-4">
      <Header />

      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <h1 className="font-display text-3xl font-bold">categories</h1>
        <p className="max-w-sm text-sm text-muted">
          Every category is its own leaderboard. Pick one to see who&apos;s
          #1.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-3 pb-10 sm:grid-cols-2">
        {rows.map(({ category, description, storeCount, topBid }) => (
          <li key={category}>
            <Link
              href={`/?category=${category}`}
              className="flex h-full flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:border-foreground/40"
            >
              <div>
                <p className="text-sm font-semibold capitalize">{category}</p>
                <p className="mt-1 text-xs text-muted">{description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted">
                <span>{formatNumber(storeCount)} stores</span>
                <span className="font-mono font-semibold text-foreground">
                  {topBid > 0 ? `top ${formatUsd(topBid)}` : "no bids yet"}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <Footer />
    </div>
  );
}
