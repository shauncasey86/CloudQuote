// src/app/api/house-types/update-names/route.ts
// Endpoint to ensure correct house type names

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';

const HOUSE_TYPES = [
  { id: 'flat-bung-1', name: 'FLAT-BUNG/1', allowance: 940.80, sortOrder: 1, oldNames: ['Standard', 'FLAT-BUNG/1'] },
  { id: 'house-3', name: 'HOUSE/<3', allowance: 1180.85, sortOrder: 2, oldNames: ['Premium', 'HOUSE/<3'] },
  { id: 'flat-bung-2', name: 'FLAT-BUNG/2+', allowance: 953.06, sortOrder: 3, oldNames: ['Luxury', 'FLAT-BUNG/2+'] },
  { id: 'house-3-plus', name: 'HOUSE/3+', allowance: 1242.14, sortOrder: 4, oldNames: ['Custom Build', 'HOUSE/3+'] },
];

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only ADMIN can update house types
  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  try {
    const results = [];

    // Get all existing house types
    const existingTypes = await prisma.houseType.findMany();

    for (const ht of HOUSE_TYPES) {
      // Try to find existing record by any of the old names or the correct name
      let existing = existingTypes.find(e => ht.oldNames.includes(e.name));

      // Also try to find by sortOrder as a fallback
      if (!existing) {
        existing = existingTypes.find(e => e.sortOrder === ht.sortOrder);
      }

      if (existing) {
        // Update existing record
        if (existing.name !== ht.name) {
          await prisma.houseType.update({
            where: { id: existing.id },
            data: { name: ht.name, allowance: ht.allowance, sortOrder: ht.sortOrder },
          });
          results.push({ action: 'updated', from: existing.name, to: ht.name });
        } else {
          // Just ensure allowance is correct
          await prisma.houseType.update({
            where: { id: existing.id },
            data: { allowance: ht.allowance, sortOrder: ht.sortOrder },
          });
          results.push({ action: 'verified', name: ht.name });
        }
      } else {
        // Create new record if not found
        await prisma.houseType.create({
          data: { id: ht.id, name: ht.name, allowance: ht.allowance, sortOrder: ht.sortOrder, active: true },
        });
        results.push({ action: 'created', name: ht.name });
      }
    }

    // Deactivate any house types that shouldn't exist
    const validNames = HOUSE_TYPES.map(h => h.name);
    const deactivated = await prisma.houseType.updateMany({
      where: { name: { notIn: validNames } },
      data: { active: false },
    });
    if (deactivated.count > 0) {
      results.push({ action: 'deactivated', count: deactivated.count });
    }

    return NextResponse.json({
      success: true,
      message: 'House types updated',
      results
    });
  } catch (error) {
    console.error('POST /api/house-types/update-names error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
