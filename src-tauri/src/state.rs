use std::sync::{Arc, Mutex};
use crate::client::retry::RetryBuffer;

pub struct AppState {
    pub client: reqwest::Client,
    pub retry_buf: Arc<RetryBuffer>,
    pub port: u16,
    pub db: Mutex<rusqlite::Connection>,
}
