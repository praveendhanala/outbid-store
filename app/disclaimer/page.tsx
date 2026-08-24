import { PageShell } from "@/components/PageShell";

export default function DisclaimerPage() {
  return (
    <PageShell title="disclaimer">
      <div>
        <h2>Not a review or a ranking of quality</h2>
        <p>
          A store&apos;s position on outbid.store reflects the size of its
          bid, not an endorsement, review, or verification of the store,
          its products, or its business practices. Do your own research
          before buying from any store listed here.
        </p>
      </div>
      <div>
        <h2>No guaranteed outcomes</h2>
        <p>
          Traffic, clicks, and sales from holding a ranked position vary and
          aren&apos;t guaranteed. Any results a store shares publicly are
          that store&apos;s own experience, not a projection of what
          you&apos;ll get.
        </p>
      </div>
      <div>
        <h2>You can be outbid at any time</h2>
        <p>
          There&apos;s no minimum time you&apos;re guaranteed to hold a
          position. A higher bid can move you down immediately, including
          seconds after you bid.
        </p>
      </div>
      <div>
        <h2>Independent project</h2>
        <p>
          outbid.store is an independent project. It isn&apos;t affiliated
          with, endorsed by, or operated by any other pay-to-rank
          leaderboard it may resemble.
        </p>
      </div>
    </PageShell>
  );
}
