import{r as e}from"./rolldown-runtime-hePW80VL.js";import{h as t}from"./vendor-charts-LpGij_Qu.js";import{n}from"./vendor-react-CYlvDiRg.js";import{kt as r,ln as i}from"./vendor-ui-Cq2y2VJf.js";var a=e(t(),1),o=n();function s({onCompleteGame:e}){let[t,n]=(0,a.useState)(`<div class="card">
  <h1>Hallo Informatiker! 🚀</h1>
  <p>Verändere den Code links um das Design live zu sehen.</p>
  <button id="btn">Klick mich!</button>
</div>`),[s,c]=(0,a.useState)(`body {
  background-color: #0d1117;
  color: #ffffff;
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}

button {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}`),[l,u]=(0,a.useState)(`html`),[d,f]=(0,a.useState)(!1),p=`
    <!DOCTYPE html>
    <html>
      <head>
        <style>${s}</style>
      </head>
      <body>
        ${t}
      </body>
    </html>
  `;return(0,o.jsxs)(`div`,{style:{maxWidth:`1100px`,margin:`0 auto`},children:[(0,o.jsxs)(`div`,{style:{marginBottom:`20px`,display:`flex`,justifyContent:`space-between`,alignItems:`center`,flexWrap:`wrap`,gap:`12px`},children:[(0,o.jsxs)(`div`,{children:[(0,o.jsxs)(`h2`,{style:{fontSize:`1.8rem`,fontWeight:`800`,display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,o.jsx)(r,{size:28,color:`var(--accent-cyan)`}),` Live Web Playground & Sandbox`]}),(0,o.jsx)(`p`,{style:{color:`var(--text-muted)`},children:`Schreibe HTML & CSS mit direkter Live-Vorschau in Echtzeit.`})]}),(0,o.jsxs)(`button`,{className:`btn btn-success`,onClick:()=>{d||(f(!0),e(`web_sandbox_first`,75))},disabled:d,children:[(0,o.jsx)(i,{size:16}),` `,d?`Gespeichert!`:`Web-App Speichern (+75 XP)`]})]}),(0,o.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(340px, 1fr))`,gap:`24px`},children:[(0,o.jsxs)(`div`,{className:`glass-panel`,style:{padding:`20px`},children:[(0,o.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,marginBottom:`16px`},children:[(0,o.jsx)(`button`,{onClick:()=>u(`html`),style:{padding:`6px 14px`,borderRadius:`6px`,background:l===`html`?`var(--accent-cyan)`:`var(--bg-tertiary)`,color:`#fff`,fontWeight:`700`,border:`none`,cursor:`pointer`},children:`HTML5`}),(0,o.jsx)(`button`,{onClick:()=>u(`css`),style:{padding:`6px 14px`,borderRadius:`6px`,background:l===`css`?`var(--accent-purple)`:`var(--bg-tertiary)`,color:`#fff`,fontWeight:`700`,border:`none`,cursor:`pointer`},children:`CSS3`})]}),(0,o.jsxs)(`div`,{className:`code-window`,children:[(0,o.jsxs)(`div`,{className:`code-header`,children:[(0,o.jsx)(`span`,{children:l===`html`?`index.html`:`style.css`}),(0,o.jsx)(`span`,{children:`Echtzeit Sync`})]}),(0,o.jsx)(`textarea`,{value:l===`html`?t:s,onChange:e=>l===`html`?n(e.target.value):c(e.target.value),rows:16,style:{width:`100%`,background:`#090d16`,color:`#e2e8f0`,border:`none`,outline:`none`,padding:`14px`,fontFamily:`var(--font-code)`,fontSize:`0.9rem`,resize:`vertical`}})]})]}),(0,o.jsxs)(`div`,{className:`glass-panel`,style:{padding:`20px`},children:[(0,o.jsx)(`h4`,{style:{fontSize:`0.95rem`,fontWeight:`700`,color:`var(--text-muted)`,marginBottom:`12px`},children:`🖥️ Live Browser Vorschau:`}),(0,o.jsx)(`iframe`,{srcDoc:p,title:`Live Preview`,sandbox:`allow-scripts`,style:{width:`100%`,height:`380px`,border:`1px solid var(--border-color)`,borderRadius:`var(--radius-md)`,background:`#ffffff`}})]})]})]})}export{s as default};