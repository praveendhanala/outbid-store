"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MIN_BID, type Category, type Store } from "@/lib/data";
import { formatNumber, formatUsd } from "@/lib/format";
import { ClaimSpotForm } from "./ClaimSpotForm";
import { CategoryPills } from "./CategoryPills";

export function Leaderboard({
  initialStores,
  initialCategory = "all",
}: {
  initialStores: Store[];
  initialCategory?: Category;
}) {
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [prevInitialStores, setPrevInitialStores] =
    useState<Store[]>(initialStores);

  // If Next re-renders this page with fresh data (e.g. after a
  // confirmed bid revalidates it), sync the local copy. Done during
  // render (React's recommended pattern for this) rather than in an
  // effect.
  if (initialStores !== prevInitialStores) {
    setPrevInitialStores(initialStores);
    setStores(initialStores);
  }

  const [category, setCategory] = useState<Category>(initialCategory);
  // Which row's claim form is open, and what amount to prefill it with.
  // Tracked separately from the amount itself so two rows that happen to
  // share the same bid+1 don't both appear "open" at once. "leader" is a
  // sentinel for the #1 card, since it isn't in the sliced list below.
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [claimPrefill, setClaimPrefill] = useState(MIN_BID);

  function openClaimForm(rowId: string, prefill: number) {
    setOpenRowId(rowId);
    setClaimPrefill(prefill);
  }

  const filtered = useMemo(() => {
    if (category === "all") return stores;
    return stores.filter((store) => store.categories.includes(category));
  }, [stores, category]);

  const leader = filtered[0];

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
                {leader.categories.join(", ")} &middot; {leader.addedAgo}{" "}
                &middot; {formatNumber(leader.clicks)} clicks
              </p>
            </div>
            <span className="font-mono text-lg font-bold">
              {formatUsd(leader.bid)}
            </span>
          </div>
          <p className="mb-4 text-sm text-muted">{leader.description}</p>

          {openRowId === "leader" ? (
            <ClaimSpotForm
              stores={stores}
              initialAmount={claimPrefill}
              onCancel={() => setOpenRowId(null)}
            />
          ) : (
            <button
              type="button"
              onClick={() => openClaimForm("leader", leader.bid + 1)}
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
                  {store.categories.join(", ")} &middot; {store.addedAgo}
                </p>
              </div>
              <span className="font-mono text-sm font-semibold">
                {formatUsd(store.bid)}
              </span>
              {openRowId !== store.id && (
                <button
                  type="button"
                  onClick={() => openClaimForm(store.id, store.bid + 1)}
                  className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-foreground/40 hover:text-foreground"
                >
                  outbid
                </button>
              )}
            </div>
            {openRowId === store.id && (
              <div className="mt-3 pl-10">
                <ClaimSpotForm
                  stores={stores}
                  initialAmount={claimPrefill}
                  onCancel={() => setOpenRowId(null)}
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
          claim a spot
        </Link>
        <p className="text-xs text-muted">
          minimum bid {formatUsd(MIN_BID)} &middot; every bid creates a new
          listing — rank is just where your amount lands
        </p>
      </div>
    </div>
  );
}
