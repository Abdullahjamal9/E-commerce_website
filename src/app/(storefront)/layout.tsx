import Navbar from '@/components/Navbar';
import AnnouncementBar from '@/components/AnnouncementBar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import SaleCountdownSync from '@/components/SaleCountdownSync';
import { getSettings } from '@/lib/settings';
import { getCategories } from '@/lib/categories';
import { getTags } from '@/lib/tags';
import { buildNav } from '@/lib/nav';

export const dynamic = 'force-dynamic';

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories, tags] = await Promise.all([getSettings(), getCategories(), getTags()]);

  // Two sales share one countdown: the Independence Day one, kept configured
  // year-round for next 14 August, and an ordinary one that can be switched on
  // whenever. If both are on, the seasonal one wins — it is the more specific
  // occasion, and its branding is the point of running it.
  const azadiEndsAt = settings.saleEnabled ? settings.saleEndsAt : null;
  const generalEndsAt = settings.generalSaleEnabled ? settings.generalSaleEndsAt : null;
  const countdownEndsAt = azadiEndsAt ?? generalEndsAt;
  const countdownVariant = azadiEndsAt ? 'azadi' : 'general';

  const saleRunning = settings.saleEnabled || settings.generalSaleEnabled;
  const navItems = buildNav(categories, tags, saleRunning);

  // One glyph per line, leading the text — enough to catch the eye in a
  // ticker without turning the strip into decoration.
  const announcements = [
    saleRunning ? '🏷️ Mid-season sale — up to 50% off' : null,
    '🚚 Free delivery on orders over Rs. 3,000',
    '💵 Cash on Delivery available nationwide'
  ].filter((m): m is string => Boolean(m));

  return (
    <>
      <SaleCountdownSync
        saleEndsAt={countdownEndsAt ? countdownEndsAt.toISOString() : null}
        variant={countdownVariant}
      />
      <AnnouncementBar messages={announcements} />
      <Navbar storeName={settings.storeName} navItems={navItems} />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer
        storeName={settings.storeName}
        contactEmail={settings.contactEmail}
        contactPhone={settings.contactPhone}
        whatsappNumber={settings.whatsappNumber}
        address={settings.address}
        codEnabled={settings.codEnabled}
        bankTransferEnabled={settings.bankTransferEnabled}
        easypaisaNumber={settings.easypaisaNumber}
        facebookUrl={settings.facebookUrl}
        instagramUrl={settings.instagramUrl}
        categories={categories}
      />
      <CartDrawer />
    </>
  );
}
