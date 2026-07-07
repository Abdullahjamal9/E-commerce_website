import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { getProductById } from '@/lib/products';
import { getCategories } from '@/lib/categories';
import { getTags } from '@/lib/tags';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categoryOptions, tagOptions] = await Promise.all([
    getProductById(params.id),
    getCategories(),
    getTags()
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black sm:text-3xl">Edit Product</h1>
      <ProductForm
        productId={product.id}
        initial={product}
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
      />
    </div>
  );
}
