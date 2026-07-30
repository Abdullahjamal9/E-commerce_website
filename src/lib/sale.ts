/** Rounds to the nearest whole currency unit, matching how prices are stored/displayed elsewhere. */
export function getSalePrice(price: number, percent: number): number {
  if (percent <= 0) return price;
  return Math.round(price * (1 - percent / 100));
}
