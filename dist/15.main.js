(window.webpackJsonp=window.webpackJsonp||[]).push([[15],{15:function(e,t){entities.emitter.on("loaded",()=>{["lime","cyan"].forEach((e,t)=>{let n=["left","right"][t],o=document.createElement("div");o.style.height=window.innerHeight+"px",o.style.width="50%",o.style.position="fixed",o.style[n]="0px",o.style["z-index"]=3,o.style.opacity=.2,o.style["background-color"]=e,o.className="teamDiv",o.addEventListener("mouseover",()=>{o.style.opacity=.4}),o.addEventListener("mouseout",()=>{o.style.opacity=.2}),o.addEventListener("click",()=>{Array.from(document.getElementsByClassName("teamDiv")).forEach(e=>document.body.removeChild(e)),entities.emitter.emit("teamChosen"),server.emit("teamChosen",{team:e})}),document.body.prepend(o),server.once("playersInGameData",t=>{let o=t[e],i=document.createElement("div"),d=document.createElement("h1");d.appendChild(document.createTextNode(o)),i.appendChild(d),i.appendChild(document.createTextNode(e+" points")),i.style["text-align"]="center",i.style["font-size"]="0.8em",i.style.width="75px",i.style.position="fixed",i.style.margin="0px",i.style.top="0px",i.style[n]="20px",i.style["z-index"]=5,document.body.prepend(i),server.on("teamWon",t=>{t===e?(i.innerHTML="",i.appendChild(d),d.innerText="WINNER",i.appendChild(document.createTextNode(e+" won!")),setTimeout(()=>{i.innerHTML="",i.appendChild(d),d.innerText=0,i.appendChild(document.createTextNode(e+" team"))},1e4)):d.innerText=0}),server.on("changeTeamPoints",t=>{console.log("here"),t.team===e&&"WIN"!==d.innerText&&(d.innerText=t.change)})})})}),e.exports={}}}]);