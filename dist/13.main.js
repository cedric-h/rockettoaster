(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{13:function(e,t,n){(function(t){const o=n(34),{chunkSize:i}=n(33);let r={},s=Date.now();entities.emitter.on("loaded",()=>{entities.emitter.on("physicsConfigAddedFromChunkLoader",e=>{t(()=>{if(-1!==entities.find("body").indexOf(e)){let t=entities.getComponent(e,"body");void 0!==t&&(t.shouldTeleport=!0)}})}),entities.emitter.on("physicsConfigUnloadedFromChunk",(e,t)=>{let n=entities.getComponent(t,"body");e.object.bodyConfig.position=n.position,e.object.bodyConfig.angle=n.angle}),server.on("teleport",e=>{let t=entities.find("serverId").filter(t=>entities.getComponent(t,"serverId")===e.serverId)[0];entities.getComponent(t,"body").position=e.to}),entities.emitter.on("bodyCreate",e=>{r[e]={}}),server.on("physics",e=>{s=Date.now(),entities.find("serverId").forEach(t=>{let n=entities.getComponent(t,"serverId");if(e[n]){let o=entities.getComponent(t,"body"),i=r[t];Object.keys(e[n]).forEach(t=>{"position"===t||"angle"===t?i[t]=e[n][t]:o[t]=e[n][t]})}})})}),e.exports={componentTypesAffected:["body","serverId"],searchName:"physicsDataTransmitted",update:(e,t)=>{let n=entities.getComponent(e,"body"),i=r[e];Object.keys(i).forEach(e=>{let r=i[e],a=n[e];n.shouldTeleport?(o.vec2.copy(a,r),n.shouldTeleport=!1):"position"===e&&o.vec2.lerp(a,a,r,t),"angle"===e&&(a=function(e,t,n){return shortest_angle=((t-e)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI,shortest_angle*n}(a,r,(Date.now()-s)/100))})}}}).call(this,n(35).setImmediate)},33:function(e){e.exports={size:210,zoom:25,floorHeight:-35,chunkSize:15,zIndexLowest:0,zIndexHighest:1}},35:function(e,t,n){(function(e){var o=void 0!==e&&e||"undefined"!=typeof self&&self||window,i=Function.prototype.apply;function r(e,t){this._id=e,this._clearFn=t}t.setTimeout=function(){return new r(i.call(setTimeout,o,arguments),clearTimeout)},t.setInterval=function(){return new r(i.call(setInterval,o,arguments),clearInterval)},t.clearTimeout=t.clearInterval=function(e){e&&e.close()},r.prototype.unref=r.prototype.ref=function(){},r.prototype.close=function(){this._clearFn.call(o,this._id)},t.enroll=function(e,t){clearTimeout(e._idleTimeoutId),e._idleTimeout=t},t.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},t._unrefActive=t.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;t>=0&&(e._idleTimeoutId=setTimeout(function(){e._onTimeout&&e._onTimeout()},t))},n(36),t.setImmediate="undefined"!=typeof self&&self.setImmediate||void 0!==e&&e.setImmediate||this&&this.setImmediate,t.clearImmediate="undefined"!=typeof self&&self.clearImmediate||void 0!==e&&e.clearImmediate||this&&this.clearImmediate}).call(this,n(0))},36:function(e,t,n){(function(e,t){!function(e,n){"use strict";if(!e.setImmediate){var o,i=1,r={},s=!1,a=e.document,c=Object.getPrototypeOf&&Object.getPrototypeOf(e);c=c&&c.setTimeout?c:e,"[object process]"==={}.toString.call(e.process)?o=function(e){t.nextTick(function(){l(e)})}:function(){if(e.postMessage&&!e.importScripts){var t=!0,n=e.onmessage;return e.onmessage=function(){t=!1},e.postMessage("","*"),e.onmessage=n,t}}()?function(){var t="setImmediate$"+Math.random()+"$",n=function(n){n.source===e&&"string"==typeof n.data&&0===n.data.indexOf(t)&&l(+n.data.slice(t.length))};e.addEventListener?e.addEventListener("message",n,!1):e.attachEvent("onmessage",n),o=function(n){e.postMessage(t+n,"*")}}():e.MessageChannel?function(){var e=new MessageChannel;e.port1.onmessage=function(e){l(e.data)},o=function(t){e.port2.postMessage(t)}}():a&&"onreadystatechange"in a.createElement("script")?function(){var e=a.documentElement;o=function(t){var n=a.createElement("script");n.onreadystatechange=function(){l(t),n.onreadystatechange=null,e.removeChild(n),n=null},e.appendChild(n)}}():o=function(e){setTimeout(l,0,e)},c.setImmediate=function(e){"function"!=typeof e&&(e=new Function(""+e));for(var t=new Array(arguments.length-1),n=0;n<t.length;n++)t[n]=arguments[n+1];var s={callback:e,args:t};return r[i]=s,o(i),i++},c.clearImmediate=u}function u(e){delete r[e]}function l(e){if(s)setTimeout(l,0,e);else{var t=r[e];if(t){s=!0;try{!function(e){var t=e.callback,o=e.args;switch(o.length){case 0:t();break;case 1:t(o[0]);break;case 2:t(o[0],o[1]);break;case 3:t(o[0],o[1],o[2]);break;default:t.apply(n,o)}}(t)}finally{u(e),s=!1}}}}}("undefined"==typeof self?void 0===e?this:e:self)}).call(this,n(0),n(37))},37:function(e,t){var n,o,i=e.exports={};function r(){throw new Error("setTimeout has not been defined")}function s(){throw new Error("clearTimeout has not been defined")}function a(e){if(n===setTimeout)return setTimeout(e,0);if((n===r||!n)&&setTimeout)return n=setTimeout,setTimeout(e,0);try{return n(e,0)}catch(t){try{return n.call(null,e,0)}catch(t){return n.call(this,e,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:r}catch(e){n=r}try{o="function"==typeof clearTimeout?clearTimeout:s}catch(e){o=s}}();var c,u=[],l=!1,f=-1;function d(){l&&c&&(l=!1,c.length?u=c.concat(u):f=-1,u.length&&m())}function m(){if(!l){var e=a(d);l=!0;for(var t=u.length;t;){for(c=u,u=[];++f<t;)c&&c[f].run();f=-1,t=u.length}c=null,l=!1,function(e){if(o===clearTimeout)return clearTimeout(e);if((o===s||!o)&&clearTimeout)return o=clearTimeout,clearTimeout(e);try{o(e)}catch(t){try{return o.call(null,e)}catch(t){return o.call(this,e)}}}(e)}}function p(e,t){this.fun=e,this.array=t}function h(){}i.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];u.push(new p(e,t)),1!==u.length||l||a(m)},p.prototype.run=function(){this.fun.apply(null,this.array)},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",i.versions={},i.on=h,i.addListener=h,i.once=h,i.off=h,i.removeListener=h,i.removeAllListeners=h,i.emit=h,i.prependListener=h,i.prependOnceListener=h,i.listeners=function(e){return[]},i.binding=function(e){throw new Error("process.binding is not supported")},i.cwd=function(){return"/"},i.chdir=function(e){throw new Error("process.chdir is not supported")},i.umask=function(){return 0}}}]);