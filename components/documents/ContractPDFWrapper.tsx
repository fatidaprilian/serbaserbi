"use client";

import ResponsivePDFViewer from './ResponsivePDFViewer';
import { ContractPDF } from './ContractPDF';
import type { ContractData } from '@/types/contract';

export default function ContractPDFWrapper({ data }: { data: ContractData }) {
  const fileName = `${data.contractNumber || 'contract'}.pdf`;
  return (
    <ResponsivePDFViewer
      document={<ContractPDF data={data} />}
      fileName={fileName}
      title={`Contract #${data.contractNumber || 'SPK'}`}
    />
  );
}
