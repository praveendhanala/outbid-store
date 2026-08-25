# outbid.store

A pay-to-rank leaderboard for online stores, inspired by outbid.lol. Stores
bid real dollars to hold a ranked position — no ads, no algorithm, rank is
the bid. Backed by Supabase Postgres, payments through Dodo Payments.

## Stack
Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Supabase + Dodo
Payments. No `/src` directory — `app`, `lib`, and `components` live at the
project root.

## Setup

### 1. Supabase
1. Create a Supabase project.
2. In the SQL editor, run `supabase/schema.sql`, then optionally
   `supabase/seed.sql` for example listings (seeded stores skip payment —
   they're inserted directly with `status = 'active'`).

### 2. Dodo Payments
1. Create a Dodo Payments account, switch to **test mode** while building.
2. Create **one** one-time product with **Pay What You Want** enabled —
   every bid (new listings and outbids alike) checks out against this
   single product with a dynamic amount, rather than a product per price
   point. Copy its product ID.
3. Dashboard -> Developer -> Webhooks -> add an endpoint at
   `<your-domain>/api/webhooks/dodo` (use `ngrok`/`cloudflared` for local
   testing), subscribed to at least `payment.succeeded` and
   `payment.failed`. Copy the webhook secret.
4. Copy your API key from Developer -> API Keys.

### 3. Run it
1. Copy `.env.example` to `.env.local` and fill in every value.
2. `npm install`
3. `npm run dev` — open http://localhost:3000

## How payment gates the leaderboard
A bid is a multi-step process, not a single write, because payment is
asynchronous (checkout redirect -> customer pays -> confirmation lands
sometime after) — and confirmation can come from **two** places, not just
the webhook:

1. **Checkout starts** (`createBidCheckout` / `createSubmissionCheckout`
   in `app/actions.ts`): validates the bid, inserts a `bids` row with
   `status = 'pending'`. For a **new listing**, `store_id` is null at
   this point — no store exists yet, just a bid. Creates a Dodo checkout
   session with the bid's id in `metadata` and returns the `checkout_url`.
2. **Dodo redirects to `/bid/return?bid_id=...`** after checkout. This
   page polls `checkBidStatus` every few seconds:
   - If the bid is still `pending`, it also asks Dodo directly
     (`checkoutSessions.retrieve`) whether the payment actually
     succeeded — this is the fallback for a webhook that's delayed,
     misconfigured, or unreachable (e.g. local dev without a tunnel to
     receive it at all). Whichever confirms first — webhook or this
     fallback — wins; both call the same
     `lib/bids/confirm.ts::confirmSucceededPayment`, which is written to
     be safe to call twice for the same payment.
   - Once a **new listing's** bid shows `succeeded`, the return page
     shows a form for name/domain/categories/description.
     `finalizeStoreSubmission` creates the actual `stores` row at that
     point — `status: 'active'` immediately, since payment is already
     confirmed.
   - For an **outbid**, there's no form — the store already exists, so
     confirming the bid is the whole job.
3. **The webhook** (`app/api/webhooks/dodo/route.ts`) does the same
   confirmation, just triggered by Dodo instead of the person sitting on
   the return page. For an outbid, `confirmSucceededPayment` re-checks
   the bid against the store's *current* bid (someone else may have
   outbid it while payment was in flight) before applying it — if it's
   been overtaken, it attempts an automatic refund via
   `dodo.refunds.create` and marks the bid `needs_refund` either way.

`stores.bid`, `stores.status`, and `bids.status` are never written
directly by a client-facing action — only by `lib/bids/confirm.ts`.

## Data model
- `stores` — created only by `finalizeStoreSubmission`, already
  `status: 'active'` at that point (payment is confirmed before the row
  exists). Only `active` stores are ever returned by `getLeaderboard`.
- `categories` — reference table, mirrors `lib/data.ts`'s `CATEGORY_INFO`.
- `store_categories` — join table; a store can belong to
  `MAX_CATEGORIES_PER_STORE` categories (currently 3, `lib/data.ts`).
- `bids` — one row per checkout attempt, not just successful ones.
  `store_id` is null for a new-listing bid until
  `finalizeStoreSubmission` runs. Holds `customer_email`, so RLS locks it
  down with no public read policy at all — only the service role
  (server-side) can touch it.

## Pages
- `/` — the leaderboard (supports `?category=` to pre-filter)
- `/categories` — grid of every category with store count and top bid
- `/submit` — "claim a spot" — collects just amount + email, redirects to
  Dodo checkout
- `/bid/return` — polls payment status after checkout; for a new listing,
  shows the store-details form once payment is confirmed
- `/about`, `/rules`, `/faqs`, `/terms`, `/privacy`, `/disclaimer`, `/contact`

`/contact` is still client-side only (no backend) — it validates and shows
a confirmation but doesn't send anywhere yet.

## Structure
- `app/actions.ts` — server actions: `getLeaderboard`,
  `createBidCheckout`, `createSubmissionCheckout`, `checkBidStatus`,
  `finalizeStoreSubmission`
- `app/api/webhooks/dodo/route.ts` — verifies the Dodo signature, then
  delegates to `lib/bids/confirm.ts`
- `lib/bids/confirm.ts` — the only code that writes `bids.status` to
  `succeeded`/`failed`/`needs_refund`; shared by the webhook and by
  `checkBidStatus`'s fallback check, so the race-condition and refund
  logic only exists in one place
- `app/bid/return/page.tsx` + `components/BidReturnClient.tsx` —
  post-checkout polling and the store-details form
- `app/*/page.tsx` — one route per page above
- `components/Leaderboard.tsx` — the leaderboard UI; bidding redirects to
  Dodo checkout rather than writing locally
- `components/PageShell.tsx` — shared layout for the text/legal pages
- `lib/data.ts` — categories, `MAX_CATEGORIES_PER_STORE`, `MIN_BID`, types
- `lib/supabase/server.ts` — server-only Supabase client
- `lib/dodo/client.ts` — server-only Dodo client + cents helper
- `lib/validate.ts` — shared email validation
- `supabase/schema.sql`, `supabase/seed.sql` — database setup
- `app/globals.css` — design tokens (colors, fonts)

## Known gaps / next steps
1. `/contact` still needs wiring to an email API route or a form service.
2. A `bids` row can be stuck `pending` forever if someone starts checkout
   and never finishes it — harmless (no orphaned `stores` row, since
   those are only created after confirmation) but worth a cleanup job
   eventually.
3. `needs_refund` bids currently just get flagged (and an automatic
   refund attempted) — there's no admin view to see that list. Worth a
   simple internal page or a Supabase saved query for now.
4. Webhook payload field names (`payload.data.payment_id`,
   `payload.data.metadata`, etc.) are based on Dodo's published docs and
   examples — verify them against a real test-mode webhook delivery
   before going live. The webhook route logs every event type and
   payment id it receives (`console.log`) — check your server logs if a
   bid isn't confirming to see what Dodo is actually sending.
5. Replace the cosmetic visitor counter in `StatsTicker` with real
   analytics (e.g. datafa.st, which is what outbid.lol switched to).
