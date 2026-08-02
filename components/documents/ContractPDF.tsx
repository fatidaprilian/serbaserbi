import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { ContractData } from '@/types/contract';



const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Times-Roman', // Formal font for contracts
    fontSize: 11,
    color: '#000',
    lineHeight: 1.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  paragraph: {
    marginBottom: 12,
    textAlign: 'justify',
  },
  partySection: {
    marginLeft: 20,
    marginBottom: 15,
  },
  partyLabel: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  clauseTitle: {
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  signatureSection: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  signatureBox: {
    width: '40%',
    alignItems: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    width: '100%',
    marginTop: 60,
    paddingTop: 5,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 9,
    color: '#666',
  }
});

const DICT = {
  id: {
    title: 'SURAT PERJANJIAN KERJA SAMA',
    number: 'Nomor:',
    intro: (date: string) => `Pada hari ini, tanggal ${date || '...........'}, yang bertanda tangan di bawah ini:`,
    name: 'Nama/Perusahaan:',
    address: 'Alamat:',
    roleP1: (role: string) => `Dalam hal ini bertindak sebagai ${role || 'Pihak Pertama'} dan selanjutnya disebut sebagai PIHAK PERTAMA.`,
    roleP2: (role: string) => `Dalam hal ini bertindak sebagai ${role || 'Pihak Kedua'} dan selanjutnya disebut sebagai PIHAK KEDUA.`,
    agreement: 'PIHAK PERTAMA dan PIHAK KEDUA secara bersama-sama selanjutnya disebut sebagai PARA PIHAK. PARA PIHAK dengan ini sepakat untuk mengadakan Perjanjian Kerja Sama dengan ketentuan-ketentuan sebagai berikut:',
    jobTitle: 'Judul Pekerjaan:',
    projectValue: 'Nilai Proyek:',
    duration: 'Jangka Waktu:',
    until: 'hingga',
    clausePrefix: 'Pasal',
    closing: 'Demikian Perjanjian ini dibuat dan ditandatangani oleh PARA PIHAK dalam keadaan sadar dan tanpa paksaan dari pihak mana pun.',
    party1: 'PIHAK PERTAMA',
    party2: 'PIHAK KEDUA',
    page: 'Halaman',
    of: 'dari',
  },
  en: {
    title: 'PROFESSIONAL SERVICE AGREEMENT',
    number: 'Number:',
    intro: (date: string) => `On this day, ${date || '...........'}, the undersigned:`,
    name: 'Name/Company:',
    address: 'Address:',
    roleP1: (role: string) => `Acting as ${role || 'First Party'} and hereinafter referred to as the FIRST PARTY.`,
    roleP2: (role: string) => `Acting as ${role || 'Second Party'} and hereinafter referred to as the SECOND PARTY.`,
    agreement: 'The FIRST PARTY and SECOND PARTY collectively referred to as the PARTIES. The PARTIES hereby agree to enter into a Professional Service Agreement with the following terms and conditions:',
    jobTitle: 'Project Title:',
    projectValue: 'Project Value:',
    duration: 'Duration:',
    until: 'until',
    clausePrefix: 'Article',
    closing: 'IN WITNESS WHEREOF, the PARTIES have executed this Agreement voluntarily and without any coercion from any party.',
    party1: 'FIRST PARTY',
    party2: 'SECOND PARTY',
    page: 'Page',
    of: 'of',
  }
};

export const ContractPDF = ({ data }: { data: ContractData }) => {
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
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.number} {data.contractNumber || 'SPK-000'}</Text>
        </View>

        <Text style={styles.paragraph}>
          {t.intro(data.date)}
        </Text>

        <View style={styles.partySection}>
          <Text>{t.name} {data.partyA.name}</Text>
          <Text>{t.address} {data.partyA.address}</Text>
          <Text style={styles.paragraph}>
            {t.roleP1(data.partyA.role)}
          </Text>
        </View>

        <View style={styles.partySection}>
          <Text>{t.name} {data.partyB.name}</Text>
          <Text>{t.address} {data.partyB.address}</Text>
          <Text style={styles.paragraph}>
            {t.roleP2(data.partyB.role)}
          </Text>
        </View>

        <Text style={styles.paragraph}>
          {t.agreement}
        </Text>

        <Text style={styles.paragraph}>
          <Text style={{ fontWeight: 'bold' }}>{t.jobTitle}</Text> {data.projectTitle}{'\n'}
          <Text style={{ fontWeight: 'bold' }}>{t.projectValue}</Text> {formatCurrency(data.projectValue)}{'\n'}
          <Text style={{ fontWeight: 'bold' }}>{t.duration}</Text> {data.startDate} {t.until} {data.endDate}
        </Text>

        {data.clauses.map((clause, index) => (
          <View key={clause.id} wrap={false}>
            <Text style={styles.clauseTitle}>{t.clausePrefix} {index + 1} - {clause.title}</Text>
            <Text style={styles.paragraph}>{clause.content}</Text>
          </View>
        ))}

        <View wrap={false}>
          <Text style={styles.paragraph}>
            {t.closing}
          </Text>

          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <Text>{t.party1}</Text>
              <Text style={styles.signatureLine}>{data.partyA.representativeName || data.partyA.name}</Text>
            </View>
            <View style={styles.signatureBox}>
              <Text>{t.party2}</Text>
              <Text style={styles.signatureLine}>{data.partyB.representativeName || data.partyB.name}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `${t.page} ${pageNumber} ${t.of} ${totalPages} - ${data.contractNumber}`
        )} fixed />
      </Page>
    </Document>
  );
};
