import LabelManager from '@/components/admin/LabelManager';
import { prisma } from '@/lib/db';

export default async function AdminTagsPage() {
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-black sm:text-3xl">Tags</h1>
      <p className="mb-6 text-sm opacity-60">
        Collection labels like Men, Women, Sports, Luxury, New Arrivals. A product can have
        several — these power the filter pills on the Shop and Collections pages.
      </p>
      <LabelManager items={tags} apiPath="tags" noun="tag" placeholder="e.g. Unisex" />
    </div>
  );
}
