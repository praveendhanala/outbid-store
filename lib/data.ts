export const CATEGORIES = [
  "all",
  "sneakers",
  "fashion",
  "beauty",
  "home",
  "electronics",
  "food",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_INFO: Record<Exclude<Category, "all">, string> = {
  sneakers: "Sneaker retailers, restocks, and resellers.",
  fashion: "Apparel, streetwear, and accessories.",
  beauty: "Skincare, cosmetics, and personal care.",
  home: "Furniture, decor, and household goods.",
  electronics: "Gadgets, accessories, and refurbished tech.",
  food: "Coffee, snacks, and specialty food brands.",
};

export const MIN_BID = 5;

// How many categories a single store listing can belong to. Kept as one
// constant so it's a one-line change if you decide to raise or lower it.
export const MAX_CATEGORIES_PER_STORE = 3;

export type Store = {
  id: string;
  rank: number;
  name: string;
  domain: string;
  categories: Exclude<Category, "all">[];
  description: string;
  bid: number;
  addedAgo: string;
  clicks: number;
};
