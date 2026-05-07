use std::sync::Arc;
use axum::{
    extract::{Path, Query, State},
    response::IntoResponse,
    Json,
};
use reqwest::Method;
use serde::Deserialize;
use crate::client::{interceptor, retry::PendingRequest};
use crate::error::AppError;
use crate::state::AppState;

// Placeholder base — real paths confirmed from traffic inspection
const AMAZON_API: &str = "https://music.amazon.com/EU/api";

pub async fn library(State(state): State<Arc<AppState>>) -> Result<impl IntoResponse, AppError> {
    let url = format!("{AMAZON_API}/cirrus/v3/library");
    let client = state.client.lock().unwrap().clone();
    let pending = PendingRequest { url: url.clone(), method: Method::GET };
    let response = client.get(&url).send().await?;
    let response = interceptor::check(response, &state.app_handle, &state.retry_buf, pending).await?;
    let body: serde_json::Value = response.json().await?;
    Ok(Json(body))
}

#[derive(Deserialize)]
pub struct SearchParams {
    pub q: String,
}

pub async fn search(
    State(state): State<Arc<AppState>>,
    Query(params): Query<SearchParams>,
) -> Result<impl IntoResponse, AppError> {
    let url = format!("{AMAZON_API}/search");
    let client = state.client.lock().unwrap().clone();
    let pending = PendingRequest { url: url.clone(), method: Method::GET };
    let response = client.get(&url).query(&[("q", &params.q)]).send().await?;
    let response = interceptor::check(response, &state.app_handle, &state.retry_buf, pending).await?;
    let body: serde_json::Value = response.json().await?;
    Ok(Json(body))
}

pub async fn track(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let url = format!("{AMAZON_API}/track/{id}");
    let client = state.client.lock().unwrap().clone();
    let pending = PendingRequest { url: url.clone(), method: Method::GET };
    let response = client.get(&url).send().await?;
    let response = interceptor::check(response, &state.app_handle, &state.retry_buf, pending).await?;
    let body: serde_json::Value = response.json().await?;
    Ok(Json(body))
}
