pub mod keychain;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct Tokens {
    pub session_id: String,
    pub at_main: String,
    pub ubid_main: String,
}
