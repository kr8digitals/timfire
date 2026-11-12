'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { CURRENCIES, formatPrice, RATES } from '@/lib/currency';
import { useStore } from '@/lib/store';

/**
 * Site-wide currency choice. Persisted in localStorage so a visitor who picks
 * pounds on the Services page still sees pounds on every landing page.
 * Conversion is instant and local — the rates live in lib/currency.ts and are
 * updated monthly by the owner, never fetched at runtime.
 */

const Ctx = createContext<{ code: string; setCode: (c: string) => void; rates: Record<string, number>; updated: string }>({
  code: 'NGN',
  setCode: () => {},
  rates: RATES,
  updated: '',
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { data } = useStore();
  const rates = Object.keys(data.settings.rates || {}).length ? data.settings.rates : RATES;
  const [code, setCodeState] = useState('NGN');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('timfire-currency');
      if (saved && CURRENCIES.some((c) => c.code === saved)) setCodeState(saved);
      else {
        const region = new Intl.Locale(navigator.language).region || '';
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const guess =
          region === 'NG' || tz === 'Africa/Lagos'
            ? 'NGN'
            : (CURRENCIES.find((c) => c.code === regionCurrency(region))?.code ?? 'NGN');
        setCodeState(guess);
      }
    } catch {
      /* keep NGN */
    }
  }, []);
  function setCode(c: string) {
    setCodeState(c);
    try {
      localStorage.setItem('timfire-currency', c);
    } catch {
      /* ignore */
    }
  }
  return <Ctx.Provider value={{ code, setCode, rates, updated: data.settings.ratesUpdated }}>{children}</Ctx.Provider>;
}

function regionCurrency(region: string): string {
  const map: Record<string, string> = {
    US: 'USD', GB: 'GBP', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', IE: 'EUR', NL: 'EUR', PT: 'EUR',
    CA: 'CAD', AU: 'AUD', GH: 'GHS', ZA: 'ZAR', KE: 'KES', IN: 'INR', AE: 'AED', CN: 'CNY', JP: 'JPY', SG: 'SGD',
  };
  return map[region] || 'NGN';
}

export function useCurrency() {
  return useContext(Ctx);
}

/** Renders a naira amount in the visitor's chosen currency, instantly. */
export function Price({ ngn, unit, prefix = 'From ' }: { ngn: number; unit?: string; prefix?: string }) {
  const { code, rates } = useCurrency();
  return (
    <span className="price mono">
      {prefix}
      {formatPrice(ngn, code, rates)}
      {unit === 'hour' ? ' / hour' : ''}
    </span>
  );
}

export function CurrencySelect() {
  const { code, setCode, updated } = useCurrency();
  return (
    <div className="currency-box">
      <label className="form-label" htmlFor="currency">Show prices in</label>
      <select id="currency" className="price-select" value={code} onChange={(e) => setCode(e.target.value)}>
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} — {c.label}
          </option>
        ))}
      </select>
      <p className="small muted" style={{ marginTop: 8 }}>
        Naira is the base price; conversion uses the rates I publish each month
        {updated ? ` (updated ${updated})` : ''}.
      </p>
    </div>
  );
}
