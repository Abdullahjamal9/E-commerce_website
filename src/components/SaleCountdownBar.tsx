'use client';

import { useEffect, useState } from 'react';
import { useSaleCountdown } from '@/store/useSaleCountdown';

const pad = (n: number) => n.toString().padStart(2, '0');

/** Green shimmering countdown shown below the price on a product's detail page, ticking down to Settings.saleEndsAt. */
export default function SaleCountdownBar({ percent }: { percent: number }) {
  const endsAt = useSaleCountdown((s) => s.saleEndsAt);
  // Starts null so the server-rendered markup and the first client render match;
  // the real countdown fills in a moment later via the effect below.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (percent <= 0 || !endsAt || now === null) return null;

  const remaining = new Date(endsAt).getTime() - now;
  if (remaining <= 0) return null;

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="shimmer-sweep relative mt-3 flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-lg bg-gradient-to-r from-[#0b3d20] to-[#146c3f] px-4 py-2 text-sm font-semibold text-white">
      <span className="font-black">{percent}% OFF</span>
      <span className="opacity-50">·</span>
      <span className="opacity-90">Azadi Sale Ends In:</span>
      <span className="ml-auto flex items-baseline gap-1 font-mono">
        <span>{days}d</span>
        <span>{pad(hours)}h</span>
        <span>{pad(minutes)}m</span>
        <span>{pad(seconds)}s</span>
      </span>
    </div>
  );
}
