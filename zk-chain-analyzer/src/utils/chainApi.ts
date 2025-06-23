import axios from 'axios';

const ETHERSCAN_BASES: Record<string, string> = {
  eth: 'https://api.etherscan.io/api',
  arbitrum: 'https://api.arbiscan.io/api',
  optimism: 'https://api-optimistic.etherscan.io/api',
  base: 'https://api.basescan.org/api',
};

// Use the correct env variable for all EVM chains
const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_KEY;

function requireApiKey() {
  if (!ETHERSCAN_API_KEY) {
    throw new Error('Missing NEXT_PUBLIC_ETHERSCAN_KEY in your .env file');
  }
}

export async function getChainStats(chain: string) {
  if (ETHERSCAN_BASES[chain]) {
    requireApiKey();
    // Get block number
    const blockRes = await axios.get(ETHERSCAN_BASES[chain], {
      params: { module: 'proxy', action: 'eth_blockNumber', apikey: ETHERSCAN_API_KEY },
    });
    // Get gas price
    const gasRes = await axios.get(ETHERSCAN_BASES[chain], {
      params: { module: 'proxy', action: 'eth_gasPrice', apikey: ETHERSCAN_API_KEY },
    });
    // Get total txs (from latest block)
    const blockNum = parseInt(blockRes.data.result, 16);
    const blockInfo = await axios.get(ETHERSCAN_BASES[chain], {
      params: { module: 'proxy', action: 'eth_getBlockByNumber', tag: blockRes.data.result, boolean: 'true', apikey: ETHERSCAN_API_KEY },
    });
    const txCount = blockInfo.data.result.transactions.length;
    return {
      latestBlock: blockNum,
      gasPrice: `${parseInt(gasRes.data.result, 16) / 1e9} Gwei`,
      totalTxs: 'Live',
      tps: txCount, // Approximate
    };
  }
  // Aptos
  if (chain === 'aptos') {
    const res = await axios.get('https://fullnode.mainnet.aptoslabs.com/v1/transactions?limit=1');
    return { latestBlock: res.data[0]?.version, gasPrice: '-', totalTxs: '-', tps: '-' };
  }
  // SUI
  if (chain === 'sui') {
    // SUI JSON-RPC: getLatestCheckpointSequenceNumber
    const res = await axios.post('https://rpc.mainnet.sui.io', { jsonrpc: '2.0', id: 1, method: 'sui_getLatestCheckpointSequenceNumber', params: [] });
    return { latestBlock: res.data.result, gasPrice: '-', totalTxs: '-', tps: '-' };
  }
  // SEI
  if (chain === 'sei') {
    const res = await axios.get('https://rest.cosmos.directory/sei/blocks/latest');
    return { latestBlock: res.data.block.header.height, gasPrice: '-', totalTxs: '-', tps: '-' };
  }
  return null;
}

export async function getLatestTransactions(chain: string) {
  if (ETHERSCAN_BASES[chain]) {
    requireApiKey();
    const res = await axios.get(ETHERSCAN_BASES[chain], {
      params: { module: 'account', action: 'txlist', address: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', startblock: 0, endblock: 99999999, page: 1, offset: 10, sort: 'desc', apikey: ETHERSCAN_API_KEY },
    });
    return res.data.result;
  }
  // Aptos
  if (chain === 'aptos') {
    const res = await axios.get('https://fullnode.mainnet.aptoslabs.com/v1/transactions?limit=10');
    return res.data;
  }
  // SUI
  if (chain === 'sui') {
    // SUI JSON-RPC: get recent tx digests
    const res = await axios.post('https://rpc.mainnet.sui.io', { jsonrpc: '2.0', id: 1, method: 'sui_getRecentTransactions', params: [10] });
    return res.data.result;
  }
  // SEI
  if (chain === 'sei') {
    const res = await axios.get('https://rest.cosmos.directory/sei/txs?limit=10');
    return res.data.txs;
  }
  return [];
}

export async function getWalletInfo(chain: string, address: string) {
  if (ETHERSCAN_BASES[chain]) {
    requireApiKey();
    const balRes = await axios.get(ETHERSCAN_BASES[chain], {
      params: { module: 'account', action: 'balance', address, tag: 'latest', apikey: ETHERSCAN_API_KEY },
    });
    const txRes = await axios.get(ETHERSCAN_BASES[chain], {
      params: { module: 'account', action: 'txlist', address, startblock: 0, endblock: 99999999, page: 1, offset: 10, sort: 'desc', apikey: ETHERSCAN_API_KEY },
    });
    return { balance: balRes.data.result, txs: txRes.data.result };
  }
  // Aptos, SUI, SEI: implement as needed
  return null;
} 