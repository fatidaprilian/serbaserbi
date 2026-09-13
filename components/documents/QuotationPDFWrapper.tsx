"use client";

import ResponsivePDFViewer from './ResponsivePDFViewer';
import { QuotationPDF } from './QuotationPDF';
import type { QuotationData } from '@/types/quotation';

export default function QuotationPDFWrapper({ data }: { data: QuotationData }) {
  const fileName = `${data.quotationNumber || 'quotation'}.pdf`;
  return (
    <ResponsivePDFViewer
      document={<QuotationPDF data={data} />}
      fileName={fileName}
      title={`Quotation #${data.quotationNumber || 'QUO'}`}
    />
  );
}
