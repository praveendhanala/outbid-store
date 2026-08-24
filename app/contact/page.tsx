"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Fill in every field.");
      return;
    }
    if (!email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    setError(null);
    // No backend wired up yet — this just confirms locally.
    // Wire this to an email API route or a form service before launch.
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-2xl px-4">
      <Header />
      <div className="py-10">
        <h1 className="font-display mb-2 text-3xl font-bold">contact</h1>
        <p className="mb-8 max-w-lg text-sm text-muted">
          Questions about a listing, a bid, or the board in general.
        </p>

        {sent ? (
          <p className="rounded-xl border border-border bg-surface p-4 text-sm">
            Message received. We&apos;ll get back to you at {email}.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex max-w-sm flex-col gap-3"
          >
            <Field label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40"
              />
            </Field>
            <Field label="Message">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40"
              />
            </Field>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              send message
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
