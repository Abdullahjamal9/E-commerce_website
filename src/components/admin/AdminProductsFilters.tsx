'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Category } from '@/lib/types';

export default function AdminProductsFilters({ categoryOptions }: { categoryOptions: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');

  useEffect(() => {
    setSearch(searchParams.get('search') ?? '');
  }, [searchParams]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search !== (searchParams.get('search') ?? '')) setParam('search', search);
    }, 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const category = searchParams.get('category') ?? '';
  const status = searchParams.get('status') ?? '';
  const stock = searchParams.get('stock') ?? '';
  const hasFilters = search || category || status || stock;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products…"
        className="min-w-[180px] flex-1 rounded-xl bg-white/5 px-4 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-white/30"
      />
      <select
        value={category}
        onChange={(e) => setParam('category', e.target.value)}
        className="rounded-xl bg-white/5 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-white/30"
      >
        <option value="">All categories</option>
        {categoryOptions.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        value={status}
        onChange={(e) => setParam('status', e.target.value)}
        className="rounded-xl bg-white/5 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-white/30"
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <select
        value={stock}
        onChange={(e) => setParam('stock', e.target.value)}
        className="rounded-xl bg-white/5 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-white/30"
      >
        <option value="">All stock</option>
        <option value="in">In stock</option>
        <option value="out">Out of stock</option>
      </select>
      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="text-sm opacity-60 hover:opacity-100"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
