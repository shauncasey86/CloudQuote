import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';
import { QuoteEditor } from '@/components/quotes/QuoteEditor';

export default async function NewQuotePage() {
  await requireAuth();

  // Fetch all necessary data
  const [products, categories, houseTypes] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    }),
    prisma.productCategory.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.houseType.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="animate-fadeUp">
        <h1 className="text-4xl font-bold text-gradient-nebula mb-2">
          New Quote
        </h1>
        <p className="text-text-secondary text-base">
          Create a new kitchen installation quote
        </p>
      </div>

      <div className="animate-fadeUp-delay-1">
        <QuoteEditor
          products={products}
          categories={categories}
          houseTypes={houseTypes}
        />
      </div>
    </div>
  );
}
