"use client";

import { useState } from "react";
import { MIN_BID, type Category } from "@/lib/data";
import { formatUsd } from "@/lib/format";

type SubmitInput = {
  name: string;
  domain: string;
  category: Exclude<Category, "all">;
  description: string;
  bid: number;
};

export function SubmitStoreDialog({
  categories,
  onClose,
  onSubmit,
}: {
  categories: Exclude<Category, "all">[];
  onClose: () => void;
  onSubmit: (input: SubmitInput) => void;
}) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [category, setCategory] = useState<Exclude<Category, "all">>(
    categories[0]
  );
  const [description, setDescription] = useState("");
  const [bid, setBid] = useState(String(MIN_BID));
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!name.trim() || !domain.trim() || !description.trim()) {
      setError("Fill in every field before submitting.");
      return;
    }
    const amount = Number(bid);
    if (!bid || Number.isNaN(amount) || amount < MIN_BID) {
      setError(`Minimum bid is ${formatUsd(MIN_BID)}.`);
      return;
    }
    onSubmit({ name, domain, category, description, bid: amount });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-store-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="submit-store-title" className="font-display mb-4 text-lg font-bold">
          submit your store
        </h2>

        <div className="flex flex-col gap-3">
          <Field label="Store name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sneaker Hub"
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40"
            />
          </Field>
          <Field label="Domain">
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="sneakerhub.com"
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40"
            />
          </Field>
          <Field label="Category">
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as Exclude<Category, "all">)
              }
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One line on what the store sells."
              rows={2}
              className="w-full resize-none rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40"
            />
          </Field>
          <Field label={`Starting bid (min ${formatUsd(MIN_BID)})`}>
            <input
              type="number"
              min={MIN_BID}
              value={bid}
              onChange={(e) => setBid(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-sm outline-none focus:border-foreground/40"
            />
          </Field>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              add to leaderboard
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              cancel
            </button>
          </div>
        </div>
      </div>
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
