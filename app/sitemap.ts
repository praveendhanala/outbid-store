import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://outbid.store";

type StaticRoute = {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

// Only real, indexable pages. Deliberately excludes:
// - /go/[storeId] — a click-tracking redirect, not content
// - /bid/return — only meaningful with a bid_id query param mid-checkout
// - /api/* — not a page at all
const STATIC_ROUTES: StaticRoute[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/categories", changeFrequency: "daily", priority: 0.8 },
  { path: "/submit", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/faqs", changeFrequency: "monthly", priority: 0.4 },
  { path: "/rules", changeFrequency: "monthly", priority: 0.4 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/disclaimer", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
