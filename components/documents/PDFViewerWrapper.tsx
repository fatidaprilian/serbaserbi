"use client";

import { PDFViewer } from '@react-pdf/renderer';
import { InvoicePDF } from './InvoicePDF';
import type { InvoiceData } from '@/types/invoice';

export default function PDFViewerWrapper({ data }: { data: InvoiceData }) {
  return (
    <PDFViewer width="100%" height="100%" showToolbar={true}>
      <InvoicePDF data={data} />
    </PDFViewer>
  );
}
