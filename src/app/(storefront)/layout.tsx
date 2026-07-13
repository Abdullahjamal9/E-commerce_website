import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import MobileNav from '@/components/MobileNav';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { getSettings } from '@/lib/settings';
import { getCategories } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);

  return (
    <>
      <Navbar storeName={settings.storeName} categories={categories} />
      <main className="pb-24 md:pb-0">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer
        storeName={settings.storeName}
        contactEmail={settings.contactEmail}
        contactPhone={settings.contactPhone}
      />
      <CartDrawer />
      <MobileNav />
    </>
  );
}
