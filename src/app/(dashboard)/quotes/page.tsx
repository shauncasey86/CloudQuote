import { requireAuth } from '@/lib/auth-utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function QuotesPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient">
            Quotes
          </h1>
          <p className="text-text-secondary mt-1">
            Manage and create kitchen installation quotes
          </p>
        </div>
        <Link href="/quotes/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Quote
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary text-center py-8">
            Quote list will be implemented here with full quote management features.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
