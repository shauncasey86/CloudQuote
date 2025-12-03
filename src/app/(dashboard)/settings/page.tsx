import { requireAuth } from '@/lib/auth-utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default async function SettingsPage() {
  const session = await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gradient">
          Settings
        </h1>
        <p className="text-text-secondary mt-1">
          Manage your account and application settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-secondary">Name</label>
            <p className="text-text-primary">{session.user.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Email</label>
            <p className="text-text-primary">{session.user.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Role</label>
            <p className="text-text-primary capitalize">{session.user.role.toLowerCase()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
