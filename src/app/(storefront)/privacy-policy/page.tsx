import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function PrivacyPolicyPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
      <h1 className="text-3xl font-black sm:text-4xl">
        Privacy <span className="neon-text">Policy</span>
      </h1>
      <p className="mt-2 text-sm opacity-60">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="glass mt-8 space-y-6 rounded-3xl p-6 text-sm opacity-80 sm:p-8">
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Information We Collect</h2>
          <p>
            When you place an order with {settings.storeName}, we collect your name, phone
            number, delivery address, city, and email address. This information is used solely
            to process and deliver your order, and to contact you regarding its status.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">How We Use Your Information</h2>
          <p>
            We use your information to fulfill orders, send order confirmations and updates,
            verify bank transfer payments, and respond to customer support requests. We do not
            sell or rent your personal information to third parties.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Payment Information</h2>
          <p>
            For Cash on Delivery orders, no payment information is collected online. For bank
            transfer or Easypaisa payments, you transfer funds directly through your own banking
            app — we never ask for your card number, PIN, or OTP.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Reviews & Photos</h2>
          <p>
            If you submit a product review, your name, rating, comment, and any photos you
            attach are displayed publicly on the product page.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Data Retention</h2>
          <p>
            Order records are retained to support order history, customer service, and legal
            /accounting requirements.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold opacity-100">Contact Us</h2>
          <p>
            For any privacy-related questions, contact us at{' '}
            {settings.contactEmail ? (
              <a href={`mailto:${settings.contactEmail}`} className="text-neon-blue hover:underline">
                {settings.contactEmail}
              </a>
            ) : (
              'our contact page'
            )}
            {settings.contactPhone ? ` or ${settings.contactPhone}` : ''}.
          </p>
        </section>
      </div>
    </div>
  );
}
