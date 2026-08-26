import { Header } from "@/components/Header";
import { StatsTicker } from "@/components/StatsTicker";
import { Leaderboard } from "@/components/Leaderboard";
import { Footer } from "@/components/Footer";
import { CATEGORIES, type Category } from "@/lib/data";
import { getLeaderboard } from "@/app/actions";

// This page reads live data from Supabase on every request.
export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const initialCategory: Category = CATEGORIES.includes(
    params.category as Category
  )
    ? (params.category as Category)
    : "all";

  const stores = await getLeaderboard();

  return (
    <div className="mx-auto max-w-2xl px-4">
      <Header />

      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <StatsTicker startingVisitors={48210} online={312} />
        <h1 className="font-display text-4xl font-bold">outbid.store</h1>
        <p className="max-w-sm text-sm text-muted">
          No ads, no revenue share. Just outbid your competitors to rank #1.
        </p>
      </div>

      <Leaderboard initialStores={stores} initialCategory={initialCategory} />

      <Footer />
    </div>
  );
}
