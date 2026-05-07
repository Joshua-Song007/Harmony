# Harmony — Build Plan

> Checkboxes track file creation + basic implementation. Phases match the roadmap in `overview.md`.

---

## Phase 1 — Vault & Auth

### Tauri Swift Plugin (`src-tauri/tauri-plugin-cookie-observer/`)
- [x] `swift/Sources/CookieObserverPlugin.swift` — plugin entry, registers commands with Tauri runtime
- [x] `swift/Sources/CookieObserverDelegate.swift` — `WKHTTPCookieStoreObserver` conformance, filters Amazon keys
- [x] `swift/Sources/PollingFallback.swift` — 500ms polling path if observer registration fails
- [x] `Cargo.toml` — plugin crate definition
- [x] `build.rs` — compiles Swift sources, links to Tauri plugin bridge

### Rust: Auth (`src-tauri/src/auth/`)
- [x] `mod.rs` — module exports
- [x] `window.rs` — `create_auth_window()`, `terminate_auth_window()`, window lifecycle management
- [x] `events.rs` — emits `reauth-required` Tauri event to frontend

### Rust: Vault (`src-tauri/src/vault/`)
- [x] `mod.rs` — module exports + `Tokens` struct
- [x] `keychain.rs` — macOS Keychain read/write via `security-framework` crate; stores `session-id`, `at-main`, `ubid-main`

---

## Phase 2 — Proxy (Kernel)

### Rust: Proxy (`src-tauri/src/proxy/`)
- [x] `mod.rs` — module exports; starts axum server on ephemeral port; passes port to frontend
- [x] `router.rs` — axum route definitions
- [x] `handlers.rs` — request handlers; delegates to `client.rs`; returns clean JSON to frontend

### Rust: Client (`src-tauri/src/client/`)
- [x] `mod.rs` — module exports
- [x] `http.rs` — `reqwest` client; injects Safari `User-Agent` + `Origin` headers; loads tokens from `vault.rs`
- [x] `interceptor.rs` — monitors all responses for `401`/`403`; triggers re-auth flow
- [x] `retry.rs` — retry buffer; holds last 3 failed requests while re-auth is pending

### Rust: Commands (`src-tauri/src/commands/`)
- [x] `mod.rs` — module exports
- [x] `proxy.rs` — Tauri command: exposes ephemeral port to frontend
- [x] `auth.rs` — Tauri command: trigger manual re-auth from frontend

---

## Phase 3 — Cache

### Rust: Cache (`src-tauri/src/cache/`)
- [x] `mod.rs` — module exports
- [x] `db.rs` — SQLite setup via `rusqlite`; schema init; migrations
- [x] `schema.sql` — table definitions: `metadata`, `album_art`, TTL column on each
- [x] `store.rs` — get/set with TTL enforcement (21-day expiry); stale-while-revalidate logic
- [x] `evict.rs` — background task; purges expired rows on startup and periodically

---

## Phase 4 — Playback Engine

### Frontend: Playback (`src/playback/`)
- [ ] `ShakaPlayer.tsx` — Solid.js component; wraps Shaka Player instance
- [ ] `useShakaPlayer.ts` — composable; manages Shaka lifecycle, `load()`, `destroy()`, error handling
- [ ] `DrmConfig.ts` — Shaka DRM configuration; license server URLs; direct (non-proxied) request routing
- [ ] `ManifestLoader.ts` — fetches `.mpd` from Rust proxy endpoint; passes to Shaka

---

## Phase 5 — Interface

### Frontend: Provider (`src/providers/`)
- [ ] `AmazonProvider.tsx` — Solid.js context provider; owns all Amazon data signals
- [ ] `useAmazon.ts` — composable; exposes signals: `library`, `search`, `nowPlaying`, `queue`
- [ ] `api.ts` — typed fetch helpers; calls Rust proxy endpoints; handles `reauth-required` event

### Frontend: Components (`src/components/`)
- [ ] `Library.tsx` — user library view; album/playlist grid
- [ ] `Search.tsx` — search input + results list
- [ ] `Player.tsx` — bottom playback bar; play/pause, skip, scrubber, volume
- [ ] `Queue.tsx` — upcoming tracks panel
- [ ] `ReauthModal.tsx` — modal shown on `reauth-required` event; triggers manual login

### Frontend: Layout (`src/`)
- [ ] `App.tsx` — root component; layout shell; mounts provider + router
- [ ] `index.tsx` — Solid.js entry point
- [ ] `index.html` — Tauri frontend entry; sets `userAgent` globally

---

## Project Config

### Tauri (`src-tauri/`)
- [ ] `Cargo.toml` — workspace deps: `axum`, `reqwest`, `rusqlite`, `security-framework`, `tokio`
- [ ] `tauri.conf.json` — app config; CSP; window settings; plugin registration
- [ ] `src/main.rs` — Tauri app entry; registers commands; starts proxy on init
- [ ] `src/lib.rs` — re-exports all modules
- [ ] `src/error.rs` — unified `AppError` type; `thiserror` impl; maps to Tauri command errors
- [ ] `src/state.rs` — `AppState` struct; holds axum port, DB handle, reqwest client

### Frontend Config (`/`)
- [ ] `package.json` — deps: `solid-js`, `vite`, `shaka-player`
- [ ] `vite.config.ts` — Vite config; Solid plugin; proxy passthrough for dev
- [ ] `tsconfig.json` — TypeScript config; strict mode
