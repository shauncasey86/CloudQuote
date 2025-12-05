// src/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { Role, Prisma } from '@prisma/client';

const createProductSchema = z.object({
  categoryId: z.string(),
  sku: z.string().max(100).nullable().optional(),
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  basePrice: z.number().nonnegative(),
  priceUnit: z.enum(['UNIT', 'LINEAR_METER', 'SQUARE_METER']),
  minQuantity: z.number().positive().nullable().optional(),
  maxQuantity: z.number().positive().nullable().optional(),
  active: z.boolean().default(true).optional(),
  sortOrder: z.number().int().default(0).optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const activeOnly = searchParams.get('active') !== 'false';

    console.log('[Products API] GET request:', { categoryId, search, activeOnly });

    const where: Prisma.ProductWhereInput = {
      ...(activeOnly && { active: true }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { sku: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    };

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    console.log('[Products API] Results:', { found: products.length });

    return NextResponse.json({ data: products });
  } catch (error) {
    console.error('[Products API] GET error:', error);
    console.error('[Products API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
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

  // Only ADMIN can create products
  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = createProductSchema.parse(body);

    // Convert empty string SKU to null (unique constraint requires null, not empty string)
    if (data.sku === '' || data.sku === undefined) {
      data.sku = null;
    }

    // Check if category exists
    const category = await prisma.productCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check for duplicate SKU if provided (only if SKU is not null)
    if (data.sku) {
      const existing = await prisma.product.findUnique({
        where: { sku: data.sku },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.create({
      data,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('POST /api/products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
