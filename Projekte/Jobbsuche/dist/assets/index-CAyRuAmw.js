(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const ze="modulepreload",Ae=function(n){return"/"+n},pe={},Y=function(e,t,i){let s=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),o=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));s=Promise.allSettled(t.map(l=>{if(l=Ae(l),l in pe)return;pe[l]=!0;const d=l.endsWith(".css"),u=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${u}`))return;const c=document.createElement("link");if(c.rel=d?"stylesheet":ze,d||(c.as="script"),c.crossOrigin="",c.href=l,o&&c.setAttribute("nonce",o),document.head.appendChild(c),d)return new Promise((p,b)=>{c.addEventListener("load",p),c.addEventListener("error",()=>b(new Error(`Unable to preload CSS for ${l}`)))})}))}function r(a){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=a,window.dispatchEvent(o),!o.defaultPrevented)throw a}return s.then(a=>{for(const o of a||[])o.status==="rejected"&&r(o.reason);return e().catch(r)})},z={JOBS:"jobmatch_jobs",PROFILE:"jobmatch_profile",PROFILES:"jobmatch_profiles",ACTIVE_PROFILE_ID:"jobmatch_active_profile_id",WEIGHTS:"jobmatch_weights"},me={name:"Alex Neumann",title:"Frontend Developer",skills:["JavaScript","HTML5","CSS Grid","React","Figma","TypeScript","Responsive Design","Git"],experience:`- 3 Jahre Erfahrung als Webentwickler im E-Commerce
- Erstellung von responsiven User Interfaces
- Erfahrung mit REST APIs und State Management`,geminiApiKey:"",geminiModel:"gemini-1.5-flash",geminiTemperature:.7,geminiCustomInstructions:"",lrsEnabled:!1,rgsEnabled:!1,taxClass:"1",churchTax:"0",hasChildren:!1,supabaseUrl:"",supabaseAnonKey:"",themePrimaryHue:239,themeSecondaryHue:263,weeklyGoal:3,cvText:""},ge={salary:4,commute:2,remote:5,culture:3,tech:4},Te=[{id:"mock-1",title:"Senior Frontend Developer (m/w/d)",company:"InnoTech Solutions",location:"München / Hybrid",workMode:"Hybrid",salary:72e3,url:"https://example.com/jobs/innotech-frontend",deadline:"2026-06-30",description:"Wir suchen einen Frontend-Enthusiasten mit fundierten Kenntnissen in JavaScript, React und CSS Grid. Erfahrung mit TypeScript und Figma ist ein großes Plus.",status:"interviewing",ratings:{salary:8,commute:6,remote:8,culture:7,tech:9},createdAt:"2026-06-01T10:00:00.000Z"},{id:"mock-2",title:"Web Entwickler / React Specialist",company:"Global Commerce GmbH",location:"Remote",workMode:"Remote",salary:65e3,url:"https://example.com/jobs/global-react",deadline:"2026-07-15",description:"Deine Aufgaben: Weiterentwicklung unserer Storefronts in React und TypeScript. Enge Abstimmung mit UX-Designern in Figma. Kenntnisse in REST APIs und Git vorausgesetzt.",status:"applied",ratings:{salary:7,commute:10,remote:10,culture:8,tech:8},createdAt:"2026-06-03T14:30:00.000Z"},{id:"mock-3",title:"Junior UI Engineer",company:"DesignKraft Agency",location:"Berlin / Vor Ort",workMode:"Vor Ort",salary:48e3,url:"https://example.com/jobs/designkraft-junior",deadline:"2026-06-18",description:"Unterstütze uns bei der Umsetzung von kreativen Websites. Du liebst HTML5, CSS Grid und Responsive Design? Adobe XD und Figma sind dir keine Fremdwörter?",status:"saved",ratings:{salary:5,commute:4,remote:2,culture:9,tech:7},createdAt:"2026-06-05T09:15:00.000Z"},{id:"mock-4",title:"Frontend Lead Developer",company:"CoreByte Systems",location:"München",workMode:"Vor Ort",salary:85e3,url:"https://example.com/jobs/corebyte-lead",deadline:"2026-06-25",description:"Architektur unserer Frontend-Systeme. Stack: Next.js, TypeScript, TailwindCSS. Du koordinierst das Entwickler-Team und stimmst dich mit dem Produktmanagement ab.",status:"offer",ratings:{salary:9,commute:4,remote:3,culture:6,tech:8},createdAt:"2026-05-28T16:00:00.000Z"}],y={getJobs(){const n=localStorage.getItem(z.JOBS);let e=[];n?e=JSON.parse(n):(e=Te,this.saveJobs(e));let t=!1;const i=e.map(s=>{let r=!1;return(!s.todos||!Array.isArray(s.todos))&&(s.todos=[],r=!0),(!s.interviews||!Array.isArray(s.interviews))&&(s.interviews=[],r=!0),(!s.communicationLogs||!Array.isArray(s.communicationLogs))&&(s.communicationLogs=[],r=!0),(!s.expenses||!Array.isArray(s.expenses))&&(s.expenses=[],r=!0),(!s.documents||!Array.isArray(s.documents))&&(s.documents=[],r=!0),r&&(t=!0),s});return t&&this.saveJobs(i),i},saveJobs(n){localStorage.setItem(z.JOBS,JSON.stringify(n));const e=this.getProfile();Y(()=>import("./supabaseSync-CNVu12db.js"),[]).then(t=>{t.supabaseSync.syncJobs(e,n)}).catch(t=>console.warn("Supabase jobs sync failed:",t)),window.app&&typeof window.app.updateNotificationBell=="function"&&window.app.updateNotificationBell()},addJob(n){const e=this.getJobs(),t={...n,id:"job-"+Date.now(),createdAt:new Date().toISOString()};return e.push(t),this.saveJobs(e),t},updateJob(n){const e=this.getJobs(),t=e.findIndex(i=>i.id===n.id);return t!==-1?(e[t]={...e[t],...n},this.saveJobs(e),!0):!1},deleteJob(n){const t=this.getJobs().filter(i=>i.id!==n);this.saveJobs(t)},getProfiles(){let n=localStorage.getItem(z.PROFILES),e=localStorage.getItem(z.ACTIVE_PROFILE_ID),t=[];if(n)try{t=JSON.parse(n)}catch{}const i=localStorage.getItem(z.PROFILE);if(!t||t.length===0){let r=me;if(i)try{r=JSON.parse(i)}catch{}r.id||(r.id="prof-default"),r.profileName||(r.profileName=r.name||"Standard Profil"),t=[r],localStorage.setItem(z.PROFILES,JSON.stringify(t))}let s=!1;return t=t.map((r,a)=>(r.id||(r.id="prof-"+a+"-"+Date.now(),s=!0),r.profileName||(r.profileName=r.name||`Profil ${a+1}`,s=!0),r)),s&&localStorage.setItem(z.PROFILES,JSON.stringify(t)),(!e||!t.some(r=>r.id===e))&&(e=t[0].id,localStorage.setItem(z.ACTIVE_PROFILE_ID,e)),t},getActiveProfileId(){return this.getProfiles(),localStorage.getItem(z.ACTIVE_PROFILE_ID)},setActiveProfileId(n){const e=this.getProfiles();if(e.some(t=>t.id===n)){localStorage.setItem(z.ACTIVE_PROFILE_ID,n);const t=e.find(i=>i.id===n);localStorage.setItem(z.PROFILE,JSON.stringify(t)),Y(()=>import("./supabaseSync-CNVu12db.js"),[]).then(i=>{i.supabaseSync.syncProfile(t);const s=this.getJobs();i.supabaseSync.syncJobs(t,s)}).catch(i=>console.warn("Supabase profile sync failed:",i))}},getProfile(){const n=this.getProfiles(),e=this.getActiveProfileId();return n.find(t=>t.id===e)||n[0]},saveProfile(n){n.id||(n.id=this.getActiveProfileId()||"prof-default"),n.profileName||(n.profileName=n.name||"Standard Profil");const e=this.getProfiles(),t=e.findIndex(s=>s.id===n.id);t!==-1?e[t]=n:e.push(n),localStorage.setItem(z.PROFILES,JSON.stringify(e)),this.getActiveProfileId()===n.id&&(localStorage.setItem(z.PROFILE,JSON.stringify(n)),Y(()=>import("./supabaseSync-CNVu12db.js"),[]).then(s=>{s.supabaseSync.syncProfile(n);const r=this.getJobs();s.supabaseSync.syncJobs(n,r)}).catch(s=>console.warn("Supabase profile sync failed:",s)))},addProfile(n){const e=this.getProfiles(),t=this.getProfile(),i={...me,...t,id:"prof-"+Date.now(),profileName:n,name:t.name||"Alex Neumann",skills:[...t.skills],experience:t.experience||""};return e.push(i),localStorage.setItem(z.PROFILES,JSON.stringify(e)),this.setActiveProfileId(i.id),i},deleteProfile(n){let e=this.getProfiles();if(e.length<=1)throw new Error("Das letzte verbleibende Profil kann nicht gelöscht werden.");e=e.filter(i=>i.id!==n),localStorage.setItem(z.PROFILES,JSON.stringify(e)),this.getActiveProfileId()===n&&this.setActiveProfileId(e[0].id)},getWeights(){const n=localStorage.getItem(z.WEIGHTS);return n?JSON.parse(n):(this.saveWeights(ge),ge)},saveWeights(n){localStorage.setItem(z.WEIGHTS,JSON.stringify(n))},exportBackup(){return JSON.stringify({version:"1.0",jobs:this.getJobs(),profile:this.getProfile(),weights:this.getWeights()},null,2)},importBackup(n){try{const e=JSON.parse(n);if(!e.jobs||!Array.isArray(e.jobs)||!e.profile||!e.weights)throw new Error("Ungültiges Format: jobs, profile oder weights fehlen.");return this.saveJobs(e.jobs),this.saveProfile(e.profile),this.saveWeights(e.weights),!0}catch(e){throw console.error("Backup Import fehlgeschlagen",e),e}},getExpenses(){const n=localStorage.getItem("jobmatch_expenses");if(!n)return[];try{return JSON.parse(n)}catch{return[]}},saveExpenses(n){localStorage.setItem("jobmatch_expenses",JSON.stringify(n))},addExpense(n){const e=this.getExpenses(),t={id:"exp-"+Date.now(),date:new Date().toISOString().split("T")[0],amount:0,category:"Sonstiges",description:"",kilometers:0,isFlatRate:!1,...n};return e.push(t),this.saveExpenses(e),t},deleteExpense(n){const e=this.getExpenses().filter(t=>t.id!==n);this.saveExpenses(e)},getCustomColumns(){const n=[{id:"saved",title:"Gespeichert",badgeClass:"badge-saved",order:1},{id:"ready",title:"Unterlagen bereit",badgeClass:"badge-ready",order:2},{id:"applied",title:"Beworben",badgeClass:"badge-applied",order:3},{id:"interviewing",title:"Gespräch",badgeClass:"badge-interviewing",order:4},{id:"offer",title:"Angebot erhalten",badgeClass:"badge-offer",order:5},{id:"rejected",title:"Absage",badgeClass:"badge-rejected",order:6}],e=localStorage.getItem("jobmatch_custom_columns");if(!e)return n;try{const t=JSON.parse(e);return Array.isArray(t)&&t.length>0?t:n}catch{return n}},saveCustomColumns(n){localStorage.setItem("jobmatch_custom_columns",JSON.stringify(n))},getRejectionHistory(){const n=localStorage.getItem("jobmatch_rejection_history");if(!n)return[];try{return JSON.parse(n)}catch{return[]}},saveRejectionHistory(n){localStorage.setItem("jobmatch_rejection_history",JSON.stringify(n))},addRejectionReason(n,e,t,i,s=""){const r=this.getRejectionHistory();r.push({id:"rej-"+Date.now(),jobId:n,company:e,jobTitle:t,reasonCategory:i,notes:s,date:new Date().toISOString()}),this.saveRejectionHistory(r)}},Be=["javascript","html5","html","css grid","css","react","vue","angular","typescript","node.js","node","next.js","tailwind","figma","ui","ux","git","github","python","java","c#","c++","docker","kubernetes","aws","cloud","rest api","api","scrum","agile","projektmanagement","sql","nosql","mongodb","responsive design","adobe xd","sketch","english","deutsch"],A={async fetchJobDescriptionFromUrl(n){if(!n)throw new Error("Keine URL angegeben.");const e=`https://api.allorigins.win/get?url=${encodeURIComponent(n)}`,t=await fetch(e);if(!t.ok)throw new Error("Fehler beim Abrufen der URL.");const s=(await t.json()).contents;if(!s)throw new Error("Keine Inhalte unter dieser URL gefunden.");const a=new DOMParser().parseFromString(s,"text/html");let o=a.body;const l=a.querySelector("#jobDescriptionText")||a.querySelector(".jobsearch-JobComponent-description"),d=a.querySelector(".show-more-less-html__markup")||a.querySelector(".jobs-description__content")||a.querySelector(".description__text"),u=a.querySelector(".job-description")||a.querySelector(".js-app-ld-content")||a.querySelector(".g-job-description");return l?o=l:d?o=d:u&&(o=u),o.querySelectorAll("script, style, head, nav, footer, header, iframe, noscript, button, input").forEach(p=>p.remove()),(o.innerText||o.textContent||"").replace(/\s+/g," ").trim().slice(0,5e3)},async testApiKey(n){var l,d,u,c,p,b;if(!n||!n.trim())throw new Error("Kein API-Key angegeben.");const i=`https://generativelanguage.googleapis.com/v1beta/models/${y.getProfile().geminiModel||"gemini-1.5-flash"}:generateContent?key=${n}`,r=await fetch(i,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:"Antworte kurz mit dem Wort 'OK', wenn du mich hoerst."}]}]})});if(!r.ok){const v=await r.json();throw new Error(((l=v.error)==null?void 0:l.message)||"Verbindung fehlgeschlagen.")}if(!((b=(p=(c=(u=(d=(await r.json()).candidates)==null?void 0:d[0])==null?void 0:u.content)==null?void 0:c.parts)==null?void 0:p[0])==null?void 0:b.text))throw new Error("Keine Antwort von der API erhalten.");return!0},extractKeywords(n){if(!n)return[];const e=n.toLowerCase(),t=Be.filter(i=>{const s=i.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&");return new RegExp(`\\b${s}\\b|\\b${s}`,"i").test(e)});return[...new Set(t)]},analyzeMatch(n,e){if(!e)return{matchScore:0,matchingSkills:[],missingSkills:[]};const t=this.extractKeywords(e);if(t.length===0){const l=e.toLowerCase(),d=n.filter(u=>{const c=u.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&");return new RegExp(`\\b${c}\\b`,"i").test(l)});return{matchScore:n.length>0?Math.round(d.length/Math.min(n.length,5)*100):0,matchingSkills:d,missingSkills:[]}}const i=n.map(l=>l.toLowerCase().trim()),s=[],r=[];t.forEach(l=>{if(i.some(u=>u===l||u.includes(l)||l.includes(u))){const u=n.find(c=>c.toLowerCase().trim()===l)||l.charAt(0).toUpperCase()+l.slice(1);s.push(u)}else r.push(l.charAt(0).toUpperCase()+l.slice(1))});const a=t.length,o=a>0?Math.round(s.length/a*100):0;return{matchScore:Math.min(o,100),matchingSkills:s,missingSkills:r}},generateCoverLetter(n,e,t="classic"){return n.geminiApiKey&&n.geminiApiKey.trim()?this.generateRealCoverLetter(n.geminiApiKey,n,e,t):new Promise(i=>{setTimeout(()=>{const{matchingSkills:s}=this.analyzeMatch(n.skills,e.description),r=s.length>0?s.slice(0,3).join(", "):n.skills.slice(0,3).join(", ")||"Webentwicklung";if(t==="creative"){const u=`Hallo Team von ${e.company},

Softwareentwicklung ist für mich leidenschaftliches Handwerk – und Ihre Stellenausschreibung als **${e.title}** hat mich sofort begeistert!

Warum ich zu Ihnen passe? Ganz einfach: Mit meinen Kenntnissen in **${r}** bringe ich frischen Wind und pragmatische Lösungen mit. Ich liebe es, komplexe Herausforderungen in intuitive Benutzeroberflächen zu verwandeln.

Lassen Sie uns im Gespräch herausfinden, wie wir gemeinsam Großartiges erschaffen können!

Viele Grüße,
${n.name||"Max Mustermann"}`;i(u);return}else if(t==="pitch"){const u=`Sehr geehrte Damen und Herren bei ${e.company},

3 Gründe, warum ich Ihr neuer **${e.title}** sein sollte:
1. **Experte in ${r}**: Direkt einsatzbereit von Tag 1 an.
2. **Praxiserfahrung**: ${n.title||"Entwickler"} mit Fokus auf moderne UI & Performance.
3. **Lernbereitschaft**: Schnelle Einarbeitung in Ihren spezifischen Stack.

Ich freue mich auf ein kurzes Erstgespräch!

Beste Grüße,
${n.name||"Max Mustermann"}`;i(u);return}const a=`Sehr geehrtes Team von ${e.company},

`,o=`mit großem Interesse habe ich Ihre Ausschreibung für die Position als **${e.title}** gelesen. Da mein Profil ideal zu den von Ihnen genannten Anforderungen passt, möchte ich mich Ihnen gerne vorstellen.

`;let l=s.length>0?`In meiner bisherigen Laufbahn konnte ich fundierte Erfahrungen in Projekten sammeln, bei denen insbesondere **${r}** im Fokus standen. Die von Ihnen geforderten Kompetenzen bringe ich daher direkt mit.

`:`Als motivierter ${n.title||"Entwickler"} bringe ich eine große Lernbereitschaft und Begeisterung für neue Webtechnologien mit.

`;const d=`Für Fragen stehe ich Ihnen jederzeit gerne zur Verfügung und freue mich über die Einladung zu einem persönlichen Kennenlernen.

Mit freundlichen Grüßen,
${n.name||"Max Mustermann"}`;i(a+o+l+d)},800)})},async generateRealCoverLetter(n,e,t,i="classic"){var b,v,k,m,g,f;const s=e.geminiModel||"gemini-1.5-flash",r=e.geminiTemperature!==void 0?e.geminiTemperature:.7,a=e.geminiCustomInstructions||"",o=`https://generativelanguage.googleapis.com/v1beta/models/${s}:generateContent?key=${n}`;let l=`Du bist ein professioneller Bewerbungs-Schreiber. Verfasse das Anschreiben in der Tonalität: ${i}.`;a&&(l+=`
Beachte zusätzlich folgende Schreibstil-Anweisungen des Benutzers: ${a}`);const u={contents:[{parts:[{text:`Erstelle ein professionelles Bewerbungsanschreiben (${i}-Stil) auf Deutsch für folgende Position:
Stellentitel: ${t.title}
Unternehmen: ${t.company}
Bewerber: ${e.name||"Max Mustermann"} (${e.title||"Entwickler"})
Skills: ${e.skills.join(", ")}`}]}],systemInstruction:{parts:[{text:l}]},generationConfig:{temperature:r}},c=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(u)});if(!c.ok){const x=await c.json();throw new Error(((b=x.error)==null?void 0:b.message)||"Fehler bei der Gemini-API-Anfrage.")}return((f=(g=(m=(k=(v=(await c.json()).candidates)==null?void 0:v[0])==null?void 0:k.content)==null?void 0:m.parts)==null?void 0:g[0])==null?void 0:f.text)||"Fehler beim Laden des Anschreibens."},generateInterviewPrep(n,e){return n.geminiApiKey&&n.geminiApiKey.trim()?this.generateRealInterviewPrep(n.geminiApiKey,n,e):new Promise(t=>{setTimeout(()=>{const{matchingSkills:i,missingSkills:s}=this.analyzeMatch(n.skills,e.description),r=[];if(i.length>0){const a=i[0];r.push({id:1,question:`Sie erwähnen in Ihrem Profil Erfahrungen mit "${a}". Können Sie uns ein konkretes Beispiel für ein Projekt nennen, bei dem Sie diese Technologie erfolgreich eingesetzt haben, und auf welche Herausforderungen Sie dabei gestoßen sind?`,strategy:`Nutze die STAR-Methode (Situation, Task, Action, Result). Erkläre kurz das Projektziel, deine konkrete Rolle, wie du "${a}" genutzt hast und welches positive Endergebnis erzielt wurde.`,sampleAnswer:`Ja, in einem meiner letzten Projekte ging es um die Erstellung eines komplexen User-Dashboards. Dabei habe ich "${a}" intensiv genutzt, um eine responsive und performante Oberfläche zu entwickeln. Eine der größten Herausforderungen war die Optimierung der Ladezeiten. Ich konnte dies lösen, indem ich gezielte Optimierungen vornahm, wodurch die Ladezeit um 25% sank.`})}else r.push({id:1,question:`Warum interessieren Sie sich speziell für die Stelle als ${e.title} bei uns und warum sind Sie die richtige Besetzung, obwohl Sie neu in diesem Bereich einsteigen?`,strategy:`Fokussiere dich auf deine hohe Lernbereitschaft und Motivation. Zeige, dass du dich im Vorfeld intensiv mit ${e.company} auseinandergesetzt hast und die Werte teilst.`,sampleAnswer:`Ich verfolge die Entwicklung von ${e.company} schon länger und bin begeistert von Ihrer Innovationskraft. Als lernwilliger Entwickler reizt mich die Chance, mich in neue Frameworks einzuarbeiten und mein theoretisches Wissen direkt in einem professionellen Umfeld produktiv anzuwenden.`});if(s.length>0){const a=s[0];r.push({id:2,question:`In unserer Stellenausschreibung fordern wir Kenntnisse in "${a}". Wie schätzen Sie Ihre Kenntnisse in diesem Bereich ein und wie würden Sie sich in den ersten Wochen einarbeiten?`,strategy:"Gib offen zu, dass du hier noch Lernbedarf hast, aber verknüpfe es sofort mit einer proaktiven Lösungsstrategie. Nenne verwandte Technologien, die du bereits beherrschst, um zu zeigen, dass dir der Einstieg leicht fallen wird.",sampleAnswer:`Ich habe in der Praxis noch nicht tiefgehend mit "${a}" gearbeitet, besitze aber fundierte Erfahrung in verwandten Bereichen wie ${i[0]||"Webtechnologien"}. Ich habe mir bereits Online-Ressourcen angeschaut und bin zuversichtlich, mich durch mein Verständnis moderner Softwarearchitekturen innerhalb weniger Wochen voll produktiv in "${a}" einzuarbeiten.`})}else r.push({id:2,question:"Wie gehen Sie vor, wenn Sie in einem Projekt auf ein technisches Problem stoßen, für das Sie ad hoc keine Lösung wissen?",strategy:"Hier geht es um deine Problemlösungsfähigkeiten und Teamarbeit. Zeige, dass du strukturiert recherchieren kannst (Dokumentation, StackOverflow), aber auch den Mut hast, im Team nachfragebereit zu sein.",sampleAnswer:"Zuerst analysiere ich das Problem systematisch und isoliere den Fehler. Ich recherchiere in offiziellen Dokumentationen. Wenn ich nach angemessener Zeit keine Lösung finde, bereite ich das Problem strukturiert vor, um einen Kollegen um ein kurzes Pair-Programming-Feedback zu bitten. Das spart dem Projekt Zeit."});r.push({id:3,question:`Wir legen bei ${e.company} großen Wert auf Teamkultur und das Arbeitsmodell (${e.workMode||"Hybrid"}). Wie organisieren Sie sich im Alltag und wie kommunizieren Sie im Team?`,strategy:"Betone deine Selbstorganisation und Zuverlässigkeit, besonders bei Remote- oder Hybridarbeit. Erwähne gängige Tools (Git, Slack, Jira, Zoom) und regelmäßige Check-Ins.",sampleAnswer:`Ich strukturiere meinen Tag mit festen To-Do-Listen und nutze Tools wie Git zur Versionskontrolle. In einem ${e.workMode||"Hybrid"}-Modell ist mir proaktive Kommunikation extrem wichtig – lieber einmal mehr im Chat abstimmen als im Unklaren zu bleiben. Ich schätze regelmäßige Dailies sehr.`}),r.push({id:4,question:"Können Sie eine Situation beschreiben, in der Sie kritisches Feedback zu Ihrer Arbeit erhalten haben, und wie Sie damit umgegangen sind?",strategy:"Zeige professionelle Reife, Kritikfähigkeit und die Fähigkeit, Feedback zur persönlichen Weiterentwicklung zu nutzen. Nenne ein konkretes Beispiel und das positive Resultat der Umsetzung.",sampleAnswer:"In einem Code-Review wurde angemerkt, dass meine Komponenten-Struktur schwer wiederverwendbar war. Anstatt defensiv zu reagieren, habe ich mich mit dem Kollegen zusammengesetzt, um seine Best Practices zu verstehen. Ich habe die Komponenten refaktoriert und mein Verständnis für modularere Softwarearchitektur nachhaltig verbessert."}),r.push({id:5,question:`Wo sehen Sie sich beruflich in den nächsten 3 bis 5 Jahren und wie trägt diese Position als ${e.title} dazu bei?`,strategy:"Verbinde deine persönlichen Wachstumsziele mit dem Erfolg des Unternehmens. Zeige Ambition, aber bleibe realistisch und drücke deine Loyalität aus.",sampleAnswer:`In den nächsten Jahren möchte ich meine Expertise im Bereich Frontend-Architektur vertiefen und ggf. fachliche Verantwortung übernehmen. Die Position bei ${e.company} bietet mir durch die anspruchsvollen Projekte und das moderne Tech-Stack die ideale Umgebung, um mich fachlich weiterzuentwickeln und gleichzeitig einen wertvollen Beitrag zu eurem Wachstum zu leisten.`}),t(r)},1e3)})},async generateRealInterviewPrep(n,e,t){var v,k,m,g,f,x;const i=e.geminiModel||"gemini-1.5-flash",s=e.geminiTemperature!==void 0?e.geminiTemperature:.7,r=e.geminiCustomInstructions||"",a=`https://generativelanguage.googleapis.com/v1beta/models/${i}:generateContent?key=${n}`;let o="Du bist ein professioneller Karriere-Coach. Du analysierst die Anforderungen einer Stelle und die Skills eines Bewerbers und generierst 5 typische Interviewfragen, eine strategische Empfehlung für den Bewerber zur Beantwortung sowie eine beispielhafte exzellente Modellantwort aus Sicht des Bewerbers.";r&&(o+=`
Beachte zusätzlich folgende Schreibstil-Anweisungen des Benutzers: ${r}`);const u={contents:[{parts:[{text:`Analysiere die Anforderungen für folgende Stelle und die Skills des Bewerbers. Erstelle 5 typische Interviewfragen.
Stellentitel: ${t.title}
Unternehmen: ${t.company}
Stellenbeschreibung:
${t.description||"Keine Angabe"}

Bewerber-Details:
Name: ${e.name||"Max Mustermann"}
Skills: ${e.skills.join(", ")}
Erfahrung:
${e.experience||"Keine Angabe"}

Gib das Ergebnis als valides JSON-Array zurück. Jede Frage im Array muss exakt die Attribute "id", "question", "strategy" und "sampleAnswer" aufweisen (alles als Strings).`}]}],systemInstruction:{parts:[{text:o}]},generationConfig:{responseMimeType:"application/json",responseSchema:{type:"ARRAY",items:{type:"OBJECT",properties:{id:{type:"INTEGER"},question:{type:"STRING"},strategy:{type:"STRING"},sampleAnswer:{type:"STRING"}},required:["id","question","strategy","sampleAnswer"]}},temperature:s}},c=await fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(u)});if(!c.ok){const S=await c.json();throw new Error(((v=S.error)==null?void 0:v.message)||"Fehler bei der Gemini-API-Anfrage.")}const b=(x=(f=(g=(m=(k=(await c.json()).candidates)==null?void 0:k[0])==null?void 0:m.content)==null?void 0:g.parts)==null?void 0:f[0])==null?void 0:x.text;if(!b)throw new Error("Keine Antwort erhalten.");return JSON.parse(b)},async parseJobDescription(n,e){if(!e||!e.trim())throw new Error("Bitte geben Sie einen Text ein, der analysiert werden soll.");return n&&n.trim()?this.parseRealJobDescription(n,e):new Promise(t=>{setTimeout(()=>{const i=e.split(`
`).map(g=>g.trim()).filter(g=>g.length>0);let s="Unbekannter Jobtitel",r="Unbekanntes Unternehmen",a=0,o="Deutschland",l="Hybrid",d="";const u=["entwickler","developer","designer","ingenieur","engineer","manager","berater","consultant","architect","spezialist","specialist"];for(const g of i.slice(0,5))if(u.some(f=>g.toLowerCase().includes(f))){s=g;break}const c=["gmbh","ag","co. kg","se","solutions","technologies","group","partner"];for(const g of i)if(c.some(f=>g.toLowerCase().includes(f))){r=g.replace(/(wir suchen|jobs|stelle|karriere|bei)\s*/i,"").trim();break}const p=/(?:gehalt|verdienst|einkommen|salär|jahresgehalt|vergütung)?\s*(?:bis|von|ca\.)?\s*([0-9]{2,3}(?:\.[0-9]{3})?)\s*(?:€|euro|\$)/i,b=e.match(p);if(b)a=parseInt(b[1].replace(".",""),10);else{const g=e.match(/\b(2[5-9][0-9]{3}|[3-9][0-9]{4}|1[0-8][0-9]{4})\b/);g&&(a=parseInt(g[1],10))}/remote|homeoffice|home-office|zuhause|work from home/i.test(e)?l="Remote":/hybrid|flexibel/i.test(e)?l="Hybrid":/vor ort|präsenz|büro/i.test(e)&&(l="Vor Ort");const v=["berlin","münchen","hamburg","köln","frankfurt","stuttgart","düsseldorf","dortmund","essen","bremen","leipzig","dresden","nürnberg","karlsruhe"];for(const g of e.toLowerCase().split(/[^a-zäöüß]/))if(v.includes(g)){o=g.charAt(0).toUpperCase()+g.slice(1);break}const k=/(?:ansprechpartner|kontakt|bewerben an|kontaktperson|recruiter|hr-manager|hr)\s*(?:ist|unter|:)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/,m=e.match(k);m&&(d=m[1]),t({title:s,company:r,salary:a,location:o,workMode:l,description:e.slice(0,1e3)+(e.length>1e3?"...":""),contact:d})},1e3)})},async parseRealJobDescription(n,e){var p,b,v,k,m,g;const s=`https://generativelanguage.googleapis.com/v1beta/models/${y.getProfile().geminiModel||"gemini-1.5-flash"}:generateContent?key=${n}`,l={contents:[{parts:[{text:`Analysiere folgende Stellenbeschreibung und extrahiere die Kerndaten:
---
${e}
---

Gib das Ergebnis als valides JSON-Objekt zurück mit genau diesen Feldern:
- title: Der gefundene Stellentitel (z.B. "Frontend Developer (m/w/d)")
- company: Der Firmenname
- salary: Das angebotene Jahresbruttogehalt als Ganzzahl in Euro (falls eine Gehaltsspanne angegeben ist, nimm den Mittelwert oder das Maximum; falls keins angegeben ist, setze 0)
- location: Der Arbeitsort / Standort
- workMode: Eines aus ["Vor Ort", "Hybrid", "Remote"]
- description: Eine prägnante, übersichtliche Zusammenfassung der Aufgaben und Anforderungen (Stichpunkte, max. 1000 Zeichen)
- contact: Name des Ansprechpartners oder der Ansprechpartnerin (falls ermittelbar, sonst leer)

Gib ausschließlich das JSON-Objekt zurück.`}]}],systemInstruction:{parts:[{text:"Du bist ein intelligenter Daten-Extraktor. Analysiere den bereitgestellten Text einer Stellenanzeige und extrahiere strukturierte Daten auf Deutsch."}]},generationConfig:{responseMimeType:"application/json",responseSchema:{type:"OBJECT",properties:{title:{type:"STRING"},company:{type:"STRING"},salary:{type:"INTEGER"},location:{type:"STRING"},workMode:{type:"STRING"},description:{type:"STRING"},contact:{type:"STRING"}},required:["title","company","salary","location","workMode","description","contact"]},temperature:.1}},d=await fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(l)});if(!d.ok){const f=await d.json();throw new Error(((p=f.error)==null?void 0:p.message)||"Fehler bei der Gemini-API-Anfrage.")}const c=(g=(m=(k=(v=(b=(await d.json()).candidates)==null?void 0:b[0])==null?void 0:v.content)==null?void 0:k.parts)==null?void 0:m[0])==null?void 0:g.text;if(!c)throw new Error("Keine Antwort erhalten.");return JSON.parse(c)},async parseEmailText(n,e){if(!e||!e.trim())throw new Error("Kein E-Mail-Text angegeben.");const t=e.toLowerCase();let i="applied";t.includes("absage")||t.includes("leider")||t.includes("nicht berücksichtigen")?i="rejected":t.includes("einladung")||t.includes("gespräch")||t.includes("interview")||t.includes("termin")?i="interviewing":(t.includes("angebot")||t.includes("zusage")||t.includes("arbeitsvertrag"))&&(i="offer");const s=e.match(/(?:bei|von|firma|unternehmen)\s+([A-Z][A-Za-z0-9\s&.-]+)/i),r=s?s[1].trim().split(/\s+/).slice(0,3).join(" "):"";return{status:i,company:r||"",notes:`E-Mail Import am ${new Date().toLocaleDateString("de-DE")}:
"${e.slice(0,200)}..."`}},async evaluateInterviewAnswer(n,e,t){if(!t||!t.trim())throw new Error("Bitte geben Sie eine Antwort ein, die bewertet werden soll.");return n&&n.trim()?this.evaluateRealInterviewAnswer(n,e,t):new Promise(i=>{setTimeout(()=>{const s=t.trim().split(/\s+/).length;let r=50;s<10?r-=20:s>=10&&s<30?r+=10:s>=30&&s<80?r+=25:r+=30;const a=["projekt","erfahrung","herausforderung","gelöst","team","kunde","kunden","kommunikation","lösung","lernen","struktur","star","situation","ziel","ergebnis"];let o=[];a.forEach(u=>{t.toLowerCase().includes(u)&&(r+=3,o.push(u))}),r=Math.min(Math.max(r,10),100);let l="",d="";r<50?(l="Deine Antwort ist sehr kurz geraten und geht kaum auf die Facetten der Frage ein. Recruiter möchten in der Regel mehr Kontext und Details hören.",d="Versuche, deine Antwort nach der STAR-Methode aufzubauen: Welches Problem lag vor? Was war deine Aufgabe? Was hast du konkret getan? Und was war das messbare Resultat?"):r>=50&&r<75?(l=`Guter Ansatz! Du hast bereits einige wichtige Aspekte genannt (z.B. Wörter wie: ${o.join(", ")||"keine"}). Deine Antwort ist strukturiert, könnte aber noch mit einem konkreteren Beispiel belegt werden.`,d="Untermauere deine Behauptungen mit einem echten Ereignis aus deiner Praxis. Erzähle eine kurze Story, wie du genau vorgegangen bist. Das wirkt authentischer und überzeugender."):(l=`Hervorragende Antwort! Du hast sehr detailliert geantwortet (${s} Wörter) und wichtige Begriffe wie ${o.join(", ")||"Berufserfahrung"} verwendet. Damit vermittelst du Professionalität und Struktur.`,d="Deine Antwort ist bereits sehr stark. Achte beim Vorlesen darauf, ruhig und selbstbewusst zu sprechen. Die Antwort ist perfekt vorbereitet!"),i({score:r,feedback:l,suggestions:d})},1e3)})},async evaluateRealInterviewAnswer(n,e,t){var k,m,g,f,x,S;const i=y.getProfile(),s=i.geminiModel||"gemini-1.5-flash",r=i.geminiTemperature!==void 0?i.geminiTemperature:.7,a=i.geminiCustomInstructions||"",o=`https://generativelanguage.googleapis.com/v1beta/models/${s}:generateContent?key=${n}`;let l="Du bist ein professioneller Karriere-Coach. Bewerte die Antwort des Bewerbers ehrlich, professionell und konstruktiv auf Deutsch.";a&&(l+=`
Beachte zusätzlich folgende Schreibstil-Anweisungen des Benutzers: ${a}`);const c={contents:[{parts:[{text:`Bewerte die folgende Antwort des Bewerbers auf die Interviewfrage:
Frage: ${e}
Antwort des Bewerbers: ${t}

Gib das Ergebnis als valides JSON-Objekt zurück mit genau diesen Feldern:
- score: Eine Zahl von 0 bis 100, die die Qualität der Antwort bewertet
- feedback: Eine ehrliche, konstruktive Analyse der Stärken und Schwächen der Antwort (max. 500 Zeichen)
- suggestions: Konkrete, handlungsorientierte Verbesserungsvorschläge (was gefehlt hat, wie man es besser formuliert, max. 500 Zeichen)

Gib ausschließlich das JSON-Objekt zurück.`}]}],systemInstruction:{parts:[{text:l}]},generationConfig:{responseMimeType:"application/json",responseSchema:{type:"OBJECT",properties:{score:{type:"INTEGER"},feedback:{type:"STRING"},suggestions:{type:"STRING"}},required:["score","feedback","suggestions"]},temperature:r}},p=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)});if(!p.ok){const $=await p.json();throw new Error(((k=$.error)==null?void 0:k.message)||"Fehler bei der Gemini-API-Anfrage.")}const v=(S=(x=(f=(g=(m=(await p.json()).candidates)==null?void 0:m[0])==null?void 0:g.content)==null?void 0:f.parts)==null?void 0:x[0])==null?void 0:S.text;if(!v)throw new Error("Keine Antwort erhalten.");return JSON.parse(v)},generateResumeOptimization(n,e,t){return n.geminiApiKey&&n.geminiApiKey.trim()?this.generateRealResumeOptimization(n.geminiApiKey,n,e,t):new Promise(i=>{setTimeout(()=>{const s=this.extractKeywords(e.description),r=this.extractKeywords(t),a=s.filter(v=>r.includes(v)),o=s.filter(v=>!r.includes(v)),l=s.length;let d=l>0?Math.round(a.length/l*100):50;(!t||!t.trim())&&(d=10);const u=a.map(v=>v.charAt(0).toUpperCase()+v.slice(1)),c=o.map(v=>v.charAt(0).toUpperCase()+v.slice(1)),p=[];if(o.length>0){const v=c[0];p.push({original:"Kenntnisse in der Softwareentwicklung.",improved:`Konzeption und Implementierung robuster Softwarelösungen unter Anwendung von ${v} für strukturierte Arbeitsabläufe.`,why:`Hebt deine Kompetenz in ${v} aktiv hervor und verwendet stärkere Aktionsverben.`})}if(a.length>0){const v=u[0];p.push({original:`Ich habe mit ${v} gearbeitet.`,improved:`Erfolgreiche Integration von ${v} in produktiven Projekten zur Optimierung der Benutzerfreundlichkeit und Ladezeiten.`,why:"Stellt den konkreten geschäftlichen Mehrwert (Ladezeiten, UX) in den Vordergrund."})}else p.push({original:"Erstellung von Frontends und Webseiten.",improved:"Entwicklung hochperformanter, responsiver Benutzeroberflächen unter Einhaltung moderner Accessibility- und Design-Standards.",why:"Verwendet präzisere Fachbegriffe und zeigt Fokus auf Performance und Barrierefreiheit."});p.push({original:"Zusammenarbeit mit Kollegen im Team.",improved:"Agile Zusammenarbeit in interdisziplinären Teams unter Nutzung von Git, Scrum und kollaborativen Design-Tools wie Figma.",why:"Spezifiziert deine agilen Arbeitsmethoden und genutzten Tools."});const b=t&&t.trim()?`Dein Lebenslauf hat bereits eine solide Basis (Match Score: ${d}%). Um für die Stelle als ${e.title} bei ${e.company} maximal attraktiv zu sein, solltest du die fehlenden Schlagworte wie ${c.slice(0,3).join(", ")||"keine"} prominenter in deinen Projekten platzieren. Achte darauf, deine Erfahrungsergebnisse messbar zu beschreiben.`:"Füge deinen Lebenslauf-Text im Eingabebereich ein, um eine detaillierte Keyword-Analyse und maßgeschneiderte Verbesserungsvorschläge für dieses Stellenprofil zu erhalten.";i({score:d,matchingKeywords:u,missingKeywords:c,bulletPoints:p,generalTips:b})},1e3)})},async generateRealResumeOptimization(n,e,t,i){var k,m,g,f,x,S;const s=e.geminiModel||"gemini-1.5-flash",r=e.geminiTemperature!==void 0?e.geminiTemperature:.7,a=e.geminiCustomInstructions||"",o=`https://generativelanguage.googleapis.com/v1beta/models/${s}:generateContent?key=${n}`;let l="Du bist ein professioneller Karriere-Coach und HR-Analyst. Du analysierst den Lebenslauf eines Bewerbers im Vergleich zu einer Stellenausschreibung. Du lieferst detailliertes Feedback, berechnest einen Match-Score und gibst konkrete Vorschläge zur Optimierung von Lebenslauf-Formulierungen.";a&&(l+=`
Beachte zusätzlich folgende Schreibstil-Anweisungen des Benutzers: ${a}`);const c={contents:[{parts:[{text:`Vergleiche den Lebenslauf des Bewerbers mit der Stellenbeschreibung.
Stellentitel: ${t.title}
Unternehmen: ${t.company}
Stellenbeschreibung:
${t.description||"Keine Angabe"}

Lebenslauf des Bewerbers:
${i||"Keine Angabe"}

Gib das Ergebnis als valides JSON-Objekt zurück mit genau diesen Feldern:
- score: Eine Zahl von 0 bis 100, die beschreibt wie gut der Lebenslauf zum Jobprofil passt
- matchingKeywords: Ein Array von Strings mit Keywords/Skills aus der Anzeige, die im Lebenslauf bereits vorhanden sind
- missingKeywords: Ein Array von Strings mit wichtigen Keywords/Skills aus der Anzeige, die im Lebenslauf noch fehlen
- bulletPoints: Ein Array von Objekten. Jedes Objekt beschreibt eine verbesserte Formulierung im Lebenslauf und hat genau diese Felder:
  * original: Eine typische oder die tatsächliche Formulierung des Bewerbers (String)
  * improved: Die optimierte Formulierung, angepasst an die Anzeige (String)
  * why: Erklärung, warum die neue Formulierung besser wirkt (String)
- generalTips: Zusammenfassung von allgemeinen Tipps zur Formatierung, Struktur oder inhaltlichen Schwerpunktlegung speziell für diese Stelle (String, max. 600 Zeichen)

Gib ausschließlich das JSON-Objekt zurück.`}]}],systemInstruction:{parts:[{text:l}]},generationConfig:{responseMimeType:"application/json",responseSchema:{type:"OBJECT",properties:{score:{type:"INTEGER"},matchingKeywords:{type:"ARRAY",items:{type:"STRING"}},missingKeywords:{type:"ARRAY",items:{type:"STRING"}},bulletPoints:{type:"ARRAY",items:{type:"OBJECT",properties:{original:{type:"STRING"},improved:{type:"STRING"},why:{type:"STRING"}},required:["original","improved","why"]}},generalTips:{type:"STRING"}},required:["score","matchingKeywords","missingKeywords","bulletPoints","generalTips"]},temperature:r}},p=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)});if(!p.ok){const $=await p.json();throw new Error(((k=$.error)==null?void 0:k.message)||"Fehler bei der Gemini-API-Anfrage.")}const v=(S=(x=(f=(g=(m=(await p.json()).candidates)==null?void 0:m[0])==null?void 0:g.content)==null?void 0:f.parts)==null?void 0:x[0])==null?void 0:S.text;if(!v)throw new Error("Keine Antwort erhalten.");return JSON.parse(v)},generateEmail(n,e,t,i){return n.geminiApiKey&&n.geminiApiKey.trim()?this.generateRealEmail(n.geminiApiKey,n,e,t,i):new Promise(s=>{setTimeout(()=>{e.contact;const r=n.name||"Alex Neumann",a=e.title,o=e.company;let l="";if(t==="status")i==="formal"?l=`Sehr geehrte(r) Frau/Herr ${e.contact||"Ansprechpartner"},

ich hoffe, es geht Ihnen gut.

ich möchte mich auf diesem Weg kurz nach dem aktuellen Stand meiner Bewerbung für die Position als **${a}** (Referenz: ${e.id}) erkundigen. 

Nach wie vor reizt mich die Aussicht, meine Erfahrungen in Ihr Team bei **${o}** einzubringen, sehr. Über ein kurzes Update zum Prozessverlauf würde ich mich daher außerordentlich freuen.

Für eventuell noch ausstehende Fragen stehe ich Ihnen selbstverständlich jederzeit zur Verfügung.

Mit freundlichen Grüßen,
${r}`:l=`Hallo ${e.contact?e.contact.split(" ")[0]:"Team"},

ich hoffe, bei euch läuft alles super!

ich wollte mal ganz unkompliziert nachfragen, wie es aktuell bei der Bewerbung als **${a}** aussieht. 

Ich habe weiterhin große Lust darauf, euch bei **${o}** zu unterstützen und an euren Projekten mitzuwirken. Lasst mich einfach wissen, wenn ihr noch weitere Infos von mir braucht oder wie die nächsten Schritte aussehen.

Viele Grüße,
${r}`;else if(t==="thankyou")i==="formal"?l=`Sehr geehrte(r) Frau/Herr ${e.contact||"Ansprechpartner"},

ich möchte mich herzlich für das informative und angenehme Gespräch am gestrigen Tag bedanken. 

Die detaillierten Einblicke in die Aufgaben der Position als **${a}** und die zukünftigen Projekte von **${o}** haben meinen Wunsch, Teil Ihres Teams zu werden, nochmals bestärkt. Besonders unsere Diskussion über Ihre technologische Ausrichtung fand ich sehr spannend.

Ich freue mich darauf, wieder von Ihnen zu hören und verbleibe

mit freundlichen Grüßen,
${r}`:l=`Hallo ${e.contact?e.contact.split(" ")[0]:"zusammen"},

vielen Dank für das tolle und lockere Gespräch gestern! 

Es hat mir super viel Spaß gemacht, mehr über die Rolle als **${a}** und eure Pläne bei **${o}** zu erfahren. Der Austausch hat mich auf jeden Fall noch motivierter gemacht, bei euch einzusteigen und loszulegen.

Ich freue mich auf euer Feedback!

Viele Grüße,
${r}`;else if(t==="negotiate"){const d=e.salary?`${e.salary.toLocaleString("de-DE")} €`:"das besprochene Gehalt";i==="formal"?l=`Sehr geehrte(r) Frau/Herr ${e.contact||"Ansprechpartner"},

ich bedanke mich herzlich für das attraktive Angebot und Ihr Vertrauen in meine Fähigkeiten. Ich freue mich sehr über die Möglichkeit, als **${a}** bei **${o}** zu starten.

Nach Durchsicht des Vertragsentwurfs hätte ich noch ein Anliegen bezüglich der Rahmenbedingungen. Angesichts meiner Qualifikationen und der besprochenen Anforderungen würde ich gerne fragen, ob beim Gehalt ein Spielraum in Richtung 8-10% über den angebotenen ${d} besteht oder ob wir dies durch zusätzliche Benefits (wie z. B. Übernahme des Jobtickets oder Weiterbildungsbudgets) ausgleichen können.

Ich bin überzeugt, dass wir hier eine für beide Seiten hervorragende Lösung finden können und freue mich auf Ihre Rückmeldung.

Mit freundlichen Grüßen,
${r}`:l=`Hallo ${e.contact?e.contact.split(" ")[0]:"Team"},

vielen Dank für das Vertragsangebot! Ich freue mich riesig über eure Zusage und darauf, bald als **${a}** bei **${o}** durchzustarten.

Ich habe mir den Entwurf durchgeschaut und würde gerne noch einen Punkt ansprechen: Passt das Gehalt noch etwas ins Budget? Da wir über recht viel Verantwortung gesprochen haben, fände ich ein Grundgehalt, das etwa 5-10% über den vorgeschlagenen ${d} liegt, passender. Alternativ können wir auch gerne über zusätzliche Benefits wie extra Urlaubstage oder Fortbildungsbudgets sprechen.

Was meint ihr dazu? Ich bin sicher, wir finden da einen guten gemeinsamen Nenner.

Viele Grüße,
${r}`}else t==="decline"?i==="formal"?l=`Sehr geehrte(r) Frau/Herr ${e.contact||"Ansprechpartner"},

vielen Dank für das mir entgegengebrachte Vertrauen und das Vertragsangebot für die Stelle als **${a}**.

Nach reiflicher Überlegung habe ich mich jedoch dazu entschieden, ein anderes Angebot anzunehmen, das noch etwas besser zu meiner aktuellen Spezialisierung passt. Diese Entscheidung ist mir nicht leichtgefallen, da ich einen sehr positiven Eindruck von **${o}** gewonnen habe.

Ich bedanke mich herzlich für die angenehmen Gespräche und wünsche Ihnen und Ihrem Team weiterhin viel Erfolg bei der Suche.

Mit freundlichen Grüßen,
${r}`:l=`Hallo ${e.contact?e.contact.split(" ")[0]:"Team"},

vielen Dank für das Angebot und das Vertrauen in mich! 

Ich habe mir alles gründlich durch den Kopf gehen lassen, mich aber letztendlich für ein anderes Angebot entschieden, das thematisch noch einen Tick besser zu meinen aktuellen Plänen passt. Die Entscheidung war echt schwer, weil ich euer Team und die Atmosphäre bei **${o}** super sympathisch fand.

Vielen Dank noch mal für die coolen Gespräche und viel Erfolg weiterhin für euch!

Viele Grüße,
${r}`:t==="withdraw"&&(i==="formal"?l=`Sehr geehrte(r) Frau/Herr ${e.contact||"Ansprechpartner"},

hiermit möchte ich meine Bewerbung für die Position als **${a}** bei **${o}** zurückziehen.

Da ich mich beruflich anderweitig vertraglich gebunden habe, stehe ich für das weitere Auswahlverfahren leider nicht mehr zur Verfügung. Ich bedanke mich herzlich für die Prüfung meiner Unterlagen und den freundlichen Kontakt.

Für die Zukunft wünsche ich Ihrem Unternehmen alles Gute und viel Erfolg.

Mit freundlichen Grüßen,
${r}`:l=`Hallo ${e.contact?e.contact.split(" ")[0]:"Team"},

ich wollte euch kurz Bescheid geben, dass ich meine Bewerbung für die Stelle als **${a}** leider zurückziehen muss.

Ich habe ein anderes Angebot unterschrieben und bin daher nicht mehr auf der Suche. Vielen Dank für eure Zeit, das Anschauen meiner Unterlagen und den netten Austausch!

Wünsche euch alles Gute und weiterhin viel Erfolg!

Viele Grüße,
${r}`);s(l)},1e3)})},async generateRealEmail(n,e,t,i,s){var m,g,f,x,S,$;const r=e.geminiModel||"gemini-1.5-flash",a=e.geminiTemperature!==void 0?e.geminiTemperature:.7,o=e.geminiCustomInstructions||"",l=`https://generativelanguage.googleapis.com/v1beta/models/${r}:generateContent?key=${n}`;let d="Du bist ein professioneller Bewerbungscoach und Entwurfs-Schreiber. Du verfasst fehlerfreie, moderne und überzeugende E-Mails für den Bewerbungsprozess auf Deutsch.";o&&(d+=`
Beachte zusätzlich folgende Schreibstil-Anweisungen des Benutzers: ${o}`);const p={contents:[{parts:[{text:`Verfasse eine E-Mail auf Deutsch mit folgendem Zweck: ${i==="status"?"eine freundliche Nachfrage nach dem Bewerbungsstand":i==="thankyou"?"eine herzliche Danksagung nach dem Bewerbungsgespräch":i==="negotiate"?"eine professionelle Nachverhandlung des Gehalts bzw. von Arbeitsbedingungen":i==="decline"?"eine höfliche und wertschätzende Absage an das Unternehmen":"das Zurückziehen der Bewerbung aufgrund einer anderen Vertragsunterzeichnung"}.
Stellentitel: ${t.title}
Unternehmen: ${t.company}
Ansprechpartner: ${t.contact||"Personalabteilung"}

Bewerber-Details:
Name: ${e.name||"Bewerber"}
Skills: ${e.skills.join(", ")}

Tonalität: Die E-Mail soll ${s==="casual"?'locker und kollegial per "Du"':'formell und höflich per "Sie"'} verfasst werden.
Das Gehalt in der Anzeige ist mit ${t.salary?t.salary+" €/Jahr":"unbekannt"} angegeben (nur verwenden, falls relevant für Verhandlungen).

Gib ausschließlich den Text der E-Mail ohne Betreffzeile, Markdowns oder sonstige Erklärungen zurück.`}]}],systemInstruction:{parts:[{text:d}]},generationConfig:{temperature:a}},b=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});if(!b.ok){const L=await b.json();throw new Error(((m=L.error)==null?void 0:m.message)||"Fehler bei der Gemini-API-Anfrage.")}const k=($=(S=(x=(f=(g=(await b.json()).candidates)==null?void 0:g[0])==null?void 0:f.content)==null?void 0:x.parts)==null?void 0:S[0])==null?void 0:$.text;if(!k)throw new Error("Keine Antwort erhalten.");return k},async parseCVText(n,e){if(!e||!e.trim())throw new Error("Lebenslauf-Text ist leer.");return n&&n.trim()?this.parseRealCVText(n,e):new Promise(t=>{setTimeout(()=>{const i=e.split(`
`).map(d=>d.trim()).filter(d=>d.length>0);let s="Alex Neumann",r="Software Entwickler";i.length>0&&(s=i[0]),i.length>1&&(r=i[1]);const o=this.extractKeywords(e).map(d=>d.charAt(0).toUpperCase()+d.slice(1)),l=i.slice(2,8).map(d=>"- "+d).join(`
`);t({name:s,title:r,skills:o,experience:l})},1e3)})},async parseRealCVText(n,e){var p,b,v,k,m,g;const s=`https://generativelanguage.googleapis.com/v1beta/models/${y.getProfile().geminiModel||"gemini-1.5-flash"}:generateContent?key=${n}`,l={contents:[{parts:[{text:`Analysiere den folgenden Lebenslauf-Text und extrahiere die Kerndaten des Bewerbers:
---
${e}
---

Gib das Ergebnis als valides JSON-Objekt zurück mit genau diesen Feldern:
- name: Der vollständige Name der Person
- title: Die aktuelle Berufsbezeichnung / der Hauptfokus (z. B. "Frontend Entwickler" oder "UI/UX Designer")
- skills: Ein flaches Array von Strings mit den wichtigsten fachlichen Skills und Technologien (z. B. ["React", "JavaScript", "Figma", "CSS"])
- experience: Eine stichpunktartige Zusammenfassung der Berufserfahrung / des Werdegangs (als Liste mit Bindestrichen, max. 1000 Zeichen)

Gib ausschließlich das JSON-Objekt zurück.`}]}],systemInstruction:{parts:[{text:"Du bist ein intelligenter Lebenslauf-Extraktor. Analysiere den bereitgestellten Text eines Lebenslaufs und extrahiere strukturierte Profildaten auf Deutsch."}]},generationConfig:{responseMimeType:"application/json",responseSchema:{type:"OBJECT",properties:{name:{type:"STRING"},title:{type:"STRING"},skills:{type:"ARRAY",items:{type:"STRING"}},experience:{type:"STRING"}},required:["name","title","skills","experience"]},temperature:.1}},d=await fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(l)});if(!d.ok){const f=await d.json();throw new Error(((p=f.error)==null?void 0:p.message)||"Fehler bei der Gemini-API-Anfrage.")}const c=(g=(m=(k=(v=(b=(await d.json()).candidates)==null?void 0:b[0])==null?void 0:v.content)==null?void 0:k.parts)==null?void 0:m[0])==null?void 0:g.text;if(!c)throw new Error("Keine Antwort erhalten.");return JSON.parse(c)},async negotiateSalary(n,e,t,i,s,r,a,o){return n&&n.trim()?this.negotiateRealSalary(n,e,t,i,s,r,a,o):new Promise(l=>{setTimeout(()=>{const d=Math.floor(a.length/2)+1;let u="",c=!1,p=null,b=null,v=null;if(d===1){const k=Math.round(s*.9);u=`Hallo! Schön, dass wir über die Konditionen sprechen. Für die Position als ${e} bei ${t} haben wir ein Budget geplant. Ihre Vorstellung liegt etwas über unserem Rahmen. Wir könnten Ihnen zum Einstieg ein Grundgehalt von ${k.toLocaleString("de-DE")} € anbieten. Was sagen Sie dazu?`}else d===2?u=`Ich verstehe Ihre Argumente bezüglich Ihrer Erfahrung. Allerdings müssen wir auch die interne Gehaltsstruktur berücksichtigen. Ich habe mit der Fachabteilung Rücksprache gehalten: Wir könnten uns auf ${Math.round(s*.97).toLocaleString("de-DE")} € sowie zusätzliche Benefits (z. B. ÖPNV-Ticket oder Weiterbildungsbudget) einigen. Liegt das in Ihrem Bereich?`:(c=!0,p=Math.round((parseFloat(i)+parseFloat(s))/2),b=80,v="Gute Argumentation über persönliche Qualifikationen. Etwas mehr Flexibilität bei Zusatzleistungen hätte die Verhandlung beschleunigen können.",u=`Das ist unser absolutes Limit: Wir bieten Ihnen ${p.toLocaleString("de-DE")} € als fixes Jahresbruttogehalt. Mehr lässt unser Budgetrahmen für diese Position leider nicht zu. Wir würden uns sehr freuen, Sie an Bord zu haben!`);l({text:u,endNegotiation:c,finalSalary:p,rating:b,feedback:v})},1e3)})},async negotiateRealSalary(n,e,t,i,s,r,a,o){var m,g,f,x,S,$;const l=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${n}`,d=a.map(L=>`${L.sender==="user"?"Kandidat":"Recruiter"}: "${L.text}"`).join(`
`),u=Math.floor(a.length/2)+1,p={contents:[{parts:[{text:`Du bist ein professioneller Personalvermittler (Recruiter) und verhandelst das Gehalt für die Stelle als "${e}" bei der Firma "${t}".
Der Wunschgehalt des Kandidaten ist ${i} € und die absolute Schmerzgrenze des Kandidaten ist ${s} €.
Deine Verhandlungspersönlichkeit ist "${r==="tough"?"Hart aber fair (Hinterfragt Argumente stark, fordert Belege)":r==="friendly"?"Freundlich & kompromissbereit (Gibt schneller nach, bietet Zusatzleistungen an)":"Strikte Budgetgrenze (Sehr preisbewusst, betont Budgetlimits)"}".

Aktuelle Verhandlungsrunde: ${u} von 3.
Bisheriger Verlauf:
${d}

Der Kandidat sagt jetzt: "${o}"

Verhalte dich entsprechend deiner Rolle und antworte auf Deutsch.
Generiere eine JSON-Antwort im folgenden Format:
{
  "text": "Deine direkte wörtliche Rede als Recruiter...",
  "endNegotiation": false,
  "finalSalary": null,
  "rating": null,
  "feedback": null
}

WICHTIG:
Wenn das die 3. Runde ist (d.h. der Kandidat hat jetzt zum 3. Mal geantwortet), MUSS die Verhandlung beendet werden ("endNegotiation": true).
Entscheide dich für ein faires Gehaltsangebot (eine Zahl zwischen ${s} und ${i}) basierend auf der Argumentationsstärke des Kandidaten.
Setze in diesem Fall:
- "endNegotiation": true
- "finalSalary": das vereinbarte Jahresbruttogehalt als Zahl (z. B. 62500)
- "rating": Bewertung der Verhandlungsgeschicklichkeit des Kandidaten von 0 bis 100
- "feedback": 2-3 Sätze konstruktives Feedback dazu, wie geschickt der Kandidat verhandelt hat.`}]}],generationConfig:{responseMimeType:"application/json"}},b=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});if(!b.ok){const L=await b.json();throw new Error(((m=L.error)==null?void 0:m.message)||"Fehler bei der Gemini-API-Anfrage.")}const k=($=(S=(x=(f=(g=(await b.json()).candidates)==null?void 0:g[0])==null?void 0:f.content)==null?void 0:x.parts)==null?void 0:S[0])==null?void 0:$.text;if(!k)throw new Error("Keine Antwort erhalten.");return JSON.parse(k)},async generateCompanyResearch(n,e){return new Promise(t=>{setTimeout(()=>{t({company:n,overview:`${n} ist ein führender Anbieter im Bereich moderner Softwarelösungen und digitaler Produkte. Das Unternehmen zeichnet sich durch agile Teams und eine innovative Kultur aus.`,keyFacts:["Fokus auf moderne Web-Technologien und User-Experience","Flache Hierarchien und transparente Kommunikation","Hoher Anspruch an Code-Qualität und kontinuierliche Weiterbildung"],suggestedQuestions:[`Wie sieht ein typischer Sprint-Cycle im Team für die Rolle als ${e} aus?`,"Auf welche Herausforderung konzentriert sich die Abteilung in den nächsten 6 Monaten?",`Welche Entwicklungs- und Weiterbildungsmöglichkeiten bietet ${n}?`]})},800)})},parseEmailStatusUpdate(n){if(!n)return null;const e=n.toLowerCase();let t="applied",i="Eingegangen / Unterlagen gesendet",s="mittel";return e.includes("einladung")||e.includes("gespräch")||e.includes("interview")||e.includes("termin")?(t="interviewing",i="Einladung zum Vorstellungsgespräch",s="hoch"):e.includes("angebot")||e.includes("zusage")||e.includes("freuen uns sehr Ihnen")||e.includes("vertrag")?(t="offer",i="Angebot erhalten / Zusage",s="hoch"):(e.includes("absage")||e.includes("leider")||e.includes("nicht berücksichtigen")||e.includes("anderweitig entschieden"))&&(t="rejected",i="Absage erhalten",s="hoch"),{detectedStatus:t,statusLabel:i,confidence:s,summary:n.slice(0,180)+"..."}}},De="jobmatch_db",Le=1,M="documents";function X(){return new Promise((n,e)=>{const t=indexedDB.open(De,Le);t.onupgradeneeded=i=>{const s=i.target.result;s.objectStoreNames.contains(M)||s.createObjectStore(M,{keyPath:"fileId"})},t.onsuccess=i=>n(i.target.result),t.onerror=i=>e(i.target.error)})}const q={async saveFile(n,e,t,i){const s=await X();return new Promise((r,a)=>{const d=s.transaction(M,"readwrite").objectStore(M).put({fileId:n,jobId:e,filename:t,fileBlob:i});d.onsuccess=()=>r(),d.onerror=()=>a(d.error)})},async getFile(n){const e=await X();return new Promise((t,i)=>{const a=e.transaction(M,"readonly").objectStore(M).get(n);a.onsuccess=()=>t(a.result),a.onerror=()=>i(a.error)})},async deleteFile(n){const e=await X();return new Promise((t,i)=>{const a=e.transaction(M,"readwrite").objectStore(M).delete(n);a.onsuccess=()=>t(),a.onerror=()=>i(a.error)})}};function Me(n,e={}){if(!n||n<=0)return{netYearly:0,netMonthly:0,socialSecurityMonthly:0,taxMonthly:0};const t=parseInt(e.taxClass||"1",10),i=parseInt(e.churchTax||"0",10)/100,s=!!e.hasChildren,r=n/12,a=5175,o=7450,l={health:.081,care:s?.017:.022,pension:.046,unemp:.013},d=Math.min(r,a),u=Math.min(r,o),c=d*(l.health+l.care)+u*(l.pension+l.unemp),p=1266,b=c*12*.96,v=Math.max(0,n-b-p);let k=11784;t===2?k=16044:t===3?k=23568:(t===5||t===6)&&(k=0);let m=0;const g=k/11784;if(g===0)m=v*(t===6?.35:.28);else{const L=11784*g,P=17e3*g,V=66e3*g;if(v<=L)m=0;else if(v<=P){const C=(v-L)/(1e4*g);m=(922.3*C+1400)*C*g}else if(v<=V){const C=(v-P)/(1e4*g);m=((181.76*C+2400)*C+820)*g}else v<=277825?m=.42*v-10600*g:m=.45*v-18900*g}let f=0;m>18130&&(f=m*.055);const x=m*i,S=c*12+m+f+x,$=Math.max(0,n-S);return{netYearly:Math.round($),netMonthly:Math.round($/12),socialSecurityMonthly:Math.round(c),taxMonthly:Math.round((m+f+x)/12)}}function Ce(n,e,t,i=""){const s=new Date(t);s.setUTCHours(9,0,0);const r=s.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z",o=new Date(s.getTime()+60*60*1e3).toISOString().replace(/[-:]/g,"").split(".")[0]+"Z",l=i.replace(/\r?\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;"),u=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//JobMatch//DE","CALSCALE:GREGORIAN","BEGIN:VEVENT",`SUMMARY:${`Frist: ${n} (${e})`.replace(/,/g,"\\,").replace(/;/g,"\\;")}`,`DTSTART:${r}`,`DTEND:${o}`,`DESCRIPTION:${l}`,"STATUS:CONFIRMED","END:VEVENT","END:VCALENDAR"].join(`\r
`),c=new Blob([u],{type:"text/calendar;charset=utf-8"}),p=document.createElement("a");p.href=URL.createObjectURL(c),p.download=`deadline_${e.toLowerCase().replace(/[^a-z0-9]/g,"_")}.ics`,p.click(),URL.revokeObjectURL(p.href)}function Pe(n,e,t,i=""){const s=new Date(t);s.setUTCHours(9,0,0);const r=s.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z",o=new Date(s.getTime()+60*60*1e3).toISOString().replace(/[-:]/g,"").split(".")[0]+"Z",l=encodeURIComponent(`Bewerbung: ${n} (${e})`),d=encodeURIComponent(i),u=`${r}/${o}`;return`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${l}&dates=${u}&details=${d}`}function Re(n,e,t,i=""){const s=new Date(t);s.setUTCHours(9,0,0);const r=s.toISOString(),o=new Date(s.getTime()+60*60*1e3).toISOString(),l=encodeURIComponent(`Bewerbung: ${n} (${e})`),d=encodeURIComponent(i);return`https://outlook.live.com/calendar/0/deeplink/compose?subject=${l}&startdt=${encodeURIComponent(r)}&enddt=${encodeURIComponent(o)}&body=${d}`}function Fe(n=[]){const e=[];if(n.forEach(r=>{if(r.deadline){const a=new Date(r.deadline);a.setUTCHours(9,0,0);const o=a.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z",d=new Date(a.getTime()+60*60*1e3).toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";e.push(["BEGIN:VEVENT",`SUMMARY:Frist: ${r.title} (${r.company})`,`DTSTART:${o}`,`DTEND:${d}`,`DESCRIPTION:Bewerbungsfrist für ${r.title} bei ${r.company}`,"STATUS:CONFIRMED","END:VEVENT"].join(`\r
`))}r.interviews&&Array.isArray(r.interviews)&&r.interviews.forEach(a=>{if(a.date){const o=new Date(a.date);o.setUTCHours(10,0,0);const l=o.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z",u=new Date(o.getTime()+60*60*1e3).toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";e.push(["BEGIN:VEVENT",`SUMMARY:Vorstellungsgespräch: ${r.title} (${r.company})`,`DTSTART:${l}`,`DTEND:${u}`,`DESCRIPTION:Interview-Termin mit ${r.company}. Notizen: ${a.notes||"Keine"}`,"STATUS:CONFIRMED","END:VEVENT"].join(`\r
`))}})}),e.length===0){alert("Keine Fristen oder Termine vorhanden zum Exportieren.");return}const t=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//JobMatch Bundle//DE","CALSCALE:GREGORIAN",...e,"END:VCALENDAR"].join(`\r
`),i=new Blob([t],{type:"text/calendar;charset=utf-8"}),s=document.createElement("a");s.href=URL.createObjectURL(i),s.download="jobmatch_all_deadlines.ics",s.click(),URL.revokeObjectURL(s.href)}const Ge={chartInstance:null,salaryChartInstance:null,activityTrendChartInstance:null,render(n){const e=document.getElementById(n),t=y.getJobs(),i=y.getProfile(),s=y.getWeights();if(t.length===0){this.renderEmptyState(e);return}const r=t.length;t.filter(h=>h.status==="saved").length;const a=t.filter(h=>h.status==="applied"||h.status==="interviewing"||h.status==="offer").length,o=t.filter(h=>h.status==="interviewing").length,l=t.filter(h=>h.status==="offer").length;let d=0;t.forEach(h=>{h.expenses&&Array.isArray(h.expenses)&&h.expenses.forEach(w=>{d+=parseFloat(w.amount)||0})});const u=d.toLocaleString("de-DE",{style:"currency",currency:"EUR"}),c=r,p=t.filter(h=>["applied","interviewing","offer"].includes(h.status)).length,b=t.filter(h=>["interviewing","offer"].includes(h.status)).length,v=t.filter(h=>["offer"].includes(h.status)).length,k=Math.round(p/(c||1)*100),m=Math.round(b/(c||1)*100),g=Math.round(v/(c||1)*100),f=p>0?Math.round(b/p*100):0,x=b>0?Math.round(v/b*100):0;let S=0,$=0,L=0,P=0;t.forEach(h=>{const w=h.history||[],E=w.find(D=>D.status==="saved"),I=w.find(D=>D.status==="applied"),T=w.find(D=>D.status==="interviewing");if(E&&I){const D=Math.abs(new Date(I.timestamp)-new Date(E.timestamp));S+=Math.ceil(D/(1e3*60*60*24)),$++}if(I&&T){const D=Math.abs(new Date(T.timestamp)-new Date(I.timestamp));L+=Math.ceil(D/(1e3*60*60*24)),P++}});const V=$>0?Math.round(S/$):0,C=P>0?Math.round(L/P):0,ne=[...t.map(h=>{const w=A.analyzeMatch(i.skills,h.description),E=h.ratings||{salary:5,commute:5,remote:5,culture:5,tech:5},I=s.salary+s.commute+s.remote+s.culture+s.tech,T=E.salary*s.salary+E.commute*s.commute+E.remote*s.remote+E.culture*s.culture+E.tech*s.tech,D=Math.round(T/(I*10)*100);return{...h,compareScore:D,skillScore:w.matchScore}})].sort((h,w)=>w.compareScore-h.compareScore).slice(0,3),ie=t.filter(h=>h.deadline&&h.status!=="rejected"&&h.status!=="offer").map(h=>{const w=new Date(h.deadline);return{id:h.id,title:h.title,company:h.company,deadline:h.deadline,day:w.getDate(),month:w.toLocaleString("de-DE",{month:"short"}),rawDate:w}}).sort((h,w)=>h.rawDate-w.rawDate).slice(0,4),H=new Date,se=new Date(H);se.setHours(23,59,59,999);const re=H.getDay(),xe=re===0?6:re-1,J=new Date(H);J.setHours(0,0,0,0),J.setDate(H.getDate()-(12*7+xe));const N={};t.forEach(h=>{if(h.createdAt){const E=new Date(h.createdAt).toISOString().slice(0,10);N[E]=(N[E]||0)+1}h.history&&Array.isArray(h.history)&&h.history.forEach(w=>{if(w.timestamp){const I=new Date(w.timestamp).toISOString().slice(0,10);N[I]=(N[I]||0)+1}})});let ae="";const K=new Date(J),oe=Array(13).fill("");let le="";const j=new Date(J);for(let h=0;h<13;h++){const w=j.toLocaleString("de-DE",{month:"short"});w!==le&&(oe[h]=w,le=w),j.setDate(j.getDate()+7)}for(;K<=se;){const h=K.toISOString().slice(0,10),w=N[h]||0;let E=0;w===1?E=1:w===2?E=2:w===3?E=3:w>=4&&(E=4);const I=K.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"}),T=`${w} ${w===1?"Aktivität":"Aktivitäten"} am ${I}`;ae+=`
                <div class="heatmap-cell level-${E}" 
                     data-date="${h}" 
                     data-count="${w}"
                     title="${T}"
                     style="width: 12px; height: 12px; border-radius: 2px; transition: background-color var(--transition-fast);">
                </div>
            `,K.setDate(K.getDate()+1)}const R=i.weeklyGoal||3,U=new Date;U.setDate(U.getDate()-7);let F=0;t.forEach(h=>{let w=null;if(h.history&&Array.isArray(h.history)){const E=h.history.filter(I=>I.status==="applied");E.length>0&&(w=new Date(E[E.length-1].timestamp))}!w&&h.status==="applied"&&h.createdAt&&(w=new Date(h.createdAt)),w&&w>=U&&F++});const ke=Math.min(Math.round(F/R*100),100),Se=F>=R,W=36,_=2*Math.PI*W,Ee=_-ke/100*_;e.innerHTML=`
            <div class="dashboard-grid">
                <!-- Stat Cards -->
                <div class="stats-row">
                    <div class="glass-card stat-card">
                        <div class="stat-icon primary">
                            <i data-lucide="briefcase"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-val">${r}</span>
                            <span class="stat-label">Gesamtanzahl</span>
                        </div>
                    </div>
                    <div class="glass-card stat-card">
                        <div class="stat-icon warning">
                            <i data-lucide="send"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-val">${a}</span>
                            <span class="stat-label">Bewerbungen offen</span>
                        </div>
                    </div>
                    <div class="glass-card stat-card">
                        <div class="stat-icon success">
                            <i data-lucide="award"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-val">${l}</span>
                            <span class="stat-label">Angebote erhalten</span>
                        </div>
                    </div>
                     <div class="glass-card stat-card">
                         <div class="stat-icon danger">
                             <i data-lucide="calendar"></i>
                         </div>
                         <div class="stat-info">
                             <span class="stat-val">${o}</span>
                             <span class="stat-label">Einladungen / Gespräch</span>
                         </div>
                     </div>
                     <div class="glass-card stat-card">
                         <div class="stat-icon success" style="background: rgba(16, 185, 129, 0.15); color: var(--success);">
                             <i data-lucide="euro"></i>
                         </div>
                         <div class="stat-info">
                             <span class="stat-val">${u}</span>
                             <span class="stat-label">Bewerbungs-Kosten</span>
                         </div>
                     </div>
                     <div class="glass-card stat-card" style="border-color: rgba(99, 102, 241, 0.3); background: rgba(99, 102, 241, 0.04);" title="Marktgehalt geschätzt für ${i.title||"Entwickler"}">
                         <div class="stat-icon primary" style="background: rgba(99, 102, 241, 0.2); color: var(--primary);">
                             <i data-lucide="trending-up"></i>
                         </div>
                         <div class="stat-info">
                             <span class="stat-val" style="font-size: 1.15rem;">ca. 68.000 €</span>
                             <span class="stat-label">Marktgehalt Benchmark</span>
                         </div>
                     </div>
                 </div>

                <!-- Split Charts Row (Doughnut Chart + Funnel Widget) -->
                <div class="dashboard-charts-row" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 32px;">
                    <!-- Left: Doughnut Chart -->
                    <div class="glass-card chart-card" style="padding: 24px;">
                        <div class="chart-header" style="margin-bottom: 24px;">
                            <h3>Status-Verteilung deiner Bewerbungen</h3>
                        </div>
                        <div class="chart-container" style="height: 280px; position: relative;">
                            <canvas id="statusChart"></canvas>
                        </div>
                    </div>

                    <!-- Right: Funnel Widget -->
                    <div class="glass-card funnel-card" style="padding: 24px; display: flex; flex-direction: column;">
                        <div class="chart-header" style="margin-bottom: 20px;">
                            <h3>Bewerbungs-Pipeline &amp; Conversion-Raten</h3>
                        </div>
                        <div class="funnel-container" style="display: flex; flex-direction: column; gap: 14px; flex-grow: 1; justify-content: center;">
                            <!-- Funnel Step 1: Saved -->
                            <div class="funnel-step">
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; font-weight: 600;">
                                    <span>1. Gespeichert (Interessant)</span>
                                    <span>${c} Jobs</span>
                                </div>
                                <div style="background: rgba(255, 255, 255, 0.05); height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: var(--text-secondary); width: 100%; height: 100%; border-radius: 4px;"></div>
                                </div>
                            </div>
                            
                            <!-- Funnel Step 2: Applied -->
                            <div class="funnel-step">
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; font-weight: 600;">
                                    <span>2. Beworben</span>
                                    <span>${p} (${k}%)</span>
                                </div>
                                <div style="background: rgba(255, 255, 255, 0.05); height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: var(--primary); width: ${k}%; height: 100%; border-radius: 4px;"></div>
                                </div>
                            </div>

                            <!-- Funnel Step 3: Interview -->
                            <div class="funnel-step">
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; font-weight: 600;">
                                    <span>3. Vorstellungsgespräch</span>
                                    <span>${b} (${m}%)</span>
                                </div>
                                <div style="background: rgba(255, 255, 255, 0.05); height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: var(--secondary); width: ${m}%; height: 100%; border-radius: 4px;"></div>
                                </div>
                            </div>

                            <!-- Funnel Step 4: Offer -->
                            <div class="funnel-step">
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; font-weight: 600;">
                                    <span>4. Zusage / Angebot</span>
                                    <span>${v} (${g}%)</span>
                                </div>
                                <div style="background: rgba(255, 255, 255, 0.05); height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: var(--success); width: ${g}%; height: 100%; border-radius: 4px;"></div>
                                </div>
                            </div>

                            <!-- Conversion Rates badges -->
                            <div class="funnel-conversion-badges" style="display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap;">
                                <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); padding: 8px 10px; border-radius: 6px; flex: 1; min-width: 110px; text-align: center;">
                                    <span style="display: block; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">Bewerbung &rarr; Gespräch</span>
                                    <strong style="font-size: 1rem; color: var(--primary); font-family: 'Outfit';">${f}%</strong>
                                </div>
                                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); padding: 8px 10px; border-radius: 6px; flex: 1; min-width: 110px; text-align: center;">
                                    <span style="display: block; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">Gespräch &rarr; Angebot</span>
                                    <strong style="font-size: 1rem; color: var(--success); font-family: 'Outfit';">${x}%</strong>
                                </div>
                                <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); padding: 8px 10px; border-radius: 6px; flex: 1; min-width: 110px; text-align: center;" title="Durchschnittliche Dauer von Speichern bis Bewerben">
                                    <span style="display: block; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">Ø Tage bis Bewerbung</span>
                                    <strong style="font-size: 1.05rem; color: var(--warning); font-family: 'Outfit';">${V} Tage</strong>
                                </div>
                                <div style="background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.2); padding: 8px 10px; border-radius: 6px; flex: 1; min-width: 110px; text-align: center;" title="Durchschnittliche Dauer von Bewerben bis Einladung">
                                    <span style="display: block; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">Ø Tage bis Gespräch</span>
                                    <strong style="font-size: 1.05rem; color: var(--secondary); font-family: 'Outfit';">${C} Tage</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Ghosting-Detektor & Reaktionszeit-Monitoring -->
                ${(()=>{const h=new Date,w=t.filter(E=>{if(["saved","offer","rejected"].includes(E.status))return!1;const I=new Date(E.createdAt||0);return Math.floor((h-I)/(1e3*60*60*24))>=21});return`
                        <div class="glass-card" style="padding: 20px; margin-bottom: 32px; border-left: 4px solid ${w.length>0?"var(--color-warning)":"var(--color-success)"};">
                            <div class="flex-between align-center" style="margin-bottom: 12px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <i data-lucide="${w.length>0?"ghost":"check-circle"}" style="color: ${w.length>0?"var(--color-warning)":"var(--color-success)"};"></i>
                                    <h3 style="margin: 0; font-size: 1.05rem;">Ghosting-Detektor &amp; Follow-up Monitor</h3>
                                </div>
                                <span class="badge ${w.length>0?"badge-interviewing":"badge-offer"}">
                                    ${w.length} ${w.length===1?"Stelle überfällig (>21 Tage)":"Stellen überfällig (>21 Tage)"}
                                </span>
                            </div>
                            ${w.length>0?`
                                <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 12px;">
                                    Bei folgenden Unternehmen liegt die Bewerbung oder das letzte Gespräch über 21 Tage zurück. Nutze die E-Mail-Suite im Copilot für ein gezieltes Status-Follow-up:
                                </p>
                                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
                                    ${w.map(E=>{const I=Math.floor((h-new Date(E.createdAt||0))/864e5);return`
                                            <div style="background: rgba(0,0,0,0.25); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                                                <div>
                                                    <strong style="display: block; font-size: 0.9rem;">${E.company}</strong>
                                                    <span style="font-size: 0.78rem; color: var(--text-secondary);">${E.title} &bull; vor ${I} Tagen</span>
                                                </div>
                                                <button class="btn btn-secondary btn-sm" onclick="window.app.switchToView('copilot', '${E.id}')" title="Im Copilot öffnen">
                                                    <i data-lucide="mail"></i> Follow-up
                                                </button>
                                            </div>
                                        `}).join("")}
                                </div>
                            `:`
                                <p class="text-secondary" style="font-size: 0.85rem; margin: 0;">
                                    Alles im grünen Bereich! Keine offenen Bewerbungen ohne Rückmeldung überfällig.
                                </p>
                            `}
                        </div>
                    `})()}

                <!-- Absagegründe & Skill-Gap Analytik Widget -->
                <div class="glass-card" style="padding: 24px; margin-bottom: 32px;">
                    <div class="chart-header" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                        <h3><i data-lucide="alert-triangle" style="color: var(--warning); display: inline; vertical-align: middle; margin-right: 6px;"></i> Absagegründe &amp; Skill-Gap Analytik</h3>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">${t.filter(h=>h.status==="rejected").length} Absagen ausgewertet</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
                        <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                            <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px;">Häufigste Absagegründe</h4>
                            <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85rem; display: flex; flex-direction: column; gap: 8px;">
                                <li style="display: flex; justify-content: space-between;"><span>Fehlende Qualifikation / Skill-Gap</span><strong style="color: var(--primary);">40%</strong></li>
                                <li style="display: flex; justify-content: space-between;"><span>Keine Rückmeldung nach Wartezeit</span><strong style="color: var(--warning);">30%</strong></li>
                                <li style="display: flex; justify-content: space-between;"><span>Gehaltsvorstellung zu hoch</span><strong style="color: var(--danger);">20%</strong></li>
                                <li style="display: flex; justify-content: space-between;"><span>Stelle gestrichen / Besetzt</span><strong style="color: var(--text-muted);">10%</strong></li>
                            </ul>
                        </div>
                        <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                            <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px;">Geforderte Skills zum Nachholen</h4>
                            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                <span class="keyword-badge miss">Docker</span>
                                <span class="keyword-badge miss">Kubernetes</span>
                                <span class="keyword-badge miss">AWS Cloud</span>
                                <span class="keyword-badge miss">GraphQL</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Split Row: Heatmap & Goal Tracker -->
                <div class="dashboard-activity-row" style="display: grid; grid-template-columns: 1.8fr 1fr; gap: 32px; margin-top: 32px; margin-bottom: 32px;">
                    <!-- Left: Heatmap -->
                    <div class="glass-card activity-card" style="padding: 24px; position: relative;">
                        <div class="chart-header" style="margin-bottom: 16px;">
                            <h3>Aktivitäts-Kalender (Letzte 13 Wochen)</h3>
                        </div>
                        <div class="heatmap-wrapper" style="display: flex; flex-direction: column; gap: 6px;">
                            <!-- Months headers -->
                            <div class="heatmap-months" style="display: grid; grid-auto-flow: column; grid-auto-columns: 12px; gap: 3px; font-size: 0.65rem; color: var(--text-muted); height: 16px; margin-bottom: 2px; padding-left: 28px;">
                                ${oe.map(h=>`<div style="text-align: left; overflow: visible; white-space: nowrap;">${h}</div>`).join("")}
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <!-- Weekday headers -->
                                <div class="heatmap-weekdays" style="display: flex; flex-direction: column; justify-content: space-between; font-size: 0.65rem; color: var(--text-muted); width: 20px; padding-top: 2px; padding-bottom: 2px; line-height: 12px; height: 102px;">
                                    <span>Mo</span>
                                    <span>Mi</span>
                                    <span>Fr</span>
                                    <span>So</span>
                                </div>
                                <div class="heatmap-grid" id="heatmapGrid" style="display: grid; grid-template-rows: repeat(7, 12px); grid-auto-flow: column; grid-auto-columns: 12px; gap: 3px; justify-content: flex-start;">
                                    ${ae}
                                </div>
                            </div>
                            <!-- Legend -->
                            <div class="heatmap-legend" style="display: flex; align-items: center; justify-content: flex-end; gap: 6px; font-size: 0.7rem; color: var(--text-muted); margin-top: 10px; padding-right: 4px;">
                                <span>Weniger</span>
                                <div class="heatmap-cell level-0" style="width: 10px; height: 10px; border-radius: 2px; background: rgba(255, 255, 255, 0.05);"></div>
                                <div class="heatmap-cell level-1" style="width: 10px; height: 10px; border-radius: 2px;"></div>
                                <div class="heatmap-cell level-2" style="width: 10px; height: 10px; border-radius: 2px;"></div>
                                <div class="heatmap-cell level-3" style="width: 10px; height: 10px; border-radius: 2px;"></div>
                                <div class="heatmap-cell level-4" style="width: 10px; height: 10px; border-radius: 2px;"></div>
                                <span>Mehr</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Goal Tracker -->
                    <div class="glass-card goal-card" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
                        <div class="chart-header" style="margin-bottom: 12px;">
                            <h3>Wöchentliches Bewerbungsziel</h3>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-around; flex-grow: 1; gap: 20px;">
                            <!-- Progress ring -->
                            <div style="position: relative; width: 90px; height: 90px; display: flex; align-items: center; justify-content: center;">
                                <svg width="90" height="90" viewBox="0 0 90 90" style="transform: rotate(-90deg);">
                                    <circle cx="45" cy="45" r="${W}" stroke="rgba(255,255,255,0.05)" stroke-width="8" fill="transparent"></circle>
                                    <circle cx="45" cy="45" r="${W}" stroke="var(--primary)" stroke-width="8" fill="transparent"
                                            stroke-dasharray="${_}"
                                            stroke-dashoffset="${Ee}"
                                            stroke-linecap="round"
                                            style="transition: stroke-dashoffset 0.5s ease-in-out; filter: drop-shadow(0 0 4px var(--primary));"></circle>
                                </svg>
                                <div style="position: absolute; display: flex; flex-direction: column; align-items: center;">
                                    <span style="font-family: 'Outfit'; font-size: 1.4rem; font-weight: 800; color: #fff; line-height: 1;">${F}</span>
                                    <span style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">von ${R}</span>
                                </div>
                            </div>
                            
                            <!-- Goal controls -->
                            <div style="display: flex; flex-direction: column; gap: 10px; align-items: center;">
                                <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 700; text-align: center;">Wochenziel anpassen</span>
                                <div style="display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 4px 8px;">
                                    <button class="btn btn-secondary" id="btn-goal-dec" style="padding: 4px 8px; width: 24px; height: 24px; min-width: 24px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; border-radius: 4px; line-height: 1;">-</button>
                                    <strong style="font-size: 1.1rem; color: #fff; min-width: 20px; text-align: center;" id="lbl-weekly-goal">${R}</strong>
                                    <button class="btn btn-secondary" id="btn-goal-inc" style="padding: 4px 8px; width: 24px; height: 24px; min-width: 24px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; border-radius: 4px; line-height: 1;">+</button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Celebration notice -->
                        <div style="margin-top: 14px; text-align: center; font-size: 0.82rem; min-height: 24px; font-weight: 500;">
                            ${Se?'<span style="color: var(--success); display: flex; align-items: center; justify-content: center; gap: 6px;"><i data-lucide="award" style="width: 16px; height: 16px;"></i> Wochenziel erreicht! 🎉 Super Arbeit!</span>':`<span style="color: var(--text-secondary);">Noch ${R-F} Bewerbung${R-F>1?"en":""} bis zum Ziel!</span>`}
                        </div>
                    </div>
                </div>

                <!-- Split Sections -->
                <div class="dashboard-split">
                    <!-- Left: Upcoming Deadlines -->
                    <div class="glass-card split-card">
                        <h3><i data-lucide="clock"></i> Anstehende Bewerbungsfristen</h3>
                        <div class="event-list">
                            ${ie.length>0?ie.map(h=>`
                                <div class="event-item cursor-pointer" data-id="${h.id}" style="position: relative; padding-right: 50px;">
                                    <div class="event-badge">
                                        <span class="day">${h.day}</span>
                                        <span class="month">${h.month}</span>
                                    </div>
                                    <div class="event-details">
                                        <span class="event-title">${h.title}</span>
                                        <span class="event-company">${h.company}</span>
                                        <span class="event-time">
                                            <i data-lucide="calendar"></i> Frist: ${new Date(h.deadline).toLocaleDateString("de-DE")}
                                        </span>
                                    </div>
                                    <div style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); display: flex; gap: 6px; z-index: 5;">
                                        <button class="btn btn-secondary btn-export-ics" data-id="${h.id}" title="Als Kalenderdatei (.ics) exportieren" style="padding: 6px; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                                            <i data-lucide="calendar-plus" style="width: 14px; height: 14px; color: var(--primary);"></i>
                                        </button>
                                        <button class="btn btn-secondary btn-google-cal" data-id="${h.id}" title="In Google Kalender eintragen" style="padding: 6px; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                                            <i data-lucide="calendar" style="width: 14px; height: 14px; color: var(--success);"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join(""):`
                                <div class="empty-state">
                                    <i data-lucide="calendar-check"></i>
                                    <p>Keine anstehenden Fristen eingetragen.</p>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Right: Top Recommendations -->
                    <div class="glass-card split-card">
                        <h3><i data-lucide="sparkles"></i> Top-Empfehlungen (Beste Kriterien)</h3>
                        <div class="reco-list">
                            ${ne.length>0?ne.map(h=>`
                                <div class="reco-item cursor-pointer" data-id="${h.id}">
                                    <div class="reco-details">
                                        <span class="reco-title">${h.title}</span>
                                        <span class="reco-company">${h.company}</span>
                                        <div class="reco-meta">
                                            <span class="reco-tag">${h.workMode}</span>
                                            ${h.salary?`<span class="reco-tag">${h.salary.toLocaleString("de-DE")} €</span>`:""}
                                        </div>
                                    </div>
                                    <div class="reco-score">
                                        <span class="score-badge">${h.compareScore}% Match</span>
                                        <span class="score-label">Kriterien-Score</span>
                                    </div>
                                </div>
                            `).join(""):`
                                <div class="empty-state">
                                    <i data-lucide="thumbs-up"></i>
                                    <p>Füge Jobs hinzu, um Empfehlungen zu sehen.</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>

                <!-- Salary comparison row -->
                <div class="glass-card salary-chart-card" style="padding: 24px; margin-top: 32px;">
                    <div class="chart-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                        <h3>Gehalts-Vergleich (Brutto vs. Netto)</h3>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <label for="dash-tax-class" style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">StKl:</label>
                                <select id="dash-tax-class" style="padding: 4px 8px; border-radius: var(--radius-sm); background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.8rem;">
                                    <option value="1" ${i.taxClass==="1"?"selected":""}>Klasse I</option>
                                    <option value="2" ${i.taxClass==="2"?"selected":""}>Klasse II</option>
                                    <option value="3" ${i.taxClass==="3"?"selected":""}>Klasse III</option>
                                    <option value="4" ${i.taxClass==="4"?"selected":""}>Klasse IV</option>
                                    <option value="5" ${i.taxClass==="5"?"selected":""}>Klasse V</option>
                                    <option value="6" ${i.taxClass==="6"?"selected":""}>Klasse VI</option>
                                </select>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <label for="dash-church-tax" style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">KiSt:</label>
                                <select id="dash-church-tax" style="padding: 4px 8px; border-radius: var(--radius-sm); background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.8rem;">
                                    <option value="0" ${i.churchTax==="0"?"selected":""}>Keine</option>
                                    <option value="8" ${i.churchTax==="8"?"selected":""}>8%</option>
                                    <option value="9" ${i.churchTax==="9"?"selected":""}>9%</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="chart-container" style="height: 320px; position: relative;">
                        <canvas id="salaryChart"></canvas>
                    </div>
                </div>

                <!-- NEW: Application Activity Trend Chart -->
                <div class="glass-card activity-trend-chart-card" style="padding: 24px; margin-top: 32px;">
                    <div class="chart-header" style="margin-bottom: 24px;">
                        <h3>Bewerbungs-Aktivität im Zeitverlauf (Letzte 6 Monate)</h3>
                    </div>
                    <div class="chart-container" style="height: 320px; position: relative;">
                        <canvas id="activityTrendChart"></canvas>
                    </div>
                </div>
            </div>
        `,lucide.createIcons(),this.renderCharts(t,i),e.querySelectorAll(".event-item, .reco-item").forEach(h=>{h.addEventListener("click",()=>{const w=h.getAttribute("data-id");window.app.editJob(w)})}),e.querySelectorAll(".btn-export-ics").forEach(h=>{h.addEventListener("click",w=>{w.stopPropagation();const E=h.getAttribute("data-id"),I=t.find(T=>T.id===E);if(I)try{Ce(I.title,I.company,I.deadline,I.description||""),window.app.showToast("Kalenderdatei (.ics) heruntergeladen!","success")}catch(T){console.error("Failed to export ICS",T),window.app.showToast("Fehler beim Generieren des Kalendereintrags.","danger")}})}),e.querySelectorAll(".btn-google-cal").forEach(h=>{h.addEventListener("click",w=>{w.stopPropagation();const E=h.getAttribute("data-id"),I=t.find(T=>T.id===E);if(I){const T=`Bewerbungsfrist: ${I.title} bei ${I.company}`,D=`Link zur Anzeige: ${I.url||""}
Notizen: ${I.notes||""}`,ue=I.deadline.replace(/-/g,""),Ie=`${ue}/${ue}`,$e=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(T)}&dates=${Ie}&details=${encodeURIComponent(D)}`;window.open($e,"_blank"),window.app.showToast("Google Kalender geöffnet!","success")}})});const Z=e.querySelector("#dash-tax-class"),Q=e.querySelector("#dash-church-tax");if(Z&&Q){const h=()=>{const w=y.getProfile();w.taxClass=Z.value,w.churchTax=Q.value,y.saveProfile(w),this.renderSalaryChart(t,w),window.app.showToast("Steuereinstellungen aktualisiert!","success")};Z.addEventListener("change",h),Q.addEventListener("change",h)}const de=e.querySelector("#btn-goal-dec"),ce=e.querySelector("#btn-goal-inc");de&&ce&&(de.addEventListener("click",()=>{const h=y.getProfile();let w=h.weeklyGoal||3;w>1&&(w--,h.weeklyGoal=w,y.saveProfile(h),this.render(n),window.app.showToast("Wochenziel aktualisiert!","success"))}),ce.addEventListener("click",()=>{const h=y.getProfile();let w=h.weeklyGoal||3;w<20&&(w++,h.weeklyGoal=w,y.saveProfile(h),this.render(n),window.app.showToast("Wochenziel aktualisiert!","success"))}))},renderEmptyState(n){n.innerHTML=`
            <div class="glass-card empty-state" style="padding: 60px 40px; min-height: 400px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 24px;">
                <i data-lucide="folder-open" style="width: 64px; height: 64px; color: var(--text-muted);"></i>
                <h2>Willkommen bei JobMatch!</h2>
                <p style="max-width: 450px; line-height: 1.6; color: var(--text-secondary);">
                    Dein Dashboard ist aktuell noch leer. Erstelle deine erste Bewerbung oder lade ein paar Beispieldaten, um direkt zu starten!
                </p>
                <div style="display: flex; gap: 16px;">
                    <button class="btn btn-primary" id="btn-dashboard-add">
                        <i data-lucide="plus"></i> Ersten Job hinzufügen
                    </button>
                </div>
            </div>
        `,lucide.createIcons(),document.getElementById("btn-dashboard-add").addEventListener("click",()=>{window.app.openJobModal()})},renderCharts(n,e){this.renderStatusChart(n),this.renderSalaryChart(n,e),this.renderActivityTrendChart(n)},renderStatusChart(n){const e=document.getElementById("statusChart");if(!e)return;const t={saved:{label:"Gespeichert",count:0,color:"rgba(107, 114, 128, 0.75)",border:"#6b7280"},prepared:{label:"Unterlagen bereit",count:0,color:"rgba(245, 158, 11, 0.75)",border:"#f59e0b"},applied:{label:"Beworben",count:0,color:"rgba(99, 102, 241, 0.75)",border:"#6366f1"},interviewing:{label:"Gespräch",count:0,color:"rgba(139, 92, 246, 0.75)",border:"#8b5cf6"},offer:{label:"Zusage / Angebot",count:0,color:"rgba(16, 185, 129, 0.75)",border:"#10b981"},rejected:{label:"Absage",count:0,color:"rgba(244, 63, 94, 0.75)",border:"#f43f5e"}};n.forEach(s=>{const r=s.status||"saved",a=r==="prepared"?"prepared":r==="applied"?"applied":r==="interviewing"?"interviewing":r==="offer"?"offer":r==="rejected"?"rejected":"saved";t[a]&&t[a].count++});const i=Object.values(t).filter(s=>s.count>0);this.chartInstance&&this.chartInstance.destroy(),this.chartInstance=new Chart(e,{type:"doughnut",data:{labels:i.map(s=>s.label),datasets:[{data:i.map(s=>s.count),backgroundColor:i.map(s=>s.color),borderColor:i.map(s=>s.border),borderWidth:2,hoverOffset:8}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"right",labels:{color:"#e5e7eb",font:{family:"Inter",size:12},padding:20}}},cutout:"65%"}})},renderSalaryChart(n,e){const t=document.getElementById("salaryChart");if(!t)return;const i=n.filter(l=>l.salary&&l.salary>0);if(this.salaryChartInstance&&this.salaryChartInstance.destroy(),i.length===0){t.style.display="none";const l=t.parentElement;let d=l.querySelector(".salary-placeholder");d||(d=document.createElement("div"),d.className="salary-placeholder empty-state",d.style.cssText="padding: 40px; text-align: center; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 12px; justify-content: center; height: 100%;",d.innerHTML='<i data-lucide="euro" style="width: 48px; height: 48px;"></i><p>Keine Gehaltsdaten eingetragen. Trage Gehälter bei deinen Jobs ein, um den Vergleich zu sehen.</p>',l.appendChild(d),lucide.createIcons());return}t.style.display="block";const s=t.parentElement.querySelector(".salary-placeholder");s&&s.remove();const r=i.map(l=>`${l.company} (${l.title.slice(0,15)}...)`),a=i.map(l=>l.salary),o=i.map(l=>Me(l.salary,e).netYearly);this.salaryChartInstance=new Chart(t,{type:"bar",data:{labels:r,datasets:[{label:"Bruttogehalt (€/Jahr)",data:a,backgroundColor:"rgba(99, 102, 241, 0.65)",borderColor:"#6366f1",borderWidth:1.5},{label:"Nettogehalt (€/Jahr, geschätzt)",data:o,backgroundColor:"rgba(16, 185, 129, 0.65)",borderColor:"#10b981",borderWidth:1.5}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{y:{beginAtZero:!0,ticks:{color:"#cbd5e1"},grid:{color:"rgba(255, 255, 255, 0.05)"}},x:{ticks:{color:"#cbd5e1"},grid:{color:"rgba(255, 255, 255, 0.05)"}}},plugins:{legend:{labels:{color:"#e5e7eb",font:{family:"Inter",size:12}}}}}})},renderActivityTrendChart(n){const e=document.getElementById("activityTrendChart");if(!e)return;this.activityTrendChartInstance&&this.activityTrendChartInstance.destroy();const t=[],i=[],s=new Date;for(let r=5;r>=0;r--){const a=new Date(s.getFullYear(),s.getMonth()-r,1),o=a.toLocaleString("de-DE",{month:"short",year:"numeric"});t.push(o);const l=a.getFullYear(),d=a.getMonth(),u=n.filter(c=>{let p=null;if(c.history&&Array.isArray(c.history)){const b=c.history.find(v=>v.status==="applied");b&&(p=new Date(b.timestamp))}return!p&&c.status==="applied"&&c.createdAt&&(p=new Date(c.createdAt)),p?p.getFullYear()===l&&p.getMonth()===d:!1}).length;i.push(u)}this.activityTrendChartInstance=new Chart(e,{type:"line",data:{labels:t,datasets:[{label:"Gesendete Bewerbungen",data:i,borderColor:"#6366f1",backgroundColor:"rgba(99, 102, 241, 0.1)",borderWidth:3,fill:!0,tension:.3,pointBackgroundColor:"#8b5cf6",pointBorderColor:"#fff",pointBorderWidth:2,pointRadius:6,pointHoverRadius:8}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{y:{beginAtZero:!0,ticks:{color:"#cbd5e1",stepSize:1},grid:{color:"rgba(255, 255, 255, 0.05)"}},x:{ticks:{color:"#cbd5e1"},grid:{color:"rgba(255, 255, 255, 0.05)"}}},plugins:{legend:{labels:{color:"#e5e7eb",font:{family:"Inter",size:12}}}}}})}},Ne={filterWorkmode:"all",sortBy:"date-desc",selectedJobIds:new Set,batchMode:!1,render(n){const e=document.getElementById(n);if(!e)return;const t=y.getJobs(),i=y.getProfile(),s=y.getCustomColumns();let r=[...t];this.filterWorkmode!=="all"&&(r=r.filter(a=>a.workMode===this.filterWorkmode)),r.sort((a,o)=>{if(this.sortBy==="salary-desc")return(o.salary||0)-(a.salary||0);if(this.sortBy==="match-desc"){const l=A.analyzeJobMatch(a.description||"",i.skills).matchScore;return A.analyzeJobMatch(o.description||"",i.skills).matchScore-l}else return this.sortBy==="deadline-asc"?a.deadline?o.deadline?new Date(a.deadline)-new Date(o.deadline):-1:1:new Date(o.createdAt||0)-new Date(a.createdAt||0)}),e.innerHTML=`
            <div class="kanban-header flex-between align-center">
                <div>
                    <h2>Bewerbungs-Tracker (Kanban)</h2>
                    <span class="text-secondary">${r.length} Jobs in ${s.length} Phasen</span>
                </div>
                <div class="flex-row gap-8">
                    <button class="btn btn-secondary btn-sm" id="btn-toggle-batch-mode">
                        <i data-lucide="${this.batchMode?"check-square":"square"}"></i> ${this.batchMode?"Mehrfachauswahl Beenden":"Mehrfachauswahl"}
                    </button>
                    <button class="btn btn-secondary btn-sm" id="btn-configure-columns">
                        <i data-lucide="settings"></i> Spalten Anpassen
                    </button>
                </div>
            </div>
            
            ${this.batchMode?`
                <div class="batch-actions-bar glass-card flex-between align-center" style="padding: 12px 20px; margin-bottom: 16px; border: 1px solid var(--color-primary);">
                    <span><strong>${this.selectedJobIds.size}</strong> Jobs ausgewählt</span>
                    <div class="flex-row gap-8">
                        <select id="batch-move-status" class="form-input" style="padding: 4px 8px; font-size: 0.85rem;">
                            <option value="">Status ändern zu...</option>
                            ${s.map(a=>`<option value="${a.id}">${a.title}</option>`).join("")}
                        </select>
                        <button class="btn btn-danger btn-sm" id="btn-batch-delete"><i data-lucide="trash-2"></i> Löschen</button>
                    </div>
                </div>
            `:""}

            <div class="kanban-controls-bar glass-card">
                <div class="kanban-control-group">
                    <label for="kanban-filter-workmode" class="kanban-control-label">Arbeitsmodell:</label>
                    <select id="kanban-filter-workmode" class="kanban-control-select">
                        <option value="all" ${this.filterWorkmode==="all"?"selected":""}>Alle</option>
                        <option value="Remote" ${this.filterWorkmode==="Remote"?"selected":""}>100% Remote</option>
                        <option value="Hybrid" ${this.filterWorkmode==="Hybrid"?"selected":""}>Hybrid</option>
                        <option value="Vor Ort" ${this.filterWorkmode==="Vor Ort"?"selected":""}>Vor Ort</option>
                    </select>
                </div>
                <div class="kanban-control-group">
                    <label for="kanban-sort-by" class="kanban-control-label">Sortieren nach:</label>
                    <select id="kanban-sort-by" class="kanban-control-select">
                        <option value="date-desc" ${this.sortBy==="date-desc"?"selected":""}>Neueste zuerst</option>
                        <option value="salary-desc" ${this.sortBy==="salary-desc"?"selected":""}>Höchstes Gehalt</option>
                        <option value="match-desc" ${this.sortBy==="match-desc"?"selected":""}>Bester Match-Score</option>
                        <option value="deadline-asc" ${this.sortBy==="deadline-asc"?"selected":""}>Fristen (nächste zuerst)</option>
                    </select>
                </div>
            </div>

            <div class="kanban-board-container">
                ${s.map(a=>{const o=r.filter(l=>l.status===a.id);return`
                        <div class="kanban-column" data-status="${a.id}">
                            <div class="kanban-column-header flex-between align-center">
                                <div class="column-title-group">
                                    <i data-lucide="folder"></i>
                                    <h4>${a.title}</h4>
                                </div>
                                <span class="column-count">${o.length}</span>
                            </div>
                            <div class="kanban-cards-list" data-status="${a.id}">
                                ${o.map(l=>this.createCardHtml(l,i.skills)).join("")}
                            </div>
                        </div>
                    `}).join("")}
            </div>
        `,window.lucide&&lucide.createIcons(),this.initDragAndDrop(e),this.bindCardEvents(e),this.bindControlsEvents(e)},createCardHtml(n,e){const t=y.getProfile(),s=A.analyzeJobMatch(n.description||"",e||t.skills).matchScore;let r="low";s>=75?r="high":s>=40&&(r="medium");const a=new Date(n.createdAt||Date.now()),o=Math.floor((Date.now()-a.getTime())/(1e3*3600*24)),l=(n.status==="applied"||n.status==="ready")&&o>=14,d=this.selectedJobIds.has(n.id);return`
            <div class="glass-card kanban-card ${d?"selected":""}" draggable="true" data-id="${n.id}" tabindex="0">
                ${this.batchMode?`
                    <div style="margin-bottom: 6px;">
                        <input type="checkbox" class="batch-card-checkbox" data-id="${n.id}" ${d?"checked":""}>
                    </div>
                `:""}
                <div class="card-top flex-between align-center">
                    <span class="card-company" title="${n.company}">${n.company}</span>
                    <div class="card-menu">
                        <button class="card-btn-action edit" title="Bearbeiten"><i data-lucide="edit-2"></i></button>
                        <button class="card-btn-action delete" title="Löschen"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
                <h5 class="card-title" title="${n.title}">${n.title}</h5>

                ${l?`
                    <div style="margin: 6px 0;">
                        <button class="btn btn-warning btn-sm btn-followup" data-id="${n.id}" style="font-size: 0.72rem; padding: 2px 6px;">
                            <i data-lucide="mail"></i> Nachfassen (${o} Tage)
                        </button>
                    </div>
                `:""}

                <div class="card-meta-grid">
                    <div class="meta-item">
                        <i data-lucide="map-pin"></i>
                        <span>${n.location||"K.A."}</span>
                    </div>
                    <div class="meta-item">
                        <i data-lucide="euro"></i>
                        <span>${n.salary?n.salary.toLocaleString("de-DE")+" €":"K.A."}</span>
                    </div>
                </div>

                ${n.tags&&Array.isArray(n.tags)&&n.tags.length>0?`
                    <div class="card-tags-list" style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;">
                        ${n.tags.slice(0,3).map(u=>`<span class="badge badge-saved" style="font-size: 0.65rem; padding: 1px 5px;">#${u}</span>`).join("")}
                    </div>
                `:""}

                <div class="card-footer flex-between align-center" style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-color);">
                    <span class="match-badge ${r}">${s}% Match</span>
                    <span class="text-muted" style="font-size: 0.75rem;">${o===0?"heute":`vor ${o}d`}</span>
                </div>
            </div>
        `},initDragAndDrop(n){const e=n.querySelectorAll(".kanban-card"),t=n.querySelectorAll(".kanban-cards-list");e.forEach(i=>{i.addEventListener("dragstart",s=>{s.dataTransfer.setData("text/plain",i.getAttribute("data-id")),i.classList.add("dragging")}),i.addEventListener("dragend",()=>{i.classList.remove("dragging")})}),t.forEach(i=>{i.addEventListener("dragover",s=>{s.preventDefault(),i.classList.add("drag-over")}),i.addEventListener("dragleave",()=>{i.classList.remove("drag-over")}),i.addEventListener("drop",s=>{s.preventDefault(),i.classList.remove("drag-over");const r=s.dataTransfer.getData("text/plain"),a=i.getAttribute("data-status");if(r&&a){const o=y.getJobs(),l=o.find(d=>d.id===r);l&&(a==="rejected"&&l.status!=="rejected"?this.promptRejectionReason(l,()=>{l.status=a,y.saveJobs(o),this.render("view-kanban")}):(l.status=a,y.saveJobs(o),this.render("view-kanban")))}})})},promptRejectionReason(n,e){var r,a;const t=`
            <div class="modal-overlay active" id="rejection-prompt-modal">
                <div class="glass-card modal-content" style="max-width: 440px; padding: 24px;">
                    <h3><i data-lucide="frown"></i> Absagegrund erfassen</h3>
                    <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 16px;">
                        Erfasse den Grund für die Absage bei <strong>${n.company}</strong>, um dein Profil im Dashboard zu optimieren:
                    </p>

                    <div class="form-group" style="margin-bottom: 12px;">
                        <label style="font-size: 0.85rem;">Hauptgrund:</label>
                        <select id="rej-reason-select" class="form-input">
                            <option value="Gehaltsvorstellung zu hoch">Gehaltsvorstellung zu hoch</option>
                            <option value="Fehlende Erfahrung in Tech-Skill">Fehlende Erfahrung in Tech-Skill</option>
                            <option value="Intern besetzt">Intern besetzt</option>
                            <option value="Absage nach Erstgespräch">Absage nach Erstgespräch</option>
                            <option value="Keine Rückmeldung / Sonstiges">Keine Rückmeldung / Sonstiges</option>
                        </select>
                    </div>

                    <div class="form-group" style="margin-bottom: 16px;">
                        <label style="font-size: 0.85rem;">Notizen / Details:</label>
                        <textarea id="rej-notes-input" class="form-input" rows="3" placeholder="Zusätzliches Feedback..."></textarea>
                    </div>

                    <div class="flex-between">
                        <button class="btn btn-secondary" id="btn-cancel-rej">Überspringen</button>
                        <button class="btn btn-primary" id="btn-save-rej">Speichern &amp; Verschieben</button>
                    </div>
                </div>
            </div>
        `;document.body.insertAdjacentHTML("beforeend",t),window.lucide&&lucide.createIcons();const i=document.getElementById("rejection-prompt-modal"),s=()=>{i&&i.remove(),e&&e()};(r=i.querySelector("#btn-cancel-rej"))==null||r.addEventListener("click",s),(a=i.querySelector("#btn-save-rej"))==null||a.addEventListener("click",()=>{const o=i.querySelector("#rej-reason-select").value,l=i.querySelector("#rej-notes-input").value;y.addRejectionReason(n.id,n.company,n.title,o,l),s()})},bindCardEvents(n){n.querySelectorAll(".card-btn-action.edit").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation();const s=e.closest(".kanban-card").getAttribute("data-id");window.app&&typeof window.app.openJobModal=="function"&&window.app.openJobModal(s)})}),n.querySelectorAll(".card-btn-action.delete").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation();const s=e.closest(".kanban-card").getAttribute("data-id");confirm("Möchtest du diese Bewerbung wirklich löschen?")&&(y.deleteJob(s),this.render("view-kanban"))})}),n.querySelectorAll(".btn-followup").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation();const i=e.getAttribute("data-id"),s=y.getJobs().find(r=>r.id===i);if(s){const r=encodeURIComponent(`Nachfrage zu meiner Bewerbung als ${s.title}`),a=encodeURIComponent(`Sehr geehrte Damen und Herren,

ich wollte mich erkundigen, wie der aktuelle Stand meiner Bewerbung für die Stelle als ${s.title} bei ${s.company} ist.

Mit freundlichen Grüßen`);window.location.href=`mailto:${s.contactEmail||""}?subject=${r}&body=${a}`}})}),n.querySelectorAll(".batch-card-checkbox").forEach(e=>{e.addEventListener("change",()=>{const t=e.getAttribute("data-id");e.checked?this.selectedJobIds.add(t):this.selectedJobIds.delete(t),this.render("view-kanban")})})},bindControlsEvents(n){var a;const e=n.querySelector("#kanban-filter-workmode");e&&e.addEventListener("change",o=>{this.filterWorkmode=o.target.value,this.render("view-kanban")});const t=n.querySelector("#kanban-sort-by");t&&t.addEventListener("change",o=>{this.sortBy=o.target.value,this.render("view-kanban")});const i=n.querySelector("#btn-toggle-batch-mode");i&&i.addEventListener("click",()=>{this.batchMode=!this.batchMode,this.batchMode||this.selectedJobIds.clear(),this.render("view-kanban")});const s=n.querySelector("#batch-move-status");s&&s.addEventListener("change",o=>{const l=o.target.value;if(!l||this.selectedJobIds.size===0)return;const d=y.getJobs();d.forEach(u=>{this.selectedJobIds.has(u.id)&&(u.status=l)}),y.saveJobs(d),this.selectedJobIds.clear(),this.render("view-kanban")});const r=n.querySelector("#btn-batch-delete");r&&r.addEventListener("click",()=>{if(this.selectedJobIds.size!==0&&confirm(`${this.selectedJobIds.size} ausgewählte Jobs wirklich löschen?`)){let o=y.getJobs();o=o.filter(l=>!this.selectedJobIds.has(l.id)),y.saveJobs(o),this.selectedJobIds.clear(),this.render("view-kanban")}}),(a=n.querySelector("#btn-configure-columns"))==null||a.addEventListener("click",()=>{this.openColumnConfigModal()})},openColumnConfigModal(){var i,s;const n=y.getCustomColumns(),e=`
            <div class="modal-overlay active" id="column-config-modal">
                <div class="glass-card modal-content" style="max-width: 500px; padding: 24px;">
                    <h3><i data-lucide="settings"></i> Kanban-Spalten Anpassen</h3>
                    <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 16px;">
                        Passe die Namen und Reihenfolge deiner Kanban-Phasen an:
                    </p>

                    <div id="col-list-container" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                        ${n.map((r,a)=>`
                            <div class="flex-between align-center" style="gap: 8px;">
                                <input type="text" class="form-input col-title-input" data-idx="${a}" value="${r.title}">
                            </div>
                        `).join("")}
                    </div>

                    <div class="flex-between">
                        <button class="btn btn-secondary" id="btn-close-col-config">Abbrechen</button>
                        <button class="btn btn-primary" id="btn-save-col-config">Speichern</button>
                    </div>
                </div>
            </div>
        `;document.body.insertAdjacentHTML("beforeend",e),window.lucide&&lucide.createIcons();const t=document.getElementById("column-config-modal");(i=t.querySelector("#btn-close-col-config"))==null||i.addEventListener("click",()=>t.remove()),(s=t.querySelector("#btn-save-col-config"))==null||s.addEventListener("click",()=>{t.querySelectorAll(".col-title-input").forEach(a=>{const o=parseInt(a.getAttribute("data-idx"),10);n[o]&&(n[o].title=a.value.trim()||n[o].title)}),y.saveCustomColumns(n),t.remove(),this.render("view-kanban")})}},Ke={activeTab:"matrix",showdownJob1Id:null,showdownJob2Id:null,chartInstance:null,render(n){const e=document.getElementById(n);if(!e)return;const t=y.getJobs().filter(s=>s.status!=="rejected"),i=y.getWeights();t.length>=2&&((!this.showdownJob1Id||!t.some(s=>s.id===this.showdownJob1Id))&&(this.showdownJob1Id=t[0].id),(!this.showdownJob2Id||!t.some(s=>s.id===this.showdownJob2Id))&&(this.showdownJob2Id=t[1].id)),e.innerHTML=`
            <div class="kanban-header flex-between align-center">
                <div>
                    <h2>Job-Vergleicher &amp; Entscheidungsmatrix</h2>
                    <span class="text-secondary">Objektive Bewertung und 1-gegen-1 Showdown für deine Angebote</span>
                </div>
                <div class="flex-row gap-8">
                    <button class="btn btn-secondary btn-sm ${this.activeTab==="matrix"?"active":""}" id="btn-tab-matrix">
                        <i data-lucide="grid"></i> Entscheidungsmatrix
                    </button>
                    <button class="btn btn-secondary btn-sm ${this.activeTab==="showdown"?"active":""}" id="btn-tab-showdown">
                        <i data-lucide="swords"></i> 1-vs-1 Showdown
                    </button>
                </div>
            </div>

            <div id="comparer-tab-content"></div>
        `,window.lucide&&lucide.createIcons(),this.bindTabEvents(e,t,i),this.renderTabContent(t,i)},bindTabEvents(n,e,t){var i,s;(i=n.querySelector("#btn-tab-matrix"))==null||i.addEventListener("click",()=>{this.activeTab="matrix",this.render("view-comparer")}),(s=n.querySelector("#btn-tab-showdown"))==null||s.addEventListener("click",()=>{this.activeTab="showdown",this.render("view-comparer")})},renderTabContent(n,e){const t=document.getElementById("comparer-tab-content");t&&(this.activeTab==="matrix"?this.renderMatrixTab(t,n,e):this.renderShowdownTab(t,n))},renderMatrixTab(n,e,t){n.innerHTML=`
            <div class="comparer-layout">
                <!-- Left: Weights Config Panel -->
                <div class="glass-card weighting-panel">
                    <h3>Kriterien-Gewichtung</h3>
                    <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 12px;">
                        Passe an, wie wichtig dir die einzelnen Faktoren bei der Jobsuche sind (1 = Nebensächlich, 5 = Essentiell).
                    </p>
                    
                    <div class="weight-item">
                        <div class="weight-info">
                            <span class="weight-label">Gehalt &amp; Benefits</span>
                            <span class="weight-multiplier" id="lbl-w-salary">x${t.salary}</span>
                        </div>
                        <input type="range" class="weight-slider" id="slide-w-salary" min="1" max="5" value="${t.salary}">
                    </div>
                    <div class="weight-item">
                        <div class="weight-info">
                            <span class="weight-label">Pendelzeit / Weg</span>
                            <span class="weight-multiplier" id="lbl-w-commute">x${t.commute}</span>
                        </div>
                        <input type="range" class="weight-slider" id="slide-w-commute" min="1" max="5" value="${t.commute}">
                    </div>
                    <div class="weight-item">
                        <div class="weight-info">
                            <span class="weight-label">Homeoffice-Flexibilität</span>
                            <span class="weight-multiplier" id="lbl-w-remote">x${t.remote}</span>
                        </div>
                        <input type="range" class="weight-slider" id="slide-w-remote" min="1" max="5" value="${t.remote}">
                    </div>
                    <div class="weight-item">
                        <div class="weight-info">
                            <span class="weight-label">Unternehmenskultur</span>
                            <span class="weight-multiplier" id="lbl-w-culture">x${t.culture}</span>
                        </div>
                        <input type="range" class="weight-slider" id="slide-w-culture" min="1" max="5" value="${t.culture}">
                    </div>
                    <div class="weight-item">
                        <div class="weight-info">
                            <span class="weight-label">Tech-Stack / Aufgaben</span>
                            <span class="weight-multiplier" id="lbl-w-tech">x${t.tech}</span>
                        </div>
                        <input type="range" class="weight-slider" id="slide-w-tech" min="1" max="5" value="${t.tech}">
                    </div>
                </div>

                <!-- Right: Scored Columns Matrix -->
                <div class="matrix-container" id="matrix-cols-holder"></div>
            </div>
        `,this.renderColumns(e,t),this.bindSliderEvents(n,e),window.lucide&&lucide.createIcons()},renderColumns(n,e){const t=document.getElementById("matrix-cols-holder");if(!t)return;if(n.length===0){t.innerHTML=`
                <div class="glass-card empty-state" style="width: 100%; min-height: 300px;">
                    <i data-lucide="git-compare"></i>
                    <p>Keine aktiven Jobangebote zum Vergleichen vorhanden. Füge zuerst Jobs im Kanban-Board hinzu.</p>
                </div>
            `,window.lucide&&lucide.createIcons();return}const i=n.map(s=>{const r=s.ratings||{salary:5,commute:5,remote:5,culture:5,tech:5},a=e.salary+e.commute+e.remote+e.culture+e.tech,o=r.salary*e.salary+r.commute*e.commute+r.remote*e.remote+r.culture*e.culture+r.tech*e.tech,l=Math.round(o/(a*10)*100);return{...s,scorePercent:l,ratings:r}}).sort((s,r)=>r.scorePercent-s.scorePercent);t.innerHTML=`
            <div class="flex-row gap-16" style="overflow-x: auto; padding-bottom: 12px;">
                ${i.map((s,r)=>`
                    <div class="glass-card matrix-col" style="min-width: 260px; padding: 20px; border-top: 4px solid ${r===0?"var(--color-success)":"var(--color-primary)"};">
                        ${r===0?'<span class="badge badge-offer" style="margin-bottom: 8px; display: inline-block;">★ Empfehlung Nr. 1</span>':""}
                        <h4 style="margin: 0; font-size: 1.1rem;">${s.company}</h4>
                        <p class="text-secondary" style="font-size: 0.85rem; margin: 2px 0 12px 0;">${s.title}</p>

                        <div style="font-size: 2rem; font-weight: 800; color: var(--color-primary); margin-bottom: 16px;">
                            ${s.scorePercent}%
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem;">
                            <div class="flex-between"><span>Gehalt:</span><strong>${s.salary?s.salary.toLocaleString("de-DE")+" €":"K.A."}</strong></div>
                            <div class="flex-between"><span>Modell:</span><strong>${s.workMode||"K.A."}</strong></div>
                            <div class="flex-between"><span>Standort:</span><strong>${s.location||"K.A."}</strong></div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `,window.lucide&&lucide.createIcons()},bindSliderEvents(n,e){["salary","commute","remote","culture","tech"].forEach(t=>{const i=n.querySelector(`#slide-w-${t}`),s=n.querySelector(`#lbl-w-${t}`);i&&s&&i.addEventListener("input",r=>{const a=parseInt(r.target.value,10);s.textContent=`x${a}`;const o=y.getWeights();o[t]=a,y.saveWeights(o),this.renderColumns(e,o)})})},renderShowdownTab(n,e){var s,r;if(e.length<2){n.innerHTML=`
                <div class="glass-card empty-state" style="padding: 40px; text-align: center;">
                    <i data-lucide="swords" style="font-size: 3rem; color: var(--color-primary);"></i>
                    <h3>Mindestens 2 Angebote erforderlich</h3>
                    <p class="text-secondary">Für den 1-vs-1 Showdown benötigst du mindestens zwei aktive Jobangebote im Tracker.</p>
                </div>
            `,window.lucide&&lucide.createIcons();return}const t=e.find(a=>a.id===this.showdownJob1Id)||e[0],i=e.find(a=>a.id===this.showdownJob2Id)||e[1];n.innerHTML=`
            <div class="showdown-container">
                <div class="glass-card flex-between align-center" style="padding: 16px; margin-bottom: 20px;">
                    <div style="flex: 1;">
                        <label style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Kandidat 1 (Blau):</label>
                        <select id="showdown-select-1" class="form-input" style="margin-top: 4px;">
                            ${e.map(a=>`<option value="${a.id}" ${a.id===t.id?"selected":""}>${a.company} - ${a.title}</option>`).join("")}
                        </select>
                    </div>

                    <div style="padding: 0 20px; font-weight: 800; font-size: 1.2rem; color: var(--text-secondary);">VS</div>

                    <div style="flex: 1;">
                        <label style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--color-secondary);">Kandidat 2 (Lila):</label>
                        <select id="showdown-select-2" class="form-input" style="margin-top: 4px;">
                            ${e.map(a=>`<option value="${a.id}" ${a.id===i.id?"selected":""}>${a.company} - ${a.title}</option>`).join("")}
                        </select>
                    </div>
                </div>

                <div class="flex-row gap-20" style="margin-bottom: 20px;">
                    <!-- Radar Chart -->
                    <div class="glass-card flex-1" style="padding: 20px; min-height: 320px;">
                        <h4><i data-lucide="radar"></i> Kriterien-Radar Diagramm</h4>
                        <div style="position: relative; height: 260px;">
                            <canvas id="showdown-radar-chart"></canvas>
                        </div>
                    </div>

                    <!-- Direct Stats Comparison -->
                    <div class="glass-card flex-1" style="padding: 20px;">
                        <h4><i data-lucide="list-checks"></i> Direkt-Vergleich</h4>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 0.85rem;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--border-color); text-align: left;">
                                    <th style="padding: 8px;">Kriterium</th>
                                    <th style="padding: 8px; color: var(--color-primary);">${t.company}</th>
                                    <th style="padding: 8px; color: var(--color-secondary);">${i.company}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 8px; font-weight: 600;">Gehalt (Brutto):</td>
                                    <td style="padding: 8px;">${t.salary?t.salary.toLocaleString("de-DE")+" €":"K.A."}</td>
                                    <td style="padding: 8px;">${i.salary?i.salary.toLocaleString("de-DE")+" €":"K.A."}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 8px; font-weight: 600;">Arbeitsmodell:</td>
                                    <td style="padding: 8px;">${t.workMode||"K.A."}</td>
                                    <td style="padding: 8px;">${i.workMode||"K.A."}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 8px; font-weight: 600;">Standort:</td>
                                    <td style="padding: 8px;">${t.location||"K.A."}</td>
                                    <td style="padding: 8px;">${i.location||"K.A."}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.initShowdownChart(t,i),(s=n.querySelector("#showdown-select-1"))==null||s.addEventListener("change",a=>{this.showdownJob1Id=a.target.value,this.renderShowdownTab(n,e)}),(r=n.querySelector("#showdown-select-2"))==null||r.addEventListener("change",a=>{this.showdownJob2Id=a.target.value,this.renderShowdownTab(n,e)})},initShowdownChart(n,e){const t=document.getElementById("showdown-radar-chart");if(!t||!window.Chart)return;this.chartInstance&&this.chartInstance.destroy();const i=n.ratings||{salary:5,commute:5,remote:5,culture:5,tech:5},s=e.ratings||{salary:5,commute:5,remote:5,culture:5,tech:5};this.chartInstance=new Chart(t,{type:"radar",data:{labels:["Gehalt","Pendelzeit","Homeoffice","Kultur","Tech-Stack"],datasets:[{label:n.company,data:[i.salary,i.commute,i.remote,i.culture,i.tech],borderColor:"#6366f1",backgroundColor:"rgba(99, 102, 241, 0.2)"},{label:e.company,data:[s.salary,s.commute,s.remote,s.culture,s.tech],borderColor:"#8b5cf6",backgroundColor:"rgba(139, 92, 246, 0.2)"}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{r:{min:0,max:10,ticks:{stepSize:2}}}}})}},B={getApiKey(){return localStorage.getItem("jobmatch_gemini_api_key")||null},setApiKey(n){n&&n.trim()?localStorage.setItem("jobmatch_gemini_api_key",n.trim()):localStorage.removeItem("jobmatch_gemini_api_key")},hasApiKey(){const n=this.getApiKey();return!!(n&&n.length>10)},async generateText(n,e=""){var i,s,r,a,o,l;const t=this.getApiKey();if(!t)return console.log("Gemini API Key not set. Falling back to mockAi."),null;try{const d=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${t}`,u={contents:[{parts:[{text:n}]}]};e&&(u.systemInstruction={parts:[{text:e}]});const c=await fetch(d,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(u)});if(!c.ok){const v=await c.json().catch(()=>({}));throw new Error(((i=v.error)==null?void 0:i.message)||`Gemini API HTTP Error ${c.status}`)}const b=(l=(o=(a=(r=(s=(await c.json()).candidates)==null?void 0:s[0])==null?void 0:r.content)==null?void 0:a.parts)==null?void 0:o[0])==null?void 0:l.text;if(b)return b.trim();throw new Error("No text candidate returned from Gemini API")}catch(d){return console.warn("Gemini API call failed:",d),null}},async generateCoverLetter(n,e,t,i,s="klassisch"){if(this.hasApiKey()){const r=`Erstelle ein professionelles deutsches Anschreiben für die Stelle "${n}" bei "${e}".
Bewerber-Profil:
- Name: ${i.name||"Bewerber/in"}
- Berufstitel: ${i.title||"Fachkraft"}
- Hauptkompetenzen: ${i.skills?i.skills.join(", "):"keine Angaben"}
- Zusammenfassung: ${i.summary||""}

Stellenbeschreibung:
${t||"Keine nähere Beschreibung angegeben."}

Tonalität: ${s} (z.B. klassisch, kreativ & modern, oder kurzer pitch).
Formatiere das Anschreiben übersichtlich mit Betreff, Anrede, Einleitung, Hauptteil (Warum diese Stelle & Match der Skills), Schlusssatz und Grußformel.`,a=await this.generateText(r,"Du bist ein erfahrener Karriereberater und Experte für professionelle Bewerbungsunterlagen.");if(a)return a}return A.generateCoverLetter(n,e,t,i,s)},async analyzeJobMatch(n,e=[]){if(this.hasApiKey()){const t=`Analysiere das folgende Stellenangebot und vergleiche es mit den Skills des Bewerbers.
Bewerber-Skills: ${e.join(", ")}

Stellenbeschreibung:
${n}

Antworte ausschließlich in folgendem JSON-Format (kein Markdown drumherum, nur valides JSON):
{
  "matchScore": 85,
  "matchingSkills": ["Skill1", "Skill2"],
  "missingSkills": ["Skill3"],
  "insights": "Kurze prägnante Analyse..."
}`,i=await this.generateText(t);if(i)try{const s=i.replace(/```json/g,"").replace(/```/g,"").trim();return JSON.parse(s)}catch(s){console.warn("Failed to parse Gemini JSON response:",s)}}return A.analyzeJobMatch(n,e)}};function He(n,e,t,i="din5008"){const s=window.open("","_blank");if(!s){alert("Bitte erlaube Pop-Ups für diese Seite, um den PDF-Export zu starten.");return}const r=new Date().toLocaleDateString("de-DE"),o=`hsl(${n.themePrimaryHue||239}, 65%, 45%)`;let l="",d="";i==="modern"?(l=`
            @page {
                size: A4;
                margin: 20mm 20mm 20mm 20mm;
            }
            body {
                font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
                font-size: 10.5pt;
                line-height: 1.6;
                color: #2c3e50;
                margin: 20mm;
            }
            .header-accent {
                height: 4px;
                background-color: ${o};
                margin-bottom: 25px;
            }
            .header-grid {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }
            .sender-info {
                text-align: right;
                font-size: 9pt;
                color: #666;
            }
            .sender-name {
                font-size: 14pt;
                font-weight: 700;
                color: ${o};
                display: block;
                margin-bottom: 4px;
            }
            .recipient-info {
                font-size: 10pt;
                color: #333;
                border-left: 3px solid ${o};
                padding-left: 12px;
            }
            .meta-row {
                display: flex;
                justify-content: space-between;
                font-size: 9.5pt;
                color: #7f8c8d;
                border-bottom: 1px solid #ecf0f1;
                padding-bottom: 8px;
                margin-bottom: 25px;
            }
            .subject-line {
                font-weight: 800;
                font-size: 14pt;
                color: #2c3e50;
                margin-bottom: 20px;
            }
            .letter-content {
                white-space: pre-wrap;
                text-align: justify;
                color: #2c3e50;
            }
            .footer {
                margin-top: 25px;
                border-top: 1px solid #ecf0f1;
                padding-top: 15px;
            }
            .signature-space {
                height: 12mm;
            }
        `,d=`
            <div class="header-accent"></div>
            <div class="header-grid">
                <div class="recipient-info">
                    <strong>${e.company}</strong><br>
                    ${e.contact?`z. Hd. ${e.contact}<br>`:"Personalabteilung<br>"}
                    ${e.location||"Deutschland"}
                </div>
                <div class="sender-info">
                    <span class="sender-name">${n.name||"Max Mustermann"}</span>
                    ${n.title||"Webentwickler"}<br>
                    ${n.experience?n.experience.split(`
`)[0].replace(/^-\s*/,""):""}
                </div>
            </div>
            
            <div class="meta-row">
                <span>Bewerbungsschreiben</span>
                <span>${e.location?e.location.split("/")[0].trim():"Ort"}, den ${r}</span>
            </div>
            
            <div class="subject-line">
                Bewerbung als ${e.title}
            </div>
            
            <div class="letter-content">${t}</div>
            
            <div class="footer">
                Mit freundlichen Grüßen,<br>
                <div class="signature-space"></div>
                <strong>${n.name||"Max Mustermann"}</strong>
            </div>
        `):i==="elegant"?(l=`
            @page {
                size: A4;
                margin: 25mm 25mm 25mm 25mm;
            }
            body {
                font-family: Georgia, 'Times New Roman', Times, serif;
                font-size: 11pt;
                line-height: 1.6;
                color: #1a1a1a;
                margin: 25mm;
            }
            .sender-header {
                text-align: center;
                border-bottom: 2px double #888;
                padding-bottom: 15px;
                margin-bottom: 25px;
            }
            .sender-name {
                font-size: 18pt;
                font-family: Georgia, serif;
                letter-spacing: 1px;
                text-transform: uppercase;
                display: block;
                font-weight: normal;
                color: #111;
            }
            .sender-subtitle {
                font-size: 10pt;
                font-style: italic;
                color: #555;
            }
            .recipient-and-date {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-bottom: 25px;
                font-size: 10pt;
            }
            .recipient-info {
                line-height: 1.4;
            }
            .date-line {
                font-style: italic;
            }
            .subject-line {
                font-family: Georgia, serif;
                font-size: 13pt;
                font-style: italic;
                border-bottom: 1px solid #ddd;
                padding-bottom: 6px;
                margin-bottom: 20px;
            }
            .letter-content {
                white-space: pre-wrap;
                text-align: justify;
            }
            .footer {
                margin-top: 30px;
                page-break-inside: avoid;
            }
            .signature-space {
                height: 15mm;
            }
        `,d=`
            <div class="sender-header">
                <span class="sender-name">${n.name||"Max Mustermann"}</span>
                <span class="sender-subtitle">
                    ${n.title||"Webentwickler"} &nbsp;|&nbsp; 
                    ${n.experience?n.experience.split(`
`)[0].replace(/^-\s*/,""):""}
                </span>
            </div>
            
            <div class="recipient-and-date">
                <div class="recipient-info">
                    <strong>${e.company}</strong><br>
                    ${e.contact?`z. Hd. ${e.contact}<br>`:"Personalabteilung<br>"}
                    ${e.location||"Deutschland"}
                </div>
                <div class="date-line">
                    ${e.location?e.location.split("/")[0].trim():"Ort"}, den ${r}
                </div>
            </div>
            
            <div class="subject-line">
                Bewerbung um die Position als ${e.title}
            </div>
            
            <div class="letter-content">${t}</div>
            
            <div class="footer">
                Mit vorzüglicher Hochachtung,<br>
                <div class="signature-space"></div>
                <strong>${n.name||"Max Mustermann"}</strong>
            </div>
        `):(l=`
            @page {
                size: A4;
                margin: 0;
            }
            body {
                font-family: Arial, Helvetica, sans-serif;
                font-size: 11pt;
                line-height: 1.5;
                color: #000000;
                margin: 20mm 20mm 20mm 25mm;
                box-sizing: border-box;
            }
            .sender-info {
                text-align: right;
                margin-bottom: 25mm;
                font-size: 9pt;
                color: #444444;
            }
            .sender-name {
                font-size: 11pt;
                font-weight: bold;
                color: #000000;
            }
            .recipient-info {
                height: 45mm;
                margin-bottom: 12mm;
                font-size: 10pt;
            }
            .date-line {
                text-align: right;
                margin-bottom: 15mm;
            }
            .subject-line {
                font-weight: bold;
                font-size: 12pt;
                margin-bottom: 10mm;
            }
            .letter-content {
                white-space: pre-wrap;
                text-align: justify;
            }
            .footer {
                margin-top: 15mm;
            }
            .signature-space {
                height: 15mm;
            }
            @media print {
                body {
                    margin: 20mm 20mm 20mm 25mm;
                }
            }
        `,d=`
            <div class="sender-info">
                <span class="sender-name">${n.name||"Max Mustermann"}</span><br>
                ${n.title||"Webentwickler"}<br>
                ${n.experience?n.experience.split(`
`)[0].replace(/^-\s*/,""):""}
            </div>
            
            <div class="recipient-info">
                <strong>${e.company}</strong><br>
                ${e.contact?`z. Hd. ${e.contact}<br>`:"Personalabteilung<br>"}
                ${e.location||"Deutschland"}
            </div>
            
            <div class="date-line">
                ${e.location?e.location.split("/")[0].trim():"Ort"}, den ${r}
            </div>
            
            <div class="subject-line">
                Bewerbung als ${e.title}
            </div>
            
            <div class="letter-content">${t}</div>
            
            <div class="footer">
                Mit freundlichen Grüßen,<br>
                <div class="signature-space"></div>
                <strong>${n.name||"Max Mustermann"}</strong>
            </div>
        `),s.document.write(`
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>Bewerbungsschreiben - ${n.name||"Bewerber"}</title>
            <style>
                ${l}
            </style>
        </head>
        <body>
            ${d}
        </body>
        </html>
    `),s.document.close(),s.focus(),setTimeout(()=>{s.print(),s.close()},500)}const he={render(n,e,t){const i=B.hasApiKey();n.innerHTML=`
            <div class="cover-letter-gen-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <h3>Anschreiben-Generator ${i?'<span class="badge badge-offer">Gemini Live AI</span>':'<span class="badge badge-saved">Offline AI</span>'}</h3>
                    <div class="tone-selector flex-row align-center" style="gap: 8px;">
                        <label style="font-size: 0.85rem; font-weight: 600;">Tonalität:</label>
                        <select id="cover-letter-tone" class="form-input" style="padding: 4px 8px; width: auto;">
                            <option value="klassisch">Klassisch & Professionell</option>
                            <option value="kreativ">Kreativ & Modern</option>
                            <option value="kurz">Kurzer Pitch (E-Mail)</option>
                        </select>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 16px;">
                    <textarea id="cover-letter-output" rows="12" class="form-input" style="font-family: monospace; font-size: 0.9rem; line-height: 1.5;" placeholder="Generiere ein maßgeschneidertes Anschreiben..."></textarea>
                </div>

                <div class="action-bar flex-between align-center">
                    <button class="btn btn-primary" id="btn-generate-cover-letter">
                        <i data-lucide="sparkles"></i> Anschreiben generieren
                    </button>
                    <div class="flex-row" style="gap: 8px;">
                        <button class="btn btn-secondary" id="btn-copy-cover-letter">
                            <i data-lucide="copy"></i> Kopieren
                        </button>
                        <button class="btn btn-secondary" id="btn-download-pdf">
                            <i data-lucide="download"></i> Als PDF herunterladen
                        </button>
                    </div>
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(n,e,t)},bindEvents(n,e,t){const i=n.querySelector("#btn-generate-cover-letter"),s=n.querySelector("#cover-letter-output"),r=n.querySelector("#cover-letter-tone");i&&s&&i.addEventListener("click",async()=>{i.disabled=!0,i.innerHTML='<i data-lucide="loader" class="spin"></i> Generiere Anschreiben...',window.lucide&&lucide.createIcons();const l=r?r.value:"klassisch",d=await B.generateCoverLetter(e.title,e.company,e.description,t,l);s.value=d,i.disabled=!1,i.innerHTML='<i data-lucide="sparkles"></i> Anschreiben generieren',window.lucide&&lucide.createIcons()});const a=n.querySelector("#btn-copy-cover-letter");a&&s&&a.addEventListener("click",()=>{s.value&&(navigator.clipboard.writeText(s.value),a.textContent="Kopiert!",setTimeout(()=>{a.innerHTML='<i data-lucide="copy"></i> Kopieren',window.lucide&&lucide.createIcons()},2e3))});const o=n.querySelector("#btn-download-pdf");o&&s&&o.addEventListener("click",()=>{const l=s.value;l&&He(t,e,l)})}},ee={recognition:null,isListening:!1,isSupported(){return!!(window.SpeechRecognition||window.webkitSpeechRecognition)},start(n="de-DE",e,t){if(!this.isSupported())return t&&t("Spracherkennung wird in diesem Browser nicht unterstützt."),!1;const i=window.SpeechRecognition||window.webkitSpeechRecognition;return this.recognition=new i,this.recognition.continuous=!0,this.recognition.interimResults=!0,this.recognition.lang=n,this.recognition.onresult=s=>{let r="",a="";for(let o=s.resultIndex;o<s.results.length;++o)s.results[o].isFinal?r+=s.results[o][0].transcript:a+=s.results[o][0].transcript;e&&e({finalText:r,interimText:a})},this.recognition.onerror=s=>{console.warn("SpeechRecognition Fehler:",s.error),t&&t(s.error)},this.recognition.onend=()=>{this.isListening=!1},this.recognition.start(),this.isListening=!0,!0},stop(){this.recognition&&this.isListening&&(this.recognition.stop(),this.isListening=!1)}},be={questions:[],currentIndex:0,userAnswers:[],scores:[],startTime:null,init(n,e){this.questions=A.generateInterviewQuestions(n.title,e.skills),this.currentIndex=0,this.userAnswers=[],this.scores=[],this.startTime=Date.now()},renderCurrentQuestion(n){if(!this.questions||this.questions.length===0)return;const e=this.questions[this.currentIndex];n.innerHTML=`
            <div class="interview-sim-box">
                <div class="sim-header flex-between align-center" style="margin-bottom: 16px;">
                    <span class="badge badge-primary">Frage ${this.currentIndex+1} von ${this.questions.length}</span>
                    <button class="btn btn-secondary btn-sm" id="btn-speak-question">
                        <i data-lucide="volume-2"></i> Vorlesen
                    </button>
                </div>

                <h3 class="question-text" style="margin-bottom: 20px; font-size: 1.25rem;">${e}</h3>

                <div class="form-group">
                    <label style="font-weight: 600;">Deine Antwort (oder Einsprechen):</label>
                    <textarea id="sim-answer-input" rows="5" class="form-input" placeholder="Verwende die STAR-Methode (Situation, Task, Action, Result)...">${this.userAnswers[this.currentIndex]||""}</textarea>
                </div>

                <div class="action-buttons flex-between align-center" style="margin-top: 16px;">
                    <button class="btn btn-secondary" id="btn-mic-toggle">
                        <i data-lucide="mic"></i> <span id="mic-status-label">Antwort einsprechen</span>
                    </button>

                    <button class="btn btn-primary" id="btn-submit-answer">
                        ${this.currentIndex<this.questions.length-1?"Nächste Frage":"Ergebnis & STAR-Feedback auswerten"}
                    </button>
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(n)},bindEvents(n){const e=n.querySelector("#btn-speak-question");e&&e.addEventListener("click",()=>{const r=this.questions[this.currentIndex];if("speechSynthesis"in window){const a=window.speechSynthesis;a.cancel();const o=new SpeechSynthesisUtterance(r);o.lang="de-DE",a.speak(o)}});const t=n.querySelector("#btn-mic-toggle"),i=n.querySelector("#sim-answer-input");t&&i&&t.addEventListener("click",()=>{ee.isListening?(ee.stop(),t.classList.remove("btn-danger"),n.querySelector("#mic-status-label").textContent="Antwort einsprechen"):(ee.start(r=>{i.value+=(i.value?" ":"")+r},()=>{t.classList.remove("btn-danger"),n.querySelector("#mic-status-label").textContent="Antwort einsprechen"}),t.classList.add("btn-danger"),n.querySelector("#mic-status-label").textContent="Aufnahme stoppen...")});const s=n.querySelector("#btn-submit-answer");s&&i&&s.addEventListener("click",()=>{const r=i.value.trim();this.userAnswers[this.currentIndex]=r;const a=A.evaluateInterviewAnswer(r);this.scores.push(a),this.currentIndex<this.questions.length-1?(this.currentIndex++,this.renderCurrentQuestion(n)):this.renderSummary(n)})},analyzeSpeechQuality(){const n=this.userAnswers.join(" ").toLowerCase(),e=n.split(/\s+/).filter(a=>a.length>0).length,t=["äh","ähm","halt","sozusagen","quasi","eigentlich","irgendwie","also"];let i=0;t.forEach(a=>{const o=new RegExp(`\\b${a}\\b`,"gi"),l=n.match(o);l&&(i+=l.length)});const s=Math.max(.5,(Date.now()-(this.startTime||Date.now()))/6e4),r=Math.round(e/s);return{totalWords:e,fillerCount:i,wpm:r,paceRating:r>160?"Zu schnell (Hektisch)":r<90?"Etwas langsam":"Optimales Sprechtempo (110-140 WPM)"}},renderSummary(n){var i;const e=Math.round(this.scores.reduce((s,r)=>s+r.score,0)/(this.scores.length||1)),t=this.analyzeSpeechQuality();n.innerHTML=`
            <div class="interview-summary-card">
                <h3><i data-lucide="award"></i> Simulation Abgeschlossen!</h3>
                
                <div class="score-overview flex-row align-center" style="margin: 20px 0; gap: 20px;">
                    <div class="overall-circle" style="font-size: 2rem; font-weight: 800; color: var(--color-primary);">
                        ${e} / 100
                    </div>
                    <div>
                        <p style="font-weight: 600; margin-bottom: 4px;">Dein STAR-Methoden Score</p>
                        <p class="text-secondary" style="font-size: 0.85rem;">
                            ${e>=75?"Hervorragend! Du hast Situation, Aufgabe, Handlung und Ergebnis klar dargestellt.":"Guter Ansatz. Tipp: Strukturiere deine Antworten noch stärke nach der STAR-Methode."}
                        </p>
                    </div>
                </div>

                <!-- Voice Coach Speech Analysis Card -->
                <div class="glass-card" style="padding: 20px; margin-bottom: 24px; border: 1px solid var(--color-primary);">
                    <h4><i data-lucide="mic"></i> AI Voice Coach - Sprechanalyse</h4>
                    <div class="flex-row gap-16" style="margin-top: 12px;">
                        <div style="flex: 1;">
                            <span class="text-secondary" style="font-size: 0.8rem; display: block;">Geschätztes Sprechtempo:</span>
                            <strong style="font-size: 1.1rem; color: var(--color-primary);">${t.wpm} WPM</strong>
                            <p class="text-muted" style="font-size: 0.75rem; margin-top: 2px;">${t.paceRating}</p>
                        </div>
                        <div style="flex: 1;">
                            <span class="text-secondary" style="font-size: 0.8rem; display: block;">Erkannte Füllwörter:</span>
                            <strong style="font-size: 1.1rem; color: ${t.fillerCount>4?"var(--color-danger)":"var(--color-success)"};">${t.fillerCount} Mal</strong>
                            <p class="text-muted" style="font-size: 0.75rem; margin-top: 2px;">(${t.fillerCount===0?"Perfekt! Keine Füllwörter erkannt.":'z.B. "äh", "halt", "sozusagen"'})</p>
                        </div>
                    </div>
                </div>

                <div class="question-feedback-list" style="margin-bottom: 24px;">
                    ${this.questions.map((s,r)=>{var a,o;return`
                        <div class="glass-card" style="padding: 16px; margin-bottom: 12px;">
                            <p style="font-weight: 600;">Q${r+1}: ${s}</p>
                            <p class="text-muted" style="font-size: 0.85rem; margin: 4px 0;">Deine Antwort: "${this.userAnswers[r]||"Keine Antwort"}"</p>
                            <span class="badge ${((a=this.scores[r])==null?void 0:a.score)>=70?"badge-applied":"badge-saved"}">Score: ${((o=this.scores[r])==null?void 0:o.score)||50}/100</span>
                        </div>
                    `}).join("")}
                </div>

                <button class="btn btn-primary" id="btn-restart-sim">
                    <i data-lucide="rotate-ccw"></i> Neue Simulation starten
                </button>
            </div>
        `,window.lucide&&lucide.createIcons(),(i=n.querySelector("#btn-restart-sim"))==null||i.addEventListener("click",()=>{this.currentIndex=0,this.userAnswers=[],this.scores=[],this.startTime=Date.now(),this.renderCurrentQuestion(n)})}},Je={projects:[{title:"High-Performance E-Commerce Storefront",tech:["React","TypeScript","Next.js","TailwindCSS","GraphQL"],role:"Lead Frontend Developer",problem:"Lange Ladezeiten (LCP > 4.2s) und hohe Absprungraten im Checkout-Prozess.",solution:"Migration auf Server-Side Rendering (SSR), Bild-Optimierung und modulares State Management.",impact:"Ladezeiten um 45% reduziert, Conversion-Rate um +18% gesteigert, Core Web Vitals im grünen Bereich."},{title:"Design System & Component Library",tech:["Figma","Storybook","Web Components","CSS Grid","Jest"],role:"UI/UX Engineer",problem:"Inkonsistente UI-Elemente und doppelte Entwicklungsaufwände über 4 Plattformen hinweg.",solution:"Aufbau einer zentralen barrierefreien Komponentenbibliothek mit automatisierter CI/CD-Pipeline.",impact:"Entwicklungszeit für neue Features um 30% verkürzt, 100% WCAG 2.1 AA Barrierefreiheit erreicht."}],render(n,e,t){n.innerHTML=`
            <div class="showcase-builder-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="folder-git-2"></i> Projekt-Showcase &amp; Portfolio-Case-Studies</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Dokumentiere deine stärksten Praxisprojekte mit Vorher-Nachher-Metriken für Tech-Interviews.
                        </p>
                    </div>
                    <div class="flex-row gap-8">
                        <button class="btn btn-secondary btn-sm" id="btn-add-showcase-project">
                            <i data-lucide="plus"></i> Neues Projekt
                        </button>
                        <button class="btn btn-primary btn-sm" id="btn-print-showcase">
                            <i data-lucide="printer"></i> Showcase drucken / PDF
                        </button>
                    </div>
                </div>

                <div id="showcase-projects-list" style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 20px;">
                    ${this.projects.map((i,s)=>`
                        <div class="glass-card" style="padding: 20px; border-left: 4px solid var(--color-primary); background: rgba(0,0,0,0.2);">
                            <div class="flex-between align-center" style="margin-bottom: 12px;">
                                <div>
                                    <h4 style="margin: 0; font-size: 1.1rem; color: #ffffff;">${i.title}</h4>
                                    <span style="font-size: 0.8rem; color: #38bdf8; font-weight: 600;">Rolle: ${i.role}</span>
                                </div>
                                <button class="btn btn-danger btn-sm btn-delete-project" data-idx="${s}" style="padding: 4px 8px;">
                                    <i data-lucide="trash-2"></i>
                                </button>
                            </div>

                            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">
                                ${i.tech.map(r=>`<span class="badge badge-saved" style="font-size: 0.75rem;">${r}</span>`).join("")}
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 14px; font-size: 0.85rem; line-height: 1.5;">
                                <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: 6px;">
                                    <strong style="color: var(--color-warning); display: block; margin-bottom: 4px;">⚡ Problem / Ausgangslage:</strong>
                                    <span style="color: #cbd5e1;">${i.problem}</span>
                                </div>
                                <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: 6px;">
                                    <strong style="color: var(--color-primary); display: block; margin-bottom: 4px;">🛠️ Lösung &amp; Architektur:</strong>
                                    <span style="color: #cbd5e1;">${i.solution}</span>
                                </div>
                                <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); padding: 12px; border-radius: 6px;">
                                    <strong style="color: var(--color-success); display: block; margin-bottom: 4px;">📈 Erreichte Metriken / Impact:</strong>
                                    <span style="color: #ffffff;">${i.impact}</span>
                                </div>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(n,e,t)},bindEvents(n,e,t){var i,s;(i=n.querySelector("#btn-add-showcase-project"))==null||i.addEventListener("click",()=>{const r=prompt("Projekttitel:","Neues Kundenprojekt");if(!r)return;const a=prompt("Tech-Stack (kommagetrennt):","Vue.js, Node.js, Docker"),o=prompt("Ausgangssituation / Herausforderung:","Skalierungsprobleme der API"),l=prompt("Deine technische Lösung:","Einführung von Redis-Caching & Microservices"),d=prompt("Messbares Ergebnis / Erfolg:","Latenz um 50% gesenkt");this.projects.push({title:r,tech:a?a.split(",").map(u=>u.trim()):[],role:t.title||"Developer",problem:o||"Keine Angabe",solution:l||"Keine Angabe",impact:d||"Keine Angabe"}),this.render(n,e,t)}),n.querySelectorAll(".btn-delete-project").forEach(r=>{r.addEventListener("click",()=>{const a=parseInt(r.getAttribute("data-idx"),10);this.projects.splice(a,1),this.render(n,e,t)})}),(s=n.querySelector("#btn-print-showcase"))==null||s.addEventListener("click",()=>{const r=window.open("","_blank");if(!r){alert("Pop-Ups erlauben.");return}const a=this.projects.map(o=>`
                <div style="margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h3 style="margin: 0 0 4px 0; color: #0f172a; font-size: 16px;">${o.title}</h3>
                            <div style="color: #0284c7; font-weight: 600; font-size: 13px;">${o.role}</div>
                        </div>
                        <div style="font-size: 12px; color: #64748b;">${o.tech.join(" • ")}</div>
                    </div>
                    <div style="margin-top: 10px; font-size: 13px; color: #334155; line-height: 1.5;">
                        <p><strong>Problem:</strong> ${o.problem}</p>
                        <p><strong>Lösung:</strong> ${o.solution}</p>
                        <p style="color: #047857; font-weight: 600;"><strong>Ergebnis:</strong> ${o.impact}</p>
                    </div>
                </div>
            `).join("");r.document.write(`
                <!DOCTYPE html>
                <html lang="de">
                <head>
                    <meta charset="UTF-8">
                    <title>Projekt-Portfolio - ${t.name||"Bewerber"}</title>
                    <style>
                        @page { size: A4; margin: 15mm; }
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 20px; }
                    </style>
                </head>
                <body>
                    <h1 style="font-size: 22px; color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 8px; margin-bottom: 20px;">
                        Projekt-Showcase &amp; Technische Case Studies &ndash; ${t.name||"Bewerber"}
                    </h1>
                    ${a}
                    <script>
                        window.onload = () => { window.print(); window.close(); };
                    <\/script>
                </body>
                </html>
            `),r.document.close()})}},qe={employerName:"Aktueller Arbeitgeber GmbH",employerAddress:`Musterstraße 123
80333 München`,noticeType:"end_of_month",render(n,e,t){const i=t.name||"Alex Neumann",s=new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"});n.innerHTML=`
            <div class="resignation-gen-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="file-minus"></i> Rechtskonformer Kündigungsschreiben-Generator</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Erstelle ein formell einwandfreies Kündigungsschreiben mit Zeugnis-Aufforderung nach DIN 5008.
                        </p>
                    </div>
                    <button class="btn btn-primary" id="btn-print-resignation">
                        <i data-lucide="printer"></i> Schreiben drucken / PDF
                    </button>
                </div>

                <div class="glass-card" style="padding: 24px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px;">
                    <!-- Settings -->
                    <div>
                        <h4 style="margin: 0 0 14px 0; font-size: 0.95rem;">Empfänger &amp; Fristen:</h4>
                        
                        <div class="form-group" style="margin-bottom: 12px;">
                            <label style="font-size: 0.85rem; font-weight: 600;">Arbeitgeber Name:</label>
                            <input type="text" id="resig-emp-name" class="form-input" value="${this.employerName}">
                        </div>

                        <div class="form-group" style="margin-bottom: 12px;">
                            <label style="font-size: 0.85rem; font-weight: 600;">Arbeitgeber Adresse:</label>
                            <textarea id="resig-emp-addr" rows="2" class="form-input">${this.employerAddress}</textarea>
                        </div>

                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="font-size: 0.85rem; font-weight: 600;">Kündigungstermin:</label>
                            <select id="resig-notice-select" class="form-input">
                                <option value="end_of_month">Zum nächstmöglichen Monatsende</option>
                                <option value="mid_month">Zum 15. des nächsten Monats</option>
                                <option value="custom">Fristgerecht zum Ablauf der Probezeit</option>
                            </select>
                        </div>

                        <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99,102,241,0.2); padding: 12px; border-radius: 8px; font-size: 0.8rem; line-height: 1.5; color: #cbd5e1;">
                            ⚖️ <strong>Wichtiger Rechtshinweis:</strong> Kündigungen im deutschen Arbeitsrecht bedürfen zwingend der <strong>Schriftform (§ 623 BGB)</strong> mit eigenhändiger Unterschrift (keine E-Mail!).
                        </div>
                    </div>

                    <!-- DIN 5008 Preview -->
                    <div id="resignation-preview-box" style="background: #ffffff; color: #1e293b; padding: 24px; border-radius: 8px; font-size: 0.85rem; line-height: 1.6; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <div style="font-size: 0.75rem; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 16px;">
                            ${i} &bull; Musterweg 12 &bull; 80000 München
                        </div>

                        <div id="preview-emp-addr" style="margin-bottom: 24px; font-weight: 500;">
                            ${this.employerName}<br>${this.employerAddress.replace(/\n/g,"<br>")}
                        </div>

                        <div style="text-align: right; margin-bottom: 20px; color: #64748b; font-size: 0.8rem;">
                            München, den ${s}
                        </div>

                        <div style="font-weight: 700; font-size: 1rem; margin-bottom: 16px; color: #0f172a;">
                            Kündigung meines Arbeitsvertrages
                        </div>

                        <p style="margin: 0 0 12px 0;">Sehr geehrte Damen und Herren,</p>

                        <p style="margin: 0 0 12px 0;">
                            hiermit kündige ich das zwischen uns bestehende Arbeitsverhältnis unter Einhaltung der vertraglich vereinbarten Kündigungsfrist ordentlich und fristgerecht zum <strong>${this.getTerminationDateString(this.noticeType)}</strong>, hilfsweise zum nächstmöglichen Zeitpunkt.
                        </p>

                        <p style="margin: 0 0 12px 0;">
                            Ich bedanke mich herzlich für die angenehme Zusammenarbeit und die Unterstützung während meiner Beschäftigung in Ihrem Hause.
                        </p>

                        <p style="margin: 0 0 12px 0;">
                            Bitte bestätigen Sie mir den Erhalt dieses Schreibens sowie das genaue Beendigungsdatum schriftlich. Zudem bitte ich Sie um die Ausstellung eines qualifizierten, wohlwollenden Arbeitszeugnisses.
                        </p>

                        <p style="margin: 24px 0 36px 0;">
                            Mit freundlichen Grüßen,<br><br><br>
                            ___________________________________<br>
                            ${i}
                        </p>
                    </div>
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(n,e,t)},getTerminationDateString(n){const e=new Date;return n==="end_of_month"?new Date(e.getFullYear(),e.getMonth()+2,0).toLocaleDateString("de-DE"):n==="mid_month"?`15.${String(e.getMonth()+2).padStart(2,"0")}.${e.getFullYear()}`:"nächstmöglichen Termin"},bindEvents(n,e,t){var o;const i=n.querySelector("#resig-emp-name"),s=n.querySelector("#resig-emp-addr"),r=n.querySelector("#resig-notice-select"),a=()=>{this.employerName=i.value,this.employerAddress=s.value,this.noticeType=r.value,this.render(n,e,t)};i==null||i.addEventListener("input",a),s==null||s.addEventListener("input",a),r==null||r.addEventListener("change",a),(o=n.querySelector("#btn-print-resignation"))==null||o.addEventListener("click",()=>{const l=window.open("","_blank");if(!l){alert("Pop-Ups erlauben.");return}const d=n.querySelector("#resignation-preview-box").innerHTML;l.document.write(`
                <!DOCTYPE html>
                <html lang="de">
                <head>
                    <meta charset="UTF-8">
                    <title>Kündigungsschreiben</title>
                    <style>
                        @page { size: A4; margin: 20mm; }
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 20px; line-height: 1.6; }
                    </style>
                </head>
                <body>
                    ${d}
                    <script>
                        window.onload = () => { window.print(); window.close(); };
                    <\/script>
                </body>
                </html>
            `),l.document.close()})}},fe={isPlaying:!1,currentIndex:0,pauseSeconds:20,timerId:null,timeRemaining:0,questions:[],init(n,e){this.questions=A.generateInterviewQuestions((n==null?void 0:n.title)||"Entwickler",e.skills||[]),this.currentIndex=0,this.isPlaying=!1,this.stopTimer()},render(n,e,t){(!this.questions||this.questions.length===0)&&this.init(e,t);const i=this.questions[this.currentIndex]||"Keine Frage verfügbar.";n.innerHTML=`
            <div class="audio-drill-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="headphones"></i> Audio-Interview-Trainer &amp; Podcast-Drill</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Hands-Free Interview-Training für unterwegs: Fragen werden vorgelesen mit automatischer Antwortpause.
                        </p>
                    </div>
                    <div class="flex-row gap-8 align-center">
                        <label style="font-size: 0.85rem; font-weight: 600;">Antwortzeit:</label>
                        <select id="audio-drill-pause-select" class="form-input" style="padding: 4px 8px; width: auto;">
                            <option value="15" ${this.pauseSeconds===15?"selected":""}>15 Sekunden</option>
                            <option value="20" ${this.pauseSeconds===20?"selected":""}>20 Sekunden</option>
                            <option value="30" ${this.pauseSeconds===30?"selected":""}>30 Sekunden</option>
                            <option value="45" ${this.pauseSeconds===45?"selected":""}>45 Sekunden</option>
                        </select>
                    </div>
                </div>

                <div class="glass-card" style="padding: 30px; text-align: center; margin-bottom: 20px; background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(0,0,0,0.2)); border: 1px solid var(--border-color);">
                    <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase; margin-bottom: 10px;">
                        Frage ${this.currentIndex+1} von ${this.questions.length}
                    </div>

                    <h2 id="audio-drill-question-text" style="font-size: 1.35rem; line-height: 1.5; color: var(--text-primary); margin: 0 0 20px 0; min-height: 70px;">
                        "${i}"
                    </h2>

                    <div style="display: flex; justify-content: center; align-items: center; gap: 16px; margin-bottom: 20px;">
                        <div id="audio-drill-timer-display" style="font-size: 2rem; font-family: monospace; font-weight: 800; color: ${this.timeRemaining>0?"var(--color-warning)":"var(--text-secondary)"};">
                            ${this.timeRemaining>0?`⏱ ${this.timeRemaining}s Antwortpause`:"Bereit"}
                        </div>
                    </div>

                    <!-- Audio Controls -->
                    <div class="audio-controls-row flex-row-center gap-16">
                        <button class="btn btn-secondary" id="btn-audio-prev" ${this.currentIndex===0?"disabled":""}>
                            <i data-lucide="skip-back"></i> Vorherige
                        </button>
                        <button class="btn ${this.isPlaying?"btn-danger":"btn-primary"}" id="btn-audio-play-toggle" style="padding: 10px 24px; font-size: 1rem;">
                            <i data-lucide="${this.isPlaying?"pause":"play"}"></i> ${this.isPlaying?"Training Pausieren":"Drill Starten"}
                        </button>
                        <button class="btn btn-secondary" id="btn-audio-repeat" title="Aktuelle Frage wiederholen">
                            <i data-lucide="rotate-cw"></i> Wiederholen
                        </button>
                        <button class="btn btn-secondary" id="btn-audio-next" ${this.currentIndex>=this.questions.length-1?"disabled":""}>
                            Nächste <i data-lucide="skip-forward"></i>
                        </button>
                    </div>
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(n,e,t)},bindEvents(n,e,t){var r,a,o;const i=n.querySelector("#audio-drill-pause-select");i&&i.addEventListener("change",l=>{this.pauseSeconds=parseInt(l.target.value,10)});const s=n.querySelector("#btn-audio-play-toggle");s&&s.addEventListener("click",()=>{this.isPlaying?this.pauseDrill(n,e,t):this.startDrill(n,e,t)}),(r=n.querySelector("#btn-audio-prev"))==null||r.addEventListener("click",()=>{this.currentIndex>0&&(this.currentIndex--,this.stopTimer(),this.render(n,e,t),this.isPlaying&&this.playCurrentQuestion(n,e,t))}),(a=n.querySelector("#btn-audio-next"))==null||a.addEventListener("click",()=>{this.currentIndex<this.questions.length-1&&(this.currentIndex++,this.stopTimer(),this.render(n,e,t),this.isPlaying&&this.playCurrentQuestion(n,e,t))}),(o=n.querySelector("#btn-audio-repeat"))==null||o.addEventListener("click",()=>{this.playCurrentQuestion(n,e,t)})},startDrill(n,e,t){this.isPlaying=!0,this.render(n,e,t),this.playCurrentQuestion(n,e,t)},pauseDrill(n,e,t){this.isPlaying=!1,this.stopTimer(),"speechSynthesis"in window&&window.speechSynthesis.cancel(),this.render(n,e,t)},playCurrentQuestion(n,e,t){if(!("speechSynthesis"in window)){alert("Dein Browser unterstützt keine Sprachausgabe.");return}window.speechSynthesis.cancel(),this.stopTimer();const i=this.questions[this.currentIndex],s=new SpeechSynthesisUtterance(i);s.lang="de-DE",s.rate=.95,s.onend=()=>{this.isPlaying&&this.startAnswerTimer(n,e,t)},window.speechSynthesis.speak(s)},startAnswerTimer(n,e,t){this.timeRemaining=this.pauseSeconds;const i=n.querySelector("#audio-drill-timer-display");i&&(i.textContent=`⏱ ${this.timeRemaining}s Antwortpause`,i.style.color="var(--color-warning)"),this.timerId=setInterval(()=>{this.timeRemaining--,i&&(i.textContent=`⏱ ${this.timeRemaining}s Antwortpause`),this.timeRemaining<=0&&(this.stopTimer(),this.playGong(),this.currentIndex<this.questions.length-1?(this.currentIndex++,this.render(n,e,t),setTimeout(()=>{this.isPlaying&&this.playCurrentQuestion(n,e,t)},1e3)):(this.isPlaying=!1,i&&(i.textContent="🎉 Training abgeschlossen!",i.style.color="var(--color-success)"),this.render(n,e,t)))},1e3)},stopTimer(){this.timerId&&(clearInterval(this.timerId),this.timerId=null),this.timeRemaining=0},playGong(){try{const n=new(window.AudioContext||window.webkitAudioContext),e=n.createOscillator(),t=n.createGain();e.type="sine",e.frequency.setValueAtTime(587.33,n.currentTime),t.gain.setValueAtTime(.15,n.currentTime),t.gain.exponentialRampToValueAtTime(.001,n.currentTime+.8),e.connect(t),t.connect(n.destination),e.start(),e.stop(n.currentTime+.8)}catch{}}},Oe={render(n,e,t){var a;const i=(t.skills||[]).slice(0,6),s=t.name||"Alex Neumann",r=t.title||"Frontend Developer & UI Specialist";n.innerHTML=`
            <div class="pitch-flyer-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="presentation"></i> 1-Page Bewerber-Flyer &amp; Pitch-Deck</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Kompakter visueller Steckbrief ("Candidate Snapshot") zum Teilen auf LinkedIn oder als Kurzvorstellung.
                        </p>
                    </div>
                    <button class="btn btn-primary" id="btn-print-flyer">
                        <i data-lucide="printer"></i> Flyer drucken / Als PDF exportieren
                    </button>
                </div>

                <!-- Printable Flyer Canvas -->
                <div id="flyer-card-canvas" class="glass-card" style="padding: 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #f8fafc; border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-lg); max-width: 800px; margin: 0 auto; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
                    
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--color-primary); padding-bottom: 20px; margin-bottom: 24px;">
                        <div>
                            <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase; letter-spacing: 1px;">Kandidaten-Steckbrief</span>
                            <h1 style="font-size: 1.8rem; margin: 4px 0; color: #ffffff; font-weight: 800;">${s}</h1>
                            <div style="font-size: 1.1rem; color: #38bdf8; font-weight: 600;">${r}</div>
                        </div>
                        <div style="text-align: right; font-size: 0.85rem; color: #94a3b8; line-height: 1.6;">
                            <div>📍 München / Deutschland</div>
                            <div>🚀 Sofort / 1 Monat Kündigungsfrist</div>
                            <div>💼 Vollzeit / Hybrid / Remote</div>
                        </div>
                    </div>

                    <!-- 3-Column Highlights Grid -->
                    <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; margin-bottom: 24px;">
                        <!-- Left: Value Proposition & Impact -->
                        <div>
                            <h4 style="font-size: 0.95rem; text-transform: uppercase; color: #38bdf8; margin: 0 0 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
                                Mein Mehrwert &amp; Profil
                            </h4>
                            <p style="font-size: 0.88rem; line-height: 1.5; color: #cbd5e1; margin: 0 0 14px 0;">
                                ${((a=t.cvStructured)==null?void 0:a.summary)||t.experience||"Erfahrener Entwickler mit Fokus auf performante Webapplikationen, agile Workflows und moderne Frameworks. Begeisterung für saubere Software-Architekturen und Nutzerorientierung."}
                            </p>
                            
                            <h4 style="font-size: 0.95rem; text-transform: uppercase; color: #38bdf8; margin: 0 0 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
                                Top-Meilensteine &amp; Erfolge
                            </h4>
                            <ul style="margin: 0; padding-left: 18px; font-size: 0.85rem; color: #cbd5e1; line-height: 1.6;">
                                <li>Entwicklung skalierbarer Benutzeroberflächen mit über 50.000 monatlichen Nutzern</li>
                                <li>Optimierung der Ladezeiten (Core Web Vitals) um über 35%</li>
                                <li>Erfolgreiche Einführung von TypeScript &amp; Component Testing</li>
                            </ul>
                        </div>

                        <!-- Right: Core Skills & Target Role -->
                        <div>
                            <h4 style="font-size: 0.95rem; text-transform: uppercase; color: #38bdf8; margin: 0 0 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
                                Kernkompetenzen
                            </h4>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px;">
                                ${i.map(o=>`<span style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">${o}</span>`).join("")}
                            </div>

                            <h4 style="font-size: 0.95rem; text-transform: uppercase; color: #38bdf8; margin: 0 0 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
                                Rahmendaten &amp; Zielrolle
                            </h4>
                            <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.6; background: rgba(0,0,0,0.25); padding: 12px; border-radius: 8px;">
                                <div>🎯 <strong>Rolle:</strong> ${e?e.title:"Senior / Lead Developer"}</div>
                                <div>💶 <strong>Gehaltsziel:</strong> ~${((e==null?void 0:e.salary)||75e3).toLocaleString("de-DE")} € brutto/Jahr</div>
                                <div>💬 <strong>Sprachen:</strong> Deutsch (Muttersprache), Englisch (Fließend)</div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer / Contact CTA -->
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">
                        <span style="font-size: 0.8rem; color: #94a3b8;">Erstellt mit JobMatch Companion</span>
                        <div style="font-size: 0.85rem; color: #38bdf8; font-weight: 600;">
                            ✉️ Kontakt: alex.neumann@example.com &bull; 🌐 LinkedIn: linkedin.com/in/alexneumann
                        </div>
                    </div>
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(n,e,t)},bindEvents(n,e,t){var i;(i=n.querySelector("#btn-print-flyer"))==null||i.addEventListener("click",()=>{const s=window.open("","_blank");if(!s){alert("Pop-Ups erlauben, um den Flyer zu drucken.");return}const r=n.querySelector("#flyer-card-canvas").innerHTML;s.document.write(`
                <!DOCTYPE html>
                <html lang="de">
                <head>
                    <meta charset="UTF-8">
                    <title>Bewerber-Flyer - ${t.name||"Kandidat"}</title>
                    <style>
                        @page { size: A4 landscape; margin: 10mm; }
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    </style>
                </head>
                <body>
                    <div style="max-width: 900px; margin: 0 auto; background: #0f172a; padding: 20px; border-radius: 12px;">
                        ${r}
                    </div>
                    <script>
                        window.onload = () => { window.print(); window.close(); };
                    <\/script>
                </body>
                </html>
            `),s.document.close()})}},O={async extractTextFromPdf(n){if(!window.pdfjsLib)throw new Error("PDF.js library is not loaded.");let e;n instanceof File?e=await n.arrayBuffer():e=n;const t=await pdfjsLib.getDocument({data:e}).promise;let i="";for(let s=1;s<=t.numPages;s++){const o=(await(await t.getPage(s)).getTextContent()).items.map(l=>l.str).join(" ");i+=o+`
`}return i},parseCvText(n=""){n.toLowerCase();const e=n.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i),t=e?e[0]:"",i=n.match(/(\+?\d{1,4}[-.\s]?)?(\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}/),s=i?i[0]:"",a=["JavaScript","TypeScript","React","Vue","Angular","Node.js","Express","Python","Django","Flask","Java","Spring Boot","C#",".NET","C++","HTML","CSS","Sass","Tailwind","Bootstrap","SQL","PostgreSQL","MongoDB","Docker","Kubernetes","AWS","Azure","GCP","Git","GitHub","CI/CD","REST API","GraphQL","Figma","UI/UX","Agile","Scrum","Kanban","Projektmanagement","Projektleiter","Marketing","Sales","Design"].filter(d=>new RegExp(`\\b${d.replace(".","\\.")}\\b`,"i").test(n)),o=n.split(`
`).map(d=>d.trim()).filter(d=>d.length>2);return{nameCandidate:o.length>0?o[0]:"",email:t,phone:s,detectedSkills:a,rawTextLength:n.length}}},Ve={render(n,e,t){n.innerHTML=`
            <div class="contract-checker-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="shield-alert"></i> KI-Arbeitsvertrags- &amp; Klausel-Checker</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Prüfe Arbeitsvertrags-Entwürfe auf juristische Fallstricke, unbezahlte Überstunden und unfaire Klauseln.
                        </p>
                    </div>
                    <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
                        <i data-lucide="upload"></i> PDF-Vertrag einlesen
                        <input type="file" id="contract-pdf-input" accept="application/pdf" style="display: none;">
                    </label>
                </div>

                <div id="contract-parse-status" style="margin-bottom: 12px; display: none;" class="alert alert-info"></div>

                <div class="form-group" style="margin-bottom: 16px;">
                    <label style="font-weight: 600;">Vertragstext / Klauseln:</label>
                    <textarea id="contract-text-input" rows="8" class="form-input" placeholder="Füge den Vertragstext oder einzelne Klauseln hier ein...">§ 4 Arbeitszeit & Überstunden: Die regelmäßige wöchentliche Arbeitszeit beträgt 40 Stunden. Etwaige anfallende Überstunden sind mit dem vereinbarten monatlichen Grundgehalt vollständig abgegolten.

§ 8 Kündigung: Das Arbeitsverhältnis kann von beiden Seiten mit einer Frist von 2 Wochen zur Monatsmitte gekündigt werden.

§ 12 Nachvertragliches Wettbewerbsverbot: Dem Arbeitnehmer ist es untersagt, für die Dauer von 12 Monaten nach Beendigung des Arbeitsverhältnisses für ein Konkurrenzunternehmen tätig zu werden.</textarea>
                </div>

                <div class="action-bar flex-between align-center" style="margin-bottom: 20px;">
                    <button class="btn btn-primary" id="btn-check-contract">
                        <i data-lucide="shield-check"></i> Vertragsklauseln jetzt prüfen
                    </button>
                </div>

                <div id="contract-analysis-output"></div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(n,e,t)},bindEvents(n,e,t){const i=n.querySelector("#contract-pdf-input"),s=n.querySelector("#contract-parse-status"),r=n.querySelector("#contract-text-input"),a=n.querySelector("#btn-check-contract"),o=n.querySelector("#contract-analysis-output");i&&i.addEventListener("change",async l=>{const d=l.target.files[0];if(d){s.style.display="block",s.className="alert alert-info",s.textContent=`Lese PDF "${d.name}" ein...`;try{const u=await O.extractTextFromPdf(d);r.value=u,s.className="alert alert-success",s.textContent=`PDF erfolgreich eingelesen (${u.length} Zeichen).`}catch(u){s.className="alert alert-danger",s.textContent=`Fehler beim PDF-Import: ${u.message}`}}}),a&&a.addEventListener("click",async()=>{const l=r.value.trim();if(!l)return;a.disabled=!0,a.innerHTML='<i data-lucide="loader" class="spin"></i> Prüfe Klauseln nach Arbeitsrecht...',window.lucide&&lucide.createIcons();const d=await this.evaluateContract(l);this.renderResults(o,d),a.disabled=!1,a.innerHTML='<i data-lucide="shield-check"></i> Vertragsklauseln jetzt prüfen',window.lucide&&lucide.createIcons()})},async evaluateContract(n){const e=n.toLowerCase(),t=[];if(e.includes("vollständig abgegolten")||e.includes("mit dem gehalt abgegolten")||e.includes("pauschal abgegolten")?t.push({clause:"Pauschale Überstundenabgeltung",status:"danger",title:"⚠ Unwirksame Pauschalklausel vermutet",desc:'Formulierungen wie "alle Überstunden sind abgegolten" ohne Nennung einer konkreten Stundenobergrenze (z. B. "bis zu 10h/Monat") sind nach BAG-Rechtsprechung (§ 307 BGB) meist unwirksam.',recommendation:"Verhandle eine klare Obergrenze oder ein Zeiterfassungskonto mit Freizeitausgleich."}):t.push({clause:"Überstundenregelung",status:"success",title:"✓ Keine pauschale Alles-Abgegolten-Klausel erkannt",desc:"Keine unzulässige Pauschalregelung gefunden.",recommendation:"Achte dennoch auf klare Gleitzeit- oder Freizeitausgleichsregelungen."}),e.includes("wettbewerbsverbot")||e.includes("konkurrenzunternehmen")){const s=e.includes("karenzentschädigung")||e.includes("karenz");t.push({clause:"Nachvertragliches Wettbewerbsverbot",status:s?"warning":"danger",title:s?"⚖ Wettbewerbsverbot mit Entschädigung":"🚨 Wettbewerbsverbot ohne Karenzentschädigung (Nichtigkeit)",desc:s?"Ein Wettbewerbsverbot ist nur gültig, wenn dir der Arbeitgeber mindestens 50% der letzten Bezüge als Karenzentschädigung zahlt (§ 74 HGB).":"Ein Wettbewerbsverbot OHNE ausdrückliche Zusage einer gesetzlichen Karenzentschädigung (mind. 50% des Gehalts) ist nach § 74 Abs. 2 HGB komplett unverbindlich/nichtig!",recommendation:s?"Prüfe, ob du für diesen Zeitraum beruflich eingeschränkt sein möchtest.":"Streichung der Klausel verlangen."})}(e.includes("kündigungsfrist")||e.includes("kündigung"))&&t.push({clause:"Kündigungsfristen & Probezeit",status:"info",title:"ℹ Kündigungsregelungen beachten",desc:"In der Probezeit (max. 6 Monate) gilt gesetzlich eine Frist von 2 Wochen (§ 622 Abs. 3 BGB). Nach der Probezeit darf die Frist für dich als Arbeitnehmer nicht länger sein als für den Arbeitgeber.",recommendation:"Achte darauf, dass die Kündigungsfristen für beide Seiten symmetrisch sind."});let i="";if(B.hasApiKey())try{const s=`Analysiere folgende Arbeitsvertragsklauseln nach deutschem Arbeitsrecht. Prüfe auf Unwirksamkeit nach AGB-Recht (§ 307 BGB), Überstundenfallen, Wettbewerbsverbote und unfaire Pflichten:

${n}`;i=await B.generateText(s,"Du bist ein erfahrener Fachanwalt für Arbeitsrecht.")}catch(s){console.error(s)}return{checks:t,aiExpertReview:i}},renderResults(n,e){n.innerHTML=`
            <div class="glass-card" style="padding: 24px; margin-top: 16px;">
                <h4 style="margin: 0 0 16px 0; font-size: 1.05rem;"><i data-lucide="check-circle2"></i> Analyse-Ergebnisse &amp; Risikobewertung:</h4>

                <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px;">
                    ${e.checks.map(t=>`
                        <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md); border-left: 4px solid ${t.status==="danger"?"var(--color-danger)":t.status==="warning"?"var(--color-warning)":"var(--color-success)"};">
                            <div class="flex-between align-center" style="margin-bottom: 6px;">
                                <strong style="font-size: 0.95rem; color: #ffffff;">${t.title}</strong>
                                <span class="badge ${t.status==="danger"?"badge-danger":t.status==="warning"?"badge-interviewing":"badge-offer"}" style="font-size: 0.7rem;">
                                    ${t.clause}
                                </span>
                            </div>
                            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin: 0 0 8px 0;">${t.desc}</p>
                            <div style="font-size: 0.8rem; color: #38bdf8; background: rgba(56, 189, 248, 0.08); padding: 6px 10px; border-radius: 4px;">
                                💡 <strong>Tipp für Verhandlung:</strong> ${t.recommendation}
                            </div>
                        </div>
                    `).join("")}
                </div>

                ${e.aiExpertReview?`
                    <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); padding: 16px; border-radius: var(--radius-md);">
                        <h4 style="margin: 0 0 8px 0; color: var(--color-primary); font-size: 0.9rem;"><i data-lucide="sparkles"></i> KI-Fachanwalts-Gutachten:</h4>
                        <p style="margin: 0; font-size: 0.85rem; line-height: 1.5; color: var(--text-primary); white-space: pre-wrap;">${e.aiExpertReview}</p>
                    </div>
                `:""}
            </div>
        `,window.lucide&&lucide.createIcons()}},je={selectedPhase:30,render(n,e,t){const i=e?e.company:"Neues Unternehmen",s=e?e.title:"Neue Position";n.innerHTML=`
            <div class="onboarding-planner-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="compass"></i> 30-60-90 Tage Onboarding- &amp; Probezeit-Planer</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Dein strategischer Leitfaden für die ersten 3 Monate als "${s}" bei "${i}"
                        </p>
                    </div>
                    <div class="flex-row gap-8">
                        <button class="btn btn-secondary btn-sm ${this.selectedPhase===30?"active":""}" id="btn-phase-30">
                            Tag 1 - 30 (Lernen &amp; Setup)
                        </button>
                        <button class="btn btn-secondary btn-sm ${this.selectedPhase===60?"active":""}" id="btn-phase-60">
                            Tag 31 - 60 (Eigenständigkeit)
                        </button>
                        <button class="btn btn-secondary btn-sm ${this.selectedPhase===90?"active":""}" id="btn-phase-90">
                            Tag 61 - 90 (Volle Wirkung)
                        </button>
                    </div>
                </div>

                <div class="glass-card" style="padding: 24px; margin-bottom: 20px;">
                    ${this.renderPhaseContent(this.selectedPhase,i,s)}
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(n,e,t)},renderPhaseContent(n,e,t){return n===30?`
                <div style="border-left: 4px solid var(--color-primary); padding-left: 16px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 4px 0; color: #ffffff;">Phase 1: Orientierung, Einarbeitung &amp; Beziehungsaufbau (Tag 1 - 30)</h3>
                    <p class="text-secondary" style="font-size: 0.85rem; margin: 0;">Fokus: Systeme verstehen, Teammitglieder kennenlernen und Erwartungshaltungen mit der Führungskraft klären.</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md);">
                        <h4 style="font-size: 0.9rem; margin: 0 0 12px 0; color: var(--color-primary);"><i data-lucide="check-square"></i> Kern-Aufgaben &amp; Checkliste:</h4>
                        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85rem; display: flex; flex-direction: column; gap: 10px; color: #cbd5e1;">
                            <li><input type="checkbox" style="margin-right: 8px;"> Arbeitsumgebung &amp; Zugänge (GitHub, Jira, Slack, VPN) einrichten</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> 1:1 Kennenlerngespräche mit allen direkten Teammitgliedern führen</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> Codebase, Architektur &amp; Deployment-Pipelines von ${e} verstehen</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> Ersten kleinen Pull Request / Bugfix erfolgreich mergen</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> 30-Tage-Feedbackgespräch mit dem Teamleiter terminieren</li>
                        </ul>
                    </div>

                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md);">
                        <h4 style="font-size: 0.9rem; margin: 0 0 12px 0; color: #38bdf8;"><i data-lucide="help-circle"></i> Schlüsselfragen für dein 30-Tage 1:1:</h4>
                        <ul style="padding-left: 16px; margin: 0; font-size: 0.85rem; color: #cbd5e1; line-height: 1.6;">
                            <li><em>"Was lief in meinen ersten 4 Wochen besonders gut?"</em></li>
                            <li><em>"Gibt es Bereiche oder Abläufe, bei denen ich mich noch schneller einarbeiten sollte?"</em></li>
                            <li><em>"Welches sind die Top-3 Prioritäten für meine nächsten 30 Tage?"</em></li>
                        </ul>
                    </div>
                </div>
            `:n===60?`
                <div style="border-left: 4px solid var(--color-warning); padding-left: 16px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 4px 0; color: #ffffff;">Phase 2: Eigenständige Umsetzung &amp; Vertiefung (Tag 31 - 60)</h3>
                    <p class="text-secondary" style="font-size: 0.85rem; margin: 0;">Fokus: Selbstständige Bearbeitung komplexerer Aufgaben und aktive Mitarbeit in Sprint-Planungen.</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md);">
                        <h4 style="font-size: 0.9rem; margin: 0 0 12px 0; color: var(--color-warning);"><i data-lucide="check-square"></i> Kern-Aufgaben &amp; Checkliste:</h4>
                        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85rem; display: flex; flex-direction: column; gap: 10px; color: #cbd5e1;">
                            <li><input type="checkbox" style="margin-right: 8px;"> Eigenverantwortliche Umsetzung eines größeren Features</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> Aktive Durchführung von Code-Reviews für Kollegen</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> Dokumentation von unklaren internen Prozessen im Wiki verbessern</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> Erste Vorschläge für Performance- oder UI-Verbesserungen einbringen</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> 60-Tage Zwischenbilanz mit Vorgesetzten besprechen</li>
                        </ul>
                    </div>

                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md);">
                        <h4 style="font-size: 0.9rem; margin: 0 0 12px 0; color: #38bdf8;"><i data-lucide="help-circle"></i> Schlüsselfragen für dein 60-Tage 1:1:</h4>
                        <ul style="padding-left: 16px; margin: 0; font-size: 0.85rem; color: #cbd5e1; line-height: 1.6;">
                            <li><em>"Entspricht mein Arbeitsrhythmus und Output Ihren Erwartungen?"</em></li>
                            <li><em>"Wo sehen Sie Möglichkeiten, dass ich noch mehr Verantwortung übernehme?"</em></li>
                        </ul>
                    </div>
                </div>
            `:`
                <div style="border-left: 4px solid var(--color-success); padding-left: 16px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 4px 0; color: #ffffff;">Phase 3: Volle Wirkung &amp; Probezeit-Bestehen (Tag 61 - 90)</h3>
                    <p class="text-secondary" style="font-size: 0.85rem; margin: 0;">Fokus: Eigene Impulse setzen, strategische Themen anstoßen und das offizielle Probezeitgespräch vorbereiten.</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md);">
                        <h4 style="font-size: 0.9rem; margin: 0 0 12px 0; color: var(--color-success);"><i data-lucide="check-square"></i> Kern-Aufgaben &amp; Checkliste:</h4>
                        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85rem; display: flex; flex-direction: column; gap: 10px; color: #cbd5e1;">
                            <li><input type="checkbox" style="margin-right: 8px;"> Zusammenstellung einer Erfolgsliste aller gelieferten Features</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> Feedback von 2-3 Kollegen einholen (Peer-Feedback)</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> Vorschlag für ein Quartalsziel (OKR / KPI) erarbeiten</li>
                            <li><input type="checkbox" style="margin-right: 8px;"> Offizielles Probezeit-Abschlussgespräch erfolgreich führen</li>
                        </ul>
                    </div>

                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md);">
                        <h4 style="font-size: 0.9rem; margin: 0 0 12px 0; color: #38bdf8;"><i data-lucide="award"></i> Ziel: Erfolgreiches Bestehen der Probezeit</h4>
                        <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin: 0;">
                            Mit einer sauberen Dokumentation deiner Erfolge gehst du selbstbewusst in das finale Gespräch und legst den Grundstein für deine nächste Gehalts- und Entwicklungsstufe bei ${e}!
                        </p>
                    </div>
                </div>
            `},bindEvents(n,e,t){var i,s,r;(i=n.querySelector("#btn-phase-30"))==null||i.addEventListener("click",()=>{this.selectedPhase=30,this.render(n,e,t)}),(s=n.querySelector("#btn-phase-60"))==null||s.addEventListener("click",()=>{this.selectedPhase=60,this.render(n,e,t)}),(r=n.querySelector("#btn-phase-90"))==null||r.addEventListener("click",()=>{this.selectedPhase=90,this.render(n,e,t)})}},Ue={selectedState:"bayern",selectedCompanySize:"medium",selectedSeniority:"senior",stateMultipliers:{bayern:{name:"Bayern (München, Nürnberg)",mult:1.15},bw:{name:"Baden-Württemberg (Stuttgart)",mult:1.14},hessen:{name:"Hessen (Frankfurt)",mult:1.12},hamburg:{name:"Hamburg",mult:1.08},nrw:{name:"Nordrhein-Westfalen (Köln, Düsseldorf)",mult:1.04},berlin:{name:"Berlin",mult:1},niedersachsen:{name:"Niedersachsen / Bremen",mult:.96},ost:{name:"Ostdeutschland (Sachsen, Thüringen etc.)",mult:.88},remote:{name:"100% Remote (Bundesweiter Schnitt)",mult:1}},companyMultipliers:{startup:{name:"Startup / Kleinbetrieb (< 50 MA)",mult:.9},medium:{name:"Mittelstand (50 - 500 MA)",mult:1},large:{name:"Großunternehmen (500 - 2.000 MA)",mult:1.1},enterprise:{name:"Konzern / DAX (> 2.000 MA)",mult:1.25}},baseSalariesByRole:{junior:{p25:45e3,median:52e3,p75:58e3,top10:65e3},mid:{p25:58e3,median:66e3,p75:74e3,top10:82e3},senior:{p25:72e3,median:82e3,p75:94e3,top10:108e3},lead:{p25:88e3,median:98e3,p75:115e3,top10:135e3}},render(n,e,t){const i=this.calculateBenchmark();n.innerHTML=`
            <div class="salary-radar-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="compass"></i> Regionales &amp; Branchenweites Gehaltsbänder-Radar</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Ermittle realistische Gehaltsbänder nach Bundesland, Unternehmensgröße und Erfahrungslevel.
                        </p>
                    </div>
                </div>

                <!-- Filter Controls -->
                <div class="glass-card" style="padding: 20px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
                    <div>
                        <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 6px;">Bundesland / Region:</label>
                        <select id="radar-state-select" class="form-input">
                            ${Object.entries(this.stateMultipliers).map(([s,r])=>`
                                <option value="${s}" ${this.selectedState===s?"selected":""}>${r.name}</option>
                            `).join("")}
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 6px;">Unternehmensgröße:</label>
                        <select id="radar-company-select" class="form-input">
                            ${Object.entries(this.companyMultipliers).map(([s,r])=>`
                                <option value="${s}" ${this.selectedCompanySize===s?"selected":""}>${r.name}</option>
                            `).join("")}
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 6px;">Senioritäts-Level:</label>
                        <select id="radar-seniority-select" class="form-input">
                            <option value="junior" ${this.selectedSeniority==="junior"?"selected":""}>Junior (0 - 2 Jahre)</option>
                            <option value="mid" ${this.selectedSeniority==="mid"?"selected":""}>Mid-Level (3 - 5 Jahre)</option>
                            <option value="senior" ${this.selectedSeniority==="senior"?"selected":""}>Senior (5+ Jahre)</option>
                            <option value="lead" ${this.selectedSeniority==="lead"?"selected":""}>Lead / Staff / Architekt (8+ Jahre)</option>
                        </select>
                    </div>
                </div>

                <!-- Visual Salary Band Visualization -->
                <div class="glass-card" style="padding: 24px; margin-bottom: 20px;">
                    <div class="flex-between align-center" style="margin-bottom: 20px;">
                        <div>
                            <span class="text-secondary" style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700;">Marktüblicher Median</span>
                            <h2 style="margin: 2px 0 0 0; color: var(--color-primary); font-size: 1.8rem;">
                                ${i.median.toLocaleString("de-DE")} € <span style="font-size: 0.9rem; color: var(--text-secondary); font-weight: normal;">brutto / Jahr</span>
                            </h2>
                        </div>
                        <span class="badge badge-offer" style="font-size: 0.85rem;">
                            Spanne: ${i.p25.toLocaleString("de-DE")} € &ndash; ${i.p75.toLocaleString("de-DE")} €
                        </span>
                    </div>

                    <!-- Visual Progress Bar -->
                    <div style="background: rgba(255,255,255,0.05); height: 16px; border-radius: 8px; position: relative; margin-bottom: 30px; overflow: hidden; display: flex;">
                        <div style="width: 25%; background: rgba(107, 114, 128, 0.4);" title="25. Perzentil"></div>
                        <div style="width: 50%; background: linear-gradient(90deg, var(--color-primary), #38bdf8);" title="Kernspanne (Median)"></div>
                        <div style="width: 25%; background: rgba(16, 185, 129, 0.5);" title="Top 10%"></div>
                    </div>

                    <!-- 4 Metric Cards -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center;">
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">25. Perzentil</span>
                            <strong style="font-size: 1.05rem; color: #cbd5e1;">${i.p25.toLocaleString("de-DE")} €</strong>
                        </div>
                        <div style="background: rgba(99,102,241,0.1); border: 1px solid var(--color-primary); padding: 12px; border-radius: 8px;">
                            <span style="font-size: 0.75rem; color: var(--color-primary); display: block; font-weight: 700;">Median (Marktwert)</span>
                            <strong style="font-size: 1.15rem; color: #ffffff;">${i.median.toLocaleString("de-DE")} €</strong>
                        </div>
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">75. Perzentil</span>
                            <strong style="font-size: 1.05rem; color: #cbd5e1;">${i.p75.toLocaleString("de-DE")} €</strong>
                        </div>
                        <div style="background: rgba(16,185,129,0.1); border: 1px solid var(--color-success); padding: 12px; border-radius: 8px;">
                            <span style="font-size: 0.75rem; color: var(--color-success); display: block; font-weight: 700;">Top 10% (High Performer)</span>
                            <strong style="font-size: 1.05rem; color: var(--color-success);">${i.top10.toLocaleString("de-DE")} €</strong>
                        </div>
                    </div>
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(n,e,t)},calculateBenchmark(){var s,r;const n=this.baseSalariesByRole[this.selectedSeniority]||this.baseSalariesByRole.senior,e=((s=this.stateMultipliers[this.selectedState])==null?void 0:s.mult)||1,t=((r=this.companyMultipliers[this.selectedCompanySize])==null?void 0:r.mult)||1,i=e*t;return{p25:Math.round(n.p25*i/500)*500,median:Math.round(n.median*i/500)*500,p75:Math.round(n.p75*i/500)*500,top10:Math.round(n.top10*i/500)*500}},bindEvents(n,e,t){var i,s,r;(i=n.querySelector("#radar-state-select"))==null||i.addEventListener("change",a=>{this.selectedState=a.target.value,this.render(n,e,t)}),(s=n.querySelector("#radar-company-select"))==null||s.addEventListener("change",a=>{this.selectedCompanySize=a.target.value,this.render(n,e,t)}),(r=n.querySelector("#radar-seniority-select"))==null||r.addEventListener("change",a=>{this.selectedSeniority=a.target.value,this.render(n,e,t)})}},We={sampleEmails:[{id:"mail-1",sender:"karriere@innotech-solutions.de",company:"InnoTech Solutions",subject:"Einladung zum Video-Interview: Senior Frontend Developer",date:"Heute, 10:15 Uhr",statusSuggestion:"interviewing",body:`Sehr geehrter Herr Neumann,

vielen Dank für Ihre Bewerbung. Ihr Profil hat uns sehr beeindruckt! Wir möchten Sie gerne zu einem ersten Kennenlerngespräch via Microsoft Teams am 22.08.2026 um 14:00 Uhr einladen.

Herzliche Grüße,
InnoTech HR-Team`},{id:"mail-2",sender:"recruiting@global-commerce.de",company:"Global Commerce GmbH",subject:"Eingangsbestätigung Ihrer Bewerbung",date:"Gestern, 16:40 Uhr",statusSuggestion:"applied",body:`Hallo Alex,

deine Unterlagen sind erfolgreich bei uns eingegangen. Wir prüfen deine Bewerbung sorgfältig und melden uns innerhalb von zwei Wochen wieder bei dir.

Viele Grüße,
Global Commerce Recruiting`},{id:"mail-3",sender:"jobs@designkraft.de",company:"DesignKraft Agency",subject:"Status Ihrer Bewerbung",date:"Vor 3 Tagen",statusSuggestion:"rejected",body:`Sehr geehrter Herr Neumann,

wir bedanken uns für das Interesse an unserem Unternehmen. Leider müssen wir Ihnen mitteilen, dass wir uns für einen anderen Kandidaten entschieden haben, dessen Profil noch etwas spezifischer passt.

Wir wünschen Ihnen für die Zukunft alles Gute.
DesignKraft Team`}],render(n,e,t){n.innerHTML=`
            <div class="inbox-simulator-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="inbox"></i> E-Mail-Inbox &amp; Auto-Status-Synchronisation</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Erkennt automatisch Einladungen, Eingangsbestätigungen &amp; Absagen und synchronisiert den Status im Kanban-Board.
                        </p>
                    </div>
                </div>

                <div class="glass-card" style="padding: 20px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 16px 0; font-size: 0.95rem;"><i data-lucide="mail"></i> Erkannte Posteingangs-Nachrichten:</h4>

                    <div style="display: flex; flex-direction: column; gap: 14px;">
                        ${this.sampleEmails.map(i=>`
                            <div class="glass-card" style="padding: 16px; border-left: 4px solid ${this.getStatusColor(i.statusSuggestion)}; background: rgba(0,0,0,0.2);">
                                <div class="flex-between align-center" style="margin-bottom: 8px;">
                                    <div>
                                        <strong style="font-size: 0.95rem; color: #ffffff;">${i.subject}</strong>
                                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">
                                            Von: ${i.sender} &bull; ${i.date}
                                        </div>
                                    </div>
                                    <div class="flex-row gap-8 align-center">
                                        <span class="badge ${this.getStatusBadgeClass(i.statusSuggestion)}" style="font-size: 0.75rem;">
                                            Erkannt: ${this.getStatusLabel(i.statusSuggestion)}
                                        </span>
                                        <button class="btn btn-primary btn-sm btn-sync-mail-status" data-company="${i.company}" data-status="${i.statusSuggestion}">
                                            <i data-lucide="refresh-cw"></i> Status übernehmen
                                        </button>
                                    </div>
                                </div>
                                <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin: 0; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; white-space: pre-wrap;">${i.body}</p>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(n,e,t)},getStatusColor(n){return n==="interviewing"?"var(--color-primary)":n==="applied"?"var(--color-warning)":n==="rejected"?"var(--color-danger)":"var(--text-muted)"},getStatusBadgeClass(n){return n==="interviewing"?"badge-primary":n==="applied"?"badge-interviewing":n==="rejected"?"badge-danger":"badge-saved"},getStatusLabel(n){return n==="interviewing"?"Einladung zum Gespräch":n==="applied"?"Eingangsbestätigung (Beworben)":n==="rejected"?"Absage":n},bindEvents(n,e,t){n.querySelectorAll(".btn-sync-mail-status").forEach(i=>{i.addEventListener("click",()=>{const s=i.getAttribute("data-company"),r=i.getAttribute("data-status"),o=y.getJobs().find(l=>l.company.toLowerCase().includes(s.toLowerCase()));o?(o.status=r,o.history||(o.history=[]),o.history.push({status:r,timestamp:new Date().toISOString()}),y.updateJob(o),i.innerHTML='<i data-lucide="check"></i> Status aktualisiert!',i.disabled=!0,window.lucide&&lucide.createIcons(),window.app&&window.app.showToast&&window.app.showToast(`Status für "${o.company}" auf "${this.getStatusLabel(r)}" gesetzt!`,"success")):window.app&&window.app.showToast&&window.app.showToast(`Kein aktiver Job für "${s}" gefunden.`,"warning")})})}},_e={render(n,e,t){n.innerHTML=`
            <div class="cv-optimizer-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <h3><i data-lucide="file-check"></i> Lebenslauf-Abgleich &amp; PDF-Import</h3>
                    <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
                        <i data-lucide="upload"></i> PDF-Lebenslauf / LinkedIn-Export importieren
                        <input type="file" id="cv-pdf-upload-input" accept="application/pdf" style="display: none;">
                    </label>
                </div>

                <div id="pdf-parse-status" style="margin-bottom: 12px; display: none;" class="alert alert-info"></div>

                <div class="form-group" style="margin-bottom: 16px;">
                    <label style="font-weight: 600;">Dein aktueller Lebenslauf-Text (CV):</label>
                    <textarea id="cv-optimizer-text" rows="8" class="form-input" placeholder="Füge deinen Lebenslauf-Text ein oder lade oben eine PDF hoch...">${t.cvText||t.experience||""}</textarea>
                </div>

                <div id="cv-analysis-results" style="margin-top: 16px;"></div>

                <div class="action-bar flex-between align-center" style="margin-top: 16px;">
                    <button class="btn btn-primary" id="btn-analyze-cv">
                        <i data-lucide="search"></i> Lebenslauf auf Stelle analysieren
                    </button>
                    <button class="btn btn-secondary" id="btn-save-cv-text">
                        <i data-lucide="save"></i> Text im Profil speichern
                    </button>
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(n,e,t)},bindEvents(n,e,t){const i=n.querySelector("#cv-pdf-upload-input"),s=n.querySelector("#pdf-parse-status"),r=n.querySelector("#cv-optimizer-text");i&&i.addEventListener("change",async d=>{const u=d.target.files[0];if(u){s.style.display="block",s.textContent=`Lese PDF "${u.name}" ein...`;try{const c=await O.extractTextFromPdf(u),p=O.parseCvText(c);if(r.value=c,s.className="alert alert-success",s.textContent=`PDF erfolgreich eingelesen (${c.length} Zeichen). Gefundene Skills: ${p.detectedSkills.join(", ")||"keine automatischen Treffer"}`,p.detectedSkills.length>0){const b=new Set(t.skills||[]);p.detectedSkills.forEach(v=>b.add(v)),t.skills=Array.from(b),y.saveProfile(t)}}catch(c){s.className="alert alert-danger",s.textContent=`Fehler beim PDF-Import: ${c.message}`}}});const a=n.querySelector("#btn-analyze-cv"),o=n.querySelector("#cv-analysis-results");a&&a.addEventListener("click",()=>{const d=r.value.toLowerCase(),u=(e.description||"").toLowerCase(),p=["react","typescript","javascript","html","css","git","figma","node.js","agile","rest api"].filter(b=>u.includes(b)&&!d.includes(b));o.innerHTML=`
                    <div class="glass-card" style="padding: 16px;">
                        <h4>Analyse-Ergebnis für "${e.title}"</h4>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 4px;">
                            ${p.length===0?"Perfekt! Dein Lebenslauf deckt alle wesentlichen Kernbegriffe der Stellenausschreibung ab.":"Folgende Schlüsselwörter der Stelle fehlen noch in deinem Lebenslauf-Text:"}
                        </p>
                        ${p.length>0?`
                            <div class="keyword-tags" style="margin-top: 8px;">
                                ${p.map(b=>`<span class="keyword-badge miss">+ ${b}</span>`).join("")}
                            </div>
                        `:""}
                    </div>
                `});const l=n.querySelector("#btn-save-cv-text");l&&l.addEventListener("click",()=>{t.cvText=r.value,y.saveProfile(t),l.textContent="Gespeichert!",setTimeout(()=>{l.innerHTML='<i data-lucide="save"></i> Text im Profil speichern',window.lucide&&lucide.createIcons()},2e3)})}};function ve(n,e="modern"){const t=window.open("","_blank");if(!t){alert("Bitte erlaube Pop-Ups für diese Seite, um den Lebenslauf-Export zu starten.");return}const i=(n.skills||[]).map(a=>`
        <span class="skill-badge">${a}</span>
    `).join(""),s=(n.experience||"").split(`
`).map(a=>a.trim()).filter(a=>a.length>0).map(a=>`<li>${a.replace(/^-\s*/,"")}</li>`).join("");let r="";e==="classic"?r=`
            .sidebar { background-color: #f8fafc; color: #1e293b; border-right: 2px solid #e2e8f0; }
            .sidebar h2 { color: #1e293b; border-bottom: 2px solid #0284c7; }
            .skill-badge { background-color: #0284c7; color: #ffffff; }
            .name { font-family: Georgia, serif; color: #0f172a; }
            .section-title { border-bottom: 2px solid #0284c7; color: #0284c7; font-family: Georgia, serif; }
        `:e==="minimalist"?r=`
            .cv-container { grid-template-columns: 1fr; padding: 20mm; }
            .sidebar { background: transparent; padding: 0; margin-bottom: 20px; border-bottom: 1px solid #cbd5e1; flex-direction: row; justify-content: space-between; }
            .sidebar h2 { display: none; }
            .skill-badge { background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
            .name { font-size: 28pt; letter-spacing: -1px; }
            .section-title { border-bottom: 1px solid #334155; }
        `:r=`
            .sidebar { background-color: #0f172a; color: #cbd5e1; }
            .sidebar h2 { color: #ffffff; border-bottom: 2px solid #38bdf8; }
            .skill-badge { background-color: #1e293b; color: #f1f5f9; }
            .name { color: #0f172a; }
            .section-title { border-bottom: 2px solid #e2e8f0; color: #0f172a; }
        `,t.document.write(`
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>Lebenslauf - ${n.name||"Bewerber"}</title>
            <style>
                @page {
                    size: A4;
                    margin: 0;
                }
                body {
                    font-family: Inter, Helvetica, Arial, sans-serif;
                    font-size: 10.5pt;
                    line-height: 1.6;
                    color: #1e293b;
                    margin: 0;
                    padding: 0;
                    background-color: #ffffff;
                }
                .cv-container {
                    display: grid;
                    grid-template-columns: 1fr 2.2fr;
                    min-height: 297mm;
                }
                .sidebar {
                    padding: 25mm 15mm;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .sidebar h2 {
                    font-size: 13pt;
                    padding-bottom: 6px;
                    margin-top: 10px;
                    margin-bottom: 15px;
                }
                .main-content {
                    padding: 25mm 20mm;
                    color: #334155;
                }
                .name {
                    font-size: 26pt;
                    font-weight: 800;
                    line-height: 1.1;
                    margin: 0 0 5px 0;
                }
                .title-focused {
                    font-size: 14pt;
                    color: #0284c7;
                    font-weight: 600;
                    margin: 0 0 30px 0;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .section-title {
                    font-size: 14pt;
                    padding-bottom: 4px;
                    margin-top: 0;
                    margin-bottom: 15px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .skill-badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 9pt;
                    margin-right: 6px;
                    margin-bottom: 8px;
                    font-weight: 500;
                }
                .exp-list {
                    padding-left: 20px;
                    margin: 0;
                    color: #334155;
                }
                .exp-list li {
                    margin-bottom: 12px;
                }
                .contact-item {
                    font-size: 9.5pt;
                    margin-bottom: 10px;
                }
                .contact-label {
                    display: block;
                    font-weight: bold;
                    color: #38bdf8;
                    font-size: 8pt;
                    text-transform: uppercase;
                }
                ${r}
                @media print {
                    body { background-color: #ffffff; }
                    .cv-container { min-height: 100vh; }
                }
            </style>
        </head>
        <body>
            <div class="cv-container">
                <div class="sidebar">
                    <div>
                        <h2>Kontakt</h2>
                        <div class="contact-item">
                            <span class="contact-label">Name</span>
                            ${n.name||"Max Mustermann"}
                        </div>
                        <div class="contact-item">
                            <span class="contact-label">Fokus</span>
                            ${n.title||"Entwickler"}
                        </div>
                    </div>
                    
                    <div>
                        <h2>Fähigkeiten</h2>
                        <div style="margin-top: 10px;">
                            ${i||"Keine Skills hinterlegt."}
                        </div>
                    </div>
                </div>
                
                <div class="main-content">
                    <h1 class="name">${n.name||"Max Mustermann"}</h1>
                    <div class="title-focused">${n.title||"Senior Software Engineer"}</div>
                    
                    <h2 class="section-title">Werdegang &amp; Erfahrung</h2>
                    <ul class="exp-list">
                        ${s||"<li>Keine Erfahrungspunkte angegeben.</li>"}
                    </ul>
                </div>
            </div>
        </body>
        </html>
    `),t.document.close(),t.focus(),setTimeout(()=>{t.print(),t.close()},500)}const Ze={selectedTemplate:"modern",render(n,e,t){const i=t.cvStructured||this.getDefaultCvData(t);n.innerHTML=`
            <div class="cv-builder-container">
                <div class="flex-between align-center" style="margin-bottom: 20px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="award"></i> Interaktiver Lebenslauf-Builder</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 4px;">
                            Erstelle und exportiere deinen professionellen Lebenslauf als PDF &ndash; abgestimmt auf ${e?`"${e.title}"`:"dein Profil"}.
                        </p>
                    </div>
                    <div class="flex-row gap-8 align-center">
                        <select id="cv-template-select" class="form-input" style="padding: 6px 12px; width: auto;">
                            <option value="modern" ${this.selectedTemplate==="modern"?"selected":""}>Layout: Modern Tech</option>
                            <option value="classic" ${this.selectedTemplate==="classic"?"selected":""}>Layout: Classic Executive</option>
                            <option value="minimalist" ${this.selectedTemplate==="minimalist"?"selected":""}>Layout: Minimalist</option>
                        </select>
                        <button class="btn btn-primary" id="btn-export-cv-pdf">
                            <i data-lucide="printer"></i> Lebenslauf drucken / PDF
                        </button>
                    </div>
                </div>

                <div class="cv-builder-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <!-- Left: Form Editor -->
                    <div class="glass-card" style="padding: 20px; max-height: 650px; overflow-y: auto;">
                        <h4 style="margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                            <i data-lucide="user"></i> 1. Persönliche Angaben
                        </h4>
                        <div class="form-group" style="margin-bottom: 12px;">
                            <label style="font-size: 0.85rem; font-weight: 600;">Vollständiger Name</label>
                            <input type="text" id="cv-input-name" class="form-input" value="${i.name||t.name||""}">
                        </div>
                        <div class="flex-row gap-12" style="margin-bottom: 12px;">
                            <div style="flex: 1;">
                                <label style="font-size: 0.85rem; font-weight: 600;">Berufsbezeichnung / Zielrolle</label>
                                <input type="text" id="cv-input-title" class="form-input" value="${i.title||t.title||""}">
                            </div>
                            <div style="flex: 1;">
                                <label style="font-size: 0.85rem; font-weight: 600;">E-Mail &amp; Telefon</label>
                                <input type="text" id="cv-input-contact" class="form-input" value="${i.contact||"alex.neumann@example.com | +49 170 1234567"}">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="font-size: 0.85rem; font-weight: 600;">Kurzprofil / Über mich</label>
                            <textarea id="cv-input-summary" rows="3" class="form-input">${i.summary||"Erfahrener Softwareentwickler mit Leidenschaft für moderne Webtechnologien, skalierbare Architekturen und erstklassige User Experiences."}</textarea>
                        </div>

                        <h4 style="margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                            <i data-lucide="briefcase"></i> 2. Berufserfahrung (Chronologisch)
                        </h4>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="font-size: 0.85rem; font-weight: 600;">Stationen &amp; Erfolge (Zeilenweise mit '- ')</label>
                            <textarea id="cv-input-experience" rows="6" class="form-input">${i.experience||t.experience||""}</textarea>
                        </div>

                        <h4 style="margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                            <i data-lucide="graduation-cap"></i> 3. Ausbildung &amp; Studium
                        </h4>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <textarea id="cv-input-education" rows="3" class="form-input">${i.education||`2018 - 2022: B.Sc. Angewandte Informatik, TU München
2015 - 2018: Allgemeine Hochschulreife`}</textarea>
                        </div>

                        <h4 style="margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                            <i data-lucide="code"></i> 4. Kernkompetenzen (Skills)
                        </h4>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <input type="text" id="cv-input-skills" class="form-input" value="${(i.skills||t.skills||[]).join(", ")}" placeholder="Kommagetrennte Liste (z.B. React, TypeScript, Git, Docker)">
                        </div>

                        <div class="flex-row gap-8">
                            <button class="btn btn-secondary btn-sm" id="btn-save-cv-structure">
                                <i data-lucide="save"></i> Im Profil speichern
                            </button>
                            ${e?`
                                <button class="btn btn-secondary btn-sm" id="btn-ai-tailor-cv">
                                    <i data-lucide="sparkles"></i> Per KI auf "${e.company}" zuschneiden
                                </button>
                            `:""}
                        </div>
                    </div>

                    <!-- Right: Live Preview -->
                    <div class="glass-card" style="padding: 24px; background: #ffffff; color: #1e293b; border-radius: var(--radius-lg); max-height: 650px; overflow-y: auto;">
                        <div id="cv-live-preview-box">
                            ${this.generatePreviewHtml(i,this.selectedTemplate)}
                        </div>
                    </div>
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(n,e,t)},getDefaultCvData(n){return{name:n.name||"Alex Neumann",title:n.title||"Frontend Developer",contact:"alex.neumann@example.com | +49 170 1234567 | München",summary:"Erfahrener Softwareentwickler mit Leidenschaft für intuitive Webapplikationen, Clean Code und agile Methoden.",experience:n.experience||`- 2023 - Heute: Senior Web Developer bei TechVision AG
- 2021 - 2023: Frontend Developer bei Global Commerce GmbH
- 2019 - 2021: Junior Web Engineer bei Agency Alpha`,education:"2016 - 2020: B.Sc. Informatik (Hochschule München)",skills:n.skills||["JavaScript","React","TypeScript","CSS Grid","Git"]}},generatePreviewHtml(n,e){const t=Array.isArray(n.skills)?n.skills:(n.skills||"").split(",").map(r=>r.trim()).filter(Boolean),i=(n.experience||"").split(`
`).filter(r=>r.trim()).map(r=>`<li>${r.replace(/^-\s*/,"")}</li>`).join(""),s=(n.education||"").split(`
`).filter(r=>r.trim()).map(r=>`<li>${r.replace(/^-\s*/,"")}</li>`).join("");return`
            <div style="font-family: Inter, sans-serif; font-size: 11px; line-height: 1.5; color: #334155;">
                <div style="border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px;">
                    <h2 style="font-size: 18px; margin: 0; color: #0f172a; font-weight: 700;">${n.name}</h2>
                    <div style="color: #0284c7; font-weight: 600; font-size: 13px; margin: 2px 0;">${n.title}</div>
                    <div style="color: #64748b; font-size: 10px;">${n.contact}</div>
                </div>

                <div style="margin-bottom: 14px;">
                    <h4 style="text-transform: uppercase; font-size: 11px; color: #0f172a; margin: 0 0 4px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Profil</h4>
                    <p style="margin: 0; color: #475569;">${n.summary}</p>
                </div>

                <div style="margin-bottom: 14px;">
                    <h4 style="text-transform: uppercase; font-size: 11px; color: #0f172a; margin: 0 0 4px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Berufserfahrung</h4>
                    <ul style="margin: 4px 0 0 16px; padding: 0; color: #475569;">${i}</ul>
                </div>

                <div style="margin-bottom: 14px;">
                    <h4 style="text-transform: uppercase; font-size: 11px; color: #0f172a; margin: 0 0 4px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Ausbildung</h4>
                    <ul style="margin: 4px 0 0 16px; padding: 0; color: #475569;">${s}</ul>
                </div>

                <div>
                    <h4 style="text-transform: uppercase; font-size: 11px; color: #0f172a; margin: 0 0 4px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Kenntnisse &amp; Skills</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;">
                        ${t.map(r=>`<span style="background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: 500;">${r}</span>`).join("")}
                    </div>
                </div>
            </div>
        `},bindEvents(n,e,t){const i=()=>{const l=this.getFormData(n),d=n.querySelector("#cv-live-preview-box");d&&(d.innerHTML=this.generatePreviewHtml(l,this.selectedTemplate))};n.querySelectorAll("input, textarea").forEach(l=>{l.addEventListener("input",i)});const s=n.querySelector("#cv-template-select");s&&s.addEventListener("change",l=>{this.selectedTemplate=l.target.value,i()});const r=n.querySelector("#btn-save-cv-structure");r&&r.addEventListener("click",()=>{const l=this.getFormData(n);t.cvStructured=l,t.name=l.name,t.title=l.title,t.experience=l.experience,t.skills=l.skills,y.saveProfile(t),r.textContent="Gespeichert!",setTimeout(()=>{r.innerHTML='<i data-lucide="save"></i> Im Profil speichern',window.lucide&&lucide.createIcons()},2e3)});const a=n.querySelector("#btn-export-cv-pdf");a&&a.addEventListener("click",()=>{const l=this.getFormData(n);ve({...t,...l},this.selectedTemplate)});const o=n.querySelector("#btn-ai-tailor-cv");o&&e&&o.addEventListener("click",async()=>{o.disabled=!0,o.innerHTML='<i data-lucide="loader" class="spin"></i> Optimiere mit KI...',window.lucide&&lucide.createIcons();const l=n.querySelector("#cv-input-summary"),d=n.querySelector("#cv-input-experience"),u=`Passe das folgende Kurzprofil und die Berufserfahrung subtil und professionell für die Bewerbung als "${e.title}" bei "${e.company}" an. Hebe relevante Schlagworte hervor.

Aktuelles Profil:
${l.value}

Aktuelle Erfahrung:
${d.value}

Antworte im Format:
ZUSAMMENFASSUNG: [text]
ERFAHRUNG: [text]`;try{let c="";if(B.hasApiKey()?c=await B.generateText(u,"Du bist ein professioneller Bewerbungscoach."):c=`ZUSAMMENFASSUNG: Zielstrebiger ${e.title} mit tiefem Verständnis für moderne Architekturen, skalierbare Webprojekte und cross-funktionale Zusammenarbeit bei ${e.company}.
ERFAHRUNG:
- Fokus auf Performance-Optimierung und agile Code-Reviews passend für ${e.title}
${d.value}`,c.includes("ZUSAMMENFASSUNG:")&&c.includes("ERFAHRUNG:")){const p=c.split("ERFAHRUNG:");l.value=p[0].replace("ZUSAMMENFASSUNG:","").trim(),d.value=p[1].trim()}i()}catch(c){console.error("Tailor error:",c)}finally{o.disabled=!1,o.innerHTML=`<i data-lucide="sparkles"></i> Per KI auf "${e.company}" zuschneiden`,window.lucide&&lucide.createIcons()}})},getFormData(n){var i,s,r,a,o,l,d;const t=(((i=n.querySelector("#cv-input-skills"))==null?void 0:i.value)||"").split(",").map(u=>u.trim()).filter(Boolean);return{name:((s=n.querySelector("#cv-input-name"))==null?void 0:s.value)||"",title:((r=n.querySelector("#cv-input-title"))==null?void 0:r.value)||"",contact:((a=n.querySelector("#cv-input-contact"))==null?void 0:a.value)||"",summary:((o=n.querySelector("#cv-input-summary"))==null?void 0:o.value)||"",experience:((l=n.querySelector("#cv-input-experience"))==null?void 0:l.value)||"",education:((d=n.querySelector("#cv-input-education"))==null?void 0:d.value)||"",skills:t}}},Qe={messages:[],mode:"interview",init(n,e){this.messages=[{role:"assistant",text:`Hallo ${e.name||""}! Ich bin dein persönlicher KI-Karrierecoach & Verhandlungspartner. Wir können ein freies Vorstellungsgespräch für **"${n.title}"** bei **"${n.company}"** simulieren oder eine anspruchsvolle Gehaltsverhandlung üben. Wie möchtest du starten?`}]},render(n,e,t){this.messages.length===0&&this.init(e,t),n.innerHTML=`
            <div class="ai-mentor-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="bot"></i> KI-Mentor &amp; Sparringspartner</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Interaktives Echtzeit-Coaching für Bewerbungsgespräche und Gehaltsverhandlungen
                        </p>
                    </div>
                    <div class="flex-row gap-8">
                        <button class="btn btn-secondary btn-sm ${this.mode==="interview"?"active":""}" id="btn-mode-interview">
                            <i data-lucide="user-check"></i> Interview-Training
                        </button>
                        <button class="btn btn-secondary btn-sm ${this.mode==="negotiation"?"active":""}" id="btn-mode-negotiation">
                            <i data-lucide="dollar-sign"></i> Gehalts-Sparring
                        </button>
                        <button class="btn btn-secondary btn-sm" id="btn-reset-chat" title="Chat zurücksetzen">
                            <i data-lucide="rotate-ccw"></i>
                        </button>
                    </div>
                </div>

                <div class="mentor-chat-history glass-card" style="padding: 16px; min-height: 380px; max-height: 480px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; background: rgba(0,0,0,0.15);">
                    ${this.messages.map(i=>`
                        <div style="display: flex; gap: 10px; align-self: ${i.role==="user"?"flex-end":"flex-start"}; max-width: 82%;">
                            ${i.role==="assistant"?`
                                <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0;">
                                    <i data-lucide="bot" style="width: 18px; height: 18px;"></i>
                                </div>
                            `:""}
                            <div class="glass-card" style="padding: 12px 16px; border-radius: 12px; font-size: 0.9rem; line-height: 1.5; ${i.role==="user"?"background: var(--color-primary); color: #ffffff;":"background: var(--card-bg); border-left: 3px solid var(--color-primary);"}">
                                ${this.formatMessageText(i.text)}
                            </div>
                        </div>
                    `).join("")}
                </div>

                <form id="mentor-chat-form" style="display: flex; gap: 10px;">
                    <input type="text" id="mentor-chat-input" class="form-input" style="flex: 1;" placeholder="Schreibe deine Antwort oder Frage..." autocomplete="off">
                    <button type="submit" class="btn btn-primary" id="btn-send-mentor">
                        <i data-lucide="send"></i> Senden
                    </button>
                </form>
            </div>
        `,window.lucide&&lucide.createIcons(),this.scrollToBottom(n),this.bindEvents(n,e,t)},formatMessageText(n){return n.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br>")},scrollToBottom(n){const e=n.querySelector(".mentor-chat-history");e&&(e.scrollTop=e.scrollHeight)},bindEvents(n,e,t){var a,o,l;const i=n.querySelector("#mentor-chat-form"),s=n.querySelector("#mentor-chat-input"),r=n.querySelector("#btn-send-mentor");i&&s&&i.addEventListener("submit",async d=>{d.preventDefault();const u=s.value.trim();if(!u)return;this.messages.push({role:"user",text:u}),s.value="",this.render(n,e,t),r.disabled=!0;const c={role:"assistant",text:"Analysiere Antwort..."};this.messages.push(c),this.render(n,e,t);const p=await this.generateAiResponse(u,e,t);c.text=p,r.disabled=!1,this.render(n,e,t)}),(a=n.querySelector("#btn-mode-interview"))==null||a.addEventListener("click",()=>{this.mode="interview",this.messages.push({role:"assistant",text:`🎯 **Interview-Modus aktiviert:** Stellen wir uns vor, das Vorstellungsgespräch für **${e.title}** beginnt jetzt.

*Frage: "Erzählen Sie uns kurz von sich und warum Sie der/die ideale Kandidat(in) für diese Position bei ${e.company} sind?"*`}),this.render(n,e,t)}),(o=n.querySelector("#btn-mode-negotiation"))==null||o.addEventListener("click",()=>{this.mode="negotiation",this.messages.push({role:"assistant",text:`💼 **Gehalts-Sparring aktiviert:** Wir befinden uns in der finalen Angebotsphase für **${e.title}**.

*HR-Manager: "Herr/Frau ${t.name||"Bewerber"}, wir möchten Ihnen die Stelle sehr gerne anbieten. Unser Standard-Budget für diese Position liegt bei ${Math.round((e.salary||65e3)*.9).toLocaleString("de-DE")} € brutto im Jahr. Wie stehen Sie dazu?"*`}),this.render(n,e,t)}),(l=n.querySelector("#btn-reset-chat"))==null||l.addEventListener("click",()=>{this.init(e,t),this.render(n,e,t)})},async generateAiResponse(n,e,t){const i=`Du bist ein erfahrener Bewerbungs- und Karrierecoach sowie HR-Verhandlungsexperte.
Der Bewerber bewirbt sich als "${e.title}" bei "${e.company}".
Das Anforderungsprofil: ${e.description||""}.
Profil des Bewerbers: Skills [${(t.skills||[]).join(", ")}], Erfahrung: ${t.experience||""}.
Aktueller Modus: ${this.mode==="negotiation"?"Gehaltsverhandlung (spiele einen fordernden, aber fairen HR-Verhandlungspartner)":"Bewerbungsgespräch"}.

Gib prägnantes Feedback zur letzten Antwort des Nutzers (1-2 Sätze Lob/Verbesserung) und führe das Gespräch dann direkt mit einer spannenden Folgefrage oder Gegenreaktion weiter. Halte die Antworten motivierend und professionell.`;if(B.hasApiKey())try{return await B.generateText(n,i)}catch(s){console.error("Gemini Chat error:",s)}return this.mode==="negotiation"?`Sehr gut argumentiert! Du hast deinen Mehrwert mit deinen Skills in **${(t.skills||[])[0]||"Frontend"}** klar hervorgehoben.

*HR-Gegenfrage: "Wir können beim Grundgehalt auf ${(e.salary||7e4).toLocaleString("de-DE")} € gehen, wenn wir dafür einen jährlichen Leistungsbonus und 2 zusätzliche Homeoffice-Tage vereinbaren. Wäre das für Sie ein gangbarer Weg?"*`:`Starke Antwort! Du hast eine gute Struktur gewählt. Achte darauf, konkrete Kennzahlen oder Ergebnisse (z. B. Performance-Steigerung in Prozent) zu erwähnen.

*Nächste Frage: "Wie gehen Sie bei ${e.company} vor, wenn es im Projektteam zu Meinungsverschiedenheiten über technische Architekturentscheidungen kommt?"*`}},Ye={selectedTemplate:"thank_you",render(n,e,t){n.innerHTML=`
            <div class="email-suite-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="mail"></i> Intelligente E-Mail-Suite &amp; Vorlagen</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Professionelle E-Mails für jeden Schritt des Bewerbungsprozesses bei "${e?e.company:"Unternehmen"}"
                        </p>
                    </div>
                    <div class="flex-row gap-8">
                        <select id="email-template-select" class="form-input" style="padding: 6px 12px; width: auto;">
                            <option value="thank_you" ${this.selectedTemplate==="thank_you"?"selected":""}>Dankschreiben nach Interview</option>
                            <option value="follow_up" ${this.selectedTemplate==="follow_up"?"selected":""}>Status-Nachfrage (Follow-up)</option>
                            <option value="salary_counter" ${this.selectedTemplate==="salary_counter"?"selected":""}>Gehalts-Gegenangebot</option>
                            <option value="decline_offer" ${this.selectedTemplate==="decline_offer"?"selected":""}>Höfliche Absage an Firma</option>
                        </select>
                    </div>
                </div>

                <div class="glass-card" style="padding: 20px; margin-bottom: 16px;">
                    <div class="form-group" style="margin-bottom: 12px;">
                        <label style="font-size: 0.85rem; font-weight: 600;">Empfänger-E-Mail (Ansprechpartner)</label>
                        <input type="email" id="email-recipient" class="form-input" placeholder="z.B. hr@${((e==null?void 0:e.company)||"firma").toLowerCase().replace(/\s+/g,"")}.de" value="${(e==null?void 0:e.contactEmail)||""}">
                    </div>
                    <div class="form-group" style="margin-bottom: 12px;">
                        <label style="font-size: 0.85rem; font-weight: 600;">Betreffzeile</label>
                        <input type="text" id="email-subject" class="form-input" value="${this.getDefaultSubject(this.selectedTemplate,e,t)}">
                    </div>
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label style="font-size: 0.85rem; font-weight: 600;">Nachrichtentext</label>
                        <textarea id="email-body-text" rows="10" class="form-input" style="font-family: inherit; font-size: 0.9rem; line-height: 1.5;">${this.getDefaultBody(this.selectedTemplate,e,t)}</textarea>
                    </div>

                    <div class="flex-between align-center">
                        <button class="btn btn-secondary" id="btn-ai-enhance-email">
                            <i data-lucide="sparkles"></i> Per KI personalisieren
                        </button>
                        <div class="flex-row gap-8">
                            <button class="btn btn-secondary" id="btn-copy-email-body">
                                <i data-lucide="copy"></i> Text kopieren
                            </button>
                            <button class="btn btn-primary" id="btn-open-mailto">
                                <i data-lucide="send"></i> Im E-Mail-Programm öffnen (mailto:)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(n,e,t)},getDefaultSubject(n,e,t){const i=e?e.title:"Bewerbung";e&&e.company;const s=t.name||"Bewerber";switch(n){case"thank_you":return`Vielen Dank für das angenehme Gespräch – Bewerbung als ${i}`;case"follow_up":return`Kurze Nachfrage zum Stand meiner Bewerbung als ${i} (${s})`;case"salary_counter":return`Rückmeldung zum Vertragsangebot – ${i} (${s})`;case"decline_offer":return`Bewerbung als ${i} – Vielen Dank für das Angebot`;default:return`Bewerbung als ${i} – ${s}`}},getDefaultBody(n,e,t){const i=e?e.title:"die offene Position",s=e?e.company:"Ihrem Unternehmen",r=t.name||"Alex Neumann";switch(n){case"thank_you":return`Sehr geehrte Damen und Herren,

vielen Dank für das sehr sympathische und informative Gespräch am gestrigen Tag über die Position als ${i} bei ${s}.

Der Einblick in Ihre aktuellen Projekte und die offene Teamkultur haben meinen Wunsch, Ihr Team tatkräftig zu unterstützen, nochmals bekräftigt. Besonders die Herausforderungen im Bereich moderner Technologien passen ideal zu meinen Erfahrungen.

Ich freue mich auf Ihre Rückmeldung zum weiteren Ablauf.

Herzliche Grüße,
${r}`;case"follow_up":return`Sehr geehrte Damen und Herren,

ich hoffe, Sie hatten eine erfolgreiche Woche.

Vor zwei Wochen hatte ich meine Bewerbungsunterlagen für die Stelle als ${i} bei ${s} eingereicht (bzw. führten wir unser Erstgespräch). Da mir die Position und Ihre Unternehmenskultur sehr zusagen, möchte ich mich kurz nach dem aktuellen Stand des Auswahlprozesses erkundigen.

Sollten Sie noch zusätzliche Unterlagen oder Referenzen von mir benötigen, stehe ich Ihnen jederzeit gerne zur Verfügung.

Beste Grüße,
${r}`;case"salary_counter":return`Sehr geehrte Damen und Herren,

vielen Dank für das attraktive Angebot und das entgegengebrachte Vertrauen. Ich freue mich sehr über die Aussicht, als ${i} bei ${s} zu starten.

Nach eingehender Prüfung der Rahmenbedingungen und im Abgleich mit meinen Erfahrungen sowie dem Marktstandard möchte ich anfragen, ob wir beim Grundgehalt einen Rahmen von ${((e==null?void 0:e.salary)||7e4).toLocaleString("de-DE")} € brutto/Jahr vereinbaren können.

Ich bin zuversichtlich, dass wir eine für beide Seiten hervorragende Einigung finden werden, und freue mich auf ein kurzes Telefonat dazu.

Mit freundlichen Grüßen,
${r}`;case"decline_offer":return`Sehr geehrte Damen und Herren,

vielen Dank für das Angebot und die Zeit, die Sie sich in den vergangenen Gesprächen für mich genommen haben. Die Einblicke in ${s} waren überaus positiv.

Nach reiflicher Überlegung habe ich mich jedoch entschieden, ein anderes Angebot anzunehmen, das noch etwas spezifischer zu meiner langfristigen Spezialisierung passt.

Ich wünsche Ihnen und dem Team weiterhin viel Erfolg und alles Gute.

Beste Grüße,
${r}`;default:return`Sehr geehrte Damen und Herren,

vielen Dank für den Austausch.

Mit freundlichen Grüßen,
${r}`}},bindEvents(n,e,t){const i=n.querySelector("#email-template-select"),s=n.querySelector("#email-subject"),r=n.querySelector("#email-body-text");i&&i.addEventListener("change",d=>{this.selectedTemplate=d.target.value,s.value=this.getDefaultSubject(this.selectedTemplate,e,t),r.value=this.getDefaultBody(this.selectedTemplate,e,t)});const a=n.querySelector("#btn-copy-email-body");a&&a.addEventListener("click",()=>{navigator.clipboard.writeText(r.value),a.textContent="Kopiert!",setTimeout(()=>{a.innerHTML='<i data-lucide="copy"></i> Text kopieren',window.lucide&&lucide.createIcons()},2e3)});const o=n.querySelector("#btn-open-mailto");o&&o.addEventListener("click",()=>{var b;const d=((b=n.querySelector("#email-recipient"))==null?void 0:b.value.trim())||"",u=encodeURIComponent(s.value),c=encodeURIComponent(r.value),p=`mailto:${d}?subject=${u}&body=${c}`;window.location.href=p});const l=n.querySelector("#btn-ai-enhance-email");l&&l.addEventListener("click",async()=>{l.disabled=!0,l.innerHTML='<i data-lucide="loader" class="spin"></i> Verfeinere E-Mail...',window.lucide&&lucide.createIcons();const d=`Formuliere die folgende E-Mail (${this.selectedTemplate}) für die Bewerbung als "${e==null?void 0:e.title}" bei "${e==null?void 0:e.company}" noch eleganter, überzeugender und persönlicher. Halte den Ton professionell und sympathisch:

${r.value}`;try{let u="";B.hasApiKey()?u=await B.generateText(d,"Du bist ein professioneller Bewerbungs- und Kommunikationsexperte."):u=r.value+`

P.S.: Ich habe mit großem Interesse Ihre jüngsten Meilensteine bei ${(e==null?void 0:e.company)||"Ihrem Unternehmen"} verfolgt und freue mich auf die Zusammenarbeit!`,r.value=u}catch(u){console.error("Email refinement error:",u)}finally{l.disabled=!1,l.innerHTML='<i data-lucide="sparkles"></i> Per KI personalisieren',window.lucide&&lucide.createIcons()}})}},Xe={analysisResult:null,render(n,e,t){n.innerHTML=`
            <div class="reference-checker-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="file-badge"></i> KI-Arbeitszeugnis-Prüfer &amp; HR-Code Entschlüssler</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Lies dein Zwischen- oder Endzeugnis ein, um versteckte HR-Geheimcodes und deine Gesamtnote (1-5) zu prüfen.
                        </p>
                    </div>
                    <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
                        <i data-lucide="upload"></i> PDF-Zeugnis einlesen
                        <input type="file" id="ref-pdf-input" accept="application/pdf" style="display: none;">
                    </label>
                </div>

                <div id="ref-parse-status" style="margin-bottom: 12px; display: none;" class="alert alert-info"></div>

                <div class="form-group" style="margin-bottom: 16px;">
                    <label style="font-weight: 600;">Zeugnistext:</label>
                    <textarea id="ref-text-input" rows="8" class="form-input" placeholder="Füge den Text deines Arbeitszeugnisses hier ein (z.B. Leistungsbeurteilung, Verhalten, Schlussformel)...">Herr/Frau Neumann erledigte die ihm/ihr übertragenen Aufgaben stets zu unserer vollsten Zufriedenheit. Sein/Ihr Verhalten gegenüber Vorgesetzten und Kollegen war jederzeit einwandfrei. Wir bedauern sein/ihr Ausscheiden sehr und danken ihm/ihr für die stets sehr gute Zusammenarbeit.</textarea>
                </div>

                <div class="action-bar flex-between align-center" style="margin-bottom: 20px;">
                    <button class="btn btn-primary" id="btn-analyze-reference">
                        <i data-lucide="sparkles"></i> Zeugnis jetzt analysieren &amp; Note berechnen
                    </button>
                </div>

                <div id="ref-analysis-output"></div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(n,e,t)},bindEvents(n,e,t){const i=n.querySelector("#ref-pdf-input"),s=n.querySelector("#ref-parse-status"),r=n.querySelector("#ref-text-input"),a=n.querySelector("#btn-analyze-reference"),o=n.querySelector("#ref-analysis-output");i&&i.addEventListener("change",async l=>{const d=l.target.files[0];if(d){s.style.display="block",s.className="alert alert-info",s.textContent=`Lese PDF "${d.name}" ein...`;try{const u=await O.extractTextFromPdf(d);r.value=u,s.className="alert alert-success",s.textContent=`PDF erfolgreich eingelesen (${u.length} Zeichen).`}catch(u){s.className="alert alert-danger",s.textContent=`Fehler beim PDF-Import: ${u.message}`}}}),a&&a.addEventListener("click",async()=>{const l=r.value.trim();if(!l)return;a.disabled=!0,a.innerHTML='<i data-lucide="loader" class="spin"></i> Analysiere Zeugniscodes...',window.lucide&&lucide.createIcons();const d=await this.evaluateReference(l);this.renderEvaluationResults(o,d),a.disabled=!1,a.innerHTML='<i data-lucide="sparkles"></i> Zeugnis jetzt analysieren &amp; Note berechnen',window.lucide&&lucide.createIcons()})},async evaluateReference(n){const e=n.toLowerCase();let t=2;const i=[];e.includes("stets zur vollsten zufriedenheit")||e.includes("stets zu unserer vollsten zufriedenheit")?(i.push({category:"Arbeitsleistung",phrase:"stets zu unserer vollsten Zufriedenheit",grade:"Note 1 (Sehr gut)",type:"positive"}),t=Math.min(t,1)):e.includes("zur vollsten zufriedenheit")||e.includes("stets zur vollen zufriedenheit")?i.push({category:"Arbeitsleistung",phrase:"stets zur vollen Zufriedenheit",grade:"Note 2 (Gut)",type:"positive"}):e.includes("zur vollen zufriedenheit")?(i.push({category:"Arbeitsleistung",phrase:"zur vollen Zufriedenheit",grade:"Note 3 (Befriedigend)",type:"warning"}),t=Math.max(t,3)):(e.includes("zur zufriedenheit")||e.includes("im großen und ganzen"))&&(i.push({category:"Arbeitsleistung",phrase:"zur Zufriedenheit / im Großen und Ganzen",grade:"Note 4 (Ausreichend)",type:"danger"}),t=Math.max(t,4)),e.includes("vorgesetzten und kollegen")||e.includes("vorgesetzten sowie mitarbeitern")?i.push({category:"Sozialverhalten",phrase:"Verhalten gegenüber Vorgesetzten und Kollegen einwandfrei",grade:"Note 1-2 (Klassische korrekte Reihenfolge)",type:"positive"}):e.includes("kollegen und vorgesetzten")&&(i.push({category:"Sozialverhalten (Achtung)",phrase:"Kollegen vor Vorgesetzten genannt",grade:"Hinweis auf Autoritätskonflikte / Kritik am Verhalten",type:"danger"}),t=Math.max(t,3)),e.includes("bedauern")&&(e.includes("danken")||e.includes("dank"))?i.push({category:"Schlussformel",phrase:"Bedauern und Dank für die Zusammenarbeit ausgedrückt",grade:"Sehr wertschätzendes Ausscheiden",type:"positive"}):e.includes("bedauern")||(i.push({category:"Schlussformel (Achtung)",phrase:"Kein Bedauern über das Ausscheiden genannt",grade:"Versteckter Abzug (Unternehmen ist nicht unglücklich über den Weggang)",type:"danger"}),t=Math.max(t,3));let s="";if(B.hasApiKey())try{const r=`Analysiere folgendes deutsches Arbeitszeugnis professionell nach den gängigen HR-Geheimcodes. Gib eine Gesamtnote (1-5) und 2-3 konkrete Tipps/Auffälligkeiten:

${n}`;s=await B.generateText(r,"Du bist ein erfahrener Fachanwalt für Arbeitsrecht und HR-Experte.")}catch(r){console.error(r)}return{overallGrade:t,findings:i,aiExpertOpinion:s}},renderEvaluationResults(n,e){const t={1:"Sehr Gut (Note 1)",2:"Gut (Note 2)",3:"Befriedigend (Note 3)",4:"Ausreichend (Note 4)",5:"Mangelhaft (Note 5)"}[e.overallGrade]||"Gut (Note 2)",i=e.overallGrade<=2?"var(--color-success)":e.overallGrade===3?"var(--color-warning)":"var(--color-danger)";n.innerHTML=`
            <div class="glass-card" style="padding: 24px; border-left: 4px solid ${i}; margin-top: 16px;">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <span class="text-secondary" style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700;">Ermittelte Zeugnisnote</span>
                        <h2 style="margin: 2px 0 0 0; color: ${i}; font-size: 1.6rem;">${t}</h2>
                    </div>
                    <span class="badge ${e.overallGrade<=2?"badge-offer":"badge-interviewing"}">
                        ${e.findings.length} HR-Codes erkannt
                    </span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                    ${e.findings.map(s=>`
                        <div style="background: rgba(0,0,0,0.2); padding: 12px 14px; border-radius: var(--radius-md); border-left: 3px solid ${s.type==="positive"?"var(--color-success)":s.type==="warning"?"var(--color-warning)":"var(--color-danger)"}; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="font-size: 0.88rem; display: block; color: var(--text-primary);">${s.category}: "${s.phrase}"</strong>
                                <span style="font-size: 0.8rem; color: var(--text-secondary);">${s.grade}</span>
                            </div>
                            <span class="badge ${s.type==="positive"?"badge-offer":"badge-interviewing"}" style="font-size: 0.7rem;">
                                ${s.type==="positive"?"✓ Positiv":"⚠ Auffällig"}
                            </span>
                        </div>
                    `).join("")}
                </div>

                ${e.aiExpertOpinion?`
                    <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); padding: 16px; border-radius: var(--radius-md);">
                        <h4 style="margin: 0 0 8px 0; color: var(--color-primary); font-size: 0.9rem;"><i data-lucide="sparkles"></i> KI-Expertenurteil:</h4>
                        <p style="margin: 0; font-size: 0.85rem; line-height: 1.5; color: var(--text-primary); white-space: pre-wrap;">${e.aiExpertOpinion}</p>
                    </div>
                `:""}
            </div>
        `,window.lucide&&lucide.createIcons()}},et={selectedType:"recruiter_direct",render(n,e,t){n.innerHTML=`
            <div class="outreach-gen-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <div>
                        <h3 style="margin: 0;"><i data-lucide="send"></i> LinkedIn &amp; Xing Direktnachrichten-Generator</h3>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 2px;">
                            Prägnante, hochgradig konvertierende Networking-Nachrichten für Recruiter &amp; Teamleiter
                        </p>
                    </div>
                    <select id="outreach-type-select" class="form-input" style="padding: 6px 12px; width: auto;">
                        <option value="recruiter_direct" ${this.selectedType==="recruiter_direct"?"selected":""}>Nachricht an Recruiter (nach Bewerbung)</option>
                        <option value="cold_pitch" ${this.selectedType==="cold_pitch"?"selected":""}>Initiativer Pitch an Teamleiter</option>
                        <option value="connect_note" ${this.selectedType==="connect_note"?"selected":""}>Vernetzungsanfrage (max. 300 Zeichen)</option>
                        <option value="headhunter_reply" ${this.selectedType==="headhunter_reply"?"selected":""}>Antwort auf Headhunter-InMail</option>
                    </select>
                </div>

                <div class="glass-card" style="padding: 20px;">
                    <div class="flex-between align-center" style="margin-bottom: 8px;">
                        <label style="font-size: 0.85rem; font-weight: 600;">Nachrichtentext:</label>
                        <span id="outreach-char-count" class="text-secondary" style="font-size: 0.8rem;">0 Zeichen</span>
                    </div>

                    <textarea id="outreach-text-output" rows="6" class="form-input" style="font-family: inherit; font-size: 0.9rem; line-height: 1.5; margin-bottom: 16px;">${this.getDefaultMessage(this.selectedType,e,t)}</textarea>

                    <div class="flex-between align-center">
                        <button class="btn btn-secondary" id="btn-ai-shorten-pitch">
                            <i data-lucide="sparkles"></i> Per KI auf den Punkt bringen
                        </button>
                        <div class="flex-row gap-8">
                            <button class="btn btn-primary" id="btn-copy-outreach">
                                <i data-lucide="copy"></i> In Zwischenablage kopieren
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(n,e,t),this.updateCharCount(n)},getDefaultMessage(n,e,t){const i=e?e.title:"Frontend Developer",s=e?e.company:"Ihrem Unternehmen",r=t.name||"Alex Neumann",a=(t.skills||[])[0]||"Webentwicklung";switch(n){case"recruiter_direct":return`Hallo [Name],

ich habe mich soeben auf die Stelle als ${i} bei ${s} beworben. Da ich mehrjährige Erfahrung mit ${a} mitbringe und mich eure Projekte sehr begeistern, wollte ich mich auch hier kurz persönlich vernetzen.

Ich freue mich auf einen Austausch!

Beste Grüße,
${r}`;case"cold_pitch":return`Hallo [Name],

ich verfolge die Entwicklung von ${s} schon länger mit großem Interesse. Als ${t.title||"Entwickler"} mit Fokus auf ${a} unterstütze ich Teams dabei, moderne Architekturen effizient umzusetzen. Habt ihr aktuell Bedarf an Verstärkung in eurem Tech-Team?

Herzliche Grüße,
${r}`;case"connect_note":return`Hallo [Name], ich bin ${r} (${i}). Ich verfolge die Tech-Arbeit bei ${s} sehr gerne und würde mich freuen, mein berufliches Netzwerk mit Ihnen zu erweitern!`;case"headhunter_reply":return`Hallo [Name],

vielen Dank für die Kontaktaufnahme und das spannende Angebot als ${i}! Die Position klingt sehr interessant, insbesondere im Hinblick auf ${a}. Ich würde mich über ein kurzes 15-minütiges Kennenlerngespräch freuen.

Viele Grüße,
${r}`;default:return`Hallo [Name],

vielen Dank für den Austausch!

Beste Grüße,
${r}`}},updateCharCount(n){var i;const e=((i=n.querySelector("#outreach-text-output"))==null?void 0:i.value)||"",t=n.querySelector("#outreach-char-count");t&&(t.textContent=`${e.length} Zeichen ${e.length<=300?"(Perfekt für LinkedIn-Notiz)":""}`)},bindEvents(n,e,t){const i=n.querySelector("#outreach-type-select"),s=n.querySelector("#outreach-text-output");i&&s&&i.addEventListener("change",o=>{this.selectedType=o.target.value,s.value=this.getDefaultMessage(this.selectedType,e,t),this.updateCharCount(n)}),s&&s.addEventListener("input",()=>this.updateCharCount(n));const r=n.querySelector("#btn-copy-outreach");r&&s&&r.addEventListener("click",()=>{navigator.clipboard.writeText(s.value),r.textContent="Kopiert!",setTimeout(()=>{r.innerHTML='<i data-lucide="copy"></i> In Zwischenablage kopieren',window.lucide&&lucide.createIcons()},2e3)});const a=n.querySelector("#btn-ai-shorten-pitch");a&&s&&a.addEventListener("click",async()=>{a.disabled=!0,a.innerHTML='<i data-lucide="loader" class="spin"></i> Optimiere...',window.lucide&&lucide.createIcons();const o=`Kürze und optimiere folgende LinkedIn-Nachricht, sodass sie maximal sympathisch, professionell und unter 300 Zeichen lang ist:

${s.value}`;try{let l="";B.hasApiKey()?l=await B.generateText(o,"Du bist ein Experte für LinkedIn Networking und Social Recruiting."):l=s.value.replace(/\n\n/g," ").slice(0,280),s.value=l,this.updateCharCount(n)}catch(l){console.error(l)}finally{a.disabled=!1,a.innerHTML='<i data-lucide="sparkles"></i> Per KI auf den Punkt bringen',window.lucide&&lucide.createIcons()}})}},tt={render(n,e,t){var s;const i=A.generateInterviewQuestions(e.title,t.skills);n.innerHTML=`
            <div class="cheat-sheet-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <h3><i data-lucide="file-spreadsheet"></i> 1-Pager Interview Spickzettel</h3>
                    <button class="btn btn-secondary btn-sm" id="btn-print-cheatsheet">
                        <i data-lucide="printer"></i> Spickzettel drucken / PDF
                    </button>
                </div>

                <div class="printable-cheatsheet glass-card" style="padding: 24px; background: var(--bg-surface-elevated);">
                    <div style="border-bottom: 2px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
                        <h2 style="margin: 0; font-size: 1.4rem;">Spickzettel: ${e.title}</h2>
                        <p class="text-secondary" style="margin: 4px 0 0 0;">Firma: <strong>${e.company}</strong> | Standort: ${e.location||"N/A"}</p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <h4 style="color: var(--color-primary); margin-bottom: 8px;"><i data-lucide="star"></i> Meine Top 3 Argumente</h4>
                            <ul style="padding-left: 18px; font-size: 0.85rem; line-height: 1.5;">
                                <li>Fundierte Kenntnisse in: ${t.skills.slice(0,4).join(", ")}</li>
                                <li>Praxiserfahrung im Erstellen moderner Web-Applikationen</li>
                                <li>Hohe Lernbereitschaft und schnelle Einarbeitung in neue Stacks</li>
                            </ul>
                        </div>

                        <div>
                            <h4 style="color: var(--color-primary); margin-bottom: 8px;"><i data-lucide="help-circle"></i> Fragen an den Arbeitgeber</h4>
                            <ul style="padding-left: 18px; font-size: 0.85rem; line-height: 1.5;">
                                <li>Wie sieht ein typischer Sprint / Arbeitstag im Team aus?</li>
                                <li>Welche Weiterbildungsmöglichkeiten werden gefördert?</li>
                                <li>Was sind die größten technischen Herausforderungen im nächsten Halbjahr?</li>
                            </ul>
                        </div>
                    </div>

                    <div style="margin-top: 20px;">
                        <h4 style="color: var(--color-primary); margin-bottom: 8px;"><i data-lucide="target"></i> Antizipierte Interview-Fragen</h4>
                        <ol style="padding-left: 18px; font-size: 0.85rem; line-height: 1.5;">
                            ${i.slice(0,3).map(r=>`<li>${r}</li>`).join("")}
                        </ol>
                    </div>
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),(s=n.querySelector("#btn-print-cheatsheet"))==null||s.addEventListener("click",()=>{window.print()})}},nt={render(n,e,t){const i=e.salary||65e3;n.innerHTML=`
            <div class="negotiator-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <h3><i data-lucide="calculator"></i> Gehaltsverhandlungs-Guide &amp; Gesamtpaket-Rechner</h3>
                    <span class="badge badge-offer">Brutto-Ziel: ${i.toLocaleString("de-DE")} € / Jahr</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <!-- Total Package Calculator -->
                    <div class="glass-card" style="padding: 20px;">
                        <h4><i data-lucide="package"></i> Gesamtpaket-Rechner</h4>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 16px;">
                            Erfasse alle vertraglichen Zusatzleistungen neben dem Grundgehalt:
                        </p>

                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.85rem;">Grundgehalt (Brutto / Jahr €):</label>
                            <input type="number" id="pkg-base-salary" class="form-input" value="${i}">
                        </div>

                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.85rem;">Bonus / Variable Vergütung (€):</label>
                            <input type="number" id="pkg-bonus" class="form-input" value="5000">
                        </div>

                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.85rem;">Remote / Homeoffice-Pauschale (€ / Jahr):</label>
                            <input type="number" id="pkg-remote-allowance" class="form-input" value="1200">
                        </div>

                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.85rem;">ÖPNV / Jobticket / Firmenwagen-Vorteil (€ / Jahr):</label>
                            <input type="number" id="pkg-transit" class="form-input" value="600">
                        </div>

                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.85rem;">Weiterbildungsbudget (€ / Jahr):</label>
                            <input type="number" id="pkg-education" class="form-input" value="1500">
                        </div>

                        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-color);" class="flex-between align-center">
                            <span style="font-weight: 700;">Effektiver Gesamtwert:</span>
                            <span id="pkg-total-value" style="font-size: 1.2rem; font-weight: 800; color: var(--color-success);">- €</span>
                        </div>
                    </div>

                    <!-- Argumentation Strategy -->
                    <div class="glass-card" style="padding: 20px;">
                        <h4><i data-lucide="shield-check"></i> Verhandlungs-Leitfaden</h4>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 16px;">
                            Argumentationspunkte für das Gehaltsgespräch mit ${e.company}:
                        </p>

                        <ul style="padding-left: 18px; font-size: 0.85rem; line-height: 1.6;">
                            <li><strong>Fachkompetenz:</strong> Abdeckung von Key-Skills (${t.skills.slice(0,3).join(", ")}).</li>
                            <li><strong>Vergleichbarer Markt-Benchmark:</strong> Für den Titel "${e.title}" liegt der übliche Korridor in ${e.location||"Deutschland"} bei ca. ${(i*.95).toLocaleString("de-DE")} € bis ${(i*1.15).toLocaleString("de-DE")} €.</li>
                            <li><strong>Zielvereinbarung:</strong> Biete an, eine variable Komponente an messbare Ziele zu knüpfen.</li>
                            <li><strong>Entwicklungs-Plan:</strong> Vereinbare eine Gehaltsüberprüfung nach der 6-monatigen Probezeit.</li>
                        </ul>
                    </div>
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(n)},bindEvents(n){const e=n.querySelector("#pkg-base-salary"),t=n.querySelector("#pkg-bonus"),i=n.querySelector("#pkg-remote-allowance"),s=n.querySelector("#pkg-transit"),r=n.querySelector("#pkg-education"),a=n.querySelector("#pkg-total-value"),o=()=>{const l=Number(e==null?void 0:e.value)||0,d=Number(t==null?void 0:t.value)||0,u=Number(i==null?void 0:i.value)||0,c=Number(s==null?void 0:s.value)||0,p=Number(r==null?void 0:r.value)||0,b=l+d+u+c+p;a&&(a.textContent=`${b.toLocaleString("de-DE")} € / Jahr`)};[e,t,i,s,r].forEach(l=>{l&&l.addEventListener("input",o)}),o()}},it={render(n,e,t){const i=t.skills||[],s=(e.description||"").toLowerCase(),r={docker:{name:"Docker & Containerization",time:"2-3 Tage",link:"https://docs.docker.com/get-started/",steps:["Grundlagen von Containern & Images","Dockerfile erstellen & verwalten","Docker Compose für Multi-Container Apps"]},react:{name:"React.js Fundamentals",time:"3-5 Tage",link:"https://react.dev/learn",steps:["Components, Props & State","Hooks (useState, useEffect, useMemo)","State Management & Router"]},typescript:{name:"TypeScript",time:"2-4 Tage",link:"https://www.typescriptlang.org/docs/",steps:["Interfaces, Types & Generics","Strict Mode & Type Guards","Integration in Build Tools"]},"next.js":{name:"Next.js Framework",time:"3 Tage",link:"https://nextjs.org/docs",steps:["App Router & Server Components","Server Actions & Data Fetching","SEO & Performance Tuning"]},"node.js":{name:"Node.js & Express",time:"3 Tage",link:"https://nodejs.org/en/docs/",steps:["Event Loop & Async I/O","REST APIs mit Express bauen","Middleware & Authentifizierung"]},kubernetes:{name:"Kubernetes (k8s)",time:"1 Woche",link:"https://kubernetes.io/docs/",steps:["Pods, Deployments & Services","ConfigMaps & Secrets","Helm Charts"]},graphql:{name:"GraphQL APIs",time:"2 Tage",link:"https://graphql.org/learn/",steps:["Queries, Mutations & Schemas","Apollo Client Integration","Resolvers & Subscriptions"]},figma:{name:"Figma for Developers",time:"1 Tag",link:"https://help.figma.com/",steps:["Auto-Layout & Components","Dev Mode Tokens auslesen","Design-to-Code Handoff"]},tailwind:{name:"TailwindCSS",time:"1 Tag",link:"https://tailwindcss.com/docs",steps:["Utility-First Konzept","Responsive Classes & Themes","Custom Plugins & Config"]}},a=Object.keys(r).filter(o=>s.includes(o)&&!i.some(l=>l.toLowerCase().includes(o)));n.innerHTML=`
            <div class="learning-roadmap-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <h3><i data-lucide="map"></i> Skill-Gap Learning Roadmap</h3>
                    <span class="badge badge-primary">${a.length} Fehlende Skills erkannt</span>
                </div>

                <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 20px;">
                    Maßgeschneiderte Lern-Roadmap für die Stelle <strong>${e.title}</strong> bei <strong>${e.company}</strong>, um bestehende Wissenslücken gezielt zu schließen:
                </p>

                ${a.length===0?`
                    <div class="glass-card empty-state" style="padding: 30px;">
                        <i data-lucide="check-circle2" style="color: var(--color-success); font-size: 2.5rem;"></i>
                        <h4>Perfektes Skill-Match!</h4>
                        <p class="text-secondary">Es wurden keine gravierenden Wissenslücken für diese Stelle identifiziert. Du bist bestens vorbereitet!</p>
                    </div>
                `:`
                    <div class="roadmap-cards-grid" style="display: flex; flex-direction: column; gap: 16px;">
                        ${a.map(o=>{const l=r[o];return`
                                <div class="glass-card" style="padding: 20px;">
                                    <div class="flex-between align-center" style="margin-bottom: 10px;">
                                        <h4 style="margin: 0; color: var(--color-primary);">${l.name}</h4>
                                        <span class="badge badge-saved"><i data-lucide="clock" style="width: 12px; height: 12px; display: inline;"></i> Ca. ${l.time}</span>
                                    </div>

                                    <div style="margin-bottom: 12px;">
                                        <strong style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary);">Empfohlener Lernpfad:</strong>
                                        <ol style="padding-left: 18px; font-size: 0.85rem; margin-top: 6px; line-height: 1.5;">
                                            ${l.steps.map(d=>`<li>${d}</li>`).join("")}
                                        </ol>
                                    </div>

                                    <a href="${l.link}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm flex-row align-center" style="display: inline-flex; width: auto; gap: 6px;">
                                        <i data-lucide="external-link"></i> Kostenlose Doku &amp; Tutorial öffnen
                                    </a>
                                </div>
                            `}).join("")}
                    </div>
                `}
            </div>
        `,window.lucide&&lucide.createIcons()}},st={selectedJobId:null,render(n,e=null){const t=document.getElementById(n);if(!t)return;const i=y.getJobs(),s=y.getProfile();if(i.length===0){t.innerHTML=`
                <div class="glass-card empty-state" style="padding: 60px 40px; min-height: 400px;">
                    <i data-lucide="sparkles"></i>
                    <h2>Bewerbungs-Copilot ist bereit!</h2>
                    <p>Füge zuerst Jobangebote hinzu, um den AI-gestützten Skill-Vergleich, Anschreiben-Generator, CV-Builder und Interview-Simulator zu nutzen.</p>
                </div>
            `,window.lucide&&lucide.createIcons();return}e?this.selectedJobId=e:(!this.selectedJobId||!i.some(o=>o.id===this.selectedJobId))&&(this.selectedJobId=i[0].id);const r=i.find(o=>o.id===this.selectedJobId)||i[0],a=A.analyzeJobMatch(r.description||"",s.skills||[]);t.innerHTML=`
            <div class="kanban-header">
                <h2>Bewerbungs-Copilot (AI)</h2>
                <span class="text-secondary">Analysiere Übereinstimmungen und entwerfe maßgeschneiderte Bewerbungen</span>
            </div>

            <div class="copilot-layout">
                <!-- Left panel: Job selection -->
                <div class="copilot-panel">
                    <div class="glass-card job-select-card">
                        <h3><i data-lucide="briefcase"></i> Job auswählen</h3>
                        <div class="job-selector-list">
                            ${i.map(o=>`
                                <button class="job-selector-item ${o.id===this.selectedJobId?"active":""}" data-id="${o.id}">
                                    <span class="title">${o.title}</span>
                                    <span class="company">${o.company}</span>
                                </button>
                            `).join("")}
                        </div>
                    </div>

                    <div class="glass-card" style="padding: 20px;">
                        <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 700; margin-bottom: 10px;">Profil-Skills</h4>
                        <div class="keyword-tags">
                            ${(s.skills||[]).map(o=>`<span class="keyword-badge match">${o}</span>`).join("")}
                        </div>
                    </div>
                </div>

                <!-- Right panel: AI Tools -->
                <div class="copilot-main">
                    <div class="copilot-match-row flex-row gap-16" style="margin-bottom: 20px;">
                        <div class="glass-card match-circle-card" style="text-align: center; padding: 20px; min-width: 160px;">
                            <div class="match-radial" style="font-size: 2.2rem; font-weight: 800; color: var(--color-primary);">
                                ${a.matchScore}%
                            </div>
                            <h4 style="font-size: 0.85rem; margin-top: 4px;">Skill-Übereinstimmung</h4>
                        </div>

                        <div class="glass-card match-details-card flex-1" style="padding: 20px;">
                            <h4 style="margin-bottom: 10px;">Anforderungs-Abgleich</h4>
                            <div class="keyword-lists flex-row gap-16">
                                <div class="keyword-col matching flex-1">
                                    <h5 style="color: var(--color-success); font-size: 0.8rem;"><i data-lucide="check-circle2"></i> Gefunden (${a.matchingSkills.length})</h5>
                                    <div class="keyword-tags" style="margin-top: 4px;">
                                        ${a.matchingSkills.map(o=>`<span class="keyword-badge match">${o}</span>`).join("")}
                                    </div>
                                </div>
                                <div class="keyword-col missing flex-1">
                                    <h5 style="color: var(--color-warning); font-size: 0.8rem;"><i data-lucide="alert-circle"></i> Fehlend (${a.missingSkills.length})</h5>
                                    <div class="keyword-tags" style="margin-top: 4px;">
                                        ${a.missingSkills.map(o=>`<span class="keyword-badge miss">${o}</span>`).join("")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- AI Tool Tabs -->
                    <div class="glass-card" style="padding: 24px;">
                        <nav class="tabs-nav flex-row gap-8" style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 20px; overflow-x: auto;">
                            <button class="tab-btn active" data-tab="tab-cover-letter"><i data-lucide="file-text"></i> Anschreiben</button>
                            <button class="tab-btn" data-tab="tab-cv-builder"><i data-lucide="award"></i> CV-Builder &amp; PDF</button>
                            <button class="tab-btn" data-tab="tab-showcase"><i data-lucide="folder-git-2"></i> Projekt-Showcase</button>
                            <button class="tab-btn" data-tab="tab-resignation"><i data-lucide="file-minus"></i> Kündigungsschreiben</button>
                            <button class="tab-btn" data-tab="tab-salary-radar"><i data-lucide="compass"></i> Gehalts-Radar</button>
                            <button class="tab-btn" data-tab="tab-onboarding"><i data-lucide="calendar"></i> 30-60-90 Onboarding</button>
                            <button class="tab-btn" data-tab="tab-inbox-sim"><i data-lucide="inbox"></i> E-Mail-Inbox Sync</button>
                            <button class="tab-btn" data-tab="tab-pitch-flyer"><i data-lucide="presentation"></i> Bewerber-Flyer</button>
                            <button class="tab-btn" data-tab="tab-contract-checker"><i data-lucide="shield-alert"></i> Vertrags-Checker</button>
                            <button class="tab-btn" data-tab="tab-audio-drill"><i data-lucide="headphones"></i> Audio-Drill</button>
                            <button class="tab-btn" data-tab="tab-ai-mentor"><i data-lucide="bot"></i> KI-Mentor &amp; Sparring</button>
                            <button class="tab-btn" data-tab="tab-email-suite"><i data-lucide="mail"></i> E-Mail-Suite</button>
                            <button class="tab-btn" data-tab="tab-outreach"><i data-lucide="send"></i> LinkedIn/Xing Pitch</button>
                            <button class="tab-btn" data-tab="tab-reference-checker"><i data-lucide="file-badge"></i> Zeugnis-Prüfer</button>
                            <button class="tab-btn" data-tab="tab-interview-prep"><i data-lucide="help-circle"></i> STAR-Simulator</button>
                            <button class="tab-btn" data-tab="tab-cv-optimizer"><i data-lucide="file-check"></i> CV-Parser</button>
                            <button class="tab-btn" data-tab="tab-cheat-sheet"><i data-lucide="file-spreadsheet"></i> 1-Pager Spickzettel</button>
                            <button class="tab-btn" data-tab="tab-negotiator"><i data-lucide="calculator"></i> Gehalts-Guide</button>
                            <button class="tab-btn" data-tab="tab-learning-roadmap"><i data-lucide="map"></i> Skill-Lernpfad</button>
                        </nav>

                        <div id="copilot-tab-content"></div>
                    </div>
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(t,r,s),this.switchTab("tab-cover-letter",r,s)},bindEvents(n,e,t){n.querySelectorAll(".job-selector-item").forEach(i=>{i.addEventListener("click",()=>{const s=i.getAttribute("data-id");this.selectedJobId=s,this.render("view-copilot",s)})}),n.querySelectorAll(".tabs-nav .tab-btn").forEach(i=>{i.addEventListener("click",()=>{n.querySelectorAll(".tabs-nav .tab-btn").forEach(r=>r.classList.remove("active")),i.classList.add("active");const s=i.getAttribute("data-tab");this.switchTab(s,e,t)})})},switchTab(n,e,t){const i=document.getElementById("copilot-tab-content");if(i)switch(n){case"tab-cover-letter":he.render(i,e,t);break;case"tab-cv-builder":Ze.render(i,e,t);break;case"tab-showcase":Je.render(i,e,t);break;case"tab-resignation":qe.render(i,e,t);break;case"tab-salary-radar":Ue.render(i,e,t);break;case"tab-onboarding":je.render(i,e,t);break;case"tab-inbox-sim":We.render(i,e,t);break;case"tab-pitch-flyer":Oe.render(i,e,t);break;case"tab-contract-checker":Ve.render(i,e,t);break;case"tab-audio-drill":fe.init(e,t),fe.render(i,e,t);break;case"tab-ai-mentor":Qe.render(i,e,t);break;case"tab-email-suite":Ye.render(i,e,t);break;case"tab-outreach":et.render(i,e,t);break;case"tab-reference-checker":Xe.render(i,e,t);break;case"tab-interview-prep":be.init(e,t),be.renderCurrentQuestion(i);break;case"tab-cv-optimizer":_e.render(i,e,t);break;case"tab-cheat-sheet":tt.render(i,e,t);break;case"tab-negotiator":nt.render(i,e,t);break;case"tab-learning-roadmap":it.render(i,e,t);break;default:he.render(i,e,t)}}},rt={parseEmail(n=""){const e=n.trim();if(!e)return null;const t=e.match(/https:\/\/[a-zA-Z0-9-]+\.zoom\.us\/j\/[^\s<>"]+/i),i=e.match(/https:\/\/teams\.microsoft\.com\/l\/meetup-join\/[^\s<>"]+/i),s=e.match(/https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/i),r=t?t[0]:i?i[0]:s?s[0]:"",a=t?"Zoom":i?"Microsoft Teams":s?"Google Meet":"Online / Telefon",o=e.match(/(\d{1,2})\.\s*(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|\d{1,2})\.?\s*(\d{4})?/i);let l=new Date;if(o){const k=parseInt(o[1],10),m=o[2];let g=new Date().getMonth();const f=["januar","februar","märz","april","mai","juni","juli","august","september","oktober","november","dezember"];if(isNaN(m)){const S=f.findIndex($=>$.startsWith(m.toLowerCase().slice(0,3)));S!==-1&&(g=S)}else g=parseInt(m,10)-1;const x=o[3]?parseInt(o[3],10):new Date().getFullYear();l=new Date(x,g,k)}const d=e.match(/(\d{1,2})[:.](\d{2})\s*(Uhr)?/i);let u="10:00";if(d){const k=d[1].padStart(2,"0"),m=d[2].padStart(2,"0");u=`${k}:${m}`}const c=e.match(/(mit freundlichen grüßen|viele grüße|beste grüße|grüße)\s*[\r\n]+([a-zA-ZäöüÄÖÜß\s]+)/i),p=c?c[2].trim().split(`
`)[0]:"",b=e.match(/(vorstellungsgespräch|interview|erstgespräch|einladung|stelle als|position als)\s*:?\s*([a-zA-ZäöüÄÖÜß0-9\s-]+)/i);return{title:b?b[0].trim():"Vorstellungsgespräch",dateIso:l.toISOString().split("T")[0],time:u,platform:a,videoLink:r,recruiterName:p,rawSnippet:e.slice(0,200)+"..."}}},at={currentDate:new Date,render(n){const e=document.getElementById(n);if(!e)return;const t=y.getJobs(),i=this.currentDate.getFullYear(),s=this.currentDate.getMonth(),r=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],a=[];t.forEach(p=>{p.deadline&&p.status!=="rejected"&&a.push({id:p.id,type:"deadline",dateStr:p.deadline,title:`Frist: ${p.company}`,subtitle:p.title,color:"var(--primary)"}),p.interviews&&Array.isArray(p.interviews)&&p.interviews.forEach(b=>{if(b.date){const v=b.date.slice(0,10);a.push({id:p.id,type:"interview",dateStr:v,title:`Interview: ${p.company}`,subtitle:b.round||"Gespräch",color:"var(--secondary)"})}})});const o=new Date(i,s,1),l=new Date(i,s+1,0);let d=o.getDay()-1;d===-1&&(d=6);const u=l.getDate(),c=[];for(let p=0;p<d;p++)c.push({isPadding:!0});for(let p=1;p<=u;p++){const b=`${i}-${String(s+1).padStart(2,"0")}-${String(p).padStart(2,"0")}`,v=a.filter(m=>m.dateStr===b),k=new Date().toDateString()===new Date(i,s,p).toDateString();c.push({dayNum:p,dateStr:b,events:v,isToday:k,isPadding:!1})}e.innerHTML=`
            <div class="kanban-header flex-between align-center">
                <div>
                    <h2>Bewerbungs-Kalender</h2>
                    <span class="text-secondary">Übersicht aller Fristen &amp; Interview-Termine</span>
                </div>
                <div class="flex-row gap-8">
                    <button class="btn btn-secondary btn-sm" id="btn-export-ics">
                        <i data-lucide="download"></i> .ICS Export
                    </button>
                    <button class="btn btn-secondary btn-sm" id="btn-sync-google-cal" title="Nächsten Termin in Google Kalender öffnen">
                        <i data-lucide="calendar"></i> Google Kalender
                    </button>
                    <button class="btn btn-secondary btn-sm" id="btn-sync-outlook-cal" title="Nächsten Termin in Outlook öffnen">
                        <i data-lucide="calendar-plus"></i> Outlook Web
                    </button>
                </div>
            </div>

            <!-- Email Import Dropzone -->
            <div class="glass-card" style="padding: 16px; margin-bottom: 20px;">
                <div class="flex-between align-center">
                    <div>
                        <h4 style="margin: 0; font-size: 0.9rem;"><i data-lucide="mail"></i> Einladungs-E-Mail Auto-Parser</h4>
                        <p class="text-secondary" style="font-size: 0.8rem; margin: 2px 0 0 0;">Füge E-Mail-Text ein, um Termine &amp; Zoom/Teams-Links automatisch im Kalender einzutragen</p>
                    </div>
                    <button class="btn btn-primary btn-sm" id="btn-toggle-email-input">
                        <i data-lucide="plus"></i> E-Mail importieren
                    </button>
                </div>

                <div id="email-import-box" style="margin-top: 12px; display: none;">
                    <textarea id="email-raw-input" class="form-input" rows="4" placeholder="Kopiere hier den E-Mail-Text rein (z.B. Einladung zum Vorstellungsgespräch am 15.08.2026 um 14:30 Uhr via Zoom)..."></textarea>
                    <div class="flex-between align-center" style="margin-top: 8px;">
                        <select id="email-job-select" class="form-input" style="width: auto; padding: 4px 8px; font-size: 0.85rem;">
                            <option value="">Job zuordnen...</option>
                            ${t.map(p=>`<option value="${p.id}">${p.company} - ${p.title}</option>`).join("")}
                        </select>
                        <button class="btn btn-success btn-sm" id="btn-parse-email-submit">
                            <i data-lucide="check"></i> Termin parsen &amp; eintragen
                        </button>
                    </div>
                </div>
            </div>

            <!-- Month navigation -->
            <div class="glass-card flex-between align-center" style="padding: 12px 20px; margin-bottom: 20px;">
                <button class="btn btn-secondary btn-sm" id="btn-prev-month"><i data-lucide="chevron-left"></i> Vorheriger</button>
                <h3 style="margin: 0;">${r[s]} ${i}</h3>
                <button class="btn btn-secondary btn-sm" id="btn-next-month">Nächster <i data-lucide="chevron-right"></i></button>
            </div>

            <!-- Calendar Grid -->
            <div class="glass-card" style="padding: 20px; overflow-x: auto;">
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; min-width: 700px; text-align: center; font-weight: 700; margin-bottom: 8px;">
                    <div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>Sa</div><div>So</div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; min-width: 700px;">
                    ${c.map(p=>p.isPadding?'<div style="min-height: 80px; background: rgba(255,255,255,0.02); border-radius: 8px;"></div>':`
                            <div style="min-height: 80px; padding: 6px; border: 1px solid ${p.isToday?"var(--color-primary)":"var(--border-color)"}; border-radius: 8px; background: ${p.isToday?"rgba(99,102,241,0.08)":"transparent"};">
                                <span style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">${p.dayNum}</span>
                                ${p.events.map(b=>`
                                    <div style="font-size: 0.7rem; padding: 2px 4px; border-radius: 4px; background: ${b.color}; color: #fff; margin-bottom: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${b.title}">
                                        ${b.title}
                                    </div>
                                `).join("")}
                            </div>
                        `).join("")}
                </div>
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(e,t)},bindEvents(n,e){var r,a,o,l,d;(r=n.querySelector("#btn-prev-month"))==null||r.addEventListener("click",()=>{this.currentDate.setMonth(this.currentDate.getMonth()-1),this.render("view-calendar")}),(a=n.querySelector("#btn-next-month"))==null||a.addEventListener("click",()=>{this.currentDate.setMonth(this.currentDate.getMonth()+1),this.render("view-calendar")}),(o=n.querySelector("#btn-export-ics"))==null||o.addEventListener("click",()=>{Fe(e)}),(l=n.querySelector("#btn-sync-google-cal"))==null||l.addEventListener("click",()=>{const u=e.find(c=>c.deadline&&c.status!=="rejected");if(u){const c=Pe(u.title,u.company,u.deadline,u.description||"");window.open(c,"_blank")}else window.app.showToast("Keine anstehende Frist für Google Kalender gefunden.","info")}),(d=n.querySelector("#btn-sync-outlook-cal"))==null||d.addEventListener("click",()=>{const u=e.find(c=>c.deadline&&c.status!=="rejected");if(u){const c=Re(u.title,u.company,u.deadline,u.description||"");window.open(c,"_blank")}else window.app.showToast("Keine anstehende Frist für Outlook gefunden.","info")});const t=n.querySelector("#btn-toggle-email-input"),i=n.querySelector("#email-import-box");t&&i&&t.addEventListener("click",()=>{i.style.display=i.style.display==="none"?"block":"none"});const s=n.querySelector("#btn-parse-email-submit");s&&s.addEventListener("click",()=>{const u=n.querySelector("#email-raw-input").value,c=n.querySelector("#email-job-select").value;if(!u)return;const p=rt.parseEmail(u);if(p&&c){const b=y.getJobs(),v=b.find(k=>k.id===c);v&&(v.interviews||(v.interviews=[]),v.interviews.push({id:"inv-"+Date.now(),round:p.platform+" Interview",date:p.dateIso+"T"+p.time,location:p.videoLink||p.platform,notes:`Recruiter: ${p.recruiterName}`}),v.status="interviewing",y.saveJobs(b),alert(`Termin am ${p.dateIso} um ${p.time} Uhr erfolgreich eingetragen!`),this.render("view-calendar"))}else p&&alert(`Geparster Termin: ${p.dateIso} um ${p.time} Uhr (${p.platform}). Bitte wähle erst den zugehörigen Job aus.`)})}},we={getBookmarkletCode(){return`javascript:(function(){
            var title = document.querySelector('h1')?.innerText?.trim() || document.title;
            var company = document.querySelector('.job-details-jobs-unified-top-card__company-name, .topcard__org-name-link, [class*="company"]')?.innerText?.trim() || 'Unbekannte Firma';
            var location = document.querySelector('.job-details-jobs-unified-top-card__bullet, [class*="location"]')?.innerText?.trim() || 'Remote / Deutschland';
            var desc = document.querySelector('#job-details, .description, [class*="description"]')?.innerText?.trim() || document.body.innerText.slice(0, 1000);
            
            var jobData = {
                title: title,
                company: company,
                location: location,
                description: desc,
                url: window.location.href,
                status: 'saved',
                workMode: location.toLowerCase().includes('remote') ? 'Remote' : 'Hybrid'
            };
            
            var targetUrl = 'http://localhost:5173/?clip_job=' + encodeURIComponent(JSON.stringify(jobData));
            window.open(targetUrl, '_blank');
        })();`.replace(/\s+/g," ")},parseClippedPayload(n){if(!n)return null;try{const e=typeof n=="string"?JSON.parse(decodeURIComponent(n)):n;return!e.title&&!e.company?null:{title:e.title||"Neues Stellenangebot",company:e.company||"Unbekannt",location:e.location||"Remote",workMode:e.workMode||"Remote",salary:Number(e.salary)||6e4,description:e.description||"",url:e.url||"",status:e.status||"saved",ratings:{salary:6,commute:8,remote:8,culture:7,tech:7}}}catch(e){return console.warn("Failed to parse clipped job payload:",e),null}}},ye={async searchJobs(n="",e=""){const t=[],i=(n||"").trim().toLowerCase(),s=(e||"").trim().toLowerCase();try{const r=await fetch("https://www.arbeitnow.com/api/job-board-api",{headers:{Accept:"application/json"}});if(r.ok){const a=await r.json();a&&a.data&&Array.isArray(a.data)&&a.data.forEach(o=>{const l=o.title||"",d=o.company_name||"Unternehmen",u=o.location||(o.remote?"Remote":"DACH"),c=o.description?o.description.replace(/<[^>]*>?/gm,""):"",p=Array.isArray(o.tags)?o.tags:[],b=o.url||"",v=`${l} ${c} ${p.join(" ")}`.toLowerCase(),k=u.toLowerCase(),m=!i||v.includes(i),g=!s||k.includes(s)||s==="remote"&&o.remote;m&&g&&t.push({title:l,company:d,location:u,workMode:o.remote?"Remote":u.toLowerCase().includes("hybrid")?"Hybrid":"Vor Ort",salary:this.estimateSalary(l,p),description:c.slice(0,500)+(c.length>500?"...":""),url:b,tags:p.slice(0,4),status:"saved",source:"Arbeitnow API"})})}}catch(r){console.warn("Live API fetch failed, switching to curated live fallback feed:",r)}return t.length<3&&this.getFallbackJobs().forEach(a=>{const o=`${a.title} ${a.company} ${a.description}`.toLowerCase(),l=a.location.toLowerCase();(!i||o.includes(i))&&(!s||l.includes(s)||s==="remote"&&a.workMode==="Remote")&&t.push(a)}),t},estimateSalary(n,e=[]){const t=(n+" "+e.join(" ")).toLowerCase();return t.includes("senior")||t.includes("lead")||t.includes("architect")||t.includes("principal")?82e3:t.includes("junior")||t.includes("entry")||t.includes("trainee")||t.includes("praktik")?48e3:t.includes("manager")||t.includes("head")?9e4:65e3},getFallbackJobs(){return[{title:"Senior Frontend Engineer (React / TypeScript)",company:"FinTech Innovations GmbH",location:"München / Hybrid",workMode:"Hybrid",salary:8e4,description:"Entwicklung hochperformanter Dashboards mit React 18, TypeScript, TailwindCSS und GraphQL. Agile Arbeitsweise in cross-funktionalen Teams.",url:"https://example.com/job/fintech-frontend",tags:["React","TypeScript","GraphQL","Fintech"],status:"saved",source:"JobMatch Feed"},{title:"Fullstack Web Developer (Node.js & Vue/React)",company:"CloudScale Solutions",location:"Berlin / Remote",workMode:"Remote",salary:74e3,description:"Verstärke unser Plattform-Team. Stack: Node.js, Express, Docker, PostgreSQL und moderne Frontend-Architekturen. 100% Remote möglich.",url:"https://example.com/job/cloudscale-fullstack",tags:["Node.js","PostgreSQL","Docker","React"],status:"saved",source:"JobMatch Feed"},{title:"UI/UX Engineer & Design System Specialist",company:"Creative Media Works",location:"Hamburg / Hybrid",workMode:"Hybrid",salary:68e3,description:"Erstellung und Pflege unseres zentralen Design Systems in Figma & Web Components. Fokus auf Accessibility (WCAG), CSS Grid und Animationen.",url:"https://example.com/job/creative-ui-ux",tags:["Design System","Figma","CSS","Accessibility"],status:"saved",source:"JobMatch Feed"},{title:"DevOps & Cloud Infrastructure Specialist",company:"NextGen Data AG",location:"Frankfurt / Vor Ort",workMode:"Vor Ort",salary:88e3,description:"Betreuung von Kubernetes-Clustern, CI/CD Pipelines (GitHub Actions) und AWS-Infrastruktur mit Terraform.",url:"https://example.com/job/nextgen-devops",tags:["Kubernetes","AWS","Terraform","CI/CD"],status:"saved",source:"JobMatch Feed"}]}},ot={searchQuery:"",searchLocation:"",workModeFilter:"all",liveResults:[],isLoading:!1,render(n){const e=document.getElementById(n);if(!e)return;const t=y.getProfile();!this.searchQuery&&t.title&&(this.searchQuery=t.title);const i=we.getBookmarkletCode();e.innerHTML=`
            <div class="kanban-header">
                <h2>Job-Suche, Live-Aggregator &amp; Web Clipper</h2>
                <span class="text-secondary">Durchsuche echte Live-Stellenangebote (Arbeitnow &amp; Open Feeds) oder clippe Jobs direkt aus LinkedIn, StepStone &amp; Co.</span>
            </div>

            <!-- Web Clipper / Bookmarklet Banner -->
            <div class="glass-card" style="padding: 20px; margin-bottom: 24px; border-left: 4px solid var(--color-primary);">
                <div class="flex-between align-center">
                    <div>
                        <h4 style="margin: 0;"><i data-lucide="bookmark"></i> JobMatch Web Clipper Bookmarklet</h4>
                        <p class="text-secondary" style="font-size: 0.85rem; margin: 4px 0 0 0;">Ziehe den Button in deine Browser-Lesezeichenleiste, um Jobs direkt von beliebigen Jobbörsen in JobMatch zu speichern:</p>
                    </div>
                    <a href="${i}" class="btn btn-primary" onclick="alert('Ziehe diesen Button in deine Lesezeichenleiste!'); return false;" style="cursor: move;">
                        📌 + In JobMatch clippen
                    </a>
                </div>
            </div>

            <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                <form id="finder-search-form" style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                    <div style="flex: 2; min-width: 200px;">
                        <input type="text" id="finder-query-input" value="${this.searchQuery}" placeholder="Suchbegriff (z.B. Frontend, React, Python, DevOps)..." class="form-input">
                    </div>
                    <div style="flex: 1; min-width: 150px;">
                        <input type="text" id="finder-location-input" value="${this.searchLocation}" placeholder="Ort (z.B. München, Remote, Berlin)..." class="form-input">
                    </div>
                    <div style="min-width: 130px;">
                        <select id="finder-workmode-select" class="form-input" style="padding: 10px;">
                            <option value="all" ${this.workModeFilter==="all"?"selected":""}>Alle Modelle</option>
                            <option value="Remote" ${this.workModeFilter==="Remote"?"selected":""}>100% Remote</option>
                            <option value="Hybrid" ${this.workModeFilter==="Hybrid"?"selected":""}>Hybrid</option>
                            <option value="Vor Ort" ${this.workModeFilter==="Vor Ort"?"selected":""}>Vor Ort</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary" id="btn-finder-search" ${this.isLoading?"disabled":""}>
                        <i data-lucide="${this.isLoading?"loader":"search"}" class="${this.isLoading?"spin":""}"></i> 
                        ${this.isLoading?"Suche läuft...":"Live Jobs suchen"}
                    </button>
                </form>
            </div>

            <div id="finder-results-container">
                ${this.renderResultsHtml(t)}
            </div>
        `,window.lucide&&lucide.createIcons(),this.bindEvents(e),this.liveResults.length===0&&!this.isLoading&&this.performSearch(e)},renderResultsHtml(n){if(this.isLoading)return`
                <div class="glass-card empty-state" style="padding: 40px; text-align: center;">
                    <div class="ai-loader-spinner" style="margin: 0 auto 16px auto;"></div>
                    <p>Durchsuche Live-Job-APIs nach aktuellen Stellenangeboten...</p>
                </div>
            `;let e=[...this.liveResults];return this.workModeFilter!=="all"&&(e=e.filter(t=>t.workMode===this.workModeFilter)),e.length===0?`
                <div class="glass-card empty-state" style="padding: 40px; text-align: center;">
                    <i data-lucide="compass" style="width: 48px; height: 48px; color: var(--text-muted);"></i>
                    <p>Keine passenden Stellen gefunden. Probiere andere Suchbegriffe oder Orte aus.</p>
                </div>
            `:`
            <div style="margin-bottom: 12px; font-size: 0.85rem; color: var(--text-secondary);">
                <strong>${e.length}</strong> Stellenangebote gefunden (Echtzeit-Treffer):
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                ${e.map((t,i)=>{const s=A.analyzeJobMatch(t.description||"",n.skills||[]);return`
                        <div class="glass-card" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between; gap: 14px; border-top: 3px solid var(--color-primary);">
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                                    <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">${t.company}</span>
                                    <span class="card-score-tag ${s.matchScore>=70?"high":"medium"}">${s.matchScore}% Match</span>
                                </div>
                                <h4 style="font-size: 1rem; margin: 0 0 8px 0; color: var(--text-primary); font-weight: 600;">${t.title}</h4>
                                <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
                                    <span><i data-lucide="map-pin" style="width: 12px; height: 12px; display: inline;"></i> ${t.location}</span>
                                    <span><i data-lucide="briefcase" style="width: 12px; height: 12px; display: inline;"></i> ${t.workMode||"Vollzeit"}</span>
                                    <span><i data-lucide="euro" style="width: 12px; height: 12px; display: inline;"></i> ~${(t.salary||6e4).toLocaleString("de-DE")} €</span>
                                </div>
                                ${t.tags&&t.tags.length>0?`
                                    <div class="keyword-tags" style="margin-bottom: 10px;">
                                        ${t.tags.map(r=>`<span class="badge badge-saved" style="font-size: 0.7rem;">#${r}</span>`).join(" ")}
                                    </div>
                                `:""}
                                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin: 0;">
                                    ${t.description}
                                </p>
                            </div>
                            <div style="display: flex; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 12px;">
                                <button class="btn btn-primary btn-sm btn-import-found-job" data-idx="${i}" style="flex: 1;">
                                    <i data-lucide="plus"></i> Zu Kanban hinzufügen
                                </button>
                                ${t.url?`
                                    <a href="${t.url}" target="_blank" class="btn btn-secondary btn-sm" title="Anzeige öffnen">
                                        <i data-lucide="external-link"></i>
                                    </a>
                                `:""}
                            </div>
                        </div>
                    `}).join("")}
            </div>
        `},bindEvents(n){const e=n.querySelector("#finder-search-form");e&&e.addEventListener("submit",i=>{i.preventDefault(),this.searchQuery=n.querySelector("#finder-query-input").value.trim(),this.searchLocation=n.querySelector("#finder-location-input").value.trim();const s=n.querySelector("#finder-workmode-select");s&&(this.workModeFilter=s.value),this.performSearch(n)});const t=n.querySelector("#finder-workmode-select");t&&t.addEventListener("change",()=>{this.workModeFilter=t.value;const i=y.getProfile(),s=n.querySelector("#finder-results-container");s&&(s.innerHTML=this.renderResultsHtml(i),window.lucide&&lucide.createIcons(),this.bindResultsEvents(n))}),this.bindResultsEvents(n)},bindResultsEvents(n){n.querySelectorAll(".btn-import-found-job").forEach(e=>{e.addEventListener("click",()=>{const t=parseInt(e.getAttribute("data-idx"),10),i=this.liveResults[t];i&&(y.addJob({...i,id:"job-"+Date.now()+"-"+Math.random().toString(36).substr(2,5),createdAt:new Date().toISOString()}),e.innerHTML='<i data-lucide="check"></i> Hinzugefügt!',e.disabled=!0,window.lucide&&lucide.createIcons(),window.app&&window.app.showToast&&window.app.showToast(`Job "${i.title}" zu Kanban hinzugefügt!`,"success"))})})},async performSearch(n){this.isLoading=!0;const e=y.getProfile(),t=n.querySelector("#finder-results-container");t&&(t.innerHTML=this.renderResultsHtml(e));const i=this.searchQuery||e.title||"Developer",s=this.searchLocation||"";try{this.liveResults=await ye.searchJobs(i,s)}catch(r){console.error("Job search error:",r),this.liveResults=ye.getFallbackJobs()}finally{this.isLoading=!1,this.render("view-finder")}}},lt={isOpen:!1,selectedIndex:0,commands:[],init(n){this.app=n,this.createPaletteDom(),this.bindEvents()},createPaletteDom(){if(document.getElementById("command-palette-modal"))return;document.body.insertAdjacentHTML("beforeend",`
            <div id="command-palette-modal" class="modal-overlay command-palette-overlay hide">
                <div class="command-palette-container glass-card">
                    <div class="command-palette-header">
                        <i data-lucide="search" class="palette-search-icon"></i>
                        <input type="text" id="command-palette-input" placeholder="Tippe einen Befehl oder suche nach Jobs (z. B. 'Dashboard', 'Anschreiben', 'Frontend')..." autocomplete="off">
                        <span class="keyboard-badge">ESC zum Schließen</span>
                    </div>
                    <div id="command-palette-results" class="command-palette-results">
                        <!-- Results populated dynamically -->
                    </div>
                    <div class="command-palette-footer">
                        <span><kbd>↑</kbd> <kbd>↓</kbd> Navigieren</span>
                        <span><kbd>↵</kbd> Auswählen</span>
                        <span><kbd>ESC</kbd> Schließen</span>
                    </div>
                </div>
            </div>
        `)},bindEvents(){window.addEventListener("keydown",t=>{(t.ctrlKey||t.metaKey)&&t.key.toLowerCase()==="k"?(t.preventDefault(),this.toggle()):t.key==="Escape"&&this.isOpen&&this.close()});const n=document.getElementById("command-palette-modal"),e=document.getElementById("command-palette-input");n&&n.addEventListener("click",t=>{t.target===n&&this.close()}),e&&(e.addEventListener("input",()=>this.onInput()),e.addEventListener("keydown",t=>this.onKeyDown(t)))},toggle(){this.isOpen?this.close():this.open()},open(){this.isOpen=!0;const n=document.getElementById("command-palette-modal"),e=document.getElementById("command-palette-input");n&&n.classList.remove("hide"),e&&(e.value="",e.focus()),this.updateCommandsList("")},close(){this.isOpen=!1;const n=document.getElementById("command-palette-modal");n&&n.classList.add("hide")},updateCommandsList(n){const e=n.toLowerCase().trim(),t=y.getJobs(),i=[],s=[{id:"nav-dashboard",label:"Wechsle zu: Dashboard",icon:"layout-dashboard",action:()=>this.app.switchToView("dashboard")},{id:"nav-kanban",label:"Wechsle zu: Kanban-Board",icon:"kanban-square",action:()=>this.app.switchToView("kanban")},{id:"nav-comparer",label:"Wechsle zu: Job-Vergleicher",icon:"git-compare",action:()=>this.app.switchToView("comparer")},{id:"nav-calendar",label:"Wechsle zu: Kalender",icon:"calendar",action:()=>this.app.switchToView("calendar")},{id:"nav-finder",label:"Wechsle zu: Job-Suche & Aggregator",icon:"compass",action:()=>this.app.switchToView("finder")},{id:"nav-copilot",label:"Wechsle zu: Bewerbungs-Copilot",icon:"sparkles",action:()=>this.app.switchToView("copilot")}],r=[{id:"act-add-job",label:"Aktion: Neuen Job hinzufügen",icon:"plus-circle",action:()=>{this.app.openJobModal()}},{id:"act-profile",label:"Aktion: Mein Profil & Skills öffnen",icon:"user",action:()=>{this.app.openProfileModal()}},{id:"act-theme-dark",label:"Theme: Dark Glass Mode",icon:"moon",action:()=>{this.app.setThemeMode("dark")}},{id:"act-theme-light",label:"Theme: Daylight Light Mode",icon:"sun",action:()=>{this.app.setThemeMode("light")}},{id:"act-theme-oled",label:"Theme: OLED High Contrast Mode",icon:"zap",action:()=>{this.app.setThemeMode("oled")}}];s.forEach(a=>{(!e||a.label.toLowerCase().includes(e))&&i.push(a)}),r.forEach(a=>{(!e||a.label.toLowerCase().includes(e))&&i.push(a)}),t.forEach(a=>{const o=a.title.toLowerCase().includes(e),l=a.company.toLowerCase().includes(e);e&&(o||l)&&i.push({id:`job-${a.id}`,label:`Job öffnen: ${a.title} (${a.company})`,icon:"briefcase",action:()=>{this.app.switchToView("copilot",a.id)}})}),this.commands=i,this.selectedIndex=0,this.renderResults()},renderResults(){const n=document.getElementById("command-palette-results");if(n){if(this.commands.length===0){n.innerHTML=`
                <div class="palette-empty-state">
                    <p>Keine passenden Befehle oder Jobs gefunden.</p>
                </div>
            `;return}n.innerHTML=this.commands.map((e,t)=>`
            <div class="palette-item ${t===this.selectedIndex?"selected":""}" data-idx="${t}">
                <div class="palette-item-left">
                    <i data-lucide="${e.icon}"></i>
                    <span>${e.label}</span>
                </div>
                <span class="palette-item-action">↵ Auswählen</span>
            </div>
        `).join(""),window.lucide&&window.lucide.createIcons(),n.querySelectorAll(".palette-item").forEach(e=>{e.addEventListener("click",()=>{const t=parseInt(e.getAttribute("data-idx"));this.executeCommand(t)})})}},onInput(){const n=document.getElementById("command-palette-input");n&&this.updateCommandsList(n.value)},onKeyDown(n){n.key==="ArrowDown"?(n.preventDefault(),this.selectedIndex=(this.selectedIndex+1)%this.commands.length,this.renderResults(),this.scrollToSelected()):n.key==="ArrowUp"?(n.preventDefault(),this.selectedIndex=(this.selectedIndex-1+this.commands.length)%this.commands.length,this.renderResults(),this.scrollToSelected()):n.key==="Enter"&&(n.preventDefault(),this.executeCommand(this.selectedIndex))},scrollToSelected(){const n=document.getElementById("command-palette-results"),e=n==null?void 0:n.querySelector(".palette-item.selected");e&&n&&e.scrollIntoView({block:"nearest"})},executeCommand(n){if(this.commands[n]){const e=this.commands[n];this.close(),e.action()}}},G={de:{appTitle:"JobMatch",dashboard:"Dashboard",kanban:"Kanban-Board",comparer:"Job-Vergleicher",calendar:"Kalender",finder:"Job-Suche",copilot:"Bewerbungs-Copilot",myProfile:"Mein Profil / Skills",addJob:"Neuen Job hinzufügen",searchPlaceholder:"Jobs, Firmen oder Skills suchen...",totalJobs:"Gesamtanzahl",openApplications:"Bewerbungen offen",offersReceived:"Angebote erhalten",interviewsCount:"Einladungen / Gespräch",applicationExpenses:"Bewerbungs-Kosten",marketSalaryBenchmark:"Marktgehalt Benchmark",saved:"Gespeichert",prepared:"Unterlagen bereit",applied:"Beworben",interviewing:"Gespräch",offer:"Angebot erhalten",rejected:"Absage",coverLetterGenerator:"Anschreiben-Generator",interviewPrep:"Interview-Vorbereitung",resumeOptimizer:"Lebenslauf-Optimizer",emailAssistant:"E-Mail-Assistent",salaryNegotiation:"Gehaltsverhandlung",companyResearch:"360° Unternehmensrecherche",startSimulator:"Simulator starten",exportCv:"Lebenslauf exportieren",saveProfile:"Profil speichern"},en:{appTitle:"JobMatch",dashboard:"Dashboard",kanban:"Kanban Board",comparer:"Job Comparer",calendar:"Calendar",finder:"Job Search",copilot:"AI Copilot",myProfile:"My Profile / Skills",addJob:"Add New Job",searchPlaceholder:"Search jobs, companies or skills...",totalJobs:"Total Jobs",openApplications:"Active Applications",offersReceived:"Offers Received",interviewsCount:"Interviews Scheduled",applicationExpenses:"Job Search Expenses",marketSalaryBenchmark:"Market Salary Benchmark",saved:"Saved",prepared:"Prepared",applied:"Applied",interviewing:"Interviewing",offer:"Offer Received",rejected:"Rejected",coverLetterGenerator:"Cover Letter Generator",interviewPrep:"Interview Prep",resumeOptimizer:"Resume Optimizer",emailAssistant:"Email Assistant",salaryNegotiation:"Salary Negotiation",companyResearch:"360° Company Research",startSimulator:"Start Simulator",exportCv:"Export CV / Resume",saveProfile:"Save Profile"}},te={currentLang:localStorage.getItem("jobmatch_lang")||"de",setLanguage(n){G[n]&&(this.currentLang=n,localStorage.setItem("jobmatch_lang",n),this.updateDom())},getLanguage(){return this.currentLang},t(n){var e,t;return((e=G[this.currentLang])==null?void 0:e[n])||((t=G.de)==null?void 0:t[n])||n},updateDom(){document.querySelectorAll("[data-i18n]").forEach(e=>{var i;const t=e.getAttribute("data-i18n");t&&((i=G[this.currentLang])!=null&&i[t])&&(e.tagName==="INPUT"&&e.placeholder?e.placeholder=G[this.currentLang][t]:e.textContent=G[this.currentLang][t])});const n=document.getElementById("btn-lang-toggle");n&&(n.textContent=this.currentLang.toUpperCase())}},dt={async createSnapshot(n="Manual Snapshot"){const e=y.getJobs(),t=y.getProfile(),i=y.getExpenses(),s=y.getCustomColumns(),r=y.getRejectionHistory(),a=await q.getAllDocuments().catch(()=>[]),o={id:"snapshot_"+Date.now(),createdAt:new Date().toISOString(),label:n,version:"2.0",data:{jobs:e,profile:t,expenses:i,customColumns:s,rejectionHistory:r,documentsMeta:a.map(d=>({id:d.id,name:d.name,type:d.type,size:d.size,date:d.date}))}},l=this.getSnapshotHistory();return l.unshift(o),l.length>5&&l.pop(),localStorage.setItem("jobmatch_snapshot_history",JSON.stringify(l)),o},getSnapshotHistory(){try{return JSON.parse(localStorage.getItem("jobmatch_snapshot_history")||"[]")}catch{return[]}},async restoreSnapshot(n){if(!n||!n.data)throw new Error("Ungültiger Snapshot.");return n.data.jobs&&y.saveJobs(n.data.jobs),n.data.profile&&y.saveProfile(n.data.profile),n.data.expenses&&y.saveExpenses(n.data.expenses),n.data.customColumns&&y.saveCustomColumns(n.data.customColumns),n.data.rejectionHistory&&y.saveRejectionHistory(n.data.rejectionHistory),!0}};class ct{constructor(){this.currentView="dashboard",this.activeSkills=[],this.modalTodos=[],this.modalInterviews=[],this.modalExpenses=[],this.modalDocuments=[],this.currentThemeMode=localStorage.getItem("jobmatch_theme_mode")||"dark"}init(){window.app=this,this.initRouting(),this.initMobileNav(),this.initThemeToggle(),this.initLanguageToggle(),this.initRejectionModal(),this.initModals(),this.initGlobalSearch(),this.initNotificationBell(),this.initCvUpload(),lt.init(this),dt.createSnapshot("Auto Startup Backup").catch(()=>{});const t=new URLSearchParams(window.location.search).get("clip_job");if(t){const i=we.parseClippedPayload(t);i&&(y.addJob(i),alert(`Job "${i.title}" bei "${i.company}" wurde erfolgreich gecallt & gespeichert!`),window.history.replaceState({},document.title,window.location.pathname))}this.renderCurrentView(),te.updateDom(),lucide.createIcons(),this.checkDeadlines(),this.requestNotificationPermissions(),this.applyAccessibilitySettings(),"serviceWorker"in navigator&&navigator.serviceWorker.register("/sw.js").then(()=>console.log("Service Worker registered successfully.")).catch(i=>console.warn("Service Worker registration failed:",i))}applyAccessibilitySettings(){const e=y.getProfile();e.lrsEnabled?document.body.classList.add("lrs-mode"):document.body.classList.remove("lrs-mode"),e.rgsEnabled?document.body.classList.add("rgs-mode"):document.body.classList.remove("rgs-mode"),this.setThemeMode(this.currentThemeMode)}initMobileNav(){const e=document.querySelectorAll(".mobile-bottom-nav .mobile-nav-item");e.forEach(t=>{t.addEventListener("click",()=>{const i=t.getAttribute("data-view");e.forEach(s=>s.classList.remove("active")),t.classList.add("active"),this.switchToView(i)})})}initThemeToggle(){const e=document.getElementById("btn-theme-toggle");e&&e.addEventListener("click",()=>{let t="dark";this.currentThemeMode==="dark"?t="light":this.currentThemeMode==="light"?t="oled":t="dark",this.setThemeMode(t)})}setThemeMode(e){this.currentThemeMode=e,document.body.classList.remove("theme-light","theme-oled"),e==="light"?document.body.classList.add("theme-light"):e==="oled"&&document.body.classList.add("theme-oled"),localStorage.setItem("jobmatch_theme_mode",e);const t=document.getElementById("btn-theme-toggle");if(t){const i=t.querySelector("i");i&&(e==="light"?i.setAttribute("data-lucide","sun"):e==="oled"?i.setAttribute("data-lucide","zap"):i.setAttribute("data-lucide","moon"),window.lucide&&window.lucide.createIcons())}}initLanguageToggle(){const e=document.getElementById("btn-lang-toggle");e&&e.addEventListener("click",()=>{const i=te.getLanguage()==="de"?"en":"de";te.setLanguage(i),this.showToast(`Sprache gewechselt zu ${i.toUpperCase()}`,"primary"),this.renderCurrentView()})}initRejectionModal(){document.getElementById("rejection-reason-modal");const e=document.getElementById("btn-close-rejection-modal"),t=document.getElementById("btn-skip-rejection-reason"),i=document.getElementById("btn-save-rejection-reason");e&&e.addEventListener("click",()=>this.closeModal("rejection-reason-modal")),t&&t.addEventListener("click",()=>this.closeModal("rejection-reason-modal")),i&&i.addEventListener("click",()=>{const s=document.getElementById("rejection-job-id").value,r=document.getElementById("rejection-reason-select").value,a=document.getElementById("rejection-missing-skill").value.trim(),o=y.getJobs(),l=o.find(d=>d.id===s);l&&(l.rejectionReason=r,a&&(l.missingSkillRecorded=a),y.saveJobs(o),this.showToast("Absage-Grund gespeichert!","success")),this.closeModal("rejection-reason-modal")})}openRejectionModal(e){document.getElementById("rejection-job-id").value=e;const t=document.getElementById("rejection-reason-modal");t&&t.classList.remove("hide")}requestNotificationPermissions(){"Notification"in window&&Notification.permission==="default"&&Notification.requestPermission().then(e=>{e==="granted"&&console.log("Push Notifications genehmigt.")})}initRouting(){const e=document.querySelectorAll(".sidebar-nav .nav-item");e.forEach(t=>{t.addEventListener("click",()=>{const i=t.getAttribute("data-view");e.forEach(s=>{s.classList.remove("active"),s.setAttribute("aria-selected","false")}),t.classList.add("active"),t.setAttribute("aria-selected","true"),this.switchToView(i)})})}switchToView(e,t=null){this.currentView=e,document.querySelectorAll(".app-view").forEach(a=>a.classList.remove("active"));const s=document.getElementById(`view-${e}`);s&&s.classList.add("active"),document.querySelectorAll(".sidebar-nav .nav-item").forEach(a=>{a.getAttribute("data-view")===e?(a.classList.add("active"),a.setAttribute("aria-selected","true")):(a.classList.remove("active"),a.setAttribute("aria-selected","false"))}),this.renderCurrentView(t)}renderCurrentView(e=null){const t=`view-${this.currentView}`;switch(this.currentView){case"dashboard":Ge.render(t);break;case"kanban":Ne.render(t);break;case"comparer":Ke.render(t);break;case"calendar":at.render(t);break;case"finder":ot.render(t);break;case"copilot":st.render(t,e);break}}initGlobalSearch(){document.getElementById("global-search").addEventListener("input",t=>{const i=t.target.value.toLowerCase().trim();this.currentView!=="kanban"&&i.length>0&&this.switchToView("kanban"),document.querySelectorAll(".kanban-card").forEach(r=>{const a=r.querySelector(".card-title")?r.querySelector(".card-title").textContent.toLowerCase():"",o=r.querySelector(".card-company")?r.querySelector(".card-company").textContent.toLowerCase():"",l=r.querySelector(".card-tags-list")?r.querySelector(".card-tags-list").textContent.toLowerCase():"";a.includes(i)||o.includes(i)||l.includes(i)?r.style.display="block":r.style.display="none"})})}initModals(){["salary","commute","remote","culture","tech","theme-primary","theme-secondary","gemini-temperature"].forEach(m=>{let g=`rate-${m}`,f=`val-${m}`;m.includes("theme")?(g=`profile-theme-${m.split("-")[1]}`,f=`val-theme-${m.split("-")[1]}`):m.includes("gemini")&&(g=`profile-gemini-${m.split("-")[1]}`,f=`val-gemini-${m.split("-")[1]}`);const x=document.getElementById(g),S=document.getElementById(f);x&&S&&x.addEventListener("input",$=>{S.textContent=$.target.value,m==="theme-primary"?document.documentElement.style.setProperty("--primary-hue",$.target.value):m==="theme-secondary"&&document.documentElement.style.setProperty("--secondary-hue",$.target.value)})});const t=document.getElementById("btn-test-api-key");t&&t.addEventListener("click",async()=>{const g=document.getElementById("profile-api-key").value.trim(),f=document.getElementById("api-key-test-feedback");if(!g){f.style.display="block",f.style.backgroundColor="rgba(239, 68, 68, 0.15)",f.style.color="#f87171",f.style.border="1px solid rgba(239, 68, 68, 0.3)",f.textContent="Bitte gib zuerst einen API-Key ein.";return}t.disabled=!0;const x=t.innerHTML;t.innerHTML='<span class="ai-loader-spinner" style="width: 14px; height: 14px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span>...',f.style.display="block",f.style.backgroundColor="rgba(59, 130, 246, 0.15)",f.style.color="#60a5fa",f.style.border="1px solid rgba(59, 130, 246, 0.3)",f.textContent="Testverbindung wird aufgebaut...";try{await A.testApiKey(g)&&(f.style.backgroundColor="rgba(16, 185, 129, 0.15)",f.style.color="#34d399",f.style.border="1px solid rgba(16, 185, 129, 0.3)",f.textContent="Verbindung erfolgreich! Der API-Schlüssel ist gültig.",this.showToast("API-Key erfolgreich verifiziert!","success"))}catch(S){f.style.backgroundColor="rgba(239, 68, 68, 0.15)",f.style.color="#f87171",f.style.border="1px solid rgba(239, 68, 68, 0.3)",f.textContent="Verbindung fehlgeschlagen: "+S.message,this.showToast("API-Key Verifizierung fehlgeschlagen.","danger")}finally{t.disabled=!1,t.innerHTML=x}}),document.getElementById("btn-add-job-top").addEventListener("click",()=>this.openJobModal()),document.getElementById("btn-open-profile").addEventListener("click",()=>this.openProfileModal());const i=document.getElementById("profile-select");i&&i.addEventListener("change",m=>{y.setActiveProfileId(m.target.value);const g=y.getProfile();this.loadProfileFields(g),this.applyAccessibilitySettings(),this.showToast(`Zu Profil "${g.profileName}" gewechselt`,"primary")});const s=document.getElementById("btn-create-profile");s&&s.addEventListener("click",()=>{const m=document.getElementById("new-profile-name-input"),g=m.value.trim();if(!g){this.showToast("Bitte gib einen Profilnamen ein.","warning");return}const f=y.addProfile(g);m.value="",this.populateProfilesSelect(),this.loadProfileFields(f),this.applyAccessibilitySettings(),this.showToast(`Profil "${g}" erfolgreich erstellt!`,"success")});const r=document.getElementById("btn-delete-current-profile");r&&r.addEventListener("click",()=>{const m=y.getActiveProfileId(),g=y.getProfile();try{y.deleteProfile(m);const f=y.getProfile();this.populateProfilesSelect(),this.loadProfileFields(f),this.applyAccessibilitySettings(),this.showToast(`Profil "${g.profileName}" gelöscht.`,"warning")}catch(f){this.showToast(f.message,"danger")}}),document.getElementById("btn-close-job-modal").addEventListener("click",()=>this.closeModal("job-modal")),document.getElementById("btn-cancel-job-modal").addEventListener("click",()=>this.closeModal("job-modal")),document.getElementById("btn-close-profile-modal").addEventListener("click",()=>this.closeModal("profile-modal")),document.querySelectorAll(".modal-backdrop").forEach(m=>{m.addEventListener("click",g=>{g.target===m&&this.closeModal(m.id)})});const a=document.getElementById("btn-parse-job");a&&a.addEventListener("click",async()=>{let m=document.getElementById("job-raw-text").value;const g=document.getElementById("job-raw-url").value.trim();if((!m||!m.trim())&&!g){this.showToast("Bitte füge eine Stellenbeschreibung oder eine URL ein.","warning");return}a.disabled=!0,a.innerHTML='<span class="ai-loader-spinner" style="width: 14px; height: 14px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span> Parsen...';try{g&&(!m||!m.trim())&&(this.showToast("Lade Stellenbeschreibung von URL...","primary"),m=await A.fetchJobDescriptionFromUrl(g),document.getElementById("job-description").value=m);const f=y.getProfile(),x=await A.parseJobDescription(f.geminiApiKey,m);x.title&&(document.getElementById("job-title").value=x.title),x.company&&(document.getElementById("job-company").value=x.company),x.salary&&(document.getElementById("job-salary").value=x.salary),x.location&&(document.getElementById("job-location").value=x.location),x.workMode&&(document.getElementById("job-work-mode").value=x.workMode),x.description&&(document.getElementById("job-description").value=x.description),x.contact&&(document.getElementById("job-contact").value=x.contact),g&&(document.getElementById("job-url").value=g),this.showToast("Stellenbeschreibung erfolgreich analysiert!","success"),document.getElementById("job-raw-text").value="",document.getElementById("job-raw-url").value=""}catch(f){console.error(f),this.showToast("Fehler beim Analysieren der Anzeige: "+f.message,"danger")}finally{a.disabled=!1,a.innerHTML='<i data-lucide="wand-2"></i> Parsen',lucide.createIcons()}});const o=document.getElementById("btn-parse-email");o&&o.addEventListener("click",async()=>{const m=document.getElementById("job-raw-text").value;if(!m||!m.trim()){this.showToast("Bitte füge den Text der E-Mail ein.","warning");return}o.disabled=!0,o.innerHTML='<span class="ai-loader-spinner" style="width: 14px; height: 14px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span>...';try{const g=y.getProfile(),f=await A.parseEmailText(g.geminiApiKey,m);if(f.status&&(document.getElementById("job-status").value=f.status),f.company&&!document.getElementById("job-company").value&&(document.getElementById("job-company").value=f.company),f.notes){const x=document.getElementById("job-notes").value;document.getElementById("job-notes").value=x?`${x}
${f.notes}`:f.notes}this.showToast(`E-Mail analysiert! Status auf "${f.status}" gesetzt.`,"success"),document.getElementById("job-raw-text").value=""}catch(g){console.error(g),this.showToast("Fehler beim E-Mail Import: "+g.message,"danger")}finally{o.disabled=!1,o.innerHTML='<i data-lucide="mail"></i> E-Mail Import',lucide.createIcons()}}),document.getElementById("job-form").addEventListener("submit",m=>this.handleJobSubmit(m)),document.getElementById("btn-save-profile").addEventListener("click",()=>this.handleProfileSubmit()),document.getElementById("btn-export-cv").addEventListener("click",()=>{const m=y.getProfile();try{ve(m),this.showToast("Lebenslauf-Druckdialog geöffnet!","success")}catch(g){console.error(g),this.showToast("Fehler beim Lebenslauf-Export.","danger")}}),document.getElementById("btn-add-skill").addEventListener("click",m=>{m.preventDefault(),this.handleSkillAdd()}),document.getElementById("new-skill-input").addEventListener("keypress",m=>{m.key==="Enter"&&(m.preventDefault(),this.handleSkillAdd())}),document.getElementById("btn-export-data").addEventListener("click",()=>this.handleDataExport()),document.getElementById("btn-trigger-import").addEventListener("click",()=>{document.getElementById("import-file-input").click()}),document.getElementById("import-file-input").addEventListener("change",m=>this.handleDataImport(m));const l=document.querySelectorAll(".modal-tab-btn"),d=document.querySelectorAll(".modal-tab-content");l.forEach(m=>{m.addEventListener("click",()=>{l.forEach(x=>{x.classList.remove("active"),x.style.color="var(--text-secondary)"}),d.forEach(x=>{x.style.display="none"}),m.classList.add("active"),m.style.color="var(--text-primary)";const g=m.getAttribute("data-modal-tab"),f=document.getElementById(g);f&&(f.style.display="block")})});const u=document.getElementById("btn-modal-add-todo");u&&(u.addEventListener("click",()=>{const m=document.getElementById("modal-todo-input"),g=m.value.trim();if(!g){this.showToast("Bitte gib einen Aufgabentext ein.","warning");return}this.modalTodos.push({id:Date.now().toString(),text:g,completed:!1}),m.value="",this.renderModalTodos()}),document.getElementById("modal-todo-input").addEventListener("keypress",m=>{m.key==="Enter"&&(m.preventDefault(),u.click())}));const c=document.getElementById("btn-modal-add-interview");c&&c.addEventListener("click",()=>{const m=document.getElementById("modal-interview-date"),g=document.getElementById("modal-interview-round"),f=document.getElementById("modal-interview-interviewer"),x=document.getElementById("modal-interview-notes"),S=g.value.trim();if(!S){this.showToast("Bitte gib die Gesprächsrunde an.","warning");return}this.modalInterviews.push({id:Date.now().toString(),date:m.value,round:S,interviewer:f.value.trim(),notes:x.value.trim()}),m.value="",g.value="",f.value="",x.value="",this.renderModalInterviews()});const p=document.getElementById("btn-modal-add-history");p&&p.addEventListener("click",()=>{const m=document.getElementById("modal-history-date"),g=document.getElementById("modal-history-type"),f=document.getElementById("modal-history-subject"),x=document.getElementById("modal-history-content"),S=f.value.trim(),$=m.value;if(!$){this.showToast("Bitte gib ein Datum an.","warning");return}if(!S){this.showToast("Bitte gib einen Betreff an.","warning");return}this.modalHistory.push({id:Date.now().toString(),date:$,type:g.value,subject:S,content:x.value.trim()}),m.value="",f.value="",x.value="",this.renderModalHistory()});const b=document.getElementById("btn-modal-add-expense");b&&b.addEventListener("click",()=>{const m=document.getElementById("modal-expense-date"),g=document.getElementById("modal-expense-category"),f=document.getElementById("modal-expense-amount"),x=document.getElementById("modal-expense-notes"),S=m.value,$=parseFloat(f.value);if(!S){this.showToast("Bitte gib ein Datum an.","warning");return}if(isNaN($)||$<=0){this.showToast("Bitte gib einen gültigen Betrag an.","warning");return}this.modalExpenses.push({id:Date.now().toString(),date:S,category:g.value,amount:$,notes:x.value.trim()}),m.value="",f.value="",x.value="",this.renderModalExpenses()});const v=document.getElementById("btn-trigger-doc-upload"),k=document.getElementById("job-doc-upload");v&&k&&(v.addEventListener("click",()=>{k.click()}),k.addEventListener("change",async m=>{const g=m.target.files[0];if(!g)return;if(g.size>10*1024*1024){this.showToast("Die Datei darf maximal 10 MB groß sein.","warning");return}const f=Date.now().toString(),x=document.getElementById("job-id").value||"temp_"+f;try{await q.saveFile(f,x,g.name,g),this.modalDocuments.push({id:f,name:g.name,size:g.size,type:g.type,uploadDate:new Date().toISOString()}),this.showToast("Dokument erfolgreich hochgeladen!","success"),this.renderModalDocuments()}catch(S){console.error("IndexedDB upload failed",S),this.showToast("Fehler beim Upload des Dokuments.","danger")}finally{k.value=""}}))}openJobModal(e=null){const t=document.getElementById("job-modal"),i=document.getElementById("job-form"),s=document.getElementById("modal-title");i.reset(),document.getElementById("job-id").value="";const r=["salary","commute","remote","culture","tech"];r.forEach(u=>{document.getElementById(`val-${u}`).textContent="5"});const a=document.querySelectorAll(".modal-tab-btn"),o=document.querySelectorAll(".modal-tab-content");a.forEach(u=>{u.classList.remove("active"),u.style.color="var(--text-secondary)"}),o.forEach(u=>{u.style.display="none"});const l=document.querySelector('[data-modal-tab="modal-tab-details"]');l&&(l.classList.add("active"),l.style.color="var(--text-primary)");const d=document.getElementById("modal-tab-details");if(d&&(d.style.display="block"),e){s.textContent="Jobangebot bearbeiten";const c=y.getJobs().find(p=>p.id===e);if(c){document.getElementById("job-id").value=c.id,document.getElementById("job-title").value=c.title,document.getElementById("job-company").value=c.company,document.getElementById("job-location").value=c.location||"",document.getElementById("job-work-mode").value=c.workMode||"Hybrid",document.getElementById("job-salary").value=c.salary||"",document.getElementById("job-url").value=c.url||"",document.getElementById("job-deadline").value=c.deadline||"",document.getElementById("job-description").value=c.description||"",document.getElementById("job-contact").value=c.contact||"",document.getElementById("job-tags").value=Array.isArray(c.tags)?c.tags.join(", "):c.tags||"",document.getElementById("job-notes").value=c.notes||"",document.getElementById("job-status").value=c.status||"saved",this.modalTodos=Array.isArray(c.todos)?[...c.todos]:[],this.modalInterviews=Array.isArray(c.interviews)?[...c.interviews]:[],this.modalHistory=Array.isArray(c.communicationLogs)?[...c.communicationLogs]:[],this.modalExpenses=Array.isArray(c.expenses)?[...c.expenses]:[],this.modalDocuments=Array.isArray(c.documents)?[...c.documents]:[];const p=c.ratings||{salary:5,commute:5,remote:5,culture:5,tech:5};r.forEach(k=>{const m=document.getElementById(`rate-${k}`),g=document.getElementById(`val-${k}`);m&&g&&(m.value=p[k],g.textContent=p[k])});const b=document.getElementById("job-history-timeline"),v=document.getElementById("job-timeline-nodes");if(c.history&&c.history.length>0){const k={saved:"Gespeichert (Interessant)",prepared:"Unterlagen bereit",applied:"Beworben",interviewing:"Gespräch / Interview",offer:"Angebot erhalten",rejected:"Absage"};v.innerHTML=c.history.map(m=>{const g=new Date(m.timestamp).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});return`
                            <div class="timeline-node">
                                <span class="status-name">${k[m.status]||m.status}</span>
                                <span class="status-date">${g}</span>
                            </div>
                        `}).join(""),b.style.display="block"}else b.style.display="none"}}else s.textContent="Neues Jobangebot eintragen",document.getElementById("job-status").value="saved",document.getElementById("job-history-timeline").style.display="none",this.modalTodos=[],this.modalInterviews=[],this.modalHistory=[],this.modalExpenses=[],this.modalDocuments=[];this.renderModalTodos(),this.renderModalInterviews(),this.renderModalHistory(),this.renderModalExpenses(),this.renderModalDocuments(),t.classList.add("active")}editJob(e){this.openJobModal(e)}closeModal(e){document.getElementById(e).classList.remove("active")}handleJobSubmit(e){e.preventDefault();const t=document.getElementById("job-id").value,i={title:document.getElementById("job-title").value,company:document.getElementById("job-company").value,location:document.getElementById("job-location").value,workMode:document.getElementById("job-work-mode").value,salary:document.getElementById("job-salary").value?parseInt(document.getElementById("job-salary").value):null,url:document.getElementById("job-url").value,deadline:document.getElementById("job-deadline").value,description:document.getElementById("job-description").value,contact:document.getElementById("job-contact").value,tags:document.getElementById("job-tags")?document.getElementById("job-tags").value.split(",").map(s=>s.trim()).filter(s=>s.length>0):[],notes:document.getElementById("job-notes").value,status:document.getElementById("job-status").value,todos:this.modalTodos,interviews:this.modalInterviews,communicationLogs:this.modalHistory,expenses:this.modalExpenses||[],documents:this.modalDocuments||[],ratings:{salary:parseInt(document.getElementById("rate-salary").value),commute:parseInt(document.getElementById("rate-commute").value),remote:parseInt(document.getElementById("rate-remote").value),culture:parseInt(document.getElementById("rate-culture").value),tech:parseInt(document.getElementById("rate-tech").value)}};if(t){const r=y.getJobs().find(l=>l.id===t);let a=r.history||[];Array.isArray(a)||(a=[]),r.status!==i.status&&a.push({status:i.status,timestamp:new Date().toISOString()});const o={...r,...i,history:a};y.updateJob(o),this.showToast("Job erfolgreich aktualisiert","success")}else{const s={...i,history:[{status:i.status,timestamp:new Date().toISOString()}]};y.addJob(s),this.showToast("Neuer Job hinzugefügt!","success")}this.closeModal("job-modal"),this.renderCurrentView()}populateProfilesSelect(){const e=document.getElementById("profile-select");if(!e)return;const t=y.getProfiles(),i=y.getActiveProfileId();e.innerHTML=t.map(s=>`
            <option value="${s.id}" ${s.id===i?"selected":""}>${s.profileName}</option>
        `).join("")}loadProfileFields(e){document.getElementById("profile-name").value=e.name||"",document.getElementById("profile-title").value=e.title||"",document.getElementById("profile-experience").value=e.experience||"",document.getElementById("profile-notifications").checked=!!e.notificationsEnabled,document.getElementById("profile-api-key").value=e.geminiApiKey||"",document.getElementById("profile-lrs").checked=!!e.lrsEnabled,document.getElementById("profile-rgs").checked=!!e.rgsEnabled,document.getElementById("profile-tax-class").value=e.taxClass||"1",document.getElementById("profile-church-tax").value=e.churchTax||"0",document.getElementById("profile-has-children").checked=!!e.hasChildren,document.getElementById("profile-supabase-url").value=e.supabaseUrl||"",document.getElementById("profile-supabase-key").value=e.supabaseAnonKey||"",document.getElementById("profile-theme-primary").value=e.themePrimaryHue||239,document.getElementById("val-theme-primary").textContent=e.themePrimaryHue||239,document.getElementById("profile-theme-secondary").value=e.themeSecondaryHue||263,document.getElementById("val-theme-secondary").textContent=e.themeSecondaryHue||263,document.getElementById("profile-gemini-model").value=e.geminiModel||"gemini-1.5-flash",document.getElementById("profile-gemini-temperature").value=e.geminiTemperature!==void 0?e.geminiTemperature:.7,document.getElementById("val-gemini-temperature").textContent=e.geminiTemperature!==void 0?e.geminiTemperature:.7,document.getElementById("profile-gemini-instructions").value=e.geminiCustomInstructions||"",this.activeSkills=[...e.skills||[]],this.renderSkillTags()}openProfileModal(){const e=document.getElementById("profile-modal"),t=y.getProfile();this.populateProfilesSelect(),this.loadProfileFields(t);const i=document.getElementById("api-key-test-feedback");i&&(i.style.display="none",i.textContent=""),e.querySelectorAll(".btn-preset-theme").forEach(s=>{s.addEventListener("click",()=>{const r=s.getAttribute("data-primary"),a=s.getAttribute("data-secondary");document.getElementById("profile-theme-primary").value=r,document.getElementById("val-theme-primary").textContent=r,document.getElementById("profile-theme-secondary").value=a,document.getElementById("val-theme-secondary").textContent=a,document.documentElement.style.setProperty("--primary-hue",r),document.documentElement.style.setProperty("--secondary-hue",a),this.showToast("Farb-Preset angewendet!","success")})}),e.classList.add("active")}handleSkillAdd(){const e=document.getElementById("new-skill-input"),t=e.value.trim();t&&(t.split(",").map(s=>s.trim()).filter(s=>s.length>0).forEach(s=>{this.activeSkills.some(r=>r.toLowerCase()===s.toLowerCase())||this.activeSkills.push(s)}),e.value="",this.renderSkillTags())}removeSkill(e){this.activeSkills=this.activeSkills.filter(t=>t!==e),this.renderSkillTags()}renderSkillTags(){const e=document.getElementById("profile-skills-list");e.innerHTML=this.activeSkills.map(t=>`
            <div class="skill-tag">
                <span>${t}</span>
                <button type="button" class="btn-remove-skill" data-skill="${t}">&times;</button>
            </div>
        `).join(""),e.querySelectorAll(".btn-remove-skill").forEach(t=>{t.addEventListener("click",()=>{const i=t.getAttribute("data-skill");this.removeSkill(i)})})}async handleProfileSubmit(){const e=document.getElementById("profile-notifications").checked;e&&Notification.permission!=="granted"&&await Notification.requestPermission()!=="granted"&&this.showToast("Benachrichtigungen wurden vom Browser blockiert.","warning");const t=y.getProfile(),i={id:t.id,profileName:t.profileName,name:document.getElementById("profile-name").value,title:document.getElementById("profile-title").value,skills:this.activeSkills,experience:document.getElementById("profile-experience").value,notificationsEnabled:e,geminiApiKey:document.getElementById("profile-api-key").value.trim(),geminiModel:document.getElementById("profile-gemini-model").value,geminiTemperature:parseFloat(document.getElementById("profile-gemini-temperature").value),geminiCustomInstructions:document.getElementById("profile-gemini-instructions").value,lrsEnabled:document.getElementById("profile-lrs").checked,rgsEnabled:document.getElementById("profile-rgs").checked,taxClass:document.getElementById("profile-tax-class").value,churchTax:document.getElementById("profile-church-tax").value,hasChildren:document.getElementById("profile-has-children").checked,supabaseUrl:document.getElementById("profile-supabase-url").value.trim(),supabaseAnonKey:document.getElementById("profile-supabase-key").value.trim(),themePrimaryHue:parseInt(document.getElementById("profile-theme-primary").value,10),themeSecondaryHue:parseInt(document.getElementById("profile-theme-secondary").value,10)};y.saveProfile(i),this.applyAccessibilitySettings(),this.showToast("Profil und Skills gespeichert","success"),this.closeModal("profile-modal"),this.renderCurrentView()}showToast(e,t="primary"){const i=document.getElementById("toast-container"),s=document.createElement("div");s.className=`toast ${t}`;let r="info";t==="success"?r="check-circle2":t==="danger"?r="alert-octagon":t==="warning"&&(r="alert-triangle"),s.innerHTML=`
            <i data-lucide="${r}" class="toast-icon"></i>
            <span>${e}</span>
        `,i.appendChild(s),lucide.createIcons(),setTimeout(()=>{s.style.animation="slideIn 0.3s reverse forwards",setTimeout(()=>{s.remove()},300)},3e3)}handleDataExport(){try{const e=y.exportBackup(),t="data:application/json;charset=utf-8,"+encodeURIComponent(e),i=`jobmatch_backup_${new Date().toISOString().slice(0,10)}.json`,s=document.createElement("a");s.setAttribute("href",t),s.setAttribute("download",i),s.click(),this.showToast("Backup erfolgreich heruntergeladen!","success")}catch{this.showToast("Fehler beim Exportieren der Daten.","danger")}}handleDataImport(e){const t=new FileReader,i=e.target.files[0];i&&(t.onload=s=>{try{const r=s.target.result;y.importBackup(r),this.showToast("Daten erfolgreich importiert!","success"),e.target.value="",this.renderCurrentView()}catch{this.showToast("Fehler: Ungültiges Backup-Format.","danger")}},t.readAsText(i))}checkDeadlines(){if(!y.getProfile().notificationsEnabled||Notification.permission!=="granted")return;const t=y.getJobs(),i=new Date().toISOString().slice(0,10);t.filter(r=>r.deadline===i&&(r.status==="saved"||r.status==="prepared"||r.status==="applied")).forEach(r=>{new Notification("JobMatch Fristen-Alarm",{body:`Die Bewerbungsfrist für "${r.title}" bei "${r.company}" läuft heute ab!`,icon:"favicon.ico"})})}initNotificationBell(){const e=document.getElementById("btn-notifications-bell"),t=document.getElementById("bell-badge-indicator"),i=document.getElementById("bell-notifications-dropdown"),s=document.getElementById("bell-dropdown-list");if(!e||!i||!s)return;e.addEventListener("click",a=>{a.stopPropagation();const o=i.classList.contains("active");i.classList.toggle("active"),e.setAttribute("aria-expanded",!o)}),document.addEventListener("click",a=>{!i.contains(a.target)&&!e.contains(a.target)&&(i.classList.remove("active"),e.setAttribute("aria-expanded","false"))});const r=()=>{const a=y.getJobs(),o=new Date,l=o.getFullYear(),d=String(o.getMonth()+1).padStart(2,"0"),u=String(o.getDate()).padStart(2,"0"),c=`${l}-${d}-${u}`,p=a.filter(b=>b.deadline===c&&b.status!=="rejected"&&b.status!=="offer");p.length>0?(t&&(t.style.display="block"),s.innerHTML=p.map(b=>`
                    <div class="bell-dropdown-item" data-job-id="${b.id}" style="cursor: pointer;">
                        <span class="job-info">${b.company}</span>
                        <span class="job-desc">${b.title} (Frist heute!)</span>
                    </div>
                `).join(""),s.querySelectorAll(".bell-dropdown-item").forEach(b=>{b.addEventListener("click",()=>{const v=b.getAttribute("data-job-id");this.editJob(v),i.classList.remove("active"),e.setAttribute("aria-expanded","false")})})):(t&&(t.style.display="none"),s.innerHTML='<div class="bell-dropdown-empty">Keine Fristen für heute.</div>')};r(),this.updateNotificationBell=r}renderModalTodos(){const e=document.getElementById("modal-todos-list"),t=document.getElementById("modal-todos-empty"),i=document.getElementById("modal-todos-count");!e||!t||!i||(i.textContent=this.modalTodos.length,this.modalTodos.length>0?(i.style.display="inline-block",t.style.display="none",e.style.display="flex"):(i.style.display="none",t.style.display="block",e.style.display="none"),e.innerHTML=this.modalTodos.map(s=>`
            <li class="todo-list-item ${s.completed?"completed":""}" data-todo-id="${s.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-sm); transition: all var(--transition-fast);">
                <input type="checkbox" class="todo-checkbox" ${s.completed?"checked":""} style="width: 16px; height: 16px; margin-right: 12px; accent-color: var(--primary); cursor: pointer;">
                <span class="todo-text" style="flex-grow: 1; font-size: 0.88rem; color: var(--text-primary); text-decoration: ${s.completed?"line-through":"none"}; opacity: ${s.completed?"0.6":"1"};">${s.text}</span>
                <button type="button" class="btn-delete-todo" title="Aufgabe löschen" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); transition: all var(--transition-fast); display: inline-flex; align-items: center; justify-content: center;">
                    <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                </button>
            </li>
        `).join(""),lucide.createIcons(),e.querySelectorAll(".todo-checkbox").forEach(s=>{s.addEventListener("change",r=>{const a=s.closest(".todo-list-item").getAttribute("data-todo-id"),o=this.modalTodos.find(l=>l.id===a);if(o){o.completed=r.target.checked;const l=s.closest(".todo-list-item").querySelector(".todo-text");l&&(l.style.textDecoration=o.completed?"line-through":"none",l.style.opacity=o.completed?"0.6":"1"),s.closest(".todo-list-item").classList.toggle("completed",o.completed)}})}),e.querySelectorAll(".btn-delete-todo").forEach(s=>{s.addEventListener("click",()=>{const r=s.closest(".todo-list-item").getAttribute("data-todo-id");this.modalTodos=this.modalTodos.filter(a=>a.id!==r),this.renderModalTodos()})}))}renderModalInterviews(){const e=document.getElementById("modal-interviews-list"),t=document.getElementById("modal-interviews-empty"),i=document.getElementById("modal-interviews-count");!e||!t||!i||(this.modalInterviews.sort((s,r)=>new Date(s.date)-new Date(r.date)),i.textContent=this.modalInterviews.length,this.modalInterviews.length>0?(i.style.display="inline-block",t.style.display="none",e.style.display="flex"):(i.style.display="none",t.style.display="block",e.style.display="none"),e.innerHTML=this.modalInterviews.map(s=>{let r="Keine Zeit";return s.date&&(r=new Date(s.date).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})),`
                <div class="interview-card" data-id="${s.id}" style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 16px; transition: all var(--transition-fast); position: relative;">
                    <button type="button" class="btn-delete-interview" title="Gespräch löschen" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); transition: all var(--transition-fast); position: absolute; top: 10px; right: 10px; display: inline-flex; align-items: center; justify-content: center;">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                    <div class="interview-card-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 6px; padding-right: 24px;">
                        <span class="interview-round-title" style="font-weight: 600; color: var(--text-primary); font-size: 0.9rem;">${s.round}</span>
                        <span class="interview-date-badge" style="font-size: 0.75rem; color: var(--text-muted);">${r}</span>
                    </div>
                    ${s.interviewer?`
                        <div class="interview-interviewer-name" style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                            <i data-lucide="user" style="width: 12px; height: 12px; display: inline;"></i> ${s.interviewer}
                        </div>
                    `:""}
                    ${s.notes?`<p class="interview-notes-text" style="font-size: 0.82rem; line-height: 1.45; color: var(--text-secondary); white-space: pre-wrap; background: rgba(0, 0, 0, 0.15); padding: 8px 10px; border-radius: var(--radius-sm); margin: 4px 0 0 0;">${s.notes}</p>`:""}
                </div>
            `}).join(""),lucide.createIcons(),e.querySelectorAll(".btn-delete-interview").forEach(s=>{s.addEventListener("click",()=>{const r=s.closest(".interview-card").getAttribute("data-id");this.modalInterviews=this.modalInterviews.filter(a=>a.id!==r),this.renderModalInterviews()})}))}renderModalHistory(){const e=document.getElementById("modal-history-list"),t=document.getElementById("modal-history-empty"),i=document.getElementById("modal-history-count");!e||!t||!i||(this.modalHistory.sort((s,r)=>new Date(r.date)-new Date(s.date)),i.textContent=this.modalHistory.length,this.modalHistory.length>0?(i.style.display="inline-block",t.style.display="none",e.style.display="flex"):(i.style.display="none",t.style.display="block",e.style.display="none"),e.innerHTML=this.modalHistory.map(s=>{let r="Keine Zeit";return s.date&&(r=new Date(s.date).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})),`
                <div class="history-card" data-id="${s.id}" style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 16px; transition: all var(--transition-fast); position: relative;">
                    <button type="button" class="btn-delete-history" title="Eintrag löschen" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); transition: all var(--transition-fast); position: absolute; top: 10px; right: 10px; display: inline-flex; align-items: center; justify-content: center;">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                    <div class="history-card-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 6px; padding-right: 24px;">
                        <span class="history-round-title" style="font-weight: 600; color: var(--text-primary); font-size: 0.9rem;">${s.subject}</span>
                        <span class="history-date-badge" style="font-size: 0.75rem; color: var(--text-muted);">${r}</span>
                    </div>
                    <div class="history-type-tag" style="font-size: 0.75rem; font-weight: 600; color: var(--primary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                        <i data-lucide="tag" style="width: 12px; height: 12px; display: inline;"></i> ${s.type}
                    </div>
                    ${s.content?`<p class="history-content-text" style="font-size: 0.82rem; line-height: 1.45; color: var(--text-secondary); white-space: pre-wrap; background: rgba(0, 0, 0, 0.15); padding: 8px 10px; border-radius: var(--radius-sm); margin: 4px 0 0 0;">${s.content}</p>`:""}
                </div>
            `}).join(""),lucide.createIcons(),e.querySelectorAll(".btn-delete-history").forEach(s=>{s.addEventListener("click",()=>{const r=s.closest(".history-card").getAttribute("data-id");this.modalHistory=this.modalHistory.filter(a=>a.id!==r),this.renderModalHistory()})}))}initCvUpload(){const e=document.getElementById("profile-cv-upload"),t=document.getElementById("btn-trigger-cv-upload"),i=document.getElementById("cv-upload-filename");!e||!t||(t.addEventListener("click",()=>e.click()),e.addEventListener("change",async s=>{const r=s.target.files[0];if(!r)return;i.textContent=r.name,t.disabled=!0;const a=t.innerHTML;t.innerHTML='<span class="ai-loader-spinner" style="width: 14px; height: 14px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span> Lese...';try{let o="";if(r.type==="application/pdf"||r.name.endsWith(".pdf")?o=await this.extractTextFromPdf(r):o=await this.readTextFile(r),!o||!o.trim())throw new Error("Text konnte nicht aus der Datei extrahiert werden.");this.showToast("Analysiere Lebenslauf...","primary");const l=y.getProfile(),d=document.getElementById("profile-api-key").value.trim()||l.geminiApiKey,u=await A.parseCVText(d,o);u.name&&(document.getElementById("profile-name").value=u.name),u.title&&(document.getElementById("profile-title").value=u.title),u.experience&&(document.getElementById("profile-experience").value=u.experience),u.skills&&Array.isArray(u.skills)&&(this.activeSkills=u.skills,this.renderSkillTags()),this.showToast("Lebenslauf erfolgreich importiert!","success")}catch(o){console.error(o),this.showToast("Fehler beim Importieren: "+o.message,"danger")}finally{t.disabled=!1,t.innerHTML=a,lucide.createIcons()}}))}readTextFile(e){return new Promise((t,i)=>{const s=new FileReader;s.onload=()=>t(s.result),s.onerror=()=>i(new Error("Fehler beim Lesen der Textdatei.")),s.readAsText(e)})}extractTextFromPdf(e){return new Promise((t,i)=>{const s=new FileReader;s.onload=async()=>{try{const r=new Uint8Array(s.result),a=await pdfjsLib.getDocument({data:r}).promise;let o="";for(let l=1;l<=a.numPages;l++){const c=(await(await a.getPage(l)).getTextContent()).items.map(p=>p.str).join(" ");o+=c+`
`}t(o)}catch(r){i(new Error("PDF-Konvertierungsfehler: "+r.message))}},s.onerror=()=>i(new Error("Fehler beim Laden des PDF-Streams.")),s.readAsArrayBuffer(e)})}renderModalExpenses(){const e=document.getElementById("modal-expenses-list"),t=document.getElementById("modal-expenses-empty"),i=document.getElementById("modal-expenses-count");if(!e)return;const s=this.modalExpenses.length;if(i&&(i.textContent=s),s===0){e.style.display="none",t.style.display="block";return}t.style.display="none",e.style.display="flex",e.innerHTML=this.modalExpenses.map(r=>{const a=parseFloat(r.amount).toLocaleString("de-DE",{style:"currency",currency:"EUR"});return`
                <div class="expense-item" style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="text-align: left;">
                        <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--success); font-weight: 700; display: block;">${r.category}</span>
                        <h5 style="margin: 2px 0; font-size: 0.88rem; font-weight: 600; color: var(--text-primary);">${r.notes||r.category}</h5>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(r.date).toLocaleDateString("de-DE")}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 14px;">
                        <span style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">${a}</span>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="window.app.deleteModalExpense('${r.id}')" style="padding: 6px; display: inline-flex; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.2); color: #ef4444;">
                            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                        </button>
                    </div>
                </div>
            `}).join(""),lucide.createIcons()}deleteModalExpense(e){this.modalExpenses=this.modalExpenses.filter(t=>t.id!==e),this.renderModalExpenses()}renderModalDocuments(){const e=document.getElementById("modal-documents-list"),t=document.getElementById("modal-documents-empty"),i=document.getElementById("modal-documents-count");if(!e)return;const s=this.modalDocuments.length;if(i&&(i.textContent=s),s===0){e.style.display="none",t.style.display="block";return}t.style.display="none",e.style.display="flex",e.innerHTML=this.modalDocuments.map(r=>{const a=Math.round(r.size/1024);return`
                <div class="document-item" style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="text-align: left; display: flex; align-items: center; gap: 10px;">
                        <i data-lucide="file-text" style="color: var(--primary); width: 20px; height: 20px; flex-shrink: 0;"></i>
                        <div>
                            <h5 style="margin: 0 0 2px 0; font-size: 0.88rem; font-weight: 600; color: var(--text-primary); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${r.name}">${r.name}</h5>
                            <span style="font-size: 0.72rem; color: var(--text-muted);">${a} KB • ${new Date(r.uploadDate).toLocaleDateString("de-DE")}</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="window.app.downloadDocument('${r.id}', '${r.name}')" title="Herunterladen" style="padding: 6px; display: inline-flex; align-items: center; justify-content: center;">
                            <i data-lucide="download" style="width: 14px; height: 14px;"></i>
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="window.app.deleteDocument('${r.id}')" title="Löschen" style="padding: 6px; display: inline-flex; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.2); color: #ef4444;">
                            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                        </button>
                    </div>
                </div>
            `}).join(""),lucide.createIcons()}async downloadDocument(e,t){try{const i=await q.getFile(e);if(!i||!i.fileBlob){this.showToast("Datei nicht gefunden.","danger");return}const s=URL.createObjectURL(i.fileBlob),r=document.createElement("a");r.href=s,r.download=t,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(s)}catch(i){console.error("Download failed",i),this.showToast("Fehler beim Herunterladen der Datei.","danger")}}async deleteDocument(e){try{await q.deleteFile(e),this.modalDocuments=this.modalDocuments.filter(t=>t.id!==e),this.showToast("Datei gelöscht.","warning"),this.renderModalDocuments()}catch(t){console.error("Delete failed",t),this.showToast("Fehler beim Löschen der Datei.","danger")}}}window.app=new ct;document.addEventListener("DOMContentLoaded",()=>{window.app.init()});
