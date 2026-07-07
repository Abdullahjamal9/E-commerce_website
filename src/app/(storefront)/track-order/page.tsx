import TrackOrderForm from '@/components/TrackOrderForm';

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-28 sm:px-6">
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
