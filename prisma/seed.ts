// prisma/seed.ts

import { PrismaClient, Role, PriceUnit } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('changeme123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@yourcompany.com' },
    update: {},
    create: {
      email: 'admin@yourcompany.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  // House types with allowance amounts
  const houseTypes = [
    { name: 'FLAT-BUNG/1', allowance: 940.80, sortOrder: 1 },
    { name: 'HOUSE/<3', allowance: 1180.85, sortOrder: 2 },
    { name: 'FLAT-BUNG/2+', allowance: 953.06, sortOrder: 3 },
    { name: 'HOUSE/3+', allowance: 1242.14, sortOrder: 4 },
  ];

  for (const ht of houseTypes) {
    await prisma.houseType.upsert({
      where: { id: ht.name.toLowerCase().replace(/[/<>+]/g, '-') },
      update: ht,
      create: { id: ht.name.toLowerCase().replace(/[/<>+]/g, '-'), ...ht },
    });
  }

  // Product categories
  const categories = [
    { name: 'Base Units', slug: 'base-units', sortOrder: 1 },
    { name: 'Wall Units', slug: 'wall-units', sortOrder: 2 },
    { name: 'Tall Units / Towers', slug: 'tall-units', sortOrder: 3 },
    { name: 'Décor Panels', slug: 'decor-panels', sortOrder: 4 },
    { name: 'Worktops', slug: 'worktops', sortOrder: 5 },
    { name: 'Handles & Hardware', slug: 'handles-hardware', sortOrder: 6 },
    { name: 'Appliances', slug: 'appliances', sortOrder: 7 },
    { name: 'Accessories', slug: 'accessories', sortOrder: 8 },
  ];

  for (const cat of categories) {
    await prisma.productCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  // Sample products
  const baseUnits = await prisma.productCategory.findUnique({
    where: { slug: 'base-units' }
  });
  const worktops = await prisma.productCategory.findUnique({
    where: { slug: 'worktops' }
  });

  if (baseUnits) {
    const products = [
      { sku: 'BU-300', name: 'Base Unit 300mm', basePrice: 95, categoryId: baseUnits.id },
      { sku: 'BU-400', name: 'Base Unit 400mm', basePrice: 115, categoryId: baseUnits.id },
      { sku: 'BU-500', name: 'Base Unit 500mm', basePrice: 135, categoryId: baseUnits.id },
      { sku: 'BU-600', name: 'Base Unit 600mm', basePrice: 150, categoryId: baseUnits.id },
      { sku: 'BU-800', name: 'Base Unit 800mm', basePrice: 185, categoryId: baseUnits.id },
      { sku: 'BU-1000', name: 'Base Unit 1000mm', basePrice: 220, categoryId: baseUnits.id },
    ];

    for (const p of products) {
      await prisma.product.upsert({
        where: { sku: p.sku },
        update: p,
        create: { ...p, priceUnit: PriceUnit.UNIT },
      });
    }
  }

  if (worktops) {
    const products = [
      { sku: 'WT-LAM', name: 'Laminate Worktop 40mm', basePrice: 45, categoryId: worktops.id, priceUnit: PriceUnit.LINEAR_METER },
      { sku: 'WT-GRN', name: 'Granite Worktop 30mm', basePrice: 180, categoryId: worktops.id, priceUnit: PriceUnit.LINEAR_METER },
      { sku: 'WT-QTZ', name: 'Quartz Worktop 30mm', basePrice: 220, categoryId: worktops.id, priceUnit: PriceUnit.LINEAR_METER },
      { sku: 'WT-SOL', name: 'Solid Surface', basePrice: 160, categoryId: worktops.id, priceUnit: PriceUnit.LINEAR_METER },
    ];

    for (const p of products) {
      await prisma.product.upsert({
        where: { sku: p.sku },
        update: p,
        create: p,
      });
    }
  }

  console.log('✅ Seed data created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
