// src/app/api/quotes/[id]/items/[itemId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { calculateQuoteTotal } from '@/lib/pricing';

const updateItemSchema = z.object({
  productName: z.string().min(1).max(255).optional(),
  productSku: z.string().max(100).nullable().optional(),
  quantity: z.number().positive().optional(),
  priceUnit: z.enum(['UNIT', 'LINEAR_METER', 'SQUARE_METER']).optional(),
  unitPrice: z.number().nonnegative().optional(),
  notes: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = updateItemSchema.parse(body);

    // Verify item exists and belongs to the quote
    const existingItem = await prisma.quoteItem.findUnique({
      where: { id: params.itemId },
    });

    if (!existingItem || existingItem.quoteId !== params.id) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Get quote with all items and costs
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

    // Calculate new line total if quantity or unitPrice changed
    const quantity = data.quantity ?? Number(existingItem.quantity);
    const unitPrice = data.unitPrice ?? Number(existingItem.unitPrice);
    const lineTotal = unitPrice * quantity;

    // Update the item
    const updatedItem = await prisma.quoteItem.update({
      where: { id: params.itemId },
      data: {
        ...data,
        ...(data.quantity !== undefined || data.unitPrice !== undefined
          ? { quantity, unitPrice, lineTotal }
          : {}),
      },
      include: {
        product: {
          select: { id: true, name: true, sku: true, basePrice: true },
        },
      },
    });

    // Recalculate quote totals
    const allItems = quote.items.map((item) =>
      item.id === params.itemId ? updatedItem : item
    );

    const totals = calculateQuoteTotal({
      items: allItems.map((item) => ({
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        priceUnit: item.priceUnit,
      })),
      additionalCosts: quote.additionalCosts.map((cost) => ({
        amount: Number(cost.amount),
        taxable: cost.taxable,
      })),
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
        action: 'item_updated',
        metadata: {
          itemId: params.itemId,
          updatedFields: Object.keys(data),
        },
      },
    });

    return NextResponse.json({ data: updatedItem });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('PATCH /api/quotes/[id]/items/[itemId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify item exists and belongs to the quote
    const existingItem = await prisma.quoteItem.findUnique({
      where: { id: params.itemId },
    });

    if (!existingItem || existingItem.quoteId !== params.id) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Get quote with all items and costs
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

    // Delete the item
    await prisma.quoteItem.delete({
      where: { id: params.itemId },
    });

    // Recalculate quote totals without this item
    const remainingItems = quote.items.filter((item) => item.id !== params.itemId);

    const totals = calculateQuoteTotal({
      items: remainingItems.map((item) => ({
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        priceUnit: item.priceUnit,
      })),
      additionalCosts: quote.additionalCosts.map((cost) => ({
        amount: Number(cost.amount),
        taxable: cost.taxable,
      })),
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
        action: 'item_removed',
        metadata: {
          itemId: params.itemId,
          productName: existingItem.productName,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/quotes/[id]/items/[itemId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
