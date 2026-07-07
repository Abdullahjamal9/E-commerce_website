'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatPrice } from '@/lib/currency';
import { useToast } from '@/store/useToast';
import type { Shoe } from '@/lib/types';

const MAX_FEATURED = 8;

export default function AdminProductsTable({ products }: { products: Shoe[] }) {
  const router = useRouter();
  const notify = useToast((s) => s.show);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const featuredCount = products.filter((p) => p.featuredAt).length;

  const onDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    if (!res.ok) {
      notify('Could not delete product');
      return;
    }
    notify(`${name} deleted`);
    router.refresh();
  };

  const onToggleFeatured = async (id: string, featured: boolean) => {
    setTogglingId(id);
    const res = await fetch(`/api/products/${id}/featured`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured })
    });
    setTogglingId(null);
    if (!res.ok) {
      notify('Could not update homepage feature');
      return;
    }
    notify(featured ? 'Added to homepage collection' : 'Removed from homepage collection');
    router.refresh();
  };

  const onToggleActive = async (id: string, active: boolean, name: string) => {
    setTogglingId(id);
    const res = await fetch(`/api/products/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active })
    });
    setTogglingId(null);
    if (!res.ok) {
      notify('Could not update product status');
      return;
    }
    notify(active ? `${name} reactivated` : `${name} deactivated`);
    router.refresh();
  };

  if (products.length === 0) {
    return <p className="py-12 text-center text-sm opacity-60">No products yet. Add your first one.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <p className="mb-3 text-xs opacity-60">
        {featuredCount}/{MAX_FEATURED} products featured on homepage — only the most recently
        featured {MAX_FEATURED} will show if you select more.
      </p>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wide opacity-50">
            <th className="py-3 pr-4">Product</th>
            <th className="py-3 pr-4">Category</th>
            <th className="py-3 pr-4">Tags</th>
            <th className="py-3 pr-4">Price</th>
            <th className="py-3 pr-4">Stock</th>
            <th className="py-3 pr-4">Status</th>
            <th className="py-3 pr-4">Featured</th>
            <th className="py-3 pr-4" />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-white/5">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs opacity-50">{p.tagline}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4 opacity-70">{p.category}</td>
              <td className="py-3 pr-4 opacity-70">{p.tags.join(', ')}</td>
              <td className="py-3 pr-4 font-medium">{formatPrice(p.price)}</td>
              <td className="py-3 pr-4">
                <span className={p.stock <= 0 ? 'text-red-400' : 'opacity-70'}>{p.stock}</span>
                {p.stock <= 0 && (
                  <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-400">
                    Out of stock
                  </span>
                )}
              </td>
              <td className="py-3 pr-4">
                <button
                  type="button"
                  onClick={() => onToggleActive(p.id, !p.isActive, p.name)}
                  disabled={togglingId === p.id}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide disabled:opacity-50 ${
                    p.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-white/10 text-white/50 hover:bg-white/20'
                  }`}
                >
                  {p.isActive ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td className="py-3 pr-4">
                <input
                  type="checkbox"
                  checked={!!p.featuredAt}
                  disabled={togglingId === p.id}
                  onChange={(e) => onToggleFeatured(p.id, e.target.checked)}
                  className="h-4 w-4"
                />
              </td>
              <td className="py-3 pr-4 text-right">
                <Link
                  href={`/admin/products/${p.id}/edit`}
                  className="mr-3 text-sm opacity-70 hover:opacity-100"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(p.id, p.name)}
                  disabled={deletingId === p.id}
                  className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  {deletingId === p.id ? 'Deleting…' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
