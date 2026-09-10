"use client";

import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";
import { ArrowLeft } from "@phosphor-icons/react";

interface GuestPageHeaderProps {
  title: string;
  subtitle: string;
}

export default function GuestPageHeader({ title, subtitle }: GuestPageHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between pb-6 border-b border-zinc-200">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-xs text-zinc-700 hover:text-zinc-900"
          aria-label={t("nav.backToHome")}
          title={t("nav.backToHome")}
        >
          <ArrowLeft size={18} weight="bold" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
      </div>
    </header>
  );
}
