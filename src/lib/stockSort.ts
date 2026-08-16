/**
 * Moves sold-out products to the end of a list, keeping whatever order they
 * already had within each group.
 *
 * Applied on top of every other ordering rather than instead of one: a
 * shopper sorting by price still gets price order, just with the pairs they
 * can actually buy first. Array.prototype.sort is stable, so the incoming
 * order (sortOrder, price, featured position) survives inside each group.
 */
export function inStockFirst<T extends { stock: number }>(products: T[]): T[] {
  return [...products].sort((a, b) => Number(a.stock <= 0) - Number(b.stock <= 0));
}
