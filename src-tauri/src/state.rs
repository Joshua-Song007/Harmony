use std::sync::{Arc, Mutex};
use tauri::AppHandle;
use crate::client::retry::RetryBuffer;

pub struct AppState {
    pub client: Mutex<reqwest::Client>,
    pub retry_buf: Arc<RetryBuffer>,
    pub port: u16,
    pub db: Mutex<rusqlite::Connection>,
    pub app_handle: AppHandle,
}
