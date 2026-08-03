// minimal: shared currency formatter — extend if locale options expand
export function formatCurrency(amount: number, currency: string = 'IDR', language: string = 'id'): string {
  return new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', {
    style: 'currency',
    currency: currency || 'IDR',
  }).format(amount);
}
