import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Toaster from '@/components/Toaster';
import SmoothScroll from '@/components/SmoothScroll';
import { getSettings } from '@/lib/settings';

// tailwind.config points font-sans at var(--font-sans), but nothing ever
// defined it — an undefined var invalidates the whole font-family
// declaration, so every page was falling back to the browser's default
// serif. This both defines it and matches the reference storefront's face.
// Self-hosted (latin subset, pulled from Google Fonts' own CDN files) instead
// of next/font/google — that fetches at dev/build time over the network,
// which hangs indefinitely behind a firewall/proxy that blocks Google Fonts.
const sans = localFont({
  src: [
    { path: '../assets/fonts/zen-maru-gothic-400.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/zen-maru-gothic-500.woff2', weight: '500', style: 'normal' },
    { path: '../assets/fonts/zen-maru-gothic-700.woff2', weight: '700', style: 'normal' },
    { path: '../assets/fonts/zen-maru-gothic-900.woff2', weight: '900', style: 'normal' }
  ],
  variable: '--font-sans',
  display: 'swap'
});

// Display face for the homepage banner headline only — the condensed poster
// weight the artwork was set in. Self-hosted for the same reason as above.
const display = localFont({
  src: [{ path: '../assets/fonts/anton-400.woff2', weight: '400', style: 'normal' }],
  variable: '--font-display',
  display: 'swap'
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: settings.storeName,
    description: 'Shop quality footwear, apparel, and accessories online with fast delivery, Cash on Delivery, and easy returns.'
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`light ${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <SmoothScroll />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
