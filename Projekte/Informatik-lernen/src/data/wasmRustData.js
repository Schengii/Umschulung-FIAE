export const WASM_MODULES = [
  {
    id: 'rust_wasm',
    title: '1. Rust-Funktionen als WebAssembly exportieren',
    desc: 'Rust-Code für das Ziel wasm32-unknown-unknown kompilieren und die exportierten Funktionen aus JavaScript aufrufen.',
    rustCode: `// src/lib.rs  (Cargo.toml: [lib] crate-type = ["cdylib"])
#[no_mangle]
pub extern "C" fn add(a: i32, b: i32) -> i32 {
    a.wrapping_add(b) // i32-Überlauf wie in Wasm
}

#[no_mangle]
pub extern "C" fn mul(a: i32, b: i32) -> i32 {
    a.wrapping_mul(b)
}

// Bauen:
//   rustup target add wasm32-unknown-unknown
//   cargo build --release --target wasm32-unknown-unknown
// Ergebnis: target/wasm32-unknown-unknown/release/<crate>.wasm
// (rustc legt zusätzliche Sektionen an; das Modul im Lab ist von Hand auf das Nötigste reduziert)`,
    jsIntegration: `// Ohne Bundler: Modul laden, kompilieren, instanziieren
const { instance } = await WebAssembly.instantiateStreaming(
  fetch('/rechner.wasm')
);

console.log(instance.exports.add(2, 3)); // 5
console.log(instance.exports.mul(6, 7)); // 42

// Linearer Speicher: ArrayBuffer in 64-KiB-Seiten
const memory = instance.exports.memory;
memory.grow(1);
const bytes = new Uint8Array(memory.buffer); // nach grow() neu holen!

// Mit wasm-bindgen/wasm-pack entsteht zusätzlich JS-Glue-Code,
// der Strings, Objekte und DOM-Zugriffe übersetzt.`
  }
];
