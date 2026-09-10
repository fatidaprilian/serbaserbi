# My 10x Solution - Farid Eka Aprilian

**Program:** FlyRank Internship · Backend Development Track · Capstone Project  
**Author:** Farid Eka Aprilian  
**Project Name:** SerbaSerbi — Freelance Invoicer, Contract Generator & Cash Flow Tracking System  
**Repository:** Public GitHub Repository  
**Live Production URL:** [https://serbaserbi.faridekaaprilian.dev/](https://serbaserbi.faridekaaprilian.dev/)  

---

## 1. What is the Problem You Are Solving?

### The Problem (in 3 Sentences)
Independent freelancers and solo consultants in Indonesia manage legal contracts (SPK), price quotes, and invoices in a messy, fragmented manner across Microsoft Word, manual spreadsheets, and WhatsApp chats. The resulting documents frequently fail to comply with Indonesian commercial and tax regulations—such as the mandatory Rp10,000 Stamp Duty (*Bea Meterai*) on transactions exceeding Rp5,000,000 and protective intellectual property transfer clauses. Furthermore, tracking partial payments, down payments (DP), and overdue receivables is regularly neglected because freelancers lack a lightweight, dedicated financial tracking tool tailored to their workflow.

### Who Has This Problem?
* **Indonesian Freelancers & Creative Professionals:** Software engineers, UI/UX designers, content writers, photographers, videographers, and independent contractors billing local clients.
* **International Clients & Offshore Projects:** Foreign businesses collaborating with Indonesian talent who require bilingual contracts and invoices (Indonesian & English) with clear foreign exchange rate snapshots (USD to IDR).

### The 10x Claim
> **"SerbaSerbi cuts the time required to draft bilingual legal contracts, issue compliant Indonesian invoices, and audit outstanding receivables from 45 minutes down to under 2 minutes (over 20x faster), with a $0 operating cost on free-tier infrastructure."**

### Explicit Non-Goals (What We Will NOT Build)
* **Not an Automated Payment Gateway or Escrow:** The platform does not process direct credit card transactions or hold third-party escrow funds. SerbaSerbi is focused on creating legally sound, audit-ready documents and providing accurate manual payment recording (bank transfers, down payments, and verified reconciliations).
* **Not a Native Mobile App:** We deliberately avoid building native iOS/Android applications; a responsive, fast, PWA-ready web application accessible directly from any browser is the right footprint for this workflow.

---

## 2. How Did You Implement Your Solution?

SerbaSerbi was architected as a modern, full-stack modular monolith built on Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, and Cloudflare Kumo UI. The application supports both **Guest Mode** (zero signup, client-side PDF generation where sensitive client data never leaves the user's browser) and an **Authenticated Multi-Tenant Mode** to store client directories, payment installments, and financial reporting.

### 7 Out of 7 Program Concepts Implemented
The project implements **all 7 core concepts** from Section 2 of the FlyRank brief without requiring any swaps:

| # | Concept (FlyRank Brief) | Concrete Implementation & Architecture | Primary File Location |
| :-: | :--- | :--- | :--- |
| **1** | **API Endpoints** | Standardized RESTful HTTP endpoints with strict payload validation, consistent error responses (RFC 9457), and honest HTTP status codes (200, 201, 400, 401, 404, 500). Covers document persistence, down payment histories, client address books, and aggregated dashboard analytics. | [`app/api/documents/route.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/app/api/documents/route.ts)<br>[`app/api/documents/invoice/[id]/payments/route.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/app/api/documents/invoice/%5Bid%5D/payments/route.ts)<br>[`app/api/analytics/route.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/app/api/analytics/route.ts) |
| **2** | **Database** | Persistent relational database powered by PostgreSQL (Neon Serverless) managed via Drizzle ORM across 9 interrelated tables: `users`, `clients`, `invoices`, `invoice_items`, `invoice_payments`, `quotations`, `quotation_items`, `contracts`, and `invoice_reminders`. | [`db/schema.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/db/schema.ts)<br>[`db/index.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/db/index.ts)<br>[`drizzle.config.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/drizzle.config.ts) |
| **3** | **Authentication** | Secure JWT-based session management using Auth.js (NextAuth v5). Features standard-library password hashing via `scrypt`, middleware and layout boundary guards for protected dashboard routes, and tenant-level data isolation strictly scoped by `userId`. | [`auth.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/auth.ts)<br>[`lib/auth-utils.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/lib/auth-utils.ts)<br>[`app/dashboard/layout.tsx`](https://github.com/fatidaprilian/serbaserbi/blob/main/app/dashboard/layout.tsx) |
| **4** | **Background / Cron Jobs** | Daily automated background task orchestrated via Vercel Cron (`0 1 * * *`). Scans for invoices that have crossed their `dueDate`, automatically transitions their state to `overdue`, and records persistent audit logs in `invoice_reminders`. | [`app/api/cron/check-overdue/route.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/app/api/cron/check-overdue/route.ts)<br>[`lib/reminder-service.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/lib/reminder-service.ts)<br>[`vercel.json`](https://github.com/fatidaprilian/serbaserbi/blob/main/vercel.json) |
| **5** | **Reporting — PDF** | Dynamic client-side vector PDF generation engine utilizing `@react-pdf/renderer`. Produces pixel-perfect, print-ready A4 documents for Invoices, Quotations, and Contracts with on-the-fly language switching (ID/EN), tax calculations, and automatic Stamp Duty notices for sums > Rp5,000,000. | [`components/documents/InvoicePDFWrapper.tsx`](https://github.com/fatidaprilian/serbaserbi/blob/main/components/documents/InvoicePDFWrapper.tsx)<br>[`components/documents/QuotationPDFWrapper.tsx`](https://github.com/fatidaprilian/serbaserbi/blob/main/components/documents/QuotationPDFWrapper.tsx)<br>[`components/documents/ContractPDFWrapper.tsx`](https://github.com/fatidaprilian/serbaserbi/blob/main/components/documents/ContractPDFWrapper.tsx) |
| **6** | **Caching Logic** | Resilient in-memory cache layer with a 12-hour Time-To-Live (43,200 seconds) for foreign exchange conversions (USD/IDR). Conserves third-party API rate limits and accelerates form responses, supported by edge headers `Cache-Control: s-maxage=43200, stale-while-revalidate=3600` and graceful fallbacks. | [`lib/currency-cache.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/lib/currency-cache.ts)<br>[`app/api/currency/rate/route.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/app/api/currency/rate/route.ts) |
| **7** | **LLM Integration** | Bring-Your-Own-Key (BYOK) OpenRouter AI integration. User API keys are encrypted at rest with military-grade `AES-256-GCM`. Provides live model discovery (dynamically tagging `:free` tier models), automated line-item description polishing, and protective legal clause suggestions. | [`app/api/ai/expand-description/route.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/app/api/ai/expand-description/route.ts)<br>[`app/api/ai/suggest-clauses/route.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/app/api/ai/suggest-clauses/route.ts)<br>[`lib/crypto-utils.ts`](https://github.com/fatidaprilian/serbaserbi/blob/main/lib/crypto-utils.ts) |

---

## 3. How to Run the Project (On a Clean Machine)

### Prerequisites
* Node.js v18.18+ or v20+
* NPM or PNPM

### Installation & Execution (3 Commands)
```bash
# 1. Clone the repository & navigate inside
git clone https://github.com/fatidaprilian/serbaserbi.git
cd serbaserbi

# 2. Copy the environment configuration template & install packages
cp .env.example .env.local
npm install

# 3. Synchronize database schema & populate demo seed data
npm run db:push
npm run db:seed

# 4. Launch the local development server
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 4. 5-Minute Demo Path (Evaluator Walkthrough)

Follow this path to verify all 7 concepts in under 5 minutes:

1. **Test Guest Mode (Zero Login Required):**
   * Navigate to `http://localhost:3000` and click the **"Buat Invoice"** card.
   * Switch the currency dropdown to **USD** ➔ observe the **"Kurs Ter-cache (12 Jam)"** badge appear (*Caching Logic*).
   * Enter a total value above Rp5,000,000 (or $350) ➔ observe the official Indonesian Stamp Duty (*Bea Meterai*) warning banner activate (*Reporting*).
   * Click the **"Cetak / Unduh PDF"** button ➔ the bilingual PDF document is rendered immediately in your browser.
2. **Sign In with the Pre-Seeded Demo Account:**
   * Click **"Masuk"** in the top navigation bar.
   * Enter the seeded credentials generated by `npm run db:seed`:
     * **Email:** `demo@serbaserbi.id`
     * **Password:** `demo12345`
   * You will be authenticated and redirected to the **Dashboard Workspace** (*Authentication*).
3. **Audit Cash Flow & Record Installment / Down Payment:**
   * On the Dashboard overview, review the 4 KPI cards (*Total Revenue Collected, Outstanding Receivables, Overdue Invoices, Document Portfolio*) and the 6-month monthly revenue trend chart (*Reporting & Analytics*).
   * Navigate to the **"Dokumen"** page via the sidebar.
   * Locate invoice `INV-2026-002` (Status: *Cicilan / DP*).
   * Click **"Bayar / DP"** ➔ record a final settlement of Rp4,000,000 ➔ observe the invoice status automatically transition to **Lunas (Paid)** in real time (*Database & API Endpoints*).
4. **Trigger Background Job & Overdue Reminders:**
   * On the Documents page, click the **"Cek Jatuh Tempo"** button in the top toolbar.
   * The background service will run, detect invoice `INV-2026-003` which has passed its due date, transition its status to `overdue`, and log a reminder entry (*Background / Cron Jobs*).
5. **Inspect the BYOK AI Assistant:**
   * Navigate to **"Pengaturan"** (Settings) in the sidebar.
   * View the **"AI Assistant (BYOK - OpenRouter)"** card. The system connects live to OpenRouter, dynamically populating available free and premium AI models (*LLM Integration with AES-256-GCM encryption*).

---

## 5. Compliance Checklist Against the Brief

* [x] **Problem clearly articulated** (resolves chaotic Indonesian freelance paperwork and receivables tracking).
* [x] **7 out of 7 program concepts implemented** without swaps (exceeding the 5-concept minimum).
* [x] **Measurable 10x claim** (drafting and payment tracking accelerated by 20x).
* [x] **5-minute demo path & deterministic seed script** (`npm run db:seed`) ready for evaluation.
* [x] **$0 Stack, No Credit Card, No Secrets in Git** (`.env*` excluded via `.gitignore`).
* [x] **Public Live URL:** [https://serbaserbi.faridekaaprilian.dev/](https://serbaserbi.faridekaaprilian.dev/)
