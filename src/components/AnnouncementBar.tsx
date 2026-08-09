'use client';

import { useEffect, useState } from 'react';

/**
 * Thin dark strip above the header that cycles through promo lines — the
 * standard retail pattern for surfacing sale/shipping messaging without
 * spending hero space on it.
 */
export default function AnnouncementBar({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [messages.length]);

  if (messages.length === 0) return null;

  return (
    <div className="relative z-[60] bg-[#151515] text-white">
      <div className="mx-auto flex h-9 max-w-site items-center justify-center overflow-hidden px-4">
        <p key={index} className="animate-fadeIn text-center text-[11px] font-medium tracking-wide sm:text-xs">
          {messages[index]}
        </p>
      </div>
    </div>
  );
}
