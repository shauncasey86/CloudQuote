// src/app/api/products/reorder/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';

// Reorder products within a category (Admin only)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { orderedIds, categoryId } = body;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ error: 'orderedIds array is required' }, { status: 400 });
    }

    // Update sortOrder for each product
    const updates = orderedIds.map((id: string, index: number) =>
      prisma.product.update({
        where: { id },
        data: { sortOrder: index + 1 },
      })
    );

    await prisma.$transaction(updates);

    // Fetch updated products
    const whereClause = categoryId ? { categoryId, active: true } : { active: true };
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ data: products });
  } catch (error) {
    console.error('POST /api/products/reorder error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
