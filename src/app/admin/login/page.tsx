import AdminLoginForm from '@/components/admin/AdminLoginForm';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  const settings = await getSettings();
  return <AdminLoginForm storeName={settings.storeName} />;
}
