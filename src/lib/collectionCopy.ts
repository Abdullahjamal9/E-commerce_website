/**
 * One-line descriptions for the shop listing, keyed by the active tag.
 *
 * These fill a subtitle the design already had, which until now read "Browse
 * the <store> catalogue." on every single filter — the same sentence on ~18
 * indexable URLs, which is both useless to a shopper and the kind of
 * near-duplicate copy that gives search engines nothing to tell those pages
 * apart by. Each line describes what's actually in that collection and the
 * terms someone would search for it.
 */
const TAG_COPY: Record<string, string> = {
  Running: 'Lightweight running shoes and performance trainers built for daily miles, gym sessions and race day.',
  Sneakers: 'Everyday sneakers and low-tops with clean silhouettes that work with jeans, joggers or shorts.',
  Formal: 'Formal shoes for office, weddings and events: oxfords, derbies and polished leather finishes.',
  Casual: 'Easy everyday shoes for college, work and weekends, made to slip on and go.',
  Boots: 'Boots built for grip and support, from rugged outdoor pairs to smart leather styles.',
  Joggers: 'Cushioned joggers for walking, training and long days on your feet.',
  Hiking: 'Hiking shoes with grippy outsoles and reinforced uppers for trails and rough ground.',
  Sports: 'Sports shoes for training, court games and the gym, with cushioning that holds up to hard use.',
  Leather: 'Leather shoes finished for durability and shine, dressy enough for formal wear.',
  Luxury: 'Premium pairs with finer materials and finishing, for when the details matter.',
  Party: 'Party and occasion wear with statement finishes that stand out at night.',
  Comfort: 'Comfort-first shoes with soft cushioning and roomy fits for all-day wear.',
  Samba: 'Samba-style low profile shoes with the classic gum-sole terrace look.',
  Skechers: 'Skechers shoes known for their cushioned midsoles and easy everyday comfort.',
  'New Arrivals': 'The latest pairs to land in stock, with new brands, colours and sizes added regularly.',
  Men: 'Men’s shoes across sneakers, formal, casual and sports, in full size runs.',
  Women: 'Women’s shoes across sneakers, formal, casual and sports, in full size runs.',
  Unisex: 'Unisex pairs that run across men’s and women’s sizing.'
};

/**
 * Subtitle for a shop listing. Falls back to a description of the whole
 * catalogue when no tag is active (or an unrecognised one is), which is the
 * honest thing to say about an unfiltered grid.
 */
export function collectionCopy(tag: string | null | undefined, storeName: string): string {
  const copy = tag ? TAG_COPY[tag] : null;
  return (
    copy ??
    `Shop the full ${storeName} range of sneakers, running, formal, casual and boots, with Cash on Delivery across Pakistan.`
  );
}

/** Tags that already name a product type, so "Shoes" would read wrong after them. */
const PRODUCT_TYPE_TAGS = ['sneakers', 'boots', 'joggers', 'shoes'];

/**
 * Reader-facing name for a collection: "Running" is a filter label, "Running
 * Shoes" is what the page is actually showing — and what someone would search
 * for. Used for both the visible heading and the page title so the two agree.
 */
export function collectionLabel(tag: string | null | undefined): string {
  if (!tag) return 'Shoes';
  return PRODUCT_TYPE_TAGS.some((t) => tag.toLowerCase().includes(t)) ? tag : `${tag} Shoes`;
}
