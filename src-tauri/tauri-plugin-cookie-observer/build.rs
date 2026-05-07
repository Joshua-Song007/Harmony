use std::env;
use std::path::PathBuf;
use std::process::Command;

fn main() {
    tauri_build::build();

    let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());
    let manifest_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());
    let swift_sources = manifest_dir.join("swift/Sources");

    let sources: Vec<PathBuf> = [
        "CookieObserverPlugin.swift",
        "CookieObserverDelegate.swift",
        "PollingFallback.swift",
    ]
    .iter()
    .map(|f| swift_sources.join(f))
    .collect();

    let lib_path = out_dir.join("libcookie_observer.a");

    let status = Command::new("swiftc")
        .args(["-module-name", "CookieObserver"])
        .args(["-emit-library", "-static"])
        .args(["-o", lib_path.to_str().unwrap()])
        .args(["-framework", "WebKit"])
        .args(sources.iter().map(|p| p.to_str().unwrap()))
        .status()
        .expect("swiftc not found — ensure Xcode command line tools are installed");

    assert!(status.success(), "swiftc failed with status: {status}");

    println!("cargo:rustc-link-lib=static=cookie_observer");
    println!("cargo:rustc-link-search=native={}", out_dir.display());
    println!("cargo:rustc-link-lib=framework=WebKit");
    println!("cargo:rerun-if-changed=swift/Sources/CookieObserverPlugin.swift");
    println!("cargo:rerun-if-changed=swift/Sources/CookieObserverDelegate.swift");
    println!("cargo:rerun-if-changed=swift/Sources/PollingFallback.swift");
}
