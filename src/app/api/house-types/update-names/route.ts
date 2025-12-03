// src/app/api/house-types/update-names/route.ts
// One-time endpoint to update house type names

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';

const HOUSE_TYPE_UPDATES = [
  { oldName: 'Standard', newName: 'FLAT-BUNG/1', allowance: 940.80 },
  { oldName: 'Premium', newName: 'HOUSE/<3', allowance: 1180.85 },
  { oldName: 'Luxury', newName: 'FLAT-BUNG/2+', allowance: 953.06 },
  { oldName: 'Custom Build', newName: 'HOUSE/3+', allowance: 1242.14 },
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

    for (const update of HOUSE_TYPE_UPDATES) {
      // Try to find by old name first
      const existing = await prisma.houseType.findFirst({
        where: { name: update.oldName },
      });

      if (existing) {
        // Update existing record
        await prisma.houseType.update({
          where: { id: existing.id },
          data: {
            name: update.newName,
            allowance: update.allowance,
          },
        });
        results.push({ action: 'updated', from: update.oldName, to: update.newName });
      } else {
        // Check if new name already exists
        const newExists = await prisma.houseType.findFirst({
          where: { name: update.newName },
        });

        if (!newExists) {
          // Create new record
          await prisma.houseType.create({
            data: {
              name: update.newName,
              allowance: update.allowance,
              sortOrder: HOUSE_TYPE_UPDATES.indexOf(update) + 1,
            },
          });
          results.push({ action: 'created', name: update.newName });
        } else {
          results.push({ action: 'already_exists', name: update.newName });
        }
      }
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
