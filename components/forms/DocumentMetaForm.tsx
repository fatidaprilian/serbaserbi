'use client';

import React, { useState, useEffect } from "react";
import { Badge } from "@cloudflare/kumo";
import { CurrencyDollar, Clock } from "@phosphor-icons/react";

interface DocumentMetaFormProps {
  currency: string;
  language: string;
  onCurrencyChange: (currency: "IDR" | "USD") => void;
  onLanguageChange: (language: "id" | "en") => void;
}

export default function DocumentMetaForm({
  currency,
  language,
  onCurrencyChange,
  onLanguageChange,
}: DocumentMetaFormProps) {
  const [exchangeInfo, setExchangeInfo] = useState<{
    rate: number;
    source: string;
    cachedAt: string;
    isCached: boolean;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (currency === 'USD') {
      const fetchRate = async () => {
        try {
          const res = await fetch('/api/currency/rate?from=USD&to=IDR');
          if (res.ok && isMounted) {
            const data = await res.json();
            setExchangeInfo(data);
          }
        } catch {
          // graceful fallback
        }
      };
      void fetchRate();
    }
    return () => {
      isMounted = false;
    };
  }, [currency]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-900">Mata Uang & Bahasa</label>
      <div className="grid grid-cols-2 gap-2">
        <select
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all cursor-pointer shadow-xs font-medium"
          value={currency}
          onChange={(e) => {
            onCurrencyChange(e.target.value as "IDR" | "USD");
          }}
        >
          <option value="IDR">IDR (Rupiah)</option>
          <option value="USD">USD (US Dollar)</option>
        </select>
        <select
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all cursor-pointer shadow-xs font-medium"
          value={language}
          onChange={(e) => {
            onLanguageChange(e.target.value as "id" | "en");
          }}
        >
          <option value="id">Indonesia</option>
          <option value="en">English</option>
        </select>
      </div>

      {currency === 'USD' && exchangeInfo && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-cyan-500/15 text-cyan-800 border border-cyan-500/30 flex items-center gap-1 font-semibold">
              <CurrencyDollar size={13} weight="bold" />
              Kurs Ter-cache (12 Jam)
            </Badge>
            <span className="font-mono font-bold text-slate-900">
              1 USD = Rp {exchangeInfo.rate.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
            <Clock size={13} />
            <span>Pukul {exchangeInfo.cachedAt} • {exchangeInfo.source}</span>
          </div>
        </div>
      )}
    </div>
  );
}

