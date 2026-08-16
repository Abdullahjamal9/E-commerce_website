'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import ScrollableChipRow from './ScrollableChipRow';
import type { Category, Shoe, Tag } from '@/lib/types';
import { collectionCopy, collectionLabel } from '@/lib/collectionCopy';
import { inStockFirst } from '@/lib/stockSort';

type Sort = 'newest' | 'price-asc' | 'price-desc';

const TEXT_SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'XXXL'];
const PAGE_SIZE = 24;
/** Discount bands offered in the filter — each tier covers up to (but not
 *  including) the next one, e.g. "10%+" means 10–19%, not 10% and up. */
const DISCOUNT_TIERS = [10, 20, 30, 40, 50];

function inDiscountTier(discountPercent: number, tier: number): boolean {
  const next = DISCOUNT_TIERS[DISCOUNT_TIERS.indexOf(tier) + 1];
  return next === undefined ? discountPercent >= tier : discountPercent >= tier && discountPercent < next;
}

/** How many cards were showing for a given category/tag/audience combo —
 * remembered across a visit to a product page and back, so "Load more"
 * doesn't collapse back to one page every time the back button is used. */
function visibleCountKey(category: string, tag: string, audience?: string) {
  return `shop-visible:${audience ?? ''}|${category}|${tag}`;
}

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
        <span>Sort by</span>
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

/** Two-thumb slider sharing one track — plain overlapping range inputs, the
 *  standard way to build a dual-handle slider without a component library. */
function PriceRangeSlider({
  bounds,
  min,
  max,
  onChange
}: {
  bounds: [number, number];
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) {
  const [lo, hi] = bounds;
  const span = Math.max(hi - lo, 1);
  const pctMin = ((min - lo) / span) * 100;
  const pctMax = ((max - lo) / span) * 100;

  // Free-typed text so a user can clear the box and type a fresh number
  // without the value snapping back to a clamped one on every keystroke;
  // it's only clamped into the slider range once they're done editing.
  const [minText, setMinText] = useState(String(min));
  const [maxText, setMaxText] = useState(String(max));

  // Marks which box last drove a change, so the sync-back effects below
  // don't immediately overwrite an emptied box with its reset numeric value
  // (e.g. "0") — only a slider drag should push a value into the text box.
  const lastEditRef = useRef<'min' | 'max' | null>(null);

  useEffect(() => {
    if (lastEditRef.current === 'min') {
      lastEditRef.current = null;
      return;
    }
    setMinText(String(min));
  }, [min]);

  useEffect(() => {
    if (lastEditRef.current === 'max') {
      lastEditRef.current = null;
      return;
    }
    setMaxText(String(max));
  }, [max]);

  // Only clamped to the overall bounds, not against the opposite handle —
  // so the slider can reposition live on every keystroke instead of only
  // once the box loses focus. An emptied box resets its handle back to the
  // default end of the range rather than freezing at the last value.
  const commitMin = (raw: string) => {
    lastEditRef.current = 'min';
    if (raw === '') {
      onChange(lo, max);
      return;
    }
    const n = Number(raw);
    onChange(Math.min(Math.max(n, lo), hi), max);
  };
  const commitMax = (raw: string) => {
    lastEditRef.current = 'max';
    if (raw === '') {
      onChange(min, hi);
      return;
    }
    const n = Number(raw);
    onChange(min, Math.max(Math.min(n, hi), lo));
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-medium">
        <span>Rs. {min.toLocaleString()}</span>
        <span>Rs. {max.toLocaleString()}</span>
      </div>
      <div className="relative h-6">
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--surface-alt)]" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--fg)]"
          style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
        />
        <input
          type="range"
          min={lo}
          max={hi}
          value={min}
          onChange={(e) => onChange(Math.min(Number(e.target.value), max), max)}
          className="range-thumb pointer-events-none absolute inset-x-0 top-1/2 h-1 w-full -translate-y-1/2 appearance-none bg-transparent"
          style={{ zIndex: min > hi - span * 0.1 ? 5 : 3 }}
        />
        <input
          type="range"
          min={lo}
          max={hi}
          value={max}
          onChange={(e) => onChange(min, Math.max(Number(e.target.value), min))}
          className="range-thumb pointer-events-none absolute inset-x-0 top-1/2 h-1 w-full -translate-y-1/2 appearance-none bg-transparent"
          style={{ zIndex: 4 }}
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          inputMode="numeric"
          value={minText}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^0-9]/g, '');
            setMinText(digits);
            commitMin(digits);
          }}
          onBlur={(e) => commitMin(e.target.value)}
          placeholder="Min"
          className="w-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs outline-none focus:border-[var(--fg)]"
        />
        <span className="text-xs text-[var(--muted)]">–</span>
        <input
          inputMode="numeric"
          value={maxText}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^0-9]/g, '');
            setMaxText(digits);
            commitMax(digits);
          }}
          onBlur={(e) => commitMax(e.target.value)}
          placeholder="Max"
          className="w-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs outline-none focus:border-[var(--fg)]"
        />
      </div>
    </div>
  );
}

/** Titled block inside the filter panel. */
function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--border)] py-5 first:pt-0 last:border-b-0">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">{title}</p>
      {children}
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
        active
          ? 'border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]'
          : 'border-[var(--border)] text-[var(--fg)] hover:border-[var(--fg)]'
      }`}
    >
      {children}
    </button>
  );
}

/** Square box for a single size value — distinct from the pill-shaped style
 *  chips so sizes read as a grid of options rather than another tag. */
function SizeBox({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 min-w-[40px] items-center justify-center border px-2 text-sm transition ${
        active
          ? 'border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]'
          : 'border-[var(--border)] text-[var(--fg)] hover:border-[var(--fg)]'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Full filter drawer — slides in from the left. Full screen on mobile/tablet,
 * a 30%-width side panel on desktop. Edits are held in local draft state so
 * Cancel discards them and Apply commits them all at once, matching a
 * standard commerce filter tray.
 */
function FilterPanel({
  open,
  onClose,
  categoryFilters,
  tagFilters,
  productsInScope,
  priceBounds,
  category,
  tag,
  size,
  discount,
  search,
  minPrice,
  maxPrice,
  onApply
}: {
  open: boolean;
  onClose: () => void;
  categoryFilters: (Category | 'All')[];
  tagFilters: (Tag | 'All')[];
  /** Audience-filtered but otherwise unfiltered products, so sizes can be
   *  recomputed live as the draft category/tag change inside the panel. */
  productsInScope: Shoe[];
  priceBounds: [number, number];
  category: Category | 'All';
  tag: Tag | 'All';
  size: string | 'All';
  discount: string | 'All';
  search: string;
  minPrice: string;
  maxPrice: string;
  onApply: (v: {
    category: Category | 'All';
    tag: Tag | 'All';
    size: string | 'All';
    discount: string | 'All';
    search: string;
    minPrice: string;
    maxPrice: string;
  }) => void;
}) {
  const [draftCategory, setDraftCategory] = useState(category);
  const [draftTag, setDraftTag] = useState(tag);
  const [draftSize, setDraftSize] = useState(size);
  const [draftDiscount, setDraftDiscount] = useState(discount);
  const [draftSearch, setDraftSearch] = useState(search);
  const [draftMin, setDraftMin] = useState(priceBounds[0]);
  const [draftMax, setDraftMax] = useState(priceBounds[1]);

  // Smart size list: narrows to whatever category/style combination is
  // currently picked, so sizes show up the moment that combination actually
  // has sized products — a style tag alone (with category left on "All")
  // is enough to surface them, not just an explicit category pick.
  const sizes = useMemo(() => {
    let list = productsInScope;
    if (draftCategory !== 'All') list = list.filter((p) => p.category === draftCategory);
    if (draftTag !== 'All') list = list.filter((p) => p.tags.includes(draftTag));
    return Array.from(new Set(list.flatMap((p) => p.sizes))).sort(compareSizes);
  }, [productsInScope, draftCategory, draftTag]);

  // Discount tiers ("10% or more off" etc.) — only offered up to whatever
  // the highest live discount in this category/style actually is.
  const discountTiers = useMemo(() => {
    let list = productsInScope;
    if (draftCategory !== 'All') list = list.filter((p) => p.category === draftCategory);
    if (draftTag !== 'All') list = list.filter((p) => p.tags.includes(draftTag));
    const maxDiscount = Math.max(0, ...list.map((p) => p.discountPercent));
    return DISCOUNT_TIERS.filter((t) => t <= maxDiscount);
  }, [productsInScope, draftCategory, draftTag]);

  // A size/discount chosen under one category/style may not exist under
  // another — clear both whenever the user actually changes either (not
  // when the panel is merely re-seeding drafts on open).
  const selectCategory = (c: Category | 'All') => {
    setDraftCategory(c);
    setDraftSize('All');
    setDraftDiscount('All');
  };
  const selectTag = (t: Tag | 'All') => {
    setDraftTag(t);
    setDraftSize('All');
    setDraftDiscount('All');
  };

  // Re-seed the draft from committed values every time the panel opens,
  // so a Cancel on a previous open never bleeds into the next one.
  useEffect(() => {
    if (!open) return;
    setDraftCategory(category);
    setDraftTag(tag);
    setDraftSize(size);
    setDraftDiscount(discount);
    setDraftSearch(search);
    setDraftMin(minPrice === '' ? priceBounds[0] : Number(minPrice));
    setDraftMax(maxPrice === '' ? priceBounds[1] : Number(maxPrice));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Resets everything except the Shop by Style pick — a style/tag choice is
  // treated as "browsing this collection", not a narrowing filter, so it
  // survives a clear the same way the category tab strip above the grid does.
  const clearFilters = () => {
    setDraftCategory('All');
    setDraftSize('All');
    setDraftDiscount('All');
    setDraftSearch('');
    setDraftMin(priceBounds[0]);
    setDraftMax(priceBounds[1]);
  };

  const apply = () => {
    onApply({
      category: draftCategory,
      tag: draftTag,
      size: draftSize,
      discount: draftDiscount,
      search: draftSearch,
      minPrice: draftMin <= priceBounds[0] ? '' : String(draftMin),
      maxPrice: draftMax >= priceBounds[1] ? '' : String(draftMax)
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[65] bg-black/50"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            // Lenis's global smooth-scroll (SmoothScroll.tsx) captures wheel
            // input for the page regardless of what's under the cursor by
            // default — this opts the drawer out, so scrolling over it moves
            // its own content instead of the shop grid behind it.
            data-lenis-prevent
            className="fixed inset-y-0 left-0 z-[70] flex h-full w-full flex-col bg-[var(--surface)] shadow-glow lg:w-[30%]"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-base font-bold uppercase tracking-wide">Filters</h2>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] transition hover:text-[var(--fg)]"
                >
                  Clear
                </button>
                <button type="button" onClick={onClose} aria-label="Close filters" className="p-1 opacity-70 transition hover:opacity-100">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="5" x2="19" y2="19" />
                    <line x1="19" y1="5" x2="5" y2="19" />
                  </svg>
                </button>
              </div>
            </div>

            {/* overscroll-contain — without it, once this reaches its own
                scroll limit (or has no overflow to begin with, the common
                case with few filters active) the leftover wheel delta
                chains through to the shop grid behind the drawer. */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5">
              <div className="border-b border-[var(--border)] py-5">
                <input
                  value={draftSearch}
                  onChange={(e) => setDraftSearch(e.target.value)}
                  placeholder="Search products…"
                  className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--fg)]"
                />
              </div>

              {categoryFilters.length > 2 && (
                <PanelSection title="Category">
                  <div className="flex flex-wrap gap-2">
                    {categoryFilters.map((c) => (
                      <ChipButton key={c} active={draftCategory === c} onClick={() => selectCategory(c)}>
                        {c}
                      </ChipButton>
                    ))}
                  </div>
                </PanelSection>
              )}

              <PanelSection title="Price">
                <PriceRangeSlider
                  bounds={priceBounds}
                  min={draftMin}
                  max={draftMax}
                  onChange={(mn, mx) => {
                    setDraftMin(mn);
                    setDraftMax(mx);
                  }}
                />
              </PanelSection>

              {discountTiers.length > 0 && (
                <PanelSection title="Discount">
                  <div className="flex flex-wrap gap-2">
                    <SizeBox active={draftDiscount === 'All'} onClick={() => setDraftDiscount('All')}>
                      All
                    </SizeBox>
                    {discountTiers.map((t) => (
                      <SizeBox key={t} active={draftDiscount === String(t)} onClick={() => setDraftDiscount(String(t))}>
                        {t}%+
                      </SizeBox>
                    ))}
                  </div>
                </PanelSection>
              )}

              <PanelSection title="Shop by Style">
                <div className="flex flex-wrap gap-2">
                  {tagFilters.map((f) => (
                    <ChipButton key={f} active={draftTag === f} onClick={() => selectTag(f)}>
                      {f}
                    </ChipButton>
                  ))}
                </div>

                {sizes.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Size</p>
                    <div className="flex flex-wrap gap-2">
                      <SizeBox active={draftSize === 'All'} onClick={() => setDraftSize('All')}>
                        All
                      </SizeBox>
                      {sizes.map((s) => (
                        <SizeBox key={s} active={draftSize === s} onClick={() => setDraftSize(s)}>
                          {s}
                        </SizeBox>
                      ))}
                    </div>
                  </div>
                )}
              </PanelSection>
            </div>

            <div className="flex gap-3 border-t border-[var(--border)] px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-[var(--border)] py-3 text-sm font-semibold uppercase tracking-wide transition hover:border-[var(--fg)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={apply}
                className="flex-1 rounded-full bg-black py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:opacity-90"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
  const [activeDiscount, setActiveDiscount] = useState<string | 'All'>('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<Sort>('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [filterOpen, setFilterOpen] = useState(false);

  // Slider bounds come from the full catalogue in scope, not the
  // currently-filtered list — otherwise the range would shrink as filters
  // are applied and the handles would jump around.
  const priceBounds = useMemo<[number, number]>(() => {
    if (products.length === 0) return [0, 0];
    const prices = products.map((p) => p.price);
    return [0, Math.max(...prices)];
  }, [products]);

  // Restored after mount, not in useState's initializer — sessionStorage
  // isn't available during the server render, and reading it synchronously
  // there would make the client's first pass disagree with the server's
  // markup (a hydration mismatch) whenever a count had been saved before.
  useEffect(() => {
    const raw = window.sessionStorage.getItem(
      visibleCountKey(category ?? 'All', initialTag ?? 'All', audience)
    );
    const n = raw ? Number(raw) : NaN;
    if (Number.isFinite(n) && n > PAGE_SIZE) setVisibleCount(n);
    // Only on mount — this seeds the initial count from the last visit,
    // it isn't meant to re-run as category/tag state changes afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the count that's actually visible for the current filter combo
  // saved, so coming back from a product page restores it instead of
  // collapsing to the first page. Skipping the default avoids a React
  // Strict Mode dev quirk: its mount→cleanup→remount cycle runs this effect
  // with the pre-restore PAGE_SIZE value in between, which would otherwise
  // clobber a larger count the restore effect above hasn't applied yet.
  useEffect(() => {
    if (visibleCount <= PAGE_SIZE) return;
    window.sessionStorage.setItem(
      visibleCountKey(activeCategory, activeTag, audience),
      String(visibleCount)
    );
  }, [visibleCount, activeCategory, activeTag, audience]);

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

  // Smart size list: narrows to whatever category/style tag is active, so
  // sizes surface as soon as that combination actually has sized products —
  // picking a style tag (e.g. a shoe-only tag) is enough on its own, without
  // requiring the category filter to be set too.
  const availableSizes = useMemo(() => {
    const list = activeTag === 'All' ? inCategory : inCategory.filter((p) => p.tags.includes(activeTag));
    return Array.from(new Set(list.flatMap((p) => p.sizes))).sort(compareSizes);
  }, [inCategory, activeTag]);

  // A size chosen under one category/style may not exist under another, so
  // drop it rather than leaving a filter that silently hides everything.
  useEffect(() => {
    if (activeSize !== 'All' && !availableSizes.includes(activeSize)) setActiveSize('All');
  }, [availableSizes, activeSize]);

  // Same idea for discount tiers: only offer bands that actually exist for
  // the current category/style, and drop a now-invalid pick automatically.
  const availableDiscountTiers = useMemo(() => {
    const list = activeTag === 'All' ? inCategory : inCategory.filter((p) => p.tags.includes(activeTag));
    const maxDiscount = Math.max(0, ...list.map((p) => p.discountPercent));
    return DISCOUNT_TIERS.filter((t) => t <= maxDiscount);
  }, [inCategory, activeTag]);

  useEffect(() => {
    if (activeDiscount !== 'All' && !availableDiscountTiers.includes(Number(activeDiscount))) {
      setActiveDiscount('All');
    }
  }, [availableDiscountTiers, activeDiscount]);

  const visible = useMemo(() => {
    let list = activeTag === 'All' ? inCategory : inCategory.filter((p) => p.tags.includes(activeTag));

    if (activeSize !== 'All') list = list.filter((p) => p.sizes.includes(activeSize));
    if (activeDiscount !== 'All') list = list.filter((p) => inDiscountTier(p.discountPercent, Number(activeDiscount)));

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

    // Re-applied after the price sorts, which would otherwise scatter sold-out
    // pairs back through the grid. The server already ordered them this way;
    // this keeps it true once the shopper re-sorts client-side.
    return inStockFirst(list);
  }, [inCategory, activeTag, activeSize, activeDiscount, search, sort, minPrice, maxPrice]);

  // Reset how many cards are rendered whenever the filter criteria actually
  // change, so switching category/tag/search doesn't leave a stale "Load
  // more" position. Compares against the previous signature rather than a
  // one-shot "did this already run" flag — a boolean flag breaks under
  // React Strict Mode's dev-only double-invoke (the flag survives from the
  // first pass, so the second pass sees it already set and fires a reset
  // that stomps the count sessionStorage just restored on mount).
  const filterSignatureRef = useRef<string | null>(null);
  useEffect(() => {
    const signature = JSON.stringify([
      activeCategory,
      activeTag,
      activeSize,
      activeDiscount,
      search,
      sort,
      minPrice,
      maxPrice
    ]);
    if (filterSignatureRef.current !== null && filterSignatureRef.current !== signature) {
      setVisibleCount(PAGE_SIZE);
    }
    filterSignatureRef.current = signature;
  }, [activeCategory, activeTag, activeSize, activeDiscount, search, sort, minPrice, maxPrice]);

  const shown = visible.slice(0, visibleCount);

  const activeFiltersCount = [
    activeCategory !== 'All',
    activeSize !== 'All',
    activeDiscount !== 'All',
    search.trim() !== '',
    minPrice !== '' || maxPrice !== ''
  ].filter(Boolean).length;

  // The tag is what actually narrows this grid — there's only one category —
  // so it leads the heading. Without this, /shop?tag=Running announced itself
  // as "All Products" while showing nothing but running shoes, which misreads
  // to a shopper and hands search engines the wrong h1 for the page.
  const scope =
    activeTag !== 'All'
      ? collectionLabel(activeTag)
      : activeCategory === 'All'
        ? 'All Products'
        : activeCategory;
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
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          {collectionCopy(activeTag === 'All' ? null : activeTag, storeName)}
        </p>

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

        <div className="mt-8">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                aria-label="Open filters"
                className={`glass relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition ${
                  activeFiltersCount > 0 ? 'ring-1 ring-neon-blue' : ''
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <circle cx="9" cy="7" r="2" fill="var(--surface)" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                  <circle cx="15" cy="17" r="2" fill="var(--surface)" />
                </svg>
                <span>Filter</span>
                {activeFiltersCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-neon-blue" />}
              </button>
              <p className="text-xs text-[var(--muted)]">
                {visible.length} product{visible.length === 1 ? '' : 's'}
              </p>
            </div>
            <SortFilter sort={sort} onChange={setSort} />
          </div>

          <FilterPanel
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            categoryFilters={categoryFilters}
            tagFilters={tagFilters}
            productsInScope={inAudience}
            priceBounds={priceBounds}
            category={activeCategory}
            tag={activeTag}
            size={activeSize}
            discount={activeDiscount}
            search={search}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onApply={(v) => {
              setActiveCategory(v.category);
              setActiveTag(v.tag);
              setActiveSize(v.size);
              setActiveDiscount(v.discount);
              setSearch(v.search);
              setMinPrice(v.minPrice);
              setMaxPrice(v.maxPrice);
            }}
          />

          {visible.length === 0 ? (
            <p className="py-20 text-center text-sm text-[var(--muted)]">
              {search.trim() || minPrice !== '' || maxPrice !== '' || activeSize !== 'All' || activeDiscount !== 'All'
                ? 'No products match your filters.'
                : activeCategory !== 'All'
                  ? `No products available in "${activeCategory}" yet. Check back soon!`
                  : 'No products available yet.'}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6">
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
      </section>
    </>
  );
}
