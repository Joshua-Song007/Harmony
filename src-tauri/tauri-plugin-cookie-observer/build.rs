fn main() {
    // Swift sources (swift/Sources/) require the Tauri Swift mobile SDK
    // which is not available on macOS desktop builds. The cookie observer
    // is currently a Rust stub; native WKHTTPCookieStoreObserver integration
    // will be wired via objc2 in a future pass.
}
