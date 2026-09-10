'use client';

import React from "react";
import { useTranslation } from "@/lib/i18n";

interface ContractPartyData {
  name: string;
  address: string;
  role: string;
  representativeName?: string;
}

interface ContractPartyFormProps {
  party: ContractPartyData;
  onChange: (fields: Partial<ContractPartyData>) => void;
}

export default function ContractPartyForm({ party, onChange }: ContractPartyFormProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 bg-slate-50/90 p-4 rounded-xl border border-slate-200 shadow-2xs">
      <h3 className="font-bold text-sm text-purple-800 uppercase tracking-wider">{party.role}</h3>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">{t('clients.nameLabel')}</label>
        <input
          type="text"
          className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
          value={party.name}
          onChange={(e) => {
            onChange({ name: e.target.value });
          }}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">{t('clients.addressLabel')}</label>
        <textarea
          rows={2}
          className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium resize-y"
          value={party.address}
          onChange={(e) => {
            onChange({ address: e.target.value });
          }}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">{t('generators.representativeName')}</label>
        <input
          type="text"
          className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
          value={party.representativeName || ""}
          onChange={(e) => {
            onChange({ representativeName: e.target.value });
          }}
        />
      </div>
    </div>
  );
}
