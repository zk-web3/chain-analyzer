const { ethers } = require('ethers');

// This is a placeholder for the data fetching logic.
// In a real application, you would fetch this data from various APIs.
// For example, CoinGecko for market data, Etherscan for gas fees, etc.

async function getChainsData() {
    // These are example coingecko IDs.
    const coingecko_ids = "aptos,sui,sei-network,ethereum";
    const coingecko_url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coingecko_ids}`;

    try {
        const coingecko_res = await fetch(coingecko_url);
        const coingecko_data = await coingecko_res.json();
        
        const chains = coingecko_data.map(market => ({
            name: market.name,
            symbol: market.symbol.toUpperCase(),
            price_usd: market.current_price,
            market_cap: market.market_cap,
            price_change_24h: market.price_change_percentage_24h,
            gas_fees: null, // Will be fetched separately for ETH
            tps: null, // TPS would require more complex calculations/sources
            tvl: null, // TVL would be fetched from a source like DefiLlama
            explorer_url: getExplorerUrl(market.id),
        }));

        // Fetch ETH gas price from Etherscan
        const etherscan_api_key = process.env.ETHERSCAN_API_KEY;
        if(etherscan_api_key) {
            const etherscan_gas_url = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${etherscan_api_key}`;
            const gas_res = await fetch(etherscan_gas_url);
            const gas_data = await gas_res.json();
            
            if (gas_data.status === "1") {
                const ethChain = chains.find(c => c.name === 'Ethereum');
                if (ethChain) {
                    ethChain.gas_fees = `${gas_data.result.SafeGasPrice} Gwei`;
                }
            }
        }

        return chains;

    } catch (error) {
        console.error("Failed to fetch chain data:", error);
        return [];
    }
}


function getExplorerUrl(id) {
    switch (id) {
        case "aptos": return "https://explorer.aptoslabs.com";
        case "sui": return "https://suiscan.xyz/mainnet";
        case "sei-network": return "https://www.seiscan.app";
        case "ethereum": return "https://etherscan.io";
        case "arbitrum": return "https://arbiscan.io";
        case "optimism": return "https://optimistic.etherscan.io";
        case "zksyncera": return "https://explorer.zksync.io";
        case "base": return "https://basescan.org";
        default: return "";
    }
}


module.exports = async (req, res) => {
    const data = await getChainsData();
    res.status(200).json(data);
}; 