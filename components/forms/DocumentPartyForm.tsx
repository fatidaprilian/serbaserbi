import React from "react";

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

// minimal: shared party (sender & client) input form fields
export default function DocumentPartyForm({
  fromTitle = "Informasi Anda (Pengirim)",
  toTitle = "Informasi Klien (Tujuan)",
  fromName,
  fromAddress,
  clientName,
  clientAddress,
  onFromChange,
  onClientChange,
}: DocumentPartyFormProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Pengirim */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">{fromTitle}</h3>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-700">Nama Lengkap / Perusahaan</label>
          <input
            type="text"
            placeholder="Nama Anda..."
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={fromName}
            onChange={(e) => {
              onFromChange({ name: e.target.value });
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-700">Alamat</label>
          <textarea
            placeholder="Alamat lengkap..."
            rows={2}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
            value={fromAddress}
            onChange={(e) => {
              onFromChange({ address: e.target.value });
            }}
          />
        </div>
      </div>

      {/* Penerima / Klien */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">{toTitle}</h3>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-700">Nama Klien</label>
          <input
            type="text"
            placeholder="Nama Klien..."
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={clientName}
            onChange={(e) => {
              onClientChange({ name: e.target.value });
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-700">Alamat Klien</label>
          <textarea
            placeholder="Alamat Klien..."
            rows={2}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
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
