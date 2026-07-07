import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function FAQPage() {
  const settings = await getSettings();

  const faqs = [
    {
      q: 'What payment methods do you accept?',
      a: 'We accept Cash on Delivery and manual Bank Transfer / Easypaisa. You can choose your preferred method at checkout.'
    },
    {
      q: 'How long does delivery take?',
      a: 'Delivery typically takes 2–5 business days depending on your city.'
    },
    {
      q: 'How do I track my order?',
      a: 'Use the "Track Order" page with your order number and phone number to check the latest status.'
    },
    {
      q: 'Can I return or exchange a product?',
      a: 'Yes, see our Shipping & Returns page for details. Contact us within 3 days of delivery for damaged, defective, or incorrect items.'
    },
    {
      q: 'I paid by bank transfer, when will my order be confirmed?',
      a: 'Our team verifies bank transfer payments manually and sends a confirmation email once approved, usually within a few hours.'
    },
    {
      q: 'How do I know what size to order?',
      a: 'Available sizes are shown on each product page. If you’re unsure, feel free to contact us before ordering.'
    }
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
      <h1 className="text-3xl font-black sm:text-4xl">
        Frequently Asked <span className="neon-text">Questions</span>
      </h1>

      <div className="glass mt-8 space-y-6 rounded-3xl p-6 sm:p-8">
        {faqs.map((item) => (
          <div key={item.q} className="border-b border-white/10 pb-5 last:border-0 last:pb-0">
            <p className="font-semibold">{item.q}</p>
            <p className="mt-1 text-sm opacity-70">{item.a}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-sm opacity-60">
        Still have questions?{' '}
        {settings.contactEmail ? (
          <a href={`mailto:${settings.contactEmail}`} className="text-neon-blue hover:underline">
            Email us
          </a>
        ) : (
          'Reach out via our contact page'
        )}
        .
      </p>
    </div>
  );
}
