use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use dotenv::dotenv;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::env;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::Mutex;
use tower_http::cors::{Any, CorsLayer};
use serde_json::Value;
use std::time::Duration;
use futures::future;
use tower_http::{services::ServeDir, trace::TraceLayer};

// region: --- Error
pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, Clone, Serialize)]
pub enum Error {
    ApiRequestFailed,
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        let mut response = (StatusCode::INTERNAL_SERVER_ERROR, "UNHANDLED_CLIENT_ERROR").into_response();
        response.extensions_mut().insert(Arc::new(self));
        response
    }
}
// endregion: --- Error

// region: --- API Response Structs
#[derive(Deserialize, Debug)]
struct CoinGeckoMarket {
    id: String,
    symbol: String,
    name: String,
    current_price: Option<f64>,
    market_cap: Option<f64>,
    price_change_percentage_24h: Option<f64>,
}

#[derive(Deserialize, Debug)]
struct EtherscanGasResult {
    #[serde(rename = "SafeGasPrice")]
    safe_gas_price: String,
}

#[derive(Deserialize, Debug)]
struct EtherscanGasResponse {
    result: EtherscanGasResult,
}

#[derive(Deserialize, Debug)]
struct DefiLlamaProtocol {
    name: String,
    symbol: String,
    tvl: f64,
    chain: String,
}

#[derive(Deserialize, Debug, Clone)]
struct AptosBlock {
    block_height: String,
    block_timestamp: String,
    #[serde(default)]
    transactions: Vec<Value>,
}

#[derive(Deserialize, Debug)]
struct SeiBlockResponse {
    block: SeiBlock,
}

#[derive(Deserialize, Debug)]
struct SeiBlock {
    header: SeiHeader,
    data: SeiData,
}

#[derive(Deserialize, Debug)]
struct SeiHeader {
    height: String,
    time: String,
}

#[derive(Deserialize, Debug)]
struct SeiData {
    txs: Vec<String>,
}

#[derive(Deserialize, Debug, Clone)]
struct SuiCheckpoint {
    sequence_number: String,
    timestamp_ms: String,
    network_total_transactions: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct SuiRpcResponse<T> {
    result: T,
}
// endregion: --- API Response Structs

// region: --- App State
#[derive(Clone)]
struct AppState {
    client: Client,
    etherscan_api_key: String,
}
// endregion: --- App State

#[tokio::main]
async fn main() {
    dotenv().ok();

    let etherscan_api_key =
        env::var("ETHERSCAN_API_KEY").expect("ETHERSCAN_API_KEY must be set.");

    let shared_state = Arc::new(Mutex::new(AppState {
        client: Client::new(),
        etherscan_api_key,
    }));

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/chains", get(get_chains_data))
        .route("/api/eth/l2", get(get_eth_l2_data))
        .with_state(shared_state)
        .layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    println!("->> LISTENING on http://{addr}\n");

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// region: --- API Data Structs
#[derive(Serialize, Deserialize, Debug, Clone)]
struct ChainData {
    name: String,
    symbol: String,
    price_usd: Option<f64>,
    market_cap: Option<f64>,
    price_change_24h: Option<f64>,
    gas_fees: Option<String>,
    tps: Option<String>,
    tvl: Option<f64>,
    explorer_url: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct L2Data {
    name: String,
    symbol: String,
    tvl: Option<f64>,
    explorer_url: String,
}
// endregion: --- API Data Structs

async fn get_chains_data(
    state: axum::extract::State<Arc<Mutex<AppState>>>,
) -> Result<Json<Vec<ChainData>>> {
    let state = state.lock().await;
    let client = &state.client;

    let coingecko_ids = "aptos,sui,sei-network,ethereum";
    let coingecko_url = format!(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids={}",
        coingecko_ids
    );

    let coingecko_data: Vec<CoinGeckoMarket> = client
        .get(&coingecko_url)
        .send()
        .await
        .map_err(|_| Error::ApiRequestFailed)?
        .json()
        .await
        .map_err(|_| Error::ApiRequestFailed)?;

    let etherscan_gas_url = format!(
        "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey={}",
        state.etherscan_api_key
    );
    let eth_gas_data: EtherscanGasResponse = client
        .get(&etherscan_gas_url)
        .send()
        .await
        .map_err(|_| Error::ApiRequestFailed)?
        .json()
        .await
        .map_err(|_| Error::ApiRequestFailed)?;

    let mut chains: Vec<ChainData> = coingecko_data
        .into_iter()
        .map(|market| ChainData {
            name: market.name,
            symbol: market.symbol.to_uppercase(),
            price_usd: market.current_price,
            market_cap: market.market_cap,
            price_change_24h: market.price_change_percentage_24h,
            gas_fees: None,
            tps: None,
            tvl: None,
            explorer_url: get_explorer_url(&market.id),
        })
        .collect();

    // region: --- TPS Calculation
    let tps_futures = chains.iter_mut().map(|chain| {
        let client = client.clone();
        async move {
            let tps = match chain.name.as_str() {
                "Aptos" => fetch_aptos_tps(&client).await,
                "Sui" => fetch_sui_tps(&client).await,
                "Sei" => fetch_sei_tps(&client).await,
                _ => Ok(None),
            };
            if let Ok(Some(tps_val)) = tps {
                chain.tps = Some(format!("{:.2}", tps_val));
            }
        }
    });
    future::join_all(tps_futures).await;
    // endregion: --- TPS Calculation

    if let Some(eth) = chains.iter_mut().find(|c| c.name == "Ethereum") {
        eth.gas_fees = Some(format!("{} Gwei", eth_gas_data.result.safe_gas_price));
    }

    Ok(Json(chains))
}

async fn get_eth_l2_data(
    state: axum::extract::State<Arc<Mutex<AppState>>>,
) -> Result<Json<Vec<L2Data>>> {
    let state = state.lock().await;
    let client = &state.client;
    let defillama_url = "https://api.llama.fi/protocols";

    let all_protocols: Vec<DefiLlamaProtocol> = client
        .get(defillama_url)
        .send()
        .await
        .map_err(|_| Error::ApiRequestFailed)?
        .json()
        .await
        .map_err(|_| Error::ApiRequestFailed)?;

    let l2_names = ["Arbitrum", "Optimism", "zkSync Era", "Base"];
    let l2_data: Vec<L2Data> = all_protocols
        .into_iter()
        .filter(|p| l2_names.contains(&p.name.as_str()) && p.chain == "Ethereum")
        .map(|p| L2Data {
            name: p.name.clone(),
            symbol: p.symbol.clone(),
            tvl: Some(p.tvl),
            explorer_url: get_explorer_url(&p.name.to_lowercase().replace(" ", "")),
        })
        .collect();

    Ok(Json(l2_data))
}

// region: --- TPS Fetching
async fn fetch_aptos_tps(client: &Client) -> Result<Option<f64>> {
    let latest_block_resp = client
        .get("https://fullnode.mainnet.aptoslabs.com/v1/blocks/by_height/0?with_transactions=true")
        .await;
    
    // Aptos specific logic to get latest block and calculate TPS
    let latest_block: AptosBlock = client
        .get("https://fullnode.mainnet.aptoslabs.com/v1/blocks/by_height/0?with_transactions=true")
        .send()
        .await.map_err(|_| Error::ApiRequestFailed)?
        .json()
        .await.map_err(|_| Error::ApiRequestFailed)?;

    let prev_height = latest_block.block_height.parse::<u64>().unwrap_or(1) - 1;
    let prev_block: AptosBlock = client
        .get(&format!("https://fullnode.mainnet.aptoslabs.com/v1/blocks/by_height/{}?with_transactions=false", prev_height))
        .send()
        .await.map_err(|_| Error::ApiRequestFailed)?
        .json()
        .await.map_err(|_| Error::ApiRequestFailed)?;

    let tx_count = latest_block.transactions.len() as f64;
    let time_diff = (latest_block.block_timestamp.parse::<u64>().unwrap_or(0) - prev_block.block_timestamp.parse::<u64>().unwrap_or(0)) as f64 / 1_000_000.0;
    
    if time_diff > 0.0 {
        Ok(Some(tx_count / time_diff))
    } else {
        Ok(None)
    }
}

async fn fetch_sui_tps(client: &Client) -> Result<Option<f64>> {
    let body_latest = serde_json::json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "sui_getLatestCheckpointSequenceNumber"
    });

    let latest_cp_seq_num_str: SuiRpcResponse<String> = client
        .post("https://explorer-rpc.mainnet.sui.io/")
        .json(&body_latest)
        .send().await.map_err(|_| Error::ApiRequestFailed)?
        .json().await.map_err(|_| Error::ApiRequestFailed)?;
    
    let latest_cp_seq_num = latest_cp_seq_num_str.result.parse::<u64>().unwrap_or(0);

    let body_cp_latest = serde_json::json!({
        "jsonrpc": "2.0", "id": 1, "method": "sui_getCheckpoint", "params": [latest_cp_seq_num.to_string()]
    });
    let body_cp_prev = serde_json::json!({
        "jsonrpc": "2.0", "id": 1, "method": "sui_getCheckpoint", "params": [(latest_cp_seq_num-10).to_string()]
    });

    let latest_cp: SuiRpcResponse<SuiCheckpoint> = client.post("https://explorer-rpc.mainnet.sui.io/").json(&body_cp_latest).send().await.map_err(|_| Error::ApiRequestFailed)?.json().await.map_err(|_| Error::ApiRequestFailed)?;
    let prev_cp: SuiRpcResponse<SuiCheckpoint> = client.post("https://explorer-rpc.mainnet.sui.io/").json(&body_cp_prev).send().await.map_err(|_| Error::ApiRequestFailed)?.json().await.map_err(|_| Error::ApiRequestFailed)?;

    let tx_diff = latest_cp.result.network_total_transactions.parse::<f64>().unwrap_or(0.0) - prev_cp.result.network_total_transactions.parse::<f64>().unwrap_or(0.0);
    let time_diff_ms = latest_cp.result.timestamp_ms.parse::<f64>().unwrap_or(0.0) - prev_cp.result.timestamp_ms.parse::<f64>().unwrap_or(0.0);
    
    if time_diff_ms > 0.0 {
        Ok(Some(tx_diff / (time_diff_ms / 1000.0)))
    } else {
        Ok(None)
    }
}

async fn fetch_sei_tps(client: &Client) -> Result<Option<f64>> {
    let latest_block_resp: SeiBlockResponse = client
        .get("https://rest.sei-apis.com/cosmos/base/tendermint/v1beta1/blocks/latest")
        .send().await.map_err(|_| Error::ApiRequestFailed)?
        .json().await.map_err(|_| Error::ApiRequestFailed)?;

    let height = latest_block_resp.block.header.height.parse::<u64>().unwrap_or(1) - 1;

    let prev_block_resp: SeiBlockResponse = client
        .get(&format!("https://rest.sei-apis.com/cosmos/base/tendermint/v1beta1/blocks/{}", height))
        .send().await.map_err(|_| Error::ApiRequestFailed)?
        .json().await.map_err(|_| Error::ApiRequestFailed)?;

    let tx_count = latest_block_resp.block.data.txs.len() as f64;

    let time_latest = chrono::DateTime::parse_from_rfc3339(&latest_block_resp.block.header.time).map_err(|_| Error::ApiRequestFailed)?;
    let time_prev = chrono::DateTime::parse_from_rfc3339(&prev_block_resp.block.header.time).map_err(|_| Error::ApiRequestFailed)?;
    
    let time_diff_secs = (time_latest - time_prev).num_milliseconds() as f64 / 1000.0;
    
    if time_diff_secs > 0.0 {
        Ok(Some(tx_count / time_diff_secs))
    } else {
        Ok(None)
    }
}
// endregion: --- TPS Fetching

fn get_explorer_url(id: &str) -> String {
    match id {
        "aptos" => "https://explorer.aptoslabs.com".to_string(),
        "sui" => "https://suiscan.xyz/mainnet".to_string(),
        "sei-network" => "https://www.seiscan.app".to_string(),
        "ethereum" => "https://etherscan.io".to_string(),
        "arbitrum" => "https://arbiscan.io".to_string(),
        "optimism" => "https://optimistic.etherscan.io".to_string(),
        "zksyncera" => "https://explorer.zksync.io".to_string(),
        "base" => "https://basescan.org".to_string(),
        _ => "".to_string(),
    }
} 