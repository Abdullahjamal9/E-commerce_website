import ForgotPasswordForm from '@/components/admin/ForgotPasswordForm';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function ForgotPasswordPage() {
  const settings = await getSettings();
  return <ForgotPasswordForm storeName={settings.storeName} />;
}
