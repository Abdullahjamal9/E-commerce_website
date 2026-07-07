import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { formatPrice } from '@/lib/currency';

export const dynamic = 'force-dynamic';

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id: params.id }, include: { items: true } }),
    getSettings()
  ]);

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-32 text-center">
      <p className="text-5xl">🎉</p>
      <h1 className="mt-4 text-3xl font-black sm:text-4xl">
        Order <span className="neon-text">Confirmed</span>
      </h1>
      <p className="mt-2 opacity-70">
        Thank you, {order.customerName}! Your order{' '}
        <span className="font-semibold">{order.orderNumber}</span> has been received.
      </p>

      <div className="glass mt-8 space-y-3 rounded-3xl p-6 text-left">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.productName} · {item.colorName} · Size {item.size} × {item.qty}
            </span>
            <span className="font-semibold">{formatPrice(item.price * item.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
          <span>Total</span>
          <span className="neon-text">{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="glass mt-6 rounded-3xl p-6 text-left text-sm opacity-80">
        <p>
          Payment method:{' '}
          <span className="font-medium">
            {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Bank Transfer / Easypaisa'}
          </span>
        </p>
        <p className="mt-1">
          We will contact you on <span className="font-medium">{order.phone}</span> to confirm
          delivery details.
        </p>
        <p className="mt-1">
          A confirmation has been sent to <span className="font-medium">{order.email}</span>.
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/shop"
          className="btn-glow rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-8 py-3 font-semibold text-white"
        >
          Continue Shopping
        </Link>
        {settings.whatsappNumber && (
          <a
            href={`https://wa.me/${settings.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="glass rounded-full px-8 py-3 font-semibold transition hover:bg-white/10"
          >
            💬 Message us on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
