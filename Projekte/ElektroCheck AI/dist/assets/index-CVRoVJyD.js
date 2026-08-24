var El=Object.defineProperty;var ha=o=>{throw TypeError(o)};var Sl=(o,a,n)=>a in o?El(o,a,{enumerable:!0,configurable:!0,writable:!0,value:n}):o[a]=n;var ua=(o,a,n)=>Sl(o,typeof a!="symbol"?a+"":a,n),Zn=(o,a,n)=>a.has(o)||ha("Cannot "+n);var ge=(o,a,n)=>(Zn(o,a,"read from private field"),n?n.call(o):a.get(o)),Dt=(o,a,n)=>a.has(o)?ha("Cannot add the same private member more than once"):a instanceof WeakSet?a.add(o):a.set(o,n),ki=(o,a,n,d)=>(Zn(o,a,"write to private field"),d?d.call(o,n):a.set(o,n),n),Kt=(o,a,n)=>(Zn(o,a,"access private method"),n);(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const u of document.querySelectorAll('link[rel="modulepreload"]'))d(u);new MutationObserver(u=>{for(const g of u)if(g.type==="childList")for(const m of g.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&d(m)}).observe(document,{childList:!0,subtree:!0});function n(u){const g={};return u.integrity&&(g.integrity=u.integrity),u.referrerPolicy&&(g.referrerPolicy=u.referrerPolicy),u.crossOrigin==="use-credentials"?g.credentials="include":u.crossOrigin==="anonymous"?g.credentials="omit":g.credentials="same-origin",g}function d(u){if(u.ep)return;u.ep=!0;const g=n(u);fetch(u.href,g)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ln=globalThis,Is=ln.ShadowRoot&&(ln.ShadyCSS===void 0||ln.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ts=Symbol(),fa=new WeakMap;let so=class{constructor(a,n,d){if(this._$cssResult$=!0,d!==Ts)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=a,this.t=n}get styleSheet(){let a=this.o;const n=this.t;if(Is&&a===void 0){const d=n!==void 0&&n.length===1;d&&(a=fa.get(n)),a===void 0&&((this.o=a=new CSSStyleSheet).replaceSync(this.cssText),d&&fa.set(n,a))}return a}toString(){return this.cssText}};const ti=o=>new so(typeof o=="string"?o:o+"",void 0,Ts),Ge=(o,...a)=>{const n=o.length===1?o[0]:a.reduce((d,u,g)=>d+(m=>{if(m._$cssResult$===!0)return m.cssText;if(typeof m=="number")return m;throw Error("Value passed to 'css' function must be a 'css' function result: "+m+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(u)+o[g+1],o[0]);return new so(n,o,Ts)},ao=(o,a)=>{if(Is)o.adoptedStyleSheets=a.map(n=>n instanceof CSSStyleSheet?n:n.styleSheet);else for(const n of a){const d=document.createElement("style"),u=ln.litNonce;u!==void 0&&d.setAttribute("nonce",u),d.textContent=n.cssText,o.appendChild(d)}},ga=Is?o=>o:o=>o instanceof CSSStyleSheet?(a=>{let n="";for(const d of a.cssRules)n+=d.cssText;return ti(n)})(o):o;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Il,defineProperty:Tl,getOwnPropertyDescriptor:Nl,getOwnPropertyNames:kl,getOwnPropertySymbols:Rl,getPrototypeOf:Ol}=Object,xi=globalThis,pa=xi.trustedTypes,Dl=pa?pa.emptyScript:"",Yn=xi.reactiveElementPolyfillSupport,Dr=(o,a)=>o,hn={toAttribute(o,a){switch(a){case Boolean:o=o?Dl:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,a){let n=o;switch(a){case Boolean:n=o!==null;break;case Number:n=o===null?null:Number(o);break;case Object:case Array:try{n=JSON.parse(o)}catch{n=null}}return n}},vn=(o,a)=>!Il(o,a),ma={attribute:!0,type:String,converter:hn,reflect:!1,useDefault:!1,hasChanged:vn};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),xi.litPropertyMetadata??(xi.litPropertyMetadata=new WeakMap);let er=class extends HTMLElement{static addInitializer(a){this._$Ei(),(this.l??(this.l=[])).push(a)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(a,n=ma){if(n.state&&(n.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(a)&&((n=Object.create(n)).wrapped=!0),this.elementProperties.set(a,n),!n.noAccessor){const d=Symbol(),u=this.getPropertyDescriptor(a,d,n);u!==void 0&&Tl(this.prototype,a,u)}}static getPropertyDescriptor(a,n,d){const{get:u,set:g}=Nl(this.prototype,a)??{get(){return this[n]},set(m){this[n]=m}};return{get:u,set(m){const C=u==null?void 0:u.call(this);g==null||g.call(this,m),this.requestUpdate(a,C,d)},configurable:!0,enumerable:!0}}static getPropertyOptions(a){return this.elementProperties.get(a)??ma}static _$Ei(){if(this.hasOwnProperty(Dr("elementProperties")))return;const a=Ol(this);a.finalize(),a.l!==void 0&&(this.l=[...a.l]),this.elementProperties=new Map(a.elementProperties)}static finalize(){if(this.hasOwnProperty(Dr("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Dr("properties"))){const n=this.properties,d=[...kl(n),...Rl(n)];for(const u of d)this.createProperty(u,n[u])}const a=this[Symbol.metadata];if(a!==null){const n=litPropertyMetadata.get(a);if(n!==void 0)for(const[d,u]of n)this.elementProperties.set(d,u)}this._$Eh=new Map;for(const[n,d]of this.elementProperties){const u=this._$Eu(n,d);u!==void 0&&this._$Eh.set(u,n)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(a){const n=[];if(Array.isArray(a)){const d=new Set(a.flat(1/0).reverse());for(const u of d)n.unshift(ga(u))}else a!==void 0&&n.push(ga(a));return n}static _$Eu(a,n){const d=n.attribute;return d===!1?void 0:typeof d=="string"?d:typeof a=="string"?a.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var a;this._$ES=new Promise(n=>this.enableUpdating=n),this._$AL=new Map,this._$E_(),this.requestUpdate(),(a=this.constructor.l)==null||a.forEach(n=>n(this))}addController(a){var n;(this._$EO??(this._$EO=new Set)).add(a),this.renderRoot!==void 0&&this.isConnected&&((n=a.hostConnected)==null||n.call(a))}removeController(a){var n;(n=this._$EO)==null||n.delete(a)}_$E_(){const a=new Map,n=this.constructor.elementProperties;for(const d of n.keys())this.hasOwnProperty(d)&&(a.set(d,this[d]),delete this[d]);a.size>0&&(this._$Ep=a)}createRenderRoot(){const a=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ao(a,this.constructor.elementStyles),a}connectedCallback(){var a;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(a=this._$EO)==null||a.forEach(n=>{var d;return(d=n.hostConnected)==null?void 0:d.call(n)})}enableUpdating(a){}disconnectedCallback(){var a;(a=this._$EO)==null||a.forEach(n=>{var d;return(d=n.hostDisconnected)==null?void 0:d.call(n)})}attributeChangedCallback(a,n,d){this._$AK(a,d)}_$ET(a,n){var g;const d=this.constructor.elementProperties.get(a),u=this.constructor._$Eu(a,d);if(u!==void 0&&d.reflect===!0){const m=(((g=d.converter)==null?void 0:g.toAttribute)!==void 0?d.converter:hn).toAttribute(n,d.type);this._$Em=a,m==null?this.removeAttribute(u):this.setAttribute(u,m),this._$Em=null}}_$AK(a,n){var g,m;const d=this.constructor,u=d._$Eh.get(a);if(u!==void 0&&this._$Em!==u){const C=d.getPropertyOptions(u),A=typeof C.converter=="function"?{fromAttribute:C.converter}:((g=C.converter)==null?void 0:g.fromAttribute)!==void 0?C.converter:hn;this._$Em=u;const _=A.fromAttribute(n,C.type);this[u]=_??((m=this._$Ej)==null?void 0:m.get(u))??_,this._$Em=null}}requestUpdate(a,n,d,u=!1,g){var m;if(a!==void 0){const C=this.constructor;if(u===!1&&(g=this[a]),d??(d=C.getPropertyOptions(a)),!((d.hasChanged??vn)(g,n)||d.useDefault&&d.reflect&&g===((m=this._$Ej)==null?void 0:m.get(a))&&!this.hasAttribute(C._$Eu(a,d))))return;this.C(a,n,d)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(a,n,{useDefault:d,reflect:u,wrapped:g},m){d&&!(this._$Ej??(this._$Ej=new Map)).has(a)&&(this._$Ej.set(a,m??n??this[a]),g!==!0||m!==void 0)||(this._$AL.has(a)||(this.hasUpdated||d||(n=void 0),this._$AL.set(a,n)),u===!0&&this._$Em!==a&&(this._$Eq??(this._$Eq=new Set)).add(a))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(n){Promise.reject(n)}const a=this.scheduleUpdate();return a!=null&&await a,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var d;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[g,m]of this._$Ep)this[g]=m;this._$Ep=void 0}const u=this.constructor.elementProperties;if(u.size>0)for(const[g,m]of u){const{wrapped:C}=m,A=this[g];C!==!0||this._$AL.has(g)||A===void 0||this.C(g,void 0,m,A)}}let a=!1;const n=this._$AL;try{a=this.shouldUpdate(n),a?(this.willUpdate(n),(d=this._$EO)==null||d.forEach(u=>{var g;return(g=u.hostUpdate)==null?void 0:g.call(u)}),this.update(n)):this._$EM()}catch(u){throw a=!1,this._$EM(),u}a&&this._$AE(n)}willUpdate(a){}_$AE(a){var n;(n=this._$EO)==null||n.forEach(d=>{var u;return(u=d.hostUpdated)==null?void 0:u.call(d)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(a)),this.updated(a)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(a){return!0}update(a){this._$Eq&&(this._$Eq=this._$Eq.forEach(n=>this._$ET(n,this[n]))),this._$EM()}updated(a){}firstUpdated(a){}};er.elementStyles=[],er.shadowRootOptions={mode:"open"},er[Dr("elementProperties")]=new Map,er[Dr("finalized")]=new Map,Yn==null||Yn({ReactiveElement:er}),(xi.reactiveElementVersions??(xi.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Mr=globalThis,xa=o=>o,un=Mr.trustedTypes,ba=un?un.createPolicy("lit-html",{createHTML:o=>o}):void 0,oo="$lit$",fi=`lit$${Math.random().toFixed(9).slice(2)}$`,lo="?"+fi,Ml=`<${lo}>`,Fi=document,Pr=()=>Fi.createComment(""),Br=o=>o===null||typeof o!="object"&&typeof o!="function",Ns=Array.isArray,Pl=o=>Ns(o)||typeof(o==null?void 0:o[Symbol.iterator])=="function",qn=`[ 	
\f\r]`,Tr=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,wa=/-->/g,_a=/>/g,Ri=RegExp(`>|${qn}(?:([^\\s"'>=/]+)(${qn}*=${qn}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),va=/'/g,ya=/"/g,co=/^(?:script|style|textarea|title)$/i,Bl=o=>(a,...n)=>({_$litType$:o,strings:a,values:n}),M=Bl(1),Ui=Symbol.for("lit-noChange"),He=Symbol.for("lit-nothing"),Ca=new WeakMap,Oi=Fi.createTreeWalker(Fi,129);function ho(o,a){if(!Ns(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return ba!==void 0?ba.createHTML(a):a}const Ll=(o,a)=>{const n=o.length-1,d=[];let u,g=a===2?"<svg>":a===3?"<math>":"",m=Tr;for(let C=0;C<n;C++){const A=o[C];let _,O,I=-1,H=0;for(;H<A.length&&(m.lastIndex=H,O=m.exec(A),O!==null);)H=m.lastIndex,m===Tr?O[1]==="!--"?m=wa:O[1]!==void 0?m=_a:O[2]!==void 0?(co.test(O[2])&&(u=RegExp("</"+O[2],"g")),m=Ri):O[3]!==void 0&&(m=Ri):m===Ri?O[0]===">"?(m=u??Tr,I=-1):O[1]===void 0?I=-2:(I=m.lastIndex-O[2].length,_=O[1],m=O[3]===void 0?Ri:O[3]==='"'?ya:va):m===ya||m===va?m=Ri:m===wa||m===_a?m=Tr:(m=Ri,u=void 0);const X=m===Ri&&o[C+1].startsWith("/>")?" ":"";g+=m===Tr?A+Ml:I>=0?(d.push(_),A.slice(0,I)+oo+A.slice(I)+fi+X):A+fi+(I===-2?C:X)}return[ho(o,g+(o[n]||"<?>")+(a===2?"</svg>":a===3?"</math>":"")),d]};class Lr{constructor({strings:a,_$litType$:n},d){let u;this.parts=[];let g=0,m=0;const C=a.length-1,A=this.parts,[_,O]=Ll(a,n);if(this.el=Lr.createElement(_,d),Oi.currentNode=this.el.content,n===2||n===3){const I=this.el.content.firstChild;I.replaceWith(...I.childNodes)}for(;(u=Oi.nextNode())!==null&&A.length<C;){if(u.nodeType===1){if(u.hasAttributes())for(const I of u.getAttributeNames())if(I.endsWith(oo)){const H=O[m++],X=u.getAttribute(I).split(fi),pe=/([.?@])?(.*)/.exec(H);A.push({type:1,index:g,name:pe[2],strings:X,ctor:pe[1]==="."?Ul:pe[1]==="?"?$l:pe[1]==="@"?zl:yn}),u.removeAttribute(I)}else I.startsWith(fi)&&(A.push({type:6,index:g}),u.removeAttribute(I));if(co.test(u.tagName)){const I=u.textContent.split(fi),H=I.length-1;if(H>0){u.textContent=un?un.emptyScript:"";for(let X=0;X<H;X++)u.append(I[X],Pr()),Oi.nextNode(),A.push({type:2,index:++g});u.append(I[H],Pr())}}}else if(u.nodeType===8)if(u.data===lo)A.push({type:2,index:g});else{let I=-1;for(;(I=u.data.indexOf(fi,I+1))!==-1;)A.push({type:7,index:g}),I+=fi.length-1}g++}}static createElement(a,n){const d=Fi.createElement("template");return d.innerHTML=a,d}}function sr(o,a,n=o,d){var m,C;if(a===Ui)return a;let u=d!==void 0?(m=n._$Co)==null?void 0:m[d]:n._$Cl;const g=Br(a)?void 0:a._$litDirective$;return(u==null?void 0:u.constructor)!==g&&((C=u==null?void 0:u._$AO)==null||C.call(u,!1),g===void 0?u=void 0:(u=new g(o),u._$AT(o,n,d)),d!==void 0?(n._$Co??(n._$Co=[]))[d]=u:n._$Cl=u),u!==void 0&&(a=sr(o,u._$AS(o,a.values),u,d)),a}class Fl{constructor(a,n){this._$AV=[],this._$AN=void 0,this._$AD=a,this._$AM=n}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(a){const{el:{content:n},parts:d}=this._$AD,u=((a==null?void 0:a.creationScope)??Fi).importNode(n,!0);Oi.currentNode=u;let g=Oi.nextNode(),m=0,C=0,A=d[0];for(;A!==void 0;){if(m===A.index){let _;A.type===2?_=new Ur(g,g.nextSibling,this,a):A.type===1?_=new A.ctor(g,A.name,A.strings,this,a):A.type===6&&(_=new Vl(g,this,a)),this._$AV.push(_),A=d[++C]}m!==(A==null?void 0:A.index)&&(g=Oi.nextNode(),m++)}return Oi.currentNode=Fi,u}p(a){let n=0;for(const d of this._$AV)d!==void 0&&(d.strings!==void 0?(d._$AI(a,d,n),n+=d.strings.length-2):d._$AI(a[n])),n++}}class Ur{get _$AU(){var a;return((a=this._$AM)==null?void 0:a._$AU)??this._$Cv}constructor(a,n,d,u){this.type=2,this._$AH=He,this._$AN=void 0,this._$AA=a,this._$AB=n,this._$AM=d,this.options=u,this._$Cv=(u==null?void 0:u.isConnected)??!0}get parentNode(){let a=this._$AA.parentNode;const n=this._$AM;return n!==void 0&&(a==null?void 0:a.nodeType)===11&&(a=n.parentNode),a}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(a,n=this){a=sr(this,a,n),Br(a)?a===He||a==null||a===""?(this._$AH!==He&&this._$AR(),this._$AH=He):a!==this._$AH&&a!==Ui&&this._(a):a._$litType$!==void 0?this.$(a):a.nodeType!==void 0?this.T(a):Pl(a)?this.k(a):this._(a)}O(a){return this._$AA.parentNode.insertBefore(a,this._$AB)}T(a){this._$AH!==a&&(this._$AR(),this._$AH=this.O(a))}_(a){this._$AH!==He&&Br(this._$AH)?this._$AA.nextSibling.data=a:this.T(Fi.createTextNode(a)),this._$AH=a}$(a){var g;const{values:n,_$litType$:d}=a,u=typeof d=="number"?this._$AC(a):(d.el===void 0&&(d.el=Lr.createElement(ho(d.h,d.h[0]),this.options)),d);if(((g=this._$AH)==null?void 0:g._$AD)===u)this._$AH.p(n);else{const m=new Fl(u,this),C=m.u(this.options);m.p(n),this.T(C),this._$AH=m}}_$AC(a){let n=Ca.get(a.strings);return n===void 0&&Ca.set(a.strings,n=new Lr(a)),n}k(a){Ns(this._$AH)||(this._$AH=[],this._$AR());const n=this._$AH;let d,u=0;for(const g of a)u===n.length?n.push(d=new Ur(this.O(Pr()),this.O(Pr()),this,this.options)):d=n[u],d._$AI(g),u++;u<n.length&&(this._$AR(d&&d._$AB.nextSibling,u),n.length=u)}_$AR(a=this._$AA.nextSibling,n){var d;for((d=this._$AP)==null?void 0:d.call(this,!1,!0,n);a!==this._$AB;){const u=xa(a).nextSibling;xa(a).remove(),a=u}}setConnected(a){var n;this._$AM===void 0&&(this._$Cv=a,(n=this._$AP)==null||n.call(this,a))}}class yn{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(a,n,d,u,g){this.type=1,this._$AH=He,this._$AN=void 0,this.element=a,this.name=n,this._$AM=u,this.options=g,d.length>2||d[0]!==""||d[1]!==""?(this._$AH=Array(d.length-1).fill(new String),this.strings=d):this._$AH=He}_$AI(a,n=this,d,u){const g=this.strings;let m=!1;if(g===void 0)a=sr(this,a,n,0),m=!Br(a)||a!==this._$AH&&a!==Ui,m&&(this._$AH=a);else{const C=a;let A,_;for(a=g[0],A=0;A<g.length-1;A++)_=sr(this,C[d+A],n,A),_===Ui&&(_=this._$AH[A]),m||(m=!Br(_)||_!==this._$AH[A]),_===He?a=He:a!==He&&(a+=(_??"")+g[A+1]),this._$AH[A]=_}m&&!u&&this.j(a)}j(a){a===He?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,a??"")}}class Ul extends yn{constructor(){super(...arguments),this.type=3}j(a){this.element[this.name]=a===He?void 0:a}}class $l extends yn{constructor(){super(...arguments),this.type=4}j(a){this.element.toggleAttribute(this.name,!!a&&a!==He)}}class zl extends yn{constructor(a,n,d,u,g){super(a,n,d,u,g),this.type=5}_$AI(a,n=this){if((a=sr(this,a,n,0)??He)===Ui)return;const d=this._$AH,u=a===He&&d!==He||a.capture!==d.capture||a.once!==d.once||a.passive!==d.passive,g=a!==He&&(d===He||u);u&&this.element.removeEventListener(this.name,this,d),g&&this.element.addEventListener(this.name,this,a),this._$AH=a}handleEvent(a){var n;typeof this._$AH=="function"?this._$AH.call(((n=this.options)==null?void 0:n.host)??this.element,a):this._$AH.handleEvent(a)}}class Vl{constructor(a,n,d){this.element=a,this.type=6,this._$AN=void 0,this._$AM=n,this.options=d}get _$AU(){return this._$AM._$AU}_$AI(a){sr(this,a)}}const Qn=Mr.litHtmlPolyfillSupport;Qn==null||Qn(Lr,Ur),(Mr.litHtmlVersions??(Mr.litHtmlVersions=[])).push("3.3.2");const Hl=(o,a,n)=>{const d=(n==null?void 0:n.renderBefore)??a;let u=d._$litPart$;if(u===void 0){const g=(n==null?void 0:n.renderBefore)??null;d._$litPart$=u=new Ur(a.insertBefore(Pr(),g),g,void 0,n??{})}return u._$AI(o),u};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Bi=globalThis;let Te=class extends er{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var n;const a=super.createRenderRoot();return(n=this.renderOptions).renderBefore??(n.renderBefore=a.firstChild),a}update(a){const n=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(a),this._$Do=Hl(n,this.renderRoot,this.renderOptions)}connectedCallback(){var a;super.connectedCallback(),(a=this._$Do)==null||a.setConnected(!0)}disconnectedCallback(){var a;super.disconnectedCallback(),(a=this._$Do)==null||a.setConnected(!1)}render(){return Ui}};var ro;Te._$litElement$=!0,Te.finalized=!0,(ro=Bi.litElementHydrateSupport)==null||ro.call(Bi,{LitElement:Te});const Jn=Bi.litElementPolyfillSupport;Jn==null||Jn({LitElement:Te});(Bi.litElementVersions??(Bi.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const st=o=>(a,n)=>{n!==void 0?n.addInitializer(()=>{customElements.define(o,a)}):customElements.define(o,a)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Gl={attribute:!0,type:String,converter:hn,reflect:!1,hasChanged:vn},Wl=(o=Gl,a,n)=>{const{kind:d,metadata:u}=n;let g=globalThis.litPropertyMetadata.get(u);if(g===void 0&&globalThis.litPropertyMetadata.set(u,g=new Map),d==="setter"&&((o=Object.create(o)).wrapped=!0),g.set(n.name,o),d==="accessor"){const{name:m}=n;return{set(C){const A=a.get.call(this);a.set.call(this,C),this.requestUpdate(m,A,o,!0,C)},init(C){return C!==void 0&&this.C(m,void 0,o,C),C}}}if(d==="setter"){const{name:m}=n;return function(C){const A=this[m];a.call(this,C),this.requestUpdate(m,A,o,!0,C)}}throw Error("Unsupported decorator location: "+d)};function Je(o){return(a,n)=>typeof n=="object"?Wl(o,a,n):((d,u,g)=>{const m=u.hasOwnProperty(g);return u.constructor.createProperty(g,d),m?Object.getOwnPropertyDescriptor(u,g):void 0})(o,a,n)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function F(o){return Je({...o,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Xl=(o,a,n)=>(n.configurable=!0,n.enumerable=!0,Reflect.decorate&&typeof a!="object"&&Object.defineProperty(o,a,n),n);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function $r(o,a){return(n,d,u)=>{const g=m=>{var C;return((C=m.renderRoot)==null?void 0:C.querySelector(o))??null};return Xl(n,d,{get(){return g(this)}})}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */window.Vaadin||(window.Vaadin={});var no;(no=window.Vaadin).featureFlags||(no.featureFlags={});function jl(o){return o.replace(/-[a-z]/gu,a=>a[1].toUpperCase())}const Zt={};function cr(o,a="25.1.0"){if(Object.defineProperty(o,"version",{get(){return a}}),o.experimental){const d=typeof o.experimental=="string"?o.experimental:`${jl(o.is.split("-").slice(1).join("-"))}Component`;if(!window.Vaadin.featureFlags[d]&&!Zt[d]){Zt[d]=new Set,Zt[d].add(o),Object.defineProperty(window.Vaadin.featureFlags,d,{get(){return Zt[d].size===0},set(u){u&&Zt[d].size>0&&(Zt[d].forEach(g=>{customElements.define(g.is,g)}),Zt[d].clear())}});return}else if(Zt[d]){Zt[d].add(o);return}}const n=customElements.get(o.is);if(!n)customElements.define(o.is,o);else{const d=n.version;d&&o.version&&d===o.version?console.warn(`The component ${o.is} has been loaded twice`):console.error(`Tried to define ${o.is} version ${o.version} when version ${n.version} is already in use. Something will probably break.`)}}const Kl=/\/\*[\*!]\s+vaadin-dev-mode:start([\s\S]*)vaadin-dev-mode:end\s+\*\*\//i,cn=window.Vaadin&&window.Vaadin.Flow&&window.Vaadin.Flow.clients;function Zl(){function o(){return!0}return uo(o)}function Yl(){try{return ql()?!0:Ql()?cn?!Jl():!Zl():!1}catch{return!1}}function ql(){return localStorage.getItem("vaadin.developmentmode.force")}function Ql(){return["localhost","127.0.0.1"].indexOf(window.location.hostname)>=0}function Jl(){return!!(cn&&Object.keys(cn).map(a=>cn[a]).filter(a=>a.productionMode).length>0)}function uo(o,a){if(typeof o!="function")return;const n=Kl.exec(o.toString());if(n)try{o=new Function(n[1])}catch(d){console.log("vaadin-development-mode-detector: uncommentAndRun() failed",d)}return o(a)}window.Vaadin=window.Vaadin||{};const Aa=function(o,a){if(window.Vaadin.developmentMode)return uo(o,a)};window.Vaadin.developmentMode===void 0&&(window.Vaadin.developmentMode=Yl());function ec(){/*! vaadin-dev-mode:start
  (function () {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var getPolymerVersion = function getPolymerVersion() {
  return window.Polymer && window.Polymer.version;
};

var StatisticsGatherer = function () {
  function StatisticsGatherer(logger) {
    classCallCheck(this, StatisticsGatherer);

    this.now = new Date().getTime();
    this.logger = logger;
  }

  createClass(StatisticsGatherer, [{
    key: 'frameworkVersionDetectors',
    value: function frameworkVersionDetectors() {
      return {
        'Flow': function Flow() {
          if (window.Vaadin && window.Vaadin.Flow && window.Vaadin.Flow.clients) {
            var flowVersions = Object.keys(window.Vaadin.Flow.clients).map(function (key) {
              return window.Vaadin.Flow.clients[key];
            }).filter(function (client) {
              return client.getVersionInfo;
            }).map(function (client) {
              return client.getVersionInfo().flow;
            });
            if (flowVersions.length > 0) {
              return flowVersions[0];
            }
          }
        },
        'Vaadin Framework': function VaadinFramework() {
          if (window.vaadin && window.vaadin.clients) {
            var frameworkVersions = Object.values(window.vaadin.clients).filter(function (client) {
              return client.getVersionInfo;
            }).map(function (client) {
              return client.getVersionInfo().vaadinVersion;
            });
            if (frameworkVersions.length > 0) {
              return frameworkVersions[0];
            }
          }
        },
        'AngularJs': function AngularJs() {
          if (window.angular && window.angular.version && window.angular.version) {
            return window.angular.version.full;
          }
        },
        'Angular': function Angular() {
          if (window.ng) {
            var tags = document.querySelectorAll("[ng-version]");
            if (tags.length > 0) {
              return tags[0].getAttribute("ng-version");
            }
            return "Unknown";
          }
        },
        'Backbone.js': function BackboneJs() {
          if (window.Backbone) {
            return window.Backbone.VERSION;
          }
        },
        'React': function React() {
          var reactSelector = '[data-reactroot], [data-reactid]';
          if (!!document.querySelector(reactSelector)) {
            // React does not publish the version by default
            return "unknown";
          }
        },
        'Ember': function Ember() {
          if (window.Em && window.Em.VERSION) {
            return window.Em.VERSION;
          } else if (window.Ember && window.Ember.VERSION) {
            return window.Ember.VERSION;
          }
        },
        'jQuery': function (_jQuery) {
          function jQuery() {
            return _jQuery.apply(this, arguments);
          }

          jQuery.toString = function () {
            return _jQuery.toString();
          };

          return jQuery;
        }(function () {
          if (typeof jQuery === 'function' && jQuery.prototype.jquery !== undefined) {
            return jQuery.prototype.jquery;
          }
        }),
        'Polymer': function Polymer() {
          var version = getPolymerVersion();
          if (version) {
            return version;
          }
        },
        'LitElement': function LitElement() {
          var version = window.litElementVersions && window.litElementVersions[0];
          if (version) {
            return version;
          }
        },
        'LitHtml': function LitHtml() {
          var version = window.litHtmlVersions && window.litHtmlVersions[0];
          if (version) {
            return version;
          }
        },
        'Vue.js': function VueJs() {
          if (window.Vue) {
            return window.Vue.version;
          }
        }
      };
    }
  }, {
    key: 'getUsedVaadinElements',
    value: function getUsedVaadinElements(elements) {
      var version = getPolymerVersion();
      var elementClasses = void 0;
      // NOTE: In case you edit the code here, YOU MUST UPDATE any statistics reporting code in Flow.
      // Check all locations calling the method getEntries() in
      // https://github.com/vaadin/flow/blob/master/flow-server/src/main/java/com/vaadin/flow/internal/UsageStatistics.java#L106
      // Currently it is only used by BootstrapHandler.
      if (version && version.indexOf('2') === 0) {
        // Polymer 2: components classes are stored in window.Vaadin
        elementClasses = Object.keys(window.Vaadin).map(function (c) {
          return window.Vaadin[c];
        }).filter(function (c) {
          return c.is;
        });
      } else {
        // Polymer 3: components classes are stored in window.Vaadin.registrations
        elementClasses = window.Vaadin.registrations || [];
      }
      elementClasses.forEach(function (klass) {
        var version = klass.version ? klass.version : "0.0.0";
        elements[klass.is] = { version: version };
      });
    }
  }, {
    key: 'getUsedVaadinThemes',
    value: function getUsedVaadinThemes(themes) {
      ['Lumo', 'Material'].forEach(function (themeName) {
        var theme;
        var version = getPolymerVersion();
        if (version && version.indexOf('2') === 0) {
          // Polymer 2: themes are stored in window.Vaadin
          theme = window.Vaadin[themeName];
        } else {
          // Polymer 3: themes are stored in custom element registry
          theme = customElements.get('vaadin-' + themeName.toLowerCase() + '-styles');
        }
        if (theme && theme.version) {
          themes[themeName] = { version: theme.version };
        }
      });
    }
  }, {
    key: 'getFrameworks',
    value: function getFrameworks(frameworks) {
      var detectors = this.frameworkVersionDetectors();
      Object.keys(detectors).forEach(function (framework) {
        var detector = detectors[framework];
        try {
          var version = detector();
          if (version) {
            frameworks[framework] = { version: version };
          }
        } catch (e) {}
      });
    }
  }, {
    key: 'gather',
    value: function gather(storage) {
      var storedStats = storage.read();
      var gatheredStats = {};
      var types = ["elements", "frameworks", "themes"];

      types.forEach(function (type) {
        gatheredStats[type] = {};
        if (!storedStats[type]) {
          storedStats[type] = {};
        }
      });

      var previousStats = JSON.stringify(storedStats);

      this.getUsedVaadinElements(gatheredStats.elements);
      this.getFrameworks(gatheredStats.frameworks);
      this.getUsedVaadinThemes(gatheredStats.themes);

      var now = this.now;
      types.forEach(function (type) {
        var keys = Object.keys(gatheredStats[type]);
        keys.forEach(function (key) {
          if (!storedStats[type][key] || _typeof(storedStats[type][key]) != _typeof({})) {
            storedStats[type][key] = { firstUsed: now };
          }
          // Discards any previously logged version number
          storedStats[type][key].version = gatheredStats[type][key].version;
          storedStats[type][key].lastUsed = now;
        });
      });

      var newStats = JSON.stringify(storedStats);
      storage.write(newStats);
      if (newStats != previousStats && Object.keys(storedStats).length > 0) {
        this.logger.debug("New stats: " + newStats);
      }
    }
  }]);
  return StatisticsGatherer;
}();

var StatisticsStorage = function () {
  function StatisticsStorage(key) {
    classCallCheck(this, StatisticsStorage);

    this.key = key;
  }

  createClass(StatisticsStorage, [{
    key: 'read',
    value: function read() {
      var localStorageStatsString = localStorage.getItem(this.key);
      try {
        return JSON.parse(localStorageStatsString ? localStorageStatsString : '{}');
      } catch (e) {
        return {};
      }
    }
  }, {
    key: 'write',
    value: function write(data) {
      localStorage.setItem(this.key, data);
    }
  }, {
    key: 'clear',
    value: function clear() {
      localStorage.removeItem(this.key);
    }
  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      var storedStats = this.read();
      var empty = true;
      Object.keys(storedStats).forEach(function (key) {
        if (Object.keys(storedStats[key]).length > 0) {
          empty = false;
        }
      });

      return empty;
    }
  }]);
  return StatisticsStorage;
}();

var StatisticsSender = function () {
  function StatisticsSender(url, logger) {
    classCallCheck(this, StatisticsSender);

    this.url = url;
    this.logger = logger;
  }

  createClass(StatisticsSender, [{
    key: 'send',
    value: function send(data, errorHandler) {
      var logger = this.logger;

      if (navigator.onLine === false) {
        logger.debug("Offline, can't send");
        errorHandler();
        return;
      }
      logger.debug("Sending data to " + this.url);

      var req = new XMLHttpRequest();
      req.withCredentials = true;
      req.addEventListener("load", function () {
        // Stats sent, nothing more to do
        logger.debug("Response: " + req.responseText);
      });
      req.addEventListener("error", function () {
        logger.debug("Send failed");
        errorHandler();
      });
      req.addEventListener("abort", function () {
        logger.debug("Send aborted");
        errorHandler();
      });
      req.open("POST", this.url);
      req.setRequestHeader("Content-Type", "application/json");
      req.send(data);
    }
  }]);
  return StatisticsSender;
}();

var StatisticsLogger = function () {
  function StatisticsLogger(id) {
    classCallCheck(this, StatisticsLogger);

    this.id = id;
  }

  createClass(StatisticsLogger, [{
    key: '_isDebug',
    value: function _isDebug() {
      return localStorage.getItem("vaadin." + this.id + ".debug");
    }
  }, {
    key: 'debug',
    value: function debug(msg) {
      if (this._isDebug()) {
        console.info(this.id + ": " + msg);
      }
    }
  }]);
  return StatisticsLogger;
}();

var UsageStatistics = function () {
  function UsageStatistics() {
    classCallCheck(this, UsageStatistics);

    this.now = new Date();
    this.timeNow = this.now.getTime();
    this.gatherDelay = 10; // Delay between loading this file and gathering stats
    this.initialDelay = 24 * 60 * 60;

    this.logger = new StatisticsLogger("statistics");
    this.storage = new StatisticsStorage("vaadin.statistics.basket");
    this.gatherer = new StatisticsGatherer(this.logger);
    this.sender = new StatisticsSender("https://tools.vaadin.com/usage-stats/submit", this.logger);
  }

  createClass(UsageStatistics, [{
    key: 'maybeGatherAndSend',
    value: function maybeGatherAndSend() {
      var _this = this;

      if (localStorage.getItem(UsageStatistics.optOutKey)) {
        return;
      }
      this.gatherer.gather(this.storage);
      setTimeout(function () {
        _this.maybeSend();
      }, this.gatherDelay * 1000);
    }
  }, {
    key: 'lottery',
    value: function lottery() {
      return true;
    }
  }, {
    key: 'currentMonth',
    value: function currentMonth() {
      return this.now.getYear() * 12 + this.now.getMonth();
    }
  }, {
    key: 'maybeSend',
    value: function maybeSend() {
      var firstUse = Number(localStorage.getItem(UsageStatistics.firstUseKey));
      var monthProcessed = Number(localStorage.getItem(UsageStatistics.monthProcessedKey));

      if (!firstUse) {
        // Use a grace period to avoid interfering with tests, incognito mode etc
        firstUse = this.timeNow;
        localStorage.setItem(UsageStatistics.firstUseKey, firstUse);
      }

      if (this.timeNow < firstUse + this.initialDelay * 1000) {
        this.logger.debug("No statistics will be sent until the initial delay of " + this.initialDelay + "s has passed");
        return;
      }
      if (this.currentMonth() <= monthProcessed) {
        this.logger.debug("This month has already been processed");
        return;
      }
      localStorage.setItem(UsageStatistics.monthProcessedKey, this.currentMonth());
      // Use random sampling
      if (this.lottery()) {
        this.logger.debug("Congratulations, we have a winner!");
      } else {
        this.logger.debug("Sorry, no stats from you this time");
        return;
      }

      this.send();
    }
  }, {
    key: 'send',
    value: function send() {
      // Ensure we have the latest data
      this.gatherer.gather(this.storage);

      // Read, send and clean up
      var data = this.storage.read();
      data["firstUse"] = Number(localStorage.getItem(UsageStatistics.firstUseKey));
      data["usageStatisticsVersion"] = UsageStatistics.version;
      var info = 'This request contains usage statistics gathered from the application running in development mode. \n\nStatistics gathering is automatically disabled and excluded from production builds.\n\nFor details and to opt-out, see https://github.com/vaadin/vaadin-usage-statistics.\n\n\n\n';
      var self = this;
      this.sender.send(info + JSON.stringify(data), function () {
        // Revert the 'month processed' flag
        localStorage.setItem(UsageStatistics.monthProcessedKey, self.currentMonth() - 1);
      });
    }
  }], [{
    key: 'version',
    get: function get$1() {
      return '2.1.2';
    }
  }, {
    key: 'firstUseKey',
    get: function get$1() {
      return 'vaadin.statistics.firstuse';
    }
  }, {
    key: 'monthProcessedKey',
    get: function get$1() {
      return 'vaadin.statistics.monthProcessed';
    }
  }, {
    key: 'optOutKey',
    get: function get$1() {
      return 'vaadin.statistics.optout';
    }
  }]);
  return UsageStatistics;
}();

try {
  window.Vaadin = window.Vaadin || {};
  window.Vaadin.usageStatsChecker = window.Vaadin.usageStatsChecker || new UsageStatistics();
  window.Vaadin.usageStatsChecker.maybeGatherAndSend();
} catch (e) {
  // Intentionally ignored as this is not a problem in the app being developed
}

}());

  vaadin-dev-mode:end **/}const tc=function(){if(typeof Aa=="function")return Aa(ec)};/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */let Ea=0,fo=0;const ir=[];let us=!1;function ic(){us=!1;const o=ir.length;for(let a=0;a<o;a++){const n=ir[a];if(n)try{n()}catch(d){setTimeout(()=>{throw d})}}ir.splice(0,o),fo+=o}const rc={after(o){return{run(a){return window.setTimeout(a,o)},cancel(a){window.clearTimeout(a)}}},run(o,a){return window.setTimeout(o,a)},cancel(o){window.clearTimeout(o)}},nc={run(o){return window.requestAnimationFrame(o)},cancel(o){window.cancelAnimationFrame(o)}},sc={run(o){return window.requestIdleCallback?window.requestIdleCallback(o):window.setTimeout(o,16)},cancel(o){window.cancelIdleCallback?window.cancelIdleCallback(o):window.clearTimeout(o)}},ac={run(o){us||(us=!0,queueMicrotask(()=>ic())),ir.push(o);const a=Ea;return Ea+=1,a},cancel(o){const a=o-fo;if(a>=0){if(!ir[a])throw new Error(`invalid async handle: ${o}`);ir[a]=null}}};/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const fs=new Set;class ar{static debounce(a,n,d){return a instanceof ar?a._cancelAsync():a=new ar,a.setConfig(n,d),a}constructor(){this._asyncModule=null,this._callback=null,this._timer=null}setConfig(a,n){this._asyncModule=a,this._callback=n,this._timer=this._asyncModule.run(()=>{this._timer=null,fs.delete(this),this._callback()})}cancel(){this.isActive()&&(this._cancelAsync(),fs.delete(this))}_cancelAsync(){this.isActive()&&(this._asyncModule.cancel(this._timer),this._timer=null)}flush(){this.isActive()&&(this.cancel(),this._callback())}isActive(){return this._timer!=null}}function oc(o){fs.add(o)}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Yt=[];function gs(o,a,n=o.getAttribute("dir")){a?o.setAttribute("dir",a):n!=null&&o.removeAttribute("dir")}function ps(){return document.documentElement.getAttribute("dir")}function lc(){const o=ps();Yt.forEach(a=>{gs(a,o)})}const cc=new MutationObserver(lc);cc.observe(document.documentElement,{attributes:!0,attributeFilter:["dir"]});const go=o=>class extends o{static get properties(){return{dir:{type:String,value:"",reflectToAttribute:!0,converter:{fromAttribute:n=>n||"",toAttribute:n=>n===""?null:n}}}}get __isRTL(){return this.getAttribute("dir")==="rtl"}connectedCallback(){super.connectedCallback(),(!this.hasAttribute("dir")||this.__restoreSubscription)&&(this.__subscribe(),gs(this,ps(),null))}attributeChangedCallback(n,d,u){if(super.attributeChangedCallback(n,d,u),n!=="dir")return;const g=ps(),m=u===g&&Yt.indexOf(this)===-1,C=!u&&d&&Yt.indexOf(this)===-1;m||C?(this.__subscribe(),gs(this,g,u)):u!==g&&d===g&&this.__unsubscribe()}disconnectedCallback(){super.disconnectedCallback(),this.__restoreSubscription=Yt.includes(this),this.__unsubscribe()}_valueToNodeAttribute(n,d,u){u==="dir"&&d===""&&!n.hasAttribute("dir")||super._valueToNodeAttribute(n,d,u)}_attributeToProperty(n,d,u){n==="dir"&&!d?this.dir="":super._attributeToProperty(n,d,u)}__subscribe(){Yt.includes(this)||Yt.push(this)}__unsubscribe(){Yt.includes(this)&&Yt.splice(Yt.indexOf(this),1)}};/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */window.Vaadin||(window.Vaadin={});window.Vaadin.registrations||(window.Vaadin.registrations=[]);window.Vaadin.developmentModeCallback||(window.Vaadin.developmentModeCallback={});window.Vaadin.developmentModeCallback["vaadin-usage-statistics"]=function(){tc()};let es;const Sa=new Set,zr=o=>class extends go(o){static _ensureRegistrations(){const{is:n}=this;if(n&&!Sa.has(n)){window.Vaadin.registrations.push(this),Sa.add(n);const d=window.Vaadin.developmentModeCallback;d&&(es=ar.debounce(es,sc,()=>{d["vaadin-usage-statistics"]()}),oc(es))}}constructor(){super(),document.doctype===null&&console.warn('Vaadin components require the "standards mode" declaration. Please add <!DOCTYPE html> to the HTML document.'),this.constructor._ensureRegistrations()}},po=new WeakMap;function dc(o,a){let n=a;for(;n;){if(po.get(n)===o)return!0;n=Object.getPrototypeOf(n)}return!1}function Lt(o){return a=>{if(dc(o,a))return a;const n=o(a);return po.set(n,o),n}}/**
 * @license
 * Copyright (c) 2023 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */function hc(o,a){return o.split(".").reduce((n,d)=>n?n[d]:void 0,a)}function uc(o,a,n){const d=o.split("."),u=d.pop(),g=d.reduce((m,C)=>m[C],n);g[u]=a}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ts={},fc=/([A-Z])/gu;function Ia(o){return ts[o]||(ts[o]=o.replace(fc,"-$1").toLowerCase()),ts[o]}function Ta(o){return o[0].toUpperCase()+o.substring(1)}function is(o){const[a,n]=o.split("("),d=n.replace(")","").split(",").map(u=>u.trim());return{method:a,observerProps:d}}function rs(o,a){return Object.prototype.hasOwnProperty.call(o,a)||(o[a]=new Map(o[a])),o[a]}const gc=o=>{class a extends o{static createProperty(d,u){[String,Boolean,Number,Array].includes(u)&&(u={type:u}),u&&u.reflectToAttribute&&(u.reflect=!0),super.createProperty(d,u)}static getOrCreateMap(d){return rs(this,d)}static finalize(){if(window.litIssuedWarnings&&(window.litIssuedWarnings.add("no-override-create-property"),window.litIssuedWarnings.add("no-override-get-property-descriptor")),super.finalize(),Array.isArray(this.observers)){const d=this.getOrCreateMap("__complexObservers");this.observers.forEach(u=>{const{method:g,observerProps:m}=is(u);d.set(g,m)})}}static addCheckedInitializer(d){super.addInitializer(u=>{u instanceof this&&d(u)})}static getPropertyDescriptor(d,u,g){const m=super.getPropertyDescriptor(d,u,g);let C=m;if(this.getOrCreateMap("__propKeys").set(d,u),g.sync&&(C={get:m.get,set(A){const _=this[d];vn(A,_)&&(this[u]=A,this.requestUpdate(d,_,g),this.hasUpdated&&this.performUpdate())},configurable:!0,enumerable:!0}),g.readOnly){const A=C.set;this.addCheckedInitializer(_=>{_[`_set${Ta(d)}`]=function(O){A.call(_,O)}}),C={get:C.get,set(){},configurable:!0,enumerable:!0}}if("value"in g&&this.addCheckedInitializer(A=>{const _=typeof g.value=="function"?g.value.call(A):g.value;g.readOnly?A[`_set${Ta(d)}`](_):A[d]=_}),g.observer){const A=g.observer;this.getOrCreateMap("__observers").set(d,A),this.addCheckedInitializer(_=>{_[A]||console.warn(`observer method ${A} not defined`)})}if(g.notify){if(!this.__notifyProps)this.__notifyProps=new Set;else if(!this.hasOwnProperty("__notifyProps")){const A=this.__notifyProps;this.__notifyProps=new Set(A)}this.__notifyProps.add(d)}if(g.computed){const A=`__assignComputed${d}`,_=is(g.computed);this.prototype[A]=function(...O){this[d]=this[_.method](...O)},this.getOrCreateMap("__computedObservers").set(A,_.observerProps)}return g.attribute||(g.attribute=Ia(d)),C}static get polylitConfig(){return{asyncFirstRender:!1}}connectedCallback(){super.connectedCallback();const{polylitConfig:d}=this.constructor;!this.hasUpdated&&!d.asyncFirstRender&&this.performUpdate()}firstUpdated(){super.firstUpdated(),this.$||(this.$={}),this.renderRoot.querySelectorAll("[id]").forEach(d=>{this.$[d.id]=d})}ready(){}willUpdate(d){this.constructor.__computedObservers&&this.__runComplexObservers(d,this.constructor.__computedObservers)}updated(d){const u=this.__isReadyInvoked;this.__isReadyInvoked=!0,this.constructor.__observers&&this.__runObservers(d,this.constructor.__observers),this.constructor.__complexObservers&&this.__runComplexObservers(d,this.constructor.__complexObservers),this.__dynamicPropertyObservers&&this.__runDynamicObservers(d,this.__dynamicPropertyObservers),this.__dynamicMethodObservers&&this.__runComplexObservers(d,this.__dynamicMethodObservers),this.constructor.__notifyProps&&this.__runNotifyProps(d,this.constructor.__notifyProps),u||this.ready()}setProperties(d){Object.entries(d).forEach(([u,g])=>{const m=this.constructor.__propKeys.get(u),C=this[m];this[m]=g,this.requestUpdate(u,C)}),this.hasUpdated&&this.performUpdate()}_createMethodObserver(d){const u=rs(this,"__dynamicMethodObservers"),{method:g,observerProps:m}=is(d);u.set(g,m)}_createPropertyObserver(d,u){rs(this,"__dynamicPropertyObservers").set(u,d)}__runComplexObservers(d,u){u.forEach((g,m)=>{g.some(C=>d.has(C))&&(this[m]?this[m](...g.map(C=>this[C])):console.warn(`observer method ${m} not defined`))})}__runDynamicObservers(d,u){u.forEach((g,m)=>{d.has(g)&&this[m]&&this[m](this[g],d.get(g))})}__runObservers(d,u){d.forEach((g,m)=>{const C=u.get(m);C!==void 0&&this[C]&&this[C](this[m],g)})}__runNotifyProps(d,u){d.forEach((g,m)=>{u.has(m)&&this.dispatchEvent(new CustomEvent(`${Ia(m)}-changed`,{detail:{value:this[m]}}))})}_get(d,u){return hc(d,u)}_set(d,u,g){uc(d,u,g)}}return ua(a,"enabledWarnings",[]),a},dr=Lt(gc);/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */function ks(o){return o?new Set(o.split(" ")):new Set}function Cn(o){return o?[...o].join(" "):""}function mo(o,a,n){const d=ks(o.getAttribute(a));d.add(n),o.setAttribute(a,Cn(d))}function pc(o,a,n){const d=ks(o.getAttribute(a));if(d.delete(n),d.size===0){o.removeAttribute(a);return}o.setAttribute(a,Cn(d))}function mc(o){return o.nodeType===Node.TEXT_NODE&&o.textContent.trim()===""}/**
 * @license
 * Copyright (c) 2023 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class xc{constructor(a,n,d){this.slot=a,this.callback=n,this.forceInitial=d,this._storedNodes=[],this._connected=!1,this._scheduled=!1,this._boundSchedule=()=>{this._schedule()},this.connect(),this._schedule()}connect(){this.slot.addEventListener("slotchange",this._boundSchedule),this._connected=!0}disconnect(){this.slot.removeEventListener("slotchange",this._boundSchedule),this._connected=!1}_schedule(){this._scheduled||(this._scheduled=!0,queueMicrotask(()=>{this.flush()}))}flush(){this._connected&&(this._scheduled=!1,this._processNodes())}_processNodes(){const a=this.slot.assignedNodes({flatten:!0});let n=[];const d=[],u=[];a.length&&(n=a.filter(g=>!this._storedNodes.includes(g))),this._storedNodes.length&&this._storedNodes.forEach((g,m)=>{const C=a.indexOf(g);C===-1?d.push(g):C!==m&&u.push(g)}),(n.length||d.length||u.length||this.forceInitial)&&this.callback({addedNodes:n,currentNodes:a,movedNodes:u,removedNodes:d}),this.forceInitial&&(this.forceInitial=!1),this._storedNodes=a}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */let bc=0;function wc(){return bc++}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class An extends EventTarget{static generateId(a,n="default"){return`${n}-${a.localName}-${wc()}`}constructor(a,n,d,u={}){super();const{initializer:g,multiple:m,observe:C,useUniqueId:A,uniqueIdPrefix:_}=u;this.host=a,this.slotName=n,this.tagName=d,this.observe=typeof C=="boolean"?C:!0,this.multiple=typeof m=="boolean"?m:!1,this.slotInitializer=g,m&&(this.nodes=[]),A&&(this.defaultId=this.constructor.generateId(a,_||n))}hostConnected(){this.initialized||(this.multiple?this.initMultiple():this.initSingle(),this.observe&&this.observeSlot(),this.initialized=!0)}initSingle(){let a=this.getSlotChild();a?(this.node=a,this.initAddedNode(a)):(a=this.attachDefaultNode(),this.initNode(a))}initMultiple(){const a=this.getSlotChildren();if(a.length===0){const n=this.attachDefaultNode();n&&(this.nodes=[n],this.initNode(n))}else this.nodes=a,a.forEach(n=>{this.initAddedNode(n)})}attachDefaultNode(){const{host:a,slotName:n,tagName:d}=this;let u=this.defaultNode;return!u&&d&&(u=document.createElement(d),u instanceof Element&&(n!==""&&u.setAttribute("slot",n),this.defaultNode=u)),u&&(this.node=u,a.appendChild(u)),u}getSlotChildren(){const{slotName:a}=this;return Array.from(this.host.childNodes).filter(n=>n.nodeType===Node.ELEMENT_NODE&&n.hasAttribute("data-slot-ignore")?!1:n.nodeType===Node.ELEMENT_NODE&&n.slot===a||n.nodeType===Node.TEXT_NODE&&n.textContent.trim()&&a==="")}getSlotChild(){return this.getSlotChildren()[0]}initNode(a){const{slotInitializer:n}=this;n&&n(a,this.host)}initCustomNode(a){}teardownNode(a){}initAddedNode(a){a!==this.defaultNode&&(this.initCustomNode(a),this.initNode(a))}observeSlot(){const{slotName:a}=this,n=a===""?"slot:not([name])":`slot[name=${a}]`,d=this.host.shadowRoot.querySelector(n);this.__slotObserver=new xc(d,({addedNodes:u,removedNodes:g})=>{const m=this.multiple?this.nodes:[this.node],C=u.filter(A=>!mc(A)&&!m.includes(A)&&!(A.nodeType===Node.ELEMENT_NODE&&A.hasAttribute("data-slot-ignore")));g.length&&(this.nodes=m.filter(A=>!g.includes(A)),g.forEach(A=>{this.teardownNode(A)})),C&&C.length>0&&(this.multiple?(this.defaultNode&&this.defaultNode.remove(),this.nodes=[...m,...C].filter(A=>A!==this.defaultNode),C.forEach(A=>{this.initAddedNode(A)})):(this.node&&this.node.remove(),this.node=C[0],this.initAddedNode(this.node)))})}}/**
 * @license
 * Copyright (c) 2022 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Rs extends An{constructor(a){super(a,"tooltip"),this.setTarget(a),this.__onContentChange=this.__onContentChange.bind(this)}initCustomNode(a){a.target=this.target,this.ariaTarget!==void 0&&(a.ariaTarget=this.ariaTarget),this.context!==void 0&&(a.context=this.context),this.manual!==void 0&&(a.manual=this.manual),this.opened!==void 0&&(a.opened=this.opened),this.position!==void 0&&(a._position=this.position),this.shouldShow!==void 0&&(a.shouldShow=this.shouldShow),this.manual||this.host.setAttribute("has-tooltip",""),this.__notifyChange(a),a.addEventListener("content-changed",this.__onContentChange)}teardownNode(a){this.manual||this.host.removeAttribute("has-tooltip"),a.removeEventListener("content-changed",this.__onContentChange),this.__notifyChange(null)}setAriaTarget(a){this.ariaTarget=a;const n=this.node;n&&(n.ariaTarget=a)}setContext(a){this.context=a;const n=this.node;n&&(n.context=a)}setManual(a){this.manual=a;const n=this.node;n&&(n.manual=a)}setOpened(a){this.opened=a;const n=this.node;n&&(n.opened=a)}setPosition(a){this.position=a;const n=this.node;n&&(n._position=a)}setShouldShow(a){this.shouldShow=a;const n=this.node;n&&(n.shouldShow=a)}setTarget(a){this.target=a;const n=this.node;n&&(n.target=a)}__onContentChange(a){this.__notifyChange(a.target)}__notifyChange(a){this.dispatchEvent(new CustomEvent("tooltip-changed",{detail:{node:a}}))}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */var Jt,gi,Mi,nr,Nt,Rr,Or;const Hs=class Hs extends EventTarget{constructor(n){super();Dt(this,Nt);Dt(this,Jt);Dt(this,gi,new Set);Dt(this,Mi);Dt(this,nr,!1);ki(this,Jt,n),ki(this,Mi,new CSSStyleSheet)}observe(n){this.connect(),!ge(this,gi).has(n)&&(ge(this,gi).add(n),ge(this,Mi).replaceSync(`
      :root::before, :host::before {
        content: '' !important;
        position: absolute !important;
        top: -9999px !important;
        left: -9999px !important;
        visibility: hidden !important;
        transition: 1ms allow-discrete step-end !important;
        transition-property: ${[...ge(this,gi)].join(", ")} !important;
      }
    `))}connect(){ge(this,nr)||(ge(this,Jt).adoptedStyleSheets.unshift(ge(this,Mi)),ge(this,Nt,Or).addEventListener("transitionstart",n=>Kt(this,Nt,Rr).call(this,n)),ge(this,Nt,Or).addEventListener("transitionend",n=>Kt(this,Nt,Rr).call(this,n)),ki(this,nr,!0))}disconnect(){ge(this,gi).clear(),ge(this,Jt).adoptedStyleSheets=ge(this,Jt).adoptedStyleSheets.filter(n=>n!==ge(this,Mi)),ge(this,Nt,Or).removeEventListener("transitionstart",Kt(this,Nt,Rr)),ge(this,Nt,Or).removeEventListener("transitionend",Kt(this,Nt,Rr)),ki(this,nr,!1)}static for(n){return n.__cssPropertyObserver||(n.__cssPropertyObserver=new Hs(n)),n.__cssPropertyObserver}};Jt=new WeakMap,gi=new WeakMap,Mi=new WeakMap,nr=new WeakMap,Nt=new WeakSet,Rr=function(n){const{propertyName:d}=n;ge(this,gi).has(d)&&this.dispatchEvent(new CustomEvent("property-changed",{detail:{propertyName:d}}))},Or=function(){return ge(this,Jt).documentElement??ge(this,Jt).host};let ms=Hs;/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */function _c(o){const{baseStyles:a,themeStyles:n,elementStyles:d,lumoInjector:u}=o.constructor,g=o.__lumoStyleSheet;return g&&(a||n)?[...u.includeBaseStyles?a:[],g,...n]:[g,...d].filter(Boolean)}function xo(o){ao(o.shadowRoot,_c(o))}function Na(o,a){o.__lumoStyleSheet=a,xo(o)}function ns(o){o.__lumoStyleSheet=void 0,xo(o)}/**
 * @license
 * Copyright (c) 2000 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ka=new Set;function bo(o){ka.has(o)||(ka.add(o),console.warn(o))}/**
 * @license
 * Copyright (c) 2000 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Ra=new WeakMap;function Oa(o){try{return o.media.mediaText}catch{return bo('[LumoInjector] Browser denied to access property "mediaText" for some CSS rules, so they were skipped.'),""}}function vc(o){try{return o.cssRules}catch{return bo('[LumoInjector] Browser denied to access property "cssRules" for some CSS stylesheets, so they were skipped.'),[]}}function wo(o,a={tags:new Map,modules:new Map}){var n;for(const d of vc(o)){if(d instanceof CSSImportRule){const u=Oa(d);u.startsWith("lumo_")?a.modules.set(u,[...d.styleSheet.cssRules]):wo(d.styleSheet,a);continue}if(d instanceof CSSMediaRule){const u=Oa(d);u.startsWith("lumo_")&&a.modules.set(u,[...d.cssRules]);continue}if(d instanceof CSSStyleRule&&d.cssText.includes("-inject")){for(const u of d.style){const g=(n=u.match(/^--_lumo-(.*)-inject-modules$/u))==null?void 0:n[1];if(!g)continue;const m=d.style.getPropertyValue(u);a.tags.set(g,m.split(",").map(C=>C.trim().replace(/'|"/gu,"")))}continue}}return a}function yc(o){let a=new Map,n=new Map;for(const d of o){let u=Ra.get(d);u||(u=wo(d),Ra.set(d,u)),a=new Map([...a,...u.tags]),n=new Map([...n,...u.modules])}return{tags:a,modules:n}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */function _o(o){return`--_lumo-${o.is}-inject`}var Fr,Pi,pi,ei,Wt,vo,dn,yo;class Cc{constructor(a=document){Dt(this,Wt);Dt(this,Fr);Dt(this,Pi);Dt(this,pi,new Map);Dt(this,ei,new Map);ki(this,Fr,a),this.handlePropertyChange=this.handlePropertyChange.bind(this),ki(this,Pi,ms.for(a)),ge(this,Pi).addEventListener("property-changed",this.handlePropertyChange)}disconnect(){ge(this,Pi).removeEventListener("property-changed",this.handlePropertyChange),ge(this,pi).clear(),ge(this,ei).values().forEach(a=>a.forEach(ns))}forceUpdate(){for(const a of ge(this,pi).keys())Kt(this,Wt,dn).call(this,a)}componentConnected(a){const{lumoInjector:n}=a.constructor,{is:d}=n;ge(this,ei).set(d,ge(this,ei).get(d)??new Set),ge(this,ei).get(d).add(a);const u=ge(this,pi).get(d);if(u){u.cssRules.length>0&&Na(a,u);return}Kt(this,Wt,vo).call(this,d);const g=_o(n);ge(this,Pi).observe(g)}componentDisconnected(a){var d;const{is:n}=a.constructor.lumoInjector;(d=ge(this,ei).get(n))==null||d.delete(a),ns(a)}handlePropertyChange(a){var u;const{propertyName:n}=a.detail,d=(u=n.match(/^--_lumo-(.*)-inject$/u))==null?void 0:u[1];d&&Kt(this,Wt,dn).call(this,d)}}Fr=new WeakMap,Pi=new WeakMap,pi=new WeakMap,ei=new WeakMap,Wt=new WeakSet,vo=function(a){ge(this,pi).set(a,new CSSStyleSheet),Kt(this,Wt,dn).call(this,a)},dn=function(a){var m;const{tags:n,modules:d}=yc(ge(this,Wt,yo)),u=(n.get(a)??[]).flatMap(C=>d.get(C)??[]).map(C=>C.cssText).join(`
`),g=ge(this,pi).get(a);g.replaceSync(u),(m=ge(this,ei).get(a))==null||m.forEach(C=>{u?Na(C,g):ns(C)})},yo=function(){let a=new Set;for(const n of[ge(this,Fr),document])a=a.union(new Set(n.styleSheets)),a=a.union(new Set(n.adoptedStyleSheets));return[...a]};/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Da=new Set;function Co(o){const a=o.getRootNode();return a.host&&a.host.constructor.version?Co(a.host):a}const hr=o=>class extends o{static finalize(){super.finalize();const n=_o(this.lumoInjector);this.is&&!Da.has(n)&&(Da.add(n),CSS.registerProperty({name:n,syntax:"<number>",inherits:!0,initialValue:"0"}))}static get lumoInjector(){return{is:this.is,includeBaseStyles:!1}}connectedCallback(){super.connectedCallback();const n=Co(this);n.__lumoInjectorDisabled||this.isConnected&&(n.__lumoInjector||(n.__lumoInjector=new Cc(n)),this.__lumoInjector=n.__lumoInjector,this.__lumoInjector.componentConnected(this))}disconnectedCallback(){super.disconnectedCallback(),this.__lumoInjector&&(this.__lumoInjector.componentDisconnected(this),this.__lumoInjector=void 0)}};/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Ac=o=>class extends o{static get properties(){return{_theme:{type:String,readOnly:!0}}}static get observedAttributes(){return[...super.observedAttributes,"theme"]}attributeChangedCallback(n,d,u){super.attributeChangedCallback(n,d,u),n==="theme"&&this._set_theme(u)}};/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const xs=[],Ec=new Set,Sc=new Set;function Ic(o){return o&&Object.prototype.hasOwnProperty.call(o,"__themes")}function Tc(o,a){return(o||"").split(" ").some(n=>new RegExp(`^${n.split("*").join(".*")}$`,"u").test(a))}function Nc(o){return o.map(a=>a.cssText).join(`
`)}const kc="vaadin-themable-mixin-style";function Rc(o,a){const n=document.createElement("style");n.id=kc,n.textContent=Nc(o),a.content.appendChild(n)}function Oc(o=""){let a=0;return o.startsWith("lumo-")||o.startsWith("material-")?a=1:o.startsWith("vaadin-")&&(a=2),a}function Ao(o){const a=[];return o.include&&[].concat(o.include).forEach(n=>{const d=xs.find(u=>u.moduleId===n);d?a.push(...Ao(d),...d.styles):console.warn(`Included moduleId ${n} not found in style registry`)},o.styles),a}function Dc(o){const a=`${o}-default-theme`,n=xs.filter(d=>d.moduleId!==a&&Tc(d.themeFor,o)).map(d=>({...d,styles:[...Ao(d),...d.styles],includePriority:Oc(d.moduleId)})).sort((d,u)=>u.includePriority-d.includePriority);return n.length>0?n:xs.filter(d=>d.moduleId===a)}const ur=o=>class extends Ac(o){constructor(){super(),Ec.add(new WeakRef(this))}static finalize(){if(super.finalize(),this.is&&Sc.add(this.is),this.elementStyles)return;const n=this.prototype._template;!n||Ic(this)||Rc(this.getStylesForThis(),n)}static finalizeStyles(n){return this.baseStyles=n?[n].flat(1/0):[],this.themeStyles=this.getStylesForThis(),[...this.baseStyles,...this.themeStyles]}static getStylesForThis(){const n=o.__themes||[],d=Object.getPrototypeOf(this.prototype),u=(d?d.constructor.__themes:[])||[];this.__themes=[...n,...u,...Dc(this.is)];const g=this.__themes.flatMap(m=>m.styles);return g.filter((m,C)=>C===g.lastIndexOf(m))}};/**
 * @license
 * Copyright (c) 2025 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Mc=(o,...a)=>{const n=document.createElement("style");n.id=o,n.textContent=a.map(d=>d.toString()).join(`
`),document.head.insertAdjacentElement("afterbegin",n)};/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */["--vaadin-text-color","--vaadin-text-color-disabled","--vaadin-text-color-secondary","--vaadin-border-color","--vaadin-border-color-secondary","--vaadin-background-color"].forEach(o=>{CSS.registerProperty({name:o,syntax:"<color>",inherits:!0,initialValue:"light-dark(black, white)"})});Mc("vaadin-base",Ge`
    @layer vaadin.base {
      html {
        /* Background color */
        --vaadin-background-color: light-dark(#fff, #222);

        /* Container colors */
        --vaadin-background-container: color-mix(in oklab, var(--vaadin-text-color) 5%, var(--vaadin-background-color));
        --vaadin-background-container-strong: color-mix(
          in oklab,
          var(--vaadin-text-color) 10%,
          var(--vaadin-background-color)
        );

        /* Border colors */
        --vaadin-border-color-secondary: color-mix(in oklab, var(--vaadin-text-color) 24%, transparent);
        --vaadin-border-color: color-mix(in oklab, var(--vaadin-text-color) 48%, transparent); /* Above 3:1 contrast */

        /* Text colors */
        /* Above 3:1 contrast */
        --vaadin-text-color-disabled: color-mix(in oklab, var(--vaadin-text-color) 48%, transparent);
        /* Above 4.5:1 contrast */
        --vaadin-text-color-secondary: color-mix(in oklab, var(--vaadin-text-color) 68%, transparent);
        /* Above 7:1 contrast */
        --vaadin-text-color: light-dark(#1f1f1f, white);

        /* Padding */
        --vaadin-padding-xs: 6px;
        --vaadin-padding-s: 8px;
        --vaadin-padding-m: 12px;
        --vaadin-padding-l: 16px;
        --vaadin-padding-xl: 24px;
        --vaadin-padding-block-container: var(--vaadin-padding-xs);
        --vaadin-padding-inline-container: var(--vaadin-padding-s);

        /* Gap/spacing */
        --vaadin-gap-xs: 6px;
        --vaadin-gap-s: 8px;
        --vaadin-gap-m: 12px;
        --vaadin-gap-l: 16px;
        --vaadin-gap-xl: 24px;

        /* Border radius */
        --vaadin-radius-s: 3px;
        --vaadin-radius-m: 6px;
        --vaadin-radius-l: 12px;

        /* Focus outline */
        --vaadin-focus-ring-width: 2px;
        --vaadin-focus-ring-color: var(--vaadin-text-color);

        /* Icons, used as mask-image */
        --_vaadin-icon-arrow-up: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>');
        --_vaadin-icon-calendar: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>');
        --_vaadin-icon-checkmark: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>');
        --_vaadin-icon-chevron-down: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>');
        --_vaadin-icon-clock: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>');
        --_vaadin-icon-cross: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>');
        --_vaadin-icon-drag: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M11 7c0 .82843-.6716 1.5-1.5 1.5C8.67157 8.5 8 7.82843 8 7s.67157-1.5 1.5-1.5c.8284 0 1.5.67157 1.5 1.5Zm0 5c0 .8284-.6716 1.5-1.5 1.5-.82843 0-1.5-.6716-1.5-1.5s.67157-1.5 1.5-1.5c.8284 0 1.5.6716 1.5 1.5Zm0 5c0 .8284-.6716 1.5-1.5 1.5-.82843 0-1.5-.6716-1.5-1.5s.67157-1.5 1.5-1.5c.8284 0 1.5.6716 1.5 1.5Zm5-10c0 .82843-.6716 1.5-1.5 1.5S13 7.82843 13 7s.6716-1.5 1.5-1.5S16 6.17157 16 7Zm0 5c0 .8284-.6716 1.5-1.5 1.5S13 12.8284 13 12s.6716-1.5 1.5-1.5 1.5.6716 1.5 1.5Zm0 5c0 .8284-.6716 1.5-1.5 1.5S13 17.8284 13 17s.6716-1.5 1.5-1.5 1.5.6716 1.5 1.5Z" fill="currentColor"/></svg>');
        --_vaadin-icon-eye: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>');
        --_vaadin-icon-eye-slash: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>');
        --_vaadin-icon-file: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>');
        --_vaadin-icon-fullscreen: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>');
        --_vaadin-icon-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>');
        --_vaadin-icon-link: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>');
        --_vaadin-icon-menu: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>');
        --_vaadin-icon-minus: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>');
        --_vaadin-icon-paper-airplane: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>');
        --_vaadin-icon-pen: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>');
        --_vaadin-icon-play: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>');
        --_vaadin-icon-plus: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>');
        --_vaadin-icon-redo: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>');
        --_vaadin-icon-refresh: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M22 10C22 10 19.995 7.26822 18.3662 5.63824C16.7373 4.00827 14.4864 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.1031 21 19.5649 18.2543 20.6482 14.5M22 10V4M22 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
        --_vaadin-icon-resize: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.5303 7.46967c.2929.29289.2929.76777 0 1.06066L8.53033 18.5304c-.29289.2929-.76777.2929-1.06066 0s-.29289-.7678 0-1.0607L17.4697 7.46967c.2929-.29289.7677-.29289 1.0606 0Zm0 4.50003c.2929.2929.2929.7678 0 1.0607l-5.5 5.5c-.2929.2928-.7677.2928-1.0606 0-.2929-.2929-.2929-.7678 0-1.0607l5.4999-5.5c.2929-.2929.7678-.2929 1.0607 0Zm0 4.5c.2929.2928.2929.7677 0 1.0606l-1 1.0001c-.2929.2928-.7677.2929-1.0606 0-.2929-.2929-.2929-.7678 0-1.0607l1-1c.2929-.2929.7677-.2929 1.0606 0Z" fill="currentColor"/></svg>');
        --_vaadin-icon-sort: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none"><path d="M7.49854 6.99951C7.92795 6.99951 8.15791 7.50528 7.87549 7.82861L4.37646 11.8296C4.17728 12.0571 3.82272 12.0571 3.62354 11.8296L0.125488 7.82861C-0.157248 7.50531 0.0719873 6.99956 0.501465 6.99951H7.49854ZM3.62354 0.17041C3.82275 -0.0573875 4.17725 -0.0573848 4.37646 0.17041L7.87549 4.17041C8.15825 4.49373 7.92806 5.00049 7.49854 5.00049L0.501465 4.99951C0.0719873 4.99946 -0.157248 4.49371 0.125488 4.17041L3.62354 0.17041Z" fill="black"/></svg>');
        --_vaadin-icon-undo: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>');
        --_vaadin-icon-upload: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>');
        --_vaadin-icon-user: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>');
        --_vaadin-icon-warn: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>');

        /* Cursors for interactive elements */
        --vaadin-clickable-cursor: pointer;
        --vaadin-disabled-cursor: not-allowed;

        /* Use units so that the values can be used in calc() */
        --safe-area-inset-top: env(safe-area-inset-top, 0px);
        --safe-area-inset-right: env(safe-area-inset-right, 0px);
        --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
        --safe-area-inset-left: env(safe-area-inset-left, 0px);
      }

      @supports not (color: hsl(0 0 0)) {
        html {
          --_vaadin-safari-17-deg: 1deg;
        }
      }

      @media (forced-colors: active) {
        html {
          --vaadin-background-color: Canvas;
          --vaadin-border-color: CanvasText;
          --vaadin-border-color-secondary: CanvasText;
          --vaadin-text-color-disabled: CanvasText;
          --vaadin-text-color-secondary: CanvasText;
          --vaadin-text-color: CanvasText;
          --vaadin-icon-color: CanvasText;
          --vaadin-focus-ring-color: Highlight;
        }
      }
    }
  `);/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Pc=Ge`
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: var(--vaadin-button-gap, 0 var(--vaadin-gap-s));
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
    -webkit-user-select: none;
    user-select: none;
    cursor: var(--vaadin-clickable-cursor);
    box-sizing: border-box;
    flex-shrink: 0;
    height: var(--vaadin-button-height, fit-content);
    margin: var(--vaadin-button-margin, 0);
    padding: var(--vaadin-button-padding, var(--vaadin-padding-block-container) var(--vaadin-padding-inline-container));
    font-family: var(--vaadin-button-font-family, inherit);
    font-size: var(--vaadin-button-font-size, inherit);
    line-height: var(--vaadin-button-line-height, inherit);
    font-weight: var(--vaadin-button-font-weight, 500);
    color: var(--vaadin-button-text-color, var(--vaadin-text-color));
    background: var(--vaadin-button-background, var(--vaadin-background-container));
    background-origin: border-box;
    border: var(--vaadin-button-border-width, 1px) solid
      var(--vaadin-button-border-color, var(--vaadin-border-color-secondary));
    border-radius: var(--vaadin-button-border-radius, var(--vaadin-radius-m));
    touch-action: manipulation;
  }

  :host([hidden]) {
    display: none !important;
  }

  .vaadin-button-container,
  [part='prefix'],
  [part='suffix'] {
    display: contents;
  }

  [part='label'] {
    display: inline-flex;
  }

  :host(:is([focus-ring], :focus-visible)) {
    outline: var(--vaadin-focus-ring-width) solid var(--vaadin-focus-ring-color);
    outline-offset: 1px;
  }

  :host([theme~='primary']) {
    --vaadin-button-background: var(--vaadin-text-color);
    --vaadin-button-text-color: var(--vaadin-background-color);
    --vaadin-button-border-color: transparent;
  }

  :host([theme~='tertiary']) {
    background: transparent;
    border-color: transparent;
  }

  :host([disabled]) {
    pointer-events: var(--_vaadin-button-disabled-pointer-events, none);
    cursor: var(--vaadin-disabled-cursor);
    opacity: 0.5;
  }

  :host([disabled][theme~='primary']) {
    --vaadin-button-text-color: var(--vaadin-background-container-strong);
    --vaadin-button-background: var(--vaadin-text-color-disabled);
  }

  @media (forced-colors: active) {
    :host {
      --vaadin-button-border-width: 1px;
      --vaadin-button-background: ButtonFace;
      --vaadin-button-text-color: ButtonText;
    }

    :host([theme~='primary']) {
      forced-color-adjust: none;
      --vaadin-button-background: CanvasText;
      --vaadin-button-text-color: Canvas;
      --vaadin-icon-color: Canvas;
    }

    ::slotted(*) {
      forced-color-adjust: auto;
    }

    :host([disabled]) {
      --vaadin-button-background: transparent !important;
      --vaadin-button-border-color: GrayText !important;
      --vaadin-button-text-color: GrayText !important;
      opacity: 1;
    }
  }
`;/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const Bc=o=>o,Eo=typeof document.head.style.touchAction=="string",bs="__polymerGestures",ss="__polymerGesturesHandled",ws="__polymerGesturesTouchAction",Ma=25,Pa=5,Lc=2,Fc=["mousedown","mousemove","mouseup","click"],Uc=[0,1,4,2],$c=function(){try{return new MouseEvent("test",{buttons:1}).buttons===1}catch{return!1}}();function Os(o){return Fc.indexOf(o)>-1}let zc=!1;(function(){try{const o=Object.defineProperty({},"passive",{get(){zc=!0}});window.addEventListener("test",null,o),window.removeEventListener("test",null,o)}catch{}})();function Vc(o){Os(o)}const Hc=navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/u),Gc={button:!0,command:!0,fieldset:!0,input:!0,keygen:!0,optgroup:!0,option:!0,select:!0,textarea:!0};function Li(o){const a=o.type;if(!Os(a))return!1;if(a==="mousemove"){let d=o.buttons===void 0?1:o.buttons;return o instanceof window.MouseEvent&&!$c&&(d=Uc[o.which]||0),!!(d&1)}return(o.button===void 0?0:o.button)===0}function Wc(o){if(o.type==="click"){if(o.detail===0)return!0;const a=bi(o);if(!a.nodeType||a.nodeType!==Node.ELEMENT_NODE)return!0;const n=a.getBoundingClientRect(),d=o.pageX,u=o.pageY;return!(d>=n.left&&d<=n.right&&u>=n.top&&u<=n.bottom)}return!1}const Qt={touch:{x:0,y:0,id:-1,scrollDecided:!1}};function Xc(o){let a="auto";const n=Io(o);for(let d=0,u;d<n.length;d++)if(u=n[d],u[ws]){a=u[ws];break}return a}function So(o,a,n){o.movefn=a,o.upfn=n,document.addEventListener("mousemove",a),document.addEventListener("mouseup",n)}function rr(o){document.removeEventListener("mousemove",o.movefn),document.removeEventListener("mouseup",o.upfn),o.movefn=null,o.upfn=null}const Io=window.ShadyDOM&&window.ShadyDOM.noPatch?window.ShadyDOM.composedPath:o=>o.composedPath&&o.composedPath()||[],Ds={},Di=[];function jc(o,a){let n=document.elementFromPoint(o,a),d=n;for(;d&&d.shadowRoot&&!window.ShadyDOM;){const u=d;if(d=d.shadowRoot.elementFromPoint(o,a),u===d)break;d&&(n=d)}return n}function bi(o){const a=Io(o);return a.length>0?a[0]:o.target}function Kc(o){const a=o.type,d=o.currentTarget[bs];if(!d)return;const u=d[a];if(!u)return;if(!o[ss]&&(o[ss]={},a.startsWith("touch"))){const m=o.changedTouches[0];if(a==="touchstart"&&o.touches.length===1&&(Qt.touch.id=m.identifier),Qt.touch.id!==m.identifier)return;Eo||(a==="touchstart"||a==="touchmove")&&Zc(o)}const g=o[ss];if(!g.skip){for(let m=0,C;m<Di.length;m++)C=Di[m],u[C.name]&&!g[C.name]&&C.flow&&C.flow.start.indexOf(o.type)>-1&&C.reset&&C.reset();for(let m=0,C;m<Di.length;m++)C=Di[m],u[C.name]&&!g[C.name]&&(g[C.name]=!0,C[a](o))}}function Zc(o){const a=o.changedTouches[0],n=o.type;if(n==="touchstart")Qt.touch.x=a.clientX,Qt.touch.y=a.clientY,Qt.touch.scrollDecided=!1;else if(n==="touchmove"){if(Qt.touch.scrollDecided)return;Qt.touch.scrollDecided=!0;const d=Xc(o);let u=!1;const g=Math.abs(Qt.touch.x-a.clientX),m=Math.abs(Qt.touch.y-a.clientY);o.cancelable&&(d==="none"?u=!0:d==="pan-x"?u=m>g:d==="pan-y"&&(u=g>m)),u?o.preventDefault():fn("track")}}function Ba(o,a,n){return Ds[a]?(Yc(o,a,n),!0):!1}function Yc(o,a,n){const d=Ds[a],u=d.deps,g=d.name;let m=o[bs];m||(o[bs]=m={});for(let C=0,A,_;C<u.length;C++)A=u[C],!(Hc&&Os(A)&&A!=="click")&&(_=m[A],_||(m[A]=_={_count:0}),_._count===0&&o.addEventListener(A,Kc,Vc(A)),_[g]=(_[g]||0)+1,_._count=(_._count||0)+1);o.addEventListener(a,n),d.touchAction&&Qc(o,d.touchAction)}function Ms(o){Di.push(o),o.emits.forEach(a=>{Ds[a]=o})}function qc(o){for(let a=0,n;a<Di.length;a++){n=Di[a];for(let d=0,u;d<n.emits.length;d++)if(u=n.emits[d],u===o)return n}return null}function Qc(o,a){Eo&&o instanceof HTMLElement&&ac.run(()=>{o.style.touchAction=a}),o[ws]=a}function Ps(o,a,n){const d=new Event(a,{bubbles:!0,cancelable:!0,composed:!0});if(d.detail=n,Bc(o).dispatchEvent(d),d.defaultPrevented){const u=n.preventer||n.sourceEvent;u&&u.preventDefault&&u.preventDefault()}}function fn(o){const a=qc(o);a.info&&(a.info.prevent=!0)}Ms({name:"downup",deps:["mousedown","touchstart","touchend"],flow:{start:["mousedown","touchstart"],end:["mouseup","touchend"]},emits:["down","up"],info:{movefn:null,upfn:null},reset(){rr(this.info)},mousedown(o){if(!Li(o))return;const a=bi(o),n=this,d=g=>{Li(g)||(Nr("up",a,g),rr(n.info))},u=g=>{Li(g)&&Nr("up",a,g),rr(n.info)};So(this.info,d,u),Nr("down",a,o)},touchstart(o){Nr("down",bi(o),o.changedTouches[0],o)},touchend(o){Nr("up",bi(o),o.changedTouches[0],o)}});function Nr(o,a,n,d){a&&Ps(a,o,{x:n.clientX,y:n.clientY,sourceEvent:n,preventer:d,prevent(u){return fn(u)}})}Ms({name:"track",touchAction:"none",deps:["mousedown","touchstart","touchmove","touchend"],flow:{start:["mousedown","touchstart"],end:["mouseup","touchend"]},emits:["track"],info:{x:0,y:0,state:"start",started:!1,moves:[],addMove(o){this.moves.length>Lc&&this.moves.shift(),this.moves.push(o)},movefn:null,upfn:null,prevent:!1},reset(){this.info.state="start",this.info.started=!1,this.info.moves=[],this.info.x=0,this.info.y=0,this.info.prevent=!1,rr(this.info)},mousedown(o){if(!Li(o))return;const a=bi(o),n=this,d=g=>{const m=g.clientX,C=g.clientY;La(n.info,m,C)&&(n.info.state=n.info.started?g.type==="mouseup"?"end":"track":"start",n.info.state==="start"&&fn("tap"),n.info.addMove({x:m,y:C}),Li(g)||(n.info.state="end",rr(n.info)),a&&as(n.info,a,g),n.info.started=!0)},u=g=>{n.info.started&&d(g),rr(n.info)};So(this.info,d,u),this.info.x=o.clientX,this.info.y=o.clientY},touchstart(o){const a=o.changedTouches[0];this.info.x=a.clientX,this.info.y=a.clientY},touchmove(o){const a=bi(o),n=o.changedTouches[0],d=n.clientX,u=n.clientY;La(this.info,d,u)&&(this.info.state==="start"&&fn("tap"),this.info.addMove({x:d,y:u}),as(this.info,a,n),this.info.state="track",this.info.started=!0)},touchend(o){const a=bi(o),n=o.changedTouches[0];this.info.started&&(this.info.state="end",this.info.addMove({x:n.clientX,y:n.clientY}),as(this.info,a,n))}});function La(o,a,n){if(o.prevent)return!1;if(o.started)return!0;const d=Math.abs(o.x-a),u=Math.abs(o.y-n);return d>=Pa||u>=Pa}function as(o,a,n){if(!a)return;const d=o.moves[o.moves.length-2],u=o.moves[o.moves.length-1],g=u.x-o.x,m=u.y-o.y;let C,A=0;d&&(C=u.x-d.x,A=u.y-d.y),Ps(a,"track",{state:o.state,x:n.clientX,y:n.clientY,dx:g,dy:m,ddx:C,ddy:A,sourceEvent:n,hover(){return jc(n.clientX,n.clientY)}})}Ms({name:"tap",deps:["mousedown","click","touchstart","touchend"],flow:{start:["mousedown","touchstart"],end:["click","touchend"]},emits:["tap"],info:{x:NaN,y:NaN,prevent:!1},reset(){this.info.x=NaN,this.info.y=NaN,this.info.prevent=!1},mousedown(o){Li(o)&&(this.info.x=o.clientX,this.info.y=o.clientY)},click(o){Li(o)&&Fa(this.info,o)},touchstart(o){const a=o.changedTouches[0];this.info.x=a.clientX,this.info.y=a.clientY},touchend(o){Fa(this.info,o.changedTouches[0],o)}});function Fa(o,a,n){const d=Math.abs(a.clientX-o.x),u=Math.abs(a.clientY-o.y),g=bi(n||a);!g||Gc[g.localName]&&g.hasAttribute("disabled")||(isNaN(d)||isNaN(u)||d<=Ma&&u<=Ma||Wc(a))&&(o.prevent||Ps(g,"tap",{x:a.clientX,y:a.clientY,sourceEvent:a,preventer:n}))}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const To=Lt(o=>class extends o{static get properties(){return{disabled:{type:Boolean,value:!1,observer:"_disabledChanged",reflectToAttribute:!0,sync:!0}}}_disabledChanged(n){this._setAriaDisabled(n)}_setAriaDisabled(n){n?this.setAttribute("aria-disabled","true"):this.removeAttribute("aria-disabled")}click(){this.disabled||super.click()}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Bs=Lt(o=>class extends o{ready(){super.ready(),this.addEventListener("keydown",n=>{this._onKeyDown(n)}),this.addEventListener("keyup",n=>{this._onKeyUp(n)})}_onKeyDown(n){switch(n.key){case"Enter":this._onEnter(n);break;case"Escape":this._onEscape(n);break}}_onKeyUp(n){}_onEnter(n){}_onEscape(n){}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Jc=o=>class extends To(Bs(o)){get _activeKeys(){return[" "]}ready(){super.ready(),Ba(this,"down",n=>{this._shouldSetActive(n)&&this._setActive(!0)}),Ba(this,"up",()=>{this._setActive(!1)})}disconnectedCallback(){super.disconnectedCallback(),this._setActive(!1)}_shouldSetActive(n){return!this.disabled}_onKeyDown(n){super._onKeyDown(n),this._shouldSetActive(n)&&this._activeKeys.includes(n.key)&&(this._setActive(!0),document.addEventListener("keyup",d=>{this._activeKeys.includes(d.key)&&this._setActive(!1)},{once:!0}))}_setActive(n){this.toggleAttribute("active",n)}};/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */let Ls=!1;window.addEventListener("keydown",()=>{Ls=!0},{capture:!0});window.addEventListener("mousedown",()=>{Ls=!1},{capture:!0});function ed(){return Ls}function td(o){return o.getRootNode().activeElement===o}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const No=Lt(o=>class extends o{get _keyboardActive(){return ed()}ready(){this.addEventListener("focusin",n=>{this._shouldSetFocus(n)&&this._setFocused(!0)}),this.addEventListener("focusout",n=>{this._shouldRemoveFocus(n)&&this._setFocused(!1)}),super.ready()}disconnectedCallback(){super.disconnectedCallback(),this.hasAttribute("focused")&&this._setFocused(!1)}focus(n){super.focus(n),n&&n.focusVisible===!1||this.setAttribute("focus-ring","")}_setFocused(n){this.toggleAttribute("focused",n),this.toggleAttribute("focus-ring",n&&this._keyboardActive)}_shouldSetFocus(n){return!0}_shouldRemoveFocus(n){return!0}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ko=o=>class extends To(o){static get properties(){return{tabindex:{type:Number,reflectToAttribute:!0,observer:"_tabindexChanged",sync:!0},_lastTabIndex:{type:Number}}}_disabledChanged(n,d){super._disabledChanged(n,d),!this.__shouldAllowFocusWhenDisabled()&&(n?(this.tabindex!==void 0&&(this._lastTabIndex=this.tabindex),this.setAttribute("tabindex","-1")):d&&(this._lastTabIndex!==void 0?this.setAttribute("tabindex",this._lastTabIndex):this.tabindex=void 0))}_tabindexChanged(n){this.__shouldAllowFocusWhenDisabled()||this.disabled&&n!==-1&&(this._lastTabIndex=n,this.setAttribute("tabindex","-1"))}focus(n){(!this.disabled||this.__shouldAllowFocusWhenDisabled())&&super.focus(n)}__shouldAllowFocusWhenDisabled(){return!1}};/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const id=["mousedown","mouseup","click","dblclick","keypress","keydown","keyup"],rd=o=>class extends Jc(ko(No(o))){constructor(){super(),this.__onInteractionEvent=this.__onInteractionEvent.bind(this),id.forEach(n=>{this.addEventListener(n,this.__onInteractionEvent,!0)}),this.tabindex=0}get _activeKeys(){return["Enter"," "]}ready(){super.ready(),this.hasAttribute("role")||this.setAttribute("role","button"),this.__shouldAllowFocusWhenDisabled()&&this.style.setProperty("--_vaadin-button-disabled-pointer-events","auto")}_onKeyDown(n){super._onKeyDown(n),!(n.altKey||n.shiftKey||n.ctrlKey||n.metaKey)&&this._activeKeys.includes(n.key)&&(n.preventDefault(),this.click())}__onInteractionEvent(n){this.__shouldSuppressInteractionEvent(n)&&n.stopImmediatePropagation()}__shouldSuppressInteractionEvent(n){return this.disabled}};/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class nd extends rd(zr(ur(dr(hr(Te))))){static get is(){return"vaadin-button"}static get styles(){return Pc}static get properties(){return{disabled:{type:Boolean,value:!1,observer:"_disabledChanged",reflectToAttribute:!0,sync:!0}}}render(){return M`
      <div class="vaadin-button-container">
        <span part="prefix" aria-hidden="true">
          <slot name="prefix"></slot>
        </span>
        <span part="label">
          <slot></slot>
        </span>
        <span part="suffix" aria-hidden="true">
          <slot name="suffix"></slot>
        </span>

        <slot name="tooltip"></slot>
      </div>
    `}ready(){super.ready(),this._tooltipController=new Rs(this),this.addController(this._tooltipController)}__shouldAllowFocusWhenDisabled(){return window.Vaadin.featureFlags.accessibleDisabledButtons}}cr(nd);var sd=Object.getOwnPropertyDescriptor,ad=(o,a,n,d)=>{for(var u=d>1?void 0:d?sd(a,n):a,g=o.length-1,m;g>=0;g--)(m=o[g])&&(u=m(u)||u);return u};let _s=class extends Te{render(){return M`
      <div class="welcome-container">
        <div class="icon-container" aria-hidden="true">
          ⚡
        </div>
        <div>
          <h1>ElectroCheck AI</h1>
          <p class="subtitle">
            KI-gestützte Fehlerdiagnose & digitale Wartungsprotokolle für Elektrofachkräfte.
          </p>
        </div>

        <div class="features-list">
          <div class="feature-item">
            <span class="feature-icon" aria-hidden="true">📸</span>
            <div class="feature-text">
              <span class="feature-title">Foto-Diagnose & Markierung</span>
              <span class="feature-desc">Fotografiere den Defekt, markiere die Stelle und erhalte eine fundierte KI-Fehlerursachenanalyse.</span>
            </div>
          </div>

          <div class="feature-item">
            <span class="feature-icon" aria-hidden="true">🔍</span>
            <div class="feature-text">
              <span class="feature-title">OCR Typenschild-Scanner</span>
              <span class="feature-desc">Lese Typenschilder automatisch per OCR aus und durchsuche direkt passende Datenblätter der Hersteller.</span>
            </div>
          </div>

          <div class="feature-item">
            <span class="feature-icon" aria-hidden="true">🗣️</span>
            <div class="feature-text">
              <span class="feature-title">Geführte Reparatur (TTS)</span>
              <span class="feature-desc">Lass dir die einzelnen VDE-konformen Arbeitsschritte vorlesen – ideal für das Arbeiten mit freien Händen.</span>
            </div>
          </div>

          <div class="feature-item">
            <span class="feature-icon" aria-hidden="true">📄</span>
            <div class="feature-text">
              <span class="feature-title">Wartungsprotokoll & Tickets</span>
              <span class="feature-desc">Erstelle professionelle PDF-Wartungsprotokolle und exportiere Tickets direkt an Instandhaltungssysteme.</span>
            </div>
          </div>
        </div>

        <vaadin-button
          theme="primary"
          class="start-button"
          @click="${this._handleStart}"
        >
          Diagnose Starten 🔓
        </vaadin-button>
      </div>
    `}_handleStart(){this.dispatchEvent(new CustomEvent("start"))}};_s.styles=Ge`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 100vh;
      min-height: 100dvh;
      padding: 1.5rem 1rem;
      padding-top: calc(1.5rem + env(safe-area-inset-top, 0px));
      padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
      background-color: var(--bg-app);
      font-family: var(--font-sans);
      color: var(--text-primary);
      text-align: center;
    }

    .welcome-container {
      max-width: 480px;
      width: 100%;
      background: var(--bg-card);
      padding: 2rem 1.5rem;
      border-radius: var(--radius-m);
      border: 2px solid var(--border);
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    /* Animated Bolt Icon */
    .icon-container {
      width: 72px;
      height: 72px;
      background: var(--primary-glow);
      border: 3px solid var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.25rem;
      margin-bottom: 0.25rem;
      box-shadow: var(--shadow-glow);
      animation: pulse 2.5s infinite;
      flex-shrink: 0;
    }

    h1 {
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(135deg, var(--primary), var(--success));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .subtitle {
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--text-secondary);
      margin: 0;
      font-weight: 500;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 100%;
      text-align: left;
      margin: 0.25rem 0;
    }

    .feature-item {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      padding: 0.625rem;
      background: var(--bg-app);
      border: 1px solid var(--border);
      border-radius: var(--radius-s);
      transition: border-color 0.2s;
    }

    .feature-item:hover {
      border-color: var(--primary);
    }

    .feature-icon {
      font-size: 1.15rem;
      flex-shrink: 0;
      line-height: 1;
    }

    .feature-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .feature-title {
      font-weight: 700;
      font-size: 0.85rem;
      color: var(--text-primary);
    }

    .feature-desc {
      font-size: 0.75rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .start-button {
      width: 100%;
      height: 3.25rem;
      font-weight: 800;
      font-size: 1.05rem;
      border-radius: var(--radius-s);
      box-shadow: 0 4px 12px var(--primary-glow);
      transition: all 0.2s ease;
      cursor: pointer;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }

    .start-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px var(--primary-glow);
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 var(--primary-glow);
        transform: scale(1);
      }
      70% {
        box-shadow: 0 0 0 15px rgba(2, 119, 189, 0);
        transform: scale(1.05);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(2, 119, 189, 0);
        transform: scale(1);
      }
    }

    /* --- Small Phones (max 374px) --- */
    @media screen and (max-width: 374px) {
      :host {
        padding: 1rem 0.75rem;
      }

      .welcome-container {
        padding: 1.25rem 1rem;
        gap: 1rem;
      }

      .icon-container {
        width: 56px;
        height: 56px;
        font-size: 1.75rem;
      }

      h1 {
        font-size: 1.35rem;
      }

      .subtitle {
        font-size: 0.8rem;
      }

      .feature-item {
        padding: 0.5rem;
      }

      .feature-title {
        font-size: 0.8rem;
      }

      .feature-desc {
        font-size: 0.7rem;
      }

      .start-button {
        height: 3rem;
        font-size: 0.95rem;
      }
    }

    /* --- Tablets & Desktop (768px+) --- */
    @media screen and (min-width: 768px) {
      .welcome-container {
        max-width: 520px;
        padding: 2.5rem 2rem;
        gap: 1.5rem;
      }

      h1 {
        font-size: 2.25rem;
      }

      .subtitle {
        font-size: 1rem;
      }

      .feature-item {
        padding: 0.75rem;
      }

      .feature-title {
        font-size: 0.9rem;
      }

      .feature-desc {
        font-size: 0.8rem;
      }

      .start-button {
        height: 3.5rem;
        font-size: 1.1rem;
      }
    }

    /* Print hidden */
    @media print {
      :host { display: none !important; }
    }

    /* Dyslexie (LRS) Lese-Hilfe Support */
    :host-context(.accessible-reading) p,
    :host-context(.accessible-reading) span,
    :host-context(.accessible-reading) div,
    :host-context(.accessible-reading) label,
    :host-context(.accessible-reading) h1,
    :host-context(.accessible-reading) h2,
    :host-context(.accessible-reading) vaadin-button {
      word-spacing: 0.15em !important;
      letter-spacing: 0.05em !important;
      line-height: 1.75 !important;
    }
  `;_s=ad([st("ec-welcome")],_s);const od="modulepreload",ld=function(o){return"/"+o},Ua={},mi=function(a,n,d){let u=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const m=document.querySelector("meta[property=csp-nonce]"),C=(m==null?void 0:m.nonce)||(m==null?void 0:m.getAttribute("nonce"));u=Promise.allSettled(n.map(A=>{if(A=ld(A),A in Ua)return;Ua[A]=!0;const _=A.endsWith(".css"),O=_?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${A}"]${O}`))return;const I=document.createElement("link");if(I.rel=_?"stylesheet":od,_||(I.as="script"),I.crossOrigin="",I.href=A,C&&I.setAttribute("nonce",C),document.head.appendChild(I),_)return new Promise((H,X)=>{I.addEventListener("load",H),I.addEventListener("error",()=>X(new Error(`Unable to preload CSS for ${A}`)))})}))}function g(m){const C=new Event("vite:preloadError",{cancelable:!0});if(C.payload=m,window.dispatchEvent(C),!C.defaultPrevented)throw m}return u.then(m=>{for(const C of m||[])C.status==="rejected"&&g(C.reason);return a().catch(g)})},vi=':host{display:block;width:100%}.container{max-width:680px;margin:0 auto;padding:1.25rem 1rem;padding-bottom:calc(1.25rem + var(--safe-bottom, 0px));display:flex;flex-direction:column;gap:1.25rem;min-height:100vh;min-height:100dvh;font-family:var(--font-sans);color:var(--text-primary);width:100%}p{line-height:1.6;color:var(--text-secondary);margin:.5rem 0}.m-0{margin:0}.mt-1{margin-top:1rem}.mt-1-5{margin-top:1.5rem}.w-100{width:100%}.flex-1{flex-grow:1}.d-none{display:none!important}.label{font-weight:700;color:var(--text-muted);font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;display:inline-block;margin-bottom:.25rem}.text-muted{color:var(--text-muted)}.text-danger{color:var(--danger)}.text-danger-small{color:var(--danger);font-size:.875rem;font-weight:500}.link-primary{color:var(--primary);text-decoration:none;font-weight:500}.link-primary:hover{text-decoration:underline}.no-underline{text-decoration:none}.header{display:flex;justify-content:space-between;align-items:center;padding:.75rem 0;padding-top:calc(.75rem + var(--safe-top, 0px));border-bottom:1px solid var(--border);gap:.5rem;flex-wrap:wrap;min-height:56px}.header-left{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;flex:1;min-width:0}.header-title{font-size:1.25rem;font-weight:800;margin:0;background:linear-gradient(135deg,var(--primary),var(--success));-webkit-background-clip:text;-webkit-text-fill-color:transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.card{background:var(--bg-card);padding:1.25rem;border-radius:var(--radius-m);border:1px solid var(--border);box-shadow:var(--shadow-md);transition:all .3s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden;max-width:100%;word-wrap:break-word;overflow-wrap:break-word}.card:before{content:"";position:absolute;top:0;left:0;right:0;height:4px;background:transparent;transition:background .3s}.card:hover{box-shadow:var(--shadow-lg)}.safety-card:before{background:var(--danger)}.safety-card{box-shadow:0 4px 20px -2px var(--danger-glow)}.ocr-card:before{background:var(--success)}.ocr-card{box-shadow:0 4px 20px -2px var(--success-glow)}.result-card:before{background:var(--primary)}.result-card{box-shadow:var(--shadow-glow)}.offline-banner{background:linear-gradient(135deg,var(--danger),#be123c);color:#fff;padding:12px;text-align:center;border-radius:var(--radius-s);font-weight:700;font-size:.85rem;box-shadow:var(--shadow-sm);display:flex;align-items:center;justify-content:center;gap:8px}.media-box{width:100%;aspect-ratio:4 / 3;background:#090d16;border-radius:var(--radius-m);overflow:hidden;position:relative;box-shadow:var(--shadow-lg);border:1px solid var(--border);max-width:100%}video,canvas,img{width:100%;height:100%;object-fit:cover}.camera-hint{position:absolute;bottom:8px;left:8px;right:8px;background:#0f172ad9;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.1);color:#f8fafc;padding:8px 12px;border-radius:var(--radius-s);text-align:center;font-size:.8rem;pointer-events:none;z-index:10;box-shadow:var(--shadow-md)}.action-bar{display:flex;gap:6px;flex-wrap:wrap;justify-content:stretch;margin-top:1rem}.action-bar vaadin-button{flex:1 1 calc(50% - 3px);min-width:0;font-size:.8rem}vaadin-button{cursor:pointer;font-family:var(--font-sans);border-radius:var(--radius-s);transition:all .2s;touch-action:manipulation;-webkit-tap-highlight-color:transparent}.btn-large{width:100%;height:3.25rem;font-weight:700;font-size:1rem}.btn-amazon{background-color:#f90!important;color:#000!important;font-weight:700!important}.btn-amazon:hover{background-color:#e68a00!important}.result-card h3{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--border);padding-bottom:.75rem;margin-bottom:1rem;font-weight:800;font-size:1.1rem;word-break:break-word}.safety-list{display:flex;flex-direction:column;gap:.75rem;margin:1.25rem 0}.safety-item{display:flex;gap:12px;align-items:center;cursor:pointer;padding:12px;background:var(--bg-app);border:1px solid var(--border);border-radius:var(--radius-s);transition:all .2s ease;-webkit-user-select:none;user-select:none;min-height:52px}.safety-item:hover{border-color:var(--danger);background:var(--danger-glow)}.safety-item input[type=checkbox]{width:1.4rem;height:1.4rem;accent-color:var(--danger);cursor:pointer;flex-shrink:0}.safety-item span{font-size:.9rem;font-weight:600}.difficulty-stars{color:#f59e0b;margin-bottom:1rem;font-size:1rem;font-weight:700;display:flex;align-items:center;gap:4px;flex-wrap:wrap}.tips-list{margin-top:.25rem;padding-left:1.25rem;color:var(--text-secondary);font-size:.9rem;line-height:1.6}.tips-list li{margin-bottom:.5rem}.result-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:1.25rem}.result-actions vaadin-button{width:100%;font-size:.85rem}.result-actions a{grid-column:span 2;width:100%}.result-actions a vaadin-button{width:100%}.experience-box{background:var(--bg-app);padding:12px 14px;border-radius:var(--radius-s);font-style:italic;font-size:.85rem;margin:1rem 0;border-left:4px solid var(--text-muted);word-break:break-word}.legal-box{background:var(--danger-glow);padding:12px;border-radius:var(--radius-s);border:1px solid rgba(239,68,68,.2);margin-top:1.25rem}.legal-text{font-size:.75rem;color:var(--danger);margin:0;line-height:1.5}.empty-dashboard{text-align:center;padding:2rem 1rem;color:var(--text-muted)}.dashboard-title{margin-bottom:1.5rem;font-weight:800;font-size:1.15rem}.dashboard-stats{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.25rem}.stat-card{background:var(--bg-app);padding:1rem;border-radius:var(--radius-s);border:1px solid var(--border);text-align:center;transition:border-color .2s}.stat-card:hover{border-color:var(--primary)}.stat-value-primary{font-size:2rem;font-weight:800;color:var(--primary)}.stat-value-warning{font-size:2rem;font-weight:800;color:var(--warning)}.stat-label{font-size:.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:700;letter-spacing:.05em;margin-top:.25rem}.dashboard-subtitle{margin-top:1.25rem;margin-bottom:.75rem;color:var(--text-secondary);font-size:.85rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em}.device-list{display:flex;flex-direction:column;gap:.75rem}.device-item-header{display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:.25rem}.device-name{font-weight:600}.device-count{font-weight:700;color:var(--text-muted)}.device-progress{width:100%;height:8px;border-radius:4px}.history-section{margin-top:1.5rem}.history-header{font-weight:700;color:var(--text-secondary);text-transform:uppercase;font-size:.75rem;letter-spacing:.05em;margin-bottom:.75rem;border-bottom:2px solid var(--border);padding-bottom:.5rem;display:flex;align-items:center;gap:8px}.history-item{display:flex;flex-direction:column;padding:1rem;border:1px solid var(--border);border-radius:var(--radius-s);margin-bottom:.5rem;cursor:pointer;background:var(--bg-card);transition:all .2s ease;box-shadow:var(--shadow-sm);min-height:52px}.history-item:hover,.history-item:active{border-color:var(--primary);transform:translateY(-1px);box-shadow:var(--shadow-md)}.history-title{font-weight:700;color:var(--text-primary);font-size:.9rem}.history-defect{font-size:.8rem;color:var(--text-secondary);margin-top:.25rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.modal-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;height:100dvh;background:#090d16b3;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);z-index:2000;display:flex;justify-content:center;align-items:center;padding:1rem;padding-top:calc(1rem + var(--safe-top, 0px));padding-bottom:calc(1rem + var(--safe-bottom, 0px))}.settings-overlay{z-index:1500}.pdf-modal-card{width:100%;max-width:600px;height:80vh;height:80dvh;display:flex;flex-direction:column}.settings-card{width:100%;max-width:440px;max-height:90vh;max-height:90dvh;overflow-y:auto}.pdf-iframe{flex-grow:1;border:1px solid var(--border);border-radius:var(--radius-s);background:#fff;margin:1rem 0;width:100%;min-height:200px}.modal-actions{display:flex;gap:.75rem;margin-top:1rem;justify-content:flex-end;flex-wrap:wrap}.consent-card{max-width:500px;width:100%;border-top:5px solid var(--primary);max-height:90vh;max-height:90dvh;overflow-y:auto}.consent-title{font-weight:800;margin-bottom:.75rem;font-size:1.15rem}.consent-text{font-size:.85rem;line-height:1.5;margin-bottom:1rem}.consent-checkbox-label{display:flex;gap:10px;align-items:flex-start;font-size:.85rem;margin-bottom:1rem;cursor:pointer;background:var(--bg-app);padding:10px;border-radius:var(--radius-s);border:1px solid var(--border)}.consent-checkbox-label input{margin-top:3px;accent-color:var(--primary);min-width:20px;min-height:20px}.guided-container{display:flex;flex-direction:column;gap:1rem;padding:.5rem 0}.step-card{background:var(--bg-app);border:1px solid var(--border);border-radius:var(--radius-m);padding:1.5rem 1.25rem;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:160px;box-shadow:var(--shadow-sm)}.step-number{font-size:.75rem;font-weight:800;color:var(--primary);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.5rem}.step-text{font-size:1.1rem;font-weight:700;line-height:1.5;color:var(--text-primary);margin:0;word-break:break-word}.guided-controls{display:flex;gap:8px;justify-content:space-between}.guided-controls vaadin-button{flex:1}.tts-button{background:var(--primary-glow)!important;color:var(--primary)!important;border:1px solid var(--primary)!important}.queue-item{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:var(--bg-app);border:1px solid var(--border);border-radius:var(--radius-s);margin-bottom:.5rem;gap:8px}.queue-info{display:flex;flex-direction:column;min-width:0;flex:1}.queue-desc{font-weight:600;font-size:.85rem;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.queue-time{font-size:.75rem;color:var(--text-muted)}.queue-actions{display:flex;gap:6px;flex-shrink:0}.privacy-danger-zone{border:1px solid rgba(239,68,68,.2);border-radius:var(--radius-s);padding:1rem;margin-top:1rem;background:var(--danger-glow)}.privacy-title{color:var(--danger);font-weight:700;font-size:.9rem;margin-top:0;margin-bottom:.5rem}.app-footer{margin-top:auto;padding:1.5rem 0;padding-bottom:calc(1.5rem + var(--safe-bottom, 0px));border-top:1px solid var(--border);text-align:center;font-size:.7rem;color:var(--text-muted);display:flex;flex-direction:column;gap:.375rem}.footer-links{display:flex;justify-content:center;gap:.75rem;flex-wrap:wrap}.footer-links a{color:var(--text-secondary);text-decoration:none}.footer-links a:hover{text-decoration:underline;color:var(--primary)}.skeleton-card{text-align:center;padding:2.5rem 1.5rem;display:flex;flex-direction:column;align-items:center;justify-content:center}.loading-text{font-weight:700;color:var(--primary);margin-top:1.25rem;font-size:1rem;letter-spacing:-.02em}.tech-spinner{width:52px;height:52px;border-radius:50%;border:4px solid transparent;border-top-color:var(--text-muted);border-bottom-color:var(--text-muted);animation:spin 2s linear infinite;position:relative}.tech-spinner:before{content:"";position:absolute;top:8px;left:8px;right:8px;bottom:8px;border-radius:50%;border:4px solid transparent;border-left-color:var(--primary);border-right-color:var(--primary);animation:spin-reverse 1.2s linear infinite}.scanner-overlay{position:absolute;top:12.5%;left:12.5%;right:12.5%;bottom:12.5%;border:2px solid rgba(255,255,255,.4);box-shadow:0 0 0 2000px #090d16a6;pointer-events:none;z-index:5;border-radius:4px}.scanner-laser{position:absolute;width:100%;height:2px;background:var(--primary);box-shadow:0 0 12px var(--primary);top:0;animation:scan 2.5s ease-in-out infinite alternate}:host([theme="dark"]) vaadin-button[theme~=secondary]{background-color:#1e293b;color:var(--primary);border:1px solid var(--border)}vaadin-button[theme~=secondary]{background-color:#f1f5f9;color:var(--text-primary);border:1px solid var(--border)}vaadin-button[theme~=primary]{background-color:var(--primary)!important;color:#fff!important}vaadin-button[theme~=primary]:hover{background-color:var(--primary-hover)!important}vaadin-button[theme~=error]{background-color:var(--danger)!important;color:#fff!important}vaadin-button[theme~=success]{background-color:var(--success)!important;color:#fff!important}@keyframes spin{to{transform:rotate(360deg)}}@keyframes spin-reverse{to{transform:rotate(-360deg)}}@keyframes scan{0%{top:0%;opacity:.2}15%{opacity:1}85%{opacity:1}to{top:100%;opacity:.2}}@media screen and (max-width: 374px){.container{padding:.75rem .5rem;gap:.75rem}.header-title{font-size:1rem}.header-left vaadin-button{font-size:.7rem;min-height:36px;padding:0 6px}.card{padding:1rem;border-radius:12px}.media-box{border-radius:12px}.action-bar vaadin-button{flex:1 1 100%;font-size:.75rem}.result-card h3{font-size:.95rem}.result-actions{grid-template-columns:1fr 1fr;gap:6px}.stat-value-primary,.stat-value-warning{font-size:1.5rem}.consent-card{padding:1rem}.consent-title{font-size:1rem}}@media screen and (min-width: 375px) and (max-width: 411px){.container{padding:1rem .75rem;gap:1rem}.header-title{font-size:1.1rem}.card{padding:1.1rem}.action-bar vaadin-button{font-size:.78rem}}@media screen and (min-width: 412px) and (max-width: 767px){.container{padding:1.25rem 1rem;gap:1.25rem}.header-title{font-size:1.25rem}.card{padding:1.25rem}.action-bar vaadin-button{font-size:.82rem}}@media screen and (max-width: 767px){.container{max-width:100%}.header{flex-wrap:wrap;gap:.5rem}.header-left{width:100%;justify-content:space-between}.header-left vaadin-button{flex:0 0 auto}.media-box{aspect-ratio:3 / 4}.modal-overlay{padding:.5rem;align-items:flex-end}.settings-card{max-width:100%;max-height:95vh;max-height:95dvh;border-bottom-left-radius:0;border-bottom-right-radius:0}.consent-card{max-width:100%;max-height:95vh;max-height:95dvh}.pdf-modal-card{max-width:100%;height:90vh;height:90dvh}.app-footer{padding:1rem 0;font-size:.65rem}}@media screen and (min-width: 768px) and (max-width: 1023px){.container{max-width:680px;padding:1.5rem 1.25rem;gap:1.5rem}.header-title{font-size:1.5rem}.card{padding:1.5rem}.action-bar vaadin-button{flex:1 1 calc(33.333% - 4px);font-size:.85rem}.result-actions{grid-template-columns:repeat(4,1fr)}.result-actions a{grid-column:span 4}.dashboard-stats{grid-template-columns:repeat(4,1fr)}.stat-value-primary,.stat-value-warning{font-size:2.25rem}}@media screen and (min-width: 1024px){.container{max-width:720px;padding:2rem 1.5rem;gap:1.5rem}.header-title{font-size:1.5rem}.card{padding:1.75rem}.action-bar vaadin-button{flex:1 1 auto;font-size:.875rem}.result-actions{grid-template-columns:repeat(4,1fr)}.result-actions a{grid-column:span 4}}@media screen and (max-width: 767px) and (orientation: landscape){.media-box{aspect-ratio:16 / 9;max-height:50vh}.container{padding:.75rem}}@media print{.header,.media-box,.action-bar,vaadin-text-area,vaadin-button,.history-section,.app-footer{display:none!important}.card{border:none;box-shadow:none}}:host-context(.accessible-reading) p,:host-context(.accessible-reading) span,:host-context(.accessible-reading) div,:host-context(.accessible-reading) label,:host-context(.accessible-reading) li,:host-context(.accessible-reading) input,:host-context(.accessible-reading) vaadin-text-field,:host-context(.accessible-reading) vaadin-text-area{word-spacing:.15em!important;letter-spacing:.05em!important;line-height:1.75!important}';/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const cd={CHILD:2},dd=o=>(...a)=>({_$litDirective$:o,values:a});class hd{constructor(a){}get _$AU(){return this._$AM._$AU}_$AT(a,n,d){this._$Ct=a,this._$AM=n,this._$Ci=d}_$AS(a,n){return this.update(a,n)}update(a,n){return this.render(...n)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class vs extends hd{constructor(a){if(super(a),this.it=He,a.type!==cd.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(a){if(a===He||a==null)return this._t=void 0,this.it=a;if(a===Ui)return a;if(typeof a!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(a===this.it)return this._t;this.it=a;const n=[a];return n.raw=n,this._t={_$litType$:this.constructor.resultType,strings:n,values:[]}}}vs.directiveName="unsafeHTML",vs.resultType=1;const ud=dd(vs);/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const fd=Ge`
  :host {
    display: block;
    width: 100%; /* prevent collapsing inside non-stretching column flex */
    height: var(--vaadin-progress-bar-height, 0.5lh);
    contain: layout size;
  }

  :host([hidden]) {
    display: none !important;
  }

  [part='bar'] {
    box-sizing: border-box;
    height: 100%;
    --_padding: var(--vaadin-progress-bar-padding, 0px);
    padding: var(--_padding);
    background: var(--vaadin-progress-bar-background, var(--vaadin-background-container));
    border-radius: var(--vaadin-progress-bar-border-radius, var(--vaadin-radius-m));
    border: var(--vaadin-progress-bar-border-width, 1px) solid
      var(--vaadin-progress-bar-border-color, var(--vaadin-border-color-secondary));
  }

  [part='value'] {
    box-sizing: border-box;
    height: 100%;
    width: calc(var(--vaadin-progress-value) * 100%);
    background: var(--vaadin-progress-bar-value-background, var(--vaadin-border-color));
    border-radius: calc(
      var(--vaadin-progress-bar-border-radius, var(--vaadin-radius-m)) - var(
          --vaadin-progress-bar-border-width,
          1px
        ) - var(--_padding)
    );
    transition: width 150ms;
  }

  /* Indeterminate progress */
  :host([indeterminate]) [part='value'] {
    --_w-min: clamp(8px, 5%, 16px);
    --_w-max: clamp(16px, 20%, 128px);
    animation: indeterminate var(--vaadin-progress-bar-animation-duration, 1s) linear infinite alternate;
    width: var(--_w-min);
  }

  :host([indeterminate][aria-valuenow]) [part='value'] {
    animation-delay: 150ms;
  }

  @keyframes indeterminate {
    0% {
      animation-timing-function: ease-in;
    }

    20% {
      margin-inline-start: 0%;
      width: var(--_w-max);
    }

    50% {
      margin-inline-start: calc(50% - var(--_w-max) / 2);
    }

    80% {
      width: var(--_w-max);
      margin-inline-start: calc(100% - var(--_w-max));
      animation-timing-function: ease-out;
    }

    100% {
      width: var(--_w-min);
      margin-inline-start: calc(100% - var(--_w-min));
    }
  }

  @keyframes indeterminate-reduced {
    100% {
      opacity: 0.2;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    [part='value'] {
      transition: none;
    }

    :host([indeterminate]) [part='value'] {
      width: 25%;
      animation: indeterminate-reduced 2s linear infinite alternate;
    }
  }

  @media (forced-colors: active) {
    [part='bar'] {
      border-width: max(1px, var(--vaadin-progress-bar-border-width));
    }

    [part='value'] {
      background: CanvasText !important;
    }
  }
`;/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const gd=o=>class extends o{static get properties(){return{value:{type:Number,observer:"_valueChanged"},min:{type:Number,value:0,observer:"_minChanged"},max:{type:Number,value:1,observer:"_maxChanged"},indeterminate:{type:Boolean,value:!1,reflectToAttribute:!0}}}static get observers(){return["_normalizedValueChanged(value, min, max)"]}ready(){super.ready(),this.setAttribute("role","progressbar")}_normalizedValueChanged(n,d,u){const g=this._normalizeValue(n,d,u);this.style.setProperty("--vaadin-progress-value",g)}_valueChanged(n){this.setAttribute("aria-valuenow",n)}_minChanged(n){this.setAttribute("aria-valuemin",n)}_maxChanged(n){this.setAttribute("aria-valuemax",n)}_normalizeValue(n,d,u){let g;return!n&&n!==0?g=0:d>=u?g=1:(g=(n-d)/(u-d),g=Math.min(Math.max(g,0),1)),g}};/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class pd extends gd(zr(ur(dr(hr(Te))))){static get is(){return"vaadin-progress-bar"}static get styles(){return fd}render(){return M`
      <div part="bar">
        <div part="value"></div>
      </div>
    `}}cr(pd);/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const md=Ge`
  :host {
    display: flex;
    align-items: center;
    --_radius: var(--vaadin-input-field-border-radius, var(--vaadin-radius-m));
    border-radius:
      /* See https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius */
      var(--vaadin-input-field-top-start-radius, var(--_radius))
      var(--vaadin-input-field-top-end-radius, var(--_radius))
      var(--vaadin-input-field-bottom-end-radius, var(--_radius))
      var(--vaadin-input-field-bottom-start-radius, var(--_radius));
    border: var(--vaadin-input-field-border-width, 1px) solid
      var(--vaadin-input-field-border-color, var(--vaadin-border-color));
    box-sizing: border-box;
    cursor: text;
    padding: var(
      --vaadin-input-field-padding,
      var(--vaadin-padding-block-container) var(--vaadin-padding-inline-container)
    );
    gap: var(--vaadin-input-field-gap, var(--vaadin-gap-s));
    background: var(--vaadin-input-field-background, var(--vaadin-background-color));
    color: var(--vaadin-input-field-value-color, var(--vaadin-text-color));
    font-size: var(--vaadin-input-field-value-font-size, inherit);
    line-height: var(--vaadin-input-field-value-line-height, inherit);
    font-weight: var(--vaadin-input-field-value-font-weight, 400);
  }

  :host([dir='rtl']) {
    --_radius: var(--vaadin-input-field-border-radius, var(--vaadin-radius-m));
    border-radius:
      /* Don't use logical props, see https://github.com/vaadin/vaadin-time-picker/issues/145 */
      var(--vaadin-input-field-top-end-radius, var(--_radius))
      var(--vaadin-input-field-top-start-radius, var(--_radius))
      var(--vaadin-input-field-bottom-start-radius, var(--_radius))
      var(--vaadin-input-field-bottom-end-radius, var(--_radius));
  }

  :host([hidden]) {
    display: none !important;
  }

  /* Reset the native input styles */
  ::slotted(:is(input, textarea)) {
    appearance: none;
    align-self: stretch;
    box-sizing: border-box;
    flex: auto;
    white-space: nowrap;
    overflow: hidden;
    width: 100%;
    height: auto;
    outline: none;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    min-width: 0;
    font: inherit;
    font-size: 1em;
    color: inherit;
    background: transparent;
    cursor: inherit;
    text-align: inherit;
    caret-color: var(--vaadin-input-field-value-color);
  }

  ::slotted(*) {
    flex: none;
  }

  slot[name$='fix'] {
    cursor: auto;
  }

  ::slotted(:is(input, textarea))::placeholder {
    /* Use ::slotted(:is(input, textarea):placeholder-shown) to style the placeholder */
    /* because ::slotted(...)::placeholder does not work in Safari. */
    font: inherit;
    color: inherit;
  }

  ::slotted(:is(input, textarea):placeholder-shown) {
    color: var(--vaadin-input-field-placeholder-color, var(--vaadin-text-color-secondary));
  }

  :host(:focus-within) {
    outline: var(--vaadin-focus-ring-width) solid var(--vaadin-focus-ring-color);
    outline-offset: calc(var(--vaadin-input-field-border-width, 1px) * -1);
  }

  :host([invalid]) {
    --vaadin-input-field-border-color: var(--vaadin-input-field-error-color, var(--vaadin-text-color));
  }

  :host([readonly]) {
    border-style: dashed;
  }

  :host([readonly]:focus-within) {
    outline-style: dashed;
    --vaadin-input-field-border-color: transparent;
  }

  :host([disabled]) {
    --vaadin-input-field-value-color: var(--vaadin-input-field-disabled-text-color, var(--vaadin-text-color-disabled));
    --vaadin-input-field-background: var(
      --vaadin-input-field-disabled-background,
      var(--vaadin-background-container-strong)
    );
    --vaadin-input-field-border-color: transparent;
  }

  :host([theme~='align-start']) slot:not([name])::slotted(*) {
    text-align: start;
  }

  :host([theme~='align-center']) slot:not([name])::slotted(*) {
    text-align: center;
  }

  :host([theme~='align-end']) slot:not([name])::slotted(*) {
    text-align: end;
  }

  :host([theme~='align-left']) slot:not([name])::slotted(*) {
    text-align: left;
  }

  :host([theme~='align-right']) slot:not([name])::slotted(*) {
    text-align: right;
  }

  @media (forced-colors: active) {
    :host {
      --vaadin-input-field-background: Field;
      --vaadin-input-field-value-color: FieldText;
      --vaadin-input-field-placeholder-color: GrayText;
    }

    :host([disabled]) {
      --vaadin-input-field-value-color: GrayText;
      --vaadin-icon-color: GrayText;
    }
  }
`;/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class xd extends ur(go(dr(hr(Te)))){static get is(){return"vaadin-input-container"}static get styles(){return md}static get properties(){return{disabled:{type:Boolean,reflectToAttribute:!0},readonly:{type:Boolean,reflectToAttribute:!0},invalid:{type:Boolean,reflectToAttribute:!0}}}render(){return M`
      <slot name="prefix"></slot>
      <slot></slot>
      <slot name="suffix"></slot>
    `}ready(){super.ready(),this.addEventListener("pointerdown",a=>{a.target===this&&a.preventDefault()}),this.addEventListener("click",a=>{a.target===this&&this.shadowRoot.querySelector("slot:not([name])").assignedNodes({flatten:!0}).forEach(n=>n.focus&&n.focus())})}}cr(xd);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ro=o=>o??He;/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const bd=Ge`
  [part$='button'] {
    color: var(--vaadin-input-field-button-text-color, var(--vaadin-text-color-secondary));
    cursor: var(--vaadin-clickable-cursor);
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    -webkit-user-select: none;
    user-select: none;
    /* Ensure minimum click target (WCAG) */
    padding: max(0px, (24px - 1lh) / 2);
    margin: min(0px, (24px - 1lh) / -2);
  }

  /* Icon */
  [part$='button']::before {
    background: currentColor;
    content: '';
    display: block;
    height: var(--vaadin-icon-size, 1lh);
    width: var(--vaadin-icon-size, 1lh);
    mask-size: var(--vaadin-icon-visual-size, 100%);
    mask-position: 50%;
    mask-repeat: no-repeat;
  }

  :host(:is(:not([clear-button-visible][has-value]), [disabled], [readonly])) [part~='clear-button'] {
    display: none;
  }

  [part~='clear-button']::before {
    mask-image: var(--_vaadin-icon-cross);
  }

  :host(:is([readonly], [disabled])) [part$='button'] {
    color: var(--vaadin-text-color-disabled);
    cursor: var(--vaadin-disabled-cursor);
  }

  @media (forced-colors: active) {
    [part$='button']::before {
      background: CanvasText;
    }

    :host([disabled]) [part$='button'] {
      color: GrayText;
    }

    :host([disabled]) [part$='button']::before {
      background: GrayText;
    }
  }
`;/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const wd=Ge`
  :host {
    --_helper-below-field: initial;
    --_helper-above-field: ;
    --_no-label: initial;
    --_has-label: ;
    --_no-helper: initial;
    --_has-helper: ;
    --_no-error: initial;
    --_has-error: ;
    --_gap: var(--vaadin-input-field-container-gap, var(--vaadin-gap-xs));
    --_gap-s: round(var(--_gap) / 3, 2px);
    display: inline-grid;
    grid-template:
      'label' auto var(--_helper-above-field, 'helper' auto) 'baseline' 0 'input' 1fr var(
        --_helper-below-field,
        'helper' auto
      )
      'error' auto / 100%;
    height: fit-content;
    outline: none;
    cursor: default;
    -webkit-tap-highlight-color: transparent;
  }

  :host([has-label]) {
    --_has-label: initial;
    --_no-label: ;
  }

  :host([has-helper]) {
    --_has-helper: initial;
    --_no-helper: ;
  }

  :host([has-error-message]) {
    --_has-error: initial;
    --_no-error: ;
  }

  :host([hidden]) {
    display: none !important;
  }

  :host(:not([has-label])) [part='label'],
  :host(:not([has-helper])) [part='helper-text'],
  :host(:not([has-error-message])) [part='error-message'] {
    display: none;
  }

  /* Baseline alignment guide */
  :host::before {
    content: '\\2003' / '';
    grid-column: 1;
    grid-row: var(--_has-label, label / baseline) var(--_no-label, label / input);
    align-self: var(--_has-label, end) var(--_no-label, start);
    font-size: var(--vaadin-input-field-value-font-size, inherit);
    line-height: var(--vaadin-input-field-value-line-height, inherit);
    padding: var(
      --vaadin-input-field-padding,
      var(--vaadin-padding-block-container) var(--vaadin-padding-inline-container)
    );
    border: var(--vaadin-input-field-border-width, 1px) solid transparent;
    pointer-events: none;
    margin-bottom: var(--_no-label, 0)
      var(
        --_has-label,
        calc(
          var(
              --vaadin-field-baseline-input-height,
              (1lh + var(--vaadin-padding-block-container) * 2 + var(--vaadin-input-field-border-width, 1px) * 2)
            ) *
            -1
        )
      );
  }

  [class$='container'] {
    display: contents;
  }

  [part] {
    grid-column: 1;
  }

  [part='label'] {
    font-size: var(--vaadin-input-field-label-font-size, inherit);
    line-height: var(--vaadin-input-field-label-line-height, inherit);
    font-weight: var(--vaadin-input-field-label-font-weight, 500);
    color: var(--vaadin-input-field-label-color, var(--vaadin-text-color));
    word-break: break-word;
    position: relative;
    grid-area: label;
    margin-bottom: var(--_helper-below-field, var(--_gap)) var(--_helper-above-field, var(--_no-helper, var(--_gap)));
  }

  ::slotted(label) {
    cursor: inherit;
  }

  :host([disabled]) [part='label'],
  :host([disabled]) ::slotted(label) {
    opacity: 0.5;
  }

  :host([disabled]) [part='label'] ::slotted(label) {
    opacity: 1;
  }

  :host([required]) [part='label'] {
    padding-inline-end: 1em;
  }

  [part='required-indicator'] {
    display: inline-block;
    position: absolute;
    width: 1em;
    text-align: center;
    color: var(--vaadin-input-field-required-indicator-color, var(--vaadin-text-color-secondary));
  }

  [part='required-indicator']::after {
    content: var(--vaadin-input-field-required-indicator, '*');
  }

  :host(:not([required])) [part='required-indicator'] {
    display: none;
  }

  [part='label'],
  [part='helper-text'],
  [part='error-message'] {
    width: min-content;
    min-width: 100%;
    box-sizing: border-box;
  }

  [part='input-field'],
  [part='group-field'],
  [part='input-fields'] {
    grid-area: input;
  }

  [part='input-field'] {
    width: var(--vaadin-field-default-width, 12em);
    max-width: 100%;
    min-width: 100%;
  }

  :host([readonly]) [part='input-field'] {
    cursor: default;
  }

  :host([disabled]) [part='input-field'] {
    cursor: var(--vaadin-disabled-cursor);
  }

  [part='helper-text'] {
    font-size: var(--vaadin-input-field-helper-font-size, inherit);
    line-height: var(--vaadin-input-field-helper-line-height, inherit);
    font-weight: var(--vaadin-input-field-helper-font-weight, 400);
    color: var(--vaadin-input-field-helper-color, var(--vaadin-text-color-secondary));
    grid-area: helper;
    margin-top: var(--_helper-above-field, var(--_gap-s)) var(--_helper-below-field, var(--_gap));
    margin-bottom: var(--_helper-above-field, var(--_gap));
  }

  [part='error-message'] {
    font-size: var(--vaadin-input-field-error-font-size, inherit);
    line-height: var(--vaadin-input-field-error-line-height, inherit);
    font-weight: var(--vaadin-input-field-error-font-weight, 400);
    color: var(--vaadin-input-field-error-color, var(--vaadin-text-color));
    display: flex;
    gap: var(--vaadin-gap-xs);
    grid-area: error;
    margin-top: var(--_has-helper, var(--_helper-below-field, var(--_gap-s)) var(--_helper-above-field, var(--_gap)))
      var(--_no-helper, var(--_gap));
  }

  [part='error-message']::before {
    content: '';
    display: inline-block;
    flex: none;
    width: var(--vaadin-icon-size, 1lh);
    height: var(--vaadin-icon-size, 1lh);
    mask: var(--_vaadin-icon-warn) 50% / var(--vaadin-icon-visual-size, 100%) no-repeat;
    background: currentColor;
  }

  :host([theme~='helper-above-field']) {
    --_helper-above-field: initial;
    --_helper-below-field: ;
  }

  @media (forced-colors: active) {
    [part='error-message']::before {
      background: CanvasText;
    }
  }
`;/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Oo=[wd,bd];/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const _d=Ge`
  :host {
    height: auto;
  }

  [part='input-field'] {
    overflow: auto;
    scroll-padding: var(
      --vaadin-input-field-padding,
      var(--vaadin-padding-block-container) var(--vaadin-padding-inline-container)
    );
  }

  ::slotted(textarea) {
    resize: none;
    white-space: pre-wrap;
  }

  [part='input-field'] ::slotted(:not(textarea)),
  [part~='clear-button'] {
    align-self: flex-start;
    position: sticky;
    top: 0;
  }

  [part~='clear-button'] {
    top: min(0px, (24px - 1lh) / -2);
  }

  /* Workaround https://bugzilla.mozilla.org/show_bug.cgi?id=1739079 */
  :host([disabled]) ::slotted(textarea) {
    user-select: none;
  }
`;/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const an=new ResizeObserver(o=>{setTimeout(()=>{o.forEach(a=>{a.target.isConnected&&(a.target.resizables?a.target.resizables.forEach(n=>{n._onResize(a.contentRect)}):a.target._onResize(a.contentRect))})})}),vd=Lt(o=>class extends o{get _observeParent(){return!1}connectedCallback(){if(super.connectedCallback(),an.observe(this),this._observeParent){const n=this.parentNode instanceof ShadowRoot?this.parentNode.host:this.parentNode;n.resizables||(n.resizables=new Set,an.observe(n)),n.resizables.add(this),this.__parent=n}}disconnectedCallback(){super.disconnectedCallback(),an.unobserve(this);const n=this.__parent;if(this._observeParent&&n){const d=n.resizables;d&&(d.delete(this),d.size===0&&an.unobserve(n)),this.__parent=null}}_onResize(n){}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const yd=Lt(o=>class extends No(ko(o)){static get properties(){return{autofocus:{type:Boolean},focusElement:{type:Object,readOnly:!0,observer:"_focusElementChanged",sync:!0},_lastTabIndex:{value:0}}}constructor(){super(),this._boundOnBlur=this._onBlur.bind(this),this._boundOnFocus=this._onFocus.bind(this)}ready(){super.ready(),this.autofocus&&!this.disabled&&requestAnimationFrame(()=>{this.focus()})}focus(n){this.focusElement&&!this.disabled&&(this.focusElement.focus(),n&&n.focusVisible===!1||this.setAttribute("focus-ring",""))}blur(){this.focusElement&&this.focusElement.blur()}click(){this.focusElement&&!this.disabled&&this.focusElement.click()}_focusElementChanged(n,d){n?(n.disabled=this.disabled,this._addFocusListeners(n),this.__forwardTabIndex(this.tabindex)):d&&this._removeFocusListeners(d)}_addFocusListeners(n){n.addEventListener("blur",this._boundOnBlur),n.addEventListener("focus",this._boundOnFocus)}_removeFocusListeners(n){n.removeEventListener("blur",this._boundOnBlur),n.removeEventListener("focus",this._boundOnFocus)}_onFocus(n){n.stopPropagation(),this.dispatchEvent(new Event("focus"))}_onBlur(n){n.stopPropagation(),this.dispatchEvent(new Event("blur"))}_shouldSetFocus(n){return n.target===this.focusElement}_shouldRemoveFocus(n){return n.target===this.focusElement}_disabledChanged(n,d){super._disabledChanged(n,d),this.focusElement&&(this.focusElement.disabled=n),n&&this.blur()}_tabindexChanged(n){this.__forwardTabIndex(n)}__forwardTabIndex(n){n!==void 0&&this.focusElement&&(this.focusElement.tabIndex=n,n!==-1&&(this.tabindex=void 0)),this.disabled&&n&&(n!==-1&&(this._lastTabIndex=n),this.tabindex=void 0),n===void 0&&this.hasAttribute("tabindex")&&this.removeAttribute("tabindex")}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const os=new WeakMap;function Cd(o){return os.has(o)||os.set(o,new Set),os.get(o)}function Ad(o,a){const n=document.createElement("style");n.textContent=o,a===document?document.head.appendChild(n):a.insertBefore(n,a.firstChild)}const Ed=Lt(o=>class extends o{get slotStyles(){return[]}connectedCallback(){super.connectedCallback(),this.__applySlotStyles()}__applySlotStyles(){const n=this.getRootNode(),d=Cd(n);this.slotStyles.forEach(u=>{d.has(u)||(Ad(u,n),d.add(u))})}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const En=o=>o.test(navigator.userAgent),ys=o=>o.test(navigator.platform),Sd=o=>o.test(navigator.vendor);En(/Android/u);En(/Chrome/u)&&Sd(/Google Inc/u);En(/Firefox/u);ys(/^iPad/u)||ys(/^Mac/u)&&navigator.maxTouchPoints>1;ys(/^iPhone/u);En(/^((?!chrome|android).)*safari/iu);const Id=(()=>{try{return document.createEvent("TouchEvent"),!0}catch{return!1}})();/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Do=Lt(o=>class extends o{static get properties(){return{inputElement:{type:Object,readOnly:!0,observer:"_inputElementChanged",sync:!0},type:{type:String,readOnly:!0},value:{type:String,value:"",observer:"_valueChanged",notify:!0,sync:!0}}}constructor(){super(),this._boundOnInput=this._onInput.bind(this),this._boundOnChange=this._onChange.bind(this)}get _hasValue(){return this.value!=null&&this.value!==""}get _inputElementValueProperty(){return"value"}get _inputElementValue(){return this.inputElement?this.inputElement[this._inputElementValueProperty]:void 0}set _inputElementValue(n){this.inputElement&&(this.inputElement[this._inputElementValueProperty]=n)}clear(){this.value="",this._inputElementValue=""}_addInputListeners(n){n.addEventListener("input",this._boundOnInput),n.addEventListener("change",this._boundOnChange)}_removeInputListeners(n){n.removeEventListener("input",this._boundOnInput),n.removeEventListener("change",this._boundOnChange)}_forwardInputValue(n){this.inputElement&&(this._inputElementValue=n??"")}_inputElementChanged(n,d){n?this._addInputListeners(n):d&&this._removeInputListeners(d)}_onInput(n){const d=n.composedPath()[0];this.__userInput=n.isTrusted,this.value=d.value,this.__userInput=!1}_onChange(n){}_toggleHasValue(n){this.toggleAttribute("has-value",n)}_valueChanged(n,d){this._toggleHasValue(this._hasValue),!(n===""&&d===void 0)&&(this.__userInput||this._forwardInputValue(n))}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Td=o=>class extends Do(Bs(o)){static get properties(){return{clearButtonVisible:{type:Boolean,reflectToAttribute:!0,value:!1}}}get clearElement(){return console.warn(`Please implement the 'clearElement' property in <${this.localName}>`),null}ready(){super.ready(),this.clearElement&&(this.clearElement.addEventListener("mousedown",n=>this._onClearButtonMouseDown(n)),this.clearElement.addEventListener("click",n=>this._onClearButtonClick(n)))}_onClearButtonClick(n){n.preventDefault(),this._onClearAction()}_onClearButtonMouseDown(n){this._shouldKeepFocusOnClearMousedown()&&n.preventDefault(),Id||this.inputElement.focus()}_onEscape(n){super._onEscape(n),this.clearButtonVisible&&this.value&&!this.readonly&&(n.stopPropagation(),this._onClearAction())}_onClearAction(){this._inputElementValue="",this.inputElement.dispatchEvent(new Event("input",{bubbles:!0,composed:!0})),this.inputElement.dispatchEvent(new Event("change",{bubbles:!0}))}_shouldKeepFocusOnClearMousedown(){return td(this.inputElement)}};/**
 * @license
 * Copyright (c) 2023 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ls=new Map;function Fs(o){return ls.has(o)||ls.set(o,new WeakMap),ls.get(o)}function Mo(o,a){o&&o.removeAttribute(a)}function Po(o,a){if(!o||!a)return;const n=Fs(a);if(n.has(o))return;const d=ks(o.getAttribute(a));n.set(o,new Set(d))}function Nd(o,a){if(!o||!a)return;const n=Fs(a),d=n.get(o);!d||d.size===0?o.removeAttribute(a):mo(o,a,Cn(d)),n.delete(o)}function cs(o,a,n={newId:null,oldId:null,fromUser:!1}){if(!o||!a)return;const{newId:d,oldId:u,fromUser:g}=n,m=Fs(a),C=m.get(o);if(!g&&C){u&&C.delete(u),d&&C.add(d);return}g&&(C?d||m.delete(o):Po(o,a),Mo(o,a)),pc(o,a,u);const A=d||Cn(C);A&&mo(o,a,A)}function kd(o,a){Po(o,a),Mo(o,a)}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Rd{constructor(a){this.host=a,this.__required=!1}setTarget(a){this.__target=a,this.__setAriaRequiredAttribute(this.__required),this.__setLabelIdToAriaAttribute(this.__labelId,this.__labelId),this.__labelIdFromUser!=null&&this.__setLabelIdToAriaAttribute(this.__labelIdFromUser,this.__labelIdFromUser,!0),this.__setErrorIdToAriaAttribute(this.__errorId),this.__setHelperIdToAriaAttribute(this.__helperId),this.setAriaLabel(this.__label)}setRequired(a){this.__setAriaRequiredAttribute(a),this.__required=a}setAriaLabel(a){this.__setAriaLabelToAttribute(a),this.__label=a}setLabelId(a,n=!1){const d=n?this.__labelIdFromUser:this.__labelId;this.__setLabelIdToAriaAttribute(a,d,n),n?this.__labelIdFromUser=a:this.__labelId=a}setErrorId(a){this.__setErrorIdToAriaAttribute(a,this.__errorId),this.__errorId=a}setHelperId(a){this.__setHelperIdToAriaAttribute(a,this.__helperId),this.__helperId=a}__setAriaLabelToAttribute(a){this.__target&&(a?(kd(this.__target,"aria-labelledby"),this.__target.setAttribute("aria-label",a)):this.__label&&(Nd(this.__target,"aria-labelledby"),this.__target.removeAttribute("aria-label")))}__setLabelIdToAriaAttribute(a,n,d){cs(this.__target,"aria-labelledby",{newId:a,oldId:n,fromUser:d})}__setErrorIdToAriaAttribute(a,n){cs(this.__target,"aria-describedby",{newId:a,oldId:n,fromUser:!1})}__setHelperIdToAriaAttribute(a,n){cs(this.__target,"aria-describedby",{newId:a,oldId:n,fromUser:!1})}__setAriaRequiredAttribute(a){this.__target&&(["input","textarea"].includes(this.__target.localName)||(a?this.__target.setAttribute("aria-required","true"):this.__target.removeAttribute("aria-required")))}}/**
 * @license
 * Copyright (c) 2022 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Mt=document.createElement("div");Mt.style.position="fixed";Mt.style.clip="rect(0px, 0px, 0px, 0px)";Mt.setAttribute("aria-live","polite");document.body.appendChild(Mt);let on;function Od(o,a={}){const n=a.mode||"polite",d=a.timeout===void 0?150:a.timeout;n==="alert"?(Mt.removeAttribute("aria-live"),Mt.removeAttribute("role"),on=ar.debounce(on,nc,()=>{Mt.setAttribute("role","alert")})):(on&&on.cancel(),Mt.removeAttribute("role"),Mt.setAttribute("aria-live",n)),Mt.textContent="",setTimeout(()=>{Mt.textContent=o},d)}/**
 * @license
 * Copyright (c) 2022 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Us extends An{constructor(a,n,d,u={}){super(a,n,d,{...u,useUniqueId:!0})}initCustomNode(a){this.__updateNodeId(a),this.__notifyChange(a)}teardownNode(a){const n=this.getSlotChild();n&&n!==this.defaultNode?this.__notifyChange(n):(this.restoreDefaultNode(),this.updateDefaultNode(this.node))}attachDefaultNode(){const a=super.attachDefaultNode();return a&&this.__updateNodeId(a),a}restoreDefaultNode(){}updateDefaultNode(a){this.__notifyChange(a)}observeNode(a){this.__nodeObserver&&this.__nodeObserver.disconnect(),this.__nodeObserver=new MutationObserver(n=>{n.forEach(d=>{const u=d.target,g=u===this.node;d.type==="attributes"?g&&this.__updateNodeId(u):(g||u.parentElement===this.node)&&this.__notifyChange(this.node)})}),this.__nodeObserver.observe(a,{attributes:!0,attributeFilter:["id"],childList:!0,subtree:!0,characterData:!0})}__hasContent(a){return a?a.nodeType===Node.ELEMENT_NODE&&(customElements.get(a.localName)||a.children.length>0)||a.textContent&&a.textContent.trim()!=="":!1}__notifyChange(a){this.dispatchEvent(new CustomEvent("slot-content-changed",{detail:{hasContent:this.__hasContent(a),node:a}}))}__updateNodeId(a){const n=!this.nodes||a===this.nodes[0];a.nodeType===Node.ELEMENT_NODE&&(!this.multiple||n)&&!a.id&&(a.id=this.defaultId)}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Dd extends Us{constructor(a){super(a,"error-message","div")}setErrorMessage(a){this.errorMessage=a,this.updateDefaultNode(this.node)}setInvalid(a){this.invalid=a,this.updateDefaultNode(this.node)}initAddedNode(a){a!==this.defaultNode&&this.initCustomNode(a)}initNode(a){this.updateDefaultNode(a)}initCustomNode(a){a.textContent&&!this.errorMessage&&(this.errorMessage=a.textContent.trim()),super.initCustomNode(a)}restoreDefaultNode(){this.attachDefaultNode()}updateDefaultNode(a){const{errorMessage:n,invalid:d}=this,u=!!(d&&n&&n.trim()!=="");a&&(a.textContent=u?n:"",a.hidden=!u,u&&Od(n,{mode:"assertive"})),super.updateDefaultNode(a)}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Md extends Us{constructor(a){super(a,"helper",null)}setHelperText(a){this.helperText=a,this.getSlotChild()||this.restoreDefaultNode(),this.node===this.defaultNode&&this.updateDefaultNode(this.node)}restoreDefaultNode(){const{helperText:a}=this;if(a&&a.trim()!==""){this.tagName="div";const n=this.attachDefaultNode();this.observeNode(n)}}updateDefaultNode(a){a&&(a.textContent=this.helperText),super.updateDefaultNode(a)}initCustomNode(a){super.initCustomNode(a),this.observeNode(a)}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Pd extends Us{constructor(a){super(a,"label","label")}setLabel(a){this.label=a,this.getSlotChild()||this.restoreDefaultNode(),this.node===this.defaultNode&&this.updateDefaultNode(this.node)}restoreDefaultNode(){const{label:a}=this;if(a&&a.trim()!==""){const n=this.attachDefaultNode();this.observeNode(n)}}updateDefaultNode(a){a&&(a.textContent=this.label),super.updateDefaultNode(a)}initCustomNode(a){super.initCustomNode(a),this.observeNode(a)}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Bd=o=>class extends o{static get properties(){return{label:{type:String,observer:"_labelChanged"}}}constructor(){super(),this._labelController=new Pd(this),this._labelController.addEventListener("slot-content-changed",n=>{this.toggleAttribute("has-label",n.detail.hasContent)})}get _labelId(){const n=this._labelNode;return n&&n.id}get _labelNode(){return this._labelController.node}ready(){super.ready(),this.addController(this._labelController)}_labelChanged(n){this._labelController.setLabel(n)}};/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Bo=Lt(o=>class extends o{static get properties(){return{invalid:{type:Boolean,reflectToAttribute:!0,notify:!0,value:!1,sync:!0},manualValidation:{type:Boolean,value:!1},required:{type:Boolean,reflectToAttribute:!0,sync:!0}}}validate(){const n=this.checkValidity();return this._setInvalid(!n),this.dispatchEvent(new CustomEvent("validated",{detail:{valid:n}})),n}checkValidity(){return!this.required||!!this.value}_setInvalid(n){this._shouldSetInvalid(n)&&(this.invalid=n)}_shouldSetInvalid(n){return!0}_requestValidation(){this.manualValidation||this.validate()}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Ld=o=>class extends Bo(Bd(o)){static get properties(){return{ariaTarget:{type:Object,observer:"_ariaTargetChanged"},errorMessage:{type:String,observer:"_errorMessageChanged"},helperText:{type:String,observer:"_helperTextChanged"},accessibleName:{type:String,observer:"_accessibleNameChanged"},accessibleNameRef:{type:String,observer:"_accessibleNameRefChanged"}}}static get observers(){return["_invalidChanged(invalid)","_requiredChanged(required)"]}constructor(){super(),this._fieldAriaController=new Rd(this),this._helperController=new Md(this),this._errorController=new Dd(this),this._errorController.addEventListener("slot-content-changed",n=>{this.toggleAttribute("has-error-message",n.detail.hasContent)}),this._labelController.addEventListener("slot-content-changed",n=>{const{hasContent:d,node:u}=n.detail;this.__labelChanged(d,u)}),this._helperController.addEventListener("slot-content-changed",n=>{const{hasContent:d,node:u}=n.detail;this.toggleAttribute("has-helper",d),this.__helperChanged(d,u)})}get _errorNode(){return this._errorController.node}get _helperNode(){return this._helperController.node}ready(){super.ready(),this.addController(this._fieldAriaController),this.addController(this._helperController),this.addController(this._errorController)}__helperChanged(n,d){n?this._fieldAriaController.setHelperId(d.id):this._fieldAriaController.setHelperId(null)}_accessibleNameChanged(n){this._fieldAriaController.setAriaLabel(n)}_accessibleNameRefChanged(n){this._fieldAriaController.setLabelId(n,!0)}__labelChanged(n,d){n?this._fieldAriaController.setLabelId(d.id):this._fieldAriaController.setLabelId(null)}_errorMessageChanged(n){this._errorController.setErrorMessage(n)}_helperTextChanged(n){this._helperController.setHelperText(n)}_ariaTargetChanged(n){n&&this._fieldAriaController.setTarget(n)}_requiredChanged(n){this._fieldAriaController.setRequired(n)}_invalidChanged(n){this._errorController.setInvalid(n),setTimeout(()=>{if(n){const d=this._errorNode;this._fieldAriaController.setErrorId(d&&d.id)}else this._fieldAriaController.setErrorId(null)})}};/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Fd=Lt(o=>class extends o{static get properties(){return{stateTarget:{type:Object,observer:"_stateTargetChanged"}}}static get delegateAttrs(){return[]}static get delegateProps(){return[]}ready(){super.ready(),this._createDelegateAttrsObserver(),this._createDelegatePropsObserver()}_stateTargetChanged(n){n&&(this._ensureAttrsDelegated(),this._ensurePropsDelegated())}_createDelegateAttrsObserver(){this._createMethodObserver(`_delegateAttrsChanged(${this.constructor.delegateAttrs.join(", ")})`)}_createDelegatePropsObserver(){this._createMethodObserver(`_delegatePropsChanged(${this.constructor.delegateProps.join(", ")})`)}_ensureAttrsDelegated(){this.constructor.delegateAttrs.forEach(n=>{this._delegateAttribute(n,this[n])})}_ensurePropsDelegated(){this.constructor.delegateProps.forEach(n=>{this._delegateProperty(n,this[n])})}_delegateAttrsChanged(...n){this.constructor.delegateAttrs.forEach((d,u)=>{this._delegateAttribute(d,n[u])})}_delegatePropsChanged(...n){this.constructor.delegateProps.forEach((d,u)=>{this._delegateProperty(d,n[u])})}_delegateAttribute(n,d){this.stateTarget&&(n==="invalid"&&this._delegateAttribute("aria-invalid",d?"true":!1),typeof d=="boolean"?this.stateTarget.toggleAttribute(n,d):d?this.stateTarget.setAttribute(n,d):this.stateTarget.removeAttribute(n))}_delegateProperty(n,d){this.stateTarget&&(this.stateTarget[n]=d)}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Ud=Lt(o=>class extends Fd(Bo(Do(o))){static get constraints(){return["required"]}static get delegateAttrs(){return[...super.delegateAttrs,"required"]}ready(){super.ready(),this._createConstraintsObserver()}checkValidity(){return this.inputElement&&this._hasValidConstraints(this.constructor.constraints.map(n=>this[n]))?this.inputElement.checkValidity():!this.invalid}_hasValidConstraints(n){return n.some(d=>this.__isValidConstraint(d))}_createConstraintsObserver(){this._createMethodObserver(`_constraintsChanged(stateTarget, ${this.constructor.constraints.join(", ")})`)}_constraintsChanged(n,...d){if(!n)return;const u=this._hasValidConstraints(d),g=this.__previousHasConstraints&&!u;(this._hasValue||this.invalid)&&u?this._requestValidation():g&&!this.manualValidation&&this._setInvalid(!1),this.__previousHasConstraints=u}_onChange(n){n.stopPropagation(),this._requestValidation(),this.dispatchEvent(new CustomEvent("change",{detail:{sourceEvent:n},bubbles:n.bubbles,cancelable:n.cancelable}))}__isValidConstraint(n){return!!n||n===0}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const $d=o=>class extends Ed(yd(Ud(Ld(Td(Bs(o)))))){static get properties(){return{allowedCharPattern:{type:String,observer:"_allowedCharPatternChanged"},autoselect:{type:Boolean,value:!1},name:{type:String,reflectToAttribute:!0},placeholder:{type:String,reflectToAttribute:!0},readonly:{type:Boolean,value:!1,reflectToAttribute:!0},title:{type:String,reflectToAttribute:!0}}}static get delegateAttrs(){return[...super.delegateAttrs,"name","type","placeholder","readonly","invalid","title"]}constructor(){super(),this._boundOnPaste=this._onPaste.bind(this),this._boundOnDrop=this._onDrop.bind(this),this._boundOnBeforeInput=this._onBeforeInput.bind(this)}get slotStyles(){const n=this.localName;return[`
          /* Needed for Safari, where ::slotted(...)::placeholder does not work */
          ${n} > :is(input[slot='input'], textarea[slot='textarea'])::placeholder {
            font: inherit;
            color: inherit;
          }

          /* Override built-in autofill styles */
          ${n} > input[slot='input']:autofill {
            -webkit-text-fill-color: var(--vaadin-input-field-autofill-color, black) !important;
            background-clip: text !important;
          }

          ${n}:has(> input[slot='input']:autofill)::part(input-field) {
            --vaadin-input-field-background: var(--vaadin-input-field-autofill-background, lightyellow) !important;
            --vaadin-input-field-value-color: var(--vaadin-input-field-autofill-color, black) !important;
            --vaadin-input-field-button-text-color: var(--vaadin-input-field-autofill-color, black) !important;
          }
        `]}_onFocus(n){super._onFocus(n),this.autoselect&&this.inputElement&&this.inputElement.select()}_addInputListeners(n){super._addInputListeners(n),n.addEventListener("paste",this._boundOnPaste),n.addEventListener("drop",this._boundOnDrop),n.addEventListener("beforeinput",this._boundOnBeforeInput)}_removeInputListeners(n){super._removeInputListeners(n),n.removeEventListener("paste",this._boundOnPaste),n.removeEventListener("drop",this._boundOnDrop),n.removeEventListener("beforeinput",this._boundOnBeforeInput)}_onKeyDown(n){super._onKeyDown(n),this.allowedCharPattern&&!this.__shouldAcceptKey(n)&&n.target===this.inputElement&&(n.preventDefault(),this._markInputPrevented())}_markInputPrevented(){this.setAttribute("input-prevented",""),this._preventInputDebouncer=ar.debounce(this._preventInputDebouncer,rc.after(200),()=>{this.removeAttribute("input-prevented")})}__shouldAcceptKey(n){return n.metaKey||n.ctrlKey||!n.key||n.key.length!==1||this.__allowedCharRegExp.test(n.key)}_onPaste(n){if(this.allowedCharPattern){const d=n.clipboardData.getData("text");this.__allowedTextRegExp.test(d)||(n.preventDefault(),this._markInputPrevented())}}_onDrop(n){if(this.allowedCharPattern){const d=n.dataTransfer.getData("text");this.__allowedTextRegExp.test(d)||(n.preventDefault(),this._markInputPrevented())}}_onBeforeInput(n){this.allowedCharPattern&&n.data&&!this.__allowedTextRegExp.test(n.data)&&(n.preventDefault(),this._markInputPrevented())}_allowedCharPatternChanged(n){if(n)try{this.__allowedCharRegExp=new RegExp(`^${n}$`,"u"),this.__allowedTextRegExp=new RegExp(`^${n}*$`,"u")}catch(d){console.error(d)}}};/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Lo=o=>class extends $d(o){static get properties(){return{autocomplete:{type:String},autocorrect:{type:String,reflectToAttribute:!0},autocapitalize:{type:String,reflectToAttribute:!0}}}static get delegateAttrs(){return[...super.delegateAttrs,"autocapitalize","autocomplete","autocorrect"]}_inputElementChanged(n){super._inputElementChanged(n),n&&(n.value&&n.value!==this.value&&(console.warn(`Please define value on the <${this.localName}> component!`),n.value=""),this.value&&(n.value=this.value))}_setFocused(n){super._setFocused(n),!n&&document.hasFocus()&&this._requestValidation()}_onInput(n){super._onInput(n),this.invalid&&this._requestValidation()}_valueChanged(n,d){super._valueChanged(n,d),d!==void 0&&this.invalid&&this._requestValidation()}};/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Fo{constructor(a,n){this.input=a,this.__preventDuplicateLabelClick=this.__preventDuplicateLabelClick.bind(this),n.addEventListener("slot-content-changed",d=>{this.__initLabel(d.detail.node)}),this.__initLabel(n.node)}__initLabel(a){a&&(a.addEventListener("click",this.__preventDuplicateLabelClick),this.input&&a.setAttribute("for",this.input.id))}__preventDuplicateLabelClick(){const a=n=>{n.stopImmediatePropagation(),this.input.removeEventListener("click",a)};this.input.addEventListener("click",a)}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class zd extends An{constructor(a,n){super(a,"textarea","textarea",{initializer:(d,u)=>{const g=u.getAttribute("value");g&&(d.value=g);const m=u.getAttribute("name");m&&d.setAttribute("name",m),d.id=this.defaultId,typeof n=="function"&&n(d)},useUniqueId:!0})}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Vd=o=>class extends vd(Lo(o)){static get properties(){return{maxlength:{type:Number},minlength:{type:Number},pattern:{type:String},minRows:{type:Number,value:2,observer:"__minRowsChanged"},maxRows:{type:Number}}}static get delegateAttrs(){return[...super.delegateAttrs,"maxlength","minlength","pattern"]}static get constraints(){return[...super.constraints,"maxlength","minlength","pattern"]}static get observers(){return["__updateMinHeight(minRows, inputElement)","__updateMaxHeight(maxRows, inputElement, _inputField)"]}get clearElement(){return this.$.clearButton}_onResize(){this._updateHeight(),this.__scrollPositionUpdated()}_onScroll(){this.__scrollPositionUpdated()}ready(){super.ready(),this.__textAreaController=new zd(this,n=>{this._setInputElement(n),this._setFocusElement(n),this.stateTarget=n,this.ariaTarget=n}),this.addController(this.__textAreaController),this.addController(new Fo(this.inputElement,this._labelController)),this._inputField=this.shadowRoot.querySelector("[part=input-field]"),this._inputField.addEventListener("wheel",n=>{const d=this._inputField.scrollTop;this._inputField.scrollTop+=n.deltaY,d!==this._inputField.scrollTop&&(n.preventDefault(),this.__scrollPositionUpdated())}),this._updateHeight(),this.__scrollPositionUpdated()}__scrollPositionUpdated(){this._inputField.style.setProperty("--_text-area-vertical-scroll-position","0px"),this._inputField.style.setProperty("--_text-area-vertical-scroll-position",`${this._inputField.scrollTop}px`)}_valueChanged(n,d){super._valueChanged(n,d),this._updateHeight()}_updateHeight(){const n=this.inputElement,d=this._inputField;if(!n||!d)return;const u=d.scrollTop,g=this.value?this.value.length:0;if(this._oldValueLength>=g){const C=getComputedStyle(d).height,A=getComputedStyle(n).width;d.style.height=C,n.style.maxWidth=A,n.style.alignSelf="flex-start",n.style.height="auto"}this._oldValueLength=g;const m=n.scrollHeight;m>n.clientHeight&&(n.style.height=`${m}px`),n.style.removeProperty("max-width"),n.style.removeProperty("align-self"),d.style.removeProperty("height"),d.scrollTop=u,this.__updateMaxHeight(this.maxRows)}__updateMinHeight(n){this.inputElement&&this.inputElement===this.__textAreaController.defaultNode&&(this.inputElement.rows=Math.max(n,1))}__updateMaxHeight(n){if(!(!this._inputField||!this.inputElement))if(n){const d=getComputedStyle(this.inputElement),u=getComputedStyle(this._inputField),m=parseFloat(d.lineHeight)*n,C=parseFloat(d.paddingTop)+parseFloat(d.paddingBottom)+parseFloat(d.marginTop)+parseFloat(d.marginBottom)+parseFloat(u.borderTopWidth)+parseFloat(u.borderBottomWidth)+parseFloat(u.paddingTop)+parseFloat(u.paddingBottom),A=Math.ceil(m+C);this._inputField.style.setProperty("max-height",`${A}px`)}else this._inputField.style.removeProperty("max-height")}__minRowsChanged(n){n<1&&console.warn("<vaadin-text-area> minRows must be at least 1.")}scrollToStart(){this._inputField.scrollTop=0}scrollToEnd(){this._inputField.scrollTop=this._inputField.scrollHeight}checkValidity(){if(!super.checkValidity())return!1;if(!this.pattern||!this.inputElement.value)return!0;try{const n=this.inputElement.value.match(this.pattern);return n?n[0]===n.input:!1}catch{return!0}}};/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Hd extends Vd(ur(zr(dr(hr(Te))))){static get is(){return"vaadin-text-area"}static get styles(){return[Oo,_d]}render(){return M`
      <div class="vaadin-text-area-container">
        <div part="label">
          <slot name="label"></slot>
          <span part="required-indicator" aria-hidden="true" @click="${this.focus}"></span>
        </div>

        <vaadin-input-container
          part="input-field"
          .readonly="${this.readonly}"
          .disabled="${this.disabled}"
          .invalid="${this.invalid}"
          theme="${Ro(this._theme)}"
          @scroll="${this._onScroll}"
        >
          <slot name="prefix" slot="prefix"></slot>
          <slot name="textarea"></slot>
          <slot name="suffix" slot="suffix"></slot>
          <div id="clearButton" part="field-button clear-button" slot="suffix" aria-hidden="true"></div>
        </vaadin-input-container>

        <div part="helper-text">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>

        <slot name="tooltip"></slot>
      </div>
    `}ready(){super.ready(),this._tooltipController=new Rs(this),this._tooltipController.setPosition("top"),this._tooltipController.setAriaTarget(this.inputElement),this.addController(this._tooltipController)}}cr(Hd);/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const $a=Ge`
  :host {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    box-sizing: border-box;
  }

  :host([hidden]) {
    display: none !important;
  }

  /* Theme variations */
  :host([theme~='margin']) {
    margin: var(--vaadin-vertical-layout-margin, var(--vaadin-padding-m));
  }

  :host([theme~='padding']) {
    padding: var(--vaadin-vertical-layout-padding, var(--vaadin-padding-m));
  }

  :host([theme~='spacing']) {
    gap: var(--vaadin-vertical-layout-gap, var(--vaadin-gap-s));
  }

  :host([theme~='wrap']) {
    flex-wrap: wrap;
  }
`,Gd=window.Vaadin.featureFlags.layoutComponentImprovements,Wd=Ge`
  ::slotted([data-height-full]) {
    flex: 1;
  }

  ::slotted(vaadin-horizontal-layout[data-height-full]),
  ::slotted(vaadin-vertical-layout[data-height-full]) {
    min-height: 0;
  }
`,Xd=Gd?[$a,Wd]:[$a];/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class jd extends ur(zr(dr(hr(Te)))){static get is(){return"vaadin-vertical-layout"}static get styles(){return Xd}static get lumoInjector(){return{...super.lumoInjector,includeBaseStyles:!0}}render(){return M`<slot></slot>`}}cr(jd);class Uo{constructor(a="http://localhost:3000"){this.defaultBackendUrl=a}_getBackendUrl(){const a=localStorage.getItem("electrocheck_backend_url");return a?a.trim():this.defaultBackendUrl}_getHeaders(a){const n={"Content-Type":"application/json","x-request-id":a||"req-"+Math.random().toString(36).substring(2,11)},d=localStorage.getItem("electrocheck_gemini_api_key");return d&&(n["x-gemini-api-key"]=d),n}async fetchWithRetry(a,n,d=3,u=1e3){try{const g=await fetch(a,n);return!g.ok&&g.status>=500&&d>0?(console.warn(`API-Anfrage fehlgeschlagen (${g.status}). Versuche erneut in ${u}ms... (${d} Versuche übrig)`),await new Promise(m=>setTimeout(m,u)),this.fetchWithRetry(a,n,d-1,u*2)):g}catch(g){if(d>0)return console.warn(`Netzwerkfehler: ${g}. Versuche erneut in ${u}ms... (${d} Versuche übrig)`),await new Promise(m=>setTimeout(m,u)),this.fetchWithRetry(a,n,d-1,u*2);throw g}}async getDiagnosis(a,n){const d=this._getBackendUrl(),u=await this.fetchWithRetry(`${d}/api/gemini/diagnosis`,{method:"POST",headers:this._getHeaders(),body:JSON.stringify({imageBase64:a,description:n})});if(!u.ok){const g=await u.json();throw new Error(g.error||"Fehler bei der Diagnoseanfrage über den Proxy.")}try{return await u.json()}catch(g){throw console.error("Fehler beim Parsen der Diagnoseantwort:",g),new Error("Diagnose fehlgeschlagen. Ungültige Antwort vom Server.")}}async scanTypePlate(a){const n=this._getBackendUrl(),d={imageBase64:a},u=await this.fetchWithRetry(`${n}/api/gemini/scanTypePlate`,{method:"POST",headers:this._getHeaders(),body:JSON.stringify(d)});if(!u.ok){const g=await u.json();throw new Error(g.error||"API Fehler beim Scannen des Typenschilds über den Proxy.")}try{return await u.json()}catch(g){throw console.error("Fehler beim Parsen der OCR-Antwort:",g),new Error("OCR-Scan fehlgeschlagen. Ungültige Antwort vom Server.")}}async analyzeThermalImage(a,n){const d=this._getBackendUrl(),u=await this.fetchWithRetry(`${d}/api/gemini/thermal-analysis`,{method:"POST",headers:this._getHeaders(),body:JSON.stringify({imageBase64:a,description:n})});if(!u.ok){const g=await u.json();throw new Error(g.error||"Fehler bei der thermografischen Analyse über den Proxy.")}try{return await u.json()}catch(g){throw console.error("Fehler beim Parsen der Thermografie-Antwort:",g),new Error("Wärmebild-Analyse fehlgeschlagen. Ungültige Antwort vom Server.")}}async scanMultimeter(a){const n=this._getBackendUrl(),d=await this.fetchWithRetry(`${n}/api/gemini/scanMultimeter`,{method:"POST",headers:this._getHeaders(),body:JSON.stringify({imageBase64:a})});if(!d.ok){const u=await d.json();throw new Error(u.error||"Fehler beim Ablesen des Multimeters über den Proxy.")}try{return await d.json()}catch(u){throw console.error("Fehler beim Parsen der Multimeter-Antwort:",u),new Error("Multimeter-Ablesung fehlgeschlagen. Ungültige Antwort vom Server.")}}}/*! Capacitor: https://capacitorjs.com/ - MIT License */var or;(function(o){o.Unimplemented="UNIMPLEMENTED",o.Unavailable="UNAVAILABLE"})(or||(or={}));class ds extends Error{constructor(a,n,d){super(a),this.message=a,this.code=n,this.data=d}}const Kd=o=>{var a,n;return o!=null&&o.androidBridge?"android":!((n=(a=o==null?void 0:o.webkit)===null||a===void 0?void 0:a.messageHandlers)===null||n===void 0)&&n.bridge?"ios":"web"},Zd=o=>{const a=o.CapacitorCustomPlatform||null,n=o.Capacitor||{},d=n.Plugins=n.Plugins||{},u=()=>a!==null?a.name:Kd(o),g=()=>u()!=="web",m=I=>{const H=_.get(I);return!!(H!=null&&H.platforms.has(u())||C(I))},C=I=>{var H;return(H=n.PluginHeaders)===null||H===void 0?void 0:H.find(X=>X.name===I)},A=I=>o.console.error(I),_=new Map,O=(I,H={})=>{const X=_.get(I);if(X)return console.warn(`Capacitor plugin "${I}" already registered. Cannot register plugins twice.`),X.proxy;const pe=u(),te=C(I);let Le;const Ce=async()=>(!Le&&pe in H?Le=typeof H[pe]=="function"?Le=await H[pe]():Le=H[pe]:a!==null&&!Le&&"web"in H&&(Le=typeof H.web=="function"?Le=await H.web():Le=H.web),Le),ce=(ie,B)=>{var et,De;if(te){const Y=te==null?void 0:te.methods.find(ae=>B===ae.name);if(Y)return Y.rtype==="promise"?ae=>n.nativePromise(I,B.toString(),ae):(ae,Me)=>n.nativeCallback(I,B.toString(),ae,Me);if(ie)return(et=ie[B])===null||et===void 0?void 0:et.bind(ie)}else{if(ie)return(De=ie[B])===null||De===void 0?void 0:De.bind(ie);throw new ds(`"${I}" plugin is not implemented on ${pe}`,or.Unimplemented)}},K=ie=>{let B;const et=(...De)=>{const Y=Ce().then(ae=>{const Me=ce(ae,ie);if(Me){const D=Me(...De);return B=D==null?void 0:D.remove,D}else throw new ds(`"${I}.${ie}()" is not implemented on ${pe}`,or.Unimplemented)});return ie==="addListener"&&(Y.remove=async()=>B()),Y};return et.toString=()=>`${ie.toString()}() { [capacitor code] }`,Object.defineProperty(et,"name",{value:ie,writable:!1,configurable:!1}),et},de=K("addListener"),gt=K("removeListener"),be=(ie,B)=>{const et=de({eventName:ie},B),De=async()=>{const ae=await et;gt({eventName:ie,callbackId:ae},B)},Y=new Promise(ae=>et.then(()=>ae({remove:De})));return Y.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await De()},Y},z=new Proxy({},{get(ie,B){switch(B){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return te?be:de;case"removeListener":return gt;default:return K(B)}}});return d[I]=z,_.set(I,{name:I,proxy:z,platforms:new Set([...Object.keys(H),...te?[pe]:[]])}),z};return n.convertFileSrc||(n.convertFileSrc=I=>I),n.getPlatform=u,n.handleError=A,n.isNativePlatform=g,n.isPluginAvailable=m,n.registerPlugin=O,n.Exception=ds,n.DEBUG=!!n.DEBUG,n.isLoggingEnabled=!!n.isLoggingEnabled,n},Yd=o=>o.Capacitor=Zd(o),Cs=Yd(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),Vr=Cs.registerPlugin;class $s{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(a,n){let d=!1;this.listeners[a]||(this.listeners[a]=[],d=!0),this.listeners[a].push(n);const g=this.windowListeners[a];g&&!g.registered&&this.addWindowListener(g),d&&this.sendRetainedArgumentsForEvent(a);const m=async()=>this.removeListener(a,n);return Promise.resolve({remove:m})}async removeAllListeners(){this.listeners={};for(const a in this.windowListeners)this.removeWindowListener(this.windowListeners[a]);this.windowListeners={}}notifyListeners(a,n,d){const u=this.listeners[a];if(!u){if(d){let g=this.retainedEventArguments[a];g||(g=[]),g.push(n),this.retainedEventArguments[a]=g}return}u.forEach(g=>g(n))}hasListeners(a){var n;return!!(!((n=this.listeners[a])===null||n===void 0)&&n.length)}registerWindowListener(a,n){this.windowListeners[n]={registered:!1,windowEventName:a,pluginEventName:n,handler:d=>{this.notifyListeners(n,d)}}}unimplemented(a="not implemented"){return new Cs.Exception(a,or.Unimplemented)}unavailable(a="not available"){return new Cs.Exception(a,or.Unavailable)}async removeListener(a,n){const d=this.listeners[a];if(!d)return;const u=d.indexOf(n);this.listeners[a].splice(u,1),this.listeners[a].length||this.removeWindowListener(this.windowListeners[a])}addWindowListener(a){window.addEventListener(a.windowEventName,a.handler),a.registered=!0}removeWindowListener(a){a&&(window.removeEventListener(a.windowEventName,a.handler),a.registered=!1)}sendRetainedArgumentsForEvent(a){const n=this.retainedEventArguments[a];n&&(delete this.retainedEventArguments[a],n.forEach(d=>{this.notifyListeners(a,d)}))}}const za=o=>encodeURIComponent(o).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),Va=o=>o.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent);class qd extends $s{async getCookies(){const a=document.cookie,n={};return a.split(";").forEach(d=>{if(d.length<=0)return;let[u,g]=d.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");u=Va(u).trim(),g=Va(g).trim(),n[u]=g}),n}async setCookie(a){try{const n=za(a.key),d=za(a.value),u=a.expires?`; expires=${a.expires.replace("expires=","")}`:"",g=(a.path||"/").replace("path=",""),m=a.url!=null&&a.url.length>0?`domain=${a.url}`:"";document.cookie=`${n}=${d||""}${u}; path=${g}; ${m};`}catch(n){return Promise.reject(n)}}async deleteCookie(a){try{document.cookie=`${a.key}=; Max-Age=0`}catch(n){return Promise.reject(n)}}async clearCookies(){try{const a=document.cookie.split(";")||[];for(const n of a)document.cookie=n.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(a){return Promise.reject(a)}}async clearAllCookies(){try{await this.clearCookies()}catch(a){return Promise.reject(a)}}}Vr("CapacitorCookies",{web:()=>new qd});const Qd=async o=>new Promise((a,n)=>{const d=new FileReader;d.onload=()=>{const u=d.result;a(u.indexOf(",")>=0?u.split(",")[1]:u)},d.onerror=u=>n(u),d.readAsDataURL(o)}),Jd=(o={})=>{const a=Object.keys(o);return Object.keys(o).map(u=>u.toLocaleLowerCase()).reduce((u,g,m)=>(u[g]=o[a[m]],u),{})},eh=(o,a=!0)=>o?Object.entries(o).reduce((d,u)=>{const[g,m]=u;let C,A;return Array.isArray(m)?(A="",m.forEach(_=>{C=a?encodeURIComponent(_):_,A+=`${g}=${C}&`}),A.slice(0,-1)):(C=a?encodeURIComponent(m):m,A=`${g}=${C}`),`${d}&${A}`},"").substr(1):null,th=(o,a={})=>{const n=Object.assign({method:o.method||"GET",headers:o.headers},a),u=Jd(o.headers)["content-type"]||"";if(typeof o.data=="string")n.body=o.data;else if(u.includes("application/x-www-form-urlencoded")){const g=new URLSearchParams;for(const[m,C]of Object.entries(o.data||{}))g.set(m,C);n.body=g.toString()}else if(u.includes("multipart/form-data")||o.data instanceof FormData){const g=new FormData;if(o.data instanceof FormData)o.data.forEach((C,A)=>{g.append(A,C)});else for(const C of Object.keys(o.data))g.append(C,o.data[C]);n.body=g;const m=new Headers(n.headers);m.delete("content-type"),n.headers=m}else(u.includes("application/json")||typeof o.data=="object")&&(n.body=JSON.stringify(o.data));return n};class ih extends $s{async request(a){const n=th(a,a.webFetchExtra),d=eh(a.params,a.shouldEncodeUrlParams),u=d?`${a.url}?${d}`:a.url,g=await fetch(u,n),m=g.headers.get("content-type")||"";let{responseType:C="text"}=g.ok?a:{};m.includes("application/json")&&(C="json");let A,_;switch(C){case"arraybuffer":case"blob":_=await g.blob(),A=await Qd(_);break;case"json":A=await g.json();break;case"document":case"text":default:A=await g.text()}const O={};return g.headers.forEach((I,H)=>{O[H]=I}),{data:A,headers:O,status:g.status,url:g.url}}async get(a){return this.request(Object.assign(Object.assign({},a),{method:"GET"}))}async post(a){return this.request(Object.assign(Object.assign({},a),{method:"POST"}))}async put(a){return this.request(Object.assign(Object.assign({},a),{method:"PUT"}))}async patch(a){return this.request(Object.assign(Object.assign({},a),{method:"PATCH"}))}async delete(a){return this.request(Object.assign(Object.assign({},a),{method:"DELETE"}))}}Vr("CapacitorHttp",{web:()=>new ih});var Ha;(function(o){o.Dark="DARK",o.Light="LIGHT",o.Default="DEFAULT"})(Ha||(Ha={}));var Ga;(function(o){o.StatusBar="StatusBar",o.NavigationBar="NavigationBar"})(Ga||(Ga={}));class rh extends $s{async setStyle(){this.unavailable("not available for web")}async setAnimation(){this.unavailable("not available for web")}async show(){this.unavailable("not available for web")}async hide(){this.unavailable("not available for web")}}Vr("SystemBars",{web:()=>new rh});const As=Vr("Network",{web:()=>mi(()=>import("./web-CwgmFYTM.js"),[]).then(o=>new o.NetworkWeb)});class nh{_getBackendUrl(){const a=localStorage.getItem("electrocheck_backend_url");return a?a.trim():"http://localhost:3000"}async createMaintenanceTicket(a){if(!(await As.getStatus()).connected){const m=localStorage.getItem("electrocheck_offline_tickets"),C=m?JSON.parse(m):[];throw C.push(a),localStorage.setItem("electrocheck_offline_tickets",JSON.stringify(C)),new Error("Offline! Das Ticket wurde in der Offline-Warteschlange gespeichert und wird synchronisiert, sobald Sie wieder online sind.")}console.log("Sende Daten an Backend...",a);const d=this._getBackendUrl(),u=await fetch(`${d}/api/tickets`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});if(!u.ok){const m=await u.json();throw new Error(m.error||"Fehler beim Erstellen des Tickets im Backend.")}return(await u.json()).id}async syncOfflineTickets(){const a=localStorage.getItem("electrocheck_offline_tickets");if(!a)return 0;const n=JSON.parse(a);if(n.length===0)return 0;console.log(`Synchronisiere ${n.length} Offline-Ticket(s)...`);let d=0;const u=this._getBackendUrl();for(const g of n)try{console.log(`Lade Ticket für ${g.deviceName} hoch...`),(await fetch(`${u}/api/tickets`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(g)})).ok&&d++}catch(m){console.error("Fehler beim Synchronisieren eines Offline-Tickets:",m)}return localStorage.removeItem("electrocheck_offline_tickets"),d}}class sh{constructor(a="http://localhost:3000"){this.defaultBackendUrl=a}_getBackendUrl(){const a=localStorage.getItem("electrocheck_backend_url");return a?a.trim():this.defaultBackendUrl}_getHeaders(){const a={"Content-Type":"application/json"},n=localStorage.getItem("electrocheck_perplexity_api_key");return n&&(a["x-perplexity-api-key"]=n),a}async search(a){const n=this._getBackendUrl(),d=await fetch(`${n}/api/perplexity/search`,{method:"POST",headers:this._getHeaders(),body:JSON.stringify({query:a})});if(!d.ok){const u=await d.json();throw new Error(u.error||"Fehler bei der Perplexity-Suche über das Backend.")}try{return(await d.json()).answer}catch(u){throw console.error("Fehler beim Parsen der Perplexity-Antwort:",u),new Error("Suche fehlgeschlagen. Ungültige Antwort vom Server.")}}}function ah(o){o.CapacitorUtils.Synapse=new Proxy({},{get(a,n){return new Proxy({},{get(d,u){return(g,m,C)=>{const A=o.Capacitor.Plugins[n];if(A===void 0){C(new Error(`Capacitor plugin ${n} not found`));return}if(typeof A[u]!="function"){C(new Error(`Method ${u} not found in Capacitor plugin ${n}`));return}(async()=>{try{const _=await A[u](g);m(_)}catch(_){C(_)}})()}}})}})}function oh(o){o.CapacitorUtils.Synapse=new Proxy({},{get(a,n){return o.cordova.plugins[n]}})}function lh(o=!1){typeof window>"u"||(window.CapacitorUtils=window.CapacitorUtils||{},window.Capacitor!==void 0&&!o?ah(window):window.cordova!==void 0&&oh(window))}const hs=Vr("Geolocation",{web:()=>mi(()=>import("./web-gAqvm2Gt.js"),[]).then(o=>new o.GeolocationWeb)});lh();const ch=[{id:"err-001",model:"Dell E2222H",errorCode:"No video/Power LED off",diagnosis:"Es wird kein Bild angezeigt und die Betriebsanzeige (LED) ist aus.",action:"Sicherstellen, dass das Videokabel richtig angeschlossen ist, die Steckdose funktioniert und der Netzschalter gedrückt ist.",safety:"Vor Beginn der Fehlerbehebung zwingend die allgemeinen Sicherheitshinweise befolgen."},{id:"err-002",model:"Saeco Royal",errorCode:"FILL WATER / DE-AERATE",diagnosis:"Der Wassertank ist leer oder es befindet sich Luft im Wassersystem.",action:"Den Wassertank füllen oder die Heißwassertaste drücken, um das System zu entlüften.",safety:"Vor Reparaturarbeiten muss die Maschine zwingend vom Stromnetz getrennt werden."},{id:"err-003",model:"Saeco Royal",errorCode:"GRINDER OBSTRUCTED",diagnosis:"Das Mahlwerk der Maschine ist blockiert.",action:"Das Mahlwerk muss gereinigt werden.",safety:"Alle Vorschriften zur Reparatur elektrischer Geräte beachten und den Netzstecker ziehen."},{id:"err-004",model:"Dell E2222H",errorCode:"Missing pixels",diagnosis:"Es fehlen Pixel auf dem Bildschirm, was auch ein natürlicher Defekt der LCD-Technologie sein kann.",action:"Die Stromversorgung aus- und wieder einschalten (Cycle power On-off).",safety:"Sämtliche Schritte nur nach Beachtung der Sicherheitshinweise durchführen."},{id:"err-005",model:"Saeco Royal",errorCode:"OVERHEATING",diagnosis:"Nach der Dampfausgabe ist das System nicht oder nur unzureichend abgekühlt.",action:"Heißwasser ausgeben, um das System abzukühlen, bis die Warnung erlischt.",safety:"Vorsicht vor Verbrennungen durch heißen Dampf oder heißes Wasser."}],dh="electrocheck_offline_db",$i="datasheets",hh=1;function zs(){return new Promise((o,a)=>{const n=indexedDB.open(dh,hh);n.onerror=()=>a(n.error),n.onsuccess=()=>o(n.result),n.onupgradeneeded=d=>{const u=n.result;u.objectStoreNames.contains($i)||u.createObjectStore($i,{keyPath:"id",autoIncrement:!0})}})}async function uh(o){const a=await zs();return new Promise((n,d)=>{const u=a.transaction($i,"readwrite"),m=u.objectStore(u.objectStoreNames[0]).put(o);m.onsuccess=()=>n(m.result),m.onerror=()=>d(m.error)})}async function $o(){const o=await zs();return new Promise((a,n)=>{const g=o.transaction($i,"readonly").objectStore($i).getAll();g.onsuccess=()=>a(g.result||[]),g.onerror=()=>n(g.error)})}async function fh(o){const a=await zs();return new Promise((n,d)=>{const m=a.transaction($i,"readwrite").objectStore($i).delete(o);m.onsuccess=()=>n(),m.onerror=()=>d(m.error)})}async function gh(o){if(!o)return null;const a=await $o(),n=o.toLowerCase().trim();for(const d of a){const u=d.modelMatch.toLowerCase().trim();if(n.includes(u)||u.includes(n))return d}return null}var W;(function(o){o[o.QR_CODE=0]="QR_CODE",o[o.AZTEC=1]="AZTEC",o[o.CODABAR=2]="CODABAR",o[o.CODE_39=3]="CODE_39",o[o.CODE_93=4]="CODE_93",o[o.CODE_128=5]="CODE_128",o[o.DATA_MATRIX=6]="DATA_MATRIX",o[o.MAXICODE=7]="MAXICODE",o[o.ITF=8]="ITF",o[o.EAN_13=9]="EAN_13",o[o.EAN_8=10]="EAN_8",o[o.PDF_417=11]="PDF_417",o[o.RSS_14=12]="RSS_14",o[o.RSS_EXPANDED=13]="RSS_EXPANDED",o[o.UPC_A=14]="UPC_A",o[o.UPC_E=15]="UPC_E",o[o.UPC_EAN_EXTENSION=16]="UPC_EAN_EXTENSION"})(W||(W={}));var Wa=new Map([[W.QR_CODE,"QR_CODE"],[W.AZTEC,"AZTEC"],[W.CODABAR,"CODABAR"],[W.CODE_39,"CODE_39"],[W.CODE_93,"CODE_93"],[W.CODE_128,"CODE_128"],[W.DATA_MATRIX,"DATA_MATRIX"],[W.MAXICODE,"MAXICODE"],[W.ITF,"ITF"],[W.EAN_13,"EAN_13"],[W.EAN_8,"EAN_8"],[W.PDF_417,"PDF_417"],[W.RSS_14,"RSS_14"],[W.RSS_EXPANDED,"RSS_EXPANDED"],[W.UPC_A,"UPC_A"],[W.UPC_E,"UPC_E"],[W.UPC_EAN_EXTENSION,"UPC_EAN_EXTENSION"]]),Xa;(function(o){o[o.UNKNOWN=0]="UNKNOWN",o[o.URL=1]="URL"})(Xa||(Xa={}));function ph(o){return Object.values(W).includes(o)}var gn;(function(o){o[o.SCAN_TYPE_CAMERA=0]="SCAN_TYPE_CAMERA",o[o.SCAN_TYPE_FILE=1]="SCAN_TYPE_FILE"})(gn||(gn={}));var mh=function(){function o(){}return o.GITHUB_PROJECT_URL="https://github.com/mebjas/html5-qrcode",o.SCAN_DEFAULT_FPS=2,o.DEFAULT_DISABLE_FLIP=!1,o.DEFAULT_REMEMBER_LAST_CAMERA_USED=!0,o.DEFAULT_SUPPORTED_SCAN_TYPE=[gn.SCAN_TYPE_CAMERA,gn.SCAN_TYPE_FILE],o}(),zo=function(){function o(a,n){this.format=a,this.formatName=n}return o.prototype.toString=function(){return this.formatName},o.create=function(a){if(!Wa.has(a))throw"".concat(a," not in html5QrcodeSupportedFormatsTextMap");return new o(a,Wa.get(a))},o}(),ja=function(){function o(){}return o.createFromText=function(a){var n={text:a};return{decodedText:a,result:n}},o.createFromQrcodeResult=function(a){return{decodedText:a.text,result:a}},o}(),Es;(function(o){o[o.UNKWOWN_ERROR=0]="UNKWOWN_ERROR",o[o.IMPLEMENTATION_ERROR=1]="IMPLEMENTATION_ERROR",o[o.NO_CODE_FOUND_ERROR=2]="NO_CODE_FOUND_ERROR"})(Es||(Es={}));var xh=function(){function o(){}return o.createFrom=function(a){return{errorMessage:a,type:Es.UNKWOWN_ERROR}},o}(),bh=function(){function o(a){this.verbose=a}return o.prototype.log=function(a){this.verbose&&console.log(a)},o.prototype.warn=function(a){this.verbose&&console.warn(a)},o.prototype.logError=function(a,n){(this.verbose||n===!0)&&console.error(a)},o.prototype.logErrors=function(a){if(a.length===0)throw"Logger#logError called without arguments";this.verbose&&console.error(a)},o}();function qt(o){return typeof o>"u"||o===null}var tr=function(){function o(){}return o.codeParseError=function(a){return"QR code parse error, error = ".concat(a)},o.errorGettingUserMedia=function(a){return"Error getting userMedia, error = ".concat(a)},o.onlyDeviceSupportedError=function(){return"The device doesn't support navigator.mediaDevices , only supported cameraIdOrConfig in this case is deviceId parameter (string)."},o.cameraStreamingNotSupported=function(){return"Camera streaming not supported by the browser."},o.unableToQuerySupportedDevices=function(){return"Unable to query supported devices, unknown error."},o.insecureContextCameraQueryError=function(){return"Camera access is only supported in secure context like https or localhost."},o.scannerPaused=function(){return"Scanner paused"},o}(),Vo=function(){function o(){}return o.isMediaStreamConstraintsValid=function(a,n){if(typeof a!="object"){var d=typeof a;return n.logError("videoConstraints should be of type object, the "+"object passed is of type ".concat(d,"."),!0),!1}for(var u=["autoGainControl","channelCount","echoCancellation","latency","noiseSuppression","sampleRate","sampleSize","volume"],g=new Set(u),m=Object.keys(a),C=0,A=m;C<A.length;C++){var _=A[C];if(g.has(_))return n.logError("".concat(_," is not supported videoConstaints."),!0),!1}return!0},o}(),kr=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function qu(o){return o&&o.__esModule&&Object.prototype.hasOwnProperty.call(o,"default")?o.default:o}var Ss={exports:{}};(function(o,a){(function(n,d){d(a)})(kr,function(n){function d(x){return x==null}var u=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(x,e){x.__proto__=e}||function(x,e){for(var t in e)e.hasOwnProperty(t)&&(x[t]=e[t])};function g(x,e){u(x,e);function t(){this.constructor=x}x.prototype=e===null?Object.create(e):(t.prototype=e.prototype,new t)}function m(x,e){var t=Object.setPrototypeOf;t?t(x,e):x.__proto__=e}function C(x,e){e===void 0&&(e=x.constructor);var t=Error.captureStackTrace;t&&t(x,e)}var A=function(x){g(e,x);function e(t){var i=this.constructor,r=x.call(this,t)||this;return Object.defineProperty(r,"name",{value:i.name,enumerable:!1}),m(r,i.prototype),C(r),r}return e}(Error);class _ extends A{constructor(e=void 0){super(e),this.message=e}getKind(){return this.constructor.kind}}_.kind="Exception";class O extends _{}O.kind="ArgumentException";class I extends _{}I.kind="IllegalArgumentException";class H{constructor(e){if(this.binarizer=e,e===null)throw new I("Binarizer must be non-null.")}getWidth(){return this.binarizer.getWidth()}getHeight(){return this.binarizer.getHeight()}getBlackRow(e,t){return this.binarizer.getBlackRow(e,t)}getBlackMatrix(){return(this.matrix===null||this.matrix===void 0)&&(this.matrix=this.binarizer.getBlackMatrix()),this.matrix}isCropSupported(){return this.binarizer.getLuminanceSource().isCropSupported()}crop(e,t,i,r){const s=this.binarizer.getLuminanceSource().crop(e,t,i,r);return new H(this.binarizer.createBinarizer(s))}isRotateSupported(){return this.binarizer.getLuminanceSource().isRotateSupported()}rotateCounterClockwise(){const e=this.binarizer.getLuminanceSource().rotateCounterClockwise();return new H(this.binarizer.createBinarizer(e))}rotateCounterClockwise45(){const e=this.binarizer.getLuminanceSource().rotateCounterClockwise45();return new H(this.binarizer.createBinarizer(e))}toString(){try{return this.getBlackMatrix().toString()}catch{return""}}}class X extends _{static getChecksumInstance(){return new X}}X.kind="ChecksumException";class pe{constructor(e){this.source=e}getLuminanceSource(){return this.source}getWidth(){return this.source.getWidth()}getHeight(){return this.source.getHeight()}}class te{static arraycopy(e,t,i,r,s){for(;s--;)i[r++]=e[t++]}static currentTimeMillis(){return Date.now()}}class Le extends _{}Le.kind="IndexOutOfBoundsException";class Ce extends Le{constructor(e=void 0,t=void 0){super(t),this.index=e,this.message=t}}Ce.kind="ArrayIndexOutOfBoundsException";class ce{static fill(e,t){for(let i=0,r=e.length;i<r;i++)e[i]=t}static fillWithin(e,t,i,r){ce.rangeCheck(e.length,t,i);for(let s=t;s<i;s++)e[s]=r}static rangeCheck(e,t,i){if(t>i)throw new I("fromIndex("+t+") > toIndex("+i+")");if(t<0)throw new Ce(t);if(i>e)throw new Ce(i)}static asList(...e){return e}static create(e,t,i){return Array.from({length:e}).map(s=>Array.from({length:t}).fill(i))}static createInt32Array(e,t,i){return Array.from({length:e}).map(s=>Int32Array.from({length:t}).fill(i))}static equals(e,t){if(!e||!t||!e.length||!t.length||e.length!==t.length)return!1;for(let i=0,r=e.length;i<r;i++)if(e[i]!==t[i])return!1;return!0}static hashCode(e){if(e===null)return 0;let t=1;for(const i of e)t=31*t+i;return t}static fillUint8Array(e,t){for(let i=0;i!==e.length;i++)e[i]=t}static copyOf(e,t){return e.slice(0,t)}static copyOfUint8Array(e,t){if(e.length<=t){const i=new Uint8Array(t);return i.set(e),i}return e.slice(0,t)}static copyOfRange(e,t,i){const r=i-t,s=new Int32Array(r);return te.arraycopy(e,t,s,0,r),s}static binarySearch(e,t,i){i===void 0&&(i=ce.numberComparator);let r=0,s=e.length-1;for(;r<=s;){const l=s+r>>1,c=i(t,e[l]);if(c>0)r=l+1;else if(c<0)s=l-1;else return l}return-r-1}static numberComparator(e,t){return e-t}}class K{static numberOfTrailingZeros(e){let t;if(e===0)return 32;let i=31;return t=e<<16,t!==0&&(i-=16,e=t),t=e<<8,t!==0&&(i-=8,e=t),t=e<<4,t!==0&&(i-=4,e=t),t=e<<2,t!==0&&(i-=2,e=t),i-(e<<1>>>31)}static numberOfLeadingZeros(e){if(e===0)return 32;let t=1;return e>>>16||(t+=16,e<<=16),e>>>24||(t+=8,e<<=8),e>>>28||(t+=4,e<<=4),e>>>30||(t+=2,e<<=2),t-=e>>>31,t}static toHexString(e){return e.toString(16)}static toBinaryString(e){return String(parseInt(String(e),2))}static bitCount(e){return e=e-(e>>>1&1431655765),e=(e&858993459)+(e>>>2&858993459),e=e+(e>>>4)&252645135,e=e+(e>>>8),e=e+(e>>>16),e&63}static truncDivision(e,t){return Math.trunc(e/t)}static parseInt(e,t=void 0){return parseInt(e,t)}}K.MIN_VALUE_32_BITS=-2147483648,K.MAX_VALUE=Number.MAX_SAFE_INTEGER;class de{constructor(e,t){e===void 0?(this.size=0,this.bits=new Int32Array(1)):(this.size=e,t==null?this.bits=de.makeArray(e):this.bits=t)}getSize(){return this.size}getSizeInBytes(){return Math.floor((this.size+7)/8)}ensureCapacity(e){if(e>this.bits.length*32){const t=de.makeArray(e);te.arraycopy(this.bits,0,t,0,this.bits.length),this.bits=t}}get(e){return(this.bits[Math.floor(e/32)]&1<<(e&31))!==0}set(e){this.bits[Math.floor(e/32)]|=1<<(e&31)}flip(e){this.bits[Math.floor(e/32)]^=1<<(e&31)}getNextSet(e){const t=this.size;if(e>=t)return t;const i=this.bits;let r=Math.floor(e/32),s=i[r];s&=~((1<<(e&31))-1);const l=i.length;for(;s===0;){if(++r===l)return t;s=i[r]}const c=r*32+K.numberOfTrailingZeros(s);return c>t?t:c}getNextUnset(e){const t=this.size;if(e>=t)return t;const i=this.bits;let r=Math.floor(e/32),s=~i[r];s&=~((1<<(e&31))-1);const l=i.length;for(;s===0;){if(++r===l)return t;s=~i[r]}const c=r*32+K.numberOfTrailingZeros(s);return c>t?t:c}setBulk(e,t){this.bits[Math.floor(e/32)]=t}setRange(e,t){if(t<e||e<0||t>this.size)throw new I;if(t===e)return;t--;const i=Math.floor(e/32),r=Math.floor(t/32),s=this.bits;for(let l=i;l<=r;l++){const c=l>i?0:e&31,f=(2<<(l<r?31:t&31))-(1<<c);s[l]|=f}}clear(){const e=this.bits.length,t=this.bits;for(let i=0;i<e;i++)t[i]=0}isRange(e,t,i){if(t<e||e<0||t>this.size)throw new I;if(t===e)return!0;t--;const r=Math.floor(e/32),s=Math.floor(t/32),l=this.bits;for(let c=r;c<=s;c++){const h=c>r?0:e&31,p=(2<<(c<s?31:t&31))-(1<<h)&4294967295;if((l[c]&p)!==(i?p:0))return!1}return!0}appendBit(e){this.ensureCapacity(this.size+1),e&&(this.bits[Math.floor(this.size/32)]|=1<<(this.size&31)),this.size++}appendBits(e,t){if(t<0||t>32)throw new I("Num bits must be between 0 and 32");this.ensureCapacity(this.size+t);for(let i=t;i>0;i--)this.appendBit((e>>i-1&1)===1)}appendBitArray(e){const t=e.size;this.ensureCapacity(this.size+t);for(let i=0;i<t;i++)this.appendBit(e.get(i))}xor(e){if(this.size!==e.size)throw new I("Sizes don't match");const t=this.bits;for(let i=0,r=t.length;i<r;i++)t[i]^=e.bits[i]}toBytes(e,t,i,r){for(let s=0;s<r;s++){let l=0;for(let c=0;c<8;c++)this.get(e)&&(l|=1<<7-c),e++;t[i+s]=l}}getBitArray(){return this.bits}reverse(){const e=new Int32Array(this.bits.length),t=Math.floor((this.size-1)/32),i=t+1,r=this.bits;for(let s=0;s<i;s++){let l=r[s];l=l>>1&1431655765|(l&1431655765)<<1,l=l>>2&858993459|(l&858993459)<<2,l=l>>4&252645135|(l&252645135)<<4,l=l>>8&16711935|(l&16711935)<<8,l=l>>16&65535|(l&65535)<<16,e[t-s]=l}if(this.size!==i*32){const s=i*32-this.size;let l=e[0]>>>s;for(let c=1;c<i;c++){const h=e[c];l|=h<<32-s,e[c-1]=l,l=h>>>s}e[i-1]=l}this.bits=e}static makeArray(e){return new Int32Array(Math.floor((e+31)/32))}equals(e){if(!(e instanceof de))return!1;const t=e;return this.size===t.size&&ce.equals(this.bits,t.bits)}hashCode(){return 31*this.size+ce.hashCode(this.bits)}toString(){let e="";for(let t=0,i=this.size;t<i;t++)t&7||(e+=" "),e+=this.get(t)?"X":".";return e}clone(){return new de(this.size,this.bits.slice())}}var gt;(function(x){x[x.OTHER=0]="OTHER",x[x.PURE_BARCODE=1]="PURE_BARCODE",x[x.POSSIBLE_FORMATS=2]="POSSIBLE_FORMATS",x[x.TRY_HARDER=3]="TRY_HARDER",x[x.CHARACTER_SET=4]="CHARACTER_SET",x[x.ALLOWED_LENGTHS=5]="ALLOWED_LENGTHS",x[x.ASSUME_CODE_39_CHECK_DIGIT=6]="ASSUME_CODE_39_CHECK_DIGIT",x[x.ASSUME_GS1=7]="ASSUME_GS1",x[x.RETURN_CODABAR_START_END=8]="RETURN_CODABAR_START_END",x[x.NEED_RESULT_POINT_CALLBACK=9]="NEED_RESULT_POINT_CALLBACK",x[x.ALLOWED_EAN_EXTENSIONS=10]="ALLOWED_EAN_EXTENSIONS"})(gt||(gt={}));var be=gt;class z extends _{static getFormatInstance(){return new z}}z.kind="FormatException";var ie;(function(x){x[x.Cp437=0]="Cp437",x[x.ISO8859_1=1]="ISO8859_1",x[x.ISO8859_2=2]="ISO8859_2",x[x.ISO8859_3=3]="ISO8859_3",x[x.ISO8859_4=4]="ISO8859_4",x[x.ISO8859_5=5]="ISO8859_5",x[x.ISO8859_6=6]="ISO8859_6",x[x.ISO8859_7=7]="ISO8859_7",x[x.ISO8859_8=8]="ISO8859_8",x[x.ISO8859_9=9]="ISO8859_9",x[x.ISO8859_10=10]="ISO8859_10",x[x.ISO8859_11=11]="ISO8859_11",x[x.ISO8859_13=12]="ISO8859_13",x[x.ISO8859_14=13]="ISO8859_14",x[x.ISO8859_15=14]="ISO8859_15",x[x.ISO8859_16=15]="ISO8859_16",x[x.SJIS=16]="SJIS",x[x.Cp1250=17]="Cp1250",x[x.Cp1251=18]="Cp1251",x[x.Cp1252=19]="Cp1252",x[x.Cp1256=20]="Cp1256",x[x.UnicodeBigUnmarked=21]="UnicodeBigUnmarked",x[x.UTF8=22]="UTF8",x[x.ASCII=23]="ASCII",x[x.Big5=24]="Big5",x[x.GB18030=25]="GB18030",x[x.EUC_KR=26]="EUC_KR"})(ie||(ie={}));class B{constructor(e,t,i,...r){this.valueIdentifier=e,this.name=i,typeof t=="number"?this.values=Int32Array.from([t]):this.values=t,this.otherEncodingNames=r,B.VALUE_IDENTIFIER_TO_ECI.set(e,this),B.NAME_TO_ECI.set(i,this);const s=this.values;for(let l=0,c=s.length;l!==c;l++){const h=s[l];B.VALUES_TO_ECI.set(h,this)}for(const l of r)B.NAME_TO_ECI.set(l,this)}getValueIdentifier(){return this.valueIdentifier}getName(){return this.name}getValue(){return this.values[0]}static getCharacterSetECIByValue(e){if(e<0||e>=900)throw new z("incorect value");const t=B.VALUES_TO_ECI.get(e);if(t===void 0)throw new z("incorect value");return t}static getCharacterSetECIByName(e){const t=B.NAME_TO_ECI.get(e);if(t===void 0)throw new z("incorect value");return t}equals(e){if(!(e instanceof B))return!1;const t=e;return this.getName()===t.getName()}}B.VALUE_IDENTIFIER_TO_ECI=new Map,B.VALUES_TO_ECI=new Map,B.NAME_TO_ECI=new Map,B.Cp437=new B(ie.Cp437,Int32Array.from([0,2]),"Cp437"),B.ISO8859_1=new B(ie.ISO8859_1,Int32Array.from([1,3]),"ISO-8859-1","ISO88591","ISO8859_1"),B.ISO8859_2=new B(ie.ISO8859_2,4,"ISO-8859-2","ISO88592","ISO8859_2"),B.ISO8859_3=new B(ie.ISO8859_3,5,"ISO-8859-3","ISO88593","ISO8859_3"),B.ISO8859_4=new B(ie.ISO8859_4,6,"ISO-8859-4","ISO88594","ISO8859_4"),B.ISO8859_5=new B(ie.ISO8859_5,7,"ISO-8859-5","ISO88595","ISO8859_5"),B.ISO8859_6=new B(ie.ISO8859_6,8,"ISO-8859-6","ISO88596","ISO8859_6"),B.ISO8859_7=new B(ie.ISO8859_7,9,"ISO-8859-7","ISO88597","ISO8859_7"),B.ISO8859_8=new B(ie.ISO8859_8,10,"ISO-8859-8","ISO88598","ISO8859_8"),B.ISO8859_9=new B(ie.ISO8859_9,11,"ISO-8859-9","ISO88599","ISO8859_9"),B.ISO8859_10=new B(ie.ISO8859_10,12,"ISO-8859-10","ISO885910","ISO8859_10"),B.ISO8859_11=new B(ie.ISO8859_11,13,"ISO-8859-11","ISO885911","ISO8859_11"),B.ISO8859_13=new B(ie.ISO8859_13,15,"ISO-8859-13","ISO885913","ISO8859_13"),B.ISO8859_14=new B(ie.ISO8859_14,16,"ISO-8859-14","ISO885914","ISO8859_14"),B.ISO8859_15=new B(ie.ISO8859_15,17,"ISO-8859-15","ISO885915","ISO8859_15"),B.ISO8859_16=new B(ie.ISO8859_16,18,"ISO-8859-16","ISO885916","ISO8859_16"),B.SJIS=new B(ie.SJIS,20,"SJIS","Shift_JIS"),B.Cp1250=new B(ie.Cp1250,21,"Cp1250","windows-1250"),B.Cp1251=new B(ie.Cp1251,22,"Cp1251","windows-1251"),B.Cp1252=new B(ie.Cp1252,23,"Cp1252","windows-1252"),B.Cp1256=new B(ie.Cp1256,24,"Cp1256","windows-1256"),B.UnicodeBigUnmarked=new B(ie.UnicodeBigUnmarked,25,"UnicodeBigUnmarked","UTF-16BE","UnicodeBig"),B.UTF8=new B(ie.UTF8,26,"UTF8","UTF-8"),B.ASCII=new B(ie.ASCII,Int32Array.from([27,170]),"ASCII","US-ASCII"),B.Big5=new B(ie.Big5,28,"Big5"),B.GB18030=new B(ie.GB18030,29,"GB18030","GB2312","EUC_CN","GBK"),B.EUC_KR=new B(ie.EUC_KR,30,"EUC_KR","EUC-KR");class et extends _{}et.kind="UnsupportedOperationException";class De{static decode(e,t){const i=this.encodingName(t);return this.customDecoder?this.customDecoder(e,i):typeof TextDecoder>"u"||this.shouldDecodeOnFallback(i)?this.decodeFallback(e,i):new TextDecoder(i).decode(e)}static shouldDecodeOnFallback(e){return!De.isBrowser()&&e==="ISO-8859-1"}static encode(e,t){const i=this.encodingName(t);return this.customEncoder?this.customEncoder(e,i):typeof TextEncoder>"u"?this.encodeFallback(e):new TextEncoder().encode(e)}static isBrowser(){return typeof window<"u"&&{}.toString.call(window)==="[object Window]"}static encodingName(e){return typeof e=="string"?e:e.getName()}static encodingCharacterSet(e){return e instanceof B?e:B.getCharacterSetECIByName(e)}static decodeFallback(e,t){const i=this.encodingCharacterSet(t);if(De.isDecodeFallbackSupported(i)){let r="";for(let s=0,l=e.length;s<l;s++){let c=e[s].toString(16);c.length<2&&(c="0"+c),r+="%"+c}return decodeURIComponent(r)}if(i.equals(B.UnicodeBigUnmarked))return String.fromCharCode.apply(null,new Uint16Array(e.buffer));throw new et(`Encoding ${this.encodingName(t)} not supported by fallback.`)}static isDecodeFallbackSupported(e){return e.equals(B.UTF8)||e.equals(B.ISO8859_1)||e.equals(B.ASCII)}static encodeFallback(e){const i=btoa(unescape(encodeURIComponent(e))).split(""),r=[];for(let s=0;s<i.length;s++)r.push(i[s].charCodeAt(0));return new Uint8Array(r)}}class Y{static castAsNonUtf8Char(e,t=null){const i=t?t.getName():this.ISO88591;return De.decode(new Uint8Array([e]),i)}static guessEncoding(e,t){if(t!=null&&t.get(be.CHARACTER_SET)!==void 0)return t.get(be.CHARACTER_SET).toString();const i=e.length;let r=!0,s=!0,l=!0,c=0,h=0,f=0,p=0,b=0,w=0,y=0,E=0,S=0,T=0,R=0;const U=e.length>3&&e[0]===239&&e[1]===187&&e[2]===191;for(let $=0;$<i&&(r||s||l);$++){const L=e[$]&255;l&&(c>0?L&128?c--:l=!1:L&128&&(L&64?(c++,L&32?(c++,L&16?(c++,L&8?l=!1:p++):f++):h++):l=!1)),r&&(L>127&&L<160?r=!1:L>159&&(L<192||L===215||L===247)&&R++),s&&(b>0?L<64||L===127||L>252?s=!1:b--:L===128||L===160||L>239?s=!1:L>160&&L<224?(w++,E=0,y++,y>S&&(S=y)):L>127?(b++,y=0,E++,E>T&&(T=E)):(y=0,E=0))}return l&&c>0&&(l=!1),s&&b>0&&(s=!1),l&&(U||h+f+p>0)?Y.UTF8:s&&(Y.ASSUME_SHIFT_JIS||S>=3||T>=3)?Y.SHIFT_JIS:r&&s?S===2&&w===2||R*10>=i?Y.SHIFT_JIS:Y.ISO88591:r?Y.ISO88591:s?Y.SHIFT_JIS:l?Y.UTF8:Y.PLATFORM_DEFAULT_ENCODING}static format(e,...t){let i=-1;function r(l,c,h,f,p,b){if(l==="%%")return"%";if(t[++i]===void 0)return;l=f?parseInt(f.substr(1)):void 0;let w=p?parseInt(p.substr(1)):void 0,y;switch(b){case"s":y=t[i];break;case"c":y=t[i][0];break;case"f":y=parseFloat(t[i]).toFixed(l);break;case"p":y=parseFloat(t[i]).toPrecision(l);break;case"e":y=parseFloat(t[i]).toExponential(l);break;case"x":y=parseInt(t[i]).toString(w||16);break;case"d":y=parseFloat(parseInt(t[i],w||10).toPrecision(l)).toFixed(0);break}y=typeof y=="object"?JSON.stringify(y):(+y).toString(w);let E=parseInt(h),S=h&&h[0]+""=="0"?"0":" ";for(;y.length<E;)y=c!==void 0?y+S:S+y;return y}let s=/%(-)?(0?[0-9]+)?([.][0-9]+)?([#][0-9]+)?([scfpexd%])/g;return e.replace(s,r)}static getBytes(e,t){return De.encode(e,t)}static getCharCode(e,t=0){return e.charCodeAt(t)}static getCharAt(e){return String.fromCharCode(e)}}Y.SHIFT_JIS=B.SJIS.getName(),Y.GB2312="GB2312",Y.ISO88591=B.ISO8859_1.getName(),Y.EUC_JP="EUC_JP",Y.UTF8=B.UTF8.getName(),Y.PLATFORM_DEFAULT_ENCODING=Y.UTF8,Y.ASSUME_SHIFT_JIS=!1;class ae{constructor(e=""){this.value=e}enableDecoding(e){return this.encoding=e,this}append(e){return typeof e=="string"?this.value+=e.toString():this.encoding?this.value+=Y.castAsNonUtf8Char(e,this.encoding):this.value+=String.fromCharCode(e),this}appendChars(e,t,i){for(let r=t;t<t+i;r++)this.append(e[r]);return this}length(){return this.value.length}charAt(e){return this.value.charAt(e)}deleteCharAt(e){this.value=this.value.substr(0,e)+this.value.substring(e+1)}setCharAt(e,t){this.value=this.value.substr(0,e)+t+this.value.substr(e+1)}substring(e,t){return this.value.substring(e,t)}setLengthToZero(){this.value=""}toString(){return this.value}insert(e,t){this.value=this.value.substr(0,e)+t+this.value.substr(e+t.length)}}class Me{constructor(e,t,i,r){if(this.width=e,this.height=t,this.rowSize=i,this.bits=r,t==null&&(t=e),this.height=t,e<1||t<1)throw new I("Both dimensions must be greater than 0");i==null&&(i=Math.floor((e+31)/32)),this.rowSize=i,r==null&&(this.bits=new Int32Array(this.rowSize*this.height))}static parseFromBooleanArray(e){const t=e.length,i=e[0].length,r=new Me(i,t);for(let s=0;s<t;s++){const l=e[s];for(let c=0;c<i;c++)l[c]&&r.set(c,s)}return r}static parseFromString(e,t,i){if(e===null)throw new I("stringRepresentation cannot be null");const r=new Array(e.length);let s=0,l=0,c=-1,h=0,f=0;for(;f<e.length;)if(e.charAt(f)===`
`||e.charAt(f)==="\r"){if(s>l){if(c===-1)c=s-l;else if(s-l!==c)throw new I("row lengths do not match");l=s,h++}f++}else if(e.substring(f,f+t.length)===t)f+=t.length,r[s]=!0,s++;else if(e.substring(f,f+i.length)===i)f+=i.length,r[s]=!1,s++;else throw new I("illegal character encountered: "+e.substring(f));if(s>l){if(c===-1)c=s-l;else if(s-l!==c)throw new I("row lengths do not match");h++}const p=new Me(c,h);for(let b=0;b<s;b++)r[b]&&p.set(Math.floor(b%c),Math.floor(b/c));return p}get(e,t){const i=t*this.rowSize+Math.floor(e/32);return(this.bits[i]>>>(e&31)&1)!==0}set(e,t){const i=t*this.rowSize+Math.floor(e/32);this.bits[i]|=1<<(e&31)&4294967295}unset(e,t){const i=t*this.rowSize+Math.floor(e/32);this.bits[i]&=~(1<<(e&31)&4294967295)}flip(e,t){const i=t*this.rowSize+Math.floor(e/32);this.bits[i]^=1<<(e&31)&4294967295}xor(e){if(this.width!==e.getWidth()||this.height!==e.getHeight()||this.rowSize!==e.getRowSize())throw new I("input matrix dimensions do not match");const t=new de(Math.floor(this.width/32)+1),i=this.rowSize,r=this.bits;for(let s=0,l=this.height;s<l;s++){const c=s*i,h=e.getRow(s,t).getBitArray();for(let f=0;f<i;f++)r[c+f]^=h[f]}}clear(){const e=this.bits,t=e.length;for(let i=0;i<t;i++)e[i]=0}setRegion(e,t,i,r){if(t<0||e<0)throw new I("Left and top must be nonnegative");if(r<1||i<1)throw new I("Height and width must be at least 1");const s=e+i,l=t+r;if(l>this.height||s>this.width)throw new I("The region must fit inside the matrix");const c=this.rowSize,h=this.bits;for(let f=t;f<l;f++){const p=f*c;for(let b=e;b<s;b++)h[p+Math.floor(b/32)]|=1<<(b&31)&4294967295}}getRow(e,t){t==null||t.getSize()<this.width?t=new de(this.width):t.clear();const i=this.rowSize,r=this.bits,s=e*i;for(let l=0;l<i;l++)t.setBulk(l*32,r[s+l]);return t}setRow(e,t){te.arraycopy(t.getBitArray(),0,this.bits,e*this.rowSize,this.rowSize)}rotate180(){const e=this.getWidth(),t=this.getHeight();let i=new de(e),r=new de(e);for(let s=0,l=Math.floor((t+1)/2);s<l;s++)i=this.getRow(s,i),r=this.getRow(t-1-s,r),i.reverse(),r.reverse(),this.setRow(s,r),this.setRow(t-1-s,i)}getEnclosingRectangle(){const e=this.width,t=this.height,i=this.rowSize,r=this.bits;let s=e,l=t,c=-1,h=-1;for(let f=0;f<t;f++)for(let p=0;p<i;p++){const b=r[f*i+p];if(b!==0){if(f<l&&(l=f),f>h&&(h=f),p*32<s){let w=0;for(;!(b<<31-w&4294967295);)w++;p*32+w<s&&(s=p*32+w)}if(p*32+31>c){let w=31;for(;!(b>>>w);)w--;p*32+w>c&&(c=p*32+w)}}}return c<s||h<l?null:Int32Array.from([s,l,c-s+1,h-l+1])}getTopLeftOnBit(){const e=this.rowSize,t=this.bits;let i=0;for(;i<t.length&&t[i]===0;)i++;if(i===t.length)return null;const r=i/e;let s=i%e*32;const l=t[i];let c=0;for(;!(l<<31-c&4294967295);)c++;return s+=c,Int32Array.from([s,r])}getBottomRightOnBit(){const e=this.rowSize,t=this.bits;let i=t.length-1;for(;i>=0&&t[i]===0;)i--;if(i<0)return null;const r=Math.floor(i/e);let s=Math.floor(i%e)*32;const l=t[i];let c=31;for(;!(l>>>c);)c--;return s+=c,Int32Array.from([s,r])}getWidth(){return this.width}getHeight(){return this.height}getRowSize(){return this.rowSize}equals(e){if(!(e instanceof Me))return!1;const t=e;return this.width===t.width&&this.height===t.height&&this.rowSize===t.rowSize&&ce.equals(this.bits,t.bits)}hashCode(){let e=this.width;return e=31*e+this.width,e=31*e+this.height,e=31*e+this.rowSize,e=31*e+ce.hashCode(this.bits),e}toString(e="X ",t="  ",i=`
`){return this.buildToString(e,t,i)}buildToString(e,t,i){let r=new ae;for(let s=0,l=this.height;s<l;s++){for(let c=0,h=this.width;c<h;c++)r.append(this.get(c,s)?e:t);r.append(i)}return r.toString()}clone(){return new Me(this.width,this.height,this.rowSize,this.bits.slice())}}class D extends _{static getNotFoundInstance(){return new D}}D.kind="NotFoundException";class Ze extends pe{constructor(e){super(e),this.luminances=Ze.EMPTY,this.buckets=new Int32Array(Ze.LUMINANCE_BUCKETS)}getBlackRow(e,t){const i=this.getLuminanceSource(),r=i.getWidth();t==null||t.getSize()<r?t=new de(r):t.clear(),this.initArrays(r);const s=i.getRow(e,this.luminances),l=this.buckets;for(let h=0;h<r;h++)l[(s[h]&255)>>Ze.LUMINANCE_SHIFT]++;const c=Ze.estimateBlackPoint(l);if(r<3)for(let h=0;h<r;h++)(s[h]&255)<c&&t.set(h);else{let h=s[0]&255,f=s[1]&255;for(let p=1;p<r-1;p++){const b=s[p+1]&255;(f*4-h-b)/2<c&&t.set(p),h=f,f=b}}return t}getBlackMatrix(){const e=this.getLuminanceSource(),t=e.getWidth(),i=e.getHeight(),r=new Me(t,i);this.initArrays(t);const s=this.buckets;for(let h=1;h<5;h++){const f=Math.floor(i*h/5),p=e.getRow(f,this.luminances),b=Math.floor(t*4/5);for(let w=Math.floor(t/5);w<b;w++){const y=p[w]&255;s[y>>Ze.LUMINANCE_SHIFT]++}}const l=Ze.estimateBlackPoint(s),c=e.getMatrix();for(let h=0;h<i;h++){const f=h*t;for(let p=0;p<t;p++)(c[f+p]&255)<l&&r.set(p,h)}return r}createBinarizer(e){return new Ze(e)}initArrays(e){this.luminances.length<e&&(this.luminances=new Uint8ClampedArray(e));const t=this.buckets;for(let i=0;i<Ze.LUMINANCE_BUCKETS;i++)t[i]=0}static estimateBlackPoint(e){const t=e.length;let i=0,r=0,s=0;for(let p=0;p<t;p++)e[p]>s&&(r=p,s=e[p]),e[p]>i&&(i=e[p]);let l=0,c=0;for(let p=0;p<t;p++){const b=p-r,w=e[p]*b*b;w>c&&(l=p,c=w)}if(r>l){const p=r;r=l,l=p}if(l-r<=t/16)throw new D;let h=l-1,f=-1;for(let p=l-1;p>r;p--){const b=p-r,w=b*b*(l-p)*(i-e[p]);w>f&&(h=p,f=w)}return h<<Ze.LUMINANCE_SHIFT}}Ze.LUMINANCE_BITS=5,Ze.LUMINANCE_SHIFT=8-Ze.LUMINANCE_BITS,Ze.LUMINANCE_BUCKETS=1<<Ze.LUMINANCE_BITS,Ze.EMPTY=Uint8ClampedArray.from([0]);class oe extends Ze{constructor(e){super(e),this.matrix=null}getBlackMatrix(){if(this.matrix!==null)return this.matrix;const e=this.getLuminanceSource(),t=e.getWidth(),i=e.getHeight();if(t>=oe.MINIMUM_DIMENSION&&i>=oe.MINIMUM_DIMENSION){const r=e.getMatrix();let s=t>>oe.BLOCK_SIZE_POWER;t&oe.BLOCK_SIZE_MASK&&s++;let l=i>>oe.BLOCK_SIZE_POWER;i&oe.BLOCK_SIZE_MASK&&l++;const c=oe.calculateBlackPoints(r,s,l,t,i),h=new Me(t,i);oe.calculateThresholdForBlock(r,s,l,t,i,c,h),this.matrix=h}else this.matrix=super.getBlackMatrix();return this.matrix}createBinarizer(e){return new oe(e)}static calculateThresholdForBlock(e,t,i,r,s,l,c){const h=s-oe.BLOCK_SIZE,f=r-oe.BLOCK_SIZE;for(let p=0;p<i;p++){let b=p<<oe.BLOCK_SIZE_POWER;b>h&&(b=h);const w=oe.cap(p,2,i-3);for(let y=0;y<t;y++){let E=y<<oe.BLOCK_SIZE_POWER;E>f&&(E=f);const S=oe.cap(y,2,t-3);let T=0;for(let U=-2;U<=2;U++){const $=l[w+U];T+=$[S-2]+$[S-1]+$[S]+$[S+1]+$[S+2]}const R=T/25;oe.thresholdBlock(e,E,b,R,r,c)}}}static cap(e,t,i){return e<t?t:e>i?i:e}static thresholdBlock(e,t,i,r,s,l){for(let c=0,h=i*s+t;c<oe.BLOCK_SIZE;c++,h+=s)for(let f=0;f<oe.BLOCK_SIZE;f++)(e[h+f]&255)<=r&&l.set(t+f,i+c)}static calculateBlackPoints(e,t,i,r,s){const l=s-oe.BLOCK_SIZE,c=r-oe.BLOCK_SIZE,h=new Array(i);for(let f=0;f<i;f++){h[f]=new Int32Array(t);let p=f<<oe.BLOCK_SIZE_POWER;p>l&&(p=l);for(let b=0;b<t;b++){let w=b<<oe.BLOCK_SIZE_POWER;w>c&&(w=c);let y=0,E=255,S=0;for(let R=0,U=p*r+w;R<oe.BLOCK_SIZE;R++,U+=r){for(let $=0;$<oe.BLOCK_SIZE;$++){const L=e[U+$]&255;y+=L,L<E&&(E=L),L>S&&(S=L)}if(S-E>oe.MIN_DYNAMIC_RANGE)for(R++,U+=r;R<oe.BLOCK_SIZE;R++,U+=r)for(let $=0;$<oe.BLOCK_SIZE;$++)y+=e[U+$]&255}let T=y>>oe.BLOCK_SIZE_POWER*2;if(S-E<=oe.MIN_DYNAMIC_RANGE&&(T=E/2,f>0&&b>0)){const R=(h[f-1][b]+2*h[f][b-1]+h[f-1][b-1])/4;E<R&&(T=R)}h[f][b]=T}}return h}}oe.BLOCK_SIZE_POWER=3,oe.BLOCK_SIZE=1<<oe.BLOCK_SIZE_POWER,oe.BLOCK_SIZE_MASK=oe.BLOCK_SIZE-1,oe.MINIMUM_DIMENSION=oe.BLOCK_SIZE*5,oe.MIN_DYNAMIC_RANGE=24;class pr{constructor(e,t){this.width=e,this.height=t}getWidth(){return this.width}getHeight(){return this.height}isCropSupported(){return!1}crop(e,t,i,r){throw new et("This luminance source does not support cropping.")}isRotateSupported(){return!1}rotateCounterClockwise(){throw new et("This luminance source does not support rotation by 90 degrees.")}rotateCounterClockwise45(){throw new et("This luminance source does not support rotation by 45 degrees.")}toString(){const e=new Uint8ClampedArray(this.width);let t=new ae;for(let i=0;i<this.height;i++){const r=this.getRow(i,e);for(let s=0;s<this.width;s++){const l=r[s]&255;let c;l<64?c="#":l<128?c="+":l<192?c=".":c=" ",t.append(c)}t.append(`
`)}return t.toString()}}class ni extends pr{constructor(e){super(e.getWidth(),e.getHeight()),this.delegate=e}getRow(e,t){const i=this.delegate.getRow(e,t),r=this.getWidth();for(let s=0;s<r;s++)i[s]=255-(i[s]&255);return i}getMatrix(){const e=this.delegate.getMatrix(),t=this.getWidth()*this.getHeight(),i=new Uint8ClampedArray(t);for(let r=0;r<t;r++)i[r]=255-(e[r]&255);return i}isCropSupported(){return this.delegate.isCropSupported()}crop(e,t,i,r){return new ni(this.delegate.crop(e,t,i,r))}isRotateSupported(){return this.delegate.isRotateSupported()}invert(){return this.delegate}rotateCounterClockwise(){return new ni(this.delegate.rotateCounterClockwise())}rotateCounterClockwise45(){return new ni(this.delegate.rotateCounterClockwise45())}}class si extends pr{constructor(e){super(e.width,e.height),this.canvas=e,this.tempCanvasElement=null,this.buffer=si.makeBufferFromCanvasImageData(e)}static makeBufferFromCanvasImageData(e){const t=e.getContext("2d").getImageData(0,0,e.width,e.height);return si.toGrayscaleBuffer(t.data,e.width,e.height)}static toGrayscaleBuffer(e,t,i){const r=new Uint8ClampedArray(t*i);for(let s=0,l=0,c=e.length;s<c;s+=4,l++){let h;if(e[s+3]===0)h=255;else{const p=e[s],b=e[s+1],w=e[s+2];h=306*p+601*b+117*w+512>>10}r[l]=h}return r}getRow(e,t){if(e<0||e>=this.getHeight())throw new I("Requested row is outside the image: "+e);const i=this.getWidth(),r=e*i;return t===null?t=this.buffer.slice(r,r+i):(t.length<i&&(t=new Uint8ClampedArray(i)),t.set(this.buffer.slice(r,r+i))),t}getMatrix(){return this.buffer}isCropSupported(){return!0}crop(e,t,i,r){return super.crop(e,t,i,r),this}isRotateSupported(){return!0}rotateCounterClockwise(){return this.rotate(-90),this}rotateCounterClockwise45(){return this.rotate(-45),this}getTempCanvasElement(){if(this.tempCanvasElement===null){const e=this.canvas.ownerDocument.createElement("canvas");e.width=this.canvas.width,e.height=this.canvas.height,this.tempCanvasElement=e}return this.tempCanvasElement}rotate(e){const t=this.getTempCanvasElement(),i=t.getContext("2d"),r=e*si.DEGREE_TO_RADIANS,s=this.canvas.width,l=this.canvas.height,c=Math.ceil(Math.abs(Math.cos(r))*s+Math.abs(Math.sin(r))*l),h=Math.ceil(Math.abs(Math.sin(r))*s+Math.abs(Math.cos(r))*l);return t.width=c,t.height=h,i.translate(c/2,h/2),i.rotate(r),i.drawImage(this.canvas,s/-2,l/-2),this.buffer=si.makeBufferFromCanvasImageData(t),this}invert(){return new ni(this)}}si.DEGREE_TO_RADIANS=Math.PI/180;class Gs{constructor(e,t,i){this.deviceId=e,this.label=t,this.kind="videoinput",this.groupId=i||void 0}toJSON(){return{kind:this.kind,groupId:this.groupId,deviceId:this.deviceId,label:this.label}}}var ct=(globalThis||kr||self||window||void 0)&&(globalThis||kr||self||window||void 0).__awaiter||function(x,e,t,i){function r(s){return s instanceof t?s:new t(function(l){l(s)})}return new(t||(t=Promise))(function(s,l){function c(p){try{f(i.next(p))}catch(b){l(b)}}function h(p){try{f(i.throw(p))}catch(b){l(b)}}function f(p){p.done?s(p.value):r(p.value).then(c,h)}f((i=i.apply(x,e||[])).next())})};class Ci{constructor(e,t=500,i){this.reader=e,this.timeBetweenScansMillis=t,this._hints=i,this._stopContinuousDecode=!1,this._stopAsyncDecode=!1,this._timeBetweenDecodingAttempts=0}get hasNavigator(){return typeof navigator<"u"}get isMediaDevicesSuported(){return this.hasNavigator&&!!navigator.mediaDevices}get canEnumerateDevices(){return!!(this.isMediaDevicesSuported&&navigator.mediaDevices.enumerateDevices)}get timeBetweenDecodingAttempts(){return this._timeBetweenDecodingAttempts}set timeBetweenDecodingAttempts(e){this._timeBetweenDecodingAttempts=e<0?0:e}set hints(e){this._hints=e||null}get hints(){return this._hints}listVideoInputDevices(){return ct(this,void 0,void 0,function*(){if(!this.hasNavigator)throw new Error("Can't enumerate devices, navigator is not present.");if(!this.canEnumerateDevices)throw new Error("Can't enumerate devices, method not supported.");const e=yield navigator.mediaDevices.enumerateDevices(),t=[];for(const i of e){const r=i.kind==="video"?"videoinput":i.kind;if(r!=="videoinput")continue;const s=i.deviceId||i.id,l=i.label||`Video device ${t.length+1}`,c=i.groupId,h={deviceId:s,label:l,kind:r,groupId:c};t.push(h)}return t})}getVideoInputDevices(){return ct(this,void 0,void 0,function*(){return(yield this.listVideoInputDevices()).map(t=>new Gs(t.deviceId,t.label))})}findDeviceById(e){return ct(this,void 0,void 0,function*(){const t=yield this.listVideoInputDevices();return t?t.find(i=>i.deviceId===e):null})}decodeFromInputVideoDevice(e,t){return ct(this,void 0,void 0,function*(){return yield this.decodeOnceFromVideoDevice(e,t)})}decodeOnceFromVideoDevice(e,t){return ct(this,void 0,void 0,function*(){this.reset();let i;e?i={deviceId:{exact:e}}:i={facingMode:"environment"};const r={video:i};return yield this.decodeOnceFromConstraints(r,t)})}decodeOnceFromConstraints(e,t){return ct(this,void 0,void 0,function*(){const i=yield navigator.mediaDevices.getUserMedia(e);return yield this.decodeOnceFromStream(i,t)})}decodeOnceFromStream(e,t){return ct(this,void 0,void 0,function*(){this.reset();const i=yield this.attachStreamToVideo(e,t);return yield this.decodeOnce(i)})}decodeFromInputVideoDeviceContinuously(e,t,i){return ct(this,void 0,void 0,function*(){return yield this.decodeFromVideoDevice(e,t,i)})}decodeFromVideoDevice(e,t,i){return ct(this,void 0,void 0,function*(){let r;e?r={deviceId:{exact:e}}:r={facingMode:"environment"};const s={video:r};return yield this.decodeFromConstraints(s,t,i)})}decodeFromConstraints(e,t,i){return ct(this,void 0,void 0,function*(){const r=yield navigator.mediaDevices.getUserMedia(e);return yield this.decodeFromStream(r,t,i)})}decodeFromStream(e,t,i){return ct(this,void 0,void 0,function*(){this.reset();const r=yield this.attachStreamToVideo(e,t);return yield this.decodeContinuously(r,i)})}stopAsyncDecode(){this._stopAsyncDecode=!0}stopContinuousDecode(){this._stopContinuousDecode=!0}attachStreamToVideo(e,t){return ct(this,void 0,void 0,function*(){const i=this.prepareVideoElement(t);return this.addVideoSource(i,e),this.videoElement=i,this.stream=e,yield this.playVideoOnLoadAsync(i),i})}playVideoOnLoadAsync(e){return new Promise((t,i)=>this.playVideoOnLoad(e,()=>t()))}playVideoOnLoad(e,t){this.videoEndedListener=()=>this.stopStreams(),this.videoCanPlayListener=()=>this.tryPlayVideo(e),e.addEventListener("ended",this.videoEndedListener),e.addEventListener("canplay",this.videoCanPlayListener),e.addEventListener("playing",t),this.tryPlayVideo(e)}isVideoPlaying(e){return e.currentTime>0&&!e.paused&&!e.ended&&e.readyState>2}tryPlayVideo(e){return ct(this,void 0,void 0,function*(){if(this.isVideoPlaying(e)){console.warn("Trying to play video that is already playing.");return}try{yield e.play()}catch{console.warn("It was not possible to play the video.")}})}getMediaElement(e,t){const i=document.getElementById(e);if(!i)throw new O(`element with id '${e}' not found`);if(i.nodeName.toLowerCase()!==t.toLowerCase())throw new O(`element with id '${e}' must be an ${t} element`);return i}decodeFromImage(e,t){if(!e&&!t)throw new O("either imageElement with a src set or an url must be provided");return t&&!e?this.decodeFromImageUrl(t):this.decodeFromImageElement(e)}decodeFromVideo(e,t){if(!e&&!t)throw new O("Either an element with a src set or an URL must be provided");return t&&!e?this.decodeFromVideoUrl(t):this.decodeFromVideoElement(e)}decodeFromVideoContinuously(e,t,i){if(e===void 0&&t===void 0)throw new O("Either an element with a src set or an URL must be provided");return t&&!e?this.decodeFromVideoUrlContinuously(t,i):this.decodeFromVideoElementContinuously(e,i)}decodeFromImageElement(e){if(!e)throw new O("An image element must be provided.");this.reset();const t=this.prepareImageElement(e);this.imageElement=t;let i;return this.isImageLoaded(t)?i=this.decodeOnce(t,!1,!0):i=this._decodeOnLoadImage(t),i}decodeFromVideoElement(e){const t=this._decodeFromVideoElementSetup(e);return this._decodeOnLoadVideo(t)}decodeFromVideoElementContinuously(e,t){const i=this._decodeFromVideoElementSetup(e);return this._decodeOnLoadVideoContinuously(i,t)}_decodeFromVideoElementSetup(e){if(!e)throw new O("A video element must be provided.");this.reset();const t=this.prepareVideoElement(e);return this.videoElement=t,t}decodeFromImageUrl(e){if(!e)throw new O("An URL must be provided.");this.reset();const t=this.prepareImageElement();this.imageElement=t;const i=this._decodeOnLoadImage(t);return t.src=e,i}decodeFromVideoUrl(e){if(!e)throw new O("An URL must be provided.");this.reset();const t=this.prepareVideoElement(),i=this.decodeFromVideoElement(t);return t.src=e,i}decodeFromVideoUrlContinuously(e,t){if(!e)throw new O("An URL must be provided.");this.reset();const i=this.prepareVideoElement(),r=this.decodeFromVideoElementContinuously(i,t);return i.src=e,r}_decodeOnLoadImage(e){return new Promise((t,i)=>{this.imageLoadedListener=()=>this.decodeOnce(e,!1,!0).then(t,i),e.addEventListener("load",this.imageLoadedListener)})}_decodeOnLoadVideo(e){return ct(this,void 0,void 0,function*(){return yield this.playVideoOnLoadAsync(e),yield this.decodeOnce(e)})}_decodeOnLoadVideoContinuously(e,t){return ct(this,void 0,void 0,function*(){yield this.playVideoOnLoadAsync(e),this.decodeContinuously(e,t)})}isImageLoaded(e){return!(!e.complete||e.naturalWidth===0)}prepareImageElement(e){let t;return typeof e>"u"&&(t=document.createElement("img"),t.width=200,t.height=200),typeof e=="string"&&(t=this.getMediaElement(e,"img")),e instanceof HTMLImageElement&&(t=e),t}prepareVideoElement(e){let t;return!e&&typeof document<"u"&&(t=document.createElement("video"),t.width=200,t.height=200),typeof e=="string"&&(t=this.getMediaElement(e,"video")),e instanceof HTMLVideoElement&&(t=e),t.setAttribute("autoplay","true"),t.setAttribute("muted","true"),t.setAttribute("playsinline","true"),t}decodeOnce(e,t=!0,i=!0){this._stopAsyncDecode=!1;const r=(s,l)=>{if(this._stopAsyncDecode){l(new D("Video stream has ended before any code could be detected.")),this._stopAsyncDecode=void 0;return}try{const c=this.decode(e);s(c)}catch(c){const h=t&&c instanceof D,p=(c instanceof X||c instanceof z)&&i;if(h||p)return setTimeout(r,this._timeBetweenDecodingAttempts,s,l);l(c)}};return new Promise((s,l)=>r(s,l))}decodeContinuously(e,t){this._stopContinuousDecode=!1;const i=()=>{if(this._stopContinuousDecode){this._stopContinuousDecode=void 0;return}try{const r=this.decode(e);t(r,null),setTimeout(i,this.timeBetweenScansMillis)}catch(r){t(null,r);const s=r instanceof X||r instanceof z,l=r instanceof D;(s||l)&&setTimeout(i,this._timeBetweenDecodingAttempts)}};i()}decode(e){const t=this.createBinaryBitmap(e);return this.decodeBitmap(t)}_isHTMLVideoElement(e){return e.videoWidth!==0}drawFrameOnCanvas(e,t,i){t||(t={sx:0,sy:0,sWidth:e.videoWidth,sHeight:e.videoHeight,dx:0,dy:0,dWidth:e.videoWidth,dHeight:e.videoHeight}),i||(i=this.captureCanvasContext),i.drawImage(e,t.sx,t.sy,t.sWidth,t.sHeight,t.dx,t.dy,t.dWidth,t.dHeight)}drawImageOnCanvas(e,t,i=this.captureCanvasContext){t||(t={sx:0,sy:0,sWidth:e.naturalWidth,sHeight:e.naturalHeight,dx:0,dy:0,dWidth:e.naturalWidth,dHeight:e.naturalHeight}),i||(i=this.captureCanvasContext),i.drawImage(e,t.sx,t.sy,t.sWidth,t.sHeight,t.dx,t.dy,t.dWidth,t.dHeight)}createBinaryBitmap(e){this.getCaptureCanvasContext(e),this._isHTMLVideoElement(e)?this.drawFrameOnCanvas(e):this.drawImageOnCanvas(e);const t=this.getCaptureCanvas(e),i=new si(t),r=new oe(i);return new H(r)}getCaptureCanvasContext(e){if(!this.captureCanvasContext){const i=this.getCaptureCanvas(e).getContext("2d");this.captureCanvasContext=i}return this.captureCanvasContext}getCaptureCanvas(e){if(!this.captureCanvas){const t=this.createCaptureCanvas(e);this.captureCanvas=t}return this.captureCanvas}decodeBitmap(e){return this.reader.decode(e,this._hints)}createCaptureCanvas(e){if(typeof document>"u")return this._destroyCaptureCanvas(),null;const t=document.createElement("canvas");let i,r;return typeof e<"u"&&(e instanceof HTMLVideoElement?(i=e.videoWidth,r=e.videoHeight):e instanceof HTMLImageElement&&(i=e.naturalWidth||e.width,r=e.naturalHeight||e.height)),t.style.width=i+"px",t.style.height=r+"px",t.width=i,t.height=r,t}stopStreams(){this.stream&&(this.stream.getVideoTracks().forEach(e=>e.stop()),this.stream=void 0),this._stopAsyncDecode===!1&&this.stopAsyncDecode(),this._stopContinuousDecode===!1&&this.stopContinuousDecode()}reset(){this.stopStreams(),this._destroyVideoElement(),this._destroyImageElement(),this._destroyCaptureCanvas()}_destroyVideoElement(){this.videoElement&&(typeof this.videoEndedListener<"u"&&this.videoElement.removeEventListener("ended",this.videoEndedListener),typeof this.videoPlayingEventListener<"u"&&this.videoElement.removeEventListener("playing",this.videoPlayingEventListener),typeof this.videoCanPlayListener<"u"&&this.videoElement.removeEventListener("loadedmetadata",this.videoCanPlayListener),this.cleanVideoSource(this.videoElement),this.videoElement=void 0)}_destroyImageElement(){this.imageElement&&(this.imageLoadedListener!==void 0&&this.imageElement.removeEventListener("load",this.imageLoadedListener),this.imageElement.src=void 0,this.imageElement.removeAttribute("src"),this.imageElement=void 0)}_destroyCaptureCanvas(){this.captureCanvasContext=void 0,this.captureCanvas=void 0}addVideoSource(e,t){try{e.srcObject=t}catch{e.src=URL.createObjectURL(t)}}cleanVideoSource(e){try{e.srcObject=null}catch{e.src=""}this.videoElement.removeAttribute("src")}}class dt{constructor(e,t,i=t==null?0:8*t.length,r,s,l=te.currentTimeMillis()){this.text=e,this.rawBytes=t,this.numBits=i,this.resultPoints=r,this.format=s,this.timestamp=l,this.text=e,this.rawBytes=t,i==null?this.numBits=t==null?0:8*t.length:this.numBits=i,this.resultPoints=r,this.format=s,this.resultMetadata=null,l==null?this.timestamp=te.currentTimeMillis():this.timestamp=l}getText(){return this.text}getRawBytes(){return this.rawBytes}getNumBits(){return this.numBits}getResultPoints(){return this.resultPoints}getBarcodeFormat(){return this.format}getResultMetadata(){return this.resultMetadata}putMetadata(e,t){this.resultMetadata===null&&(this.resultMetadata=new Map),this.resultMetadata.set(e,t)}putAllMetadata(e){e!==null&&(this.resultMetadata===null?this.resultMetadata=e:this.resultMetadata=new Map(e))}addResultPoints(e){const t=this.resultPoints;if(t===null)this.resultPoints=e;else if(e!==null&&e.length>0){const i=new Array(t.length+e.length);te.arraycopy(t,0,i,0,t.length),te.arraycopy(e,0,i,t.length,e.length),this.resultPoints=i}}getTimestamp(){return this.timestamp}toString(){return this.text}}var In;(function(x){x[x.AZTEC=0]="AZTEC",x[x.CODABAR=1]="CODABAR",x[x.CODE_39=2]="CODE_39",x[x.CODE_93=3]="CODE_93",x[x.CODE_128=4]="CODE_128",x[x.DATA_MATRIX=5]="DATA_MATRIX",x[x.EAN_8=6]="EAN_8",x[x.EAN_13=7]="EAN_13",x[x.ITF=8]="ITF",x[x.MAXICODE=9]="MAXICODE",x[x.PDF_417=10]="PDF_417",x[x.QR_CODE=11]="QR_CODE",x[x.RSS_14=12]="RSS_14",x[x.RSS_EXPANDED=13]="RSS_EXPANDED",x[x.UPC_A=14]="UPC_A",x[x.UPC_E=15]="UPC_E",x[x.UPC_EAN_EXTENSION=16]="UPC_EAN_EXTENSION"})(In||(In={}));var Q=In,Tn;(function(x){x[x.OTHER=0]="OTHER",x[x.ORIENTATION=1]="ORIENTATION",x[x.BYTE_SEGMENTS=2]="BYTE_SEGMENTS",x[x.ERROR_CORRECTION_LEVEL=3]="ERROR_CORRECTION_LEVEL",x[x.ISSUE_NUMBER=4]="ISSUE_NUMBER",x[x.SUGGESTED_PRICE=5]="SUGGESTED_PRICE",x[x.POSSIBLE_COUNTRY=6]="POSSIBLE_COUNTRY",x[x.UPC_EAN_EXTENSION=7]="UPC_EAN_EXTENSION",x[x.PDF417_EXTRA_METADATA=8]="PDF417_EXTRA_METADATA",x[x.STRUCTURED_APPEND_SEQUENCE=9]="STRUCTURED_APPEND_SEQUENCE",x[x.STRUCTURED_APPEND_PARITY=10]="STRUCTURED_APPEND_PARITY"})(Tn||(Tn={}));var Ye=Tn;class mr{constructor(e,t,i,r,s=-1,l=-1){this.rawBytes=e,this.text=t,this.byteSegments=i,this.ecLevel=r,this.structuredAppendSequenceNumber=s,this.structuredAppendParity=l,this.numBits=e==null?0:8*e.length}getRawBytes(){return this.rawBytes}getNumBits(){return this.numBits}setNumBits(e){this.numBits=e}getText(){return this.text}getByteSegments(){return this.byteSegments}getECLevel(){return this.ecLevel}getErrorsCorrected(){return this.errorsCorrected}setErrorsCorrected(e){this.errorsCorrected=e}getErasures(){return this.erasures}setErasures(e){this.erasures=e}getOther(){return this.other}setOther(e){this.other=e}hasStructuredAppend(){return this.structuredAppendParity>=0&&this.structuredAppendSequenceNumber>=0}getStructuredAppendParity(){return this.structuredAppendParity}getStructuredAppendSequenceNumber(){return this.structuredAppendSequenceNumber}}class xr{exp(e){return this.expTable[e]}log(e){if(e===0)throw new I;return this.logTable[e]}static addOrSubtract(e,t){return e^t}}class pt{constructor(e,t){if(t.length===0)throw new I;this.field=e;const i=t.length;if(i>1&&t[0]===0){let r=1;for(;r<i&&t[r]===0;)r++;r===i?this.coefficients=Int32Array.from([0]):(this.coefficients=new Int32Array(i-r),te.arraycopy(t,r,this.coefficients,0,this.coefficients.length))}else this.coefficients=t}getCoefficients(){return this.coefficients}getDegree(){return this.coefficients.length-1}isZero(){return this.coefficients[0]===0}getCoefficient(e){return this.coefficients[this.coefficients.length-1-e]}evaluateAt(e){if(e===0)return this.getCoefficient(0);const t=this.coefficients;let i;if(e===1){i=0;for(let l=0,c=t.length;l!==c;l++){const h=t[l];i=xr.addOrSubtract(i,h)}return i}i=t[0];const r=t.length,s=this.field;for(let l=1;l<r;l++)i=xr.addOrSubtract(s.multiply(e,i),t[l]);return i}addOrSubtract(e){if(!this.field.equals(e.field))throw new I("GenericGFPolys do not have same GenericGF field");if(this.isZero())return e;if(e.isZero())return this;let t=this.coefficients,i=e.coefficients;if(t.length>i.length){const l=t;t=i,i=l}let r=new Int32Array(i.length);const s=i.length-t.length;te.arraycopy(i,0,r,0,s);for(let l=s;l<i.length;l++)r[l]=xr.addOrSubtract(t[l-s],i[l]);return new pt(this.field,r)}multiply(e){if(!this.field.equals(e.field))throw new I("GenericGFPolys do not have same GenericGF field");if(this.isZero()||e.isZero())return this.field.getZero();const t=this.coefficients,i=t.length,r=e.coefficients,s=r.length,l=new Int32Array(i+s-1),c=this.field;for(let h=0;h<i;h++){const f=t[h];for(let p=0;p<s;p++)l[h+p]=xr.addOrSubtract(l[h+p],c.multiply(f,r[p]))}return new pt(c,l)}multiplyScalar(e){if(e===0)return this.field.getZero();if(e===1)return this;const t=this.coefficients.length,i=this.field,r=new Int32Array(t),s=this.coefficients;for(let l=0;l<t;l++)r[l]=i.multiply(s[l],e);return new pt(i,r)}multiplyByMonomial(e,t){if(e<0)throw new I;if(t===0)return this.field.getZero();const i=this.coefficients,r=i.length,s=new Int32Array(r+e),l=this.field;for(let c=0;c<r;c++)s[c]=l.multiply(i[c],t);return new pt(l,s)}divide(e){if(!this.field.equals(e.field))throw new I("GenericGFPolys do not have same GenericGF field");if(e.isZero())throw new I("Divide by 0");const t=this.field;let i=t.getZero(),r=this;const s=e.getCoefficient(e.getDegree()),l=t.inverse(s);for(;r.getDegree()>=e.getDegree()&&!r.isZero();){const c=r.getDegree()-e.getDegree(),h=t.multiply(r.getCoefficient(r.getDegree()),l),f=e.multiplyByMonomial(c,h),p=t.buildMonomial(c,h);i=i.addOrSubtract(p),r=r.addOrSubtract(f)}return[i,r]}toString(){let e="";for(let t=this.getDegree();t>=0;t--){let i=this.getCoefficient(t);if(i!==0){if(i<0?(e+=" - ",i=-i):e.length>0&&(e+=" + "),t===0||i!==1){const r=this.field.log(i);r===0?e+="1":r===1?e+="a":(e+="a^",e+=r)}t!==0&&(t===1?e+="x":(e+="x^",e+=t))}}return e}}class Xr extends _{}Xr.kind="ArithmeticException";class we extends xr{constructor(e,t,i){super(),this.primitive=e,this.size=t,this.generatorBase=i;const r=new Int32Array(t);let s=1;for(let c=0;c<t;c++)r[c]=s,s*=2,s>=t&&(s^=e,s&=t-1);this.expTable=r;const l=new Int32Array(t);for(let c=0;c<t-1;c++)l[r[c]]=c;this.logTable=l,this.zero=new pt(this,Int32Array.from([0])),this.one=new pt(this,Int32Array.from([1]))}getZero(){return this.zero}getOne(){return this.one}buildMonomial(e,t){if(e<0)throw new I;if(t===0)return this.zero;const i=new Int32Array(e+1);return i[0]=t,new pt(this,i)}inverse(e){if(e===0)throw new Xr;return this.expTable[this.size-this.logTable[e]-1]}multiply(e,t){return e===0||t===0?0:this.expTable[(this.logTable[e]+this.logTable[t])%(this.size-1)]}getSize(){return this.size}getGeneratorBase(){return this.generatorBase}toString(){return"GF(0x"+K.toHexString(this.primitive)+","+this.size+")"}equals(e){return e===this}}we.AZTEC_DATA_12=new we(4201,4096,1),we.AZTEC_DATA_10=new we(1033,1024,1),we.AZTEC_DATA_6=new we(67,64,1),we.AZTEC_PARAM=new we(19,16,1),we.QR_CODE_FIELD_256=new we(285,256,0),we.DATA_MATRIX_FIELD_256=new we(301,256,1),we.AZTEC_DATA_8=we.DATA_MATRIX_FIELD_256,we.MAXICODE_FIELD_64=we.AZTEC_DATA_6;class Gi extends _{}Gi.kind="ReedSolomonException";class Ft extends _{}Ft.kind="IllegalStateException";class br{constructor(e){this.field=e}decode(e,t){const i=this.field,r=new pt(i,e),s=new Int32Array(t);let l=!0;for(let y=0;y<t;y++){const E=r.evaluateAt(i.exp(y+i.getGeneratorBase()));s[s.length-1-y]=E,E!==0&&(l=!1)}if(l)return;const c=new pt(i,s),h=this.runEuclideanAlgorithm(i.buildMonomial(t,1),c,t),f=h[0],p=h[1],b=this.findErrorLocations(f),w=this.findErrorMagnitudes(p,b);for(let y=0;y<b.length;y++){const E=e.length-1-i.log(b[y]);if(E<0)throw new Gi("Bad error location");e[E]=we.addOrSubtract(e[E],w[y])}}runEuclideanAlgorithm(e,t,i){if(e.getDegree()<t.getDegree()){const y=e;e=t,t=y}const r=this.field;let s=e,l=t,c=r.getZero(),h=r.getOne();for(;l.getDegree()>=(i/2|0);){let y=s,E=c;if(s=l,c=h,s.isZero())throw new Gi("r_{i-1} was zero");l=y;let S=r.getZero();const T=s.getCoefficient(s.getDegree()),R=r.inverse(T);for(;l.getDegree()>=s.getDegree()&&!l.isZero();){const U=l.getDegree()-s.getDegree(),$=r.multiply(l.getCoefficient(l.getDegree()),R);S=S.addOrSubtract(r.buildMonomial(U,$)),l=l.addOrSubtract(s.multiplyByMonomial(U,$))}if(h=S.multiply(c).addOrSubtract(E),l.getDegree()>=s.getDegree())throw new Ft("Division algorithm failed to reduce polynomial?")}const f=h.getCoefficient(0);if(f===0)throw new Gi("sigmaTilde(0) was zero");const p=r.inverse(f),b=h.multiplyScalar(p),w=l.multiplyScalar(p);return[b,w]}findErrorLocations(e){const t=e.getDegree();if(t===1)return Int32Array.from([e.getCoefficient(1)]);const i=new Int32Array(t);let r=0;const s=this.field;for(let l=1;l<s.getSize()&&r<t;l++)e.evaluateAt(l)===0&&(i[r]=s.inverse(l),r++);if(r!==t)throw new Gi("Error locator degree does not match number of roots");return i}findErrorMagnitudes(e,t){const i=t.length,r=new Int32Array(i),s=this.field;for(let l=0;l<i;l++){const c=s.inverse(t[l]);let h=1;for(let f=0;f<i;f++)if(l!==f){const p=s.multiply(t[f],c),b=p&1?p&-2:p|1;h=s.multiply(h,b)}r[l]=s.multiply(e.evaluateAt(c),s.inverse(h)),s.getGeneratorBase()!==0&&(r[l]=s.multiply(r[l],c))}return r}}var tt;(function(x){x[x.UPPER=0]="UPPER",x[x.LOWER=1]="LOWER",x[x.MIXED=2]="MIXED",x[x.DIGIT=3]="DIGIT",x[x.PUNCT=4]="PUNCT",x[x.BINARY=5]="BINARY"})(tt||(tt={}));class Ne{decode(e){this.ddata=e;let t=e.getBits(),i=this.extractBits(t),r=this.correctBits(i),s=Ne.convertBoolArrayToByteArray(r),l=Ne.getEncodedData(r),c=new mr(s,l,null,null);return c.setNumBits(r.length),c}static highLevelDecode(e){return this.getEncodedData(e)}static getEncodedData(e){let t=e.length,i=tt.UPPER,r=tt.UPPER,s="",l=0;for(;l<t;)if(r===tt.BINARY){if(t-l<5)break;let c=Ne.readCode(e,l,5);if(l+=5,c===0){if(t-l<11)break;c=Ne.readCode(e,l,11)+31,l+=11}for(let h=0;h<c;h++){if(t-l<8){l=t;break}const f=Ne.readCode(e,l,8);s+=Y.castAsNonUtf8Char(f),l+=8}r=i}else{let c=r===tt.DIGIT?4:5;if(t-l<c)break;let h=Ne.readCode(e,l,c);l+=c;let f=Ne.getCharacter(r,h);f.startsWith("CTRL_")?(i=r,r=Ne.getTable(f.charAt(5)),f.charAt(6)==="L"&&(i=r)):(s+=f,r=i)}return s}static getTable(e){switch(e){case"L":return tt.LOWER;case"P":return tt.PUNCT;case"M":return tt.MIXED;case"D":return tt.DIGIT;case"B":return tt.BINARY;case"U":default:return tt.UPPER}}static getCharacter(e,t){switch(e){case tt.UPPER:return Ne.UPPER_TABLE[t];case tt.LOWER:return Ne.LOWER_TABLE[t];case tt.MIXED:return Ne.MIXED_TABLE[t];case tt.PUNCT:return Ne.PUNCT_TABLE[t];case tt.DIGIT:return Ne.DIGIT_TABLE[t];default:throw new Ft("Bad table")}}correctBits(e){let t,i;this.ddata.getNbLayers()<=2?(i=6,t=we.AZTEC_DATA_6):this.ddata.getNbLayers()<=8?(i=8,t=we.AZTEC_DATA_8):this.ddata.getNbLayers()<=22?(i=10,t=we.AZTEC_DATA_10):(i=12,t=we.AZTEC_DATA_12);let r=this.ddata.getNbDatablocks(),s=e.length/i;if(s<r)throw new z;let l=e.length%i,c=new Int32Array(s);for(let w=0;w<s;w++,l+=i)c[w]=Ne.readCode(e,l,i);try{new br(t).decode(c,s-r)}catch(w){throw new z(w)}let h=(1<<i)-1,f=0;for(let w=0;w<r;w++){let y=c[w];if(y===0||y===h)throw new z;(y===1||y===h-1)&&f++}let p=new Array(r*i-f),b=0;for(let w=0;w<r;w++){let y=c[w];if(y===1||y===h-1)p.fill(y>1,b,b+i-1),b+=i-1;else for(let E=i-1;E>=0;--E)p[b++]=(y&1<<E)!==0}return p}extractBits(e){let t=this.ddata.isCompact(),i=this.ddata.getNbLayers(),r=(t?11:14)+i*4,s=new Int32Array(r),l=new Array(this.totalBitsInLayer(i,t));if(t)for(let c=0;c<s.length;c++)s[c]=c;else{let c=r+1+2*K.truncDivision(K.truncDivision(r,2)-1,15),h=r/2,f=K.truncDivision(c,2);for(let p=0;p<h;p++){let b=p+K.truncDivision(p,15);s[h-p-1]=f-b-1,s[h+p]=f+b+1}}for(let c=0,h=0;c<i;c++){let f=(i-c)*4+(t?9:12),p=c*2,b=r-1-p;for(let w=0;w<f;w++){let y=w*2;for(let E=0;E<2;E++)l[h+y+E]=e.get(s[p+E],s[p+w]),l[h+2*f+y+E]=e.get(s[p+w],s[b-E]),l[h+4*f+y+E]=e.get(s[b-E],s[b-w]),l[h+6*f+y+E]=e.get(s[b-w],s[p+E])}h+=f*8}return l}static readCode(e,t,i){let r=0;for(let s=t;s<t+i;s++)r<<=1,e[s]&&(r|=1);return r}static readByte(e,t){let i=e.length-t;return i>=8?Ne.readCode(e,t,8):Ne.readCode(e,t,i)<<8-i}static convertBoolArrayToByteArray(e){let t=new Uint8Array((e.length+7)/8);for(let i=0;i<t.length;i++)t[i]=Ne.readByte(e,8*i);return t}totalBitsInLayer(e,t){return((t?88:112)+16*e)*e}}Ne.UPPER_TABLE=["CTRL_PS"," ","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","CTRL_LL","CTRL_ML","CTRL_DL","CTRL_BS"],Ne.LOWER_TABLE=["CTRL_PS"," ","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","CTRL_US","CTRL_ML","CTRL_DL","CTRL_BS"],Ne.MIXED_TABLE=["CTRL_PS"," ","\\1","\\2","\\3","\\4","\\5","\\6","\\7","\b","	",`
`,"\\13","\f","\r","\\33","\\34","\\35","\\36","\\37","@","\\","^","_","`","|","~","\\177","CTRL_LL","CTRL_UL","CTRL_PL","CTRL_BS"],Ne.PUNCT_TABLE=["","\r",`\r
`,". ",", ",": ","!",'"',"#","$","%","&","'","(",")","*","+",",","-",".","/",":",";","<","=",">","?","[","]","{","}","CTRL_UL"],Ne.DIGIT_TABLE=["CTRL_PS"," ","0","1","2","3","4","5","6","7","8","9",",",".","CTRL_UL","CTRL_US"];class me{constructor(){}static round(e){return e===NaN?0:e<=Number.MIN_SAFE_INTEGER?Number.MIN_SAFE_INTEGER:e>=Number.MAX_SAFE_INTEGER?Number.MAX_SAFE_INTEGER:e+(e<0?-.5:.5)|0}static distance(e,t,i,r){const s=e-i,l=t-r;return Math.sqrt(s*s+l*l)}static sum(e){let t=0;for(let i=0,r=e.length;i!==r;i++){const s=e[i];t+=s}return t}}class jr{static floatToIntBits(e){return e}}jr.MAX_VALUE=Number.MAX_SAFE_INTEGER;class j{constructor(e,t){this.x=e,this.y=t}getX(){return this.x}getY(){return this.y}equals(e){if(e instanceof j){const t=e;return this.x===t.x&&this.y===t.y}return!1}hashCode(){return 31*jr.floatToIntBits(this.x)+jr.floatToIntBits(this.y)}toString(){return"("+this.x+","+this.y+")"}static orderBestPatterns(e){const t=this.distance(e[0],e[1]),i=this.distance(e[1],e[2]),r=this.distance(e[0],e[2]);let s,l,c;if(i>=t&&i>=r?(l=e[0],s=e[1],c=e[2]):r>=i&&r>=t?(l=e[1],s=e[0],c=e[2]):(l=e[2],s=e[0],c=e[1]),this.crossProductZ(s,l,c)<0){const h=s;s=c,c=h}e[0]=s,e[1]=l,e[2]=c}static distance(e,t){return me.distance(e.x,e.y,t.x,t.y)}static crossProductZ(e,t,i){const r=t.x,s=t.y;return(i.x-r)*(e.y-s)-(i.y-s)*(e.x-r)}}class Kr{constructor(e,t){this.bits=e,this.points=t}getBits(){return this.bits}getPoints(){return this.points}}class Ws extends Kr{constructor(e,t,i,r,s){super(e,t),this.compact=i,this.nbDatablocks=r,this.nbLayers=s}getNbLayers(){return this.nbLayers}getNbDatablocks(){return this.nbDatablocks}isCompact(){return this.compact}}class jt{constructor(e,t,i,r){this.image=e,this.height=e.getHeight(),this.width=e.getWidth(),t==null&&(t=jt.INIT_SIZE),i==null&&(i=e.getWidth()/2|0),r==null&&(r=e.getHeight()/2|0);const s=t/2|0;if(this.leftInit=i-s,this.rightInit=i+s,this.upInit=r-s,this.downInit=r+s,this.upInit<0||this.leftInit<0||this.downInit>=this.height||this.rightInit>=this.width)throw new D}detect(){let e=this.leftInit,t=this.rightInit,i=this.upInit,r=this.downInit,s=!1,l=!0,c=!1,h=!1,f=!1,p=!1,b=!1;const w=this.width,y=this.height;for(;l;){l=!1;let E=!0;for(;(E||!h)&&t<w;)E=this.containsBlackPoint(i,r,t,!1),E?(t++,l=!0,h=!0):h||t++;if(t>=w){s=!0;break}let S=!0;for(;(S||!f)&&r<y;)S=this.containsBlackPoint(e,t,r,!0),S?(r++,l=!0,f=!0):f||r++;if(r>=y){s=!0;break}let T=!0;for(;(T||!p)&&e>=0;)T=this.containsBlackPoint(i,r,e,!1),T?(e--,l=!0,p=!0):p||e--;if(e<0){s=!0;break}let R=!0;for(;(R||!b)&&i>=0;)R=this.containsBlackPoint(e,t,i,!0),R?(i--,l=!0,b=!0):b||i--;if(i<0){s=!0;break}l&&(c=!0)}if(!s&&c){const E=t-e;let S=null;for(let $=1;S===null&&$<E;$++)S=this.getBlackPointOnSegment(e,r-$,e+$,r);if(S==null)throw new D;let T=null;for(let $=1;T===null&&$<E;$++)T=this.getBlackPointOnSegment(e,i+$,e+$,i);if(T==null)throw new D;let R=null;for(let $=1;R===null&&$<E;$++)R=this.getBlackPointOnSegment(t,i+$,t-$,i);if(R==null)throw new D;let U=null;for(let $=1;U===null&&$<E;$++)U=this.getBlackPointOnSegment(t,r-$,t-$,r);if(U==null)throw new D;return this.centerEdges(U,S,R,T)}else throw new D}getBlackPointOnSegment(e,t,i,r){const s=me.round(me.distance(e,t,i,r)),l=(i-e)/s,c=(r-t)/s,h=this.image;for(let f=0;f<s;f++){const p=me.round(e+f*l),b=me.round(t+f*c);if(h.get(p,b))return new j(p,b)}return null}centerEdges(e,t,i,r){const s=e.getX(),l=e.getY(),c=t.getX(),h=t.getY(),f=i.getX(),p=i.getY(),b=r.getX(),w=r.getY(),y=jt.CORR;return s<this.width/2?[new j(b-y,w+y),new j(c+y,h+y),new j(f-y,p-y),new j(s+y,l-y)]:[new j(b+y,w+y),new j(c+y,h-y),new j(f-y,p+y),new j(s-y,l-y)]}containsBlackPoint(e,t,i,r){const s=this.image;if(r){for(let l=e;l<=t;l++)if(s.get(l,i))return!0}else for(let l=e;l<=t;l++)if(s.get(i,l))return!0;return!1}}jt.INIT_SIZE=10,jt.CORR=1;class Nn{static checkAndNudgePoints(e,t){const i=e.getWidth(),r=e.getHeight();let s=!0;for(let l=0;l<t.length&&s;l+=2){const c=Math.floor(t[l]),h=Math.floor(t[l+1]);if(c<-1||c>i||h<-1||h>r)throw new D;s=!1,c===-1?(t[l]=0,s=!0):c===i&&(t[l]=i-1,s=!0),h===-1?(t[l+1]=0,s=!0):h===r&&(t[l+1]=r-1,s=!0)}s=!0;for(let l=t.length-2;l>=0&&s;l-=2){const c=Math.floor(t[l]),h=Math.floor(t[l+1]);if(c<-1||c>i||h<-1||h>r)throw new D;s=!1,c===-1?(t[l]=0,s=!0):c===i&&(t[l]=i-1,s=!0),h===-1?(t[l+1]=0,s=!0):h===r&&(t[l+1]=r-1,s=!0)}}}class kt{constructor(e,t,i,r,s,l,c,h,f){this.a11=e,this.a21=t,this.a31=i,this.a12=r,this.a22=s,this.a32=l,this.a13=c,this.a23=h,this.a33=f}static quadrilateralToQuadrilateral(e,t,i,r,s,l,c,h,f,p,b,w,y,E,S,T){const R=kt.quadrilateralToSquare(e,t,i,r,s,l,c,h);return kt.squareToQuadrilateral(f,p,b,w,y,E,S,T).times(R)}transformPoints(e){const t=e.length,i=this.a11,r=this.a12,s=this.a13,l=this.a21,c=this.a22,h=this.a23,f=this.a31,p=this.a32,b=this.a33;for(let w=0;w<t;w+=2){const y=e[w],E=e[w+1],S=s*y+h*E+b;e[w]=(i*y+l*E+f)/S,e[w+1]=(r*y+c*E+p)/S}}transformPointsWithValues(e,t){const i=this.a11,r=this.a12,s=this.a13,l=this.a21,c=this.a22,h=this.a23,f=this.a31,p=this.a32,b=this.a33,w=e.length;for(let y=0;y<w;y++){const E=e[y],S=t[y],T=s*E+h*S+b;e[y]=(i*E+l*S+f)/T,t[y]=(r*E+c*S+p)/T}}static squareToQuadrilateral(e,t,i,r,s,l,c,h){const f=e-i+s-c,p=t-r+l-h;if(f===0&&p===0)return new kt(i-e,s-i,e,r-t,l-r,t,0,0,1);{const b=i-s,w=c-s,y=r-l,E=h-l,S=b*E-w*y,T=(f*E-w*p)/S,R=(b*p-f*y)/S;return new kt(i-e+T*i,c-e+R*c,e,r-t+T*r,h-t+R*h,t,T,R,1)}}static quadrilateralToSquare(e,t,i,r,s,l,c,h){return kt.squareToQuadrilateral(e,t,i,r,s,l,c,h).buildAdjoint()}buildAdjoint(){return new kt(this.a22*this.a33-this.a23*this.a32,this.a23*this.a31-this.a21*this.a33,this.a21*this.a32-this.a22*this.a31,this.a13*this.a32-this.a12*this.a33,this.a11*this.a33-this.a13*this.a31,this.a12*this.a31-this.a11*this.a32,this.a12*this.a23-this.a13*this.a22,this.a13*this.a21-this.a11*this.a23,this.a11*this.a22-this.a12*this.a21)}times(e){return new kt(this.a11*e.a11+this.a21*e.a12+this.a31*e.a13,this.a11*e.a21+this.a21*e.a22+this.a31*e.a23,this.a11*e.a31+this.a21*e.a32+this.a31*e.a33,this.a12*e.a11+this.a22*e.a12+this.a32*e.a13,this.a12*e.a21+this.a22*e.a22+this.a32*e.a23,this.a12*e.a31+this.a22*e.a32+this.a32*e.a33,this.a13*e.a11+this.a23*e.a12+this.a33*e.a13,this.a13*e.a21+this.a23*e.a22+this.a33*e.a23,this.a13*e.a31+this.a23*e.a32+this.a33*e.a33)}}class Xs extends Nn{sampleGrid(e,t,i,r,s,l,c,h,f,p,b,w,y,E,S,T,R,U,$){const L=kt.quadrilateralToQuadrilateral(r,s,l,c,h,f,p,b,w,y,E,S,T,R,U,$);return this.sampleGridWithTransform(e,t,i,L)}sampleGridWithTransform(e,t,i,r){if(t<=0||i<=0)throw new D;const s=new Me(t,i),l=new Float32Array(2*t);for(let c=0;c<i;c++){const h=l.length,f=c+.5;for(let p=0;p<h;p+=2)l[p]=p/2+.5,l[p+1]=f;r.transformPoints(l),Nn.checkAndNudgePoints(e,l);try{for(let p=0;p<h;p+=2)e.get(Math.floor(l[p]),Math.floor(l[p+1]))&&s.set(p/2,c)}catch{throw new D}}return s}}class ai{static setGridSampler(e){ai.gridSampler=e}static getInstance(){return ai.gridSampler}}ai.gridSampler=new Xs;class ht{constructor(e,t){this.x=e,this.y=t}toResultPoint(){return new j(this.getX(),this.getY())}getX(){return this.x}getY(){return this.y}}class js{constructor(e){this.EXPECTED_CORNER_BITS=new Int32Array([3808,476,2107,1799]),this.image=e}detect(){return this.detectMirror(!1)}detectMirror(e){let t=this.getMatrixCenter(),i=this.getBullsEyeCorners(t);if(e){let l=i[0];i[0]=i[2],i[2]=l}this.extractParameters(i);let r=this.sampleGrid(this.image,i[this.shift%4],i[(this.shift+1)%4],i[(this.shift+2)%4],i[(this.shift+3)%4]),s=this.getMatrixCornerPoints(i);return new Ws(r,s,this.compact,this.nbDataBlocks,this.nbLayers)}extractParameters(e){if(!this.isValidPoint(e[0])||!this.isValidPoint(e[1])||!this.isValidPoint(e[2])||!this.isValidPoint(e[3]))throw new D;let t=2*this.nbCenterLayers,i=new Int32Array([this.sampleLine(e[0],e[1],t),this.sampleLine(e[1],e[2],t),this.sampleLine(e[2],e[3],t),this.sampleLine(e[3],e[0],t)]);this.shift=this.getRotation(i,t);let r=0;for(let l=0;l<4;l++){let c=i[(this.shift+l)%4];this.compact?(r<<=7,r+=c>>1&127):(r<<=10,r+=(c>>2&992)+(c>>1&31))}let s=this.getCorrectedParameterData(r,this.compact);this.compact?(this.nbLayers=(s>>6)+1,this.nbDataBlocks=(s&63)+1):(this.nbLayers=(s>>11)+1,this.nbDataBlocks=(s&2047)+1)}getRotation(e,t){let i=0;e.forEach((r,s,l)=>{let c=(r>>t-2<<1)+(r&1);i=(i<<3)+c}),i=((i&1)<<11)+(i>>1);for(let r=0;r<4;r++)if(K.bitCount(i^this.EXPECTED_CORNER_BITS[r])<=2)return r;throw new D}getCorrectedParameterData(e,t){let i,r;t?(i=7,r=2):(i=10,r=4);let s=i-r,l=new Int32Array(i);for(let h=i-1;h>=0;--h)l[h]=e&15,e>>=4;try{new br(we.AZTEC_PARAM).decode(l,s)}catch{throw new D}let c=0;for(let h=0;h<r;h++)c=(c<<4)+l[h];return c}getBullsEyeCorners(e){let t=e,i=e,r=e,s=e,l=!0;for(this.nbCenterLayers=1;this.nbCenterLayers<9;this.nbCenterLayers++){let b=this.getFirstDifferent(t,l,1,-1),w=this.getFirstDifferent(i,l,1,1),y=this.getFirstDifferent(r,l,-1,1),E=this.getFirstDifferent(s,l,-1,-1);if(this.nbCenterLayers>2){let S=this.distancePoint(E,b)*this.nbCenterLayers/(this.distancePoint(s,t)*(this.nbCenterLayers+2));if(S<.75||S>1.25||!this.isWhiteOrBlackRectangle(b,w,y,E))break}t=b,i=w,r=y,s=E,l=!l}if(this.nbCenterLayers!==5&&this.nbCenterLayers!==7)throw new D;this.compact=this.nbCenterLayers===5;let c=new j(t.getX()+.5,t.getY()-.5),h=new j(i.getX()+.5,i.getY()+.5),f=new j(r.getX()-.5,r.getY()+.5),p=new j(s.getX()-.5,s.getY()-.5);return this.expandSquare([c,h,f,p],2*this.nbCenterLayers-3,2*this.nbCenterLayers)}getMatrixCenter(){let e,t,i,r;try{let c=new jt(this.image).detect();e=c[0],t=c[1],i=c[2],r=c[3]}catch{let h=this.image.getWidth()/2,f=this.image.getHeight()/2;e=this.getFirstDifferent(new ht(h+7,f-7),!1,1,-1).toResultPoint(),t=this.getFirstDifferent(new ht(h+7,f+7),!1,1,1).toResultPoint(),i=this.getFirstDifferent(new ht(h-7,f+7),!1,-1,1).toResultPoint(),r=this.getFirstDifferent(new ht(h-7,f-7),!1,-1,-1).toResultPoint()}let s=me.round((e.getX()+r.getX()+t.getX()+i.getX())/4),l=me.round((e.getY()+r.getY()+t.getY()+i.getY())/4);try{let c=new jt(this.image,15,s,l).detect();e=c[0],t=c[1],i=c[2],r=c[3]}catch{e=this.getFirstDifferent(new ht(s+7,l-7),!1,1,-1).toResultPoint(),t=this.getFirstDifferent(new ht(s+7,l+7),!1,1,1).toResultPoint(),i=this.getFirstDifferent(new ht(s-7,l+7),!1,-1,1).toResultPoint(),r=this.getFirstDifferent(new ht(s-7,l-7),!1,-1,-1).toResultPoint()}return s=me.round((e.getX()+r.getX()+t.getX()+i.getX())/4),l=me.round((e.getY()+r.getY()+t.getY()+i.getY())/4),new ht(s,l)}getMatrixCornerPoints(e){return this.expandSquare(e,2*this.nbCenterLayers,this.getDimension())}sampleGrid(e,t,i,r,s){let l=ai.getInstance(),c=this.getDimension(),h=c/2-this.nbCenterLayers,f=c/2+this.nbCenterLayers;return l.sampleGrid(e,c,c,h,h,f,h,f,f,h,f,t.getX(),t.getY(),i.getX(),i.getY(),r.getX(),r.getY(),s.getX(),s.getY())}sampleLine(e,t,i){let r=0,s=this.distanceResultPoint(e,t),l=s/i,c=e.getX(),h=e.getY(),f=l*(t.getX()-e.getX())/s,p=l*(t.getY()-e.getY())/s;for(let b=0;b<i;b++)this.image.get(me.round(c+b*f),me.round(h+b*p))&&(r|=1<<i-b-1);return r}isWhiteOrBlackRectangle(e,t,i,r){let s=3;e=new ht(e.getX()-s,e.getY()+s),t=new ht(t.getX()-s,t.getY()-s),i=new ht(i.getX()+s,i.getY()-s),r=new ht(r.getX()+s,r.getY()+s);let l=this.getColor(r,e);if(l===0)return!1;let c=this.getColor(e,t);return c!==l||(c=this.getColor(t,i),c!==l)?!1:(c=this.getColor(i,r),c===l)}getColor(e,t){let i=this.distancePoint(e,t),r=(t.getX()-e.getX())/i,s=(t.getY()-e.getY())/i,l=0,c=e.getX(),h=e.getY(),f=this.image.get(e.getX(),e.getY()),p=Math.ceil(i);for(let w=0;w<p;w++)c+=r,h+=s,this.image.get(me.round(c),me.round(h))!==f&&l++;let b=l/i;return b>.1&&b<.9?0:b<=.1===f?1:-1}getFirstDifferent(e,t,i,r){let s=e.getX()+i,l=e.getY()+r;for(;this.isValid(s,l)&&this.image.get(s,l)===t;)s+=i,l+=r;for(s-=i,l-=r;this.isValid(s,l)&&this.image.get(s,l)===t;)s+=i;for(s-=i;this.isValid(s,l)&&this.image.get(s,l)===t;)l+=r;return l-=r,new ht(s,l)}expandSquare(e,t,i){let r=i/(2*t),s=e[0].getX()-e[2].getX(),l=e[0].getY()-e[2].getY(),c=(e[0].getX()+e[2].getX())/2,h=(e[0].getY()+e[2].getY())/2,f=new j(c+r*s,h+r*l),p=new j(c-r*s,h-r*l);s=e[1].getX()-e[3].getX(),l=e[1].getY()-e[3].getY(),c=(e[1].getX()+e[3].getX())/2,h=(e[1].getY()+e[3].getY())/2;let b=new j(c+r*s,h+r*l),w=new j(c-r*s,h-r*l);return[f,b,p,w]}isValid(e,t){return e>=0&&e<this.image.getWidth()&&t>0&&t<this.image.getHeight()}isValidPoint(e){let t=me.round(e.getX()),i=me.round(e.getY());return this.isValid(t,i)}distancePoint(e,t){return me.distance(e.getX(),e.getY(),t.getX(),t.getY())}distanceResultPoint(e,t){return me.distance(e.getX(),e.getY(),t.getX(),t.getY())}getDimension(){return this.compact?4*this.nbLayers+11:this.nbLayers<=4?4*this.nbLayers+15:4*this.nbLayers+2*(K.truncDivision(this.nbLayers-4,8)+1)+15}}class Zr{decode(e,t=null){let i=null,r=new js(e.getBlackMatrix()),s=null,l=null;try{let p=r.detectMirror(!1);s=p.getPoints(),this.reportFoundResultPoints(t,s),l=new Ne().decode(p)}catch(p){i=p}if(l==null)try{let p=r.detectMirror(!0);s=p.getPoints(),this.reportFoundResultPoints(t,s),l=new Ne().decode(p)}catch(p){throw i??p}let c=new dt(l.getText(),l.getRawBytes(),l.getNumBits(),s,Q.AZTEC,te.currentTimeMillis()),h=l.getByteSegments();h!=null&&c.putMetadata(Ye.BYTE_SEGMENTS,h);let f=l.getECLevel();return f!=null&&c.putMetadata(Ye.ERROR_CORRECTION_LEVEL,f),c}reportFoundResultPoints(e,t){if(e!=null){let i=e.get(be.NEED_RESULT_POINT_CALLBACK);i!=null&&t.forEach((r,s,l)=>{i.foundPossibleResultPoint(r)})}}reset(){}}class Ko extends Ci{constructor(e=500){super(new Zr,e)}}class We{decode(e,t){try{return this.doDecode(e,t)}catch{if(t&&t.get(be.TRY_HARDER)===!0&&e.isRotateSupported()){const s=e.rotateCounterClockwise(),l=this.doDecode(s,t),c=l.getResultMetadata();let h=270;c!==null&&c.get(Ye.ORIENTATION)===!0&&(h=h+c.get(Ye.ORIENTATION)%360),l.putMetadata(Ye.ORIENTATION,h);const f=l.getResultPoints();if(f!==null){const p=s.getHeight();for(let b=0;b<f.length;b++)f[b]=new j(p-f[b].getY()-1,f[b].getX())}return l}else throw new D}}reset(){}doDecode(e,t){const i=e.getWidth(),r=e.getHeight();let s=new de(i);const l=t&&t.get(be.TRY_HARDER)===!0,c=Math.max(1,r>>(l?8:5));let h;l?h=r:h=15;const f=Math.trunc(r/2);for(let p=0;p<h;p++){const b=Math.trunc((p+1)/2),w=(p&1)===0,y=f+c*(w?b:-b);if(y<0||y>=r)break;try{s=e.getBlackRow(y,s)}catch{continue}for(let E=0;E<2;E++){if(E===1&&(s.reverse(),t&&t.get(be.NEED_RESULT_POINT_CALLBACK)===!0)){const S=new Map;t.forEach((T,R)=>S.set(R,T)),S.delete(be.NEED_RESULT_POINT_CALLBACK),t=S}try{const S=this.decodeRow(y,s,t);if(E===1){S.putMetadata(Ye.ORIENTATION,180);const T=S.getResultPoints();T!==null&&(T[0]=new j(i-T[0].getX()-1,T[0].getY()),T[1]=new j(i-T[1].getX()-1,T[1].getY()))}return S}catch{}}}throw new D}static recordPattern(e,t,i){const r=i.length;for(let f=0;f<r;f++)i[f]=0;const s=e.getSize();if(t>=s)throw new D;let l=!e.get(t),c=0,h=t;for(;h<s;){if(e.get(h)!==l)i[c]++;else{if(++c===r)break;i[c]=1,l=!l}h++}if(!(c===r||c===r-1&&h===s))throw new D}static recordPatternInReverse(e,t,i){let r=i.length,s=e.get(t);for(;t>0&&r>=0;)e.get(--t)!==s&&(r--,s=!s);if(r>=0)throw new D;We.recordPattern(e,t+1,i)}static patternMatchVariance(e,t,i){const r=e.length;let s=0,l=0;for(let f=0;f<r;f++)s+=e[f],l+=t[f];if(s<l)return Number.POSITIVE_INFINITY;const c=s/l;i*=c;let h=0;for(let f=0;f<r;f++){const p=e[f],b=t[f]*c,w=p>b?p-b:b-p;if(w>i)return Number.POSITIVE_INFINITY;h+=w}return h/s}}class V extends We{static findStartPattern(e){const t=e.getSize(),i=e.getNextSet(0);let r=0,s=Int32Array.from([0,0,0,0,0,0]),l=i,c=!1;const h=6;for(let f=i;f<t;f++)if(e.get(f)!==c)s[r]++;else{if(r===h-1){let p=V.MAX_AVG_VARIANCE,b=-1;for(let w=V.CODE_START_A;w<=V.CODE_START_C;w++){const y=We.patternMatchVariance(s,V.CODE_PATTERNS[w],V.MAX_INDIVIDUAL_VARIANCE);y<p&&(p=y,b=w)}if(b>=0&&e.isRange(Math.max(0,l-(f-l)/2),l,!1))return Int32Array.from([l,f,b]);l+=s[0]+s[1],s=s.slice(2,s.length-1),s[r-1]=0,s[r]=0,r--}else r++;s[r]=1,c=!c}throw new D}static decodeCode(e,t,i){We.recordPattern(e,i,t);let r=V.MAX_AVG_VARIANCE,s=-1;for(let l=0;l<V.CODE_PATTERNS.length;l++){const c=V.CODE_PATTERNS[l],h=this.patternMatchVariance(t,c,V.MAX_INDIVIDUAL_VARIANCE);h<r&&(r=h,s=l)}if(s>=0)return s;throw new D}decodeRow(e,t,i){const r=i&&i.get(be.ASSUME_GS1)===!0,s=V.findStartPattern(t),l=s[2];let c=0;const h=new Uint8Array(20);h[c++]=l;let f;switch(l){case V.CODE_START_A:f=V.CODE_CODE_A;break;case V.CODE_START_B:f=V.CODE_CODE_B;break;case V.CODE_START_C:f=V.CODE_CODE_C;break;default:throw new z}let p=!1,b=!1,w="",y=s[0],E=s[1];const S=Int32Array.from([0,0,0,0,0,0]);let T=0,R=0,U=l,$=0,L=!0,ue=!1,ne=!1;for(;!p;){const Ji=b;switch(b=!1,T=R,R=V.decodeCode(t,S,E),h[c++]=R,R!==V.CODE_STOP&&(L=!0),R!==V.CODE_STOP&&($++,U+=$*R),y=E,E+=S.reduce((Cl,Al)=>Cl+Al,0),R){case V.CODE_START_A:case V.CODE_START_B:case V.CODE_START_C:throw new z}switch(f){case V.CODE_CODE_A:if(R<64)ne===ue?w+=String.fromCharCode(32+R):w+=String.fromCharCode(32+R+128),ne=!1;else if(R<96)ne===ue?w+=String.fromCharCode(R-64):w+=String.fromCharCode(R+64),ne=!1;else switch(R!==V.CODE_STOP&&(L=!1),R){case V.CODE_FNC_1:r&&(w.length===0?w+="]C1":w+="");break;case V.CODE_FNC_2:case V.CODE_FNC_3:break;case V.CODE_FNC_4_A:!ue&&ne?(ue=!0,ne=!1):ue&&ne?(ue=!1,ne=!1):ne=!0;break;case V.CODE_SHIFT:b=!0,f=V.CODE_CODE_B;break;case V.CODE_CODE_B:f=V.CODE_CODE_B;break;case V.CODE_CODE_C:f=V.CODE_CODE_C;break;case V.CODE_STOP:p=!0;break}break;case V.CODE_CODE_B:if(R<96)ne===ue?w+=String.fromCharCode(32+R):w+=String.fromCharCode(32+R+128),ne=!1;else switch(R!==V.CODE_STOP&&(L=!1),R){case V.CODE_FNC_1:r&&(w.length===0?w+="]C1":w+="");break;case V.CODE_FNC_2:case V.CODE_FNC_3:break;case V.CODE_FNC_4_B:!ue&&ne?(ue=!0,ne=!1):ue&&ne?(ue=!1,ne=!1):ne=!0;break;case V.CODE_SHIFT:b=!0,f=V.CODE_CODE_A;break;case V.CODE_CODE_A:f=V.CODE_CODE_A;break;case V.CODE_CODE_C:f=V.CODE_CODE_C;break;case V.CODE_STOP:p=!0;break}break;case V.CODE_CODE_C:if(R<100)R<10&&(w+="0"),w+=R;else switch(R!==V.CODE_STOP&&(L=!1),R){case V.CODE_FNC_1:r&&(w.length===0?w+="]C1":w+="");break;case V.CODE_CODE_A:f=V.CODE_CODE_A;break;case V.CODE_CODE_B:f=V.CODE_CODE_B;break;case V.CODE_STOP:p=!0;break}break}Ji&&(f=f===V.CODE_CODE_A?V.CODE_CODE_B:V.CODE_CODE_A)}const wt=E-y;if(E=t.getNextUnset(E),!t.isRange(E,Math.min(t.getSize(),E+(E-y)/2),!1))throw new D;if(U-=$*T,U%103!==T)throw new X;const Ot=w.length;if(Ot===0)throw new D;Ot>0&&L&&(f===V.CODE_CODE_C?w=w.substring(0,Ot-2):w=w.substring(0,Ot-1));const _t=(s[1]+s[0])/2,Ie=y+wt/2,nt=h.length,yt=new Uint8Array(nt);for(let Ji=0;Ji<nt;Ji++)yt[Ji]=h[Ji];const Qi=[new j(_t,e),new j(Ie,e)];return new dt(w,yt,0,Qi,Q.CODE_128,new Date().getTime())}}V.CODE_PATTERNS=[Int32Array.from([2,1,2,2,2,2]),Int32Array.from([2,2,2,1,2,2]),Int32Array.from([2,2,2,2,2,1]),Int32Array.from([1,2,1,2,2,3]),Int32Array.from([1,2,1,3,2,2]),Int32Array.from([1,3,1,2,2,2]),Int32Array.from([1,2,2,2,1,3]),Int32Array.from([1,2,2,3,1,2]),Int32Array.from([1,3,2,2,1,2]),Int32Array.from([2,2,1,2,1,3]),Int32Array.from([2,2,1,3,1,2]),Int32Array.from([2,3,1,2,1,2]),Int32Array.from([1,1,2,2,3,2]),Int32Array.from([1,2,2,1,3,2]),Int32Array.from([1,2,2,2,3,1]),Int32Array.from([1,1,3,2,2,2]),Int32Array.from([1,2,3,1,2,2]),Int32Array.from([1,2,3,2,2,1]),Int32Array.from([2,2,3,2,1,1]),Int32Array.from([2,2,1,1,3,2]),Int32Array.from([2,2,1,2,3,1]),Int32Array.from([2,1,3,2,1,2]),Int32Array.from([2,2,3,1,1,2]),Int32Array.from([3,1,2,1,3,1]),Int32Array.from([3,1,1,2,2,2]),Int32Array.from([3,2,1,1,2,2]),Int32Array.from([3,2,1,2,2,1]),Int32Array.from([3,1,2,2,1,2]),Int32Array.from([3,2,2,1,1,2]),Int32Array.from([3,2,2,2,1,1]),Int32Array.from([2,1,2,1,2,3]),Int32Array.from([2,1,2,3,2,1]),Int32Array.from([2,3,2,1,2,1]),Int32Array.from([1,1,1,3,2,3]),Int32Array.from([1,3,1,1,2,3]),Int32Array.from([1,3,1,3,2,1]),Int32Array.from([1,1,2,3,1,3]),Int32Array.from([1,3,2,1,1,3]),Int32Array.from([1,3,2,3,1,1]),Int32Array.from([2,1,1,3,1,3]),Int32Array.from([2,3,1,1,1,3]),Int32Array.from([2,3,1,3,1,1]),Int32Array.from([1,1,2,1,3,3]),Int32Array.from([1,1,2,3,3,1]),Int32Array.from([1,3,2,1,3,1]),Int32Array.from([1,1,3,1,2,3]),Int32Array.from([1,1,3,3,2,1]),Int32Array.from([1,3,3,1,2,1]),Int32Array.from([3,1,3,1,2,1]),Int32Array.from([2,1,1,3,3,1]),Int32Array.from([2,3,1,1,3,1]),Int32Array.from([2,1,3,1,1,3]),Int32Array.from([2,1,3,3,1,1]),Int32Array.from([2,1,3,1,3,1]),Int32Array.from([3,1,1,1,2,3]),Int32Array.from([3,1,1,3,2,1]),Int32Array.from([3,3,1,1,2,1]),Int32Array.from([3,1,2,1,1,3]),Int32Array.from([3,1,2,3,1,1]),Int32Array.from([3,3,2,1,1,1]),Int32Array.from([3,1,4,1,1,1]),Int32Array.from([2,2,1,4,1,1]),Int32Array.from([4,3,1,1,1,1]),Int32Array.from([1,1,1,2,2,4]),Int32Array.from([1,1,1,4,2,2]),Int32Array.from([1,2,1,1,2,4]),Int32Array.from([1,2,1,4,2,1]),Int32Array.from([1,4,1,1,2,2]),Int32Array.from([1,4,1,2,2,1]),Int32Array.from([1,1,2,2,1,4]),Int32Array.from([1,1,2,4,1,2]),Int32Array.from([1,2,2,1,1,4]),Int32Array.from([1,2,2,4,1,1]),Int32Array.from([1,4,2,1,1,2]),Int32Array.from([1,4,2,2,1,1]),Int32Array.from([2,4,1,2,1,1]),Int32Array.from([2,2,1,1,1,4]),Int32Array.from([4,1,3,1,1,1]),Int32Array.from([2,4,1,1,1,2]),Int32Array.from([1,3,4,1,1,1]),Int32Array.from([1,1,1,2,4,2]),Int32Array.from([1,2,1,1,4,2]),Int32Array.from([1,2,1,2,4,1]),Int32Array.from([1,1,4,2,1,2]),Int32Array.from([1,2,4,1,1,2]),Int32Array.from([1,2,4,2,1,1]),Int32Array.from([4,1,1,2,1,2]),Int32Array.from([4,2,1,1,1,2]),Int32Array.from([4,2,1,2,1,1]),Int32Array.from([2,1,2,1,4,1]),Int32Array.from([2,1,4,1,2,1]),Int32Array.from([4,1,2,1,2,1]),Int32Array.from([1,1,1,1,4,3]),Int32Array.from([1,1,1,3,4,1]),Int32Array.from([1,3,1,1,4,1]),Int32Array.from([1,1,4,1,1,3]),Int32Array.from([1,1,4,3,1,1]),Int32Array.from([4,1,1,1,1,3]),Int32Array.from([4,1,1,3,1,1]),Int32Array.from([1,1,3,1,4,1]),Int32Array.from([1,1,4,1,3,1]),Int32Array.from([3,1,1,1,4,1]),Int32Array.from([4,1,1,1,3,1]),Int32Array.from([2,1,1,4,1,2]),Int32Array.from([2,1,1,2,1,4]),Int32Array.from([2,1,1,2,3,2]),Int32Array.from([2,3,3,1,1,1,2])],V.MAX_AVG_VARIANCE=.25,V.MAX_INDIVIDUAL_VARIANCE=.7,V.CODE_SHIFT=98,V.CODE_CODE_C=99,V.CODE_CODE_B=100,V.CODE_CODE_A=101,V.CODE_FNC_1=102,V.CODE_FNC_2=97,V.CODE_FNC_3=96,V.CODE_FNC_4_A=101,V.CODE_FNC_4_B=100,V.CODE_START_A=103,V.CODE_START_B=104,V.CODE_START_C=105,V.CODE_STOP=106;class Xe extends We{constructor(e=!1,t=!1){super(),this.usingCheckDigit=e,this.extendedMode=t,this.decodeRowResult="",this.counters=new Int32Array(9)}decodeRow(e,t,i){let r=this.counters;r.fill(0),this.decodeRowResult="";let s=Xe.findAsteriskPattern(t,r),l=t.getNextSet(s[1]),c=t.getSize(),h,f;do{Xe.recordPattern(t,l,r);let S=Xe.toNarrowWidePattern(r);if(S<0)throw new D;h=Xe.patternToChar(S),this.decodeRowResult+=h,f=l;for(let T of r)l+=T;l=t.getNextSet(l)}while(h!=="*");this.decodeRowResult=this.decodeRowResult.substring(0,this.decodeRowResult.length-1);let p=0;for(let S of r)p+=S;let b=l-f-p;if(l!==c&&b*2<p)throw new D;if(this.usingCheckDigit){let S=this.decodeRowResult.length-1,T=0;for(let R=0;R<S;R++)T+=Xe.ALPHABET_STRING.indexOf(this.decodeRowResult.charAt(R));if(this.decodeRowResult.charAt(S)!==Xe.ALPHABET_STRING.charAt(T%43))throw new X;this.decodeRowResult=this.decodeRowResult.substring(0,S)}if(this.decodeRowResult.length===0)throw new D;let w;this.extendedMode?w=Xe.decodeExtended(this.decodeRowResult):w=this.decodeRowResult;let y=(s[1]+s[0])/2,E=f+p/2;return new dt(w,null,0,[new j(y,e),new j(E,e)],Q.CODE_39,new Date().getTime())}static findAsteriskPattern(e,t){let i=e.getSize(),r=e.getNextSet(0),s=0,l=r,c=!1,h=t.length;for(let f=r;f<i;f++)if(e.get(f)!==c)t[s]++;else{if(s===h-1){if(this.toNarrowWidePattern(t)===Xe.ASTERISK_ENCODING&&e.isRange(Math.max(0,l-Math.floor((f-l)/2)),l,!1))return[l,f];l+=t[0]+t[1],t.copyWithin(0,2,2+s-1),t[s-1]=0,t[s]=0,s--}else s++;t[s]=1,c=!c}throw new D}static toNarrowWidePattern(e){let t=e.length,i=0,r;do{let s=2147483647;for(let h of e)h<s&&h>i&&(s=h);i=s,r=0;let l=0,c=0;for(let h=0;h<t;h++){let f=e[h];f>i&&(c|=1<<t-1-h,r++,l+=f)}if(r===3){for(let h=0;h<t&&r>0;h++){let f=e[h];if(f>i&&(r--,f*2>=l))return-1}return c}}while(r>3);return-1}static patternToChar(e){for(let t=0;t<Xe.CHARACTER_ENCODINGS.length;t++)if(Xe.CHARACTER_ENCODINGS[t]===e)return Xe.ALPHABET_STRING.charAt(t);if(e===Xe.ASTERISK_ENCODING)return"*";throw new D}static decodeExtended(e){let t=e.length,i="";for(let r=0;r<t;r++){let s=e.charAt(r);if(s==="+"||s==="$"||s==="%"||s==="/"){let l=e.charAt(r+1),c="\0";switch(s){case"+":if(l>="A"&&l<="Z")c=String.fromCharCode(l.charCodeAt(0)+32);else throw new z;break;case"$":if(l>="A"&&l<="Z")c=String.fromCharCode(l.charCodeAt(0)-64);else throw new z;break;case"%":if(l>="A"&&l<="E")c=String.fromCharCode(l.charCodeAt(0)-38);else if(l>="F"&&l<="J")c=String.fromCharCode(l.charCodeAt(0)-11);else if(l>="K"&&l<="O")c=String.fromCharCode(l.charCodeAt(0)+16);else if(l>="P"&&l<="T")c=String.fromCharCode(l.charCodeAt(0)+43);else if(l==="U")c="\0";else if(l==="V")c="@";else if(l==="W")c="`";else if(l==="X"||l==="Y"||l==="Z")c="";else throw new z;break;case"/":if(l>="A"&&l<="O")c=String.fromCharCode(l.charCodeAt(0)-32);else if(l==="Z")c=":";else throw new z;break}i+=c,r++}else i+=s}return i}}Xe.ALPHABET_STRING="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%",Xe.CHARACTER_ENCODINGS=[52,289,97,352,49,304,112,37,292,100,265,73,328,25,280,88,13,268,76,28,259,67,322,19,274,82,7,262,70,22,385,193,448,145,400,208,133,388,196,168,162,138,42],Xe.ASTERISK_ENCODING=148;class Ee extends We{constructor(){super(...arguments),this.narrowLineWidth=-1}decodeRow(e,t,i){let r=this.decodeStart(t),s=this.decodeEnd(t),l=new ae;Ee.decodeMiddle(t,r[1],s[0],l);let c=l.toString(),h=null;i!=null&&(h=i.get(be.ALLOWED_LENGTHS)),h==null&&(h=Ee.DEFAULT_ALLOWED_LENGTHS);let f=c.length,p=!1,b=0;for(let E of h){if(f===E){p=!0;break}E>b&&(b=E)}if(!p&&f>b&&(p=!0),!p)throw new z;const w=[new j(r[1],e),new j(s[0],e)];return new dt(c,null,0,w,Q.ITF,new Date().getTime())}static decodeMiddle(e,t,i,r){let s=new Int32Array(10),l=new Int32Array(5),c=new Int32Array(5);for(s.fill(0),l.fill(0),c.fill(0);t<i;){We.recordPattern(e,t,s);for(let f=0;f<5;f++){let p=2*f;l[f]=s[p],c[f]=s[p+1]}let h=Ee.decodeDigit(l);r.append(h.toString()),h=this.decodeDigit(c),r.append(h.toString()),s.forEach(function(f){t+=f})}}decodeStart(e){let t=Ee.skipWhiteSpace(e),i=Ee.findGuardPattern(e,t,Ee.START_PATTERN);return this.narrowLineWidth=(i[1]-i[0])/4,this.validateQuietZone(e,i[0]),i}validateQuietZone(e,t){let i=this.narrowLineWidth*10;i=i<t?i:t;for(let r=t-1;i>0&&r>=0&&!e.get(r);r--)i--;if(i!==0)throw new D}static skipWhiteSpace(e){const t=e.getSize(),i=e.getNextSet(0);if(i===t)throw new D;return i}decodeEnd(e){e.reverse();try{let t=Ee.skipWhiteSpace(e),i;try{i=Ee.findGuardPattern(e,t,Ee.END_PATTERN_REVERSED[0])}catch(s){s instanceof D&&(i=Ee.findGuardPattern(e,t,Ee.END_PATTERN_REVERSED[1]))}this.validateQuietZone(e,i[0]);let r=i[0];return i[0]=e.getSize()-i[1],i[1]=e.getSize()-r,i}finally{e.reverse()}}static findGuardPattern(e,t,i){let r=i.length,s=new Int32Array(r),l=e.getSize(),c=!1,h=0,f=t;s.fill(0);for(let p=t;p<l;p++)if(e.get(p)!==c)s[h]++;else{if(h===r-1){if(We.patternMatchVariance(s,i,Ee.MAX_INDIVIDUAL_VARIANCE)<Ee.MAX_AVG_VARIANCE)return[f,p];f+=s[0]+s[1],te.arraycopy(s,2,s,0,h-1),s[h-1]=0,s[h]=0,h--}else h++;s[h]=1,c=!c}throw new D}static decodeDigit(e){let t=Ee.MAX_AVG_VARIANCE,i=-1,r=Ee.PATTERNS.length;for(let s=0;s<r;s++){let l=Ee.PATTERNS[s],c=We.patternMatchVariance(e,l,Ee.MAX_INDIVIDUAL_VARIANCE);c<t?(t=c,i=s):c===t&&(i=-1)}if(i>=0)return i%10;throw new D}}Ee.PATTERNS=[Int32Array.from([1,1,2,2,1]),Int32Array.from([2,1,1,1,2]),Int32Array.from([1,2,1,1,2]),Int32Array.from([2,2,1,1,1]),Int32Array.from([1,1,2,1,2]),Int32Array.from([2,1,2,1,1]),Int32Array.from([1,2,2,1,1]),Int32Array.from([1,1,1,2,2]),Int32Array.from([2,1,1,2,1]),Int32Array.from([1,2,1,2,1]),Int32Array.from([1,1,3,3,1]),Int32Array.from([3,1,1,1,3]),Int32Array.from([1,3,1,1,3]),Int32Array.from([3,3,1,1,1]),Int32Array.from([1,1,3,1,3]),Int32Array.from([3,1,3,1,1]),Int32Array.from([1,3,3,1,1]),Int32Array.from([1,1,1,3,3]),Int32Array.from([3,1,1,3,1]),Int32Array.from([1,3,1,3,1])],Ee.MAX_AVG_VARIANCE=.38,Ee.MAX_INDIVIDUAL_VARIANCE=.5,Ee.DEFAULT_ALLOWED_LENGTHS=[6,8,10,12,14],Ee.START_PATTERN=Int32Array.from([1,1,1,1]),Ee.END_PATTERN_REVERSED=[Int32Array.from([1,1,2]),Int32Array.from([1,1,3])];class Fe extends We{constructor(){super(...arguments),this.decodeRowStringBuffer=""}static findStartGuardPattern(e){let t=!1,i,r=0,s=Int32Array.from([0,0,0]);for(;!t;){s=Int32Array.from([0,0,0]),i=Fe.findGuardPattern(e,r,!1,this.START_END_PATTERN,s);let l=i[0];r=i[1];let c=l-(r-l);c>=0&&(t=e.isRange(c,l,!1))}return i}static checkChecksum(e){return Fe.checkStandardUPCEANChecksum(e)}static checkStandardUPCEANChecksum(e){let t=e.length;if(t===0)return!1;let i=parseInt(e.charAt(t-1),10);return Fe.getStandardUPCEANChecksum(e.substring(0,t-1))===i}static getStandardUPCEANChecksum(e){let t=e.length,i=0;for(let r=t-1;r>=0;r-=2){let s=e.charAt(r).charCodeAt(0)-48;if(s<0||s>9)throw new z;i+=s}i*=3;for(let r=t-2;r>=0;r-=2){let s=e.charAt(r).charCodeAt(0)-48;if(s<0||s>9)throw new z;i+=s}return(1e3-i)%10}static decodeEnd(e,t){return Fe.findGuardPattern(e,t,!1,Fe.START_END_PATTERN,new Int32Array(Fe.START_END_PATTERN.length).fill(0))}static findGuardPatternWithoutCounters(e,t,i,r){return this.findGuardPattern(e,t,i,r,new Int32Array(r.length))}static findGuardPattern(e,t,i,r,s){let l=e.getSize();t=i?e.getNextUnset(t):e.getNextSet(t);let c=0,h=t,f=r.length,p=i;for(let b=t;b<l;b++)if(e.get(b)!==p)s[c]++;else{if(c===f-1){if(We.patternMatchVariance(s,r,Fe.MAX_INDIVIDUAL_VARIANCE)<Fe.MAX_AVG_VARIANCE)return Int32Array.from([h,b]);h+=s[0]+s[1];let w=s.slice(2,s.length-1);for(let y=0;y<c-1;y++)s[y]=w[y];s[c-1]=0,s[c]=0,c--}else c++;s[c]=1,p=!p}throw new D}static decodeDigit(e,t,i,r){this.recordPattern(e,i,t);let s=this.MAX_AVG_VARIANCE,l=-1,c=r.length;for(let h=0;h<c;h++){let f=r[h],p=We.patternMatchVariance(t,f,Fe.MAX_INDIVIDUAL_VARIANCE);p<s&&(s=p,l=h)}if(l>=0)return l;throw new D}}Fe.MAX_AVG_VARIANCE=.48,Fe.MAX_INDIVIDUAL_VARIANCE=.7,Fe.START_END_PATTERN=Int32Array.from([1,1,1]),Fe.MIDDLE_PATTERN=Int32Array.from([1,1,1,1,1]),Fe.END_PATTERN=Int32Array.from([1,1,1,1,1,1]),Fe.L_PATTERNS=[Int32Array.from([3,2,1,1]),Int32Array.from([2,2,2,1]),Int32Array.from([2,1,2,2]),Int32Array.from([1,4,1,1]),Int32Array.from([1,1,3,2]),Int32Array.from([1,2,3,1]),Int32Array.from([1,1,1,4]),Int32Array.from([1,3,1,2]),Int32Array.from([1,2,1,3]),Int32Array.from([3,1,1,2])];class wr{constructor(){this.CHECK_DIGIT_ENCODINGS=[24,20,18,17,12,6,3,10,9,5],this.decodeMiddleCounters=Int32Array.from([0,0,0,0]),this.decodeRowStringBuffer=""}decodeRow(e,t,i){let r=this.decodeRowStringBuffer,s=this.decodeMiddle(t,i,r),l=r.toString(),c=wr.parseExtensionString(l),h=[new j((i[0]+i[1])/2,e),new j(s,e)],f=new dt(l,null,0,h,Q.UPC_EAN_EXTENSION,new Date().getTime());return c!=null&&f.putAllMetadata(c),f}decodeMiddle(e,t,i){let r=this.decodeMiddleCounters;r[0]=0,r[1]=0,r[2]=0,r[3]=0;let s=e.getSize(),l=t[1],c=0;for(let f=0;f<5&&l<s;f++){let p=Fe.decodeDigit(e,r,l,Fe.L_AND_G_PATTERNS);i+=String.fromCharCode(48+p%10);for(let b of r)l+=b;p>=10&&(c|=1<<4-f),f!==4&&(l=e.getNextSet(l),l=e.getNextUnset(l))}if(i.length!==5)throw new D;let h=this.determineCheckDigit(c);if(wr.extensionChecksum(i.toString())!==h)throw new D;return l}static extensionChecksum(e){let t=e.length,i=0;for(let r=t-2;r>=0;r-=2)i+=e.charAt(r).charCodeAt(0)-48;i*=3;for(let r=t-1;r>=0;r-=2)i+=e.charAt(r).charCodeAt(0)-48;return i*=3,i%10}determineCheckDigit(e){for(let t=0;t<10;t++)if(e===this.CHECK_DIGIT_ENCODINGS[t])return t;throw new D}static parseExtensionString(e){if(e.length!==5)return null;let t=wr.parseExtension5String(e);return t==null?null:new Map([[Ye.SUGGESTED_PRICE,t]])}static parseExtension5String(e){let t;switch(e.charAt(0)){case"0":t="£";break;case"5":t="$";break;case"9":switch(e){case"90000":return null;case"99991":return"0.00";case"99990":return"Used"}t="";break;default:t="";break}let i=parseInt(e.substring(1)),r=(i/100).toString(),s=i%100,l=s<10?"0"+s:s.toString();return t+r+"."+l}}class kn{constructor(){this.decodeMiddleCounters=Int32Array.from([0,0,0,0]),this.decodeRowStringBuffer=""}decodeRow(e,t,i){let r=this.decodeRowStringBuffer,s=this.decodeMiddle(t,i,r),l=r.toString(),c=kn.parseExtensionString(l),h=[new j((i[0]+i[1])/2,e),new j(s,e)],f=new dt(l,null,0,h,Q.UPC_EAN_EXTENSION,new Date().getTime());return c!=null&&f.putAllMetadata(c),f}decodeMiddle(e,t,i){let r=this.decodeMiddleCounters;r[0]=0,r[1]=0,r[2]=0,r[3]=0;let s=e.getSize(),l=t[1],c=0;for(let h=0;h<2&&l<s;h++){let f=Fe.decodeDigit(e,r,l,Fe.L_AND_G_PATTERNS);i+=String.fromCharCode(48+f%10);for(let p of r)l+=p;f>=10&&(c|=1<<1-h),h!==1&&(l=e.getNextSet(l),l=e.getNextUnset(l))}if(i.length!==2)throw new D;if(parseInt(i.toString())%4!==c)throw new D;return l}static parseExtensionString(e){return e.length!==2?null:new Map([[Ye.ISSUE_NUMBER,parseInt(e)]])}}class Ks{static decodeRow(e,t,i){let r=Fe.findGuardPattern(t,i,!1,this.EXTENSION_START_PATTERN,new Int32Array(this.EXTENSION_START_PATTERN.length).fill(0));try{return new wr().decodeRow(e,t,r)}catch{return new kn().decodeRow(e,t,r)}}}Ks.EXTENSION_START_PATTERN=Int32Array.from([1,1,2]);class _e extends Fe{constructor(){super(),this.decodeRowStringBuffer="",_e.L_AND_G_PATTERNS=_e.L_PATTERNS.map(e=>Int32Array.from(e));for(let e=10;e<20;e++){let t=_e.L_PATTERNS[e-10],i=new Int32Array(t.length);for(let r=0;r<t.length;r++)i[r]=t[t.length-r-1];_e.L_AND_G_PATTERNS[e]=i}}decodeRow(e,t,i){let r=_e.findStartGuardPattern(t),s=i==null?null:i.get(be.NEED_RESULT_POINT_CALLBACK);if(s!=null){const L=new j((r[0]+r[1])/2,e);s.foundPossibleResultPoint(L)}let l=this.decodeMiddle(t,r,this.decodeRowStringBuffer),c=l.rowOffset,h=l.resultString;if(s!=null){const L=new j(c,e);s.foundPossibleResultPoint(L)}let f=this.decodeEnd(t,c);if(s!=null){const L=new j((f[0]+f[1])/2,e);s.foundPossibleResultPoint(L)}let p=f[1],b=p+(p-f[0]);if(b>=t.getSize()||!t.isRange(p,b,!1))throw new D;let w=h.toString();if(w.length<8)throw new z;if(!_e.checkChecksum(w))throw new X;let y=(r[1]+r[0])/2,E=(f[1]+f[0])/2,S=this.getBarcodeFormat(),T=[new j(y,e),new j(E,e)],R=new dt(w,null,0,T,S,new Date().getTime()),U=0;try{let L=Ks.decodeRow(e,t,f[1]);R.putMetadata(Ye.UPC_EAN_EXTENSION,L.getText()),R.putAllMetadata(L.getResultMetadata()),R.addResultPoints(L.getResultPoints()),U=L.getText().length}catch{}let $=i==null?null:i.get(be.ALLOWED_EAN_EXTENSIONS);if($!=null){let L=!1;for(let ue in $)if(U.toString()===ue){L=!0;break}if(!L)throw new D}return R}decodeEnd(e,t){return _e.findGuardPattern(e,t,!1,_e.START_END_PATTERN,new Int32Array(_e.START_END_PATTERN.length).fill(0))}static checkChecksum(e){return _e.checkStandardUPCEANChecksum(e)}static checkStandardUPCEANChecksum(e){let t=e.length;if(t===0)return!1;let i=parseInt(e.charAt(t-1),10);return _e.getStandardUPCEANChecksum(e.substring(0,t-1))===i}static getStandardUPCEANChecksum(e){let t=e.length,i=0;for(let r=t-1;r>=0;r-=2){let s=e.charAt(r).charCodeAt(0)-48;if(s<0||s>9)throw new z;i+=s}i*=3;for(let r=t-2;r>=0;r-=2){let s=e.charAt(r).charCodeAt(0)-48;if(s<0||s>9)throw new z;i+=s}return(1e3-i)%10}}class Ai extends _e{constructor(){super(),this.decodeMiddleCounters=Int32Array.from([0,0,0,0])}decodeMiddle(e,t,i){let r=this.decodeMiddleCounters;r[0]=0,r[1]=0,r[2]=0,r[3]=0;let s=e.getSize(),l=t[1],c=0;for(let f=0;f<6&&l<s;f++){let p=_e.decodeDigit(e,r,l,_e.L_AND_G_PATTERNS);i+=String.fromCharCode(48+p%10);for(let b of r)l+=b;p>=10&&(c|=1<<5-f)}i=Ai.determineFirstDigit(i,c),l=_e.findGuardPattern(e,l,!0,_e.MIDDLE_PATTERN,new Int32Array(_e.MIDDLE_PATTERN.length).fill(0))[1];for(let f=0;f<6&&l<s;f++){let p=_e.decodeDigit(e,r,l,_e.L_PATTERNS);i+=String.fromCharCode(48+p);for(let b of r)l+=b}return{rowOffset:l,resultString:i}}getBarcodeFormat(){return Q.EAN_13}static determineFirstDigit(e,t){for(let i=0;i<10;i++)if(t===this.FIRST_DIGIT_ENCODINGS[i])return e=String.fromCharCode(48+i)+e,e;throw new D}}Ai.FIRST_DIGIT_ENCODINGS=[0,11,13,14,19,25,28,21,22,26];class Zs extends _e{constructor(){super(),this.decodeMiddleCounters=Int32Array.from([0,0,0,0])}decodeMiddle(e,t,i){const r=this.decodeMiddleCounters;r[0]=0,r[1]=0,r[2]=0,r[3]=0;let s=e.getSize(),l=t[1];for(let h=0;h<4&&l<s;h++){let f=_e.decodeDigit(e,r,l,_e.L_PATTERNS);i+=String.fromCharCode(48+f);for(let p of r)l+=p}l=_e.findGuardPattern(e,l,!0,_e.MIDDLE_PATTERN,new Int32Array(_e.MIDDLE_PATTERN.length).fill(0))[1];for(let h=0;h<4&&l<s;h++){let f=_e.decodeDigit(e,r,l,_e.L_PATTERNS);i+=String.fromCharCode(48+f);for(let p of r)l+=p}return{rowOffset:l,resultString:i}}getBarcodeFormat(){return Q.EAN_8}}class Ys extends _e{constructor(){super(...arguments),this.ean13Reader=new Ai}getBarcodeFormat(){return Q.UPC_A}decode(e,t){return this.maybeReturnResult(this.ean13Reader.decode(e))}decodeRow(e,t,i){return this.maybeReturnResult(this.ean13Reader.decodeRow(e,t,i))}decodeMiddle(e,t,i){return this.ean13Reader.decodeMiddle(e,t,i)}maybeReturnResult(e){let t=e.getText();if(t.charAt(0)==="0"){let i=new dt(t.substring(1),null,null,e.getResultPoints(),Q.UPC_A);return e.getResultMetadata()!=null&&i.putAllMetadata(e.getResultMetadata()),i}else throw new D}reset(){this.ean13Reader.reset()}}class Rt extends _e{constructor(){super(),this.decodeMiddleCounters=new Int32Array(4)}decodeMiddle(e,t,i){const r=this.decodeMiddleCounters.map(f=>f);r[0]=0,r[1]=0,r[2]=0,r[3]=0;const s=e.getSize();let l=t[1],c=0;for(let f=0;f<6&&l<s;f++){const p=Rt.decodeDigit(e,r,l,Rt.L_AND_G_PATTERNS);i+=String.fromCharCode(48+p%10);for(let b of r)l+=b;p>=10&&(c|=1<<5-f)}let h=Rt.determineNumSysAndCheckDigit(i,c);return{rowOffset:l,resultString:h}}decodeEnd(e,t){return Rt.findGuardPatternWithoutCounters(e,t,!0,Rt.MIDDLE_END_PATTERN)}checkChecksum(e){return _e.checkChecksum(Rt.convertUPCEtoUPCA(e))}static determineNumSysAndCheckDigit(e,t){for(let i=0;i<=1;i++)for(let r=0;r<10;r++)if(t===this.NUMSYS_AND_CHECK_DIGIT_PATTERNS[i][r]){let s=String.fromCharCode(48+i),l=String.fromCharCode(48+r);return s+e+l}throw D.getNotFoundInstance()}getBarcodeFormat(){return Q.UPC_E}static convertUPCEtoUPCA(e){const t=e.slice(1,7).split("").map(s=>s.charCodeAt(0)),i=new ae;i.append(e.charAt(0));let r=t[5];switch(r){case 0:case 1:case 2:i.appendChars(t,0,2),i.append(r),i.append("0000"),i.appendChars(t,2,3);break;case 3:i.appendChars(t,0,3),i.append("00000"),i.appendChars(t,3,2);break;case 4:i.appendChars(t,0,4),i.append("00000"),i.append(t[4]);break;default:i.appendChars(t,0,5),i.append("0000"),i.append(r);break}return e.length>=8&&i.append(e.charAt(7)),i.toString()}}Rt.MIDDLE_END_PATTERN=Int32Array.from([1,1,1,1,1,1]),Rt.NUMSYS_AND_CHECK_DIGIT_PATTERNS=[Int32Array.from([56,52,50,49,44,38,35,42,41,37]),Int32Array.from([7,11,13,14,19,25,28,21,22,26])];class Rn extends We{constructor(e){super();let t=e==null?null:e.get(be.POSSIBLE_FORMATS),i=[];d(t)?(i.push(new Ai),i.push(new Ys),i.push(new Zs),i.push(new Rt)):(t.indexOf(Q.EAN_13)>-1&&i.push(new Ai),t.indexOf(Q.UPC_A)>-1&&i.push(new Ys),t.indexOf(Q.EAN_8)>-1&&i.push(new Zs),t.indexOf(Q.UPC_E)>-1&&i.push(new Rt)),this.readers=i}decodeRow(e,t,i){for(let r of this.readers)try{const s=r.decodeRow(e,t,i),l=s.getBarcodeFormat()===Q.EAN_13&&s.getText().charAt(0)==="0",c=i==null?null:i.get(be.POSSIBLE_FORMATS),h=c==null||c.includes(Q.UPC_A);if(l&&h){const f=s.getRawBytes(),p=new dt(s.getText().substring(1),f,f?f.length:null,s.getResultPoints(),Q.UPC_A);return p.putAllMetadata(s.getResultMetadata()),p}return s}catch{}throw new D}reset(){for(let e of this.readers)e.reset()}}class at extends We{constructor(){super(),this.decodeFinderCounters=new Int32Array(4),this.dataCharacterCounters=new Int32Array(8),this.oddRoundingErrors=new Array(4),this.evenRoundingErrors=new Array(4),this.oddCounts=new Array(this.dataCharacterCounters.length/2),this.evenCounts=new Array(this.dataCharacterCounters.length/2)}getDecodeFinderCounters(){return this.decodeFinderCounters}getDataCharacterCounters(){return this.dataCharacterCounters}getOddRoundingErrors(){return this.oddRoundingErrors}getEvenRoundingErrors(){return this.evenRoundingErrors}getOddCounts(){return this.oddCounts}getEvenCounts(){return this.evenCounts}parseFinderValue(e,t){for(let i=0;i<t.length;i++)if(We.patternMatchVariance(e,t[i],at.MAX_INDIVIDUAL_VARIANCE)<at.MAX_AVG_VARIANCE)return i;throw new D}static count(e){return me.sum(new Int32Array(e))}static increment(e,t){let i=0,r=t[0];for(let s=1;s<e.length;s++)t[s]>r&&(r=t[s],i=s);e[i]++}static decrement(e,t){let i=0,r=t[0];for(let s=1;s<e.length;s++)t[s]<r&&(r=t[s],i=s);e[i]--}static isFinderPattern(e){let t=e[0]+e[1],i=t+e[2]+e[3],r=t/i;if(r>=at.MIN_FINDER_PATTERN_RATIO&&r<=at.MAX_FINDER_PATTERN_RATIO){let s=Number.MAX_SAFE_INTEGER,l=Number.MIN_SAFE_INTEGER;for(let c of e)c>l&&(l=c),c<s&&(s=c);return l<10*s}return!1}}at.MAX_AVG_VARIANCE=.2,at.MAX_INDIVIDUAL_VARIANCE=.45,at.MIN_FINDER_PATTERN_RATIO=9.5/12,at.MAX_FINDER_PATTERN_RATIO=12.5/14;class Wi{constructor(e,t){this.value=e,this.checksumPortion=t}getValue(){return this.value}getChecksumPortion(){return this.checksumPortion}toString(){return this.value+"("+this.checksumPortion+")"}equals(e){if(!(e instanceof Wi))return!1;const t=e;return this.value===t.value&&this.checksumPortion===t.checksumPortion}hashCode(){return this.value^this.checksumPortion}}class Yr{constructor(e,t,i,r,s){this.value=e,this.startEnd=t,this.value=e,this.startEnd=t,this.resultPoints=new Array,this.resultPoints.push(new j(i,s)),this.resultPoints.push(new j(r,s))}getValue(){return this.value}getStartEnd(){return this.startEnd}getResultPoints(){return this.resultPoints}equals(e){if(!(e instanceof Yr))return!1;const t=e;return this.value===t.value}hashCode(){return this.value}}class Ut{constructor(){}static getRSSvalue(e,t,i){let r=0;for(let h of e)r+=h;let s=0,l=0,c=e.length;for(let h=0;h<c-1;h++){let f;for(f=1,l|=1<<h;f<e[h];f++,l&=~(1<<h)){let p=Ut.combins(r-f-1,c-h-2);if(i&&l===0&&r-f-(c-h-1)>=c-h-1&&(p-=Ut.combins(r-f-(c-h),c-h-2)),c-h-1>1){let b=0;for(let w=r-f-(c-h-2);w>t;w--)b+=Ut.combins(r-f-w-1,c-h-3);p-=b*(c-1-h)}else r-f>t&&p--;s+=p}r-=f}return s}static combins(e,t){let i,r;e-t>t?(r=t,i=e-t):(r=e-t,i=t);let s=1,l=1;for(let c=e;c>i;c--)s*=c,l<=r&&(s/=l,l++);for(;l<=r;)s/=l,l++;return s}}class Zo{static buildBitArray(e){let t=e.length*2-1;e[e.length-1].getRightChar()==null&&(t-=1);let i=12*t,r=new de(i),s=0,c=e[0].getRightChar().getValue();for(let h=11;h>=0;--h)c&1<<h&&r.set(s),s++;for(let h=1;h<e.length;++h){let f=e[h],p=f.getLeftChar().getValue();for(let b=11;b>=0;--b)p&1<<b&&r.set(s),s++;if(f.getRightChar()!=null){let b=f.getRightChar().getValue();for(let w=11;w>=0;--w)b&1<<w&&r.set(s),s++}}return r}}class Ei{constructor(e,t){t?this.decodedInformation=null:(this.finished=e,this.decodedInformation=t)}getDecodedInformation(){return this.decodedInformation}isFinished(){return this.finished}}class On{constructor(e){this.newPosition=e}getNewPosition(){return this.newPosition}}class mt extends On{constructor(e,t){super(e),this.value=t}getValue(){return this.value}isFNC1(){return this.value===mt.FNC1}}mt.FNC1="$";class Si extends On{constructor(e,t,i){super(e),i?(this.remaining=!0,this.remainingValue=this.remainingValue):(this.remaining=!1,this.remainingValue=0),this.newString=t}getNewString(){return this.newString}isRemaining(){return this.remaining}getRemainingValue(){return this.remainingValue}}class Et extends On{constructor(e,t,i){if(super(e),t<0||t>10||i<0||i>10)throw new z;this.firstDigit=t,this.secondDigit=i}getFirstDigit(){return this.firstDigit}getSecondDigit(){return this.secondDigit}getValue(){return this.firstDigit*10+this.secondDigit}isFirstDigitFNC1(){return this.firstDigit===Et.FNC1}isSecondDigitFNC1(){return this.secondDigit===Et.FNC1}isAnyFNC1(){return this.firstDigit===Et.FNC1||this.secondDigit===Et.FNC1}}Et.FNC1=10;class G{constructor(){}static parseFieldsInGeneralPurpose(e){if(!e)return null;if(e.length<2)throw new D;let t=e.substring(0,2);for(let s of G.TWO_DIGIT_DATA_LENGTH)if(s[0]===t)return s[1]===G.VARIABLE_LENGTH?G.processVariableAI(2,s[2],e):G.processFixedAI(2,s[1],e);if(e.length<3)throw new D;let i=e.substring(0,3);for(let s of G.THREE_DIGIT_DATA_LENGTH)if(s[0]===i)return s[1]===G.VARIABLE_LENGTH?G.processVariableAI(3,s[2],e):G.processFixedAI(3,s[1],e);for(let s of G.THREE_DIGIT_PLUS_DIGIT_DATA_LENGTH)if(s[0]===i)return s[1]===G.VARIABLE_LENGTH?G.processVariableAI(4,s[2],e):G.processFixedAI(4,s[1],e);if(e.length<4)throw new D;let r=e.substring(0,4);for(let s of G.FOUR_DIGIT_DATA_LENGTH)if(s[0]===r)return s[1]===G.VARIABLE_LENGTH?G.processVariableAI(4,s[2],e):G.processFixedAI(4,s[1],e);throw new D}static processFixedAI(e,t,i){if(i.length<e)throw new D;let r=i.substring(0,e);if(i.length<e+t)throw new D;let s=i.substring(e,e+t),l=i.substring(e+t),c="("+r+")"+s,h=G.parseFieldsInGeneralPurpose(l);return h==null?c:c+h}static processVariableAI(e,t,i){let r=i.substring(0,e),s;i.length<e+t?s=i.length:s=e+t;let l=i.substring(e,s),c=i.substring(s),h="("+r+")"+l,f=G.parseFieldsInGeneralPurpose(c);return f==null?h:h+f}}G.VARIABLE_LENGTH=[],G.TWO_DIGIT_DATA_LENGTH=[["00",18],["01",14],["02",14],["10",G.VARIABLE_LENGTH,20],["11",6],["12",6],["13",6],["15",6],["17",6],["20",2],["21",G.VARIABLE_LENGTH,20],["22",G.VARIABLE_LENGTH,29],["30",G.VARIABLE_LENGTH,8],["37",G.VARIABLE_LENGTH,8],["90",G.VARIABLE_LENGTH,30],["91",G.VARIABLE_LENGTH,30],["92",G.VARIABLE_LENGTH,30],["93",G.VARIABLE_LENGTH,30],["94",G.VARIABLE_LENGTH,30],["95",G.VARIABLE_LENGTH,30],["96",G.VARIABLE_LENGTH,30],["97",G.VARIABLE_LENGTH,3],["98",G.VARIABLE_LENGTH,30],["99",G.VARIABLE_LENGTH,30]],G.THREE_DIGIT_DATA_LENGTH=[["240",G.VARIABLE_LENGTH,30],["241",G.VARIABLE_LENGTH,30],["242",G.VARIABLE_LENGTH,6],["250",G.VARIABLE_LENGTH,30],["251",G.VARIABLE_LENGTH,30],["253",G.VARIABLE_LENGTH,17],["254",G.VARIABLE_LENGTH,20],["400",G.VARIABLE_LENGTH,30],["401",G.VARIABLE_LENGTH,30],["402",17],["403",G.VARIABLE_LENGTH,30],["410",13],["411",13],["412",13],["413",13],["414",13],["420",G.VARIABLE_LENGTH,20],["421",G.VARIABLE_LENGTH,15],["422",3],["423",G.VARIABLE_LENGTH,15],["424",3],["425",3],["426",3]],G.THREE_DIGIT_PLUS_DIGIT_DATA_LENGTH=[["310",6],["311",6],["312",6],["313",6],["314",6],["315",6],["316",6],["320",6],["321",6],["322",6],["323",6],["324",6],["325",6],["326",6],["327",6],["328",6],["329",6],["330",6],["331",6],["332",6],["333",6],["334",6],["335",6],["336",6],["340",6],["341",6],["342",6],["343",6],["344",6],["345",6],["346",6],["347",6],["348",6],["349",6],["350",6],["351",6],["352",6],["353",6],["354",6],["355",6],["356",6],["357",6],["360",6],["361",6],["362",6],["363",6],["364",6],["365",6],["366",6],["367",6],["368",6],["369",6],["390",G.VARIABLE_LENGTH,15],["391",G.VARIABLE_LENGTH,18],["392",G.VARIABLE_LENGTH,15],["393",G.VARIABLE_LENGTH,18],["703",G.VARIABLE_LENGTH,30]],G.FOUR_DIGIT_DATA_LENGTH=[["7001",13],["7002",G.VARIABLE_LENGTH,30],["7003",10],["8001",14],["8002",G.VARIABLE_LENGTH,20],["8003",G.VARIABLE_LENGTH,30],["8004",G.VARIABLE_LENGTH,30],["8005",6],["8006",18],["8007",G.VARIABLE_LENGTH,30],["8008",G.VARIABLE_LENGTH,12],["8018",18],["8020",G.VARIABLE_LENGTH,25],["8100",6],["8101",10],["8102",2],["8110",G.VARIABLE_LENGTH,70],["8200",G.VARIABLE_LENGTH,70]];class Xi{constructor(e){this.buffer=new ae,this.information=e}decodeAllCodes(e,t){let i=t,r=null;do{let s=this.decodeGeneralPurposeField(i,r),l=G.parseFieldsInGeneralPurpose(s.getNewString());if(l!=null&&e.append(l),s.isRemaining()?r=""+s.getRemainingValue():r=null,i===s.getNewPosition())break;i=s.getNewPosition()}while(!0);return e.toString()}isStillNumeric(e){if(e+7>this.information.getSize())return e+4<=this.information.getSize();for(let t=e;t<e+3;++t)if(this.information.get(t))return!0;return this.information.get(e+3)}decodeNumeric(e){if(e+7>this.information.getSize()){let s=this.extractNumericValueFromBitArray(e,4);return s===0?new Et(this.information.getSize(),Et.FNC1,Et.FNC1):new Et(this.information.getSize(),s-1,Et.FNC1)}let t=this.extractNumericValueFromBitArray(e,7),i=(t-8)/11,r=(t-8)%11;return new Et(e+7,i,r)}extractNumericValueFromBitArray(e,t){return Xi.extractNumericValueFromBitArray(this.information,e,t)}static extractNumericValueFromBitArray(e,t,i){let r=0;for(let s=0;s<i;++s)e.get(t+s)&&(r|=1<<i-s-1);return r}decodeGeneralPurposeField(e,t){this.buffer.setLengthToZero(),t!=null&&this.buffer.append(t),this.current.setPosition(e);let i=this.parseBlocks();return i!=null&&i.isRemaining()?new Si(this.current.getPosition(),this.buffer.toString(),i.getRemainingValue()):new Si(this.current.getPosition(),this.buffer.toString())}parseBlocks(){let e,t;do{let i=this.current.getPosition();if(this.current.isAlpha()?(t=this.parseAlphaBlock(),e=t.isFinished()):this.current.isIsoIec646()?(t=this.parseIsoIec646Block(),e=t.isFinished()):(t=this.parseNumericBlock(),e=t.isFinished()),!(i!==this.current.getPosition())&&!e)break}while(!e);return t.getDecodedInformation()}parseNumericBlock(){for(;this.isStillNumeric(this.current.getPosition());){let e=this.decodeNumeric(this.current.getPosition());if(this.current.setPosition(e.getNewPosition()),e.isFirstDigitFNC1()){let t;return e.isSecondDigitFNC1()?t=new Si(this.current.getPosition(),this.buffer.toString()):t=new Si(this.current.getPosition(),this.buffer.toString(),e.getSecondDigit()),new Ei(!0,t)}if(this.buffer.append(e.getFirstDigit()),e.isSecondDigitFNC1()){let t=new Si(this.current.getPosition(),this.buffer.toString());return new Ei(!0,t)}this.buffer.append(e.getSecondDigit())}return this.isNumericToAlphaNumericLatch(this.current.getPosition())&&(this.current.setAlpha(),this.current.incrementPosition(4)),new Ei(!1)}parseIsoIec646Block(){for(;this.isStillIsoIec646(this.current.getPosition());){let e=this.decodeIsoIec646(this.current.getPosition());if(this.current.setPosition(e.getNewPosition()),e.isFNC1()){let t=new Si(this.current.getPosition(),this.buffer.toString());return new Ei(!0,t)}this.buffer.append(e.getValue())}return this.isAlphaOr646ToNumericLatch(this.current.getPosition())?(this.current.incrementPosition(3),this.current.setNumeric()):this.isAlphaTo646ToAlphaLatch(this.current.getPosition())&&(this.current.getPosition()+5<this.information.getSize()?this.current.incrementPosition(5):this.current.setPosition(this.information.getSize()),this.current.setAlpha()),new Ei(!1)}parseAlphaBlock(){for(;this.isStillAlpha(this.current.getPosition());){let e=this.decodeAlphanumeric(this.current.getPosition());if(this.current.setPosition(e.getNewPosition()),e.isFNC1()){let t=new Si(this.current.getPosition(),this.buffer.toString());return new Ei(!0,t)}this.buffer.append(e.getValue())}return this.isAlphaOr646ToNumericLatch(this.current.getPosition())?(this.current.incrementPosition(3),this.current.setNumeric()):this.isAlphaTo646ToAlphaLatch(this.current.getPosition())&&(this.current.getPosition()+5<this.information.getSize()?this.current.incrementPosition(5):this.current.setPosition(this.information.getSize()),this.current.setIsoIec646()),new Ei(!1)}isStillIsoIec646(e){if(e+5>this.information.getSize())return!1;let t=this.extractNumericValueFromBitArray(e,5);if(t>=5&&t<16)return!0;if(e+7>this.information.getSize())return!1;let i=this.extractNumericValueFromBitArray(e,7);if(i>=64&&i<116)return!0;if(e+8>this.information.getSize())return!1;let r=this.extractNumericValueFromBitArray(e,8);return r>=232&&r<253}decodeIsoIec646(e){let t=this.extractNumericValueFromBitArray(e,5);if(t===15)return new mt(e+5,mt.FNC1);if(t>=5&&t<15)return new mt(e+5,"0"+(t-5));let i=this.extractNumericValueFromBitArray(e,7);if(i>=64&&i<90)return new mt(e+7,""+(i+1));if(i>=90&&i<116)return new mt(e+7,""+(i+7));let r=this.extractNumericValueFromBitArray(e,8),s;switch(r){case 232:s="!";break;case 233:s='"';break;case 234:s="%";break;case 235:s="&";break;case 236:s="'";break;case 237:s="(";break;case 238:s=")";break;case 239:s="*";break;case 240:s="+";break;case 241:s=",";break;case 242:s="-";break;case 243:s=".";break;case 244:s="/";break;case 245:s=":";break;case 246:s=";";break;case 247:s="<";break;case 248:s="=";break;case 249:s=">";break;case 250:s="?";break;case 251:s="_";break;case 252:s=" ";break;default:throw new z}return new mt(e+8,s)}isStillAlpha(e){if(e+5>this.information.getSize())return!1;let t=this.extractNumericValueFromBitArray(e,5);if(t>=5&&t<16)return!0;if(e+6>this.information.getSize())return!1;let i=this.extractNumericValueFromBitArray(e,6);return i>=16&&i<63}decodeAlphanumeric(e){let t=this.extractNumericValueFromBitArray(e,5);if(t===15)return new mt(e+5,mt.FNC1);if(t>=5&&t<15)return new mt(e+5,"0"+(t-5));let i=this.extractNumericValueFromBitArray(e,6);if(i>=32&&i<58)return new mt(e+6,""+(i+33));let r;switch(i){case 58:r="*";break;case 59:r=",";break;case 60:r="-";break;case 61:r=".";break;case 62:r="/";break;default:throw new Ft("Decoding invalid alphanumeric value: "+i)}return new mt(e+6,r)}isAlphaTo646ToAlphaLatch(e){if(e+1>this.information.getSize())return!1;for(let t=0;t<5&&t+e<this.information.getSize();++t)if(t===2){if(!this.information.get(e+2))return!1}else if(this.information.get(e+t))return!1;return!0}isAlphaOr646ToNumericLatch(e){if(e+3>this.information.getSize())return!1;for(let t=e;t<e+3;++t)if(this.information.get(t))return!1;return!0}isNumericToAlphaNumericLatch(e){if(e+1>this.information.getSize())return!1;for(let t=0;t<4&&t+e<this.information.getSize();++t)if(this.information.get(e+t))return!1;return!0}}class Dn{constructor(e){this.information=e,this.generalDecoder=new Xi(e)}getInformation(){return this.information}getGeneralDecoder(){return this.generalDecoder}}class xt extends Dn{constructor(e){super(e)}encodeCompressedGtin(e,t){e.append("(01)");let i=e.length();e.append("9"),this.encodeCompressedGtinWithoutAI(e,t,i)}encodeCompressedGtinWithoutAI(e,t,i){for(let r=0;r<4;++r){let s=this.getGeneralDecoder().extractNumericValueFromBitArray(t+10*r,10);s/100===0&&e.append("0"),s/10===0&&e.append("0"),e.append(s)}xt.appendCheckDigit(e,i)}static appendCheckDigit(e,t){let i=0;for(let r=0;r<13;r++){let s=e.charAt(r+t).charCodeAt(0)-48;i+=r&1?s:3*s}i=10-i%10,i===10&&(i=0),e.append(i)}}xt.GTIN_SIZE=40;class ji extends xt{constructor(e){super(e)}parseInformation(){let e=new ae;e.append("(01)");let t=e.length(),i=this.getGeneralDecoder().extractNumericValueFromBitArray(ji.HEADER_SIZE,4);return e.append(i),this.encodeCompressedGtinWithoutAI(e,ji.HEADER_SIZE+4,t),this.getGeneralDecoder().decodeAllCodes(e,ji.HEADER_SIZE+44)}}ji.HEADER_SIZE=4;class qr extends Dn{constructor(e){super(e)}parseInformation(){let e=new ae;return this.getGeneralDecoder().decodeAllCodes(e,qr.HEADER_SIZE)}}qr.HEADER_SIZE=5;class Qr extends xt{constructor(e){super(e)}encodeCompressedWeight(e,t,i){let r=this.getGeneralDecoder().extractNumericValueFromBitArray(t,i);this.addWeightCode(e,r);let s=this.checkWeight(r),l=1e5;for(let c=0;c<5;++c)s/l===0&&e.append("0"),l/=10;e.append(s)}}class $t extends Qr{constructor(e){super(e)}parseInformation(){if(this.getInformation().getSize()!=$t.HEADER_SIZE+Qr.GTIN_SIZE+$t.WEIGHT_SIZE)throw new D;let e=new ae;return this.encodeCompressedGtin(e,$t.HEADER_SIZE),this.encodeCompressedWeight(e,$t.HEADER_SIZE+Qr.GTIN_SIZE,$t.WEIGHT_SIZE),e.toString()}}$t.HEADER_SIZE=5,$t.WEIGHT_SIZE=15;class Yo extends $t{constructor(e){super(e)}addWeightCode(e,t){e.append("(3103)")}checkWeight(e){return e}}class qo extends $t{constructor(e){super(e)}addWeightCode(e,t){t<1e4?e.append("(3202)"):e.append("(3203)")}checkWeight(e){return e<1e4?e:e-1e4}}class zt extends xt{constructor(e){super(e)}parseInformation(){if(this.getInformation().getSize()<zt.HEADER_SIZE+xt.GTIN_SIZE)throw new D;let e=new ae;this.encodeCompressedGtin(e,zt.HEADER_SIZE);let t=this.getGeneralDecoder().extractNumericValueFromBitArray(zt.HEADER_SIZE+xt.GTIN_SIZE,zt.LAST_DIGIT_SIZE);e.append("(392"),e.append(t),e.append(")");let i=this.getGeneralDecoder().decodeGeneralPurposeField(zt.HEADER_SIZE+xt.GTIN_SIZE+zt.LAST_DIGIT_SIZE,null);return e.append(i.getNewString()),e.toString()}}zt.HEADER_SIZE=8,zt.LAST_DIGIT_SIZE=2;class ut extends xt{constructor(e){super(e)}parseInformation(){if(this.getInformation().getSize()<ut.HEADER_SIZE+xt.GTIN_SIZE)throw new D;let e=new ae;this.encodeCompressedGtin(e,ut.HEADER_SIZE);let t=this.getGeneralDecoder().extractNumericValueFromBitArray(ut.HEADER_SIZE+xt.GTIN_SIZE,ut.LAST_DIGIT_SIZE);e.append("(393"),e.append(t),e.append(")");let i=this.getGeneralDecoder().extractNumericValueFromBitArray(ut.HEADER_SIZE+xt.GTIN_SIZE+ut.LAST_DIGIT_SIZE,ut.FIRST_THREE_DIGITS_SIZE);i/100==0&&e.append("0"),i/10==0&&e.append("0"),e.append(i);let r=this.getGeneralDecoder().decodeGeneralPurposeField(ut.HEADER_SIZE+xt.GTIN_SIZE+ut.LAST_DIGIT_SIZE+ut.FIRST_THREE_DIGITS_SIZE,null);return e.append(r.getNewString()),e.toString()}}ut.HEADER_SIZE=8,ut.LAST_DIGIT_SIZE=2,ut.FIRST_THREE_DIGITS_SIZE=10;class Oe extends Qr{constructor(e,t,i){super(e),this.dateCode=i,this.firstAIdigits=t}parseInformation(){if(this.getInformation().getSize()!=Oe.HEADER_SIZE+Oe.GTIN_SIZE+Oe.WEIGHT_SIZE+Oe.DATE_SIZE)throw new D;let e=new ae;return this.encodeCompressedGtin(e,Oe.HEADER_SIZE),this.encodeCompressedWeight(e,Oe.HEADER_SIZE+Oe.GTIN_SIZE,Oe.WEIGHT_SIZE),this.encodeCompressedDate(e,Oe.HEADER_SIZE+Oe.GTIN_SIZE+Oe.WEIGHT_SIZE),e.toString()}encodeCompressedDate(e,t){let i=this.getGeneralDecoder().extractNumericValueFromBitArray(t,Oe.DATE_SIZE);if(i==38400)return;e.append("("),e.append(this.dateCode),e.append(")");let r=i%32;i/=32;let s=i%12+1;i/=12;let l=i;l/10==0&&e.append("0"),e.append(l),s/10==0&&e.append("0"),e.append(s),r/10==0&&e.append("0"),e.append(r)}addWeightCode(e,t){e.append("("),e.append(this.firstAIdigits),e.append(t/1e5),e.append(")")}checkWeight(e){return e%1e5}}Oe.HEADER_SIZE=8,Oe.WEIGHT_SIZE=20,Oe.DATE_SIZE=16;function qs(x){try{if(x.get(1))return new ji(x);if(!x.get(2))return new qr(x);switch(Xi.extractNumericValueFromBitArray(x,1,4)){case 4:return new Yo(x);case 5:return new qo(x)}switch(Xi.extractNumericValueFromBitArray(x,1,5)){case 12:return new zt(x);case 13:return new ut(x)}switch(Xi.extractNumericValueFromBitArray(x,1,7)){case 56:return new Oe(x,"310","11");case 57:return new Oe(x,"320","11");case 58:return new Oe(x,"310","13");case 59:return new Oe(x,"320","13");case 60:return new Oe(x,"310","15");case 61:return new Oe(x,"320","15");case 62:return new Oe(x,"310","17");case 63:return new Oe(x,"320","17")}}catch(e){throw console.log(e),new Ft("unknown decoder: "+x)}}class oi{constructor(e,t,i,r){this.leftchar=e,this.rightchar=t,this.finderpattern=i,this.maybeLast=r}mayBeLast(){return this.maybeLast}getLeftChar(){return this.leftchar}getRightChar(){return this.rightchar}getFinderPattern(){return this.finderpattern}mustBeLast(){return this.rightchar==null}toString(){return"[ "+this.leftchar+", "+this.rightchar+" : "+(this.finderpattern==null?"null":this.finderpattern.getValue())+" ]"}static equals(e,t){return e instanceof oi?oi.equalsOrNull(e.leftchar,t.leftchar)&&oi.equalsOrNull(e.rightchar,t.rightchar)&&oi.equalsOrNull(e.finderpattern,t.finderpattern):!1}static equalsOrNull(e,t){return e===null?t===null:oi.equals(e,t)}hashCode(){return this.leftchar.getValue()^this.rightchar.getValue()^this.finderpattern.getValue()}}class Mn{constructor(e,t,i){this.pairs=e,this.rowNumber=t,this.wasReversed=i}getPairs(){return this.pairs}getRowNumber(){return this.rowNumber}isReversed(){return this.wasReversed}isEquivalent(e){return this.checkEqualitity(this,e)}toString(){return"{ "+this.pairs+" }"}equals(e,t){return e instanceof Mn?this.checkEqualitity(e,t)&&e.wasReversed===t.wasReversed:!1}checkEqualitity(e,t){if(!e||!t)return;let i;return e.forEach((r,s)=>{t.forEach(l=>{r.getLeftChar().getValue()===l.getLeftChar().getValue()&&r.getRightChar().getValue()===l.getRightChar().getValue()&&r.getFinderPatter().getValue()===l.getFinderPatter().getValue()&&(i=!0)})}),i}}class P extends at{constructor(e){super(...arguments),this.pairs=new Array(P.MAX_PAIRS),this.rows=new Array,this.startEnd=[2],this.verbose=e===!0}decodeRow(e,t,i){this.pairs.length=0,this.startFromEven=!1;try{return P.constructResult(this.decodeRow2pairs(e,t))}catch(r){this.verbose&&console.log(r)}return this.pairs.length=0,this.startFromEven=!0,P.constructResult(this.decodeRow2pairs(e,t))}reset(){this.pairs.length=0,this.rows.length=0}decodeRow2pairs(e,t){let i=!1;for(;!i;)try{this.pairs.push(this.retrieveNextPair(t,this.pairs,e))}catch(s){if(s instanceof D){if(!this.pairs.length)throw new D;i=!0}}if(this.checkChecksum())return this.pairs;let r;if(this.rows.length?r=!0:r=!1,this.storeRow(e,!1),r){let s=this.checkRowsBoolean(!1);if(s!=null||(s=this.checkRowsBoolean(!0),s!=null))return s}throw new D}checkRowsBoolean(e){if(this.rows.length>25)return this.rows.length=0,null;this.pairs.length=0,e&&(this.rows=this.rows.reverse());let t=null;try{t=this.checkRows(new Array,0)}catch(i){this.verbose&&console.log(i)}return e&&(this.rows=this.rows.reverse()),t}checkRows(e,t){for(let i=t;i<this.rows.length;i++){let r=this.rows[i];this.pairs.length=0;for(let l of e)this.pairs.push(l.getPairs());if(this.pairs.push(r.getPairs()),!P.isValidSequence(this.pairs))continue;if(this.checkChecksum())return this.pairs;let s=new Array(e);s.push(r);try{return this.checkRows(s,i+1)}catch(l){this.verbose&&console.log(l)}}throw new D}static isValidSequence(e){for(let t of P.FINDER_PATTERN_SEQUENCES){if(e.length>t.length)continue;let i=!0;for(let r=0;r<e.length;r++)if(e[r].getFinderPattern().getValue()!=t[r]){i=!1;break}if(i)return!0}return!1}storeRow(e,t){let i=0,r=!1,s=!1;for(;i<this.rows.length;){let l=this.rows[i];if(l.getRowNumber()>e){s=l.isEquivalent(this.pairs);break}r=l.isEquivalent(this.pairs),i++}s||r||P.isPartialRow(this.pairs,this.rows)||(this.rows.push(i,new Mn(this.pairs,e,t)),this.removePartialRows(this.pairs,this.rows))}removePartialRows(e,t){for(let i of t)if(i.getPairs().length!==e.length){for(let r of i.getPairs())for(let s of e)if(oi.equals(r,s))break}}static isPartialRow(e,t){for(let i of t){let r=!0;for(let s of e){let l=!1;for(let c of i.getPairs())if(s.equals(c)){l=!0;break}if(!l){r=!1;break}}if(r)return!0}return!1}getRows(){return this.rows}static constructResult(e){let t=Zo.buildBitArray(e),r=qs(t).parseInformation(),s=e[0].getFinderPattern().getResultPoints(),l=e[e.length-1].getFinderPattern().getResultPoints(),c=[s[0],s[1],l[0],l[1]];return new dt(r,null,null,c,Q.RSS_EXPANDED,null)}checkChecksum(){let e=this.pairs.get(0),t=e.getLeftChar(),i=e.getRightChar();if(i==null)return!1;let r=i.getChecksumPortion(),s=2;for(let c=1;c<this.pairs.size();++c){let h=this.pairs.get(c);r+=h.getLeftChar().getChecksumPortion(),s++;let f=h.getRightChar();f!=null&&(r+=f.getChecksumPortion(),s++)}return r%=211,211*(s-4)+r==t.getValue()}static getNextSecondBar(e,t){let i;return e.get(t)?(i=e.getNextUnset(t),i=e.getNextSet(i)):(i=e.getNextSet(t),i=e.getNextUnset(i)),i}retrieveNextPair(e,t,i){let r=t.length%2==0;this.startFromEven&&(r=!r);let s,l=!0,c=-1;do this.findNextPair(e,t,c),s=this.parseFoundFinderPattern(e,i,r),s==null?c=P.getNextSecondBar(e,this.startEnd[0]):l=!1;while(l);let h=this.decodeDataCharacter(e,s,r,!0);if(!this.isEmptyPair(t)&&t[t.length-1].mustBeLast())throw new D;let f;try{f=this.decodeDataCharacter(e,s,r,!1)}catch(p){f=null,this.verbose&&console.log(p)}return new oi(h,f,s,!0)}isEmptyPair(e){return e.length===0}findNextPair(e,t,i){let r=this.getDecodeFinderCounters();r[0]=0,r[1]=0,r[2]=0,r[3]=0;let s=e.getSize(),l;i>=0?l=i:this.isEmptyPair(t)?l=0:l=t[t.length-1].getFinderPattern().getStartEnd()[1];let c=t.length%2!=0;this.startFromEven&&(c=!c);let h=!1;for(;l<s&&(h=!e.get(l),!!h);)l++;let f=0,p=l;for(let b=l;b<s;b++)if(e.get(b)!=h)r[f]++;else{if(f==3){if(c&&P.reverseCounters(r),P.isFinderPattern(r)){this.startEnd[0]=p,this.startEnd[1]=b;return}c&&P.reverseCounters(r),p+=r[0]+r[1],r[0]=r[2],r[1]=r[3],r[2]=0,r[3]=0,f--}else f++;r[f]=1,h=!h}throw new D}static reverseCounters(e){let t=e.length;for(let i=0;i<t/2;++i){let r=e[i];e[i]=e[t-i-1],e[t-i-1]=r}}parseFoundFinderPattern(e,t,i){let r,s,l;if(i){let f=this.startEnd[0]-1;for(;f>=0&&!e.get(f);)f--;f++,r=this.startEnd[0]-f,s=f,l=this.startEnd[1]}else s=this.startEnd[0],l=e.getNextUnset(this.startEnd[1]+1),r=l-this.startEnd[1];let c=this.getDecodeFinderCounters();te.arraycopy(c,0,c,1,c.length-1),c[0]=r;let h;try{h=this.parseFinderValue(c,P.FINDER_PATTERNS)}catch{return null}return new Yr(h,[s,l],s,l,t)}decodeDataCharacter(e,t,i,r){let s=this.getDataCharacterCounters();for(let Ie=0;Ie<s.length;Ie++)s[Ie]=0;if(r)P.recordPatternInReverse(e,t.getStartEnd()[0],s);else{P.recordPattern(e,t.getStartEnd()[1],s);for(let Ie=0,nt=s.length-1;Ie<nt;Ie++,nt--){let yt=s[Ie];s[Ie]=s[nt],s[nt]=yt}}let l=17,c=me.sum(new Int32Array(s))/l,h=(t.getStartEnd()[1]-t.getStartEnd()[0])/15;if(Math.abs(c-h)/h>.3)throw new D;let f=this.getOddCounts(),p=this.getEvenCounts(),b=this.getOddRoundingErrors(),w=this.getEvenRoundingErrors();for(let Ie=0;Ie<s.length;Ie++){let nt=1*s[Ie]/c,yt=nt+.5;if(yt<1){if(nt<.3)throw new D;yt=1}else if(yt>8){if(nt>8.7)throw new D;yt=8}let Qi=Ie/2;Ie&1?(p[Qi]=yt,w[Qi]=nt-yt):(f[Qi]=yt,b[Qi]=nt-yt)}this.adjustOddEvenCounts(l);let y=4*t.getValue()+(i?0:2)+(r?0:1)-1,E=0,S=0;for(let Ie=f.length-1;Ie>=0;Ie--){if(P.isNotA1left(t,i,r)){let nt=P.WEIGHTS[y][2*Ie];S+=f[Ie]*nt}E+=f[Ie]}let T=0;for(let Ie=p.length-1;Ie>=0;Ie--)if(P.isNotA1left(t,i,r)){let nt=P.WEIGHTS[y][2*Ie+1];T+=p[Ie]*nt}let R=S+T;if(E&1||E>13||E<4)throw new D;let U=(13-E)/2,$=P.SYMBOL_WIDEST[U],L=9-$,ue=Ut.getRSSvalue(f,$,!0),ne=Ut.getRSSvalue(p,L,!1),wt=P.EVEN_TOTAL_SUBSET[U],Ot=P.GSUM[U],_t=ue*wt+ne+Ot;return new Wi(_t,R)}static isNotA1left(e,t,i){return!(e.getValue()==0&&t&&i)}adjustOddEvenCounts(e){let t=me.sum(new Int32Array(this.getOddCounts())),i=me.sum(new Int32Array(this.getEvenCounts())),r=!1,s=!1;t>13?s=!0:t<4&&(r=!0);let l=!1,c=!1;i>13?c=!0:i<4&&(l=!0);let h=t+i-e,f=(t&1)==1,p=(i&1)==0;if(h==1)if(f){if(p)throw new D;s=!0}else{if(!p)throw new D;c=!0}else if(h==-1)if(f){if(p)throw new D;r=!0}else{if(!p)throw new D;l=!0}else if(h==0){if(f){if(!p)throw new D;t<i?(r=!0,c=!0):(s=!0,l=!0)}else if(p)throw new D}else throw new D;if(r){if(s)throw new D;P.increment(this.getOddCounts(),this.getOddRoundingErrors())}if(s&&P.decrement(this.getOddCounts(),this.getOddRoundingErrors()),l){if(c)throw new D;P.increment(this.getEvenCounts(),this.getOddRoundingErrors())}c&&P.decrement(this.getEvenCounts(),this.getEvenRoundingErrors())}}P.SYMBOL_WIDEST=[7,5,4,3,1],P.EVEN_TOTAL_SUBSET=[4,20,52,104,204],P.GSUM=[0,348,1388,2948,3988],P.FINDER_PATTERNS=[Int32Array.from([1,8,4,1]),Int32Array.from([3,6,4,1]),Int32Array.from([3,4,6,1]),Int32Array.from([3,2,8,1]),Int32Array.from([2,6,5,1]),Int32Array.from([2,2,9,1])],P.WEIGHTS=[[1,3,9,27,81,32,96,77],[20,60,180,118,143,7,21,63],[189,145,13,39,117,140,209,205],[193,157,49,147,19,57,171,91],[62,186,136,197,169,85,44,132],[185,133,188,142,4,12,36,108],[113,128,173,97,80,29,87,50],[150,28,84,41,123,158,52,156],[46,138,203,187,139,206,196,166],[76,17,51,153,37,111,122,155],[43,129,176,106,107,110,119,146],[16,48,144,10,30,90,59,177],[109,116,137,200,178,112,125,164],[70,210,208,202,184,130,179,115],[134,191,151,31,93,68,204,190],[148,22,66,198,172,94,71,2],[6,18,54,162,64,192,154,40],[120,149,25,75,14,42,126,167],[79,26,78,23,69,207,199,175],[103,98,83,38,114,131,182,124],[161,61,183,127,170,88,53,159],[55,165,73,8,24,72,5,15],[45,135,194,160,58,174,100,89]],P.FINDER_PAT_A=0,P.FINDER_PAT_B=1,P.FINDER_PAT_C=2,P.FINDER_PAT_D=3,P.FINDER_PAT_E=4,P.FINDER_PAT_F=5,P.FINDER_PATTERN_SEQUENCES=[[P.FINDER_PAT_A,P.FINDER_PAT_A],[P.FINDER_PAT_A,P.FINDER_PAT_B,P.FINDER_PAT_B],[P.FINDER_PAT_A,P.FINDER_PAT_C,P.FINDER_PAT_B,P.FINDER_PAT_D],[P.FINDER_PAT_A,P.FINDER_PAT_E,P.FINDER_PAT_B,P.FINDER_PAT_D,P.FINDER_PAT_C],[P.FINDER_PAT_A,P.FINDER_PAT_E,P.FINDER_PAT_B,P.FINDER_PAT_D,P.FINDER_PAT_D,P.FINDER_PAT_F],[P.FINDER_PAT_A,P.FINDER_PAT_E,P.FINDER_PAT_B,P.FINDER_PAT_D,P.FINDER_PAT_E,P.FINDER_PAT_F,P.FINDER_PAT_F],[P.FINDER_PAT_A,P.FINDER_PAT_A,P.FINDER_PAT_B,P.FINDER_PAT_B,P.FINDER_PAT_C,P.FINDER_PAT_C,P.FINDER_PAT_D,P.FINDER_PAT_D],[P.FINDER_PAT_A,P.FINDER_PAT_A,P.FINDER_PAT_B,P.FINDER_PAT_B,P.FINDER_PAT_C,P.FINDER_PAT_C,P.FINDER_PAT_D,P.FINDER_PAT_E,P.FINDER_PAT_E],[P.FINDER_PAT_A,P.FINDER_PAT_A,P.FINDER_PAT_B,P.FINDER_PAT_B,P.FINDER_PAT_C,P.FINDER_PAT_C,P.FINDER_PAT_D,P.FINDER_PAT_E,P.FINDER_PAT_F,P.FINDER_PAT_F],[P.FINDER_PAT_A,P.FINDER_PAT_A,P.FINDER_PAT_B,P.FINDER_PAT_B,P.FINDER_PAT_C,P.FINDER_PAT_D,P.FINDER_PAT_D,P.FINDER_PAT_E,P.FINDER_PAT_E,P.FINDER_PAT_F,P.FINDER_PAT_F]],P.MAX_PAIRS=11;class Qo extends Wi{constructor(e,t,i){super(e,t),this.count=0,this.finderPattern=i}getFinderPattern(){return this.finderPattern}getCount(){return this.count}incrementCount(){this.count++}}class Ue extends at{constructor(){super(...arguments),this.possibleLeftPairs=[],this.possibleRightPairs=[]}decodeRow(e,t,i){const r=this.decodePair(t,!1,e,i);Ue.addOrTally(this.possibleLeftPairs,r),t.reverse();let s=this.decodePair(t,!0,e,i);Ue.addOrTally(this.possibleRightPairs,s),t.reverse();for(let l of this.possibleLeftPairs)if(l.getCount()>1){for(let c of this.possibleRightPairs)if(c.getCount()>1&&Ue.checkChecksum(l,c))return Ue.constructResult(l,c)}throw new D}static addOrTally(e,t){if(t==null)return;let i=!1;for(let r of e)if(r.getValue()===t.getValue()){r.incrementCount(),i=!0;break}i||e.push(t)}reset(){this.possibleLeftPairs.length=0,this.possibleRightPairs.length=0}static constructResult(e,t){let i=4537077*e.getValue()+t.getValue(),r=new String(i).toString(),s=new ae;for(let f=13-r.length;f>0;f--)s.append("0");s.append(r);let l=0;for(let f=0;f<13;f++){let p=s.charAt(f).charCodeAt(0)-48;l+=f&1?p:3*p}l=10-l%10,l===10&&(l=0),s.append(l.toString());let c=e.getFinderPattern().getResultPoints(),h=t.getFinderPattern().getResultPoints();return new dt(s.toString(),null,0,[c[0],c[1],h[0],h[1]],Q.RSS_14,new Date().getTime())}static checkChecksum(e,t){let i=(e.getChecksumPortion()+16*t.getChecksumPortion())%79,r=9*e.getFinderPattern().getValue()+t.getFinderPattern().getValue();return r>72&&r--,r>8&&r--,i===r}decodePair(e,t,i,r){try{let s=this.findFinderPattern(e,t),l=this.parseFoundFinderPattern(e,i,t,s),c=r==null?null:r.get(be.NEED_RESULT_POINT_CALLBACK);if(c!=null){let p=(s[0]+s[1])/2;t&&(p=e.getSize()-1-p),c.foundPossibleResultPoint(new j(p,i))}let h=this.decodeDataCharacter(e,l,!0),f=this.decodeDataCharacter(e,l,!1);return new Qo(1597*h.getValue()+f.getValue(),h.getChecksumPortion()+4*f.getChecksumPortion(),l)}catch{return null}}decodeDataCharacter(e,t,i){let r=this.getDataCharacterCounters();for(let T=0;T<r.length;T++)r[T]=0;if(i)We.recordPatternInReverse(e,t.getStartEnd()[0],r);else{We.recordPattern(e,t.getStartEnd()[1]+1,r);for(let T=0,R=r.length-1;T<R;T++,R--){let U=r[T];r[T]=r[R],r[R]=U}}let s=i?16:15,l=me.sum(new Int32Array(r))/s,c=this.getOddCounts(),h=this.getEvenCounts(),f=this.getOddRoundingErrors(),p=this.getEvenRoundingErrors();for(let T=0;T<r.length;T++){let R=r[T]/l,U=Math.floor(R+.5);U<1?U=1:U>8&&(U=8);let $=Math.floor(T/2);T&1?(h[$]=U,p[$]=R-U):(c[$]=U,f[$]=R-U)}this.adjustOddEvenCounts(i,s);let b=0,w=0;for(let T=c.length-1;T>=0;T--)w*=9,w+=c[T],b+=c[T];let y=0,E=0;for(let T=h.length-1;T>=0;T--)y*=9,y+=h[T],E+=h[T];let S=w+3*y;if(i){if(b&1||b>12||b<4)throw new D;let T=(12-b)/2,R=Ue.OUTSIDE_ODD_WIDEST[T],U=9-R,$=Ut.getRSSvalue(c,R,!1),L=Ut.getRSSvalue(h,U,!0),ue=Ue.OUTSIDE_EVEN_TOTAL_SUBSET[T],ne=Ue.OUTSIDE_GSUM[T];return new Wi($*ue+L+ne,S)}else{if(E&1||E>10||E<4)throw new D;let T=(10-E)/2,R=Ue.INSIDE_ODD_WIDEST[T],U=9-R,$=Ut.getRSSvalue(c,R,!0),L=Ut.getRSSvalue(h,U,!1),ue=Ue.INSIDE_ODD_TOTAL_SUBSET[T],ne=Ue.INSIDE_GSUM[T];return new Wi(L*ue+$+ne,S)}}findFinderPattern(e,t){let i=this.getDecodeFinderCounters();i[0]=0,i[1]=0,i[2]=0,i[3]=0;let r=e.getSize(),s=!1,l=0;for(;l<r&&(s=!e.get(l),t!==s);)l++;let c=0,h=l;for(let f=l;f<r;f++)if(e.get(f)!==s)i[c]++;else{if(c===3){if(at.isFinderPattern(i))return[h,f];h+=i[0]+i[1],i[0]=i[2],i[1]=i[3],i[2]=0,i[3]=0,c--}else c++;i[c]=1,s=!s}throw new D}parseFoundFinderPattern(e,t,i,r){let s=e.get(r[0]),l=r[0]-1;for(;l>=0&&s!==e.get(l);)l--;l++;const c=r[0]-l,h=this.getDecodeFinderCounters(),f=new Int32Array(h.length);te.arraycopy(h,0,f,1,h.length-1),f[0]=c;const p=this.parseFinderValue(f,Ue.FINDER_PATTERNS);let b=l,w=r[1];return i&&(b=e.getSize()-1-b,w=e.getSize()-1-w),new Yr(p,[l,r[1]],b,w,t)}adjustOddEvenCounts(e,t){let i=me.sum(new Int32Array(this.getOddCounts())),r=me.sum(new Int32Array(this.getEvenCounts())),s=!1,l=!1,c=!1,h=!1;e?(i>12?l=!0:i<4&&(s=!0),r>12?h=!0:r<4&&(c=!0)):(i>11?l=!0:i<5&&(s=!0),r>10?h=!0:r<4&&(c=!0));let f=i+r-t,p=(i&1)===(e?1:0),b=(r&1)===1;if(f===1)if(p){if(b)throw new D;l=!0}else{if(!b)throw new D;h=!0}else if(f===-1)if(p){if(b)throw new D;s=!0}else{if(!b)throw new D;c=!0}else if(f===0){if(p){if(!b)throw new D;i<r?(s=!0,h=!0):(l=!0,c=!0)}else if(b)throw new D}else throw new D;if(s){if(l)throw new D;at.increment(this.getOddCounts(),this.getOddRoundingErrors())}if(l&&at.decrement(this.getOddCounts(),this.getOddRoundingErrors()),c){if(h)throw new D;at.increment(this.getEvenCounts(),this.getOddRoundingErrors())}h&&at.decrement(this.getEvenCounts(),this.getEvenRoundingErrors())}}Ue.OUTSIDE_EVEN_TOTAL_SUBSET=[1,10,34,70,126],Ue.INSIDE_ODD_TOTAL_SUBSET=[4,20,48,81],Ue.OUTSIDE_GSUM=[0,161,961,2015,2715],Ue.INSIDE_GSUM=[0,336,1036,1516],Ue.OUTSIDE_ODD_WIDEST=[8,6,4,3,1],Ue.INSIDE_ODD_WIDEST=[2,4,6,8],Ue.FINDER_PATTERNS=[Int32Array.from([3,8,2,1]),Int32Array.from([3,5,5,1]),Int32Array.from([3,3,7,1]),Int32Array.from([3,1,9,1]),Int32Array.from([2,7,4,1]),Int32Array.from([2,5,6,1]),Int32Array.from([2,3,8,1]),Int32Array.from([1,5,7,1]),Int32Array.from([1,3,9,1])];class Ki extends We{constructor(e,t){super(),this.readers=[],this.verbose=t===!0;const i=e?e.get(be.POSSIBLE_FORMATS):null,r=e&&e.get(be.ASSUME_CODE_39_CHECK_DIGIT)!==void 0;i?((i.includes(Q.EAN_13)||i.includes(Q.UPC_A)||i.includes(Q.EAN_8)||i.includes(Q.UPC_E))&&this.readers.push(new Rn(e)),i.includes(Q.CODE_39)&&this.readers.push(new Xe(r)),i.includes(Q.CODE_128)&&this.readers.push(new V),i.includes(Q.ITF)&&this.readers.push(new Ee),i.includes(Q.RSS_14)&&this.readers.push(new Ue),i.includes(Q.RSS_EXPANDED)&&this.readers.push(new P(this.verbose))):(this.readers.push(new Rn(e)),this.readers.push(new Xe),this.readers.push(new Rn(e)),this.readers.push(new V),this.readers.push(new Ee),this.readers.push(new Ue),this.readers.push(new P(this.verbose)))}decodeRow(e,t,i){for(let r=0;r<this.readers.length;r++)try{return this.readers[r].decodeRow(e,t,i)}catch{}throw new D}reset(){this.readers.forEach(e=>e.reset())}}class Jo extends Ci{constructor(e=500,t){super(new Ki(t),e,t)}}class ye{constructor(e,t,i){this.ecCodewords=e,this.ecBlocks=[t],i&&this.ecBlocks.push(i)}getECCodewords(){return this.ecCodewords}getECBlocks(){return this.ecBlocks}}class ve{constructor(e,t){this.count=e,this.dataCodewords=t}getCount(){return this.count}getDataCodewords(){return this.dataCodewords}}class fe{constructor(e,t,i,r,s,l){this.versionNumber=e,this.symbolSizeRows=t,this.symbolSizeColumns=i,this.dataRegionSizeRows=r,this.dataRegionSizeColumns=s,this.ecBlocks=l;let c=0;const h=l.getECCodewords(),f=l.getECBlocks();for(let p of f)c+=p.getCount()*(p.getDataCodewords()+h);this.totalCodewords=c}getVersionNumber(){return this.versionNumber}getSymbolSizeRows(){return this.symbolSizeRows}getSymbolSizeColumns(){return this.symbolSizeColumns}getDataRegionSizeRows(){return this.dataRegionSizeRows}getDataRegionSizeColumns(){return this.dataRegionSizeColumns}getTotalCodewords(){return this.totalCodewords}getECBlocks(){return this.ecBlocks}static getVersionForDimensions(e,t){if(e&1||t&1)throw new z;for(let i of fe.VERSIONS)if(i.symbolSizeRows===e&&i.symbolSizeColumns===t)return i;throw new z}toString(){return""+this.versionNumber}static buildVersions(){return[new fe(1,10,10,8,8,new ye(5,new ve(1,3))),new fe(2,12,12,10,10,new ye(7,new ve(1,5))),new fe(3,14,14,12,12,new ye(10,new ve(1,8))),new fe(4,16,16,14,14,new ye(12,new ve(1,12))),new fe(5,18,18,16,16,new ye(14,new ve(1,18))),new fe(6,20,20,18,18,new ye(18,new ve(1,22))),new fe(7,22,22,20,20,new ye(20,new ve(1,30))),new fe(8,24,24,22,22,new ye(24,new ve(1,36))),new fe(9,26,26,24,24,new ye(28,new ve(1,44))),new fe(10,32,32,14,14,new ye(36,new ve(1,62))),new fe(11,36,36,16,16,new ye(42,new ve(1,86))),new fe(12,40,40,18,18,new ye(48,new ve(1,114))),new fe(13,44,44,20,20,new ye(56,new ve(1,144))),new fe(14,48,48,22,22,new ye(68,new ve(1,174))),new fe(15,52,52,24,24,new ye(42,new ve(2,102))),new fe(16,64,64,14,14,new ye(56,new ve(2,140))),new fe(17,72,72,16,16,new ye(36,new ve(4,92))),new fe(18,80,80,18,18,new ye(48,new ve(4,114))),new fe(19,88,88,20,20,new ye(56,new ve(4,144))),new fe(20,96,96,22,22,new ye(68,new ve(4,174))),new fe(21,104,104,24,24,new ye(56,new ve(6,136))),new fe(22,120,120,18,18,new ye(68,new ve(6,175))),new fe(23,132,132,20,20,new ye(62,new ve(8,163))),new fe(24,144,144,22,22,new ye(62,new ve(8,156),new ve(2,155))),new fe(25,8,18,6,16,new ye(7,new ve(1,5))),new fe(26,8,32,6,14,new ye(11,new ve(1,10))),new fe(27,12,26,10,24,new ye(14,new ve(1,16))),new fe(28,12,36,10,16,new ye(18,new ve(1,22))),new fe(29,16,36,14,16,new ye(24,new ve(1,32))),new fe(30,16,48,14,22,new ye(28,new ve(1,49)))]}}fe.VERSIONS=fe.buildVersions();class Pn{constructor(e){const t=e.getHeight();if(t<8||t>144||t&1)throw new z;this.version=Pn.readVersion(e),this.mappingBitMatrix=this.extractDataRegion(e),this.readMappingMatrix=new Me(this.mappingBitMatrix.getWidth(),this.mappingBitMatrix.getHeight())}getVersion(){return this.version}static readVersion(e){const t=e.getHeight(),i=e.getWidth();return fe.getVersionForDimensions(t,i)}readCodewords(){const e=new Int8Array(this.version.getTotalCodewords());let t=0,i=4,r=0;const s=this.mappingBitMatrix.getHeight(),l=this.mappingBitMatrix.getWidth();let c=!1,h=!1,f=!1,p=!1;do if(i===s&&r===0&&!c)e[t++]=this.readCorner1(s,l)&255,i-=2,r+=2,c=!0;else if(i===s-2&&r===0&&l&3&&!h)e[t++]=this.readCorner2(s,l)&255,i-=2,r+=2,h=!0;else if(i===s+4&&r===2&&!(l&7)&&!f)e[t++]=this.readCorner3(s,l)&255,i-=2,r+=2,f=!0;else if(i===s-2&&r===0&&(l&7)===4&&!p)e[t++]=this.readCorner4(s,l)&255,i-=2,r+=2,p=!0;else{do i<s&&r>=0&&!this.readMappingMatrix.get(r,i)&&(e[t++]=this.readUtah(i,r,s,l)&255),i-=2,r+=2;while(i>=0&&r<l);i+=1,r+=3;do i>=0&&r<l&&!this.readMappingMatrix.get(r,i)&&(e[t++]=this.readUtah(i,r,s,l)&255),i+=2,r-=2;while(i<s&&r>=0);i+=3,r+=1}while(i<s||r<l);if(t!==this.version.getTotalCodewords())throw new z;return e}readModule(e,t,i,r){return e<0&&(e+=i,t+=4-(i+4&7)),t<0&&(t+=r,e+=4-(r+4&7)),this.readMappingMatrix.set(t,e),this.mappingBitMatrix.get(t,e)}readUtah(e,t,i,r){let s=0;return this.readModule(e-2,t-2,i,r)&&(s|=1),s<<=1,this.readModule(e-2,t-1,i,r)&&(s|=1),s<<=1,this.readModule(e-1,t-2,i,r)&&(s|=1),s<<=1,this.readModule(e-1,t-1,i,r)&&(s|=1),s<<=1,this.readModule(e-1,t,i,r)&&(s|=1),s<<=1,this.readModule(e,t-2,i,r)&&(s|=1),s<<=1,this.readModule(e,t-1,i,r)&&(s|=1),s<<=1,this.readModule(e,t,i,r)&&(s|=1),s}readCorner1(e,t){let i=0;return this.readModule(e-1,0,e,t)&&(i|=1),i<<=1,this.readModule(e-1,1,e,t)&&(i|=1),i<<=1,this.readModule(e-1,2,e,t)&&(i|=1),i<<=1,this.readModule(0,t-2,e,t)&&(i|=1),i<<=1,this.readModule(0,t-1,e,t)&&(i|=1),i<<=1,this.readModule(1,t-1,e,t)&&(i|=1),i<<=1,this.readModule(2,t-1,e,t)&&(i|=1),i<<=1,this.readModule(3,t-1,e,t)&&(i|=1),i}readCorner2(e,t){let i=0;return this.readModule(e-3,0,e,t)&&(i|=1),i<<=1,this.readModule(e-2,0,e,t)&&(i|=1),i<<=1,this.readModule(e-1,0,e,t)&&(i|=1),i<<=1,this.readModule(0,t-4,e,t)&&(i|=1),i<<=1,this.readModule(0,t-3,e,t)&&(i|=1),i<<=1,this.readModule(0,t-2,e,t)&&(i|=1),i<<=1,this.readModule(0,t-1,e,t)&&(i|=1),i<<=1,this.readModule(1,t-1,e,t)&&(i|=1),i}readCorner3(e,t){let i=0;return this.readModule(e-1,0,e,t)&&(i|=1),i<<=1,this.readModule(e-1,t-1,e,t)&&(i|=1),i<<=1,this.readModule(0,t-3,e,t)&&(i|=1),i<<=1,this.readModule(0,t-2,e,t)&&(i|=1),i<<=1,this.readModule(0,t-1,e,t)&&(i|=1),i<<=1,this.readModule(1,t-3,e,t)&&(i|=1),i<<=1,this.readModule(1,t-2,e,t)&&(i|=1),i<<=1,this.readModule(1,t-1,e,t)&&(i|=1),i}readCorner4(e,t){let i=0;return this.readModule(e-3,0,e,t)&&(i|=1),i<<=1,this.readModule(e-2,0,e,t)&&(i|=1),i<<=1,this.readModule(e-1,0,e,t)&&(i|=1),i<<=1,this.readModule(0,t-2,e,t)&&(i|=1),i<<=1,this.readModule(0,t-1,e,t)&&(i|=1),i<<=1,this.readModule(1,t-1,e,t)&&(i|=1),i<<=1,this.readModule(2,t-1,e,t)&&(i|=1),i<<=1,this.readModule(3,t-1,e,t)&&(i|=1),i}extractDataRegion(e){const t=this.version.getSymbolSizeRows(),i=this.version.getSymbolSizeColumns();if(e.getHeight()!==t)throw new I("Dimension of bitMatrix must match the version size");const r=this.version.getDataRegionSizeRows(),s=this.version.getDataRegionSizeColumns(),l=t/r|0,c=i/s|0,h=l*r,f=c*s,p=new Me(f,h);for(let b=0;b<l;++b){const w=b*r;for(let y=0;y<c;++y){const E=y*s;for(let S=0;S<r;++S){const T=b*(r+2)+1+S,R=w+S;for(let U=0;U<s;++U){const $=y*(s+2)+1+U;if(e.get($,T)){const L=E+U;p.set(L,R)}}}}}return p}}class Bn{constructor(e,t){this.numDataCodewords=e,this.codewords=t}static getDataBlocks(e,t){const i=t.getECBlocks();let r=0;const s=i.getECBlocks();for(let S of s)r+=S.getCount();const l=new Array(r);let c=0;for(let S of s)for(let T=0;T<S.getCount();T++){const R=S.getDataCodewords(),U=i.getECCodewords()+R;l[c++]=new Bn(R,new Uint8Array(U))}const f=l[0].codewords.length-i.getECCodewords(),p=f-1;let b=0;for(let S=0;S<p;S++)for(let T=0;T<c;T++)l[T].codewords[S]=e[b++];const w=t.getVersionNumber()===24,y=w?8:c;for(let S=0;S<y;S++)l[S].codewords[f-1]=e[b++];const E=l[0].codewords.length;for(let S=f;S<E;S++)for(let T=0;T<c;T++){const R=w?(T+8)%c:T,U=w&&R>7?S-1:S;l[R].codewords[U]=e[b++]}if(b!==e.length)throw new I;return l}getNumDataCodewords(){return this.numDataCodewords}getCodewords(){return this.codewords}}class Ln{constructor(e){this.bytes=e,this.byteOffset=0,this.bitOffset=0}getBitOffset(){return this.bitOffset}getByteOffset(){return this.byteOffset}readBits(e){if(e<1||e>32||e>this.available())throw new I(""+e);let t=0,i=this.bitOffset,r=this.byteOffset;const s=this.bytes;if(i>0){const l=8-i,c=e<l?e:l,h=l-c,f=255>>8-c<<h;t=(s[r]&f)>>h,e-=c,i+=c,i===8&&(i=0,r++)}if(e>0){for(;e>=8;)t=t<<8|s[r]&255,r++,e-=8;if(e>0){const l=8-e,c=255>>l<<l;t=t<<e|(s[r]&c)>>l,i+=e}}return this.bitOffset=i,this.byteOffset=r,t}available(){return 8*(this.bytes.length-this.byteOffset)-this.bitOffset}}var je;(function(x){x[x.PAD_ENCODE=0]="PAD_ENCODE",x[x.ASCII_ENCODE=1]="ASCII_ENCODE",x[x.C40_ENCODE=2]="C40_ENCODE",x[x.TEXT_ENCODE=3]="TEXT_ENCODE",x[x.ANSIX12_ENCODE=4]="ANSIX12_ENCODE",x[x.EDIFACT_ENCODE=5]="EDIFACT_ENCODE",x[x.BASE256_ENCODE=6]="BASE256_ENCODE"})(je||(je={}));class li{static decode(e){const t=new Ln(e),i=new ae,r=new ae,s=new Array;let l=je.ASCII_ENCODE;do if(l===je.ASCII_ENCODE)l=this.decodeAsciiSegment(t,i,r);else{switch(l){case je.C40_ENCODE:this.decodeC40Segment(t,i);break;case je.TEXT_ENCODE:this.decodeTextSegment(t,i);break;case je.ANSIX12_ENCODE:this.decodeAnsiX12Segment(t,i);break;case je.EDIFACT_ENCODE:this.decodeEdifactSegment(t,i);break;case je.BASE256_ENCODE:this.decodeBase256Segment(t,i,s);break;default:throw new z}l=je.ASCII_ENCODE}while(l!==je.PAD_ENCODE&&t.available()>0);return r.length()>0&&i.append(r.toString()),new mr(e,i.toString(),s.length===0?null:s,null)}static decodeAsciiSegment(e,t,i){let r=!1;do{let s=e.readBits(8);if(s===0)throw new z;if(s<=128)return r&&(s+=128),t.append(String.fromCharCode(s-1)),je.ASCII_ENCODE;if(s===129)return je.PAD_ENCODE;if(s<=229){const l=s-130;l<10&&t.append("0"),t.append(""+l)}else switch(s){case 230:return je.C40_ENCODE;case 231:return je.BASE256_ENCODE;case 232:t.append("");break;case 233:case 234:break;case 235:r=!0;break;case 236:t.append("[)>05"),i.insert(0,"");break;case 237:t.append("[)>06"),i.insert(0,"");break;case 238:return je.ANSIX12_ENCODE;case 239:return je.TEXT_ENCODE;case 240:return je.EDIFACT_ENCODE;case 241:break;default:if(s!==254||e.available()!==0)throw new z;break}}while(e.available()>0);return je.ASCII_ENCODE}static decodeC40Segment(e,t){let i=!1;const r=[];let s=0;do{if(e.available()===8)return;const l=e.readBits(8);if(l===254)return;this.parseTwoBytes(l,e.readBits(8),r);for(let c=0;c<3;c++){const h=r[c];switch(s){case 0:if(h<3)s=h+1;else if(h<this.C40_BASIC_SET_CHARS.length){const f=this.C40_BASIC_SET_CHARS[h];i?(t.append(String.fromCharCode(f.charCodeAt(0)+128)),i=!1):t.append(f)}else throw new z;break;case 1:i?(t.append(String.fromCharCode(h+128)),i=!1):t.append(String.fromCharCode(h)),s=0;break;case 2:if(h<this.C40_SHIFT2_SET_CHARS.length){const f=this.C40_SHIFT2_SET_CHARS[h];i?(t.append(String.fromCharCode(f.charCodeAt(0)+128)),i=!1):t.append(f)}else switch(h){case 27:t.append("");break;case 30:i=!0;break;default:throw new z}s=0;break;case 3:i?(t.append(String.fromCharCode(h+224)),i=!1):t.append(String.fromCharCode(h+96)),s=0;break;default:throw new z}}}while(e.available()>0)}static decodeTextSegment(e,t){let i=!1,r=[],s=0;do{if(e.available()===8)return;const l=e.readBits(8);if(l===254)return;this.parseTwoBytes(l,e.readBits(8),r);for(let c=0;c<3;c++){const h=r[c];switch(s){case 0:if(h<3)s=h+1;else if(h<this.TEXT_BASIC_SET_CHARS.length){const f=this.TEXT_BASIC_SET_CHARS[h];i?(t.append(String.fromCharCode(f.charCodeAt(0)+128)),i=!1):t.append(f)}else throw new z;break;case 1:i?(t.append(String.fromCharCode(h+128)),i=!1):t.append(String.fromCharCode(h)),s=0;break;case 2:if(h<this.TEXT_SHIFT2_SET_CHARS.length){const f=this.TEXT_SHIFT2_SET_CHARS[h];i?(t.append(String.fromCharCode(f.charCodeAt(0)+128)),i=!1):t.append(f)}else switch(h){case 27:t.append("");break;case 30:i=!0;break;default:throw new z}s=0;break;case 3:if(h<this.TEXT_SHIFT3_SET_CHARS.length){const f=this.TEXT_SHIFT3_SET_CHARS[h];i?(t.append(String.fromCharCode(f.charCodeAt(0)+128)),i=!1):t.append(f),s=0}else throw new z;break;default:throw new z}}}while(e.available()>0)}static decodeAnsiX12Segment(e,t){const i=[];do{if(e.available()===8)return;const r=e.readBits(8);if(r===254)return;this.parseTwoBytes(r,e.readBits(8),i);for(let s=0;s<3;s++){const l=i[s];switch(l){case 0:t.append("\r");break;case 1:t.append("*");break;case 2:t.append(">");break;case 3:t.append(" ");break;default:if(l<14)t.append(String.fromCharCode(l+44));else if(l<40)t.append(String.fromCharCode(l+51));else throw new z;break}}}while(e.available()>0)}static parseTwoBytes(e,t,i){let r=(e<<8)+t-1,s=Math.floor(r/1600);i[0]=s,r-=s*1600,s=Math.floor(r/40),i[1]=s,i[2]=r-s*40}static decodeEdifactSegment(e,t){do{if(e.available()<=16)return;for(let i=0;i<4;i++){let r=e.readBits(6);if(r===31){const s=8-e.getBitOffset();s!==8&&e.readBits(s);return}r&32||(r|=64),t.append(String.fromCharCode(r))}}while(e.available()>0)}static decodeBase256Segment(e,t,i){let r=1+e.getByteOffset();const s=this.unrandomize255State(e.readBits(8),r++);let l;if(s===0?l=e.available()/8|0:s<250?l=s:l=250*(s-249)+this.unrandomize255State(e.readBits(8),r++),l<0)throw new z;const c=new Uint8Array(l);for(let h=0;h<l;h++){if(e.available()<8)throw new z;c[h]=this.unrandomize255State(e.readBits(8),r++)}i.push(c);try{t.append(De.decode(c,Y.ISO88591))}catch(h){throw new Ft("Platform does not support required encoding: "+h.message)}}static unrandomize255State(e,t){const i=149*t%255+1,r=e-i;return r>=0?r:r+256}}li.C40_BASIC_SET_CHARS=["*","*","*"," ","0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],li.C40_SHIFT2_SET_CHARS=["!",'"',"#","$","%","&","'","(",")","*","+",",","-",".","/",":",";","<","=",">","?","@","[","\\","]","^","_"],li.TEXT_BASIC_SET_CHARS=["*","*","*"," ","0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"],li.TEXT_SHIFT2_SET_CHARS=li.C40_SHIFT2_SET_CHARS,li.TEXT_SHIFT3_SET_CHARS=["`","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","{","|","}","~",""];class el{constructor(){this.rsDecoder=new br(we.DATA_MATRIX_FIELD_256)}decode(e){const t=new Pn(e),i=t.getVersion(),r=t.readCodewords(),s=Bn.getDataBlocks(r,i);let l=0;for(let f of s)l+=f.getNumDataCodewords();const c=new Uint8Array(l),h=s.length;for(let f=0;f<h;f++){const p=s[f],b=p.getCodewords(),w=p.getNumDataCodewords();this.correctErrors(b,w);for(let y=0;y<w;y++)c[y*h+f]=b[y]}return li.decode(c)}correctErrors(e,t){const i=new Int32Array(e);try{this.rsDecoder.decode(i,e.length-t)}catch{throw new X}for(let r=0;r<t;r++)e[r]=i[r]}}class Ve{constructor(e){this.image=e,this.rectangleDetector=new jt(this.image)}detect(){const e=this.rectangleDetector.detect();let t=this.detectSolid1(e);if(t=this.detectSolid2(t),t[3]=this.correctTopRight(t),!t[3])throw new D;t=this.shiftToModuleCenter(t);const i=t[0],r=t[1],s=t[2],l=t[3];let c=this.transitionsBetween(i,l)+1,h=this.transitionsBetween(s,l)+1;(c&1)===1&&(c+=1),(h&1)===1&&(h+=1),4*c<7*h&&4*h<7*c&&(c=h=Math.max(c,h));let f=Ve.sampleGrid(this.image,i,r,s,l,c,h);return new Kr(f,[i,r,s,l])}static shiftPoint(e,t,i){let r=(t.getX()-e.getX())/(i+1),s=(t.getY()-e.getY())/(i+1);return new j(e.getX()+r,e.getY()+s)}static moveAway(e,t,i){let r=e.getX(),s=e.getY();return r<t?r-=1:r+=1,s<i?s-=1:s+=1,new j(r,s)}detectSolid1(e){let t=e[0],i=e[1],r=e[3],s=e[2],l=this.transitionsBetween(t,i),c=this.transitionsBetween(i,r),h=this.transitionsBetween(r,s),f=this.transitionsBetween(s,t),p=l,b=[s,t,i,r];return p>c&&(p=c,b[0]=t,b[1]=i,b[2]=r,b[3]=s),p>h&&(p=h,b[0]=i,b[1]=r,b[2]=s,b[3]=t),p>f&&(b[0]=r,b[1]=s,b[2]=t,b[3]=i),b}detectSolid2(e){let t=e[0],i=e[1],r=e[2],s=e[3],l=this.transitionsBetween(t,s),c=Ve.shiftPoint(i,r,(l+1)*4),h=Ve.shiftPoint(r,i,(l+1)*4),f=this.transitionsBetween(c,t),p=this.transitionsBetween(h,s);return f<p?(e[0]=t,e[1]=i,e[2]=r,e[3]=s):(e[0]=i,e[1]=r,e[2]=s,e[3]=t),e}correctTopRight(e){let t=e[0],i=e[1],r=e[2],s=e[3],l=this.transitionsBetween(t,s),c=this.transitionsBetween(i,s),h=Ve.shiftPoint(t,i,(c+1)*4),f=Ve.shiftPoint(r,i,(l+1)*4);l=this.transitionsBetween(h,s),c=this.transitionsBetween(f,s);let p=new j(s.getX()+(r.getX()-i.getX())/(l+1),s.getY()+(r.getY()-i.getY())/(l+1)),b=new j(s.getX()+(t.getX()-i.getX())/(c+1),s.getY()+(t.getY()-i.getY())/(c+1));if(!this.isValid(p))return this.isValid(b)?b:null;if(!this.isValid(b))return p;let w=this.transitionsBetween(h,p)+this.transitionsBetween(f,p),y=this.transitionsBetween(h,b)+this.transitionsBetween(f,b);return w>y?p:b}shiftToModuleCenter(e){let t=e[0],i=e[1],r=e[2],s=e[3],l=this.transitionsBetween(t,s)+1,c=this.transitionsBetween(r,s)+1,h=Ve.shiftPoint(t,i,c*4),f=Ve.shiftPoint(r,i,l*4);l=this.transitionsBetween(h,s)+1,c=this.transitionsBetween(f,s)+1,(l&1)===1&&(l+=1),(c&1)===1&&(c+=1);let p=(t.getX()+i.getX()+r.getX()+s.getX())/4,b=(t.getY()+i.getY()+r.getY()+s.getY())/4;t=Ve.moveAway(t,p,b),i=Ve.moveAway(i,p,b),r=Ve.moveAway(r,p,b),s=Ve.moveAway(s,p,b);let w,y;return h=Ve.shiftPoint(t,i,c*4),h=Ve.shiftPoint(h,s,l*4),w=Ve.shiftPoint(i,t,c*4),w=Ve.shiftPoint(w,r,l*4),f=Ve.shiftPoint(r,s,c*4),f=Ve.shiftPoint(f,i,l*4),y=Ve.shiftPoint(s,r,c*4),y=Ve.shiftPoint(y,t,l*4),[h,w,f,y]}isValid(e){return e.getX()>=0&&e.getX()<this.image.getWidth()&&e.getY()>0&&e.getY()<this.image.getHeight()}static sampleGrid(e,t,i,r,s,l,c){return ai.getInstance().sampleGrid(e,l,c,.5,.5,l-.5,.5,l-.5,c-.5,.5,c-.5,t.getX(),t.getY(),s.getX(),s.getY(),r.getX(),r.getY(),i.getX(),i.getY())}transitionsBetween(e,t){let i=Math.trunc(e.getX()),r=Math.trunc(e.getY()),s=Math.trunc(t.getX()),l=Math.trunc(t.getY()),c=Math.abs(l-r)>Math.abs(s-i);if(c){let S=i;i=r,r=S,S=s,s=l,l=S}let h=Math.abs(s-i),f=Math.abs(l-r),p=-h/2,b=r<l?1:-1,w=i<s?1:-1,y=0,E=this.image.get(c?r:i,c?i:r);for(let S=i,T=r;S!==s;S+=w){let R=this.image.get(c?T:S,c?S:T);if(R!==E&&(y++,E=R),p+=f,p>0){if(T===l)break;T+=b,p-=h}}return y}}class ci{constructor(){this.decoder=new el}decode(e,t=null){let i,r;if(t!=null&&t.has(be.PURE_BARCODE)){const f=ci.extractPureBits(e.getBlackMatrix());i=this.decoder.decode(f),r=ci.NO_POINTS}else{const f=new Ve(e.getBlackMatrix()).detect();i=this.decoder.decode(f.getBits()),r=f.getPoints()}const s=i.getRawBytes(),l=new dt(i.getText(),s,8*s.length,r,Q.DATA_MATRIX,te.currentTimeMillis()),c=i.getByteSegments();c!=null&&l.putMetadata(Ye.BYTE_SEGMENTS,c);const h=i.getECLevel();return h!=null&&l.putMetadata(Ye.ERROR_CORRECTION_LEVEL,h),l}reset(){}static extractPureBits(e){const t=e.getTopLeftOnBit(),i=e.getBottomRightOnBit();if(t==null||i==null)throw new D;const r=this.moduleSize(t,e);let s=t[1];const l=i[1];let c=t[0];const f=(i[0]-c+1)/r,p=(l-s+1)/r;if(f<=0||p<=0)throw new D;const b=r/2;s+=b,c+=b;const w=new Me(f,p);for(let y=0;y<p;y++){const E=s+y*r;for(let S=0;S<f;S++)e.get(c+S*r,E)&&w.set(S,y)}return w}static moduleSize(e,t){const i=t.getWidth();let r=e[0];const s=e[1];for(;r<i&&t.get(r,s);)r++;if(r===i)throw new D;const l=r-e[0];if(l===0)throw new D;return l}}ci.NO_POINTS=[];class tl extends Ci{constructor(e=500){super(new ci,e)}}var Zi;(function(x){x[x.L=0]="L",x[x.M=1]="M",x[x.Q=2]="Q",x[x.H=3]="H"})(Zi||(Zi={}));class ke{constructor(e,t,i){this.value=e,this.stringValue=t,this.bits=i,ke.FOR_BITS.set(i,this),ke.FOR_VALUE.set(e,this)}getValue(){return this.value}getBits(){return this.bits}static fromString(e){switch(e){case"L":return ke.L;case"M":return ke.M;case"Q":return ke.Q;case"H":return ke.H;default:throw new O(e+"not available")}}toString(){return this.stringValue}equals(e){if(!(e instanceof ke))return!1;const t=e;return this.value===t.value}static forBits(e){if(e<0||e>=ke.FOR_BITS.size)throw new I;return ke.FOR_BITS.get(e)}}ke.FOR_BITS=new Map,ke.FOR_VALUE=new Map,ke.L=new ke(Zi.L,"L",1),ke.M=new ke(Zi.M,"M",0),ke.Q=new ke(Zi.Q,"Q",3),ke.H=new ke(Zi.H,"H",2);class ot{constructor(e){this.errorCorrectionLevel=ke.forBits(e>>3&3),this.dataMask=e&7}static numBitsDiffering(e,t){return K.bitCount(e^t)}static decodeFormatInformation(e,t){const i=ot.doDecodeFormatInformation(e,t);return i!==null?i:ot.doDecodeFormatInformation(e^ot.FORMAT_INFO_MASK_QR,t^ot.FORMAT_INFO_MASK_QR)}static doDecodeFormatInformation(e,t){let i=Number.MAX_SAFE_INTEGER,r=0;for(const s of ot.FORMAT_INFO_DECODE_LOOKUP){const l=s[0];if(l===e||l===t)return new ot(s[1]);let c=ot.numBitsDiffering(e,l);c<i&&(r=s[1],i=c),e!==t&&(c=ot.numBitsDiffering(t,l),c<i&&(r=s[1],i=c))}return i<=3?new ot(r):null}getErrorCorrectionLevel(){return this.errorCorrectionLevel}getDataMask(){return this.dataMask}hashCode(){return this.errorCorrectionLevel.getBits()<<3|this.dataMask}equals(e){if(!(e instanceof ot))return!1;const t=e;return this.errorCorrectionLevel===t.errorCorrectionLevel&&this.dataMask===t.dataMask}}ot.FORMAT_INFO_MASK_QR=21522,ot.FORMAT_INFO_DECODE_LOOKUP=[Int32Array.from([21522,0]),Int32Array.from([20773,1]),Int32Array.from([24188,2]),Int32Array.from([23371,3]),Int32Array.from([17913,4]),Int32Array.from([16590,5]),Int32Array.from([20375,6]),Int32Array.from([19104,7]),Int32Array.from([30660,8]),Int32Array.from([29427,9]),Int32Array.from([32170,10]),Int32Array.from([30877,11]),Int32Array.from([26159,12]),Int32Array.from([25368,13]),Int32Array.from([27713,14]),Int32Array.from([26998,15]),Int32Array.from([5769,16]),Int32Array.from([5054,17]),Int32Array.from([7399,18]),Int32Array.from([6608,19]),Int32Array.from([1890,20]),Int32Array.from([597,21]),Int32Array.from([3340,22]),Int32Array.from([2107,23]),Int32Array.from([13663,24]),Int32Array.from([12392,25]),Int32Array.from([16177,26]),Int32Array.from([14854,27]),Int32Array.from([9396,28]),Int32Array.from([8579,29]),Int32Array.from([11994,30]),Int32Array.from([11245,31])];class N{constructor(e,...t){this.ecCodewordsPerBlock=e,this.ecBlocks=t}getECCodewordsPerBlock(){return this.ecCodewordsPerBlock}getNumBlocks(){let e=0;const t=this.ecBlocks;for(const i of t)e+=i.getCount();return e}getTotalECCodewords(){return this.ecCodewordsPerBlock*this.getNumBlocks()}getECBlocks(){return this.ecBlocks}}class v{constructor(e,t){this.count=e,this.dataCodewords=t}getCount(){return this.count}getDataCodewords(){return this.dataCodewords}}class Z{constructor(e,t,...i){this.versionNumber=e,this.alignmentPatternCenters=t,this.ecBlocks=i;let r=0;const s=i[0].getECCodewordsPerBlock(),l=i[0].getECBlocks();for(const c of l)r+=c.getCount()*(c.getDataCodewords()+s);this.totalCodewords=r}getVersionNumber(){return this.versionNumber}getAlignmentPatternCenters(){return this.alignmentPatternCenters}getTotalCodewords(){return this.totalCodewords}getDimensionForVersion(){return 17+4*this.versionNumber}getECBlocksForLevel(e){return this.ecBlocks[e.getValue()]}static getProvisionalVersionForDimension(e){if(e%4!==1)throw new z;try{return this.getVersionForNumber((e-17)/4)}catch{throw new z}}static getVersionForNumber(e){if(e<1||e>40)throw new I;return Z.VERSIONS[e-1]}static decodeVersionInformation(e){let t=Number.MAX_SAFE_INTEGER,i=0;for(let r=0;r<Z.VERSION_DECODE_INFO.length;r++){const s=Z.VERSION_DECODE_INFO[r];if(s===e)return Z.getVersionForNumber(r+7);const l=ot.numBitsDiffering(e,s);l<t&&(i=r+7,t=l)}return t<=3?Z.getVersionForNumber(i):null}buildFunctionPattern(){const e=this.getDimensionForVersion(),t=new Me(e);t.setRegion(0,0,9,9),t.setRegion(e-8,0,8,9),t.setRegion(0,e-8,9,8);const i=this.alignmentPatternCenters.length;for(let r=0;r<i;r++){const s=this.alignmentPatternCenters[r]-2;for(let l=0;l<i;l++)r===0&&(l===0||l===i-1)||r===i-1&&l===0||t.setRegion(this.alignmentPatternCenters[l]-2,s,5,5)}return t.setRegion(6,9,1,e-17),t.setRegion(9,6,e-17,1),this.versionNumber>6&&(t.setRegion(e-11,0,3,6),t.setRegion(0,e-11,6,3)),t}toString(){return""+this.versionNumber}}Z.VERSION_DECODE_INFO=Int32Array.from([31892,34236,39577,42195,48118,51042,55367,58893,63784,68472,70749,76311,79154,84390,87683,92361,96236,102084,102881,110507,110734,117786,119615,126325,127568,133589,136944,141498,145311,150283,152622,158308,161089,167017]),Z.VERSIONS=[new Z(1,new Int32Array(0),new N(7,new v(1,19)),new N(10,new v(1,16)),new N(13,new v(1,13)),new N(17,new v(1,9))),new Z(2,Int32Array.from([6,18]),new N(10,new v(1,34)),new N(16,new v(1,28)),new N(22,new v(1,22)),new N(28,new v(1,16))),new Z(3,Int32Array.from([6,22]),new N(15,new v(1,55)),new N(26,new v(1,44)),new N(18,new v(2,17)),new N(22,new v(2,13))),new Z(4,Int32Array.from([6,26]),new N(20,new v(1,80)),new N(18,new v(2,32)),new N(26,new v(2,24)),new N(16,new v(4,9))),new Z(5,Int32Array.from([6,30]),new N(26,new v(1,108)),new N(24,new v(2,43)),new N(18,new v(2,15),new v(2,16)),new N(22,new v(2,11),new v(2,12))),new Z(6,Int32Array.from([6,34]),new N(18,new v(2,68)),new N(16,new v(4,27)),new N(24,new v(4,19)),new N(28,new v(4,15))),new Z(7,Int32Array.from([6,22,38]),new N(20,new v(2,78)),new N(18,new v(4,31)),new N(18,new v(2,14),new v(4,15)),new N(26,new v(4,13),new v(1,14))),new Z(8,Int32Array.from([6,24,42]),new N(24,new v(2,97)),new N(22,new v(2,38),new v(2,39)),new N(22,new v(4,18),new v(2,19)),new N(26,new v(4,14),new v(2,15))),new Z(9,Int32Array.from([6,26,46]),new N(30,new v(2,116)),new N(22,new v(3,36),new v(2,37)),new N(20,new v(4,16),new v(4,17)),new N(24,new v(4,12),new v(4,13))),new Z(10,Int32Array.from([6,28,50]),new N(18,new v(2,68),new v(2,69)),new N(26,new v(4,43),new v(1,44)),new N(24,new v(6,19),new v(2,20)),new N(28,new v(6,15),new v(2,16))),new Z(11,Int32Array.from([6,30,54]),new N(20,new v(4,81)),new N(30,new v(1,50),new v(4,51)),new N(28,new v(4,22),new v(4,23)),new N(24,new v(3,12),new v(8,13))),new Z(12,Int32Array.from([6,32,58]),new N(24,new v(2,92),new v(2,93)),new N(22,new v(6,36),new v(2,37)),new N(26,new v(4,20),new v(6,21)),new N(28,new v(7,14),new v(4,15))),new Z(13,Int32Array.from([6,34,62]),new N(26,new v(4,107)),new N(22,new v(8,37),new v(1,38)),new N(24,new v(8,20),new v(4,21)),new N(22,new v(12,11),new v(4,12))),new Z(14,Int32Array.from([6,26,46,66]),new N(30,new v(3,115),new v(1,116)),new N(24,new v(4,40),new v(5,41)),new N(20,new v(11,16),new v(5,17)),new N(24,new v(11,12),new v(5,13))),new Z(15,Int32Array.from([6,26,48,70]),new N(22,new v(5,87),new v(1,88)),new N(24,new v(5,41),new v(5,42)),new N(30,new v(5,24),new v(7,25)),new N(24,new v(11,12),new v(7,13))),new Z(16,Int32Array.from([6,26,50,74]),new N(24,new v(5,98),new v(1,99)),new N(28,new v(7,45),new v(3,46)),new N(24,new v(15,19),new v(2,20)),new N(30,new v(3,15),new v(13,16))),new Z(17,Int32Array.from([6,30,54,78]),new N(28,new v(1,107),new v(5,108)),new N(28,new v(10,46),new v(1,47)),new N(28,new v(1,22),new v(15,23)),new N(28,new v(2,14),new v(17,15))),new Z(18,Int32Array.from([6,30,56,82]),new N(30,new v(5,120),new v(1,121)),new N(26,new v(9,43),new v(4,44)),new N(28,new v(17,22),new v(1,23)),new N(28,new v(2,14),new v(19,15))),new Z(19,Int32Array.from([6,30,58,86]),new N(28,new v(3,113),new v(4,114)),new N(26,new v(3,44),new v(11,45)),new N(26,new v(17,21),new v(4,22)),new N(26,new v(9,13),new v(16,14))),new Z(20,Int32Array.from([6,34,62,90]),new N(28,new v(3,107),new v(5,108)),new N(26,new v(3,41),new v(13,42)),new N(30,new v(15,24),new v(5,25)),new N(28,new v(15,15),new v(10,16))),new Z(21,Int32Array.from([6,28,50,72,94]),new N(28,new v(4,116),new v(4,117)),new N(26,new v(17,42)),new N(28,new v(17,22),new v(6,23)),new N(30,new v(19,16),new v(6,17))),new Z(22,Int32Array.from([6,26,50,74,98]),new N(28,new v(2,111),new v(7,112)),new N(28,new v(17,46)),new N(30,new v(7,24),new v(16,25)),new N(24,new v(34,13))),new Z(23,Int32Array.from([6,30,54,78,102]),new N(30,new v(4,121),new v(5,122)),new N(28,new v(4,47),new v(14,48)),new N(30,new v(11,24),new v(14,25)),new N(30,new v(16,15),new v(14,16))),new Z(24,Int32Array.from([6,28,54,80,106]),new N(30,new v(6,117),new v(4,118)),new N(28,new v(6,45),new v(14,46)),new N(30,new v(11,24),new v(16,25)),new N(30,new v(30,16),new v(2,17))),new Z(25,Int32Array.from([6,32,58,84,110]),new N(26,new v(8,106),new v(4,107)),new N(28,new v(8,47),new v(13,48)),new N(30,new v(7,24),new v(22,25)),new N(30,new v(22,15),new v(13,16))),new Z(26,Int32Array.from([6,30,58,86,114]),new N(28,new v(10,114),new v(2,115)),new N(28,new v(19,46),new v(4,47)),new N(28,new v(28,22),new v(6,23)),new N(30,new v(33,16),new v(4,17))),new Z(27,Int32Array.from([6,34,62,90,118]),new N(30,new v(8,122),new v(4,123)),new N(28,new v(22,45),new v(3,46)),new N(30,new v(8,23),new v(26,24)),new N(30,new v(12,15),new v(28,16))),new Z(28,Int32Array.from([6,26,50,74,98,122]),new N(30,new v(3,117),new v(10,118)),new N(28,new v(3,45),new v(23,46)),new N(30,new v(4,24),new v(31,25)),new N(30,new v(11,15),new v(31,16))),new Z(29,Int32Array.from([6,30,54,78,102,126]),new N(30,new v(7,116),new v(7,117)),new N(28,new v(21,45),new v(7,46)),new N(30,new v(1,23),new v(37,24)),new N(30,new v(19,15),new v(26,16))),new Z(30,Int32Array.from([6,26,52,78,104,130]),new N(30,new v(5,115),new v(10,116)),new N(28,new v(19,47),new v(10,48)),new N(30,new v(15,24),new v(25,25)),new N(30,new v(23,15),new v(25,16))),new Z(31,Int32Array.from([6,30,56,82,108,134]),new N(30,new v(13,115),new v(3,116)),new N(28,new v(2,46),new v(29,47)),new N(30,new v(42,24),new v(1,25)),new N(30,new v(23,15),new v(28,16))),new Z(32,Int32Array.from([6,34,60,86,112,138]),new N(30,new v(17,115)),new N(28,new v(10,46),new v(23,47)),new N(30,new v(10,24),new v(35,25)),new N(30,new v(19,15),new v(35,16))),new Z(33,Int32Array.from([6,30,58,86,114,142]),new N(30,new v(17,115),new v(1,116)),new N(28,new v(14,46),new v(21,47)),new N(30,new v(29,24),new v(19,25)),new N(30,new v(11,15),new v(46,16))),new Z(34,Int32Array.from([6,34,62,90,118,146]),new N(30,new v(13,115),new v(6,116)),new N(28,new v(14,46),new v(23,47)),new N(30,new v(44,24),new v(7,25)),new N(30,new v(59,16),new v(1,17))),new Z(35,Int32Array.from([6,30,54,78,102,126,150]),new N(30,new v(12,121),new v(7,122)),new N(28,new v(12,47),new v(26,48)),new N(30,new v(39,24),new v(14,25)),new N(30,new v(22,15),new v(41,16))),new Z(36,Int32Array.from([6,24,50,76,102,128,154]),new N(30,new v(6,121),new v(14,122)),new N(28,new v(6,47),new v(34,48)),new N(30,new v(46,24),new v(10,25)),new N(30,new v(2,15),new v(64,16))),new Z(37,Int32Array.from([6,28,54,80,106,132,158]),new N(30,new v(17,122),new v(4,123)),new N(28,new v(29,46),new v(14,47)),new N(30,new v(49,24),new v(10,25)),new N(30,new v(24,15),new v(46,16))),new Z(38,Int32Array.from([6,32,58,84,110,136,162]),new N(30,new v(4,122),new v(18,123)),new N(28,new v(13,46),new v(32,47)),new N(30,new v(48,24),new v(14,25)),new N(30,new v(42,15),new v(32,16))),new Z(39,Int32Array.from([6,26,54,82,110,138,166]),new N(30,new v(20,117),new v(4,118)),new N(28,new v(40,47),new v(7,48)),new N(30,new v(43,24),new v(22,25)),new N(30,new v(10,15),new v(67,16))),new Z(40,Int32Array.from([6,30,58,86,114,142,170]),new N(30,new v(19,118),new v(6,119)),new N(28,new v(18,47),new v(31,48)),new N(30,new v(34,24),new v(34,25)),new N(30,new v(20,15),new v(61,16)))];var qe;(function(x){x[x.DATA_MASK_000=0]="DATA_MASK_000",x[x.DATA_MASK_001=1]="DATA_MASK_001",x[x.DATA_MASK_010=2]="DATA_MASK_010",x[x.DATA_MASK_011=3]="DATA_MASK_011",x[x.DATA_MASK_100=4]="DATA_MASK_100",x[x.DATA_MASK_101=5]="DATA_MASK_101",x[x.DATA_MASK_110=6]="DATA_MASK_110",x[x.DATA_MASK_111=7]="DATA_MASK_111"})(qe||(qe={}));class St{constructor(e,t){this.value=e,this.isMasked=t}unmaskBitMatrix(e,t){for(let i=0;i<t;i++)for(let r=0;r<t;r++)this.isMasked(i,r)&&e.flip(r,i)}}St.values=new Map([[qe.DATA_MASK_000,new St(qe.DATA_MASK_000,(x,e)=>(x+e&1)===0)],[qe.DATA_MASK_001,new St(qe.DATA_MASK_001,(x,e)=>(x&1)===0)],[qe.DATA_MASK_010,new St(qe.DATA_MASK_010,(x,e)=>e%3===0)],[qe.DATA_MASK_011,new St(qe.DATA_MASK_011,(x,e)=>(x+e)%3===0)],[qe.DATA_MASK_100,new St(qe.DATA_MASK_100,(x,e)=>(Math.floor(x/2)+Math.floor(e/3)&1)===0)],[qe.DATA_MASK_101,new St(qe.DATA_MASK_101,(x,e)=>x*e%6===0)],[qe.DATA_MASK_110,new St(qe.DATA_MASK_110,(x,e)=>x*e%6<3)],[qe.DATA_MASK_111,new St(qe.DATA_MASK_111,(x,e)=>(x+e+x*e%3&1)===0)]]);class il{constructor(e){const t=e.getHeight();if(t<21||(t&3)!==1)throw new z;this.bitMatrix=e}readFormatInformation(){if(this.parsedFormatInfo!==null&&this.parsedFormatInfo!==void 0)return this.parsedFormatInfo;let e=0;for(let s=0;s<6;s++)e=this.copyBit(s,8,e);e=this.copyBit(7,8,e),e=this.copyBit(8,8,e),e=this.copyBit(8,7,e);for(let s=5;s>=0;s--)e=this.copyBit(8,s,e);const t=this.bitMatrix.getHeight();let i=0;const r=t-7;for(let s=t-1;s>=r;s--)i=this.copyBit(8,s,i);for(let s=t-8;s<t;s++)i=this.copyBit(s,8,i);if(this.parsedFormatInfo=ot.decodeFormatInformation(e,i),this.parsedFormatInfo!==null)return this.parsedFormatInfo;throw new z}readVersion(){if(this.parsedVersion!==null&&this.parsedVersion!==void 0)return this.parsedVersion;const e=this.bitMatrix.getHeight(),t=Math.floor((e-17)/4);if(t<=6)return Z.getVersionForNumber(t);let i=0;const r=e-11;for(let l=5;l>=0;l--)for(let c=e-9;c>=r;c--)i=this.copyBit(c,l,i);let s=Z.decodeVersionInformation(i);if(s!==null&&s.getDimensionForVersion()===e)return this.parsedVersion=s,s;i=0;for(let l=5;l>=0;l--)for(let c=e-9;c>=r;c--)i=this.copyBit(l,c,i);if(s=Z.decodeVersionInformation(i),s!==null&&s.getDimensionForVersion()===e)return this.parsedVersion=s,s;throw new z}copyBit(e,t,i){return(this.isMirror?this.bitMatrix.get(t,e):this.bitMatrix.get(e,t))?i<<1|1:i<<1}readCodewords(){const e=this.readFormatInformation(),t=this.readVersion(),i=St.values.get(e.getDataMask()),r=this.bitMatrix.getHeight();i.unmaskBitMatrix(this.bitMatrix,r);const s=t.buildFunctionPattern();let l=!0;const c=new Uint8Array(t.getTotalCodewords());let h=0,f=0,p=0;for(let b=r-1;b>0;b-=2){b===6&&b--;for(let w=0;w<r;w++){const y=l?r-1-w:w;for(let E=0;E<2;E++)s.get(b-E,y)||(p++,f<<=1,this.bitMatrix.get(b-E,y)&&(f|=1),p===8&&(c[h++]=f,p=0,f=0))}l=!l}if(h!==t.getTotalCodewords())throw new z;return c}remask(){if(this.parsedFormatInfo===null)return;const e=St.values[this.parsedFormatInfo.getDataMask()],t=this.bitMatrix.getHeight();e.unmaskBitMatrix(this.bitMatrix,t)}setMirror(e){this.parsedVersion=null,this.parsedFormatInfo=null,this.isMirror=e}mirror(){const e=this.bitMatrix;for(let t=0,i=e.getWidth();t<i;t++)for(let r=t+1,s=e.getHeight();r<s;r++)e.get(t,r)!==e.get(r,t)&&(e.flip(r,t),e.flip(t,r))}}class Fn{constructor(e,t){this.numDataCodewords=e,this.codewords=t}static getDataBlocks(e,t,i){if(e.length!==t.getTotalCodewords())throw new I;const r=t.getECBlocksForLevel(i);let s=0;const l=r.getECBlocks();for(const E of l)s+=E.getCount();const c=new Array(s);let h=0;for(const E of l)for(let S=0;S<E.getCount();S++){const T=E.getDataCodewords(),R=r.getECCodewordsPerBlock()+T;c[h++]=new Fn(T,new Uint8Array(R))}const f=c[0].codewords.length;let p=c.length-1;for(;p>=0&&c[p].codewords.length!==f;)p--;p++;const b=f-r.getECCodewordsPerBlock();let w=0;for(let E=0;E<b;E++)for(let S=0;S<h;S++)c[S].codewords[E]=e[w++];for(let E=p;E<h;E++)c[E].codewords[b]=e[w++];const y=c[0].codewords.length;for(let E=b;E<y;E++)for(let S=0;S<h;S++){const T=S<p?E:E+1;c[S].codewords[T]=e[w++]}return c}getNumDataCodewords(){return this.numDataCodewords}getCodewords(){return this.codewords}}var It;(function(x){x[x.TERMINATOR=0]="TERMINATOR",x[x.NUMERIC=1]="NUMERIC",x[x.ALPHANUMERIC=2]="ALPHANUMERIC",x[x.STRUCTURED_APPEND=3]="STRUCTURED_APPEND",x[x.BYTE=4]="BYTE",x[x.ECI=5]="ECI",x[x.KANJI=6]="KANJI",x[x.FNC1_FIRST_POSITION=7]="FNC1_FIRST_POSITION",x[x.FNC1_SECOND_POSITION=8]="FNC1_SECOND_POSITION",x[x.HANZI=9]="HANZI"})(It||(It={}));class q{constructor(e,t,i,r){this.value=e,this.stringValue=t,this.characterCountBitsForVersions=i,this.bits=r,q.FOR_BITS.set(r,this),q.FOR_VALUE.set(e,this)}static forBits(e){const t=q.FOR_BITS.get(e);if(t===void 0)throw new I;return t}getCharacterCountBits(e){const t=e.getVersionNumber();let i;return t<=9?i=0:t<=26?i=1:i=2,this.characterCountBitsForVersions[i]}getValue(){return this.value}getBits(){return this.bits}equals(e){if(!(e instanceof q))return!1;const t=e;return this.value===t.value}toString(){return this.stringValue}}q.FOR_BITS=new Map,q.FOR_VALUE=new Map,q.TERMINATOR=new q(It.TERMINATOR,"TERMINATOR",Int32Array.from([0,0,0]),0),q.NUMERIC=new q(It.NUMERIC,"NUMERIC",Int32Array.from([10,12,14]),1),q.ALPHANUMERIC=new q(It.ALPHANUMERIC,"ALPHANUMERIC",Int32Array.from([9,11,13]),2),q.STRUCTURED_APPEND=new q(It.STRUCTURED_APPEND,"STRUCTURED_APPEND",Int32Array.from([0,0,0]),3),q.BYTE=new q(It.BYTE,"BYTE",Int32Array.from([8,16,16]),4),q.ECI=new q(It.ECI,"ECI",Int32Array.from([0,0,0]),7),q.KANJI=new q(It.KANJI,"KANJI",Int32Array.from([8,10,12]),8),q.FNC1_FIRST_POSITION=new q(It.FNC1_FIRST_POSITION,"FNC1_FIRST_POSITION",Int32Array.from([0,0,0]),5),q.FNC1_SECOND_POSITION=new q(It.FNC1_SECOND_POSITION,"FNC1_SECOND_POSITION",Int32Array.from([0,0,0]),9),q.HANZI=new q(It.HANZI,"HANZI",Int32Array.from([8,10,12]),13);class Pe{static decode(e,t,i,r){const s=new Ln(e);let l=new ae;const c=new Array;let h=-1,f=-1;try{let p=null,b=!1,w;do{if(s.available()<4)w=q.TERMINATOR;else{const y=s.readBits(4);w=q.forBits(y)}switch(w){case q.TERMINATOR:break;case q.FNC1_FIRST_POSITION:case q.FNC1_SECOND_POSITION:b=!0;break;case q.STRUCTURED_APPEND:if(s.available()<16)throw new z;h=s.readBits(8),f=s.readBits(8);break;case q.ECI:const y=Pe.parseECIValue(s);if(p=B.getCharacterSetECIByValue(y),p===null)throw new z;break;case q.HANZI:const E=s.readBits(4),S=s.readBits(w.getCharacterCountBits(t));E===Pe.GB2312_SUBSET&&Pe.decodeHanziSegment(s,l,S);break;default:const T=s.readBits(w.getCharacterCountBits(t));switch(w){case q.NUMERIC:Pe.decodeNumericSegment(s,l,T);break;case q.ALPHANUMERIC:Pe.decodeAlphanumericSegment(s,l,T,b);break;case q.BYTE:Pe.decodeByteSegment(s,l,T,p,c,r);break;case q.KANJI:Pe.decodeKanjiSegment(s,l,T);break;default:throw new z}break}}while(w!==q.TERMINATOR)}catch{throw new z}return new mr(e,l.toString(),c.length===0?null:c,i===null?null:i.toString(),h,f)}static decodeHanziSegment(e,t,i){if(i*13>e.available())throw new z;const r=new Uint8Array(2*i);let s=0;for(;i>0;){const l=e.readBits(13);let c=l/96<<8&4294967295|l%96;c<959?c+=41377:c+=42657,r[s]=c>>8&255,r[s+1]=c&255,s+=2,i--}try{t.append(De.decode(r,Y.GB2312))}catch(l){throw new z(l)}}static decodeKanjiSegment(e,t,i){if(i*13>e.available())throw new z;const r=new Uint8Array(2*i);let s=0;for(;i>0;){const l=e.readBits(13);let c=l/192<<8&4294967295|l%192;c<7936?c+=33088:c+=49472,r[s]=c>>8,r[s+1]=c,s+=2,i--}try{t.append(De.decode(r,Y.SHIFT_JIS))}catch(l){throw new z(l)}}static decodeByteSegment(e,t,i,r,s,l){if(8*i>e.available())throw new z;const c=new Uint8Array(i);for(let f=0;f<i;f++)c[f]=e.readBits(8);let h;r===null?h=Y.guessEncoding(c,l):h=r.getName();try{t.append(De.decode(c,h))}catch(f){throw new z(f)}s.push(c)}static toAlphaNumericChar(e){if(e>=Pe.ALPHANUMERIC_CHARS.length)throw new z;return Pe.ALPHANUMERIC_CHARS[e]}static decodeAlphanumericSegment(e,t,i,r){const s=t.length();for(;i>1;){if(e.available()<11)throw new z;const l=e.readBits(11);t.append(Pe.toAlphaNumericChar(Math.floor(l/45))),t.append(Pe.toAlphaNumericChar(l%45)),i-=2}if(i===1){if(e.available()<6)throw new z;t.append(Pe.toAlphaNumericChar(e.readBits(6)))}if(r)for(let l=s;l<t.length();l++)t.charAt(l)==="%"&&(l<t.length()-1&&t.charAt(l+1)==="%"?t.deleteCharAt(l+1):t.setCharAt(l,""))}static decodeNumericSegment(e,t,i){for(;i>=3;){if(e.available()<10)throw new z;const r=e.readBits(10);if(r>=1e3)throw new z;t.append(Pe.toAlphaNumericChar(Math.floor(r/100))),t.append(Pe.toAlphaNumericChar(Math.floor(r/10)%10)),t.append(Pe.toAlphaNumericChar(r%10)),i-=3}if(i===2){if(e.available()<7)throw new z;const r=e.readBits(7);if(r>=100)throw new z;t.append(Pe.toAlphaNumericChar(Math.floor(r/10))),t.append(Pe.toAlphaNumericChar(r%10))}else if(i===1){if(e.available()<4)throw new z;const r=e.readBits(4);if(r>=10)throw new z;t.append(Pe.toAlphaNumericChar(r))}}static parseECIValue(e){const t=e.readBits(8);if(!(t&128))return t&127;if((t&192)===128){const i=e.readBits(8);return(t&63)<<8&4294967295|i}if((t&224)===192){const i=e.readBits(16);return(t&31)<<16&4294967295|i}throw new z}}Pe.ALPHANUMERIC_CHARS="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:",Pe.GB2312_SUBSET=1;class Qs{constructor(e){this.mirrored=e}isMirrored(){return this.mirrored}applyMirroredCorrection(e){if(!this.mirrored||e===null||e.length<3)return;const t=e[0];e[0]=e[2],e[2]=t}}class rl{constructor(){this.rsDecoder=new br(we.QR_CODE_FIELD_256)}decodeBooleanArray(e,t){return this.decodeBitMatrix(Me.parseFromBooleanArray(e),t)}decodeBitMatrix(e,t){const i=new il(e);let r=null;try{return this.decodeBitMatrixParser(i,t)}catch(s){r=s}try{i.remask(),i.setMirror(!0),i.readVersion(),i.readFormatInformation(),i.mirror();const s=this.decodeBitMatrixParser(i,t);return s.setOther(new Qs(!0)),s}catch(s){throw r!==null?r:s}}decodeBitMatrixParser(e,t){const i=e.readVersion(),r=e.readFormatInformation().getErrorCorrectionLevel(),s=e.readCodewords(),l=Fn.getDataBlocks(s,i,r);let c=0;for(const p of l)c+=p.getNumDataCodewords();const h=new Uint8Array(c);let f=0;for(const p of l){const b=p.getCodewords(),w=p.getNumDataCodewords();this.correctErrors(b,w);for(let y=0;y<w;y++)h[f++]=b[y]}return Pe.decode(h,i,r,t)}correctErrors(e,t){const i=new Int32Array(e);try{this.rsDecoder.decode(i,e.length-t)}catch{throw new X}for(let r=0;r<t;r++)e[r]=i[r]}}class Un extends j{constructor(e,t,i){super(e,t),this.estimatedModuleSize=i}aboutEquals(e,t,i){if(Math.abs(t-this.getY())<=e&&Math.abs(i-this.getX())<=e){const r=Math.abs(e-this.estimatedModuleSize);return r<=1||r<=this.estimatedModuleSize}return!1}combineEstimate(e,t,i){const r=(this.getX()+t)/2,s=(this.getY()+e)/2,l=(this.estimatedModuleSize+i)/2;return new Un(r,s,l)}}class Jr{constructor(e,t,i,r,s,l,c){this.image=e,this.startX=t,this.startY=i,this.width=r,this.height=s,this.moduleSize=l,this.resultPointCallback=c,this.possibleCenters=[],this.crossCheckStateCount=new Int32Array(3)}find(){const e=this.startX,t=this.height,i=this.width,r=e+i,s=this.startY+t/2,l=new Int32Array(3),c=this.image;for(let h=0;h<t;h++){const f=s+(h&1?-Math.floor((h+1)/2):Math.floor((h+1)/2));l[0]=0,l[1]=0,l[2]=0;let p=e;for(;p<r&&!c.get(p,f);)p++;let b=0;for(;p<r;){if(c.get(p,f))if(b===1)l[1]++;else if(b===2){if(this.foundPatternCross(l)){const w=this.handlePossibleCenter(l,f,p);if(w!==null)return w}l[0]=l[2],l[1]=1,l[2]=0,b=1}else l[++b]++;else b===1&&b++,l[b]++;p++}if(this.foundPatternCross(l)){const w=this.handlePossibleCenter(l,f,r);if(w!==null)return w}}if(this.possibleCenters.length!==0)return this.possibleCenters[0];throw new D}static centerFromEnd(e,t){return t-e[2]-e[1]/2}foundPatternCross(e){const t=this.moduleSize,i=t/2;for(let r=0;r<3;r++)if(Math.abs(t-e[r])>=i)return!1;return!0}crossCheckVertical(e,t,i,r){const s=this.image,l=s.getHeight(),c=this.crossCheckStateCount;c[0]=0,c[1]=0,c[2]=0;let h=e;for(;h>=0&&s.get(t,h)&&c[1]<=i;)c[1]++,h--;if(h<0||c[1]>i)return NaN;for(;h>=0&&!s.get(t,h)&&c[0]<=i;)c[0]++,h--;if(c[0]>i)return NaN;for(h=e+1;h<l&&s.get(t,h)&&c[1]<=i;)c[1]++,h++;if(h===l||c[1]>i)return NaN;for(;h<l&&!s.get(t,h)&&c[2]<=i;)c[2]++,h++;if(c[2]>i)return NaN;const f=c[0]+c[1]+c[2];return 5*Math.abs(f-r)>=2*r?NaN:this.foundPatternCross(c)?Jr.centerFromEnd(c,h):NaN}handlePossibleCenter(e,t,i){const r=e[0]+e[1]+e[2],s=Jr.centerFromEnd(e,i),l=this.crossCheckVertical(t,s,2*e[1],r);if(!isNaN(l)){const c=(e[0]+e[1]+e[2])/3;for(const f of this.possibleCenters)if(f.aboutEquals(c,l,s))return f.combineEstimate(l,s,c);const h=new Un(s,l,c);this.possibleCenters.push(h),this.resultPointCallback!==null&&this.resultPointCallback!==void 0&&this.resultPointCallback.foundPossibleResultPoint(h)}return null}}class $n extends j{constructor(e,t,i,r){super(e,t),this.estimatedModuleSize=i,this.count=r,r===void 0&&(this.count=1)}getEstimatedModuleSize(){return this.estimatedModuleSize}getCount(){return this.count}aboutEquals(e,t,i){if(Math.abs(t-this.getY())<=e&&Math.abs(i-this.getX())<=e){const r=Math.abs(e-this.estimatedModuleSize);return r<=1||r<=this.estimatedModuleSize}return!1}combineEstimate(e,t,i){const r=this.count+1,s=(this.count*this.getX()+t)/r,l=(this.count*this.getY()+e)/r,c=(this.count*this.estimatedModuleSize+i)/r;return new $n(s,l,c,r)}}class nl{constructor(e){this.bottomLeft=e[0],this.topLeft=e[1],this.topRight=e[2]}getBottomLeft(){return this.bottomLeft}getTopLeft(){return this.topLeft}getTopRight(){return this.topRight}}class Qe{constructor(e,t){this.image=e,this.resultPointCallback=t,this.possibleCenters=[],this.crossCheckStateCount=new Int32Array(5),this.resultPointCallback=t}getImage(){return this.image}getPossibleCenters(){return this.possibleCenters}find(e){const t=e!=null&&e.get(be.TRY_HARDER)!==void 0,i=e!=null&&e.get(be.PURE_BARCODE)!==void 0,r=this.image,s=r.getHeight(),l=r.getWidth();let c=Math.floor(3*s/(4*Qe.MAX_MODULES));(c<Qe.MIN_SKIP||t)&&(c=Qe.MIN_SKIP);let h=!1;const f=new Int32Array(5);for(let b=c-1;b<s&&!h;b+=c){f[0]=0,f[1]=0,f[2]=0,f[3]=0,f[4]=0;let w=0;for(let y=0;y<l;y++)if(r.get(y,b))(w&1)===1&&w++,f[w]++;else if(w&1)f[w]++;else if(w===4)if(Qe.foundPatternCross(f)){if(this.handlePossibleCenter(f,b,y,i)===!0)if(c=2,this.hasSkipped===!0)h=this.haveMultiplyConfirmedCenters();else{const S=this.findRowSkip();S>f[2]&&(b+=S-f[2]-c,y=l-1)}else{f[0]=f[2],f[1]=f[3],f[2]=f[4],f[3]=1,f[4]=0,w=3;continue}w=0,f[0]=0,f[1]=0,f[2]=0,f[3]=0,f[4]=0}else f[0]=f[2],f[1]=f[3],f[2]=f[4],f[3]=1,f[4]=0,w=3;else f[++w]++;Qe.foundPatternCross(f)&&this.handlePossibleCenter(f,b,l,i)===!0&&(c=f[0],this.hasSkipped&&(h=this.haveMultiplyConfirmedCenters()))}const p=this.selectBestPatterns();return j.orderBestPatterns(p),new nl(p)}static centerFromEnd(e,t){return t-e[4]-e[3]-e[2]/2}static foundPatternCross(e){let t=0;for(let s=0;s<5;s++){const l=e[s];if(l===0)return!1;t+=l}if(t<7)return!1;const i=t/7,r=i/2;return Math.abs(i-e[0])<r&&Math.abs(i-e[1])<r&&Math.abs(3*i-e[2])<3*r&&Math.abs(i-e[3])<r&&Math.abs(i-e[4])<r}getCrossCheckStateCount(){const e=this.crossCheckStateCount;return e[0]=0,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e}crossCheckDiagonal(e,t,i,r){const s=this.getCrossCheckStateCount();let l=0;const c=this.image;for(;e>=l&&t>=l&&c.get(t-l,e-l);)s[2]++,l++;if(e<l||t<l)return!1;for(;e>=l&&t>=l&&!c.get(t-l,e-l)&&s[1]<=i;)s[1]++,l++;if(e<l||t<l||s[1]>i)return!1;for(;e>=l&&t>=l&&c.get(t-l,e-l)&&s[0]<=i;)s[0]++,l++;if(s[0]>i)return!1;const h=c.getHeight(),f=c.getWidth();for(l=1;e+l<h&&t+l<f&&c.get(t+l,e+l);)s[2]++,l++;if(e+l>=h||t+l>=f)return!1;for(;e+l<h&&t+l<f&&!c.get(t+l,e+l)&&s[3]<i;)s[3]++,l++;if(e+l>=h||t+l>=f||s[3]>=i)return!1;for(;e+l<h&&t+l<f&&c.get(t+l,e+l)&&s[4]<i;)s[4]++,l++;if(s[4]>=i)return!1;const p=s[0]+s[1]+s[2]+s[3]+s[4];return Math.abs(p-r)<2*r&&Qe.foundPatternCross(s)}crossCheckVertical(e,t,i,r){const s=this.image,l=s.getHeight(),c=this.getCrossCheckStateCount();let h=e;for(;h>=0&&s.get(t,h);)c[2]++,h--;if(h<0)return NaN;for(;h>=0&&!s.get(t,h)&&c[1]<=i;)c[1]++,h--;if(h<0||c[1]>i)return NaN;for(;h>=0&&s.get(t,h)&&c[0]<=i;)c[0]++,h--;if(c[0]>i)return NaN;for(h=e+1;h<l&&s.get(t,h);)c[2]++,h++;if(h===l)return NaN;for(;h<l&&!s.get(t,h)&&c[3]<i;)c[3]++,h++;if(h===l||c[3]>=i)return NaN;for(;h<l&&s.get(t,h)&&c[4]<i;)c[4]++,h++;if(c[4]>=i)return NaN;const f=c[0]+c[1]+c[2]+c[3]+c[4];return 5*Math.abs(f-r)>=2*r?NaN:Qe.foundPatternCross(c)?Qe.centerFromEnd(c,h):NaN}crossCheckHorizontal(e,t,i,r){const s=this.image,l=s.getWidth(),c=this.getCrossCheckStateCount();let h=e;for(;h>=0&&s.get(h,t);)c[2]++,h--;if(h<0)return NaN;for(;h>=0&&!s.get(h,t)&&c[1]<=i;)c[1]++,h--;if(h<0||c[1]>i)return NaN;for(;h>=0&&s.get(h,t)&&c[0]<=i;)c[0]++,h--;if(c[0]>i)return NaN;for(h=e+1;h<l&&s.get(h,t);)c[2]++,h++;if(h===l)return NaN;for(;h<l&&!s.get(h,t)&&c[3]<i;)c[3]++,h++;if(h===l||c[3]>=i)return NaN;for(;h<l&&s.get(h,t)&&c[4]<i;)c[4]++,h++;if(c[4]>=i)return NaN;const f=c[0]+c[1]+c[2]+c[3]+c[4];return 5*Math.abs(f-r)>=r?NaN:Qe.foundPatternCross(c)?Qe.centerFromEnd(c,h):NaN}handlePossibleCenter(e,t,i,r){const s=e[0]+e[1]+e[2]+e[3]+e[4];let l=Qe.centerFromEnd(e,i),c=this.crossCheckVertical(t,Math.floor(l),e[2],s);if(!isNaN(c)&&(l=this.crossCheckHorizontal(Math.floor(l),Math.floor(c),e[2],s),!isNaN(l)&&(!r||this.crossCheckDiagonal(Math.floor(c),Math.floor(l),e[2],s)))){const h=s/7;let f=!1;const p=this.possibleCenters;for(let b=0,w=p.length;b<w;b++){const y=p[b];if(y.aboutEquals(h,c,l)){p[b]=y.combineEstimate(c,l,h),f=!0;break}}if(!f){const b=new $n(l,c,h);p.push(b),this.resultPointCallback!==null&&this.resultPointCallback!==void 0&&this.resultPointCallback.foundPossibleResultPoint(b)}return!0}return!1}findRowSkip(){if(this.possibleCenters.length<=1)return 0;let t=null;for(const i of this.possibleCenters)if(i.getCount()>=Qe.CENTER_QUORUM)if(t==null)t=i;else return this.hasSkipped=!0,Math.floor((Math.abs(t.getX()-i.getX())-Math.abs(t.getY()-i.getY()))/2);return 0}haveMultiplyConfirmedCenters(){let e=0,t=0;const i=this.possibleCenters.length;for(const l of this.possibleCenters)l.getCount()>=Qe.CENTER_QUORUM&&(e++,t+=l.getEstimatedModuleSize());if(e<3)return!1;const r=t/i;let s=0;for(const l of this.possibleCenters)s+=Math.abs(l.getEstimatedModuleSize()-r);return s<=.05*t}selectBestPatterns(){const e=this.possibleCenters.length;if(e<3)throw new D;const t=this.possibleCenters;let i;if(e>3){let r=0,s=0;for(const h of this.possibleCenters){const f=h.getEstimatedModuleSize();r+=f,s+=f*f}i=r/e;let l=Math.sqrt(s/e-i*i);t.sort((h,f)=>{const p=Math.abs(f.getEstimatedModuleSize()-i),b=Math.abs(h.getEstimatedModuleSize()-i);return p<b?-1:p>b?1:0});const c=Math.max(.2*i,l);for(let h=0;h<t.length&&t.length>3;h++){const f=t[h];Math.abs(f.getEstimatedModuleSize()-i)>c&&(t.splice(h,1),h--)}}if(t.length>3){let r=0;for(const s of t)r+=s.getEstimatedModuleSize();i=r/t.length,t.sort((s,l)=>{if(l.getCount()===s.getCount()){const c=Math.abs(l.getEstimatedModuleSize()-i),h=Math.abs(s.getEstimatedModuleSize()-i);return c<h?1:c>h?-1:0}else return l.getCount()-s.getCount()}),t.splice(3)}return[t[0],t[1],t[2]]}}Qe.CENTER_QUORUM=2,Qe.MIN_SKIP=3,Qe.MAX_MODULES=57;class _r{constructor(e){this.image=e}getImage(){return this.image}getResultPointCallback(){return this.resultPointCallback}detect(e){this.resultPointCallback=e==null?null:e.get(be.NEED_RESULT_POINT_CALLBACK);const i=new Qe(this.image,this.resultPointCallback).find(e);return this.processFinderPatternInfo(i)}processFinderPatternInfo(e){const t=e.getTopLeft(),i=e.getTopRight(),r=e.getBottomLeft(),s=this.calculateModuleSize(t,i,r);if(s<1)throw new D("No pattern found in proccess finder.");const l=_r.computeDimension(t,i,r,s),c=Z.getProvisionalVersionForDimension(l),h=c.getDimensionForVersion()-7;let f=null;if(c.getAlignmentPatternCenters().length>0){const y=i.getX()-t.getX()+r.getX(),E=i.getY()-t.getY()+r.getY(),S=1-3/h,T=Math.floor(t.getX()+S*(y-t.getX())),R=Math.floor(t.getY()+S*(E-t.getY()));for(let U=4;U<=16;U<<=1)try{f=this.findAlignmentInRegion(s,T,R,U);break}catch($){if(!($ instanceof D))throw $}}const p=_r.createTransform(t,i,r,f,l),b=_r.sampleGrid(this.image,p,l);let w;return f===null?w=[r,t,i]:w=[r,t,i,f],new Kr(b,w)}static createTransform(e,t,i,r,s){const l=s-3.5;let c,h,f,p;return r!==null?(c=r.getX(),h=r.getY(),f=l-3,p=f):(c=t.getX()-e.getX()+i.getX(),h=t.getY()-e.getY()+i.getY(),f=l,p=l),kt.quadrilateralToQuadrilateral(3.5,3.5,l,3.5,f,p,3.5,l,e.getX(),e.getY(),t.getX(),t.getY(),c,h,i.getX(),i.getY())}static sampleGrid(e,t,i){return ai.getInstance().sampleGridWithTransform(e,i,i,t)}static computeDimension(e,t,i,r){const s=me.round(j.distance(e,t)/r),l=me.round(j.distance(e,i)/r);let c=Math.floor((s+l)/2)+7;switch(c&3){case 0:c++;break;case 2:c--;break;case 3:throw new D("Dimensions could be not found.")}return c}calculateModuleSize(e,t,i){return(this.calculateModuleSizeOneWay(e,t)+this.calculateModuleSizeOneWay(e,i))/2}calculateModuleSizeOneWay(e,t){const i=this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(e.getX()),Math.floor(e.getY()),Math.floor(t.getX()),Math.floor(t.getY())),r=this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(t.getX()),Math.floor(t.getY()),Math.floor(e.getX()),Math.floor(e.getY()));return isNaN(i)?r/7:isNaN(r)?i/7:(i+r)/14}sizeOfBlackWhiteBlackRunBothWays(e,t,i,r){let s=this.sizeOfBlackWhiteBlackRun(e,t,i,r),l=1,c=e-(i-e);c<0?(l=e/(e-c),c=0):c>=this.image.getWidth()&&(l=(this.image.getWidth()-1-e)/(c-e),c=this.image.getWidth()-1);let h=Math.floor(t-(r-t)*l);return l=1,h<0?(l=t/(t-h),h=0):h>=this.image.getHeight()&&(l=(this.image.getHeight()-1-t)/(h-t),h=this.image.getHeight()-1),c=Math.floor(e+(c-e)*l),s+=this.sizeOfBlackWhiteBlackRun(e,t,c,h),s-1}sizeOfBlackWhiteBlackRun(e,t,i,r){const s=Math.abs(r-t)>Math.abs(i-e);if(s){let y=e;e=t,t=y,y=i,i=r,r=y}const l=Math.abs(i-e),c=Math.abs(r-t);let h=-l/2;const f=e<i?1:-1,p=t<r?1:-1;let b=0;const w=i+f;for(let y=e,E=t;y!==w;y+=f){const S=s?E:y,T=s?y:E;if(b===1===this.image.get(S,T)){if(b===2)return me.distance(y,E,e,t);b++}if(h+=c,h>0){if(E===r)break;E+=p,h-=l}}return b===2?me.distance(i+f,r,e,t):NaN}findAlignmentInRegion(e,t,i,r){const s=Math.floor(r*e),l=Math.max(0,t-s),c=Math.min(this.image.getWidth()-1,t+s);if(c-l<e*3)throw new D("Alignment top exceeds estimated module size.");const h=Math.max(0,i-s),f=Math.min(this.image.getHeight()-1,i+s);if(f-h<e*3)throw new D("Alignment bottom exceeds estimated module size.");return new Jr(this.image,l,h,c-l,f-h,e,this.resultPointCallback).find()}}class di{constructor(){this.decoder=new rl}getDecoder(){return this.decoder}decode(e,t){let i,r;if(t!=null&&t.get(be.PURE_BARCODE)!==void 0){const h=di.extractPureBits(e.getBlackMatrix());i=this.decoder.decodeBitMatrix(h,t),r=di.NO_POINTS}else{const h=new _r(e.getBlackMatrix()).detect(t);i=this.decoder.decodeBitMatrix(h.getBits(),t),r=h.getPoints()}i.getOther()instanceof Qs&&i.getOther().applyMirroredCorrection(r);const s=new dt(i.getText(),i.getRawBytes(),void 0,r,Q.QR_CODE,void 0),l=i.getByteSegments();l!==null&&s.putMetadata(Ye.BYTE_SEGMENTS,l);const c=i.getECLevel();return c!==null&&s.putMetadata(Ye.ERROR_CORRECTION_LEVEL,c),i.hasStructuredAppend()&&(s.putMetadata(Ye.STRUCTURED_APPEND_SEQUENCE,i.getStructuredAppendSequenceNumber()),s.putMetadata(Ye.STRUCTURED_APPEND_PARITY,i.getStructuredAppendParity())),s}reset(){}static extractPureBits(e){const t=e.getTopLeftOnBit(),i=e.getBottomRightOnBit();if(t===null||i===null)throw new D;const r=this.moduleSize(t,e);let s=t[1],l=i[1],c=t[0],h=i[0];if(c>=h||s>=l)throw new D;if(l-s!==h-c&&(h=c+(l-s),h>=e.getWidth()))throw new D;const f=Math.round((h-c+1)/r),p=Math.round((l-s+1)/r);if(f<=0||p<=0)throw new D;if(p!==f)throw new D;const b=Math.floor(r/2);s+=b,c+=b;const w=c+Math.floor((f-1)*r)-h;if(w>0){if(w>b)throw new D;c-=w}const y=s+Math.floor((p-1)*r)-l;if(y>0){if(y>b)throw new D;s-=y}const E=new Me(f,p);for(let S=0;S<p;S++){const T=s+Math.floor(S*r);for(let R=0;R<f;R++)e.get(c+Math.floor(R*r),T)&&E.set(R,S)}return E}static moduleSize(e,t){const i=t.getHeight(),r=t.getWidth();let s=e[0],l=e[1],c=!0,h=0;for(;s<r&&l<i;){if(c!==t.get(s,l)){if(++h===5)break;c=!c}s++,l++}if(s===r||l===i)throw new D;return(s-e[0])/7}}di.NO_POINTS=new Array;class ee{PDF417Common(){}static getBitCountSum(e){return me.sum(e)}static toIntArray(e){if(e==null||!e.length)return ee.EMPTY_INT_ARRAY;const t=new Int32Array(e.length);let i=0;for(const r of e)t[i++]=r;return t}static getCodeword(e){const t=ce.binarySearch(ee.SYMBOL_TABLE,e&262143);return t<0?-1:(ee.CODEWORD_TABLE[t]-1)%ee.NUMBER_OF_CODEWORDS}}ee.NUMBER_OF_CODEWORDS=929,ee.MAX_CODEWORDS_IN_BARCODE=ee.NUMBER_OF_CODEWORDS-1,ee.MIN_ROWS_IN_BARCODE=3,ee.MAX_ROWS_IN_BARCODE=90,ee.MODULES_IN_CODEWORD=17,ee.MODULES_IN_STOP_PATTERN=18,ee.BARS_IN_MODULE=8,ee.EMPTY_INT_ARRAY=new Int32Array([]),ee.SYMBOL_TABLE=Int32Array.from([66142,66170,66206,66236,66290,66292,66350,66382,66396,66454,66470,66476,66594,66600,66614,66626,66628,66632,66640,66654,66662,66668,66682,66690,66718,66720,66748,66758,66776,66798,66802,66804,66820,66824,66832,66846,66848,66876,66880,66936,66950,66956,66968,66992,67006,67022,67036,67042,67044,67048,67062,67118,67150,67164,67214,67228,67256,67294,67322,67350,67366,67372,67398,67404,67416,67438,67474,67476,67490,67492,67496,67510,67618,67624,67650,67656,67664,67678,67686,67692,67706,67714,67716,67728,67742,67744,67772,67782,67788,67800,67822,67826,67828,67842,67848,67870,67872,67900,67904,67960,67974,67992,68016,68030,68046,68060,68066,68068,68072,68086,68104,68112,68126,68128,68156,68160,68216,68336,68358,68364,68376,68400,68414,68448,68476,68494,68508,68536,68546,68548,68552,68560,68574,68582,68588,68654,68686,68700,68706,68708,68712,68726,68750,68764,68792,68802,68804,68808,68816,68830,68838,68844,68858,68878,68892,68920,68976,68990,68994,68996,69e3,69008,69022,69024,69052,69062,69068,69080,69102,69106,69108,69142,69158,69164,69190,69208,69230,69254,69260,69272,69296,69310,69326,69340,69386,69394,69396,69410,69416,69430,69442,69444,69448,69456,69470,69478,69484,69554,69556,69666,69672,69698,69704,69712,69726,69754,69762,69764,69776,69790,69792,69820,69830,69836,69848,69870,69874,69876,69890,69918,69920,69948,69952,70008,70022,70040,70064,70078,70094,70108,70114,70116,70120,70134,70152,70174,70176,70264,70384,70412,70448,70462,70496,70524,70542,70556,70584,70594,70600,70608,70622,70630,70636,70664,70672,70686,70688,70716,70720,70776,70896,71136,71180,71192,71216,71230,71264,71292,71360,71416,71452,71480,71536,71550,71554,71556,71560,71568,71582,71584,71612,71622,71628,71640,71662,71726,71732,71758,71772,71778,71780,71784,71798,71822,71836,71864,71874,71880,71888,71902,71910,71916,71930,71950,71964,71992,72048,72062,72066,72068,72080,72094,72096,72124,72134,72140,72152,72174,72178,72180,72206,72220,72248,72304,72318,72416,72444,72456,72464,72478,72480,72508,72512,72568,72588,72600,72624,72638,72654,72668,72674,72676,72680,72694,72726,72742,72748,72774,72780,72792,72814,72838,72856,72880,72894,72910,72924,72930,72932,72936,72950,72966,72972,72984,73008,73022,73056,73084,73102,73116,73144,73156,73160,73168,73182,73190,73196,73210,73226,73234,73236,73250,73252,73256,73270,73282,73284,73296,73310,73318,73324,73346,73348,73352,73360,73374,73376,73404,73414,73420,73432,73454,73498,73518,73522,73524,73550,73564,73570,73572,73576,73590,73800,73822,73858,73860,73872,73886,73888,73916,73944,73970,73972,73992,74014,74016,74044,74048,74104,74118,74136,74160,74174,74210,74212,74216,74230,74244,74256,74270,74272,74360,74480,74502,74508,74544,74558,74592,74620,74638,74652,74680,74690,74696,74704,74726,74732,74782,74784,74812,74992,75232,75288,75326,75360,75388,75456,75512,75576,75632,75646,75650,75652,75664,75678,75680,75708,75718,75724,75736,75758,75808,75836,75840,75896,76016,76256,76736,76824,76848,76862,76896,76924,76992,77048,77296,77340,77368,77424,77438,77536,77564,77572,77576,77584,77600,77628,77632,77688,77702,77708,77720,77744,77758,77774,77788,77870,77902,77916,77922,77928,77966,77980,78008,78018,78024,78032,78046,78060,78074,78094,78136,78192,78206,78210,78212,78224,78238,78240,78268,78278,78284,78296,78322,78324,78350,78364,78448,78462,78560,78588,78600,78622,78624,78652,78656,78712,78726,78744,78768,78782,78798,78812,78818,78820,78824,78838,78862,78876,78904,78960,78974,79072,79100,79296,79352,79368,79376,79390,79392,79420,79424,79480,79600,79628,79640,79664,79678,79712,79740,79772,79800,79810,79812,79816,79824,79838,79846,79852,79894,79910,79916,79942,79948,79960,79982,79988,80006,80024,80048,80062,80078,80092,80098,80100,80104,80134,80140,80176,80190,80224,80252,80270,80284,80312,80328,80336,80350,80358,80364,80378,80390,80396,80408,80432,80446,80480,80508,80576,80632,80654,80668,80696,80752,80766,80776,80784,80798,80800,80828,80844,80856,80878,80882,80884,80914,80916,80930,80932,80936,80950,80962,80968,80976,80990,80998,81004,81026,81028,81040,81054,81056,81084,81094,81100,81112,81134,81154,81156,81160,81168,81182,81184,81212,81216,81272,81286,81292,81304,81328,81342,81358,81372,81380,81384,81398,81434,81454,81458,81460,81486,81500,81506,81508,81512,81526,81550,81564,81592,81602,81604,81608,81616,81630,81638,81644,81702,81708,81722,81734,81740,81752,81774,81778,81780,82050,82078,82080,82108,82180,82184,82192,82206,82208,82236,82240,82296,82316,82328,82352,82366,82402,82404,82408,82440,82448,82462,82464,82492,82496,82552,82672,82694,82700,82712,82736,82750,82784,82812,82830,82882,82884,82888,82896,82918,82924,82952,82960,82974,82976,83004,83008,83064,83184,83424,83468,83480,83504,83518,83552,83580,83648,83704,83740,83768,83824,83838,83842,83844,83848,83856,83872,83900,83910,83916,83928,83950,83984,84e3,84028,84032,84088,84208,84448,84928,85040,85054,85088,85116,85184,85240,85488,85560,85616,85630,85728,85756,85764,85768,85776,85790,85792,85820,85824,85880,85894,85900,85912,85936,85966,85980,86048,86080,86136,86256,86496,86976,88160,88188,88256,88312,88560,89056,89200,89214,89312,89340,89536,89592,89608,89616,89632,89664,89720,89840,89868,89880,89904,89952,89980,89998,90012,90040,90190,90204,90254,90268,90296,90306,90308,90312,90334,90382,90396,90424,90480,90494,90500,90504,90512,90526,90528,90556,90566,90572,90584,90610,90612,90638,90652,90680,90736,90750,90848,90876,90884,90888,90896,90910,90912,90940,90944,91e3,91014,91020,91032,91056,91070,91086,91100,91106,91108,91112,91126,91150,91164,91192,91248,91262,91360,91388,91584,91640,91664,91678,91680,91708,91712,91768,91888,91928,91952,91966,92e3,92028,92046,92060,92088,92098,92100,92104,92112,92126,92134,92140,92188,92216,92272,92384,92412,92608,92664,93168,93200,93214,93216,93244,93248,93304,93424,93664,93720,93744,93758,93792,93820,93888,93944,93980,94008,94064,94078,94084,94088,94096,94110,94112,94140,94150,94156,94168,94246,94252,94278,94284,94296,94318,94342,94348,94360,94384,94398,94414,94428,94440,94470,94476,94488,94512,94526,94560,94588,94606,94620,94648,94658,94660,94664,94672,94686,94694,94700,94714,94726,94732,94744,94768,94782,94816,94844,94912,94968,94990,95004,95032,95088,95102,95112,95120,95134,95136,95164,95180,95192,95214,95218,95220,95244,95256,95280,95294,95328,95356,95424,95480,95728,95758,95772,95800,95856,95870,95968,95996,96008,96016,96030,96032,96060,96064,96120,96152,96176,96190,96220,96226,96228,96232,96290,96292,96296,96310,96322,96324,96328,96336,96350,96358,96364,96386,96388,96392,96400,96414,96416,96444,96454,96460,96472,96494,96498,96500,96514,96516,96520,96528,96542,96544,96572,96576,96632,96646,96652,96664,96688,96702,96718,96732,96738,96740,96744,96758,96772,96776,96784,96798,96800,96828,96832,96888,97008,97030,97036,97048,97072,97086,97120,97148,97166,97180,97208,97220,97224,97232,97246,97254,97260,97326,97330,97332,97358,97372,97378,97380,97384,97398,97422,97436,97464,97474,97476,97480,97488,97502,97510,97516,97550,97564,97592,97648,97666,97668,97672,97680,97694,97696,97724,97734,97740,97752,97774,97830,97836,97850,97862,97868,97880,97902,97906,97908,97926,97932,97944,97968,97998,98012,98018,98020,98024,98038,98618,98674,98676,98838,98854,98874,98892,98904,98926,98930,98932,98968,99006,99042,99044,99048,99062,99166,99194,99246,99286,99350,99366,99372,99386,99398,99416,99438,99442,99444,99462,99504,99518,99534,99548,99554,99556,99560,99574,99590,99596,99608,99632,99646,99680,99708,99726,99740,99768,99778,99780,99784,99792,99806,99814,99820,99834,99858,99860,99874,99880,99894,99906,99920,99934,99962,99970,99972,99976,99984,99998,1e5,100028,100038,100044,100056,100078,100082,100084,100142,100174,100188,100246,100262,100268,100306,100308,100390,100396,100410,100422,100428,100440,100462,100466,100468,100486,100504,100528,100542,100558,100572,100578,100580,100584,100598,100620,100656,100670,100704,100732,100750,100792,100802,100808,100816,100830,100838,100844,100858,100888,100912,100926,100960,100988,101056,101112,101148,101176,101232,101246,101250,101252,101256,101264,101278,101280,101308,101318,101324,101336,101358,101362,101364,101410,101412,101416,101430,101442,101448,101456,101470,101478,101498,101506,101508,101520,101534,101536,101564,101580,101618,101620,101636,101640,101648,101662,101664,101692,101696,101752,101766,101784,101838,101858,101860,101864,101934,101938,101940,101966,101980,101986,101988,101992,102030,102044,102072,102082,102084,102088,102096,102138,102166,102182,102188,102214,102220,102232,102254,102282,102290,102292,102306,102308,102312,102326,102444,102458,102470,102476,102488,102514,102516,102534,102552,102576,102590,102606,102620,102626,102632,102646,102662,102668,102704,102718,102752,102780,102798,102812,102840,102850,102856,102864,102878,102886,102892,102906,102936,102974,103008,103036,103104,103160,103224,103280,103294,103298,103300,103312,103326,103328,103356,103366,103372,103384,103406,103410,103412,103472,103486,103520,103548,103616,103672,103920,103992,104048,104062,104160,104188,104194,104196,104200,104208,104224,104252,104256,104312,104326,104332,104344,104368,104382,104398,104412,104418,104420,104424,104482,104484,104514,104520,104528,104542,104550,104570,104578,104580,104592,104606,104608,104636,104652,104690,104692,104706,104712,104734,104736,104764,104768,104824,104838,104856,104910,104930,104932,104936,104968,104976,104990,104992,105020,105024,105080,105200,105240,105278,105312,105372,105410,105412,105416,105424,105446,105518,105524,105550,105564,105570,105572,105576,105614,105628,105656,105666,105672,105680,105702,105722,105742,105756,105784,105840,105854,105858,105860,105864,105872,105888,105932,105970,105972,106006,106022,106028,106054,106060,106072,106100,106118,106124,106136,106160,106174,106190,106210,106212,106216,106250,106258,106260,106274,106276,106280,106306,106308,106312,106320,106334,106348,106394,106414,106418,106420,106566,106572,106610,106612,106630,106636,106648,106672,106686,106722,106724,106728,106742,106758,106764,106776,106800,106814,106848,106876,106894,106908,106936,106946,106948,106952,106960,106974,106982,106988,107032,107056,107070,107104,107132,107200,107256,107292,107320,107376,107390,107394,107396,107400,107408,107422,107424,107452,107462,107468,107480,107502,107506,107508,107544,107568,107582,107616,107644,107712,107768,108016,108060,108088,108144,108158,108256,108284,108290,108292,108296,108304,108318,108320,108348,108352,108408,108422,108428,108440,108464,108478,108494,108508,108514,108516,108520,108592,108640,108668,108736,108792,109040,109536,109680,109694,109792,109820,110016,110072,110084,110088,110096,110112,110140,110144,110200,110320,110342,110348,110360,110384,110398,110432,110460,110478,110492,110520,110532,110536,110544,110558,110658,110686,110714,110722,110724,110728,110736,110750,110752,110780,110796,110834,110836,110850,110852,110856,110864,110878,110880,110908,110912,110968,110982,111e3,111054,111074,111076,111080,111108,111112,111120,111134,111136,111164,111168,111224,111344,111372,111422,111456,111516,111554,111556,111560,111568,111590,111632,111646,111648,111676,111680,111736,111856,112096,112152,112224,112252,112320,112440,112514,112516,112520,112528,112542,112544,112588,112686,112718,112732,112782,112796,112824,112834,112836,112840,112848,112870,112890,112910,112924,112952,113008,113022,113026,113028,113032,113040,113054,113056,113100,113138,113140,113166,113180,113208,113264,113278,113376,113404,113416,113424,113440,113468,113472,113560,113614,113634,113636,113640,113686,113702,113708,113734,113740,113752,113778,113780,113798,113804,113816,113840,113854,113870,113890,113892,113896,113926,113932,113944,113968,113982,114016,114044,114076,114114,114116,114120,114128,114150,114170,114194,114196,114210,114212,114216,114242,114244,114248,114256,114270,114278,114306,114308,114312,114320,114334,114336,114364,114380,114420,114458,114478,114482,114484,114510,114524,114530,114532,114536,114842,114866,114868,114970,114994,114996,115042,115044,115048,115062,115130,115226,115250,115252,115278,115292,115298,115300,115304,115318,115342,115394,115396,115400,115408,115422,115430,115436,115450,115478,115494,115514,115526,115532,115570,115572,115738,115758,115762,115764,115790,115804,115810,115812,115816,115830,115854,115868,115896,115906,115912,115920,115934,115942,115948,115962,115996,116024,116080,116094,116098,116100,116104,116112,116126,116128,116156,116166,116172,116184,116206,116210,116212,116246,116262,116268,116282,116294,116300,116312,116334,116338,116340,116358,116364,116376,116400,116414,116430,116444,116450,116452,116456,116498,116500,116514,116520,116534,116546,116548,116552,116560,116574,116582,116588,116602,116654,116694,116714,116762,116782,116786,116788,116814,116828,116834,116836,116840,116854,116878,116892,116920,116930,116936,116944,116958,116966,116972,116986,117006,117048,117104,117118,117122,117124,117136,117150,117152,117180,117190,117196,117208,117230,117234,117236,117304,117360,117374,117472,117500,117506,117508,117512,117520,117536,117564,117568,117624,117638,117644,117656,117680,117694,117710,117724,117730,117732,117736,117750,117782,117798,117804,117818,117830,117848,117874,117876,117894,117936,117950,117966,117986,117988,117992,118022,118028,118040,118064,118078,118112,118140,118172,118210,118212,118216,118224,118238,118246,118266,118306,118312,118338,118352,118366,118374,118394,118402,118404,118408,118416,118430,118432,118460,118476,118514,118516,118574,118578,118580,118606,118620,118626,118628,118632,118678,118694,118700,118730,118738,118740,118830,118834,118836,118862,118876,118882,118884,118888,118902,118926,118940,118968,118978,118980,118984,118992,119006,119014,119020,119034,119068,119096,119152,119166,119170,119172,119176,119184,119198,119200,119228,119238,119244,119256,119278,119282,119284,119324,119352,119408,119422,119520,119548,119554,119556,119560,119568,119582,119584,119612,119616,119672,119686,119692,119704,119728,119742,119758,119772,119778,119780,119784,119798,119920,119934,120032,120060,120256,120312,120324,120328,120336,120352,120384,120440,120560,120582,120588,120600,120624,120638,120672,120700,120718,120732,120760,120770,120772,120776,120784,120798,120806,120812,120870,120876,120890,120902,120908,120920,120946,120948,120966,120972,120984,121008,121022,121038,121058,121060,121064,121078,121100,121112,121136,121150,121184,121212,121244,121282,121284,121288,121296,121318,121338,121356,121368,121392,121406,121440,121468,121536,121592,121656,121730,121732,121736,121744,121758,121760,121804,121842,121844,121890,121922,121924,121928,121936,121950,121958,121978,121986,121988,121992,122e3,122014,122016,122044,122060,122098,122100,122116,122120,122128,122142,122144,122172,122176,122232,122246,122264,122318,122338,122340,122344,122414,122418,122420,122446,122460,122466,122468,122472,122510,122524,122552,122562,122564,122568,122576,122598,122618,122646,122662,122668,122694,122700,122712,122738,122740,122762,122770,122772,122786,122788,122792,123018,123026,123028,123042,123044,123048,123062,123098,123146,123154,123156,123170,123172,123176,123190,123202,123204,123208,123216,123238,123244,123258,123290,123314,123316,123402,123410,123412,123426,123428,123432,123446,123458,123464,123472,123486,123494,123500,123514,123522,123524,123528,123536,123552,123580,123590,123596,123608,123630,123634,123636,123674,123698,123700,123740,123746,123748,123752,123834,123914,123922,123924,123938,123944,123958,123970,123976,123984,123998,124006,124012,124026,124034,124036,124048,124062,124064,124092,124102,124108,124120,124142,124146,124148,124162,124164,124168,124176,124190,124192,124220,124224,124280,124294,124300,124312,124336,124350,124366,124380,124386,124388,124392,124406,124442,124462,124466,124468,124494,124508,124514,124520,124558,124572,124600,124610,124612,124616,124624,124646,124666,124694,124710,124716,124730,124742,124748,124760,124786,124788,124818,124820,124834,124836,124840,124854,124946,124948,124962,124964,124968,124982,124994,124996,125e3,125008,125022,125030,125036,125050,125058,125060,125064,125072,125086,125088,125116,125126,125132,125144,125166,125170,125172,125186,125188,125192,125200,125216,125244,125248,125304,125318,125324,125336,125360,125374,125390,125404,125410,125412,125416,125430,125444,125448,125456,125472,125504,125560,125680,125702,125708,125720,125744,125758,125792,125820,125838,125852,125880,125890,125892,125896,125904,125918,125926,125932,125978,125998,126002,126004,126030,126044,126050,126052,126056,126094,126108,126136,126146,126148,126152,126160,126182,126202,126222,126236,126264,126320,126334,126338,126340,126344,126352,126366,126368,126412,126450,126452,126486,126502,126508,126522,126534,126540,126552,126574,126578,126580,126598,126604,126616,126640,126654,126670,126684,126690,126692,126696,126738,126754,126756,126760,126774,126786,126788,126792,126800,126814,126822,126828,126842,126894,126898,126900,126934,127126,127142,127148,127162,127178,127186,127188,127254,127270,127276,127290,127302,127308,127320,127342,127346,127348,127370,127378,127380,127394,127396,127400,127450,127510,127526,127532,127546,127558,127576,127598,127602,127604,127622,127628,127640,127664,127678,127694,127708,127714,127716,127720,127734,127754,127762,127764,127778,127784,127810,127812,127816,127824,127838,127846,127866,127898,127918,127922,127924,128022,128038,128044,128058,128070,128076,128088,128110,128114,128116,128134,128140,128152,128176,128190,128206,128220,128226,128228,128232,128246,128262,128268,128280,128304,128318,128352,128380,128398,128412,128440,128450,128452,128456,128464,128478,128486,128492,128506,128522,128530,128532,128546,128548,128552,128566,128578,128580,128584,128592,128606,128614,128634,128642,128644,128648,128656,128670,128672,128700,128716,128754,128756,128794,128814,128818,128820,128846,128860,128866,128868,128872,128886,128918,128934,128940,128954,128978,128980,129178,129198,129202,129204,129238,129258,129306,129326,129330,129332,129358,129372,129378,129380,129384,129398,129430,129446,129452,129466,129482,129490,129492,129562,129582,129586,129588,129614,129628,129634,129636,129640,129654,129678,129692,129720,129730,129732,129736,129744,129758,129766,129772,129814,129830,129836,129850,129862,129868,129880,129902,129906,129908,129930,129938,129940,129954,129956,129960,129974,130010]),ee.CODEWORD_TABLE=Int32Array.from([2627,1819,2622,2621,1813,1812,2729,2724,2723,2779,2774,2773,902,896,908,868,865,861,859,2511,873,871,1780,835,2493,825,2491,842,837,844,1764,1762,811,810,809,2483,807,2482,806,2480,815,814,813,812,2484,817,816,1745,1744,1742,1746,2655,2637,2635,2626,2625,2623,2628,1820,2752,2739,2737,2728,2727,2725,2730,2785,2783,2778,2777,2775,2780,787,781,747,739,736,2413,754,752,1719,692,689,681,2371,678,2369,700,697,694,703,1688,1686,642,638,2343,631,2341,627,2338,651,646,643,2345,654,652,1652,1650,1647,1654,601,599,2322,596,2321,594,2319,2317,611,610,608,606,2324,603,2323,615,614,612,1617,1616,1614,1612,616,1619,1618,2575,2538,2536,905,901,898,909,2509,2507,2504,870,867,864,860,2512,875,872,1781,2490,2489,2487,2485,1748,836,834,832,830,2494,827,2492,843,841,839,845,1765,1763,2701,2676,2674,2653,2648,2656,2634,2633,2631,2629,1821,2638,2636,2770,2763,2761,2750,2745,2753,2736,2735,2733,2731,1848,2740,2738,2786,2784,591,588,576,569,566,2296,1590,537,534,526,2276,522,2274,545,542,539,548,1572,1570,481,2245,466,2242,462,2239,492,485,482,2249,496,494,1534,1531,1528,1538,413,2196,406,2191,2188,425,419,2202,415,2199,432,430,427,1472,1467,1464,433,1476,1474,368,367,2160,365,2159,362,2157,2155,2152,378,377,375,2166,372,2165,369,2162,383,381,379,2168,1419,1418,1416,1414,385,1411,384,1423,1422,1420,1424,2461,802,2441,2439,790,786,783,794,2409,2406,2403,750,742,738,2414,756,753,1720,2367,2365,2362,2359,1663,693,691,684,2373,680,2370,702,699,696,704,1690,1687,2337,2336,2334,2332,1624,2329,1622,640,637,2344,634,2342,630,2340,650,648,645,2346,655,653,1653,1651,1649,1655,2612,2597,2595,2571,2568,2565,2576,2534,2529,2526,1787,2540,2537,907,904,900,910,2503,2502,2500,2498,1768,2495,1767,2510,2508,2506,869,866,863,2513,876,874,1782,2720,2713,2711,2697,2694,2691,2702,2672,2670,2664,1828,2678,2675,2647,2646,2644,2642,1823,2639,1822,2654,2652,2650,2657,2771,1855,2765,2762,1850,1849,2751,2749,2747,2754,353,2148,344,342,336,2142,332,2140,345,1375,1373,306,2130,299,2128,295,2125,319,314,311,2132,1354,1352,1349,1356,262,257,2101,253,2096,2093,274,273,267,2107,263,2104,280,278,275,1316,1311,1308,1320,1318,2052,202,2050,2044,2040,219,2063,212,2060,208,2055,224,221,2066,1260,1258,1252,231,1248,229,1266,1264,1261,1268,155,1998,153,1996,1994,1991,1988,165,164,2007,162,2006,159,2003,2e3,172,171,169,2012,166,2010,1186,1184,1182,1179,175,1176,173,1192,1191,1189,1187,176,1194,1193,2313,2307,2305,592,589,2294,2292,2289,578,572,568,2297,580,1591,2272,2267,2264,1547,538,536,529,2278,525,2275,547,544,541,1574,1571,2237,2235,2229,1493,2225,1489,478,2247,470,2244,465,2241,493,488,484,2250,498,495,1536,1533,1530,1539,2187,2186,2184,2182,1432,2179,1430,2176,1427,414,412,2197,409,2195,405,2193,2190,426,424,421,2203,418,2201,431,429,1473,1471,1469,1466,434,1477,1475,2478,2472,2470,2459,2457,2454,2462,803,2437,2432,2429,1726,2443,2440,792,789,785,2401,2399,2393,1702,2389,1699,2411,2408,2405,745,741,2415,758,755,1721,2358,2357,2355,2353,1661,2350,1660,2347,1657,2368,2366,2364,2361,1666,690,687,2374,683,2372,701,698,705,1691,1689,2619,2617,2610,2608,2605,2613,2593,2588,2585,1803,2599,2596,2563,2561,2555,1797,2551,1795,2573,2570,2567,2577,2525,2524,2522,2520,1786,2517,1785,2514,1783,2535,2533,2531,2528,1788,2541,2539,906,903,911,2721,1844,2715,2712,1838,1836,2699,2696,2693,2703,1827,1826,1824,2673,2671,2669,2666,1829,2679,2677,1858,1857,2772,1854,1853,1851,1856,2766,2764,143,1987,139,1986,135,133,131,1984,128,1983,125,1981,138,137,136,1985,1133,1132,1130,112,110,1974,107,1973,104,1971,1969,122,121,119,117,1977,114,1976,124,1115,1114,1112,1110,1117,1116,84,83,1953,81,1952,78,1950,1948,1945,94,93,91,1959,88,1958,85,1955,99,97,95,1961,1086,1085,1083,1081,1078,100,1090,1089,1087,1091,49,47,1917,44,1915,1913,1910,1907,59,1926,56,1925,53,1922,1919,66,64,1931,61,1929,1042,1040,1038,71,1035,70,1032,68,1048,1047,1045,1043,1050,1049,12,10,1869,1867,1864,1861,21,1880,19,1877,1874,1871,28,1888,25,1886,22,1883,982,980,977,974,32,30,991,989,987,984,34,995,994,992,2151,2150,2147,2146,2144,356,355,354,2149,2139,2138,2136,2134,1359,343,341,338,2143,335,2141,348,347,346,1376,1374,2124,2123,2121,2119,1326,2116,1324,310,308,305,2131,302,2129,298,2127,320,318,316,313,2133,322,321,1355,1353,1351,1357,2092,2091,2089,2087,1276,2084,1274,2081,1271,259,2102,256,2100,252,2098,2095,272,269,2108,266,2106,281,279,277,1317,1315,1313,1310,282,1321,1319,2039,2037,2035,2032,1203,2029,1200,1197,207,2053,205,2051,201,2049,2046,2043,220,218,2064,215,2062,211,2059,228,226,223,2069,1259,1257,1254,232,1251,230,1267,1265,1263,2316,2315,2312,2311,2309,2314,2304,2303,2301,2299,1593,2308,2306,590,2288,2287,2285,2283,1578,2280,1577,2295,2293,2291,579,577,574,571,2298,582,581,1592,2263,2262,2260,2258,1545,2255,1544,2252,1541,2273,2271,2269,2266,1550,535,532,2279,528,2277,546,543,549,1575,1573,2224,2222,2220,1486,2217,1485,2214,1482,1479,2238,2236,2234,2231,1496,2228,1492,480,477,2248,473,2246,469,2243,490,487,2251,497,1537,1535,1532,2477,2476,2474,2479,2469,2468,2466,2464,1730,2473,2471,2453,2452,2450,2448,1729,2445,1728,2460,2458,2456,2463,805,804,2428,2427,2425,2423,1725,2420,1724,2417,1722,2438,2436,2434,2431,1727,2444,2442,793,791,788,795,2388,2386,2384,1697,2381,1696,2378,1694,1692,2402,2400,2398,2395,1703,2392,1701,2412,2410,2407,751,748,744,2416,759,757,1807,2620,2618,1806,1805,2611,2609,2607,2614,1802,1801,1799,2594,2592,2590,2587,1804,2600,2598,1794,1793,1791,1789,2564,2562,2560,2557,1798,2554,1796,2574,2572,2569,2578,1847,1846,2722,1843,1842,1840,1845,2716,2714,1835,1834,1832,1830,1839,1837,2700,2698,2695,2704,1817,1811,1810,897,862,1777,829,826,838,1760,1758,808,2481,1741,1740,1738,1743,2624,1818,2726,2776,782,740,737,1715,686,679,695,1682,1680,639,628,2339,647,644,1645,1643,1640,1648,602,600,597,595,2320,593,2318,609,607,604,1611,1610,1608,1606,613,1615,1613,2328,926,924,892,886,899,857,850,2505,1778,824,823,821,819,2488,818,2486,833,831,828,840,1761,1759,2649,2632,2630,2746,2734,2732,2782,2781,570,567,1587,531,527,523,540,1566,1564,476,467,463,2240,486,483,1524,1521,1518,1529,411,403,2192,399,2189,423,416,1462,1457,1454,428,1468,1465,2210,366,363,2158,360,2156,357,2153,376,373,370,2163,1410,1409,1407,1405,382,1402,380,1417,1415,1412,1421,2175,2174,777,774,771,784,732,725,722,2404,743,1716,676,674,668,2363,665,2360,685,1684,1681,626,624,622,2335,620,2333,617,2330,641,635,649,1646,1644,1642,2566,928,925,2530,2527,894,891,888,2501,2499,2496,858,856,854,851,1779,2692,2668,2665,2645,2643,2640,2651,2768,2759,2757,2744,2743,2741,2748,352,1382,340,337,333,1371,1369,307,300,296,2126,315,312,1347,1342,1350,261,258,250,2097,246,2094,271,268,264,1306,1301,1298,276,1312,1309,2115,203,2048,195,2045,191,2041,213,209,2056,1246,1244,1238,225,1234,222,1256,1253,1249,1262,2080,2079,154,1997,150,1995,147,1992,1989,163,160,2004,156,2001,1175,1174,1172,1170,1167,170,1164,167,1185,1183,1180,1177,174,1190,1188,2025,2024,2022,587,586,564,559,556,2290,573,1588,520,518,512,2268,508,2265,530,1568,1565,461,457,2233,450,2230,446,2226,479,471,489,1526,1523,1520,397,395,2185,392,2183,389,2180,2177,410,2194,402,422,1463,1461,1459,1456,1470,2455,799,2433,2430,779,776,773,2397,2394,2390,734,728,724,746,1717,2356,2354,2351,2348,1658,677,675,673,670,667,688,1685,1683,2606,2589,2586,2559,2556,2552,927,2523,2521,2518,2515,1784,2532,895,893,890,2718,2709,2707,2689,2687,2684,2663,2662,2660,2658,1825,2667,2769,1852,2760,2758,142,141,1139,1138,134,132,129,126,1982,1129,1128,1126,1131,113,111,108,105,1972,101,1970,120,118,115,1109,1108,1106,1104,123,1113,1111,82,79,1951,75,1949,72,1946,92,89,86,1956,1077,1076,1074,1072,98,1069,96,1084,1082,1079,1088,1968,1967,48,45,1916,42,1914,39,1911,1908,60,57,54,1923,50,1920,1031,1030,1028,1026,67,1023,65,1020,62,1041,1039,1036,1033,69,1046,1044,1944,1943,1941,11,9,1868,7,1865,1862,1859,20,1878,16,1875,13,1872,970,968,966,963,29,960,26,23,983,981,978,975,33,971,31,990,988,985,1906,1904,1902,993,351,2145,1383,331,330,328,326,2137,323,2135,339,1372,1370,294,293,291,289,2122,286,2120,283,2117,309,303,317,1348,1346,1344,245,244,242,2090,239,2088,236,2085,2082,260,2099,249,270,1307,1305,1303,1300,1314,189,2038,186,2036,183,2033,2030,2026,206,198,2047,194,216,1247,1245,1243,1240,227,1237,1255,2310,2302,2300,2286,2284,2281,565,563,561,558,575,1589,2261,2259,2256,2253,1542,521,519,517,514,2270,511,533,1569,1567,2223,2221,2218,2215,1483,2211,1480,459,456,453,2232,449,474,491,1527,1525,1522,2475,2467,2465,2451,2449,2446,801,800,2426,2424,2421,2418,1723,2435,780,778,775,2387,2385,2382,2379,1695,2375,1693,2396,735,733,730,727,749,1718,2616,2615,2604,2603,2601,2584,2583,2581,2579,1800,2591,2550,2549,2547,2545,1792,2542,1790,2558,929,2719,1841,2710,2708,1833,1831,2690,2688,2686,1815,1809,1808,1774,1756,1754,1737,1736,1734,1739,1816,1711,1676,1674,633,629,1638,1636,1633,1641,598,1605,1604,1602,1600,605,1609,1607,2327,887,853,1775,822,820,1757,1755,1584,524,1560,1558,468,464,1514,1511,1508,1519,408,404,400,1452,1447,1444,417,1458,1455,2208,364,361,358,2154,1401,1400,1398,1396,374,1393,371,1408,1406,1403,1413,2173,2172,772,726,723,1712,672,669,666,682,1678,1675,625,623,621,618,2331,636,632,1639,1637,1635,920,918,884,880,889,849,848,847,846,2497,855,852,1776,2641,2742,2787,1380,334,1367,1365,301,297,1340,1338,1335,1343,255,251,247,1296,1291,1288,265,1302,1299,2113,204,196,192,2042,1232,1230,1224,214,1220,210,1242,1239,1235,1250,2077,2075,151,148,1993,144,1990,1163,1162,1160,1158,1155,161,1152,157,1173,1171,1168,1165,168,1181,1178,2021,2020,2018,2023,585,560,557,1585,516,509,1562,1559,458,447,2227,472,1516,1513,1510,398,396,393,390,2181,386,2178,407,1453,1451,1449,1446,420,1460,2209,769,764,720,712,2391,729,1713,664,663,661,659,2352,656,2349,671,1679,1677,2553,922,919,2519,2516,885,883,881,2685,2661,2659,2767,2756,2755,140,1137,1136,130,127,1125,1124,1122,1127,109,106,102,1103,1102,1100,1098,116,1107,1105,1980,80,76,73,1947,1068,1067,1065,1063,90,1060,87,1075,1073,1070,1080,1966,1965,46,43,40,1912,36,1909,1019,1018,1016,1014,58,1011,55,1008,51,1029,1027,1024,1021,63,1037,1034,1940,1939,1937,1942,8,1866,4,1863,1,1860,956,954,952,949,946,17,14,969,967,964,961,27,957,24,979,976,972,1901,1900,1898,1896,986,1905,1903,350,349,1381,329,327,324,1368,1366,292,290,287,284,2118,304,1341,1339,1337,1345,243,240,237,2086,233,2083,254,1297,1295,1293,1290,1304,2114,190,187,184,2034,180,2031,177,2027,199,1233,1231,1229,1226,217,1223,1241,2078,2076,584,555,554,552,550,2282,562,1586,507,506,504,502,2257,499,2254,515,1563,1561,445,443,441,2219,438,2216,435,2212,460,454,475,1517,1515,1512,2447,798,797,2422,2419,770,768,766,2383,2380,2376,721,719,717,714,731,1714,2602,2582,2580,2548,2546,2543,923,921,2717,2706,2705,2683,2682,2680,1771,1752,1750,1733,1732,1731,1735,1814,1707,1670,1668,1631,1629,1626,1634,1599,1598,1596,1594,1603,1601,2326,1772,1753,1751,1581,1554,1552,1504,1501,1498,1509,1442,1437,1434,401,1448,1445,2206,1392,1391,1389,1387,1384,359,1399,1397,1394,1404,2171,2170,1708,1672,1669,619,1632,1630,1628,1773,1378,1363,1361,1333,1328,1336,1286,1281,1278,248,1292,1289,2111,1218,1216,1210,197,1206,193,1228,1225,1221,1236,2073,2071,1151,1150,1148,1146,152,1143,149,1140,145,1161,1159,1156,1153,158,1169,1166,2017,2016,2014,2019,1582,510,1556,1553,452,448,1506,1500,394,391,387,1443,1441,1439,1436,1450,2207,765,716,713,1709,662,660,657,1673,1671,916,914,879,878,877,882,1135,1134,1121,1120,1118,1123,1097,1096,1094,1092,103,1101,1099,1979,1059,1058,1056,1054,77,1051,74,1066,1064,1061,1071,1964,1963,1007,1006,1004,1002,999,41,996,37,1017,1015,1012,1009,52,1025,1022,1936,1935,1933,1938,942,940,938,935,932,5,2,955,953,950,947,18,943,15,965,962,958,1895,1894,1892,1890,973,1899,1897,1379,325,1364,1362,288,285,1334,1332,1330,241,238,234,1287,1285,1283,1280,1294,2112,188,185,181,178,2028,1219,1217,1215,1212,200,1209,1227,2074,2072,583,553,551,1583,505,503,500,513,1557,1555,444,442,439,436,2213,455,451,1507,1505,1502,796,763,762,760,767,711,710,708,706,2377,718,715,1710,2544,917,915,2681,1627,1597,1595,2325,1769,1749,1747,1499,1438,1435,2204,1390,1388,1385,1395,2169,2167,1704,1665,1662,1625,1623,1620,1770,1329,1282,1279,2109,1214,1207,1222,2068,2065,1149,1147,1144,1141,146,1157,1154,2013,2011,2008,2015,1579,1549,1546,1495,1487,1433,1431,1428,1425,388,1440,2205,1705,658,1667,1664,1119,1095,1093,1978,1057,1055,1052,1062,1962,1960,1005,1003,1e3,997,38,1013,1010,1932,1930,1927,1934,941,939,936,933,6,930,3,951,948,944,1889,1887,1884,1881,959,1893,1891,35,1377,1360,1358,1327,1325,1322,1331,1277,1275,1272,1269,235,1284,2110,1205,1204,1201,1198,182,1195,179,1213,2070,2067,1580,501,1551,1548,440,437,1497,1494,1490,1503,761,709,707,1706,913,912,2198,1386,2164,2161,1621,1766,2103,1208,2058,2054,1145,1142,2005,2002,1999,2009,1488,1429,1426,2200,1698,1659,1656,1975,1053,1957,1954,1001,998,1924,1921,1918,1928,937,934,931,1879,1876,1873,1870,945,1885,1882,1323,1273,1270,2105,1202,1199,1196,1211,2061,2057,1576,1543,1540,1484,1481,1478,1491,1700]);class sl{constructor(e,t){this.bits=e,this.points=t}getBits(){return this.bits}getPoints(){return this.points}}class le{static detectMultiple(e,t,i){let r=e.getBlackMatrix(),s=le.detect(i,r);return s.length||(r=r.clone(),r.rotate180(),s=le.detect(i,r)),new sl(r,s)}static detect(e,t){const i=new Array;let r=0,s=0,l=!1;for(;r<t.getHeight();){const c=le.findVertices(t,r,s);if(c[0]==null&&c[3]==null){if(!l)break;l=!1,s=0;for(const h of i)h[1]!=null&&(r=Math.trunc(Math.max(r,h[1].getY()))),h[3]!=null&&(r=Math.max(r,Math.trunc(h[3].getY())));r+=le.ROW_STEP;continue}if(l=!0,i.push(c),!e)break;c[2]!=null?(s=Math.trunc(c[2].getX()),r=Math.trunc(c[2].getY())):(s=Math.trunc(c[4].getX()),r=Math.trunc(c[4].getY()))}return i}static findVertices(e,t,i){const r=e.getHeight(),s=e.getWidth(),l=new Array(8);return le.copyToResult(l,le.findRowsWithPattern(e,r,s,t,i,le.START_PATTERN),le.INDEXES_START_PATTERN),l[4]!=null&&(i=Math.trunc(l[4].getX()),t=Math.trunc(l[4].getY())),le.copyToResult(l,le.findRowsWithPattern(e,r,s,t,i,le.STOP_PATTERN),le.INDEXES_STOP_PATTERN),l}static copyToResult(e,t,i){for(let r=0;r<i.length;r++)e[i[r]]=t[r]}static findRowsWithPattern(e,t,i,r,s,l){const c=new Array(4);let h=!1;const f=new Int32Array(l.length);for(;r<t;r+=le.ROW_STEP){let b=le.findGuardPattern(e,s,r,i,!1,l,f);if(b!=null){for(;r>0;){const w=le.findGuardPattern(e,s,--r,i,!1,l,f);if(w!=null)b=w;else{r++;break}}c[0]=new j(b[0],r),c[1]=new j(b[1],r),h=!0;break}}let p=r+1;if(h){let b=0,w=Int32Array.from([Math.trunc(c[0].getX()),Math.trunc(c[1].getX())]);for(;p<t;p++){const y=le.findGuardPattern(e,w[0],p,i,!1,l,f);if(y!=null&&Math.abs(w[0]-y[0])<le.MAX_PATTERN_DRIFT&&Math.abs(w[1]-y[1])<le.MAX_PATTERN_DRIFT)w=y,b=0;else{if(b>le.SKIPPED_ROW_COUNT_MAX)break;b++}}p-=b+1,c[2]=new j(w[0],p),c[3]=new j(w[1],p)}return p-r<le.BARCODE_MIN_HEIGHT&&ce.fill(c,null),c}static findGuardPattern(e,t,i,r,s,l,c){ce.fillWithin(c,0,c.length,0);let h=t,f=0;for(;e.get(h,i)&&h>0&&f++<le.MAX_PIXEL_DRIFT;)h--;let p=h,b=0,w=l.length;for(let y=s;p<r;p++)if(e.get(p,i)!==y)c[b]++;else{if(b===w-1){if(le.patternMatchVariance(c,l,le.MAX_INDIVIDUAL_VARIANCE)<le.MAX_AVG_VARIANCE)return new Int32Array([h,p]);h+=c[0]+c[1],te.arraycopy(c,2,c,0,b-1),c[b-1]=0,c[b]=0,b--}else b++;c[b]=1,y=!y}return b===w-1&&le.patternMatchVariance(c,l,le.MAX_INDIVIDUAL_VARIANCE)<le.MAX_AVG_VARIANCE?new Int32Array([h,p-1]):null}static patternMatchVariance(e,t,i){let r=e.length,s=0,l=0;for(let f=0;f<r;f++)s+=e[f],l+=t[f];if(s<l)return 1/0;let c=s/l;i*=c;let h=0;for(let f=0;f<r;f++){let p=e[f],b=t[f]*c,w=p>b?p-b:b-p;if(w>i)return 1/0;h+=w}return h/s}}le.INDEXES_START_PATTERN=Int32Array.from([0,4,1,5]),le.INDEXES_STOP_PATTERN=Int32Array.from([6,2,7,3]),le.MAX_AVG_VARIANCE=.42,le.MAX_INDIVIDUAL_VARIANCE=.8,le.START_PATTERN=Int32Array.from([8,1,1,1,1,1,1,3]),le.STOP_PATTERN=Int32Array.from([7,1,1,3,1,1,1,2,1]),le.MAX_PIXEL_DRIFT=3,le.MAX_PATTERN_DRIFT=5,le.SKIPPED_ROW_COUNT_MAX=25,le.ROW_STEP=5,le.BARCODE_MIN_HEIGHT=10;class it{constructor(e,t){if(t.length===0)throw new I;this.field=e;let i=t.length;if(i>1&&t[0]===0){let r=1;for(;r<i&&t[r]===0;)r++;r===i?this.coefficients=new Int32Array([0]):(this.coefficients=new Int32Array(i-r),te.arraycopy(t,r,this.coefficients,0,this.coefficients.length))}else this.coefficients=t}getCoefficients(){return this.coefficients}getDegree(){return this.coefficients.length-1}isZero(){return this.coefficients[0]===0}getCoefficient(e){return this.coefficients[this.coefficients.length-1-e]}evaluateAt(e){if(e===0)return this.getCoefficient(0);if(e===1){let r=0;for(let s of this.coefficients)r=this.field.add(r,s);return r}let t=this.coefficients[0],i=this.coefficients.length;for(let r=1;r<i;r++)t=this.field.add(this.field.multiply(e,t),this.coefficients[r]);return t}add(e){if(!this.field.equals(e.field))throw new I("ModulusPolys do not have same ModulusGF field");if(this.isZero())return e;if(e.isZero())return this;let t=this.coefficients,i=e.coefficients;if(t.length>i.length){let l=t;t=i,i=l}let r=new Int32Array(i.length),s=i.length-t.length;te.arraycopy(i,0,r,0,s);for(let l=s;l<i.length;l++)r[l]=this.field.add(t[l-s],i[l]);return new it(this.field,r)}subtract(e){if(!this.field.equals(e.field))throw new I("ModulusPolys do not have same ModulusGF field");return e.isZero()?this:this.add(e.negative())}multiply(e){return e instanceof it?this.multiplyOther(e):this.multiplyScalar(e)}multiplyOther(e){if(!this.field.equals(e.field))throw new I("ModulusPolys do not have same ModulusGF field");if(this.isZero()||e.isZero())return new it(this.field,new Int32Array([0]));let t=this.coefficients,i=t.length,r=e.coefficients,s=r.length,l=new Int32Array(i+s-1);for(let c=0;c<i;c++){let h=t[c];for(let f=0;f<s;f++)l[c+f]=this.field.add(l[c+f],this.field.multiply(h,r[f]))}return new it(this.field,l)}negative(){let e=this.coefficients.length,t=new Int32Array(e);for(let i=0;i<e;i++)t[i]=this.field.subtract(0,this.coefficients[i]);return new it(this.field,t)}multiplyScalar(e){if(e===0)return new it(this.field,new Int32Array([0]));if(e===1)return this;let t=this.coefficients.length,i=new Int32Array(t);for(let r=0;r<t;r++)i[r]=this.field.multiply(this.coefficients[r],e);return new it(this.field,i)}multiplyByMonomial(e,t){if(e<0)throw new I;if(t===0)return new it(this.field,new Int32Array([0]));let i=this.coefficients.length,r=new Int32Array(i+e);for(let s=0;s<i;s++)r[s]=this.field.multiply(this.coefficients[s],t);return new it(this.field,r)}toString(){let e=new ae;for(let t=this.getDegree();t>=0;t--){let i=this.getCoefficient(t);i!==0&&(i<0?(e.append(" - "),i=-i):e.length()>0&&e.append(" + "),(t===0||i!==1)&&e.append(i),t!==0&&(t===1?e.append("x"):(e.append("x^"),e.append(t))))}return e.toString()}}class al{add(e,t){return(e+t)%this.modulus}subtract(e,t){return(this.modulus+e-t)%this.modulus}exp(e){return this.expTable[e]}log(e){if(e===0)throw new I;return this.logTable[e]}inverse(e){if(e===0)throw new Xr;return this.expTable[this.modulus-this.logTable[e]-1]}multiply(e,t){return e===0||t===0?0:this.expTable[(this.logTable[e]+this.logTable[t])%(this.modulus-1)]}getSize(){return this.modulus}equals(e){return e===this}}class zn extends al{constructor(e,t){super(),this.modulus=e,this.expTable=new Int32Array(e),this.logTable=new Int32Array(e);let i=1;for(let r=0;r<e;r++)this.expTable[r]=i,i=i*t%e;for(let r=0;r<e-1;r++)this.logTable[this.expTable[r]]=r;this.zero=new it(this,new Int32Array([0])),this.one=new it(this,new Int32Array([1]))}getZero(){return this.zero}getOne(){return this.one}buildMonomial(e,t){if(e<0)throw new I;if(t===0)return this.zero;let i=new Int32Array(e+1);return i[0]=t,new it(this,i)}}zn.PDF417_GF=new zn(ee.NUMBER_OF_CODEWORDS,3);class Js{constructor(){this.field=zn.PDF417_GF}decode(e,t,i){let r=new it(this.field,e),s=new Int32Array(t),l=!1;for(let E=t;E>0;E--){let S=r.evaluateAt(this.field.exp(E));s[t-E]=S,S!==0&&(l=!0)}if(!l)return 0;let c=this.field.getOne();if(i!=null)for(const E of i){let S=this.field.exp(e.length-1-E),T=new it(this.field,new Int32Array([this.field.subtract(0,S),1]));c=c.multiply(T)}let h=new it(this.field,s),f=this.runEuclideanAlgorithm(this.field.buildMonomial(t,1),h,t),p=f[0],b=f[1],w=this.findErrorLocations(p),y=this.findErrorMagnitudes(b,p,w);for(let E=0;E<w.length;E++){let S=e.length-1-this.field.log(w[E]);if(S<0)throw X.getChecksumInstance();e[S]=this.field.subtract(e[S],y[E])}return w.length}runEuclideanAlgorithm(e,t,i){if(e.getDegree()<t.getDegree()){let w=e;e=t,t=w}let r=e,s=t,l=this.field.getZero(),c=this.field.getOne();for(;s.getDegree()>=Math.round(i/2);){let w=r,y=l;if(r=s,l=c,r.isZero())throw X.getChecksumInstance();s=w;let E=this.field.getZero(),S=r.getCoefficient(r.getDegree()),T=this.field.inverse(S);for(;s.getDegree()>=r.getDegree()&&!s.isZero();){let R=s.getDegree()-r.getDegree(),U=this.field.multiply(s.getCoefficient(s.getDegree()),T);E=E.add(this.field.buildMonomial(R,U)),s=s.subtract(r.multiplyByMonomial(R,U))}c=E.multiply(l).subtract(y).negative()}let h=c.getCoefficient(0);if(h===0)throw X.getChecksumInstance();let f=this.field.inverse(h),p=c.multiply(f),b=s.multiply(f);return[p,b]}findErrorLocations(e){let t=e.getDegree(),i=new Int32Array(t),r=0;for(let s=1;s<this.field.getSize()&&r<t;s++)e.evaluateAt(s)===0&&(i[r]=this.field.inverse(s),r++);if(r!==t)throw X.getChecksumInstance();return i}findErrorMagnitudes(e,t,i){let r=t.getDegree(),s=new Int32Array(r);for(let f=1;f<=r;f++)s[r-f]=this.field.multiply(f,t.getCoefficient(f));let l=new it(this.field,s),c=i.length,h=new Int32Array(c);for(let f=0;f<c;f++){let p=this.field.inverse(i[f]),b=this.field.subtract(0,e.evaluateAt(p)),w=this.field.inverse(l.evaluateAt(p));h[f]=this.field.multiply(b,w)}return h}}class Ii{constructor(e,t,i,r,s){e instanceof Ii?this.constructor_2(e):this.constructor_1(e,t,i,r,s)}constructor_1(e,t,i,r,s){const l=t==null||i==null,c=r==null||s==null;if(l&&c)throw new D;l?(t=new j(0,r.getY()),i=new j(0,s.getY())):c&&(r=new j(e.getWidth()-1,t.getY()),s=new j(e.getWidth()-1,i.getY())),this.image=e,this.topLeft=t,this.bottomLeft=i,this.topRight=r,this.bottomRight=s,this.minX=Math.trunc(Math.min(t.getX(),i.getX())),this.maxX=Math.trunc(Math.max(r.getX(),s.getX())),this.minY=Math.trunc(Math.min(t.getY(),r.getY())),this.maxY=Math.trunc(Math.max(i.getY(),s.getY()))}constructor_2(e){this.image=e.image,this.topLeft=e.getTopLeft(),this.bottomLeft=e.getBottomLeft(),this.topRight=e.getTopRight(),this.bottomRight=e.getBottomRight(),this.minX=e.getMinX(),this.maxX=e.getMaxX(),this.minY=e.getMinY(),this.maxY=e.getMaxY()}static merge(e,t){return e==null?t:t==null?e:new Ii(e.image,e.topLeft,e.bottomLeft,t.topRight,t.bottomRight)}addMissingRows(e,t,i){let r=this.topLeft,s=this.bottomLeft,l=this.topRight,c=this.bottomRight;if(e>0){let h=i?this.topLeft:this.topRight,f=Math.trunc(h.getY()-e);f<0&&(f=0);let p=new j(h.getX(),f);i?r=p:l=p}if(t>0){let h=i?this.bottomLeft:this.bottomRight,f=Math.trunc(h.getY()+t);f>=this.image.getHeight()&&(f=this.image.getHeight()-1);let p=new j(h.getX(),f);i?s=p:c=p}return new Ii(this.image,r,s,l,c)}getMinX(){return this.minX}getMaxX(){return this.maxX}getMinY(){return this.minY}getMaxY(){return this.maxY}getTopLeft(){return this.topLeft}getTopRight(){return this.topRight}getBottomLeft(){return this.bottomLeft}getBottomRight(){return this.bottomRight}}class ol{constructor(e,t,i,r){this.columnCount=e,this.errorCorrectionLevel=r,this.rowCountUpperPart=t,this.rowCountLowerPart=i,this.rowCount=t+i}getColumnCount(){return this.columnCount}getErrorCorrectionLevel(){return this.errorCorrectionLevel}getRowCount(){return this.rowCount}getRowCountUpperPart(){return this.rowCountUpperPart}getRowCountLowerPart(){return this.rowCountLowerPart}}class vr{constructor(){this.buffer=""}static form(e,t){let i=-1;function r(l,c,h,f,p,b){if(l==="%%")return"%";if(t[++i]===void 0)return;l=f?parseInt(f.substr(1)):void 0;let w=p?parseInt(p.substr(1)):void 0,y;switch(b){case"s":y=t[i];break;case"c":y=t[i][0];break;case"f":y=parseFloat(t[i]).toFixed(l);break;case"p":y=parseFloat(t[i]).toPrecision(l);break;case"e":y=parseFloat(t[i]).toExponential(l);break;case"x":y=parseInt(t[i]).toString(w||16);break;case"d":y=parseFloat(parseInt(t[i],w||10).toPrecision(l)).toFixed(0);break}y=typeof y=="object"?JSON.stringify(y):(+y).toString(w);let E=parseInt(h),S=h&&h[0]+""=="0"?"0":" ";for(;y.length<E;)y=c!==void 0?y+S:S+y;return y}let s=/%(-)?(0?[0-9]+)?([.][0-9]+)?([#][0-9]+)?([scfpexd%])/g;return e.replace(s,r)}format(e,...t){this.buffer+=vr.form(e,t)}toString(){return this.buffer}}class yr{constructor(e){this.boundingBox=new Ii(e),this.codewords=new Array(e.getMaxY()-e.getMinY()+1)}getCodewordNearby(e){let t=this.getCodeword(e);if(t!=null)return t;for(let i=1;i<yr.MAX_NEARBY_DISTANCE;i++){let r=this.imageRowToCodewordIndex(e)-i;if(r>=0&&(t=this.codewords[r],t!=null)||(r=this.imageRowToCodewordIndex(e)+i,r<this.codewords.length&&(t=this.codewords[r],t!=null)))return t}return null}imageRowToCodewordIndex(e){return e-this.boundingBox.getMinY()}setCodeword(e,t){this.codewords[this.imageRowToCodewordIndex(e)]=t}getCodeword(e){return this.codewords[this.imageRowToCodewordIndex(e)]}getBoundingBox(){return this.boundingBox}getCodewords(){return this.codewords}toString(){const e=new vr;let t=0;for(const i of this.codewords){if(i==null){e.format("%3d:    |   %n",t++);continue}e.format("%3d: %3d|%3d%n",t++,i.getRowNumber(),i.getValue())}return e.toString()}}yr.MAX_NEARBY_DISTANCE=5;class Cr{constructor(){this.values=new Map}setValue(e){e=Math.trunc(e);let t=this.values.get(e);t==null&&(t=0),t++,this.values.set(e,t)}getValue(){let e=-1,t=new Array;for(const[i,r]of this.values.entries()){const s={getKey:()=>i,getValue:()=>r};s.getValue()>e?(e=s.getValue(),t=[],t.push(s.getKey())):s.getValue()===e&&t.push(s.getKey())}return ee.toIntArray(t)}getConfidence(e){return this.values.get(e)}}class ea extends yr{constructor(e,t){super(e),this._isLeft=t}setRowNumbers(){for(let e of this.getCodewords())e!=null&&e.setRowNumberAsRowIndicatorColumn()}adjustCompleteIndicatorColumnRowNumbers(e){let t=this.getCodewords();this.setRowNumbers(),this.removeIncorrectCodewords(t,e);let i=this.getBoundingBox(),r=this._isLeft?i.getTopLeft():i.getTopRight(),s=this._isLeft?i.getBottomLeft():i.getBottomRight(),l=this.imageRowToCodewordIndex(Math.trunc(r.getY())),c=this.imageRowToCodewordIndex(Math.trunc(s.getY())),h=-1,f=1,p=0;for(let b=l;b<c;b++){if(t[b]==null)continue;let w=t[b],y=w.getRowNumber()-h;if(y===0)p++;else if(y===1)f=Math.max(f,p),p=1,h=w.getRowNumber();else if(y<0||w.getRowNumber()>=e.getRowCount()||y>b)t[b]=null;else{let E;f>2?E=(f-2)*y:E=y;let S=E>=b;for(let T=1;T<=E&&!S;T++)S=t[b-T]!=null;S?t[b]=null:(h=w.getRowNumber(),p=1)}}}getRowHeights(){let e=this.getBarcodeMetadata();if(e==null)return null;this.adjustIncompleteIndicatorColumnRowNumbers(e);let t=new Int32Array(e.getRowCount());for(let i of this.getCodewords())if(i!=null){let r=i.getRowNumber();if(r>=t.length)continue;t[r]++}return t}adjustIncompleteIndicatorColumnRowNumbers(e){let t=this.getBoundingBox(),i=this._isLeft?t.getTopLeft():t.getTopRight(),r=this._isLeft?t.getBottomLeft():t.getBottomRight(),s=this.imageRowToCodewordIndex(Math.trunc(i.getY())),l=this.imageRowToCodewordIndex(Math.trunc(r.getY())),c=this.getCodewords(),h=-1;for(let f=s;f<l;f++){if(c[f]==null)continue;let p=c[f];p.setRowNumberAsRowIndicatorColumn();let b=p.getRowNumber()-h;b===0||(b===1?h=p.getRowNumber():p.getRowNumber()>=e.getRowCount()?c[f]=null:h=p.getRowNumber())}}getBarcodeMetadata(){let e=this.getCodewords(),t=new Cr,i=new Cr,r=new Cr,s=new Cr;for(let c of e){if(c==null)continue;c.setRowNumberAsRowIndicatorColumn();let h=c.getValue()%30,f=c.getRowNumber();switch(this._isLeft||(f+=2),f%3){case 0:i.setValue(h*3+1);break;case 1:s.setValue(h/3),r.setValue(h%3);break;case 2:t.setValue(h+1);break}}if(t.getValue().length===0||i.getValue().length===0||r.getValue().length===0||s.getValue().length===0||t.getValue()[0]<1||i.getValue()[0]+r.getValue()[0]<ee.MIN_ROWS_IN_BARCODE||i.getValue()[0]+r.getValue()[0]>ee.MAX_ROWS_IN_BARCODE)return null;let l=new ol(t.getValue()[0],i.getValue()[0],r.getValue()[0],s.getValue()[0]);return this.removeIncorrectCodewords(e,l),l}removeIncorrectCodewords(e,t){for(let i=0;i<e.length;i++){let r=e[i];if(e[i]==null)continue;let s=r.getValue()%30,l=r.getRowNumber();if(l>t.getRowCount()){e[i]=null;continue}switch(this._isLeft||(l+=2),l%3){case 0:s*3+1!==t.getRowCountUpperPart()&&(e[i]=null);break;case 1:(Math.trunc(s/3)!==t.getErrorCorrectionLevel()||s%3!==t.getRowCountLowerPart())&&(e[i]=null);break;case 2:s+1!==t.getColumnCount()&&(e[i]=null);break}}}isLeft(){return this._isLeft}toString(){return"IsLeft: "+this._isLeft+`
`+super.toString()}}class Ar{constructor(e,t){this.ADJUST_ROW_NUMBER_SKIP=2,this.barcodeMetadata=e,this.barcodeColumnCount=e.getColumnCount(),this.boundingBox=t,this.detectionResultColumns=new Array(this.barcodeColumnCount+2)}getDetectionResultColumns(){this.adjustIndicatorColumnRowNumbers(this.detectionResultColumns[0]),this.adjustIndicatorColumnRowNumbers(this.detectionResultColumns[this.barcodeColumnCount+1]);let e=ee.MAX_CODEWORDS_IN_BARCODE,t;do t=e,e=this.adjustRowNumbersAndGetCount();while(e>0&&e<t);return this.detectionResultColumns}adjustIndicatorColumnRowNumbers(e){e!=null&&e.adjustCompleteIndicatorColumnRowNumbers(this.barcodeMetadata)}adjustRowNumbersAndGetCount(){let e=this.adjustRowNumbersByRow();if(e===0)return 0;for(let t=1;t<this.barcodeColumnCount+1;t++){let i=this.detectionResultColumns[t].getCodewords();for(let r=0;r<i.length;r++)i[r]!=null&&(i[r].hasValidRowNumber()||this.adjustRowNumbers(t,r,i))}return e}adjustRowNumbersByRow(){return this.adjustRowNumbersFromBothRI(),this.adjustRowNumbersFromLRI()+this.adjustRowNumbersFromRRI()}adjustRowNumbersFromBothRI(){if(this.detectionResultColumns[0]==null||this.detectionResultColumns[this.barcodeColumnCount+1]==null)return;let e=this.detectionResultColumns[0].getCodewords(),t=this.detectionResultColumns[this.barcodeColumnCount+1].getCodewords();for(let i=0;i<e.length;i++)if(e[i]!=null&&t[i]!=null&&e[i].getRowNumber()===t[i].getRowNumber())for(let r=1;r<=this.barcodeColumnCount;r++){let s=this.detectionResultColumns[r].getCodewords()[i];s!=null&&(s.setRowNumber(e[i].getRowNumber()),s.hasValidRowNumber()||(this.detectionResultColumns[r].getCodewords()[i]=null))}}adjustRowNumbersFromRRI(){if(this.detectionResultColumns[this.barcodeColumnCount+1]==null)return 0;let e=0,t=this.detectionResultColumns[this.barcodeColumnCount+1].getCodewords();for(let i=0;i<t.length;i++){if(t[i]==null)continue;let r=t[i].getRowNumber(),s=0;for(let l=this.barcodeColumnCount+1;l>0&&s<this.ADJUST_ROW_NUMBER_SKIP;l--){let c=this.detectionResultColumns[l].getCodewords()[i];c!=null&&(s=Ar.adjustRowNumberIfValid(r,s,c),c.hasValidRowNumber()||e++)}}return e}adjustRowNumbersFromLRI(){if(this.detectionResultColumns[0]==null)return 0;let e=0,t=this.detectionResultColumns[0].getCodewords();for(let i=0;i<t.length;i++){if(t[i]==null)continue;let r=t[i].getRowNumber(),s=0;for(let l=1;l<this.barcodeColumnCount+1&&s<this.ADJUST_ROW_NUMBER_SKIP;l++){let c=this.detectionResultColumns[l].getCodewords()[i];c!=null&&(s=Ar.adjustRowNumberIfValid(r,s,c),c.hasValidRowNumber()||e++)}}return e}static adjustRowNumberIfValid(e,t,i){return i==null||i.hasValidRowNumber()||(i.isValidRowNumber(e)?(i.setRowNumber(e),t=0):++t),t}adjustRowNumbers(e,t,i){if(!this.detectionResultColumns[e-1])return;let r=i[t],s=this.detectionResultColumns[e-1].getCodewords(),l=s;this.detectionResultColumns[e+1]!=null&&(l=this.detectionResultColumns[e+1].getCodewords());let c=new Array(14);c[2]=s[t],c[3]=l[t],t>0&&(c[0]=i[t-1],c[4]=s[t-1],c[5]=l[t-1]),t>1&&(c[8]=i[t-2],c[10]=s[t-2],c[11]=l[t-2]),t<i.length-1&&(c[1]=i[t+1],c[6]=s[t+1],c[7]=l[t+1]),t<i.length-2&&(c[9]=i[t+2],c[12]=s[t+2],c[13]=l[t+2]);for(let h of c)if(Ar.adjustRowNumber(r,h))return}static adjustRowNumber(e,t){return t==null?!1:t.hasValidRowNumber()&&t.getBucket()===e.getBucket()?(e.setRowNumber(t.getRowNumber()),!0):!1}getBarcodeColumnCount(){return this.barcodeColumnCount}getBarcodeRowCount(){return this.barcodeMetadata.getRowCount()}getBarcodeECLevel(){return this.barcodeMetadata.getErrorCorrectionLevel()}setBoundingBox(e){this.boundingBox=e}getBoundingBox(){return this.boundingBox}setDetectionResultColumn(e,t){this.detectionResultColumns[e]=t}getDetectionResultColumn(e){return this.detectionResultColumns[e]}toString(){let e=this.detectionResultColumns[0];e==null&&(e=this.detectionResultColumns[this.barcodeColumnCount+1]);let t=new vr;for(let i=0;i<e.getCodewords().length;i++){t.format("CW %3d:",i);for(let r=0;r<this.barcodeColumnCount+2;r++){if(this.detectionResultColumns[r]==null){t.format("    |   ");continue}let s=this.detectionResultColumns[r].getCodewords()[i];if(s==null){t.format("    |   ");continue}t.format(" %3d|%3d",s.getRowNumber(),s.getValue())}t.format("%n")}return t.toString()}}class Er{constructor(e,t,i,r){this.rowNumber=Er.BARCODE_ROW_UNKNOWN,this.startX=Math.trunc(e),this.endX=Math.trunc(t),this.bucket=Math.trunc(i),this.value=Math.trunc(r)}hasValidRowNumber(){return this.isValidRowNumber(this.rowNumber)}isValidRowNumber(e){return e!==Er.BARCODE_ROW_UNKNOWN&&this.bucket===e%3*3}setRowNumberAsRowIndicatorColumn(){this.rowNumber=Math.trunc(Math.trunc(this.value/30)*3+Math.trunc(this.bucket/3))}getWidth(){return this.endX-this.startX}getStartX(){return this.startX}getEndX(){return this.endX}getBucket(){return this.bucket}getValue(){return this.value}getRowNumber(){return this.rowNumber}setRowNumber(e){this.rowNumber=e}toString(){return this.rowNumber+"|"+this.value}}Er.BARCODE_ROW_UNKNOWN=-1;class bt{static initialize(){for(let e=0;e<ee.SYMBOL_TABLE.length;e++){let t=ee.SYMBOL_TABLE[e],i=t&1;for(let r=0;r<ee.BARS_IN_MODULE;r++){let s=0;for(;(t&1)===i;)s+=1,t>>=1;i=t&1,bt.RATIOS_TABLE[e]||(bt.RATIOS_TABLE[e]=new Array(ee.BARS_IN_MODULE)),bt.RATIOS_TABLE[e][ee.BARS_IN_MODULE-r-1]=Math.fround(s/ee.MODULES_IN_CODEWORD)}}this.bSymbolTableReady=!0}static getDecodedValue(e){let t=bt.getDecodedCodewordValue(bt.sampleBitCounts(e));return t!==-1?t:bt.getClosestDecodedValue(e)}static sampleBitCounts(e){let t=me.sum(e),i=new Int32Array(ee.BARS_IN_MODULE),r=0,s=0;for(let l=0;l<ee.MODULES_IN_CODEWORD;l++){let c=t/(2*ee.MODULES_IN_CODEWORD)+l*t/ee.MODULES_IN_CODEWORD;s+e[r]<=c&&(s+=e[r],r++),i[r]++}return i}static getDecodedCodewordValue(e){let t=bt.getBitValue(e);return ee.getCodeword(t)===-1?-1:t}static getBitValue(e){let t=0;for(let i=0;i<e.length;i++)for(let r=0;r<e[i];r++)t=t<<1|(i%2===0?1:0);return Math.trunc(t)}static getClosestDecodedValue(e){let t=me.sum(e),i=new Array(ee.BARS_IN_MODULE);if(t>1)for(let l=0;l<i.length;l++)i[l]=Math.fround(e[l]/t);let r=jr.MAX_VALUE,s=-1;this.bSymbolTableReady||bt.initialize();for(let l=0;l<bt.RATIOS_TABLE.length;l++){let c=0,h=bt.RATIOS_TABLE[l];for(let f=0;f<ee.BARS_IN_MODULE;f++){let p=Math.fround(h[f]-i[f]);if(c+=Math.fround(p*p),c>=r)break}c<r&&(r=c,s=ee.SYMBOL_TABLE[l])}return s}}bt.bSymbolTableReady=!1,bt.RATIOS_TABLE=new Array(ee.SYMBOL_TABLE.length).map(x=>new Array(ee.BARS_IN_MODULE));class ta{constructor(){this.segmentCount=-1,this.fileSize=-1,this.timestamp=-1,this.checksum=-1}getSegmentIndex(){return this.segmentIndex}setSegmentIndex(e){this.segmentIndex=e}getFileId(){return this.fileId}setFileId(e){this.fileId=e}getOptionalData(){return this.optionalData}setOptionalData(e){this.optionalData=e}isLastSegment(){return this.lastSegment}setLastSegment(e){this.lastSegment=e}getSegmentCount(){return this.segmentCount}setSegmentCount(e){this.segmentCount=e}getSender(){return this.sender||null}setSender(e){this.sender=e}getAddressee(){return this.addressee||null}setAddressee(e){this.addressee=e}getFileName(){return this.fileName}setFileName(e){this.fileName=e}getFileSize(){return this.fileSize}setFileSize(e){this.fileSize=e}getChecksum(){return this.checksum}setChecksum(e){this.checksum=e}getTimestamp(){return this.timestamp}setTimestamp(e){this.timestamp=e}}class ia{static parseLong(e,t=void 0){return parseInt(e,t)}}class ra extends _{}ra.kind="NullPointerException";class ll{writeBytes(e){this.writeBytesOffset(e,0,e.length)}writeBytesOffset(e,t,i){if(e==null)throw new ra;if(t<0||t>e.length||i<0||t+i>e.length||t+i<0)throw new Le;if(i===0)return;for(let r=0;r<i;r++)this.write(e[t+r])}flush(){}close(){}}class cl extends _{}class dl extends ll{constructor(e=32){if(super(),this.count=0,e<0)throw new I("Negative initial size: "+e);this.buf=new Uint8Array(e)}ensureCapacity(e){e-this.buf.length>0&&this.grow(e)}grow(e){let i=this.buf.length<<1;if(i-e<0&&(i=e),i<0){if(e<0)throw new cl;i=K.MAX_VALUE}this.buf=ce.copyOfUint8Array(this.buf,i)}write(e){this.ensureCapacity(this.count+1),this.buf[this.count]=e,this.count+=1}writeBytesOffset(e,t,i){if(t<0||t>e.length||i<0||t+i-e.length>0)throw new Le;this.ensureCapacity(this.count+i),te.arraycopy(e,t,this.buf,this.count,i),this.count+=i}writeTo(e){e.writeBytesOffset(this.buf,0,this.count)}reset(){this.count=0}toByteArray(){return ce.copyOfUint8Array(this.buf,this.count)}size(){return this.count}toString(e){return e?typeof e=="string"?this.toString_string(e):this.toString_number(e):this.toString_void()}toString_void(){return new String(this.buf).toString()}toString_string(e){return new String(this.buf).toString()}toString_number(e){return new String(this.buf).toString()}close(){}}var Ae;(function(x){x[x.ALPHA=0]="ALPHA",x[x.LOWER=1]="LOWER",x[x.MIXED=2]="MIXED",x[x.PUNCT=3]="PUNCT",x[x.ALPHA_SHIFT=4]="ALPHA_SHIFT",x[x.PUNCT_SHIFT=5]="PUNCT_SHIFT"})(Ae||(Ae={}));function na(){if(typeof window<"u")return window.BigInt||null;if(typeof kr<"u")return kr.BigInt||null;if(typeof self<"u")return self.BigInt||null;throw new Error("Can't search globals for BigInt!")}let en;function hi(x){if(typeof en>"u"&&(en=na()),en===null)throw new Error("BigInt is not supported!");return en(x)}function hl(){let x=[];x[0]=hi(1);let e=hi(900);x[1]=e;for(let t=2;t<16;t++)x[t]=x[t-1]*e;return x}class k{static decode(e,t){let i=new ae(""),r=B.ISO8859_1;i.enableDecoding(r);let s=1,l=e[s++],c=new ta;for(;s<e[0];){switch(l){case k.TEXT_COMPACTION_MODE_LATCH:s=k.textCompaction(e,s,i);break;case k.BYTE_COMPACTION_MODE_LATCH:case k.BYTE_COMPACTION_MODE_LATCH_6:s=k.byteCompaction(l,e,r,s,i);break;case k.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:i.append(e[s++]);break;case k.NUMERIC_COMPACTION_MODE_LATCH:s=k.numericCompaction(e,s,i);break;case k.ECI_CHARSET:B.getCharacterSetECIByValue(e[s++]);break;case k.ECI_GENERAL_PURPOSE:s+=2;break;case k.ECI_USER_DEFINED:s++;break;case k.BEGIN_MACRO_PDF417_CONTROL_BLOCK:s=k.decodeMacroBlock(e,s,c);break;case k.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:case k.MACRO_PDF417_TERMINATOR:throw new z;default:s--,s=k.textCompaction(e,s,i);break}if(s<e.length)l=e[s++];else throw z.getFormatInstance()}if(i.length()===0)throw z.getFormatInstance();let h=new mr(null,i.toString(),null,t);return h.setOther(c),h}static decodeMacroBlock(e,t,i){if(t+k.NUMBER_OF_SEQUENCE_CODEWORDS>e[0])throw z.getFormatInstance();let r=new Int32Array(k.NUMBER_OF_SEQUENCE_CODEWORDS);for(let c=0;c<k.NUMBER_OF_SEQUENCE_CODEWORDS;c++,t++)r[c]=e[t];i.setSegmentIndex(K.parseInt(k.decodeBase900toBase10(r,k.NUMBER_OF_SEQUENCE_CODEWORDS)));let s=new ae;t=k.textCompaction(e,t,s),i.setFileId(s.toString());let l=-1;for(e[t]===k.BEGIN_MACRO_PDF417_OPTIONAL_FIELD&&(l=t+1);t<e[0];)switch(e[t]){case k.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:switch(t++,e[t]){case k.MACRO_PDF417_OPTIONAL_FIELD_FILE_NAME:let c=new ae;t=k.textCompaction(e,t+1,c),i.setFileName(c.toString());break;case k.MACRO_PDF417_OPTIONAL_FIELD_SENDER:let h=new ae;t=k.textCompaction(e,t+1,h),i.setSender(h.toString());break;case k.MACRO_PDF417_OPTIONAL_FIELD_ADDRESSEE:let f=new ae;t=k.textCompaction(e,t+1,f),i.setAddressee(f.toString());break;case k.MACRO_PDF417_OPTIONAL_FIELD_SEGMENT_COUNT:let p=new ae;t=k.numericCompaction(e,t+1,p),i.setSegmentCount(K.parseInt(p.toString()));break;case k.MACRO_PDF417_OPTIONAL_FIELD_TIME_STAMP:let b=new ae;t=k.numericCompaction(e,t+1,b),i.setTimestamp(ia.parseLong(b.toString()));break;case k.MACRO_PDF417_OPTIONAL_FIELD_CHECKSUM:let w=new ae;t=k.numericCompaction(e,t+1,w),i.setChecksum(K.parseInt(w.toString()));break;case k.MACRO_PDF417_OPTIONAL_FIELD_FILE_SIZE:let y=new ae;t=k.numericCompaction(e,t+1,y),i.setFileSize(ia.parseLong(y.toString()));break;default:throw z.getFormatInstance()}break;case k.MACRO_PDF417_TERMINATOR:t++,i.setLastSegment(!0);break;default:throw z.getFormatInstance()}if(l!==-1){let c=t-l;i.isLastSegment()&&c--,i.setOptionalData(ce.copyOfRange(e,l,l+c))}return t}static textCompaction(e,t,i){let r=new Int32Array((e[0]-t)*2),s=new Int32Array((e[0]-t)*2),l=0,c=!1;for(;t<e[0]&&!c;){let h=e[t++];if(h<k.TEXT_COMPACTION_MODE_LATCH)r[l]=h/30,r[l+1]=h%30,l+=2;else switch(h){case k.TEXT_COMPACTION_MODE_LATCH:r[l++]=k.TEXT_COMPACTION_MODE_LATCH;break;case k.BYTE_COMPACTION_MODE_LATCH:case k.BYTE_COMPACTION_MODE_LATCH_6:case k.NUMERIC_COMPACTION_MODE_LATCH:case k.BEGIN_MACRO_PDF417_CONTROL_BLOCK:case k.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:case k.MACRO_PDF417_TERMINATOR:t--,c=!0;break;case k.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:r[l]=k.MODE_SHIFT_TO_BYTE_COMPACTION_MODE,h=e[t++],s[l]=h,l++;break}}return k.decodeTextCompaction(r,s,l,i),t}static decodeTextCompaction(e,t,i,r){let s=Ae.ALPHA,l=Ae.ALPHA,c=0;for(;c<i;){let h=e[c],f="";switch(s){case Ae.ALPHA:if(h<26)f=String.fromCharCode(65+h);else switch(h){case 26:f=" ";break;case k.LL:s=Ae.LOWER;break;case k.ML:s=Ae.MIXED;break;case k.PS:l=s,s=Ae.PUNCT_SHIFT;break;case k.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:r.append(t[c]);break;case k.TEXT_COMPACTION_MODE_LATCH:s=Ae.ALPHA;break}break;case Ae.LOWER:if(h<26)f=String.fromCharCode(97+h);else switch(h){case 26:f=" ";break;case k.AS:l=s,s=Ae.ALPHA_SHIFT;break;case k.ML:s=Ae.MIXED;break;case k.PS:l=s,s=Ae.PUNCT_SHIFT;break;case k.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:r.append(t[c]);break;case k.TEXT_COMPACTION_MODE_LATCH:s=Ae.ALPHA;break}break;case Ae.MIXED:if(h<k.PL)f=k.MIXED_CHARS[h];else switch(h){case k.PL:s=Ae.PUNCT;break;case 26:f=" ";break;case k.LL:s=Ae.LOWER;break;case k.AL:s=Ae.ALPHA;break;case k.PS:l=s,s=Ae.PUNCT_SHIFT;break;case k.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:r.append(t[c]);break;case k.TEXT_COMPACTION_MODE_LATCH:s=Ae.ALPHA;break}break;case Ae.PUNCT:if(h<k.PAL)f=k.PUNCT_CHARS[h];else switch(h){case k.PAL:s=Ae.ALPHA;break;case k.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:r.append(t[c]);break;case k.TEXT_COMPACTION_MODE_LATCH:s=Ae.ALPHA;break}break;case Ae.ALPHA_SHIFT:if(s=l,h<26)f=String.fromCharCode(65+h);else switch(h){case 26:f=" ";break;case k.TEXT_COMPACTION_MODE_LATCH:s=Ae.ALPHA;break}break;case Ae.PUNCT_SHIFT:if(s=l,h<k.PAL)f=k.PUNCT_CHARS[h];else switch(h){case k.PAL:s=Ae.ALPHA;break;case k.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:r.append(t[c]);break;case k.TEXT_COMPACTION_MODE_LATCH:s=Ae.ALPHA;break}break}f!==""&&r.append(f),c++}}static byteCompaction(e,t,i,r,s){let l=new dl,c=0,h=0,f=!1;switch(e){case k.BYTE_COMPACTION_MODE_LATCH:let p=new Int32Array(6),b=t[r++];for(;r<t[0]&&!f;)switch(p[c++]=b,h=900*h+b,b=t[r++],b){case k.TEXT_COMPACTION_MODE_LATCH:case k.BYTE_COMPACTION_MODE_LATCH:case k.NUMERIC_COMPACTION_MODE_LATCH:case k.BYTE_COMPACTION_MODE_LATCH_6:case k.BEGIN_MACRO_PDF417_CONTROL_BLOCK:case k.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:case k.MACRO_PDF417_TERMINATOR:r--,f=!0;break;default:if(c%5===0&&c>0){for(let w=0;w<6;++w)l.write(Number(hi(h)>>hi(8*(5-w))));h=0,c=0}break}r===t[0]&&b<k.TEXT_COMPACTION_MODE_LATCH&&(p[c++]=b);for(let w=0;w<c;w++)l.write(p[w]);break;case k.BYTE_COMPACTION_MODE_LATCH_6:for(;r<t[0]&&!f;){let w=t[r++];if(w<k.TEXT_COMPACTION_MODE_LATCH)c++,h=900*h+w;else switch(w){case k.TEXT_COMPACTION_MODE_LATCH:case k.BYTE_COMPACTION_MODE_LATCH:case k.NUMERIC_COMPACTION_MODE_LATCH:case k.BYTE_COMPACTION_MODE_LATCH_6:case k.BEGIN_MACRO_PDF417_CONTROL_BLOCK:case k.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:case k.MACRO_PDF417_TERMINATOR:r--,f=!0;break}if(c%5===0&&c>0){for(let y=0;y<6;++y)l.write(Number(hi(h)>>hi(8*(5-y))));h=0,c=0}}break}return s.append(De.decode(l.toByteArray(),i)),r}static numericCompaction(e,t,i){let r=0,s=!1,l=new Int32Array(k.MAX_NUMERIC_CODEWORDS);for(;t<e[0]&&!s;){let c=e[t++];if(t===e[0]&&(s=!0),c<k.TEXT_COMPACTION_MODE_LATCH)l[r]=c,r++;else switch(c){case k.TEXT_COMPACTION_MODE_LATCH:case k.BYTE_COMPACTION_MODE_LATCH:case k.BYTE_COMPACTION_MODE_LATCH_6:case k.BEGIN_MACRO_PDF417_CONTROL_BLOCK:case k.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:case k.MACRO_PDF417_TERMINATOR:t--,s=!0;break}(r%k.MAX_NUMERIC_CODEWORDS===0||c===k.NUMERIC_COMPACTION_MODE_LATCH||s)&&r>0&&(i.append(k.decodeBase900toBase10(l,r)),r=0)}return t}static decodeBase900toBase10(e,t){let i=hi(0);for(let s=0;s<t;s++)i+=k.EXP900[t-s-1]*hi(e[s]);let r=i.toString();if(r.charAt(0)!=="1")throw new z;return r.substring(1)}}k.TEXT_COMPACTION_MODE_LATCH=900,k.BYTE_COMPACTION_MODE_LATCH=901,k.NUMERIC_COMPACTION_MODE_LATCH=902,k.BYTE_COMPACTION_MODE_LATCH_6=924,k.ECI_USER_DEFINED=925,k.ECI_GENERAL_PURPOSE=926,k.ECI_CHARSET=927,k.BEGIN_MACRO_PDF417_CONTROL_BLOCK=928,k.BEGIN_MACRO_PDF417_OPTIONAL_FIELD=923,k.MACRO_PDF417_TERMINATOR=922,k.MODE_SHIFT_TO_BYTE_COMPACTION_MODE=913,k.MAX_NUMERIC_CODEWORDS=15,k.MACRO_PDF417_OPTIONAL_FIELD_FILE_NAME=0,k.MACRO_PDF417_OPTIONAL_FIELD_SEGMENT_COUNT=1,k.MACRO_PDF417_OPTIONAL_FIELD_TIME_STAMP=2,k.MACRO_PDF417_OPTIONAL_FIELD_SENDER=3,k.MACRO_PDF417_OPTIONAL_FIELD_ADDRESSEE=4,k.MACRO_PDF417_OPTIONAL_FIELD_FILE_SIZE=5,k.MACRO_PDF417_OPTIONAL_FIELD_CHECKSUM=6,k.PL=25,k.LL=27,k.AS=27,k.ML=28,k.AL=28,k.PS=29,k.PAL=29,k.PUNCT_CHARS=`;<>@[\\]_\`~!\r	,:
-.$/"|*()?{}'`,k.MIXED_CHARS="0123456789&\r	,:#-.$/+%*=^",k.EXP900=na()?hl():[],k.NUMBER_OF_SEQUENCE_CODEWORDS=2;class he{constructor(){}static decode(e,t,i,r,s,l,c){let h=new Ii(e,t,i,r,s),f=null,p=null,b;for(let E=!0;;E=!1){if(t!=null&&(f=he.getRowIndicatorColumn(e,h,t,!0,l,c)),r!=null&&(p=he.getRowIndicatorColumn(e,h,r,!1,l,c)),b=he.merge(f,p),b==null)throw D.getNotFoundInstance();let S=b.getBoundingBox();if(E&&S!=null&&(S.getMinY()<h.getMinY()||S.getMaxY()>h.getMaxY()))h=S;else break}b.setBoundingBox(h);let w=b.getBarcodeColumnCount()+1;b.setDetectionResultColumn(0,f),b.setDetectionResultColumn(w,p);let y=f!=null;for(let E=1;E<=w;E++){let S=y?E:w-E;if(b.getDetectionResultColumn(S)!==void 0)continue;let T;S===0||S===w?T=new ea(h,S===0):T=new yr(h),b.setDetectionResultColumn(S,T);let R=-1,U=R;for(let $=h.getMinY();$<=h.getMaxY();$++){if(R=he.getStartColumn(b,S,$,y),R<0||R>h.getMaxX()){if(U===-1)continue;R=U}let L=he.detectCodeword(e,h.getMinX(),h.getMaxX(),y,R,$,l,c);L!=null&&(T.setCodeword($,L),U=R,l=Math.min(l,L.getWidth()),c=Math.max(c,L.getWidth()))}}return he.createDecoderResult(b)}static merge(e,t){if(e==null&&t==null)return null;let i=he.getBarcodeMetadata(e,t);if(i==null)return null;let r=Ii.merge(he.adjustBoundingBox(e),he.adjustBoundingBox(t));return new Ar(i,r)}static adjustBoundingBox(e){if(e==null)return null;let t=e.getRowHeights();if(t==null)return null;let i=he.getMax(t),r=0;for(let c of t)if(r+=i-c,c>0)break;let s=e.getCodewords();for(let c=0;r>0&&s[c]==null;c++)r--;let l=0;for(let c=t.length-1;c>=0&&(l+=i-t[c],!(t[c]>0));c--);for(let c=s.length-1;l>0&&s[c]==null;c--)l--;return e.getBoundingBox().addMissingRows(r,l,e.isLeft())}static getMax(e){let t=-1;for(let i of e)t=Math.max(t,i);return t}static getBarcodeMetadata(e,t){let i;if(e==null||(i=e.getBarcodeMetadata())==null)return t==null?null:t.getBarcodeMetadata();let r;return t==null||(r=t.getBarcodeMetadata())==null?i:i.getColumnCount()!==r.getColumnCount()&&i.getErrorCorrectionLevel()!==r.getErrorCorrectionLevel()&&i.getRowCount()!==r.getRowCount()?null:i}static getRowIndicatorColumn(e,t,i,r,s,l){let c=new ea(t,r);for(let h=0;h<2;h++){let f=h===0?1:-1,p=Math.trunc(Math.trunc(i.getX()));for(let b=Math.trunc(Math.trunc(i.getY()));b<=t.getMaxY()&&b>=t.getMinY();b+=f){let w=he.detectCodeword(e,0,e.getWidth(),r,p,b,s,l);w!=null&&(c.setCodeword(b,w),r?p=w.getStartX():p=w.getEndX())}}return c}static adjustCodewordCount(e,t){let i=t[0][1],r=i.getValue(),s=e.getBarcodeColumnCount()*e.getBarcodeRowCount()-he.getNumberOfECCodeWords(e.getBarcodeECLevel());if(r.length===0){if(s<1||s>ee.MAX_CODEWORDS_IN_BARCODE)throw D.getNotFoundInstance();i.setValue(s)}else r[0]!==s&&i.setValue(s)}static createDecoderResult(e){let t=he.createBarcodeMatrix(e);he.adjustCodewordCount(e,t);let i=new Array,r=new Int32Array(e.getBarcodeRowCount()*e.getBarcodeColumnCount()),s=[],l=new Array;for(let h=0;h<e.getBarcodeRowCount();h++)for(let f=0;f<e.getBarcodeColumnCount();f++){let p=t[h][f+1].getValue(),b=h*e.getBarcodeColumnCount()+f;p.length===0?i.push(b):p.length===1?r[b]=p[0]:(l.push(b),s.push(p))}let c=new Array(s.length);for(let h=0;h<c.length;h++)c[h]=s[h];return he.createDecoderResultFromAmbiguousValues(e.getBarcodeECLevel(),r,ee.toIntArray(i),ee.toIntArray(l),c)}static createDecoderResultFromAmbiguousValues(e,t,i,r,s){let l=new Int32Array(r.length),c=100;for(;c-- >0;){for(let h=0;h<l.length;h++)t[r[h]]=s[h][l[h]];try{return he.decodeCodewords(t,e,i)}catch(h){if(!(h instanceof X))throw h}if(l.length===0)throw X.getChecksumInstance();for(let h=0;h<l.length;h++)if(l[h]<s[h].length-1){l[h]++;break}else if(l[h]=0,h===l.length-1)throw X.getChecksumInstance()}throw X.getChecksumInstance()}static createBarcodeMatrix(e){let t=Array.from({length:e.getBarcodeRowCount()},()=>new Array(e.getBarcodeColumnCount()+2));for(let r=0;r<t.length;r++)for(let s=0;s<t[r].length;s++)t[r][s]=new Cr;let i=0;for(let r of e.getDetectionResultColumns()){if(r!=null){for(let s of r.getCodewords())if(s!=null){let l=s.getRowNumber();if(l>=0){if(l>=t.length)continue;t[l][i].setValue(s.getValue())}}}i++}return t}static isValidBarcodeColumn(e,t){return t>=0&&t<=e.getBarcodeColumnCount()+1}static getStartColumn(e,t,i,r){let s=r?1:-1,l=null;if(he.isValidBarcodeColumn(e,t-s)&&(l=e.getDetectionResultColumn(t-s).getCodeword(i)),l!=null)return r?l.getEndX():l.getStartX();if(l=e.getDetectionResultColumn(t).getCodewordNearby(i),l!=null)return r?l.getStartX():l.getEndX();if(he.isValidBarcodeColumn(e,t-s)&&(l=e.getDetectionResultColumn(t-s).getCodewordNearby(i)),l!=null)return r?l.getEndX():l.getStartX();let c=0;for(;he.isValidBarcodeColumn(e,t-s);){t-=s;for(let h of e.getDetectionResultColumn(t).getCodewords())if(h!=null)return(r?h.getEndX():h.getStartX())+s*c*(h.getEndX()-h.getStartX());c++}return r?e.getBoundingBox().getMinX():e.getBoundingBox().getMaxX()}static detectCodeword(e,t,i,r,s,l,c,h){s=he.adjustCodewordStartColumn(e,t,i,r,s,l);let f=he.getModuleBitCount(e,t,i,r,s,l);if(f==null)return null;let p,b=me.sum(f);if(r)p=s+b;else{for(let E=0;E<f.length/2;E++){let S=f[E];f[E]=f[f.length-1-E],f[f.length-1-E]=S}p=s,s=p-b}if(!he.checkCodewordSkew(b,c,h))return null;let w=bt.getDecodedValue(f),y=ee.getCodeword(w);return y===-1?null:new Er(s,p,he.getCodewordBucketNumber(w),y)}static getModuleBitCount(e,t,i,r,s,l){let c=s,h=new Int32Array(8),f=0,p=r?1:-1,b=r;for(;(r?c<i:c>=t)&&f<h.length;)e.get(c,l)===b?(h[f]++,c+=p):(f++,b=!b);return f===h.length||c===(r?i:t)&&f===h.length-1?h:null}static getNumberOfECCodeWords(e){return 2<<e}static adjustCodewordStartColumn(e,t,i,r,s,l){let c=s,h=r?-1:1;for(let f=0;f<2;f++){for(;(r?c>=t:c<i)&&r===e.get(c,l);){if(Math.abs(s-c)>he.CODEWORD_SKEW_SIZE)return s;c+=h}h=-h,r=!r}return c}static checkCodewordSkew(e,t,i){return t-he.CODEWORD_SKEW_SIZE<=e&&e<=i+he.CODEWORD_SKEW_SIZE}static decodeCodewords(e,t,i){if(e.length===0)throw z.getFormatInstance();let r=1<<t+1,s=he.correctErrors(e,i,r);he.verifyCodewordCount(e,r);let l=k.decode(e,""+t);return l.setErrorsCorrected(s),l.setErasures(i.length),l}static correctErrors(e,t,i){if(t!=null&&t.length>i/2+he.MAX_ERRORS||i<0||i>he.MAX_EC_CODEWORDS)throw X.getChecksumInstance();return he.errorCorrection.decode(e,i,t)}static verifyCodewordCount(e,t){if(e.length<4)throw z.getFormatInstance();let i=e[0];if(i>e.length)throw z.getFormatInstance();if(i===0)if(t<e.length)e[0]=e.length-t;else throw z.getFormatInstance()}static getBitCountForCodeword(e){let t=new Int32Array(8),i=0,r=t.length-1;for(;!((e&1)!==i&&(i=e&1,r--,r<0));)t[r]++,e>>=1;return t}static getCodewordBucketNumber(e){return e instanceof Int32Array?this.getCodewordBucketNumber_Int32Array(e):this.getCodewordBucketNumber_number(e)}static getCodewordBucketNumber_number(e){return he.getCodewordBucketNumber(he.getBitCountForCodeword(e))}static getCodewordBucketNumber_Int32Array(e){return(e[0]-e[2]+e[4]-e[6]+9)%9}static toString(e){let t=new vr;for(let i=0;i<e.length;i++){t.format("Row %2d: ",i);for(let r=0;r<e[i].length;r++){let s=e[i][r];s.getValue().length===0?t.format("        ",null):t.format("%4d(%2d)",s.getValue()[0],s.getConfidence(s.getValue()[0]))}t.format("%n")}return t.toString()}}he.CODEWORD_SKEW_SIZE=2,he.MAX_ERRORS=3,he.MAX_EC_CODEWORDS=512,he.errorCorrection=new Js;class rt{decode(e,t=null){let i=rt.decode(e,t,!1);if(i==null||i.length===0||i[0]==null)throw D.getNotFoundInstance();return i[0]}decodeMultiple(e,t=null){try{return rt.decode(e,t,!0)}catch(i){throw i instanceof z||i instanceof X?D.getNotFoundInstance():i}}static decode(e,t,i){const r=new Array,s=le.detectMultiple(e,t,i);for(const l of s.getPoints()){const c=he.decode(s.getBits(),l[4],l[5],l[6],l[7],rt.getMinCodewordWidth(l),rt.getMaxCodewordWidth(l)),h=new dt(c.getText(),c.getRawBytes(),void 0,l,Q.PDF_417);h.putMetadata(Ye.ERROR_CORRECTION_LEVEL,c.getECLevel());const f=c.getOther();f!=null&&h.putMetadata(Ye.PDF417_EXTRA_METADATA,f),r.push(h)}return r.map(l=>l)}static getMaxWidth(e,t){return e==null||t==null?0:Math.trunc(Math.abs(e.getX()-t.getX()))}static getMinWidth(e,t){return e==null||t==null?K.MAX_VALUE:Math.trunc(Math.abs(e.getX()-t.getX()))}static getMaxCodewordWidth(e){return Math.floor(Math.max(Math.max(rt.getMaxWidth(e[0],e[4]),rt.getMaxWidth(e[6],e[2])*ee.MODULES_IN_CODEWORD/ee.MODULES_IN_STOP_PATTERN),Math.max(rt.getMaxWidth(e[1],e[5]),rt.getMaxWidth(e[7],e[3])*ee.MODULES_IN_CODEWORD/ee.MODULES_IN_STOP_PATTERN)))}static getMinCodewordWidth(e){return Math.floor(Math.min(Math.min(rt.getMinWidth(e[0],e[4]),rt.getMinWidth(e[6],e[2])*ee.MODULES_IN_CODEWORD/ee.MODULES_IN_STOP_PATTERN),Math.min(rt.getMinWidth(e[1],e[5]),rt.getMinWidth(e[7],e[3])*ee.MODULES_IN_CODEWORD/ee.MODULES_IN_STOP_PATTERN)))}reset(){}}class tn extends _{}tn.kind="ReaderException";class sa{constructor(e,t){this.verbose=e===!0,t&&this.setHints(t)}decode(e,t){return t&&this.setHints(t),this.decodeInternal(e)}decodeWithState(e){return(this.readers===null||this.readers===void 0)&&this.setHints(null),this.decodeInternal(e)}setHints(e){this.hints=e;const t=!d(e)&&e.get(be.TRY_HARDER)===!0,i=d(e)?null:e.get(be.POSSIBLE_FORMATS),r=new Array;if(!d(i)){const s=i.some(l=>l===Q.UPC_A||l===Q.UPC_E||l===Q.EAN_13||l===Q.EAN_8||l===Q.CODABAR||l===Q.CODE_39||l===Q.CODE_93||l===Q.CODE_128||l===Q.ITF||l===Q.RSS_14||l===Q.RSS_EXPANDED);s&&!t&&r.push(new Ki(e,this.verbose)),i.includes(Q.QR_CODE)&&r.push(new di),i.includes(Q.DATA_MATRIX)&&r.push(new ci),i.includes(Q.AZTEC)&&r.push(new Zr),i.includes(Q.PDF_417)&&r.push(new rt),s&&t&&r.push(new Ki(e,this.verbose))}r.length===0&&(t||r.push(new Ki(e,this.verbose)),r.push(new di),r.push(new ci),r.push(new Zr),r.push(new rt),t&&r.push(new Ki(e,this.verbose))),this.readers=r}reset(){if(this.readers!==null)for(const e of this.readers)e.reset()}decodeInternal(e){if(this.readers===null)throw new tn("No readers where selected, nothing can be read.");for(const t of this.readers)try{return t.decode(e,this.hints)}catch(i){if(i instanceof tn)continue}throw new D("No MultiFormat Readers were able to detect the code.")}}class ul extends Ci{constructor(e=null,t=500){const i=new sa;i.setHints(e),super(i,t)}decodeBitmap(e){return this.reader.decodeWithState(e)}}class fl extends Ci{constructor(e=500){super(new rt,e)}}class gl extends Ci{constructor(e=500){super(new di,e)}}var Vn;(function(x){x[x.ERROR_CORRECTION=0]="ERROR_CORRECTION",x[x.CHARACTER_SET=1]="CHARACTER_SET",x[x.DATA_MATRIX_SHAPE=2]="DATA_MATRIX_SHAPE",x[x.MIN_SIZE=3]="MIN_SIZE",x[x.MAX_SIZE=4]="MAX_SIZE",x[x.MARGIN=5]="MARGIN",x[x.PDF417_COMPACT=6]="PDF417_COMPACT",x[x.PDF417_COMPACTION=7]="PDF417_COMPACTION",x[x.PDF417_DIMENSIONS=8]="PDF417_DIMENSIONS",x[x.AZTEC_LAYERS=9]="AZTEC_LAYERS",x[x.QR_VERSION=10]="QR_VERSION"})(Vn||(Vn={}));var Ke=Vn;class Hn{constructor(e){this.field=e,this.cachedGenerators=[],this.cachedGenerators.push(new pt(e,Int32Array.from([1])))}buildGenerator(e){const t=this.cachedGenerators;if(e>=t.length){let i=t[t.length-1];const r=this.field;for(let s=t.length;s<=e;s++){const l=i.multiply(new pt(r,Int32Array.from([1,r.exp(s-1+r.getGeneratorBase())])));t.push(l),i=l}}return t[e]}encode(e,t){if(t===0)throw new I("No error correction bytes");const i=e.length-t;if(i<=0)throw new I("No data bytes provided");const r=this.buildGenerator(t),s=new Int32Array(i);te.arraycopy(e,0,s,0,i);let l=new pt(this.field,s);l=l.multiplyByMonomial(t,1);const h=l.divide(r)[1].getCoefficients(),f=t-h.length;for(let p=0;p<f;p++)e[i+p]=0;te.arraycopy(h,0,e,i+f,h.length)}}class $e{constructor(){}static applyMaskPenaltyRule1(e){return $e.applyMaskPenaltyRule1Internal(e,!0)+$e.applyMaskPenaltyRule1Internal(e,!1)}static applyMaskPenaltyRule2(e){let t=0;const i=e.getArray(),r=e.getWidth(),s=e.getHeight();for(let l=0;l<s-1;l++){const c=i[l];for(let h=0;h<r-1;h++){const f=c[h];f===c[h+1]&&f===i[l+1][h]&&f===i[l+1][h+1]&&t++}}return $e.N2*t}static applyMaskPenaltyRule3(e){let t=0;const i=e.getArray(),r=e.getWidth(),s=e.getHeight();for(let l=0;l<s;l++)for(let c=0;c<r;c++){const h=i[l];c+6<r&&h[c]===1&&h[c+1]===0&&h[c+2]===1&&h[c+3]===1&&h[c+4]===1&&h[c+5]===0&&h[c+6]===1&&($e.isWhiteHorizontal(h,c-4,c)||$e.isWhiteHorizontal(h,c+7,c+11))&&t++,l+6<s&&i[l][c]===1&&i[l+1][c]===0&&i[l+2][c]===1&&i[l+3][c]===1&&i[l+4][c]===1&&i[l+5][c]===0&&i[l+6][c]===1&&($e.isWhiteVertical(i,c,l-4,l)||$e.isWhiteVertical(i,c,l+7,l+11))&&t++}return t*$e.N3}static isWhiteHorizontal(e,t,i){t=Math.max(t,0),i=Math.min(i,e.length);for(let r=t;r<i;r++)if(e[r]===1)return!1;return!0}static isWhiteVertical(e,t,i,r){i=Math.max(i,0),r=Math.min(r,e.length);for(let s=i;s<r;s++)if(e[s][t]===1)return!1;return!0}static applyMaskPenaltyRule4(e){let t=0;const i=e.getArray(),r=e.getWidth(),s=e.getHeight();for(let h=0;h<s;h++){const f=i[h];for(let p=0;p<r;p++)f[p]===1&&t++}const l=e.getHeight()*e.getWidth();return Math.floor(Math.abs(t*2-l)*10/l)*$e.N4}static getDataMaskBit(e,t,i){let r,s;switch(e){case 0:r=i+t&1;break;case 1:r=i&1;break;case 2:r=t%3;break;case 3:r=(i+t)%3;break;case 4:r=Math.floor(i/2)+Math.floor(t/3)&1;break;case 5:s=i*t,r=(s&1)+s%3;break;case 6:s=i*t,r=(s&1)+s%3&1;break;case 7:s=i*t,r=s%3+(i+t&1)&1;break;default:throw new I("Invalid mask pattern: "+e)}return r===0}static applyMaskPenaltyRule1Internal(e,t){let i=0;const r=t?e.getHeight():e.getWidth(),s=t?e.getWidth():e.getHeight(),l=e.getArray();for(let c=0;c<r;c++){let h=0,f=-1;for(let p=0;p<s;p++){const b=t?l[c][p]:l[p][c];b===f?h++:(h>=5&&(i+=$e.N1+(h-5)),h=1,f=b)}h>=5&&(i+=$e.N1+(h-5))}return i}}$e.N1=3,$e.N2=3,$e.N3=40,$e.N4=10;class rn{constructor(e,t){this.width=e,this.height=t;const i=new Array(t);for(let r=0;r!==t;r++)i[r]=new Uint8Array(e);this.bytes=i}getHeight(){return this.height}getWidth(){return this.width}get(e,t){return this.bytes[t][e]}getArray(){return this.bytes}setNumber(e,t,i){this.bytes[t][e]=i}setBoolean(e,t,i){this.bytes[t][e]=i?1:0}clear(e){for(const t of this.bytes)ce.fill(t,e)}equals(e){if(!(e instanceof rn))return!1;const t=e;if(this.width!==t.width||this.height!==t.height)return!1;for(let i=0,r=this.height;i<r;++i){const s=this.bytes[i],l=t.bytes[i];for(let c=0,h=this.width;c<h;++c)if(s[c]!==l[c])return!1}return!0}toString(){const e=new ae;for(let t=0,i=this.height;t<i;++t){const r=this.bytes[t];for(let s=0,l=this.width;s<l;++s)switch(r[s]){case 0:e.append(" 0");break;case 1:e.append(" 1");break;default:e.append("  ");break}e.append(`
`)}return e.toString()}}class Ti{constructor(){this.maskPattern=-1}getMode(){return this.mode}getECLevel(){return this.ecLevel}getVersion(){return this.version}getMaskPattern(){return this.maskPattern}getMatrix(){return this.matrix}toString(){const e=new ae;return e.append(`<<
`),e.append(" mode: "),e.append(this.mode?this.mode.toString():"null"),e.append(`
 ecLevel: `),e.append(this.ecLevel?this.ecLevel.toString():"null"),e.append(`
 version: `),e.append(this.version?this.version.toString():"null"),e.append(`
 maskPattern: `),e.append(this.maskPattern.toString()),this.matrix?(e.append(`
 matrix:
`),e.append(this.matrix.toString())):e.append(`
 matrix: null
`),e.append(`>>
`),e.toString()}setMode(e){this.mode=e}setECLevel(e){this.ecLevel=e}setVersion(e){this.version=e}setMaskPattern(e){this.maskPattern=e}setMatrix(e){this.matrix=e}static isValidMaskPattern(e){return e>=0&&e<Ti.NUM_MASK_PATTERNS}}Ti.NUM_MASK_PATTERNS=8;class Se extends _{}Se.kind="WriterException";class J{constructor(){}static clearMatrix(e){e.clear(255)}static buildMatrix(e,t,i,r,s){J.clearMatrix(s),J.embedBasicPatterns(i,s),J.embedTypeInfo(t,r,s),J.maybeEmbedVersionInfo(i,s),J.embedDataBits(e,r,s)}static embedBasicPatterns(e,t){J.embedPositionDetectionPatternsAndSeparators(t),J.embedDarkDotAtLeftBottomCorner(t),J.maybeEmbedPositionAdjustmentPatterns(e,t),J.embedTimingPatterns(t)}static embedTypeInfo(e,t,i){const r=new de;J.makeTypeInfoBits(e,t,r);for(let s=0,l=r.getSize();s<l;++s){const c=r.get(r.getSize()-1-s),h=J.TYPE_INFO_COORDINATES[s],f=h[0],p=h[1];if(i.setBoolean(f,p,c),s<8){const b=i.getWidth()-s-1;i.setBoolean(b,8,c)}else{const w=i.getHeight()-7+(s-8);i.setBoolean(8,w,c)}}}static maybeEmbedVersionInfo(e,t){if(e.getVersionNumber()<7)return;const i=new de;J.makeVersionInfoBits(e,i);let r=6*3-1;for(let s=0;s<6;++s)for(let l=0;l<3;++l){const c=i.get(r);r--,t.setBoolean(s,t.getHeight()-11+l,c),t.setBoolean(t.getHeight()-11+l,s,c)}}static embedDataBits(e,t,i){let r=0,s=-1,l=i.getWidth()-1,c=i.getHeight()-1;for(;l>0;){for(l===6&&(l-=1);c>=0&&c<i.getHeight();){for(let h=0;h<2;++h){const f=l-h;if(!J.isEmpty(i.get(f,c)))continue;let p;r<e.getSize()?(p=e.get(r),++r):p=!1,t!==255&&$e.getDataMaskBit(t,f,c)&&(p=!p),i.setBoolean(f,c,p)}c+=s}s=-s,c+=s,l-=2}if(r!==e.getSize())throw new Se("Not all bits consumed: "+r+"/"+e.getSize())}static findMSBSet(e){return 32-K.numberOfLeadingZeros(e)}static calculateBCHCode(e,t){if(t===0)throw new I("0 polynomial");const i=J.findMSBSet(t);for(e<<=i-1;J.findMSBSet(e)>=i;)e^=t<<J.findMSBSet(e)-i;return e}static makeTypeInfoBits(e,t,i){if(!Ti.isValidMaskPattern(t))throw new Se("Invalid mask pattern");const r=e.getBits()<<3|t;i.appendBits(r,5);const s=J.calculateBCHCode(r,J.TYPE_INFO_POLY);i.appendBits(s,10);const l=new de;if(l.appendBits(J.TYPE_INFO_MASK_PATTERN,15),i.xor(l),i.getSize()!==15)throw new Se("should not happen but we got: "+i.getSize())}static makeVersionInfoBits(e,t){t.appendBits(e.getVersionNumber(),6);const i=J.calculateBCHCode(e.getVersionNumber(),J.VERSION_INFO_POLY);if(t.appendBits(i,12),t.getSize()!==18)throw new Se("should not happen but we got: "+t.getSize())}static isEmpty(e){return e===255}static embedTimingPatterns(e){for(let t=8;t<e.getWidth()-8;++t){const i=(t+1)%2;J.isEmpty(e.get(t,6))&&e.setNumber(t,6,i),J.isEmpty(e.get(6,t))&&e.setNumber(6,t,i)}}static embedDarkDotAtLeftBottomCorner(e){if(e.get(8,e.getHeight()-8)===0)throw new Se;e.setNumber(8,e.getHeight()-8,1)}static embedHorizontalSeparationPattern(e,t,i){for(let r=0;r<8;++r){if(!J.isEmpty(i.get(e+r,t)))throw new Se;i.setNumber(e+r,t,0)}}static embedVerticalSeparationPattern(e,t,i){for(let r=0;r<7;++r){if(!J.isEmpty(i.get(e,t+r)))throw new Se;i.setNumber(e,t+r,0)}}static embedPositionAdjustmentPattern(e,t,i){for(let r=0;r<5;++r){const s=J.POSITION_ADJUSTMENT_PATTERN[r];for(let l=0;l<5;++l)i.setNumber(e+l,t+r,s[l])}}static embedPositionDetectionPattern(e,t,i){for(let r=0;r<7;++r){const s=J.POSITION_DETECTION_PATTERN[r];for(let l=0;l<7;++l)i.setNumber(e+l,t+r,s[l])}}static embedPositionDetectionPatternsAndSeparators(e){const t=J.POSITION_DETECTION_PATTERN[0].length;J.embedPositionDetectionPattern(0,0,e),J.embedPositionDetectionPattern(e.getWidth()-t,0,e),J.embedPositionDetectionPattern(0,e.getWidth()-t,e);const i=8;J.embedHorizontalSeparationPattern(0,i-1,e),J.embedHorizontalSeparationPattern(e.getWidth()-i,i-1,e),J.embedHorizontalSeparationPattern(0,e.getWidth()-i,e);const r=7;J.embedVerticalSeparationPattern(r,0,e),J.embedVerticalSeparationPattern(e.getHeight()-r-1,0,e),J.embedVerticalSeparationPattern(r,e.getHeight()-r,e)}static maybeEmbedPositionAdjustmentPatterns(e,t){if(e.getVersionNumber()<2)return;const i=e.getVersionNumber()-1,r=J.POSITION_ADJUSTMENT_PATTERN_COORDINATE_TABLE[i];for(let s=0,l=r.length;s!==l;s++){const c=r[s];if(c>=0)for(let h=0;h!==l;h++){const f=r[h];f>=0&&J.isEmpty(t.get(f,c))&&J.embedPositionAdjustmentPattern(f-2,c-2,t)}}}}J.POSITION_DETECTION_PATTERN=Array.from([Int32Array.from([1,1,1,1,1,1,1]),Int32Array.from([1,0,0,0,0,0,1]),Int32Array.from([1,0,1,1,1,0,1]),Int32Array.from([1,0,1,1,1,0,1]),Int32Array.from([1,0,1,1,1,0,1]),Int32Array.from([1,0,0,0,0,0,1]),Int32Array.from([1,1,1,1,1,1,1])]),J.POSITION_ADJUSTMENT_PATTERN=Array.from([Int32Array.from([1,1,1,1,1]),Int32Array.from([1,0,0,0,1]),Int32Array.from([1,0,1,0,1]),Int32Array.from([1,0,0,0,1]),Int32Array.from([1,1,1,1,1])]),J.POSITION_ADJUSTMENT_PATTERN_COORDINATE_TABLE=Array.from([Int32Array.from([-1,-1,-1,-1,-1,-1,-1]),Int32Array.from([6,18,-1,-1,-1,-1,-1]),Int32Array.from([6,22,-1,-1,-1,-1,-1]),Int32Array.from([6,26,-1,-1,-1,-1,-1]),Int32Array.from([6,30,-1,-1,-1,-1,-1]),Int32Array.from([6,34,-1,-1,-1,-1,-1]),Int32Array.from([6,22,38,-1,-1,-1,-1]),Int32Array.from([6,24,42,-1,-1,-1,-1]),Int32Array.from([6,26,46,-1,-1,-1,-1]),Int32Array.from([6,28,50,-1,-1,-1,-1]),Int32Array.from([6,30,54,-1,-1,-1,-1]),Int32Array.from([6,32,58,-1,-1,-1,-1]),Int32Array.from([6,34,62,-1,-1,-1,-1]),Int32Array.from([6,26,46,66,-1,-1,-1]),Int32Array.from([6,26,48,70,-1,-1,-1]),Int32Array.from([6,26,50,74,-1,-1,-1]),Int32Array.from([6,30,54,78,-1,-1,-1]),Int32Array.from([6,30,56,82,-1,-1,-1]),Int32Array.from([6,30,58,86,-1,-1,-1]),Int32Array.from([6,34,62,90,-1,-1,-1]),Int32Array.from([6,28,50,72,94,-1,-1]),Int32Array.from([6,26,50,74,98,-1,-1]),Int32Array.from([6,30,54,78,102,-1,-1]),Int32Array.from([6,28,54,80,106,-1,-1]),Int32Array.from([6,32,58,84,110,-1,-1]),Int32Array.from([6,30,58,86,114,-1,-1]),Int32Array.from([6,34,62,90,118,-1,-1]),Int32Array.from([6,26,50,74,98,122,-1]),Int32Array.from([6,30,54,78,102,126,-1]),Int32Array.from([6,26,52,78,104,130,-1]),Int32Array.from([6,30,56,82,108,134,-1]),Int32Array.from([6,34,60,86,112,138,-1]),Int32Array.from([6,30,58,86,114,142,-1]),Int32Array.from([6,34,62,90,118,146,-1]),Int32Array.from([6,30,54,78,102,126,150]),Int32Array.from([6,24,50,76,102,128,154]),Int32Array.from([6,28,54,80,106,132,158]),Int32Array.from([6,32,58,84,110,136,162]),Int32Array.from([6,26,54,82,110,138,166]),Int32Array.from([6,30,58,86,114,142,170])]),J.TYPE_INFO_COORDINATES=Array.from([Int32Array.from([8,0]),Int32Array.from([8,1]),Int32Array.from([8,2]),Int32Array.from([8,3]),Int32Array.from([8,4]),Int32Array.from([8,5]),Int32Array.from([8,7]),Int32Array.from([8,8]),Int32Array.from([7,8]),Int32Array.from([5,8]),Int32Array.from([4,8]),Int32Array.from([3,8]),Int32Array.from([2,8]),Int32Array.from([1,8]),Int32Array.from([0,8])]),J.VERSION_INFO_POLY=7973,J.TYPE_INFO_POLY=1335,J.TYPE_INFO_MASK_PATTERN=21522;class pl{constructor(e,t){this.dataBytes=e,this.errorCorrectionBytes=t}getDataBytes(){return this.dataBytes}getErrorCorrectionBytes(){return this.errorCorrectionBytes}}class Re{constructor(){}static calculateMaskPenalty(e){return $e.applyMaskPenaltyRule1(e)+$e.applyMaskPenaltyRule2(e)+$e.applyMaskPenaltyRule3(e)+$e.applyMaskPenaltyRule4(e)}static encode(e,t,i=null){let r=Re.DEFAULT_BYTE_MODE_ENCODING;const s=i!==null&&i.get(Ke.CHARACTER_SET)!==void 0;s&&(r=i.get(Ke.CHARACTER_SET).toString());const l=this.chooseMode(e,r),c=new de;if(l===q.BYTE&&(s||Re.DEFAULT_BYTE_MODE_ENCODING!==r)){const $=B.getCharacterSetECIByName(r);$!==void 0&&this.appendECI($,c)}this.appendModeInfo(l,c);const h=new de;this.appendBytes(e,l,h,r);let f;if(i!==null&&i.get(Ke.QR_VERSION)!==void 0){const $=Number.parseInt(i.get(Ke.QR_VERSION).toString(),10);f=Z.getVersionForNumber($);const L=this.calculateBitsNeeded(l,c,h,f);if(!this.willFit(L,f,t))throw new Se("Data too big for requested version")}else f=this.recommendVersion(t,l,c,h);const p=new de;p.appendBitArray(c);const b=l===q.BYTE?h.getSizeInBytes():e.length;this.appendLengthInfo(b,f,l,p),p.appendBitArray(h);const w=f.getECBlocksForLevel(t),y=f.getTotalCodewords()-w.getTotalECCodewords();this.terminateBits(y,p);const E=this.interleaveWithECBytes(p,f.getTotalCodewords(),y,w.getNumBlocks()),S=new Ti;S.setECLevel(t),S.setMode(l),S.setVersion(f);const T=f.getDimensionForVersion(),R=new rn(T,T),U=this.chooseMaskPattern(E,t,f,R);return S.setMaskPattern(U),J.buildMatrix(E,t,f,U,R),S.setMatrix(R),S}static recommendVersion(e,t,i,r){const s=this.calculateBitsNeeded(t,i,r,Z.getVersionForNumber(1)),l=this.chooseVersion(s,e),c=this.calculateBitsNeeded(t,i,r,l);return this.chooseVersion(c,e)}static calculateBitsNeeded(e,t,i,r){return t.getSize()+e.getCharacterCountBits(r)+i.getSize()}static getAlphanumericCode(e){return e<Re.ALPHANUMERIC_TABLE.length?Re.ALPHANUMERIC_TABLE[e]:-1}static chooseMode(e,t=null){if(B.SJIS.getName()===t&&this.isOnlyDoubleByteKanji(e))return q.KANJI;let i=!1,r=!1;for(let s=0,l=e.length;s<l;++s){const c=e.charAt(s);if(Re.isDigit(c))i=!0;else if(this.getAlphanumericCode(c.charCodeAt(0))!==-1)r=!0;else return q.BYTE}return r?q.ALPHANUMERIC:i?q.NUMERIC:q.BYTE}static isOnlyDoubleByteKanji(e){let t;try{t=De.encode(e,B.SJIS)}catch{return!1}const i=t.length;if(i%2!==0)return!1;for(let r=0;r<i;r+=2){const s=t[r]&255;if((s<129||s>159)&&(s<224||s>235))return!1}return!0}static chooseMaskPattern(e,t,i,r){let s=Number.MAX_SAFE_INTEGER,l=-1;for(let c=0;c<Ti.NUM_MASK_PATTERNS;c++){J.buildMatrix(e,t,i,c,r);let h=this.calculateMaskPenalty(r);h<s&&(s=h,l=c)}return l}static chooseVersion(e,t){for(let i=1;i<=40;i++){const r=Z.getVersionForNumber(i);if(Re.willFit(e,r,t))return r}throw new Se("Data too big")}static willFit(e,t,i){const r=t.getTotalCodewords(),l=t.getECBlocksForLevel(i).getTotalECCodewords(),c=r-l,h=(e+7)/8;return c>=h}static terminateBits(e,t){const i=e*8;if(t.getSize()>i)throw new Se("data bits cannot fit in the QR Code"+t.getSize()+" > "+i);for(let l=0;l<4&&t.getSize()<i;++l)t.appendBit(!1);const r=t.getSize()&7;if(r>0)for(let l=r;l<8;l++)t.appendBit(!1);const s=e-t.getSizeInBytes();for(let l=0;l<s;++l)t.appendBits(l&1?17:236,8);if(t.getSize()!==i)throw new Se("Bits size does not equal capacity")}static getNumDataBytesAndNumECBytesForBlockID(e,t,i,r,s,l){if(r>=i)throw new Se("Block ID too large");const c=e%i,h=i-c,f=Math.floor(e/i),p=f+1,b=Math.floor(t/i),w=b+1,y=f-b,E=p-w;if(y!==E)throw new Se("EC bytes mismatch");if(i!==h+c)throw new Se("RS blocks mismatch");if(e!==(b+y)*h+(w+E)*c)throw new Se("Total bytes mismatch");r<h?(s[0]=b,l[0]=y):(s[0]=w,l[0]=E)}static interleaveWithECBytes(e,t,i,r){if(e.getSizeInBytes()!==i)throw new Se("Number of bits and data bytes does not match");let s=0,l=0,c=0;const h=new Array;for(let p=0;p<r;++p){const b=new Int32Array(1),w=new Int32Array(1);Re.getNumDataBytesAndNumECBytesForBlockID(t,i,r,p,b,w);const y=b[0],E=new Uint8Array(y);e.toBytes(8*s,E,0,y);const S=Re.generateECBytes(E,w[0]);h.push(new pl(E,S)),l=Math.max(l,y),c=Math.max(c,S.length),s+=b[0]}if(i!==s)throw new Se("Data bytes does not match offset");const f=new de;for(let p=0;p<l;++p)for(const b of h){const w=b.getDataBytes();p<w.length&&f.appendBits(w[p],8)}for(let p=0;p<c;++p)for(const b of h){const w=b.getErrorCorrectionBytes();p<w.length&&f.appendBits(w[p],8)}if(t!==f.getSizeInBytes())throw new Se("Interleaving error: "+t+" and "+f.getSizeInBytes()+" differ.");return f}static generateECBytes(e,t){const i=e.length,r=new Int32Array(i+t);for(let l=0;l<i;l++)r[l]=e[l]&255;new Hn(we.QR_CODE_FIELD_256).encode(r,t);const s=new Uint8Array(t);for(let l=0;l<t;l++)s[l]=r[i+l];return s}static appendModeInfo(e,t){t.appendBits(e.getBits(),4)}static appendLengthInfo(e,t,i,r){const s=i.getCharacterCountBits(t);if(e>=1<<s)throw new Se(e+" is bigger than "+((1<<s)-1));r.appendBits(e,s)}static appendBytes(e,t,i,r){switch(t){case q.NUMERIC:Re.appendNumericBytes(e,i);break;case q.ALPHANUMERIC:Re.appendAlphanumericBytes(e,i);break;case q.BYTE:Re.append8BitBytes(e,i,r);break;case q.KANJI:Re.appendKanjiBytes(e,i);break;default:throw new Se("Invalid mode: "+t)}}static getDigit(e){return e.charCodeAt(0)-48}static isDigit(e){const t=Re.getDigit(e);return t>=0&&t<=9}static appendNumericBytes(e,t){const i=e.length;let r=0;for(;r<i;){const s=Re.getDigit(e.charAt(r));if(r+2<i){const l=Re.getDigit(e.charAt(r+1)),c=Re.getDigit(e.charAt(r+2));t.appendBits(s*100+l*10+c,10),r+=3}else if(r+1<i){const l=Re.getDigit(e.charAt(r+1));t.appendBits(s*10+l,7),r+=2}else t.appendBits(s,4),r++}}static appendAlphanumericBytes(e,t){const i=e.length;let r=0;for(;r<i;){const s=Re.getAlphanumericCode(e.charCodeAt(r));if(s===-1)throw new Se;if(r+1<i){const l=Re.getAlphanumericCode(e.charCodeAt(r+1));if(l===-1)throw new Se;t.appendBits(s*45+l,11),r+=2}else t.appendBits(s,6),r++}}static append8BitBytes(e,t,i){let r;try{r=De.encode(e,i)}catch(s){throw new Se(s)}for(let s=0,l=r.length;s!==l;s++){const c=r[s];t.appendBits(c,8)}}static appendKanjiBytes(e,t){let i;try{i=De.encode(e,B.SJIS)}catch(s){throw new Se(s)}const r=i.length;for(let s=0;s<r;s+=2){const l=i[s]&255,c=i[s+1]&255,h=l<<8&4294967295|c;let f=-1;if(h>=33088&&h<=40956?f=h-33088:h>=57408&&h<=60351&&(f=h-49472),f===-1)throw new Se("Invalid byte sequence");const p=(f>>8)*192+(f&255);t.appendBits(p,13)}}static appendECI(e,t){t.appendBits(q.ECI.getBits(),4),t.appendBits(e.getValue(),8)}}Re.ALPHANUMERIC_TABLE=Int32Array.from([-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,36,-1,-1,-1,37,38,-1,-1,-1,-1,39,40,-1,41,42,43,0,1,2,3,4,5,6,7,8,9,44,-1,-1,-1,-1,-1,-1,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,-1,-1,-1,-1,-1]),Re.DEFAULT_BYTE_MODE_ENCODING=B.UTF8.getName();class Ni{write(e,t,i,r=null){if(e.length===0)throw new I("Found empty contents");if(t<0||i<0)throw new I("Requested dimensions are too small: "+t+"x"+i);let s=ke.L,l=Ni.QUIET_ZONE_SIZE;r!==null&&(r.get(Ke.ERROR_CORRECTION)!==void 0&&(s=ke.fromString(r.get(Ke.ERROR_CORRECTION).toString())),r.get(Ke.MARGIN)!==void 0&&(l=Number.parseInt(r.get(Ke.MARGIN).toString(),10)));const c=Re.encode(e,s,r);return this.renderResult(c,t,i,l)}writeToDom(e,t,i,r,s=null){typeof e=="string"&&(e=document.querySelector(e));const l=this.write(t,i,r,s);e&&e.appendChild(l)}renderResult(e,t,i,r){const s=e.getMatrix();if(s===null)throw new Ft;const l=s.getWidth(),c=s.getHeight(),h=l+r*2,f=c+r*2,p=Math.max(t,h),b=Math.max(i,f),w=Math.min(Math.floor(p/h),Math.floor(b/f)),y=Math.floor((p-l*w)/2),E=Math.floor((b-c*w)/2),S=this.createSVGElement(p,b);for(let T=0,R=E;T<c;T++,R+=w)for(let U=0,$=y;U<l;U++,$+=w)if(s.get(U,T)===1){const L=this.createSvgRectElement($,R,w,w);S.appendChild(L)}return S}createSVGElement(e,t){const i=document.createElementNS(Ni.SVG_NS,"svg");return i.setAttributeNS(null,"height",e.toString()),i.setAttributeNS(null,"width",t.toString()),i}createSvgRectElement(e,t,i,r){const s=document.createElementNS(Ni.SVG_NS,"rect");return s.setAttributeNS(null,"x",e.toString()),s.setAttributeNS(null,"y",t.toString()),s.setAttributeNS(null,"height",i.toString()),s.setAttributeNS(null,"width",r.toString()),s.setAttributeNS(null,"fill","#000000"),s}}Ni.QUIET_ZONE_SIZE=4,Ni.SVG_NS="http://www.w3.org/2000/svg";class Yi{encode(e,t,i,r,s){if(e.length===0)throw new I("Found empty contents");if(t!==Q.QR_CODE)throw new I("Can only encode QR_CODE, but got "+t);if(i<0||r<0)throw new I(`Requested dimensions are too small: ${i}x${r}`);let l=ke.L,c=Yi.QUIET_ZONE_SIZE;s!==null&&(s.get(Ke.ERROR_CORRECTION)!==void 0&&(l=ke.fromString(s.get(Ke.ERROR_CORRECTION).toString())),s.get(Ke.MARGIN)!==void 0&&(c=Number.parseInt(s.get(Ke.MARGIN).toString(),10)));const h=Re.encode(e,l,s);return Yi.renderResult(h,i,r,c)}static renderResult(e,t,i,r){const s=e.getMatrix();if(s===null)throw new Ft;const l=s.getWidth(),c=s.getHeight(),h=l+r*2,f=c+r*2,p=Math.max(t,h),b=Math.max(i,f),w=Math.min(Math.floor(p/h),Math.floor(b/f)),y=Math.floor((p-l*w)/2),E=Math.floor((b-c*w)/2),S=new Me(p,b);for(let T=0,R=E;T<c;T++,R+=w)for(let U=0,$=y;U<l;U++,$+=w)s.get(U,T)===1&&S.setRegion($,R,w,w);return S}}Yi.QUIET_ZONE_SIZE=4;class ml{encode(e,t,i,r,s){let l;switch(t){case Q.QR_CODE:l=new Yi;break;default:throw new I("No encoder available for format "+t)}return l.encode(e,t,i,r,s)}}class Vt extends pr{constructor(e,t,i,r,s,l,c,h){if(super(l,c),this.yuvData=e,this.dataWidth=t,this.dataHeight=i,this.left=r,this.top=s,r+l>t||s+c>i)throw new I("Crop rectangle does not fit within image data.");h&&this.reverseHorizontal(l,c)}getRow(e,t){if(e<0||e>=this.getHeight())throw new I("Requested row is outside the image: "+e);const i=this.getWidth();(t==null||t.length<i)&&(t=new Uint8ClampedArray(i));const r=(e+this.top)*this.dataWidth+this.left;return te.arraycopy(this.yuvData,r,t,0,i),t}getMatrix(){const e=this.getWidth(),t=this.getHeight();if(e===this.dataWidth&&t===this.dataHeight)return this.yuvData;const i=e*t,r=new Uint8ClampedArray(i);let s=this.top*this.dataWidth+this.left;if(e===this.dataWidth)return te.arraycopy(this.yuvData,s,r,0,i),r;for(let l=0;l<t;l++){const c=l*e;te.arraycopy(this.yuvData,s,r,c,e),s+=this.dataWidth}return r}isCropSupported(){return!0}crop(e,t,i,r){return new Vt(this.yuvData,this.dataWidth,this.dataHeight,this.left+e,this.top+t,i,r,!1)}renderThumbnail(){const e=this.getWidth()/Vt.THUMBNAIL_SCALE_FACTOR,t=this.getHeight()/Vt.THUMBNAIL_SCALE_FACTOR,i=new Int32Array(e*t),r=this.yuvData;let s=this.top*this.dataWidth+this.left;for(let l=0;l<t;l++){const c=l*e;for(let h=0;h<e;h++){const f=r[s+h*Vt.THUMBNAIL_SCALE_FACTOR]&255;i[c+h]=4278190080|f*65793}s+=this.dataWidth*Vt.THUMBNAIL_SCALE_FACTOR}return i}getThumbnailWidth(){return this.getWidth()/Vt.THUMBNAIL_SCALE_FACTOR}getThumbnailHeight(){return this.getHeight()/Vt.THUMBNAIL_SCALE_FACTOR}reverseHorizontal(e,t){const i=this.yuvData;for(let r=0,s=this.top*this.dataWidth+this.left;r<t;r++,s+=this.dataWidth){const l=s+e/2;for(let c=s,h=s+e-1;c<l;c++,h--){const f=i[c];i[c]=i[h],i[h]=f}}}invert(){return new ni(this)}}Vt.THUMBNAIL_SCALE_FACTOR=2;class Gn extends pr{constructor(e,t,i,r,s,l,c){if(super(t,i),this.dataWidth=r,this.dataHeight=s,this.left=l,this.top=c,e.BYTES_PER_ELEMENT===4){const h=t*i,f=new Uint8ClampedArray(h);for(let p=0;p<h;p++){const b=e[p],w=b>>16&255,y=b>>7&510,E=b&255;f[p]=(w+y+E)/4&255}this.luminances=f}else this.luminances=e;if(r===void 0&&(this.dataWidth=t),s===void 0&&(this.dataHeight=i),l===void 0&&(this.left=0),c===void 0&&(this.top=0),this.left+t>this.dataWidth||this.top+i>this.dataHeight)throw new I("Crop rectangle does not fit within image data.")}getRow(e,t){if(e<0||e>=this.getHeight())throw new I("Requested row is outside the image: "+e);const i=this.getWidth();(t==null||t.length<i)&&(t=new Uint8ClampedArray(i));const r=(e+this.top)*this.dataWidth+this.left;return te.arraycopy(this.luminances,r,t,0,i),t}getMatrix(){const e=this.getWidth(),t=this.getHeight();if(e===this.dataWidth&&t===this.dataHeight)return this.luminances;const i=e*t,r=new Uint8ClampedArray(i);let s=this.top*this.dataWidth+this.left;if(e===this.dataWidth)return te.arraycopy(this.luminances,s,r,0,i),r;for(let l=0;l<t;l++){const c=l*e;te.arraycopy(this.luminances,s,r,c,e),s+=this.dataWidth}return r}isCropSupported(){return!0}crop(e,t,i,r){return new Gn(this.luminances,i,r,this.dataWidth,this.dataHeight,this.left+e,this.top+t)}invert(){return new ni(this)}}class aa extends B{static forName(e){return this.getCharacterSetECIByName(e)}}class Wn{}Wn.ISO_8859_1=B.ISO8859_1;class oa{isCompact(){return this.compact}setCompact(e){this.compact=e}getSize(){return this.size}setSize(e){this.size=e}getLayers(){return this.layers}setLayers(e){this.layers=e}getCodeWords(){return this.codeWords}setCodeWords(e){this.codeWords=e}getMatrix(){return this.matrix}setMatrix(e){this.matrix=e}}class la{static singletonList(e){return[e]}static min(e,t){return e.sort(t)[0]}}class xl{constructor(e){this.previous=e}getPrevious(){return this.previous}}class qi extends xl{constructor(e,t,i){super(e),this.value=t,this.bitCount=i}appendTo(e,t){e.appendBits(this.value,this.bitCount)}add(e,t){return new qi(this,e,t)}addBinaryShift(e,t){return console.warn("addBinaryShift on SimpleToken, this simply returns a copy of this token"),new qi(this,e,t)}toString(){let e=this.value&(1<<this.bitCount)-1;return e|=1<<this.bitCount,"<"+K.toBinaryString(e|1<<this.bitCount).substring(1)+">"}}class Xn extends qi{constructor(e,t,i){super(e,0,0),this.binaryShiftStart=t,this.binaryShiftByteCount=i}appendTo(e,t){for(let i=0;i<this.binaryShiftByteCount;i++)(i===0||i===31&&this.binaryShiftByteCount<=62)&&(e.appendBits(31,5),this.binaryShiftByteCount>62?e.appendBits(this.binaryShiftByteCount-31,16):i===0?e.appendBits(Math.min(this.binaryShiftByteCount,31),5):e.appendBits(this.binaryShiftByteCount-31,5)),e.appendBits(t[this.binaryShiftStart+i],8)}addBinaryShift(e,t){return new Xn(this,e,t)}toString(){return"<"+this.binaryShiftStart+"::"+(this.binaryShiftStart+this.binaryShiftByteCount-1)+">"}}function bl(x,e,t){return new Xn(x,e,t)}function Sr(x,e,t){return new qi(x,e,t)}const wl=["UPPER","LOWER","DIGIT","MIXED","PUNCT"],ui=0,nn=1,Tt=2,ca=3,Ht=4,_l=new qi(null,0,0),jn=[Int32Array.from([0,(5<<16)+28,(5<<16)+30,(5<<16)+29,656318]),Int32Array.from([(9<<16)+480+14,0,(5<<16)+30,(5<<16)+29,656318]),Int32Array.from([(4<<16)+14,(9<<16)+448+28,0,(9<<16)+448+29,932798]),Int32Array.from([(5<<16)+29,(5<<16)+28,656318,0,(5<<16)+30]),Int32Array.from([(5<<16)+31,656380,656382,656381,0])];function vl(x){for(let e of x)ce.fill(e,-1);return x[ui][Ht]=0,x[nn][Ht]=0,x[nn][ui]=28,x[ca][Ht]=0,x[Tt][Ht]=0,x[Tt][ui]=15,x}const da=vl(ce.createInt32Array(6,6));class Gt{constructor(e,t,i,r){this.token=e,this.mode=t,this.binaryShiftByteCount=i,this.bitCount=r}getMode(){return this.mode}getToken(){return this.token}getBinaryShiftByteCount(){return this.binaryShiftByteCount}getBitCount(){return this.bitCount}latchAndAppend(e,t){let i=this.bitCount,r=this.token;if(e!==this.mode){let l=jn[this.mode][e];r=Sr(r,l&65535,l>>16),i+=l>>16}let s=e===Tt?4:5;return r=Sr(r,t,s),new Gt(r,e,0,i+s)}shiftAndAppend(e,t){let i=this.token,r=this.mode===Tt?4:5;return i=Sr(i,da[this.mode][e],r),i=Sr(i,t,5),new Gt(i,this.mode,0,this.bitCount+r+5)}addBinaryShiftChar(e){let t=this.token,i=this.mode,r=this.bitCount;if(this.mode===Ht||this.mode===Tt){let c=jn[i][ui];t=Sr(t,c&65535,c>>16),r+=c>>16,i=ui}let s=this.binaryShiftByteCount===0||this.binaryShiftByteCount===31?18:this.binaryShiftByteCount===62?9:8,l=new Gt(t,i,this.binaryShiftByteCount+1,r+s);return l.binaryShiftByteCount===2078&&(l=l.endBinaryShift(e+1)),l}endBinaryShift(e){if(this.binaryShiftByteCount===0)return this;let t=this.token;return t=bl(t,e-this.binaryShiftByteCount,this.binaryShiftByteCount),new Gt(t,this.mode,0,this.bitCount)}isBetterThanOrEqualTo(e){let t=this.bitCount+(jn[this.mode][e.mode]>>16);return this.binaryShiftByteCount<e.binaryShiftByteCount?t+=Gt.calculateBinaryShiftCost(e)-Gt.calculateBinaryShiftCost(this):this.binaryShiftByteCount>e.binaryShiftByteCount&&e.binaryShiftByteCount>0&&(t+=10),t<=e.bitCount}toBitArray(e){let t=[];for(let r=this.endBinaryShift(e.length).token;r!==null;r=r.getPrevious())t.unshift(r);let i=new de;for(const r of t)r.appendTo(i,e);return i}toString(){return Y.format("%s bits=%d bytes=%d",wl[this.mode],this.bitCount,this.binaryShiftByteCount)}static calculateBinaryShiftCost(e){return e.binaryShiftByteCount>62?21:e.binaryShiftByteCount>31?20:e.binaryShiftByteCount>0?10:0}}Gt.INITIAL_STATE=new Gt(_l,ui,0,0);function yl(x){const e=Y.getCharCode(" "),t=Y.getCharCode("."),i=Y.getCharCode(",");x[ui][e]=1;const r=Y.getCharCode("Z"),s=Y.getCharCode("A");for(let w=s;w<=r;w++)x[ui][w]=w-s+2;x[nn][e]=1;const l=Y.getCharCode("z"),c=Y.getCharCode("a");for(let w=c;w<=l;w++)x[nn][w]=w-c+2;x[Tt][e]=1;const h=Y.getCharCode("9"),f=Y.getCharCode("0");for(let w=f;w<=h;w++)x[Tt][w]=w-f+2;x[Tt][i]=12,x[Tt][t]=13;const p=["\0"," ","","","","","","","\x07","\b","	",`
`,"\v","\f","\r","\x1B","","","","","@","\\","^","_","`","|","~",""];for(let w=0;w<p.length;w++)x[ca][Y.getCharCode(p[w])]=w;const b=["\0","\r","\0","\0","\0","\0","!","'","#","$","%","&","'","(",")","*","+",",","-",".","/",":",";","<","=",">","?","[","]","{","}"];for(let w=0;w<b.length;w++)Y.getCharCode(b[w])>0&&(x[Ht][Y.getCharCode(b[w])]=w);return x}const Kn=yl(ce.createInt32Array(5,256));class Ir{constructor(e){this.text=e}encode(){const e=Y.getCharCode(" "),t=Y.getCharCode(`
`);let i=la.singletonList(Gt.INITIAL_STATE);for(let s=0;s<this.text.length;s++){let l,c=s+1<this.text.length?this.text[s+1]:0;switch(this.text[s]){case Y.getCharCode("\r"):l=c===t?2:0;break;case Y.getCharCode("."):l=c===e?3:0;break;case Y.getCharCode(","):l=c===e?4:0;break;case Y.getCharCode(":"):l=c===e?5:0;break;default:l=0}l>0?(i=Ir.updateStateListForPair(i,s,l),s++):i=this.updateStateListForChar(i,s)}return la.min(i,(s,l)=>s.getBitCount()-l.getBitCount()).toBitArray(this.text)}updateStateListForChar(e,t){const i=[];for(let r of e)this.updateStateForChar(r,t,i);return Ir.simplifyStates(i)}updateStateForChar(e,t,i){let r=this.text[t]&255,s=Kn[e.getMode()][r]>0,l=null;for(let c=0;c<=Ht;c++){let h=Kn[c][r];if(h>0){if(l==null&&(l=e.endBinaryShift(t)),!s||c===e.getMode()||c===Tt){const f=l.latchAndAppend(c,h);i.push(f)}if(!s&&da[e.getMode()][c]>=0){const f=l.shiftAndAppend(c,h);i.push(f)}}}if(e.getBinaryShiftByteCount()>0||Kn[e.getMode()][r]===0){let c=e.addBinaryShiftChar(t);i.push(c)}}static updateStateListForPair(e,t,i){const r=[];for(let s of e)this.updateStateForPair(s,t,i,r);return this.simplifyStates(r)}static updateStateForPair(e,t,i,r){let s=e.endBinaryShift(t);if(r.push(s.latchAndAppend(Ht,i)),e.getMode()!==Ht&&r.push(s.shiftAndAppend(Ht,i)),i===3||i===4){let l=s.latchAndAppend(Tt,16-i).latchAndAppend(Tt,1);r.push(l)}if(e.getBinaryShiftByteCount()>0){let l=e.addBinaryShiftChar(t).addBinaryShiftChar(t+1);r.push(l)}}static simplifyStates(e){let t=[];for(const i of e){let r=!0;for(const s of t){if(s.isBetterThanOrEqualTo(i)){r=!1;break}i.isBetterThanOrEqualTo(s)&&(t=t.filter(l=>l!==s))}r&&t.push(i)}return t}}class xe{constructor(){}static encodeBytes(e){return xe.encode(e,xe.DEFAULT_EC_PERCENT,xe.DEFAULT_AZTEC_LAYERS)}static encode(e,t,i){let r=new Ir(e).encode(),s=K.truncDivision(r.getSize()*t,100)+11,l=r.getSize()+s,c,h,f,p,b;if(i!==xe.DEFAULT_AZTEC_LAYERS){if(c=i<0,h=Math.abs(i),h>(c?xe.MAX_NB_BITS_COMPACT:xe.MAX_NB_BITS))throw new I(Y.format("Illegal value %s for layers",i));f=xe.totalBitsInLayer(h,c),p=xe.WORD_SIZE[h];let L=f-f%p;if(b=xe.stuffBits(r,p),b.getSize()+s>L)throw new I("Data to large for user specified layer");if(c&&b.getSize()>p*64)throw new I("Data to large for user specified layer")}else{p=0,b=null;for(let L=0;;L++){if(L>xe.MAX_NB_BITS)throw new I("Data too large for an Aztec code");if(c=L<=3,h=c?L+1:L,f=xe.totalBitsInLayer(h,c),l>f)continue;(b==null||p!==xe.WORD_SIZE[h])&&(p=xe.WORD_SIZE[h],b=xe.stuffBits(r,p));let ue=f-f%p;if(!(c&&b.getSize()>p*64)&&b.getSize()+s<=ue)break}}let w=xe.generateCheckWords(b,f,p),y=b.getSize()/p,E=xe.generateModeMessage(c,h,y),S=(c?11:14)+h*4,T=new Int32Array(S),R;if(c){R=S;for(let L=0;L<T.length;L++)T[L]=L}else{R=S+1+2*K.truncDivision(K.truncDivision(S,2)-1,15);let L=K.truncDivision(S,2),ue=K.truncDivision(R,2);for(let ne=0;ne<L;ne++){let wt=ne+K.truncDivision(ne,15);T[L-ne-1]=ue-wt-1,T[L+ne]=ue+wt+1}}let U=new Me(R);for(let L=0,ue=0;L<h;L++){let ne=(h-L)*4+(c?9:12);for(let wt=0;wt<ne;wt++){let Ot=wt*2;for(let _t=0;_t<2;_t++)w.get(ue+Ot+_t)&&U.set(T[L*2+_t],T[L*2+wt]),w.get(ue+ne*2+Ot+_t)&&U.set(T[L*2+wt],T[S-1-L*2-_t]),w.get(ue+ne*4+Ot+_t)&&U.set(T[S-1-L*2-_t],T[S-1-L*2-wt]),w.get(ue+ne*6+Ot+_t)&&U.set(T[S-1-L*2-wt],T[L*2+_t])}ue+=ne*8}if(xe.drawModeMessage(U,c,R,E),c)xe.drawBullsEye(U,K.truncDivision(R,2),5);else{xe.drawBullsEye(U,K.truncDivision(R,2),7);for(let L=0,ue=0;L<K.truncDivision(S,2)-1;L+=15,ue+=16)for(let ne=K.truncDivision(R,2)&1;ne<R;ne+=2)U.set(K.truncDivision(R,2)-ue,ne),U.set(K.truncDivision(R,2)+ue,ne),U.set(ne,K.truncDivision(R,2)-ue),U.set(ne,K.truncDivision(R,2)+ue)}let $=new oa;return $.setCompact(c),$.setSize(R),$.setLayers(h),$.setCodeWords(y),$.setMatrix(U),$}static drawBullsEye(e,t,i){for(let r=0;r<i;r+=2)for(let s=t-r;s<=t+r;s++)e.set(s,t-r),e.set(s,t+r),e.set(t-r,s),e.set(t+r,s);e.set(t-i,t-i),e.set(t-i+1,t-i),e.set(t-i,t-i+1),e.set(t+i,t-i),e.set(t+i,t-i+1),e.set(t+i,t+i-1)}static generateModeMessage(e,t,i){let r=new de;return e?(r.appendBits(t-1,2),r.appendBits(i-1,6),r=xe.generateCheckWords(r,28,4)):(r.appendBits(t-1,5),r.appendBits(i-1,11),r=xe.generateCheckWords(r,40,4)),r}static drawModeMessage(e,t,i,r){let s=K.truncDivision(i,2);if(t)for(let l=0;l<7;l++){let c=s-3+l;r.get(l)&&e.set(c,s-5),r.get(l+7)&&e.set(s+5,c),r.get(20-l)&&e.set(c,s+5),r.get(27-l)&&e.set(s-5,c)}else for(let l=0;l<10;l++){let c=s-5+l+K.truncDivision(l,5);r.get(l)&&e.set(c,s-7),r.get(l+10)&&e.set(s+7,c),r.get(29-l)&&e.set(c,s+7),r.get(39-l)&&e.set(s-7,c)}}static generateCheckWords(e,t,i){let r=e.getSize()/i,s=new Hn(xe.getGF(i)),l=K.truncDivision(t,i),c=xe.bitsToWords(e,i,l);s.encode(c,l-r);let h=t%i,f=new de;f.appendBits(0,h);for(const p of Array.from(c))f.appendBits(p,i);return f}static bitsToWords(e,t,i){let r=new Int32Array(i),s,l;for(s=0,l=e.getSize()/t;s<l;s++){let c=0;for(let h=0;h<t;h++)c|=e.get(s*t+h)?1<<t-h-1:0;r[s]=c}return r}static getGF(e){switch(e){case 4:return we.AZTEC_PARAM;case 6:return we.AZTEC_DATA_6;case 8:return we.AZTEC_DATA_8;case 10:return we.AZTEC_DATA_10;case 12:return we.AZTEC_DATA_12;default:throw new I("Unsupported word size "+e)}}static stuffBits(e,t){let i=new de,r=e.getSize(),s=(1<<t)-2;for(let l=0;l<r;l+=t){let c=0;for(let h=0;h<t;h++)(l+h>=r||e.get(l+h))&&(c|=1<<t-1-h);(c&s)===s?(i.appendBits(c&s,t),l--):c&s?i.appendBits(c,t):(i.appendBits(c|1,t),l--)}return i}static totalBitsInLayer(e,t){return((t?88:112)+16*e)*e}}xe.DEFAULT_EC_PERCENT=33,xe.DEFAULT_AZTEC_LAYERS=0,xe.MAX_NB_BITS=32,xe.MAX_NB_BITS_COMPACT=4,xe.WORD_SIZE=Int32Array.from([4,6,6,8,8,8,8,8,8,10,10,10,10,10,10,10,10,10,10,10,10,10,10,12,12,12,12,12,12,12,12,12,12]);class sn{encode(e,t,i,r){return this.encodeWithHints(e,t,i,r,null)}encodeWithHints(e,t,i,r,s){let l=Wn.ISO_8859_1,c=xe.DEFAULT_EC_PERCENT,h=xe.DEFAULT_AZTEC_LAYERS;return s!=null&&(s.has(Ke.CHARACTER_SET)&&(l=aa.forName(s.get(Ke.CHARACTER_SET).toString())),s.has(Ke.ERROR_CORRECTION)&&(c=K.parseInt(s.get(Ke.ERROR_CORRECTION).toString())),s.has(Ke.AZTEC_LAYERS)&&(h=K.parseInt(s.get(Ke.AZTEC_LAYERS).toString()))),sn.encodeLayers(e,t,i,r,l,c,h)}static encodeLayers(e,t,i,r,s,l,c){if(t!==Q.AZTEC)throw new I("Can only encode AZTEC, but got "+t);let h=xe.encode(Y.getBytes(e,s),l,c);return sn.renderResult(h,i,r)}static renderResult(e,t,i){let r=e.getMatrix();if(r==null)throw new Ft;let s=r.getWidth(),l=r.getHeight(),c=Math.max(t,s),h=Math.max(i,l),f=Math.min(c/s,h/l),p=(c-s*f)/2,b=(h-l*f)/2,w=new Me(c,h);for(let y=0,E=b;y<l;y++,E+=f)for(let S=0,T=p;S<s;S++,T+=f)r.get(S,y)&&w.setRegion(T,E,f,f);return w}}n.AbstractExpandedDecoder=Dn,n.ArgumentException=O,n.ArithmeticException=Xr,n.AztecCode=oa,n.AztecCodeReader=Zr,n.AztecCodeWriter=sn,n.AztecDecoder=Ne,n.AztecDetector=js,n.AztecDetectorResult=Ws,n.AztecEncoder=xe,n.AztecHighLevelEncoder=Ir,n.AztecPoint=ht,n.BarcodeFormat=Q,n.Binarizer=pe,n.BinaryBitmap=H,n.BitArray=de,n.BitMatrix=Me,n.BitSource=Ln,n.BrowserAztecCodeReader=Ko,n.BrowserBarcodeReader=Jo,n.BrowserCodeReader=Ci,n.BrowserDatamatrixCodeReader=tl,n.BrowserMultiFormatReader=ul,n.BrowserPDF417Reader=fl,n.BrowserQRCodeReader=gl,n.BrowserQRCodeSvgWriter=Ni,n.CharacterSetECI=B,n.ChecksumException=X,n.Code128Reader=V,n.Code39Reader=Xe,n.DataMatrixDecodedBitStreamParser=li,n.DataMatrixReader=ci,n.DecodeHintType=be,n.DecoderResult=mr,n.DefaultGridSampler=Xs,n.DetectorResult=Kr,n.EAN13Reader=Ai,n.EncodeHintType=Ke,n.Exception=_,n.FormatException=z,n.GenericGF=we,n.GenericGFPoly=pt,n.GlobalHistogramBinarizer=Ze,n.GridSampler=Nn,n.GridSamplerInstance=ai,n.HTMLCanvasElementLuminanceSource=si,n.HybridBinarizer=oe,n.ITFReader=Ee,n.IllegalArgumentException=I,n.IllegalStateException=Ft,n.InvertedLuminanceSource=ni,n.LuminanceSource=pr,n.MathUtils=me,n.MultiFormatOneDReader=Ki,n.MultiFormatReader=sa,n.MultiFormatWriter=ml,n.NotFoundException=D,n.OneDReader=We,n.PDF417DecodedBitStreamParser=k,n.PDF417DecoderErrorCorrection=Js,n.PDF417Reader=rt,n.PDF417ResultMetadata=ta,n.PerspectiveTransform=kt,n.PlanarYUVLuminanceSource=Vt,n.QRCodeByteMatrix=rn,n.QRCodeDataMask=St,n.QRCodeDecodedBitStreamParser=Pe,n.QRCodeDecoderErrorCorrectionLevel=ke,n.QRCodeDecoderFormatInformation=ot,n.QRCodeEncoder=Re,n.QRCodeEncoderQRCode=Ti,n.QRCodeMaskUtil=$e,n.QRCodeMatrixUtil=J,n.QRCodeMode=q,n.QRCodeReader=di,n.QRCodeVersion=Z,n.QRCodeWriter=Yi,n.RGBLuminanceSource=Gn,n.RSS14Reader=Ue,n.RSSExpandedReader=P,n.ReaderException=tn,n.ReedSolomonDecoder=br,n.ReedSolomonEncoder=Hn,n.ReedSolomonException=Gi,n.Result=dt,n.ResultMetadataType=Ye,n.ResultPoint=j,n.StringUtils=Y,n.UnsupportedOperationException=et,n.VideoInputDevice=Gs,n.WhiteRectangleDetector=jt,n.WriterException=Se,n.ZXingArrays=ce,n.ZXingCharset=aa,n.ZXingInteger=K,n.ZXingStandardCharsets=Wn,n.ZXingStringBuilder=ae,n.ZXingStringEncoding=De,n.ZXingSystem=te,n.createAbstractExpandedDecoder=qs,Object.defineProperty(n,"__esModule",{value:!0})})})(Ss,Ss.exports);var Be=Ss.exports;const wh=Object.freeze(Object.defineProperty({__proto__:null},Symbol.toStringTag,{value:"Module"}));var Ka=function(){function o(a,n,d){if(this.formatMap=new Map([[W.QR_CODE,Be.BarcodeFormat.QR_CODE],[W.AZTEC,Be.BarcodeFormat.AZTEC],[W.CODABAR,Be.BarcodeFormat.CODABAR],[W.CODE_39,Be.BarcodeFormat.CODE_39],[W.CODE_93,Be.BarcodeFormat.CODE_93],[W.CODE_128,Be.BarcodeFormat.CODE_128],[W.DATA_MATRIX,Be.BarcodeFormat.DATA_MATRIX],[W.MAXICODE,Be.BarcodeFormat.MAXICODE],[W.ITF,Be.BarcodeFormat.ITF],[W.EAN_13,Be.BarcodeFormat.EAN_13],[W.EAN_8,Be.BarcodeFormat.EAN_8],[W.PDF_417,Be.BarcodeFormat.PDF_417],[W.RSS_14,Be.BarcodeFormat.RSS_14],[W.RSS_EXPANDED,Be.BarcodeFormat.RSS_EXPANDED],[W.UPC_A,Be.BarcodeFormat.UPC_A],[W.UPC_E,Be.BarcodeFormat.UPC_E],[W.UPC_EAN_EXTENSION,Be.BarcodeFormat.UPC_EAN_EXTENSION]]),this.reverseFormatMap=this.createReverseFormatMap(),!wh)throw"Use html5qrcode.min.js without edit, ZXing not found.";this.verbose=n,this.logger=d;var u=this.createZXingFormats(a),g=new Map;g.set(Be.DecodeHintType.POSSIBLE_FORMATS,u),g.set(Be.DecodeHintType.TRY_HARDER,!1),this.hints=g}return o.prototype.decodeAsync=function(a){var n=this;return new Promise(function(d,u){try{d(n.decode(a))}catch(g){u(g)}})},o.prototype.decode=function(a){var n=new Be.MultiFormatReader(this.verbose,this.hints),d=new Be.HTMLCanvasElementLuminanceSource(a),u=new Be.BinaryBitmap(new Be.HybridBinarizer(d)),g=n.decode(u);return{text:g.text,format:zo.create(this.toHtml5QrcodeSupportedFormats(g.format)),debugData:this.createDebugData()}},o.prototype.createReverseFormatMap=function(){var a=new Map;return this.formatMap.forEach(function(n,d,u){a.set(n,d)}),a},o.prototype.toHtml5QrcodeSupportedFormats=function(a){if(!this.reverseFormatMap.has(a))throw"reverseFormatMap doesn't have ".concat(a);return this.reverseFormatMap.get(a)},o.prototype.createZXingFormats=function(a){for(var n=[],d=0,u=a;d<u.length;d++){var g=u[d];this.formatMap.has(g)?n.push(this.formatMap.get(g)):this.logger.logError("".concat(g," is not supported by")+"ZXingHtml5QrcodeShim")}return n},o.prototype.createDebugData=function(){return{decoderName:"zxing-js"}},o}(),_h=function(o,a,n,d){function u(g){return g instanceof n?g:new n(function(m){m(g)})}return new(n||(n=Promise))(function(g,m){function C(O){try{_(d.next(O))}catch(I){m(I)}}function A(O){try{_(d.throw(O))}catch(I){m(I)}}function _(O){O.done?g(O.value):u(O.value).then(C,A)}_((d=d.apply(o,a||[])).next())})},vh=function(o,a){var n={label:0,sent:function(){if(g[0]&1)throw g[1];return g[1]},trys:[],ops:[]},d,u,g,m;return m={next:C(0),throw:C(1),return:C(2)},typeof Symbol=="function"&&(m[Symbol.iterator]=function(){return this}),m;function C(_){return function(O){return A([_,O])}}function A(_){if(d)throw new TypeError("Generator is already executing.");for(;m&&(m=0,_[0]&&(n=0)),n;)try{if(d=1,u&&(g=_[0]&2?u.return:_[0]?u.throw||((g=u.return)&&g.call(u),0):u.next)&&!(g=g.call(u,_[1])).done)return g;switch(u=0,g&&(_=[_[0]&2,g.value]),_[0]){case 0:case 1:g=_;break;case 4:return n.label++,{value:_[1],done:!1};case 5:n.label++,u=_[1],_=[0];continue;case 7:_=n.ops.pop(),n.trys.pop();continue;default:if(g=n.trys,!(g=g.length>0&&g[g.length-1])&&(_[0]===6||_[0]===2)){n=0;continue}if(_[0]===3&&(!g||_[1]>g[0]&&_[1]<g[3])){n.label=_[1];break}if(_[0]===6&&n.label<g[1]){n.label=g[1],g=_;break}if(g&&n.label<g[2]){n.label=g[2],n.ops.push(_);break}g[2]&&n.ops.pop(),n.trys.pop();continue}_=a.call(o,n)}catch(O){_=[6,O],u=0}finally{d=g=0}if(_[0]&5)throw _[1];return{value:_[0]?_[1]:void 0,done:!0}}},Za=function(){function o(a,n,d){if(this.formatMap=new Map([[W.QR_CODE,"qr_code"],[W.AZTEC,"aztec"],[W.CODABAR,"codabar"],[W.CODE_39,"code_39"],[W.CODE_93,"code_93"],[W.CODE_128,"code_128"],[W.DATA_MATRIX,"data_matrix"],[W.ITF,"itf"],[W.EAN_13,"ean_13"],[W.EAN_8,"ean_8"],[W.PDF_417,"pdf417"],[W.UPC_A,"upc_a"],[W.UPC_E,"upc_e"]]),this.reverseFormatMap=this.createReverseFormatMap(),!o.isSupported())throw"Use html5qrcode.min.js without edit, Use BarcodeDetectorDelegate only if it isSupported();";this.verbose=n,this.logger=d;var u=this.createBarcodeDetectorFormats(a);if(this.detector=new BarcodeDetector(u),!this.detector)throw"BarcodeDetector detector not supported"}return o.isSupported=function(){if(!("BarcodeDetector"in window))return!1;var a=new BarcodeDetector({formats:["qr_code"]});return typeof a<"u"},o.prototype.decodeAsync=function(a){return _h(this,void 0,void 0,function(){var n,d;return vh(this,function(u){switch(u.label){case 0:return[4,this.detector.detect(a)];case 1:if(n=u.sent(),!n||n.length===0)throw"No barcode or QR code detected.";return d=this.selectLargestBarcode(n),[2,{text:d.rawValue,format:zo.create(this.toHtml5QrcodeSupportedFormats(d.format)),debugData:this.createDebugData()}]}})})},o.prototype.selectLargestBarcode=function(a){for(var n=null,d=0,u=0,g=a;u<g.length;u++){var m=g[u],C=m.boundingBox.width*m.boundingBox.height;C>d&&(d=C,n=m)}if(!n)throw"No largest barcode found";return n},o.prototype.createBarcodeDetectorFormats=function(a){for(var n=[],d=0,u=a;d<u.length;d++){var g=u[d];this.formatMap.has(g)?n.push(this.formatMap.get(g)):this.logger.warn("".concat(g," is not supported by")+"BarcodeDetectorDelegate")}return{formats:n}},o.prototype.toHtml5QrcodeSupportedFormats=function(a){if(!this.reverseFormatMap.has(a))throw"reverseFormatMap doesn't have ".concat(a);return this.reverseFormatMap.get(a)},o.prototype.createReverseFormatMap=function(){var a=new Map;return this.formatMap.forEach(function(n,d,u){a.set(n,d)}),a},o.prototype.createDebugData=function(){return{decoderName:"BarcodeDetector"}},o}(),Ya=function(o,a,n,d){function u(g){return g instanceof n?g:new n(function(m){m(g)})}return new(n||(n=Promise))(function(g,m){function C(O){try{_(d.next(O))}catch(I){m(I)}}function A(O){try{_(d.throw(O))}catch(I){m(I)}}function _(O){O.done?g(O.value):u(O.value).then(C,A)}_((d=d.apply(o,a||[])).next())})},qa=function(o,a){var n={label:0,sent:function(){if(g[0]&1)throw g[1];return g[1]},trys:[],ops:[]},d,u,g,m;return m={next:C(0),throw:C(1),return:C(2)},typeof Symbol=="function"&&(m[Symbol.iterator]=function(){return this}),m;function C(_){return function(O){return A([_,O])}}function A(_){if(d)throw new TypeError("Generator is already executing.");for(;m&&(m=0,_[0]&&(n=0)),n;)try{if(d=1,u&&(g=_[0]&2?u.return:_[0]?u.throw||((g=u.return)&&g.call(u),0):u.next)&&!(g=g.call(u,_[1])).done)return g;switch(u=0,g&&(_=[_[0]&2,g.value]),_[0]){case 0:case 1:g=_;break;case 4:return n.label++,{value:_[1],done:!1};case 5:n.label++,u=_[1],_=[0];continue;case 7:_=n.ops.pop(),n.trys.pop();continue;default:if(g=n.trys,!(g=g.length>0&&g[g.length-1])&&(_[0]===6||_[0]===2)){n=0;continue}if(_[0]===3&&(!g||_[1]>g[0]&&_[1]<g[3])){n.label=_[1];break}if(_[0]===6&&n.label<g[1]){n.label=g[1],g=_;break}if(g&&n.label<g[2]){n.label=g[2],n.ops.push(_);break}g[2]&&n.ops.pop(),n.trys.pop();continue}_=a.call(o,n)}catch(O){_=[6,O],u=0}finally{d=g=0}if(_[0]&5)throw _[1];return{value:_[0]?_[1]:void 0,done:!0}}},yh=function(){function o(a,n,d,u){this.EXECUTIONS_TO_REPORT_PERFORMANCE=100,this.executions=0,this.executionResults=[],this.wasPrimaryDecoderUsedInLastDecode=!1,this.verbose=d,n&&Za.isSupported()?(this.primaryDecoder=new Za(a,d,u),this.secondaryDecoder=new Ka(a,d,u)):this.primaryDecoder=new Ka(a,d,u)}return o.prototype.decodeAsync=function(a){return Ya(this,void 0,void 0,function(){var n;return qa(this,function(d){switch(d.label){case 0:n=performance.now(),d.label=1;case 1:return d.trys.push([1,,3,4]),[4,this.getDecoder().decodeAsync(a)];case 2:return[2,d.sent()];case 3:return this.possiblyLogPerformance(n),[7];case 4:return[2]}})})},o.prototype.decodeRobustlyAsync=function(a){return Ya(this,void 0,void 0,function(){var n,d;return qa(this,function(u){switch(u.label){case 0:n=performance.now(),u.label=1;case 1:return u.trys.push([1,3,4,5]),[4,this.primaryDecoder.decodeAsync(a)];case 2:return[2,u.sent()];case 3:if(d=u.sent(),this.secondaryDecoder)return[2,this.secondaryDecoder.decodeAsync(a)];throw d;case 4:return this.possiblyLogPerformance(n),[7];case 5:return[2]}})})},o.prototype.getDecoder=function(){return this.secondaryDecoder?this.wasPrimaryDecoderUsedInLastDecode===!1?(this.wasPrimaryDecoderUsedInLastDecode=!0,this.primaryDecoder):(this.wasPrimaryDecoderUsedInLastDecode=!1,this.secondaryDecoder):this.primaryDecoder},o.prototype.possiblyLogPerformance=function(a){if(this.verbose){var n=performance.now()-a;this.executionResults.push(n),this.executions++,this.possiblyFlushPerformanceReport()}},o.prototype.possiblyFlushPerformanceReport=function(){if(!(this.executions<this.EXECUTIONS_TO_REPORT_PERFORMANCE)){for(var a=0,n=0,d=this.executionResults;n<d.length;n++){var u=d[n];a+=u}var g=a/this.executionResults.length;console.log("".concat(g," ms for ").concat(this.executionResults.length," last runs.")),this.executions=0,this.executionResults=[]}},o}(),Vs=function(){var o=function(a,n){return o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(d,u){d.__proto__=u}||function(d,u){for(var g in u)Object.prototype.hasOwnProperty.call(u,g)&&(d[g]=u[g])},o(a,n)};return function(a,n){if(typeof n!="function"&&n!==null)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");o(a,n);function d(){this.constructor=a}a.prototype=n===null?Object.create(n):(d.prototype=n.prototype,new d)}}(),pn=function(o,a,n,d){function u(g){return g instanceof n?g:new n(function(m){m(g)})}return new(n||(n=Promise))(function(g,m){function C(O){try{_(d.next(O))}catch(I){m(I)}}function A(O){try{_(d.throw(O))}catch(I){m(I)}}function _(O){O.done?g(O.value):u(O.value).then(C,A)}_((d=d.apply(o,a||[])).next())})},mn=function(o,a){var n={label:0,sent:function(){if(g[0]&1)throw g[1];return g[1]},trys:[],ops:[]},d,u,g,m;return m={next:C(0),throw:C(1),return:C(2)},typeof Symbol=="function"&&(m[Symbol.iterator]=function(){return this}),m;function C(_){return function(O){return A([_,O])}}function A(_){if(d)throw new TypeError("Generator is already executing.");for(;m&&(m=0,_[0]&&(n=0)),n;)try{if(d=1,u&&(g=_[0]&2?u.return:_[0]?u.throw||((g=u.return)&&g.call(u),0):u.next)&&!(g=g.call(u,_[1])).done)return g;switch(u=0,g&&(_=[_[0]&2,g.value]),_[0]){case 0:case 1:g=_;break;case 4:return n.label++,{value:_[1],done:!1};case 5:n.label++,u=_[1],_=[0];continue;case 7:_=n.ops.pop(),n.trys.pop();continue;default:if(g=n.trys,!(g=g.length>0&&g[g.length-1])&&(_[0]===6||_[0]===2)){n=0;continue}if(_[0]===3&&(!g||_[1]>g[0]&&_[1]<g[3])){n.label=_[1];break}if(_[0]===6&&n.label<g[1]){n.label=g[1],g=_;break}if(g&&n.label<g[2]){n.label=g[2],n.ops.push(_);break}g[2]&&n.ops.pop(),n.trys.pop();continue}_=a.call(o,n)}catch(O){_=[6,O],u=0}finally{d=g=0}if(_[0]&5)throw _[1];return{value:_[0]?_[1]:void 0,done:!0}}},Ho=function(){function o(a,n){this.name=a,this.track=n}return o.prototype.isSupported=function(){return this.track.getCapabilities?this.name in this.track.getCapabilities():!1},o.prototype.apply=function(a){var n={};n[this.name]=a;var d={advanced:[n]};return this.track.applyConstraints(d)},o.prototype.value=function(){var a=this.track.getSettings();if(this.name in a){var n=a[this.name];return n}return null},o}(),Ch=function(o){Vs(a,o);function a(n,d){return o.call(this,n,d)||this}return a.prototype.min=function(){return this.getCapabilities().min},a.prototype.max=function(){return this.getCapabilities().max},a.prototype.step=function(){return this.getCapabilities().step},a.prototype.apply=function(n){var d={};d[this.name]=n;var u={advanced:[d]};return this.track.applyConstraints(u)},a.prototype.getCapabilities=function(){this.failIfNotSupported();var n=this.track.getCapabilities(),d=n[this.name];return{min:d.min,max:d.max,step:d.step}},a.prototype.failIfNotSupported=function(){if(!this.isSupported())throw new Error("".concat(this.name," capability not supported"))},a}(Ho),Ah=function(o){Vs(a,o);function a(n){return o.call(this,"zoom",n)||this}return a}(Ch),Eh=function(o){Vs(a,o);function a(n){return o.call(this,"torch",n)||this}return a}(Ho),Sh=function(){function o(a){this.track=a}return o.prototype.zoomFeature=function(){return new Ah(this.track)},o.prototype.torchFeature=function(){return new Eh(this.track)},o}(),Ih=function(){function o(a,n,d){this.isClosed=!1,this.parentElement=a,this.mediaStream=n,this.callbacks=d,this.surface=this.createVideoElement(this.parentElement.clientWidth),a.append(this.surface)}return o.prototype.createVideoElement=function(a){var n=document.createElement("video");return n.style.width="".concat(a,"px"),n.style.display="block",n.muted=!0,n.setAttribute("muted","true"),n.playsInline=!0,n},o.prototype.setupSurface=function(){var a=this;this.surface.onabort=function(){throw"RenderedCameraImpl video surface onabort() called"},this.surface.onerror=function(){throw"RenderedCameraImpl video surface onerror() called"};var n=function(){var d=a.surface.clientWidth,u=a.surface.clientHeight;a.callbacks.onRenderSurfaceReady(d,u),a.surface.removeEventListener("playing",n)};this.surface.addEventListener("playing",n),this.surface.srcObject=this.mediaStream,this.surface.play()},o.create=function(a,n,d,u){return pn(this,void 0,void 0,function(){var g,m;return mn(this,function(C){switch(C.label){case 0:return g=new o(a,n,u),d.aspectRatio?(m={aspectRatio:d.aspectRatio},[4,g.getFirstTrackOrFail().applyConstraints(m)]):[3,2];case 1:C.sent(),C.label=2;case 2:return g.setupSurface(),[2,g]}})})},o.prototype.failIfClosed=function(){if(this.isClosed)throw"The RenderedCamera has already been closed."},o.prototype.getFirstTrackOrFail=function(){if(this.failIfClosed(),this.mediaStream.getVideoTracks().length===0)throw"No video tracks found";return this.mediaStream.getVideoTracks()[0]},o.prototype.pause=function(){this.failIfClosed(),this.surface.pause()},o.prototype.resume=function(a){this.failIfClosed();var n=this,d=function(){setTimeout(a,200),n.surface.removeEventListener("playing",d)};this.surface.addEventListener("playing",d),this.surface.play()},o.prototype.isPaused=function(){return this.failIfClosed(),this.surface.paused},o.prototype.getSurface=function(){return this.failIfClosed(),this.surface},o.prototype.getRunningTrackCapabilities=function(){return this.getFirstTrackOrFail().getCapabilities()},o.prototype.getRunningTrackSettings=function(){return this.getFirstTrackOrFail().getSettings()},o.prototype.applyVideoConstraints=function(a){return pn(this,void 0,void 0,function(){return mn(this,function(n){if("aspectRatio"in a)throw"Changing 'aspectRatio' in run-time is not yet supported.";return[2,this.getFirstTrackOrFail().applyConstraints(a)]})})},o.prototype.close=function(){if(this.isClosed)return Promise.resolve();var a=this;return new Promise(function(n,d){var u=a.mediaStream.getVideoTracks(),g=u.length,m=0;a.mediaStream.getVideoTracks().forEach(function(C){a.mediaStream.removeTrack(C),C.stop(),++m,m>=g&&(a.isClosed=!0,a.parentElement.removeChild(a.surface),n())})})},o.prototype.getCapabilities=function(){return new Sh(this.getFirstTrackOrFail())},o}(),Th=function(){function o(a){this.mediaStream=a}return o.prototype.render=function(a,n,d){return pn(this,void 0,void 0,function(){return mn(this,function(u){return[2,Ih.create(a,this.mediaStream,n,d)]})})},o.create=function(a){return pn(this,void 0,void 0,function(){var n,d;return mn(this,function(u){switch(u.label){case 0:if(!navigator.mediaDevices)throw"navigator.mediaDevices not supported";return n={audio:!1,video:a},[4,navigator.mediaDevices.getUserMedia(n)];case 1:return d=u.sent(),[2,new o(d)]}})})},o}(),Qa=function(o,a,n,d){function u(g){return g instanceof n?g:new n(function(m){m(g)})}return new(n||(n=Promise))(function(g,m){function C(O){try{_(d.next(O))}catch(I){m(I)}}function A(O){try{_(d.throw(O))}catch(I){m(I)}}function _(O){O.done?g(O.value):u(O.value).then(C,A)}_((d=d.apply(o,a||[])).next())})},Ja=function(o,a){var n={label:0,sent:function(){if(g[0]&1)throw g[1];return g[1]},trys:[],ops:[]},d,u,g,m;return m={next:C(0),throw:C(1),return:C(2)},typeof Symbol=="function"&&(m[Symbol.iterator]=function(){return this}),m;function C(_){return function(O){return A([_,O])}}function A(_){if(d)throw new TypeError("Generator is already executing.");for(;m&&(m=0,_[0]&&(n=0)),n;)try{if(d=1,u&&(g=_[0]&2?u.return:_[0]?u.throw||((g=u.return)&&g.call(u),0):u.next)&&!(g=g.call(u,_[1])).done)return g;switch(u=0,g&&(_=[_[0]&2,g.value]),_[0]){case 0:case 1:g=_;break;case 4:return n.label++,{value:_[1],done:!1};case 5:n.label++,u=_[1],_=[0];continue;case 7:_=n.ops.pop(),n.trys.pop();continue;default:if(g=n.trys,!(g=g.length>0&&g[g.length-1])&&(_[0]===6||_[0]===2)){n=0;continue}if(_[0]===3&&(!g||_[1]>g[0]&&_[1]<g[3])){n.label=_[1];break}if(_[0]===6&&n.label<g[1]){n.label=g[1],g=_;break}if(g&&n.label<g[2]){n.label=g[2],n.ops.push(_);break}g[2]&&n.ops.pop(),n.trys.pop();continue}_=a.call(o,n)}catch(O){_=[6,O],u=0}finally{d=g=0}if(_[0]&5)throw _[1];return{value:_[0]?_[1]:void 0,done:!0}}},Nh=function(){function o(){}return o.failIfNotSupported=function(){return Qa(this,void 0,void 0,function(){return Ja(this,function(a){if(!navigator.mediaDevices)throw"navigator.mediaDevices not supported";return[2,new o]})})},o.prototype.create=function(a){return Qa(this,void 0,void 0,function(){return Ja(this,function(n){return[2,Th.create(a)]})})},o}(),kh=function(o,a,n,d){function u(g){return g instanceof n?g:new n(function(m){m(g)})}return new(n||(n=Promise))(function(g,m){function C(O){try{_(d.next(O))}catch(I){m(I)}}function A(O){try{_(d.throw(O))}catch(I){m(I)}}function _(O){O.done?g(O.value):u(O.value).then(C,A)}_((d=d.apply(o,a||[])).next())})},Rh=function(o,a){var n={label:0,sent:function(){if(g[0]&1)throw g[1];return g[1]},trys:[],ops:[]},d,u,g,m;return m={next:C(0),throw:C(1),return:C(2)},typeof Symbol=="function"&&(m[Symbol.iterator]=function(){return this}),m;function C(_){return function(O){return A([_,O])}}function A(_){if(d)throw new TypeError("Generator is already executing.");for(;m&&(m=0,_[0]&&(n=0)),n;)try{if(d=1,u&&(g=_[0]&2?u.return:_[0]?u.throw||((g=u.return)&&g.call(u),0):u.next)&&!(g=g.call(u,_[1])).done)return g;switch(u=0,g&&(_=[_[0]&2,g.value]),_[0]){case 0:case 1:g=_;break;case 4:return n.label++,{value:_[1],done:!1};case 5:n.label++,u=_[1],_=[0];continue;case 7:_=n.ops.pop(),n.trys.pop();continue;default:if(g=n.trys,!(g=g.length>0&&g[g.length-1])&&(_[0]===6||_[0]===2)){n=0;continue}if(_[0]===3&&(!g||_[1]>g[0]&&_[1]<g[3])){n.label=_[1];break}if(_[0]===6&&n.label<g[1]){n.label=g[1],g=_;break}if(g&&n.label<g[2]){n.label=g[2],n.ops.push(_);break}g[2]&&n.ops.pop(),n.trys.pop();continue}_=a.call(o,n)}catch(O){_=[6,O],u=0}finally{d=g=0}if(_[0]&5)throw _[1];return{value:_[0]?_[1]:void 0,done:!0}}},Oh=function(){function o(){}return o.retrieve=function(){if(navigator.mediaDevices)return o.getCamerasFromMediaDevices();var a=MediaStreamTrack;return MediaStreamTrack&&a.getSources?o.getCamerasFromMediaStreamTrack():o.rejectWithError()},o.rejectWithError=function(){var a=tr.unableToQuerySupportedDevices();return o.isHttpsOrLocalhost()||(a=tr.insecureContextCameraQueryError()),Promise.reject(a)},o.isHttpsOrLocalhost=function(){if(location.protocol==="https:")return!0;var a=location.host.split(":")[0];return a==="127.0.0.1"||a==="localhost"},o.getCamerasFromMediaDevices=function(){return kh(this,void 0,void 0,function(){var a,n,d,u,g,m,C;return Rh(this,function(A){switch(A.label){case 0:return a=function(_){for(var O=_.getVideoTracks(),I=0,H=O;I<H.length;I++){var X=H[I];X.enabled=!1,X.stop(),_.removeTrack(X)}},[4,navigator.mediaDevices.getUserMedia({audio:!1,video:!0})];case 1:return n=A.sent(),[4,navigator.mediaDevices.enumerateDevices()];case 2:for(d=A.sent(),u=[],g=0,m=d;g<m.length;g++)C=m[g],C.kind==="videoinput"&&u.push({id:C.deviceId,label:C.label});return a(n),[2,u]}})})},o.getCamerasFromMediaStreamTrack=function(){return new Promise(function(a,n){var d=function(g){for(var m=[],C=0,A=g;C<A.length;C++){var _=A[C];_.kind==="video"&&m.push({id:_.id,label:_.label})}a(m)},u=MediaStreamTrack;u.getSources(d)})},o}(),ze;(function(o){o[o.UNKNOWN=0]="UNKNOWN",o[o.NOT_STARTED=1]="NOT_STARTED",o[o.SCANNING=2]="SCANNING",o[o.PAUSED=3]="PAUSED"})(ze||(ze={}));var Dh=function(){function o(){this.state=ze.NOT_STARTED,this.onGoingTransactionNewState=ze.UNKNOWN}return o.prototype.directTransition=function(a){this.failIfTransitionOngoing(),this.validateTransition(a),this.state=a},o.prototype.startTransition=function(a){return this.failIfTransitionOngoing(),this.validateTransition(a),this.onGoingTransactionNewState=a,this},o.prototype.execute=function(){if(this.onGoingTransactionNewState===ze.UNKNOWN)throw"Transaction is already cancelled, cannot execute().";var a=this.onGoingTransactionNewState;this.onGoingTransactionNewState=ze.UNKNOWN,this.directTransition(a)},o.prototype.cancel=function(){if(this.onGoingTransactionNewState===ze.UNKNOWN)throw"Transaction is already cancelled, cannot cancel().";this.onGoingTransactionNewState=ze.UNKNOWN},o.prototype.getState=function(){return this.state},o.prototype.failIfTransitionOngoing=function(){if(this.onGoingTransactionNewState!==ze.UNKNOWN)throw"Cannot transition to a new state, already under transition"},o.prototype.validateTransition=function(a){switch(this.state){case ze.UNKNOWN:throw"Transition from unknown is not allowed";case ze.NOT_STARTED:this.failIfNewStateIs(a,[ze.PAUSED]);break;case ze.SCANNING:break;case ze.PAUSED:break}},o.prototype.failIfNewStateIs=function(a,n){for(var d=0,u=n;d<u.length;d++){var g=u[d];if(a===g)throw"Cannot transition from ".concat(this.state," to ").concat(a)}},o}(),Mh=function(){function o(a){this.stateManager=a}return o.prototype.startTransition=function(a){return this.stateManager.startTransition(a)},o.prototype.directTransition=function(a){this.stateManager.directTransition(a)},o.prototype.getState=function(){return this.stateManager.getState()},o.prototype.canScanFile=function(){return this.stateManager.getState()===ze.NOT_STARTED},o.prototype.isScanning=function(){return this.stateManager.getState()!==ze.NOT_STARTED},o.prototype.isStrictlyScanning=function(){return this.stateManager.getState()===ze.SCANNING},o.prototype.isPaused=function(){return this.stateManager.getState()===ze.PAUSED},o}(),Ph=function(){function o(){}return o.create=function(){return new Mh(new Dh)},o}(),Bh=function(){var o=function(a,n){return o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(d,u){d.__proto__=u}||function(d,u){for(var g in u)Object.prototype.hasOwnProperty.call(u,g)&&(d[g]=u[g])},o(a,n)};return function(a,n){if(typeof n!="function"&&n!==null)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");o(a,n);function d(){this.constructor=a}a.prototype=n===null?Object.create(n):(d.prototype=n.prototype,new d)}}(),Ct=function(o){Bh(a,o);function a(){return o!==null&&o.apply(this,arguments)||this}return a.DEFAULT_WIDTH=300,a.DEFAULT_WIDTH_OFFSET=2,a.FILE_SCAN_MIN_HEIGHT=300,a.FILE_SCAN_HIDDEN_CANVAS_PADDING=100,a.MIN_QR_BOX_SIZE=50,a.SHADED_LEFT=1,a.SHADED_RIGHT=2,a.SHADED_TOP=3,a.SHADED_BOTTOM=4,a.SHADED_REGION_ELEMENT_ID="qr-shaded-region",a.VERBOSE=!1,a.BORDER_SHADER_DEFAULT_COLOR="#ffffff",a.BORDER_SHADER_MATCH_COLOR="rgb(90, 193, 56)",a}(mh),Lh=function(){function o(a,n){this.logger=n,this.fps=Ct.SCAN_DEFAULT_FPS,a?(a.fps&&(this.fps=a.fps),this.disableFlip=a.disableFlip===!0,this.qrbox=a.qrbox,this.aspectRatio=a.aspectRatio,this.videoConstraints=a.videoConstraints):this.disableFlip=Ct.DEFAULT_DISABLE_FLIP}return o.prototype.isMediaStreamConstraintsValid=function(){return this.videoConstraints?Vo.isMediaStreamConstraintsValid(this.videoConstraints,this.logger):(this.logger.logError("Empty videoConstraints",!0),!1)},o.prototype.isShadedBoxEnabled=function(){return!qt(this.qrbox)},o.create=function(a,n){return new o(a,n)},o}(),Fh=function(){function o(a,n){if(this.element=null,this.canvasElement=null,this.scannerPausedUiElement=null,this.hasBorderShaders=null,this.borderShaders=null,this.qrMatch=null,this.renderedCamera=null,this.qrRegion=null,this.context=null,this.lastScanImageFile=null,this.isScanning=!1,!document.getElementById(a))throw"HTML Element with id=".concat(a," not found");this.elementId=a,this.verbose=!1;var d;typeof n=="boolean"?this.verbose=n===!0:n&&(d=n,this.verbose=d.verbose===!0,d.experimentalFeatures),this.logger=new bh(this.verbose),this.qrcode=new yh(this.getSupportedFormats(n),this.getUseBarCodeDetectorIfSupported(d),this.verbose,this.logger),this.foreverScanTimeout,this.shouldScan=!0,this.stateManagerProxy=Ph.create()}return o.prototype.start=function(a,n,d,u){var g=this;if(!a)throw"cameraIdOrConfig is required";if(!d||typeof d!="function")throw"qrCodeSuccessCallback is required and should be a function.";var m;u?m=u:m=this.verbose?this.logger.log:function(){};var C=Lh.create(n,this.logger);this.clearElement();var A=!1;C.videoConstraints&&(C.isMediaStreamConstraintsValid()?A=!0:this.logger.logError("'videoConstraints' is not valid 'MediaStreamConstraints, it will be ignored.'",!0));var _=A,O=document.getElementById(this.elementId);O.clientWidth?O.clientWidth:Ct.DEFAULT_WIDTH,O.style.position="relative",this.shouldScan=!0,this.element=O;var I=this,H=this.stateManagerProxy.startTransition(ze.SCANNING);return new Promise(function(X,pe){var te=_?C.videoConstraints:I.createVideoConstraints(a);if(!te){H.cancel(),pe("videoConstraints should be defined");return}var Le={};(!_||C.aspectRatio)&&(Le.aspectRatio=C.aspectRatio);var Ce={onRenderSurfaceReady:function(ce,K){I.setupUi(ce,K,C),I.isScanning=!0,I.foreverScan(C,d,m)}};Nh.failIfNotSupported().then(function(ce){ce.create(te).then(function(K){return K.render(g.element,Le,Ce).then(function(de){I.renderedCamera=de,H.execute(),X(null)}).catch(function(de){H.cancel(),pe(de)})}).catch(function(K){H.cancel(),pe(tr.errorGettingUserMedia(K))})}).catch(function(ce){H.cancel(),pe(tr.cameraStreamingNotSupported())})})},o.prototype.pause=function(a){if(!this.stateManagerProxy.isStrictlyScanning())throw"Cannot pause, scanner is not scanning.";this.stateManagerProxy.directTransition(ze.PAUSED),this.showPausedState(),(qt(a)||a!==!0)&&(a=!1),a&&this.renderedCamera&&this.renderedCamera.pause()},o.prototype.resume=function(){if(!this.stateManagerProxy.isPaused())throw"Cannot result, scanner is not paused.";if(!this.renderedCamera)throw"renderedCamera doesn't exist while trying resume()";var a=this,n=function(){a.stateManagerProxy.directTransition(ze.SCANNING),a.hidePausedState()};if(!this.renderedCamera.isPaused()){n();return}this.renderedCamera.resume(function(){n()})},o.prototype.getState=function(){return this.stateManagerProxy.getState()},o.prototype.stop=function(){var a=this;if(!this.stateManagerProxy.isScanning())throw"Cannot stop, scanner is not running or paused.";var n=this.stateManagerProxy.startTransition(ze.NOT_STARTED);this.shouldScan=!1,this.foreverScanTimeout&&clearTimeout(this.foreverScanTimeout);var d=function(){if(a.element){var g=document.getElementById(Ct.SHADED_REGION_ELEMENT_ID);g&&a.element.removeChild(g)}},u=this;return this.renderedCamera.close().then(function(){return u.renderedCamera=null,u.element&&(u.element.removeChild(u.canvasElement),u.canvasElement=null),d(),u.qrRegion&&(u.qrRegion=null),u.context&&(u.context=null),n.execute(),u.hidePausedState(),u.isScanning=!1,Promise.resolve()})},o.prototype.scanFile=function(a,n){return this.scanFileV2(a,n).then(function(d){return d.decodedText})},o.prototype.scanFileV2=function(a,n){var d=this;if(!a||!(a instanceof File))throw"imageFile argument is mandatory and should be instance of File. Use 'event.target.files[0]'.";if(qt(n)&&(n=!0),!this.stateManagerProxy.canScanFile())throw"Cannot start file scan - ongoing camera scan";return new Promise(function(u,g){d.possiblyCloseLastScanImageFile(),d.clearElement(),d.lastScanImageFile=URL.createObjectURL(a);var m=new Image;m.onload=function(){var C=m.width,A=m.height,_=document.getElementById(d.elementId),O=_.clientWidth?_.clientWidth:Ct.DEFAULT_WIDTH,I=Math.max(_.clientHeight?_.clientHeight:A,Ct.FILE_SCAN_MIN_HEIGHT),H=d.computeCanvasDrawConfig(C,A,O,I);if(n){var X=d.createCanvasElement(O,I,"qr-canvas-visible");X.style.display="inline-block",_.appendChild(X);var pe=X.getContext("2d");if(!pe)throw"Unable to get 2d context from canvas";pe.canvas.width=O,pe.canvas.height=I,pe.drawImage(m,0,0,C,A,H.x,H.y,H.width,H.height)}var te=Ct.FILE_SCAN_HIDDEN_CANVAS_PADDING,Le=Math.max(m.width,H.width),Ce=Math.max(m.height,H.height),ce=Le+2*te,K=Ce+2*te,de=d.createCanvasElement(ce,K);_.appendChild(de);var gt=de.getContext("2d");if(!gt)throw"Unable to get 2d context from canvas";gt.canvas.width=ce,gt.canvas.height=K,gt.drawImage(m,0,0,C,A,te,te,Le,Ce);try{d.qrcode.decodeRobustlyAsync(de).then(function(be){u(ja.createFromQrcodeResult(be))}).catch(g)}catch(be){g("QR code parse error, error = ".concat(be))}},m.onerror=g,m.onabort=g,m.onstalled=g,m.onsuspend=g,m.src=URL.createObjectURL(a)})},o.prototype.clear=function(){this.clearElement()},o.getCameras=function(){return Oh.retrieve()},o.prototype.getRunningTrackCapabilities=function(){return this.getRenderedCameraOrFail().getRunningTrackCapabilities()},o.prototype.getRunningTrackSettings=function(){return this.getRenderedCameraOrFail().getRunningTrackSettings()},o.prototype.getRunningTrackCameraCapabilities=function(){return this.getRenderedCameraOrFail().getCapabilities()},o.prototype.applyVideoConstraints=function(a){if(a){if(!Vo.isMediaStreamConstraintsValid(a,this.logger))throw"invalid videoConstaints passed, check logs for more details"}else throw"videoConstaints is required argument.";return this.getRenderedCameraOrFail().applyVideoConstraints(a)},o.prototype.getRenderedCameraOrFail=function(){if(this.renderedCamera==null)throw"Scanning is not in running state, call this API only when QR code scanning using camera is in running state.";return this.renderedCamera},o.prototype.getSupportedFormats=function(a){var n=[W.QR_CODE,W.AZTEC,W.CODABAR,W.CODE_39,W.CODE_93,W.CODE_128,W.DATA_MATRIX,W.MAXICODE,W.ITF,W.EAN_13,W.EAN_8,W.PDF_417,W.RSS_14,W.RSS_EXPANDED,W.UPC_A,W.UPC_E,W.UPC_EAN_EXTENSION];if(!a||typeof a=="boolean"||!a.formatsToSupport)return n;if(!Array.isArray(a.formatsToSupport))throw"configOrVerbosityFlag.formatsToSupport should be undefined or an array.";if(a.formatsToSupport.length===0)throw"Atleast 1 formatsToSupport is needed.";for(var d=[],u=0,g=a.formatsToSupport;u<g.length;u++){var m=g[u];ph(m)?d.push(m):this.logger.warn("Invalid format: ".concat(m," passed in config, ignoring."))}if(d.length===0)throw"None of formatsToSupport match supported values.";return d},o.prototype.getUseBarCodeDetectorIfSupported=function(a){if(qt(a))return!0;if(!qt(a.useBarCodeDetectorIfSupported))return a.useBarCodeDetectorIfSupported!==!1;if(qt(a.experimentalFeatures))return!0;var n=a.experimentalFeatures;return qt(n.useBarCodeDetectorIfSupported)?!0:n.useBarCodeDetectorIfSupported!==!1},o.prototype.validateQrboxSize=function(a,n,d){var u=this,g=d.qrbox;this.validateQrboxConfig(g);var m=this.toQrdimensions(a,n,g),C=function(_){if(_<Ct.MIN_QR_BOX_SIZE)throw"minimum size of 'config.qrbox' dimension value is"+" ".concat(Ct.MIN_QR_BOX_SIZE,"px.")},A=function(_){return _>a&&(u.logger.warn("`qrbox.width` or `qrbox` is larger than the width of the root element. The width will be truncated to the width of root element."),_=a),_};C(m.width),C(m.height),m.width=A(m.width)},o.prototype.validateQrboxConfig=function(a){if(typeof a!="number"&&typeof a!="function"&&(a.width===void 0||a.height===void 0))throw"Invalid instance of QrDimensions passed for 'config.qrbox'. Both 'width' and 'height' should be set."},o.prototype.toQrdimensions=function(a,n,d){if(typeof d=="number")return{width:d,height:d};if(typeof d=="function")try{return d(a,n)}catch(u){throw new Error("qrbox config was passed as a function but it failed with unknown error"+u)}return d},o.prototype.setupUi=function(a,n,d){d.isShadedBoxEnabled()&&this.validateQrboxSize(a,n,d);var u=qt(d.qrbox)?{width:a,height:n}:d.qrbox;this.validateQrboxConfig(u);var g=this.toQrdimensions(a,n,u);g.height>n&&this.logger.warn("[Html5Qrcode] config.qrbox has height that isgreater than the height of the video stream. Shading will be ignored");var m=d.isShadedBoxEnabled()&&g.height<=n,C={x:0,y:0,width:a,height:n},A=m?this.getShadedRegionBounds(a,n,g):C,_=this.createCanvasElement(A.width,A.height),O={willReadFrequently:!0},I=_.getContext("2d",O);I.canvas.width=A.width,I.canvas.height=A.height,this.element.append(_),m&&this.possiblyInsertShadingElement(this.element,a,n,g),this.createScannerPausedUiElement(this.element),this.qrRegion=A,this.context=I,this.canvasElement=_},o.prototype.createScannerPausedUiElement=function(a){var n=document.createElement("div");n.innerText=tr.scannerPaused(),n.style.display="none",n.style.position="absolute",n.style.top="0px",n.style.zIndex="1",n.style.background="rgba(9, 9, 9, 0.46)",n.style.color="#FFECEC",n.style.textAlign="center",n.style.width="100%",a.appendChild(n),this.scannerPausedUiElement=n},o.prototype.scanContext=function(a,n){var d=this;return this.stateManagerProxy.isPaused()?Promise.resolve(!1):this.qrcode.decodeAsync(this.canvasElement).then(function(u){return a(u.text,ja.createFromQrcodeResult(u)),d.possiblyUpdateShaders(!0),!0}).catch(function(u){d.possiblyUpdateShaders(!1);var g=tr.codeParseError(u);return n(g,xh.createFrom(g)),!1})},o.prototype.foreverScan=function(a,n,d){var u=this;if(this.shouldScan&&this.renderedCamera){var g=this.renderedCamera.getSurface(),m=g.videoWidth/g.clientWidth,C=g.videoHeight/g.clientHeight;if(!this.qrRegion)throw"qrRegion undefined when localMediaStream is ready.";var A=this.qrRegion.width*m,_=this.qrRegion.height*C,O=this.qrRegion.x*m,I=this.qrRegion.y*C;this.context.drawImage(g,O,I,A,_,0,0,this.qrRegion.width,this.qrRegion.height);var H=function(){u.foreverScanTimeout=setTimeout(function(){u.foreverScan(a,n,d)},u.getTimeoutFps(a.fps))};this.scanContext(n,d).then(function(X){!X&&a.disableFlip!==!0?(u.context.translate(u.context.canvas.width,0),u.context.scale(-1,1),u.scanContext(n,d).finally(function(){H()})):H()}).catch(function(X){u.logger.logError("Error happend while scanning context",X),H()})}},o.prototype.createVideoConstraints=function(a){if(typeof a=="string")return{deviceId:{exact:a}};if(typeof a=="object"){var n="facingMode",d="deviceId",u={user:!0,environment:!0},g="exact",m=function(pe){if(pe in u)return!0;throw"config has invalid 'facingMode' value = "+"'".concat(pe,"'")},C=Object.keys(a);if(C.length!==1)throw"'cameraIdOrConfig' object should have exactly 1 key,"+" if passed as an object, found ".concat(C.length," keys");var A=Object.keys(a)[0];if(A!==n&&A!==d)throw"Only '".concat(n,"' and '").concat(d,"' ")+" are supported for 'cameraIdOrConfig'";if(A===n){var _=a.facingMode;if(typeof _=="string"){if(m(_))return{facingMode:_}}else if(typeof _=="object")if(g in _){if(m(_["".concat(g)]))return{facingMode:{exact:_["".concat(g)]}}}else throw"'facingMode' should be string or object with"+" ".concat(g," as key.");else{var O=typeof _;throw"Invalid type of 'facingMode' = ".concat(O)}}else{var I=a.deviceId;if(typeof I=="string")return{deviceId:I};if(typeof I=="object"){if(g in I)return{deviceId:{exact:I["".concat(g)]}};throw"'deviceId' should be string or object with"+" ".concat(g," as key.")}else{var H=typeof I;throw"Invalid type of 'deviceId' = ".concat(H)}}}var X=typeof a;throw"Invalid type of 'cameraIdOrConfig' = ".concat(X)},o.prototype.computeCanvasDrawConfig=function(a,n,d,u){if(a<=d&&n<=u){var g=(d-a)/2,m=(u-n)/2;return{x:g,y:m,width:a,height:n}}else{var C=a,A=n;return a>d&&(n=d/a*n,a=d),n>u&&(a=u/n*a,n=u),this.logger.log("Image downsampled from "+"".concat(C,"X").concat(A)+" to ".concat(a,"X").concat(n,".")),this.computeCanvasDrawConfig(a,n,d,u)}},o.prototype.clearElement=function(){if(this.stateManagerProxy.isScanning())throw"Cannot clear while scan is ongoing, close it first.";var a=document.getElementById(this.elementId);a&&(a.innerHTML="")},o.prototype.possiblyUpdateShaders=function(a){this.qrMatch!==a&&(this.hasBorderShaders&&this.borderShaders&&this.borderShaders.length&&this.borderShaders.forEach(function(n){n.style.backgroundColor=a?Ct.BORDER_SHADER_MATCH_COLOR:Ct.BORDER_SHADER_DEFAULT_COLOR}),this.qrMatch=a)},o.prototype.possiblyCloseLastScanImageFile=function(){this.lastScanImageFile&&(URL.revokeObjectURL(this.lastScanImageFile),this.lastScanImageFile=null)},o.prototype.createCanvasElement=function(a,n,d){var u=a,g=n,m=document.createElement("canvas");return m.style.width="".concat(u,"px"),m.style.height="".concat(g,"px"),m.style.display="none",m.id=qt(d)?"qr-canvas":d,m},o.prototype.getShadedRegionBounds=function(a,n,d){if(d.width>a||d.height>n)throw"'config.qrbox' dimensions should not be greater than the dimensions of the root HTML element.";return{x:(a-d.width)/2,y:(n-d.height)/2,width:d.width,height:d.height}},o.prototype.possiblyInsertShadingElement=function(a,n,d,u){if(!(n-u.width<1||d-u.height<1)){var g=document.createElement("div");g.style.position="absolute";var m=(n-u.width)/2,C=(d-u.height)/2;if(g.style.borderLeft="".concat(m,"px solid rgba(0, 0, 0, 0.48)"),g.style.borderRight="".concat(m,"px solid rgba(0, 0, 0, 0.48)"),g.style.borderTop="".concat(C,"px solid rgba(0, 0, 0, 0.48)"),g.style.borderBottom="".concat(C,"px solid rgba(0, 0, 0, 0.48)"),g.style.boxSizing="border-box",g.style.top="0px",g.style.bottom="0px",g.style.left="0px",g.style.right="0px",g.id="".concat(Ct.SHADED_REGION_ELEMENT_ID),n-u.width<11||d-u.height<11)this.hasBorderShaders=!1;else{var A=5,_=40;this.insertShaderBorders(g,_,A,-A,null,0,!0),this.insertShaderBorders(g,_,A,-A,null,0,!1),this.insertShaderBorders(g,_,A,null,-A,0,!0),this.insertShaderBorders(g,_,A,null,-A,0,!1),this.insertShaderBorders(g,A,_+A,-A,null,-A,!0),this.insertShaderBorders(g,A,_+A,null,-A,-A,!0),this.insertShaderBorders(g,A,_+A,-A,null,-A,!1),this.insertShaderBorders(g,A,_+A,null,-A,-A,!1),this.hasBorderShaders=!0}a.append(g)}},o.prototype.insertShaderBorders=function(a,n,d,u,g,m,C){var A=document.createElement("div");A.style.position="absolute",A.style.backgroundColor=Ct.BORDER_SHADER_DEFAULT_COLOR,A.style.width="".concat(n,"px"),A.style.height="".concat(d,"px"),u!==null&&(A.style.top="".concat(u,"px")),g!==null&&(A.style.bottom="".concat(g,"px")),C?A.style.left="".concat(m,"px"):A.style.right="".concat(m,"px"),this.borderShaders||(this.borderShaders=[]),this.borderShaders.push(A),a.appendChild(A)},o.prototype.showPausedState=function(){if(!this.scannerPausedUiElement)throw"[internal error] scanner paused UI element not found";this.scannerPausedUiElement.style.display="block"},o.prototype.hidePausedState=function(){if(!this.scannerPausedUiElement)throw"[internal error] scanner paused UI element not found";this.scannerPausedUiElement.style.display="none"},o.prototype.getTimeoutFps=function(a){return 1e3/a},o}(),eo;(function(o){o[o.STATUS_DEFAULT=0]="STATUS_DEFAULT",o[o.STATUS_SUCCESS=1]="STATUS_SUCCESS",o[o.STATUS_WARNING=2]="STATUS_WARNING",o[o.STATUS_REQUESTING_PERMISSION=3]="STATUS_REQUESTING_PERMISSION"})(eo||(eo={}));var Uh=Object.defineProperty,$h=Object.getOwnPropertyDescriptor,ii=(o,a,n,d)=>{for(var u=d>1?void 0:d?$h(a,n):a,g=o.length-1,m;g>=0;g--)(m=o[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&Uh(a,n,u),u};let Pt=class extends Te{constructor(){super(...arguments),this.isLoading=!1,this.isScanningQR=!1,this._stream=null,this._isTorchOn=!1,this._hasTorch=!1,this._facingMode="environment",this._qrScanner=null}firstUpdated(){this.startCamera()}disconnectedCallback(){this.stopCamera(),super.disconnectedCallback()}async startCamera(){this._isTorchOn=!1,this._hasTorch=!1,this.isScanningQR=!1,this._stream&&(this._stream.getTracks().forEach(o=>o.stop()),this._stream=null,this._video&&(this._video.srcObject=null));try{const o=this._facingMode==="environment"?{facingMode:{exact:"environment"}}:{facingMode:"user"};this._stream=await navigator.mediaDevices.getUserMedia({video:o}),this._video&&(this._video.srcObject=this._stream),this._checkTorchCapabilities()}catch{try{this._stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:this._facingMode}}),this._video&&(this._video.srcObject=this._stream),this._checkTorchCapabilities()}catch{alert("Kamera konnte nicht gestartet werden. Bitte Berechtigungen prüfen.")}}}_checkTorchCapabilities(){var n;if(!this._stream){this._hasTorch=!1;return}const o=this._stream.getVideoTracks()[0];if(!o){this._hasTorch=!1;return}const a=((n=o.getCapabilities)==null?void 0:n.call(o))||{};this._hasTorch=!!a.torch}async switchCamera(){this._facingMode=this._facingMode==="environment"?"user":"environment",this.isScanningQR?(await this.stopQRScanner(),setTimeout(()=>{this.startQRScanner()},300)):await this.startCamera()}stopCamera(){this.stopQRScanner(),this._isTorchOn=!1,this._hasTorch=!1,this._stream&&(this._stream.getTracks().forEach(o=>o.stop()),this._stream=null),this._video&&(this._video.srcObject=null),this.dispatchEvent(new CustomEvent("camera-stopped"))}async toggleTorch(){var n;if(!this._stream)return;const o=this._stream.getVideoTracks()[0];if(!o)return;if((((n=o.getCapabilities)==null?void 0:n.call(o))||{}).torch)try{this._isTorchOn=!this._isTorchOn,await o.applyConstraints({advanced:[{torch:this._isTorchOn}]})}catch(d){console.error("Taschenlampe konnte nicht gesteuert werden",d)}else alert("Taschenlampe wird von dieser Kamera nicht unterstützt.")}async startQRScanner(){this.stopCamera(),this.isScanningQR=!0,await this.updateComplete;const o=document.getElementById.bind(document);document.getElementById=a=>{var n;return a==="qr-reader"?(n=this.shadowRoot)==null?void 0:n.getElementById("qr-reader"):o(a)};try{this._qrScanner=new Fh("qr-reader");const a={fps:10,qrbox:{width:250,height:250}},n=this._facingMode==="environment"?{facingMode:{exact:"environment"}}:{facingMode:"user"};try{await this._qrScanner.start(n,a,d=>{this._handleQRSuccess(d)},()=>{})}catch{await this._qrScanner.start({facingMode:this._facingMode},a,u=>{this._handleQRSuccess(u)},()=>{})}}catch{alert("QR-Scanner konnte nicht gestartet werden. Berechtigungen prüfen."),this.stopQRScanner()}finally{document.getElementById=o}}_handleQRSuccess(o){this.stopQRScanner(),this.dispatchEvent(new CustomEvent("qr-detected",{detail:{text:o}}))}async stopQRScanner(){if(this._qrScanner&&this._qrScanner.isScanning){try{await this._qrScanner.stop()}catch(o){console.warn("Fehler beim Stoppen des Scanners",o)}this._qrScanner.clear()}this.isScanningQR=!1,this._qrScanner=null}captureImage(){var a;let o=null;if(this.isScanningQR&&this._qrScanner){alert("Foto-Aufnahme während QR-Scan nicht möglich. Beende den QR-Scan zuerst.");return}else if(this._video&&this._uiCanvas){if(!this._video.videoWidth||!this._video.videoHeight){alert("Kamera-Stream ist nicht bereit. Bitte warten Sie kurz.");return}const n=800;let d=this._video.videoWidth,u=this._video.videoHeight;d>n&&(u=Math.floor(u*(n/d)),d=n),this._uiCanvas.width=d,this._uiCanvas.height=u,(a=this._uiCanvas.getContext("2d"))==null||a.drawImage(this._video,0,0,d,u),o=this._uiCanvas.toDataURL("image/jpeg",.7)}o&&(this.stopCamera(),this.dispatchEvent(new CustomEvent("photo-captured",{detail:{image:o}})))}captureAndScanTypePlate(){var a;if(!this._video||!this._uiCanvas)return;this._uiCanvas.width=this._video.videoWidth,this._uiCanvas.height=this._video.videoHeight,(a=this._uiCanvas.getContext("2d"))==null||a.drawImage(this._video,0,0);const o=this._uiCanvas.toDataURL("image/jpeg",.8);this.stopCamera(),this.dispatchEvent(new CustomEvent("ocr-scan-requested",{detail:{image:o}}))}render(){return M`
      <div class="media-box">
        ${this.isScanningQR?M`
              <div id="qr-reader" style="width: 100%; height: 100%; overflow: hidden;"></div>
              <div class="camera-hint">🔳 <strong>QR-Scan aktiv</strong>: Zentriere den Code im Rahmen</div>
            `:M`
              <video autoplay playsinline ?hidden="${!this._stream}"></video>
              <canvas id="ui-canvas" class="d-none"></canvas>
              ${this._stream?M`<div class="scanner-overlay"><div class="scanner-laser"></div></div>`:M`
                    <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center; justify-content: center; height: 100%;">
                      <vaadin-button theme="primary" @click="${this.startCamera}">📸 Kamera aktivieren</vaadin-button>
                      <vaadin-button theme="secondary" @click="${this.startQRScanner}">🔳 QR / Barcode scannen</vaadin-button>
                    </div>
                  `}
            `}
      </div>

      <div class="action-bar">
        ${this.isScanningQR?M`
              <vaadin-button theme="primary error" @click="${this.stopQRScanner}">🚫 Aus</vaadin-button>
              <vaadin-button theme="secondary" @click="${this.switchCamera}">🔄 Wechseln</vaadin-button>
            `:this._stream?M`
                <vaadin-button theme="tertiary error" @click="${this.stopCamera}">🚫 Aus</vaadin-button>
                <vaadin-button theme="secondary" @click="${this.switchCamera}">🔄 Wechseln</vaadin-button>
                ${this._hasTorch?M`<vaadin-button theme="secondary" @click="${this.toggleTorch}">🔦 ${this._isTorchOn?"Aus":"Ein"}</vaadin-button>`:""}
                <vaadin-button theme="primary error" @click="${this.captureImage}">📸 Foto</vaadin-button>
                <vaadin-button theme="primary success" @click="${this.captureAndScanTypePlate}">🔍 OCR Scan</vaadin-button>
              `:""}
      </div>
    `}};Pt.styles=Ge`
    :host {
      display: block;
      width: 100%;
    }
    .media-box {
      width: 100%;
      aspect-ratio: 4 / 3;
      background: #090d16;
      border-radius: var(--radius-m, 16px);
      overflow: hidden;
      position: relative;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border, #64748b);
      max-width: 100%;
    }
    video, img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .camera-hint {
      position: absolute;
      bottom: 8px; left: 8px; right: 8px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #f8fafc;
      padding: 8px 12px;
      border-radius: var(--radius-s, 8px);
      text-align: center;
      font-size: 0.8rem;
      pointer-events: none;
      z-index: 10;
      box-shadow: var(--shadow-md);
    }
    .action-bar {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: stretch;
      margin-top: 1rem;
    }
    .action-bar vaadin-button {
      flex: 1 1 calc(33% - 4px);
      min-width: 0;
      font-size: 0.8rem;
    }
    .scanner-overlay {
      position: absolute; top: 12.5%; left: 12.5%; right: 12.5%; bottom: 12.5%;
      border: 2px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 0 0 2000px rgba(9, 13, 22, 0.65);
      pointer-events: none;
      z-index: 5;
      border-radius: 4px;
    }
    .scanner-laser {
      position: absolute; width: 100%; height: 2px;
      background: var(--primary, #38bdf8); box-shadow: 0 0 12px var(--primary, #38bdf8);
      top: 0; animation: scan 2.5s ease-in-out infinite alternate;
    }
    .d-none {
      display: none !important;
    }
    @keyframes scan {
      0% { top: 0%; }
      100% { top: 100%; }
    }
  `;ii([Je({type:Boolean})],Pt.prototype,"isLoading",2);ii([Je({type:Boolean})],Pt.prototype,"isScanningQR",2);ii([F()],Pt.prototype,"_stream",2);ii([F()],Pt.prototype,"_isTorchOn",2);ii([F()],Pt.prototype,"_hasTorch",2);ii([F()],Pt.prototype,"_facingMode",2);ii([$r("video")],Pt.prototype,"_video",2);ii([$r("#ui-canvas")],Pt.prototype,"_uiCanvas",2);Pt=ii([st("ec-camera-capture")],Pt);/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class zh extends An{constructor(a,n,d={}){const{uniqueIdPrefix:u}=d;super(a,"input","input",{initializer:(g,m)=>{m.value&&(g.value=m.value),m.type&&g.setAttribute("type",m.type),g.id=this.defaultId,typeof n=="function"&&n(g)},useUniqueId:!0,uniqueIdPrefix:u})}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Vh=o=>class extends Lo(o){static get properties(){return{maxlength:{type:Number},minlength:{type:Number},pattern:{type:String}}}static get delegateAttrs(){return[...super.delegateAttrs,"maxlength","minlength","pattern"]}static get constraints(){return[...super.constraints,"maxlength","minlength","pattern"]}constructor(){super(),this._setType("text")}get clearElement(){return this.$.clearButton}ready(){super.ready(),this.addController(new zh(this,n=>{this._setInputElement(n),this._setFocusElement(n),this.stateTarget=n,this.ariaTarget=n})),this.addController(new Fo(this.inputElement,this._labelController))}};/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Hh extends Vh(ur(zr(dr(hr(Te))))){static get is(){return"vaadin-text-field"}static get styles(){return[Oo]}render(){return M`
      <div class="vaadin-field-container">
        <div part="label">
          <slot name="label"></slot>
          <span part="required-indicator" aria-hidden="true" @click="${this.focus}"></span>
        </div>

        <vaadin-input-container
          part="input-field"
          .readonly="${this.readonly}"
          .disabled="${this.disabled}"
          .invalid="${this.invalid}"
          theme="${Ro(this._theme)}"
        >
          <slot name="prefix" slot="prefix"></slot>
          <slot name="input"></slot>
          ${this._renderSuffix()}
        </vaadin-input-container>

        <div part="helper-text">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
        <slot name="tooltip"></slot>
      </div>
    `}ready(){super.ready(),this._tooltipController=new Rs(this),this._tooltipController.setPosition("top"),this._tooltipController.setAriaTarget(this.inputElement),this.addController(this._tooltipController)}_renderSuffix(){return M`
      <slot name="suffix" slot="suffix"></slot>
      <div id="clearButton" part="field-button clear-button" slot="suffix" aria-hidden="true"></div>
    `}}cr(Hh);var Gh=Object.defineProperty,Wh=Object.getOwnPropertyDescriptor,Go=(o,a,n,d)=>{for(var u=d>1?void 0:d?Wh(a,n):a,g=o.length-1,m;g>=0;g--)(m=o[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&Gh(a,n,u),u};let xn=class extends Te{constructor(){super(...arguments),this._ctx=null,this._isDrawing=!1,this._lastX=0,this._lastY=0,this._hasSigned=!1}firstUpdated(){this._initCanvas()}_initCanvas(){const o=this._canvas.getBoundingClientRect();this._canvas.width=o.width||400,this._canvas.height=o.height||150,this._ctx=this._canvas.getContext("2d"),this._ctx&&(this._ctx.strokeStyle="#000000",this._ctx.lineWidth=3,this._ctx.lineCap="round",this._ctx.lineJoin="round")}_handlePointerDown(o){this._isDrawing=!0;const a=this._canvas.getBoundingClientRect(),n=this._canvas.width/a.width,d=this._canvas.height/a.height;this._lastX=(o.clientX-a.left)*n,this._lastY=(o.clientY-a.top)*d,this._hasSigned=!0,this.requestUpdate(),this._notifyChange()}_handlePointerMove(o){if(!this._isDrawing||!this._ctx)return;const a=this._canvas.getBoundingClientRect(),n=this._canvas.width/a.width,d=this._canvas.height/a.height,u=(o.clientX-a.left)*n,g=(o.clientY-a.top)*d;this._ctx.beginPath(),this._ctx.moveTo(this._lastX,this._lastY),this._ctx.lineTo(u,g),this._ctx.stroke(),this._lastX=u,this._lastY=g}_handlePointerUp(){this._isDrawing=!1}clear(){this._ctx&&(this._ctx.clearRect(0,0,this._canvas.width,this._canvas.height),this._hasSigned=!1,this.requestUpdate(),this._notifyChange())}getSignatureDataUrl(){return this._hasSigned?this._canvas.toDataURL("image/png"):null}_notifyChange(){this.dispatchEvent(new CustomEvent("signature-changed",{detail:{hasSigned:this._hasSigned,dataUrl:this.getSignatureDataUrl()}}))}render(){return M`
      <div class="signature-container">
        <div class="canvas-wrapper">
          ${this._hasSigned?"":M`<div class="canvas-placeholder">Hier unterschreiben</div>`}
          <canvas
            @pointerdown="${this._handlePointerDown}"
            @pointermove="${this._handlePointerMove}"
            @pointerup="${this._handlePointerUp}"
            @pointerleave="${this._handlePointerUp}"
          ></canvas>
        </div>
        <div class="controls">
          <vaadin-button theme="tertiary" @click="${this.clear}">Löschen</vaadin-button>
        </div>
      </div>
    `}};xn.styles=Ge`
    :host {
      display: block;
      width: 100%;
    }
    .signature-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .canvas-wrapper {
      width: 100%;
      height: 150px;
      border: 2px dashed var(--border, #64748b);
      border-radius: var(--radius-s, 8px);
      background: #ffffff;
      overflow: hidden;
      position: relative;
    }
    canvas {
      width: 100%;
      height: 100%;
      cursor: crosshair;
      touch-action: none; /* Verhindert Scrollen beim Zeichnen auf Mobilgeräten */
    }
    .canvas-placeholder {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 0.8rem;
      color: #94a3b8;
      pointer-events: none;
      user-select: none;
    }
    .controls {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    
    /* Dyslexie (LRS) Lese-Hilfe Support */
    :host-context(.accessible-reading) p,
    :host-context(.accessible-reading) span,
    :host-context(.accessible-reading) div,
    :host-context(.accessible-reading) label,
    :host-context(.accessible-reading) vaadin-button {
      word-spacing: 0.15em !important;
      letter-spacing: 0.05em !important;
      line-height: 1.75 !important;
    }
  `;Go([$r("canvas")],xn.prototype,"_canvas",2);xn=Go([st("ec-signature-pad")],xn);var Xh=Object.defineProperty,jh=Object.getOwnPropertyDescriptor,fr=(o,a,n,d)=>{for(var u=d>1?void 0:d?jh(a,n):a,g=o.length-1,m;g>=0;g--)(m=o[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&Xh(a,n,u),u};let wi=class extends Te{constructor(){super(...arguments),this.rPe="",this.rIso="",this.iLeak="",this.isScanning=!1,this._signatureUrl=null}_getDguvStatus(){const o=[];let a=!0;if(this.rPe.trim()){const d=parseFloat(this.rPe.replace(",","."));isNaN(d)?(o.push("R_PE: Ungültiger Wert"),a=!1):d>.3?(o.push(`R_PE: ${d} Ω (> 0.3 Ω Grenzwert) ❌`),a=!1):o.push(`R_PE: ${d} Ω (≤ 0.3 Ω) ✅`)}if(this.rIso.trim()){const d=parseFloat(this.rIso.replace(",","."));isNaN(d)?(o.push("R_ISO: Ungültiger Wert"),a=!1):d<1?(o.push(`R_ISO: ${d} MΩ (< 1.0 MΩ Grenzwert) ❌`),a=!1):o.push(`R_ISO: ${d} MΩ (≥ 1.0 MΩ) ✅`)}if(this.iLeak.trim()){const d=parseFloat(this.iLeak.replace(",","."));isNaN(d)?(o.push("I_leak: Ungültiger Wert"),a=!1):d>3.5?(o.push(`Ableitstrom: ${d} mA (> 3.5 mA Grenzwert) ❌`),a=!1):o.push(`Ableitstrom: ${d} mA (≤ 3.5 mA) ✅`)}return this.rPe.trim()||this.rIso.trim()||this.iLeak.trim()?{passed:a,message:a?"BESTANDEN":"NICHT BESTANDEN",details:o}:{passed:!0,message:"Keine Messdaten",details:[]}}_handleValueChange(o,a){o==="rPe"&&(this.rPe=a),o==="rIso"&&(this.rIso=a),o==="iLeak"&&(this.iLeak=a),this._notifyChange()}_handleSignatureChanged(o){this._signatureUrl=o.detail.dataUrl,this._notifyChange()}_requestMultimeterScan(){this.dispatchEvent(new CustomEvent("scan-multimeter-requested"))}_notifyChange(){const o=this._getDguvStatus();this.dispatchEvent(new CustomEvent("dguv-changed",{detail:{rPe:this.rPe,rIso:this.rIso,iLeak:this.iLeak,signatureUrl:this._signatureUrl,passed:o.passed,status:o.message,details:o.details}}))}render(){const o=this._getDguvStatus(),a=this.rPe.trim()||this.rIso.trim()||this.iLeak.trim();return M`
      <div class="dguv-container">
        <div class="header-row">
          <h4>📋 DGUV V3 / VDE 0701-0702 Prüfassistent</h4>
          <vaadin-button
            theme="secondary success"
            @click="${this._requestMultimeterScan}"
            ?disabled="${this.isScanning}"
            style="min-height: auto; height: 30px; font-size: 0.8rem;"
          >
            ${this.isScanning?"⏳ Scannen...":"📸 Messwert-Scan"}
          </vaadin-button>
        </div>
        <p class="subtitle">Sicherheitsmesswerte (ortsveränderliche Geräte):</p>

        <div class="grid-inputs">
          <vaadin-text-field
            label="R_PE (Ω)"
            placeholder="≤ 0.3"
            .value="${this.rPe}"
            @value-changed="${n=>this._handleValueChange("rPe",n.detail.value)}"
          ></vaadin-text-field>
          <vaadin-text-field
            label="R_ISO (MΩ)"
            placeholder="≥ 1.0"
            .value="${this.rIso}"
            @value-changed="${n=>this._handleValueChange("rIso",n.detail.value)}"
          ></vaadin-text-field>
          <vaadin-text-field
            label="Ableitstrom (mA)"
            placeholder="≤ 3.5"
            .value="${this.iLeak}"
            @value-changed="${n=>this._handleValueChange("iLeak",n.detail.value)}"
          ></vaadin-text-field>
        </div>

        ${a?M`
              <div class="result-badge ${o.passed?"passed":"failed"}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="font-size: 0.9rem;">Gesamturteil:</strong>
                  <span
                    style="font-weight: 800; font-size: 1rem; color: ${o.passed?"var(--success, #0b8a5a)":"var(--danger, #dc2626)"};"
                  >
                    ${o.message}
                  </span>
                </div>
                <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 0.85rem; color: var(--text-secondary);">
                  ${o.details.map(n=>M`<li>${n}</li>`)}
                </ul>
              </div>
            `:M`
              <div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center;">
                Keine Messdaten eingetragen (optional)
              </div>
            `}

        <div class="signature-section">
          <div class="signature-title">✍️ Digitale Unterschrift der Prüffachkraft</div>
          <ec-signature-pad @signature-changed="${this._handleSignatureChanged}"></ec-signature-pad>
        </div>
      </div>
    `}};wi.styles=Ge`
    :host {
      display: block;
      width: 100%;
    }
    .dguv-container {
      margin: 1.5rem 0;
      padding: 1.25rem;
      background: var(--bg-app, #f1f5f9);
      border-radius: var(--radius-s, 8px);
      border: 1px solid var(--border, #64748b);
      text-align: left;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 0.75rem;
    }
    h4 {
      margin: 0;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .subtitle {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0 0 1rem 0;
    }
    .grid-inputs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 8px;
      margin-bottom: 1rem;
    }
    .result-badge {
      padding: 10px;
      border-radius: 6px;
      border: 1px solid var(--border);
      margin-top: 10px;
    }
    .passed {
      background: var(--success-glow, rgba(11, 138, 90, 0.15));
      border: 1.5px solid var(--success, #0b8a5a);
    }
    .failed {
      background: var(--danger-glow, rgba(220, 38, 38, 0.15));
      border: 3.5px dashed var(--danger, #dc2626);
    }
    .signature-section {
      margin-top: 1rem;
      border-top: 1px solid var(--border);
      padding-top: 1rem;
    }
    .signature-title {
      font-size: 0.85rem;
      font-weight: bold;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    /* Dyslexie (LRS) Lese-Hilfe Support */
    :host-context(.accessible-reading) p,
    :host-context(.accessible-reading) span,
    :host-context(.accessible-reading) div,
    :host-context(.accessible-reading) label,
    :host-context(.accessible-reading) input,
    :host-context(.accessible-reading) vaadin-text-field {
      word-spacing: 0.15em !important;
      letter-spacing: 0.05em !important;
      line-height: 1.75 !important;
    }
  `;fr([Je({type:String})],wi.prototype,"rPe",2);fr([Je({type:String})],wi.prototype,"rIso",2);fr([Je({type:String})],wi.prototype,"iLeak",2);fr([Je({type:Boolean})],wi.prototype,"isScanning",2);fr([F()],wi.prototype,"_signatureUrl",2);wi=fr([st("ec-dguv-form")],wi);var Kh=Object.defineProperty,Zh=Object.getOwnPropertyDescriptor,Wo=(o,a,n,d)=>{for(var u=d>1?void 0:d?Zh(a,n):a,g=o.length-1,m;g>=0;g--)(m=o[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&Kh(a,n,u),u};let bn=class extends Te{constructor(){super(...arguments),this.history=[],this._map=null}firstUpdated(){this.history&&this.history.length>0&&setTimeout(()=>{this._initMap()},150)}updated(o){super.updated(o),o.has("history")&&this.history&&this.history.length>0&&setTimeout(()=>{this._initMap()},150)}_initMap(){var a;const o=(a=this.shadowRoot)==null?void 0:a.getElementById("leaflet-map");if(!(!o||!window.L)){this._map&&(this._map.remove(),this._map=null);try{const n=window.L,d=n.map(o).setView([51.1657,10.4515],5);this._map=d,n.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(d);let u=!1,g=0,m=0,C=0;this.history.forEach(A=>{const _=A.location;if(!_)return;const O=_.match(/Lat:\s*([-\d.]+),\s*Lng:\s*([-\d.]+)/i);if(O){const I=parseFloat(O[1]),H=parseFloat(O[2]);if(!isNaN(I)&&!isNaN(H)){g+=I,m+=H,C++;const X=(A.safetyLevel||"SAFE").toUpperCase(),pe=X==="DANGER"?"#ef4444":X==="WARNING"?"#f59e0b":"#10b981",te=n.divIcon({className:"custom-map-marker",html:`<div style="background-color: ${pe}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.5);"></div>`,iconSize:[14,14],iconAnchor:[7,7]});n.marker([I,H],{icon:te}).addTo(d).bindPopup(`
                <div style="color: black; font-family: sans-serif; font-size: 0.8rem;">
                  <strong style="color: ${pe}; font-size: 0.85rem;">${A.deviceName||"Gerät"}</strong><br/>
                  <strong>Defekt:</strong> ${A.identifiedDefect||"Kein Defekt"}<br/>
                  <strong>Status:</strong> ${X}
                </div>
              `),u=!0}}}),u&&C>0&&d.setView([g/C,m/C],10)}catch(n){console.error("Fehler beim Initialisieren der Leaflet-Karte:",n)}}}render(){if(this.history.length===0)return M`
        <div class="card empty-dashboard">
          <h3 class="text-muted m-0">Keine Daten vorhanden</h3>
          <p>Starte deine erste Diagnose, um hier Statistiken zu sehen.</p>
        </div>
      `;const o=this.history.length,a=this.history.reduce((Ce,ce)=>{const K=(ce.safetyLevel||"SAFE").toUpperCase();return K==="DANGER"?Ce.danger++:K==="WARNING"?Ce.warning++:Ce.safe++,Ce},{safe:0,warning:0,danger:0}),n=36,d=2*Math.PI*n,u=o>0?a.safe/o:0,g=o>0?a.warning/o:0,m=o>0?a.danger/o:0,C=d*u,A=d*g,_=d*m,O=0,I=-C,H=-(C+A),X=this.history.reduce((Ce,ce)=>{const K=ce.deviceName||"Unbekannt";return Ce[K]=(Ce[K]||0)+1,Ce},{}),pe=Object.entries(X).sort((Ce,ce)=>ce[1]-Ce[1]).slice(0,4),te=Math.max(...pe.map(([,Ce])=>Ce),1),Le=(this.history.reduce((Ce,ce)=>Ce+(ce.repairDifficulty||1),0)/o).toFixed(1);return M`
      <div class="card result-card">
        <h3 class="m-0 dashboard-title">📊 Management Dashboard</h3>
        
        <div class="dashboard-stats" style="margin-top: 1rem;">
          <div class="stat-card">
            <div class="stat-value-primary">${o}</div>
            <div class="stat-label">Gesamt-Tickets</div>
          </div>
          <div class="stat-card">
            <div class="stat-value-warning">${Le} / 5</div>
            <div class="stat-label">Ø Schwierigkeit</div>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Safety Levels Donut Chart -->
          <div class="chart-card">
            <h4 class="chart-title">🛡️ Sicherheitsstufen</h4>
            
            <div class="donut-container">
              <svg class="donut-svg" viewBox="0 0 100 100">
                <circle class="donut-circle-bg" cx="50" cy="50" r="${n}"></circle>
                
                ${u>0?M`
                  <circle 
                    class="donut-circle-segment" 
                    cx="50" 
                    cy="50" 
                    r="${n}" 
                    stroke="var(--success, #10b981)" 
                    stroke-dasharray="${C} ${d-C}" 
                    stroke-dashoffset="${O}"
                  ></circle>
                `:""}

                ${g>0?M`
                  <circle 
                    class="donut-circle-segment" 
                    cx="50" 
                    cy="50" 
                    r="${n}" 
                    stroke="var(--warning, #f59e0b)" 
                    stroke-dasharray="${A} ${d-A}" 
                    stroke-dashoffset="${I}"
                  ></circle>
                `:""}

                ${m>0?M`
                  <circle 
                    class="donut-circle-segment" 
                    cx="50" 
                    cy="50" 
                    r="${n}" 
                    stroke="var(--danger, #ef4444)" 
                    stroke-dasharray="${_} ${d-_}" 
                    stroke-dashoffset="${H}"
                  ></circle>
                `:""}
              </svg>
              
              <div class="donut-label">
                <span class="donut-number">${o}</span>
                <span class="donut-unit">Prüfungen</span>
              </div>
            </div>

            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color-label">
                  <span class="legend-color-dot" style="background-color: var(--success, #10b981)"></span>
                  <span>Sicher (SAFE)</span>
                </div>
                <span class="legend-count">${a.safe} (${Math.round(u*100)}%)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color-label">
                  <span class="legend-color-dot" style="background-color: var(--warning, #f59e0b)"></span>
                  <span>Warnung (WARNING)</span>
                </div>
                <span class="legend-count">${a.warning} (${Math.round(g*100)}%)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color-label">
                  <span class="legend-color-dot" style="background-color: var(--danger, #ef4444)"></span>
                  <span>Gefahr (DANGER)</span>
                </div>
                <span class="legend-count">${a.danger} (${Math.round(m*100)}%)</span>
              </div>
            </div>
          </div>

          <!-- Top Devices Bar Chart -->
          <div class="chart-card">
            <h4 class="chart-title">📈 Top Geräte & Fehlerverteilung</h4>
            
            <svg class="bar-chart-svg" viewBox="0 0 200 160">
              <line class="grid-line" x1="40" y1="20" x2="200" y2="20"></line>
              <line class="grid-line" x1="40" y1="60" x2="200" y2="60"></line>
              <line class="grid-line" x1="40" y1="100" x2="200" y2="100"></line>
              <line class="grid-line" x1="40" y1="140" x2="200" y2="140"></line>

              ${pe.map(([Ce,ce],K)=>{const de=20+K*32,gt=Math.max(ce/te*120,5),be=Ce.length>8?Ce.slice(0,6)+"...":Ce;return M`
                  <g>
                    <text class="bar-label-text" x="5" y="${de+12}" text-anchor="start">${be}</text>
                    <rect 
                      class="bar-rect" 
                      x="40" 
                      y="${de+2}" 
                      width="${gt}" 
                      height="14" 
                      rx="3" 
                      fill="var(--primary, #3b82f6)"
                    ></rect>
                    <text class="bar-value-text" x="${40+gt+5}" y="${de+12}" text-anchor="start">${ce}x</text>
                  </g>
                `})}
              
              <line x1="40" y1="15" x2="40" y2="145" stroke="var(--border)" stroke-width="1"></line>
            </svg>
          </div>

          <!-- GPS Ticket-Landkarte -->
          <div class="chart-card" style="grid-column: span 1; width: 100%; min-height: 270px; justify-content: flex-start;">
            <h4 class="chart-title">📍 Ticket-Landkarte (GPS)</h4>
            <div id="leaflet-map" style="width: 100%; height: 200px; border-radius: var(--radius-s); border: 1px solid var(--border); z-index: 1;"></div>
          </div>
        </div>
      </div>
    `}};bn.styles=[ti(vi),Ge`
      .dashboard-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        margin-top: 1.25rem;
      }

      @media (min-width: 600px) {
        .dashboard-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      .chart-card {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--border);
        border-radius: var(--radius-m);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .chart-title {
        font-size: 0.95rem;
        font-weight: 700;
        margin: 0 0 1rem 0;
        align-self: flex-start;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .donut-container {
        position: relative;
        width: 140px;
        height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .donut-svg {
        transform: rotate(-90deg);
        width: 100%;
        height: 100%;
      }

      .donut-circle-bg {
        fill: none;
        stroke: var(--border);
        stroke-width: 8;
      }

      .donut-circle-segment {
        fill: none;
        stroke-width: 8;
        stroke-linecap: round;
        transition: stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease;
      }

      .donut-label {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }

      .donut-number {
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1;
      }

      .donut-unit {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-transform: uppercase;
        font-weight: 600;
        margin-top: 2px;
      }

      .chart-legend {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        margin-top: 1.25rem;
      }

      .legend-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85rem;
      }

      .legend-color-label {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .legend-color-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
      }

      .legend-count {
        font-weight: 700;
        color: var(--text-primary);
      }

      /* SVG Bar Chart */
      .bar-chart-svg {
        width: 100%;
        height: 160px;
        overflow: visible;
      }

      .bar-rect {
        transition: height 0.5s ease, y 0.5s ease, opacity 0.2s;
        cursor: pointer;
      }

      .bar-rect:hover {
        opacity: 0.85;
      }

      .bar-label-text {
        font-size: 10px;
        fill: var(--text-secondary);
        font-weight: 500;
      }

      .bar-value-text {
        font-size: 10px;
        fill: var(--text-primary);
        font-weight: 700;
      }

      .grid-line {
        stroke: var(--border);
        stroke-dasharray: 2 2;
        stroke-width: 0.5;
      }

      #leaflet-map {
        background: #090d16;
      }
    `];Wo([Je({type:Array})],bn.prototype,"history",2);bn=Wo([st("ec-dashboard")],bn);var Yh=Object.defineProperty,qh=Object.getOwnPropertyDescriptor,Hr=(o,a,n,d)=>{for(var u=d>1?void 0:d?qh(a,n):a,g=o.length-1,m;g>=0;g--)(m=o[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&Yh(a,n,u),u};let zi=class extends Te{constructor(){super(...arguments),this._datasheets=[],this._modelMatch="",this._selectedFile=null,this._isSaving=!1}connectedCallback(){super.connectedCallback(),this._loadDatasheets()}async _loadDatasheets(){try{this._datasheets=await $o()}catch(o){console.error("Fehler beim Laden der Offline-Datenblätter",o)}}_handleFileChange(o){const a=o.target;a.files&&a.files.length>0?this._selectedFile=a.files[0]:this._selectedFile=null}async _handleUpload(){var o;if(!this._modelMatch.trim()){alert("Bitte ein Gerätemodell eingeben.");return}if(!this._selectedFile){alert("Bitte ein PDF-Datenblatt auswählen.");return}this._isSaving=!0;try{const a=await this._fileToBase64(this._selectedFile),n={name:this._selectedFile.name,modelMatch:this._modelMatch.trim(),fileData:a};await uh(n),this._modelMatch="",this._selectedFile=null;const d=(o=this.shadowRoot)==null?void 0:o.querySelector('input[type="file"]');d&&(d.value=""),await this._loadDatasheets(),alert("Datenblatt erfolgreich offline gespeichert!")}catch(a){console.error(a),alert("Fehler beim Speichern des Datenblatts.")}finally{this._isSaving=!1}}_fileToBase64(o){return new Promise((a,n)=>{const d=new FileReader;d.readAsDataURL(o),d.onload=()=>a(d.result),d.onerror=u=>n(u)})}async _handleDelete(o){if(confirm("Dieses Offline-Datenblatt wirklich löschen?"))try{await fh(o),await this._loadDatasheets()}catch{alert("Fehler beim Löschen.")}}render(){return M`
      <div class="manager-card">
        <h4>📂 Offline-Datenblätter (PDF)</h4>
        <p>Lade Bedienungsanleitungen oder Datenblätter hoch, um sie bei der Arbeit offline parat zu haben.</p>

        <div class="upload-form">
          <vaadin-text-field
            label="Gerätemodell (z. B. Saeco Royal)"
            .value="${this._modelMatch}"
            @value-changed="${o=>this._modelMatch=o.detail.value}"
            style="width: 100%;"
          ></vaadin-text-field>

          <div class="file-input-wrapper">
            <input
              type="file"
              accept=".pdf"
              @change="${this._handleFileChange}"
            />
          </div>

          <vaadin-button
            theme="primary"
            ?disabled="${this._isSaving||!this._modelMatch.trim()||!this._selectedFile}"
            @click="${this._handleUpload}"
            style="margin-top: 4px;"
          >
            ${this._isSaving?"Speichert...":"Offline speichern"}
          </vaadin-button>
        </div>

        <div class="datasheet-list">
          ${this._datasheets.length===0?M`<div class="empty-text">Keine Datenblätter offline gespeichert.</div>`:this._datasheets.map(o=>M`
                <div class="datasheet-item">
                  <div class="datasheet-info">
                    <span class="datasheet-name" title="${o.name}">${o.name}</span>
                    <span class="datasheet-match">Modell-Match: <strong>${o.modelMatch}</strong></span>
                  </div>
                  <vaadin-button
                    theme="error tertiary"
                    @click="${()=>this._handleDelete(o.id)}"
                    style="min-height: auto; height: 32px;"
                  >
                    🗑️
                  </vaadin-button>
                </div>
              `)}
        </div>
      </div>
    `}};zi.styles=Ge`
    :host {
      display: block;
      width: 100%;
      text-align: left;
    }
    .manager-card {
      background: var(--bg-card, #ffffff);
      padding: 12px;
      border-radius: var(--radius-s, 8px);
      border: 1px solid var(--border, #64748b);
      margin-top: 10px;
    }
    h4 {
      margin: 0 0 8px 0;
      font-size: 0.95rem;
      color: var(--text-primary);
    }
    p {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin: 0 0 12px 0;
      line-height: 1.4;
    }
    .upload-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }
    .file-input-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
    }
    input[type="file"] {
      font-size: 0.8rem;
    }
    .datasheet-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 200px;
      overflow-y: auto;
    }
    .datasheet-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 8px;
      background: var(--bg-app);
      border: 1px solid var(--border);
      border-radius: var(--radius-s);
      font-size: 0.8rem;
    }
    .datasheet-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1;
    }
    .datasheet-name {
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .datasheet-match {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .empty-text {
      text-align: center;
      font-style: italic;
      color: var(--text-muted);
      font-size: 0.8rem;
      margin: 8px 0;
    }

    /* Dyslexie (LRS) Lese-Hilfe Support */
    :host-context(.accessible-reading) p,
    :host-context(.accessible-reading) span,
    :host-context(.accessible-reading) div,
    :host-context(.accessible-reading) label,
    :host-context(.accessible-reading) input,
    :host-context(.accessible-reading) vaadin-text-field,
    :host-context(.accessible-reading) vaadin-button {
      word-spacing: 0.15em !important;
      letter-spacing: 0.05em !important;
      line-height: 1.75 !important;
    }
  `;Hr([F()],zi.prototype,"_datasheets",2);Hr([F()],zi.prototype,"_modelMatch",2);Hr([F()],zi.prototype,"_selectedFile",2);Hr([F()],zi.prototype,"_isSaving",2);zi=Hr([st("ec-datasheet-manager")],zi);var Qh=Object.defineProperty,Jh=Object.getOwnPropertyDescriptor,vt=(o,a,n,d)=>{for(var u=d>1?void 0:d?Jh(a,n):a,g=o.length-1,m;g>=0;g--)(m=o[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&Qh(a,n,u),u};let lt=class extends Te{constructor(){super(...arguments),this.apiKey="",this.perplexityApiKey="",this.backendUrl="",this.accessibleMode=!1,this.inspectorName="",this.inspectorCompany="",this.inspectorId="",this._tempApiKey="",this._tempPerplexityApiKey="",this._tempBackendUrl="",this._tempInspectorName="",this._tempInspectorCompany="",this._tempInspectorId=""}connectedCallback(){super.connectedCallback(),this._tempApiKey=this.apiKey,this._tempPerplexityApiKey=this.perplexityApiKey,this._tempBackendUrl=this.backendUrl||"http://localhost:3000",this._tempInspectorName=this.inspectorName,this._tempInspectorCompany=this.inspectorCompany,this._tempInspectorId=this.inspectorId}render(){return M`
      <div class="modal-overlay settings-overlay">
        <div class="card settings-card">
          <h3 class="m-0">⚙️ Einstellungen</h3>
          
          <vaadin-text-area
            class="w-100 mt-1"
            label="Gemini API Key (Optional)"
            helper-text="Falls Sie Ihren eigenen API Key nutzen möchten"
            .value="${this._tempApiKey}"
            @value-changed="${o=>this._tempApiKey=o.detail.value}"
          ></vaadin-text-area>

          <vaadin-text-area
            class="w-100 mt-1"
            label="Perplexity API Key (Optional)"
            helper-text="Für Web-Recherchen zu VDE-Regeln und Reparaturen"
            .value="${this._tempPerplexityApiKey}"
            @value-changed="${o=>this._tempPerplexityApiKey=o.detail.value}"
          ></vaadin-text-area>

          <vaadin-text-field
            class="w-100 mt-1"
            label="Backend Server URL"
            helper-text="Für Smartphone z.B. http://192.168.x.x:3000"
            .value="${this._tempBackendUrl}"
            @value-changed="${o=>this._tempBackendUrl=o.detail.value}"
          ></vaadin-text-field>

          <h4 class="privacy-title mt-1" style="color: var(--primary); margin-bottom: 4px; font-size: 0.95rem; font-weight: bold;">👤 Prüferprofil</h4>
          <vaadin-text-field
            class="w-100 mt-1"
            label="Prüfer-Name"
            helper-text="Name des zuständigen Prüfers"
            .value="${this._tempInspectorName}"
            @value-changed="${o=>this._tempInspectorName=o.detail.value}"
          ></vaadin-text-field>

          <vaadin-text-field
            class="w-100 mt-1"
            label="Firma / Abteilung"
            helper-text="Name des Unternehmens oder der Abteilung"
            .value="${this._tempInspectorCompany}"
            @value-changed="${o=>this._tempInspectorCompany=o.detail.value}"
          ></vaadin-text-field>

          <vaadin-text-field
            class="w-100 mt-1"
            label="Zertifikatsnummer / Prüfer-ID"
            helper-text="Offizielle Zertifikats- oder Prüfernummer"
            .value="${this._tempInspectorId}"
            @value-changed="${o=>this._tempInspectorId=o.detail.value}"
          ></vaadin-text-field>

          <div class="privacy-danger-zone mt-1" style="border-color: rgba(2, 119, 189, 0.3); background: rgba(2, 119, 189, 0.05); text-align: left;">
            <h4 class="privacy-title" style="color: var(--primary);">♿ Barrierefreiheit</h4>
            <label class="consent-checkbox-label" style="display: flex; gap: 8px; margin: 8px 0 0 0; cursor: pointer; border: none; background: transparent; padding: 0;">
              <input 
                type="checkbox" 
                .checked="${this.accessibleMode}"
                @change="${this._toggleAccessibleMode}"
                style="margin-top: 4px;"
              />
              <span style="font-size: 0.85rem; line-height: 1.4;"><strong>Lese-Hilfe aktivieren</strong> (größere Wortabstände & Zeilenabstände für LRS-Unterstützung)</span>
            </label>
          </div>

          <ec-datasheet-manager class="mt-1"></ec-datasheet-manager>
          
          <div class="privacy-danger-zone mt-1">
            <h4 class="privacy-title">🔒 Datenschutz & Daten</h4>
            <p style="font-size: 0.8rem; margin: 0 0 10px 0;">Verwalten Sie Ihre lokalen Daten gemäß DSGVO.</p>
            <div style="display: flex; gap: 8px;">
              <vaadin-button theme="secondary" @click="${this._handleExport}" style="flex: 1;"
                >💾 Exportieren</vaadin-button
              >
              <vaadin-button theme="error" @click="${this._handleDelete}" style="flex: 1;"
                >🗑️ Löschen</vaadin-button
              >
            </div>
          </div>

          <div class="modal-actions">
            <vaadin-button
              @click="${this._handleClose}"
              >Schließen</vaadin-button
            >
            <vaadin-button theme="primary" @click="${this._handleSave}"
              >Speichern</vaadin-button
            >
          </div>
        </div>
      </div>
    `}_handleClose(){this.dispatchEvent(new CustomEvent("close"))}_handleSave(){this.dispatchEvent(new CustomEvent("save-settings",{detail:{apiKey:this._tempApiKey,perplexityApiKey:this._tempPerplexityApiKey,backendUrl:this._tempBackendUrl,inspectorName:this._tempInspectorName,inspectorCompany:this._tempInspectorCompany,inspectorId:this._tempInspectorId}}))}_toggleAccessibleMode(o){const a=o.target.checked;this.dispatchEvent(new CustomEvent("accessible-changed",{detail:{checked:a}}))}_handleExport(){this.dispatchEvent(new CustomEvent("export-data"))}_handleDelete(){this.dispatchEvent(new CustomEvent("delete-data"))}};lt.styles=ti(vi);vt([Je({type:String})],lt.prototype,"apiKey",2);vt([Je({type:String})],lt.prototype,"perplexityApiKey",2);vt([Je({type:String})],lt.prototype,"backendUrl",2);vt([Je({type:Boolean})],lt.prototype,"accessibleMode",2);vt([Je({type:String})],lt.prototype,"inspectorName",2);vt([Je({type:String})],lt.prototype,"inspectorCompany",2);vt([Je({type:String})],lt.prototype,"inspectorId",2);vt([F()],lt.prototype,"_tempApiKey",2);vt([F()],lt.prototype,"_tempPerplexityApiKey",2);vt([F()],lt.prototype,"_tempBackendUrl",2);vt([F()],lt.prototype,"_tempInspectorName",2);vt([F()],lt.prototype,"_tempInspectorCompany",2);vt([F()],lt.prototype,"_tempInspectorId",2);lt=vt([st("ec-settings")],lt);var eu=Object.defineProperty,tu=Object.getOwnPropertyDescriptor,Xo=(o,a,n,d)=>{for(var u=d>1?void 0:d?tu(a,n):a,g=o.length-1,m;g>=0;g--)(m=o[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&eu(a,n,u),u};let wn=class extends Te{constructor(){super(...arguments),this.safetyChecks=[!1,!1,!1,!1,!1],this._rules=[{title:"Freischalten",desc:"Gesamte Anlage allpolig vom Stromnetz trennen (z. B. Hauptschalter aus)."},{title:"Gegen Wiedereinschalten sichern",desc:"Trennungen absichern (z. B. durch Schlösser, Klebeband oder Warnschilder), damit niemand sie versehentlich wieder einschaltet."},{title:"Spannungsfreiheit feststellen",desc:"Mit einem zweipoligen Spannungsprüfer (z. B. Duspol) an allen Polen die Abwesenheit von Spannung prüfen."},{title:"Erden und kurzschließen",desc:"Leiter erden und kurzschließen (zwingend notwendig ab 1000V)."},{title:"Benachbarte unter Spannung stehende Teile abdecken",desc:"Nahegelegene spannungsführende Teile abdecken (z. B. mit isolierenden Abdecktüchern)."}]}render(){const o=this.safetyChecks.every(a=>a);return M`
      <div class="card safety-card">
        <h3 class="text-danger m-0">⚠️ Sicherheits-Check</h3>
        <p>Bitte bestätigen Sie die 5 VDE-Sicherheitsregeln:</p>
        <div class="safety-list">
          ${this._rules.map((a,n)=>M`
              <label class="safety-item">
                <input
                  type="checkbox"
                  .checked="${this.safetyChecks[n]}"
                  @change="${d=>this._toggleCheck(n,d)}"
                />
                <div style="display: flex; flex-direction: column; gap: 4px; text-align: left;">
                  <span>${n+1}. ${a.title}</span>
                  <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-secondary);">${a.desc}</span>
                </div>
              </label>
            `)}
        </div>
        <vaadin-button
          theme="primary error"
          class="btn-large"
          ?disabled="${!o}"
          @click="${this._confirm}"
          >🔓 Diagnose starten</vaadin-button
        >
      </div>
    `}_toggleCheck(o,a){const n=a.target.checked;this.dispatchEvent(new CustomEvent("safety-changed",{detail:{index:o,checked:n}}))}_confirm(){this.dispatchEvent(new CustomEvent("safety-confirmed"))}};wn.styles=ti(vi);Xo([Je({type:Array})],wn.prototype,"safetyChecks",2);wn=Xo([st("ec-safety-checks")],wn);var iu=Object.defineProperty,ru=Object.getOwnPropertyDescriptor,Gr=(o,a,n,d)=>{for(var u=d>1?void 0:d?ru(a,n):a,g=o.length-1,m;g>=0;g--)(m=o[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&iu(a,n,u),u};let Vi=class extends Te{constructor(){super(...arguments),this.stepIndex=0,this._isSpeaking=!1,this._isListening=!1,this._recognition=null}disconnectedCallback(){this._stopSpeech(),this._stopVoiceControl(),super.disconnectedCallback()}_stopSpeech(){"speechSynthesis"in window&&window.speechSynthesis.cancel(),this._isSpeaking=!1}_startVoiceControl(){const o=window.SpeechRecognition||window.webkitSpeechRecognition;if(!o){alert("Spracherkennung wird von Ihrem Browser leider nicht unterstützt.");return}try{this._recognition=new o,this._recognition.continuous=!0,this._recognition.lang="de-DE",this._recognition.interimResults=!1,this._recognition.onresult=a=>{const n=a.results[a.results.length-1][0].transcript.toLowerCase().trim();console.log("Sprachbefehl erkannt:",n),this.result&&this.result.actionSteps&&this.result.actionSteps[this.stepIndex]&&(n.includes("weiter")||n.includes("nächst")||n.includes("next")?this._handleNext(this.result.actionSteps.length):n.includes("zurück")||n.includes("back")?this._handleBack():n.includes("vorlesen")||n.includes("sprich")||n.includes("lies")?this._speakStep(this.result.actionSteps[this.stepIndex].text):(n.includes("stopp")||n.includes("halt"))&&this._stopSpeech())},this._recognition.onend=()=>{if(this._isListening)try{this._recognition.start()}catch(a){console.warn("Fehler beim Neustarten der Spracherkennung:",a)}},this._recognition.onerror=a=>{console.error("Spracherkennungsfehler:",a),a.error==="not-allowed"&&(alert("Mikrofon-Berechtigung verweigert."),this._isListening=!1)},this._isListening=!0,this._recognition.start()}catch(a){console.error("Fehler beim Initialisieren der Spracherkennung:",a),alert("Spracherkennung konnte nicht gestartet werden.")}}_stopVoiceControl(){if(this._isListening=!1,this._recognition){try{this._recognition.stop()}catch(o){console.warn("Fehler beim Stoppen der Spracherkennung:",o)}this._recognition=null}}_toggleVoiceControl(){this._isListening?this._stopVoiceControl():this._startVoiceControl()}render(){if(!this.result||!this.result.actionSteps||this.result.actionSteps.length===0)return M`<p>Keine Reparaturschritte verfügbar.</p>`;const o=this.result.actionSteps,a=o[this.stepIndex],n=o.length;return M`
      <div class="card result-card mt-1">
        <h3 class="m-0">🛠️ Geführte Reparatur</h3>
        <div class="guided-container">
          <div class="step-card">
            <div class="step-number">Schritt ${this.stepIndex+1} von ${n}</div>
            <div class="step-text">${a.text}</div>
          </div>
          
          <vaadin-progress-bar 
            value="${(this.stepIndex+1)/n}" 
            class="w-100"
          ></vaadin-progress-bar>

          <div style="display: flex; flex-direction: column; gap: 8px; margin: 4px 0; padding: 12px; background: var(--bg-app); border: 1px solid var(--border); border-radius: var(--radius-s); align-items: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap;">
              <span style="font-size: 0.85rem; font-weight: bold; display: flex; align-items: center; gap: 6px; color: var(--text-primary);">
                🗣️ Sprachsteuerung:
              </span>
              <vaadin-button
                theme="${this._isListening?"primary error":"secondary"}"
                @click="${this._toggleVoiceControl}"
                style="min-height: auto; height: 28px; font-size: 0.8rem; margin: 0;"
              >
                ${this._isListening?"🎙️ Aktiv (Stoppen)":"🎤 Starten"}
              </vaadin-button>
            </div>
            ${this._isListening?M`
              <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center;">
                Sagen Sie: <strong>"Weiter"</strong> | <strong>"Zurück"</strong> | <strong>"Vorlesen"</strong> | <strong>"Stopp"</strong>
              </div>
            `:""}
          </div>
          
          <div class="guided-controls">
            <vaadin-button
              theme="secondary"
              ?disabled="${this.stepIndex===0}"
              @click="${this._handleBack}"
              >Zurück</vaadin-button
            >
            
            <vaadin-button
              class="tts-button"
              @click="${()=>this._speakStep(a.text)}"
              >${this._isSpeaking?"🛑 Stopp":"🔊 Vorlesen"}</vaadin-button
            >
            
            <vaadin-button
              theme="primary success"
              @click="${()=>this._handleNext(n)}"
              >${this.stepIndex+1===n?"Abschließen":"Weiter"}</vaadin-button
            >
          </div>
          
          <vaadin-button
            theme="tertiary error"
            @click="${this._handleCancel}"
            >Beenden</vaadin-button
          >
        </div>
      </div>
    `}_handleBack(){this._stopSpeech(),this.dispatchEvent(new CustomEvent("step-changed",{detail:{index:this.stepIndex-1}}))}_handleNext(o){this._stopSpeech(),this.dispatchEvent(new CustomEvent("step-completed",{detail:{index:this.stepIndex}})),this.stepIndex+1<o?this.dispatchEvent(new CustomEvent("step-changed",{detail:{index:this.stepIndex+1}})):this.dispatchEvent(new CustomEvent("repair-completed"))}_handleCancel(){this._stopSpeech(),this._stopVoiceControl(),this.dispatchEvent(new CustomEvent("close"))}_speakStep(o){if("speechSynthesis"in window){if(this._isSpeaking){window.speechSynthesis.cancel(),this._isSpeaking=!1;return}const a=new SpeechSynthesisUtterance(o);a.lang="de-DE",a.onend=()=>{this._isSpeaking=!1},a.onerror=()=>{this._isSpeaking=!1},this._isSpeaking=!0,window.speechSynthesis.speak(a)}else alert("Sprachausgabe wird von Ihrem Browser leider nicht unterstützt.")}};Vi.styles=ti(vi);Gr([Je({type:Object})],Vi.prototype,"result",2);Gr([Je({type:Number})],Vi.prototype,"stepIndex",2);Gr([F()],Vi.prototype,"_isSpeaking",2);Gr([F()],Vi.prototype,"_isListening",2);Vi=Gr([st("ec-guided-repair")],Vi);function to(o,a,n,d,u){const g=new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"});return{content:[{text:"ElectroCheck AI - Wartungsprotokoll",fontSize:24,bold:!0,color:"#005fcc",margin:[0,0,0,5]},u&&(u.name||u.company||u.id)?{text:[{text:"Prüfer: ",bold:!0},u.name||"-",{text:"  |  Firma: ",bold:!0},u.company||"-",{text:"  |  Zertifikat/ID: ",bold:!0},u.id||"-"],fontSize:10,margin:[0,0,0,10],color:"#333333"}:{},{text:`Erstellt am: ${g}`,margin:[0,0,0,20],color:"#666666",fontSize:10},{table:{widths:["*"],body:[[{text:`KOMPONENTE: ${o.deviceName}`,fillColor:"#eeeeee",border:[!1,!1,!1,!1],bold:!0,fontSize:14,padding:[8,8,8,8]}]]},margin:[0,0,0,15]},a?{image:a,width:300,alignment:"center",margin:[0,10,0,20]}:{},{text:"DIAGNOSE-ERGEBNISSE",fontSize:16,bold:!0,margin:[0,10,0,5],color:"#005fcc"},{canvas:[{type:"line",x1:0,y1:0,x2:515,y2:0,lineWidth:1,lineColor:"#005fcc"}]},{text:"Identifizierter Defekt:",bold:!0,margin:[0,15,0,2]},{text:o.identifiedDefect,margin:[0,0,0,10]},{text:"Handlungsempfehlung:",bold:!0,margin:[0,10,0,2]},{text:o.recommendation,margin:[0,0,0,10]},o.location?{text:[{text:"📍 Anlagenstandort: ",bold:!0},{text:o.location,color:"#005fcc",link:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.location.replace("Lat: ","").replace(", Lng: ",","))}`}],margin:[0,0,0,10]}:{},{columns:[{width:"auto",text:"Reparatur-Schwierigkeit: ",bold:!0},{width:"*",text:"★".repeat(o.repairDifficulty||1)+"☆".repeat(5-(o.repairDifficulty||1)),color:"#f59e0b",margin:[5,0,0,0]}],margin:[0,5,0,20]},o.customerExperience?[{text:"TECHNIKER-EXPERTISE:",bold:!0,fontSize:12,margin:[0,10,0,5]},{text:o.customerExperience,fontStyle:"italic",color:"#444444",margin:[10,0,0,10]}]:[],o.additionalTips&&o.additionalTips.length>0?[{text:"Zusätzliche Hinweise & Sicherheitstipps:",bold:!0,margin:[0,10,0,5]},{ul:o.additionalTips,margin:[10,0,0,10]}]:[],d?[{text:"⚡ SICHERHEITSPRÜFUNG NACH DGUV V3 (VDE 0701-0702)",fontSize:16,bold:!0,margin:[0,20,0,5],color:"#005fcc"},{canvas:[{type:"line",x1:0,y1:0,x2:515,y2:0,lineWidth:1,lineColor:"#005fcc"}]},{table:{widths:["*","auto","auto"],body:[[{text:"Prüfparameter",bold:!0,fillColor:"#eeeeee"},{text:"Messwert",bold:!0,fillColor:"#eeeeee"},{text:"Grenzwert",bold:!0,fillColor:"#eeeeee"}],[{text:"Schutzleiterwiderstand (R_PE)"},{text:d.rPe?`${d.rPe} Ω`:"n.a."},{text:"≤ 0.3 Ω"}],[{text:"Isolationswiderstand (R_ISO)"},{text:d.rIso?`${d.rIso} MΩ`:"n.a."},{text:"≥ 1.0 MΩ"}],[{text:"Ableitstrom (I_leak)"},{text:d.iLeak?`${d.iLeak} mA`:"n.a."},{text:"≤ 3.5 mA"}],[{text:"Gesamtbewertung",bold:!0,colSpan:2},{},{text:d.status,bold:!0,color:d.status==="BESTANDEN"?"#0b8a5a":"#dc2626"}]]},margin:[0,15,0,15]},d.signatureUrl?[{text:`Unterschrift der Elektrofachkraft:${u!=null&&u.name?" "+u.name:""}`,bold:!0,fontSize:11,margin:[0,10,0,5]},{image:d.signatureUrl,width:120,margin:[10,0,0,10]}]:[]]:[],o.sparePartSearchTerm?{stack:[{canvas:[{type:"line",x1:0,y1:0,x2:515,y2:0,lineWidth:.5,lineColor:"#cccccc"}]},{text:[{text:`
Empfohlenes Ersatzteil: `,bold:!0},{text:o.sparePartSearchTerm}],margin:[0,5,0,0]}],margin:[0,20,0,0]}:{},{text:`

RECHTLICHER HINWEIS`,fontSize:10,bold:!0,color:"#9f1239",margin:[0,20,0,5]},{text:o.disclaimer||n,fontSize:9,color:"#444444",alignment:"justify",fontStyle:"italic"}],defaultStyle:{fontSize:11,lineHeight:1.3}}}function nu(o,a,n,d){const u=new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"}),g=[[{text:"Bauteil / Bereich",bold:!0,fillColor:"#eeeeee"},{text:"Temperatur",bold:!0,fillColor:"#eeeeee"},{text:"Status",bold:!0,fillColor:"#eeeeee"}]];return o.detectedHotspots.forEach(m=>{g.push([{text:m.label},{text:m.temperature},{text:m.severity,bold:!0,color:m.severity==="CRITICAL"?"#dc2626":m.severity==="MONITOR"?"#f59e0b":"#0b8a5a"}])}),{content:[{text:"ElectroCheck AI - Thermografie-Inspektionsbericht",fontSize:22,bold:!0,color:"#b91c1c",margin:[0,0,0,5]},d&&(d.name||d.company||d.id)?{text:[{text:"Prüfer: ",bold:!0},d.name||"-",{text:"  |  Firma: ",bold:!0},d.company||"-",{text:"  |  Zertifikat/ID: ",bold:!0},d.id||"-"],fontSize:10,margin:[0,0,0,10],color:"#333333"}:{},{text:`Erstellt am: ${u}`,margin:[0,0,0,20],color:"#666666",fontSize:10},{table:{widths:["*"],body:[[{text:`GESAMTPRÜFSTATUS: ${o.overallStatus}`,fillColor:o.overallStatus==="CRITICAL"?"#fee2e2":o.overallStatus==="MONITOR"?"#fef3c7":"#d1fae5",border:[!1,!1,!1,!1],bold:!0,fontSize:14,color:o.overallStatus==="CRITICAL"?"#991b1b":o.overallStatus==="MONITOR"?"#92400e":"#065f46",padding:[8,8,8,8]}]]},margin:[0,0,0,15]},a?{image:a,width:300,alignment:"center",margin:[0,10,0,20]}:{},{text:"THERMOGRAFISCHE ANOMALIEN / HOTSPOTS",fontSize:16,bold:!0,margin:[0,10,0,5],color:"#b91c1c"},{canvas:[{type:"line",x1:0,y1:0,x2:515,y2:0,lineWidth:1,lineColor:"#b91c1c"}]},{table:{widths:["*","auto","auto"],body:g},margin:[0,15,0,15]},{text:"Allgemeine Bewertung:",bold:!0,margin:[0,10,0,2]},{text:o.generalRecommendation,margin:[0,0,0,15]},o.actionSteps&&o.actionSteps.length>0?[{text:"Empfohlene Instandsetzungsmaßnahmen:",bold:!0,margin:[0,10,0,5]},{ol:o.actionSteps.map(m=>({text:`${m.text} ${m.completed?" (Erledigt)":""}`})),margin:[10,0,0,15]}]:[],o.safetyTips&&o.safetyTips.length>0?[{text:"Sicherheitshinweise & VDE-Regeln:",bold:!0,margin:[0,10,0,5]},{ul:o.safetyTips,margin:[10,0,0,15]}]:[],{text:`

RECHTLICHER HINWEIS`,fontSize:10,bold:!0,color:"#9f1239",margin:[0,20,0,5]},{text:n,fontSize:9,color:"#444444",alignment:"justify",fontStyle:"italic"}],defaultStyle:{fontSize:11,lineHeight:1.3}}}var su=Object.defineProperty,au=Object.getOwnPropertyDescriptor,yi=(o,a,n,d)=>{for(var u=d>1?void 0:d?au(a,n):a,g=o.length-1,m;g>=0;g--)(m=o[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&su(a,n,u),u};let Xt=class extends Te{constructor(){super(...arguments),this._isLoading=!1,this._loadingMessage="Analysiere Infrarotbild...",this._description="",this._capturedImage=null,this._result=null,this._pdfPreviewUrl=null,this._ctx=null,this._aiService=new Uo,this._loadingInterval=null,this._loadingPhrases=["Lade Infrarotbild...","Suche nach Wärmeanomalien...","Kalkuliere Temperaturspitzen...","Bewerte Sicherheitsabstände...","Gleiche mit VDE-Grenzwerte ab...","Erstelle Instandsetzungsbericht..."]}render(){return M`
      <div class="guided-container">
        <!-- 1. Input Section -->
        ${this._result?"":M`
              <div class="card ocr-card">
                <h3 class="m-0">🔥 KI-Wärmebild-Analysator (Thermografie)</h3>
                <p>
                  Analysiere Infrarot-Aufnahmen von Schaltschränken und Anlagen. Die KI erkennt Bauteile,
                  überhitzte Klemmen (Hotspots) und empfiehlt VDE-konforme Schutzmaßnahmen.
                </p>

                <!-- Upload area -->
                <div class="mt-1" style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <vaadin-button theme="primary" @click="${this._triggerFileSelect}">
                    📸 Wärmebild hochladen
                  </vaadin-button>
                  <vaadin-button theme="secondary" @click="${this._loadDemoImage}">
                    💡 Demo-Bild laden
                  </vaadin-button>
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    style="display: none;"
                    @change="${this._handleFileChange}"
                  />
                </div>

                ${this._capturedImage?M`
                      <div class="media-box mt-1" style="background: var(--surface); height: 260px;">
                        <img src="${this._capturedImage}" alt="Wärmebild Vorschau" style="object-fit: contain;" />
                      </div>
                    `:""}

                <vaadin-text-area
                  class="w-100 mt-1"
                  label="Zusätzliche Angaben zur Anlage"
                  placeholder="z.B. Hauptverteilung Halle A, Sicherung brummt, Nennstrom 63A"
                  .value="${this._description}"
                  @value-changed="${o=>this._description=o.detail.value}"
                ></vaadin-text-area>

                <div class="mt-1">
                  <vaadin-button
                    theme="primary success"
                    class="w-100 btn-large"
                    ?disabled="${!this._capturedImage||this._isLoading}"
                    @click="${this._startThermalAnalysis}"
                  >
                    🔥 Thermografie analysieren
                  </vaadin-button>
                </div>
              </div>
            `}

        <!-- 2. Loading / Skeleton Screen -->
        ${this._isLoading?M`
              <div class="card skeleton-card">
                <div class="tech-spinner"></div>
                <p class="loading-text">${this._loadingMessage}</p>
              </div>
            `:""}

        <!-- 3. Result Section -->
        ${this._result&&!this._isLoading?M`
              <!-- Canvas Visualization Card -->
              <div class="card result-card">
                <h3 class="m-0">📊 Thermografie-Auswertung</h3>
                
                <div class="media-box" style="background: #090d16; aspect-ratio: auto; height: 350px;">
                  <canvas id="thermal-canvas" style="width: 100%; height: 100%; object-fit: contain;"></canvas>
                </div>
                <div class="camera-hint" role="status" style="position: relative; bottom: 0; margin-top: 8px;">
                  🔴 Die erkannten Hotspots wurden farblich markiert (Rot = Kritisch, Orange = Warnung).
                </div>
              </div>

              <!-- General Recommendation Card -->
              <div class="card ${this._getSeverityClass()}">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; margin-bottom: 1rem;">
                  <h3 class="m-0" style="border: none; padding: 0; margin: 0;">
                    🛡️ Status: ${this._result.overallStatus}
                  </h3>
                  <span class="difficulty-stars" style="margin: 0; font-size: 1.25rem;">
                    ${this._result.overallStatus==="CRITICAL"?"🔴🔴🔴":this._result.overallStatus==="MONITOR"?"🟡🟡":"🟢"}
                  </span>
                </div>
                <p><strong>Gesamteinschätzung:</strong></p>
                <div class="experience-box" style="margin: 0.5rem 0 1rem 0; border-left-color: var(--primary);">
                  ${this._result.generalRecommendation}
                </div>

                <!-- Hotspots List Table -->
                <h4 style="margin: 1.5rem 0 0.5rem 0; font-size: 0.95rem; text-transform: uppercase; color: var(--text-secondary);">Erkannte Hotspots</h4>
                <div style="overflow-x: auto; width: 100%; border: 1px solid var(--border); border-radius: var(--radius-s); background: var(--bg-app);">
                  <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
                    <thead>
                      <tr style="border-bottom: 1px solid var(--border); background: var(--bg-card);">
                        <th style="padding: 10px; font-weight: 700;">Bauteil/Bereich</th>
                        <th style="padding: 10px; font-weight: 700;">Temperatur</th>
                        <th style="padding: 10px; font-weight: 700;">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${this._result.detectedHotspots.map(o=>M`
                          <tr style="border-bottom: 1px solid var(--border);">
                            <td style="padding: 10px; font-weight: 600;">${o.label}</td>
                            <td style="padding: 10px; color: var(--text-secondary); font-family: monospace;">${o.temperature}</td>
                            <td style="padding: 10px;">
                              <span style="font-weight: 700; color: ${o.severity==="CRITICAL"?"var(--danger)":o.severity==="MONITOR"?"var(--warning)":"var(--success)"}">
                                ${o.severity}
                              </span>
                            </td>
                          </tr>
                        `)}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Interactive Actions Checklist -->
              <div class="card result-card">
                <h3 class="m-0">🛠️ Instandsetzungs-Checkliste</h3>
                <p>Führe folgende Schritte aus, um die Mängel sicher zu beheben:</p>
                <div class="safety-list">
                  ${this._result.actionSteps.map((o,a)=>M`
                      <label class="safety-item" style="border-color: ${o.completed?"var(--success)":"var(--border)"}; background: ${o.completed?"var(--success-glow)":"var(--bg-app)"};">
                        <input
                          type="checkbox"
                          .checked="${o.completed}"
                          @change="${n=>this._toggleStep(a,n)}"
                        />
                        <span style="text-decoration: ${o.completed?"line-through":"none"}; color: ${o.completed?"var(--text-muted)":"var(--text-primary)"}">
                          ${o.text}
                        </span>
                      </label>
                    `)}
                </div>
              </div>

              <!-- VDE Normen & Sicherheitshinweise -->
              <div class="card safety-card">
                <h3 class="m-0">⚠️ VDE-Sicherheitsregeln & Thermografie-Grenzwerte</h3>
                <ul class="tips-list">
                  ${this._result.safetyTips.map(o=>M`<li>${o}</li>`)}
                  <li style="margin-top: 1rem; font-size: 0.8rem; font-style: italic;">
                    Vorschrift: Nach DIN EN 60204-1 (VDE 0113-1) dürfen metallische Teile von Bedienorganen im normalen Betrieb max. 70°C und metallische Anschlüsse max. 90°C erreichen.
                  </li>
                </ul>
              </div>

              <!-- Action Buttons -->
              <div class="result-actions" style="margin-bottom: 2rem;">
                <vaadin-button theme="primary" @click="${this._downloadPdfReport}">
                  📄 Bericht herunterladen (PDF)
                </vaadin-button>
                <vaadin-button theme="secondary" @click="${this._reset}">
                  🔄 Neue Analyse
                </vaadin-button>
              </div>
            `:""}

        <!-- PDF Preview Modal -->
        ${this._pdfPreviewUrl?M`
              <div class="modal-overlay">
                <div class="card pdf-modal-card">
                  <h3 class="m-0">📄 PDF-Inspektionsbericht Vorschau</h3>
                  <iframe class="pdf-iframe" src="${this._pdfPreviewUrl}"></iframe>
                  <div class="modal-actions">
                    <vaadin-button theme="secondary" @click="${()=>this._pdfPreviewUrl=null}">
                      Schließen
                    </vaadin-button>
                  </div>
                </div>
              </div>
            `:""}
      </div>
    `}_getSeverityClass(){return this._result?this._result.overallStatus==="CRITICAL"?"safety-card":this._result.overallStatus==="MONITOR"?"result-card":"ocr-card":""}_triggerFileSelect(){var o,a;(a=(o=this.shadowRoot)==null?void 0:o.getElementById("file-upload"))==null||a.click()}_handleFileChange(o){var d;const a=(d=o.target.files)==null?void 0:d[0];if(!a)return;const n=new FileReader;n.onload=()=>{this._capturedImage=n.result,this._result=null},n.readAsDataURL(a)}async _loadDemoImage(){this._isLoading=!0,this._loadingMessage="Lade Demo-Wärmebild...";try{const o=await fetch("/demo-thermal.png");if(!o.ok)throw new Error("Demo image not found");const a=await o.clone().blob(),n=new FileReader;n.onloadend=()=>{this._capturedImage=n.result,this._result=null,this._isLoading=!1},n.readAsDataURL(a)}catch{alert("Fehler beim Laden des Demo-Bildes. Ist der Vite-Server aktiv?"),this._isLoading=!1}}async _startThermalAnalysis(){if(!this._capturedImage)return;this._isLoading=!0,this._result=null;let o=0;this._loadingMessage=this._loadingPhrases[0],this._loadingInterval=window.setInterval(()=>{o++,o<this._loadingPhrases.length&&(this._loadingMessage=this._loadingPhrases[o])},1800);try{const a=await this._aiService.analyzeThermalImage(this._capturedImage,this._description);this._result=a,this._isLoading=!1,this._loadingInterval&&clearInterval(this._loadingInterval),await this.updateComplete,this._drawHotspots()}catch(a){alert(`Fehler bei der Analyse: ${a.message||a}`),this._isLoading=!1,this._loadingInterval&&clearInterval(this._loadingInterval)}}_drawHotspots(){if(!this._canvas||!this._result||!this._capturedImage)return;this._ctx=this._canvas.getContext("2d");const o=new Image;o.onload=()=>{const a=o.width,n=o.height;this._canvas.width=a,this._canvas.height=n,this._ctx&&(this._ctx.drawImage(o,0,0),this._ctx.lineCap="round",this._ctx.lineJoin="round",this._result.detectedHotspots.forEach(d=>{if(!d.box_2d||d.box_2d.length!==4)return;const u=d.box_2d[0]/1e3*n,g=d.box_2d[1]/1e3*a,m=d.box_2d[2]/1e3*n,A=d.box_2d[3]/1e3*a-g,_=m-u;let O="#10b981";d.severity==="CRITICAL"?O="#ef4444":d.severity==="MONITOR"&&(O="#f59e0b"),this._ctx.strokeStyle=O,this._ctx.lineWidth=Math.max(4,Math.floor(a/150)),this._ctx.strokeRect(g,u,A,_),this._ctx.fillStyle=O;const I=Math.max(14,Math.floor(a/35));this._ctx.font=`bold ${I}px var(--font-sans, sans-serif)`;const H=`${d.label} (${d.temperature})`,X=this._ctx.measureText(H).width;this._ctx.fillRect(g,u-I-8,X+14,I+10),this._ctx.fillStyle="#ffffff",this._ctx.fillText(H,g+7,u-7)}))},o.src=this._capturedImage}_toggleStep(o,a){if(!this._result)return;const n=a.target.checked;this._result.actionSteps[o].completed=n,this.requestUpdate()}async _downloadPdfReport(){if(this._result){this._isLoading=!0,this._loadingMessage="Generiere PDF...";try{const o=localStorage.getItem("electrocheck_inspector_name")||"",a=localStorage.getItem("electrocheck_inspector_company")||"",n=localStorage.getItem("electrocheck_inspector_id")||"",d=this._canvas?this._canvas.toDataURL("image/jpeg",.8):this._capturedImage,u=nu(this._result,d,"Haftungsausschluss: Dieser Bericht basiert auf einer KI-gestützten thermografischen Bildanalyse. Thermografische Schätzungen ersetzen keine kalibrierten Messgeräte oder professionelle Abnahmen durch Sachverständige. Arbeiten an elektrischen Anlagen dürfen nur durch qualifizierte Elektrofachkräfte unter Einhaltung der 5 Sicherheitsregeln vorgenommen werden.",{name:o,company:a,id:n}),g=await mi(()=>import("./pdfmake-Bzle68jV.js").then(_=>_.p),[]),m=await mi(()=>import("./vfs_fonts-DUQyFO-Z.js").then(_=>_.v),[]),C=g.default||g,A=m.default||m;C.vfs=A.pdfMake?A.pdfMake.vfs:A.vfs,C.createPdf(u).download(`Wärmebild_Protokoll_${new Date().toISOString().slice(0,10)}.pdf`)}catch{alert("Fehler bei der PDF-Erstellung.")}finally{this._isLoading=!1}}}_reset(){this._capturedImage=null,this._result=null,this._description="",this._pdfPreviewUrl=null}};Xt.styles=ti(vi);yi([F()],Xt.prototype,"_isLoading",2);yi([F()],Xt.prototype,"_loadingMessage",2);yi([F()],Xt.prototype,"_description",2);yi([F()],Xt.prototype,"_capturedImage",2);yi([F()],Xt.prototype,"_result",2);yi([F()],Xt.prototype,"_pdfPreviewUrl",2);yi([$r("#thermal-canvas")],Xt.prototype,"_canvas",2);Xt=yi([st("ec-thermal-analysis")],Xt);var ou=Object.defineProperty,lu=Object.getOwnPropertyDescriptor,At=(o,a,n,d)=>{for(var u=d>1?void 0:d?lu(a,n):a,g=o.length-1,m;g>=0;g--)(m=o[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&ou(a,n,u),u};let ft=class extends Te{constructor(){super(...arguments),this._system="single",this._material="cu",this._crossSection=1.5,this._current=16,this._length=20,this._cosPhi=1,this._explanation="",this._isLoadingExplanation=!1,this._mcbType="B",this._mcbCurrent=16,this._measuredZs=1.2,this._u0=230}_calculate(){const o=this._material==="cu"?56:34,a=this._system==="single"?230:400;let n=0;this._system==="single"?n=2*this._length*this._current*this._cosPhi/(o*this._crossSection):n=Math.sqrt(3)*this._length*this._current*this._cosPhi/(o*this._crossSection);const d=n/a*100,u=d<=3;return{deltaU:n.toFixed(2),pct:d.toFixed(2),passed:u,voltage:a}}_calculateZs(){let o=5;this._mcbType==="C"&&(o=10),this._mcbType==="D"&&(o=20);const a=this._mcbCurrent*o,n=this._u0/a,d=.8*this._u0/a,u=this._measuredZs<=d;return{Ia:a,maxZs:n.toFixed(2),maxZsSafety:d.toFixed(2),passed:u}}async _getAIExplanation(){this._isLoadingExplanation=!0,this._explanation="";const{deltaU:o,pct:a,passed:n}=this._calculate(),d=this._material==="cu"?"Kupfer":"Aluminium",g=`Ein Elektriker berechnet den Spannungsfall nach VDE 0100-520. Details:
- System: ${this._system==="single"?"Wechselstrom (230V)":"Drehstrom (400V)"}
- Leitermaterial: ${d}
- Querschnitt: ${this._crossSection} mm²
- Nennstrom: ${this._current} A
- Länge: ${this._length} m
- Spannungsfall berechnet: ${o} V (${a} %)
- VDE Limit (3.0%): ${n?"Bestanden":"NICHT BESTANDEN"}.

Erkläre kurz und präzise in 2-3 Sätzen auf Deutsch, warum dieser Wert zustande kommt, welche Risiken bestehen (z.B. Brandgefahr, Funktionsstörung) und was empfohlen wird.`;try{const m=localStorage.getItem("electrocheck_backend_url")||"http://localhost:3000",C={"Content-Type":"application/json"},A=localStorage.getItem("electrocheck_gemini_api_key");A&&(C["x-gemini-api-key"]=A);const _=await fetch(`${m}/api/gemini/diagnosis`,{method:"POST",headers:C,body:JSON.stringify({description:g,imageBase64:null})});if(_.ok){const O=await _.json();this._explanation=O.recommendation||"Keine Empfehlung generiert."}else this._explanation="Erklärung konnte nicht geladen werden. Prüfen Sie Ihren API-Key."}catch{this._explanation="Verbindungsfehler bei der Erklärung."}finally{this._isLoadingExplanation=!1}}render(){const{deltaU:o,pct:a,passed:n,voltage:d}=this._calculate(),u=this._calculateZs();return M`
      <!-- Spannungsfall Rechner -->
      <div class="calc-card">
        <h3 class="m-0" style="color: var(--primary); display: flex; align-items: center; gap: 8px;">
          ⚡ VDE 0100-520 Spannungsfall-Rechner
        </h3>
        <p style="font-size: 0.85rem; margin-top: 4px;">
          Berechnen Sie den Spannungsfall für Leitungen und überprüfen Sie die Einhaltung des 3%-Grenzwerts nach DIN VDE.
        </p>

        <div class="calc-grid">
          <div class="form-group">
            <label>Phasensystem</label>
            <select .value="${this._system}" @change="${g=>this._system=g.target.value}">
              <option value="single">Wechselstrom (1-phasig / 230V)</option>
              <option value="three">Drehstrom (3-phasig / 400V)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Leitermaterial</label>
            <select .value="${this._material}" @change="${g=>this._material=g.target.value}">
              <option value="cu">Kupfer (Cu)</option>
              <option value="al">Aluminium (Al)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Nennquerschnitt (A) in mm²</label>
            <select .value="${this._crossSection.toString()}" @change="${g=>this._crossSection=parseFloat(g.target.value)}">
              <option value="1.5">1.5 mm²</option>
              <option value="2.5">2.5 mm²</option>
              <option value="4">4.0 mm²</option>
              <option value="6">6.0 mm²</option>
              <option value="10">10.0 mm²</option>
              <option value="16">16.0 mm²</option>
              <option value="25">25.0 mm²</option>
              <option value="35">35.0 mm²</option>
              <option value="50">50.0 mm²</option>
            </select>
          </div>

          <div class="form-group">
            <label>Nennstrom (I) in A</label>
            <input type="number" .value="${this._current.toString()}" @input="${g=>this._current=parseFloat(g.target.value)||0}" />
          </div>

          <div class="form-group">
            <label>Einfache Leitungslänge (L) in m</label>
            <input type="number" .value="${this._length.toString()}" @input="${g=>this._length=parseFloat(g.target.value)||0}" />
          </div>

          <div class="form-group">
            <label>Leistungsfaktor (cos φ)</label>
            <input type="number" step="0.05" min="0.5" max="1.0" .value="${this._cosPhi.toString()}" @input="${g=>this._cosPhi=parseFloat(g.target.value)||1}" />
          </div>
        </div>

        <div class="summary-box">
          <div class="summary-row">
            <span>Soll-Spannung:</span>
            <strong>${d} V</strong>
          </div>
          <div class="summary-row">
            <span>Spannungsfall (V):</span>
            <strong>${o} V</strong>
          </div>
          <div class="summary-row">
            <span>Spannungsfall (%):</span>
            <strong style="color: ${n?"var(--success)":"var(--danger)"}">${a} %</strong>
          </div>
          <div class="summary-row">
            <span>Zulässiges Limit:</span>
            <strong>3.0 % (VDE 0100)</strong>
          </div>
        </div>

        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <div class="result-badge ${n?"badge-success":"badge-danger"}">
            ${n?"✅ BESTANDEN":"❌ GRENZWERT ÜBERSCHRITTEN"}
          </div>
          
          <vaadin-button
            theme="secondary"
            style="margin-top: 1rem;"
            @click="${this._getAIExplanation}"
            ?disabled="${this._isLoadingExplanation}"
          >
            ${this._isLoadingExplanation?"⌛ Analyse...":"🤖 KI-Erklärung anfordern"}
          </vaadin-button>
        </div>

        ${this._explanation?M`
          <div class="explanation-box">
            <strong>🤖 KI-Erklärung:</strong><br />
            ${this._explanation}
          </div>
        `:""}
      </div>

      <!-- Schleifenimpedanz Rechner -->
      <div class="calc-card" style="margin-top: 2rem;">
        <h3 class="m-0" style="color: var(--primary); display: flex; align-items: center; gap: 8px;">
          🔌 DIN VDE 0100-600 Schleifenimpedanz-Rechner (Zs)
        </h3>
        <p style="font-size: 0.85rem; margin-top: 4px;">
          Überprüfen Sie die maximale Schleifenimpedanz für Leitungsschutzschalter (MCB) zur Gewährleistung der automatischen Abschaltung im Fehlerfall.
        </p>

        <div class="calc-grid">
          <div class="form-group">
            <label>Charakteristik (MCB)</label>
            <select .value="${this._mcbType}" @change="${g=>this._mcbType=g.target.value}">
              <option value="B">Typ B (Ia = 5x In)</option>
              <option value="C">Typ C (Ia = 10x In)</option>
              <option value="D">Typ D (Ia = 20x In)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Nennstrom (In) in A</label>
            <select .value="${this._mcbCurrent.toString()}" @change="${g=>this._mcbCurrent=parseInt(g.target.value)}">
              <option value="6">6 A</option>
              <option value="10">10 A</option>
              <option value="13">13 A</option>
              <option value="16">16 A</option>
              <option value="20">20 A</option>
              <option value="25">25 A</option>
              <option value="32">32 A</option>
              <option value="40">40 A</option>
              <option value="50">50 A</option>
              <option value="63">63 A</option>
            </select>
          </div>

          <div class="form-group">
            <label>Gemessene Impedanz (Zs) in Ω</label>
            <input type="number" step="0.05" min="0.01" .value="${this._measuredZs.toString()}" @input="${g=>this._measuredZs=parseFloat(g.target.value)||0}" />
          </div>

          <div class="form-group">
            <label>Netzspannung gegen Erde (U0) in V</label>
            <input type="number" .value="${this._u0.toString()}" @input="${g=>this._u0=parseFloat(g.target.value)||230}" />
          </div>
        </div>

        <div class="summary-box">
          <div class="summary-row">
            <span>Benötigter Kurzschlussstrom (Ia):</span>
            <strong>${u.Ia} A</strong>
          </div>
          <div class="summary-row">
            <span>Max. theoretisches Zs (VDE 0100-410):</span>
            <strong>${u.maxZs} Ω</strong>
          </div>
          <div class="summary-row">
            <span>Max. Zs mit Sicherheitsfaktor 0,8 (DIN VDE 0100-600):</span>
            <strong style="color: var(--primary);">${u.maxZsSafety} Ω</strong>
          </div>
          <div class="summary-row">
            <span>Gemessener Wert:</span>
            <strong style="color: ${u.passed?"var(--success)":"var(--danger)"}">${this._measuredZs} Ω</strong>
          </div>
        </div>

        <div class="result-badge ${u.passed?"badge-success":"badge-danger"}">
          ${u.passed?"✅ ABSCHALTUNG GEWÄHRLEISTET (Bestanden)":"❌ FEHLER: Zs ZU HOCH (Gefahr im Kurzschlussfall)"}
        </div>
      </div>

      <!-- E-Mobilität & Wallbox Rechner (DIN VDE 0100-722) -->
      <div class="calc-card" style="margin-top: 2rem;">
        <h3 class="m-0" style="color: var(--primary); display: flex; align-items: center; gap: 8px;">
          🚗 DIN VDE 0100-722 Ladeinfrastruktur (Wallbox & E-Mobilität)
        </h3>
        <p style="font-size: 0.85rem; margin-top: 4px;">
          Berechnen Sie den voraussichtlichen Kurzschlussstrom (Ik = U0 / Zs) sowie den empfohlenen Kabelquerschnitt für 11 kW / 22 kW Wallboxen.
        </p>

        <div class="summary-box">
          <div class="summary-row">
            <span>Errechneter Kurzschlussstrom (Ik):</span>
            <strong>${this._measuredZs>0?(this._u0/this._measuredZs).toFixed(1):"0"} A (${((this._measuredZs>0?this._u0/this._measuredZs:0)/1e3).toFixed(2)} kA)</strong>
          </div>
          <div class="summary-row">
            <span>11 kW Wallbox (16A 3-phasig):</span>
            <strong>Empfohlen: min. 5x 2.5 mm² Cu (bei L <= 25m)</strong>
          </div>
          <div class="summary-row">
            <span>22 kW Wallbox (32A 3-phasig):</span>
            <strong>Empfohlen: min. 5x 6.0 mm² Cu (bei L <= 20m)</strong>
          </div>
          <div class="summary-row">
            <span>RCD-Pflicht (VDE 0100-722):</span>
            <strong>Allstromsensitiver RCD Typ B oder Typ A EV (DC-Fehlerstromerkennung 6mA)</strong>
          </div>
        </div>
      </div>
    `}};ft.styles=[ti(vi),Ge`
      .calc-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        margin-top: 1rem;
      }
      @media (min-width: 480px) {
        .calc-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
      .calc-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-m);
        padding: 1.25rem;
        margin-top: 1rem;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .form-group label {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-secondary);
      }
      select, input {
        background: var(--bg-app);
        color: var(--text-primary);
        border: 1px solid var(--border);
        padding: 8px 12px;
        border-radius: var(--radius-s);
        font-size: 0.9rem;
        width: 100%;
        box-sizing: border-box;
      }
      select:focus, input:focus {
        border-color: var(--primary);
        outline: none;
      }
      .result-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: var(--radius-s);
        font-weight: 800;
        font-size: 0.9rem;
        margin-top: 1rem;
      }
      .badge-success {
        background: rgba(16, 185, 129, 0.1);
        color: var(--success);
        border: 1px solid var(--success);
      }
      .badge-danger {
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
        border: 1px solid var(--danger);
      }
      .summary-box {
        margin-top: 1rem;
        padding: 12px;
        background: rgba(255, 255, 255, 0.02);
        border-radius: var(--radius-s);
        border: 1px solid var(--border);
        font-size: 0.85rem;
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      .summary-row:last-child {
        border-bottom: none;
      }
      .explanation-box {
        margin-top: 1rem;
        padding: 12px;
        background: var(--primary-glow);
        border-radius: var(--radius-s);
        border: 1px solid var(--primary);
        font-size: 0.85rem;
        text-align: left;
      }
    `];At([F()],ft.prototype,"_system",2);At([F()],ft.prototype,"_material",2);At([F()],ft.prototype,"_crossSection",2);At([F()],ft.prototype,"_current",2);At([F()],ft.prototype,"_length",2);At([F()],ft.prototype,"_cosPhi",2);At([F()],ft.prototype,"_explanation",2);At([F()],ft.prototype,"_isLoadingExplanation",2);At([F()],ft.prototype,"_mcbType",2);At([F()],ft.prototype,"_mcbCurrent",2);At([F()],ft.prototype,"_measuredZs",2);At([F()],ft.prototype,"_u0",2);ft=At([st("ec-vde-calculator")],ft);const io=[{id:"vde-0100-520",title:"Spannungsfall in Verbrauchsanlagen",standard:"DIN VDE 0100-520",category:"Leitungsdimensionierung",summary:"Regelt den maximal zulässigen Spannungsfall zwischen dem Zähler und den Verbrauchern, um Fehlfunktionen und Überlastungen zu vermeiden.",limitValues:["Maximal 3,0 % Spannungsfall für Beleuchtungs- und Steckdosenstromkreise in Wohngebäuden.","Maximal 4,0 % für andere Anlagen."],tips:["Wählen Sie bei langen Leitungswegen (>17 Meter bei 1.5mm² und 16A) einen größeren Querschnitt (z.B. 2.5mm²).","Berücksichtigen Sie den Leistungsfaktor cos φ des Verbrauchers bei induktiven Lasten."]},{id:"vde-0701-0702-pe",title:"Schutzleiterwiderstand (R_PE) bei ortsveränderlichen Geräten",standard:"DIN VDE 0701-0702 / EN 50678 & EN 50699",category:"Geräteprüfung",summary:"Beschreibt den maximal zulässigen Widerstand des Schutzleiters für elektrische Geräte der Schutzklasse I.",limitValues:["R_PE ≤ 0,3 Ω für Leitungen bis 5 m Länge.","Zuzüglich 0,1 Ω für jede weiteren 7,5 m Leitungslänge.","Maximal zulässiger Gesamtwert: 1,0 Ω."],tips:["Messen Sie während der Prüfung an verschiedenen Stellen des Gehäuses unter leichter mechanischer Belastung (Bewegen der Anschlussleitung).","Achten Sie auf Oxidschichten oder Lackierungen am Gehäuse, die den Messwert verfälschen können."]},{id:"vde-0701-0702-iso",title:"Isolationswiderstand (R_ISO) bei Geräten",standard:"DIN VDE 0701-0702",category:"Geräteprüfung",summary:"Bestimmt den Mindestwert des Isolationswiderstands zwischen aktiven Leitern und berührbaren leitfähigen Teilen.",limitValues:["R_ISO ≥ 1,0 MΩ für Geräte der Schutzklasse I (mit Schutzleiter).","R_ISO ≥ 2,0 MΩ für Geräte der Schutzklasse II (schutzisoliert).","R_ISO ≥ 0,25 MΩ für Geräte der Schutzklasse III (Sicherheitskleinspannung)."],tips:["Führen Sie die Messung mit einer Prüfspannung von 500 V DC durch.","Schalten Sie alle Schalter des Prüflings während der Messung ein, damit alle internen Bauteile erfasst werden."]},{id:"vde-0701-0702-leak",title:"Schutzleiterstrom / Ableitstrom (I_leak)",standard:"DIN VDE 0701-0702",category:"Geräteprüfung",summary:"Definiert die Obergrenze für den Strom, der über den Schutzleiter oder das Gehäuse zur Erde abfließt.",limitValues:["Schutzleiterstrom ≤ 3,5 mA für Geräte der Schutzklasse I.","Berührungsstrom ≤ 0,5 mA für Geräte der Schutzklasse II."],tips:["Nutzen Sie vorzugsweise das Differenzstrommessverfahren, da es auch Ströme über parallele Erdungen erfasst.","Bei Heizelementen mit hoher Leistung (>3,5 kW) gelten abweichende Grenzwerte (bis zu 1 mA pro kW)."]},{id:"vde-0105-100-rules",title:"Die 5 Sicherheitsregeln",standard:"DIN VDE 0105-100",category:"Arbeitsschutz",summary:"Die grundlegenden Sicherheitsregeln zur Vermeidung von Stromunfällen vor Beginn von Arbeiten an elektrischen Anlagen.",limitValues:["1. Freischalten (Spannungsquelle allpolig trennen).","2. Gegen Wiedereinschalten sichern (Schalter blockieren, Warnschild anbringen).","3. Spannungsfreiheit feststellen (mit zweipoligem Spannungsprüfer verifizieren).","4. Erden und Kurzschließen (zwingend bei Spannungen über 1000 V).","5. Benachbarte, unter Spannung stehende Teile abdecken oder abschranken."],tips:["Die Regeln müssen genau in dieser Reihenfolge angewendet werden.","Das Feststellen der Spannungsfreiheit darf nur mit zugelassenen, zweipoligen Messgeräten (z.B. Duspol) erfolgen, niemals mit einfachen Phasenprüfern ('Lügenstiften')."]},{id:"vde-ip-classes",title:"IP-Schutzarten (Ingress Protection)",standard:"DIN EN 60529 (VDE 0470-1)",category:"Gehäuseschutz",summary:"Klassifizierung des Schutzes von Gehäusen gegen das Eindringen von Festkörpern (1. Ziffer) und Wasser (2. Ziffer).",limitValues:["IP 20: Schutz gegen feste Fremdkörper (Ø ≥ 12,5 mm), kein Schutz gegen Wasser (Standard im Innenbereich).","IP 44: Schutz gegen feste Fremdkörper (Ø ≥ 1,0 mm) und Spritzwasser (Standard im feuchten Innen- und Außenbereich).","IP 65: Staubdicht und Schutz gegen Strahlwasser aus beliebigem Winkel.","IP 67: Staubdicht und Schutz gegen zeitweiliges Untertauchen."],tips:["Achten Sie bei Außeninstallationen stets auf eine korrekte Einführung der Kabel von unten, um Kondenswasserbildung zu vermeiden.","Beschädigte Dichtungen an IP44-Gehäusen führen zum Erlöschen des Berührungsschutzes."]}];var cu=Object.defineProperty,du=Object.getOwnPropertyDescriptor,Sn=(o,a,n,d)=>{for(var u=d>1?void 0:d?du(a,n):a,g=o.length-1,m;g>=0;g--)(m=o[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&cu(a,n,u),u};let lr=class extends Te{constructor(){super(...arguments),this._searchQuery="",this._selectedCategory="",this._expandedRuleId=null}_toggleExpand(o){this._expandedRuleId===o?this._expandedRuleId=null:this._expandedRuleId=o}render(){const o=Array.from(new Set(io.map(n=>n.category))),a=io.filter(n=>{const d=n.title.toLowerCase().includes(this._searchQuery.toLowerCase())||n.standard.toLowerCase().includes(this._searchQuery.toLowerCase())||n.summary.toLowerCase().includes(this._searchQuery.toLowerCase()),u=!this._selectedCategory||n.category===this._selectedCategory;return d&&u});return M`
      <div class="card result-card">
        <h3 class="m-0" style="color: var(--primary); display: flex; align-items: center; gap: 8px;">
          📚 VDE-Offline-Regelwerk
        </h3>
        <p style="font-size: 0.85rem; margin-top: 4px;">
          Durchsuchen Sie Grenzwerte, Prüfvorgaben und Sicherheitsregeln komplett offline vor Ort.
        </p>

        <!-- Search Bar -->
        <vaadin-text-field
          class="w-100 search-box"
          placeholder="Nach Norm, Grenzwert oder Begriff suchen..."
          .value="${this._searchQuery}"
          @value-changed="${n=>this._searchQuery=n.detail.value}"
          clear-button-visible
        >
          <span slot="prefix">🔍</span>
        </vaadin-text-field>

        <!-- Category Filters -->
        <div class="category-filters">
          <button 
            class="filter-chip ${this._selectedCategory?"":"active"}"
            @click="${()=>this._selectedCategory=""}"
          >
            Alle
          </button>
          ${o.map(n=>M`
            <button 
              class="filter-chip ${this._selectedCategory===n?"active":""}"
              @click="${()=>this._selectedCategory=n}"
            >
              ${n}
            </button>
          `)}
        </div>

        <!-- Rules List -->
        <div class="rules-container">
          ${a.length>0?a.map(n=>{const d=this._expandedRuleId===n.id;return M`
              <div class="rule-card" @click="${()=>this._toggleExpand(n.id)}">
                <div class="rule-header">
                  <div>
                    <h4 class="rule-title">${n.title}</h4>
                    <div class="rule-category">${n.category}</div>
                  </div>
                  <span class="rule-standard">${n.standard}</span>
                </div>
                <div class="rule-summary">
                  ${n.summary}
                </div>
                
                ${d?M`
                  <div class="rule-details" @click="${u=>u.stopPropagation()}">
                    <div class="limit-section">
                      <h5>⚠️ Grenzwerte & Kriterien:</h5>
                      <ul class="limit-list">
                        ${n.limitValues.map(u=>M`<li>${u}</li>`)}
                      </ul>
                    </div>
                    
                    <div class="tips-section">
                      <h5>💡 Praxistipps & Vorgehensweise:</h5>
                      <ul class="tips-list">
                        ${n.tips.map(u=>M`<li>${u}</li>`)}
                      </ul>
                    </div>
                  </div>
                `:M`
                  <div style="font-size: 0.75rem; color: var(--primary); text-align: right; margin-top: 8px; font-weight: bold;">
                    Details anzeigen 👇
                  </div>
                `}
              </div>
            `}):M`
            <div style="text-align: center; padding: 2rem; color: var(--text-muted); font-style: italic;">
              Keine passenden VDE-Regeln gefunden.
            </div>
          `}
        </div>
      </div>
    `}};lr.styles=[ti(vi),Ge`
      .search-box {
        margin-bottom: 1.25rem;
      }
      .rules-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .rule-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-m);
        padding: 1.25rem;
        text-align: left;
        cursor: pointer;
        transition: transform 0.2s ease, border-color 0.2s ease;
      }
      .rule-card:hover {
        transform: translateY(-2px);
        border-color: var(--primary);
      }
      .rule-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 8px;
      }
      .rule-title {
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--text-primary);
        margin: 0;
      }
      .rule-standard {
        font-size: 0.75rem;
        font-weight: 700;
        background: rgba(2, 119, 189, 0.15);
        color: var(--primary);
        padding: 4px 8px;
        border-radius: var(--radius-s);
      }
      .rule-category {
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        font-weight: bold;
        letter-spacing: 0.05em;
        margin-top: 4px;
      }
      .rule-summary {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-top: 8px;
        line-height: 1.5;
      }
      .rule-details {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px dashed var(--border);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .limit-section h5, .tips-section h5 {
        margin: 0 0 6px 0;
        font-size: 0.85rem;
        font-weight: bold;
        color: var(--text-primary);
      }
      .limit-list, .tips-list {
        margin: 0;
        padding-left: 20px;
        font-size: 0.8rem;
        color: var(--text-secondary);
        line-height: 1.5;
      }
      .limit-list li {
        margin-bottom: 4px;
      }
      .limit-list li::marker {
        color: var(--danger);
      }
      .tips-list li::marker {
        color: var(--success);
      }
      .category-filters {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }
      .filter-chip {
        font-size: 0.75rem;
        padding: 6px 12px;
        border-radius: 20px;
        border: 1px solid var(--border);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;
      }
      .filter-chip.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }
    `];Sn([F()],lr.prototype,"_searchQuery",2);Sn([F()],lr.prototype,"_selectedCategory",2);Sn([F()],lr.prototype,"_expandedRuleId",2);lr=Sn([st("ec-vde-rules")],lr);class hu{constructor(){this.device=null,this.server=null,this._isConnected=!1,this.simInterval=null}get isConnected(){return this._isConnected}isBluetoothSupported(){return typeof navigator<"u"&&"bluetooth"in navigator}async connect(a,n){if(this.isBluetoothSupported())try{this.device=await navigator.bluetooth.requestDevice({acceptAllDevices:!0,optionalServices:["battery_service",65504,6160,6153]}),this.device.addEventListener("gattserverdisconnected",()=>{this._isConnected=!1,n(!1)}),this.server=await this.device.gatt.connect(),this._isConnected=!0,n(!0,this.device.name||"BLE Multimeter");try{const u=await(await this.server.getPrimaryService("battery_service")).getCharacteristic("battery_level");await u.startNotifications(),u.addEventListener("characteristicvaluechanged",g=>{const m=g.target.value.getUint8(0);a({value:m/10,unit:"V",timestamp:Date.now(),stable:!0})})}catch{this.startSimulation(a)}return!0}catch(d){console.warn("Bluetooth connection error or cancelled, switching to simulator:",d)}return this._isConnected=!0,n(!0,"Simulierte BLE-Messspitze (Bluetooth Demo)"),this.startSimulation(a),!0}disconnect(a){this.simInterval&&(clearInterval(this.simInterval),this.simInterval=null),this.device&&this.device.gatt&&this.device.gatt.connected&&this.device.gatt.disconnect(),this._isConnected=!1,a&&a(!1)}startSimulation(a){this.simInterval&&clearInterval(this.simInterval);let n=.12;const d=["Ohm","MOhm","mA"];let u=0;this.simInterval=window.setInterval(()=>{const g=(Math.random()-.48)*.02;n=Math.max(.01,parseFloat((n+g).toFixed(3))),a({value:n,unit:d[u%d.length],timestamp:Date.now(),stable:Math.random()>.15})},1200)}}var uu=Object.defineProperty,fu=Object.getOwnPropertyDescriptor,Wr=(o,a,n,d)=>{for(var u=d>1?void 0:d?fu(a,n):a,g=o.length-1,m;g>=0;g--)(m=o[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&uu(a,n,u),u};let Hi=class extends Te{constructor(){super(...arguments),this._isConnected=!1,this._deviceName="",this._latestMeasurement=null,this._autoTarget="R_PE",this._service=new hu}disconnectedCallback(){super.disconnectedCallback(),this._service.disconnect()}render(){return M`
      <div class="header">
        <div class="title">
          📶 Bluetooth Multimeter (Web BLE)
        </div>
        <span class="badge ${this._isConnected?"connected":"disconnected"}">
          ${this._isConnected?`Verbunden: ${this._deviceName}`:"Getrennt"}
        </span>
      </div>

      <div class="display-panel">
        <span class="digital-val">
          ${this._latestMeasurement?this._latestMeasurement.value.toFixed(3):"---.---"}
        </span>
        <span class="unit-tag">
          ${this._latestMeasurement?this._latestMeasurement.unit:"Öhm"}
        </span>
      </div>

      <div class="controls">
        ${this._isConnected?M`
          <button class="btn-disconnect" @click="${this._handleDisconnect}">
            ❌ Trennen
          </button>
          
          <select @change="${o=>this._autoTarget=o.target.value}">
            <option value="R_PE">Schutzleiter (R_PE)</option>
            <option value="R_ISO">Isolationsw. (R_ISO)</option>
            <option value="I_LEAK">Ableitstrom (I_leak)</option>
          </select>

          <button class="btn-apply" @click="${this._applyToForm}">
            📥 Wert in DGUV V3 übernehmen
          </button>
        `:M`
          <button class="btn-connect" @click="${this._handleConnect}">
            🔗 Gerät koppeln / Verbinden
          </button>
        `}
      </div>
    `}async _handleConnect(){await this._service.connect(o=>{this._latestMeasurement=o},(o,a)=>{this._isConnected=o,this._deviceName=a||""})}_handleDisconnect(){this._service.disconnect(o=>{this._isConnected=o,this._latestMeasurement=null})}_applyToForm(){this._latestMeasurement&&this.dispatchEvent(new CustomEvent("ble-measurement-received",{detail:{target:this._autoTarget,value:this._latestMeasurement.value.toString(),unit:this._latestMeasurement.unit},bubbles:!0,composed:!0}))}};Hi.styles=Ge`
    :host {
      display: block;
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .title {
      font-weight: 700;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-primary, #0f172a);
    }
    .badge {
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .connected {
      background: #dcfce7;
      color: #15803d;
    }
    .disconnected {
      background: #f1f5f9;
      color: #64748b;
    }
    .display-panel {
      background: #090d16;
      border-radius: 10px;
      padding: 1.25rem;
      color: #38bdf8;
      font-family: 'Courier New', Courier, monospace;
      text-align: right;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.8);
      margin-bottom: 1rem;
    }
    .digital-val {
      font-size: 2.5rem;
      font-weight: bold;
      letter-spacing: 2px;
      text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
    }
    .unit-tag {
      font-size: 1.2rem;
      margin-left: 0.5rem;
      color: #a5f3fc;
    }
    .controls {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    button {
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-connect {
      background: var(--brand-primary, #2563eb);
      color: white;
    }
    .btn-connect:hover {
      background: #1d4ed8;
    }
    .btn-disconnect {
      background: #ef4444;
      color: white;
    }
    .btn-apply {
      background: #10b981;
      color: white;
    }
    .btn-apply:hover {
      background: #059669;
    }
    select {
      padding: 0.6rem;
      border-radius: 8px;
      border: 1px solid var(--border-color, #cbd5e1);
      background: var(--bg-card, #ffffff);
      color: var(--text-primary, #0f172a);
    }
  `;Wr([F()],Hi.prototype,"_isConnected",2);Wr([F()],Hi.prototype,"_deviceName",2);Wr([F()],Hi.prototype,"_latestMeasurement",2);Wr([F()],Hi.prototype,"_autoTarget",2);Hi=Wr([st("ec-ble-multimeter")],Hi);var gu=Object.defineProperty,pu=Object.getOwnPropertyDescriptor,gr=(o,a,n,d)=>{for(var u=d>1?void 0:d?pu(a,n):a,g=o.length-1,m;g>=0;g--)(m=o[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&gu(a,n,u),u};let _i=class extends Te{constructor(){super(...arguments),this._imagePreview=null,this._notes="",this._isLoading=!1,this._result=null,this._errorMessage=null}render(){return M`
      <div class="header">
        <h2>📐 KI-Schaltplan- & Stromlaufplan-Analyse</h2>
        <p>Lade ein Foto oder PDF eines Schaltplans hoch, um Bauteile, Klemmen und VDE-Schaltfehler automatisch zu analysieren.</p>
      </div>

      <div class="upload-zone" @click="${()=>{var o,a;return(a=(o=this.shadowRoot)==null?void 0:o.querySelector("#file-input"))==null?void 0:a.click()}}">
        <input type="file" id="file-input" accept="image/*" style="display:none" @change="${this._handleFileSelect}">
        <div>📁 Klicken oder Bild / Stromlaufplan hierher ziehen</div>
        ${this._imagePreview?M`<img src="${this._imagePreview}" class="preview">`:""}
      </div>

      <textarea
        rows="2"
        placeholder="Optional: Besondere Anmerkungen oder Fragen zur Schaltung..."
        .value="${this._notes}"
        @input="${o=>this._notes=o.target.value}"
      ></textarea>

      <button
        class="btn-analyze"
        ?disabled="${!this._imagePreview||this._isLoading}"
        @click="${this._analyzeSchematic}"
      >
        ${this._isLoading?"⚡ Analysiere Stromlaufplan...":"🔍 Schaltplan prüfen"}
      </button>

      ${this._errorMessage?M`<div style="color: red; margin-top: 1rem;">${this._errorMessage}</div>`:""}

      ${this._result?M`
        <div class="results-panel">
          <h3>📋 Plan: ${this._result.diagramTitle}</h3>
          <p>${this._result.summary}</p>

          <h4>🧩 Identifizierte Betriebsmittel</h4>
          ${this._result.identifiedComponents.map(o=>M`
            <div class="comp-card">
              <div>
                <span class="tag">${o.tag}</span>
                <strong>${o.name}</strong>
              </div>
              <span style="font-size:0.85rem; color:#64748b">Klemmen: ${o.terminals}</span>
            </div>
          `)}

          <h4 style="margin-top: 1.5rem;">⚠️ Norm- & Verdrahtungsprüfungen</h4>
          ${this._result.detectedErrors.length===0?M`<p style="color: green;">✅ Keine VDE-Verdrahtungsfehler festgestellt.</p>`:""}
          ${this._result.detectedErrors.map(o=>M`
            <div class="error-card ${o.severity}">
              <strong>[${o.severity}] ${o.vdeReference}</strong>
              <div>${o.description}</div>
            </div>
          `)}
        </div>
      `:""}
    `}_handleFileSelect(o){var d;const a=(d=o.target.files)==null?void 0:d[0];if(!a)return;const n=new FileReader;n.onload=()=>{this._imagePreview=n.result},n.readAsDataURL(a)}async _analyzeSchematic(){if(this._imagePreview){this._isLoading=!0,this._errorMessage=null;try{const o=await fetch("http://localhost:3000/api/gemini/schematic-analysis",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({imageBase64:this._imagePreview,notes:this._notes})});if(!o.ok)throw new Error(`Fehler bei der Analyse: ${o.statusText}`);this._result=await o.json()}catch(o){this._errorMessage=o.message||"Schaltplan konnte nicht analysiert werden."}finally{this._isLoading=!1}}}};_i.styles=Ge`
    :host {
      display: block;
      background: var(--bg-card, #ffffff);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid var(--border-color, #e2e8f0);
    }
    .header {
      margin-bottom: 1.5rem;
    }
    .header h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.3rem;
      color: var(--text-primary, #0f172a);
    }
    .upload-zone {
      border: 2px dashed var(--border-color, #cbd5e1);
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      background: var(--bg-app, #f8fafc);
      cursor: pointer;
      transition: border-color 0.2s;
      margin-bottom: 1rem;
    }
    .upload-zone:hover {
      border-color: var(--brand-primary, #2563eb);
    }
    img.preview {
      max-width: 100%;
      max-height: 300px;
      border-radius: 8px;
      margin-top: 1rem;
    }
    textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 0.75rem;
      border-radius: 8px;
      border: 1px solid var(--border-color, #cbd5e1);
      margin-bottom: 1rem;
      font-family: inherit;
      background: var(--bg-card, #ffffff);
      color: var(--text-primary, #0f172a);
    }
    button.btn-analyze {
      width: 100%;
      padding: 0.8rem;
      background: var(--brand-primary, #2563eb);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
    }
    button.btn-analyze:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .results-panel {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color, #e2e8f0);
    }
    .comp-card {
      background: var(--bg-app, #f8fafc);
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .tag {
      font-weight: bold;
      background: #e0f2fe;
      color: #0369a1;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-family: monospace;
    }
    .error-card {
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      border-left: 4px solid #ef4444;
      background: #fef2f2;
    }
    .error-card.WARNING {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }
    .error-card.INFO {
      border-left-color: #3b82f6;
      background: #eff6ff;
    }
  `;gr([F()],_i.prototype,"_imagePreview",2);gr([F()],_i.prototype,"_notes",2);gr([F()],_i.prototype,"_isLoading",2);gr([F()],_i.prototype,"_result",2);gr([F()],_i.prototype,"_errorMessage",2);_i=gr([st("ec-schematic-analyzer")],_i);var mu=Object.defineProperty,xu=Object.getOwnPropertyDescriptor,ri=(o,a,n,d)=>{for(var u=d>1?void 0:d?xu(a,n):a,g=o.length-1,m;g>=0;g--)(m=o[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&mu(a,n,u),u};let Bt=class extends Te{constructor(){super(...arguments),this._location="",this._voltageLevel="400V AC (Niederspannung)",this._arcFlashRisk="MEDIUM",this._ppe={helmet:!0,visor:!0,gloves1000v:!0,flameSuits:!1,safetyShoes:!0},this._safetyRulesChecked=[!1,!1,!1,!1,!1],this._inspectorName="",this._signatureUrl=null,this._isCompleted=!1}render(){return M`
      <div class="header">
        <h2>🛡️ Gefährdungsbeurteilung (GBU nach ArbSchG & BetrSichV)</h2>
        <p>Erstelle vor Arbeitsbeginn die geforderte Gefährdungsbeurteilung für Arbeiten unter Spannung oder an elektrischen Anlagen.</p>
      </div>

      <div class="grid">
        <div class="form-group">
          <label>Arbeitsort / Anlage</label>
          <input type="text" placeholder="z. B. Hauptverteilung HV-02 Keller" .value="${this._location}" @input="${o=>this._location=o.target.value}">
        </div>

        <div class="form-group">
          <label>Spannungsebene</label>
          <select @change="${o=>this._voltageLevel=o.target.value}">
            <option value="230V AC Wechselspannung">230V AC Wechselspannung</option>
            <option value="400V AC Niederspannung">400V AC Niederspannung (Drehstrom)</option>
            <option value="1000V DC Photovoltaik">1000V DC Photovoltaik</option>
            <option value="> 1kV Mittelspannung">High Voltage / Mittelspannung (>1kV)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Störlichtbogen-Risiko (Arc Flash Risk)</label>
          <select @change="${o=>this._arcFlashRisk=o.target.value}">
            <option value="LOW">Gering (Normale Messungen)</option>
            <option value="MEDIUM" selected>Mittel (Schaltschrankarbeiten)</option>
            <option value="HIGH">Hoch (Arbeiten unter Spannung - AuS)</option>
          </select>
        </div>
      </div>

      <h4>🥽 Erforderliche Persönliche Schutzausrüstung (PSA)</h4>
      <div class="ppe-box">
        <div class="checkbox-item">
          <input type="checkbox" id="helmet" .checked="${this._ppe.helmet}" @change="${o=>this._ppe={...this._ppe,helmet:o.target.checked}}">
          <label for="helmet">Schutzhelm mit Kinnriemen</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="visor" .checked="${this._ppe.visor}" @change="${o=>this._ppe={...this._ppe,visor:o.target.checked}}">
          <label for="visor">Gesichtsschutzschild (Störlichtbogenschutz Class 1/2)</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="gloves" .checked="${this._ppe.gloves1000v}" @change="${o=>this._ppe={...this._ppe,gloves1000v:o.target.checked}}">
          <label for="gloves">Isolierende Handschuhe 1000V (DIN EN 60903)</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="shoes" .checked="${this._ppe.safetyShoes}" @change="${o=>this._ppe={...this._ppe,safetyShoes:o.target.checked}}">
          <label for="shoes">Sicherheitsschuhe S3 ESD</label>
        </div>
      </div>

      <div class="rules-list">
        <h4>⚡ Bestätigung der 5 Sicherheitsregeln (DIN VDE 0105-100)</h4>
        ${["1. Freischalten","2. Gegen Wiedereinschalten sichern","3. Spannungsfreiheit allpolig feststellen","4. Erden und Kurzschließen","5. Benachbarte unter Spannung stehende Teile abdecken"].map((o,a)=>M`
          <div class="checkbox-item">
            <input type="checkbox" id="rule-${a}" .checked="${this._safetyRulesChecked[a]}" @change="${n=>{const d=[...this._safetyRulesChecked];d[a]=n.target.checked,this._safetyRulesChecked=d}}">
            <label for="rule-${a}"><strong>${o}</strong></label>
          </div>
        `)}
      </div>

      <div class="form-group">
        <label>Verantwortliche Elektrofachkraft (EFK / VEFK)</label>
        <input type="text" placeholder="Vor- und Nachname" .value="${this._inspectorName}" @input="${o=>this._inspectorName=o.target.value}">
      </div>

      <div class="form-group">
        <label>Digitale Freigabe-Unterschrift</label>
        <ec-signature-pad @signature-changed="${o=>this._signatureUrl=o.detail.dataUrl}"></ec-signature-pad>
      </div>

      <button class="btn-submit" @click="${this._handleSubmit}">
        ✅ Gefährdungsbeurteilung freigeben & in Protokoll ablegen
      </button>

      ${this._isCompleted?M`
        <div class="alert-success">
          ✅ Gefährdungsbeurteilung erfolgreich dokumentiert & signiert! (Zeitstempel: ${new Date().toLocaleString()})
        </div>
      `:""}
    `}_handleSubmit(){if(!this._location||!this._inspectorName){alert("Bitte Arbeitsort und Name der Elektrofachkraft eingeben.");return}if(!this._safetyRulesChecked.every(Boolean)){alert("Bitte alle 5 Sicherheitsregeln bestätigen!");return}this._isCompleted=!0,this.dispatchEvent(new CustomEvent("gbu-created",{detail:{location:this._location,voltageLevel:this._voltageLevel,arcFlashRisk:this._arcFlashRisk,ppeChecked:this._ppe,inspectorName:this._inspectorName,timestamp:new Date().toISOString(),signatureUrl:this._signatureUrl},bubbles:!0,composed:!0}))}};Bt.styles=Ge`
    :host {
      display: block;
      background: var(--bg-card, #ffffff);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid var(--border-color, #e2e8f0);
    }
    .header {
      margin-bottom: 1.5rem;
    }
    .header h2 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary, #0f172a);
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.4rem;
      color: var(--text-primary, #0f172a);
    }
    input[type="text"], select {
      width: 100%;
      box-sizing: border-box;
      padding: 0.6rem;
      border-radius: 8px;
      border: 1px solid var(--border-color, #cbd5e1);
      background: var(--bg-card, #ffffff);
      color: var(--text-primary, #0f172a);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
    }
    .ppe-box {
      background: var(--bg-app, #f8fafc);
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .rules-list {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }
    .rules-list h4 {
      margin-top: 0;
      color: #92400e;
    }
    button.btn-submit {
      width: 100%;
      padding: 0.8rem;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 1rem;
      cursor: pointer;
    }
    .alert-success {
      background: #dcfce7;
      color: #15803d;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
      font-weight: 600;
    }
  `;ri([F()],Bt.prototype,"_location",2);ri([F()],Bt.prototype,"_voltageLevel",2);ri([F()],Bt.prototype,"_arcFlashRisk",2);ri([F()],Bt.prototype,"_ppe",2);ri([F()],Bt.prototype,"_safetyRulesChecked",2);ri([F()],Bt.prototype,"_inspectorName",2);ri([F()],Bt.prototype,"_signatureUrl",2);ri([F()],Bt.prototype,"_isCompleted",2);Bt=ri([st("ec-gbu-generator")],Bt);var bu=Object.defineProperty,wu=Object.getOwnPropertyDescriptor,se=(o,a,n,d)=>{for(var u=d>1?void 0:d?wu(a,n):a,g=o.length-1,m;g>=0;g--)(m=o[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&bu(a,n,u),u};let re=class extends Te{constructor(){super(...arguments),this._isDarkMode=!1,this._isSettingsOpen=!1,this._isLoading=!1,this._isTicketCreating=!1,this._isOnline=!0,this._loadingMessage="Bereite Analyse vor...",this._isListening=!1,this._safetyConfirmed=!1,this._safetyChecks=[!1,!1,!1,!1,!1],this._activeTab="diagnose",this._isGloveMode=!1,this._isHighContrast=!1,this._rPe="",this._rIso="",this._iLeak="",this._capturedImage=null,this._selectedBoxLabel=null,this._ctx=null,this._isDrawing=!1,this._lastX=0,this._lastY=0,this._recognition=null,this._description="",this._result=null,this._ocrResult=null,this._history=[],this._offlineQueue=[],this._pdfPreviewUrl=null,this._loadingInterval=null,this._cancelRequested=!1,this._apiKey="",this._perplexityApiKey="",this._perplexityResult=null,this._isSearchingPerplexity=!1,this._offlineDatasheetMatch=null,this._signatureUrl=null,this._isRecordingAudio=!1,this._backendUrl="http://localhost:3000",this._accessibleMode=!1,this._hasAcceptedGDPR=!1,this._inspectorName="",this._inspectorCompany="",this._inspectorId="",this._gdprCheckbox=!1,this._guidedRepairStepIndex=null,this._showLegalModal=null,this._isMultimeterCameraOpen=!1,this._mediaRecorder=null,this._audioChunks=[],this._aiService=new Uo,this._perplexityService=new sh,this._ticketService=new nh,this._disclaimerText="Haftungsausschluss: Die Nutzung dieser Anwendung sowie die Umsetzung der bereitgestellten Tipps und Diagnoseergebnisse erfolgen ausschließlich auf eigene Gefahr und auf eigenes Risiko. Bei den Inhalten handelt es sich um KI-generierte Empfehlungen, die nach bestem Wissen erstellt wurden; sie stellen jedoch keine Rechtsberatung, keine technische Gewährleistung und keine Erfolgsgarantie dar. Diese Informationen können fehlerhaft sein und ersetzen unter keinen Umständen die Prüfung und Durchführung durch einen qualifizierten Servicetechniker. Vor Arbeiten an elektrischen Anlagen ist die Spannungsfreiheit sicherzustellen und die Einhaltung der geltenden Sicherheitsvorschriften (z.B. die 5 Sicherheitsregeln) liegt in der alleinigen Verantwortung des Nutzers.",this._loadingPhrases=["Übertrage Daten...","Scanne Bauteile...","Analysiere Beschreibung...","Gleiche Datenbank ab...","Kalkuliere Kosten...","Erstelle Protokoll..."]}async firstUpdated(){this._loadAppData(),this._initNetworkRadar()}disconnectedCallback(){this._recognition&&this._recognition.stop(),super.disconnectedCallback()}async _loadAppData(){const o=localStorage.getItem("electrocheck_history_v2");o&&(this._history=JSON.parse(o));const a=localStorage.getItem("electrocheck_queue");a&&(this._offlineQueue=JSON.parse(a));const n=localStorage.getItem("electrocheck_theme");if(n)this._isDarkMode=n==="dark",this.setAttribute("theme",n),document.documentElement.setAttribute("theme",n);else{const I=window.matchMedia("(prefers-color-scheme: dark)").matches;this._isDarkMode=I;const H=I?"dark":"light";this.setAttribute("theme",H),document.documentElement.setAttribute("theme",H)}const d=localStorage.getItem("electrocheck_gemini_api_key");d&&(this._apiKey=d);const u=localStorage.getItem("electrocheck_perplexity_api_key");u&&(this._perplexityApiKey=u);const g=localStorage.getItem("electrocheck_backend_url");g&&(this._backendUrl=g),localStorage.getItem("electrocheck_accessible_mode")==="true"&&(this._accessibleMode=!0,document.documentElement.classList.add("accessible-reading"),this.classList.add("accessible-reading"));const C=localStorage.getItem("electrocheck_gdpr_accepted");this._hasAcceptedGDPR=C==="true";const A=localStorage.getItem("electrocheck_inspector_name")||"",_=localStorage.getItem("electrocheck_inspector_company")||"",O=localStorage.getItem("electrocheck_inspector_id")||"";this._inspectorName=A,this._inspectorCompany=_,this._inspectorId=O}async _initNetworkRadar(){const o=await As.getStatus();this._isOnline=o.connected,As.addListener("networkStatusChange",a=>{this._isOnline=a.connected,a.connected&&(this._offlineQueue.length>0&&this._processOfflineQueue(),this._ticketService.syncOfflineTickets().then(n=>{n>0&&alert(`✅ ${n} Offline-Ticket(s) erfolgreich synchronisiert.`)}).catch(n=>{console.error("Fehler bei Ticket-Synchronisation:",n)}))})}_toggleTheme(){this._isDarkMode=!this._isDarkMode;const o=this._isDarkMode?"dark":"light";localStorage.setItem("electrocheck_theme",o),this.setAttribute("theme",o),document.documentElement.setAttribute("theme",o)}_toggleGloveMode(){this._isGloveMode=!this._isGloveMode,document.documentElement.setAttribute("glove-mode",this._isGloveMode?"true":"false")}_toggleHighContrast(){this._isHighContrast=!this._isHighContrast,document.documentElement.setAttribute("high-contrast",this._isHighContrast?"true":"false")}_handleBleMeasurement(o){const{target:a,value:n}=o.detail;a==="R_PE"&&(this._rPe=n),a==="R_ISO"&&(this._rIso=n),a==="I_LEAK"&&(this._iLeak=n)}_handleSafetyChanged(o){const{index:a,checked:n}=o.detail;this._safetyChecks=[...this._safetyChecks.slice(0,a),n,...this._safetyChecks.slice(a+1)]}_handleSafetyConfirmed(){this._safetyConfirmed=!0}_cancelAnalysis(){this._cancelRequested=!0,this._isLoading=!1,this._loadingInterval&&clearInterval(this._loadingInterval)}_reset(){this._capturedImage=null,this._result=null,this._ocrResult=null,this._description="",this._rPe="",this._rIso="",this._iLeak=""}_getDguvStatus(){const o=[];let a=!0;if(this._rPe.trim()){const d=parseFloat(this._rPe.replace(",","."));isNaN(d)?(o.push("R_PE: Ungültiger Wert"),a=!1):d>.3?(o.push(`R_PE: ${d} Ω (> 0.3 Ω Grenzwert) ❌`),a=!1):o.push(`R_PE: ${d} Ω (≤ 0.3 Ω) ✅`)}if(this._rIso.trim()){const d=parseFloat(this._rIso.replace(",","."));isNaN(d)?(o.push("R_ISO: Ungültiger Wert"),a=!1):d<1?(o.push(`R_ISO: ${d} MΩ (< 1.0 MΩ Grenzwert) ❌`),a=!1):o.push(`R_ISO: ${d} MΩ (≥ 1.0 MΩ) ✅`)}if(this._iLeak.trim()){const d=parseFloat(this._iLeak.replace(",","."));isNaN(d)?(o.push("I_leak: Ungültiger Wert"),a=!1):d>3.5?(o.push(`Ableitstrom: ${d} mA (> 3.5 mA Grenzwert) ❌`),a=!1):o.push(`Ableitstrom: ${d} mA (≤ 3.5 mA) ✅`)}return this._rPe.trim()||this._rIso.trim()||this._iLeak.trim()?{passed:a,message:a?"BESTANDEN":"NICHT BESTANDEN",details:o}:{passed:!0,message:"Keine Messdaten eingetragen",details:[]}}_toggleVoice(){if(!this._recognition){const o=window.SpeechRecognition||window.webkitSpeechRecognition;if(!o){alert("Dein Browser unterstützt leider keine Spracherkennung.");return}this._recognition=new o,this._recognition.lang="de-DE",this._recognition.continuous=!1,this._recognition.interimResults=!0,this._recognition.maxAlternatives=1,this._recognition.onresult=a=>{const n=a.results[0][0].transcript;this._description=this._description?this._description+" "+n:n},this._recognition.onend=()=>{this._isListening=!1},this._recognition.onerror=()=>{this._isListening=!1,alert("Fehler bei der Spracherkennung. Bitte Mikrofon-Berechtigung prüfen oder versuchen Sie es erneut.")}}if(this._isListening)this._recognition.stop(),this._isListening=!1;else{this._description="";try{this._recognition.start(),this._isListening=!0}catch(o){console.error("Error starting speech recognition:",o),alert("Fehler beim Starten der Spracherkennung.")}}}async _getCurrentLocation(){try{try{if((await hs.checkPermissions()).location!=="granted"&&(await hs.requestPermissions()).location!=="granted")return console.warn("Standort-Berechtigung verweigert."),"Standort-Berechtigung verweigert"}catch(a){console.warn("Berechtigungsprüfung übersprungen (vermutlich Browser):",a)}const o=await hs.getCurrentPosition({enableHighAccuracy:!0,timeout:1e4});return`Lat: ${o.coords.latitude.toFixed(5)}, Lng: ${o.coords.longitude.toFixed(5)}`}catch(o){return console.error("Standortfehler:",o),"Standort konnte nicht ermittelt werden (Evtl. kein HTTPS oder blockiert)"}}_initDrawingCanvas(){if(!this._drawCanvas||!this._capturedImage)return;this._ctx=this._drawCanvas.getContext("2d");const o=new Image;o.onload=()=>{var a;this._drawCanvas.width=o.width,this._drawCanvas.height=o.height,(a=this._ctx)==null||a.drawImage(o,0,0),this._ctx&&(this._ctx.strokeStyle="#ff0000",this._ctx.lineWidth=10,this._ctx.lineCap="round")},o.src=this._capturedImage}_handlePointerDown(o){const a=this._drawCanvas.getBoundingClientRect(),n=this._drawCanvas.width/a.width,d=(o.clientX-a.left)*n,u=(o.clientY-a.top)*n;if(this._result&&this._result.boundingBoxes&&this._result.boundingBoxes.length>0){const g=this._drawCanvas.width,m=this._drawCanvas.height,C=this._result.boundingBoxes.find(A=>{if(!A.box_2d||A.box_2d.length!==4)return!1;const _=A.box_2d[0]/1e3*m,O=A.box_2d[1]/1e3*g,I=A.box_2d[2]/1e3*m,H=A.box_2d[3]/1e3*g;return d>=O&&d<=H&&u>=_&&u<=I});if(C){this._selectedBoxLabel=C.label,this._drawAIBoundingBoxes();const A=document.createElement("div");A.style.position="fixed",A.style.bottom="80px",A.style.left="50%",A.style.transform="translateX(-50%)",A.style.background="var(--lumo-primary-color, #005fcc)",A.style.color="white",A.style.padding="10px 20px",A.style.borderRadius="8px",A.style.zIndex="9999",A.style.fontWeight="bold",A.style.boxShadow="0 4px 12px rgba(0,0,0,0.15)",A.innerText=`Ausgewählt: ${C.label}`,document.body.appendChild(A),setTimeout(()=>A.remove(),2500);return}}this._isDrawing=!0,this._lastX=d,this._lastY=u}_handlePointerMove(o){if(!this._isDrawing||!this._ctx)return;const a=this._drawCanvas.getBoundingClientRect(),n=this._drawCanvas.width/a.width,d=(o.clientX-a.left)*n,u=(o.clientY-a.top)*n;this._ctx.beginPath(),this._ctx.moveTo(this._lastX,this._lastY),this._ctx.lineTo(d,u),this._ctx.stroke(),this._lastX=d,this._lastY=u}_checkLocalDatabase(o){const a=o.toLowerCase(),n=ch.find(d=>a.includes(d.model.toLowerCase())||a.includes(d.errorCode.toLowerCase()));return n?{deviceName:n.model,identifiedDefect:n.diagnosis,recommendation:n.action,estimatedRepairCost:"0 - 50 €",repairDifficulty:2,safetyLevel:"WARNING",additionalTips:[n.safety],sparePartSearchTerm:"",customerExperience:"⚡ Sofort-Diagnose aus lokaler Offline-Datenbank."}:null}async _startAnalysis(){if(!this._capturedImage&&!this._description.trim())return alert("Kein Bild oder Text vorhanden.");const o=this._drawCanvas?this._drawCanvas.toDataURL("image/jpeg",.8):this._capturedImage;if(!this._isOnline)return this._offlineQueue=[...this._offlineQueue,{image:o,description:this._description,timestamp:Date.now()}],localStorage.setItem("electrocheck_queue",JSON.stringify(this._offlineQueue)),alert("Offline! Daten wurden im Wartezimmer gespeichert."),this._reset();this._cancelRequested=!1,this._isLoading=!0,this._result=null,this._ocrResult=null;let a=0;if(this._loadingMessage=this._loadingPhrases[0],this._loadingInterval=window.setInterval(()=>{a++,a<this._loadingPhrases.length&&(this._loadingMessage=this._loadingPhrases[a])},1800),this._description.trim()){const n=this._checkLocalDatabase(this._description);if(n){const d=await this._getCurrentLocation();this._result={...n,disclaimer:this._disclaimerText,location:d},this._saveToHistory(this._result),this._isLoading=!1,this._loadingInterval&&clearInterval(this._loadingInterval);return}}try{const n=await this._aiService.getDiagnosis(o,this._description);if(!this._cancelRequested){const d=await this._getCurrentLocation();this._result={...n,disclaimer:this._disclaimerText,location:d},this._result&&(this._saveToHistory(this._result),await this.updateComplete,this._result.boundingBoxes&&this._result.boundingBoxes.length>0&&this._drawAIBoundingBoxes())}}catch{this._cancelRequested||alert("Analyse fehlgeschlagen.")}finally{this._isLoading=!1,this._loadingInterval&&clearInterval(this._loadingInterval)}}_drawAIBoundingBoxes(){if(!this._drawCanvas||!this._result||!this._result.boundingBoxes||!this._capturedImage)return;const o=this._drawCanvas.getContext("2d");if(!o)return;const a=new Image;a.onload=()=>{o.drawImage(a,0,0);const n=this._drawCanvas.width,d=this._drawCanvas.height;o.lineCap="round",o.lineJoin="round",this._result.boundingBoxes.forEach(u=>{if(!u.box_2d||u.box_2d.length!==4)return;const g=u.box_2d[0]/1e3*d,m=u.box_2d[1]/1e3*n,C=u.box_2d[2]/1e3*d,_=u.box_2d[3]/1e3*n-m,O=C-g,I=u.label===this._selectedBoxLabel;o.lineWidth=I?Math.max(6,Math.floor(n/100)):Math.max(3,Math.floor(n/200)),o.strokeStyle=I?"#eab308":"#10b981",o.strokeRect(m,g,_,O),o.fillStyle=I?"rgba(234, 179, 8, 0.95)":"rgba(16, 185, 129, 0.85)";const H=Math.max(12,Math.floor(n/40));o.font=`bold ${H}px var(--font-sans, sans-serif)`;const X=o.measureText(u.label).width;o.fillRect(m,g-H-6,X+12,H+8),o.fillStyle="#ffffff",o.fillText(u.label,m+6,g-5)})},a.src=this._capturedImage}async _runPerplexitySearch(){if(this._result){this._isSearchingPerplexity=!0,this._perplexityResult=null;try{const o=`Recherchiere VDE-Richtlinien und typische Reparaturanleitungen für folgendes Gerät und Defekt: Gerät: ${this._result.deviceName}, Defekt: ${this._result.identifiedDefect}. Was sind die wichtigsten Sicherheitsvorkehrungen und VDE-Regeln für diesen Fall?`;this._perplexityResult=await this._perplexityService.search(o)}catch(o){alert(`Fehler bei der Perplexity-Suche: ${o.message}`)}finally{this._isSearchingPerplexity=!1}}}_formatMarkdown(o){if(!o)return"";let a=o.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>");return a=a.replace(/^\*\s(.*)$/gm,"• $1"),a}async _toggleAudioRecording(){this._isRecordingAudio?this._stopAudioRecording():await this._startAudioRecording()}async _startAudioRecording(){try{const o=await navigator.mediaDevices.getUserMedia({audio:!0});this._mediaRecorder=new MediaRecorder(o,{mimeType:"audio/webm"}),this._audioChunks=[],this._mediaRecorder.ondataavailable=a=>{a.data.size>0&&this._audioChunks.push(a.data)},this._mediaRecorder.onstop=async()=>{const a=new Blob(this._audioChunks,{type:"audio/webm"});o.getTracks().forEach(n=>n.stop()),await this._sendAudioToTranscribe(a)},this._mediaRecorder.start(),this._isRecordingAudio=!0}catch{alert("Zugriff auf das Mikrofon verweigert oder nicht unterstützt.")}}_stopAudioRecording(){this._mediaRecorder&&this._mediaRecorder.state!=="inactive"&&(this._mediaRecorder.stop(),this._isRecordingAudio=!1)}async _sendAudioToTranscribe(o){this._isLoading=!0,this._loadingMessage="Transkribiere Sprachnotiz...";try{const a=await new Promise((u,g)=>{const m=new FileReader;m.onloadend=()=>u(m.result),m.onerror=g,m.readAsDataURL(o)}),n=await fetch(`${this._backendUrl}/api/gemini/transcribe`,{method:"POST",headers:this._getHeaders(),body:JSON.stringify({audioBase64:a})});if(!n.ok)throw new Error("Transkriptionsanfrage fehlgeschlagen.");const d=await n.json();d.text&&(this._description=this._description?`${this._description} ${d.text}`:d.text)}catch{alert("Fehler bei der Transkription der Sprachnotiz.")}finally{this._isLoading=!1}}_getHeaders(){const o={"Content-Type":"application/json"};this._apiKey&&(o["x-gemini-api-key"]=this._apiKey);const a=localStorage.getItem("electrocheck_perplexity_api_key");return a&&(o["x-perplexity-api-key"]=a),o}async _processOfflineQueue(){const o=[...this._offlineQueue];for(const a of o)try{const n=await this._aiService.getDiagnosis(a.image,a.description);this._saveToHistory(n),this._offlineQueue=this._offlineQueue.filter(d=>d.timestamp!==a.timestamp),localStorage.setItem("electrocheck_queue",JSON.stringify(this._offlineQueue))}catch(n){console.warn("Fehler bei der Abarbeitung der Offline-Queue. Pausiere Übertragung.",n);break}this._offlineQueue.length===0&&alert("Alle Offline-Diagnosen verarbeitet.")}async _handlePhotoCaptured(o){this._capturedImage=o,await this.updateComplete,this._initDrawingCanvas()}_handleMultimeterScanRequested(){this._isMultimeterCameraOpen=!0}async _handleMultimeterPhotoCaptured(o){const a=o.detail.image;this._isMultimeterCameraOpen=!1,this._isLoading=!0,this._loadingMessage="Lese Multimeter ab...";try{const n=await this._aiService.scanMultimeter(a);if(console.log("Multimeter-Scan Ergebnis:",n),n.value!==null&&n.value!==void 0){const d=n.value.toString(),u=(n.unit||"").toUpperCase();u.includes("KOHM")||u.includes("MOHM")||u==="OHM"?n.value>10?this._rIso=d:this._rPe=d:u.includes("MA")||u==="A"?this._iLeak=d:u==="V"&&alert(`Spannungsmesswert erkannt: ${d} V. Bitte tragen Sie diesen Wert manuell ein.`),alert(`Messwert erfolgreich eingelesen: ${d} ${n.unit}`)}else alert("Messwert konnte auf dem Bild nicht eindeutig erkannt werden.")}catch(n){alert("Fehler beim Ablesen des Multimeters: "+n.message)}finally{this._isLoading=!1}}async _handleOcrScanRequested(o){this._capturedImage=o,this._isLoading=!0,this._loadingMessage="Lese Typenschild...";try{if(this._ocrResult=await this._aiService.scanTypePlate(o),this._ocrResult&&this._ocrResult.componentName){const a=await gh(this._ocrResult.componentName);this._offlineDatasheetMatch=a}}catch{alert("OCR-Fehler. Stellen Sie sicher, dass das Typenschild gut lesbar ist.")}finally{this._isLoading=!1}}_handleQrDetected(o){this._description=`[Anlage erkannt: ${o}]
`+this._description,alert(`✅ Code erkannt: ${o}`)}_openOfflineDatasheet(){if(!this._offlineDatasheetMatch)return;const o=document.createElement("a");o.href=this._offlineDatasheetMatch.fileData,o.download=this._offlineDatasheetMatch.name,o.click()}_saveToHistory(o){this._history=[o,...this._history.slice(0,9)],localStorage.setItem("electrocheck_history_v2",JSON.stringify(this._history))}_handleSaveSettings(o){this._apiKey=o.detail.apiKey,this._perplexityApiKey=o.detail.perplexityApiKey||"",this._backendUrl=o.detail.backendUrl,this._inspectorName=o.detail.inspectorName||"",this._inspectorCompany=o.detail.inspectorCompany||"",this._inspectorId=o.detail.inspectorId||"",localStorage.setItem("electrocheck_gemini_api_key",this._apiKey),localStorage.setItem("electrocheck_perplexity_api_key",this._perplexityApiKey),localStorage.setItem("electrocheck_backend_url",this._backendUrl),localStorage.setItem("electrocheck_inspector_name",this._inspectorName),localStorage.setItem("electrocheck_inspector_company",this._inspectorCompany),localStorage.setItem("electrocheck_inspector_id",this._inspectorId),this._isSettingsOpen=!1,alert("Einstellungen gespeichert!")}_handleAccessibleChanged(o){const a=o.detail.checked;this._accessibleMode=a,localStorage.setItem("electrocheck_accessible_mode",a?"true":"false"),a?(document.documentElement.classList.add("accessible-reading"),this.classList.add("accessible-reading")):(document.documentElement.classList.remove("accessible-reading"),this.classList.remove("accessible-reading"))}_acceptGDPR(){this._gdprCheckbox&&(this._hasAcceptedGDPR=!0,localStorage.setItem("electrocheck_gdpr_accepted","true"))}_exportData(){try{const o=JSON.stringify(this._history,null,2),a="data:application/json;charset=utf-8,"+encodeURIComponent(o),n="electrocheck_diagnosen_export.json",d=document.createElement("a");d.setAttribute("href",a),d.setAttribute("download",n),d.click()}catch{alert("Fehler beim Exportieren der Daten.")}}_deleteData(){confirm("Möchten Sie wirklich alle lokalen Daten (Historie, Einstellungen, API-Schlüssel) unwiderruflich löschen?")&&(localStorage.clear(),this._history=[],this._apiKey="",this._backendUrl="http://localhost:3000",this._inspectorName="",this._inspectorCompany="",this._inspectorId="",this._hasAcceptedGDPR=!1,this._isSettingsOpen=!1,this._safetyConfirmed=!1,this._safetyChecks=[!1,!1,!1,!1,!1],alert("Alle lokalen Daten wurden gelöscht."),window.location.reload())}async _createTicket(){if(this._result){this._isTicketCreating=!0;try{const o=await this._ticketService.createMaintenanceTicket(this._result);alert(`✅ Ticket erfolgreich erstellt: ${o}`)}catch(o){alert(o.message)}finally{this._isTicketCreating=!1}}}async _shareResult(){if(!this._result)return;const o=`Diagnose: ${this._result.deviceName}
Defekt: ${this._result.identifiedDefect}`;navigator.share?await navigator.share({title:"ElectroCheck AI",text:o}):(await navigator.clipboard.writeText(o),alert("In Zwischenablage kopiert!"))}async _openPdfPreview(){this._isLoading=!0,this._loadingMessage="Lade Vorschau...";try{const o=this._rPe.trim()||this._rIso.trim()||this._iLeak.trim()?{rPe:this._rPe,rIso:this._rIso,iLeak:this._iLeak,status:this._getDguvStatus().message,details:this._getDguvStatus().details,signatureUrl:this._signatureUrl}:void 0,a=to(this._result,this._drawCanvas?this._drawCanvas.toDataURL("image/jpeg",.8):this._capturedImage,this._disclaimerText,o,{name:this._inspectorName,company:this._inspectorCompany,id:this._inspectorId});if(!a)return;const n=await mi(()=>import("./pdfmake-Bzle68jV.js").then(m=>m.p),[]),d=await mi(()=>import("./vfs_fonts-DUQyFO-Z.js").then(m=>m.v),[]),u=n.default||n,g=d.default||d;u.vfs=g.pdfMake?g.pdfMake.vfs:g.vfs,u.createPdf(a).getBlob(m=>{this._pdfPreviewUrl=URL.createObjectURL(m),this._isLoading=!1,this.requestUpdate()})}catch{alert("Fehler bei der PDF-Vorschau."),this._isLoading=!1}}async _downloadPdfDirectly(){var o;try{const a=this._rPe.trim()||this._rIso.trim()||this._iLeak.trim()?{rPe:this._rPe,rIso:this._rIso,iLeak:this._iLeak,status:this._getDguvStatus().message,details:this._getDguvStatus().details,signatureUrl:this._signatureUrl}:void 0,n=to(this._result,this._drawCanvas?this._drawCanvas.toDataURL("image/jpeg",.8):this._capturedImage,this._disclaimerText,a,{name:this._inspectorName,company:this._inspectorCompany,id:this._inspectorId});if(!n)return;const d=await mi(()=>import("./pdfmake-Bzle68jV.js").then(C=>C.p),[]),u=await mi(()=>import("./vfs_fonts-DUQyFO-Z.js").then(C=>C.v),[]),g=d.default||d,m=u.default||u;g.vfs=m.pdfMake?m.pdfMake.vfs:m.vfs,g.createPdf(n).download(`Protokoll_${(o=this._result)==null?void 0:o.deviceName.replace(/\s+/g,"_")}.pdf`)}catch{alert("Fehler beim PDF Download.")}}_toggleChecklistStep(o,a){if(!this._result||!this._result.actionSteps)return;const n=a.target.checked;this._result.actionSteps[o].completed=n,this.requestUpdate(),this._saveToHistory(this._result)}_getChecklistProgress(){return!this._result||!this._result.actionSteps||this._result.actionSteps.length===0?0:this._result.actionSteps.filter(a=>a.completed).length/this._result.actionSteps.length}_handleGuidedStepCompleted(o){this._result&&this._result.actionSteps&&(this._result.actionSteps[o].completed=!0,this.requestUpdate(),this._saveToHistory(this._result))}_handleGuidedRepairCompleted(){alert("🎉 Glückwunsch! Sie haben alle Reparatur-Schritte abgeschlossen."),this._guidedRepairStepIndex=null}_renderGDPRConsent(){return M`
      <div class="modal-overlay">
        <div class="card consent-card">
          <h3 class="consent-title">🔒 DSGVO-Einwilligung & Datenschutz</h3>
          <p class="consent-text">
            Um eine KI-gestützte Fehlerdiagnose durchführen zu können, müssen Ihre Eingaben (Fehlerbeschreibungen und ggf. aufgenommene Bilder) zur Analyse an die Google Gemini API übertragen werden.
          </p>
          <p class="consent-text">
            Ihre Daten werden über eine gesicherte SSL-Verbindung an unseren Backend-Proxy übermittelt. Es findet keine dauerhafte Speicherung Ihrer Bilddateien auf unseren Servern statt. Die App speichert Ihre Diagnosehistorie sowie Einstellungen ausschließlich lokal in Ihrem Webbrowser (Local Storage).
          </p>
          
          <label class="consent-checkbox-label">
            <input 
              type="checkbox" 
              .checked="${this._gdprCheckbox}" 
              @change="${o=>{this._gdprCheckbox=o.target.checked,this.requestUpdate()}}"
            />
            <span>
              Ich willige in die Verarbeitung meiner Daten zum Zwecke der KI-Diagnose ein und bestätige, dass ich die <a href="#" @click="${o=>{o.preventDefault(),this._showLegalModal="privacy"}}">Datenschutzerklärung</a> gelesen habe.
            </span>
          </label>
          
          <vaadin-button
            theme="primary"
            class="w-100"
            ?disabled="${!this._gdprCheckbox}"
            @click="${this._acceptGDPR}"
            >Einwilligen & Fortfahren</vaadin-button
          >
        </div>
      </div>
    `}_renderLegalModal(){if(!this._showLegalModal)return M``;const o=this._showLegalModal==="imprint";return M`
      <div class="modal-overlay" style="z-index: 3000;">
        <div class="card settings-card" style="max-height: 85vh; overflow-y: auto;">
          <h3 class="m-0">${o?"Impressum":"Datenschutzerklärung"}</h3>
          <div style="margin: 1.25rem 0; font-size: 0.875rem; line-height: 1.6; text-align: left; color: var(--text-secondary);">
            ${o?M`
                  <p><strong>ElectroCheck AI</strong></p>
                  <p>Eine innovative Anwendung für Elektrofachkräfte.</p>
                  <p><strong>Vertreten durch:</strong><br>Schengi / ElektroCheck AI GmbH</p>
                  <p><strong>Kontakt:</strong><br>E-Mail: info@electrocheck-ai.de<br>Webseite: www.electrocheck-ai.de</p>
                  <p><strong>Haftungsausschluss:</strong><br>Die Inhalte dieser App (insb. die KI-Diagnosen) wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Arbeiten an elektrischen Anlagen dürfen nur durch qualifizierte Elektrofachkräfte unter Einhaltung der 5 Sicherheitsregeln durchgeführt werden.</p>
                `:M`
                  <p><strong>1. Datenschutz auf einen Blick</strong></p>
                  <p>Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten innerhalb unserer App.</p>
                  
                  <p><strong>2. Datenverarbeitung durch die Gemini-API</strong></p>
                  <p>Für die Analyse von Fehlern übermittelt diese App Bilddaten und Beschreibungen per HTTPS-Verschlüsselung an unseren Backend-Proxy, welcher die Anfrage an die Google Gemini API weiterleitet. Die Bilddaten werden temporär übertragen und nicht dauerhaft serverseitig gespeichert.</p>
                  
                  <p><strong>3. Lokale Speicherung (Local Storage)</strong></p>
                  <p>Diese App nutzt den lokalen Speicher Ihres Browsers, um Ihre Diagnosehistorie, Ihre Einstellungen und Ihren API-Schlüssel zu speichern. Diese Daten verlassen Ihr Gerät nicht, es sei denn, Sie führen eine Diagnoseanfrage durch. Sie können diese Daten in den Einstellungen jederzeit löschen.</p>
                  
                  <p><strong>4. Ihre Rechte</strong></p>
                  <p>Sie haben das Recht auf Auskunft, Datenübertragbarkeit und Löschung Ihrer Daten. Nutzen Sie hierfür die Export- und Löschfunktionen in den Einstellungen.</p>
                `}
          </div>
          <div class="modal-actions">
            <vaadin-button theme="primary" @click="${()=>this._showLegalModal=null}">Schließen</vaadin-button>
          </div>
        </div>
      </div>
    `}_renderFooter(){return M`
      <footer class="app-footer">
        <div>© ${new Date().getFullYear()} ElectroCheck AI. Alle Rechte vorbehalten.</div>
        <div class="footer-links">
          <a href="#" @click="${o=>{o.preventDefault(),this._showLegalModal="imprint"}}">Impressum</a>
          <span>|</span>
          <a href="#" @click="${o=>{o.preventDefault(),this._showLegalModal="privacy"}}">Datenschutzerklärung</a>
        </div>
      </footer>
    `}_renderSkeleton(){return M`
      <div class="card skeleton-card">
        <div class="tech-spinner"></div>
        <p class="loading-text">${this._loadingMessage}</p>
        <vaadin-button
          theme="tertiary error"
          @click="${this._cancelAnalysis}"
          class="mt-1"
          >❌ Abbrechen</vaadin-button
        >
      </div>
    `}render(){return this._hasAcceptedGDPR?M`
      <div class="container">
        <header class="header">
          <div class="header-left"> 
            <h2 class="header-title">ElectroCheck AI</h2>
            <vaadin-button
              theme="${this._activeTab==="diagnose"?"primary":"secondary"}"
              @click="${()=>this._activeTab="diagnose"}"
              >📷 Diagnose</vaadin-button
            >
            <vaadin-button
              theme="${this._activeTab==="thermal"?"primary":"secondary"}"
              @click="${()=>this._activeTab="thermal"}"
              >🔥 Wärmebild</vaadin-button
            >
            <vaadin-button
              theme="${this._activeTab==="dashboard"?"primary":"secondary"}"
              @click="${()=>this._activeTab="dashboard"}"
              >📊 Dashboard</vaadin-button
            >
            <vaadin-button
              theme="${this._activeTab==="calculator"?"primary":"secondary"}"
              @click="${()=>this._activeTab="calculator"}"
              >⚡ Rechner</vaadin-button
            >
            <vaadin-button
              theme="${this._activeTab==="rules"?"primary":"secondary"}"
              @click="${()=>this._activeTab="rules"}"
              >📚 VDE-Regeln</vaadin-button
            >
            <vaadin-button
              theme="${this._activeTab==="schematic"?"primary":"secondary"}"
              @click="${()=>this._activeTab="schematic"}"
              >📐 Schaltplan</vaadin-button
            >
            <vaadin-button
              theme="${this._activeTab==="gbu"?"primary":"secondary"}"
              @click="${()=>this._activeTab="gbu"}"
              >🛡️ GBU</vaadin-button
            >
          </div>
          <div style="display: flex; gap: 4px;">
            <vaadin-button
              theme="${this._isGloveMode?"primary":"secondary"}"
              @click="${this._toggleGloveMode}"
              title="Handschuh-Modus (Große Buttons)"
              >🧤</vaadin-button
            >
            <vaadin-button
              theme="${this._isHighContrast?"primary":"secondary"}"
              @click="${this._toggleHighContrast}"
              title="High-Contrast Outdoor Modus"
              >🔆</vaadin-button
            >
            <vaadin-button
              theme="secondary" 
              @click="${()=>this._isSettingsOpen=!0}"
              aria-label="Einstellungen"
              >⚙️</vaadin-button
            >
            <vaadin-button 
              theme="secondary" 
              @click="${this._toggleTheme}"
              aria-label="Farbschema wechseln"
              >${this._isDarkMode?"☀️":"🌙"}</vaadin-button
            >
          </div>
        </header>

        ${this._isOnline?"":M`<div class="offline-banner" role="status">📶 Offline-Modus aktiv</div>`}
        
        ${this._activeTab==="dashboard"?M`<ec-dashboard .history="${this._history}"></ec-dashboard>`:this._activeTab==="thermal"?M`<ec-thermal-analysis></ec-thermal-analysis>`:this._activeTab==="calculator"?M`<ec-vde-calculator></ec-vde-calculator>`:this._activeTab==="rules"?M`<ec-vde-rules></ec-vde-rules>`:this._activeTab==="schematic"?M`<ec-schematic-analyzer></ec-schematic-analyzer>`:this._activeTab==="gbu"?M`<ec-gbu-generator></ec-gbu-generator>`:M`
              ${this._safetyConfirmed?M`
                    ${this._guidedRepairStepIndex!==null?M`
                          <ec-guided-repair
                            .result="${this._result}"
                            .stepIndex="${this._guidedRepairStepIndex}"
                            @step-changed="${o=>this._guidedRepairStepIndex=o.detail.index}"
                            @step-completed="${o=>this._handleGuidedStepCompleted(o.detail.index)}"
                            @repair-completed="${this._handleGuidedRepairCompleted}"
                            @close="${()=>this._guidedRepairStepIndex=null}"
                          ></ec-guided-repair>
                        `:M`
                          ${this._capturedImage?M`
                                <div class="media-box" style="background: var(--surface);">
                                  <canvas
                                    id="drawing-canvas"
                                    @pointerdown="${this._handlePointerDown}"
                                    @pointermove="${this._handlePointerMove}"
                                    @pointerup="${()=>this._isDrawing=!1}"
                                    aria-label="Diagnosebild mit Markierungsfunktion"
                                  ></canvas>
                                  <div
                                    class="camera-hint"
                                    role="status"
                                    aria-live="polite"
                                  >
                                    ✏️ <strong>Markiere den Fehler</strong> auf dem Bild für eine genauere Analyse
                                  </div>
                                </div>
                              `:M`
                                <ec-camera-capture
                                  .isLoading="${this._isLoading}"
                                  @photo-captured="${o=>this._handlePhotoCaptured(o.detail.image)}"
                                  @ocr-scan-requested="${o=>this._handleOcrScanRequested(o.detail.image)}"
                                  @qr-detected="${o=>this._handleQrDetected(o.detail.text)}"
                                ></ec-camera-capture>
                              `}

                          <div class="card mt-1">
                            <vaadin-text-area
                              class="w-100"
                              label="Problembeschreibung"
                              helper-text="Beschreibe den Defekt oder diktiere per Mikrofon"
                              .value="${this._description}"
                              @value-changed="${o=>this._description=o.detail.value}"
                            >
                              <div slot="suffix" style="display: flex; gap: 4px; align-items: center;">
                                <vaadin-button
                                  theme="tertiary"
                                  @click="${this._toggleVoice}"
                                  aria-label="Echtzeit-Spracheingabe"
                                  title="Echtzeit-Transkription"
                                >
                                  ${this._isListening?"🛑":"🎤"}
                                </vaadin-button>
                                <vaadin-button
                                  theme="${this._isRecordingAudio?"tertiary error":"tertiary"}"
                                  @click="${this._toggleAudioRecording}"
                                  aria-label="Audioaufnahme transkribieren"
                                  title="Sprachnotiz aufnehmen & transkribieren"
                                >
                                  ${this._isRecordingAudio?"🛑 Stopp":"🎙️ Diktieren"}
                                </vaadin-button>
                              </div>
                            </vaadin-text-area>

                            <div class="action-bar mt-1">
                              ${this._capturedImage?M`
                                    <vaadin-button
                                      theme="secondary"
                                      @click="${this._reset}"
                                      >🔄 Bild entfernen</vaadin-button
                                    >
                                    <vaadin-button
                                      theme="primary"
                                      class="flex-1"
                                      ?disabled="${this._isLoading||!this._description.trim()&&!this._capturedImage}"
                                      @click="${this._startAnalysis}"
                                      >⚡ Analyse starten</vaadin-button
                                    >
                                  `:""}
                            </div>
                          </div>

                          <div class="card mt-1">
                            <ec-ble-multimeter
                              @ble-measurement-received="${this._handleBleMeasurement}"
                            ></ec-ble-multimeter>

                            <ec-dguv-form
                              .rPe="${this._rPe}"
                              .rIso="${this._rIso}"
                              .iLeak="${this._iLeak}"
                              @rpe-changed="${o=>this._rPe=o.detail.value}"
                              @riso-changed="${o=>this._rIso=o.detail.value}"
                              @ileak-changed="${o=>this._iLeak=o.detail.value}"
                            ></ec-dguv-form>
                          </div>

                          ${this._isLoading?this._renderSkeleton():""}
                          ${this._result&&!this._isLoading?M`
                                <div class="card result-card mt-1">
                                  <h3 class="m-0">✅ ${this._result.deviceName}</h3>
                                  <div class="difficulty-stars">
                                    <span class="stat-label">Schwierigkeit: </span>
                                    ${"★".repeat(this._result.repairDifficulty||1)}${"☆".repeat(5-(this._result.repairDifficulty||1))}
                                  </div>
                                  <p>
                                    <span class="label">Defekt:</span><br />${this._result.identifiedDefect}
                                  </p>
                                  <p>
                                    <span class="label">Empfehlung:</span><br />${this._result.recommendation}
                                  </p>

                                  ${this._result.actionSteps&&this._result.actionSteps.length>0?M`
                                        <div
                                          style="margin: 1.5rem 0; padding: 1rem; background: var(--bg-app); border-radius: 8px; border: 1px solid var(--border);"
                                        >
                                          <div
                                            style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;"
                                          >
                                            <span
                                              class="label"
                                              style="color: var(--primary);"
                                              >🛠️ Reparatur-Checkliste:</span
                                            >
                                            <span
                                              style="font-size: 0.85rem; font-weight: bold; color: var(--text-muted);"
                                              >${Math.round(this._getChecklistProgress()*100)}%</span
                                            >
                                          </div>
                                          <vaadin-progress-bar
                                            value="${this._getChecklistProgress()}"
                                            style="margin-bottom: 1rem;"
                                          ></vaadin-progress-bar>
                                          
                                          <vaadin-button
                                            theme="primary success"
                                            class="w-100 mb-1"
                                            style="margin-bottom: 12px;"
                                            @click="${()=>{this._guidedRepairStepIndex=0}}"
                                            >🛠️ Geführte Reparatur starten (Vorlesen)</vaadin-button
                                          >

                                          <div
                                            style="display: flex; flex-direction: column; gap: 0.5rem;"
                                          >
                                            ${this._result.actionSteps.map((o,a)=>M`
                                                <label
                                                  style="display: flex; gap: 12px; align-items: flex-start; cursor: pointer; padding: 10px; background: var(--bg-card); border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid var(--border); transition: all 0.2s ease;"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    .checked="${o.completed}"
                                                    @change="${n=>this._toggleChecklistStep(a,n)}"
                                                    style="margin-top: 4px; transform: scale(1.2);"
                                                  />
                                                  <span
                                                    style="line-height: 1.4; transition: all 0.2s ease; ${o.completed?"text-decoration: line-through; color: var(--text-muted); opacity: 0.6;":"color: var(--text-primary); font-weight: 500;"}"
                                                  >
                                                    ${o.text}
                                                  </span>
                                                </label>
                                              `)}
                                          </div>
                                        </div>
                                      `:""}

                                  <ec-dguv-form
                                    .rPe="${this._rPe}"
                                    .rIso="${this._rIso}"
                                    .iLeak="${this._iLeak}"
                                    .isScanning="${this._isLoading&&this._isMultimeterCameraOpen}"
                                    @scan-multimeter-requested="${this._handleMultimeterScanRequested}"
                                    @dguv-changed="${o=>{this._rPe=o.detail.rPe,this._rIso=o.detail.rIso,this._iLeak=o.detail.iLeak,this._signatureUrl=o.detail.signatureUrl,this.requestUpdate()}}"
                                  ></ec-dguv-form>

                                  ${this._result.location?M`
                                        <div class="mt-1">
                                          <span class="label"
                                            >📍 Anlagenstandort:</span
                                          ><br />
                                          ${this._result.location.includes("Lat:")?M`<a
                                                href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this._result.location.replace("Lat: ","").replace(", Lng: ",","))}"
                                                target="_blank"
                                                class="link-primary"
                                                >${this._result.location}</a
                                              >`:M`<span class="text-danger-small"
                                                >${this._result.location}</span
                                              >`}
                                        </div>
                                      `:""}
                                  ${this._result.customerExperience?M`<div class="experience-box">
                                        💡
                                        <strong>Techniker-Erfahrung:</strong> ${this._result.customerExperience}
                                      </div>`:""}
                                  ${this._result.additionalTips&&this._result.additionalTips.length>0?M`
                                        <div class="mt-1">
                                          <span class="label">Profi-Tipps:</span>
                                          <ul class="tips-list">
                                            ${this._result.additionalTips.map(o=>M`<li>${o}</li>`)}
                                          </ul>
                                        </div>
                                      `:""}

                                  <div class="legal-box">
                                    <p class="legal-text">
                                      <strong>⚖️ Rechtlicher Hinweis:</strong><br />
                                      ${this._result.disclaimer||this._disclaimerText}
                                    </p>
                                  </div>

                                  <div class="result-actions">
                                    <vaadin-button
                                      theme="secondary"
                                      @click="${this._openPdfPreview}"
                                      >📄 Vorschau</vaadin-button
                                    >
                                    <vaadin-button
                                      theme="primary success"
                                      @click="${this._downloadPdfDirectly}"
                                      >💾 PDF</vaadin-button
                                    >
                                    <vaadin-button
                                      theme="primary"
                                      @click="${this._shareResult}"
                                      >📲 Teilen</vaadin-button
                                    >
                                    <vaadin-button
                                      theme="secondary"
                                      @click="${this._createTicket}"
                                      ?disabled="${this._isTicketCreating}"
                                      >${this._isTicketCreating?"⏳...":"🎫 Ticket"}</vaadin-button
                                    >
                                    <vaadin-button
                                      theme="secondary"
                                      @click="${this._runPerplexitySearch}"
                                      ?disabled="${this._isSearchingPerplexity||!this._isOnline}"
                                      style="grid-column: span 2;"
                                      >🔍 ${this._isSearchingPerplexity?"Suche läuft...":"Perplexity Web-Suche"}</vaadin-button
                                    >
                                  </div>

                                  ${this._perplexityResult?M`
                                        <div class="card mt-1" style="border-left: 4px solid var(--primary); text-align: left; background: var(--bg-app); box-shadow: var(--shadow-sm);">
                                          <h4 style="margin: 0 0 8px 0; font-weight: bold; color: var(--primary); display: flex; align-items: center; gap: 6px;">
                                            🌐 Perplexity Web-Recherche:
                                          </h4>
                                          <div style="font-size: 0.85rem; line-height: 1.6; color: var(--text-primary);">
                                            ${ud(this._formatMarkdown(this._perplexityResult))}
                                          </div>
                                        </div>
                                      `:""}

                                  ${this._result.sparePartSearchTerm?M`
                                        <div style="margin-top: 16px; text-align: left;">
                                          <div style="font-size: 0.85rem; font-weight: bold; color: var(--text-secondary); margin-bottom: 6px;">
                                            🛒 Ersatzteil bestellen bei:
                                          </div>
                                          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
                                            <a
                                              href="https://www.amazon.de/s?k=${encodeURIComponent(this._result.sparePartSearchTerm)}"
                                              target="_blank"
                                              class="no-underline"
                                            >
                                              <vaadin-button class="btn-amazon" style="width: 100%;"
                                                >🛒 Amazon</vaadin-button
                                              >
                                            </a>
                                            <a
                                              href="https://www.conrad.de/de/search.html?search=${encodeURIComponent(this._result.sparePartSearchTerm)}"
                                              target="_blank"
                                              class="no-underline"
                                            >
                                              <vaadin-button theme="secondary" style="width: 100%;"
                                                >🏢 Conrad B2B</vaadin-button
                                              >
                                            </a>
                                            <a
                                              href="https://de.rs-online.com/web/c/?searchTerm=${encodeURIComponent(this._result.sparePartSearchTerm)}"
                                              target="_blank"
                                              class="no-underline"
                                            >
                                              <vaadin-button theme="secondary" style="width: 100%;"
                                                >🔧 RS Components</vaadin-button
                                              >
                                            </a>
                                            <a
                                              href="https://www.reichelt.de/de/de/index.html?ACTION=446&LA=4&q=${encodeURIComponent(this._result.sparePartSearchTerm)}"
                                              target="_blank"
                                              class="no-underline"
                                            >
                                              <vaadin-button theme="secondary" style="width: 100%;"
                                                >🔌 Reichelt</vaadin-button
                                              >
                                            </a>
                                            <a
                                              href="https://www.mercateo.com/q?query=${encodeURIComponent(this._result.sparePartSearchTerm)}"
                                              target="_blank"
                                              class="no-underline"
                                            >
                                              <vaadin-button theme="secondary" style="width: 100%;"
                                                >📦 Mercateo</vaadin-button
                                              >
                                            </a>
                                          </div>
                                        </div>
                                      `:""}
                                </div>
                              `:""}

                          ${this._ocrResult&&!this._isLoading?M`
                                <div class="card ocr-card mt-1">
                                  <h3 class="m-0">
                                    🔍 ${this._ocrResult.componentName}
                                  </h3>
                                  <p>${this._ocrResult.extractedText}</p>
                                  
                                  <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
                                    <a
                                      href="${this._ocrResult.datasheetSearchUrl}"
                                      target="_blank"
                                      class="no-underline"
                                      style="flex: 1; min-width: 120px;"
                                    >
                                      <vaadin-button theme="secondary" style="width: 100%;"
                                        >🌐 Datenblatt suchen</vaadin-button
                                      >
                                    </a>
                                    
                                    ${this._offlineDatasheetMatch?M`
                                          <vaadin-button
                                            theme="primary success"
                                            @click="${this._openOfflineDatasheet}"
                                            style="flex: 1; min-width: 120px;"
                                          >
                                            📄 Offline-Datenblatt öffnen
                                          </vaadin-button>
                                        `:""}
                                  </div>
                                </div>
                              `:""}

                          ${this._history.length>0?M`
                                <div class="history-section mt-1-5">
                                  <div class="history-header">
                                    🗂️ Letzte Diagnosen
                                  </div>
                                  ${this._history.map(o=>M`
                                      <div
                                        class="history-item"
                                        @click="${()=>{this._result=o,this._perplexityResult=null,o.boundingBoxes&&o.boundingBoxes.length>0&&this.updateComplete.then(()=>this._drawAIBoundingBoxes())}}"
                                      >
                                        <span class="history-title"
                                          >${o.deviceName}</span
                                        >
                                        <span class="history-defect"
                                          >${o.identifiedDefect}</span
                                        >
                                      </div>
                                    `)}
                                </div>
                              `:""}
                        `}
                  `:M`
                    <ec-safety-checks
                      .safetyChecks="${this._safetyChecks}"
                      @safety-changed="${this._handleSafetyChanged}"
                      @safety-confirmed="${this._handleSafetyConfirmed}"
                    ></ec-safety-checks>
                  `}
            `}
        
        ${this._renderFooter()}

        ${this._pdfPreviewUrl?M`
              <div class="modal-overlay">
                <div class="card pdf-modal-card">
                  <h3 class="m-0">📄 PDF Protokoll Vorschau</h3>
                  <iframe src="${this._pdfPreviewUrl}" class="pdf-iframe"></iframe>
                  <div class="modal-actions">
                    <vaadin-button
                      theme="primary"
                      @click="${()=>{URL.revokeObjectURL(this._pdfPreviewUrl),this._pdfPreviewUrl=null}}"
                      >Schließen</vaadin-button
                    >
                  </div>
                </div>
              </div>
            `:""}

        ${this._isSettingsOpen?M`
              <ec-settings
                .apiKey="${this._apiKey}"
                .perplexityApiKey="${this._perplexityApiKey}"
                .backendUrl="${this._backendUrl}"
                .accessibleMode="${this._accessibleMode}"
                .inspectorName="${this._inspectorName}"
                .inspectorCompany="${this._inspectorCompany}"
                .inspectorId="${this._inspectorId}"
                @close="${()=>this._isSettingsOpen=!1}"
                @save-settings="${this._handleSaveSettings}"
                @accessible-changed="${this._handleAccessibleChanged}"
                @export-data="${this._exportData}"
                @delete-data="${this._deleteData}"
              ></ec-settings>
            `:""}

        ${this._isMultimeterCameraOpen?M`
              <div class="modal-overlay">
                <div class="card" style="max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
                  <h3 class="m-0" style="margin-bottom: 8px;">📸 Multimeter-Scan</h3>
                  <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">
                    Zentrieren Sie die Messwertanzeige des Multimeters auf dem Bildschirm. Die KI versucht den Wert automatisch abzulesen.
                  </p>
                  <ec-camera-capture
                    .isLoading="${this._isLoading}"
                    @photo-captured="${this._handleMultimeterPhotoCaptured}"
                    @camera-stopped="${()=>this._isMultimeterCameraOpen=!1}"
                  ></ec-camera-capture>
                  <div class="modal-actions" style="margin-top: 12px; justify-content: flex-end;">
                    <vaadin-button
                      theme="tertiary"
                      @click="${()=>this._isMultimeterCameraOpen=!1}"
                      >Schließen</vaadin-button
                    >
                  </div>
                </div>
              </div>
            `:""}

        ${this._renderLegalModal()}
      </div>
    `:M`
        <div class="container">
          ${this._renderGDPRConsent()}
          ${this._renderLegalModal()}
        </div>
      `}};re.styles=ti(vi);se([F()],re.prototype,"_isDarkMode",2);se([F()],re.prototype,"_isSettingsOpen",2);se([F()],re.prototype,"_isLoading",2);se([F()],re.prototype,"_isTicketCreating",2);se([F()],re.prototype,"_isOnline",2);se([F()],re.prototype,"_loadingMessage",2);se([F()],re.prototype,"_isListening",2);se([F()],re.prototype,"_safetyConfirmed",2);se([F()],re.prototype,"_safetyChecks",2);se([F()],re.prototype,"_activeTab",2);se([F()],re.prototype,"_isGloveMode",2);se([F()],re.prototype,"_isHighContrast",2);se([F()],re.prototype,"_rPe",2);se([F()],re.prototype,"_rIso",2);se([F()],re.prototype,"_iLeak",2);se([F()],re.prototype,"_capturedImage",2);se([F()],re.prototype,"_selectedBoxLabel",2);se([$r("#drawing-canvas")],re.prototype,"_drawCanvas",2);se([F()],re.prototype,"_description",2);se([F()],re.prototype,"_result",2);se([F()],re.prototype,"_ocrResult",2);se([F()],re.prototype,"_history",2);se([F()],re.prototype,"_offlineQueue",2);se([F()],re.prototype,"_pdfPreviewUrl",2);se([F()],re.prototype,"_apiKey",2);se([F()],re.prototype,"_perplexityApiKey",2);se([F()],re.prototype,"_perplexityResult",2);se([F()],re.prototype,"_isSearchingPerplexity",2);se([F()],re.prototype,"_offlineDatasheetMatch",2);se([F()],re.prototype,"_signatureUrl",2);se([F()],re.prototype,"_isRecordingAudio",2);se([F()],re.prototype,"_backendUrl",2);se([F()],re.prototype,"_accessibleMode",2);se([F()],re.prototype,"_hasAcceptedGDPR",2);se([F()],re.prototype,"_inspectorName",2);se([F()],re.prototype,"_inspectorCompany",2);se([F()],re.prototype,"_inspectorId",2);se([F()],re.prototype,"_gdprCheckbox",2);se([F()],re.prototype,"_guidedRepairStepIndex",2);se([F()],re.prototype,"_showLegalModal",2);se([F()],re.prototype,"_isMultimeterCameraOpen",2);re=se([st("ec-diagnosis-wizard")],re);var _u=Object.defineProperty,vu=Object.getOwnPropertyDescriptor,jo=(o,a,n,d)=>{for(var u=d>1?void 0:d?vu(a,n):a,g=o.length-1,m;g>=0;g--)(m=o[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&_u(a,n,u),u};let _n=class extends Te{constructor(){super(...arguments),this._hasStarted=!1}render(){return M`
      <main>
        ${this._hasStarted?M`
              <ec-diagnosis-wizard></ec-diagnosis-wizard>`:M`
              <ec-welcome 
                @start="${this._handleStart}">
              </ec-welcome>`}
      </main>
    `}_handleStart(){this._hasStarted=!0}};_n.styles=Ge`
    :host {
      display: block;
      min-height: 100vh;
      background-color: var(--bg-app);
      color: var(--text-primary);
      margin: 0 auto;
      font-family: var(--font-sans);
      transition: background-color 0.3s, color 0.3s;
    }
    main {
      width: 100%;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
  `;jo([F()],_n.prototype,"_hasStarted",2);_n=jo([st("app-root")],_n);export{$s as W,kr as c,qu as g};
