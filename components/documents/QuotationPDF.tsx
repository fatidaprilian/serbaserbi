import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { QuotationData } from '@/types/quotation';
import { COMMON_PDF_STYLES, PDFPartySection, PDFItemTable, PDFTotalsBlock } from '@/components/documents/shared';

const styles = StyleSheet.create({
  ...COMMON_PDF_STYLES,
  accentBar: {
    ...COMMON_PDF_STYLES.accentBar,
    backgroundColor: '#059669', // Emerald-600
  },
  title: {
    ...COMMON_PDF_STYLES.title,
    color: '#059669', // Emerald-600
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#059669',
    paddingVertical: 10,
    fontWeight: 'bold',
    color: '#059669',
  },
  totalRowGrand: {
    flexDirection: 'row',
    width: '45%',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#059669',
    marginTop: 4,
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#059669',
  },
});

const DICT = {
  id: {
    title: 'SURAT PENAWARAN',
    date: 'Tanggal:',
    validUntil: 'Berlaku Hingga:',
    from: 'Dari:',
    to: 'Kepada:',
    desc: 'Deskripsi Layanan',
    qty: 'Qty',
    price: 'Harga Est.',
    total: 'Total Est.',
    totalAmount: 'Estimasi Total Biaya',
    warning: '* Dokumen ini merupakan estimasi biaya (penawaran awal) dan bukan tagihan (invoice) yang sah. Harga akhir dapat berubah tergantung pada penyesuaian ruang lingkup pekerjaan.',
    notes: 'Catatan Tambahan:',
  },
  en: {
    title: 'QUOTATION',
    date: 'Date:',
    validUntil: 'Valid Until:',
    from: 'From:',
    to: 'To:',
    desc: 'Service Description',
    qty: 'Qty',
    price: 'Est. Price',
    total: 'Est. Total',
    totalAmount: 'Estimated Total Cost',
    warning: '* This document is a cost estimate (initial quotation) and not a valid invoice. Final price may change depending on adjustments to the scope of work.',
    notes: 'Additional Notes:',
  }
};

export const QuotationPDF = ({ data }: { data: QuotationData }) => {
  const calculateTotal = () => {
    return data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const t = DICT[data.language || 'id'];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.accentBar} />

        <View style={styles.headerRow}>
          <View>
            {data.logo ? (
              /* eslint-disable-next-line jsx-a11y/alt-text */
              <Image src={data.logo} style={styles.logo} />
            ) : (
              <Text style={styles.title}>{t.title}</Text>
            )}
          </View>
          <View style={{ textAlign: 'right' }}>
            {data.logo && <Text style={[styles.title, { marginBottom: 12 }]}>{t.title}</Text>}
            <Text style={styles.textBold}>{data.quotationNumber}</Text>
            <Text>{t.date} {data.date}</Text>
            <Text>{t.validUntil} {data.validUntil}</Text>
          </View>
        </View>

        <PDFPartySection
          fromLabel={t.from}
          fromName={data.fromName}
          fromAddress={data.fromAddress}
          toLabel={t.to}
          clientName={data.clientName}
          clientAddress={data.clientAddress}
          styles={styles}
        />

        <PDFItemTable
          items={data.items}
          labels={{ desc: t.desc, qty: t.qty, price: t.price, total: t.total }}
          styles={styles}
        />

        <PDFTotalsBlock
          label={t.totalAmount}
          totalAmount={calculateTotal()}
          styles={styles}
        />
        
        <View style={{ marginTop: 40, padding: 12, backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: 4 }}>
          <Text style={{ color: '#166534', fontSize: 9, lineHeight: 1.5 }}>
            {t.warning}
          </Text>
        </View>

        {data.notes && (
          <View style={{ marginTop: 24, borderTopWidth: 1, borderTopColor: '#e4e4e7', paddingTop: 16 }}>
            <Text style={styles.sectionTitle}>{t.notes}</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.5 }}>{data.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default QuotationPDF;

