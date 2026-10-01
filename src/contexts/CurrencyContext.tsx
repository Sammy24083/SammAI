import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'NGN' | 'USD' | 'GHS' | 'KES';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (amountInNGN: number) => string;
  symbol: string;
}

const RATES: Record<CurrencyCode, { rate: number; symbol: string; prefix: string }> = {
  NGN: { rate: 1, symbol: '₦', prefix: '₦' },
  USD: { rate: 0.00067, symbol: '$', prefix: '$' },
  GHS: { rate: 0.010, symbol: '₵', prefix: 'GH₵' },
  KES: { rate: 0.087, symbol: 'KSh', prefix: 'KSh ' },
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('samm_currency') as CurrencyCode) || 'NGN';
  });

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem('samm_currency', c);
  };

  const formatPrice = (amountInNGN: number): string => {
    const config = RATES[currency];
    const converted = amountInNGN * config.rate;

    if (currency === 'USD') {
      return `${config.symbol}${converted.toFixed(2)}`;
    }
    return `${config.prefix}${Math.round(converted).toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        symbol: RATES[currency].symbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};
