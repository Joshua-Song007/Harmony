use std::path::Path;
use rusqlite::{Connection, Result};

pub fn init(path: &Path) -> Result<Connection> {
    let conn = Connection::open(path)?;

    conn.execute_batch("PRAGMA journal_mode=WAL;")?;

    conn.execute_batch("
        CREATE TABLE IF NOT EXISTS metadata (
            key        TEXT    PRIMARY KEY,
            value      TEXT    NOT NULL,
            expires_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS album_art (
            key        TEXT    PRIMARY KEY,
            data       BLOB    NOT NULL,
            expires_at INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_metadata_expires  ON metadata  (expires_at);
        CREATE INDEX IF NOT EXISTS idx_album_art_expires ON album_art (expires_at);
    ")?;

    Ok(conn)
}
