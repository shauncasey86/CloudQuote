# CLAUDE.md

## Project Name

**CloudQuote** — Clean, professional, implies modern cloud-based quoting.

---

## Short Description

CloudQuote is an internal, multi-user web application for creating, managing, and distributing kitchen installation quotes. It combines product cataloguing, dynamic pricing logic, autosaving workflows, and professional PDF/email delivery into a unified, glassmorphism-styled dashboard interface.

---

## Purpose and Goals

- **Eliminate manual quoting friction** — Replace spreadsheets and paper-based workflows with a centralized, searchable system
- **Ensure pricing accuracy** — Lock historical prices at quote time; support both per-unit and linear-meter pricing models
- **Accelerate quote delivery** — Generate branded PDFs and send via Google SMTP directly from the interface
- **Enable team collaboration** — All staff can view and edit all quotes with transparent change tracking
- **Future-proof the system** — Architected for discount fields, versioning, and potential client-facing portals

---

## Key Features

- **Quote Management**
  - Create, edit, duplicate, and archive quotes
  - Lifecycle tracking: Draft → Finalized → Sent → Saved
  - Full-text search by address, order number, customer name
  - Manual quote number entry with collision detection

- **Product Catalogue**
  - Categorized product selection (Base Units, Wall Units, Towers, Décor, Worktops, Accessories)
  - Per-unit and linear-meter pricing support
  - Dynamic pricing based on house type multipliers
  - Bulk add/remove with quantity controls

- **Pricing Engine**
  - Static base prices + house-type modifiers
  - Additional fixed-cost line items
  - Price snapshot retention (historical accuracy)
  - Automatic totalling with VAT handling

- **Output & Delivery**
  - Branded printable quote view (ink-optimized)
  - Manufacturing specification view
  - Email quote as PDF attachment via Google SMTP
  - Download as PDF

- **Admin Tools** (optional permissions)
  - Product CRUD operations
  - Price management
  - User access control

- **UX Features**
  - Autosave with sync indicators
  - Dark/light mode toggle
  - Mobile-responsive, desktop-first design
  - UK-specific formatting (GBP, DD/MM/YYYY)

---

## Chosen Tech Stack

**Stack: Next.js 14 (App Router) + Railway (PostgreSQL + Hosting)**

```
┌─────────────────────────────────────────────────────────────┐
│                         RAILWAY                              │
│                    (Single Platform)                         │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js 14 Service                        │  │
│  │                                                        │  │
│  │  • React 18 + TypeScript + App Router                  │  │
│  │  • Tailwind CSS + CSS Variables (glassmorphism)        │  │
│  │  • NextAuth.js (credentials provider)                  │  │
│  │  • Prisma ORM                                          │  │
│  │  • React Hook Form + Zod (validation)                  │  │
│  │  • Tanstack Query (server state)                       │  │
│  │  • Framer Motion (animations)                          │  │
│  │  • @react-pdf/renderer (PDF generation)                │  │
│  │  • Nodemailer (Google SMTP)                            │  │
│  │                                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│                            ▼                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Service                        │  │
│  │                                                        │  │
│  │  • quotes, quote_items, products                       │  │
│  │  • users, sessions (NextAuth)                          │  │
│  │  • change_history, additional_costs                    │  │
│  │  • Full-text search indexes                            │  │
│  │                                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Google Workspace SMTP                     │  │
│  │              (Quote email delivery)                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Justification:**
- **Single platform** — Everything on Railway, one dashboard, one bill
- **Already paying** — Hobby $5/mo covers this workload (~$4-6/mo usage)
- **Next.js** — SSR/SSG flexibility, excellent DX, built-in API routes
- **Prisma** — Type-safe database access, excellent migrations
- **NextAuth.js** — Production-ready auth, stores sessions in same PostgreSQL
- **No vendor juggling** — No Supabase pause concerns, no Vercel commercial terms

---

## Target Users

| Role | Access Level | Primary Actions |
|------|--------------|-----------------|
| **Sales Staff** | Full quote access | Create, edit, send quotes |
| **Warehouse/Manufacturing** | Read + Manufacturing view | View specs, print job sheets |
| **Admin** | Full + Product management | Edit products, prices, users |

All users are internal employees (4 staff). No customer-facing portal in v1.

---

## Hosting Plan

| Component | Provider | Cost |
|-----------|----------|------|
| Next.js + API | Railway | ~$2-3/mo |
| PostgreSQL | Railway | ~$2-3/mo |
| **Total** | | **~$4-6/mo** (covered by $5 Hobby credit) |

SMTP via existing Google Workspace — no additional cost.

---

## Auth & Security Summary

- **Authentication:** Email/password via NextAuth.js (credentials provider)
- **Session Storage:** JWT tokens + database sessions in PostgreSQL
- **Authorization:** Middleware permission checks + role-based access
- **Role-based Access:** Admin, Staff roles stored in `users.role` column
- **Password Security:** bcrypt hashing
- **Data Protection:** 
  - All traffic over HTTPS (Railway provides SSL)
  - Environment variables for secrets
  - No client-side storage of sensitive data
- **Audit Trail:** Change history table with user attribution

---

## UI Style Guide Summary

### Design Philosophy
**"Precision Glass"** — A refined glassmorphism aesthetic that balances visual sophistication with business utility. Dark-first with warm accents.

### Color System
```css
/* Dark Theme (Primary) */
--bg-base: #0a0a0f;
--bg-elevated: rgba(18, 18, 28, 0.8);
--bg-glass: rgba(255, 255, 255, 0.03);
--border-glass: rgba(255, 255, 255, 0.08);
--text-primary: #f4f4f5;
--text-secondary: #a1a1aa;
--accent-primary: #c084fc;      /* Violet */
--accent-secondary: #f59e0b;    /* Amber */
--accent-success: #10b981;
--accent-danger: #ef4444;
--gradient-hero: linear-gradient(135deg, #7c3aed 0%, #c084fc 50%, #f0abfc 100%);

/* Light Theme */
--bg-base: #fafafa;
--bg-elevated: rgba(255, 255, 255, 0.9);
--bg-glass: rgba(255, 255, 255, 0.7);
--border-glass: rgba(0, 0, 0, 0.06);
--text-primary: #18181b;
--text-secondary: #71717a;
```

### Typography
```css
/* Display/Headlines: Bricolage Grotesque — characterful, modern */
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@200;400;600;800&display=swap');

/* Body/UI: IBM Plex Sans — technical precision */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap');

/* Monospace (prices, IDs): JetBrains Mono */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
```

### Component Patterns
- **Cards:** `backdrop-blur-xl`, subtle border, inner shadow, 16px radius
- **Buttons:** Gradient fills for primary actions, ghost variants for secondary
- **Inputs:** Transparent backgrounds, bottom-border focus states
- **Navigation:** Fixed sidebar with icon + label, active state gradient
- **Tables:** Minimal lines, alternating row tints, sticky headers
- **Charts:** Soft gradient fills, rounded line caps, hover tooltips

### Motion
- Page load: Staggered fade-up reveals (50ms delays)
- Interactions: 200ms ease-out transitions
- Focus states: Subtle scale + glow effects
- Loading: Skeleton shimmer animations

### Print Optimization
- Strip glassmorphism effects
- High-contrast black text on white
- Company logo header
- Clean table borders
- No background colors except brand accents

---

## File Structure Preview

```
cloudquote/
├── CLAUDE.md                 # This file
├── DESIGN_DOCUMENT.md        # Full technical specification
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Sample data
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # Login, register routes
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/      # Main app routes
│   │   │   ├── quotes/
│   │   │   ├── products/
│   │   │   ├── settings/
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── quotes/
│   │   │   ├── products/
│   │   │   └── email/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/               # Base components (Button, Input, Card)
│   │   ├── quotes/           # Quote-specific components
│   │   ├── products/         # Product selection components
│   │   └── layout/           # Sidebar, Header, etc.
│   ├── lib/
│   │   ├── db.ts             # Prisma client
│   │   ├── auth.ts           # NextAuth config
│   │   ├── email.ts          # SMTP configuration
│   │   └── pdf.ts            # PDF generation
│   ├── hooks/                # Custom React hooks
│   ├── styles/
│   │   └── globals.css       # Tailwind + CSS variables
│   └── types/                # TypeScript definitions
├── public/
│   └── assets/               # Logos, icons
├── .env.example              # Environment template
├── railway.json              # Railway config
└── package.json
```

---

## Environment Variables

```bash
# Database (Railway provides this automatically)
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://cloudquote.up.railway.app"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="quotes@yourcompany.com"
SMTP_PASSWORD="xxxx-xxxx-xxxx-xxxx"  # App Password

# App
NEXT_PUBLIC_APP_NAME="CloudQuote"
```

---

## Railway Deployment

```bash
# 1. Create project in Railway dashboard
# 2. Add PostgreSQL service
# 3. Connect GitHub repo for Next.js service
# 4. Set environment variables
# 5. Deploy automatically on push to main
```

Railway auto-detects Next.js and configures build settings. Database URL is injected automatically when services are linked.

---

## Next Steps

1. Review and approve this `CLAUDE.md` overview
2. Proceed to full `DESIGN_DOCUMENT.md` with:
   - Prisma schema (replaces raw SQL)
   - NextAuth.js configuration
   - API endpoint specifications
   - Feature-by-feature breakdown
   - UI wireframes
3. Initialize repository and begin implementation

---

*Generated for CloudQuote — Internal Kitchen Quoting System*
