import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/Card';
import { QuotesHeader } from '@/components/quotes/QuotesHeader';
import { QuotesTable } from '@/components/quotes/QuotesTable';
import { Pagination } from '@/components/ui/Pagination';

interface Props {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
  };
}

export default async function QuotesPage({ searchParams }: Props) {
  await requireAuth();

  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  // Build where clause for filtering
  const where: any = {
    status: { not: 'ARCHIVED' },
  };

  if (searchParams.status) {
    where.status = searchParams.status;
  }

  if (searchParams.search) {
    where.OR = [
      { quoteNumber: { contains: searchParams.search, mode: 'insensitive' } },
      { customerName: { contains: searchParams.search, mode: 'insensitive' } },
      { address: { contains: searchParams.search, mode: 'insensitive' } },
    ];
  }

  // Fetch quotes with pagination
  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      include: {
        createdBy: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.quote.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <QuotesHeader />

      <Card>
        <CardContent className="p-0">
          <QuotesTable quotes={quotes} />
          {total > 0 && (
            <div className="px-6 pb-6">
              <Pagination page={page} total={total} limit={limit} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
