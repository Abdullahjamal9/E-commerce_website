'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Shoe } from '@/lib/types';
import { formatPrice } from '@/lib/currency';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import { useToast } from '@/store/useToast';
import SpinViewer from './SpinViewer';
import ImageZoomModal from './ImageZoomModal';

export default function ProductDetail({ shoe }: { shoe: Shoe }) {
  const hasSpin = shoe.spinImages.length >= 2;
  const [color, setColor] = useState(shoe.colors[0]);
  const [size, setSize] = useState<string | null>(null);
  const [view, setView] = useState<'360' | 'photo'>(hasSpin ? '360' : 'photo');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [flying, setFlying] = useState(false);
  const [flyTarget, setFlyTarget] = useState({ x: 0, y: 0 });
  const [zoomOpen, setZoomOpen] = useState(false);
  const outOfStock = shoe.stock <= 0;
  const mainImageRef = useRef<HTMLDivElement>(null);
  const [mainImageHeight, setMainImageHeight] = useState<number>();

  useEffect(() => {
    const el = mainImageRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setMainImageHeight(el.getBoundingClientRect().height);
    });
    observer.observe(el);
    return () => observer.disconnect();
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
      price: shoe.price,
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
    <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-28 sm:px-6 lg:grid-cols-2">
      {/* Viewer */}
      <div>
        <div className="flex items-start gap-3">
          {shoe.images.length > 1 && (
            <div
              style={{ height: mainImageHeight }}
              className="flex w-16 flex-shrink-0 flex-col gap-2 overflow-y-auto sm:w-20"
            >
              {shoe.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => {
                    setPhotoIndex(i);
                    setView('photo');
                  }}
                  className={`aspect-square w-full flex-shrink-0 overflow-hidden rounded-xl ring-2 transition ${view === 'photo' && i === photoIndex ? 'ring-white' : 'ring-white/15'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full bg-white/5 object-contain p-1" />
                </button>
              ))}
            </div>
          )}

          <div ref={mainImageRef} className="glass relative aspect-square flex-1 overflow-hidden rounded-3xl">
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
                  src={shoe.images[photoIndex] ?? shoe.image}
                  alt={shoe.name}
                  onClick={() => setZoomOpen(true)}
                  className="h-full w-full cursor-zoom-in object-contain p-6"
                />
              )}
            </AnimatePresence>

            {outOfStock && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80 backdrop-blur">
                Out of stock
              </span>
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
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="no-scrollbar glass rounded-3xl p-6 sm:p-8 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-60">
                {[shoe.category, ...shoe.tags].join(' · ')}
              </p>
              <h1 className="mt-1 text-3xl font-black sm:text-4xl">{shoe.name}</h1>
              <p className="mt-1 text-sm opacity-60">{shoe.tagline}</p>
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

          <p className="mt-4 whitespace-pre-line opacity-70">{shoe.description}</p>
          <p className="mt-6 text-3xl font-black neon-text">{formatPrice(shoe.price)}</p>
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
                  className={`h-9 w-9 rounded-full ring-2 transition ${color.hex === c.hex ? 'ring-white scale-110' : 'ring-white/20'}`}
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
                  className={`h-11 min-w-11 rounded-xl px-3 text-sm font-medium transition ${size === s ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' : 'glass hover:bg-white/10'}`}
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
