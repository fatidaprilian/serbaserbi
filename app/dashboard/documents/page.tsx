'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

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
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'invoice' | 'quotation' | 'contract'>('all');

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
        alert('Gagal memperbarui status dokumen.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const handleDelete = async (docType: string, id: string, docNum: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus dokumen "${docNum}"?`)) return;

    try {
      const res = await fetch(`/api/documents/${encodeURIComponent(docType)}/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        void fetchDocuments();
      } else {
        alert('Gagal menghapus dokumen.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
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
      draft: { label: 'Draft', color: 'bg-slate-700/50 text-slate-300 border-slate-600' },
      sent: { label: 'Terkirim', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
      paid: { label: 'Lunas', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
      partial_paid: { label: 'Sebagian', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
      overdue: { label: 'Jatuh Tempo', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
      cancelled: { label: 'Batal', color: 'bg-slate-800 text-slate-500 border-slate-700' },
      accepted: { label: 'Disetujui', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
      rejected: { label: 'Ditolak', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
      expired: { label: 'Kadaluarsa', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
      unsigned: { label: 'Belum TTD', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
      freelancer_signed: { label: 'TTD Freelancer', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
      both_signed: { label: 'TTD Lengkap', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    };

    const info = Object.prototype.hasOwnProperty.call(statusMap, status)
      ? statusMap[status]
      : { label: status, color: 'bg-slate-800 text-slate-400 border-slate-700' };

    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${info.color}`}>
        {info.label}
      </span>
    );
  };

  const getDocTypeBadge = (docType: string) => {
    switch (docType) {
      case 'invoice':
        return <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">Invoice</span>;
      case 'quotation':
        return <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">Penawaran</span>;
      case 'contract':
        return <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Kontrak</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Riwayat & Dokumen Saya</h1>
          <p className="text-sm text-slate-400 mt-1">
            Kelola dan pantau seluruh Invoice, Penawaran, dan Kontrak yang telah dibuat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/guest/invoice"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md transition-all"
          >
            + Buat Dokumen Baru
          </Link>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-medium">Total Dokumen</span>
          <p className="text-2xl font-black text-slate-100 mt-1">{documents.length}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-medium">Invoice</span>
          <p className="text-2xl font-black text-cyan-400 mt-1">
            {documents.filter((d) => d.docType === 'invoice').length}
          </p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-medium">Penawaran</span>
          <p className="text-2xl font-black text-purple-400 mt-1">
            {documents.filter((d) => d.docType === 'quotation').length}
          </p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-medium">Kontrak</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {documents.filter((d) => d.docType === 'contract').length}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(
            [
              { id: 'all', label: 'Semua' },
              { id: 'invoice', label: 'Invoice' },
              { id: 'quotation', label: 'Penawaran' },
              { id: 'contract', label: 'Kontrak' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
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
          placeholder="Cari nomor dokumen atau klien..."
          className="w-full sm:w-72 px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />
      </div>

      {/* Documents Table / List */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 font-medium">Memuat riwayat dokumen...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
          <p className="text-slate-400 font-medium">
            {search ? 'Tidak ada dokumen yang sesuai dengan pencarian.' : 'Belum ada dokumen tersimpan.'}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/guest/invoice" className="text-xs font-semibold text-cyan-400 hover:underline">
              + Buat Invoice
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/guest/contract" className="text-xs font-semibold text-emerald-400 hover:underline">
              + Buat Kontrak
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Dokumen</th>
                  <th className="px-5 py-3.5">Klien</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Mata Uang</th>
                  <th className="px-5 py-3.5">Tanggal</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredDocs.map((doc) => (
                  <tr key={`${doc.docType}-${doc.id}`} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-100 flex items-center gap-2">
                      {getDocTypeBadge(doc.docType)}
                      <span>{doc.documentNumber}</span>
                    </td>
                    <td className="px-5 py-4">{doc.clientName || '—'}</td>
                    <td className="px-5 py-4">{getStatusBadge(doc.docType, doc.status)}</td>
                    <td className="px-5 py-4 font-mono">{doc.currency}</td>
                    <td className="px-5 py-4 text-slate-400 font-mono">
                      {doc.issueDate ? new Date(doc.issueDate).toLocaleDateString('id-ID') : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status Switcher Dropdown */}
                        <select
                          value={doc.status}
                          onChange={(e) => { void handleStatusChange(doc.docType, doc.id, e.target.value); }}
                          className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                          {doc.docType === 'invoice' && (
                            <>
                              <option value="draft">Draft</option>
                              <option value="sent">Terkirim</option>
                              <option value="paid">Lunas</option>
                              <option value="partial_paid">Sebagian</option>
                              <option value="overdue">Jatuh Tempo</option>
                              <option value="cancelled">Batal</option>
                            </>
                          )}
                          {doc.docType === 'quotation' && (
                            <>
                              <option value="draft">Draft</option>
                              <option value="sent">Terkirim</option>
                              <option value="accepted">Disetujui</option>
                              <option value="rejected">Ditolak</option>
                              <option value="expired">Kadaluarsa</option>
                            </>
                          )}
                          {doc.docType === 'contract' && (
                            <>
                              <option value="unsigned">Belum TTD</option>
                              <option value="freelancer_signed">TTD Freelancer</option>
                              <option value="both_signed">TTD Lengkap</option>
                            </>
                          )}
                        </select>

                        <button
                          onClick={() => { void handleDelete(doc.docType, doc.id, doc.documentNumber); }}
                          className="px-2 py-1 rounded text-[11px] font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Hapus Dokumen"
                        >
                          Hapus
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
    </div>
  );
}
