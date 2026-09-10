import { NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices, invoiceItems, quotations, quotationItems, contracts, clients } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-utils';

interface LineItemInput {
  description: string;
  quantity: number;
  rate: number;
  subtotal: number;
}

const mapLineItems = (items: LineItemInput[]) =>
  items.map((item) => ({
    description: item.description,
    quantity: String(item.quantity),
    rate: String(item.rate),
    subtotal: String(item.subtotal),
  }));

export async function GET() {
  try {
    const { userId, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

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
    const { userId, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { docType, clientId, clientName, clientAddress, clientEmail, documentNumber, issueDate, dueDate, validUntil, currency, notes, items, value, contractType, meteraiRequired } = body;

    let targetClientId = clientId;

    if (!targetClientId) {
      if (!clientName || typeof clientName !== 'string' || clientName.trim() === '') {
        return NextResponse.json({ error: 'Klien wajib dipilih atau diisi namanya.' }, { status: 400 });
      }

      const existingClients = await db
        .select()
        .from(clients)
        .where(and(eq(clients.userId, userId), eq(clients.name, clientName.trim())))
        .limit(1);

      if (existingClients.length > 0) {
        targetClientId = existingClients[0].id;
      } else {
        const [createdClient] = await db
          .insert(clients)
          .values({
            userId,
            name: clientName.trim(),
            address: clientAddress?.trim() || null,
            email: clientEmail?.trim() || null,
            country: 'Indonesia',
          })
          .returning();
        targetClientId = createdClient.id;
      }
    }

    if (!docType || !targetClientId || !documentNumber) {
      return NextResponse.json({ error: 'Data dokumen tidak lengkap.' }, { status: 400 });
    }

    if (docType === 'invoice') {
      const [newInvoice] = await db
        .insert(invoices)
        .values({
          userId,
          clientId: targetClientId,
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
          mapLineItems(items).map((item) => ({ ...item, invoiceId: newInvoice.id }))
        );
      }

      return NextResponse.json({ success: true, document: newInvoice }, { status: 201 });
    } else if (docType === 'quotation') {
      const [newQuotation] = await db
        .insert(quotations)
        .values({
          userId,
          clientId: targetClientId,
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
          mapLineItems(items).map((item) => ({ ...item, quotationId: newQuotation.id }))
        );
      }

      return NextResponse.json({ success: true, document: newQuotation }, { status: 201 });
    } else if (docType === 'contract') {
      const [newContract] = await db
        .insert(contracts)
        .values({
          userId,
          clientId: targetClientId,
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
