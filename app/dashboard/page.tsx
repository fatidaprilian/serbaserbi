'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button, LayerCard } from '@cloudflare/kumo';
import {
  Receipt,
  FileText,
  Handshake,
  Users,
  ArrowRight,
  Plus,
  Wallet,
  Clock,
  WarningCircle,
  TrendUp,
  CheckCircle,
  ArrowsClockwise,
  Bank,
} from '@phosphor-icons/react';
import { useTranslation } from '@/lib/i18n';

interface AnalyticsData {
  metrics: {
    totalRevenueIDR: number;
    totalRevenueUSD: number;
    outstandingIDR: number;
    outstandingUSD: number;
    overdueCount: number;
    overdueAmountIDR: number;
    overdueAmountUSD: number;
    totalInvoices: number;
    totalClients: number;
    totalQuotations: number;
    totalContracts: number;
  };
  statusCounts: {
    draft: number;
    sent: number;
    partial_paid: number;
    paid: number;
    overdue: number;
    cancelled: number;
  };
  monthlyRevenue: Array<{
    label: string;
    yearMonth: string;
    amountIDR: number;
    amountUSD: number;
  }>;
  actionNeededInvoices: Array<{
    id: string;
    invoiceNumber: string;
    clientName: string;
    dueDate: string;
    currency: string;
    status: string;
    remainingBalance: number;
  }>;
}

export default function DashboardOverviewPage() {
  const { data: session } = useSession();
  const { t, locale } = useTranslation();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadInitialData() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setAnalytics(data);
          }
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      ignore = true;
    };
  }, []);

  const userName = session?.user?.name || 'Freelancer';

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const totalInvoices = analytics?.metrics.totalInvoices || 0;
  const statusCounts = analytics?.statusCounts || {
    draft: 0,
    sent: 0,
    partial_paid: 0,
    paid: 0,
    overdue: 0,
    cancelled: 0,
  };

  const getPercentage = (count: number) => {
    if (totalInvoices === 0) return 0;
    return Math.round((count / totalInvoices) * 100);
  };

  const maxMonthlyRevenue = analytics?.monthlyRevenue.reduce((max, m) => {
    return Math.max(max, m.amountIDR);
  }, 0) || 1;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 text-zinc-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t('dashboard.title')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              {locale === 'id' ? `Selamat datang kembali, ${userName}` : `Welcome back, ${userName}`}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={refreshAnalytics}
              className="text-xs px-3.5 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-[0.98]"
            >
              <ArrowsClockwise size={13} className={loading ? 'animate-spin' : ''} />
              {locale === 'id' ? 'Segarkan' : 'Refresh'}
            </Button>
            <Link href="/guest/invoice">
              <Button
                variant="primary"
                className="bg-zinc-900 hover:bg-black text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
              >
                <Plus size={14} weight="bold" />
                {t('nav.createInvoice')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Loading Skeleton or Metrics Grid */}
      {loading && !analytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <LayerCard key={i} className="p-6 rounded-2xl bg-white border border-zinc-200/80 animate-pulse h-36" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Pendapatan Lunas */}
          <LayerCard className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  {t('dashboard.totalRevenue')}
                </span>
                <div className="text-xl font-bold text-zinc-900">
                  {formatIDR(analytics?.metrics.totalRevenueIDR || 0)}
                </div>
                {(analytics?.metrics.totalRevenueUSD || 0) > 0 && (
                  <div className="text-xs font-semibold text-emerald-600">
                    + {formatUSD(analytics?.metrics.totalRevenueUSD || 0)}
                  </div>
                )}
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
                <Wallet size={20} weight="duotone" />
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-100 mt-3 flex items-center text-[11px] text-zinc-500 gap-1.5">
              <CheckCircle size={14} className="text-emerald-600" />
              <span>{statusCounts.paid} {locale === 'id' ? 'tagihan telah dibayar lunas' : 'invoices settled'}</span>
            </div>
          </LayerCard>

          {/* KPI 2: Piutang Berjalan */}
          <LayerCard className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  {t('dashboard.outstandingReceivables')}
                </span>
                <div className="text-xl font-bold text-zinc-900">
                  {formatIDR(analytics?.metrics.outstandingIDR || 0)}
                </div>
                {(analytics?.metrics.outstandingUSD || 0) > 0 && (
                  <div className="text-xs font-semibold text-amber-600">
                    + {formatUSD(analytics?.metrics.outstandingUSD || 0)}
                  </div>
                )}
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shrink-0">
                <Clock size={20} weight="duotone" />
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-100 mt-3 flex items-center text-[11px] text-zinc-500 gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
              <span>{statusCounts.sent + statusCounts.partial_paid} {locale === 'id' ? 'tagihan menunggu pelunasan' : 'invoices awaiting settlement'}</span>
            </div>
          </LayerCard>

          {/* KPI 3: Tagihan Jatuh Tempo */}
          <LayerCard className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  {t('dashboard.overdueInvoices')}
                </span>
                <div className="text-xl font-bold text-rose-600">
                  {analytics?.metrics.overdueCount || 0} {locale === 'id' ? 'Dokumen' : 'Invoices'}
                </div>
                <div className="text-xs font-semibold text-rose-600">
                  {formatIDR(analytics?.metrics.overdueAmountIDR || 0)}
                  {(analytics?.metrics.overdueAmountUSD || 0) > 0 && ` + ${formatUSD(analytics?.metrics.overdueAmountUSD || 0)}`}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-700 shrink-0">
                <WarningCircle size={20} weight="duotone" />
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-100 mt-3 flex items-center justify-between text-[11px]">
              <span className="text-rose-700 font-medium">{t('dashboard.requireFollowUp')}</span>
              <Link href="/dashboard/documents" className="text-zinc-900 font-semibold hover:underline flex items-center gap-0.5">
                {t('common.view')} <ArrowRight size={11} />
              </Link>
            </div>
          </LayerCard>

          {/* KPI 4: Portofolio Legal */}
          <LayerCard className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  {t('dashboard.totalDocuments')}
                </span>
                <div className="text-xl font-bold text-zinc-900">
                  {(analytics?.metrics.totalInvoices || 0) +
                    (analytics?.metrics.totalQuotations || 0) +
                    (analytics?.metrics.totalContracts || 0)}{' '}
                  {locale === 'id' ? 'Dokumen' : 'Documents'}
                </div>
                <div className="text-xs text-zinc-500">
                  {analytics?.metrics.totalClients || 0} {locale === 'id' ? 'Klien Terdaftar' : 'Clients Registered'}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-800 shrink-0">
                <Bank size={20} weight="duotone" />
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-100 mt-3 flex items-center justify-between text-[11px] text-zinc-500">
              <span>{analytics?.metrics.totalQuotations || 0} {t('documents.tabQuotations')}</span>
              <span>•</span>
              <span>{analytics?.metrics.totalContracts || 0} {t('documents.tabContracts')}</span>
            </div>
          </LayerCard>
        </div>
      )}

      {/* Main Content Grid: Trends & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 6-Month Revenue Trend */}
        <LayerCard className="lg:col-span-2 p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <TrendUp size={16} className="text-zinc-800" />
                {t('dashboard.revenueTrend')}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {t('dashboard.monthlyCollection')}
              </p>
            </div>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200/80">
              {locale === 'id' ? 'Realisasi Pembayaran' : 'Cash Realized'}
            </span>
          </div>

          {/* Visual Bar Chart */}
          <div className="space-y-4 pt-2">
            {analytics?.monthlyRevenue.map((item) => {
              const percentage = maxMonthlyRevenue > 0 ? Math.max(4, Math.round((item.amountIDR / maxMonthlyRevenue) * 100)) : 0;
              return (
                <div key={item.yearMonth} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-700 w-16">{item.label}</span>
                    <div className="text-right font-medium">
                      <span className="text-zinc-900 font-semibold">{formatIDR(item.amountIDR)}</span>
                      {item.amountUSD > 0 && (
                        <span className="text-emerald-700 text-[11px] ml-2">({formatUSD(item.amountUSD)})</span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden flex">
                    <div
                      className="bg-zinc-900 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-zinc-400 text-right pt-2">
            * {locale === 'id' ? 'Grafik diskalakan berdasarkan penerimaan mata uang Rupiah (IDR).' : 'Chart normalized against Indonesian Rupiah (IDR) collections.'}
          </div>
        </LayerCard>

        {/* Right Column: Status Distribution */}
        <LayerCard className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Receipt size={16} className="text-zinc-800" />
              {locale === 'id' ? 'Distribusi Status Tagihan' : 'Invoice Status Distribution'}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {t('dashboard.storedInAccount')} ({totalInvoices} {t('documents.tabInvoices')})
            </p>

            <div className="space-y-3 pt-5">
              {/* Paid */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {t('documents.statusPaid')}
                  </span>
                  <span className="font-bold text-zinc-900">
                    {statusCounts.paid} ({getPercentage(statusCounts.paid)}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${getPercentage(statusCounts.paid)}%` }} />
                </div>
              </div>

              {/* Partial Paid */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    {t('documents.statusPartial')}
                  </span>
                  <span className="font-bold text-zinc-900">
                    {statusCounts.partial_paid} ({getPercentage(statusCounts.partial_paid)}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${getPercentage(statusCounts.partial_paid)}%` }} />
                </div>
              </div>

              {/* Sent */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-zinc-800" />
                    {t('documents.statusSent')}
                  </span>
                  <span className="font-bold text-zinc-900">
                    {statusCounts.sent} ({getPercentage(statusCounts.sent)}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-zinc-800 h-full rounded-full" style={{ width: `${getPercentage(statusCounts.sent)}%` }} />
                </div>
              </div>

              {/* Overdue */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    {t('documents.statusOverdue')}
                  </span>
                  <span className="font-bold text-rose-600">
                    {statusCounts.overdue} ({getPercentage(statusCounts.overdue)}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${getPercentage(statusCounts.overdue)}%` }} />
                </div>
              </div>

              {/* Draft */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-zinc-400" />
                    {t('documents.statusDraft')}
                  </span>
                  <span className="font-bold text-zinc-600">
                    {statusCounts.draft} ({getPercentage(statusCounts.draft)}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-zinc-400 h-full rounded-full" style={{ width: `${getPercentage(statusCounts.draft)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100">
            <Link href="/dashboard/documents">
              <Button variant="secondary" className="w-full text-xs py-2 rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs font-semibold">
                {locale === 'id' ? 'Kelola Semua Tagihan' : 'Manage All Documents'}
                <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </LayerCard>
      </div>

      {/* Urgent Overdue Tracker */}
      {analytics && analytics.actionNeededInvoices.length > 0 && (
        <LayerCard className="p-6 rounded-2xl bg-rose-50/50 border border-rose-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <WarningCircle size={18} weight="bold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-950">
                  {locale === 'id' ? 'Tindakan Diperlukan: Tagihan Telah Melewati Jatuh Tempo' : 'Action Required: Invoices Passed Due Date'}
                </h3>
                <p className="text-xs text-rose-700/80">
                  {locale === 'id' ? `Terdapat ${analytics.actionNeededInvoices.length} invoice yang memerlukan tindak lanjut penagihan.` : `${analytics.actionNeededInvoices.length} invoices require payment follow-up.`}
                </p>
              </div>
            </div>
            <Link href="/dashboard/documents">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold cursor-pointer hover:bg-rose-200/70 transition-colors">
                {t('common.all')} ({analytics.metrics.overdueCount})
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {analytics.actionNeededInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl bg-white border border-rose-200/70 shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-zinc-900">{inv.invoiceNumber}</span>
                    <p className="text-xs text-zinc-500 truncate max-w-[160px]">{inv.clientName}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
                    {inv.dueDate}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">{t('paymentModal.remainingDue')}</span>
                    <span className="text-xs font-bold text-rose-600">
                      {inv.currency === 'IDR' ? formatIDR(inv.remainingBalance) : formatUSD(inv.remainingBalance)}
                    </span>
                  </div>
                  <Link href="/dashboard/documents">
                    <Button
                      variant="secondary"
                      className="text-[11px] px-2.5 py-1 rounded-lg border-zinc-200 text-zinc-700 hover:bg-zinc-50 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      {t('documents.btnPayDp')}
                      <ArrowRight size={11} />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </LayerCard>
      )}

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/guest/quotation" className="block group">
          <LayerCard className="p-5 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText size={22} weight="duotone" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-zinc-900 group-hover:text-indigo-700 transition-colors">
                {t('dashboard.newQuotation')}
              </h4>
              <p className="text-[11px] text-zinc-500 truncate">{t('home.cardQuotationDesc')}</p>
            </div>
          </LayerCard>
        </Link>

        <Link href="/guest/contract" className="block group">
          <LayerCard className="p-5 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Handshake size={22} weight="duotone" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-zinc-900 group-hover:text-purple-700 transition-colors">
                {t('dashboard.newContract')}
              </h4>
              <p className="text-[11px] text-zinc-500 truncate">{t('home.cardContractDesc')}</p>
            </div>
          </LayerCard>
        </Link>

        <Link href="/dashboard/clients" className="block group">
          <LayerCard className="p-5 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users size={22} weight="duotone" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-zinc-900 group-hover:text-cyan-700 transition-colors">
                {t('clients.title')}
              </h4>
              <p className="text-[11px] text-zinc-500 truncate">{t('clients.subtitle')}</p>
            </div>
          </LayerCard>
        </Link>
      </div>
    </div>
  );
}
