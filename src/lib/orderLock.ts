/** The store's return/exchange window: once an order has been Delivered this long, its status locks. */
export const RETURN_WINDOW_DAYS = 7;

/**
 * True once an order's Order Status can no longer be edited: it has sat as
 * DELIVERED past the return/exchange window, and nobody has manually
 * unlocked it (orderStatusUnlocked) for an exceptional case.
 */
export function isOrderStatusLocked(order: {
  orderStatus: string;
  deliveredAt: Date | string | null;
  orderStatusUnlocked: boolean;
}): boolean {
  if (order.orderStatusUnlocked) return false;
  if (order.orderStatus !== 'DELIVERED' || !order.deliveredAt) return false;

  const msSinceDelivered = Date.now() - new Date(order.deliveredAt).getTime();
  return msSinceDelivered >= RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

/** When the return window closes (or closed) for a delivered order — null if it was never delivered. */
export function returnWindowCloses(deliveredAt: Date | string | null): Date | null {
  if (!deliveredAt) return null;
  return new Date(new Date(deliveredAt).getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000);
}
