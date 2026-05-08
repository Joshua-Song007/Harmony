use std::fs;
use std::io::Write;
use std::os::unix::fs::OpenOptionsExt;
use std::path::Path;
use super::Tokens;

pub fn load(data_dir: &Path) -> Result<Tokens, Box<dyn std::error::Error>> {
    let data = fs::read(data_dir.join("tokens.json"))?;
    Ok(serde_json::from_slice(&data)?)
}

pub fn store(data_dir: &Path, tokens: &Tokens) -> Result<(), Box<dyn std::error::Error>> {
    let data = serde_json::to_vec(tokens)?;
    let mut file = fs::OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .mode(0o600)
        .open(data_dir.join("tokens.json"))?;
    file.write_all(&data)?;
    Ok(())
}
