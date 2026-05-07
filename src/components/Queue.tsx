import { For } from 'solid-js';
import { type Track, useAmazon } from '../providers/useAmazon';

function duration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Queue() {
  const { queue, setQueue, setNowPlaying } = useAmazon();

  function onRowClick(track: Track, index: number) {
    setNowPlaying(track);
    setQueue(queue().slice(index + 1));
  }

  return (
    <div style={{ overflow: 'auto', height: '100%' }}>
      <For each={queue()}>
        {(track, index) => (
          <div
            onClick={() => onRowClick(track, index())}
            style={{ display: 'flex', 'align-items': 'center', gap: '12px', padding: '8px 16px', cursor: 'pointer' }}
          >
            <img src={track.artUrl} alt={track.title} style={{ width: '36px', height: '36px', 'object-fit': 'cover', 'border-radius': '2px' }} />
            <div style={{ flex: '1', overflow: 'hidden' }}>
              <div style={{ 'font-size': '13px', 'font-weight': '600', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }}>{track.title}</div>
              <div style={{ 'font-size': '11px', opacity: '0.6', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }}>{track.artist}</div>
            </div>
            <span style={{ 'font-size': '11px', opacity: '0.6', 'flex-shrink': '0' }}>{duration(track.durationMs)}</span>
          </div>
        )}
      </For>
    </div>
  );
}
