export const WASM_MODULES = [
  {
    id: 'rust_wasm',
    title: '1. Rust WebAssembly Function',
    desc: 'Schreibe performanten Rust Code, der zu Wasm kompiliert und im Webbrowser ausgeführt wird.',
    rustCode: `use wasm_bindgen::prelude::*;

#[wasm_bindgen]
export fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}`,
    jsIntegration: `import init, { fibonacci } from './pkg/wasm_demo.js';

async function run() {
  await init();
  const result = fibonacci(40); // Fast near-native execution
  console.log("Wasm Result:", result);
}`
  }
];
