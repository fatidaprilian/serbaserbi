'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button, Badge } from '@cloudflare/kumo';
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
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-slate-200 text-slate-700 font-semibold border border-slate-300">
            {t('nav.guestMode')}
          </Badge>
          <span className="text-slate-600 font-medium">
            {t('generators.guestNotice')}
          </span>
        </div>
        <Link href="/login" className="font-semibold text-cyan-700 hover:text-cyan-800 hover:underline flex items-center gap-1 shrink-0">
          {t('nav.signIn')}
          <ArrowSquareOut size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary" className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {t('generators.connectedAccount')}
          </Badge>
          <span className="text-xs font-medium text-slate-300">
            {profile?.businessName || profile?.name || session?.user?.name || session?.user?.email}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {profile && (
            <Button
              variant="secondary"
              onClick={handleApplyProfile}
              className="text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer"
              title={t('generators.useMyProfile')}
            >
              <User size={14} />
              {t('generators.useMyProfile')}
            </Button>
          )}

          {clients.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1">
              <Buildings size={14} className="text-slate-400" />
              <select
                onChange={handleClientChange}
                defaultValue=""
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
                title={t('generators.selectClient')}
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">
                  {t('generators.selectClient')}
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="primary"
            onClick={() => { void handleSaveToAccount(); }}
            disabled={isSaving}
            className="text-xs h-8 px-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FloppyDisk size={14} />
            {isSaving ? t('generators.saving') : t('generators.saveToDashboard')}
          </Button>
        </div>
      </div>

      {saveStatus && (
        <div
          className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium border ${
            saveStatus.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {saveStatus.type === 'success' ? <CheckCircle size={16} /> : <WarningCircle size={16} />}
            <span>{saveStatus.message}</span>
          </div>

          {saveStatus.type === 'success' && (
            <Link
              href="/dashboard/documents"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
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
