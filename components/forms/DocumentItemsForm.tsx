'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@cloudflare/kumo';
import { PencilSimpleLine, ArrowSquareOut, X, WarningCircle } from '@phosphor-icons/react';

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

export default function DocumentItemsForm({
  items,
  currency,
  onAddItem,
  onItemChange,
  onRemoveItem,
}: DocumentItemsFormProps) {
  const [activeItemForAi, setActiveItemForAi] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleOpenAiModal = (item: ItemRow) => {
    setActiveItemForAi(item.id);
    setAiPrompt(item.description || '');
    setAiError(null);
  };

  const handleGenerateDescription = async (itemId: string) => {
    if (!aiPrompt || aiPrompt.trim() === '') {
      setAiError('Silakan ketik kata kunci ringkas pekerjaan.');
      return;
    }

    setLoadingAi(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/expand-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.description) {
        onItemChange(itemId, 'description', data.description);
        setActiveItemForAi(null);
        setAiPrompt('');
      } else {
        setAiError(data.error || 'Gagal menyempurnakan deskripsi.');
      }
    } catch {
      setAiError('Terjadi gangguan jaringan saat menghubungi layanan AI.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-900">Detail Layanan / Produk</label>
        <button
          type="button"
          onClick={onAddItem}
          className="text-xs font-semibold text-cyan-800 hover:text-cyan-900 bg-cyan-50 hover:bg-cyan-100/80 border border-cyan-300 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
        >
          + Tambah Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-sm bg-slate-50/50">
          Belum ada item ditambahkan. Klik tombol &quot;+ Tambah Item&quot; di atas.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="bg-slate-50/90 p-4 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
              <div className="grid grid-cols-12 gap-2.5 items-start">
                <div className="col-span-12 sm:col-span-6 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-700 font-semibold">Deskripsi Layanan</span>
                    <button
                      type="button"
                      onClick={() => { handleOpenAiModal(item); }}
                      className="text-[11px] font-semibold text-cyan-700 hover:text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Sempurnakan deskripsi item secara otomatis menggunakan AI"
                    >
                      <PencilSimpleLine size={13} />
                      <span>Sempurnakan Deskripsi</span>
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Nama barang / jasa (contoh: Jasa Desain UI/UX)..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-y"
                    value={item.description}
                    onChange={(e) => {
                      onItemChange(item.id, 'description', e.target.value);
                    }}
                  />
                </div>

                <div className="col-span-4 sm:col-span-2 flex flex-col gap-1.5">
                  <span className="text-xs text-slate-700 font-semibold">Qty</span>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={item.quantity}
                    onChange={(e) => {
                      onItemChange(item.id, 'quantity', Number(e.target.value));
                    }}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3 flex flex-col gap-1.5">
                  <span className="text-xs text-slate-700 font-semibold">Harga ({currency})</span>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={item.unitPrice}
                    onChange={(e) => {
                      onItemChange(item.id, 'unitPrice', Number(e.target.value));
                    }}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 flex items-center justify-end pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      onRemoveItem(item.id);
                    }}
                    className="text-slate-400 hover:text-rose-600 p-2 transition-colors cursor-pointer"
                    title="Hapus Baris"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Inline AI Optimizer Assistant Box */}
              {activeItemForAi === item.id && (
                <div className="p-3 bg-white border border-cyan-300 rounded-xl space-y-2 mt-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-cyan-800">
                    <span className="flex items-center gap-1.5">
                      <PencilSimpleLine size={14} />
                      Asisten Format Deskripsi (OpenRouter BYOK)
                    </span>
                    <button
                      type="button"
                      onClick={() => { setActiveItemForAi(null); }}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Ketik kata kunci ringkas, misal: pembuatan logo 2 opsi revisi format svg..."
                      value={aiPrompt}
                      onChange={(e) => { setAiPrompt(e.target.value); }}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />

                    <Button
                      variant="primary"
                      type="button"
                      onClick={() => { void handleGenerateDescription(item.id); }}
                      disabled={loadingAi}
                      className="text-xs px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-medium rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      {loadingAi ? 'Memproses...' : 'Format Deskripsi'}
                    </Button>
                  </div>

                  {aiError && (
                    <div className="text-[11px] text-rose-600 flex items-center justify-between gap-1 pt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <WarningCircle size={13} />
                        {aiError}
                      </span>
                      {aiError.includes('Pengaturan') && (
                        <Link
                          href="/dashboard/settings"
                          className="font-semibold text-cyan-600 hover:underline flex items-center gap-0.5"
                        >
                          Buka Pengaturan
                          <ArrowSquareOut size={11} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
