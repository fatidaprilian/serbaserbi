import { NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices, invoiceItems, quotations, quotationItems, contracts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-utils';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { userId, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const { type, id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status wajib diisi.' }, { status: 400 });
    }

    if (type === 'invoice') {
      const [updated] = await db
        .update(invoices)
        .set({ status })
        .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
        .returning();
      if (!updated) return NextResponse.json({ error: 'Invoice tidak ditemukan.' }, { status: 404 });
      return NextResponse.json({ success: true, document: updated });
    } else if (type === 'quotation') {
      const [updated] = await db
        .update(quotations)
        .set({ status })
        .where(and(eq(quotations.id, id), eq(quotations.userId, userId)))
        .returning();
      if (!updated) return NextResponse.json({ error: 'Quotation tidak ditemukan.' }, { status: 404 });
      return NextResponse.json({ success: true, document: updated });
    } else if (type === 'contract') {
      const [updated] = await db
        .update(contracts)
        .set({ signatureStatus: status })
        .where(and(eq(contracts.id, id), eq(contracts.userId, userId)))
        .returning();
      if (!updated) return NextResponse.json({ error: 'Kontrak tidak ditemukan.' }, { status: 404 });
      return NextResponse.json({ success: true, document: updated });
    }

    return NextResponse.json({ error: 'Tipe dokumen tidak valid.' }, { status: 400 });
  } catch (error) {
    console.error('Error updating document status:', error);
    return NextResponse.json({ error: 'Gagal memperbarui status dokumen.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { userId, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const { type, id } = await params;

    if (type === 'invoice') {
      await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
      const [deleted] = await db
        .delete(invoices)
        .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
        .returning();
      if (!deleted) return NextResponse.json({ error: 'Dokumen tidak ditemukan.' }, { status: 404 });
    } else if (type === 'quotation') {
      await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));
      const [deleted] = await db
        .delete(quotations)
        .where(and(eq(quotations.id, id), eq(quotations.userId, userId)))
        .returning();
      if (!deleted) return NextResponse.json({ error: 'Dokumen tidak ditemukan.' }, { status: 404 });
    } else if (type === 'contract') {
      const [deleted] = await db
        .delete(contracts)
        .where(and(eq(contracts.id, id), eq(contracts.userId, userId)))
        .returning();
      if (!deleted) return NextResponse.json({ error: 'Dokumen tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Gagal menghapus dokumen.' }, { status: 500 });
  }
}
