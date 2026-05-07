pub mod http;
pub mod interceptor;
pub mod retry;

pub use http::{build_client, SAFARI_ORIGIN, SAFARI_UA};
