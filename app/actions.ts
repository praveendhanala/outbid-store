"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase/server";
import { createDodoClient, getDodoProductId, toCents } from "@/lib/dodo/client";
import { confirmSucceededPayment, markFailedPayment } from "@/lib/bids/confirm";
import { isValidEmail } from "@/lib/validate";
import {
  MAX_CATEGORIES_PER_STORE,
  MIN_BID,
  type Category,
  type Store,
} from "@/lib/data";
import { formatTimeAgo } from "@/lib/format";

type StoreCategoryRow = { category_id: string };

type StoreRow = {
  id: string;
  name: string;
  domain: string;
  description: string;
  bid: number;
  clicks: number;
  created_at: string;
  store_categories: StoreCategoryRow[];
};

function toStore(row: StoreRow, rank: number): Store {
  return {
    id: row.id,
    rank,
    name: row.name,
    domain: row.domain,
    categories: row.store_categories.map(
      (c) => c.category_id
    ) as Store["categories"],
    description: row.description,
    bid: row.bid,
    addedAgo: formatTimeAgo(row.created_at),
    clicks: row.clicks,
  };
}

export async function getLeaderboard(category?: Category): Promise<Store[]> {
  //const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("stores")
    .select(
      "id, name, domain, description, bid, clicks, created_at, store_categories(category_id)"
    )
    .eq("status", "active")
    .order("bid", { ascending: false });

  if (error) throw new Error(error.message);

  const stores = ((data ?? []) as StoreRow[]).map((row, index) =>
    toStore(row, index + 1)
  );

  if (!category || category === "all") return stores;
  return stores.filter((store) => store.categories.includes(category));
}

const RETURN_PATH = "/bid/return";

function returnUrl(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base}${RETURN_PATH}`;
}

export type StoreDetailsInput = {
  name: string;
  domain: string;
  categories: Exclude<Category, "all">[];
  description: string;
};

function validateStoreDetails(input: StoreDetailsInput): string | null {
  if (!input.name.trim() || !input.domain.trim() || !input.description.trim()) {
    return "Fill in every field.";
  }
  if (input.categories.length === 0) {
    return "Pick at least one category.";
  }
  if (input.categories.length > MAX_CATEGORIES_PER_STORE) {
    return `Pick up to ${MAX_CATEGORIES_PER_STORE} categories.`;
  }
  return null;
}

/**
 * Start a checkout to claim a new spot on the board. Every bid creates a
 * brand-new listing — this never targets or modifies an existing store,
 * even when the amount was pre-filled from an "outbid" shortcut next to
 * one. Store details are optional here: pass them to have the store
 * created automatically the moment payment confirms, or omit them to add
 * them afterward on /bid/return.
 */
export async function createSubmissionCheckout(
  amount: number,
  customerEmail: string,
  details?: StoreDetailsInput
): Promise<{ checkoutUrl: string | null; error: string | null }> {
  if (!isValidEmail(customerEmail)) {
    return { checkoutUrl: null, error: "Enter a valid email." };
  }
  if (!Number.isFinite(amount) || amount < MIN_BID) {
    return { checkoutUrl: null, error: `Minimum bid is $${MIN_BID}.` };
  }
  if (details) {
    const detailsError = validateStoreDetails(details);
    if (detailsError) return { checkoutUrl: null, error: detailsError };
  }

  //const supabase = createServerSupabaseClient();

  if (details) {
    // Early, friendly check — the real guarantee is still the unique
    // constraint at store-creation time, since this could still race
    // with another pending bid for the same domain.
    const { data: existing } = await supabase
      .from("stores")
      .select("id")
      .eq("domain", details.domain.trim())
      .maybeSingle();
    if (existing) {
      return { checkoutUrl: null, error: "That domain is already listed." };
    }
  }

  const { data: bid, error: insertError } = await supabase
    .from("bids")
    .insert({
      store_id: null,
      amount,
      customer_email: customerEmail,
      pending_name: details?.name.trim() ?? null,
      pending_domain: details?.domain.trim() ?? null,
      pending_categories: details?.categories ?? null,
      pending_description: details?.description.trim() ?? null,
    })
    .select("id")
    .single();

  if (insertError || !bid) {
    return {
      checkoutUrl: null,
      error: insertError?.message ?? "Could not start the bid.",
    };
  }

  try {
    const dodo = createDodoClient();
    const session = await dodo.checkoutSessions.create({
      product_cart: [
        {
          product_id: getDodoProductId(),
          quantity: 1,
          amount: toCents(amount),
        },
      ],
      customer: { email: customerEmail },
      return_url: `${returnUrl()}?bid_id=${bid.id}`,
      metadata: { bid_id: bid.id },
    });

    await supabase
      .from("bids")
      .update({ dodo_checkout_session_id: session.session_id })
      .eq("id", bid.id);

    return { checkoutUrl: session.checkout_url ?? null, error: null };
  } catch (err) {
    await supabase.from("bids").update({ status: "failed" }).eq("id", bid.id);
    return {
      checkoutUrl: null,
      error: err instanceof Error ? err.message : "Could not start checkout.",
    };
  }
}

export type BidStatusResult = {
  status: "pending" | "succeeded" | "failed" | "not_found";
  storeId: string | null;
  amount: number;
  // True once payment has succeeded but no store exists yet — the
  // person chose to add details after paying, and hasn't yet.
  needsDetails: boolean;
};

/**
 * Read a bid's current status — used by /bid/return to poll after
 * redirect. If it's still "pending" and the webhook hasn't resolved it
 * yet, this also checks directly with Dodo as a fallback (covers
 * webhooks that are delayed, misconfigured, or unreachable, e.g. local
 * dev without a tunnel).
 */
export async function checkBidStatus(bidId: string): Promise<BidStatusResult> {
  //const supabase = createServerSupabaseClient();

  const { data: bid } = await supabase
    .from("bids")
    .select("id, store_id, amount, status, dodo_checkout_session_id")
    .eq("id", bidId)
    .single();

  if (!bid) {
    return { status: "not_found", storeId: null, amount: 0, needsDetails: false };
  }

  if (bid.status !== "pending" || !bid.dodo_checkout_session_id) {
    return {
      status: bid.status as BidStatusResult["status"],
      storeId: bid.store_id,
      amount: bid.amount,
      needsDetails: bid.status === "succeeded" && !bid.store_id,
    };
  }

  try {
    const dodo = createDodoClient();
    const session = await dodo.checkoutSessions.retrieve(
      bid.dodo_checkout_session_id
    );

    if (session.payment_status === "succeeded" && session.payment_id) {
      const result = await confirmSucceededPayment(bid.id, session.payment_id);
      return {
        status: result.status as BidStatusResult["status"],
        storeId: result.storeId,
        amount: bid.amount,
        needsDetails: result.status === "succeeded" && !result.storeId,
      };
    }
    if (session.payment_status === "failed" || session.payment_status === "cancelled") {
      await markFailedPayment(bid.id);
      return { status: "failed", storeId: bid.store_id, amount: bid.amount, needsDetails: false };
    }
  } catch (err) {
    console.error("Dodo fallback status check failed for bid", bid.id, err);
  }

  return { status: "pending", storeId: bid.store_id, amount: bid.amount, needsDetails: false };
}

/**
 * Creates the store row for a confirmed bid that didn't include details
 * up front. Only callable once the bid has succeeded and doesn't already
 * have a store — payment is already done, so the store goes active
 * immediately.
 */
export async function finalizeStoreSubmission(
  bidId: string,
  input: StoreDetailsInput
): Promise<{ error: string | null; storeId: string | null }> {
  const detailsError = validateStoreDetails(input);
  if (detailsError) return { error: detailsError, storeId: null };

  //const supabase = createServerSupabaseClient();

  const { data: bid, error: bidError } = await supabase
    .from("bids")
    .select("id, amount, status, store_id")
    .eq("id", bidId)
    .single();

  if (bidError || !bid) {
    return { error: "Bid not found.", storeId: null };
  }
  if (bid.status !== "succeeded") {
    return { error: "This bid hasn't been paid yet.", storeId: null };
  }
  if (bid.store_id) {
    // Already finalized (e.g. a duplicate submit) — just return it.
    return { error: null, storeId: bid.store_id };
  }

  const { data: store, error: insertStoreError } = await supabase
    .from("stores")
    .insert({
      name: input.name.trim(),
      domain: input.domain.trim(),
      description: input.description.trim(),
      bid: bid.amount,
      status: "active",
    })
    .select("id")
    .single();

  if (insertStoreError || !store) {
    if (insertStoreError?.code === "23505") {
      return { error: "That domain is already listed.", storeId: null };
    }
    return {
      error: insertStoreError?.message ?? "Could not create the store.",
      storeId: null,
    };
  }

  const { error: categoryError } = await supabase
    .from("store_categories")
    .insert(
      input.categories.map((category) => ({
        store_id: store.id,
        category_id: category,
      }))
    );

  if (categoryError) {
    return { error: categoryError.message, storeId: null };
  }

  await supabase.from("bids").update({ store_id: store.id }).eq("id", bid.id);

  await revalidateLeaderboard();
  return { error: null, storeId: store.id };
}

export async function revalidateLeaderboard() {
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/about");
}
