'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useToast } from '@/store/useToast';
import type { AdminReview } from '@/lib/reviews';

function Stars({ value }: { value: number }) {
  return (
    <span className="text-amber-400">
      {'★'.repeat(value)}
      <span className="text-white/20">{'★'.repeat(5 - value)}</span>
    </span>
  );
}

export default function AdminReviewsTable({ reviews }: { reviews: AdminReview[] }) {
  const router = useRouter();
  const notify = useToast((s) => s.show);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter(
      (r) =>
        r.productName.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q)
    );
  }, [reviews, search]);

  const onDelete = async (id: string, customerName: string) => {
    if (!window.confirm(`Delete the review from "${customerName}"? This cannot be undone.`)) return;
    setDeletingId(id);
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    if (!res.ok) {
      notify('Could not delete review');
      return;
    }
    notify('Review deleted');
    router.refresh();
  };

  if (reviews.length === 0) {
    return <p className="py-12 text-center text-sm opacity-60">No reviews yet.</p>;
  }

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by product, customer, or comment…"
        className="mb-4 w-full max-w-sm rounded-xl bg-white/5 px-4 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-white/30"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide opacity-50">
              <th className="py-3 pr-4">Product</th>
              <th className="py-3 pr-4">Customer</th>
              <th className="py-3 pr-4">Rating</th>
              <th className="py-3 pr-4">Comment</th>
              <th className="py-3 pr-4">Date</th>
              <th className="py-3 pr-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-white/5 align-top">
                <td className="py-3 pr-4">
                  <Link href={`/product/${r.productSlug}`} target="_blank" className="font-medium hover:underline">
                    {r.productName}
                  </Link>
                </td>
                <td className="py-3 pr-4 opacity-70">{r.customerName}</td>
                <td className="py-3 pr-4">
                  <Stars value={r.rating} />
                </td>
                <td className="py-3 pr-4 max-w-sm opacity-80">
                  <p className="line-clamp-3">{r.comment}</p>
                  {r.images.length > 0 && (
                    <p className="mt-1 text-xs opacity-50">{r.images.length} photo(s)</p>
                  )}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap opacity-50">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 pr-4 text-right">
                  <button
                    onClick={() => onDelete(r.id, r.customerName)}
                    disabled={deletingId === r.id}
                    className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    {deletingId === r.id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm opacity-60">No reviews match your search.</p>
        )}
      </div>
    </div>
  );
}
