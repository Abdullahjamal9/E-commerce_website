'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { formatPrice } from '@/lib/currency';
import { useToast } from '@/store/useToast';
import type { Shoe } from '@/lib/types';
import Pagination from './Pagination';

const MAX_FEATURED = 8;
const PAGE_SIZE = 50;

export default function AdminProductsTable({ products }: { products: Shoe[] }) {
  const router = useRouter();
  const notify = useToast((s) => s.show);
  const [items, setItems] = useState(products);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const featuredCount = items.filter((p) => p.featuredAt).length;
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  useEffect(() => {
    setItems(products);
  }, [products]);

  useEffect(() => {
    setPage(1);
  }, [products]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const visible = useMemo(
    () => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [items, page]
  );

  const persistOrder = async (ordered: Shoe[]) => {
    const res = await fetch('/api/products/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: ordered.map((p) => p.id) })
    });
    if (!res.ok) {
      notify('Could not save the new order');
      router.refresh();
      return;
    }
    router.refresh();
  };

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

  if (items.length === 0) {
    return <p className="py-12 text-center text-sm opacity-60">No products yet. Add your first one.</p>;
  }

  const columns = (
    <tr className="border-b border-white/10 text-xs uppercase tracking-wide opacity-50">
      <th className="w-8 py-3" />
      <th className="py-3 pr-4">S.No</th>
      <th className="py-3 pr-4">Product</th>
      <th className="py-3 pr-4">Category</th>
      <th className="py-3 pr-4">Tags</th>
      <th className="py-3 pr-4">Price</th>
      <th className="py-3 pr-4">Stock</th>
      <th className="py-3 pr-4">Status</th>
      <th className="py-3 pr-4">Featured</th>
      <th className="py-3 pr-4" />
    </tr>
  );

  const rowProps = {
    onDelete,
    onToggleFeatured,
    onToggleActive,
    deletingId,
    togglingId
  };

  return (
    <div className="overflow-x-auto">
      <p className="mb-1 text-xs opacity-60">
        {featuredCount} product{featuredCount === 1 ? '' : 's'} marked as Featured (homepage shows
        at most {MAX_FEATURED}, picked by their order below)
        {featuredCount > MAX_FEATURED && (
          <span className="text-amber-400">
            {' '}
            — {featuredCount - MAX_FEATURED} of them won&apos;t appear; uncheck some or drag the rest
            higher.
          </span>
        )}
        .
      </p>
      <p className="mb-3 text-xs opacity-60">
        Drag rows by the ⠿ handle to reorder — this only reorders within whatever&apos;s currently
        visible (e.g. a filtered category, or this page), leaving everything else untouched.
      </p>
      <table className="w-full text-left text-sm">
        <thead>{columns}</thead>
        <Reorder.Group
          as="tbody"
          axis="y"
          values={visible}
          onReorder={(newOrder) => {
            setItems((prev) => {
              const start = (page - 1) * PAGE_SIZE;
              const next = [...prev];
              newOrder.forEach((p, i) => {
                next[start + i] = p;
              });
              return next;
            });
            persistOrder(newOrder);
          }}
        >
          {visible.map((p, i) => (
            <Row key={p.id} p={p} sNo={(page - 1) * PAGE_SIZE + i + 1} {...rowProps} />
          ))}
        </Reorder.Group>
      </table>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

function Row({
  p,
  sNo,
  onDelete,
  onToggleFeatured,
  onToggleActive,
  deletingId,
  togglingId
}: {
  p: Shoe;
  sNo: number;
  onDelete: (id: string, name: string) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
  onToggleActive: (id: string, active: boolean, name: string) => void;
  deletingId: string | null;
  togglingId: string | null;
}) {
  const controls = useDragControls();

  const cells = (
    <>
      <td className="py-3 pr-2">
        <span
          onPointerDown={(e) => controls.start(e)}
          className="block cursor-grab touch-none select-none px-1 text-lg opacity-40 hover:opacity-80 active:cursor-grabbing"
        >
          ⠿
        </span>
      </td>
      <td className="py-3 pr-4 opacity-60">{sNo}</td>
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
          prefetch={false}
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
    </>
  );

  return (
    <Reorder.Item
      as="tr"
      value={p}
      dragListener={false}
      dragControls={controls}
      className="panel-solid border-b border-white/5"
      whileDrag={{ boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}
    >
      {cells}
    </Reorder.Item>
  );
}
