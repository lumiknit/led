.PHONY: all clean be fe

all: be fe
	@echo "[INFO] Compose outputs..."
	mkdir -p ./dist
	cp -r ./back/target/release/led ./dist/led
	cp -r ./front/dist ./dist/dist
	cp -r ./front/wasm ./dist/wasm
	
be:
	@echo "[INFO] Building Rust backend..."
	cargo build --release

fe:
	@echo "[INFO] Building React frontend..."
	cd front && npm run build