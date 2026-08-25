"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  MAX_CATEGORIES_PER_STORE,
  type Category,
} from "@/lib/data";
import { formatUsd } from "@/lib/format";
import {
  checkBidStatus,
  finalizeStoreSubmission,
  type BidStatusResult,
} from "@/app/actions";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20; // ~1 minute before we stop auto-polling

export function BidReturnClient({ bidId }: { bidId: string }) {
  const [result, setResult] = useState<BidStatusResult | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poll = useCallback(async () => {
    const next = await checkBidStatus(bidId);
    setResult(next);
    return next;
  }, [bidId]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const next = await poll();
      if (!cancelled && next.status === "pending") {
        setPollCount((c) => c + 1);
      }
    }
    run();

    return () => {
      cancelled = true;
    };
    // Only re-run this effect when the poll count advances (see the
    // effect below) — not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!result || result.status !== "pending" || pollCount >= MAX_POLLS) {
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      const next = await poll();
      if (next.status === "pending") {
        setPollCount((c) => c + 1);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pollCount, result, poll]);

  async function handleManualCheck() {
    await poll();
  }

  if (!result) {
    return <StatusMessage title="checking payment..." body="One moment." />;
  }

  if (result.status === "not_found") {
    return (
      <StatusMessage
        title="we couldn't find that bid"
        body="If you completed a payment, contact us with your receipt and we'll sort it out."
      />
    );
  }

  if (result.status === "failed") {
    return (
      <StatusMessage
        title="payment didn't go through"
        body="No charge was made. You can try again from the leaderboard."
      />
    );
  }

  if (result.status === "pending") {
    return (
      <StatusMessage
        title="confirming your payment..."
        body="This is usually instant. If it's been longer than a minute, you can check again."
      >
        <button
          type="button"
          onClick={handleManualCheck}
          className="mt-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-foreground/40"
        >
          check again
        </button>
      </StatusMessage>
    );
  }

  // status === "succeeded"
  if (result.needsDetails) {
    return <StoreDetailsForm bidId={bidId} amount={result.amount} />;
  }

  return (
    <StatusMessage
      title="payment confirmed"
      body="Your bid is live on the leaderboard."
    >
      <Link
        href="/"
        className="mt-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-foreground/40"
      >
        view leaderboard
      </Link>
    </StatusMessage>
  );
}

function StatusMessage({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <p className="max-w-sm text-sm text-muted">{body}</p>
      {children}
    </div>
  );
}

function StoreDetailsForm({
  bidId,
  amount,
}: {
  bidId: string;
  amount: number;
}) {
  const categories = CATEGORIES.filter(
    (c): c is Exclude<Category, "all"> => c !== "all"
  );

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    Exclude<Category, "all">[]
  >([]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function toggleCategory(category: Exclude<Category, "all">) {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) return prev.filter((c) => c !== category);
      if (prev.length >= MAX_CATEGORIES_PER_STORE) {
        setError(`Pick up to ${MAX_CATEGORIES_PER_STORE} categories.`);
        return prev;
      }
      setError(null);
      return [...prev, category];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !domain.trim() || !description.trim()) {
      setError("Fill in every field.");
      return;
    }
    if (selectedCategories.length === 0) {
      setError("Pick at least one category.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const result = await finalizeStoreSubmission(bidId, {
      name,
      domain,
      categories: selectedCategories,
      description,
    });
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <StatusMessage
        title="you're on the board"
        body={`Listed at ${formatUsd(amount)}.`}
      >
        <Link
          href="/"
          className="mt-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-foreground/40"
        >
          view leaderboard
        </Link>
      </StatusMessage>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <h1 className="font-display text-2xl font-bold">payment confirmed</h1>
      <p className="mb-6 max-w-sm text-sm text-muted">
        {formatUsd(amount)} is locked in. Add your store&apos;s details to
        finish claiming your spot.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-3 text-left"
      >
        <Field label="Store name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sneaker Hub"
            disabled={isSubmitting}
            className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40 disabled:opacity-60"
          />
        </Field>
        <Field label="Domain">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="sneakerhub.com"
            disabled={isSubmitting}
            className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40 disabled:opacity-60"
          />
        </Field>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted">
            Categories ({selectedCategories.length}/{MAX_CATEGORIES_PER_STORE})
          </span>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const isSelected = selectedCategories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => toggleCategory(c)}
                  aria-pressed={isSelected}
                  className={`rounded-md border px-3 py-1.5 text-sm transition-colors disabled:opacity-60 ${
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted hover:text-foreground hover:border-foreground/40"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="One line on what the store sells."
            rows={2}
            disabled={isSubmitting}
            className="w-full resize-none rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40 disabled:opacity-60"
          />
        </Field>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? "adding..." : "add to leaderboard"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}
