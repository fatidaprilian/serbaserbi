"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { InvoiceData, InvoiceItem } from "../../../types/invoice";
import GuestDocumentLayout from "@/components/GuestDocumentLayout";
import LogoUpload from "@/components/LogoUpload";
import DocumentPartyForm from "@/components/forms/DocumentPartyForm";
import DocumentItemsForm from "@/components/forms/DocumentItemsForm";
import DocumentMetaForm from "@/components/forms/DocumentMetaForm";
import DocumentSaveToolbar from "@/components/DocumentSaveToolbar";
import { useDocumentItems } from "@/lib/hooks/useDocumentItems";
import { useTranslation } from "@/lib/i18n";
import { WarningCircle } from "@phosphor-icons/react";

// Dynamic import for PDF Viewer to avoid SSR issues
const PDFViewerWrapper = dynamic(
  () => import("../../../components/documents/PDFViewerWrapper"),
  { ssr: false, loading: () => <div className="p-8 text-center text-blue-500 bg-blue-50/50 rounded-xl animate-pulse">Memuat Pratinjau PDF...</div> }
);

export default function GuestInvoicePage() {
  const { t } = useTranslation();
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
  const totalAmount = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const isMeteraiRequired = invoiceData.currency === "IDR" && totalAmount >= 5000000;

  return (
    <GuestDocumentLayout
      title={t("generators.invoiceTitle")}
      subtitle={invoiceData.currency === "USD" ? "Dual-currency USD/IDR with edge-cached FX rates." : "Lengkap dengan kalkulasi pajak & kepatuhan Bea Meterai."}
      formContent={
        <>
          <DocumentSaveToolbar
            docType="invoice"
            documentNumber={invoiceData.invoiceNumber}
            issueDate={invoiceData.date}
            dueDate={invoiceData.dueDate}
            currency={invoiceData.currency}
            notes={invoiceData.notes}
            items={items.map((it) => ({
              description: it.description,
              quantity: it.quantity,
              rate: it.unitPrice,
              subtotal: it.quantity * it.unitPrice,
            }))}
            clientName={invoiceData.clientName}
            clientAddress={invoiceData.clientAddress}
            meteraiRequired={isMeteraiRequired}
            onApplyUserProfile={(profile) => {
              setInvoiceData((prev) => ({
                ...prev,
                fromName: profile.fromName,
                fromAddress: profile.fromAddress,
                currency: (profile.defaultCurrency as 'IDR' | 'USD') || prev.currency,
                notes: profile.defaultNotes || prev.notes,
                logo: profile.logoUrl || prev.logo,
              }));
            }}
            onSelectClient={(client) => {
              setInvoiceData((prev) => ({
                ...prev,
                clientName: client.name,
                clientAddress: client.address,
              }));
            }}
          />

          {isMeteraiRequired && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 shadow-2xs animate-in fade-in">
              <WarningCircle size={20} className="text-amber-700 shrink-0 mt-0.5" weight="fill" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold">{t("generators.stampDutyWarningTitle")}</p>
                <p className="text-amber-800 leading-relaxed">{t("generators.stampDutyWarningDesc")}</p>
              </div>
            </div>
          )}

          <DocumentMetaForm
            currency={invoiceData.currency}
            language={invoiceData.language}
            onCurrencyChange={(currency) => { setInvoiceData({ ...invoiceData, currency }); }}
            onLanguageChange={(language) => { setInvoiceData({ ...invoiceData, language }); }}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-900">
              {t("generators.docNumber")} &amp; {t("generators.docDate")}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder={t("generators.docNumber")}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                value={invoiceData.invoiceNumber}
                onChange={(e) => { setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value }); }}
              />
              <input
                type="date"
                title={t("generators.docDate")}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                value={invoiceData.date}
                onChange={(e) => { setInvoiceData({ ...invoiceData, date: e.target.value }); }}
              />
              <input
                type="date"
                title={t("generators.dueDate")}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
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
            <label className="text-sm font-medium text-zinc-700">{t("generators.paymentNotes")}</label>
            <textarea 
              placeholder={t("generators.paymentNotesPlaceholder")}
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
