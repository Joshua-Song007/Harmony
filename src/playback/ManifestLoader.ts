export function buildManifestUrl(proxyPort: number, trackId: string): string {
  return `http://127.0.0.1:${proxyPort}/api/track/${trackId}`;
}

export async function fetchManifestUrl(proxyPort: number, trackId: string): Promise<string> {
  const url = buildManifestUrl(proxyPort, trackId);
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`manifest fetch failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json() as { manifestUrl?: string };

  if (!json.manifestUrl) {
    throw new Error('manifest response missing manifestUrl field');
  }

  return json.manifestUrl;
}
