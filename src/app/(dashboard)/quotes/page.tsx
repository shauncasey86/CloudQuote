import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/Card';
import { QuotesHeader } from '@/components/quotes/QuotesHeader';
import { QuotesTable } from '@/components/quotes/QuotesTable';
import { Pagination } from '@/components/ui/Pagination';
import { FileText, Clock, Send, CheckCircle } from 'lucide-react';

interface Props {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
  };
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  trend,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  trend?: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-muted">{title}</p>
          <p className="text-3xl font-bold mt-2 text-text-primary">{value}</p>
          {trend && (
            <p className="text-xs text-emerald-400 mt-2">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${gradient}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
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

  // Fetch quotes with pagination and stats
  const [quotesRaw, total, draftCount, sentCount, finalizedCount] = await Promise.all([
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
    prisma.quote.count({ where: { status: 'DRAFT' } }),
    prisma.quote.count({ where: { status: 'SENT' } }),
    prisma.quote.count({ where: { status: 'FINALIZED' } }),
  ]);

  // Convert Decimal to number for client components
  const quotes = quotesRaw.map((quote) => ({
    ...quote,
    total: Number(quote.total),
    subtotal: Number(quote.subtotal),
    vatAmount: Number(quote.vatAmount),
    vatRate: Number(quote.vatRate),
    houseTypeMultiplier: Number(quote.houseTypeMultiplier),
  }));

  // Calculate total value
  const totalValue = quotesRaw.reduce((sum, q) => sum + Number(q.total), 0);

  return (
    <div className="space-y-6">
      <QuotesHeader />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeUp-delay-1">
        <StatCard
          title="Total Quotes"
          value={total}
          icon={FileText}
          gradient="bg-gradient-primary"
        />
        <StatCard
          title="Draft"
          value={draftCount}
          icon={Clock}
          gradient="bg-gradient-to-r from-slate-500 to-slate-600"
        />
        <StatCard
          title="Ready to Send"
          value={finalizedCount}
          icon={CheckCircle}
          gradient="bg-gradient-aurora"
        />
        <StatCard
          title="Sent"
          value={sentCount}
          icon={Send}
          gradient="bg-gradient-success"
        />
      </div>

      <Card className="animate-fadeUp-delay-2" hover={false}>
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
