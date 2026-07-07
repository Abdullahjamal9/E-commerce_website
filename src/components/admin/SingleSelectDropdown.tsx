'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function SingleSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = 'Select an option',
  emptyMessage = 'No options yet.'
}: {
  options: string[];
  selected: string;
  onChange: (next: string) => void;
  placeholder?: string;
  emptyMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const select = (name: string) => {
    onChange(name);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl bg-white/5 px-4 py-2.5 text-left outline-none ring-1 ring-white/10 focus:ring-white/30"
      >
        <span className={!selected ? 'opacity-50' : ''}>{selected || placeholder}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="panel-solid absolute left-0 top-full z-20 mt-2 w-full overflow-hidden rounded-xl p-2 shadow-glow"
          >
            {options.length === 0 ? (
              <p className="px-3 py-2 text-sm opacity-60">{emptyMessage}</p>
            ) : (
              options.map((name) => (
                <label
                  key={name}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-white/10"
                >
                  <input
                    type="radio"
                    checked={selected === name}
                    onChange={() => select(name)}
                    className="h-4 w-4"
                  />
                  {name}
                </label>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
