import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { QuotationData } from '@/types/quotation';
import { formatCurrency } from '@/lib/utils';
import '@/components/documents/shared';

const styles = StyleSheet.create({
  page: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 50,
    fontFamily: 'Open Sans',
    fontSize: 10,
    color: '#3f3f46',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#059669', // Emerald-600
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#059669', // Emerald-600
    letterSpacing: -1,
  },
  logo: {
    maxHeight: 60,
    maxWidth: 150,
    objectFit: 'contain',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#a1a1aa',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  textBold: {
    fontWeight: 'bold',
    color: '#09090b',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#059669', // Emerald accent border
    paddingVertical: 10,
    fontWeight: 'bold',
    color: '#059669',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
    paddingVertical: 12,
  },
  col1: { width: '45%', paddingRight: 8 },
  col2: { width: '15%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '20%', textAlign: 'right' },
  totalSection: {
    marginTop: 20,
    alignItems: 'flex-end',
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
            {data.logo && (
              <Image src={data.logo} style={styles.logo} />
            )}
            {!data.logo && (
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

        <View style={[styles.row, { marginBottom: 30 }]}>
          <View style={{ width: '45%' }}>
            <Text style={styles.sectionTitle}>{t.from}</Text>
            <Text style={styles.textBold}>{data.fromName}</Text>
            <Text style={{ marginTop: 4, lineHeight: 1.4 }}>{data.fromAddress}</Text>
          </View>
          <View style={{ width: '45%' }}>
            <Text style={styles.sectionTitle}>{t.to}</Text>
            <Text style={styles.textBold}>{data.clientName}</Text>
            <Text style={{ marginTop: 4, lineHeight: 1.4 }}>{data.clientAddress}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.col1}>{t.desc}</Text>
          <Text style={styles.col2}>{t.qty}</Text>
          <Text style={styles.col3}>{t.price}</Text>
          <Text style={styles.col4}>{t.total}</Text>
        </View>

        {data.items.map((item, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={[styles.col1, styles.textBold]}>{item.description}</Text>
            <Text style={styles.col2}>{item.quantity}</Text>
            <Text style={styles.col3}>{formatCurrency(item.unitPrice)}</Text>
            <Text style={styles.col4}>{formatCurrency(item.quantity * item.unitPrice)}</Text>
          </View>
        ))}

        <View style={styles.totalSection}>
          <View style={styles.totalRowGrand}>
            <Text style={styles.textBold}>{t.totalAmount}</Text>
            <Text style={styles.totalAmount}>{formatCurrency(calculateTotal())}</Text>
          </View>
        </View>
        
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
