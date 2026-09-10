import { NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices, invoiceItems, invoicePayments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-utils';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const { userId, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const { id, paymentId } = await params;

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
      .limit(1);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice tidak ditemukan.' }, { status: 404 });
    }

    const [deleted] = await db
      .delete(invoicePayments)
      .where(and(eq(invoicePayments.id, paymentId), eq(invoicePayments.invoiceId, id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Catatan pembayaran tidak ditemukan.' }, { status: 404 });
    }

    // Re-evaluate status after payment deletion
    const remainingPayments = await db
      .select()
      .from(invoicePayments)
      .where(eq(invoicePayments.invoiceId, id));

    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    const totalInvoice = items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
    const totalPaid = remainingPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const balanceRemaining = Math.max(0, totalInvoice - totalPaid);

    let newStatus = invoice.status;
    if (totalInvoice > 0 && totalPaid >= totalInvoice) {
      newStatus = 'paid';
    } else if (totalPaid > 0 && totalPaid < totalInvoice) {
      newStatus = 'partial_paid';
    } else if (totalPaid === 0) {
      newStatus = invoice.status === 'paid' || invoice.status === 'partial_paid' ? 'sent' : invoice.status;
    }

    if (newStatus !== invoice.status) {
      await db.update(invoices).set({ status: newStatus }).where(eq(invoices.id, id));
    }

    return NextResponse.json({
      success: true,
      newStatus,
      totalInvoice,
      totalPaid,
      balanceRemaining,
    });
  } catch (error) {
    console.error('Error deleting invoice payment:', error);
    return NextResponse.json({ error: 'Gagal menghapus pembayaran.' }, { status: 500 });
  }
}
