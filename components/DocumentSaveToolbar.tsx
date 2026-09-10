'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Badge } from '@cloudflare/kumo';
import { FloppyDisk, User, Buildings, CheckCircle, WarningCircle, ArrowSquareOut } from '@phosphor-icons/react';
import { useTranslation } from '@/lib/i18n';

interface SavedClient {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
}

interface UserProfile {
  name: string;
  businessName: string | null;
  address: string | null;
  defaultCurrency: string;
  defaultNotes: string | null;
  logoUrl: string | null;
}

interface DocumentSaveToolbarProps {
  docType: 'invoice' | 'quotation' | 'contract';
  documentNumber: string;
  issueDate: string;
  dueDate?: string;
  validUntil?: string;
  currency: string;
  notes?: string;
  items?: Array<{ description: string; quantity: number; rate: number; subtotal: number }>;
  value?: number;
  contractType?: string;
  clientName: string;
  clientAddress?: string;
  clientEmail?: string;
  meteraiRequired?: boolean;
  onApplyUserProfile: (profile: {
    fromName: string;
    fromAddress: string;
    defaultCurrency: string;
    defaultNotes: string;
    logoUrl?: string;
  }) => void;
  onSelectClient: (client: { name: string; address: string; email?: string }) => void;
}

export default function DocumentSaveToolbar({
  docType,
  documentNumber,
  issueDate,
  dueDate,
  validUntil,
  currency,
  notes,
  items,
  value,
  contractType,
  clientName,
  clientAddress,
  clientEmail,
  meteraiRequired,
  onApplyUserProfile,
  onSelectClient,
}: DocumentSaveToolbarProps) {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [clients, setClients] = useState<SavedClient[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (status === 'authenticated') {
      const fetchUserData = async () => {
        try {
          const [settingsRes, clientsRes] = await Promise.all([
            fetch('/api/user/settings'),
            fetch('/api/clients'),
          ]);

          if (settingsRes.ok && isMounted) {
            const settingsData = await settingsRes.json();
            if (settingsData.user) {
              setProfile(settingsData.user);
            }
          }

          if (clientsRes.ok && isMounted) {
            const clientsData = await clientsRes.json();
            if (clientsData.clients) {
              setClients(clientsData.clients);
            }
          }
        } catch {
          // Graceful fallback if offline
        }
      };

      void fetchUserData();
    }
    return () => {
      isMounted = false;
    };
  }, [status]);

  const handleApplyProfile = () => {
    if (!profile) return;
    const nameToUse = profile.businessName || profile.name || '';
    onApplyUserProfile({
      fromName: nameToUse,
      fromAddress: profile.address || '',
      defaultCurrency: profile.defaultCurrency || 'IDR',
      defaultNotes: profile.defaultNotes || '',
      logoUrl: profile.logoUrl || undefined,
    });
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const found = clients.find((c) => c.id === selectedId);
    if (found) {
      onSelectClient({
        name: found.name,
        address: found.address || '',
        email: found.email || undefined,
      });
    }
  };

  const handleSaveToAccount = async () => {
    if (!clientName || clientName.trim() === '') {
      setSaveStatus({
        type: 'error',
        message: t('generators.clientNameRequired'),
      });
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const payload = {
        docType,
        documentNumber,
        issueDate,
        dueDate: dueDate || issueDate,
        validUntil: validUntil || dueDate || issueDate,
        currency,
        notes: notes || '',
        items: items || [],
        value: value || 0,
        contractType: contractType || 'freelance',
        clientName,
        clientAddress: clientAddress || '',
        clientEmail: clientEmail || '',
        meteraiRequired: Boolean(meteraiRequired),
      };

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSaveStatus({
          type: 'success',
          message: t('generators.savedHistorySuccess', { number: documentNumber }),
        });
      } else {
        setSaveStatus({
          type: 'error',
          message: data.error || t('common.error'),
        });
      }
    } catch {
      setSaveStatus({
        type: 'error',
        message: t('common.error'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading') {
    return null;
  }

  if (status !== 'authenticated') {
    return (
      <div className="bg-zinc-50/90 border border-zinc-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-zinc-200/80 text-zinc-700 font-semibold border border-zinc-300/80">
            {t('nav.guestMode')}
          </Badge>
          <span className="text-zinc-600 font-medium">
            {t('generators.guestNotice')}
          </span>
        </div>
        <Link href="/login" className="font-semibold text-zinc-900 hover:underline flex items-center gap-1 shrink-0">
          {t('nav.signIn')}
          <ArrowSquareOut size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50/90 border border-zinc-200/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t('generators.connectedAccount')}
          </span>
          <span className="text-xs font-semibold text-zinc-800">
            {profile?.businessName || profile?.name || session?.user?.name || session?.user?.email}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {profile && (
            <button
              type="button"
              onClick={handleApplyProfile}
              className="text-xs h-8 px-3 rounded-lg border border-zinc-200/90 bg-white hover:bg-zinc-100 text-zinc-700 font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-[0.98]"
              title={t('generators.useMyProfile')}
            >
              <User size={14} className="text-zinc-500" />
              {t('generators.useMyProfile')}
            </button>
          )}

          {clients.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white border border-zinc-200/90 rounded-lg px-2.5 py-1 shadow-2xs">
              <Buildings size={14} className="text-zinc-400" />
              <select
                onChange={handleClientChange}
                defaultValue=""
                className="bg-transparent text-zinc-800 text-xs focus:outline-none cursor-pointer"
                title={t('generators.selectClient')}
              >
                <option value="" disabled className="text-zinc-400">
                  {t('generators.selectClient')}
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="text-zinc-900">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => { void handleSaveToAccount(); }}
            disabled={isSaving}
            className="text-xs h-8 px-3.5 rounded-lg bg-zinc-900 hover:bg-black text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <FloppyDisk size={14} />
            {isSaving ? t('generators.saving') : t('generators.saveToDashboard')}
          </button>
        </div>
      </div>

      {saveStatus && (
        <div
          className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium border ${
            saveStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {saveStatus.type === 'success' ? (
              <CheckCircle size={16} className="text-emerald-600" />
            ) : (
              <WarningCircle size={16} className="text-rose-600" />
            )}
            <span>{saveStatus.message}</span>
          </div>

          {saveStatus.type === 'success' && (
            <Link
              href="/dashboard/documents"
              className="text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1 font-semibold"
            >
              {t('generators.viewInHistory')}
              <ArrowSquareOut size={13} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
