import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { confirmSucceededPayment, markFailedPayment } from "@/lib/bids/confirm";
import { revalidateLeaderboard } from "@/app/actions";

// Shape confirmed against Dodo's webhook docs for one-time payments:
// { business_id, type: "payment.succeeded" | "payment.failed" | ...,
//   timestamp, data: { payload_type: "Payment", payment_id, total_amount,
//   currency, customer: {...}, metadata: {...} } }
// Verify this against a real test-mode delivery before going live — see
// README "Known gaps".
type DodoPaymentWebhook = {
  type: string;
  data: {
    payload_type: string;
    payment_id: string;
    metadata?: Record<string, string>;
  };
};

export async function POST(request: Request) {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!secret) {
    console.error("DODO_PAYMENTS_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const webhook = new Webhook(secret);

  let payload: DodoPaymentWebhook;
  try {
    payload = (await webhook.verify(rawBody, {
      "webhook-id": request.headers.get("webhook-id") ?? "",
      "webhook-signature": request.headers.get("webhook-signature") ?? "",
      "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
    })) as DodoPaymentWebhook;
  } catch (err) {
    console.error("Dodo webhook: signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("Dodo webhook received:", payload.type, payload.data.payment_id);

  if (payload.data.payload_type !== "Payment") {
    return NextResponse.json({ received: true });
  }

  const bidId = payload.data.metadata?.bid_id;
  if (!bidId) {
    console.error(
      "Dodo webhook: no bid_id in metadata for payment",
      payload.data.payment_id,
      payload.data.metadata
    );
    return NextResponse.json({ received: true });
  }

  if (payload.type === "payment.succeeded") {
    const result = await confirmSucceededPayment(bidId, payload.data.payment_id);
    console.log("Dodo webhook: confirmed bid", bidId, "->", result.status);
    await revalidateLeaderboard();
    return NextResponse.json({ received: true });
  }

  if (payload.type === "payment.failed") {
    await markFailedPayment(bidId);
    return NextResponse.json({ received: true });
  }

  // payment.pending, refund/dispute events, etc. — not handled yet.
  return NextResponse.json({ received: true });
}
