// src/app/api/quotes/[id]/send/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { sendQuoteEmail } from '@/lib/email';
import { QuoteDocument } from '@/lib/pdf/QuoteDocument';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch complete quote data
    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
        additionalCosts: { orderBy: { sortOrder: 'asc' } },
        houseType: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (!quote.customerEmail) {
      return NextResponse.json(
        { error: 'No customer email address' },
        { status: 400 }
      );
    }

    // Generate PDF
    const document = React.createElement(QuoteDocument, {
      quote: {
        quoteNumber: quote.quoteNumber,
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        customerPhone: quote.customerPhone,
        address: quote.address,
        createdAt: quote.createdAt,
        subtotal: Number(quote.subtotal),
        vatRate: Number(quote.vatRate),
        vatAmount: Number(quote.vatAmount),
        total: Number(quote.total),
        notes: quote.notes,
      },
      items: quote.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        quantity: Number(item.quantity),
        priceUnit: item.priceUnit,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
      })),
      additionalCosts: quote.additionalCosts.map((cost) => ({
        id: cost.id,
        description: cost.description,
        amount: Number(cost.amount),
      })),
    });

    const pdfBuffer = await renderToBuffer(document as any);

    // Send email
    await sendQuoteEmail({
      to: quote.customerEmail,
      quoteNumber: quote.quoteNumber,
      customerName: quote.customerName,
      pdfBuffer: Buffer.from(pdfBuffer),
    });

    // Update quote status
    await prisma.quote.update({
      where: { id: params.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        updatedById: session.user.id,
      },
    });

    // Log the action
    await prisma.changeHistory.create({
      data: {
        quoteId: params.id,
        userId: session.user.id,
        action: 'email_sent',
        metadata: { sentTo: quote.customerEmail },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/quotes/[id]/send error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
