// src/app/api/categories/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Get single category
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error('GET /api/categories/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update category (Admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, active } = body;

    // Check if category exists
    const existing = await prisma.productCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
      }
      updateData.name = name.trim();

      // Update slug if name changes
      const newSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Check if new slug conflicts with another category
      const slugConflict = await prisma.productCategory.findFirst({
        where: {
          slug: newSlug,
          id: { not: id },
        },
      });

      if (slugConflict) {
        return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 });
      }

      updateData.slug = newSlug;
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (active !== undefined) {
      updateData.active = Boolean(active);
    }

    const category = await prisma.productCategory.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error('PATCH /api/categories/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete category (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Check if category exists and has products
    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // If category has products, just deactivate it
    if (category._count.products > 0) {
      await prisma.productCategory.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json({
        message: 'Category deactivated (has products)',
        deactivated: true,
      });
    }

    // Otherwise, delete it completely
    await prisma.productCategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category deleted', deleted: true });
  } catch (error) {
    console.error('DELETE /api/categories/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
