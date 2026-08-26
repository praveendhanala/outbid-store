"use client";

import { CATEGORIES, type Category } from "@/lib/data";

export function CategoryPills({
  active,
  onChange,
}: {
  active: Category;
  onChange: (category: Category) => void;
}) {
  return (
    <div
      id="categories"
      className="flex gap-2 overflow-x-auto border-b border-border py-4"
    >
      {CATEGORIES.map((category) => {
        const isActive = category === active;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`whitespace-nowrap rounded-md border px-2 py-1 text-sm transition-colors ${
              isActive
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted hover:text-foreground hover:border-foreground/40 cursor-pointer"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
