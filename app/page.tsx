import { Header } from "@/components/Header";
import { StatsTicker } from "@/components/StatsTicker";
import { Leaderboard } from "@/components/Leaderboard";
import { Footer } from "@/components/Footer";
import { CATEGORIES, type Category } from "@/lib/data";

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

  return (
    <div className="mx-auto max-w-2xl px-4">
      <h1>outbid.store</h1>
    </div>
  );
}
