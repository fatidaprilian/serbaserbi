'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button, Badge, LayerCard } from '@cloudflare/kumo';
import {
  Receipt,
  FileText,
  Handshake,
  Users,
  Gear,
  ArrowRight,
  Plus,
} from '@phosphor-icons/react';

export default function DashboardOverviewPage() {
  const { data: session } = useSession();

  const userName = session?.user?.name || 'Freelancer';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Workspace Aktif
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
            Selamat datang kembali, {userName}
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Buat, kelola, dan pantau seluruh transaksi legal dan keuangan Anda. Seluruh dokumen terformat rapi sesuai ketentuan Indonesia dan siap cetak.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/guest/invoice">
              <Button variant="primary" className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer">
                <Plus size={14} weight="bold" />
                Buat Invoice Baru
              </Button>
            </Link>

            <Link href="/guest/quotation">
              <Button variant="secondary" className="text-xs px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-medium flex items-center gap-1.5 cursor-pointer">
                <FileText size={14} />
                Buat Penawaran
              </Button>
            </Link>

            <Link href="/guest/contract">
              <Button variant="secondary" className="text-xs px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-medium flex items-center gap-1.5 cursor-pointer">
                <Handshake size={14} />
                Buat Kontrak (SPK)
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Documents Card */}
        <Link href="/dashboard/documents" className="block group">
          <LayerCard className="h-full bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 p-6 rounded-2xl transition-all duration-300 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Receipt size={24} weight="duotone" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                  Riwayat & Dokumen
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Pantau seluruh invoice, penawaran, dan kontrak kerja. Kelola status pembayaran mulai dari draft hingga lunas.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
              Buka Dokumen
              <ArrowRight size={14} className="ml-1" />
            </div>
          </LayerCard>
        </Link>

        {/* Clients Card */}
        <Link href="/dashboard/clients" className="block group">
          <LayerCard className="h-full bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 p-6 rounded-2xl transition-all duration-300 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Users size={24} weight="duotone" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-purple-400 transition-colors">
                  Daftar Klien
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Simpan profil kontak dan alamat klien Anda untuk pengisian otomatis saat membuat tagihan atau kontrak baru.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
              Kelola Klien
              <ArrowRight size={14} className="ml-1" />
            </div>
          </LayerCard>
        </Link>

        {/* Settings Card */}
        <Link href="/dashboard/settings" className="block group">
          <LayerCard className="h-full bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 p-6 rounded-2xl transition-all duration-300 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Gear size={24} weight="duotone" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Pengaturan Usaha
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Atur identitas bisnis, NPWP, nomor telepon, logo usaha, rekening bank default, dan catatan termin pembayaran.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
              Atur Profil
              <ArrowRight size={14} className="ml-1" />
            </div>
          </LayerCard>
        </Link>
      </div>
    </div>
  );
}
