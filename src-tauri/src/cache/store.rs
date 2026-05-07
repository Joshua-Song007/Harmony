use std::time::{SystemTime, UNIX_EPOCH};
use rusqlite::{Connection, Result, params};

const TTL_SECS: i64 = 21 * 24 * 60 * 60;

fn now() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64
}

pub fn get(conn: &Connection, table: &str, key: &str) -> Option<Vec<u8>> {
    let col = match table {
        "album_art" => "data",
        _ => "value",
    };

    let sql = format!("SELECT {col} FROM {table} WHERE key = ?1 AND expires_at > ?2");

    conn.query_row(&sql, params![key, now()], |row| row.get::<_, Vec<u8>>(0))
        .ok()
}

pub fn set(conn: &Connection, table: &str, key: &str, value: &[u8]) -> Result<()> {
    let col = match table {
        "album_art" => "data",
        _ => "value",
    };

    let expires_at = now() + TTL_SECS;
    let sql = format!(
        "INSERT OR REPLACE INTO {table} (key, {col}, expires_at) VALUES (?1, ?2, ?3)"
    );

    conn.execute(&sql, params![key, value, expires_at])?;
    Ok(())
}
