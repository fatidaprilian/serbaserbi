'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface UserNavProps {
  variant?: 'light' | 'dark';
}

export function UserNav({ variant = 'light' }: UserNavProps) {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const isDark = variant === 'dark';

  if (status === 'loading') {
    return (
      <div className={`text-xs animate-pulse ${isDark ? 'text-slate-500' : 'text-zinc-400'}`}>
        {t('common.loading')}
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <LanguageSwitcher variant={variant} />
        <Link
          href="/login"
          className={`px-3 py-1.5 rounded-xl transition-all font-medium ${
            isDark
              ? 'text-slate-300 hover:text-white hover:bg-slate-800'
              : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80'
          }`}
        >
          {t('nav.signIn')}
        </Link>
        <Link
          href="/register"
          className={`px-3.5 py-1.5 rounded-xl font-medium shadow-xs transition-all active:scale-[0.98] ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              : 'bg-zinc-900 hover:bg-black text-white'
          }`}
        >
          {t('nav.register')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <LanguageSwitcher variant={variant} />
      <Link
        href="/dashboard"
        className={`transition-colors font-medium text-xs sm:text-sm ${
          isDark ? 'text-slate-300 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
        }`}
      >
        {t('nav.dashboard')}
      </Link>
      <div
        className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
          isDark
            ? 'bg-slate-800/90 border-slate-700/80 text-slate-200'
            : 'bg-zinc-100/80 border-zinc-200/80 text-zinc-800'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span className="font-medium text-xs">{session.user.name || session.user.email}</span>
      </div>
      <button
        type="button"
        onClick={() => void signOut({ callbackUrl: '/' })}
        className={`text-xs transition-colors font-medium cursor-pointer ${
          isDark
            ? 'text-slate-400 hover:text-rose-400'
            : 'text-zinc-500 hover:text-rose-600'
        }`}
      >
        {t('nav.signOut')}
      </button>
    </div>
  );
}
