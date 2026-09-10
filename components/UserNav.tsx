'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function UserNav() {
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  if (status === 'loading') {
    return <div className="text-xs text-zinc-400 animate-pulse">{t('common.loading')}</div>;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <LanguageSwitcher />
        <Link
          href="/login"
          className="px-3 py-1.5 rounded-xl text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 transition-all font-medium"
        >
          {t('nav.signIn')}
        </Link>
        <Link
          href="/register"
          className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-medium shadow-xs transition-all active:scale-[0.98]"
        >
          {t('nav.register')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <LanguageSwitcher />
      <Link
        href="/dashboard/documents"
        className="text-zinc-600 hover:text-zinc-900 transition-colors font-medium"
      >
        {t('nav.dashboard')}
      </Link>
      <div className="hidden sm:flex items-center gap-2 bg-zinc-100/80 px-3 py-1.5 rounded-xl border border-zinc-200/80">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span className="font-medium text-zinc-800 text-xs">{session.user.name || session.user.email}</span>
      </div>
      <button
        onClick={() => void signOut({ callbackUrl: '/' })}
        className="text-xs text-zinc-500 hover:text-rose-600 transition-colors font-medium cursor-pointer"
      >
        {t('nav.signOut')}
      </button>
    </div>
  );
}
