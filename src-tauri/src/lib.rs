pub mod auth;
pub mod cache;
pub mod client;
pub mod commands;
pub mod error;
pub mod proxy;
pub mod state;
pub mod vault;

use std::sync::{Arc, Mutex};
use tauri::{Listener, Manager};
use client::retry::RetryBuffer;
use state::AppState;
use vault::Tokens;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_cookie_observer::init())
        .setup(|app| {
            let tokens = vault::keychain::load().unwrap_or(Tokens {
                session_id: String::new(),
                at_main: String::new(),
                ubid_main: String::new(),
            });

            let client = client::build_client(&tokens)
                .expect("failed to build HTTP client");

            let db_path = app.path()
                .app_data_dir()
                .expect("app data dir unavailable")
                .join("harmony.db");
            std::fs::create_dir_all(db_path.parent().unwrap()).ok();
            let conn = cache::db::init(&db_path)
                .expect("failed to init cache DB");
            cache::purge_expired(&conn).ok();

            // Bind synchronously — port is known before setup returns, fixing the
            // race where get_proxy_port was invoked before AppState was managed.
            let std_listener = std::net::TcpListener::bind("127.0.0.1:0")
                .expect("failed to bind proxy port");
            std_listener.set_nonblocking(true).expect("set_nonblocking failed");
            let port = std_listener.local_addr().unwrap().port();

            let state = Arc::new(AppState {
                client,
                retry_buf: Arc::new(RetryBuffer::new()),
                port,
                db: Mutex::new(conn),
            });

            app.manage(Arc::clone(&state));

            // Spawn only the axum server; everything else is already initialized.
            tauri::async_runtime::spawn(async move {
                let listener = tokio::net::TcpListener::from_std(std_listener)
                    .expect("failed to convert listener");
                let router = proxy::router::build(state);
                axum::serve(listener, router)
                    .await
                    .expect("proxy server error");
            });

            // Save tokens to Keychain and close auth window once the cookie
            // observer plugin captures them from WKWebsiteDataStore.
            let handle = app.handle().clone();
            app.listen("cookies-captured", move |event| {
                #[derive(serde::Deserialize)]
                struct CookiePayload {
                    session_id: String,
                    at_main: String,
                    ubid_main: String,
                }
                if let Ok(p) = serde_json::from_str::<CookiePayload>(event.payload()) {
                    let t = Tokens {
                        session_id: p.session_id,
                        at_main: p.at_main,
                        ubid_main: p.ubid_main,
                    };
                    vault::keychain::store(&t).ok();
                    auth::terminate_auth_window(&handle);
                }
            });

            if tokens.session_id.is_empty() {
                auth::create_auth_window(app.handle()).ok();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::proxy::get_proxy_port,
            commands::auth::trigger_reauth,
        ])
        .run(tauri::generate_context!())
        .expect("error running Harmony");
}
