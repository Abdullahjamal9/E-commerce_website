import { redirect } from 'next/navigation';
import ResetPasswordForm from '@/components/admin/ResetPasswordForm';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: { token?: string };
}) {
  if (!searchParams.token) redirect('/admin/forgot-password');

  const settings = await getSettings();
  return <ResetPasswordForm storeName={settings.storeName} token={searchParams.token} />;
}
