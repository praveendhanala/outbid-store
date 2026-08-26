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
- `stores` — created only by payment confirmation (either automatically
  right after checkout, or via `finalizeStoreSubmission` for the rare
  domain-collision recovery case), already `status: 'active'` at that
  point. Only `active` stores are ever returned by `getLeaderboard`.
  `clicks` is incremented atomically by the `increment_store_clicks` SQL
  function — never via a read-then-write from application code, which
  would race under concurrent clicks.
- `categories` — reference table, mirrors `lib/data.ts`'s `CATEGORY_INFO`.
- `store_categories` — join table; a store can belong to
  `MAX_CATEGORIES_PER_STORE` categories (currently 3, `lib/data.ts`).
- `bids` — one row per checkout attempt, not just successful ones.
  `store_id` is null until a store is created for it. Holds
  `customer_email`, so RLS locks it down with no public read policy at
  all — only the service role (server-side) can touch it.

## Click tracking
Store cards don't link directly to the store's site — they link to
`/go/[storeId]`, which increments the click count, then 302-redirects to
`https://<domain>`. The increment itself is deferred past the redirect
response using Next's `after()` — the person's browser starts navigating
to the store immediately, without waiting on that extra database
round trip.

Domains are always stored bare (no protocol) — `lib/validate.ts`'s
`normalizeDomain` strips an accidental `https://` a person might paste
into the domain field, applied both when a submission is saved and
again, defensively, right before building the redirect URL. Without
this, a domain saved as `https://sneakerhub.com` would redirect to
`https://https://sneakerhub.com`.

**Rage-click / double-click handling:** `/go` sets a short-lived
(`60s`), `httpOnly` cookie listing recently-clicked store ids. A repeat
click on the same store within that window still redirects, but doesn't
increment again. This is a lightweight heuristic scoped to one browser,
not a hard rate limit — it stops the extremely common "clicked it three
times because nothing seemed to happen" pattern, but doesn't stop
someone deliberately inflating a count with multiple browsers, incognito
windows, or a script. A more robust version would track by IP (or a
signed session id) in a database table instead of a client-trusted
cookie — worth doing before this matters for real money.

Store links use plain `<a>` tags rather than `next/link`'s `<Link>`,
specifically to avoid Link's viewport-prefetching triggering `/go` (and
inflating the count) just from a card scrolling into view.

## Pages
- `/` — the leaderboard (supports `?category=` to pre-filter)
- `/categories` — grid of every category with store count and top bid
- `/submit` — "claim a spot" — amount, email, and store details, all
  required before payment
- `/bid/return` — polls payment status after checkout; only shows a
  details form in the rare case a submitted domain got taken by someone
  else between form-fill and payment confirming
- `/go/[storeId]` — click-tracking redirect (see above), not a page
- `/about`, `/rules`, `/faqs`, `/terms`, `/privacy`, `/disclaimer`, `/contact`

`/contact` is still client-side only (no backend) — it validates and shows
a confirmation but doesn't send anywhere yet.

## Structure
- `app/actions.ts` — server actions: `getLeaderboard`,
  `createSubmissionCheckout`, `checkBidStatus`, `finalizeStoreSubmission`
- `app/go/[storeId]/route.ts` — click-tracking redirect
- `app/api/webhooks/dodo/route.ts` — verifies the Dodo signature, then
  delegates to `lib/bids/confirm.ts`
- `lib/bids/confirm.ts` — the only code that writes `bids.status` to
  `succeeded`/`failed`; shared by the webhook and by `checkBidStatus`'s
  fallback check
- `app/bid/return/page.tsx` + `components/BidReturnClient.tsx` —
  post-checkout polling and the (rare) recovery details form
- `app/*/page.tsx` — one route per page above
- `components/Leaderboard.tsx` — the leaderboard UI; "outbid" just
  pre-fills `ClaimSpotForm`'s amount, never targets a store
- `components/ClaimSpotForm.tsx` — shared bid + store-details form (used
  inline in the leaderboard and standalone on `/submit`), with the live
  rank preview
- `components/StoreIcon.tsx` — store logo via Google's favicon service,
  falls back to a plain colored square on load failure
- `components/PageShell.tsx` — shared layout for the text/legal pages
- `lib/data.ts` — categories, `MAX_CATEGORIES_PER_STORE`, `MIN_BID`,
  `STORE_*_MAX_LENGTH`, types
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
3. Webhook payload field names (`payload.data.payment_id`,
   `payload.data.metadata`, etc.) are based on Dodo's published docs and
   examples — verify them against a real test-mode webhook delivery
   before going live. The webhook route logs every event type and
   payment id it receives (`console.log`) — check your server logs if a
   bid isn't confirming to see what Dodo is actually sending.
4. Click-count dedup is a client-trusted cookie, scoped to one browser —
   see "Click tracking" above for what a harder-to-game version would
   need.
5. Replace the cosmetic visitor counter in `StatsTicker` with real
   analytics (e.g. datafa.st, which is what outbid.lol switched to).
