import Link from 'next/link';
import AdminProductsTable from '@/components/admin/AdminProductsTable';
import AdminProductsFilters from '@/components/admin/AdminProductsFilters';
import { getProducts } from '@/lib/products';
import { getCategories } from '@/lib/categories';
import type { Category } from '@/lib/types';

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: { search?: string; category?: string; status?: string; stock?: string };
}) {
  const categoryOptions = await getCategories();
  const category = categoryOptions.includes(searchParams.category as Category)
    ? (searchParams.category as Category)
    : undefined;

  let products = await getProducts({ category, search: searchParams.search });

  if (searchParams.status === 'active') products = products.filter((p) => p.isActive);
  if (searchParams.status === 'inactive') products = products.filter((p) => !p.isActive);
  if (searchParams.stock === 'in') products = products.filter((p) => p.stock > 0);
  if (searchParams.stock === 'out') products = products.filter((p) => p.stock <= 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black sm:text-3xl">Products</h1>
        <Link
          href="/admin/products/new"
          className="btn-glow rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-5 py-2.5 text-sm font-semibold text-white"
        >
          + Add Product
        </Link>
      </div>

      <div className="glass rounded-2xl p-6">
        <AdminProductsFilters categoryOptions={categoryOptions} />
        <AdminProductsTable products={products} />
      </div>
    </div>
  );
}
