var bl=Object.defineProperty;var sa=l=>{throw TypeError(l)};var _l=(l,a,n)=>a in l?bl(l,a,{enumerable:!0,configurable:!0,writable:!0,value:n}):l[a]=n;var aa=(l,a,n)=>_l(l,typeof a!="symbol"?a+"":a,n),Hn=(l,a,n)=>a.has(l)||sa("Cannot "+n);var ge=(l,a,n)=>(Hn(l,a,"read from private field"),n?n.call(l):a.get(l)),Rt=(l,a,n)=>a.has(l)?sa("Cannot add the same private member more than once"):a instanceof WeakSet?a.add(l):a.set(l,n),Ii=(l,a,n,d)=>(Hn(l,a,"write to private field"),d?d.call(l,n):a.set(l,n),n),Xt=(l,a,n)=>(Hn(l,a,"access private method"),n);(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const u of document.querySelectorAll('link[rel="modulepreload"]'))d(u);new MutationObserver(u=>{for(const g of u)if(g.type==="childList")for(const m of g.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&d(m)}).observe(document,{childList:!0,subtree:!0});function n(u){const g={};return u.integrity&&(g.integrity=u.integrity),u.referrerPolicy&&(g.referrerPolicy=u.referrerPolicy),u.crossOrigin==="use-credentials"?g.credentials="include":u.crossOrigin==="anonymous"?g.credentials="omit":g.credentials="same-origin",g}function d(u){if(u.ep)return;u.ep=!0;const g=n(u);fetch(u.href,g)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const tn=globalThis,vs=tn.ShadowRoot&&(tn.ShadyCSS===void 0||tn.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ys=Symbol(),oa=new WeakMap;let Ja=class{constructor(a,n,d){if(this._$cssResult$=!0,d!==ys)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=a,this.t=n}get styleSheet(){let a=this.o;const n=this.t;if(vs&&a===void 0){const d=n!==void 0&&n.length===1;d&&(a=oa.get(n)),a===void 0&&((this.o=a=new CSSStyleSheet).replaceSync(this.cssText),d&&oa.set(n,a))}return a}toString(){return this.cssText}};const Jt=l=>new Ja(typeof l=="string"?l:l+"",void 0,ys),Qe=(l,...a)=>{const n=l.length===1?l[0]:a.reduce((d,u,g)=>d+(m=>{if(m._$cssResult$===!0)return m.cssText;if(typeof m=="number")return m;throw Error("Value passed to 'css' function must be a 'css' function result: "+m+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(u)+l[g+1],l[0]);return new Ja(n,l,ys)},eo=(l,a)=>{if(vs)l.adoptedStyleSheets=a.map(n=>n instanceof CSSStyleSheet?n:n.styleSheet);else for(const n of a){const d=document.createElement("style"),u=tn.litNonce;u!==void 0&&d.setAttribute("nonce",u),d.textContent=n.cssText,l.appendChild(d)}},la=vs?l=>l:l=>l instanceof CSSStyleSheet?(a=>{let n="";for(const d of a.cssRules)n+=d.cssText;return Jt(n)})(l):l;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:vl,defineProperty:yl,getOwnPropertyDescriptor:Cl,getOwnPropertyNames:Al,getOwnPropertySymbols:El,getPrototypeOf:Sl}=Object,pi=globalThis,ca=pi.trustedTypes,Il=ca?ca.emptyScript:"",Gn=pi.reactiveElementPolyfillSupport,Tr=(l,a)=>l,sn={toAttribute(l,a){switch(a){case Boolean:l=l?Il:null;break;case Object:case Array:l=l==null?l:JSON.stringify(l)}return l},fromAttribute(l,a){let n=l;switch(a){case Boolean:n=l!==null;break;case Number:n=l===null?null:Number(l);break;case Object:case Array:try{n=JSON.parse(l)}catch{n=null}}return n}},pn=(l,a)=>!vl(l,a),da={attribute:!0,type:String,converter:sn,reflect:!1,useDefault:!1,hasChanged:pn};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),pi.litPropertyMetadata??(pi.litPropertyMetadata=new WeakMap);let Zi=class extends HTMLElement{static addInitializer(a){this._$Ei(),(this.l??(this.l=[])).push(a)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(a,n=da){if(n.state&&(n.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(a)&&((n=Object.create(n)).wrapped=!0),this.elementProperties.set(a,n),!n.noAccessor){const d=Symbol(),u=this.getPropertyDescriptor(a,d,n);u!==void 0&&yl(this.prototype,a,u)}}static getPropertyDescriptor(a,n,d){const{get:u,set:g}=Cl(this.prototype,a)??{get(){return this[n]},set(m){this[n]=m}};return{get:u,set(m){const C=u==null?void 0:u.call(this);g==null||g.call(this,m),this.requestUpdate(a,C,d)},configurable:!0,enumerable:!0}}static getPropertyOptions(a){return this.elementProperties.get(a)??da}static _$Ei(){if(this.hasOwnProperty(Tr("elementProperties")))return;const a=Sl(this);a.finalize(),a.l!==void 0&&(this.l=[...a.l]),this.elementProperties=new Map(a.elementProperties)}static finalize(){if(this.hasOwnProperty(Tr("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Tr("properties"))){const n=this.properties,d=[...Al(n),...El(n)];for(const u of d)this.createProperty(u,n[u])}const a=this[Symbol.metadata];if(a!==null){const n=litPropertyMetadata.get(a);if(n!==void 0)for(const[d,u]of n)this.elementProperties.set(d,u)}this._$Eh=new Map;for(const[n,d]of this.elementProperties){const u=this._$Eu(n,d);u!==void 0&&this._$Eh.set(u,n)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(a){const n=[];if(Array.isArray(a)){const d=new Set(a.flat(1/0).reverse());for(const u of d)n.unshift(la(u))}else a!==void 0&&n.push(la(a));return n}static _$Eu(a,n){const d=n.attribute;return d===!1?void 0:typeof d=="string"?d:typeof a=="string"?a.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var a;this._$ES=new Promise(n=>this.enableUpdating=n),this._$AL=new Map,this._$E_(),this.requestUpdate(),(a=this.constructor.l)==null||a.forEach(n=>n(this))}addController(a){var n;(this._$EO??(this._$EO=new Set)).add(a),this.renderRoot!==void 0&&this.isConnected&&((n=a.hostConnected)==null||n.call(a))}removeController(a){var n;(n=this._$EO)==null||n.delete(a)}_$E_(){const a=new Map,n=this.constructor.elementProperties;for(const d of n.keys())this.hasOwnProperty(d)&&(a.set(d,this[d]),delete this[d]);a.size>0&&(this._$Ep=a)}createRenderRoot(){const a=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return eo(a,this.constructor.elementStyles),a}connectedCallback(){var a;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(a=this._$EO)==null||a.forEach(n=>{var d;return(d=n.hostConnected)==null?void 0:d.call(n)})}enableUpdating(a){}disconnectedCallback(){var a;(a=this._$EO)==null||a.forEach(n=>{var d;return(d=n.hostDisconnected)==null?void 0:d.call(n)})}attributeChangedCallback(a,n,d){this._$AK(a,d)}_$ET(a,n){var g;const d=this.constructor.elementProperties.get(a),u=this.constructor._$Eu(a,d);if(u!==void 0&&d.reflect===!0){const m=(((g=d.converter)==null?void 0:g.toAttribute)!==void 0?d.converter:sn).toAttribute(n,d.type);this._$Em=a,m==null?this.removeAttribute(u):this.setAttribute(u,m),this._$Em=null}}_$AK(a,n){var g,m;const d=this.constructor,u=d._$Eh.get(a);if(u!==void 0&&this._$Em!==u){const C=d.getPropertyOptions(u),A=typeof C.converter=="function"?{fromAttribute:C.converter}:((g=C.converter)==null?void 0:g.fromAttribute)!==void 0?C.converter:sn;this._$Em=u;const _=A.fromAttribute(n,C.type);this[u]=_??((m=this._$Ej)==null?void 0:m.get(u))??_,this._$Em=null}}requestUpdate(a,n,d,u=!1,g){var m;if(a!==void 0){const C=this.constructor;if(u===!1&&(g=this[a]),d??(d=C.getPropertyOptions(a)),!((d.hasChanged??pn)(g,n)||d.useDefault&&d.reflect&&g===((m=this._$Ej)==null?void 0:m.get(a))&&!this.hasAttribute(C._$Eu(a,d))))return;this.C(a,n,d)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(a,n,{useDefault:d,reflect:u,wrapped:g},m){d&&!(this._$Ej??(this._$Ej=new Map)).has(a)&&(this._$Ej.set(a,m??n??this[a]),g!==!0||m!==void 0)||(this._$AL.has(a)||(this.hasUpdated||d||(n=void 0),this._$AL.set(a,n)),u===!0&&this._$Em!==a&&(this._$Eq??(this._$Eq=new Set)).add(a))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(n){Promise.reject(n)}const a=this.scheduleUpdate();return a!=null&&await a,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var d;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[g,m]of this._$Ep)this[g]=m;this._$Ep=void 0}const u=this.constructor.elementProperties;if(u.size>0)for(const[g,m]of u){const{wrapped:C}=m,A=this[g];C!==!0||this._$AL.has(g)||A===void 0||this.C(g,void 0,m,A)}}let a=!1;const n=this._$AL;try{a=this.shouldUpdate(n),a?(this.willUpdate(n),(d=this._$EO)==null||d.forEach(u=>{var g;return(g=u.hostUpdate)==null?void 0:g.call(u)}),this.update(n)):this._$EM()}catch(u){throw a=!1,this._$EM(),u}a&&this._$AE(n)}willUpdate(a){}_$AE(a){var n;(n=this._$EO)==null||n.forEach(d=>{var u;return(u=d.hostUpdated)==null?void 0:u.call(d)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(a)),this.updated(a)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(a){return!0}update(a){this._$Eq&&(this._$Eq=this._$Eq.forEach(n=>this._$ET(n,this[n]))),this._$EM()}updated(a){}firstUpdated(a){}};Zi.elementStyles=[],Zi.shadowRootOptions={mode:"open"},Zi[Tr("elementProperties")]=new Map,Zi[Tr("finalized")]=new Map,Gn==null||Gn({ReactiveElement:Zi}),(pi.reactiveElementVersions??(pi.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Nr=globalThis,ha=l=>l,an=Nr.trustedTypes,ua=an?an.createPolicy("lit-html",{createHTML:l=>l}):void 0,to="$lit$",hi=`lit$${Math.random().toFixed(9).slice(2)}$`,io="?"+hi,Tl=`<${io}>`,Pi=document,Or=()=>Pi.createComment(""),Rr=l=>l===null||typeof l!="object"&&typeof l!="function",Cs=Array.isArray,Nl=l=>Cs(l)||typeof(l==null?void 0:l[Symbol.iterator])=="function",Wn=`[ 	
\f\r]`,Cr=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,fa=/-->/g,ga=/>/g,Ti=RegExp(`>|${Wn}(?:([^\\s"'>=/]+)(${Wn}*=${Wn}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),pa=/'/g,ma=/"/g,ro=/^(?:script|style|textarea|title)$/i,Ol=l=>(a,...n)=>({_$litType$:l,strings:a,values:n}),L=Ol(1),Bi=Symbol.for("lit-noChange"),He=Symbol.for("lit-nothing"),xa=new WeakMap,Ni=Pi.createTreeWalker(Pi,129);function no(l,a){if(!Cs(l)||!l.hasOwnProperty("raw"))throw Error("invalid template strings array");return ua!==void 0?ua.createHTML(a):a}const Rl=(l,a)=>{const n=l.length-1,d=[];let u,g=a===2?"<svg>":a===3?"<math>":"",m=Cr;for(let C=0;C<n;C++){const A=l[C];let _,k,I=-1,$=0;for(;$<A.length&&(m.lastIndex=$,k=m.exec(A),k!==null);)$=m.lastIndex,m===Cr?k[1]==="!--"?m=fa:k[1]!==void 0?m=ga:k[2]!==void 0?(ro.test(k[2])&&(u=RegExp("</"+k[2],"g")),m=Ti):k[3]!==void 0&&(m=Ti):m===Ti?k[0]===">"?(m=u??Cr,I=-1):k[1]===void 0?I=-2:(I=m.lastIndex-k[2].length,_=k[1],m=k[3]===void 0?Ti:k[3]==='"'?ma:pa):m===ma||m===pa?m=Ti:m===fa||m===ga?m=Cr:(m=Ti,u=void 0);const X=m===Ti&&l[C+1].startsWith("/>")?" ":"";g+=m===Cr?A+Tl:I>=0?(d.push(_),A.slice(0,I)+to+A.slice(I)+hi+X):A+hi+(I===-2?C:X)}return[no(l,g+(l[n]||"<?>")+(a===2?"</svg>":a===3?"</math>":"")),d]};class kr{constructor({strings:a,_$litType$:n},d){let u;this.parts=[];let g=0,m=0;const C=a.length-1,A=this.parts,[_,k]=Rl(a,n);if(this.el=kr.createElement(_,d),Ni.currentNode=this.el.content,n===2||n===3){const I=this.el.content.firstChild;I.replaceWith(...I.childNodes)}for(;(u=Ni.nextNode())!==null&&A.length<C;){if(u.nodeType===1){if(u.hasAttributes())for(const I of u.getAttributeNames())if(I.endsWith(to)){const $=k[m++],X=u.getAttribute(I).split(hi),pe=/([.?@])?(.*)/.exec($);A.push({type:1,index:g,name:pe[2],strings:X,ctor:pe[1]==="."?Dl:pe[1]==="?"?Ml:pe[1]==="@"?Pl:mn}),u.removeAttribute(I)}else I.startsWith(hi)&&(A.push({type:6,index:g}),u.removeAttribute(I));if(ro.test(u.tagName)){const I=u.textContent.split(hi),$=I.length-1;if($>0){u.textContent=an?an.emptyScript:"";for(let X=0;X<$;X++)u.append(I[X],Or()),Ni.nextNode(),A.push({type:2,index:++g});u.append(I[$],Or())}}}else if(u.nodeType===8)if(u.data===io)A.push({type:2,index:g});else{let I=-1;for(;(I=u.data.indexOf(hi,I+1))!==-1;)A.push({type:7,index:g}),I+=hi.length-1}g++}}static createElement(a,n){const d=Pi.createElement("template");return d.innerHTML=a,d}}function tr(l,a,n=l,d){var m,C;if(a===Bi)return a;let u=d!==void 0?(m=n._$Co)==null?void 0:m[d]:n._$Cl;const g=Rr(a)?void 0:a._$litDirective$;return(u==null?void 0:u.constructor)!==g&&((C=u==null?void 0:u._$AO)==null||C.call(u,!1),g===void 0?u=void 0:(u=new g(l),u._$AT(l,n,d)),d!==void 0?(n._$Co??(n._$Co=[]))[d]=u:n._$Cl=u),u!==void 0&&(a=tr(l,u._$AS(l,a.values),u,d)),a}class kl{constructor(a,n){this._$AV=[],this._$AN=void 0,this._$AD=a,this._$AM=n}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(a){const{el:{content:n},parts:d}=this._$AD,u=((a==null?void 0:a.creationScope)??Pi).importNode(n,!0);Ni.currentNode=u;let g=Ni.nextNode(),m=0,C=0,A=d[0];for(;A!==void 0;){if(m===A.index){let _;A.type===2?_=new Mr(g,g.nextSibling,this,a):A.type===1?_=new A.ctor(g,A.name,A.strings,this,a):A.type===6&&(_=new Bl(g,this,a)),this._$AV.push(_),A=d[++C]}m!==(A==null?void 0:A.index)&&(g=Ni.nextNode(),m++)}return Ni.currentNode=Pi,u}p(a){let n=0;for(const d of this._$AV)d!==void 0&&(d.strings!==void 0?(d._$AI(a,d,n),n+=d.strings.length-2):d._$AI(a[n])),n++}}class Mr{get _$AU(){var a;return((a=this._$AM)==null?void 0:a._$AU)??this._$Cv}constructor(a,n,d,u){this.type=2,this._$AH=He,this._$AN=void 0,this._$AA=a,this._$AB=n,this._$AM=d,this.options=u,this._$Cv=(u==null?void 0:u.isConnected)??!0}get parentNode(){let a=this._$AA.parentNode;const n=this._$AM;return n!==void 0&&(a==null?void 0:a.nodeType)===11&&(a=n.parentNode),a}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(a,n=this){a=tr(this,a,n),Rr(a)?a===He||a==null||a===""?(this._$AH!==He&&this._$AR(),this._$AH=He):a!==this._$AH&&a!==Bi&&this._(a):a._$litType$!==void 0?this.$(a):a.nodeType!==void 0?this.T(a):Nl(a)?this.k(a):this._(a)}O(a){return this._$AA.parentNode.insertBefore(a,this._$AB)}T(a){this._$AH!==a&&(this._$AR(),this._$AH=this.O(a))}_(a){this._$AH!==He&&Rr(this._$AH)?this._$AA.nextSibling.data=a:this.T(Pi.createTextNode(a)),this._$AH=a}$(a){var g;const{values:n,_$litType$:d}=a,u=typeof d=="number"?this._$AC(a):(d.el===void 0&&(d.el=kr.createElement(no(d.h,d.h[0]),this.options)),d);if(((g=this._$AH)==null?void 0:g._$AD)===u)this._$AH.p(n);else{const m=new kl(u,this),C=m.u(this.options);m.p(n),this.T(C),this._$AH=m}}_$AC(a){let n=xa.get(a.strings);return n===void 0&&xa.set(a.strings,n=new kr(a)),n}k(a){Cs(this._$AH)||(this._$AH=[],this._$AR());const n=this._$AH;let d,u=0;for(const g of a)u===n.length?n.push(d=new Mr(this.O(Or()),this.O(Or()),this,this.options)):d=n[u],d._$AI(g),u++;u<n.length&&(this._$AR(d&&d._$AB.nextSibling,u),n.length=u)}_$AR(a=this._$AA.nextSibling,n){var d;for((d=this._$AP)==null?void 0:d.call(this,!1,!0,n);a!==this._$AB;){const u=ha(a).nextSibling;ha(a).remove(),a=u}}setConnected(a){var n;this._$AM===void 0&&(this._$Cv=a,(n=this._$AP)==null||n.call(this,a))}}class mn{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(a,n,d,u,g){this.type=1,this._$AH=He,this._$AN=void 0,this.element=a,this.name=n,this._$AM=u,this.options=g,d.length>2||d[0]!==""||d[1]!==""?(this._$AH=Array(d.length-1).fill(new String),this.strings=d):this._$AH=He}_$AI(a,n=this,d,u){const g=this.strings;let m=!1;if(g===void 0)a=tr(this,a,n,0),m=!Rr(a)||a!==this._$AH&&a!==Bi,m&&(this._$AH=a);else{const C=a;let A,_;for(a=g[0],A=0;A<g.length-1;A++)_=tr(this,C[d+A],n,A),_===Bi&&(_=this._$AH[A]),m||(m=!Rr(_)||_!==this._$AH[A]),_===He?a=He:a!==He&&(a+=(_??"")+g[A+1]),this._$AH[A]=_}m&&!u&&this.j(a)}j(a){a===He?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,a??"")}}class Dl extends mn{constructor(){super(...arguments),this.type=3}j(a){this.element[this.name]=a===He?void 0:a}}class Ml extends mn{constructor(){super(...arguments),this.type=4}j(a){this.element.toggleAttribute(this.name,!!a&&a!==He)}}class Pl extends mn{constructor(a,n,d,u,g){super(a,n,d,u,g),this.type=5}_$AI(a,n=this){if((a=tr(this,a,n,0)??He)===Bi)return;const d=this._$AH,u=a===He&&d!==He||a.capture!==d.capture||a.once!==d.once||a.passive!==d.passive,g=a!==He&&(d===He||u);u&&this.element.removeEventListener(this.name,this,d),g&&this.element.addEventListener(this.name,this,a),this._$AH=a}handleEvent(a){var n;typeof this._$AH=="function"?this._$AH.call(((n=this.options)==null?void 0:n.host)??this.element,a):this._$AH.handleEvent(a)}}class Bl{constructor(a,n,d){this.element=a,this.type=6,this._$AN=void 0,this._$AM=n,this.options=d}get _$AU(){return this._$AM._$AU}_$AI(a){tr(this,a)}}const Xn=Nr.litHtmlPolyfillSupport;Xn==null||Xn(kr,Mr),(Nr.litHtmlVersions??(Nr.litHtmlVersions=[])).push("3.3.2");const Ll=(l,a,n)=>{const d=(n==null?void 0:n.renderBefore)??a;let u=d._$litPart$;if(u===void 0){const g=(n==null?void 0:n.renderBefore)??null;d._$litPart$=u=new Mr(a.insertBefore(Or(),g),g,void 0,n??{})}return u._$AI(l),u};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Di=globalThis;let ke=class extends Zi{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var n;const a=super.createRenderRoot();return(n=this.renderOptions).renderBefore??(n.renderBefore=a.firstChild),a}update(a){const n=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(a),this._$Do=Ll(n,this.renderRoot,this.renderOptions)}connectedCallback(){var a;super.connectedCallback(),(a=this._$Do)==null||a.setConnected(!0)}disconnectedCallback(){var a;super.disconnectedCallback(),(a=this._$Do)==null||a.setConnected(!1)}render(){return Bi}};var qa;ke._$litElement$=!0,ke.finalized=!0,(qa=Di.litElementHydrateSupport)==null||qa.call(Di,{LitElement:ke});const jn=Di.litElementPolyfillSupport;jn==null||jn({LitElement:ke});(Di.litElementVersions??(Di.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const bt=l=>(a,n)=>{n!==void 0?n.addInitializer(()=>{customElements.define(l,a)}):customElements.define(l,a)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Fl={attribute:!0,type:String,converter:sn,reflect:!1,hasChanged:pn},Ul=(l=Fl,a,n)=>{const{kind:d,metadata:u}=n;let g=globalThis.litPropertyMetadata.get(u);if(g===void 0&&globalThis.litPropertyMetadata.set(u,g=new Map),d==="setter"&&((l=Object.create(l)).wrapped=!0),g.set(n.name,l),d==="accessor"){const{name:m}=n;return{set(C){const A=a.get.call(this);a.set.call(this,C),this.requestUpdate(m,A,l,!0,C)},init(C){return C!==void 0&&this.C(m,void 0,l,C),C}}}if(d==="setter"){const{name:m}=n;return function(C){const A=this[m];a.call(this,C),this.requestUpdate(m,A,l,!0,C)}}throw Error("Unsupported decorator location: "+d)};function Je(l){return(a,n)=>typeof n=="object"?Ul(l,a,n):((d,u,g)=>{const m=u.hasOwnProperty(g);return u.constructor.createProperty(g,d),m?Object.getOwnPropertyDescriptor(u,g):void 0})(l,a,n)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function H(l){return Je({...l,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const zl=(l,a,n)=>(n.configurable=!0,n.enumerable=!0,Reflect.decorate&&typeof a!="object"&&Object.defineProperty(l,a,n),n);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Pr(l,a){return(n,d,u)=>{const g=m=>{var C;return((C=m.renderRoot)==null?void 0:C.querySelector(l))??null};return zl(n,d,{get(){return g(this)}})}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */window.Vaadin||(window.Vaadin={});var Qa;(Qa=window.Vaadin).featureFlags||(Qa.featureFlags={});function Vl(l){return l.replace(/-[a-z]/gu,a=>a[1].toUpperCase())}const jt={};function sr(l,a="25.1.0"){if(Object.defineProperty(l,"version",{get(){return a}}),l.experimental){const d=typeof l.experimental=="string"?l.experimental:`${Vl(l.is.split("-").slice(1).join("-"))}Component`;if(!window.Vaadin.featureFlags[d]&&!jt[d]){jt[d]=new Set,jt[d].add(l),Object.defineProperty(window.Vaadin.featureFlags,d,{get(){return jt[d].size===0},set(u){u&&jt[d].size>0&&(jt[d].forEach(g=>{customElements.define(g.is,g)}),jt[d].clear())}});return}else if(jt[d]){jt[d].add(l);return}}const n=customElements.get(l.is);if(!n)customElements.define(l.is,l);else{const d=n.version;d&&l.version&&d===l.version?console.warn(`The component ${l.is} has been loaded twice`):console.error(`Tried to define ${l.is} version ${l.version} when version ${n.version} is already in use. Something will probably break.`)}}const $l=/\/\*[\*!]\s+vaadin-dev-mode:start([\s\S]*)vaadin-dev-mode:end\s+\*\*\//i,rn=window.Vaadin&&window.Vaadin.Flow&&window.Vaadin.Flow.clients;function Hl(){function l(){return!0}return so(l)}function Gl(){try{return Wl()?!0:Xl()?rn?!jl():!Hl():!1}catch{return!1}}function Wl(){return localStorage.getItem("vaadin.developmentmode.force")}function Xl(){return["localhost","127.0.0.1"].indexOf(window.location.hostname)>=0}function jl(){return!!(rn&&Object.keys(rn).map(a=>rn[a]).filter(a=>a.productionMode).length>0)}function so(l,a){if(typeof l!="function")return;const n=$l.exec(l.toString());if(n)try{l=new Function(n[1])}catch(d){console.log("vaadin-development-mode-detector: uncommentAndRun() failed",d)}return l(a)}window.Vaadin=window.Vaadin||{};const wa=function(l,a){if(window.Vaadin.developmentMode)return so(l,a)};window.Vaadin.developmentMode===void 0&&(window.Vaadin.developmentMode=Gl());function Kl(){/*! vaadin-dev-mode:start
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

  vaadin-dev-mode:end **/}const Yl=function(){if(typeof wa=="function")return wa(Kl)};/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */let ba=0,ao=0;const Qi=[];let as=!1;function Zl(){as=!1;const l=Qi.length;for(let a=0;a<l;a++){const n=Qi[a];if(n)try{n()}catch(d){setTimeout(()=>{throw d})}}Qi.splice(0,l),ao+=l}const ql={after(l){return{run(a){return window.setTimeout(a,l)},cancel(a){window.clearTimeout(a)}}},run(l,a){return window.setTimeout(l,a)},cancel(l){window.clearTimeout(l)}},Ql={run(l){return window.requestAnimationFrame(l)},cancel(l){window.cancelAnimationFrame(l)}},Jl={run(l){return window.requestIdleCallback?window.requestIdleCallback(l):window.setTimeout(l,16)},cancel(l){window.cancelIdleCallback?window.cancelIdleCallback(l):window.clearTimeout(l)}},ec={run(l){as||(as=!0,queueMicrotask(()=>Zl())),Qi.push(l);const a=ba;return ba+=1,a},cancel(l){const a=l-ao;if(a>=0){if(!Qi[a])throw new Error(`invalid async handle: ${l}`);Qi[a]=null}}};/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const os=new Set;class ir{static debounce(a,n,d){return a instanceof ir?a._cancelAsync():a=new ir,a.setConfig(n,d),a}constructor(){this._asyncModule=null,this._callback=null,this._timer=null}setConfig(a,n){this._asyncModule=a,this._callback=n,this._timer=this._asyncModule.run(()=>{this._timer=null,os.delete(this),this._callback()})}cancel(){this.isActive()&&(this._cancelAsync(),os.delete(this))}_cancelAsync(){this.isActive()&&(this._asyncModule.cancel(this._timer),this._timer=null)}flush(){this.isActive()&&(this.cancel(),this._callback())}isActive(){return this._timer!=null}}function tc(l){os.add(l)}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Kt=[];function ls(l,a,n=l.getAttribute("dir")){a?l.setAttribute("dir",a):n!=null&&l.removeAttribute("dir")}function cs(){return document.documentElement.getAttribute("dir")}function ic(){const l=cs();Kt.forEach(a=>{ls(a,l)})}const rc=new MutationObserver(ic);rc.observe(document.documentElement,{attributes:!0,attributeFilter:["dir"]});const oo=l=>class extends l{static get properties(){return{dir:{type:String,value:"",reflectToAttribute:!0,converter:{fromAttribute:n=>n||"",toAttribute:n=>n===""?null:n}}}}get __isRTL(){return this.getAttribute("dir")==="rtl"}connectedCallback(){super.connectedCallback(),(!this.hasAttribute("dir")||this.__restoreSubscription)&&(this.__subscribe(),ls(this,cs(),null))}attributeChangedCallback(n,d,u){if(super.attributeChangedCallback(n,d,u),n!=="dir")return;const g=cs(),m=u===g&&Kt.indexOf(this)===-1,C=!u&&d&&Kt.indexOf(this)===-1;m||C?(this.__subscribe(),ls(this,g,u)):u!==g&&d===g&&this.__unsubscribe()}disconnectedCallback(){super.disconnectedCallback(),this.__restoreSubscription=Kt.includes(this),this.__unsubscribe()}_valueToNodeAttribute(n,d,u){u==="dir"&&d===""&&!n.hasAttribute("dir")||super._valueToNodeAttribute(n,d,u)}_attributeToProperty(n,d,u){n==="dir"&&!d?this.dir="":super._attributeToProperty(n,d,u)}__subscribe(){Kt.includes(this)||Kt.push(this)}__unsubscribe(){Kt.includes(this)&&Kt.splice(Kt.indexOf(this),1)}};/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */window.Vaadin||(window.Vaadin={});window.Vaadin.registrations||(window.Vaadin.registrations=[]);window.Vaadin.developmentModeCallback||(window.Vaadin.developmentModeCallback={});window.Vaadin.developmentModeCallback["vaadin-usage-statistics"]=function(){Yl()};let Kn;const _a=new Set,Br=l=>class extends oo(l){static _ensureRegistrations(){const{is:n}=this;if(n&&!_a.has(n)){window.Vaadin.registrations.push(this),_a.add(n);const d=window.Vaadin.developmentModeCallback;d&&(Kn=ir.debounce(Kn,Jl,()=>{d["vaadin-usage-statistics"]()}),tc(Kn))}}constructor(){super(),document.doctype===null&&console.warn('Vaadin components require the "standards mode" declaration. Please add <!DOCTYPE html> to the HTML document.'),this.constructor._ensureRegistrations()}},lo=new WeakMap;function nc(l,a){let n=a;for(;n;){if(lo.get(n)===l)return!0;n=Object.getPrototypeOf(n)}return!1}function Pt(l){return a=>{if(nc(l,a))return a;const n=l(a);return lo.set(n,l),n}}/**
 * @license
 * Copyright (c) 2023 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */function sc(l,a){return l.split(".").reduce((n,d)=>n?n[d]:void 0,a)}function ac(l,a,n){const d=l.split("."),u=d.pop(),g=d.reduce((m,C)=>m[C],n);g[u]=a}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Yn={},oc=/([A-Z])/gu;function va(l){return Yn[l]||(Yn[l]=l.replace(oc,"-$1").toLowerCase()),Yn[l]}function ya(l){return l[0].toUpperCase()+l.substring(1)}function Zn(l){const[a,n]=l.split("("),d=n.replace(")","").split(",").map(u=>u.trim());return{method:a,observerProps:d}}function qn(l,a){return Object.prototype.hasOwnProperty.call(l,a)||(l[a]=new Map(l[a])),l[a]}const lc=l=>{class a extends l{static createProperty(d,u){[String,Boolean,Number,Array].includes(u)&&(u={type:u}),u&&u.reflectToAttribute&&(u.reflect=!0),super.createProperty(d,u)}static getOrCreateMap(d){return qn(this,d)}static finalize(){if(window.litIssuedWarnings&&(window.litIssuedWarnings.add("no-override-create-property"),window.litIssuedWarnings.add("no-override-get-property-descriptor")),super.finalize(),Array.isArray(this.observers)){const d=this.getOrCreateMap("__complexObservers");this.observers.forEach(u=>{const{method:g,observerProps:m}=Zn(u);d.set(g,m)})}}static addCheckedInitializer(d){super.addInitializer(u=>{u instanceof this&&d(u)})}static getPropertyDescriptor(d,u,g){const m=super.getPropertyDescriptor(d,u,g);let C=m;if(this.getOrCreateMap("__propKeys").set(d,u),g.sync&&(C={get:m.get,set(A){const _=this[d];pn(A,_)&&(this[u]=A,this.requestUpdate(d,_,g),this.hasUpdated&&this.performUpdate())},configurable:!0,enumerable:!0}),g.readOnly){const A=C.set;this.addCheckedInitializer(_=>{_[`_set${ya(d)}`]=function(k){A.call(_,k)}}),C={get:C.get,set(){},configurable:!0,enumerable:!0}}if("value"in g&&this.addCheckedInitializer(A=>{const _=typeof g.value=="function"?g.value.call(A):g.value;g.readOnly?A[`_set${ya(d)}`](_):A[d]=_}),g.observer){const A=g.observer;this.getOrCreateMap("__observers").set(d,A),this.addCheckedInitializer(_=>{_[A]||console.warn(`observer method ${A} not defined`)})}if(g.notify){if(!this.__notifyProps)this.__notifyProps=new Set;else if(!this.hasOwnProperty("__notifyProps")){const A=this.__notifyProps;this.__notifyProps=new Set(A)}this.__notifyProps.add(d)}if(g.computed){const A=`__assignComputed${d}`,_=Zn(g.computed);this.prototype[A]=function(...k){this[d]=this[_.method](...k)},this.getOrCreateMap("__computedObservers").set(A,_.observerProps)}return g.attribute||(g.attribute=va(d)),C}static get polylitConfig(){return{asyncFirstRender:!1}}connectedCallback(){super.connectedCallback();const{polylitConfig:d}=this.constructor;!this.hasUpdated&&!d.asyncFirstRender&&this.performUpdate()}firstUpdated(){super.firstUpdated(),this.$||(this.$={}),this.renderRoot.querySelectorAll("[id]").forEach(d=>{this.$[d.id]=d})}ready(){}willUpdate(d){this.constructor.__computedObservers&&this.__runComplexObservers(d,this.constructor.__computedObservers)}updated(d){const u=this.__isReadyInvoked;this.__isReadyInvoked=!0,this.constructor.__observers&&this.__runObservers(d,this.constructor.__observers),this.constructor.__complexObservers&&this.__runComplexObservers(d,this.constructor.__complexObservers),this.__dynamicPropertyObservers&&this.__runDynamicObservers(d,this.__dynamicPropertyObservers),this.__dynamicMethodObservers&&this.__runComplexObservers(d,this.__dynamicMethodObservers),this.constructor.__notifyProps&&this.__runNotifyProps(d,this.constructor.__notifyProps),u||this.ready()}setProperties(d){Object.entries(d).forEach(([u,g])=>{const m=this.constructor.__propKeys.get(u),C=this[m];this[m]=g,this.requestUpdate(u,C)}),this.hasUpdated&&this.performUpdate()}_createMethodObserver(d){const u=qn(this,"__dynamicMethodObservers"),{method:g,observerProps:m}=Zn(d);u.set(g,m)}_createPropertyObserver(d,u){qn(this,"__dynamicPropertyObservers").set(u,d)}__runComplexObservers(d,u){u.forEach((g,m)=>{g.some(C=>d.has(C))&&(this[m]?this[m](...g.map(C=>this[C])):console.warn(`observer method ${m} not defined`))})}__runDynamicObservers(d,u){u.forEach((g,m)=>{d.has(g)&&this[m]&&this[m](this[g],d.get(g))})}__runObservers(d,u){d.forEach((g,m)=>{const C=u.get(m);C!==void 0&&this[C]&&this[C](this[m],g)})}__runNotifyProps(d,u){d.forEach((g,m)=>{u.has(m)&&this.dispatchEvent(new CustomEvent(`${va(m)}-changed`,{detail:{value:this[m]}}))})}_get(d,u){return sc(d,u)}_set(d,u,g){ac(d,u,g)}}return aa(a,"enabledWarnings",[]),a},ar=Pt(lc);/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */function As(l){return l?new Set(l.split(" ")):new Set}function xn(l){return l?[...l].join(" "):""}function co(l,a,n){const d=As(l.getAttribute(a));d.add(n),l.setAttribute(a,xn(d))}function cc(l,a,n){const d=As(l.getAttribute(a));if(d.delete(n),d.size===0){l.removeAttribute(a);return}l.setAttribute(a,xn(d))}function dc(l){return l.nodeType===Node.TEXT_NODE&&l.textContent.trim()===""}/**
 * @license
 * Copyright (c) 2023 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class hc{constructor(a,n,d){this.slot=a,this.callback=n,this.forceInitial=d,this._storedNodes=[],this._connected=!1,this._scheduled=!1,this._boundSchedule=()=>{this._schedule()},this.connect(),this._schedule()}connect(){this.slot.addEventListener("slotchange",this._boundSchedule),this._connected=!0}disconnect(){this.slot.removeEventListener("slotchange",this._boundSchedule),this._connected=!1}_schedule(){this._scheduled||(this._scheduled=!0,queueMicrotask(()=>{this.flush()}))}flush(){this._connected&&(this._scheduled=!1,this._processNodes())}_processNodes(){const a=this.slot.assignedNodes({flatten:!0});let n=[];const d=[],u=[];a.length&&(n=a.filter(g=>!this._storedNodes.includes(g))),this._storedNodes.length&&this._storedNodes.forEach((g,m)=>{const C=a.indexOf(g);C===-1?d.push(g):C!==m&&u.push(g)}),(n.length||d.length||u.length||this.forceInitial)&&this.callback({addedNodes:n,currentNodes:a,movedNodes:u,removedNodes:d}),this.forceInitial&&(this.forceInitial=!1),this._storedNodes=a}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */let uc=0;function fc(){return uc++}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class wn extends EventTarget{static generateId(a,n="default"){return`${n}-${a.localName}-${fc()}`}constructor(a,n,d,u={}){super();const{initializer:g,multiple:m,observe:C,useUniqueId:A,uniqueIdPrefix:_}=u;this.host=a,this.slotName=n,this.tagName=d,this.observe=typeof C=="boolean"?C:!0,this.multiple=typeof m=="boolean"?m:!1,this.slotInitializer=g,m&&(this.nodes=[]),A&&(this.defaultId=this.constructor.generateId(a,_||n))}hostConnected(){this.initialized||(this.multiple?this.initMultiple():this.initSingle(),this.observe&&this.observeSlot(),this.initialized=!0)}initSingle(){let a=this.getSlotChild();a?(this.node=a,this.initAddedNode(a)):(a=this.attachDefaultNode(),this.initNode(a))}initMultiple(){const a=this.getSlotChildren();if(a.length===0){const n=this.attachDefaultNode();n&&(this.nodes=[n],this.initNode(n))}else this.nodes=a,a.forEach(n=>{this.initAddedNode(n)})}attachDefaultNode(){const{host:a,slotName:n,tagName:d}=this;let u=this.defaultNode;return!u&&d&&(u=document.createElement(d),u instanceof Element&&(n!==""&&u.setAttribute("slot",n),this.defaultNode=u)),u&&(this.node=u,a.appendChild(u)),u}getSlotChildren(){const{slotName:a}=this;return Array.from(this.host.childNodes).filter(n=>n.nodeType===Node.ELEMENT_NODE&&n.hasAttribute("data-slot-ignore")?!1:n.nodeType===Node.ELEMENT_NODE&&n.slot===a||n.nodeType===Node.TEXT_NODE&&n.textContent.trim()&&a==="")}getSlotChild(){return this.getSlotChildren()[0]}initNode(a){const{slotInitializer:n}=this;n&&n(a,this.host)}initCustomNode(a){}teardownNode(a){}initAddedNode(a){a!==this.defaultNode&&(this.initCustomNode(a),this.initNode(a))}observeSlot(){const{slotName:a}=this,n=a===""?"slot:not([name])":`slot[name=${a}]`,d=this.host.shadowRoot.querySelector(n);this.__slotObserver=new hc(d,({addedNodes:u,removedNodes:g})=>{const m=this.multiple?this.nodes:[this.node],C=u.filter(A=>!dc(A)&&!m.includes(A)&&!(A.nodeType===Node.ELEMENT_NODE&&A.hasAttribute("data-slot-ignore")));g.length&&(this.nodes=m.filter(A=>!g.includes(A)),g.forEach(A=>{this.teardownNode(A)})),C&&C.length>0&&(this.multiple?(this.defaultNode&&this.defaultNode.remove(),this.nodes=[...m,...C].filter(A=>A!==this.defaultNode),C.forEach(A=>{this.initAddedNode(A)})):(this.node&&this.node.remove(),this.node=C[0],this.initAddedNode(this.node)))})}}/**
 * @license
 * Copyright (c) 2022 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Es extends wn{constructor(a){super(a,"tooltip"),this.setTarget(a),this.__onContentChange=this.__onContentChange.bind(this)}initCustomNode(a){a.target=this.target,this.ariaTarget!==void 0&&(a.ariaTarget=this.ariaTarget),this.context!==void 0&&(a.context=this.context),this.manual!==void 0&&(a.manual=this.manual),this.opened!==void 0&&(a.opened=this.opened),this.position!==void 0&&(a._position=this.position),this.shouldShow!==void 0&&(a.shouldShow=this.shouldShow),this.manual||this.host.setAttribute("has-tooltip",""),this.__notifyChange(a),a.addEventListener("content-changed",this.__onContentChange)}teardownNode(a){this.manual||this.host.removeAttribute("has-tooltip"),a.removeEventListener("content-changed",this.__onContentChange),this.__notifyChange(null)}setAriaTarget(a){this.ariaTarget=a;const n=this.node;n&&(n.ariaTarget=a)}setContext(a){this.context=a;const n=this.node;n&&(n.context=a)}setManual(a){this.manual=a;const n=this.node;n&&(n.manual=a)}setOpened(a){this.opened=a;const n=this.node;n&&(n.opened=a)}setPosition(a){this.position=a;const n=this.node;n&&(n._position=a)}setShouldShow(a){this.shouldShow=a;const n=this.node;n&&(n.shouldShow=a)}setTarget(a){this.target=a;const n=this.node;n&&(n.target=a)}__onContentChange(a){this.__notifyChange(a.target)}__notifyChange(a){this.dispatchEvent(new CustomEvent("tooltip-changed",{detail:{node:a}}))}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */var qt,ui,Ri,er,It,Sr,Ir;const Ls=class Ls extends EventTarget{constructor(n){super();Rt(this,It);Rt(this,qt);Rt(this,ui,new Set);Rt(this,Ri);Rt(this,er,!1);Ii(this,qt,n),Ii(this,Ri,new CSSStyleSheet)}observe(n){this.connect(),!ge(this,ui).has(n)&&(ge(this,ui).add(n),ge(this,Ri).replaceSync(`
      :root::before, :host::before {
        content: '' !important;
        position: absolute !important;
        top: -9999px !important;
        left: -9999px !important;
        visibility: hidden !important;
        transition: 1ms allow-discrete step-end !important;
        transition-property: ${[...ge(this,ui)].join(", ")} !important;
      }
    `))}connect(){ge(this,er)||(ge(this,qt).adoptedStyleSheets.unshift(ge(this,Ri)),ge(this,It,Ir).addEventListener("transitionstart",n=>Xt(this,It,Sr).call(this,n)),ge(this,It,Ir).addEventListener("transitionend",n=>Xt(this,It,Sr).call(this,n)),Ii(this,er,!0))}disconnect(){ge(this,ui).clear(),ge(this,qt).adoptedStyleSheets=ge(this,qt).adoptedStyleSheets.filter(n=>n!==ge(this,Ri)),ge(this,It,Ir).removeEventListener("transitionstart",Xt(this,It,Sr)),ge(this,It,Ir).removeEventListener("transitionend",Xt(this,It,Sr)),Ii(this,er,!1)}static for(n){return n.__cssPropertyObserver||(n.__cssPropertyObserver=new Ls(n)),n.__cssPropertyObserver}};qt=new WeakMap,ui=new WeakMap,Ri=new WeakMap,er=new WeakMap,It=new WeakSet,Sr=function(n){const{propertyName:d}=n;ge(this,ui).has(d)&&this.dispatchEvent(new CustomEvent("property-changed",{detail:{propertyName:d}}))},Ir=function(){return ge(this,qt).documentElement??ge(this,qt).host};let ds=Ls;/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */function gc(l){const{baseStyles:a,themeStyles:n,elementStyles:d,lumoInjector:u}=l.constructor,g=l.__lumoStyleSheet;return g&&(a||n)?[...u.includeBaseStyles?a:[],g,...n]:[g,...d].filter(Boolean)}function ho(l){eo(l.shadowRoot,gc(l))}function Ca(l,a){l.__lumoStyleSheet=a,ho(l)}function Qn(l){l.__lumoStyleSheet=void 0,ho(l)}/**
 * @license
 * Copyright (c) 2000 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Aa=new Set;function uo(l){Aa.has(l)||(Aa.add(l),console.warn(l))}/**
 * @license
 * Copyright (c) 2000 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Ea=new WeakMap;function Sa(l){try{return l.media.mediaText}catch{return uo('[LumoInjector] Browser denied to access property "mediaText" for some CSS rules, so they were skipped.'),""}}function pc(l){try{return l.cssRules}catch{return uo('[LumoInjector] Browser denied to access property "cssRules" for some CSS stylesheets, so they were skipped.'),[]}}function fo(l,a={tags:new Map,modules:new Map}){var n;for(const d of pc(l)){if(d instanceof CSSImportRule){const u=Sa(d);u.startsWith("lumo_")?a.modules.set(u,[...d.styleSheet.cssRules]):fo(d.styleSheet,a);continue}if(d instanceof CSSMediaRule){const u=Sa(d);u.startsWith("lumo_")&&a.modules.set(u,[...d.cssRules]);continue}if(d instanceof CSSStyleRule&&d.cssText.includes("-inject")){for(const u of d.style){const g=(n=u.match(/^--_lumo-(.*)-inject-modules$/u))==null?void 0:n[1];if(!g)continue;const m=d.style.getPropertyValue(u);a.tags.set(g,m.split(",").map(C=>C.trim().replace(/'|"/gu,"")))}continue}}return a}function mc(l){let a=new Map,n=new Map;for(const d of l){let u=Ea.get(d);u||(u=fo(d),Ea.set(d,u)),a=new Map([...a,...u.tags]),n=new Map([...n,...u.modules])}return{tags:a,modules:n}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */function go(l){return`--_lumo-${l.is}-inject`}var Dr,ki,fi,Qt,Ht,po,nn,mo;class xc{constructor(a=document){Rt(this,Ht);Rt(this,Dr);Rt(this,ki);Rt(this,fi,new Map);Rt(this,Qt,new Map);Ii(this,Dr,a),this.handlePropertyChange=this.handlePropertyChange.bind(this),Ii(this,ki,ds.for(a)),ge(this,ki).addEventListener("property-changed",this.handlePropertyChange)}disconnect(){ge(this,ki).removeEventListener("property-changed",this.handlePropertyChange),ge(this,fi).clear(),ge(this,Qt).values().forEach(a=>a.forEach(Qn))}forceUpdate(){for(const a of ge(this,fi).keys())Xt(this,Ht,nn).call(this,a)}componentConnected(a){const{lumoInjector:n}=a.constructor,{is:d}=n;ge(this,Qt).set(d,ge(this,Qt).get(d)??new Set),ge(this,Qt).get(d).add(a);const u=ge(this,fi).get(d);if(u){u.cssRules.length>0&&Ca(a,u);return}Xt(this,Ht,po).call(this,d);const g=go(n);ge(this,ki).observe(g)}componentDisconnected(a){var d;const{is:n}=a.constructor.lumoInjector;(d=ge(this,Qt).get(n))==null||d.delete(a),Qn(a)}handlePropertyChange(a){var u;const{propertyName:n}=a.detail,d=(u=n.match(/^--_lumo-(.*)-inject$/u))==null?void 0:u[1];d&&Xt(this,Ht,nn).call(this,d)}}Dr=new WeakMap,ki=new WeakMap,fi=new WeakMap,Qt=new WeakMap,Ht=new WeakSet,po=function(a){ge(this,fi).set(a,new CSSStyleSheet),Xt(this,Ht,nn).call(this,a)},nn=function(a){var m;const{tags:n,modules:d}=mc(ge(this,Ht,mo)),u=(n.get(a)??[]).flatMap(C=>d.get(C)??[]).map(C=>C.cssText).join(`
`),g=ge(this,fi).get(a);g.replaceSync(u),(m=ge(this,Qt).get(a))==null||m.forEach(C=>{u?Ca(C,g):Qn(C)})},mo=function(){let a=new Set;for(const n of[ge(this,Dr),document])a=a.union(new Set(n.styleSheets)),a=a.union(new Set(n.adoptedStyleSheets));return[...a]};/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Ia=new Set;function xo(l){const a=l.getRootNode();return a.host&&a.host.constructor.version?xo(a.host):a}const or=l=>class extends l{static finalize(){super.finalize();const n=go(this.lumoInjector);this.is&&!Ia.has(n)&&(Ia.add(n),CSS.registerProperty({name:n,syntax:"<number>",inherits:!0,initialValue:"0"}))}static get lumoInjector(){return{is:this.is,includeBaseStyles:!1}}connectedCallback(){super.connectedCallback();const n=xo(this);n.__lumoInjectorDisabled||this.isConnected&&(n.__lumoInjector||(n.__lumoInjector=new xc(n)),this.__lumoInjector=n.__lumoInjector,this.__lumoInjector.componentConnected(this))}disconnectedCallback(){super.disconnectedCallback(),this.__lumoInjector&&(this.__lumoInjector.componentDisconnected(this),this.__lumoInjector=void 0)}};/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const wc=l=>class extends l{static get properties(){return{_theme:{type:String,readOnly:!0}}}static get observedAttributes(){return[...super.observedAttributes,"theme"]}attributeChangedCallback(n,d,u){super.attributeChangedCallback(n,d,u),n==="theme"&&this._set_theme(u)}};/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const hs=[],bc=new Set,_c=new Set;function vc(l){return l&&Object.prototype.hasOwnProperty.call(l,"__themes")}function yc(l,a){return(l||"").split(" ").some(n=>new RegExp(`^${n.split("*").join(".*")}$`,"u").test(a))}function Cc(l){return l.map(a=>a.cssText).join(`
`)}const Ac="vaadin-themable-mixin-style";function Ec(l,a){const n=document.createElement("style");n.id=Ac,n.textContent=Cc(l),a.content.appendChild(n)}function Sc(l=""){let a=0;return l.startsWith("lumo-")||l.startsWith("material-")?a=1:l.startsWith("vaadin-")&&(a=2),a}function wo(l){const a=[];return l.include&&[].concat(l.include).forEach(n=>{const d=hs.find(u=>u.moduleId===n);d?a.push(...wo(d),...d.styles):console.warn(`Included moduleId ${n} not found in style registry`)},l.styles),a}function Ic(l){const a=`${l}-default-theme`,n=hs.filter(d=>d.moduleId!==a&&yc(d.themeFor,l)).map(d=>({...d,styles:[...wo(d),...d.styles],includePriority:Sc(d.moduleId)})).sort((d,u)=>u.includePriority-d.includePriority);return n.length>0?n:hs.filter(d=>d.moduleId===a)}const lr=l=>class extends wc(l){constructor(){super(),bc.add(new WeakRef(this))}static finalize(){if(super.finalize(),this.is&&_c.add(this.is),this.elementStyles)return;const n=this.prototype._template;!n||vc(this)||Ec(this.getStylesForThis(),n)}static finalizeStyles(n){return this.baseStyles=n?[n].flat(1/0):[],this.themeStyles=this.getStylesForThis(),[...this.baseStyles,...this.themeStyles]}static getStylesForThis(){const n=l.__themes||[],d=Object.getPrototypeOf(this.prototype),u=(d?d.constructor.__themes:[])||[];this.__themes=[...n,...u,...Ic(this.is)];const g=this.__themes.flatMap(m=>m.styles);return g.filter((m,C)=>C===g.lastIndexOf(m))}};/**
 * @license
 * Copyright (c) 2025 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Tc=(l,...a)=>{const n=document.createElement("style");n.id=l,n.textContent=a.map(d=>d.toString()).join(`
`),document.head.insertAdjacentElement("afterbegin",n)};/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */["--vaadin-text-color","--vaadin-text-color-disabled","--vaadin-text-color-secondary","--vaadin-border-color","--vaadin-border-color-secondary","--vaadin-background-color"].forEach(l=>{CSS.registerProperty({name:l,syntax:"<color>",inherits:!0,initialValue:"light-dark(black, white)"})});Tc("vaadin-base",Qe`
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
 */const Nc=Qe`
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
*/const Oc=l=>l,bo=typeof document.head.style.touchAction=="string",us="__polymerGestures",Jn="__polymerGesturesHandled",fs="__polymerGesturesTouchAction",Ta=25,Na=5,Rc=2,kc=["mousedown","mousemove","mouseup","click"],Dc=[0,1,4,2],Mc=function(){try{return new MouseEvent("test",{buttons:1}).buttons===1}catch{return!1}}();function Ss(l){return kc.indexOf(l)>-1}let Pc=!1;(function(){try{const l=Object.defineProperty({},"passive",{get(){Pc=!0}});window.addEventListener("test",null,l),window.removeEventListener("test",null,l)}catch{}})();function Bc(l){Ss(l)}const Lc=navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/u),Fc={button:!0,command:!0,fieldset:!0,input:!0,keygen:!0,optgroup:!0,option:!0,select:!0,textarea:!0};function Mi(l){const a=l.type;if(!Ss(a))return!1;if(a==="mousemove"){let d=l.buttons===void 0?1:l.buttons;return l instanceof window.MouseEvent&&!Mc&&(d=Dc[l.which]||0),!!(d&1)}return(l.button===void 0?0:l.button)===0}function Uc(l){if(l.type==="click"){if(l.detail===0)return!0;const a=mi(l);if(!a.nodeType||a.nodeType!==Node.ELEMENT_NODE)return!0;const n=a.getBoundingClientRect(),d=l.pageX,u=l.pageY;return!(d>=n.left&&d<=n.right&&u>=n.top&&u<=n.bottom)}return!1}const Zt={touch:{x:0,y:0,id:-1,scrollDecided:!1}};function zc(l){let a="auto";const n=vo(l);for(let d=0,u;d<n.length;d++)if(u=n[d],u[fs]){a=u[fs];break}return a}function _o(l,a,n){l.movefn=a,l.upfn=n,document.addEventListener("mousemove",a),document.addEventListener("mouseup",n)}function Ji(l){document.removeEventListener("mousemove",l.movefn),document.removeEventListener("mouseup",l.upfn),l.movefn=null,l.upfn=null}const vo=window.ShadyDOM&&window.ShadyDOM.noPatch?window.ShadyDOM.composedPath:l=>l.composedPath&&l.composedPath()||[],Is={},Oi=[];function Vc(l,a){let n=document.elementFromPoint(l,a),d=n;for(;d&&d.shadowRoot&&!window.ShadyDOM;){const u=d;if(d=d.shadowRoot.elementFromPoint(l,a),u===d)break;d&&(n=d)}return n}function mi(l){const a=vo(l);return a.length>0?a[0]:l.target}function $c(l){const a=l.type,d=l.currentTarget[us];if(!d)return;const u=d[a];if(!u)return;if(!l[Jn]&&(l[Jn]={},a.startsWith("touch"))){const m=l.changedTouches[0];if(a==="touchstart"&&l.touches.length===1&&(Zt.touch.id=m.identifier),Zt.touch.id!==m.identifier)return;bo||(a==="touchstart"||a==="touchmove")&&Hc(l)}const g=l[Jn];if(!g.skip){for(let m=0,C;m<Oi.length;m++)C=Oi[m],u[C.name]&&!g[C.name]&&C.flow&&C.flow.start.indexOf(l.type)>-1&&C.reset&&C.reset();for(let m=0,C;m<Oi.length;m++)C=Oi[m],u[C.name]&&!g[C.name]&&(g[C.name]=!0,C[a](l))}}function Hc(l){const a=l.changedTouches[0],n=l.type;if(n==="touchstart")Zt.touch.x=a.clientX,Zt.touch.y=a.clientY,Zt.touch.scrollDecided=!1;else if(n==="touchmove"){if(Zt.touch.scrollDecided)return;Zt.touch.scrollDecided=!0;const d=zc(l);let u=!1;const g=Math.abs(Zt.touch.x-a.clientX),m=Math.abs(Zt.touch.y-a.clientY);l.cancelable&&(d==="none"?u=!0:d==="pan-x"?u=m>g:d==="pan-y"&&(u=g>m)),u?l.preventDefault():on("track")}}function Oa(l,a,n){return Is[a]?(Gc(l,a,n),!0):!1}function Gc(l,a,n){const d=Is[a],u=d.deps,g=d.name;let m=l[us];m||(l[us]=m={});for(let C=0,A,_;C<u.length;C++)A=u[C],!(Lc&&Ss(A)&&A!=="click")&&(_=m[A],_||(m[A]=_={_count:0}),_._count===0&&l.addEventListener(A,$c,Bc(A)),_[g]=(_[g]||0)+1,_._count=(_._count||0)+1);l.addEventListener(a,n),d.touchAction&&Xc(l,d.touchAction)}function Ts(l){Oi.push(l),l.emits.forEach(a=>{Is[a]=l})}function Wc(l){for(let a=0,n;a<Oi.length;a++){n=Oi[a];for(let d=0,u;d<n.emits.length;d++)if(u=n.emits[d],u===l)return n}return null}function Xc(l,a){bo&&l instanceof HTMLElement&&ec.run(()=>{l.style.touchAction=a}),l[fs]=a}function Ns(l,a,n){const d=new Event(a,{bubbles:!0,cancelable:!0,composed:!0});if(d.detail=n,Oc(l).dispatchEvent(d),d.defaultPrevented){const u=n.preventer||n.sourceEvent;u&&u.preventDefault&&u.preventDefault()}}function on(l){const a=Wc(l);a.info&&(a.info.prevent=!0)}Ts({name:"downup",deps:["mousedown","touchstart","touchend"],flow:{start:["mousedown","touchstart"],end:["mouseup","touchend"]},emits:["down","up"],info:{movefn:null,upfn:null},reset(){Ji(this.info)},mousedown(l){if(!Mi(l))return;const a=mi(l),n=this,d=g=>{Mi(g)||(Ar("up",a,g),Ji(n.info))},u=g=>{Mi(g)&&Ar("up",a,g),Ji(n.info)};_o(this.info,d,u),Ar("down",a,l)},touchstart(l){Ar("down",mi(l),l.changedTouches[0],l)},touchend(l){Ar("up",mi(l),l.changedTouches[0],l)}});function Ar(l,a,n,d){a&&Ns(a,l,{x:n.clientX,y:n.clientY,sourceEvent:n,preventer:d,prevent(u){return on(u)}})}Ts({name:"track",touchAction:"none",deps:["mousedown","touchstart","touchmove","touchend"],flow:{start:["mousedown","touchstart"],end:["mouseup","touchend"]},emits:["track"],info:{x:0,y:0,state:"start",started:!1,moves:[],addMove(l){this.moves.length>Rc&&this.moves.shift(),this.moves.push(l)},movefn:null,upfn:null,prevent:!1},reset(){this.info.state="start",this.info.started=!1,this.info.moves=[],this.info.x=0,this.info.y=0,this.info.prevent=!1,Ji(this.info)},mousedown(l){if(!Mi(l))return;const a=mi(l),n=this,d=g=>{const m=g.clientX,C=g.clientY;Ra(n.info,m,C)&&(n.info.state=n.info.started?g.type==="mouseup"?"end":"track":"start",n.info.state==="start"&&on("tap"),n.info.addMove({x:m,y:C}),Mi(g)||(n.info.state="end",Ji(n.info)),a&&es(n.info,a,g),n.info.started=!0)},u=g=>{n.info.started&&d(g),Ji(n.info)};_o(this.info,d,u),this.info.x=l.clientX,this.info.y=l.clientY},touchstart(l){const a=l.changedTouches[0];this.info.x=a.clientX,this.info.y=a.clientY},touchmove(l){const a=mi(l),n=l.changedTouches[0],d=n.clientX,u=n.clientY;Ra(this.info,d,u)&&(this.info.state==="start"&&on("tap"),this.info.addMove({x:d,y:u}),es(this.info,a,n),this.info.state="track",this.info.started=!0)},touchend(l){const a=mi(l),n=l.changedTouches[0];this.info.started&&(this.info.state="end",this.info.addMove({x:n.clientX,y:n.clientY}),es(this.info,a,n))}});function Ra(l,a,n){if(l.prevent)return!1;if(l.started)return!0;const d=Math.abs(l.x-a),u=Math.abs(l.y-n);return d>=Na||u>=Na}function es(l,a,n){if(!a)return;const d=l.moves[l.moves.length-2],u=l.moves[l.moves.length-1],g=u.x-l.x,m=u.y-l.y;let C,A=0;d&&(C=u.x-d.x,A=u.y-d.y),Ns(a,"track",{state:l.state,x:n.clientX,y:n.clientY,dx:g,dy:m,ddx:C,ddy:A,sourceEvent:n,hover(){return Vc(n.clientX,n.clientY)}})}Ts({name:"tap",deps:["mousedown","click","touchstart","touchend"],flow:{start:["mousedown","touchstart"],end:["click","touchend"]},emits:["tap"],info:{x:NaN,y:NaN,prevent:!1},reset(){this.info.x=NaN,this.info.y=NaN,this.info.prevent=!1},mousedown(l){Mi(l)&&(this.info.x=l.clientX,this.info.y=l.clientY)},click(l){Mi(l)&&ka(this.info,l)},touchstart(l){const a=l.changedTouches[0];this.info.x=a.clientX,this.info.y=a.clientY},touchend(l){ka(this.info,l.changedTouches[0],l)}});function ka(l,a,n){const d=Math.abs(a.clientX-l.x),u=Math.abs(a.clientY-l.y),g=mi(n||a);!g||Fc[g.localName]&&g.hasAttribute("disabled")||(isNaN(d)||isNaN(u)||d<=Ta&&u<=Ta||Uc(a))&&(l.prevent||Ns(g,"tap",{x:a.clientX,y:a.clientY,sourceEvent:a,preventer:n}))}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const yo=Pt(l=>class extends l{static get properties(){return{disabled:{type:Boolean,value:!1,observer:"_disabledChanged",reflectToAttribute:!0,sync:!0}}}_disabledChanged(n){this._setAriaDisabled(n)}_setAriaDisabled(n){n?this.setAttribute("aria-disabled","true"):this.removeAttribute("aria-disabled")}click(){this.disabled||super.click()}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Os=Pt(l=>class extends l{ready(){super.ready(),this.addEventListener("keydown",n=>{this._onKeyDown(n)}),this.addEventListener("keyup",n=>{this._onKeyUp(n)})}_onKeyDown(n){switch(n.key){case"Enter":this._onEnter(n);break;case"Escape":this._onEscape(n);break}}_onKeyUp(n){}_onEnter(n){}_onEscape(n){}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const jc=l=>class extends yo(Os(l)){get _activeKeys(){return[" "]}ready(){super.ready(),Oa(this,"down",n=>{this._shouldSetActive(n)&&this._setActive(!0)}),Oa(this,"up",()=>{this._setActive(!1)})}disconnectedCallback(){super.disconnectedCallback(),this._setActive(!1)}_shouldSetActive(n){return!this.disabled}_onKeyDown(n){super._onKeyDown(n),this._shouldSetActive(n)&&this._activeKeys.includes(n.key)&&(this._setActive(!0),document.addEventListener("keyup",d=>{this._activeKeys.includes(d.key)&&this._setActive(!1)},{once:!0}))}_setActive(n){this.toggleAttribute("active",n)}};/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */let Rs=!1;window.addEventListener("keydown",()=>{Rs=!0},{capture:!0});window.addEventListener("mousedown",()=>{Rs=!1},{capture:!0});function Kc(){return Rs}function Yc(l){return l.getRootNode().activeElement===l}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Co=Pt(l=>class extends l{get _keyboardActive(){return Kc()}ready(){this.addEventListener("focusin",n=>{this._shouldSetFocus(n)&&this._setFocused(!0)}),this.addEventListener("focusout",n=>{this._shouldRemoveFocus(n)&&this._setFocused(!1)}),super.ready()}disconnectedCallback(){super.disconnectedCallback(),this.hasAttribute("focused")&&this._setFocused(!1)}focus(n){super.focus(n),n&&n.focusVisible===!1||this.setAttribute("focus-ring","")}_setFocused(n){this.toggleAttribute("focused",n),this.toggleAttribute("focus-ring",n&&this._keyboardActive)}_shouldSetFocus(n){return!0}_shouldRemoveFocus(n){return!0}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Ao=l=>class extends yo(l){static get properties(){return{tabindex:{type:Number,reflectToAttribute:!0,observer:"_tabindexChanged",sync:!0},_lastTabIndex:{type:Number}}}_disabledChanged(n,d){super._disabledChanged(n,d),!this.__shouldAllowFocusWhenDisabled()&&(n?(this.tabindex!==void 0&&(this._lastTabIndex=this.tabindex),this.setAttribute("tabindex","-1")):d&&(this._lastTabIndex!==void 0?this.setAttribute("tabindex",this._lastTabIndex):this.tabindex=void 0))}_tabindexChanged(n){this.__shouldAllowFocusWhenDisabled()||this.disabled&&n!==-1&&(this._lastTabIndex=n,this.setAttribute("tabindex","-1"))}focus(n){(!this.disabled||this.__shouldAllowFocusWhenDisabled())&&super.focus(n)}__shouldAllowFocusWhenDisabled(){return!1}};/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Zc=["mousedown","mouseup","click","dblclick","keypress","keydown","keyup"],qc=l=>class extends jc(Ao(Co(l))){constructor(){super(),this.__onInteractionEvent=this.__onInteractionEvent.bind(this),Zc.forEach(n=>{this.addEventListener(n,this.__onInteractionEvent,!0)}),this.tabindex=0}get _activeKeys(){return["Enter"," "]}ready(){super.ready(),this.hasAttribute("role")||this.setAttribute("role","button"),this.__shouldAllowFocusWhenDisabled()&&this.style.setProperty("--_vaadin-button-disabled-pointer-events","auto")}_onKeyDown(n){super._onKeyDown(n),!(n.altKey||n.shiftKey||n.ctrlKey||n.metaKey)&&this._activeKeys.includes(n.key)&&(n.preventDefault(),this.click())}__onInteractionEvent(n){this.__shouldSuppressInteractionEvent(n)&&n.stopImmediatePropagation()}__shouldSuppressInteractionEvent(n){return this.disabled}};/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Qc extends qc(Br(lr(ar(or(ke))))){static get is(){return"vaadin-button"}static get styles(){return Nc}static get properties(){return{disabled:{type:Boolean,value:!1,observer:"_disabledChanged",reflectToAttribute:!0,sync:!0}}}render(){return L`
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
    `}ready(){super.ready(),this._tooltipController=new Es(this),this.addController(this._tooltipController)}__shouldAllowFocusWhenDisabled(){return window.Vaadin.featureFlags.accessibleDisabledButtons}}sr(Qc);var Jc=Object.getOwnPropertyDescriptor,ed=(l,a,n,d)=>{for(var u=d>1?void 0:d?Jc(a,n):a,g=l.length-1,m;g>=0;g--)(m=l[g])&&(u=m(u)||u);return u};let gs=class extends ke{render(){return L`
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
    `}_handleStart(){this.dispatchEvent(new CustomEvent("start"))}};gs.styles=Qe`
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
  `;gs=ed([bt("ec-welcome")],gs);const td="modulepreload",id=function(l){return"/"+l},Da={},gi=function(a,n,d){let u=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const m=document.querySelector("meta[property=csp-nonce]"),C=(m==null?void 0:m.nonce)||(m==null?void 0:m.getAttribute("nonce"));u=Promise.allSettled(n.map(A=>{if(A=id(A),A in Da)return;Da[A]=!0;const _=A.endsWith(".css"),k=_?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${A}"]${k}`))return;const I=document.createElement("link");if(I.rel=_?"stylesheet":td,_||(I.as="script"),I.crossOrigin="",I.href=A,C&&I.setAttribute("nonce",C),document.head.appendChild(I),_)return new Promise(($,X)=>{I.addEventListener("load",$),I.addEventListener("error",()=>X(new Error(`Unable to preload CSS for ${A}`)))})}))}function g(m){const C=new Event("vite:preloadError",{cancelable:!0});if(C.payload=m,window.dispatchEvent(C),!C.defaultPrevented)throw m}return u.then(m=>{for(const C of m||[])C.status==="rejected"&&g(C.reason);return a().catch(g)})},wi=':host{display:block;width:100%}.container{max-width:680px;margin:0 auto;padding:1.25rem 1rem;padding-bottom:calc(1.25rem + var(--safe-bottom, 0px));display:flex;flex-direction:column;gap:1.25rem;min-height:100vh;min-height:100dvh;font-family:var(--font-sans);color:var(--text-primary);width:100%}p{line-height:1.6;color:var(--text-secondary);margin:.5rem 0}.m-0{margin:0}.mt-1{margin-top:1rem}.mt-1-5{margin-top:1.5rem}.w-100{width:100%}.flex-1{flex-grow:1}.d-none{display:none!important}.label{font-weight:700;color:var(--text-muted);font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;display:inline-block;margin-bottom:.25rem}.text-muted{color:var(--text-muted)}.text-danger{color:var(--danger)}.text-danger-small{color:var(--danger);font-size:.875rem;font-weight:500}.link-primary{color:var(--primary);text-decoration:none;font-weight:500}.link-primary:hover{text-decoration:underline}.no-underline{text-decoration:none}.header{display:flex;justify-content:space-between;align-items:center;padding:.75rem 0;padding-top:calc(.75rem + var(--safe-top, 0px));border-bottom:1px solid var(--border);gap:.5rem;flex-wrap:wrap;min-height:56px}.header-left{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;flex:1;min-width:0}.header-title{font-size:1.25rem;font-weight:800;margin:0;background:linear-gradient(135deg,var(--primary),var(--success));-webkit-background-clip:text;-webkit-text-fill-color:transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.card{background:var(--bg-card);padding:1.25rem;border-radius:var(--radius-m);border:1px solid var(--border);box-shadow:var(--shadow-md);transition:all .3s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden;max-width:100%;word-wrap:break-word;overflow-wrap:break-word}.card:before{content:"";position:absolute;top:0;left:0;right:0;height:4px;background:transparent;transition:background .3s}.card:hover{box-shadow:var(--shadow-lg)}.safety-card:before{background:var(--danger)}.safety-card{box-shadow:0 4px 20px -2px var(--danger-glow)}.ocr-card:before{background:var(--success)}.ocr-card{box-shadow:0 4px 20px -2px var(--success-glow)}.result-card:before{background:var(--primary)}.result-card{box-shadow:var(--shadow-glow)}.offline-banner{background:linear-gradient(135deg,var(--danger),#be123c);color:#fff;padding:12px;text-align:center;border-radius:var(--radius-s);font-weight:700;font-size:.85rem;box-shadow:var(--shadow-sm);display:flex;align-items:center;justify-content:center;gap:8px}.media-box{width:100%;aspect-ratio:4 / 3;background:#090d16;border-radius:var(--radius-m);overflow:hidden;position:relative;box-shadow:var(--shadow-lg);border:1px solid var(--border);max-width:100%}video,canvas,img{width:100%;height:100%;object-fit:cover}.camera-hint{position:absolute;bottom:8px;left:8px;right:8px;background:#0f172ad9;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.1);color:#f8fafc;padding:8px 12px;border-radius:var(--radius-s);text-align:center;font-size:.8rem;pointer-events:none;z-index:10;box-shadow:var(--shadow-md)}.action-bar{display:flex;gap:6px;flex-wrap:wrap;justify-content:stretch;margin-top:1rem}.action-bar vaadin-button{flex:1 1 calc(50% - 3px);min-width:0;font-size:.8rem}vaadin-button{cursor:pointer;font-family:var(--font-sans);border-radius:var(--radius-s);transition:all .2s;touch-action:manipulation;-webkit-tap-highlight-color:transparent}.btn-large{width:100%;height:3.25rem;font-weight:700;font-size:1rem}.btn-amazon{background-color:#f90!important;color:#000!important;font-weight:700!important}.btn-amazon:hover{background-color:#e68a00!important}.result-card h3{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--border);padding-bottom:.75rem;margin-bottom:1rem;font-weight:800;font-size:1.1rem;word-break:break-word}.safety-list{display:flex;flex-direction:column;gap:.75rem;margin:1.25rem 0}.safety-item{display:flex;gap:12px;align-items:center;cursor:pointer;padding:12px;background:var(--bg-app);border:1px solid var(--border);border-radius:var(--radius-s);transition:all .2s ease;-webkit-user-select:none;user-select:none;min-height:52px}.safety-item:hover{border-color:var(--danger);background:var(--danger-glow)}.safety-item input[type=checkbox]{width:1.4rem;height:1.4rem;accent-color:var(--danger);cursor:pointer;flex-shrink:0}.safety-item span{font-size:.9rem;font-weight:600}.difficulty-stars{color:#f59e0b;margin-bottom:1rem;font-size:1rem;font-weight:700;display:flex;align-items:center;gap:4px;flex-wrap:wrap}.tips-list{margin-top:.25rem;padding-left:1.25rem;color:var(--text-secondary);font-size:.9rem;line-height:1.6}.tips-list li{margin-bottom:.5rem}.result-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:1.25rem}.result-actions vaadin-button{width:100%;font-size:.85rem}.result-actions a{grid-column:span 2;width:100%}.result-actions a vaadin-button{width:100%}.experience-box{background:var(--bg-app);padding:12px 14px;border-radius:var(--radius-s);font-style:italic;font-size:.85rem;margin:1rem 0;border-left:4px solid var(--text-muted);word-break:break-word}.legal-box{background:var(--danger-glow);padding:12px;border-radius:var(--radius-s);border:1px solid rgba(239,68,68,.2);margin-top:1.25rem}.legal-text{font-size:.75rem;color:var(--danger);margin:0;line-height:1.5}.empty-dashboard{text-align:center;padding:2rem 1rem;color:var(--text-muted)}.dashboard-title{margin-bottom:1.5rem;font-weight:800;font-size:1.15rem}.dashboard-stats{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.25rem}.stat-card{background:var(--bg-app);padding:1rem;border-radius:var(--radius-s);border:1px solid var(--border);text-align:center;transition:border-color .2s}.stat-card:hover{border-color:var(--primary)}.stat-value-primary{font-size:2rem;font-weight:800;color:var(--primary)}.stat-value-warning{font-size:2rem;font-weight:800;color:var(--warning)}.stat-label{font-size:.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:700;letter-spacing:.05em;margin-top:.25rem}.dashboard-subtitle{margin-top:1.25rem;margin-bottom:.75rem;color:var(--text-secondary);font-size:.85rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em}.device-list{display:flex;flex-direction:column;gap:.75rem}.device-item-header{display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:.25rem}.device-name{font-weight:600}.device-count{font-weight:700;color:var(--text-muted)}.device-progress{width:100%;height:8px;border-radius:4px}.history-section{margin-top:1.5rem}.history-header{font-weight:700;color:var(--text-secondary);text-transform:uppercase;font-size:.75rem;letter-spacing:.05em;margin-bottom:.75rem;border-bottom:2px solid var(--border);padding-bottom:.5rem;display:flex;align-items:center;gap:8px}.history-item{display:flex;flex-direction:column;padding:1rem;border:1px solid var(--border);border-radius:var(--radius-s);margin-bottom:.5rem;cursor:pointer;background:var(--bg-card);transition:all .2s ease;box-shadow:var(--shadow-sm);min-height:52px}.history-item:hover,.history-item:active{border-color:var(--primary);transform:translateY(-1px);box-shadow:var(--shadow-md)}.history-title{font-weight:700;color:var(--text-primary);font-size:.9rem}.history-defect{font-size:.8rem;color:var(--text-secondary);margin-top:.25rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.modal-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;height:100dvh;background:#090d16b3;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);z-index:2000;display:flex;justify-content:center;align-items:center;padding:1rem;padding-top:calc(1rem + var(--safe-top, 0px));padding-bottom:calc(1rem + var(--safe-bottom, 0px))}.settings-overlay{z-index:1500}.pdf-modal-card{width:100%;max-width:600px;height:80vh;height:80dvh;display:flex;flex-direction:column}.settings-card{width:100%;max-width:440px;max-height:90vh;max-height:90dvh;overflow-y:auto}.pdf-iframe{flex-grow:1;border:1px solid var(--border);border-radius:var(--radius-s);background:#fff;margin:1rem 0;width:100%;min-height:200px}.modal-actions{display:flex;gap:.75rem;margin-top:1rem;justify-content:flex-end;flex-wrap:wrap}.consent-card{max-width:500px;width:100%;border-top:5px solid var(--primary);max-height:90vh;max-height:90dvh;overflow-y:auto}.consent-title{font-weight:800;margin-bottom:.75rem;font-size:1.15rem}.consent-text{font-size:.85rem;line-height:1.5;margin-bottom:1rem}.consent-checkbox-label{display:flex;gap:10px;align-items:flex-start;font-size:.85rem;margin-bottom:1rem;cursor:pointer;background:var(--bg-app);padding:10px;border-radius:var(--radius-s);border:1px solid var(--border)}.consent-checkbox-label input{margin-top:3px;accent-color:var(--primary);min-width:20px;min-height:20px}.guided-container{display:flex;flex-direction:column;gap:1rem;padding:.5rem 0}.step-card{background:var(--bg-app);border:1px solid var(--border);border-radius:var(--radius-m);padding:1.5rem 1.25rem;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:160px;box-shadow:var(--shadow-sm)}.step-number{font-size:.75rem;font-weight:800;color:var(--primary);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.5rem}.step-text{font-size:1.1rem;font-weight:700;line-height:1.5;color:var(--text-primary);margin:0;word-break:break-word}.guided-controls{display:flex;gap:8px;justify-content:space-between}.guided-controls vaadin-button{flex:1}.tts-button{background:var(--primary-glow)!important;color:var(--primary)!important;border:1px solid var(--primary)!important}.queue-item{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:var(--bg-app);border:1px solid var(--border);border-radius:var(--radius-s);margin-bottom:.5rem;gap:8px}.queue-info{display:flex;flex-direction:column;min-width:0;flex:1}.queue-desc{font-weight:600;font-size:.85rem;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.queue-time{font-size:.75rem;color:var(--text-muted)}.queue-actions{display:flex;gap:6px;flex-shrink:0}.privacy-danger-zone{border:1px solid rgba(239,68,68,.2);border-radius:var(--radius-s);padding:1rem;margin-top:1rem;background:var(--danger-glow)}.privacy-title{color:var(--danger);font-weight:700;font-size:.9rem;margin-top:0;margin-bottom:.5rem}.app-footer{margin-top:auto;padding:1.5rem 0;padding-bottom:calc(1.5rem + var(--safe-bottom, 0px));border-top:1px solid var(--border);text-align:center;font-size:.7rem;color:var(--text-muted);display:flex;flex-direction:column;gap:.375rem}.footer-links{display:flex;justify-content:center;gap:.75rem;flex-wrap:wrap}.footer-links a{color:var(--text-secondary);text-decoration:none}.footer-links a:hover{text-decoration:underline;color:var(--primary)}.skeleton-card{text-align:center;padding:2.5rem 1.5rem;display:flex;flex-direction:column;align-items:center;justify-content:center}.loading-text{font-weight:700;color:var(--primary);margin-top:1.25rem;font-size:1rem;letter-spacing:-.02em}.tech-spinner{width:52px;height:52px;border-radius:50%;border:4px solid transparent;border-top-color:var(--text-muted);border-bottom-color:var(--text-muted);animation:spin 2s linear infinite;position:relative}.tech-spinner:before{content:"";position:absolute;top:8px;left:8px;right:8px;bottom:8px;border-radius:50%;border:4px solid transparent;border-left-color:var(--primary);border-right-color:var(--primary);animation:spin-reverse 1.2s linear infinite}.scanner-overlay{position:absolute;top:12.5%;left:12.5%;right:12.5%;bottom:12.5%;border:2px solid rgba(255,255,255,.4);box-shadow:0 0 0 2000px #090d16a6;pointer-events:none;z-index:5;border-radius:4px}.scanner-laser{position:absolute;width:100%;height:2px;background:var(--primary);box-shadow:0 0 12px var(--primary);top:0;animation:scan 2.5s ease-in-out infinite alternate}:host([theme="dark"]) vaadin-button[theme~=secondary]{background-color:#1e293b;color:var(--primary);border:1px solid var(--border)}vaadin-button[theme~=secondary]{background-color:#f1f5f9;color:var(--text-primary);border:1px solid var(--border)}vaadin-button[theme~=primary]{background-color:var(--primary)!important;color:#fff!important}vaadin-button[theme~=primary]:hover{background-color:var(--primary-hover)!important}vaadin-button[theme~=error]{background-color:var(--danger)!important;color:#fff!important}vaadin-button[theme~=success]{background-color:var(--success)!important;color:#fff!important}@keyframes spin{to{transform:rotate(360deg)}}@keyframes spin-reverse{to{transform:rotate(-360deg)}}@keyframes scan{0%{top:0%;opacity:.2}15%{opacity:1}85%{opacity:1}to{top:100%;opacity:.2}}@media screen and (max-width: 374px){.container{padding:.75rem .5rem;gap:.75rem}.header-title{font-size:1rem}.header-left vaadin-button{font-size:.7rem;min-height:36px;padding:0 6px}.card{padding:1rem;border-radius:12px}.media-box{border-radius:12px}.action-bar vaadin-button{flex:1 1 100%;font-size:.75rem}.result-card h3{font-size:.95rem}.result-actions{grid-template-columns:1fr 1fr;gap:6px}.stat-value-primary,.stat-value-warning{font-size:1.5rem}.consent-card{padding:1rem}.consent-title{font-size:1rem}}@media screen and (min-width: 375px) and (max-width: 411px){.container{padding:1rem .75rem;gap:1rem}.header-title{font-size:1.1rem}.card{padding:1.1rem}.action-bar vaadin-button{font-size:.78rem}}@media screen and (min-width: 412px) and (max-width: 767px){.container{padding:1.25rem 1rem;gap:1.25rem}.header-title{font-size:1.25rem}.card{padding:1.25rem}.action-bar vaadin-button{font-size:.82rem}}@media screen and (max-width: 767px){.container{max-width:100%}.header{flex-wrap:wrap;gap:.5rem}.header-left{width:100%;justify-content:space-between}.header-left vaadin-button{flex:0 0 auto}.media-box{aspect-ratio:3 / 4}.modal-overlay{padding:.5rem;align-items:flex-end}.settings-card{max-width:100%;max-height:95vh;max-height:95dvh;border-bottom-left-radius:0;border-bottom-right-radius:0}.consent-card{max-width:100%;max-height:95vh;max-height:95dvh}.pdf-modal-card{max-width:100%;height:90vh;height:90dvh}.app-footer{padding:1rem 0;font-size:.65rem}}@media screen and (min-width: 768px) and (max-width: 1023px){.container{max-width:680px;padding:1.5rem 1.25rem;gap:1.5rem}.header-title{font-size:1.5rem}.card{padding:1.5rem}.action-bar vaadin-button{flex:1 1 calc(33.333% - 4px);font-size:.85rem}.result-actions{grid-template-columns:repeat(4,1fr)}.result-actions a{grid-column:span 4}.dashboard-stats{grid-template-columns:repeat(4,1fr)}.stat-value-primary,.stat-value-warning{font-size:2.25rem}}@media screen and (min-width: 1024px){.container{max-width:720px;padding:2rem 1.5rem;gap:1.5rem}.header-title{font-size:1.5rem}.card{padding:1.75rem}.action-bar vaadin-button{flex:1 1 auto;font-size:.875rem}.result-actions{grid-template-columns:repeat(4,1fr)}.result-actions a{grid-column:span 4}}@media screen and (max-width: 767px) and (orientation: landscape){.media-box{aspect-ratio:16 / 9;max-height:50vh}.container{padding:.75rem}}@media print{.header,.media-box,.action-bar,vaadin-text-area,vaadin-button,.history-section,.app-footer{display:none!important}.card{border:none;box-shadow:none}}:host-context(.accessible-reading) p,:host-context(.accessible-reading) span,:host-context(.accessible-reading) div,:host-context(.accessible-reading) label,:host-context(.accessible-reading) li,:host-context(.accessible-reading) input,:host-context(.accessible-reading) vaadin-text-field,:host-context(.accessible-reading) vaadin-text-area{word-spacing:.15em!important;letter-spacing:.05em!important;line-height:1.75!important}';/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const rd={CHILD:2},nd=l=>(...a)=>({_$litDirective$:l,values:a});class sd{constructor(a){}get _$AU(){return this._$AM._$AU}_$AT(a,n,d){this._$Ct=a,this._$AM=n,this._$Ci=d}_$AS(a,n){return this.update(a,n)}update(a,n){return this.render(...n)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class ps extends sd{constructor(a){if(super(a),this.it=He,a.type!==rd.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(a){if(a===He||a==null)return this._t=void 0,this.it=a;if(a===Bi)return a;if(typeof a!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(a===this.it)return this._t;this.it=a;const n=[a];return n.raw=n,this._t={_$litType$:this.constructor.resultType,strings:n,values:[]}}}ps.directiveName="unsafeHTML",ps.resultType=1;const ad=nd(ps);/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const od=Qe`
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
 */const ld=l=>class extends l{static get properties(){return{value:{type:Number,observer:"_valueChanged"},min:{type:Number,value:0,observer:"_minChanged"},max:{type:Number,value:1,observer:"_maxChanged"},indeterminate:{type:Boolean,value:!1,reflectToAttribute:!0}}}static get observers(){return["_normalizedValueChanged(value, min, max)"]}ready(){super.ready(),this.setAttribute("role","progressbar")}_normalizedValueChanged(n,d,u){const g=this._normalizeValue(n,d,u);this.style.setProperty("--vaadin-progress-value",g)}_valueChanged(n){this.setAttribute("aria-valuenow",n)}_minChanged(n){this.setAttribute("aria-valuemin",n)}_maxChanged(n){this.setAttribute("aria-valuemax",n)}_normalizeValue(n,d,u){let g;return!n&&n!==0?g=0:d>=u?g=1:(g=(n-d)/(u-d),g=Math.min(Math.max(g,0),1)),g}};/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class cd extends ld(Br(lr(ar(or(ke))))){static get is(){return"vaadin-progress-bar"}static get styles(){return od}render(){return L`
      <div part="bar">
        <div part="value"></div>
      </div>
    `}}sr(cd);/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const dd=Qe`
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
 */class hd extends lr(oo(ar(or(ke)))){static get is(){return"vaadin-input-container"}static get styles(){return dd}static get properties(){return{disabled:{type:Boolean,reflectToAttribute:!0},readonly:{type:Boolean,reflectToAttribute:!0},invalid:{type:Boolean,reflectToAttribute:!0}}}render(){return L`
      <slot name="prefix"></slot>
      <slot></slot>
      <slot name="suffix"></slot>
    `}ready(){super.ready(),this.addEventListener("pointerdown",a=>{a.target===this&&a.preventDefault()}),this.addEventListener("click",a=>{a.target===this&&this.shadowRoot.querySelector("slot:not([name])").assignedNodes({flatten:!0}).forEach(n=>n.focus&&n.focus())})}}sr(hd);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Eo=l=>l??He;/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ud=Qe`
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
 */const fd=Qe`
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
 */const So=[fd,ud];/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const gd=Qe`
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
 */const Jr=new ResizeObserver(l=>{setTimeout(()=>{l.forEach(a=>{a.target.isConnected&&(a.target.resizables?a.target.resizables.forEach(n=>{n._onResize(a.contentRect)}):a.target._onResize(a.contentRect))})})}),pd=Pt(l=>class extends l{get _observeParent(){return!1}connectedCallback(){if(super.connectedCallback(),Jr.observe(this),this._observeParent){const n=this.parentNode instanceof ShadowRoot?this.parentNode.host:this.parentNode;n.resizables||(n.resizables=new Set,Jr.observe(n)),n.resizables.add(this),this.__parent=n}}disconnectedCallback(){super.disconnectedCallback(),Jr.unobserve(this);const n=this.__parent;if(this._observeParent&&n){const d=n.resizables;d&&(d.delete(this),d.size===0&&Jr.unobserve(n)),this.__parent=null}}_onResize(n){}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const md=Pt(l=>class extends Co(Ao(l)){static get properties(){return{autofocus:{type:Boolean},focusElement:{type:Object,readOnly:!0,observer:"_focusElementChanged",sync:!0},_lastTabIndex:{value:0}}}constructor(){super(),this._boundOnBlur=this._onBlur.bind(this),this._boundOnFocus=this._onFocus.bind(this)}ready(){super.ready(),this.autofocus&&!this.disabled&&requestAnimationFrame(()=>{this.focus()})}focus(n){this.focusElement&&!this.disabled&&(this.focusElement.focus(),n&&n.focusVisible===!1||this.setAttribute("focus-ring",""))}blur(){this.focusElement&&this.focusElement.blur()}click(){this.focusElement&&!this.disabled&&this.focusElement.click()}_focusElementChanged(n,d){n?(n.disabled=this.disabled,this._addFocusListeners(n),this.__forwardTabIndex(this.tabindex)):d&&this._removeFocusListeners(d)}_addFocusListeners(n){n.addEventListener("blur",this._boundOnBlur),n.addEventListener("focus",this._boundOnFocus)}_removeFocusListeners(n){n.removeEventListener("blur",this._boundOnBlur),n.removeEventListener("focus",this._boundOnFocus)}_onFocus(n){n.stopPropagation(),this.dispatchEvent(new Event("focus"))}_onBlur(n){n.stopPropagation(),this.dispatchEvent(new Event("blur"))}_shouldSetFocus(n){return n.target===this.focusElement}_shouldRemoveFocus(n){return n.target===this.focusElement}_disabledChanged(n,d){super._disabledChanged(n,d),this.focusElement&&(this.focusElement.disabled=n),n&&this.blur()}_tabindexChanged(n){this.__forwardTabIndex(n)}__forwardTabIndex(n){n!==void 0&&this.focusElement&&(this.focusElement.tabIndex=n,n!==-1&&(this.tabindex=void 0)),this.disabled&&n&&(n!==-1&&(this._lastTabIndex=n),this.tabindex=void 0),n===void 0&&this.hasAttribute("tabindex")&&this.removeAttribute("tabindex")}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ts=new WeakMap;function xd(l){return ts.has(l)||ts.set(l,new Set),ts.get(l)}function wd(l,a){const n=document.createElement("style");n.textContent=l,a===document?document.head.appendChild(n):a.insertBefore(n,a.firstChild)}const bd=Pt(l=>class extends l{get slotStyles(){return[]}connectedCallback(){super.connectedCallback(),this.__applySlotStyles()}__applySlotStyles(){const n=this.getRootNode(),d=xd(n);this.slotStyles.forEach(u=>{d.has(u)||(wd(u,n),d.add(u))})}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const bn=l=>l.test(navigator.userAgent),ms=l=>l.test(navigator.platform),_d=l=>l.test(navigator.vendor);bn(/Android/u);bn(/Chrome/u)&&_d(/Google Inc/u);bn(/Firefox/u);ms(/^iPad/u)||ms(/^Mac/u)&&navigator.maxTouchPoints>1;ms(/^iPhone/u);bn(/^((?!chrome|android).)*safari/iu);const vd=(()=>{try{return document.createEvent("TouchEvent"),!0}catch{return!1}})();/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Io=Pt(l=>class extends l{static get properties(){return{inputElement:{type:Object,readOnly:!0,observer:"_inputElementChanged",sync:!0},type:{type:String,readOnly:!0},value:{type:String,value:"",observer:"_valueChanged",notify:!0,sync:!0}}}constructor(){super(),this._boundOnInput=this._onInput.bind(this),this._boundOnChange=this._onChange.bind(this)}get _hasValue(){return this.value!=null&&this.value!==""}get _inputElementValueProperty(){return"value"}get _inputElementValue(){return this.inputElement?this.inputElement[this._inputElementValueProperty]:void 0}set _inputElementValue(n){this.inputElement&&(this.inputElement[this._inputElementValueProperty]=n)}clear(){this.value="",this._inputElementValue=""}_addInputListeners(n){n.addEventListener("input",this._boundOnInput),n.addEventListener("change",this._boundOnChange)}_removeInputListeners(n){n.removeEventListener("input",this._boundOnInput),n.removeEventListener("change",this._boundOnChange)}_forwardInputValue(n){this.inputElement&&(this._inputElementValue=n??"")}_inputElementChanged(n,d){n?this._addInputListeners(n):d&&this._removeInputListeners(d)}_onInput(n){const d=n.composedPath()[0];this.__userInput=n.isTrusted,this.value=d.value,this.__userInput=!1}_onChange(n){}_toggleHasValue(n){this.toggleAttribute("has-value",n)}_valueChanged(n,d){this._toggleHasValue(this._hasValue),!(n===""&&d===void 0)&&(this.__userInput||this._forwardInputValue(n))}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const yd=l=>class extends Io(Os(l)){static get properties(){return{clearButtonVisible:{type:Boolean,reflectToAttribute:!0,value:!1}}}get clearElement(){return console.warn(`Please implement the 'clearElement' property in <${this.localName}>`),null}ready(){super.ready(),this.clearElement&&(this.clearElement.addEventListener("mousedown",n=>this._onClearButtonMouseDown(n)),this.clearElement.addEventListener("click",n=>this._onClearButtonClick(n)))}_onClearButtonClick(n){n.preventDefault(),this._onClearAction()}_onClearButtonMouseDown(n){this._shouldKeepFocusOnClearMousedown()&&n.preventDefault(),vd||this.inputElement.focus()}_onEscape(n){super._onEscape(n),this.clearButtonVisible&&this.value&&!this.readonly&&(n.stopPropagation(),this._onClearAction())}_onClearAction(){this._inputElementValue="",this.inputElement.dispatchEvent(new Event("input",{bubbles:!0,composed:!0})),this.inputElement.dispatchEvent(new Event("change",{bubbles:!0}))}_shouldKeepFocusOnClearMousedown(){return Yc(this.inputElement)}};/**
 * @license
 * Copyright (c) 2023 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const is=new Map;function ks(l){return is.has(l)||is.set(l,new WeakMap),is.get(l)}function To(l,a){l&&l.removeAttribute(a)}function No(l,a){if(!l||!a)return;const n=ks(a);if(n.has(l))return;const d=As(l.getAttribute(a));n.set(l,new Set(d))}function Cd(l,a){if(!l||!a)return;const n=ks(a),d=n.get(l);!d||d.size===0?l.removeAttribute(a):co(l,a,xn(d)),n.delete(l)}function rs(l,a,n={newId:null,oldId:null,fromUser:!1}){if(!l||!a)return;const{newId:d,oldId:u,fromUser:g}=n,m=ks(a),C=m.get(l);if(!g&&C){u&&C.delete(u),d&&C.add(d);return}g&&(C?d||m.delete(l):No(l,a),To(l,a)),cc(l,a,u);const A=d||xn(C);A&&co(l,a,A)}function Ad(l,a){No(l,a),To(l,a)}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Ed{constructor(a){this.host=a,this.__required=!1}setTarget(a){this.__target=a,this.__setAriaRequiredAttribute(this.__required),this.__setLabelIdToAriaAttribute(this.__labelId,this.__labelId),this.__labelIdFromUser!=null&&this.__setLabelIdToAriaAttribute(this.__labelIdFromUser,this.__labelIdFromUser,!0),this.__setErrorIdToAriaAttribute(this.__errorId),this.__setHelperIdToAriaAttribute(this.__helperId),this.setAriaLabel(this.__label)}setRequired(a){this.__setAriaRequiredAttribute(a),this.__required=a}setAriaLabel(a){this.__setAriaLabelToAttribute(a),this.__label=a}setLabelId(a,n=!1){const d=n?this.__labelIdFromUser:this.__labelId;this.__setLabelIdToAriaAttribute(a,d,n),n?this.__labelIdFromUser=a:this.__labelId=a}setErrorId(a){this.__setErrorIdToAriaAttribute(a,this.__errorId),this.__errorId=a}setHelperId(a){this.__setHelperIdToAriaAttribute(a,this.__helperId),this.__helperId=a}__setAriaLabelToAttribute(a){this.__target&&(a?(Ad(this.__target,"aria-labelledby"),this.__target.setAttribute("aria-label",a)):this.__label&&(Cd(this.__target,"aria-labelledby"),this.__target.removeAttribute("aria-label")))}__setLabelIdToAriaAttribute(a,n,d){rs(this.__target,"aria-labelledby",{newId:a,oldId:n,fromUser:d})}__setErrorIdToAriaAttribute(a,n){rs(this.__target,"aria-describedby",{newId:a,oldId:n,fromUser:!1})}__setHelperIdToAriaAttribute(a,n){rs(this.__target,"aria-describedby",{newId:a,oldId:n,fromUser:!1})}__setAriaRequiredAttribute(a){this.__target&&(["input","textarea"].includes(this.__target.localName)||(a?this.__target.setAttribute("aria-required","true"):this.__target.removeAttribute("aria-required")))}}/**
 * @license
 * Copyright (c) 2022 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const kt=document.createElement("div");kt.style.position="fixed";kt.style.clip="rect(0px, 0px, 0px, 0px)";kt.setAttribute("aria-live","polite");document.body.appendChild(kt);let en;function Sd(l,a={}){const n=a.mode||"polite",d=a.timeout===void 0?150:a.timeout;n==="alert"?(kt.removeAttribute("aria-live"),kt.removeAttribute("role"),en=ir.debounce(en,Ql,()=>{kt.setAttribute("role","alert")})):(en&&en.cancel(),kt.removeAttribute("role"),kt.setAttribute("aria-live",n)),kt.textContent="",setTimeout(()=>{kt.textContent=l},d)}/**
 * @license
 * Copyright (c) 2022 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Ds extends wn{constructor(a,n,d,u={}){super(a,n,d,{...u,useUniqueId:!0})}initCustomNode(a){this.__updateNodeId(a),this.__notifyChange(a)}teardownNode(a){const n=this.getSlotChild();n&&n!==this.defaultNode?this.__notifyChange(n):(this.restoreDefaultNode(),this.updateDefaultNode(this.node))}attachDefaultNode(){const a=super.attachDefaultNode();return a&&this.__updateNodeId(a),a}restoreDefaultNode(){}updateDefaultNode(a){this.__notifyChange(a)}observeNode(a){this.__nodeObserver&&this.__nodeObserver.disconnect(),this.__nodeObserver=new MutationObserver(n=>{n.forEach(d=>{const u=d.target,g=u===this.node;d.type==="attributes"?g&&this.__updateNodeId(u):(g||u.parentElement===this.node)&&this.__notifyChange(this.node)})}),this.__nodeObserver.observe(a,{attributes:!0,attributeFilter:["id"],childList:!0,subtree:!0,characterData:!0})}__hasContent(a){return a?a.nodeType===Node.ELEMENT_NODE&&(customElements.get(a.localName)||a.children.length>0)||a.textContent&&a.textContent.trim()!=="":!1}__notifyChange(a){this.dispatchEvent(new CustomEvent("slot-content-changed",{detail:{hasContent:this.__hasContent(a),node:a}}))}__updateNodeId(a){const n=!this.nodes||a===this.nodes[0];a.nodeType===Node.ELEMENT_NODE&&(!this.multiple||n)&&!a.id&&(a.id=this.defaultId)}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Id extends Ds{constructor(a){super(a,"error-message","div")}setErrorMessage(a){this.errorMessage=a,this.updateDefaultNode(this.node)}setInvalid(a){this.invalid=a,this.updateDefaultNode(this.node)}initAddedNode(a){a!==this.defaultNode&&this.initCustomNode(a)}initNode(a){this.updateDefaultNode(a)}initCustomNode(a){a.textContent&&!this.errorMessage&&(this.errorMessage=a.textContent.trim()),super.initCustomNode(a)}restoreDefaultNode(){this.attachDefaultNode()}updateDefaultNode(a){const{errorMessage:n,invalid:d}=this,u=!!(d&&n&&n.trim()!=="");a&&(a.textContent=u?n:"",a.hidden=!u,u&&Sd(n,{mode:"assertive"})),super.updateDefaultNode(a)}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Td extends Ds{constructor(a){super(a,"helper",null)}setHelperText(a){this.helperText=a,this.getSlotChild()||this.restoreDefaultNode(),this.node===this.defaultNode&&this.updateDefaultNode(this.node)}restoreDefaultNode(){const{helperText:a}=this;if(a&&a.trim()!==""){this.tagName="div";const n=this.attachDefaultNode();this.observeNode(n)}}updateDefaultNode(a){a&&(a.textContent=this.helperText),super.updateDefaultNode(a)}initCustomNode(a){super.initCustomNode(a),this.observeNode(a)}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Nd extends Ds{constructor(a){super(a,"label","label")}setLabel(a){this.label=a,this.getSlotChild()||this.restoreDefaultNode(),this.node===this.defaultNode&&this.updateDefaultNode(this.node)}restoreDefaultNode(){const{label:a}=this;if(a&&a.trim()!==""){const n=this.attachDefaultNode();this.observeNode(n)}}updateDefaultNode(a){a&&(a.textContent=this.label),super.updateDefaultNode(a)}initCustomNode(a){super.initCustomNode(a),this.observeNode(a)}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Od=l=>class extends l{static get properties(){return{label:{type:String,observer:"_labelChanged"}}}constructor(){super(),this._labelController=new Nd(this),this._labelController.addEventListener("slot-content-changed",n=>{this.toggleAttribute("has-label",n.detail.hasContent)})}get _labelId(){const n=this._labelNode;return n&&n.id}get _labelNode(){return this._labelController.node}ready(){super.ready(),this.addController(this._labelController)}_labelChanged(n){this._labelController.setLabel(n)}};/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Oo=Pt(l=>class extends l{static get properties(){return{invalid:{type:Boolean,reflectToAttribute:!0,notify:!0,value:!1,sync:!0},manualValidation:{type:Boolean,value:!1},required:{type:Boolean,reflectToAttribute:!0,sync:!0}}}validate(){const n=this.checkValidity();return this._setInvalid(!n),this.dispatchEvent(new CustomEvent("validated",{detail:{valid:n}})),n}checkValidity(){return!this.required||!!this.value}_setInvalid(n){this._shouldSetInvalid(n)&&(this.invalid=n)}_shouldSetInvalid(n){return!0}_requestValidation(){this.manualValidation||this.validate()}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Rd=l=>class extends Oo(Od(l)){static get properties(){return{ariaTarget:{type:Object,observer:"_ariaTargetChanged"},errorMessage:{type:String,observer:"_errorMessageChanged"},helperText:{type:String,observer:"_helperTextChanged"},accessibleName:{type:String,observer:"_accessibleNameChanged"},accessibleNameRef:{type:String,observer:"_accessibleNameRefChanged"}}}static get observers(){return["_invalidChanged(invalid)","_requiredChanged(required)"]}constructor(){super(),this._fieldAriaController=new Ed(this),this._helperController=new Td(this),this._errorController=new Id(this),this._errorController.addEventListener("slot-content-changed",n=>{this.toggleAttribute("has-error-message",n.detail.hasContent)}),this._labelController.addEventListener("slot-content-changed",n=>{const{hasContent:d,node:u}=n.detail;this.__labelChanged(d,u)}),this._helperController.addEventListener("slot-content-changed",n=>{const{hasContent:d,node:u}=n.detail;this.toggleAttribute("has-helper",d),this.__helperChanged(d,u)})}get _errorNode(){return this._errorController.node}get _helperNode(){return this._helperController.node}ready(){super.ready(),this.addController(this._fieldAriaController),this.addController(this._helperController),this.addController(this._errorController)}__helperChanged(n,d){n?this._fieldAriaController.setHelperId(d.id):this._fieldAriaController.setHelperId(null)}_accessibleNameChanged(n){this._fieldAriaController.setAriaLabel(n)}_accessibleNameRefChanged(n){this._fieldAriaController.setLabelId(n,!0)}__labelChanged(n,d){n?this._fieldAriaController.setLabelId(d.id):this._fieldAriaController.setLabelId(null)}_errorMessageChanged(n){this._errorController.setErrorMessage(n)}_helperTextChanged(n){this._helperController.setHelperText(n)}_ariaTargetChanged(n){n&&this._fieldAriaController.setTarget(n)}_requiredChanged(n){this._fieldAriaController.setRequired(n)}_invalidChanged(n){this._errorController.setInvalid(n),setTimeout(()=>{if(n){const d=this._errorNode;this._fieldAriaController.setErrorId(d&&d.id)}else this._fieldAriaController.setErrorId(null)})}};/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const kd=Pt(l=>class extends l{static get properties(){return{stateTarget:{type:Object,observer:"_stateTargetChanged"}}}static get delegateAttrs(){return[]}static get delegateProps(){return[]}ready(){super.ready(),this._createDelegateAttrsObserver(),this._createDelegatePropsObserver()}_stateTargetChanged(n){n&&(this._ensureAttrsDelegated(),this._ensurePropsDelegated())}_createDelegateAttrsObserver(){this._createMethodObserver(`_delegateAttrsChanged(${this.constructor.delegateAttrs.join(", ")})`)}_createDelegatePropsObserver(){this._createMethodObserver(`_delegatePropsChanged(${this.constructor.delegateProps.join(", ")})`)}_ensureAttrsDelegated(){this.constructor.delegateAttrs.forEach(n=>{this._delegateAttribute(n,this[n])})}_ensurePropsDelegated(){this.constructor.delegateProps.forEach(n=>{this._delegateProperty(n,this[n])})}_delegateAttrsChanged(...n){this.constructor.delegateAttrs.forEach((d,u)=>{this._delegateAttribute(d,n[u])})}_delegatePropsChanged(...n){this.constructor.delegateProps.forEach((d,u)=>{this._delegateProperty(d,n[u])})}_delegateAttribute(n,d){this.stateTarget&&(n==="invalid"&&this._delegateAttribute("aria-invalid",d?"true":!1),typeof d=="boolean"?this.stateTarget.toggleAttribute(n,d):d?this.stateTarget.setAttribute(n,d):this.stateTarget.removeAttribute(n))}_delegateProperty(n,d){this.stateTarget&&(this.stateTarget[n]=d)}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Dd=Pt(l=>class extends kd(Oo(Io(l))){static get constraints(){return["required"]}static get delegateAttrs(){return[...super.delegateAttrs,"required"]}ready(){super.ready(),this._createConstraintsObserver()}checkValidity(){return this.inputElement&&this._hasValidConstraints(this.constructor.constraints.map(n=>this[n]))?this.inputElement.checkValidity():!this.invalid}_hasValidConstraints(n){return n.some(d=>this.__isValidConstraint(d))}_createConstraintsObserver(){this._createMethodObserver(`_constraintsChanged(stateTarget, ${this.constructor.constraints.join(", ")})`)}_constraintsChanged(n,...d){if(!n)return;const u=this._hasValidConstraints(d),g=this.__previousHasConstraints&&!u;(this._hasValue||this.invalid)&&u?this._requestValidation():g&&!this.manualValidation&&this._setInvalid(!1),this.__previousHasConstraints=u}_onChange(n){n.stopPropagation(),this._requestValidation(),this.dispatchEvent(new CustomEvent("change",{detail:{sourceEvent:n},bubbles:n.bubbles,cancelable:n.cancelable}))}__isValidConstraint(n){return!!n||n===0}});/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Md=l=>class extends bd(md(Dd(Rd(yd(Os(l)))))){static get properties(){return{allowedCharPattern:{type:String,observer:"_allowedCharPatternChanged"},autoselect:{type:Boolean,value:!1},name:{type:String,reflectToAttribute:!0},placeholder:{type:String,reflectToAttribute:!0},readonly:{type:Boolean,value:!1,reflectToAttribute:!0},title:{type:String,reflectToAttribute:!0}}}static get delegateAttrs(){return[...super.delegateAttrs,"name","type","placeholder","readonly","invalid","title"]}constructor(){super(),this._boundOnPaste=this._onPaste.bind(this),this._boundOnDrop=this._onDrop.bind(this),this._boundOnBeforeInput=this._onBeforeInput.bind(this)}get slotStyles(){const n=this.localName;return[`
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
        `]}_onFocus(n){super._onFocus(n),this.autoselect&&this.inputElement&&this.inputElement.select()}_addInputListeners(n){super._addInputListeners(n),n.addEventListener("paste",this._boundOnPaste),n.addEventListener("drop",this._boundOnDrop),n.addEventListener("beforeinput",this._boundOnBeforeInput)}_removeInputListeners(n){super._removeInputListeners(n),n.removeEventListener("paste",this._boundOnPaste),n.removeEventListener("drop",this._boundOnDrop),n.removeEventListener("beforeinput",this._boundOnBeforeInput)}_onKeyDown(n){super._onKeyDown(n),this.allowedCharPattern&&!this.__shouldAcceptKey(n)&&n.target===this.inputElement&&(n.preventDefault(),this._markInputPrevented())}_markInputPrevented(){this.setAttribute("input-prevented",""),this._preventInputDebouncer=ir.debounce(this._preventInputDebouncer,ql.after(200),()=>{this.removeAttribute("input-prevented")})}__shouldAcceptKey(n){return n.metaKey||n.ctrlKey||!n.key||n.key.length!==1||this.__allowedCharRegExp.test(n.key)}_onPaste(n){if(this.allowedCharPattern){const d=n.clipboardData.getData("text");this.__allowedTextRegExp.test(d)||(n.preventDefault(),this._markInputPrevented())}}_onDrop(n){if(this.allowedCharPattern){const d=n.dataTransfer.getData("text");this.__allowedTextRegExp.test(d)||(n.preventDefault(),this._markInputPrevented())}}_onBeforeInput(n){this.allowedCharPattern&&n.data&&!this.__allowedTextRegExp.test(n.data)&&(n.preventDefault(),this._markInputPrevented())}_allowedCharPatternChanged(n){if(n)try{this.__allowedCharRegExp=new RegExp(`^${n}$`,"u"),this.__allowedTextRegExp=new RegExp(`^${n}*$`,"u")}catch(d){console.error(d)}}};/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Ro=l=>class extends Md(l){static get properties(){return{autocomplete:{type:String},autocorrect:{type:String,reflectToAttribute:!0},autocapitalize:{type:String,reflectToAttribute:!0}}}static get delegateAttrs(){return[...super.delegateAttrs,"autocapitalize","autocomplete","autocorrect"]}_inputElementChanged(n){super._inputElementChanged(n),n&&(n.value&&n.value!==this.value&&(console.warn(`Please define value on the <${this.localName}> component!`),n.value=""),this.value&&(n.value=this.value))}_setFocused(n){super._setFocused(n),!n&&document.hasFocus()&&this._requestValidation()}_onInput(n){super._onInput(n),this.invalid&&this._requestValidation()}_valueChanged(n,d){super._valueChanged(n,d),d!==void 0&&this.invalid&&this._requestValidation()}};/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class ko{constructor(a,n){this.input=a,this.__preventDuplicateLabelClick=this.__preventDuplicateLabelClick.bind(this),n.addEventListener("slot-content-changed",d=>{this.__initLabel(d.detail.node)}),this.__initLabel(n.node)}__initLabel(a){a&&(a.addEventListener("click",this.__preventDuplicateLabelClick),this.input&&a.setAttribute("for",this.input.id))}__preventDuplicateLabelClick(){const a=n=>{n.stopImmediatePropagation(),this.input.removeEventListener("click",a)};this.input.addEventListener("click",a)}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Pd extends wn{constructor(a,n){super(a,"textarea","textarea",{initializer:(d,u)=>{const g=u.getAttribute("value");g&&(d.value=g);const m=u.getAttribute("name");m&&d.setAttribute("name",m),d.id=this.defaultId,typeof n=="function"&&n(d)},useUniqueId:!0})}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Bd=l=>class extends pd(Ro(l)){static get properties(){return{maxlength:{type:Number},minlength:{type:Number},pattern:{type:String},minRows:{type:Number,value:2,observer:"__minRowsChanged"},maxRows:{type:Number}}}static get delegateAttrs(){return[...super.delegateAttrs,"maxlength","minlength","pattern"]}static get constraints(){return[...super.constraints,"maxlength","minlength","pattern"]}static get observers(){return["__updateMinHeight(minRows, inputElement)","__updateMaxHeight(maxRows, inputElement, _inputField)"]}get clearElement(){return this.$.clearButton}_onResize(){this._updateHeight(),this.__scrollPositionUpdated()}_onScroll(){this.__scrollPositionUpdated()}ready(){super.ready(),this.__textAreaController=new Pd(this,n=>{this._setInputElement(n),this._setFocusElement(n),this.stateTarget=n,this.ariaTarget=n}),this.addController(this.__textAreaController),this.addController(new ko(this.inputElement,this._labelController)),this._inputField=this.shadowRoot.querySelector("[part=input-field]"),this._inputField.addEventListener("wheel",n=>{const d=this._inputField.scrollTop;this._inputField.scrollTop+=n.deltaY,d!==this._inputField.scrollTop&&(n.preventDefault(),this.__scrollPositionUpdated())}),this._updateHeight(),this.__scrollPositionUpdated()}__scrollPositionUpdated(){this._inputField.style.setProperty("--_text-area-vertical-scroll-position","0px"),this._inputField.style.setProperty("--_text-area-vertical-scroll-position",`${this._inputField.scrollTop}px`)}_valueChanged(n,d){super._valueChanged(n,d),this._updateHeight()}_updateHeight(){const n=this.inputElement,d=this._inputField;if(!n||!d)return;const u=d.scrollTop,g=this.value?this.value.length:0;if(this._oldValueLength>=g){const C=getComputedStyle(d).height,A=getComputedStyle(n).width;d.style.height=C,n.style.maxWidth=A,n.style.alignSelf="flex-start",n.style.height="auto"}this._oldValueLength=g;const m=n.scrollHeight;m>n.clientHeight&&(n.style.height=`${m}px`),n.style.removeProperty("max-width"),n.style.removeProperty("align-self"),d.style.removeProperty("height"),d.scrollTop=u,this.__updateMaxHeight(this.maxRows)}__updateMinHeight(n){this.inputElement&&this.inputElement===this.__textAreaController.defaultNode&&(this.inputElement.rows=Math.max(n,1))}__updateMaxHeight(n){if(!(!this._inputField||!this.inputElement))if(n){const d=getComputedStyle(this.inputElement),u=getComputedStyle(this._inputField),m=parseFloat(d.lineHeight)*n,C=parseFloat(d.paddingTop)+parseFloat(d.paddingBottom)+parseFloat(d.marginTop)+parseFloat(d.marginBottom)+parseFloat(u.borderTopWidth)+parseFloat(u.borderBottomWidth)+parseFloat(u.paddingTop)+parseFloat(u.paddingBottom),A=Math.ceil(m+C);this._inputField.style.setProperty("max-height",`${A}px`)}else this._inputField.style.removeProperty("max-height")}__minRowsChanged(n){n<1&&console.warn("<vaadin-text-area> minRows must be at least 1.")}scrollToStart(){this._inputField.scrollTop=0}scrollToEnd(){this._inputField.scrollTop=this._inputField.scrollHeight}checkValidity(){if(!super.checkValidity())return!1;if(!this.pattern||!this.inputElement.value)return!0;try{const n=this.inputElement.value.match(this.pattern);return n?n[0]===n.input:!1}catch{return!0}}};/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Ld extends Bd(lr(Br(ar(or(ke))))){static get is(){return"vaadin-text-area"}static get styles(){return[So,gd]}render(){return L`
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
          theme="${Eo(this._theme)}"
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
    `}ready(){super.ready(),this._tooltipController=new Es(this),this._tooltipController.setPosition("top"),this._tooltipController.setAriaTarget(this.inputElement),this.addController(this._tooltipController)}}sr(Ld);/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Ma=Qe`
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
`,Fd=window.Vaadin.featureFlags.layoutComponentImprovements,Ud=Qe`
  ::slotted([data-height-full]) {
    flex: 1;
  }

  ::slotted(vaadin-horizontal-layout[data-height-full]),
  ::slotted(vaadin-vertical-layout[data-height-full]) {
    min-height: 0;
  }
`,zd=Fd?[Ma,Ud]:[Ma];/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Vd extends lr(Br(ar(or(ke)))){static get is(){return"vaadin-vertical-layout"}static get styles(){return zd}static get lumoInjector(){return{...super.lumoInjector,includeBaseStyles:!0}}render(){return L`<slot></slot>`}}sr(Vd);class Do{constructor(a="http://localhost:3000"){this.defaultBackendUrl=a}_getBackendUrl(){const a=localStorage.getItem("electrocheck_backend_url");return a?a.trim():this.defaultBackendUrl}_getHeaders(){const a={"Content-Type":"application/json"},n=localStorage.getItem("electrocheck_gemini_api_key");return n&&(a["x-gemini-api-key"]=n),a}async getDiagnosis(a,n){const d=this._getBackendUrl(),u=await fetch(`${d}/api/gemini/diagnosis`,{method:"POST",headers:this._getHeaders(),body:JSON.stringify({imageBase64:a,description:n})});if(!u.ok){const g=await u.json();throw new Error(g.error||"Fehler bei der Diagnoseanfrage über den Proxy.")}try{return await u.json()}catch(g){throw console.error("Fehler beim Parsen der Diagnoseantwort:",g),new Error("Diagnose fehlgeschlagen. Ungültige Antwort vom Server.")}}async scanTypePlate(a){const n=this._getBackendUrl(),d={imageBase64:a},u=await fetch(`${n}/api/gemini/scanTypePlate`,{method:"POST",headers:this._getHeaders(),body:JSON.stringify(d)});if(!u.ok){const g=await u.json();throw new Error(g.error||"API Fehler beim Scannen des Typenschilds über den Proxy.")}try{return await u.json()}catch(g){throw console.error("Fehler beim Parsen der OCR-Antwort:",g),new Error("OCR-Scan fehlgeschlagen. Ungültige Antwort vom Server.")}}async analyzeThermalImage(a,n){const d=this._getBackendUrl(),u=await fetch(`${d}/api/gemini/thermal-analysis`,{method:"POST",headers:this._getHeaders(),body:JSON.stringify({imageBase64:a,description:n})});if(!u.ok){const g=await u.json();throw new Error(g.error||"Fehler bei der thermografischen Analyse über den Proxy.")}try{return await u.json()}catch(g){throw console.error("Fehler beim Parsen der Thermografie-Antwort:",g),new Error("Wärmebild-Analyse fehlgeschlagen. Ungültige Antwort vom Server.")}}async scanMultimeter(a){const n=this._getBackendUrl(),d=await fetch(`${n}/api/gemini/scanMultimeter`,{method:"POST",headers:this._getHeaders(),body:JSON.stringify({imageBase64:a})});if(!d.ok){const u=await d.json();throw new Error(u.error||"Fehler beim Ablesen des Multimeters über den Proxy.")}try{return await d.json()}catch(u){throw console.error("Fehler beim Parsen der Multimeter-Antwort:",u),new Error("Multimeter-Ablesung fehlgeschlagen. Ungültige Antwort vom Server.")}}}/*! Capacitor: https://capacitorjs.com/ - MIT License */var rr;(function(l){l.Unimplemented="UNIMPLEMENTED",l.Unavailable="UNAVAILABLE"})(rr||(rr={}));class ns extends Error{constructor(a,n,d){super(a),this.message=a,this.code=n,this.data=d}}const $d=l=>{var a,n;return l!=null&&l.androidBridge?"android":!((n=(a=l==null?void 0:l.webkit)===null||a===void 0?void 0:a.messageHandlers)===null||n===void 0)&&n.bridge?"ios":"web"},Hd=l=>{const a=l.CapacitorCustomPlatform||null,n=l.Capacitor||{},d=n.Plugins=n.Plugins||{},u=()=>a!==null?a.name:$d(l),g=()=>u()!=="web",m=I=>{const $=_.get(I);return!!($!=null&&$.platforms.has(u())||C(I))},C=I=>{var $;return($=n.PluginHeaders)===null||$===void 0?void 0:$.find(X=>X.name===I)},A=I=>l.console.error(I),_=new Map,k=(I,$={})=>{const X=_.get(I);if(X)return console.warn(`Capacitor plugin "${I}" already registered. Cannot register plugins twice.`),X.proxy;const pe=u(),te=C(I);let Le;const Ce=async()=>(!Le&&pe in $?Le=typeof $[pe]=="function"?Le=await $[pe]():Le=$[pe]:a!==null&&!Le&&"web"in $&&(Le=typeof $.web=="function"?Le=await $.web():Le=$.web),Le),le=(ie,P)=>{var et,De;if(te){const Z=te==null?void 0:te.methods.find(se=>P===se.name);if(Z)return Z.rtype==="promise"?se=>n.nativePromise(I,P.toString(),se):(se,Me)=>n.nativeCallback(I,P.toString(),se,Me);if(ie)return(et=ie[P])===null||et===void 0?void 0:et.bind(ie)}else{if(ie)return(De=ie[P])===null||De===void 0?void 0:De.bind(ie);throw new ns(`"${I}" plugin is not implemented on ${pe}`,rr.Unimplemented)}},K=ie=>{let P;const et=(...De)=>{const Z=Ce().then(se=>{const Me=le(se,ie);if(Me){const D=Me(...De);return P=D==null?void 0:D.remove,D}else throw new ns(`"${I}.${ie}()" is not implemented on ${pe}`,rr.Unimplemented)});return ie==="addListener"&&(Z.remove=async()=>P()),Z};return et.toString=()=>`${ie.toString()}() { [capacitor code] }`,Object.defineProperty(et,"name",{value:ie,writable:!1,configurable:!1}),et},ce=K("addListener"),ut=K("removeListener"),we=(ie,P)=>{const et=ce({eventName:ie},P),De=async()=>{const se=await et;ut({eventName:ie,callbackId:se},P)},Z=new Promise(se=>et.then(()=>se({remove:De})));return Z.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await De()},Z},z=new Proxy({},{get(ie,P){switch(P){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return te?we:ce;case"removeListener":return ut;default:return K(P)}}});return d[I]=z,_.set(I,{name:I,proxy:z,platforms:new Set([...Object.keys($),...te?[pe]:[]])}),z};return n.convertFileSrc||(n.convertFileSrc=I=>I),n.getPlatform=u,n.handleError=A,n.isNativePlatform=g,n.isPluginAvailable=m,n.registerPlugin=k,n.Exception=ns,n.DEBUG=!!n.DEBUG,n.isLoggingEnabled=!!n.isLoggingEnabled,n},Gd=l=>l.Capacitor=Hd(l),xs=Gd(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),Lr=xs.registerPlugin;class Ms{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(a,n){let d=!1;this.listeners[a]||(this.listeners[a]=[],d=!0),this.listeners[a].push(n);const g=this.windowListeners[a];g&&!g.registered&&this.addWindowListener(g),d&&this.sendRetainedArgumentsForEvent(a);const m=async()=>this.removeListener(a,n);return Promise.resolve({remove:m})}async removeAllListeners(){this.listeners={};for(const a in this.windowListeners)this.removeWindowListener(this.windowListeners[a]);this.windowListeners={}}notifyListeners(a,n,d){const u=this.listeners[a];if(!u){if(d){let g=this.retainedEventArguments[a];g||(g=[]),g.push(n),this.retainedEventArguments[a]=g}return}u.forEach(g=>g(n))}hasListeners(a){var n;return!!(!((n=this.listeners[a])===null||n===void 0)&&n.length)}registerWindowListener(a,n){this.windowListeners[n]={registered:!1,windowEventName:a,pluginEventName:n,handler:d=>{this.notifyListeners(n,d)}}}unimplemented(a="not implemented"){return new xs.Exception(a,rr.Unimplemented)}unavailable(a="not available"){return new xs.Exception(a,rr.Unavailable)}async removeListener(a,n){const d=this.listeners[a];if(!d)return;const u=d.indexOf(n);this.listeners[a].splice(u,1),this.listeners[a].length||this.removeWindowListener(this.windowListeners[a])}addWindowListener(a){window.addEventListener(a.windowEventName,a.handler),a.registered=!0}removeWindowListener(a){a&&(window.removeEventListener(a.windowEventName,a.handler),a.registered=!1)}sendRetainedArgumentsForEvent(a){const n=this.retainedEventArguments[a];n&&(delete this.retainedEventArguments[a],n.forEach(d=>{this.notifyListeners(a,d)}))}}const Pa=l=>encodeURIComponent(l).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),Ba=l=>l.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent);class Wd extends Ms{async getCookies(){const a=document.cookie,n={};return a.split(";").forEach(d=>{if(d.length<=0)return;let[u,g]=d.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");u=Ba(u).trim(),g=Ba(g).trim(),n[u]=g}),n}async setCookie(a){try{const n=Pa(a.key),d=Pa(a.value),u=a.expires?`; expires=${a.expires.replace("expires=","")}`:"",g=(a.path||"/").replace("path=",""),m=a.url!=null&&a.url.length>0?`domain=${a.url}`:"";document.cookie=`${n}=${d||""}${u}; path=${g}; ${m};`}catch(n){return Promise.reject(n)}}async deleteCookie(a){try{document.cookie=`${a.key}=; Max-Age=0`}catch(n){return Promise.reject(n)}}async clearCookies(){try{const a=document.cookie.split(";")||[];for(const n of a)document.cookie=n.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(a){return Promise.reject(a)}}async clearAllCookies(){try{await this.clearCookies()}catch(a){return Promise.reject(a)}}}Lr("CapacitorCookies",{web:()=>new Wd});const Xd=async l=>new Promise((a,n)=>{const d=new FileReader;d.onload=()=>{const u=d.result;a(u.indexOf(",")>=0?u.split(",")[1]:u)},d.onerror=u=>n(u),d.readAsDataURL(l)}),jd=(l={})=>{const a=Object.keys(l);return Object.keys(l).map(u=>u.toLocaleLowerCase()).reduce((u,g,m)=>(u[g]=l[a[m]],u),{})},Kd=(l,a=!0)=>l?Object.entries(l).reduce((d,u)=>{const[g,m]=u;let C,A;return Array.isArray(m)?(A="",m.forEach(_=>{C=a?encodeURIComponent(_):_,A+=`${g}=${C}&`}),A.slice(0,-1)):(C=a?encodeURIComponent(m):m,A=`${g}=${C}`),`${d}&${A}`},"").substr(1):null,Yd=(l,a={})=>{const n=Object.assign({method:l.method||"GET",headers:l.headers},a),u=jd(l.headers)["content-type"]||"";if(typeof l.data=="string")n.body=l.data;else if(u.includes("application/x-www-form-urlencoded")){const g=new URLSearchParams;for(const[m,C]of Object.entries(l.data||{}))g.set(m,C);n.body=g.toString()}else if(u.includes("multipart/form-data")||l.data instanceof FormData){const g=new FormData;if(l.data instanceof FormData)l.data.forEach((C,A)=>{g.append(A,C)});else for(const C of Object.keys(l.data))g.append(C,l.data[C]);n.body=g;const m=new Headers(n.headers);m.delete("content-type"),n.headers=m}else(u.includes("application/json")||typeof l.data=="object")&&(n.body=JSON.stringify(l.data));return n};class Zd extends Ms{async request(a){const n=Yd(a,a.webFetchExtra),d=Kd(a.params,a.shouldEncodeUrlParams),u=d?`${a.url}?${d}`:a.url,g=await fetch(u,n),m=g.headers.get("content-type")||"";let{responseType:C="text"}=g.ok?a:{};m.includes("application/json")&&(C="json");let A,_;switch(C){case"arraybuffer":case"blob":_=await g.blob(),A=await Xd(_);break;case"json":A=await g.json();break;case"document":case"text":default:A=await g.text()}const k={};return g.headers.forEach((I,$)=>{k[$]=I}),{data:A,headers:k,status:g.status,url:g.url}}async get(a){return this.request(Object.assign(Object.assign({},a),{method:"GET"}))}async post(a){return this.request(Object.assign(Object.assign({},a),{method:"POST"}))}async put(a){return this.request(Object.assign(Object.assign({},a),{method:"PUT"}))}async patch(a){return this.request(Object.assign(Object.assign({},a),{method:"PATCH"}))}async delete(a){return this.request(Object.assign(Object.assign({},a),{method:"DELETE"}))}}Lr("CapacitorHttp",{web:()=>new Zd});var La;(function(l){l.Dark="DARK",l.Light="LIGHT",l.Default="DEFAULT"})(La||(La={}));var Fa;(function(l){l.StatusBar="StatusBar",l.NavigationBar="NavigationBar"})(Fa||(Fa={}));class qd extends Ms{async setStyle(){this.unavailable("not available for web")}async setAnimation(){this.unavailable("not available for web")}async show(){this.unavailable("not available for web")}async hide(){this.unavailable("not available for web")}}Lr("SystemBars",{web:()=>new qd});const ws=Lr("Network",{web:()=>gi(()=>import("./web-DiKSsQLu.js"),[]).then(l=>new l.NetworkWeb)});class Qd{async createMaintenanceTicket(a){if(!(await ws.getStatus()).connected){const d=localStorage.getItem("electrocheck_offline_tickets"),u=d?JSON.parse(d):[];throw u.push(a),localStorage.setItem("electrocheck_offline_tickets",JSON.stringify(u)),new Error("Offline! Das Ticket wurde in der Offline-Warteschlange gespeichert und wird synchronisiert, sobald Sie wieder online sind.")}return console.log("Sende Daten an Backend...",a),new Promise((d,u)=>{setTimeout(()=>{if(Math.random()>.05){const g=`TKT-${new Date().getFullYear()}-${Math.floor(Math.random()*1e4).toString().padStart(4,"0")}`;d(g)}else u(new Error("503 Service Unavailable: Backend antwortet nicht."))},2e3)})}async syncOfflineTickets(){const a=localStorage.getItem("electrocheck_offline_tickets");if(!a)return 0;const n=JSON.parse(a);if(n.length===0)return 0;console.log(`Synchronisiere ${n.length} Offline-Ticket(s)...`);let d=0;for(const u of n)try{console.log(`Lade Ticket für ${u.deviceName} hoch...`),await new Promise(g=>setTimeout(g,1e3)),d++}catch(g){console.error("Fehler beim Synchronisieren eines Offline-Tickets:",g)}return localStorage.removeItem("electrocheck_offline_tickets"),d}}class Jd{constructor(a="http://localhost:3000"){this.defaultBackendUrl=a}_getBackendUrl(){const a=localStorage.getItem("electrocheck_backend_url");return a?a.trim():this.defaultBackendUrl}_getHeaders(){const a={"Content-Type":"application/json"},n=localStorage.getItem("electrocheck_perplexity_api_key");return n&&(a["x-perplexity-api-key"]=n),a}async search(a){const n=this._getBackendUrl(),d=await fetch(`${n}/api/perplexity/search`,{method:"POST",headers:this._getHeaders(),body:JSON.stringify({query:a})});if(!d.ok){const u=await d.json();throw new Error(u.error||"Fehler bei der Perplexity-Suche über das Backend.")}try{return(await d.json()).answer}catch(u){throw console.error("Fehler beim Parsen der Perplexity-Antwort:",u),new Error("Suche fehlgeschlagen. Ungültige Antwort vom Server.")}}}function eh(l){l.CapacitorUtils.Synapse=new Proxy({},{get(a,n){return new Proxy({},{get(d,u){return(g,m,C)=>{const A=l.Capacitor.Plugins[n];if(A===void 0){C(new Error(`Capacitor plugin ${n} not found`));return}if(typeof A[u]!="function"){C(new Error(`Method ${u} not found in Capacitor plugin ${n}`));return}(async()=>{try{const _=await A[u](g);m(_)}catch(_){C(_)}})()}}})}})}function th(l){l.CapacitorUtils.Synapse=new Proxy({},{get(a,n){return l.cordova.plugins[n]}})}function ih(l=!1){typeof window>"u"||(window.CapacitorUtils=window.CapacitorUtils||{},window.Capacitor!==void 0&&!l?eh(window):window.cordova!==void 0&&th(window))}const ss=Lr("Geolocation",{web:()=>gi(()=>import("./web-DW8Yz6ur.js"),[]).then(l=>new l.GeolocationWeb)});ih();const rh=[{id:"err-001",model:"Dell E2222H",errorCode:"No video/Power LED off",diagnosis:"Es wird kein Bild angezeigt und die Betriebsanzeige (LED) ist aus.",action:"Sicherstellen, dass das Videokabel richtig angeschlossen ist, die Steckdose funktioniert und der Netzschalter gedrückt ist.",safety:"Vor Beginn der Fehlerbehebung zwingend die allgemeinen Sicherheitshinweise befolgen."},{id:"err-002",model:"Saeco Royal",errorCode:"FILL WATER / DE-AERATE",diagnosis:"Der Wassertank ist leer oder es befindet sich Luft im Wassersystem.",action:"Den Wassertank füllen oder die Heißwassertaste drücken, um das System zu entlüften.",safety:"Vor Reparaturarbeiten muss die Maschine zwingend vom Stromnetz getrennt werden."},{id:"err-003",model:"Saeco Royal",errorCode:"GRINDER OBSTRUCTED",diagnosis:"Das Mahlwerk der Maschine ist blockiert.",action:"Das Mahlwerk muss gereinigt werden.",safety:"Alle Vorschriften zur Reparatur elektrischer Geräte beachten und den Netzstecker ziehen."},{id:"err-004",model:"Dell E2222H",errorCode:"Missing pixels",diagnosis:"Es fehlen Pixel auf dem Bildschirm, was auch ein natürlicher Defekt der LCD-Technologie sein kann.",action:"Die Stromversorgung aus- und wieder einschalten (Cycle power On-off).",safety:"Sämtliche Schritte nur nach Beachtung der Sicherheitshinweise durchführen."},{id:"err-005",model:"Saeco Royal",errorCode:"OVERHEATING",diagnosis:"Nach der Dampfausgabe ist das System nicht oder nur unzureichend abgekühlt.",action:"Heißwasser ausgeben, um das System abzukühlen, bis die Warnung erlischt.",safety:"Vorsicht vor Verbrennungen durch heißen Dampf oder heißes Wasser."}],nh="electrocheck_offline_db",Li="datasheets",sh=1;function Ps(){return new Promise((l,a)=>{const n=indexedDB.open(nh,sh);n.onerror=()=>a(n.error),n.onsuccess=()=>l(n.result),n.onupgradeneeded=d=>{const u=n.result;u.objectStoreNames.contains(Li)||u.createObjectStore(Li,{keyPath:"id",autoIncrement:!0})}})}async function ah(l){const a=await Ps();return new Promise((n,d)=>{const u=a.transaction(Li,"readwrite"),m=u.objectStore(u.objectStoreNames[0]).put(l);m.onsuccess=()=>n(m.result),m.onerror=()=>d(m.error)})}async function Mo(){const l=await Ps();return new Promise((a,n)=>{const g=l.transaction(Li,"readonly").objectStore(Li).getAll();g.onsuccess=()=>a(g.result||[]),g.onerror=()=>n(g.error)})}async function oh(l){const a=await Ps();return new Promise((n,d)=>{const m=a.transaction(Li,"readwrite").objectStore(Li).delete(l);m.onsuccess=()=>n(),m.onerror=()=>d(m.error)})}async function lh(l){if(!l)return null;const a=await Mo(),n=l.toLowerCase().trim();for(const d of a){const u=d.modelMatch.toLowerCase().trim();if(n.includes(u)||u.includes(n))return d}return null}var W;(function(l){l[l.QR_CODE=0]="QR_CODE",l[l.AZTEC=1]="AZTEC",l[l.CODABAR=2]="CODABAR",l[l.CODE_39=3]="CODE_39",l[l.CODE_93=4]="CODE_93",l[l.CODE_128=5]="CODE_128",l[l.DATA_MATRIX=6]="DATA_MATRIX",l[l.MAXICODE=7]="MAXICODE",l[l.ITF=8]="ITF",l[l.EAN_13=9]="EAN_13",l[l.EAN_8=10]="EAN_8",l[l.PDF_417=11]="PDF_417",l[l.RSS_14=12]="RSS_14",l[l.RSS_EXPANDED=13]="RSS_EXPANDED",l[l.UPC_A=14]="UPC_A",l[l.UPC_E=15]="UPC_E",l[l.UPC_EAN_EXTENSION=16]="UPC_EAN_EXTENSION"})(W||(W={}));var Ua=new Map([[W.QR_CODE,"QR_CODE"],[W.AZTEC,"AZTEC"],[W.CODABAR,"CODABAR"],[W.CODE_39,"CODE_39"],[W.CODE_93,"CODE_93"],[W.CODE_128,"CODE_128"],[W.DATA_MATRIX,"DATA_MATRIX"],[W.MAXICODE,"MAXICODE"],[W.ITF,"ITF"],[W.EAN_13,"EAN_13"],[W.EAN_8,"EAN_8"],[W.PDF_417,"PDF_417"],[W.RSS_14,"RSS_14"],[W.RSS_EXPANDED,"RSS_EXPANDED"],[W.UPC_A,"UPC_A"],[W.UPC_E,"UPC_E"],[W.UPC_EAN_EXTENSION,"UPC_EAN_EXTENSION"]]),za;(function(l){l[l.UNKNOWN=0]="UNKNOWN",l[l.URL=1]="URL"})(za||(za={}));function ch(l){return Object.values(W).includes(l)}var ln;(function(l){l[l.SCAN_TYPE_CAMERA=0]="SCAN_TYPE_CAMERA",l[l.SCAN_TYPE_FILE=1]="SCAN_TYPE_FILE"})(ln||(ln={}));var dh=function(){function l(){}return l.GITHUB_PROJECT_URL="https://github.com/mebjas/html5-qrcode",l.SCAN_DEFAULT_FPS=2,l.DEFAULT_DISABLE_FLIP=!1,l.DEFAULT_REMEMBER_LAST_CAMERA_USED=!0,l.DEFAULT_SUPPORTED_SCAN_TYPE=[ln.SCAN_TYPE_CAMERA,ln.SCAN_TYPE_FILE],l}(),Po=function(){function l(a,n){this.format=a,this.formatName=n}return l.prototype.toString=function(){return this.formatName},l.create=function(a){if(!Ua.has(a))throw"".concat(a," not in html5QrcodeSupportedFormatsTextMap");return new l(a,Ua.get(a))},l}(),Va=function(){function l(){}return l.createFromText=function(a){var n={text:a};return{decodedText:a,result:n}},l.createFromQrcodeResult=function(a){return{decodedText:a.text,result:a}},l}(),bs;(function(l){l[l.UNKWOWN_ERROR=0]="UNKWOWN_ERROR",l[l.IMPLEMENTATION_ERROR=1]="IMPLEMENTATION_ERROR",l[l.NO_CODE_FOUND_ERROR=2]="NO_CODE_FOUND_ERROR"})(bs||(bs={}));var hh=function(){function l(){}return l.createFrom=function(a){return{errorMessage:a,type:bs.UNKWOWN_ERROR}},l}(),uh=function(){function l(a){this.verbose=a}return l.prototype.log=function(a){this.verbose&&console.log(a)},l.prototype.warn=function(a){this.verbose&&console.warn(a)},l.prototype.logError=function(a,n){(this.verbose||n===!0)&&console.error(a)},l.prototype.logErrors=function(a){if(a.length===0)throw"Logger#logError called without arguments";this.verbose&&console.error(a)},l}();function Yt(l){return typeof l>"u"||l===null}var qi=function(){function l(){}return l.codeParseError=function(a){return"QR code parse error, error = ".concat(a)},l.errorGettingUserMedia=function(a){return"Error getting userMedia, error = ".concat(a)},l.onlyDeviceSupportedError=function(){return"The device doesn't support navigator.mediaDevices , only supported cameraIdOrConfig in this case is deviceId parameter (string)."},l.cameraStreamingNotSupported=function(){return"Camera streaming not supported by the browser."},l.unableToQuerySupportedDevices=function(){return"Unable to query supported devices, unknown error."},l.insecureContextCameraQueryError=function(){return"Camera access is only supported in secure context like https or localhost."},l.scannerPaused=function(){return"Scanner paused"},l}(),Bo=function(){function l(){}return l.isMediaStreamConstraintsValid=function(a,n){if(typeof a!="object"){var d=typeof a;return n.logError("videoConstraints should be of type object, the "+"object passed is of type ".concat(d,"."),!0),!1}for(var u=["autoGainControl","channelCount","echoCancellation","latency","noiseSuppression","sampleRate","sampleSize","volume"],g=new Set(u),m=Object.keys(a),C=0,A=m;C<A.length;C++){var _=A[C];if(g.has(_))return n.logError("".concat(_," is not supported videoConstaints."),!0),!1}return!0},l}(),Er=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function Fu(l){return l&&l.__esModule&&Object.prototype.hasOwnProperty.call(l,"default")?l.default:l}var _s={exports:{}};(function(l,a){(function(n,d){d(a)})(Er,function(n){function d(x){return x==null}var u=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(x,e){x.__proto__=e}||function(x,e){for(var t in e)e.hasOwnProperty(t)&&(x[t]=e[t])};function g(x,e){u(x,e);function t(){this.constructor=x}x.prototype=e===null?Object.create(e):(t.prototype=e.prototype,new t)}function m(x,e){var t=Object.setPrototypeOf;t?t(x,e):x.__proto__=e}function C(x,e){e===void 0&&(e=x.constructor);var t=Error.captureStackTrace;t&&t(x,e)}var A=function(x){g(e,x);function e(t){var i=this.constructor,r=x.call(this,t)||this;return Object.defineProperty(r,"name",{value:i.name,enumerable:!1}),m(r,i.prototype),C(r),r}return e}(Error);class _ extends A{constructor(e=void 0){super(e),this.message=e}getKind(){return this.constructor.kind}}_.kind="Exception";class k extends _{}k.kind="ArgumentException";class I extends _{}I.kind="IllegalArgumentException";class ${constructor(e){if(this.binarizer=e,e===null)throw new I("Binarizer must be non-null.")}getWidth(){return this.binarizer.getWidth()}getHeight(){return this.binarizer.getHeight()}getBlackRow(e,t){return this.binarizer.getBlackRow(e,t)}getBlackMatrix(){return(this.matrix===null||this.matrix===void 0)&&(this.matrix=this.binarizer.getBlackMatrix()),this.matrix}isCropSupported(){return this.binarizer.getLuminanceSource().isCropSupported()}crop(e,t,i,r){const s=this.binarizer.getLuminanceSource().crop(e,t,i,r);return new $(this.binarizer.createBinarizer(s))}isRotateSupported(){return this.binarizer.getLuminanceSource().isRotateSupported()}rotateCounterClockwise(){const e=this.binarizer.getLuminanceSource().rotateCounterClockwise();return new $(this.binarizer.createBinarizer(e))}rotateCounterClockwise45(){const e=this.binarizer.getLuminanceSource().rotateCounterClockwise45();return new $(this.binarizer.createBinarizer(e))}toString(){try{return this.getBlackMatrix().toString()}catch{return""}}}class X extends _{static getChecksumInstance(){return new X}}X.kind="ChecksumException";class pe{constructor(e){this.source=e}getLuminanceSource(){return this.source}getWidth(){return this.source.getWidth()}getHeight(){return this.source.getHeight()}}class te{static arraycopy(e,t,i,r,s){for(;s--;)i[r++]=e[t++]}static currentTimeMillis(){return Date.now()}}class Le extends _{}Le.kind="IndexOutOfBoundsException";class Ce extends Le{constructor(e=void 0,t=void 0){super(t),this.index=e,this.message=t}}Ce.kind="ArrayIndexOutOfBoundsException";class le{static fill(e,t){for(let i=0,r=e.length;i<r;i++)e[i]=t}static fillWithin(e,t,i,r){le.rangeCheck(e.length,t,i);for(let s=t;s<i;s++)e[s]=r}static rangeCheck(e,t,i){if(t>i)throw new I("fromIndex("+t+") > toIndex("+i+")");if(t<0)throw new Ce(t);if(i>e)throw new Ce(i)}static asList(...e){return e}static create(e,t,i){return Array.from({length:e}).map(s=>Array.from({length:t}).fill(i))}static createInt32Array(e,t,i){return Array.from({length:e}).map(s=>Int32Array.from({length:t}).fill(i))}static equals(e,t){if(!e||!t||!e.length||!t.length||e.length!==t.length)return!1;for(let i=0,r=e.length;i<r;i++)if(e[i]!==t[i])return!1;return!0}static hashCode(e){if(e===null)return 0;let t=1;for(const i of e)t=31*t+i;return t}static fillUint8Array(e,t){for(let i=0;i!==e.length;i++)e[i]=t}static copyOf(e,t){return e.slice(0,t)}static copyOfUint8Array(e,t){if(e.length<=t){const i=new Uint8Array(t);return i.set(e),i}return e.slice(0,t)}static copyOfRange(e,t,i){const r=i-t,s=new Int32Array(r);return te.arraycopy(e,t,s,0,r),s}static binarySearch(e,t,i){i===void 0&&(i=le.numberComparator);let r=0,s=e.length-1;for(;r<=s;){const o=s+r>>1,c=i(t,e[o]);if(c>0)r=o+1;else if(c<0)s=o-1;else return o}return-r-1}static numberComparator(e,t){return e-t}}class K{static numberOfTrailingZeros(e){let t;if(e===0)return 32;let i=31;return t=e<<16,t!==0&&(i-=16,e=t),t=e<<8,t!==0&&(i-=8,e=t),t=e<<4,t!==0&&(i-=4,e=t),t=e<<2,t!==0&&(i-=2,e=t),i-(e<<1>>>31)}static numberOfLeadingZeros(e){if(e===0)return 32;let t=1;return e>>>16||(t+=16,e<<=16),e>>>24||(t+=8,e<<=8),e>>>28||(t+=4,e<<=4),e>>>30||(t+=2,e<<=2),t-=e>>>31,t}static toHexString(e){return e.toString(16)}static toBinaryString(e){return String(parseInt(String(e),2))}static bitCount(e){return e=e-(e>>>1&1431655765),e=(e&858993459)+(e>>>2&858993459),e=e+(e>>>4)&252645135,e=e+(e>>>8),e=e+(e>>>16),e&63}static truncDivision(e,t){return Math.trunc(e/t)}static parseInt(e,t=void 0){return parseInt(e,t)}}K.MIN_VALUE_32_BITS=-2147483648,K.MAX_VALUE=Number.MAX_SAFE_INTEGER;class ce{constructor(e,t){e===void 0?(this.size=0,this.bits=new Int32Array(1)):(this.size=e,t==null?this.bits=ce.makeArray(e):this.bits=t)}getSize(){return this.size}getSizeInBytes(){return Math.floor((this.size+7)/8)}ensureCapacity(e){if(e>this.bits.length*32){const t=ce.makeArray(e);te.arraycopy(this.bits,0,t,0,this.bits.length),this.bits=t}}get(e){return(this.bits[Math.floor(e/32)]&1<<(e&31))!==0}set(e){this.bits[Math.floor(e/32)]|=1<<(e&31)}flip(e){this.bits[Math.floor(e/32)]^=1<<(e&31)}getNextSet(e){const t=this.size;if(e>=t)return t;const i=this.bits;let r=Math.floor(e/32),s=i[r];s&=~((1<<(e&31))-1);const o=i.length;for(;s===0;){if(++r===o)return t;s=i[r]}const c=r*32+K.numberOfTrailingZeros(s);return c>t?t:c}getNextUnset(e){const t=this.size;if(e>=t)return t;const i=this.bits;let r=Math.floor(e/32),s=~i[r];s&=~((1<<(e&31))-1);const o=i.length;for(;s===0;){if(++r===o)return t;s=~i[r]}const c=r*32+K.numberOfTrailingZeros(s);return c>t?t:c}setBulk(e,t){this.bits[Math.floor(e/32)]=t}setRange(e,t){if(t<e||e<0||t>this.size)throw new I;if(t===e)return;t--;const i=Math.floor(e/32),r=Math.floor(t/32),s=this.bits;for(let o=i;o<=r;o++){const c=o>i?0:e&31,f=(2<<(o<r?31:t&31))-(1<<c);s[o]|=f}}clear(){const e=this.bits.length,t=this.bits;for(let i=0;i<e;i++)t[i]=0}isRange(e,t,i){if(t<e||e<0||t>this.size)throw new I;if(t===e)return!0;t--;const r=Math.floor(e/32),s=Math.floor(t/32),o=this.bits;for(let c=r;c<=s;c++){const h=c>r?0:e&31,p=(2<<(c<s?31:t&31))-(1<<h)&4294967295;if((o[c]&p)!==(i?p:0))return!1}return!0}appendBit(e){this.ensureCapacity(this.size+1),e&&(this.bits[Math.floor(this.size/32)]|=1<<(this.size&31)),this.size++}appendBits(e,t){if(t<0||t>32)throw new I("Num bits must be between 0 and 32");this.ensureCapacity(this.size+t);for(let i=t;i>0;i--)this.appendBit((e>>i-1&1)===1)}appendBitArray(e){const t=e.size;this.ensureCapacity(this.size+t);for(let i=0;i<t;i++)this.appendBit(e.get(i))}xor(e){if(this.size!==e.size)throw new I("Sizes don't match");const t=this.bits;for(let i=0,r=t.length;i<r;i++)t[i]^=e.bits[i]}toBytes(e,t,i,r){for(let s=0;s<r;s++){let o=0;for(let c=0;c<8;c++)this.get(e)&&(o|=1<<7-c),e++;t[i+s]=o}}getBitArray(){return this.bits}reverse(){const e=new Int32Array(this.bits.length),t=Math.floor((this.size-1)/32),i=t+1,r=this.bits;for(let s=0;s<i;s++){let o=r[s];o=o>>1&1431655765|(o&1431655765)<<1,o=o>>2&858993459|(o&858993459)<<2,o=o>>4&252645135|(o&252645135)<<4,o=o>>8&16711935|(o&16711935)<<8,o=o>>16&65535|(o&65535)<<16,e[t-s]=o}if(this.size!==i*32){const s=i*32-this.size;let o=e[0]>>>s;for(let c=1;c<i;c++){const h=e[c];o|=h<<32-s,e[c-1]=o,o=h>>>s}e[i-1]=o}this.bits=e}static makeArray(e){return new Int32Array(Math.floor((e+31)/32))}equals(e){if(!(e instanceof ce))return!1;const t=e;return this.size===t.size&&le.equals(this.bits,t.bits)}hashCode(){return 31*this.size+le.hashCode(this.bits)}toString(){let e="";for(let t=0,i=this.size;t<i;t++)t&7||(e+=" "),e+=this.get(t)?"X":".";return e}clone(){return new ce(this.size,this.bits.slice())}}var ut;(function(x){x[x.OTHER=0]="OTHER",x[x.PURE_BARCODE=1]="PURE_BARCODE",x[x.POSSIBLE_FORMATS=2]="POSSIBLE_FORMATS",x[x.TRY_HARDER=3]="TRY_HARDER",x[x.CHARACTER_SET=4]="CHARACTER_SET",x[x.ALLOWED_LENGTHS=5]="ALLOWED_LENGTHS",x[x.ASSUME_CODE_39_CHECK_DIGIT=6]="ASSUME_CODE_39_CHECK_DIGIT",x[x.ASSUME_GS1=7]="ASSUME_GS1",x[x.RETURN_CODABAR_START_END=8]="RETURN_CODABAR_START_END",x[x.NEED_RESULT_POINT_CALLBACK=9]="NEED_RESULT_POINT_CALLBACK",x[x.ALLOWED_EAN_EXTENSIONS=10]="ALLOWED_EAN_EXTENSIONS"})(ut||(ut={}));var we=ut;class z extends _{static getFormatInstance(){return new z}}z.kind="FormatException";var ie;(function(x){x[x.Cp437=0]="Cp437",x[x.ISO8859_1=1]="ISO8859_1",x[x.ISO8859_2=2]="ISO8859_2",x[x.ISO8859_3=3]="ISO8859_3",x[x.ISO8859_4=4]="ISO8859_4",x[x.ISO8859_5=5]="ISO8859_5",x[x.ISO8859_6=6]="ISO8859_6",x[x.ISO8859_7=7]="ISO8859_7",x[x.ISO8859_8=8]="ISO8859_8",x[x.ISO8859_9=9]="ISO8859_9",x[x.ISO8859_10=10]="ISO8859_10",x[x.ISO8859_11=11]="ISO8859_11",x[x.ISO8859_13=12]="ISO8859_13",x[x.ISO8859_14=13]="ISO8859_14",x[x.ISO8859_15=14]="ISO8859_15",x[x.ISO8859_16=15]="ISO8859_16",x[x.SJIS=16]="SJIS",x[x.Cp1250=17]="Cp1250",x[x.Cp1251=18]="Cp1251",x[x.Cp1252=19]="Cp1252",x[x.Cp1256=20]="Cp1256",x[x.UnicodeBigUnmarked=21]="UnicodeBigUnmarked",x[x.UTF8=22]="UTF8",x[x.ASCII=23]="ASCII",x[x.Big5=24]="Big5",x[x.GB18030=25]="GB18030",x[x.EUC_KR=26]="EUC_KR"})(ie||(ie={}));class P{constructor(e,t,i,...r){this.valueIdentifier=e,this.name=i,typeof t=="number"?this.values=Int32Array.from([t]):this.values=t,this.otherEncodingNames=r,P.VALUE_IDENTIFIER_TO_ECI.set(e,this),P.NAME_TO_ECI.set(i,this);const s=this.values;for(let o=0,c=s.length;o!==c;o++){const h=s[o];P.VALUES_TO_ECI.set(h,this)}for(const o of r)P.NAME_TO_ECI.set(o,this)}getValueIdentifier(){return this.valueIdentifier}getName(){return this.name}getValue(){return this.values[0]}static getCharacterSetECIByValue(e){if(e<0||e>=900)throw new z("incorect value");const t=P.VALUES_TO_ECI.get(e);if(t===void 0)throw new z("incorect value");return t}static getCharacterSetECIByName(e){const t=P.NAME_TO_ECI.get(e);if(t===void 0)throw new z("incorect value");return t}equals(e){if(!(e instanceof P))return!1;const t=e;return this.getName()===t.getName()}}P.VALUE_IDENTIFIER_TO_ECI=new Map,P.VALUES_TO_ECI=new Map,P.NAME_TO_ECI=new Map,P.Cp437=new P(ie.Cp437,Int32Array.from([0,2]),"Cp437"),P.ISO8859_1=new P(ie.ISO8859_1,Int32Array.from([1,3]),"ISO-8859-1","ISO88591","ISO8859_1"),P.ISO8859_2=new P(ie.ISO8859_2,4,"ISO-8859-2","ISO88592","ISO8859_2"),P.ISO8859_3=new P(ie.ISO8859_3,5,"ISO-8859-3","ISO88593","ISO8859_3"),P.ISO8859_4=new P(ie.ISO8859_4,6,"ISO-8859-4","ISO88594","ISO8859_4"),P.ISO8859_5=new P(ie.ISO8859_5,7,"ISO-8859-5","ISO88595","ISO8859_5"),P.ISO8859_6=new P(ie.ISO8859_6,8,"ISO-8859-6","ISO88596","ISO8859_6"),P.ISO8859_7=new P(ie.ISO8859_7,9,"ISO-8859-7","ISO88597","ISO8859_7"),P.ISO8859_8=new P(ie.ISO8859_8,10,"ISO-8859-8","ISO88598","ISO8859_8"),P.ISO8859_9=new P(ie.ISO8859_9,11,"ISO-8859-9","ISO88599","ISO8859_9"),P.ISO8859_10=new P(ie.ISO8859_10,12,"ISO-8859-10","ISO885910","ISO8859_10"),P.ISO8859_11=new P(ie.ISO8859_11,13,"ISO-8859-11","ISO885911","ISO8859_11"),P.ISO8859_13=new P(ie.ISO8859_13,15,"ISO-8859-13","ISO885913","ISO8859_13"),P.ISO8859_14=new P(ie.ISO8859_14,16,"ISO-8859-14","ISO885914","ISO8859_14"),P.ISO8859_15=new P(ie.ISO8859_15,17,"ISO-8859-15","ISO885915","ISO8859_15"),P.ISO8859_16=new P(ie.ISO8859_16,18,"ISO-8859-16","ISO885916","ISO8859_16"),P.SJIS=new P(ie.SJIS,20,"SJIS","Shift_JIS"),P.Cp1250=new P(ie.Cp1250,21,"Cp1250","windows-1250"),P.Cp1251=new P(ie.Cp1251,22,"Cp1251","windows-1251"),P.Cp1252=new P(ie.Cp1252,23,"Cp1252","windows-1252"),P.Cp1256=new P(ie.Cp1256,24,"Cp1256","windows-1256"),P.UnicodeBigUnmarked=new P(ie.UnicodeBigUnmarked,25,"UnicodeBigUnmarked","UTF-16BE","UnicodeBig"),P.UTF8=new P(ie.UTF8,26,"UTF8","UTF-8"),P.ASCII=new P(ie.ASCII,Int32Array.from([27,170]),"ASCII","US-ASCII"),P.Big5=new P(ie.Big5,28,"Big5"),P.GB18030=new P(ie.GB18030,29,"GB18030","GB2312","EUC_CN","GBK"),P.EUC_KR=new P(ie.EUC_KR,30,"EUC_KR","EUC-KR");class et extends _{}et.kind="UnsupportedOperationException";class De{static decode(e,t){const i=this.encodingName(t);return this.customDecoder?this.customDecoder(e,i):typeof TextDecoder>"u"||this.shouldDecodeOnFallback(i)?this.decodeFallback(e,i):new TextDecoder(i).decode(e)}static shouldDecodeOnFallback(e){return!De.isBrowser()&&e==="ISO-8859-1"}static encode(e,t){const i=this.encodingName(t);return this.customEncoder?this.customEncoder(e,i):typeof TextEncoder>"u"?this.encodeFallback(e):new TextEncoder().encode(e)}static isBrowser(){return typeof window<"u"&&{}.toString.call(window)==="[object Window]"}static encodingName(e){return typeof e=="string"?e:e.getName()}static encodingCharacterSet(e){return e instanceof P?e:P.getCharacterSetECIByName(e)}static decodeFallback(e,t){const i=this.encodingCharacterSet(t);if(De.isDecodeFallbackSupported(i)){let r="";for(let s=0,o=e.length;s<o;s++){let c=e[s].toString(16);c.length<2&&(c="0"+c),r+="%"+c}return decodeURIComponent(r)}if(i.equals(P.UnicodeBigUnmarked))return String.fromCharCode.apply(null,new Uint16Array(e.buffer));throw new et(`Encoding ${this.encodingName(t)} not supported by fallback.`)}static isDecodeFallbackSupported(e){return e.equals(P.UTF8)||e.equals(P.ISO8859_1)||e.equals(P.ASCII)}static encodeFallback(e){const i=btoa(unescape(encodeURIComponent(e))).split(""),r=[];for(let s=0;s<i.length;s++)r.push(i[s].charCodeAt(0));return new Uint8Array(r)}}class Z{static castAsNonUtf8Char(e,t=null){const i=t?t.getName():this.ISO88591;return De.decode(new Uint8Array([e]),i)}static guessEncoding(e,t){if(t!=null&&t.get(we.CHARACTER_SET)!==void 0)return t.get(we.CHARACTER_SET).toString();const i=e.length;let r=!0,s=!0,o=!0,c=0,h=0,f=0,p=0,w=0,b=0,y=0,E=0,S=0,T=0,R=0;const F=e.length>3&&e[0]===239&&e[1]===187&&e[2]===191;for(let U=0;U<i&&(r||s||o);U++){const B=e[U]&255;o&&(c>0?B&128?c--:o=!1:B&128&&(B&64?(c++,B&32?(c++,B&16?(c++,B&8?o=!1:p++):f++):h++):o=!1)),r&&(B>127&&B<160?r=!1:B>159&&(B<192||B===215||B===247)&&R++),s&&(w>0?B<64||B===127||B>252?s=!1:w--:B===128||B===160||B>239?s=!1:B>160&&B<224?(b++,E=0,y++,y>S&&(S=y)):B>127?(w++,y=0,E++,E>T&&(T=E)):(y=0,E=0))}return o&&c>0&&(o=!1),s&&w>0&&(s=!1),o&&(F||h+f+p>0)?Z.UTF8:s&&(Z.ASSUME_SHIFT_JIS||S>=3||T>=3)?Z.SHIFT_JIS:r&&s?S===2&&b===2||R*10>=i?Z.SHIFT_JIS:Z.ISO88591:r?Z.ISO88591:s?Z.SHIFT_JIS:o?Z.UTF8:Z.PLATFORM_DEFAULT_ENCODING}static format(e,...t){let i=-1;function r(o,c,h,f,p,w){if(o==="%%")return"%";if(t[++i]===void 0)return;o=f?parseInt(f.substr(1)):void 0;let b=p?parseInt(p.substr(1)):void 0,y;switch(w){case"s":y=t[i];break;case"c":y=t[i][0];break;case"f":y=parseFloat(t[i]).toFixed(o);break;case"p":y=parseFloat(t[i]).toPrecision(o);break;case"e":y=parseFloat(t[i]).toExponential(o);break;case"x":y=parseInt(t[i]).toString(b||16);break;case"d":y=parseFloat(parseInt(t[i],b||10).toPrecision(o)).toFixed(0);break}y=typeof y=="object"?JSON.stringify(y):(+y).toString(b);let E=parseInt(h),S=h&&h[0]+""=="0"?"0":" ";for(;y.length<E;)y=c!==void 0?y+S:S+y;return y}let s=/%(-)?(0?[0-9]+)?([.][0-9]+)?([#][0-9]+)?([scfpexd%])/g;return e.replace(s,r)}static getBytes(e,t){return De.encode(e,t)}static getCharCode(e,t=0){return e.charCodeAt(t)}static getCharAt(e){return String.fromCharCode(e)}}Z.SHIFT_JIS=P.SJIS.getName(),Z.GB2312="GB2312",Z.ISO88591=P.ISO8859_1.getName(),Z.EUC_JP="EUC_JP",Z.UTF8=P.UTF8.getName(),Z.PLATFORM_DEFAULT_ENCODING=Z.UTF8,Z.ASSUME_SHIFT_JIS=!1;class se{constructor(e=""){this.value=e}enableDecoding(e){return this.encoding=e,this}append(e){return typeof e=="string"?this.value+=e.toString():this.encoding?this.value+=Z.castAsNonUtf8Char(e,this.encoding):this.value+=String.fromCharCode(e),this}appendChars(e,t,i){for(let r=t;t<t+i;r++)this.append(e[r]);return this}length(){return this.value.length}charAt(e){return this.value.charAt(e)}deleteCharAt(e){this.value=this.value.substr(0,e)+this.value.substring(e+1)}setCharAt(e,t){this.value=this.value.substr(0,e)+t+this.value.substr(e+1)}substring(e,t){return this.value.substring(e,t)}setLengthToZero(){this.value=""}toString(){return this.value}insert(e,t){this.value=this.value.substr(0,e)+t+this.value.substr(e+t.length)}}class Me{constructor(e,t,i,r){if(this.width=e,this.height=t,this.rowSize=i,this.bits=r,t==null&&(t=e),this.height=t,e<1||t<1)throw new I("Both dimensions must be greater than 0");i==null&&(i=Math.floor((e+31)/32)),this.rowSize=i,r==null&&(this.bits=new Int32Array(this.rowSize*this.height))}static parseFromBooleanArray(e){const t=e.length,i=e[0].length,r=new Me(i,t);for(let s=0;s<t;s++){const o=e[s];for(let c=0;c<i;c++)o[c]&&r.set(c,s)}return r}static parseFromString(e,t,i){if(e===null)throw new I("stringRepresentation cannot be null");const r=new Array(e.length);let s=0,o=0,c=-1,h=0,f=0;for(;f<e.length;)if(e.charAt(f)===`
`||e.charAt(f)==="\r"){if(s>o){if(c===-1)c=s-o;else if(s-o!==c)throw new I("row lengths do not match");o=s,h++}f++}else if(e.substring(f,f+t.length)===t)f+=t.length,r[s]=!0,s++;else if(e.substring(f,f+i.length)===i)f+=i.length,r[s]=!1,s++;else throw new I("illegal character encountered: "+e.substring(f));if(s>o){if(c===-1)c=s-o;else if(s-o!==c)throw new I("row lengths do not match");h++}const p=new Me(c,h);for(let w=0;w<s;w++)r[w]&&p.set(Math.floor(w%c),Math.floor(w/c));return p}get(e,t){const i=t*this.rowSize+Math.floor(e/32);return(this.bits[i]>>>(e&31)&1)!==0}set(e,t){const i=t*this.rowSize+Math.floor(e/32);this.bits[i]|=1<<(e&31)&4294967295}unset(e,t){const i=t*this.rowSize+Math.floor(e/32);this.bits[i]&=~(1<<(e&31)&4294967295)}flip(e,t){const i=t*this.rowSize+Math.floor(e/32);this.bits[i]^=1<<(e&31)&4294967295}xor(e){if(this.width!==e.getWidth()||this.height!==e.getHeight()||this.rowSize!==e.getRowSize())throw new I("input matrix dimensions do not match");const t=new ce(Math.floor(this.width/32)+1),i=this.rowSize,r=this.bits;for(let s=0,o=this.height;s<o;s++){const c=s*i,h=e.getRow(s,t).getBitArray();for(let f=0;f<i;f++)r[c+f]^=h[f]}}clear(){const e=this.bits,t=e.length;for(let i=0;i<t;i++)e[i]=0}setRegion(e,t,i,r){if(t<0||e<0)throw new I("Left and top must be nonnegative");if(r<1||i<1)throw new I("Height and width must be at least 1");const s=e+i,o=t+r;if(o>this.height||s>this.width)throw new I("The region must fit inside the matrix");const c=this.rowSize,h=this.bits;for(let f=t;f<o;f++){const p=f*c;for(let w=e;w<s;w++)h[p+Math.floor(w/32)]|=1<<(w&31)&4294967295}}getRow(e,t){t==null||t.getSize()<this.width?t=new ce(this.width):t.clear();const i=this.rowSize,r=this.bits,s=e*i;for(let o=0;o<i;o++)t.setBulk(o*32,r[s+o]);return t}setRow(e,t){te.arraycopy(t.getBitArray(),0,this.bits,e*this.rowSize,this.rowSize)}rotate180(){const e=this.getWidth(),t=this.getHeight();let i=new ce(e),r=new ce(e);for(let s=0,o=Math.floor((t+1)/2);s<o;s++)i=this.getRow(s,i),r=this.getRow(t-1-s,r),i.reverse(),r.reverse(),this.setRow(s,r),this.setRow(t-1-s,i)}getEnclosingRectangle(){const e=this.width,t=this.height,i=this.rowSize,r=this.bits;let s=e,o=t,c=-1,h=-1;for(let f=0;f<t;f++)for(let p=0;p<i;p++){const w=r[f*i+p];if(w!==0){if(f<o&&(o=f),f>h&&(h=f),p*32<s){let b=0;for(;!(w<<31-b&4294967295);)b++;p*32+b<s&&(s=p*32+b)}if(p*32+31>c){let b=31;for(;!(w>>>b);)b--;p*32+b>c&&(c=p*32+b)}}}return c<s||h<o?null:Int32Array.from([s,o,c-s+1,h-o+1])}getTopLeftOnBit(){const e=this.rowSize,t=this.bits;let i=0;for(;i<t.length&&t[i]===0;)i++;if(i===t.length)return null;const r=i/e;let s=i%e*32;const o=t[i];let c=0;for(;!(o<<31-c&4294967295);)c++;return s+=c,Int32Array.from([s,r])}getBottomRightOnBit(){const e=this.rowSize,t=this.bits;let i=t.length-1;for(;i>=0&&t[i]===0;)i--;if(i<0)return null;const r=Math.floor(i/e);let s=Math.floor(i%e)*32;const o=t[i];let c=31;for(;!(o>>>c);)c--;return s+=c,Int32Array.from([s,r])}getWidth(){return this.width}getHeight(){return this.height}getRowSize(){return this.rowSize}equals(e){if(!(e instanceof Me))return!1;const t=e;return this.width===t.width&&this.height===t.height&&this.rowSize===t.rowSize&&le.equals(this.bits,t.bits)}hashCode(){let e=this.width;return e=31*e+this.width,e=31*e+this.height,e=31*e+this.rowSize,e=31*e+le.hashCode(this.bits),e}toString(e="X ",t="  ",i=`
`){return this.buildToString(e,t,i)}buildToString(e,t,i){let r=new se;for(let s=0,o=this.height;s<o;s++){for(let c=0,h=this.width;c<h;c++)r.append(this.get(c,s)?e:t);r.append(i)}return r.toString()}clone(){return new Me(this.width,this.height,this.rowSize,this.bits.slice())}}class D extends _{static getNotFoundInstance(){return new D}}D.kind="NotFoundException";class Ke extends pe{constructor(e){super(e),this.luminances=Ke.EMPTY,this.buckets=new Int32Array(Ke.LUMINANCE_BUCKETS)}getBlackRow(e,t){const i=this.getLuminanceSource(),r=i.getWidth();t==null||t.getSize()<r?t=new ce(r):t.clear(),this.initArrays(r);const s=i.getRow(e,this.luminances),o=this.buckets;for(let h=0;h<r;h++)o[(s[h]&255)>>Ke.LUMINANCE_SHIFT]++;const c=Ke.estimateBlackPoint(o);if(r<3)for(let h=0;h<r;h++)(s[h]&255)<c&&t.set(h);else{let h=s[0]&255,f=s[1]&255;for(let p=1;p<r-1;p++){const w=s[p+1]&255;(f*4-h-w)/2<c&&t.set(p),h=f,f=w}}return t}getBlackMatrix(){const e=this.getLuminanceSource(),t=e.getWidth(),i=e.getHeight(),r=new Me(t,i);this.initArrays(t);const s=this.buckets;for(let h=1;h<5;h++){const f=Math.floor(i*h/5),p=e.getRow(f,this.luminances),w=Math.floor(t*4/5);for(let b=Math.floor(t/5);b<w;b++){const y=p[b]&255;s[y>>Ke.LUMINANCE_SHIFT]++}}const o=Ke.estimateBlackPoint(s),c=e.getMatrix();for(let h=0;h<i;h++){const f=h*t;for(let p=0;p<t;p++)(c[f+p]&255)<o&&r.set(p,h)}return r}createBinarizer(e){return new Ke(e)}initArrays(e){this.luminances.length<e&&(this.luminances=new Uint8ClampedArray(e));const t=this.buckets;for(let i=0;i<Ke.LUMINANCE_BUCKETS;i++)t[i]=0}static estimateBlackPoint(e){const t=e.length;let i=0,r=0,s=0;for(let p=0;p<t;p++)e[p]>s&&(r=p,s=e[p]),e[p]>i&&(i=e[p]);let o=0,c=0;for(let p=0;p<t;p++){const w=p-r,b=e[p]*w*w;b>c&&(o=p,c=b)}if(r>o){const p=r;r=o,o=p}if(o-r<=t/16)throw new D;let h=o-1,f=-1;for(let p=o-1;p>r;p--){const w=p-r,b=w*w*(o-p)*(i-e[p]);b>f&&(h=p,f=b)}return h<<Ke.LUMINANCE_SHIFT}}Ke.LUMINANCE_BITS=5,Ke.LUMINANCE_SHIFT=8-Ke.LUMINANCE_BITS,Ke.LUMINANCE_BUCKETS=1<<Ke.LUMINANCE_BITS,Ke.EMPTY=Uint8ClampedArray.from([0]);class ae extends Ke{constructor(e){super(e),this.matrix=null}getBlackMatrix(){if(this.matrix!==null)return this.matrix;const e=this.getLuminanceSource(),t=e.getWidth(),i=e.getHeight();if(t>=ae.MINIMUM_DIMENSION&&i>=ae.MINIMUM_DIMENSION){const r=e.getMatrix();let s=t>>ae.BLOCK_SIZE_POWER;t&ae.BLOCK_SIZE_MASK&&s++;let o=i>>ae.BLOCK_SIZE_POWER;i&ae.BLOCK_SIZE_MASK&&o++;const c=ae.calculateBlackPoints(r,s,o,t,i),h=new Me(t,i);ae.calculateThresholdForBlock(r,s,o,t,i,c,h),this.matrix=h}else this.matrix=super.getBlackMatrix();return this.matrix}createBinarizer(e){return new ae(e)}static calculateThresholdForBlock(e,t,i,r,s,o,c){const h=s-ae.BLOCK_SIZE,f=r-ae.BLOCK_SIZE;for(let p=0;p<i;p++){let w=p<<ae.BLOCK_SIZE_POWER;w>h&&(w=h);const b=ae.cap(p,2,i-3);for(let y=0;y<t;y++){let E=y<<ae.BLOCK_SIZE_POWER;E>f&&(E=f);const S=ae.cap(y,2,t-3);let T=0;for(let F=-2;F<=2;F++){const U=o[b+F];T+=U[S-2]+U[S-1]+U[S]+U[S+1]+U[S+2]}const R=T/25;ae.thresholdBlock(e,E,w,R,r,c)}}}static cap(e,t,i){return e<t?t:e>i?i:e}static thresholdBlock(e,t,i,r,s,o){for(let c=0,h=i*s+t;c<ae.BLOCK_SIZE;c++,h+=s)for(let f=0;f<ae.BLOCK_SIZE;f++)(e[h+f]&255)<=r&&o.set(t+f,i+c)}static calculateBlackPoints(e,t,i,r,s){const o=s-ae.BLOCK_SIZE,c=r-ae.BLOCK_SIZE,h=new Array(i);for(let f=0;f<i;f++){h[f]=new Int32Array(t);let p=f<<ae.BLOCK_SIZE_POWER;p>o&&(p=o);for(let w=0;w<t;w++){let b=w<<ae.BLOCK_SIZE_POWER;b>c&&(b=c);let y=0,E=255,S=0;for(let R=0,F=p*r+b;R<ae.BLOCK_SIZE;R++,F+=r){for(let U=0;U<ae.BLOCK_SIZE;U++){const B=e[F+U]&255;y+=B,B<E&&(E=B),B>S&&(S=B)}if(S-E>ae.MIN_DYNAMIC_RANGE)for(R++,F+=r;R<ae.BLOCK_SIZE;R++,F+=r)for(let U=0;U<ae.BLOCK_SIZE;U++)y+=e[F+U]&255}let T=y>>ae.BLOCK_SIZE_POWER*2;if(S-E<=ae.MIN_DYNAMIC_RANGE&&(T=E/2,f>0&&w>0)){const R=(h[f-1][w]+2*h[f][w-1]+h[f-1][w-1])/4;E<R&&(T=R)}h[f][w]=T}}return h}}ae.BLOCK_SIZE_POWER=3,ae.BLOCK_SIZE=1<<ae.BLOCK_SIZE_POWER,ae.BLOCK_SIZE_MASK=ae.BLOCK_SIZE-1,ae.MINIMUM_DIMENSION=ae.BLOCK_SIZE*5,ae.MIN_DYNAMIC_RANGE=24;class dr{constructor(e,t){this.width=e,this.height=t}getWidth(){return this.width}getHeight(){return this.height}isCropSupported(){return!1}crop(e,t,i,r){throw new et("This luminance source does not support cropping.")}isRotateSupported(){return!1}rotateCounterClockwise(){throw new et("This luminance source does not support rotation by 90 degrees.")}rotateCounterClockwise45(){throw new et("This luminance source does not support rotation by 45 degrees.")}toString(){const e=new Uint8ClampedArray(this.width);let t=new se;for(let i=0;i<this.height;i++){const r=this.getRow(i,e);for(let s=0;s<this.width;s++){const o=r[s]&255;let c;o<64?c="#":o<128?c="+":o<192?c=".":c=" ",t.append(c)}t.append(`
`)}return t.toString()}}class ii extends dr{constructor(e){super(e.getWidth(),e.getHeight()),this.delegate=e}getRow(e,t){const i=this.delegate.getRow(e,t),r=this.getWidth();for(let s=0;s<r;s++)i[s]=255-(i[s]&255);return i}getMatrix(){const e=this.delegate.getMatrix(),t=this.getWidth()*this.getHeight(),i=new Uint8ClampedArray(t);for(let r=0;r<t;r++)i[r]=255-(e[r]&255);return i}isCropSupported(){return this.delegate.isCropSupported()}crop(e,t,i,r){return new ii(this.delegate.crop(e,t,i,r))}isRotateSupported(){return this.delegate.isRotateSupported()}invert(){return this.delegate}rotateCounterClockwise(){return new ii(this.delegate.rotateCounterClockwise())}rotateCounterClockwise45(){return new ii(this.delegate.rotateCounterClockwise45())}}class ri extends dr{constructor(e){super(e.width,e.height),this.canvas=e,this.tempCanvasElement=null,this.buffer=ri.makeBufferFromCanvasImageData(e)}static makeBufferFromCanvasImageData(e){const t=e.getContext("2d").getImageData(0,0,e.width,e.height);return ri.toGrayscaleBuffer(t.data,e.width,e.height)}static toGrayscaleBuffer(e,t,i){const r=new Uint8ClampedArray(t*i);for(let s=0,o=0,c=e.length;s<c;s+=4,o++){let h;if(e[s+3]===0)h=255;else{const p=e[s],w=e[s+1],b=e[s+2];h=306*p+601*w+117*b+512>>10}r[o]=h}return r}getRow(e,t){if(e<0||e>=this.getHeight())throw new I("Requested row is outside the image: "+e);const i=this.getWidth(),r=e*i;return t===null?t=this.buffer.slice(r,r+i):(t.length<i&&(t=new Uint8ClampedArray(i)),t.set(this.buffer.slice(r,r+i))),t}getMatrix(){return this.buffer}isCropSupported(){return!0}crop(e,t,i,r){return super.crop(e,t,i,r),this}isRotateSupported(){return!0}rotateCounterClockwise(){return this.rotate(-90),this}rotateCounterClockwise45(){return this.rotate(-45),this}getTempCanvasElement(){if(this.tempCanvasElement===null){const e=this.canvas.ownerDocument.createElement("canvas");e.width=this.canvas.width,e.height=this.canvas.height,this.tempCanvasElement=e}return this.tempCanvasElement}rotate(e){const t=this.getTempCanvasElement(),i=t.getContext("2d"),r=e*ri.DEGREE_TO_RADIANS,s=this.canvas.width,o=this.canvas.height,c=Math.ceil(Math.abs(Math.cos(r))*s+Math.abs(Math.sin(r))*o),h=Math.ceil(Math.abs(Math.sin(r))*s+Math.abs(Math.cos(r))*o);return t.width=c,t.height=h,i.translate(c/2,h/2),i.rotate(r),i.drawImage(this.canvas,s/-2,o/-2),this.buffer=ri.makeBufferFromCanvasImageData(t),this}invert(){return new ii(this)}}ri.DEGREE_TO_RADIANS=Math.PI/180;class Fs{constructor(e,t,i){this.deviceId=e,this.label=t,this.kind="videoinput",this.groupId=i||void 0}toJSON(){return{kind:this.kind,groupId:this.groupId,deviceId:this.deviceId,label:this.label}}}var lt=(globalThis||Er||self||window||void 0)&&(globalThis||Er||self||window||void 0).__awaiter||function(x,e,t,i){function r(s){return s instanceof t?s:new t(function(o){o(s)})}return new(t||(t=Promise))(function(s,o){function c(p){try{f(i.next(p))}catch(w){o(w)}}function h(p){try{f(i.throw(p))}catch(w){o(w)}}function f(p){p.done?s(p.value):r(p.value).then(c,h)}f((i=i.apply(x,e||[])).next())})};class _i{constructor(e,t=500,i){this.reader=e,this.timeBetweenScansMillis=t,this._hints=i,this._stopContinuousDecode=!1,this._stopAsyncDecode=!1,this._timeBetweenDecodingAttempts=0}get hasNavigator(){return typeof navigator<"u"}get isMediaDevicesSuported(){return this.hasNavigator&&!!navigator.mediaDevices}get canEnumerateDevices(){return!!(this.isMediaDevicesSuported&&navigator.mediaDevices.enumerateDevices)}get timeBetweenDecodingAttempts(){return this._timeBetweenDecodingAttempts}set timeBetweenDecodingAttempts(e){this._timeBetweenDecodingAttempts=e<0?0:e}set hints(e){this._hints=e||null}get hints(){return this._hints}listVideoInputDevices(){return lt(this,void 0,void 0,function*(){if(!this.hasNavigator)throw new Error("Can't enumerate devices, navigator is not present.");if(!this.canEnumerateDevices)throw new Error("Can't enumerate devices, method not supported.");const e=yield navigator.mediaDevices.enumerateDevices(),t=[];for(const i of e){const r=i.kind==="video"?"videoinput":i.kind;if(r!=="videoinput")continue;const s=i.deviceId||i.id,o=i.label||`Video device ${t.length+1}`,c=i.groupId,h={deviceId:s,label:o,kind:r,groupId:c};t.push(h)}return t})}getVideoInputDevices(){return lt(this,void 0,void 0,function*(){return(yield this.listVideoInputDevices()).map(t=>new Fs(t.deviceId,t.label))})}findDeviceById(e){return lt(this,void 0,void 0,function*(){const t=yield this.listVideoInputDevices();return t?t.find(i=>i.deviceId===e):null})}decodeFromInputVideoDevice(e,t){return lt(this,void 0,void 0,function*(){return yield this.decodeOnceFromVideoDevice(e,t)})}decodeOnceFromVideoDevice(e,t){return lt(this,void 0,void 0,function*(){this.reset();let i;e?i={deviceId:{exact:e}}:i={facingMode:"environment"};const r={video:i};return yield this.decodeOnceFromConstraints(r,t)})}decodeOnceFromConstraints(e,t){return lt(this,void 0,void 0,function*(){const i=yield navigator.mediaDevices.getUserMedia(e);return yield this.decodeOnceFromStream(i,t)})}decodeOnceFromStream(e,t){return lt(this,void 0,void 0,function*(){this.reset();const i=yield this.attachStreamToVideo(e,t);return yield this.decodeOnce(i)})}decodeFromInputVideoDeviceContinuously(e,t,i){return lt(this,void 0,void 0,function*(){return yield this.decodeFromVideoDevice(e,t,i)})}decodeFromVideoDevice(e,t,i){return lt(this,void 0,void 0,function*(){let r;e?r={deviceId:{exact:e}}:r={facingMode:"environment"};const s={video:r};return yield this.decodeFromConstraints(s,t,i)})}decodeFromConstraints(e,t,i){return lt(this,void 0,void 0,function*(){const r=yield navigator.mediaDevices.getUserMedia(e);return yield this.decodeFromStream(r,t,i)})}decodeFromStream(e,t,i){return lt(this,void 0,void 0,function*(){this.reset();const r=yield this.attachStreamToVideo(e,t);return yield this.decodeContinuously(r,i)})}stopAsyncDecode(){this._stopAsyncDecode=!0}stopContinuousDecode(){this._stopContinuousDecode=!0}attachStreamToVideo(e,t){return lt(this,void 0,void 0,function*(){const i=this.prepareVideoElement(t);return this.addVideoSource(i,e),this.videoElement=i,this.stream=e,yield this.playVideoOnLoadAsync(i),i})}playVideoOnLoadAsync(e){return new Promise((t,i)=>this.playVideoOnLoad(e,()=>t()))}playVideoOnLoad(e,t){this.videoEndedListener=()=>this.stopStreams(),this.videoCanPlayListener=()=>this.tryPlayVideo(e),e.addEventListener("ended",this.videoEndedListener),e.addEventListener("canplay",this.videoCanPlayListener),e.addEventListener("playing",t),this.tryPlayVideo(e)}isVideoPlaying(e){return e.currentTime>0&&!e.paused&&!e.ended&&e.readyState>2}tryPlayVideo(e){return lt(this,void 0,void 0,function*(){if(this.isVideoPlaying(e)){console.warn("Trying to play video that is already playing.");return}try{yield e.play()}catch{console.warn("It was not possible to play the video.")}})}getMediaElement(e,t){const i=document.getElementById(e);if(!i)throw new k(`element with id '${e}' not found`);if(i.nodeName.toLowerCase()!==t.toLowerCase())throw new k(`element with id '${e}' must be an ${t} element`);return i}decodeFromImage(e,t){if(!e&&!t)throw new k("either imageElement with a src set or an url must be provided");return t&&!e?this.decodeFromImageUrl(t):this.decodeFromImageElement(e)}decodeFromVideo(e,t){if(!e&&!t)throw new k("Either an element with a src set or an URL must be provided");return t&&!e?this.decodeFromVideoUrl(t):this.decodeFromVideoElement(e)}decodeFromVideoContinuously(e,t,i){if(e===void 0&&t===void 0)throw new k("Either an element with a src set or an URL must be provided");return t&&!e?this.decodeFromVideoUrlContinuously(t,i):this.decodeFromVideoElementContinuously(e,i)}decodeFromImageElement(e){if(!e)throw new k("An image element must be provided.");this.reset();const t=this.prepareImageElement(e);this.imageElement=t;let i;return this.isImageLoaded(t)?i=this.decodeOnce(t,!1,!0):i=this._decodeOnLoadImage(t),i}decodeFromVideoElement(e){const t=this._decodeFromVideoElementSetup(e);return this._decodeOnLoadVideo(t)}decodeFromVideoElementContinuously(e,t){const i=this._decodeFromVideoElementSetup(e);return this._decodeOnLoadVideoContinuously(i,t)}_decodeFromVideoElementSetup(e){if(!e)throw new k("A video element must be provided.");this.reset();const t=this.prepareVideoElement(e);return this.videoElement=t,t}decodeFromImageUrl(e){if(!e)throw new k("An URL must be provided.");this.reset();const t=this.prepareImageElement();this.imageElement=t;const i=this._decodeOnLoadImage(t);return t.src=e,i}decodeFromVideoUrl(e){if(!e)throw new k("An URL must be provided.");this.reset();const t=this.prepareVideoElement(),i=this.decodeFromVideoElement(t);return t.src=e,i}decodeFromVideoUrlContinuously(e,t){if(!e)throw new k("An URL must be provided.");this.reset();const i=this.prepareVideoElement(),r=this.decodeFromVideoElementContinuously(i,t);return i.src=e,r}_decodeOnLoadImage(e){return new Promise((t,i)=>{this.imageLoadedListener=()=>this.decodeOnce(e,!1,!0).then(t,i),e.addEventListener("load",this.imageLoadedListener)})}_decodeOnLoadVideo(e){return lt(this,void 0,void 0,function*(){return yield this.playVideoOnLoadAsync(e),yield this.decodeOnce(e)})}_decodeOnLoadVideoContinuously(e,t){return lt(this,void 0,void 0,function*(){yield this.playVideoOnLoadAsync(e),this.decodeContinuously(e,t)})}isImageLoaded(e){return!(!e.complete||e.naturalWidth===0)}prepareImageElement(e){let t;return typeof e>"u"&&(t=document.createElement("img"),t.width=200,t.height=200),typeof e=="string"&&(t=this.getMediaElement(e,"img")),e instanceof HTMLImageElement&&(t=e),t}prepareVideoElement(e){let t;return!e&&typeof document<"u"&&(t=document.createElement("video"),t.width=200,t.height=200),typeof e=="string"&&(t=this.getMediaElement(e,"video")),e instanceof HTMLVideoElement&&(t=e),t.setAttribute("autoplay","true"),t.setAttribute("muted","true"),t.setAttribute("playsinline","true"),t}decodeOnce(e,t=!0,i=!0){this._stopAsyncDecode=!1;const r=(s,o)=>{if(this._stopAsyncDecode){o(new D("Video stream has ended before any code could be detected.")),this._stopAsyncDecode=void 0;return}try{const c=this.decode(e);s(c)}catch(c){const h=t&&c instanceof D,p=(c instanceof X||c instanceof z)&&i;if(h||p)return setTimeout(r,this._timeBetweenDecodingAttempts,s,o);o(c)}};return new Promise((s,o)=>r(s,o))}decodeContinuously(e,t){this._stopContinuousDecode=!1;const i=()=>{if(this._stopContinuousDecode){this._stopContinuousDecode=void 0;return}try{const r=this.decode(e);t(r,null),setTimeout(i,this.timeBetweenScansMillis)}catch(r){t(null,r);const s=r instanceof X||r instanceof z,o=r instanceof D;(s||o)&&setTimeout(i,this._timeBetweenDecodingAttempts)}};i()}decode(e){const t=this.createBinaryBitmap(e);return this.decodeBitmap(t)}_isHTMLVideoElement(e){return e.videoWidth!==0}drawFrameOnCanvas(e,t,i){t||(t={sx:0,sy:0,sWidth:e.videoWidth,sHeight:e.videoHeight,dx:0,dy:0,dWidth:e.videoWidth,dHeight:e.videoHeight}),i||(i=this.captureCanvasContext),i.drawImage(e,t.sx,t.sy,t.sWidth,t.sHeight,t.dx,t.dy,t.dWidth,t.dHeight)}drawImageOnCanvas(e,t,i=this.captureCanvasContext){t||(t={sx:0,sy:0,sWidth:e.naturalWidth,sHeight:e.naturalHeight,dx:0,dy:0,dWidth:e.naturalWidth,dHeight:e.naturalHeight}),i||(i=this.captureCanvasContext),i.drawImage(e,t.sx,t.sy,t.sWidth,t.sHeight,t.dx,t.dy,t.dWidth,t.dHeight)}createBinaryBitmap(e){this.getCaptureCanvasContext(e),this._isHTMLVideoElement(e)?this.drawFrameOnCanvas(e):this.drawImageOnCanvas(e);const t=this.getCaptureCanvas(e),i=new ri(t),r=new ae(i);return new $(r)}getCaptureCanvasContext(e){if(!this.captureCanvasContext){const i=this.getCaptureCanvas(e).getContext("2d");this.captureCanvasContext=i}return this.captureCanvasContext}getCaptureCanvas(e){if(!this.captureCanvas){const t=this.createCaptureCanvas(e);this.captureCanvas=t}return this.captureCanvas}decodeBitmap(e){return this.reader.decode(e,this._hints)}createCaptureCanvas(e){if(typeof document>"u")return this._destroyCaptureCanvas(),null;const t=document.createElement("canvas");let i,r;return typeof e<"u"&&(e instanceof HTMLVideoElement?(i=e.videoWidth,r=e.videoHeight):e instanceof HTMLImageElement&&(i=e.naturalWidth||e.width,r=e.naturalHeight||e.height)),t.style.width=i+"px",t.style.height=r+"px",t.width=i,t.height=r,t}stopStreams(){this.stream&&(this.stream.getVideoTracks().forEach(e=>e.stop()),this.stream=void 0),this._stopAsyncDecode===!1&&this.stopAsyncDecode(),this._stopContinuousDecode===!1&&this.stopContinuousDecode()}reset(){this.stopStreams(),this._destroyVideoElement(),this._destroyImageElement(),this._destroyCaptureCanvas()}_destroyVideoElement(){this.videoElement&&(typeof this.videoEndedListener<"u"&&this.videoElement.removeEventListener("ended",this.videoEndedListener),typeof this.videoPlayingEventListener<"u"&&this.videoElement.removeEventListener("playing",this.videoPlayingEventListener),typeof this.videoCanPlayListener<"u"&&this.videoElement.removeEventListener("loadedmetadata",this.videoCanPlayListener),this.cleanVideoSource(this.videoElement),this.videoElement=void 0)}_destroyImageElement(){this.imageElement&&(this.imageLoadedListener!==void 0&&this.imageElement.removeEventListener("load",this.imageLoadedListener),this.imageElement.src=void 0,this.imageElement.removeAttribute("src"),this.imageElement=void 0)}_destroyCaptureCanvas(){this.captureCanvasContext=void 0,this.captureCanvas=void 0}addVideoSource(e,t){try{e.srcObject=t}catch{e.src=URL.createObjectURL(t)}}cleanVideoSource(e){try{e.srcObject=null}catch{e.src=""}this.videoElement.removeAttribute("src")}}class ct{constructor(e,t,i=t==null?0:8*t.length,r,s,o=te.currentTimeMillis()){this.text=e,this.rawBytes=t,this.numBits=i,this.resultPoints=r,this.format=s,this.timestamp=o,this.text=e,this.rawBytes=t,i==null?this.numBits=t==null?0:8*t.length:this.numBits=i,this.resultPoints=r,this.format=s,this.resultMetadata=null,o==null?this.timestamp=te.currentTimeMillis():this.timestamp=o}getText(){return this.text}getRawBytes(){return this.rawBytes}getNumBits(){return this.numBits}getResultPoints(){return this.resultPoints}getBarcodeFormat(){return this.format}getResultMetadata(){return this.resultMetadata}putMetadata(e,t){this.resultMetadata===null&&(this.resultMetadata=new Map),this.resultMetadata.set(e,t)}putAllMetadata(e){e!==null&&(this.resultMetadata===null?this.resultMetadata=e:this.resultMetadata=new Map(e))}addResultPoints(e){const t=this.resultPoints;if(t===null)this.resultPoints=e;else if(e!==null&&e.length>0){const i=new Array(t.length+e.length);te.arraycopy(t,0,i,0,t.length),te.arraycopy(e,0,i,t.length,e.length),this.resultPoints=i}}getTimestamp(){return this.timestamp}toString(){return this.text}}var vn;(function(x){x[x.AZTEC=0]="AZTEC",x[x.CODABAR=1]="CODABAR",x[x.CODE_39=2]="CODE_39",x[x.CODE_93=3]="CODE_93",x[x.CODE_128=4]="CODE_128",x[x.DATA_MATRIX=5]="DATA_MATRIX",x[x.EAN_8=6]="EAN_8",x[x.EAN_13=7]="EAN_13",x[x.ITF=8]="ITF",x[x.MAXICODE=9]="MAXICODE",x[x.PDF_417=10]="PDF_417",x[x.QR_CODE=11]="QR_CODE",x[x.RSS_14=12]="RSS_14",x[x.RSS_EXPANDED=13]="RSS_EXPANDED",x[x.UPC_A=14]="UPC_A",x[x.UPC_E=15]="UPC_E",x[x.UPC_EAN_EXTENSION=16]="UPC_EAN_EXTENSION"})(vn||(vn={}));var Q=vn,yn;(function(x){x[x.OTHER=0]="OTHER",x[x.ORIENTATION=1]="ORIENTATION",x[x.BYTE_SEGMENTS=2]="BYTE_SEGMENTS",x[x.ERROR_CORRECTION_LEVEL=3]="ERROR_CORRECTION_LEVEL",x[x.ISSUE_NUMBER=4]="ISSUE_NUMBER",x[x.SUGGESTED_PRICE=5]="SUGGESTED_PRICE",x[x.POSSIBLE_COUNTRY=6]="POSSIBLE_COUNTRY",x[x.UPC_EAN_EXTENSION=7]="UPC_EAN_EXTENSION",x[x.PDF417_EXTRA_METADATA=8]="PDF417_EXTRA_METADATA",x[x.STRUCTURED_APPEND_SEQUENCE=9]="STRUCTURED_APPEND_SEQUENCE",x[x.STRUCTURED_APPEND_PARITY=10]="STRUCTURED_APPEND_PARITY"})(yn||(yn={}));var Ye=yn;class hr{constructor(e,t,i,r,s=-1,o=-1){this.rawBytes=e,this.text=t,this.byteSegments=i,this.ecLevel=r,this.structuredAppendSequenceNumber=s,this.structuredAppendParity=o,this.numBits=e==null?0:8*e.length}getRawBytes(){return this.rawBytes}getNumBits(){return this.numBits}setNumBits(e){this.numBits=e}getText(){return this.text}getByteSegments(){return this.byteSegments}getECLevel(){return this.ecLevel}getErrorsCorrected(){return this.errorsCorrected}setErrorsCorrected(e){this.errorsCorrected=e}getErasures(){return this.erasures}setErasures(e){this.erasures=e}getOther(){return this.other}setOther(e){this.other=e}hasStructuredAppend(){return this.structuredAppendParity>=0&&this.structuredAppendSequenceNumber>=0}getStructuredAppendParity(){return this.structuredAppendParity}getStructuredAppendSequenceNumber(){return this.structuredAppendSequenceNumber}}class ur{exp(e){return this.expTable[e]}log(e){if(e===0)throw new I;return this.logTable[e]}static addOrSubtract(e,t){return e^t}}class ft{constructor(e,t){if(t.length===0)throw new I;this.field=e;const i=t.length;if(i>1&&t[0]===0){let r=1;for(;r<i&&t[r]===0;)r++;r===i?this.coefficients=Int32Array.from([0]):(this.coefficients=new Int32Array(i-r),te.arraycopy(t,r,this.coefficients,0,this.coefficients.length))}else this.coefficients=t}getCoefficients(){return this.coefficients}getDegree(){return this.coefficients.length-1}isZero(){return this.coefficients[0]===0}getCoefficient(e){return this.coefficients[this.coefficients.length-1-e]}evaluateAt(e){if(e===0)return this.getCoefficient(0);const t=this.coefficients;let i;if(e===1){i=0;for(let o=0,c=t.length;o!==c;o++){const h=t[o];i=ur.addOrSubtract(i,h)}return i}i=t[0];const r=t.length,s=this.field;for(let o=1;o<r;o++)i=ur.addOrSubtract(s.multiply(e,i),t[o]);return i}addOrSubtract(e){if(!this.field.equals(e.field))throw new I("GenericGFPolys do not have same GenericGF field");if(this.isZero())return e;if(e.isZero())return this;let t=this.coefficients,i=e.coefficients;if(t.length>i.length){const o=t;t=i,i=o}let r=new Int32Array(i.length);const s=i.length-t.length;te.arraycopy(i,0,r,0,s);for(let o=s;o<i.length;o++)r[o]=ur.addOrSubtract(t[o-s],i[o]);return new ft(this.field,r)}multiply(e){if(!this.field.equals(e.field))throw new I("GenericGFPolys do not have same GenericGF field");if(this.isZero()||e.isZero())return this.field.getZero();const t=this.coefficients,i=t.length,r=e.coefficients,s=r.length,o=new Int32Array(i+s-1),c=this.field;for(let h=0;h<i;h++){const f=t[h];for(let p=0;p<s;p++)o[h+p]=ur.addOrSubtract(o[h+p],c.multiply(f,r[p]))}return new ft(c,o)}multiplyScalar(e){if(e===0)return this.field.getZero();if(e===1)return this;const t=this.coefficients.length,i=this.field,r=new Int32Array(t),s=this.coefficients;for(let o=0;o<t;o++)r[o]=i.multiply(s[o],e);return new ft(i,r)}multiplyByMonomial(e,t){if(e<0)throw new I;if(t===0)return this.field.getZero();const i=this.coefficients,r=i.length,s=new Int32Array(r+e),o=this.field;for(let c=0;c<r;c++)s[c]=o.multiply(i[c],t);return new ft(o,s)}divide(e){if(!this.field.equals(e.field))throw new I("GenericGFPolys do not have same GenericGF field");if(e.isZero())throw new I("Divide by 0");const t=this.field;let i=t.getZero(),r=this;const s=e.getCoefficient(e.getDegree()),o=t.inverse(s);for(;r.getDegree()>=e.getDegree()&&!r.isZero();){const c=r.getDegree()-e.getDegree(),h=t.multiply(r.getCoefficient(r.getDegree()),o),f=e.multiplyByMonomial(c,h),p=t.buildMonomial(c,h);i=i.addOrSubtract(p),r=r.addOrSubtract(f)}return[i,r]}toString(){let e="";for(let t=this.getDegree();t>=0;t--){let i=this.getCoefficient(t);if(i!==0){if(i<0?(e+=" - ",i=-i):e.length>0&&(e+=" + "),t===0||i!==1){const r=this.field.log(i);r===0?e+="1":r===1?e+="a":(e+="a^",e+=r)}t!==0&&(t===1?e+="x":(e+="x^",e+=t))}}return e}}class zr extends _{}zr.kind="ArithmeticException";class be extends ur{constructor(e,t,i){super(),this.primitive=e,this.size=t,this.generatorBase=i;const r=new Int32Array(t);let s=1;for(let c=0;c<t;c++)r[c]=s,s*=2,s>=t&&(s^=e,s&=t-1);this.expTable=r;const o=new Int32Array(t);for(let c=0;c<t-1;c++)o[r[c]]=c;this.logTable=o,this.zero=new ft(this,Int32Array.from([0])),this.one=new ft(this,Int32Array.from([1]))}getZero(){return this.zero}getOne(){return this.one}buildMonomial(e,t){if(e<0)throw new I;if(t===0)return this.zero;const i=new Int32Array(e+1);return i[0]=t,new ft(this,i)}inverse(e){if(e===0)throw new zr;return this.expTable[this.size-this.logTable[e]-1]}multiply(e,t){return e===0||t===0?0:this.expTable[(this.logTable[e]+this.logTable[t])%(this.size-1)]}getSize(){return this.size}getGeneratorBase(){return this.generatorBase}toString(){return"GF(0x"+K.toHexString(this.primitive)+","+this.size+")"}equals(e){return e===this}}be.AZTEC_DATA_12=new be(4201,4096,1),be.AZTEC_DATA_10=new be(1033,1024,1),be.AZTEC_DATA_6=new be(67,64,1),be.AZTEC_PARAM=new be(19,16,1),be.QR_CODE_FIELD_256=new be(285,256,0),be.DATA_MATRIX_FIELD_256=new be(301,256,1),be.AZTEC_DATA_8=be.DATA_MATRIX_FIELD_256,be.MAXICODE_FIELD_64=be.AZTEC_DATA_6;class zi extends _{}zi.kind="ReedSolomonException";class Bt extends _{}Bt.kind="IllegalStateException";class fr{constructor(e){this.field=e}decode(e,t){const i=this.field,r=new ft(i,e),s=new Int32Array(t);let o=!0;for(let y=0;y<t;y++){const E=r.evaluateAt(i.exp(y+i.getGeneratorBase()));s[s.length-1-y]=E,E!==0&&(o=!1)}if(o)return;const c=new ft(i,s),h=this.runEuclideanAlgorithm(i.buildMonomial(t,1),c,t),f=h[0],p=h[1],w=this.findErrorLocations(f),b=this.findErrorMagnitudes(p,w);for(let y=0;y<w.length;y++){const E=e.length-1-i.log(w[y]);if(E<0)throw new zi("Bad error location");e[E]=be.addOrSubtract(e[E],b[y])}}runEuclideanAlgorithm(e,t,i){if(e.getDegree()<t.getDegree()){const y=e;e=t,t=y}const r=this.field;let s=e,o=t,c=r.getZero(),h=r.getOne();for(;o.getDegree()>=(i/2|0);){let y=s,E=c;if(s=o,c=h,s.isZero())throw new zi("r_{i-1} was zero");o=y;let S=r.getZero();const T=s.getCoefficient(s.getDegree()),R=r.inverse(T);for(;o.getDegree()>=s.getDegree()&&!o.isZero();){const F=o.getDegree()-s.getDegree(),U=r.multiply(o.getCoefficient(o.getDegree()),R);S=S.addOrSubtract(r.buildMonomial(F,U)),o=o.addOrSubtract(s.multiplyByMonomial(F,U))}if(h=S.multiply(c).addOrSubtract(E),o.getDegree()>=s.getDegree())throw new Bt("Division algorithm failed to reduce polynomial?")}const f=h.getCoefficient(0);if(f===0)throw new zi("sigmaTilde(0) was zero");const p=r.inverse(f),w=h.multiplyScalar(p),b=o.multiplyScalar(p);return[w,b]}findErrorLocations(e){const t=e.getDegree();if(t===1)return Int32Array.from([e.getCoefficient(1)]);const i=new Int32Array(t);let r=0;const s=this.field;for(let o=1;o<s.getSize()&&r<t;o++)e.evaluateAt(o)===0&&(i[r]=s.inverse(o),r++);if(r!==t)throw new zi("Error locator degree does not match number of roots");return i}findErrorMagnitudes(e,t){const i=t.length,r=new Int32Array(i),s=this.field;for(let o=0;o<i;o++){const c=s.inverse(t[o]);let h=1;for(let f=0;f<i;f++)if(o!==f){const p=s.multiply(t[f],c),w=p&1?p&-2:p|1;h=s.multiply(h,w)}r[o]=s.multiply(e.evaluateAt(c),s.inverse(h)),s.getGeneratorBase()!==0&&(r[o]=s.multiply(r[o],c))}return r}}var tt;(function(x){x[x.UPPER=0]="UPPER",x[x.LOWER=1]="LOWER",x[x.MIXED=2]="MIXED",x[x.DIGIT=3]="DIGIT",x[x.PUNCT=4]="PUNCT",x[x.BINARY=5]="BINARY"})(tt||(tt={}));class Te{decode(e){this.ddata=e;let t=e.getBits(),i=this.extractBits(t),r=this.correctBits(i),s=Te.convertBoolArrayToByteArray(r),o=Te.getEncodedData(r),c=new hr(s,o,null,null);return c.setNumBits(r.length),c}static highLevelDecode(e){return this.getEncodedData(e)}static getEncodedData(e){let t=e.length,i=tt.UPPER,r=tt.UPPER,s="",o=0;for(;o<t;)if(r===tt.BINARY){if(t-o<5)break;let c=Te.readCode(e,o,5);if(o+=5,c===0){if(t-o<11)break;c=Te.readCode(e,o,11)+31,o+=11}for(let h=0;h<c;h++){if(t-o<8){o=t;break}const f=Te.readCode(e,o,8);s+=Z.castAsNonUtf8Char(f),o+=8}r=i}else{let c=r===tt.DIGIT?4:5;if(t-o<c)break;let h=Te.readCode(e,o,c);o+=c;let f=Te.getCharacter(r,h);f.startsWith("CTRL_")?(i=r,r=Te.getTable(f.charAt(5)),f.charAt(6)==="L"&&(i=r)):(s+=f,r=i)}return s}static getTable(e){switch(e){case"L":return tt.LOWER;case"P":return tt.PUNCT;case"M":return tt.MIXED;case"D":return tt.DIGIT;case"B":return tt.BINARY;case"U":default:return tt.UPPER}}static getCharacter(e,t){switch(e){case tt.UPPER:return Te.UPPER_TABLE[t];case tt.LOWER:return Te.LOWER_TABLE[t];case tt.MIXED:return Te.MIXED_TABLE[t];case tt.PUNCT:return Te.PUNCT_TABLE[t];case tt.DIGIT:return Te.DIGIT_TABLE[t];default:throw new Bt("Bad table")}}correctBits(e){let t,i;this.ddata.getNbLayers()<=2?(i=6,t=be.AZTEC_DATA_6):this.ddata.getNbLayers()<=8?(i=8,t=be.AZTEC_DATA_8):this.ddata.getNbLayers()<=22?(i=10,t=be.AZTEC_DATA_10):(i=12,t=be.AZTEC_DATA_12);let r=this.ddata.getNbDatablocks(),s=e.length/i;if(s<r)throw new z;let o=e.length%i,c=new Int32Array(s);for(let b=0;b<s;b++,o+=i)c[b]=Te.readCode(e,o,i);try{new fr(t).decode(c,s-r)}catch(b){throw new z(b)}let h=(1<<i)-1,f=0;for(let b=0;b<r;b++){let y=c[b];if(y===0||y===h)throw new z;(y===1||y===h-1)&&f++}let p=new Array(r*i-f),w=0;for(let b=0;b<r;b++){let y=c[b];if(y===1||y===h-1)p.fill(y>1,w,w+i-1),w+=i-1;else for(let E=i-1;E>=0;--E)p[w++]=(y&1<<E)!==0}return p}extractBits(e){let t=this.ddata.isCompact(),i=this.ddata.getNbLayers(),r=(t?11:14)+i*4,s=new Int32Array(r),o=new Array(this.totalBitsInLayer(i,t));if(t)for(let c=0;c<s.length;c++)s[c]=c;else{let c=r+1+2*K.truncDivision(K.truncDivision(r,2)-1,15),h=r/2,f=K.truncDivision(c,2);for(let p=0;p<h;p++){let w=p+K.truncDivision(p,15);s[h-p-1]=f-w-1,s[h+p]=f+w+1}}for(let c=0,h=0;c<i;c++){let f=(i-c)*4+(t?9:12),p=c*2,w=r-1-p;for(let b=0;b<f;b++){let y=b*2;for(let E=0;E<2;E++)o[h+y+E]=e.get(s[p+E],s[p+b]),o[h+2*f+y+E]=e.get(s[p+b],s[w-E]),o[h+4*f+y+E]=e.get(s[w-E],s[w-b]),o[h+6*f+y+E]=e.get(s[w-b],s[p+E])}h+=f*8}return o}static readCode(e,t,i){let r=0;for(let s=t;s<t+i;s++)r<<=1,e[s]&&(r|=1);return r}static readByte(e,t){let i=e.length-t;return i>=8?Te.readCode(e,t,8):Te.readCode(e,t,i)<<8-i}static convertBoolArrayToByteArray(e){let t=new Uint8Array((e.length+7)/8);for(let i=0;i<t.length;i++)t[i]=Te.readByte(e,8*i);return t}totalBitsInLayer(e,t){return((t?88:112)+16*e)*e}}Te.UPPER_TABLE=["CTRL_PS"," ","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","CTRL_LL","CTRL_ML","CTRL_DL","CTRL_BS"],Te.LOWER_TABLE=["CTRL_PS"," ","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","CTRL_US","CTRL_ML","CTRL_DL","CTRL_BS"],Te.MIXED_TABLE=["CTRL_PS"," ","\\1","\\2","\\3","\\4","\\5","\\6","\\7","\b","	",`
`,"\\13","\f","\r","\\33","\\34","\\35","\\36","\\37","@","\\","^","_","`","|","~","\\177","CTRL_LL","CTRL_UL","CTRL_PL","CTRL_BS"],Te.PUNCT_TABLE=["","\r",`\r
`,". ",", ",": ","!",'"',"#","$","%","&","'","(",")","*","+",",","-",".","/",":",";","<","=",">","?","[","]","{","}","CTRL_UL"],Te.DIGIT_TABLE=["CTRL_PS"," ","0","1","2","3","4","5","6","7","8","9",",",".","CTRL_UL","CTRL_US"];class me{constructor(){}static round(e){return e===NaN?0:e<=Number.MIN_SAFE_INTEGER?Number.MIN_SAFE_INTEGER:e>=Number.MAX_SAFE_INTEGER?Number.MAX_SAFE_INTEGER:e+(e<0?-.5:.5)|0}static distance(e,t,i,r){const s=e-i,o=t-r;return Math.sqrt(s*s+o*o)}static sum(e){let t=0;for(let i=0,r=e.length;i!==r;i++){const s=e[i];t+=s}return t}}class Vr{static floatToIntBits(e){return e}}Vr.MAX_VALUE=Number.MAX_SAFE_INTEGER;class j{constructor(e,t){this.x=e,this.y=t}getX(){return this.x}getY(){return this.y}equals(e){if(e instanceof j){const t=e;return this.x===t.x&&this.y===t.y}return!1}hashCode(){return 31*Vr.floatToIntBits(this.x)+Vr.floatToIntBits(this.y)}toString(){return"("+this.x+","+this.y+")"}static orderBestPatterns(e){const t=this.distance(e[0],e[1]),i=this.distance(e[1],e[2]),r=this.distance(e[0],e[2]);let s,o,c;if(i>=t&&i>=r?(o=e[0],s=e[1],c=e[2]):r>=i&&r>=t?(o=e[1],s=e[0],c=e[2]):(o=e[2],s=e[0],c=e[1]),this.crossProductZ(s,o,c)<0){const h=s;s=c,c=h}e[0]=s,e[1]=o,e[2]=c}static distance(e,t){return me.distance(e.x,e.y,t.x,t.y)}static crossProductZ(e,t,i){const r=t.x,s=t.y;return(i.x-r)*(e.y-s)-(i.y-s)*(e.x-r)}}class $r{constructor(e,t){this.bits=e,this.points=t}getBits(){return this.bits}getPoints(){return this.points}}class Us extends $r{constructor(e,t,i,r,s){super(e,t),this.compact=i,this.nbDatablocks=r,this.nbLayers=s}getNbLayers(){return this.nbLayers}getNbDatablocks(){return this.nbDatablocks}isCompact(){return this.compact}}class Wt{constructor(e,t,i,r){this.image=e,this.height=e.getHeight(),this.width=e.getWidth(),t==null&&(t=Wt.INIT_SIZE),i==null&&(i=e.getWidth()/2|0),r==null&&(r=e.getHeight()/2|0);const s=t/2|0;if(this.leftInit=i-s,this.rightInit=i+s,this.upInit=r-s,this.downInit=r+s,this.upInit<0||this.leftInit<0||this.downInit>=this.height||this.rightInit>=this.width)throw new D}detect(){let e=this.leftInit,t=this.rightInit,i=this.upInit,r=this.downInit,s=!1,o=!0,c=!1,h=!1,f=!1,p=!1,w=!1;const b=this.width,y=this.height;for(;o;){o=!1;let E=!0;for(;(E||!h)&&t<b;)E=this.containsBlackPoint(i,r,t,!1),E?(t++,o=!0,h=!0):h||t++;if(t>=b){s=!0;break}let S=!0;for(;(S||!f)&&r<y;)S=this.containsBlackPoint(e,t,r,!0),S?(r++,o=!0,f=!0):f||r++;if(r>=y){s=!0;break}let T=!0;for(;(T||!p)&&e>=0;)T=this.containsBlackPoint(i,r,e,!1),T?(e--,o=!0,p=!0):p||e--;if(e<0){s=!0;break}let R=!0;for(;(R||!w)&&i>=0;)R=this.containsBlackPoint(e,t,i,!0),R?(i--,o=!0,w=!0):w||i--;if(i<0){s=!0;break}o&&(c=!0)}if(!s&&c){const E=t-e;let S=null;for(let U=1;S===null&&U<E;U++)S=this.getBlackPointOnSegment(e,r-U,e+U,r);if(S==null)throw new D;let T=null;for(let U=1;T===null&&U<E;U++)T=this.getBlackPointOnSegment(e,i+U,e+U,i);if(T==null)throw new D;let R=null;for(let U=1;R===null&&U<E;U++)R=this.getBlackPointOnSegment(t,i+U,t-U,i);if(R==null)throw new D;let F=null;for(let U=1;F===null&&U<E;U++)F=this.getBlackPointOnSegment(t,r-U,t-U,r);if(F==null)throw new D;return this.centerEdges(F,S,R,T)}else throw new D}getBlackPointOnSegment(e,t,i,r){const s=me.round(me.distance(e,t,i,r)),o=(i-e)/s,c=(r-t)/s,h=this.image;for(let f=0;f<s;f++){const p=me.round(e+f*o),w=me.round(t+f*c);if(h.get(p,w))return new j(p,w)}return null}centerEdges(e,t,i,r){const s=e.getX(),o=e.getY(),c=t.getX(),h=t.getY(),f=i.getX(),p=i.getY(),w=r.getX(),b=r.getY(),y=Wt.CORR;return s<this.width/2?[new j(w-y,b+y),new j(c+y,h+y),new j(f-y,p-y),new j(s+y,o-y)]:[new j(w+y,b+y),new j(c+y,h-y),new j(f-y,p+y),new j(s-y,o-y)]}containsBlackPoint(e,t,i,r){const s=this.image;if(r){for(let o=e;o<=t;o++)if(s.get(o,i))return!0}else for(let o=e;o<=t;o++)if(s.get(i,o))return!0;return!1}}Wt.INIT_SIZE=10,Wt.CORR=1;class Cn{static checkAndNudgePoints(e,t){const i=e.getWidth(),r=e.getHeight();let s=!0;for(let o=0;o<t.length&&s;o+=2){const c=Math.floor(t[o]),h=Math.floor(t[o+1]);if(c<-1||c>i||h<-1||h>r)throw new D;s=!1,c===-1?(t[o]=0,s=!0):c===i&&(t[o]=i-1,s=!0),h===-1?(t[o+1]=0,s=!0):h===r&&(t[o+1]=r-1,s=!0)}s=!0;for(let o=t.length-2;o>=0&&s;o-=2){const c=Math.floor(t[o]),h=Math.floor(t[o+1]);if(c<-1||c>i||h<-1||h>r)throw new D;s=!1,c===-1?(t[o]=0,s=!0):c===i&&(t[o]=i-1,s=!0),h===-1?(t[o+1]=0,s=!0):h===r&&(t[o+1]=r-1,s=!0)}}}class Tt{constructor(e,t,i,r,s,o,c,h,f){this.a11=e,this.a21=t,this.a31=i,this.a12=r,this.a22=s,this.a32=o,this.a13=c,this.a23=h,this.a33=f}static quadrilateralToQuadrilateral(e,t,i,r,s,o,c,h,f,p,w,b,y,E,S,T){const R=Tt.quadrilateralToSquare(e,t,i,r,s,o,c,h);return Tt.squareToQuadrilateral(f,p,w,b,y,E,S,T).times(R)}transformPoints(e){const t=e.length,i=this.a11,r=this.a12,s=this.a13,o=this.a21,c=this.a22,h=this.a23,f=this.a31,p=this.a32,w=this.a33;for(let b=0;b<t;b+=2){const y=e[b],E=e[b+1],S=s*y+h*E+w;e[b]=(i*y+o*E+f)/S,e[b+1]=(r*y+c*E+p)/S}}transformPointsWithValues(e,t){const i=this.a11,r=this.a12,s=this.a13,o=this.a21,c=this.a22,h=this.a23,f=this.a31,p=this.a32,w=this.a33,b=e.length;for(let y=0;y<b;y++){const E=e[y],S=t[y],T=s*E+h*S+w;e[y]=(i*E+o*S+f)/T,t[y]=(r*E+c*S+p)/T}}static squareToQuadrilateral(e,t,i,r,s,o,c,h){const f=e-i+s-c,p=t-r+o-h;if(f===0&&p===0)return new Tt(i-e,s-i,e,r-t,o-r,t,0,0,1);{const w=i-s,b=c-s,y=r-o,E=h-o,S=w*E-b*y,T=(f*E-b*p)/S,R=(w*p-f*y)/S;return new Tt(i-e+T*i,c-e+R*c,e,r-t+T*r,h-t+R*h,t,T,R,1)}}static quadrilateralToSquare(e,t,i,r,s,o,c,h){return Tt.squareToQuadrilateral(e,t,i,r,s,o,c,h).buildAdjoint()}buildAdjoint(){return new Tt(this.a22*this.a33-this.a23*this.a32,this.a23*this.a31-this.a21*this.a33,this.a21*this.a32-this.a22*this.a31,this.a13*this.a32-this.a12*this.a33,this.a11*this.a33-this.a13*this.a31,this.a12*this.a31-this.a11*this.a32,this.a12*this.a23-this.a13*this.a22,this.a13*this.a21-this.a11*this.a23,this.a11*this.a22-this.a12*this.a21)}times(e){return new Tt(this.a11*e.a11+this.a21*e.a12+this.a31*e.a13,this.a11*e.a21+this.a21*e.a22+this.a31*e.a23,this.a11*e.a31+this.a21*e.a32+this.a31*e.a33,this.a12*e.a11+this.a22*e.a12+this.a32*e.a13,this.a12*e.a21+this.a22*e.a22+this.a32*e.a23,this.a12*e.a31+this.a22*e.a32+this.a32*e.a33,this.a13*e.a11+this.a23*e.a12+this.a33*e.a13,this.a13*e.a21+this.a23*e.a22+this.a33*e.a23,this.a13*e.a31+this.a23*e.a32+this.a33*e.a33)}}class zs extends Cn{sampleGrid(e,t,i,r,s,o,c,h,f,p,w,b,y,E,S,T,R,F,U){const B=Tt.quadrilateralToQuadrilateral(r,s,o,c,h,f,p,w,b,y,E,S,T,R,F,U);return this.sampleGridWithTransform(e,t,i,B)}sampleGridWithTransform(e,t,i,r){if(t<=0||i<=0)throw new D;const s=new Me(t,i),o=new Float32Array(2*t);for(let c=0;c<i;c++){const h=o.length,f=c+.5;for(let p=0;p<h;p+=2)o[p]=p/2+.5,o[p+1]=f;r.transformPoints(o),Cn.checkAndNudgePoints(e,o);try{for(let p=0;p<h;p+=2)e.get(Math.floor(o[p]),Math.floor(o[p+1]))&&s.set(p/2,c)}catch{throw new D}}return s}}class ni{static setGridSampler(e){ni.gridSampler=e}static getInstance(){return ni.gridSampler}}ni.gridSampler=new zs;class dt{constructor(e,t){this.x=e,this.y=t}toResultPoint(){return new j(this.getX(),this.getY())}getX(){return this.x}getY(){return this.y}}class Vs{constructor(e){this.EXPECTED_CORNER_BITS=new Int32Array([3808,476,2107,1799]),this.image=e}detect(){return this.detectMirror(!1)}detectMirror(e){let t=this.getMatrixCenter(),i=this.getBullsEyeCorners(t);if(e){let o=i[0];i[0]=i[2],i[2]=o}this.extractParameters(i);let r=this.sampleGrid(this.image,i[this.shift%4],i[(this.shift+1)%4],i[(this.shift+2)%4],i[(this.shift+3)%4]),s=this.getMatrixCornerPoints(i);return new Us(r,s,this.compact,this.nbDataBlocks,this.nbLayers)}extractParameters(e){if(!this.isValidPoint(e[0])||!this.isValidPoint(e[1])||!this.isValidPoint(e[2])||!this.isValidPoint(e[3]))throw new D;let t=2*this.nbCenterLayers,i=new Int32Array([this.sampleLine(e[0],e[1],t),this.sampleLine(e[1],e[2],t),this.sampleLine(e[2],e[3],t),this.sampleLine(e[3],e[0],t)]);this.shift=this.getRotation(i,t);let r=0;for(let o=0;o<4;o++){let c=i[(this.shift+o)%4];this.compact?(r<<=7,r+=c>>1&127):(r<<=10,r+=(c>>2&992)+(c>>1&31))}let s=this.getCorrectedParameterData(r,this.compact);this.compact?(this.nbLayers=(s>>6)+1,this.nbDataBlocks=(s&63)+1):(this.nbLayers=(s>>11)+1,this.nbDataBlocks=(s&2047)+1)}getRotation(e,t){let i=0;e.forEach((r,s,o)=>{let c=(r>>t-2<<1)+(r&1);i=(i<<3)+c}),i=((i&1)<<11)+(i>>1);for(let r=0;r<4;r++)if(K.bitCount(i^this.EXPECTED_CORNER_BITS[r])<=2)return r;throw new D}getCorrectedParameterData(e,t){let i,r;t?(i=7,r=2):(i=10,r=4);let s=i-r,o=new Int32Array(i);for(let h=i-1;h>=0;--h)o[h]=e&15,e>>=4;try{new fr(be.AZTEC_PARAM).decode(o,s)}catch{throw new D}let c=0;for(let h=0;h<r;h++)c=(c<<4)+o[h];return c}getBullsEyeCorners(e){let t=e,i=e,r=e,s=e,o=!0;for(this.nbCenterLayers=1;this.nbCenterLayers<9;this.nbCenterLayers++){let w=this.getFirstDifferent(t,o,1,-1),b=this.getFirstDifferent(i,o,1,1),y=this.getFirstDifferent(r,o,-1,1),E=this.getFirstDifferent(s,o,-1,-1);if(this.nbCenterLayers>2){let S=this.distancePoint(E,w)*this.nbCenterLayers/(this.distancePoint(s,t)*(this.nbCenterLayers+2));if(S<.75||S>1.25||!this.isWhiteOrBlackRectangle(w,b,y,E))break}t=w,i=b,r=y,s=E,o=!o}if(this.nbCenterLayers!==5&&this.nbCenterLayers!==7)throw new D;this.compact=this.nbCenterLayers===5;let c=new j(t.getX()+.5,t.getY()-.5),h=new j(i.getX()+.5,i.getY()+.5),f=new j(r.getX()-.5,r.getY()+.5),p=new j(s.getX()-.5,s.getY()-.5);return this.expandSquare([c,h,f,p],2*this.nbCenterLayers-3,2*this.nbCenterLayers)}getMatrixCenter(){let e,t,i,r;try{let c=new Wt(this.image).detect();e=c[0],t=c[1],i=c[2],r=c[3]}catch{let h=this.image.getWidth()/2,f=this.image.getHeight()/2;e=this.getFirstDifferent(new dt(h+7,f-7),!1,1,-1).toResultPoint(),t=this.getFirstDifferent(new dt(h+7,f+7),!1,1,1).toResultPoint(),i=this.getFirstDifferent(new dt(h-7,f+7),!1,-1,1).toResultPoint(),r=this.getFirstDifferent(new dt(h-7,f-7),!1,-1,-1).toResultPoint()}let s=me.round((e.getX()+r.getX()+t.getX()+i.getX())/4),o=me.round((e.getY()+r.getY()+t.getY()+i.getY())/4);try{let c=new Wt(this.image,15,s,o).detect();e=c[0],t=c[1],i=c[2],r=c[3]}catch{e=this.getFirstDifferent(new dt(s+7,o-7),!1,1,-1).toResultPoint(),t=this.getFirstDifferent(new dt(s+7,o+7),!1,1,1).toResultPoint(),i=this.getFirstDifferent(new dt(s-7,o+7),!1,-1,1).toResultPoint(),r=this.getFirstDifferent(new dt(s-7,o-7),!1,-1,-1).toResultPoint()}return s=me.round((e.getX()+r.getX()+t.getX()+i.getX())/4),o=me.round((e.getY()+r.getY()+t.getY()+i.getY())/4),new dt(s,o)}getMatrixCornerPoints(e){return this.expandSquare(e,2*this.nbCenterLayers,this.getDimension())}sampleGrid(e,t,i,r,s){let o=ni.getInstance(),c=this.getDimension(),h=c/2-this.nbCenterLayers,f=c/2+this.nbCenterLayers;return o.sampleGrid(e,c,c,h,h,f,h,f,f,h,f,t.getX(),t.getY(),i.getX(),i.getY(),r.getX(),r.getY(),s.getX(),s.getY())}sampleLine(e,t,i){let r=0,s=this.distanceResultPoint(e,t),o=s/i,c=e.getX(),h=e.getY(),f=o*(t.getX()-e.getX())/s,p=o*(t.getY()-e.getY())/s;for(let w=0;w<i;w++)this.image.get(me.round(c+w*f),me.round(h+w*p))&&(r|=1<<i-w-1);return r}isWhiteOrBlackRectangle(e,t,i,r){let s=3;e=new dt(e.getX()-s,e.getY()+s),t=new dt(t.getX()-s,t.getY()-s),i=new dt(i.getX()+s,i.getY()-s),r=new dt(r.getX()+s,r.getY()+s);let o=this.getColor(r,e);if(o===0)return!1;let c=this.getColor(e,t);return c!==o||(c=this.getColor(t,i),c!==o)?!1:(c=this.getColor(i,r),c===o)}getColor(e,t){let i=this.distancePoint(e,t),r=(t.getX()-e.getX())/i,s=(t.getY()-e.getY())/i,o=0,c=e.getX(),h=e.getY(),f=this.image.get(e.getX(),e.getY()),p=Math.ceil(i);for(let b=0;b<p;b++)c+=r,h+=s,this.image.get(me.round(c),me.round(h))!==f&&o++;let w=o/i;return w>.1&&w<.9?0:w<=.1===f?1:-1}getFirstDifferent(e,t,i,r){let s=e.getX()+i,o=e.getY()+r;for(;this.isValid(s,o)&&this.image.get(s,o)===t;)s+=i,o+=r;for(s-=i,o-=r;this.isValid(s,o)&&this.image.get(s,o)===t;)s+=i;for(s-=i;this.isValid(s,o)&&this.image.get(s,o)===t;)o+=r;return o-=r,new dt(s,o)}expandSquare(e,t,i){let r=i/(2*t),s=e[0].getX()-e[2].getX(),o=e[0].getY()-e[2].getY(),c=(e[0].getX()+e[2].getX())/2,h=(e[0].getY()+e[2].getY())/2,f=new j(c+r*s,h+r*o),p=new j(c-r*s,h-r*o);s=e[1].getX()-e[3].getX(),o=e[1].getY()-e[3].getY(),c=(e[1].getX()+e[3].getX())/2,h=(e[1].getY()+e[3].getY())/2;let w=new j(c+r*s,h+r*o),b=new j(c-r*s,h-r*o);return[f,w,p,b]}isValid(e,t){return e>=0&&e<this.image.getWidth()&&t>0&&t<this.image.getHeight()}isValidPoint(e){let t=me.round(e.getX()),i=me.round(e.getY());return this.isValid(t,i)}distancePoint(e,t){return me.distance(e.getX(),e.getY(),t.getX(),t.getY())}distanceResultPoint(e,t){return me.distance(e.getX(),e.getY(),t.getX(),t.getY())}getDimension(){return this.compact?4*this.nbLayers+11:this.nbLayers<=4?4*this.nbLayers+15:4*this.nbLayers+2*(K.truncDivision(this.nbLayers-4,8)+1)+15}}class Hr{decode(e,t=null){let i=null,r=new Vs(e.getBlackMatrix()),s=null,o=null;try{let p=r.detectMirror(!1);s=p.getPoints(),this.reportFoundResultPoints(t,s),o=new Te().decode(p)}catch(p){i=p}if(o==null)try{let p=r.detectMirror(!0);s=p.getPoints(),this.reportFoundResultPoints(t,s),o=new Te().decode(p)}catch(p){throw i??p}let c=new ct(o.getText(),o.getRawBytes(),o.getNumBits(),s,Q.AZTEC,te.currentTimeMillis()),h=o.getByteSegments();h!=null&&c.putMetadata(Ye.BYTE_SEGMENTS,h);let f=o.getECLevel();return f!=null&&c.putMetadata(Ye.ERROR_CORRECTION_LEVEL,f),c}reportFoundResultPoints(e,t){if(e!=null){let i=e.get(we.NEED_RESULT_POINT_CALLBACK);i!=null&&t.forEach((r,s,o)=>{i.foundPossibleResultPoint(r)})}}reset(){}}class $o extends _i{constructor(e=500){super(new Hr,e)}}class Ge{decode(e,t){try{return this.doDecode(e,t)}catch{if(t&&t.get(we.TRY_HARDER)===!0&&e.isRotateSupported()){const s=e.rotateCounterClockwise(),o=this.doDecode(s,t),c=o.getResultMetadata();let h=270;c!==null&&c.get(Ye.ORIENTATION)===!0&&(h=h+c.get(Ye.ORIENTATION)%360),o.putMetadata(Ye.ORIENTATION,h);const f=o.getResultPoints();if(f!==null){const p=s.getHeight();for(let w=0;w<f.length;w++)f[w]=new j(p-f[w].getY()-1,f[w].getX())}return o}else throw new D}}reset(){}doDecode(e,t){const i=e.getWidth(),r=e.getHeight();let s=new ce(i);const o=t&&t.get(we.TRY_HARDER)===!0,c=Math.max(1,r>>(o?8:5));let h;o?h=r:h=15;const f=Math.trunc(r/2);for(let p=0;p<h;p++){const w=Math.trunc((p+1)/2),b=(p&1)===0,y=f+c*(b?w:-w);if(y<0||y>=r)break;try{s=e.getBlackRow(y,s)}catch{continue}for(let E=0;E<2;E++){if(E===1&&(s.reverse(),t&&t.get(we.NEED_RESULT_POINT_CALLBACK)===!0)){const S=new Map;t.forEach((T,R)=>S.set(R,T)),S.delete(we.NEED_RESULT_POINT_CALLBACK),t=S}try{const S=this.decodeRow(y,s,t);if(E===1){S.putMetadata(Ye.ORIENTATION,180);const T=S.getResultPoints();T!==null&&(T[0]=new j(i-T[0].getX()-1,T[0].getY()),T[1]=new j(i-T[1].getX()-1,T[1].getY()))}return S}catch{}}}throw new D}static recordPattern(e,t,i){const r=i.length;for(let f=0;f<r;f++)i[f]=0;const s=e.getSize();if(t>=s)throw new D;let o=!e.get(t),c=0,h=t;for(;h<s;){if(e.get(h)!==o)i[c]++;else{if(++c===r)break;i[c]=1,o=!o}h++}if(!(c===r||c===r-1&&h===s))throw new D}static recordPatternInReverse(e,t,i){let r=i.length,s=e.get(t);for(;t>0&&r>=0;)e.get(--t)!==s&&(r--,s=!s);if(r>=0)throw new D;Ge.recordPattern(e,t+1,i)}static patternMatchVariance(e,t,i){const r=e.length;let s=0,o=0;for(let f=0;f<r;f++)s+=e[f],o+=t[f];if(s<o)return Number.POSITIVE_INFINITY;const c=s/o;i*=c;let h=0;for(let f=0;f<r;f++){const p=e[f],w=t[f]*c,b=p>w?p-w:w-p;if(b>i)return Number.POSITIVE_INFINITY;h+=b}return h/s}}class V extends Ge{static findStartPattern(e){const t=e.getSize(),i=e.getNextSet(0);let r=0,s=Int32Array.from([0,0,0,0,0,0]),o=i,c=!1;const h=6;for(let f=i;f<t;f++)if(e.get(f)!==c)s[r]++;else{if(r===h-1){let p=V.MAX_AVG_VARIANCE,w=-1;for(let b=V.CODE_START_A;b<=V.CODE_START_C;b++){const y=Ge.patternMatchVariance(s,V.CODE_PATTERNS[b],V.MAX_INDIVIDUAL_VARIANCE);y<p&&(p=y,w=b)}if(w>=0&&e.isRange(Math.max(0,o-(f-o)/2),o,!1))return Int32Array.from([o,f,w]);o+=s[0]+s[1],s=s.slice(2,s.length-1),s[r-1]=0,s[r]=0,r--}else r++;s[r]=1,c=!c}throw new D}static decodeCode(e,t,i){Ge.recordPattern(e,i,t);let r=V.MAX_AVG_VARIANCE,s=-1;for(let o=0;o<V.CODE_PATTERNS.length;o++){const c=V.CODE_PATTERNS[o],h=this.patternMatchVariance(t,c,V.MAX_INDIVIDUAL_VARIANCE);h<r&&(r=h,s=o)}if(s>=0)return s;throw new D}decodeRow(e,t,i){const r=i&&i.get(we.ASSUME_GS1)===!0,s=V.findStartPattern(t),o=s[2];let c=0;const h=new Uint8Array(20);h[c++]=o;let f;switch(o){case V.CODE_START_A:f=V.CODE_CODE_A;break;case V.CODE_START_B:f=V.CODE_CODE_B;break;case V.CODE_START_C:f=V.CODE_CODE_C;break;default:throw new z}let p=!1,w=!1,b="",y=s[0],E=s[1];const S=Int32Array.from([0,0,0,0,0,0]);let T=0,R=0,F=o,U=0,B=!0,ue=!1,re=!1;for(;!p;){const Yi=w;switch(w=!1,T=R,R=V.decodeCode(t,S,E),h[c++]=R,R!==V.CODE_STOP&&(B=!0),R!==V.CODE_STOP&&(U++,F+=U*R),y=E,E+=S.reduce((xl,wl)=>xl+wl,0),R){case V.CODE_START_A:case V.CODE_START_B:case V.CODE_START_C:throw new z}switch(f){case V.CODE_CODE_A:if(R<64)re===ue?b+=String.fromCharCode(32+R):b+=String.fromCharCode(32+R+128),re=!1;else if(R<96)re===ue?b+=String.fromCharCode(R-64):b+=String.fromCharCode(R+64),re=!1;else switch(R!==V.CODE_STOP&&(B=!1),R){case V.CODE_FNC_1:r&&(b.length===0?b+="]C1":b+="");break;case V.CODE_FNC_2:case V.CODE_FNC_3:break;case V.CODE_FNC_4_A:!ue&&re?(ue=!0,re=!1):ue&&re?(ue=!1,re=!1):re=!0;break;case V.CODE_SHIFT:w=!0,f=V.CODE_CODE_B;break;case V.CODE_CODE_B:f=V.CODE_CODE_B;break;case V.CODE_CODE_C:f=V.CODE_CODE_C;break;case V.CODE_STOP:p=!0;break}break;case V.CODE_CODE_B:if(R<96)re===ue?b+=String.fromCharCode(32+R):b+=String.fromCharCode(32+R+128),re=!1;else switch(R!==V.CODE_STOP&&(B=!1),R){case V.CODE_FNC_1:r&&(b.length===0?b+="]C1":b+="");break;case V.CODE_FNC_2:case V.CODE_FNC_3:break;case V.CODE_FNC_4_B:!ue&&re?(ue=!0,re=!1):ue&&re?(ue=!1,re=!1):re=!0;break;case V.CODE_SHIFT:w=!0,f=V.CODE_CODE_A;break;case V.CODE_CODE_A:f=V.CODE_CODE_A;break;case V.CODE_CODE_C:f=V.CODE_CODE_C;break;case V.CODE_STOP:p=!0;break}break;case V.CODE_CODE_C:if(R<100)R<10&&(b+="0"),b+=R;else switch(R!==V.CODE_STOP&&(B=!1),R){case V.CODE_FNC_1:r&&(b.length===0?b+="]C1":b+="");break;case V.CODE_CODE_A:f=V.CODE_CODE_A;break;case V.CODE_CODE_B:f=V.CODE_CODE_B;break;case V.CODE_STOP:p=!0;break}break}Yi&&(f=f===V.CODE_CODE_A?V.CODE_CODE_B:V.CODE_CODE_A)}const xt=E-y;if(E=t.getNextUnset(E),!t.isRange(E,Math.min(t.getSize(),E+(E-y)/2),!1))throw new D;if(F-=U*T,F%103!==T)throw new X;const Ot=b.length;if(Ot===0)throw new D;Ot>0&&B&&(f===V.CODE_CODE_C?b=b.substring(0,Ot-2):b=b.substring(0,Ot-1));const wt=(s[1]+s[0])/2,Ie=y+xt/2,nt=h.length,vt=new Uint8Array(nt);for(let Yi=0;Yi<nt;Yi++)vt[Yi]=h[Yi];const Ki=[new j(wt,e),new j(Ie,e)];return new ct(b,vt,0,Ki,Q.CODE_128,new Date().getTime())}}V.CODE_PATTERNS=[Int32Array.from([2,1,2,2,2,2]),Int32Array.from([2,2,2,1,2,2]),Int32Array.from([2,2,2,2,2,1]),Int32Array.from([1,2,1,2,2,3]),Int32Array.from([1,2,1,3,2,2]),Int32Array.from([1,3,1,2,2,2]),Int32Array.from([1,2,2,2,1,3]),Int32Array.from([1,2,2,3,1,2]),Int32Array.from([1,3,2,2,1,2]),Int32Array.from([2,2,1,2,1,3]),Int32Array.from([2,2,1,3,1,2]),Int32Array.from([2,3,1,2,1,2]),Int32Array.from([1,1,2,2,3,2]),Int32Array.from([1,2,2,1,3,2]),Int32Array.from([1,2,2,2,3,1]),Int32Array.from([1,1,3,2,2,2]),Int32Array.from([1,2,3,1,2,2]),Int32Array.from([1,2,3,2,2,1]),Int32Array.from([2,2,3,2,1,1]),Int32Array.from([2,2,1,1,3,2]),Int32Array.from([2,2,1,2,3,1]),Int32Array.from([2,1,3,2,1,2]),Int32Array.from([2,2,3,1,1,2]),Int32Array.from([3,1,2,1,3,1]),Int32Array.from([3,1,1,2,2,2]),Int32Array.from([3,2,1,1,2,2]),Int32Array.from([3,2,1,2,2,1]),Int32Array.from([3,1,2,2,1,2]),Int32Array.from([3,2,2,1,1,2]),Int32Array.from([3,2,2,2,1,1]),Int32Array.from([2,1,2,1,2,3]),Int32Array.from([2,1,2,3,2,1]),Int32Array.from([2,3,2,1,2,1]),Int32Array.from([1,1,1,3,2,3]),Int32Array.from([1,3,1,1,2,3]),Int32Array.from([1,3,1,3,2,1]),Int32Array.from([1,1,2,3,1,3]),Int32Array.from([1,3,2,1,1,3]),Int32Array.from([1,3,2,3,1,1]),Int32Array.from([2,1,1,3,1,3]),Int32Array.from([2,3,1,1,1,3]),Int32Array.from([2,3,1,3,1,1]),Int32Array.from([1,1,2,1,3,3]),Int32Array.from([1,1,2,3,3,1]),Int32Array.from([1,3,2,1,3,1]),Int32Array.from([1,1,3,1,2,3]),Int32Array.from([1,1,3,3,2,1]),Int32Array.from([1,3,3,1,2,1]),Int32Array.from([3,1,3,1,2,1]),Int32Array.from([2,1,1,3,3,1]),Int32Array.from([2,3,1,1,3,1]),Int32Array.from([2,1,3,1,1,3]),Int32Array.from([2,1,3,3,1,1]),Int32Array.from([2,1,3,1,3,1]),Int32Array.from([3,1,1,1,2,3]),Int32Array.from([3,1,1,3,2,1]),Int32Array.from([3,3,1,1,2,1]),Int32Array.from([3,1,2,1,1,3]),Int32Array.from([3,1,2,3,1,1]),Int32Array.from([3,3,2,1,1,1]),Int32Array.from([3,1,4,1,1,1]),Int32Array.from([2,2,1,4,1,1]),Int32Array.from([4,3,1,1,1,1]),Int32Array.from([1,1,1,2,2,4]),Int32Array.from([1,1,1,4,2,2]),Int32Array.from([1,2,1,1,2,4]),Int32Array.from([1,2,1,4,2,1]),Int32Array.from([1,4,1,1,2,2]),Int32Array.from([1,4,1,2,2,1]),Int32Array.from([1,1,2,2,1,4]),Int32Array.from([1,1,2,4,1,2]),Int32Array.from([1,2,2,1,1,4]),Int32Array.from([1,2,2,4,1,1]),Int32Array.from([1,4,2,1,1,2]),Int32Array.from([1,4,2,2,1,1]),Int32Array.from([2,4,1,2,1,1]),Int32Array.from([2,2,1,1,1,4]),Int32Array.from([4,1,3,1,1,1]),Int32Array.from([2,4,1,1,1,2]),Int32Array.from([1,3,4,1,1,1]),Int32Array.from([1,1,1,2,4,2]),Int32Array.from([1,2,1,1,4,2]),Int32Array.from([1,2,1,2,4,1]),Int32Array.from([1,1,4,2,1,2]),Int32Array.from([1,2,4,1,1,2]),Int32Array.from([1,2,4,2,1,1]),Int32Array.from([4,1,1,2,1,2]),Int32Array.from([4,2,1,1,1,2]),Int32Array.from([4,2,1,2,1,1]),Int32Array.from([2,1,2,1,4,1]),Int32Array.from([2,1,4,1,2,1]),Int32Array.from([4,1,2,1,2,1]),Int32Array.from([1,1,1,1,4,3]),Int32Array.from([1,1,1,3,4,1]),Int32Array.from([1,3,1,1,4,1]),Int32Array.from([1,1,4,1,1,3]),Int32Array.from([1,1,4,3,1,1]),Int32Array.from([4,1,1,1,1,3]),Int32Array.from([4,1,1,3,1,1]),Int32Array.from([1,1,3,1,4,1]),Int32Array.from([1,1,4,1,3,1]),Int32Array.from([3,1,1,1,4,1]),Int32Array.from([4,1,1,1,3,1]),Int32Array.from([2,1,1,4,1,2]),Int32Array.from([2,1,1,2,1,4]),Int32Array.from([2,1,1,2,3,2]),Int32Array.from([2,3,3,1,1,1,2])],V.MAX_AVG_VARIANCE=.25,V.MAX_INDIVIDUAL_VARIANCE=.7,V.CODE_SHIFT=98,V.CODE_CODE_C=99,V.CODE_CODE_B=100,V.CODE_CODE_A=101,V.CODE_FNC_1=102,V.CODE_FNC_2=97,V.CODE_FNC_3=96,V.CODE_FNC_4_A=101,V.CODE_FNC_4_B=100,V.CODE_START_A=103,V.CODE_START_B=104,V.CODE_START_C=105,V.CODE_STOP=106;class We extends Ge{constructor(e=!1,t=!1){super(),this.usingCheckDigit=e,this.extendedMode=t,this.decodeRowResult="",this.counters=new Int32Array(9)}decodeRow(e,t,i){let r=this.counters;r.fill(0),this.decodeRowResult="";let s=We.findAsteriskPattern(t,r),o=t.getNextSet(s[1]),c=t.getSize(),h,f;do{We.recordPattern(t,o,r);let S=We.toNarrowWidePattern(r);if(S<0)throw new D;h=We.patternToChar(S),this.decodeRowResult+=h,f=o;for(let T of r)o+=T;o=t.getNextSet(o)}while(h!=="*");this.decodeRowResult=this.decodeRowResult.substring(0,this.decodeRowResult.length-1);let p=0;for(let S of r)p+=S;let w=o-f-p;if(o!==c&&w*2<p)throw new D;if(this.usingCheckDigit){let S=this.decodeRowResult.length-1,T=0;for(let R=0;R<S;R++)T+=We.ALPHABET_STRING.indexOf(this.decodeRowResult.charAt(R));if(this.decodeRowResult.charAt(S)!==We.ALPHABET_STRING.charAt(T%43))throw new X;this.decodeRowResult=this.decodeRowResult.substring(0,S)}if(this.decodeRowResult.length===0)throw new D;let b;this.extendedMode?b=We.decodeExtended(this.decodeRowResult):b=this.decodeRowResult;let y=(s[1]+s[0])/2,E=f+p/2;return new ct(b,null,0,[new j(y,e),new j(E,e)],Q.CODE_39,new Date().getTime())}static findAsteriskPattern(e,t){let i=e.getSize(),r=e.getNextSet(0),s=0,o=r,c=!1,h=t.length;for(let f=r;f<i;f++)if(e.get(f)!==c)t[s]++;else{if(s===h-1){if(this.toNarrowWidePattern(t)===We.ASTERISK_ENCODING&&e.isRange(Math.max(0,o-Math.floor((f-o)/2)),o,!1))return[o,f];o+=t[0]+t[1],t.copyWithin(0,2,2+s-1),t[s-1]=0,t[s]=0,s--}else s++;t[s]=1,c=!c}throw new D}static toNarrowWidePattern(e){let t=e.length,i=0,r;do{let s=2147483647;for(let h of e)h<s&&h>i&&(s=h);i=s,r=0;let o=0,c=0;for(let h=0;h<t;h++){let f=e[h];f>i&&(c|=1<<t-1-h,r++,o+=f)}if(r===3){for(let h=0;h<t&&r>0;h++){let f=e[h];if(f>i&&(r--,f*2>=o))return-1}return c}}while(r>3);return-1}static patternToChar(e){for(let t=0;t<We.CHARACTER_ENCODINGS.length;t++)if(We.CHARACTER_ENCODINGS[t]===e)return We.ALPHABET_STRING.charAt(t);if(e===We.ASTERISK_ENCODING)return"*";throw new D}static decodeExtended(e){let t=e.length,i="";for(let r=0;r<t;r++){let s=e.charAt(r);if(s==="+"||s==="$"||s==="%"||s==="/"){let o=e.charAt(r+1),c="\0";switch(s){case"+":if(o>="A"&&o<="Z")c=String.fromCharCode(o.charCodeAt(0)+32);else throw new z;break;case"$":if(o>="A"&&o<="Z")c=String.fromCharCode(o.charCodeAt(0)-64);else throw new z;break;case"%":if(o>="A"&&o<="E")c=String.fromCharCode(o.charCodeAt(0)-38);else if(o>="F"&&o<="J")c=String.fromCharCode(o.charCodeAt(0)-11);else if(o>="K"&&o<="O")c=String.fromCharCode(o.charCodeAt(0)+16);else if(o>="P"&&o<="T")c=String.fromCharCode(o.charCodeAt(0)+43);else if(o==="U")c="\0";else if(o==="V")c="@";else if(o==="W")c="`";else if(o==="X"||o==="Y"||o==="Z")c="";else throw new z;break;case"/":if(o>="A"&&o<="O")c=String.fromCharCode(o.charCodeAt(0)-32);else if(o==="Z")c=":";else throw new z;break}i+=c,r++}else i+=s}return i}}We.ALPHABET_STRING="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%",We.CHARACTER_ENCODINGS=[52,289,97,352,49,304,112,37,292,100,265,73,328,25,280,88,13,268,76,28,259,67,322,19,274,82,7,262,70,22,385,193,448,145,400,208,133,388,196,168,162,138,42],We.ASTERISK_ENCODING=148;class Ee extends Ge{constructor(){super(...arguments),this.narrowLineWidth=-1}decodeRow(e,t,i){let r=this.decodeStart(t),s=this.decodeEnd(t),o=new se;Ee.decodeMiddle(t,r[1],s[0],o);let c=o.toString(),h=null;i!=null&&(h=i.get(we.ALLOWED_LENGTHS)),h==null&&(h=Ee.DEFAULT_ALLOWED_LENGTHS);let f=c.length,p=!1,w=0;for(let E of h){if(f===E){p=!0;break}E>w&&(w=E)}if(!p&&f>w&&(p=!0),!p)throw new z;const b=[new j(r[1],e),new j(s[0],e)];return new ct(c,null,0,b,Q.ITF,new Date().getTime())}static decodeMiddle(e,t,i,r){let s=new Int32Array(10),o=new Int32Array(5),c=new Int32Array(5);for(s.fill(0),o.fill(0),c.fill(0);t<i;){Ge.recordPattern(e,t,s);for(let f=0;f<5;f++){let p=2*f;o[f]=s[p],c[f]=s[p+1]}let h=Ee.decodeDigit(o);r.append(h.toString()),h=this.decodeDigit(c),r.append(h.toString()),s.forEach(function(f){t+=f})}}decodeStart(e){let t=Ee.skipWhiteSpace(e),i=Ee.findGuardPattern(e,t,Ee.START_PATTERN);return this.narrowLineWidth=(i[1]-i[0])/4,this.validateQuietZone(e,i[0]),i}validateQuietZone(e,t){let i=this.narrowLineWidth*10;i=i<t?i:t;for(let r=t-1;i>0&&r>=0&&!e.get(r);r--)i--;if(i!==0)throw new D}static skipWhiteSpace(e){const t=e.getSize(),i=e.getNextSet(0);if(i===t)throw new D;return i}decodeEnd(e){e.reverse();try{let t=Ee.skipWhiteSpace(e),i;try{i=Ee.findGuardPattern(e,t,Ee.END_PATTERN_REVERSED[0])}catch(s){s instanceof D&&(i=Ee.findGuardPattern(e,t,Ee.END_PATTERN_REVERSED[1]))}this.validateQuietZone(e,i[0]);let r=i[0];return i[0]=e.getSize()-i[1],i[1]=e.getSize()-r,i}finally{e.reverse()}}static findGuardPattern(e,t,i){let r=i.length,s=new Int32Array(r),o=e.getSize(),c=!1,h=0,f=t;s.fill(0);for(let p=t;p<o;p++)if(e.get(p)!==c)s[h]++;else{if(h===r-1){if(Ge.patternMatchVariance(s,i,Ee.MAX_INDIVIDUAL_VARIANCE)<Ee.MAX_AVG_VARIANCE)return[f,p];f+=s[0]+s[1],te.arraycopy(s,2,s,0,h-1),s[h-1]=0,s[h]=0,h--}else h++;s[h]=1,c=!c}throw new D}static decodeDigit(e){let t=Ee.MAX_AVG_VARIANCE,i=-1,r=Ee.PATTERNS.length;for(let s=0;s<r;s++){let o=Ee.PATTERNS[s],c=Ge.patternMatchVariance(e,o,Ee.MAX_INDIVIDUAL_VARIANCE);c<t?(t=c,i=s):c===t&&(i=-1)}if(i>=0)return i%10;throw new D}}Ee.PATTERNS=[Int32Array.from([1,1,2,2,1]),Int32Array.from([2,1,1,1,2]),Int32Array.from([1,2,1,1,2]),Int32Array.from([2,2,1,1,1]),Int32Array.from([1,1,2,1,2]),Int32Array.from([2,1,2,1,1]),Int32Array.from([1,2,2,1,1]),Int32Array.from([1,1,1,2,2]),Int32Array.from([2,1,1,2,1]),Int32Array.from([1,2,1,2,1]),Int32Array.from([1,1,3,3,1]),Int32Array.from([3,1,1,1,3]),Int32Array.from([1,3,1,1,3]),Int32Array.from([3,3,1,1,1]),Int32Array.from([1,1,3,1,3]),Int32Array.from([3,1,3,1,1]),Int32Array.from([1,3,3,1,1]),Int32Array.from([1,1,1,3,3]),Int32Array.from([3,1,1,3,1]),Int32Array.from([1,3,1,3,1])],Ee.MAX_AVG_VARIANCE=.38,Ee.MAX_INDIVIDUAL_VARIANCE=.5,Ee.DEFAULT_ALLOWED_LENGTHS=[6,8,10,12,14],Ee.START_PATTERN=Int32Array.from([1,1,1,1]),Ee.END_PATTERN_REVERSED=[Int32Array.from([1,1,2]),Int32Array.from([1,1,3])];class Fe extends Ge{constructor(){super(...arguments),this.decodeRowStringBuffer=""}static findStartGuardPattern(e){let t=!1,i,r=0,s=Int32Array.from([0,0,0]);for(;!t;){s=Int32Array.from([0,0,0]),i=Fe.findGuardPattern(e,r,!1,this.START_END_PATTERN,s);let o=i[0];r=i[1];let c=o-(r-o);c>=0&&(t=e.isRange(c,o,!1))}return i}static checkChecksum(e){return Fe.checkStandardUPCEANChecksum(e)}static checkStandardUPCEANChecksum(e){let t=e.length;if(t===0)return!1;let i=parseInt(e.charAt(t-1),10);return Fe.getStandardUPCEANChecksum(e.substring(0,t-1))===i}static getStandardUPCEANChecksum(e){let t=e.length,i=0;for(let r=t-1;r>=0;r-=2){let s=e.charAt(r).charCodeAt(0)-48;if(s<0||s>9)throw new z;i+=s}i*=3;for(let r=t-2;r>=0;r-=2){let s=e.charAt(r).charCodeAt(0)-48;if(s<0||s>9)throw new z;i+=s}return(1e3-i)%10}static decodeEnd(e,t){return Fe.findGuardPattern(e,t,!1,Fe.START_END_PATTERN,new Int32Array(Fe.START_END_PATTERN.length).fill(0))}static findGuardPatternWithoutCounters(e,t,i,r){return this.findGuardPattern(e,t,i,r,new Int32Array(r.length))}static findGuardPattern(e,t,i,r,s){let o=e.getSize();t=i?e.getNextUnset(t):e.getNextSet(t);let c=0,h=t,f=r.length,p=i;for(let w=t;w<o;w++)if(e.get(w)!==p)s[c]++;else{if(c===f-1){if(Ge.patternMatchVariance(s,r,Fe.MAX_INDIVIDUAL_VARIANCE)<Fe.MAX_AVG_VARIANCE)return Int32Array.from([h,w]);h+=s[0]+s[1];let b=s.slice(2,s.length-1);for(let y=0;y<c-1;y++)s[y]=b[y];s[c-1]=0,s[c]=0,c--}else c++;s[c]=1,p=!p}throw new D}static decodeDigit(e,t,i,r){this.recordPattern(e,i,t);let s=this.MAX_AVG_VARIANCE,o=-1,c=r.length;for(let h=0;h<c;h++){let f=r[h],p=Ge.patternMatchVariance(t,f,Fe.MAX_INDIVIDUAL_VARIANCE);p<s&&(s=p,o=h)}if(o>=0)return o;throw new D}}Fe.MAX_AVG_VARIANCE=.48,Fe.MAX_INDIVIDUAL_VARIANCE=.7,Fe.START_END_PATTERN=Int32Array.from([1,1,1]),Fe.MIDDLE_PATTERN=Int32Array.from([1,1,1,1,1]),Fe.END_PATTERN=Int32Array.from([1,1,1,1,1,1]),Fe.L_PATTERNS=[Int32Array.from([3,2,1,1]),Int32Array.from([2,2,2,1]),Int32Array.from([2,1,2,2]),Int32Array.from([1,4,1,1]),Int32Array.from([1,1,3,2]),Int32Array.from([1,2,3,1]),Int32Array.from([1,1,1,4]),Int32Array.from([1,3,1,2]),Int32Array.from([1,2,1,3]),Int32Array.from([3,1,1,2])];class gr{constructor(){this.CHECK_DIGIT_ENCODINGS=[24,20,18,17,12,6,3,10,9,5],this.decodeMiddleCounters=Int32Array.from([0,0,0,0]),this.decodeRowStringBuffer=""}decodeRow(e,t,i){let r=this.decodeRowStringBuffer,s=this.decodeMiddle(t,i,r),o=r.toString(),c=gr.parseExtensionString(o),h=[new j((i[0]+i[1])/2,e),new j(s,e)],f=new ct(o,null,0,h,Q.UPC_EAN_EXTENSION,new Date().getTime());return c!=null&&f.putAllMetadata(c),f}decodeMiddle(e,t,i){let r=this.decodeMiddleCounters;r[0]=0,r[1]=0,r[2]=0,r[3]=0;let s=e.getSize(),o=t[1],c=0;for(let f=0;f<5&&o<s;f++){let p=Fe.decodeDigit(e,r,o,Fe.L_AND_G_PATTERNS);i+=String.fromCharCode(48+p%10);for(let w of r)o+=w;p>=10&&(c|=1<<4-f),f!==4&&(o=e.getNextSet(o),o=e.getNextUnset(o))}if(i.length!==5)throw new D;let h=this.determineCheckDigit(c);if(gr.extensionChecksum(i.toString())!==h)throw new D;return o}static extensionChecksum(e){let t=e.length,i=0;for(let r=t-2;r>=0;r-=2)i+=e.charAt(r).charCodeAt(0)-48;i*=3;for(let r=t-1;r>=0;r-=2)i+=e.charAt(r).charCodeAt(0)-48;return i*=3,i%10}determineCheckDigit(e){for(let t=0;t<10;t++)if(e===this.CHECK_DIGIT_ENCODINGS[t])return t;throw new D}static parseExtensionString(e){if(e.length!==5)return null;let t=gr.parseExtension5String(e);return t==null?null:new Map([[Ye.SUGGESTED_PRICE,t]])}static parseExtension5String(e){let t;switch(e.charAt(0)){case"0":t="£";break;case"5":t="$";break;case"9":switch(e){case"90000":return null;case"99991":return"0.00";case"99990":return"Used"}t="";break;default:t="";break}let i=parseInt(e.substring(1)),r=(i/100).toString(),s=i%100,o=s<10?"0"+s:s.toString();return t+r+"."+o}}class An{constructor(){this.decodeMiddleCounters=Int32Array.from([0,0,0,0]),this.decodeRowStringBuffer=""}decodeRow(e,t,i){let r=this.decodeRowStringBuffer,s=this.decodeMiddle(t,i,r),o=r.toString(),c=An.parseExtensionString(o),h=[new j((i[0]+i[1])/2,e),new j(s,e)],f=new ct(o,null,0,h,Q.UPC_EAN_EXTENSION,new Date().getTime());return c!=null&&f.putAllMetadata(c),f}decodeMiddle(e,t,i){let r=this.decodeMiddleCounters;r[0]=0,r[1]=0,r[2]=0,r[3]=0;let s=e.getSize(),o=t[1],c=0;for(let h=0;h<2&&o<s;h++){let f=Fe.decodeDigit(e,r,o,Fe.L_AND_G_PATTERNS);i+=String.fromCharCode(48+f%10);for(let p of r)o+=p;f>=10&&(c|=1<<1-h),h!==1&&(o=e.getNextSet(o),o=e.getNextUnset(o))}if(i.length!==2)throw new D;if(parseInt(i.toString())%4!==c)throw new D;return o}static parseExtensionString(e){return e.length!==2?null:new Map([[Ye.ISSUE_NUMBER,parseInt(e)]])}}class $s{static decodeRow(e,t,i){let r=Fe.findGuardPattern(t,i,!1,this.EXTENSION_START_PATTERN,new Int32Array(this.EXTENSION_START_PATTERN.length).fill(0));try{return new gr().decodeRow(e,t,r)}catch{return new An().decodeRow(e,t,r)}}}$s.EXTENSION_START_PATTERN=Int32Array.from([1,1,2]);class _e extends Fe{constructor(){super(),this.decodeRowStringBuffer="",_e.L_AND_G_PATTERNS=_e.L_PATTERNS.map(e=>Int32Array.from(e));for(let e=10;e<20;e++){let t=_e.L_PATTERNS[e-10],i=new Int32Array(t.length);for(let r=0;r<t.length;r++)i[r]=t[t.length-r-1];_e.L_AND_G_PATTERNS[e]=i}}decodeRow(e,t,i){let r=_e.findStartGuardPattern(t),s=i==null?null:i.get(we.NEED_RESULT_POINT_CALLBACK);if(s!=null){const B=new j((r[0]+r[1])/2,e);s.foundPossibleResultPoint(B)}let o=this.decodeMiddle(t,r,this.decodeRowStringBuffer),c=o.rowOffset,h=o.resultString;if(s!=null){const B=new j(c,e);s.foundPossibleResultPoint(B)}let f=this.decodeEnd(t,c);if(s!=null){const B=new j((f[0]+f[1])/2,e);s.foundPossibleResultPoint(B)}let p=f[1],w=p+(p-f[0]);if(w>=t.getSize()||!t.isRange(p,w,!1))throw new D;let b=h.toString();if(b.length<8)throw new z;if(!_e.checkChecksum(b))throw new X;let y=(r[1]+r[0])/2,E=(f[1]+f[0])/2,S=this.getBarcodeFormat(),T=[new j(y,e),new j(E,e)],R=new ct(b,null,0,T,S,new Date().getTime()),F=0;try{let B=$s.decodeRow(e,t,f[1]);R.putMetadata(Ye.UPC_EAN_EXTENSION,B.getText()),R.putAllMetadata(B.getResultMetadata()),R.addResultPoints(B.getResultPoints()),F=B.getText().length}catch{}let U=i==null?null:i.get(we.ALLOWED_EAN_EXTENSIONS);if(U!=null){let B=!1;for(let ue in U)if(F.toString()===ue){B=!0;break}if(!B)throw new D}return R}decodeEnd(e,t){return _e.findGuardPattern(e,t,!1,_e.START_END_PATTERN,new Int32Array(_e.START_END_PATTERN.length).fill(0))}static checkChecksum(e){return _e.checkStandardUPCEANChecksum(e)}static checkStandardUPCEANChecksum(e){let t=e.length;if(t===0)return!1;let i=parseInt(e.charAt(t-1),10);return _e.getStandardUPCEANChecksum(e.substring(0,t-1))===i}static getStandardUPCEANChecksum(e){let t=e.length,i=0;for(let r=t-1;r>=0;r-=2){let s=e.charAt(r).charCodeAt(0)-48;if(s<0||s>9)throw new z;i+=s}i*=3;for(let r=t-2;r>=0;r-=2){let s=e.charAt(r).charCodeAt(0)-48;if(s<0||s>9)throw new z;i+=s}return(1e3-i)%10}}class vi extends _e{constructor(){super(),this.decodeMiddleCounters=Int32Array.from([0,0,0,0])}decodeMiddle(e,t,i){let r=this.decodeMiddleCounters;r[0]=0,r[1]=0,r[2]=0,r[3]=0;let s=e.getSize(),o=t[1],c=0;for(let f=0;f<6&&o<s;f++){let p=_e.decodeDigit(e,r,o,_e.L_AND_G_PATTERNS);i+=String.fromCharCode(48+p%10);for(let w of r)o+=w;p>=10&&(c|=1<<5-f)}i=vi.determineFirstDigit(i,c),o=_e.findGuardPattern(e,o,!0,_e.MIDDLE_PATTERN,new Int32Array(_e.MIDDLE_PATTERN.length).fill(0))[1];for(let f=0;f<6&&o<s;f++){let p=_e.decodeDigit(e,r,o,_e.L_PATTERNS);i+=String.fromCharCode(48+p);for(let w of r)o+=w}return{rowOffset:o,resultString:i}}getBarcodeFormat(){return Q.EAN_13}static determineFirstDigit(e,t){for(let i=0;i<10;i++)if(t===this.FIRST_DIGIT_ENCODINGS[i])return e=String.fromCharCode(48+i)+e,e;throw new D}}vi.FIRST_DIGIT_ENCODINGS=[0,11,13,14,19,25,28,21,22,26];class Hs extends _e{constructor(){super(),this.decodeMiddleCounters=Int32Array.from([0,0,0,0])}decodeMiddle(e,t,i){const r=this.decodeMiddleCounters;r[0]=0,r[1]=0,r[2]=0,r[3]=0;let s=e.getSize(),o=t[1];for(let h=0;h<4&&o<s;h++){let f=_e.decodeDigit(e,r,o,_e.L_PATTERNS);i+=String.fromCharCode(48+f);for(let p of r)o+=p}o=_e.findGuardPattern(e,o,!0,_e.MIDDLE_PATTERN,new Int32Array(_e.MIDDLE_PATTERN.length).fill(0))[1];for(let h=0;h<4&&o<s;h++){let f=_e.decodeDigit(e,r,o,_e.L_PATTERNS);i+=String.fromCharCode(48+f);for(let p of r)o+=p}return{rowOffset:o,resultString:i}}getBarcodeFormat(){return Q.EAN_8}}class Gs extends _e{constructor(){super(...arguments),this.ean13Reader=new vi}getBarcodeFormat(){return Q.UPC_A}decode(e,t){return this.maybeReturnResult(this.ean13Reader.decode(e))}decodeRow(e,t,i){return this.maybeReturnResult(this.ean13Reader.decodeRow(e,t,i))}decodeMiddle(e,t,i){return this.ean13Reader.decodeMiddle(e,t,i)}maybeReturnResult(e){let t=e.getText();if(t.charAt(0)==="0"){let i=new ct(t.substring(1),null,null,e.getResultPoints(),Q.UPC_A);return e.getResultMetadata()!=null&&i.putAllMetadata(e.getResultMetadata()),i}else throw new D}reset(){this.ean13Reader.reset()}}class Nt extends _e{constructor(){super(),this.decodeMiddleCounters=new Int32Array(4)}decodeMiddle(e,t,i){const r=this.decodeMiddleCounters.map(f=>f);r[0]=0,r[1]=0,r[2]=0,r[3]=0;const s=e.getSize();let o=t[1],c=0;for(let f=0;f<6&&o<s;f++){const p=Nt.decodeDigit(e,r,o,Nt.L_AND_G_PATTERNS);i+=String.fromCharCode(48+p%10);for(let w of r)o+=w;p>=10&&(c|=1<<5-f)}let h=Nt.determineNumSysAndCheckDigit(i,c);return{rowOffset:o,resultString:h}}decodeEnd(e,t){return Nt.findGuardPatternWithoutCounters(e,t,!0,Nt.MIDDLE_END_PATTERN)}checkChecksum(e){return _e.checkChecksum(Nt.convertUPCEtoUPCA(e))}static determineNumSysAndCheckDigit(e,t){for(let i=0;i<=1;i++)for(let r=0;r<10;r++)if(t===this.NUMSYS_AND_CHECK_DIGIT_PATTERNS[i][r]){let s=String.fromCharCode(48+i),o=String.fromCharCode(48+r);return s+e+o}throw D.getNotFoundInstance()}getBarcodeFormat(){return Q.UPC_E}static convertUPCEtoUPCA(e){const t=e.slice(1,7).split("").map(s=>s.charCodeAt(0)),i=new se;i.append(e.charAt(0));let r=t[5];switch(r){case 0:case 1:case 2:i.appendChars(t,0,2),i.append(r),i.append("0000"),i.appendChars(t,2,3);break;case 3:i.appendChars(t,0,3),i.append("00000"),i.appendChars(t,3,2);break;case 4:i.appendChars(t,0,4),i.append("00000"),i.append(t[4]);break;default:i.appendChars(t,0,5),i.append("0000"),i.append(r);break}return e.length>=8&&i.append(e.charAt(7)),i.toString()}}Nt.MIDDLE_END_PATTERN=Int32Array.from([1,1,1,1,1,1]),Nt.NUMSYS_AND_CHECK_DIGIT_PATTERNS=[Int32Array.from([56,52,50,49,44,38,35,42,41,37]),Int32Array.from([7,11,13,14,19,25,28,21,22,26])];class En extends Ge{constructor(e){super();let t=e==null?null:e.get(we.POSSIBLE_FORMATS),i=[];d(t)?(i.push(new vi),i.push(new Gs),i.push(new Hs),i.push(new Nt)):(t.indexOf(Q.EAN_13)>-1&&i.push(new vi),t.indexOf(Q.UPC_A)>-1&&i.push(new Gs),t.indexOf(Q.EAN_8)>-1&&i.push(new Hs),t.indexOf(Q.UPC_E)>-1&&i.push(new Nt)),this.readers=i}decodeRow(e,t,i){for(let r of this.readers)try{const s=r.decodeRow(e,t,i),o=s.getBarcodeFormat()===Q.EAN_13&&s.getText().charAt(0)==="0",c=i==null?null:i.get(we.POSSIBLE_FORMATS),h=c==null||c.includes(Q.UPC_A);if(o&&h){const f=s.getRawBytes(),p=new ct(s.getText().substring(1),f,f?f.length:null,s.getResultPoints(),Q.UPC_A);return p.putAllMetadata(s.getResultMetadata()),p}return s}catch{}throw new D}reset(){for(let e of this.readers)e.reset()}}class st extends Ge{constructor(){super(),this.decodeFinderCounters=new Int32Array(4),this.dataCharacterCounters=new Int32Array(8),this.oddRoundingErrors=new Array(4),this.evenRoundingErrors=new Array(4),this.oddCounts=new Array(this.dataCharacterCounters.length/2),this.evenCounts=new Array(this.dataCharacterCounters.length/2)}getDecodeFinderCounters(){return this.decodeFinderCounters}getDataCharacterCounters(){return this.dataCharacterCounters}getOddRoundingErrors(){return this.oddRoundingErrors}getEvenRoundingErrors(){return this.evenRoundingErrors}getOddCounts(){return this.oddCounts}getEvenCounts(){return this.evenCounts}parseFinderValue(e,t){for(let i=0;i<t.length;i++)if(Ge.patternMatchVariance(e,t[i],st.MAX_INDIVIDUAL_VARIANCE)<st.MAX_AVG_VARIANCE)return i;throw new D}static count(e){return me.sum(new Int32Array(e))}static increment(e,t){let i=0,r=t[0];for(let s=1;s<e.length;s++)t[s]>r&&(r=t[s],i=s);e[i]++}static decrement(e,t){let i=0,r=t[0];for(let s=1;s<e.length;s++)t[s]<r&&(r=t[s],i=s);e[i]--}static isFinderPattern(e){let t=e[0]+e[1],i=t+e[2]+e[3],r=t/i;if(r>=st.MIN_FINDER_PATTERN_RATIO&&r<=st.MAX_FINDER_PATTERN_RATIO){let s=Number.MAX_SAFE_INTEGER,o=Number.MIN_SAFE_INTEGER;for(let c of e)c>o&&(o=c),c<s&&(s=c);return o<10*s}return!1}}st.MAX_AVG_VARIANCE=.2,st.MAX_INDIVIDUAL_VARIANCE=.45,st.MIN_FINDER_PATTERN_RATIO=9.5/12,st.MAX_FINDER_PATTERN_RATIO=12.5/14;class Vi{constructor(e,t){this.value=e,this.checksumPortion=t}getValue(){return this.value}getChecksumPortion(){return this.checksumPortion}toString(){return this.value+"("+this.checksumPortion+")"}equals(e){if(!(e instanceof Vi))return!1;const t=e;return this.value===t.value&&this.checksumPortion===t.checksumPortion}hashCode(){return this.value^this.checksumPortion}}class Gr{constructor(e,t,i,r,s){this.value=e,this.startEnd=t,this.value=e,this.startEnd=t,this.resultPoints=new Array,this.resultPoints.push(new j(i,s)),this.resultPoints.push(new j(r,s))}getValue(){return this.value}getStartEnd(){return this.startEnd}getResultPoints(){return this.resultPoints}equals(e){if(!(e instanceof Gr))return!1;const t=e;return this.value===t.value}hashCode(){return this.value}}class Lt{constructor(){}static getRSSvalue(e,t,i){let r=0;for(let h of e)r+=h;let s=0,o=0,c=e.length;for(let h=0;h<c-1;h++){let f;for(f=1,o|=1<<h;f<e[h];f++,o&=~(1<<h)){let p=Lt.combins(r-f-1,c-h-2);if(i&&o===0&&r-f-(c-h-1)>=c-h-1&&(p-=Lt.combins(r-f-(c-h),c-h-2)),c-h-1>1){let w=0;for(let b=r-f-(c-h-2);b>t;b--)w+=Lt.combins(r-f-b-1,c-h-3);p-=w*(c-1-h)}else r-f>t&&p--;s+=p}r-=f}return s}static combins(e,t){let i,r;e-t>t?(r=t,i=e-t):(r=e-t,i=t);let s=1,o=1;for(let c=e;c>i;c--)s*=c,o<=r&&(s/=o,o++);for(;o<=r;)s/=o,o++;return s}}class Ho{static buildBitArray(e){let t=e.length*2-1;e[e.length-1].getRightChar()==null&&(t-=1);let i=12*t,r=new ce(i),s=0,c=e[0].getRightChar().getValue();for(let h=11;h>=0;--h)c&1<<h&&r.set(s),s++;for(let h=1;h<e.length;++h){let f=e[h],p=f.getLeftChar().getValue();for(let w=11;w>=0;--w)p&1<<w&&r.set(s),s++;if(f.getRightChar()!=null){let w=f.getRightChar().getValue();for(let b=11;b>=0;--b)w&1<<b&&r.set(s),s++}}return r}}class yi{constructor(e,t){t?this.decodedInformation=null:(this.finished=e,this.decodedInformation=t)}getDecodedInformation(){return this.decodedInformation}isFinished(){return this.finished}}class Sn{constructor(e){this.newPosition=e}getNewPosition(){return this.newPosition}}class gt extends Sn{constructor(e,t){super(e),this.value=t}getValue(){return this.value}isFNC1(){return this.value===gt.FNC1}}gt.FNC1="$";class Ci extends Sn{constructor(e,t,i){super(e),i?(this.remaining=!0,this.remainingValue=this.remainingValue):(this.remaining=!1,this.remainingValue=0),this.newString=t}getNewString(){return this.newString}isRemaining(){return this.remaining}getRemainingValue(){return this.remainingValue}}class Ct extends Sn{constructor(e,t,i){if(super(e),t<0||t>10||i<0||i>10)throw new z;this.firstDigit=t,this.secondDigit=i}getFirstDigit(){return this.firstDigit}getSecondDigit(){return this.secondDigit}getValue(){return this.firstDigit*10+this.secondDigit}isFirstDigitFNC1(){return this.firstDigit===Ct.FNC1}isSecondDigitFNC1(){return this.secondDigit===Ct.FNC1}isAnyFNC1(){return this.firstDigit===Ct.FNC1||this.secondDigit===Ct.FNC1}}Ct.FNC1=10;class G{constructor(){}static parseFieldsInGeneralPurpose(e){if(!e)return null;if(e.length<2)throw new D;let t=e.substring(0,2);for(let s of G.TWO_DIGIT_DATA_LENGTH)if(s[0]===t)return s[1]===G.VARIABLE_LENGTH?G.processVariableAI(2,s[2],e):G.processFixedAI(2,s[1],e);if(e.length<3)throw new D;let i=e.substring(0,3);for(let s of G.THREE_DIGIT_DATA_LENGTH)if(s[0]===i)return s[1]===G.VARIABLE_LENGTH?G.processVariableAI(3,s[2],e):G.processFixedAI(3,s[1],e);for(let s of G.THREE_DIGIT_PLUS_DIGIT_DATA_LENGTH)if(s[0]===i)return s[1]===G.VARIABLE_LENGTH?G.processVariableAI(4,s[2],e):G.processFixedAI(4,s[1],e);if(e.length<4)throw new D;let r=e.substring(0,4);for(let s of G.FOUR_DIGIT_DATA_LENGTH)if(s[0]===r)return s[1]===G.VARIABLE_LENGTH?G.processVariableAI(4,s[2],e):G.processFixedAI(4,s[1],e);throw new D}static processFixedAI(e,t,i){if(i.length<e)throw new D;let r=i.substring(0,e);if(i.length<e+t)throw new D;let s=i.substring(e,e+t),o=i.substring(e+t),c="("+r+")"+s,h=G.parseFieldsInGeneralPurpose(o);return h==null?c:c+h}static processVariableAI(e,t,i){let r=i.substring(0,e),s;i.length<e+t?s=i.length:s=e+t;let o=i.substring(e,s),c=i.substring(s),h="("+r+")"+o,f=G.parseFieldsInGeneralPurpose(c);return f==null?h:h+f}}G.VARIABLE_LENGTH=[],G.TWO_DIGIT_DATA_LENGTH=[["00",18],["01",14],["02",14],["10",G.VARIABLE_LENGTH,20],["11",6],["12",6],["13",6],["15",6],["17",6],["20",2],["21",G.VARIABLE_LENGTH,20],["22",G.VARIABLE_LENGTH,29],["30",G.VARIABLE_LENGTH,8],["37",G.VARIABLE_LENGTH,8],["90",G.VARIABLE_LENGTH,30],["91",G.VARIABLE_LENGTH,30],["92",G.VARIABLE_LENGTH,30],["93",G.VARIABLE_LENGTH,30],["94",G.VARIABLE_LENGTH,30],["95",G.VARIABLE_LENGTH,30],["96",G.VARIABLE_LENGTH,30],["97",G.VARIABLE_LENGTH,3],["98",G.VARIABLE_LENGTH,30],["99",G.VARIABLE_LENGTH,30]],G.THREE_DIGIT_DATA_LENGTH=[["240",G.VARIABLE_LENGTH,30],["241",G.VARIABLE_LENGTH,30],["242",G.VARIABLE_LENGTH,6],["250",G.VARIABLE_LENGTH,30],["251",G.VARIABLE_LENGTH,30],["253",G.VARIABLE_LENGTH,17],["254",G.VARIABLE_LENGTH,20],["400",G.VARIABLE_LENGTH,30],["401",G.VARIABLE_LENGTH,30],["402",17],["403",G.VARIABLE_LENGTH,30],["410",13],["411",13],["412",13],["413",13],["414",13],["420",G.VARIABLE_LENGTH,20],["421",G.VARIABLE_LENGTH,15],["422",3],["423",G.VARIABLE_LENGTH,15],["424",3],["425",3],["426",3]],G.THREE_DIGIT_PLUS_DIGIT_DATA_LENGTH=[["310",6],["311",6],["312",6],["313",6],["314",6],["315",6],["316",6],["320",6],["321",6],["322",6],["323",6],["324",6],["325",6],["326",6],["327",6],["328",6],["329",6],["330",6],["331",6],["332",6],["333",6],["334",6],["335",6],["336",6],["340",6],["341",6],["342",6],["343",6],["344",6],["345",6],["346",6],["347",6],["348",6],["349",6],["350",6],["351",6],["352",6],["353",6],["354",6],["355",6],["356",6],["357",6],["360",6],["361",6],["362",6],["363",6],["364",6],["365",6],["366",6],["367",6],["368",6],["369",6],["390",G.VARIABLE_LENGTH,15],["391",G.VARIABLE_LENGTH,18],["392",G.VARIABLE_LENGTH,15],["393",G.VARIABLE_LENGTH,18],["703",G.VARIABLE_LENGTH,30]],G.FOUR_DIGIT_DATA_LENGTH=[["7001",13],["7002",G.VARIABLE_LENGTH,30],["7003",10],["8001",14],["8002",G.VARIABLE_LENGTH,20],["8003",G.VARIABLE_LENGTH,30],["8004",G.VARIABLE_LENGTH,30],["8005",6],["8006",18],["8007",G.VARIABLE_LENGTH,30],["8008",G.VARIABLE_LENGTH,12],["8018",18],["8020",G.VARIABLE_LENGTH,25],["8100",6],["8101",10],["8102",2],["8110",G.VARIABLE_LENGTH,70],["8200",G.VARIABLE_LENGTH,70]];class $i{constructor(e){this.buffer=new se,this.information=e}decodeAllCodes(e,t){let i=t,r=null;do{let s=this.decodeGeneralPurposeField(i,r),o=G.parseFieldsInGeneralPurpose(s.getNewString());if(o!=null&&e.append(o),s.isRemaining()?r=""+s.getRemainingValue():r=null,i===s.getNewPosition())break;i=s.getNewPosition()}while(!0);return e.toString()}isStillNumeric(e){if(e+7>this.information.getSize())return e+4<=this.information.getSize();for(let t=e;t<e+3;++t)if(this.information.get(t))return!0;return this.information.get(e+3)}decodeNumeric(e){if(e+7>this.information.getSize()){let s=this.extractNumericValueFromBitArray(e,4);return s===0?new Ct(this.information.getSize(),Ct.FNC1,Ct.FNC1):new Ct(this.information.getSize(),s-1,Ct.FNC1)}let t=this.extractNumericValueFromBitArray(e,7),i=(t-8)/11,r=(t-8)%11;return new Ct(e+7,i,r)}extractNumericValueFromBitArray(e,t){return $i.extractNumericValueFromBitArray(this.information,e,t)}static extractNumericValueFromBitArray(e,t,i){let r=0;for(let s=0;s<i;++s)e.get(t+s)&&(r|=1<<i-s-1);return r}decodeGeneralPurposeField(e,t){this.buffer.setLengthToZero(),t!=null&&this.buffer.append(t),this.current.setPosition(e);let i=this.parseBlocks();return i!=null&&i.isRemaining()?new Ci(this.current.getPosition(),this.buffer.toString(),i.getRemainingValue()):new Ci(this.current.getPosition(),this.buffer.toString())}parseBlocks(){let e,t;do{let i=this.current.getPosition();if(this.current.isAlpha()?(t=this.parseAlphaBlock(),e=t.isFinished()):this.current.isIsoIec646()?(t=this.parseIsoIec646Block(),e=t.isFinished()):(t=this.parseNumericBlock(),e=t.isFinished()),!(i!==this.current.getPosition())&&!e)break}while(!e);return t.getDecodedInformation()}parseNumericBlock(){for(;this.isStillNumeric(this.current.getPosition());){let e=this.decodeNumeric(this.current.getPosition());if(this.current.setPosition(e.getNewPosition()),e.isFirstDigitFNC1()){let t;return e.isSecondDigitFNC1()?t=new Ci(this.current.getPosition(),this.buffer.toString()):t=new Ci(this.current.getPosition(),this.buffer.toString(),e.getSecondDigit()),new yi(!0,t)}if(this.buffer.append(e.getFirstDigit()),e.isSecondDigitFNC1()){let t=new Ci(this.current.getPosition(),this.buffer.toString());return new yi(!0,t)}this.buffer.append(e.getSecondDigit())}return this.isNumericToAlphaNumericLatch(this.current.getPosition())&&(this.current.setAlpha(),this.current.incrementPosition(4)),new yi(!1)}parseIsoIec646Block(){for(;this.isStillIsoIec646(this.current.getPosition());){let e=this.decodeIsoIec646(this.current.getPosition());if(this.current.setPosition(e.getNewPosition()),e.isFNC1()){let t=new Ci(this.current.getPosition(),this.buffer.toString());return new yi(!0,t)}this.buffer.append(e.getValue())}return this.isAlphaOr646ToNumericLatch(this.current.getPosition())?(this.current.incrementPosition(3),this.current.setNumeric()):this.isAlphaTo646ToAlphaLatch(this.current.getPosition())&&(this.current.getPosition()+5<this.information.getSize()?this.current.incrementPosition(5):this.current.setPosition(this.information.getSize()),this.current.setAlpha()),new yi(!1)}parseAlphaBlock(){for(;this.isStillAlpha(this.current.getPosition());){let e=this.decodeAlphanumeric(this.current.getPosition());if(this.current.setPosition(e.getNewPosition()),e.isFNC1()){let t=new Ci(this.current.getPosition(),this.buffer.toString());return new yi(!0,t)}this.buffer.append(e.getValue())}return this.isAlphaOr646ToNumericLatch(this.current.getPosition())?(this.current.incrementPosition(3),this.current.setNumeric()):this.isAlphaTo646ToAlphaLatch(this.current.getPosition())&&(this.current.getPosition()+5<this.information.getSize()?this.current.incrementPosition(5):this.current.setPosition(this.information.getSize()),this.current.setIsoIec646()),new yi(!1)}isStillIsoIec646(e){if(e+5>this.information.getSize())return!1;let t=this.extractNumericValueFromBitArray(e,5);if(t>=5&&t<16)return!0;if(e+7>this.information.getSize())return!1;let i=this.extractNumericValueFromBitArray(e,7);if(i>=64&&i<116)return!0;if(e+8>this.information.getSize())return!1;let r=this.extractNumericValueFromBitArray(e,8);return r>=232&&r<253}decodeIsoIec646(e){let t=this.extractNumericValueFromBitArray(e,5);if(t===15)return new gt(e+5,gt.FNC1);if(t>=5&&t<15)return new gt(e+5,"0"+(t-5));let i=this.extractNumericValueFromBitArray(e,7);if(i>=64&&i<90)return new gt(e+7,""+(i+1));if(i>=90&&i<116)return new gt(e+7,""+(i+7));let r=this.extractNumericValueFromBitArray(e,8),s;switch(r){case 232:s="!";break;case 233:s='"';break;case 234:s="%";break;case 235:s="&";break;case 236:s="'";break;case 237:s="(";break;case 238:s=")";break;case 239:s="*";break;case 240:s="+";break;case 241:s=",";break;case 242:s="-";break;case 243:s=".";break;case 244:s="/";break;case 245:s=":";break;case 246:s=";";break;case 247:s="<";break;case 248:s="=";break;case 249:s=">";break;case 250:s="?";break;case 251:s="_";break;case 252:s=" ";break;default:throw new z}return new gt(e+8,s)}isStillAlpha(e){if(e+5>this.information.getSize())return!1;let t=this.extractNumericValueFromBitArray(e,5);if(t>=5&&t<16)return!0;if(e+6>this.information.getSize())return!1;let i=this.extractNumericValueFromBitArray(e,6);return i>=16&&i<63}decodeAlphanumeric(e){let t=this.extractNumericValueFromBitArray(e,5);if(t===15)return new gt(e+5,gt.FNC1);if(t>=5&&t<15)return new gt(e+5,"0"+(t-5));let i=this.extractNumericValueFromBitArray(e,6);if(i>=32&&i<58)return new gt(e+6,""+(i+33));let r;switch(i){case 58:r="*";break;case 59:r=",";break;case 60:r="-";break;case 61:r=".";break;case 62:r="/";break;default:throw new Bt("Decoding invalid alphanumeric value: "+i)}return new gt(e+6,r)}isAlphaTo646ToAlphaLatch(e){if(e+1>this.information.getSize())return!1;for(let t=0;t<5&&t+e<this.information.getSize();++t)if(t===2){if(!this.information.get(e+2))return!1}else if(this.information.get(e+t))return!1;return!0}isAlphaOr646ToNumericLatch(e){if(e+3>this.information.getSize())return!1;for(let t=e;t<e+3;++t)if(this.information.get(t))return!1;return!0}isNumericToAlphaNumericLatch(e){if(e+1>this.information.getSize())return!1;for(let t=0;t<4&&t+e<this.information.getSize();++t)if(this.information.get(e+t))return!1;return!0}}class In{constructor(e){this.information=e,this.generalDecoder=new $i(e)}getInformation(){return this.information}getGeneralDecoder(){return this.generalDecoder}}class pt extends In{constructor(e){super(e)}encodeCompressedGtin(e,t){e.append("(01)");let i=e.length();e.append("9"),this.encodeCompressedGtinWithoutAI(e,t,i)}encodeCompressedGtinWithoutAI(e,t,i){for(let r=0;r<4;++r){let s=this.getGeneralDecoder().extractNumericValueFromBitArray(t+10*r,10);s/100===0&&e.append("0"),s/10===0&&e.append("0"),e.append(s)}pt.appendCheckDigit(e,i)}static appendCheckDigit(e,t){let i=0;for(let r=0;r<13;r++){let s=e.charAt(r+t).charCodeAt(0)-48;i+=r&1?s:3*s}i=10-i%10,i===10&&(i=0),e.append(i)}}pt.GTIN_SIZE=40;class Hi extends pt{constructor(e){super(e)}parseInformation(){let e=new se;e.append("(01)");let t=e.length(),i=this.getGeneralDecoder().extractNumericValueFromBitArray(Hi.HEADER_SIZE,4);return e.append(i),this.encodeCompressedGtinWithoutAI(e,Hi.HEADER_SIZE+4,t),this.getGeneralDecoder().decodeAllCodes(e,Hi.HEADER_SIZE+44)}}Hi.HEADER_SIZE=4;class Wr extends In{constructor(e){super(e)}parseInformation(){let e=new se;return this.getGeneralDecoder().decodeAllCodes(e,Wr.HEADER_SIZE)}}Wr.HEADER_SIZE=5;class Xr extends pt{constructor(e){super(e)}encodeCompressedWeight(e,t,i){let r=this.getGeneralDecoder().extractNumericValueFromBitArray(t,i);this.addWeightCode(e,r);let s=this.checkWeight(r),o=1e5;for(let c=0;c<5;++c)s/o===0&&e.append("0"),o/=10;e.append(s)}}class Ft extends Xr{constructor(e){super(e)}parseInformation(){if(this.getInformation().getSize()!=Ft.HEADER_SIZE+Xr.GTIN_SIZE+Ft.WEIGHT_SIZE)throw new D;let e=new se;return this.encodeCompressedGtin(e,Ft.HEADER_SIZE),this.encodeCompressedWeight(e,Ft.HEADER_SIZE+Xr.GTIN_SIZE,Ft.WEIGHT_SIZE),e.toString()}}Ft.HEADER_SIZE=5,Ft.WEIGHT_SIZE=15;class Go extends Ft{constructor(e){super(e)}addWeightCode(e,t){e.append("(3103)")}checkWeight(e){return e}}class Wo extends Ft{constructor(e){super(e)}addWeightCode(e,t){t<1e4?e.append("(3202)"):e.append("(3203)")}checkWeight(e){return e<1e4?e:e-1e4}}class Ut extends pt{constructor(e){super(e)}parseInformation(){if(this.getInformation().getSize()<Ut.HEADER_SIZE+pt.GTIN_SIZE)throw new D;let e=new se;this.encodeCompressedGtin(e,Ut.HEADER_SIZE);let t=this.getGeneralDecoder().extractNumericValueFromBitArray(Ut.HEADER_SIZE+pt.GTIN_SIZE,Ut.LAST_DIGIT_SIZE);e.append("(392"),e.append(t),e.append(")");let i=this.getGeneralDecoder().decodeGeneralPurposeField(Ut.HEADER_SIZE+pt.GTIN_SIZE+Ut.LAST_DIGIT_SIZE,null);return e.append(i.getNewString()),e.toString()}}Ut.HEADER_SIZE=8,Ut.LAST_DIGIT_SIZE=2;class ht extends pt{constructor(e){super(e)}parseInformation(){if(this.getInformation().getSize()<ht.HEADER_SIZE+pt.GTIN_SIZE)throw new D;let e=new se;this.encodeCompressedGtin(e,ht.HEADER_SIZE);let t=this.getGeneralDecoder().extractNumericValueFromBitArray(ht.HEADER_SIZE+pt.GTIN_SIZE,ht.LAST_DIGIT_SIZE);e.append("(393"),e.append(t),e.append(")");let i=this.getGeneralDecoder().extractNumericValueFromBitArray(ht.HEADER_SIZE+pt.GTIN_SIZE+ht.LAST_DIGIT_SIZE,ht.FIRST_THREE_DIGITS_SIZE);i/100==0&&e.append("0"),i/10==0&&e.append("0"),e.append(i);let r=this.getGeneralDecoder().decodeGeneralPurposeField(ht.HEADER_SIZE+pt.GTIN_SIZE+ht.LAST_DIGIT_SIZE+ht.FIRST_THREE_DIGITS_SIZE,null);return e.append(r.getNewString()),e.toString()}}ht.HEADER_SIZE=8,ht.LAST_DIGIT_SIZE=2,ht.FIRST_THREE_DIGITS_SIZE=10;class Re extends Xr{constructor(e,t,i){super(e),this.dateCode=i,this.firstAIdigits=t}parseInformation(){if(this.getInformation().getSize()!=Re.HEADER_SIZE+Re.GTIN_SIZE+Re.WEIGHT_SIZE+Re.DATE_SIZE)throw new D;let e=new se;return this.encodeCompressedGtin(e,Re.HEADER_SIZE),this.encodeCompressedWeight(e,Re.HEADER_SIZE+Re.GTIN_SIZE,Re.WEIGHT_SIZE),this.encodeCompressedDate(e,Re.HEADER_SIZE+Re.GTIN_SIZE+Re.WEIGHT_SIZE),e.toString()}encodeCompressedDate(e,t){let i=this.getGeneralDecoder().extractNumericValueFromBitArray(t,Re.DATE_SIZE);if(i==38400)return;e.append("("),e.append(this.dateCode),e.append(")");let r=i%32;i/=32;let s=i%12+1;i/=12;let o=i;o/10==0&&e.append("0"),e.append(o),s/10==0&&e.append("0"),e.append(s),r/10==0&&e.append("0"),e.append(r)}addWeightCode(e,t){e.append("("),e.append(this.firstAIdigits),e.append(t/1e5),e.append(")")}checkWeight(e){return e%1e5}}Re.HEADER_SIZE=8,Re.WEIGHT_SIZE=20,Re.DATE_SIZE=16;function Ws(x){try{if(x.get(1))return new Hi(x);if(!x.get(2))return new Wr(x);switch($i.extractNumericValueFromBitArray(x,1,4)){case 4:return new Go(x);case 5:return new Wo(x)}switch($i.extractNumericValueFromBitArray(x,1,5)){case 12:return new Ut(x);case 13:return new ht(x)}switch($i.extractNumericValueFromBitArray(x,1,7)){case 56:return new Re(x,"310","11");case 57:return new Re(x,"320","11");case 58:return new Re(x,"310","13");case 59:return new Re(x,"320","13");case 60:return new Re(x,"310","15");case 61:return new Re(x,"320","15");case 62:return new Re(x,"310","17");case 63:return new Re(x,"320","17")}}catch(e){throw console.log(e),new Bt("unknown decoder: "+x)}}class si{constructor(e,t,i,r){this.leftchar=e,this.rightchar=t,this.finderpattern=i,this.maybeLast=r}mayBeLast(){return this.maybeLast}getLeftChar(){return this.leftchar}getRightChar(){return this.rightchar}getFinderPattern(){return this.finderpattern}mustBeLast(){return this.rightchar==null}toString(){return"[ "+this.leftchar+", "+this.rightchar+" : "+(this.finderpattern==null?"null":this.finderpattern.getValue())+" ]"}static equals(e,t){return e instanceof si?si.equalsOrNull(e.leftchar,t.leftchar)&&si.equalsOrNull(e.rightchar,t.rightchar)&&si.equalsOrNull(e.finderpattern,t.finderpattern):!1}static equalsOrNull(e,t){return e===null?t===null:si.equals(e,t)}hashCode(){return this.leftchar.getValue()^this.rightchar.getValue()^this.finderpattern.getValue()}}class Tn{constructor(e,t,i){this.pairs=e,this.rowNumber=t,this.wasReversed=i}getPairs(){return this.pairs}getRowNumber(){return this.rowNumber}isReversed(){return this.wasReversed}isEquivalent(e){return this.checkEqualitity(this,e)}toString(){return"{ "+this.pairs+" }"}equals(e,t){return e instanceof Tn?this.checkEqualitity(e,t)&&e.wasReversed===t.wasReversed:!1}checkEqualitity(e,t){if(!e||!t)return;let i;return e.forEach((r,s)=>{t.forEach(o=>{r.getLeftChar().getValue()===o.getLeftChar().getValue()&&r.getRightChar().getValue()===o.getRightChar().getValue()&&r.getFinderPatter().getValue()===o.getFinderPatter().getValue()&&(i=!0)})}),i}}class M extends st{constructor(e){super(...arguments),this.pairs=new Array(M.MAX_PAIRS),this.rows=new Array,this.startEnd=[2],this.verbose=e===!0}decodeRow(e,t,i){this.pairs.length=0,this.startFromEven=!1;try{return M.constructResult(this.decodeRow2pairs(e,t))}catch(r){this.verbose&&console.log(r)}return this.pairs.length=0,this.startFromEven=!0,M.constructResult(this.decodeRow2pairs(e,t))}reset(){this.pairs.length=0,this.rows.length=0}decodeRow2pairs(e,t){let i=!1;for(;!i;)try{this.pairs.push(this.retrieveNextPair(t,this.pairs,e))}catch(s){if(s instanceof D){if(!this.pairs.length)throw new D;i=!0}}if(this.checkChecksum())return this.pairs;let r;if(this.rows.length?r=!0:r=!1,this.storeRow(e,!1),r){let s=this.checkRowsBoolean(!1);if(s!=null||(s=this.checkRowsBoolean(!0),s!=null))return s}throw new D}checkRowsBoolean(e){if(this.rows.length>25)return this.rows.length=0,null;this.pairs.length=0,e&&(this.rows=this.rows.reverse());let t=null;try{t=this.checkRows(new Array,0)}catch(i){this.verbose&&console.log(i)}return e&&(this.rows=this.rows.reverse()),t}checkRows(e,t){for(let i=t;i<this.rows.length;i++){let r=this.rows[i];this.pairs.length=0;for(let o of e)this.pairs.push(o.getPairs());if(this.pairs.push(r.getPairs()),!M.isValidSequence(this.pairs))continue;if(this.checkChecksum())return this.pairs;let s=new Array(e);s.push(r);try{return this.checkRows(s,i+1)}catch(o){this.verbose&&console.log(o)}}throw new D}static isValidSequence(e){for(let t of M.FINDER_PATTERN_SEQUENCES){if(e.length>t.length)continue;let i=!0;for(let r=0;r<e.length;r++)if(e[r].getFinderPattern().getValue()!=t[r]){i=!1;break}if(i)return!0}return!1}storeRow(e,t){let i=0,r=!1,s=!1;for(;i<this.rows.length;){let o=this.rows[i];if(o.getRowNumber()>e){s=o.isEquivalent(this.pairs);break}r=o.isEquivalent(this.pairs),i++}s||r||M.isPartialRow(this.pairs,this.rows)||(this.rows.push(i,new Tn(this.pairs,e,t)),this.removePartialRows(this.pairs,this.rows))}removePartialRows(e,t){for(let i of t)if(i.getPairs().length!==e.length){for(let r of i.getPairs())for(let s of e)if(si.equals(r,s))break}}static isPartialRow(e,t){for(let i of t){let r=!0;for(let s of e){let o=!1;for(let c of i.getPairs())if(s.equals(c)){o=!0;break}if(!o){r=!1;break}}if(r)return!0}return!1}getRows(){return this.rows}static constructResult(e){let t=Ho.buildBitArray(e),r=Ws(t).parseInformation(),s=e[0].getFinderPattern().getResultPoints(),o=e[e.length-1].getFinderPattern().getResultPoints(),c=[s[0],s[1],o[0],o[1]];return new ct(r,null,null,c,Q.RSS_EXPANDED,null)}checkChecksum(){let e=this.pairs.get(0),t=e.getLeftChar(),i=e.getRightChar();if(i==null)return!1;let r=i.getChecksumPortion(),s=2;for(let c=1;c<this.pairs.size();++c){let h=this.pairs.get(c);r+=h.getLeftChar().getChecksumPortion(),s++;let f=h.getRightChar();f!=null&&(r+=f.getChecksumPortion(),s++)}return r%=211,211*(s-4)+r==t.getValue()}static getNextSecondBar(e,t){let i;return e.get(t)?(i=e.getNextUnset(t),i=e.getNextSet(i)):(i=e.getNextSet(t),i=e.getNextUnset(i)),i}retrieveNextPair(e,t,i){let r=t.length%2==0;this.startFromEven&&(r=!r);let s,o=!0,c=-1;do this.findNextPair(e,t,c),s=this.parseFoundFinderPattern(e,i,r),s==null?c=M.getNextSecondBar(e,this.startEnd[0]):o=!1;while(o);let h=this.decodeDataCharacter(e,s,r,!0);if(!this.isEmptyPair(t)&&t[t.length-1].mustBeLast())throw new D;let f;try{f=this.decodeDataCharacter(e,s,r,!1)}catch(p){f=null,this.verbose&&console.log(p)}return new si(h,f,s,!0)}isEmptyPair(e){return e.length===0}findNextPair(e,t,i){let r=this.getDecodeFinderCounters();r[0]=0,r[1]=0,r[2]=0,r[3]=0;let s=e.getSize(),o;i>=0?o=i:this.isEmptyPair(t)?o=0:o=t[t.length-1].getFinderPattern().getStartEnd()[1];let c=t.length%2!=0;this.startFromEven&&(c=!c);let h=!1;for(;o<s&&(h=!e.get(o),!!h);)o++;let f=0,p=o;for(let w=o;w<s;w++)if(e.get(w)!=h)r[f]++;else{if(f==3){if(c&&M.reverseCounters(r),M.isFinderPattern(r)){this.startEnd[0]=p,this.startEnd[1]=w;return}c&&M.reverseCounters(r),p+=r[0]+r[1],r[0]=r[2],r[1]=r[3],r[2]=0,r[3]=0,f--}else f++;r[f]=1,h=!h}throw new D}static reverseCounters(e){let t=e.length;for(let i=0;i<t/2;++i){let r=e[i];e[i]=e[t-i-1],e[t-i-1]=r}}parseFoundFinderPattern(e,t,i){let r,s,o;if(i){let f=this.startEnd[0]-1;for(;f>=0&&!e.get(f);)f--;f++,r=this.startEnd[0]-f,s=f,o=this.startEnd[1]}else s=this.startEnd[0],o=e.getNextUnset(this.startEnd[1]+1),r=o-this.startEnd[1];let c=this.getDecodeFinderCounters();te.arraycopy(c,0,c,1,c.length-1),c[0]=r;let h;try{h=this.parseFinderValue(c,M.FINDER_PATTERNS)}catch{return null}return new Gr(h,[s,o],s,o,t)}decodeDataCharacter(e,t,i,r){let s=this.getDataCharacterCounters();for(let Ie=0;Ie<s.length;Ie++)s[Ie]=0;if(r)M.recordPatternInReverse(e,t.getStartEnd()[0],s);else{M.recordPattern(e,t.getStartEnd()[1],s);for(let Ie=0,nt=s.length-1;Ie<nt;Ie++,nt--){let vt=s[Ie];s[Ie]=s[nt],s[nt]=vt}}let o=17,c=me.sum(new Int32Array(s))/o,h=(t.getStartEnd()[1]-t.getStartEnd()[0])/15;if(Math.abs(c-h)/h>.3)throw new D;let f=this.getOddCounts(),p=this.getEvenCounts(),w=this.getOddRoundingErrors(),b=this.getEvenRoundingErrors();for(let Ie=0;Ie<s.length;Ie++){let nt=1*s[Ie]/c,vt=nt+.5;if(vt<1){if(nt<.3)throw new D;vt=1}else if(vt>8){if(nt>8.7)throw new D;vt=8}let Ki=Ie/2;Ie&1?(p[Ki]=vt,b[Ki]=nt-vt):(f[Ki]=vt,w[Ki]=nt-vt)}this.adjustOddEvenCounts(o);let y=4*t.getValue()+(i?0:2)+(r?0:1)-1,E=0,S=0;for(let Ie=f.length-1;Ie>=0;Ie--){if(M.isNotA1left(t,i,r)){let nt=M.WEIGHTS[y][2*Ie];S+=f[Ie]*nt}E+=f[Ie]}let T=0;for(let Ie=p.length-1;Ie>=0;Ie--)if(M.isNotA1left(t,i,r)){let nt=M.WEIGHTS[y][2*Ie+1];T+=p[Ie]*nt}let R=S+T;if(E&1||E>13||E<4)throw new D;let F=(13-E)/2,U=M.SYMBOL_WIDEST[F],B=9-U,ue=Lt.getRSSvalue(f,U,!0),re=Lt.getRSSvalue(p,B,!1),xt=M.EVEN_TOTAL_SUBSET[F],Ot=M.GSUM[F],wt=ue*xt+re+Ot;return new Vi(wt,R)}static isNotA1left(e,t,i){return!(e.getValue()==0&&t&&i)}adjustOddEvenCounts(e){let t=me.sum(new Int32Array(this.getOddCounts())),i=me.sum(new Int32Array(this.getEvenCounts())),r=!1,s=!1;t>13?s=!0:t<4&&(r=!0);let o=!1,c=!1;i>13?c=!0:i<4&&(o=!0);let h=t+i-e,f=(t&1)==1,p=(i&1)==0;if(h==1)if(f){if(p)throw new D;s=!0}else{if(!p)throw new D;c=!0}else if(h==-1)if(f){if(p)throw new D;r=!0}else{if(!p)throw new D;o=!0}else if(h==0){if(f){if(!p)throw new D;t<i?(r=!0,c=!0):(s=!0,o=!0)}else if(p)throw new D}else throw new D;if(r){if(s)throw new D;M.increment(this.getOddCounts(),this.getOddRoundingErrors())}if(s&&M.decrement(this.getOddCounts(),this.getOddRoundingErrors()),o){if(c)throw new D;M.increment(this.getEvenCounts(),this.getOddRoundingErrors())}c&&M.decrement(this.getEvenCounts(),this.getEvenRoundingErrors())}}M.SYMBOL_WIDEST=[7,5,4,3,1],M.EVEN_TOTAL_SUBSET=[4,20,52,104,204],M.GSUM=[0,348,1388,2948,3988],M.FINDER_PATTERNS=[Int32Array.from([1,8,4,1]),Int32Array.from([3,6,4,1]),Int32Array.from([3,4,6,1]),Int32Array.from([3,2,8,1]),Int32Array.from([2,6,5,1]),Int32Array.from([2,2,9,1])],M.WEIGHTS=[[1,3,9,27,81,32,96,77],[20,60,180,118,143,7,21,63],[189,145,13,39,117,140,209,205],[193,157,49,147,19,57,171,91],[62,186,136,197,169,85,44,132],[185,133,188,142,4,12,36,108],[113,128,173,97,80,29,87,50],[150,28,84,41,123,158,52,156],[46,138,203,187,139,206,196,166],[76,17,51,153,37,111,122,155],[43,129,176,106,107,110,119,146],[16,48,144,10,30,90,59,177],[109,116,137,200,178,112,125,164],[70,210,208,202,184,130,179,115],[134,191,151,31,93,68,204,190],[148,22,66,198,172,94,71,2],[6,18,54,162,64,192,154,40],[120,149,25,75,14,42,126,167],[79,26,78,23,69,207,199,175],[103,98,83,38,114,131,182,124],[161,61,183,127,170,88,53,159],[55,165,73,8,24,72,5,15],[45,135,194,160,58,174,100,89]],M.FINDER_PAT_A=0,M.FINDER_PAT_B=1,M.FINDER_PAT_C=2,M.FINDER_PAT_D=3,M.FINDER_PAT_E=4,M.FINDER_PAT_F=5,M.FINDER_PATTERN_SEQUENCES=[[M.FINDER_PAT_A,M.FINDER_PAT_A],[M.FINDER_PAT_A,M.FINDER_PAT_B,M.FINDER_PAT_B],[M.FINDER_PAT_A,M.FINDER_PAT_C,M.FINDER_PAT_B,M.FINDER_PAT_D],[M.FINDER_PAT_A,M.FINDER_PAT_E,M.FINDER_PAT_B,M.FINDER_PAT_D,M.FINDER_PAT_C],[M.FINDER_PAT_A,M.FINDER_PAT_E,M.FINDER_PAT_B,M.FINDER_PAT_D,M.FINDER_PAT_D,M.FINDER_PAT_F],[M.FINDER_PAT_A,M.FINDER_PAT_E,M.FINDER_PAT_B,M.FINDER_PAT_D,M.FINDER_PAT_E,M.FINDER_PAT_F,M.FINDER_PAT_F],[M.FINDER_PAT_A,M.FINDER_PAT_A,M.FINDER_PAT_B,M.FINDER_PAT_B,M.FINDER_PAT_C,M.FINDER_PAT_C,M.FINDER_PAT_D,M.FINDER_PAT_D],[M.FINDER_PAT_A,M.FINDER_PAT_A,M.FINDER_PAT_B,M.FINDER_PAT_B,M.FINDER_PAT_C,M.FINDER_PAT_C,M.FINDER_PAT_D,M.FINDER_PAT_E,M.FINDER_PAT_E],[M.FINDER_PAT_A,M.FINDER_PAT_A,M.FINDER_PAT_B,M.FINDER_PAT_B,M.FINDER_PAT_C,M.FINDER_PAT_C,M.FINDER_PAT_D,M.FINDER_PAT_E,M.FINDER_PAT_F,M.FINDER_PAT_F],[M.FINDER_PAT_A,M.FINDER_PAT_A,M.FINDER_PAT_B,M.FINDER_PAT_B,M.FINDER_PAT_C,M.FINDER_PAT_D,M.FINDER_PAT_D,M.FINDER_PAT_E,M.FINDER_PAT_E,M.FINDER_PAT_F,M.FINDER_PAT_F]],M.MAX_PAIRS=11;class Xo extends Vi{constructor(e,t,i){super(e,t),this.count=0,this.finderPattern=i}getFinderPattern(){return this.finderPattern}getCount(){return this.count}incrementCount(){this.count++}}class Ue extends st{constructor(){super(...arguments),this.possibleLeftPairs=[],this.possibleRightPairs=[]}decodeRow(e,t,i){const r=this.decodePair(t,!1,e,i);Ue.addOrTally(this.possibleLeftPairs,r),t.reverse();let s=this.decodePair(t,!0,e,i);Ue.addOrTally(this.possibleRightPairs,s),t.reverse();for(let o of this.possibleLeftPairs)if(o.getCount()>1){for(let c of this.possibleRightPairs)if(c.getCount()>1&&Ue.checkChecksum(o,c))return Ue.constructResult(o,c)}throw new D}static addOrTally(e,t){if(t==null)return;let i=!1;for(let r of e)if(r.getValue()===t.getValue()){r.incrementCount(),i=!0;break}i||e.push(t)}reset(){this.possibleLeftPairs.length=0,this.possibleRightPairs.length=0}static constructResult(e,t){let i=4537077*e.getValue()+t.getValue(),r=new String(i).toString(),s=new se;for(let f=13-r.length;f>0;f--)s.append("0");s.append(r);let o=0;for(let f=0;f<13;f++){let p=s.charAt(f).charCodeAt(0)-48;o+=f&1?p:3*p}o=10-o%10,o===10&&(o=0),s.append(o.toString());let c=e.getFinderPattern().getResultPoints(),h=t.getFinderPattern().getResultPoints();return new ct(s.toString(),null,0,[c[0],c[1],h[0],h[1]],Q.RSS_14,new Date().getTime())}static checkChecksum(e,t){let i=(e.getChecksumPortion()+16*t.getChecksumPortion())%79,r=9*e.getFinderPattern().getValue()+t.getFinderPattern().getValue();return r>72&&r--,r>8&&r--,i===r}decodePair(e,t,i,r){try{let s=this.findFinderPattern(e,t),o=this.parseFoundFinderPattern(e,i,t,s),c=r==null?null:r.get(we.NEED_RESULT_POINT_CALLBACK);if(c!=null){let p=(s[0]+s[1])/2;t&&(p=e.getSize()-1-p),c.foundPossibleResultPoint(new j(p,i))}let h=this.decodeDataCharacter(e,o,!0),f=this.decodeDataCharacter(e,o,!1);return new Xo(1597*h.getValue()+f.getValue(),h.getChecksumPortion()+4*f.getChecksumPortion(),o)}catch{return null}}decodeDataCharacter(e,t,i){let r=this.getDataCharacterCounters();for(let T=0;T<r.length;T++)r[T]=0;if(i)Ge.recordPatternInReverse(e,t.getStartEnd()[0],r);else{Ge.recordPattern(e,t.getStartEnd()[1]+1,r);for(let T=0,R=r.length-1;T<R;T++,R--){let F=r[T];r[T]=r[R],r[R]=F}}let s=i?16:15,o=me.sum(new Int32Array(r))/s,c=this.getOddCounts(),h=this.getEvenCounts(),f=this.getOddRoundingErrors(),p=this.getEvenRoundingErrors();for(let T=0;T<r.length;T++){let R=r[T]/o,F=Math.floor(R+.5);F<1?F=1:F>8&&(F=8);let U=Math.floor(T/2);T&1?(h[U]=F,p[U]=R-F):(c[U]=F,f[U]=R-F)}this.adjustOddEvenCounts(i,s);let w=0,b=0;for(let T=c.length-1;T>=0;T--)b*=9,b+=c[T],w+=c[T];let y=0,E=0;for(let T=h.length-1;T>=0;T--)y*=9,y+=h[T],E+=h[T];let S=b+3*y;if(i){if(w&1||w>12||w<4)throw new D;let T=(12-w)/2,R=Ue.OUTSIDE_ODD_WIDEST[T],F=9-R,U=Lt.getRSSvalue(c,R,!1),B=Lt.getRSSvalue(h,F,!0),ue=Ue.OUTSIDE_EVEN_TOTAL_SUBSET[T],re=Ue.OUTSIDE_GSUM[T];return new Vi(U*ue+B+re,S)}else{if(E&1||E>10||E<4)throw new D;let T=(10-E)/2,R=Ue.INSIDE_ODD_WIDEST[T],F=9-R,U=Lt.getRSSvalue(c,R,!0),B=Lt.getRSSvalue(h,F,!1),ue=Ue.INSIDE_ODD_TOTAL_SUBSET[T],re=Ue.INSIDE_GSUM[T];return new Vi(B*ue+U+re,S)}}findFinderPattern(e,t){let i=this.getDecodeFinderCounters();i[0]=0,i[1]=0,i[2]=0,i[3]=0;let r=e.getSize(),s=!1,o=0;for(;o<r&&(s=!e.get(o),t!==s);)o++;let c=0,h=o;for(let f=o;f<r;f++)if(e.get(f)!==s)i[c]++;else{if(c===3){if(st.isFinderPattern(i))return[h,f];h+=i[0]+i[1],i[0]=i[2],i[1]=i[3],i[2]=0,i[3]=0,c--}else c++;i[c]=1,s=!s}throw new D}parseFoundFinderPattern(e,t,i,r){let s=e.get(r[0]),o=r[0]-1;for(;o>=0&&s!==e.get(o);)o--;o++;const c=r[0]-o,h=this.getDecodeFinderCounters(),f=new Int32Array(h.length);te.arraycopy(h,0,f,1,h.length-1),f[0]=c;const p=this.parseFinderValue(f,Ue.FINDER_PATTERNS);let w=o,b=r[1];return i&&(w=e.getSize()-1-w,b=e.getSize()-1-b),new Gr(p,[o,r[1]],w,b,t)}adjustOddEvenCounts(e,t){let i=me.sum(new Int32Array(this.getOddCounts())),r=me.sum(new Int32Array(this.getEvenCounts())),s=!1,o=!1,c=!1,h=!1;e?(i>12?o=!0:i<4&&(s=!0),r>12?h=!0:r<4&&(c=!0)):(i>11?o=!0:i<5&&(s=!0),r>10?h=!0:r<4&&(c=!0));let f=i+r-t,p=(i&1)===(e?1:0),w=(r&1)===1;if(f===1)if(p){if(w)throw new D;o=!0}else{if(!w)throw new D;h=!0}else if(f===-1)if(p){if(w)throw new D;s=!0}else{if(!w)throw new D;c=!0}else if(f===0){if(p){if(!w)throw new D;i<r?(s=!0,h=!0):(o=!0,c=!0)}else if(w)throw new D}else throw new D;if(s){if(o)throw new D;st.increment(this.getOddCounts(),this.getOddRoundingErrors())}if(o&&st.decrement(this.getOddCounts(),this.getOddRoundingErrors()),c){if(h)throw new D;st.increment(this.getEvenCounts(),this.getOddRoundingErrors())}h&&st.decrement(this.getEvenCounts(),this.getEvenRoundingErrors())}}Ue.OUTSIDE_EVEN_TOTAL_SUBSET=[1,10,34,70,126],Ue.INSIDE_ODD_TOTAL_SUBSET=[4,20,48,81],Ue.OUTSIDE_GSUM=[0,161,961,2015,2715],Ue.INSIDE_GSUM=[0,336,1036,1516],Ue.OUTSIDE_ODD_WIDEST=[8,6,4,3,1],Ue.INSIDE_ODD_WIDEST=[2,4,6,8],Ue.FINDER_PATTERNS=[Int32Array.from([3,8,2,1]),Int32Array.from([3,5,5,1]),Int32Array.from([3,3,7,1]),Int32Array.from([3,1,9,1]),Int32Array.from([2,7,4,1]),Int32Array.from([2,5,6,1]),Int32Array.from([2,3,8,1]),Int32Array.from([1,5,7,1]),Int32Array.from([1,3,9,1])];class Gi extends Ge{constructor(e,t){super(),this.readers=[],this.verbose=t===!0;const i=e?e.get(we.POSSIBLE_FORMATS):null,r=e&&e.get(we.ASSUME_CODE_39_CHECK_DIGIT)!==void 0;i?((i.includes(Q.EAN_13)||i.includes(Q.UPC_A)||i.includes(Q.EAN_8)||i.includes(Q.UPC_E))&&this.readers.push(new En(e)),i.includes(Q.CODE_39)&&this.readers.push(new We(r)),i.includes(Q.CODE_128)&&this.readers.push(new V),i.includes(Q.ITF)&&this.readers.push(new Ee),i.includes(Q.RSS_14)&&this.readers.push(new Ue),i.includes(Q.RSS_EXPANDED)&&this.readers.push(new M(this.verbose))):(this.readers.push(new En(e)),this.readers.push(new We),this.readers.push(new En(e)),this.readers.push(new V),this.readers.push(new Ee),this.readers.push(new Ue),this.readers.push(new M(this.verbose)))}decodeRow(e,t,i){for(let r=0;r<this.readers.length;r++)try{return this.readers[r].decodeRow(e,t,i)}catch{}throw new D}reset(){this.readers.forEach(e=>e.reset())}}class jo extends _i{constructor(e=500,t){super(new Gi(t),e,t)}}class ye{constructor(e,t,i){this.ecCodewords=e,this.ecBlocks=[t],i&&this.ecBlocks.push(i)}getECCodewords(){return this.ecCodewords}getECBlocks(){return this.ecBlocks}}class ve{constructor(e,t){this.count=e,this.dataCodewords=t}getCount(){return this.count}getDataCodewords(){return this.dataCodewords}}class fe{constructor(e,t,i,r,s,o){this.versionNumber=e,this.symbolSizeRows=t,this.symbolSizeColumns=i,this.dataRegionSizeRows=r,this.dataRegionSizeColumns=s,this.ecBlocks=o;let c=0;const h=o.getECCodewords(),f=o.getECBlocks();for(let p of f)c+=p.getCount()*(p.getDataCodewords()+h);this.totalCodewords=c}getVersionNumber(){return this.versionNumber}getSymbolSizeRows(){return this.symbolSizeRows}getSymbolSizeColumns(){return this.symbolSizeColumns}getDataRegionSizeRows(){return this.dataRegionSizeRows}getDataRegionSizeColumns(){return this.dataRegionSizeColumns}getTotalCodewords(){return this.totalCodewords}getECBlocks(){return this.ecBlocks}static getVersionForDimensions(e,t){if(e&1||t&1)throw new z;for(let i of fe.VERSIONS)if(i.symbolSizeRows===e&&i.symbolSizeColumns===t)return i;throw new z}toString(){return""+this.versionNumber}static buildVersions(){return[new fe(1,10,10,8,8,new ye(5,new ve(1,3))),new fe(2,12,12,10,10,new ye(7,new ve(1,5))),new fe(3,14,14,12,12,new ye(10,new ve(1,8))),new fe(4,16,16,14,14,new ye(12,new ve(1,12))),new fe(5,18,18,16,16,new ye(14,new ve(1,18))),new fe(6,20,20,18,18,new ye(18,new ve(1,22))),new fe(7,22,22,20,20,new ye(20,new ve(1,30))),new fe(8,24,24,22,22,new ye(24,new ve(1,36))),new fe(9,26,26,24,24,new ye(28,new ve(1,44))),new fe(10,32,32,14,14,new ye(36,new ve(1,62))),new fe(11,36,36,16,16,new ye(42,new ve(1,86))),new fe(12,40,40,18,18,new ye(48,new ve(1,114))),new fe(13,44,44,20,20,new ye(56,new ve(1,144))),new fe(14,48,48,22,22,new ye(68,new ve(1,174))),new fe(15,52,52,24,24,new ye(42,new ve(2,102))),new fe(16,64,64,14,14,new ye(56,new ve(2,140))),new fe(17,72,72,16,16,new ye(36,new ve(4,92))),new fe(18,80,80,18,18,new ye(48,new ve(4,114))),new fe(19,88,88,20,20,new ye(56,new ve(4,144))),new fe(20,96,96,22,22,new ye(68,new ve(4,174))),new fe(21,104,104,24,24,new ye(56,new ve(6,136))),new fe(22,120,120,18,18,new ye(68,new ve(6,175))),new fe(23,132,132,20,20,new ye(62,new ve(8,163))),new fe(24,144,144,22,22,new ye(62,new ve(8,156),new ve(2,155))),new fe(25,8,18,6,16,new ye(7,new ve(1,5))),new fe(26,8,32,6,14,new ye(11,new ve(1,10))),new fe(27,12,26,10,24,new ye(14,new ve(1,16))),new fe(28,12,36,10,16,new ye(18,new ve(1,22))),new fe(29,16,36,14,16,new ye(24,new ve(1,32))),new fe(30,16,48,14,22,new ye(28,new ve(1,49)))]}}fe.VERSIONS=fe.buildVersions();class Nn{constructor(e){const t=e.getHeight();if(t<8||t>144||t&1)throw new z;this.version=Nn.readVersion(e),this.mappingBitMatrix=this.extractDataRegion(e),this.readMappingMatrix=new Me(this.mappingBitMatrix.getWidth(),this.mappingBitMatrix.getHeight())}getVersion(){return this.version}static readVersion(e){const t=e.getHeight(),i=e.getWidth();return fe.getVersionForDimensions(t,i)}readCodewords(){const e=new Int8Array(this.version.getTotalCodewords());let t=0,i=4,r=0;const s=this.mappingBitMatrix.getHeight(),o=this.mappingBitMatrix.getWidth();let c=!1,h=!1,f=!1,p=!1;do if(i===s&&r===0&&!c)e[t++]=this.readCorner1(s,o)&255,i-=2,r+=2,c=!0;else if(i===s-2&&r===0&&o&3&&!h)e[t++]=this.readCorner2(s,o)&255,i-=2,r+=2,h=!0;else if(i===s+4&&r===2&&!(o&7)&&!f)e[t++]=this.readCorner3(s,o)&255,i-=2,r+=2,f=!0;else if(i===s-2&&r===0&&(o&7)===4&&!p)e[t++]=this.readCorner4(s,o)&255,i-=2,r+=2,p=!0;else{do i<s&&r>=0&&!this.readMappingMatrix.get(r,i)&&(e[t++]=this.readUtah(i,r,s,o)&255),i-=2,r+=2;while(i>=0&&r<o);i+=1,r+=3;do i>=0&&r<o&&!this.readMappingMatrix.get(r,i)&&(e[t++]=this.readUtah(i,r,s,o)&255),i+=2,r-=2;while(i<s&&r>=0);i+=3,r+=1}while(i<s||r<o);if(t!==this.version.getTotalCodewords())throw new z;return e}readModule(e,t,i,r){return e<0&&(e+=i,t+=4-(i+4&7)),t<0&&(t+=r,e+=4-(r+4&7)),this.readMappingMatrix.set(t,e),this.mappingBitMatrix.get(t,e)}readUtah(e,t,i,r){let s=0;return this.readModule(e-2,t-2,i,r)&&(s|=1),s<<=1,this.readModule(e-2,t-1,i,r)&&(s|=1),s<<=1,this.readModule(e-1,t-2,i,r)&&(s|=1),s<<=1,this.readModule(e-1,t-1,i,r)&&(s|=1),s<<=1,this.readModule(e-1,t,i,r)&&(s|=1),s<<=1,this.readModule(e,t-2,i,r)&&(s|=1),s<<=1,this.readModule(e,t-1,i,r)&&(s|=1),s<<=1,this.readModule(e,t,i,r)&&(s|=1),s}readCorner1(e,t){let i=0;return this.readModule(e-1,0,e,t)&&(i|=1),i<<=1,this.readModule(e-1,1,e,t)&&(i|=1),i<<=1,this.readModule(e-1,2,e,t)&&(i|=1),i<<=1,this.readModule(0,t-2,e,t)&&(i|=1),i<<=1,this.readModule(0,t-1,e,t)&&(i|=1),i<<=1,this.readModule(1,t-1,e,t)&&(i|=1),i<<=1,this.readModule(2,t-1,e,t)&&(i|=1),i<<=1,this.readModule(3,t-1,e,t)&&(i|=1),i}readCorner2(e,t){let i=0;return this.readModule(e-3,0,e,t)&&(i|=1),i<<=1,this.readModule(e-2,0,e,t)&&(i|=1),i<<=1,this.readModule(e-1,0,e,t)&&(i|=1),i<<=1,this.readModule(0,t-4,e,t)&&(i|=1),i<<=1,this.readModule(0,t-3,e,t)&&(i|=1),i<<=1,this.readModule(0,t-2,e,t)&&(i|=1),i<<=1,this.readModule(0,t-1,e,t)&&(i|=1),i<<=1,this.readModule(1,t-1,e,t)&&(i|=1),i}readCorner3(e,t){let i=0;return this.readModule(e-1,0,e,t)&&(i|=1),i<<=1,this.readModule(e-1,t-1,e,t)&&(i|=1),i<<=1,this.readModule(0,t-3,e,t)&&(i|=1),i<<=1,this.readModule(0,t-2,e,t)&&(i|=1),i<<=1,this.readModule(0,t-1,e,t)&&(i|=1),i<<=1,this.readModule(1,t-3,e,t)&&(i|=1),i<<=1,this.readModule(1,t-2,e,t)&&(i|=1),i<<=1,this.readModule(1,t-1,e,t)&&(i|=1),i}readCorner4(e,t){let i=0;return this.readModule(e-3,0,e,t)&&(i|=1),i<<=1,this.readModule(e-2,0,e,t)&&(i|=1),i<<=1,this.readModule(e-1,0,e,t)&&(i|=1),i<<=1,this.readModule(0,t-2,e,t)&&(i|=1),i<<=1,this.readModule(0,t-1,e,t)&&(i|=1),i<<=1,this.readModule(1,t-1,e,t)&&(i|=1),i<<=1,this.readModule(2,t-1,e,t)&&(i|=1),i<<=1,this.readModule(3,t-1,e,t)&&(i|=1),i}extractDataRegion(e){const t=this.version.getSymbolSizeRows(),i=this.version.getSymbolSizeColumns();if(e.getHeight()!==t)throw new I("Dimension of bitMatrix must match the version size");const r=this.version.getDataRegionSizeRows(),s=this.version.getDataRegionSizeColumns(),o=t/r|0,c=i/s|0,h=o*r,f=c*s,p=new Me(f,h);for(let w=0;w<o;++w){const b=w*r;for(let y=0;y<c;++y){const E=y*s;for(let S=0;S<r;++S){const T=w*(r+2)+1+S,R=b+S;for(let F=0;F<s;++F){const U=y*(s+2)+1+F;if(e.get(U,T)){const B=E+F;p.set(B,R)}}}}}return p}}class On{constructor(e,t){this.numDataCodewords=e,this.codewords=t}static getDataBlocks(e,t){const i=t.getECBlocks();let r=0;const s=i.getECBlocks();for(let S of s)r+=S.getCount();const o=new Array(r);let c=0;for(let S of s)for(let T=0;T<S.getCount();T++){const R=S.getDataCodewords(),F=i.getECCodewords()+R;o[c++]=new On(R,new Uint8Array(F))}const f=o[0].codewords.length-i.getECCodewords(),p=f-1;let w=0;for(let S=0;S<p;S++)for(let T=0;T<c;T++)o[T].codewords[S]=e[w++];const b=t.getVersionNumber()===24,y=b?8:c;for(let S=0;S<y;S++)o[S].codewords[f-1]=e[w++];const E=o[0].codewords.length;for(let S=f;S<E;S++)for(let T=0;T<c;T++){const R=b?(T+8)%c:T,F=b&&R>7?S-1:S;o[R].codewords[F]=e[w++]}if(w!==e.length)throw new I;return o}getNumDataCodewords(){return this.numDataCodewords}getCodewords(){return this.codewords}}class Rn{constructor(e){this.bytes=e,this.byteOffset=0,this.bitOffset=0}getBitOffset(){return this.bitOffset}getByteOffset(){return this.byteOffset}readBits(e){if(e<1||e>32||e>this.available())throw new I(""+e);let t=0,i=this.bitOffset,r=this.byteOffset;const s=this.bytes;if(i>0){const o=8-i,c=e<o?e:o,h=o-c,f=255>>8-c<<h;t=(s[r]&f)>>h,e-=c,i+=c,i===8&&(i=0,r++)}if(e>0){for(;e>=8;)t=t<<8|s[r]&255,r++,e-=8;if(e>0){const o=8-e,c=255>>o<<o;t=t<<e|(s[r]&c)>>o,i+=e}}return this.bitOffset=i,this.byteOffset=r,t}available(){return 8*(this.bytes.length-this.byteOffset)-this.bitOffset}}var Xe;(function(x){x[x.PAD_ENCODE=0]="PAD_ENCODE",x[x.ASCII_ENCODE=1]="ASCII_ENCODE",x[x.C40_ENCODE=2]="C40_ENCODE",x[x.TEXT_ENCODE=3]="TEXT_ENCODE",x[x.ANSIX12_ENCODE=4]="ANSIX12_ENCODE",x[x.EDIFACT_ENCODE=5]="EDIFACT_ENCODE",x[x.BASE256_ENCODE=6]="BASE256_ENCODE"})(Xe||(Xe={}));class ai{static decode(e){const t=new Rn(e),i=new se,r=new se,s=new Array;let o=Xe.ASCII_ENCODE;do if(o===Xe.ASCII_ENCODE)o=this.decodeAsciiSegment(t,i,r);else{switch(o){case Xe.C40_ENCODE:this.decodeC40Segment(t,i);break;case Xe.TEXT_ENCODE:this.decodeTextSegment(t,i);break;case Xe.ANSIX12_ENCODE:this.decodeAnsiX12Segment(t,i);break;case Xe.EDIFACT_ENCODE:this.decodeEdifactSegment(t,i);break;case Xe.BASE256_ENCODE:this.decodeBase256Segment(t,i,s);break;default:throw new z}o=Xe.ASCII_ENCODE}while(o!==Xe.PAD_ENCODE&&t.available()>0);return r.length()>0&&i.append(r.toString()),new hr(e,i.toString(),s.length===0?null:s,null)}static decodeAsciiSegment(e,t,i){let r=!1;do{let s=e.readBits(8);if(s===0)throw new z;if(s<=128)return r&&(s+=128),t.append(String.fromCharCode(s-1)),Xe.ASCII_ENCODE;if(s===129)return Xe.PAD_ENCODE;if(s<=229){const o=s-130;o<10&&t.append("0"),t.append(""+o)}else switch(s){case 230:return Xe.C40_ENCODE;case 231:return Xe.BASE256_ENCODE;case 232:t.append("");break;case 233:case 234:break;case 235:r=!0;break;case 236:t.append("[)>05"),i.insert(0,"");break;case 237:t.append("[)>06"),i.insert(0,"");break;case 238:return Xe.ANSIX12_ENCODE;case 239:return Xe.TEXT_ENCODE;case 240:return Xe.EDIFACT_ENCODE;case 241:break;default:if(s!==254||e.available()!==0)throw new z;break}}while(e.available()>0);return Xe.ASCII_ENCODE}static decodeC40Segment(e,t){let i=!1;const r=[];let s=0;do{if(e.available()===8)return;const o=e.readBits(8);if(o===254)return;this.parseTwoBytes(o,e.readBits(8),r);for(let c=0;c<3;c++){const h=r[c];switch(s){case 0:if(h<3)s=h+1;else if(h<this.C40_BASIC_SET_CHARS.length){const f=this.C40_BASIC_SET_CHARS[h];i?(t.append(String.fromCharCode(f.charCodeAt(0)+128)),i=!1):t.append(f)}else throw new z;break;case 1:i?(t.append(String.fromCharCode(h+128)),i=!1):t.append(String.fromCharCode(h)),s=0;break;case 2:if(h<this.C40_SHIFT2_SET_CHARS.length){const f=this.C40_SHIFT2_SET_CHARS[h];i?(t.append(String.fromCharCode(f.charCodeAt(0)+128)),i=!1):t.append(f)}else switch(h){case 27:t.append("");break;case 30:i=!0;break;default:throw new z}s=0;break;case 3:i?(t.append(String.fromCharCode(h+224)),i=!1):t.append(String.fromCharCode(h+96)),s=0;break;default:throw new z}}}while(e.available()>0)}static decodeTextSegment(e,t){let i=!1,r=[],s=0;do{if(e.available()===8)return;const o=e.readBits(8);if(o===254)return;this.parseTwoBytes(o,e.readBits(8),r);for(let c=0;c<3;c++){const h=r[c];switch(s){case 0:if(h<3)s=h+1;else if(h<this.TEXT_BASIC_SET_CHARS.length){const f=this.TEXT_BASIC_SET_CHARS[h];i?(t.append(String.fromCharCode(f.charCodeAt(0)+128)),i=!1):t.append(f)}else throw new z;break;case 1:i?(t.append(String.fromCharCode(h+128)),i=!1):t.append(String.fromCharCode(h)),s=0;break;case 2:if(h<this.TEXT_SHIFT2_SET_CHARS.length){const f=this.TEXT_SHIFT2_SET_CHARS[h];i?(t.append(String.fromCharCode(f.charCodeAt(0)+128)),i=!1):t.append(f)}else switch(h){case 27:t.append("");break;case 30:i=!0;break;default:throw new z}s=0;break;case 3:if(h<this.TEXT_SHIFT3_SET_CHARS.length){const f=this.TEXT_SHIFT3_SET_CHARS[h];i?(t.append(String.fromCharCode(f.charCodeAt(0)+128)),i=!1):t.append(f),s=0}else throw new z;break;default:throw new z}}}while(e.available()>0)}static decodeAnsiX12Segment(e,t){const i=[];do{if(e.available()===8)return;const r=e.readBits(8);if(r===254)return;this.parseTwoBytes(r,e.readBits(8),i);for(let s=0;s<3;s++){const o=i[s];switch(o){case 0:t.append("\r");break;case 1:t.append("*");break;case 2:t.append(">");break;case 3:t.append(" ");break;default:if(o<14)t.append(String.fromCharCode(o+44));else if(o<40)t.append(String.fromCharCode(o+51));else throw new z;break}}}while(e.available()>0)}static parseTwoBytes(e,t,i){let r=(e<<8)+t-1,s=Math.floor(r/1600);i[0]=s,r-=s*1600,s=Math.floor(r/40),i[1]=s,i[2]=r-s*40}static decodeEdifactSegment(e,t){do{if(e.available()<=16)return;for(let i=0;i<4;i++){let r=e.readBits(6);if(r===31){const s=8-e.getBitOffset();s!==8&&e.readBits(s);return}r&32||(r|=64),t.append(String.fromCharCode(r))}}while(e.available()>0)}static decodeBase256Segment(e,t,i){let r=1+e.getByteOffset();const s=this.unrandomize255State(e.readBits(8),r++);let o;if(s===0?o=e.available()/8|0:s<250?o=s:o=250*(s-249)+this.unrandomize255State(e.readBits(8),r++),o<0)throw new z;const c=new Uint8Array(o);for(let h=0;h<o;h++){if(e.available()<8)throw new z;c[h]=this.unrandomize255State(e.readBits(8),r++)}i.push(c);try{t.append(De.decode(c,Z.ISO88591))}catch(h){throw new Bt("Platform does not support required encoding: "+h.message)}}static unrandomize255State(e,t){const i=149*t%255+1,r=e-i;return r>=0?r:r+256}}ai.C40_BASIC_SET_CHARS=["*","*","*"," ","0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],ai.C40_SHIFT2_SET_CHARS=["!",'"',"#","$","%","&","'","(",")","*","+",",","-",".","/",":",";","<","=",">","?","@","[","\\","]","^","_"],ai.TEXT_BASIC_SET_CHARS=["*","*","*"," ","0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"],ai.TEXT_SHIFT2_SET_CHARS=ai.C40_SHIFT2_SET_CHARS,ai.TEXT_SHIFT3_SET_CHARS=["`","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","{","|","}","~",""];class Ko{constructor(){this.rsDecoder=new fr(be.DATA_MATRIX_FIELD_256)}decode(e){const t=new Nn(e),i=t.getVersion(),r=t.readCodewords(),s=On.getDataBlocks(r,i);let o=0;for(let f of s)o+=f.getNumDataCodewords();const c=new Uint8Array(o),h=s.length;for(let f=0;f<h;f++){const p=s[f],w=p.getCodewords(),b=p.getNumDataCodewords();this.correctErrors(w,b);for(let y=0;y<b;y++)c[y*h+f]=w[y]}return ai.decode(c)}correctErrors(e,t){const i=new Int32Array(e);try{this.rsDecoder.decode(i,e.length-t)}catch{throw new X}for(let r=0;r<t;r++)e[r]=i[r]}}class $e{constructor(e){this.image=e,this.rectangleDetector=new Wt(this.image)}detect(){const e=this.rectangleDetector.detect();let t=this.detectSolid1(e);if(t=this.detectSolid2(t),t[3]=this.correctTopRight(t),!t[3])throw new D;t=this.shiftToModuleCenter(t);const i=t[0],r=t[1],s=t[2],o=t[3];let c=this.transitionsBetween(i,o)+1,h=this.transitionsBetween(s,o)+1;(c&1)===1&&(c+=1),(h&1)===1&&(h+=1),4*c<7*h&&4*h<7*c&&(c=h=Math.max(c,h));let f=$e.sampleGrid(this.image,i,r,s,o,c,h);return new $r(f,[i,r,s,o])}static shiftPoint(e,t,i){let r=(t.getX()-e.getX())/(i+1),s=(t.getY()-e.getY())/(i+1);return new j(e.getX()+r,e.getY()+s)}static moveAway(e,t,i){let r=e.getX(),s=e.getY();return r<t?r-=1:r+=1,s<i?s-=1:s+=1,new j(r,s)}detectSolid1(e){let t=e[0],i=e[1],r=e[3],s=e[2],o=this.transitionsBetween(t,i),c=this.transitionsBetween(i,r),h=this.transitionsBetween(r,s),f=this.transitionsBetween(s,t),p=o,w=[s,t,i,r];return p>c&&(p=c,w[0]=t,w[1]=i,w[2]=r,w[3]=s),p>h&&(p=h,w[0]=i,w[1]=r,w[2]=s,w[3]=t),p>f&&(w[0]=r,w[1]=s,w[2]=t,w[3]=i),w}detectSolid2(e){let t=e[0],i=e[1],r=e[2],s=e[3],o=this.transitionsBetween(t,s),c=$e.shiftPoint(i,r,(o+1)*4),h=$e.shiftPoint(r,i,(o+1)*4),f=this.transitionsBetween(c,t),p=this.transitionsBetween(h,s);return f<p?(e[0]=t,e[1]=i,e[2]=r,e[3]=s):(e[0]=i,e[1]=r,e[2]=s,e[3]=t),e}correctTopRight(e){let t=e[0],i=e[1],r=e[2],s=e[3],o=this.transitionsBetween(t,s),c=this.transitionsBetween(i,s),h=$e.shiftPoint(t,i,(c+1)*4),f=$e.shiftPoint(r,i,(o+1)*4);o=this.transitionsBetween(h,s),c=this.transitionsBetween(f,s);let p=new j(s.getX()+(r.getX()-i.getX())/(o+1),s.getY()+(r.getY()-i.getY())/(o+1)),w=new j(s.getX()+(t.getX()-i.getX())/(c+1),s.getY()+(t.getY()-i.getY())/(c+1));if(!this.isValid(p))return this.isValid(w)?w:null;if(!this.isValid(w))return p;let b=this.transitionsBetween(h,p)+this.transitionsBetween(f,p),y=this.transitionsBetween(h,w)+this.transitionsBetween(f,w);return b>y?p:w}shiftToModuleCenter(e){let t=e[0],i=e[1],r=e[2],s=e[3],o=this.transitionsBetween(t,s)+1,c=this.transitionsBetween(r,s)+1,h=$e.shiftPoint(t,i,c*4),f=$e.shiftPoint(r,i,o*4);o=this.transitionsBetween(h,s)+1,c=this.transitionsBetween(f,s)+1,(o&1)===1&&(o+=1),(c&1)===1&&(c+=1);let p=(t.getX()+i.getX()+r.getX()+s.getX())/4,w=(t.getY()+i.getY()+r.getY()+s.getY())/4;t=$e.moveAway(t,p,w),i=$e.moveAway(i,p,w),r=$e.moveAway(r,p,w),s=$e.moveAway(s,p,w);let b,y;return h=$e.shiftPoint(t,i,c*4),h=$e.shiftPoint(h,s,o*4),b=$e.shiftPoint(i,t,c*4),b=$e.shiftPoint(b,r,o*4),f=$e.shiftPoint(r,s,c*4),f=$e.shiftPoint(f,i,o*4),y=$e.shiftPoint(s,r,c*4),y=$e.shiftPoint(y,t,o*4),[h,b,f,y]}isValid(e){return e.getX()>=0&&e.getX()<this.image.getWidth()&&e.getY()>0&&e.getY()<this.image.getHeight()}static sampleGrid(e,t,i,r,s,o,c){return ni.getInstance().sampleGrid(e,o,c,.5,.5,o-.5,.5,o-.5,c-.5,.5,c-.5,t.getX(),t.getY(),s.getX(),s.getY(),r.getX(),r.getY(),i.getX(),i.getY())}transitionsBetween(e,t){let i=Math.trunc(e.getX()),r=Math.trunc(e.getY()),s=Math.trunc(t.getX()),o=Math.trunc(t.getY()),c=Math.abs(o-r)>Math.abs(s-i);if(c){let S=i;i=r,r=S,S=s,s=o,o=S}let h=Math.abs(s-i),f=Math.abs(o-r),p=-h/2,w=r<o?1:-1,b=i<s?1:-1,y=0,E=this.image.get(c?r:i,c?i:r);for(let S=i,T=r;S!==s;S+=b){let R=this.image.get(c?T:S,c?S:T);if(R!==E&&(y++,E=R),p+=f,p>0){if(T===o)break;T+=w,p-=h}}return y}}class oi{constructor(){this.decoder=new Ko}decode(e,t=null){let i,r;if(t!=null&&t.has(we.PURE_BARCODE)){const f=oi.extractPureBits(e.getBlackMatrix());i=this.decoder.decode(f),r=oi.NO_POINTS}else{const f=new $e(e.getBlackMatrix()).detect();i=this.decoder.decode(f.getBits()),r=f.getPoints()}const s=i.getRawBytes(),o=new ct(i.getText(),s,8*s.length,r,Q.DATA_MATRIX,te.currentTimeMillis()),c=i.getByteSegments();c!=null&&o.putMetadata(Ye.BYTE_SEGMENTS,c);const h=i.getECLevel();return h!=null&&o.putMetadata(Ye.ERROR_CORRECTION_LEVEL,h),o}reset(){}static extractPureBits(e){const t=e.getTopLeftOnBit(),i=e.getBottomRightOnBit();if(t==null||i==null)throw new D;const r=this.moduleSize(t,e);let s=t[1];const o=i[1];let c=t[0];const f=(i[0]-c+1)/r,p=(o-s+1)/r;if(f<=0||p<=0)throw new D;const w=r/2;s+=w,c+=w;const b=new Me(f,p);for(let y=0;y<p;y++){const E=s+y*r;for(let S=0;S<f;S++)e.get(c+S*r,E)&&b.set(S,y)}return b}static moduleSize(e,t){const i=t.getWidth();let r=e[0];const s=e[1];for(;r<i&&t.get(r,s);)r++;if(r===i)throw new D;const o=r-e[0];if(o===0)throw new D;return o}}oi.NO_POINTS=[];class Yo extends _i{constructor(e=500){super(new oi,e)}}var Wi;(function(x){x[x.L=0]="L",x[x.M=1]="M",x[x.Q=2]="Q",x[x.H=3]="H"})(Wi||(Wi={}));class Ne{constructor(e,t,i){this.value=e,this.stringValue=t,this.bits=i,Ne.FOR_BITS.set(i,this),Ne.FOR_VALUE.set(e,this)}getValue(){return this.value}getBits(){return this.bits}static fromString(e){switch(e){case"L":return Ne.L;case"M":return Ne.M;case"Q":return Ne.Q;case"H":return Ne.H;default:throw new k(e+"not available")}}toString(){return this.stringValue}equals(e){if(!(e instanceof Ne))return!1;const t=e;return this.value===t.value}static forBits(e){if(e<0||e>=Ne.FOR_BITS.size)throw new I;return Ne.FOR_BITS.get(e)}}Ne.FOR_BITS=new Map,Ne.FOR_VALUE=new Map,Ne.L=new Ne(Wi.L,"L",1),Ne.M=new Ne(Wi.M,"M",0),Ne.Q=new Ne(Wi.Q,"Q",3),Ne.H=new Ne(Wi.H,"H",2);class at{constructor(e){this.errorCorrectionLevel=Ne.forBits(e>>3&3),this.dataMask=e&7}static numBitsDiffering(e,t){return K.bitCount(e^t)}static decodeFormatInformation(e,t){const i=at.doDecodeFormatInformation(e,t);return i!==null?i:at.doDecodeFormatInformation(e^at.FORMAT_INFO_MASK_QR,t^at.FORMAT_INFO_MASK_QR)}static doDecodeFormatInformation(e,t){let i=Number.MAX_SAFE_INTEGER,r=0;for(const s of at.FORMAT_INFO_DECODE_LOOKUP){const o=s[0];if(o===e||o===t)return new at(s[1]);let c=at.numBitsDiffering(e,o);c<i&&(r=s[1],i=c),e!==t&&(c=at.numBitsDiffering(t,o),c<i&&(r=s[1],i=c))}return i<=3?new at(r):null}getErrorCorrectionLevel(){return this.errorCorrectionLevel}getDataMask(){return this.dataMask}hashCode(){return this.errorCorrectionLevel.getBits()<<3|this.dataMask}equals(e){if(!(e instanceof at))return!1;const t=e;return this.errorCorrectionLevel===t.errorCorrectionLevel&&this.dataMask===t.dataMask}}at.FORMAT_INFO_MASK_QR=21522,at.FORMAT_INFO_DECODE_LOOKUP=[Int32Array.from([21522,0]),Int32Array.from([20773,1]),Int32Array.from([24188,2]),Int32Array.from([23371,3]),Int32Array.from([17913,4]),Int32Array.from([16590,5]),Int32Array.from([20375,6]),Int32Array.from([19104,7]),Int32Array.from([30660,8]),Int32Array.from([29427,9]),Int32Array.from([32170,10]),Int32Array.from([30877,11]),Int32Array.from([26159,12]),Int32Array.from([25368,13]),Int32Array.from([27713,14]),Int32Array.from([26998,15]),Int32Array.from([5769,16]),Int32Array.from([5054,17]),Int32Array.from([7399,18]),Int32Array.from([6608,19]),Int32Array.from([1890,20]),Int32Array.from([597,21]),Int32Array.from([3340,22]),Int32Array.from([2107,23]),Int32Array.from([13663,24]),Int32Array.from([12392,25]),Int32Array.from([16177,26]),Int32Array.from([14854,27]),Int32Array.from([9396,28]),Int32Array.from([8579,29]),Int32Array.from([11994,30]),Int32Array.from([11245,31])];class N{constructor(e,...t){this.ecCodewordsPerBlock=e,this.ecBlocks=t}getECCodewordsPerBlock(){return this.ecCodewordsPerBlock}getNumBlocks(){let e=0;const t=this.ecBlocks;for(const i of t)e+=i.getCount();return e}getTotalECCodewords(){return this.ecCodewordsPerBlock*this.getNumBlocks()}getECBlocks(){return this.ecBlocks}}class v{constructor(e,t){this.count=e,this.dataCodewords=t}getCount(){return this.count}getDataCodewords(){return this.dataCodewords}}class Y{constructor(e,t,...i){this.versionNumber=e,this.alignmentPatternCenters=t,this.ecBlocks=i;let r=0;const s=i[0].getECCodewordsPerBlock(),o=i[0].getECBlocks();for(const c of o)r+=c.getCount()*(c.getDataCodewords()+s);this.totalCodewords=r}getVersionNumber(){return this.versionNumber}getAlignmentPatternCenters(){return this.alignmentPatternCenters}getTotalCodewords(){return this.totalCodewords}getDimensionForVersion(){return 17+4*this.versionNumber}getECBlocksForLevel(e){return this.ecBlocks[e.getValue()]}static getProvisionalVersionForDimension(e){if(e%4!==1)throw new z;try{return this.getVersionForNumber((e-17)/4)}catch{throw new z}}static getVersionForNumber(e){if(e<1||e>40)throw new I;return Y.VERSIONS[e-1]}static decodeVersionInformation(e){let t=Number.MAX_SAFE_INTEGER,i=0;for(let r=0;r<Y.VERSION_DECODE_INFO.length;r++){const s=Y.VERSION_DECODE_INFO[r];if(s===e)return Y.getVersionForNumber(r+7);const o=at.numBitsDiffering(e,s);o<t&&(i=r+7,t=o)}return t<=3?Y.getVersionForNumber(i):null}buildFunctionPattern(){const e=this.getDimensionForVersion(),t=new Me(e);t.setRegion(0,0,9,9),t.setRegion(e-8,0,8,9),t.setRegion(0,e-8,9,8);const i=this.alignmentPatternCenters.length;for(let r=0;r<i;r++){const s=this.alignmentPatternCenters[r]-2;for(let o=0;o<i;o++)r===0&&(o===0||o===i-1)||r===i-1&&o===0||t.setRegion(this.alignmentPatternCenters[o]-2,s,5,5)}return t.setRegion(6,9,1,e-17),t.setRegion(9,6,e-17,1),this.versionNumber>6&&(t.setRegion(e-11,0,3,6),t.setRegion(0,e-11,6,3)),t}toString(){return""+this.versionNumber}}Y.VERSION_DECODE_INFO=Int32Array.from([31892,34236,39577,42195,48118,51042,55367,58893,63784,68472,70749,76311,79154,84390,87683,92361,96236,102084,102881,110507,110734,117786,119615,126325,127568,133589,136944,141498,145311,150283,152622,158308,161089,167017]),Y.VERSIONS=[new Y(1,new Int32Array(0),new N(7,new v(1,19)),new N(10,new v(1,16)),new N(13,new v(1,13)),new N(17,new v(1,9))),new Y(2,Int32Array.from([6,18]),new N(10,new v(1,34)),new N(16,new v(1,28)),new N(22,new v(1,22)),new N(28,new v(1,16))),new Y(3,Int32Array.from([6,22]),new N(15,new v(1,55)),new N(26,new v(1,44)),new N(18,new v(2,17)),new N(22,new v(2,13))),new Y(4,Int32Array.from([6,26]),new N(20,new v(1,80)),new N(18,new v(2,32)),new N(26,new v(2,24)),new N(16,new v(4,9))),new Y(5,Int32Array.from([6,30]),new N(26,new v(1,108)),new N(24,new v(2,43)),new N(18,new v(2,15),new v(2,16)),new N(22,new v(2,11),new v(2,12))),new Y(6,Int32Array.from([6,34]),new N(18,new v(2,68)),new N(16,new v(4,27)),new N(24,new v(4,19)),new N(28,new v(4,15))),new Y(7,Int32Array.from([6,22,38]),new N(20,new v(2,78)),new N(18,new v(4,31)),new N(18,new v(2,14),new v(4,15)),new N(26,new v(4,13),new v(1,14))),new Y(8,Int32Array.from([6,24,42]),new N(24,new v(2,97)),new N(22,new v(2,38),new v(2,39)),new N(22,new v(4,18),new v(2,19)),new N(26,new v(4,14),new v(2,15))),new Y(9,Int32Array.from([6,26,46]),new N(30,new v(2,116)),new N(22,new v(3,36),new v(2,37)),new N(20,new v(4,16),new v(4,17)),new N(24,new v(4,12),new v(4,13))),new Y(10,Int32Array.from([6,28,50]),new N(18,new v(2,68),new v(2,69)),new N(26,new v(4,43),new v(1,44)),new N(24,new v(6,19),new v(2,20)),new N(28,new v(6,15),new v(2,16))),new Y(11,Int32Array.from([6,30,54]),new N(20,new v(4,81)),new N(30,new v(1,50),new v(4,51)),new N(28,new v(4,22),new v(4,23)),new N(24,new v(3,12),new v(8,13))),new Y(12,Int32Array.from([6,32,58]),new N(24,new v(2,92),new v(2,93)),new N(22,new v(6,36),new v(2,37)),new N(26,new v(4,20),new v(6,21)),new N(28,new v(7,14),new v(4,15))),new Y(13,Int32Array.from([6,34,62]),new N(26,new v(4,107)),new N(22,new v(8,37),new v(1,38)),new N(24,new v(8,20),new v(4,21)),new N(22,new v(12,11),new v(4,12))),new Y(14,Int32Array.from([6,26,46,66]),new N(30,new v(3,115),new v(1,116)),new N(24,new v(4,40),new v(5,41)),new N(20,new v(11,16),new v(5,17)),new N(24,new v(11,12),new v(5,13))),new Y(15,Int32Array.from([6,26,48,70]),new N(22,new v(5,87),new v(1,88)),new N(24,new v(5,41),new v(5,42)),new N(30,new v(5,24),new v(7,25)),new N(24,new v(11,12),new v(7,13))),new Y(16,Int32Array.from([6,26,50,74]),new N(24,new v(5,98),new v(1,99)),new N(28,new v(7,45),new v(3,46)),new N(24,new v(15,19),new v(2,20)),new N(30,new v(3,15),new v(13,16))),new Y(17,Int32Array.from([6,30,54,78]),new N(28,new v(1,107),new v(5,108)),new N(28,new v(10,46),new v(1,47)),new N(28,new v(1,22),new v(15,23)),new N(28,new v(2,14),new v(17,15))),new Y(18,Int32Array.from([6,30,56,82]),new N(30,new v(5,120),new v(1,121)),new N(26,new v(9,43),new v(4,44)),new N(28,new v(17,22),new v(1,23)),new N(28,new v(2,14),new v(19,15))),new Y(19,Int32Array.from([6,30,58,86]),new N(28,new v(3,113),new v(4,114)),new N(26,new v(3,44),new v(11,45)),new N(26,new v(17,21),new v(4,22)),new N(26,new v(9,13),new v(16,14))),new Y(20,Int32Array.from([6,34,62,90]),new N(28,new v(3,107),new v(5,108)),new N(26,new v(3,41),new v(13,42)),new N(30,new v(15,24),new v(5,25)),new N(28,new v(15,15),new v(10,16))),new Y(21,Int32Array.from([6,28,50,72,94]),new N(28,new v(4,116),new v(4,117)),new N(26,new v(17,42)),new N(28,new v(17,22),new v(6,23)),new N(30,new v(19,16),new v(6,17))),new Y(22,Int32Array.from([6,26,50,74,98]),new N(28,new v(2,111),new v(7,112)),new N(28,new v(17,46)),new N(30,new v(7,24),new v(16,25)),new N(24,new v(34,13))),new Y(23,Int32Array.from([6,30,54,78,102]),new N(30,new v(4,121),new v(5,122)),new N(28,new v(4,47),new v(14,48)),new N(30,new v(11,24),new v(14,25)),new N(30,new v(16,15),new v(14,16))),new Y(24,Int32Array.from([6,28,54,80,106]),new N(30,new v(6,117),new v(4,118)),new N(28,new v(6,45),new v(14,46)),new N(30,new v(11,24),new v(16,25)),new N(30,new v(30,16),new v(2,17))),new Y(25,Int32Array.from([6,32,58,84,110]),new N(26,new v(8,106),new v(4,107)),new N(28,new v(8,47),new v(13,48)),new N(30,new v(7,24),new v(22,25)),new N(30,new v(22,15),new v(13,16))),new Y(26,Int32Array.from([6,30,58,86,114]),new N(28,new v(10,114),new v(2,115)),new N(28,new v(19,46),new v(4,47)),new N(28,new v(28,22),new v(6,23)),new N(30,new v(33,16),new v(4,17))),new Y(27,Int32Array.from([6,34,62,90,118]),new N(30,new v(8,122),new v(4,123)),new N(28,new v(22,45),new v(3,46)),new N(30,new v(8,23),new v(26,24)),new N(30,new v(12,15),new v(28,16))),new Y(28,Int32Array.from([6,26,50,74,98,122]),new N(30,new v(3,117),new v(10,118)),new N(28,new v(3,45),new v(23,46)),new N(30,new v(4,24),new v(31,25)),new N(30,new v(11,15),new v(31,16))),new Y(29,Int32Array.from([6,30,54,78,102,126]),new N(30,new v(7,116),new v(7,117)),new N(28,new v(21,45),new v(7,46)),new N(30,new v(1,23),new v(37,24)),new N(30,new v(19,15),new v(26,16))),new Y(30,Int32Array.from([6,26,52,78,104,130]),new N(30,new v(5,115),new v(10,116)),new N(28,new v(19,47),new v(10,48)),new N(30,new v(15,24),new v(25,25)),new N(30,new v(23,15),new v(25,16))),new Y(31,Int32Array.from([6,30,56,82,108,134]),new N(30,new v(13,115),new v(3,116)),new N(28,new v(2,46),new v(29,47)),new N(30,new v(42,24),new v(1,25)),new N(30,new v(23,15),new v(28,16))),new Y(32,Int32Array.from([6,34,60,86,112,138]),new N(30,new v(17,115)),new N(28,new v(10,46),new v(23,47)),new N(30,new v(10,24),new v(35,25)),new N(30,new v(19,15),new v(35,16))),new Y(33,Int32Array.from([6,30,58,86,114,142]),new N(30,new v(17,115),new v(1,116)),new N(28,new v(14,46),new v(21,47)),new N(30,new v(29,24),new v(19,25)),new N(30,new v(11,15),new v(46,16))),new Y(34,Int32Array.from([6,34,62,90,118,146]),new N(30,new v(13,115),new v(6,116)),new N(28,new v(14,46),new v(23,47)),new N(30,new v(44,24),new v(7,25)),new N(30,new v(59,16),new v(1,17))),new Y(35,Int32Array.from([6,30,54,78,102,126,150]),new N(30,new v(12,121),new v(7,122)),new N(28,new v(12,47),new v(26,48)),new N(30,new v(39,24),new v(14,25)),new N(30,new v(22,15),new v(41,16))),new Y(36,Int32Array.from([6,24,50,76,102,128,154]),new N(30,new v(6,121),new v(14,122)),new N(28,new v(6,47),new v(34,48)),new N(30,new v(46,24),new v(10,25)),new N(30,new v(2,15),new v(64,16))),new Y(37,Int32Array.from([6,28,54,80,106,132,158]),new N(30,new v(17,122),new v(4,123)),new N(28,new v(29,46),new v(14,47)),new N(30,new v(49,24),new v(10,25)),new N(30,new v(24,15),new v(46,16))),new Y(38,Int32Array.from([6,32,58,84,110,136,162]),new N(30,new v(4,122),new v(18,123)),new N(28,new v(13,46),new v(32,47)),new N(30,new v(48,24),new v(14,25)),new N(30,new v(42,15),new v(32,16))),new Y(39,Int32Array.from([6,26,54,82,110,138,166]),new N(30,new v(20,117),new v(4,118)),new N(28,new v(40,47),new v(7,48)),new N(30,new v(43,24),new v(22,25)),new N(30,new v(10,15),new v(67,16))),new Y(40,Int32Array.from([6,30,58,86,114,142,170]),new N(30,new v(19,118),new v(6,119)),new N(28,new v(18,47),new v(31,48)),new N(30,new v(34,24),new v(34,25)),new N(30,new v(20,15),new v(61,16)))];var Ze;(function(x){x[x.DATA_MASK_000=0]="DATA_MASK_000",x[x.DATA_MASK_001=1]="DATA_MASK_001",x[x.DATA_MASK_010=2]="DATA_MASK_010",x[x.DATA_MASK_011=3]="DATA_MASK_011",x[x.DATA_MASK_100=4]="DATA_MASK_100",x[x.DATA_MASK_101=5]="DATA_MASK_101",x[x.DATA_MASK_110=6]="DATA_MASK_110",x[x.DATA_MASK_111=7]="DATA_MASK_111"})(Ze||(Ze={}));class At{constructor(e,t){this.value=e,this.isMasked=t}unmaskBitMatrix(e,t){for(let i=0;i<t;i++)for(let r=0;r<t;r++)this.isMasked(i,r)&&e.flip(r,i)}}At.values=new Map([[Ze.DATA_MASK_000,new At(Ze.DATA_MASK_000,(x,e)=>(x+e&1)===0)],[Ze.DATA_MASK_001,new At(Ze.DATA_MASK_001,(x,e)=>(x&1)===0)],[Ze.DATA_MASK_010,new At(Ze.DATA_MASK_010,(x,e)=>e%3===0)],[Ze.DATA_MASK_011,new At(Ze.DATA_MASK_011,(x,e)=>(x+e)%3===0)],[Ze.DATA_MASK_100,new At(Ze.DATA_MASK_100,(x,e)=>(Math.floor(x/2)+Math.floor(e/3)&1)===0)],[Ze.DATA_MASK_101,new At(Ze.DATA_MASK_101,(x,e)=>x*e%6===0)],[Ze.DATA_MASK_110,new At(Ze.DATA_MASK_110,(x,e)=>x*e%6<3)],[Ze.DATA_MASK_111,new At(Ze.DATA_MASK_111,(x,e)=>(x+e+x*e%3&1)===0)]]);class Zo{constructor(e){const t=e.getHeight();if(t<21||(t&3)!==1)throw new z;this.bitMatrix=e}readFormatInformation(){if(this.parsedFormatInfo!==null&&this.parsedFormatInfo!==void 0)return this.parsedFormatInfo;let e=0;for(let s=0;s<6;s++)e=this.copyBit(s,8,e);e=this.copyBit(7,8,e),e=this.copyBit(8,8,e),e=this.copyBit(8,7,e);for(let s=5;s>=0;s--)e=this.copyBit(8,s,e);const t=this.bitMatrix.getHeight();let i=0;const r=t-7;for(let s=t-1;s>=r;s--)i=this.copyBit(8,s,i);for(let s=t-8;s<t;s++)i=this.copyBit(s,8,i);if(this.parsedFormatInfo=at.decodeFormatInformation(e,i),this.parsedFormatInfo!==null)return this.parsedFormatInfo;throw new z}readVersion(){if(this.parsedVersion!==null&&this.parsedVersion!==void 0)return this.parsedVersion;const e=this.bitMatrix.getHeight(),t=Math.floor((e-17)/4);if(t<=6)return Y.getVersionForNumber(t);let i=0;const r=e-11;for(let o=5;o>=0;o--)for(let c=e-9;c>=r;c--)i=this.copyBit(c,o,i);let s=Y.decodeVersionInformation(i);if(s!==null&&s.getDimensionForVersion()===e)return this.parsedVersion=s,s;i=0;for(let o=5;o>=0;o--)for(let c=e-9;c>=r;c--)i=this.copyBit(o,c,i);if(s=Y.decodeVersionInformation(i),s!==null&&s.getDimensionForVersion()===e)return this.parsedVersion=s,s;throw new z}copyBit(e,t,i){return(this.isMirror?this.bitMatrix.get(t,e):this.bitMatrix.get(e,t))?i<<1|1:i<<1}readCodewords(){const e=this.readFormatInformation(),t=this.readVersion(),i=At.values.get(e.getDataMask()),r=this.bitMatrix.getHeight();i.unmaskBitMatrix(this.bitMatrix,r);const s=t.buildFunctionPattern();let o=!0;const c=new Uint8Array(t.getTotalCodewords());let h=0,f=0,p=0;for(let w=r-1;w>0;w-=2){w===6&&w--;for(let b=0;b<r;b++){const y=o?r-1-b:b;for(let E=0;E<2;E++)s.get(w-E,y)||(p++,f<<=1,this.bitMatrix.get(w-E,y)&&(f|=1),p===8&&(c[h++]=f,p=0,f=0))}o=!o}if(h!==t.getTotalCodewords())throw new z;return c}remask(){if(this.parsedFormatInfo===null)return;const e=At.values[this.parsedFormatInfo.getDataMask()],t=this.bitMatrix.getHeight();e.unmaskBitMatrix(this.bitMatrix,t)}setMirror(e){this.parsedVersion=null,this.parsedFormatInfo=null,this.isMirror=e}mirror(){const e=this.bitMatrix;for(let t=0,i=e.getWidth();t<i;t++)for(let r=t+1,s=e.getHeight();r<s;r++)e.get(t,r)!==e.get(r,t)&&(e.flip(r,t),e.flip(t,r))}}class kn{constructor(e,t){this.numDataCodewords=e,this.codewords=t}static getDataBlocks(e,t,i){if(e.length!==t.getTotalCodewords())throw new I;const r=t.getECBlocksForLevel(i);let s=0;const o=r.getECBlocks();for(const E of o)s+=E.getCount();const c=new Array(s);let h=0;for(const E of o)for(let S=0;S<E.getCount();S++){const T=E.getDataCodewords(),R=r.getECCodewordsPerBlock()+T;c[h++]=new kn(T,new Uint8Array(R))}const f=c[0].codewords.length;let p=c.length-1;for(;p>=0&&c[p].codewords.length!==f;)p--;p++;const w=f-r.getECCodewordsPerBlock();let b=0;for(let E=0;E<w;E++)for(let S=0;S<h;S++)c[S].codewords[E]=e[b++];for(let E=p;E<h;E++)c[E].codewords[w]=e[b++];const y=c[0].codewords.length;for(let E=w;E<y;E++)for(let S=0;S<h;S++){const T=S<p?E:E+1;c[S].codewords[T]=e[b++]}return c}getNumDataCodewords(){return this.numDataCodewords}getCodewords(){return this.codewords}}var Et;(function(x){x[x.TERMINATOR=0]="TERMINATOR",x[x.NUMERIC=1]="NUMERIC",x[x.ALPHANUMERIC=2]="ALPHANUMERIC",x[x.STRUCTURED_APPEND=3]="STRUCTURED_APPEND",x[x.BYTE=4]="BYTE",x[x.ECI=5]="ECI",x[x.KANJI=6]="KANJI",x[x.FNC1_FIRST_POSITION=7]="FNC1_FIRST_POSITION",x[x.FNC1_SECOND_POSITION=8]="FNC1_SECOND_POSITION",x[x.HANZI=9]="HANZI"})(Et||(Et={}));class q{constructor(e,t,i,r){this.value=e,this.stringValue=t,this.characterCountBitsForVersions=i,this.bits=r,q.FOR_BITS.set(r,this),q.FOR_VALUE.set(e,this)}static forBits(e){const t=q.FOR_BITS.get(e);if(t===void 0)throw new I;return t}getCharacterCountBits(e){const t=e.getVersionNumber();let i;return t<=9?i=0:t<=26?i=1:i=2,this.characterCountBitsForVersions[i]}getValue(){return this.value}getBits(){return this.bits}equals(e){if(!(e instanceof q))return!1;const t=e;return this.value===t.value}toString(){return this.stringValue}}q.FOR_BITS=new Map,q.FOR_VALUE=new Map,q.TERMINATOR=new q(Et.TERMINATOR,"TERMINATOR",Int32Array.from([0,0,0]),0),q.NUMERIC=new q(Et.NUMERIC,"NUMERIC",Int32Array.from([10,12,14]),1),q.ALPHANUMERIC=new q(Et.ALPHANUMERIC,"ALPHANUMERIC",Int32Array.from([9,11,13]),2),q.STRUCTURED_APPEND=new q(Et.STRUCTURED_APPEND,"STRUCTURED_APPEND",Int32Array.from([0,0,0]),3),q.BYTE=new q(Et.BYTE,"BYTE",Int32Array.from([8,16,16]),4),q.ECI=new q(Et.ECI,"ECI",Int32Array.from([0,0,0]),7),q.KANJI=new q(Et.KANJI,"KANJI",Int32Array.from([8,10,12]),8),q.FNC1_FIRST_POSITION=new q(Et.FNC1_FIRST_POSITION,"FNC1_FIRST_POSITION",Int32Array.from([0,0,0]),5),q.FNC1_SECOND_POSITION=new q(Et.FNC1_SECOND_POSITION,"FNC1_SECOND_POSITION",Int32Array.from([0,0,0]),9),q.HANZI=new q(Et.HANZI,"HANZI",Int32Array.from([8,10,12]),13);class Pe{static decode(e,t,i,r){const s=new Rn(e);let o=new se;const c=new Array;let h=-1,f=-1;try{let p=null,w=!1,b;do{if(s.available()<4)b=q.TERMINATOR;else{const y=s.readBits(4);b=q.forBits(y)}switch(b){case q.TERMINATOR:break;case q.FNC1_FIRST_POSITION:case q.FNC1_SECOND_POSITION:w=!0;break;case q.STRUCTURED_APPEND:if(s.available()<16)throw new z;h=s.readBits(8),f=s.readBits(8);break;case q.ECI:const y=Pe.parseECIValue(s);if(p=P.getCharacterSetECIByValue(y),p===null)throw new z;break;case q.HANZI:const E=s.readBits(4),S=s.readBits(b.getCharacterCountBits(t));E===Pe.GB2312_SUBSET&&Pe.decodeHanziSegment(s,o,S);break;default:const T=s.readBits(b.getCharacterCountBits(t));switch(b){case q.NUMERIC:Pe.decodeNumericSegment(s,o,T);break;case q.ALPHANUMERIC:Pe.decodeAlphanumericSegment(s,o,T,w);break;case q.BYTE:Pe.decodeByteSegment(s,o,T,p,c,r);break;case q.KANJI:Pe.decodeKanjiSegment(s,o,T);break;default:throw new z}break}}while(b!==q.TERMINATOR)}catch{throw new z}return new hr(e,o.toString(),c.length===0?null:c,i===null?null:i.toString(),h,f)}static decodeHanziSegment(e,t,i){if(i*13>e.available())throw new z;const r=new Uint8Array(2*i);let s=0;for(;i>0;){const o=e.readBits(13);let c=o/96<<8&4294967295|o%96;c<959?c+=41377:c+=42657,r[s]=c>>8&255,r[s+1]=c&255,s+=2,i--}try{t.append(De.decode(r,Z.GB2312))}catch(o){throw new z(o)}}static decodeKanjiSegment(e,t,i){if(i*13>e.available())throw new z;const r=new Uint8Array(2*i);let s=0;for(;i>0;){const o=e.readBits(13);let c=o/192<<8&4294967295|o%192;c<7936?c+=33088:c+=49472,r[s]=c>>8,r[s+1]=c,s+=2,i--}try{t.append(De.decode(r,Z.SHIFT_JIS))}catch(o){throw new z(o)}}static decodeByteSegment(e,t,i,r,s,o){if(8*i>e.available())throw new z;const c=new Uint8Array(i);for(let f=0;f<i;f++)c[f]=e.readBits(8);let h;r===null?h=Z.guessEncoding(c,o):h=r.getName();try{t.append(De.decode(c,h))}catch(f){throw new z(f)}s.push(c)}static toAlphaNumericChar(e){if(e>=Pe.ALPHANUMERIC_CHARS.length)throw new z;return Pe.ALPHANUMERIC_CHARS[e]}static decodeAlphanumericSegment(e,t,i,r){const s=t.length();for(;i>1;){if(e.available()<11)throw new z;const o=e.readBits(11);t.append(Pe.toAlphaNumericChar(Math.floor(o/45))),t.append(Pe.toAlphaNumericChar(o%45)),i-=2}if(i===1){if(e.available()<6)throw new z;t.append(Pe.toAlphaNumericChar(e.readBits(6)))}if(r)for(let o=s;o<t.length();o++)t.charAt(o)==="%"&&(o<t.length()-1&&t.charAt(o+1)==="%"?t.deleteCharAt(o+1):t.setCharAt(o,""))}static decodeNumericSegment(e,t,i){for(;i>=3;){if(e.available()<10)throw new z;const r=e.readBits(10);if(r>=1e3)throw new z;t.append(Pe.toAlphaNumericChar(Math.floor(r/100))),t.append(Pe.toAlphaNumericChar(Math.floor(r/10)%10)),t.append(Pe.toAlphaNumericChar(r%10)),i-=3}if(i===2){if(e.available()<7)throw new z;const r=e.readBits(7);if(r>=100)throw new z;t.append(Pe.toAlphaNumericChar(Math.floor(r/10))),t.append(Pe.toAlphaNumericChar(r%10))}else if(i===1){if(e.available()<4)throw new z;const r=e.readBits(4);if(r>=10)throw new z;t.append(Pe.toAlphaNumericChar(r))}}static parseECIValue(e){const t=e.readBits(8);if(!(t&128))return t&127;if((t&192)===128){const i=e.readBits(8);return(t&63)<<8&4294967295|i}if((t&224)===192){const i=e.readBits(16);return(t&31)<<16&4294967295|i}throw new z}}Pe.ALPHANUMERIC_CHARS="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:",Pe.GB2312_SUBSET=1;class Xs{constructor(e){this.mirrored=e}isMirrored(){return this.mirrored}applyMirroredCorrection(e){if(!this.mirrored||e===null||e.length<3)return;const t=e[0];e[0]=e[2],e[2]=t}}class qo{constructor(){this.rsDecoder=new fr(be.QR_CODE_FIELD_256)}decodeBooleanArray(e,t){return this.decodeBitMatrix(Me.parseFromBooleanArray(e),t)}decodeBitMatrix(e,t){const i=new Zo(e);let r=null;try{return this.decodeBitMatrixParser(i,t)}catch(s){r=s}try{i.remask(),i.setMirror(!0),i.readVersion(),i.readFormatInformation(),i.mirror();const s=this.decodeBitMatrixParser(i,t);return s.setOther(new Xs(!0)),s}catch(s){throw r!==null?r:s}}decodeBitMatrixParser(e,t){const i=e.readVersion(),r=e.readFormatInformation().getErrorCorrectionLevel(),s=e.readCodewords(),o=kn.getDataBlocks(s,i,r);let c=0;for(const p of o)c+=p.getNumDataCodewords();const h=new Uint8Array(c);let f=0;for(const p of o){const w=p.getCodewords(),b=p.getNumDataCodewords();this.correctErrors(w,b);for(let y=0;y<b;y++)h[f++]=w[y]}return Pe.decode(h,i,r,t)}correctErrors(e,t){const i=new Int32Array(e);try{this.rsDecoder.decode(i,e.length-t)}catch{throw new X}for(let r=0;r<t;r++)e[r]=i[r]}}class Dn extends j{constructor(e,t,i){super(e,t),this.estimatedModuleSize=i}aboutEquals(e,t,i){if(Math.abs(t-this.getY())<=e&&Math.abs(i-this.getX())<=e){const r=Math.abs(e-this.estimatedModuleSize);return r<=1||r<=this.estimatedModuleSize}return!1}combineEstimate(e,t,i){const r=(this.getX()+t)/2,s=(this.getY()+e)/2,o=(this.estimatedModuleSize+i)/2;return new Dn(r,s,o)}}class jr{constructor(e,t,i,r,s,o,c){this.image=e,this.startX=t,this.startY=i,this.width=r,this.height=s,this.moduleSize=o,this.resultPointCallback=c,this.possibleCenters=[],this.crossCheckStateCount=new Int32Array(3)}find(){const e=this.startX,t=this.height,i=this.width,r=e+i,s=this.startY+t/2,o=new Int32Array(3),c=this.image;for(let h=0;h<t;h++){const f=s+(h&1?-Math.floor((h+1)/2):Math.floor((h+1)/2));o[0]=0,o[1]=0,o[2]=0;let p=e;for(;p<r&&!c.get(p,f);)p++;let w=0;for(;p<r;){if(c.get(p,f))if(w===1)o[1]++;else if(w===2){if(this.foundPatternCross(o)){const b=this.handlePossibleCenter(o,f,p);if(b!==null)return b}o[0]=o[2],o[1]=1,o[2]=0,w=1}else o[++w]++;else w===1&&w++,o[w]++;p++}if(this.foundPatternCross(o)){const b=this.handlePossibleCenter(o,f,r);if(b!==null)return b}}if(this.possibleCenters.length!==0)return this.possibleCenters[0];throw new D}static centerFromEnd(e,t){return t-e[2]-e[1]/2}foundPatternCross(e){const t=this.moduleSize,i=t/2;for(let r=0;r<3;r++)if(Math.abs(t-e[r])>=i)return!1;return!0}crossCheckVertical(e,t,i,r){const s=this.image,o=s.getHeight(),c=this.crossCheckStateCount;c[0]=0,c[1]=0,c[2]=0;let h=e;for(;h>=0&&s.get(t,h)&&c[1]<=i;)c[1]++,h--;if(h<0||c[1]>i)return NaN;for(;h>=0&&!s.get(t,h)&&c[0]<=i;)c[0]++,h--;if(c[0]>i)return NaN;for(h=e+1;h<o&&s.get(t,h)&&c[1]<=i;)c[1]++,h++;if(h===o||c[1]>i)return NaN;for(;h<o&&!s.get(t,h)&&c[2]<=i;)c[2]++,h++;if(c[2]>i)return NaN;const f=c[0]+c[1]+c[2];return 5*Math.abs(f-r)>=2*r?NaN:this.foundPatternCross(c)?jr.centerFromEnd(c,h):NaN}handlePossibleCenter(e,t,i){const r=e[0]+e[1]+e[2],s=jr.centerFromEnd(e,i),o=this.crossCheckVertical(t,s,2*e[1],r);if(!isNaN(o)){const c=(e[0]+e[1]+e[2])/3;for(const f of this.possibleCenters)if(f.aboutEquals(c,o,s))return f.combineEstimate(o,s,c);const h=new Dn(s,o,c);this.possibleCenters.push(h),this.resultPointCallback!==null&&this.resultPointCallback!==void 0&&this.resultPointCallback.foundPossibleResultPoint(h)}return null}}class Mn extends j{constructor(e,t,i,r){super(e,t),this.estimatedModuleSize=i,this.count=r,r===void 0&&(this.count=1)}getEstimatedModuleSize(){return this.estimatedModuleSize}getCount(){return this.count}aboutEquals(e,t,i){if(Math.abs(t-this.getY())<=e&&Math.abs(i-this.getX())<=e){const r=Math.abs(e-this.estimatedModuleSize);return r<=1||r<=this.estimatedModuleSize}return!1}combineEstimate(e,t,i){const r=this.count+1,s=(this.count*this.getX()+t)/r,o=(this.count*this.getY()+e)/r,c=(this.count*this.estimatedModuleSize+i)/r;return new Mn(s,o,c,r)}}class Qo{constructor(e){this.bottomLeft=e[0],this.topLeft=e[1],this.topRight=e[2]}getBottomLeft(){return this.bottomLeft}getTopLeft(){return this.topLeft}getTopRight(){return this.topRight}}class qe{constructor(e,t){this.image=e,this.resultPointCallback=t,this.possibleCenters=[],this.crossCheckStateCount=new Int32Array(5),this.resultPointCallback=t}getImage(){return this.image}getPossibleCenters(){return this.possibleCenters}find(e){const t=e!=null&&e.get(we.TRY_HARDER)!==void 0,i=e!=null&&e.get(we.PURE_BARCODE)!==void 0,r=this.image,s=r.getHeight(),o=r.getWidth();let c=Math.floor(3*s/(4*qe.MAX_MODULES));(c<qe.MIN_SKIP||t)&&(c=qe.MIN_SKIP);let h=!1;const f=new Int32Array(5);for(let w=c-1;w<s&&!h;w+=c){f[0]=0,f[1]=0,f[2]=0,f[3]=0,f[4]=0;let b=0;for(let y=0;y<o;y++)if(r.get(y,w))(b&1)===1&&b++,f[b]++;else if(b&1)f[b]++;else if(b===4)if(qe.foundPatternCross(f)){if(this.handlePossibleCenter(f,w,y,i)===!0)if(c=2,this.hasSkipped===!0)h=this.haveMultiplyConfirmedCenters();else{const S=this.findRowSkip();S>f[2]&&(w+=S-f[2]-c,y=o-1)}else{f[0]=f[2],f[1]=f[3],f[2]=f[4],f[3]=1,f[4]=0,b=3;continue}b=0,f[0]=0,f[1]=0,f[2]=0,f[3]=0,f[4]=0}else f[0]=f[2],f[1]=f[3],f[2]=f[4],f[3]=1,f[4]=0,b=3;else f[++b]++;qe.foundPatternCross(f)&&this.handlePossibleCenter(f,w,o,i)===!0&&(c=f[0],this.hasSkipped&&(h=this.haveMultiplyConfirmedCenters()))}const p=this.selectBestPatterns();return j.orderBestPatterns(p),new Qo(p)}static centerFromEnd(e,t){return t-e[4]-e[3]-e[2]/2}static foundPatternCross(e){let t=0;for(let s=0;s<5;s++){const o=e[s];if(o===0)return!1;t+=o}if(t<7)return!1;const i=t/7,r=i/2;return Math.abs(i-e[0])<r&&Math.abs(i-e[1])<r&&Math.abs(3*i-e[2])<3*r&&Math.abs(i-e[3])<r&&Math.abs(i-e[4])<r}getCrossCheckStateCount(){const e=this.crossCheckStateCount;return e[0]=0,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e}crossCheckDiagonal(e,t,i,r){const s=this.getCrossCheckStateCount();let o=0;const c=this.image;for(;e>=o&&t>=o&&c.get(t-o,e-o);)s[2]++,o++;if(e<o||t<o)return!1;for(;e>=o&&t>=o&&!c.get(t-o,e-o)&&s[1]<=i;)s[1]++,o++;if(e<o||t<o||s[1]>i)return!1;for(;e>=o&&t>=o&&c.get(t-o,e-o)&&s[0]<=i;)s[0]++,o++;if(s[0]>i)return!1;const h=c.getHeight(),f=c.getWidth();for(o=1;e+o<h&&t+o<f&&c.get(t+o,e+o);)s[2]++,o++;if(e+o>=h||t+o>=f)return!1;for(;e+o<h&&t+o<f&&!c.get(t+o,e+o)&&s[3]<i;)s[3]++,o++;if(e+o>=h||t+o>=f||s[3]>=i)return!1;for(;e+o<h&&t+o<f&&c.get(t+o,e+o)&&s[4]<i;)s[4]++,o++;if(s[4]>=i)return!1;const p=s[0]+s[1]+s[2]+s[3]+s[4];return Math.abs(p-r)<2*r&&qe.foundPatternCross(s)}crossCheckVertical(e,t,i,r){const s=this.image,o=s.getHeight(),c=this.getCrossCheckStateCount();let h=e;for(;h>=0&&s.get(t,h);)c[2]++,h--;if(h<0)return NaN;for(;h>=0&&!s.get(t,h)&&c[1]<=i;)c[1]++,h--;if(h<0||c[1]>i)return NaN;for(;h>=0&&s.get(t,h)&&c[0]<=i;)c[0]++,h--;if(c[0]>i)return NaN;for(h=e+1;h<o&&s.get(t,h);)c[2]++,h++;if(h===o)return NaN;for(;h<o&&!s.get(t,h)&&c[3]<i;)c[3]++,h++;if(h===o||c[3]>=i)return NaN;for(;h<o&&s.get(t,h)&&c[4]<i;)c[4]++,h++;if(c[4]>=i)return NaN;const f=c[0]+c[1]+c[2]+c[3]+c[4];return 5*Math.abs(f-r)>=2*r?NaN:qe.foundPatternCross(c)?qe.centerFromEnd(c,h):NaN}crossCheckHorizontal(e,t,i,r){const s=this.image,o=s.getWidth(),c=this.getCrossCheckStateCount();let h=e;for(;h>=0&&s.get(h,t);)c[2]++,h--;if(h<0)return NaN;for(;h>=0&&!s.get(h,t)&&c[1]<=i;)c[1]++,h--;if(h<0||c[1]>i)return NaN;for(;h>=0&&s.get(h,t)&&c[0]<=i;)c[0]++,h--;if(c[0]>i)return NaN;for(h=e+1;h<o&&s.get(h,t);)c[2]++,h++;if(h===o)return NaN;for(;h<o&&!s.get(h,t)&&c[3]<i;)c[3]++,h++;if(h===o||c[3]>=i)return NaN;for(;h<o&&s.get(h,t)&&c[4]<i;)c[4]++,h++;if(c[4]>=i)return NaN;const f=c[0]+c[1]+c[2]+c[3]+c[4];return 5*Math.abs(f-r)>=r?NaN:qe.foundPatternCross(c)?qe.centerFromEnd(c,h):NaN}handlePossibleCenter(e,t,i,r){const s=e[0]+e[1]+e[2]+e[3]+e[4];let o=qe.centerFromEnd(e,i),c=this.crossCheckVertical(t,Math.floor(o),e[2],s);if(!isNaN(c)&&(o=this.crossCheckHorizontal(Math.floor(o),Math.floor(c),e[2],s),!isNaN(o)&&(!r||this.crossCheckDiagonal(Math.floor(c),Math.floor(o),e[2],s)))){const h=s/7;let f=!1;const p=this.possibleCenters;for(let w=0,b=p.length;w<b;w++){const y=p[w];if(y.aboutEquals(h,c,o)){p[w]=y.combineEstimate(c,o,h),f=!0;break}}if(!f){const w=new Mn(o,c,h);p.push(w),this.resultPointCallback!==null&&this.resultPointCallback!==void 0&&this.resultPointCallback.foundPossibleResultPoint(w)}return!0}return!1}findRowSkip(){if(this.possibleCenters.length<=1)return 0;let t=null;for(const i of this.possibleCenters)if(i.getCount()>=qe.CENTER_QUORUM)if(t==null)t=i;else return this.hasSkipped=!0,Math.floor((Math.abs(t.getX()-i.getX())-Math.abs(t.getY()-i.getY()))/2);return 0}haveMultiplyConfirmedCenters(){let e=0,t=0;const i=this.possibleCenters.length;for(const o of this.possibleCenters)o.getCount()>=qe.CENTER_QUORUM&&(e++,t+=o.getEstimatedModuleSize());if(e<3)return!1;const r=t/i;let s=0;for(const o of this.possibleCenters)s+=Math.abs(o.getEstimatedModuleSize()-r);return s<=.05*t}selectBestPatterns(){const e=this.possibleCenters.length;if(e<3)throw new D;const t=this.possibleCenters;let i;if(e>3){let r=0,s=0;for(const h of this.possibleCenters){const f=h.getEstimatedModuleSize();r+=f,s+=f*f}i=r/e;let o=Math.sqrt(s/e-i*i);t.sort((h,f)=>{const p=Math.abs(f.getEstimatedModuleSize()-i),w=Math.abs(h.getEstimatedModuleSize()-i);return p<w?-1:p>w?1:0});const c=Math.max(.2*i,o);for(let h=0;h<t.length&&t.length>3;h++){const f=t[h];Math.abs(f.getEstimatedModuleSize()-i)>c&&(t.splice(h,1),h--)}}if(t.length>3){let r=0;for(const s of t)r+=s.getEstimatedModuleSize();i=r/t.length,t.sort((s,o)=>{if(o.getCount()===s.getCount()){const c=Math.abs(o.getEstimatedModuleSize()-i),h=Math.abs(s.getEstimatedModuleSize()-i);return c<h?1:c>h?-1:0}else return o.getCount()-s.getCount()}),t.splice(3)}return[t[0],t[1],t[2]]}}qe.CENTER_QUORUM=2,qe.MIN_SKIP=3,qe.MAX_MODULES=57;class pr{constructor(e){this.image=e}getImage(){return this.image}getResultPointCallback(){return this.resultPointCallback}detect(e){this.resultPointCallback=e==null?null:e.get(we.NEED_RESULT_POINT_CALLBACK);const i=new qe(this.image,this.resultPointCallback).find(e);return this.processFinderPatternInfo(i)}processFinderPatternInfo(e){const t=e.getTopLeft(),i=e.getTopRight(),r=e.getBottomLeft(),s=this.calculateModuleSize(t,i,r);if(s<1)throw new D("No pattern found in proccess finder.");const o=pr.computeDimension(t,i,r,s),c=Y.getProvisionalVersionForDimension(o),h=c.getDimensionForVersion()-7;let f=null;if(c.getAlignmentPatternCenters().length>0){const y=i.getX()-t.getX()+r.getX(),E=i.getY()-t.getY()+r.getY(),S=1-3/h,T=Math.floor(t.getX()+S*(y-t.getX())),R=Math.floor(t.getY()+S*(E-t.getY()));for(let F=4;F<=16;F<<=1)try{f=this.findAlignmentInRegion(s,T,R,F);break}catch(U){if(!(U instanceof D))throw U}}const p=pr.createTransform(t,i,r,f,o),w=pr.sampleGrid(this.image,p,o);let b;return f===null?b=[r,t,i]:b=[r,t,i,f],new $r(w,b)}static createTransform(e,t,i,r,s){const o=s-3.5;let c,h,f,p;return r!==null?(c=r.getX(),h=r.getY(),f=o-3,p=f):(c=t.getX()-e.getX()+i.getX(),h=t.getY()-e.getY()+i.getY(),f=o,p=o),Tt.quadrilateralToQuadrilateral(3.5,3.5,o,3.5,f,p,3.5,o,e.getX(),e.getY(),t.getX(),t.getY(),c,h,i.getX(),i.getY())}static sampleGrid(e,t,i){return ni.getInstance().sampleGridWithTransform(e,i,i,t)}static computeDimension(e,t,i,r){const s=me.round(j.distance(e,t)/r),o=me.round(j.distance(e,i)/r);let c=Math.floor((s+o)/2)+7;switch(c&3){case 0:c++;break;case 2:c--;break;case 3:throw new D("Dimensions could be not found.")}return c}calculateModuleSize(e,t,i){return(this.calculateModuleSizeOneWay(e,t)+this.calculateModuleSizeOneWay(e,i))/2}calculateModuleSizeOneWay(e,t){const i=this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(e.getX()),Math.floor(e.getY()),Math.floor(t.getX()),Math.floor(t.getY())),r=this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(t.getX()),Math.floor(t.getY()),Math.floor(e.getX()),Math.floor(e.getY()));return isNaN(i)?r/7:isNaN(r)?i/7:(i+r)/14}sizeOfBlackWhiteBlackRunBothWays(e,t,i,r){let s=this.sizeOfBlackWhiteBlackRun(e,t,i,r),o=1,c=e-(i-e);c<0?(o=e/(e-c),c=0):c>=this.image.getWidth()&&(o=(this.image.getWidth()-1-e)/(c-e),c=this.image.getWidth()-1);let h=Math.floor(t-(r-t)*o);return o=1,h<0?(o=t/(t-h),h=0):h>=this.image.getHeight()&&(o=(this.image.getHeight()-1-t)/(h-t),h=this.image.getHeight()-1),c=Math.floor(e+(c-e)*o),s+=this.sizeOfBlackWhiteBlackRun(e,t,c,h),s-1}sizeOfBlackWhiteBlackRun(e,t,i,r){const s=Math.abs(r-t)>Math.abs(i-e);if(s){let y=e;e=t,t=y,y=i,i=r,r=y}const o=Math.abs(i-e),c=Math.abs(r-t);let h=-o/2;const f=e<i?1:-1,p=t<r?1:-1;let w=0;const b=i+f;for(let y=e,E=t;y!==b;y+=f){const S=s?E:y,T=s?y:E;if(w===1===this.image.get(S,T)){if(w===2)return me.distance(y,E,e,t);w++}if(h+=c,h>0){if(E===r)break;E+=p,h-=o}}return w===2?me.distance(i+f,r,e,t):NaN}findAlignmentInRegion(e,t,i,r){const s=Math.floor(r*e),o=Math.max(0,t-s),c=Math.min(this.image.getWidth()-1,t+s);if(c-o<e*3)throw new D("Alignment top exceeds estimated module size.");const h=Math.max(0,i-s),f=Math.min(this.image.getHeight()-1,i+s);if(f-h<e*3)throw new D("Alignment bottom exceeds estimated module size.");return new jr(this.image,o,h,c-o,f-h,e,this.resultPointCallback).find()}}class li{constructor(){this.decoder=new qo}getDecoder(){return this.decoder}decode(e,t){let i,r;if(t!=null&&t.get(we.PURE_BARCODE)!==void 0){const h=li.extractPureBits(e.getBlackMatrix());i=this.decoder.decodeBitMatrix(h,t),r=li.NO_POINTS}else{const h=new pr(e.getBlackMatrix()).detect(t);i=this.decoder.decodeBitMatrix(h.getBits(),t),r=h.getPoints()}i.getOther()instanceof Xs&&i.getOther().applyMirroredCorrection(r);const s=new ct(i.getText(),i.getRawBytes(),void 0,r,Q.QR_CODE,void 0),o=i.getByteSegments();o!==null&&s.putMetadata(Ye.BYTE_SEGMENTS,o);const c=i.getECLevel();return c!==null&&s.putMetadata(Ye.ERROR_CORRECTION_LEVEL,c),i.hasStructuredAppend()&&(s.putMetadata(Ye.STRUCTURED_APPEND_SEQUENCE,i.getStructuredAppendSequenceNumber()),s.putMetadata(Ye.STRUCTURED_APPEND_PARITY,i.getStructuredAppendParity())),s}reset(){}static extractPureBits(e){const t=e.getTopLeftOnBit(),i=e.getBottomRightOnBit();if(t===null||i===null)throw new D;const r=this.moduleSize(t,e);let s=t[1],o=i[1],c=t[0],h=i[0];if(c>=h||s>=o)throw new D;if(o-s!==h-c&&(h=c+(o-s),h>=e.getWidth()))throw new D;const f=Math.round((h-c+1)/r),p=Math.round((o-s+1)/r);if(f<=0||p<=0)throw new D;if(p!==f)throw new D;const w=Math.floor(r/2);s+=w,c+=w;const b=c+Math.floor((f-1)*r)-h;if(b>0){if(b>w)throw new D;c-=b}const y=s+Math.floor((p-1)*r)-o;if(y>0){if(y>w)throw new D;s-=y}const E=new Me(f,p);for(let S=0;S<p;S++){const T=s+Math.floor(S*r);for(let R=0;R<f;R++)e.get(c+Math.floor(R*r),T)&&E.set(R,S)}return E}static moduleSize(e,t){const i=t.getHeight(),r=t.getWidth();let s=e[0],o=e[1],c=!0,h=0;for(;s<r&&o<i;){if(c!==t.get(s,o)){if(++h===5)break;c=!c}s++,o++}if(s===r||o===i)throw new D;return(s-e[0])/7}}li.NO_POINTS=new Array;class ee{PDF417Common(){}static getBitCountSum(e){return me.sum(e)}static toIntArray(e){if(e==null||!e.length)return ee.EMPTY_INT_ARRAY;const t=new Int32Array(e.length);let i=0;for(const r of e)t[i++]=r;return t}static getCodeword(e){const t=le.binarySearch(ee.SYMBOL_TABLE,e&262143);return t<0?-1:(ee.CODEWORD_TABLE[t]-1)%ee.NUMBER_OF_CODEWORDS}}ee.NUMBER_OF_CODEWORDS=929,ee.MAX_CODEWORDS_IN_BARCODE=ee.NUMBER_OF_CODEWORDS-1,ee.MIN_ROWS_IN_BARCODE=3,ee.MAX_ROWS_IN_BARCODE=90,ee.MODULES_IN_CODEWORD=17,ee.MODULES_IN_STOP_PATTERN=18,ee.BARS_IN_MODULE=8,ee.EMPTY_INT_ARRAY=new Int32Array([]),ee.SYMBOL_TABLE=Int32Array.from([66142,66170,66206,66236,66290,66292,66350,66382,66396,66454,66470,66476,66594,66600,66614,66626,66628,66632,66640,66654,66662,66668,66682,66690,66718,66720,66748,66758,66776,66798,66802,66804,66820,66824,66832,66846,66848,66876,66880,66936,66950,66956,66968,66992,67006,67022,67036,67042,67044,67048,67062,67118,67150,67164,67214,67228,67256,67294,67322,67350,67366,67372,67398,67404,67416,67438,67474,67476,67490,67492,67496,67510,67618,67624,67650,67656,67664,67678,67686,67692,67706,67714,67716,67728,67742,67744,67772,67782,67788,67800,67822,67826,67828,67842,67848,67870,67872,67900,67904,67960,67974,67992,68016,68030,68046,68060,68066,68068,68072,68086,68104,68112,68126,68128,68156,68160,68216,68336,68358,68364,68376,68400,68414,68448,68476,68494,68508,68536,68546,68548,68552,68560,68574,68582,68588,68654,68686,68700,68706,68708,68712,68726,68750,68764,68792,68802,68804,68808,68816,68830,68838,68844,68858,68878,68892,68920,68976,68990,68994,68996,69e3,69008,69022,69024,69052,69062,69068,69080,69102,69106,69108,69142,69158,69164,69190,69208,69230,69254,69260,69272,69296,69310,69326,69340,69386,69394,69396,69410,69416,69430,69442,69444,69448,69456,69470,69478,69484,69554,69556,69666,69672,69698,69704,69712,69726,69754,69762,69764,69776,69790,69792,69820,69830,69836,69848,69870,69874,69876,69890,69918,69920,69948,69952,70008,70022,70040,70064,70078,70094,70108,70114,70116,70120,70134,70152,70174,70176,70264,70384,70412,70448,70462,70496,70524,70542,70556,70584,70594,70600,70608,70622,70630,70636,70664,70672,70686,70688,70716,70720,70776,70896,71136,71180,71192,71216,71230,71264,71292,71360,71416,71452,71480,71536,71550,71554,71556,71560,71568,71582,71584,71612,71622,71628,71640,71662,71726,71732,71758,71772,71778,71780,71784,71798,71822,71836,71864,71874,71880,71888,71902,71910,71916,71930,71950,71964,71992,72048,72062,72066,72068,72080,72094,72096,72124,72134,72140,72152,72174,72178,72180,72206,72220,72248,72304,72318,72416,72444,72456,72464,72478,72480,72508,72512,72568,72588,72600,72624,72638,72654,72668,72674,72676,72680,72694,72726,72742,72748,72774,72780,72792,72814,72838,72856,72880,72894,72910,72924,72930,72932,72936,72950,72966,72972,72984,73008,73022,73056,73084,73102,73116,73144,73156,73160,73168,73182,73190,73196,73210,73226,73234,73236,73250,73252,73256,73270,73282,73284,73296,73310,73318,73324,73346,73348,73352,73360,73374,73376,73404,73414,73420,73432,73454,73498,73518,73522,73524,73550,73564,73570,73572,73576,73590,73800,73822,73858,73860,73872,73886,73888,73916,73944,73970,73972,73992,74014,74016,74044,74048,74104,74118,74136,74160,74174,74210,74212,74216,74230,74244,74256,74270,74272,74360,74480,74502,74508,74544,74558,74592,74620,74638,74652,74680,74690,74696,74704,74726,74732,74782,74784,74812,74992,75232,75288,75326,75360,75388,75456,75512,75576,75632,75646,75650,75652,75664,75678,75680,75708,75718,75724,75736,75758,75808,75836,75840,75896,76016,76256,76736,76824,76848,76862,76896,76924,76992,77048,77296,77340,77368,77424,77438,77536,77564,77572,77576,77584,77600,77628,77632,77688,77702,77708,77720,77744,77758,77774,77788,77870,77902,77916,77922,77928,77966,77980,78008,78018,78024,78032,78046,78060,78074,78094,78136,78192,78206,78210,78212,78224,78238,78240,78268,78278,78284,78296,78322,78324,78350,78364,78448,78462,78560,78588,78600,78622,78624,78652,78656,78712,78726,78744,78768,78782,78798,78812,78818,78820,78824,78838,78862,78876,78904,78960,78974,79072,79100,79296,79352,79368,79376,79390,79392,79420,79424,79480,79600,79628,79640,79664,79678,79712,79740,79772,79800,79810,79812,79816,79824,79838,79846,79852,79894,79910,79916,79942,79948,79960,79982,79988,80006,80024,80048,80062,80078,80092,80098,80100,80104,80134,80140,80176,80190,80224,80252,80270,80284,80312,80328,80336,80350,80358,80364,80378,80390,80396,80408,80432,80446,80480,80508,80576,80632,80654,80668,80696,80752,80766,80776,80784,80798,80800,80828,80844,80856,80878,80882,80884,80914,80916,80930,80932,80936,80950,80962,80968,80976,80990,80998,81004,81026,81028,81040,81054,81056,81084,81094,81100,81112,81134,81154,81156,81160,81168,81182,81184,81212,81216,81272,81286,81292,81304,81328,81342,81358,81372,81380,81384,81398,81434,81454,81458,81460,81486,81500,81506,81508,81512,81526,81550,81564,81592,81602,81604,81608,81616,81630,81638,81644,81702,81708,81722,81734,81740,81752,81774,81778,81780,82050,82078,82080,82108,82180,82184,82192,82206,82208,82236,82240,82296,82316,82328,82352,82366,82402,82404,82408,82440,82448,82462,82464,82492,82496,82552,82672,82694,82700,82712,82736,82750,82784,82812,82830,82882,82884,82888,82896,82918,82924,82952,82960,82974,82976,83004,83008,83064,83184,83424,83468,83480,83504,83518,83552,83580,83648,83704,83740,83768,83824,83838,83842,83844,83848,83856,83872,83900,83910,83916,83928,83950,83984,84e3,84028,84032,84088,84208,84448,84928,85040,85054,85088,85116,85184,85240,85488,85560,85616,85630,85728,85756,85764,85768,85776,85790,85792,85820,85824,85880,85894,85900,85912,85936,85966,85980,86048,86080,86136,86256,86496,86976,88160,88188,88256,88312,88560,89056,89200,89214,89312,89340,89536,89592,89608,89616,89632,89664,89720,89840,89868,89880,89904,89952,89980,89998,90012,90040,90190,90204,90254,90268,90296,90306,90308,90312,90334,90382,90396,90424,90480,90494,90500,90504,90512,90526,90528,90556,90566,90572,90584,90610,90612,90638,90652,90680,90736,90750,90848,90876,90884,90888,90896,90910,90912,90940,90944,91e3,91014,91020,91032,91056,91070,91086,91100,91106,91108,91112,91126,91150,91164,91192,91248,91262,91360,91388,91584,91640,91664,91678,91680,91708,91712,91768,91888,91928,91952,91966,92e3,92028,92046,92060,92088,92098,92100,92104,92112,92126,92134,92140,92188,92216,92272,92384,92412,92608,92664,93168,93200,93214,93216,93244,93248,93304,93424,93664,93720,93744,93758,93792,93820,93888,93944,93980,94008,94064,94078,94084,94088,94096,94110,94112,94140,94150,94156,94168,94246,94252,94278,94284,94296,94318,94342,94348,94360,94384,94398,94414,94428,94440,94470,94476,94488,94512,94526,94560,94588,94606,94620,94648,94658,94660,94664,94672,94686,94694,94700,94714,94726,94732,94744,94768,94782,94816,94844,94912,94968,94990,95004,95032,95088,95102,95112,95120,95134,95136,95164,95180,95192,95214,95218,95220,95244,95256,95280,95294,95328,95356,95424,95480,95728,95758,95772,95800,95856,95870,95968,95996,96008,96016,96030,96032,96060,96064,96120,96152,96176,96190,96220,96226,96228,96232,96290,96292,96296,96310,96322,96324,96328,96336,96350,96358,96364,96386,96388,96392,96400,96414,96416,96444,96454,96460,96472,96494,96498,96500,96514,96516,96520,96528,96542,96544,96572,96576,96632,96646,96652,96664,96688,96702,96718,96732,96738,96740,96744,96758,96772,96776,96784,96798,96800,96828,96832,96888,97008,97030,97036,97048,97072,97086,97120,97148,97166,97180,97208,97220,97224,97232,97246,97254,97260,97326,97330,97332,97358,97372,97378,97380,97384,97398,97422,97436,97464,97474,97476,97480,97488,97502,97510,97516,97550,97564,97592,97648,97666,97668,97672,97680,97694,97696,97724,97734,97740,97752,97774,97830,97836,97850,97862,97868,97880,97902,97906,97908,97926,97932,97944,97968,97998,98012,98018,98020,98024,98038,98618,98674,98676,98838,98854,98874,98892,98904,98926,98930,98932,98968,99006,99042,99044,99048,99062,99166,99194,99246,99286,99350,99366,99372,99386,99398,99416,99438,99442,99444,99462,99504,99518,99534,99548,99554,99556,99560,99574,99590,99596,99608,99632,99646,99680,99708,99726,99740,99768,99778,99780,99784,99792,99806,99814,99820,99834,99858,99860,99874,99880,99894,99906,99920,99934,99962,99970,99972,99976,99984,99998,1e5,100028,100038,100044,100056,100078,100082,100084,100142,100174,100188,100246,100262,100268,100306,100308,100390,100396,100410,100422,100428,100440,100462,100466,100468,100486,100504,100528,100542,100558,100572,100578,100580,100584,100598,100620,100656,100670,100704,100732,100750,100792,100802,100808,100816,100830,100838,100844,100858,100888,100912,100926,100960,100988,101056,101112,101148,101176,101232,101246,101250,101252,101256,101264,101278,101280,101308,101318,101324,101336,101358,101362,101364,101410,101412,101416,101430,101442,101448,101456,101470,101478,101498,101506,101508,101520,101534,101536,101564,101580,101618,101620,101636,101640,101648,101662,101664,101692,101696,101752,101766,101784,101838,101858,101860,101864,101934,101938,101940,101966,101980,101986,101988,101992,102030,102044,102072,102082,102084,102088,102096,102138,102166,102182,102188,102214,102220,102232,102254,102282,102290,102292,102306,102308,102312,102326,102444,102458,102470,102476,102488,102514,102516,102534,102552,102576,102590,102606,102620,102626,102632,102646,102662,102668,102704,102718,102752,102780,102798,102812,102840,102850,102856,102864,102878,102886,102892,102906,102936,102974,103008,103036,103104,103160,103224,103280,103294,103298,103300,103312,103326,103328,103356,103366,103372,103384,103406,103410,103412,103472,103486,103520,103548,103616,103672,103920,103992,104048,104062,104160,104188,104194,104196,104200,104208,104224,104252,104256,104312,104326,104332,104344,104368,104382,104398,104412,104418,104420,104424,104482,104484,104514,104520,104528,104542,104550,104570,104578,104580,104592,104606,104608,104636,104652,104690,104692,104706,104712,104734,104736,104764,104768,104824,104838,104856,104910,104930,104932,104936,104968,104976,104990,104992,105020,105024,105080,105200,105240,105278,105312,105372,105410,105412,105416,105424,105446,105518,105524,105550,105564,105570,105572,105576,105614,105628,105656,105666,105672,105680,105702,105722,105742,105756,105784,105840,105854,105858,105860,105864,105872,105888,105932,105970,105972,106006,106022,106028,106054,106060,106072,106100,106118,106124,106136,106160,106174,106190,106210,106212,106216,106250,106258,106260,106274,106276,106280,106306,106308,106312,106320,106334,106348,106394,106414,106418,106420,106566,106572,106610,106612,106630,106636,106648,106672,106686,106722,106724,106728,106742,106758,106764,106776,106800,106814,106848,106876,106894,106908,106936,106946,106948,106952,106960,106974,106982,106988,107032,107056,107070,107104,107132,107200,107256,107292,107320,107376,107390,107394,107396,107400,107408,107422,107424,107452,107462,107468,107480,107502,107506,107508,107544,107568,107582,107616,107644,107712,107768,108016,108060,108088,108144,108158,108256,108284,108290,108292,108296,108304,108318,108320,108348,108352,108408,108422,108428,108440,108464,108478,108494,108508,108514,108516,108520,108592,108640,108668,108736,108792,109040,109536,109680,109694,109792,109820,110016,110072,110084,110088,110096,110112,110140,110144,110200,110320,110342,110348,110360,110384,110398,110432,110460,110478,110492,110520,110532,110536,110544,110558,110658,110686,110714,110722,110724,110728,110736,110750,110752,110780,110796,110834,110836,110850,110852,110856,110864,110878,110880,110908,110912,110968,110982,111e3,111054,111074,111076,111080,111108,111112,111120,111134,111136,111164,111168,111224,111344,111372,111422,111456,111516,111554,111556,111560,111568,111590,111632,111646,111648,111676,111680,111736,111856,112096,112152,112224,112252,112320,112440,112514,112516,112520,112528,112542,112544,112588,112686,112718,112732,112782,112796,112824,112834,112836,112840,112848,112870,112890,112910,112924,112952,113008,113022,113026,113028,113032,113040,113054,113056,113100,113138,113140,113166,113180,113208,113264,113278,113376,113404,113416,113424,113440,113468,113472,113560,113614,113634,113636,113640,113686,113702,113708,113734,113740,113752,113778,113780,113798,113804,113816,113840,113854,113870,113890,113892,113896,113926,113932,113944,113968,113982,114016,114044,114076,114114,114116,114120,114128,114150,114170,114194,114196,114210,114212,114216,114242,114244,114248,114256,114270,114278,114306,114308,114312,114320,114334,114336,114364,114380,114420,114458,114478,114482,114484,114510,114524,114530,114532,114536,114842,114866,114868,114970,114994,114996,115042,115044,115048,115062,115130,115226,115250,115252,115278,115292,115298,115300,115304,115318,115342,115394,115396,115400,115408,115422,115430,115436,115450,115478,115494,115514,115526,115532,115570,115572,115738,115758,115762,115764,115790,115804,115810,115812,115816,115830,115854,115868,115896,115906,115912,115920,115934,115942,115948,115962,115996,116024,116080,116094,116098,116100,116104,116112,116126,116128,116156,116166,116172,116184,116206,116210,116212,116246,116262,116268,116282,116294,116300,116312,116334,116338,116340,116358,116364,116376,116400,116414,116430,116444,116450,116452,116456,116498,116500,116514,116520,116534,116546,116548,116552,116560,116574,116582,116588,116602,116654,116694,116714,116762,116782,116786,116788,116814,116828,116834,116836,116840,116854,116878,116892,116920,116930,116936,116944,116958,116966,116972,116986,117006,117048,117104,117118,117122,117124,117136,117150,117152,117180,117190,117196,117208,117230,117234,117236,117304,117360,117374,117472,117500,117506,117508,117512,117520,117536,117564,117568,117624,117638,117644,117656,117680,117694,117710,117724,117730,117732,117736,117750,117782,117798,117804,117818,117830,117848,117874,117876,117894,117936,117950,117966,117986,117988,117992,118022,118028,118040,118064,118078,118112,118140,118172,118210,118212,118216,118224,118238,118246,118266,118306,118312,118338,118352,118366,118374,118394,118402,118404,118408,118416,118430,118432,118460,118476,118514,118516,118574,118578,118580,118606,118620,118626,118628,118632,118678,118694,118700,118730,118738,118740,118830,118834,118836,118862,118876,118882,118884,118888,118902,118926,118940,118968,118978,118980,118984,118992,119006,119014,119020,119034,119068,119096,119152,119166,119170,119172,119176,119184,119198,119200,119228,119238,119244,119256,119278,119282,119284,119324,119352,119408,119422,119520,119548,119554,119556,119560,119568,119582,119584,119612,119616,119672,119686,119692,119704,119728,119742,119758,119772,119778,119780,119784,119798,119920,119934,120032,120060,120256,120312,120324,120328,120336,120352,120384,120440,120560,120582,120588,120600,120624,120638,120672,120700,120718,120732,120760,120770,120772,120776,120784,120798,120806,120812,120870,120876,120890,120902,120908,120920,120946,120948,120966,120972,120984,121008,121022,121038,121058,121060,121064,121078,121100,121112,121136,121150,121184,121212,121244,121282,121284,121288,121296,121318,121338,121356,121368,121392,121406,121440,121468,121536,121592,121656,121730,121732,121736,121744,121758,121760,121804,121842,121844,121890,121922,121924,121928,121936,121950,121958,121978,121986,121988,121992,122e3,122014,122016,122044,122060,122098,122100,122116,122120,122128,122142,122144,122172,122176,122232,122246,122264,122318,122338,122340,122344,122414,122418,122420,122446,122460,122466,122468,122472,122510,122524,122552,122562,122564,122568,122576,122598,122618,122646,122662,122668,122694,122700,122712,122738,122740,122762,122770,122772,122786,122788,122792,123018,123026,123028,123042,123044,123048,123062,123098,123146,123154,123156,123170,123172,123176,123190,123202,123204,123208,123216,123238,123244,123258,123290,123314,123316,123402,123410,123412,123426,123428,123432,123446,123458,123464,123472,123486,123494,123500,123514,123522,123524,123528,123536,123552,123580,123590,123596,123608,123630,123634,123636,123674,123698,123700,123740,123746,123748,123752,123834,123914,123922,123924,123938,123944,123958,123970,123976,123984,123998,124006,124012,124026,124034,124036,124048,124062,124064,124092,124102,124108,124120,124142,124146,124148,124162,124164,124168,124176,124190,124192,124220,124224,124280,124294,124300,124312,124336,124350,124366,124380,124386,124388,124392,124406,124442,124462,124466,124468,124494,124508,124514,124520,124558,124572,124600,124610,124612,124616,124624,124646,124666,124694,124710,124716,124730,124742,124748,124760,124786,124788,124818,124820,124834,124836,124840,124854,124946,124948,124962,124964,124968,124982,124994,124996,125e3,125008,125022,125030,125036,125050,125058,125060,125064,125072,125086,125088,125116,125126,125132,125144,125166,125170,125172,125186,125188,125192,125200,125216,125244,125248,125304,125318,125324,125336,125360,125374,125390,125404,125410,125412,125416,125430,125444,125448,125456,125472,125504,125560,125680,125702,125708,125720,125744,125758,125792,125820,125838,125852,125880,125890,125892,125896,125904,125918,125926,125932,125978,125998,126002,126004,126030,126044,126050,126052,126056,126094,126108,126136,126146,126148,126152,126160,126182,126202,126222,126236,126264,126320,126334,126338,126340,126344,126352,126366,126368,126412,126450,126452,126486,126502,126508,126522,126534,126540,126552,126574,126578,126580,126598,126604,126616,126640,126654,126670,126684,126690,126692,126696,126738,126754,126756,126760,126774,126786,126788,126792,126800,126814,126822,126828,126842,126894,126898,126900,126934,127126,127142,127148,127162,127178,127186,127188,127254,127270,127276,127290,127302,127308,127320,127342,127346,127348,127370,127378,127380,127394,127396,127400,127450,127510,127526,127532,127546,127558,127576,127598,127602,127604,127622,127628,127640,127664,127678,127694,127708,127714,127716,127720,127734,127754,127762,127764,127778,127784,127810,127812,127816,127824,127838,127846,127866,127898,127918,127922,127924,128022,128038,128044,128058,128070,128076,128088,128110,128114,128116,128134,128140,128152,128176,128190,128206,128220,128226,128228,128232,128246,128262,128268,128280,128304,128318,128352,128380,128398,128412,128440,128450,128452,128456,128464,128478,128486,128492,128506,128522,128530,128532,128546,128548,128552,128566,128578,128580,128584,128592,128606,128614,128634,128642,128644,128648,128656,128670,128672,128700,128716,128754,128756,128794,128814,128818,128820,128846,128860,128866,128868,128872,128886,128918,128934,128940,128954,128978,128980,129178,129198,129202,129204,129238,129258,129306,129326,129330,129332,129358,129372,129378,129380,129384,129398,129430,129446,129452,129466,129482,129490,129492,129562,129582,129586,129588,129614,129628,129634,129636,129640,129654,129678,129692,129720,129730,129732,129736,129744,129758,129766,129772,129814,129830,129836,129850,129862,129868,129880,129902,129906,129908,129930,129938,129940,129954,129956,129960,129974,130010]),ee.CODEWORD_TABLE=Int32Array.from([2627,1819,2622,2621,1813,1812,2729,2724,2723,2779,2774,2773,902,896,908,868,865,861,859,2511,873,871,1780,835,2493,825,2491,842,837,844,1764,1762,811,810,809,2483,807,2482,806,2480,815,814,813,812,2484,817,816,1745,1744,1742,1746,2655,2637,2635,2626,2625,2623,2628,1820,2752,2739,2737,2728,2727,2725,2730,2785,2783,2778,2777,2775,2780,787,781,747,739,736,2413,754,752,1719,692,689,681,2371,678,2369,700,697,694,703,1688,1686,642,638,2343,631,2341,627,2338,651,646,643,2345,654,652,1652,1650,1647,1654,601,599,2322,596,2321,594,2319,2317,611,610,608,606,2324,603,2323,615,614,612,1617,1616,1614,1612,616,1619,1618,2575,2538,2536,905,901,898,909,2509,2507,2504,870,867,864,860,2512,875,872,1781,2490,2489,2487,2485,1748,836,834,832,830,2494,827,2492,843,841,839,845,1765,1763,2701,2676,2674,2653,2648,2656,2634,2633,2631,2629,1821,2638,2636,2770,2763,2761,2750,2745,2753,2736,2735,2733,2731,1848,2740,2738,2786,2784,591,588,576,569,566,2296,1590,537,534,526,2276,522,2274,545,542,539,548,1572,1570,481,2245,466,2242,462,2239,492,485,482,2249,496,494,1534,1531,1528,1538,413,2196,406,2191,2188,425,419,2202,415,2199,432,430,427,1472,1467,1464,433,1476,1474,368,367,2160,365,2159,362,2157,2155,2152,378,377,375,2166,372,2165,369,2162,383,381,379,2168,1419,1418,1416,1414,385,1411,384,1423,1422,1420,1424,2461,802,2441,2439,790,786,783,794,2409,2406,2403,750,742,738,2414,756,753,1720,2367,2365,2362,2359,1663,693,691,684,2373,680,2370,702,699,696,704,1690,1687,2337,2336,2334,2332,1624,2329,1622,640,637,2344,634,2342,630,2340,650,648,645,2346,655,653,1653,1651,1649,1655,2612,2597,2595,2571,2568,2565,2576,2534,2529,2526,1787,2540,2537,907,904,900,910,2503,2502,2500,2498,1768,2495,1767,2510,2508,2506,869,866,863,2513,876,874,1782,2720,2713,2711,2697,2694,2691,2702,2672,2670,2664,1828,2678,2675,2647,2646,2644,2642,1823,2639,1822,2654,2652,2650,2657,2771,1855,2765,2762,1850,1849,2751,2749,2747,2754,353,2148,344,342,336,2142,332,2140,345,1375,1373,306,2130,299,2128,295,2125,319,314,311,2132,1354,1352,1349,1356,262,257,2101,253,2096,2093,274,273,267,2107,263,2104,280,278,275,1316,1311,1308,1320,1318,2052,202,2050,2044,2040,219,2063,212,2060,208,2055,224,221,2066,1260,1258,1252,231,1248,229,1266,1264,1261,1268,155,1998,153,1996,1994,1991,1988,165,164,2007,162,2006,159,2003,2e3,172,171,169,2012,166,2010,1186,1184,1182,1179,175,1176,173,1192,1191,1189,1187,176,1194,1193,2313,2307,2305,592,589,2294,2292,2289,578,572,568,2297,580,1591,2272,2267,2264,1547,538,536,529,2278,525,2275,547,544,541,1574,1571,2237,2235,2229,1493,2225,1489,478,2247,470,2244,465,2241,493,488,484,2250,498,495,1536,1533,1530,1539,2187,2186,2184,2182,1432,2179,1430,2176,1427,414,412,2197,409,2195,405,2193,2190,426,424,421,2203,418,2201,431,429,1473,1471,1469,1466,434,1477,1475,2478,2472,2470,2459,2457,2454,2462,803,2437,2432,2429,1726,2443,2440,792,789,785,2401,2399,2393,1702,2389,1699,2411,2408,2405,745,741,2415,758,755,1721,2358,2357,2355,2353,1661,2350,1660,2347,1657,2368,2366,2364,2361,1666,690,687,2374,683,2372,701,698,705,1691,1689,2619,2617,2610,2608,2605,2613,2593,2588,2585,1803,2599,2596,2563,2561,2555,1797,2551,1795,2573,2570,2567,2577,2525,2524,2522,2520,1786,2517,1785,2514,1783,2535,2533,2531,2528,1788,2541,2539,906,903,911,2721,1844,2715,2712,1838,1836,2699,2696,2693,2703,1827,1826,1824,2673,2671,2669,2666,1829,2679,2677,1858,1857,2772,1854,1853,1851,1856,2766,2764,143,1987,139,1986,135,133,131,1984,128,1983,125,1981,138,137,136,1985,1133,1132,1130,112,110,1974,107,1973,104,1971,1969,122,121,119,117,1977,114,1976,124,1115,1114,1112,1110,1117,1116,84,83,1953,81,1952,78,1950,1948,1945,94,93,91,1959,88,1958,85,1955,99,97,95,1961,1086,1085,1083,1081,1078,100,1090,1089,1087,1091,49,47,1917,44,1915,1913,1910,1907,59,1926,56,1925,53,1922,1919,66,64,1931,61,1929,1042,1040,1038,71,1035,70,1032,68,1048,1047,1045,1043,1050,1049,12,10,1869,1867,1864,1861,21,1880,19,1877,1874,1871,28,1888,25,1886,22,1883,982,980,977,974,32,30,991,989,987,984,34,995,994,992,2151,2150,2147,2146,2144,356,355,354,2149,2139,2138,2136,2134,1359,343,341,338,2143,335,2141,348,347,346,1376,1374,2124,2123,2121,2119,1326,2116,1324,310,308,305,2131,302,2129,298,2127,320,318,316,313,2133,322,321,1355,1353,1351,1357,2092,2091,2089,2087,1276,2084,1274,2081,1271,259,2102,256,2100,252,2098,2095,272,269,2108,266,2106,281,279,277,1317,1315,1313,1310,282,1321,1319,2039,2037,2035,2032,1203,2029,1200,1197,207,2053,205,2051,201,2049,2046,2043,220,218,2064,215,2062,211,2059,228,226,223,2069,1259,1257,1254,232,1251,230,1267,1265,1263,2316,2315,2312,2311,2309,2314,2304,2303,2301,2299,1593,2308,2306,590,2288,2287,2285,2283,1578,2280,1577,2295,2293,2291,579,577,574,571,2298,582,581,1592,2263,2262,2260,2258,1545,2255,1544,2252,1541,2273,2271,2269,2266,1550,535,532,2279,528,2277,546,543,549,1575,1573,2224,2222,2220,1486,2217,1485,2214,1482,1479,2238,2236,2234,2231,1496,2228,1492,480,477,2248,473,2246,469,2243,490,487,2251,497,1537,1535,1532,2477,2476,2474,2479,2469,2468,2466,2464,1730,2473,2471,2453,2452,2450,2448,1729,2445,1728,2460,2458,2456,2463,805,804,2428,2427,2425,2423,1725,2420,1724,2417,1722,2438,2436,2434,2431,1727,2444,2442,793,791,788,795,2388,2386,2384,1697,2381,1696,2378,1694,1692,2402,2400,2398,2395,1703,2392,1701,2412,2410,2407,751,748,744,2416,759,757,1807,2620,2618,1806,1805,2611,2609,2607,2614,1802,1801,1799,2594,2592,2590,2587,1804,2600,2598,1794,1793,1791,1789,2564,2562,2560,2557,1798,2554,1796,2574,2572,2569,2578,1847,1846,2722,1843,1842,1840,1845,2716,2714,1835,1834,1832,1830,1839,1837,2700,2698,2695,2704,1817,1811,1810,897,862,1777,829,826,838,1760,1758,808,2481,1741,1740,1738,1743,2624,1818,2726,2776,782,740,737,1715,686,679,695,1682,1680,639,628,2339,647,644,1645,1643,1640,1648,602,600,597,595,2320,593,2318,609,607,604,1611,1610,1608,1606,613,1615,1613,2328,926,924,892,886,899,857,850,2505,1778,824,823,821,819,2488,818,2486,833,831,828,840,1761,1759,2649,2632,2630,2746,2734,2732,2782,2781,570,567,1587,531,527,523,540,1566,1564,476,467,463,2240,486,483,1524,1521,1518,1529,411,403,2192,399,2189,423,416,1462,1457,1454,428,1468,1465,2210,366,363,2158,360,2156,357,2153,376,373,370,2163,1410,1409,1407,1405,382,1402,380,1417,1415,1412,1421,2175,2174,777,774,771,784,732,725,722,2404,743,1716,676,674,668,2363,665,2360,685,1684,1681,626,624,622,2335,620,2333,617,2330,641,635,649,1646,1644,1642,2566,928,925,2530,2527,894,891,888,2501,2499,2496,858,856,854,851,1779,2692,2668,2665,2645,2643,2640,2651,2768,2759,2757,2744,2743,2741,2748,352,1382,340,337,333,1371,1369,307,300,296,2126,315,312,1347,1342,1350,261,258,250,2097,246,2094,271,268,264,1306,1301,1298,276,1312,1309,2115,203,2048,195,2045,191,2041,213,209,2056,1246,1244,1238,225,1234,222,1256,1253,1249,1262,2080,2079,154,1997,150,1995,147,1992,1989,163,160,2004,156,2001,1175,1174,1172,1170,1167,170,1164,167,1185,1183,1180,1177,174,1190,1188,2025,2024,2022,587,586,564,559,556,2290,573,1588,520,518,512,2268,508,2265,530,1568,1565,461,457,2233,450,2230,446,2226,479,471,489,1526,1523,1520,397,395,2185,392,2183,389,2180,2177,410,2194,402,422,1463,1461,1459,1456,1470,2455,799,2433,2430,779,776,773,2397,2394,2390,734,728,724,746,1717,2356,2354,2351,2348,1658,677,675,673,670,667,688,1685,1683,2606,2589,2586,2559,2556,2552,927,2523,2521,2518,2515,1784,2532,895,893,890,2718,2709,2707,2689,2687,2684,2663,2662,2660,2658,1825,2667,2769,1852,2760,2758,142,141,1139,1138,134,132,129,126,1982,1129,1128,1126,1131,113,111,108,105,1972,101,1970,120,118,115,1109,1108,1106,1104,123,1113,1111,82,79,1951,75,1949,72,1946,92,89,86,1956,1077,1076,1074,1072,98,1069,96,1084,1082,1079,1088,1968,1967,48,45,1916,42,1914,39,1911,1908,60,57,54,1923,50,1920,1031,1030,1028,1026,67,1023,65,1020,62,1041,1039,1036,1033,69,1046,1044,1944,1943,1941,11,9,1868,7,1865,1862,1859,20,1878,16,1875,13,1872,970,968,966,963,29,960,26,23,983,981,978,975,33,971,31,990,988,985,1906,1904,1902,993,351,2145,1383,331,330,328,326,2137,323,2135,339,1372,1370,294,293,291,289,2122,286,2120,283,2117,309,303,317,1348,1346,1344,245,244,242,2090,239,2088,236,2085,2082,260,2099,249,270,1307,1305,1303,1300,1314,189,2038,186,2036,183,2033,2030,2026,206,198,2047,194,216,1247,1245,1243,1240,227,1237,1255,2310,2302,2300,2286,2284,2281,565,563,561,558,575,1589,2261,2259,2256,2253,1542,521,519,517,514,2270,511,533,1569,1567,2223,2221,2218,2215,1483,2211,1480,459,456,453,2232,449,474,491,1527,1525,1522,2475,2467,2465,2451,2449,2446,801,800,2426,2424,2421,2418,1723,2435,780,778,775,2387,2385,2382,2379,1695,2375,1693,2396,735,733,730,727,749,1718,2616,2615,2604,2603,2601,2584,2583,2581,2579,1800,2591,2550,2549,2547,2545,1792,2542,1790,2558,929,2719,1841,2710,2708,1833,1831,2690,2688,2686,1815,1809,1808,1774,1756,1754,1737,1736,1734,1739,1816,1711,1676,1674,633,629,1638,1636,1633,1641,598,1605,1604,1602,1600,605,1609,1607,2327,887,853,1775,822,820,1757,1755,1584,524,1560,1558,468,464,1514,1511,1508,1519,408,404,400,1452,1447,1444,417,1458,1455,2208,364,361,358,2154,1401,1400,1398,1396,374,1393,371,1408,1406,1403,1413,2173,2172,772,726,723,1712,672,669,666,682,1678,1675,625,623,621,618,2331,636,632,1639,1637,1635,920,918,884,880,889,849,848,847,846,2497,855,852,1776,2641,2742,2787,1380,334,1367,1365,301,297,1340,1338,1335,1343,255,251,247,1296,1291,1288,265,1302,1299,2113,204,196,192,2042,1232,1230,1224,214,1220,210,1242,1239,1235,1250,2077,2075,151,148,1993,144,1990,1163,1162,1160,1158,1155,161,1152,157,1173,1171,1168,1165,168,1181,1178,2021,2020,2018,2023,585,560,557,1585,516,509,1562,1559,458,447,2227,472,1516,1513,1510,398,396,393,390,2181,386,2178,407,1453,1451,1449,1446,420,1460,2209,769,764,720,712,2391,729,1713,664,663,661,659,2352,656,2349,671,1679,1677,2553,922,919,2519,2516,885,883,881,2685,2661,2659,2767,2756,2755,140,1137,1136,130,127,1125,1124,1122,1127,109,106,102,1103,1102,1100,1098,116,1107,1105,1980,80,76,73,1947,1068,1067,1065,1063,90,1060,87,1075,1073,1070,1080,1966,1965,46,43,40,1912,36,1909,1019,1018,1016,1014,58,1011,55,1008,51,1029,1027,1024,1021,63,1037,1034,1940,1939,1937,1942,8,1866,4,1863,1,1860,956,954,952,949,946,17,14,969,967,964,961,27,957,24,979,976,972,1901,1900,1898,1896,986,1905,1903,350,349,1381,329,327,324,1368,1366,292,290,287,284,2118,304,1341,1339,1337,1345,243,240,237,2086,233,2083,254,1297,1295,1293,1290,1304,2114,190,187,184,2034,180,2031,177,2027,199,1233,1231,1229,1226,217,1223,1241,2078,2076,584,555,554,552,550,2282,562,1586,507,506,504,502,2257,499,2254,515,1563,1561,445,443,441,2219,438,2216,435,2212,460,454,475,1517,1515,1512,2447,798,797,2422,2419,770,768,766,2383,2380,2376,721,719,717,714,731,1714,2602,2582,2580,2548,2546,2543,923,921,2717,2706,2705,2683,2682,2680,1771,1752,1750,1733,1732,1731,1735,1814,1707,1670,1668,1631,1629,1626,1634,1599,1598,1596,1594,1603,1601,2326,1772,1753,1751,1581,1554,1552,1504,1501,1498,1509,1442,1437,1434,401,1448,1445,2206,1392,1391,1389,1387,1384,359,1399,1397,1394,1404,2171,2170,1708,1672,1669,619,1632,1630,1628,1773,1378,1363,1361,1333,1328,1336,1286,1281,1278,248,1292,1289,2111,1218,1216,1210,197,1206,193,1228,1225,1221,1236,2073,2071,1151,1150,1148,1146,152,1143,149,1140,145,1161,1159,1156,1153,158,1169,1166,2017,2016,2014,2019,1582,510,1556,1553,452,448,1506,1500,394,391,387,1443,1441,1439,1436,1450,2207,765,716,713,1709,662,660,657,1673,1671,916,914,879,878,877,882,1135,1134,1121,1120,1118,1123,1097,1096,1094,1092,103,1101,1099,1979,1059,1058,1056,1054,77,1051,74,1066,1064,1061,1071,1964,1963,1007,1006,1004,1002,999,41,996,37,1017,1015,1012,1009,52,1025,1022,1936,1935,1933,1938,942,940,938,935,932,5,2,955,953,950,947,18,943,15,965,962,958,1895,1894,1892,1890,973,1899,1897,1379,325,1364,1362,288,285,1334,1332,1330,241,238,234,1287,1285,1283,1280,1294,2112,188,185,181,178,2028,1219,1217,1215,1212,200,1209,1227,2074,2072,583,553,551,1583,505,503,500,513,1557,1555,444,442,439,436,2213,455,451,1507,1505,1502,796,763,762,760,767,711,710,708,706,2377,718,715,1710,2544,917,915,2681,1627,1597,1595,2325,1769,1749,1747,1499,1438,1435,2204,1390,1388,1385,1395,2169,2167,1704,1665,1662,1625,1623,1620,1770,1329,1282,1279,2109,1214,1207,1222,2068,2065,1149,1147,1144,1141,146,1157,1154,2013,2011,2008,2015,1579,1549,1546,1495,1487,1433,1431,1428,1425,388,1440,2205,1705,658,1667,1664,1119,1095,1093,1978,1057,1055,1052,1062,1962,1960,1005,1003,1e3,997,38,1013,1010,1932,1930,1927,1934,941,939,936,933,6,930,3,951,948,944,1889,1887,1884,1881,959,1893,1891,35,1377,1360,1358,1327,1325,1322,1331,1277,1275,1272,1269,235,1284,2110,1205,1204,1201,1198,182,1195,179,1213,2070,2067,1580,501,1551,1548,440,437,1497,1494,1490,1503,761,709,707,1706,913,912,2198,1386,2164,2161,1621,1766,2103,1208,2058,2054,1145,1142,2005,2002,1999,2009,1488,1429,1426,2200,1698,1659,1656,1975,1053,1957,1954,1001,998,1924,1921,1918,1928,937,934,931,1879,1876,1873,1870,945,1885,1882,1323,1273,1270,2105,1202,1199,1196,1211,2061,2057,1576,1543,1540,1484,1481,1478,1491,1700]);class Jo{constructor(e,t){this.bits=e,this.points=t}getBits(){return this.bits}getPoints(){return this.points}}class oe{static detectMultiple(e,t,i){let r=e.getBlackMatrix(),s=oe.detect(i,r);return s.length||(r=r.clone(),r.rotate180(),s=oe.detect(i,r)),new Jo(r,s)}static detect(e,t){const i=new Array;let r=0,s=0,o=!1;for(;r<t.getHeight();){const c=oe.findVertices(t,r,s);if(c[0]==null&&c[3]==null){if(!o)break;o=!1,s=0;for(const h of i)h[1]!=null&&(r=Math.trunc(Math.max(r,h[1].getY()))),h[3]!=null&&(r=Math.max(r,Math.trunc(h[3].getY())));r+=oe.ROW_STEP;continue}if(o=!0,i.push(c),!e)break;c[2]!=null?(s=Math.trunc(c[2].getX()),r=Math.trunc(c[2].getY())):(s=Math.trunc(c[4].getX()),r=Math.trunc(c[4].getY()))}return i}static findVertices(e,t,i){const r=e.getHeight(),s=e.getWidth(),o=new Array(8);return oe.copyToResult(o,oe.findRowsWithPattern(e,r,s,t,i,oe.START_PATTERN),oe.INDEXES_START_PATTERN),o[4]!=null&&(i=Math.trunc(o[4].getX()),t=Math.trunc(o[4].getY())),oe.copyToResult(o,oe.findRowsWithPattern(e,r,s,t,i,oe.STOP_PATTERN),oe.INDEXES_STOP_PATTERN),o}static copyToResult(e,t,i){for(let r=0;r<i.length;r++)e[i[r]]=t[r]}static findRowsWithPattern(e,t,i,r,s,o){const c=new Array(4);let h=!1;const f=new Int32Array(o.length);for(;r<t;r+=oe.ROW_STEP){let w=oe.findGuardPattern(e,s,r,i,!1,o,f);if(w!=null){for(;r>0;){const b=oe.findGuardPattern(e,s,--r,i,!1,o,f);if(b!=null)w=b;else{r++;break}}c[0]=new j(w[0],r),c[1]=new j(w[1],r),h=!0;break}}let p=r+1;if(h){let w=0,b=Int32Array.from([Math.trunc(c[0].getX()),Math.trunc(c[1].getX())]);for(;p<t;p++){const y=oe.findGuardPattern(e,b[0],p,i,!1,o,f);if(y!=null&&Math.abs(b[0]-y[0])<oe.MAX_PATTERN_DRIFT&&Math.abs(b[1]-y[1])<oe.MAX_PATTERN_DRIFT)b=y,w=0;else{if(w>oe.SKIPPED_ROW_COUNT_MAX)break;w++}}p-=w+1,c[2]=new j(b[0],p),c[3]=new j(b[1],p)}return p-r<oe.BARCODE_MIN_HEIGHT&&le.fill(c,null),c}static findGuardPattern(e,t,i,r,s,o,c){le.fillWithin(c,0,c.length,0);let h=t,f=0;for(;e.get(h,i)&&h>0&&f++<oe.MAX_PIXEL_DRIFT;)h--;let p=h,w=0,b=o.length;for(let y=s;p<r;p++)if(e.get(p,i)!==y)c[w]++;else{if(w===b-1){if(oe.patternMatchVariance(c,o,oe.MAX_INDIVIDUAL_VARIANCE)<oe.MAX_AVG_VARIANCE)return new Int32Array([h,p]);h+=c[0]+c[1],te.arraycopy(c,2,c,0,w-1),c[w-1]=0,c[w]=0,w--}else w++;c[w]=1,y=!y}return w===b-1&&oe.patternMatchVariance(c,o,oe.MAX_INDIVIDUAL_VARIANCE)<oe.MAX_AVG_VARIANCE?new Int32Array([h,p-1]):null}static patternMatchVariance(e,t,i){let r=e.length,s=0,o=0;for(let f=0;f<r;f++)s+=e[f],o+=t[f];if(s<o)return 1/0;let c=s/o;i*=c;let h=0;for(let f=0;f<r;f++){let p=e[f],w=t[f]*c,b=p>w?p-w:w-p;if(b>i)return 1/0;h+=b}return h/s}}oe.INDEXES_START_PATTERN=Int32Array.from([0,4,1,5]),oe.INDEXES_STOP_PATTERN=Int32Array.from([6,2,7,3]),oe.MAX_AVG_VARIANCE=.42,oe.MAX_INDIVIDUAL_VARIANCE=.8,oe.START_PATTERN=Int32Array.from([8,1,1,1,1,1,1,3]),oe.STOP_PATTERN=Int32Array.from([7,1,1,3,1,1,1,2,1]),oe.MAX_PIXEL_DRIFT=3,oe.MAX_PATTERN_DRIFT=5,oe.SKIPPED_ROW_COUNT_MAX=25,oe.ROW_STEP=5,oe.BARCODE_MIN_HEIGHT=10;class it{constructor(e,t){if(t.length===0)throw new I;this.field=e;let i=t.length;if(i>1&&t[0]===0){let r=1;for(;r<i&&t[r]===0;)r++;r===i?this.coefficients=new Int32Array([0]):(this.coefficients=new Int32Array(i-r),te.arraycopy(t,r,this.coefficients,0,this.coefficients.length))}else this.coefficients=t}getCoefficients(){return this.coefficients}getDegree(){return this.coefficients.length-1}isZero(){return this.coefficients[0]===0}getCoefficient(e){return this.coefficients[this.coefficients.length-1-e]}evaluateAt(e){if(e===0)return this.getCoefficient(0);if(e===1){let r=0;for(let s of this.coefficients)r=this.field.add(r,s);return r}let t=this.coefficients[0],i=this.coefficients.length;for(let r=1;r<i;r++)t=this.field.add(this.field.multiply(e,t),this.coefficients[r]);return t}add(e){if(!this.field.equals(e.field))throw new I("ModulusPolys do not have same ModulusGF field");if(this.isZero())return e;if(e.isZero())return this;let t=this.coefficients,i=e.coefficients;if(t.length>i.length){let o=t;t=i,i=o}let r=new Int32Array(i.length),s=i.length-t.length;te.arraycopy(i,0,r,0,s);for(let o=s;o<i.length;o++)r[o]=this.field.add(t[o-s],i[o]);return new it(this.field,r)}subtract(e){if(!this.field.equals(e.field))throw new I("ModulusPolys do not have same ModulusGF field");return e.isZero()?this:this.add(e.negative())}multiply(e){return e instanceof it?this.multiplyOther(e):this.multiplyScalar(e)}multiplyOther(e){if(!this.field.equals(e.field))throw new I("ModulusPolys do not have same ModulusGF field");if(this.isZero()||e.isZero())return new it(this.field,new Int32Array([0]));let t=this.coefficients,i=t.length,r=e.coefficients,s=r.length,o=new Int32Array(i+s-1);for(let c=0;c<i;c++){let h=t[c];for(let f=0;f<s;f++)o[c+f]=this.field.add(o[c+f],this.field.multiply(h,r[f]))}return new it(this.field,o)}negative(){let e=this.coefficients.length,t=new Int32Array(e);for(let i=0;i<e;i++)t[i]=this.field.subtract(0,this.coefficients[i]);return new it(this.field,t)}multiplyScalar(e){if(e===0)return new it(this.field,new Int32Array([0]));if(e===1)return this;let t=this.coefficients.length,i=new Int32Array(t);for(let r=0;r<t;r++)i[r]=this.field.multiply(this.coefficients[r],e);return new it(this.field,i)}multiplyByMonomial(e,t){if(e<0)throw new I;if(t===0)return new it(this.field,new Int32Array([0]));let i=this.coefficients.length,r=new Int32Array(i+e);for(let s=0;s<i;s++)r[s]=this.field.multiply(this.coefficients[s],t);return new it(this.field,r)}toString(){let e=new se;for(let t=this.getDegree();t>=0;t--){let i=this.getCoefficient(t);i!==0&&(i<0?(e.append(" - "),i=-i):e.length()>0&&e.append(" + "),(t===0||i!==1)&&e.append(i),t!==0&&(t===1?e.append("x"):(e.append("x^"),e.append(t))))}return e.toString()}}class el{add(e,t){return(e+t)%this.modulus}subtract(e,t){return(this.modulus+e-t)%this.modulus}exp(e){return this.expTable[e]}log(e){if(e===0)throw new I;return this.logTable[e]}inverse(e){if(e===0)throw new zr;return this.expTable[this.modulus-this.logTable[e]-1]}multiply(e,t){return e===0||t===0?0:this.expTable[(this.logTable[e]+this.logTable[t])%(this.modulus-1)]}getSize(){return this.modulus}equals(e){return e===this}}class Pn extends el{constructor(e,t){super(),this.modulus=e,this.expTable=new Int32Array(e),this.logTable=new Int32Array(e);let i=1;for(let r=0;r<e;r++)this.expTable[r]=i,i=i*t%e;for(let r=0;r<e-1;r++)this.logTable[this.expTable[r]]=r;this.zero=new it(this,new Int32Array([0])),this.one=new it(this,new Int32Array([1]))}getZero(){return this.zero}getOne(){return this.one}buildMonomial(e,t){if(e<0)throw new I;if(t===0)return this.zero;let i=new Int32Array(e+1);return i[0]=t,new it(this,i)}}Pn.PDF417_GF=new Pn(ee.NUMBER_OF_CODEWORDS,3);class js{constructor(){this.field=Pn.PDF417_GF}decode(e,t,i){let r=new it(this.field,e),s=new Int32Array(t),o=!1;for(let E=t;E>0;E--){let S=r.evaluateAt(this.field.exp(E));s[t-E]=S,S!==0&&(o=!0)}if(!o)return 0;let c=this.field.getOne();if(i!=null)for(const E of i){let S=this.field.exp(e.length-1-E),T=new it(this.field,new Int32Array([this.field.subtract(0,S),1]));c=c.multiply(T)}let h=new it(this.field,s),f=this.runEuclideanAlgorithm(this.field.buildMonomial(t,1),h,t),p=f[0],w=f[1],b=this.findErrorLocations(p),y=this.findErrorMagnitudes(w,p,b);for(let E=0;E<b.length;E++){let S=e.length-1-this.field.log(b[E]);if(S<0)throw X.getChecksumInstance();e[S]=this.field.subtract(e[S],y[E])}return b.length}runEuclideanAlgorithm(e,t,i){if(e.getDegree()<t.getDegree()){let b=e;e=t,t=b}let r=e,s=t,o=this.field.getZero(),c=this.field.getOne();for(;s.getDegree()>=Math.round(i/2);){let b=r,y=o;if(r=s,o=c,r.isZero())throw X.getChecksumInstance();s=b;let E=this.field.getZero(),S=r.getCoefficient(r.getDegree()),T=this.field.inverse(S);for(;s.getDegree()>=r.getDegree()&&!s.isZero();){let R=s.getDegree()-r.getDegree(),F=this.field.multiply(s.getCoefficient(s.getDegree()),T);E=E.add(this.field.buildMonomial(R,F)),s=s.subtract(r.multiplyByMonomial(R,F))}c=E.multiply(o).subtract(y).negative()}let h=c.getCoefficient(0);if(h===0)throw X.getChecksumInstance();let f=this.field.inverse(h),p=c.multiply(f),w=s.multiply(f);return[p,w]}findErrorLocations(e){let t=e.getDegree(),i=new Int32Array(t),r=0;for(let s=1;s<this.field.getSize()&&r<t;s++)e.evaluateAt(s)===0&&(i[r]=this.field.inverse(s),r++);if(r!==t)throw X.getChecksumInstance();return i}findErrorMagnitudes(e,t,i){let r=t.getDegree(),s=new Int32Array(r);for(let f=1;f<=r;f++)s[r-f]=this.field.multiply(f,t.getCoefficient(f));let o=new it(this.field,s),c=i.length,h=new Int32Array(c);for(let f=0;f<c;f++){let p=this.field.inverse(i[f]),w=this.field.subtract(0,e.evaluateAt(p)),b=this.field.inverse(o.evaluateAt(p));h[f]=this.field.multiply(w,b)}return h}}class Ai{constructor(e,t,i,r,s){e instanceof Ai?this.constructor_2(e):this.constructor_1(e,t,i,r,s)}constructor_1(e,t,i,r,s){const o=t==null||i==null,c=r==null||s==null;if(o&&c)throw new D;o?(t=new j(0,r.getY()),i=new j(0,s.getY())):c&&(r=new j(e.getWidth()-1,t.getY()),s=new j(e.getWidth()-1,i.getY())),this.image=e,this.topLeft=t,this.bottomLeft=i,this.topRight=r,this.bottomRight=s,this.minX=Math.trunc(Math.min(t.getX(),i.getX())),this.maxX=Math.trunc(Math.max(r.getX(),s.getX())),this.minY=Math.trunc(Math.min(t.getY(),r.getY())),this.maxY=Math.trunc(Math.max(i.getY(),s.getY()))}constructor_2(e){this.image=e.image,this.topLeft=e.getTopLeft(),this.bottomLeft=e.getBottomLeft(),this.topRight=e.getTopRight(),this.bottomRight=e.getBottomRight(),this.minX=e.getMinX(),this.maxX=e.getMaxX(),this.minY=e.getMinY(),this.maxY=e.getMaxY()}static merge(e,t){return e==null?t:t==null?e:new Ai(e.image,e.topLeft,e.bottomLeft,t.topRight,t.bottomRight)}addMissingRows(e,t,i){let r=this.topLeft,s=this.bottomLeft,o=this.topRight,c=this.bottomRight;if(e>0){let h=i?this.topLeft:this.topRight,f=Math.trunc(h.getY()-e);f<0&&(f=0);let p=new j(h.getX(),f);i?r=p:o=p}if(t>0){let h=i?this.bottomLeft:this.bottomRight,f=Math.trunc(h.getY()+t);f>=this.image.getHeight()&&(f=this.image.getHeight()-1);let p=new j(h.getX(),f);i?s=p:c=p}return new Ai(this.image,r,s,o,c)}getMinX(){return this.minX}getMaxX(){return this.maxX}getMinY(){return this.minY}getMaxY(){return this.maxY}getTopLeft(){return this.topLeft}getTopRight(){return this.topRight}getBottomLeft(){return this.bottomLeft}getBottomRight(){return this.bottomRight}}class tl{constructor(e,t,i,r){this.columnCount=e,this.errorCorrectionLevel=r,this.rowCountUpperPart=t,this.rowCountLowerPart=i,this.rowCount=t+i}getColumnCount(){return this.columnCount}getErrorCorrectionLevel(){return this.errorCorrectionLevel}getRowCount(){return this.rowCount}getRowCountUpperPart(){return this.rowCountUpperPart}getRowCountLowerPart(){return this.rowCountLowerPart}}class mr{constructor(){this.buffer=""}static form(e,t){let i=-1;function r(o,c,h,f,p,w){if(o==="%%")return"%";if(t[++i]===void 0)return;o=f?parseInt(f.substr(1)):void 0;let b=p?parseInt(p.substr(1)):void 0,y;switch(w){case"s":y=t[i];break;case"c":y=t[i][0];break;case"f":y=parseFloat(t[i]).toFixed(o);break;case"p":y=parseFloat(t[i]).toPrecision(o);break;case"e":y=parseFloat(t[i]).toExponential(o);break;case"x":y=parseInt(t[i]).toString(b||16);break;case"d":y=parseFloat(parseInt(t[i],b||10).toPrecision(o)).toFixed(0);break}y=typeof y=="object"?JSON.stringify(y):(+y).toString(b);let E=parseInt(h),S=h&&h[0]+""=="0"?"0":" ";for(;y.length<E;)y=c!==void 0?y+S:S+y;return y}let s=/%(-)?(0?[0-9]+)?([.][0-9]+)?([#][0-9]+)?([scfpexd%])/g;return e.replace(s,r)}format(e,...t){this.buffer+=mr.form(e,t)}toString(){return this.buffer}}class xr{constructor(e){this.boundingBox=new Ai(e),this.codewords=new Array(e.getMaxY()-e.getMinY()+1)}getCodewordNearby(e){let t=this.getCodeword(e);if(t!=null)return t;for(let i=1;i<xr.MAX_NEARBY_DISTANCE;i++){let r=this.imageRowToCodewordIndex(e)-i;if(r>=0&&(t=this.codewords[r],t!=null)||(r=this.imageRowToCodewordIndex(e)+i,r<this.codewords.length&&(t=this.codewords[r],t!=null)))return t}return null}imageRowToCodewordIndex(e){return e-this.boundingBox.getMinY()}setCodeword(e,t){this.codewords[this.imageRowToCodewordIndex(e)]=t}getCodeword(e){return this.codewords[this.imageRowToCodewordIndex(e)]}getBoundingBox(){return this.boundingBox}getCodewords(){return this.codewords}toString(){const e=new mr;let t=0;for(const i of this.codewords){if(i==null){e.format("%3d:    |   %n",t++);continue}e.format("%3d: %3d|%3d%n",t++,i.getRowNumber(),i.getValue())}return e.toString()}}xr.MAX_NEARBY_DISTANCE=5;class wr{constructor(){this.values=new Map}setValue(e){e=Math.trunc(e);let t=this.values.get(e);t==null&&(t=0),t++,this.values.set(e,t)}getValue(){let e=-1,t=new Array;for(const[i,r]of this.values.entries()){const s={getKey:()=>i,getValue:()=>r};s.getValue()>e?(e=s.getValue(),t=[],t.push(s.getKey())):s.getValue()===e&&t.push(s.getKey())}return ee.toIntArray(t)}getConfidence(e){return this.values.get(e)}}class Ks extends xr{constructor(e,t){super(e),this._isLeft=t}setRowNumbers(){for(let e of this.getCodewords())e!=null&&e.setRowNumberAsRowIndicatorColumn()}adjustCompleteIndicatorColumnRowNumbers(e){let t=this.getCodewords();this.setRowNumbers(),this.removeIncorrectCodewords(t,e);let i=this.getBoundingBox(),r=this._isLeft?i.getTopLeft():i.getTopRight(),s=this._isLeft?i.getBottomLeft():i.getBottomRight(),o=this.imageRowToCodewordIndex(Math.trunc(r.getY())),c=this.imageRowToCodewordIndex(Math.trunc(s.getY())),h=-1,f=1,p=0;for(let w=o;w<c;w++){if(t[w]==null)continue;let b=t[w],y=b.getRowNumber()-h;if(y===0)p++;else if(y===1)f=Math.max(f,p),p=1,h=b.getRowNumber();else if(y<0||b.getRowNumber()>=e.getRowCount()||y>w)t[w]=null;else{let E;f>2?E=(f-2)*y:E=y;let S=E>=w;for(let T=1;T<=E&&!S;T++)S=t[w-T]!=null;S?t[w]=null:(h=b.getRowNumber(),p=1)}}}getRowHeights(){let e=this.getBarcodeMetadata();if(e==null)return null;this.adjustIncompleteIndicatorColumnRowNumbers(e);let t=new Int32Array(e.getRowCount());for(let i of this.getCodewords())if(i!=null){let r=i.getRowNumber();if(r>=t.length)continue;t[r]++}return t}adjustIncompleteIndicatorColumnRowNumbers(e){let t=this.getBoundingBox(),i=this._isLeft?t.getTopLeft():t.getTopRight(),r=this._isLeft?t.getBottomLeft():t.getBottomRight(),s=this.imageRowToCodewordIndex(Math.trunc(i.getY())),o=this.imageRowToCodewordIndex(Math.trunc(r.getY())),c=this.getCodewords(),h=-1;for(let f=s;f<o;f++){if(c[f]==null)continue;let p=c[f];p.setRowNumberAsRowIndicatorColumn();let w=p.getRowNumber()-h;w===0||(w===1?h=p.getRowNumber():p.getRowNumber()>=e.getRowCount()?c[f]=null:h=p.getRowNumber())}}getBarcodeMetadata(){let e=this.getCodewords(),t=new wr,i=new wr,r=new wr,s=new wr;for(let c of e){if(c==null)continue;c.setRowNumberAsRowIndicatorColumn();let h=c.getValue()%30,f=c.getRowNumber();switch(this._isLeft||(f+=2),f%3){case 0:i.setValue(h*3+1);break;case 1:s.setValue(h/3),r.setValue(h%3);break;case 2:t.setValue(h+1);break}}if(t.getValue().length===0||i.getValue().length===0||r.getValue().length===0||s.getValue().length===0||t.getValue()[0]<1||i.getValue()[0]+r.getValue()[0]<ee.MIN_ROWS_IN_BARCODE||i.getValue()[0]+r.getValue()[0]>ee.MAX_ROWS_IN_BARCODE)return null;let o=new tl(t.getValue()[0],i.getValue()[0],r.getValue()[0],s.getValue()[0]);return this.removeIncorrectCodewords(e,o),o}removeIncorrectCodewords(e,t){for(let i=0;i<e.length;i++){let r=e[i];if(e[i]==null)continue;let s=r.getValue()%30,o=r.getRowNumber();if(o>t.getRowCount()){e[i]=null;continue}switch(this._isLeft||(o+=2),o%3){case 0:s*3+1!==t.getRowCountUpperPart()&&(e[i]=null);break;case 1:(Math.trunc(s/3)!==t.getErrorCorrectionLevel()||s%3!==t.getRowCountLowerPart())&&(e[i]=null);break;case 2:s+1!==t.getColumnCount()&&(e[i]=null);break}}}isLeft(){return this._isLeft}toString(){return"IsLeft: "+this._isLeft+`
`+super.toString()}}class br{constructor(e,t){this.ADJUST_ROW_NUMBER_SKIP=2,this.barcodeMetadata=e,this.barcodeColumnCount=e.getColumnCount(),this.boundingBox=t,this.detectionResultColumns=new Array(this.barcodeColumnCount+2)}getDetectionResultColumns(){this.adjustIndicatorColumnRowNumbers(this.detectionResultColumns[0]),this.adjustIndicatorColumnRowNumbers(this.detectionResultColumns[this.barcodeColumnCount+1]);let e=ee.MAX_CODEWORDS_IN_BARCODE,t;do t=e,e=this.adjustRowNumbersAndGetCount();while(e>0&&e<t);return this.detectionResultColumns}adjustIndicatorColumnRowNumbers(e){e!=null&&e.adjustCompleteIndicatorColumnRowNumbers(this.barcodeMetadata)}adjustRowNumbersAndGetCount(){let e=this.adjustRowNumbersByRow();if(e===0)return 0;for(let t=1;t<this.barcodeColumnCount+1;t++){let i=this.detectionResultColumns[t].getCodewords();for(let r=0;r<i.length;r++)i[r]!=null&&(i[r].hasValidRowNumber()||this.adjustRowNumbers(t,r,i))}return e}adjustRowNumbersByRow(){return this.adjustRowNumbersFromBothRI(),this.adjustRowNumbersFromLRI()+this.adjustRowNumbersFromRRI()}adjustRowNumbersFromBothRI(){if(this.detectionResultColumns[0]==null||this.detectionResultColumns[this.barcodeColumnCount+1]==null)return;let e=this.detectionResultColumns[0].getCodewords(),t=this.detectionResultColumns[this.barcodeColumnCount+1].getCodewords();for(let i=0;i<e.length;i++)if(e[i]!=null&&t[i]!=null&&e[i].getRowNumber()===t[i].getRowNumber())for(let r=1;r<=this.barcodeColumnCount;r++){let s=this.detectionResultColumns[r].getCodewords()[i];s!=null&&(s.setRowNumber(e[i].getRowNumber()),s.hasValidRowNumber()||(this.detectionResultColumns[r].getCodewords()[i]=null))}}adjustRowNumbersFromRRI(){if(this.detectionResultColumns[this.barcodeColumnCount+1]==null)return 0;let e=0,t=this.detectionResultColumns[this.barcodeColumnCount+1].getCodewords();for(let i=0;i<t.length;i++){if(t[i]==null)continue;let r=t[i].getRowNumber(),s=0;for(let o=this.barcodeColumnCount+1;o>0&&s<this.ADJUST_ROW_NUMBER_SKIP;o--){let c=this.detectionResultColumns[o].getCodewords()[i];c!=null&&(s=br.adjustRowNumberIfValid(r,s,c),c.hasValidRowNumber()||e++)}}return e}adjustRowNumbersFromLRI(){if(this.detectionResultColumns[0]==null)return 0;let e=0,t=this.detectionResultColumns[0].getCodewords();for(let i=0;i<t.length;i++){if(t[i]==null)continue;let r=t[i].getRowNumber(),s=0;for(let o=1;o<this.barcodeColumnCount+1&&s<this.ADJUST_ROW_NUMBER_SKIP;o++){let c=this.detectionResultColumns[o].getCodewords()[i];c!=null&&(s=br.adjustRowNumberIfValid(r,s,c),c.hasValidRowNumber()||e++)}}return e}static adjustRowNumberIfValid(e,t,i){return i==null||i.hasValidRowNumber()||(i.isValidRowNumber(e)?(i.setRowNumber(e),t=0):++t),t}adjustRowNumbers(e,t,i){if(!this.detectionResultColumns[e-1])return;let r=i[t],s=this.detectionResultColumns[e-1].getCodewords(),o=s;this.detectionResultColumns[e+1]!=null&&(o=this.detectionResultColumns[e+1].getCodewords());let c=new Array(14);c[2]=s[t],c[3]=o[t],t>0&&(c[0]=i[t-1],c[4]=s[t-1],c[5]=o[t-1]),t>1&&(c[8]=i[t-2],c[10]=s[t-2],c[11]=o[t-2]),t<i.length-1&&(c[1]=i[t+1],c[6]=s[t+1],c[7]=o[t+1]),t<i.length-2&&(c[9]=i[t+2],c[12]=s[t+2],c[13]=o[t+2]);for(let h of c)if(br.adjustRowNumber(r,h))return}static adjustRowNumber(e,t){return t==null?!1:t.hasValidRowNumber()&&t.getBucket()===e.getBucket()?(e.setRowNumber(t.getRowNumber()),!0):!1}getBarcodeColumnCount(){return this.barcodeColumnCount}getBarcodeRowCount(){return this.barcodeMetadata.getRowCount()}getBarcodeECLevel(){return this.barcodeMetadata.getErrorCorrectionLevel()}setBoundingBox(e){this.boundingBox=e}getBoundingBox(){return this.boundingBox}setDetectionResultColumn(e,t){this.detectionResultColumns[e]=t}getDetectionResultColumn(e){return this.detectionResultColumns[e]}toString(){let e=this.detectionResultColumns[0];e==null&&(e=this.detectionResultColumns[this.barcodeColumnCount+1]);let t=new mr;for(let i=0;i<e.getCodewords().length;i++){t.format("CW %3d:",i);for(let r=0;r<this.barcodeColumnCount+2;r++){if(this.detectionResultColumns[r]==null){t.format("    |   ");continue}let s=this.detectionResultColumns[r].getCodewords()[i];if(s==null){t.format("    |   ");continue}t.format(" %3d|%3d",s.getRowNumber(),s.getValue())}t.format("%n")}return t.toString()}}class _r{constructor(e,t,i,r){this.rowNumber=_r.BARCODE_ROW_UNKNOWN,this.startX=Math.trunc(e),this.endX=Math.trunc(t),this.bucket=Math.trunc(i),this.value=Math.trunc(r)}hasValidRowNumber(){return this.isValidRowNumber(this.rowNumber)}isValidRowNumber(e){return e!==_r.BARCODE_ROW_UNKNOWN&&this.bucket===e%3*3}setRowNumberAsRowIndicatorColumn(){this.rowNumber=Math.trunc(Math.trunc(this.value/30)*3+Math.trunc(this.bucket/3))}getWidth(){return this.endX-this.startX}getStartX(){return this.startX}getEndX(){return this.endX}getBucket(){return this.bucket}getValue(){return this.value}getRowNumber(){return this.rowNumber}setRowNumber(e){this.rowNumber=e}toString(){return this.rowNumber+"|"+this.value}}_r.BARCODE_ROW_UNKNOWN=-1;class mt{static initialize(){for(let e=0;e<ee.SYMBOL_TABLE.length;e++){let t=ee.SYMBOL_TABLE[e],i=t&1;for(let r=0;r<ee.BARS_IN_MODULE;r++){let s=0;for(;(t&1)===i;)s+=1,t>>=1;i=t&1,mt.RATIOS_TABLE[e]||(mt.RATIOS_TABLE[e]=new Array(ee.BARS_IN_MODULE)),mt.RATIOS_TABLE[e][ee.BARS_IN_MODULE-r-1]=Math.fround(s/ee.MODULES_IN_CODEWORD)}}this.bSymbolTableReady=!0}static getDecodedValue(e){let t=mt.getDecodedCodewordValue(mt.sampleBitCounts(e));return t!==-1?t:mt.getClosestDecodedValue(e)}static sampleBitCounts(e){let t=me.sum(e),i=new Int32Array(ee.BARS_IN_MODULE),r=0,s=0;for(let o=0;o<ee.MODULES_IN_CODEWORD;o++){let c=t/(2*ee.MODULES_IN_CODEWORD)+o*t/ee.MODULES_IN_CODEWORD;s+e[r]<=c&&(s+=e[r],r++),i[r]++}return i}static getDecodedCodewordValue(e){let t=mt.getBitValue(e);return ee.getCodeword(t)===-1?-1:t}static getBitValue(e){let t=0;for(let i=0;i<e.length;i++)for(let r=0;r<e[i];r++)t=t<<1|(i%2===0?1:0);return Math.trunc(t)}static getClosestDecodedValue(e){let t=me.sum(e),i=new Array(ee.BARS_IN_MODULE);if(t>1)for(let o=0;o<i.length;o++)i[o]=Math.fround(e[o]/t);let r=Vr.MAX_VALUE,s=-1;this.bSymbolTableReady||mt.initialize();for(let o=0;o<mt.RATIOS_TABLE.length;o++){let c=0,h=mt.RATIOS_TABLE[o];for(let f=0;f<ee.BARS_IN_MODULE;f++){let p=Math.fround(h[f]-i[f]);if(c+=Math.fround(p*p),c>=r)break}c<r&&(r=c,s=ee.SYMBOL_TABLE[o])}return s}}mt.bSymbolTableReady=!1,mt.RATIOS_TABLE=new Array(ee.SYMBOL_TABLE.length).map(x=>new Array(ee.BARS_IN_MODULE));class Ys{constructor(){this.segmentCount=-1,this.fileSize=-1,this.timestamp=-1,this.checksum=-1}getSegmentIndex(){return this.segmentIndex}setSegmentIndex(e){this.segmentIndex=e}getFileId(){return this.fileId}setFileId(e){this.fileId=e}getOptionalData(){return this.optionalData}setOptionalData(e){this.optionalData=e}isLastSegment(){return this.lastSegment}setLastSegment(e){this.lastSegment=e}getSegmentCount(){return this.segmentCount}setSegmentCount(e){this.segmentCount=e}getSender(){return this.sender||null}setSender(e){this.sender=e}getAddressee(){return this.addressee||null}setAddressee(e){this.addressee=e}getFileName(){return this.fileName}setFileName(e){this.fileName=e}getFileSize(){return this.fileSize}setFileSize(e){this.fileSize=e}getChecksum(){return this.checksum}setChecksum(e){this.checksum=e}getTimestamp(){return this.timestamp}setTimestamp(e){this.timestamp=e}}class Zs{static parseLong(e,t=void 0){return parseInt(e,t)}}class qs extends _{}qs.kind="NullPointerException";class il{writeBytes(e){this.writeBytesOffset(e,0,e.length)}writeBytesOffset(e,t,i){if(e==null)throw new qs;if(t<0||t>e.length||i<0||t+i>e.length||t+i<0)throw new Le;if(i===0)return;for(let r=0;r<i;r++)this.write(e[t+r])}flush(){}close(){}}class rl extends _{}class nl extends il{constructor(e=32){if(super(),this.count=0,e<0)throw new I("Negative initial size: "+e);this.buf=new Uint8Array(e)}ensureCapacity(e){e-this.buf.length>0&&this.grow(e)}grow(e){let i=this.buf.length<<1;if(i-e<0&&(i=e),i<0){if(e<0)throw new rl;i=K.MAX_VALUE}this.buf=le.copyOfUint8Array(this.buf,i)}write(e){this.ensureCapacity(this.count+1),this.buf[this.count]=e,this.count+=1}writeBytesOffset(e,t,i){if(t<0||t>e.length||i<0||t+i-e.length>0)throw new Le;this.ensureCapacity(this.count+i),te.arraycopy(e,t,this.buf,this.count,i),this.count+=i}writeTo(e){e.writeBytesOffset(this.buf,0,this.count)}reset(){this.count=0}toByteArray(){return le.copyOfUint8Array(this.buf,this.count)}size(){return this.count}toString(e){return e?typeof e=="string"?this.toString_string(e):this.toString_number(e):this.toString_void()}toString_void(){return new String(this.buf).toString()}toString_string(e){return new String(this.buf).toString()}toString_number(e){return new String(this.buf).toString()}close(){}}var Ae;(function(x){x[x.ALPHA=0]="ALPHA",x[x.LOWER=1]="LOWER",x[x.MIXED=2]="MIXED",x[x.PUNCT=3]="PUNCT",x[x.ALPHA_SHIFT=4]="ALPHA_SHIFT",x[x.PUNCT_SHIFT=5]="PUNCT_SHIFT"})(Ae||(Ae={}));function Qs(){if(typeof window<"u")return window.BigInt||null;if(typeof Er<"u")return Er.BigInt||null;if(typeof self<"u")return self.BigInt||null;throw new Error("Can't search globals for BigInt!")}let Kr;function ci(x){if(typeof Kr>"u"&&(Kr=Qs()),Kr===null)throw new Error("BigInt is not supported!");return Kr(x)}function sl(){let x=[];x[0]=ci(1);let e=ci(900);x[1]=e;for(let t=2;t<16;t++)x[t]=x[t-1]*e;return x}class O{static decode(e,t){let i=new se(""),r=P.ISO8859_1;i.enableDecoding(r);let s=1,o=e[s++],c=new Ys;for(;s<e[0];){switch(o){case O.TEXT_COMPACTION_MODE_LATCH:s=O.textCompaction(e,s,i);break;case O.BYTE_COMPACTION_MODE_LATCH:case O.BYTE_COMPACTION_MODE_LATCH_6:s=O.byteCompaction(o,e,r,s,i);break;case O.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:i.append(e[s++]);break;case O.NUMERIC_COMPACTION_MODE_LATCH:s=O.numericCompaction(e,s,i);break;case O.ECI_CHARSET:P.getCharacterSetECIByValue(e[s++]);break;case O.ECI_GENERAL_PURPOSE:s+=2;break;case O.ECI_USER_DEFINED:s++;break;case O.BEGIN_MACRO_PDF417_CONTROL_BLOCK:s=O.decodeMacroBlock(e,s,c);break;case O.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:case O.MACRO_PDF417_TERMINATOR:throw new z;default:s--,s=O.textCompaction(e,s,i);break}if(s<e.length)o=e[s++];else throw z.getFormatInstance()}if(i.length()===0)throw z.getFormatInstance();let h=new hr(null,i.toString(),null,t);return h.setOther(c),h}static decodeMacroBlock(e,t,i){if(t+O.NUMBER_OF_SEQUENCE_CODEWORDS>e[0])throw z.getFormatInstance();let r=new Int32Array(O.NUMBER_OF_SEQUENCE_CODEWORDS);for(let c=0;c<O.NUMBER_OF_SEQUENCE_CODEWORDS;c++,t++)r[c]=e[t];i.setSegmentIndex(K.parseInt(O.decodeBase900toBase10(r,O.NUMBER_OF_SEQUENCE_CODEWORDS)));let s=new se;t=O.textCompaction(e,t,s),i.setFileId(s.toString());let o=-1;for(e[t]===O.BEGIN_MACRO_PDF417_OPTIONAL_FIELD&&(o=t+1);t<e[0];)switch(e[t]){case O.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:switch(t++,e[t]){case O.MACRO_PDF417_OPTIONAL_FIELD_FILE_NAME:let c=new se;t=O.textCompaction(e,t+1,c),i.setFileName(c.toString());break;case O.MACRO_PDF417_OPTIONAL_FIELD_SENDER:let h=new se;t=O.textCompaction(e,t+1,h),i.setSender(h.toString());break;case O.MACRO_PDF417_OPTIONAL_FIELD_ADDRESSEE:let f=new se;t=O.textCompaction(e,t+1,f),i.setAddressee(f.toString());break;case O.MACRO_PDF417_OPTIONAL_FIELD_SEGMENT_COUNT:let p=new se;t=O.numericCompaction(e,t+1,p),i.setSegmentCount(K.parseInt(p.toString()));break;case O.MACRO_PDF417_OPTIONAL_FIELD_TIME_STAMP:let w=new se;t=O.numericCompaction(e,t+1,w),i.setTimestamp(Zs.parseLong(w.toString()));break;case O.MACRO_PDF417_OPTIONAL_FIELD_CHECKSUM:let b=new se;t=O.numericCompaction(e,t+1,b),i.setChecksum(K.parseInt(b.toString()));break;case O.MACRO_PDF417_OPTIONAL_FIELD_FILE_SIZE:let y=new se;t=O.numericCompaction(e,t+1,y),i.setFileSize(Zs.parseLong(y.toString()));break;default:throw z.getFormatInstance()}break;case O.MACRO_PDF417_TERMINATOR:t++,i.setLastSegment(!0);break;default:throw z.getFormatInstance()}if(o!==-1){let c=t-o;i.isLastSegment()&&c--,i.setOptionalData(le.copyOfRange(e,o,o+c))}return t}static textCompaction(e,t,i){let r=new Int32Array((e[0]-t)*2),s=new Int32Array((e[0]-t)*2),o=0,c=!1;for(;t<e[0]&&!c;){let h=e[t++];if(h<O.TEXT_COMPACTION_MODE_LATCH)r[o]=h/30,r[o+1]=h%30,o+=2;else switch(h){case O.TEXT_COMPACTION_MODE_LATCH:r[o++]=O.TEXT_COMPACTION_MODE_LATCH;break;case O.BYTE_COMPACTION_MODE_LATCH:case O.BYTE_COMPACTION_MODE_LATCH_6:case O.NUMERIC_COMPACTION_MODE_LATCH:case O.BEGIN_MACRO_PDF417_CONTROL_BLOCK:case O.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:case O.MACRO_PDF417_TERMINATOR:t--,c=!0;break;case O.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:r[o]=O.MODE_SHIFT_TO_BYTE_COMPACTION_MODE,h=e[t++],s[o]=h,o++;break}}return O.decodeTextCompaction(r,s,o,i),t}static decodeTextCompaction(e,t,i,r){let s=Ae.ALPHA,o=Ae.ALPHA,c=0;for(;c<i;){let h=e[c],f="";switch(s){case Ae.ALPHA:if(h<26)f=String.fromCharCode(65+h);else switch(h){case 26:f=" ";break;case O.LL:s=Ae.LOWER;break;case O.ML:s=Ae.MIXED;break;case O.PS:o=s,s=Ae.PUNCT_SHIFT;break;case O.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:r.append(t[c]);break;case O.TEXT_COMPACTION_MODE_LATCH:s=Ae.ALPHA;break}break;case Ae.LOWER:if(h<26)f=String.fromCharCode(97+h);else switch(h){case 26:f=" ";break;case O.AS:o=s,s=Ae.ALPHA_SHIFT;break;case O.ML:s=Ae.MIXED;break;case O.PS:o=s,s=Ae.PUNCT_SHIFT;break;case O.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:r.append(t[c]);break;case O.TEXT_COMPACTION_MODE_LATCH:s=Ae.ALPHA;break}break;case Ae.MIXED:if(h<O.PL)f=O.MIXED_CHARS[h];else switch(h){case O.PL:s=Ae.PUNCT;break;case 26:f=" ";break;case O.LL:s=Ae.LOWER;break;case O.AL:s=Ae.ALPHA;break;case O.PS:o=s,s=Ae.PUNCT_SHIFT;break;case O.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:r.append(t[c]);break;case O.TEXT_COMPACTION_MODE_LATCH:s=Ae.ALPHA;break}break;case Ae.PUNCT:if(h<O.PAL)f=O.PUNCT_CHARS[h];else switch(h){case O.PAL:s=Ae.ALPHA;break;case O.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:r.append(t[c]);break;case O.TEXT_COMPACTION_MODE_LATCH:s=Ae.ALPHA;break}break;case Ae.ALPHA_SHIFT:if(s=o,h<26)f=String.fromCharCode(65+h);else switch(h){case 26:f=" ";break;case O.TEXT_COMPACTION_MODE_LATCH:s=Ae.ALPHA;break}break;case Ae.PUNCT_SHIFT:if(s=o,h<O.PAL)f=O.PUNCT_CHARS[h];else switch(h){case O.PAL:s=Ae.ALPHA;break;case O.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:r.append(t[c]);break;case O.TEXT_COMPACTION_MODE_LATCH:s=Ae.ALPHA;break}break}f!==""&&r.append(f),c++}}static byteCompaction(e,t,i,r,s){let o=new nl,c=0,h=0,f=!1;switch(e){case O.BYTE_COMPACTION_MODE_LATCH:let p=new Int32Array(6),w=t[r++];for(;r<t[0]&&!f;)switch(p[c++]=w,h=900*h+w,w=t[r++],w){case O.TEXT_COMPACTION_MODE_LATCH:case O.BYTE_COMPACTION_MODE_LATCH:case O.NUMERIC_COMPACTION_MODE_LATCH:case O.BYTE_COMPACTION_MODE_LATCH_6:case O.BEGIN_MACRO_PDF417_CONTROL_BLOCK:case O.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:case O.MACRO_PDF417_TERMINATOR:r--,f=!0;break;default:if(c%5===0&&c>0){for(let b=0;b<6;++b)o.write(Number(ci(h)>>ci(8*(5-b))));h=0,c=0}break}r===t[0]&&w<O.TEXT_COMPACTION_MODE_LATCH&&(p[c++]=w);for(let b=0;b<c;b++)o.write(p[b]);break;case O.BYTE_COMPACTION_MODE_LATCH_6:for(;r<t[0]&&!f;){let b=t[r++];if(b<O.TEXT_COMPACTION_MODE_LATCH)c++,h=900*h+b;else switch(b){case O.TEXT_COMPACTION_MODE_LATCH:case O.BYTE_COMPACTION_MODE_LATCH:case O.NUMERIC_COMPACTION_MODE_LATCH:case O.BYTE_COMPACTION_MODE_LATCH_6:case O.BEGIN_MACRO_PDF417_CONTROL_BLOCK:case O.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:case O.MACRO_PDF417_TERMINATOR:r--,f=!0;break}if(c%5===0&&c>0){for(let y=0;y<6;++y)o.write(Number(ci(h)>>ci(8*(5-y))));h=0,c=0}}break}return s.append(De.decode(o.toByteArray(),i)),r}static numericCompaction(e,t,i){let r=0,s=!1,o=new Int32Array(O.MAX_NUMERIC_CODEWORDS);for(;t<e[0]&&!s;){let c=e[t++];if(t===e[0]&&(s=!0),c<O.TEXT_COMPACTION_MODE_LATCH)o[r]=c,r++;else switch(c){case O.TEXT_COMPACTION_MODE_LATCH:case O.BYTE_COMPACTION_MODE_LATCH:case O.BYTE_COMPACTION_MODE_LATCH_6:case O.BEGIN_MACRO_PDF417_CONTROL_BLOCK:case O.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:case O.MACRO_PDF417_TERMINATOR:t--,s=!0;break}(r%O.MAX_NUMERIC_CODEWORDS===0||c===O.NUMERIC_COMPACTION_MODE_LATCH||s)&&r>0&&(i.append(O.decodeBase900toBase10(o,r)),r=0)}return t}static decodeBase900toBase10(e,t){let i=ci(0);for(let s=0;s<t;s++)i+=O.EXP900[t-s-1]*ci(e[s]);let r=i.toString();if(r.charAt(0)!=="1")throw new z;return r.substring(1)}}O.TEXT_COMPACTION_MODE_LATCH=900,O.BYTE_COMPACTION_MODE_LATCH=901,O.NUMERIC_COMPACTION_MODE_LATCH=902,O.BYTE_COMPACTION_MODE_LATCH_6=924,O.ECI_USER_DEFINED=925,O.ECI_GENERAL_PURPOSE=926,O.ECI_CHARSET=927,O.BEGIN_MACRO_PDF417_CONTROL_BLOCK=928,O.BEGIN_MACRO_PDF417_OPTIONAL_FIELD=923,O.MACRO_PDF417_TERMINATOR=922,O.MODE_SHIFT_TO_BYTE_COMPACTION_MODE=913,O.MAX_NUMERIC_CODEWORDS=15,O.MACRO_PDF417_OPTIONAL_FIELD_FILE_NAME=0,O.MACRO_PDF417_OPTIONAL_FIELD_SEGMENT_COUNT=1,O.MACRO_PDF417_OPTIONAL_FIELD_TIME_STAMP=2,O.MACRO_PDF417_OPTIONAL_FIELD_SENDER=3,O.MACRO_PDF417_OPTIONAL_FIELD_ADDRESSEE=4,O.MACRO_PDF417_OPTIONAL_FIELD_FILE_SIZE=5,O.MACRO_PDF417_OPTIONAL_FIELD_CHECKSUM=6,O.PL=25,O.LL=27,O.AS=27,O.ML=28,O.AL=28,O.PS=29,O.PAL=29,O.PUNCT_CHARS=`;<>@[\\]_\`~!\r	,:
-.$/"|*()?{}'`,O.MIXED_CHARS="0123456789&\r	,:#-.$/+%*=^",O.EXP900=Qs()?sl():[],O.NUMBER_OF_SEQUENCE_CODEWORDS=2;class de{constructor(){}static decode(e,t,i,r,s,o,c){let h=new Ai(e,t,i,r,s),f=null,p=null,w;for(let E=!0;;E=!1){if(t!=null&&(f=de.getRowIndicatorColumn(e,h,t,!0,o,c)),r!=null&&(p=de.getRowIndicatorColumn(e,h,r,!1,o,c)),w=de.merge(f,p),w==null)throw D.getNotFoundInstance();let S=w.getBoundingBox();if(E&&S!=null&&(S.getMinY()<h.getMinY()||S.getMaxY()>h.getMaxY()))h=S;else break}w.setBoundingBox(h);let b=w.getBarcodeColumnCount()+1;w.setDetectionResultColumn(0,f),w.setDetectionResultColumn(b,p);let y=f!=null;for(let E=1;E<=b;E++){let S=y?E:b-E;if(w.getDetectionResultColumn(S)!==void 0)continue;let T;S===0||S===b?T=new Ks(h,S===0):T=new xr(h),w.setDetectionResultColumn(S,T);let R=-1,F=R;for(let U=h.getMinY();U<=h.getMaxY();U++){if(R=de.getStartColumn(w,S,U,y),R<0||R>h.getMaxX()){if(F===-1)continue;R=F}let B=de.detectCodeword(e,h.getMinX(),h.getMaxX(),y,R,U,o,c);B!=null&&(T.setCodeword(U,B),F=R,o=Math.min(o,B.getWidth()),c=Math.max(c,B.getWidth()))}}return de.createDecoderResult(w)}static merge(e,t){if(e==null&&t==null)return null;let i=de.getBarcodeMetadata(e,t);if(i==null)return null;let r=Ai.merge(de.adjustBoundingBox(e),de.adjustBoundingBox(t));return new br(i,r)}static adjustBoundingBox(e){if(e==null)return null;let t=e.getRowHeights();if(t==null)return null;let i=de.getMax(t),r=0;for(let c of t)if(r+=i-c,c>0)break;let s=e.getCodewords();for(let c=0;r>0&&s[c]==null;c++)r--;let o=0;for(let c=t.length-1;c>=0&&(o+=i-t[c],!(t[c]>0));c--);for(let c=s.length-1;o>0&&s[c]==null;c--)o--;return e.getBoundingBox().addMissingRows(r,o,e.isLeft())}static getMax(e){let t=-1;for(let i of e)t=Math.max(t,i);return t}static getBarcodeMetadata(e,t){let i;if(e==null||(i=e.getBarcodeMetadata())==null)return t==null?null:t.getBarcodeMetadata();let r;return t==null||(r=t.getBarcodeMetadata())==null?i:i.getColumnCount()!==r.getColumnCount()&&i.getErrorCorrectionLevel()!==r.getErrorCorrectionLevel()&&i.getRowCount()!==r.getRowCount()?null:i}static getRowIndicatorColumn(e,t,i,r,s,o){let c=new Ks(t,r);for(let h=0;h<2;h++){let f=h===0?1:-1,p=Math.trunc(Math.trunc(i.getX()));for(let w=Math.trunc(Math.trunc(i.getY()));w<=t.getMaxY()&&w>=t.getMinY();w+=f){let b=de.detectCodeword(e,0,e.getWidth(),r,p,w,s,o);b!=null&&(c.setCodeword(w,b),r?p=b.getStartX():p=b.getEndX())}}return c}static adjustCodewordCount(e,t){let i=t[0][1],r=i.getValue(),s=e.getBarcodeColumnCount()*e.getBarcodeRowCount()-de.getNumberOfECCodeWords(e.getBarcodeECLevel());if(r.length===0){if(s<1||s>ee.MAX_CODEWORDS_IN_BARCODE)throw D.getNotFoundInstance();i.setValue(s)}else r[0]!==s&&i.setValue(s)}static createDecoderResult(e){let t=de.createBarcodeMatrix(e);de.adjustCodewordCount(e,t);let i=new Array,r=new Int32Array(e.getBarcodeRowCount()*e.getBarcodeColumnCount()),s=[],o=new Array;for(let h=0;h<e.getBarcodeRowCount();h++)for(let f=0;f<e.getBarcodeColumnCount();f++){let p=t[h][f+1].getValue(),w=h*e.getBarcodeColumnCount()+f;p.length===0?i.push(w):p.length===1?r[w]=p[0]:(o.push(w),s.push(p))}let c=new Array(s.length);for(let h=0;h<c.length;h++)c[h]=s[h];return de.createDecoderResultFromAmbiguousValues(e.getBarcodeECLevel(),r,ee.toIntArray(i),ee.toIntArray(o),c)}static createDecoderResultFromAmbiguousValues(e,t,i,r,s){let o=new Int32Array(r.length),c=100;for(;c-- >0;){for(let h=0;h<o.length;h++)t[r[h]]=s[h][o[h]];try{return de.decodeCodewords(t,e,i)}catch(h){if(!(h instanceof X))throw h}if(o.length===0)throw X.getChecksumInstance();for(let h=0;h<o.length;h++)if(o[h]<s[h].length-1){o[h]++;break}else if(o[h]=0,h===o.length-1)throw X.getChecksumInstance()}throw X.getChecksumInstance()}static createBarcodeMatrix(e){let t=Array.from({length:e.getBarcodeRowCount()},()=>new Array(e.getBarcodeColumnCount()+2));for(let r=0;r<t.length;r++)for(let s=0;s<t[r].length;s++)t[r][s]=new wr;let i=0;for(let r of e.getDetectionResultColumns()){if(r!=null){for(let s of r.getCodewords())if(s!=null){let o=s.getRowNumber();if(o>=0){if(o>=t.length)continue;t[o][i].setValue(s.getValue())}}}i++}return t}static isValidBarcodeColumn(e,t){return t>=0&&t<=e.getBarcodeColumnCount()+1}static getStartColumn(e,t,i,r){let s=r?1:-1,o=null;if(de.isValidBarcodeColumn(e,t-s)&&(o=e.getDetectionResultColumn(t-s).getCodeword(i)),o!=null)return r?o.getEndX():o.getStartX();if(o=e.getDetectionResultColumn(t).getCodewordNearby(i),o!=null)return r?o.getStartX():o.getEndX();if(de.isValidBarcodeColumn(e,t-s)&&(o=e.getDetectionResultColumn(t-s).getCodewordNearby(i)),o!=null)return r?o.getEndX():o.getStartX();let c=0;for(;de.isValidBarcodeColumn(e,t-s);){t-=s;for(let h of e.getDetectionResultColumn(t).getCodewords())if(h!=null)return(r?h.getEndX():h.getStartX())+s*c*(h.getEndX()-h.getStartX());c++}return r?e.getBoundingBox().getMinX():e.getBoundingBox().getMaxX()}static detectCodeword(e,t,i,r,s,o,c,h){s=de.adjustCodewordStartColumn(e,t,i,r,s,o);let f=de.getModuleBitCount(e,t,i,r,s,o);if(f==null)return null;let p,w=me.sum(f);if(r)p=s+w;else{for(let E=0;E<f.length/2;E++){let S=f[E];f[E]=f[f.length-1-E],f[f.length-1-E]=S}p=s,s=p-w}if(!de.checkCodewordSkew(w,c,h))return null;let b=mt.getDecodedValue(f),y=ee.getCodeword(b);return y===-1?null:new _r(s,p,de.getCodewordBucketNumber(b),y)}static getModuleBitCount(e,t,i,r,s,o){let c=s,h=new Int32Array(8),f=0,p=r?1:-1,w=r;for(;(r?c<i:c>=t)&&f<h.length;)e.get(c,o)===w?(h[f]++,c+=p):(f++,w=!w);return f===h.length||c===(r?i:t)&&f===h.length-1?h:null}static getNumberOfECCodeWords(e){return 2<<e}static adjustCodewordStartColumn(e,t,i,r,s,o){let c=s,h=r?-1:1;for(let f=0;f<2;f++){for(;(r?c>=t:c<i)&&r===e.get(c,o);){if(Math.abs(s-c)>de.CODEWORD_SKEW_SIZE)return s;c+=h}h=-h,r=!r}return c}static checkCodewordSkew(e,t,i){return t-de.CODEWORD_SKEW_SIZE<=e&&e<=i+de.CODEWORD_SKEW_SIZE}static decodeCodewords(e,t,i){if(e.length===0)throw z.getFormatInstance();let r=1<<t+1,s=de.correctErrors(e,i,r);de.verifyCodewordCount(e,r);let o=O.decode(e,""+t);return o.setErrorsCorrected(s),o.setErasures(i.length),o}static correctErrors(e,t,i){if(t!=null&&t.length>i/2+de.MAX_ERRORS||i<0||i>de.MAX_EC_CODEWORDS)throw X.getChecksumInstance();return de.errorCorrection.decode(e,i,t)}static verifyCodewordCount(e,t){if(e.length<4)throw z.getFormatInstance();let i=e[0];if(i>e.length)throw z.getFormatInstance();if(i===0)if(t<e.length)e[0]=e.length-t;else throw z.getFormatInstance()}static getBitCountForCodeword(e){let t=new Int32Array(8),i=0,r=t.length-1;for(;!((e&1)!==i&&(i=e&1,r--,r<0));)t[r]++,e>>=1;return t}static getCodewordBucketNumber(e){return e instanceof Int32Array?this.getCodewordBucketNumber_Int32Array(e):this.getCodewordBucketNumber_number(e)}static getCodewordBucketNumber_number(e){return de.getCodewordBucketNumber(de.getBitCountForCodeword(e))}static getCodewordBucketNumber_Int32Array(e){return(e[0]-e[2]+e[4]-e[6]+9)%9}static toString(e){let t=new mr;for(let i=0;i<e.length;i++){t.format("Row %2d: ",i);for(let r=0;r<e[i].length;r++){let s=e[i][r];s.getValue().length===0?t.format("        ",null):t.format("%4d(%2d)",s.getValue()[0],s.getConfidence(s.getValue()[0]))}t.format("%n")}return t.toString()}}de.CODEWORD_SKEW_SIZE=2,de.MAX_ERRORS=3,de.MAX_EC_CODEWORDS=512,de.errorCorrection=new js;class rt{decode(e,t=null){let i=rt.decode(e,t,!1);if(i==null||i.length===0||i[0]==null)throw D.getNotFoundInstance();return i[0]}decodeMultiple(e,t=null){try{return rt.decode(e,t,!0)}catch(i){throw i instanceof z||i instanceof X?D.getNotFoundInstance():i}}static decode(e,t,i){const r=new Array,s=oe.detectMultiple(e,t,i);for(const o of s.getPoints()){const c=de.decode(s.getBits(),o[4],o[5],o[6],o[7],rt.getMinCodewordWidth(o),rt.getMaxCodewordWidth(o)),h=new ct(c.getText(),c.getRawBytes(),void 0,o,Q.PDF_417);h.putMetadata(Ye.ERROR_CORRECTION_LEVEL,c.getECLevel());const f=c.getOther();f!=null&&h.putMetadata(Ye.PDF417_EXTRA_METADATA,f),r.push(h)}return r.map(o=>o)}static getMaxWidth(e,t){return e==null||t==null?0:Math.trunc(Math.abs(e.getX()-t.getX()))}static getMinWidth(e,t){return e==null||t==null?K.MAX_VALUE:Math.trunc(Math.abs(e.getX()-t.getX()))}static getMaxCodewordWidth(e){return Math.floor(Math.max(Math.max(rt.getMaxWidth(e[0],e[4]),rt.getMaxWidth(e[6],e[2])*ee.MODULES_IN_CODEWORD/ee.MODULES_IN_STOP_PATTERN),Math.max(rt.getMaxWidth(e[1],e[5]),rt.getMaxWidth(e[7],e[3])*ee.MODULES_IN_CODEWORD/ee.MODULES_IN_STOP_PATTERN)))}static getMinCodewordWidth(e){return Math.floor(Math.min(Math.min(rt.getMinWidth(e[0],e[4]),rt.getMinWidth(e[6],e[2])*ee.MODULES_IN_CODEWORD/ee.MODULES_IN_STOP_PATTERN),Math.min(rt.getMinWidth(e[1],e[5]),rt.getMinWidth(e[7],e[3])*ee.MODULES_IN_CODEWORD/ee.MODULES_IN_STOP_PATTERN)))}reset(){}}class Yr extends _{}Yr.kind="ReaderException";class Js{constructor(e,t){this.verbose=e===!0,t&&this.setHints(t)}decode(e,t){return t&&this.setHints(t),this.decodeInternal(e)}decodeWithState(e){return(this.readers===null||this.readers===void 0)&&this.setHints(null),this.decodeInternal(e)}setHints(e){this.hints=e;const t=!d(e)&&e.get(we.TRY_HARDER)===!0,i=d(e)?null:e.get(we.POSSIBLE_FORMATS),r=new Array;if(!d(i)){const s=i.some(o=>o===Q.UPC_A||o===Q.UPC_E||o===Q.EAN_13||o===Q.EAN_8||o===Q.CODABAR||o===Q.CODE_39||o===Q.CODE_93||o===Q.CODE_128||o===Q.ITF||o===Q.RSS_14||o===Q.RSS_EXPANDED);s&&!t&&r.push(new Gi(e,this.verbose)),i.includes(Q.QR_CODE)&&r.push(new li),i.includes(Q.DATA_MATRIX)&&r.push(new oi),i.includes(Q.AZTEC)&&r.push(new Hr),i.includes(Q.PDF_417)&&r.push(new rt),s&&t&&r.push(new Gi(e,this.verbose))}r.length===0&&(t||r.push(new Gi(e,this.verbose)),r.push(new li),r.push(new oi),r.push(new Hr),r.push(new rt),t&&r.push(new Gi(e,this.verbose))),this.readers=r}reset(){if(this.readers!==null)for(const e of this.readers)e.reset()}decodeInternal(e){if(this.readers===null)throw new Yr("No readers where selected, nothing can be read.");for(const t of this.readers)try{return t.decode(e,this.hints)}catch(i){if(i instanceof Yr)continue}throw new D("No MultiFormat Readers were able to detect the code.")}}class al extends _i{constructor(e=null,t=500){const i=new Js;i.setHints(e),super(i,t)}decodeBitmap(e){return this.reader.decodeWithState(e)}}class ol extends _i{constructor(e=500){super(new rt,e)}}class ll extends _i{constructor(e=500){super(new li,e)}}var Bn;(function(x){x[x.ERROR_CORRECTION=0]="ERROR_CORRECTION",x[x.CHARACTER_SET=1]="CHARACTER_SET",x[x.DATA_MATRIX_SHAPE=2]="DATA_MATRIX_SHAPE",x[x.MIN_SIZE=3]="MIN_SIZE",x[x.MAX_SIZE=4]="MAX_SIZE",x[x.MARGIN=5]="MARGIN",x[x.PDF417_COMPACT=6]="PDF417_COMPACT",x[x.PDF417_COMPACTION=7]="PDF417_COMPACTION",x[x.PDF417_DIMENSIONS=8]="PDF417_DIMENSIONS",x[x.AZTEC_LAYERS=9]="AZTEC_LAYERS",x[x.QR_VERSION=10]="QR_VERSION"})(Bn||(Bn={}));var je=Bn;class Ln{constructor(e){this.field=e,this.cachedGenerators=[],this.cachedGenerators.push(new ft(e,Int32Array.from([1])))}buildGenerator(e){const t=this.cachedGenerators;if(e>=t.length){let i=t[t.length-1];const r=this.field;for(let s=t.length;s<=e;s++){const o=i.multiply(new ft(r,Int32Array.from([1,r.exp(s-1+r.getGeneratorBase())])));t.push(o),i=o}}return t[e]}encode(e,t){if(t===0)throw new I("No error correction bytes");const i=e.length-t;if(i<=0)throw new I("No data bytes provided");const r=this.buildGenerator(t),s=new Int32Array(i);te.arraycopy(e,0,s,0,i);let o=new ft(this.field,s);o=o.multiplyByMonomial(t,1);const h=o.divide(r)[1].getCoefficients(),f=t-h.length;for(let p=0;p<f;p++)e[i+p]=0;te.arraycopy(h,0,e,i+f,h.length)}}class ze{constructor(){}static applyMaskPenaltyRule1(e){return ze.applyMaskPenaltyRule1Internal(e,!0)+ze.applyMaskPenaltyRule1Internal(e,!1)}static applyMaskPenaltyRule2(e){let t=0;const i=e.getArray(),r=e.getWidth(),s=e.getHeight();for(let o=0;o<s-1;o++){const c=i[o];for(let h=0;h<r-1;h++){const f=c[h];f===c[h+1]&&f===i[o+1][h]&&f===i[o+1][h+1]&&t++}}return ze.N2*t}static applyMaskPenaltyRule3(e){let t=0;const i=e.getArray(),r=e.getWidth(),s=e.getHeight();for(let o=0;o<s;o++)for(let c=0;c<r;c++){const h=i[o];c+6<r&&h[c]===1&&h[c+1]===0&&h[c+2]===1&&h[c+3]===1&&h[c+4]===1&&h[c+5]===0&&h[c+6]===1&&(ze.isWhiteHorizontal(h,c-4,c)||ze.isWhiteHorizontal(h,c+7,c+11))&&t++,o+6<s&&i[o][c]===1&&i[o+1][c]===0&&i[o+2][c]===1&&i[o+3][c]===1&&i[o+4][c]===1&&i[o+5][c]===0&&i[o+6][c]===1&&(ze.isWhiteVertical(i,c,o-4,o)||ze.isWhiteVertical(i,c,o+7,o+11))&&t++}return t*ze.N3}static isWhiteHorizontal(e,t,i){t=Math.max(t,0),i=Math.min(i,e.length);for(let r=t;r<i;r++)if(e[r]===1)return!1;return!0}static isWhiteVertical(e,t,i,r){i=Math.max(i,0),r=Math.min(r,e.length);for(let s=i;s<r;s++)if(e[s][t]===1)return!1;return!0}static applyMaskPenaltyRule4(e){let t=0;const i=e.getArray(),r=e.getWidth(),s=e.getHeight();for(let h=0;h<s;h++){const f=i[h];for(let p=0;p<r;p++)f[p]===1&&t++}const o=e.getHeight()*e.getWidth();return Math.floor(Math.abs(t*2-o)*10/o)*ze.N4}static getDataMaskBit(e,t,i){let r,s;switch(e){case 0:r=i+t&1;break;case 1:r=i&1;break;case 2:r=t%3;break;case 3:r=(i+t)%3;break;case 4:r=Math.floor(i/2)+Math.floor(t/3)&1;break;case 5:s=i*t,r=(s&1)+s%3;break;case 6:s=i*t,r=(s&1)+s%3&1;break;case 7:s=i*t,r=s%3+(i+t&1)&1;break;default:throw new I("Invalid mask pattern: "+e)}return r===0}static applyMaskPenaltyRule1Internal(e,t){let i=0;const r=t?e.getHeight():e.getWidth(),s=t?e.getWidth():e.getHeight(),o=e.getArray();for(let c=0;c<r;c++){let h=0,f=-1;for(let p=0;p<s;p++){const w=t?o[c][p]:o[p][c];w===f?h++:(h>=5&&(i+=ze.N1+(h-5)),h=1,f=w)}h>=5&&(i+=ze.N1+(h-5))}return i}}ze.N1=3,ze.N2=3,ze.N3=40,ze.N4=10;class Zr{constructor(e,t){this.width=e,this.height=t;const i=new Array(t);for(let r=0;r!==t;r++)i[r]=new Uint8Array(e);this.bytes=i}getHeight(){return this.height}getWidth(){return this.width}get(e,t){return this.bytes[t][e]}getArray(){return this.bytes}setNumber(e,t,i){this.bytes[t][e]=i}setBoolean(e,t,i){this.bytes[t][e]=i?1:0}clear(e){for(const t of this.bytes)le.fill(t,e)}equals(e){if(!(e instanceof Zr))return!1;const t=e;if(this.width!==t.width||this.height!==t.height)return!1;for(let i=0,r=this.height;i<r;++i){const s=this.bytes[i],o=t.bytes[i];for(let c=0,h=this.width;c<h;++c)if(s[c]!==o[c])return!1}return!0}toString(){const e=new se;for(let t=0,i=this.height;t<i;++t){const r=this.bytes[t];for(let s=0,o=this.width;s<o;++s)switch(r[s]){case 0:e.append(" 0");break;case 1:e.append(" 1");break;default:e.append("  ");break}e.append(`
`)}return e.toString()}}class Ei{constructor(){this.maskPattern=-1}getMode(){return this.mode}getECLevel(){return this.ecLevel}getVersion(){return this.version}getMaskPattern(){return this.maskPattern}getMatrix(){return this.matrix}toString(){const e=new se;return e.append(`<<
`),e.append(" mode: "),e.append(this.mode?this.mode.toString():"null"),e.append(`
 ecLevel: `),e.append(this.ecLevel?this.ecLevel.toString():"null"),e.append(`
 version: `),e.append(this.version?this.version.toString():"null"),e.append(`
 maskPattern: `),e.append(this.maskPattern.toString()),this.matrix?(e.append(`
 matrix:
`),e.append(this.matrix.toString())):e.append(`
 matrix: null
`),e.append(`>>
`),e.toString()}setMode(e){this.mode=e}setECLevel(e){this.ecLevel=e}setVersion(e){this.version=e}setMaskPattern(e){this.maskPattern=e}setMatrix(e){this.matrix=e}static isValidMaskPattern(e){return e>=0&&e<Ei.NUM_MASK_PATTERNS}}Ei.NUM_MASK_PATTERNS=8;class Se extends _{}Se.kind="WriterException";class J{constructor(){}static clearMatrix(e){e.clear(255)}static buildMatrix(e,t,i,r,s){J.clearMatrix(s),J.embedBasicPatterns(i,s),J.embedTypeInfo(t,r,s),J.maybeEmbedVersionInfo(i,s),J.embedDataBits(e,r,s)}static embedBasicPatterns(e,t){J.embedPositionDetectionPatternsAndSeparators(t),J.embedDarkDotAtLeftBottomCorner(t),J.maybeEmbedPositionAdjustmentPatterns(e,t),J.embedTimingPatterns(t)}static embedTypeInfo(e,t,i){const r=new ce;J.makeTypeInfoBits(e,t,r);for(let s=0,o=r.getSize();s<o;++s){const c=r.get(r.getSize()-1-s),h=J.TYPE_INFO_COORDINATES[s],f=h[0],p=h[1];if(i.setBoolean(f,p,c),s<8){const w=i.getWidth()-s-1;i.setBoolean(w,8,c)}else{const b=i.getHeight()-7+(s-8);i.setBoolean(8,b,c)}}}static maybeEmbedVersionInfo(e,t){if(e.getVersionNumber()<7)return;const i=new ce;J.makeVersionInfoBits(e,i);let r=6*3-1;for(let s=0;s<6;++s)for(let o=0;o<3;++o){const c=i.get(r);r--,t.setBoolean(s,t.getHeight()-11+o,c),t.setBoolean(t.getHeight()-11+o,s,c)}}static embedDataBits(e,t,i){let r=0,s=-1,o=i.getWidth()-1,c=i.getHeight()-1;for(;o>0;){for(o===6&&(o-=1);c>=0&&c<i.getHeight();){for(let h=0;h<2;++h){const f=o-h;if(!J.isEmpty(i.get(f,c)))continue;let p;r<e.getSize()?(p=e.get(r),++r):p=!1,t!==255&&ze.getDataMaskBit(t,f,c)&&(p=!p),i.setBoolean(f,c,p)}c+=s}s=-s,c+=s,o-=2}if(r!==e.getSize())throw new Se("Not all bits consumed: "+r+"/"+e.getSize())}static findMSBSet(e){return 32-K.numberOfLeadingZeros(e)}static calculateBCHCode(e,t){if(t===0)throw new I("0 polynomial");const i=J.findMSBSet(t);for(e<<=i-1;J.findMSBSet(e)>=i;)e^=t<<J.findMSBSet(e)-i;return e}static makeTypeInfoBits(e,t,i){if(!Ei.isValidMaskPattern(t))throw new Se("Invalid mask pattern");const r=e.getBits()<<3|t;i.appendBits(r,5);const s=J.calculateBCHCode(r,J.TYPE_INFO_POLY);i.appendBits(s,10);const o=new ce;if(o.appendBits(J.TYPE_INFO_MASK_PATTERN,15),i.xor(o),i.getSize()!==15)throw new Se("should not happen but we got: "+i.getSize())}static makeVersionInfoBits(e,t){t.appendBits(e.getVersionNumber(),6);const i=J.calculateBCHCode(e.getVersionNumber(),J.VERSION_INFO_POLY);if(t.appendBits(i,12),t.getSize()!==18)throw new Se("should not happen but we got: "+t.getSize())}static isEmpty(e){return e===255}static embedTimingPatterns(e){for(let t=8;t<e.getWidth()-8;++t){const i=(t+1)%2;J.isEmpty(e.get(t,6))&&e.setNumber(t,6,i),J.isEmpty(e.get(6,t))&&e.setNumber(6,t,i)}}static embedDarkDotAtLeftBottomCorner(e){if(e.get(8,e.getHeight()-8)===0)throw new Se;e.setNumber(8,e.getHeight()-8,1)}static embedHorizontalSeparationPattern(e,t,i){for(let r=0;r<8;++r){if(!J.isEmpty(i.get(e+r,t)))throw new Se;i.setNumber(e+r,t,0)}}static embedVerticalSeparationPattern(e,t,i){for(let r=0;r<7;++r){if(!J.isEmpty(i.get(e,t+r)))throw new Se;i.setNumber(e,t+r,0)}}static embedPositionAdjustmentPattern(e,t,i){for(let r=0;r<5;++r){const s=J.POSITION_ADJUSTMENT_PATTERN[r];for(let o=0;o<5;++o)i.setNumber(e+o,t+r,s[o])}}static embedPositionDetectionPattern(e,t,i){for(let r=0;r<7;++r){const s=J.POSITION_DETECTION_PATTERN[r];for(let o=0;o<7;++o)i.setNumber(e+o,t+r,s[o])}}static embedPositionDetectionPatternsAndSeparators(e){const t=J.POSITION_DETECTION_PATTERN[0].length;J.embedPositionDetectionPattern(0,0,e),J.embedPositionDetectionPattern(e.getWidth()-t,0,e),J.embedPositionDetectionPattern(0,e.getWidth()-t,e);const i=8;J.embedHorizontalSeparationPattern(0,i-1,e),J.embedHorizontalSeparationPattern(e.getWidth()-i,i-1,e),J.embedHorizontalSeparationPattern(0,e.getWidth()-i,e);const r=7;J.embedVerticalSeparationPattern(r,0,e),J.embedVerticalSeparationPattern(e.getHeight()-r-1,0,e),J.embedVerticalSeparationPattern(r,e.getHeight()-r,e)}static maybeEmbedPositionAdjustmentPatterns(e,t){if(e.getVersionNumber()<2)return;const i=e.getVersionNumber()-1,r=J.POSITION_ADJUSTMENT_PATTERN_COORDINATE_TABLE[i];for(let s=0,o=r.length;s!==o;s++){const c=r[s];if(c>=0)for(let h=0;h!==o;h++){const f=r[h];f>=0&&J.isEmpty(t.get(f,c))&&J.embedPositionAdjustmentPattern(f-2,c-2,t)}}}}J.POSITION_DETECTION_PATTERN=Array.from([Int32Array.from([1,1,1,1,1,1,1]),Int32Array.from([1,0,0,0,0,0,1]),Int32Array.from([1,0,1,1,1,0,1]),Int32Array.from([1,0,1,1,1,0,1]),Int32Array.from([1,0,1,1,1,0,1]),Int32Array.from([1,0,0,0,0,0,1]),Int32Array.from([1,1,1,1,1,1,1])]),J.POSITION_ADJUSTMENT_PATTERN=Array.from([Int32Array.from([1,1,1,1,1]),Int32Array.from([1,0,0,0,1]),Int32Array.from([1,0,1,0,1]),Int32Array.from([1,0,0,0,1]),Int32Array.from([1,1,1,1,1])]),J.POSITION_ADJUSTMENT_PATTERN_COORDINATE_TABLE=Array.from([Int32Array.from([-1,-1,-1,-1,-1,-1,-1]),Int32Array.from([6,18,-1,-1,-1,-1,-1]),Int32Array.from([6,22,-1,-1,-1,-1,-1]),Int32Array.from([6,26,-1,-1,-1,-1,-1]),Int32Array.from([6,30,-1,-1,-1,-1,-1]),Int32Array.from([6,34,-1,-1,-1,-1,-1]),Int32Array.from([6,22,38,-1,-1,-1,-1]),Int32Array.from([6,24,42,-1,-1,-1,-1]),Int32Array.from([6,26,46,-1,-1,-1,-1]),Int32Array.from([6,28,50,-1,-1,-1,-1]),Int32Array.from([6,30,54,-1,-1,-1,-1]),Int32Array.from([6,32,58,-1,-1,-1,-1]),Int32Array.from([6,34,62,-1,-1,-1,-1]),Int32Array.from([6,26,46,66,-1,-1,-1]),Int32Array.from([6,26,48,70,-1,-1,-1]),Int32Array.from([6,26,50,74,-1,-1,-1]),Int32Array.from([6,30,54,78,-1,-1,-1]),Int32Array.from([6,30,56,82,-1,-1,-1]),Int32Array.from([6,30,58,86,-1,-1,-1]),Int32Array.from([6,34,62,90,-1,-1,-1]),Int32Array.from([6,28,50,72,94,-1,-1]),Int32Array.from([6,26,50,74,98,-1,-1]),Int32Array.from([6,30,54,78,102,-1,-1]),Int32Array.from([6,28,54,80,106,-1,-1]),Int32Array.from([6,32,58,84,110,-1,-1]),Int32Array.from([6,30,58,86,114,-1,-1]),Int32Array.from([6,34,62,90,118,-1,-1]),Int32Array.from([6,26,50,74,98,122,-1]),Int32Array.from([6,30,54,78,102,126,-1]),Int32Array.from([6,26,52,78,104,130,-1]),Int32Array.from([6,30,56,82,108,134,-1]),Int32Array.from([6,34,60,86,112,138,-1]),Int32Array.from([6,30,58,86,114,142,-1]),Int32Array.from([6,34,62,90,118,146,-1]),Int32Array.from([6,30,54,78,102,126,150]),Int32Array.from([6,24,50,76,102,128,154]),Int32Array.from([6,28,54,80,106,132,158]),Int32Array.from([6,32,58,84,110,136,162]),Int32Array.from([6,26,54,82,110,138,166]),Int32Array.from([6,30,58,86,114,142,170])]),J.TYPE_INFO_COORDINATES=Array.from([Int32Array.from([8,0]),Int32Array.from([8,1]),Int32Array.from([8,2]),Int32Array.from([8,3]),Int32Array.from([8,4]),Int32Array.from([8,5]),Int32Array.from([8,7]),Int32Array.from([8,8]),Int32Array.from([7,8]),Int32Array.from([5,8]),Int32Array.from([4,8]),Int32Array.from([3,8]),Int32Array.from([2,8]),Int32Array.from([1,8]),Int32Array.from([0,8])]),J.VERSION_INFO_POLY=7973,J.TYPE_INFO_POLY=1335,J.TYPE_INFO_MASK_PATTERN=21522;class cl{constructor(e,t){this.dataBytes=e,this.errorCorrectionBytes=t}getDataBytes(){return this.dataBytes}getErrorCorrectionBytes(){return this.errorCorrectionBytes}}class Oe{constructor(){}static calculateMaskPenalty(e){return ze.applyMaskPenaltyRule1(e)+ze.applyMaskPenaltyRule2(e)+ze.applyMaskPenaltyRule3(e)+ze.applyMaskPenaltyRule4(e)}static encode(e,t,i=null){let r=Oe.DEFAULT_BYTE_MODE_ENCODING;const s=i!==null&&i.get(je.CHARACTER_SET)!==void 0;s&&(r=i.get(je.CHARACTER_SET).toString());const o=this.chooseMode(e,r),c=new ce;if(o===q.BYTE&&(s||Oe.DEFAULT_BYTE_MODE_ENCODING!==r)){const U=P.getCharacterSetECIByName(r);U!==void 0&&this.appendECI(U,c)}this.appendModeInfo(o,c);const h=new ce;this.appendBytes(e,o,h,r);let f;if(i!==null&&i.get(je.QR_VERSION)!==void 0){const U=Number.parseInt(i.get(je.QR_VERSION).toString(),10);f=Y.getVersionForNumber(U);const B=this.calculateBitsNeeded(o,c,h,f);if(!this.willFit(B,f,t))throw new Se("Data too big for requested version")}else f=this.recommendVersion(t,o,c,h);const p=new ce;p.appendBitArray(c);const w=o===q.BYTE?h.getSizeInBytes():e.length;this.appendLengthInfo(w,f,o,p),p.appendBitArray(h);const b=f.getECBlocksForLevel(t),y=f.getTotalCodewords()-b.getTotalECCodewords();this.terminateBits(y,p);const E=this.interleaveWithECBytes(p,f.getTotalCodewords(),y,b.getNumBlocks()),S=new Ei;S.setECLevel(t),S.setMode(o),S.setVersion(f);const T=f.getDimensionForVersion(),R=new Zr(T,T),F=this.chooseMaskPattern(E,t,f,R);return S.setMaskPattern(F),J.buildMatrix(E,t,f,F,R),S.setMatrix(R),S}static recommendVersion(e,t,i,r){const s=this.calculateBitsNeeded(t,i,r,Y.getVersionForNumber(1)),o=this.chooseVersion(s,e),c=this.calculateBitsNeeded(t,i,r,o);return this.chooseVersion(c,e)}static calculateBitsNeeded(e,t,i,r){return t.getSize()+e.getCharacterCountBits(r)+i.getSize()}static getAlphanumericCode(e){return e<Oe.ALPHANUMERIC_TABLE.length?Oe.ALPHANUMERIC_TABLE[e]:-1}static chooseMode(e,t=null){if(P.SJIS.getName()===t&&this.isOnlyDoubleByteKanji(e))return q.KANJI;let i=!1,r=!1;for(let s=0,o=e.length;s<o;++s){const c=e.charAt(s);if(Oe.isDigit(c))i=!0;else if(this.getAlphanumericCode(c.charCodeAt(0))!==-1)r=!0;else return q.BYTE}return r?q.ALPHANUMERIC:i?q.NUMERIC:q.BYTE}static isOnlyDoubleByteKanji(e){let t;try{t=De.encode(e,P.SJIS)}catch{return!1}const i=t.length;if(i%2!==0)return!1;for(let r=0;r<i;r+=2){const s=t[r]&255;if((s<129||s>159)&&(s<224||s>235))return!1}return!0}static chooseMaskPattern(e,t,i,r){let s=Number.MAX_SAFE_INTEGER,o=-1;for(let c=0;c<Ei.NUM_MASK_PATTERNS;c++){J.buildMatrix(e,t,i,c,r);let h=this.calculateMaskPenalty(r);h<s&&(s=h,o=c)}return o}static chooseVersion(e,t){for(let i=1;i<=40;i++){const r=Y.getVersionForNumber(i);if(Oe.willFit(e,r,t))return r}throw new Se("Data too big")}static willFit(e,t,i){const r=t.getTotalCodewords(),o=t.getECBlocksForLevel(i).getTotalECCodewords(),c=r-o,h=(e+7)/8;return c>=h}static terminateBits(e,t){const i=e*8;if(t.getSize()>i)throw new Se("data bits cannot fit in the QR Code"+t.getSize()+" > "+i);for(let o=0;o<4&&t.getSize()<i;++o)t.appendBit(!1);const r=t.getSize()&7;if(r>0)for(let o=r;o<8;o++)t.appendBit(!1);const s=e-t.getSizeInBytes();for(let o=0;o<s;++o)t.appendBits(o&1?17:236,8);if(t.getSize()!==i)throw new Se("Bits size does not equal capacity")}static getNumDataBytesAndNumECBytesForBlockID(e,t,i,r,s,o){if(r>=i)throw new Se("Block ID too large");const c=e%i,h=i-c,f=Math.floor(e/i),p=f+1,w=Math.floor(t/i),b=w+1,y=f-w,E=p-b;if(y!==E)throw new Se("EC bytes mismatch");if(i!==h+c)throw new Se("RS blocks mismatch");if(e!==(w+y)*h+(b+E)*c)throw new Se("Total bytes mismatch");r<h?(s[0]=w,o[0]=y):(s[0]=b,o[0]=E)}static interleaveWithECBytes(e,t,i,r){if(e.getSizeInBytes()!==i)throw new Se("Number of bits and data bytes does not match");let s=0,o=0,c=0;const h=new Array;for(let p=0;p<r;++p){const w=new Int32Array(1),b=new Int32Array(1);Oe.getNumDataBytesAndNumECBytesForBlockID(t,i,r,p,w,b);const y=w[0],E=new Uint8Array(y);e.toBytes(8*s,E,0,y);const S=Oe.generateECBytes(E,b[0]);h.push(new cl(E,S)),o=Math.max(o,y),c=Math.max(c,S.length),s+=w[0]}if(i!==s)throw new Se("Data bytes does not match offset");const f=new ce;for(let p=0;p<o;++p)for(const w of h){const b=w.getDataBytes();p<b.length&&f.appendBits(b[p],8)}for(let p=0;p<c;++p)for(const w of h){const b=w.getErrorCorrectionBytes();p<b.length&&f.appendBits(b[p],8)}if(t!==f.getSizeInBytes())throw new Se("Interleaving error: "+t+" and "+f.getSizeInBytes()+" differ.");return f}static generateECBytes(e,t){const i=e.length,r=new Int32Array(i+t);for(let o=0;o<i;o++)r[o]=e[o]&255;new Ln(be.QR_CODE_FIELD_256).encode(r,t);const s=new Uint8Array(t);for(let o=0;o<t;o++)s[o]=r[i+o];return s}static appendModeInfo(e,t){t.appendBits(e.getBits(),4)}static appendLengthInfo(e,t,i,r){const s=i.getCharacterCountBits(t);if(e>=1<<s)throw new Se(e+" is bigger than "+((1<<s)-1));r.appendBits(e,s)}static appendBytes(e,t,i,r){switch(t){case q.NUMERIC:Oe.appendNumericBytes(e,i);break;case q.ALPHANUMERIC:Oe.appendAlphanumericBytes(e,i);break;case q.BYTE:Oe.append8BitBytes(e,i,r);break;case q.KANJI:Oe.appendKanjiBytes(e,i);break;default:throw new Se("Invalid mode: "+t)}}static getDigit(e){return e.charCodeAt(0)-48}static isDigit(e){const t=Oe.getDigit(e);return t>=0&&t<=9}static appendNumericBytes(e,t){const i=e.length;let r=0;for(;r<i;){const s=Oe.getDigit(e.charAt(r));if(r+2<i){const o=Oe.getDigit(e.charAt(r+1)),c=Oe.getDigit(e.charAt(r+2));t.appendBits(s*100+o*10+c,10),r+=3}else if(r+1<i){const o=Oe.getDigit(e.charAt(r+1));t.appendBits(s*10+o,7),r+=2}else t.appendBits(s,4),r++}}static appendAlphanumericBytes(e,t){const i=e.length;let r=0;for(;r<i;){const s=Oe.getAlphanumericCode(e.charCodeAt(r));if(s===-1)throw new Se;if(r+1<i){const o=Oe.getAlphanumericCode(e.charCodeAt(r+1));if(o===-1)throw new Se;t.appendBits(s*45+o,11),r+=2}else t.appendBits(s,6),r++}}static append8BitBytes(e,t,i){let r;try{r=De.encode(e,i)}catch(s){throw new Se(s)}for(let s=0,o=r.length;s!==o;s++){const c=r[s];t.appendBits(c,8)}}static appendKanjiBytes(e,t){let i;try{i=De.encode(e,P.SJIS)}catch(s){throw new Se(s)}const r=i.length;for(let s=0;s<r;s+=2){const o=i[s]&255,c=i[s+1]&255,h=o<<8&4294967295|c;let f=-1;if(h>=33088&&h<=40956?f=h-33088:h>=57408&&h<=60351&&(f=h-49472),f===-1)throw new Se("Invalid byte sequence");const p=(f>>8)*192+(f&255);t.appendBits(p,13)}}static appendECI(e,t){t.appendBits(q.ECI.getBits(),4),t.appendBits(e.getValue(),8)}}Oe.ALPHANUMERIC_TABLE=Int32Array.from([-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,36,-1,-1,-1,37,38,-1,-1,-1,-1,39,40,-1,41,42,43,0,1,2,3,4,5,6,7,8,9,44,-1,-1,-1,-1,-1,-1,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,-1,-1,-1,-1,-1]),Oe.DEFAULT_BYTE_MODE_ENCODING=P.UTF8.getName();class Si{write(e,t,i,r=null){if(e.length===0)throw new I("Found empty contents");if(t<0||i<0)throw new I("Requested dimensions are too small: "+t+"x"+i);let s=Ne.L,o=Si.QUIET_ZONE_SIZE;r!==null&&(r.get(je.ERROR_CORRECTION)!==void 0&&(s=Ne.fromString(r.get(je.ERROR_CORRECTION).toString())),r.get(je.MARGIN)!==void 0&&(o=Number.parseInt(r.get(je.MARGIN).toString(),10)));const c=Oe.encode(e,s,r);return this.renderResult(c,t,i,o)}writeToDom(e,t,i,r,s=null){typeof e=="string"&&(e=document.querySelector(e));const o=this.write(t,i,r,s);e&&e.appendChild(o)}renderResult(e,t,i,r){const s=e.getMatrix();if(s===null)throw new Bt;const o=s.getWidth(),c=s.getHeight(),h=o+r*2,f=c+r*2,p=Math.max(t,h),w=Math.max(i,f),b=Math.min(Math.floor(p/h),Math.floor(w/f)),y=Math.floor((p-o*b)/2),E=Math.floor((w-c*b)/2),S=this.createSVGElement(p,w);for(let T=0,R=E;T<c;T++,R+=b)for(let F=0,U=y;F<o;F++,U+=b)if(s.get(F,T)===1){const B=this.createSvgRectElement(U,R,b,b);S.appendChild(B)}return S}createSVGElement(e,t){const i=document.createElementNS(Si.SVG_NS,"svg");return i.setAttributeNS(null,"height",e.toString()),i.setAttributeNS(null,"width",t.toString()),i}createSvgRectElement(e,t,i,r){const s=document.createElementNS(Si.SVG_NS,"rect");return s.setAttributeNS(null,"x",e.toString()),s.setAttributeNS(null,"y",t.toString()),s.setAttributeNS(null,"height",i.toString()),s.setAttributeNS(null,"width",r.toString()),s.setAttributeNS(null,"fill","#000000"),s}}Si.QUIET_ZONE_SIZE=4,Si.SVG_NS="http://www.w3.org/2000/svg";class Xi{encode(e,t,i,r,s){if(e.length===0)throw new I("Found empty contents");if(t!==Q.QR_CODE)throw new I("Can only encode QR_CODE, but got "+t);if(i<0||r<0)throw new I(`Requested dimensions are too small: ${i}x${r}`);let o=Ne.L,c=Xi.QUIET_ZONE_SIZE;s!==null&&(s.get(je.ERROR_CORRECTION)!==void 0&&(o=Ne.fromString(s.get(je.ERROR_CORRECTION).toString())),s.get(je.MARGIN)!==void 0&&(c=Number.parseInt(s.get(je.MARGIN).toString(),10)));const h=Oe.encode(e,o,s);return Xi.renderResult(h,i,r,c)}static renderResult(e,t,i,r){const s=e.getMatrix();if(s===null)throw new Bt;const o=s.getWidth(),c=s.getHeight(),h=o+r*2,f=c+r*2,p=Math.max(t,h),w=Math.max(i,f),b=Math.min(Math.floor(p/h),Math.floor(w/f)),y=Math.floor((p-o*b)/2),E=Math.floor((w-c*b)/2),S=new Me(p,w);for(let T=0,R=E;T<c;T++,R+=b)for(let F=0,U=y;F<o;F++,U+=b)s.get(F,T)===1&&S.setRegion(U,R,b,b);return S}}Xi.QUIET_ZONE_SIZE=4;class dl{encode(e,t,i,r,s){let o;switch(t){case Q.QR_CODE:o=new Xi;break;default:throw new I("No encoder available for format "+t)}return o.encode(e,t,i,r,s)}}class zt extends dr{constructor(e,t,i,r,s,o,c,h){if(super(o,c),this.yuvData=e,this.dataWidth=t,this.dataHeight=i,this.left=r,this.top=s,r+o>t||s+c>i)throw new I("Crop rectangle does not fit within image data.");h&&this.reverseHorizontal(o,c)}getRow(e,t){if(e<0||e>=this.getHeight())throw new I("Requested row is outside the image: "+e);const i=this.getWidth();(t==null||t.length<i)&&(t=new Uint8ClampedArray(i));const r=(e+this.top)*this.dataWidth+this.left;return te.arraycopy(this.yuvData,r,t,0,i),t}getMatrix(){const e=this.getWidth(),t=this.getHeight();if(e===this.dataWidth&&t===this.dataHeight)return this.yuvData;const i=e*t,r=new Uint8ClampedArray(i);let s=this.top*this.dataWidth+this.left;if(e===this.dataWidth)return te.arraycopy(this.yuvData,s,r,0,i),r;for(let o=0;o<t;o++){const c=o*e;te.arraycopy(this.yuvData,s,r,c,e),s+=this.dataWidth}return r}isCropSupported(){return!0}crop(e,t,i,r){return new zt(this.yuvData,this.dataWidth,this.dataHeight,this.left+e,this.top+t,i,r,!1)}renderThumbnail(){const e=this.getWidth()/zt.THUMBNAIL_SCALE_FACTOR,t=this.getHeight()/zt.THUMBNAIL_SCALE_FACTOR,i=new Int32Array(e*t),r=this.yuvData;let s=this.top*this.dataWidth+this.left;for(let o=0;o<t;o++){const c=o*e;for(let h=0;h<e;h++){const f=r[s+h*zt.THUMBNAIL_SCALE_FACTOR]&255;i[c+h]=4278190080|f*65793}s+=this.dataWidth*zt.THUMBNAIL_SCALE_FACTOR}return i}getThumbnailWidth(){return this.getWidth()/zt.THUMBNAIL_SCALE_FACTOR}getThumbnailHeight(){return this.getHeight()/zt.THUMBNAIL_SCALE_FACTOR}reverseHorizontal(e,t){const i=this.yuvData;for(let r=0,s=this.top*this.dataWidth+this.left;r<t;r++,s+=this.dataWidth){const o=s+e/2;for(let c=s,h=s+e-1;c<o;c++,h--){const f=i[c];i[c]=i[h],i[h]=f}}}invert(){return new ii(this)}}zt.THUMBNAIL_SCALE_FACTOR=2;class Fn extends dr{constructor(e,t,i,r,s,o,c){if(super(t,i),this.dataWidth=r,this.dataHeight=s,this.left=o,this.top=c,e.BYTES_PER_ELEMENT===4){const h=t*i,f=new Uint8ClampedArray(h);for(let p=0;p<h;p++){const w=e[p],b=w>>16&255,y=w>>7&510,E=w&255;f[p]=(b+y+E)/4&255}this.luminances=f}else this.luminances=e;if(r===void 0&&(this.dataWidth=t),s===void 0&&(this.dataHeight=i),o===void 0&&(this.left=0),c===void 0&&(this.top=0),this.left+t>this.dataWidth||this.top+i>this.dataHeight)throw new I("Crop rectangle does not fit within image data.")}getRow(e,t){if(e<0||e>=this.getHeight())throw new I("Requested row is outside the image: "+e);const i=this.getWidth();(t==null||t.length<i)&&(t=new Uint8ClampedArray(i));const r=(e+this.top)*this.dataWidth+this.left;return te.arraycopy(this.luminances,r,t,0,i),t}getMatrix(){const e=this.getWidth(),t=this.getHeight();if(e===this.dataWidth&&t===this.dataHeight)return this.luminances;const i=e*t,r=new Uint8ClampedArray(i);let s=this.top*this.dataWidth+this.left;if(e===this.dataWidth)return te.arraycopy(this.luminances,s,r,0,i),r;for(let o=0;o<t;o++){const c=o*e;te.arraycopy(this.luminances,s,r,c,e),s+=this.dataWidth}return r}isCropSupported(){return!0}crop(e,t,i,r){return new Fn(this.luminances,i,r,this.dataWidth,this.dataHeight,this.left+e,this.top+t)}invert(){return new ii(this)}}class ea extends P{static forName(e){return this.getCharacterSetECIByName(e)}}class Un{}Un.ISO_8859_1=P.ISO8859_1;class ta{isCompact(){return this.compact}setCompact(e){this.compact=e}getSize(){return this.size}setSize(e){this.size=e}getLayers(){return this.layers}setLayers(e){this.layers=e}getCodeWords(){return this.codeWords}setCodeWords(e){this.codeWords=e}getMatrix(){return this.matrix}setMatrix(e){this.matrix=e}}class ia{static singletonList(e){return[e]}static min(e,t){return e.sort(t)[0]}}class hl{constructor(e){this.previous=e}getPrevious(){return this.previous}}class ji extends hl{constructor(e,t,i){super(e),this.value=t,this.bitCount=i}appendTo(e,t){e.appendBits(this.value,this.bitCount)}add(e,t){return new ji(this,e,t)}addBinaryShift(e,t){return console.warn("addBinaryShift on SimpleToken, this simply returns a copy of this token"),new ji(this,e,t)}toString(){let e=this.value&(1<<this.bitCount)-1;return e|=1<<this.bitCount,"<"+K.toBinaryString(e|1<<this.bitCount).substring(1)+">"}}class zn extends ji{constructor(e,t,i){super(e,0,0),this.binaryShiftStart=t,this.binaryShiftByteCount=i}appendTo(e,t){for(let i=0;i<this.binaryShiftByteCount;i++)(i===0||i===31&&this.binaryShiftByteCount<=62)&&(e.appendBits(31,5),this.binaryShiftByteCount>62?e.appendBits(this.binaryShiftByteCount-31,16):i===0?e.appendBits(Math.min(this.binaryShiftByteCount,31),5):e.appendBits(this.binaryShiftByteCount-31,5)),e.appendBits(t[this.binaryShiftStart+i],8)}addBinaryShift(e,t){return new zn(this,e,t)}toString(){return"<"+this.binaryShiftStart+"::"+(this.binaryShiftStart+this.binaryShiftByteCount-1)+">"}}function ul(x,e,t){return new zn(x,e,t)}function vr(x,e,t){return new ji(x,e,t)}const fl=["UPPER","LOWER","DIGIT","MIXED","PUNCT"],di=0,qr=1,St=2,ra=3,Vt=4,gl=new ji(null,0,0),Vn=[Int32Array.from([0,(5<<16)+28,(5<<16)+30,(5<<16)+29,656318]),Int32Array.from([(9<<16)+480+14,0,(5<<16)+30,(5<<16)+29,656318]),Int32Array.from([(4<<16)+14,(9<<16)+448+28,0,(9<<16)+448+29,932798]),Int32Array.from([(5<<16)+29,(5<<16)+28,656318,0,(5<<16)+30]),Int32Array.from([(5<<16)+31,656380,656382,656381,0])];function pl(x){for(let e of x)le.fill(e,-1);return x[di][Vt]=0,x[qr][Vt]=0,x[qr][di]=28,x[ra][Vt]=0,x[St][Vt]=0,x[St][di]=15,x}const na=pl(le.createInt32Array(6,6));class $t{constructor(e,t,i,r){this.token=e,this.mode=t,this.binaryShiftByteCount=i,this.bitCount=r}getMode(){return this.mode}getToken(){return this.token}getBinaryShiftByteCount(){return this.binaryShiftByteCount}getBitCount(){return this.bitCount}latchAndAppend(e,t){let i=this.bitCount,r=this.token;if(e!==this.mode){let o=Vn[this.mode][e];r=vr(r,o&65535,o>>16),i+=o>>16}let s=e===St?4:5;return r=vr(r,t,s),new $t(r,e,0,i+s)}shiftAndAppend(e,t){let i=this.token,r=this.mode===St?4:5;return i=vr(i,na[this.mode][e],r),i=vr(i,t,5),new $t(i,this.mode,0,this.bitCount+r+5)}addBinaryShiftChar(e){let t=this.token,i=this.mode,r=this.bitCount;if(this.mode===Vt||this.mode===St){let c=Vn[i][di];t=vr(t,c&65535,c>>16),r+=c>>16,i=di}let s=this.binaryShiftByteCount===0||this.binaryShiftByteCount===31?18:this.binaryShiftByteCount===62?9:8,o=new $t(t,i,this.binaryShiftByteCount+1,r+s);return o.binaryShiftByteCount===2078&&(o=o.endBinaryShift(e+1)),o}endBinaryShift(e){if(this.binaryShiftByteCount===0)return this;let t=this.token;return t=ul(t,e-this.binaryShiftByteCount,this.binaryShiftByteCount),new $t(t,this.mode,0,this.bitCount)}isBetterThanOrEqualTo(e){let t=this.bitCount+(Vn[this.mode][e.mode]>>16);return this.binaryShiftByteCount<e.binaryShiftByteCount?t+=$t.calculateBinaryShiftCost(e)-$t.calculateBinaryShiftCost(this):this.binaryShiftByteCount>e.binaryShiftByteCount&&e.binaryShiftByteCount>0&&(t+=10),t<=e.bitCount}toBitArray(e){let t=[];for(let r=this.endBinaryShift(e.length).token;r!==null;r=r.getPrevious())t.unshift(r);let i=new ce;for(const r of t)r.appendTo(i,e);return i}toString(){return Z.format("%s bits=%d bytes=%d",fl[this.mode],this.bitCount,this.binaryShiftByteCount)}static calculateBinaryShiftCost(e){return e.binaryShiftByteCount>62?21:e.binaryShiftByteCount>31?20:e.binaryShiftByteCount>0?10:0}}$t.INITIAL_STATE=new $t(gl,di,0,0);function ml(x){const e=Z.getCharCode(" "),t=Z.getCharCode("."),i=Z.getCharCode(",");x[di][e]=1;const r=Z.getCharCode("Z"),s=Z.getCharCode("A");for(let b=s;b<=r;b++)x[di][b]=b-s+2;x[qr][e]=1;const o=Z.getCharCode("z"),c=Z.getCharCode("a");for(let b=c;b<=o;b++)x[qr][b]=b-c+2;x[St][e]=1;const h=Z.getCharCode("9"),f=Z.getCharCode("0");for(let b=f;b<=h;b++)x[St][b]=b-f+2;x[St][i]=12,x[St][t]=13;const p=["\0"," ","","","","","","","\x07","\b","	",`
`,"\v","\f","\r","\x1B","","","","","@","\\","^","_","`","|","~",""];for(let b=0;b<p.length;b++)x[ra][Z.getCharCode(p[b])]=b;const w=["\0","\r","\0","\0","\0","\0","!","'","#","$","%","&","'","(",")","*","+",",","-",".","/",":",";","<","=",">","?","[","]","{","}"];for(let b=0;b<w.length;b++)Z.getCharCode(w[b])>0&&(x[Vt][Z.getCharCode(w[b])]=b);return x}const $n=ml(le.createInt32Array(5,256));class yr{constructor(e){this.text=e}encode(){const e=Z.getCharCode(" "),t=Z.getCharCode(`
`);let i=ia.singletonList($t.INITIAL_STATE);for(let s=0;s<this.text.length;s++){let o,c=s+1<this.text.length?this.text[s+1]:0;switch(this.text[s]){case Z.getCharCode("\r"):o=c===t?2:0;break;case Z.getCharCode("."):o=c===e?3:0;break;case Z.getCharCode(","):o=c===e?4:0;break;case Z.getCharCode(":"):o=c===e?5:0;break;default:o=0}o>0?(i=yr.updateStateListForPair(i,s,o),s++):i=this.updateStateListForChar(i,s)}return ia.min(i,(s,o)=>s.getBitCount()-o.getBitCount()).toBitArray(this.text)}updateStateListForChar(e,t){const i=[];for(let r of e)this.updateStateForChar(r,t,i);return yr.simplifyStates(i)}updateStateForChar(e,t,i){let r=this.text[t]&255,s=$n[e.getMode()][r]>0,o=null;for(let c=0;c<=Vt;c++){let h=$n[c][r];if(h>0){if(o==null&&(o=e.endBinaryShift(t)),!s||c===e.getMode()||c===St){const f=o.latchAndAppend(c,h);i.push(f)}if(!s&&na[e.getMode()][c]>=0){const f=o.shiftAndAppend(c,h);i.push(f)}}}if(e.getBinaryShiftByteCount()>0||$n[e.getMode()][r]===0){let c=e.addBinaryShiftChar(t);i.push(c)}}static updateStateListForPair(e,t,i){const r=[];for(let s of e)this.updateStateForPair(s,t,i,r);return this.simplifyStates(r)}static updateStateForPair(e,t,i,r){let s=e.endBinaryShift(t);if(r.push(s.latchAndAppend(Vt,i)),e.getMode()!==Vt&&r.push(s.shiftAndAppend(Vt,i)),i===3||i===4){let o=s.latchAndAppend(St,16-i).latchAndAppend(St,1);r.push(o)}if(e.getBinaryShiftByteCount()>0){let o=e.addBinaryShiftChar(t).addBinaryShiftChar(t+1);r.push(o)}}static simplifyStates(e){let t=[];for(const i of e){let r=!0;for(const s of t){if(s.isBetterThanOrEqualTo(i)){r=!1;break}i.isBetterThanOrEqualTo(s)&&(t=t.filter(o=>o!==s))}r&&t.push(i)}return t}}class xe{constructor(){}static encodeBytes(e){return xe.encode(e,xe.DEFAULT_EC_PERCENT,xe.DEFAULT_AZTEC_LAYERS)}static encode(e,t,i){let r=new yr(e).encode(),s=K.truncDivision(r.getSize()*t,100)+11,o=r.getSize()+s,c,h,f,p,w;if(i!==xe.DEFAULT_AZTEC_LAYERS){if(c=i<0,h=Math.abs(i),h>(c?xe.MAX_NB_BITS_COMPACT:xe.MAX_NB_BITS))throw new I(Z.format("Illegal value %s for layers",i));f=xe.totalBitsInLayer(h,c),p=xe.WORD_SIZE[h];let B=f-f%p;if(w=xe.stuffBits(r,p),w.getSize()+s>B)throw new I("Data to large for user specified layer");if(c&&w.getSize()>p*64)throw new I("Data to large for user specified layer")}else{p=0,w=null;for(let B=0;;B++){if(B>xe.MAX_NB_BITS)throw new I("Data too large for an Aztec code");if(c=B<=3,h=c?B+1:B,f=xe.totalBitsInLayer(h,c),o>f)continue;(w==null||p!==xe.WORD_SIZE[h])&&(p=xe.WORD_SIZE[h],w=xe.stuffBits(r,p));let ue=f-f%p;if(!(c&&w.getSize()>p*64)&&w.getSize()+s<=ue)break}}let b=xe.generateCheckWords(w,f,p),y=w.getSize()/p,E=xe.generateModeMessage(c,h,y),S=(c?11:14)+h*4,T=new Int32Array(S),R;if(c){R=S;for(let B=0;B<T.length;B++)T[B]=B}else{R=S+1+2*K.truncDivision(K.truncDivision(S,2)-1,15);let B=K.truncDivision(S,2),ue=K.truncDivision(R,2);for(let re=0;re<B;re++){let xt=re+K.truncDivision(re,15);T[B-re-1]=ue-xt-1,T[B+re]=ue+xt+1}}let F=new Me(R);for(let B=0,ue=0;B<h;B++){let re=(h-B)*4+(c?9:12);for(let xt=0;xt<re;xt++){let Ot=xt*2;for(let wt=0;wt<2;wt++)b.get(ue+Ot+wt)&&F.set(T[B*2+wt],T[B*2+xt]),b.get(ue+re*2+Ot+wt)&&F.set(T[B*2+xt],T[S-1-B*2-wt]),b.get(ue+re*4+Ot+wt)&&F.set(T[S-1-B*2-wt],T[S-1-B*2-xt]),b.get(ue+re*6+Ot+wt)&&F.set(T[S-1-B*2-xt],T[B*2+wt])}ue+=re*8}if(xe.drawModeMessage(F,c,R,E),c)xe.drawBullsEye(F,K.truncDivision(R,2),5);else{xe.drawBullsEye(F,K.truncDivision(R,2),7);for(let B=0,ue=0;B<K.truncDivision(S,2)-1;B+=15,ue+=16)for(let re=K.truncDivision(R,2)&1;re<R;re+=2)F.set(K.truncDivision(R,2)-ue,re),F.set(K.truncDivision(R,2)+ue,re),F.set(re,K.truncDivision(R,2)-ue),F.set(re,K.truncDivision(R,2)+ue)}let U=new ta;return U.setCompact(c),U.setSize(R),U.setLayers(h),U.setCodeWords(y),U.setMatrix(F),U}static drawBullsEye(e,t,i){for(let r=0;r<i;r+=2)for(let s=t-r;s<=t+r;s++)e.set(s,t-r),e.set(s,t+r),e.set(t-r,s),e.set(t+r,s);e.set(t-i,t-i),e.set(t-i+1,t-i),e.set(t-i,t-i+1),e.set(t+i,t-i),e.set(t+i,t-i+1),e.set(t+i,t+i-1)}static generateModeMessage(e,t,i){let r=new ce;return e?(r.appendBits(t-1,2),r.appendBits(i-1,6),r=xe.generateCheckWords(r,28,4)):(r.appendBits(t-1,5),r.appendBits(i-1,11),r=xe.generateCheckWords(r,40,4)),r}static drawModeMessage(e,t,i,r){let s=K.truncDivision(i,2);if(t)for(let o=0;o<7;o++){let c=s-3+o;r.get(o)&&e.set(c,s-5),r.get(o+7)&&e.set(s+5,c),r.get(20-o)&&e.set(c,s+5),r.get(27-o)&&e.set(s-5,c)}else for(let o=0;o<10;o++){let c=s-5+o+K.truncDivision(o,5);r.get(o)&&e.set(c,s-7),r.get(o+10)&&e.set(s+7,c),r.get(29-o)&&e.set(c,s+7),r.get(39-o)&&e.set(s-7,c)}}static generateCheckWords(e,t,i){let r=e.getSize()/i,s=new Ln(xe.getGF(i)),o=K.truncDivision(t,i),c=xe.bitsToWords(e,i,o);s.encode(c,o-r);let h=t%i,f=new ce;f.appendBits(0,h);for(const p of Array.from(c))f.appendBits(p,i);return f}static bitsToWords(e,t,i){let r=new Int32Array(i),s,o;for(s=0,o=e.getSize()/t;s<o;s++){let c=0;for(let h=0;h<t;h++)c|=e.get(s*t+h)?1<<t-h-1:0;r[s]=c}return r}static getGF(e){switch(e){case 4:return be.AZTEC_PARAM;case 6:return be.AZTEC_DATA_6;case 8:return be.AZTEC_DATA_8;case 10:return be.AZTEC_DATA_10;case 12:return be.AZTEC_DATA_12;default:throw new I("Unsupported word size "+e)}}static stuffBits(e,t){let i=new ce,r=e.getSize(),s=(1<<t)-2;for(let o=0;o<r;o+=t){let c=0;for(let h=0;h<t;h++)(o+h>=r||e.get(o+h))&&(c|=1<<t-1-h);(c&s)===s?(i.appendBits(c&s,t),o--):c&s?i.appendBits(c,t):(i.appendBits(c|1,t),o--)}return i}static totalBitsInLayer(e,t){return((t?88:112)+16*e)*e}}xe.DEFAULT_EC_PERCENT=33,xe.DEFAULT_AZTEC_LAYERS=0,xe.MAX_NB_BITS=32,xe.MAX_NB_BITS_COMPACT=4,xe.WORD_SIZE=Int32Array.from([4,6,6,8,8,8,8,8,8,10,10,10,10,10,10,10,10,10,10,10,10,10,10,12,12,12,12,12,12,12,12,12,12]);class Qr{encode(e,t,i,r){return this.encodeWithHints(e,t,i,r,null)}encodeWithHints(e,t,i,r,s){let o=Un.ISO_8859_1,c=xe.DEFAULT_EC_PERCENT,h=xe.DEFAULT_AZTEC_LAYERS;return s!=null&&(s.has(je.CHARACTER_SET)&&(o=ea.forName(s.get(je.CHARACTER_SET).toString())),s.has(je.ERROR_CORRECTION)&&(c=K.parseInt(s.get(je.ERROR_CORRECTION).toString())),s.has(je.AZTEC_LAYERS)&&(h=K.parseInt(s.get(je.AZTEC_LAYERS).toString()))),Qr.encodeLayers(e,t,i,r,o,c,h)}static encodeLayers(e,t,i,r,s,o,c){if(t!==Q.AZTEC)throw new I("Can only encode AZTEC, but got "+t);let h=xe.encode(Z.getBytes(e,s),o,c);return Qr.renderResult(h,i,r)}static renderResult(e,t,i){let r=e.getMatrix();if(r==null)throw new Bt;let s=r.getWidth(),o=r.getHeight(),c=Math.max(t,s),h=Math.max(i,o),f=Math.min(c/s,h/o),p=(c-s*f)/2,w=(h-o*f)/2,b=new Me(c,h);for(let y=0,E=w;y<o;y++,E+=f)for(let S=0,T=p;S<s;S++,T+=f)r.get(S,y)&&b.setRegion(T,E,f,f);return b}}n.AbstractExpandedDecoder=In,n.ArgumentException=k,n.ArithmeticException=zr,n.AztecCode=ta,n.AztecCodeReader=Hr,n.AztecCodeWriter=Qr,n.AztecDecoder=Te,n.AztecDetector=Vs,n.AztecDetectorResult=Us,n.AztecEncoder=xe,n.AztecHighLevelEncoder=yr,n.AztecPoint=dt,n.BarcodeFormat=Q,n.Binarizer=pe,n.BinaryBitmap=$,n.BitArray=ce,n.BitMatrix=Me,n.BitSource=Rn,n.BrowserAztecCodeReader=$o,n.BrowserBarcodeReader=jo,n.BrowserCodeReader=_i,n.BrowserDatamatrixCodeReader=Yo,n.BrowserMultiFormatReader=al,n.BrowserPDF417Reader=ol,n.BrowserQRCodeReader=ll,n.BrowserQRCodeSvgWriter=Si,n.CharacterSetECI=P,n.ChecksumException=X,n.Code128Reader=V,n.Code39Reader=We,n.DataMatrixDecodedBitStreamParser=ai,n.DataMatrixReader=oi,n.DecodeHintType=we,n.DecoderResult=hr,n.DefaultGridSampler=zs,n.DetectorResult=$r,n.EAN13Reader=vi,n.EncodeHintType=je,n.Exception=_,n.FormatException=z,n.GenericGF=be,n.GenericGFPoly=ft,n.GlobalHistogramBinarizer=Ke,n.GridSampler=Cn,n.GridSamplerInstance=ni,n.HTMLCanvasElementLuminanceSource=ri,n.HybridBinarizer=ae,n.ITFReader=Ee,n.IllegalArgumentException=I,n.IllegalStateException=Bt,n.InvertedLuminanceSource=ii,n.LuminanceSource=dr,n.MathUtils=me,n.MultiFormatOneDReader=Gi,n.MultiFormatReader=Js,n.MultiFormatWriter=dl,n.NotFoundException=D,n.OneDReader=Ge,n.PDF417DecodedBitStreamParser=O,n.PDF417DecoderErrorCorrection=js,n.PDF417Reader=rt,n.PDF417ResultMetadata=Ys,n.PerspectiveTransform=Tt,n.PlanarYUVLuminanceSource=zt,n.QRCodeByteMatrix=Zr,n.QRCodeDataMask=At,n.QRCodeDecodedBitStreamParser=Pe,n.QRCodeDecoderErrorCorrectionLevel=Ne,n.QRCodeDecoderFormatInformation=at,n.QRCodeEncoder=Oe,n.QRCodeEncoderQRCode=Ei,n.QRCodeMaskUtil=ze,n.QRCodeMatrixUtil=J,n.QRCodeMode=q,n.QRCodeReader=li,n.QRCodeVersion=Y,n.QRCodeWriter=Xi,n.RGBLuminanceSource=Fn,n.RSS14Reader=Ue,n.RSSExpandedReader=M,n.ReaderException=Yr,n.ReedSolomonDecoder=fr,n.ReedSolomonEncoder=Ln,n.ReedSolomonException=zi,n.Result=ct,n.ResultMetadataType=Ye,n.ResultPoint=j,n.StringUtils=Z,n.UnsupportedOperationException=et,n.VideoInputDevice=Fs,n.WhiteRectangleDetector=Wt,n.WriterException=Se,n.ZXingArrays=le,n.ZXingCharset=ea,n.ZXingInteger=K,n.ZXingStandardCharsets=Un,n.ZXingStringBuilder=se,n.ZXingStringEncoding=De,n.ZXingSystem=te,n.createAbstractExpandedDecoder=Ws,Object.defineProperty(n,"__esModule",{value:!0})})})(_s,_s.exports);var Be=_s.exports;const fh=Object.freeze(Object.defineProperty({__proto__:null},Symbol.toStringTag,{value:"Module"}));var $a=function(){function l(a,n,d){if(this.formatMap=new Map([[W.QR_CODE,Be.BarcodeFormat.QR_CODE],[W.AZTEC,Be.BarcodeFormat.AZTEC],[W.CODABAR,Be.BarcodeFormat.CODABAR],[W.CODE_39,Be.BarcodeFormat.CODE_39],[W.CODE_93,Be.BarcodeFormat.CODE_93],[W.CODE_128,Be.BarcodeFormat.CODE_128],[W.DATA_MATRIX,Be.BarcodeFormat.DATA_MATRIX],[W.MAXICODE,Be.BarcodeFormat.MAXICODE],[W.ITF,Be.BarcodeFormat.ITF],[W.EAN_13,Be.BarcodeFormat.EAN_13],[W.EAN_8,Be.BarcodeFormat.EAN_8],[W.PDF_417,Be.BarcodeFormat.PDF_417],[W.RSS_14,Be.BarcodeFormat.RSS_14],[W.RSS_EXPANDED,Be.BarcodeFormat.RSS_EXPANDED],[W.UPC_A,Be.BarcodeFormat.UPC_A],[W.UPC_E,Be.BarcodeFormat.UPC_E],[W.UPC_EAN_EXTENSION,Be.BarcodeFormat.UPC_EAN_EXTENSION]]),this.reverseFormatMap=this.createReverseFormatMap(),!fh)throw"Use html5qrcode.min.js without edit, ZXing not found.";this.verbose=n,this.logger=d;var u=this.createZXingFormats(a),g=new Map;g.set(Be.DecodeHintType.POSSIBLE_FORMATS,u),g.set(Be.DecodeHintType.TRY_HARDER,!1),this.hints=g}return l.prototype.decodeAsync=function(a){var n=this;return new Promise(function(d,u){try{d(n.decode(a))}catch(g){u(g)}})},l.prototype.decode=function(a){var n=new Be.MultiFormatReader(this.verbose,this.hints),d=new Be.HTMLCanvasElementLuminanceSource(a),u=new Be.BinaryBitmap(new Be.HybridBinarizer(d)),g=n.decode(u);return{text:g.text,format:Po.create(this.toHtml5QrcodeSupportedFormats(g.format)),debugData:this.createDebugData()}},l.prototype.createReverseFormatMap=function(){var a=new Map;return this.formatMap.forEach(function(n,d,u){a.set(n,d)}),a},l.prototype.toHtml5QrcodeSupportedFormats=function(a){if(!this.reverseFormatMap.has(a))throw"reverseFormatMap doesn't have ".concat(a);return this.reverseFormatMap.get(a)},l.prototype.createZXingFormats=function(a){for(var n=[],d=0,u=a;d<u.length;d++){var g=u[d];this.formatMap.has(g)?n.push(this.formatMap.get(g)):this.logger.logError("".concat(g," is not supported by")+"ZXingHtml5QrcodeShim")}return n},l.prototype.createDebugData=function(){return{decoderName:"zxing-js"}},l}(),gh=function(l,a,n,d){function u(g){return g instanceof n?g:new n(function(m){m(g)})}return new(n||(n=Promise))(function(g,m){function C(k){try{_(d.next(k))}catch(I){m(I)}}function A(k){try{_(d.throw(k))}catch(I){m(I)}}function _(k){k.done?g(k.value):u(k.value).then(C,A)}_((d=d.apply(l,a||[])).next())})},ph=function(l,a){var n={label:0,sent:function(){if(g[0]&1)throw g[1];return g[1]},trys:[],ops:[]},d,u,g,m;return m={next:C(0),throw:C(1),return:C(2)},typeof Symbol=="function"&&(m[Symbol.iterator]=function(){return this}),m;function C(_){return function(k){return A([_,k])}}function A(_){if(d)throw new TypeError("Generator is already executing.");for(;m&&(m=0,_[0]&&(n=0)),n;)try{if(d=1,u&&(g=_[0]&2?u.return:_[0]?u.throw||((g=u.return)&&g.call(u),0):u.next)&&!(g=g.call(u,_[1])).done)return g;switch(u=0,g&&(_=[_[0]&2,g.value]),_[0]){case 0:case 1:g=_;break;case 4:return n.label++,{value:_[1],done:!1};case 5:n.label++,u=_[1],_=[0];continue;case 7:_=n.ops.pop(),n.trys.pop();continue;default:if(g=n.trys,!(g=g.length>0&&g[g.length-1])&&(_[0]===6||_[0]===2)){n=0;continue}if(_[0]===3&&(!g||_[1]>g[0]&&_[1]<g[3])){n.label=_[1];break}if(_[0]===6&&n.label<g[1]){n.label=g[1],g=_;break}if(g&&n.label<g[2]){n.label=g[2],n.ops.push(_);break}g[2]&&n.ops.pop(),n.trys.pop();continue}_=a.call(l,n)}catch(k){_=[6,k],u=0}finally{d=g=0}if(_[0]&5)throw _[1];return{value:_[0]?_[1]:void 0,done:!0}}},Ha=function(){function l(a,n,d){if(this.formatMap=new Map([[W.QR_CODE,"qr_code"],[W.AZTEC,"aztec"],[W.CODABAR,"codabar"],[W.CODE_39,"code_39"],[W.CODE_93,"code_93"],[W.CODE_128,"code_128"],[W.DATA_MATRIX,"data_matrix"],[W.ITF,"itf"],[W.EAN_13,"ean_13"],[W.EAN_8,"ean_8"],[W.PDF_417,"pdf417"],[W.UPC_A,"upc_a"],[W.UPC_E,"upc_e"]]),this.reverseFormatMap=this.createReverseFormatMap(),!l.isSupported())throw"Use html5qrcode.min.js without edit, Use BarcodeDetectorDelegate only if it isSupported();";this.verbose=n,this.logger=d;var u=this.createBarcodeDetectorFormats(a);if(this.detector=new BarcodeDetector(u),!this.detector)throw"BarcodeDetector detector not supported"}return l.isSupported=function(){if(!("BarcodeDetector"in window))return!1;var a=new BarcodeDetector({formats:["qr_code"]});return typeof a<"u"},l.prototype.decodeAsync=function(a){return gh(this,void 0,void 0,function(){var n,d;return ph(this,function(u){switch(u.label){case 0:return[4,this.detector.detect(a)];case 1:if(n=u.sent(),!n||n.length===0)throw"No barcode or QR code detected.";return d=this.selectLargestBarcode(n),[2,{text:d.rawValue,format:Po.create(this.toHtml5QrcodeSupportedFormats(d.format)),debugData:this.createDebugData()}]}})})},l.prototype.selectLargestBarcode=function(a){for(var n=null,d=0,u=0,g=a;u<g.length;u++){var m=g[u],C=m.boundingBox.width*m.boundingBox.height;C>d&&(d=C,n=m)}if(!n)throw"No largest barcode found";return n},l.prototype.createBarcodeDetectorFormats=function(a){for(var n=[],d=0,u=a;d<u.length;d++){var g=u[d];this.formatMap.has(g)?n.push(this.formatMap.get(g)):this.logger.warn("".concat(g," is not supported by")+"BarcodeDetectorDelegate")}return{formats:n}},l.prototype.toHtml5QrcodeSupportedFormats=function(a){if(!this.reverseFormatMap.has(a))throw"reverseFormatMap doesn't have ".concat(a);return this.reverseFormatMap.get(a)},l.prototype.createReverseFormatMap=function(){var a=new Map;return this.formatMap.forEach(function(n,d,u){a.set(n,d)}),a},l.prototype.createDebugData=function(){return{decoderName:"BarcodeDetector"}},l}(),Ga=function(l,a,n,d){function u(g){return g instanceof n?g:new n(function(m){m(g)})}return new(n||(n=Promise))(function(g,m){function C(k){try{_(d.next(k))}catch(I){m(I)}}function A(k){try{_(d.throw(k))}catch(I){m(I)}}function _(k){k.done?g(k.value):u(k.value).then(C,A)}_((d=d.apply(l,a||[])).next())})},Wa=function(l,a){var n={label:0,sent:function(){if(g[0]&1)throw g[1];return g[1]},trys:[],ops:[]},d,u,g,m;return m={next:C(0),throw:C(1),return:C(2)},typeof Symbol=="function"&&(m[Symbol.iterator]=function(){return this}),m;function C(_){return function(k){return A([_,k])}}function A(_){if(d)throw new TypeError("Generator is already executing.");for(;m&&(m=0,_[0]&&(n=0)),n;)try{if(d=1,u&&(g=_[0]&2?u.return:_[0]?u.throw||((g=u.return)&&g.call(u),0):u.next)&&!(g=g.call(u,_[1])).done)return g;switch(u=0,g&&(_=[_[0]&2,g.value]),_[0]){case 0:case 1:g=_;break;case 4:return n.label++,{value:_[1],done:!1};case 5:n.label++,u=_[1],_=[0];continue;case 7:_=n.ops.pop(),n.trys.pop();continue;default:if(g=n.trys,!(g=g.length>0&&g[g.length-1])&&(_[0]===6||_[0]===2)){n=0;continue}if(_[0]===3&&(!g||_[1]>g[0]&&_[1]<g[3])){n.label=_[1];break}if(_[0]===6&&n.label<g[1]){n.label=g[1],g=_;break}if(g&&n.label<g[2]){n.label=g[2],n.ops.push(_);break}g[2]&&n.ops.pop(),n.trys.pop();continue}_=a.call(l,n)}catch(k){_=[6,k],u=0}finally{d=g=0}if(_[0]&5)throw _[1];return{value:_[0]?_[1]:void 0,done:!0}}},mh=function(){function l(a,n,d,u){this.EXECUTIONS_TO_REPORT_PERFORMANCE=100,this.executions=0,this.executionResults=[],this.wasPrimaryDecoderUsedInLastDecode=!1,this.verbose=d,n&&Ha.isSupported()?(this.primaryDecoder=new Ha(a,d,u),this.secondaryDecoder=new $a(a,d,u)):this.primaryDecoder=new $a(a,d,u)}return l.prototype.decodeAsync=function(a){return Ga(this,void 0,void 0,function(){var n;return Wa(this,function(d){switch(d.label){case 0:n=performance.now(),d.label=1;case 1:return d.trys.push([1,,3,4]),[4,this.getDecoder().decodeAsync(a)];case 2:return[2,d.sent()];case 3:return this.possiblyLogPerformance(n),[7];case 4:return[2]}})})},l.prototype.decodeRobustlyAsync=function(a){return Ga(this,void 0,void 0,function(){var n,d;return Wa(this,function(u){switch(u.label){case 0:n=performance.now(),u.label=1;case 1:return u.trys.push([1,3,4,5]),[4,this.primaryDecoder.decodeAsync(a)];case 2:return[2,u.sent()];case 3:if(d=u.sent(),this.secondaryDecoder)return[2,this.secondaryDecoder.decodeAsync(a)];throw d;case 4:return this.possiblyLogPerformance(n),[7];case 5:return[2]}})})},l.prototype.getDecoder=function(){return this.secondaryDecoder?this.wasPrimaryDecoderUsedInLastDecode===!1?(this.wasPrimaryDecoderUsedInLastDecode=!0,this.primaryDecoder):(this.wasPrimaryDecoderUsedInLastDecode=!1,this.secondaryDecoder):this.primaryDecoder},l.prototype.possiblyLogPerformance=function(a){if(this.verbose){var n=performance.now()-a;this.executionResults.push(n),this.executions++,this.possiblyFlushPerformanceReport()}},l.prototype.possiblyFlushPerformanceReport=function(){if(!(this.executions<this.EXECUTIONS_TO_REPORT_PERFORMANCE)){for(var a=0,n=0,d=this.executionResults;n<d.length;n++){var u=d[n];a+=u}var g=a/this.executionResults.length;console.log("".concat(g," ms for ").concat(this.executionResults.length," last runs.")),this.executions=0,this.executionResults=[]}},l}(),Bs=function(){var l=function(a,n){return l=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(d,u){d.__proto__=u}||function(d,u){for(var g in u)Object.prototype.hasOwnProperty.call(u,g)&&(d[g]=u[g])},l(a,n)};return function(a,n){if(typeof n!="function"&&n!==null)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");l(a,n);function d(){this.constructor=a}a.prototype=n===null?Object.create(n):(d.prototype=n.prototype,new d)}}(),cn=function(l,a,n,d){function u(g){return g instanceof n?g:new n(function(m){m(g)})}return new(n||(n=Promise))(function(g,m){function C(k){try{_(d.next(k))}catch(I){m(I)}}function A(k){try{_(d.throw(k))}catch(I){m(I)}}function _(k){k.done?g(k.value):u(k.value).then(C,A)}_((d=d.apply(l,a||[])).next())})},dn=function(l,a){var n={label:0,sent:function(){if(g[0]&1)throw g[1];return g[1]},trys:[],ops:[]},d,u,g,m;return m={next:C(0),throw:C(1),return:C(2)},typeof Symbol=="function"&&(m[Symbol.iterator]=function(){return this}),m;function C(_){return function(k){return A([_,k])}}function A(_){if(d)throw new TypeError("Generator is already executing.");for(;m&&(m=0,_[0]&&(n=0)),n;)try{if(d=1,u&&(g=_[0]&2?u.return:_[0]?u.throw||((g=u.return)&&g.call(u),0):u.next)&&!(g=g.call(u,_[1])).done)return g;switch(u=0,g&&(_=[_[0]&2,g.value]),_[0]){case 0:case 1:g=_;break;case 4:return n.label++,{value:_[1],done:!1};case 5:n.label++,u=_[1],_=[0];continue;case 7:_=n.ops.pop(),n.trys.pop();continue;default:if(g=n.trys,!(g=g.length>0&&g[g.length-1])&&(_[0]===6||_[0]===2)){n=0;continue}if(_[0]===3&&(!g||_[1]>g[0]&&_[1]<g[3])){n.label=_[1];break}if(_[0]===6&&n.label<g[1]){n.label=g[1],g=_;break}if(g&&n.label<g[2]){n.label=g[2],n.ops.push(_);break}g[2]&&n.ops.pop(),n.trys.pop();continue}_=a.call(l,n)}catch(k){_=[6,k],u=0}finally{d=g=0}if(_[0]&5)throw _[1];return{value:_[0]?_[1]:void 0,done:!0}}},Lo=function(){function l(a,n){this.name=a,this.track=n}return l.prototype.isSupported=function(){return this.track.getCapabilities?this.name in this.track.getCapabilities():!1},l.prototype.apply=function(a){var n={};n[this.name]=a;var d={advanced:[n]};return this.track.applyConstraints(d)},l.prototype.value=function(){var a=this.track.getSettings();if(this.name in a){var n=a[this.name];return n}return null},l}(),xh=function(l){Bs(a,l);function a(n,d){return l.call(this,n,d)||this}return a.prototype.min=function(){return this.getCapabilities().min},a.prototype.max=function(){return this.getCapabilities().max},a.prototype.step=function(){return this.getCapabilities().step},a.prototype.apply=function(n){var d={};d[this.name]=n;var u={advanced:[d]};return this.track.applyConstraints(u)},a.prototype.getCapabilities=function(){this.failIfNotSupported();var n=this.track.getCapabilities(),d=n[this.name];return{min:d.min,max:d.max,step:d.step}},a.prototype.failIfNotSupported=function(){if(!this.isSupported())throw new Error("".concat(this.name," capability not supported"))},a}(Lo),wh=function(l){Bs(a,l);function a(n){return l.call(this,"zoom",n)||this}return a}(xh),bh=function(l){Bs(a,l);function a(n){return l.call(this,"torch",n)||this}return a}(Lo),_h=function(){function l(a){this.track=a}return l.prototype.zoomFeature=function(){return new wh(this.track)},l.prototype.torchFeature=function(){return new bh(this.track)},l}(),vh=function(){function l(a,n,d){this.isClosed=!1,this.parentElement=a,this.mediaStream=n,this.callbacks=d,this.surface=this.createVideoElement(this.parentElement.clientWidth),a.append(this.surface)}return l.prototype.createVideoElement=function(a){var n=document.createElement("video");return n.style.width="".concat(a,"px"),n.style.display="block",n.muted=!0,n.setAttribute("muted","true"),n.playsInline=!0,n},l.prototype.setupSurface=function(){var a=this;this.surface.onabort=function(){throw"RenderedCameraImpl video surface onabort() called"},this.surface.onerror=function(){throw"RenderedCameraImpl video surface onerror() called"};var n=function(){var d=a.surface.clientWidth,u=a.surface.clientHeight;a.callbacks.onRenderSurfaceReady(d,u),a.surface.removeEventListener("playing",n)};this.surface.addEventListener("playing",n),this.surface.srcObject=this.mediaStream,this.surface.play()},l.create=function(a,n,d,u){return cn(this,void 0,void 0,function(){var g,m;return dn(this,function(C){switch(C.label){case 0:return g=new l(a,n,u),d.aspectRatio?(m={aspectRatio:d.aspectRatio},[4,g.getFirstTrackOrFail().applyConstraints(m)]):[3,2];case 1:C.sent(),C.label=2;case 2:return g.setupSurface(),[2,g]}})})},l.prototype.failIfClosed=function(){if(this.isClosed)throw"The RenderedCamera has already been closed."},l.prototype.getFirstTrackOrFail=function(){if(this.failIfClosed(),this.mediaStream.getVideoTracks().length===0)throw"No video tracks found";return this.mediaStream.getVideoTracks()[0]},l.prototype.pause=function(){this.failIfClosed(),this.surface.pause()},l.prototype.resume=function(a){this.failIfClosed();var n=this,d=function(){setTimeout(a,200),n.surface.removeEventListener("playing",d)};this.surface.addEventListener("playing",d),this.surface.play()},l.prototype.isPaused=function(){return this.failIfClosed(),this.surface.paused},l.prototype.getSurface=function(){return this.failIfClosed(),this.surface},l.prototype.getRunningTrackCapabilities=function(){return this.getFirstTrackOrFail().getCapabilities()},l.prototype.getRunningTrackSettings=function(){return this.getFirstTrackOrFail().getSettings()},l.prototype.applyVideoConstraints=function(a){return cn(this,void 0,void 0,function(){return dn(this,function(n){if("aspectRatio"in a)throw"Changing 'aspectRatio' in run-time is not yet supported.";return[2,this.getFirstTrackOrFail().applyConstraints(a)]})})},l.prototype.close=function(){if(this.isClosed)return Promise.resolve();var a=this;return new Promise(function(n,d){var u=a.mediaStream.getVideoTracks(),g=u.length,m=0;a.mediaStream.getVideoTracks().forEach(function(C){a.mediaStream.removeTrack(C),C.stop(),++m,m>=g&&(a.isClosed=!0,a.parentElement.removeChild(a.surface),n())})})},l.prototype.getCapabilities=function(){return new _h(this.getFirstTrackOrFail())},l}(),yh=function(){function l(a){this.mediaStream=a}return l.prototype.render=function(a,n,d){return cn(this,void 0,void 0,function(){return dn(this,function(u){return[2,vh.create(a,this.mediaStream,n,d)]})})},l.create=function(a){return cn(this,void 0,void 0,function(){var n,d;return dn(this,function(u){switch(u.label){case 0:if(!navigator.mediaDevices)throw"navigator.mediaDevices not supported";return n={audio:!1,video:a},[4,navigator.mediaDevices.getUserMedia(n)];case 1:return d=u.sent(),[2,new l(d)]}})})},l}(),Xa=function(l,a,n,d){function u(g){return g instanceof n?g:new n(function(m){m(g)})}return new(n||(n=Promise))(function(g,m){function C(k){try{_(d.next(k))}catch(I){m(I)}}function A(k){try{_(d.throw(k))}catch(I){m(I)}}function _(k){k.done?g(k.value):u(k.value).then(C,A)}_((d=d.apply(l,a||[])).next())})},ja=function(l,a){var n={label:0,sent:function(){if(g[0]&1)throw g[1];return g[1]},trys:[],ops:[]},d,u,g,m;return m={next:C(0),throw:C(1),return:C(2)},typeof Symbol=="function"&&(m[Symbol.iterator]=function(){return this}),m;function C(_){return function(k){return A([_,k])}}function A(_){if(d)throw new TypeError("Generator is already executing.");for(;m&&(m=0,_[0]&&(n=0)),n;)try{if(d=1,u&&(g=_[0]&2?u.return:_[0]?u.throw||((g=u.return)&&g.call(u),0):u.next)&&!(g=g.call(u,_[1])).done)return g;switch(u=0,g&&(_=[_[0]&2,g.value]),_[0]){case 0:case 1:g=_;break;case 4:return n.label++,{value:_[1],done:!1};case 5:n.label++,u=_[1],_=[0];continue;case 7:_=n.ops.pop(),n.trys.pop();continue;default:if(g=n.trys,!(g=g.length>0&&g[g.length-1])&&(_[0]===6||_[0]===2)){n=0;continue}if(_[0]===3&&(!g||_[1]>g[0]&&_[1]<g[3])){n.label=_[1];break}if(_[0]===6&&n.label<g[1]){n.label=g[1],g=_;break}if(g&&n.label<g[2]){n.label=g[2],n.ops.push(_);break}g[2]&&n.ops.pop(),n.trys.pop();continue}_=a.call(l,n)}catch(k){_=[6,k],u=0}finally{d=g=0}if(_[0]&5)throw _[1];return{value:_[0]?_[1]:void 0,done:!0}}},Ch=function(){function l(){}return l.failIfNotSupported=function(){return Xa(this,void 0,void 0,function(){return ja(this,function(a){if(!navigator.mediaDevices)throw"navigator.mediaDevices not supported";return[2,new l]})})},l.prototype.create=function(a){return Xa(this,void 0,void 0,function(){return ja(this,function(n){return[2,yh.create(a)]})})},l}(),Ah=function(l,a,n,d){function u(g){return g instanceof n?g:new n(function(m){m(g)})}return new(n||(n=Promise))(function(g,m){function C(k){try{_(d.next(k))}catch(I){m(I)}}function A(k){try{_(d.throw(k))}catch(I){m(I)}}function _(k){k.done?g(k.value):u(k.value).then(C,A)}_((d=d.apply(l,a||[])).next())})},Eh=function(l,a){var n={label:0,sent:function(){if(g[0]&1)throw g[1];return g[1]},trys:[],ops:[]},d,u,g,m;return m={next:C(0),throw:C(1),return:C(2)},typeof Symbol=="function"&&(m[Symbol.iterator]=function(){return this}),m;function C(_){return function(k){return A([_,k])}}function A(_){if(d)throw new TypeError("Generator is already executing.");for(;m&&(m=0,_[0]&&(n=0)),n;)try{if(d=1,u&&(g=_[0]&2?u.return:_[0]?u.throw||((g=u.return)&&g.call(u),0):u.next)&&!(g=g.call(u,_[1])).done)return g;switch(u=0,g&&(_=[_[0]&2,g.value]),_[0]){case 0:case 1:g=_;break;case 4:return n.label++,{value:_[1],done:!1};case 5:n.label++,u=_[1],_=[0];continue;case 7:_=n.ops.pop(),n.trys.pop();continue;default:if(g=n.trys,!(g=g.length>0&&g[g.length-1])&&(_[0]===6||_[0]===2)){n=0;continue}if(_[0]===3&&(!g||_[1]>g[0]&&_[1]<g[3])){n.label=_[1];break}if(_[0]===6&&n.label<g[1]){n.label=g[1],g=_;break}if(g&&n.label<g[2]){n.label=g[2],n.ops.push(_);break}g[2]&&n.ops.pop(),n.trys.pop();continue}_=a.call(l,n)}catch(k){_=[6,k],u=0}finally{d=g=0}if(_[0]&5)throw _[1];return{value:_[0]?_[1]:void 0,done:!0}}},Sh=function(){function l(){}return l.retrieve=function(){if(navigator.mediaDevices)return l.getCamerasFromMediaDevices();var a=MediaStreamTrack;return MediaStreamTrack&&a.getSources?l.getCamerasFromMediaStreamTrack():l.rejectWithError()},l.rejectWithError=function(){var a=qi.unableToQuerySupportedDevices();return l.isHttpsOrLocalhost()||(a=qi.insecureContextCameraQueryError()),Promise.reject(a)},l.isHttpsOrLocalhost=function(){if(location.protocol==="https:")return!0;var a=location.host.split(":")[0];return a==="127.0.0.1"||a==="localhost"},l.getCamerasFromMediaDevices=function(){return Ah(this,void 0,void 0,function(){var a,n,d,u,g,m,C;return Eh(this,function(A){switch(A.label){case 0:return a=function(_){for(var k=_.getVideoTracks(),I=0,$=k;I<$.length;I++){var X=$[I];X.enabled=!1,X.stop(),_.removeTrack(X)}},[4,navigator.mediaDevices.getUserMedia({audio:!1,video:!0})];case 1:return n=A.sent(),[4,navigator.mediaDevices.enumerateDevices()];case 2:for(d=A.sent(),u=[],g=0,m=d;g<m.length;g++)C=m[g],C.kind==="videoinput"&&u.push({id:C.deviceId,label:C.label});return a(n),[2,u]}})})},l.getCamerasFromMediaStreamTrack=function(){return new Promise(function(a,n){var d=function(g){for(var m=[],C=0,A=g;C<A.length;C++){var _=A[C];_.kind==="video"&&m.push({id:_.id,label:_.label})}a(m)},u=MediaStreamTrack;u.getSources(d)})},l}(),Ve;(function(l){l[l.UNKNOWN=0]="UNKNOWN",l[l.NOT_STARTED=1]="NOT_STARTED",l[l.SCANNING=2]="SCANNING",l[l.PAUSED=3]="PAUSED"})(Ve||(Ve={}));var Ih=function(){function l(){this.state=Ve.NOT_STARTED,this.onGoingTransactionNewState=Ve.UNKNOWN}return l.prototype.directTransition=function(a){this.failIfTransitionOngoing(),this.validateTransition(a),this.state=a},l.prototype.startTransition=function(a){return this.failIfTransitionOngoing(),this.validateTransition(a),this.onGoingTransactionNewState=a,this},l.prototype.execute=function(){if(this.onGoingTransactionNewState===Ve.UNKNOWN)throw"Transaction is already cancelled, cannot execute().";var a=this.onGoingTransactionNewState;this.onGoingTransactionNewState=Ve.UNKNOWN,this.directTransition(a)},l.prototype.cancel=function(){if(this.onGoingTransactionNewState===Ve.UNKNOWN)throw"Transaction is already cancelled, cannot cancel().";this.onGoingTransactionNewState=Ve.UNKNOWN},l.prototype.getState=function(){return this.state},l.prototype.failIfTransitionOngoing=function(){if(this.onGoingTransactionNewState!==Ve.UNKNOWN)throw"Cannot transition to a new state, already under transition"},l.prototype.validateTransition=function(a){switch(this.state){case Ve.UNKNOWN:throw"Transition from unknown is not allowed";case Ve.NOT_STARTED:this.failIfNewStateIs(a,[Ve.PAUSED]);break;case Ve.SCANNING:break;case Ve.PAUSED:break}},l.prototype.failIfNewStateIs=function(a,n){for(var d=0,u=n;d<u.length;d++){var g=u[d];if(a===g)throw"Cannot transition from ".concat(this.state," to ").concat(a)}},l}(),Th=function(){function l(a){this.stateManager=a}return l.prototype.startTransition=function(a){return this.stateManager.startTransition(a)},l.prototype.directTransition=function(a){this.stateManager.directTransition(a)},l.prototype.getState=function(){return this.stateManager.getState()},l.prototype.canScanFile=function(){return this.stateManager.getState()===Ve.NOT_STARTED},l.prototype.isScanning=function(){return this.stateManager.getState()!==Ve.NOT_STARTED},l.prototype.isStrictlyScanning=function(){return this.stateManager.getState()===Ve.SCANNING},l.prototype.isPaused=function(){return this.stateManager.getState()===Ve.PAUSED},l}(),Nh=function(){function l(){}return l.create=function(){return new Th(new Ih)},l}(),Oh=function(){var l=function(a,n){return l=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(d,u){d.__proto__=u}||function(d,u){for(var g in u)Object.prototype.hasOwnProperty.call(u,g)&&(d[g]=u[g])},l(a,n)};return function(a,n){if(typeof n!="function"&&n!==null)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");l(a,n);function d(){this.constructor=a}a.prototype=n===null?Object.create(n):(d.prototype=n.prototype,new d)}}(),yt=function(l){Oh(a,l);function a(){return l!==null&&l.apply(this,arguments)||this}return a.DEFAULT_WIDTH=300,a.DEFAULT_WIDTH_OFFSET=2,a.FILE_SCAN_MIN_HEIGHT=300,a.FILE_SCAN_HIDDEN_CANVAS_PADDING=100,a.MIN_QR_BOX_SIZE=50,a.SHADED_LEFT=1,a.SHADED_RIGHT=2,a.SHADED_TOP=3,a.SHADED_BOTTOM=4,a.SHADED_REGION_ELEMENT_ID="qr-shaded-region",a.VERBOSE=!1,a.BORDER_SHADER_DEFAULT_COLOR="#ffffff",a.BORDER_SHADER_MATCH_COLOR="rgb(90, 193, 56)",a}(dh),Rh=function(){function l(a,n){this.logger=n,this.fps=yt.SCAN_DEFAULT_FPS,a?(a.fps&&(this.fps=a.fps),this.disableFlip=a.disableFlip===!0,this.qrbox=a.qrbox,this.aspectRatio=a.aspectRatio,this.videoConstraints=a.videoConstraints):this.disableFlip=yt.DEFAULT_DISABLE_FLIP}return l.prototype.isMediaStreamConstraintsValid=function(){return this.videoConstraints?Bo.isMediaStreamConstraintsValid(this.videoConstraints,this.logger):(this.logger.logError("Empty videoConstraints",!0),!1)},l.prototype.isShadedBoxEnabled=function(){return!Yt(this.qrbox)},l.create=function(a,n){return new l(a,n)},l}(),kh=function(){function l(a,n){if(this.element=null,this.canvasElement=null,this.scannerPausedUiElement=null,this.hasBorderShaders=null,this.borderShaders=null,this.qrMatch=null,this.renderedCamera=null,this.qrRegion=null,this.context=null,this.lastScanImageFile=null,this.isScanning=!1,!document.getElementById(a))throw"HTML Element with id=".concat(a," not found");this.elementId=a,this.verbose=!1;var d;typeof n=="boolean"?this.verbose=n===!0:n&&(d=n,this.verbose=d.verbose===!0,d.experimentalFeatures),this.logger=new uh(this.verbose),this.qrcode=new mh(this.getSupportedFormats(n),this.getUseBarCodeDetectorIfSupported(d),this.verbose,this.logger),this.foreverScanTimeout,this.shouldScan=!0,this.stateManagerProxy=Nh.create()}return l.prototype.start=function(a,n,d,u){var g=this;if(!a)throw"cameraIdOrConfig is required";if(!d||typeof d!="function")throw"qrCodeSuccessCallback is required and should be a function.";var m;u?m=u:m=this.verbose?this.logger.log:function(){};var C=Rh.create(n,this.logger);this.clearElement();var A=!1;C.videoConstraints&&(C.isMediaStreamConstraintsValid()?A=!0:this.logger.logError("'videoConstraints' is not valid 'MediaStreamConstraints, it will be ignored.'",!0));var _=A,k=document.getElementById(this.elementId);k.clientWidth?k.clientWidth:yt.DEFAULT_WIDTH,k.style.position="relative",this.shouldScan=!0,this.element=k;var I=this,$=this.stateManagerProxy.startTransition(Ve.SCANNING);return new Promise(function(X,pe){var te=_?C.videoConstraints:I.createVideoConstraints(a);if(!te){$.cancel(),pe("videoConstraints should be defined");return}var Le={};(!_||C.aspectRatio)&&(Le.aspectRatio=C.aspectRatio);var Ce={onRenderSurfaceReady:function(le,K){I.setupUi(le,K,C),I.isScanning=!0,I.foreverScan(C,d,m)}};Ch.failIfNotSupported().then(function(le){le.create(te).then(function(K){return K.render(g.element,Le,Ce).then(function(ce){I.renderedCamera=ce,$.execute(),X(null)}).catch(function(ce){$.cancel(),pe(ce)})}).catch(function(K){$.cancel(),pe(qi.errorGettingUserMedia(K))})}).catch(function(le){$.cancel(),pe(qi.cameraStreamingNotSupported())})})},l.prototype.pause=function(a){if(!this.stateManagerProxy.isStrictlyScanning())throw"Cannot pause, scanner is not scanning.";this.stateManagerProxy.directTransition(Ve.PAUSED),this.showPausedState(),(Yt(a)||a!==!0)&&(a=!1),a&&this.renderedCamera&&this.renderedCamera.pause()},l.prototype.resume=function(){if(!this.stateManagerProxy.isPaused())throw"Cannot result, scanner is not paused.";if(!this.renderedCamera)throw"renderedCamera doesn't exist while trying resume()";var a=this,n=function(){a.stateManagerProxy.directTransition(Ve.SCANNING),a.hidePausedState()};if(!this.renderedCamera.isPaused()){n();return}this.renderedCamera.resume(function(){n()})},l.prototype.getState=function(){return this.stateManagerProxy.getState()},l.prototype.stop=function(){var a=this;if(!this.stateManagerProxy.isScanning())throw"Cannot stop, scanner is not running or paused.";var n=this.stateManagerProxy.startTransition(Ve.NOT_STARTED);this.shouldScan=!1,this.foreverScanTimeout&&clearTimeout(this.foreverScanTimeout);var d=function(){if(a.element){var g=document.getElementById(yt.SHADED_REGION_ELEMENT_ID);g&&a.element.removeChild(g)}},u=this;return this.renderedCamera.close().then(function(){return u.renderedCamera=null,u.element&&(u.element.removeChild(u.canvasElement),u.canvasElement=null),d(),u.qrRegion&&(u.qrRegion=null),u.context&&(u.context=null),n.execute(),u.hidePausedState(),u.isScanning=!1,Promise.resolve()})},l.prototype.scanFile=function(a,n){return this.scanFileV2(a,n).then(function(d){return d.decodedText})},l.prototype.scanFileV2=function(a,n){var d=this;if(!a||!(a instanceof File))throw"imageFile argument is mandatory and should be instance of File. Use 'event.target.files[0]'.";if(Yt(n)&&(n=!0),!this.stateManagerProxy.canScanFile())throw"Cannot start file scan - ongoing camera scan";return new Promise(function(u,g){d.possiblyCloseLastScanImageFile(),d.clearElement(),d.lastScanImageFile=URL.createObjectURL(a);var m=new Image;m.onload=function(){var C=m.width,A=m.height,_=document.getElementById(d.elementId),k=_.clientWidth?_.clientWidth:yt.DEFAULT_WIDTH,I=Math.max(_.clientHeight?_.clientHeight:A,yt.FILE_SCAN_MIN_HEIGHT),$=d.computeCanvasDrawConfig(C,A,k,I);if(n){var X=d.createCanvasElement(k,I,"qr-canvas-visible");X.style.display="inline-block",_.appendChild(X);var pe=X.getContext("2d");if(!pe)throw"Unable to get 2d context from canvas";pe.canvas.width=k,pe.canvas.height=I,pe.drawImage(m,0,0,C,A,$.x,$.y,$.width,$.height)}var te=yt.FILE_SCAN_HIDDEN_CANVAS_PADDING,Le=Math.max(m.width,$.width),Ce=Math.max(m.height,$.height),le=Le+2*te,K=Ce+2*te,ce=d.createCanvasElement(le,K);_.appendChild(ce);var ut=ce.getContext("2d");if(!ut)throw"Unable to get 2d context from canvas";ut.canvas.width=le,ut.canvas.height=K,ut.drawImage(m,0,0,C,A,te,te,Le,Ce);try{d.qrcode.decodeRobustlyAsync(ce).then(function(we){u(Va.createFromQrcodeResult(we))}).catch(g)}catch(we){g("QR code parse error, error = ".concat(we))}},m.onerror=g,m.onabort=g,m.onstalled=g,m.onsuspend=g,m.src=URL.createObjectURL(a)})},l.prototype.clear=function(){this.clearElement()},l.getCameras=function(){return Sh.retrieve()},l.prototype.getRunningTrackCapabilities=function(){return this.getRenderedCameraOrFail().getRunningTrackCapabilities()},l.prototype.getRunningTrackSettings=function(){return this.getRenderedCameraOrFail().getRunningTrackSettings()},l.prototype.getRunningTrackCameraCapabilities=function(){return this.getRenderedCameraOrFail().getCapabilities()},l.prototype.applyVideoConstraints=function(a){if(a){if(!Bo.isMediaStreamConstraintsValid(a,this.logger))throw"invalid videoConstaints passed, check logs for more details"}else throw"videoConstaints is required argument.";return this.getRenderedCameraOrFail().applyVideoConstraints(a)},l.prototype.getRenderedCameraOrFail=function(){if(this.renderedCamera==null)throw"Scanning is not in running state, call this API only when QR code scanning using camera is in running state.";return this.renderedCamera},l.prototype.getSupportedFormats=function(a){var n=[W.QR_CODE,W.AZTEC,W.CODABAR,W.CODE_39,W.CODE_93,W.CODE_128,W.DATA_MATRIX,W.MAXICODE,W.ITF,W.EAN_13,W.EAN_8,W.PDF_417,W.RSS_14,W.RSS_EXPANDED,W.UPC_A,W.UPC_E,W.UPC_EAN_EXTENSION];if(!a||typeof a=="boolean"||!a.formatsToSupport)return n;if(!Array.isArray(a.formatsToSupport))throw"configOrVerbosityFlag.formatsToSupport should be undefined or an array.";if(a.formatsToSupport.length===0)throw"Atleast 1 formatsToSupport is needed.";for(var d=[],u=0,g=a.formatsToSupport;u<g.length;u++){var m=g[u];ch(m)?d.push(m):this.logger.warn("Invalid format: ".concat(m," passed in config, ignoring."))}if(d.length===0)throw"None of formatsToSupport match supported values.";return d},l.prototype.getUseBarCodeDetectorIfSupported=function(a){if(Yt(a))return!0;if(!Yt(a.useBarCodeDetectorIfSupported))return a.useBarCodeDetectorIfSupported!==!1;if(Yt(a.experimentalFeatures))return!0;var n=a.experimentalFeatures;return Yt(n.useBarCodeDetectorIfSupported)?!0:n.useBarCodeDetectorIfSupported!==!1},l.prototype.validateQrboxSize=function(a,n,d){var u=this,g=d.qrbox;this.validateQrboxConfig(g);var m=this.toQrdimensions(a,n,g),C=function(_){if(_<yt.MIN_QR_BOX_SIZE)throw"minimum size of 'config.qrbox' dimension value is"+" ".concat(yt.MIN_QR_BOX_SIZE,"px.")},A=function(_){return _>a&&(u.logger.warn("`qrbox.width` or `qrbox` is larger than the width of the root element. The width will be truncated to the width of root element."),_=a),_};C(m.width),C(m.height),m.width=A(m.width)},l.prototype.validateQrboxConfig=function(a){if(typeof a!="number"&&typeof a!="function"&&(a.width===void 0||a.height===void 0))throw"Invalid instance of QrDimensions passed for 'config.qrbox'. Both 'width' and 'height' should be set."},l.prototype.toQrdimensions=function(a,n,d){if(typeof d=="number")return{width:d,height:d};if(typeof d=="function")try{return d(a,n)}catch(u){throw new Error("qrbox config was passed as a function but it failed with unknown error"+u)}return d},l.prototype.setupUi=function(a,n,d){d.isShadedBoxEnabled()&&this.validateQrboxSize(a,n,d);var u=Yt(d.qrbox)?{width:a,height:n}:d.qrbox;this.validateQrboxConfig(u);var g=this.toQrdimensions(a,n,u);g.height>n&&this.logger.warn("[Html5Qrcode] config.qrbox has height that isgreater than the height of the video stream. Shading will be ignored");var m=d.isShadedBoxEnabled()&&g.height<=n,C={x:0,y:0,width:a,height:n},A=m?this.getShadedRegionBounds(a,n,g):C,_=this.createCanvasElement(A.width,A.height),k={willReadFrequently:!0},I=_.getContext("2d",k);I.canvas.width=A.width,I.canvas.height=A.height,this.element.append(_),m&&this.possiblyInsertShadingElement(this.element,a,n,g),this.createScannerPausedUiElement(this.element),this.qrRegion=A,this.context=I,this.canvasElement=_},l.prototype.createScannerPausedUiElement=function(a){var n=document.createElement("div");n.innerText=qi.scannerPaused(),n.style.display="none",n.style.position="absolute",n.style.top="0px",n.style.zIndex="1",n.style.background="rgba(9, 9, 9, 0.46)",n.style.color="#FFECEC",n.style.textAlign="center",n.style.width="100%",a.appendChild(n),this.scannerPausedUiElement=n},l.prototype.scanContext=function(a,n){var d=this;return this.stateManagerProxy.isPaused()?Promise.resolve(!1):this.qrcode.decodeAsync(this.canvasElement).then(function(u){return a(u.text,Va.createFromQrcodeResult(u)),d.possiblyUpdateShaders(!0),!0}).catch(function(u){d.possiblyUpdateShaders(!1);var g=qi.codeParseError(u);return n(g,hh.createFrom(g)),!1})},l.prototype.foreverScan=function(a,n,d){var u=this;if(this.shouldScan&&this.renderedCamera){var g=this.renderedCamera.getSurface(),m=g.videoWidth/g.clientWidth,C=g.videoHeight/g.clientHeight;if(!this.qrRegion)throw"qrRegion undefined when localMediaStream is ready.";var A=this.qrRegion.width*m,_=this.qrRegion.height*C,k=this.qrRegion.x*m,I=this.qrRegion.y*C;this.context.drawImage(g,k,I,A,_,0,0,this.qrRegion.width,this.qrRegion.height);var $=function(){u.foreverScanTimeout=setTimeout(function(){u.foreverScan(a,n,d)},u.getTimeoutFps(a.fps))};this.scanContext(n,d).then(function(X){!X&&a.disableFlip!==!0?(u.context.translate(u.context.canvas.width,0),u.context.scale(-1,1),u.scanContext(n,d).finally(function(){$()})):$()}).catch(function(X){u.logger.logError("Error happend while scanning context",X),$()})}},l.prototype.createVideoConstraints=function(a){if(typeof a=="string")return{deviceId:{exact:a}};if(typeof a=="object"){var n="facingMode",d="deviceId",u={user:!0,environment:!0},g="exact",m=function(pe){if(pe in u)return!0;throw"config has invalid 'facingMode' value = "+"'".concat(pe,"'")},C=Object.keys(a);if(C.length!==1)throw"'cameraIdOrConfig' object should have exactly 1 key,"+" if passed as an object, found ".concat(C.length," keys");var A=Object.keys(a)[0];if(A!==n&&A!==d)throw"Only '".concat(n,"' and '").concat(d,"' ")+" are supported for 'cameraIdOrConfig'";if(A===n){var _=a.facingMode;if(typeof _=="string"){if(m(_))return{facingMode:_}}else if(typeof _=="object")if(g in _){if(m(_["".concat(g)]))return{facingMode:{exact:_["".concat(g)]}}}else throw"'facingMode' should be string or object with"+" ".concat(g," as key.");else{var k=typeof _;throw"Invalid type of 'facingMode' = ".concat(k)}}else{var I=a.deviceId;if(typeof I=="string")return{deviceId:I};if(typeof I=="object"){if(g in I)return{deviceId:{exact:I["".concat(g)]}};throw"'deviceId' should be string or object with"+" ".concat(g," as key.")}else{var $=typeof I;throw"Invalid type of 'deviceId' = ".concat($)}}}var X=typeof a;throw"Invalid type of 'cameraIdOrConfig' = ".concat(X)},l.prototype.computeCanvasDrawConfig=function(a,n,d,u){if(a<=d&&n<=u){var g=(d-a)/2,m=(u-n)/2;return{x:g,y:m,width:a,height:n}}else{var C=a,A=n;return a>d&&(n=d/a*n,a=d),n>u&&(a=u/n*a,n=u),this.logger.log("Image downsampled from "+"".concat(C,"X").concat(A)+" to ".concat(a,"X").concat(n,".")),this.computeCanvasDrawConfig(a,n,d,u)}},l.prototype.clearElement=function(){if(this.stateManagerProxy.isScanning())throw"Cannot clear while scan is ongoing, close it first.";var a=document.getElementById(this.elementId);a&&(a.innerHTML="")},l.prototype.possiblyUpdateShaders=function(a){this.qrMatch!==a&&(this.hasBorderShaders&&this.borderShaders&&this.borderShaders.length&&this.borderShaders.forEach(function(n){n.style.backgroundColor=a?yt.BORDER_SHADER_MATCH_COLOR:yt.BORDER_SHADER_DEFAULT_COLOR}),this.qrMatch=a)},l.prototype.possiblyCloseLastScanImageFile=function(){this.lastScanImageFile&&(URL.revokeObjectURL(this.lastScanImageFile),this.lastScanImageFile=null)},l.prototype.createCanvasElement=function(a,n,d){var u=a,g=n,m=document.createElement("canvas");return m.style.width="".concat(u,"px"),m.style.height="".concat(g,"px"),m.style.display="none",m.id=Yt(d)?"qr-canvas":d,m},l.prototype.getShadedRegionBounds=function(a,n,d){if(d.width>a||d.height>n)throw"'config.qrbox' dimensions should not be greater than the dimensions of the root HTML element.";return{x:(a-d.width)/2,y:(n-d.height)/2,width:d.width,height:d.height}},l.prototype.possiblyInsertShadingElement=function(a,n,d,u){if(!(n-u.width<1||d-u.height<1)){var g=document.createElement("div");g.style.position="absolute";var m=(n-u.width)/2,C=(d-u.height)/2;if(g.style.borderLeft="".concat(m,"px solid rgba(0, 0, 0, 0.48)"),g.style.borderRight="".concat(m,"px solid rgba(0, 0, 0, 0.48)"),g.style.borderTop="".concat(C,"px solid rgba(0, 0, 0, 0.48)"),g.style.borderBottom="".concat(C,"px solid rgba(0, 0, 0, 0.48)"),g.style.boxSizing="border-box",g.style.top="0px",g.style.bottom="0px",g.style.left="0px",g.style.right="0px",g.id="".concat(yt.SHADED_REGION_ELEMENT_ID),n-u.width<11||d-u.height<11)this.hasBorderShaders=!1;else{var A=5,_=40;this.insertShaderBorders(g,_,A,-A,null,0,!0),this.insertShaderBorders(g,_,A,-A,null,0,!1),this.insertShaderBorders(g,_,A,null,-A,0,!0),this.insertShaderBorders(g,_,A,null,-A,0,!1),this.insertShaderBorders(g,A,_+A,-A,null,-A,!0),this.insertShaderBorders(g,A,_+A,null,-A,-A,!0),this.insertShaderBorders(g,A,_+A,-A,null,-A,!1),this.insertShaderBorders(g,A,_+A,null,-A,-A,!1),this.hasBorderShaders=!0}a.append(g)}},l.prototype.insertShaderBorders=function(a,n,d,u,g,m,C){var A=document.createElement("div");A.style.position="absolute",A.style.backgroundColor=yt.BORDER_SHADER_DEFAULT_COLOR,A.style.width="".concat(n,"px"),A.style.height="".concat(d,"px"),u!==null&&(A.style.top="".concat(u,"px")),g!==null&&(A.style.bottom="".concat(g,"px")),C?A.style.left="".concat(m,"px"):A.style.right="".concat(m,"px"),this.borderShaders||(this.borderShaders=[]),this.borderShaders.push(A),a.appendChild(A)},l.prototype.showPausedState=function(){if(!this.scannerPausedUiElement)throw"[internal error] scanner paused UI element not found";this.scannerPausedUiElement.style.display="block"},l.prototype.hidePausedState=function(){if(!this.scannerPausedUiElement)throw"[internal error] scanner paused UI element not found";this.scannerPausedUiElement.style.display="none"},l.prototype.getTimeoutFps=function(a){return 1e3/a},l}(),Ka;(function(l){l[l.STATUS_DEFAULT=0]="STATUS_DEFAULT",l[l.STATUS_SUCCESS=1]="STATUS_SUCCESS",l[l.STATUS_WARNING=2]="STATUS_WARNING",l[l.STATUS_REQUESTING_PERMISSION=3]="STATUS_REQUESTING_PERMISSION"})(Ka||(Ka={}));var Dh=Object.defineProperty,Mh=Object.getOwnPropertyDescriptor,ei=(l,a,n,d)=>{for(var u=d>1?void 0:d?Mh(a,n):a,g=l.length-1,m;g>=0;g--)(m=l[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&Dh(a,n,u),u};let Dt=class extends ke{constructor(){super(...arguments),this.isLoading=!1,this.isScanningQR=!1,this._stream=null,this._isTorchOn=!1,this._hasTorch=!1,this._facingMode="environment",this._qrScanner=null}firstUpdated(){this.startCamera()}disconnectedCallback(){this.stopCamera(),super.disconnectedCallback()}async startCamera(){this._isTorchOn=!1,this._hasTorch=!1,this.isScanningQR=!1,this._stream&&(this._stream.getTracks().forEach(l=>l.stop()),this._stream=null,this._video&&(this._video.srcObject=null));try{const l=this._facingMode==="environment"?{facingMode:{exact:"environment"}}:{facingMode:"user"};this._stream=await navigator.mediaDevices.getUserMedia({video:l}),this._video&&(this._video.srcObject=this._stream),this._checkTorchCapabilities()}catch{try{this._stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:this._facingMode}}),this._video&&(this._video.srcObject=this._stream),this._checkTorchCapabilities()}catch{alert("Kamera konnte nicht gestartet werden. Bitte Berechtigungen prüfen.")}}}_checkTorchCapabilities(){var n;if(!this._stream){this._hasTorch=!1;return}const l=this._stream.getVideoTracks()[0];if(!l){this._hasTorch=!1;return}const a=((n=l.getCapabilities)==null?void 0:n.call(l))||{};this._hasTorch=!!a.torch}async switchCamera(){this._facingMode=this._facingMode==="environment"?"user":"environment",this.isScanningQR?(await this.stopQRScanner(),setTimeout(()=>{this.startQRScanner()},300)):await this.startCamera()}stopCamera(){this.stopQRScanner(),this._isTorchOn=!1,this._hasTorch=!1,this._stream&&(this._stream.getTracks().forEach(l=>l.stop()),this._stream=null),this._video&&(this._video.srcObject=null),this.dispatchEvent(new CustomEvent("camera-stopped"))}async toggleTorch(){var n;if(!this._stream)return;const l=this._stream.getVideoTracks()[0];if(!l)return;if((((n=l.getCapabilities)==null?void 0:n.call(l))||{}).torch)try{this._isTorchOn=!this._isTorchOn,await l.applyConstraints({advanced:[{torch:this._isTorchOn}]})}catch(d){console.error("Taschenlampe konnte nicht gesteuert werden",d)}else alert("Taschenlampe wird von dieser Kamera nicht unterstützt.")}async startQRScanner(){this.stopCamera(),this.isScanningQR=!0,await this.updateComplete;const l=document.getElementById.bind(document);document.getElementById=a=>{var n;return a==="qr-reader"?(n=this.shadowRoot)==null?void 0:n.getElementById("qr-reader"):l(a)};try{this._qrScanner=new kh("qr-reader");const a={fps:10,qrbox:{width:250,height:250}},n=this._facingMode==="environment"?{facingMode:{exact:"environment"}}:{facingMode:"user"};try{await this._qrScanner.start(n,a,d=>{this._handleQRSuccess(d)},()=>{})}catch{await this._qrScanner.start({facingMode:this._facingMode},a,u=>{this._handleQRSuccess(u)},()=>{})}}catch{alert("QR-Scanner konnte nicht gestartet werden. Berechtigungen prüfen."),this.stopQRScanner()}finally{document.getElementById=l}}_handleQRSuccess(l){this.stopQRScanner(),this.dispatchEvent(new CustomEvent("qr-detected",{detail:{text:l}}))}async stopQRScanner(){if(this._qrScanner&&this._qrScanner.isScanning){try{await this._qrScanner.stop()}catch(l){console.warn("Fehler beim Stoppen des Scanners",l)}this._qrScanner.clear()}this.isScanningQR=!1,this._qrScanner=null}captureImage(){var a;let l=null;if(this.isScanningQR&&this._qrScanner){alert("Foto-Aufnahme während QR-Scan nicht möglich. Beende den QR-Scan zuerst.");return}else if(this._video&&this._uiCanvas){if(!this._video.videoWidth||!this._video.videoHeight){alert("Kamera-Stream ist nicht bereit. Bitte warten Sie kurz.");return}const n=800;let d=this._video.videoWidth,u=this._video.videoHeight;d>n&&(u=Math.floor(u*(n/d)),d=n),this._uiCanvas.width=d,this._uiCanvas.height=u,(a=this._uiCanvas.getContext("2d"))==null||a.drawImage(this._video,0,0,d,u),l=this._uiCanvas.toDataURL("image/jpeg",.7)}l&&(this.stopCamera(),this.dispatchEvent(new CustomEvent("photo-captured",{detail:{image:l}})))}captureAndScanTypePlate(){var a;if(!this._video||!this._uiCanvas)return;this._uiCanvas.width=this._video.videoWidth,this._uiCanvas.height=this._video.videoHeight,(a=this._uiCanvas.getContext("2d"))==null||a.drawImage(this._video,0,0);const l=this._uiCanvas.toDataURL("image/jpeg",.8);this.stopCamera(),this.dispatchEvent(new CustomEvent("ocr-scan-requested",{detail:{image:l}}))}render(){return L`
      <div class="media-box">
        ${this.isScanningQR?L`
              <div id="qr-reader" style="width: 100%; height: 100%; overflow: hidden;"></div>
              <div class="camera-hint">🔳 <strong>QR-Scan aktiv</strong>: Zentriere den Code im Rahmen</div>
            `:L`
              <video autoplay playsinline ?hidden="${!this._stream}"></video>
              <canvas id="ui-canvas" class="d-none"></canvas>
              ${this._stream?L`<div class="scanner-overlay"><div class="scanner-laser"></div></div>`:L`
                    <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center; justify-content: center; height: 100%;">
                      <vaadin-button theme="primary" @click="${this.startCamera}">📸 Kamera aktivieren</vaadin-button>
                      <vaadin-button theme="secondary" @click="${this.startQRScanner}">🔳 QR / Barcode scannen</vaadin-button>
                    </div>
                  `}
            `}
      </div>

      <div class="action-bar">
        ${this.isScanningQR?L`
              <vaadin-button theme="primary error" @click="${this.stopQRScanner}">🚫 Aus</vaadin-button>
              <vaadin-button theme="secondary" @click="${this.switchCamera}">🔄 Wechseln</vaadin-button>
            `:this._stream?L`
                <vaadin-button theme="tertiary error" @click="${this.stopCamera}">🚫 Aus</vaadin-button>
                <vaadin-button theme="secondary" @click="${this.switchCamera}">🔄 Wechseln</vaadin-button>
                ${this._hasTorch?L`<vaadin-button theme="secondary" @click="${this.toggleTorch}">🔦 ${this._isTorchOn?"Aus":"Ein"}</vaadin-button>`:""}
                <vaadin-button theme="primary error" @click="${this.captureImage}">📸 Foto</vaadin-button>
                <vaadin-button theme="primary success" @click="${this.captureAndScanTypePlate}">🔍 OCR Scan</vaadin-button>
              `:""}
      </div>
    `}};Dt.styles=Qe`
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
  `;ei([Je({type:Boolean})],Dt.prototype,"isLoading",2);ei([Je({type:Boolean})],Dt.prototype,"isScanningQR",2);ei([H()],Dt.prototype,"_stream",2);ei([H()],Dt.prototype,"_isTorchOn",2);ei([H()],Dt.prototype,"_hasTorch",2);ei([H()],Dt.prototype,"_facingMode",2);ei([Pr("video")],Dt.prototype,"_video",2);ei([Pr("#ui-canvas")],Dt.prototype,"_uiCanvas",2);Dt=ei([bt("ec-camera-capture")],Dt);/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Ph extends wn{constructor(a,n,d={}){const{uniqueIdPrefix:u}=d;super(a,"input","input",{initializer:(g,m)=>{m.value&&(g.value=m.value),m.type&&g.setAttribute("type",m.type),g.id=this.defaultId,typeof n=="function"&&n(g)},useUniqueId:!0,uniqueIdPrefix:u})}}/**
 * @license
 * Copyright (c) 2021 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Bh=l=>class extends Ro(l){static get properties(){return{maxlength:{type:Number},minlength:{type:Number},pattern:{type:String}}}static get delegateAttrs(){return[...super.delegateAttrs,"maxlength","minlength","pattern"]}static get constraints(){return[...super.constraints,"maxlength","minlength","pattern"]}constructor(){super(),this._setType("text")}get clearElement(){return this.$.clearButton}ready(){super.ready(),this.addController(new Ph(this,n=>{this._setInputElement(n),this._setFocusElement(n),this.stateTarget=n,this.ariaTarget=n})),this.addController(new ko(this.inputElement,this._labelController))}};/**
 * @license
 * Copyright (c) 2017 - 2026 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Lh extends Bh(lr(Br(ar(or(ke))))){static get is(){return"vaadin-text-field"}static get styles(){return[So]}render(){return L`
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
          theme="${Eo(this._theme)}"
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
    `}ready(){super.ready(),this._tooltipController=new Es(this),this._tooltipController.setPosition("top"),this._tooltipController.setAriaTarget(this.inputElement),this.addController(this._tooltipController)}_renderSuffix(){return L`
      <slot name="suffix" slot="suffix"></slot>
      <div id="clearButton" part="field-button clear-button" slot="suffix" aria-hidden="true"></div>
    `}}sr(Lh);var Fh=Object.defineProperty,Uh=Object.getOwnPropertyDescriptor,Fo=(l,a,n,d)=>{for(var u=d>1?void 0:d?Uh(a,n):a,g=l.length-1,m;g>=0;g--)(m=l[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&Fh(a,n,u),u};let hn=class extends ke{constructor(){super(...arguments),this._ctx=null,this._isDrawing=!1,this._lastX=0,this._lastY=0,this._hasSigned=!1}firstUpdated(){this._initCanvas()}_initCanvas(){const l=this._canvas.getBoundingClientRect();this._canvas.width=l.width||400,this._canvas.height=l.height||150,this._ctx=this._canvas.getContext("2d"),this._ctx&&(this._ctx.strokeStyle="#000000",this._ctx.lineWidth=3,this._ctx.lineCap="round",this._ctx.lineJoin="round")}_handlePointerDown(l){this._isDrawing=!0;const a=this._canvas.getBoundingClientRect(),n=this._canvas.width/a.width,d=this._canvas.height/a.height;this._lastX=(l.clientX-a.left)*n,this._lastY=(l.clientY-a.top)*d,this._hasSigned=!0,this.requestUpdate(),this._notifyChange()}_handlePointerMove(l){if(!this._isDrawing||!this._ctx)return;const a=this._canvas.getBoundingClientRect(),n=this._canvas.width/a.width,d=this._canvas.height/a.height,u=(l.clientX-a.left)*n,g=(l.clientY-a.top)*d;this._ctx.beginPath(),this._ctx.moveTo(this._lastX,this._lastY),this._ctx.lineTo(u,g),this._ctx.stroke(),this._lastX=u,this._lastY=g}_handlePointerUp(){this._isDrawing=!1}clear(){this._ctx&&(this._ctx.clearRect(0,0,this._canvas.width,this._canvas.height),this._hasSigned=!1,this.requestUpdate(),this._notifyChange())}getSignatureDataUrl(){return this._hasSigned?this._canvas.toDataURL("image/png"):null}_notifyChange(){this.dispatchEvent(new CustomEvent("signature-changed",{detail:{hasSigned:this._hasSigned,dataUrl:this.getSignatureDataUrl()}}))}render(){return L`
      <div class="signature-container">
        <div class="canvas-wrapper">
          ${this._hasSigned?"":L`<div class="canvas-placeholder">Hier unterschreiben</div>`}
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
    `}};hn.styles=Qe`
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
  `;Fo([Pr("canvas")],hn.prototype,"_canvas",2);hn=Fo([bt("ec-signature-pad")],hn);var zh=Object.defineProperty,Vh=Object.getOwnPropertyDescriptor,cr=(l,a,n,d)=>{for(var u=d>1?void 0:d?Vh(a,n):a,g=l.length-1,m;g>=0;g--)(m=l[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&zh(a,n,u),u};let xi=class extends ke{constructor(){super(...arguments),this.rPe="",this.rIso="",this.iLeak="",this.isScanning=!1,this._signatureUrl=null}_getDguvStatus(){const l=[];let a=!0;if(this.rPe.trim()){const d=parseFloat(this.rPe.replace(",","."));isNaN(d)?(l.push("R_PE: Ungültiger Wert"),a=!1):d>.3?(l.push(`R_PE: ${d} Ω (> 0.3 Ω Grenzwert) ❌`),a=!1):l.push(`R_PE: ${d} Ω (≤ 0.3 Ω) ✅`)}if(this.rIso.trim()){const d=parseFloat(this.rIso.replace(",","."));isNaN(d)?(l.push("R_ISO: Ungültiger Wert"),a=!1):d<1?(l.push(`R_ISO: ${d} MΩ (< 1.0 MΩ Grenzwert) ❌`),a=!1):l.push(`R_ISO: ${d} MΩ (≥ 1.0 MΩ) ✅`)}if(this.iLeak.trim()){const d=parseFloat(this.iLeak.replace(",","."));isNaN(d)?(l.push("I_leak: Ungültiger Wert"),a=!1):d>3.5?(l.push(`Ableitstrom: ${d} mA (> 3.5 mA Grenzwert) ❌`),a=!1):l.push(`Ableitstrom: ${d} mA (≤ 3.5 mA) ✅`)}return this.rPe.trim()||this.rIso.trim()||this.iLeak.trim()?{passed:a,message:a?"BESTANDEN":"NICHT BESTANDEN",details:l}:{passed:!0,message:"Keine Messdaten",details:[]}}_handleValueChange(l,a){l==="rPe"&&(this.rPe=a),l==="rIso"&&(this.rIso=a),l==="iLeak"&&(this.iLeak=a),this._notifyChange()}_handleSignatureChanged(l){this._signatureUrl=l.detail.dataUrl,this._notifyChange()}_requestMultimeterScan(){this.dispatchEvent(new CustomEvent("scan-multimeter-requested"))}_notifyChange(){const l=this._getDguvStatus();this.dispatchEvent(new CustomEvent("dguv-changed",{detail:{rPe:this.rPe,rIso:this.rIso,iLeak:this.iLeak,signatureUrl:this._signatureUrl,passed:l.passed,status:l.message,details:l.details}}))}render(){const l=this._getDguvStatus(),a=this.rPe.trim()||this.rIso.trim()||this.iLeak.trim();return L`
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

        ${a?L`
              <div class="result-badge ${l.passed?"passed":"failed"}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="font-size: 0.9rem;">Gesamturteil:</strong>
                  <span
                    style="font-weight: 800; font-size: 1rem; color: ${l.passed?"var(--success, #0b8a5a)":"var(--danger, #dc2626)"};"
                  >
                    ${l.message}
                  </span>
                </div>
                <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 0.85rem; color: var(--text-secondary);">
                  ${l.details.map(n=>L`<li>${n}</li>`)}
                </ul>
              </div>
            `:L`
              <div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center;">
                Keine Messdaten eingetragen (optional)
              </div>
            `}

        <div class="signature-section">
          <div class="signature-title">✍️ Digitale Unterschrift der Prüffachkraft</div>
          <ec-signature-pad @signature-changed="${this._handleSignatureChanged}"></ec-signature-pad>
        </div>
      </div>
    `}};xi.styles=Qe`
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
  `;cr([Je({type:String})],xi.prototype,"rPe",2);cr([Je({type:String})],xi.prototype,"rIso",2);cr([Je({type:String})],xi.prototype,"iLeak",2);cr([Je({type:Boolean})],xi.prototype,"isScanning",2);cr([H()],xi.prototype,"_signatureUrl",2);xi=cr([bt("ec-dguv-form")],xi);var $h=Object.defineProperty,Hh=Object.getOwnPropertyDescriptor,Uo=(l,a,n,d)=>{for(var u=d>1?void 0:d?Hh(a,n):a,g=l.length-1,m;g>=0;g--)(m=l[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&$h(a,n,u),u};let un=class extends ke{constructor(){super(...arguments),this.history=[],this._map=null}firstUpdated(){this.history&&this.history.length>0&&setTimeout(()=>{this._initMap()},150)}updated(l){super.updated(l),l.has("history")&&this.history&&this.history.length>0&&setTimeout(()=>{this._initMap()},150)}_initMap(){var a;const l=(a=this.shadowRoot)==null?void 0:a.getElementById("leaflet-map");if(!(!l||!window.L)){this._map&&(this._map.remove(),this._map=null);try{const n=window.L,d=n.map(l).setView([51.1657,10.4515],5);this._map=d,n.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(d);let u=!1,g=0,m=0,C=0;this.history.forEach(A=>{const _=A.location;if(!_)return;const k=_.match(/Lat:\s*([-\d.]+),\s*Lng:\s*([-\d.]+)/i);if(k){const I=parseFloat(k[1]),$=parseFloat(k[2]);if(!isNaN(I)&&!isNaN($)){g+=I,m+=$,C++;const X=(A.safetyLevel||"SAFE").toUpperCase(),pe=X==="DANGER"?"#ef4444":X==="WARNING"?"#f59e0b":"#10b981",te=n.divIcon({className:"custom-map-marker",html:`<div style="background-color: ${pe}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.5);"></div>`,iconSize:[14,14],iconAnchor:[7,7]});n.marker([I,$],{icon:te}).addTo(d).bindPopup(`
                <div style="color: black; font-family: sans-serif; font-size: 0.8rem;">
                  <strong style="color: ${pe}; font-size: 0.85rem;">${A.deviceName||"Gerät"}</strong><br/>
                  <strong>Defekt:</strong> ${A.identifiedDefect||"Kein Defekt"}<br/>
                  <strong>Status:</strong> ${X}
                </div>
              `),u=!0}}}),u&&C>0&&d.setView([g/C,m/C],10)}catch(n){console.error("Fehler beim Initialisieren der Leaflet-Karte:",n)}}}render(){if(this.history.length===0)return L`
        <div class="card empty-dashboard">
          <h3 class="text-muted m-0">Keine Daten vorhanden</h3>
          <p>Starte deine erste Diagnose, um hier Statistiken zu sehen.</p>
        </div>
      `;const l=this.history.length,a=this.history.reduce((Ce,le)=>{const K=(le.safetyLevel||"SAFE").toUpperCase();return K==="DANGER"?Ce.danger++:K==="WARNING"?Ce.warning++:Ce.safe++,Ce},{safe:0,warning:0,danger:0}),n=36,d=2*Math.PI*n,u=l>0?a.safe/l:0,g=l>0?a.warning/l:0,m=l>0?a.danger/l:0,C=d*u,A=d*g,_=d*m,k=0,I=-C,$=-(C+A),X=this.history.reduce((Ce,le)=>{const K=le.deviceName||"Unbekannt";return Ce[K]=(Ce[K]||0)+1,Ce},{}),pe=Object.entries(X).sort((Ce,le)=>le[1]-Ce[1]).slice(0,4),te=Math.max(...pe.map(([,Ce])=>Ce),1),Le=(this.history.reduce((Ce,le)=>Ce+(le.repairDifficulty||1),0)/l).toFixed(1);return L`
      <div class="card result-card">
        <h3 class="m-0 dashboard-title">📊 Management Dashboard</h3>
        
        <div class="dashboard-stats" style="margin-top: 1rem;">
          <div class="stat-card">
            <div class="stat-value-primary">${l}</div>
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
                
                ${u>0?L`
                  <circle 
                    class="donut-circle-segment" 
                    cx="50" 
                    cy="50" 
                    r="${n}" 
                    stroke="var(--success, #10b981)" 
                    stroke-dasharray="${C} ${d-C}" 
                    stroke-dashoffset="${k}"
                  ></circle>
                `:""}

                ${g>0?L`
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

                ${m>0?L`
                  <circle 
                    class="donut-circle-segment" 
                    cx="50" 
                    cy="50" 
                    r="${n}" 
                    stroke="var(--danger, #ef4444)" 
                    stroke-dasharray="${_} ${d-_}" 
                    stroke-dashoffset="${$}"
                  ></circle>
                `:""}
              </svg>
              
              <div class="donut-label">
                <span class="donut-number">${l}</span>
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

              ${pe.map(([Ce,le],K)=>{const ce=20+K*32,ut=Math.max(le/te*120,5),we=Ce.length>8?Ce.slice(0,6)+"...":Ce;return L`
                  <g>
                    <text class="bar-label-text" x="5" y="${ce+12}" text-anchor="start">${we}</text>
                    <rect 
                      class="bar-rect" 
                      x="40" 
                      y="${ce+2}" 
                      width="${ut}" 
                      height="14" 
                      rx="3" 
                      fill="var(--primary, #3b82f6)"
                    ></rect>
                    <text class="bar-value-text" x="${40+ut+5}" y="${ce+12}" text-anchor="start">${le}x</text>
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
    `}};un.styles=[Jt(wi),Qe`
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
    `];Uo([Je({type:Array})],un.prototype,"history",2);un=Uo([bt("ec-dashboard")],un);var Gh=Object.defineProperty,Wh=Object.getOwnPropertyDescriptor,Fr=(l,a,n,d)=>{for(var u=d>1?void 0:d?Wh(a,n):a,g=l.length-1,m;g>=0;g--)(m=l[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&Gh(a,n,u),u};let Fi=class extends ke{constructor(){super(...arguments),this._datasheets=[],this._modelMatch="",this._selectedFile=null,this._isSaving=!1}connectedCallback(){super.connectedCallback(),this._loadDatasheets()}async _loadDatasheets(){try{this._datasheets=await Mo()}catch(l){console.error("Fehler beim Laden der Offline-Datenblätter",l)}}_handleFileChange(l){const a=l.target;a.files&&a.files.length>0?this._selectedFile=a.files[0]:this._selectedFile=null}async _handleUpload(){var l;if(!this._modelMatch.trim()){alert("Bitte ein Gerätemodell eingeben.");return}if(!this._selectedFile){alert("Bitte ein PDF-Datenblatt auswählen.");return}this._isSaving=!0;try{const a=await this._fileToBase64(this._selectedFile),n={name:this._selectedFile.name,modelMatch:this._modelMatch.trim(),fileData:a};await ah(n),this._modelMatch="",this._selectedFile=null;const d=(l=this.shadowRoot)==null?void 0:l.querySelector('input[type="file"]');d&&(d.value=""),await this._loadDatasheets(),alert("Datenblatt erfolgreich offline gespeichert!")}catch(a){console.error(a),alert("Fehler beim Speichern des Datenblatts.")}finally{this._isSaving=!1}}_fileToBase64(l){return new Promise((a,n)=>{const d=new FileReader;d.readAsDataURL(l),d.onload=()=>a(d.result),d.onerror=u=>n(u)})}async _handleDelete(l){if(confirm("Dieses Offline-Datenblatt wirklich löschen?"))try{await oh(l),await this._loadDatasheets()}catch{alert("Fehler beim Löschen.")}}render(){return L`
      <div class="manager-card">
        <h4>📂 Offline-Datenblätter (PDF)</h4>
        <p>Lade Bedienungsanleitungen oder Datenblätter hoch, um sie bei der Arbeit offline parat zu haben.</p>

        <div class="upload-form">
          <vaadin-text-field
            label="Gerätemodell (z. B. Saeco Royal)"
            .value="${this._modelMatch}"
            @value-changed="${l=>this._modelMatch=l.detail.value}"
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
          ${this._datasheets.length===0?L`<div class="empty-text">Keine Datenblätter offline gespeichert.</div>`:this._datasheets.map(l=>L`
                <div class="datasheet-item">
                  <div class="datasheet-info">
                    <span class="datasheet-name" title="${l.name}">${l.name}</span>
                    <span class="datasheet-match">Modell-Match: <strong>${l.modelMatch}</strong></span>
                  </div>
                  <vaadin-button
                    theme="error tertiary"
                    @click="${()=>this._handleDelete(l.id)}"
                    style="min-height: auto; height: 32px;"
                  >
                    🗑️
                  </vaadin-button>
                </div>
              `)}
        </div>
      </div>
    `}};Fi.styles=Qe`
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
  `;Fr([H()],Fi.prototype,"_datasheets",2);Fr([H()],Fi.prototype,"_modelMatch",2);Fr([H()],Fi.prototype,"_selectedFile",2);Fr([H()],Fi.prototype,"_isSaving",2);Fi=Fr([bt("ec-datasheet-manager")],Fi);var Xh=Object.defineProperty,jh=Object.getOwnPropertyDescriptor,_t=(l,a,n,d)=>{for(var u=d>1?void 0:d?jh(a,n):a,g=l.length-1,m;g>=0;g--)(m=l[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&Xh(a,n,u),u};let ot=class extends ke{constructor(){super(...arguments),this.apiKey="",this.perplexityApiKey="",this.backendUrl="",this.accessibleMode=!1,this.inspectorName="",this.inspectorCompany="",this.inspectorId="",this._tempApiKey="",this._tempPerplexityApiKey="",this._tempBackendUrl="",this._tempInspectorName="",this._tempInspectorCompany="",this._tempInspectorId=""}connectedCallback(){super.connectedCallback(),this._tempApiKey=this.apiKey,this._tempPerplexityApiKey=this.perplexityApiKey,this._tempBackendUrl=this.backendUrl||"http://localhost:3000",this._tempInspectorName=this.inspectorName,this._tempInspectorCompany=this.inspectorCompany,this._tempInspectorId=this.inspectorId}render(){return L`
      <div class="modal-overlay settings-overlay">
        <div class="card settings-card">
          <h3 class="m-0">⚙️ Einstellungen</h3>
          
          <vaadin-text-area
            class="w-100 mt-1"
            label="Gemini API Key (Optional)"
            helper-text="Falls Sie Ihren eigenen API Key nutzen möchten"
            .value="${this._tempApiKey}"
            @value-changed="${l=>this._tempApiKey=l.detail.value}"
          ></vaadin-text-area>

          <vaadin-text-area
            class="w-100 mt-1"
            label="Perplexity API Key (Optional)"
            helper-text="Für Web-Recherchen zu VDE-Regeln und Reparaturen"
            .value="${this._tempPerplexityApiKey}"
            @value-changed="${l=>this._tempPerplexityApiKey=l.detail.value}"
          ></vaadin-text-area>

          <vaadin-text-field
            class="w-100 mt-1"
            label="Backend Server URL"
            helper-text="Für Smartphone z.B. http://192.168.x.x:3000"
            .value="${this._tempBackendUrl}"
            @value-changed="${l=>this._tempBackendUrl=l.detail.value}"
          ></vaadin-text-field>

          <h4 class="privacy-title mt-1" style="color: var(--primary); margin-bottom: 4px; font-size: 0.95rem; font-weight: bold;">👤 Prüferprofil</h4>
          <vaadin-text-field
            class="w-100 mt-1"
            label="Prüfer-Name"
            helper-text="Name des zuständigen Prüfers"
            .value="${this._tempInspectorName}"
            @value-changed="${l=>this._tempInspectorName=l.detail.value}"
          ></vaadin-text-field>

          <vaadin-text-field
            class="w-100 mt-1"
            label="Firma / Abteilung"
            helper-text="Name des Unternehmens oder der Abteilung"
            .value="${this._tempInspectorCompany}"
            @value-changed="${l=>this._tempInspectorCompany=l.detail.value}"
          ></vaadin-text-field>

          <vaadin-text-field
            class="w-100 mt-1"
            label="Zertifikatsnummer / Prüfer-ID"
            helper-text="Offizielle Zertifikats- oder Prüfernummer"
            .value="${this._tempInspectorId}"
            @value-changed="${l=>this._tempInspectorId=l.detail.value}"
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
    `}_handleClose(){this.dispatchEvent(new CustomEvent("close"))}_handleSave(){this.dispatchEvent(new CustomEvent("save-settings",{detail:{apiKey:this._tempApiKey,perplexityApiKey:this._tempPerplexityApiKey,backendUrl:this._tempBackendUrl,inspectorName:this._tempInspectorName,inspectorCompany:this._tempInspectorCompany,inspectorId:this._tempInspectorId}}))}_toggleAccessibleMode(l){const a=l.target.checked;this.dispatchEvent(new CustomEvent("accessible-changed",{detail:{checked:a}}))}_handleExport(){this.dispatchEvent(new CustomEvent("export-data"))}_handleDelete(){this.dispatchEvent(new CustomEvent("delete-data"))}};ot.styles=Jt(wi);_t([Je({type:String})],ot.prototype,"apiKey",2);_t([Je({type:String})],ot.prototype,"perplexityApiKey",2);_t([Je({type:String})],ot.prototype,"backendUrl",2);_t([Je({type:Boolean})],ot.prototype,"accessibleMode",2);_t([Je({type:String})],ot.prototype,"inspectorName",2);_t([Je({type:String})],ot.prototype,"inspectorCompany",2);_t([Je({type:String})],ot.prototype,"inspectorId",2);_t([H()],ot.prototype,"_tempApiKey",2);_t([H()],ot.prototype,"_tempPerplexityApiKey",2);_t([H()],ot.prototype,"_tempBackendUrl",2);_t([H()],ot.prototype,"_tempInspectorName",2);_t([H()],ot.prototype,"_tempInspectorCompany",2);_t([H()],ot.prototype,"_tempInspectorId",2);ot=_t([bt("ec-settings")],ot);var Kh=Object.defineProperty,Yh=Object.getOwnPropertyDescriptor,zo=(l,a,n,d)=>{for(var u=d>1?void 0:d?Yh(a,n):a,g=l.length-1,m;g>=0;g--)(m=l[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&Kh(a,n,u),u};let fn=class extends ke{constructor(){super(...arguments),this.safetyChecks=[!1,!1,!1,!1,!1],this._rules=[{title:"Freischalten",desc:"Gesamte Anlage allpolig vom Stromnetz trennen (z. B. Hauptschalter aus)."},{title:"Gegen Wiedereinschalten sichern",desc:"Trennungen absichern (z. B. durch Schlösser, Klebeband oder Warnschilder), damit niemand sie versehentlich wieder einschaltet."},{title:"Spannungsfreiheit feststellen",desc:"Mit einem zweipoligen Spannungsprüfer (z. B. Duspol) an allen Polen die Abwesenheit von Spannung prüfen."},{title:"Erden und kurzschließen",desc:"Leiter erden und kurzschließen (zwingend notwendig ab 1000V)."},{title:"Benachbarte unter Spannung stehende Teile abdecken",desc:"Nahegelegene spannungsführende Teile abdecken (z. B. mit isolierenden Abdecktüchern)."}]}render(){const l=this.safetyChecks.every(a=>a);return L`
      <div class="card safety-card">
        <h3 class="text-danger m-0">⚠️ Sicherheits-Check</h3>
        <p>Bitte bestätigen Sie die 5 VDE-Sicherheitsregeln:</p>
        <div class="safety-list">
          ${this._rules.map((a,n)=>L`
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
          ?disabled="${!l}"
          @click="${this._confirm}"
          >🔓 Diagnose starten</vaadin-button
        >
      </div>
    `}_toggleCheck(l,a){const n=a.target.checked;this.dispatchEvent(new CustomEvent("safety-changed",{detail:{index:l,checked:n}}))}_confirm(){this.dispatchEvent(new CustomEvent("safety-confirmed"))}};fn.styles=Jt(wi);zo([Je({type:Array})],fn.prototype,"safetyChecks",2);fn=zo([bt("ec-safety-checks")],fn);var Zh=Object.defineProperty,qh=Object.getOwnPropertyDescriptor,Ur=(l,a,n,d)=>{for(var u=d>1?void 0:d?qh(a,n):a,g=l.length-1,m;g>=0;g--)(m=l[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&Zh(a,n,u),u};let Ui=class extends ke{constructor(){super(...arguments),this.stepIndex=0,this._isSpeaking=!1,this._isListening=!1,this._recognition=null}disconnectedCallback(){this._stopSpeech(),this._stopVoiceControl(),super.disconnectedCallback()}_stopSpeech(){"speechSynthesis"in window&&window.speechSynthesis.cancel(),this._isSpeaking=!1}_startVoiceControl(){const l=window.SpeechRecognition||window.webkitSpeechRecognition;if(!l){alert("Spracherkennung wird von Ihrem Browser leider nicht unterstützt.");return}try{this._recognition=new l,this._recognition.continuous=!0,this._recognition.lang="de-DE",this._recognition.interimResults=!1,this._recognition.onresult=a=>{const n=a.results[a.results.length-1][0].transcript.toLowerCase().trim();console.log("Sprachbefehl erkannt:",n),this.result&&this.result.actionSteps&&this.result.actionSteps[this.stepIndex]&&(n.includes("weiter")||n.includes("nächst")||n.includes("next")?this._handleNext(this.result.actionSteps.length):n.includes("zurück")||n.includes("back")?this._handleBack():n.includes("vorlesen")||n.includes("sprich")||n.includes("lies")?this._speakStep(this.result.actionSteps[this.stepIndex].text):(n.includes("stopp")||n.includes("halt"))&&this._stopSpeech())},this._recognition.onend=()=>{if(this._isListening)try{this._recognition.start()}catch(a){console.warn("Fehler beim Neustarten der Spracherkennung:",a)}},this._recognition.onerror=a=>{console.error("Spracherkennungsfehler:",a),a.error==="not-allowed"&&(alert("Mikrofon-Berechtigung verweigert."),this._isListening=!1)},this._isListening=!0,this._recognition.start()}catch(a){console.error("Fehler beim Initialisieren der Spracherkennung:",a),alert("Spracherkennung konnte nicht gestartet werden.")}}_stopVoiceControl(){if(this._isListening=!1,this._recognition){try{this._recognition.stop()}catch(l){console.warn("Fehler beim Stoppen der Spracherkennung:",l)}this._recognition=null}}_toggleVoiceControl(){this._isListening?this._stopVoiceControl():this._startVoiceControl()}render(){if(!this.result||!this.result.actionSteps||this.result.actionSteps.length===0)return L`<p>Keine Reparaturschritte verfügbar.</p>`;const l=this.result.actionSteps,a=l[this.stepIndex],n=l.length;return L`
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
            ${this._isListening?L`
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
    `}_handleBack(){this._stopSpeech(),this.dispatchEvent(new CustomEvent("step-changed",{detail:{index:this.stepIndex-1}}))}_handleNext(l){this._stopSpeech(),this.dispatchEvent(new CustomEvent("step-completed",{detail:{index:this.stepIndex}})),this.stepIndex+1<l?this.dispatchEvent(new CustomEvent("step-changed",{detail:{index:this.stepIndex+1}})):this.dispatchEvent(new CustomEvent("repair-completed"))}_handleCancel(){this._stopSpeech(),this._stopVoiceControl(),this.dispatchEvent(new CustomEvent("close"))}_speakStep(l){if("speechSynthesis"in window){if(this._isSpeaking){window.speechSynthesis.cancel(),this._isSpeaking=!1;return}const a=new SpeechSynthesisUtterance(l);a.lang="de-DE",a.onend=()=>{this._isSpeaking=!1},a.onerror=()=>{this._isSpeaking=!1},this._isSpeaking=!0,window.speechSynthesis.speak(a)}else alert("Sprachausgabe wird von Ihrem Browser leider nicht unterstützt.")}};Ui.styles=Jt(wi);Ur([Je({type:Object})],Ui.prototype,"result",2);Ur([Je({type:Number})],Ui.prototype,"stepIndex",2);Ur([H()],Ui.prototype,"_isSpeaking",2);Ur([H()],Ui.prototype,"_isListening",2);Ui=Ur([bt("ec-guided-repair")],Ui);function Ya(l,a,n,d,u){const g=new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"});return{content:[{text:"ElectroCheck AI - Wartungsprotokoll",fontSize:24,bold:!0,color:"#005fcc",margin:[0,0,0,5]},u&&(u.name||u.company||u.id)?{text:[{text:"Prüfer: ",bold:!0},u.name||"-",{text:"  |  Firma: ",bold:!0},u.company||"-",{text:"  |  Zertifikat/ID: ",bold:!0},u.id||"-"],fontSize:10,margin:[0,0,0,10],color:"#333333"}:{},{text:`Erstellt am: ${g}`,margin:[0,0,0,20],color:"#666666",fontSize:10},{table:{widths:["*"],body:[[{text:`KOMPONENTE: ${l.deviceName}`,fillColor:"#eeeeee",border:[!1,!1,!1,!1],bold:!0,fontSize:14,padding:[8,8,8,8]}]]},margin:[0,0,0,15]},a?{image:a,width:300,alignment:"center",margin:[0,10,0,20]}:{},{text:"DIAGNOSE-ERGEBNISSE",fontSize:16,bold:!0,margin:[0,10,0,5],color:"#005fcc"},{canvas:[{type:"line",x1:0,y1:0,x2:515,y2:0,lineWidth:1,lineColor:"#005fcc"}]},{text:"Identifizierter Defekt:",bold:!0,margin:[0,15,0,2]},{text:l.identifiedDefect,margin:[0,0,0,10]},{text:"Handlungsempfehlung:",bold:!0,margin:[0,10,0,2]},{text:l.recommendation,margin:[0,0,0,10]},l.location?{text:[{text:"📍 Anlagenstandort: ",bold:!0},{text:l.location,color:"#005fcc",link:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.location.replace("Lat: ","").replace(", Lng: ",","))}`}],margin:[0,0,0,10]}:{},{columns:[{width:"auto",text:"Reparatur-Schwierigkeit: ",bold:!0},{width:"*",text:"★".repeat(l.repairDifficulty||1)+"☆".repeat(5-(l.repairDifficulty||1)),color:"#f59e0b",margin:[5,0,0,0]}],margin:[0,5,0,20]},l.customerExperience?[{text:"TECHNIKER-EXPERTISE:",bold:!0,fontSize:12,margin:[0,10,0,5]},{text:l.customerExperience,fontStyle:"italic",color:"#444444",margin:[10,0,0,10]}]:[],l.additionalTips&&l.additionalTips.length>0?[{text:"Zusätzliche Hinweise & Sicherheitstipps:",bold:!0,margin:[0,10,0,5]},{ul:l.additionalTips,margin:[10,0,0,10]}]:[],d?[{text:"⚡ SICHERHEITSPRÜFUNG NACH DGUV V3 (VDE 0701-0702)",fontSize:16,bold:!0,margin:[0,20,0,5],color:"#005fcc"},{canvas:[{type:"line",x1:0,y1:0,x2:515,y2:0,lineWidth:1,lineColor:"#005fcc"}]},{table:{widths:["*","auto","auto"],body:[[{text:"Prüfparameter",bold:!0,fillColor:"#eeeeee"},{text:"Messwert",bold:!0,fillColor:"#eeeeee"},{text:"Grenzwert",bold:!0,fillColor:"#eeeeee"}],[{text:"Schutzleiterwiderstand (R_PE)"},{text:d.rPe?`${d.rPe} Ω`:"n.a."},{text:"≤ 0.3 Ω"}],[{text:"Isolationswiderstand (R_ISO)"},{text:d.rIso?`${d.rIso} MΩ`:"n.a."},{text:"≥ 1.0 MΩ"}],[{text:"Ableitstrom (I_leak)"},{text:d.iLeak?`${d.iLeak} mA`:"n.a."},{text:"≤ 3.5 mA"}],[{text:"Gesamtbewertung",bold:!0,colSpan:2},{},{text:d.status,bold:!0,color:d.status==="BESTANDEN"?"#0b8a5a":"#dc2626"}]]},margin:[0,15,0,15]},d.signatureUrl?[{text:`Unterschrift der Elektrofachkraft:${u!=null&&u.name?" "+u.name:""}`,bold:!0,fontSize:11,margin:[0,10,0,5]},{image:d.signatureUrl,width:120,margin:[10,0,0,10]}]:[]]:[],l.sparePartSearchTerm?{stack:[{canvas:[{type:"line",x1:0,y1:0,x2:515,y2:0,lineWidth:.5,lineColor:"#cccccc"}]},{text:[{text:`
Empfohlenes Ersatzteil: `,bold:!0},{text:l.sparePartSearchTerm}],margin:[0,5,0,0]}],margin:[0,20,0,0]}:{},{text:`

RECHTLICHER HINWEIS`,fontSize:10,bold:!0,color:"#9f1239",margin:[0,20,0,5]},{text:l.disclaimer||n,fontSize:9,color:"#444444",alignment:"justify",fontStyle:"italic"}],defaultStyle:{fontSize:11,lineHeight:1.3}}}function Qh(l,a,n,d){const u=new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"}),g=[[{text:"Bauteil / Bereich",bold:!0,fillColor:"#eeeeee"},{text:"Temperatur",bold:!0,fillColor:"#eeeeee"},{text:"Status",bold:!0,fillColor:"#eeeeee"}]];return l.detectedHotspots.forEach(m=>{g.push([{text:m.label},{text:m.temperature},{text:m.severity,bold:!0,color:m.severity==="CRITICAL"?"#dc2626":m.severity==="MONITOR"?"#f59e0b":"#0b8a5a"}])}),{content:[{text:"ElectroCheck AI - Thermografie-Inspektionsbericht",fontSize:22,bold:!0,color:"#b91c1c",margin:[0,0,0,5]},d&&(d.name||d.company||d.id)?{text:[{text:"Prüfer: ",bold:!0},d.name||"-",{text:"  |  Firma: ",bold:!0},d.company||"-",{text:"  |  Zertifikat/ID: ",bold:!0},d.id||"-"],fontSize:10,margin:[0,0,0,10],color:"#333333"}:{},{text:`Erstellt am: ${u}`,margin:[0,0,0,20],color:"#666666",fontSize:10},{table:{widths:["*"],body:[[{text:`GESAMTPRÜFSTATUS: ${l.overallStatus}`,fillColor:l.overallStatus==="CRITICAL"?"#fee2e2":l.overallStatus==="MONITOR"?"#fef3c7":"#d1fae5",border:[!1,!1,!1,!1],bold:!0,fontSize:14,color:l.overallStatus==="CRITICAL"?"#991b1b":l.overallStatus==="MONITOR"?"#92400e":"#065f46",padding:[8,8,8,8]}]]},margin:[0,0,0,15]},a?{image:a,width:300,alignment:"center",margin:[0,10,0,20]}:{},{text:"THERMOGRAFISCHE ANOMALIEN / HOTSPOTS",fontSize:16,bold:!0,margin:[0,10,0,5],color:"#b91c1c"},{canvas:[{type:"line",x1:0,y1:0,x2:515,y2:0,lineWidth:1,lineColor:"#b91c1c"}]},{table:{widths:["*","auto","auto"],body:g},margin:[0,15,0,15]},{text:"Allgemeine Bewertung:",bold:!0,margin:[0,10,0,2]},{text:l.generalRecommendation,margin:[0,0,0,15]},l.actionSteps&&l.actionSteps.length>0?[{text:"Empfohlene Instandsetzungsmaßnahmen:",bold:!0,margin:[0,10,0,5]},{ol:l.actionSteps.map(m=>({text:`${m.text} ${m.completed?" (Erledigt)":""}`})),margin:[10,0,0,15]}]:[],l.safetyTips&&l.safetyTips.length>0?[{text:"Sicherheitshinweise & VDE-Regeln:",bold:!0,margin:[0,10,0,5]},{ul:l.safetyTips,margin:[10,0,0,15]}]:[],{text:`

RECHTLICHER HINWEIS`,fontSize:10,bold:!0,color:"#9f1239",margin:[0,20,0,5]},{text:n,fontSize:9,color:"#444444",alignment:"justify",fontStyle:"italic"}],defaultStyle:{fontSize:11,lineHeight:1.3}}}var Jh=Object.defineProperty,eu=Object.getOwnPropertyDescriptor,bi=(l,a,n,d)=>{for(var u=d>1?void 0:d?eu(a,n):a,g=l.length-1,m;g>=0;g--)(m=l[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&Jh(a,n,u),u};let Gt=class extends ke{constructor(){super(...arguments),this._isLoading=!1,this._loadingMessage="Analysiere Infrarotbild...",this._description="",this._capturedImage=null,this._result=null,this._pdfPreviewUrl=null,this._ctx=null,this._aiService=new Do,this._loadingInterval=null,this._loadingPhrases=["Lade Infrarotbild...","Suche nach Wärmeanomalien...","Kalkuliere Temperaturspitzen...","Bewerte Sicherheitsabstände...","Gleiche mit VDE-Grenzwerte ab...","Erstelle Instandsetzungsbericht..."]}render(){return L`
      <div class="guided-container">
        <!-- 1. Input Section -->
        ${this._result?"":L`
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

                ${this._capturedImage?L`
                      <div class="media-box mt-1" style="background: var(--surface); height: 260px;">
                        <img src="${this._capturedImage}" alt="Wärmebild Vorschau" style="object-fit: contain;" />
                      </div>
                    `:""}

                <vaadin-text-area
                  class="w-100 mt-1"
                  label="Zusätzliche Angaben zur Anlage"
                  placeholder="z.B. Hauptverteilung Halle A, Sicherung brummt, Nennstrom 63A"
                  .value="${this._description}"
                  @value-changed="${l=>this._description=l.detail.value}"
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
        ${this._isLoading?L`
              <div class="card skeleton-card">
                <div class="tech-spinner"></div>
                <p class="loading-text">${this._loadingMessage}</p>
              </div>
            `:""}

        <!-- 3. Result Section -->
        ${this._result&&!this._isLoading?L`
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
                      ${this._result.detectedHotspots.map(l=>L`
                          <tr style="border-bottom: 1px solid var(--border);">
                            <td style="padding: 10px; font-weight: 600;">${l.label}</td>
                            <td style="padding: 10px; color: var(--text-secondary); font-family: monospace;">${l.temperature}</td>
                            <td style="padding: 10px;">
                              <span style="font-weight: 700; color: ${l.severity==="CRITICAL"?"var(--danger)":l.severity==="MONITOR"?"var(--warning)":"var(--success)"}">
                                ${l.severity}
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
                  ${this._result.actionSteps.map((l,a)=>L`
                      <label class="safety-item" style="border-color: ${l.completed?"var(--success)":"var(--border)"}; background: ${l.completed?"var(--success-glow)":"var(--bg-app)"};">
                        <input
                          type="checkbox"
                          .checked="${l.completed}"
                          @change="${n=>this._toggleStep(a,n)}"
                        />
                        <span style="text-decoration: ${l.completed?"line-through":"none"}; color: ${l.completed?"var(--text-muted)":"var(--text-primary)"}">
                          ${l.text}
                        </span>
                      </label>
                    `)}
                </div>
              </div>

              <!-- VDE Normen & Sicherheitshinweise -->
              <div class="card safety-card">
                <h3 class="m-0">⚠️ VDE-Sicherheitsregeln & Thermografie-Grenzwerte</h3>
                <ul class="tips-list">
                  ${this._result.safetyTips.map(l=>L`<li>${l}</li>`)}
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
        ${this._pdfPreviewUrl?L`
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
    `}_getSeverityClass(){return this._result?this._result.overallStatus==="CRITICAL"?"safety-card":this._result.overallStatus==="MONITOR"?"result-card":"ocr-card":""}_triggerFileSelect(){var l,a;(a=(l=this.shadowRoot)==null?void 0:l.getElementById("file-upload"))==null||a.click()}_handleFileChange(l){var d;const a=(d=l.target.files)==null?void 0:d[0];if(!a)return;const n=new FileReader;n.onload=()=>{this._capturedImage=n.result,this._result=null},n.readAsDataURL(a)}async _loadDemoImage(){this._isLoading=!0,this._loadingMessage="Lade Demo-Wärmebild...";try{const l=await fetch("/demo-thermal.png");if(!l.ok)throw new Error("Demo image not found");const a=await l.clone().blob(),n=new FileReader;n.onloadend=()=>{this._capturedImage=n.result,this._result=null,this._isLoading=!1},n.readAsDataURL(a)}catch{alert("Fehler beim Laden des Demo-Bildes. Ist der Vite-Server aktiv?"),this._isLoading=!1}}async _startThermalAnalysis(){if(!this._capturedImage)return;this._isLoading=!0,this._result=null;let l=0;this._loadingMessage=this._loadingPhrases[0],this._loadingInterval=window.setInterval(()=>{l++,l<this._loadingPhrases.length&&(this._loadingMessage=this._loadingPhrases[l])},1800);try{const a=await this._aiService.analyzeThermalImage(this._capturedImage,this._description);this._result=a,this._isLoading=!1,this._loadingInterval&&clearInterval(this._loadingInterval),await this.updateComplete,this._drawHotspots()}catch(a){alert(`Fehler bei der Analyse: ${a.message||a}`),this._isLoading=!1,this._loadingInterval&&clearInterval(this._loadingInterval)}}_drawHotspots(){if(!this._canvas||!this._result||!this._capturedImage)return;this._ctx=this._canvas.getContext("2d");const l=new Image;l.onload=()=>{const a=l.width,n=l.height;this._canvas.width=a,this._canvas.height=n,this._ctx&&(this._ctx.drawImage(l,0,0),this._ctx.lineCap="round",this._ctx.lineJoin="round",this._result.detectedHotspots.forEach(d=>{if(!d.box_2d||d.box_2d.length!==4)return;const u=d.box_2d[0]/1e3*n,g=d.box_2d[1]/1e3*a,m=d.box_2d[2]/1e3*n,A=d.box_2d[3]/1e3*a-g,_=m-u;let k="#10b981";d.severity==="CRITICAL"?k="#ef4444":d.severity==="MONITOR"&&(k="#f59e0b"),this._ctx.strokeStyle=k,this._ctx.lineWidth=Math.max(4,Math.floor(a/150)),this._ctx.strokeRect(g,u,A,_),this._ctx.fillStyle=k;const I=Math.max(14,Math.floor(a/35));this._ctx.font=`bold ${I}px var(--font-sans, sans-serif)`;const $=`${d.label} (${d.temperature})`,X=this._ctx.measureText($).width;this._ctx.fillRect(g,u-I-8,X+14,I+10),this._ctx.fillStyle="#ffffff",this._ctx.fillText($,g+7,u-7)}))},l.src=this._capturedImage}_toggleStep(l,a){if(!this._result)return;const n=a.target.checked;this._result.actionSteps[l].completed=n,this.requestUpdate()}async _downloadPdfReport(){if(this._result){this._isLoading=!0,this._loadingMessage="Generiere PDF...";try{const l=localStorage.getItem("electrocheck_inspector_name")||"",a=localStorage.getItem("electrocheck_inspector_company")||"",n=localStorage.getItem("electrocheck_inspector_id")||"",d=this._canvas?this._canvas.toDataURL("image/jpeg",.8):this._capturedImage,u=Qh(this._result,d,"Haftungsausschluss: Dieser Bericht basiert auf einer KI-gestützten thermografischen Bildanalyse. Thermografische Schätzungen ersetzen keine kalibrierten Messgeräte oder professionelle Abnahmen durch Sachverständige. Arbeiten an elektrischen Anlagen dürfen nur durch qualifizierte Elektrofachkräfte unter Einhaltung der 5 Sicherheitsregeln vorgenommen werden.",{name:l,company:a,id:n}),g=await gi(()=>import("./pdfmake-UxFsYefG.js").then(_=>_.p),[]),m=await gi(()=>import("./vfs_fonts-t15MiyXJ.js").then(_=>_.v),[]),C=g.default||g,A=m.default||m;C.vfs=A.pdfMake?A.pdfMake.vfs:A.vfs,C.createPdf(u).download(`Wärmebild_Protokoll_${new Date().toISOString().slice(0,10)}.pdf`)}catch{alert("Fehler bei der PDF-Erstellung.")}finally{this._isLoading=!1}}}_reset(){this._capturedImage=null,this._result=null,this._description="",this._pdfPreviewUrl=null}};Gt.styles=Jt(wi);bi([H()],Gt.prototype,"_isLoading",2);bi([H()],Gt.prototype,"_loadingMessage",2);bi([H()],Gt.prototype,"_description",2);bi([H()],Gt.prototype,"_capturedImage",2);bi([H()],Gt.prototype,"_result",2);bi([H()],Gt.prototype,"_pdfPreviewUrl",2);bi([Pr("#thermal-canvas")],Gt.prototype,"_canvas",2);Gt=bi([bt("ec-thermal-analysis")],Gt);var tu=Object.defineProperty,iu=Object.getOwnPropertyDescriptor,ti=(l,a,n,d)=>{for(var u=d>1?void 0:d?iu(a,n):a,g=l.length-1,m;g>=0;g--)(m=l[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&tu(a,n,u),u};let Mt=class extends ke{constructor(){super(...arguments),this._system="single",this._material="cu",this._crossSection=1.5,this._current=16,this._length=20,this._cosPhi=1,this._explanation="",this._isLoadingExplanation=!1}_calculate(){const l=this._material==="cu"?56:34,a=this._system==="single"?230:400;let n=0;this._system==="single"?n=2*this._length*this._current*this._cosPhi/(l*this._crossSection):n=Math.sqrt(3)*this._length*this._current*this._cosPhi/(l*this._crossSection);const d=n/a*100,u=d<=3;return{deltaU:n.toFixed(2),pct:d.toFixed(2),passed:u,voltage:a}}async _getAIExplanation(){this._isLoadingExplanation=!0,this._explanation="";const{deltaU:l,pct:a,passed:n}=this._calculate(),d=this._material==="cu"?"Kupfer":"Aluminium",g=`Ein Elektriker berechnet den Spannungsfall nach VDE 0100-520. Details:
- System: ${this._system==="single"?"Wechselstrom (230V)":"Drehstrom (400V)"}
- Leitermaterial: ${d}
- Querschnitt: ${this._crossSection} mm²
- Nennstrom: ${this._current} A
- Länge: ${this._length} m
- Spannungsfall berechnet: ${l} V (${a} %)
- VDE Limit (3.0%): ${n?"Bestanden":"NICHT BESTANDEN"}.

Erkläre kurz und präzise in 2-3 Sätzen auf Deutsch, warum dieser Wert zustande kommt, welche Risiken bestehen (z.B. Brandgefahr, Funktionsstörung) und was empfohlen wird.`;try{const m=localStorage.getItem("electrocheck_backend_url")||"http://localhost:3000",C={"Content-Type":"application/json"},A=localStorage.getItem("electrocheck_gemini_api_key");A&&(C["x-gemini-api-key"]=A);const _=await fetch(`${m}/api/gemini/diagnosis`,{method:"POST",headers:C,body:JSON.stringify({description:g,imageBase64:null})});if(_.ok){const k=await _.json();this._explanation=k.recommendation||"Keine Empfehlung generiert."}else this._explanation="Erklärung konnte nicht geladen werden. Prüfen Sie Ihren API-Key."}catch{this._explanation="Verbindungsfehler bei der Erklärung."}finally{this._isLoadingExplanation=!1}}render(){const{deltaU:l,pct:a,passed:n,voltage:d}=this._calculate();return L`
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
            <select .value="${this._system}" @change="${u=>this._system=u.target.value}">
              <option value="single">Wechselstrom (1-phasig / 230V)</option>
              <option value="three">Drehstrom (3-phasig / 400V)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Leitermaterial</label>
            <select .value="${this._material}" @change="${u=>this._material=u.target.value}">
              <option value="cu">Kupfer (Cu)</option>
              <option value="al">Aluminium (Al)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Nennquerschnitt (A) in mm²</label>
            <select .value="${this._crossSection.toString()}" @change="${u=>this._crossSection=parseFloat(u.target.value)}">
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
            <input type="number" .value="${this._current.toString()}" @input="${u=>this._current=parseFloat(u.target.value)||0}" />
          </div>

          <div class="form-group">
            <label>Einfache Leitungslänge (L) in m</label>
            <input type="number" .value="${this._length.toString()}" @input="${u=>this._length=parseFloat(u.target.value)||0}" />
          </div>

          <div class="form-group">
            <label>Leistungsfaktor (cos φ)</label>
            <input type="number" step="0.05" min="0.5" max="1.0" .value="${this._cosPhi.toString()}" @input="${u=>this._cosPhi=parseFloat(u.target.value)||1}" />
          </div>
        </div>

        <div class="summary-box">
          <div class="summary-row">
            <span>Soll-Spannung:</span>
            <strong>${d} V</strong>
          </div>
          <div class="summary-row">
            <span>Spannungsfall (V):</span>
            <strong>${l} V</strong>
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

        ${this._explanation?L`
          <div class="explanation-box">
            <strong>🤖 KI-Erklärung:</strong><br />
            ${this._explanation}
          </div>
        `:""}
      </div>
    `}};Mt.styles=[Jt(wi),Qe`
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
    `];ti([H()],Mt.prototype,"_system",2);ti([H()],Mt.prototype,"_material",2);ti([H()],Mt.prototype,"_crossSection",2);ti([H()],Mt.prototype,"_current",2);ti([H()],Mt.prototype,"_length",2);ti([H()],Mt.prototype,"_cosPhi",2);ti([H()],Mt.prototype,"_explanation",2);ti([H()],Mt.prototype,"_isLoadingExplanation",2);Mt=ti([bt("ec-vde-calculator")],Mt);const Za=[{id:"vde-0100-520",title:"Spannungsfall in Verbrauchsanlagen",standard:"DIN VDE 0100-520",category:"Leitungsdimensionierung",summary:"Regelt den maximal zulässigen Spannungsfall zwischen dem Zähler und den Verbrauchern, um Fehlfunktionen und Überlastungen zu vermeiden.",limitValues:["Maximal 3,0 % Spannungsfall für Beleuchtungs- und Steckdosenstromkreise in Wohngebäuden.","Maximal 4,0 % für andere Anlagen."],tips:["Wählen Sie bei langen Leitungswegen (>17 Meter bei 1.5mm² und 16A) einen größeren Querschnitt (z.B. 2.5mm²).","Berücksichtigen Sie den Leistungsfaktor cos φ des Verbrauchers bei induktiven Lasten."]},{id:"vde-0701-0702-pe",title:"Schutzleiterwiderstand (R_PE) bei ortsveränderlichen Geräten",standard:"DIN VDE 0701-0702 / EN 50678 & EN 50699",category:"Geräteprüfung",summary:"Beschreibt den maximal zulässigen Widerstand des Schutzleiters für elektrische Geräte der Schutzklasse I.",limitValues:["R_PE ≤ 0,3 Ω für Leitungen bis 5 m Länge.","Zuzüglich 0,1 Ω für jede weiteren 7,5 m Leitungslänge.","Maximal zulässiger Gesamtwert: 1,0 Ω."],tips:["Messen Sie während der Prüfung an verschiedenen Stellen des Gehäuses unter leichter mechanischer Belastung (Bewegen der Anschlussleitung).","Achten Sie auf Oxidschichten oder Lackierungen am Gehäuse, die den Messwert verfälschen können."]},{id:"vde-0701-0702-iso",title:"Isolationswiderstand (R_ISO) bei Geräten",standard:"DIN VDE 0701-0702",category:"Geräteprüfung",summary:"Bestimmt den Mindestwert des Isolationswiderstands zwischen aktiven Leitern und berührbaren leitfähigen Teilen.",limitValues:["R_ISO ≥ 1,0 MΩ für Geräte der Schutzklasse I (mit Schutzleiter).","R_ISO ≥ 2,0 MΩ für Geräte der Schutzklasse II (schutzisoliert).","R_ISO ≥ 0,25 MΩ für Geräte der Schutzklasse III (Sicherheitskleinspannung)."],tips:["Führen Sie die Messung mit einer Prüfspannung von 500 V DC durch.","Schalten Sie alle Schalter des Prüflings während der Messung ein, damit alle internen Bauteile erfasst werden."]},{id:"vde-0701-0702-leak",title:"Schutzleiterstrom / Ableitstrom (I_leak)",standard:"DIN VDE 0701-0702",category:"Geräteprüfung",summary:"Definiert die Obergrenze für den Strom, der über den Schutzleiter oder das Gehäuse zur Erde abfließt.",limitValues:["Schutzleiterstrom ≤ 3,5 mA für Geräte der Schutzklasse I.","Berührungsstrom ≤ 0,5 mA für Geräte der Schutzklasse II."],tips:["Nutzen Sie vorzugsweise das Differenzstrommessverfahren, da es auch Ströme über parallele Erdungen erfasst.","Bei Heizelementen mit hoher Leistung (>3,5 kW) gelten abweichende Grenzwerte (bis zu 1 mA pro kW)."]},{id:"vde-0105-100-rules",title:"Die 5 Sicherheitsregeln",standard:"DIN VDE 0105-100",category:"Arbeitsschutz",summary:"Die grundlegenden Sicherheitsregeln zur Vermeidung von Stromunfällen vor Beginn von Arbeiten an elektrischen Anlagen.",limitValues:["1. Freischalten (Spannungsquelle allpolig trennen).","2. Gegen Wiedereinschalten sichern (Schalter blockieren, Warnschild anbringen).","3. Spannungsfreiheit feststellen (mit zweipoligem Spannungsprüfer verifizieren).","4. Erden und Kurzschließen (zwingend bei Spannungen über 1000 V).","5. Benachbarte, unter Spannung stehende Teile abdecken oder abschranken."],tips:["Die Regeln müssen genau in dieser Reihenfolge angewendet werden.","Das Feststellen der Spannungsfreiheit darf nur mit zugelassenen, zweipoligen Messgeräten (z.B. Duspol) erfolgen, niemals mit einfachen Phasenprüfern ('Lügenstiften')."]},{id:"vde-ip-classes",title:"IP-Schutzarten (Ingress Protection)",standard:"DIN EN 60529 (VDE 0470-1)",category:"Gehäuseschutz",summary:"Klassifizierung des Schutzes von Gehäusen gegen das Eindringen von Festkörpern (1. Ziffer) und Wasser (2. Ziffer).",limitValues:["IP 20: Schutz gegen feste Fremdkörper (Ø ≥ 12,5 mm), kein Schutz gegen Wasser (Standard im Innenbereich).","IP 44: Schutz gegen feste Fremdkörper (Ø ≥ 1,0 mm) und Spritzwasser (Standard im feuchten Innen- und Außenbereich).","IP 65: Staubdicht und Schutz gegen Strahlwasser aus beliebigem Winkel.","IP 67: Staubdicht und Schutz gegen zeitweiliges Untertauchen."],tips:["Achten Sie bei Außeninstallationen stets auf eine korrekte Einführung der Kabel von unten, um Kondenswasserbildung zu vermeiden.","Beschädigte Dichtungen an IP44-Gehäusen führen zum Erlöschen des Berührungsschutzes."]}];var ru=Object.defineProperty,nu=Object.getOwnPropertyDescriptor,_n=(l,a,n,d)=>{for(var u=d>1?void 0:d?nu(a,n):a,g=l.length-1,m;g>=0;g--)(m=l[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&ru(a,n,u),u};let nr=class extends ke{constructor(){super(...arguments),this._searchQuery="",this._selectedCategory="",this._expandedRuleId=null}_toggleExpand(l){this._expandedRuleId===l?this._expandedRuleId=null:this._expandedRuleId=l}render(){const l=Array.from(new Set(Za.map(n=>n.category))),a=Za.filter(n=>{const d=n.title.toLowerCase().includes(this._searchQuery.toLowerCase())||n.standard.toLowerCase().includes(this._searchQuery.toLowerCase())||n.summary.toLowerCase().includes(this._searchQuery.toLowerCase()),u=!this._selectedCategory||n.category===this._selectedCategory;return d&&u});return L`
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
          ${l.map(n=>L`
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
          ${a.length>0?a.map(n=>{const d=this._expandedRuleId===n.id;return L`
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
                
                ${d?L`
                  <div class="rule-details" @click="${u=>u.stopPropagation()}">
                    <div class="limit-section">
                      <h5>⚠️ Grenzwerte & Kriterien:</h5>
                      <ul class="limit-list">
                        ${n.limitValues.map(u=>L`<li>${u}</li>`)}
                      </ul>
                    </div>
                    
                    <div class="tips-section">
                      <h5>💡 Praxistipps & Vorgehensweise:</h5>
                      <ul class="tips-list">
                        ${n.tips.map(u=>L`<li>${u}</li>`)}
                      </ul>
                    </div>
                  </div>
                `:L`
                  <div style="font-size: 0.75rem; color: var(--primary); text-align: right; margin-top: 8px; font-weight: bold;">
                    Details anzeigen 👇
                  </div>
                `}
              </div>
            `}):L`
            <div style="text-align: center; padding: 2rem; color: var(--text-muted); font-style: italic;">
              Keine passenden VDE-Regeln gefunden.
            </div>
          `}
        </div>
      </div>
    `}};nr.styles=[Jt(wi),Qe`
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
    `];_n([H()],nr.prototype,"_searchQuery",2);_n([H()],nr.prototype,"_selectedCategory",2);_n([H()],nr.prototype,"_expandedRuleId",2);nr=_n([bt("ec-vde-rules")],nr);var su=Object.defineProperty,au=Object.getOwnPropertyDescriptor,he=(l,a,n,d)=>{for(var u=d>1?void 0:d?au(a,n):a,g=l.length-1,m;g>=0;g--)(m=l[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&su(a,n,u),u};let ne=class extends ke{constructor(){super(...arguments),this._isDarkMode=!1,this._isSettingsOpen=!1,this._isLoading=!1,this._isTicketCreating=!1,this._isOnline=!0,this._loadingMessage="Bereite Analyse vor...",this._isListening=!1,this._safetyConfirmed=!1,this._safetyChecks=[!1,!1,!1,!1,!1],this._activeTab="diagnose",this._rPe="",this._rIso="",this._iLeak="",this._capturedImage=null,this._ctx=null,this._isDrawing=!1,this._lastX=0,this._lastY=0,this._recognition=null,this._description="",this._result=null,this._ocrResult=null,this._history=[],this._offlineQueue=[],this._pdfPreviewUrl=null,this._loadingInterval=null,this._cancelRequested=!1,this._apiKey="",this._perplexityApiKey="",this._perplexityResult=null,this._isSearchingPerplexity=!1,this._offlineDatasheetMatch=null,this._signatureUrl=null,this._isRecordingAudio=!1,this._backendUrl="http://localhost:3000",this._accessibleMode=!1,this._hasAcceptedGDPR=!1,this._inspectorName="",this._inspectorCompany="",this._inspectorId="",this._gdprCheckbox=!1,this._guidedRepairStepIndex=null,this._showLegalModal=null,this._isMultimeterCameraOpen=!1,this._mediaRecorder=null,this._audioChunks=[],this._aiService=new Do,this._perplexityService=new Jd,this._ticketService=new Qd,this._disclaimerText="Haftungsausschluss: Die Nutzung dieser Anwendung sowie die Umsetzung der bereitgestellten Tipps und Diagnoseergebnisse erfolgen ausschließlich auf eigene Gefahr und auf eigenes Risiko. Bei den Inhalten handelt es sich um KI-generierte Empfehlungen, die nach bestem Wissen erstellt wurden; sie stellen jedoch keine Rechtsberatung, keine technische Gewährleistung und keine Erfolgsgarantie dar. Diese Informationen können fehlerhaft sein und ersetzen unter keinen Umständen die Prüfung und Durchführung durch einen qualifizierten Servicetechniker. Vor Arbeiten an elektrischen Anlagen ist die Spannungsfreiheit sicherzustellen und die Einhaltung der geltenden Sicherheitsvorschriften (z.B. die 5 Sicherheitsregeln) liegt in der alleinigen Verantwortung des Nutzers.",this._loadingPhrases=["Übertrage Daten...","Scanne Bauteile...","Analysiere Beschreibung...","Gleiche Datenbank ab...","Kalkuliere Kosten...","Erstelle Protokoll..."]}async firstUpdated(){this._loadAppData(),this._initNetworkRadar()}disconnectedCallback(){this._recognition&&this._recognition.stop(),super.disconnectedCallback()}async _loadAppData(){const l=localStorage.getItem("electrocheck_history_v2");l&&(this._history=JSON.parse(l));const a=localStorage.getItem("electrocheck_queue");a&&(this._offlineQueue=JSON.parse(a));const n=localStorage.getItem("electrocheck_theme");if(n)this._isDarkMode=n==="dark",this.setAttribute("theme",n),document.documentElement.setAttribute("theme",n);else{const I=window.matchMedia("(prefers-color-scheme: dark)").matches;this._isDarkMode=I;const $=I?"dark":"light";this.setAttribute("theme",$),document.documentElement.setAttribute("theme",$)}const d=localStorage.getItem("electrocheck_gemini_api_key");d&&(this._apiKey=d);const u=localStorage.getItem("electrocheck_perplexity_api_key");u&&(this._perplexityApiKey=u);const g=localStorage.getItem("electrocheck_backend_url");g&&(this._backendUrl=g),localStorage.getItem("electrocheck_accessible_mode")==="true"&&(this._accessibleMode=!0,document.documentElement.classList.add("accessible-reading"),this.classList.add("accessible-reading"));const C=localStorage.getItem("electrocheck_gdpr_accepted");this._hasAcceptedGDPR=C==="true";const A=localStorage.getItem("electrocheck_inspector_name")||"",_=localStorage.getItem("electrocheck_inspector_company")||"",k=localStorage.getItem("electrocheck_inspector_id")||"";this._inspectorName=A,this._inspectorCompany=_,this._inspectorId=k}async _initNetworkRadar(){const l=await ws.getStatus();this._isOnline=l.connected,ws.addListener("networkStatusChange",a=>{this._isOnline=a.connected,a.connected&&(this._offlineQueue.length>0&&this._processOfflineQueue(),this._ticketService.syncOfflineTickets().then(n=>{n>0&&alert(`✅ ${n} Offline-Ticket(s) erfolgreich synchronisiert.`)}).catch(n=>{console.error("Fehler bei Ticket-Synchronisation:",n)}))})}_toggleTheme(){this._isDarkMode=!this._isDarkMode;const l=this._isDarkMode?"dark":"light";localStorage.setItem("electrocheck_theme",l),this.setAttribute("theme",l),document.documentElement.setAttribute("theme",l)}_handleSafetyChanged(l){const{index:a,checked:n}=l.detail;this._safetyChecks=[...this._safetyChecks.slice(0,a),n,...this._safetyChecks.slice(a+1)]}_handleSafetyConfirmed(){this._safetyConfirmed=!0}_cancelAnalysis(){this._cancelRequested=!0,this._isLoading=!1,this._loadingInterval&&clearInterval(this._loadingInterval)}_reset(){this._capturedImage=null,this._result=null,this._ocrResult=null,this._description="",this._rPe="",this._rIso="",this._iLeak=""}_getDguvStatus(){const l=[];let a=!0;if(this._rPe.trim()){const d=parseFloat(this._rPe.replace(",","."));isNaN(d)?(l.push("R_PE: Ungültiger Wert"),a=!1):d>.3?(l.push(`R_PE: ${d} Ω (> 0.3 Ω Grenzwert) ❌`),a=!1):l.push(`R_PE: ${d} Ω (≤ 0.3 Ω) ✅`)}if(this._rIso.trim()){const d=parseFloat(this._rIso.replace(",","."));isNaN(d)?(l.push("R_ISO: Ungültiger Wert"),a=!1):d<1?(l.push(`R_ISO: ${d} MΩ (< 1.0 MΩ Grenzwert) ❌`),a=!1):l.push(`R_ISO: ${d} MΩ (≥ 1.0 MΩ) ✅`)}if(this._iLeak.trim()){const d=parseFloat(this._iLeak.replace(",","."));isNaN(d)?(l.push("I_leak: Ungültiger Wert"),a=!1):d>3.5?(l.push(`Ableitstrom: ${d} mA (> 3.5 mA Grenzwert) ❌`),a=!1):l.push(`Ableitstrom: ${d} mA (≤ 3.5 mA) ✅`)}return this._rPe.trim()||this._rIso.trim()||this._iLeak.trim()?{passed:a,message:a?"BESTANDEN":"NICHT BESTANDEN",details:l}:{passed:!0,message:"Keine Messdaten eingetragen",details:[]}}_toggleVoice(){if(!this._recognition){const l=window.SpeechRecognition||window.webkitSpeechRecognition;if(!l){alert("Dein Browser unterstützt leider keine Spracherkennung.");return}this._recognition=new l,this._recognition.lang="de-DE",this._recognition.continuous=!1,this._recognition.interimResults=!0,this._recognition.maxAlternatives=1,this._recognition.onresult=a=>{const n=a.results[0][0].transcript;this._description=this._description?this._description+" "+n:n},this._recognition.onend=()=>{this._isListening=!1},this._recognition.onerror=()=>{this._isListening=!1,alert("Fehler bei der Spracherkennung. Bitte Mikrofon-Berechtigung prüfen oder versuchen Sie es erneut.")}}if(this._isListening)this._recognition.stop(),this._isListening=!1;else{this._description="";try{this._recognition.start(),this._isListening=!0}catch(l){console.error("Error starting speech recognition:",l),alert("Fehler beim Starten der Spracherkennung.")}}}async _getCurrentLocation(){try{try{if((await ss.checkPermissions()).location!=="granted"&&(await ss.requestPermissions()).location!=="granted")return console.warn("Standort-Berechtigung verweigert."),"Standort-Berechtigung verweigert"}catch(a){console.warn("Berechtigungsprüfung übersprungen (vermutlich Browser):",a)}const l=await ss.getCurrentPosition({enableHighAccuracy:!0,timeout:1e4});return`Lat: ${l.coords.latitude.toFixed(5)}, Lng: ${l.coords.longitude.toFixed(5)}`}catch(l){return console.error("Standortfehler:",l),"Standort konnte nicht ermittelt werden (Evtl. kein HTTPS oder blockiert)"}}_initDrawingCanvas(){if(!this._drawCanvas||!this._capturedImage)return;this._ctx=this._drawCanvas.getContext("2d");const l=new Image;l.onload=()=>{var a;this._drawCanvas.width=l.width,this._drawCanvas.height=l.height,(a=this._ctx)==null||a.drawImage(l,0,0),this._ctx&&(this._ctx.strokeStyle="#ff0000",this._ctx.lineWidth=10,this._ctx.lineCap="round")},l.src=this._capturedImage}_handlePointerDown(l){this._isDrawing=!0;const a=this._drawCanvas.getBoundingClientRect(),n=this._drawCanvas.width/a.width;this._lastX=(l.clientX-a.left)*n,this._lastY=(l.clientY-a.top)*n}_handlePointerMove(l){if(!this._isDrawing||!this._ctx)return;const a=this._drawCanvas.getBoundingClientRect(),n=this._drawCanvas.width/a.width,d=(l.clientX-a.left)*n,u=(l.clientY-a.top)*n;this._ctx.beginPath(),this._ctx.moveTo(this._lastX,this._lastY),this._ctx.lineTo(d,u),this._ctx.stroke(),this._lastX=d,this._lastY=u}_checkLocalDatabase(l){const a=l.toLowerCase(),n=rh.find(d=>a.includes(d.model.toLowerCase())||a.includes(d.errorCode.toLowerCase()));return n?{deviceName:n.model,identifiedDefect:n.diagnosis,recommendation:n.action,estimatedRepairCost:"0 - 50 €",repairDifficulty:2,safetyLevel:"WARNING",additionalTips:[n.safety],sparePartSearchTerm:"",customerExperience:"⚡ Sofort-Diagnose aus lokaler Offline-Datenbank."}:null}async _startAnalysis(){if(!this._capturedImage&&!this._description.trim())return alert("Kein Bild oder Text vorhanden.");const l=this._drawCanvas?this._drawCanvas.toDataURL("image/jpeg",.8):this._capturedImage;if(!this._isOnline)return this._offlineQueue=[...this._offlineQueue,{image:l,description:this._description,timestamp:Date.now()}],localStorage.setItem("electrocheck_queue",JSON.stringify(this._offlineQueue)),alert("Offline! Daten wurden im Wartezimmer gespeichert."),this._reset();this._cancelRequested=!1,this._isLoading=!0,this._result=null,this._ocrResult=null;let a=0;if(this._loadingMessage=this._loadingPhrases[0],this._loadingInterval=window.setInterval(()=>{a++,a<this._loadingPhrases.length&&(this._loadingMessage=this._loadingPhrases[a])},1800),this._description.trim()){const n=this._checkLocalDatabase(this._description);if(n){const d=await this._getCurrentLocation();this._result={...n,disclaimer:this._disclaimerText,location:d},this._saveToHistory(this._result),this._isLoading=!1,this._loadingInterval&&clearInterval(this._loadingInterval);return}}try{const n=await this._aiService.getDiagnosis(l,this._description);if(!this._cancelRequested){const d=await this._getCurrentLocation();this._result={...n,disclaimer:this._disclaimerText,location:d},this._result&&(this._saveToHistory(this._result),await this.updateComplete,this._result.boundingBoxes&&this._result.boundingBoxes.length>0&&this._drawAIBoundingBoxes())}}catch{this._cancelRequested||alert("Analyse fehlgeschlagen.")}finally{this._isLoading=!1,this._loadingInterval&&clearInterval(this._loadingInterval)}}_drawAIBoundingBoxes(){if(!this._drawCanvas||!this._result||!this._result.boundingBoxes)return;const l=this._drawCanvas.getContext("2d");if(!l)return;const a=this._drawCanvas.width,n=this._drawCanvas.height;l.lineWidth=Math.max(3,Math.floor(a/200)),l.lineCap="round",l.lineJoin="round",this._result.boundingBoxes.forEach(d=>{if(!d.box_2d||d.box_2d.length!==4)return;const u=d.box_2d[0]/1e3*n,g=d.box_2d[1]/1e3*a,m=d.box_2d[2]/1e3*n,A=d.box_2d[3]/1e3*a-g,_=m-u;l.strokeStyle="#10b981",l.strokeRect(g,u,A,_),l.fillStyle="rgba(16, 185, 129, 0.85)";const k=Math.max(12,Math.floor(a/40));l.font=`bold ${k}px var(--font-sans, sans-serif)`;const I=l.measureText(d.label).width;l.fillRect(g,u-k-6,I+12,k+8),l.fillStyle="#ffffff",l.fillText(d.label,g+6,u-5)})}async _runPerplexitySearch(){if(this._result){this._isSearchingPerplexity=!0,this._perplexityResult=null;try{const l=`Recherchiere VDE-Richtlinien und typische Reparaturanleitungen für folgendes Gerät und Defekt: Gerät: ${this._result.deviceName}, Defekt: ${this._result.identifiedDefect}. Was sind die wichtigsten Sicherheitsvorkehrungen und VDE-Regeln für diesen Fall?`;this._perplexityResult=await this._perplexityService.search(l)}catch(l){alert(`Fehler bei der Perplexity-Suche: ${l.message}`)}finally{this._isSearchingPerplexity=!1}}}_formatMarkdown(l){if(!l)return"";let a=l.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>");return a=a.replace(/^\*\s(.*)$/gm,"• $1"),a}async _toggleAudioRecording(){this._isRecordingAudio?this._stopAudioRecording():await this._startAudioRecording()}async _startAudioRecording(){try{const l=await navigator.mediaDevices.getUserMedia({audio:!0});this._mediaRecorder=new MediaRecorder(l,{mimeType:"audio/webm"}),this._audioChunks=[],this._mediaRecorder.ondataavailable=a=>{a.data.size>0&&this._audioChunks.push(a.data)},this._mediaRecorder.onstop=async()=>{const a=new Blob(this._audioChunks,{type:"audio/webm"});l.getTracks().forEach(n=>n.stop()),await this._sendAudioToTranscribe(a)},this._mediaRecorder.start(),this._isRecordingAudio=!0}catch{alert("Zugriff auf das Mikrofon verweigert oder nicht unterstützt.")}}_stopAudioRecording(){this._mediaRecorder&&this._mediaRecorder.state!=="inactive"&&(this._mediaRecorder.stop(),this._isRecordingAudio=!1)}async _sendAudioToTranscribe(l){this._isLoading=!0,this._loadingMessage="Transkribiere Sprachnotiz...";try{const a=await new Promise((u,g)=>{const m=new FileReader;m.onloadend=()=>u(m.result),m.onerror=g,m.readAsDataURL(l)}),n=await fetch(`${this._backendUrl}/api/gemini/transcribe`,{method:"POST",headers:this._getHeaders(),body:JSON.stringify({audioBase64:a})});if(!n.ok)throw new Error("Transkriptionsanfrage fehlgeschlagen.");const d=await n.json();d.text&&(this._description=this._description?`${this._description} ${d.text}`:d.text)}catch{alert("Fehler bei der Transkription der Sprachnotiz.")}finally{this._isLoading=!1}}_getHeaders(){const l={"Content-Type":"application/json"};this._apiKey&&(l["x-gemini-api-key"]=this._apiKey);const a=localStorage.getItem("electrocheck_perplexity_api_key");return a&&(l["x-perplexity-api-key"]=a),l}async _processOfflineQueue(){const l=[...this._offlineQueue];for(const a of l)try{const n=await this._aiService.getDiagnosis(a.image,a.description);this._saveToHistory(n),this._offlineQueue=this._offlineQueue.filter(d=>d.timestamp!==a.timestamp),localStorage.setItem("electrocheck_queue",JSON.stringify(this._offlineQueue))}catch(n){console.warn("Fehler bei der Abarbeitung der Offline-Queue. Pausiere Übertragung.",n);break}this._offlineQueue.length===0&&alert("Alle Offline-Diagnosen verarbeitet.")}async _handlePhotoCaptured(l){this._capturedImage=l,await this.updateComplete,this._initDrawingCanvas()}_handleMultimeterScanRequested(){this._isMultimeterCameraOpen=!0}async _handleMultimeterPhotoCaptured(l){const a=l.detail.image;this._isMultimeterCameraOpen=!1,this._isLoading=!0,this._loadingMessage="Lese Multimeter ab...";try{const n=await this._aiService.scanMultimeter(a);if(console.log("Multimeter-Scan Ergebnis:",n),n.value!==null&&n.value!==void 0){const d=n.value.toString(),u=(n.unit||"").toUpperCase();u.includes("KOHM")||u.includes("MOHM")||u==="OHM"?n.value>10?this._rIso=d:this._rPe=d:u.includes("MA")||u==="A"?this._iLeak=d:u==="V"&&alert(`Spannungsmesswert erkannt: ${d} V. Bitte tragen Sie diesen Wert manuell ein.`),alert(`Messwert erfolgreich eingelesen: ${d} ${n.unit}`)}else alert("Messwert konnte auf dem Bild nicht eindeutig erkannt werden.")}catch(n){alert("Fehler beim Ablesen des Multimeters: "+n.message)}finally{this._isLoading=!1}}async _handleOcrScanRequested(l){this._capturedImage=l,this._isLoading=!0,this._loadingMessage="Lese Typenschild...";try{if(this._ocrResult=await this._aiService.scanTypePlate(l),this._ocrResult&&this._ocrResult.componentName){const a=await lh(this._ocrResult.componentName);this._offlineDatasheetMatch=a}}catch{alert("OCR-Fehler. Stellen Sie sicher, dass das Typenschild gut lesbar ist.")}finally{this._isLoading=!1}}_handleQrDetected(l){this._description=`[Anlage erkannt: ${l}]
`+this._description,alert(`✅ Code erkannt: ${l}`)}_openOfflineDatasheet(){if(!this._offlineDatasheetMatch)return;const l=document.createElement("a");l.href=this._offlineDatasheetMatch.fileData,l.download=this._offlineDatasheetMatch.name,l.click()}_saveToHistory(l){this._history=[l,...this._history.slice(0,9)],localStorage.setItem("electrocheck_history_v2",JSON.stringify(this._history))}_handleSaveSettings(l){this._apiKey=l.detail.apiKey,this._perplexityApiKey=l.detail.perplexityApiKey||"",this._backendUrl=l.detail.backendUrl,this._inspectorName=l.detail.inspectorName||"",this._inspectorCompany=l.detail.inspectorCompany||"",this._inspectorId=l.detail.inspectorId||"",localStorage.setItem("electrocheck_gemini_api_key",this._apiKey),localStorage.setItem("electrocheck_perplexity_api_key",this._perplexityApiKey),localStorage.setItem("electrocheck_backend_url",this._backendUrl),localStorage.setItem("electrocheck_inspector_name",this._inspectorName),localStorage.setItem("electrocheck_inspector_company",this._inspectorCompany),localStorage.setItem("electrocheck_inspector_id",this._inspectorId),this._isSettingsOpen=!1,alert("Einstellungen gespeichert!")}_handleAccessibleChanged(l){const a=l.detail.checked;this._accessibleMode=a,localStorage.setItem("electrocheck_accessible_mode",a?"true":"false"),a?(document.documentElement.classList.add("accessible-reading"),this.classList.add("accessible-reading")):(document.documentElement.classList.remove("accessible-reading"),this.classList.remove("accessible-reading"))}_acceptGDPR(){this._gdprCheckbox&&(this._hasAcceptedGDPR=!0,localStorage.setItem("electrocheck_gdpr_accepted","true"))}_exportData(){try{const l=JSON.stringify(this._history,null,2),a="data:application/json;charset=utf-8,"+encodeURIComponent(l),n="electrocheck_diagnosen_export.json",d=document.createElement("a");d.setAttribute("href",a),d.setAttribute("download",n),d.click()}catch{alert("Fehler beim Exportieren der Daten.")}}_deleteData(){confirm("Möchten Sie wirklich alle lokalen Daten (Historie, Einstellungen, API-Schlüssel) unwiderruflich löschen?")&&(localStorage.clear(),this._history=[],this._apiKey="",this._backendUrl="http://localhost:3000",this._inspectorName="",this._inspectorCompany="",this._inspectorId="",this._hasAcceptedGDPR=!1,this._isSettingsOpen=!1,this._safetyConfirmed=!1,this._safetyChecks=[!1,!1,!1,!1,!1],alert("Alle lokalen Daten wurden gelöscht."),window.location.reload())}async _createTicket(){if(this._result){this._isTicketCreating=!0;try{const l=await this._ticketService.createMaintenanceTicket(this._result);alert(`✅ Ticket erfolgreich erstellt: ${l}`)}catch(l){alert(l.message)}finally{this._isTicketCreating=!1}}}async _shareResult(){if(!this._result)return;const l=`Diagnose: ${this._result.deviceName}
Defekt: ${this._result.identifiedDefect}`;navigator.share?await navigator.share({title:"ElectroCheck AI",text:l}):(await navigator.clipboard.writeText(l),alert("In Zwischenablage kopiert!"))}async _openPdfPreview(){this._isLoading=!0,this._loadingMessage="Lade Vorschau...";try{const l=this._rPe.trim()||this._rIso.trim()||this._iLeak.trim()?{rPe:this._rPe,rIso:this._rIso,iLeak:this._iLeak,status:this._getDguvStatus().message,details:this._getDguvStatus().details,signatureUrl:this._signatureUrl}:void 0,a=Ya(this._result,this._drawCanvas?this._drawCanvas.toDataURL("image/jpeg",.8):this._capturedImage,this._disclaimerText,l,{name:this._inspectorName,company:this._inspectorCompany,id:this._inspectorId});if(!a)return;const n=await gi(()=>import("./pdfmake-UxFsYefG.js").then(m=>m.p),[]),d=await gi(()=>import("./vfs_fonts-t15MiyXJ.js").then(m=>m.v),[]),u=n.default||n,g=d.default||d;u.vfs=g.pdfMake?g.pdfMake.vfs:g.vfs,u.createPdf(a).getBlob(m=>{this._pdfPreviewUrl=URL.createObjectURL(m),this._isLoading=!1,this.requestUpdate()})}catch{alert("Fehler bei der PDF-Vorschau."),this._isLoading=!1}}async _downloadPdfDirectly(){var l;try{const a=this._rPe.trim()||this._rIso.trim()||this._iLeak.trim()?{rPe:this._rPe,rIso:this._rIso,iLeak:this._iLeak,status:this._getDguvStatus().message,details:this._getDguvStatus().details,signatureUrl:this._signatureUrl}:void 0,n=Ya(this._result,this._drawCanvas?this._drawCanvas.toDataURL("image/jpeg",.8):this._capturedImage,this._disclaimerText,a,{name:this._inspectorName,company:this._inspectorCompany,id:this._inspectorId});if(!n)return;const d=await gi(()=>import("./pdfmake-UxFsYefG.js").then(C=>C.p),[]),u=await gi(()=>import("./vfs_fonts-t15MiyXJ.js").then(C=>C.v),[]),g=d.default||d,m=u.default||u;g.vfs=m.pdfMake?m.pdfMake.vfs:m.vfs,g.createPdf(n).download(`Protokoll_${(l=this._result)==null?void 0:l.deviceName.replace(/\s+/g,"_")}.pdf`)}catch{alert("Fehler beim PDF Download.")}}_toggleChecklistStep(l,a){if(!this._result||!this._result.actionSteps)return;const n=a.target.checked;this._result.actionSteps[l].completed=n,this.requestUpdate(),this._saveToHistory(this._result)}_getChecklistProgress(){return!this._result||!this._result.actionSteps||this._result.actionSteps.length===0?0:this._result.actionSteps.filter(a=>a.completed).length/this._result.actionSteps.length}_handleGuidedStepCompleted(l){this._result&&this._result.actionSteps&&(this._result.actionSteps[l].completed=!0,this.requestUpdate(),this._saveToHistory(this._result))}_handleGuidedRepairCompleted(){alert("🎉 Glückwunsch! Sie haben alle Reparatur-Schritte abgeschlossen."),this._guidedRepairStepIndex=null}_renderGDPRConsent(){return L`
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
              @change="${l=>{this._gdprCheckbox=l.target.checked,this.requestUpdate()}}"
            />
            <span>
              Ich willige in die Verarbeitung meiner Daten zum Zwecke der KI-Diagnose ein und bestätige, dass ich die <a href="#" @click="${l=>{l.preventDefault(),this._showLegalModal="privacy"}}">Datenschutzerklärung</a> gelesen habe.
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
    `}_renderLegalModal(){if(!this._showLegalModal)return L``;const l=this._showLegalModal==="imprint";return L`
      <div class="modal-overlay" style="z-index: 3000;">
        <div class="card settings-card" style="max-height: 85vh; overflow-y: auto;">
          <h3 class="m-0">${l?"Impressum":"Datenschutzerklärung"}</h3>
          <div style="margin: 1.25rem 0; font-size: 0.875rem; line-height: 1.6; text-align: left; color: var(--text-secondary);">
            ${l?L`
                  <p><strong>ElectroCheck AI</strong></p>
                  <p>Eine innovative Anwendung für Elektrofachkräfte.</p>
                  <p><strong>Vertreten durch:</strong><br>Schengi / ElektroCheck AI GmbH</p>
                  <p><strong>Kontakt:</strong><br>E-Mail: info@electrocheck-ai.de<br>Webseite: www.electrocheck-ai.de</p>
                  <p><strong>Haftungsausschluss:</strong><br>Die Inhalte dieser App (insb. die KI-Diagnosen) wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Arbeiten an elektrischen Anlagen dürfen nur durch qualifizierte Elektrofachkräfte unter Einhaltung der 5 Sicherheitsregeln durchgeführt werden.</p>
                `:L`
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
    `}_renderFooter(){return L`
      <footer class="app-footer">
        <div>© ${new Date().getFullYear()} ElectroCheck AI. Alle Rechte vorbehalten.</div>
        <div class="footer-links">
          <a href="#" @click="${l=>{l.preventDefault(),this._showLegalModal="imprint"}}">Impressum</a>
          <span>|</span>
          <a href="#" @click="${l=>{l.preventDefault(),this._showLegalModal="privacy"}}">Datenschutzerklärung</a>
        </div>
      </footer>
    `}_renderSkeleton(){return L`
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
    `}render(){return this._hasAcceptedGDPR?L`
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
          </div>
          <div>
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

        ${this._isOnline?"":L`<div class="offline-banner" role="status">📶 Offline-Modus aktiv</div>`}
        
        ${this._activeTab==="dashboard"?L`<ec-dashboard .history="${this._history}"></ec-dashboard>`:this._activeTab==="thermal"?L`<ec-thermal-analysis></ec-thermal-analysis>`:this._activeTab==="calculator"?L`<ec-vde-calculator></ec-vde-calculator>`:this._activeTab==="rules"?L`<ec-vde-rules></ec-vde-rules>`:L`
              ${this._safetyConfirmed?L`
                    ${this._guidedRepairStepIndex!==null?L`
                          <ec-guided-repair
                            .result="${this._result}"
                            .stepIndex="${this._guidedRepairStepIndex}"
                            @step-changed="${l=>this._guidedRepairStepIndex=l.detail.index}"
                            @step-completed="${l=>this._handleGuidedStepCompleted(l.detail.index)}"
                            @repair-completed="${this._handleGuidedRepairCompleted}"
                            @close="${()=>this._guidedRepairStepIndex=null}"
                          ></ec-guided-repair>
                        `:L`
                          ${this._capturedImage?L`
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
                              `:L`
                                <ec-camera-capture
                                  .isLoading="${this._isLoading}"
                                  @photo-captured="${l=>this._handlePhotoCaptured(l.detail.image)}"
                                  @ocr-scan-requested="${l=>this._handleOcrScanRequested(l.detail.image)}"
                                  @qr-detected="${l=>this._handleQrDetected(l.detail.text)}"
                                ></ec-camera-capture>
                              `}

                          <div class="card mt-1">
                            <vaadin-text-area
                              class="w-100"
                              label="Problembeschreibung"
                              helper-text="Beschreibe den Defekt oder diktiere per Mikrofon"
                              .value="${this._description}"
                              @value-changed="${l=>this._description=l.detail.value}"
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
                              ${this._capturedImage?L`
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

                          ${this._isLoading?this._renderSkeleton():""}
                          ${this._result&&!this._isLoading?L`
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

                                  ${this._result.actionSteps&&this._result.actionSteps.length>0?L`
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
                                            ${this._result.actionSteps.map((l,a)=>L`
                                                <label
                                                  style="display: flex; gap: 12px; align-items: flex-start; cursor: pointer; padding: 10px; background: var(--bg-card); border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid var(--border); transition: all 0.2s ease;"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    .checked="${l.completed}"
                                                    @change="${n=>this._toggleChecklistStep(a,n)}"
                                                    style="margin-top: 4px; transform: scale(1.2);"
                                                  />
                                                  <span
                                                    style="line-height: 1.4; transition: all 0.2s ease; ${l.completed?"text-decoration: line-through; color: var(--text-muted); opacity: 0.6;":"color: var(--text-primary); font-weight: 500;"}"
                                                  >
                                                    ${l.text}
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
                                    @dguv-changed="${l=>{this._rPe=l.detail.rPe,this._rIso=l.detail.rIso,this._iLeak=l.detail.iLeak,this._signatureUrl=l.detail.signatureUrl,this.requestUpdate()}}"
                                  ></ec-dguv-form>

                                  ${this._result.location?L`
                                        <div class="mt-1">
                                          <span class="label"
                                            >📍 Anlagenstandort:</span
                                          ><br />
                                          ${this._result.location.includes("Lat:")?L`<a
                                                href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this._result.location.replace("Lat: ","").replace(", Lng: ",","))}"
                                                target="_blank"
                                                class="link-primary"
                                                >${this._result.location}</a
                                              >`:L`<span class="text-danger-small"
                                                >${this._result.location}</span
                                              >`}
                                        </div>
                                      `:""}
                                  ${this._result.customerExperience?L`<div class="experience-box">
                                        💡
                                        <strong>Techniker-Erfahrung:</strong> ${this._result.customerExperience}
                                      </div>`:""}
                                  ${this._result.additionalTips&&this._result.additionalTips.length>0?L`
                                        <div class="mt-1">
                                          <span class="label">Profi-Tipps:</span>
                                          <ul class="tips-list">
                                            ${this._result.additionalTips.map(l=>L`<li>${l}</li>`)}
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

                                  ${this._perplexityResult?L`
                                        <div class="card mt-1" style="border-left: 4px solid var(--primary); text-align: left; background: var(--bg-app); box-shadow: var(--shadow-sm);">
                                          <h4 style="margin: 0 0 8px 0; font-weight: bold; color: var(--primary); display: flex; align-items: center; gap: 6px;">
                                            🌐 Perplexity Web-Recherche:
                                          </h4>
                                          <div style="font-size: 0.85rem; line-height: 1.6; color: var(--text-primary);">
                                            ${ad(this._formatMarkdown(this._perplexityResult))}
                                          </div>
                                        </div>
                                      `:""}

                                  ${this._result.sparePartSearchTerm?L`
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

                          ${this._ocrResult&&!this._isLoading?L`
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
                                    
                                    ${this._offlineDatasheetMatch?L`
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

                          ${this._history.length>0?L`
                                <div class="history-section mt-1-5">
                                  <div class="history-header">
                                    🗂️ Letzte Diagnosen
                                  </div>
                                  ${this._history.map(l=>L`
                                      <div
                                        class="history-item"
                                        @click="${()=>{this._result=l,this._perplexityResult=null,l.boundingBoxes&&l.boundingBoxes.length>0&&this.updateComplete.then(()=>this._drawAIBoundingBoxes())}}"
                                      >
                                        <span class="history-title"
                                          >${l.deviceName}</span
                                        >
                                        <span class="history-defect"
                                          >${l.identifiedDefect}</span
                                        >
                                      </div>
                                    `)}
                                </div>
                              `:""}
                        `}
                  `:L`
                    <ec-safety-checks
                      .safetyChecks="${this._safetyChecks}"
                      @safety-changed="${this._handleSafetyChanged}"
                      @safety-confirmed="${this._handleSafetyConfirmed}"
                    ></ec-safety-checks>
                  `}
            `}
        
        ${this._renderFooter()}

        ${this._pdfPreviewUrl?L`
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

        ${this._isSettingsOpen?L`
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

        ${this._isMultimeterCameraOpen?L`
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
    `:L`
        <div class="container">
          ${this._renderGDPRConsent()}
          ${this._renderLegalModal()}
        </div>
      `}};ne.styles=Jt(wi);he([H()],ne.prototype,"_isDarkMode",2);he([H()],ne.prototype,"_isSettingsOpen",2);he([H()],ne.prototype,"_isLoading",2);he([H()],ne.prototype,"_isTicketCreating",2);he([H()],ne.prototype,"_isOnline",2);he([H()],ne.prototype,"_loadingMessage",2);he([H()],ne.prototype,"_isListening",2);he([H()],ne.prototype,"_safetyConfirmed",2);he([H()],ne.prototype,"_safetyChecks",2);he([H()],ne.prototype,"_activeTab",2);he([H()],ne.prototype,"_rPe",2);he([H()],ne.prototype,"_rIso",2);he([H()],ne.prototype,"_iLeak",2);he([H()],ne.prototype,"_capturedImage",2);he([Pr("#drawing-canvas")],ne.prototype,"_drawCanvas",2);he([H()],ne.prototype,"_description",2);he([H()],ne.prototype,"_result",2);he([H()],ne.prototype,"_ocrResult",2);he([H()],ne.prototype,"_history",2);he([H()],ne.prototype,"_offlineQueue",2);he([H()],ne.prototype,"_pdfPreviewUrl",2);he([H()],ne.prototype,"_apiKey",2);he([H()],ne.prototype,"_perplexityApiKey",2);he([H()],ne.prototype,"_perplexityResult",2);he([H()],ne.prototype,"_isSearchingPerplexity",2);he([H()],ne.prototype,"_offlineDatasheetMatch",2);he([H()],ne.prototype,"_signatureUrl",2);he([H()],ne.prototype,"_isRecordingAudio",2);he([H()],ne.prototype,"_backendUrl",2);he([H()],ne.prototype,"_accessibleMode",2);he([H()],ne.prototype,"_hasAcceptedGDPR",2);he([H()],ne.prototype,"_inspectorName",2);he([H()],ne.prototype,"_inspectorCompany",2);he([H()],ne.prototype,"_inspectorId",2);he([H()],ne.prototype,"_gdprCheckbox",2);he([H()],ne.prototype,"_guidedRepairStepIndex",2);he([H()],ne.prototype,"_showLegalModal",2);he([H()],ne.prototype,"_isMultimeterCameraOpen",2);ne=he([bt("ec-diagnosis-wizard")],ne);var ou=Object.defineProperty,lu=Object.getOwnPropertyDescriptor,Vo=(l,a,n,d)=>{for(var u=d>1?void 0:d?lu(a,n):a,g=l.length-1,m;g>=0;g--)(m=l[g])&&(u=(d?m(a,n,u):m(u))||u);return d&&u&&ou(a,n,u),u};let gn=class extends ke{constructor(){super(...arguments),this._hasStarted=!1}render(){return L`
      <main>
        ${this._hasStarted?L`
              <ec-diagnosis-wizard></ec-diagnosis-wizard>`:L`
              <ec-welcome 
                @start="${this._handleStart}">
              </ec-welcome>`}
      </main>
    `}_handleStart(){this._hasStarted=!0}};gn.styles=Qe`
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
  `;Vo([H()],gn.prototype,"_hasStarted",2);gn=Vo([bt("app-root")],gn);export{Ms as W,Er as c,Fu as g};
