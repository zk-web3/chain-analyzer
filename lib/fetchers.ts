import { Chain } from '../types';
import { CHAINS } from './chains';

// Fallback key is provided, but you should create a .env.local file with your own key for production.
const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'A6S2MMX5QCP92CKBU4PFHZXWX4Y7XZ6C2I';

// 1. Fetcher for basic market data from CoinGecko
async function fetchMarketData(chainIds: string[]): Promise<Map<string, Partial<Chain>>> {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${chainIds.join(',')}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch market data from CoinGecko');
  const data = await response.json();
  
  const marketData = new Map<string, Partial<Chain>>();
  data.forEach((coin: any) => {
    marketData.set(coin.id, {
      price: coin.current_price,
      market_cap: coin.market_cap,
      price_change_24h: coin.price_change_percentage_24h,
      logo: coin.image,
    });
  });
  return marketData;
}

// 2. Fetcher for Ethereum gas fees
async function fetchEthGasFees(): Promise<Partial<Chain>> {
  const url = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) return { gas_fees: 'N/A' };
  const data = await response.json();
  if (data.status === '1') {
    return { gas_fees: `${data.result.SafeGasPrice} Gwei` };
  }
  return { gas_fees: 'N/A' };
}

// 3. Fetcher for TVL from DeFiLlama
async function fetchTvlData(): Promise<Map<string, number>> {
  const response = await fetch('https://api.llama.fi/protocols');
  if (!response.ok) throw new Error('Failed to fetch TVL data from DeFiLlama');
  const data = await response.json();

  const tvlData = new Map<string, number>();
  data.forEach((protocol: any) => {
    // DeFiLlama uses chain names which might differ from our IDs. We map them here.
    const chainName = protocol.chain;
    // Sum TVL for all protocols on the same chain
    tvlData.set(chainName, (tvlData.get(chainName) || 0) + protocol.tvl);
  });
  return tvlData;
}


// Main orchestration function
export async function fetchAllChainData(): Promise<Chain[]> {
  const allChainIds = CHAINS.flatMap(c => [c.id, ...(c.l2s?.map(l2 => l2.id) || [])]);
  
  const [marketData, ethGasFees, tvlData] = await Promise.all([
    fetchMarketData(allChainIds),
    fetchEthGasFees(),
    fetchTvlData(),
    // We will add TPS fetchers here later
  ]);

  const combinedData = CHAINS.map(chain => {
    const enrichedChain = { ...chain, ...marketData.get(chain.id) };

    if (chain.id === 'ethereum') {
      enrichedChain.gas_fees = ethGasFees.gas_fees;
    }
    
    // This is a simplified mapping. A more robust solution would be needed for accuracy.
    const tvl = tvlData.get(chain.name);
    if (tvl) enrichedChain.tvl = tvl;

    if (enrichedChain.l2s) {
      enrichedChain.l2s = enrichedChain.l2s.map(l2 => {
        const enrichedL2 = { ...l2, ...marketData.get(l2.id) };
        const l2Tvl = tvlData.get(l2.name);
        if (l2Tvl) enrichedL2.tvl = l2Tvl;
        return enrichedL2;
      });
    }
    
    return enrichedChain;
  });

  return combinedData;
} 