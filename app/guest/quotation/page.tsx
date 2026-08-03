"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { QuotationData, QuotationItem } from "../../../types/quotation";
import GuestPageHeader from "@/components/GuestPageHeader";
import LogoUpload from "@/components/LogoUpload";

const QuotationPDFWrapper = dynamic(
  () => import("../../../components/documents/QuotationPDFWrapper"),
  { ssr: false, loading: () => <div className="p-8 text-center text-emerald-500 bg-emerald-50/50 rounded-xl animate-pulse">Memuat Pratinjau...</div> }
);

export default function GuestQuotationPage() {
  const [quotationData, setQuotationData] = useState<QuotationData>({
    currency: "IDR",
    language: "id",
    logo: undefined,
    quotationNumber: "QT-2026-001",
    date: new Date().toISOString().split("T")[0],
    validUntil: "",
    fromName: "",
    fromAddress: "",
    clientName: "",
    clientAddress: "",
    items: [],
    taxRate: 0,
    notes: "Harga dapat berubah jika terdapat penambahan ruang lingkup pekerjaan di luar yang telah disepakati di atas.",
  });

  const handleAddItem = () => {
    setQuotationData({
      ...quotationData,
      items: [
        ...quotationData.items,
        { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0 },
      ],
    });
  };

  const handleItemChange = (id: string, field: keyof QuotationItem, value: string | number) => {
    setQuotationData({
      ...quotationData,
      items: quotationData.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const handleRemoveItem = (id: string) => {
    setQuotationData({
      ...quotationData,
      items: quotationData.items.filter((item) => item.id !== id),
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] font-sans selection:bg-black selection:text-white">
      {/* Premium subtle gradient blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-zinc-200/50 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto w-full p-4 sm:p-8 flex flex-col gap-8 z-10">
        <GuestPageHeader
          title="Buat Surat Penawaran"
          subtitle="Estimasi biaya elegan untuk calon klien Anda."
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {/* FORM SECTION */}
          <section className="bg-white border border-zinc-200/60 rounded-3xl p-6 sm:p-10 shadow-premium flex flex-col gap-8 h-[calc(100vh-10rem)] overflow-y-auto">
            
            {/* Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Mata Uang & Bahasa</label>
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={quotationData.currency}
                    onChange={(e) => setQuotationData({ ...quotationData, currency: e.target.value as "IDR" | "USD" })}
                  >
                    <option value="IDR">IDR</option>
                    <option value="USD">USD</option>
                  </select>
                  <select 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={quotationData.language}
                    onChange={(e) => setQuotationData({ ...quotationData, language: e.target.value as "id" | "en" })}
                  >
                    <option value="id">Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Nomor Penawaran</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={quotationData.quotationNumber}
                  onChange={(e) => setQuotationData({ ...quotationData, quotationNumber: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">Tanggal & Berlaku Sampai</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    value={quotationData.date}
                    onChange={(e) => setQuotationData({ ...quotationData, date: e.target.value })}
                  />
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    value={quotationData.validUntil}
                    onChange={(e) => setQuotationData({ ...quotationData, validUntil: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <LogoUpload 
              logo={quotationData.logo}
              onLogoChange={(logo) => setQuotationData({ ...quotationData, logo })}
              onLogoRemove={() => setQuotationData({ ...quotationData, logo: undefined })}
            />

            <hr className="border-zinc-100" />

            {/* Sender & Client Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Informasi Anda (Pengirim)</h3>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-700">Nama Lengkap / Perusahaan</label>
                  <input 
                    type="text" 
                    placeholder="Nama Anda..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={quotationData.fromName}
                    onChange={(e) => setQuotationData({ ...quotationData, fromName: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-700">Alamat</label>
                  <textarea 
                    placeholder="Alamat lengkap..."
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-y"
                    value={quotationData.fromAddress}
                    onChange={(e) => setQuotationData({ ...quotationData, fromAddress: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Informasi Klien (Tujuan)</h3>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-700">Nama Calon Klien</label>
                  <input 
                    type="text" 
                    placeholder="PT Klien Prospektif"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={quotationData.clientName}
                    onChange={(e) => setQuotationData({ ...quotationData, clientName: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-700">Alamat Calon Klien</label>
                  <textarea 
                    placeholder="Gedung XYZ Lt. 5..."
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-y"
                    value={quotationData.clientAddress}
                    onChange={(e) => setQuotationData({ ...quotationData, clientAddress: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Items */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Rincian Estimasi Biaya</label>
                <button 
                  onClick={handleAddItem}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                >
                  + Tambah Rincian
                </button>
              </div>

              {quotationData.items.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Belum ada estimasi layanan ditambahkan.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {quotationData.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-start p-4 bg-slate-50/50 border border-slate-100 rounded-xl hover:border-emerald-100 transition-colors">
                      <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                        <span className="text-xs text-slate-500">Deskripsi</span>
                        <input 
                          type="text" 
                          placeholder="Pembuatan Fitur X..."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-emerald-500 transition-all"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2 flex flex-col gap-1">
                        <span className="text-xs text-slate-500">Qty (Hari/Paket)</span>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-emerald-500 transition-all"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-8 sm:col-span-3 flex flex-col gap-1">
                        <span className="text-xs text-slate-500">Est. Harga ({quotationData.currency})</span>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-emerald-500 transition-all"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, "unitPrice", Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-1 flex items-end justify-end sm:pt-6">
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                          title="Hapus"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-zinc-100" />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700">Syarat & Ketentuan Tambahan (Catatan)</label>
              <textarea 
                placeholder="Tuliskan catatan tambahan (misalnya metode pembayaran, jangka waktu pengerjaan, dll)..."
                rows={4}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-y"
                value={quotationData.notes}
                onChange={(e) => setQuotationData({ ...quotationData, notes: e.target.value })}
              />
            </div>

          </section>

          {/* PREVIEW SECTION */}
          <section className="bg-zinc-100/50 rounded-3xl p-2 h-[calc(100vh-10rem)] border border-zinc-200/60 shadow-inner sticky top-8 overflow-hidden">
            <QuotationPDFWrapper data={quotationData} />
          </section>
        </div>
      </div>
    </div>
  );
}
