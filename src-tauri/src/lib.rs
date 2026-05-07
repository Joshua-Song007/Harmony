pub mod auth;
pub mod cache;
pub mod client;
pub mod commands;
pub mod error;
pub mod proxy;
pub mod state;
pub mod vault;

use std::sync::{Arc, Mutex};
use tauri::Manager;
use tokio::net::TcpListener;
use client::retry::RetryBuffer;
use state::AppState;
use vault::Tokens;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_cookie_observer::init())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let tokens = vault::keychain::load().unwrap_or(Tokens {
                    session_id: String::new(),
                    at_main: String::new(),
                    ubid_main: String::new(),
                });

                let client = client::build_client(&tokens)
                    .expect("failed to build HTTP client");

                let db_path = handle
                    .path()
                    .app_data_dir()
                    .expect("app data dir unavailable")
                    .join("harmony.db");
                std::fs::create_dir_all(db_path.parent().unwrap()).ok();
                let conn = cache::db::init(&db_path)
                    .expect("failed to init cache DB");
                cache::purge_expired(&conn).ok();

                let listener = TcpListener::bind("127.0.0.1:0")
                    .await
                    .expect("failed to bind proxy port");
                let port = listener.local_addr().unwrap().port();

                let state = Arc::new(AppState {
                    client,
                    retry_buf: Arc::new(RetryBuffer::new()),
                    port,
                    db: Mutex::new(conn),
                });

                let router = proxy::router::build(Arc::clone(&state));
                tokio::spawn(async move {
                    axum::serve(listener, router)
                        .await
                        .expect("proxy server error");
                });

                handle.manage(state);

                if tokens.session_id.is_empty() {
                    auth::create_auth_window(&handle).ok();
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::proxy::get_proxy_port,
            commands::auth::trigger_reauth,
        ])
        .run(tauri::generate_context!())
        .expect("error running Harmony");
}
