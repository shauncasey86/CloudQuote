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
  History,
  Clock,
  ChevronRight,
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

interface ChangeHistoryEntry {
  id: string;
  action: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: any;
  changedAt: string;
  user: { id: string; name: string };
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
  const [showChangeHistory, setShowChangeHistory] = React.useState(false);
  const [selectedChange, setSelectedChange] = React.useState<ChangeHistoryEntry | null>(null);

  const handleComingSoon = (feature: string) => {
    setComingSoonFeature(feature);
    setShowComingSoon(true);
  };

  const handleChangeClick = (change: ChangeHistoryEntry) => {
    setSelectedChange(change);
  };

  const formatChangeDetails = (change: ChangeHistoryEntry) => {
    const details: { label: string; value: string }[] = [];

    if (change.action === 'create') {
      details.push({ label: 'Action', value: 'Created new quote' });
      if (change.metadata?.quoteNumber) {
        details.push({ label: 'Quote Number', value: change.metadata.quoteNumber });
      }
      if (change.metadata?.customerName) {
        details.push({ label: 'Customer', value: change.metadata.customerName });
      }
    } else if (change.action === 'update') {
      details.push({ label: 'Action', value: 'Updated quote' });
      if (change.metadata?.updatedFields) {
        const fields = change.metadata.updatedFields;
        details.push({ label: 'Fields Changed', value: fields.join(', ') });
      }
    } else if (change.action === 'status_change') {
      details.push({ label: 'Action', value: 'Status changed' });
      if (change.oldValue) details.push({ label: 'From', value: change.oldValue });
      if (change.newValue) details.push({ label: 'To', value: change.newValue });
    } else if (change.action === 'email_sent') {
      details.push({ label: 'Action', value: 'Email sent to customer' });
    }

    if (change.fieldChanged) {
      details.push({ label: 'Field', value: change.fieldChanged });
    }
    if (change.oldValue && change.action !== 'status_change') {
      details.push({ label: 'Previous Value', value: change.oldValue });
    }
    if (change.newValue && change.action !== 'status_change') {
      details.push({ label: 'New Value', value: change.newValue });
    }

    return details;
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
              postcode: quote.postcode || '',
              houseTypeId: quote.houseTypeId || '',
              frontal: quote.frontal || '',
              handle: quote.handle || '',
              worktop: quote.worktop || '',
              notes: quote.notes || '',
              internalNotes: quote.internalNotes || '',
            },
            items: quote.items,
            additionalCosts: quote.additionalCosts,
            bespokeUpliftQty: quote.bespokeUpliftQty ?? 0,
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
    PRINTED: 'info',
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
            <p className="text-text-secondary text-xs mt-1">
              CREATED {format(new Date(quote.createdAt), 'dd MMM yyyy').toUpperCase()}
              {quote.createdBy?.name && <span className="ml-1">BY {quote.createdBy.name.toUpperCase()}</span>}
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
          <Button onClick={() => window.open(`/print/quotes/${quote.id}`, '_blank')}>
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

      {/* Change Detail Modal */}
      <Modal
        isOpen={!!selectedChange}
        onClose={() => setSelectedChange(null)}
        title="Change Details"
      >
        {selectedChange && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-border-glass">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedChange.action === 'create' ? 'bg-green-500/20' :
                selectedChange.action === 'update' ? 'bg-blue-500/20' :
                selectedChange.action === 'status_change' ? 'bg-amber-500/20' :
                'bg-violet-500/20'
              }`}>
                {selectedChange.action === 'create' ? <User className="w-5 h-5 text-green-400" /> :
                 selectedChange.action === 'update' ? <Edit className="w-5 h-5 text-blue-400" /> :
                 <Clock className="w-5 h-5 text-amber-400" />}
              </div>
              <div>
                <Badge
                  variant={
                    selectedChange.action === 'create' ? 'success' :
                    selectedChange.action === 'update' ? 'info' :
                    selectedChange.action === 'status_change' ? 'warning' :
                    'default'
                  }
                >
                  {selectedChange.action.replace('_', ' ').toUpperCase()}
                </Badge>
                <p className="text-xs text-text-secondary mt-1">
                  {format(new Date(selectedChange.changedAt), 'dd MMM yyyy HH:mm')}
                  {selectedChange.user?.name && ` by ${selectedChange.user.name}`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {formatChangeDetails(selectedChange).map((detail, index) => (
                <div key={index} className="flex justify-between items-start p-3 bg-bg-glass rounded-lg">
                  <span className="text-sm text-text-secondary">{detail.label}</span>
                  <span className="text-sm font-medium text-right max-w-[60%] break-words">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>

            <Button
              className="w-full mt-4"
              onClick={() => setSelectedChange(null)}
            >
              Close
            </Button>
          </div>
        )}
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
                      {quote.houseType.name} (Allowance: £{Number(quote.houseType.allowance).toFixed(2)})
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items ({quote.items.length})</CardTitle>
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

          {/* Change History */}
          <Card className="print-hide">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Document History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Creation Info */}
                <div className="flex items-start gap-3 p-3 bg-bg-glass rounded-lg border border-border-glass">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-text-secondary">
                      {format(new Date(quote.createdAt), 'dd MMM yyyy HH:mm')}
                      {quote.createdBy?.name && ` by ${quote.createdBy.name}`}
                    </p>
                  </div>
                </div>

                {/* Last Edit Info */}
                {quote.updatedBy && quote.updatedAt && new Date(quote.updatedAt).getTime() !== new Date(quote.createdAt).getTime() && (
                  <div className="flex items-start gap-3 p-3 bg-bg-glass rounded-lg border border-border-glass">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Edit className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Last Edited</p>
                      <p className="text-xs text-text-secondary">
                        {format(new Date(quote.updatedAt), 'dd MMM yyyy HH:mm')}
                        {quote.updatedBy?.name && ` by ${quote.updatedBy.name}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Change History List */}
                {quote.changeHistory && quote.changeHistory.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowChangeHistory(!showChangeHistory)}
                      className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform ${showChangeHistory ? 'rotate-90' : ''}`} />
                      View all changes ({quote.changeHistory.length})
                    </button>

                    {showChangeHistory && (
                      <div className="mt-3 space-y-2 pl-6 border-l-2 border-border-glass">
                        {quote.changeHistory.map((change: ChangeHistoryEntry) => (
                          <button
                            key={change.id}
                            onClick={() => handleChangeClick(change)}
                            className="w-full text-left p-2 rounded-lg hover:bg-bg-elevated transition-colors group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-text-muted" />
                                <span className="text-xs text-text-secondary">
                                  {format(new Date(change.changedAt), 'dd MMM yyyy HH:mm')}
                                </span>
                              </div>
                              <ChevronRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge
                                variant={
                                  change.action === 'create' ? 'success' :
                                  change.action === 'update' ? 'info' :
                                  change.action === 'status_change' ? 'warning' :
                                  'default'
                                }
                                className="text-xs"
                              >
                                {change.action}
                              </Badge>
                              <span className="text-xs text-text-secondary">
                                by {change.user?.name || 'Unknown'}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total (VAT Inclusive)</span>
                <span className="text-2xl font-bold font-mono text-gradient">
                  £{Number(quote.subtotal).toFixed(2)}
                </span>
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
