(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{values;constructor(e){this.values={hunger:e?.hunger??85,energy:e?.energy??90,hygiene:e?.hygiene??80,bladder:e?.bladder??85,fun:e?.fun??75,social:e?.social??70}}getValues(){return{...this.values}}update(e){let t=e*.05;this.values.hunger=Math.max(0,this.values.hunger-t*1.2),this.values.energy=Math.max(0,this.values.energy-t*.8),this.values.hygiene=Math.max(0,this.values.hygiene-t*.9),this.values.bladder=Math.max(0,this.values.bladder-t*1.3),this.values.fun=Math.max(0,this.values.fun-t*1),this.values.social=Math.max(0,this.values.social-t*.7)}modify(e,t){this.values[e]!==void 0&&(this.values[e]=Math.min(100,Math.max(0,this.values[e]+t)))}getLowestNeed(){let e=`hunger`,t=100;return Object.keys(this.values).forEach(n=>{this.values[n]<t&&(t=this.values[n],e=n)}),{need:e,value:t}}getOverallSatisfaction(){let e=Object.values(this.values).reduce((e,t)=>e+t,0);return Math.round(e/6)}},t=class{static getMood(e,t,n){return t<15?n===`energy`?{type:`exhausted`,label:`Erschöpft`,color:`#e74c3c`,plumbobColor:`#e74c3c`,description:`Dieser Sim braucht dringend Schlaf!`}:{type:`tense`,label:`Angespannt`,color:`#e67e22`,plumbobColor:`#e67e22`,description:`Dringendes Bedürfnis unerfüllt: ${n.toUpperCase()}`}:e>=80?{type:`energized`,label:`Energetisch & Glücklich`,color:`#2ecc71`,plumbobColor:`#00ff66`,description:`Fühlt sich fantastisch und ist bereit für große Taten!`}:e>=50?{type:`happy`,label:`Glücklich`,color:`#27ae60`,plumbobColor:`#2ecc71`,description:`Gut gelaunt und zufrieden mit dem Alltag.`}:{type:`sad`,label:`Unzufrieden`,color:`#3498db`,plumbobColor:`#f1c40f`,description:`Etwas fehlt zum vollkommenen Glück.`}}},n=class{queue=[];maxQueueLength=5;enqueue(e){return this.queue.length>=this.maxQueueLength?!1:(this.queue.push({...e,elapsedSeconds:0}),!0)}getCurrentAction(){return this.queue.length>0?this.queue[0]:null}getQueue(){return[...this.queue]}cancelAction(e){let t=this.queue.findIndex(t=>t.id===e);if(t!==-1){let e=this.queue.splice(t,1)[0];e.onCancel&&e.onCancel()}}clearQueue(){this.queue.forEach(e=>{e.onCancel&&e.onCancel()}),this.queue=[]}update(e){let t=this.getCurrentAction();t&&(t.elapsedSeconds+=e,t.onExecuteTick&&t.onExecuteTick(e),t.elapsedSeconds>=t.durationSeconds&&(t.onComplete&&t.onComplete(),this.queue.shift()))}},r=class{static escapeHTML(e){return typeof e==`string`?e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#x27;`).replace(/\//g,`&#x2F;`):``}static sanitizeText(e,t=32){if(typeof e!=`string`)return``;let n=e.trim().replace(/[^\p{L}\p{N}\s\-_.]/gu,``);return n.length>t&&(n=n.substring(0,t)),this.escapeHTML(n)}static safeJSONParse(e,t){try{if(!e||typeof e!=`string`)return t;if(e.includes(`__proto__`)||e.includes(`constructor`)||e.includes(`prototype`))return console.warn(`[Security Guard] Potentially malicious JSON structure detected and blocked.`),t;let n=JSON.parse(e);return n&&typeof n==`object`?n:t}catch(e){return console.error(`[Security Guard] Error parsing JSON data safely:`,e),t}}static clamp(e,t,n){return typeof e!=`number`||isNaN(e)?t:Math.min(Math.max(e,t),n)}},i=class{static getInfo(e){switch(e){case`baby`:return{type:`baby`,label:`Baby`,icon:`🍼`,renderScale:.45,daysInStage:5};case`toddler`:return{type:`toddler`,label:`Kleinkind`,icon:`🧸`,renderScale:.65,daysInStage:7};case`child`:return{type:`child`,label:`Kind`,icon:`🎒`,renderScale:.8,daysInStage:10};case`teen`:return{type:`teen`,label:`Teenager`,icon:`🎧`,renderScale:.95,daysInStage:12};case`adult`:return{type:`adult`,label:`Erwachsener`,icon:`💼`,renderScale:1,daysInStage:20};case`senior`:return{type:`senior`,label:`Senior`,icon:`👵`,renderScale:.95,daysInStage:15}}}static getNextStage(e){let t=[`baby`,`toddler`,`child`,`teen`,`adult`,`senior`],n=t.indexOf(e);return n<t.length-1?t[n+1]:`senior`}},a=class{id;customization;gridPos={x:5,y:5};renderPos={x:5,y:5};lifeStage=`adult`;ageDays=0;partnerName;childrenNames=[];needs;actionQueue;simoleons=2500;skills={cooking:1,programming:1,painting:1,fitness:1,charisma:1};currentPath=[];animState=`idle`;facing=`south`;constructor(t){this.id=`sim_${Date.now()}`,this.customization={name:r.sanitizeText(t?.name||`Bella Goth`,24),gender:t?.gender||`female`,skinColor:t?.skinColor||`#f1c27d`,hairColor:t?.hairColor||`#2c3e50`,outfitColor:t?.outfitColor||`#e74c3c`,trait:t?.trait||`Genial`,aspiration:t?.aspiration||`Meisterköchin`},this.needs=new e,this.actionQueue=new n,this.renderPos={x:this.gridPos.x,y:this.gridPos.y}}getCurrentMood(){let e=this.needs.getOverallSatisfaction(),n=this.needs.getLowestNeed();return t.getMood(e,n.value,n.need)}update(e,t){if(this.needs.update(t),this.currentPath.length>0){this.animState=`walking`;let t=this.currentPath[0],n=3.5*e,r=t.x-this.renderPos.x,i=t.y-this.renderPos.y,a=Math.sqrt(r*r+i*i);a<=n?(this.renderPos.x=t.x,this.renderPos.y=t.y,this.gridPos={x:t.x,y:t.y},this.currentPath.shift()):(this.renderPos.x+=r/a*n,this.renderPos.y+=i/a*n)}else this.animState=this.actionQueue.getCurrentAction()?`acting`:`idle`;this.actionQueue.update(e)}setPath(e){e.length>0&&(e[0].x===this.gridPos.x&&e[0].y===this.gridPos.y&&e.shift(),this.currentPath=e)}ageUp(){let e=i.getNextStage(this.lifeStage);return this.lifeStage=e,this.ageDays=0,e===`senior`&&(this.customization.hairColor=`#bdc3c7`),e}addSkillXP(e,t){if(this.skills[e]!==void 0){let n=Math.floor(this.skills[e]);return this.skills[e]+=t/100,Math.floor(this.skills[e])>n}return!1}},o={bed_basic:{id:`bed_basic`,name:`Gemütliches Bett`,category:`comfort`,price:350,width:2,height:1,color:`#34495e`,accentColor:`#ecf0f1`,icon:`🛏️`,description:`Stellt Energie und Komfort schnell wieder her.`,interactions:[{id:`sleep`,label:`Schlafen`,icon:`😴`,duration:12,needEffects:{energy:80,fun:10}},{id:`nap`,label:`Nickerchen machen`,icon:`💤`,duration:5,needEffects:{energy:35}}]},fridge_modern:{id:`fridge_modern`,name:`Gefrier-Kombination "Frost"`,category:`appliances`,price:600,width:1,height:1,color:`#bdc3c7`,accentColor:`#3498db`,icon:`🧊`,description:`Hält Speisen frisch. Perfekt für schnelle Snacks.`,interactions:[{id:`snack`,label:`Quick Snack essen`,icon:`🥪`,duration:4,needEffects:{hunger:45}},{id:`cook_gourmet`,label:`Gourmet-Mahlzeit kochen`,icon:`🍳`,duration:8,needEffects:{hunger:90,fun:15},skillGain:{skill:`cooking`,amount:15}}]},shower_glass:{id:`shower_glass`,name:`Wellness Glasdusche`,category:`plumbing`,price:450,width:1,height:1,color:`#3498db`,accentColor:`#ffffff`,icon:`🚿`,description:`Sorgt für beste Hygiene und Frische.`,interactions:[{id:`shower`,label:`Duschen`,icon:`🧼`,duration:5,needEffects:{hygiene:90,energy:10}}]},toilet_deluxe:{id:`toilet_deluxe`,name:`Keramik WC`,category:`plumbing`,price:250,width:1,height:1,color:`#ffffff`,accentColor:`#95a5a6`,icon:`🚽`,description:`Entlastet die Blase zuverlässig.`,interactions:[{id:`use_toilet`,label:`WC benutzen`,icon:`🧻`,duration:3,needEffects:{bladder:100}}]},pc_station:{id:`pc_station`,name:`CyberStation Pro 5`,category:`entertainment`,price:1200,width:1,height:1,color:`#2c3e50`,accentColor:`#e74c3c`,icon:`🖥️`,description:`Zum Programmieren, Spielen und Arbeiten.`,interactions:[{id:`play_games`,label:`Spiele zocken`,icon:`🎮`,duration:6,needEffects:{fun:75,energy:-10}},{id:`code`,label:`Spiele programmieren`,icon:`💻`,duration:8,needEffects:{fun:30,energy:-15},skillGain:{skill:`programming`,amount:25}}]},easel_artist:{id:`easel_artist`,name:`Künstler-Staffelei`,category:`entertainment`,price:300,width:1,height:1,color:`#d35400`,accentColor:`#f39c12`,icon:`🎨`,description:`Drücke dich kreativ aus und verkaufe Gemälde.`,interactions:[{id:`paint`,label:`Gemälde malen`,icon:`🖌️`,duration:7,needEffects:{fun:60,energy:-10},skillGain:{skill:`painting`,amount:20}}]},sofa_luxury:{id:`sofa_luxury`,name:`Modulares Ecksofa`,category:`comfort`,price:500,width:2,height:1,color:`#8e44ad`,accentColor:`#9b59b6`,icon:`🛋️`,description:`Perfekt zum Entspannen und Fernsehen.`,interactions:[{id:`relax`,label:`Entspannen`,icon:`😌`,duration:5,needEffects:{energy:25,fun:30}}]},tv_smart:{id:`tv_smart`,name:`65" Ultra-HD Smart-TV`,category:`entertainment`,price:850,width:2,height:1,color:`#111111`,accentColor:`#00e5ff`,icon:`📺`,description:`Streamen & Serien schauen steigert Spaß und Geselligkeit.`,interactions:[{id:`watch_tv`,label:`Serien schauen`,icon:`🍿`,duration:6,needEffects:{fun:80,social:15}}]},pool_ladder:{id:`pool_ladder`,name:`Pool-Leiter Pro`,category:`entertainment`,price:350,width:1,height:1,color:`#3498db`,accentColor:`#ecf0f1`,icon:`🏊`,description:`Einstieg in den Swimming-Pool. Steigert Fitness, Hygiene & Spaß!`,interactions:[{id:`swim`,label:`Im Pool schwimmen`,icon:`🏊‍♂️`,duration:8,needEffects:{fun:85,hygiene:30,energy:-15},skillGain:{skill:`fitness`,amount:30}}]},birthday_cake:{id:`birthday_cake`,name:`Geburtstagstorte`,category:`appliances`,price:150,width:1,height:1,color:`#e74c3c`,accentColor:`#f1c40f`,icon:`🎂`,description:`Puste die Kerzen aus, um in die nächste Lebensphase aufzusteigen!`,interactions:[{id:`blow_candles`,label:`Kerzen ausblasen (Altern)`,icon:`🎉`,duration:5,needEffects:{fun:90,social:30}}]},baby_crib:{id:`baby_crib`,name:`Gemütliche Baby-Wiege`,category:`comfort`,price:280,width:1,height:1,color:`#9b59b6`,accentColor:`#ffffff`,icon:`🍼`,description:`Bietet Wiegekomfort für Säuglinge & Babys.`,interactions:[{id:`cuddle_baby`,label:`Baby wiegen & füttern`,icon:`👶`,duration:6,needEffects:{social:75,fun:50}}]},stereo_hifi:{id:`stereo_hifi`,name:`HiFi-Stereoanlage Pro`,category:`entertainment`,price:400,width:1,height:1,color:`#34495e`,accentColor:`#00e5ff`,icon:`📻`,description:`4 Simlish-Radiosender (Pop, Retro, Lo-Fi, Electro) & Tanzfläche.`,interactions:[{id:`toggle_radio`,label:`Radio An / Aus`,icon:`🎵`,duration:2,needEffects:{fun:20}},{id:`cycle_station`,label:`Radiosender wechseln`,icon:`🎛️`,duration:2,needEffects:{fun:15}},{id:`dance_solo`,label:`Allein tanzen`,icon:`🕺`,duration:7,needEffects:{fun:85,energy:-10},skillGain:{skill:`fitness`,amount:20}},{id:`dance_couple`,label:`Paartanzen mit Nachbar`,icon:`💃`,duration:8,needEffects:{fun:90,social:80},skillGain:{skill:`charisma`,amount:25}}]},party_buffet:{id:`party_buffet`,name:`Gourmet Party-Buffet`,category:`appliances`,price:500,width:2,height:1,color:`#e67e22`,accentColor:`#f1c40f`,icon:`🍇`,description:`Reichhaltiges Party-Buffet für festliche Anlässe & Hauspartys.`,interactions:[{id:`serve_buffet`,label:`Party-Snacks servieren`,icon:`🍱`,duration:6,needEffects:{hunger:95,fun:40,social:50}}]}},s=class{width=16;height=16;tiles=[];placedFurniture=[];constructor(){this.initDefaultHouse()}initDefaultHouse(){for(let e=0;e<this.width;e++){this.tiles[e]=[];for(let t=0;t<this.height;t++){let n=e>=3&&e<=12&&t>=3&&t<=12;this.tiles[e][t]={x:e,y:t,type:n?`wood`:`grass`,color:n?`#8d5524`:`#27ae60`,wallColor:`#2c3e50`}}}for(let e=3;e<=12;e++)this.tiles[e][3].hasWallNorth=!0,this.tiles[e][12].hasWallNorth=!0;for(let e=3;e<=12;e++)this.tiles[3][e].hasWallWest=!0,this.tiles[12][e].hasWallWest=!0;this.tiles[7][12].openingNorth=`door`,this.addFurniture(`bed_basic`,4,4),this.addFurniture(`fridge_modern`,10,4),this.addFurniture(`shower_glass`,4,10),this.addFurniture(`toilet_deluxe`,6,10),this.addFurniture(`pc_station`,10,8),this.addFurniture(`sofa_luxury`,7,7)}setFloorStyle(e,t,n,r){e>=0&&e<this.width&&t>=0&&t<this.height&&(this.tiles[e][t].type=n,this.tiles[e][t].color=r)}toggleWallNorth(e,t,n=`#2c3e50`){if(e>=0&&e<this.width&&t>=0&&t<this.height){let r=this.tiles[e][t];r.hasWallNorth=!r.hasWallNorth,r.wallColor=n,r.hasWallNorth||(r.openingNorth=void 0)}}toggleWallWest(e,t,n=`#2c3e50`){if(e>=0&&e<this.width&&t>=0&&t<this.height){let r=this.tiles[e][t];r.hasWallWest=!r.hasWallWest,r.wallColor=n,r.hasWallWest||(r.openingWest=void 0)}}setOpeningNorth(e,t,n){e>=0&&e<this.width&&t>=0&&t<this.height&&(this.tiles[e][t].hasWallNorth=!0,this.tiles[e][t].openingNorth=n)}addFurniture(e,t,n){if(!o[e]||!this.canPlaceFurniture(e,t,n))return null;let r={instanceId:`furn_${Date.now()}_${Math.random().toString(36).substr(2,4)}`,furnitureId:e,gridX:t,gridY:n,rotation:0};return this.placedFurniture.push(r),r}removeFurniture(e){let t=this.placedFurniture.findIndex(t=>t.instanceId===e);return t!==-1&&(this.placedFurniture.splice(t,1),!0)}canPlaceFurniture(e,t,n){let r=o[e];if(!r||t<0||n<0||t+r.width>this.width||n+r.height>this.height)return!1;for(let e of this.placedFurniture){let i=o[e.furnitureId];if(!i)continue;let a=t<e.gridX+i.width&&t+r.width>e.gridX,s=n<e.gridY+i.height&&n+r.height>e.gridY;if(a&&s)return!1}return!0}isWalkable(e,t){if(e<0||t<0||e>=this.width||t>=this.height)return!1;for(let n of this.placedFurniture){let r=o[n.furnitureId];if(r&&e>=n.gridX&&e<n.gridX+r.width&&t>=n.gridY&&t<n.gridY+r.height)return!1}return!0}getFurnitureAt(e,t){for(let n of this.placedFurniture){let r=o[n.furnitureId];if(r&&e>=n.gridX&&e<n.gridX+r.width&&t>=n.gridY&&t<n.gridY+r.height)return n}return null}},c=class{x=0;y=0;zoom=1;minZoom=.6;maxZoom=2;targetX=0;targetY=0;targetZoom=1;pan(e,t){this.targetX+=e/this.zoom,this.targetY+=t/this.zoom}zoomBy(e){let t=Math.min(this.maxZoom,Math.max(this.minZoom,this.targetZoom*e));this.targetZoom=t}update(){this.x+=(this.targetX-this.x)*.15,this.y+=(this.targetY-this.y)*.15,this.zoom+=(this.targetZoom-this.zoom)*.15}},l=class{targetSimId;targetSimName;friendship=20;romance=0;constructor(e,t,n=25,i=0){this.targetSimId=e,this.targetSimName=r.sanitizeText(t,24),this.friendship=r.clamp(n,0,100),this.romance=r.clamp(i,0,100)}modifyFriendship(e){this.friendship=r.clamp(this.friendship+e,0,100)}modifyRomance(e){this.romance=r.clamp(this.romance+e,0,100)}getStatusTitle(){return this.friendship<=10?`Erzfeind`:this.romance>=75?`Feste(r) Partner(in)`:this.romance>=40?`Schwarm`:this.friendship>=80?`Beste(r) Freund(in)`:this.friendship>=50?`Gute(r) Freund(in)`:this.friendship>=20?`Bekannte(r)`:`Unbekannt`}},u=class{npcs=[];constructor(){this.spawnInitialTownies()}spawnInitialTownies(){[{id:`npc_mortimer`,name:`Mortimer Goth`,skinColor:`#f1c27d`,hairColor:`#1a1a1a`,outfitColor:`#8e44ad`,trait:`Aristokratisch`,pos:{x:2,y:5}},{id:`npc_penny`,name:`Penny Pizazz`,skinColor:`#e0ac69`,hairColor:`#e67e22`,outfitColor:`#e74c3c`,trait:`Party-Lover`,pos:{x:13,y:5}},{id:`npc_bob`,name:`Bob Pancakes`,skinColor:`#ffdbac`,hairColor:`#7f8c8d`,outfitColor:`#34495e`,trait:`Vielfraß`,pos:{x:2,y:12}},{id:`npc_eliza`,name:`Eliza Pancakes`,skinColor:`#f1c27d`,hairColor:`#d35400`,outfitColor:`#27ae60`,trait:`Perfektionistin`,pos:{x:13,y:12}}].forEach(e=>{this.npcs.push({id:e.id,name:r.sanitizeText(e.name,24),skinColor:e.skinColor,hairColor:e.hairColor,outfitColor:e.outfitColor,trait:e.trait,gridPos:e.pos,renderPos:{x:e.pos.x,y:e.pos.y},targetPath:[],relationship:new l(e.id,e.name,25,0)})})}update(e){let t=Date.now();this.npcs.forEach(n=>{if(n.activeEmote&&t>n.activeEmote.expiresAt&&(n.activeEmote=void 0),n.targetPath.length>0){let t=n.targetPath[0],r=2.5*e,i=t.x-n.renderPos.x,a=t.y-n.renderPos.y,o=Math.sqrt(i*i+a*a);o<=r?(n.renderPos.x=t.x,n.renderPos.y=t.y,n.gridPos={x:t.x,y:t.y},n.targetPath.shift()):(n.renderPos.x+=i/o*r,n.renderPos.y+=a/o*r)}else Math.random()<.002&&(n.targetPath=[{x:Math.floor(Math.random()*14)+1,y:Math.floor(Math.random()*14)+1}])})}triggerEmote(e,t,n=3e3){let r=this.npcs.find(t=>t.id===e);r&&(r.activeEmote={symbol:t,expiresAt:Date.now()+n})}getNPCAt(e,t){for(let n of this.npcs)if(Math.sqrt((n.gridPos.x-e)**2+(n.gridPos.y-t)**2)<1.2)return n;return null}},d=class{canvas;ctx;tileWidth=64;tileHeight=32;hoverGrid=null;constructor(e){this.canvas=e,this.ctx=e.getContext(`2d`)}setSize(e,t){this.canvas.width=e,this.canvas.height=t}gridToIso(e,t){return{x:(e-t)*(this.tileWidth/2),y:(e+t)*(this.tileHeight/2)}}screenToGrid(e,t,n){let r=e-this.canvas.width/2-n.x,i=t-(this.canvas.height/2-100)-n.y,a=r/n.zoom,o=i/n.zoom,s=(a/(this.tileWidth/2)+o/(this.tileHeight/2))/2,c=(o/(this.tileHeight/2)-a/(this.tileWidth/2))/2;return{x:Math.floor(s),y:Math.floor(c)}}render(e,t,n,r,i=12){let a=this.ctx;a.clearRect(0,0,this.canvas.width,this.canvas.height),a.save(),a.translate(this.canvas.width/2+r.x,this.canvas.height/2-100+r.y),a.scale(r.zoom,r.zoom);for(let t=0;t<e.width;t++)for(let n=0;n<e.height;n++){let r=e.tiles[t][n],i=this.gridToIso(t,n);this.drawTile(i.x,i.y,r),this.hoverGrid&&this.hoverGrid.x===t&&this.hoverGrid.y===n&&this.drawTileOverlay(i.x,i.y,`rgba(255, 255, 255, 0.4)`)}for(let t=0;t<e.width;t++)for(let n=0;n<e.height;n++){let r=e.tiles[t][n],i=this.gridToIso(t,n);r.hasWallNorth&&this.drawWallSegment(i.x,i.y,`north`,r.wallColor||`#2c3e50`,r.openingNorth),r.hasWallWest&&this.drawWallSegment(i.x,i.y,`west`,r.wallColor||`#2c3e50`,r.openingWest)}e.placedFurniture.forEach(e=>{let t=o[e.furnitureId];if(!t)return;let n=this.gridToIso(e.gridX,e.gridY);this.drawFurnitureBlock(n.x,n.y,t)}),n.npcs.forEach(e=>{let t=this.gridToIso(e.renderPos.x,e.renderPos.y);this.drawNPCSim(t.x,t.y,e)});let s=this.gridToIso(t.renderPos.x,t.renderPos.y),c=e.tiles[Math.floor(t.gridPos.x)]?.[Math.floor(t.gridPos.y)]?.type===`pool`;this.drawSim(s.x,s.y,t,c),a.restore(),this.renderLightingOverlay(i)}drawTile(e,t,n){let r=this.ctx,i=this.tileWidth/2,a=this.tileHeight/2;if(r.beginPath(),r.moveTo(e,t),r.lineTo(e+i,t+a),r.lineTo(e,t+this.tileHeight),r.lineTo(e-i,t+a),r.closePath(),n.type===`pool`){let t=Date.now()/400;r.fillStyle=`rgba(0, 180, 255, ${.75+Math.sin(t+e)*.1})`,r.fill(),r.strokeStyle=`#00e5ff`,r.lineWidth=1.5,r.stroke()}else r.fillStyle=n.color,r.fill(),r.strokeStyle=n.type===`grass`?`rgba(0,0,0,0.05)`:`rgba(0,0,0,0.15)`,r.lineWidth=1,r.stroke()}drawTileOverlay(e,t,n){let r=this.ctx,i=this.tileWidth/2,a=this.tileHeight/2;r.beginPath(),r.moveTo(e,t),r.lineTo(e+i,t+a),r.lineTo(e,t+this.tileHeight),r.lineTo(e-i,t+a),r.closePath(),r.fillStyle=n,r.fill()}drawWallSegment(e,t,n,r,i){let a=this.ctx,o=this.tileWidth/2,s=this.tileHeight/2;a.save(),n===`north`?(a.fillStyle=r,a.beginPath(),a.moveTo(e-o,t+s),a.lineTo(e,t),a.lineTo(e,t-45),a.lineTo(e-o,t+s-45),a.closePath(),a.fill(),a.strokeStyle=`rgba(0,0,0,0.3)`,a.stroke(),i===`door`?(a.fillStyle=`#8d5524`,a.fillRect(e-o+8,t+s-30,16,25),a.strokeRect(e-o+8,t+s-30,16,25)):i===`window`&&(a.fillStyle=`rgba(0, 229, 255, 0.4)`,a.fillRect(e-o+10,t+s-35,14,14),a.strokeRect(e-o+10,t+s-35,14,14))):(a.fillStyle=this.adjustColorBrightness(r,-25),a.beginPath(),a.moveTo(e,t),a.lineTo(e+o,t+s),a.lineTo(e+o,t+s-45),a.lineTo(e,t-45),a.closePath(),a.fill(),a.strokeStyle=`rgba(0,0,0,0.3)`,a.stroke(),i===`door`?(a.fillStyle=`#8d5524`,a.fillRect(e+8,t+s-30,16,25),a.strokeRect(e+8,t+s-30,16,25)):i===`window`&&(a.fillStyle=`rgba(0, 229, 255, 0.4)`,a.fillRect(e+10,t+s-35,14,14),a.strokeRect(e+10,t+s-35,14,14))),a.restore()}drawFurnitureBlock(e,t,n){let r=this.ctx,i=n.width*(this.tileWidth/2);r.fillStyle=n.color,r.beginPath(),r.moveTo(e,t-30),r.lineTo(e+i,t+i/2-30),r.lineTo(e,t+i-30),r.lineTo(e-i,t+i/2-30),r.closePath(),r.fill(),r.strokeStyle=`rgba(0,0,0,0.3)`,r.stroke(),r.fillStyle=this.adjustColorBrightness(n.color,-20),r.beginPath(),r.moveTo(e-i,t+i/2-30),r.lineTo(e,t+i-30),r.lineTo(e,t+i),r.lineTo(e-i,t+i/2),r.closePath(),r.fill(),r.stroke(),r.fillStyle=this.adjustColorBrightness(n.color,-40),r.beginPath(),r.moveTo(e,t+i-30),r.lineTo(e+i,t+i/2-30),r.lineTo(e+i,t+i/2),r.lineTo(e,t+i),r.closePath(),r.fill(),r.stroke(),r.fillStyle=`#ffffff`,r.font=`16px sans-serif`,r.textAlign=`center`,r.fillText(n.icon,e,t+i/2-30-5)}drawSim(e,t,n,r=!1){let a=this.ctx,o=n.getCurrentMood(),s=i.getInfo(n.lifeStage).renderScale,c=n.actionQueue.getCurrentAction(),l=c&&(c.name.includes(`tanzen`)||c.name.includes(`Dance`))?Math.sin(Date.now()/150)*4:0,u=r?10:l;a.save(),a.translate(e,t),a.scale(s,s),r||(a.beginPath(),a.ellipse(0,14,14,7,0,0,Math.PI*2),a.fillStyle=`rgba(0, 0, 0, 0.25)`,a.fill()),a.fillStyle=n.customization.outfitColor,a.fillRect(-8,-26+u,16,26-u),a.strokeStyle=`#111`,a.strokeRect(-8,-26+u,16,26-u),a.beginPath(),a.arc(0,-36+u,10,0,Math.PI*2),a.fillStyle=n.customization.skinColor,a.fill(),a.stroke(),a.beginPath(),a.arc(0,-40+u,10,Math.PI,Math.PI*2),a.fillStyle=n.customization.hairColor,a.fill();let d=-65+u+Math.sin(Date.now()/250)*4;if(this.drawPlumbob(0,d,o.plumbobColor),c){let e=c.elapsedSeconds/c.durationSeconds,t=-80+u;a.fillStyle=`rgba(0,0,0,0.6)`,a.fillRect(-22,t-2,44,10),a.fillStyle=`#2ecc71`,a.fillRect(-20,t,40*e,6)}a.restore()}drawNPCSim(e,t,n){let r=this.ctx;r.beginPath(),r.ellipse(e,t+14,12,6,0,0,Math.PI*2),r.fillStyle=`rgba(0, 0, 0, 0.2)`,r.fill(),r.fillStyle=n.outfitColor,r.fillRect(e-7,t-24,14,24),r.strokeStyle=`#222`,r.strokeRect(e-7,t-24,14,24),r.beginPath(),r.arc(e,t-33,9,0,Math.PI*2),r.fillStyle=n.skinColor,r.fill(),r.stroke(),r.beginPath(),r.arc(e,t-36,9,Math.PI,Math.PI*2),r.fillStyle=n.hairColor,r.fill(),r.fillStyle=`#ffffff`,r.font=`10px sans-serif`,r.textAlign=`center`,r.fillText(n.name,e,t-46),n.activeEmote&&this.drawEmoteBubble(e,t-60,n.activeEmote.symbol)}drawEmoteBubble(e,t,n){let r=this.ctx;r.save(),r.fillStyle=`#ffffff`,r.beginPath(),r.arc(e,t,14,0,Math.PI*2),r.fill(),r.strokeStyle=`#333333`,r.lineWidth=1.5,r.stroke(),r.font=`14px sans-serif`,r.textAlign=`center`,r.textBaseline=`middle`,r.fillText(n,e,t+1),r.restore()}drawPlumbob(e,t,n){let r=this.ctx;r.save(),r.fillStyle=n,r.shadowColor=n,r.shadowBlur=10,r.beginPath(),r.moveTo(e,t-16),r.lineTo(e+8,t),r.lineTo(e,t+2),r.lineTo(e-8,t),r.closePath(),r.fill(),r.fillStyle=this.adjustColorBrightness(n,-20),r.beginPath(),r.moveTo(e,t+2),r.lineTo(e+8,t),r.lineTo(e,t+16),r.lineTo(e-8,t),r.closePath(),r.fill(),r.restore()}renderLightingOverlay(e){let t=0;e>=22||e<=5?t=.45:e>5&&e<8?t=.45*(1-(e-5)/3):e>19&&e<22&&(t=.45*((e-19)/3)),t>0&&(this.ctx.fillStyle=`rgba(15, 25, 60, ${t})`,this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height))}adjustColorBrightness(e,t){let n=parseInt(e.replace(`#`,``),16);if(isNaN(n))return e;let r=(n>>16)+t,i=(n>>8&255)+t,a=(n&255)+t;return r=Math.min(255,Math.max(0,r)),i=Math.min(255,Math.max(0,i)),a=Math.min(255,Math.max(0,a)),`#${((1<<24)+(r<<16)+(i<<8)+a).toString(16).slice(1)}`}},f=class{ctx=null;isMuted=!1;masterGain=null;constructor(){}initContext(){if(this.ctx)this.ctx.state===`suspended`&&this.ctx.resume();else{let e=window.AudioContext||window.webkitAudioContext;this.ctx=new e,this.masterGain=this.ctx.createGain(),this.masterGain.gain.value=this.isMuted?0:.3,this.masterGain.connect(this.ctx.destination)}}toggleMute(){return this.isMuted=!this.isMuted,this.masterGain&&(this.masterGain.gain.value=this.isMuted?0:.3),this.isMuted}getMutedState(){return this.isMuted}playUIClick(){if(this.isMuted||(this.initContext(),!this.ctx||!this.masterGain))return;let e=this.ctx.createOscillator(),t=this.ctx.createGain();e.type=`sine`,e.frequency.setValueAtTime(440,this.ctx.currentTime),e.frequency.exponentialRampToValueAtTime(880,this.ctx.currentTime+.05),t.gain.setValueAtTime(.2,this.ctx.currentTime),t.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+.05),e.connect(t),t.connect(this.masterGain),e.start(),e.stop(this.ctx.currentTime+.05)}playSimlish(e=1,t=`happy`){if(this.isMuted||(this.initContext(),!this.ctx||!this.masterGain))return;let n=this.ctx.currentTime,r=Math.floor(Math.random()*3)+2,i=0,a=220*e;t===`happy`&&(a*=1.2),t===`flirty`&&(a*=1.1),t===`angry`&&(a*=.8),t===`tired`&&(a*=.7);for(let e=0;e<r;e++){let t=this.ctx.createOscillator(),r=this.ctx.createGain(),o=.08+Math.random()*.08,s=Math.random()*80-40;t.type=e%2==0?`triangle`:`sine`,t.frequency.setValueAtTime(a+s,n+i),t.frequency.linearRampToValueAtTime(a+s+(Math.random()*60-30),n+i+o),r.gain.setValueAtTime(.25,n+i),r.gain.exponentialRampToValueAtTime(.001,n+i+o),t.connect(r),r.connect(this.masterGain),t.start(n+i),t.stop(n+i+o),i+=o+.03}}playLevelUp(){if(this.isMuted||(this.initContext(),!this.ctx||!this.masterGain))return;let e=[261.63,329.63,392,523.25],t=this.ctx.currentTime;e.forEach((n,r)=>{if(!this.ctx||!this.masterGain)return;let i=this.ctx.createOscillator(),a=this.ctx.createGain();i.type=`triangle`,i.frequency.value=n;let o=t+r*.1,s=r===e.length-1?.4:.12;a.gain.setValueAtTime(.3,o),a.gain.exponentialRampToValueAtTime(.001,o+s),i.connect(a),a.connect(this.masterGain),i.start(o),i.stop(o+s)})}playBuySound(){if(this.isMuted||(this.initContext(),!this.ctx||!this.masterGain))return;let e=this.ctx.currentTime,t=this.ctx.createOscillator(),n=this.ctx.createGain();t.type=`square`,t.frequency.setValueAtTime(987.77,e),t.frequency.setValueAtTime(1318.51,e+.08),n.gain.setValueAtTime(.15,e),n.gain.exponentialRampToValueAtTime(.001,e+.25),t.connect(n),n.connect(this.masterGain),t.start(e),t.stop(e+.25)}},p=class{canvas;camera;renderer;soundManager;isDragging=!1;lastMousePos={x:0,y:0};onTileClick;onKeyboardSpeedToggle;onKeyboardPauseToggle;onEscapePressed;constructor(e,t,n,r){this.canvas=e,this.camera=t,this.renderer=n,this.soundManager=r,this.attachEventListeners()}attachEventListeners(){this.canvas.addEventListener(`mousemove`,e=>{let t=this.canvas.getBoundingClientRect(),n=e.clientX-t.left,r=e.clientY-t.top;if(this.isDragging){let e=n-this.lastMousePos.x,t=r-this.lastMousePos.y;this.camera.pan(e,t),this.lastMousePos={x:n,y:r}}else{let e=this.renderer.screenToGrid(n,r,this.camera);this.renderer.hoverGrid=e}}),this.canvas.addEventListener(`mousedown`,e=>{if(e.button===0||e.button===1){this.isDragging=!0;let t=this.canvas.getBoundingClientRect();this.lastMousePos={x:e.clientX-t.left,y:e.clientY-t.top}}}),this.canvas.addEventListener(`mouseup`,e=>{this.isDragging&&=!1;let t=this.canvas.getBoundingClientRect(),n=e.clientX-t.left,r=e.clientY-t.top,i=this.renderer.screenToGrid(n,r,this.camera);i&&this.onTileClick&&(this.soundManager.playUIClick(),this.onTileClick(i.x,i.y))}),this.canvas.addEventListener(`wheel`,e=>{e.preventDefault();let t=e.deltaY<0?1.15:.85;this.camera.zoomBy(t)},{passive:!1}),window.addEventListener(`keydown`,e=>{if(![`INPUT`,`TEXTAREA`,`SELECT`].includes(e.target.tagName))switch(e.key){case`ArrowUp`:case`w`:case`W`:this.camera.pan(0,30);break;case`ArrowDown`:case`s`:case`S`:this.camera.pan(0,-30);break;case`ArrowLeft`:case`a`:case`A`:this.camera.pan(30,0);break;case`ArrowRight`:case`d`:case`D`:this.camera.pan(-30,0);break;case` `:e.preventDefault(),this.onKeyboardPauseToggle&&this.onKeyboardPauseToggle();break;case`1`:this.onKeyboardSpeedToggle&&this.onKeyboardSpeedToggle(1);break;case`2`:this.onKeyboardSpeedToggle&&this.onKeyboardSpeedToggle(2);break;case`3`:this.onKeyboardSpeedToggle&&this.onKeyboardSpeedToggle(3);break;case`Escape`:this.onEscapePressed&&this.onEscapePressed()}})}},m=class e{ctx=null;masterGain=null;isPlayingRadio=!1;activeStation=`pop`;timerId=null;static STATIONS={pop:{id:`pop`,name:`Simlish Pop Hits`,genre:`Pop`,icon:`🎷`,bpm:120},retro:{id:`retro`,name:`80s Synthwave Radio`,genre:`Synthwave`,icon:`📻`,bpm:110},lofi:{id:`lofi`,name:`Lo-Fi Chillbeats`,genre:`Chillout`,icon:`🎧`,bpm:75},electro:{id:`electro`,name:`Electro & Dance Zone`,genre:`Electronic`,icon:`⚡`,bpm:135}};initContext(){if(this.ctx)this.ctx.state===`suspended`&&this.ctx.resume();else{let e=window.AudioContext||window.webkitAudioContext;this.ctx=new e,this.masterGain=this.ctx.createGain(),this.masterGain.gain.value=.2,this.masterGain.connect(this.ctx.destination)}}playStation(t){this.initContext(),this.activeStation=t,this.isPlayingRadio=!0,this.timerId&&window.clearInterval(this.timerId);let n=60/e.STATIONS[t].bpm*500,r=0;this.timerId=window.setInterval(()=>{this.synthesizeBeatStep(t,r),r=(r+1)%16},n)}stopRadio(){this.isPlayingRadio=!1,this.timerId&&=(window.clearInterval(this.timerId),null)}toggleRadio(){return this.isPlayingRadio?(this.stopRadio(),!1):(this.playStation(this.activeStation),!0)}cycleNextStation(){let t=[`pop`,`retro`,`lofi`,`electro`],n=t[(t.indexOf(this.activeStation)+1)%t.length];return this.isPlayingRadio?this.playStation(n):this.activeStation=n,e.STATIONS[n]}getActiveStationInfo(){return e.STATIONS[this.activeStation]}getIsPlaying(){return this.isPlayingRadio}synthesizeBeatStep(e,t){if(!this.ctx||!this.masterGain||!this.isPlayingRadio)return;let n=this.ctx.currentTime;if(t%4==0||e===`electro`&&t%2==0){let r=this.ctx.createOscillator(),i=this.ctx.createGain();r.type=e===`retro`?`sawtooth`:`sine`;let a=110;t===4&&(a=130.81),t===8&&(a=146.83),t===12&&(a=98),r.frequency.setValueAtTime(a,n),i.gain.setValueAtTime(.2,n),i.gain.exponentialRampToValueAtTime(.001,n+.15),r.connect(i),i.connect(this.masterGain),r.start(n),r.stop(n+.15)}if(t%2==0||e===`pop`||e===`electro`){let r=[261.63,329.63,392,523.25,440,349.23],i=r[(t*3+e.length)%r.length],a=this.ctx.createOscillator(),o=this.ctx.createGain();a.type=e===`lofi`?`sine`:`triangle`,a.frequency.setValueAtTime(i,n),o.gain.setValueAtTime(.12,n),o.gain.exponentialRampToValueAtTime(.001,n+.12),a.connect(o),o.connect(this.masterGain),a.start(n),a.stop(n+.12)}}},h=class{hour=8;minute=0;day=1;speedMultiplier=1;isPaused=!1;update(e){if(this.isPaused||this.speedMultiplier===0)return{deltaMinutes:0,timeString:this.getTimeString(),dayString:`Tag ${this.day}`};let t=e*this.speedMultiplier*1;return this.minute+=t,this.minute>=60&&(this.hour+=Math.floor(this.minute/60),this.minute%=60),this.hour>=24&&(this.day+=Math.floor(this.hour/24),this.hour%=24),{deltaMinutes:t,timeString:this.getTimeString(),dayString:`Tag ${this.day}`}}setSpeed(e){e===0?this.isPaused=!0:(this.isPaused=!1,this.speedMultiplier=Math.min(3,Math.max(1,e)))}togglePause(){return this.isPaused=!this.isPaused,this.isPaused}getTimeString(){return`${Math.floor(this.hour).toString().padStart(2,`0`)}:${Math.floor(this.minute).toString().padStart(2,`0`)}`}getPausedState(){return this.isPaused}},g={tech_guru:{id:`tech_guru`,title:`Tech Guru & Software Dev`,icon:`💻`,levels:[{rank:1,jobTitle:`QA Tester`,salaryPerDay:180,requiredSkill:{skill:`programming`,level:1}},{rank:2,jobTitle:`Junior Developer`,salaryPerDay:350,requiredSkill:{skill:`programming`,level:2}},{rank:3,jobTitle:`Lead Software Architect`,salaryPerDay:750,requiredSkill:{skill:`programming`,level:4}},{rank:4,jobTitle:`CTO & Tech Startup Founder`,salaryPerDay:1500,requiredSkill:{skill:`programming`,level:6}}]},master_chef:{id:`master_chef`,title:`Gourmet Chef`,icon:`🍳`,levels:[{rank:1,jobTitle:`Tellerwäscher`,salaryPerDay:150,requiredSkill:{skill:`cooking`,level:1}},{rank:2,jobTitle:`Sous Chef`,salaryPerDay:320,requiredSkill:{skill:`cooking`,level:2}},{rank:3,jobTitle:`Chef de Cuisine`,salaryPerDay:680,requiredSkill:{skill:`cooking`,level:4}},{rank:4,jobTitle:`3-Sterne Sternekoch`,salaryPerDay:1400,requiredSkill:{skill:`cooking`,level:6}}]},artist:{id:`artist`,title:`Freiberuflicher Künstler`,icon:`🎨`,levels:[{rank:1,jobTitle:`Straßenmaler`,salaryPerDay:140,requiredSkill:{skill:`painting`,level:1}},{rank:2,jobTitle:`Galerie-Aussteller`,salaryPerDay:300,requiredSkill:{skill:`painting`,level:2}},{rank:3,jobTitle:`Renommierter Meistermaler`,salaryPerDay:700,requiredSkill:{skill:`painting`,level:4}}]}},_=class{currentCareerId=`tech_guru`;currentRank=1;getCareerInfo(){let e=g[this.currentCareerId],t=e.levels.find(e=>e.rank===this.currentRank)||e.levels[0],n=e.levels.find(e=>e.rank===this.currentRank+1);return{careerTitle:e.title,icon:e.icon,jobTitle:t.jobTitle,salary:t.salaryPerDay,nextLevel:n}}checkPromotion(e){let t=g[this.currentCareerId].levels.find(e=>e.rank===this.currentRank+1);if(!t)return{promoted:!1};let n=t.requiredSkill;return Math.floor(e.skills[n.skill])>=n.level?(this.currentRank++,{promoted:!0,newJobTitle:t.jobTitle}):{promoted:!1}}payoutDailySalary(e){let t=this.getCareerInfo();return e.simoleons+=t.salary,t.salary}},v=class{quests=[];constructor(){this.generateDailyQuests()}generateDailyQuests(){this.quests=[{id:`q_cook`,title:`Meisterkoch in Ausbildung`,description:`Bereite eine Mahlzeit am Kühlschrank zu.`,rewardSimoleons:150,completed:!1,progress:0,targetProgress:1},{id:`q_code`,title:`Digitale Zukunft`,description:`Verbringe Zeit am PC und lerne Programmieren.`,rewardSimoleons:200,completed:!1,progress:0,targetProgress:1},{id:`q_sleep`,title:`Guter Schlaf`,description:`Schlafe im gemütlichen Bett, um Energie aufzuladen.`,rewardSimoleons:100,completed:!1,progress:0,targetProgress:1}]}getQuests(){return[...this.quests]}triggerQuestProgress(e){let t=this.quests.find(t=>t.id===e&&!t.completed);return t&&(t.progress++,t.progress>=t.targetProgress)?(t.completed=!0,t):null}},y=class{static SAVE_KEY=`sims_game_save_v1`;static saveGame(e,t,n,r,i){try{let a={version:`1.0.0`,timestamp:Date.now(),sim:{customization:e.customization,gridPos:e.gridPos,needs:e.needs.getValues(),simoleons:e.simoleons,skills:e.skills,lifeStage:e.lifeStage,ageDays:e.ageDays,partnerName:e.partnerName,childrenNames:e.childrenNames},house:{placedFurniture:t.placedFurniture,tiles:t.tiles.map(e=>e.map(e=>({type:e.type,color:e.color,hasWallNorth:e.hasWallNorth,hasWallWest:e.hasWallWest,wallColor:e.wallColor,openingNorth:e.openingNorth,openingWest:e.openingWest})))},career:{careerId:n.currentCareerId,rank:n.currentRank},relationships:r?.npcs.map(e=>({targetSimId:e.id,targetSimName:e.name,friendship:e.relationship.friendship,romance:e.relationship.romance})),trophiesUnlocked:i?.trophiesUnlocked},o=JSON.stringify(a);return localStorage.setItem(this.SAVE_KEY,o),!0}catch(e){return console.error(`[SaveManager] Error saving game:`,e),!1}}static loadGame(e,t,n,i,a){try{let o=localStorage.getItem(this.SAVE_KEY);if(!o)return!1;let s=r.safeJSONParse(o,null);return!s||!s.sim||!s.house?!1:(e.customization={name:r.sanitizeText(s.sim.customization.name,24),gender:s.sim.customization.gender,skinColor:s.sim.customization.skinColor,hairColor:s.sim.customization.hairColor,outfitColor:s.sim.customization.outfitColor,trait:r.sanitizeText(s.sim.customization.trait,30),aspiration:r.sanitizeText(s.sim.customization.aspiration,30)},e.gridPos=s.sim.gridPos||{x:5,y:5},e.renderPos={x:e.gridPos.x,y:e.gridPos.y},e.simoleons=r.clamp(s.sim.simoleons,0,999999),s.sim.needs&&Object.entries(s.sim.needs).forEach(([t,n])=>{e.needs.modify(t,n-e.needs.getValues()[t])}),s.sim.skills&&(e.skills=s.sim.skills),s.sim.lifeStage&&(e.lifeStage=s.sim.lifeStage),typeof s.sim.ageDays==`number`&&(e.ageDays=s.sim.ageDays),s.sim.partnerName&&(e.partnerName=r.sanitizeText(s.sim.partnerName,24)),Array.isArray(s.sim.childrenNames)&&(e.childrenNames=s.sim.childrenNames.map(e=>r.sanitizeText(e,24))),Array.isArray(s.house.placedFurniture)&&(t.placedFurniture=s.house.placedFurniture),Array.isArray(s.house.tiles)&&s.house.tiles.forEach((e,n)=>{Array.isArray(e)&&e.forEach((e,r)=>{t.tiles[n]&&t.tiles[n][r]&&(t.tiles[n][r].type=e.type||`grass`,t.tiles[n][r].color=e.color||`#27ae60`,t.tiles[n][r].hasWallNorth=e.hasWallNorth,t.tiles[n][r].hasWallWest=e.hasWallWest,t.tiles[n][r].wallColor=e.wallColor,t.tiles[n][r].openingNorth=e.openingNorth,t.tiles[n][r].openingWest=e.openingWest)})}),s.career&&(n.currentCareerId=s.career.careerId||`tech_guru`,n.currentRank=s.career.rank||1),s.relationships&&i&&s.relationships.forEach(e=>{let t=i.npcs.find(t=>t.id===e.targetSimId);t&&(t.relationship.friendship=r.clamp(e.friendship,0,100),t.relationship.romance=r.clamp(e.romance,0,100))}),Array.isArray(s.trophiesUnlocked)&&a&&(a.trophiesUnlocked=s.trophiesUnlocked),!0)}catch(e){return console.error(`[SaveManager] Error loading game:`,e),!1}}static exportSaveFile(){return localStorage.getItem(this.SAVE_KEY)||``}},b=class{static findPath(e,t,n,r,i){let a=t;if(!i(t.x,t.y)){let e=this.getNeighbors(t,n,r).filter(e=>i(e.x,e.y));if(e.length>0)a=e[0];else return[]}let o=[],s=new Set,c={x:e.x,y:e.y,g:0,h:this.heuristic(e,a),f:0,parent:null};for(c.f=c.g+c.h,o.push(c);o.length>0;){o.sort((e,t)=>e.f-t.f);let e=o.shift();if(e.x===a.x&&e.y===a.y){let t=[],n=e;for(;n;)t.unshift({x:n.x,y:n.y}),n=n.parent;return t}s.add(`${e.x},${e.y}`);let t=this.getNeighbors({x:e.x,y:e.y},n,r);for(let n of t){if(s.has(`${n.x},${n.y}`)||!i(n.x,n.y)&&(n.x!==a.x||n.y!==a.y))continue;let t=e.g+1,r=o.find(e=>e.x===n.x&&e.y===n.y);r?t<r.g&&(r.g=t,r.f=r.g+r.h,r.parent=e):(r={x:n.x,y:n.y,g:t,h:this.heuristic(n,a),f:0,parent:e},r.f=r.g+r.h,o.push(r))}}return[]}static heuristic(e,t){return Math.abs(e.x-t.x)+Math.abs(e.y-t.y)}static getNeighbors(e,t,n){let r=[];return[{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0}].forEach(i=>{let a=e.x+i.x,o=e.y+i.y;a>=0&&a<t&&o>=0&&o<n&&r.push({x:a,y:o})}),r}},x=class{container;soundManager;onOpenCAS;onOpenBuildBuy;onOpenCareer;onOpenRelationships;onOpenFamilyTree;onOpenParty;onOpenPrivacy;onToggleRadio;onSpeedChange;onTogglePause;onSaveGame;constructor(e,t){this.container=e,this.soundManager=t,this.renderBaseHTML(),this.attachEvents()}renderBaseHTML(){this.container.innerHTML=`
      <div class="hud-container">
        <!-- Top Bar -->
        <header class="top-bar glass-panel hud-interactive" role="banner">
          <div class="brand-title">
            <span>💎 SIMS 5</span>
          </div>

          <div class="time-controls" role="toolbar" aria-label="Zeitsteuerung">
            <span class="clock-display" id="hud-clock" aria-live="off">08:00 (Tag 1)</span>
            <button class="btn-speed" id="btn-pause" aria-label="Spiel pausieren (Leertaste)">⏸️</button>
            <button class="btn-speed active" id="btn-speed1" aria-label="Normale Geschwindigkeit (1)">▶</button>
            <button class="btn-speed" id="btn-speed2" aria-label="Doppelte Geschwindigkeit (2)">▶▶</button>
            <button class="btn-speed" id="btn-speed3" aria-label="Dreifache Geschwindigkeit (3)">▶▶▶</button>
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="currency-badge" id="hud-simoleons" aria-label="Guthaben in Simoleons">
              § 2,500
            </div>
            <button class="btn-hud" id="btn-radio-toggle" aria-label="Radio Sender umschalten">📻 Radio: Aus</button>
            <button class="btn-hud" id="btn-sound-toggle" aria-label="Ton umschalten">🔊 Sound</button>
            <button class="btn-hud" id="btn-save" aria-label="Spielstand speichern">💾 Speichern</button>
            <button class="btn-hud" id="btn-privacy" aria-label="Datenschutz & DSGVO">🛡️ DSGVO</button>
          </div>
        </header>

        <!-- Bottom Bar -->
        <footer class="bottom-bar hud-interactive" role="contentinfo">
          <!-- Sim Profile & Plumbob Mood -->
          <div class="sim-profile-card glass-panel" id="hud-sim-profile">
            <div class="plumbob-icon" id="hud-plumbob-badge" style="color: #2ecc71; background: rgba(46,204,113,0.2)">
              💎
            </div>
            <div class="sim-info">
              <h3 id="hud-sim-name">Bella Goth</h3>
              <p id="hud-sim-mood">Stimmung: Glücklich</p>
            </div>
            <button class="btn-hud" id="btn-open-cas" aria-label="Create-A-Sim Editor öffnen">✏️ Edit</button>
          </div>

          <!-- Action Queue Bar -->
          <div class="action-queue-bar glass-panel" id="hud-action-queue" aria-label="Aktionsschlange">
            <div class="action-item-chip">Bereit</div>
          </div>

          <!-- Needs Grid -->
          <div class="needs-grid glass-panel" id="hud-needs-grid" aria-label="Bedürfnisbalken">
            <!-- Dynamically populated -->
          </div>

          <!-- Main Mode Buttons -->
          <div class="hud-actions">
            <button class="btn-hud" id="btn-open-build" aria-label="Bauen & Kaufen Modus">🛋️ Baumodus</button>
            <button class="btn-hud" id="btn-open-career" aria-label="Karriere & Aufgaben Panel">💼 Karriere</button>
            <button class="btn-hud" id="btn-open-rel" aria-label="Beziehungen & Nachbarn Panel">💕 Beziehungen</button>
            <button class="btn-hud" id="btn-open-family" aria-label="Familienstammbaum Panel">👨‍👩‍👧‍👦 Stammbaum</button>
            <button class="btn-hud" id="btn-open-party" aria-label="Hausparty Veranstalten">🎉 Party Host</button>
          </div>
        </footer>
      </div>
    `}attachEvents(){document.getElementById(`btn-open-cas`)?.addEventListener(`click`,()=>{this.soundManager.playUIClick(),this.onOpenCAS&&this.onOpenCAS()}),document.getElementById(`btn-open-build`)?.addEventListener(`click`,()=>{this.soundManager.playUIClick(),this.onOpenBuildBuy&&this.onOpenBuildBuy()}),document.getElementById(`btn-open-career`)?.addEventListener(`click`,()=>{this.soundManager.playUIClick(),this.onOpenCareer&&this.onOpenCareer()}),document.getElementById(`btn-open-rel`)?.addEventListener(`click`,()=>{this.soundManager.playUIClick(),this.onOpenRelationships&&this.onOpenRelationships()}),document.getElementById(`btn-open-family`)?.addEventListener(`click`,()=>{this.soundManager.playUIClick(),this.onOpenFamilyTree&&this.onOpenFamilyTree()}),document.getElementById(`btn-open-party`)?.addEventListener(`click`,()=>{this.soundManager.playUIClick(),this.onOpenParty&&this.onOpenParty()}),document.getElementById(`btn-privacy`)?.addEventListener(`click`,()=>{this.soundManager.playUIClick(),this.onOpenPrivacy&&this.onOpenPrivacy()}),document.getElementById(`btn-save`)?.addEventListener(`click`,()=>{this.soundManager.playUIClick(),this.onSaveGame&&this.onSaveGame()}),document.getElementById(`btn-radio-toggle`)?.addEventListener(`click`,()=>{this.soundManager.playUIClick(),this.onToggleRadio&&this.onToggleRadio()}),document.getElementById(`btn-sound-toggle`)?.addEventListener(`click`,e=>{let t=this.soundManager.toggleMute();e.currentTarget.innerText=t?`🔇 Stumm`:`🔊 Sound`}),document.getElementById(`btn-pause`)?.addEventListener(`click`,()=>{this.soundManager.playUIClick(),this.onTogglePause&&this.onTogglePause()});let e=e=>{this.soundManager.playUIClick(),this.onSpeedChange&&this.onSpeedChange(e)};document.getElementById(`btn-speed1`)?.addEventListener(`click`,()=>e(1)),document.getElementById(`btn-speed2`)?.addEventListener(`click`,()=>e(2)),document.getElementById(`btn-speed3`)?.addEventListener(`click`,()=>e(3))}update(e,t){let n=document.getElementById(`hud-clock`);n&&(n.innerText=`${t.getTimeString()} (Tag ${t.day})`);let a=document.getElementById(`hud-simoleons`);a&&(a.innerText=`§ ${e.simoleons.toLocaleString()}`);let o=e.getCurrentMood(),s=i.getInfo(e.lifeStage),c=document.getElementById(`hud-sim-name`);c&&(c.innerText=`${s.icon} ${r.sanitizeText(e.customization.name,24)}`);let l=document.getElementById(`hud-sim-mood`);l&&(l.innerText=`Stimmung: ${o.label}`);let u=document.getElementById(`hud-plumbob-badge`);u&&(u.style.color=o.plumbobColor,u.style.background=`${o.plumbobColor}22`);let d=document.getElementById(`hud-needs-grid`);if(d){let t=e.needs.getValues(),n={hunger:`Hunger`,energy:`Energie`,hygiene:`Hygiene`,bladder:`Blase`,fun:`Spaß`,social:`Sozial`};d.innerHTML=Object.entries(t).map(([e,t])=>`
        <div class="need-bar-item">
          <div class="need-label">
            <span>${n[e]||e}</span>
            <span>${Math.round(t)}%</span>
          </div>
          <div class="need-progress-bg">
            <div class="need-progress-fill" style="width: ${t}%;"></div>
          </div>
        </div>
      `).join(``)}let f=document.getElementById(`hud-action-queue`);if(f){let t=e.actionQueue.getQueue();f.innerHTML=t.length===0?`<div class="action-item-chip">Bereit</div>`:t.map(e=>`
          <div class="action-item-chip">
            <span>${e.icon}</span>
            <span>${r.sanitizeText(e.name,16)}</span>
          </div>
        `).join(``)}}},S=class{container;soundManager;onSimUpdated;constructor(e,t){this.container=e,this.soundManager=t,this.renderBaseHTML()}renderBaseHTML(){this.container.innerHTML=`
      <div class="modal-backdrop" id="modal-cas-backdrop" role="dialog" aria-modal="true" aria-labelledby="cas-title">
        <div class="modal-dialog glass-panel">
          <div class="modal-header">
            <h2 id="cas-title">✨ Create-A-Sim Editor (CAS)</h2>
            <button class="btn-close" id="cas-btn-close" aria-label="Schließen">&times;</button>
          </div>

          <form id="cas-form" style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label for="cas-name" style="display: block; margin-bottom: 6px; font-weight: 600;">Sim Name</label>
              <input type="text" id="cas-name" maxlength="24" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--panel-border); background: rgba(0,0,0,0.4); color: white;" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label for="cas-gender" style="display: block; margin-bottom: 6px; font-weight: 600;">Geschlecht</label>
                <select id="cas-gender" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--panel-border); background: rgba(0,0,0,0.4); color: white;">
                  <option value="female">Weiblich</option>
                  <option value="male">Männlich</option>
                  <option value="non-binary">Divers / Non-Binär</option>
                </select>
              </div>

              <div>
                <label for="cas-trait" style="display: block; margin-bottom: 6px; font-weight: 600;">Hauptmerkmal</label>
                <select id="cas-trait" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--panel-border); background: rgba(0,0,0,0.4); color: white;">
                  <option value="Genial">Genial (Lerne-Bonus)</option>
                  <option value="Kreativ">Kreativ (Malen & Spaß)</option>
                  <option value="Romantisch">Romantisch (Sozial-Bonus)</option>
                  <option value="Aktiv">Aktiv (Fitness)</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
              <div>
                <label for="cas-skin" style="display: block; margin-bottom: 6px; font-size: 0.85rem;">Hautfarbe</label>
                <input type="color" id="cas-skin" value="#f1c27d" style="width: 100%; height: 40px; border-radius: 6px; border: none; cursor: pointer;" />
              </div>
              <div>
                <label for="cas-hair" style="display: block; margin-bottom: 6px; font-size: 0.85rem;">Haarfarbe</label>
                <input type="color" id="cas-hair" value="#2c3e50" style="width: 100%; height: 40px; border-radius: 6px; border: none; cursor: pointer;" />
              </div>
              <div>
                <label for="cas-outfit" style="display: block; margin-bottom: 6px; font-size: 0.85rem;">Outfit-Farbe</label>
                <input type="color" id="cas-outfit" value="#e74c3c" style="width: 100%; height: 40px; border-radius: 6px; border: none; cursor: pointer;" />
              </div>
            </div>

            <button type="submit" class="btn-hud" style="margin-top: 12px; justify-content: center; background: var(--simoleon-green);">
              💾 Sim Speichern & Übernehmen
            </button>
          </form>
        </div>
      </div>
    `}open(e){let t=document.getElementById(`modal-cas-backdrop`);if(!t)return;document.getElementById(`cas-name`).value=e.customization.name,document.getElementById(`cas-gender`).value=e.customization.gender,document.getElementById(`cas-trait`).value=e.customization.trait,document.getElementById(`cas-skin`).value=e.customization.skinColor,document.getElementById(`cas-hair`).value=e.customization.hairColor,document.getElementById(`cas-outfit`).value=e.customization.outfitColor,t.classList.add(`active`);let n=document.getElementById(`cas-form`);n.onsubmit=t=>{t.preventDefault(),this.soundManager.playLevelUp(),e.customization.name=r.sanitizeText(document.getElementById(`cas-name`).value,24),e.customization.gender=document.getElementById(`cas-gender`).value,e.customization.trait=r.sanitizeText(document.getElementById(`cas-trait`).value,30),e.customization.skinColor=document.getElementById(`cas-skin`).value,e.customization.hairColor=document.getElementById(`cas-hair`).value,e.customization.outfitColor=document.getElementById(`cas-outfit`).value,this.soundManager.playSimlish(1.2,`happy`),this.close(),this.onSimUpdated&&this.onSimUpdated(e)},document.getElementById(`cas-btn-close`)?.addEventListener(`click`,()=>this.close())}close(){let e=document.getElementById(`modal-cas-backdrop`);e&&e.classList.remove(`active`)}},C=class{container;soundManager;activeToolMode=`select`;activeFloorType=`wood`;activeFloorColor=`#8d5524`;constructor(e,t){this.container=e,this.soundManager=t,this.renderBaseHTML()}renderBaseHTML(){this.container.innerHTML=`
      <div class="modal-backdrop" id="modal-build-backdrop" role="dialog" aria-modal="true" aria-labelledby="build-title">
        <div class="modal-dialog glass-panel" style="max-width: 800px;">
          <div class="modal-header">
            <h2 id="build-title">🛋️ Architekt & Baumodus</h2>
            <button class="btn-close" id="build-btn-close" aria-label="Schließen">&times;</button>
          </div>

          <!-- Tab Navigation Bar -->
          <div style="display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; padding-bottom: 4px;">
            <button class="btn-hud build-tab-btn active" data-tab="furniture">🛋️ Möbel</button>
            <button class="btn-hud build-tab-btn" data-tab="walls">🧱 Wände</button>
            <button class="btn-hud build-tab-btn" data-tab="openings">🚪 Türen & Fenster</button>
            <button class="btn-hud build-tab-btn" data-tab="floors">🎨 Bodenbeläge</button>
            <button class="btn-hud build-tab-btn" data-tab="pools">🏊 Outdoor & Pool</button>
          </div>

          <!-- Content Area -->
          <div id="build-tab-content" style="max-height: 55vh; overflow-y: auto;">
            <!-- Dynamically populated per tab -->
          </div>
        </div>
      </div>
    `}open(e,t){let n=document.getElementById(`modal-build-backdrop`);if(!n)return;n.classList.add(`active`);let r=document.querySelectorAll(`.build-tab-btn`);r.forEach(n=>{n.addEventListener(`click`,n=>{r.forEach(e=>e.classList.remove(`active`)),n.currentTarget.classList.add(`active`);let i=n.currentTarget.getAttribute(`data-tab`);this.renderTabContent(e,t,i)})}),this.renderTabContent(e,t,`furniture`),document.getElementById(`build-btn-close`)?.addEventListener(`click`,()=>this.close())}renderTabContent(e,t,n){let r=document.getElementById(`build-tab-content`);r&&(n===`furniture`?(r.innerHTML=`
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px;">
          ${Object.values(o).map(t=>{let n=e.simoleons>=t.price;return`
              <div class="glass-panel" style="padding: 14px; display: flex; flex-direction: column; justify-content: space-between; border-color: ${n?`var(--panel-border)`:`rgba(231,76,60,0.3)`};">
                <div>
                  <div style="font-size: 2rem; text-align: center; margin-bottom: 8px;">${t.icon}</div>
                  <h4 style="font-family: var(--font-heading); font-size: 1rem;">${t.name}</h4>
                  <p style="font-size: 0.8rem; color: var(--text-muted); margin: 4px 0 8px 0;">${t.description}</p>
                </div>
                <div>
                  <div style="font-family: var(--font-heading); font-weight: 700; color: ${n?`var(--simoleon-green)`:`var(--warning-red)`}; margin-bottom: 8px;">
                    § ${t.price.toLocaleString()}
                  </div>
                  <button class="btn-hud buy-item-btn" data-id="${t.id}" ${n?``:`disabled`} style="width: 100%; justify-content: center; font-size: 0.85rem;">
                    ${n?`🛒 Kaufen & Platzieren`:`Zu teuer`}
                  </button>
                </div>
              </div>
            `}).join(``)}
        </div>
      `,r.querySelectorAll(`.buy-item-btn`).forEach(n=>{n.addEventListener(`click`,n=>{let r=n.currentTarget.getAttribute(`data-id`);if(!r)return;let i=o[r];e.simoleons>=i.price&&(e.simoleons-=i.price,this.soundManager.playBuySound(),t.addFurniture(r,6,6),this.close())})})):n===`walls`?(r.innerHTML=`
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <p style="font-size: 0.9rem; color: var(--text-muted);">Aktiviere das Wand-Werkzeug und klicke auf Kacheln auf dem Spielfeld, um Wände zu bauen oder abzureißen (§ 100 pro Wand segment).</p>
          <div style="display: flex; gap: 12px;">
            <button class="btn-hud ${this.activeToolMode===`wall`?`active`:``}" id="btn-tool-wall" style="flex: 1; justify-content: center;">
              🧱 Wand-Werkzeug Aktivieren (§ 100)
            </button>
          </div>
        </div>
      `,document.getElementById(`btn-tool-wall`)?.addEventListener(`click`,()=>{this.activeToolMode=`wall`,this.soundManager.playUIClick(),alert(`🧱 Wand-Werkzeug aktiviert! Klicke auf ein Rasterfeld im Spiel, um Wände zu setzen.`),this.close()})):n===`openings`?(r.innerHTML=`
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <p style="font-size: 0.9rem; color: var(--text-muted);">Wähle ein Element und klicke auf ein Feld mit Wand, um eine Tür oder ein Fenster einzusetzen.</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <button class="btn-hud" id="btn-tool-door" style="justify-content: center;">
              🚪 Holztür einsetzen (§ 200)
            </button>
            <button class="btn-hud" id="btn-tool-window" style="justify-content: center;">
              🪟 Panoramafenster einsetzen (§ 250)
            </button>
          </div>
        </div>
      `,document.getElementById(`btn-tool-door`)?.addEventListener(`click`,()=>{this.activeToolMode=`door`,this.soundManager.playUIClick(),alert(`🚪 Tür-Werkzeug aktiviert! Klicke auf ein Feld mit Wand, um eine Tür einzusetzen.`),this.close()}),document.getElementById(`btn-tool-window`)?.addEventListener(`click`,()=>{this.activeToolMode=`window`,this.soundManager.playUIClick(),alert(`🪟 Fenster-Werkzeug aktiviert! Klicke auf ein Feld mit Wand, um ein Fenster einzusetzen.`),this.close()})):n===`floors`?(r.innerHTML=`
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <p style="font-size: 0.9rem; color: var(--text-muted);">Wähle einen Bodenbelag und klicke im Haus auf Felder, um den Boden neu zu gestalten (§ 50 pro Feld).</p>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
            <button class="btn-hud set-floor-btn" data-type="wood" data-color="#8d5524">🪵 Parkett</button>
            <button class="btn-hud set-floor-btn" data-type="marble" data-color="#ecf0f1">🏛️ Edelmarmor</button>
            <button class="btn-hud set-floor-btn" data-type="tile" data-color="#95a5a6">🔳 Fliesen</button>
            <button class="btn-hud set-floor-btn" data-type="carpet" data-color="#8e44ad">🟣 Teppich</button>
          </div>
        </div>
      `,r.querySelectorAll(`.set-floor-btn`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.currentTarget.getAttribute(`data-type`),n=e.currentTarget.getAttribute(`data-color`)||`#8d5524`;this.activeToolMode=`floor`,this.activeFloorType=t,this.activeFloorColor=n,this.soundManager.playUIClick(),alert(`🎨 Boden-Werkzeug (${t.toUpperCase()}) aktiviert! Klicke auf Felder im Haus.`),this.close()})})):n===`pools`&&(r.innerHTML=`
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <p style="font-size: 0.9rem; color: var(--text-muted);">Erstelle einen erfrischenden Swimmingpool auf dem Grundstück (§ 300 pro Pool-Feld).</p>
          <div style="display: flex; gap: 12px;">
            <button class="btn-hud" id="btn-tool-pool" style="flex: 1; justify-content: center; background: #3498db;">
              🏊 Swimmingpool ausheben (§ 300)
            </button>
          </div>
        </div>
      `,document.getElementById(`btn-tool-pool`)?.addEventListener(`click`,()=>{this.activeToolMode=`pool`,this.soundManager.playUIClick(),alert(`🏊 Pool-Werkzeug aktiviert! Klicke auf Rasenfelder, um Wasser-Kacheln auszuheben.`),this.close()})))}close(){let e=document.getElementById(`modal-build-backdrop`);e&&e.classList.remove(`active`)}},w=class{container;soundManager;constructor(e,t){this.container=e,this.soundManager=t,this.renderBaseHTML()}renderBaseHTML(){this.container.innerHTML=`
      <div class="modal-backdrop" id="modal-career-backdrop" role="dialog" aria-modal="true" aria-labelledby="career-title">
        <div class="modal-dialog glass-panel" style="max-width: 650px;">
          <div class="modal-header">
            <h2 id="career-title">💼 Karriere & Quests</h2>
            <button class="btn-close" id="career-btn-close" aria-label="Schließen">&times;</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 18px;">
            <!-- Active Career Overview -->
            <div class="glass-panel" style="padding: 16px; background: rgba(0,229,255,0.06);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h3 id="career-name" style="font-family: var(--font-heading);">Karriere: Tech Guru</h3>
                <span id="career-salary" style="color: var(--simoleon-green); font-weight: 700;">Gehalt: § 180 / Tag</span>
              </div>
              <p id="career-level-title" style="color: var(--text-muted); font-size: 0.9rem;">Aktuelle Position: QA Tester (Rang 1)</p>
              <button class="btn-hud" id="btn-claim-salary" style="margin-top: 10px; width: 100%; justify-content: center;">
                💵 Tagesgehalt abholen (§)
              </button>
            </div>

            <!-- Skills Progress -->
            <div>
              <h4 style="font-family: var(--font-heading); margin-bottom: 10px;">Fähigkeiten (Skills)</h4>
              <div id="skills-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <!-- Populated dynamically -->
              </div>
            </div>

            <!-- Sims Mobile Daily Quests -->
            <div>
              <h4 style="font-family: var(--font-heading); margin-bottom: 10px;">Tägliche Quests (Sims Mobile)</h4>
              <div id="quests-list" style="display: flex; flex-direction: column; gap: 8px;">
                <!-- Populated dynamically -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `}open(e,t,n){let r=document.getElementById(`modal-career-backdrop`);if(!r)return;let i=t.getCareerInfo(),a=document.getElementById(`career-name`);a&&(a.innerText=`${i.icon} ${i.careerTitle}`);let o=document.getElementById(`career-salary`);o&&(o.innerText=`Gehalt: § ${i.salary} / Tag`);let s=document.getElementById(`career-level-title`);s&&(s.innerText=`Aktuelle Position: ${i.jobTitle} (Rang ${t.currentRank})`);let c=document.getElementById(`btn-claim-salary`);c&&(c.onclick=()=>{let r=t.payoutDailySalary(e);this.soundManager.playBuySound(),alert(`🎉 Tagesgehalt abgeholt! Du hast § ${r} erhalten.`),this.open(e,t,n)});let l=document.getElementById(`skills-grid`);l&&(l.innerHTML=Object.entries(e.skills).map(([e,t])=>`
        <div class="glass-panel" style="padding: 8px 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
            <span style="text-transform: capitalize;">${e}</span>
            <span>Stufe ${Math.floor(t)}</span>
          </div>
          <div class="need-progress-bg" style="width: 100%;">
            <div class="need-progress-fill" style="width: ${t%1*100}%; background: var(--primary-accent);"></div>
          </div>
        </div>
      `).join(``));let u=document.getElementById(`quests-list`);u&&(u.innerHTML=n.getQuests().map(e=>`
        <div class="glass-panel" style="padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; background: ${e.completed?`rgba(46,204,113,0.1)`:`rgba(255,255,255,0.04)`};">
          <div>
            <h5 style="font-family: var(--font-heading);">${e.title}</h5>
            <p style="font-size: 0.8rem; color: var(--text-muted);">${e.description}</p>
          </div>
          <div style="text-align: right;">
            <span style="color: var(--simoleon-green); font-weight: 700; font-size: 0.9rem;">+ § ${e.rewardSimoleons}</span>
            <div style="font-size: 0.75rem; color: ${e.completed?`var(--simoleon-green)`:`var(--text-muted)`}; margin-top: 2px;">
              ${e.completed?`✅ Erledigt`:`Offen`}
            </div>
          </div>
        </div>
      `).join(``)),r.classList.add(`active`),document.getElementById(`career-btn-close`)?.addEventListener(`click`,()=>this.close())}close(){let e=document.getElementById(`modal-career-backdrop`);e&&e.classList.remove(`active`)}},T=class{static PRIVACY_KEY=`sims_gdpr_consent_v1`;static hasConsented(){return localStorage.getItem(this.PRIVACY_KEY)===`true`}static setConsent(){localStorage.setItem(this.PRIVACY_KEY,`true`)}static purgeAllUserData(){let e=localStorage.getItem(this.PRIVACY_KEY);localStorage.clear(),e&&localStorage.setItem(this.PRIVACY_KEY,e)}static getPrivacyNoticeText(){return{title:`Datenschutz & Lokale Speicherung (DSGVO Konformität)`,body:`Dieses Spiel verarbeitet deine Spieldaten (Sims-Charaktere, Hausbau, Punkte & Einstellungen) ausschließlich LOKAL in deinem Browser (LocalStorage). Es werden KEINE personenbezogenen Daten an externe Server, Drittanbieter oder Analytics-Dienste übertragen.`,rights:`Du hast jederzeit die volle Kontrolle über deine Daten. Über das Einstellungsmenü kannst du alle gespeicherten Daten sofort und unwiderruflich löschen (Recht auf Löschung nach DSGVO Art. 17).`}}},E=class{container;soundManager;onDataPurged;constructor(e,t){this.container=e,this.soundManager=t,this.renderBaseHTML()}renderBaseHTML(){let e=T.getPrivacyNoticeText();this.container.innerHTML=`
      <div class="modal-backdrop" id="modal-privacy-backdrop" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
        <div class="modal-dialog glass-panel" style="max-width: 550px;">
          <div class="modal-header">
            <h2 id="privacy-title">🛡️ ${e.title}</h2>
            <button class="btn-close" id="privacy-btn-close" aria-label="Schließen">&times;</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px; font-size: 0.95rem; line-height: 1.5;">
            <p>${e.body}</p>

            <div class="glass-panel" style="padding: 12px; background: rgba(0, 229, 255, 0.05); border-color: rgba(0, 229, 255, 0.2);">
              <h4 style="font-family: var(--font-heading); color: var(--primary-accent); margin-bottom: 4px;">Dein Recht auf Löschung</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted);">${e.rights}</p>
            </div>

            <button class="btn-hud" id="btn-purge-data" style="background: var(--warning-red); justify-content: center; margin-top: 8px;">
              🗑️ Alle gespeicherten Spieldaten löschen (DSGVO Art. 17)
            </button>
          </div>
        </div>
      </div>
    `}open(){let e=document.getElementById(`modal-privacy-backdrop`);e&&(e.classList.add(`active`),document.getElementById(`btn-purge-data`)?.addEventListener(`click`,()=>{confirm(`Bist du sicher, dass du ALLE gespeicherten Sims-Daten unwiderruflich löschen möchtest?`)&&(T.purgeAllUserData(),this.soundManager.playUIClick(),alert(`Alle gespeicherten Daten wurden erfolgreich gelöscht.`),this.close(),this.onDataPurged&&this.onDataPurged())}),document.getElementById(`privacy-btn-close`)?.addEventListener(`click`,()=>this.close()))}close(){let e=document.getElementById(`modal-privacy-backdrop`);e&&e.classList.remove(`active`)}},D=class{container;soundManager;onInteractionExecuted;constructor(e,t){this.container=e,this.soundManager=t,this.renderBaseHTML()}renderBaseHTML(){this.container.innerHTML=`
      <div class="modal-backdrop" id="modal-social-backdrop" role="dialog" aria-modal="true" aria-labelledby="social-title">
        <div class="modal-dialog glass-panel" style="max-width: 500px; text-align: center;">
          <div class="modal-header">
            <h2 id="social-title">💬 Interaktion</h2>
            <button class="btn-close" id="social-btn-close" aria-label="Schließen">&times;</button>
          </div>

          <div style="margin-bottom: 16px;">
            <h3 id="social-target-name" style="font-family: var(--font-heading); color: var(--primary-accent);">Mortimer Goth</h3>
            <p id="social-target-status" style="font-size: 0.85rem; color: var(--text-muted);">Status: Bekannte(r)</p>
          </div>

          <!-- Category Selection Buttons -->
          <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 16px;">
            <button class="btn-hud social-cat-btn active" data-cat="friendly">💬 Freundlich</button>
            <button class="btn-hud social-cat-btn" data-cat="funny">🎭 Lustig</button>
            <button class="btn-hud social-cat-btn" data-cat="romantic">❤️ Romantisch</button>
            <button class="btn-hud social-cat-btn" data-cat="mean">😡 Gemein</button>
          </div>

          <!-- Options Grid -->
          <div id="social-options-list" style="display: flex; flex-direction: column; gap: 10px; max-height: 45vh; overflow-y: auto;">
            <!-- Populated dynamically -->
          </div>
        </div>
      </div>
    `}open(e,t){let n=document.getElementById(`modal-social-backdrop`);if(!n)return;let i=document.getElementById(`social-target-name`);i&&(i.innerText=r.sanitizeText(t.name,24));let a=document.getElementById(`social-target-status`);a&&(a.innerText=`Status: ${t.relationship.getStatusTitle()} (Freundschaft: ${Math.round(t.relationship.friendship)}% | Romantik: ${Math.round(t.relationship.romance)}%)`),n.classList.add(`active`);let o=document.querySelectorAll(`.social-cat-btn`);o.forEach(n=>{n.addEventListener(`click`,n=>{o.forEach(e=>e.classList.remove(`active`)),n.currentTarget.classList.add(`active`);let r=n.currentTarget.getAttribute(`data-cat`);this.renderOptions(e,t,r)})}),this.renderOptions(e,t,`friendly`),document.getElementById(`social-btn-close`)?.addEventListener(`click`,()=>this.close())}renderOptions(e,t,n){let r=document.getElementById(`social-options-list`);if(!r)return;let i=[{id:`smalltalk`,label:`Smalltalk halten`,category:`friendly`,icon:`💬`,friendshipDelta:8,romanceDelta:0,emoteSymbol:`💬`},{id:`compliment`,label:`Outfit loben`,category:`friendly`,icon:`✨`,friendshipDelta:12,romanceDelta:2,emoteSymbol:`😀`},{id:`hobbies`,label:`Über Hobbys sprechen`,category:`friendly`,icon:`🎨`,friendshipDelta:15,romanceDelta:0,emoteSymbol:`🎨`},{id:`party_toast`,label:`Party-Toast anstoßen (🥂)`,category:`friendly`,icon:`🥂`,friendshipDelta:18,romanceDelta:5,emoteSymbol:`🥂`},{id:`tell_joke`,label:`Witz erzählen`,category:`funny`,icon:`😂`,friendshipDelta:14,romanceDelta:0,emoteSymbol:`😂`},{id:`crazy_story`,label:`Verrückte Story erzählen`,category:`funny`,icon:`🤪`,friendshipDelta:16,romanceDelta:0,emoteSymbol:`🤪`},{id:`flirt`,label:`Anflirten`,category:`romantic`,icon:`😉`,friendshipDelta:5,romanceDelta:18,emoteSymbol:`💕`},{id:`hold_hands`,label:`Hände halten`,category:`romantic`,icon:`🤝`,friendshipDelta:8,romanceDelta:25,emoteSymbol:`💖`,minFriendshipRequired:40},{id:`hug`,label:`Herzlich umarmen`,category:`romantic`,icon:`🤗`,friendshipDelta:10,romanceDelta:15,emoteSymbol:`🤗`,minFriendshipRequired:30},{id:`first_kiss`,label:`Erster Kuss`,category:`romantic`,icon:`💋`,friendshipDelta:15,romanceDelta:40,emoteSymbol:`💋`,minFriendshipRequired:60},{id:`make_baby`,label:`Baby planen (Whahoo)`,category:`romantic`,icon:`👶`,friendshipDelta:20,romanceDelta:45,emoteSymbol:`👶`,minFriendshipRequired:75},{id:`insult`,label:`Beleidigen`,category:`mean`,icon:`😡`,friendshipDelta:-25,romanceDelta:-20,emoteSymbol:`😡`},{id:`argue`,label:`Streiten`,category:`mean`,icon:`🤬`,friendshipDelta:-30,romanceDelta:-25,emoteSymbol:`💔`}];r.innerHTML=i.filter(e=>e.category===n).map(e=>{let n=e.minFriendshipRequired&&t.relationship.friendship<e.minFriendshipRequired;return`
        <button class="btn-hud social-option-btn" data-id="${e.id}" ${n?`disabled`:``} style="justify-content: space-between; padding: 12px 18px;">
          <span>${e.icon} ${e.label}</span>
          <span style="font-size: 0.8rem; opacity: 0.8;">
            ${n?`Locked (Erfordert ${e.minFriendshipRequired}% Freundschaft)`:`+${e.friendshipDelta} Freundschaft`}
          </span>
        </button>
      `}).join(``),r.querySelectorAll(`.social-option-btn`).forEach(n=>{n.addEventListener(`click`,n=>{let r=n.currentTarget.getAttribute(`data-id`),a=i.find(e=>e.id===r);a&&(t.relationship.modifyFriendship(a.friendshipDelta),t.relationship.modifyRomance(a.romanceDelta),e.needs.modify(`social`,25),e.addSkillXP(`charisma`,15),this.soundManager.playSimlish(1.1,{friendly:`happy`,funny:`happy`,romantic:`flirty`,mean:`angry`}[a.category]),this.onInteractionExecuted&&this.onInteractionExecuted(t,a),this.close())})})}close(){let e=document.getElementById(`modal-social-backdrop`);e&&e.classList.remove(`active`)}},O=class{container;constructor(e){this.container=e,this.renderBaseHTML()}renderBaseHTML(){this.container.innerHTML=`
      <div class="modal-backdrop" id="modal-rel-backdrop" role="dialog" aria-modal="true" aria-labelledby="rel-title">
        <div class="modal-dialog glass-panel" style="max-width: 600px;">
          <div class="modal-header">
            <h2 id="rel-title">💕 Beziehungen & Bekannte</h2>
            <button class="btn-close" id="rel-btn-close" aria-label="Schließen">&times;</button>
          </div>

          <div id="rel-sims-list" style="display: flex; flex-direction: column; gap: 12px; max-height: 60vh; overflow-y: auto;">
            <!-- Populated dynamically -->
          </div>
        </div>
      </div>
    `}open(e){let t=document.getElementById(`modal-rel-backdrop`),n=document.getElementById(`rel-sims-list`);!t||!n||(n.innerHTML=e.npcs.map(e=>{let t=e.relationship,n=t.getStatusTitle();return`
        <div class="glass-panel" style="padding: 14px; display: flex; align-items: center; justify-content: space-between; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: ${e.outfitColor}; border: 2px solid ${e.skinColor}; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
              👤
            </div>
            <div>
              <h4 style="font-family: var(--font-heading); font-size: 1.05rem;">${r.sanitizeText(e.name,24)}</h4>
              <p style="font-size: 0.8rem; color: var(--primary-accent);">${n} (Merkmal: ${e.trait})</p>
            </div>
          </div>

          <div style="min-width: 180px; display: flex; flex-direction: column; gap: 6px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 2px;">
                <span>Freundschaft</span>
                <span>${Math.round(t.friendship)}%</span>
              </div>
              <div class="need-progress-bg" style="width: 100%; height: 6px;">
                <div class="need-progress-fill" style="width: ${t.friendship}%; background: var(--simoleon-green);"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 2px;">
                <span>Romantik</span>
                <span>${Math.round(t.romance)}%</span>
              </div>
              <div class="need-progress-bg" style="width: 100%; height: 6px;">
                <div class="need-progress-fill" style="width: ${t.romance}%; background: #e74c3c;"></div>
              </div>
            </div>
          </div>
        </div>
      `}).join(``),t.classList.add(`active`),document.getElementById(`rel-btn-close`)?.addEventListener(`click`,()=>this.close()))}close(){let e=document.getElementById(`modal-rel-backdrop`);e&&e.classList.remove(`active`)}},k=class{container;constructor(e){this.container=e,this.renderBaseHTML()}renderBaseHTML(){this.container.innerHTML=`
      <div class="modal-backdrop" id="modal-family-backdrop" role="dialog" aria-modal="true" aria-labelledby="family-title">
        <div class="modal-dialog glass-panel" style="max-width: 650px;">
          <div class="modal-header">
            <h2 id="family-title">👨‍👩‍👧‍👦 Familienstammbaum & Lebensphasen</h2>
            <button class="btn-close" id="family-btn-close" aria-label="Schließen">&times;</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px;" id="family-tree-content">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>
    `}open(e){let t=document.getElementById(`modal-family-backdrop`),n=document.getElementById(`family-tree-content`);if(!t||!n)return;let a=i.getInfo(e.lifeStage);n.innerHTML=`
      <!-- Active Sim Card -->
      <div class="glass-panel" style="padding: 16px; background: rgba(0, 229, 255, 0.08);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem;">
            ${a.icon} ${r.sanitizeText(e.customization.name,24)}
          </h3>
          <span style="font-family: var(--font-heading); font-weight: 700; color: var(--primary-accent);">
            Lebensphase: ${a.label}
          </span>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">
          Eigenschaft: ${e.customization.trait} | Lebensziel: ${e.customization.aspiration}
        </p>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">
          Alterungsfortschritt: Tag ${e.ageDays} von ${a.daysInStage}
        </div>
        <div class="need-progress-bg" style="width: 100%; height: 8px;">
          <div class="need-progress-fill" style="width: ${Math.min(100,e.ageDays/a.daysInStage*100)}%; background: var(--primary-accent);"></div>
        </div>
      </div>

      <!-- Partner Section -->
      <div class="glass-panel" style="padding: 14px;">
        <h4 style="font-family: var(--font-heading); margin-bottom: 6px;">💍 Lebenspartner(in)</h4>
        <p style="font-size: 0.9rem; color: ${e.partnerName?`var(--text-main)`:`var(--text-muted)`};">
          ${e.partnerName?`❤️ ${r.sanitizeText(e.partnerName,24)}`:`Noch keinen festen Lebenspartner gefunden.`}
        </p>
      </div>

      <!-- Children Section -->
      <div class="glass-panel" style="padding: 14px;">
        <h4 style="font-family: var(--font-heading); margin-bottom: 6px;">👶 Kinder & Nachkommen</h4>
        ${e.childrenNames.length>0?`
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${e.childrenNames.map(e=>`
              <div style="padding: 6px 12px; background: rgba(255,255,255,0.05); border-radius: 6px; font-size: 0.9rem;">
                🍼 ${r.sanitizeText(e,24)} (Säugling)
              </div>
            `).join(``)}
          </div>
        `:`
          <p style="font-size: 0.9rem; color: var(--text-muted);">Noch keine Kinder in der Familie.</p>
        `}
      </div>
    `,t.classList.add(`active`),document.getElementById(`family-btn-close`)?.addEventListener(`click`,()=>this.close())}close(){let e=document.getElementById(`modal-family-backdrop`);e&&e.classList.remove(`active`)}},A=class e{static PARTY_TYPES={housewarming:{id:`housewarming`,title:`🥳 Einweihungsparty`,icon:`🥳`,description:`Feiere das neue Heim mit deinen Nachbarn!`,durationInGameHours:6,goals:[{id:`p_toast`,title:`Party-Toast mit Gästen trinken`,points:25,completed:!1},{id:`p_talk`,title:`Mit 3 Partygästen sprechen`,points:25,completed:!1},{id:`p_dance`,title:`Am Radio gemeinsam tanzen`,points:25,completed:!1},{id:`p_snack`,title:`Party-Snacks servieren`,points:25,completed:!1}]},poolparty:{id:`poolparty`,title:`🏊‍♂️ Sommer-Poolparty`,icon:`🏊‍♂️`,description:`Erfrischende Abkühlung & Musik am Pool.`,durationInGameHours:6,goals:[{id:`p_swim`,title:`Gemeinsam im Pool schwimmen`,points:30,completed:!1},{id:`p_dance`,title:`Musik am Radio aufdrehen`,points:25,completed:!1},{id:`p_toast`,title:`Cocktail-Toast am Pool`,points:25,completed:!1},{id:`p_relax`,title:`Auf dem Sofa entspannen`,points:20,completed:!1}]},gala:{id:`gala`,title:`🎂 Geburtstags-Gala`,icon:`🎂`,description:`Große Gala mit Torte, Musik & Trophäen.`,durationInGameHours:8,goals:[{id:`p_candles`,title:`Geburtstagskerzen ausblasen`,points:30,completed:!1},{id:`p_buffet`,title:`Buffet-Tisch eröffnen`,points:25,completed:!1},{id:`p_dance`,title:`Paartanzen mit Gästen`,points:25,completed:!1},{id:`p_toast`,title:`Festliche Ansprache halten`,points:20,completed:!1}]}};activeParty=null;remainingMinutes=0;currentScore=0;trophiesUnlocked=[];startParty(t){let n=e.PARTY_TYPES[t];return this.activeParty=JSON.parse(JSON.stringify(n)),this.remainingMinutes=n.durationInGameHours*60,this.currentScore=0,this.activeParty}update(e){return this.activeParty?(this.remainingMinutes-=e,this.remainingMinutes<=0?this.endParty():{partyEnded:!1}):{partyEnded:!1}}triggerGoal(e){if(!this.activeParty)return!1;let t=this.activeParty.goals.find(t=>t.id===e&&!t.completed);return t?(t.completed=!0,this.currentScore+=t.points,!0):!1}getStarRating(){return this.currentScore>=90?5:this.currentScore>=70?4:this.currentScore>=50?3:this.currentScore>=25?2:+(this.currentScore>0)}endParty(){if(!this.activeParty)return{partyEnded:!1,finalStars:0,rewardSimoleons:0};let e=this.getStarRating(),t=e*400+200,n;return e>=5?(n=`🏆 Party-Legende Trophäe (Gold)`,this.trophiesUnlocked.includes(n)||this.trophiesUnlocked.push(n)):e>=3&&(n=`🥈 Party-Profi Trophäe (Silber)`,this.trophiesUnlocked.includes(n)||this.trophiesUnlocked.push(n)),this.activeParty=null,this.remainingMinutes=0,{partyEnded:!0,finalStars:e,rewardSimoleons:t,trophyAwarded:n}}},j=class{container;soundManager;onPartyStarted;constructor(e,t){this.container=e,this.soundManager=t,this.renderBaseHTML()}renderBaseHTML(){this.container.innerHTML=`
      <div class="modal-backdrop" id="modal-party-backdrop" role="dialog" aria-modal="true" aria-labelledby="party-title">
        <div class="modal-dialog glass-panel" style="max-width: 650px;">
          <div class="modal-header">
            <h2 id="party-title">🎉 Hausparty & Event-Veranstaltung</h2>
            <button class="btn-close" id="party-btn-close" aria-label="Schließen">&times;</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            <p style="font-size: 0.9rem; color: var(--text-muted);">
              Veranstalte eine unvergessliche Party! Nachbar-Gäste treffen ein, absolvierte Ziele steigern deine Sterne-Bewertung (⭐⭐⭐⭐⭐) und bringen Simoleons (§) sowie Party-Trophäen ein!
            </p>

            <!-- Party Types Grid -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;" id="party-types-grid">
              <!-- Dynamically populated -->
            </div>

            <!-- Trophies Section -->
            <div class="glass-panel" style="padding: 14px; background: rgba(0, 229, 255, 0.05);">
              <h4 style="font-family: var(--font-heading); margin-bottom: 6px;">🏆 Verdiente Party-Trophäen</h4>
              <div id="party-trophies-list" style="font-size: 0.85rem; color: var(--text-muted);">
                Noch keine Trophäen freigeschaltet. Erreiche 3+ Sterne auf deinen Partys!
              </div>
            </div>
          </div>
        </div>
      </div>
    `}open(e){let t=document.getElementById(`modal-party-backdrop`),n=document.getElementById(`party-types-grid`),r=document.getElementById(`party-trophies-list`);!t||!n||(n.innerHTML=Object.values(A.PARTY_TYPES).map(e=>`
      <div class="glass-panel" style="padding: 14px; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
        <div>
          <div style="font-size: 2.2rem; margin-bottom: 6px;">${e.icon}</div>
          <h4 style="font-family: var(--font-heading); font-size: 0.95rem; margin-bottom: 4px;">${e.title}</h4>
          <p style="font-size: 0.75rem; color: var(--text-muted);">${e.description}</p>
        </div>
        <button class="btn-hud start-party-btn" data-id="${e.id}" style="margin-top: 10px; width: 100%; justify-content: center; font-size: 0.8rem; background: var(--simoleon-green);">
          🚀 Party Starten
        </button>
      </div>
    `).join(``),r&&(e.trophiesUnlocked.length>0?r.innerHTML=e.trophiesUnlocked.map(e=>`<div style="padding: 4px 0;">${e}</div>`).join(``):r.innerText=`Noch keine Trophäen freigeschaltet. Erreiche 3+ Sterne auf deinen Partys!`),t.classList.add(`active`),n.querySelectorAll(`.start-party-btn`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.currentTarget.getAttribute(`data-id`);t&&this.onPartyStarted&&(this.soundManager.playLevelUp(),this.onPartyStarted(t),this.close())})}),document.getElementById(`party-btn-close`)?.addEventListener(`click`,()=>this.close()))}close(){let e=document.getElementById(`modal-party-backdrop`);e&&e.classList.remove(`active`)}},M=class{canvas;camera;renderer;soundManager;radioManager;inputHandler;house;sim;npcManager;timeSystem;careerManager;questManager;partyManager;hud;casModal;buildCatalog;careerPanel;privacyModal;socialWheel;relationshipsPanel;familyTreePanel;partyModal;lastTime=0;isRunning=!1;constructor(e,t){this.canvas=e,this.camera=new c,this.renderer=new d(e),this.soundManager=new f,this.radioManager=new m,this.house=new s,this.sim=new a,this.npcManager=new u,this.timeSystem=new h,this.careerManager=new _,this.questManager=new v,this.partyManager=new A,this.hud=new x(t,this.soundManager),this.casModal=new S(t,this.soundManager),this.buildCatalog=new C(t,this.soundManager),this.careerPanel=new w(t,this.soundManager),this.privacyModal=new E(t,this.soundManager),this.socialWheel=new D(t,this.soundManager),this.relationshipsPanel=new O(t),this.familyTreePanel=new k(t),this.partyModal=new j(t,this.soundManager),this.inputHandler=new p(this.canvas,this.camera,this.renderer,this.soundManager),this.initCanvasSize(),this.setupEventHandlers(),this.attemptLoadSave()}initCanvasSize(){let e=()=>{this.renderer.setSize(window.innerWidth,window.innerHeight)};window.addEventListener(`resize`,e),e()}setupEventHandlers(){this.inputHandler.onTileClick=(e,t)=>{let n=this.buildCatalog.activeToolMode;if(n!==`select`){n===`wall`?this.sim.simoleons>=100?(this.sim.simoleons-=100,this.house.toggleWallNorth(e,t,`#2c3e50`),this.soundManager.playBuySound()):alert(`Nicht genügend Simoleons (§ 100 benötigt)!`):n===`door`?this.sim.simoleons>=200&&(this.sim.simoleons-=200,this.house.setOpeningNorth(e,t,`door`),this.soundManager.playBuySound()):n===`window`?this.sim.simoleons>=250&&(this.sim.simoleons-=250,this.house.setOpeningNorth(e,t,`window`),this.soundManager.playBuySound()):n===`floor`?this.sim.simoleons>=50&&(this.sim.simoleons-=50,this.house.setFloorStyle(e,t,this.buildCatalog.activeFloorType,this.buildCatalog.activeFloorColor),this.soundManager.playBuySound()):n===`pool`&&this.sim.simoleons>=300&&(this.sim.simoleons-=300,this.house.setFloorStyle(e,t,`pool`,`#00e5ff`),this.soundManager.playBuySound()),this.buildCatalog.activeToolMode=`select`;return}let r=this.npcManager.getNPCAt(e,t);if(r){let e=b.findPath(this.sim.gridPos,{x:Math.floor(r.gridPos.x),y:Math.floor(r.gridPos.y)},this.house.width,this.house.height,(e,t)=>this.house.isWalkable(e,t));this.sim.setPath(e),this.socialWheel.open(this.sim,r);return}let i=this.house.getFurnitureAt(e,t);if(i){let e=o[i.furnitureId];if(!e||e.interactions.length===0)return;let t=e.interactions[0],n=b.findPath(this.sim.gridPos,{x:i.gridX,y:i.gridY},this.house.width,this.house.height,(e,t)=>this.house.isWalkable(e,t));this.sim.setPath(n),this.sim.actionQueue.enqueue({id:`act_${Date.now()}`,name:`${t.label} (${e.name})`,icon:t.icon,durationSeconds:t.duration,elapsedSeconds:0,onExecuteTick:()=>{Math.random()<.05&&this.soundManager.playSimlish(1,`happy`)},onComplete:()=>{if(Object.entries(t.needEffects).forEach(([e,t])=>{this.sim.needs.modify(e,t)}),t.id===`toggle_radio`){let e=this.radioManager.toggleRadio(),t=this.radioManager.getActiveStationInfo();this.updateRadioHUD(),alert(`📻 Radio ${e?`Eingeschaltet`:`Ausgeschaltet`} (${t.name})`)}else if(t.id===`cycle_station`){let e=this.radioManager.cycleNextStation();this.updateRadioHUD(),alert(`🎛️ Radiosender gewechselt zu: ${e.icon} ${e.name}`)}else t.id===`dance_solo`?(this.radioManager.getIsPlaying()||(this.radioManager.playStation(`pop`),this.updateRadioHUD()),this.soundManager.playSimlish(1.2,`happy`)):t.id===`dance_couple`&&(this.radioManager.getIsPlaying()||(this.radioManager.playStation(`retro`),this.updateRadioHUD()),this.soundManager.playSimlish(1.1,`flirty`),this.npcManager.npcs.length>0&&this.npcManager.triggerEmote(this.npcManager.npcs[0].id,`💃`,5e3));if(t.id===`serve_buffet`)this.partyManager.triggerGoal(`p_buffet`),this.partyManager.triggerGoal(`p_snack`);else if(t.id===`blow_candles`){this.partyManager.triggerGoal(`p_candles`);let e=this.sim.ageUp();this.soundManager.playLevelUp(),alert(`🎉 GEBURTSTAG! ${this.sim.customization.name} ist in die Lebensphase "${e.toUpperCase()}" aufgestiegen!`)}else t.id===`dance_solo`||t.id===`dance_couple`?this.partyManager.triggerGoal(`p_dance`):t.id===`swim`&&this.partyManager.triggerGoal(`p_swim`);t.skillGain&&this.sim.addSkillXP(t.skillGain.skill,t.skillGain.amount)&&(this.soundManager.playLevelUp(),alert(`✨ LEVEL UP! ${this.sim.customization.name} hat Stufe ${Math.floor(this.sim.skills[t.skillGain.skill])} in ${t.skillGain.skill.toUpperCase()} erreicht!`)),t.id===`cook_gourmet`||t.id===`snack`?this.questManager.triggerQuestProgress(`q_cook`):t.id===`code`?this.questManager.triggerQuestProgress(`q_code`):t.id===`sleep`&&this.questManager.triggerQuestProgress(`q_sleep`)}})}else{let n=b.findPath(this.sim.gridPos,{x:e,y:t},this.house.width,this.house.height,(e,t)=>this.house.isWalkable(e,t));this.sim.setPath(n)}},this.socialWheel.onInteractionExecuted=(e,t)=>{if(this.npcManager.triggerEmote(e.id,t.emoteSymbol,3e3),this.partyManager.triggerGoal(`p_talk`),t.id===`party_toast`&&this.partyManager.triggerGoal(`p_toast`),t.id===`make_baby`){let t=`${this.sim.customization.name.split(` `)[0]} Jr.`;this.sim.childrenNames.push(t),this.sim.partnerName=e.name,this.soundManager.playLevelUp(),alert(`👶 GLÜCKWUNSCH! Ein baby namens "${t}" wurde geboren und der Familie hinzugefügt!`)}},this.hud.onOpenCAS=()=>this.casModal.open(this.sim),this.hud.onOpenBuildBuy=()=>this.buildCatalog.open(this.sim,this.house),this.hud.onOpenCareer=()=>this.careerPanel.open(this.sim,this.careerManager,this.questManager),this.hud.onOpenRelationships=()=>this.relationshipsPanel.open(this.npcManager),this.hud.onOpenFamilyTree=()=>this.familyTreePanel.open(this.sim),this.hud.onOpenParty=()=>this.partyModal.open(this.partyManager),this.hud.onOpenPrivacy=()=>this.privacyModal.open(),this.partyModal.onPartyStarted=e=>{let t=this.partyManager.startParty(e);this.npcManager.npcs.forEach(e=>{this.npcManager.triggerEmote(e.id,`🥳`,1e4)}),alert(`🎉 PARTY GESTARTET! Willkommen zur ${t.title}. Absolviere Party-Ziele für 5 Sterne ⭐!`)},this.hud.onToggleRadio=()=>{let e=this.radioManager.cycleNextStation();this.updateRadioHUD(),alert(`📻 Sender gewechselt: ${e.icon} ${e.name}`)},this.hud.onSaveGame=()=>{y.saveGame(this.sim,this.house,this.careerManager,this.npcManager,this.partyManager),this.soundManager.playLevelUp(),alert(`💾 Spielstand (inklusive Party-Trophäen & Fortschritten) gespeichert!`)},this.hud.onSpeedChange=e=>this.timeSystem.setSpeed(e),this.hud.onTogglePause=()=>this.timeSystem.togglePause(),this.inputHandler.onKeyboardSpeedToggle=e=>this.timeSystem.setSpeed(e),this.inputHandler.onKeyboardPauseToggle=()=>this.timeSystem.togglePause()}updateRadioHUD(){let e=document.getElementById(`btn-radio-toggle`);if(e){let t=this.radioManager.getIsPlaying(),n=this.radioManager.getActiveStationInfo();e.innerText=t?`📻 ${n.icon} ${n.name}`:`📻 Radio: Aus`}}attemptLoadSave(){y.loadGame(this.sim,this.house,this.careerManager,this.npcManager,this.partyManager)&&console.log(`[Game Engine] Save file & party progress loaded successfully.`)}start(){this.isRunning||(this.isRunning=!0,this.lastTime=performance.now(),requestAnimationFrame(this.loop.bind(this)))}loop(e){if(!this.isRunning)return;let t=Math.min((e-this.lastTime)/1e3,.1);this.lastTime=e;let n=this.timeSystem.update(t),r=this.partyManager.update(n.deltaMinutes);r.partyEnded&&(this.sim.simoleons+=r.rewardSimoleons||0,this.soundManager.playLevelUp(),alert(`🎉 PARTY BEENDET! Du hast ${r.finalStars} ⭐ Sterne erzielt und § ${r.rewardSimoleons} verdient! ${r.trophyAwarded?`\n\n🏆 Freigeschaltet: ${r.trophyAwarded}`:``}`)),this.sim.update(t,n.deltaMinutes),this.npcManager.update(t),this.camera.update(),this.renderer.render(this.house,this.sim,this.npcManager,this.camera,this.timeSystem.hour),this.hud.update(this.sim,this.timeSystem),requestAnimationFrame(this.loop.bind(this))}};window.addEventListener(`DOMContentLoaded`,()=>{let e=document.getElementById(`game-canvas`),t=document.getElementById(`ui-container`);e&&t&&(new M(e,t).start(),console.log(`[Sims 5 Engine] Game initialized and loop started successfully.`))});