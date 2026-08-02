import AdminSidebar from '@/components/admin/AdminSidebar';
import { getSettings } from '@/lib/settings';

// Auth is enforced in middleware (reads cookies outside the render tree), so
// Next.js can't detect these pages as dynamic on its own — without this they
// get cached/static-optimized and admin edits stop showing up live.
export const dynamic = 'force-dynamic';

// Turso is reached over HTTP, so every DB read is a fetch() — and inside
// Server Components Next caches those in its Data Cache. That's how the edit
// form kept rendering a product's pre-re-upload image URLs while a route
// handler calling the very same getProductById() returned the new ones:
// the page render was fresh (its timestamp changed per request), only the
// underlying query response was being replayed from cache.
export const fetchCache = 'force-no-store';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="min-h-screen">
      <AdminSidebar storeName={settings.storeName} />
      <main className="overflow-y-auto p-4 transition-all duration-300 ease-out sm:p-6 md:ml-16 md:p-10 md:peer-hover:ml-60">
        {children}
      </main>
    </div>
  );
}
