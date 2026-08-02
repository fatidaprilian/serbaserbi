import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0e.ttf' },
    { src: 'https://fonts.gstatic.com/s/opensans/v18/mem5YaGs126MiZpBA-UN7rgOUuhs.ttf', fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 50,
    fontFamily: 'Open Sans',
    fontSize: 10,
    color: '#3f3f46', // zinc-700
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#000000',
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
    color: '#09090b', // zinc-900
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
    color: '#a1a1aa', // zinc-400
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
    borderBottomColor: '#e4e4e7', // zinc-200
    paddingVertical: 10,
    fontWeight: 'bold',
    color: '#09090b',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5', // zinc-100
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
  totalRow: {
    flexDirection: 'row',
    width: '45%',
    justifyContent: 'space-between',
    paddingVertical: 6,
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

import type { InvoiceData } from '@/types/invoice';

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
    warning: '* Peringatan: Total invoice melebihi Rp 5.000.000. Berdasarkan regulasi (UU No. 10/2020), dokumen ini wajib dibubuhi Bea Meterai Rp 10.000.',
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
    warning: '* Warning: Total invoice exceeds IDR 5,000,000. Based on Indonesian regulation (Law No. 10/2020), this document requires a Stamp Duty (Bea Meterai) of IDR 10,000.',
    notes: 'Notes:',
  }
};

export const InvoicePDF = ({ data }: { data: InvoiceData }) => {
  const calculateTotal = () => {
    return data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(data.language === 'id' ? 'id-ID' : 'en-US', {
      style: 'currency',
      currency: data.currency,
    }).format(amount);
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

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>{t.desc}</Text>
          <Text style={styles.col2}>{t.qty}</Text>
          <Text style={styles.col3}>{t.price}</Text>
          <Text style={styles.col4}>{t.total}</Text>
        </View>

        {/* Table Rows */}
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
