export function toMinorUnits(amount: number, currencyCode: string = 'USD'): number {
  // Most currencies have 2 decimals (e.g. USD, EUR, INR)
  // JPY has 0 decimals
  // BHD, KWD, OMR have 3 decimals
  const fractionDigits = getFractionDigits(currencyCode);
  return Math.round(amount * Math.pow(10, fractionDigits));
}

export function fromMinorUnits(minorUnits: number, currencyCode: string = 'USD'): number {
  const fractionDigits = getFractionDigits(currencyCode);
  return minorUnits / Math.pow(10, fractionDigits);
}

export function formatCurrency(minorUnits: number, currencyCode: string = 'USD', locale: string = 'en-US'): string {
  const fractionDigits = getFractionDigits(currencyCode);
  const amount = minorUnits / Math.pow(10, fractionDigits);
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

function getFractionDigits(currencyCode: string): number {
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    });
    return formatter.resolvedOptions().maximumFractionDigits ?? 2;
  } catch (e) {
    return 2; // Default fallback
  }
}
