import{r as e}from"./rolldown-runtime-hePW80VL.js";import{h as t}from"./vendor-charts-LpGij_Qu.js";import{n}from"./vendor-react-CYlvDiRg.js";import{et as r}from"./vendor-ui-Cq2y2VJf.js";var i=e(t(),1),a=[{id:`rest`,type:`REST API`,method:`GET`,url:`https://api.devgame.it/v1/users/42`,responseBody:`{
  "id": 42,
  "username": "developer_pro",
  "email": "dev@example.com",
  "xp": 1420,
  "level": 12,
  "unlockedBadges": ["first_steps", "sql_master", "pwa_hero"]
}`},{id:`graphql`,type:`GraphQL API`,method:`POST`,url:`https://api.devgame.it/graphql`,query:`query GetUser {
  user(id: 42) {
    username
    xp
    level
  }
}`,responseBody:`{
  "data": {
    "user": {
      "username": "developer_pro",
      "xp": 1420,
      "level": 12
    }
  }
}`}],o=n();function s(){let[e,t]=(0,i.useState)(a[0].id),n=a.find(t=>t.id===e)||a[0];return(0,o.jsxs)(`div`,{style:{maxWidth:`1000px`,margin:`0 auto`,paddingBottom:`60px`},children:[(0,o.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`,marginBottom:`24px`,border:`2px solid var(--accent-purple)`},children:[(0,o.jsxs)(`h1`,{style:{fontSize:`2.2rem`,fontWeight:`800`,marginBottom:`8px`,color:`var(--text-main)`,display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,o.jsx)(r,{size:32,style:{color:`var(--accent-purple)`}}),` GraphQL & REST API Benchmark Studio`]}),(0,o.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.05rem`},children:`Teste REST Endpunkte vs GraphQL Queries & analysiere HTTP Status Codes in Echtzeit.`})]}),(0,o.jsx)(`div`,{style:{display:`flex`,gap:`10px`,marginBottom:`24px`,overflowX:`auto`},children:a.map(n=>(0,o.jsx)(`button`,{onClick:()=>t(n.id),style:{minHeight:`48px`,padding:`10px 20px`,borderRadius:`var(--radius-md)`,fontWeight:`700`,fontSize:`0.95rem`,background:e===n.id?`var(--accent-purple)`:`var(--bg-card)`,color:e===n.id?`#ffffff`:`var(--text-main)`,border:e===n.id?`2px solid var(--accent-purple)`:`2px solid var(--border-color)`,cursor:`pointer`,whiteSpace:`nowrap`},children:n.type},n.id))}),(0,o.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`},children:[(0,o.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`10px`,marginBottom:`16px`,background:`var(--bg-tertiary)`,padding:`12px`,borderRadius:`var(--radius-md)`,border:`1px solid var(--border-color)`},children:[(0,o.jsx)(`span`,{className:`badge badge-indigo`,children:n.method}),(0,o.jsx)(`span`,{style:{fontFamily:`monospace`,fontSize:`0.95rem`,color:`var(--text-main)`,flex:1},children:n.url}),(0,o.jsx)(`span`,{style:{fontSize:`0.88rem`,color:`var(--accent-emerald)`,fontWeight:700},children:`200 OK`})]}),n.query&&(0,o.jsxs)(`div`,{className:`code-window`,style:{marginBottom:`20px`},children:[(0,o.jsx)(`div`,{className:`code-header`,children:(0,o.jsx)(`span`,{children:`GraphQL Query`})}),(0,o.jsx)(`pre`,{className:`code-body`,children:(0,o.jsx)(`code`,{children:n.query})})]}),(0,o.jsxs)(`div`,{className:`code-window`,children:[(0,o.jsx)(`div`,{className:`code-header`,children:(0,o.jsx)(`span`,{children:`JSON Server Response`})}),(0,o.jsx)(`pre`,{className:`code-body`,children:(0,o.jsx)(`code`,{children:n.responseBody})})]})]})]})}export{s as default};