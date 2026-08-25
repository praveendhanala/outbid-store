"use client";

import { useMemo, useState } from "react";
import {
  CATEGORIES,
  MAX_CATEGORIES_PER_STORE,
  MIN_BID,
  type Category,
  type Store,
} from "@/lib/data";
import { formatNumber, formatUsd } from "@/lib/format";
import { createSubmissionCheckout } from "@/app/actions";

export function ClaimSpotForm({
  stores,
  initialAmount,
  onCancel,
}: {
  stores: Store[];
  initialAmount?: number;
  onCancel?: () => void;
}) {
  const [amount, setAmount] = useState(String(initialAmount ?? MIN_BID));
  const [email, setEmail] = useState("");
  const [addDetailsNow, setAddDetailsNow] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    Exclude<Category, "all">[]
  >([]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = CATEGORIES.filter(
    (c): c is Exclude<Category, "all"> => c !== "all"
  );

  const preview = useMemo(() => {
    const parsed = Number(amount);
    if (!amount || Number.isNaN(parsed) || parsed <= 0) return null;
    const ahead = stores.filter((s) => s.bid > parsed).length;
    return { position: ahead + 1, total: stores.length + 1, amount: parsed };
  }, [amount, stores]);

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
    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount < MIN_BID) {
      setError(`Minimum bid is ${formatUsd(MIN_BID)}.`);
      return;
    }
    if (!email.trim()) {
      setError("Enter your email.");
      return;
    }
    if (addDetailsNow) {
      if (!name.trim() || !domain.trim() || !description.trim()) {
        setError("Fill in every store detail, or switch to adding them after payment.");
        return;
      }
      if (selectedCategories.length === 0) {
        setError("Pick at least one category.");
        return;
      }
    }

    setError(null);
    setIsSubmitting(true);
    const result = await createSubmissionCheckout(
      parsedAmount,
      email,
      addDetailsNow
        ? {
            name,
            domain,
            categories: selectedCategories,
            description,
          }
        : undefined
    );

    if (result.error || !result.checkoutUrl) {
      setIsSubmitting(false);
      setError(result.error ?? "Could not start checkout.");
      return;
    }

    window.location.href = result.checkoutUrl;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted">Your bid</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">$</span>
          <input
            type="number"
            inputMode="numeric"
            min={MIN_BID}
            value={amount}
            disabled={isSubmitting}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 font-mono text-sm outline-none focus:border-foreground/40 disabled:opacity-60"
            aria-label="Bid amount"
          />
        </div>
        {preview && (
          <p className="text-xs text-muted">
            {formatUsd(preview.amount)} would currently rank you{" "}
            <span className="font-semibold text-foreground">
              #{formatNumber(preview.position)}
            </span>{" "}
            of {formatNumber(preview.total)} — this is a snapshot of right
            now, not a hold on the spot.
          </p>
        )}
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-muted">Email (for your payment receipt)</span>
        <input
          type="email"
          value={email}
          disabled={isSubmitting}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@store.com"
          className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40 disabled:opacity-60"
        />
      </label>

      <div className="flex gap-2 rounded-md border border-border p-1 text-xs">
        <button
          type="button"
          onClick={() => setAddDetailsNow(false)}
          className={`flex-1 rounded px-2 py-1.5 transition-colors ${
            !addDetailsNow
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground"
          }`}
        >
          add store details after paying
        </button>
        <button
          type="button"
          onClick={() => setAddDetailsNow(true)}
          className={`flex-1 rounded px-2 py-1.5 transition-colors ${
            addDetailsNow
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground"
          }`}
        >
          add store details now
        </button>
      </div>

      {addDetailsNow && (
        <div className="flex flex-col gap-3 rounded-md border border-border bg-background p-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Store name</span>
            <input
              value={name}
              disabled={isSubmitting}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sneaker Hub"
              className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40 disabled:opacity-60"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Domain</span>
            <input
              value={domain}
              disabled={isSubmitting}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="sneakerhub.com"
              className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40 disabled:opacity-60"
            />
          </label>
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
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Description</span>
            <textarea
              value={description}
              disabled={isSubmitting}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One line on what the store sells."
              rows={2}
              className="w-full resize-none rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40 disabled:opacity-60"
            />
          </label>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? "starting checkout..." : "continue to payment"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="shrink-0 rounded-md border border-border px-3 py-2.5 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-60"
          >
            cancel
          </button>
        )}
      </div>
    </form>
  );
}
