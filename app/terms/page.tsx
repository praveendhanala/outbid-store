import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function TermsPage() {
  return (
    <PageShell
      title="terms"
      intro="Last updated August 2026. Plain-language terms for using outbid.store."
    >
      <div>
        <h2>Using the board</h2>
        <p>
          By submitting a store or placing a bid, you confirm the
          information you provide is accurate and that you have the right to
          promote the store you&apos;re listing. You&apos;re responsible for
          keeping your listing&apos;s content lawful and accurate.
        </p>
      </div>
      <div>
        <h2>Payments</h2>
        <p>
          Bids are a payment for a ranked position, not a purchase of goods
          or a guarantee of traffic, sales, or exposure. Payments are
          non-refundable once a bid is placed, including if you&apos;re
          later outbid.
        </p>
      </div>
      <div>
        <h2>No guarantees</h2>
        <p>
          We don&apos;t guarantee any particular amount of traffic, clicks,
          or sales from holding a ranked position. Outcomes shared by other
          stores are their own results, not a promise of what you&apos;ll
          see.
        </p>
      </div>
      <div>
        <h2>Prohibited listings</h2>
        <p>
          Stores selling illegal goods or services, engaging in fraud, or
          infringing on others&apos; intellectual property aren&apos;t
          permitted and may be removed without a refund.
        </p>
      </div>
      <div>
        <h2>Limitation of liability</h2>
        <p>
          outbid.store is provided as-is. We aren&apos;t liable for losses
          arising from your use of the board, including lost bids, lost
          business, or downtime.
        </p>
      </div>
      <div>
        <h2>Changes</h2>
        <p>
          We may update these terms as the product changes. Continued use of
          the board after an update means you accept the revised terms.
        </p>
      </div>
      <div>
        <h2>Contact</h2>
        <p>
          Questions about these terms go to the{" "}
          <Link href="/contact" className="underline">contact page</Link>.
        </p>
      </div>
    </PageShell>
  );
}
