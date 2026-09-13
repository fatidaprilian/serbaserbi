import type { ContractClause } from '@/types/contract';

export const DEFAULT_CONTRACT_CLAUSES: Record<'id' | 'en', ContractClause[]> = {
  id: [
    {
      id: '1',
      title: 'Ruang Lingkup Pekerjaan',
      content:
        'PIHAK KEDUA sepakat untuk melaksanakan pekerjaan berupa Pengembangan Website sesuai dengan spesifikasi yang telah disepakati oleh kedua belah pihak.',
    },
    {
      id: '2',
      title: 'Nilai dan Tata Cara Pembayaran',
      content:
        'Total nilai pekerjaan adalah sebagaimana disepakati. Pembayaran dilakukan secara bertahap: 50% sebagai Uang Muka pada saat penandatanganan kontrak, dan 50% setelah pekerjaan selesai 100%.',
    },
    {
      id: '3',
      title: 'Hak dan Kewajiban',
      content:
        'PIHAK PERTAMA berhak menerima hasil pekerjaan sesuai tenggat waktu. PIHAK KEDUA wajib menyelesaikan pekerjaan dengan profesional dan berhak menerima pembayaran tepat waktu.',
    },
  ],
  en: [
    {
      id: '1',
      title: 'Scope of Work',
      content:
        'The SECOND PARTY agrees to perform web development services in accordance with the specifications agreed upon by both parties.',
    },
    {
      id: '2',
      title: 'Payment Terms and Milestones',
      content:
        'The total contract value is as agreed. Payment shall be made in installments: 50% as an upfront Down Payment upon contract signing, and 50% upon final handover.',
    },
    {
      id: '3',
      title: 'Rights and Obligations',
      content:
        'The FIRST PARTY is entitled to receive deliverables within the agreed timeline. The SECOND PARTY is obligated to deliver professional services and is entitled to receive timely payments.',
    },
  ],
};

export const DEFAULT_QUOTATION_NOTES: Record<'id' | 'en', string> = {
  id: 'Harga dapat berubah jika terdapat penambahan ruang lingkup pekerjaan di luar yang telah disepakati di atas.',
  en: 'Pricing is subject to change should there be additions to the project scope beyond what was agreed above.',
};

export const DEFAULT_INVOICE_NOTES: Record<'id' | 'en', string> = {
  id: 'Pembayaran dapat ditransfer ke rekening bank di atas. Konfirmasi bukti transfer via WhatsApp atau Email setelah pembayaran.',
  en: 'Payment terms: net 14 days. Please transfer to the bank account listed above and send payment confirmation via WhatsApp or Email.',
};

export function isDefaultQuotationNotes(notes: string): boolean {
  if (!notes || notes.trim() === '') return true;
  return notes === DEFAULT_QUOTATION_NOTES.id || notes === DEFAULT_QUOTATION_NOTES.en;
}

export function isDefaultInvoiceNotes(notes: string): boolean {
  if (!notes || notes.trim() === '') return true;
  return notes === DEFAULT_INVOICE_NOTES.id || notes === DEFAULT_INVOICE_NOTES.en;
}

export function isDefaultContractClauses(clauses: ContractClause[]): boolean {
  if (!clauses || clauses.length !== 3) return false;
  const isMatchId = clauses.every(
    (c, idx) =>
      c.title === DEFAULT_CONTRACT_CLAUSES.id[idx].title &&
      c.content === DEFAULT_CONTRACT_CLAUSES.id[idx].content
  );
  const isMatchEn = clauses.every(
    (c, idx) =>
      c.title === DEFAULT_CONTRACT_CLAUSES.en[idx].title &&
      c.content === DEFAULT_CONTRACT_CLAUSES.en[idx].content
  );
  return isMatchId || isMatchEn;
}

/**
 * Accurately convert monetary value between IDR and USD.
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  usdToIdrRate = 16250
): number {
  const normFrom = (from || '').toUpperCase();
  const normTo = (to || '').toUpperCase();
  if (normFrom === normTo || !amount || amount <= 0) return amount;
  const rate = usdToIdrRate > 0 ? usdToIdrRate : 16250;

  if (normFrom === 'IDR' && normTo === 'USD') {
    const converted = amount / rate;
    return Number(converted.toFixed(2));
  }

  if (normFrom === 'USD' && normTo === 'IDR') {
    return Math.round(amount * rate);
  }

  return amount;
}
