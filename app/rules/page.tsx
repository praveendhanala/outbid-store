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
      <div>
        <h2>1. Rank is the bid</h2>
        <p>
          Your position on the board is determined only by how much you&apos;ve
          bid. There&apos;s no algorithm, no review process, and no way to
          rank higher without paying more than the store above you.
        </p>
      </div>
      <div>
        <h2>2. Outbidding is instant</h2>
        <p>
          Anyone can take your spot by bidding at least one dollar more than
          your current bid. The moment a higher bid is placed, the board
          re-sorts and your store moves down.
        </p>
      </div>
      <div>
        <h2>3. Minimum bid is {formatUsd(MIN_BID)}</h2>
        <p>
          New stores join the board at {formatUsd(MIN_BID)} or higher. There&apos;s
          no maximum.
        </p>
      </div>
      <div>
        <h2>4. Bids aren&apos;t refunded when you&apos;re outbid</h2>
        <p>
          Once you&apos;ve paid to hold a position, that payment covers the
          time you held it &mdash; it isn&apos;t returned if someone later
          outbids you. See the <Link href="/terms" className="underline">terms</Link>{" "}
          for the full payment terms.
        </p>
      </div>
      <div>
        <h2>5. One listing per store</h2>
        <p>
          Each domain gets one listing. If you want to move categories,
          contact us rather than submitting a duplicate.
        </p>
      </div>
      <div>
        <h2>6. We can remove a listing</h2>
        <p>
          Stores that are fraudulent, illegal, or otherwise violate the{" "}
          <Link href="/terms" className="underline">terms</Link> can be removed at
          any time, bid or no bid.
        </p>
      </div>
    </PageShell>
  );
}
