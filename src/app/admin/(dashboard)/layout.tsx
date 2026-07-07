import AdminSidebar from '@/components/admin/AdminSidebar';
import { getSettings } from '@/lib/settings';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="flex">
      <AdminSidebar storeName={settings.storeName} />
      <main className="flex-1 overflow-y-auto p-6 sm:p-10">{children}</main>
    </div>
  );
}
