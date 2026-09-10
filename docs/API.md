# SerbaSerbi REST API Specification

Comprehensive technical documentation for all HTTP REST API endpoints provided by SerbaSerbi. All endpoints return standardized JSON payloads and use RFC 9457-compliant error structures with standard HTTP status codes.

---

## Endpoint Summary

| Module | Method | Route | Access | Description |
| :--- | :---: | :--- | :---: | :--- |
| **Documents** | `POST` | `/api/documents` | Protected (JWT) | Save a new document (Invoice, Quotation, Contract) |
| **Documents** | `GET` | `/api/documents` | Protected (JWT) | Retrieve all user documents with client details |
| **Payments** | `GET` | `/api/documents/invoice/:id/payments` | Protected (JWT) | Fetch payment history and outstanding balance |
| **Payments** | `POST` | `/api/documents/invoice/:id/payments` | Protected (JWT) | Record installment/down payment & update invoice state |
| **Payments** | `DELETE` | `/api/documents/invoice/:id/payments/:paymentId` | Protected (JWT) | Delete payment record and recalculate invoice balance |
| **Clients** | `GET` | `/api/clients` | Protected (JWT) | List saved client profiles for auto-completion |
| **Clients** | `POST` | `/api/clients` | Protected (JWT) | Create a new client profile |
| **Analytics** | `GET` | `/api/analytics` | Protected (JWT) | Generate financial metrics, status ratios, & 6-mo trends |
| **Currency** | `GET` | `/api/currency/rate` | Public | Get USD/IDR exchange rate from 12-hour in-memory cache |
| **AI (BYOK)** | `GET` | `/api/ai/models` | Protected (JWT) | Fetch live model catalog directly from OpenRouter |
| **AI (BYOK)** | `POST` | `/api/ai/expand-description` | Protected (JWT) | Professional line-item description expansion via LLM |
| **AI (BYOK)** | `POST` | `/api/ai/suggest-clauses` | Protected (JWT) | Generate protective contract clauses via LLM |
| **Settings** | `GET` | `/api/user/settings` | Protected (JWT) | Fetch business profile and payment defaults |
| **Settings** | `POST` | `/api/user/settings` | Protected (JWT) | Update business profile, tax ID, and default notes |
| **Settings** | `GET` | `/api/user/ai-settings` | Protected (JWT) | Get BYOK status with masked API key |
| **Settings** | `POST` | `/api/user/ai-settings` | Protected (JWT) | Encrypt (AES-256-GCM) and store OpenRouter API key |
| **Settings** | `DELETE` | `/api/user/ai-settings` | Protected (JWT) | Remove stored OpenRouter API key configuration |
| **Cron** | `GET` | `/api/cron/check-overdue` | Vercel Cron Secret | Automated daily background scan for overdue invoices |
| **Cron** | `POST` | `/api/cron/check-overdue` | Protected (Session) | Manual trigger to audit and transition overdue invoices |

---

## Core Endpoint Specifications

### 1. Document Persistence (`POST /api/documents`)
Persists an Invoice, Quotation, or Contract to the authenticated user's workspace. If the specified client name does not exist in the database, the system automatically resolves and creates a new client entity in a single transaction.

**Headers:**
```http
Content-Type: application/json
```

**Payload Example (Invoice):**
```json
{
  "docType": "invoice",
  "documentNumber": "INV-2026-004",
  "issueDate": "2026-09-10",
  "dueDate": "2026-09-24",
  "currency": "IDR",
  "notes": "Net 14 payment terms via Bank Central Asia.",
  "clientName": "PT Solusi Prima",
  "clientAddress": "Gedung Cyber 2 Lt. 15, Jakarta Pusat",
  "clientEmail": "finance@solusiprima.id",
  "meteraiRequired": true,
  "items": [
    {
      "description": "Fullstack Web Application Architecture & API Audit",
      "quantity": 1,
      "rate": 15000000,
      "subtotal": 15000000
    }
  ]
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Dokumen berhasil disimpan.",
  "documentId": "48b6c434-cf2a-4389-a29c-efb988f57dc6"
}
```

---

### 2. Record Payment & Down Payment (`POST /api/documents/invoice/:id/payments`)
Records a down payment (DP) or partial payment against an invoice. The invoice status is automatically transitioned based on the accumulated payments:
* `sent` ➔ `partial_paid` (when remaining balance > 0)
* `partial_paid` / `sent` ➔ `paid` (when accumulated payments satisfy or exceed the total invoice amount).

**Payload:**
```json
{
  "amount": 7500000,
  "paymentDate": "2026-09-10",
  "paymentMethod": "bank_transfer",
  "notes": "50% Down Payment received via BCA transfer"
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "payment": {
    "id": "e9324e93-6c84-4861-b404-5858f96e47c1",
    "amount": "7500000",
    "paymentDate": "2026-09-10",
    "paymentMethod": "bank_transfer"
  },
  "invoiceStatus": "partial_paid",
  "remainingBalance": 7500000
}
```

---

### 3. Currency Rate Caching (`GET /api/currency/rate?from=USD&to=IDR`)
Fetches exchange rate data backed by an in-memory 12-hour caching layer to prevent third-party rate limiting.

**Response (`200 OK`):**
```json
{
  "from": "USD",
  "to": "IDR",
  "rate": 16250,
  "source": "Bank Indonesia JISDOR / Open Exchange Rates (Cached)",
  "cachedAt": "14:30 WIB",
  "isCached": true
}
```

**Response Headers:**
```http
Cache-Control: s-maxage=43200, stale-while-revalidate=3600
```

---

### 4. Overdue Background Cron Scan (`GET /api/cron/check-overdue`)
Invoked automatically by the Vercel Cron scheduler daily at 01:00 UTC.

**Headers:**
```http
Authorization: Bearer <CRON_SECRET>
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Pemindaian tagihan jatuh tempo selesai.",
  "processed": 1,
  "updatedInvoices": ["INV-2026-003"],
  "remindersSent": 1
}
```
