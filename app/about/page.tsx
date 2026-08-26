import { PageShell } from "@/components/PageShell";
import { formatUsd, formatNumber } from "@/lib/format";
import { getLeaderboard } from "@/app/actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const stores = await getLeaderboard();
  const topBid = stores.length ? Math.max(...stores.map((s) => s.bid)) : 0;
  const totalBid = stores.reduce((sum, s) => sum + s.bid, 0);

  return (
    <PageShell title="about">
      <p className="font-semibold">
        outbid.store is a pay-to-rank leaderboard for online stores.
      </p>
      <p>
        Your position is determined by one simple thing: <span className="font-semibold">your bid</span>.
        The store with the highest bid holds the <span className="font-semibold">#1 spot</span>.
        It stays there until another store outbids it.
      </p>

      <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-surface p-4">
        <Stat label="stores listed" value={formatNumber(stores.length)} />
        <Stat label="highest bid" value={formatUsd(topBid)} />
        <Stat label="total bid" value={formatUsd(totalBid)} />
      </div>

      <section className="space-y-5">
      <h2>How it works</h2>

      <div className="space-y-4">
        <Step
         number="1"
         title="List your store"
         description="Submit your store and choose a starting bid."
        />

        <Step
         number="2"
         title="Take your spot"
         description="Your store appears on the leaderboard at the position your bid earns."
        />

        <Step
         number="3"
         title="Outbid the competition"
         description="Anyone can move above you by placing a higher bid. There's no auction countdown and no hidden reserve price, the current top bid is all that matters."
        />
        </div>
      </section>

      <section className="space-y-3">
        <h2>Why Outbid?</h2>
        <p>
          Most rankings are decided by algorithms, reviews, or whoever spends the most on ads.
          Outbid is different.
        </p>
        <p className="font-semibold">
          The leaderboard is transparent.
          The rules are simple. And anyone can compete for the top spot.
        </p>
      </section>

      <section className="space-y-3">
        <h2>What it isn&apos;t</h2>
        <p>
          Outbid is <span className="font-semibold">not</span> a recommendation engine, review platform, or curated directory.
        </p>

        <p>
          A store&apos;s position reflects how much it has bid. A higher-ranked store isn&apos;t necessarily better than a lower-ranked one.
        </p>

        <p>
          See the{" "} <Link href="/disclaimer" className="underline">disclaimer</Link>{" "} for more information.
        </p>
      </section>

    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold">
        <span className="text-accent">{value}</span>
      </p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface border border-border text-xs font-bold text-accent">
        {number}
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}
