'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadToCloudinary } from '@/lib/uploadToCloudinary';
import { useToast } from '@/store/useToast';
import MultiSelectDropdown from './MultiSelectDropdown';
import SingleSelectDropdown from './SingleSelectDropdown';
import type { Category, Shoe, Tag } from '@/lib/types';

interface Props {
  productId?: string;
  initial?: Shoe;
  categoryOptions: Category[];
  tagOptions: Tag[];
}

export default function ProductForm({ productId, initial, categoryOptions, tagOptions }: Props) {
  const router = useRouter();
  const notify = useToast((s) => s.show);
  const fileInput = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? '');
  const [tagline, setTagline] = useState(initial?.tagline ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial?.price?.toString() ?? '');
  const [stock, setStock] = useState(initial?.stock?.toString() ?? '');
  const [category, setCategory] = useState(initial?.category ?? categoryOptions[0] ?? '');
  const [tags, setTags] = useState<Tag[]>(initial?.tags ?? []);
  const [colors, setColors] = useState(initial?.colors ?? [{ name: '', hex: '#3b82ff' }]);
  const [sizesText, setSizesText] = useState(initial?.sizes?.join(', ') ?? '');
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [spinImages, setSpinImages] = useState<string[]>(initial?.spinImages ?? []);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const spinFileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingSpin, setUploadingSpin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Images already saved on the product shouldn't be deleted from storage
  // just because the admin clicked "remove" — only once the edit is actually
  // saved (the PATCH route diffs old vs new and cleans those up). Freshly
  // uploaded-this-session images aren't referenced anywhere yet, so removing
  // them can delete the blob immediately instead of leaving it an orphan.
  const initialUrlsRef = useRef(new Set([...(initial?.images ?? []), ...(initial?.spinImages ?? [])]));

  const deleteIfUnsaved = (url: string) => {
    if (initialUrlsRef.current.has(url)) return;
    fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    }).catch(() => {});
  };

  const updateColor = (i: number, field: 'name' | 'hex', value: string) =>
    setColors((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));

  const addColor = () => setColors((prev) => [...prev, { name: '', hex: '#000000' }]);
  const removeColor = (i: number) => setColors((prev) => prev.filter((_, idx) => idx !== i));

  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((f) => uploadToCloudinary(f, '/api/upload'))
      );
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Upload failed');
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = '';
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((u) => u !== url));
    deleteIfUnsaved(url);
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const onSpinFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingSpin(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((f) => uploadToCloudinary(f, '/api/upload'))
      );
      setSpinImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Upload failed');
    }
    setUploadingSpin(false);
    if (spinFileInput.current) spinFileInput.current.value = '';
  };

  const removeSpinImage = (url: string) => {
    setSpinImages((prev) => prev.filter((u) => u !== url));
    deleteIfUnsaved(url);
  };

  const moveSpinImage = (index: number, direction: -1 | 1) => {
    setSpinImages((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const sizes = sizesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const validColors = colors.filter((c) => c.name.trim());

    if (!category) return setError('Select a category');
    if (validColors.length === 0) return setError('Add at least one color');
    if (sizes.length === 0) return setError('Add at least one size');
    if (images.length === 0) return setError('Upload at least one image');

    setSaving(true);
    const payload = {
      name,
      tagline,
      description,
      price: Number(price),
      stock: Number(stock),
      category,
      tags,
      colors: validColors,
      sizes,
      images,
      spinImages,
      isActive
    };

    const res = await fetch(productId ? `/api/products/${productId}` : '/api/products', {
      method: productId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? 'Could not save product');
      return;
    }

    notify(productId ? 'Product updated' : 'Product created');
    router.push('/admin/products');
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="glass max-w-3xl space-y-6 rounded-2xl p-6 sm:p-8">
      {error && <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium opacity-80">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium opacity-80">Tagline</label>
          <input
            required
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium opacity-80">Description</label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium opacity-80">Price (Rs.)</label>
          <input
            required
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium opacity-80">Stock</label>
          <input
            required
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
          />
          {Number(stock) <= 0 && stock !== '' && (
            <p className="mt-1 text-xs text-red-400">
              Stock is 0 — this product will show as &quot;Out of stock&quot; on the storefront.
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm">
            <span className="font-medium">Active</span>
            <span className="ml-2 opacity-60">
              Inactive products are hidden from the storefront but kept here so you can
              reactivate them later instead of deleting and re-uploading.
            </span>
          </span>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium opacity-80">Category</label>
          {categoryOptions.length === 0 ? (
            <p className="rounded-xl bg-white/5 px-4 py-2.5 text-sm opacity-60">
              No categories yet — add one from the Categories page first.
            </p>
          ) : (
            <SingleSelectDropdown
              options={categoryOptions}
              selected={category}
              onChange={setCategory}
              placeholder="Select a category"
            />
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium opacity-80">Tags</label>
          <MultiSelectDropdown
            options={tagOptions}
            selected={tags}
            onChange={setTags}
            placeholder="Select tags"
            emptyMessage="No tags yet — add one from the Tags page first."
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium opacity-80">Colors</p>
        <div className="space-y-2">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={c.hex}
                onChange={(e) => updateColor(i, 'hex', e.target.value)}
                className="h-10 w-10 rounded-lg bg-transparent"
              />
              <input
                placeholder="Color name"
                value={c.name}
                onChange={(e) => updateColor(i, 'name', e.target.value)}
                className="flex-1 rounded-xl bg-white/5 px-4 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-white/30"
              />
              <button
                type="button"
                onClick={() => removeColor(i)}
                className="px-2 text-sm text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addColor}
          className="mt-2 text-sm font-medium text-neon-blue hover:underline"
        >
          + Add color
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium opacity-80">
          Sizes (comma-separated — numbers like 40, 41, 42 or text like S, M, L, XL)
        </label>
        <input
          required
          value={sizesText}
          onChange={(e) => setSizesText(e.target.value)}
          placeholder="e.g. 40, 41, 42 or S, M, L, XL"
          className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium opacity-80">Images</p>
        {images.length > 0 && (
          <div className="mb-1 text-xs opacity-50">
            First image is the product cover. Use the arrows to reorder.
          </div>
        )}
        {images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] text-white">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
                >
                  ✕
                </button>
                <div className="absolute inset-x-0 bottom-1 flex justify-center gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => moveImage(i, -1)}
                    disabled={i === 0}
                    className="rounded-full bg-black/60 px-1.5 text-xs text-white disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(i, 1)}
                    disabled={i === images.length - 1}
                    className="rounded-full bg-black/60 px-1.5 text-xs text-white disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <input
          ref={fileInput}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={onFilesSelected}
          disabled={uploading}
          className="text-sm"
        />
        {uploading && <p className="mt-1 text-xs opacity-60">Uploading…</p>}
      </div>

      <div>
        <p className="mb-1 text-sm font-medium opacity-80">360° Spin Photos (optional)</p>
        <p className="mb-2 text-xs opacity-50">
          Place the shoe on a turntable and upload 16–36 photos in rotation order — customers can
          then drag to spin it in 3D. Skip this if you only have regular photos.
        </p>
        {spinImages.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {spinImages.map((url, i) => (
              <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] text-white">
                  {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeSpinImage(url)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
                >
                  ✕
                </button>
                <div className="absolute inset-x-0 bottom-1 flex justify-center gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => moveSpinImage(i, -1)}
                    disabled={i === 0}
                    className="rounded-full bg-black/60 px-1.5 text-xs text-white disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSpinImage(i, 1)}
                    disabled={i === spinImages.length - 1}
                    className="rounded-full bg-black/60 px-1.5 text-xs text-white disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <input
          ref={spinFileInput}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={onSpinFilesSelected}
          disabled={uploadingSpin}
          className="text-sm"
        />
        {uploadingSpin && <p className="mt-1 text-xs opacity-60">Uploading…</p>}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="btn-glow w-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-semibold text-white disabled:opacity-50"
      >
        {saving ? 'Saving…' : productId ? 'Save Changes' : 'Create Product'}
      </button>
    </form>
  );
}
