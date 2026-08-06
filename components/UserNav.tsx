'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="text-xs text-slate-400 animate-pulse">Memuat...</div>;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/login"
          className="px-3.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-medium"
        >
          Masuk
        </Link>
        <Link
          href="/register"
          className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md transition-all"
        >
          Daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <Link
        href="/dashboard/documents"
        className="text-slate-300 hover:text-cyan-400 transition-colors font-medium"
      >
        Dashboard
      </Link>
      <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span className="font-semibold text-slate-200">{session.user.name || session.user.email}</span>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-xs text-slate-400 hover:text-rose-400 transition-colors font-medium cursor-pointer"
      >
        Keluar
      </button>
    </div>
  );
}
