use reqwest::header::{HeaderMap, HeaderValue, COOKIE, ORIGIN, USER_AGENT};
use crate::vault::Tokens;

pub const SAFARI_UA: &str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) \
    AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
pub const SAFARI_ORIGIN: &str = "https://music.amazon.com";

pub fn build_client(tokens: &Tokens) -> reqwest::Result<reqwest::Client> {
    let cookie = format!(
        "session-id={}; at-main={}; ubid-main={}",
        tokens.session_id, tokens.at_main, tokens.ubid_main
    );

    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, HeaderValue::from_static(SAFARI_UA));
    headers.insert(ORIGIN, HeaderValue::from_static(SAFARI_ORIGIN));
    headers.insert(COOKIE, HeaderValue::from_str(&cookie).unwrap());

    reqwest::Client::builder()
        .default_headers(headers)
        .build()
}
