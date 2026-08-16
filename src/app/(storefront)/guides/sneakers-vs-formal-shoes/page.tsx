import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { GUIDES } from '@/lib/guides';

const GUIDE = GUIDES.find((g) => g.slug === 'sneakers-vs-formal-shoes')!;
const URL = `${SITE_URL}/guides/${GUIDE.slug}`;

export const metadata: Metadata = {
  title: GUIDE.title,
  description: GUIDE.excerpt,
  alternates: { canonical: URL }
};

export default function SneakersVsFormalGuide() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: GUIDE.title,
    description: GUIDE.excerpt,
    datePublished: '2026-08-15',
    dateModified: '2026-08-15',
    mainEntityOfPage: URL
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-36 sm:px-6">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Link href="/guides" className="text-xs text-[var(--muted)] transition hover:text-[var(--fg)]">
        &larr; All Guides
      </Link>

      <h1 className="mt-3 text-3xl font-black sm:text-4xl">
        Sneakers vs <span className="neon-text">Formal Shoes</span>
      </h1>
      <p className="mt-2 text-sm opacity-60">Which one you need depends on where you&apos;re going.</p>

      <div className="glass mt-8 space-y-8 rounded-3xl p-6 text-sm leading-relaxed opacity-90 sm:p-8">
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">The short answer</h2>
          <p>
            Sneakers are built for comfort and movement, formal shoes are built to match a dress
            code. Neither replaces the other well, which is why most people end up needing at
            least one solid pair of each rather than one do-everything shoe.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">When sneakers are the right call</h2>
          <p>
            College, casual office environments, weekend outings, and anywhere you&apos;ll be on
            your feet for hours. Cushioned soles and breathable uppers hold up to a full day far
            better than leather formal shoes, which are built for shorter periods of standing and
            sitting rather than walking distances.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">When formal shoes are non-negotiable</h2>
          <p>
            Office environments with a dress code, weddings, and interviews. A clean pair of
            oxfords or derbies signals effort in a way sneakers don&apos;t, regardless of how sharp
            the rest of the outfit is. This is less about comfort and more about what the shoe
            communicates.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Building a smart-casual middle ground</h2>
          <p>
            If you only want to buy one pair right now, a minimal leather sneaker in a neutral
            colour (white, black, or navy) is the closest thing to a do-everything shoe: dressier
            than a running shoe, more comfortable than a formal one, and it works with both jeans
            and smart-casual trousers.
          </p>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/shop?tag=Sneakers"
          className="btn-glow inline-block rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-8 py-3 font-semibold text-white"
        >
          Shop Sneakers
        </Link>
        <Link
          href="/shop?tag=Formal"
          className="btn-glow inline-block rounded-full border border-[var(--fg)] px-8 py-3 font-semibold transition hover:bg-[var(--accent)] hover:text-[var(--accent-fg)]"
        >
          Shop Formal Shoes
        </Link>
      </div>
    </div>
  );
}
