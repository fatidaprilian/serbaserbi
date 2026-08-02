export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  currency: "IDR" | "USD" | string;
  language: "id" | "en";
  logo?: string;
  clientName: string;
  clientAddress: string;
  fromName: string;
  fromAddress: string;
  items: InvoiceItem[];
  taxRate: number;
  notes: string;
}
