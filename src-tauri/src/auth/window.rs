use tauri::{AppHandle, Manager, WebviewWindowBuilder};
use crate::client::http::SAFARI_UA;

const AUTH_WINDOW_LABEL: &str = "auth";
const AUTH_URL: &str = "https://music.amazon.com/login";

pub fn create_auth_window(app: &AppHandle) -> tauri::Result<()> {
    WebviewWindowBuilder::new(
        app,
        AUTH_WINDOW_LABEL,
        tauri::WebviewUrl::External(AUTH_URL.parse().unwrap()),
    )
    .title("Harmony — Sign In")
    .visible(false)
    .user_agent(SAFARI_UA)
    .build()?;

    Ok(())
}

pub fn terminate_auth_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window(AUTH_WINDOW_LABEL) {
        let _ = window.close();
    }
}
