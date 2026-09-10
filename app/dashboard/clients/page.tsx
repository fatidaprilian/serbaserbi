'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useTranslation } from '@/lib/i18n';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  country: string | null;
  isForeignHint: boolean | null;
  createdAt: string;
}

export default function ClientsPage() {
  const { t, locale } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    country: 'Indonesia',
    isForeignHint: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadClients = async () => {
      try {
        const res = await fetch('/api/clients');
        if (res.ok && isMounted) {
          const data = await res.json();
          setClients(data.clients || []);
        }
      } catch (err) {
        console.error('Failed to fetch clients:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    void loadClients();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      country: 'Indonesia',
      isForeignHint: false,
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      country: client.country || 'Indonesia',
      isForeignHint: client.isForeignHint || false,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = editingClient ? `/api/clients/${encodeURIComponent(editingClient.id)}` : '/api/clients';
      const method = editingClient ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        void fetchClients();
      } else {
        setError(data.error || t('common.error'));
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${t('common.delete')} "${name}"?`)) return;

    try {
      const res = await fetch(`/api/clients/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        void fetchClients();
      } else {
        const data = await res.json();
        alert(data.error || t('common.error'));
      }
    } catch {
      alert(t('common.error'));
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.country && c.country.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{t('clients.title')}</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {t('clients.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => { openAddModal(); }}
          className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-zinc-900 hover:bg-black text-white shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <span>+</span> {t('clients.addClient')}
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); }}
          placeholder={t('clients.searchPlaceholder')}
          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50/80 border border-zinc-200/90 text-zinc-900 text-xs placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
        />
      </div>

      {/* Client List */}
      {loading ? (
        <div className="text-center py-16 text-zinc-400 font-medium">{t('common.loading')}</div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-16 bg-white border border-zinc-200/80 rounded-2xl p-8 shadow-xs">
          <p className="text-zinc-500 font-medium">
            {search ? (locale === 'id' ? 'Tidak ada klien yang cocok.' : 'No clients match your search.') : t('clients.emptyTitle')}
          </p>
          {!search && (
            <button
              type="button"
              onClick={() => { openAddModal(); }}
              className="mt-4 text-xs font-semibold text-zinc-900 hover:underline cursor-pointer"
            >
              + {t('clients.addClient')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white border border-zinc-200/80 rounded-2xl p-5 hover:border-zinc-300 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-zinc-900 text-base">{client.name}</h3>
                  {client.isForeignHint && (
                    <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded bg-amber-50 border border-amber-200/80 text-amber-800">
                      {"Int'l / Foreign"}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-zinc-600">
                  {client.email && (
                    <p className="flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-400">{t('clients.emailLabel')}:</span> {client.email}
                    </p>
                  )}
                  {client.phone && (
                    <p className="flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-400">{t('clients.phoneLabel')}:</span> {client.phone}
                    </p>
                  )}
                  {client.address && (
                    <p className="flex items-start gap-1.5">
                      <span className="font-semibold text-zinc-400">{t('clients.addressLabel')}:</span> <span className="line-clamp-2 text-zinc-700">{client.address}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-1.5 text-zinc-500">
                    <span className="font-semibold text-zinc-400">{locale === 'id' ? 'Negara:' : 'Country:'}</span> {client.country || 'Indonesia'}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { openEditModal(client); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-all cursor-pointer"
                >
                  {t('common.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => { void handleDelete(client.id, client.name); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-lg font-bold text-zinc-900">
                {editingClient ? (locale === 'id' ? 'Edit Data Klien' : 'Edit Client Profile') : t('clients.modalTitle')}
              </h2>
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); }}
                className="text-zinc-400 hover:text-zinc-700 font-bold cursor-pointer text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  {t('clients.nameLabel')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); }}
                  placeholder={t('clients.namePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  {t('clients.emailLabel')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => { setFormData({ ...formData, email: e.target.value }); }}
                  placeholder={t('clients.emailPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  {t('clients.phoneLabel')}
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); }}
                  placeholder={t('clients.phonePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  {t('clients.addressLabel')}
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => { setFormData({ ...formData, address: e.target.value }); }}
                  placeholder={t('clients.addressPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                    {locale === 'id' ? 'Negara' : 'Country'}
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => { setFormData({ ...formData, country: e.target.value }); }}
                    placeholder="Indonesia"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isForeignHint}
                      onChange={(e) => { setFormData({ ...formData, isForeignHint: e.target.checked }); }}
                      className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    />
                    {locale === 'id' ? 'Klien Luar Negeri' : 'Foreign / Offshore Client'}
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-black text-white disabled:opacity-50 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
                >
                  {saving ? t('clients.btnSaving') : t('clients.btnSave')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
