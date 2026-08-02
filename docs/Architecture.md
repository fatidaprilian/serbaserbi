# Architecture Specification

## 1. System Overview
Sistem ini menggunakan arsitektur Monolithic Frontend/Backend (Fullstack) via **Next.js (App Router)**, didesain untuk di-*deploy* langsung di Vercel. Mengadopsi arsitektur "Dual Engine" untuk rendering dokumen:
1. **Client-Side Rendering (Guest Mode):** Payload tidak dikirim ke API backend, sepenuhnya dikalkulasi dan di-render via browser (`@react-pdf/renderer`).
2. **Server-Side API & Persistence (Login Mode):** Menggunakan API Route Next.js untuk CRUD, dengan keamanan database berbasis RLS.

## 2. Technology Stack
- **Framework:** Next.js (React 18/19, App Router)
- **Database:** Vercel Postgres (Relasional)
- **ORM:** Drizzle ORM (Dipilih karena cold-start optimal di edge runtime)
- **Auth:** Auth.js (sebelumnya NextAuth.js) dengan kapabilitas Session JWT/Database
- **PDF Engine:** `@react-pdf/renderer` (Kompatibel Next.js, support React node to PDF buffer/blob)
- **Styling:** CSS Modules, dengan abstraksi utility classes minimum (Vanilla CSS tokens) untuk Dark Mode dan animasi.

## 3. Module Boundaries
Proyek akan mengikuti konvensi direktori:

- `/app`
  - `(guest)/`: Rute untuk landing page dan form pembuat invoice tanpa login.
  - `(auth)/`: Rute otentikasi (login, register).
  - `dashboard/`: Rute berpelindung otentikasi (CRUD invoice, profil, clients).
  - `api/`: REST/RPC endpoints.
- `/components`
  - `/ui`: Komponen atomik murni (Button, Input, Card).
  - `/documents`: Komponen perakit PDF (`<InvoiceTemplate />`, `<ContractTemplate />`).
- `/lib`
  - `/utils`: Helper fungsi murni (formatter uang, konversi tanggal, hash).
  - `/pdf`: Konfigurasi font dan helper rendering PDF.
- `/db`
  - `schema.ts`: Definisi Drizzle tabel dan relasi.
  - `index.ts`: Inisialisasi koneksi Postgres.

## 4. Key Design Decisions

### A. RLS (Row-Level Security) vs Application-Level Isolation
Untuk versi awal (MVP) menggunakan Drizzle, isolasi *multi-tenant* akan ditangani lewat kondisi query tingkat aplikasi (selalu `where(eq(table.userId, currentUserId))`). Implementasi Postgres RLS (level database) adalah pengamanan sekunder jika proyek diskalakan ke _Enterprise_, mengingat kompleksitas integrasi Drizzle dengan Vercel Postgres RLS (sering butuh eksekusi manual via `set_config('request.jwt.claim.sub')`). 

### B. Sequential Numbering Strategy
Untuk menjamin tidak ada celah pada urutan nomor invoice pengguna:
- Transaksi pembuatan invoice (Insert) membutuhkan pengecekan `COUNT()` atau tabel sekuens terpisah.
- Diterapkan lewat pola *Optimistic Locking* atau *Serializable Transaction* saat menerbitkan invoice dari `Draft` ke `Sent`.

### C. PDF Rendering
- `@react-pdf/renderer` menjalankan komputasi layout Yoga di *worker*. Harus dikonfigurasi secara teliti agar tidak meng-crash build Next.js (terutama terkait isu integrasi Webpack di mode production).
