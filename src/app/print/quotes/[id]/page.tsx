import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      updatedBy: { select: { name: true, email: true } },
      changeHistory: {
        orderBy: { changedAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, name: true } },
        },
      },
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
              margin: 10mm;
            }

            *, *::before, *::after {
              background: transparent !important;
              background-color: transparent !important;
            }

            html, body {
              background: white !important;
              background-color: white !important;
              min-height: auto !important;
              font-size: 11px !important;
            }

            .print-controls {
              display: none !important;
            }

            .print-page {
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              background: white !important;
              background-color: white !important;
              min-height: auto !important;
              max-width: none !important;
            }

            .header {
              border-bottom-color: #B19334 !important;
            }

            .status-badge {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .summary-section, .info-bar, .notes-section {
              background: #fafafa !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .items-table th {
              background: #f4f4f5 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
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
            font-size: 12px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-page {
            max-width: 210mm;
            margin: 20px auto;
            padding: 16px;
            background: white;
            color: #18181b;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
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
            padding: 8px 16px;
            background: #B19334;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            text-decoration: none;
            display: inline-block;
          }

          .print-btn:hover {
            background: #9a8129;
          }

          .mode-btn {
            padding: 8px 16px;
            background: #18181b;
            color: #B19334;
            border: 2px solid #B19334;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 13px;
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
            padding: 8px 16px;
            background: #e4e4e7;
            color: #18181b;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 13px;
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
            padding-bottom: 12px;
            border-bottom: 2px solid #B19334;
            margin-bottom: 12px;
          }

          .logo-section h1 {
            font-size: 24px;
            font-weight: 700;
            color: #B19334;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .logo-section p {
            font-size: 10px;
            color: #71717a;
            margin: 2px 0 0 0;
          }

          .quote-number-section {
            text-align: right;
          }

          .quote-number {
            font-size: 18px;
            font-weight: 700;
            color: #18181b;
            margin: 0;
          }

          .quote-date {
            font-size: 10px;
            color: #71717a;
            margin: 2px 0 0 0;
          }

          .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            margin-top: 4px;
          }

          .status-DRAFT { background: #e4e4e7; color: #52525b; }
          .status-FINALIZED { background: #fef3c7; color: #92400e; }
          .status-SENT { background: #d1fae5; color: #065f46; }
          .status-SAVED { background: #dbeafe; color: #1e40af; }
          .status-ARCHIVED { background: #fee2e2; color: #991b1b; }

          .info-bar {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 12px;
            padding: 10px 12px;
            background: #fafafa;
            border-radius: 6px;
            font-size: 11px;
          }

          .info-block {
            flex: 1;
          }

          .info-block.address-block {
            flex: 1.5;
          }

          .info-label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #71717a;
            margin-bottom: 2px;
          }

          .info-value {
            color: #18181b;
            font-weight: 500;
            line-height: 1.3;
          }

          .info-value.name {
            font-size: 13px;
            font-weight: 600;
          }

          .selections-row {
            display: flex;
            justify-content: center;
            gap: 32px;
            margin-bottom: 12px;
            padding: 8px 12px;
            background: #f9f9f9;
            border-radius: 4px;
            font-size: 11px;
          }

          .selection-item {
            display: flex;
            gap: 6px;
            text-align: center;
          }

          .selection-label {
            font-size: 9px;
            text-transform: uppercase;
            color: #71717a;
          }

          .selection-value {
            font-weight: 600;
            color: #18181b;
            text-transform: uppercase;
          }

          .items-section {
            margin-bottom: 12px;
          }

          .section-title {
            font-size: 11px;
            font-weight: 600;
            color: #18181b;
            margin: 0 0 6px 0;
            padding-bottom: 4px;
            border-bottom: 1px solid #e4e4e7;
            text-transform: uppercase;
          }

          .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }

          .items-table th {
            text-align: center;
            padding: 4px 4px;
            background: #f9f9f9;
            font-weight: 600;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            color: #52525b;
            border-bottom: 1px solid #e0e0e0;
          }

          .items-table td {
            padding: 3px 4px;
            border-bottom: 1px solid #f0f0f0;
            vertical-align: top;
          }

          .items-table tr:last-child td {
            border-bottom: none;
          }

          .items-table .col-qty,
          .items-table .col-each,
          .items-table .col-total {
            width: 50px;
            text-align: right;
          }

          .items-table .col-check {
            width: 30px;
            text-align: center;
          }

          .items-table .col-notes {
            width: 120px;
          }

          .checkbox-cell {
            width: 14px;
            height: 14px;
            border: 1px solid #999;
            display: inline-block;
            vertical-align: middle;
          }

          .notes-line {
            border-bottom: 1px solid #ccc;
            height: 18px;
            width: 100%;
          }

          .product-name {
            font-weight: 500;
            color: #18181b;
          }

          .product-sku {
            font-size: 9px;
            color: #a1a1aa;
            font-family: 'JetBrains Mono', monospace;
          }

          .product-notes {
            font-size: 10px;
            color: #71717a;
            font-style: italic;
            margin-top: 2px;
          }

          .quantity-info {
            white-space: nowrap;
          }

          .line-total {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
          }

          .allowance-badge {
            font-size: 8px;
            padding: 1px 4px;
            background: #d1fae5;
            color: #065f46;
            border-radius: 3px;
            margin-left: 4px;
          }

          .additional-costs {
            margin-bottom: 12px;
          }

          .cost-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 6px;
            border-bottom: 1px solid #f4f4f5;
            font-size: 11px;
          }

          .cost-row:last-child {
            border-bottom: none;
          }

          .cost-description {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .vat-tag {
            font-size: 8px;
            padding: 1px 4px;
            background: #dbeafe;
            color: #1e40af;
            border-radius: 3px;
          }

          .cost-amount {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 500;
          }

          .summary-section {
            margin-top: 12px;
            padding: 10px 12px;
            background: #fafafa;
            border-radius: 6px;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
            font-size: 11px;
          }

          .summary-row.total {
            font-size: 14px;
            font-weight: 700;
            padding-top: 8px;
            margin-top: 6px;
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
            margin-top: 12px;
            padding: 8px 12px;
            background: #fafafa;
            border-radius: 6px;
          }

          .notes-section h3 {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #71717a;
            margin: 0 0 4px 0;
          }

          .notes-section p {
            font-size: 11px;
            color: #18181b;
            margin: 0;
            white-space: pre-line;
          }

          .footer {
            margin-top: 16px;
            padding-top: 10px;
            border-top: 1px solid #e4e4e7;
            text-align: center;
          }

          .footer p {
            font-size: 9px;
            color: #71717a;
            margin: 2px 0;
          }

          .validity {
            display: inline-block;
            padding: 4px 10px;
            background: #fef3c7;
            border-radius: 4px;
            font-size: 10px;
            color: #92400e;
            margin-bottom: 8px;
          }

          .production-header {
            background: #18181b;
            color: #B19334;
            padding: 6px 12px;
            border-radius: 4px;
            text-align: center;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 12px;
          }

          .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
          }

          .change-history {
            flex: 1;
            text-align: left;
            max-width: 60%;
          }

          .change-history h4 {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #71717a;
            margin: 0 0 4px 0;
          }

          .change-history-list {
            font-size: 9px;
            color: #52525b;
            line-height: 1.4;
          }

          .change-history-list span {
            display: block;
          }
        `}</style>
      </head>
      <body>
        {/* Print Controls - rendered as raw HTML for inline onclick support */}
        <div
          className="print-controls"
          dangerouslySetInnerHTML={{
            __html: `
              <button class="back-btn" type="button" onclick="if(window.opener){window.close()}else if(window.history.length>1){window.history.back()}else{window.location.href='/quotes'}">
                ← CLOSE
              </button>
              <a class="mode-btn" href="${isProductionMode ? basePath : `${basePath}?mode=production`}">
                ${isProductionMode ? '💰 SHOW INVOICE' : '🏭 JOB SPEC'}
              </a>
              <button class="print-btn" type="button" onclick="window.print()">
                🖨️ PRINT ${isProductionMode ? 'JOB SPEC' : 'INVOICE'}
              </button>
            `
          }}
        />

        {/* Print Document */}
        <div className="print-page">
          {/* Production Mode Header */}
          {isProductionMode && (
            <div className="production-header">
              🏭 JOB SPEC - FOR MANUFACTURING USE ONLY
            </div>
          )}

          {/* Header */}
          <div className="header">
            <div className="logo-section">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/wi-logo.svg" alt="WI Logo" style={{ height: '48px', marginBottom: '4px' }} />
              <p style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isProductionMode ? 'CONTRACT KITCHEN JOB SPEC' : 'CONTRACT KITCHEN INVOICE'}
              </p>
            </div>
            <div className="quote-number-section">
              <p className="quote-number" style={{ textTransform: 'uppercase' }}>#{quote.quoteNumber}</p>
              <p className="quote-date" style={{ textTransform: 'uppercase' }}>{format(new Date(quote.createdAt), 'dd MMM yyyy').toUpperCase()}</p>
            </div>
          </div>

          {/* Compact Customer & Address Info Bar */}
          <div className="info-bar">
            <div className="info-block">
              <div className="info-label">CUSTOMER</div>
              <div className="info-value name" style={{ textTransform: 'uppercase' }}>{quote.customerName}</div>
              {quote.customerPhone && <div className="info-value">📞 {quote.customerPhone}</div>}
              {quote.customerEmail && <div className="info-value" style={{ fontSize: '10px' }}>📧 {quote.customerEmail}</div>}
            </div>
            <div className="info-block address-block">
              <div className="info-label">INSTALLATION ADDRESS</div>
              <div className="info-value" style={{ textTransform: 'uppercase' }}>
                {quote.address}{quote.postcode ? `, ${quote.postcode}` : ''}
              </div>
            </div>
            <div className="info-block">
              <div className="info-label">HOUSE TYPE</div>
              <div className="info-value" style={{ textTransform: 'uppercase' }}>
                {quote.houseType ? quote.houseType.name.toUpperCase() : 'NOT SET'}
              </div>
            </div>
          </div>

          {/* Compact Selections Row */}
          {((quote as any).frontal || (quote as any).handle || (quote as any).worktop) && (
            <div className="selections-row">
              <div className="selection-item">
                <span className="selection-label">FRONTAL:</span>
                <span className="selection-value">{(quote as any).frontal || '—'}</span>
              </div>
              <div className="selection-item">
                <span className="selection-label">HANDLE:</span>
                <span className="selection-value">{(quote as any).handle || '—'}</span>
              </div>
              <div className="selection-item">
                <span className="selection-label">WORKTOP:</span>
                <span className="selection-value">{(quote as any).worktop || '—'}</span>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="items-section">
            <h2 className="section-title">
              ITEMS ({quote.items.length})
            </h2>
            <table className="items-table">
              <thead>
                <tr>
                  <th style={{ width: isProductionMode ? '40%' : '40%' }}>PRODUCT</th>
                  <th className="col-qty">QTY</th>
                  {!isProductionMode && (
                    <>
                      <th className="col-each">EACH</th>
                      <th className="col-total">TOTAL</th>
                    </>
                  )}
                  {isProductionMode && (
                    <>
                      <th className="col-check">✓</th>
                      <th className="col-notes">NOTES</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item: any) => (
                  <tr key={item.id}>
                    <td>
                      <span className="product-name" style={{ textTransform: 'uppercase' }}>
                        {item.productName}
                      </span>
                      {item.productSku && (
                        <div className="product-sku">{item.productSku}</div>
                      )}
                      {item.notes && (
                        <div className="product-notes" style={{ textTransform: 'uppercase' }}>{item.notes}</div>
                      )}
                    </td>
                    <td className="quantity-info col-qty">
                      {Number(item.quantity)}{' '}
                      {item.priceUnit === 'LINEAR_METER' ? 'M' :
                       item.priceUnit === 'SQUARE_METER' ? 'M²' : ''}
                    </td>
                    {!isProductionMode && (
                      <>
                        <td className="col-each" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          £{Number(item.unitPrice).toFixed(2)}
                        </td>
                        <td className="line-total col-total">
                          £{Number(item.lineTotal).toFixed(2)}
                        </td>
                      </>
                    )}
                    {isProductionMode && (
                      <>
                        <td className="col-check">
                          <span className="checkbox-cell"></span>
                        </td>
                        <td className="col-notes">
                          <div className="notes-line"></div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Additional Costs & Bespoke Uplift - Only show in quote mode */}
          {!isProductionMode && (quote.additionalCosts.length > 0 || (quote.bespokeUpliftQty > 0)) && (
            <div className="additional-costs">
              <h2 className="section-title">ADDITIONAL COSTS</h2>
              {quote.additionalCosts.map((cost: any) => (
                <div key={cost.id} className="cost-row">
                  <div className="cost-description">
                    <span style={{ textTransform: 'uppercase' }}>{cost.description}</span>
                    {cost.taxable && <span className="vat-tag">+VAT</span>}
                  </div>
                  <span className="cost-amount">£{Number(cost.amount).toFixed(2)}</span>
                </div>
              ))}
              {quote.bespokeUpliftQty > 0 && (
                <div className="cost-row">
                  <div className="cost-description">
                    <span style={{ textTransform: 'uppercase' }}>BESPOKE UPLIFT COST × {quote.bespokeUpliftQty}</span>
                  </div>
                  <span className="cost-amount">£{(quote.bespokeUpliftQty * 30).toFixed(2)}</span>
                </div>
              )}
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
                ⏰ THIS INVOICE IS VALID UNTIL {format(new Date(quote.validUntil), 'dd MMMM yyyy').toUpperCase()}
              </div>
            )}
            {isProductionMode && (
              <p style={{ textTransform: 'uppercase', marginBottom: '8px' }}>
                CONTRACT KITCHEN JOB SPEC - FOR INTERNAL USE ONLY
              </p>
            )}
            <div className="footer-content">
              {/* Change History - Bottom Left */}
              <div className="change-history">
                <h4>DOCUMENT HISTORY</h4>
                <div className="change-history-list">
                  {quote.createdBy && (
                    <span>
                      CREATED: {format(new Date(quote.createdAt), 'dd MMM yyyy HH:mm').toUpperCase()} BY {quote.createdBy.name?.toUpperCase()}
                    </span>
                  )}
                  {quote.updatedBy && quote.updatedAt && new Date(quote.updatedAt).getTime() !== new Date(quote.createdAt).getTime() && (
                    <span>
                      LAST EDITED: {format(new Date(quote.updatedAt), 'dd MMM yyyy HH:mm').toUpperCase()} BY {quote.updatedBy.name?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
