import shaka from 'shaka-player';
import { Accessor, createSignal } from 'solid-js';

export interface ShakaPlayerHandle {
  load(url: string, drmConfig: shaka.extern.DrmConfiguration): Promise<void>;
  destroy(): Promise<void>;
  isReady: Accessor<boolean>;
  isBuffering: Accessor<boolean>;
  error: Accessor<shaka.util.Error | null>;
}

export function useShakaPlayer(videoEl: () => HTMLVideoElement | undefined): ShakaPlayerHandle {
  let player: shaka.Player | undefined;

  const [isReady, setIsReady] = createSignal(false);
  const [isBuffering, setIsBuffering] = createSignal(false);
  const [error, setError] = createSignal<shaka.util.Error | null>(null);

  function attachListeners(p: shaka.Player) {
    p.addEventListener('buffering', (event) => {
      setIsBuffering((event as shaka.PlayerEvents.BufferingEvent).buffering);
    });
    p.addEventListener('error', (event) => {
      setError((event as shaka.PlayerEvents.ErrorEvent).detail);
    });
  }

  async function load(url: string, drmConfig: shaka.extern.DrmConfiguration): Promise<void> {
    setError(null);

    if (!player) {
      const el = videoEl();
      if (!el) throw new Error('video element not available');
      player = new shaka.Player(el);
      attachListeners(player);
    }

    player.configure({ drm: drmConfig });

    try {
      await player.load(url);
      setIsReady(true);
    } catch (err) {
      setError(err as shaka.util.Error);
      throw err;
    }
  }

  async function destroy(): Promise<void> {
    if (!player) return;
    await player.destroy();
    player = undefined;
    setIsReady(false);
    setIsBuffering(false);
  }

  return { load, destroy, isReady, isBuffering, error };
}
