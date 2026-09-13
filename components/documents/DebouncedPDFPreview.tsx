'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowClockwise, CheckCircle, CircleNotch } from '@phosphor-icons/react';
import { useTranslation } from '@/lib/i18n';

interface DebouncedPDFPreviewProps<T> {
  data: T;
  delayMs?: number;
  renderPreview: (data: T) => React.ReactNode;
}

export default function DebouncedPDFPreview<T>({
  data,
  delayMs = 750,
  renderPreview,
}: DebouncedPDFPreviewProps<T>) {
  const { t } = useTranslation();
  const [debouncedData, setDebouncedData] = useState<T>(data);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Derived synchronization status without cascading setState in effect
  const isSyncing = debouncedData !== data;

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedData(data);
    }, delayMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, delayMs]);

  // Force immediate refresh
  const handleImmediateRefresh = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setDebouncedData(data);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top Preview Status & Manual Refresh Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 mb-2 bg-white/80 backdrop-blur-xs border border-zinc-200/80 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-medium">
          {isSyncing ? (
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold animate-pulse">
              <CircleNotch size={14} className="animate-spin text-amber-600" />
              {t('generators.previewStatusUpdating')}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle size={14} weight="fill" className="text-emerald-600" />
              {t('generators.previewStatusSync')}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleImmediateRefresh}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:text-black bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200 rounded-lg transition-colors cursor-pointer"
          title={t('generators.previewRefresh')}
        >
          <ArrowClockwise size={13} className={isSyncing ? 'animate-spin' : ''} />
          <span>{t('generators.previewRefresh')}</span>
        </button>
      </div>

      {/* Actual PDF Viewer Container */}
      <div className="flex-1 w-full min-h-0 rounded-2xl overflow-hidden border border-zinc-200/60 bg-white shadow-2xs">
        {renderPreview(debouncedData)}
      </div>
    </div>
  );
}
