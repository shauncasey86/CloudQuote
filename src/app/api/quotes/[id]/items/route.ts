// src/app/api/quotes/[id]/items/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { calculateQuoteTotal } from '@/lib/pricing';

const createItemSchema = z.object({
  productId: z.string().optional().nullable(),
  productName: z.string().min(1).max(255),
  productSku: z.string().max(100).optional().nullable(),
  quantity: z.number().positive(),
  priceUnit: z.enum(['UNIT', 'LINEAR_METER', 'SQUARE_METER']),
  unitPrice: z.number().nonnegative(),
  notes: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createItemSchema.parse(body);

    // Verify quote exists
    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        additionalCosts: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // If productId provided, fetch product details
    if (data.productId) {
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
      });

      if (product) {
        // Use product details if not explicitly provided
        if (!data.productName || data.productName === '') {
          data.productName = product.name;
        }
        if (!data.productSku) {
          data.productSku = product.sku;
        }
        if (!data.unitPrice || data.unitPrice === 0) {
          data.unitPrice = Number(product.basePrice);
        }
        if (!data.priceUnit) {
          data.priceUnit = product.priceUnit;
        }
      }
    }

    // Calculate line total
    const houseTypeMultiplier = Number(quote.houseTypeMultiplier);
    const adjustedUnitPrice = data.unitPrice * houseTypeMultiplier;
    const lineTotal = adjustedUnitPrice * data.quantity;

    // Get next sort order
    const maxSortOrder = quote.items.reduce(
      (max, item) => Math.max(max, item.sortOrder),
      0
    );

    // Create the item
    const item = await prisma.quoteItem.create({
      data: {
        quoteId: params.id,
        productId: data.productId,
        productName: data.productName,
        productSku: data.productSku,
        quantity: data.quantity,
        priceUnit: data.priceUnit,
        unitPrice: data.unitPrice,
        lineTotal,
        notes: data.notes,
        sortOrder: data.sortOrder ?? maxSortOrder + 1,
      },
      include: {
        product: {
          select: { id: true, name: true, sku: true, basePrice: true },
        },
      },
    });

    // Recalculate quote totals
    const allItems = [...quote.items, item];
    const totals = calculateQuoteTotal({
      items: allItems.map((i) => ({
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        priceUnit: i.priceUnit,
      })),
      additionalCosts: quote.additionalCosts.map((cost) => ({
        amount: Number(cost.amount),
        taxable: cost.taxable,
      })),
      houseTypeMultiplier,
      vatRate: Number(quote.vatRate),
    });

    // Update quote with new totals
    await prisma.quote.update({
      where: { id: params.id },
      data: {
        subtotal: totals.subtotal,
        vatAmount: totals.vatAmount,
        total: totals.total,
        updatedById: session.user.id,
      },
    });

    // Log the action
    await prisma.changeHistory.create({
      data: {
        quoteId: params.id,
        userId: session.user.id,
        action: 'item_added',
        metadata: {
          itemId: item.id,
          productName: item.productName,
          quantity: Number(item.quantity),
        },
      },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('POST /api/quotes/[id]/items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
