'use client';

import React from "react";
import { useTranslation } from "@/lib/i18n";

interface PartyFields {
  name: string;
  address: string;
}

interface DocumentPartyFormProps {
  fromTitle?: string;
  toTitle?: string;
  fromName: string;
  fromAddress: string;
  clientName: string;
  clientAddress: string;
  onFromChange: (fields: Partial<PartyFields>) => void;
  onClientChange: (fields: Partial<PartyFields>) => void;
}

export default function DocumentPartyForm({
  fromTitle,
  toTitle,
  fromName,
  fromAddress,
  clientName,
  clientAddress,
  onFromChange,
  onClientChange,
}: DocumentPartyFormProps) {
  const { t } = useTranslation();

  const resolvedFromTitle = fromTitle || t('generators.senderTitle');
  const resolvedToTitle = toTitle || t('generators.recipientTitle');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Pengirim */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
          {resolvedFromTitle}
        </h3>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-700">
            {t('generators.senderName')}
          </label>
          <input
            type="text"
            placeholder={t('generators.senderName') + "..."}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            value={fromName}
            onChange={(e) => {
              onFromChange({ name: e.target.value });
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-700">
            {t('generators.senderAddress')}
          </label>
          <textarea
            placeholder={t('generators.senderAddress') + "..."}
            rows={2}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-y"
            value={fromAddress}
            onChange={(e) => {
              onFromChange({ address: e.target.value });
            }}
          />
        </div>
      </div>

      {/* Penerima / Klien */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
          {resolvedToTitle}
        </h3>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-700">
            {t('generators.recipientName')}
          </label>
          <input
            type="text"
            placeholder={t('generators.recipientName') + "..."}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            value={clientName}
            onChange={(e) => {
              onClientChange({ name: e.target.value });
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-700">
            {t('generators.recipientAddress')}
          </label>
          <textarea
            placeholder={t('generators.recipientAddress') + "..."}
            rows={2}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-y"
            value={clientAddress}
            onChange={(e) => {
              onClientChange({ address: e.target.value });
            }}
          />
        </div>
      </div>
    </div>
  );
}
