use axum::{
    extract::State, http::StatusCode, response::IntoResponse, routing::get, Json, Router,
};
use dotenv::dotenv;
use futures::future;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::env;
use std::sync::Arc;
use tokio::sync::Mutex;
use tower_http::cors::{Any, CorsLayer};

// All the structs from the previous backend/src/main.rs
// ... (CoinGeckoMarket, EtherscanGasResult, etc.) ...

// The AppState struct
#[derive(Clone)]
struct AppState {
    client: Client,
    etherscan_api_key: String,
}

// The main handler that Vercel will run
#[tokio::main]
async fn main() -> Result<(), vercel_runtime::Error> {
    dotenv().ok();
    let app = app();
    vercel_runtime::run(app).await
}

// Function to build the Axum app
fn app() -> Router {
    let etherscan_api_key =
        env::var("ETHERSCAN_API_KEY").unwrap_or_else(|_| "YOUR_API_KEY_HERE".to_string());
    
    let shared_state = Arc::new(Mutex::new(AppState {
        client: Client::new(),
        etherscan_api_key,
    }));

    Router::new()
        .route("/api/chains", get(get_chains_data))
        .route("/api/eth_l2", get(get_eth_l2_data))
        .with_state(shared_state)
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any))
}

// All the handler functions and helpers from the previous backend
// ... (get_chains_data, get_eth_l2_data, fetch_aptos_tps, etc.) ...
// Note: The Result<T> and Error types might need slight adjustments for Vercel's runtime
// For now, keeping them as is for structural correctness.
pub type Result<T> = std::result::Result<T, Error>;
#[derive(Debug, Clone, Serialize)]
pub enum Error { ApiRequestFailed }
impl IntoResponse for Error {
    // ...
}
// ... 