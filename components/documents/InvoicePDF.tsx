import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { InvoiceData } from '@/types/invoice';
import { COMMON_PDF_STYLES, PDFPartySection, PDFItemTable, PDFTotalsBlock, calculateItemizedTotal } from '@/components/documents/shared';

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
    ...COMMON_PDF_STYLES.tableHeader,
    borderBottomColor: '#e4e4e7',
    color: '#09090b',
  },
  totalRowGrand: {
    ...COMMON_PDF_STYLES.totalRowGrand,
    borderTopColor: '#000000',
  },
  totalAmount: {
    ...COMMON_PDF_STYLES.totalAmount,
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
          totalAmount={calculateItemizedTotal(data.items)}
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

