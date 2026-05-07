use std::sync::Arc;
use axum::{routing::get, Router};
use crate::state::AppState;
use super::handlers;

pub fn build(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/library", get(handlers::library))
        .route("/api/search", get(handlers::search))
        .route("/api/track/:id", get(handlers::track))
        .with_state(state)
}
