import React from "react";

interface DocumentMetaFormProps {
  currency: string;
  language: string;
  onCurrencyChange: (currency: "IDR" | "USD") => void;
  onLanguageChange: (language: "id" | "en") => void;
}

// minimal: shared currency and language dropdown selectors
export default function DocumentMetaForm({
  currency,
  language,
  onCurrencyChange,
  onLanguageChange,
}: DocumentMetaFormProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700">Mata Uang & Bahasa</label>
      <div className="grid grid-cols-2 gap-2">
        <select
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={currency}
          onChange={(e) => {
            onCurrencyChange(e.target.value as "IDR" | "USD");
          }}
        >
          <option value="IDR">IDR</option>
          <option value="USD">USD</option>
        </select>
        <select
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={language}
          onChange={(e) => {
            onLanguageChange(e.target.value as "id" | "en");
          }}
        >
          <option value="id">Indonesia</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  );
}
