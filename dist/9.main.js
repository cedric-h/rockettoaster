(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{33:function(e){e.exports={size:210,zoom:25,floorHeight:-35,chunkSize:15,zIndexLowest:0,zIndexHighest:1}},38:function(e,o){e.exports=((e,o)=>{entities.find("client").forEach(i=>entities.getComponent(i,"client").send(e,o))})},9:function(e,o,i){(function(o){"undefined"==typeof window&&i(38);const t=i(33),n=i(34),s=n.vec2;let d=[],p=new n.World({gravity:[0,-3,82]});"undefined"!=typeof window?window.world=p:o.world=p;let a=new n.Body({id:"ground",position:[0,t.floorHeight]});function l(e,o){let i=entities.getComponent(e,"physicsConfig");void 0===i.shapeConfig.collisionMask&&(i.shapeConfig.collisionMask=-1),i.shape=new n[o](JSON.parse(JSON.stringify(i.shapeConfig))),i.body=new n.Body(i.bodyConfig),entities.addComponent(e,"body")}a.addShape(new n.Plane({collisionGroup:Math.pow(2,1),collisionMask:-1})),p.addBody(a),[-1,1].forEach(e=>{let o=new n.Body({angle:Math.PI*(1==e?.5:1.5),position:[t.size/2*e,0],id:(e>0?"right":"left")+"Wall"});o.addShape(new n.Plane({collisionGroup:Math.pow(2,1),collisionMask:-1})),p.addBody(o)}),entities.emitter.on("bodyRemove",e=>{let o=entities.getComponent(e,"body");d.push(o),o.collisionResponse=!1}),entities.emitter.on("bodyCreate",e=>{let o=entities.getComponent(e,"physicsConfig");if(!o)throw new Error("You can't add a body component to an entity without a physicsConfig component.");o.body.addShape(o.shape),o.physical&&(o.body.id=e,p.addBody(o.body)),entities.entities[e].body=o.body}),entities.emitter.on("bodyFromBox",e=>{l(e,"Box")}),entities.emitter.on("bodyFromParticle",e=>{l(e,"Particle")}),entities.emitter.on("physicsConfigAddedFromServer",e=>{let o=entities.getComponent(e,"physicsConfig");entities.emitter.emit("bodyFrom"+(o.shapeType||"Box"),e);let i=entities.getComponent(e,"body");s.copy(i.interpolatedPosition,i.position),i.interpolatedAngle=i.angle}),e.exports={update:(e,o)=>{o>1/60*2&&(o=1/60*2),p.step(1/60,o,10),d=d.filter(e=>(p.removeBody(e),!1))}}}).call(this,i(0))}}]);