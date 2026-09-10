"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n";
import { Globe } from "@phosphor-icons/react";

interface LanguageSwitcherProps {
  className?: string;
  showIcon?: boolean;
}

export function LanguageSwitcher({ className = "", showIcon = true }: LanguageSwitcherProps) {
  const { locale, setLocale } = useTranslation();

  return (
    <div
      className={`inline-flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/80 text-xs font-semibold select-none ${className}`}
      aria-label="Select Language"
    >
      {showIcon && (
        <Globe
          className="w-3.5 h-3.5 ml-1 text-slate-500 dark:text-slate-400 shrink-0"
          weight="bold"
        />
      )}
      <button
        type="button"
        onClick={() => setLocale("id")}
        className={`px-2 py-1 rounded-md transition-all duration-150 ${
          locale === "id"
            ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs font-bold"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
        title="Bahasa Indonesia"
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`px-2 py-1 rounded-md transition-all duration-150 ${
          locale === "en"
            ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs font-bold"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
