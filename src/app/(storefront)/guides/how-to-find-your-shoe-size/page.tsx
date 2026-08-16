import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { GUIDES } from '@/lib/guides';

const GUIDE = GUIDES.find((g) => g.slug === 'how-to-find-your-shoe-size')!;
const URL = `${SITE_URL}/guides/${GUIDE.slug}`;

export const metadata: Metadata = {
  title: GUIDE.title,
  description: GUIDE.excerpt,
  alternates: { canonical: URL }
};

export default function ShoeSizeGuide() {
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
        How to Find Your <span className="neon-text">Shoe Size</span>
      </h1>
      <p className="mt-2 text-sm opacity-60">Five minutes with a piece of paper is all it takes.</p>

      <div className="glass mt-8 space-y-8 rounded-3xl p-6 text-sm leading-relaxed opacity-90 sm:p-8">
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Measure your foot, not your old shoes</h2>
          <p>
            Old shoes stretch, and different brands cut differently, so guessing from a shoe
            you already own is the most common way to order the wrong size. Instead:
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Place a sheet of paper on the floor against a wall.</li>
            <li>Stand on it with your heel touching the wall.</li>
            <li>Mark the floor at the tip of your longest toe.</li>
            <li>Measure the distance from the wall to the mark, in centimetres.</li>
          </ol>
          <p className="mt-2">
            Do this for both feet, standing rather than sitting, and use the longer measurement.
            Feet are rarely perfectly symmetrical.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Reading UK / US / EU sizes</h2>
          <p>
            Product pages here list available sizes as printed on the shoe, which is usually UK or
            EU sizing depending on the brand. If a listing only shows one size system and
            you&apos;re used to another, the general rule of thumb is that EU sizes run roughly
            33 points higher than UK sizes for the same foot length (a UK 7 is close to an EU 40).
            When in doubt, go by your measured length in centimetres rather than converting
            between systems, since conversions can be off by half a size.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">When to size up or down</h2>
          <p>
            Size up half a size for running or sports shoes, since feet swell during activity and
            you want room at the toe. Size down slightly, or stick to your true size, for formal
            or dress shoes, where a snugger fit holds its shape better. If a product&apos;s reviews
            mention it running small or large, take that into account too.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Still not sure?</h2>
          <p>
            Reach out before you order and we&apos;ll help you pick a size, or if it still
            doesn&apos;t work out, every order comes with a 7-day window to return or exchange it.
          </p>
        </section>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/shop"
          className="btn-glow inline-block rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-8 py-3 font-semibold text-white"
        >
          Browse All Shoes
        </Link>
      </div>
    </div>
  );
}
