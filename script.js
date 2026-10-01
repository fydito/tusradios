const radios = [
 {nombre:"La 100",frecuencia:"99.9 FM",stream:"https://playerservices.streamtheworld.com/api/livestream-redirect/FM999_56.mp3"},
 {nombre:"Aspen",frecuencia:"102.3 FM",stream:"https://24283.live.streamtheworld.com/ASPENAAC.aac"},
 {nombre:"Rock & Pop",frecuencia:"95.9 FM",stream:"https://27593.live.streamtheworld.com/ROCKANDPOPAAC.aac"},
 {nombre:"Radio Disney",frecuencia:"94.3 FM",stream:"https://playerservices.streamtheworld.com/api/livestream-redirect/DISNEY_ARG_BA_ADP.aac"},
 {nombre:"Mega",frecuencia:"98.3 FM",stream:"https://mega.stweb.tv/mega983/live/playlist.m3u8"},
 {nombre:"Pop Radio",frecuencia:"101.5 FM",stream:"https://popradio.stweb.tv/popradio/live/playlist.m3u8"},
 {nombre:"Los 40",frecuencia:"105.5 FM",stream:"https://frontend.radiohdvivo.com/los40/live"},
 {nombre:"Urbana Play",frecuencia:"104.3 FM",stream:"https://live-ar1.cdnrad.com/hls/radio-285/live.m3u8"},
 {nombre:"Latina",frecuencia:"101.1 FM",stream:"https://stream-gtlc.telecentro.net.ar/hls/latinatvhls/main.m3u8"},
 {nombre:"D Sports",frecuencia:"103.1 FM",stream:"https://playerservices.streamtheworld.com/api/livestream-redirect/DSPORTSRADIOAAC_SC"},
 {nombre:"Blue",frecuencia:"100.7 FM",stream:"https://playerservices.streamtheworld.com/api/livestream-redirect/BLUE_FM_100_7AAC.aac"},
 {nombre:"Vale",frecuencia:"97.5 FM",stream:"https://vale.stweb.tv/vale/live/playlist.m3u8"},
 {nombre:"Nacional Rock",frecuencia:"93.7 FM",stream:"http://sa.mp3.icecast.magma.edge-access.net:7200/sc_rad39"},
 {nombre:"Vorterix",frecuencia:"92.1 FM",stream:"https://ice2.edge-apps.net/radio1_high-20057.audio"},
 {nombre:"Horizonte",frecuencia:"94.3 FM",stream:"https://26313.live.streamtheworld.com/SAM06AAC243_SC"},
 {nombre:"FM Maza",frecuencia:"99.5 FM",stream:"https://streaming01.shockmedia.com.ar/9218/stream"},
 {nombre:"Contemporánea",frecuencia:"98.9 FM",stream:"https://streaming3.locucionar.com/proxy/contemporanea989?mp=/stream"},
 {nombre:"Frecuencia Arena",frecuencia:"98.3 FM",stream:"https://streaming.radiosenlinea.com.ar:10566/;"},
 {nombre:"Contacto",frecuencia:"95.3 FM",stream:"https://sonicpanel.hostradios.com/8144/stream"},
 {nombre:"Radio JARD 🇵🇱",frecuencia:"Białystok",stream:"https://stream4.nadaje.com:8745/jard1"}
];
const vinyls=Array.from({length:10},(_,i)=>`vinilo${i+1}.gif`);
const audio=document.getElementById("audio"),nameEl=document.getElementById("station-name"),freqEl=document.getElementById("frequency"),visual=document.getElementById("visual"),statusEl=document.getElementById("status"),playBtn=document.getElementById("play"),volume=document.getElementById("volume"),muteBtn=document.getElementById("mute"),player=document.querySelector(".player"),selectEl=document.getElementById("station-select");
let index=0,hls=null,wantedToPlay=false,lastVinyl=-1;
function randomVinyl(){let n;do{n=Math.floor(Math.random()*vinyls.length)}while(vinyls.length>1&&n===lastVinyl);lastVinyl=n;visual.src=vinyls[n]}
function renderList(){selectEl.innerHTML=radios.map((r,i)=>`<option value="${i}" ${i===index?'selected':''}>${r.nombre} · ${r.frecuencia}</option>`).join('')}
selectEl.onchange=()=>loadRadio(Number(selectEl.value),true);
function destroyStream(){
 audio.pause();
 audio.removeAttribute("src");
 audio.querySelectorAll("source").forEach(s=>s.remove());
 if(hls){hls.destroy();hls=null}
 audio.load();
}
function setStream(url){
 destroyStream();
 if(url.includes('.m3u8')){
  if(audio.canPlayType('application/vnd.apple.mpegurl')) audio.src=url;
  else if(window.Hls&&Hls.isSupported()){
   hls=new Hls();
   hls.loadSource(url);
   hls.attachMedia(audio);
  }else throw new Error('HLS no soportado');
 }else{
  // Igual que el reproductor oficial de Radio JARD:
  // dejamos src en <audio> y además una fuente interna sin forzar MIME.
  audio.src=url;
  const source=document.createElement("source");
  source.src=url;
  source.type="";
  audio.appendChild(source);
 }
}
function loadRadio(newIndex,autoplay=false){index=(newIndex+radios.length)%radios.length;const r=radios[index];nameEl.textContent=r.nombre;freqEl.textContent=r.frecuencia;randomVinyl();renderList();statusEl.textContent=autoplay?'Conectando…':'Lista para escuchar';playBtn.textContent='▶';wantedToPlay=autoplay;try{setStream(r.stream);notifyParent();if(autoplay)playCurrent()}catch(e){statusEl.textContent='No se pudo preparar esta radio';console.error(e)}}
async function playCurrent(){wantedToPlay=true;statusEl.textContent='Conectando…';randomVinyl();try{await audio.play();playBtn.textContent='❚❚';statusEl.textContent='🔴 EN VIVO'}catch(err){if(hls){hls.once(Hls.Events.MANIFEST_PARSED,async()=>{if(!wantedToPlay)return;try{await audio.play();playBtn.textContent='❚❚';statusEl.textContent='🔴 EN VIVO'}catch(e){statusEl.textContent='No se pudo reproducir'}})}else{statusEl.textContent='No se pudo reproducir';console.error(err)}}}
playBtn.onclick=()=>{if(audio.paused)playCurrent();else{wantedToPlay=false;audio.pause();playBtn.textContent='▶';statusEl.textContent='Pausada'}};
document.getElementById('prev').onclick=()=>loadRadio(index-1,true);document.getElementById('next').onclick=()=>loadRadio(index+1,true);
volume.oninput=()=>{audio.volume=Number(volume.value);audio.muted=false;muteBtn.textContent=audio.volume===0?'🔇':'🔊'};muteBtn.onclick=()=>{audio.muted=!audio.muted;muteBtn.textContent=audio.muted?'🔇':'🔊'};
audio.addEventListener('playing',()=>{playBtn.textContent='❚❚';statusEl.textContent='🔴 EN VIVO'});audio.addEventListener('waiting',()=>statusEl.textContent='Cargando…');audio.addEventListener('error',()=>{playBtn.textContent='▶';statusEl.textContent='⚠️ Esta radio no respondió'});

function notifyParent(){
 const r=radios[index];
 try{parent.postMessage({type:'radio-state',name:r.nombre,frequency:r.frecuencia,playing:!audio.paused&&!audio.ended},location.origin)}catch(e){}
}
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||!e.data||e.data.type!=='radio-command')return;
 if(e.data.command==='prev')loadRadio(index-1,true);
 else if(e.data.command==='next')loadRadio(index+1,true);
 else if(e.data.command==='toggle')playBtn.click();
});
audio.addEventListener('playing',notifyParent);
audio.addEventListener('pause',notifyParent);
audio.volume=Number(volume.value);loadRadio(0,false);notifyParent();
