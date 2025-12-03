# CloudQuote

**Internal Kitchen Quoting System**

CloudQuote is a web-based quoting platform for creating, managing, and distributing kitchen installation quotes. Built with Next.js 14, Prisma, and PostgreSQL.

## Features

- Quote Management (Create, Edit, Duplicate, Archive)
- Product Catalog with Dynamic Pricing
- House Type Multipliers
- Email Quote Delivery with PDF Attachments
- Full-Text Search
- Role-Based Access Control
- Autosave Functionality
- Dark/Light Mode
- UK-Specific Formatting (GBP, DD/MM/YYYY)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS + CSS Variables (Glassmorphism)
- **Email**: Nodemailer (Google SMTP)
- **PDF Generation**: @react-pdf/renderer
- **State Management**: Tanstack Query
- **Hosting**: Railway

## Getting Started

### Prerequisites

- Node.js 20+ LTS
- PostgreSQL database (or use Railway)
- Google Workspace account for SMTP (optional)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd CloudQuote
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your values:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `SMTP_*`: Google SMTP credentials (use App Password)

4. Initialize the database:
```bash
# Push Prisma schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Default Credentials

After seeding, use these credentials to log in:
- **Email**: admin@yourcompany.com
- **Password**: changeme123

**Important**: Change these credentials immediately in production!

## Project Structure

```
cloudquote/
├── CLAUDE.md                 # Project overview
├── DESIGN_DOCUMENT.md        # Technical specification
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Sample data
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # Auth routes (login)
│   │   ├── (dashboard)/      # Protected dashboard routes
│   │   └── api/              # API endpoints
│   ├── components/
│   │   ├── ui/               # Base components
│   │   ├── layout/           # Layout components
│   │   ├── quotes/           # Quote-specific
│   │   └── products/         # Product-specific
│   ├── lib/
│   │   ├── db.ts             # Prisma client
│   │   ├── auth.ts           # NextAuth config
│   │   ├── email.ts          # SMTP service
│   │   ├── pricing.ts        # Price calculations
│   │   └── utils.ts          # Utilities
│   ├── hooks/                # Custom React hooks
│   ├── styles/
│   │   └── globals.css       # Global styles
│   └── types/                # TypeScript definitions
├── public/                   # Static assets
└── railway.json              # Railway config
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:migrate   # Run Prisma migrations
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

## Deployment to Railway

1. Create a Railway project:
```bash
railway login
railway init
```

2. Add PostgreSQL service in Railway dashboard:
   - Go to your project → Add Service → Database → PostgreSQL

3. Link database to your app (Railway auto-injects `DATABASE_URL`)

4. Set environment variables in Railway dashboard:
   - All variables from `.env.example`

5. Connect GitHub repository in Railway settings

6. Deploy:
```bash
git push origin main
```

7. Run migrations on Railway:
```bash
railway run npm run db:migrate
railway run npm run db:seed
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Railway auto-provides |
| `NEXTAUTH_URL` | Application URL | `https://cloudquote.up.railway.app` |
| `NEXTAUTH_SECRET` | NextAuth secret key | Generate with `openssl rand -base64 32` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | `quotes@yourcompany.com` |
| `SMTP_PASSWORD` | SMTP password | Google App Password |
| `NEXT_PUBLIC_APP_NAME` | Application name | `CloudQuote` |

## User Roles

- **ADMIN**: Full access including product management and user management
- **STAFF**: Create, edit, and send quotes; view products
- **READONLY**: View quotes and products only

## Development Notes

- The app uses NextAuth.js with credentials provider for authentication
- Prisma handles all database operations with type safety
- Autosave functionality uses debounced mutations (2s delay)
- PDF generation is server-side using React components
- Email sending uses Google SMTP with Nodemailer
- The design system uses CSS variables for easy theming

## Support

For issues and questions, refer to:
- [CLAUDE.md](./CLAUDE.md) - Project overview
- [DESIGN_DOCUMENT.md](./DESIGN_DOCUMENT.md) - Full technical specification

## License

Internal use only. All rights reserved.

---

*Generated for CloudQuote — Internal Kitchen Quoting System*
