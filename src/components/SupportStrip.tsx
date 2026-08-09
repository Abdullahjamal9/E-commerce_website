import Link from 'next/link';

/** Trust strip above the footer — support, returns and delivery reassurance,
 *  the block the reference storefront closes its homepage with. */
export default function SupportStrip({
  contactEmail,
  contactPhone
}: {
  contactEmail: string;
  contactPhone: string;
}) {
  const items = [
    {
      title: 'Customer Support',
      lines: [contactPhone, contactEmail].filter(Boolean),
      href: '/contact',
      cta: 'Contact us'
    },
    {
      title: 'Easy Exchange',
      lines: ['7-day exchange on unused items'],
      href: '/shipping-returns',
      cta: 'Exchange policy'
    },
    {
      title: 'Nationwide Delivery',
      lines: ['Cash on Delivery available'],
      href: '/track-order',
      cta: 'Track your order'
    }
  ];

  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface-alt)]">
      <div className="mx-auto grid max-w-site gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        {items.map((item) => (
          <div key={item.title} className="text-center sm:text-left">
            <p className="text-sm font-bold uppercase tracking-wide">{item.title}</p>
            {item.lines.map((line) => (
              <p key={line} className="mt-1 text-sm text-[var(--muted)]">
                {line}
              </p>
            ))}
            <Link
              href={item.href}
              className="mt-2 inline-block py-2 text-xs font-semibold uppercase tracking-wide underline underline-offset-4 transition hover:opacity-70"
            >
              {item.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
