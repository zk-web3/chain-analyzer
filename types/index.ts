export type Chain = {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  explorer_url: string;
  price?: number;
  market_cap?: number;
  price_change_24h?: number;
  tvl?: number;
  gas_fees?: number | string;
  tps?: number;
  l2s?: Chain[];
}; 