'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  images: string[];
  autoRotate?: boolean;
  className?: string;
}

/**
 * 360° product viewer driven by an ordered sequence of photos. Drag horizontally
 * to spin through frames; auto-cycles when idle and autoRotate is enabled.
 */
export default function SpinViewer({ images, autoRotate = true, className = '' }: Props) {
  const [frame, setFrame] = useState(0);
  const dragging = useRef(false);
  const lastX = useRef(0);

  useEffect(() => {
    if (!autoRotate || images.length < 2) return;
    const id = setInterval(() => {
      if (!dragging.current) setFrame((f) => (f + 1) % images.length);
    }, 90);
    return () => clearInterval(id);
  }, [autoRotate, images.length]);

  if (images.length === 0) return null;

  const step = (dx: number) => {
    if (Math.abs(dx) < 6) return;
    setFrame((f) => {
      const dir = dx > 0 ? -1 : 1;
      return (f + dir + images.length) % images.length;
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    if (Math.abs(dx) >= 8) {
      step(dx);
      lastX.current = e.clientX;
    }
  };
  const endDrag = () => {
    dragging.current = false;
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      className={`relative h-full w-full cursor-grab touch-none select-none active:cursor-grabbing ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[frame]}
        alt=""
        draggable={false}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
