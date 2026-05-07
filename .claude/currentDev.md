## Task: src/playback/ShakaPlayer.tsx

### File
- `src/playback/ShakaPlayer.tsx`

### Role
- Solid.js component; mounts a `<video>` element; owns a `shaka.Player` instance lifecycle

### Props
- `manifestUrl: string` — `.mpd` URL already resolved (caller fetches from Rust proxy)
- `drmConfig: shaka.extern.DrmConfiguration` — passed in from `DrmConfig.ts`
- `onError?: (err: shaka.util.Error) => void`

### Behavior
- On mount: `shaka.Player.isBrowserSupported()` check; attach player to `<video>` ref; apply `drmConfig` via `player.configure({ drm: drmConfig })`; call `player.load(manifestUrl)`
- On `manifestUrl` change: `player.load(manifestUrl)` (no destroy/recreate)
- On unmount: `player.destroy()`
- Error events: `player.addEventListener('error', ...)` → call `onError` prop if set

### Imports
- `shaka-player` — `import shaka from 'shaka-player'`
- `solid-js` — `createSignal`, `onMount`, `onCleanup`, `createEffect`

### Notes
- DRM license requests must NOT be proxied — Shaka sends them directly to Amazon
- No state ownership here; parent controls `manifestUrl` signal
