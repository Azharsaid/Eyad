
export interface CurrencyRate {
  code: string;
  name: string;
  rate: number;
}

export interface ExchangeData {
  base: string;
  rates: Record<string, number>;
  time_last_update_unix: number;
}

export interface AIInsight {
  title: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export const CURRENCY_LIST = {
  USD: "US Dollar",
  JOD: "Jordanian Dinar",
  SAR: "Saudi Riyal",
  AED: "UAE Dirham",
  QAR: "Qatari Riyal",
  OMR: "Omani Rial",
  EUR: "Euro",
  GBP: "British Pound",
  BHD: "Bahraini Dinar",
  KWD: "Kuwaiti Dinar"
};
