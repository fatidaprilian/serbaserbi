'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function RegisterPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    npwp: '',
    defaultCurrency: 'IDR',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('common.error'));
        setLoading(false);
      } else {
        router.push('/login?registered=1');
      }
    } catch {
      setError(t('common.error'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fafafa] text-[#09090b] selection:bg-black selection:text-white p-4 relative overflow-hidden py-6">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-zinc-200/50 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-5xl mx-auto py-4 flex items-center justify-between z-10">
        <Link href="/" className="font-bold text-xl tracking-tighter text-zinc-900">
          {t('common.appName')}
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            {t('nav.backToHome')}
          </Link>
        </div>
      </header>

      {/* Main Registration Card */}
      <main className="w-full max-w-lg mx-auto my-auto z-10">
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 sm:p-10 shadow-premium transition-all">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-2">
              {t('auth.signUpTitle')}
            </h1>
            <p className="text-sm text-zinc-500 font-light leading-relaxed">
              {t('auth.signUpSubtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                {t('auth.nameLabel')} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => { handleChange('name', e.target.value); }}
                placeholder={locale === 'id' ? 'contoh: Budi Santoso' : 'John Doe'}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50/80 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                {t('auth.emailLabel')} *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => { handleChange('email', e.target.value); }}
                placeholder={locale === 'id' ? 'budi@freelance.id' : 'name@company.com'}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50/80 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                {t('auth.passwordLabel')} *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => { handleChange('password', e.target.value); }}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50/80 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  {t('settings.businessName')} ({t('common.optional')})
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => { handleChange('businessName', e.target.value); }}
                  placeholder="Studio Pixel"
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50/80 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  {t('common.currency')}
                </label>
                <select
                  value={formData.defaultCurrency}
                  onChange={(e) => { handleChange('defaultCurrency', e.target.value); }}
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50/80 border border-zinc-200 text-zinc-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all text-sm cursor-pointer"
                >
                  <option value="IDR">IDR (Rupiah)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl font-semibold text-sm bg-zinc-900 hover:bg-black text-white shadow-md active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? t('common.loading') : t('auth.btnSignUp')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-100 text-center text-xs text-zinc-500">
            <p>
              {t('auth.haveAccount')}{' '}
              <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
                {t('auth.btnSignIn')}
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-zinc-400">
        &copy; {new Date().getFullYear()} {t('common.appName')} • {t('home.footerTagline')}
      </footer>
    </div>
  );
}
