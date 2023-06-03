use axum::{http::StatusCode, routing::get, Router};
use tower_http::trace::{self, TraceLayer};
use tower_http::services::ServeDir;
use tracing::Level;

fn new_api_router() -> Router {
  Router::new()
    .route("/healthz", get(|| async { "OK" }))
    .route("/hello", get(|| async { "Hello, World!" }))
    .route("/bad", get(|| async { (StatusCode::NOT_FOUND, "BOOM") }))
}

fn new_static_router() -> Router {
  let service = ServeDir::new("front/dist");
  Router::new().nest_service("/", service)
}

fn new_wasm_router() -> Router {
  let service = ServeDir::new("front/wasm");
  Router::new().nest_service("/", service)
}

fn new_router() -> Router {
  Router::new()
    .nest("/-", new_api_router())
    .nest("/wasm", new_wasm_router())
    .nest("/", new_static_router())
    .layer(
      TraceLayer::new_for_http()
        .make_span_with(trace::DefaultMakeSpan::new().level(Level::INFO))
        .on_response(trace::DefaultOnResponse::new().level(Level::INFO)),
    )
}

#[tokio::main]
async fn main() {
  // Configurations
  let host: String = "0.0.0.0".to_string();
  let port: u16 = 3000;

  tracing_subscriber::fmt()
    .with_target(false)
    .compact()
    .init();

  // Create and run server
  tracing::info!("Listening on http://{}:{}", host, port);
  axum::Server::bind(&format!("{}:{}", host, port).parse().unwrap())
    .serve(new_router().into_make_service())
    .await
    .unwrap();
}
