"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n";
import { Globe } from "@phosphor-icons/react";

interface LanguageSwitcherProps {
  className?: string;
  showIcon?: boolean;
  variant?: "light" | "dark";
}

export function LanguageSwitcher({
  className = "",
  showIcon = true,
  variant = "light",
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useTranslation();

  const isDark = variant === "dark";

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-lg border text-xs font-semibold select-none ${
        isDark
          ? "bg-slate-800/80 border-slate-700/80 text-slate-300"
          : "bg-zinc-100/90 border-zinc-200/90 text-zinc-700"
      } ${className}`}
      aria-label="Select Language"
    >
      {showIcon && (
        <Globe
          className={`w-3.5 h-3.5 ml-1 shrink-0 ${
            isDark ? "text-slate-400" : "text-zinc-400"
          }`}
          weight="bold"
        />
      )}
      <button
        type="button"
        onClick={() => setLocale("id")}
        className={`px-2 py-0.5 rounded-md transition-all duration-150 cursor-pointer ${
          locale === "id"
            ? isDark
              ? "bg-slate-900 text-white shadow-xs font-bold"
              : "bg-white text-zinc-950 shadow-2xs font-bold"
            : isDark
              ? "text-slate-400 hover:text-slate-200"
              : "text-zinc-500 hover:text-zinc-900"
        }`}
        title="Bahasa Indonesia"
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`px-2 py-0.5 rounded-md transition-all duration-150 cursor-pointer ${
          locale === "en"
            ? isDark
              ? "bg-slate-900 text-white shadow-xs font-bold"
              : "bg-white text-zinc-950 shadow-2xs font-bold"
            : isDark
              ? "text-slate-400 hover:text-slate-200"
              : "text-zinc-500 hover:text-zinc-900"
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
