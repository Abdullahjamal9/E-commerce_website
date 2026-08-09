import Link from 'next/link';
import Image from 'next/image';
import { FacebookIcon, InstagramIcon, MailIcon, WhatsAppIcon } from './icons';
import logo from '@/assets/logo.png';

export default function Footer({
  storeName,
  contactEmail,
  contactPhone,
  whatsappNumber,
  address,
  codEnabled,
  bankTransferEnabled,
  easypaisaNumber,
  facebookUrl,
  instagramUrl,
  categories
}: {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  address: string;
  codEnabled: boolean;
  bankTransferEnabled: boolean;
  easypaisaNumber: string;
  facebookUrl: string;
  instagramUrl: string;
  categories: string[];
}) {
  const about = [
    { label: 'Track Your Order', href: '/track-order' },
    { label: 'Shipping & Returns', href: '/shipping-returns' },
    { label: 'FAQ', href: '/faq' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' }
  ];

  const topCategories = [
    ...categories.map((c) => ({ label: c, href: `/shop?category=${encodeURIComponent(c)}` })),
    { label: 'All Products', href: '/shop' }
  ];

  const socials = [
    facebookUrl && { label: 'Facebook', href: facebookUrl, Icon: FacebookIcon },
    instagramUrl && { label: 'Instagram', href: instagramUrl, Icon: InstagramIcon },
    whatsappNumber && {
      label: 'WhatsApp',
      href: `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`,
      Icon: WhatsAppIcon
    },
    contactEmail && { label: 'Email', href: `mailto:${contactEmail}`, Icon: MailIcon }
  ].filter(
    (s): s is { label: string; href: string; Icon: typeof FacebookIcon } => Boolean(s)
  );

  const payments = [
    codEnabled && 'Cash on Delivery',
    bankTransferEnabled && 'Bank Transfer',
    easypaisaNumber && 'Easypaisa'
  ].filter((p): p is string => Boolean(p));

  return (
    <footer className="mt-24 bg-[#151515] text-white">
      <div className="mx-auto grid max-w-site gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 text-lg font-black uppercase tracking-[0.25em]">
            <Image src={logo} alt={storeName} width={26} height={26} />
            {storeName}
          </p>
          {address && <p className="mt-4 max-w-xs text-sm text-white/60">{address}</p>}
        </div>

        <FooterColumn title={`About ${storeName}`} items={about} />

        <FooterColumn title="Top Categories" items={topCategories} />

        <div>
          {socials.length > 0 && (
            <>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-white/50">
                Connect With Us
              </p>
              <div className="mb-8 flex gap-4">
                {socials.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-white/70 transition hover:text-white"
                  >
                    <Icon size={22} />
                  </a>
                ))}
              </div>
            </>
          )}

          {payments.length > 0 && (
            <>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-white/50">
                Payment Methods
              </p>
              <div className="flex flex-wrap gap-2">
                {payments.map((p) => (
                  <span
                    key={p}
                    className="border border-white/25 px-2.5 py-1 text-[11px] text-white/80"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-site flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="-my-2 flex gap-5">
            <Link href="/terms" className="py-2 transition hover:text-white">
              Terms &amp; Conditions
            </Link>
            <Link href="/privacy-policy" className="py-2 transition hover:text-white">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-white/50">{title}</p>
      <ul className="text-sm">
        {items.map((it) => (
          <li key={it.href + it.label}>
            <Link
              href={it.href}
              className="block py-2 text-white/70 transition hover:text-white"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
