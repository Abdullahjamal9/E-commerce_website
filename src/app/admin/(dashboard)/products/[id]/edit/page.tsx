import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { getProductById } from '@/lib/products';
import { getCategories } from '@/lib/categories';
import { getTags } from '@/lib/tags';

// Nothing revalidates this path when a product is saved (the PATCH handler
// revalidates the list and storefront pages, not this one), so without this
// the form kept rendering a cached snapshot — most visibly after the image
// re-upload, where it still showed the old, since-deleted Blob URLs while
// the list page already had the new Cloudinary ones.
export const dynamic = 'force-dynamic';

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
