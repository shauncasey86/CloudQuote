// src/app/api/house-types/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';

const createHouseTypeSchema = z.object({
  name: z.string().min(1).max(255),
  allowance: z.number().min(0),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';

    const houseTypes = await prisma.houseType.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            quotes: {
              where: { status: { not: 'ARCHIVED' } },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: houseTypes });
  } catch (error) {
    console.error('GET /api/house-types error:', error);
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

  // Only ADMIN can create house types
  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = createHouseTypeSchema.parse(body);

    // Get the max sort order for new items
    const maxSortOrder = await prisma.houseType.aggregate({
      _max: { sortOrder: true },
    });
    const sortOrder = data.sortOrder ?? (maxSortOrder._max.sortOrder ?? 0) + 1;

    const houseType = await prisma.houseType.create({
      data: {
        name: data.name,
        allowance: data.allowance,
        active: data.active,
        sortOrder,
      },
    });

    return NextResponse.json({ data: houseType }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('POST /api/house-types error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
