import { PageShell } from "@/components/PageShell";

export default function DisclaimerPage() {
  return (
    <PageShell
      title="disclaimer"
      intro="A few important things to understand before using or relying on the Outbid.store leaderboard."
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <h2>Rank reflects the bid</h2>
          <p>
            A store&apos;s position on Outbid.store is determined by the amount
            it has bid. A higher position does not mean that the store is
            better, more trustworthy, or more popular than stores ranked
            below it.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Not a review or endorsement</h2>
          <p>
            Outbid.store does not review, verify, recommend, or endorse the stores
            listed on the board, their products, or their business practices.
          </p>
          <p>
            Before purchasing from a store, you should do your own research
            and make your own assessment of whether the store is right for
            you.
          </p>
        </section>

        <section className="space-y-3">
          <h2>No guaranteed outcomes</h2>
          <p>
            A higher position may result in more visibility, but we make no
            guarantees about traffic, clicks, leads, customers, sales, or
            revenue.
          </p>
          <p>
            Any results shared by other stores are their own experiences and
            should not be treated as a prediction or guarantee of what your
            store will achieve.
          </p>
        </section>

        <section className="space-y-3">
          <h2>You can be outbid at any time</h2>
          <p>
            There is no minimum amount of time that a store is guaranteed to
            hold a position. Another store can place a higher bid at any time,
            potentially moving your store down immediately after you bid.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Listed stores are independent</h2>
          <p>
            Stores listed on Outbid.store are independent third parties. Their
            inclusion on the board does not mean that Outbid.store has a business
            relationship with, endorses, or guarantees any listed store.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Independent project</h2>
          <p>
            Outbid.store is an independent project. It is not affiliated with,
            endorsed by, sponsored by, or operated by any other pay-to-rank
            leaderboard or service it may resemble.
          </p>
        </section>

      </div>
    </PageShell>
  );
}
