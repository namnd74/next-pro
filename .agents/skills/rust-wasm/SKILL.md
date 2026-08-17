---
name: rust-wasm
description: Expert guidelines for Rust and WebAssembly (Wasm) integration, memory safety, and `wasm-bindgen`.
---

# Skill: Rust & WebAssembly Expert

## 0. Context & Toolchain

- Inspect `Cargo.toml`, crate type, existing JS bundler, and target runtime before changing build settings.
- Match existing `wasm-bindgen`, `wasm-pack`, Trunk, Vite, or Node integration conventions.

## 1. Safety & Memory

- Minimize allocations across the JS/Wasm boundary. Pass pointers or typed arrays (`js_sys::Uint8Array`).
- Keep `unsafe` blocks strictly isolated and documented.
- Convert Rust errors to JS-friendly `Result`/`JsValue`; avoid panics across the Wasm boundary.

## 2. Bindings & Build

- Use `wasm-bindgen` and `web-sys` for browser API bindings.
- Target `wasm-pack build --target web` for browser ESM, or `bundler`/`nodejs` when the host build requires it.
- Add `wasm-bindgen-test` or host-side integration tests for exported behavior.
