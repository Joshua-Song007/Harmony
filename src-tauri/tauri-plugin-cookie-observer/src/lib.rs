use tauri::{plugin::{Builder, TauriPlugin}, AppHandle, Emitter, Runtime};
use serde::Serialize;
use std::{sync::mpsc, thread, time::Duration};

#[derive(Debug, Clone, Serialize)]
pub struct CapturedTokens {
    pub session_id: String,
    pub at_main: String,
    pub ubid_main: String,
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("cookie-observer")
        .build()
}

// Called explicitly when an auth window is opened — not on every launch.
pub fn start_polling<R: Runtime>(app: AppHandle<R>) {
    thread::spawn(move || poll_cookies(app));
}

fn poll_cookies<R: Runtime>(app: AppHandle<R>) {
    loop {
        thread::sleep(Duration::from_millis(500));
        let (tx, rx) = mpsc::channel::<Option<CapturedTokens>>();

        if app.run_on_main_thread(move || check_on_main(tx)).is_err() {
            break;
        }

        match rx.recv_timeout(Duration::from_secs(3)) {
            Ok(Some(tokens)) => {
                let _ = app.emit("cookies-captured", tokens);
                break;
            }
            Err(mpsc::RecvTimeoutError::Disconnected) => break,
            _ => {}
        }
    }
}

fn check_on_main(tx: mpsc::Sender<Option<CapturedTokens>>) {
    #[cfg(target_os = "macos")]
    unsafe {
        use block2::RcBlock;
        use objc2_foundation::{NSArray, NSHTTPCookie};
        use objc2_web_kit::WKWebsiteDataStore;
        use std::ptr::NonNull;

        let store = WKWebsiteDataStore::defaultDataStore();
        let cookie_store = store.httpCookieStore();

        let block = RcBlock::new(move |cookies: NonNull<NSArray<NSHTTPCookie>>| {
            let arr = cookies.as_ref();
            let mut session_id = None::<String>;
            let mut at_main = None::<String>;
            let mut ubid_main = None::<String>;

            for i in 0..arr.count() {
                let cookie = arr.objectAtIndex(i);
                let name = cookie.name().to_string();
                let value = cookie.value().to_string();
                match name.as_str() {
                    "session-id" => session_id = Some(value),
                    "at-main" => at_main = Some(value),
                    "ubid-main" => ubid_main = Some(value),
                    _ => {}
                }
            }

            let result = match (session_id, at_main, ubid_main) {
                (Some(s), Some(a), Some(u)) if !a.is_empty() => Some(CapturedTokens {
                    session_id: s,
                    at_main: a,
                    ubid_main: u,
                }),
                _ => None,
            };
            let _ = tx.send(result);
        });

        cookie_store.getAllCookies(&block);
    }

    #[cfg(not(target_os = "macos"))]
    let _ = tx.send(None);
}
