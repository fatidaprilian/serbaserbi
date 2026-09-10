'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Button, Badge } from '@cloudflare/kumo';
import { Key, Cpu, Trash, CheckCircle, WarningCircle, ArrowSquareOut } from '@phosphor-icons/react';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    npwp: '',
    phone: '',
    address: '',
    logoUrl: '',
    defaultCurrency: 'IDR',
    defaultNotes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // BYOK OpenRouter State
  const [aiSettings, setAiSettings] = useState<{
    hasApiKey: boolean;
    maskedKey: string | null;
    preferredAiModel: string;
  }>({
    hasApiKey: false,
    maskedKey: null,
    preferredAiModel: 'meta-llama/llama-3.3-70b-instruct:free',
  });
  const [inputApiKey, setInputApiKey] = useState('');
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string; isFree: boolean }>>([]);
  const [savingAi, setSavingAi] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const [userRes, aiRes, modelsRes] = await Promise.all([
          fetch('/api/user/settings'),
          fetch('/api/user/ai-settings'),
          fetch('/api/ai/models'),
        ]);

        if (userRes.ok && isMounted) {
          const data = await userRes.json();
          if (data.user) {
            setFormData({
              name: data.user.name || '',
              businessName: data.user.businessName || '',
              npwp: data.user.npwp || '',
              phone: data.user.phone || '',
              address: data.user.address || '',
              logoUrl: data.user.logoUrl || '',
              defaultCurrency: data.user.defaultCurrency || 'IDR',
              defaultNotes: data.user.defaultNotes || '',
            });
          }
        }

        if (aiRes.ok && isMounted) {
          const aiData = await aiRes.json();
          setAiSettings({
            hasApiKey: Boolean(aiData.hasApiKey),
            maskedKey: aiData.maskedKey || null,
            preferredAiModel: aiData.preferredAiModel || 'meta-llama/llama-3.3-70b-instruct:free',
          });
        }

        if (modelsRes.ok && isMounted) {
          const modelsData = await modelsRes.json();
          if (Array.isArray(modelsData.models)) {
            setAvailableModels(modelsData.models);
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    void loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Pengaturan profil berhasil disimpan.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal menyimpan pengaturan.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan sistem.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-400 font-medium">
        Memuat pengaturan profil...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Pengaturan Usaha & Profil</h1>
        <p className="text-sm text-slate-400 mt-1">
          Pengaturan ini akan otomatis mengisi identitas Anda saat membuat Invoice, Quotation, dan Kontrak.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={(e) => { void handleSubmit(e); }} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4 mb-4">
          <h2 className="text-lg font-semibold text-slate-200">Identitas Freelancer / Studio</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nama Lengkap / Freelancer *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => { handleChange('name', e.target.value); }}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nama Usaha / Brand
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => { handleChange('businessName', e.target.value); }}
              placeholder="e.g. Studio Pixel Indonesia"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              NPWP / Tax Identification Number
            </label>
            <input
              type="text"
              value={formData.npwp}
              onChange={(e) => { handleChange('npwp', e.target.value); }}
              placeholder="12.345.678.9-012.000"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nomor Telepon / WhatsApp
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => { handleChange('phone', e.target.value); }}
              placeholder="+62 812 3456 7890"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Alamat Lengkap Usaha
          </label>
          <textarea
            rows={3}
            value={formData.address}
            onChange={(e) => { handleChange('address', e.target.value); }}
            placeholder="Jl. Sudirman No. 123, Jakarta Selatan"
            className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-y"
          />
        </div>

        <div className="border-t border-slate-800 pt-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Default Dokumen</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Mata Uang Standar
              </label>
              <select
                value={formData.defaultCurrency}
                onChange={(e) => { handleChange('defaultCurrency', e.target.value); }}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="IDR">IDR (Rupiah)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                URL Logo Usaha / Banner
              </label>
              <input
                type="text"
                value={formData.logoUrl}
                onChange={(e) => { handleChange('logoUrl', e.target.value); }}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Syarat & Catatan Default Invoice
            </label>
            <textarea
              rows={4}
              value={formData.defaultNotes}
              onChange={(e) => { handleChange('defaultNotes', e.target.value); }}
              placeholder="Pembayaran dikirim ke Rekening BCA 1234567890 a.n Budi Santoso. Terima kasih atas kerja samanya."
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
          >
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>

      {/* BYOK OpenRouter AI Integration Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Key size={20} weight="duotone" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Integrasi AI Assistant (BYOK - OpenRouter)</span>
                <Badge
                  variant="secondary"
                  className={
                    aiSettings.hasApiKey
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }
                >
                  {aiSettings.hasApiKey ? 'Terkonfigurasi' : 'Belum Terhubung'}
                </Badge>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Bawa API Key OpenRouter Anda sendiri (BYOK). Kunci dienkripsi aman dengan AES-256-GCM.
              </p>
            </div>
          </div>

          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
          >
            Dapatkan Kunci di OpenRouter
            <ArrowSquareOut size={13} />
          </a>
        </div>

        {aiMessage && (
          <div
            className={`p-4 rounded-xl text-xs font-medium border flex items-center gap-2 ${
              aiMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {aiMessage.type === 'success' ? <CheckCircle size={16} /> : <WarningCircle size={16} />}
            <span>{aiMessage.text}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              OpenRouter API Key {aiSettings.hasApiKey && <span className="text-emerald-400 normal-case">(Tersimpan: {aiSettings.maskedKey})</span>}
            </label>
            <input
              type="password"
              placeholder={aiSettings.hasApiKey ? 'Masukkan kunci baru jika ingin mengubah...' : 'sk-or-v1-...'}
              value={inputApiKey}
              onChange={(e) => { setInputApiKey(e.target.value); }}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              API Key Anda tidak pernah dikirim balik ke frontend dan hanya didekripsi di memori server sesaat saat memanggil AI.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Cpu size={14} className="text-cyan-400" />
              <span>Model Pilihan (Daftar Live dari OpenRouter)</span>
            </label>
            <select
              value={aiSettings.preferredAiModel}
              onChange={(e) => {
                const newModel = e.target.value;
                setAiSettings((prev) => ({ ...prev, preferredAiModel: newModel }));
              }}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
            >
              {availableModels.length === 0 ? (
                <option value={aiSettings.preferredAiModel}>{aiSettings.preferredAiModel}</option>
              ) : (
                availableModels.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                    {m.isFree ? `[GRATIS] ${m.name}` : m.name}
                  </option>
                ))
              )}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Daftar model diambil secara dinamis dari OpenRouter, termasuk status model gratis terkini.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              {aiSettings.hasApiKey && (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    if (!confirm('Hapus API Key OpenRouter Anda dari akun ini?')) return;
                    setSavingAi(true);
                    try {
                      const res = await fetch('/api/user/ai-settings', { method: 'DELETE' });
                      if (res.ok) {
                        setAiSettings((prev) => ({ ...prev, hasApiKey: false, maskedKey: null }));
                        setInputApiKey('');
                        setAiMessage({ type: 'success', text: 'API Key berhasil dihapus.' });
                      } else {
                        setAiMessage({ type: 'error', text: 'Gagal menghapus API Key.' });
                      }
                    } catch {
                      setAiMessage({ type: 'error', text: 'Terjadi gangguan koneksi.' });
                    } finally {
                      setSavingAi(false);
                    }
                  }}
                  disabled={savingAi}
                  className="text-xs px-3 py-2 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash size={14} />
                  Hapus Kunci
                </Button>
              )}
            </div>

            <Button
              variant="primary"
              onClick={async () => {
                if (!inputApiKey && !aiSettings.hasApiKey) {
                  setAiMessage({ type: 'error', text: 'Masukkan API Key OpenRouter Anda terlebih dahulu.' });
                  return;
                }
                setSavingAi(true);
                setAiMessage(null);

                try {
                  const body: { apiKey?: string; preferredAiModel: string } = {
                    preferredAiModel: aiSettings.preferredAiModel,
                  };
                  if (inputApiKey.trim()) {
                    body.apiKey = inputApiKey.trim();
                  }

                  const res = await fetch('/api/user/ai-settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                  });

                  const data = await res.json();
                  if (res.ok) {
                    setAiSettings({
                      hasApiKey: Boolean(data.hasApiKey),
                      maskedKey: data.maskedKey,
                      preferredAiModel: data.preferredAiModel,
                    });
                    setInputApiKey('');
                    setAiMessage({ type: 'success', text: 'Konfigurasi AI dan API Key OpenRouter berhasil disimpan dan divalidasi.' });
                  } else {
                    setAiMessage({ type: 'error', text: data.error || 'Gagal menyimpan konfigurasi AI.' });
                  }
                } catch {
                  setAiMessage({ type: 'error', text: 'Terjadi gangguan jaringan saat memvalidasi API Key.' });
                } finally {
                  setSavingAi(false);
                }
              }}
              disabled={savingAi}
              className="text-xs px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Key size={14} />
              {savingAi ? 'Memvalidasi & Menyimpan...' : 'Simpan & Validasi Kunci AI'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
