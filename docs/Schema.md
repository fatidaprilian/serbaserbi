# Schema Specification

## 1. Database Entities (Drizzle ORM)

Semua tabel akan menggunakan kolom `user_id` yang mereferensikan pemilik (tenant) data. 

### A. Users
- `id` (uuid, primary key)
- `email` (varchar, unique)
- `name` (varchar)
- `business_name` (varchar, nullable)
- `npwp` (varchar, nullable)
- `default_currency` (varchar, enum: 'IDR', 'USD')
- `created_at` (timestamp)

### B. Clients
- `id` (uuid, primary key)
- `user_id` (uuid, fk -> Users)
- `name` (varchar)
- `email` (varchar, nullable)
- `address` (text, nullable)
- `country` (varchar)
- `is_foreign_hint` (boolean)
- `created_at` (timestamp)

### C. Invoices
- `id` (uuid, primary key)
- `user_id` (uuid, fk -> Users)
- `client_id` (uuid, fk -> Clients)
- `invoice_number` (varchar, misal: 'INV-2026-001')
- `status` (enum: 'draft', 'sent', 'partial_paid', 'paid', 'overdue', 'cancelled')
- `issue_date` (date)
- `due_date` (date)
- `currency` (varchar, 'IDR' / 'USD')
- `exchange_rate` (numeric, nullable) - Snapshot kurs
- `exchange_rate_source` (varchar, nullable) - e.g., 'JISDOR BI'
- `exchange_rate_date` (date, nullable)
- `notes` (text, nullable)
- `meterai_required` (boolean)
- `created_at` (timestamp)

### D. Invoice Items
- `id` (uuid, primary key)
- `invoice_id` (uuid, fk -> Invoices)
- `description` (varchar)
- `quantity` (numeric)
- `rate` (numeric)
- `subtotal` (numeric)

### E. Contracts
- `id` (uuid, primary key)
- `user_id` (uuid, fk -> Users)
- `client_id` (uuid, fk -> Clients)
- `contract_number` (varchar)
- `contract_type` (varchar)
- `currency` (varchar)
- `value` (numeric)
- `signature_status` (enum: 'unsigned', 'freelancer_signed', 'both_signed')
- `signed_at` (timestamp, nullable)
- `document_hash` (varchar, nullable) - Untuk integritas E-Signature basic
- `created_at` (timestamp)

## 2. API Endpoints

Semua API Route diamankan dengan middleware Auth.js.

### Invoice API
- `POST /api/invoices`: Create new invoice draft.
- `GET /api/invoices`: List user's invoices (dengan pagination).
- `GET /api/invoices/:id`: Dapatkan detail (termasuk item dan client).
- `PATCH /api/invoices/:id`: Update status / data (hanya bisa jika status draft).
- `DELETE /api/invoices/:id`: Soft delete.

### Client API
- `POST /api/clients`: Add client.
- `GET /api/clients`: List clients untuk autocomplete/dropdown.

### Currency API (External proxy / caching)
- `GET /api/currency/exchange?from=USD&to=IDR&date=YYYY-MM-DD`: Endpoint internal yang mengambil data kurs dari public API atau cache, memastikan klien frontend mendapatkan format kurs yang konsisten.

## 3. Data Flow
1. **Guest Mode:** Data Form (Frontend) -> JSON payload -> `@react-pdf/renderer` Worker -> PDF Blob -> Download URL. (Tanpa melalui DB).
2. **Login Mode:** Data Form (Frontend) -> `POST /api/invoices` -> Validasi `user_id` dari session -> Insert ke DB (Drizzle).
3. **Generate PDF (Login Mode):** Tombol PDF ditekan -> Fetch `GET /api/invoices/:id` -> Payload di-feed ke `@react-pdf/renderer` -> PDF Download.
