// prisma/update-data.ts
// Runs on app startup to ensure database has correct values

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating database data...');

  // Define the correct house types
  const houseTypes = [
    { id: 'flat-bung-1', name: 'FLAT-BUNG/1', allowance: 940.80, sortOrder: 1, oldNames: ['Standard', 'FLAT-BUNG/1'] },
    { id: 'house-3', name: 'HOUSE/<3', allowance: 1180.85, sortOrder: 2, oldNames: ['Premium', 'HOUSE/<3'] },
    { id: 'flat-bung-2', name: 'FLAT-BUNG/2+', allowance: 953.06, sortOrder: 3, oldNames: ['Luxury', 'FLAT-BUNG/2+'] },
    { id: 'house-3-plus', name: 'HOUSE/3+', allowance: 1242.14, sortOrder: 4, oldNames: ['Custom Build', 'HOUSE/3+'] },
  ];

  // Get all existing house types
  const existingTypes = await prisma.houseType.findMany();
  console.log(`  Found ${existingTypes.length} existing house types`);

  for (const ht of houseTypes) {
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
        console.log(`  ✓ House type updated: ${existing.name} → ${ht.name}`);
      } else {
        // Just ensure allowance is correct
        await prisma.houseType.update({
          where: { id: existing.id },
          data: { allowance: ht.allowance, sortOrder: ht.sortOrder },
        });
        console.log(`  ✓ House type verified: ${ht.name}`);
      }
    } else {
      // Create new record if not found
      await prisma.houseType.create({
        data: { id: ht.id, name: ht.name, allowance: ht.allowance, sortOrder: ht.sortOrder, active: true },
      });
      console.log(`  ✓ House type created: ${ht.name}`);
    }
  }

  // Deactivate any house types that shouldn't exist
  const validNames = houseTypes.map(h => h.name);
  await prisma.houseType.updateMany({
    where: { name: { notIn: validNames } },
    data: { active: false },
  });
  console.log(`  ✓ Deactivated any invalid house types`);

  // Update Categories: Rename "Base Units" to "HL Base"
  const baseUnits = await prisma.productCategory.findFirst({
    where: { name: 'Base Units' },
  });
  if (baseUnits) {
    await prisma.productCategory.update({
      where: { id: baseUnits.id },
      data: { name: 'HL Base', slug: 'hl-base', sortOrder: 1 },
    });
    console.log('  ✓ Category: Base Units → HL Base');
  }

  // Create "DL Base" category if it doesn't exist
  const dlBase = await prisma.productCategory.findFirst({
    where: { slug: 'dl-base' },
  });
  if (!dlBase) {
    // Shift existing categories
    await prisma.productCategory.updateMany({
      where: { sortOrder: { gte: 2 } },
      data: { sortOrder: { increment: 1 } },
    });
    await prisma.productCategory.create({
      data: { name: 'DL Base', slug: 'dl-base', sortOrder: 2, active: true },
    });
    console.log('  ✓ Category: Created DL Base');
  }

  console.log('✅ Database data updated');
}

main()
  .catch((e) => {
    console.error('❌ Update failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
