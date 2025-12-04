// src/app/api/categories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';

    const categories = await prisma.productCategory.findMany({
      where: activeOnly ? { active: true } : undefined,
      include: {
        _count: {
          select: {
            products: {
              where: { active: true }
            }
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new category (Admin only)
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
    const { name, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existing = await prisma.productCategory.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 });
    }

    // Get max sortOrder
    const maxSortOrder = await prisma.productCategory.aggregate({
      _max: { sortOrder: true },
    });

    const category = await prisma.productCategory.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
        active: true,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
