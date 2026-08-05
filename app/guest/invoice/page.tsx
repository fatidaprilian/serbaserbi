"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { InvoiceData, InvoiceItem } from "../../../types/invoice";
import GuestDocumentLayout from "@/components/GuestDocumentLayout";
import GuestItemizedDocumentForm from "@/components/forms/GuestItemizedDocumentForm";
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
        <GuestItemizedDocumentForm
          currency={invoiceData.currency}
          language={invoiceData.language}
          onCurrencyChange={(currency) => { setInvoiceData((prev) => ({ ...prev, currency })); }}
          onLanguageChange={(language) => { setInvoiceData((prev) => ({ ...prev, language })); }}
          metaFields={
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Nomor Invoice & Tanggal</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => { setInvoiceData((prev) => ({ ...prev, invoiceNumber: e.target.value })); }}
                />
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={invoiceData.date}
                  onChange={(e) => { setInvoiceData((prev) => ({ ...prev, date: e.target.value })); }}
                />
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={invoiceData.dueDate}
                  onChange={(e) => { setInvoiceData((prev) => ({ ...prev, dueDate: e.target.value })); }}
                />
              </div>
            </div>
          }
          logo={invoiceData.logo}
          onLogoChange={(logo) => { setInvoiceData((prev) => ({ ...prev, logo })); }}
          onLogoRemove={() => { setInvoiceData((prev) => ({ ...prev, logo: undefined })); }}
          fromName={invoiceData.fromName}
          fromAddress={invoiceData.fromAddress}
          clientName={invoiceData.clientName}
          clientAddress={invoiceData.clientAddress}
          onFromChange={(fields) => { setInvoiceData((prev) => ({ ...prev, ...fields, fromName: fields.name ?? prev.fromName, fromAddress: fields.address ?? prev.fromAddress })); }}
          onClientChange={(fields) => { setInvoiceData((prev) => ({ ...prev, clientName: fields.name ?? prev.clientName, clientAddress: fields.address ?? prev.clientAddress })); }}
          items={items}
          onAddItem={() => { addItem(); }}
          onItemChange={(id, field, value) => { updateItem(id, field, value); }}
          onRemoveItem={(id) => { removeItem(id); }}
          notes={invoiceData.notes}
          onNotesChange={(notes) => { setInvoiceData((prev) => ({ ...prev, notes })); }}
          notesPlaceholder="Tuliskan catatan tambahan (misalnya metode pembayaran, ucapan terima kasih, dll)..."
        />
      }
      previewContent={<PDFViewerWrapper data={fullInvoiceData} />}
    />
  );
}
