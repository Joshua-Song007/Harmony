use security_framework::passwords::{delete_generic_password, get_generic_password, set_generic_password};
use super::Tokens;

const SERVICE: &str = "dev.harmony.app";
const KEY: &str = "tokens";

pub fn store(tokens: &Tokens) -> Result<(), security_framework::base::Error> {
    let data = serde_json::to_vec(tokens).expect("Tokens serialization failed");
    set_generic_password(SERVICE, KEY, &data)
}

pub fn load() -> Result<Tokens, security_framework::base::Error> {
    let data = get_generic_password(SERVICE, KEY)?;
    serde_json::from_slice(&data).map_err(|_| {
        security_framework::base::Error::from(security_framework_sys::base::errSecItemNotFound)
    })
}

pub fn delete() -> Result<(), security_framework::base::Error> {
    match delete_generic_password(SERVICE, KEY) {
        Ok(()) => Ok(()),
        Err(e) if e.code() == security_framework_sys::base::errSecItemNotFound => Ok(()),
        Err(e) => Err(e),
    }
}
