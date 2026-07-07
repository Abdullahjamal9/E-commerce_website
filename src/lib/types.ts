/** Category names are admin-managed (see /admin/categories), not a fixed set. */
export type Category = string;
/** Tag names are admin-managed (see /admin/tags), not a fixed set. */
export type Tag = string;

export interface ShoeColor {
  name: string;
  /** Hex used both for the swatch and the 3D material. */
  hex: string;
}

export interface Shoe {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  stock: number;
  /** Product type, e.g. Shoes, Clothes, Watches — one per product. */
  category: Category;
  /** Cross-cutting collection labels, e.g. Men, Women, Sports, Luxury. */
  tags: Tag[];
  colors: ShoeColor[];
  /** Free-form size labels — numeric (e.g. "40", "41") or text (e.g. "S", "M", "XL"). */
  sizes: string[];
  /** Cover image (first entry of `images`). */
  image: string;
  images: string[];
  /** Ordered rotation frames for the 360° spin viewer (empty if not uploaded yet). */
  spinImages: string[];
  description: string;
  /** Set when an admin curates this product onto the homepage; null otherwise. */
  featuredAt: Date | null;
  /** Admin can deactivate a product to hide it from the storefront without deleting it. */
  isActive: boolean;
}

export interface CartItem {
  shoeId: string;
  name: string;
  price: number;
  colorHex: string;
  size: string;
  qty: number;
  image: string;
}
