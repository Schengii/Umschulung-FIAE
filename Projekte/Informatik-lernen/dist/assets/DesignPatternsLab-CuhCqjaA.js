import{r as e}from"./rolldown-runtime-hePW80VL.js";import{h as t}from"./vendor-charts-LpGij_Qu.js";import{n}from"./vendor-react-CYlvDiRg.js";import{pt as r}from"./vendor-ui-Cq2y2VJf.js";var i=e(t(),1),a=n();function o(){let e=[{id:`singleton`,name:`Singleton Pattern`,category:`Erzeugungsmuster (Creational)`,desc:`Stellt sicher, dass eine Klasse genau eine einzige Instanz besitzt (z. B. Datenbankverbindung).`,badCode:`// Bad: Erzeugt jedes Mal ein neues Objekt
class Database {
  constructor() {
    this.connection = "Verbindung 1";
  }
}`,goodCode:`// Good: Singleton Pattern
class Database {
  static instance;
  constructor() {
    if (Database.instance) return Database.instance;
    this.connection = "Einzige Verbindung";
    Database.instance = this;
  }
}`},{id:`observer`,name:`Observer Pattern`,category:`Verhaltensmuster (Behavioral)`,desc:`Benachrichtigt Abonnenten automatisch über Zustandsänderungen (z. B. Event-Handling in React).`,badCode:`// Bad: Manuelles Prüfen in Dauerschleife
while(true) {
  if (dataChanged) updateUI();
}`,goodCode:`// Good: Observer Pattern (Publish/Subscribe)
class Subject {
  constructor() { this.observers = []; }
  subscribe(fn) { this.observers.push(fn); }
  notify(data) { this.observers.forEach(fn => fn(data)); }
}`}],[t,n]=(0,i.useState)(e[0].id),o=e.find(e=>e.id===t)||e[0];return(0,a.jsxs)(`div`,{style:{maxWidth:`950px`,margin:`0 auto`,paddingBottom:`60px`},children:[(0,a.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`,marginBottom:`24px`,border:`2px solid var(--accent-primary)`},children:[(0,a.jsxs)(`h1`,{style:{fontSize:`2.2rem`,fontWeight:`800`,marginBottom:`8px`,color:`var(--text-main)`,display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,a.jsx)(r,{size:32,style:{color:`var(--accent-primary)`}}),` Software Design Patterns & Refactoring Lab`]}),(0,a.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.05rem`},children:`Lerne bewährte Entwurfsmuster (Singleton, Observer, Factory, Strategy) für sauberen & skalierbaren Code.`})]}),(0,a.jsx)(`div`,{style:{display:`flex`,gap:`10px`,marginBottom:`24px`},children:e.map(e=>(0,a.jsx)(`button`,{onClick:()=>n(e.id),style:{minHeight:`48px`,padding:`10px 20px`,borderRadius:`var(--radius-md)`,fontWeight:`700`,fontSize:`0.95rem`,background:t===e.id?`var(--accent-primary)`:`var(--bg-card)`,color:t===e.id?`#ffffff`:`var(--text-main)`,border:t===e.id?`2px solid var(--accent-primary)`:`2px solid var(--border-color)`,cursor:`pointer`},children:e.name},e.id))}),(0,a.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`},children:[(0,a.jsx)(`span`,{className:`badge badge-indigo`,style:{marginBottom:`10px`},children:o.category}),(0,a.jsx)(`h2`,{style:{fontSize:`1.6rem`,fontWeight:`800`,marginBottom:`8px`,color:`var(--text-main)`},children:o.name}),(0,a.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.02rem`,marginBottom:`24px`},children:o.desc}),(0,a.jsxs)(`div`,{className:`grid-responsive`,style:{gap:`16px`},children:[(0,a.jsxs)(`div`,{className:`code-window`,children:[(0,a.jsx)(`div`,{className:`code-header`,style:{color:`var(--accent-rose)`},children:`❌ Vorher (Bad Practice)`}),(0,a.jsx)(`pre`,{className:`code-body`,children:(0,a.jsx)(`code`,{children:o.badCode})})]}),(0,a.jsxs)(`div`,{className:`code-window`,children:[(0,a.jsx)(`div`,{className:`code-header`,style:{color:`var(--accent-emerald)`},children:`✅ Nachher mit Design Pattern`}),(0,a.jsx)(`pre`,{className:`code-body`,children:(0,a.jsx)(`code`,{children:o.goodCode})})]})]})]})]})}export{o as default};