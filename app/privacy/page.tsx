import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function PrivacyPage() {
  return (
    <PageShell
      title="privacy"
      intro="Last updated August 2026. What we collect and why."
    >
      <div>
        <h2>What we collect</h2>
        <p>
          When you submit a store, we collect the store name, domain,
          category, description, and bid amount you provide, plus a contact
          email for payment and listing questions. When you bid, we record
          the bid amount and time.
        </p>
      </div>
      <div>
        <h2>Basic analytics</h2>
        <p>
          We track aggregate visits and clicks to the board and to listed
          stores &mdash; not to build a profile of individual visitors, but
          to show stores how much traffic a position is driving.
        </p>
      </div>
      <div>
        <h2>What we don&apos;t do</h2>
        <p>
          We don&apos;t sell your data to third parties, and we don&apos;t
          share your contact email with other stores on the board.
        </p>
      </div>
      <div>
        <h2>Cookies</h2>
        <p>
          We use minimal, functional cookies to keep the site working. We
          don&apos;t use them for cross-site ad tracking.
        </p>
      </div>
      <div>
        <h2>Your requests</h2>
        <p>
          To have your store listing or contact information removed, reach
          out through the <Link href="/contact" className="underline">contact page</Link>.
        </p>
      </div>
    </PageShell>
  );
}
