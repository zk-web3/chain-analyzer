import axios from 'axios';

function safeLength(arr: unknown): number {
  return Array.isArray(arr) ? arr.length : 0;
}

const ETHERSCAN_BASES: Record<string, string> = {
  eth: 'https://api.etherscan.io/api',
  arbitrum: 'https://api.arbiscan.io/api',
  optimism: 'https://api-optimistic.etherscan.io/api',
  base: 'https://api.basescan.org/api',
};

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

export async function getChainStats(chain: string) {
  if (ETHERSCAN_BASES[chain]) {
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
    let txCount = 0;
    try {
      const blockInfo = await axios.get(ETHERSCAN_BASES[chain], {
        params: { module: 'proxy', action: 'eth_getBlockByNumber', tag: blockRes.data.result, boolean: 'true', apikey: ETHERSCAN_API_KEY },
      });
      const result = blockInfo && blockInfo.data && blockInfo.data.result ? blockInfo.data.result : {};
      txCount = safeLength(result.transactions);
    } catch (err) {
      console.warn('Error fetching or parsing blockInfo for txCount:', err);
      txCount = 0;
    }
    return {
      latestBlock: blockNum,
      gasPrice: `${parseInt(gasRes.data.result, 16) / 1e9} Gwei`,
      totalTxs: 'Live',
      tps: txCount, // Approximate
    };
  }
  // Aptos (Explorer API)
  if (chain === 'aptos') {
    const res = await axios.get('https://explorer-api.mainnet.aptoslabs.com/v1/blocks?limit=1');
    return { latestBlock: res.data.blocks[0]?.height, gasPrice: '-', totalTxs: '-', tps: '-' };
  }
  // SUI (Explorer API)
  if (chain === 'sui') {
    const res = await axios.get('https://explorer-rpc.mainnet.sui.io/', {
      params: { method: 'getBlocks', limit: 1 },
    });
    return { latestBlock: res.data.result?.data?.[0]?.number, gasPrice: '-', totalTxs: '-', tps: '-' };
  }
  // SEI (SeiScan API)
  if (chain === 'sei') {
    const res = await axios.get('https://rest.seiscan.app/blocks/latest');
    return { latestBlock: res.data.block.header.height, gasPrice: '-', totalTxs: '-', tps: '-' };
  }
  return null;
}

export async function getLatestTransactions(chain: string) {
  if (ETHERSCAN_BASES[chain]) {
    // Use a well-known address for demo, or fetch latest block and get txs
    const blockRes = await axios.get(ETHERSCAN_BASES[chain], {
      params: { module: 'proxy', action: 'eth_blockNumber', apikey: ETHERSCAN_API_KEY },
    });
    const blockInfo = await axios.get(ETHERSCAN_BASES[chain], {
      params: { module: 'proxy', action: 'eth_getBlockByNumber', tag: blockRes.data.result, boolean: 'true', apikey: ETHERSCAN_API_KEY },
    });
    const txs = blockInfo.data.result.transactions.slice(-10).map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      explorerUrl: `${ETHERSCAN_BASES[chain].replace('/api','')}/tx/${tx.hash}`,
    }));
    return txs;
  }
  // Aptos (Explorer API)
  if (chain === 'aptos') {
    const res = await axios.get('https://explorer-api.mainnet.aptoslabs.com/v1/transactions?limit=10');
    return res.data.transactions.map((tx: any) => ({
      hash: tx.hash,
      from: tx.sender,
      to: tx.receiver || '-',
      value: '-',
      explorerUrl: `https://explorer.aptoslabs.com/txn/${tx.hash}`,
    }));
  }
  // SUI (Explorer API)
  if (chain === 'sui') {
    const res = await axios.get('https://explorer-rpc.mainnet.sui.io/', {
      params: { method: 'getTransactions', limit: 10 },
    });
    return (res.data.result?.data || []).map((tx: any) => ({
      hash: tx.digest,
      from: tx.sender || '-',
      to: '-',
      value: '-',
      explorerUrl: `https://suiexplorer.com/txblock/${tx.digest}`,
    }));
  }
  // SEI (SeiScan API)
  if (chain === 'sei') {
    const res = await axios.get('https://rest.seiscan.app/txs?limit=10');
    return res.data.txs.map((tx: any) => ({
      hash: tx.txhash,
      from: tx.tx?.value?.msg?.[0]?.value?.from_address || '-',
      to: tx.tx?.value?.msg?.[0]?.value?.to_address || '-',
      value: '-',
      explorerUrl: `https://www.seiscan.app/sei/tx/${tx.txhash}`,
    }));
  }
  return [];
}

export async function getWalletInfo(chain: string, address: string) {
  if (ETHERSCAN_BASES[chain]) {
    const balRes = await axios.get(ETHERSCAN_BASES[chain], {
      params: { module: 'account', action: 'balance', address, tag: 'latest', apikey: ETHERSCAN_API_KEY },
    });
    const txRes = await axios.get(ETHERSCAN_BASES[chain], {
      params: { module: 'account', action: 'txlist', address, startblock: 0, endblock: 99999999, page: 1, offset: 10, sort: 'desc', apikey: ETHERSCAN_API_KEY },
    });
    return { balance: balRes.data.result, txs: txRes.data.result.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      explorerUrl: `${ETHERSCAN_BASES[chain].replace('/api','')}/tx/${tx.hash}`,
    })) };
  }
  // Aptos, SUI, SEI: implement as needed
  return null;
} 