import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function TermsPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
      <h1 className="text-3xl font-black sm:text-4xl">
        Terms <span className="neon-text">& Conditions</span>
      </h1>
      <p className="mt-2 text-sm opacity-60">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="glass mt-8 space-y-6 rounded-3xl p-6 text-sm opacity-80 sm:p-8">
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Orders & Pricing</h2>
          <p>
            All prices on {settings.storeName} are listed in Pakistani Rupees (PKR) and are
            subject to change without notice. Placing an order constitutes an offer to purchase,
            which we may accept or decline (for example, in case of stock unavailability or
            pricing errors).
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Payment</h2>
          <p>
            We accept Cash on Delivery and manual Bank Transfer / Easypaisa. For bank transfer
            orders, your order will be marked &quot;Awaiting Verification&quot; until our team
            confirms receipt of payment.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Product Accuracy</h2>
          <p>
            We make every effort to display product colors, sizing, and details accurately.
            Slight variations may occur due to photography, lighting, or display settings.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Order Cancellation</h2>
          <p>
            We reserve the right to cancel any order due to stock unavailability, suspected
            fraud, or pricing/listing errors. If payment was already made, a full refund will be
            issued.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Reviews</h2>
          <p>
            By submitting a product review, you confirm the content and any attached photos are
            your own and grant us permission to display them publicly on our site. We reserve the
            right to remove reviews that are abusive, spam, or unrelated to the product.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Contact</h2>
          <p>
            Questions about these terms can be sent to{' '}
            {settings.contactEmail ? (
              <a href={`mailto:${settings.contactEmail}`} className="text-neon-blue hover:underline">
                {settings.contactEmail}
              </a>
            ) : (
              'our contact page'
            )}
            .
          </p>
        </section>
      </div>
    </div>
  );
}
