use tauri::AppHandle;
use crate::auth::create_auth_window;

#[tauri::command]
pub async fn trigger_reauth(app: AppHandle) -> Result<(), String> {
    create_auth_window(&app).map_err(|e| e.to_string())
}
