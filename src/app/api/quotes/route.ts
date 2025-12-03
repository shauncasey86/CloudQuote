// src/app/api/quotes/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

const createQuoteSchema = z.object({
  quoteNumber: z.string().min(1).max(50),
  customerName: z.string().min(1).max(255),
  customerEmail: z.string().email().optional().nullable().or(z.literal('')),
  customerPhone: z.string().max(50).optional().nullable(),
  address: z.string().min(1),
  houseTypeId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
  status: z.enum(['DRAFT', 'FINALIZED', 'SENT', 'SAVED', 'ARCHIVED']).optional(),
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

    const where: Prisma.QuoteWhereInput = {
      status: status ? { equals: status as any } : { not: 'ARCHIVED' },
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
          houseType: { select: { id: true, name: true, multiplier: true } },
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

    // Get house type multiplier if specified
    let houseTypeMultiplier = 1.0;
    if (data.houseTypeId) {
      const houseType = await prisma.houseType.findUnique({
        where: { id: data.houseTypeId },
      });
      if (houseType) {
        houseTypeMultiplier = Number(houseType.multiplier);
      }
    }

    const quote = await prisma.quote.create({
      data: {
        ...data,
        customerEmail: data.customerEmail || null,
        houseTypeMultiplier,
        status: data.status || 'DRAFT',
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        createdById: session.user.id,
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
