import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { GUIDES } from '@/lib/guides';

const GUIDE = GUIDES.find((g) => g.slug === 'best-running-shoes-in-pakistan')!;
const URL = `${SITE_URL}/guides/${GUIDE.slug}`;

export const metadata: Metadata = {
  title: GUIDE.title,
  description: GUIDE.excerpt,
  alternates: { canonical: URL }
};

export default function BestRunningShoesGuide() {
  // Article schema: gives this the same "this is editorial content, not a
  // product or category page" signal Google uses to show it for informational
  // searches rather than treating it as a duplicate of the /shop listing it
  // links to.
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
        Best Running Shoes in <span className="neon-text">Pakistan</span>
      </h1>
      <p className="mt-2 text-sm opacity-60">A buying guide, not a marketing list.</p>

      <div className="glass mt-8 space-y-8 rounded-3xl p-6 text-sm leading-relaxed opacity-90 sm:p-8">
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">What actually matters</h2>
          <p>
            Most running shoe advice focuses on brand names before it covers what changes how a
            shoe actually feels underfoot. Four things do most of the work: cushioning (softer
            foam absorbs more impact on hard pavement, firmer foam gives more energy return),
            breathability (mesh uppers matter more in Pakistan&apos;s heat than almost anywhere
            else), outsole grip (rubber tread pattern, especially if you&apos;ll run on anything
            other than a treadmill), and weight (lighter shoes tire your legs less over distance,
            heavier ones tend to last longer and support more).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Match the shoe to how you&apos;ll use it</h2>
          <p>
            <strong>Road running or daily jogging:</strong> prioritise cushioning and
            breathability. You&apos;re on hard, hot pavement for extended periods, and a
            well-cushioned midsole will save your knees over weeks of use.
          </p>
          <p className="mt-2">
            <strong>Gym and treadmill sessions:</strong> a slightly firmer, more stable shoe works
            better than a max-cushioned one, since treadmill belts already absorb some impact and
            you need lateral stability for other gym movements.
          </p>
          <p className="mt-2">
            <strong>Casual, everyday wear:</strong> weight and grip matter less than fit and
            breathability. Comfort across a full day outweighs performance features you won&apos;t
            use.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Get the size right first</h2>
          <p>
            A great running shoe in the wrong size will still hurt. Running shoes typically fit
            about half a size larger than your everyday shoe, to leave room for your foot to
            swell during a run. See our{' '}
            <Link href="/guides/how-to-find-your-shoe-size" className="underline underline-offset-4 hover:opacity-70">
              shoe size guide
            </Link>{' '}
            if you&apos;re not sure of your size before ordering.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Buying online, without trying them on first</h2>
          <p>
            Check the listed sizes on each product page before ordering, and if you&apos;re
            between two sizes, sizing up is usually the safer call for running shoes specifically.
            Every order here ships with Cash on Delivery available nationwide and a 7-day return
            and exchange window, so a size that doesn&apos;t work out isn&apos;t a dead end.
          </p>
        </section>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/shop?tag=Running"
          className="btn-glow inline-block rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-8 py-3 font-semibold text-white"
        >
          Shop Running Shoes
        </Link>
      </div>
    </div>
  );
}
