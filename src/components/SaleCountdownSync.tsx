'use client';

import { useEffect } from 'react';
import { useSaleCountdown } from '@/store/useSaleCountdown';

/** Pushes the server-fetched sale end time into the client store so any product card/detail can read it without prop drilling. */
export default function SaleCountdownSync({ saleEndsAt }: { saleEndsAt: string | null }) {
  const setSaleEndsAt = useSaleCountdown((s) => s.setSaleEndsAt);

  useEffect(() => {
    setSaleEndsAt(saleEndsAt);
  }, [saleEndsAt, setSaleEndsAt]);

  return null;
}
