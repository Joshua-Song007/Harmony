import WebKit

class PollingFallback {
    private let cookieStore: WKHTTPCookieStore
    private let onCookies: ([String: String]) -> Void
    private let targetKeys: Set<String> = ["session-id", "at-main", "ubid-main"]
    private var timer: Timer?
    private var fired = false

    init(cookieStore: WKHTTPCookieStore, onCookies: @escaping ([String: String]) -> Void) {
        self.cookieStore = cookieStore
        self.onCookies = onCookies
    }

    func start() {
        timer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { [weak self] _ in
            self?.poll()
        }
        RunLoop.main.add(timer!, forMode: .common)
    }

    func stop() {
        timer?.invalidate()
        timer = nil
    }

    private func poll() {
        guard !fired else {
            stop()
            return
        }

        cookieStore.getAllCookies { [weak self] cookies in
            guard let self = self, !self.fired else { return }

            var collected: [String: String] = [:]
            for cookie in cookies where self.targetKeys.contains(cookie.name) {
                collected[cookie.name] = cookie.value
            }

            guard collected.count == self.targetKeys.count else { return }

            self.fired = true
            self.stop()
            self.onCookies(collected)
        }
    }
}
