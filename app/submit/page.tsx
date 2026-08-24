"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CATEGORIES, MIN_BID, type Category } from "@/lib/data";
import { formatUsd } from "@/lib/format";

export default function SubmitPage() {
  const categories = CATEGORIES.filter(
    (c): c is Exclude<Category, "all"> => c !== "all"
  );

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [category, setCategory] = useState<Exclude<Category, "all">>(
    categories[0]
  );
  const [description, setDescription] = useState("");
  const [bid, setBid] = useState(String(MIN_BID));
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ name: string; bid: number } | null>(
    null
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !domain.trim() || !description.trim()) {
      setError("Fill in every field before submitting.");
      return;
    }
    const amount = Number(bid);
    if (!bid || Number.isNaN(amount) || amount < MIN_BID) {
      setError(`Minimum bid is ${formatUsd(MIN_BID)}.`);
      return;
    }
    setError(null);
    // No backend wired up yet — this confirms locally rather than
    // adding to the live leaderboard. Wire this to your database and
    // payment provider before launch.
    setSubmitted({ name, bid: amount });
  }

  return (
    <div className="mx-auto max-w-2xl px-4">
      <Header />
      <div className="py-10">
        <h1 className="font-display mb-2 text-3xl font-bold">
          submit your store
        </h1>
        <p className="mb-8 max-w-lg text-sm text-muted">
          Add your store to the board. Minimum starting bid is{" "}
          {formatUsd(MIN_BID)}.
        </p>

        {submitted ? (
          <div className="max-w-sm rounded-xl border border-border bg-surface p-4 text-sm">
            <p className="font-semibold">{submitted.name} is ready to bid.</p>
            <p className="mt-1 text-muted">
              Starting bid {formatUsd(submitted.bid)}. Head to the{" "}
              <Link href="/" className="underline">
                leaderboard
              </Link>{" "}
              to see where stores currently stand.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex max-w-sm flex-col gap-3"
          >
            <Field label="Store name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sneaker Hub"
                className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40"
              />
            </Field>
            <Field label="Domain">
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="sneakerhub.com"
                className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40"
              />
            </Field>
            <Field label="Category">
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as Exclude<Category, "all">)
                }
                className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40"
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
                className="w-full resize-none rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40"
              />
            </Field>
            <Field label={`Starting bid (min ${formatUsd(MIN_BID)})`}>
              <input
                type="number"
                min={MIN_BID}
                value={bid}
                onChange={(e) => setBid(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 font-mono text-sm outline-none focus:border-foreground/40"
              />
            </Field>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              add to leaderboard
            </button>
          </form>
        )}
      </div>
      <Footer />
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
