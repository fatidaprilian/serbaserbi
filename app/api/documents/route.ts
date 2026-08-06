import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { invoices, invoiceItems, quotations, quotationItems, contracts, clients } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch invoices with client info
    const userInvoices = await db
      .select({
        id: invoices.id,
        documentNumber: invoices.invoiceNumber,
        status: invoices.status,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        currency: invoices.currency,
        createdAt: invoices.createdAt,
        clientName: clients.name,
        clientId: clients.id,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt));

    // Fetch quotations
    const userQuotations = await db
      .select({
        id: quotations.id,
        documentNumber: quotations.quotationNumber,
        status: quotations.status,
        issueDate: quotations.issueDate,
        dueDate: quotations.validUntil,
        currency: quotations.currency,
        createdAt: quotations.createdAt,
        clientName: clients.name,
        clientId: clients.id,
      })
      .from(quotations)
      .leftJoin(clients, eq(quotations.clientId, clients.id))
      .where(eq(quotations.userId, userId))
      .orderBy(desc(quotations.createdAt));

    // Fetch contracts
    const userContracts = await db
      .select({
        id: contracts.id,
        documentNumber: contracts.contractNumber,
        status: contracts.signatureStatus,
        issueDate: contracts.createdAt,
        dueDate: contracts.signedAt,
        currency: contracts.currency,
        value: contracts.value,
        createdAt: contracts.createdAt,
        clientName: clients.name,
        clientId: clients.id,
      })
      .from(contracts)
      .leftJoin(clients, eq(contracts.clientId, clients.id))
      .where(eq(contracts.userId, userId))
      .orderBy(desc(contracts.createdAt));

    const formattedInvoices = userInvoices.map((i) => ({ ...i, docType: 'invoice' as const }));
    const formattedQuotations = userQuotations.map((q) => ({ ...q, docType: 'quotation' as const, value: null }));
    const formattedContracts = userContracts.map((c) => ({
      ...c,
      issueDate: c.issueDate.toISOString().split('T')[0],
      dueDate: c.dueDate ? c.dueDate.toISOString().split('T')[0] : null,
      docType: 'contract' as const,
    }));

    const allDocuments = [...formattedInvoices, ...formattedQuotations, ...formattedContracts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ documents: allDocuments });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Gagal mengambil riwayat dokumen.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { docType, clientId, documentNumber, issueDate, dueDate, validUntil, currency, notes, items, value, contractType, meteraiRequired } = body;

    if (!docType || !clientId || !documentNumber) {
      return NextResponse.json({ error: 'Data dokumen tidak lengkap.' }, { status: 400 });
    }

    if (docType === 'invoice') {
      const [newInvoice] = await db
        .insert(invoices)
        .values({
          userId,
          clientId,
          invoiceNumber: documentNumber,
          status: 'draft',
          issueDate: issueDate || new Date().toISOString().split('T')[0],
          dueDate: dueDate || new Date().toISOString().split('T')[0],
          currency: currency || 'IDR',
          notes: notes || null,
          meteraiRequired: Boolean(meteraiRequired),
        })
        .returning();

      if (items && Array.isArray(items) && items.length > 0) {
        await db.insert(invoiceItems).values(
          items.map((item: { description: string; quantity: number; rate: number; subtotal: number }) => ({
            invoiceId: newInvoice.id,
            description: item.description,
            quantity: String(item.quantity),
            rate: String(item.rate),
            subtotal: String(item.subtotal),
          }))
        );
      }

      return NextResponse.json({ success: true, document: newInvoice }, { status: 201 });
    } else if (docType === 'quotation') {
      const [newQuotation] = await db
        .insert(quotations)
        .values({
          userId,
          clientId,
          quotationNumber: documentNumber,
          status: 'draft',
          issueDate: issueDate || new Date().toISOString().split('T')[0],
          validUntil: validUntil || dueDate || new Date().toISOString().split('T')[0],
          currency: currency || 'IDR',
          notes: notes || null,
        })
        .returning();

      if (items && Array.isArray(items) && items.length > 0) {
        await db.insert(quotationItems).values(
          items.map((item: { description: string; quantity: number; rate: number; subtotal: number }) => ({
            quotationId: newQuotation.id,
            description: item.description,
            quantity: String(item.quantity),
            rate: String(item.rate),
            subtotal: String(item.subtotal),
          }))
        );
      }

      return NextResponse.json({ success: true, document: newQuotation }, { status: 201 });
    } else if (docType === 'contract') {
      const [newContract] = await db
        .insert(contracts)
        .values({
          userId,
          clientId,
          contractNumber: documentNumber,
          contractType: contractType || 'freelance',
          currency: currency || 'IDR',
          value: String(value || 0),
          signatureStatus: 'unsigned',
        })
        .returning();

      return NextResponse.json({ success: true, document: newContract }, { status: 201 });
    }

    return NextResponse.json({ error: 'Tipe dokumen tidak didukung.' }, { status: 400 });
  } catch (error) {
    console.error('Error saving document:', error);
    return NextResponse.json({ error: 'Gagal menyimpan dokumen.' }, { status: 500 });
  }
}
