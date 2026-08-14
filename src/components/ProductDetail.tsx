'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Shoe } from '@/lib/types';
import { formatPrice } from '@/lib/currency';
import { getSalePrice } from '@/lib/sale';
import { cloudinaryResize } from '@/lib/cloudinaryUrl';
import { lenisRef } from '@/lib/lenisInstance';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import { useToast } from '@/store/useToast';
import SpinViewer from './SpinViewer';
import ImageZoomModal from './ImageZoomModal';
import SaleCountdownBar from './SaleCountdownBar';
import { StarIcon } from './icons';

export default function ProductDetail({
  shoe,
  averageRating,
  reviewCount
}: {
  shoe: Shoe;
  averageRating: number;
  reviewCount: number;
}) {
  const hasSpin = shoe.spinImages.length >= 2;
  const [color, setColor] = useState(shoe.colors[0]);
  const [size, setSize] = useState<string | null>(null);
  const [view, setView] = useState<'360' | 'photo'>(hasSpin ? '360' : 'photo');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [flying, setFlying] = useState(false);
  const [flyTarget, setFlyTarget] = useState({ x: 0, y: 0 });
  const [zoomOpen, setZoomOpen] = useState(false);
  const outOfStock = shoe.stock <= 0;
  const onSale = shoe.discountPercent > 0;
  const salePrice = onSale ? getSalePrice(shoe.price, shoe.discountPercent) : shoe.price;
  const mainImageRef = useRef<HTMLDivElement>(null);
  const thumbRailRef = useRef<HTMLDivElement>(null);
  const [thumbsScrollable, setThumbsScrollable] = useState(false);
  const buyPanelRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const restRef = useRef<HTMLDivElement>(null);
  const [mainImageHeight, setMainImageHeight] = useState<number>();
  const [descExpanded, setDescExpanded] = useState(false);
  const [descTruncated, setDescTruncated] = useState(false);
  const [descLines, setDescLines] = useState(5);

  // Works out how many description lines actually fit above the buy panel's
  // scroll threshold — title, price, and the Add to Cart button stay put,
  // and the description clamp shrinks or grows with them instead of a fixed
  // line count, so a shorter laptop screen doesn't force extra scrolling
  // just to see the button.
  useEffect(() => {
    const recompute = () => {
      if (window.innerWidth < 1024) {
        // Below lg the panel isn't height-constrained (no sticky max-height),
        // so there's no scroll pressure to shrink the description for.
        setDescLines(8);
        return;
      }

      const panel = buyPanelRef.current;
      const header = headerRef.current;
      const rest = restRef.current;
      const descEl = descRef.current;
      if (!panel || !header || !rest || !descEl) return;

      const panelStyles = getComputedStyle(panel);
      const paddingY = parseFloat(panelStyles.paddingTop) + parseFloat(panelStyles.paddingBottom);
      // The panel's target height is the main image's height (see mainImageHeight
      // below) — fall back to the viewport before that's measured.
      const budget = mainImageHeight ?? window.innerHeight - 128;
      const DESC_MARGIN_TOP = 16; // mt-4
      const READ_MORE_RESERVE = 28; // space for the Read more link when shown

      const available =
        budget - paddingY - header.offsetHeight - rest.offsetHeight - DESC_MARGIN_TOP - READ_MORE_RESERVE;
      const lineHeight = parseFloat(getComputedStyle(descEl).lineHeight) || 24;
      setDescLines(Math.max(2, Math.min(Math.floor(available / lineHeight), 10)));
    };

    recompute();
    window.addEventListener('resize', recompute);

    const ro = new ResizeObserver(recompute);
    if (headerRef.current) ro.observe(headerRef.current);
    if (restRef.current) ro.observe(restRef.current);

    return () => {
      window.removeEventListener('resize', recompute);
      ro.disconnect();
    };
  }, [shoe.description, mainImageHeight]);

  // Tells us whether the description actually overflows the current clamp,
  // so "Read more" only shows when it's needed.
  useEffect(() => {
    const el = descRef.current;
    if (!el || descExpanded) return;
    setDescTruncated(el.scrollHeight > el.clientHeight + 1);
  }, [shoe.description, descLines, descExpanded]);

  useEffect(() => {
    const el = mainImageRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setMainImageHeight(el.getBoundingClientRect().height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Whether the thumbnail rail actually has more images than fit — only
  // then should hovering it keep scroll input to itself. A product with few
  // photos has nothing to scroll there, and should let the page scroll
  // through that area normally rather than swallowing the input for nothing.
  useEffect(() => {
    const el = thumbRailRef.current;
    if (!el) {
      setThumbsScrollable(false);
      return;
    }
    const check = () => setThumbsScrollable(el.scrollHeight > el.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [shoe.images.length, mainImageHeight]);

  // Redirect wheel scrolling into the pinned buy panel — regardless of
  // where the cursor is, and regardless of whether the description is
  // expanded — while it's stuck in the viewport and still has real content
  // left to reveal in that direction; once exhausted, hand scrolling back
  // to the page.
  useEffect(() => {
    const STICKY_TOP = 112; // px, matches lg:top-28
    const EASE = 0.22; // per-frame catch-up fraction — matches Lenis's glide rather than snapping to each wheel tick instantly
    // The site-wide Lenis smooth-scroll (SmoothScroll.tsx) has its own wheel
    // listener that would otherwise process the same event and keep nudging
    // its virtual scroll target while we're trying to redirect input into
    // the panel instead. Pausing it while we're actively redirecting, and
    // resuming the moment the panel runs out of room in that direction,
    // hands control over cleanly instead of both fighting the same input.
    //
    // An earlier version also drove the page's own scroll manually once the
    // panel was exhausted (to avoid a one-tick stutter at the handoff), but
    // that meant juggling two competing "who owns window.scrollY right now"
    // authorities — ours and Lenis's — and the reconciliation between them
    // turned out to have edge cases (reversing direction right as the panel
    // was about to release) that froze the page outright, which is a far
    // worse failure than the stutter it was trying to avoid. Simpler and
    // more robust to keep this effect's authority strictly to the panel's
    // own scrollTop, and let go of everything else immediately.
    let lenisPaused = false;
    const setLenisPaused = (next: boolean) => {
      if (next === lenisPaused) return;
      lenisPaused = next;
      if (next) lenisRef.current?.stop();
      else lenisRef.current?.start();
    };

    // Directly setting scrollTop per wheel tick moved the panel in raw,
    // un-eased jumps — jarring next to Lenis's glide everywhere else. It
    // eases toward an accumulated target instead of snapping to it.
    let panelTarget: number | null = null;
    let rafId: number | null = null;

    const tickPanel = (panel: HTMLDivElement) => {
      // A queued frame can still fire after panelTarget was cleared out
      // from under it — the early return must still clear rafId, or the
      // "only one loop at a time" guard below stays tripped forever.
      if (panelTarget === null) {
        rafId = null;
        return;
      }
      const diff = panelTarget - panel.scrollTop;
      if (Math.abs(diff) < 0.5) {
        panel.scrollTop = panelTarget;
        rafId = null;
        return;
      }
      panel.scrollTop += diff * EASE;
      rafId = requestAnimationFrame(() => tickPanel(panel));
    };

    const reset = () => {
      panelTarget = null;
      setLenisPaused(false);
    };

    const onWheel = (e: WheelEvent) => {
      const panel = buyPanelRef.current;
      if (!panel || window.innerWidth < 1024) {
        reset();
        return;
      }

      const rect = panel.getBoundingClientRect();
      // Testing for the exact sticky offset was too strict: at non-100% zoom
      // getBoundingClientRect returns fractional pixels that rarely land on
      // it, so the redirect never fired and the panel would only scroll while
      // the pointer happened to be over it. Treat "pinned at or above the
      // sticky line, still on screen" as the trigger instead.
      const pinned = rect.top <= STICKY_TOP + 4 && rect.bottom > 0;
      if (!pinned) {
        reset();
        return;
      }

      // Base "current position" on the in-flight target when one exists,
      // not the actual scrollTop — that lags behind mid-ease, and reading
      // it directly would make consecutive ticks stack on a stale value
      // instead of the position already promised to the user.
      const maxPanelTop = panel.scrollHeight - panel.clientHeight;
      const curPanelTop = panelTarget ?? panel.scrollTop;
      const hasRoom = e.deltaY > 0 ? curPanelTop < maxPanelTop - 0.5 : curPanelTop > 0.5;

      if (!hasRoom) {
        // Nothing left to reveal in this direction — let this tick (and
        // whatever follows) scroll the page normally instead of us trying
        // to drive it.
        setLenisPaused(false);
        return;
      }

      setLenisPaused(true);
      e.preventDefault();
      panelTarget = Math.min(maxPanelTop, Math.max(0, curPanelTop + e.deltaY));
      if (rafId === null) rafId = requestAnimationFrame(() => tickPanel(panel));
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      if (rafId !== null) cancelAnimationFrame(rafId);
      setLenisPaused(false);
    };
  }, []);

  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.ids.includes(shoe.id));
  const notify = useToast((s) => s.show);

  const addToCart = () => {
    if (outOfStock) return;
    if (!size) {
      notify('Please select a size first');
      return;
    }
    add({
      shoeId: shoe.id,
      name: shoe.name,
      price: salePrice,
      colorHex: color.hex,
      size,
      qty: 1,
      image: shoe.image
    });
    notify(`${shoe.name} added to cart`);

    // Trigger the fly-to-cart micro-interaction, then open the drawer.
    // Target is computed relative to the cart button's actual position so the
    // animation lands accurately regardless of viewport size.
    const cartTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-cart-target]'));
    const cartEl = cartTargets.find((el) => el.offsetParent !== null);
    const cartRect = cartEl?.getBoundingClientRect();
    setFlyTarget({
      x: (cartRect ? cartRect.left + cartRect.width / 2 : window.innerWidth * 0.9) - window.innerWidth / 2,
      y: (cartRect ? cartRect.top + cartRect.height / 2 : 16) - window.innerHeight / 2
    });
    setFlying(true);
    window.setTimeout(() => {
      setFlying(false);
      openCart();
    }, 750);
  };

  return (
    <div className="mx-auto grid max-w-site gap-10 px-4 pt-36 sm:px-6 lg:grid-cols-2">
      {/* Viewer — min-w-0 because a grid item defaults to min-width:auto, which
          let the thumbnail rail plus image push this column wider than its
          track and gave the page a couple of pixels of sideways scroll. */}
      <div className="min-w-0">
        <div className="flex min-w-0 items-start gap-3">
          {shoe.images.length > 1 && (
            <div
              ref={thumbRailRef}
              style={{ height: mainImageHeight }}
              // Both only kick in once the rail actually has more thumbnails
              // than fit (thumbsScrollable) — otherwise there's nothing to
              // scroll here and the page should scroll through it normally,
              // the same as hovering any other non-scrollable part of the
              // page. data-lenis-prevent stops the site-wide smooth-scroll
              // from claiming the wheel input first; overscroll-contain
              // stops the browser's own scroll-chaining once the rail hits
              // its own top/bottom.
              {...(thumbsScrollable ? { 'data-lenis-prevent': true } : {})}
              className={`flex w-16 flex-shrink-0 flex-col gap-2 overflow-y-auto sm:w-20 ${thumbsScrollable ? 'overscroll-contain' : ''}`}
            >
              {shoe.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => {
                    setPhotoIndex(i);
                    setView('photo');
                  }}
                  className={`aspect-square w-full flex-shrink-0 overflow-hidden rounded-xl ring-2 transition ${view === 'photo' && i === photoIndex ? 'ring-white' : 'ring-[var(--border)]'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cloudinaryResize(img, 200)}
                    alt={`${shoe.name} — photo ${i + 1}`}
                    loading="eager"
                    className="h-full w-full bg-[var(--surface-alt)] object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}

          {/* min-w-0: as a flex item this defaults to min-width:auto, so it
              refused to shrink below the image's intrinsic width and pushed
              the row past the viewport on narrow screens. */}
          <div
            ref={mainImageRef}
            className="glass relative aspect-square min-w-0 flex-1 overflow-hidden rounded-3xl"
          >
            <AnimatePresence mode="wait">
              {view === '360' && hasSpin ? (
                <motion.div
                  key="360"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full"
                >
                  <SpinViewer images={shoe.spinImages} autoRotate={false} />
                </motion.div>
              ) : (
                <motion.img
                  key="photo"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  src={cloudinaryResize(shoe.images[photoIndex] ?? shoe.image, 1200)}
                  alt={shoe.name}
                  loading="eager"
                  fetchPriority="high"
                  onClick={() => setZoomOpen(true)}
                  className="h-full w-full cursor-zoom-in object-contain p-6"
                />
              )}
            </AnimatePresence>

            {outOfStock ? (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80 backdrop-blur">
                Out of stock
              </span>
            ) : (
              onSale && (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                  {shoe.discountPercent}% OFF
                </span>
              )
            )}

            {hasSpin && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                <button
                  onClick={() => setView('360')}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium backdrop-blur transition ${view === '360' ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' : 'bg-black/60 text-white hover:bg-black/75'}`}
                >
                  360° View
                </button>
                <button
                  onClick={() => setView('photo')}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium backdrop-blur transition ${view === 'photo' ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' : 'bg-black/60 text-white hover:bg-black/75'}`}
                >
                  Photo
                </button>
              </div>
            )}
          </div>
        </div>

        {view === '360' && hasSpin && (
          <p className="mt-3 text-center text-xs opacity-50">Drag to rotate</p>
        )}
        {view === 'photo' && (
          <p className="mt-3 text-center text-xs opacity-50">Click image to zoom in</p>
        )}
      </div>

      {zoomOpen && (
        <ImageZoomModal
          src={shoe.images[photoIndex] ?? shoe.image}
          alt={shoe.name}
          onClose={() => setZoomOpen(false)}
        />
      )}

      {/* Sticky buy panel — pinned in the viewport and scrolls its own
          content (like Nike's PDP) until it's exhausted, then the page
          takes over and scrolls past it. */}
      <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <div
          ref={buyPanelRef}
          style={
            {
              '--panel-h': mainImageHeight ? `${mainImageHeight}px` : 'auto',
              background: 'transparent',
              border: 'none'
            } as React.CSSProperties
          }
          className="no-scrollbar p-6 sm:p-8 lg:h-[var(--panel-h)] lg:overflow-y-auto"
        >
          <div ref={headerRef} className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-60">
                {[shoe.category, ...shoe.tags].join(' · ')}
              </p>
              <h1 className="mt-1 text-3xl font-black sm:text-4xl">{shoe.name}</h1>
              <p className="mt-1 text-sm opacity-60">{shoe.tagline}</p>
              {reviewCount > 0 && (
                <a
                  href="#reviews"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm transition hover:opacity-80"
                >
                  <StarIcon size={15} className="text-amber-400" />
                  <span className="font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="opacity-40">|</span>
                  <span className="opacity-60">{reviewCount}</span>
                </a>
              )}
            </div>
            <button
              onClick={() => {
                toggleWish(shoe.id);
                notify(wished ? `Removed ${shoe.name} from wishlist` : `Added ${shoe.name} to wishlist`);
              }}
              aria-label="Wishlist"
              className="text-2xl"
            >
              {wished ? '❤️' : '🤍'}
            </button>
          </div>

          <div className="mt-4">
            <p
              ref={descRef}
              className="whitespace-pre-line opacity-70"
              style={
                descExpanded
                  ? undefined
                  : {
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: descLines,
                      overflow: 'hidden'
                    }
              }
            >
              {shoe.description}
            </p>
            {descTruncated && (
              <button
                type="button"
                onClick={() => setDescExpanded((v) => !v)}
                className="mt-1 py-1 text-sm font-semibold underline underline-offset-4 transition hover:opacity-70"
              >
                {descExpanded ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>

          <div ref={restRef}>
            <div className="mt-6 flex items-baseline gap-3">
              <p className="text-3xl font-black neon-text">{formatPrice(salePrice)}</p>
              {onSale && (
                <p className="text-lg opacity-50 line-through">{formatPrice(shoe.price)}</p>
              )}
            </div>
            {onSale && <SaleCountdownBar percent={shoe.discountPercent} />}
            <p className={`mt-1 text-sm ${outOfStock ? 'text-red-400' : 'opacity-60'}`}>
              {outOfStock ? 'Currently out of stock' : `${shoe.stock} in stock`}
            </p>

            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">Color · {color.name}</p>
              <div className="flex gap-3">
                {shoe.colors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setColor(c)}
                    aria-label={c.name}
                    className={`h-9 w-9 rounded-full ring-2 transition ${color.hex === c.hex ? 'ring-white scale-110' : 'ring-[var(--border)]'}`}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">Size</p>
              <div className="flex flex-wrap gap-2">
                {shoe.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`h-11 min-w-11 rounded-xl px-3 text-sm font-medium transition ${size === s ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' : 'glass hover:bg-[var(--surface-alt)]'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={addToCart}
              disabled={outOfStock}
              className="btn-glow mt-8 w-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple py-4 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {outOfStock ? 'Out of Stock' : 'Add to Cart · Buy Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Fly-to-cart animation element — animates transform/opacity only (GPU-accelerated) */}
      <AnimatePresence>
        {flying && (
          <motion.img
            src={shoe.image}
            alt=""
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: flyTarget.x, y: flyTarget.y, scale: 20 / 120, opacity: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeIn' }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              width: 120,
              height: 120,
              marginTop: -60,
              marginLeft: -60,
              borderRadius: 24,
              zIndex: 80
            }}
            className="object-cover"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
