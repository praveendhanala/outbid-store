import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function TermsPage() {
  return (
    <PageShell
      title="terms"
      intro="Last updated August 2026."
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <h2>1. Using Outbid.store</h2>
          <p>
            By submitting a store, creating a listing, or placing a bid, you
            agree to these terms. You must provide accurate information and
            have the right to represent or promote the store you submit.
          </p>
          <p>
            You are responsible for your listing and for making sure its
            content, products, and services comply with applicable laws.
          </p>
        </section>

        <section className="space-y-3">
          <h2>2. Store listings</h2>
          <p>
            Each store may have one listing on Outbid.store. A listing may include
            your store name, website, description, category, and other
            information you provide.
          </p>
          <p>
            You may not submit duplicate listings for the same store or use
            multiple listings to gain an unfair advantage on the leaderboard.
          </p>
        </section>

        <section className="space-y-3">
          <h2>3. How ranking works</h2>
          <p>
            Rankings are determined by active bid amount. Within a category,
            the store with the highest bid holds the #1 position, followed by
            the next highest bid, and so on.
          </p>
          <p>
            Outbid.store does not use an algorithm, review score, popularity score,
            or other ranking factor to determine a store&apos;s position.
          </p>
          <p>
            A higher position represents a higher bid. It is not an endorsement,
            recommendation, or indication that one store is better than
            another.
          </p>
        </section>

        <section className="space-y-3">
          <h2>4. Bids</h2>
          <p>
            A new listing must meet the minimum bid shown when you submit it.
            There is no maximum bid. To move above another store, your new bid
            must be higher than its current bid by at least the required
            increment.
          </p>
          <p>
            When a higher bid is successfully placed, the leaderboard may
            immediately reorder and the previously higher-ranked store may
            move down.
          </p>
        </section>

        <section className="space-y-3">
          <h2>5. Payments and refunds</h2>
          <p>
            A bid is a payment for ranked placement on the Outbid.store leaderboard.
            It is not a purchase of goods or services from Outbid.store and does not
            guarantee traffic, clicks, customers, sales, or any particular
            amount of exposure.
          </p>
          <p>
            <span className="font-semibold">
              Payments are non-refundable once a bid has been placed.
            </span>{" "}
            This includes situations where another store later outbids you or
            your store moves to a lower position.
          </p>
        </section>

        <section className="space-y-3">
          <h2>6. Prohibited listings</h2>
          <p>
            You may not use Outbid to promote illegal goods or services,
            fraudulent or deceptive businesses, or content that infringes
            another person&apos;s or company&apos;s intellectual property or
            other rights.
          </p>
          <p>
            We may reject, suspend, or remove a listing that violates these
            terms or that we reasonably believe creates legal, security, or
            safety concerns.
          </p>
        </section>

        <section className="space-y-3">
          <h2>7. Removing listings</h2>
          <p>
            We reserve the right to remove or suspend any listing at any time
            if it violates these terms, is fraudulent or unlawful, or otherwise
            presents a risk to Outbid.store or its users.
          </p>
          <p>
            A listing removed for violating these terms may not be eligible
            for a refund, including any previously placed bids.
          </p>
        </section>

        <section className="space-y-3">
          <h2>8. Availability</h2>
          <p>
            We aim to keep Outbid.store available and accurate, but we do not
            guarantee uninterrupted or error-free operation. The service may
            occasionally be unavailable because of maintenance, technical
            problems, or circumstances outside our control.
          </p>
        </section>

        <section className="space-y-3">
          <h2>9. No guarantees</h2>
          <p>
            Holding a higher-ranked position does not guarantee any particular
            result. We make no promises about traffic, clicks, conversions,
            sales, search visibility, or other business outcomes.
          </p>
          <p>
            Results reported by other stores are their own experiences and
            should not be treated as a guarantee of what your store will
            achieve.
          </p>
        </section>

        <section className="space-y-3">
          <h2>10. Limitation of liability</h2>
          <p>
            Outbid.store is provided on an &quot;as is&quot; and &quot;as
            available&quot; basis. To the extent permitted by law, we are not
            responsible for losses or damages arising from your use of the
            service, including lost bids, lost business, lost revenue, lost
            data, downtime, or changes to your listing&apos;s position.
          </p>
        </section>

        <section className="space-y-3">
          <h2>11. Changes to Outbid.store</h2>
          <p>
            We may change, suspend, or discontinue parts of Outbid.store at any time.
            We may also change these terms as the service evolves.
          </p>
          <p>
            If we make material changes, we&apos;ll update the date at the top
            of this page. Continued use of Outbid.store after the updated terms take
            effect means you accept the revised terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2>12. Contact</h2>
          <p>
            If you have questions about these terms, please contact us through
            the{" "}
            <Link href="/contact" className="underline">
              contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </PageShell>
  );
}
