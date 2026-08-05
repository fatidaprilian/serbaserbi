"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { QuotationData, QuotationItem } from "../../../types/quotation";
import GuestDocumentLayout from "@/components/GuestDocumentLayout";
import GuestItemizedDocumentForm from "@/components/forms/GuestItemizedDocumentForm";
import { useDocumentItems } from "@/lib/hooks/useDocumentItems";

const QuotationPDFWrapper = dynamic(
  () => import("../../../components/documents/QuotationPDFWrapper"),
  { ssr: false, loading: () => <div className="p-8 text-center text-emerald-500 bg-emerald-50/50 rounded-xl animate-pulse">Memuat Pratinjau...</div> }
);

export default function GuestQuotationPage() {
  const { items, addItem, updateItem, removeItem } = useDocumentItems<QuotationItem>([]);

  const [quotationData, setQuotationData] = useState<Omit<QuotationData, "items">>({
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
    taxRate: 0,
    notes: "Harga dapat berubah jika terdapat penambahan ruang lingkup pekerjaan di luar yang telah disepakati di atas.",
  });

  const fullQuotationData: QuotationData = { ...quotationData, items };

  return (
    <GuestDocumentLayout
      title="Buat Surat Penawaran"
      subtitle="Estimasi biaya elegan untuk calon klien Anda."
      formContent={
        <GuestItemizedDocumentForm
          currency={quotationData.currency}
          language={quotationData.language}
          onCurrencyChange={(currency) => { setQuotationData((prev) => ({ ...prev, currency })); }}
          onLanguageChange={(language) => { setQuotationData((prev) => ({ ...prev, language })); }}
          metaFields={
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Nomor Penawaran & Tanggal</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={quotationData.quotationNumber}
                  onChange={(e) => { setQuotationData((prev) => ({ ...prev, quotationNumber: e.target.value })); }}
                />
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={quotationData.date}
                  onChange={(e) => { setQuotationData((prev) => ({ ...prev, date: e.target.value })); }}
                />
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={quotationData.validUntil}
                  onChange={(e) => { setQuotationData((prev) => ({ ...prev, validUntil: e.target.value })); }}
                />
              </div>
            </div>
          }
          logo={quotationData.logo}
          onLogoChange={(logo) => { setQuotationData((prev) => ({ ...prev, logo })); }}
          onLogoRemove={() => { setQuotationData((prev) => ({ ...prev, logo: undefined })); }}
          fromName={quotationData.fromName}
          fromAddress={quotationData.fromAddress}
          clientName={quotationData.clientName}
          clientAddress={quotationData.clientAddress}
          onFromChange={(fields) => { setQuotationData((prev) => ({ ...prev, ...fields, fromName: fields.name ?? prev.fromName, fromAddress: fields.address ?? prev.fromAddress })); }}
          onClientChange={(fields) => { setQuotationData((prev) => ({ ...prev, clientName: fields.name ?? prev.clientName, clientAddress: fields.address ?? prev.clientAddress })); }}
          items={items}
          onAddItem={() => { addItem(); }}
          onItemChange={(id, field, value) => { updateItem(id, field, value); }}
          onRemoveItem={(id) => { removeItem(id); }}
          notes={quotationData.notes}
          onNotesChange={(notes) => { setQuotationData((prev) => ({ ...prev, notes })); }}
          notesLabel="Syarat & Ketentuan Tambahan (Catatan)"
          notesPlaceholder="Tuliskan catatan tambahan (misalnya metode pembayaran, jangka waktu pengerjaan, dll)..."
        />
      }
      previewContent={<QuotationPDFWrapper data={fullQuotationData} />}
    />
  );
}
