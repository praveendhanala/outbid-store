"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { INITIAL_STORES, MIN_BID, type Category, type Store } from "@/lib/data";
import { formatNumber, formatUsd } from "@/lib/format";
import { CategoryPills } from "./CategoryPills";

function resortByBid(stores: Store[]): Store[] {
  return [...stores]
    .sort((a, b) => b.bid - a.bid)
    .map((store, index) => ({ ...store, rank: index + 1 }));
}

export function Leaderboard({
  initialCategory = "all",
}: {
  initialCategory?: Category;
}) {
  const [stores, setStores] = useState<Store[]>(() => resortByBid(INITIAL_STORES));
  const [category, setCategory] = useState<Category>(initialCategory);
  const [bidTargetId, setBidTargetId] = useState<string | null>(null);
  const [bidValue, setBidValue] = useState("");
  const [bidError, setBidError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (category === "all") return stores;
    return stores.filter((store) => store.category === category);
  }, [stores, category]);

  const leader = stores[0];

  function openBid(storeId: string, currentBid: number) {
    setBidTargetId(storeId);
    setBidValue(String(currentBid + 1));
    setBidError(null);
  }

  function closeBid() {
    setBidTargetId(null);
    setBidValue("");
    setBidError(null);
  }

  function submitBid(store: Store) {
    const amount = Number(bidValue);
    if (!bidValue || Number.isNaN(amount)) {
      setBidError("Enter a bid amount.");
      return;
    }
    if (amount <= store.bid) {
      setBidError(`Bid must be higher than ${formatUsd(store.bid)}.`);
      return;
    }
    if (amount < MIN_BID) {
      setBidError(`Minimum bid is ${formatUsd(MIN_BID)}.`);
      return;
    }
    setStores((prev) =>
      resortByBid(
        prev.map((s) =>
          s.id === store.id
            ? { ...s, bid: amount, addedAgo: "just now", clicks: s.clicks }
            : s
        )
      )
    );
    closeBid();
  }

  return (
    <div id="leaderboard">
      <CategoryPills active={category} onChange={setCategory} />

      {leader && (
        <div className="my-5 rounded-xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-muted">
              #{leader.rank}
            </span>
            <div className="h-8 w-8 shrink-0 rounded-lg bg-accent-tint" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {leader.name}{" "}
                <span className="font-normal text-muted">
                  &middot; {leader.domain}
                </span>
              </p>
              <p className="text-xs text-muted">
                {leader.category} &middot; {leader.addedAgo} &middot;{" "}
                {formatNumber(leader.clicks)} clicks
              </p>
            </div>
            <span className="font-mono text-lg font-bold">
              {formatUsd(leader.bid)}
            </span>
          </div>
          <p className="mb-4 text-sm text-muted">{leader.description}</p>

          {bidTargetId === leader.id ? (
            <BidForm
              store={leader}
              value={bidValue}
              error={bidError}
              onChange={setBidValue}
              onCancel={closeBid}
              onSubmit={() => submitBid(leader)}
            />
          ) : (
            <button
              type="button"
              onClick={() => openBid(leader.id, leader.bid)}
              className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              claim rank #1 for {formatUsd(leader.bid + 1)}
            </button>
          )}
        </div>
      )}

      <ul className="divide-y divide-border">
        {filtered.slice(1).map((store) => (
          <li key={store.id} className="py-3.5">
            <div className="flex items-center gap-3">
              <span className="w-7 font-mono text-xs text-muted">
                #{store.rank}
              </span>
              <div className="h-7 w-7 shrink-0 rounded-md bg-accent-tint" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">
                  {store.name}{" "}
                  <span className="text-muted">&middot; {store.domain}</span>
                </p>
                <p className="text-xs text-muted">
                  {store.category} &middot; {store.addedAgo}
                </p>
              </div>
              <span className="font-mono text-sm font-semibold">
                {formatUsd(store.bid)}
              </span>
              {bidTargetId !== store.id && (
                <button
                  type="button"
                  onClick={() => openBid(store.id, store.bid)}
                  className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-foreground/40 hover:text-foreground"
                >
                  outbid
                </button>
              )}
            </div>
            {bidTargetId === store.id && (
              <div className="mt-3 pl-10">
                <BidForm
                  store={store}
                  value={bidValue}
                  error={bidError}
                  onChange={setBidValue}
                  onCancel={closeBid}
                  onSubmit={() => submitBid(store)}
                />
              </div>
            )}
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="py-10 text-center text-sm text-muted">
            No stores in this category yet. Be the first to claim it.
          </li>
        )}
      </ul>

      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Link
          href="/submit"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-foreground/40"
        >
          submit your store
        </Link>
        <p className="text-xs text-muted">
          minimum bid {formatUsd(MIN_BID)} &middot; rank is the bid, nothing
          else
        </p>
      </div>
    </div>
  );
}

function BidForm({
  store,
  value,
  error,
  onChange,
  onCancel,
  onSubmit,
}: {
  store: Store;
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-background p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">$</span>
        <input
          type="number"
          inputMode="numeric"
          min={store.bid + 1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 font-mono text-sm outline-none focus:border-foreground/40"
          aria-label={`Bid amount to outbid ${store.name}`}
        />
        <button
          type="button"
          onClick={onSubmit}
          className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          place bid
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          cancel
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
