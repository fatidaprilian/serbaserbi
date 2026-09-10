'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button, Badge, LayerCard } from '@cloudflare/kumo';
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
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2">
              <Badge variant="primary" className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {t('dashboard.title')}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              {locale === 'id' ? `Selamat datang kembali, ${userName}` : `Welcome back, ${userName}`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={refreshAnalytics}
              className="text-xs px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowsClockwise size={13} className={loading ? 'animate-spin' : ''} />
              {locale === 'id' ? 'Segarkan' : 'Refresh'}
            </Button>
            <Link href="/guest/invoice">
              <Button
                variant="primary"
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
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
            <LayerCard key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse h-36" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Pendapatan Lunas */}
          <LayerCard className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t('dashboard.totalRevenue')}
                </span>
                <div className="text-xl font-black text-emerald-400">
                  {formatIDR(analytics?.metrics.totalRevenueIDR || 0)}
                </div>
                {(analytics?.metrics.totalRevenueUSD || 0) > 0 && (
                  <div className="text-xs font-semibold text-emerald-300/80">
                    + {formatUSD(analytics?.metrics.totalRevenueUSD || 0)}
                  </div>
                )}
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Wallet size={20} weight="duotone" />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center text-[11px] text-slate-400 gap-1.5">
              <CheckCircle size={14} className="text-emerald-400" />
              <span>{statusCounts.paid} {locale === 'id' ? 'tagihan telah dibayar lunas' : 'invoices settled'}</span>
            </div>
          </LayerCard>

          {/* KPI 2: Piutang Berjalan */}
          <LayerCard className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t('dashboard.outstandingReceivables')}
                </span>
                <div className="text-xl font-black text-amber-400">
                  {formatIDR(analytics?.metrics.outstandingIDR || 0)}
                </div>
                {(analytics?.metrics.outstandingUSD || 0) > 0 && (
                  <div className="text-xs font-semibold text-amber-300/80">
                    + {formatUSD(analytics?.metrics.outstandingUSD || 0)}
                  </div>
                )}
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Clock size={20} weight="duotone" />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center text-[11px] text-slate-400 gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
              <span>{statusCounts.sent + statusCounts.partial_paid} {locale === 'id' ? 'tagihan menunggu pelunasan' : 'invoices awaiting settlement'}</span>
            </div>
          </LayerCard>

          {/* KPI 3: Tagihan Jatuh Tempo */}
          <LayerCard className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t('dashboard.overdueInvoices')}
                </span>
                <div className="text-xl font-black text-rose-400">
                  {analytics?.metrics.overdueCount || 0} {locale === 'id' ? 'Dokumen' : 'Invoices'}
                </div>
                <div className="text-xs font-semibold text-rose-300/80">
                  {formatIDR(analytics?.metrics.overdueAmountIDR || 0)}
                  {(analytics?.metrics.overdueAmountUSD || 0) > 0 && ` + ${formatUSD(analytics?.metrics.overdueAmountUSD || 0)}`}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <WarningCircle size={20} weight="duotone" />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-[11px]">
              <span className="text-rose-400 font-medium">{t('dashboard.requireFollowUp')}</span>
              <Link href="/dashboard/documents" className="text-cyan-400 hover:underline flex items-center gap-0.5">
                {t('common.view')} <ArrowRight size={11} />
              </Link>
            </div>
          </LayerCard>

          {/* KPI 4: Portofolio Legal */}
          <LayerCard className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t('dashboard.totalDocuments')}
                </span>
                <div className="text-xl font-black text-cyan-400">
                  {(analytics?.metrics.totalInvoices || 0) +
                    (analytics?.metrics.totalQuotations || 0) +
                    (analytics?.metrics.totalContracts || 0)}{' '}
                  {locale === 'id' ? 'Dokumen' : 'Documents'}
                </div>
                <div className="text-xs text-slate-400">
                  {analytics?.metrics.totalClients || 0} {locale === 'id' ? 'Klien Terdaftar' : 'Clients Registered'}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <Bank size={20} weight="duotone" />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-[11px] text-slate-400">
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
        <LayerCard className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendUp size={16} className="text-cyan-400" />
                {t('dashboard.revenueTrend')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('dashboard.monthlyCollection')}
              </p>
            </div>
            <Badge variant="primary" className="text-[10px] bg-slate-800 text-slate-300 border-slate-700">
              {locale === 'id' ? 'Realisasi Pembayaran' : 'Cash Realized'}
            </Badge>
          </div>

          {/* Visual Bar Chart */}
          <div className="space-y-4 pt-2">
            {analytics?.monthlyRevenue.map((item) => {
              const percentage = maxMonthlyRevenue > 0 ? Math.max(4, Math.round((item.amountIDR / maxMonthlyRevenue) * 100)) : 0;
              return (
                <div key={item.yearMonth} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 w-16">{item.label}</span>
                    <div className="text-right font-medium">
                      <span className="text-slate-200">{formatIDR(item.amountIDR)}</span>
                      {item.amountUSD > 0 && (
                        <span className="text-emerald-400 text-[11px] ml-2">({formatUSD(item.amountUSD)})</span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 text-right pt-2">
            * {locale === 'id' ? 'Grafik diskalakan berdasarkan penerimaan mata uang Rupiah (IDR).' : 'Chart normalized against Indonesian Rupiah (IDR) collections.'}
          </div>
        </LayerCard>

        {/* Right Column: Status Distribution */}
        <LayerCard className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Receipt size={16} className="text-indigo-400" />
              {locale === 'id' ? 'Distribusi Status Tagihan' : 'Invoice Status Distribution'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('dashboard.storedInAccount')} ({totalInvoices} {t('documents.tabInvoices')})
            </p>

            <div className="space-y-3 pt-5">
              {/* Paid */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {t('documents.statusPaid')}
                  </span>
                  <span className="font-bold text-slate-200">
                    {statusCounts.paid} ({getPercentage(statusCounts.paid)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${getPercentage(statusCounts.paid)}%` }} />
                </div>
              </div>

              {/* Partial Paid */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    {t('documents.statusPartial')}
                  </span>
                  <span className="font-bold text-slate-200">
                    {statusCounts.partial_paid} ({getPercentage(statusCounts.partial_paid)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${getPercentage(statusCounts.partial_paid)}%` }} />
                </div>
              </div>

              {/* Sent */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    {t('documents.statusSent')}
                  </span>
                  <span className="font-bold text-slate-200">
                    {statusCounts.sent} ({getPercentage(statusCounts.sent)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${getPercentage(statusCounts.sent)}%` }} />
                </div>
              </div>

              {/* Overdue */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    {t('documents.statusOverdue')}
                  </span>
                  <span className="font-bold text-rose-300">
                    {statusCounts.overdue} ({getPercentage(statusCounts.overdue)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-rose-400 h-full rounded-full" style={{ width: `${getPercentage(statusCounts.overdue)}%` }} />
                </div>
              </div>

              {/* Draft */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    {t('documents.statusDraft')}
                  </span>
                  <span className="font-bold text-slate-400">
                    {statusCounts.draft} ({getPercentage(statusCounts.draft)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-slate-500 h-full rounded-full" style={{ width: `${getPercentage(statusCounts.draft)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <Link href="/dashboard/documents">
              <Button variant="secondary" className="w-full text-xs py-2 rounded-xl border-slate-700 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer">
                {locale === 'id' ? 'Kelola Semua Tagihan' : 'Manage All Documents'}
                <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </LayerCard>
      </div>

      {/* Urgent Overdue Tracker */}
      {analytics && analytics.actionNeededInvoices.length > 0 && (
        <LayerCard className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <WarningCircle size={18} weight="bold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-200">
                  {locale === 'id' ? 'Tindakan Diperlukan: Tagihan Telah Melewati Jatuh Tempo' : 'Action Required: Invoices Passed Due Date'}
                </h3>
                <p className="text-xs text-rose-300/70">
                  {locale === 'id' ? `Terdapat ${analytics.actionNeededInvoices.length} invoice yang memerlukan tindak lanjut penagihan.` : `${analytics.actionNeededInvoices.length} invoices require payment follow-up.`}
                </p>
              </div>
            </div>
            <Link href="/dashboard/documents">
              <Badge variant="primary" className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs cursor-pointer">
                {t('common.all')} ({analytics.metrics.overdueCount})
              </Badge>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {analytics.actionNeededInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-900/30 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-200">{inv.invoiceNumber}</span>
                    <p className="text-xs text-slate-400 truncate max-w-[160px]">{inv.clientName}</p>
                  </div>
                  <Badge variant="primary" className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px]">
                    {inv.dueDate}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('paymentModal.remainingDue')}</span>
                    <span className="text-xs font-bold text-rose-400">
                      {inv.currency === 'IDR' ? formatIDR(inv.remainingBalance) : formatUSD(inv.remainingBalance)}
                    </span>
                  </div>
                  <Link href="/dashboard/documents">
                    <Button
                      variant="secondary"
                      className="text-[11px] px-2.5 py-1 rounded-lg border-rose-800/40 text-rose-300 hover:bg-rose-950/40 flex items-center gap-1 cursor-pointer"
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
          <LayerCard className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                {t('dashboard.newQuotation')}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">{t('home.cardQuotationDesc')}</p>
            </div>
          </LayerCard>
        </Link>

        <Link href="/guest/contract" className="block group">
          <LayerCard className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <Handshake size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                {t('dashboard.newContract')}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">{t('home.cardContractDesc')}</p>
            </div>
          </LayerCard>
        </Link>

        <Link href="/dashboard/clients" className="block group">
          <LayerCard className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                {t('clients.title')}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">{t('clients.subtitle')}</p>
            </div>
          </LayerCard>
        </Link>
      </div>
    </div>
  );
}
