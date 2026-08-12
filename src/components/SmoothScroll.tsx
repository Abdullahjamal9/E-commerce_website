'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { lenisRef } from '@/lib/lenisInstance';

/**
 * Site-wide inertia scrolling — wheel/trackpad input eases to a stop instead
 * of snapping dead the instant the user stops scrolling. Renders nothing;
 * it only drives the animation loop.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
      // Handles in-page anchor links (e.g. the product page's rating link
      // to #reviews) with the same eased glide as wheel scrolling, instead
      // of leaving those as a separate, differently-timed jump.
      anchors: true
    });
    lenisRef.current = lenis;

    let frame: number;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null;
}
