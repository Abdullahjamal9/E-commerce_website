/**
 * Formats an order timestamp in Pakistan time regardless of the server's own
 * timezone. Vercel (and most hosts) run functions in UTC, so an unqualified
 * `toLocaleString()` on the server rendered "11:11 AM" for an order actually
 * placed at 11:11 AM PKT — a real 5-hour gap once a reader in Pakistan (or
 * their inbox, which times the confirmation email off the same instant but
 * renders it client-side in their own timezone) compares the two.
 */
export function formatOrderDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-PK', {
    timeZone: 'Asia/Karachi',
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

/** Date-only variant, for contexts that don't need the time of day. */
export function formatOrderDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-PK', { timeZone: 'Asia/Karachi' });
}
