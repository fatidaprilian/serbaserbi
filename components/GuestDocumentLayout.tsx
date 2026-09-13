'use client';

import React, { ReactNode, useState } from "react";
import GuestPageHeader from "@/components/GuestPageHeader";
import { useTranslation } from "@/lib/i18n";
import { FileText, Eye } from "@phosphor-icons/react";

interface GuestDocumentLayoutProps {
  title: string;
  subtitle: string;
  formContent: ReactNode;
  previewContent: ReactNode;
}

export default function GuestDocumentLayout({
  title,
  subtitle,
  formContent,
  previewContent,
}: GuestDocumentLayoutProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] font-sans selection:bg-black selection:text-white relative overflow-x-hidden w-full max-w-full">
      {/* Premium subtle gradient blob clipped inside container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] max-w-[100vw] h-[400px] bg-gradient-to-b from-zinc-200/50 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="max-w-[1400px] mx-auto w-full min-w-0 p-4 sm:p-8 flex flex-col gap-6 sm:gap-8 z-10">
        <GuestPageHeader title={title} subtitle={subtitle} />

        {/* Mobile Tab Switcher (< xl) */}
        <div className="flex xl:hidden w-full p-1 bg-zinc-200/70 rounded-2xl shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex items-center justify-center gap-2 flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'form'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <FileText size={15} />
            <span>{t('generators.mobileTabForm')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center justify-center gap-2 flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Eye size={15} />
            <span>{t('generators.mobileTabPreview')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start w-full min-w-0">
          {/* FORM SECTION */}
          <section
            className={`bg-white border border-zinc-200/60 rounded-3xl p-4 sm:p-8 lg:p-10 shadow-premium flex-col gap-8 h-[calc(100vh-10rem)] overflow-y-auto w-full min-w-0 ${
              activeTab === 'form' ? 'flex' : 'hidden xl:flex'
            }`}
          >
            {formContent}
          </section>

          {/* PREVIEW SECTION */}
          <section
            className={`bg-zinc-100/50 rounded-3xl p-2 h-[calc(100vh-10rem)] border border-zinc-200/60 shadow-inner sticky top-8 overflow-hidden w-full min-w-0 ${
              activeTab === 'preview' ? 'block' : 'hidden xl:block'
            }`}
          >
            {previewContent}
          </section>
        </div>
      </div>
    </div>
  );
}

