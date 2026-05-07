import { For, onMount } from 'solid-js';
import { type LibraryItem, useAmazon } from '../providers/useAmazon';

function artistName(item: LibraryItem): string {
  return 'artist' in item ? item.artist : '';
}

export default function Library() {
  const { library, fetchLibrary, setNowPlaying, setQueue } = useAmazon();

  onMount(() => {
    fetchLibrary();
  });

  function onCardClick(item: LibraryItem) {
    if (item.tracks.length === 0) return;
    setQueue(item.tracks);
    setNowPlaying(item.tracks[0]);
  }

  return (
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
  );
}
