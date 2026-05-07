import type { LibraryItem, Track } from './AmazonProvider';

function base(port: number): string {
  return `http://127.0.0.1:${port}`;
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} ${res.status}`);
  return res.json() as Promise<T>;
}

export function fetchLibrary(port: number): Promise<LibraryItem[]> {
  return get<LibraryItem[]>(`${base(port)}/api/library`);
}

export function search(port: number, query: string): Promise<Track[]> {
  return get<Track[]>(`${base(port)}/api/search?q=${encodeURIComponent(query)}`);
}

export function fetchTrack(port: number, trackId: string): Promise<Track> {
  return get<Track>(`${base(port)}/api/track/${trackId}`);
}
