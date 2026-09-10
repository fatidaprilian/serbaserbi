import { db } from '@/db';
import { invoices, invoiceReminders, clients, users } from '@/db/schema';
import { eq, and, lte, inArray } from 'drizzle-orm';

export interface OverdueProcessResult {
  processedCount: number;
  updatedInvoices: Array<{
    id: string;
    invoiceNumber: string;
    clientName: string | null;
    dueDate: string;
    recipientEmail: string | null;
  }>;
}

/**
 * Service to identify overdue unpaid invoices, update status to 'overdue',
 * and dispatch/record notification reminders.
 */
export async function checkAndProcessOverdueInvoices(
  filterUserId?: string
): Promise<OverdueProcessResult> {
  const todayStr = new Date().toISOString().split('T')[0];

  // Invoices eligible for overdue: status is 'sent' or 'partial_paid' and dueDate < today
  const conditions = [
    inArray(invoices.status, ['sent', 'partial_paid']),
    lte(invoices.dueDate, todayStr),
  ];

  if (filterUserId) {
    conditions.push(eq(invoices.userId, filterUserId));
  }

  const overdueList = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      dueDate: invoices.dueDate,
      status: invoices.status,
      currency: invoices.currency,
      userId: invoices.userId,
      clientId: invoices.clientId,
      clientName: clients.name,
      clientEmail: clients.email,
      freelancerName: users.name,
      freelancerEmail: users.email,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .leftJoin(users, eq(invoices.userId, users.id))
    .where(and(...conditions));

  const updatedInvoices: OverdueProcessResult['updatedInvoices'] = [];

  for (const inv of overdueList) {
    // 1. Update invoice status to overdue
    await db
      .update(invoices)
      .set({ status: 'overdue' })
      .where(eq(invoices.id, inv.id));

    // 2. Determine reminder recipient (client email or fallback to freelancer)
    const targetEmail = inv.clientEmail || inv.freelancerEmail || null;

    // 3. Record reminder dispatch audit log
    await db.insert(invoiceReminders).values({
      invoiceId: inv.id,
      recipientEmail: targetEmail,
      reminderType: 'overdue_notice',
      status: 'sent',
    });

    // 4. Log structured notification dispatch
    console.log('[OVERDUE-REMINDER-DISPATCH]', {
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      dueDate: inv.dueDate,
      clientName: inv.clientName,
      recipientEmail: targetEmail,
      freelancer: inv.freelancerName,
      timestamp: new Date().toISOString(),
    });

    updatedInvoices.push({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientName,
      dueDate: inv.dueDate,
      recipientEmail: targetEmail,
    });
  }

  return {
    processedCount: updatedInvoices.length,
    updatedInvoices,
  };
}
