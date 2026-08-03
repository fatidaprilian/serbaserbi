import React from "react";

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

// minimal: shared contract party input fields (Pihak A / Pihak B)
export default function ContractPartyForm({ party, onChange }: ContractPartyFormProps) {
  return (
    <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
      <h3 className="font-semibold text-sm text-indigo-700">{party.role}</h3>
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-500">Nama Lengkap / Perusahaan</label>
        <input
          type="text"
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
          value={party.name}
          onChange={(e) => {
            onChange({ name: e.target.value });
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-500">Alamat</label>
        <textarea
          rows={2}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
          value={party.address}
          onChange={(e) => {
            onChange({ address: e.target.value });
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-500">Nama Perwakilan (Ttd)</label>
        <input
          type="text"
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
          value={party.representativeName || ""}
          onChange={(e) => {
            onChange({ representativeName: e.target.value });
          }}
        />
      </div>
    </div>
  );
}
