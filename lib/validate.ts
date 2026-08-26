export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Store domains are always saved bare ("sneakerhub.com"), never with a
// protocol — https:// gets prepended once, at redirect time in
// app/go/[storeId]/route.ts. If someone pastes a full URL into the
// domain field, this strips it down to just the host so it doesn't turn
// into "https://https://sneakerhub.com" on redirect.
export function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "") // any protocol, not just http(s)
    .replace(/\/+$/, ""); // trailing slash(es)
}
