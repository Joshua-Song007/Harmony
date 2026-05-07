import shaka from 'shaka-player';
import { createEffect, onCleanup, onMount } from 'solid-js';

interface ShakaPlayerProps {
  manifestUrl: string;
  drmConfig: shaka.extern.DrmConfiguration;
  onError?: (err: shaka.util.Error) => void;
}

export default function ShakaPlayer(props: ShakaPlayerProps) {
  let videoRef: HTMLVideoElement | undefined;
  let player: shaka.Player | undefined;

  onMount(async () => {
    if (!shaka.Player.isBrowserSupported()) {
      props.onError?.(
        new shaka.util.Error(
          shaka.util.Error.Severity.CRITICAL,
          shaka.util.Error.Category.PLAYER,
          shaka.util.Error.Code.LOAD_INTERRUPTED,
        ),
      );
      return;
    }

    player = new shaka.Player(videoRef!);

    player.addEventListener('error', (event) => {
      props.onError?.((event as shaka.PlayerEvents.ErrorEvent).detail);
    });

    player.configure({ drm: props.drmConfig });

    try {
      await player.load(props.manifestUrl);
    } catch (err) {
      props.onError?.(err as shaka.util.Error);
    }
  });

  createEffect(async () => {
    const url = props.manifestUrl;
    if (!player || !url) return;
    try {
      await player.load(url);
    } catch (err) {
      props.onError?.(err as shaka.util.Error);
    }
  });

  onCleanup(() => {
    player?.destroy();
  });

  return <video ref={videoRef} style={{ width: '100%', height: '100%' }} />;
}
