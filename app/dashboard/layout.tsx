'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { useTranslation } from '@/lib/i18n';
import { ReactNode } from 'react';

function NavLink({ href, label, isMobile, pathname }: { href: string; label: string; isMobile?: boolean; pathname: string }) {
  const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
  const baseClasses = isMobile
    ? 'px-3 py-1.5 rounded-lg text-xs transition-all'
    : 'px-3.5 py-2 rounded-xl text-xs transition-all';
  const activeClasses = isActive
    ? isMobile
      ? 'bg-zinc-100 text-zinc-950 border border-zinc-200/90 font-bold shadow-2xs'
      : 'bg-zinc-100 text-zinc-950 border border-zinc-200/90 shadow-2xs font-bold'
    : isMobile
      ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 font-medium'
      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 font-medium';

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
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] font-sans selection:bg-black selection:text-white flex flex-col relative overflow-x-hidden">
      {/* Subtle background glow matching homepage */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-zinc-200/50 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

      {/* Header Bar */}
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="font-black text-xl tracking-tight text-zinc-900"
            >
              {t('common.appName')}
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} pathname={pathname} />
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/guest/invoice"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-zinc-100/90 hover:bg-zinc-200/90 border border-zinc-200/80 transition-all shadow-2xs cursor-pointer"
            >
              + {t('nav.createInvoice')}
            </Link>
            <UserNav variant="light" />
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="md:hidden flex border-t border-zinc-200/80 bg-white/95 px-4 py-2 gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} isMobile pathname={pathname} />
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        {children}
      </main>
    </div>
  );
}
