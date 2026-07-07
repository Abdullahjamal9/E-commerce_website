'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/store/useToast';

interface Row {
  id: string;
  name: string;
}

export default function LabelManager({
  items,
  apiPath,
  noun,
  placeholder
}: {
  items: Row[];
  /** e.g. "categories" or "tags" — matches the /api/<apiPath> route. */
  apiPath: string;
  /** Singular noun used in messages, e.g. "category" or "tag". */
  noun: string;
  placeholder: string;
}) {
  const router = useRouter();
  const notify = useToast((s) => s.show);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const res = await fetch(`/api/${apiPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      notify(data.error ?? `Could not add ${noun}`);
      return;
    }

    setName('');
    notify(`"${data.name}" added`);
    router.refresh();
  };

  const onDelete = async (id: string, itemName: string) => {
    if (
      !window.confirm(
        `Delete ${noun} "${itemName}"? Products already tagged with it will keep the label, but it won't be selectable anymore.`
      )
    ) {
      return;
    }
    setDeletingId(id);
    const res = await fetch(`/api/${apiPath}/${id}`, { method: 'DELETE' });
    setDeletingId(null);

    if (!res.ok) {
      notify(`Could not delete ${noun}`);
      return;
    }
    notify(`"${itemName}" deleted`);
    router.refresh();
  };

  return (
    <div className="glass max-w-xl rounded-2xl p-6 sm:p-8">
      <form onSubmit={onAdd} className="flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
        />
        <button
          type="submit"
          disabled={saving}
          className="btn-glow rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? 'Adding…' : '+ Add'}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {items.length === 0 && (
          <p className="py-6 text-center text-sm opacity-60">No {noun}s yet. Add your first one above.</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="glass flex items-center justify-between rounded-xl px-4 py-2.5">
            <span className="text-sm font-medium">{item.name}</span>
            <button
              onClick={() => onDelete(item.id, item.name)}
              disabled={deletingId === item.id}
              className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              {deletingId === item.id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
