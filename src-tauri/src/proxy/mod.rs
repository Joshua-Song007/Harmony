pub mod handlers;
pub mod router;

use std::sync::Arc;
use tokio::net::TcpListener;
use crate::state::AppState;

pub async fn start(state: Arc<AppState>) -> u16 {
    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .expect("failed to bind ephemeral port");

    let port = listener.local_addr().unwrap().port();
    let app = router::build(state);

    tokio::spawn(async move {
        axum::serve(listener, app)
            .await
            .expect("proxy server error");
    });

    port
}
