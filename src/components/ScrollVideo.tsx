'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const FRAME_COUNT = 151;
const FRAME_PATH = (i: number) => `/frames/frame-${String(i).padStart(4, '0')}.jpg`;

export default function ScrollVideo() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const [loaded, setLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end']
  });

  const overlayOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  // Draws whichever frame is currently loaded (or the closest earlier one),
  // covering the canvas the way object-fit: cover would on an <img>.
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
    }

    const canvasRatio = cw / ch;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

    if (imgRatio > canvasRatio) {
      sw = img.naturalHeight * canvasRatio;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = img.naturalWidth / canvasRatio;
      sy = (img.naturalHeight - sh) / 2;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  };

  useEffect(() => {
    // Skip preloading 151 frames on small screens — MobileHero renders a
    // static image there instead, so this canvas stays hidden and unused.
    if (window.matchMedia('(max-width: 767px)').matches) return;

    let cancelled = false;
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = () => {
        if (i === 1 && !cancelled) {
          setLoaded(true);
          drawFrame(0);
        }
      };
      images.push(img);
    }
    imagesRef.current = images;

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onResize = () => drawFrame(currentFrameRef.current);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (progress) => {
      const index = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(progress * (FRAME_COUNT - 1))));
      currentFrameRef.current = index;
      requestAnimationFrame(() => drawFrame(index));
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollYProgress]);

  return (
    <section ref={wrapperRef} className="relative hidden h-[400vh] md:block">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        <canvas ref={canvasRef} className="h-full w-full" />

        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          </div>
        )}

        <motion.div
          style={{ opacity: overlayOpacity }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-center"
        >
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass inline-block rounded-full px-4 py-1.5 text-xs font-medium tracking-widest text-white"
          >
            ✨ NEW ARRIVALS
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="mt-6 text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl"
          >
            Step Into the <br />
            <span className="neon-text animate-shimmer">Future of Style</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.8 }}
            className="mx-auto mt-6 max-w-md text-base text-white/80"
          >
            Quality footwear, apparel, and accessories with fast delivery, easy returns,
            and trusted payment options.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="pointer-events-auto mt-8 flex flex-col items-center gap-4 sm:flex-row"
          >
            <a
              href="/shop"
              className="btn-glow w-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-8 py-3 text-center font-semibold text-white sm:w-auto"
            >
              Shop Now
            </a>
            <a
              href="/collections"
              className="glass w-full rounded-full px-8 py-3 text-center font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Explore Collection
            </a>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-floaty text-xs text-white/60">
          ↓ Scroll to explore
        </div>
      </div>
    </section>
  );
}
