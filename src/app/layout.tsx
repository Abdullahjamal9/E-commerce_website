import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Toaster from '@/components/Toaster';
import SmoothScroll from '@/components/SmoothScroll';
import { getSettings } from '@/lib/settings';
import { SITE_URL } from '@/lib/site';
import logo from '@/assets/logo.png';

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

const DESCRIPTION =
  'Shop quality footwear, apparel, and accessories online with fast delivery, Cash on Delivery, and easy returns.';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const ogImage = { url: `${SITE_URL}${logo.src}`, width: logo.width, height: logo.height };

  return {
    // Lets every page's relative openGraph/twitter image and (once added)
    // alternates.canonical resolve to a full URL without repeating SITE_URL
    // everywhere — unset, Next silently drops those fields instead of
    // erroring, which is easy to miss.
    metadataBase: new URL(SITE_URL),
    title: { default: settings.storeName, template: `%s — ${settings.storeName}` },
    description: DESCRIPTION,
    // Per-page metadata (product, shop) overrides these; this is what search
    // engines and link previews fall back to on every other route.
    openGraph: {
      type: 'website',
      siteName: settings.storeName,
      title: settings.storeName,
      description: DESCRIPTION,
      images: [ogImage]
    },
    twitter: {
      card: 'summary',
      title: settings.storeName,
      description: DESCRIPTION,
      images: [ogImage.url]
    }
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  // Organization schema, site-wide: gives search engines a single verified
  // identity (name, logo, contact points) to attach to every page rather than
  // re-declaring it per route. sameAs only lists profiles that are actually
  // filled in — an empty string in the array reads to Google as a broken link.
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.storeName,
    url: SITE_URL,
    logo: `${SITE_URL}${logo.src}`,
    ...(settings.contactPhone || settings.contactEmail
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            ...(settings.contactPhone ? { telephone: settings.contactPhone } : {}),
            ...(settings.contactEmail ? { email: settings.contactEmail } : {})
          }
        }
      : {}),
    sameAs: [settings.facebookUrl, settings.instagramUrl].filter(Boolean)
  };

  return (
    <html lang="en" className={`light ${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <SmoothScroll />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
