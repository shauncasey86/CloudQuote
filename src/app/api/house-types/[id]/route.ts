// src/app/api/house-types/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';

const updateHouseTypeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  allowance: z.number().min(0).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only ADMIN can update house types
  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = updateHouseTypeSchema.parse(body);

    const houseType = await prisma.houseType.findUnique({
      where: { id: params.id },
    });

    if (!houseType) {
      return NextResponse.json(
        { error: 'House type not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.houseType.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('PATCH /api/house-types/[id] error:', error);
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

  // Only ADMIN can delete house types
  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const houseType = await prisma.houseType.findUnique({
      where: { id: params.id },
      include: { _count: { select: { quotes: true } } },
    });

    if (!houseType) {
      return NextResponse.json(
        { error: 'House type not found' },
        { status: 404 }
      );
    }

    // If house type is used by quotes, deactivate instead of delete
    if (houseType._count.quotes > 0) {
      const deactivated = await prisma.houseType.update({
        where: { id: params.id },
        data: { active: false },
      });
      return NextResponse.json({ data: deactivated, deactivated: true });
    }

    // Delete the house type if not used
    await prisma.houseType.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/house-types/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
