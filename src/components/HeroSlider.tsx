'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { cloudinaryResize } from '@/lib/cloudinaryUrl';

export interface HeroSlide {
  image: string;
  eyebrow: string;
  title: string;
  href: string;
}

/**
 * Full-bleed auto-advancing hero carousel — the anchor of a retail homepage.
 * Slides are built from live catalogue data by the page, so this never shows
 * a placeholder for a store that has products.
 */
export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), 5500);
    return () => window.clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  return (
    <section className="relative w-full overflow-hidden border-b border-[var(--border)] bg-[var(--surface-alt)]">
      {/* aspect-ratio, not a vh height — vh is tied to the physical viewport
          and desyncs from width under real browser zoom (width scales with
          effective CSS pixels as you zoom out, vh doesn't follow it), which
          is what left white space on the sides at non-100% zoom. Width-driven
          aspect-ratio scales together with the rest of the layout instead. */}
      {/* max-h caps how tall the 21/9 box gets once width reaches max-w-site's
          2560px ceiling — aspect-ratio alone would keep growing the height in
          lockstep with the width, leaving the slide's text/image floating in
          a lot of empty vertical space on ultra-wide screens. */}
      <div className="relative mx-auto aspect-[3/4] max-w-site sm:aspect-[16/9] lg:aspect-[21/9] lg:max-h-[720px]">
        {slides.map((slide, i) => (
          <div
            key={slide.href + i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            <div className="mx-auto flex h-full max-w-site flex-col items-center justify-center gap-6 px-6 py-10 md:flex-row md:justify-between md:gap-12 md:px-16 lg:px-20">
              <div className="order-2 max-w-lg text-center md:order-1 md:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--muted)]">
                  {slide.eyebrow}
                </p>
                <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">{slide.title}</h2>
                <Link
                  href={slide.href}
                  className="btn-glow mt-6 inline-block bg-[var(--accent)] px-8 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--accent-fg)]"
                >
                  Shop now
                </Link>
              </div>

              <div className="order-1 w-full max-w-md md:order-2 md:h-full md:w-1/2 md:pr-6 lg:pr-10 3xl:pr-20 4xl:pr-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cloudinaryResize(slide.image, 900)}
                  alt={slide.title}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : undefined}
                  className="mx-auto h-auto w-full max-w-[280px] object-contain md:h-full md:w-auto md:max-w-full"
                />
              </div>
            </div>
          </div>
        ))}

        {count > 1 && (
          <>
            <button
              onClick={() => go(index - 1)}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm transition hover:bg-[var(--surface-alt)]"
            >
              ‹
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm transition hover:bg-[var(--surface-alt)]"
            >
              ›
            </button>

            <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-[var(--accent)]' : 'w-1.5 bg-[var(--border)]'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
