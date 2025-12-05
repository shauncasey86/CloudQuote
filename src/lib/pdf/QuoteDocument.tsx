// src/lib/pdf/QuoteDocument.tsx

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#7c3aed',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    textAlign: 'right',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4,
  },
  quoteNumber: {
    fontSize: 12,
    color: '#6b7280',
  },
  date: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customerInfo: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 4,
  },
  customerName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerDetails: {
    fontSize: 9,
    color: '#4b5563',
    marginTop: 4,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#7c3aed',
    padding: 10,
    color: 'white',
  },
  tableHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  colProduct: { width: '40%' },
  colQty: { width: '15%', textAlign: 'right' },
  colUnit: { width: '20%', textAlign: 'right' },
  colTotal: { width: '25%', textAlign: 'right' },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    width: 200,
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingVertical: 4,
  },
  grandTotal: {
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: '#7c3aed',
    color: 'white',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  notesSection: {
    marginTop: 30,
  },
  notesText: {
    color: '#4b5563',
    lineHeight: 1.5,
    fontSize: 9,
  },
});

interface QuoteDocumentProps {
  quote: {
    quoteNumber: string;
    customerName: string;
    customerEmail?: string | null;
    customerPhone?: string | null;
    address: string;
    createdAt: Date;
    subtotal: number;
    vatRate: number;
    vatAmount: number;
    total: number;
    notes?: string | null;
  };
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    priceUnit: string;
    unitPrice: number;
    lineTotal: number;
  }>;
  additionalCosts?: Array<{
    id: string;
    description: string;
    amount: number;
  }>;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export function QuoteDocument({
  quote,
  items,
  additionalCosts = [],
  companyInfo,
}: QuoteDocumentProps) {
  const company = companyInfo || {
    name: 'Your Company',
    address: 'Company Address',
    phone: '01234 567890',
    email: 'quotes@yourcompany.com',
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{company.name}</Text>
            <Text style={styles.companyDetails}>{company.address}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>QUOTE</Text>
            <Text style={styles.quoteNumber}>#{quote.quoteNumber}</Text>
            <Text style={styles.date}>
              {format(new Date(quote.createdAt), 'dd MMMM yyyy')}
            </Text>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{quote.customerName}</Text>
            <Text style={styles.customerDetails}>{quote.address}</Text>
            {quote.customerEmail && (
              <Text style={styles.customerDetails}>{quote.customerEmail}</Text>
            )}
            {quote.customerPhone && (
              <Text style={styles.customerDetails}>{quote.customerPhone}</Text>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colProduct]}>
                Product
              </Text>
              <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderText, styles.colUnit]}>
                Unit Price
              </Text>
              <Text style={[styles.tableHeaderText, styles.colTotal]}>
                Total
              </Text>
            </View>

            {items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.tableRow,
                  ...(index % 2 === 1 ? [styles.tableRowAlt] : []),
                ]}
              >
                <Text style={styles.colProduct}>{item.productName}</Text>
                <Text style={styles.colQty}>
                  {item.quantity}
                  {item.priceUnit === 'LINEAR_METER' ? 'm' : ''}
                </Text>
                <Text style={styles.colUnit}>
                  £{item.unitPrice.toFixed(2)}
                </Text>
                <Text style={styles.colTotal}>
                  £{item.lineTotal.toFixed(2)}
                </Text>
              </View>
            ))}

            {additionalCosts.map((cost, index) => (
              <View
                key={cost.id}
                style={[
                  styles.tableRow,
                  ...((items.length + index) % 2 === 1 ? [styles.tableRowAlt] : []),
                ]}
              >
                <Text style={styles.colProduct}>{cost.description}</Text>
                <Text style={styles.colQty}>—</Text>
                <Text style={styles.colUnit}>—</Text>
                <Text style={styles.colTotal}>£{cost.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>£{quote.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>VAT ({quote.vatRate}%)</Text>
            <Text>£{quote.vatAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>TOTAL</Text>
            <Text>£{quote.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{quote.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This quote is valid for 30 days from the date of issue. Prices
            include VAT where applicable.
          </Text>
          <Text style={{ marginTop: 4 }}>
            {company.phone} | {company.email}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
