import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { db } from '../db';
import {
  users,
  clients,
  invoices,
  invoiceItems,
  invoicePayments,
  quotations,
  quotationItems,
  contracts,
} from '../db/schema';
import { hashPassword } from '../lib/auth-utils';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🚀 Memulai proses seeding data demo SerbaSerbi...');

  const demoEmail = 'demo@serbaserbi.id';

  // 1. Cek atau buat user demo
  const existingUser = (
    await db.select().from(users).where(eq(users.email, demoEmail)).limit(1)
  )[0];

  let userId: string;

  if (existingUser) {
    console.log(`ℹ️ User demo sudah ada: ${demoEmail}`);
    userId = existingUser.id;
  } else {
    console.log(`👤 Membuat user demo baru: ${demoEmail}`);
    const [newUser] = await db
      .insert(users)
      .values({
        email: demoEmail,
        passwordHash: hashPassword('demo12345'),
        name: 'Farid Eka Aprilian',
        businessName: 'Studio Serba Kreatif',
        npwp: '09.123.456.7-890.000',
        phone: '+628123456789',
        address: 'Jl. Sudirman No. 45, Jakarta Selatan, DKI Jakarta',
        defaultCurrency: 'IDR',
        defaultNotes:
          'Pembayaran ditransfer ke rekening BCA 1234567890 a/n Farid Eka Aprilian. Konfirmasi via WhatsApp setelah transfer.',
      })
      .returning();
    userId = newUser.id;
    console.log(`✓ User demo dibuat dengan ID: ${userId}`);
  }

  // 2. Buat demo clients jika belum ada
  const existingClients = await db
    .select()
    .from(clients)
    .where(eq(clients.userId, userId));

  let clientA = existingClients.find((c) => c.name === 'PT Teknologi Nusantara');
  let clientB = existingClients.find((c) => c.name === 'Startup Kreatif Mandiri');
  let clientC = existingClients.find((c) => c.name === 'Acme Global Ventures');

  if (!clientA) {
    [clientA] = await db
      .insert(clients)
      .values({
        userId,
        name: 'PT Teknologi Nusantara',
        email: 'finance@teknus.id',
        phone: '+628119876543',
        address: 'Gedung Cyber 2 Lantai 12, Jl. HR Rasuna Said, Jakarta Selatan',
        country: 'Indonesia',
        isForeignHint: false,
      })
      .returning();
    console.log('✓ Klien A dibuat (PT Teknologi Nusantara)');
  }

  if (!clientB) {
    [clientB] = await db
      .insert(clients)
      .values({
        userId,
        name: 'Startup Kreatif Mandiri',
        email: 'halo@kreatifmandiri.co.id',
        phone: '+628135557788',
        address: 'Dago Coworking Space No. 8, Bandung, Jawa Barat',
        country: 'Indonesia',
        isForeignHint: false,
      })
      .returning();
    console.log('✓ Klien B dibuat (Startup Kreatif Mandiri)');
  }

  if (!clientC) {
    [clientC] = await db
      .insert(clients)
      .values({
        userId,
        name: 'Acme Global Ventures',
        email: 'billing@acmeglobal.com',
        phone: '+6591234567',
        address: '10 Collyer Quay, Ocean Financial Centre, Singapore 049315',
        country: 'Singapore',
        isForeignHint: true,
      })
      .returning();
    console.log('✓ Klien C dibuat (Acme Global Ventures)');
  }

  // 3. Buat demo invoices jika belum ada
  const existingInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.userId, userId));

  if (existingInvoices.length === 0 && clientA && clientB && clientC) {
    console.log('📄 Membuat 3 sampel invoice demo dengan variasi status...');

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 14);
    const pastDateStr = pastDate.toISOString().split('T')[0];

    const pastDueDate = new Date();
    pastDueDate.setDate(today.getDate() - 3);
    const pastDueDateStr = pastDueDate.toISOString().split('T')[0];

    const futureDueDate = new Date();
    futureDueDate.setDate(today.getDate() + 14);
    const futureDueDateStr = futureDueDate.toISOString().split('T')[0];

    // Invoice 1: Lunas (Paid) dengan Bea Meterai
    const [inv1] = await db
      .insert(invoices)
      .values({
        userId,
        clientId: clientA.id,
        invoiceNumber: 'INV-2026-001',
        status: 'paid',
        issueDate: pastDateStr,
        dueDate: todayStr,
        currency: 'IDR',
        meteraiRequired: true, // Karena di atas Rp5.000.000
        notes: 'Pekerjaan telah diselesaikan dan diterima dengan baik.',
      })
      .returning();

    await db.insert(invoiceItems).values([
      {
        invoiceId: inv1.id,
        description: 'Pengembangan Fullstack Web Portal & API Backend',
        quantity: '1',
        rate: '12000000',
        subtotal: '12000000',
      },
      {
        invoiceId: inv1.id,
        description: 'Integrasi Payment Gateway & Deployment Cloud',
        quantity: '1',
        rate: '3000000',
        subtotal: '3000000',
      },
    ]);

    await db.insert(invoicePayments).values({
      invoiceId: inv1.id,
      amount: '15000000',
      paymentDate: todayStr,
      paymentMethod: 'bank_transfer',
      notes: 'Pelunasan 100% transfer BCA',
    });

    console.log('✓ Invoice 1 (Lunas - Rp 15.000.000) berhasil dibuat.');

    // Invoice 2: Cicilan / DP (Partial Paid)
    const [inv2] = await db
      .insert(invoices)
      .values({
        userId,
        clientId: clientB.id,
        invoiceNumber: 'INV-2026-002',
        status: 'partial_paid',
        issueDate: todayStr,
        dueDate: futureDueDateStr,
        currency: 'IDR',
        meteraiRequired: true,
        notes: 'Termin 1 (DP 50%) telah diterima. Sisa 50% setelah serah terima desain.',
      })
      .returning();

    await db.insert(invoiceItems).values([
      {
        invoiceId: inv2.id,
        description: 'Redesain Brand Identity & Design System Kumo UI',
        quantity: '1',
        rate: '8000000',
        subtotal: '8000000',
      },
    ]);

    await db.insert(invoicePayments).values({
      invoiceId: inv2.id,
      amount: '4000000',
      paymentDate: todayStr,
      paymentMethod: 'bank_transfer',
      notes: 'Down Payment (DP 50%)',
    });

    console.log('✓ Invoice 2 (Sebagian / DP - Rp 8.000.000, bayar Rp 4.000.000) berhasil dibuat.');

    // Invoice 3: Jatuh Tempo (Overdue) - USD Foreign Client
    const [inv3] = await db
      .insert(invoices)
      .values({
        userId,
        clientId: clientC.id,
        invoiceNumber: 'INV-2026-003',
        status: 'overdue',
        issueDate: pastDateStr,
        dueDate: pastDueDateStr,
        currency: 'USD',
        meteraiRequired: false,
        notes: 'Payment terms: Net 14 days to International Wire Account.',
      })
      .returning();

    await db.insert(invoiceItems).values([
      {
        invoiceId: inv3.id,
        description: 'Cloud Infrastructure Audit & Next.js Performance Optimization',
        quantity: '1',
        rate: '1200',
        subtotal: '1200',
      },
    ]);

    console.log('✓ Invoice 3 (Jatuh Tempo - $1,200) berhasil dibuat.');

    // 4. Buat demo Quotation
    const [quot1] = await db
      .insert(quotations)
      .values({
        userId,
        clientId: clientA.id,
        quotationNumber: 'QT-2026-001',
        status: 'sent',
        issueDate: todayStr,
        validUntil: futureDueDateStr,
        currency: 'IDR',
        notes: 'Harga mencakup 3x revisi minor dan garansi perbaikan bug 30 hari.',
      })
      .returning();

    await db.insert(quotationItems).values([
      {
        quotationId: quot1.id,
        description: 'Pengembangan Modul Mobile App React Native',
        quantity: '1',
        rate: '25000000',
        subtotal: '25000000',
      },
    ]);

    console.log('✓ Penawaran QT-2026-001 berhasil dibuat.');

    // 5. Buat demo Contract SPK
    await db.insert(contracts).values({
      userId,
      clientId: clientA.id,
      contractNumber: 'SPK-2026-001',
      contractType: 'freelance_development',
      currency: 'IDR',
      value: '25000000',
      signatureStatus: 'both_signed',
      signedAt: today,
      documentHash: 'sha256-demo-spk-verification-hash-valid',
    });

    console.log('✓ Kontrak SPK-2026-001 berhasil dibuat.');
  }

  console.log('\n🎉 Seeding selesai! Akun demo siap digunakan:');
  console.log('--------------------------------------------');
  console.log('Email    : demo@serbaserbi.id');
  console.log('Password : demo12345');
  console.log('--------------------------------------------');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Terjadi kesalahan saat seeding:', err);
  process.exit(1);
});
