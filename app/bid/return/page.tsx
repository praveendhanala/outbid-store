import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BidReturnClient } from "@/components/BidReturnClient";

export const dynamic = "force-dynamic";

export default async function BidReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ bid_id?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4">
      <Header />
      {params.bid_id ? (
        <BidReturnClient bidId={params.bid_id} />
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <h1 className="font-display text-2xl font-bold">
            missing bid reference
          </h1>
          <p className="max-w-sm text-sm text-muted">
            This page is meant to be reached after a checkout redirect.
          </p>
        </div>
      )}
      <Footer />
    </div>
  );
}
