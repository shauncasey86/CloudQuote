import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

interface Props {
  params: { id: string };
  searchParams: { mode?: string };
}

export default async function QuotePrintPage({ params, searchParams }: Props) {
  await requireAuth();

  const isProductionMode = searchParams.mode === 'production';

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

  // Get current URL path for mode toggle
  const basePath = `/print/quotes/${params.id}`;

  return (
    <html>
      <head>
        <title>{isProductionMode ? 'Production' : 'Quote'} - {quote.quoteNumber}</title>
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 15mm;
            }

            .print-controls {
              display: none !important;
            }
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #f5f5f5;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-page {
            max-width: 210mm;
            margin: 20px auto;
            padding: 20px;
            background: white;
            color: #18181b;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            min-height: 297mm;
          }

          @media print {
            body {
              background: white;
            }
            .print-page {
              margin: 0;
              padding: 0;
              box-shadow: none;
            }
          }

          .print-controls {
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 8px;
            z-index: 100;
          }

          .print-btn {
            padding: 10px 20px;
            background: #B19334;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            text-decoration: none;
            display: inline-block;
          }

          .print-btn:hover {
            background: #9a8129;
          }

          .mode-btn {
            padding: 10px 20px;
            background: #18181b;
            color: #B19334;
            border: 2px solid #B19334;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            text-decoration: none;
            display: inline-block;
          }

          .mode-btn:hover {
            background: #B19334;
            color: #18181b;
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
            text-transform: uppercase;
            letter-spacing: 0.05em;
            text-decoration: none;
            display: inline-block;
          }

          .back-btn:hover {
            background: #d4d4d8;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 20px;
            border-bottom: 3px solid #B19334;
            margin-bottom: 24px;
          }

          .logo-section h1 {
            font-size: 32px;
            font-weight: 700;
            color: #B19334;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
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

          .selections-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 24px;
            padding: 12px;
            background: #f9f9f9;
            border-radius: 6px;
          }

          .selection-item {
            text-align: center;
          }

          .selection-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #71717a;
            margin-bottom: 4px;
          }

          .selection-value {
            font-weight: 600;
            color: #18181b;
            text-transform: uppercase;
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
            border-top: 2px solid #B19334;
          }

          .summary-label {
            color: #52525b;
            text-transform: uppercase;
          }

          .summary-value {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 500;
          }

          .summary-row.total .summary-value {
            color: #B19334;
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

          .production-header {
            background: #18181b;
            color: #B19334;
            padding: 8px 16px;
            border-radius: 6px;
            text-align: center;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 16px;
          }
        `}</style>
      </head>
      <body>
        {/* Print Controls */}
        <div className="print-controls">
          <button
            className="back-btn"
            id="close-btn"
            type="button"
          >
            ← CLOSE
          </button>
          <a
            className="mode-btn"
            href={isProductionMode ? basePath : `${basePath}?mode=production`}
          >
            {isProductionMode ? '💰 SHOW PRICES' : '🏭 PRODUCTION COPY'}
          </a>
          <button
            className="print-btn"
            id="print-btn"
            type="button"
          >
            🖨️ PRINT {isProductionMode ? 'PRODUCTION SHEET' : 'QUOTE'}
          </button>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          document.getElementById('close-btn').addEventListener('click', function() {
            window.close();
          });
          document.getElementById('print-btn').addEventListener('click', function() {
            window.print();
          });
        `}} />

        {/* Print Document */}
        <div className="print-page">
          {/* Production Mode Header */}
          {isProductionMode && (
            <div className="production-header">
              🏭 PRODUCTION COPY - FOR MANUFACTURING USE ONLY
            </div>
          )}

          {/* Header */}
          <div className="header">
            <div className="logo-section">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/wi-logo.svg" alt="WI Logo" style={{ height: '60px', marginBottom: '8px' }} />
              <p style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isProductionMode ? 'PRODUCTION SPECIFICATION' : 'KITCHEN INSTALLATION QUOTATION'}
              </p>
            </div>
            <div className="quote-number-section">
              <p className="quote-number" style={{ textTransform: 'uppercase' }}>#{quote.quoteNumber}</p>
              <p className="quote-date" style={{ textTransform: 'uppercase' }}>{format(new Date(quote.createdAt), 'dd MMMM yyyy').toUpperCase()}</p>
              <span className={`status-badge status-${quote.status}`}>
                {quote.status}
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="customer-section">
            <div className="customer-info">
              <h3>CUSTOMER DETAILS</h3>
              <p><strong style={{ textTransform: 'uppercase' }}>{quote.customerName}</strong></p>
              {quote.customerEmail && <p>📧 {quote.customerEmail}</p>}
              {quote.customerPhone && <p>📞 {quote.customerPhone}</p>}
            </div>
            <div className="address-info">
              <h3>INSTALLATION ADDRESS</h3>
              <p style={{ whiteSpace: 'pre-line', textTransform: 'uppercase' }}>{quote.address}</p>
              {quote.houseType && (
                <p style={{ marginTop: '8px', fontSize: '12px', color: '#71717a', textTransform: 'uppercase' }}>
                  HOUSE TYPE: {quote.houseType.name.toUpperCase()}
                  {!isProductionMode && ` (ALLOWANCE: £${Number(quote.houseType.allowance).toFixed(2)})`}
                </p>
              )}
            </div>
          </div>

          {/* Selections - Frontal, Handle, Worktop */}
          {((quote as any).frontal || (quote as any).handle || (quote as any).worktop) && (
            <div className="selections-grid">
              <div className="selection-item">
                <div className="selection-label">FRONTAL</div>
                <div className="selection-value">{(quote as any).frontal || 'NOT SELECTED'}</div>
              </div>
              <div className="selection-item">
                <div className="selection-label">HANDLE</div>
                <div className="selection-value">{(quote as any).handle || 'NOT SELECTED'}</div>
              </div>
              <div className="selection-item">
                <div className="selection-label">WORKTOP</div>
                <div className="selection-value">{(quote as any).worktop || 'NOT SELECTED'}</div>
              </div>
            </div>
          )}

          {/* Quote Items */}
          <div className="items-section">
            <h2 className="section-title" style={{ textTransform: 'uppercase' }}>
              {isProductionMode ? 'PRODUCTION ITEMS' : 'QUOTE ITEMS'} ({quote.items.length})
            </h2>
            <table className="items-table">
              <thead>
                <tr>
                  <th style={{ width: isProductionMode ? '60%' : '45%' }}>PRODUCT</th>
                  <th style={{ width: isProductionMode ? '40%' : '20%' }}>QUANTITY</th>
                  {!isProductionMode && (
                    <>
                      <th style={{ width: '15%' }}>UNIT PRICE</th>
                      <th style={{ width: '20%' }}>TOTAL</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item: any) => (
                  <tr key={item.id}>
                    <td>
                      <div className="product-name" style={{ textTransform: 'uppercase' }}>{item.productName}</div>
                      {item.productSku && (
                        <div className="product-sku">{item.productSku}</div>
                      )}
                      {item.notes && (
                        <div className="product-notes" style={{ textTransform: 'uppercase' }}>{item.notes}</div>
                      )}
                    </td>
                    <td className="quantity-info">
                      {Number(item.quantity)}{' '}
                      {item.priceUnit === 'LINEAR_METER' ? 'METER(S)' :
                       item.priceUnit === 'SQUARE_METER' ? 'M²' : 'UNIT(S)'}
                    </td>
                    {!isProductionMode && (
                      <>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          £{Number(item.unitPrice).toFixed(2)}
                        </td>
                        <td className="line-total">
                          £{Number(item.lineTotal).toFixed(2)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Additional Costs - Only show in quote mode */}
          {!isProductionMode && quote.additionalCosts.length > 0 && (
            <div className="additional-costs">
              <h2 className="section-title" style={{ textTransform: 'uppercase' }}>ADDITIONAL COSTS</h2>
              {quote.additionalCosts.map((cost: any) => (
                <div key={cost.id} className="cost-row">
                  <div className="cost-description">
                    <span style={{ textTransform: 'uppercase' }}>{cost.description}</span>
                    {cost.taxable && <span className="vat-tag">+VAT</span>}
                  </div>
                  <span className="cost-amount">£{Number(cost.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Summary - Only show in quote mode */}
          {!isProductionMode && (
            <div className="summary-section">
              <div className="summary-row total">
                <span className="summary-label">TOTAL (VAT INCLUSIVE)</span>
                <span className="summary-value">£{Number(quote.subtotal).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          {quote.notes && (
            <div className="notes-section">
              <h3 style={{ textTransform: 'uppercase' }}>NOTES</h3>
              <p style={{ textTransform: 'uppercase' }}>{quote.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="footer">
            {!isProductionMode && quote.validUntil && (
              <div className="validity">
                ⏰ THIS QUOTE IS VALID UNTIL {format(new Date(quote.validUntil), 'dd MMMM yyyy').toUpperCase()}
              </div>
            )}
            {isProductionMode && (
              <p style={{ textTransform: 'uppercase' }}>
                PRODUCTION SPECIFICATION - FOR INTERNAL USE ONLY
              </p>
            )}
            {quote.createdBy && (
              <p style={{ marginTop: '8px', textTransform: 'uppercase' }}>
                PREPARED BY: {quote.createdBy.name?.toUpperCase()}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
