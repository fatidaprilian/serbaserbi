import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { InvoiceData } from '@/types/invoice';
import { formatCurrency } from '@/lib/utils';
import { COMMON_PDF_STYLES, PDFPartySection, PDFItemTable, PDFTotalsBlock } from '@/components/documents/shared';

const styles = StyleSheet.create({
  ...COMMON_PDF_STYLES,
  accentBar: {
    ...COMMON_PDF_STYLES.accentBar,
    backgroundColor: '#000000',
  },
  title: {
    ...COMMON_PDF_STYLES.title,
    color: '#09090b',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
    paddingVertical: 10,
    fontWeight: 'bold',
    color: '#09090b',
  },
  totalRowGrand: {
    flexDirection: 'row',
    width: '45%',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#000000',
    marginTop: 4,
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#09090b',
  },
});

const DICT = {
  id: {
    invoice: 'INVOICE',
    date: 'Tanggal:',
    dueDate: 'Jatuh Tempo:',
    from: 'Dari:',
    to: 'Kepada:',
    desc: 'Deskripsi',
    qty: 'Qty',
    price: 'Harga',
    total: 'Total',
    totalAmount: 'Total',
    notes: 'Catatan:',
  },
  en: {
    invoice: 'INVOICE',
    date: 'Date:',
    dueDate: 'Due Date:',
    from: 'From:',
    to: 'To:',
    desc: 'Description',
    qty: 'Qty',
    price: 'Price',
    total: 'Total',
    totalAmount: 'Total',
    notes: 'Notes:',
  }
};

export const InvoicePDF = ({ data }: { data: InvoiceData }) => {
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
              <Image src={data.logo} style={styles.logo} />
            ) : (
              <Text style={styles.title}>{t.invoice}</Text>
            )}
          </View>
          <View style={{ textAlign: 'right' }}>
            {data.logo && <Text style={[styles.title, { marginBottom: 12 }]}>{t.invoice}</Text>}
            <Text style={styles.textBold}>{data.invoiceNumber}</Text>
            <Text>{t.date} {data.date}</Text>
            {data.dueDate && <Text>{t.dueDate} {data.dueDate}</Text>}
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
        
        {data.notes && (
          <View style={{ marginTop: 50, borderTopWidth: 1, borderTopColor: '#e4e4e7', paddingTop: 16 }}>
            <Text style={styles.sectionTitle}>{t.notes}</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.5 }}>{data.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default InvoicePDF;

