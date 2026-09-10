"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ContractData, ContractClause } from "../../../types/contract";
import GuestDocumentLayout from "@/components/GuestDocumentLayout";
import LogoUpload from "@/components/LogoUpload";
import ContractPartyForm from "@/components/forms/ContractPartyForm";
import DocumentSaveToolbar from "@/components/DocumentSaveToolbar";
import { ShieldCheck, WarningCircle, ArrowSquareOut } from "@phosphor-icons/react";

// Dynamic import for PDF Viewer to avoid SSR issues
const ContractPDFWrapper = dynamic(
  () => import("../../../components/documents/ContractPDFWrapper"),
  { ssr: false, loading: () => <div className="p-8 text-center text-indigo-500 bg-indigo-50/50 rounded-xl animate-pulse">Memuat Pratinjau...</div> }
);

export default function GuestContractPage() {
  const [loadingClauses, setLoadingClauses] = useState(false);
  const [clausesError, setClausesError] = useState<string | null>(null);

  const [contractData, setContractData] = useState<ContractData>({
    contractNumber: "SPK-2026-001",
    date: new Date().toISOString().split("T")[0],
    currency: "IDR",
    language: "id",
    logo: undefined,
    projectTitle: "Pengembangan Website Perusahaan",
    projectValue: 15000000,
    startDate: "",
    endDate: "",
    partyA: {
      name: "",
      address: "",
      role: "Pihak Pertama (Pemberi Kerja)",
      representativeName: "",
    },
    partyB: {
      name: "",
      address: "",
      role: "Pihak Kedua (Penyedia Jasa)",
      representativeName: "",
    },
    clauses: [
      {
        id: "1",
        title: "Ruang Lingkup Pekerjaan",
        content: "PIHAK KEDUA sepakat untuk melaksanakan pekerjaan berupa Pengembangan Website sesuai dengan spesifikasi yang telah disepakati oleh kedua belah pihak.",
      },
      {
        id: "2",
        title: "Nilai dan Tata Cara Pembayaran",
        content: "Total nilai pekerjaan adalah sebagaimana disepakati. Pembayaran dilakukan secara bertahap: 50% sebagai Uang Muka pada saat penandatanganan kontrak, dan 50% setelah pekerjaan selesai 100%.",
      },
      {
        id: "3",
        title: "Hak dan Kewajiban",
        content: "PIHAK PERTAMA berhak menerima hasil pekerjaan sesuai tenggat waktu. PIHAK KEDUA wajib menyelesaikan pekerjaan dengan profesional dan berhak menerima pembayaran tepat waktu.",
      }
    ],
  });

  const handleSuggestClauses = async () => {
    setLoadingClauses(true);
    setClausesError(null);

    try {
      const res = await fetch('/api/ai/suggest-clauses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: contractData.projectTitle,
          projectValue: contractData.projectValue,
          currency: contractData.currency,
        }),
      });

      const data = await res.json();

      if (res.ok && Array.isArray(data.clauses)) {
        const newClauses: ContractClause[] = data.clauses.map(
          (c: { title: string; content: string }, idx: number) => ({
            id: `${Date.now()}-${idx}`,
            title: c.title,
            content: c.content,
          })
        );

        setContractData((prev) => ({
          ...prev,
          clauses: [...prev.clauses, ...newClauses],
        }));
      } else {
        setClausesError(data.error || 'Gagal menyarankan klausul.');
      }
    } catch {
      setClausesError('Terjadi gangguan jaringan saat menghubungi layanan AI.');
    } finally {
      setLoadingClauses(false);
    }
  };

  const handleAddClause = () => {
    setContractData({
      ...contractData,
      clauses: [
        ...contractData.clauses,
        { id: Date.now().toString(), title: "Klausul Baru", content: "" },
      ],
    });
  };

  const handleClauseChange = (id: string, field: keyof ContractClause, value: string) => {
    setContractData({
      ...contractData,
      clauses: contractData.clauses.map((clause) =>
        clause.id === id ? { ...clause, [field]: value } : clause
      ),
    });
  };

  const handleRemoveClause = (id: string) => {
    setContractData({
      ...contractData,
      clauses: contractData.clauses.filter((clause) => clause.id !== id),
    });
  };

  return (
    <GuestDocumentLayout
      title="Buat Kontrak Kerja (SPK)"
      subtitle="Dokumen perjanjian kerja sama profesional berformat legal."
      formContent={
        <>
          <DocumentSaveToolbar
            docType="contract"
            documentNumber={contractData.contractNumber}
            issueDate={contractData.date}
            currency={contractData.currency}
            value={contractData.projectValue}
            clientName={contractData.partyA.name}
            clientAddress={contractData.partyA.address}
            onApplyUserProfile={(profile) => {
              setContractData((prev) => ({
                ...prev,
                partyB: {
                  ...prev.partyB,
                  name: profile.fromName,
                  address: profile.fromAddress,
                },
                currency: (profile.defaultCurrency as 'IDR' | 'USD') || prev.currency,
                logo: profile.logoUrl || prev.logo,
              }));
            }}
            onSelectClient={(client) => {
              setContractData((prev) => ({
                ...prev,
                partyA: {
                  ...prev.partyA,
                  name: client.name,
                  address: client.address,
                },
              }));
            }}
          />

          {/* Meta Info */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Informasi Dokumen</h2>
            
            <LogoUpload 
              logo={contractData.logo}
              onLogoChange={(logo) => { setContractData({ ...contractData, logo }); }}
              onLogoRemove={() => { setContractData({ ...contractData, logo: undefined }); }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Nomor Kontrak</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={contractData.contractNumber}
                  onChange={(e) => { setContractData({ ...contractData, contractNumber: e.target.value }); }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Tanggal Penandatanganan</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={contractData.date}
                  onChange={(e) => { setContractData({ ...contractData, date: e.target.value }); }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700">Tanggal Mulai & Selesai</label>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="date" 
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                  value={contractData.startDate}
                  onChange={(e) => { setContractData({ ...contractData, startDate: e.target.value }); }}
                />
                <input 
                  type="date" 
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                  value={contractData.endDate}
                  onChange={(e) => { setContractData({ ...contractData, endDate: e.target.value }); }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Mata Uang</label>
                <select 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={contractData.currency}
                  onChange={(e) => { setContractData({ ...contractData, currency: e.target.value as "IDR" | "USD" }); }}
                >
                  <option value="IDR">IDR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Bahasa Dokumen</label>
                <select 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={contractData.language}
                  onChange={(e) => { setContractData({ ...contractData, language: e.target.value as "id" | "en" }); }}
                >
                  <option value="id">Indonesia</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Para Pihak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ContractPartyForm
              party={contractData.partyA}
              onChange={(fields) => { setContractData({ ...contractData, partyA: { ...contractData.partyA, ...fields } }); }}
            />
            <ContractPartyForm
              party={contractData.partyB}
              onChange={(fields) => { setContractData({ ...contractData, partyB: { ...contractData.partyB, ...fields } }); }}
            />
          </div>

          {/* Pasal / Klausul */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-2">
              <h2 className="text-lg font-semibold text-slate-800">Pasal-Pasal Kontrak</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { void handleSuggestClauses(); }}
                  disabled={loadingClauses}
                  className="px-3 py-1.5 text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/80 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  title="Dapatkan rekomendasi klausul protektif otomatis sesuai judul dan nilai proyek"
                >
                  <ShieldCheck size={14} />
                  <span>{loadingClauses ? 'Menganalisis...' : 'Sarankan Klausul'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddClause}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                >
                  + Tambah Pasal
                </button>
              </div>
            </div>

            {clausesError && (
              <div className="p-3 rounded-xl text-xs font-medium bg-rose-500/10 border border-rose-500/30 text-rose-600 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <WarningCircle size={15} />
                  {clausesError}
                </span>
                {clausesError.includes('Pengaturan') && (
                  <a href="/dashboard/settings" className="font-semibold text-cyan-600 hover:underline flex items-center gap-0.5">
                    Buka Pengaturan
                    <ArrowSquareOut size={12} />
                  </a>
                )}
              </div>
            )}

            <div className="flex flex-col gap-4">
              {contractData.clauses.map((clause, index) => (
                <div key={clause.id} className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm relative group">
                  <button onClick={() => { handleRemoveClause(clause.id); }} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xl leading-none">
                    &times;
                  </button>
                  <div className="flex flex-col gap-1 pr-6">
                    <label className="text-xs font-semibold text-slate-500">Pasal {index + 1} (Judul)</label>
                    <input type="text" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all" value={clause.title} onChange={(e) => { handleClauseChange(clause.id, "title", e.target.value); }} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Isi Pasal</label>
                    <textarea rows={4} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500 transition-all resize-y leading-relaxed" value={clause.content} onChange={(e) => { handleClauseChange(clause.id, "content", e.target.value); }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      }
      previewContent={<ContractPDFWrapper data={contractData} />}
    />
  );
}

