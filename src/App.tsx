import { Show, createSignal } from 'solid-js';
import Library from './components/Library';
import Player from './components/Player';
import Queue from './components/Queue';
import ReauthModal from './components/ReauthModal';
import Search from './components/Search';
import { AmazonProvider } from './providers/AmazonProvider';

type View = 'library' | 'search';

export default function App() {
  const [view, setView] = createSignal<View>('library');

  return (
    <AmazonProvider>
      <div style={{ display: 'flex', 'flex-direction': 'column', height: '100vh', background: '#0d0d0d', color: 'white', 'font-family': 'system-ui, sans-serif' }}>

        <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', 'border-bottom': '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setView('library')}
            style={{ padding: '6px 16px', 'border-radius': '4px', border: 'none', cursor: 'pointer', 'font-size': '13px', 'font-weight': '600', background: view() === 'library' ? 'white' : 'rgba(255,255,255,0.1)', color: view() === 'library' ? '#0d0d0d' : 'white' }}
          >
            Library
          </button>
          <button
            onClick={() => setView('search')}
            style={{ padding: '6px 16px', 'border-radius': '4px', border: 'none', cursor: 'pointer', 'font-size': '13px', 'font-weight': '600', background: view() === 'search' ? 'white' : 'rgba(255,255,255,0.1)', color: view() === 'search' ? '#0d0d0d' : 'white' }}
          >
            Search
          </button>
        </div>

        <div style={{ display: 'flex', flex: '1', overflow: 'hidden' }}>
          <div style={{ flex: '1', overflow: 'auto' }}>
            <Show when={view() === 'library'}>
              <Library />
            </Show>
            <Show when={view() === 'search'}>
              <Search />
            </Show>
          </div>
          <div style={{ width: '240px', 'border-left': '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', 'flex-direction': 'column' }}>
            <div style={{ padding: '10px 16px', 'font-size': '11px', 'font-weight': '700', 'letter-spacing': '0.08em', 'text-transform': 'uppercase', opacity: '0.4' }}>Up Next</div>
            <Queue />
          </div>
        </div>

        <Player />
      </div>
      <ReauthModal />
    </AmazonProvider>
  );
}
