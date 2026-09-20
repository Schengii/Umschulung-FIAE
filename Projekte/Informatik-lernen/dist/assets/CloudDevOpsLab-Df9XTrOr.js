import{r as e}from"./rolldown-runtime-hePW80VL.js";import{h as t}from"./vendor-charts-LpGij_Qu.js";import{n}from"./vendor-react-CYlvDiRg.js";import{Qt as r,rn as i}from"./vendor-ui-Cq2y2VJf.js";var a=e(t(),1),o=[{id:`github_actions`,title:`1. GitHub Actions CI/CD Pipeline`,desc:`Automatisierte Tests, Build & Deployment bei jedem Git Push.`,pipelineYaml:`name: CI/CD Pipeline
on: [push]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build`},{id:`aws_lambda`,title:`2. AWS Lambda Serverless`,desc:`Ausführen von Code ohne Server-Infrastruktur verwalten zu müssen.`,pipelineYaml:`exports.handler = async (event) => {
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Hallo aus AWS Lambda Serverless!" })
    };
};`}],s=n();function c(){let[e,t]=(0,a.useState)(o[0].id),[n,c]=(0,a.useState)(!1),l=o.find(t=>t.id===e)||o[0];return(0,s.jsxs)(`div`,{style:{maxWidth:`1000px`,margin:`0 auto`,paddingBottom:`60px`},children:[(0,s.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`,marginBottom:`24px`,border:`2px solid var(--accent-teal)`},children:[(0,s.jsxs)(`h1`,{style:{fontSize:`2.2rem`,fontWeight:`800`,marginBottom:`8px`,color:`var(--text-main)`,display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,s.jsx)(i,{size:32,style:{color:`var(--accent-teal)`}}),` Cloud Infrastructure & DevOps Playground`]}),(0,s.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.05rem`},children:`Erstelle CI/CD Pipelines (GitHub Actions) & AWS Lambda Serverless Funktionen.`})]}),(0,s.jsx)(`div`,{style:{display:`flex`,gap:`10px`,marginBottom:`24px`,overflowX:`auto`},children:o.map(n=>(0,s.jsx)(`button`,{onClick:()=>t(n.id),style:{minHeight:`48px`,padding:`10px 20px`,borderRadius:`var(--radius-md)`,fontWeight:`700`,fontSize:`0.95rem`,background:e===n.id?`var(--accent-teal)`:`var(--bg-card)`,color:e===n.id?`#ffffff`:`var(--text-main)`,border:e===n.id?`2px solid var(--accent-teal)`:`2px solid var(--border-color)`,cursor:`pointer`,whiteSpace:`nowrap`},children:n.title},n.id))}),(0,s.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`},children:[(0,s.jsx)(`h2`,{style:{fontSize:`1.6rem`,fontWeight:`800`,marginBottom:`8px`,color:`var(--text-main)`},children:l.title}),(0,s.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.02rem`,lineHeight:`1.6`,marginBottom:`24px`},children:l.desc}),(0,s.jsxs)(`div`,{className:`code-window`,children:[(0,s.jsxs)(`div`,{className:`code-header`,children:[(0,s.jsxs)(`span`,{children:[l.title,` Pipeline Code`]}),(0,s.jsxs)(`button`,{onClick:()=>{navigator.clipboard.writeText(l.pipelineYaml),c(!0),setTimeout(()=>c(!1),2e3)},style:{background:`transparent`,border:`none`,color:`#f8fafc`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`4px`,fontSize:`0.85rem`},children:[(0,s.jsx)(r,{size:14}),` `,n?`Kopiert ✓`:`Kopieren`]})]}),(0,s.jsx)(`pre`,{className:`code-body`,children:(0,s.jsx)(`code`,{children:l.pipelineYaml})})]})]})]})}export{c as default};