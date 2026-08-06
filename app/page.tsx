import Link from "next/link";
import { UserNav } from "@/components/UserNav";

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

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center z-10">
        
        {/* Hero */}
        <header className="flex flex-col items-center text-center gap-6 mb-20 max-w-3xl">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-zinc-900 leading-[1.1]">
            Dokumen profesional, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500">
              tanpa kerumitan.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-500 font-light max-w-2xl leading-relaxed tracking-tight">
            Buat invoice, surat penawaran, dan kontrak kerja langsung dari browser Anda. Siap cetak, mendukung dua bahasa, dan terformat sempurna.
          </p>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 w-full">
          
          {/* Invoice Card (Large) */}
          <Link href="/guest/invoice" className="group md:col-span-4 relative flex flex-col justify-end p-8 sm:p-10 rounded-3xl bg-white border border-zinc-200/60 shadow-premium hover:shadow-premium-hover transition-all duration-500 overflow-hidden min-h-[300px] cursor-pointer">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-2">Buat Invoice</h2>
              <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">
                Buat tagihan profesional dengan dukungan dual-currency IDR & USD. Otomatis hitung total, pajak, dan kelengkapan bea meterai.
              </p>
            </div>
            <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </Link>

          {/* Quotation Card (Small) */}
          <Link href="/guest/quotation" className="group md:col-span-2 relative flex flex-col justify-end p-8 rounded-3xl bg-white border border-zinc-200/60 shadow-premium hover:shadow-premium-hover transition-all duration-500 min-h-[300px] cursor-pointer">
            <div className="relative z-10">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900 mb-2">Penawaran</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Kirim estimasi biaya atau surat penawaran (*Quotation*) yang elegan ke calon klien Anda.
              </p>
            </div>
          </Link>

          {/* Contract Card (Wide) */}
          <Link href="/guest/contract" className="group md:col-span-6 relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 sm:p-10 rounded-3xl bg-zinc-900 text-white shadow-premium hover:shadow-premium-hover transition-all duration-500 cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight mb-2">Kontrak Kerja (SPK)</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Amankan proyek freelance Anda dengan surat perjanjian kerja berbasis standar hukum yang berlaku. Mendukung bahasa Indonesia dan Inggris.
              </p>
            </div>
            <div className="relative z-10 mt-6 sm:mt-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}
