"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { InvoiceData, InvoiceItem } from "../../../types/invoice";
import Link from "next/link";
import LogoUpload from "@/components/LogoUpload";

// Dynamic import for PDF Viewer to avoid SSR issues
const PDFViewerWrapper = dynamic(
  () => import("../../../components/documents/PDFViewerWrapper"),
  { ssr: false, loading: () => <div className="p-8 text-center text-blue-500 bg-blue-50/50 rounded-xl animate-pulse">Memuat Pratinjau PDF...</div> }
);

export default function GuestInvoicePage() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    currency: "IDR",
    language: "id",
    logo: undefined,
    invoiceNumber: "INV-2026-001",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    fromName: "",
    fromAddress: "",
    clientName: "",
    clientAddress: "",
    items: [],
    taxRate: 0,
    notes: "",
  });

  const handleAddItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [
        ...invoiceData.items,
        { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0 },
      ],
    });
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const handleRemoveItem = (id: string) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter((item) => item.id !== id),
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] font-sans selection:bg-black selection:text-white">
      {/* Premium subtle gradient blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-zinc-200/50 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto w-full p-4 sm:p-8 flex flex-col gap-8 z-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-200 rounded-full hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Buat Invoice</h1>
              <p className="text-sm text-zinc-500 mt-1">Isi detail di bawah untuk menghasilkan PDF secara instan.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {/* FORM SECTION */}
          <section className="bg-white border border-zinc-200/60 rounded-3xl p-6 sm:p-10 shadow-premium flex flex-col gap-8 h-[calc(100vh-10rem)] overflow-y-auto">
            
            {/* Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Mata Uang & Bahasa</label>
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={invoiceData.currency}
                    onChange={(e) => setInvoiceData({ ...invoiceData, currency: e.target.value as "IDR" | "USD" })}
                  >
                    <option value="IDR">IDR</option>
                    <option value="USD">USD</option>
                  </select>
                  <select 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={invoiceData.language}
                    onChange={(e) => setInvoiceData({ ...invoiceData, language: e.target.value as "id" | "en" })}
                  >
                    <option value="id">Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Nomor Invoice</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">Tanggal & Jatuh Tempo</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    value={invoiceData.date}
                    onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                  />
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <LogoUpload 
              logo={invoiceData.logo}
              onLogoChange={(logo) => setInvoiceData({ ...invoiceData, logo })}
              onLogoRemove={() => setInvoiceData({ ...invoiceData, logo: undefined })}
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
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={invoiceData.fromName}
                    onChange={(e) => setInvoiceData({ ...invoiceData, fromName: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-700">Alamat</label>
                  <textarea 
                    placeholder="Alamat lengkap..."
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
                    value={invoiceData.fromAddress}
                    onChange={(e) => setInvoiceData({ ...invoiceData, fromAddress: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Informasi Klien (Tujuan)</h3>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-700">Nama Klien</label>
                  <input 
                    type="text" 
                    placeholder="PT Klien Sejahtera"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={invoiceData.clientName}
                    onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-700">Alamat Klien</label>
                  <textarea 
                    placeholder="Jl. Sudirman No. 1..."
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
                    value={invoiceData.clientAddress}
                    onChange={(e) => setInvoiceData({ ...invoiceData, clientAddress: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Items */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Detail Layanan</label>
                <button 
                  onClick={handleAddItem}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  + Tambah Item
                </button>
              </div>

              {invoiceData.items.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Belum ada item ditambahkan.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {invoiceData.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-start p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                        <span className="text-xs text-slate-500">Deskripsi</span>
                        <input 
                          type="text" 
                          placeholder="Jasa Web Dev..."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-500 transition-all"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2 flex flex-col gap-1">
                        <span className="text-xs text-slate-500">Qty</span>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-500 transition-all"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-8 sm:col-span-3 flex flex-col gap-1">
                        <span className="text-xs text-slate-500">Harga ({invoiceData.currency})</span>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-500 transition-all"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, "unitPrice", Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-1 flex items-end justify-end sm:pt-6">
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-400 hover:text-red-600 p-2 transition-colors"
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
              <label className="text-sm font-medium text-zinc-700">Catatan Tambahan</label>
              <textarea 
                placeholder="Tuliskan catatan tambahan (misalnya metode pembayaran, ucapan terima kasih, dll)..."
                rows={4}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-y"
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
              />
            </div>

          </section>

          {/* PREVIEW SECTION */}
          <section className="bg-zinc-100/50 rounded-3xl p-2 h-[calc(100vh-10rem)] border border-zinc-200/60 shadow-inner sticky top-8 overflow-hidden">
            <PDFViewerWrapper data={invoiceData} />
          </section>
        </div>
      </div>
    </div>
  );
}
