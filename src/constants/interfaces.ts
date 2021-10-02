export interface Message {
  event: string;
  uninvested_cash?: string;
  crypto?: string;
  equities?: string;
  total_equity?: string;
  error?: Error;
  newProperties?: string;
  property?: string;
  accountName?: string;
  forceUpdate?: boolean;
  cash_available_from_instant_deposits?: string;
}
