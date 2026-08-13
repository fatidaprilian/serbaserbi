'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="text-xs text-zinc-400 animate-pulse">Memuat...</div>;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/login"
          className="px-4 py-2 rounded-xl text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 transition-all font-medium"
        >
          Masuk
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white font-medium shadow-sm transition-all active:scale-[0.98]"
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
        className="text-zinc-600 hover:text-zinc-900 transition-colors font-medium"
      >
        Dashboard
      </Link>
      <div className="flex items-center gap-2 bg-zinc-100/80 px-3 py-1.5 rounded-xl border border-zinc-200/80">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span className="font-medium text-zinc-800">{session.user.name || session.user.email}</span>
      </div>
      <button
        onClick={() => void signOut({ callbackUrl: '/' })}
        className="text-xs text-zinc-500 hover:text-rose-600 transition-colors font-medium cursor-pointer"
      >
        Keluar
      </button>
    </div>
  );
}
