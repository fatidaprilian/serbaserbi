"use client";

import { PDFViewer } from '@react-pdf/renderer';
import { QuotationPDF } from './QuotationPDF';
import type { QuotationData } from '@/types/quotation';

export default function QuotationPDFWrapper({ data }: { data: QuotationData }) {
  return (
    <PDFViewer width="100%" height="100%" showToolbar={true} className="rounded-xl border-0">
      <QuotationPDF data={data} />
    </PDFViewer>
  );
}
