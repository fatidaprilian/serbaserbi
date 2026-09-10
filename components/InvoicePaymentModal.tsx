'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { Button, Badge } from '@cloudflare/kumo';
import { CreditCard, Trash, X, CheckCircle, WarningCircle, Plus } from '@phosphor-icons/react';

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
            setErrorMessage('Gagal memuat histori pembayaran invoice.');
          }
        } catch {
          if (isMounted) {
            setErrorMessage('Terjadi gangguan jaringan saat memuat pembayaran.');
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
  }, [isOpen, invoiceId]);

  if (!isOpen) return null;

  const handleAddPayment = async (e: FormEvent) => {
    e.preventDefault();
    const numAmount = Number(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Nominal pembayaran harus lebih besar dari 0.');
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
        setSuccessMessage('Pembayaran berhasil dicatat.');
        setFormData({
          amount: '',
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'bank_transfer',
          notes: '',
        });
        void refreshPayments();
        onPaymentUpdated();
      } else {
        setErrorMessage(resData.error || 'Gagal menyimpan pembayaran.');
      }
    } catch {
      setErrorMessage('Terjadi gangguan koneksi saat menyimpan pembayaran.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Hapus catatan pembayaran ini? Status invoice akan disesuaikan kembali.')) return;

    try {
      const res = await fetch(
        `/api/documents/invoice/${encodeURIComponent(invoiceId)}/payments/${encodeURIComponent(paymentId)}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        setSuccessMessage('Catatan pembayaran berhasil dihapus.');
        void refreshPayments();
        onPaymentUpdated();
      } else {
        setErrorMessage('Gagal menghapus catatan pembayaran.');
      }
    } catch {
      setErrorMessage('Terjadi gangguan koneksi saat menghapus pembayaran.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <CreditCard size={20} weight="duotone" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Pembayaran: {invoiceNumber}</span>
                {data && (
                  <Badge
                    variant="secondary"
                    className={
                      data.status === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : data.status === 'partial_paid'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }
                  >
                    {data.status === 'paid' ? 'Lunas' : data.status === 'partial_paid' ? 'DP Terbayar' : data.status}
                  </Badge>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola termin, uang muka (DP), dan histori pelunasan invoice.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Memuat rincian pembayaran...</div>
          ) : data ? (
            <>
              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
                  <span className="text-[11px] text-slate-400 font-medium">Total Tagihan</span>
                  <p className="text-sm sm:text-base font-bold text-slate-100 mt-1">
                    {formatCurrency(data.totalInvoice, activeCurrency)}
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
                  <span className="text-[11px] text-slate-400 font-medium">Sudah Terbayar</span>
                  <p className="text-sm sm:text-base font-bold text-emerald-400 mt-1">
                    {formatCurrency(data.totalPaid, activeCurrency)}
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
                  <span className="text-[11px] text-slate-400 font-medium">Sisa Piutang</span>
                  <p className="text-sm sm:text-base font-bold text-amber-400 mt-1">
                    {formatCurrency(data.balanceRemaining, activeCurrency)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Progres Pelunasan</span>
                  <span className="text-cyan-400">{percentPaid}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${percentPaid}%` }}
                  />
                </div>
              </div>

              {/* Feedback Messages */}
              {errorMessage && (
                <div className="p-3 rounded-xl text-xs font-medium bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                  <WarningCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Record New Payment Form */}
              <form onSubmit={(e) => { void handleAddPayment(e); }} className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Plus size={14} weight="bold" />
                  Catat Uang Muka (DP) / Pembayaran Baru
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Nominal Pembayaran ({activeCurrency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder={data.currency === 'IDR' ? 'e.g. 2500000' : 'e.g. 150'}
                      value={formData.amount}
                      onChange={(e) => { setFormData({ ...formData, amount: e.target.value }); }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Tanggal Pembayaran *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.paymentDate}
                      onChange={(e) => { setFormData({ ...formData, paymentDate: e.target.value }); }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Metode Pembayaran
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => { setFormData({ ...formData, paymentMethod: e.target.value }); }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                    >
                      <option value="bank_transfer">Transfer Bank</option>
                      <option value="qris">QRIS</option>
                      <option value="cash">Tunai / Cash</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Catatan / Keterangan Termin
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DP 50% di awal kontrak"
                      value={formData.notes}
                      onChange={(e) => { setFormData({ ...formData, notes: e.target.value }); }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={saving}
                    className="text-xs px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium flex items-center gap-1.5 cursor-pointer rounded-xl"
                  >
                    <CreditCard size={14} />
                    {saving ? 'Menyimpan...' : 'Simpan Pembayaran'}
                  </Button>
                </div>
              </form>

              {/* Payment History List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Histori Pembayaran ({data.payments.length})
                </h3>

                {data.payments.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                    Belum ada pembayaran yang dicatat untuk invoice ini.
                  </div>
                ) : (
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                          <th className="px-3 py-2.5">Tanggal</th>
                          <th className="px-3 py-2.5">Nominal</th>
                          <th className="px-3 py-2.5">Metode</th>
                          <th className="px-3 py-2.5">Catatan</th>
                          <th className="px-3 py-2.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-200">
                        {data.payments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-3 py-2.5 font-mono text-slate-400">
                              {new Date(p.paymentDate).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-3 py-2.5 font-bold text-emerald-400 font-mono">
                              {formatCurrency(Number(p.amount), activeCurrency)}
                            </td>
                            <td className="px-3 py-2.5 capitalize text-slate-300">
                              {p.paymentMethod.replace('_', ' ')}
                            </td>
                            <td className="px-3 py-2.5 text-slate-400 max-w-xs truncate">
                              {p.notes || '—'}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <button
                                onClick={() => { void handleDeletePayment(p.id); }}
                                className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                                title="Hapus catatan pembayaran"
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
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            className="text-xs px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
