import{r as e}from"./rolldown-runtime-hePW80VL.js";import{h as t}from"./vendor-charts-LpGij_Qu.js";import{n}from"./vendor-react-CYlvDiRg.js";import{pt as r}from"./vendor-ui-Cq2y2VJf.js";var i=e(t(),1),a=[{id:`lit`,name:`Lit.dev (LitElement)`,badge:`Lightweight & Ultra-Fast`,icon:`🔥`,desc:`Offizielle Google-Bibliothek für schnelle, leichtgewichtige Web Components mit reactive State & Scoped Styles.`,exampleCode:`import { LitElement, html, css } from 'lit';

export class MyElement extends LitElement {
  static styles = css\`p { color: #4f46e5; font-weight: bold; }\`;
  static properties = { name: { type: String } };

  constructor() {
    super();
    this.name = 'World';
  }

  render() {
    return html\`<p>Hello, \${this.name}!</p>\`;
  }
}
customElements.define('my-element', MyElement);`},{id:`vaadin`,name:`Vaadin Web Framework`,badge:`Java & Web Components`,icon:`🌱`,desc:`Enterprise Web Framework zum Erstellen von modernen UIs in Java & Web Components ohne JavaScript-Overhead.`,exampleCode:`// Vaadin Java UI Component
@Route("")
public class MainView extends VerticalLayout {
    public MainView() {
        TextField nameField = new TextField("Dein Name");
        Button button = new Button("Absenden", e -> 
            Notification.show("Hallo " + nameField.getValue()));
        add(nameField, button);
    }
}`},{id:`native_wc`,name:`Native HTML5 Web Components`,badge:`W3C Browser Standard`,icon:`🌐`,desc:`Verwende Custom Elements, Shadow DOM und HTML Templates nativ im Browser ohne Framework-Abhängigkeiten.`,exampleCode:`class CustomButton extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = \`<button style="background: #0d9488; color: white; border: none; padding: 10px 20px; border-radius: 8px;">\${this.textContent}</button>\`;
  }
}
customElements.define('custom-button', CustomButton);`}],o=n();function s(){let[e,t]=(0,i.useState)(a[0].id),n=a.find(t=>t.id===e)||a[0];return(0,o.jsxs)(`div`,{style:{maxWidth:`1000px`,margin:`0 auto`,paddingBottom:`60px`},children:[(0,o.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`,marginBottom:`24px`,border:`2px solid var(--accent-teal)`},children:[(0,o.jsxs)(`h1`,{style:{fontSize:`2.2rem`,fontWeight:`800`,marginBottom:`8px`,color:`var(--text-main)`,display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,o.jsx)(r,{size:32,style:{color:`var(--accent-teal)`}}),` Web Components & Micro-Frontends Hub`]}),(0,o.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.05rem`},children:`Lerne moderne Komponenten-Technologien: **Lit.dev**, **Vaadin** und **Native W3C Web Components**.`})]}),(0,o.jsx)(`div`,{style:{display:`flex`,gap:`10px`,marginBottom:`24px`,overflowX:`auto`},children:a.map(n=>(0,o.jsxs)(`button`,{onClick:()=>t(n.id),style:{minHeight:`48px`,padding:`10px 20px`,borderRadius:`var(--radius-md)`,fontWeight:`700`,fontSize:`0.95rem`,background:e===n.id?`var(--accent-teal)`:`var(--bg-card)`,color:e===n.id?`#ffffff`:`var(--text-main)`,border:e===n.id?`2px solid var(--accent-teal)`:`2px solid var(--border-color)`,cursor:`pointer`,whiteSpace:`nowrap`},children:[n.icon,` `,n.name]},n.id))}),(0,o.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`},children:[(0,o.jsx)(`span`,{className:`badge badge-teal`,style:{marginBottom:`10px`},children:n.badge}),(0,o.jsxs)(`h2`,{style:{fontSize:`1.8rem`,fontWeight:`800`,marginBottom:`8px`,color:`var(--text-main)`},children:[n.icon,` `,n.name]}),(0,o.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.05rem`,lineHeight:`1.6`,marginBottom:`24px`},children:n.desc}),(0,o.jsxs)(`div`,{className:`code-window`,children:[(0,o.jsxs)(`div`,{className:`code-header`,children:[(0,o.jsxs)(`span`,{children:[`Code Beispiel (`,n.name,`)`]}),(0,o.jsx)(`span`,{children:`Web Component Syntax`})]}),(0,o.jsx)(`pre`,{className:`code-body`,children:(0,o.jsx)(`code`,{children:n.exampleCode})})]})]})]})}export{s as default};