import React, { ReactNode } from "react";
import GuestPageHeader from "@/components/GuestPageHeader";

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
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] font-sans selection:bg-black selection:text-white">
      {/* Premium subtle gradient blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-zinc-200/50 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto w-full p-4 sm:p-8 flex flex-col gap-8 z-10">
        <GuestPageHeader title={title} subtitle={subtitle} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {/* FORM SECTION */}
          <section className="bg-white border border-zinc-200/60 rounded-3xl p-6 sm:p-10 shadow-premium flex flex-col gap-8 h-[calc(100vh-10rem)] overflow-y-auto">
            {formContent}
          </section>

          {/* PREVIEW SECTION */}
          <section className="bg-zinc-100/50 rounded-3xl p-2 h-[calc(100vh-10rem)] border border-zinc-200/60 shadow-inner sticky top-8 overflow-hidden">
            {previewContent}
          </section>
        </div>
      </div>
    </div>
  );
}
