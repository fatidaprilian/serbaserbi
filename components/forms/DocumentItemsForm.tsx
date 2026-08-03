import React from "react";

export interface ItemRow {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface DocumentItemsFormProps {
  items: ItemRow[];
  currency: string;
  onAddItem: () => void;
  onItemChange: (id: string, field: keyof ItemRow, value: string | number) => void;
  onRemoveItem: (id: string) => void;
}

// minimal: shared dynamic line-items form control
export default function DocumentItemsForm({
  items,
  currency,
  onAddItem,
  onItemChange,
  onRemoveItem,
}: DocumentItemsFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">Detail Layanan</label>
        <button
          type="button"
          onClick={onAddItem}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          + Tambah Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
          Belum ada item ditambahkan. Klik tombol di atas.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                <span className="text-xs text-slate-500">Deskripsi</span>
                <input
                  type="text"
                  placeholder="Nama barang / jasa..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={item.description}
                  onChange={(e) => {
                    onItemChange(item.id, "description", e.target.value);
                  }}
                />
              </div>
              <div className="col-span-4 sm:col-span-2 flex flex-col gap-1">
                <span className="text-xs text-slate-500">Qty</span>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={item.quantity}
                  onChange={(e) => {
                    onItemChange(item.id, "quantity", Number(e.target.value));
                  }}
                />
              </div>
              <div className="col-span-8 sm:col-span-3 flex flex-col gap-1">
                <span className="text-xs text-slate-500">Harga ({currency})</span>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={item.unitPrice}
                  onChange={(e) => {
                    onItemChange(item.id, "unitPrice", Number(e.target.value));
                  }}
                />
              </div>
              <div className="col-span-12 sm:col-span-1 flex items-end justify-end sm:pt-6">
                <button
                  type="button"
                  onClick={() => {
                    onRemoveItem(item.id);
                  }}
                  className="text-red-400 hover:text-red-600 p-2 transition-colors"
                  title="Hapus"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
