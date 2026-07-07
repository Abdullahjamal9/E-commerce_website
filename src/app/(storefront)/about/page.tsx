import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-black sm:text-4xl">
          About <span className="neon-text">{settings.storeName}</span>
        </h1>
        <p className="mt-3 opacity-60">Step into the future of style.</p>
      </div>

      <div className="glass space-y-6 rounded-3xl p-8 sm:p-10">
        <p className="opacity-80">
          {settings.storeName} is a lifestyle label obsessed with the intersection of comfort,
          craftsmanship, and tomorrow&apos;s design language. Every piece in our collection, from
          footwear to apparel and accessories, is engineered for everyday movement and finished by
          hand for everyday luxury.
        </p>
        <p className="opacity-80">
          We ship across Pakistan with simple, transparent payment options, Cash on Delivery or
          direct bank transfer, and a small team that personally reviews every order before it
          leaves our hands.
        </p>
        <div className="grid gap-6 pt-4 sm:grid-cols-3">
          {[
            { label: 'Hand-finished', value: 'Materials' },
            { label: 'Nationwide', value: 'Delivery' },
            { label: 'Secure', value: 'Payments' }
          ].map((s) => (
            <div key={s.value} className="text-center">
              <p className="text-2xl font-black neon-text">{s.value}</p>
              <p className="mt-1 text-sm opacity-60">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
