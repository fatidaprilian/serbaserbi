'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { useTranslation } from '@/lib/i18n';
import { ReactNode } from 'react';

function NavLink({ href, label, isMobile, pathname }: { href: string; label: string; isMobile?: boolean; pathname: string }) {
  const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
  const baseClasses = isMobile
    ? 'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all'
    : 'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all';
  const activeClasses = isActive
    ? isMobile
      ? 'bg-slate-800 text-cyan-400 border border-slate-700'
      : 'bg-slate-800 text-cyan-400 border border-slate-700/80 shadow-xs'
    : isMobile
      ? 'text-slate-400 hover:text-slate-200'
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900';

  return (
    <Link href={href} className={`${baseClasses} ${activeClasses}`}>
      {label}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('documents.title'), href: '/dashboard/documents' },
    { label: t('clients.title'), href: '/dashboard/clients' },
    { label: t('settings.title'), href: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-xl font-black bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent"
            >
              {t('common.appName')}
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} pathname={pathname} />
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/guest/invoice"
              className="hidden sm:inline-flex text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors"
            >
              + {t('nav.createInvoice')}
            </Link>
            <UserNav />
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="md:hidden flex border-t border-slate-800/80 px-4 py-2 gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} isMobile pathname={pathname} />
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
