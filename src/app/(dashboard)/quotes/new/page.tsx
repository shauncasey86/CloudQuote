import { requireAuth } from '@/lib/auth-utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default async function NewQuotePage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gradient">
          New Quote
        </h1>
        <p className="text-text-secondary mt-1">
          Create a new kitchen installation quote
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary text-center py-8">
            Quote creation form will be implemented here with product selection, pricing, and customer details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
