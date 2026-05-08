import { For, Show } from 'solid-js';
import { type LibraryItem, useAmazon } from '../providers/useAmazon';

function artistName(item: LibraryItem): string {
  return 'artist' in item ? item.artist : '';
}

export default function Library() {
  const { library, libraryError, fetchLibrary, setNowPlaying, setQueue } = useAmazon();

  function onCardClick(item: LibraryItem) {
    if (item.tracks.length === 0) return;
    setQueue(item.tracks);
    setNowPlaying(item.tracks[0]);
  }

  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', height: '100%' }}>
      <div style={{ display: 'flex', 'align-items': 'center', gap: '12px', padding: '16px 16px 0' }}>
        <button onClick={fetchLibrary} style={{ padding: '6px 14px', 'font-size': '13px', cursor: 'pointer' }}>Refresh</button>
        <Show when={libraryError()}>
          <span style={{ color: '#ff6b6b', 'font-size': '13px' }}>{libraryError()}</span>
        </Show>
      </div>
      <Show
        when={library().length > 0}
        fallback={
          <Show when={!libraryError()}>
            <div style={{ padding: '16px', 'font-size': '13px', opacity: '0.5' }}>No library loaded</div>
          </Show>
        }
      >
        <div style={{ display: 'grid', 'grid-template-columns': 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', padding: '16px' }}>
          <For each={library()}>
            {(item) => (
              <div
                onClick={() => onCardClick(item)}
                style={{ cursor: 'pointer', display: 'flex', 'flex-direction': 'column', gap: '6px' }}
              >
                <img src={item.artUrl} alt={item.title} style={{ width: '100%', 'aspect-ratio': '1', 'object-fit': 'cover', 'border-radius': '4px' }} />
                <span style={{ 'font-weight': '600', 'font-size': '14px', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }}>{item.title}</span>
                <span style={{ 'font-size': '12px', opacity: '0.7', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }}>{artistName(item)}</span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
