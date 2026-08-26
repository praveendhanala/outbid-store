"use client";

import { CATEGORIES, type Category } from "@/lib/data";

type CategoryWithBid = {
  category: Category;
  topBid: number;
};

export function CategoryPills({
  active,
  onChange,
  categories,
}: {
  active: Category;
  onChange: (category: Category) => void;
  categories: CategoryWithBid[];
}) {
  const sortedCategories = [...categories].sort(
    (a, b) =>
      b.topBid - a.topBid ||
      a.category.localeCompare(b.category)
  );

  return (
    <div
      id="categories"
      className="flex gap-2 overflow-x-auto border-b border-border py-4"
    >
      {categories.map(({ category }) => {
        const isActive = category === active;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`whitespace-nowrap rounded-md border px-2 py-1 text-sm transition-colors ${
              isActive
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted hover:border-foreground/40 hover:text-foreground cursor-pointer"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
