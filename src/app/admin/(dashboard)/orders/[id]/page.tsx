import Link from 'next/link';
import { notFound } from 'next/navigation';
import OrderStatusEditor from '@/components/admin/OrderStatusEditor';
import { prisma } from '@/lib/db';
import { formatPrice } from '@/lib/currency';

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true }
  });
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl font-black sm:text-3xl">{order.orderNumber}</h1>
      <p className="mb-6 text-sm opacity-60">
        Placed {new Date(order.createdAt).toLocaleString()}
      </p>

      <div className="glass mb-6 rounded-2xl p-6">
        <p className="mb-4 font-semibold">Update Status</p>
        <OrderStatusEditor
          orderId={order.id}
          paymentStatus={order.paymentStatus}
          orderStatus={order.orderStatus}
        />
      </div>

      <div className="glass mb-6 grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
        <div>
          <p className="text-sm opacity-60">Customer</p>
          <p className="font-medium">{order.customerName}</p>
          <p className="text-sm opacity-70">{order.email}</p>
          <p className="text-sm opacity-70">{order.phone}</p>
        </div>
        <div>
          <p className="text-sm opacity-60">Delivery Address</p>
          <p className="font-medium">{order.address}</p>
          <p className="text-sm opacity-70">{order.city}</p>
        </div>
        <div>
          <p className="text-sm opacity-60">Payment Method</p>
          <p className="font-medium">
            {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Bank Transfer / Easypaisa'}
          </p>
        </div>
        {order.transactionRef && (
          <div>
            <p className="text-sm opacity-60">Transaction Reference</p>
            <p className="font-medium">{order.transactionRef}</p>
          </div>
        )}
        {(order.paymentProof as string[]).length > 0 && (
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm opacity-60">Payment Proof</p>
            <div className="flex flex-wrap gap-3">
              {(order.paymentProof as string[]).map((url) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="Payment proof"
                    className="h-24 w-24 rounded-xl object-cover transition hover:opacity-80"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-6">
        <p className="mb-4 font-semibold">Items</p>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.productName}</p>
                <p className="text-xs opacity-60">
                  {item.colorName} · Size {item.size} · Qty {item.qty}
                </p>
              </div>
              <p className="text-sm font-semibold">{formatPrice(item.price * item.qty)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-white/10 pt-4 text-lg font-bold">
          <span>Total</span>
          <span className="neon-text">{formatPrice(order.total)}</span>
        </div>
      </div>

      <Link
        href="/admin/orders"
        className="btn-glow mt-6 block w-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple py-3 text-center font-semibold text-white"
      >
        Done — Back to Orders
      </Link>
    </div>
  );
}
