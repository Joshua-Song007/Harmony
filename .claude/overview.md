# Harmony — Project Overview

## 1. Goal

A modular macOS desktop music player for **Amazon Music**.

**Motivation:** Zen Browser lacks a DRM license; this app leverages macOS's native WKWebView DRM capabilities (Safari/WebKit FairPlay/Widevine) instead.

**Stack:** Tauri v2 — Rust backend + Solid.js frontend.

---

## 2. Architecture: Hybrid Proxy Model

Split into two planes to keep the frontend ignorant of network complexity and keep credentials out of the JS heap.

### Control Plane (Rust Backend)

| Module | Role |
|---|---|
| `proxy.rs` | `axum` server on an ephemeral port — all metadata/manifest traffic |
| `client.rs` | `reqwest` client; spoofs Safari headers; injects Keychain tokens |
| `vault.rs` | macOS Keychain interface — stores `session-id`, `at-main`, `ubid-main` |
| `auth.rs` | Auth window lifecycle + WKHTTPCookieStoreObserver integration |
| `cache.rs` | SQLite-backed metadata/art cache (TTL: 21 days) |

### Data Plane (Frontend)

- **Framework:** Solid.js with Vite
- **Playback Engine:** Shaka Player — MPEG-DASH + DRM handshake
- **Provider Pattern:** `AmazonProvider` signal layer translates proxy JSON into Solid.js signals

---

## 3. Auth Flow

### First Launch
1. `create_auth_window()` opens a hidden Tauri window (`visible: false`) pointing to `music.amazon.com/login`
2. A native **WKHTTPCookieStoreObserver** (via `tauri::WebviewWindow` → `NSView` → `WKWebView` → `WKWebsiteDataStore.default().httpCookieStore`) watches for cookie changes
3. On cookie change, filter for Amazon-specific keys: `session-id`, `at-main`, `ubid-main`
4. On `at-main` verified → `vault.rs` writes tokens to macOS Keychain → `terminate_auth_window()` closes the hidden window immediately
5. Main window `userAgent` and `Origin` headers are set globally to match the proxy's spoofed Safari headers (required for DRM consistency)

### Re-Auth Flow (Token Expiry / 401 / 403)
1. **Monitor:** `client.rs` intercepts all `reqwest` responses — any `401`/`403` triggers re-auth
2. **Retry Buffer:** The last 3 failed requests are held in a queue while re-auth is pending
3. **Silent Path:** Attempt a headless WKWebView cookie-refresh first (reuse the WKHTTPCookieStoreObserver pattern)
4. **Loud Path:** If silent refresh fails → emit `reauth-required` Tauri event → UI displays a manual login modal

---

## 4. Cookie Interception (Native Observer)

```
tauri::WebviewWindow
  └── Swift Tauri Plugin (tauri-plugin-cookie-observer)
        └── WKWebView handle
              └── WKWebsiteDataStore.default().httpCookieStore
                    └── WKHTTPCookieStoreObserver (Swift protocol)
                          └── Filter: session-id, at-main, ubid-main
                                └── vault.rs → macOS Keychain
```

- Swift plugin conforms to `WKHTTPCookieStoreObserver` — fires on any cookie change during the login phase
- Polling fallback: every 500ms if observer registration fails
- Tokens emitted to Rust via Tauri plugin commands; written to Keychain immediately; never held in memory longer than necessary

---

## 5. Technical Constraints

| Feature | Detail |
|---|---|
| **DRM Strategy** | Metadata/manifests → Rust proxy. License challenges go **directly** JS → Amazon (never proxied). |
| **Header Spoofing** | Rust injects Safari/macOS `User-Agent` + `Origin` on every outbound request |
| **Port Management** | Rust selects an open ephemeral port at runtime; passed to frontend at startup |
| **DRM Level** | Widevine L3 (software). L1 unavailable without hardware-level platform certification. |
| **Main Window Headers** | `userAgent` and `Origin` set globally on the main window to match proxy headers for DRM consistency |

---

## 6. Local Cache

- **Storage:** SQLite on disk, persists across restarts
- **TTL:** 21 days per entry
- **Scope:** Metadata (track info, playlists, search results) and album art only
- **Excluded:** Auth tokens, binary audio data

---

## 7. Design Principles

- **Explicit failure:** Surface clear errors — no silent failures
- **Credential isolation:** Tokens never touch the JS heap
- **Re-auth transparency:** UI is notified only when silent refresh fails
- **Responsive UI:** Serve cached metadata instantly, revalidate in background

---

## 8. Development Roadmap

### Phase 1 — Vault & Auth
- `create_auth_window()`: hidden Tauri window → `music.amazon.com/login`
- Native WKHTTPCookieStoreObserver via Swift Tauri plugin → WKWebView bridge
- Filter and extract `session-id`, `at-main`, `ubid-main` → `vault.rs` → Keychain
- `terminate_auth_window()` on token verified
- Set global `userAgent` + `Origin` on main window

### Phase 2 — Proxy (Kernel)
- `axum` server (`proxy.rs`) on ephemeral port
- `reqwest` client with full Safari header spoofing + Keychain token injection (`client.rs`)
- 401/403 monitor → retry buffer (last 3 requests) → silent re-auth → loud re-auth event
- Test route: fetch Amazon playlist → return JSON to frontend

### Phase 3 — Cache
- SQLite schema for metadata and album art (`cache.rs`)
- TTL enforcement (21 days), stale-while-revalidate pattern

### Phase 4 — Playback Engine
- Shaka Player in Tauri/Solid.js frontend
- Shaka fetches `.mpd` via Rust proxy; DRM license request goes directly to Amazon
- Validate playback in WKWebView

### Phase 5 — Interface
- Solid.js UI (library, search, playback controls)
- `AmazonProvider` signal layer

---

*Spotify support is aspirational and out of scope for the current build.*
