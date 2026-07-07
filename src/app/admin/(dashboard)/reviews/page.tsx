import AdminReviewsTable from '@/components/admin/AdminReviewsTable';
import { getAllReviews } from '@/lib/reviews';

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black sm:text-3xl">Reviews & Comments</h1>
        <p className="mt-1 text-sm opacity-60">
          Moderate customer reviews — remove spam, fake, or inappropriate comments.
        </p>
      </div>

      <div className="glass rounded-2xl p-6">
        <AdminReviewsTable reviews={reviews} />
      </div>
    </div>
  );
}
