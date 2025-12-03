// src/app/api/quotes/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { calculateQuoteTotal } from '@/lib/pricing';
import { Role, Prisma } from '@prisma/client';

const updateQuoteSchema = z.object({
  quoteNumber: z.string().min(1).max(50).optional(),
  customerName: z.string().min(1).max(255).optional(),
  customerEmail: z.string().email().nullable().optional(),
  customerPhone: z.string().max(50).nullable().optional(),
  address: z.string().min(1).optional(),
  houseTypeId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  internalNotes: z.string().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
  status: z.enum(['DRAFT', 'FINALIZED', 'SENT', 'SAVED', 'ARCHIVED']).optional(),
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

    // Get new house type multiplier if changed
    let houseTypeMultiplier = existingQuote.houseTypeMultiplier;
    if (data.houseTypeId !== undefined) {
      if (data.houseTypeId) {
        const houseType = await prisma.houseType.findUnique({
          where: { id: data.houseTypeId },
        });
        if (houseType) {
          houseTypeMultiplier = houseType.multiplier;
        }
      } else {
        houseTypeMultiplier = new Prisma.Decimal(1.0);
      }
    }

    // Recalculate totals if house type changed
    let subtotal = existingQuote.subtotal;
    let vatAmount = existingQuote.vatAmount;
    let total = existingQuote.total;

    if (houseTypeMultiplier !== existingQuote.houseTypeMultiplier) {
      const calculatedTotals = calculateQuoteTotal({
        items: existingQuote.items.map((item) => ({
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          priceUnit: item.priceUnit,
        })),
        additionalCosts: existingQuote.additionalCosts.map((cost) => ({
          amount: Number(cost.amount),
          taxable: cost.taxable,
        })),
        houseTypeMultiplier: Number(houseTypeMultiplier),
        vatRate: Number(existingQuote.vatRate),
      });
      subtotal = new Prisma.Decimal(calculatedTotals.subtotal);
      vatAmount = new Prisma.Decimal(calculatedTotals.vatAmount);
      total = new Prisma.Decimal(calculatedTotals.total);
    }

    const quote = await prisma.quote.update({
      where: { id: params.id },
      data: {
        ...data,
        houseTypeMultiplier,
        subtotal,
        vatAmount,
        total,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
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

  // Only ADMIN can delete quotes
  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Archive instead of delete
    await prisma.quote.update({
      where: { id: params.id },
      data: {
        status: 'ARCHIVED',
        updatedById: session.user.id,
      },
    });

    // Log the action
    await prisma.changeHistory.create({
      data: {
        quoteId: params.id,
        userId: session.user.id,
        action: 'archived',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/quotes/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
