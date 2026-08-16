/**
 * Registry of buying-guide pages, kept separate from the pages themselves so
 * the index page and the sitemap can both list them without importing
 * server component modules. Static rather than database-backed: with three
 * pages and no expectation of frequent additions, a CMS/admin section would
 * be more to maintain than the content itself.
 */
export interface Guide {
  slug: string;
  title: string;
  excerpt: string;
}

export const GUIDES: Guide[] = [
  {
    slug: 'best-running-shoes-in-pakistan',
    title: 'Best Running Shoes in Pakistan: A Buying Guide',
    excerpt:
      'What actually matters when picking a running shoe for Pakistan’s climate and roads, by how you’ll use it.'
  },
  {
    slug: 'how-to-find-your-shoe-size',
    title: 'How to Find Your Correct Shoe Size',
    excerpt: 'A simple, no-store-visit way to measure your feet and read UK/US/EU sizing correctly.'
  },
  {
    slug: 'sneakers-vs-formal-shoes',
    title: 'Sneakers vs Formal Shoes: Which One Do You Need?',
    excerpt: 'How to decide between comfort and dress code for the office, weddings, and everyday wear.'
  }
];
