// minimal: shared currency formatter — extend if locale options expand
export function formatCurrency(amount: number, currency: string = 'IDR', language: string = 'id'): string {
  const isIDR = (currency || 'IDR').toUpperCase() === 'IDR';
  return new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', {
    style: 'currency',
    currency: currency || 'IDR',
    minimumFractionDigits: isIDR ? 0 : 2,
    maximumFractionDigits: isIDR ? 0 : 2,
  }).format(amount);
}
