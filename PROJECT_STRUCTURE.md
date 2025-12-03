# CloudQuote Project Structure

```
CloudQuote/
├── 📄 Configuration Files
│   ├── .env.example              # Environment variables template
│   ├── .eslintrc.json            # ESLint configuration
│   ├── .gitignore                # Git ignore patterns
│   ├── next.config.js            # Next.js configuration
│   ├── package.json              # Dependencies and scripts
│   ├── postcss.config.js         # PostCSS configuration
│   ├── railway.json              # Railway deployment config
│   ├── tailwind.config.ts        # Tailwind CSS configuration
│   └── tsconfig.json             # TypeScript configuration
│
├── 📚 Documentation
│   ├── CLAUDE.md                 # Project overview
│   ├── DESIGN_DOCUMENT.md        # Technical specification
│   ├── README.md                 # Getting started guide
│   └── PROJECT_STRUCTURE.md      # This file
│
├── 🗄️ prisma/
│   ├── schema.prisma             # Database schema (Users, Quotes, Products, etc.)
│   └── seed.ts                   # Database seed data script
│
└── 📁 src/
    ├── 🎨 app/                   # Next.js App Router
    │   ├── (auth)/               # Authentication routes (public)
    │   │   ├── login/
    │   │   │   └── page.tsx      # Login page
    │   │   └── layout.tsx        # Auth layout (centered)
    │   │
    │   ├── (dashboard)/          # Dashboard routes (protected)
    │   │   ├── quotes/
    │   │   │   ├── [id]/
    │   │   │   │   └── page.tsx  # Edit quote page
    │   │   │   ├── new/
    │   │   │   │   └── page.tsx  # New quote page
    │   │   │   └── page.tsx      # Quote list page
    │   │   ├── products/
    │   │   │   └── page.tsx      # Product management page
    │   │   ├── settings/
    │   │   │   └── page.tsx      # Settings page
    │   │   └── layout.tsx        # Dashboard layout (sidebar + header)
    │   │
    │   ├── api/
    │   │   └── auth/
    │   │       └── [...nextauth]/
    │   │           └── route.ts  # NextAuth API handler
    │   │
    │   ├── layout.tsx            # Root layout
    │   └── page.tsx              # Home page (redirects to /quotes)
    │
    ├── 🧩 components/
    │   ├── ui/                   # Base UI components
    │   │   ├── Badge.tsx         # Badge and StatusBadge components
    │   │   ├── Button.tsx        # Button with variants
    │   │   ├── Card.tsx          # Card and subcomponents
    │   │   ├── Input.tsx         # Input, Textarea, Select
    │   │   ├── Skeleton.tsx      # Loading skeletons
    │   │   └── index.ts          # UI components barrel export
    │   │
    │   ├── layout/               # Layout components
    │   │   ├── DashboardLayout.tsx  # Main dashboard wrapper
    │   │   ├── Header.tsx        # Top header with search and user menu
    │   │   ├── Sidebar.tsx       # Left navigation sidebar
    │   │   └── index.ts          # Layout components barrel export
    │   │
    │   ├── quotes/               # Quote-specific components (to be implemented)
    │   └── products/             # Product-specific components (to be implemented)
    │
    ├── 🪝 hooks/
    │   └── useAutosave.ts        # Autosave hook with debouncing
    │
    ├── 📚 lib/
    │   ├── auth.ts               # NextAuth configuration
    │   ├── auth-utils.ts         # Auth helpers (requireAuth, hasPermission)
    │   ├── db.ts                 # Prisma client singleton
    │   ├── email.ts              # Email sending with Nodemailer
    │   ├── pricing.ts            # Quote price calculations
    │   └── utils.ts              # Utility functions (cn, formatCurrency, etc.)
    │
    ├── 🎨 styles/
    │   └── globals.css           # Global styles + Design system CSS variables
    │
    ├── 📝 types/
    │   └── next-auth.d.ts        # NextAuth type extensions
    │
    └── middleware.ts             # NextAuth middleware for route protection
```

## Key Directories

### `/src/app` - Next.js App Router
- **`(auth)`**: Public authentication routes (login)
- **`(dashboard)`**: Protected dashboard routes with sidebar layout
- **`api`**: API endpoints for server-side operations

### `/src/components`
- **`ui/`**: Reusable base components (Button, Card, Input, etc.)
- **`layout/`**: Layout components (Sidebar, Header, DashboardLayout)
- **`quotes/`**: Quote-specific components (to be implemented)
- **`products/`**: Product-specific components (to be implemented)

### `/src/lib`
- **`auth.ts`**: NextAuth configuration with credentials provider
- **`db.ts`**: Prisma client for database operations
- **`email.ts`**: Email service using Nodemailer
- **`pricing.ts`**: Quote pricing calculations with VAT
- **`utils.ts`**: Utility functions (currency formatting, date formatting, etc.)

### `/prisma`
- **`schema.prisma`**: Complete database schema with all models
- **`seed.ts`**: Seed script for sample data (users, products, categories)

## Design System

The design system is defined in `/src/styles/globals.css` with CSS variables:

- **Colors**: Dark/light theme support with glassmorphism effects
- **Typography**: Three font families (Bricolage Grotesque, IBM Plex Sans, JetBrains Mono)
- **Components**: Pre-styled classes for buttons, cards, inputs, badges, etc.
- **Utilities**: Scrollbar styling, gradients, animations

## File Count Summary

- **Total Files**: 46 files
- **TypeScript/TSX Files**: 28 files
- **Configuration Files**: 10 files
- **Documentation Files**: 4 files
- **Prisma Files**: 2 files
- **CSS Files**: 1 file

## Next Steps

1. Set up environment variables (copy `.env.example` to `.env`)
2. Run `npm run db:push` to create database schema
3. Run `npm run db:seed` to populate sample data
4. Run `npm run dev` to start development server
5. Visit `http://localhost:3000` and login with default credentials

---

*All files have been scaffolded and are ready for development.*
