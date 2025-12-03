import { requireAuth } from '@/lib/auth-utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export default async function ProductsPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient">
            Products
          </h1>
          <p className="text-text-secondary mt-1">
            Manage product catalog and pricing
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary text-center py-8">
            Product management interface will be implemented here with categories and pricing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
