import { requireAuth } from '@/lib/auth-utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default async function QuoteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gradient">
          Quote #{params.id}
        </h1>
        <p className="text-text-secondary mt-1">
          View and edit quote details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary text-center py-8">
            Quote editor will be implemented here with full editing capabilities.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
