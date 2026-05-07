-- metadata: track info, playlists, search results
-- key: arbitrary string identifier (e.g. "library", "search:radiohead", "track:B09XYZ")
-- value: JSON blob from Amazon API
-- expires_at: Unix timestamp (seconds); TTL = 21 days from write time
CREATE TABLE IF NOT EXISTS metadata (
    key        TEXT    PRIMARY KEY,
    value      TEXT    NOT NULL,
    expires_at INTEGER NOT NULL
);

-- album_art: raw image bytes keyed by album/track ID
-- data: binary image data (JPEG or WebP)
-- expires_at: Unix timestamp (seconds); TTL = 21 days from write time
CREATE TABLE IF NOT EXISTS album_art (
    key        TEXT    PRIMARY KEY,
    data       BLOB    NOT NULL,
    expires_at INTEGER NOT NULL
);

-- speed up TTL eviction scans
CREATE INDEX IF NOT EXISTS idx_metadata_expires  ON metadata  (expires_at);
CREATE INDEX IF NOT EXISTS idx_album_art_expires ON album_art (expires_at);
