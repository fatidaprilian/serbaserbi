"use client";

import ResponsivePDFViewer from './ResponsivePDFViewer';
import { InvoicePDF } from './InvoicePDF';
import type { InvoiceData } from '@/types/invoice';

export default function PDFViewerWrapper({ data }: { data: InvoiceData }) {
  const fileName = `${data.invoiceNumber || 'invoice'}.pdf`;
  return (
    <ResponsivePDFViewer
      document={<InvoicePDF data={data} />}
      fileName={fileName}
      title={`Invoice #${data.invoiceNumber || 'INV'}`}
    />
  );
}
