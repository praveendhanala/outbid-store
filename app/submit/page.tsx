import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ClaimSpotForm } from "@/components/ClaimSpotForm";
import { MIN_BID } from "@/lib/data";
import { formatUsd } from "@/lib/format";
import { getLeaderboard } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const stores = await getLeaderboard();

  return (
    <div className="mx-auto max-w-2xl px-4">
      <Header />
      <div className="py-10">
        <h1 className="font-display mb-2 text-3xl font-bold">
          claim a spot on the board
        </h1>
        <p className="mb-8 max-w-lg text-sm text-muted">
          Pay to claim a new listing slot — your bid decides where you land,
          not any existing store. Minimum bid is {formatUsd(MIN_BID)}. Add
          your store&apos;s details below before paying.
        </p>

        <div className="max-w-sm">
          <ClaimSpotForm stores={stores} initialAmount={MIN_BID} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
