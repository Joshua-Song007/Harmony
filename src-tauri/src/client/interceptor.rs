use std::sync::Arc;
use axum::http::StatusCode;
use tauri::AppHandle;
use crate::auth::emit_reauth_required;
use super::retry::{PendingRequest, RetryBuffer};

#[derive(Debug)]
pub enum AppError {
    Unauthorized,
    BadGateway(StatusCode),
    Request(reqwest::Error),
}

impl From<reqwest::Error> for AppError {
    fn from(e: reqwest::Error) -> Self {
        AppError::Request(e)
    }
}

pub async fn check(
    response: reqwest::Response,
    app: &AppHandle,
    retry_buf: &Arc<RetryBuffer>,
    req: PendingRequest,
) -> Result<reqwest::Response, AppError> {
    let status = response.status();

    if status.is_success() {
        return Ok(response);
    }

    if status == reqwest::StatusCode::UNAUTHORIZED || status == reqwest::StatusCode::FORBIDDEN {
        retry_buf.push(req);
        emit_reauth_required(app);
        return Err(AppError::Unauthorized);
    }

    Err(AppError::BadGateway(
        StatusCode::from_u16(status.as_u16())
            .unwrap_or(StatusCode::BAD_GATEWAY),
    ))
}
