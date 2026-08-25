import "server-only";
import DodoPayments from "dodopayments";

let cachedClient: DodoPayments | null = null;

export function createDodoClient(): DodoPayments {
  if (cachedClient) return cachedClient;

  const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
  if (!bearerToken) {
    throw new Error(
      "Missing DODO_PAYMENTS_API_KEY. Set it in .env.local (see .env.example)."
    );
  }

  cachedClient = new DodoPayments({
    bearerToken,
    // "test_mode" while building/testing; switch to "live_mode" (or unset,
    // which defaults to live) once you're ready to take real payments.
    environment:
      (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") ??
      "test_mode",
  });
  return cachedClient;
}

// A single Pay-What-You-Want one-time product in the Dodo dashboard
// backs every bid — the amount is set per checkout session, not per
// product. See README.md for how to create it.
export function getDodoProductId(): string {
  const productId = process.env.DODO_PAYMENTS_PRODUCT_ID;
  if (!productId) {
    throw new Error(
      "Missing DODO_PAYMENTS_PRODUCT_ID. Set it in .env.local (see .env.example)."
    );
  }
  return productId;
}

export function toCents(dollarAmount: number): number {
  return Math.round(dollarAmount * 100);
}
