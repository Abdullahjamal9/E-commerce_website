'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { useToast } from '@/store/useToast';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string | Date;
}

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={`text-lg leading-none ${onChange ? 'cursor-pointer' : 'cursor-default'} ${
            n <= value ? 'text-amber-400' : 'text-white/20'
          }`}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({
  productId,
  reviews
}: {
  productId: string;
  reviews: Review[];
}) {
  const router = useRouter();
  const notify = useToast((s) => s.show);
  const fileInput = useRef<HTMLInputElement>(null);
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (images.length + files.length > 4) {
      notify('You can attach up to 4 images');
      if (fileInput.current) fileInput.current.value = '';
      return;
    }

    setUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((f) =>
          upload(`uploads/${f.name}`, f, { access: 'public', handleUploadUrl: '/api/reviews/upload' })
        )
      );
      setImages((prev) => [...prev, ...uploaded.map((b) => b.url)]);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Upload failed');
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = '';
  };

  const removeImage = (url: string) => setImages((prev) => prev.filter((u) => u !== url));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim() || !comment.trim()) {
      setError('Please add your name and a comment');
      return;
    }

    setSubmitting(true);
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: customerName.trim(),
        rating,
        comment: comment.trim(),
        images
      })
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? 'Could not submit review');
      return;
    }

    setCustomerName('');
    setComment('');
    setRating(5);
    setImages([]);
    notify('Thanks for your review!');
    router.refresh();
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black sm:text-3xl">
            Reviews <span className="neon-text">& Comments</span>
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <Stars value={Math.round(average)} />
              <span className="text-sm opacity-70">
                {average.toFixed(1)} ({reviews.length} review{reviews.length === 1 ? '' : 's'})
              </span>
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="mb-8 space-y-3 border-b border-white/10 pb-8">
          {error && <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>}
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name"
              className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm outline-none ring-1 ring-white/10 focus:ring-white/30"
            />
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 ring-1 ring-white/10">
              <span className="text-sm opacity-60">Your rating</span>
              <Stars value={rating} onChange={setRating} />
            </div>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this product…"
            rows={3}
            className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm outline-none ring-1 ring-white/10 focus:ring-white/30"
          />

          <div>
            {images.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {images.map((url) => (
                  <div key={url} className="group relative h-16 w-16 overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute right-0.5 top-0.5 rounded-full bg-black/60 px-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
                    >
                      ✕
                    </button>
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
              disabled={uploading || images.length >= 4}
              className="text-xs"
            />
            {uploading && <p className="mt-1 text-xs opacity-60">Uploading…</p>}
            <p className="mt-1 text-xs opacity-50">Optional · up to 4 photos</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-glow rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>

        <div className="space-y-5">
          {reviews.length === 0 && (
            <p className="text-center text-sm opacity-60">
              No reviews yet — be the first to share your thoughts.
            </p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{r.customerName}</p>
                  <span className="text-xs opacity-50">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Stars value={r.rating} />
                <p className="mt-1 text-sm opacity-80">{r.comment}</p>
                {r.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {r.images.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt=""
                          className="h-16 w-16 rounded-lg object-cover transition hover:opacity-80"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
