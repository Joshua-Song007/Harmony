use security_framework::passwords::{delete_generic_password, get_generic_password, set_generic_password};
use super::Tokens;

const SERVICE: &str = "dev.harmony.app";
const KEY_SESSION_ID: &str = "session-id";
const KEY_AT_MAIN: &str = "at-main";
const KEY_UBID_MAIN: &str = "ubid-main";

pub fn store(tokens: &Tokens) -> Result<(), security_framework::base::Error> {
    set_generic_password(SERVICE, KEY_SESSION_ID, tokens.session_id.as_bytes())?;
    set_generic_password(SERVICE, KEY_AT_MAIN, tokens.at_main.as_bytes())?;
    set_generic_password(SERVICE, KEY_UBID_MAIN, tokens.ubid_main.as_bytes())?;
    Ok(())
}

pub fn load() -> Result<Tokens, security_framework::base::Error> {
    let session_id = String::from_utf8_lossy(&get_generic_password(SERVICE, KEY_SESSION_ID)?).into_owned();
    let at_main = String::from_utf8_lossy(&get_generic_password(SERVICE, KEY_AT_MAIN)?).into_owned();
    let ubid_main = String::from_utf8_lossy(&get_generic_password(SERVICE, KEY_UBID_MAIN)?).into_owned();

    Ok(Tokens { session_id, at_main, ubid_main })
}

pub fn delete() -> Result<(), security_framework::base::Error> {
    for account in [KEY_SESSION_ID, KEY_AT_MAIN, KEY_UBID_MAIN] {
        match delete_generic_password(SERVICE, account) {
            Ok(()) => {}
            Err(e) if e.code() == security_framework_sys::base::errSecItemNotFound => {}
            Err(e) => return Err(e),
        }
    }
    Ok(())
}
