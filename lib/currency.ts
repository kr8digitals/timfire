/**
 * Central currency rates — the single source of truth for every price on the
 * site. All prices are stored in naira; everything else is derived here.
 *
 * MONTHLY UPDATE: change the numbers below (and RATE_UPDATED) once a month.
 * One file, one place, every price on the site follows instantly.
 * Values are naira-to-unit multipliers, e.g. 1 NGN = 0.00065 USD.
 */

export const RATE_UPDATED = 'November 2026';

export const RATES: Record<string, number> = {
  NGN: 1,
  USD: 0.00065,
  GBP: 0.00049,
  EUR: 0.00056,
  CAD: 0.00091,
  AUD: 0.00099,
  GHS: 0.0079,
  ZAR: 0.0113,
  KES: 0.084,
  INR: 0.057,
  AED: 0.0024,
  CNY: 0.0046,
  JPY: 0.1,
  SGD: 0.00086,
};

export const CURRENCIES: { code: string; label: string }[] = [
  { code: 'NGN', label: 'Nigerian naira' },
  { code: 'USD', label: 'US dollar' },
  { code: 'GBP', label: 'British pound' },
  { code: 'EUR', label: 'Euro' },
  { code: 'CAD', label: 'Canadian dollar' },
  { code: 'AUD', label: 'Australian dollar' },
  { code: 'GHS', label: 'Ghanaian cedi' },
  { code: 'ZAR', label: 'South African rand' },
  { code: 'KES', label: 'Kenyan shilling' },
  { code: 'INR', label: 'Indian rupee' },
  { code: 'AED', label: 'UAE dirham' },
  { code: 'CNY', label: 'Chinese yuan' },
  { code: 'JPY', label: 'Japanese yen' },
  { code: 'SGD', label: 'Singapore dollar' },
];

export function convert(ngn: number, code: string, rates: Record<string, number> = RATES): number {
  const rate = rates[code];
  if (!rate || !Number.isFinite(rate) || rate <= 0) return ngn;
  return ngn * rate;
}

export function formatPrice(ngn: number, code: string, rates: Record<string, number> = RATES): string {
  if (code === 'NGN') {
    return '₦' + ngn.toLocaleString('en-NG');
  }
  const value = convert(ngn, code, rates);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: code,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: value < 100 ? 2 : 0,
  }).format(value);
}
