"use client";

import { PDFViewer } from '@react-pdf/renderer';
import { ContractPDF } from './ContractPDF';
import type { ContractData } from '@/types/contract';

export default function ContractPDFWrapper({ data }: { data: ContractData }) {
  return (
    <PDFViewer width="100%" height="100%" showToolbar={true} className="rounded-xl border-0">
      <ContractPDF data={data} />
    </PDFViewer>
  );
}
