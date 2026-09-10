import Link from "next/link";
import { UserNav } from "@/components/UserNav";
import { Receipt, FileText, Handshake, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] font-sans selection:bg-black selection:text-white">
      {/* Top Navbar */}
      <nav className="w-full border-b border-zinc-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight text-zinc-900">
            SerbaSerbi
          </Link>
          <UserNav />
        </div>
      </nav>

      {/* Premium subtle gradient blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-zinc-200/50 to-transparent blur-3xl -z-10 rounded-full" />

      <main className="max-w-5xl mx-auto px-6 pt-24 pb-24 flex flex-col items-center z-10">
        
        {/* Hero */}
        <header className="flex flex-col items-center text-center gap-5 mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-xs font-semibold text-zinc-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Generator Dokumen Legal & Finansial Freelancer
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 leading-[1.15]">
            Dokumen profesional, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500">
              tanpa kerumitan.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 font-normal max-w-2xl leading-relaxed tracking-tight">
            Buat tagihan invoice, surat penawaran harga, dan kontrak kerja resmi langsung di browser Anda. Siap cetak PDF, bilingual (ID/EN), aman dan terformat rapi.
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
                Tagihan Pembayaran
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2 group-hover:text-cyan-800 transition-colors">
                Buat Invoice
              </h2>
              <p className="text-zinc-600 text-sm max-w-md leading-relaxed">
                Buat tagihan profesional dengan kalkulasi otomatis pajak, dual-currency (IDR & USD), peringatan bea meterai, dan pelacakan pembayaran termin/DP.
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
                Estimasi Biaya
              </div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-2 group-hover:text-indigo-800 transition-colors">
                Surat Penawaran
              </h2>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Kirim proposal harga formal (*Quotation*) dengan masa berlaku penawaran yang jelas ke calon klien Anda.
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
                  Perjanjian Kerja Sama
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-1.5 group-hover:text-purple-800 transition-colors">
                  Kontrak Kerja (Surat Perjanjian Kerja / SPK)
                </h2>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  Lindungi proyek dan hak cipta Anda dengan kontrak kerja standar hukum Indonesia. Dilengkapi generator klausul profesional dan blok tanda tangan para pihak.
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
