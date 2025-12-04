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
  const where: any = {};

  // Handle status filtering
  if (searchParams.status === 'all') {
    // Show all statuses including archived
  } else if (searchParams.status) {
    // Show specific status
    where.status = searchParams.status;
  } else {
    // Default: exclude archived
    where.status = { not: 'ARCHIVED' };
  }

  if (searchParams.search) {
    where.OR = [
      { quoteNumber: { contains: searchParams.search, mode: 'insensitive' } },
      { customerName: { contains: searchParams.search, mode: 'insensitive' } },
      { address: { contains: searchParams.search, mode: 'insensitive' } },
    ];
  }

  // Fetch quotes with pagination
  const [quotesRaw, total] = await Promise.all([
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

  // Convert Decimal to number for client components
  const quotes = quotesRaw.map((quote) => ({
    ...quote,
    total: Number(quote.total),
    subtotal: Number(quote.subtotal),
    vatAmount: Number(quote.vatAmount),
    vatRate: Number(quote.vatRate),
    houseTypeAllowance: Number(quote.houseTypeAllowance),
  }));

  return (
    <div className="space-y-6">
      <QuotesHeader />

      <Card className="animate-fadeUp-delay-1" hover={false}>
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
