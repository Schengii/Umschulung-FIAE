import{r as e}from"./rolldown-runtime-hePW80VL.js";import{h as t}from"./vendor-charts-LpGij_Qu.js";import{n}from"./vendor-react-CYlvDiRg.js";import{Qt as r,wn as i}from"./vendor-ui-Cq2y2VJf.js";var a=e(t(),1),o=[{id:`dockerfile`,title:`1. Dockerfile Erstellung`,desc:`Lerne wie man ein sauberes Multi-Stage Dockerfile für Node.js oder React-Anwendungen schreibt.`,snippet:`FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`},{id:`compose`,title:`2. Docker Compose (Multi-Container)`,desc:`Orchestriere mehrere Container (Frontend, Node.js API, PostgreSQL) mit einer einzigen docker-compose.yml Datei.`,snippet:`version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secretpassword
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`},{id:`networking`,title:`3. Docker Netzwerke (Bridge, Host, Overlay)`,desc:`Container-Kommunikation über isolierte User-Defined Bridge-Netzwerke mit automatischer DNS-Namensauflösung.`,snippet:`# Erstelle isoliertes Netzwerk
docker network create my-app-net

# Starte Container im Netzwerk
docker run -d --name backend --network my-app-net backend-image:latest
docker run -d --name frontend --network my-app-net -p 80:80 frontend-image:latest

# Der Frontend-Container kann den Backend-Container direkt per Namen 'http://backend:8080' erreichen!`},{id:`security`,title:`4. Docker Security & Non-Root User`,desc:`Best Practices: Führe Container niemals als root-User aus, nutze Alpine-Images und minimiere Angriffsflächen.`,snippet:`FROM node:20-alpine
# Gruppe und unprivilegierten Nutzer anlegen
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --chown=appuser:appgroup . .
# Zum sicheren Nutzer wechseln
USER appuser
EXPOSE 3000
CMD ["node", "server.js"]`}],s=n();function c(){let[e,t]=(0,a.useState)(o[0].id),[n,c]=(0,a.useState)(!1),l=o.find(t=>t.id===e)||o[0];return(0,s.jsxs)(`div`,{style:{maxWidth:`1000px`,margin:`0 auto`,paddingBottom:`60px`},children:[(0,s.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`,marginBottom:`24px`,border:`2px solid var(--accent-primary)`},children:[(0,s.jsxs)(`h1`,{style:{fontSize:`2.2rem`,fontWeight:`800`,marginBottom:`8px`,color:`var(--text-main)`,display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,s.jsx)(i,{size:32,style:{color:`var(--accent-primary)`}}),` Docker & Containerization Interactive Lab`]}),(0,s.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.05rem`},children:`Lerne Dockerfiles, Multi-Stage Builds & Docker Compose für moderne Cloud-native Entwicklungen.`})]}),(0,s.jsx)(`div`,{style:{display:`flex`,gap:`10px`,marginBottom:`24px`,overflowX:`auto`},children:o.map(n=>(0,s.jsx)(`button`,{onClick:()=>t(n.id),style:{minHeight:`48px`,padding:`10px 20px`,borderRadius:`var(--radius-md)`,fontWeight:`700`,fontSize:`0.95rem`,background:e===n.id?`var(--accent-primary)`:`var(--bg-card)`,color:e===n.id?`#ffffff`:`var(--text-main)`,border:e===n.id?`2px solid var(--accent-primary)`:`2px solid var(--border-color)`,cursor:`pointer`,whiteSpace:`nowrap`},children:n.title},n.id))}),(0,s.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`},children:[(0,s.jsx)(`h2`,{style:{fontSize:`1.6rem`,fontWeight:`800`,marginBottom:`8px`,color:`var(--text-main)`},children:l.title}),(0,s.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.02rem`,lineHeight:`1.6`,marginBottom:`24px`},children:l.desc}),(0,s.jsxs)(`div`,{className:`code-window`,children:[(0,s.jsxs)(`div`,{className:`code-header`,children:[(0,s.jsxs)(`span`,{children:[l.title,` Snippet`]}),(0,s.jsxs)(`button`,{onClick:()=>{navigator.clipboard.writeText(l.snippet),c(!0),setTimeout(()=>c(!1),2e3)},style:{background:`transparent`,border:`none`,color:`#f8fafc`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`4px`,fontSize:`0.85rem`},children:[(0,s.jsx)(r,{size:14}),` `,n?`Kopiert ✓`:`Kopieren`]})]}),(0,s.jsx)(`pre`,{className:`code-body`,children:(0,s.jsx)(`code`,{children:l.snippet})})]})]})]})}export{c as default};