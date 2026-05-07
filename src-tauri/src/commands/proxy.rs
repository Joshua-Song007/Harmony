use std::sync::Arc;
use tauri::State;
use crate::state::AppState;

#[tauri::command]
pub fn get_proxy_port(state: State<Arc<AppState>>) -> u16 {
    state.port
}
