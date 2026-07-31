'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadToCloudinary } from '@/lib/uploadToCloudinary';
import { useToast } from '@/store/useToast';
import { StarIcon, XIcon } from './icons';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string | Date;
}

function Stars({
  value,
  onChange,
  size = 18
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <StarIcon
            filled={n <= value}
            size={size}
            className={n <= value ? 'text-amber-400' : 'text-white/20'}
          />
        </button>
      ))}
    </div>
  );
}

/** First letters of up to the first two words of a name, for the review avatar. */
function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
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
  const [rating, setRating] = useState(0);
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
        Array.from(files).map((f) => uploadToCloudinary(f, '/api/reviews/upload'))
      );
      setImages((prev) => [...prev, ...uploaded]);
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
    if (rating === 0) {
      setError('Please select a rating');
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
    setRating(0);
    setImages([]);
    notify('Thanks for your review!');
    router.refresh();
  };

  return (
    <section id="reviews" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-20 pt-16 sm:px-6">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black sm:text-3xl">
              Reviews <span className="neon-text">& Comments</span>
            </h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <Stars value={Math.round(average)} size={16} />
                <span className="text-sm opacity-70">
                  {average.toFixed(1)} ({reviews.length} review{reviews.length === 1 ? '' : 's'})
                </span>
              </div>
            )}
          </div>

          {reviews.length > 1 && (
            <div className="mt-4 max-w-xs space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                const pct = (count / reviews.length) * 100;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-8 shrink-0 opacity-60">{star} star</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-4 shrink-0 text-right opacity-50">{count}</span>
                  </div>
                );
              })}
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
                      className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <XIcon size={12} />
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

        <div className="divide-y divide-white/10">
          {reviews.length === 0 && (
            <p className="text-center text-sm opacity-60">
              No reviews yet. Be the first to share your thoughts.
            </p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-3 py-5 first:pt-0 last:pb-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple text-sm font-bold text-white">
                {initials(r.customerName)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{r.customerName}</p>
                  <span className="text-xs opacity-50">
                    {new Date(r.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <Stars value={r.rating} size={14} />
                <p className="mt-1 whitespace-pre-line text-sm opacity-80">{r.comment}</p>
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
