import { NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices, invoiceItems, invoicePayments } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const { id } = await params;

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
      .limit(1);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice tidak ditemukan.' }, { status: 404 });
    }

    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    const payments = await db
      .select()
      .from(invoicePayments)
      .where(eq(invoicePayments.invoiceId, id))
      .orderBy(desc(invoicePayments.paymentDate), desc(invoicePayments.createdAt));

    const totalInvoice = items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
    const totalPaid = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const balanceRemaining = Math.max(0, totalInvoice - totalPaid);

    return NextResponse.json({
      invoiceNumber: invoice.invoiceNumber,
      currency: invoice.currency,
      status: invoice.status,
      totalInvoice,
      totalPaid,
      balanceRemaining,
      payments,
    });
  } catch (error) {
    console.error('Error fetching invoice payments:', error);
    return NextResponse.json({ error: 'Gagal mengambil riwayat pembayaran.' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json();
    const { amount, paymentDate, paymentMethod, notes } = body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Nominal pembayaran harus berupa angka lebih besar dari 0.' }, { status: 400 });
    }

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
      .limit(1);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice tidak ditemukan.' }, { status: 404 });
    }

    const dateToUse = paymentDate && typeof paymentDate === 'string'
      ? paymentDate
      : new Date().toISOString().split('T')[0];

    const [newPayment] = await db
      .insert(invoicePayments)
      .values({
        invoiceId: id,
        amount: String(numAmount),
        paymentDate: dateToUse,
        paymentMethod: paymentMethod || 'bank_transfer',
        notes: notes?.trim() || null,
      })
      .returning();

    // Re-evaluate total payments and update invoice status
    const allPayments = await db
      .select()
      .from(invoicePayments)
      .where(eq(invoicePayments.invoiceId, id));

    const allItems = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    const totalInvoice = allItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
    const totalPaid = allPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const balanceRemaining = Math.max(0, totalInvoice - totalPaid);

    let newStatus = invoice.status;
    if (totalInvoice > 0 && totalPaid >= totalInvoice) {
      newStatus = 'paid';
    } else if (totalPaid > 0 && totalPaid < totalInvoice) {
      newStatus = 'partial_paid';
    }

    if (newStatus !== invoice.status) {
      await db
        .update(invoices)
        .set({ status: newStatus })
        .where(eq(invoices.id, id));
    }

    return NextResponse.json(
      {
        success: true,
        payment: newPayment,
        newStatus,
        totalInvoice,
        totalPaid,
        balanceRemaining,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording invoice payment:', error);
    return NextResponse.json({ error: 'Gagal mencatat pembayaran.' }, { status: 500 });
  }
}
