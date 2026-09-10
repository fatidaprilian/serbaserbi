'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Key, Cpu, Trash, CheckCircle, WarningCircle, ArrowSquareOut } from '@phosphor-icons/react';
import { useTranslation } from '@/lib/i18n';

export default function SettingsPage() {
  const { t, locale } = useTranslation();
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
        setMessage({ type: 'success', text: t('settings.saveSuccess') });
      } else {
        setMessage({ type: 'error', text: data.error || t('settings.saveError') });
      }
    } catch {
      setMessage({ type: 'error', text: t('common.error') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-zinc-400 font-medium">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{t('settings.title')}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium border flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? <CheckCircle size={18} className="text-emerald-600 shrink-0" /> : <WarningCircle size={18} className="text-rose-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={(e) => { void handleSubmit(e); }} className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-zinc-100 pb-4 mb-4">
          <h2 className="text-base font-bold text-zinc-900 tracking-tight">{t('settings.tabProfile')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              {t('settings.profileName')} *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => { handleChange('name', e.target.value); }}
              className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              {t('settings.businessName')}
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => { handleChange('businessName', e.target.value); }}
              placeholder="e.g. Studio Pixel Indonesia"
              className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              NPWP / Tax ID
            </label>
            <input
              type="text"
              value={formData.npwp}
              onChange={(e) => { handleChange('npwp', e.target.value); }}
              placeholder="12.345.678.9-012.000"
              className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              {t('settings.businessPhone')}
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => { handleChange('phone', e.target.value); }}
              placeholder="+62 812 3456 7890"
              className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
            {t('settings.businessAddress')}
          </label>
          <textarea
            rows={3}
            value={formData.address}
            onChange={(e) => { handleChange('address', e.target.value); }}
            placeholder="Jl. Sudirman No. 123, Jakarta Selatan"
            className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all resize-y"
          />
        </div>

        <div className="border-t border-zinc-100 pt-6">
          <h2 className="text-base font-bold text-zinc-900 tracking-tight mb-4">{t('settings.tabBusiness')}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                {t('common.currency')}
              </label>
              <select
                value={formData.defaultCurrency}
                onChange={(e) => { handleChange('defaultCurrency', e.target.value); }}
                className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
              >
                <option value="IDR">IDR (Rupiah)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                Logo URL
              </label>
              <input
                type="text"
                value={formData.logoUrl}
                onChange={(e) => { handleChange('logoUrl', e.target.value); }}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              {t('settings.bankDetails')}
            </label>
            <textarea
              rows={4}
              value={formData.defaultNotes}
              onChange={(e) => { handleChange('defaultNotes', e.target.value); }}
              placeholder={t('settings.bankDetailsPlaceholder')}
              className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-medium text-sm bg-zinc-900 hover:bg-black text-white shadow-xs active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
          >
            {saving ? t('clients.btnSaving') : t('common.save')}
          </button>
        </div>
      </form>

      {/* BYOK OpenRouter AI Integration Card */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-800">
              <Key size={20} weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span>{t('settings.aiCardTitle')}</span>
                <span
                  className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    aiSettings.hasApiKey
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {aiSettings.hasApiKey ? (locale === 'id' ? 'Terkonfigurasi' : 'Configured') : (locale === 'id' ? 'Belum Terhubung' : 'Not Connected')}
                </span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {t('settings.aiCardDesc')}
              </p>
            </div>
          </div>

          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-zinc-700 hover:text-black hover:underline flex items-center gap-1 transition-colors"
          >
            {locale === 'id' ? 'Dapatkan Kunci di OpenRouter' : 'Get API Key at OpenRouter'}
            <ArrowSquareOut size={13} />
          </a>
        </div>

        {aiMessage && (
          <div
            className={`p-4 rounded-2xl text-xs font-medium border flex items-center gap-2.5 ${
              aiMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {aiMessage.type === 'success' ? <CheckCircle size={16} className="text-emerald-600 shrink-0" /> : <WarningCircle size={16} className="text-rose-600 shrink-0" />}
            <span>{aiMessage.text}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              {t('settings.aiKeyLabel')} {aiSettings.hasApiKey && <span className="text-emerald-600 normal-case font-medium">({locale === 'id' ? 'Tersimpan:' : 'Saved:'} {aiSettings.maskedKey})</span>}
            </label>
            <input
              type="password"
              placeholder={aiSettings.hasApiKey ? (locale === 'id' ? 'Masukkan kunci baru jika ingin mengubah...' : 'Enter new key to update...') : t('settings.aiKeyPlaceholder')}
              value={inputApiKey}
              onChange={(e) => { setInputApiKey(e.target.value); }}
              className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              {locale === 'id' ? 'API Key Anda tidak pernah dikirim balik ke frontend dan hanya didekripsi di memori server sesaat saat memanggil AI.' : 'Your API key is never returned to the frontend and only decrypted in transient memory during AI completions.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Cpu size={14} className="text-zinc-700" />
              <span>{t('settings.aiModelLabel')}</span>
            </label>
            <select
              value={aiSettings.preferredAiModel}
              onChange={(e) => {
                const newModel = e.target.value;
                setAiSettings((prev) => ({ ...prev, preferredAiModel: newModel }));
              }}
              className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all cursor-pointer"
            >
              {availableModels.length === 0 ? (
                <option value={aiSettings.preferredAiModel}>{aiSettings.preferredAiModel}</option>
              ) : (
                availableModels.map((m) => (
                  <option key={m.id} value={m.id} className="bg-white text-zinc-900">
                    {m.isFree ? `[${t('settings.freeBadge')}] ${m.name}` : m.name}
                  </option>
                ))
              )}
            </select>
            <p className="text-[11px] text-zinc-500 mt-1">
              {locale === 'id' ? 'Daftar model diambil secara dinamis dari OpenRouter, termasuk status model gratis terkini.' : 'Dynamic model catalog fetched live from OpenRouter, highlighting free tier options.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              {aiSettings.hasApiKey && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm(locale === 'id' ? 'Hapus API Key OpenRouter Anda dari akun ini?' : 'Delete your OpenRouter API key from this account?')) return;
                    setSavingAi(true);
                    try {
                      const res = await fetch('/api/user/ai-settings', { method: 'DELETE' });
                      if (res.ok) {
                        setAiSettings((prev) => ({ ...prev, hasApiKey: false, maskedKey: null }));
                        setInputApiKey('');
                        setAiMessage({ type: 'success', text: locale === 'id' ? 'API Key berhasil dihapus.' : 'API key successfully removed.' });
                      } else {
                        setAiMessage({ type: 'error', text: locale === 'id' ? 'Gagal menghapus API Key.' : 'Failed to delete API key.' });
                      }
                    } catch {
                      setAiMessage({ type: 'error', text: t('common.error') });
                    } finally {
                      setSavingAi(false);
                    }
                  }}
                  disabled={savingAi}
                  className="text-xs px-3.5 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash size={14} />
                  {t('common.delete')}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={async () => {
                if (!inputApiKey && !aiSettings.hasApiKey) {
                  setAiMessage({ type: 'error', text: locale === 'id' ? 'Masukkan API Key OpenRouter Anda terlebih dahulu.' : 'Please enter your OpenRouter API key first.' });
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
                    setAiMessage({ type: 'success', text: locale === 'id' ? 'Konfigurasi AI dan API Key OpenRouter berhasil disimpan dan divalidasi.' : 'AI settings & API key validated and saved successfully.' });
                  } else {
                    setAiMessage({ type: 'error', text: data.error || t('settings.saveError') });
                  }
                } catch {
                  setAiMessage({ type: 'error', text: t('common.error') });
                } finally {
                  setSavingAi(false);
                }
              }}
              disabled={savingAi}
              className="text-xs px-5 py-2.5 bg-zinc-900 hover:bg-black text-white font-medium rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
            >
              <Key size={14} />
              {savingAi ? (locale === 'id' ? 'Memvalidasi & Menyimpan...' : 'Validating & Saving...') : (locale === 'id' ? 'Simpan & Validasi Kunci AI' : 'Save & Validate AI Key')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
