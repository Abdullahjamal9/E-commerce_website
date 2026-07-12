'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import type { Category, Shoe, Tag } from '@/lib/types';

type Sort = 'newest' | 'price-asc' | 'price-desc';

const TEXT_SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'XXXL'];
const PAGE_SIZE = 24;

/** Numeric sizes sort low-to-high; text sizes (S, M, L…) follow a known
 * size order; anything else falls back to alphabetical. */
function compareSizes(a: string, b: string) {
  const numA = Number(a);
  const numB = Number(b);
  const aIsNum = !Number.isNaN(numA);
  const bIsNum = !Number.isNaN(numB);
  if (aIsNum && bIsNum) return numA - numB;
  if (aIsNum) return -1;
  if (bIsNum) return 1;

  const idxA = TEXT_SIZE_ORDER.indexOf(a.toUpperCase());
  const idxB = TEXT_SIZE_ORDER.indexOf(b.toUpperCase());
  if (idxA !== -1 && idxB !== -1) return idxA - idxB;
  if (idxA !== -1) return -1;
  if (idxB !== -1) return 1;
  return a.localeCompare(b);
}

function PriceFilter({
  minPrice,
  maxPrice,
  onApply
}: {
  minPrice: string;
  maxPrice: string;
  onApply: (min: string, max: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);
  const containerRef = useRef<HTMLDivElement>(null);
  const active = minPrice !== '' || maxPrice !== '';

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const apply = () => {
    onApply(min, max);
    setOpen(false);
  };

  const clear = () => {
    setMin('');
    setMax('');
    onApply('', '');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Filter by price"
        className={`glass relative flex h-full items-center gap-1.5 rounded-full px-3 py-2 text-sm transition ${
          active ? 'ring-1 ring-neon-blue' : ''
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="10" y1="18" x2="14" y2="18" />
        </svg>
        {active && <span className="h-1.5 w-1.5 rounded-full bg-neon-blue" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="glass absolute right-0 top-full z-20 mt-2 w-64 rounded-xl p-4 shadow-glow"
          >
            <p className="mb-3 text-sm font-medium opacity-80">Price range</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={min}
                onChange={(e) => setMin(e.target.value)}
                placeholder="Min"
                className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-white/30"
              />
              <span className="opacity-50">–</span>
              <input
                type="number"
                min={0}
                value={max}
                onChange={(e) => setMax(e.target.value)}
                placeholder="Max"
                className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-white/30"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={apply}
                className="btn-glow flex-1 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple py-2 text-sm font-semibold text-white"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={clear}
                className="rounded-full px-4 py-2 text-sm opacity-60 transition hover:opacity-100"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' }
];

function SortFilter({ sort, onChange }: { sort: Sort; onChange: (sort: Sort) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const active = sort !== 'newest';

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Sort products"
        className={`glass relative flex h-full items-center gap-1.5 rounded-full px-3 py-2 text-sm transition ${
          active ? 'ring-1 ring-neon-blue' : ''
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="14" y2="12" />
          <line x1="4" y1="18" x2="9" y2="18" />
        </svg>
        {active && <span className="h-1.5 w-1.5 rounded-full bg-neon-blue" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="glass absolute right-0 top-full z-20 mt-2 w-56 rounded-xl p-4 shadow-glow"
          >
            <p className="mb-3 text-sm font-medium opacity-80">Sort by</p>
            <div className="flex flex-col gap-2">
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`rounded-full px-3 py-1.5 text-left text-sm transition ${
                    sort === o.value
                      ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                      : 'bg-white/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SizeFilter({
  sizes,
  activeSize,
  onChange
}: {
  sizes: string[];
  activeSize: string | 'All';
  onChange: (size: string | 'All') => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const active = activeSize !== 'All';

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Filter by size"
        className={`glass relative flex h-full items-center gap-1.5 rounded-full px-3 py-2 text-sm transition ${
          active ? 'ring-1 ring-neon-blue' : ''
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="8" width="18" height="8" rx="1" />
          <line x1="7" y1="8" x2="7" y2="11" />
          <line x1="11" y1="8" x2="11" y2="11" />
          <line x1="15" y1="8" x2="15" y2="11" />
        </svg>
        {active && <span className="h-1.5 w-1.5 rounded-full bg-neon-blue" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="glass absolute right-0 top-full z-20 mt-2 w-64 rounded-xl p-4 shadow-glow"
          >
            <p className="mb-3 text-sm font-medium opacity-80">Size</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  onChange('All');
                  setOpen(false);
                }}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  activeSize === 'All'
                    ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                    : 'bg-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                All
              </button>
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    activeSize === s
                      ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                      : 'bg-white/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShopGrid({
  products,
  tags,
  category,
  initialTag,
  storeName
}: {
  products: Shoe[];
  tags: Tag[];
  category?: Category;
  initialTag?: Tag;
  storeName: string;
}) {
  const [activeTag, setActiveTag] = useState<Tag | 'All'>(initialTag ?? 'All');
  const [activeSize, setActiveSize] = useState<string | 'All'>('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<Sort>('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const tagFilters: (Tag | 'All')[] = ['All', ...tags];

  const inCategory = useMemo(
    () => (category ? products.filter((p) => p.category === category) : products),
    [products, category]
  );

  // Sizes only make sense within a single product category (e.g. shoe sizes
  // vs. clothing sizes), so this filter is hidden on the all-categories view.
  const availableSizes = useMemo(
    () => (category ? Array.from(new Set(inCategory.flatMap((p) => p.sizes))).sort(compareSizes) : []),
    [inCategory, category]
  );

  const visible = useMemo(() => {
    let list = activeTag === 'All' ? inCategory : inCategory.filter((p) => p.tags.includes(activeTag));

    if (activeSize !== 'All') list = list.filter((p) => p.sizes.includes(activeSize));

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q)
      );
    }

    const min = minPrice === '' ? undefined : Number(minPrice);
    const max = maxPrice === '' ? undefined : Number(maxPrice);
    if (min !== undefined) list = list.filter((p) => p.price >= min);
    if (max !== undefined) list = list.filter((p) => p.price <= max);

    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [inCategory, activeTag, activeSize, search, sort, minPrice, maxPrice]);

  // Reset how many cards are rendered whenever the filtered set changes, so
  // switching category/tag/search doesn't leave a stale "Load more" position.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [visible]);

  const shown = visible.slice(0, visibleCount);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black sm:text-4xl">
          {category ? (
            <>
              Shop <span className="neon-text">{category}</span>
            </>
          ) : (
            <>
              Full <span className="neon-text">Shop</span>
            </>
          )}
        </h1>
        <p className="mt-2 opacity-60">Browse the entire {storeName} catalogue.</p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {tagFilters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveTag(f)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTag === f
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-glow'
                  : 'glass opacity-70 hover:opacity-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shoes…"
            className="glass w-full rounded-full px-4 py-2 text-sm outline-none sm:w-48"
          />
          <SortFilter sort={sort} onChange={setSort} />
          <PriceFilter
            minPrice={minPrice}
            maxPrice={maxPrice}
            onApply={(min, max) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
          />
          {category && availableSizes.length > 0 && (
            <SizeFilter sizes={availableSizes} activeSize={activeSize} onChange={setActiveSize} />
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-20 text-center opacity-60">
          {search.trim() || minPrice !== '' || maxPrice !== '' || activeSize !== 'All'
            ? 'No products match your filters.'
            : category
              ? `No products available in "${category}" yet. Check back soon!`
              : 'No products available yet.'}
        </p>
      ) : (
        <>
          <motion.div
            layout
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {shown.map((shoe) => (
              <ProductCard key={shoe.id} shoe={shoe} />
            ))}
          </motion.div>

          {visibleCount < visible.length && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="glass rounded-full px-6 py-2.5 text-sm font-semibold transition hover:bg-white/10"
              >
                Load More ({visible.length - visibleCount} more)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
