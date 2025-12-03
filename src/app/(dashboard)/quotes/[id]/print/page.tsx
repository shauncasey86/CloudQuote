import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { PrintControls } from '@/components/quotes/PrintControls';

export default async function QuotePrintPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAuth();

  const quote = await prisma.quote.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: { product: true },
        orderBy: { sortOrder: 'asc' },
      },
      additionalCosts: { orderBy: { sortOrder: 'asc' } },
      houseType: true,
      createdBy: { select: { name: true, email: true } },
    },
  });

  if (!quote) {
    notFound();
  }

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
        }

        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .print-page {
          font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
          background: white;
          color: #18181b;
        }

        @media screen {
          .print-page {
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            min-height: 297mm;
          }
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 20px;
          border-bottom: 3px solid #7c3aed;
          margin-bottom: 24px;
        }

        .logo-section h1 {
          font-size: 32px;
          font-weight: 700;
          color: #7c3aed;
          margin: 0;
        }

        .logo-section p {
          font-size: 12px;
          color: #71717a;
          margin: 4px 0 0 0;
        }

        .quote-number-section {
          text-align: right;
        }

        .quote-number {
          font-size: 24px;
          font-weight: 700;
          color: #18181b;
          margin: 0;
        }

        .quote-date {
          font-size: 12px;
          color: #71717a;
          margin: 4px 0 0 0;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 8px;
        }

        .status-DRAFT { background: #e4e4e7; color: #52525b; }
        .status-FINALIZED { background: #fef3c7; color: #92400e; }
        .status-SENT { background: #d1fae5; color: #065f46; }
        .status-SAVED { background: #dbeafe; color: #1e40af; }
        .status-ARCHIVED { background: #fee2e2; color: #991b1b; }

        .customer-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
          padding: 16px;
          background: #fafafa;
          border-radius: 8px;
        }

        .customer-info h3, .address-info h3 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #71717a;
          margin: 0 0 8px 0;
        }

        .customer-info p, .address-info p {
          margin: 4px 0;
          font-size: 14px;
          color: #18181b;
        }

        .customer-info strong, .address-info strong {
          font-size: 16px;
        }

        .items-section {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #18181b;
          margin: 0 0 12px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid #e4e4e7;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .items-table th {
          text-align: left;
          padding: 10px 8px;
          background: #f4f4f5;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #52525b;
        }

        .items-table th:last-child,
        .items-table td:last-child {
          text-align: right;
        }

        .items-table td {
          padding: 12px 8px;
          border-bottom: 1px solid #e4e4e7;
          vertical-align: top;
        }

        .items-table tr:last-child td {
          border-bottom: none;
        }

        .product-name {
          font-weight: 500;
          color: #18181b;
        }

        .product-sku {
          font-size: 11px;
          color: #71717a;
          font-family: 'JetBrains Mono', monospace;
        }

        .product-notes {
          font-size: 12px;
          color: #71717a;
          font-style: italic;
          margin-top: 4px;
        }

        .quantity-info {
          white-space: nowrap;
        }

        .line-total {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
        }

        .additional-costs {
          margin-bottom: 24px;
        }

        .cost-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 8px;
          border-bottom: 1px solid #e4e4e7;
        }

        .cost-row:last-child {
          border-bottom: none;
        }

        .cost-description {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .vat-tag {
          font-size: 10px;
          padding: 2px 6px;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 4px;
        }

        .cost-amount {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
        }

        .summary-section {
          margin-top: 24px;
          padding: 16px;
          background: #fafafa;
          border-radius: 8px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
        }

        .summary-row.total {
          font-size: 18px;
          font-weight: 700;
          padding-top: 12px;
          margin-top: 8px;
          border-top: 2px solid #7c3aed;
        }

        .summary-label {
          color: #52525b;
        }

        .summary-value {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
        }

        .summary-row.total .summary-value {
          color: #7c3aed;
        }

        .notes-section {
          margin-top: 24px;
          padding: 16px;
          background: #fafafa;
          border-radius: 8px;
        }

        .notes-section h3 {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #71717a;
          margin: 0 0 8px 0;
        }

        .notes-section p {
          font-size: 13px;
          color: #18181b;
          margin: 0;
          white-space: pre-line;
        }

        .footer {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #e4e4e7;
          text-align: center;
        }

        .footer p {
          font-size: 11px;
          color: #71717a;
          margin: 4px 0;
        }

        .validity {
          display: inline-block;
          padding: 8px 16px;
          background: #fef3c7;
          border-radius: 6px;
          font-size: 12px;
          color: #92400e;
          margin-bottom: 16px;
        }

        .print-controls {
          position: fixed;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 8px;
          z-index: 100;
        }

        @media print {
          .print-controls {
            display: none !important;
          }
        }

        .print-btn {
          padding: 10px 20px;
          background: #7c3aed;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        }

        .print-btn:hover {
          background: #6d28d9;
        }

        .back-btn {
          padding: 10px 20px;
          background: #e4e4e7;
          color: #18181b;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        }

        .back-btn:hover {
          background: #d4d4d8;
        }
      `}</style>

      {/* Print Controls */}
      <PrintControls />

      {/* Print Document */}
      <div className="print-page">
        {/* Header */}
        <div className="header">
          <div className="logo-section">
            <h1>CloudQuote</h1>
            <p>Kitchen Installation Quotation</p>
          </div>
          <div className="quote-number-section">
            <p className="quote-number">#{quote.quoteNumber}</p>
            <p className="quote-date">{format(new Date(quote.createdAt), 'dd MMMM yyyy')}</p>
            <span className={`status-badge status-${quote.status}`}>
              {quote.status}
            </span>
          </div>
        </div>

        {/* Customer Information */}
        <div className="customer-section">
          <div className="customer-info">
            <h3>Customer Details</h3>
            <p><strong>{quote.customerName}</strong></p>
            {quote.customerEmail && <p>📧 {quote.customerEmail}</p>}
            {quote.customerPhone && <p>📞 {quote.customerPhone}</p>}
          </div>
          <div className="address-info">
            <h3>Installation Address</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{quote.address}</p>
            {quote.houseType && (
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#71717a' }}>
                House Type: {quote.houseType.name} ({Number(quote.houseTypeMultiplier)}x)
              </p>
            )}
          </div>
        </div>

        {/* Quote Items */}
        <div className="items-section">
          <h2 className="section-title">Quote Items ({quote.items.length})</h2>
          <table className="items-table">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Product</th>
                <th style={{ width: '20%' }}>Quantity</th>
                <th style={{ width: '15%' }}>Unit Price</th>
                <th style={{ width: '20%' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item: any) => (
                <tr key={item.id}>
                  <td>
                    <div className="product-name">{item.productName}</div>
                    {item.productSku && (
                      <div className="product-sku">{item.productSku}</div>
                    )}
                    {item.notes && (
                      <div className="product-notes">{item.notes}</div>
                    )}
                  </td>
                  <td className="quantity-info">
                    {Number(item.quantity)}{' '}
                    {item.priceUnit === 'LINEAR_METER' ? 'meter(s)' :
                     item.priceUnit === 'SQUARE_METER' ? 'm²' : 'unit(s)'}
                  </td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    £{Number(item.unitPrice).toFixed(2)}
                  </td>
                  <td className="line-total">
                    £{Number(item.lineTotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Additional Costs */}
        {quote.additionalCosts.length > 0 && (
          <div className="additional-costs">
            <h2 className="section-title">Additional Costs</h2>
            {quote.additionalCosts.map((cost: any) => (
              <div key={cost.id} className="cost-row">
                <div className="cost-description">
                  <span>{cost.description}</span>
                  {cost.taxable && <span className="vat-tag">+VAT</span>}
                </div>
                <span className="cost-amount">£{Number(cost.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="summary-section">
          <div className="summary-row">
            <span className="summary-label">Subtotal</span>
            <span className="summary-value">£{Number(quote.subtotal).toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">VAT ({Number(quote.vatRate)}%)</span>
            <span className="summary-value">£{Number(quote.vatAmount).toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span className="summary-label">Total</span>
            <span className="summary-value">£{Number(quote.total).toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="notes-section">
            <h3>Notes</h3>
            <p>{quote.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          {quote.validUntil && (
            <div className="validity">
              ⏰ This quote is valid until {format(new Date(quote.validUntil), 'dd MMMM yyyy')}
            </div>
          )}
          <p>Thank you for choosing CloudQuote for your kitchen installation needs.</p>
          <p>For questions, please contact us at your convenience.</p>
          {quote.createdBy && (
            <p style={{ marginTop: '8px' }}>
              Prepared by: {quote.createdBy.name}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
