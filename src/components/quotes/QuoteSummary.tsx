'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Save,
  Send,
  Printer,
  Download,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { QuoteStatus } from '@prisma/client';

interface QuoteSummaryProps {
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  status: QuoteStatus;
  itemsCount: number;
  houseTypeAllowance?: number;
  itemsSubtotal?: number;
  additionalTotal?: number;
  bespokeUplift?: number;
  onSave?: () => void;
  onFinalize?: () => void;
  onSend?: () => void;
  onPrint?: () => void;
  onDownloadPDF?: () => void;
  isSaving?: boolean;
  autoSaveStatus?: 'saving' | 'saved' | 'error';
}

export function QuoteSummary({
  subtotal,
  vatRate,
  vatAmount,
  total,
  status,
  itemsCount,
  houseTypeAllowance = 0,
  itemsSubtotal = 0,
  additionalTotal = 0,
  bespokeUplift = 0,
  onSave,
  onFinalize,
  onSend,
  onPrint,
  onDownloadPDF,
  isSaving,
  autoSaveStatus,
}: QuoteSummaryProps) {
  const [showComingSoon, setShowComingSoon] = React.useState(false);
  const [comingSoonFeature, setComingSoonFeature] = React.useState('');

  const handleComingSoon = (feature: string) => {
    setComingSoonFeature(feature);
    setShowComingSoon(true);
  };
  const statusVariants: Record<QuoteStatus, 'default' | 'warning' | 'success' | 'info' | 'danger'> = {
    DRAFT: 'default',
    FINALIZED: 'warning',
    PRINTED: 'info',
    SENT: 'success',
    SAVED: 'info',
    ARCHIVED: 'danger',
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="sticky top-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quote Summary</CardTitle>
            <Badge variant={statusVariants[status]}>{status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items Count */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Items</span>
            <span className="font-medium">{itemsCount}</span>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 text-sm">
            {houseTypeAllowance > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">House Type Allowance</span>
                <span className="font-mono text-[#B19334]">£{houseTypeAllowance.toFixed(2)}</span>
              </div>
            )}
            {itemsSubtotal > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Additional Items</span>
                <span className="font-mono">£{itemsSubtotal.toFixed(2)}</span>
              </div>
            )}
            {bespokeUplift > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Bespoke Uplift</span>
                <span className="font-mono text-amber-400">£{bespokeUplift.toFixed(2)}</span>
              </div>
            )}
            {additionalTotal > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Other Costs</span>
                <span className="font-mono">£{additionalTotal.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t border-border-glass pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total (VAT Inclusive)</span>
              <span className="text-2xl font-bold font-mono text-gradient">
                £{subtotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Auto-save Status */}
          {autoSaveStatus && (
            <div className="flex items-center gap-2 text-xs">
              {autoSaveStatus === 'saving' && (
                <>
                  <Clock className="w-3 h-3 animate-spin text-text-secondary" />
                  <span className="text-text-secondary">Saving...</span>
                </>
              )}
              {autoSaveStatus === 'saved' && (
                <>
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">All changes saved</span>
                </>
              )}
              {autoSaveStatus === 'error' && (
                <>
                  <span className="text-red-400">Error saving</span>
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t border-border-glass">
            {status === 'DRAFT' && (
              <>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={onFinalize}
                  disabled={itemsCount === 0}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finalize Quote
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={onSave}
                  isLoading={isSaving}
                  disabled={itemsCount === 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
              </>
            )}

            {(status === 'FINALIZED' || status === 'SENT') && (
              <>
                <Button
                  className="w-full"
                  onClick={onSave}
                  isLoading={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={onPrint}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Quote
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => handleComingSoon('Download PDF')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => handleComingSoon('Email Quote')}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {status === 'SENT' ? 'Resend Email' : 'Send to Customer'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

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

    </div>
  );
}
