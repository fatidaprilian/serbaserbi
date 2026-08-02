export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface QuotationData {
  quotationNumber: string;
  date: string;
  validUntil: string;
  currency: "IDR" | "USD" | string;
  language: "id" | "en";
  clientName: string;
  clientAddress: string;
  fromName: string;
  fromAddress: string;
  items: QuotationItem[];
  taxRate: number;
  notes: string;
}
