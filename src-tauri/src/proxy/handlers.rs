use std::sync::Arc;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use crate::state::AppState;

// Placeholder base — real paths confirmed from traffic inspection
const AMAZON_API: &str = "https://music.amazon.com/EU/api";

type AppError = (StatusCode, String);

fn err(e: reqwest::Error) -> AppError {
    (StatusCode::BAD_GATEWAY, e.to_string())
}

pub async fn library(State(state): State<Arc<AppState>>) -> Result<impl IntoResponse, AppError> {
    let body: serde_json::Value = state
        .client
        .get(format!("{AMAZON_API}/cirrus/v3/library"))
        .send()
        .await
        .map_err(err)?
        .json()
        .await
        .map_err(err)?;

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
    let body: serde_json::Value = state
        .client
        .get(format!("{AMAZON_API}/search"))
        .query(&[("q", &params.q)])
        .send()
        .await
        .map_err(err)?
        .json()
        .await
        .map_err(err)?;

    Ok(Json(body))
}

pub async fn track(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let body: serde_json::Value = state
        .client
        .get(format!("{AMAZON_API}/track/{id}"))
        .send()
        .await
        .map_err(err)?
        .json()
        .await
        .map_err(err)?;

    Ok(Json(body))
}
