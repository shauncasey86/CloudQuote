// src/app/api/quotes/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

const quoteItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  productSku: z.string().optional().nullable(),
  quantity: z.number(),
  priceUnit: z.enum(['UNIT', 'LINEAR_METER', 'SQUARE_METER']),
  unitPrice: z.number(),
  lineTotal: z.number(),
  notes: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
});

const additionalCostSchema = z.object({
  description: z.string(),
  amount: z.number(),
  taxable: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

const createQuoteSchema = z.object({
  quoteNumber: z.string().min(1).max(50),
  customerName: z.string().min(1).max(255),
  customerEmail: z.string().email().optional().nullable().or(z.literal('')),
  customerPhone: z.string().max(50).optional().nullable(),
  address: z.string().min(1),
  postcode: z.string().optional().nullable(),
  houseTypeId: z.string().optional().nullable(),
  frontal: z.string().optional().nullable(),
  handle: z.string().optional().nullable(),
  worktop: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
  status: z.enum(['DRAFT', 'FINALIZED', 'PRINTED', 'SENT', 'SAVED', 'ARCHIVED']).optional(),
  items: z.array(quoteItemSchema).optional(),
  additionalCosts: z.array(additionalCostSchema).optional(),
  bespokeUpliftCost: z.number().optional(),
  subtotal: z.number().optional(),
  vatAmount: z.number().optional(),
  total: z.number().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // Build status filter
    let statusFilter: Prisma.QuoteWhereInput['status'];
    if (status === 'all') {
      // Show all statuses including archived
      statusFilter = undefined;
    } else if (status) {
      // Show specific status
      statusFilter = { equals: status as any };
    } else {
      // Default: exclude archived
      statusFilter = { not: 'ARCHIVED' };
    }

    const where: Prisma.QuoteWhereInput = {
      ...(statusFilter && { status: statusFilter }),
      ...(search && {
        OR: [
          { quoteNumber: { contains: search, mode: 'insensitive' } },
          { customerName: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          houseType: { select: { id: true, name: true, allowance: true } },
          _count: { select: { items: true, additionalCosts: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.quote.count({ where }),
    ]);

    return NextResponse.json({
      data: quotes,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/quotes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createQuoteSchema.parse(body);

    // Check for duplicate quote number
    const existing = await prisma.quote.findUnique({
      where: { quoteNumber: data.quoteNumber },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Quote number already exists' },
        { status: 400 }
      );
    }

    // Get house type allowance if specified
    let houseTypeAllowance = 0;
    if (data.houseTypeId) {
      const houseType = await prisma.houseType.findUnique({
        where: { id: data.houseTypeId },
      });
      if (houseType) {
        houseTypeAllowance = Number(houseType.allowance);
      }
    }

    // Extract items and additionalCosts from data
    const { items, additionalCosts, bespokeUpliftCost, subtotal, vatAmount, total, ...quoteData } = data;

    const quote = await prisma.quote.create({
      data: {
        ...quoteData,
        customerEmail: quoteData.customerEmail || null,
        houseTypeAllowance,
        bespokeUpliftCost: bespokeUpliftCost ?? 30,
        status: quoteData.status || 'DRAFT',
        subtotal: subtotal || 0,
        vatAmount: vatAmount || 0,
        total: total || 0,
        validUntil: quoteData.validUntil ? new Date(quoteData.validUntil) : null,
        createdById: session.user.id,
        // Create items if provided
        ...(items && items.length > 0 && {
          items: {
            create: items.map((item, index) => ({
              productId: item.productId,
              productName: item.productName,
              productSku: item.productSku || null,
              quantity: item.quantity,
              priceUnit: item.priceUnit,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
              notes: item.notes || null,
              sortOrder: item.sortOrder ?? index,
            })),
          },
        }),
        // Create additionalCosts if provided
        ...(additionalCosts && additionalCosts.length > 0 && {
          additionalCosts: {
            create: additionalCosts.map((cost, index) => ({
              description: cost.description,
              amount: cost.amount,
              taxable: cost.taxable ?? true,
              sortOrder: cost.sortOrder ?? index,
            })),
          },
        }),
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        houseType: true,
        items: true,
        additionalCosts: true,
      },
    });

    // Log creation
    await prisma.changeHistory.create({
      data: {
        quoteId: quote.id,
        userId: session.user.id,
        action: 'create',
        metadata: {
          quoteNumber: quote.quoteNumber,
          customerName: quote.customerName,
        },
      },
    });

    return NextResponse.json({ data: quote }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('POST /api/quotes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
