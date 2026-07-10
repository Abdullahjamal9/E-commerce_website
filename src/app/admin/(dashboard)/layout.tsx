import AdminSidebar from '@/components/admin/AdminSidebar';
import { getSettings } from '@/lib/settings';

// Auth is enforced in middleware (reads cookies outside the render tree), so
// Next.js can't detect these pages as dynamic on its own — without this they
// get cached/static-optimized and admin edits stop showing up live.
export const dynamic = 'force-dynamic';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="min-h-screen">
      <AdminSidebar storeName={settings.storeName} />
      <main className="overflow-y-auto p-4 sm:p-6 md:ml-16 md:p-10">{children}</main>
    </div>
  );
}
