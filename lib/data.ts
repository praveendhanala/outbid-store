export type Store = {
  id: string;
  rank: number;
  name: string;
  domain: string;
  category: string;
  description: string;
  bid: number;
  addedAgo: string;
  clicks: number;
};

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

export const INITIAL_STORES: Store[] = [
  {
    id: "sneaker-hub",
    rank: 1,
    name: "Sneaker Hub",
    domain: "sneakerhub.com",
    category: "sneakers",
    description:
      "Curated rare and limited-edition sneakers, shipped worldwide in 48 hours.",
    bid: 3200,
    addedAgo: "2 hours ago",
    clicks: 8412,
  },
  {
    id: "street-bruv",
    rank: 2,
    name: "Street Bruv",
    domain: "streetbruv.com",
    category: "sneakers",
    description: "Streetwear and sneaker drops from independent labels.",
    bid: 2850,
    addedAgo: "5 hours ago",
    clicks: 5108,
  },
  {
    id: "glowlab",
    rank: 3,
    name: "Glowlab",
    domain: "glowlab.store",
    category: "beauty",
    description: "Clean skincare, small batches, no filler ingredients.",
    bid: 1940,
    addedAgo: "yesterday",
    clicks: 3021,
  },
  {
    id: "kicksxpress",
    rank: 4,
    name: "KicksXpress",
    domain: "kicksxpress.co",
    category: "sneakers",
    description: "Fast restocks on the sneakers everyone else sells out of.",
    bid: 1450,
    addedAgo: "yesterday",
    clicks: 2467,
  },
  {
    id: "hearthcraft",
    rank: 5,
    name: "Hearthcraft",
    domain: "hearthcraft.shop",
    category: "home",
    description: "Handmade home goods from a small studio in Portugal.",
    bid: 920,
    addedAgo: "2 days ago",
    clicks: 1189,
  },
  {
    id: "solelab",
    rank: 6,
    name: "Solelab",
    domain: "solelab.store",
    category: "sneakers",
    description: "Sneaker restoration kits and cleaning gear.",
    bid: 610,
    addedAgo: "2 days ago",
    clicks: 944,
  },
  {
    id: "byte-and-bolt",
    rank: 7,
    name: "Byte & Bolt",
    domain: "byteandbolt.com",
    category: "electronics",
    description: "Refurbished small electronics, tested and warrantied.",
    bid: 340,
    addedAgo: "3 days ago",
    clicks: 601,
  },
  {
    id: "millbrew",
    rank: 8,
    name: "Millbrew Coffee",
    domain: "millbrew.co",
    category: "food",
    description: "Single-origin beans roasted to order, shipped weekly.",
    bid: 210,
    addedAgo: "3 days ago",
    clicks: 388,
  },
];
