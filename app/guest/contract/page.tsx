"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ContractData, ContractClause } from "../../../types/contract";
import Link from "next/link";

// Dynamic import for PDF Viewer to avoid SSR issues
const PDFViewerWrapper = dynamic(
  () => import("../../../components/documents/ContractPDFWrapper"),
  { ssr: false, loading: () => <div className="p-8 text-center text-indigo-500 bg-indigo-50/50 rounded-xl animate-pulse">Memuat Pratinjau Kontrak...</div> }
);

export default function GuestContractPage() {
  const [contractData, setContractData] = useState<ContractData>({
    contractNumber: "SPK-2026-001",
    date: new Date().toISOString().split("T")[0],
    currency: "IDR",
    language: "id",
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col p-6 sm:p-12 relative overflow-x-hidden">
      
      {/* Background gradients for Contract (Indigo/Purpleish) */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 z-10">
        <header className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Buat Kontrak Kerja (SPK)</h1>
            <p className="text-slate-500 mt-1">Dokumen perjanjian kerja sama profesional berformat legal.</p>
          </div>
          <Link href="/" className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
            Kembali
          </Link>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {/* FORM SECTION */}
          <section className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-8 h-[800px] overflow-y-auto">
            
            {/* Meta Info */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Informasi Dokumen</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Nomor Kontrak</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={contractData.contractNumber}
                    onChange={(e) => setContractData({ ...contractData, contractNumber: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Tanggal Penandatanganan</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={contractData.date}
                    onChange={(e) => setContractData({ ...contractData, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Mata Uang</label>
                  <select 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={contractData.currency}
                    onChange={(e) => setContractData({ ...contractData, currency: e.target.value as "IDR" | "USD" })}
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
                    onChange={(e) => setContractData({ ...contractData, language: e.target.value as "id" | "en" })}
                  >
                    <option value="id">Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Para Pihak */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Pihak A */}
              <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="font-semibold text-sm text-indigo-700">{contractData.partyA.role}</h3>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-500">Nama Lengkap / Perusahaan</label>
                  <input type="text" className="px-3 py-2 rounded-lg border border-slate-200 text-sm" value={contractData.partyA.name} onChange={(e) => setContractData({...contractData, partyA: {...contractData.partyA, name: e.target.value}})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-500">Alamat</label>
                  <textarea rows={2} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" value={contractData.partyA.address} onChange={(e) => setContractData({...contractData, partyA: {...contractData.partyA, address: e.target.value}})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-500">Nama Perwakilan (Ttd)</label>
                  <input type="text" className="px-3 py-2 rounded-lg border border-slate-200 text-sm" value={contractData.partyA.representativeName} onChange={(e) => setContractData({...contractData, partyA: {...contractData.partyA, representativeName: e.target.value}})} />
                </div>
              </div>

              {/* Pihak B */}
              <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="font-semibold text-sm text-indigo-700">{contractData.partyB.role}</h3>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-500">Nama Lengkap / Perusahaan</label>
                  <input type="text" className="px-3 py-2 rounded-lg border border-slate-200 text-sm" value={contractData.partyB.name} onChange={(e) => setContractData({...contractData, partyB: {...contractData.partyB, name: e.target.value}})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-500">Alamat</label>
                  <textarea rows={2} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" value={contractData.partyB.address} onChange={(e) => setContractData({...contractData, partyB: {...contractData.partyB, address: e.target.value}})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-500">Nama Perwakilan (Ttd)</label>
                  <input type="text" className="px-3 py-2 rounded-lg border border-slate-200 text-sm" value={contractData.partyB.representativeName} onChange={(e) => setContractData({...contractData, partyB: {...contractData.partyB, representativeName: e.target.value}})} />
                </div>
              </div>
            </div>

            {/* Pasal / Klausul */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-lg font-semibold text-slate-800">Pasal-Pasal Kontrak</h2>
                <button onClick={handleAddClause} className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors">
                  + Tambah Pasal
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {contractData.clauses.map((clause, index) => (
                  <div key={clause.id} className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm relative group">
                    <button onClick={() => handleRemoveClause(clause.id)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xl leading-none">
                      &times;
                    </button>
                    <div className="flex flex-col gap-1 pr-6">
                      <label className="text-xs font-semibold text-slate-500">Pasal {index + 1} (Judul)</label>
                      <input type="text" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all" value={clause.title} onChange={(e) => handleClauseChange(clause.id, "title", e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-500">Isi Pasal</label>
                      <textarea rows={4} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500 transition-all resize-y leading-relaxed" value={clause.content} onChange={(e) => handleClauseChange(clause.id, "content", e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>

          {/* PREVIEW SECTION */}
          <section className="bg-slate-200/50 rounded-2xl p-2 h-[800px] border border-slate-300 shadow-inner sticky top-6">
            <PDFViewerWrapper data={contractData} />
          </section>
        </div>
      </div>
    </div>
  );
}
