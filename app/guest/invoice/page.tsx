"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { InvoiceData, InvoiceItem } from "../../../types/invoice";
import GuestDocumentLayout from "@/components/GuestDocumentLayout";
import LogoUpload from "@/components/LogoUpload";
import DocumentPartyForm from "@/components/forms/DocumentPartyForm";
import DocumentItemsForm from "@/components/forms/DocumentItemsForm";
import DocumentMetaForm from "@/components/forms/DocumentMetaForm";
import { useDocumentItems } from "@/lib/hooks/useDocumentItems";

// Dynamic import for PDF Viewer to avoid SSR issues
const PDFViewerWrapper = dynamic(
  () => import("../../../components/documents/PDFViewerWrapper"),
  { ssr: false, loading: () => <div className="p-8 text-center text-blue-500 bg-blue-50/50 rounded-xl animate-pulse">Memuat Pratinjau PDF...</div> }
);

export default function GuestInvoicePage() {
  const { items, addItem, updateItem, removeItem } = useDocumentItems<InvoiceItem>([]);

  const [invoiceData, setInvoiceData] = useState<Omit<InvoiceData, "items">>({
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
    taxRate: 0,
    notes: "",
  });

  const fullInvoiceData: InvoiceData = { ...invoiceData, items };

  return (
    <GuestDocumentLayout
      title="Buat Invoice"
      subtitle="Isi detail di bawah untuk menghasilkan PDF secara instan."
      formContent={
        <>
          <DocumentMetaForm
            currency={invoiceData.currency}
            language={invoiceData.language}
            onCurrencyChange={(currency) => { setInvoiceData({ ...invoiceData, currency }); }}
            onLanguageChange={(language) => { setInvoiceData({ ...invoiceData, language }); }}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Nomor Invoice & Tanggal</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={invoiceData.invoiceNumber}
                onChange={(e) => { setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value }); }}
              />
              <input
                type="date"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={invoiceData.date}
                onChange={(e) => { setInvoiceData({ ...invoiceData, date: e.target.value }); }}
              />
              <input
                type="date"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={invoiceData.dueDate}
                onChange={(e) => { setInvoiceData({ ...invoiceData, dueDate: e.target.value }); }}
              />
            </div>
          </div>

          <LogoUpload
            logo={invoiceData.logo}
            onLogoChange={(logo) => { setInvoiceData({ ...invoiceData, logo }); }}
            onLogoRemove={() => { setInvoiceData({ ...invoiceData, logo: undefined }); }}
          />

          <hr className="border-zinc-100" />

          <DocumentPartyForm
            fromName={invoiceData.fromName}
            fromAddress={invoiceData.fromAddress}
            clientName={invoiceData.clientName}
            clientAddress={invoiceData.clientAddress}
            onFromChange={(fields) => { setInvoiceData({ ...invoiceData, ...fields, fromName: fields.name ?? invoiceData.fromName, fromAddress: fields.address ?? invoiceData.fromAddress }); }}
            onClientChange={(fields) => { setInvoiceData({ ...invoiceData, clientName: fields.name ?? invoiceData.clientName, clientAddress: fields.address ?? invoiceData.clientAddress }); }}
          />

          <hr className="border-slate-100" />

          <DocumentItemsForm
            items={items}
            currency={invoiceData.currency}
            onAddItem={() => { addItem(); }}
            onItemChange={(id, field, value) => { updateItem(id, field as keyof InvoiceItem, value); }}
            onRemoveItem={(id) => { removeItem(id); }}
          />

          <hr className="border-zinc-100" />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700">Catatan Tambahan</label>
            <textarea 
              placeholder="Tuliskan catatan tambahan (misalnya metode pembayaran, ucapan terima kasih, dll)..."
              rows={4}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-y"
              value={invoiceData.notes}
              onChange={(e) => { setInvoiceData({ ...invoiceData, notes: e.target.value }); }}
            />
          </div>
        </>
      }
      previewContent={<PDFViewerWrapper data={fullInvoiceData} />}
    />
  );
}
