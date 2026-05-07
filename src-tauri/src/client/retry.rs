use std::collections::VecDeque;
use std::sync::Mutex;

const CAPACITY: usize = 3;

pub struct PendingRequest {
    pub url: String,
    pub method: reqwest::Method,
}

pub struct RetryBuffer {
    inner: Mutex<VecDeque<PendingRequest>>,
}

impl RetryBuffer {
    pub fn new() -> Self {
        Self {
            inner: Mutex::new(VecDeque::with_capacity(CAPACITY)),
        }
    }

    pub fn push(&self, req: PendingRequest) {
        let mut buf = self.inner.lock().unwrap();
        if buf.len() == CAPACITY {
            buf.pop_front();
        }
        buf.push_back(req);
    }

    pub fn drain(&self) -> Vec<PendingRequest> {
        let mut buf = self.inner.lock().unwrap();
        buf.drain(..).collect()
    }
}
