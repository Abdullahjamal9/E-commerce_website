'use client';

import { useEffect } from 'react';
import { useSaleCountdown, type SaleVariant } from '@/store/useSaleCountdown';

/** Pushes the server-fetched sale end time into the client store so any product card/detail can read it without prop drilling. */
export default function SaleCountdownSync({
  saleEndsAt,
  variant
}: {
  saleEndsAt: string | null;
  variant: SaleVariant;
}) {
  const setSale = useSaleCountdown((s) => s.setSale);

  useEffect(() => {
    setSale(saleEndsAt, variant);
  }, [saleEndsAt, variant, setSale]);

  return null;
}
