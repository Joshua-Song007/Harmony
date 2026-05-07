use tauri::{AppHandle, Emitter};

pub fn emit_reauth_required(app: &AppHandle) {
    let _ = app.emit("reauth-required", ());
}
