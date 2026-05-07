import { For, createSignal } from 'solid-js';
import { type Track, useAmazon } from '../providers/useAmazon';

function duration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Search() {
  const { search, searchResults, setNowPlaying, setQueue } = useAmazon();
  const [query, setQuery] = createSignal('');

  function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (query().trim()) search(query().trim());
  }

  function onRowClick(track: Track) {
    setNowPlaying(track);
    setQueue([track]);
  }

  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', height: '100%' }}>
      <form onSubmit={onSubmit} style={{ padding: '16px' }}>
        <input
          type="text"
          placeholder="Search Amazon Music…"
          value={query()}
          onInput={(e) => setQuery(e.currentTarget.value)}
          style={{ width: '100%', padding: '8px 12px', 'font-size': '14px', 'box-sizing': 'border-box' }}
        />
      </form>
      <div style={{ overflow: 'auto', flex: '1' }}>
        <For each={searchResults()}>
          {(track) => (
            <div
              onClick={() => onRowClick(track)}
              style={{ display: 'flex', 'align-items': 'center', gap: '12px', padding: '8px 16px', cursor: 'pointer' }}
            >
              <img src={track.artUrl} alt={track.title} style={{ width: '40px', height: '40px', 'object-fit': 'cover', 'border-radius': '2px' }} />
              <div style={{ flex: '1', overflow: 'hidden' }}>
                <div style={{ 'font-size': '14px', 'font-weight': '600', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }}>{track.title}</div>
                <div style={{ 'font-size': '12px', opacity: '0.7', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }}>{track.artist}</div>
              </div>
              <span style={{ 'font-size': '12px', opacity: '0.7', 'flex-shrink': '0' }}>{duration(track.durationMs)}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
