import ContactForm from '@/components/ContactForm';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-black sm:text-4xl">
          Get in <span className="neon-text">Touch</span>
        </h1>
        <p className="mt-2 opacity-60">Questions about an order, sizing, or a collaboration?</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <ContactForm />

        <div className="space-y-4">
          <div className="glass rounded-3xl p-6">
            <p className="text-sm font-semibold opacity-60">Phone</p>
            <p className="mt-1 text-lg font-medium">{settings.contactPhone || 'Coming soon'}</p>
          </div>
          <div className="glass rounded-3xl p-6">
            <p className="text-sm font-semibold opacity-60">Email</p>
            <p className="mt-1 text-lg font-medium">{settings.contactEmail || 'Coming soon'}</p>
          </div>
          <div className="glass rounded-3xl p-6">
            <p className="text-sm font-semibold opacity-60">Address</p>
            <p className="mt-1 text-lg font-medium">{settings.address || 'Pakistan'}</p>
          </div>
          {settings.whatsappNumber && (
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glow block rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-center font-semibold text-white"
            >
              💬 Chat on WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
