(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{13:function(e,t,i){const n=i(32),o=i(34);var a,r,s,l=[];function d(){a.width=window.innerWidth,a.height=window.innerHeight}entities.emitter.on("loaded",()=>{a=document.createElement("canvas"),r=a.getContext("2d"),document.body.append(a),d(),window.addEventListener("resize",d)}),entities.emitter.on("appearanceCreate",e=>{let t=entities.getComponent(e,"appearance").zIndex;l[0===t?"unshift":"push"](e),clearTimeout(s),s=setTimeout(()=>{l=l.sort((e,t)=>entities.getComponent(e,"appearance").zIndex-entities.getComponent(t,"appearance").zIndex)},15)}),entities.emitter.on("appearanceRemove",e=>{l.splice(l.indexOf(e),1)}),e.exports={update:()=>{r.fillStyle=o.sky,r.fillRect(0,0,a.width,a.height);let e=entities.find("cameraFocus")[0];if(void 0!==e){let t=entities.getComponent(e,"body");n.vec2.lerp(camera.position,camera.position,[-t.position[0],-t.position[1]],.05)}r.save(),r.translate(a.width/2,a.height/2),r.scale(35,-35),r.translate(camera.position[0],camera.position[1]),r.fillStyle=o.ground,r.fillRect(-100,0,200,-60),l.forEach(e=>{let t=entities.getComponent(e,"body"),i=entities.getComponent(e,"appearance");r.globalAlpha=void 0!==i.transparency?i.transparency:1,void 0!==t?t.shapes.forEach(e=>{r.fillStyle=i.color,function(e,t){r.save(),r.translate(e.interpolatedPosition[0],e.interpolatedPosition[1]),r.rotate(e.interpolatedAngle),r.fillRect(-t.width/2,-t.height/2,t.width,t.height),r.restore()}(t,e)}):"line"===i.type&&(r.strokeStyle=i.color,r.lineWidth=i.lineWidth,r.beginPath(),r.moveTo(i.coords[0][0],i.coords[0][1]),r.lineTo(i.coords[1][0],i.coords[1][1]),r.stroke())}),r.restore()}}},34:function(e){e.exports={ground:"#594f4f",sky:"#547980",rock:"slategray",tree:"#664b49",bush:"#548065",thickBush:"#496f5d",limeTeam:"#9de0ad",cyanTeam:"#45ada8",redFlower:"#b84f4f",purpleFlower:"purple",blueFlower:"#8ecdd9"}}}]);