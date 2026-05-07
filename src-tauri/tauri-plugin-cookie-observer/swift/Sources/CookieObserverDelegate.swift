import WebKit

class CookieObserverDelegate: NSObject, WKHTTPCookieStoreObserver {
    private let onCookies: ([String: String]) -> Void
    private let targetKeys: Set<String> = ["session-id", "at-main", "ubid-main"]
    private var fired = false

    init(onCookies: @escaping ([String: String]) -> Void) {
        self.onCookies = onCookies
    }

    func cookiesDidChange(in cookieStore: WKHTTPCookieStore) {
        guard !fired else { return }

        cookieStore.getAllCookies { [weak self] cookies in
            guard let self = self, !self.fired else { return }

            var collected: [String: String] = [:]
            for cookie in cookies where self.targetKeys.contains(cookie.name) {
                collected[cookie.name] = cookie.value
            }

            guard collected.count == self.targetKeys.count else { return }

            self.fired = true
            self.onCookies(collected)
        }
    }
}
