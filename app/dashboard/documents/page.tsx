'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CreditCard, ClockCountdown, CheckCircle } from '@phosphor-icons/react';
import InvoicePaymentModal from '@/components/InvoicePaymentModal';
import { useTranslation } from '@/lib/i18n';

interface DocItem {
  id: string;
  docType: 'invoice' | 'quotation' | 'contract';
  documentNumber: string;
  status: string;
  issueDate: string;
  dueDate: string | null;
  currency: string;
  value?: string | null;
  clientName: string | null;
  createdAt: string;
}

export default function DocumentHistoryPage() {
  const { t, locale } = useTranslation();
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'invoice' | 'quotation' | 'contract'>('all');
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<{ id: string; invoiceNumber: string; currency: string } | null>(null);
  const [checkingOverdue, setCheckingOverdue] = useState(false);
  const [cronFeedback, setCronFeedback] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadDocuments = async () => {
      try {
        const res = await fetch('/api/documents');
        if (res.ok && isMounted) {
          const data = await res.json();
          setDocuments(data.documents || []);
        }
      } catch (err) {
        console.error('Failed to fetch documents:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    void loadDocuments();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStatusChange = async (docType: string, id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/documents/${encodeURIComponent(docType)}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        void fetchDocuments();
      } else {
        alert(t('common.error'));
      }
    } catch {
      alert(t('common.error'));
    }
  };

  const handleDelete = async (docType: string, id: string, docNum: string) => {
    if (!confirm(`${t('documents.confirmDelete')} (${docNum})`)) return;

    try {
      const res = await fetch(`/api/documents/${encodeURIComponent(docType)}/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        void fetchDocuments();
      } else {
        alert(t('common.error'));
      }
    } catch {
      alert(t('common.error'));
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesTab = activeTab === 'all' || doc.docType === activeTab;
    const matchesSearch =
      doc.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
      (doc.clientName && doc.clientName.toLowerCase().includes(search.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (docType: string, status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      draft: { label: t('documents.statusDraft'), color: 'bg-zinc-100 text-zinc-700 border-zinc-200/80' },
      sent: { label: t('documents.statusSent'), color: 'bg-sky-50 text-sky-800 border-sky-200/80' },
      paid: { label: t('documents.statusPaid'), color: 'bg-emerald-50 text-emerald-800 border-emerald-200/80' },
      partial_paid: { label: t('documents.statusPartial'), color: 'bg-amber-50 text-amber-800 border-amber-200/80' },
      overdue: { label: t('documents.statusOverdue'), color: 'bg-rose-50 text-rose-800 border-rose-200/80' },
      cancelled: { label: t('documents.statusDeclined'), color: 'bg-zinc-100 text-zinc-500 border-zinc-200/80' },
      accepted: { label: t('documents.statusAccepted'), color: 'bg-emerald-50 text-emerald-800 border-emerald-200/80' },
      rejected: { label: t('documents.statusDeclined'), color: 'bg-rose-50 text-rose-800 border-rose-200/80' },
      expired: { label: t('documents.statusOverdue'), color: 'bg-amber-50 text-amber-800 border-amber-200/80' },
      unsigned: { label: locale === 'id' ? 'Belum TTD' : 'Unsigned', color: 'bg-amber-50 text-amber-800 border-amber-200/80' },
      freelancer_signed: { label: locale === 'id' ? 'TTD Freelancer' : 'Freelancer Signed', color: 'bg-sky-50 text-sky-800 border-sky-200/80' },
      both_signed: { label: t('documents.statusSigned'), color: 'bg-emerald-50 text-emerald-800 border-emerald-200/80' },
    };

    const info = Object.prototype.hasOwnProperty.call(statusMap, status)
      ? statusMap[status]
      : { label: status, color: 'bg-zinc-100 text-zinc-600 border-zinc-200/80' };

    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${info.color}`}>
        {info.label}
      </span>
    );
  };

  const getDocTypeBadge = (docType: string) => {
    switch (docType) {
      case 'invoice':
        return <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-cyan-50 text-cyan-800 border border-cyan-200/80">Invoice</span>;
      case 'quotation':
        return <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-purple-50 text-purple-800 border border-purple-200/80">{t('documents.tabQuotations')}</span>;
      case 'contract':
        return <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-emerald-50 text-emerald-800 border border-emerald-200/80">{t('documents.tabContracts')}</span>;
      default:
        return null;
    }
  };

  const handleCheckOverdueNow = async () => {
    setCheckingOverdue(true);
    setCronFeedback(null);
    try {
      const res = await fetch('/api/cron/check-overdue', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        if (data.processedCount > 0) {
          setCronFeedback(t('dashboard.cronSuccess', { count: data.processedCount }));
        } else {
          setCronFeedback(locale === 'id' ? 'Pemeriksaan selesai: Tidak ada invoice yang melewati jatuh tempo.' : 'Audit complete: No invoices currently past due date.');
        }
        void fetchDocuments();
      } else {
        setCronFeedback(data.error || t('dashboard.cronError'));
      }
    } catch {
      setCronFeedback(t('dashboard.cronError'));
    } finally {
      setCheckingOverdue(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{t('documents.title')}</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {t('documents.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => { void handleCheckOverdueNow(); }}
            disabled={checkingOverdue}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200/90 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-2xs active:scale-[0.98]"
            title={t('dashboard.triggerCron')}
          >
            <ClockCountdown size={14} className={checkingOverdue ? 'animate-spin text-zinc-500' : 'text-zinc-600'} />
            <span>{checkingOverdue ? t('dashboard.cronChecking') : t('dashboard.triggerCron')}</span>
          </button>

          <Link
            href="/guest/invoice"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-black text-white shadow-xs transition-all active:scale-[0.98]"
          >
            + {t('common.create')}
          </Link>
        </div>
      </div>

      {/* Cron Feedback Banner */}
      {cronFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs font-medium text-emerald-800 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-600" />
            <span>{cronFeedback}</span>
          </div>
          <button
            onClick={() => { setCronFeedback(null); }}
            className="text-emerald-700 hover:text-emerald-950 text-base leading-none p-1 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-zinc-500 font-medium">{t('dashboard.totalDocuments')}</span>
          <p className="text-2xl font-bold text-zinc-900 mt-1">{documents.length}</p>
        </div>
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-zinc-500 font-medium">{t('documents.tabInvoices')}</span>
          <p className="text-2xl font-bold text-cyan-700 mt-1">
            {documents.filter((d) => d.docType === 'invoice').length}
          </p>
        </div>
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-zinc-500 font-medium">{t('documents.tabQuotations')}</span>
          <p className="text-2xl font-bold text-purple-700 mt-1">
            {documents.filter((d) => d.docType === 'quotation').length}
          </p>
        </div>
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-zinc-500 font-medium">{t('documents.tabContracts')}</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {documents.filter((d) => d.docType === 'contract').length}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(
            [
              { id: 'all', label: t('documents.tabAll') },
              { id: 'invoice', label: t('documents.tabInvoices') },
              { id: 'quotation', label: t('documents.tabQuotations') },
              { id: 'contract', label: t('documents.tabContracts') },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 font-medium'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); }}
          placeholder={t('documents.searchPlaceholder')}
          className="w-full sm:w-72 px-4 py-2 rounded-xl bg-zinc-50/80 border border-zinc-200/90 text-zinc-900 text-xs placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
        />
      </div>

      {/* Documents Table / List */}
      {loading ? (
        <div className="text-center py-16 text-zinc-400 font-medium">{t('common.loading')}</div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-zinc-200/80 rounded-2xl p-8 shadow-xs">
          <p className="text-zinc-500 font-medium">
            {search ? t('documents.emptyDesc') : t('documents.emptyTitle')}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/guest/invoice" className="text-xs font-semibold text-zinc-900 hover:underline">
              + {t('nav.createInvoice')}
            </Link>
            <span className="text-zinc-300">•</span>
            <Link href="/guest/contract" className="text-xs font-semibold text-zinc-900 hover:underline">
              + {t('nav.createContract')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/90 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">{t('documents.colDocNumber')}</th>
                  <th className="px-5 py-3.5">{t('documents.colClient')}</th>
                  <th className="px-5 py-3.5">{t('documents.colStatus')}</th>
                  <th className="px-5 py-3.5">{t('common.currency')}</th>
                  <th className="px-5 py-3.5">{t('documents.colDate')}</th>
                  <th className="px-5 py-3.5 text-right">{t('documents.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-900">
                {filteredDocs.map((doc) => (
                  <tr key={`${doc.docType}-${doc.id}`} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-4 font-semibold text-zinc-900 flex items-center gap-2">
                      {getDocTypeBadge(doc.docType)}
                      <span>{doc.documentNumber}</span>
                    </td>
                    <td className="px-5 py-4 text-zinc-700">{doc.clientName || '—'}</td>
                    <td className="px-5 py-4">{getStatusBadge(doc.docType, doc.status)}</td>
                    <td className="px-5 py-4 font-mono font-medium">{doc.currency}</td>
                    <td className="px-5 py-4 text-zinc-500 font-mono">
                      {doc.issueDate ? new Date(doc.issueDate).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US') : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status Switcher Dropdown */}
                        <select
                          value={doc.status}
                          onChange={(e) => { void handleStatusChange(doc.docType, doc.id, e.target.value); }}
                          className="bg-white border border-zinc-200/90 text-zinc-800 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer shadow-2xs"
                        >
                          {doc.docType === 'invoice' && (
                            <>
                              <option value="draft">{t('documents.statusDraft')}</option>
                              <option value="sent">{t('documents.statusSent')}</option>
                              <option value="paid">{t('documents.statusPaid')}</option>
                              <option value="partial_paid">{t('documents.statusPartial')}</option>
                              <option value="overdue">{t('documents.statusOverdue')}</option>
                              <option value="cancelled">{t('documents.statusDeclined')}</option>
                            </>
                          )}
                          {doc.docType === 'quotation' && (
                            <>
                              <option value="draft">{t('documents.statusDraft')}</option>
                              <option value="sent">{t('documents.statusSent')}</option>
                              <option value="accepted">{t('documents.statusAccepted')}</option>
                              <option value="rejected">{t('documents.statusDeclined')}</option>
                              <option value="expired">{t('documents.statusOverdue')}</option>
                            </>
                          )}
                          {doc.docType === 'contract' && (
                            <>
                              <option value="unsigned">{locale === 'id' ? 'Belum TTD' : 'Unsigned'}</option>
                              <option value="freelancer_signed">{locale === 'id' ? 'TTD Freelancer' : 'Freelancer Signed'}</option>
                              <option value="both_signed">{t('documents.statusSigned')}</option>
                            </>
                          )}
                        </select>

                        {/* Payment & DP Tracking Button */}
                        {doc.docType === 'invoice' && (
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentModalInvoice({
                                id: doc.id,
                                invoiceNumber: doc.documentNumber,
                                currency: doc.currency,
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200/90 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                            title={t('documents.btnPayDp')}
                          >
                            <CreditCard size={13} weight="duotone" />
                            <span>{t('documents.btnPayDp')}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => { void handleDelete(doc.docType, doc.id, doc.documentNumber); }}
                          className="px-2 py-1 rounded-lg text-[11px] font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title={t('common.delete')}
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Payment / DP Tracking Modal */}
      {paymentModalInvoice && (
        <InvoicePaymentModal
          invoiceId={paymentModalInvoice.id}
          invoiceNumber={paymentModalInvoice.invoiceNumber}
          currency={paymentModalInvoice.currency}
          isOpen={Boolean(paymentModalInvoice)}
          onClose={() => { setPaymentModalInvoice(null); }}
          onPaymentUpdated={() => { void fetchDocuments(); }}
        />
      )}
    </div>
  );
}
