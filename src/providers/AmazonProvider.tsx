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
  searchResults: Accessor<Track[]>;
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
  const [searchResults, setSearchResults] = createSignal<Track[]>([]);
  const [nowPlaying, setNowPlaying] = createSignal<Track | null>(null);
  const [queue, setQueue] = createSignal<Track[]>([]);
  const [reauthRequired, setReauthRequired] = createSignal(false);

  onMount(async () => {
    const port = await invoke<number>('get_proxy_port');
    setProxyPort(port);

    const unlisten: UnlistenFn = await listen('reauth-required', () => {
      setReauthRequired(true);
    });

    onCleanup(unlisten);
  });

  async function fetchLibrary(): Promise<void> {
    const items = await api.fetchLibrary(proxyPort());
    setLibrary(items);
  }

  async function search(query: string): Promise<void> {
    const results = await api.search(proxyPort(), query);
    setSearchResults(results);
  }

  function dismissReauth(): void {
    setReauthRequired(false);
  }

  const value: AmazonContextValue = {
    proxyPort,
    library,
    searchResults,
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
