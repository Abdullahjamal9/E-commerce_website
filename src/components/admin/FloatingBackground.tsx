'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

const ICONS = ['👟', '🛍️', '👜', '🕶️', '👕', '⌚', '🧥', '👛', '🥿', '🎒'];

function seededItems(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const icon = ICONS[i % ICONS.length];
    const left = (i * 37) % 100;
    const delay = (i * 1.3) % 8;
    const duration = 14 + (i % 5) * 3;
    const size = 28 + (i % 4) * 10;
    return { icon, left, delay, duration, size, key: i };
  });
}

export default function FloatingBackground() {
  const items = useMemo(() => seededItems(16), []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {items.map((item) => (
        <motion.span
          key={item.key}
          initial={{ y: '110vh', opacity: 0 }}
          animate={{ y: '-10vh', opacity: [0, 0.18, 0.18, 0] }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{ left: `${item.left}%`, fontSize: item.size }}
          className="absolute"
        >
          {item.icon}
        </motion.span>
      ))}
    </div>
  );
}
