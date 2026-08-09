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
      <div className="relative mx-auto h-[62vh] min-h-[380px] max-w-[1600px] sm:h-[70vh]">
        {slides.map((slide, i) => (
          <div
            key={slide.href + i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            <div className="mx-auto flex h-full max-w-site flex-col items-center justify-center gap-6 px-6 py-10 md:flex-row md:justify-between md:gap-12">
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

              <div className="order-1 w-full max-w-md md:order-2 md:w-1/2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cloudinaryResize(slide.image, 900)}
                  alt={slide.title}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : undefined}
                  className="mx-auto h-[30vh] w-auto object-contain sm:h-[42vh]"
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
