import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { QuoteViewer } from '@/components/quotes/QuoteViewer';

export default async function QuoteDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { edit?: string };
}) {
  await requireAuth();

  // Fetch quote with all related data
  const quote = await prisma.quote.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: { product: true },
        orderBy: { sortOrder: 'asc' },
      },
      additionalCosts: { orderBy: { sortOrder: 'asc' } },
      houseType: true,
      createdBy: { select: { name: true, email: true } },
      updatedBy: { select: { name: true, email: true } },
    },
  });

  if (!quote) {
    notFound();
  }

  // If in edit mode, fetch products and categories
  const isEditMode = searchParams.edit === 'true';
  let products, categories, houseTypes;

  if (isEditMode) {
    [products, categories, houseTypes] = await Promise.all([
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
  }

  return (
    <div className="space-y-6">
      <QuoteViewer
        quote={quote}
        products={products}
        categories={categories}
        houseTypes={houseTypes}
        isEditMode={isEditMode}
      />
    </div>
  );
}
