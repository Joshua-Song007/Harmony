import { invoke } from '@tauri-apps/api/core';
import { Show } from 'solid-js';
import { useAmazon } from '../providers/useAmazon';

export default function ReauthModal() {
  const { reauthRequired, dismissReauth } = useAmazon();

  async function onLogin() {
    await invoke('trigger_reauth');
    dismissReauth();
  }

  return (
    <Show when={reauthRequired()}>
      <div style={{ position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.7)', display: 'flex', 'align-items': 'center', 'justify-content': 'center', 'z-index': '100' }}>
        <div style={{ background: '#1a1a1a', 'border-radius': '8px', padding: '32px', 'max-width': '360px', width: '100%', display: 'flex', 'flex-direction': 'column', gap: '20px', 'text-align': 'center' }}>
          <p style={{ margin: '0', 'font-size': '15px', 'line-height': '1.5' }}>
            Your session has expired. Please log in again.
          </p>
          <div style={{ display: 'flex', gap: '12px', 'justify-content': 'center' }}>
            <button onClick={onLogin} style={{ padding: '8px 24px', 'border-radius': '4px', border: 'none', background: '#1db954', color: 'white', 'font-size': '14px', 'font-weight': '600', cursor: 'pointer' }}>
              Log In
            </button>
            <button onClick={dismissReauth} style={{ padding: '8px 24px', 'border-radius': '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'none', color: 'white', 'font-size': '14px', cursor: 'pointer' }}>
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}
