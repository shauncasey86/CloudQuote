// prisma/update-data.ts
// Runs on app startup to ensure database has correct values

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating database data...');

  // Update House Types
  const houseTypeUpdates = [
    { oldName: 'Standard', newName: 'FLAT-BUNG/1', allowance: 940.80, sortOrder: 1 },
    { oldName: 'Premium', newName: 'HOUSE/<3', allowance: 1180.85, sortOrder: 2 },
    { oldName: 'Luxury', newName: 'FLAT-BUNG/2+', allowance: 953.06, sortOrder: 3 },
    { oldName: 'Custom Build', newName: 'HOUSE/3+', allowance: 1242.14, sortOrder: 4 },
  ];

  for (const ht of houseTypeUpdates) {
    const existing = await prisma.houseType.findFirst({
      where: { name: ht.oldName },
    });
    if (existing) {
      await prisma.houseType.update({
        where: { id: existing.id },
        data: { name: ht.newName, allowance: ht.allowance, sortOrder: ht.sortOrder },
      });
      console.log(`  ✓ House type: ${ht.oldName} → ${ht.newName}`);
    }
  }

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
