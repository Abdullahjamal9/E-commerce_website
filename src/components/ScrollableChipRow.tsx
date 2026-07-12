'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A horizontally-scrollable chip row (tag/category filters) with visible
 * left/right arrows — plain overflow-x-auto works but gives no hint that
 * there's more to scroll to, especially with a mouse (no touch swipe, and
 * vertical wheel scroll does nothing by default).
 */
export default function ScrollableChipRow({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      setHasOverflow(el.scrollWidth > el.clientWidth + 4);
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    update();
    el.addEventListener('scroll', update);
    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', update);
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 240, behavior: 'smooth' });

  return (
    <div className="relative flex min-w-0 items-center">
      {canLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          className="absolute left-0 z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
        >
          ‹
        </button>
      )}
      <div
        ref={ref}
        className={`no-scrollbar flex gap-2 overflow-x-auto scroll-smooth ${hasOverflow ? 'px-8' : ''} ${className}`}
      >
        {children}
      </div>
      {canRight && (
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          className="absolute right-0 z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
        >
          ›
        </button>
      )}
    </div>
  );
}
