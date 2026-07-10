'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart, selectCount } from '@/store/useCart';

const ITEMS = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/shop', label: 'Shop', icon: '👟' },
  { href: '/wishlist', label: 'Wishlist', icon: '❤️' },
  { href: '/about', label: 'About', icon: '✨' }
];

export default function MobileNav() {
  const pathname = usePathname();
  const count = useCart(selectCount);
  const openCart = useCart((s) => s.open);

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-50 flex items-center justify-around py-2 md:hidden">
      {ITEMS.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] transition ${
            pathname === i.href ? 'neon-text' : 'opacity-70'
          }`}
        >
          <span className="text-lg">{i.icon}</span>
          {i.label}
        </Link>
      ))}
      <button
        data-cart-target
        onClick={openCart}
        className="relative flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] opacity-70"
      >
        <span className="text-lg">🛍️</span>
        Cart
        {count > 0 && (
          <span className="absolute right-1 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-neon-purple text-[9px] font-bold text-white">
            {count}
          </span>
        )}
      </button>
    </nav>
  );
}
