# Product Requirements Document (PRD)

## 1. Product Intent
Membangun platform "Freelance Invoicer & Contract Generator" (sementara disebut *Freelance Invoicer*) yang dirancang khusus untuk memenuhi kebutuhan legal dan finansial pekerja lepas (freelancer) di Indonesia, dengan dukungan penuh untuk transaksi dual currency (IDR dan USD).

## 2. User Problems
- **Risiko Legalitas Transaksi & Kurs:** Kewajiban penggunaan Rupiah di dalam negeri membuat invoice berbasis USD menjadi abu-abu secara hukum jika tidak dikonversi dengan kurs yang jelas.
- **Kesulitan Manajemen Dokumen:** Seringkali freelancer membuat invoice, penawaran, dan kontrak menggunakan Word/Excel yang berujung pada penomoran yang berantakan, typo dalam kalkulasi, dan template yang terlihat kurang profesional.
- **Privasi:** Banyak freelancer enggan datanya disimpan di server pihak ketiga untuk gig sekali pakai.

## 3. Goals
- Menyediakan **Guest Mode** (100% in-browser, no data saved to server) untuk pembuatan dokumen sekali jalan tanpa login.
- Menyediakan **Login Mode (Multi-Tenant)** dengan pelacakan nomor invoice *sequential*, client list, history transaksi, dan dashboard manajemen.
- Menyediakan klausul *Dual Currency* otomatis di dokumen, dengan menyimpan snapshot kurs mata uang saat pembuatan dokumen.
- Memiliki *UI/UX Premium* (glassmorphism, micro-animations, dark mode) yang memberikan kesan mahal dan profesional.
- Notifikasi otomatis (visual di dokumen) jika nilai > Rp5.000.000 untuk pengingat Bea Meterai.

## 4. Non-Goals (Out of Scope untuk MVP)
- Sistem pembayaran terintegrasi (Payment Gateway).
- Integrasi e-Meterai / Digital Signature (PSrE) resmi lewat API (hanya menggunakan standard digital signature / canvas drawing untuk saat ini).
- Fitur akuntansi kompleks & pelaporan pajak SPT (hanya menampilkan estimasi opsional di invoice).

## 5. Core Features & User Flows
### Guest Flow
1. Masuk ke halaman utama, pilih tipe dokumen (Invoice / Quotation / Contract).
2. Isi formulir identitas, line-items, dan catatan di UI yang responsif (preview *live* di samping).
3. Jika mode USD diaktifkan untuk klien lokal, masukkan/fetch kurs referensi.
4. Klik "Download PDF". Semua data di-render langsung di klien dengan `@react-pdf/renderer` tanpa hit server.

### Auth / Multi-Tenant Flow
1. Registrasi / Login via NextAuth.
2. Setup profil default (Nama Bisnis, NPWP opsional, Mata Uang Default).
3. Buat Invoice/Kontrak: Sistem otomatis generate nomor sequential per user. Data disave ke Database (Vercel Postgres).
4. Status pelacakan: Draft, Sent, Paid, Overdue.

## 6. Constraints & Requirements
- **Styling:** Wajib menggunakan CSS Modules / Vanilla CSS (TailwindCSS dihindari kecuali diminta eksplisit).
- **Compliance:** Desain dokumen cetak harus memisahkan nominal USD dengan klausul pembayaran IDR.
