import { invoke } from '@tauri-apps/api/core';
import { UnlistenFn, listen } from '@tauri-apps/api/event';
import {
  Accessor,
  ParentProps,
  createContext,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import * as api from './api';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artUrl: string;
  durationMs: number;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artUrl: string;
  tracks: Track[];
}

export interface Playlist {
  id: string;
  title: string;
  artUrl: string;
  tracks: Track[];
}

export type LibraryItem = Album | Playlist;

export interface AmazonContextValue {
  proxyPort: Accessor<number>;
  library: Accessor<LibraryItem[]>;
  libraryError: Accessor<string | null>;
  searchResults: Accessor<Track[]>;
  searchError: Accessor<string | null>;
  nowPlaying: Accessor<Track | null>;
  queue: Accessor<Track[]>;
  reauthRequired: Accessor<boolean>;
  fetchLibrary(): Promise<void>;
  search(query: string): Promise<void>;
  setNowPlaying(track: Track): void;
  setQueue(tracks: Track[]): void;
  dismissReauth(): void;
}

export const AmazonContext = createContext<AmazonContextValue>();

export function AmazonProvider(props: ParentProps) {
  const [proxyPort, setProxyPort] = createSignal(0);
  const [library, setLibrary] = createSignal<LibraryItem[]>([]);
  const [libraryError, setLibraryError] = createSignal<string | null>(null);
  const [searchResults, setSearchResults] = createSignal<Track[]>([]);
  const [searchError, setSearchError] = createSignal<string | null>(null);
  const [nowPlaying, setNowPlaying] = createSignal<Track | null>(null);
  const [queue, setQueue] = createSignal<Track[]>([]);
  const [reauthRequired, setReauthRequired] = createSignal(false);

  onMount(async () => {
    const port = await invoke<number>('get_proxy_port');
    setProxyPort(port);
    fetchLibrary();

    const unlisten: UnlistenFn = await listen('reauth-required', () => {
      setReauthRequired(true);
    });

    onCleanup(unlisten);
  });

  async function fetchLibrary(): Promise<void> {
    try {
      setLibraryError(null);
      const items = await api.fetchLibrary(proxyPort());
      setLibrary(items);
    } catch (e) {
      setLibraryError(e instanceof Error ? e.message : String(e));
    }
  }

  async function search(query: string): Promise<void> {
    try {
      setSearchError(null);
      const results = await api.search(proxyPort(), query);
      setSearchResults(results);
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : String(e));
    }
  }

  function dismissReauth(): void {
    setReauthRequired(false);
  }

  const value: AmazonContextValue = {
    proxyPort,
    library,
    libraryError,
    searchResults,
    searchError,
    nowPlaying,
    queue,
    reauthRequired,
    fetchLibrary,
    search,
    setNowPlaying,
    setQueue,
    dismissReauth,
  };

  return (
    <AmazonContext.Provider value={value}>
      {props.children}
    </AmazonContext.Provider>
  );
}
