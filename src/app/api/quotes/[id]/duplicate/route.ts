// src/app/api/quotes/[id]/duplicate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch the original quote with all related data
    const originalQuote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
        additionalCosts: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!originalQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Generate new quote number by appending "-COPY" and timestamp
    const timestamp = Date.now().toString().slice(-6);
    let newQuoteNumber = `${originalQuote.quoteNumber}-COPY-${timestamp}`;

    // Ensure uniqueness
    let counter = 1;
    while (await prisma.quote.findUnique({ where: { quoteNumber: newQuoteNumber } })) {
      newQuoteNumber = `${originalQuote.quoteNumber}-COPY-${timestamp}-${counter}`;
      counter++;
    }

    // Create the duplicated quote
    const duplicatedQuote = await prisma.quote.create({
      data: {
        quoteNumber: newQuoteNumber,
        status: 'DRAFT', // Always start as DRAFT
        customerName: originalQuote.customerName,
        customerEmail: originalQuote.customerEmail,
        customerPhone: originalQuote.customerPhone,
        address: originalQuote.address,
        postcode: originalQuote.postcode,
        houseTypeId: originalQuote.houseTypeId,
        houseTypeAllowance: originalQuote.houseTypeAllowance,
        frontal: originalQuote.frontal,
        handle: originalQuote.handle,
        worktop: originalQuote.worktop,
        subtotal: originalQuote.subtotal,
        vatRate: originalQuote.vatRate,
        vatAmount: originalQuote.vatAmount,
        total: originalQuote.total,
        notes: originalQuote.notes,
        internalNotes: originalQuote.internalNotes,
        validUntil: originalQuote.validUntil,
        createdById: session.user.id,
        items: {
          create: originalQuote.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku,
            quantity: item.quantity,
            priceUnit: item.priceUnit,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
            sortOrder: item.sortOrder,
            notes: item.notes,
          })),
        },
        additionalCosts: {
          create: originalQuote.additionalCosts.map((cost) => ({
            description: cost.description,
            amount: cost.amount,
            taxable: cost.taxable,
            sortOrder: cost.sortOrder,
          })),
        },
      },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
        additionalCosts: { orderBy: { sortOrder: 'asc' } },
        houseType: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Log the duplication
    await prisma.changeHistory.create({
      data: {
        quoteId: duplicatedQuote.id,
        userId: session.user.id,
        action: 'create',
        metadata: {
          duplicatedFrom: originalQuote.id,
          originalQuoteNumber: originalQuote.quoteNumber,
        },
      },
    });

    return NextResponse.json({ data: duplicatedQuote }, { status: 201 });
  } catch (error) {
    console.error('POST /api/quotes/[id]/duplicate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
