'use client';

import { useState } from 'react';

export default function Pagination({
  page,
  totalPages,
  onChange
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const [goTo, setGoTo] = useState('');

  if (totalPages <= 1) return null;

  const submitGoTo = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(goTo);
    if (Number.isInteger(n) && n >= 1 && n <= totalPages) {
      onChange(n);
      setGoTo('');
    }
  };

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
      <p className="text-xs opacity-60">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="rounded-full px-3 py-1.5 text-xs font-medium glass disabled:opacity-30"
        >
          Previous
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-full px-3 py-1.5 text-xs font-medium glass disabled:opacity-30"
        >
          Next
        </button>
        <form onSubmit={submitGoTo} className="flex items-center gap-1.5">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={goTo}
            onChange={(e) => setGoTo(e.target.value)}
            placeholder="Go to"
            className="w-20 rounded-full bg-white/5 px-3 py-1.5 text-xs outline-none ring-1 ring-white/10 focus:ring-white/30"
          />
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-3 py-1.5 text-xs font-medium text-white"
          >
            Go
          </button>
        </form>
      </div>
    </div>
  );
}
