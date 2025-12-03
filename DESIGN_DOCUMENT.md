# CloudQuote — Technical Design Document

**Version:** 1.1  
**Date:** December 2025  
**Status:** Draft for Review  
**Platform:** Railway (Hobby Plan)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Data Schema (Prisma)](#3-data-schema-prisma)
4. [Authentication (NextAuth.js)](#4-authentication-nextauthjs)
5. [Feature Specifications](#5-feature-specifications)
6. [API Design](#6-api-design)
7. [UI/UX Design System](#7-uiux-design-system)
8. [Security Implementation](#8-security-implementation)
9. [Deployment & Infrastructure](#9-deployment--infrastructure)
10. [Performance Considerations](#10-performance-considerations)
11. [Future Enhancements](#11-future-enhancements)

---

## 1. Executive Summary

### 1.1 Problem Statement

The current kitchen quoting process relies on fragmented tools—spreadsheets, manual calculations, and ad-hoc email workflows. This creates:

- **Pricing inconsistencies** across quotes
- **Lost quotes** due to poor searchability
- **Delayed customer responses** from manual PDF creation
- **No audit trail** for price changes or quote modifications

### 1.2 Solution Overview

CloudQuote is a centralized, web-based quoting platform that provides:

- Unified quote management with full lifecycle tracking
- Automated price calculations with historical snapshot retention
- One-click PDF generation and email delivery
- Full-text search across all quote data
- Dark-first glassmorphism UI optimized for daily operational use

### 1.3 Scale & Constraints

| Metric | Value |
|--------|-------|
| **Users** | 4 internal staff |
| **Quote volume** | ~50/week (~200/month) |
| **Data retention** | 12 months active, archive thereafter |
| **Geography** | UK only |
| **Budget** | Railway Hobby $5/mo |

### 1.4 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Quote creation time | <5 minutes | Time tracking |
| Search response time | <500ms | Performance monitoring |
| Email delivery success | >99% | SMTP logs |
| System uptime | 99.5% | Railway status |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Desktop    │  │    Tablet    │  │    Mobile    │                   │
│  │   Browser    │  │   Browser    │  │   Browser    │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            RAILWAY                                       │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     Next.js 14 Service                              │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐   │ │
│  │  │   React     │  │   Server    │  │      API Routes          │   │ │
│  │  │ Components  │  │ Components  │  │  /api/quotes             │   │ │
│  │  │  + Hooks    │  │   (RSC)     │  │  /api/products           │   │ │
│  │  │             │  │             │  │  /api/auth/[...nextauth] │   │ │
│  │  └─────────────┘  └─────────────┘  └──────────────────────────┘   │ │
│  │                                                                    │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │                    Application Services                       │ │ │
│  │  │  • Prisma Client      • PDF Generator    • Email Service     │ │ │
│  │  │  • NextAuth Handler   • Price Calculator • Permission Guard  │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                              │                                           │
│                              ▼                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     PostgreSQL Service                              │ │
│  │  • quotes, quote_items, products, product_categories               │ │
│  │  • users, accounts, sessions (NextAuth tables)                     │ │
│  │  • house_types, additional_costs, change_history                   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES                                  │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    Google Workspace SMTP                            │ │
│  │                    smtp.gmail.com:587 (TLS)                         │ │
│  │                    Quote PDF email delivery                         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Runtime** | Node.js 20 LTS | Stable, Railway default |
| **Framework** | Next.js 14 (App Router) | SSR/SSG, API routes, great DX |
| **Language** | TypeScript 5 | Type safety across stack |
| **Styling** | Tailwind CSS 3.4 | Utility-first, design tokens |
| **Database** | PostgreSQL 15 | Relational integrity, full-text search |
| **ORM** | Prisma 5 | Type-safe queries, migrations |
| **Auth** | NextAuth.js 5 (Auth.js) | Credentials provider, session management |
| **Forms** | React Hook Form + Zod | Performant, type-safe validation |
| **State** | Tanstack Query v5 | Server state, caching, mutations |
| **Animation** | Framer Motion | Page transitions, micro-interactions |
| **PDF** | @react-pdf/renderer | Server-side PDF with React components |
| **Email** | Nodemailer | Google SMTP integration |
| **Hosting** | Railway | Single platform, PostgreSQL included |

### 2.3 Data Flow Diagrams

#### Quote Creation Flow

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  User   │────▶│ Quote Form   │────▶│  API Route  │────▶│  Prisma  │
│ Action  │     │ (React)      │     │ /api/quotes │     │    DB    │
└─────────┘     └──────────────┘     └─────────────┘     └──────────┘
                      │                     │
                      │ Autosave            │ Validate
                      │ (debounced)         │ Calculate totals
                      ▼                     │ Snapshot prices
                ┌──────────────┐            │
                │ Optimistic   │◀───────────┘
                │ UI Update    │
                └──────────────┘
```

#### Email Send Flow

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  User   │────▶│ Send Button  │────▶│ /api/quotes │────▶│  Google  │
│ Clicks  │     │              │     │  /[id]/send │     │   SMTP   │
└─────────┘     └──────────────┘     └─────────────┘     └──────────┘
                                           │
                                           │ 1. Fetch quote + items
                                           │ 2. Generate PDF buffer
                                           │ 3. Create email with attachment
                                           │ 4. Send via Nodemailer
                                           │ 5. Update quote.status = 'sent'
                                           │ 6. Log to change_history
                                           ▼
                                    ┌─────────────┐
                                    │ Status:     │
                                    │ SENT ✓      │
                                    └─────────────┘
```

---

## 3. Data Schema (Prisma)

### 3.1 Schema Definition

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ════════════════════════════════════════════════════════════════════
// AUTHENTICATION (NextAuth.js)
// ════════════════════════════════════════════════════════════════════

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String
  role          Role      @default(STAFF)
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  sessions      Session[]
  quotesCreated Quote[]   @relation("CreatedBy")
  quotesUpdated Quote[]   @relation("UpdatedBy")
  changeHistory ChangeHistory[]

  @@index([email])
  @@map("users")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

enum Role {
  ADMIN
  STAFF
  READONLY
}

// ════════════════════════════════════════════════════════════════════
// HOUSE TYPES (Pricing Multipliers)
// ════════════════════════════════════════════════════════════════════

model HouseType {
  id         String   @id @default(cuid())
  name       String
  multiplier Decimal  @default(1.00) @db.Decimal(4, 2)
  active     Boolean  @default(true)
  sortOrder  Int      @default(0)
  createdAt  DateTime @default(now())

  // Relations
  quotes     Quote[]

  @@map("house_types")
}

// ════════════════════════════════════════════════════════════════════
// PRODUCTS
// ════════════════════════════════════════════════════════════════════

model ProductCategory {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  sortOrder   Int       @default(0)
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())

  // Relations
  products    Product[]

  @@map("product_categories")
}

model Product {
  id          String          @id @default(cuid())
  categoryId  String
  sku         String?         @unique
  name        String
  description String?
  basePrice   Decimal         @db.Decimal(10, 2)
  priceUnit   PriceUnit       @default(UNIT)
  minQuantity Decimal?        @default(1) @db.Decimal(10, 2)
  maxQuantity Decimal?        @db.Decimal(10, 2)
  active      Boolean         @default(true)
  sortOrder   Int             @default(0)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  // Relations
  category    ProductCategory @relation(fields: [categoryId], references: [id])
  quoteItems  QuoteItem[]

  @@index([categoryId])
  @@index([active])
  @@map("products")
}

enum PriceUnit {
  UNIT
  LINEAR_METER
  SQUARE_METER
}

// ════════════════════════════════════════════════════════════════════
// QUOTES
// ════════════════════════════════════════════════════════════════════

model Quote {
  id                   String          @id @default(cuid())
  quoteNumber          String          @unique
  status               QuoteStatus     @default(DRAFT)

  // Customer Info
  customerName         String
  customerEmail        String?
  customerPhone        String?
  address              String

  // Pricing Context
  houseTypeId          String?
  houseTypeMultiplier  Decimal         @default(1.00) @db.Decimal(4, 2) // Snapshot

  // Calculated Totals (stored for historical accuracy)
  subtotal             Decimal         @default(0) @db.Decimal(12, 2)
  vatRate              Decimal         @default(20.00) @db.Decimal(4, 2)
  vatAmount            Decimal         @default(0) @db.Decimal(12, 2)
  total                Decimal         @default(0) @db.Decimal(12, 2)

  // Metadata
  notes                String?
  internalNotes        String?
  validUntil           DateTime?
  sentAt               DateTime?

  // Audit
  createdById          String
  updatedById          String?
  createdAt            DateTime        @default(now())
  updatedAt            DateTime        @updatedAt

  // Relations
  houseType            HouseType?      @relation(fields: [houseTypeId], references: [id])
  createdBy            User            @relation("CreatedBy", fields: [createdById], references: [id])
  updatedBy            User?           @relation("UpdatedBy", fields: [updatedById], references: [id])
  items                QuoteItem[]
  additionalCosts      AdditionalCost[]
  changeHistory        ChangeHistory[]

  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@index([quoteNumber])
  @@map("quotes")
}

enum QuoteStatus {
  DRAFT
  FINALIZED
  SENT
  SAVED
  ARCHIVED
}

// ════════════════════════════════════════════════════════════════════
// QUOTE LINE ITEMS
// ════════════════════════════════════════════════════════════════════

model QuoteItem {
  id          String    @id @default(cuid())
  quoteId     String
  productId   String?

  // Snapshot of product at quote time
  productName String
  productSku  String?

  // Pricing (snapshot)
  quantity    Decimal   @default(1) @db.Decimal(10, 2)
  priceUnit   PriceUnit @default(UNIT)
  unitPrice   Decimal   @db.Decimal(10, 2)
  lineTotal   Decimal   @db.Decimal(12, 2)

  // Display
  sortOrder   Int       @default(0)
  notes       String?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  quote       Quote     @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  product     Product?  @relation(fields: [productId], references: [id], onDelete: SetNull)

  @@index([quoteId])
  @@index([productId])
  @@map("quote_items")
}

// ════════════════════════════════════════════════════════════════════
// ADDITIONAL COSTS
// ════════════════════════════════════════════════════════════════════

model AdditionalCost {
  id          String   @id @default(cuid())
  quoteId     String
  description String
  amount      Decimal  @db.Decimal(10, 2)
  taxable     Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())

  // Relations
  quote       Quote    @relation(fields: [quoteId], references: [id], onDelete: Cascade)

  @@index([quoteId])
  @@map("additional_costs")
}

// ════════════════════════════════════════════════════════════════════
// CHANGE HISTORY (Audit Trail)
// ════════════════════════════════════════════════════════════════════

model ChangeHistory {
  id           String   @id @default(cuid())
  quoteId      String
  userId       String
  action       String   // 'create', 'update', 'status_change', 'email_sent'
  fieldChanged String?
  oldValue     String?
  newValue     String?
  metadata     Json?    // Additional context
  changedAt    DateTime @default(now())

  // Relations
  quote        Quote    @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  user         User     @relation(fields: [userId], references: [id])

  @@index([quoteId])
  @@index([changedAt(sort: Desc)])
  @@map("change_history")
}
```

### 3.2 Seed Data

```typescript
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

  // House types
  const houseTypes = [
    { name: 'Standard', multiplier: 1.0, sortOrder: 1 },
    { name: 'Premium', multiplier: 1.15, sortOrder: 2 },
    { name: 'Luxury', multiplier: 1.35, sortOrder: 3 },
    { name: 'Custom Build', multiplier: 1.5, sortOrder: 4 },
  ];

  for (const ht of houseTypes) {
    await prisma.houseType.upsert({
      where: { id: ht.name.toLowerCase().replace(' ', '-') },
      update: ht,
      create: { id: ht.name.toLowerCase().replace(' ', '-'), ...ht },
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
```

### 3.3 Database Client

```typescript
// src/lib/db.ts

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

## 4. Authentication (NextAuth.js)

### 4.1 Configuration

```typescript
// src/lib/auth.ts

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user) {
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
```

### 4.2 API Route Handler

```typescript
// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### 4.3 Type Extensions

```typescript
// src/types/next-auth.d.ts

import { Role } from '@prisma/client';
import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
  }
}
```

### 4.4 Auth Utilities

```typescript
// src/lib/auth-utils.ts

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';
import { Role } from '@prisma/client';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  return session;
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role as Role)) {
    redirect('/unauthorized');
  }
  return session;
}

// Permission definitions
export const Permissions = {
  'quotes:read': [Role.ADMIN, Role.STAFF, Role.READONLY],
  'quotes:create': [Role.ADMIN, Role.STAFF],
  'quotes:update': [Role.ADMIN, Role.STAFF],
  'quotes:delete': [Role.ADMIN],
  'quotes:send': [Role.ADMIN, Role.STAFF],
  'products:read': [Role.ADMIN, Role.STAFF, Role.READONLY],
  'products:create': [Role.ADMIN],
  'products:update': [Role.ADMIN],
  'products:delete': [Role.ADMIN],
  'users:read': [Role.ADMIN],
  'users:update': [Role.ADMIN],
} as const;

export function hasPermission(
  userRole: Role,
  permission: keyof typeof Permissions
): boolean {
  return Permissions[permission].includes(userRole);
}
```

### 4.5 Middleware

```typescript
// src/middleware.ts

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Additional middleware logic if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 5. Feature Specifications

### 5.1 Quote Management

#### 5.1.1 Quote List View

**Frontend Behavior:**
- Paginated table (20 per page)
- Columns: Quote #, Customer, Address, Status, Total, Created, Actions
- Status badges with color coding
- Quick actions: View, Edit, Duplicate, Archive
- Search bar with debounced input

**Server Component:**
```typescript
// src/app/(dashboard)/quotes/page.tsx

import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';
import { QuotesTable } from '@/components/quotes/QuotesTable';
import { QuotesHeader } from '@/components/quotes/QuotesHeader';

interface Props {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
  };
}

export default async function QuotesPage({ searchParams }: Props) {
  await requireAuth();

  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    ...(searchParams.status && { status: searchParams.status }),
    ...(searchParams.search && {
      OR: [
        { quoteNumber: { contains: searchParams.search, mode: 'insensitive' } },
        { customerName: { contains: searchParams.search, mode: 'insensitive' } },
        { address: { contains: searchParams.search, mode: 'insensitive' } },
      ],
    }),
    status: { not: 'ARCHIVED' },
  };

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      include: {
        createdBy: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.quote.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <QuotesHeader />
      <QuotesTable 
        quotes={quotes} 
        pagination={{ page, limit, total }} 
      />
    </div>
  );
}
```

#### 5.1.2 Quote Editor

**Autosave Hook:**
```typescript
// src/hooks/useAutosave.ts

import { useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { debounce } from 'lodash-es';

interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutosave<T>({ 
  data, 
  onSave, 
  delay = 2000,
  enabled = true 
}: UseAutosaveOptions<T>) {
  const lastSavedRef = useRef<string>('');

  const mutation = useMutation({
    mutationFn: onSave,
  });

  const debouncedSave = useCallback(
    debounce((newData: T) => {
      const serialized = JSON.stringify(newData);
      if (serialized !== lastSavedRef.current) {
        lastSavedRef.current = serialized;
        mutation.mutate(newData);
      }
    }, delay),
    [delay]
  );

  useEffect(() => {
    if (enabled) {
      debouncedSave(data);
    }
    return () => debouncedSave.cancel();
  }, [data, enabled, debouncedSave]);

  return {
    status: mutation.isPending ? 'saving' : mutation.isError ? 'error' : 'saved',
    error: mutation.error,
  };
}
```

**Price Calculation:**
```typescript
// src/lib/pricing.ts

import { Decimal } from '@prisma/client/runtime/library';

interface QuoteItem {
  quantity: number;
  unitPrice: number;
  priceUnit: 'UNIT' | 'LINEAR_METER' | 'SQUARE_METER';
}

interface AdditionalCost {
  amount: number;
  taxable: boolean;
}

interface PriceCalculation {
  items: QuoteItem[];
  additionalCosts: AdditionalCost[];
  houseTypeMultiplier: number;
  vatRate: number;
}

interface QuoteTotals {
  subtotal: number;
  vatAmount: number;
  total: number;
}

export function calculateQuoteTotal(input: PriceCalculation): QuoteTotals {
  // Calculate line item totals with house type multiplier
  const itemsSubtotal = input.items.reduce((sum, item) => {
    const adjustedPrice = item.unitPrice * input.houseTypeMultiplier;
    return sum + adjustedPrice * item.quantity;
  }, 0);

  // Separate taxable and non-taxable additional costs
  const taxableAdditional = input.additionalCosts
    .filter((c) => c.taxable)
    .reduce((sum, c) => sum + c.amount, 0);

  const nonTaxableAdditional = input.additionalCosts
    .filter((c) => !c.taxable)
    .reduce((sum, c) => sum + c.amount, 0);

  // Calculate VAT on taxable amounts
  const taxableTotal = itemsSubtotal + taxableAdditional;
  const vatAmount = taxableTotal * (input.vatRate / 100);

  // Final total
  const subtotal = itemsSubtotal + taxableAdditional + nonTaxableAdditional;
  const total = taxableTotal + vatAmount + nonTaxableAdditional;

  return {
    subtotal: round(subtotal, 2),
    vatAmount: round(vatAmount, 2),
    total: round(total, 2),
  };
}

function round(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
```

### 5.2 Email Integration

```typescript
// src/lib/email.ts

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendQuoteEmailParams {
  to: string;
  quoteNumber: string;
  customerName: string;
  pdfBuffer: Buffer;
  companyName?: string;
}

export async function sendQuoteEmail({
  to,
  quoteNumber,
  customerName,
  pdfBuffer,
  companyName = 'Your Company',
}: SendQuoteEmailParams) {
  const result = await transporter.sendMail({
    from: `"${companyName} Quotes" <${process.env.SMTP_USER}>`,
    to,
    subject: `Your Kitchen Quote - ${quoteNumber}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Your Kitchen Quote</h1>
        </div>
        <div style="background: #f9fafb; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Dear ${customerName},
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Please find attached your kitchen quote <strong>${quoteNumber}</strong>.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            If you have any questions about this quote, please don't hesitate to contact us.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            This quote is valid for 30 days from the date of issue.
          </p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Quote-${quoteNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });

  return result;
}

// Verify SMTP connection on startup
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    return false;
  }
}
```

### 5.3 PDF Generation

```typescript
// src/lib/pdf/QuoteDocument.tsx

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';
import { format } from 'date-fns';

// Register fonts
Font.register({
  family: 'IBM Plex Sans',
  fonts: [
    { src: '/fonts/IBMPlexSans-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/IBMPlexSans-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/IBMPlexSans-SemiBold.ttf', fontWeight: 600 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'IBM Plex Sans',
    fontSize: 10,
    color: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#7c3aed',
  },
  logo: {
    width: 120,
    height: 40,
  },
  headerRight: {
    textAlign: 'right',
  },
  title: {
    fontSize: 28,
    fontWeight: 600,
    color: '#7c3aed',
    marginBottom: 4,
  },
  quoteNumber: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customerInfo: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 4,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#7c3aed',
    padding: 10,
  },
  tableHeaderText: {
    color: 'white',
    fontWeight: 500,
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  colProduct: { width: '40%' },
  colQty: { width: '15%', textAlign: 'right' },
  colUnit: { width: '20%', textAlign: 'right' },
  colTotal: { width: '25%', textAlign: 'right' },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    width: 200,
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingVertical: 4,
  },
  grandTotal: {
    fontWeight: 600,
    fontSize: 14,
    backgroundColor: '#7c3aed',
    color: 'white',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
});

interface QuoteDocumentProps {
  quote: {
    quoteNumber: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    address: string;
    createdAt: Date;
    subtotal: number;
    vatRate: number;
    vatAmount: number;
    total: number;
    notes?: string;
  };
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    priceUnit: string;
    unitPrice: number;
    lineTotal: number;
  }>;
  additionalCosts: Array<{
    id: string;
    description: string;
    amount: number;
  }>;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export function QuoteDocument({ 
  quote, 
  items, 
  additionalCosts,
  companyInfo 
}: QuoteDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: 600 }}>
              {companyInfo?.name || 'Your Company'}
            </Text>
            <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 4 }}>
              {companyInfo?.address || 'Company Address'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>QUOTE</Text>
            <Text style={styles.quoteNumber}>#{quote.quoteNumber}</Text>
            <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 8 }}>
              {format(new Date(quote.createdAt), 'dd MMMM yyyy')}
            </Text>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <View style={styles.customerInfo}>
            <Text style={{ fontWeight: 500, marginBottom: 4 }}>
              {quote.customerName}
            </Text>
            <Text>{quote.address}</Text>
            {quote.customerEmail && (
              <Text style={{ marginTop: 4 }}>{quote.customerEmail}</Text>
            )}
            {quote.customerPhone && <Text>{quote.customerPhone}</Text>}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quote Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colProduct]}>
                Product
              </Text>
              <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderText, styles.colUnit]}>
                Unit Price
              </Text>
              <Text style={[styles.tableHeaderText, styles.colTotal]}>
                Total
              </Text>
            </View>

            {items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.tableRow,
                  index % 2 === 1 && styles.tableRowAlt,
                ]}
              >
                <Text style={styles.colProduct}>{item.productName}</Text>
                <Text style={styles.colQty}>
                  {item.quantity}
                  {item.priceUnit === 'LINEAR_METER' ? 'm' : ''}
                </Text>
                <Text style={styles.colUnit}>
                  £{item.unitPrice.toFixed(2)}
                </Text>
                <Text style={styles.colTotal}>
                  £{item.lineTotal.toFixed(2)}
                </Text>
              </View>
            ))}

            {additionalCosts.map((cost, index) => (
              <View
                key={cost.id}
                style={[
                  styles.tableRow,
                  (items.length + index) % 2 === 1 && styles.tableRowAlt,
                ]}
              >
                <Text style={styles.colProduct}>{cost.description}</Text>
                <Text style={styles.colQty}>—</Text>
                <Text style={styles.colUnit}>—</Text>
                <Text style={styles.colTotal}>£{cost.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>£{quote.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>VAT ({quote.vatRate}%)</Text>
            <Text>£{quote.vatAmount.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>TOTAL</Text>
            <Text>£{quote.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={[styles.section, { marginTop: 30 }]}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={{ color: '#4b5563', lineHeight: 1.5 }}>
              {quote.notes}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This quote is valid for 30 days from the date of issue. Prices
            include VAT where applicable.
          </Text>
          <Text style={{ marginTop: 4 }}>
            {companyInfo?.phone} | {companyInfo?.email}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
```

---

## 6. API Design

### 6.1 REST Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **Quotes** | | | |
| GET | `/api/quotes` | List quotes (paginated) | Required |
| GET | `/api/quotes/[id]` | Get quote with items | Required |
| POST | `/api/quotes` | Create new quote | Required |
| PATCH | `/api/quotes/[id]` | Update quote | Required |
| DELETE | `/api/quotes/[id]` | Archive quote | Admin |
| POST | `/api/quotes/[id]/duplicate` | Duplicate quote | Required |
| POST | `/api/quotes/[id]/send` | Email quote | Required |
| GET | `/api/quotes/[id]/pdf` | Generate PDF | Required |
| **Quote Items** | | | |
| POST | `/api/quotes/[id]/items` | Add item | Required |
| PATCH | `/api/quotes/[id]/items/[itemId]` | Update item | Required |
| DELETE | `/api/quotes/[id]/items/[itemId]` | Remove item | Required |
| **Products** | | | |
| GET | `/api/products` | List products | Required |
| GET | `/api/products/[id]` | Get product | Required |
| POST | `/api/products` | Create product | Admin |
| PATCH | `/api/products/[id]` | Update product | Admin |
| DELETE | `/api/products/[id]` | Deactivate | Admin |
| **Categories** | | | |
| GET | `/api/categories` | List categories | Required |
| **Users** | | | |
| GET | `/api/users/me` | Current user | Required |
| GET | `/api/users` | List users | Admin |
| PATCH | `/api/users/[id]` | Update user | Admin |

### 6.2 API Route Examples

```typescript
// src/app/api/quotes/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

const createQuoteSchema = z.object({
  quoteNumber: z.string().min(1).max(50),
  customerName: z.string().min(1).max(255),
  customerEmail: z.string().email().optional().nullable(),
  customerPhone: z.string().max(50).optional().nullable(),
  address: z.string().min(1),
  houseTypeId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search');
  const status = searchParams.get('status');

  const where = {
    status: status ? { equals: status } : { not: 'ARCHIVED' },
    ...(search && {
      OR: [
        { quoteNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.quote.count({ where }),
  ]);

  return NextResponse.json({
    data: quotes,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createQuoteSchema.parse(body);

    // Check for duplicate quote number
    const existing = await prisma.quote.findUnique({
      where: { quoteNumber: data.quoteNumber },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Quote number already exists' },
        { status: 400 }
      );
    }

    // Get house type multiplier if specified
    let houseTypeMultiplier = 1.0;
    if (data.houseTypeId) {
      const houseType = await prisma.houseType.findUnique({
        where: { id: data.houseTypeId },
      });
      if (houseType) {
        houseTypeMultiplier = Number(houseType.multiplier);
      }
    }

    const quote = await prisma.quote.create({
      data: {
        ...data,
        houseTypeMultiplier,
        createdById: session.user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        houseType: true,
      },
    });

    // Log creation
    await prisma.changeHistory.create({
      data: {
        quoteId: quote.id,
        userId: session.user.id,
        action: 'create',
      },
    });

    return NextResponse.json({ data: quote }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Create quote error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

```typescript
// src/app/api/quotes/[id]/send/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { renderToBuffer } from '@react-pdf/renderer';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { sendQuoteEmail } from '@/lib/email';
import { QuoteDocument } from '@/lib/pdf/QuoteDocument';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch complete quote data
    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
        additionalCosts: { orderBy: { sortOrder: 'asc' } },
        houseType: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (!quote.customerEmail) {
      return NextResponse.json(
        { error: 'No customer email address' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      QuoteDocument({
        quote: {
          quoteNumber: quote.quoteNumber,
          customerName: quote.customerName,
          customerEmail: quote.customerEmail,
          customerPhone: quote.customerPhone,
          address: quote.address,
          createdAt: quote.createdAt,
          subtotal: Number(quote.subtotal),
          vatRate: Number(quote.vatRate),
          vatAmount: Number(quote.vatAmount),
          total: Number(quote.total),
          notes: quote.notes,
        },
        items: quote.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          quantity: Number(item.quantity),
          priceUnit: item.priceUnit,
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.lineTotal),
        })),
        additionalCosts: quote.additionalCosts.map((cost) => ({
          id: cost.id,
          description: cost.description,
          amount: Number(cost.amount),
        })),
      })
    );

    // Send email
    await sendQuoteEmail({
      to: quote.customerEmail,
      quoteNumber: quote.quoteNumber,
      customerName: quote.customerName,
      pdfBuffer: Buffer.from(pdfBuffer),
    });

    // Update quote status
    await prisma.quote.update({
      where: { id: params.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        updatedById: session.user.id,
      },
    });

    // Log the action
    await prisma.changeHistory.create({
      data: {
        quoteId: params.id,
        userId: session.user.id,
        action: 'email_sent',
        metadata: { sentTo: quote.customerEmail },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send quote error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
```

---

## 7. UI/UX Design System

*[This section remains unchanged from the original TDD — see previous document for full design tokens, component specifications, and wireframes]*

### 7.1 Key Changes for CloudQuote Branding

```css
/* Updated brand colors */
:root {
  --brand-name: 'CloudQuote';
  --brand-gradient: linear-gradient(135deg, #0ea5e9 0%, #7c3aed 50%, #c084fc 100%);
}
```

### 7.2 Component Library

Same component structure, deployed from `/src/components/ui/`.

---

## 8. Security Implementation

### 8.1 Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  NextAuth   │────▶│   Prisma    │
│             │     │  Middleware │     │  (bcrypt)   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │ 1. Login form     │                   │
       │──────────────────▶│                   │
       │                   │ 2. Verify hash    │
       │                   │──────────────────▶│
       │                   │                   │
       │                   │ 3. Create JWT     │
       │                   │◀──────────────────│
       │ 4. Set cookie     │                   │
       │◀──────────────────│                   │
       │                   │                   │
       │ 5. Redirect       │                   │
       │◀──────────────────│                   │
```

### 8.2 Security Checklist

- [x] HTTPS enforced (Railway provides SSL)
- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] JWT tokens in httpOnly cookies
- [x] CSRF protection via SameSite cookie
- [x] Input validation with Zod on all API routes
- [x] SQL injection prevented via Prisma parameterized queries
- [x] XSS prevented via React's automatic escaping
- [x] Environment variables for secrets
- [x] Google SMTP using App Password
- [x] Role-based permission checks
- [x] Audit logging for sensitive operations

---

## 9. Deployment & Infrastructure

### 9.1 Environment Variables

```bash
# .env (local development)
# .env.production (set in Railway dashboard)

# Database (Railway auto-provides this)
DATABASE_URL="postgresql://user:pass@host:5432/railway"

# NextAuth
NEXTAUTH_URL="https://cloudquote-production.up.railway.app"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# Google SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="quotes@yourcompany.com"
SMTP_PASSWORD="xxxx-xxxx-xxxx-xxxx"

# App
NEXT_PUBLIC_APP_NAME="CloudQuote"
NEXT_PUBLIC_APP_URL="https://cloudquote-production.up.railway.app"
```

### 9.2 Railway Configuration

```json
// railway.json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 9.3 Deployment Steps

```bash
# 1. Create Railway project
railway login
railway init

# 2. Add PostgreSQL
# (Do this in Railway dashboard: Add Service → Database → PostgreSQL)

# 3. Link database to app
# Railway auto-injects DATABASE_URL when linked

# 4. Set environment variables in Railway dashboard
# Settings → Variables → Add all from .env.production

# 5. Connect GitHub repo
# Railway dashboard → Settings → Connect GitHub

# 6. Deploy
git push origin main
# Railway auto-deploys on push

# 7. Run migrations
railway run npx prisma migrate deploy

# 8. Seed database
railway run npx prisma db seed
```

### 9.4 Estimated Resource Usage

| Resource | Estimate | Hobby Limit |
|----------|----------|-------------|
| **RAM** | ~512MB total | 8GB per service |
| **CPU** | Minimal (4 users) | 8 vCPU per service |
| **Database** | ~50MB/year | No limit |
| **Bandwidth** | ~2GB/month | Included |
| **Monthly cost** | ~$4-6 | $5 credit |

---

## 10. Performance Considerations

### 10.1 Optimizations

**Database:**
- Indexes on frequently queried columns (see Prisma schema)
- Connection pooling via Prisma
- Select only needed fields in queries

**Frontend:**
- Server Components for initial data
- Dynamic imports for heavy components (PDF preview)
- Tanstack Query for caching
- Debounced autosave (2s delay)

**API:**
- Pagination on list endpoints
- Streaming PDF generation

### 10.2 Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | <1.5s |
| Time to Interactive | <3s |
| API Response (p95) | <500ms |
| Database Query (p95) | <100ms |

---

## 11. Future Enhancements

### Phase 2 (v1.1)
- [ ] Discount fields (percentage + fixed)
- [ ] Quote versioning
- [ ] Email templates customization

### Phase 3 (v1.2)
- [ ] Customer portal (view-only)
- [ ] Analytics dashboard
- [ ] Xero/QuickBooks integration

### Phase 4 (v2.0)
- [ ] Mobile app
- [ ] AI product recommendations
- [ ] Multi-branch support

---

*Document End — CloudQuote Technical Design v1.1*
