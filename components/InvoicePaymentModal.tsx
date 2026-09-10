'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { CreditCard, Trash, X, CheckCircle, WarningCircle, Plus } from '@phosphor-icons/react';
import { useTranslation } from '@/lib/i18n';

interface PaymentItem {
  id: string;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  notes: string | null;
  createdAt: string;
}

interface PaymentData {
  invoiceNumber: string;
  currency: string;
  status: string;
  totalInvoice: number;
  totalPaid: number;
  balanceRemaining: number;
  payments: PaymentItem[];
}

interface InvoicePaymentModalProps {
  invoiceId: string;
  invoiceNumber: string;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
  onPaymentUpdated: () => void;
}

export default function InvoicePaymentModal({
  invoiceId,
  invoiceNumber,
  currency,
  isOpen,
  onClose,
  onPaymentUpdated,
}: InvoicePaymentModalProps) {
  const { t, locale } = useTranslation();
  const [data, setData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    notes: '',
  });

  const activeCurrency = data?.currency || currency || 'IDR';

  const refreshPayments = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents/invoice/${encodeURIComponent(invoiceId)}/payments`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // fallback
    }
  }, [invoiceId]);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      const fetchData = async () => {
        try {
          const res = await fetch(`/api/documents/invoice/${encodeURIComponent(invoiceId)}/payments`);
          if (res.ok && isMounted) {
            const json = await res.json();
            setData(json);
          } else if (isMounted) {
            setErrorMessage(t('common.error'));
          }
        } catch {
          if (isMounted) {
            setErrorMessage(t('common.error'));
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      void fetchData();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, invoiceId, t]);

  if (!isOpen) return null;

  const handleAddPayment = async (e: FormEvent) => {
    e.preventDefault();
    const numAmount = Number(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage(locale === 'id' ? 'Nominal pembayaran harus lebih besar dari 0.' : 'Payment amount must be greater than 0.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/documents/invoice/${encodeURIComponent(invoiceId)}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          paymentDate: formData.paymentDate,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
        }),
      });

      const resData = await res.json();

      if (res.ok) {
        setSuccessMessage(locale === 'id' ? 'Pembayaran berhasil dicatat.' : 'Payment recorded successfully.');
        setFormData({
          amount: '',
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'bank_transfer',
          notes: '',
        });
        void refreshPayments();
        onPaymentUpdated();
      } else {
        setErrorMessage(resData.error || t('common.error'));
      }
    } catch {
      setErrorMessage(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm(t('paymentModal.deletePaymentConfirm'))) return;

    try {
      const res = await fetch(
        `/api/documents/invoice/${encodeURIComponent(invoiceId)}/payments/${encodeURIComponent(paymentId)}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        setSuccessMessage(locale === 'id' ? 'Catatan pembayaran berhasil dihapus.' : 'Payment record deleted.');
        void refreshPayments();
        onPaymentUpdated();
      } else {
        setErrorMessage(t('common.error'));
      }
    } catch {
      setErrorMessage(t('common.error'));
    }
  };

  const formatCurrency = (val: number, cur: string) => {
    if (cur === 'IDR') {
      return `Rp ${val.toLocaleString('id-ID')}`;
    }
    return `$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const percentPaid = data && data.totalInvoice > 0
    ? Math.min(100, Math.round((data.totalPaid / data.totalInvoice) * 100))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200/80 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-800">
              <CreditCard size={20} weight="bold" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 flex items-center gap-2">
                <span>{t('paymentModal.title')}: {invoiceNumber}</span>
                {data && (
                  <span
                    className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      data.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : data.status === 'partial_paid'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    {data.status === 'paid' ? t('documents.statusPaid') : data.status === 'partial_paid' ? t('documents.statusPartial') : data.status}
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {locale === 'id' ? 'Kelola termin, uang muka (DP), dan histori pelunasan invoice.' : 'Audit milestones, down payments, and invoice settlements.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-xs text-zinc-400 font-medium">{t('common.loading')}</div>
          ) : data ? (
            <>
              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-50/80 border border-zinc-200/80 rounded-2xl p-3.5">
                  <span className="text-[11px] text-zinc-500 font-medium">{t('paymentModal.totalInvoice')}</span>
                  <p className="text-sm sm:text-base font-bold text-zinc-900 mt-1">
                    {formatCurrency(data.totalInvoice, activeCurrency)}
                  </p>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-2xl p-3.5">
                  <span className="text-[11px] text-emerald-700 font-medium">{t('paymentModal.totalPaid')}</span>
                  <p className="text-sm sm:text-base font-bold text-emerald-700 mt-1">
                    {formatCurrency(data.totalPaid, activeCurrency)}
                  </p>
                </div>

                <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-3.5">
                  <span className="text-[11px] text-amber-700 font-medium">{t('paymentModal.remainingDue')}</span>
                  <p className="text-sm sm:text-base font-bold text-amber-700 mt-1">
                    {formatCurrency(data.balanceRemaining, activeCurrency)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-500">{locale === 'id' ? 'Progres Pelunasan' : 'Settlement Progress'}</span>
                  <span className="text-zinc-900 font-bold">{percentPaid}%</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/80">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${percentPaid}%` }}
                  />
                </div>
              </div>

              {/* Feedback Messages */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl text-xs font-medium bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <WarningCircle size={16} className="text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-2xl text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Record New Payment Form */}
              <form onSubmit={(e) => { void handleAddPayment(e); }} className="bg-zinc-50/60 border border-zinc-200/80 rounded-2xl p-4 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                  <Plus size={14} weight="bold" />
                  {t('paymentModal.recordTitle')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                      {t('paymentModal.amountLabel', { currency: activeCurrency })} *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder={data.currency === 'IDR' ? 'e.g. 2500000' : 'e.g. 150'}
                      value={formData.amount}
                      onChange={(e) => { setFormData({ ...formData, amount: e.target.value }); }}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                      {t('paymentModal.paymentDateLabel')} *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.paymentDate}
                      onChange={(e) => { setFormData({ ...formData, paymentDate: e.target.value }); }}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                      {t('paymentModal.methodLabel')}
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => { setFormData({ ...formData, paymentMethod: e.target.value }); }}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 cursor-pointer"
                    >
                      <option value="bank_transfer">{t('paymentModal.methodBank')}</option>
                      <option value="qris">{t('paymentModal.methodEwallet')}</option>
                      <option value="cash">{t('paymentModal.methodCash')}</option>
                      <option value="other">{t('paymentModal.methodOther')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                      {t('paymentModal.notesLabel')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('paymentModal.notesPlaceholder')}
                      value={formData.notes}
                      onChange={(e) => { setFormData({ ...formData, notes: e.target.value }); }}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="text-xs px-4 py-2 bg-zinc-900 hover:bg-black text-white font-medium flex items-center gap-1.5 cursor-pointer rounded-xl transition-colors shadow-xs disabled:opacity-50"
                  >
                    <CreditCard size={14} />
                    {saving ? t('paymentModal.btnSubmitting') : t('paymentModal.btnSubmit')}
                  </button>
                </div>
              </form>

              {/* Payment History List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                  {t('paymentModal.historyTitle')} ({data.payments.length})
                </h3>

                {data.payments.length === 0 ? (
                  <div className="py-6 text-center text-xs text-zinc-500 bg-zinc-50/60 rounded-2xl border border-zinc-200/80">
                    {t('paymentModal.noPayments')}
                  </div>
                ) : (
                  <div className="border border-zinc-200/80 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50/90 text-zinc-500 font-semibold border-b border-zinc-200/80">
                        <tr>
                          <th className="px-3 py-2.5">{t('documents.colDate')}</th>
                          <th className="px-3 py-2.5">{t('documents.colAmount')}</th>
                          <th className="px-3 py-2.5">{t('paymentModal.methodLabel')}</th>
                          <th className="px-3 py-2.5">{t('common.actions')}</th>
                          <th className="px-3 py-2.5 text-right">{t('documents.colActions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-zinc-800">
                        {data.payments.map((p) => (
                          <tr key={p.id} className="hover:bg-zinc-50/60 transition-colors">
                            <td className="px-3 py-2.5 font-mono text-zinc-500">
                              {new Date(p.paymentDate).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US')}
                            </td>
                            <td className="px-3 py-2.5 font-bold text-emerald-600 font-mono">
                              {formatCurrency(Number(p.amount), activeCurrency)}
                            </td>
                            <td className="px-3 py-2.5 capitalize text-zinc-700">
                              {p.paymentMethod.replace('_', ' ')}
                            </td>
                            <td className="px-3 py-2.5 text-zinc-500 max-w-xs truncate">
                              {p.notes || '—'}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <button
                                onClick={() => { void handleDeletePayment(p.id); }}
                                className="text-zinc-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title={t('common.delete')}
                              >
                                <Trash size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-4 py-2 border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 rounded-xl cursor-pointer font-medium transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
