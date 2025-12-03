# CloudQuote - Local Testing Guide

Complete guide for testing Stage 1 API endpoints locally.

---

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database (local or cloud)
- Git repository initialized
- Text editor or IDE (VS Code recommended)

---

## Step 1: Environment Setup

### 1.1 Create Local Environment File

Copy the example environment file:

```bash
cp .env.example .env.local
```

### 1.2 Configure Environment Variables

Edit `.env.local` with your local settings:

```bash
# Database - Local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/cloudquote"

# NextAuth - Local
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-a-secret-key>"

# Google SMTP (Optional for email testing)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# App
NEXT_PUBLIC_APP_NAME="CloudQuote"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## Step 2: Database Setup

### 2.1 Start PostgreSQL

**Option A - Local PostgreSQL:**
```bash
# Windows (if installed via installer)
# PostgreSQL should auto-start as a service

# Or start manually
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start
```

**Option B - Docker (Recommended):**
```bash
docker run --name cloudquote-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=cloudquote \
  -p 5432:5432 \
  -d postgres:15
```

**Option C - Use Railway/Supabase (Remote):**
- Create a database on Railway or Supabase
- Copy the connection string to `.env.local`

### 2.2 Run Database Migrations

```bash
npx prisma migrate dev
```

This will:
- Create all database tables
- Set up relations and indexes
- Apply the schema from `prisma/schema.prisma`

### 2.3 Seed Database with Test Data

```bash
npm run db:seed
```

This creates:
- Admin user: `admin@yourcompany.com` / `changeme123`
- 4 house types (Standard, Premium, Luxury, Custom Build)
- 8 product categories
- Sample products in Base Units and Worktops categories

---

## Step 3: Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

**Expected Output:**
```
▲ Next.js 14.2.18
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.5s
```

---

## Step 4: Test Authentication

### 4.1 Login via Browser

1. Open `http://localhost:3000/login`
2. Enter credentials:
   - Email: `admin@yourcompany.com`
   - Password: `changeme123`
3. You should be redirected to the dashboard

### 4.2 Get Session Token (for API testing)

**Method 1 - Browser DevTools:**
1. Open DevTools (F12)
2. Go to Application → Cookies
3. Find `next-auth.session-token`
4. Copy the value

**Method 2 - Using curl:**
```bash
curl -c cookies.txt -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourcompany.com","password":"changeme123"}'
```

---

## Step 5: Test API Endpoints

### 5.1 Using Browser DevTools Console

Open browser console (F12) and run:

```javascript
// Test GET /api/quotes
fetch('/api/quotes')
  .then(r => r.json())
  .then(console.log);

// Test GET /api/products
fetch('/api/products')
  .then(r => r.json())
  .then(console.log);

// Test GET /api/categories
fetch('/api/categories')
  .then(r => r.json())
  .then(console.log);

// Test GET /api/house-types
fetch('/api/house-types')
  .then(r => r.json())
  .then(console.log);
```

### 5.2 Using curl (Command Line)

**List Quotes:**
```bash
curl -b cookies.txt http://localhost:3000/api/quotes
```

**Create Quote:**
```bash
curl -b cookies.txt -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "quoteNumber": "Q-TEST-001",
    "customerName": "Test Customer",
    "customerEmail": "test@example.com",
    "customerPhone": "01234 567890",
    "address": "123 Test Street, Test City, TE1 2ST",
    "houseTypeId": "standard"
  }'
```

**List Products:**
```bash
curl -b cookies.txt http://localhost:3000/api/products
```

**Get Single Quote:**
```bash
# Replace {quote-id} with actual ID from create response
curl -b cookies.txt http://localhost:3000/api/quotes/{quote-id}
```

### 5.3 Using Postman or Insomnia

**Setup:**
1. Create a new request
2. Set method and URL
3. Go to Cookies/Headers
4. Add cookie: `next-auth.session-token=<your-token>`

**Example Requests:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `http://localhost:3000/api/quotes` | List all quotes |
| POST | `http://localhost:3000/api/quotes` | Create quote |
| GET | `http://localhost:3000/api/quotes/{id}` | Get quote details |
| PATCH | `http://localhost:3000/api/quotes/{id}` | Update quote |
| POST | `http://localhost:3000/api/quotes/{id}/items` | Add item to quote |
| GET | `http://localhost:3000/api/products` | List products |
| GET | `http://localhost:3000/api/categories` | List categories |

---

## Step 6: Test Complete Quote Workflow

### 6.1 Create a Complete Quote

```javascript
// 1. Create quote
const createQuote = await fetch('/api/quotes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quoteNumber: 'Q-2025-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    address: '123 Kitchen Lane, London, SW1A 1AA',
    houseTypeId: 'standard'
  })
}).then(r => r.json());

const quoteId = createQuote.data.id;
console.log('Quote created:', quoteId);

// 2. Get products
const products = await fetch('/api/products')
  .then(r => r.json());

const baseUnit = products.data.find(p => p.sku === 'BU-600');
console.log('Found product:', baseUnit.name);

// 3. Add item to quote
const addItem = await fetch(`/api/quotes/${quoteId}/items`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: baseUnit.id,
    quantity: 3
  })
}).then(r => r.json());

console.log('Item added:', addItem.data);

// 4. Get updated quote
const updatedQuote = await fetch(`/api/quotes/${quoteId}`)
  .then(r => r.json());

console.log('Quote total:', updatedQuote.data.total);

// 5. Download PDF (opens in new tab)
window.open(`/api/quotes/${quoteId}/pdf`, '_blank');
```

### 6.2 Test Email Sending (Optional)

**Prerequisites:**
- Configure Gmail SMTP in `.env.local`
- Use an App Password (not your regular password)
- Enable 2FA on your Google account first

```javascript
// Send quote via email
const sendEmail = await fetch(`/api/quotes/${quoteId}/send`, {
  method: 'POST'
}).then(r => r.json());

console.log('Email sent:', sendEmail.success);
```

---

## Step 7: Database Inspection

### 7.1 Using Prisma Studio

```bash
npm run db:studio
```

Opens at `http://localhost:5555` - Browse all tables visually.

### 7.2 Using psql (Command Line)

```bash
# Connect to database
psql -U postgres -d cloudquote

# List tables
\dt

# View quotes
SELECT id, quote_number, customer_name, status, total FROM quotes;

# View quote items
SELECT qi.product_name, qi.quantity, qi.unit_price, qi.line_total
FROM quote_items qi
WHERE qi.quote_id = 'your-quote-id';

# Exit
\q
```

---

## Step 8: Test Error Handling

### 8.1 Test Unauthorized Access

```bash
# Without authentication cookie
curl http://localhost:3000/api/quotes
# Expected: {"error":"Unauthorized"}
```

### 8.2 Test Validation Errors

```bash
# Missing required fields
curl -b cookies.txt -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{"customerName": "Test"}'
# Expected: Validation error for missing fields
```

### 8.3 Test Admin-Only Routes

```bash
# Create product (requires admin role)
curl -b cookies.txt -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "...",
    "name": "Test Product",
    "basePrice": 100,
    "priceUnit": "UNIT"
  }'
# Expected: Success if logged in as admin, Forbidden otherwise
```

---

## Step 9: Common Issues & Solutions

### Database Connection Issues

**Error:** `Can't reach database server`

**Solution:**
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env.local`
- Test connection: `psql $DATABASE_URL`

### Authentication Issues

**Error:** `NEXTAUTH_SECRET must be provided`

**Solution:**
```bash
# Generate and add to .env.local
openssl rand -base64 32
```

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

### Prisma Client Issues

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
npx prisma generate
```

### SMTP Email Errors

**Error:** `Invalid login` or `Connection timeout`

**Solution:**
- Use Gmail App Password, not regular password
- Enable 2FA first: https://myaccount.google.com/security
- Generate App Password: https://myaccount.google.com/apppasswords
- Or skip email testing - it's optional for API testing

---

## Step 10: Automated Testing Script

Create `test-api.js` in the root directory:

```javascript
// test-api.js
const BASE_URL = 'http://localhost:3000';

async function testAPIs() {
  console.log('🧪 Testing CloudQuote APIs...\n');

  // Get session (you'll need to login first in browser)
  const cookies = 'next-auth.session-token=<your-token>';

  // Test Categories
  console.log('1️⃣  Testing GET /api/categories');
  const categories = await fetch(`${BASE_URL}/api/categories`, {
    headers: { Cookie: cookies }
  }).then(r => r.json());
  console.log(`   ✅ Found ${categories.data.length} categories\n`);

  // Test Products
  console.log('2️⃣  Testing GET /api/products');
  const products = await fetch(`${BASE_URL}/api/products`, {
    headers: { Cookie: cookies }
  }).then(r => r.json());
  console.log(`   ✅ Found ${products.data.length} products\n`);

  // Test House Types
  console.log('3️⃣  Testing GET /api/house-types');
  const houseTypes = await fetch(`${BASE_URL}/api/house-types`, {
    headers: { Cookie: cookies }
  }).then(r => r.json());
  console.log(`   ✅ Found ${houseTypes.data.length} house types\n`);

  // Test Create Quote
  console.log('4️⃣  Testing POST /api/quotes');
  const quote = await fetch(`${BASE_URL}/api/quotes`, {
    method: 'POST',
    headers: {
      Cookie: cookies,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      quoteNumber: `TEST-${Date.now()}`,
      customerName: 'API Test Customer',
      address: '123 Test Street',
      houseTypeId: houseTypes.data[0]?.id
    })
  }).then(r => r.json());
  console.log(`   ✅ Quote created: ${quote.data.quoteNumber}\n`);

  // Test Get Quote
  console.log('5️⃣  Testing GET /api/quotes/{id}');
  const fetchedQuote = await fetch(`${BASE_URL}/api/quotes/${quote.data.id}`, {
    headers: { Cookie: cookies }
  }).then(r => r.json());
  console.log(`   ✅ Quote retrieved: ${fetchedQuote.data.quoteNumber}\n`);

  console.log('✨ All tests passed!');
}

testAPIs().catch(console.error);
```

Run it:
```bash
node test-api.js
```

---

## Quick Reference

### Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run database migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Generate Prisma client
npx prisma generate

# Format code
npm run lint
```

### Default Test Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@yourcompany.com | changeme123 | ADMIN |

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/quotes` | GET | List quotes |
| `/api/quotes` | POST | Create quote |
| `/api/quotes/{id}` | GET | Get quote |
| `/api/quotes/{id}` | PATCH | Update quote |
| `/api/quotes/{id}/items` | POST | Add item |
| `/api/quotes/{id}/pdf` | GET | Download PDF |
| `/api/quotes/{id}/send` | POST | Email quote |
| `/api/products` | GET | List products |
| `/api/categories` | GET | List categories |
| `/api/house-types` | GET | List house types |

---

## Next Steps

Once local testing is complete:

1. ✅ Verify all API endpoints work
2. ✅ Test complete quote workflow
3. ✅ Validate PDF generation
4. ✅ (Optional) Test email sending
5. 🚀 Ready to proceed to Stage 2 (Frontend)

---

**Happy Testing! 🎉**

If you encounter any issues not covered here, check:
- Browser DevTools Console (F12)
- Terminal where `npm run dev` is running
- Database logs
- Network tab in DevTools for API responses
