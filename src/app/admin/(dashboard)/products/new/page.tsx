import ProductForm from '@/components/admin/ProductForm';
import { getCategories } from '@/lib/categories';
import { getTags } from '@/lib/tags';

export default async function NewProductPage() {
  const [categoryOptions, tagOptions] = await Promise.all([getCategories(), getTags()]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black sm:text-3xl">Add Product</h1>
      <ProductForm categoryOptions={categoryOptions} tagOptions={tagOptions} />
    </div>
  );
}
