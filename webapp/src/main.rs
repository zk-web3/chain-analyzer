use gloo_storage::{LocalStorage, Storage};
use gloo_timers::callback::Interval;
use serde::{Deserialize, Serialize};
use web_sys::HtmlInputElement;
use yew::prelude::*;
use gloo_net::http::Request;

// region: --- Data Structs
#[derive(Clone, PartialEq, Serialize, Deserialize, Debug)]
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

#[derive(Clone, PartialEq, Serialize, Deserialize, Debug)]
struct L2Data {
    name: String,
    symbol: String,
    tvl: Option<f64>,
    explorer_url: String,
}

#[derive(Clone, PartialEq)]
enum FetchState<T> {
    Loading,
    Success(T),
    Error(String),
}

#[derive(Clone, PartialEq, Copy)]
enum Theme {
    Light,
    Dark,
}
// endregion: --- Data Structs

// region: --- API Fetching
fn get_api_base_url() -> &'static str {
    option_env!("API_BASE_URL").unwrap_or("http://127.0.0.1:8080")
}

async fn fetch_chains() -> Result<Vec<ChainData>, gloo_net::Error> {
    let url = format!("{}/api/chains", get_api_base_url());
    Request::get(&url)
        .send()
        .await?
        .json()
        .await
}

async fn fetch_l2s() -> Result<Vec<L2Data>, gloo_net::Error> {
    let url = format!("{}/api/eth/l2", get_api_base_url());
    Request::get(&url)
        .send()
        .await?
        .json()
        .await
}
// endregion: --- API Fetching


#[function_component(App)]
fn app() -> Html {
    let chains_state = use_state(|| FetchState::Loading);
    let l2_state = use_state(|| FetchState::Loading);
    let l2_visible = use_state(|| false);
    let search_term = use_state(String::new);
    let theme = use_state(|| {
        LocalStorage::get("theme").unwrap_or(Theme::Dark)
    });

    // Effect for theme
    use_effect_with(*theme, move |theme| {
        LocalStorage::set("theme", *theme).ok();
        if let Some(body) = web_sys::window().and_then(|w| w.document()).and_then(|d| d.body()) {
            match theme {
                Theme::Dark => body.class_list().remove_1("light-mode").ok(),
                Theme::Light => body.class_list().add_1("light-mode").ok(),
            };
        }
        || ()
    });

    // Data fetching and refresh
    {
        let chains_state = chains_state.clone();
        let l2_state = l2_state.clone();
        use_effect_with((), move |_| {
            let chains_state = chains_state.clone();
            let l2_state = l2_state.clone();
            wasm_bindgen_futures::spawn_local(async move {
                match fetch_chains().await {
                    Ok(data) => chains_state.set(FetchState::Success(data)),
                    Err(e) => chains_state.set(FetchState::Error(e.to_string())),
                }
                match fetch_l2s().await {
                    Ok(data) => l2_state.set(FetchState::Success(data)),
                    Err(e) => l2_state.set(FetchState::Error(e.to_string())),
                }
            });
            || ()
        });

        use_effect(|| {
            let interval = Interval::new(60_000, move || {
                let chains_state = chains_state.clone();
                let l2_state = l2_state.clone();
                wasm_bindgen_futures::spawn_local(async move {
                    if let Ok(data) = fetch_chains().await {
                        chains_state.set(FetchState::Success(data));
                    }
                    if let Ok(data) = fetch_l2s().await {
                        l2_state.set(FetchState::Success(data));
                    }
                });
            });
            || drop(interval)
        });
    }

    // Callbacks
    let on_search = {
        let search_term = search_term.clone();
        Callback::from(move |e: InputEvent| {
            let input: HtmlInputElement = e.target_unchecked_into();
            search_term.set(input.value());
        })
    };

    let toggle_theme = {
        let theme = theme.clone();
        Callback::from(move |_| {
            theme.set(if *theme == Theme::Dark { Theme::Light } else { Theme::Dark })
        })
    };

    let toggle_l2_visibility = {
        let l2_visible = l2_visible.clone();
        Callback::from(move |_| l2_visible.set(!*l2_visible))
    };

    // Rendering logic
    let displayed_chains = match &*chains_state {
        FetchState::Success(chains) => {
            let term = search_term.to_lowercase();
            chains
                .iter()
                .filter(|c| c.name.to_lowercase().contains(&term) || c.symbol.to_lowercase().contains(&term))
                .cloned()
                .collect::<Vec<_>>()
        }
        _ => vec![],
    };

    let eth_card = displayed_chains.iter().find(|c| c.name == "Ethereum").cloned();
    let other_chains = displayed_chains.iter().filter(|c| c.name != "Ethereum").cloned().collect::<Vec<_>>();

    html! {
        <main>
            <header>
                <h1>{"zk L1 CA"}</h1>
                <p>{"A real-time dashboard for L1 blockchains and Ethereum L2s"}</p>
                <div class="controls">
                    <input type="search" placeholder="Search chains..." value={(*search_term).clone()} oninput={on_search} />
                    <button onclick={toggle_theme}>{if *theme == Theme::Dark { "Light Mode" } else { "Dark Mode" }}</button>
                </div>
            </header>

            <div class="chain-grid">
                {
                    match &*chains_state {
                        FetchState::Loading => html!{ <p>{"Loading chain data..."}</p> },
                        FetchState::Error(e) => html!{ <p>{format!("Error: {}", e)}</p> },
                        FetchState::Success(_) => {
                            other_chains.into_iter().map(|chain| {
                                html! { <ChainCard chain={chain} /> }
                            }).collect::<Html>()
                        }
                    }
                }
                {
                    if let Some(eth) = eth_card {
                        html! {
                            <div class="chain-card ethereum-card">
                                <div class="card-header" onclick={toggle_l2_visibility}>
                                    <ChainCardHeader chain={eth.clone()} />
                                    <span class="collapse-icon">{ if *l2_visible { "[-]" } else { "[+]" } }</span>
                                </div>
                                { if *l2_visible {
                                    html! {
                                        <div class="l2-section">
                                            <h4>{"Ethereum Layer 2s"}</h4>
                                            {
                                                match &*l2_state {
                                                    FetchState::Loading => html!{ <p>{"Loading L2 data..."}</p> },
                                                    FetchState::Error(e) => html!{ <p>{format!("Error L2s: {}", e)}</p> },
                                                    FetchState::Success(l2s) => {
                                                        l2s.iter().map(|l2| html!{ <L2Card l2={l2.clone()} /> }).collect::<Html>()
                                                    }
                                                }
                                            }
                                        </div>
                                    }
                                } else { html!{} }}
                            </div>
                        }
                    } else if search_term.is_empty() {
                         html!{} 
                    } else { 
                        html!{}
                    }
                }
            </div>
        </main>
    }
}

#[derive(Properties, PartialEq)]
struct ChainCardProps {
    chain: ChainData,
}

#[function_component(ChainCard)]
fn chain_card(props: &ChainCardProps) -> Html {
    html! {
        <div class="chain-card">
            <ChainCardHeader chain={props.chain.clone()} />
        </div>
    }
}

#[function_component(ChainCardHeader)]
fn chain_card_header(props: &ChainCardProps) -> Html {
    let price_change_class = props.chain.price_change_24h.map_or("", |v| if v >= 0.0 { "positive" } else { "negative" });
    html! {
        <>
            <div class="card-title">
                <h2>{ &props.chain.name }</h2>
                <span>{ format!("({})", &props.chain.symbol) }</span>
            </div>
            <div class="card-body">
                <p class="price">{format!("${:.2}", props.chain.price_usd.unwrap_or(0.0))}</p>
                <p class={price_change_class}>{format!("{:.2}% (24h)", props.chain.price_change_24h.unwrap_or(0.0))}</p>
                <p>{format!("Market Cap: ${:.*}", 0, props.chain.market_cap.unwrap_or(0.0) as u64)}</p>
                if let Some(gas) = &props.chain.gas_fees {
                    <p>{format!("Gas: {}", gas)}</p>
                }
                if let Some(tps) = &props.chain.tps {
                    <p>{format!("TPS: {}", tps)}</p>
                }
            </div>
            <a href={props.chain.explorer_url.clone()} target="_blank">{"Explorer"}</a>
        </>
    }
}

#[derive(Properties, PartialEq)]
struct L2CardProps {
    l2: L2Data,
}

#[function_component(L2Card)]
fn l2_card(props: &L2CardProps) -> Html {
    html! {
        <div class="l2-card">
            <div class="card-title">
                <h4>{ &props.l2.name }</h4>
                <span>{ format!("({})", &props.l2.symbol) }</span>
            </div>
            <p>{format!("TVL: ${:.*}", 0, props.l2.tvl.unwrap_or(0.0) as u64)}</p>
            <a href={props.l2.explorer_url.clone()} target="_blank">{"Explorer"}</a>
        </div>
    }
}


fn main() {
    yew::Renderer::<App>::new().render();
} 