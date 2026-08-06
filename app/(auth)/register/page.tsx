'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
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
        setError(data.error || 'Gagal memproses pendaftaran akun baru.');
        setLoading(false);
      } else {
        router.push('/login?registered=1');
      }
    } catch {
      setError('Terjadi kendala koneksi ke server.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fafafa] text-[#09090b] selection:bg-black selection:text-white p-4 relative overflow-hidden py-6">
      {/* Background ambient glow matching homepage */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-zinc-200/50 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-5xl mx-auto py-4 flex items-center justify-between z-10">
        <Link href="/" className="font-bold text-xl tracking-tighter text-zinc-900">
          SerbaSerbi
        </Link>
        <Link
          href="/"
          className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </header>

      {/* Main Registration Card */}
      <main className="w-full max-w-lg mx-auto my-auto z-10">
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 sm:p-10 shadow-premium transition-all">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-2">
              Pendaftaran Akun Baru
            </h1>
            <p className="text-sm text-zinc-500 font-light leading-relaxed">
              Mulai otomatiskan pembuatan dokumen, simpan data klien, dan kelola profil usaha Anda.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap / Nama Freelancer *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="contoh: Budi Santoso"
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50/80 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Alamat Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="budi@freelance.id"
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50/80 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Kata Sandi / Password * (minimal 6 karakter)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Buat kata sandi aman"
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50/80 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Nama Usaha / Brand (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  placeholder="contoh: Studio Pixel"
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50/80 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Nomor NPWP (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.npwp}
                  onChange={(e) => handleChange('npwp', e.target.value)}
                  placeholder="12.345.678.9-012.000"
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50/80 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Mata Uang Utama Dokumen
              </label>
              <select
                value={formData.defaultCurrency}
                onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50/80 border border-zinc-200 text-zinc-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all text-sm"
              >
                <option value="IDR">IDR (Rupiah Indonesia)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl font-semibold text-sm bg-zinc-900 hover:bg-black text-white shadow-md active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Membuat Akun Baru...' : 'Daftarkan Akun'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-100 text-center text-xs text-zinc-500">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
              Masuk ke Akun Anda
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-zinc-400">
        &copy; {new Date().getFullYear()} SerbaSerbi Freelance Invoicer
      </footer>
    </div>
  );
}
