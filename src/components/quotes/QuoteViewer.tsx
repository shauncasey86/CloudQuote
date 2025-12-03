'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { QuoteEditor } from './QuoteEditor';
import {
  Edit,
  Download,
  Send,
  Copy,
  Archive,
  Printer,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
} from 'lucide-react';
import { QuoteStatus } from '@prisma/client';
import { toast } from '@/lib/toast';
import { Modal } from '@/components/ui/Modal';

interface QuoteViewerProps {
  quote: any;
  products?: any[];
  categories?: any[];
  houseTypes?: any[];
  isEditMode?: boolean;
}

export function QuoteViewer({
  quote,
  products,
  categories,
  houseTypes,
  isEditMode = false,
}: QuoteViewerProps) {
  const router = useRouter();
  const [showComingSoon, setShowComingSoon] = React.useState(false);
  const [comingSoonFeature, setComingSoonFeature] = React.useState('');

  const handleComingSoon = (feature: string) => {
    setComingSoonFeature(feature);
    setShowComingSoon(true);
  };

  // If in edit mode, show the editor
  if (isEditMode && products && categories && houseTypes) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Edit Quote {quote.quoteNumber}
            </h1>
            <p className="text-text-secondary mt-1">
              Modify quote details and items
            </p>
          </div>
          <Link href={`/quotes/${quote.id}`}>
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to View
            </Button>
          </Link>
        </div>

        <QuoteEditor
          quoteId={quote.id}
          initialData={{
            customerInfo: {
              quoteNumber: quote.quoteNumber,
              customerName: quote.customerName,
              customerEmail: quote.customerEmail || '',
              customerPhone: quote.customerPhone || '',
              address: quote.address,
              houseTypeId: quote.houseTypeId || '',
              notes: quote.notes || '',
              internalNotes: quote.internalNotes || '',
            },
            items: quote.items,
            additionalCosts: quote.additionalCosts,
            status: quote.status,
          }}
          products={products}
          categories={categories}
          houseTypes={houseTypes}
        />
      </div>
    );
  }

  // View mode
  const statusVariants: Record<QuoteStatus, 'default' | 'warning' | 'success' | 'info' | 'danger'> = {
    DRAFT: 'default',
    FINALIZED: 'warning',
    SENT: 'success',
    SAVED: 'info',
    ARCHIVED: 'danger',
  };

  const handleSendEmail = async () => {
    try {
      const response = await fetch(`/api/quotes/${quote.id}/send`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to send quote');

      toast.success('Quote sent successfully via email');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send quote');
    }
  };

  const handleDownloadPDF = () => {
    window.open(`/api/quotes/${quote.id}/pdf`, '_blank');
  };

  const handleDuplicate = async () => {
    try {
      const response = await fetch(`/api/quotes/${quote.id}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to duplicate quote');

      const data = await response.json();
      toast.success('Quote duplicated successfully');
      router.push(`/quotes/${data.data.id}?edit=true`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to duplicate quote');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between print-hide">
        <div className="flex items-start gap-4">
          <Link href="/quotes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-bold text-gradient">
                Quote {quote.quoteNumber}
              </h1>
              <Badge variant={statusVariants[quote.status as QuoteStatus]}>
                {quote.status}
              </Badge>
            </div>
            <p className="text-text-secondary mt-1">
              Created {format(new Date(quote.createdAt), 'dd MMM yyyy')} by{' '}
              {quote.createdBy?.name}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {quote.status === 'DRAFT' && (
            <Link href={`/quotes/${quote.id}?edit=true`}>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
          )}
          <Button onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="secondary" onClick={() => handleComingSoon('Download PDF')}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          {(quote.status === 'FINALIZED' || quote.status === 'SENT') && (
            <Button variant="ghost" onClick={() => handleComingSoon('Email Quote')}>
              <Send className="w-4 h-4 mr-2" />
              {quote.status === 'SENT' ? 'Resend Email' : 'Send Email'}
            </Button>
          )}
          <Button variant="ghost" onClick={handleDuplicate}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
        </div>
      </div>

      {/* Coming Soon Modal */}
      <Modal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        title="Feature Coming Soon"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center">
            <Download className="w-8 h-8 text-white" />
          </div>
          <p className="text-text-secondary mb-4">
            {comingSoonFeature} functionality is coming soon!
          </p>
          <p className="text-sm text-text-secondary">
            For now, please use the Print function to create a physical copy or save as PDF via your browser&apos;s print dialog.
          </p>
          <Button
            className="mt-6"
            onClick={() => setShowComingSoon(false)}
          >
            Got it
          </Button>
        </div>
      </Modal>

      {/* Print Header - Only visible when printing */}
      <div className="hidden print-only print-header">
        <div>
          <h1 className="text-3xl font-bold">CloudQuote</h1>
          <p className="text-sm">Kitchen Installation Quotation</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">Quote {quote.quoteNumber}</p>
          <p className="text-sm">{format(new Date(quote.createdAt), 'dd MMMM yyyy')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm text-text-secondary">Customer Name</p>
                  <p className="font-medium">{quote.customerName}</p>
                </div>
              </div>

              {quote.customerEmail && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm text-text-secondary">Email</p>
                    <p className="font-medium">{quote.customerEmail}</p>
                  </div>
                </div>
              )}

              {quote.customerPhone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm text-text-secondary">Phone</p>
                    <p className="font-medium">{quote.customerPhone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm text-text-secondary">Address</p>
                  <p className="font-medium whitespace-pre-line">
                    {quote.address}
                  </p>
                </div>
              </div>

              {quote.houseType && (
                <div className="flex items-start gap-3 pt-2 border-t border-border-glass">
                  <div>
                    <p className="text-sm text-text-secondary">House Type</p>
                    <p className="font-medium">
                      {quote.houseType.name} (
                      {Number(quote.houseTypeMultiplier)}x multiplier)
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quote Items */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Items ({quote.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quote.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-4 bg-bg-glass rounded-lg border border-border-glass"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      {item.productSku && (
                        <p className="text-xs text-text-secondary font-mono mt-1">
                          {item.productSku}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-sm text-text-secondary mt-1 italic">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-text-secondary">
                        {Number(item.quantity)}{' '}
                        {item.priceUnit === 'LINEAR_METER' ? 'm' : 'unit'}(s) ×
                        £{Number(item.unitPrice).toFixed(2)}
                      </p>
                      <p className="font-mono font-bold mt-1">
                        £{Number(item.lineTotal).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Costs */}
          {quote.additionalCosts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quote.additionalCosts.map((cost: any) => (
                    <div
                      key={cost.id}
                      className="flex items-center justify-between p-3 bg-bg-glass rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{cost.description}</p>
                        {cost.taxable && (
                          <Badge variant="info" className="text-xs">
                            +VAT
                          </Badge>
                        )}
                      </div>
                      <p className="font-mono font-medium">
                        £{Number(cost.amount).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {quote.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary whitespace-pre-line">
                  {quote.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {quote.internalNotes && (
            <Card className="bg-amber-500/5 border-amber-500/20 print-hide">
              <CardHeader>
                <CardTitle className="text-amber-400">
                  Internal Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary whitespace-pre-line">
                  {quote.internalNotes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="font-mono font-medium">
                    £{Number(quote.subtotal).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">
                    VAT ({Number(quote.vatRate)}%)
                  </span>
                  <span className="font-mono font-medium">
                    £{Number(quote.vatAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t border-border-glass pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold font-mono text-gradient">
                    £{Number(quote.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {quote.sentAt && (
                <div className="pt-4 border-t border-border-glass text-xs text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Send className="w-3 h-3" />
                    <span>
                      Sent {format(new Date(quote.sentAt), 'dd MMM yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              )}

              {quote.validUntil && (
                <div className="text-xs text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Valid until{' '}
                      {format(new Date(quote.validUntil), 'dd MMM yyyy')}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
