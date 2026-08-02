import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts if needed, currently using defaults
Font.register({
  family: 'Open Sans',
  src: 'https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0e.ttf',
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Open Sans',
    fontSize: 12,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 8,
  },
  col1: { width: '50%' },
  col2: { width: '15%', textAlign: 'center' },
  col3: { width: '15%', textAlign: 'right' },
  col4: { width: '20%', textAlign: 'right' },
  totalSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    width: '40%',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#3b82f6',
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
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t.invoice}</Text>
            <Text>#{data.invoiceNumber || 'INV-000'}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text>{t.date} {data.date}</Text>
            <Text>{t.dueDate} {data.dueDate}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 40 }}>
          <View style={{ width: '50%' }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{t.from}</Text>
            <Text>{data.fromName || '-'}</Text>
            <Text>{data.fromAddress || '-'}</Text>
          </View>
          <View style={{ width: '50%' }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{t.to}</Text>
            <Text>{data.clientName || '-'}</Text>
            <Text>{data.clientAddress || '-'}</Text>
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
            <Text style={styles.col1}>{item.description}</Text>
            <Text style={styles.col2}>{item.quantity}</Text>
            <Text style={styles.col3}>{formatCurrency(item.unitPrice)}</Text>
            <Text style={styles.col4}>{formatCurrency(item.quantity * item.unitPrice)}</Text>
          </View>
        ))}

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text>{t.totalAmount}</Text>
            <Text style={styles.totalAmount}>{formatCurrency(calculateTotal())}</Text>
          </View>
        </View>
        
        {calculateTotal() > 5000000 && data.currency === 'IDR' && (
          <View style={{ marginTop: 40, padding: 10, backgroundColor: '#fef2f2', border: '1px solid #f87171' }}>
            <Text style={{ color: '#ef4444', fontSize: 10 }}>
              {t.warning}
            </Text>
          </View>
        )}

        {data.notes && (
          <View style={{ marginTop: 40 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{t.notes}</Text>
            <Text style={{ fontSize: 10, color: '#666' }}>{data.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};
