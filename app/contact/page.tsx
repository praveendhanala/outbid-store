"use client";

import { useActionState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  sendContactMessage,
  type ContactState,
} from "@/app/actions/contact";

const initialState: ContactState = {
  success: false,
  message: "",
};

export default function ContactPage() {
  const [state, formAction, pending] = useActionState(
    sendContactMessage,
    initialState
  );

  return (
    <div className="mx-auto max-w-2xl px-4">
      <Header />

      <div className="py-10">
        <h1 className="font-display mb-2 text-3xl font-bold">contact</h1>

        <p className="mb-8 max-w-lg text-sm text-muted">
          Questions about a listing, a bid, or the board in general.
        </p>

        {state.success ? (
          <div className="rounded-xl border border-border bg-surface p-4 text-sm">
            {state.message}
          </div>
        ) : (
          <form
            action={formAction}
            className="flex max-w-sm flex-col gap-3"
          >
            <Field label="Name">
              <input
                name="name"
                type="text"
                required
                maxLength={100}
                autoComplete="name"
                className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40"
              />
            </Field>

            <Field label="Email">
              <input
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40"
              />
            </Field>

            <Field label="Message">
              <textarea
                name="message"
                required
                maxLength={5000}
                rows={5}
                className="w-full resize-none rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40"
              />
            </Field>

            {/* Honeypot */}
            <div
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
            >
              <label>
                Website
                <input
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>

            {state.message && (
              <p className="text-xs text-red-600">
                {state.message}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "sending..." : "send message"}
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
