'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import ScrollableChipRow from './ScrollableChipRow';
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
                className="w-full rounded-lg bg-[var(--surface-alt)] px-3 py-2 text-sm outline-none ring-1 ring-[var(--border)] focus:ring-[var(--fg)]"
              />
              <span className="opacity-50">–</span>
              <input
                type="number"
                min={0}
                value={max}
                onChange={(e) => setMax(e.target.value)}
                placeholder="Max"
                className="w-full rounded-lg bg-[var(--surface-alt)] px-3 py-2 text-sm outline-none ring-1 ring-[var(--border)] focus:ring-[var(--fg)]"
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
                      : 'bg-[var(--surface-alt)] opacity-70 hover:opacity-100'
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
                    : 'bg-[var(--surface-alt)] opacity-70 hover:opacity-100'
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
                      : 'bg-[var(--surface-alt)] opacity-70 hover:opacity-100'
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
  categories,
  category,
  initialTag,
  audience,
  storeName
}: {
  products: Shoe[];
  tags: Tag[];
  categories: Category[];
  category?: Category;
  initialTag?: Tag;
  /** Locked audience filter (Men/Women) that survives style tab changes. */
  audience?: Tag;
  storeName: string;
}) {
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>(category ?? 'All');
  const [activeTag, setActiveTag] = useState<Tag | 'All'>(initialTag ?? 'All');

  // useState's initial value only applies on mount — navigating here again with a
  // different ?category=/?tag= (e.g. via the Navbar's Shop dropdown) re-renders
  // this same component with new props instead of remounting it, so the active
  // filters need to be re-synced explicitly or they'd keep showing the old ones.
  useEffect(() => {
    setActiveCategory(category ?? 'All');
  }, [category]);

  useEffect(() => {
    setActiveTag(initialTag ?? 'All');
  }, [initialTag]);
  const [activeSize, setActiveSize] = useState<string | 'All'>('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<Sort>('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const categoryFilters: (Category | 'All')[] = ['All', ...categories];
  // Audience is fixed by the menu, so it isn't offered as a style tab.
  const tagFilters: (Tag | 'All')[] = [
    'All',
    ...tags.filter((t) => t !== audience)
  ];

  const inAudience = useMemo(
    () => (audience ? products.filter((p) => p.tags.includes(audience)) : products),
    [products, audience]
  );

  const inCategory = useMemo(
    () => (activeCategory === 'All' ? inAudience : inAudience.filter((p) => p.category === activeCategory)),
    [inAudience, activeCategory]
  );

  // Sizes only make sense within a single product category (e.g. shoe sizes
  // vs. clothing sizes), so this filter is hidden on the all-categories view.
  const availableSizes = useMemo(
    () =>
      activeCategory === 'All'
        ? []
        : Array.from(new Set(inCategory.flatMap((p) => p.sizes))).sort(compareSizes),
    [inCategory, activeCategory]
  );

  // A size chosen under one category may not exist under another, so drop it
  // whenever the category changes rather than leaving a filter that hides everything.
  useEffect(() => {
    setActiveSize('All');
  }, [activeCategory]);

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

  const scope = activeCategory === 'All' ? 'All Products' : activeCategory;
  const heading = audience ? `${audience}'s ${scope === 'All Products' ? 'Collection' : scope}` : scope;

  return (
    <>

      <section className="mx-auto max-w-site px-4 pb-20 pt-36 sm:px-6">
        <nav className="mb-3 text-xs text-[var(--muted)]">
          <Link href="/" className="-my-2 inline-block py-2 transition hover:text-[var(--fg)]">
            Home
          </Link>
          <span className="px-1.5">/</span>
          <span className="text-[var(--fg)]">{heading}</span>
        </nav>

        <h1 className="text-2xl font-black uppercase tracking-wide sm:text-3xl">{heading}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Browse the {storeName} catalogue.</p>

        {/* Style tab row — the reference storefront's rounded, separator-split
            strip. Driven by tags, which are our equivalent of its style
            filters; category has its own control in the rail. */}
        <div className="mt-6 flex justify-center">
          <div className="max-w-full rounded-2xl bg-[var(--surface-alt)] px-2 sm:px-4">
            <ScrollableChipRow className="!gap-0">
              {tagFilters.map((f, i) => (
                <div key={f} className="flex items-center">
                  {i > 0 && <span className="h-4 w-px bg-[var(--border)]" aria-hidden />}
                  <button
                    onClick={() => setActiveTag(f)}
                    className={`relative mx-3 whitespace-nowrap py-3.5 text-sm transition-colors sm:mx-4 ${
                      activeTag === f
                        ? 'font-semibold text-[var(--fg)]'
                        : 'text-[var(--muted)] hover:text-[var(--fg)]'
                    }`}
                  >
                    {f}
                    <span
                      className={`absolute inset-x-0 bottom-1.5 h-0.5 origin-left bg-[var(--fg)] transition-transform duration-200 ${
                        activeTag === f ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </ScrollableChipRow>
          </div>
        </div>

        <div className="mt-8 flex gap-10">
          {/* Desktop filter rail */}
          <aside className="hidden w-56 flex-shrink-0 lg:block">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="mb-6 w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--fg)]"
            />

            {categoryFilters.length > 2 && (
              <FilterGroup title="Category">
                <div className="space-y-1.5">
                  {categoryFilters.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveCategory(c)}
                      className={`block w-full text-left text-sm transition ${
                        activeCategory === c
                          ? 'font-semibold text-[var(--fg)]'
                          : 'text-[var(--muted)] hover:text-[var(--fg)]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </FilterGroup>
            )}

            {availableSizes.length > 0 && (
              <FilterGroup title="Size">
                <div className="flex flex-wrap gap-1.5">
                  {['All', ...availableSizes].map((s) => (
                    <button
                      key={s}
                      onClick={() => setActiveSize(s)}
                      className={`min-w-[34px] border px-2 py-1 text-xs transition ${
                        activeSize === s
                          ? 'border-[var(--fg)] bg-[var(--accent)] text-[var(--accent-fg)]'
                          : 'border-[var(--border)] hover:border-[var(--fg)]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </FilterGroup>
            )}

            <FilterGroup title="Price">
              <div className="flex items-center gap-2">
                <input
                  inputMode="numeric"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Min"
                  className="w-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs outline-none focus:border-[var(--fg)]"
                />
                <span className="text-xs text-[var(--muted)]">–</span>
                <input
                  inputMode="numeric"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Max"
                  className="w-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs outline-none focus:border-[var(--fg)]"
                />
              </div>
            </FilterGroup>
          </aside>

          <div className="min-w-0 flex-1">
            {/* Compact controls for narrow screens, where the rail is hidden. */}
            <div className="mb-5 flex flex-wrap items-center gap-2 lg:hidden">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="min-w-[140px] flex-1 border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none"
              />
              <PriceFilter
                minPrice={minPrice}
                maxPrice={maxPrice}
                onApply={(min, max) => {
                  setMinPrice(min);
                  setMaxPrice(max);
                }}
              />
              {availableSizes.length > 0 && (
                <SizeFilter sizes={availableSizes} activeSize={activeSize} onChange={setActiveSize} />
              )}
            </div>


            <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <p className="text-xs text-[var(--muted)]">
                {visible.length} product{visible.length === 1 ? '' : 's'}
              </p>
              <SortFilter sort={sort} onChange={setSort} />
            </div>

            {visible.length === 0 ? (
              <p className="py-20 text-center text-sm text-[var(--muted)]">
                {search.trim() || minPrice !== '' || maxPrice !== '' || activeSize !== 'All'
                  ? 'No products match your filters.'
                  : activeCategory !== 'All'
                    ? `No products available in "${activeCategory}" yet. Check back soon!`
                    : 'No products available yet.'}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
                  {shown.map((shoe) => (
                    <ProductCard key={shoe.id} shoe={shoe} />
                  ))}
                </div>

                {visibleCount < visible.length && (
                  <div className="mt-12 flex justify-center">
                    <button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className="btn-glow border border-[var(--fg)] px-8 py-3 text-xs font-semibold uppercase tracking-wide transition hover:bg-[var(--accent)] hover:text-[var(--accent-fg)]"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

/** Titled block in the desktop filter rail. */
function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 border-t border-[var(--border)] pt-4">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-widest">{title}</p>
      {children}
    </div>
  );
}
