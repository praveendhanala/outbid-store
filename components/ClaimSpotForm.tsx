"use client";

import { useMemo, useState } from "react";
import {
  CATEGORIES,
  MAX_CATEGORIES_PER_STORE,
  MIN_BID,
  STORE_DESCRIPTION_MAX_LENGTH,
  STORE_DOMAIN_MAX_LENGTH,
  STORE_NAME_MAX_LENGTH,
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
    const ahead = stores.filter((s) => s.bid >= parsed).length;
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
    if (!name.trim() || !domain.trim() || !description.trim()) {
      setError("Fill in every store detail.");
      return;
    }
    if (selectedCategories.length === 0) {
      setError("Pick at least one category.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const result = await createSubmissionCheckout(parsedAmount, email, {
      name,
      domain,
      categories: selectedCategories,
      description,
    });

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
        <span className="text-sm font-bold text-muted">Your bid</span>
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
            of {formatNumber(preview.total)}
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
          placeholder=""
          className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40 disabled:opacity-60"
        />
      </label>

      <div className="flex flex-col gap-3 rounded-md border border-border bg-background p-3">
        <p className="text-sm font-bold text-muted">
          Store details
        </p>
        <CharLimitedField
          label="Store name"
          value={name}
          onChange={setName}
          placeholder=""
          maxLength={STORE_NAME_MAX_LENGTH}
          disabled={isSubmitting}
          showlength={false}
        />
        <CharLimitedField
          label="Website"
          value={domain}
          onChange={setDomain}
          placeholder=""
          maxLength={STORE_DOMAIN_MAX_LENGTH}
          disabled={isSubmitting}
          showlength={false}
          //hint="no https:// needed"
        />
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
        <CharLimitedField
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="One line on what the store sells."
          maxLength={STORE_DESCRIPTION_MAX_LENGTH}
          disabled={isSubmitting}
          multiline
          showlength={true}
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? "starting checkout..." : "continue to payment"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="shrink-0 rounded-md border border-border px-3 py-2.5 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-60 cursor-pointer"
          >
            cancel
          </button>
        )}
      </div>
    </form>
  );
}

function CharLimitedField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  disabled,
  multiline,
  hint,
  showlength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  disabled: boolean;
  multiline?: boolean;
  hint?: string;
  showlength?: boolean;
}) {
  const sharedClassName =
    "w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40 disabled:opacity-60";

  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-center justify-between text-xs text-muted">
        <span>{label}</span>
        { showlength && (
          <span>
            {value.length}/{maxLength}
          </span>
        )}

      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          rows={2}
          className={`resize-none ${sharedClassName}`}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={sharedClassName}
        />
      )}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}
