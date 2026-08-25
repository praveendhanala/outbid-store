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
      <p>
        outbid.store is a pay-to-rank leaderboard for online stores. No ads,
        no algorithm, no revenue share &mdash; the store willing to pay the
        most holds the top spot, and stays there until someone pays more.
      </p>
      <p>
        The idea is borrowed from the pay-to-rank leaderboards that spread
        across the indie web in August 2026, adapted here for one specific
        use case: stores competing for visibility in front of shoppers and
        other founders, rather than software products competing for clicks.
      </p>

      <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-surface p-4">
        <Stat label="stores listed" value={formatNumber(stores.length)} />
        <Stat label="highest bid" value={formatUsd(topBid)} />
        <Stat label="total bid" value={formatUsd(totalBid)} />
      </div>

      <div>
        <h2>How it works</h2>
        <p>
          Submit your store, set a starting bid, and it joins the board.
          Anyone can outbid you for your position at any time by paying more
          &mdash; there&apos;s no auction clock and no reserve price beyond
          the current bid.
        </p>
      </div>

      <div>
        <h2>What it isn&apos;t</h2>
        <p>
          It isn&apos;t a recommendation engine and it isn&apos;t vetted
          curation. Rank reflects what a store paid, not a review of its
          quality. See the{" "}
          <Link href="/disclaimer" className="underline">
            disclaimer
          </Link>{" "}
          for more on that.
        </p>
      </div>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="font-mono text-lg font-bold">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
