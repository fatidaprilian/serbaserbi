import { NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices, invoiceItems, invoicePayments, clients, quotations, contracts } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-utils';

export async function GET() {
  try {
    const { userId, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const userInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        status: invoices.status,
        currency: invoices.currency,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        createdAt: invoices.createdAt,
        clientId: invoices.clientId,
        clientName: clients.name,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt));

    const invoiceIds = userInvoices.map((i) => i.id);

    // Fetch items and payments for these invoices
    const allItems = invoiceIds.length > 0
      ? await db
          .select({
            invoiceId: invoiceItems.invoiceId,
            subtotal: invoiceItems.subtotal,
          })
          .from(invoiceItems)
      : [];

    const allPayments = invoiceIds.length > 0
      ? await db
          .select({
            id: invoicePayments.id,
            invoiceId: invoicePayments.invoiceId,
            amount: invoicePayments.amount,
            paymentDate: invoicePayments.paymentDate,
          })
          .from(invoicePayments)
      : [];

    // Filter to user's invoices
    const userInvoiceSet = new Set(invoiceIds);
    const relevantItems = allItems.filter((it) => userInvoiceSet.has(it.invoiceId));
    const relevantPayments = allPayments.filter((p) => userInvoiceSet.has(p.invoiceId));

    // Map totals per invoice
    const invoiceTotals: Record<string, number> = {};
    for (const item of relevantItems) {
      invoiceTotals[item.invoiceId] = (invoiceTotals[item.invoiceId] || 0) + Number(item.subtotal || 0);
    }

    const invoicePaidTotals: Record<string, number> = {};
    for (const p of relevantPayments) {
      invoicePaidTotals[p.invoiceId] = (invoicePaidTotals[p.invoiceId] || 0) + Number(p.amount || 0);
    }

    // Status counts and financial metrics
    let totalRevenueIDR = 0;
    let totalRevenueUSD = 0;
    let outstandingIDR = 0;
    let outstandingUSD = 0;
    let overdueCount = 0;
    let overdueAmountIDR = 0;
    let overdueAmountUSD = 0;

    const statusCounts = {
      draft: 0,
      sent: 0,
      partial_paid: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0,
    };

    const actionNeededInvoices: Array<{
      id: string;
      invoiceNumber: string;
      clientName: string;
      dueDate: string;
      currency: string;
      status: string;
      remainingBalance: number;
    }> = [];

    for (const inv of userInvoices) {
      const statusKey = inv.status as keyof typeof statusCounts;
      if (statusKey in statusCounts) {
        statusCounts[statusKey]++;
      }

      const total = invoiceTotals[inv.id] || 0;
      const paid = invoicePaidTotals[inv.id] || 0;
      const remaining = Math.max(0, total - paid);

      if (inv.currency === 'IDR') {
        totalRevenueIDR += paid;
        if (inv.status === 'sent' || inv.status === 'partial_paid') {
          outstandingIDR += remaining;
        } else if (inv.status === 'overdue') {
          overdueCount++;
          overdueAmountIDR += remaining;
          actionNeededInvoices.push({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            clientName: inv.clientName || 'Klien Umum',
            dueDate: inv.dueDate,
            currency: inv.currency,
            status: inv.status,
            remainingBalance: remaining,
          });
        }
      } else {
        totalRevenueUSD += paid;
        if (inv.status === 'sent' || inv.status === 'partial_paid') {
          outstandingUSD += remaining;
        } else if (inv.status === 'overdue') {
          overdueCount++;
          overdueAmountUSD += remaining;
          actionNeededInvoices.push({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            clientName: inv.clientName || 'Klien Umum',
            dueDate: inv.dueDate,
            currency: inv.currency,
            status: inv.status,
            remainingBalance: remaining,
          });
        }
      }
    }

    // Monthly revenue trend (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const monthlyData: Array<{ label: string; yearMonth: string; amountIDR: number; amountUSD: number }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyData.push({ label, yearMonth: ym, amountIDR: 0, amountUSD: 0 });
    }

    const invoiceCurrencyMap: Record<string, string> = {};
    for (const inv of userInvoices) {
      invoiceCurrencyMap[inv.id] = inv.currency;
    }

    for (const p of relevantPayments) {
      if (!p.paymentDate) continue;
      const ym = p.paymentDate.slice(0, 7);
      const monthSlot = monthlyData.find((m) => m.yearMonth === ym);
      if (monthSlot) {
        const cur = invoiceCurrencyMap[p.invoiceId] || 'IDR';
        if (cur === 'IDR') {
          monthSlot.amountIDR += Number(p.amount || 0);
        } else {
          monthSlot.amountUSD += Number(p.amount || 0);
        }
      }
    }

    // Additional counts
    const userClients = await db.select({ id: clients.id }).from(clients).where(eq(clients.userId, userId));
    const userQuotations = await db.select({ id: quotations.id, status: quotations.status }).from(quotations).where(eq(quotations.userId, userId));
    const userContracts = await db.select({ id: contracts.id, status: contracts.signatureStatus }).from(contracts).where(eq(contracts.userId, userId));

    return NextResponse.json({
      metrics: {
        totalRevenueIDR,
        totalRevenueUSD,
        outstandingIDR,
        outstandingUSD,
        overdueCount,
        overdueAmountIDR,
        overdueAmountUSD,
        totalInvoices: userInvoices.length,
        totalClients: userClients.length,
        totalQuotations: userQuotations.length,
        totalContracts: userContracts.length,
      },
      statusCounts,
      monthlyRevenue: monthlyData,
      actionNeededInvoices: actionNeededInvoices.slice(0, 5),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Gagal mengambil data analitik.' }, { status: 500 });
  }
}
