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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between print-hide">
        <div className="flex items-center gap-3">
          <Link href="/quotes">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-gradient">
                Quote {quote.quoteNumber}
              </h1>
              <Badge variant={statusVariants[quote.status as QuoteStatus]} className="text-xs">
                {quote.status}
              </Badge>
            </div>
            <p className="text-text-secondary text-xs">
              Created {format(new Date(quote.createdAt), 'dd MMM yyyy')}
              {quote.createdBy?.name && ` by ${quote.createdBy.name}`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {quote.status === 'DRAFT' && (
            <Link href={`/quotes/${quote.id}?edit=true`}>
              <Button size="sm">
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            </Link>
          )}
          <Button size="sm" onClick={() => window.open(`/print/quotes/${quote.id}`, '_blank')}>
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleComingSoon('Download PDF')}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            PDF
          </Button>
          {(quote.status === 'FINALIZED' || quote.status === 'SENT') && (
            <Button size="sm" variant="ghost" onClick={() => handleComingSoon('Email Quote')}>
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {quote.status === 'SENT' ? 'Resend' : 'Email'}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={handleDuplicate}>
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Copy
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer Information - Compact */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  <span className="font-medium truncate">{quote.customerName}</span>
                </div>
                {quote.customerEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-text-secondary flex-shrink-0" />
                    <span className="truncate">{quote.customerEmail}</span>
                  </div>
                )}
                {quote.customerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-text-secondary flex-shrink-0" />
                    <span>{quote.customerPhone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 col-span-2">
                  <MapPin className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  <span className="truncate">{quote.address}</span>
                </div>
                {quote.houseType && (
                  <div className="col-span-2 pt-2 mt-1 border-t border-border-glass text-xs text-text-secondary">
                    House Type: <span className="font-medium text-text-primary">{quote.houseType.name}</span> (Allowance: £{Number(quote.houseType.allowance).toFixed(2)})
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Items ({quote.items.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1.5">
                {quote.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 px-3 bg-bg-glass rounded border border-border-glass text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{item.productName}</span>
                      {item.productSku && (
                        <span className="text-xs text-text-muted font-mono ml-2">{item.productSku}</span>
                      )}
                      {item.notes && (
                        <span className="text-xs text-text-secondary italic ml-2">({item.notes})</span>
                      )}
                    </div>
                    <div className="text-right flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-text-secondary">
                        {Number(item.quantity)} × £{Number(item.unitPrice).toFixed(2)}
                      </span>
                      <span className="font-mono font-semibold w-20 text-right">
                        £{Number(item.lineTotal).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Costs */}
          {quote.additionalCosts.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Additional Costs</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {quote.additionalCosts.map((cost: any) => (
                    <div
                      key={cost.id}
                      className="flex items-center justify-between py-1.5 px-3 bg-bg-glass rounded text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cost.description}</span>
                        {cost.taxable && (
                          <Badge variant="info" className="text-xs py-0">+VAT</Badge>
                        )}
                      </div>
                      <span className="font-mono font-medium">£{Number(cost.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {quote.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-text-secondary whitespace-pre-line">{quote.notes}</p>
              </CardContent>
            </Card>
          )}

          {quote.internalNotes && (
            <Card className="bg-amber-500/5 border-amber-500/20 print-hide">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-amber-400">Internal Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-text-secondary whitespace-pre-line">{quote.internalNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total (VAT Inc.)</span>
                <span className="text-xl font-bold font-mono text-gradient">
                  £{Number(quote.subtotal).toFixed(2)}
                </span>
              </div>

              {quote.sentAt && (
                <div className="pt-2 border-t border-border-glass text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <Send className="w-3 h-3" />
                    <span>Sent {format(new Date(quote.sentAt), 'dd MMM yyyy HH:mm')}</span>
                  </div>
                </div>
              )}

              {quote.validUntil && (
                <div className="text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>Valid until {format(new Date(quote.validUntil), 'dd MMM yyyy')}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document History */}
          <Card className="mt-3 print-hide">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <History className="w-3.5 h-3.5" />
                Document History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              {/* Creation Info */}
              <div className="flex items-center gap-2 p-1.5 bg-bg-glass rounded border border-border-glass">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-2.5 h-2.5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs">
                    <span className="font-medium">CREATED</span>
                    <span className="text-text-secondary ml-1">
                      {format(new Date(quote.createdAt), 'dd MMM HH:mm')}
                      {quote.createdBy?.name && ` · ${quote.createdBy.name}`}
                    </span>
                  </p>
                </div>
              </div>

              {/* Last Edit Info - Clickable */}
              {quote.updatedBy && quote.updatedAt && new Date(quote.updatedAt).getTime() !== new Date(quote.createdAt).getTime() && (
                <button
                  onClick={() => {
                    const lastUpdate = quote.changeHistory?.find((c: ChangeHistoryEntry) => c.action === 'update');
                    // Use change history entry if available, otherwise create a basic one from quote data
                    const changeEntry: ChangeHistoryEntry = lastUpdate || {
                      id: 'last-edit',
                      action: 'update',
                      changedAt: quote.updatedAt,
                      user: { id: quote.updatedBy?.id || '', name: quote.updatedBy?.name || 'Unknown' },
                    };
                    handleChangeClick(changeEntry);
                  }}
                  className="w-full flex items-center gap-2 p-1.5 bg-bg-glass rounded border border-border-glass hover:bg-bg-elevated transition-colors group"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Edit className="w-2.5 h-2.5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs">
                      <span className="font-medium">EDITED</span>
                      <span className="text-text-secondary ml-1">
                        {format(new Date(quote.updatedAt), 'dd MMM HH:mm')}
                        {quote.updatedBy?.name && ` · ${quote.updatedBy.name}`}
                      </span>
                      <ChevronRight className="w-3 h-3 text-text-muted inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                  </div>
                </button>
              )}

              {/* View All Changes */}
              {quote.changeHistory && quote.changeHistory.length > 0 && (
                <div className="pt-1">
                  <button
                    onClick={() => setShowChangeHistory(!showChangeHistory)}
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <ChevronRight className={`w-3 h-3 transition-transform ${showChangeHistory ? 'rotate-90' : ''}`} />
                    View all ({quote.changeHistory.length})
                  </button>

                  {showChangeHistory && (
                    <div className="mt-1.5 space-y-0.5 pl-3 border-l-2 border-border-glass">
                      {quote.changeHistory.map((change: ChangeHistoryEntry) => (
                        <button
                          key={change.id}
                          onClick={() => handleChangeClick(change)}
                          className="w-full text-left p-1 rounded hover:bg-bg-elevated transition-colors group flex items-center justify-between"
                        >
                          <div className="flex items-center gap-1">
                            <Badge
                              variant={
                                change.action === 'create' ? 'success' :
                                change.action === 'update' ? 'info' :
                                change.action === 'status_change' ? 'warning' :
                                'default'
                              }
                              className="text-[10px] py-0 px-1"
                            >
                              {change.action}
                            </Badge>
                            <span className="text-xs text-text-secondary">
                              {format(new Date(change.changedAt), 'dd/MM HH:mm')}
                            </span>
                          </div>
                          <ChevronRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
