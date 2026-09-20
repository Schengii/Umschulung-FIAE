import{r as e}from"./rolldown-runtime-hePW80VL.js";import{h as t}from"./vendor-charts-LpGij_Qu.js";import{n}from"./vendor-react-CYlvDiRg.js";import{Qt as r,Zt as i}from"./vendor-ui-Cq2y2VJf.js";var a=e(t(),1),o=[{id:`deployment`,title:`1. Kubernetes Deployment YAML`,desc:`Verwalte replizierte Pods, Rolling Updates & Self-Healing Container.`,yamlSnippet:`apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: node-api
        image: devgame/api:v2.0
        ports:
        - containerPort: 8080`},{id:`service`,title:`2. Kubernetes Service & Ingress`,desc:`Exponiere deine Pods nach außen mit LoadBalancer & HTTPS Ingress Routing.`,yamlSnippet:`apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  type: LoadBalancer
  selector:
    app: api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080`}],s=n();function c(){let[e,t]=(0,a.useState)(o[0].id),[n,c]=(0,a.useState)(!1),l=o.find(t=>t.id===e)||o[0];return(0,s.jsxs)(`div`,{style:{maxWidth:`1000px`,margin:`0 auto`,paddingBottom:`60px`},children:[(0,s.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`,marginBottom:`24px`,border:`2px solid var(--accent-indigo)`},children:[(0,s.jsxs)(`h1`,{style:{fontSize:`2.2rem`,fontWeight:`800`,marginBottom:`8px`,color:`var(--text-main)`,display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,s.jsx)(i,{size:32,style:{color:`var(--accent-indigo)`}}),` Kubernetes & Cloud Native Architecture Lab`]}),(0,s.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.05rem`},children:`Erstelle K8s Deployments, Replicas, Services (LoadBalancer) & Ingress Routing.`})]}),(0,s.jsx)(`div`,{style:{display:`flex`,gap:`10px`,marginBottom:`24px`,overflowX:`auto`},children:o.map(n=>(0,s.jsx)(`button`,{onClick:()=>t(n.id),style:{minHeight:`48px`,padding:`10px 20px`,borderRadius:`var(--radius-md)`,fontWeight:`700`,fontSize:`0.95rem`,background:e===n.id?`var(--accent-indigo)`:`var(--bg-card)`,color:e===n.id?`#ffffff`:`var(--text-main)`,border:e===n.id?`2px solid var(--accent-indigo)`:`2px solid var(--border-color)`,cursor:`pointer`,whiteSpace:`nowrap`},children:n.title},n.id))}),(0,s.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`},children:[(0,s.jsx)(`h2`,{style:{fontSize:`1.6rem`,fontWeight:`800`,marginBottom:`8px`,color:`var(--text-main)`},children:l.title}),(0,s.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.02rem`,lineHeight:`1.6`,marginBottom:`24px`},children:l.desc}),(0,s.jsxs)(`div`,{className:`code-window`,children:[(0,s.jsxs)(`div`,{className:`code-header`,children:[(0,s.jsxs)(`span`,{children:[`Kubernetes Manifest (`,l.title,`)`]}),(0,s.jsxs)(`button`,{onClick:()=>{navigator.clipboard.writeText(l.yamlSnippet),c(!0),setTimeout(()=>c(!1),2e3)},style:{background:`transparent`,border:`none`,color:`#f8fafc`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`4px`,fontSize:`0.85rem`},children:[(0,s.jsx)(r,{size:14}),` `,n?`Kopiert ✓`:`Kopieren`]})]}),(0,s.jsx)(`pre`,{className:`code-body`,children:(0,s.jsx)(`code`,{children:l.yamlSnippet})})]})]})]})}export{c as default};