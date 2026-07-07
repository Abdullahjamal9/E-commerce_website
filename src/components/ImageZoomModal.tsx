'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export default function ImageZoomModal({
  src,
  alt,
  onClose
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);

  const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  const zoomBy = (delta: number) => {
    setScale((s) => {
      const next = clampScale(s + delta);
      if (next === MIN_SCALE) setPos({ x: 0, y: 0 });
      return next;
    });
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoomBy(e.deltaY > 0 ? -0.3 : 0.3);
  };

  const onDoubleClick = () => {
    setScale((s) => {
      if (s > MIN_SCALE) {
        setPos({ x: 0, y: 0 });
        return MIN_SCALE;
      }
      return 2.5;
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale === MIN_SCALE) return;
    dragRef.current = { x: pos.x, y: pos.y, startX: e.clientX, startY: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({ x: dragRef.current.x + dx, y: dragRef.current.y + dy });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          <button
            onClick={() => zoomBy(-0.5)}
            aria-label="Zoom out"
            className="glass h-10 w-10 rounded-full text-lg"
          >
            −
          </button>
          <button
            onClick={() => zoomBy(0.5)}
            aria-label="Zoom in"
            className="glass h-10 w-10 rounded-full text-lg"
          >
            +
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="glass h-10 w-10 rounded-full text-lg"
          >
            ✕
          </button>
        </div>

        <div
          className="h-full w-full cursor-grab touch-none select-none overflow-hidden active:cursor-grabbing"
          onWheel={onWheel}
          onDoubleClick={onDoubleClick}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="h-full w-full object-contain p-6"
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              transition: dragRef.current ? 'none' : 'transform 0.15s ease-out'
            }}
          />
        </div>

        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/60">
          Scroll or use +/− to zoom · drag to pan · double-click to reset
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
