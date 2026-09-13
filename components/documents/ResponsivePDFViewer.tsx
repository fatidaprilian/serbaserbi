'use client';

import React, { useSyncExternalStore } from 'react';
import { PDFViewer, BlobProvider, type DocumentProps } from '@react-pdf/renderer';
import { ArrowSquareOut, DownloadSimple, CircleNotch, FilePdf } from '@phosphor-icons/react';
import { useTranslation } from '@/lib/i18n';

interface ResponsivePDFViewerProps {
  document: React.ReactElement<DocumentProps>;
  fileName?: string;
  title?: string;
}

function subscribe(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

function getSnapshot(): boolean {
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileUA =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isNarrow = window.innerWidth < 1024;
  return (isTouch && isNarrow) || isMobileUA || isNarrow;
}

function getServerSnapshot(): boolean {
  return false;
}

export default function ResponsivePDFViewer({
  document,
  fileName = 'document.pdf',
  title,
}: ResponsivePDFViewerProps) {
  const { t } = useTranslation();
  const isMobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Desktop view: Full interactive PDF viewer
  if (!isMobile) {
    return (
      <PDFViewer width="100%" height="100%" showToolbar={true} className="w-full h-full border-0">
        {document}
      </PDFViewer>
    );
  }

  // Mobile view: BlobProvider with direct native viewer launcher and download
  return (
    <BlobProvider document={document}>
      {({ url, loading, error }) => {
        if (loading) {
          return (
            <div className="flex flex-col items-center justify-center h-full min-h-[360px] p-6 text-center">
              <CircleNotch size={32} className="animate-spin text-zinc-500 mb-3" />
              <p className="text-sm font-medium text-zinc-600">{t('generators.previewStatusUpdating')}</p>
            </div>
          );
        }

        if (error) {
          return (
            <div className="flex flex-col items-center justify-center h-full min-h-[360px] p-6 text-center text-red-600">
              <p className="text-sm font-medium">Failed to generate PDF preview.</p>
            </div>
          );
        }

        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[360px] p-6 text-center bg-zinc-50/50">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mb-4 shadow-sm">
              <FilePdf size={32} weight="duotone" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1">
              {title || t('generators.mobilePdfReady')}
            </h3>
            <p className="text-xs text-zinc-500 max-w-xs mb-6">
              {t('generators.mobilePdfNotice')}
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <a
                href={url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-zinc-900 hover:bg-black text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
              >
                <ArrowSquareOut size={16} />
                <span>{t('generators.mobileOpenPdf')}</span>
              </a>
              <a
                href={url || '#'}
                download={fileName}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-200 rounded-xl text-sm font-semibold shadow-sm transition-all"
              >
                <DownloadSimple size={16} />
                <span>{t('generators.mobileDownloadPdf')}</span>
              </a>
            </div>
          </div>
        );
      }}
    </BlobProvider>
  );
}
