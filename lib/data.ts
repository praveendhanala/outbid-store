export const CATEGORIES = [
  "all",
  "sneakers",
  "fashion",
  "beauty",
  "home",
  "electronics",
  "food",
  "jewelry",
  "watches",
  "fitness",
  "pets",
  "kids",
  "sports",
  "gaming",
  "books",
  "art",
  "handmade",
  "gifts",
  "accessories",
  "health",
  "outdoors",
  "automotive",
  "collectibles",
  "music",
  "office",
  "garden",
  "toys",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_INFO: Record<Exclude<Category, "all">, string> = {
  sneakers: "Sneaker retailers, restocks, and resellers.",
  fashion: "Apparel, streetwear, and accessories.",
  beauty: "Skincare, cosmetics, and personal care.",
  home: "Furniture, decor, and household goods.",
  electronics: "Gadgets, accessories, and refurbished tech.",
  food: "Coffee, snacks, and specialty food brands.",
  jewelry: "Jewelry, rings, necklaces, and accessories.",
  watches: "Watches, timepieces, and watch accessories.",
  fitness: "Fitness gear, equipment, and activewear.",
  pets: "Pet food, supplies, toys, and accessories.",
  kids: "Kids' clothing, products, and essentials.",
  sports: "Sports equipment, apparel, and fan gear.",
  gaming: "Gaming hardware, accessories, and merchandise.",
  books: "Books, reading accessories, and independent publishers.",
  art: "Art prints, originals, and creative goods.",
  handmade: "Handcrafted products from independent makers.",
  gifts: "Gift shops, unique finds, and products for special occasions.",
  accessories: "Bags, wallets, cases, and everyday accessories.",
  health: "Wellness products, personal care, and health goods.",
  outdoors: "Camping, hiking, travel, and outdoor gear.",
  automotive: "Car accessories, parts, and automotive products.",
  collectibles: "Collectibles, memorabilia, and rare finds.",
  music: "Music gear, instruments, records, and merchandise.",
  office: "Office supplies, desk gear, and workspace products.",
  garden: "Plants, gardening supplies, and outdoor living.",
  toys: "Toys, games, puzzles, and kids' entertainment.",
};

export const MIN_BID = 5;

// How many categories a single store listing can belong to. Kept as one
// constant so it's a one-line change if you decide to raise or lower it.
export const MAX_CATEGORIES_PER_STORE = 3;

// Character limits for store detail fields — enforced both as maxLength
// on the inputs and server-side in app/actions.ts's validateStoreDetails.
export const STORE_NAME_MAX_LENGTH = 60;
export const STORE_DOMAIN_MAX_LENGTH = 90;
export const STORE_DESCRIPTION_MAX_LENGTH = 160;

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
