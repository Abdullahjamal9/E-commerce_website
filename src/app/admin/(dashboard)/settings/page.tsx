import SettingsForm from '@/components/admin/SettingsForm';
import { getSettings } from '@/lib/settings';

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black sm:text-3xl">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
