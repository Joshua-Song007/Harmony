import Tauri
import WebKit

class CookieObserverPlugin: Plugin {
    private var delegate: CookieObserverDelegate?
    private var pollingFallback: PollingFallback?

    @objc public func startObserving(_ invoke: Invoke) {
        DispatchQueue.main.async {
            let cookieStore = WKWebsiteDataStore.default().httpCookieStore

            let observer = CookieObserverDelegate { [weak self] payload in
                self?.trigger("cookies-updated", data: payload)
            }

            // WKHTTPCookieStoreObserver must be registered on main thread
            cookieStore.add(observer)
            self.delegate = observer

            // fall back to polling if the observer fires nothing within 2s
            let fallback = PollingFallback(cookieStore: cookieStore) { [weak self] payload in
                self?.trigger("cookies-updated", data: payload)
            }
            fallback.start()
            self.pollingFallback = fallback

            invoke.resolve()
        }
    }

    @objc public func stopObserving(_ invoke: Invoke) {
        DispatchQueue.main.async {
            let cookieStore = WKWebsiteDataStore.default().httpCookieStore

            if let observer = self.delegate {
                cookieStore.remove(observer)
                self.delegate = nil
            }

            self.pollingFallback?.stop()
            self.pollingFallback = nil

            invoke.resolve()
        }
    }
}

@_cdecl("init_plugin_cookie_observer")
func initPlugin() -> Plugin {
    return CookieObserverPlugin()
}
