import"./rolldown-runtime-hePW80VL.js";import{h as e}from"./vendor-charts-LpGij_Qu.js";import{n as t}from"./vendor-react-CYlvDiRg.js";import{n}from"./vendor-ui-Cq2y2VJf.js";e();var r=[{id:`rust_wasm`,title:`1. Rust WebAssembly Function`,desc:`Schreibe performanten Rust Code, der zu Wasm kompiliert und im Webbrowser ausgeführt wird.`,rustCode:`use wasm_bindgen::prelude::*;

#[wasm_bindgen]
export fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}`,jsIntegration:`import init, { fibonacci } from './pkg/wasm_demo.js';

async function run() {
  await init();
  const result = fibonacci(40); // Fast near-native execution
  console.log("Wasm Result:", result);
}`}],i=t();function a(){let e=r[0];return(0,i.jsxs)(`div`,{style:{maxWidth:`1000px`,margin:`0 auto`,paddingBottom:`60px`},children:[(0,i.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`,marginBottom:`24px`,border:`2px solid var(--accent-amber)`},children:[(0,i.jsxs)(`h1`,{style:{fontSize:`2.2rem`,fontWeight:`800`,marginBottom:`8px`,color:`var(--text-main)`,display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,i.jsx)(n,{size:32,style:{color:`var(--accent-amber)`}}),` WebAssembly (Wasm) & Rust Compiler Lab`]}),(0,i.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.05rem`},children:`Verstehe Hochleistungs-Code im Webbrowser: Rust zu Wasm kompilieren und direkt ausführen.`})]}),(0,i.jsxs)(`div`,{className:`grid-responsive`,style:{gap:`20px`},children:[(0,i.jsxs)(`div`,{className:`glass-panel`,style:{padding:`24px`},children:[(0,i.jsx)(`span`,{className:`badge badge-amber`,style:{marginBottom:`10px`},children:`Rust Source Code`}),(0,i.jsx)(`div`,{className:`code-window`,children:(0,i.jsx)(`pre`,{className:`code-body`,children:(0,i.jsx)(`code`,{children:e.rustCode})})})]}),(0,i.jsxs)(`div`,{className:`glass-panel`,style:{padding:`24px`},children:[(0,i.jsx)(`span`,{className:`badge badge-indigo`,style:{marginBottom:`10px`},children:`JavaScript Wasm Runner`}),(0,i.jsx)(`div`,{className:`code-window`,children:(0,i.jsx)(`pre`,{className:`code-body`,children:(0,i.jsx)(`code`,{children:e.jsIntegration})})})]})]})]})}export{a as default};