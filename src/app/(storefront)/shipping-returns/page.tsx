import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function ShippingReturnsPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
      <h1 className="text-3xl font-black sm:text-4xl">
        Shipping <span className="neon-text">& Returns</span>
      </h1>

      <div className="glass mt-8 space-y-6 rounded-3xl p-6 text-sm opacity-80 sm:p-8">
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Delivery</h2>
          <p>
            We currently ship across Pakistan. Once your order is confirmed, our team will
            contact you on the phone number provided to arrange delivery. Delivery times vary by
            city, typically 2–5 business days.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Payment on Delivery</h2>
          <p>
            For Cash on Delivery orders, please have the exact amount ready for our rider at the
            time of delivery.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Returns & Exchanges</h2>
          <p>
            If your item arrives damaged, defective, or doesn&apos;t match your order, contact us
            within 3 days of delivery and we&apos;ll arrange a replacement or refund. Items must
            be unused, in original packaging, with tags attached.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Refunds</h2>
          <p>
            Approved refunds for bank transfer / Easypaisa orders are sent back to the same
            account used for payment. Cash on Delivery refunds are processed via bank transfer or
            Easypaisa after verification.
          </p>
          <p className="mt-2">
            Please note that delivery charges are non-refundable and will be deducted from the
            refunded amount in all cases.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Need Help?</h2>
          <p>
            Reach out to us at{' '}
            {settings.contactPhone ? (
              <a href={`tel:${settings.contactPhone}`} className="text-neon-blue hover:underline">
                {settings.contactPhone}
              </a>
            ) : (
              'our contact page'
            )}{' '}
            {settings.whatsappNumber && (
              <>
                or via{' '}
                <a
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neon-blue hover:underline"
                >
                  WhatsApp
                </a>
              </>
            )}
            .
          </p>
        </section>
      </div>
    </div>
  );
}
