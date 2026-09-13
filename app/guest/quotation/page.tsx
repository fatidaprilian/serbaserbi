"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { QuotationData, QuotationItem } from "../../../types/quotation";
import GuestDocumentLayout from "@/components/GuestDocumentLayout";
import LogoUpload from "@/components/LogoUpload";
import DocumentPartyForm from "@/components/forms/DocumentPartyForm";
import DocumentItemsForm from "@/components/forms/DocumentItemsForm";
import DocumentMetaForm from "@/components/forms/DocumentMetaForm";
import DocumentSaveToolbar from "@/components/DocumentSaveToolbar";
import DebouncedPDFPreview from "@/components/documents/DebouncedPDFPreview";
import { useDocumentItems } from "@/lib/hooks/useDocumentItems";
import { useTranslation } from "@/lib/i18n";
import { CheckCircle } from "@phosphor-icons/react";
import {
  DEFAULT_QUOTATION_NOTES,
  isDefaultQuotationNotes,
  convertCurrency,
} from "@/lib/document-presets";

const QuotationPDFWrapper = dynamic(
  () => import("../../../components/documents/QuotationPDFWrapper"),
  { ssr: false, loading: () => <div className="p-8 text-center text-emerald-500 bg-emerald-50/50 rounded-xl animate-pulse">Memuat Pratinjau...</div> }
);

export default function GuestQuotationPage() {
  const { t, locale } = useTranslation();
  const { items, setItems, addItem, updateItem, removeItem } = useDocumentItems<QuotationItem>([]);
  const [conversionToast, setConversionToast] = useState<string | null>(null);

  const [quotationData, setQuotationData] = useState<Omit<QuotationData, "items">>({
    currency: "IDR",
    language: locale || "id",
    logo: undefined,
    quotationNumber: "QT-2026-001",
    date: new Date().toISOString().split("T")[0],
    validUntil: "",
    fromName: "",
    fromAddress: "",
    clientName: "",
    clientAddress: "",
    taxRate: 0,
    notes: DEFAULT_QUOTATION_NOTES[locale || "id"],
  });

  const [prevLocale, setPrevLocale] = useState(locale);
  if (prevLocale !== locale) {
    setPrevLocale(locale);
    setQuotationData((prev) => {
      const nextNotes = isDefaultQuotationNotes(prev.notes)
        ? DEFAULT_QUOTATION_NOTES[locale]
        : prev.notes;
      return { ...prev, language: locale, notes: nextNotes };
    });
  }

  // Handle automatic currency conversion
  const handleCurrencyChange = async (newCurrency: "IDR" | "USD") => {
    if (newCurrency === quotationData.currency) return;

    let rate = 16250;
    try {
      const res = await fetch("/api/currency/rate?from=USD&to=IDR");
      if (res.ok) {
        const json = await res.json();
        if (typeof json.rate === "number" && json.rate > 0) {
          rate = json.rate;
        }
      }
    } catch {
      // Graceful fallback rate
    }

    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        unitPrice: convertCurrency(it.unitPrice, quotationData.currency, newCurrency, rate),
      }))
    );

    setQuotationData((prev) => ({ ...prev, currency: newCurrency }));
    setConversionToast(
      t("generators.currencyConvertedToast", {
        currency: newCurrency,
        rate: rate.toLocaleString("id-ID"),
      })
    );

    setTimeout(() => {
      setConversionToast(null);
    }, 4500);
  };

  const handleLanguageChange = (newLang: "id" | "en") => {
    setQuotationData((prev) => {
      const nextNotes = isDefaultQuotationNotes(prev.notes)
        ? DEFAULT_QUOTATION_NOTES[newLang]
        : prev.notes;
      return { ...prev, language: newLang, notes: nextNotes };
    });
  };

  const fullQuotationData: QuotationData = { ...quotationData, items };

  return (
    <GuestDocumentLayout
      title={t("generators.quotationTitle")}
      subtitle={t("home.cardQuotationDesc")}
      formContent={
        <>
          <DocumentSaveToolbar
            docType="quotation"
            documentNumber={quotationData.quotationNumber}
            issueDate={quotationData.date}
            validUntil={quotationData.validUntil}
            currency={quotationData.currency}
            notes={quotationData.notes}
            items={items.map((it) => ({
              description: it.description,
              quantity: it.quantity,
              rate: it.unitPrice,
              subtotal: it.quantity * it.unitPrice,
            }))}
            clientName={quotationData.clientName}
            clientAddress={quotationData.clientAddress}
            onApplyUserProfile={(profile) => {
              setQuotationData((prev) => ({
                ...prev,
                fromName: profile.fromName,
                fromAddress: profile.fromAddress,
                currency: (profile.defaultCurrency as 'IDR' | 'USD') || prev.currency,
                notes: profile.defaultNotes || prev.notes,
                logo: profile.logoUrl || prev.logo,
              }));
            }}
            onSelectClient={(client) => {
              setQuotationData((prev) => ({
                ...prev,
                clientName: client.name,
                clientAddress: client.address,
              }));
            }}
          />

          {conversionToast && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-medium shadow-2xs animate-in fade-in">
              <CheckCircle size={17} className="text-emerald-600 shrink-0" weight="fill" />
              <span>{conversionToast}</span>
            </div>
          )}

          <DocumentMetaForm
            currency={quotationData.currency}
            language={quotationData.language}
            onCurrencyChange={handleCurrencyChange}
            onLanguageChange={handleLanguageChange}
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
                value={quotationData.quotationNumber}
                onChange={(e) => { setQuotationData({ ...quotationData, quotationNumber: e.target.value }); }}
              />
              <input
                type="date"
                title={t("generators.docDate")}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                value={quotationData.date}
                onChange={(e) => { setQuotationData({ ...quotationData, date: e.target.value }); }}
              />
              <input
                type="date"
                title={t("generators.validUntil")}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
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
            <label className="text-sm font-medium text-zinc-700">{t("generators.paymentNotes")}</label>
            <textarea 
              placeholder={t("generators.paymentNotesPlaceholder")}
              rows={4}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-y"
              value={quotationData.notes}
              onChange={(e) => { setQuotationData({ ...quotationData, notes: e.target.value }); }}
            />
          </div>
        </>
      }
      previewContent={
        <DebouncedPDFPreview
          data={fullQuotationData}
          renderPreview={(debouncedData) => <QuotationPDFWrapper data={debouncedData} />}
        />
      }
    />
  );
}
