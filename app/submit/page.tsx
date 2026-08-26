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
          claim a spot
        </h1>
        <p className="mb-8 max-w-lg text-sm text-muted">
          Your bid decides where you land on the leaderboard. <br />
          Pay to claim a new listing slot. Minimum bid is {formatUsd(MIN_BID)}.
        </p>

        <div className="max-w-md">
          <ClaimSpotForm stores={stores} initialAmount={MIN_BID} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
