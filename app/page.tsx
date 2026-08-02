import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 sm:p-12 font-sans relative overflow-hidden">
      
      {/* Background gradients for Kumo UI premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none" />

      <main className="max-w-4xl w-full z-10 flex flex-col items-center gap-12 text-center">
        
        <header className="flex flex-col gap-4">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900">
            Freelance Invoicer
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto font-light">
            Solusi praktis untuk mengelola tagihan, surat penawaran, dan kontrak kerja 
            freelance Anda tanpa ribet.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          <Link 
            href="/guest/invoice" 
            className="group flex flex-col gap-3 p-6 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200 text-left cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
              Buat Invoice
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Generate tagihan profesional dengan dukungan mata uang IDR & USD.
              Otomatis kalkulasi total dan pajak.
            </p>
          </Link>
          
          <Link 
            href="/guest/quotation" 
            className="group flex flex-col gap-3 p-6 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200 text-left cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
              Surat Penawaran
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Kirim estimasi biaya atau quotation elegan ke calon klien sebelum proyek dimulai.
            </p>
          </Link>

          <Link 
            href="/guest/contract" 
            className="group flex flex-col gap-3 p-6 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200 text-left cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
              Kontrak Kerja
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Amankan proyek freelance Anda dengan surat perjanjian kerja berbasis standar hukum yang berlaku.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
