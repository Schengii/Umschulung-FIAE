(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))i(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function n(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(t){if(t.ep)return;t.ep=!0;const r=n(t);fetch(t.href,r)}})();const be="modulepreload",fe=function(s){return"/"+s},le={},F=function(e,n,i){let t=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),o=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));t=Promise.allSettled(n.map(l=>{if(l=fe(l),l in le)return;le[l]=!0;const p=l.endsWith(".css"),b=p?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${b}`))return;const g=document.createElement("link");if(g.rel=p?"stylesheet":be,p||(g.as="script"),g.crossOrigin="",g.href=l,o&&g.setAttribute("nonce",o),document.head.appendChild(g),p)return new Promise((u,c)=>{g.addEventListener("load",u),g.addEventListener("error",()=>c(new Error(`Unable to preload CSS for ${l}`)))})}))}function r(a){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=a,window.dispatchEvent(o),!o.defaultPrevented)throw a}return t.then(a=>{for(const o of a||[])o.status==="rejected"&&r(o.reason);return e().catch(r)})},z={JOBS:"jobmatch_jobs",PROFILE:"jobmatch_profile",PROFILES:"jobmatch_profiles",ACTIVE_PROFILE_ID:"jobmatch_active_profile_id",WEIGHTS:"jobmatch_weights"},de={name:"Alex Neumann",title:"Frontend Developer",skills:["JavaScript","HTML5","CSS Grid","React","Figma","TypeScript","Responsive Design","Git"],experience:`- 3 Jahre Erfahrung als Webentwickler im E-Commerce
- Erstellung von responsiven User Interfaces
- Erfahrung mit REST APIs und State Management`,geminiApiKey:"",geminiModel:"gemini-1.5-flash",geminiTemperature:.7,geminiCustomInstructions:"",lrsEnabled:!1,rgsEnabled:!1,taxClass:"1",churchTax:"0",hasChildren:!1,supabaseUrl:"",supabaseAnonKey:"",themePrimaryHue:239,themeSecondaryHue:263,weeklyGoal:3,cvText:""},ce={salary:4,commute:2,remote:5,culture:3,tech:4},ve=[{id:"mock-1",title:"Senior Frontend Developer (m/w/d)",company:"InnoTech Solutions",location:"München / Hybrid",workMode:"Hybrid",salary:72e3,url:"https://example.com/jobs/innotech-frontend",deadline:"2026-06-30",description:"Wir suchen einen Frontend-Enthusiasten mit fundierten Kenntnissen in JavaScript, React und CSS Grid. Erfahrung mit TypeScript und Figma ist ein großes Plus.",status:"interviewing",ratings:{salary:8,commute:6,remote:8,culture:7,tech:9},createdAt:"2026-06-01T10:00:00.000Z"},{id:"mock-2",title:"Web Entwickler / React Specialist",company:"Global Commerce GmbH",location:"Remote",workMode:"Remote",salary:65e3,url:"https://example.com/jobs/global-react",deadline:"2026-07-15",description:"Deine Aufgaben: Weiterentwicklung unserer Storefronts in React und TypeScript. Enge Abstimmung mit UX-Designern in Figma. Kenntnisse in REST APIs und Git vorausgesetzt.",status:"applied",ratings:{salary:7,commute:10,remote:10,culture:8,tech:8},createdAt:"2026-06-03T14:30:00.000Z"},{id:"mock-3",title:"Junior UI Engineer",company:"DesignKraft Agency",location:"Berlin / Vor Ort",workMode:"Vor Ort",salary:48e3,url:"https://example.com/jobs/designkraft-junior",deadline:"2026-06-18",description:"Unterstütze uns bei der Umsetzung von kreativen Websites. Du liebst HTML5, CSS Grid und Responsive Design? Adobe XD und Figma sind dir keine Fremdwörter?",status:"saved",ratings:{salary:5,commute:4,remote:2,culture:9,tech:7},createdAt:"2026-06-05T09:15:00.000Z"},{id:"mock-4",title:"Frontend Lead Developer",company:"CoreByte Systems",location:"München",workMode:"Vor Ort",salary:85e3,url:"https://example.com/jobs/corebyte-lead",deadline:"2026-06-25",description:"Architektur unserer Frontend-Systeme. Stack: Next.js, TypeScript, TailwindCSS. Du koordinierst das Entwickler-Team und stimmst dich mit dem Produktmanagement ab.",status:"offer",ratings:{salary:9,commute:4,remote:3,culture:6,tech:8},createdAt:"2026-05-28T16:00:00.000Z"}],x={getJobs(){const s=localStorage.getItem(z.JOBS);let e=[];s?e=JSON.parse(s):(e=ve,this.saveJobs(e));let n=!1;const i=e.map(t=>{let r=!1;return(!t.todos||!Array.isArray(t.todos))&&(t.todos=[],r=!0),(!t.interviews||!Array.isArray(t.interviews))&&(t.interviews=[],r=!0),(!t.communicationLogs||!Array.isArray(t.communicationLogs))&&(t.communicationLogs=[],r=!0),(!t.expenses||!Array.isArray(t.expenses))&&(t.expenses=[],r=!0),(!t.documents||!Array.isArray(t.documents))&&(t.documents=[],r=!0),r&&(n=!0),t});return n&&this.saveJobs(i),i},saveJobs(s){localStorage.setItem(z.JOBS,JSON.stringify(s));const e=this.getProfile();F(()=>import("./supabaseSync-CNVu12db.js"),[]).then(n=>{n.supabaseSync.syncJobs(e,s)}).catch(n=>console.warn("Supabase jobs sync failed:",n)),window.app&&typeof window.app.updateNotificationBell=="function"&&window.app.updateNotificationBell()},addJob(s){const e=this.getJobs(),n={...s,id:"job-"+Date.now(),createdAt:new Date().toISOString()};return e.push(n),this.saveJobs(e),n},updateJob(s){const e=this.getJobs(),n=e.findIndex(i=>i.id===s.id);return n!==-1?(e[n]={...e[n],...s},this.saveJobs(e),!0):!1},deleteJob(s){const n=this.getJobs().filter(i=>i.id!==s);this.saveJobs(n)},getProfiles(){let s=localStorage.getItem(z.PROFILES),e=localStorage.getItem(z.ACTIVE_PROFILE_ID),n=[];if(s)try{n=JSON.parse(s)}catch{}const i=localStorage.getItem(z.PROFILE);if(!n||n.length===0){let r=de;if(i)try{r=JSON.parse(i)}catch{}r.id||(r.id="prof-default"),r.profileName||(r.profileName=r.name||"Standard Profil"),n=[r],localStorage.setItem(z.PROFILES,JSON.stringify(n))}let t=!1;return n=n.map((r,a)=>(r.id||(r.id="prof-"+a+"-"+Date.now(),t=!0),r.profileName||(r.profileName=r.name||`Profil ${a+1}`,t=!0),r)),t&&localStorage.setItem(z.PROFILES,JSON.stringify(n)),(!e||!n.some(r=>r.id===e))&&(e=n[0].id,localStorage.setItem(z.ACTIVE_PROFILE_ID,e)),n},getActiveProfileId(){return this.getProfiles(),localStorage.getItem(z.ACTIVE_PROFILE_ID)},setActiveProfileId(s){const e=this.getProfiles();if(e.some(n=>n.id===s)){localStorage.setItem(z.ACTIVE_PROFILE_ID,s);const n=e.find(i=>i.id===s);localStorage.setItem(z.PROFILE,JSON.stringify(n)),F(()=>import("./supabaseSync-CNVu12db.js"),[]).then(i=>{i.supabaseSync.syncProfile(n);const t=this.getJobs();i.supabaseSync.syncJobs(n,t)}).catch(i=>console.warn("Supabase profile sync failed:",i))}},getProfile(){const s=this.getProfiles(),e=this.getActiveProfileId();return s.find(n=>n.id===e)||s[0]},saveProfile(s){s.id||(s.id=this.getActiveProfileId()||"prof-default"),s.profileName||(s.profileName=s.name||"Standard Profil");const e=this.getProfiles(),n=e.findIndex(t=>t.id===s.id);n!==-1?e[n]=s:e.push(s),localStorage.setItem(z.PROFILES,JSON.stringify(e)),this.getActiveProfileId()===s.id&&(localStorage.setItem(z.PROFILE,JSON.stringify(s)),F(()=>import("./supabaseSync-CNVu12db.js"),[]).then(t=>{t.supabaseSync.syncProfile(s);const r=this.getJobs();t.supabaseSync.syncJobs(s,r)}).catch(t=>console.warn("Supabase profile sync failed:",t)))},addProfile(s){const e=this.getProfiles(),n=this.getProfile(),i={...de,...n,id:"prof-"+Date.now(),profileName:s,name:n.name||"Alex Neumann",skills:[...n.skills],experience:n.experience||""};return e.push(i),localStorage.setItem(z.PROFILES,JSON.stringify(e)),this.setActiveProfileId(i.id),i},deleteProfile(s){let e=this.getProfiles();if(e.length<=1)throw new Error("Das letzte verbleibende Profil kann nicht gelöscht werden.");e=e.filter(i=>i.id!==s),localStorage.setItem(z.PROFILES,JSON.stringify(e)),this.getActiveProfileId()===s&&this.setActiveProfileId(e[0].id)},getWeights(){const s=localStorage.getItem(z.WEIGHTS);return s?JSON.parse(s):(this.saveWeights(ce),ce)},saveWeights(s){localStorage.setItem(z.WEIGHTS,JSON.stringify(s))},exportBackup(){return JSON.stringify({version:"1.0",jobs:this.getJobs(),profile:this.getProfile(),weights:this.getWeights()},null,2)},importBackup(s){try{const e=JSON.parse(s);if(!e.jobs||!Array.isArray(e.jobs)||!e.profile||!e.weights)throw new Error("Ungültiges Format: jobs, profile oder weights fehlen.");return this.saveJobs(e.jobs),this.saveProfile(e.profile),this.saveWeights(e.weights),!0}catch(e){throw console.error("Backup Import fehlgeschlagen",e),e}}},we=["javascript","html5","html","css grid","css","react","vue","angular","typescript","node.js","node","next.js","tailwind","figma","ui","ux","git","github","python","java","c#","c++","docker","kubernetes","aws","cloud","rest api","api","scrum","agile","projektmanagement","sql","nosql","mongodb","responsive design","adobe xd","sketch","english","deutsch"],$={async fetchJobDescriptionFromUrl(s){if(!s)throw new Error("Keine URL angegeben.");const e=`https://api.allorigins.win/get?url=${encodeURIComponent(s)}`,n=await fetch(e);if(!n.ok)throw new Error("Fehler beim Abrufen der URL.");const t=(await n.json()).contents;if(!t)throw new Error("Keine Inhalte unter dieser URL gefunden.");const a=new DOMParser().parseFromString(t,"text/html");let o=a.body;const l=a.querySelector("#jobDescriptionText")||a.querySelector(".jobsearch-JobComponent-description"),p=a.querySelector(".show-more-less-html__markup")||a.querySelector(".jobs-description__content")||a.querySelector(".description__text"),b=a.querySelector(".job-description")||a.querySelector(".js-app-ld-content")||a.querySelector(".g-job-description");return l?o=l:p?o=p:b&&(o=b),o.querySelectorAll("script, style, head, nav, footer, header, iframe, noscript, button, input").forEach(u=>u.remove()),(o.innerText||o.textContent||"").replace(/\s+/g," ").trim().slice(0,5e3)},async testApiKey(s){var l,p,b,g,u,c;if(!s||!s.trim())throw new Error("Kein API-Key angegeben.");const i=`https://generativelanguage.googleapis.com/v1beta/models/${x.getProfile().geminiModel||"gemini-1.5-flash"}:generateContent?key=${s}`,r=await fetch(i,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:"Antworte kurz mit dem Wort 'OK', wenn du mich hoerst."}]}]})});if(!r.ok){const y=await r.json();throw new Error(((l=y.error)==null?void 0:l.message)||"Verbindung fehlgeschlagen.")}if(!((c=(u=(g=(b=(p=(await r.json()).candidates)==null?void 0:p[0])==null?void 0:b.content)==null?void 0:g.parts)==null?void 0:u[0])==null?void 0:c.text))throw new Error("Keine Antwort von der API erhalten.");return!0},extractKeywords(s){if(!s)return[];const e=s.toLowerCase(),n=we.filter(i=>{const t=i.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&");return new RegExp(`\\b${t}\\b|\\b${t}`,"i").test(e)});return[...new Set(n)]},analyzeMatch(s,e){if(!e)return{matchScore:0,matchingSkills:[],missingSkills:[]};const n=this.extractKeywords(e);if(n.length===0){const l=e.toLowerCase(),p=s.filter(b=>{const g=b.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&");return new RegExp(`\\b${g}\\b`,"i").test(l)});return{matchScore:s.length>0?Math.round(p.length/Math.min(s.length,5)*100):0,matchingSkills:p,missingSkills:[]}}const i=s.map(l=>l.toLowerCase().trim()),t=[],r=[];n.forEach(l=>{if(i.some(b=>b===l||b.includes(l)||l.includes(b))){const b=s.find(g=>g.toLowerCase().trim()===l)||l.charAt(0).toUpperCase()+l.slice(1);t.push(b)}else r.push(l.charAt(0).toUpperCase()+l.slice(1))});const a=n.length,o=a>0?Math.round(t.length/a*100):0;return{matchScore:Math.min(o,100),matchingSkills:t,missingSkills:r}},generateCoverLetter(s,e,n="classic"){return s.geminiApiKey&&s.geminiApiKey.trim()?this.generateRealCoverLetter(s.geminiApiKey,s,e,n):new Promise(i=>{setTimeout(()=>{const{matchingSkills:t}=this.analyzeMatch(s.skills,e.description),r=t.length>0?t.slice(0,3).join(", "):s.skills.slice(0,3).join(", ")||"Webentwicklung";if(n==="creative"){const b=`Hallo Team von ${e.company},

Softwareentwicklung ist für mich leidenschaftliches Handwerk – und Ihre Stellenausschreibung als **${e.title}** hat mich sofort begeistert!

Warum ich zu Ihnen passe? Ganz einfach: Mit meinen Kenntnissen in **${r}** bringe ich frischen Wind und pragmatische Lösungen mit. Ich liebe es, komplexe Herausforderungen in intuitive Benutzeroberflächen zu verwandeln.

Lassen Sie uns im Gespräch herausfinden, wie wir gemeinsam Großartiges erschaffen können!

Viele Grüße,
${s.name||"Max Mustermann"}`;i(b);return}else if(n==="pitch"){const b=`Sehr geehrte Damen und Herren bei ${e.company},

3 Gründe, warum ich Ihr neuer **${e.title}** sein sollte:
1. **Experte in ${r}**: Direkt einsatzbereit von Tag 1 an.
2. **Praxiserfahrung**: ${s.title||"Entwickler"} mit Fokus auf moderne UI & Performance.
3. **Lernbereitschaft**: Schnelle Einarbeitung in Ihren spezifischen Stack.

Ich freue mich auf ein kurzes Erstgespräch!

Beste Grüße,
${s.name||"Max Mustermann"}`;i(b);return}const a=`Sehr geehrtes Team von ${e.company},

`,o=`mit großem Interesse habe ich Ihre Ausschreibung für die Position als **${e.title}** gelesen. Da mein Profil ideal zu den von Ihnen genannten Anforderungen passt, möchte ich mich Ihnen gerne vorstellen.

`;let l=t.length>0?`In meiner bisherigen Laufbahn konnte ich fundierte Erfahrungen in Projekten sammeln, bei denen insbesondere **${r}** im Fokus standen. Die von Ihnen geforderten Kompetenzen bringe ich daher direkt mit.

`:`Als motivierter ${s.title||"Entwickler"} bringe ich eine große Lernbereitschaft und Begeisterung für neue Webtechnologien mit.

`;const p=`Für Fragen stehe ich Ihnen jederzeit gerne zur Verfügung und freue mich über die Einladung zu einem persönlichen Kennenlernen.

Mit freundlichen Grüßen,
${s.name||"Max Mustermann"}`;i(a+o+l+p)},800)})},async generateRealCoverLetter(s,e,n,i="classic"){var c,y,v,d,m,h;const t=e.geminiModel||"gemini-1.5-flash",r=e.geminiTemperature!==void 0?e.geminiTemperature:.7,a=e.geminiCustomInstructions||"",o=`https://generativelanguage.googleapis.com/v1beta/models/${t}:generateContent?key=${s}`;let l=`Du bist ein professioneller Bewerbungs-Schreiber. Verfasse das Anschreiben in der Tonalität: ${i}.`;a&&(l+=`
Beachte zusätzlich folgende Schreibstil-Anweisungen des Benutzers: ${a}`);const b={contents:[{parts:[{text:`Erstelle ein professionelles Bewerbungsanschreiben (${i}-Stil) auf Deutsch für folgende Position:
Stellentitel: ${n.title}
Unternehmen: ${n.company}
Bewerber: ${e.name||"Max Mustermann"} (${e.title||"Entwickler"})
Skills: ${e.skills.join(", ")}`}]}],systemInstruction:{parts:[{text:l}]},generationConfig:{temperature:r}},g=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});if(!g.ok){const w=await g.json();throw new Error(((c=w.error)==null?void 0:c.message)||"Fehler bei der Gemini-API-Anfrage.")}return((h=(m=(d=(v=(y=(await g.json()).candidates)==null?void 0:y[0])==null?void 0:v.content)==null?void 0:d.parts)==null?void 0:m[0])==null?void 0:h.text)||"Fehler beim Laden des Anschreibens."},generateInterviewPrep(s,e){return s.geminiApiKey&&s.geminiApiKey.trim()?this.generateRealInterviewPrep(s.geminiApiKey,s,e):new Promise(n=>{setTimeout(()=>{const{matchingSkills:i,missingSkills:t}=this.analyzeMatch(s.skills,e.description),r=[];if(i.length>0){const a=i[0];r.push({id:1,question:`Sie erwähnen in Ihrem Profil Erfahrungen mit "${a}". Können Sie uns ein konkretes Beispiel für ein Projekt nennen, bei dem Sie diese Technologie erfolgreich eingesetzt haben, und auf welche Herausforderungen Sie dabei gestoßen sind?`,strategy:`Nutze die STAR-Methode (Situation, Task, Action, Result). Erkläre kurz das Projektziel, deine konkrete Rolle, wie du "${a}" genutzt hast und welches positive Endergebnis erzielt wurde.`,sampleAnswer:`Ja, in einem meiner letzten Projekte ging es um die Erstellung eines komplexen User-Dashboards. Dabei habe ich "${a}" intensiv genutzt, um eine responsive und performante Oberfläche zu entwickeln. Eine der größten Herausforderungen war die Optimierung der Ladezeiten. Ich konnte dies lösen, indem ich gezielte Optimierungen vornahm, wodurch die Ladezeit um 25% sank.`})}else r.push({id:1,question:`Warum interessieren Sie sich speziell für die Stelle als ${e.title} bei uns und warum sind Sie die richtige Besetzung, obwohl Sie neu in diesem Bereich einsteigen?`,strategy:`Fokussiere dich auf deine hohe Lernbereitschaft und Motivation. Zeige, dass du dich im Vorfeld intensiv mit ${e.company} auseinandergesetzt hast und die Werte teilst.`,sampleAnswer:`Ich verfolge die Entwicklung von ${e.company} schon länger und bin begeistert von Ihrer Innovationskraft. Als lernwilliger Entwickler reizt mich die Chance, mich in neue Frameworks einzuarbeiten und mein theoretisches Wissen direkt in einem professionellen Umfeld produktiv anzuwenden.`});if(t.length>0){const a=t[0];r.push({id:2,question:`In unserer Stellenausschreibung fordern wir Kenntnisse in "${a}". Wie schätzen Sie Ihre Kenntnisse in diesem Bereich ein und wie würden Sie sich in den ersten Wochen einarbeiten?`,strategy:"Gib offen zu, dass du hier noch Lernbedarf hast, aber verknüpfe es sofort mit einer proaktiven Lösungsstrategie. Nenne verwandte Technologien, die du bereits beherrschst, um zu zeigen, dass dir der Einstieg leicht fallen wird.",sampleAnswer:`Ich habe in der Praxis noch nicht tiefgehend mit "${a}" gearbeitet, besitze aber fundierte Erfahrung in verwandten Bereichen wie ${i[0]||"Webtechnologien"}. Ich habe mir bereits Online-Ressourcen angeschaut und bin zuversichtlich, mich durch mein Verständnis moderner Softwarearchitekturen innerhalb weniger Wochen voll produktiv in "${a}" einzuarbeiten.`})}else r.push({id:2,question:"Wie gehen Sie vor, wenn Sie in einem Projekt auf ein technisches Problem stoßen, für das Sie ad hoc keine Lösung wissen?",strategy:"Hier geht es um deine Problemlösungsfähigkeiten und Teamarbeit. Zeige, dass du strukturiert recherchieren kannst (Dokumentation, StackOverflow), aber auch den Mut hast, im Team nachfragebereit zu sein.",sampleAnswer:"Zuerst analysiere ich das Problem systematisch und isoliere den Fehler. Ich recherchiere in offiziellen Dokumentationen. Wenn ich nach angemessener Zeit keine Lösung finde, bereite ich das Problem strukturiert vor, um einen Kollegen um ein kurzes Pair-Programming-Feedback zu bitten. Das spart dem Projekt Zeit."});r.push({id:3,question:`Wir legen bei ${e.company} großen Wert auf Teamkultur und das Arbeitsmodell (${e.workMode||"Hybrid"}). Wie organisieren Sie sich im Alltag und wie kommunizieren Sie im Team?`,strategy:"Betone deine Selbstorganisation und Zuverlässigkeit, besonders bei Remote- oder Hybridarbeit. Erwähne gängige Tools (Git, Slack, Jira, Zoom) und regelmäßige Check-Ins.",sampleAnswer:`Ich strukturiere meinen Tag mit festen To-Do-Listen und nutze Tools wie Git zur Versionskontrolle. In einem ${e.workMode||"Hybrid"}-Modell ist mir proaktive Kommunikation extrem wichtig – lieber einmal mehr im Chat abstimmen als im Unklaren zu bleiben. Ich schätze regelmäßige Dailies sehr.`}),r.push({id:4,question:"Können Sie eine Situation beschreiben, in der Sie kritisches Feedback zu Ihrer Arbeit erhalten haben, und wie Sie damit umgegangen sind?",strategy:"Zeige professionelle Reife, Kritikfähigkeit und die Fähigkeit, Feedback zur persönlichen Weiterentwicklung zu nutzen. Nenne ein konkretes Beispiel und das positive Resultat der Umsetzung.",sampleAnswer:"In einem Code-Review wurde angemerkt, dass meine Komponenten-Struktur schwer wiederverwendbar war. Anstatt defensiv zu reagieren, habe ich mich mit dem Kollegen zusammengesetzt, um seine Best Practices zu verstehen. Ich habe die Komponenten refaktoriert und mein Verständnis für modularere Softwarearchitektur nachhaltig verbessert."}),r.push({id:5,question:`Wo sehen Sie sich beruflich in den nächsten 3 bis 5 Jahren und wie trägt diese Position als ${e.title} dazu bei?`,strategy:"Verbinde deine persönlichen Wachstumsziele mit dem Erfolg des Unternehmens. Zeige Ambition, aber bleibe realistisch und drücke deine Loyalität aus.",sampleAnswer:`In den nächsten Jahren möchte ich meine Expertise im Bereich Frontend-Architektur vertiefen und ggf. fachliche Verantwortung übernehmen. Die Position bei ${e.company} bietet mir durch die anspruchsvollen Projekte und das moderne Tech-Stack die ideale Umgebung, um mich fachlich weiterzuentwickeln und gleichzeitig einen wertvollen Beitrag zu eurem Wachstum zu leisten.`}),n(r)},1e3)})},async generateRealInterviewPrep(s,e,n){var y,v,d,m,h,w;const i=e.geminiModel||"gemini-1.5-flash",t=e.geminiTemperature!==void 0?e.geminiTemperature:.7,r=e.geminiCustomInstructions||"",a=`https://generativelanguage.googleapis.com/v1beta/models/${i}:generateContent?key=${s}`;let o="Du bist ein professioneller Karriere-Coach. Du analysierst die Anforderungen einer Stelle und die Skills eines Bewerbers und generierst 5 typische Interviewfragen, eine strategische Empfehlung für den Bewerber zur Beantwortung sowie eine beispielhafte exzellente Modellantwort aus Sicht des Bewerbers.";r&&(o+=`
Beachte zusätzlich folgende Schreibstil-Anweisungen des Benutzers: ${r}`);const b={contents:[{parts:[{text:`Analysiere die Anforderungen für folgende Stelle und die Skills des Bewerbers. Erstelle 5 typische Interviewfragen.
Stellentitel: ${n.title}
Unternehmen: ${n.company}
Stellenbeschreibung:
${n.description||"Keine Angabe"}

Bewerber-Details:
Name: ${e.name||"Max Mustermann"}
Skills: ${e.skills.join(", ")}
Erfahrung:
${e.experience||"Keine Angabe"}

Gib das Ergebnis als valides JSON-Array zurück. Jede Frage im Array muss exakt die Attribute "id", "question", "strategy" und "sampleAnswer" aufweisen (alles als Strings).`}]}],systemInstruction:{parts:[{text:o}]},generationConfig:{responseMimeType:"application/json",responseSchema:{type:"ARRAY",items:{type:"OBJECT",properties:{id:{type:"INTEGER"},question:{type:"STRING"},strategy:{type:"STRING"},sampleAnswer:{type:"STRING"}},required:["id","question","strategy","sampleAnswer"]}},temperature:t}},g=await fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});if(!g.ok){const S=await g.json();throw new Error(((y=S.error)==null?void 0:y.message)||"Fehler bei der Gemini-API-Anfrage.")}const c=(w=(h=(m=(d=(v=(await g.json()).candidates)==null?void 0:v[0])==null?void 0:d.content)==null?void 0:m.parts)==null?void 0:h[0])==null?void 0:w.text;if(!c)throw new Error("Keine Antwort erhalten.");return JSON.parse(c)},async parseJobDescription(s,e){if(!e||!e.trim())throw new Error("Bitte geben Sie einen Text ein, der analysiert werden soll.");return s&&s.trim()?this.parseRealJobDescription(s,e):new Promise(n=>{setTimeout(()=>{const i=e.split(`
`).map(m=>m.trim()).filter(m=>m.length>0);let t="Unbekannter Jobtitel",r="Unbekanntes Unternehmen",a=0,o="Deutschland",l="Hybrid",p="";const b=["entwickler","developer","designer","ingenieur","engineer","manager","berater","consultant","architect","spezialist","specialist"];for(const m of i.slice(0,5))if(b.some(h=>m.toLowerCase().includes(h))){t=m;break}const g=["gmbh","ag","co. kg","se","solutions","technologies","group","partner"];for(const m of i)if(g.some(h=>m.toLowerCase().includes(h))){r=m.replace(/(wir suchen|jobs|stelle|karriere|bei)\s*/i,"").trim();break}const u=/(?:gehalt|verdienst|einkommen|salär|jahresgehalt|vergütung)?\s*(?:bis|von|ca\.)?\s*([0-9]{2,3}(?:\.[0-9]{3})?)\s*(?:€|euro|\$)/i,c=e.match(u);if(c)a=parseInt(c[1].replace(".",""),10);else{const m=e.match(/\b(2[5-9][0-9]{3}|[3-9][0-9]{4}|1[0-8][0-9]{4})\b/);m&&(a=parseInt(m[1],10))}/remote|homeoffice|home-office|zuhause|work from home/i.test(e)?l="Remote":/hybrid|flexibel/i.test(e)?l="Hybrid":/vor ort|präsenz|büro/i.test(e)&&(l="Vor Ort");const y=["berlin","münchen","hamburg","köln","frankfurt","stuttgart","düsseldorf","dortmund","essen","bremen","leipzig","dresden","nürnberg","karlsruhe"];for(const m of e.toLowerCase().split(/[^a-zäöüß]/))if(y.includes(m)){o=m.charAt(0).toUpperCase()+m.slice(1);break}const v=/(?:ansprechpartner|kontakt|bewerben an|kontaktperson|recruiter|hr-manager|hr)\s*(?:ist|unter|:)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/,d=e.match(v);d&&(p=d[1]),n({title:t,company:r,salary:a,location:o,workMode:l,description:e.slice(0,1e3)+(e.length>1e3?"...":""),contact:p})},1e3)})},async parseRealJobDescription(s,e){var u,c,y,v,d,m;const t=`https://generativelanguage.googleapis.com/v1beta/models/${x.getProfile().geminiModel||"gemini-1.5-flash"}:generateContent?key=${s}`,l={contents:[{parts:[{text:`Analysiere folgende Stellenbeschreibung und extrahiere die Kerndaten:
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

Gib ausschließlich das JSON-Objekt zurück.`}]}],systemInstruction:{parts:[{text:"Du bist ein intelligenter Daten-Extraktor. Analysiere den bereitgestellten Text einer Stellenanzeige und extrahiere strukturierte Daten auf Deutsch."}]},generationConfig:{responseMimeType:"application/json",responseSchema:{type:"OBJECT",properties:{title:{type:"STRING"},company:{type:"STRING"},salary:{type:"INTEGER"},location:{type:"STRING"},workMode:{type:"STRING"},description:{type:"STRING"},contact:{type:"STRING"}},required:["title","company","salary","location","workMode","description","contact"]},temperature:.1}},p=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(l)});if(!p.ok){const h=await p.json();throw new Error(((u=h.error)==null?void 0:u.message)||"Fehler bei der Gemini-API-Anfrage.")}const g=(m=(d=(v=(y=(c=(await p.json()).candidates)==null?void 0:c[0])==null?void 0:y.content)==null?void 0:v.parts)==null?void 0:d[0])==null?void 0:m.text;if(!g)throw new Error("Keine Antwort erhalten.");return JSON.parse(g)},async parseEmailText(s,e){if(!e||!e.trim())throw new Error("Kein E-Mail-Text angegeben.");const n=e.toLowerCase();let i="applied";n.includes("absage")||n.includes("leider")||n.includes("nicht berücksichtigen")?i="rejected":n.includes("einladung")||n.includes("gespräch")||n.includes("interview")||n.includes("termin")?i="interviewing":(n.includes("angebot")||n.includes("zusage")||n.includes("arbeitsvertrag"))&&(i="offer");const t=e.match(/(?:bei|von|firma|unternehmen)\s+([A-Z][A-Za-z0-9\s&.-]+)/i),r=t?t[1].trim().split(/\s+/).slice(0,3).join(" "):"";return{status:i,company:r||"",notes:`E-Mail Import am ${new Date().toLocaleDateString("de-DE")}:
"${e.slice(0,200)}..."`}},async evaluateInterviewAnswer(s,e,n){if(!n||!n.trim())throw new Error("Bitte geben Sie eine Antwort ein, die bewertet werden soll.");return s&&s.trim()?this.evaluateRealInterviewAnswer(s,e,n):new Promise(i=>{setTimeout(()=>{const t=n.trim().split(/\s+/).length;let r=50;t<10?r-=20:t>=10&&t<30?r+=10:t>=30&&t<80?r+=25:r+=30;const a=["projekt","erfahrung","herausforderung","gelöst","team","kunde","kunden","kommunikation","lösung","lernen","struktur","star","situation","ziel","ergebnis"];let o=[];a.forEach(b=>{n.toLowerCase().includes(b)&&(r+=3,o.push(b))}),r=Math.min(Math.max(r,10),100);let l="",p="";r<50?(l="Deine Antwort ist sehr kurz geraten und geht kaum auf die Facetten der Frage ein. Recruiter möchten in der Regel mehr Kontext und Details hören.",p="Versuche, deine Antwort nach der STAR-Methode aufzubauen: Welches Problem lag vor? Was war deine Aufgabe? Was hast du konkret getan? Und was war das messbare Resultat?"):r>=50&&r<75?(l=`Guter Ansatz! Du hast bereits einige wichtige Aspekte genannt (z.B. Wörter wie: ${o.join(", ")||"keine"}). Deine Antwort ist strukturiert, könnte aber noch mit einem konkreteren Beispiel belegt werden.`,p="Untermauere deine Behauptungen mit einem echten Ereignis aus deiner Praxis. Erzähle eine kurze Story, wie du genau vorgegangen bist. Das wirkt authentischer und überzeugender."):(l=`Hervorragende Antwort! Du hast sehr detailliert geantwortet (${t} Wörter) und wichtige Begriffe wie ${o.join(", ")||"Berufserfahrung"} verwendet. Damit vermittelst du Professionalität und Struktur.`,p="Deine Antwort ist bereits sehr stark. Achte beim Vorlesen darauf, ruhig und selbstbewusst zu sprechen. Die Antwort ist perfekt vorbereitet!"),i({score:r,feedback:l,suggestions:p})},1e3)})},async evaluateRealInterviewAnswer(s,e,n){var v,d,m,h,w,S;const i=x.getProfile(),t=i.geminiModel||"gemini-1.5-flash",r=i.geminiTemperature!==void 0?i.geminiTemperature:.7,a=i.geminiCustomInstructions||"",o=`https://generativelanguage.googleapis.com/v1beta/models/${t}:generateContent?key=${s}`;let l="Du bist ein professioneller Karriere-Coach. Bewerte die Antwort des Bewerbers ehrlich, professionell und konstruktiv auf Deutsch.";a&&(l+=`
Beachte zusätzlich folgende Schreibstil-Anweisungen des Benutzers: ${a}`);const g={contents:[{parts:[{text:`Bewerte die folgende Antwort des Bewerbers auf die Interviewfrage:
Frage: ${e}
Antwort des Bewerbers: ${n}

Gib das Ergebnis als valides JSON-Objekt zurück mit genau diesen Feldern:
- score: Eine Zahl von 0 bis 100, die die Qualität der Antwort bewertet
- feedback: Eine ehrliche, konstruktive Analyse der Stärken und Schwächen der Antwort (max. 500 Zeichen)
- suggestions: Konkrete, handlungsorientierte Verbesserungsvorschläge (was gefehlt hat, wie man es besser formuliert, max. 500 Zeichen)

Gib ausschließlich das JSON-Objekt zurück.`}]}],systemInstruction:{parts:[{text:l}]},generationConfig:{responseMimeType:"application/json",responseSchema:{type:"OBJECT",properties:{score:{type:"INTEGER"},feedback:{type:"STRING"},suggestions:{type:"STRING"}},required:["score","feedback","suggestions"]},temperature:r}},u=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(g)});if(!u.ok){const E=await u.json();throw new Error(((v=E.error)==null?void 0:v.message)||"Fehler bei der Gemini-API-Anfrage.")}const y=(S=(w=(h=(m=(d=(await u.json()).candidates)==null?void 0:d[0])==null?void 0:m.content)==null?void 0:h.parts)==null?void 0:w[0])==null?void 0:S.text;if(!y)throw new Error("Keine Antwort erhalten.");return JSON.parse(y)},generateResumeOptimization(s,e,n){return s.geminiApiKey&&s.geminiApiKey.trim()?this.generateRealResumeOptimization(s.geminiApiKey,s,e,n):new Promise(i=>{setTimeout(()=>{const t=this.extractKeywords(e.description),r=this.extractKeywords(n),a=t.filter(y=>r.includes(y)),o=t.filter(y=>!r.includes(y)),l=t.length;let p=l>0?Math.round(a.length/l*100):50;(!n||!n.trim())&&(p=10);const b=a.map(y=>y.charAt(0).toUpperCase()+y.slice(1)),g=o.map(y=>y.charAt(0).toUpperCase()+y.slice(1)),u=[];if(o.length>0){const y=g[0];u.push({original:"Kenntnisse in der Softwareentwicklung.",improved:`Konzeption und Implementierung robuster Softwarelösungen unter Anwendung von ${y} für strukturierte Arbeitsabläufe.`,why:`Hebt deine Kompetenz in ${y} aktiv hervor und verwendet stärkere Aktionsverben.`})}if(a.length>0){const y=b[0];u.push({original:`Ich habe mit ${y} gearbeitet.`,improved:`Erfolgreiche Integration von ${y} in produktiven Projekten zur Optimierung der Benutzerfreundlichkeit und Ladezeiten.`,why:"Stellt den konkreten geschäftlichen Mehrwert (Ladezeiten, UX) in den Vordergrund."})}else u.push({original:"Erstellung von Frontends und Webseiten.",improved:"Entwicklung hochperformanter, responsiver Benutzeroberflächen unter Einhaltung moderner Accessibility- und Design-Standards.",why:"Verwendet präzisere Fachbegriffe und zeigt Fokus auf Performance und Barrierefreiheit."});u.push({original:"Zusammenarbeit mit Kollegen im Team.",improved:"Agile Zusammenarbeit in interdisziplinären Teams unter Nutzung von Git, Scrum und kollaborativen Design-Tools wie Figma.",why:"Spezifiziert deine agilen Arbeitsmethoden und genutzten Tools."});const c=n&&n.trim()?`Dein Lebenslauf hat bereits eine solide Basis (Match Score: ${p}%). Um für die Stelle als ${e.title} bei ${e.company} maximal attraktiv zu sein, solltest du die fehlenden Schlagworte wie ${g.slice(0,3).join(", ")||"keine"} prominenter in deinen Projekten platzieren. Achte darauf, deine Erfahrungsergebnisse messbar zu beschreiben.`:"Füge deinen Lebenslauf-Text im Eingabebereich ein, um eine detaillierte Keyword-Analyse und maßgeschneiderte Verbesserungsvorschläge für dieses Stellenprofil zu erhalten.";i({score:p,matchingKeywords:b,missingKeywords:g,bulletPoints:u,generalTips:c})},1e3)})},async generateRealResumeOptimization(s,e,n,i){var v,d,m,h,w,S;const t=e.geminiModel||"gemini-1.5-flash",r=e.geminiTemperature!==void 0?e.geminiTemperature:.7,a=e.geminiCustomInstructions||"",o=`https://generativelanguage.googleapis.com/v1beta/models/${t}:generateContent?key=${s}`;let l="Du bist ein professioneller Karriere-Coach und HR-Analyst. Du analysierst den Lebenslauf eines Bewerbers im Vergleich zu einer Stellenausschreibung. Du lieferst detailliertes Feedback, berechnest einen Match-Score und gibst konkrete Vorschläge zur Optimierung von Lebenslauf-Formulierungen.";a&&(l+=`
Beachte zusätzlich folgende Schreibstil-Anweisungen des Benutzers: ${a}`);const g={contents:[{parts:[{text:`Vergleiche den Lebenslauf des Bewerbers mit der Stellenbeschreibung.
Stellentitel: ${n.title}
Unternehmen: ${n.company}
Stellenbeschreibung:
${n.description||"Keine Angabe"}

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

Gib ausschließlich das JSON-Objekt zurück.`}]}],systemInstruction:{parts:[{text:l}]},generationConfig:{responseMimeType:"application/json",responseSchema:{type:"OBJECT",properties:{score:{type:"INTEGER"},matchingKeywords:{type:"ARRAY",items:{type:"STRING"}},missingKeywords:{type:"ARRAY",items:{type:"STRING"}},bulletPoints:{type:"ARRAY",items:{type:"OBJECT",properties:{original:{type:"STRING"},improved:{type:"STRING"},why:{type:"STRING"}},required:["original","improved","why"]}},generalTips:{type:"STRING"}},required:["score","matchingKeywords","missingKeywords","bulletPoints","generalTips"]},temperature:r}},u=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(g)});if(!u.ok){const E=await u.json();throw new Error(((v=E.error)==null?void 0:v.message)||"Fehler bei der Gemini-API-Anfrage.")}const y=(S=(w=(h=(m=(d=(await u.json()).candidates)==null?void 0:d[0])==null?void 0:m.content)==null?void 0:h.parts)==null?void 0:w[0])==null?void 0:S.text;if(!y)throw new Error("Keine Antwort erhalten.");return JSON.parse(y)},generateEmail(s,e,n,i){return s.geminiApiKey&&s.geminiApiKey.trim()?this.generateRealEmail(s.geminiApiKey,s,e,n,i):new Promise(t=>{setTimeout(()=>{e.contact;const r=s.name||"Alex Neumann",a=e.title,o=e.company;let l="";if(n==="status")i==="formal"?l=`Sehr geehrte(r) Frau/Herr ${e.contact||"Ansprechpartner"},

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
${r}`;else if(n==="thankyou")i==="formal"?l=`Sehr geehrte(r) Frau/Herr ${e.contact||"Ansprechpartner"},

ich möchte mich herzlich für das informative und angenehme Gespräch am gestrigen Tag bedanken. 

Die detaillierten Einblicke in die Aufgaben der Position als **${a}** und die zukünftigen Projekte von **${o}** haben meinen Wunsch, Teil Ihres Teams zu werden, nochmals bestärkt. Besonders unsere Diskussion über Ihre technologische Ausrichtung fand ich sehr spannend.

Ich freue mich darauf, wieder von Ihnen zu hören und verbleibe

mit freundlichen Grüßen,
${r}`:l=`Hallo ${e.contact?e.contact.split(" ")[0]:"zusammen"},

vielen Dank für das tolle und lockere Gespräch gestern! 

Es hat mir super viel Spaß gemacht, mehr über die Rolle als **${a}** und eure Pläne bei **${o}** zu erfahren. Der Austausch hat mich auf jeden Fall noch motivierter gemacht, bei euch einzusteigen und loszulegen.

Ich freue mich auf euer Feedback!

Viele Grüße,
${r}`;else if(n==="negotiate"){const p=e.salary?`${e.salary.toLocaleString("de-DE")} €`:"das besprochene Gehalt";i==="formal"?l=`Sehr geehrte(r) Frau/Herr ${e.contact||"Ansprechpartner"},

ich bedanke mich herzlich für das attraktive Angebot und Ihr Vertrauen in meine Fähigkeiten. Ich freue mich sehr über die Möglichkeit, als **${a}** bei **${o}** zu starten.

Nach Durchsicht des Vertragsentwurfs hätte ich noch ein Anliegen bezüglich der Rahmenbedingungen. Angesichts meiner Qualifikationen und der besprochenen Anforderungen würde ich gerne fragen, ob beim Gehalt ein Spielraum in Richtung 8-10% über den angebotenen ${p} besteht oder ob wir dies durch zusätzliche Benefits (wie z. B. Übernahme des Jobtickets oder Weiterbildungsbudgets) ausgleichen können.

Ich bin überzeugt, dass wir hier eine für beide Seiten hervorragende Lösung finden können und freue mich auf Ihre Rückmeldung.

Mit freundlichen Grüßen,
${r}`:l=`Hallo ${e.contact?e.contact.split(" ")[0]:"Team"},

vielen Dank für das Vertragsangebot! Ich freue mich riesig über eure Zusage und darauf, bald als **${a}** bei **${o}** durchzustarten.

Ich habe mir den Entwurf durchgeschaut und würde gerne noch einen Punkt ansprechen: Passt das Gehalt noch etwas ins Budget? Da wir über recht viel Verantwortung gesprochen haben, fände ich ein Grundgehalt, das etwa 5-10% über den vorgeschlagenen ${p} liegt, passender. Alternativ können wir auch gerne über zusätzliche Benefits wie extra Urlaubstage oder Fortbildungsbudgets sprechen.

Was meint ihr dazu? Ich bin sicher, wir finden da einen guten gemeinsamen Nenner.

Viele Grüße,
${r}`}else n==="decline"?i==="formal"?l=`Sehr geehrte(r) Frau/Herr ${e.contact||"Ansprechpartner"},

vielen Dank für das mir entgegengebrachte Vertrauen und das Vertragsangebot für die Stelle als **${a}**.

Nach reiflicher Überlegung habe ich mich jedoch dazu entschieden, ein anderes Angebot anzunehmen, das noch etwas besser zu meiner aktuellen Spezialisierung passt. Diese Entscheidung ist mir nicht leichtgefallen, da ich einen sehr positiven Eindruck von **${o}** gewonnen habe.

Ich bedanke mich herzlich für die angenehmen Gespräche und wünsche Ihnen und Ihrem Team weiterhin viel Erfolg bei der Suche.

Mit freundlichen Grüßen,
${r}`:l=`Hallo ${e.contact?e.contact.split(" ")[0]:"Team"},

vielen Dank für das Angebot und das Vertrauen in mich! 

Ich habe mir alles gründlich durch den Kopf gehen lassen, mich aber letztendlich für ein anderes Angebot entschieden, das thematisch noch einen Tick besser zu meinen aktuellen Plänen passt. Die Entscheidung war echt schwer, weil ich euer Team und die Atmosphäre bei **${o}** super sympathisch fand.

Vielen Dank noch mal für die coolen Gespräche und viel Erfolg weiterhin für euch!

Viele Grüße,
${r}`:n==="withdraw"&&(i==="formal"?l=`Sehr geehrte(r) Frau/Herr ${e.contact||"Ansprechpartner"},

hiermit möchte ich meine Bewerbung für die Position als **${a}** bei **${o}** zurückziehen.

Da ich mich beruflich anderweitig vertraglich gebunden habe, stehe ich für das weitere Auswahlverfahren leider nicht mehr zur Verfügung. Ich bedanke mich herzlich für die Prüfung meiner Unterlagen und den freundlichen Kontakt.

Für die Zukunft wünsche ich Ihrem Unternehmen alles Gute und viel Erfolg.

Mit freundlichen Grüßen,
${r}`:l=`Hallo ${e.contact?e.contact.split(" ")[0]:"Team"},

ich wollte euch kurz Bescheid geben, dass ich meine Bewerbung für die Stelle als **${a}** leider zurückziehen muss.

Ich habe ein anderes Angebot unterschrieben und bin daher nicht mehr auf der Suche. Vielen Dank für eure Zeit, das Anschauen meiner Unterlagen und den netten Austausch!

Wünsche euch alles Gute und weiterhin viel Erfolg!

Viele Grüße,
${r}`);t(l)},1e3)})},async generateRealEmail(s,e,n,i,t){var d,m,h,w,S,E;const r=e.geminiModel||"gemini-1.5-flash",a=e.geminiTemperature!==void 0?e.geminiTemperature:.7,o=e.geminiCustomInstructions||"",l=`https://generativelanguage.googleapis.com/v1beta/models/${r}:generateContent?key=${s}`;let p="Du bist ein professioneller Bewerbungscoach und Entwurfs-Schreiber. Du verfasst fehlerfreie, moderne und überzeugende E-Mails für den Bewerbungsprozess auf Deutsch.";o&&(p+=`
Beachte zusätzlich folgende Schreibstil-Anweisungen des Benutzers: ${o}`);const u={contents:[{parts:[{text:`Verfasse eine E-Mail auf Deutsch mit folgendem Zweck: ${i==="status"?"eine freundliche Nachfrage nach dem Bewerbungsstand":i==="thankyou"?"eine herzliche Danksagung nach dem Bewerbungsgespräch":i==="negotiate"?"eine professionelle Nachverhandlung des Gehalts bzw. von Arbeitsbedingungen":i==="decline"?"eine höfliche und wertschätzende Absage an das Unternehmen":"das Zurückziehen der Bewerbung aufgrund einer anderen Vertragsunterzeichnung"}.
Stellentitel: ${n.title}
Unternehmen: ${n.company}
Ansprechpartner: ${n.contact||"Personalabteilung"}

Bewerber-Details:
Name: ${e.name||"Bewerber"}
Skills: ${e.skills.join(", ")}

Tonalität: Die E-Mail soll ${t==="casual"?'locker und kollegial per "Du"':'formell und höflich per "Sie"'} verfasst werden.
Das Gehalt in der Anzeige ist mit ${n.salary?n.salary+" €/Jahr":"unbekannt"} angegeben (nur verwenden, falls relevant für Verhandlungen).

Gib ausschließlich den Text der E-Mail ohne Betreffzeile, Markdowns oder sonstige Erklärungen zurück.`}]}],systemInstruction:{parts:[{text:p}]},generationConfig:{temperature:a}},c=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(u)});if(!c.ok){const L=await c.json();throw new Error(((d=L.error)==null?void 0:d.message)||"Fehler bei der Gemini-API-Anfrage.")}const v=(E=(S=(w=(h=(m=(await c.json()).candidates)==null?void 0:m[0])==null?void 0:h.content)==null?void 0:w.parts)==null?void 0:S[0])==null?void 0:E.text;if(!v)throw new Error("Keine Antwort erhalten.");return v},async parseCVText(s,e){if(!e||!e.trim())throw new Error("Lebenslauf-Text ist leer.");return s&&s.trim()?this.parseRealCVText(s,e):new Promise(n=>{setTimeout(()=>{const i=e.split(`
`).map(p=>p.trim()).filter(p=>p.length>0);let t="Alex Neumann",r="Software Entwickler";i.length>0&&(t=i[0]),i.length>1&&(r=i[1]);const o=this.extractKeywords(e).map(p=>p.charAt(0).toUpperCase()+p.slice(1)),l=i.slice(2,8).map(p=>"- "+p).join(`
`);n({name:t,title:r,skills:o,experience:l})},1e3)})},async parseRealCVText(s,e){var u,c,y,v,d,m;const t=`https://generativelanguage.googleapis.com/v1beta/models/${x.getProfile().geminiModel||"gemini-1.5-flash"}:generateContent?key=${s}`,l={contents:[{parts:[{text:`Analysiere den folgenden Lebenslauf-Text und extrahiere die Kerndaten des Bewerbers:
---
${e}
---

Gib das Ergebnis als valides JSON-Objekt zurück mit genau diesen Feldern:
- name: Der vollständige Name der Person
- title: Die aktuelle Berufsbezeichnung / der Hauptfokus (z. B. "Frontend Entwickler" oder "UI/UX Designer")
- skills: Ein flaches Array von Strings mit den wichtigsten fachlichen Skills und Technologien (z. B. ["React", "JavaScript", "Figma", "CSS"])
- experience: Eine stichpunktartige Zusammenfassung der Berufserfahrung / des Werdegangs (als Liste mit Bindestrichen, max. 1000 Zeichen)

Gib ausschließlich das JSON-Objekt zurück.`}]}],systemInstruction:{parts:[{text:"Du bist ein intelligenter Lebenslauf-Extraktor. Analysiere den bereitgestellten Text eines Lebenslaufs und extrahiere strukturierte Profildaten auf Deutsch."}]},generationConfig:{responseMimeType:"application/json",responseSchema:{type:"OBJECT",properties:{name:{type:"STRING"},title:{type:"STRING"},skills:{type:"ARRAY",items:{type:"STRING"}},experience:{type:"STRING"}},required:["name","title","skills","experience"]},temperature:.1}},p=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(l)});if(!p.ok){const h=await p.json();throw new Error(((u=h.error)==null?void 0:u.message)||"Fehler bei der Gemini-API-Anfrage.")}const g=(m=(d=(v=(y=(c=(await p.json()).candidates)==null?void 0:c[0])==null?void 0:y.content)==null?void 0:v.parts)==null?void 0:d[0])==null?void 0:m.text;if(!g)throw new Error("Keine Antwort erhalten.");return JSON.parse(g)},async negotiateSalary(s,e,n,i,t,r,a,o){return s&&s.trim()?this.negotiateRealSalary(s,e,n,i,t,r,a,o):new Promise(l=>{setTimeout(()=>{const p=Math.floor(a.length/2)+1;let b="",g=!1,u=null,c=null,y=null;if(p===1){const v=Math.round(t*.9);b=`Hallo! Schön, dass wir über die Konditionen sprechen. Für die Position als ${e} bei ${n} haben wir ein Budget geplant. Ihre Vorstellung liegt etwas über unserem Rahmen. Wir könnten Ihnen zum Einstieg ein Grundgehalt von ${v.toLocaleString("de-DE")} € anbieten. Was sagen Sie dazu?`}else p===2?b=`Ich verstehe Ihre Argumente bezüglich Ihrer Erfahrung. Allerdings müssen wir auch die interne Gehaltsstruktur berücksichtigen. Ich habe mit der Fachabteilung Rücksprache gehalten: Wir könnten uns auf ${Math.round(t*.97).toLocaleString("de-DE")} € sowie zusätzliche Benefits (z. B. ÖPNV-Ticket oder Weiterbildungsbudget) einigen. Liegt das in Ihrem Bereich?`:(g=!0,u=Math.round((parseFloat(i)+parseFloat(t))/2),c=80,y="Gute Argumentation über persönliche Qualifikationen. Etwas mehr Flexibilität bei Zusatzleistungen hätte die Verhandlung beschleunigen können.",b=`Das ist unser absolutes Limit: Wir bieten Ihnen ${u.toLocaleString("de-DE")} € als fixes Jahresbruttogehalt. Mehr lässt unser Budgetrahmen für diese Position leider nicht zu. Wir würden uns sehr freuen, Sie an Bord zu haben!`);l({text:b,endNegotiation:g,finalSalary:u,rating:c,feedback:y})},1e3)})},async negotiateRealSalary(s,e,n,i,t,r,a,o){var d,m,h,w,S,E;const l=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${s}`,p=a.map(L=>`${L.sender==="user"?"Kandidat":"Recruiter"}: "${L.text}"`).join(`
`),b=Math.floor(a.length/2)+1,u={contents:[{parts:[{text:`Du bist ein professioneller Personalvermittler (Recruiter) und verhandelst das Gehalt für die Stelle als "${e}" bei der Firma "${n}".
Der Wunschgehalt des Kandidaten ist ${i} € und die absolute Schmerzgrenze des Kandidaten ist ${t} €.
Deine Verhandlungspersönlichkeit ist "${r==="tough"?"Hart aber fair (Hinterfragt Argumente stark, fordert Belege)":r==="friendly"?"Freundlich & kompromissbereit (Gibt schneller nach, bietet Zusatzleistungen an)":"Strikte Budgetgrenze (Sehr preisbewusst, betont Budgetlimits)"}".

Aktuelle Verhandlungsrunde: ${b} von 3.
Bisheriger Verlauf:
${p}

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
Entscheide dich für ein faires Gehaltsangebot (eine Zahl zwischen ${t} und ${i}) basierend auf der Argumentationsstärke des Kandidaten.
Setze in diesem Fall:
- "endNegotiation": true
- "finalSalary": das vereinbarte Jahresbruttogehalt als Zahl (z. B. 62500)
- "rating": Bewertung der Verhandlungsgeschicklichkeit des Kandidaten von 0 bis 100
- "feedback": 2-3 Sätze konstruktives Feedback dazu, wie geschickt der Kandidat verhandelt hat.`}]}],generationConfig:{responseMimeType:"application/json"}},c=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(u)});if(!c.ok){const L=await c.json();throw new Error(((d=L.error)==null?void 0:d.message)||"Fehler bei der Gemini-API-Anfrage.")}const v=(E=(S=(w=(h=(m=(await c.json()).candidates)==null?void 0:m[0])==null?void 0:h.content)==null?void 0:w.parts)==null?void 0:S[0])==null?void 0:E.text;if(!v)throw new Error("Keine Antwort erhalten.");return JSON.parse(v)}},xe="jobmatch_db",ke=1,D="documents";function _(){return new Promise((s,e)=>{const n=indexedDB.open(xe,ke);n.onupgradeneeded=i=>{const t=i.target.result;t.objectStoreNames.contains(D)||t.createObjectStore(D,{keyPath:"fileId"})},n.onsuccess=i=>s(i.target.result),n.onerror=i=>e(i.target.error)})}const Z={async saveFile(s,e,n,i){const t=await _();return new Promise((r,a)=>{const p=t.transaction(D,"readwrite").objectStore(D).put({fileId:s,jobId:e,filename:n,fileBlob:i});p.onsuccess=()=>r(),p.onerror=()=>a(p.error)})},async getFile(s){const e=await _();return new Promise((n,i)=>{const a=e.transaction(D,"readonly").objectStore(D).get(s);a.onsuccess=()=>n(a.result),a.onerror=()=>i(a.error)})},async deleteFile(s){const e=await _();return new Promise((n,i)=>{const a=e.transaction(D,"readwrite").objectStore(D).delete(s);a.onsuccess=()=>n(),a.onerror=()=>i(a.error)})}};function Q(s,e={}){if(!s||s<=0)return{netYearly:0,netMonthly:0,socialSecurityMonthly:0,taxMonthly:0};const n=parseInt(e.taxClass||"1",10),i=parseInt(e.churchTax||"0",10)/100,t=!!e.hasChildren,r=s/12,a=5175,o=7450,l={health:.081,care:t?.017:.022,pension:.046,unemp:.013},p=Math.min(r,a),b=Math.min(r,o),g=p*(l.health+l.care)+b*(l.pension+l.unemp),u=1266,c=g*12*.96,y=Math.max(0,s-c-u);let v=11784;n===2?v=16044:n===3?v=23568:(n===5||n===6)&&(v=0);let d=0;const m=v/11784;if(m===0)d=y*(n===6?.35:.28);else{const L=11784*m,P=17e3*m,V=66e3*m;if(y<=L)d=0;else if(y<=P){const M=(y-L)/(1e4*m);d=(922.3*M+1400)*M*m}else if(y<=V){const M=(y-P)/(1e4*m);d=((181.76*M+2400)*M+820)*m}else y<=277825?d=.42*y-10600*m:d=.45*y-18900*m}let h=0;d>18130&&(h=d*.055);const w=d*i,S=g*12+d+h+w,E=Math.max(0,s-S);return{netYearly:Math.round(E),netMonthly:Math.round(E/12),socialSecurityMonthly:Math.round(g),taxMonthly:Math.round((d+h+w)/12)}}const Se={chartInstance:null,salaryChartInstance:null,activityTrendChartInstance:null,render(s){const e=document.getElementById(s),n=x.getJobs(),i=x.getProfile(),t=x.getWeights();if(n.length===0){this.renderEmptyState(e);return}const r=n.length;n.filter(f=>f.status==="saved").length;const a=n.filter(f=>f.status==="applied"||f.status==="interviewing"||f.status==="offer").length,o=n.filter(f=>f.status==="interviewing").length,l=n.filter(f=>f.status==="offer").length;let p=0;n.forEach(f=>{f.expenses&&Array.isArray(f.expenses)&&f.expenses.forEach(k=>{p+=parseFloat(k.amount)||0})});const b=p.toLocaleString("de-DE",{style:"currency",currency:"EUR"}),g=r,u=n.filter(f=>["applied","interviewing","offer"].includes(f.status)).length,c=n.filter(f=>["interviewing","offer"].includes(f.status)).length,y=n.filter(f=>["offer"].includes(f.status)).length,v=Math.round(u/(g||1)*100),d=Math.round(c/(g||1)*100),m=Math.round(y/(g||1)*100),h=u>0?Math.round(c/u*100):0,w=c>0?Math.round(y/c*100):0;let S=0,E=0,L=0,P=0;n.forEach(f=>{const k=f.history||[],I=k.find(B=>B.status==="saved"),A=k.find(B=>B.status==="applied"),T=k.find(B=>B.status==="interviewing");if(I&&A){const B=Math.abs(new Date(A.timestamp)-new Date(I.timestamp));S+=Math.ceil(B/(1e3*60*60*24)),E++}if(A&&T){const B=Math.abs(new Date(T.timestamp)-new Date(A.timestamp));L+=Math.ceil(B/(1e3*60*60*24)),P++}});const V=E>0?Math.round(S/E):0,M=P>0?Math.round(L/P):0,Y=[...n.map(f=>{const k=$.analyzeMatch(i.skills,f.description),I=f.ratings||{salary:5,commute:5,remote:5,culture:5,tech:5},A=t.salary+t.commute+t.remote+t.culture+t.tech,T=I.salary*t.salary+I.commute*t.commute+I.remote*t.remote+I.culture*t.culture+I.tech*t.tech,B=Math.round(T/(A*10)*100);return{...f,compareScore:B,skillScore:k.matchScore}})].sort((f,k)=>k.compareScore-f.compareScore).slice(0,3),X=n.filter(f=>f.deadline&&f.status!=="rejected"&&f.status!=="offer").map(f=>{const k=new Date(f.deadline);return{id:f.id,title:f.title,company:f.company,deadline:f.deadline,day:k.getDate(),month:k.toLocaleString("de-DE",{month:"short"}),rawDate:k}}).sort((f,k)=>f.rawDate-k.rawDate).slice(0,4),G=new Date,ee=new Date(G);ee.setHours(23,59,59,999);const te=G.getDay(),ue=te===0?6:te-1,j=new Date(G);j.setHours(0,0,0,0),j.setDate(G.getDate()-(12*7+ue));const H={};n.forEach(f=>{if(f.createdAt){const I=new Date(f.createdAt).toISOString().slice(0,10);H[I]=(H[I]||0)+1}f.history&&Array.isArray(f.history)&&f.history.forEach(k=>{if(k.timestamp){const A=new Date(k.timestamp).toISOString().slice(0,10);H[A]=(H[A]||0)+1}})});let ne="";const K=new Date(j),ie=Array(13).fill("");let re="";const N=new Date(j);for(let f=0;f<13;f++){const k=N.toLocaleString("de-DE",{month:"short"});k!==re&&(ie[f]=k,re=k),N.setDate(N.getDate()+7)}for(;K<=ee;){const f=K.toISOString().slice(0,10),k=H[f]||0;let I=0;k===1?I=1:k===2?I=2:k===3?I=3:k>=4&&(I=4);const A=K.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"}),T=`${k} ${k===1?"Aktivität":"Aktivitäten"} am ${A}`;ne+=`
                <div class="heatmap-cell level-${I}" 
                     data-date="${f}" 
                     data-count="${k}"
                     title="${T}"
                     style="width: 12px; height: 12px; border-radius: 2px; transition: background-color var(--transition-fast);">
                </div>
            `,K.setDate(K.getDate()+1)}const C=i.weeklyGoal||3,J=new Date;J.setDate(J.getDate()-7);let R=0;n.forEach(f=>{let k=null;if(f.history&&Array.isArray(f.history)){const I=f.history.filter(A=>A.status==="applied");I.length>0&&(k=new Date(I[I.length-1].timestamp))}!k&&f.status==="applied"&&f.createdAt&&(k=new Date(f.createdAt)),k&&k>=J&&R++});const pe=Math.min(Math.round(R/C*100),100),me=R>=C,q=36,O=2*Math.PI*q,ge=O-pe/100*O;e.innerHTML=`
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
                             <span class="stat-val">${b}</span>
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
                                    <span>${g} Jobs</span>
                                </div>
                                <div style="background: rgba(255, 255, 255, 0.05); height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: var(--text-secondary); width: 100%; height: 100%; border-radius: 4px;"></div>
                                </div>
                            </div>
                            
                            <!-- Funnel Step 2: Applied -->
                            <div class="funnel-step">
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; font-weight: 600;">
                                    <span>2. Beworben</span>
                                    <span>${u} (${v}%)</span>
                                </div>
                                <div style="background: rgba(255, 255, 255, 0.05); height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: var(--primary); width: ${v}%; height: 100%; border-radius: 4px;"></div>
                                </div>
                            </div>

                            <!-- Funnel Step 3: Interview -->
                            <div class="funnel-step">
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; font-weight: 600;">
                                    <span>3. Vorstellungsgespräch</span>
                                    <span>${c} (${d}%)</span>
                                </div>
                                <div style="background: rgba(255, 255, 255, 0.05); height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: var(--secondary); width: ${d}%; height: 100%; border-radius: 4px;"></div>
                                </div>
                            </div>

                            <!-- Funnel Step 4: Offer -->
                            <div class="funnel-step">
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px; font-weight: 600;">
                                    <span>4. Zusage / Angebot</span>
                                    <span>${y} (${m}%)</span>
                                </div>
                                <div style="background: rgba(255, 255, 255, 0.05); height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: var(--success); width: ${m}%; height: 100%; border-radius: 4px;"></div>
                                </div>
                            </div>

                            <!-- Conversion Rates badges -->
                            <div class="funnel-conversion-badges" style="display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap;">
                                <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); padding: 8px 10px; border-radius: 6px; flex: 1; min-width: 110px; text-align: center;">
                                    <span style="display: block; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">Bewerbung &rarr; Gespräch</span>
                                    <strong style="font-size: 1rem; color: var(--primary); font-family: 'Outfit';">${h}%</strong>
                                </div>
                                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); padding: 8px 10px; border-radius: 6px; flex: 1; min-width: 110px; text-align: center;">
                                    <span style="display: block; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">Gespräch &rarr; Angebot</span>
                                    <strong style="font-size: 1rem; color: var(--success); font-family: 'Outfit';">${w}%</strong>
                                </div>
                                <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); padding: 8px 10px; border-radius: 6px; flex: 1; min-width: 110px; text-align: center;" title="Durchschnittliche Dauer von Speichern bis Bewerben">
                                    <span style="display: block; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">Ø Tage bis Bewerbung</span>
                                    <strong style="font-size: 1.05rem; color: var(--warning); font-family: 'Outfit';">${V} Tage</strong>
                                </div>
                                <div style="background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.2); padding: 8px 10px; border-radius: 6px; flex: 1; min-width: 110px; text-align: center;" title="Durchschnittliche Dauer von Bewerben bis Einladung">
                                    <span style="display: block; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">Ø Tage bis Gespräch</span>
                                    <strong style="font-size: 1.05rem; color: var(--secondary); font-family: 'Outfit';">${M} Tage</strong>
                                </div>
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
                                ${ie.map(f=>`<div style="text-align: left; overflow: visible; white-space: nowrap;">${f}</div>`).join("")}
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
                                    ${ne}
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
                                    <circle cx="45" cy="45" r="${q}" stroke="rgba(255,255,255,0.05)" stroke-width="8" fill="transparent"></circle>
                                    <circle cx="45" cy="45" r="${q}" stroke="var(--primary)" stroke-width="8" fill="transparent"
                                            stroke-dasharray="${O}"
                                            stroke-dashoffset="${ge}"
                                            stroke-linecap="round"
                                            style="transition: stroke-dashoffset 0.5s ease-in-out; filter: drop-shadow(0 0 4px var(--primary));"></circle>
                                </svg>
                                <div style="position: absolute; display: flex; flex-direction: column; align-items: center;">
                                    <span style="font-family: 'Outfit'; font-size: 1.4rem; font-weight: 800; color: #fff; line-height: 1;">${R}</span>
                                    <span style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">von ${C}</span>
                                </div>
                            </div>
                            
                            <!-- Goal controls -->
                            <div style="display: flex; flex-direction: column; gap: 10px; align-items: center;">
                                <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 700; text-align: center;">Wochenziel anpassen</span>
                                <div style="display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 4px 8px;">
                                    <button class="btn btn-secondary" id="btn-goal-dec" style="padding: 4px 8px; width: 24px; height: 24px; min-width: 24px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; border-radius: 4px; line-height: 1;">-</button>
                                    <strong style="font-size: 1.1rem; color: #fff; min-width: 20px; text-align: center;" id="lbl-weekly-goal">${C}</strong>
                                    <button class="btn btn-secondary" id="btn-goal-inc" style="padding: 4px 8px; width: 24px; height: 24px; min-width: 24px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; border-radius: 4px; line-height: 1;">+</button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Celebration notice -->
                        <div style="margin-top: 14px; text-align: center; font-size: 0.82rem; min-height: 24px; font-weight: 500;">
                            ${me?'<span style="color: var(--success); display: flex; align-items: center; justify-content: center; gap: 6px;"><i data-lucide="award" style="width: 16px; height: 16px;"></i> Wochenziel erreicht! 🎉 Super Arbeit!</span>':`<span style="color: var(--text-secondary);">Noch ${C-R} Bewerbung${C-R>1?"en":""} bis zum Ziel!</span>`}
                        </div>
                    </div>
                </div>

                <!-- Split Sections -->
                <div class="dashboard-split">
                    <!-- Left: Upcoming Deadlines -->
                    <div class="glass-card split-card">
                        <h3><i data-lucide="clock"></i> Anstehende Bewerbungsfristen</h3>
                        <div class="event-list">
                            ${X.length>0?X.map(f=>`
                                <div class="event-item cursor-pointer" data-id="${f.id}" style="position: relative; padding-right: 50px;">
                                    <div class="event-badge">
                                        <span class="day">${f.day}</span>
                                        <span class="month">${f.month}</span>
                                    </div>
                                    <div class="event-details">
                                        <span class="event-title">${f.title}</span>
                                        <span class="event-company">${f.company}</span>
                                        <span class="event-time">
                                            <i data-lucide="calendar"></i> Frist: ${new Date(f.deadline).toLocaleDateString("de-DE")}
                                        </span>
                                    </div>
                                    <div style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); display: flex; gap: 6px; z-index: 5;">
                                        <button class="btn btn-secondary btn-export-ics" data-id="${f.id}" title="Als Kalenderdatei (.ics) exportieren" style="padding: 6px; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                                            <i data-lucide="calendar-plus" style="width: 14px; height: 14px; color: var(--primary);"></i>
                                        </button>
                                        <button class="btn btn-secondary btn-google-cal" data-id="${f.id}" title="In Google Kalender eintragen" style="padding: 6px; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
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
                            ${Y.length>0?Y.map(f=>`
                                <div class="reco-item cursor-pointer" data-id="${f.id}">
                                    <div class="reco-details">
                                        <span class="reco-title">${f.title}</span>
                                        <span class="reco-company">${f.company}</span>
                                        <div class="reco-meta">
                                            <span class="reco-tag">${f.workMode}</span>
                                            ${f.salary?`<span class="reco-tag">${f.salary.toLocaleString("de-DE")} €</span>`:""}
                                        </div>
                                    </div>
                                    <div class="reco-score">
                                        <span class="score-badge">${f.compareScore}% Match</span>
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
        `,lucide.createIcons(),this.renderCharts(n,i),e.querySelectorAll(".event-item, .reco-item").forEach(f=>{f.addEventListener("click",()=>{const k=f.getAttribute("data-id");window.app.editJob(k)})}),e.querySelectorAll(".btn-export-ics").forEach(f=>{f.addEventListener("click",k=>{k.stopPropagation();const I=f.getAttribute("data-id"),A=n.find(T=>T.id===I);A&&F(()=>import("./ics-B67aMBsu.js"),[]).then(T=>{T.downloadCalendarEvent(A.title,A.company,A.deadline,A.description||""),window.app.showToast("Kalenderdatei (.ics) heruntergeladen!","success")}).catch(T=>{console.error("Failed to load ICS utility",T),window.app.showToast("Fehler beim Generieren des Kalendereintrags.","danger")})})}),e.querySelectorAll(".btn-google-cal").forEach(f=>{f.addEventListener("click",k=>{k.stopPropagation();const I=f.getAttribute("data-id"),A=n.find(T=>T.id===I);if(A){const T=`Bewerbungsfrist: ${A.title} bei ${A.company}`,B=`Link zur Anzeige: ${A.url||""}
Notizen: ${A.notes||""}`,oe=A.deadline.replace(/-/g,""),he=`${oe}/${oe}`,ye=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(T)}&dates=${he}&details=${encodeURIComponent(B)}`;window.open(ye,"_blank"),window.app.showToast("Google Kalender geöffnet!","success")}})});const W=e.querySelector("#dash-tax-class"),U=e.querySelector("#dash-church-tax");if(W&&U){const f=()=>{const k=x.getProfile();k.taxClass=W.value,k.churchTax=U.value,x.saveProfile(k),this.renderSalaryChart(n,k),window.app.showToast("Steuereinstellungen aktualisiert!","success")};W.addEventListener("change",f),U.addEventListener("change",f)}const se=e.querySelector("#btn-goal-dec"),ae=e.querySelector("#btn-goal-inc");se&&ae&&(se.addEventListener("click",()=>{const f=x.getProfile();let k=f.weeklyGoal||3;k>1&&(k--,f.weeklyGoal=k,x.saveProfile(f),this.render(s),window.app.showToast("Wochenziel aktualisiert!","success"))}),ae.addEventListener("click",()=>{const f=x.getProfile();let k=f.weeklyGoal||3;k<20&&(k++,f.weeklyGoal=k,x.saveProfile(f),this.render(s),window.app.showToast("Wochenziel aktualisiert!","success"))}))},renderEmptyState(s){s.innerHTML=`
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
        `,lucide.createIcons(),document.getElementById("btn-dashboard-add").addEventListener("click",()=>{window.app.openJobModal()})},renderCharts(s,e){this.renderStatusChart(s),this.renderSalaryChart(s,e),this.renderActivityTrendChart(s)},renderStatusChart(s){const e=document.getElementById("statusChart");if(!e)return;const n={saved:{label:"Gespeichert",count:0,color:"rgba(107, 114, 128, 0.75)",border:"#6b7280"},prepared:{label:"Unterlagen bereit",count:0,color:"rgba(245, 158, 11, 0.75)",border:"#f59e0b"},applied:{label:"Beworben",count:0,color:"rgba(99, 102, 241, 0.75)",border:"#6366f1"},interviewing:{label:"Gespräch",count:0,color:"rgba(139, 92, 246, 0.75)",border:"#8b5cf6"},offer:{label:"Zusage / Angebot",count:0,color:"rgba(16, 185, 129, 0.75)",border:"#10b981"},rejected:{label:"Absage",count:0,color:"rgba(244, 63, 94, 0.75)",border:"#f43f5e"}};s.forEach(t=>{const r=t.status||"saved",a=r==="prepared"?"prepared":r==="applied"?"applied":r==="interviewing"?"interviewing":r==="offer"?"offer":r==="rejected"?"rejected":"saved";n[a]&&n[a].count++});const i=Object.values(n).filter(t=>t.count>0);this.chartInstance&&this.chartInstance.destroy(),this.chartInstance=new Chart(e,{type:"doughnut",data:{labels:i.map(t=>t.label),datasets:[{data:i.map(t=>t.count),backgroundColor:i.map(t=>t.color),borderColor:i.map(t=>t.border),borderWidth:2,hoverOffset:8}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"right",labels:{color:"#e5e7eb",font:{family:"Inter",size:12},padding:20}}},cutout:"65%"}})},renderSalaryChart(s,e){const n=document.getElementById("salaryChart");if(!n)return;const i=s.filter(l=>l.salary&&l.salary>0);if(this.salaryChartInstance&&this.salaryChartInstance.destroy(),i.length===0){n.style.display="none";const l=n.parentElement;let p=l.querySelector(".salary-placeholder");p||(p=document.createElement("div"),p.className="salary-placeholder empty-state",p.style.cssText="padding: 40px; text-align: center; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 12px; justify-content: center; height: 100%;",p.innerHTML='<i data-lucide="euro" style="width: 48px; height: 48px;"></i><p>Keine Gehaltsdaten eingetragen. Trage Gehälter bei deinen Jobs ein, um den Vergleich zu sehen.</p>',l.appendChild(p),lucide.createIcons());return}n.style.display="block";const t=n.parentElement.querySelector(".salary-placeholder");t&&t.remove();const r=i.map(l=>`${l.company} (${l.title.slice(0,15)}...)`),a=i.map(l=>l.salary),o=i.map(l=>Q(l.salary,e).netYearly);this.salaryChartInstance=new Chart(n,{type:"bar",data:{labels:r,datasets:[{label:"Bruttogehalt (€/Jahr)",data:a,backgroundColor:"rgba(99, 102, 241, 0.65)",borderColor:"#6366f1",borderWidth:1.5},{label:"Nettogehalt (€/Jahr, geschätzt)",data:o,backgroundColor:"rgba(16, 185, 129, 0.65)",borderColor:"#10b981",borderWidth:1.5}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{y:{beginAtZero:!0,ticks:{color:"#cbd5e1"},grid:{color:"rgba(255, 255, 255, 0.05)"}},x:{ticks:{color:"#cbd5e1"},grid:{color:"rgba(255, 255, 255, 0.05)"}}},plugins:{legend:{labels:{color:"#e5e7eb",font:{family:"Inter",size:12}}}}}})},renderActivityTrendChart(s){const e=document.getElementById("activityTrendChart");if(!e)return;this.activityTrendChartInstance&&this.activityTrendChartInstance.destroy();const n=[],i=[],t=new Date;for(let r=5;r>=0;r--){const a=new Date(t.getFullYear(),t.getMonth()-r,1),o=a.toLocaleString("de-DE",{month:"short",year:"numeric"});n.push(o);const l=a.getFullYear(),p=a.getMonth(),b=s.filter(g=>{let u=null;if(g.history&&Array.isArray(g.history)){const c=g.history.find(y=>y.status==="applied");c&&(u=new Date(c.timestamp))}return!u&&g.status==="applied"&&g.createdAt&&(u=new Date(g.createdAt)),u?u.getFullYear()===l&&u.getMonth()===p:!1}).length;i.push(b)}this.activityTrendChartInstance=new Chart(e,{type:"line",data:{labels:n,datasets:[{label:"Gesendete Bewerbungen",data:i,borderColor:"#6366f1",backgroundColor:"rgba(99, 102, 241, 0.1)",borderWidth:3,fill:!0,tension:.3,pointBackgroundColor:"#8b5cf6",pointBorderColor:"#fff",pointBorderWidth:2,pointRadius:6,pointHoverRadius:8}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{y:{beginAtZero:!0,ticks:{color:"#cbd5e1",stepSize:1},grid:{color:"rgba(255, 255, 255, 0.05)"}},x:{ticks:{color:"#cbd5e1"},grid:{color:"rgba(255, 255, 255, 0.05)"}}},plugins:{legend:{labels:{color:"#e5e7eb",font:{family:"Inter",size:12}}}}}})}},Ee={filterWorkmode:"all",sortBy:"date-desc",render(s){const e=document.getElementById(s),n=x.getJobs(),i=x.getProfile();let t=[...n];this.filterWorkmode!=="all"&&(t=t.filter(a=>a.workMode===this.filterWorkmode)),t.sort((a,o)=>{if(this.sortBy==="salary-desc")return(o.salary||0)-(a.salary||0);if(this.sortBy==="match-desc"){const l=$.analyzeMatch(i.skills,a.description).matchScore;return $.analyzeMatch(i.skills,o.description).matchScore-l}else return this.sortBy==="deadline-asc"?a.deadline?o.deadline?new Date(a.deadline)-new Date(o.deadline):-1:1:new Date(o.createdAt||0)-new Date(a.createdAt||0)});const r=[{id:"saved",name:"Gespeichert",icon:"folder"},{id:"prepared",name:"Unterlagen bereit",icon:"file-text"},{id:"applied",name:"Beworben",icon:"send"},{id:"interviewing",name:"Gespräch",icon:"calendar"},{id:"offer",name:"Angebot erhalten",icon:"award"},{id:"rejected",name:"Absage",icon:"frown"}];e.innerHTML=`
            <div class="kanban-header">
                <h2>Bewerbungs-Tracker (Kanban)</h2>
                <span class="text-secondary">${t.length} Jobs angezeigt</span>
            </div>
            
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
                ${r.map(a=>{const o=t.filter(l=>l.status===a.id);return`
                        <div class="kanban-column" data-status="${a.id}">
                            <div class="kanban-column-header">
                                <div class="column-title-group">
                                    <i data-lucide="${a.icon}"></i>
                                    <h4>${a.name}</h4>
                                </div>
                                <span class="column-count">${o.length}</span>
                            </div>
                            <div class="kanban-cards-list" data-status="${a.id}">
                                ${o.map(l=>this.createCardHtml(l,i.skills)).join("")}
                            </div>
                        </div>
                    `}).join("")}
            </div>
        `,lucide.createIcons(),this.initDragAndDrop(e),this.bindCardEvents(e),this.bindControlsEvents(e)},createCardHtml(s,e){const n=x.getProfile(),t=$.analyzeMatch(e||n.skills,s.description).matchScore;let r="low";t>=75?r="high":t>=40&&(r="medium");const a=s.deadline;let o=!1,l="Kein Datum";if(a){const c=new Date(s.deadline),y=new Date;y.setHours(0,0,0,0),o=c<y&&s.status!=="rejected"&&s.status!=="offer",l=c.toLocaleDateString("de-DE")}const p=new Date(s.createdAt||Date.now()),b=Math.abs(Date.now()-p.getTime()),g=Math.floor(b/(1e3*3600*24)),u=g===0?"heute":g===1?"gestern":`vor ${g} Tagen`;return`
            <div class="glass-card kanban-card" draggable="true" data-id="${s.id}" tabindex="0" role="button" aria-label="Bewerbung bei ${s.company} als ${s.title}. Match: ${t} Prozent.">
                <div class="card-top">
                    <span class="card-company" title="${s.company}">${s.company}</span>
                    <div class="card-menu">
                        <button class="card-btn-action edit" aria-label="Bewerbung bearbeiten" title="Bearbeiten">
                            <i data-lucide="edit-2" aria-hidden="true"></i>
                        </button>
                        <button class="card-btn-action delete" aria-label="Bewerbung löschen" title="Löschen">
                            <i data-lucide="trash-2" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                <h5 class="card-title" title="${s.title}">${s.title}</h5>
                ${s.tags&&s.tags.length>0?`
                    <div class="card-tags" style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px;">
                        ${s.tags.map(c=>`<span class="keyword-badge match" style="font-size: 0.68rem; padding: 1px 6px; background: rgba(99, 102, 241, 0.12); color: var(--primary); border: 1px solid rgba(99, 102, 241, 0.25);">${c}</span>`).join("")}
                    </div>
                `:""}
                <div class="card-meta-grid">
                    <div class="meta-item">
                        <i data-lucide="map-pin" aria-hidden="true"></i>
                        <span title="${s.location||"K.A."}">${s.location||"K.A."}</span>
                    </div>
                    <div class="meta-item">
                        <i data-lucide="home" aria-hidden="true"></i>
                        <span>${s.workMode||"Hybrid"}</span>
                    </div>
                    ${s.salary?(()=>{const c=Q(s.salary,n);return`
                            <div class="meta-item" style="grid-column: span 2; display: flex; flex-direction: column; align-items: flex-start; gap: 2px;">
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <i data-lucide="euro" aria-hidden="true" style="width: 14px; height: 14px;"></i>
                                    <span style="font-weight: 500;">${s.salary.toLocaleString("de-DE")} € brutto/Jahr</span>
                                </div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-left: 20px;">
                                    ca. ${c.netMonthly.toLocaleString("de-DE")} € netto/Monat (StKl. ${n.taxClass||1})
                                </div>
                            </div>
                        `})():""}
                </div>
                <div class="card-bottom">
                    <div class="card-date ${o?"overdue":""}" title="${o?"Frist überschritten!":"Bewerbungsfrist"}" style="display: flex; align-items: center; gap: 4px;">
                        <i data-lucide="calendar" aria-hidden="true"></i>
                        <span>${l}</span>
                        ${a?`
                        <button class="card-btn-action btn-kanban-google-cal" aria-label="Termin in Google Calendar eintragen" title="In Google Calendar eintragen" style="padding: 0; margin-left: 4px; display: inline-flex; align-items: center; justify-content: center; height: 14px; width: 14px; min-width: 14px; min-height: 14px;">
                            <i data-lucide="calendar-plus" aria-hidden="true" style="width: 12px; height: 12px;"></i>
                        </button>
                        `:""}
                    </div>
                    <span style="font-size: 0.7rem; color: var(--text-muted); font-style: italic; white-space: nowrap; margin-right: auto; margin-left: 8px;" title="Hinzugefügt">${u}</span>
                    <span class="card-score-tag ${r}" title="AI Skill-Match Score">${t}% Match</span>
                </div>
            </div>
        `},initDragAndDrop(s){const e=s.querySelectorAll(".kanban-card"),n=s.querySelectorAll(".kanban-cards-list");e.forEach(i=>{i.addEventListener("dragstart",t=>{i.classList.add("dragging"),t.dataTransfer.setData("text/plain",i.getAttribute("data-id")),t.dataTransfer.effectAllowed="move"}),i.addEventListener("dragend",()=>{i.classList.remove("dragging")})}),n.forEach(i=>{i.addEventListener("dragover",t=>{t.preventDefault(),i.classList.add("drag-over")}),i.addEventListener("dragleave",()=>{i.classList.remove("drag-over")}),i.addEventListener("drop",t=>{t.preventDefault(),i.classList.remove("drag-over");const r=t.dataTransfer.getData("text/plain"),a=i.getAttribute("data-status"),o=x.getJobs(),l=o.findIndex(p=>p.id===r);if(l!==-1&&o[l].status!==a){const p=o[l].history||[];p.push({status:a,timestamp:new Date().toISOString()}),o[l].history=p,o[l].status=a,x.saveJobs(o),window.app.showToast(`Bewerbung zu "${o[l].company}" verschoben!`,"success"),this.render("view-kanban")}})})},bindCardEvents(s){s.querySelectorAll(".kanban-card").forEach(e=>{const n=e.getAttribute("data-id");e.addEventListener("dblclick",t=>{t.target.closest(".card-btn-action")||window.app.editJob(n)}),e.addEventListener("keydown",t=>{(t.key==="Enter"||t.key===" ")&&(t.target.closest(".card-btn-action")||(t.preventDefault(),window.app.editJob(n)))}),e.querySelector(".card-btn-action.edit").addEventListener("click",t=>{t.stopPropagation(),window.app.editJob(n)}),e.querySelector(".card-btn-action.delete").addEventListener("click",t=>{t.stopPropagation(),confirm("Bist du sicher, dass du dieses Jobangebot löschen möchtest?")&&(x.deleteJob(n),window.app.showToast("Job erfolgreich gelöscht","warning"),this.render("view-kanban"))});const i=e.querySelector(".btn-kanban-google-cal");i&&i.addEventListener("click",t=>{t.stopPropagation();const r=x.getJobs().find(a=>a.id===n);if(r&&r.deadline){const a=r.deadline.replace(/-/g,""),o=`Bewerbungsfrist: ${r.title} bei ${r.company}`,l=`Link zur Anzeige: ${r.url||"Keine URL vorhanden"}

Standort: ${r.location||"K.A."}
Gehalt: ${r.salary?r.salary+" €":"K.A."}`,p=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(o)}&dates=${a}/${a}&details=${encodeURIComponent(l)}`;window.open(p,"_blank")}})})},bindControlsEvents(s){const e=s.querySelector("#kanban-filter-workmode"),n=s.querySelector("#kanban-sort-by");e&&e.addEventListener("change",i=>{this.filterWorkmode=i.target.value,this.render("view-kanban")}),n&&n.addEventListener("change",i=>{this.sortBy=i.target.value,this.render("view-kanban")})}},Ie={render(s){const e=document.getElementById(s),n=x.getJobs().filter(t=>t.status!=="rejected"),i=x.getWeights();e.innerHTML=`
            <div class="kanban-header">
                <h2>Job-Vergleicher (Entscheidungsmatrix)</h2>
                <span class="text-secondary">Vergleiche deine Angebote anhand gewichteter Kriterien</span>
            </div>
            
            <div class="comparer-layout">
                <!-- Left: Weights Config Panel -->
                <div class="glass-card weighting-panel">
                    <h3>Kriterien-Gewichtung</h3>
                    <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 12px;">
                        Passe an, wie wichtig dir die einzelnen Faktoren bei der Jobsuche sind (1 = Nebensächlich, 5 = Essentiell).
                    </p>
                    
                    <div class="weight-item">
                        <div class="weight-info">
                            <span class="weight-label">Gehalt & Benefits</span>
                            <span class="weight-multiplier" id="lbl-w-salary">x${i.salary}</span>
                        </div>
                        <input type="range" class="weight-slider" id="slide-w-salary" min="1" max="5" value="${i.salary}">
                    </div>
                    
                    <div class="weight-item">
                        <div class="weight-info">
                            <span class="weight-label">Pendelzeit / Weg</span>
                            <span class="weight-multiplier" id="lbl-w-commute">x${i.commute}</span>
                        </div>
                        <input type="range" class="weight-slider" id="slide-w-commute" min="1" max="5" value="${i.commute}">
                    </div>
                    
                    <div class="weight-item">
                        <div class="weight-info">
                            <span class="weight-label">Homeoffice-Flexibilität</span>
                            <span class="weight-multiplier" id="lbl-w-remote">x${i.remote}</span>
                        </div>
                        <input type="range" class="weight-slider" id="slide-w-remote" min="1" max="5" value="${i.remote}">
                    </div>
                    
                    <div class="weight-item">
                        <div class="weight-info">
                            <span class="weight-label">Unternehmenskultur</span>
                            <span class="weight-multiplier" id="lbl-w-culture">x${i.culture}</span>
                        </div>
                        <input type="range" class="weight-slider" id="slide-w-culture" min="1" max="5" value="${i.culture}">
                    </div>
                    
                    <div class="weight-item">
                        <div class="weight-info">
                            <span class="weight-label">Tech-Stack / Aufgaben</span>
                            <span class="weight-multiplier" id="lbl-w-tech">x${i.tech}</span>
                        </div>
                        <input type="range" class="weight-slider" id="slide-w-tech" min="1" max="5" value="${i.tech}">
                    </div>
                </div>

                <!-- Right: Scored Columns Matrix -->
                <div class="matrix-container" id="matrix-cols-holder">
                    <!-- Columns will be injected dynamically -->
                </div>
            </div>
        `,this.renderColumns(n,i),this.bindSliderEvents(e,n),lucide.createIcons()},renderColumns(s,e){const n=document.getElementById("matrix-cols-holder");if(!n)return;if(s.length===0){n.innerHTML=`
                <div class="glass-card empty-state" style="width: 100%; min-height: 300px;">
                    <i data-lucide="git-compare"></i>
                    <p>Keine aktiven Jobangebote zum Vergleichen vorhanden. Füge zuerst Jobs im Kanban-Board hinzu.</p>
                </div>
            `,lucide.createIcons();return}const i=s.map(t=>{const r=t.ratings||{salary:5,commute:5,remote:5,culture:5,tech:5},a=e.salary+e.commute+e.remote+e.culture+e.tech,o=r.salary*e.salary+r.commute*e.commute+r.remote*e.remote+r.culture*e.culture+r.tech*e.tech,l=Math.round(o/(a*10)*100);return{...t,score:l,ratings:r}});i.sort((t,r)=>r.score-t.score),n.innerHTML=i.map((t,r)=>{const a=r===0&&t.score>0,o=t.ratings,l=p=>p>=8?"high":p>=5?"mid":"low";return`
                <div class="glass-card matrix-column ${a?"best-match":""}">
                    ${a?`
                        <div class="best-match-badge">
                            <i data-lucide="trophy"></i> Best Match
                        </div>
                    `:""}
                    <span class="company-name">${t.company}</span>
                    <h4 class="job-title" title="${t.title}">${t.title}</h4>
                    
                    <div class="matrix-score-circle">
                        <span class="number">${t.score}</span>
                        <span class="percent">% Match</span>
                    </div>

                    <div class="matrix-criteria-list">
                        <div class="matrix-criteria-item">
                            <span class="criteria-name">Gehalt</span>
                            <span class="criteria-score-badge ${l(o.salary)}">${o.salary}/10</span>
                        </div>
                        <div class="matrix-criteria-item">
                            <span class="criteria-name">Pendelweg</span>
                            <span class="criteria-score-badge ${l(o.commute)}">${o.commute}/10</span>
                        </div>
                        <div class="matrix-criteria-item">
                            <span class="criteria-name">Homeoffice</span>
                            <span class="criteria-score-badge ${l(o.remote)}">${o.remote}/10</span>
                        </div>
                        <div class="matrix-criteria-item">
                            <span class="criteria-name">Kultur</span>
                            <span class="criteria-score-badge ${l(o.culture)}">${o.culture}/10</span>
                        </div>
                        <div class="matrix-criteria-item">
                            <span class="criteria-name">Tech Stack</span>
                            <span class="criteria-score-badge ${l(o.tech)}">${o.tech}/10</span>
                        </div>
                    </div>

                    <div class="matrix-meta-list">
                        <div class="matrix-meta-item" style="flex-direction: column; align-items: flex-start; gap: 2px;">
                            <span class="label">Gehalt:</span>
                            <span class="val">${t.salary?`${t.salary.toLocaleString("de-DE")} € Brutto`:"K.A."}</span>
                            ${t.salary?`<span style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 500;">ca. ${Q(t.salary).netMonthly.toLocaleString("de-DE")} € Netto/M.</span>`:""}
                        </div>
                        <div class="matrix-meta-item">
                            <span class="label">Modus:</span>
                            <span class="val">${t.workMode||"Hybrid"}</span>
                        </div>
                        <div class="matrix-meta-item">
                            <span class="label">Ort:</span>
                            <span class="val">${t.location||"K.A."}</span>
                        </div>
                    </div>

                    <div style="display: flex; gap: 8px; width: 100%;">
                        <button class="btn btn-secondary btn-full btn-sm btn-edit-comp" data-id="${t.id}">
                            <i data-lucide="edit-2"></i> Details
                        </button>
                        <button class="btn btn-primary btn-full btn-sm btn-copilot-comp" data-id="${t.id}">
                            <i data-lucide="sparkles"></i> Copilot
                        </button>
                    </div>
                </div>
            `}).join(""),lucide.createIcons(),n.querySelectorAll(".btn-edit-comp").forEach(t=>{t.addEventListener("click",()=>{window.app.editJob(t.getAttribute("data-id"))})}),n.querySelectorAll(".btn-copilot-comp").forEach(t=>{t.addEventListener("click",()=>{const r=t.getAttribute("data-id");window.app.switchToView("copilot",r)})})},bindSliderEvents(s,e){["salary","commute","remote","culture","tech"].forEach(i=>{const t=s.querySelector(`#slide-w-${i}`),r=s.querySelector(`#lbl-w-${i}`);t&&r&&t.addEventListener("input",a=>{const o=parseInt(a.target.value);r.textContent=`x${o}`;const l=x.getWeights();l[i]=o,x.saveWeights(l),this.renderColumns(e,l)})})}},Ae={selectedJobId:null,interviewQuestions:[],currentQuestionIdx:0,interviewScores:[],negotiationHistory:[],negotiationTargetSalary:0,negotiationMinSalary:0,negotiationPersona:"tough",render(s,e=null){const n=document.getElementById(s),i=x.getJobs(),t=x.getProfile();if(i.length===0){n.innerHTML=`
                <div class="glass-card empty-state" style="padding: 60px 40px; min-height: 400px;">
                    <i data-lucide="sparkles"></i>
                    <h2>Bewerbungs-Copilot ist bereit!</h2>
                    <p>Füge zuerst Jobangebote hinzu, um den AI-gestützten Skill-Vergleich und Anschreiben-Generator zu nutzen.</p>
                </div>
            `,lucide.createIcons();return}e?this.selectedJobId=e:(!this.selectedJobId||!i.some(o=>o.id===this.selectedJobId))&&(this.selectedJobId=i[0].id);const r=i.find(o=>o.id===this.selectedJobId)||i[0],a=$.analyzeMatch(t.skills,r.description);n.innerHTML=`
            <div class="kanban-header">
                <h2>Bewerbungs-Copilot (AI)</h2>
                <span class="text-secondary">Analysiere Übereinstimmungen und entwerfe maßgeschneiderte Bewerbungen</span>
            </div>

            <div class="copilot-layout">
                <!-- Left panel: Job list selection & details -->
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

                    <!-- Skills preview -->
                    <div class="glass-card" style="padding: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h4 style="font-size: 0.9rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 700;">Meine Skills</h4>
                            <button class="btn btn-secondary btn-sm" id="copilot-edit-profile-btn" style="padding: 4px 8px; font-size: 0.75rem;">
                                <i data-lucide="edit-3" style="width: 12px; height: 12px;"></i> Bearbeiten
                            </button>
                        </div>
                        <div class="keyword-tags" style="gap: 4px;">
                            ${t.skills.length>0?t.skills.map(o=>`
                                <span class="keyword-badge match" style="font-size: 0.75rem;">${o}</span>
                            `).join(""):`
                                <span class="text-muted" style="font-size: 0.8rem;">Keine Skills eingetragen.</span>
                            `}
                        </div>
                    </div>

                    <!-- Notes & Contact Person Sidebar Card -->
                    <div class="glass-card" style="padding: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h4 style="font-size: 0.9rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 700;">Notizen &amp; Kontakt</h4>
                            <button class="btn btn-secondary btn-sm" id="copilot-edit-notes-btn" style="padding: 4px 8px; font-size: 0.75rem;">
                                <i data-lucide="edit-2" style="width: 12px; height: 12px;"></i> Details
                            </button>
                        </div>
                        <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 12px;">
                            <div>
                                <span class="text-muted" style="display:block; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 2px;">Kontaktperson / Recruiter:</span>
                                <span style="font-weight: 600; color: var(--text-primary);">${r.contact||"Keine Angabe"}</span>
                            </div>
                            <div>
                                <span class="text-muted" style="display:block; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 2px;">Eigene Notizen:</span>
                                <span style="white-space: pre-wrap; color: var(--text-secondary); line-height: 1.4;">${r.notes||"Keine Notizen hinterlegt."}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right panel: Analyzed Details & AI tools -->
                <div class="copilot-main">
                    <!-- Match Overview Row -->
                    <div class="copilot-match-row">
                        <!-- Score circle -->
                        <div class="glass-card match-circle-card">
                            <div class="match-radial">
                                <span class="num">${a.matchScore}</span>
                                <span class="txt">% Match</span>
                            </div>
                            <h4>Skill Übereinstimmung</h4>
                        </div>

                        <!-- Keyword breakdown -->
                        <div class="glass-card match-details-card">
                            <h3>Anforderungs-Abgleich</h3>
                            <div class="keyword-lists">
                                <div class="keyword-col matching">
                                    <h4><i data-lucide="check-circle2"></i> Gefundene Skills (${a.matchingSkills.length})</h4>
                                    <div class="keyword-tags">
                                        ${a.matchingSkills.length>0?a.matchingSkills.map(o=>`
                                            <span class="keyword-badge match">${o}</span>
                                        `).join(""):`
                                            <span class="text-muted" style="font-size: 0.8rem;">Keine Übereinstimmung gefunden.</span>
                                        `}
                                    </div>
                                </div>
                                <div class="keyword-col missing">
                                    <h4><i data-lucide="alert-circle"></i> Fehlende Skills (${a.missingSkills.length})</h4>
                                    <div class="keyword-tags">
                                        ${a.missingSkills.length>0?a.missingSkills.map(o=>`
                                            <span class="keyword-badge miss">${o}</span>
                                        `).join(""):`
                                            <span class="text-muted" style="font-size: 0.8rem;">Perfektes Match! Keine fehlenden Skills gefunden.</span>
                                        `}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- AI Tools Container with Tabs -->
                    <div class="glass-card" style="padding: 28px;">
                        <nav class="tabs-nav">
                            <button class="tab-btn active" data-tab="tab-cover-letter">
                                <i data-lucide="file-text" style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;"></i> Anschreiben-Generator
                            </button>
                            <button class="tab-btn" data-tab="tab-interview-prep">
                                <i data-lucide="help-circle" style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;"></i> Interview-Vorbereitung (Prepper)
                            </button>
                            <button class="tab-btn" data-tab="tab-resume-optimizer">
                                <i data-lucide="file-check" style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;"></i> Lebenslauf-Optimizer
                            </button>
                            <button class="tab-btn" data-tab="tab-email-writer">
                                <i data-lucide="mail" style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;"></i> E-Mail-Assistent
                            </button>
                            <button class="tab-btn" data-tab="tab-salary-negotiation">
                                <i data-lucide="coins" style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;"></i> Gehaltsverhandlung
                            </button>
                        </nav>

                        <!-- Tab 1: Cover Letter Generator -->
                        <div id="tab-cover-letter" class="tab-content active">
                            <div class="ai-card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                                <h3 style="font-size: 1.1rem; margin: 0;"><i data-lucide="sparkles" style="color: var(--primary);"></i> Individuelles Bewerbungsanschreiben</h3>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <select id="cover-letter-tone" style="padding: 6px 12px; border-radius: var(--radius-sm); background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.85rem; font-weight: 500;">
                                        <option value="classic">Klassisch (Formell)</option>
                                        <option value="creative">Kreativ &amp; Modern</option>
                                        <option value="pitch">Kurzer Pitch (3 Gründe)</option>
                                    </select>
                                    <button class="btn btn-primary" id="btn-generate-letter">
                                        <i data-lucide="cpu"></i> Anschreiben generieren
                                    </button>
                                </div>
                            </div>
                            <div class="ai-output-box" id="ai-letter-output" style="margin-top: 14px;">
                                Hier erscheint dein maßgeschneidertes Anschreiben basierend auf deinen Skills und der Jobbeschreibung. Klicke oben auf "Anschreiben generieren", um den AI-Copiloten zu starten.
                            </div>
                        </div>

                        <!-- Tab 2: Interview Prepper -->
                        <div id="tab-interview-prep" class="tab-content">
                            <div class="ai-card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                                <h3 style="font-size: 1.1rem; margin: 0;"><i data-lucide="help-circle" style="color: var(--secondary);"></i> Simulierte Gesprächsfragen &amp; Antworten</h3>
                                <div style="display: flex; gap: 8px;">
                                    <button class="btn btn-secondary" id="btn-generate-cheatsheet" style="border-color: rgba(139, 92, 246, 0.4); color: var(--secondary);">
                                        <i data-lucide="file-text"></i> Spickzettel (1-Pager)
                                    </button>
                                    <button class="btn btn-primary" id="btn-generate-prep" style="background: linear-gradient(135deg, var(--secondary), var(--primary)); box-shadow: 0 4px 15px -3px rgba(139, 92, 246, 0.3);">
                                        <i data-lucide="play" style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;"></i> Simulator starten
                                    </button>
                                </div>
                            </div>
                            <div class="ai-output-box" id="ai-prep-output" style="margin-top: 14px;">
                                Der AI-Simulator analysiert das Stellenprofil und generiert 5 typische Interviewfragen, die speziell auf deine Übereinstimmungen und Skill-Gaps zugeschnitten sind. Du kannst deine Antworten eintippen oder einsprechen und erhältst direkt Feedback. Klicke oben auf "Simulator starten", um zu beginnen.
                            </div>
                        </div>

                        <!-- Tab 3: Resume Optimizer -->
                        <div id="tab-resume-optimizer" class="tab-content">
                            <div class="resume-optimizer-grid">
                                <div class="resume-input-section" style="display: flex; flex-direction: column; gap: 10px;">
                                    <div class="ai-card-header" style="margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                        <h3 style="font-size: 1.1rem; margin: 0;"><i data-lucide="file-check" style="color: var(--primary);"></i> Dein Lebenslauf-Text</h3>
                                        <button class="btn btn-secondary btn-sm" id="btn-save-cv-text" title="Lebenslauf dauerhaft im Profil speichern" style="padding: 4px 8px; font-size: 0.75rem;">
                                            <i data-lucide="save" style="width: 12px; height: 12px;"></i> Speichern
                                        </button>
                                    </div>
                                    <textarea id="resume-cv-text" rows="12" placeholder="Füge hier den reinen Text deines aktuellen Lebenslaufs ein (z. B. Werdegang, Ausbildung, Skills). Der AI-Copilot vergleicht ihn mit der Stellenanzeige." style="background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); padding: 14px; width: 100%; font-size: 0.9rem; line-height: 1.5; resize: vertical; min-height: 200px;">${t.cvText||""}</textarea>
                                    <button class="btn btn-primary btn-full" id="btn-optimize-resume" style="margin-top: 14px; width: 100%;">
                                        <i data-lucide="sparkles"></i> Lebenslauf optimieren
                                    </button>
                                </div>
                                <div class="resume-results-section" id="resume-optimize-results" style="margin-top: 20px;">
                                    <div class="ai-output-box" style="height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; color: var(--text-muted); font-size: 0.9rem; min-height: 150px; padding: 24px;">
                                        Trage links deinen Lebenslauf ein und klicke auf "Lebenslauf optimieren", um den automatischen Abgleich und Formulierungsvorschläge zu erhalten.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tab 4: Email Writer -->
                        <div id="tab-email-writer" class="tab-content">
                            <div class="ai-card-header" style="margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; width: 100%;">
                                <h3 style="font-size: 1.1rem; margin: 0;"><i data-lucide="mail" style="color: var(--primary);"></i> E-Mail-Assistent (AI)</h3>
                                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                                    <select id="email-type" style="padding: 6px 12px; border-radius: var(--radius-sm); background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.85rem; font-weight: 500;">
                                        <option value="status">Status-Nachfrage</option>
                                        <option value="thankyou">Danksagung nach Gespräch</option>
                                        <option value="negotiate">Angebot verhandeln</option>
                                        <option value="decline">Bewerbung absagen</option>
                                        <option value="withdraw">Bewerbung zurückziehen</option>
                                    </select>
                                    <select id="email-tone" style="padding: 6px 12px; border-radius: var(--radius-sm); background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.85rem; font-weight: 500;">
                                        <option value="formal">Formell (Sie)</option>
                                        <option value="casual">Locker (Du)</option>
                                    </select>
                                    <button class="btn btn-primary btn-sm" id="btn-generate-email">
                                        <i data-lucide="cpu"></i> Schreiben
                                    </button>
                                </div>
                            </div>
                            <div class="ai-output-box" id="ai-email-output" style="margin-top: 14px; min-height: 200px;">
                                Wähle oben den Typ und die Tonalität der E-Mail aus und klicke auf "Schreiben", um einen personalisierten Entwurf zu generieren.
                            </div>
                        </div>

                        <!-- Tab 5: Gehaltsverhandlungs-Trainer -->
                        <div id="tab-salary-negotiation" class="tab-content" style="display: none;">
                            <div class="ai-card-header" style="margin-bottom: 16px;">
                                <h3 style="font-size: 1.1rem; margin: 0;"><i data-lucide="coins" style="color: var(--warning);"></i> AI Gehaltsverhandlungs-Coach</h3>
                                <button class="btn btn-primary btn-sm" id="btn-start-neg" style="background: linear-gradient(135deg, var(--warning), var(--primary)); border: none; display: inline-flex; align-items: center; gap: 6px;">
                                    <i data-lucide="play"></i> Simulation starten
                                </button>
                            </div>
                            <div class="ai-output-box" id="ai-neg-output" style="margin-top: 14px; min-height: 200px;">
                                <div class="neg-start-setup" style="display: flex; flex-direction: column; gap: 14px; text-align: left; max-width: 500px; margin: 0 auto; padding: 10px;">
                                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 600;">Simulation konfigurieren</h4>
                                    <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;">Bereite dich auf das Gehaltsgespräch vor. Stelle dein Wunschgehalt und deine Argumente ein, um die Verhandlung mit dem AI-Recruiter zu starten.</p>
                                    <div class="form-group" style="margin-bottom: 0;">
                                        <label for="neg-target-salary" style="font-size: 0.8rem;">Wunschgehalt (€ pro Jahr) *</label>
                                        <input type="number" id="neg-target-salary" placeholder="z. B. 65000" style="padding: 8px 12px; font-size: 0.85rem;" value="${r.salary||""}">
                                    </div>
                                    <div class="form-group" style="margin-bottom: 0;">
                                        <label for="neg-min-salary" style="font-size: 0.8rem;">Schmerzgrenze (€ pro Jahr) *</label>
                                        <input type="number" id="neg-min-salary" placeholder="z. B. 58000" style="padding: 8px 12px; font-size: 0.85rem;">
                                    </div>
                                    <div class="form-group" style="margin-bottom: 0;">
                                        <label for="neg-persona" style="font-size: 0.8rem;">Verhandlungspartner (Recruiter Persona)</label>
                                        <select id="neg-persona" style="padding: 8px 12px; font-size: 0.85rem; background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: var(--radius-sm);">
                                            <option value="tough">Hart aber fair (Hinterfragt viel)</option>
                                            <option value="friendly">Freundlich &amp; kompromissbereit</option>
                                            <option value="budget">Strikte Budgetgrenze (Sehr preisbewusst)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,lucide.createIcons(),this.bindEvents(n,r,t)},bindEvents(s,e,n){s.querySelectorAll(".job-selector-item").forEach(u=>{u.addEventListener("click",()=>{const c=u.getAttribute("data-id");this.selectedJobId=c,this.render("view-copilot")})}),s.querySelector("#copilot-edit-profile-btn").addEventListener("click",()=>{window.app.openProfileModal()}),s.querySelector("#copilot-edit-notes-btn").addEventListener("click",()=>{window.app.editJob(e.id)}),s.querySelectorAll(".tab-btn").forEach(u=>{u.addEventListener("click",()=>{s.querySelectorAll(".tab-btn").forEach(y=>y.classList.remove("active")),s.querySelectorAll(".tab-content").forEach(y=>y.classList.remove("active")),u.classList.add("active");const c=u.getAttribute("data-tab");s.querySelector(`#${c}`).classList.add("active")})});const i=s.querySelector("#btn-generate-letter"),t=s.querySelector("#ai-letter-output");i&&t&&i.addEventListener("click",async()=>{t.innerHTML=`
                    <div class="ai-loader">
                        <div class="ai-loader-spinner"></div>
                        <p>AI-Copilot analysiert die Anforderungen von ${e.company} und formuliert das Anschreiben...</p>
                    </div>
                `,i.disabled=!0;try{const u=s.querySelector("#cover-letter-tone"),c=u?u.value:"classic",y=await $.generateCoverLetter(n,e,c);t.innerHTML=`
                        <div style="position: absolute; top: 16px; right: 16px; z-index: 10; display: flex; gap: 8px; align-items: center;">
                            <select id="pdf-style-preset" style="padding: 6px 10px; font-size: 0.75rem; border-radius: var(--radius-sm); background: rgba(0, 0, 0, 0.4); border: 1px solid var(--border-color); color: var(--text-primary); font-weight: 500; cursor: pointer; outline: none;">
                                <option value="din5008">DIN 5008 (Klassisch)</option>
                                <option value="modern">Modern (Sans-Serif)</option>
                                <option value="elegant">Elegant (Serif)</option>
                            </select>
                            <button class="btn btn-secondary btn-sm" id="btn-tts-letter">
                                <i data-lucide="volume-2" style="width: 14px; height: 14px;"></i> Vorlesen
                            </button>
                            <button class="btn btn-secondary btn-sm" id="btn-copy-letter">
                                <i data-lucide="copy" style="width: 14px; height: 14px;"></i> Text kopieren
                            </button>
                            <button class="btn btn-secondary btn-sm" id="btn-pdf-letter" style="background: rgba(99, 102, 241, 0.08); border-color: rgba(99, 102, 241, 0.25); color: var(--primary);">
                                <i data-lucide="file-text" style="width: 14px; height: 14px;"></i> PDF Export
                            </button>
                        </div>
                        <div style="padding-top: 10px;">${y}</div>
                    `,lucide.createIcons(),document.getElementById("btn-tts-letter").addEventListener("click",()=>{if(!("speechSynthesis"in window)){window.app.showToast("Sprachausgabe wird nicht unterstützt.","warning");return}const v=document.getElementById("btn-tts-letter");if(window.speechSynthesis.speaking){window.speechSynthesis.cancel(),v.innerHTML='<i data-lucide="volume-2" style="width: 14px; height: 14px;"></i> Vorlesen',lucide.createIcons();return}const d=new SpeechSynthesisUtterance(y);d.lang="de-DE",v.innerHTML='<i data-lucide="volume-x" style="width: 14px; height: 14px;"></i> Stoppen',lucide.createIcons(),d.onend=()=>{v.innerHTML='<i data-lucide="volume-2" style="width: 14px; height: 14px;"></i> Vorlesen',lucide.createIcons()},d.onerror=()=>{v.innerHTML='<i data-lucide="volume-2" style="width: 14px; height: 14px;"></i> Vorlesen',lucide.createIcons()},window.speechSynthesis.speak(d)}),document.getElementById("btn-copy-letter").addEventListener("click",()=>{navigator.clipboard.writeText(y).then(()=>{window.app.showToast("In Zwischenablage kopiert!","success")}).catch(()=>{window.app.showToast("Fehler beim Kopieren.","danger")})}),document.getElementById("btn-pdf-letter").addEventListener("click",()=>{const v=document.getElementById("pdf-style-preset").value;F(()=>import("./pdfExport-B17vn1YC.js"),[]).then(d=>{d.printCoverLetter(n,e,y,v),window.app.showToast("Drucker-PDF-Dialog geöffnet!","success")}).catch(d=>{console.error("Failed to load PDF export utility",d),window.app.showToast("Fehler beim Generieren der PDF.","danger")})})}catch{t.innerHTML="Ein Fehler ist bei der Generierung aufgetreten. Bitte versuche es erneut."}finally{i.disabled=!1}});const r=s.querySelector("#btn-generate-prep"),a=s.querySelector("#ai-prep-output");r&&a&&r.addEventListener("click",async()=>{a.innerHTML=`
                    <div class="ai-loader">
                        <div class="ai-loader-spinner"></div>
                        <p>AI-Simulator bereitet 5 individuelle Gesprächsfragen vor...</p>
                    </div>
                `,r.disabled=!0;try{const u=await $.generateInterviewPrep(n,e);this.interviewQuestions=u,this.currentQuestionIdx=0,this.interviewScores=[],this.renderActiveQuestion(a,e,n)}catch(u){console.error(u),a.innerHTML="Ein Fehler ist bei der Vorbereitung aufgetreten. Bitte versuche es erneut."}finally{r.disabled=!1}});const o=s.querySelector("#btn-generate-cheatsheet");o&&a&&o.addEventListener("click",()=>{const u=$.analyzeMatch(n.skills,e.description);a.innerHTML=`
                    <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; text-align: left; display: flex; flex-direction: column; gap: 14px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                            <h4 style="margin: 0; font-size: 1.1rem; color: var(--secondary);">📋 Interview-Spickzettel (1-Pager): ${e.company}</h4>
                            <button class="btn btn-secondary btn-sm" onclick="window.print()"><i data-lucide="printer"></i> Drucken</button>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <strong style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted);">Meine Top-Argumente:</strong>
                                <ul style="margin: 4px 0 0 0; padding-left: 18px; font-size: 0.85rem; color: var(--text-primary); line-height: 1.5;">
                                    ${u.matchingSkills.slice(0,4).map(c=>`<li>Experte in ${c}</li>`).join("")||"<li>Hohe Lernbereitschaft &amp; Motivation</li>"}
                                </ul>
                            </div>
                            <div>
                                <strong style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted);">Eigene Fragen an das Team:</strong>
                                <ul style="margin: 4px 0 0 0; padding-left: 18px; font-size: 0.85rem; color: var(--text-primary); line-height: 1.5;">
                                    <li>Wie sieht ein typischer Arbeitstag im Team aus?</li>
                                    <li>Welche Tech-Stack Herausforderungen stehen als Nächstes an?</li>
                                    <li>Wie verläuft das Einarbeitungskonzept?</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `,lucide.createIcons()});const l=s.querySelector("#btn-save-cv-text"),p=s.querySelector("#resume-cv-text"),b=s.querySelector("#btn-optimize-resume"),g=s.querySelector("#resume-optimize-results");l&&p&&l.addEventListener("click",()=>{const u=p.value,c=x.getProfile();c.cvText=u,x.saveProfile(c),window.app.showToast("Lebenslauf-Text erfolgreich gespeichert!","success")}),b&&g&&b.addEventListener("click",async()=>{const u=p.value.trim();if(!u){window.app.showToast("Bitte füge zuerst deinen Lebenslauf-Text ein.","warning");return}b.disabled=!0,b.innerHTML='<span class="ai-loader-spinner" style="width: 12px; height: 12px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span> Optimiere...',g.innerHTML=`
                    <div class="ai-loader" style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 40px 0;">
                        <div class="ai-loader-spinner"></div>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">AI-Copilot vergleicht Lebenslauf mit Stellenprofil...</p>
                    </div>
                `;try{const c=await $.generateResumeOptimization(n,e,u);let y="low";c.score>=75?y="high":c.score>=40&&(y="medium");const v=c.matchingKeywords.length>0?c.matchingKeywords.map(h=>`<span class="keyword-badge match" style="font-size: 0.72rem;">${h}</span>`).join(""):'<span class="text-muted" style="font-size: 0.8rem;">Keine Keywords gefunden.</span>',d=c.missingKeywords.length>0?c.missingKeywords.map(h=>`<span class="keyword-badge miss" style="font-size: 0.72rem;">${h}</span>`).join(""):'<span class="text-muted" style="font-size: 0.8rem;">Perfektes Keyword-Match!</span>',m=c.bulletPoints.map(h=>`
                        <div class="bp-compare-card" style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px;">
                            <div class="bp-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                                <div style="opacity: 0.6; border-right: 1px solid var(--border-color); padding-right: 14px;">
                                    <span style="font-size: 0.68rem; text-transform: uppercase; color: var(--danger); font-weight: 700; display: block; margin-bottom: 2px;">Vorher:</span>
                                    <p style="font-size: 0.82rem; margin: 0; color: var(--text-secondary); font-style: italic;">"${h.original}"</p>
                                </div>
                                <div>
                                    <span style="font-size: 0.68rem; text-transform: uppercase; color: var(--success); font-weight: 700; display: block; margin-bottom: 2px;">Nachher (Optimiert):</span>
                                    <p style="font-size: 0.82rem; margin: 0; color: var(--text-primary); font-weight: 500;">"${h.improved}"</p>
                                </div>
                            </div>
                            <div style="background: rgba(99, 102, 241, 0.04); border-left: 2px solid var(--primary); padding: 6px 10px; font-size: 0.76rem; color: var(--text-secondary); margin-top: 4px; border-radius: 0 4px 4px 0;">
                                <strong>Warum:</strong> ${h.why}
                            </div>
                        </div>
                    `).join("");g.innerHTML=`
                        <div class="resume-results-scroll" style="display: flex; flex-direction: column; gap: 20px; overflow-y: auto; max-height: 520px; padding-right: 8px;">
                            <!-- Header Score -->
                            <div style="display: flex; align-items: center; gap: 18px; background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px 20px;">
                                <div class="evaluation-score-badge ${y}" style="width: 54px; height: 54px; font-size: 1.3rem; font-weight: 800; display: flex; align-items: center; justify-content: center; border-radius: 50%;">${c.score}</div>
                                <div>
                                    <h4 style="font-size: 0.95rem; font-weight: 600; margin: 0 0 2px 0;">Lebenslauf Match-Score</h4>
                                    <span style="font-size: 0.75rem; color: var(--text-secondary);">Übereinstimmung mit ${e.company}-Stellenprofil</span>
                                </div>
                            </div>

                            <!-- Keywords matching/missing -->
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                                <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 16px;">
                                    <h5 style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;"><i data-lucide="check-circle2" style="width: 14px; height: 14px; color: var(--success);"></i> Gefundene Keywords</h5>
                                    <div class="keyword-tags" style="gap: 4px;">${v}</div>
                                </div>
                                <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 16px;">
                                    <h5 style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;"><i data-lucide="alert-circle" style="width: 14px; height: 14px; color: var(--warning);"></i> Fehlende Keywords</h5>
                                    <div class="keyword-tags" style="gap: 4px;">${d}</div>
                                </div>
                            </div>

                            <!-- Bulletpoint formulations -->
                            <div>
                                <h5 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-primary); font-weight: 700; margin-bottom: 12px;">Formulierungs-Vorschläge</h5>
                                ${m}
                            </div>

                            <!-- General Tips -->
                            <div style="background: rgba(99, 102, 241, 0.04); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
                                <h5 style="font-size: 0.8rem; text-transform: uppercase; color: var(--primary); font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;"><i data-lucide="info" style="width: 14px; height: 14px;"></i> Strategische Tipps</h5>
                                <p style="font-size: 0.82rem; line-height: 1.5; color: var(--text-secondary); margin: 0;">${c.generalTips}</p>
                            </div>
                        </div>
                    `,lucide.createIcons()}catch(c){console.error(c),g.innerHTML=`
                        <div class="ai-output-box" style="border-color: var(--danger); background: rgba(244,63,94,0.05); color: var(--danger); text-align: center; padding: 24px;">
                            Fehler bei der Analyse: ${c.message}
                        </div>
                    `}finally{b.disabled=!1,b.innerHTML='<i data-lucide="sparkles"></i> Lebenslauf optimieren',lucide.createIcons()}})},bindAudioEvents(s,e){s.querySelectorAll(".btn-tts").forEach(c=>{c.addEventListener("click",()=>{const y=decodeURIComponent(c.getAttribute("data-text"));if(!("speechSynthesis"in window)){window.app.showToast("Sprachausgabe wird in diesem Browser leider nicht unterstützt.","warning");return}if(window.speechSynthesis.speaking){window.speechSynthesis.cancel(),c.classList.remove("active"),c.innerHTML='<i data-lucide="volume-2"></i> Vorlesen',lucide.createIcons();return}const v=new SpeechSynthesisUtterance(y);v.lang="de-DE",c.classList.add("active"),c.innerHTML='<i data-lucide="volume-x"></i> Stoppen',lucide.createIcons(),v.onend=()=>{c.classList.remove("active"),c.innerHTML='<i data-lucide="volume-2"></i> Vorlesen',lucide.createIcons()},v.onerror=()=>{c.classList.remove("active"),c.innerHTML='<i data-lucide="volume-2"></i> Vorlesen',lucide.createIcons()},window.speechSynthesis.speak(v)})});const n=window.SpeechRecognition||window.webkitSpeechRecognition;let i=null;n&&(i=new n,i.lang="de-DE",i.interimResults=!1,i.maxAlternatives=1);let t=null,r=null;s.querySelectorAll(".btn-stt").forEach(c=>{c.addEventListener("click",()=>{const y=c.getAttribute("data-id"),v=s.querySelector(`.user-answer-input[data-id="${y}"]`);if(!n){window.app.showToast("Spracherkennung (Diktieren) wird in diesem Browser nicht unterstützt. Bitte tippe deine Antwort ein.","warning");return}if(!(t!==null&&(i.stop(),t===y)))try{t=y,r=c,c.classList.add("recording"),c.innerHTML='<i data-lucide="mic-off"></i> Stoppen...',lucide.createIcons(),i.start(),i.onresult=d=>{const m=d.results[0][0].transcript;v.value.trim()?v.value+=" "+m:v.value=m},i.onerror=d=>{console.error(d),window.app.showToast("Fehler bei der Spracherkennung.","danger"),a()},i.onend=()=>{a()}}catch(d){console.error(d),a()}})});function a(){r&&(r.classList.remove("recording"),r.innerHTML='<i data-lucide="mic"></i> Antworten',lucide.createIcons()),t=null,r=null}s.querySelectorAll(".btn-evaluate").forEach(c=>{c.addEventListener("click",async()=>{const y=c.getAttribute("data-id"),v=s.querySelector(`.user-answer-input[data-id="${y}"]`),d=s.querySelector(`.evaluation-result-box[data-id="${y}"]`),m=s.querySelector(`.question-text[data-id="${y}"]`).textContent,h=v.value.trim();if(!h){window.app.showToast("Bitte trage oder spreche zuerst deine Antwort ein.","warning");return}c.disabled=!0,c.innerHTML='<span class="ai-loader-spinner" style="width: 12px; height: 12px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span> Auswerten...',d.style.display="block",d.innerHTML=`
                    <div class="evaluation-result-card" style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <div class="ai-loader-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">AI-Coach bewertet Antwort...</span>
                    </div>
                `;try{const w=await $.evaluateInterviewAnswer(e.geminiApiKey,m,h);let S="low";w.score>=75?S="high":w.score>=50&&(S="medium"),d.innerHTML=`
                        <div class="evaluation-result-card">
                            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                                <div class="evaluation-score-badge ${S}">${w.score}</div>
                                <div>
                                    <h4 style="font-size: 0.95rem; font-weight:600; margin: 0 0 2px 0; color: var(--text-primary);">AI-Coach Bewertung</h4>
                                    <span style="font-size: 0.75rem; color: var(--text-muted);">Ergebnis: ${w.score}/100 Punkte</span>
                                </div>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; line-height: 1.45;">
                                <div>
                                    <strong style="color: var(--text-primary); display: block; margin-bottom: 2px;">Feedback:</strong>
                                    <p style="color: var(--text-secondary); margin: 0;">${w.feedback}</p>
                                </div>
                                <div style="margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px;">
                                    <strong style="color: var(--text-primary); display: block; margin-bottom: 2px;">Verbesserungsvorschläge:</strong>
                                    <p style="color: var(--text-secondary); margin: 0;">${w.suggestions}</p>
                                </div>
                            </div>
                        </div>
                    `}catch(w){console.error(w),d.innerHTML=`
                        <div class="evaluation-result-card" style="border-color: var(--danger); background: rgba(244,63,94,0.05);">
                            <span style="font-size: 0.85rem; color: var(--danger);">Fehler bei der Auswertung: ${w.message}</span>
                        </div>
                    `}finally{c.disabled=!1,c.innerHTML='<i data-lucide="sparkles"></i> Bewerten',lucide.createIcons()}})});const o=s.querySelector("#btn-generate-email"),l=s.querySelector("#ai-email-output"),p=s.querySelector("#email-type"),b=s.querySelector("#email-tone");o&&l&&o.addEventListener("click",async()=>{const c=p.value,y=b.value;l.innerHTML=`
                    <div class="ai-loader">
                        <div class="ai-loader-spinner"></div>
                        <p>AI-Assistent verfasst die E-Mail...</p>
                    </div>
                `,o.disabled=!0;try{const v=await $.generateEmail(e,activeJob,c,y);l.innerHTML=`
                        <div style="position: absolute; top: 16px; right: 16px; z-index: 10; display: flex; gap: 8px;">
                            <button class="btn btn-secondary btn-sm" id="btn-tts-email">
                                <i data-lucide="volume-2" style="width: 14px; height: 14px;"></i> Vorlesen
                            </button>
                            <button class="btn btn-secondary btn-sm" id="btn-copy-email">
                                <i data-lucide="copy" style="width: 14px; height: 14px;"></i> Text kopieren
                            </button>
                            <button class="btn btn-secondary btn-sm" id="btn-save-email-log" style="background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.25); color: var(--warning);">
                                <i data-lucide="history" style="width: 14px; height: 14px;"></i> In Verlauf speichern
                            </button>
                        </div>
                        <div style="padding-top: 10px; white-space: pre-wrap;">${v}</div>
                    `,lucide.createIcons(),document.getElementById("btn-tts-email").addEventListener("click",()=>{if(!("speechSynthesis"in window)){window.app.showToast("Sprachausgabe wird nicht unterstützt.","warning");return}const m=document.getElementById("btn-tts-email");if(window.speechSynthesis.speaking){window.speechSynthesis.cancel(),m.innerHTML='<i data-lucide="volume-2" style="width: 14px; height: 14px;"></i> Vorlesen',lucide.createIcons();return}const h=new SpeechSynthesisUtterance(v);h.lang="de-DE",m.innerHTML='<i data-lucide="volume-x" style="width: 14px; height: 14px;"></i> Stoppen',lucide.createIcons(),h.onend=()=>{m.innerHTML='<i data-lucide="volume-2" style="width: 14px; height: 14px;"></i> Vorlesen',lucide.createIcons()},h.onerror=()=>{m.innerHTML='<i data-lucide="volume-2" style="width: 14px; height: 14px;"></i> Vorlesen',lucide.createIcons()},window.speechSynthesis.speak(h)}),document.getElementById("btn-copy-email").addEventListener("click",()=>{navigator.clipboard.writeText(v).then(()=>{window.app.showToast("In Zwischenablage kopiert!","success")}).catch(()=>{window.app.showToast("Fehler beim Kopieren.","danger")})});const d=document.getElementById("btn-save-email-log");d&&d.addEventListener("click",()=>{activeJob.communicationLogs||(activeJob.communicationLogs=[]);const m=p.options[p.selectedIndex].text;activeJob.communicationLogs.push({id:Date.now().toString(),date:new Date().toISOString(),type:"E-Mail",subject:`Entwurf: ${m}`,content:v}),x.updateJob(activeJob),window.app.showToast("Entwurf im Kommunikationsverlauf gespeichert!","success"),d.disabled=!0,d.innerHTML='<i data-lucide="check" style="width: 14px; height: 14px;"></i> Gespeichert',lucide.createIcons()})}catch(v){console.error(v),l.innerHTML="Ein Fehler ist bei der Generierung aufgetreten. Bitte versuche es erneut."}finally{o.disabled=!1}});const g=s.querySelector("#btn-start-neg"),u=s.querySelector("#ai-neg-output");g&&u&&g.addEventListener("click",async()=>{const c=s.querySelector("#neg-target-salary"),y=s.querySelector("#neg-min-salary"),v=s.querySelector("#neg-persona"),d=parseFloat(c.value),m=parseFloat(y.value);if(isNaN(d)||d<=0){window.app.showToast("Bitte gib ein Wunschgehalt an.","warning");return}if(isNaN(m)||m<=0){window.app.showToast("Bitte gib deine Schmerzgrenze an.","warning");return}if(m>d){window.app.showToast("Die Schmerzgrenze darf nicht über dem Wunschgehalt liegen.","warning");return}this.negotiationTargetSalary=d,this.negotiationMinSalary=m,this.negotiationPersona=v.value,this.negotiationHistory=[],u.innerHTML=`
                    <div class="ai-loader">
                        <div class="ai-loader-spinner"></div>
                        <p>AI-Coach bereitet das Gehaltsgespräch vor...</p>
                    </div>
                `,g.disabled=!0;try{const h=e.geminiApiKey,w=await $.negotiateSalary(h,activeJob.title,activeJob.company,d,m,v.value,[],"Simulation starten");this.negotiationHistory.push({sender:"recruiter",text:w.text}),this.renderNegotiationChat(u,activeJob,e)}catch(h){console.error(h),u.innerHTML="Ein Fehler ist beim Starten aufgetreten. Bitte versuche es erneut.",g.disabled=!1}})},renderActiveQuestion(s,e,n){if(!this.interviewQuestions||this.interviewQuestions.length===0)return;const i=this.interviewQuestions[this.currentQuestionIdx],t=Math.round((this.currentQuestionIdx+1)/this.interviewQuestions.length*100);s.innerHTML=`
            <div style="display: flex; flex-direction: column; gap: 20px; text-align: left;">
                <div style="width: 100%;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px; color: var(--text-secondary);">
                        <span>Gesprächs-Simulation</span>
                        <span>Frage ${this.currentQuestionIdx+1} von ${this.interviewQuestions.length}</span>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05); height: 6px; border-radius: 3px; overflow: hidden; width: 100%;">
                        <div style="background: linear-gradient(90deg, var(--secondary), var(--primary)); width: ${t}%; height: 100%; border-radius: 3px; transition: width 0.3s ease;"></div>
                    </div>
                </div>

                <div style="background-color: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; position: relative;">
                    <div style="display: flex; gap: 10px; align-items: flex-start; margin-bottom: 12px;">
                        <span style="background: var(--secondary); color:#fff; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; margin-top: 1px;">?</span>
                        <h4 class="question-text" style="font-size: 1rem; font-weight: 600; line-height: 1.45; color: var(--text-primary); margin: 0;">${i.question}</h4>
                    </div>
                    
                    <div style="margin-left: 34px;">
                        <textarea class="user-answer-input" placeholder="Deine Antwort hier einsprechen (Mikrofon) oder eintippen..." rows="4" style="background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-primary); padding: 10px; width: 100%; font-size: 0.9rem; line-height: 1.5; resize: vertical; margin-bottom: 12px;"></textarea>
                        
                        <div class="audio-controls-row" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                            <button class="btn btn-secondary btn-sm btn-tts" title="Frage vorlesen lassen">
                                <i data-lucide="volume-2"></i> Vorlesen
                            </button>
                            <button class="btn btn-secondary btn-sm btn-stt" title="Spracherkennung über das Mikrofon">
                                <i data-lucide="mic"></i> Antworten
                            </button>
                            <button class="btn btn-primary btn-sm btn-evaluate" style="margin-left: auto; background: linear-gradient(135deg, var(--secondary), var(--primary)); border: none; display: inline-flex; align-items: center; gap: 6px;">
                                <i data-lucide="sparkles"></i> Antwort abgeben
                            </button>
                        </div>

                        <div class="evaluation-result-box" style="margin-top: 16px; display: none;"></div>

                        <details style="margin-top: 14px; cursor: pointer;">
                            <summary style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); user-select: none;">Spickzettel &amp; Musterantwort anzeigen</summary>
                            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px; padding-left: 12px; border-left: 2px solid var(--border-color);">
                                <div style="background: rgba(99, 102, 241, 0.04); border-left: 2px solid var(--primary); padding: 8px 12px; border-radius: 0 4px 4px 0;">
                                    <span style="display: block; font-size: 0.72rem; text-transform: uppercase; color: var(--primary); font-weight: 700; margin-bottom: 2px;">Strategische Empfehlung:</span>
                                    <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; margin: 0;">${i.strategy}</p>
                                </div>
                                <div style="background: rgba(16, 185, 129, 0.04); border-left: 2px solid var(--success); padding: 8px 12px; border-radius: 0 4px 4px 0;">
                                    <span style="display: block; font-size: 0.72rem; text-transform: uppercase; color: var(--success); font-weight: 700; margin-bottom: 2px;">Musterantwort:</span>
                                    <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; font-style: italic; margin: 0;">"${i.sampleAnswer}"</p>
                                </div>
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        `,lucide.createIcons();const r=s.querySelector(".btn-tts");r.addEventListener("click",()=>{if(!("speechSynthesis"in window)){window.app.showToast("Sprachausgabe wird nicht unterstützt.","warning");return}if(window.speechSynthesis.speaking){window.speechSynthesis.cancel(),r.innerHTML='<i data-lucide="volume-2"></i> Vorlesen',lucide.createIcons();return}const u=new SpeechSynthesisUtterance(i.question);u.lang="de-DE",r.innerHTML='<i data-lucide="volume-x"></i> Stoppen',lucide.createIcons(),u.onend=()=>{r.innerHTML='<i data-lucide="volume-2"></i> Vorlesen',lucide.createIcons()},window.speechSynthesis.speak(u)});const a=s.querySelector(".btn-stt"),o=window.SpeechRecognition||window.webkitSpeechRecognition;let l=null;o&&(l=new o,l.lang="de-DE",l.interimResults=!1),a.addEventListener("click",()=>{if(!o){window.app.showToast("Spracherkennung wird nicht unterstützt.","warning");return}if(a.classList.contains("recording")){l.stop();return}a.classList.add("recording"),a.innerHTML='<i data-lucide="mic-off"></i> Stoppen...',lucide.createIcons(),l.start(),l.onresult=u=>{const c=u.results[0][0].transcript;textarea.value=textarea.value.trim()?textarea.value+" "+c:c},l.onerror=()=>{window.app.showToast("Spracherkennung fehlgeschlagen.","danger"),p()},l.onend=()=>{p()}});const p=()=>{a.classList.remove("recording"),a.innerHTML='<i data-lucide="mic"></i> Antworten',lucide.createIcons()},b=s.querySelector(".btn-evaluate"),g=s.querySelector(".evaluation-result-box");b.addEventListener("click",async()=>{const u=textarea.value.trim();if(!u){window.app.showToast("Bitte trage eine Antwort ein.","warning");return}b.disabled=!0,b.innerHTML='<span class="ai-loader-spinner" style="width: 12px; height: 12px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span> Bewerten...',g.style.display="block",g.innerHTML=`
                <div class="evaluation-result-card" style="display: flex; align-items: center; justify-content: center; gap: 10px; background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); padding: 14px; border-radius: var(--radius-sm);">
                    <div class="ai-loader-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
                    <span style="font-size: 0.85rem; color: var(--text-secondary);">AI-Coach bewertet Antwort...</span>
                </div>
            `;try{const c=n.geminiApiKey,y=await $.evaluateInterviewAnswer(c,i.question,u);this.interviewScores.push({id:i.id,question:i.question,answer:u,score:y.score,feedback:y.feedback,suggestions:y.suggestions});let v="low";y.score>=75?v="high":y.score>=50&&(v="medium"),g.innerHTML=`
                    <div class="evaluation-result-card" style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div class="evaluation-score-badge ${v}" style="width: 44px; height: 44px; font-size: 1.15rem; font-weight: 800; border-radius: 50%; display: flex; align-items: center; justify-content: center;">${y.score}</div>
                            <div>
                                <h4 style="font-size: 0.9rem; font-weight: 600; margin: 0; color: var(--text-primary);">Coach Bewertung</h4>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">${y.score} / 100 Punkte</span>
                            </div>
                        </div>
                        <div style="font-size: 0.85rem; line-height: 1.45; color: var(--text-secondary);">
                            <p style="margin: 0 0 8px 0;"><strong>Feedback:</strong> ${y.feedback}</p>
                            <p style="margin: 0;"><strong>Vorschlag:</strong> ${y.suggestions}</p>
                        </div>
                    </div>
                `;const d=this.currentQuestionIdx===this.interviewQuestions.length-1;b.disabled=!1,b.innerHTML=d?'<i data-lucide="award"></i> Ergebnis anzeigen':'<i data-lucide="arrow-right"></i> Nächste Frage',b.style.background="linear-gradient(135deg, var(--success), var(--primary))",lucide.createIcons(),b.replaceWith(b.cloneNode(!0)),s.querySelector(".btn-evaluate").addEventListener("click",()=>{d?this.renderInterviewScorecard(s,e):(this.currentQuestionIdx++,this.renderActiveQuestion(s,e,n))})}catch(c){console.error(c),g.innerHTML=`
                    <div class="evaluation-result-card" style="border-color: var(--danger); background: rgba(244,63,94,0.05); color: var(--danger); font-size: 0.85rem; padding: 12px; border-radius: var(--radius-sm);">
                        Fehler bei der Bewertung: ${c.message}
                    </div>
                `,b.disabled=!1,b.innerHTML='<i data-lucide="sparkles"></i> Antwort abgeben',lucide.createIcons()}})},renderInterviewScorecard(s,e){const n=this.interviewScores.reduce((o,l)=>o+l.score,0),i=Math.round(n/this.interviewScores.length);let t="Gut vorbereitet",r="medium";i>=75?(t="Exzellent vorbereitet! 🎉",r="high"):i<50&&(t="Mehr Übung empfohlen 💡",r="low"),s.innerHTML=`
            <div style="display: flex; flex-direction: column; gap: 24px; text-align: left;">
                <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 24px; display: flex; align-items: center; justify-content: space-around; gap: 20px; flex-wrap: wrap;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
                        <div class="evaluation-score-badge ${r}" style="width: 72px; height: 72px; font-size: 1.6rem; font-weight: 800; border-radius: 50%; display: flex; align-items: center; justify-content: center;">${i}</div>
                        <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Gesamt-Score</span>
                    </div>
                    <div style="flex-grow: 1; min-width: 200px;">
                        <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0 0 4px 0; color: var(--text-primary); font-family: 'Outfit';">Simulation abgeschlossen!</h3>
                        <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 10px 0;">Dein Trainingsergebnis für die Position als <strong>${e.title}</strong> bei <strong>${e.company}</strong>.</p>
                        <span style="font-size: 0.85rem; font-weight: 600; color: ${i>=75?"var(--success)":i>=50?"var(--warning)":"var(--danger)"};">${t}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <button class="btn btn-secondary btn-sm" id="btn-save-interview-log" style="background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.25); color: var(--warning); display: flex; align-items: center; gap: 6px; font-size: 0.8rem; padding: 8px 12px;">
                            <i data-lucide="history"></i> In Verlauf speichern
                        </button>
                        <button class="btn btn-primary btn-sm" id="btn-restart-interview" style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem; padding: 8px 12px;">
                            <i data-lucide="rotate-ccw"></i> Neu starten
                        </button>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 14px;">
                    <h4 style="font-size: 0.95rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin: 0;">Detaillierte Auswertung</h4>
                    ${this.interviewScores.map((o,l)=>`
                        <details style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 14px; cursor: pointer;">
                            <summary style="display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 0.88rem; color: var(--text-primary); user-select: none;">
                                <span style="display: flex; align-items: center; gap: 8px;">
                                    <span style="background: var(--secondary); color: #fff; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700;">${l+1}</span>
                                    Frage ${l+1}
                                </span>
                                <span class="evaluation-score-badge ${o.score>=75?"high":o.score>=50?"medium":"low"}" style="width: 28px; height: 28px; font-size: 0.75rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-left: auto; margin-right: 12px;">${o.score}</span>
                            </summary>
                            <div style="margin-top: 12px; font-size: 0.82rem; line-height: 1.45; color: var(--text-secondary); cursor: default; padding-left: 28px;" onclick="event.stopPropagation()">
                                <p style="margin: 0 0 6px 0;"><strong>Frage:</strong> ${o.question}</p>
                                <p style="margin: 0 0 6px 0; font-style: italic;"><strong>Deine Antwort:</strong> "${o.answer}"</p>
                                <p style="margin: 0 0 6px 0;"><strong>Feedback:</strong> ${o.feedback}</p>
                                <p style="margin: 0;"><strong>Verbesserung:</strong> ${o.suggestions}</p>
                            </div>
                        </details>
                    `).join("")}
                </div>
            </div>
        `,lucide.createIcons(),s.querySelector("#btn-restart-interview").addEventListener("click",()=>{const o=document.getElementById("btn-generate-prep");o&&(o.disabled=!1,o.click())});const a=s.querySelector("#btn-save-interview-log");a.addEventListener("click",()=>{e.communicationLogs||(e.communicationLogs=[]);const o=this.interviewScores.map((l,p)=>`Frage ${p+1}: ${l.question}
Antwort: ${l.answer}
Score: ${l.score}/100
Feedback: ${l.feedback}
`).join(`
---

`);e.communicationLogs.push({id:Date.now().toString(),date:new Date().toISOString(),type:"Vor-Ort-Gespräch",subject:`Interview-Training (Gesamt: ${i}/100)`,content:o}),x.updateJob(e),window.app.showToast("Trainingsergebnis im Kommunikationsverlauf gespeichert!","success"),a.disabled=!0,a.innerHTML='<i data-lucide="check" style="width: 14px; height: 14px;"></i> Gespeichert',lucide.createIcons()})},renderNegotiationChat(s,e,n){const i=Math.floor(this.negotiationHistory.length/2)+1,t=3;s.innerHTML=`
            <div style="display: flex; flex-direction: column; gap: 16px; text-align: left;">
                <!-- Progress Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                    <span>Verhandlungs-Simulator</span>
                    <span>Runde ${Math.min(i,t)} von ${t}</span>
                </div>

                <!-- Chat Messages Area -->
                <div class="negotiation-chat-messages" style="display: flex; flex-direction: column; gap: 12px; max-height: 250px; overflow-y: auto; padding-right: 4px;">
                    ${this.negotiationHistory.map(l=>{const p=l.sender==="user";return`
                            <div style="display: flex; justify-content: ${p?"flex-end":"flex-start"}; width: 100%;">
                                <div style="max-width: 80%; background: ${p?"linear-gradient(135deg, var(--secondary), var(--primary))":"rgba(255,255,255,0.03)"}; border: 1px solid ${p?"transparent":"var(--border-color)"}; border-radius: var(--radius-md); padding: 12px 16px; color: var(--text-primary); font-size: 0.88rem; line-height: 1.45;">
                                    <span style="display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: ${p?"rgba(255,255,255,0.7)":"var(--warning)"}; margin-bottom: 4px;">
                                        ${p?"Deine Antwort":"Recruiter"}
                                    </span>
                                    ${l.text}
                                </div>
                            </div>
                        `}).join("")}
                </div>

                <!-- User Counter Form -->
                <div class="negotiation-input-area" style="border-top: 1px solid var(--border-color); padding-top: 14px; margin-top: 8px;">
                    <textarea id="neg-message-input" placeholder="Schreibe deine Argumente / Gegenangebot... (z. B. 'Aufgrund meiner 3 Jahre Erfahrung im Bereich React halte ich ein Gehalt von...')" rows="3" style="background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-primary); padding: 10px; width: 100%; font-size: 0.9rem; line-height: 1.5; resize: vertical; margin-bottom: 12px;"></textarea>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <span style="font-size: 0.75rem; color: var(--text-muted);">Tipp: Beziehe dich auf deine Skills und die Anforderungen der Stelle.</span>
                        <button class="btn btn-primary btn-sm" id="btn-submit-counter" style="background: linear-gradient(135deg, var(--warning), var(--primary)); border: none; display: inline-flex; align-items: center; gap: 6px; margin-left: auto;">
                            <i data-lucide="send"></i> Antwort senden
                        </button>
                    </div>
                </div>
            </div>
        `,lucide.createIcons();const r=s.querySelector(".negotiation-chat-messages");r&&setTimeout(()=>{r.scrollTop=r.scrollHeight},50);const a=s.querySelector("#btn-submit-counter"),o=s.querySelector("#neg-message-input");a.addEventListener("click",async()=>{const l=o.value.trim();if(!l){window.app.showToast("Bitte trage ein Angebot oder Argument ein.","warning");return}a.disabled=!0,o.disabled=!0,a.innerHTML='<span class="ai-loader-spinner" style="width: 12px; height: 12px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span> Antwortet...',this.negotiationHistory.push({sender:"user",text:l}),this.renderNegotiationChat(s,e,n);try{const p=n.geminiApiKey,b=await $.negotiateSalary(p,e.title,e.company,this.negotiationTargetSalary,this.negotiationMinSalary,this.negotiationPersona,this.negotiationHistory,l);this.negotiationHistory.push({sender:"recruiter",text:b.text}),b.endNegotiation?this.renderNegotiationScorecard(s,e,b):this.renderNegotiationChat(s,e,n)}catch(p){console.error(p),window.app.showToast("Fehler bei der Antwort-Generierung.","danger"),this.renderNegotiationChat(s,e,n)}})},renderNegotiationScorecard(s,e,n){const i=n.rating||50,t=n.finalSalary||this.negotiationMinSalary;let r="Verhandlung erfolgreich abgeschlossen",a="medium";i>=75?(r="Exzellente Verhandlungsführung! 💰",a="high"):i<50&&(r="Ausbaufähiges Verhandlungsgeschick 💡",a="low"),s.innerHTML=`
            <div style="display: flex; flex-direction: column; gap: 24px; text-align: left;">
                <!-- Performance Card -->
                <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 24px; display: flex; align-items: center; justify-content: space-around; gap: 20px; flex-wrap: wrap;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
                        <div class="evaluation-score-badge ${a}" style="width: 72px; height: 72px; font-size: 1.6rem; font-weight: 800; border-radius: 50%; display: flex; align-items: center; justify-content: center;">${i}</div>
                        <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Geschick-Score</span>
                    </div>
                    <div style="flex-grow: 1; min-width: 200px;">
                        <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0 0 4px 0; color: var(--text-primary); font-family: 'Outfit';">Verhandlung beendet!</h3>
                        <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 10px 0;">Ergebnis der Verhandlung für die Position als <strong>${e.title}</strong>.</p>
                        <div style="font-size: 1.1rem; font-weight: 700; color: var(--success); margin-bottom: 6px;">
                            Erzieltes Gehalt: ${t.toLocaleString("de-DE")} € / Jahr
                        </div>
                        <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">${r}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <button class="btn btn-secondary btn-sm" id="btn-save-neg-log" style="background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.25); color: var(--warning); display: flex; align-items: center; gap: 6px; font-size: 0.8rem; padding: 8px 12px;">
                            <i data-lucide="history"></i> In Verlauf speichern
                        </button>
                        <button class="btn btn-primary btn-sm" id="btn-restart-neg" style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem; padding: 8px 12px;">
                            <i data-lucide="rotate-ccw"></i> Neu starten
                        </button>
                    </div>
                </div>

                <!-- Recruiter Feedback -->
                <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 16px;">
                    <h4 style="font-size: 0.9rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin: 0 0 10px 0;">Recruiter Feedback</h4>
                    <p style="font-size: 0.88rem; line-height: 1.5; color: var(--text-secondary); margin: 0;">${n.feedback||"Gute Arbeit! Die Verhandlung wurde erfolgreich abgeschlossen."}</p>
                </div>
            </div>
        `,lucide.createIcons();const o=s.querySelector("#btn-save-neg-log");o.addEventListener("click",()=>{e.communicationLogs||(e.communicationLogs=[]);const l=`Erzieltes Gehalt: ${t.toLocaleString("de-DE")} €
Score: ${i}/100
Feedback: ${n.feedback}

Verlauf:
`+this.negotiationHistory.map(p=>`${p.sender==="user"?"Kandidat":"Recruiter"}: ${p.text}`).join(`
`);e.communicationLogs.push({id:Date.now().toString(),date:new Date().toISOString(),type:"Sonstiges",subject:`Gehaltsverhandlung (Ergebnis: ${t.toLocaleString("de-DE")} €)`,content:l}),e.salary=t,x.updateJob(e),window.app.showToast("Verhandlungsergebnis im Kommunikationsverlauf gespeichert!","success"),o.disabled=!0,o.innerHTML='<i data-lucide="check" style="width: 14px; height: 14px;"></i> Gespeichert',lucide.createIcons()}),s.querySelector("#btn-restart-neg").addEventListener("click",()=>{const l=document.getElementById("btn-start-neg");l&&(l.disabled=!1,l.click())})}},$e={currentDate:new Date,render(s){const e=document.getElementById(s),n=x.getJobs(),i=this.currentDate.getFullYear(),t=this.currentDate.getMonth(),r=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],a=[];n.forEach(u=>{u.deadline&&u.status!=="rejected"&&a.push({id:u.id,type:"deadline",dateStr:u.deadline,title:`Frist: ${u.company}`,subtitle:u.title,color:"var(--primary)"}),u.interviews&&Array.isArray(u.interviews)&&u.interviews.forEach(c=>{if(c.date){const y=c.date.slice(0,10);a.push({id:u.id,type:"interview",dateStr:y,title:`Interview: ${u.company}`,subtitle:c.round||"Gespräch",color:"var(--secondary)"})}})});const o=new Date(i,t,1),l=new Date(i,t+1,0);let p=o.getDay()-1;p===-1&&(p=6);const b=l.getDate(),g=[];for(let u=0;u<p;u++)g.push({isPadding:!0});for(let u=1;u<=b;u++){const c=`${i}-${String(t+1).padStart(2,"0")}-${String(u).padStart(2,"0")}`,y=a.filter(d=>d.dateStr===c),v=new Date().toDateString()===new Date(i,t,u).toDateString();g.push({dayNum:u,dateStr:c,events:y,isToday:v,isPadding:!1})}e.innerHTML=`
            <div class="kanban-header">
                <h2>Interaktiver Bewerbungs-Kalender</h2>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <button class="btn btn-secondary btn-sm" id="btn-cal-prev"><i data-lucide="chevron-left"></i> Vorheriger</button>
                    <span style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); min-width: 160px; text-align: center;">${r[t]} ${i}</span>
                    <button class="btn btn-secondary btn-sm" id="btn-cal-next">Nächster <i data-lucide="chevron-right"></i></button>
                    <button class="btn btn-primary btn-sm" id="btn-cal-today">Heute</button>
                </div>
            </div>

            <div class="glass-card" style="padding: 24px;">
                <!-- Weekday Headers -->
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; text-align: center; font-weight: 700; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                    <div>Mo</div>
                    <div>Di</div>
                    <div>Mi</div>
                    <div>Do</div>
                    <div>Fr</div>
                    <div>Sa</div>
                    <div>So</div>
                </div>

                <!-- Calendar Grid -->
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;">
                    ${g.map(u=>u.isPadding?'<div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); border-radius: var(--radius-sm); min-height: 90px; opacity: 0.3;"></div>':`
                            <div class="cal-day-cell ${u.isToday?"today":""}" data-date="${u.dateStr}" style="background: ${u.isToday?"rgba(99, 102, 241, 0.08)":"rgba(255,255,255,0.025)"}; border: 1px solid ${u.isToday?"var(--primary)":"var(--border-color)"}; border-radius: var(--radius-sm); min-height: 90px; padding: 8px; display: flex; flex-direction: column; gap: 4px; position: relative;">
                                <span style="font-size: 0.85rem; font-weight: ${u.isToday?"800":"600"}; color: ${u.isToday?"var(--primary)":"var(--text-primary)"};">${u.dayNum}</span>
                                <div style="display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 70px;">
                                    ${u.events.map(c=>`
                                        <div class="cal-event-badge" data-job-id="${c.id}" style="background: rgba(255,255,255,0.05); border-left: 3px solid ${c.color}; padding: 3px 6px; border-radius: 2px; font-size: 0.7rem; cursor: pointer; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${c.title}: ${c.subtitle}">
                                            <strong style="color: var(--text-primary);">${c.title}</strong>
                                        </div>
                                    `).join("")}
                                </div>
                            </div>
                        `).join("")}
                </div>
            </div>
        `,lucide.createIcons(),this.bindEvents(e)},bindEvents(s){s.querySelector("#btn-cal-prev").addEventListener("click",()=>{this.currentDate.setMonth(this.currentDate.getMonth()-1),this.render("view-calendar")}),s.querySelector("#btn-cal-next").addEventListener("click",()=>{this.currentDate.setMonth(this.currentDate.getMonth()+1),this.render("view-calendar")}),s.querySelector("#btn-cal-today").addEventListener("click",()=>{this.currentDate=new Date,this.render("view-calendar")}),s.querySelectorAll(".cal-event-badge").forEach(e=>{e.addEventListener("click",n=>{n.stopPropagation();const i=e.getAttribute("data-job-id");window.app.editJob(i)})})}},ze={searchQuery:"",searchLocation:"",mockResults:[],render(s){const e=document.getElementById(s),n=x.getProfile();!this.searchQuery&&n.title&&(this.searchQuery=n.title),e.innerHTML=`
            <div class="kanban-header">
                <h2>Job-Suche & Aggregator</h2>
                <span class="text-secondary">Durchsuche Stellenangebote und importiere sie mit 1-Klick</span>
            </div>

            <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                <form id="finder-search-form" style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <div style="flex: 2; min-width: 200px;">
                        <input type="text" id="finder-query-input" value="${this.searchQuery}" placeholder="Suchbegriff (z.B. Frontend Developer, React)..." style="width: 100%; padding: 10px 14px; border-radius: var(--radius-sm); background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.9rem;">
                    </div>
                    <div style="flex: 1; min-width: 150px;">
                        <input type="text" id="finder-location-input" value="${this.searchLocation}" placeholder="Ort (z.B. München, Remote)..." style="width: 100%; padding: 10px 14px; border-radius: var(--radius-sm); background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.9rem;">
                    </div>
                    <button type="submit" class="btn btn-primary" id="btn-finder-search" style="padding: 10px 20px;">
                        <i data-lucide="search"></i> Jobs suchen
                    </button>
                </form>
            </div>

            <div id="finder-results-container">
                ${this.renderResultsHtml(n)}
            </div>
        `,lucide.createIcons(),this.bindEvents(e)},renderResultsHtml(s){return this.mockResults.length===0?`
                <div class="glass-card empty-state" style="padding: 40px; text-align: center;">
                    <i data-lucide="compass" style="width: 48px; height: 48px; color: var(--text-muted);"></i>
                    <p>Gib oben einen Suchbegriff ein, um passende Stellenangebote zu finden.</p>
                </div>
            `:`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                ${this.mockResults.map((e,n)=>{const i=$.analyzeMatch(s.skills,e.description);return`
                        <div class="glass-card" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                                    <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">${e.company}</span>
                                    <span class="card-score-tag ${i.matchScore>=70?"high":"medium"}">${i.matchScore}% Match</span>
                                </div>
                                <h4 style="font-size: 1rem; margin: 0 0 8px 0; color: var(--text-primary); font-weight: 600;">${e.title}</h4>
                                <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; gap: 12px; margin-bottom: 12px;">
                                    <span><i data-lucide="map-pin" style="width: 12px; height: 12px; display: inline;"></i> ${e.location}</span>
                                    <span><i data-lucide="euro" style="width: 12px; height: 12px; display: inline;"></i> ${e.salary.toLocaleString("de-DE")} €</span>
                                </div>
                                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin: 0;">
                                    ${e.description}
                                </p>
                            </div>
                            <div style="display: flex; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 12px;">
                                <button class="btn btn-primary btn-sm btn-import-found-job" data-idx="${n}" style="flex: 1;">
                                    <i data-lucide="plus"></i> Zu Kanban hinzufügen
                                </button>
                                ${e.url?`
                                    <a href="${e.url}" target="_blank" class="btn btn-secondary btn-sm" title="Anzeige öffnen" style="display: inline-flex; align-items: center; justify-content: center; padding: 6px 10px;">
                                        <i data-lucide="external-link"></i>
                                    </a>
                                `:""}
                            </div>
                        </div>
                    `}).join("")}
            </div>
        `},bindEvents(s){const e=s.querySelector("#finder-search-form");e&&e.addEventListener("submit",n=>{n.preventDefault(),this.searchQuery=s.querySelector("#finder-query-input").value.trim(),this.searchLocation=s.querySelector("#finder-location-input").value.trim(),this.performSearch(s)}),s.querySelectorAll(".btn-import-found-job").forEach(n=>{n.addEventListener("click",()=>{const i=parseInt(n.getAttribute("data-idx")),t=this.mockResults[i];if(t){const r={title:t.title,company:t.company,location:t.location,workMode:t.workMode||"Hybrid",salary:t.salary,url:t.url,description:t.description,status:"saved",ratings:{salary:8,commute:7,remote:8,culture:7,tech:8},history:[{status:"saved",timestamp:new Date().toISOString()}]};x.addJob(r),window.app.showToast(`"${t.title}" zu Gespeichert hinzugefügt!`,"success")}})})},async performSearch(s){const e=this.searchQuery.toLowerCase().trim()||"frontend";try{const n=await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(e)}&limit=10`);if(n.ok){const i=await n.json();if(i.jobs&&Array.isArray(i.jobs)&&i.jobs.length>0){this.mockResults=i.jobs.slice(0,8).map(t=>({title:t.title,company:t.company_name,location:t.candidate_required_location||"Remote / Worldwide",workMode:"Remote",salary:t.salary?parseInt(t.salary.replace(/\D/g,""))||75e3:72e3,url:t.url,description:t.description?t.description.replace(/<[^>]*>?/gm,"").slice(0,400)+"...":"Keine Beschreibung vorhanden."})),this.render("view-finder");return}}}catch(n){console.warn("Remotive API fetch failed, falling back to local aggregator engine",n)}this.mockResults=[{title:`${e.charAt(0).toUpperCase()+e.slice(1)} Specialist (m/w/d)`,company:"TechVision Solutions GmbH",location:this.searchLocation||"München / Hybrid",workMode:"Hybrid",salary:74e3,url:"https://example.com/jobs/techvision-specialist",description:`Spannende Aufgaben im Bereich ${e}. Wir suchen Verstärkung mit fundierter Erfahrung in moderner Softwareentwicklung, TypeScript, HTML5 und responsivem UI-Design.`},{title:`Senior ${e.charAt(0).toUpperCase()+e.slice(1)} Architect`,company:"CloudScale Dynamics",location:"Remote",workMode:"Remote",salary:88e3,url:"https://example.com/jobs/cloudscale-architect",description:"Verantworte die Frontend-Architektur unserer internationalen SaaS-Plattform. Starker Fokus auf Performance, Git, REST APIs, CI/CD und agiles Arbeiten."},{title:`Junior / Mid-Level ${e.charAt(0).toUpperCase()+e.slice(1)}`,company:"Digital Innovation Hub",location:this.searchLocation||"Berlin / Vor Ort",workMode:"Vor Ort",salary:58e3,url:"https://example.com/jobs/digital-hub-dev",description:"Kreiere erstklassige Benutzeroberflächen im Team. Kenntnisse in JavaScript, CSS Grid und Leidenschaft für großartige User Experience erwünscht."}],this.render("view-finder")}};class Te{constructor(){this.currentView="dashboard",this.activeSkills=[],this.modalTodos=[],this.modalInterviews=[],this.modalExpenses=[],this.modalDocuments=[]}init(){this.initRouting(),this.initModals(),this.initGlobalSearch(),this.initNotificationBell(),this.initCvUpload(),this.renderCurrentView(),lucide.createIcons(),this.checkDeadlines(),this.applyAccessibilitySettings(),"serviceWorker"in navigator&&navigator.serviceWorker.register("/sw.js").then(()=>console.log("Service Worker registered successfully.")).catch(e=>console.warn("Service Worker registration failed:",e))}applyAccessibilitySettings(){const e=x.getProfile();e.lrsEnabled?document.body.classList.add("lrs-mode"):document.body.classList.remove("lrs-mode"),e.rgsEnabled?document.body.classList.add("rgs-mode"):document.body.classList.remove("rgs-mode");const n=e.themePrimaryHue||239,i=e.themeSecondaryHue||263;document.documentElement.style.setProperty("--primary-hue",n),document.documentElement.style.setProperty("--secondary-hue",i)}initRouting(){const e=document.querySelectorAll(".sidebar-nav .nav-item");e.forEach(n=>{n.addEventListener("click",()=>{const i=n.getAttribute("data-view");e.forEach(t=>{t.classList.remove("active"),t.setAttribute("aria-selected","false")}),n.classList.add("active"),n.setAttribute("aria-selected","true"),this.switchToView(i)})})}switchToView(e,n=null){this.currentView=e,document.querySelectorAll(".app-view").forEach(a=>a.classList.remove("active"));const t=document.getElementById(`view-${e}`);t&&t.classList.add("active"),document.querySelectorAll(".sidebar-nav .nav-item").forEach(a=>{a.getAttribute("data-view")===e?(a.classList.add("active"),a.setAttribute("aria-selected","true")):(a.classList.remove("active"),a.setAttribute("aria-selected","false"))}),this.renderCurrentView(n)}renderCurrentView(e=null){const n=`view-${this.currentView}`;switch(this.currentView){case"dashboard":Se.render(n);break;case"kanban":Ee.render(n);break;case"comparer":Ie.render(n);break;case"calendar":$e.render(n);break;case"finder":ze.render(n);break;case"copilot":Ae.render(n,e);break}}initGlobalSearch(){document.getElementById("global-search").addEventListener("input",n=>{const i=n.target.value.toLowerCase().trim();this.currentView!=="kanban"&&i.length>0&&this.switchToView("kanban"),document.querySelectorAll(".kanban-card").forEach(r=>{const a=r.querySelector(".card-title")?r.querySelector(".card-title").textContent.toLowerCase():"",o=r.querySelector(".card-company")?r.querySelector(".card-company").textContent.toLowerCase():"",l=r.querySelector(".card-tags")?r.querySelector(".card-tags").textContent.toLowerCase():"";a.includes(i)||o.includes(i)||l.includes(i)?r.style.display="block":r.style.display="none"})})}initModals(){["salary","commute","remote","culture","tech","theme-primary","theme-secondary","gemini-temperature"].forEach(d=>{let m=`rate-${d}`,h=`val-${d}`;d.includes("theme")?(m=`profile-theme-${d.split("-")[1]}`,h=`val-theme-${d.split("-")[1]}`):d.includes("gemini")&&(m=`profile-gemini-${d.split("-")[1]}`,h=`val-gemini-${d.split("-")[1]}`);const w=document.getElementById(m),S=document.getElementById(h);w&&S&&w.addEventListener("input",E=>{S.textContent=E.target.value,d==="theme-primary"?document.documentElement.style.setProperty("--primary-hue",E.target.value):d==="theme-secondary"&&document.documentElement.style.setProperty("--secondary-hue",E.target.value)})});const n=document.getElementById("btn-test-api-key");n&&n.addEventListener("click",async()=>{const m=document.getElementById("profile-api-key").value.trim(),h=document.getElementById("api-key-test-feedback");if(!m){h.style.display="block",h.style.backgroundColor="rgba(239, 68, 68, 0.15)",h.style.color="#f87171",h.style.border="1px solid rgba(239, 68, 68, 0.3)",h.textContent="Bitte gib zuerst einen API-Key ein.";return}n.disabled=!0;const w=n.innerHTML;n.innerHTML='<span class="ai-loader-spinner" style="width: 14px; height: 14px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span>...',h.style.display="block",h.style.backgroundColor="rgba(59, 130, 246, 0.15)",h.style.color="#60a5fa",h.style.border="1px solid rgba(59, 130, 246, 0.3)",h.textContent="Testverbindung wird aufgebaut...";try{await $.testApiKey(m)&&(h.style.backgroundColor="rgba(16, 185, 129, 0.15)",h.style.color="#34d399",h.style.border="1px solid rgba(16, 185, 129, 0.3)",h.textContent="Verbindung erfolgreich! Der API-Schlüssel ist gültig.",this.showToast("API-Key erfolgreich verifiziert!","success"))}catch(S){h.style.backgroundColor="rgba(239, 68, 68, 0.15)",h.style.color="#f87171",h.style.border="1px solid rgba(239, 68, 68, 0.3)",h.textContent="Verbindung fehlgeschlagen: "+S.message,this.showToast("API-Key Verifizierung fehlgeschlagen.","danger")}finally{n.disabled=!1,n.innerHTML=w}}),document.getElementById("btn-add-job-top").addEventListener("click",()=>this.openJobModal()),document.getElementById("btn-open-profile").addEventListener("click",()=>this.openProfileModal());const i=document.getElementById("profile-select");i&&i.addEventListener("change",d=>{x.setActiveProfileId(d.target.value);const m=x.getProfile();this.loadProfileFields(m),this.applyAccessibilitySettings(),this.showToast(`Zu Profil "${m.profileName}" gewechselt`,"primary")});const t=document.getElementById("btn-create-profile");t&&t.addEventListener("click",()=>{const d=document.getElementById("new-profile-name-input"),m=d.value.trim();if(!m){this.showToast("Bitte gib einen Profilnamen ein.","warning");return}const h=x.addProfile(m);d.value="",this.populateProfilesSelect(),this.loadProfileFields(h),this.applyAccessibilitySettings(),this.showToast(`Profil "${m}" erfolgreich erstellt!`,"success")});const r=document.getElementById("btn-delete-current-profile");r&&r.addEventListener("click",()=>{const d=x.getActiveProfileId(),m=x.getProfile();try{x.deleteProfile(d);const h=x.getProfile();this.populateProfilesSelect(),this.loadProfileFields(h),this.applyAccessibilitySettings(),this.showToast(`Profil "${m.profileName}" gelöscht.`,"warning")}catch(h){this.showToast(h.message,"danger")}}),document.getElementById("btn-close-job-modal").addEventListener("click",()=>this.closeModal("job-modal")),document.getElementById("btn-cancel-job-modal").addEventListener("click",()=>this.closeModal("job-modal")),document.getElementById("btn-close-profile-modal").addEventListener("click",()=>this.closeModal("profile-modal")),document.querySelectorAll(".modal-backdrop").forEach(d=>{d.addEventListener("click",m=>{m.target===d&&this.closeModal(d.id)})});const a=document.getElementById("btn-parse-job");a&&a.addEventListener("click",async()=>{let d=document.getElementById("job-raw-text").value;const m=document.getElementById("job-raw-url").value.trim();if((!d||!d.trim())&&!m){this.showToast("Bitte füge eine Stellenbeschreibung oder eine URL ein.","warning");return}a.disabled=!0,a.innerHTML='<span class="ai-loader-spinner" style="width: 14px; height: 14px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span> Parsen...';try{m&&(!d||!d.trim())&&(this.showToast("Lade Stellenbeschreibung von URL...","primary"),d=await $.fetchJobDescriptionFromUrl(m),document.getElementById("job-description").value=d);const h=x.getProfile(),w=await $.parseJobDescription(h.geminiApiKey,d);w.title&&(document.getElementById("job-title").value=w.title),w.company&&(document.getElementById("job-company").value=w.company),w.salary&&(document.getElementById("job-salary").value=w.salary),w.location&&(document.getElementById("job-location").value=w.location),w.workMode&&(document.getElementById("job-work-mode").value=w.workMode),w.description&&(document.getElementById("job-description").value=w.description),w.contact&&(document.getElementById("job-contact").value=w.contact),m&&(document.getElementById("job-url").value=m),this.showToast("Stellenbeschreibung erfolgreich analysiert!","success"),document.getElementById("job-raw-text").value="",document.getElementById("job-raw-url").value=""}catch(h){console.error(h),this.showToast("Fehler beim Analysieren der Anzeige: "+h.message,"danger")}finally{a.disabled=!1,a.innerHTML='<i data-lucide="wand-2"></i> Parsen',lucide.createIcons()}});const o=document.getElementById("btn-parse-email");o&&o.addEventListener("click",async()=>{const d=document.getElementById("job-raw-text").value;if(!d||!d.trim()){this.showToast("Bitte füge den Text der E-Mail ein.","warning");return}o.disabled=!0,o.innerHTML='<span class="ai-loader-spinner" style="width: 14px; height: 14px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span>...';try{const m=x.getProfile(),h=await $.parseEmailText(m.geminiApiKey,d);if(h.status&&(document.getElementById("job-status").value=h.status),h.company&&!document.getElementById("job-company").value&&(document.getElementById("job-company").value=h.company),h.notes){const w=document.getElementById("job-notes").value;document.getElementById("job-notes").value=w?`${w}
${h.notes}`:h.notes}this.showToast(`E-Mail analysiert! Status auf "${h.status}" gesetzt.`,"success"),document.getElementById("job-raw-text").value=""}catch(m){console.error(m),this.showToast("Fehler beim E-Mail Import: "+m.message,"danger")}finally{o.disabled=!1,o.innerHTML='<i data-lucide="mail"></i> E-Mail Import',lucide.createIcons()}}),document.getElementById("job-form").addEventListener("submit",d=>this.handleJobSubmit(d)),document.getElementById("btn-save-profile").addEventListener("click",()=>this.handleProfileSubmit()),document.getElementById("btn-export-cv").addEventListener("click",()=>{const d=x.getProfile();F(()=>import("./cvExport-DXFbwjG_.js"),[]).then(m=>{m.printCurriculumVitae(d),this.showToast("Lebenslauf-Druckdialog geöffnet!","success")}).catch(m=>{console.error(m),this.showToast("Fehler beim Lebenslauf-Export.","danger")})}),document.getElementById("btn-add-skill").addEventListener("click",d=>{d.preventDefault(),this.handleSkillAdd()}),document.getElementById("new-skill-input").addEventListener("keypress",d=>{d.key==="Enter"&&(d.preventDefault(),this.handleSkillAdd())}),document.getElementById("btn-export-data").addEventListener("click",()=>this.handleDataExport()),document.getElementById("btn-trigger-import").addEventListener("click",()=>{document.getElementById("import-file-input").click()}),document.getElementById("import-file-input").addEventListener("change",d=>this.handleDataImport(d));const l=document.querySelectorAll(".modal-tab-btn"),p=document.querySelectorAll(".modal-tab-content");l.forEach(d=>{d.addEventListener("click",()=>{l.forEach(w=>{w.classList.remove("active"),w.style.color="var(--text-secondary)"}),p.forEach(w=>{w.style.display="none"}),d.classList.add("active"),d.style.color="var(--text-primary)";const m=d.getAttribute("data-modal-tab"),h=document.getElementById(m);h&&(h.style.display="block")})});const b=document.getElementById("btn-modal-add-todo");b&&(b.addEventListener("click",()=>{const d=document.getElementById("modal-todo-input"),m=d.value.trim();if(!m){this.showToast("Bitte gib einen Aufgabentext ein.","warning");return}this.modalTodos.push({id:Date.now().toString(),text:m,completed:!1}),d.value="",this.renderModalTodos()}),document.getElementById("modal-todo-input").addEventListener("keypress",d=>{d.key==="Enter"&&(d.preventDefault(),b.click())}));const g=document.getElementById("btn-modal-add-interview");g&&g.addEventListener("click",()=>{const d=document.getElementById("modal-interview-date"),m=document.getElementById("modal-interview-round"),h=document.getElementById("modal-interview-interviewer"),w=document.getElementById("modal-interview-notes"),S=m.value.trim();if(!S){this.showToast("Bitte gib die Gesprächsrunde an.","warning");return}this.modalInterviews.push({id:Date.now().toString(),date:d.value,round:S,interviewer:h.value.trim(),notes:w.value.trim()}),d.value="",m.value="",h.value="",w.value="",this.renderModalInterviews()});const u=document.getElementById("btn-modal-add-history");u&&u.addEventListener("click",()=>{const d=document.getElementById("modal-history-date"),m=document.getElementById("modal-history-type"),h=document.getElementById("modal-history-subject"),w=document.getElementById("modal-history-content"),S=h.value.trim(),E=d.value;if(!E){this.showToast("Bitte gib ein Datum an.","warning");return}if(!S){this.showToast("Bitte gib einen Betreff an.","warning");return}this.modalHistory.push({id:Date.now().toString(),date:E,type:m.value,subject:S,content:w.value.trim()}),d.value="",h.value="",w.value="",this.renderModalHistory()});const c=document.getElementById("btn-modal-add-expense");c&&c.addEventListener("click",()=>{const d=document.getElementById("modal-expense-date"),m=document.getElementById("modal-expense-category"),h=document.getElementById("modal-expense-amount"),w=document.getElementById("modal-expense-notes"),S=d.value,E=parseFloat(h.value);if(!S){this.showToast("Bitte gib ein Datum an.","warning");return}if(isNaN(E)||E<=0){this.showToast("Bitte gib einen gültigen Betrag an.","warning");return}this.modalExpenses.push({id:Date.now().toString(),date:S,category:m.value,amount:E,notes:w.value.trim()}),d.value="",h.value="",w.value="",this.renderModalExpenses()});const y=document.getElementById("btn-trigger-doc-upload"),v=document.getElementById("job-doc-upload");y&&v&&(y.addEventListener("click",()=>{v.click()}),v.addEventListener("change",async d=>{const m=d.target.files[0];if(!m)return;if(m.size>10*1024*1024){this.showToast("Die Datei darf maximal 10 MB groß sein.","warning");return}const h=Date.now().toString(),w=document.getElementById("job-id").value||"temp_"+h;try{await Z.saveFile(h,w,m.name,m),this.modalDocuments.push({id:h,name:m.name,size:m.size,type:m.type,uploadDate:new Date().toISOString()}),this.showToast("Dokument erfolgreich hochgeladen!","success"),this.renderModalDocuments()}catch(S){console.error("IndexedDB upload failed",S),this.showToast("Fehler beim Upload des Dokuments.","danger")}finally{v.value=""}}))}openJobModal(e=null){const n=document.getElementById("job-modal"),i=document.getElementById("job-form"),t=document.getElementById("modal-title");i.reset(),document.getElementById("job-id").value="";const r=["salary","commute","remote","culture","tech"];r.forEach(b=>{document.getElementById(`val-${b}`).textContent="5"});const a=document.querySelectorAll(".modal-tab-btn"),o=document.querySelectorAll(".modal-tab-content");a.forEach(b=>{b.classList.remove("active"),b.style.color="var(--text-secondary)"}),o.forEach(b=>{b.style.display="none"});const l=document.querySelector('[data-modal-tab="modal-tab-details"]');l&&(l.classList.add("active"),l.style.color="var(--text-primary)");const p=document.getElementById("modal-tab-details");if(p&&(p.style.display="block"),e){t.textContent="Jobangebot bearbeiten";const g=x.getJobs().find(u=>u.id===e);if(g){document.getElementById("job-id").value=g.id,document.getElementById("job-title").value=g.title,document.getElementById("job-company").value=g.company,document.getElementById("job-location").value=g.location||"",document.getElementById("job-work-mode").value=g.workMode||"Hybrid",document.getElementById("job-salary").value=g.salary||"",document.getElementById("job-url").value=g.url||"",document.getElementById("job-deadline").value=g.deadline||"",document.getElementById("job-description").value=g.description||"",document.getElementById("job-contact").value=g.contact||"",document.getElementById("job-tags").value=Array.isArray(g.tags)?g.tags.join(", "):g.tags||"",document.getElementById("job-notes").value=g.notes||"",document.getElementById("job-status").value=g.status||"saved",this.modalTodos=Array.isArray(g.todos)?[...g.todos]:[],this.modalInterviews=Array.isArray(g.interviews)?[...g.interviews]:[],this.modalHistory=Array.isArray(g.communicationLogs)?[...g.communicationLogs]:[],this.modalExpenses=Array.isArray(g.expenses)?[...g.expenses]:[],this.modalDocuments=Array.isArray(g.documents)?[...g.documents]:[];const u=g.ratings||{salary:5,commute:5,remote:5,culture:5,tech:5};r.forEach(v=>{const d=document.getElementById(`rate-${v}`),m=document.getElementById(`val-${v}`);d&&m&&(d.value=u[v],m.textContent=u[v])});const c=document.getElementById("job-history-timeline"),y=document.getElementById("job-timeline-nodes");if(g.history&&g.history.length>0){const v={saved:"Gespeichert (Interessant)",prepared:"Unterlagen bereit",applied:"Beworben",interviewing:"Gespräch / Interview",offer:"Angebot erhalten",rejected:"Absage"};y.innerHTML=g.history.map(d=>{const m=new Date(d.timestamp).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});return`
                            <div class="timeline-node">
                                <span class="status-name">${v[d.status]||d.status}</span>
                                <span class="status-date">${m}</span>
                            </div>
                        `}).join(""),c.style.display="block"}else c.style.display="none"}}else t.textContent="Neues Jobangebot eintragen",document.getElementById("job-status").value="saved",document.getElementById("job-history-timeline").style.display="none",this.modalTodos=[],this.modalInterviews=[],this.modalHistory=[],this.modalExpenses=[],this.modalDocuments=[];this.renderModalTodos(),this.renderModalInterviews(),this.renderModalHistory(),this.renderModalExpenses(),this.renderModalDocuments(),n.classList.add("active")}editJob(e){this.openJobModal(e)}closeModal(e){document.getElementById(e).classList.remove("active")}handleJobSubmit(e){e.preventDefault();const n=document.getElementById("job-id").value,i={title:document.getElementById("job-title").value,company:document.getElementById("job-company").value,location:document.getElementById("job-location").value,workMode:document.getElementById("job-work-mode").value,salary:document.getElementById("job-salary").value?parseInt(document.getElementById("job-salary").value):null,url:document.getElementById("job-url").value,deadline:document.getElementById("job-deadline").value,description:document.getElementById("job-description").value,contact:document.getElementById("job-contact").value,tags:document.getElementById("job-tags")?document.getElementById("job-tags").value.split(",").map(t=>t.trim()).filter(t=>t.length>0):[],notes:document.getElementById("job-notes").value,status:document.getElementById("job-status").value,todos:this.modalTodos,interviews:this.modalInterviews,communicationLogs:this.modalHistory,expenses:this.modalExpenses||[],documents:this.modalDocuments||[],ratings:{salary:parseInt(document.getElementById("rate-salary").value),commute:parseInt(document.getElementById("rate-commute").value),remote:parseInt(document.getElementById("rate-remote").value),culture:parseInt(document.getElementById("rate-culture").value),tech:parseInt(document.getElementById("rate-tech").value)}};if(n){const r=x.getJobs().find(l=>l.id===n);let a=r.history||[];Array.isArray(a)||(a=[]),r.status!==i.status&&a.push({status:i.status,timestamp:new Date().toISOString()});const o={...r,...i,history:a};x.updateJob(o),this.showToast("Job erfolgreich aktualisiert","success")}else{const t={...i,history:[{status:i.status,timestamp:new Date().toISOString()}]};x.addJob(t),this.showToast("Neuer Job hinzugefügt!","success")}this.closeModal("job-modal"),this.renderCurrentView()}populateProfilesSelect(){const e=document.getElementById("profile-select");if(!e)return;const n=x.getProfiles(),i=x.getActiveProfileId();e.innerHTML=n.map(t=>`
            <option value="${t.id}" ${t.id===i?"selected":""}>${t.profileName}</option>
        `).join("")}loadProfileFields(e){document.getElementById("profile-name").value=e.name||"",document.getElementById("profile-title").value=e.title||"",document.getElementById("profile-experience").value=e.experience||"",document.getElementById("profile-notifications").checked=!!e.notificationsEnabled,document.getElementById("profile-api-key").value=e.geminiApiKey||"",document.getElementById("profile-lrs").checked=!!e.lrsEnabled,document.getElementById("profile-rgs").checked=!!e.rgsEnabled,document.getElementById("profile-tax-class").value=e.taxClass||"1",document.getElementById("profile-church-tax").value=e.churchTax||"0",document.getElementById("profile-has-children").checked=!!e.hasChildren,document.getElementById("profile-supabase-url").value=e.supabaseUrl||"",document.getElementById("profile-supabase-key").value=e.supabaseAnonKey||"",document.getElementById("profile-theme-primary").value=e.themePrimaryHue||239,document.getElementById("val-theme-primary").textContent=e.themePrimaryHue||239,document.getElementById("profile-theme-secondary").value=e.themeSecondaryHue||263,document.getElementById("val-theme-secondary").textContent=e.themeSecondaryHue||263,document.getElementById("profile-gemini-model").value=e.geminiModel||"gemini-1.5-flash",document.getElementById("profile-gemini-temperature").value=e.geminiTemperature!==void 0?e.geminiTemperature:.7,document.getElementById("val-gemini-temperature").textContent=e.geminiTemperature!==void 0?e.geminiTemperature:.7,document.getElementById("profile-gemini-instructions").value=e.geminiCustomInstructions||"",this.activeSkills=[...e.skills||[]],this.renderSkillTags()}openProfileModal(){const e=document.getElementById("profile-modal"),n=x.getProfile();this.populateProfilesSelect(),this.loadProfileFields(n);const i=document.getElementById("api-key-test-feedback");i&&(i.style.display="none",i.textContent=""),e.querySelectorAll(".btn-preset-theme").forEach(t=>{t.addEventListener("click",()=>{const r=t.getAttribute("data-primary"),a=t.getAttribute("data-secondary");document.getElementById("profile-theme-primary").value=r,document.getElementById("val-theme-primary").textContent=r,document.getElementById("profile-theme-secondary").value=a,document.getElementById("val-theme-secondary").textContent=a,document.documentElement.style.setProperty("--primary-hue",r),document.documentElement.style.setProperty("--secondary-hue",a),this.showToast("Farb-Preset angewendet!","success")})}),e.classList.add("active")}handleSkillAdd(){const e=document.getElementById("new-skill-input"),n=e.value.trim();n&&(n.split(",").map(t=>t.trim()).filter(t=>t.length>0).forEach(t=>{this.activeSkills.some(r=>r.toLowerCase()===t.toLowerCase())||this.activeSkills.push(t)}),e.value="",this.renderSkillTags())}removeSkill(e){this.activeSkills=this.activeSkills.filter(n=>n!==e),this.renderSkillTags()}renderSkillTags(){const e=document.getElementById("profile-skills-list");e.innerHTML=this.activeSkills.map(n=>`
            <div class="skill-tag">
                <span>${n}</span>
                <button type="button" class="btn-remove-skill" data-skill="${n}">&times;</button>
            </div>
        `).join(""),e.querySelectorAll(".btn-remove-skill").forEach(n=>{n.addEventListener("click",()=>{const i=n.getAttribute("data-skill");this.removeSkill(i)})})}async handleProfileSubmit(){const e=document.getElementById("profile-notifications").checked;e&&Notification.permission!=="granted"&&await Notification.requestPermission()!=="granted"&&this.showToast("Benachrichtigungen wurden vom Browser blockiert.","warning");const n=x.getProfile(),i={id:n.id,profileName:n.profileName,name:document.getElementById("profile-name").value,title:document.getElementById("profile-title").value,skills:this.activeSkills,experience:document.getElementById("profile-experience").value,notificationsEnabled:e,geminiApiKey:document.getElementById("profile-api-key").value.trim(),geminiModel:document.getElementById("profile-gemini-model").value,geminiTemperature:parseFloat(document.getElementById("profile-gemini-temperature").value),geminiCustomInstructions:document.getElementById("profile-gemini-instructions").value,lrsEnabled:document.getElementById("profile-lrs").checked,rgsEnabled:document.getElementById("profile-rgs").checked,taxClass:document.getElementById("profile-tax-class").value,churchTax:document.getElementById("profile-church-tax").value,hasChildren:document.getElementById("profile-has-children").checked,supabaseUrl:document.getElementById("profile-supabase-url").value.trim(),supabaseAnonKey:document.getElementById("profile-supabase-key").value.trim(),themePrimaryHue:parseInt(document.getElementById("profile-theme-primary").value,10),themeSecondaryHue:parseInt(document.getElementById("profile-theme-secondary").value,10)};x.saveProfile(i),this.applyAccessibilitySettings(),this.showToast("Profil und Skills gespeichert","success"),this.closeModal("profile-modal"),this.renderCurrentView()}showToast(e,n="primary"){const i=document.getElementById("toast-container"),t=document.createElement("div");t.className=`toast ${n}`;let r="info";n==="success"?r="check-circle2":n==="danger"?r="alert-octagon":n==="warning"&&(r="alert-triangle"),t.innerHTML=`
            <i data-lucide="${r}" class="toast-icon"></i>
            <span>${e}</span>
        `,i.appendChild(t),lucide.createIcons(),setTimeout(()=>{t.style.animation="slideIn 0.3s reverse forwards",setTimeout(()=>{t.remove()},300)},3e3)}handleDataExport(){try{const e=x.exportBackup(),n="data:application/json;charset=utf-8,"+encodeURIComponent(e),i=`jobmatch_backup_${new Date().toISOString().slice(0,10)}.json`,t=document.createElement("a");t.setAttribute("href",n),t.setAttribute("download",i),t.click(),this.showToast("Backup erfolgreich heruntergeladen!","success")}catch{this.showToast("Fehler beim Exportieren der Daten.","danger")}}handleDataImport(e){const n=new FileReader,i=e.target.files[0];i&&(n.onload=t=>{try{const r=t.target.result;x.importBackup(r),this.showToast("Daten erfolgreich importiert!","success"),e.target.value="",this.renderCurrentView()}catch{this.showToast("Fehler: Ungültiges Backup-Format.","danger")}},n.readAsText(i))}checkDeadlines(){if(!x.getProfile().notificationsEnabled||Notification.permission!=="granted")return;const n=x.getJobs(),i=new Date().toISOString().slice(0,10);n.filter(r=>r.deadline===i&&(r.status==="saved"||r.status==="prepared"||r.status==="applied")).forEach(r=>{new Notification("JobMatch Fristen-Alarm",{body:`Die Bewerbungsfrist für "${r.title}" bei "${r.company}" läuft heute ab!`,icon:"favicon.ico"})})}initNotificationBell(){const e=document.getElementById("btn-notifications-bell"),n=document.getElementById("bell-badge-indicator"),i=document.getElementById("bell-notifications-dropdown"),t=document.getElementById("bell-dropdown-list");if(!e||!i||!t)return;e.addEventListener("click",a=>{a.stopPropagation();const o=i.classList.contains("active");i.classList.toggle("active"),e.setAttribute("aria-expanded",!o)}),document.addEventListener("click",a=>{!i.contains(a.target)&&!e.contains(a.target)&&(i.classList.remove("active"),e.setAttribute("aria-expanded","false"))});const r=()=>{const a=x.getJobs(),o=new Date,l=o.getFullYear(),p=String(o.getMonth()+1).padStart(2,"0"),b=String(o.getDate()).padStart(2,"0"),g=`${l}-${p}-${b}`,u=a.filter(c=>c.deadline===g&&c.status!=="rejected"&&c.status!=="offer");u.length>0?(n&&(n.style.display="block"),t.innerHTML=u.map(c=>`
                    <div class="bell-dropdown-item" data-job-id="${c.id}" style="cursor: pointer;">
                        <span class="job-info">${c.company}</span>
                        <span class="job-desc">${c.title} (Frist heute!)</span>
                    </div>
                `).join(""),t.querySelectorAll(".bell-dropdown-item").forEach(c=>{c.addEventListener("click",()=>{const y=c.getAttribute("data-job-id");this.editJob(y),i.classList.remove("active"),e.setAttribute("aria-expanded","false")})})):(n&&(n.style.display="none"),t.innerHTML='<div class="bell-dropdown-empty">Keine Fristen für heute.</div>')};r(),this.updateNotificationBell=r}renderModalTodos(){const e=document.getElementById("modal-todos-list"),n=document.getElementById("modal-todos-empty"),i=document.getElementById("modal-todos-count");!e||!n||!i||(i.textContent=this.modalTodos.length,this.modalTodos.length>0?(i.style.display="inline-block",n.style.display="none",e.style.display="flex"):(i.style.display="none",n.style.display="block",e.style.display="none"),e.innerHTML=this.modalTodos.map(t=>`
            <li class="todo-list-item ${t.completed?"completed":""}" data-todo-id="${t.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-sm); transition: all var(--transition-fast);">
                <input type="checkbox" class="todo-checkbox" ${t.completed?"checked":""} style="width: 16px; height: 16px; margin-right: 12px; accent-color: var(--primary); cursor: pointer;">
                <span class="todo-text" style="flex-grow: 1; font-size: 0.88rem; color: var(--text-primary); text-decoration: ${t.completed?"line-through":"none"}; opacity: ${t.completed?"0.6":"1"};">${t.text}</span>
                <button type="button" class="btn-delete-todo" title="Aufgabe löschen" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); transition: all var(--transition-fast); display: inline-flex; align-items: center; justify-content: center;">
                    <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                </button>
            </li>
        `).join(""),lucide.createIcons(),e.querySelectorAll(".todo-checkbox").forEach(t=>{t.addEventListener("change",r=>{const a=t.closest(".todo-list-item").getAttribute("data-todo-id"),o=this.modalTodos.find(l=>l.id===a);if(o){o.completed=r.target.checked;const l=t.closest(".todo-list-item").querySelector(".todo-text");l&&(l.style.textDecoration=o.completed?"line-through":"none",l.style.opacity=o.completed?"0.6":"1"),t.closest(".todo-list-item").classList.toggle("completed",o.completed)}})}),e.querySelectorAll(".btn-delete-todo").forEach(t=>{t.addEventListener("click",()=>{const r=t.closest(".todo-list-item").getAttribute("data-todo-id");this.modalTodos=this.modalTodos.filter(a=>a.id!==r),this.renderModalTodos()})}))}renderModalInterviews(){const e=document.getElementById("modal-interviews-list"),n=document.getElementById("modal-interviews-empty"),i=document.getElementById("modal-interviews-count");!e||!n||!i||(this.modalInterviews.sort((t,r)=>new Date(t.date)-new Date(r.date)),i.textContent=this.modalInterviews.length,this.modalInterviews.length>0?(i.style.display="inline-block",n.style.display="none",e.style.display="flex"):(i.style.display="none",n.style.display="block",e.style.display="none"),e.innerHTML=this.modalInterviews.map(t=>{let r="Keine Zeit";return t.date&&(r=new Date(t.date).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})),`
                <div class="interview-card" data-id="${t.id}" style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 16px; transition: all var(--transition-fast); position: relative;">
                    <button type="button" class="btn-delete-interview" title="Gespräch löschen" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); transition: all var(--transition-fast); position: absolute; top: 10px; right: 10px; display: inline-flex; align-items: center; justify-content: center;">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                    <div class="interview-card-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 6px; padding-right: 24px;">
                        <span class="interview-round-title" style="font-weight: 600; color: var(--text-primary); font-size: 0.9rem;">${t.round}</span>
                        <span class="interview-date-badge" style="font-size: 0.75rem; color: var(--text-muted);">${r}</span>
                    </div>
                    ${t.interviewer?`
                        <div class="interview-interviewer-name" style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                            <i data-lucide="user" style="width: 12px; height: 12px; display: inline;"></i> ${t.interviewer}
                        </div>
                    `:""}
                    ${t.notes?`<p class="interview-notes-text" style="font-size: 0.82rem; line-height: 1.45; color: var(--text-secondary); white-space: pre-wrap; background: rgba(0, 0, 0, 0.15); padding: 8px 10px; border-radius: var(--radius-sm); margin: 4px 0 0 0;">${t.notes}</p>`:""}
                </div>
            `}).join(""),lucide.createIcons(),e.querySelectorAll(".btn-delete-interview").forEach(t=>{t.addEventListener("click",()=>{const r=t.closest(".interview-card").getAttribute("data-id");this.modalInterviews=this.modalInterviews.filter(a=>a.id!==r),this.renderModalInterviews()})}))}renderModalHistory(){const e=document.getElementById("modal-history-list"),n=document.getElementById("modal-history-empty"),i=document.getElementById("modal-history-count");!e||!n||!i||(this.modalHistory.sort((t,r)=>new Date(r.date)-new Date(t.date)),i.textContent=this.modalHistory.length,this.modalHistory.length>0?(i.style.display="inline-block",n.style.display="none",e.style.display="flex"):(i.style.display="none",n.style.display="block",e.style.display="none"),e.innerHTML=this.modalHistory.map(t=>{let r="Keine Zeit";return t.date&&(r=new Date(t.date).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})),`
                <div class="history-card" data-id="${t.id}" style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 16px; transition: all var(--transition-fast); position: relative;">
                    <button type="button" class="btn-delete-history" title="Eintrag löschen" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); transition: all var(--transition-fast); position: absolute; top: 10px; right: 10px; display: inline-flex; align-items: center; justify-content: center;">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                    <div class="history-card-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 6px; padding-right: 24px;">
                        <span class="history-round-title" style="font-weight: 600; color: var(--text-primary); font-size: 0.9rem;">${t.subject}</span>
                        <span class="history-date-badge" style="font-size: 0.75rem; color: var(--text-muted);">${r}</span>
                    </div>
                    <div class="history-type-tag" style="font-size: 0.75rem; font-weight: 600; color: var(--primary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                        <i data-lucide="tag" style="width: 12px; height: 12px; display: inline;"></i> ${t.type}
                    </div>
                    ${t.content?`<p class="history-content-text" style="font-size: 0.82rem; line-height: 1.45; color: var(--text-secondary); white-space: pre-wrap; background: rgba(0, 0, 0, 0.15); padding: 8px 10px; border-radius: var(--radius-sm); margin: 4px 0 0 0;">${t.content}</p>`:""}
                </div>
            `}).join(""),lucide.createIcons(),e.querySelectorAll(".btn-delete-history").forEach(t=>{t.addEventListener("click",()=>{const r=t.closest(".history-card").getAttribute("data-id");this.modalHistory=this.modalHistory.filter(a=>a.id!==r),this.renderModalHistory()})}))}initCvUpload(){const e=document.getElementById("profile-cv-upload"),n=document.getElementById("btn-trigger-cv-upload"),i=document.getElementById("cv-upload-filename");!e||!n||(n.addEventListener("click",()=>e.click()),e.addEventListener("change",async t=>{const r=t.target.files[0];if(!r)return;i.textContent=r.name,n.disabled=!0;const a=n.innerHTML;n.innerHTML='<span class="ai-loader-spinner" style="width: 14px; height: 14px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 5px;"></span> Lese...';try{let o="";if(r.type==="application/pdf"||r.name.endsWith(".pdf")?o=await this.extractTextFromPdf(r):o=await this.readTextFile(r),!o||!o.trim())throw new Error("Text konnte nicht aus der Datei extrahiert werden.");this.showToast("Analysiere Lebenslauf...","primary");const l=x.getProfile(),p=document.getElementById("profile-api-key").value.trim()||l.geminiApiKey,b=await $.parseCVText(p,o);b.name&&(document.getElementById("profile-name").value=b.name),b.title&&(document.getElementById("profile-title").value=b.title),b.experience&&(document.getElementById("profile-experience").value=b.experience),b.skills&&Array.isArray(b.skills)&&(this.activeSkills=b.skills,this.renderSkillTags()),this.showToast("Lebenslauf erfolgreich importiert!","success")}catch(o){console.error(o),this.showToast("Fehler beim Importieren: "+o.message,"danger")}finally{n.disabled=!1,n.innerHTML=a,lucide.createIcons()}}))}readTextFile(e){return new Promise((n,i)=>{const t=new FileReader;t.onload=()=>n(t.result),t.onerror=()=>i(new Error("Fehler beim Lesen der Textdatei.")),t.readAsText(e)})}extractTextFromPdf(e){return new Promise((n,i)=>{const t=new FileReader;t.onload=async()=>{try{const r=new Uint8Array(t.result),a=await pdfjsLib.getDocument({data:r}).promise;let o="";for(let l=1;l<=a.numPages;l++){const g=(await(await a.getPage(l)).getTextContent()).items.map(u=>u.str).join(" ");o+=g+`
`}n(o)}catch(r){i(new Error("PDF-Konvertierungsfehler: "+r.message))}},t.onerror=()=>i(new Error("Fehler beim Laden des PDF-Streams.")),t.readAsArrayBuffer(e)})}renderModalExpenses(){const e=document.getElementById("modal-expenses-list"),n=document.getElementById("modal-expenses-empty"),i=document.getElementById("modal-expenses-count");if(!e)return;const t=this.modalExpenses.length;if(i&&(i.textContent=t),t===0){e.style.display="none",n.style.display="block";return}n.style.display="none",e.style.display="flex",e.innerHTML=this.modalExpenses.map(r=>{const a=parseFloat(r.amount).toLocaleString("de-DE",{style:"currency",currency:"EUR"});return`
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
            `}).join(""),lucide.createIcons()}deleteModalExpense(e){this.modalExpenses=this.modalExpenses.filter(n=>n.id!==e),this.renderModalExpenses()}renderModalDocuments(){const e=document.getElementById("modal-documents-list"),n=document.getElementById("modal-documents-empty"),i=document.getElementById("modal-documents-count");if(!e)return;const t=this.modalDocuments.length;if(i&&(i.textContent=t),t===0){e.style.display="none",n.style.display="block";return}n.style.display="none",e.style.display="flex",e.innerHTML=this.modalDocuments.map(r=>{const a=Math.round(r.size/1024);return`
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
            `}).join(""),lucide.createIcons()}async downloadDocument(e,n){try{const i=await Z.getFile(e);if(!i||!i.fileBlob){this.showToast("Datei nicht gefunden.","danger");return}const t=URL.createObjectURL(i.fileBlob),r=document.createElement("a");r.href=t,r.download=n,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(t)}catch(i){console.error("Download failed",i),this.showToast("Fehler beim Herunterladen der Datei.","danger")}}async deleteDocument(e){try{await Z.deleteFile(e),this.modalDocuments=this.modalDocuments.filter(n=>n.id!==e),this.showToast("Datei gelöscht.","warning"),this.renderModalDocuments()}catch(n){console.error("Delete failed",n),this.showToast("Fehler beim Löschen der Datei.","danger")}}}window.app=new Te;document.addEventListener("DOMContentLoaded",()=>{window.app.init()});
