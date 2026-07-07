import Link from 'next/link';
import Image from 'next/image';
import logo from '@/assets/logo.png';

export default function Footer({ storeName, tags }: { storeName: string; tags: string[] }) {
  const columns = [
    { title: 'Shop', items: tags.slice(0, 4).map((t) => ({ label: t, href: `/shop?tag=${encodeURIComponent(t)}` })) },
    {
      title: 'Company',
      items: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms & Conditions', href: '/terms' }
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'Shipping & Returns', href: '/shipping-returns' },
        { label: 'Track Order', href: '/track-order' },
        { label: 'FAQ', href: '/faq' }
      ]
    }
  ];

  return (
    <footer className="glass mt-24 px-6 py-12">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 text-xl font-black tracking-[0.3em] neon-text">
            <Image src={logo} alt={storeName} width={28} height={28} />
            {storeName}
          </p>
          <p className="mt-3 max-w-xs text-sm opacity-60">
            Step into the future of style. Engineered for the next generation.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="mb-3 text-sm font-semibold">{col.title}</p>
            <ul className="space-y-2 text-sm">
              {col.items.map((it) => (
                <li key={it.label}>
                  <Link
                    href={it.href}
                    className="group relative inline-block opacity-60 transition hover:text-[var(--fg)] hover:opacity-100"
                  >
                    {it.label}
                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-300 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-10 text-center text-xs opacity-40">
        © {new Date().getFullYear()} {storeName}. All rights reserved.
      </p>
    </footer>
  );
}
