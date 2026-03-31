export const LISTING_CATEGORY_TREE = {
  ELECTRONICS: ["Phones", "Computers", "Audio", "Gaming"],
  CLOTHES: ["Jackets", "Shoes", "Jeans", "Bags"],
} as const;

export type MainListingCategory = keyof typeof LISTING_CATEGORY_TREE;

export function isMainCategory(value: string): value is MainListingCategory {
  return value in LISTING_CATEGORY_TREE;
}

export function isValidSubCategory(mainCategory: string, subCategory: string): boolean {
  if (!subCategory) return true;
  if (!isMainCategory(mainCategory)) return false;
  return LISTING_CATEGORY_TREE[mainCategory].includes(subCategory);
}
