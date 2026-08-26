import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { MIN_BID } from "@/lib/data";
import { formatUsd } from "@/lib/format";

export default function RulesPage() {
  return (
    <PageShell
      title="rules"
      intro="The whole mechanic in a few short rules."
    >
      <div className="space-y-8">
        <section className="space-y-2">
          <h2>1. Rank is the bid</h2>
          <p>
            Your position on the board is determined only by how much you&apos;ve
            bid. There&apos;s no algorithm, review process, or popularity score.
            To move up, you need to bid more than the store above you.
          </p>
        </section>

        <section className="space-y-2">
          <h2>2. Outbidding is instant</h2>
          <p>
            Anyone can take your spot by bidding at least{" "}
            <span className="font-semibold">$1 more</span> than your current bid.
            As soon as a higher bid is placed, the leaderboard re-sorts and your
            store moves down.
          </p>
        </section>

        <section className="space-y-2">
          <h2>3. The minimum bid is $5</h2>
          <p>
            New stores can join the board with a bid of{" "}
            <span className="font-semibold">$5 or more</span>. There&apos;s no
            maximum bid.
          </p>
        </section>

        <section className="space-y-2">
          <h2>4. Bids aren&apos;t refunded when you&apos;re outbid</h2>
          <p>
            Your payment covers the position you held while your bid was active.
            If another store outbids you, your previous payment isn&apos;t
            refunded. See the{" "}
            <a href="/terms" className="underline">
              terms
            </a>{" "}
            for the full payment terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2>5. One listing per store</h2>
          <p>
            Each domain gets one listing. Don&apos;t submit the same store multiple
            times to appear in different categories. If you need to change your
            categories, contact us instead.
          </p>
        </section>

        <section className="space-y-2">
          <h2>6. We can remove a listing</h2>
          <p>
            We may remove stores that are fraudulent, illegal, misleading, or
            otherwise violate our{" "}
            <a href="/terms" className="underline">
              terms
            </a>
            . A listing can be removed regardless of its current bid.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
