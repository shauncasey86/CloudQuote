# CloudQuote - Kitchen Installation Quoting System

> A modern, full-stack web application for managing kitchen installation quotes with real-time pricing, PDF generation, and email delivery.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 🌟 Features

- ✅ Complete quote lifecycle management (Draft → Finalized → Sent → Saved)
- ✅ Real-time price calculations with house type multipliers
- ✅ Auto-save functionality with 2-second debounce
- ✅ Professional PDF generation and email delivery
- ✅ Full-text search and filtering
- ✅ Modern glassmorphism UI with dark theme
- ✅ Mobile-responsive design
- ✅ Print-optimized quote views

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/shauncasey86/CloudQuote.git
cd CloudQuote

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npx prisma db push
npm run db:seed

# Run development server
npm run dev

# Open http://localhost:3000
# Login: admin@yourcompany.com / changeme123
```

---

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - Project specifications
- [DESIGN_DOCUMENT.md](./DESIGN_DOCUMENT.md) - Technical design
- [STAGE1_SUMMARY.md](./STAGE1_SUMMARY.md) - Backend implementation
- [STAGE2_COMPLETE.md](./STAGE2_COMPLETE.md) - Frontend implementation
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation

---

## 🛠️ Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, React Hook Form, Tanstack Query  
**Backend:** Prisma, PostgreSQL, NextAuth.js, Nodemailer  
**Deployment:** Railway (recommended)

---

## 📄 License

Proprietary - Internal use only

---

**CloudQuote** - Built with [Claude Code](https://claude.com/claude-code)
