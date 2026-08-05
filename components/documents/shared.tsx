import React from 'react';
import { Font, Text, View } from '@react-pdf/renderer';
import { formatCurrency } from '@/lib/utils';

// minimal: single font registration site to avoid re-registering Open Sans across PDF components
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0e.ttf' },
    { src: 'https://fonts.gstatic.com/s/opensans/v18/mem5YaGs126MiZpBA-UN7rgOUuhs.ttf', fontWeight: 700 },
  ],
});

export const COMMON_PDF_STYLES = {
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  logo: {
    maxHeight: 60,
    maxWidth: 150,
    objectFit: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -1,
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
} as const;

export interface PDFPartySectionProps {
  fromLabel: string;
  fromName: string;
  fromAddress: string;
  toLabel: string;
  clientName: string;
  clientAddress: string;
  styles: any;
}

export const PDFPartySection = ({
  fromLabel,
  fromName,
  fromAddress,
  toLabel,
  clientName,
  clientAddress,
  styles,
}: PDFPartySectionProps) => (
  <View style={[styles.row, { marginBottom: 30 }]}>
    <View style={{ width: '45%' }}>
      <Text style={styles.sectionTitle}>{fromLabel}</Text>
      <Text style={styles.textBold}>{fromName}</Text>
      <Text style={{ marginTop: 4, lineHeight: 1.4 }}>{fromAddress}</Text>
    </View>
    <View style={{ width: '45%' }}>
      <Text style={styles.sectionTitle}>{toLabel}</Text>
      <Text style={styles.textBold}>{clientName}</Text>
      <Text style={{ marginTop: 4, lineHeight: 1.4 }}>{clientAddress}</Text>
    </View>
  </View>
);

export interface PDFItemTableProps {
  items: Array<{ description: string; quantity: number; unitPrice: number }>;
  labels: { desc: string; qty: string; price: string; total: string };
  styles: any;
}

export const PDFItemTable = ({ items, labels, styles }: PDFItemTableProps) => (
  <>
    <View style={styles.tableHeader}>
      <Text style={styles.col1}>{labels.desc}</Text>
      <Text style={styles.col2}>{labels.qty}</Text>
      <Text style={styles.col3}>{labels.price}</Text>
      <Text style={styles.col4}>{labels.total}</Text>
    </View>

    {items.map((item, i) => (
      <View style={styles.tableRow} key={i}>
        <Text style={[styles.col1, styles.textBold]}>{item.description}</Text>
        <Text style={styles.col2}>{item.quantity}</Text>
        <Text style={styles.col3}>{formatCurrency(item.unitPrice)}</Text>
        <Text style={styles.col4}>{formatCurrency(item.quantity * item.unitPrice)}</Text>
      </View>
    ))}
  </>
);

export interface PDFTotalsBlockProps {
  label: string;
  totalAmount: number;
  styles: any;
}

export const PDFTotalsBlock = ({ label, totalAmount, styles }: PDFTotalsBlockProps) => (
  <View style={styles.totalSection}>
    <View style={styles.totalRowGrand}>
      <Text style={styles.textBold}>{label}</Text>
      <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
    </View>
  </View>
);
