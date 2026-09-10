"use client";

import Link from "next/link";
import { UserNav } from "@/components/UserNav";
import { useTranslation } from "@/lib/i18n";
import { Receipt, FileText, Handshake, ArrowUpRight } from "@phosphor-icons/react";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] font-sans selection:bg-black selection:text-white">
      {/* Top Navbar */}
      <nav className="w-full border-b border-zinc-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight text-zinc-900">
            {t("common.appName")}
          </Link>
          <UserNav />
        </div>
      </nav>

      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-zinc-200/50 to-transparent blur-3xl -z-10 rounded-full" />

      <main className="max-w-5xl mx-auto px-6 pt-24 pb-24 flex flex-col items-center z-10">
        
        {/* Hero */}
        <header className="flex flex-col items-center text-center gap-5 mb-16 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 leading-[1.15]">
            {t("home.heroTitle")}
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 font-normal max-w-2xl leading-relaxed tracking-tight">
            {t("home.heroSubtitle")}
          </p>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-5 w-full">
          
          {/* Invoice Card (Large) */}
          <Link
            href="/guest/invoice"
            className="group md:col-span-4 relative flex flex-col justify-between p-8 sm:p-10 rounded-3xl bg-white border border-zinc-200/90 shadow-sm hover:shadow-xl hover:border-cyan-400/60 transition-all duration-300 overflow-hidden min-h-[300px] cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200/80 flex items-center justify-center text-cyan-700 group-hover:scale-105 transition-transform">
                <Receipt size={28} weight="duotone" />
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                <ArrowUpRight size={18} weight="bold" />
              </div>
            </div>

            <div className="pt-8">
              <div className="text-xs font-semibold text-cyan-800 uppercase tracking-wider mb-1.5">
                {t("nav.createInvoice")}
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2 group-hover:text-cyan-800 transition-colors">
                {t("home.cardInvoiceTitle")}
              </h2>
              <p className="text-zinc-600 text-sm max-w-md leading-relaxed">
                {t("home.cardInvoiceDesc")}
              </p>
            </div>
          </Link>

          {/* Quotation Card (Small) */}
          <Link
            href="/guest/quotation"
            className="group md:col-span-2 relative flex flex-col justify-between p-8 rounded-3xl bg-white border border-zinc-200/90 shadow-sm hover:shadow-xl hover:border-indigo-400/60 transition-all duration-300 min-h-[300px] cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-700 group-hover:scale-105 transition-transform">
                <FileText size={28} weight="duotone" />
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <ArrowUpRight size={18} weight="bold" />
              </div>
            </div>

            <div className="pt-8">
              <div className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-1.5">
                {t("nav.createQuotation")}
              </div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-2 group-hover:text-indigo-800 transition-colors">
                {t("home.cardQuotationTitle")}
              </h2>
              <p className="text-zinc-600 text-sm leading-relaxed">
                {t("home.cardQuotationDesc")}
              </p>
            </div>
          </Link>

          {/* Contract Card (Wide) */}
          <Link
            href="/guest/contract"
            className="group md:col-span-6 relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 sm:p-10 rounded-3xl bg-white border border-zinc-200/90 shadow-sm hover:shadow-xl hover:border-purple-400/60 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-700 shrink-0 group-hover:scale-105 transition-transform">
                <Handshake size={28} weight="duotone" />
              </div>
              <div className="max-w-2xl">
                <div className="text-xs font-semibold text-purple-800 uppercase tracking-wider mb-1">
                  {t("nav.createContract")}
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-1.5 group-hover:text-purple-800 transition-colors">
                  {t("home.cardContractTitle")}
                </h2>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  {t("home.cardContractDesc")}
                </p>
              </div>
            </div>

            <div className="mt-6 sm:mt-0 w-11 h-11 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
              <ArrowUpRight size={20} weight="bold" />
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}
