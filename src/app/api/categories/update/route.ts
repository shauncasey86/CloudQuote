// src/app/api/categories/update/route.ts
// One-time endpoint to update product categories

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only ADMIN can update categories
  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  try {
    const results = [];

    // 1. Rename "Base Units" to "HL Base"
    const baseUnits = await prisma.productCategory.findFirst({
      where: { slug: 'base-units' },
    });

    if (baseUnits) {
      await prisma.productCategory.update({
        where: { id: baseUnits.id },
        data: {
          name: 'HL Base',
          slug: 'hl-base',
        },
      });
      results.push({ action: 'renamed', from: 'Base Units', to: 'HL Base' });
    }

    // 2. Create "DL Base" category (sortOrder 2, right after HL Base)
    const dlBaseExists = await prisma.productCategory.findFirst({
      where: { slug: 'dl-base' },
    });

    if (!dlBaseExists) {
      // First, shift all existing categories with sortOrder >= 2 up by 1
      await prisma.productCategory.updateMany({
        where: { sortOrder: { gte: 2 } },
        data: { sortOrder: { increment: 1 } },
      });

      // Create DL Base with sortOrder 2
      await prisma.productCategory.create({
        data: {
          name: 'DL Base',
          slug: 'dl-base',
          sortOrder: 2,
          active: true,
        },
      });
      results.push({ action: 'created', name: 'DL Base' });
    } else {
      results.push({ action: 'already_exists', name: 'DL Base' });
    }

    return NextResponse.json({
      success: true,
      message: 'Categories updated',
      results,
    });
  } catch (error) {
    console.error('POST /api/categories/update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
