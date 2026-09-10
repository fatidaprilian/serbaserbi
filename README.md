# SerbaSerbi

> **Compliant Legal Document Generator, Bilingual Invoicing, & Cash Flow Management Platform for Indonesian Freelancers**

[![Live Demo](https://img.shields.io/badge/Demo-serbaserbi.faridekaaprilian.dev-00e599?style=flat-square&logo=vercel)](https://serbaserbi.faridekaaprilian.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-c5f467?style=flat-square)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-00e599?style=flat-square&logo=postgresql)](https://neon.tech/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## Overview

**SerbaSerbi** is a modern web application purpose-built to eliminate the administrative friction faced by Indonesian freelancers, solo consultants, and independent contractors. Traditional freelance workflows often rely on generic Word documents, informal WhatsApp agreements, and fragmented spreadsheets. These ad-hoc methods frequently result in non-compliant paperwork—such as missing the legally mandated Rp10,000 Indonesian Stamp Duty (*Bea Meterai*) on transactions over Rp5,000,000 or lacking protective intellectual property clauses.

SerbaSerbi delivers a **10x workflow acceleration**:
* **Guest Mode (Zero Signup, Maximum Privacy):** Generate print-ready Invoices, Quotations, and Contracts (SPK) directly in your browser. All PDF rendering is executed client-side via `@react-pdf/renderer`—meaning confidential financial details never leave the user's browser.
* **Authenticated Multi-Tenant Workspace:** Log in to maintain a persistent client address book, record partial payments and down payments (DP), track aging receivables, and audit cash flow through an executive analytics dashboard.

**Live Application:** [https://serbaserbi.faridekaaprilian.dev/](https://serbaserbi.faridekaaprilian.dev/)

---

## Capstone Concept Mapping (FlyRank Backend Track)

This project implements **all 7 out of 7 primary engineering concepts** specified in the FlyRank Capstone brief ("Your 10x Solution"):

| # | Concept | Concrete Implementation & Architecture | Primary Source Location |
| :-: | :--- | :--- | :--- |
| **1** | **API Endpoints** | Standardized REST API endpoints featuring strict schema validation, structured error contracts (RFC 9457), and honest HTTP status codes (200, 201, 400, 401, 404, 500). Handles documents, payment installments, client records, and analytics. | [`app/api/documents/route.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/app/api/documents/route.ts)<br>[`app/api/documents/invoice/[id]/payments/route.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/app/api/documents/invoice/%5Bid%5D/payments/route.ts)<br>[`app/api/analytics/route.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/app/api/analytics/route.ts) |
| **2** | **Database** | Persistent serverless PostgreSQL on Neon managed via Drizzle ORM. Comprises 9 relational tables: `users`, `clients`, `invoices`, `invoice_items`, `invoice_payments`, `quotations`, `quotation_items`, `contracts`, and `invoice_reminders`. | [`db/schema.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/db/schema.ts)<br>[`db/index.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/db/index.ts)<br>[`drizzle.config.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/drizzle.config.ts) |
| **3** | **Authentication** | Secure JWT-based session management powered by Auth.js (NextAuth v5). Includes native `scrypt` password hashing, protected middleware and layout route boundaries, and strict tenant data isolation per `userId`. | [`auth.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/auth.ts)<br>[`lib/auth-utils.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/lib/auth-utils.ts)<br>[`app/dashboard/layout.tsx`](https://github.com/fatidaprilian/serbaserbi/blob/main/app/dashboard/layout.tsx) |
| **4** | **Background / Cron Jobs** | Automated daily task orchestrated via Vercel Cron (`0 1 * * *`). Scans for invoices past their due dates, updates their status to `overdue`, and logs persistent reminder audits. | [`app/api/cron/check-overdue/route.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/app/api/cron/check-overdue/route.ts)<br>[`lib/reminder-service.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/lib/reminder-service.ts)<br>[`vercel.json`](https://github.com/fatidaprilian/serbaserbi/blob/main/vercel.json) |
| **5** | **Reporting — PDF** | In-browser dynamic vector PDF generation using `@react-pdf/renderer`. Produces A4 print-ready documents with live language toggling (ID/EN), dual-currency calculations, and automatic Stamp Duty warning banners. | [`components/documents/InvoicePDFWrapper.tsx`](https://github.com/fatidaprilian/serbaserbi/blob/main/components/documents/InvoicePDFWrapper.tsx)<br>[`components/documents/QuotationPDFWrapper.tsx`](https://github.com/fatidaprilian/serbaserbi/blob/main/components/documents/QuotationPDFWrapper.tsx)<br>[`components/documents/ContractPDFWrapper.tsx`](https://github.com/fatidaprilian/serbaserbi/blob/main/components/documents/ContractPDFWrapper.tsx) |
| **6** | **Caching Logic** | Resilient in-memory cache layer with a 12-hour TTL (43,200 seconds) for foreign exchange rates (USD/IDR), backed by HTTP `Cache-Control: s-maxage=43200, stale-while-revalidate=3600` headers and reliable offline fallbacks. | [`lib/currency-cache.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/lib/currency-cache.ts)<br>[`app/api/currency/rate/route.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/app/api/currency/rate/route.ts) |
| **7** | **LLM Integration** | Bring-Your-Own-Key (BYOK) OpenRouter AI integration with `AES-256-GCM` encryption at rest. Dynamically discovers available live models (tagging `:free` tiers), auto-expands brief line-item descriptions, and suggests protective contractual clauses. | [`app/api/ai/expand-description/route.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/app/api/ai/expand-description/route.ts)<br>[`app/api/ai/suggest-clauses/route.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/app/api/ai/suggest-clauses/route.ts)<br>[`lib/crypto-utils.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/lib/crypto-utils.ts) |

---

## 5-Minute Demo Path (Evaluator Guide)

To evaluate the complete end-to-end system in 5 minutes:

1. **Seed the Demonstration Data:**
   ```bash
   npm run db:seed
   ```
2. **Explore Guest Mode (No Authentication Required):**
   * Open `http://localhost:3000` and click **"Buat Invoice"**.
   * Toggle the currency to **USD** ➔ observe the live **"Kurs Ter-cache (12 Jam)"** badge appear (*Caching Logic*).
   * Enter a total sum above Rp5,000,000 (or $350) ➔ observe the Indonesian Stamp Duty (*Bea Meterai*) warning activate (*Reporting*).
   * Click **"Cetak / Unduh PDF"** ➔ the PDF is rendered client-side directly in the browser viewport.
3. **Sign In with the Demo Account:**
   * Click **"Masuk"** in the top navigation bar.
   * Provide the pre-seeded credentials:
     * **Email:** `demo@serbaserbi.id`
     * **Password:** `demo12345`
4. **Audit Payment Tracking & Record a Down Payment:**
   * On the Dashboard overview, inspect the 4 financial KPI cards and the 6-month revenue trend chart (*Reporting & Analytics*).
   * Navigate to the **"Dokumen"** page via the sidebar.
   * Locate invoice `INV-2026-002` (Status: *Cicilan / DP*).
   * Click **"Bayar / DP"** ➔ record a settlement of Rp4,000,000 ➔ watch the invoice status dynamically transition to **Lunas (Paid)** in real time (*Database & API Endpoints*).
5. **Trigger the Automated Overdue Background Job:**
   * On the Documents page, click the **"Cek Jatuh Tempo"** button.
   * The background engine will scan active invoices, detect `INV-2026-003` which has crossed its due date, transition its state to `overdue`, and generate an audit log entry (*Background / Cron Jobs*).
6. **Inspect the BYOK AI Assistant:**
   * Navigate to **"Pengaturan"** (Settings).
   * Inspect the **"AI Assistant (BYOK - OpenRouter)"** card. The system connects directly to OpenRouter's live catalog, dynamically discovering free and premium models without hardcoded lists (*LLM Integration*).

---

## Quick Start (Local Setup)

### Prerequisites
* **Node.js**: v18.18+ or v20+
* **Package Manager**: NPM or PNPM

### Installation in 3 Steps
```bash
# 1. Clone the repository
git clone https://github.com/fatidaprilian/serbaserbi.git
cd serbaserbi

# 2. Install dependencies & configure environment variables
cp .env.example .env.local
npm install

# 3. Synchronize database schema & populate demo data
npm run db:push
npm run db:seed

# 4. Start the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `dev` | `npm run dev` | Starts the Next.js local development server (Turbopack) |
| `build` | `npm run build` | Compiles the production bundle and validates type correctness |
| `start` | `npm run start` | Runs the compiled production server |
| `lint` | `npm run lint` | Runs ESLint to check code quality and style compliance |
| `db:push` | `npm run db:push` | Pushes schema changes in `db/schema.ts` directly to the Neon Database |
| `db:generate` | `npm run db:generate` | Generates SQL migration files using Drizzle Kit |
| `db:studio` | `npm run db:studio` | Launches Drizzle Studio web GUI to inspect database tables visually |
| `db:seed` | `npm run db:seed` | Populates the database with the demo user, client profiles, and invoices |

---

## Environment Variables Reference

See [`.env.example`](file:///.env.example) for the full configuration template.

| Variable | Required In | Description |
| :--- | :---: | :--- |
| `DATABASE_URL` | Local & Prod | Connection pooled PostgreSQL URL from Neon |
| `DATABASE_URL_UNPOOLED` | Local & Prod | Direct (non-pooled) PostgreSQL URL for DDL migrations |
| `POSTGRES_URL` | Local & Prod | Vercel Postgres compatibility connection string |
| `NEXTAUTH_SECRET` | Local & Prod | Secret key used to sign and verify Auth.js JWT session tokens |
| `AUTH_SECRET` | Local & Prod | Aliased secret required for Auth.js v5 compatibility |
| `NEXTAUTH_URL` | Local & Prod | Application canonical URL (`http://localhost:3000` or production domain) |
| `APP_ENCRYPTION_KEY` | Local & Prod | 32-byte master key for AES-256-GCM encryption of OpenRouter keys |
| `CRON_SECRET` | Local & Prod | Secret token required to authenticate Vercel Cron background triggers |

---

## Project Architecture

```text
serbaserbi/
├── app/                        # Next.js App Router (RSC & API Routes)
│   ├── (auth)/                 # Authentication routes (login & register)
│   ├── api/                    # Standardized REST API endpoints
│   │   ├── ai/                 # OpenRouter BYOK service & dynamic model discovery
│   │   ├── analytics/          # Executive cash flow reporting & KPI aggregations
│   │   ├── clients/            # Client directory CRUD endpoints
│   │   ├── cron/               # Scheduled overdue invoice audit job
│   │   ├── currency/           # 12-hour in-memory cached exchange rate proxy
│   │   ├── documents/          # Document persistence & installment payment tracking
│   │   └── user/               # User business profiles & encrypted AI settings
│   ├── dashboard/              # Protected workspace layouts (Multi-tenant)
│   └── guest/                  # Client-side generators (Invoice, Quotation, Contract)
├── components/                 # UI design system components (Cloudflare Kumo UI)
│   ├── documents/              # Dynamic PDF generator engines (@react-pdf/renderer)
│   └── forms/                  # Structured forms with crisp contrast & validation
├── db/                         # Drizzle ORM schema & Neon PostgreSQL connection
├── docs/                       # Technical engineering documentation
│   ├── API.md                  # Complete REST API specification
│   ├── Architecture.md         # System architecture & Mermaid data flow diagrams
│   └── Schema.md               # Database schema definitions
├── lib/                        # Core utilities (Auth, AES-256 crypto, Currency cache)
├── scripts/                    # Automated demonstration database seeding script
├── My 10x Solution - ... .md   # Official FlyRank Capstone submission overview document
├── drizzle.config.ts           # Drizzle Kit migration & push configuration
└── vercel.json                 # Vercel Cron daily schedule configuration
```

---

## License

Distributed under the [MIT License](LICENSE).  
Developed by **Farid Eka Aprilian** as a Capstone submission for the **FlyRank Internship Backend Development Track**.
