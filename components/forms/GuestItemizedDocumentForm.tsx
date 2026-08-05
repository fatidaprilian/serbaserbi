import React, { ReactNode } from "react";
import LogoUpload from "@/components/LogoUpload";
import DocumentPartyForm from "@/components/forms/DocumentPartyForm";
import DocumentItemsForm from "@/components/forms/DocumentItemsForm";
import DocumentMetaForm from "@/components/forms/DocumentMetaForm";

interface PartyFields {
  name?: string;
  address?: string;
}

export interface GuestItemizedDocumentFormProps<TItem extends { id: string; description: string; quantity: number; unitPrice: number }> {
  currency: string;
  language: string;
  onCurrencyChange: (currency: "IDR" | "USD") => void;
  onLanguageChange: (language: "id" | "en") => void;
  metaFields: ReactNode;
  logo?: string;
  onLogoChange: (logo: string) => void;
  onLogoRemove: () => void;
  fromName: string;
  fromAddress: string;
  clientName: string;
  clientAddress: string;
  onFromChange: (fields: PartyFields) => void;
  onClientChange: (fields: PartyFields) => void;
  items: TItem[];
  onAddItem: () => void;
  onItemChange: (id: string, field: keyof TItem, value: string | number) => void;
  onRemoveItem: (id: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  notesLabel?: string;
  notesPlaceholder?: string;
}

export default function GuestItemizedDocumentForm<TItem extends { id: string; description: string; quantity: number; unitPrice: number }>({
  currency,
  language,
  onCurrencyChange,
  onLanguageChange,
  metaFields,
  logo,
  onLogoChange,
  onLogoRemove,
  fromName,
  fromAddress,
  clientName,
  clientAddress,
  onFromChange,
  onClientChange,
  items,
  onAddItem,
  onItemChange,
  onRemoveItem,
  notes,
  onNotesChange,
  notesLabel = "Catatan Tambahan",
  notesPlaceholder = "Tuliskan catatan tambahan...",
}: GuestItemizedDocumentFormProps<TItem>) {
  return (
    <>
      <DocumentMetaForm
        currency={currency}
        language={language}
        onCurrencyChange={onCurrencyChange}
        onLanguageChange={onLanguageChange}
      />

      {metaFields}

      <LogoUpload
        logo={logo}
        onLogoChange={onLogoChange}
        onLogoRemove={onLogoRemove}
      />

      <hr className="border-zinc-100" />

      <DocumentPartyForm
        fromName={fromName}
        fromAddress={fromAddress}
        clientName={clientName}
        clientAddress={clientAddress}
        onFromChange={onFromChange}
        onClientChange={onClientChange}
      />

      <hr className="border-slate-100" />

      <DocumentItemsForm
        items={items}
        currency={currency}
        onAddItem={onAddItem}
        onItemChange={onItemChange}
        onRemoveItem={onRemoveItem}
      />

      <hr className="border-zinc-100" />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700">{notesLabel}</label>
        <textarea
          placeholder={notesPlaceholder}
          rows={4}
          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-y"
          value={notes}
          onChange={(e) => { onNotesChange(e.target.value); }}
        />
      </div>
    </>
  );
}
