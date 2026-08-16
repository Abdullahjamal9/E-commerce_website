import type { Metadata } from 'next';
import Link from 'next/link';
import { GUIDES } from '@/lib/guides';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Buying Guides',
  description: 'Practical guides on choosing shoes, sizing, and care, from picking your first pair to swapping styles for the occasion.',
  alternates: { canonical: `${SITE_URL}/guides` }
};

export default function GuidesIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-36 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-black sm:text-4xl">
          Buying <span className="neon-text">Guides</span>
        </h1>
        <p className="mt-3 opacity-60">Practical answers before you add to cart.</p>
      </div>

      <div className="space-y-4">
        {GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="glass block rounded-2xl p-6 transition hover:bg-[var(--surface-alt)] sm:p-8"
          >
            <p className="text-lg font-bold">{guide.title}</p>
            <p className="mt-1 text-sm opacity-70">{guide.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
