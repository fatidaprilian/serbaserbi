"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { QuotationData, QuotationItem } from "../../../types/quotation";
import GuestDocumentLayout from "@/components/GuestDocumentLayout";
import LogoUpload from "@/components/LogoUpload";
import DocumentPartyForm from "@/components/forms/DocumentPartyForm";
import DocumentItemsForm from "@/components/forms/DocumentItemsForm";
import DocumentMetaForm from "@/components/forms/DocumentMetaForm";
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
        <>
          <DocumentMetaForm
            currency={quotationData.currency}
            language={quotationData.language}
            onCurrencyChange={(currency) => { setQuotationData({ ...quotationData, currency }); }}
            onLanguageChange={(language) => { setQuotationData({ ...quotationData, language }); }}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Nomor Penawaran & Tanggal</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={quotationData.quotationNumber}
                onChange={(e) => { setQuotationData({ ...quotationData, quotationNumber: e.target.value }); }}
              />
              <input
                type="date"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={quotationData.date}
                onChange={(e) => { setQuotationData({ ...quotationData, date: e.target.value }); }}
              />
              <input
                type="date"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={quotationData.validUntil}
                onChange={(e) => { setQuotationData({ ...quotationData, validUntil: e.target.value }); }}
              />
            </div>
          </div>

          <LogoUpload
            logo={quotationData.logo}
            onLogoChange={(logo) => { setQuotationData({ ...quotationData, logo }); }}
            onLogoRemove={() => { setQuotationData({ ...quotationData, logo: undefined }); }}
          />

          <hr className="border-zinc-100" />

          <DocumentPartyForm
            fromName={quotationData.fromName}
            fromAddress={quotationData.fromAddress}
            clientName={quotationData.clientName}
            clientAddress={quotationData.clientAddress}
            onFromChange={(fields) => { setQuotationData({ ...quotationData, ...fields, fromName: fields.name ?? quotationData.fromName, fromAddress: fields.address ?? quotationData.fromAddress }); }}
            onClientChange={(fields) => { setQuotationData({ ...quotationData, clientName: fields.name ?? quotationData.clientName, clientAddress: fields.address ?? quotationData.clientAddress }); }}
          />

          <hr className="border-slate-100" />

          <DocumentItemsForm
            items={items}
            currency={quotationData.currency}
            onAddItem={() => { addItem(); }}
            onItemChange={(id, field, value) => { updateItem(id, field as keyof QuotationItem, value); }}
            onRemoveItem={(id) => { removeItem(id); }}
          />

          <hr className="border-zinc-100" />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700">Syarat & Ketentuan Tambahan (Catatan)</label>
            <textarea 
              placeholder="Tuliskan catatan tambahan (misalnya metode pembayaran, jangka waktu pengerjaan, dll)..."
              rows={4}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-y"
              value={quotationData.notes}
              onChange={(e) => { setQuotationData({ ...quotationData, notes: e.target.value }); }}
            />
          </div>
        </>
      }
      previewContent={<QuotationPDFWrapper data={fullQuotationData} />}
    />
  );
}
