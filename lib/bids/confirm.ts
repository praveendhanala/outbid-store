import "server-only";
import { supabase } from "@/lib/supabase/server";

type BidRow = {
  id: string;
  store_id: string | null;
  amount: number;
  status: string;
  pending_name: string | null;
  pending_domain: string | null;
  pending_categories: string[] | null;
  pending_description: string | null;
};

/**
 * Applies a succeeded Dodo payment to a bid. Idempotent — safe to call
 * from both the webhook (on payment.succeeded) and the return-page
 * fallback check (in case the webhook is late, missing, or unreachable
 * in local dev).
 *
 * Every bid creates a brand-new store — none of this ever modifies an
 * existing store's row. If the person filled in store details before
 * checkout (pending_name etc. are set), the store is created right here.
 * Otherwise store_id stays null and finalizeStoreSubmission (called from
 * the /bid/return details form) creates it later.
 */
export async function confirmSucceededPayment(
  bidId: string,
  paymentId: string
): Promise<{ status: string; storeId: string | null }> {
  //const supabase = createServerSupabaseClient();

  const { data: bid } = await supabase
    .from("bids")
    .select(
      "id, store_id, amount, status, pending_name, pending_domain, pending_categories, pending_description"
    )
    .eq("id", bidId)
    .single<BidRow>();

  if (!bid) {
    return { status: "not_found", storeId: null };
  }

  // Already resolved — webhook and fallback check can both fire for the
  // same payment; only the first one to arrive should do anything.
  if (bid.status !== "pending") {
    return { status: bid.status, storeId: bid.store_id };
  }

  const hasPendingDetails =
    !!bid.pending_name && !!bid.pending_domain && !!bid.pending_description;

  if (!hasPendingDetails) {
    // Details will be added after payment, via finalizeStoreSubmission.
    await supabase
      .from("bids")
      .update({ status: "succeeded", dodo_payment_id: paymentId })
      .eq("id", bid.id);
    return { status: "succeeded", storeId: null };
  }

  const { data: store, error: insertStoreError } = await supabase
    .from("stores")
    .insert({
      name: bid.pending_name,
      domain: bid.pending_domain,
      description: bid.pending_description,
      bid: bid.amount,
      status: "active",
    })
    .select("id")
    .single();

  if (insertStoreError || !store) {
    // Most likely a duplicate domain. The payment still succeeded, so
    // mark the bid succeeded but leave store_id null — the person can
    // finish via the /bid/return form with a different domain.
    console.error(
      "confirmSucceededPayment: could not create store for bid",
      bid.id,
      insertStoreError
    );
    await supabase
      .from("bids")
      .update({ status: "succeeded", dodo_payment_id: paymentId })
      .eq("id", bid.id);
    return { status: "succeeded", storeId: null };
  }

  await supabase.from("store_categories").insert(
    (bid.pending_categories ?? []).map((category) => ({
      store_id: store.id,
      category_id: category,
    }))
  );

  await supabase
    .from("bids")
    .update({
      status: "succeeded",
      dodo_payment_id: paymentId,
      store_id: store.id,
    })
    .eq("id", bid.id);

  return { status: "succeeded", storeId: store.id };
}

export async function markFailedPayment(bidId: string): Promise<void> {
  //const supabase = createServerSupabaseClient();
  await supabase
    .from("bids")
    .update({ status: "failed" })
    .eq("id", bidId)
    .eq("status", "pending");
}
