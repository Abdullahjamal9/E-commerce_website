import type { Metadata } from 'next';
import TrackOrderForm from '@/components/TrackOrderForm';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Track Your Order',
  description: 'Check the latest status of your order using your order number and phone number.',
  alternates: { canonical: `${SITE_URL}/track-order` }
};

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-36 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black sm:text-4xl">
          Track Your <span className="neon-text">Order</span>
        </h1>
        <p className="mt-2 opacity-60">
          Enter your order number and the phone number you used at checkout.
        </p>
      </div>
      <TrackOrderForm />
    </div>
  );
}
