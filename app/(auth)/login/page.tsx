'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Email atau kata sandi yang Anda masukkan salah. Silakan periksa kembali.');
        setLoading(false);
      } else {
        router.push('/dashboard/documents');
        router.refresh();
      }
    } catch {
      setError('Terjadi kendala pada sistem. Silakan coba beberapa saat lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fafafa] text-[#09090b] selection:bg-black selection:text-white p-4 relative overflow-hidden">
      {/* Premium subtle gradient background matching homepage */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-zinc-200/50 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-5xl mx-auto py-6 flex items-center justify-between z-10">
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

      {/* Main Login Card */}
      <main className="w-full max-w-md mx-auto my-auto z-10">
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 sm:p-10 shadow-premium transition-all">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-2">
              Masuk ke Akun Anda
            </h1>
            <p className="text-sm text-zinc-500 font-light leading-relaxed">
              Akses dashboard dokumen, kelola riwayat klien, dan atur profil usaha Anda secara otomatis.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                Alamat Email Terdaftar
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh: budi@freelance.id"
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50/80 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                Kata Sandi / Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi akun"
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50/80 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl font-semibold text-sm bg-zinc-900 hover:bg-black text-white shadow-md active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Memverifikasi Data...' : 'Masuk ke Dashboard'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col gap-3 text-center text-xs text-zinc-500">
            <p>
              Belum memiliki akun?{' '}
              <Link href="/register" className="font-semibold text-zinc-900 hover:underline">
                Daftar Akun Baru
              </Link>
            </p>
            <p>
              Perlu buat dokumen langsung?{' '}
              <Link href="/guest/invoice" className="font-semibold text-zinc-700 hover:text-zinc-900 underline">
                Gunakan Guest Mode
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-zinc-400">
        &copy; {new Date().getFullYear()} SerbaSerbi Freelance Invoicer
      </footer>
    </div>
  );
}
