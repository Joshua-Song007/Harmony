import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { buildDrmConfig } from '../playback/DrmConfig';
import { buildManifestUrl } from '../playback/ManifestLoader';
import { useShakaPlayer } from '../playback/useShakaPlayer';
import { useAmazon } from '../providers/useAmazon';

export default function Player() {
  let videoRef: HTMLVideoElement | undefined;

  const { nowPlaying, queue, setNowPlaying, setQueue, proxyPort } = useAmazon();
  const handle = useShakaPlayer(() => videoRef);

  const [playing, setPlaying] = createSignal(false);
  const [currentTime, setCurrentTime] = createSignal(0);
  const [duration, setDuration] = createSignal(0);
  const [volume, setVolume] = createSignal(1);

  onMount(() => {
    const el = videoRef!;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onDurationChange = () => setDuration(el.duration || 0);

    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('durationchange', onDurationChange);

    onCleanup(() => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('durationchange', onDurationChange);
      handle.destroy();
    });
  });

  createEffect(() => {
    const track = nowPlaying();
    if (!track || !proxyPort()) return;
    handle.load(buildManifestUrl(proxyPort(), track.id), buildDrmConfig());
  });

  function togglePlay() {
    if (!videoRef) return;
    videoRef.paused ? videoRef.play() : videoRef.pause();
  }

  function skipNext() {
    const q = queue();
    if (q.length === 0) return;
    setNowPlaying(q[0]);
    setQueue(q.slice(1));
  }

  function onScrub(e: InputEvent) {
    if (!videoRef || !duration()) return;
    videoRef.currentTime = Number((e.target as HTMLInputElement).value) * duration();
  }

  function onVolumeChange(e: InputEvent) {
    const val = Number((e.target as HTMLInputElement).value);
    setVolume(val);
    if (videoRef) videoRef.volume = val;
  }

  const progress = () => duration() > 0 ? currentTime() / duration() : 0;

  return (
    <div style={{ display: 'flex', 'align-items': 'center', gap: '16px', padding: '12px 20px', 'border-top': '1px solid rgba(255,255,255,0.1)', background: '#111' }}>
      <video ref={videoRef} style={{ display: 'none' }} />

      <img
        src={nowPlaying()?.artUrl ?? ''}
        alt=""
        style={{ width: '48px', height: '48px', 'object-fit': 'cover', 'border-radius': '4px', visibility: nowPlaying() ? 'visible' : 'hidden' }}
      />

      <div style={{ flex: '0 0 180px', overflow: 'hidden' }}>
        <div style={{ 'font-size': '13px', 'font-weight': '600', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }}>{nowPlaying()?.title ?? ''}</div>
        <div style={{ 'font-size': '11px', opacity: '0.6', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }}>{nowPlaying()?.artist ?? ''}</div>
      </div>

      <div style={{ display: 'flex', 'align-items': 'center', gap: '12px', flex: '1', 'justify-content': 'center' }}>
        <button onClick={togglePlay} style={{ 'font-size': '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
          {handle.isBuffering() ? '…' : playing() ? '⏸' : '▶'}
        </button>
        <button onClick={skipNext} disabled={queue().length === 0} style={{ 'font-size': '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'white', opacity: queue().length === 0 ? '0.3' : '1' }}>
          ⏭
        </button>
        <input
          type="range" min="0" max="1" step="0.001"
          value={progress()}
          onInput={onScrub}
          style={{ width: '240px', cursor: 'pointer' }}
        />
      </div>

      <input
        type="range" min="0" max="1" step="0.01"
        value={volume()}
        onInput={onVolumeChange}
        style={{ width: '80px', cursor: 'pointer' }}
      />
    </div>
  );
}
