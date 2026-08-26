import { NextResponse, type NextRequest } from "next/server";
import { after } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { normalizeDomain } from "@/lib/validate";

export const dynamic = "force-dynamic";

const CLICK_COOKIE = "outbid_recent_clicks";
// How long a click on the same store, from the same browser, is ignored
// as a probable double/rage-click rather than a fresh visit. This is a
// lightweight heuristic, not a bot-proof rate limit — see README "Known
// gaps" for what a more robust version would need (per-IP or per-session
// limits backed by a table, rather than a client-trusted cookie).
const DEDUPE_WINDOW_SECONDS = 60;
const MAX_TRACKED_ENTRIES = 100;

type ClickEntry = { id: string; ts: number };

function parseRecentClicks(raw: string | undefined): ClickEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ClickEntry[];
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - DEDUPE_WINDOW_SECONDS * 1000;
    return parsed.filter(
      (entry) =>
        entry && typeof entry.id === "string" && typeof entry.ts === "number" && entry.ts > cutoff
    );
  } catch {
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params;
  //const supabase = createServerSupabaseClient();

  const { data: store } = await supabase
    .from("stores")
    .select("domain, status")
    .eq("id", storeId)
    .single();

  if (!store || store.status !== "active") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Defensive: domains are normalized (protocol stripped) before they're
  // ever stored — see lib/validate.ts's normalizeDomain, applied in
  // app/actions.ts and lib/bids/confirm.ts. This second normalization
  // just protects against any row that predates that, or was written
  // directly (e.g. supabase/seed.sql).
  const destination = `https://${normalizeDomain(store.domain)}`;
  const response = NextResponse.redirect(destination);

  const recentClicks = parseRecentClicks(request.cookies.get(CLICK_COOKIE)?.value);
  const alreadyClicked = recentClicks.some((entry) => entry.id === storeId);

  if (!alreadyClicked) {
    // Deferred until after the redirect response is sent — the person
    // shouldn't wait on this write to start navigating to the store.
    after(() => supabase.rpc("increment_store_clicks", { target_id: storeId }));

    const updated = [...recentClicks, { id: storeId, ts: Date.now() }].slice(
      -MAX_TRACKED_ENTRIES
    );
    response.cookies.set(CLICK_COOKIE, JSON.stringify(updated), {
      maxAge: DEDUPE_WINDOW_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}
