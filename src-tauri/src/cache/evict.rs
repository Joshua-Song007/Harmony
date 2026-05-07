use std::time::{SystemTime, UNIX_EPOCH};
use rusqlite::{Connection, Result, params};

fn now() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64
}

pub fn purge_expired(conn: &Connection) -> Result<usize> {
    let now = now();
    let metadata_deleted = conn.execute(
        "DELETE FROM metadata WHERE expires_at <= ?1",
        params![now],
    )?;
    let art_deleted = conn.execute(
        "DELETE FROM album_art WHERE expires_at <= ?1",
        params![now],
    )?;
    Ok(metadata_deleted + art_deleted)
}
