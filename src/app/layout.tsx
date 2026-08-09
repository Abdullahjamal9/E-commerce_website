import type { Metadata } from 'next';
import { Zen_Maru_Gothic } from 'next/font/google';
import './globals.css';
import Toaster from '@/components/Toaster';
import { getSettings } from '@/lib/settings';

// tailwind.config points font-sans at var(--font-sans), but nothing ever
// defined it — an undefined var invalidates the whole font-family
// declaration, so every page was falling back to the browser's default
// serif. This both defines it and matches the reference storefront's face.
const sans = Zen_Maru_Gothic({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-sans',
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
    <html lang="en" className={`light ${sans.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
