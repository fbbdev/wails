var W=Object.defineProperty;var C=(e,t)=>{for(var n in t)W(e,n,{get:t[n],enumerable:!0})};var O="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";var y=(e=21)=>{let t="",n=e;for(;n--;)t+=O[Math.random()*64|0];return t};var N=window.location.origin+"/wails/runtime";function c(e){return window.chrome?window.chrome.webview.postMessage(e):window.webkit.messageHandlers.external.postMessage(e)}var p={Call:0,ContextMenu:4,CancelCall:10},k=y();function h(e,t){return function(n,r=null){return T(e,n,t,r)}}function T(e,t,n,r){let o=new URL(N);o.searchParams.append("object",e),o.searchParams.append("method",t);let l={headers:{}};return n&&(l.headers["x-wails-window-name"]=n),r&&o.searchParams.append("args",JSON.stringify(r)),l.headers["x-wails-client-id"]=k,new Promise((a,d)=>{fetch(o,l).then(i=>{if(i.ok)return i.headers.get("Content-Type")&&i.headers.get("Content-Type").indexOf("application/json")!==-1?i.json():i.text();d(Error(i.statusText))}).then(i=>a(i)).catch(i=>d(i))})}var P={};C(P,{Capabilities:()=>B,IsAMD64:()=>X,IsARM:()=>U,IsARM64:()=>Y,IsDebug:()=>D,IsLinux:()=>j,IsMac:()=>L,IsWindows:()=>v});function B(){return fetch("/wails/capabilities").then(e=>e.json())}function v(){return window._wails.environment.OS==="windows"}function j(){return window._wails.environment.OS==="linux"}function L(){return window._wails.environment.OS==="darwin"}function X(){return window._wails.environment.Arch==="amd64"}function U(){return window._wails.environment.Arch==="arm"}function Y(){return window._wails.environment.Arch==="arm64"}function D(){return window._wails.environment.Debug===!0}window.addEventListener("contextmenu",q);var V=h(p.ContextMenu,""),J=0;function G(e,t,n,r){V(J,{id:e,x:t,y:n,data:r})}function q(e){let t=e.target,n=window.getComputedStyle(t).getPropertyValue("--custom-contextmenu");if(n=n?n.trim():"",n){e.preventDefault();let r=window.getComputedStyle(t).getPropertyValue("--custom-contextmenu-data");G(n,e.clientX,e.clientY,r);return}F(e)}function F(e){if(D())return;let t=e.target;switch(window.getComputedStyle(t).getPropertyValue("--default-contextmenu").trim()){case"show":return;case"hide":e.preventDefault();return;default:if(t.isContentEditable)return;let o=window.getSelection(),l=o.toString().length>0;if(l)for(let a=0;a<o.rangeCount;a++){let i=o.getRangeAt(a).getClientRects();for(let s=0;s<i.length;s++){let m=i[s];if(document.elementFromPoint(m.left,m.top)===t)return}}if((t.tagName==="INPUT"||t.tagName==="TEXTAREA")&&(l||!t.readOnly&&!t.disabled))return;e.preventDefault()}}var R={};C(R,{GetFlag:()=>g});function g(e){try{return window._wails.flags[e]}catch(t){throw new Error("Unable to retrieve flag '"+e+"': "+t)}}var w=!1,A=!1,b=null,z="auto";window._wails=window._wails||{};window._wails.setResizable=function(e){A=e};window._wails.endDrag=function(){document.body.style.cursor="default",w=!1};window.addEventListener("mousedown",Q);window.addEventListener("mousemove",$);window.addEventListener("mouseup",Z);function K(e){let t=window.getComputedStyle(e.target).getPropertyValue("--wails-draggable"),n=e.buttons!==void 0?e.buttons:e.which;return!t||t===""||t.trim()!=="drag"||n===0?!1:e.detail===1}function Q(e){if(b){c("resize:"+b),e.preventDefault();return}if(K(e)){if(e.offsetX>e.target.clientWidth||e.offsetY>e.target.clientHeight)return;w=!0}else w=!1}function Z(){w=!1}function u(e){document.documentElement.style.cursor=e||z,b=e}function $(e){if(w&&(w=!1,(e.buttons!==void 0?e.buttons:e.which)>0)){c("drag");return}if(!A||!v())return;z==null&&(z=document.documentElement.style.cursor);let t=g("system.resizeHandleHeight")||5,n=g("system.resizeHandleWidth")||5,r=g("resizeCornerExtra")||10,o=window.outerWidth-e.clientX<n,l=e.clientX<n,a=e.clientY<t,d=window.outerHeight-e.clientY<t,i=window.outerWidth-e.clientX<n+r,s=e.clientX<n+r,m=e.clientY<t+r,E=window.outerHeight-e.clientY<t+r;!l&&!o&&!a&&!d&&b!==void 0?u():i&&E?u("se-resize"):s&&E?u("sw-resize"):s&&m?u("nw-resize"):m&&i?u("ne-resize"):l?u("w-resize"):a?u("n-resize"):d?u("s-resize"):o&&u("e-resize")}var I={};C(I,{ByID:()=>ae,ByName:()=>le,Call:()=>oe,Plugin:()=>se});window._wails=window._wails||{};window._wails.callResultHandler=re;window._wails.callErrorHandler=ie;var M=0,ee=h(p.Call,""),te=h(p.CancelCall,""),x=new Map;function ne(){let e;do e=y();while(x.has(e));return e}function re(e,t,n){let r=H(e);r&&r.resolve(n?JSON.parse(t):t)}function ie(e,t){let n=H(e);n&&n.reject(t)}function H(e){let t=x.get(e);return x.delete(e),t}function _(e,t={}){let n=ne(),r=()=>te(e,{"call-id":n}),o=!1,l=!1,a=new Promise((d,i)=>{t["call-id"]=n,x.set(n,{resolve:d,reject:i}),ee(e,t).then(s=>{if(l=!0,o)return r()}).catch(s=>{i(s),x.delete(n)})});return a.cancel=()=>{if(l)return r();o=!0},a}function oe(e){return _(M,e)}function le(e,...t){return _(M,{methodName:e,args:t})}function ae(e,...t){return _(M,{methodID:e,args:t})}function se(e,t,...n){return _(M,{packageName:"wails-plugins",structName:e,methodName:t,args:n})}var S={};C(S,{Any:()=>f,Array:()=>de,ByteSlice:()=>ue,Map:()=>fe,Nullable:()=>ce,Struct:()=>we});function f(e){return e}function ue(e){return e??""}function de(e){return e===f?t=>t===null?[]:t:t=>{if(t===null)return[];for(let n=0;n<t.length;n++)t[n]=e(t[n]);return t}}function fe(e,t){return t===f?n=>n===null?{}:n:n=>{if(n===null)return{};for(let r in n)n[r]=t(n[r]);return n}}function ce(e){return e===f?f:t=>t===null?null:e(t)}function we(e){let t=!0;for(let n in e)if(e[n]!==f){t=!1;break}return t?f:n=>{for(let r in e)r in n&&(n[r]=e[r](n[r]));return n}}window._wails=window._wails||{};"dispatchWailsEvent"in window._wails||(window._wails.dispatchWailsEvent=function(){});window._wails.invoke=c;c("wails:runtime:ready");export{I as Call,S as Create,R as Flags,P as System};