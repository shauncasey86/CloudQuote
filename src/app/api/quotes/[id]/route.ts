// src/app/api/quotes/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { calculateQuoteTotal } from '@/lib/pricing';
import { Prisma } from '@prisma/client';

const quoteItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().nullable().optional(),
  productName: z.string(),
  productSku: z.string().optional().nullable(),
  quantity: z.union([z.number(), z.string()]).transform(v => Number(v)),
  priceUnit: z.enum(['UNIT', 'LINEAR_METER', 'SQUARE_METER']),
  unitPrice: z.union([z.number(), z.string()]).transform(v => Number(v)),
  lineTotal: z.union([z.number(), z.string()]).transform(v => Number(v)),
  isInAllowance: z.boolean().optional(),
  notes: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
  basePrice: z.union([z.number(), z.string()]).transform(v => Number(v)).optional(),
  product: z.any().optional(), // Allow nested product from database
});

const additionalCostSchema = z.object({
  id: z.string().optional(),
  description: z.string(),
  amount: z.union([z.number(), z.string()]).transform(v => Number(v)),
  taxable: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

const updateQuoteSchema = z.object({
  quoteNumber: z.string().min(1).max(50).optional(),
  customerName: z.string().min(1).max(255).optional(),
  customerEmail: z.string().email().nullable().optional().or(z.literal('')),
  customerPhone: z.string().max(50).nullable().optional(),
  address: z.string().min(1).optional(),
  postcode: z.string().nullable().optional(),
  houseTypeId: z.string().nullable().optional(),
  frontal: z.string().nullable().optional(),
  handle: z.string().nullable().optional(),
  worktop: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  internalNotes: z.string().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
  status: z.enum(['DRAFT', 'FINALIZED', 'PRINTED', 'SENT', 'SAVED', 'ARCHIVED']).optional(),
  bespokeUpliftQty: z.union([z.number(), z.string()]).transform(v => Number(v)).optional(),
  items: z.array(quoteItemSchema).optional(),
  additionalCosts: z.array(additionalCostSchema).optional(),
  subtotal: z.union([z.number(), z.string()]).transform(v => Number(v)).optional(),
  vatAmount: z.union([z.number(), z.string()]).transform(v => Number(v)).optional(),
  total: z.union([z.number(), z.string()]).transform(v => Number(v)).optional(),
  // Allow these to be passed but ignore them (calculated on frontend)
  houseTypeAllowance: z.any().optional(),
  itemsSubtotal: z.any().optional(),
  additionalTotal: z.any().optional(),
  bespokeUplift: z.any().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            product: {
              select: { id: true, name: true, sku: true, basePrice: true },
            },
          },
        },
        additionalCosts: { orderBy: { sortOrder: 'asc' } },
        houseType: true,
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
        changeHistory: {
          orderBy: { changedAt: 'desc' },
          take: 20,
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    return NextResponse.json({ data: quote });
  } catch (error) {
    console.error('GET /api/quotes/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = updateQuoteSchema.parse(body);

    // Check if quote exists
    const existingQuote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        additionalCosts: true,
      },
    });

    if (!existingQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Check for duplicate quote number if changing it
    if (data.quoteNumber && data.quoteNumber !== existingQuote.quoteNumber) {
      const duplicate = await prisma.quote.findUnique({
        where: { quoteNumber: data.quoteNumber },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: 'Quote number already exists' },
          { status: 400 }
        );
      }
    }

    // Get new house type allowance if changed
    let houseTypeAllowance = existingQuote.houseTypeAllowance;
    if (data.houseTypeId !== undefined) {
      if (data.houseTypeId) {
        const houseType = await prisma.houseType.findUnique({
          where: { id: data.houseTypeId },
        });
        if (houseType) {
          houseTypeAllowance = houseType.allowance;
        }
      } else {
        houseTypeAllowance = new Prisma.Decimal(0);
      }
    }

    // Extract items, additionalCosts, and frontend-only calculated fields from data
    const {
      items,
      additionalCosts,
      subtotal,
      vatAmount,
      total,
      // These are frontend-calculated fields that should not be sent to Prisma
      houseTypeAllowance: _houseTypeAllowance,
      itemsSubtotal: _itemsSubtotal,
      additionalTotal: _additionalTotal,
      bespokeUplift: _bespokeUplift,
      ...quoteData
    } = data;

    // Use transaction to update quote, items, and costs atomically
    const quote = await prisma.$transaction(async (tx) => {
      // Update items if provided
      if (items !== undefined) {
        // Delete existing items
        await tx.quoteItem.deleteMany({
          where: { quoteId: params.id },
        });

        // Create new items
        if (items.length > 0) {
          await tx.quoteItem.createMany({
            data: items.map((item, index) => ({
              quoteId: params.id,
              productId: item.productId,
              productName: item.productName,
              productSku: item.productSku || null,
              quantity: item.quantity,
              priceUnit: item.priceUnit,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
              isInAllowance: item.isInAllowance || false,
              notes: item.notes || null,
              sortOrder: item.sortOrder ?? index,
            })),
          });
        }
      }

      // Update additional costs if provided
      if (additionalCosts !== undefined) {
        // Delete existing costs
        await tx.additionalCost.deleteMany({
          where: { quoteId: params.id },
        });

        // Create new costs
        if (additionalCosts.length > 0) {
          await tx.additionalCost.createMany({
            data: additionalCosts.map((cost, index) => ({
              quoteId: params.id,
              description: cost.description,
              amount: cost.amount,
              taxable: cost.taxable ?? true,
              sortOrder: cost.sortOrder ?? index,
            })),
          });
        }
      }

      // Update the quote
      return tx.quote.update({
        where: { id: params.id },
        data: {
          ...quoteData,
          customerEmail: quoteData.customerEmail === '' ? null : quoteData.customerEmail,
          houseTypeAllowance,
          subtotal: subtotal ?? undefined,
          total: total ?? undefined,
          validUntil: quoteData.validUntil ? new Date(quoteData.validUntil) : undefined,
          updatedById: session.user.id,
        },
        include: {
          items: { orderBy: { sortOrder: 'asc' } },
          additionalCosts: { orderBy: { sortOrder: 'asc' } },
          houseType: true,
          createdBy: { select: { id: true, name: true } },
          updatedBy: { select: { id: true, name: true } },
        },
      });
    });

    // Log the update
    await prisma.changeHistory.create({
      data: {
        quoteId: params.id,
        userId: session.user.id,
        action: 'update',
        metadata: { updatedFields: Object.keys(data) },
      },
    });

    return NextResponse.json({ data: quote });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('PATCH /api/quotes/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Delete related records first, then the quote
    await prisma.$transaction([
      prisma.changeHistory.deleteMany({ where: { quoteId: params.id } }),
      prisma.quoteItem.deleteMany({ where: { quoteId: params.id } }),
      prisma.additionalCost.deleteMany({ where: { quoteId: params.id } }),
      prisma.quote.delete({ where: { id: params.id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/quotes/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
