# outbid.store

A pay-to-rank leaderboard for online stores, inspired by outbid.lol. Stores
bid real dollars to hold a ranked position — no ads, no algorithm, rank is
the bid.

## Stack
Next.js 16 (App Router) + TypeScript + Tailwind CSS 4. No backend, no
database, no payments — this is a front-end prototype for validating the
idea, matching the mockup you approved.

## Getting started
```
npm install
npm run dev
```
Then open http://localhost:3000.

## What's real vs. simulated
- The leaderboard, category filters, bidding, and "submit your store" form
  all work — but state lives only in React (in memory), so it resets on
  refresh. There's no database yet.
- "place bid" and "add to leaderboard" don't take real money. Wiring up
  Stripe/Polar for actual payments is the next step once you've validated
  that people will bid at all.
- The visitor counter and "online" count are cosmetic (a slow random
  increment), matching outbid.lol's live-counter feel — not real analytics.

## Structure
- `src/app/page.tsx` — page composition
- `src/components/Leaderboard.tsx` — the core interactive leaderboard + bid logic
- `src/components/SubmitStoreDialog.tsx` — the "submit your store" modal
- `src/lib/data.ts` — mock store data and categories (swap for a real DB later)
- `src/app/globals.css` — design tokens (colors, fonts)

## Next steps if you decide to launch this for real
1. Swap `src/lib/data.ts` for a real database (Postgres via Supabase/Neon is
   the fastest path).
2. Add Stripe or Polar checkout to the bid flow — charge only the
   *difference* between the new bid and the current one, like outbid.lol does.
3. Replace the cosmetic visitor counter with real analytics (e.g. datafa.st,
   which is what outbid.lol switched to).
4. Decide on your launch category before opening it up — the whole board
   works better focused on one niche first.
