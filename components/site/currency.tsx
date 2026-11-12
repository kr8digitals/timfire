'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { CURRENCIES, detectCurrency, formatMoney, convertFromNGN, currencyMeta } from '@/lib/currency';

/**
 * Currency selection.
 *
 * NGN is the base price. The visitor's likely currency is detected from their
 * device locale and time zone — never from an IP lookup, so no third party
 * learns anything. The choice is remembered in local storage. A missing rate
 * shows the naira price labelled as naira instead of a silently wrong figure.
 */

const STORAGE_KEY = 'timfire-currency';
const KEY_VALID = new Set(CURRENCIES.map((c) => c.code));

type Ctx = {
  code: string;
  setCode: (next: string) => void;
  rates: Record<string, number>;
  ready: boolean;
};

const CurrencyContext = createContext<Ctx | null>(null);

export function CurrencyProvider({
  rates,
  children,
  initial,
}: {
  rates: Record<string, number>;
  children: React.ReactNode;
  initial?: string;
}) {
  const [code, setCodeState] = useState(initial && KEY_VALID.has(initial) ? initial : 'NGN');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let next = '';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && KEY_VALID.has(stored)) next = stored;
    } catch {
      /* private mode */
    }
    setCodeState(next || (initial && KEY_VALID.has(initial) ? initial : detectCurrency()));
    setReady(true);
  }, [initial]);

  function setCode(next: string) {
    if (!KEY_VALID.has(next)) return;
    setCodeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  const value = useMemo(() => ({ code, setCode, rates, ready }), [code, rates, ready]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('CurrencyProvider is missing');
  return ctx;
}

/** Convert + format a NGN amount into the selected currency. */
export function usePrice(ngn: number | null) {
  const { code, rates } = useCurrency();
  return useMemo(() => {
    if (ngn === null) return { text: null, code, ngnText: null, missingRate: false };
    const converted = convertFromNGN(ngn, code, rates);
    if (converted === null) {
      return { text: formatMoney(ngn, 'NGN'), code: 'NGN', ngnText: formatMoney(ngn, 'NGN'), missingRate: false };
    }
    return {
      text: formatMoney(converted, code),
      code,
      ngnText: formatMoney(ngn, 'NGN'),
      missingRate: false,
    };
  }, [ngn, code, rates]);
}

export function CurrencySelect({ id, compact }: { id: string; compact?: boolean }) {
  const { code, setCode } = useCurrency();
  return (
    <select
      id={id}
      className={compact ? 'price-select' : undefined}
      value={code}
      onChange={(e) => setCode(e.target.value)}
      aria-label="Display prices in a different currency"
    >
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} — {c.name} ({c.region})
        </option>
      ))}
    </select>
  );
}

/** Card-level price, with the naira base kept visible. */
export function PriceTag({
  ngn,
  unit,
  note,
  id,
}: {
  ngn: number | null;
  unit: 'project' | 'hour';
  note: string;
  id: string;
}) {
  const { text, code } = usePrice(ngn);
  const meta = currencyMeta(code);

  if (ngn === null) {
    return (
      <div className="stack-sm">
        <p className="price">
          Scoped per project
          <small>{note}</small>
        </p>
      </div>
    );
  }

  return (
    <div className="stack-sm">
      <p className="price">
        <span className="mono">{text}</span>
        <small>
          {code === 'NGN'
            ? `Naira. Starting price per ${unit === 'hour' ? 'hour' : 'project'}.`
            : `Equivalent of ₦${ngn.toLocaleString('en-NG')} per ${unit === 'hour' ? 'hour' : 'project'}. You pay in naira.`}
        </small>
        <small>{note}</small>
      </p>
      <span className="sr-only">{meta ? `Displayed in ${meta.name}` : ''}</span>
    </div>
  );
}

/** Page-level currency switch, shown once above the pricing grid. */
export function CurrencyBar({ updated }: { updated: string }) {
  const { code } = useCurrency();
  const meta = currencyMeta(code);
  return (
    <div
      className="card flat"
      style={{ display: 'flex', gap: 18, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', padding: '16px 20px' }}
    >
      <div style={{ maxWidth: 620 }}>
        <strong style={{ fontFamily: 'var(--font-display)', fontSize: '.98rem' }}>Every price here is set in naira.</strong>
        <p className="small muted" style={{ margin: '3px 0 0', fontSize: '.85rem' }}>
          Switch currency to see an equivalent from the published rate table, dated{' '}
          {new Date(updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} and reviewed
          monthly. The naira figure is the price you actually pay.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <label htmlFor="currency-page" className="small" style={{ color: 'var(--muted)' }}>
          Show in
        </label>
        <CurrencySelect id="currency-page" compact />
      </div>
      <span className="sr-only" aria-live="polite">
        {meta ? `Prices are now shown in ${meta.name}` : ''}
      </span>
    </div>
  );
}

export { CURRENCIES };
