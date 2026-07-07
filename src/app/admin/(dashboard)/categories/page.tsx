import LabelManager from '@/components/admin/LabelManager';
import { prisma } from '@/lib/db';

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-black sm:text-3xl">Product Categories</h1>
      <p className="mb-6 text-sm opacity-60">
        The product types shown in the Shop dropdown — e.g. Shoes, Clothes, Watches. Each
        product belongs to exactly one.
      </p>
      <LabelManager items={categories} apiPath="categories" noun="category" placeholder="e.g. Watches" />
    </div>
  );
}
