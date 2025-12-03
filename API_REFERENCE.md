# CloudQuote API Reference

Quick reference guide for all API endpoints.

---

## Authentication

All endpoints require authentication via NextAuth.js session cookie.

**Login:**
```
POST /api/auth/callback/credentials
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

---

## Quotes API

### List Quotes
```
GET /api/quotes?page=1&limit=20&search=customer&status=DRAFT
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search in quote number, customer name, address
- `status` (optional): Filter by status (DRAFT, FINALIZED, SENT, SAVED, ARCHIVED)

**Response:**
```json
{
  "data": [
    {
      "id": "cuid",
      "quoteNumber": "Q-2025-001",
      "status": "DRAFT",
      "customerName": "John Doe",
      "address": "123 Main St",
      "total": "5000.00",
      "createdAt": "2025-12-03T10:00:00Z",
      "createdBy": { "id": "...", "name": "Admin" },
      "houseType": { "id": "...", "name": "Standard", "multiplier": "1.00" },
      "_count": { "items": 5, "additionalCosts": 1 }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

### Create Quote
```
POST /api/quotes
Content-Type: application/json

{
  "quoteNumber": "Q-2025-001",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "01234 567890",
  "address": "123 Main St, City, POST CODE",
  "houseTypeId": "standard",
  "notes": "Customer prefers gloss finish",
  "internalNotes": "Rush order",
  "validUntil": "2025-12-31T23:59:59Z"
}
```

**Required Fields:**
- `quoteNumber` (string, unique)
- `customerName` (string)
- `address` (string)

**Response:** 201 Created
```json
{
  "data": { /* Quote object */ }
}
```

---

### Get Quote
```
GET /api/quotes/{id}
```

**Response:**
```json
{
  "data": {
    "id": "cuid",
    "quoteNumber": "Q-2025-001",
    "status": "DRAFT",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "01234 567890",
    "address": "123 Main St",
    "houseTypeId": "standard",
    "houseTypeMultiplier": "1.00",
    "subtotal": "4166.67",
    "vatRate": "20.00",
    "vatAmount": "833.33",
    "total": "5000.00",
    "notes": "Customer prefers gloss finish",
    "internalNotes": "Rush order",
    "validUntil": "2025-12-31T23:59:59Z",
    "sentAt": null,
    "createdAt": "2025-12-03T10:00:00Z",
    "updatedAt": "2025-12-03T10:00:00Z",
    "items": [
      {
        "id": "cuid",
        "productName": "Base Unit 600mm",
        "productSku": "BU-600",
        "quantity": "2.00",
        "priceUnit": "UNIT",
        "unitPrice": "150.00",
        "lineTotal": "300.00",
        "sortOrder": 0,
        "notes": null
      }
    ],
    "additionalCosts": [
      {
        "id": "cuid",
        "description": "Delivery Fee",
        "amount": "50.00",
        "taxable": true,
        "sortOrder": 0
      }
    ],
    "houseType": {
      "id": "standard",
      "name": "Standard",
      "multiplier": "1.00"
    },
    "createdBy": { "id": "...", "name": "Admin", "email": "admin@example.com" },
    "updatedBy": { "id": "...", "name": "Admin", "email": "admin@example.com" },
    "changeHistory": [
      {
        "id": "cuid",
        "action": "create",
        "changedAt": "2025-12-03T10:00:00Z",
        "user": { "id": "...", "name": "Admin" }
      }
    ]
  }
}
```

---

### Update Quote
```
PATCH /api/quotes/{id}
Content-Type: application/json

{
  "customerName": "Jane Doe",
  "status": "FINALIZED"
}
```

**Updatable Fields:**
- `quoteNumber`, `customerName`, `customerEmail`, `customerPhone`
- `address`, `houseTypeId`, `notes`, `internalNotes`
- `validUntil`, `status`

**Response:** 200 OK with updated quote

---

### Archive Quote (Admin Only)
```
DELETE /api/quotes/{id}
```

**Response:** 200 OK
```json
{
  "success": true
}
```

---

### Duplicate Quote
```
POST /api/quotes/{id}/duplicate
```

Creates a copy of the quote with a new quote number (original + "-COPY-{timestamp}")

**Response:** 201 Created with new quote

---

### Send Quote via Email
```
POST /api/quotes/{id}/send
```

Generates PDF and sends to `customerEmail`. Updates status to `SENT`.

**Requirements:**
- Quote must have `customerEmail`
- SMTP must be configured

**Response:** 200 OK
```json
{
  "success": true
}
```

---

### Download Quote PDF
```
GET /api/quotes/{id}/pdf
```

**Response:** 200 OK
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="Quote-{number}.pdf"

---

## Quote Items API

### Add Item to Quote
```
POST /api/quotes/{id}/items
Content-Type: application/json

{
  "productId": "cuid",
  "quantity": 2,
  "notes": "Custom size required"
}
```

**Fields:**
- `productId` (optional): If provided, product details are auto-filled
- `productName` (required if no productId)
- `productSku` (optional)
- `quantity` (required, number)
- `priceUnit` (required: UNIT, LINEAR_METER, SQUARE_METER)
- `unitPrice` (required if no productId, number)
- `notes` (optional)
- `sortOrder` (optional, auto-incremented)

**Response:** 201 Created with item + recalculated quote totals

---

### Update Quote Item
```
PATCH /api/quotes/{id}/items/{itemId}
Content-Type: application/json

{
  "quantity": 3,
  "unitPrice": 155.00
}
```

**Response:** 200 OK with updated item + recalculated totals

---

### Remove Quote Item
```
DELETE /api/quotes/{id}/items/{itemId}
```

**Response:** 200 OK
```json
{
  "success": true
}
```

---

## Products API

### List Products
```
GET /api/products?categoryId={id}&search=base&active=true
```

**Query Parameters:**
- `categoryId` (optional): Filter by category
- `search` (optional): Search in name, SKU, description
- `active` (optional): true/false (default: true)

**Response:**
```json
{
  "data": [
    {
      "id": "cuid",
      "categoryId": "cuid",
      "sku": "BU-600",
      "name": "Base Unit 600mm",
      "description": "Standard base unit",
      "basePrice": "150.00",
      "priceUnit": "UNIT",
      "minQuantity": "1.00",
      "maxQuantity": null,
      "active": true,
      "sortOrder": 0,
      "category": {
        "id": "cuid",
        "name": "Base Units",
        "slug": "base-units"
      }
    }
  ]
}
```

---

### Create Product (Admin Only)
```
POST /api/products
Content-Type: application/json

{
  "categoryId": "cuid",
  "sku": "BU-700",
  "name": "Base Unit 700mm",
  "description": "Larger base unit",
  "basePrice": 175.00,
  "priceUnit": "UNIT",
  "minQuantity": 1,
  "maxQuantity": null,
  "active": true,
  "sortOrder": 0
}
```

**Response:** 201 Created

---

### Get Product
```
GET /api/products/{id}
```

**Response:** 200 OK with product object

---

### Update Product (Admin Only)
```
PATCH /api/products/{id}
Content-Type: application/json

{
  "basePrice": 180.00,
  "active": false
}
```

**Response:** 200 OK with updated product

---

### Deactivate Product (Admin Only)
```
DELETE /api/products/{id}
```

Soft deletes by setting `active: false`

**Response:** 200 OK

---

## Categories API

### List Categories
```
GET /api/categories?active=true
```

**Response:**
```json
{
  "data": [
    {
      "id": "cuid",
      "name": "Base Units",
      "slug": "base-units",
      "description": "Kitchen base cabinets",
      "sortOrder": 1,
      "active": true,
      "_count": {
        "products": 12
      }
    }
  ]
}
```

---

## House Types API

### List House Types
```
GET /api/house-types?active=true
```

**Response:**
```json
{
  "data": [
    {
      "id": "standard",
      "name": "Standard",
      "multiplier": "1.00",
      "active": true,
      "sortOrder": 1
    },
    {
      "id": "premium",
      "name": "Premium",
      "multiplier": "1.15",
      "active": true,
      "sortOrder": 2
    }
  ]
}
```

---

### Update House Type (Admin Only)
```
PATCH /api/house-types/{id}
Content-Type: application/json

{
  "multiplier": 1.20,
  "name": "Premium Plus"
}
```

**Response:** 200 OK with updated house type

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "error": "Quote not found"
}
```

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": [
    {
      "path": ["quoteNumber"],
      "message": "Required"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Not currently implemented. Consider adding in production:
- Use middleware or edge functions
- Recommended: 100 requests/minute per user
- 429 Too Many Requests response

---

## CORS

Not currently configured. API is same-origin only.
If needed for external access:
- Add Next.js API middleware
- Configure allowed origins
- Set proper credentials handling

---

**API Version:** 1.0
**Last Updated:** December 3, 2025
