"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ContractData, ContractClause } from "../../../types/contract";
import GuestDocumentLayout from "@/components/GuestDocumentLayout";
import LogoUpload from "@/components/LogoUpload";
import ContractPartyForm from "@/components/forms/ContractPartyForm";
import DocumentSaveToolbar from "@/components/DocumentSaveToolbar";
import DebouncedPDFPreview from "@/components/documents/DebouncedPDFPreview";
import { useSession } from "next-auth/react";
import { ShieldCheck, WarningCircle, ArrowSquareOut, CheckCircle } from "@phosphor-icons/react";
import { useTranslation } from "@/lib/i18n";
import {
  DEFAULT_CONTRACT_CLAUSES,
  isDefaultContractClauses,
  convertCurrency,
} from "@/lib/document-presets";

// Dynamic import for PDF Viewer to avoid SSR issues
const ContractPDFWrapper = dynamic(
  () => import("../../../components/documents/ContractPDFWrapper"),
  { ssr: false, loading: () => <div className="p-8 text-center text-indigo-500 bg-indigo-50/50 rounded-xl animate-pulse">Memuat Pratinjau...</div> }
);

export default function GuestContractPage() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const { t, locale } = useTranslation();
  const [loadingClauses, setLoadingClauses] = useState(false);
  const [clausesError, setClausesError] = useState<string | null>(null);
  const [conversionToast, setConversionToast] = useState<string | null>(null);

  const [contractData, setContractData] = useState<ContractData>({
    contractNumber: "SPK-2026-001",
    date: new Date().toISOString().split("T")[0],
    currency: "IDR",
    language: locale || "id",
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
    clauses: DEFAULT_CONTRACT_CLAUSES[locale || "id"],
  });

  const [prevLocale, setPrevLocale] = useState(locale);
  if (prevLocale !== locale) {
    setPrevLocale(locale);
    setContractData((prev) => {
      const nextClauses = isDefaultContractClauses(prev.clauses)
        ? DEFAULT_CONTRACT_CLAUSES[locale]
        : prev.clauses;
      return {
        ...prev,
        language: locale,
        clauses: nextClauses,
        partyA: { ...prev.partyA, role: t("generators.partyARole") },
        partyB: { ...prev.partyB, role: t("generators.partyBRole") },
      };
    });
  }

  // Handle automatic currency conversion for contract
  const handleCurrencyChange = async (newCurrency: "IDR" | "USD") => {
    if (newCurrency === contractData.currency) return;

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

    const convertedVal = convertCurrency(
      contractData.projectValue,
      contractData.currency,
      newCurrency,
      rate
    );

    setContractData((prev) => ({
      ...prev,
      currency: newCurrency,
      projectValue: convertedVal,
    }));

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
    setContractData((prev) => {
      const nextClauses = isDefaultContractClauses(prev.clauses)
        ? DEFAULT_CONTRACT_CLAUSES[newLang]
        : prev.clauses;
      return {
        ...prev,
        language: newLang,
        clauses: nextClauses,
        partyA: { ...prev.partyA, role: newLang === "en" ? "First Party (Client / Employer)" : "Pihak Pertama (Pemberi Kerja)" },
        partyB: { ...prev.partyB, role: newLang === "en" ? "Second Party (Service Provider)" : "Pihak Kedua (Penyedia Jasa)" },
      };
    });
  };

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
      setClausesError(t('common.error'));
    } finally {
      setLoadingClauses(false);
    }
  };

  const handleAddClause = () => {
    setContractData({
      ...contractData,
      clauses: [
        ...contractData.clauses,
        {
          id: Date.now().toString(),
          title: contractData.language === "en" ? "New Article" : "Klausul Baru",
          content: "",
        },
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
      title={t("generators.contractTitle")}
      subtitle={t("home.cardContractDesc")}
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

          {conversionToast && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-medium shadow-2xs animate-in fade-in">
              <CheckCircle size={17} className="text-emerald-600 shrink-0" weight="fill" />
              <span>{conversionToast}</span>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">
              {t("generators.metaTitle")}
            </h2>
            
            <LogoUpload 
              logo={contractData.logo}
              onLogoChange={(logo) => { setContractData({ ...contractData, logo }); }}
              onLogoRemove={() => { setContractData({ ...contractData, logo: undefined }); }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-900">{t("generators.docNumber")}</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                  value={contractData.contractNumber}
                  onChange={(e) => { setContractData({ ...contractData, contractNumber: e.target.value }); }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-900">{t("generators.docDate")}</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                  value={contractData.date}
                  onChange={(e) => { setContractData({ ...contractData, date: e.target.value }); }}
                />
              </div>
            </div>

            {/* Project Title & Project Value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-900">{t("generators.projectTitle")}</label>
                <input 
                  type="text" 
                  placeholder={t("generators.projectTitlePlaceholder")}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                  value={contractData.projectTitle}
                  onChange={(e) => { setContractData({ ...contractData, projectTitle: e.target.value }); }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-900">
                  {t("generators.projectValue", { currency: contractData.currency })}
                </label>
                <input 
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                  value={contractData.projectValue === 0 ? '' : contractData.projectValue}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => {
                    const val = e.target.value;
                    const parsed = val === '' ? 0 : Math.max(0, Number(val));
                    setContractData({ ...contractData, projectValue: parsed });
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-900">{t("generators.projectDuration")}</label>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="date" 
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                  value={contractData.startDate}
                  onChange={(e) => { setContractData({ ...contractData, startDate: e.target.value }); }}
                />
                <input 
                  type="date" 
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                  value={contractData.endDate}
                  onChange={(e) => { setContractData({ ...contractData, endDate: e.target.value }); }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-900">{t("common.currency")}</label>
                <select 
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium cursor-pointer"
                  value={contractData.currency}
                  onChange={(e) => { void handleCurrencyChange(e.target.value as "IDR" | "USD"); }}
                >
                  <option value="IDR">IDR (Rupiah)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-900">PDF</label>
                <select 
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium cursor-pointer"
                  value={contractData.language}
                  onChange={(e) => { handleLanguageChange(e.target.value as "id" | "en"); }}
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English (PDF)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Para Pihak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ContractPartyForm
              party={contractData.partyA}
              roleTitle={t("generators.partyARole")}
              onChange={(fields) => { setContractData({ ...contractData, partyA: { ...contractData.partyA, ...fields } }); }}
            />
            <ContractPartyForm
              party={contractData.partyB}
              roleTitle={t("generators.partyBRole")}
              onChange={(fields) => { setContractData({ ...contractData, partyB: { ...contractData.partyB, ...fields } }); }}
            />
          </div>

          {/* Pasal / Klausul */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-2">
              <h2 className="text-lg font-bold text-slate-900">{t("generators.legalClausesTitle")}</h2>
              <div className="flex items-center gap-2">
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => { void handleSuggestClauses(); }}
                    disabled={loadingClauses}
                    className="px-3 py-1.5 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-2xs"
                    title={t("generators.aiSuggestClauses")}
                  >
                    <ShieldCheck size={14} />
                    <span>{loadingClauses ? t("generators.aiGenerating") : t("generators.aiSuggestClauses")}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddClause}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  {t("generators.addClause")}
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
                    {t("nav.settings")}
                    <ArrowSquareOut size={12} />
                  </a>
                )}
              </div>
            )}

            <div className="flex flex-col gap-4">
              {contractData.clauses.map((clause, index) => (
                <div key={clause.id} className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm relative group">
                  <button onClick={() => { handleRemoveClause(clause.id); }} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xl leading-none cursor-pointer" title={t("common.delete")}>
                    &times;
                  </button>
                  <div className="flex flex-col gap-1 pr-6">
                    <label className="text-xs font-semibold text-slate-500">{t("generators.clauseTitle")} {index + 1}</label>
                    <input type="text" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all" value={clause.title} onChange={(e) => { handleClauseChange(clause.id, "title", e.target.value); }} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">{t("generators.clauseContent")}</label>
                    <textarea rows={4} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500 transition-all resize-y leading-relaxed" value={clause.content} onChange={(e) => { handleClauseChange(clause.id, "content", e.target.value); }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      }
      previewContent={
        <DebouncedPDFPreview
          data={contractData}
          renderPreview={(debouncedData) => <ContractPDFWrapper data={debouncedData} />}
        />
      }
    />
  );
}
