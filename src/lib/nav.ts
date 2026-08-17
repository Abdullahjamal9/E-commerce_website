export interface NavColumn {
  title: string;
  items: { label: string; href: string }[];
}

/** A drill-down level in the mobile menu: "Category", "Shop by style", … */
export interface NavGroup {
  label: string;
  items: { label: string; href: string }[];
}

export interface NavItem {
  label: string;
  href: string;
  /** Side-by-side columns for the desktop mega panel. */
  columns?: NavColumn[];
  /** The same links arranged as drill-down levels for the mobile menu. */
  groups?: NavGroup[];
}

/** Tags that describe who a product is for rather than what it looks like.
 *  These become the top-level menus, with styles nested underneath. */
const AUDIENCE_TAGS = ['Men', 'Women'];
const NEW_ARRIVALS = 'New Arrivals';
// Kept out of the header nav entirely (not even nested under a style
// column) — /shop?tag=Preloved still exists and is still in the sitemap for
// search engines, it's just not surfaced as a clickable menu item.
const NON_STYLE_TAGS = [...AUDIENCE_TAGS, 'Unisex', NEW_ARRIVALS, 'Preloved'];
const MAX_ROWS_PER_COLUMN = 7;
const MAX_STYLE_COLUMNS = 3;

/** Splits items into evenly sized columns, so 15 entries become 8+7 rather
 *  than 7+7+1. Caps the column count to keep the panel inside the viewport. */
function distribute<T>(items: T[]): T[][] {
  if (items.length === 0) return [];
  const columnCount = Math.min(
    MAX_STYLE_COLUMNS,
    Math.max(1, Math.ceil(items.length / MAX_ROWS_PER_COLUMN))
  );
  const perColumn = Math.ceil(items.length / columnCount);
  return Array.from({ length: columnCount }, (_, i) =>
    items.slice(i * perColumn, (i + 1) * perColumn)
  ).filter((col) => col.length > 0);
}

const tagHref = (tag: string) => `/shop?tag=${encodeURIComponent(tag)}`;
const categoryHref = (category: string) => `/shop?category=${encodeURIComponent(category)}`;
/** Audience + style together, e.g. men's sneakers. */
const audienceStyleHref = (audience: string, style: string) =>
  `/shop?audience=${encodeURIComponent(audience)}&tag=${encodeURIComponent(style)}`;
const audienceHref = (audience: string) => `/shop?audience=${encodeURIComponent(audience)}`;

/**
 * Builds the header navigation from live catalogue data, so every link lands
 * on a populated page and newly added categories/tags appear on their own.
 */
export function buildNav(categories: string[], tags: string[], saleEnabled: boolean): NavItem[] {
  const styleTags = tags.filter((t) => !NON_STYLE_TAGS.includes(t));
  const items: NavItem[] = [];

  if (saleEnabled) items.push({ label: 'Sale', href: '/shop' });
  if (tags.includes(NEW_ARRIVALS)) items.push({ label: NEW_ARRIVALS, href: tagHref(NEW_ARRIVALS) });

  for (const audience of AUDIENCE_TAGS) {
    if (!tags.includes(audience)) continue;

    const styleLinks = styleTags.map((t) => ({
      label: t,
      href: audienceStyleHref(audience, t)
    }));
    const categoryLinks = [
      ...categories.map((c) => ({
        label: c,
        href: `${categoryHref(c)}&audience=${encodeURIComponent(audience)}`
      })),
      { label: 'View All', href: audienceHref(audience) }
    ];

    const styleColumns: NavColumn[] = distribute(styleLinks).map((chunk, i) => ({
      title: i === 0 ? 'Shop by style' : '',
      items: chunk
    }));

    items.push({
      label: audience,
      href: audienceHref(audience),
      columns: [{ title: 'Categories', items: categoryLinks }, ...styleColumns],
      groups: [
        { label: 'Category', items: categoryLinks },
        { label: 'Shop by style', items: [...styleLinks, { label: 'View All', href: audienceHref(audience) }] }
      ]
    });
  }

  items.push({ label: 'About', href: '/about' });
  items.push({ label: 'Contact', href: '/contact' });

  return items;
}
