import { Font } from '@react-pdf/renderer';

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
