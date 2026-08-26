"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MIN_BID, type Category, type Store } from "@/lib/data";
import { formatNumber, formatUsd } from "@/lib/format";
import { ClaimSpotForm } from "./ClaimSpotForm";
import { CategoryPills } from "./CategoryPills";
import { StoreIcon } from "./StoreIcon";

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

  // Store links below use plain <a> tags, not next/link's <Link>.
  // Link prefetches routes that scroll into view, which would fire the
  // /go redirect (and inflate the click count) just from being visible —
  // not from an actual click.

  return (
    <div id="leaderboard">
      <CategoryPills active={category} onChange={setCategory} />

      {leader && (
        <div className="my-5 rounded-xl border border-accent bg-surface p-5">
          <div className="mb-3 flex items-center gap-3">
            <span className="font-mono text-xl font-bold text-accent">
              #{leader.rank}
            </span>
            <a
              href={`/go/${leader.id}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-md -m-1 p-1 transition-colors hover:bg-background"
            >
              <StoreIcon
                domain={leader.domain}
                name={leader.name}
                className="h-12 w-12 shrink-0 rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  <span className="text-md">
                    {leader.name}{" "}
                  </span>
                  <span className="text-xs font-normal text-muted">
                    &middot; {leader.domain}
                  </span>
                </p>
                <p className="mb-2 text-sm text-muted">{leader.description}</p>
                <p className="text-xs text-muted">
                  {leader.categories.join(", ")} &middot; {leader.addedAgo}{" "}
                  &middot;
                  <span className="font-semibold">{formatNumber(leader.clicks)} clicks</span>
                </p>
              </div>
            </a>
            <span className="text-xl font-semibold text-accent">
              {formatUsd(leader.bid)}
            </span>
          </div>
          <p className="hidden mb-4 text-sm text-muted">{leader.description}</p>

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
              className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
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
              <span className="w-8 font-mono font-bold text-md text-muted">
                #{store.rank}
              </span>
              <a
                href={`/go/${store.id}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex min-w-0 flex-1 items-center gap-3 rounded-md -m-1 p-1 transition-colors hover:bg-surface"
              >
                <StoreIcon
                  domain={store.domain}
                  name={store.name}
                  className="h-10 w-10 shrink-0 rounded-md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate">
                    <span className="text-md text-semibold">
                      {store.name}{" "}
                    </span>
                    <span className="text-xs text-muted">&middot; {store.domain}</span>
                  </p>
                  <p className="mb-1 text-sm text-muted">{store.description}</p>
                  <p className="text-xs text-muted">
                    {store.categories.join(", ")} &middot; {store.addedAgo}{" "}
                    &middot;
                    <span className="font-semibold">{formatNumber(store.clicks)} clicks</span>
                  </p>
                </div>
              </a>
              <span className="text-sm font-semibold">
                {formatUsd(store.bid)}
              </span>
              {openRowId !== store.id && (
                <button
                  type="button"
                  onClick={() => openClaimForm(store.id, store.bid + 1)}
                  className="shrink-0 rounded-md border border-border px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-foreground cursor-pointer"
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
          className="rounded-md bg-accent px-8 py-2 text-md font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
        >
          claim a spot
        </Link>

        <p className="text-xs text-muted">
          minimum bid {formatUsd(MIN_BID)}
          {/* &middot; every bid creates a new listing — rank is just where your amount lands */}
        </p>
      </div>
    </div>
  );
}
