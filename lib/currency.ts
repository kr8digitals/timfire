/**
 * Centralised currency configuration.
 *
 * NGN is the authoritative base for every price on the site. All other
 * currencies are derived from the monthly rate table below.
 *
 * ── HOW TO UPDATE (once a month) ────────────────────────────────────────────
 * 1. Get current rates: 1 NGN = ? units of each currency, or work from USD.
 * 2. Edit `RATES_PER_NGN` values only — never edit prices in components.
 * 3. Set `RATE_DATE` to the date you updated them (shown on the Services page).
 * 4. Commit and deploy. Every price on every page recalculates automatically.
 *
 * Values are "how many units of this currency equal 1 Nigerian naira".
 * Example: if 1 USD ≈ ₦1,550, then 1 NGN ≈ 0.000645 USD → `USD: 0.000645`.
 * ────────────────────────────────────────────────────────────────────────────
 */

export const RATE_DATE = '2026-11-01';

/** Units of currency per 1 NGN. Edit these values monthly. */
export const RATES_PER_NGN: Record<string, number> = {
  NGN: 1,
  USD: 0.000647, // ≈ ₦1,545 / $1
  GBP: 0.000489, // ≈ ₦2,044 / £1
  EUR: 0.000559, // ≈ ₦1,788 / €1
  CAD: 0.000905, // ≈ ₦1,105 / C$1
  AUD: 0.000993, // ≈ ₦1,007 / A$1
  GHS: 0.00786, // ≈ GHS 7.86 per ₦1,000 (₦127 / GHS 1)
  ZAR: 0.0113, // ≈ R 0.0113 per ₦1
  KES: 0.0836, // ≈ KES 0.0836 per ₦1
  INR: 0.0569, // ≈ ₹0.0569 per ₦1
  AED: 0.00238, // ≈ AED 0.00238 per ₦1
  CNY: 0.00461, // ≈ ¥0.00461 per ₦1
  JPY: 0.0995, // ≈ ¥0.0995 per ₦1
};

export type CurrencyMeta = {
  code: string;
  name: string;
  /** Country/region label used in the selector */
  region: string;
  /** Number of decimals to show */
  decimals: number;
  /** Natural locale for formatting */
  locale: string;
};

export const CURRENCIES: CurrencyMeta[] = [
  { code: 'NGN', name: 'Nigerian naira', region: 'Nigeria', decimals: 0, locale: 'en-NG' },
  { code: 'USD', name: 'US dollar', region: 'United States', decimals: 2, locale: 'en-US' },
  { code: 'GBP', name: 'British pound', region: 'United Kingdom', decimals: 2, locale: 'en-GB' },
  { code: 'EUR', name: 'Euro', region: 'Eurozone', decimals: 2, locale: 'en-IE' },
  { code: 'CAD', name: 'Canadian dollar', region: 'Canada', decimals: 2, locale: 'en-CA' },
  { code: 'AUD', name: 'Australian dollar', region: 'Australia', decimals: 2, locale: 'en-AU' },
  { code: 'GHS', name: 'Ghanaian cedi', region: 'Ghana', decimals: 2, locale: 'en-GH' },
  { code: 'KES', name: 'Kenyan shilling', region: 'Kenya', decimals: 0, locale: 'en-KE' },
  { code: 'ZAR', name: 'South African rand', region: 'South Africa', decimals: 2, locale: 'en-ZA' },
  { code: 'INR', name: 'Indian rupee', region: 'India', decimals: 0, locale: 'en-IN' },
  { code: 'AED', name: 'UAE dirham', region: 'United Arab Emirates', decimals: 2, locale: 'en-AE' },
  { code: 'CNY', name: 'Chinese yuan', region: 'China', decimals: 2, locale: 'zh-CN' },
  { code: 'JPY', name: 'Japanese yen', region: 'Japan', decimals: 0, locale: 'ja-JP' },
];

const BY_CODE = new Map(CURRENCIES.map((c) => [c.code, c]));

/** Browser locale → currency code. Falls back to USD outside known regions. */
const REGION_TO_CURRENCY: Record<string, string> = {
  NG: 'NGN',
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  GH: 'GHS',
  KE: 'KES',
  ZA: 'ZAR',
  IN: 'INR',
  AE: 'AED',
  CN: 'CNY',
  JP: 'JPY',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  IE: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
};

export function detectCurrency(): string {
  try {
    const locale = new Intl.Locale(navigator.language);
    const region = locale.region || '';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (region === 'NG' || tz === 'Africa/Lagos') return 'NGN';
    if (REGION_TO_CURRENCY[region]) return REGION_TO_CURRENCY[region];
    // Common time-zone fallbacks for users whose browser reports a generic locale
    if (tz.startsWith('Europe/London')) return 'GBP';
    if (tz.startsWith('Europe/')) return 'EUR';
    if (tz.startsWith('Africa/Accra')) return 'GHS';
    if (tz.startsWith('Africa/Nairobi')) return 'KES';
    if (tz.startsWith('Africa/Johannesburg')) return 'ZAR';
    if (tz.startsWith('Asia/Kolkata') || tz.startsWith('Asia/Calcutta')) return 'INR';
    if (tz.startsWith('Asia/Dubai')) return 'AED';
    if (tz.startsWith('Asia/Tokyo')) return 'JPY';
    if (tz.startsWith('Australia/')) return 'AUD';
    if (tz.startsWith('America/Toronto') || tz.startsWith('America/Vancouver')) return 'CAD';
    return 'USD';
  } catch {
    return 'USD';
  }
}

export function isSupported(code: string): boolean {
  return BY_CODE.has(code) && Number.isFinite(RATES_PER_NGN[code]) && RATES_PER_NGN[code] > 0;
}

/**
 * Convert a NGN amount into `code`.
 * Returns null when the currency is unknown so callers can fall back
 * rather than silently showing a wrong number.
 */
export function convertFromNGN(ngn: number, code: string, extraRates?: Record<string, number>): number | null {
  const rate = extraRates?.[code] ?? RATES_PER_NGN[code];
  if (!Number.isFinite(rate) || rate <= 0) return null;
  return ngn * rate;
}

/** Format a converted amount using the currency's own locale conventions. */
export function formatMoney(amount: number, code: string): string {
  const meta = BY_CODE.get(code);
  if (!meta) return '';
  const rounded = meta.decimals === 0 ? Math.round(amount) : Math.round(amount * 100) / 100;
  try {
    return new Intl.NumberFormat(meta.locale, {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: meta.decimals,
      maximumFractionDigits: meta.decimals,
    }).format(rounded);
  } catch {
    return `${code} ${rounded.toLocaleString()}`;
  }
}

/** Format a NGN base price in the chosen currency, or null if unsupported. */
export function priceIn(ngn: number, code: string, extraRates?: Record<string, number>): string | null {
  const converted = convertFromNGN(ngn, code, extraRates);
  if (converted === null) return null;
  return formatMoney(converted, code);
}

export function currencyMeta(code: string): CurrencyMeta | undefined {
  return BY_CODE.get(code);
}
