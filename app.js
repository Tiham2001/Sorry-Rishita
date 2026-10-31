const PASSCODE = "2523";
const screens = [...document.querySelectorAll(".screen")];
let pin = "";
let heartTimer = null;
let heartProgress = 0;
let musicOn = false;

function showScreen(id) {
  screens.forEach(s => s.classList.toggle("active", s.id === id));
  window.scrollTo({top:0,behavior:"smooth"});
}
document.getElementById("begin").addEventListener("click", () => showScreen("lock"));
function renderPin() {
  document.querySelectorAll("#dots i").forEach((dot,i)=>dot.classList.toggle("filled",i<pin.length));
}
function resetPin(message="") {
  pin=""; renderPin(); document.getElementById("pin-error").textContent=message;
}
document.getElementById("keypad").addEventListener("click", e => {
  const key=e.target.closest("button")?.dataset.key;
  if(!key)return;
  if(key==="clear"){resetPin();return}
  if(key==="back"){pin=pin.slice(0,-1);renderPin();return}
  if(pin.length>=4)return;
  pin+=key;renderPin();
  if(pin.length===4){
    if(pin===PASSCODE){document.getElementById("pin-error").textContent="";setTimeout(()=>showScreen("sorry"),230)}
    else{setTimeout(()=>resetPin("Not quite — try our special number again."),250)}
  }
});
document.querySelectorAll(".next").forEach(btn=>btn.addEventListener("click",()=>showScreen(btn.dataset.next)));
const holdButton=document.getElementById("hold-heart");
const fill=document.getElementById("heart-fill");
const holdLabel=document.getElementById("hold-label");
function updateHeart(){fill.setAttribute("y",String(110-(heartProgress/100)*110))}
function startHold(e){e.preventDefault();if(heartProgress>=100)return;clearInterval(heartTimer);holdLabel.textContent="Holding your little heart…";heartTimer=setInterval(()=>{heartProgress=Math.min(100,heartProgress+2);updateHeart();if(heartProgress===100){clearInterval(heartTimer);holdLabel.textContent="A heart full of hope. ❤️";}},60)}
function stopHold(){clearInterval(heartTimer);if(heartProgress<100)holdLabel.textContent="Whenever you're ready, you can try again ♥"}
holdButton.addEventListener("pointerdown",startHold);
["pointerup","pointerleave","pointercancel"].forEach(ev=>holdButton.addEventListener(ev,stopHold));
document.querySelectorAll(".gift").forEach(g=>g.addEventListener("click",()=>{document.querySelectorAll(".gift").forEach(x=>x.classList.remove("opened"));g.classList.add("opened");document.getElementById("gift-message").textContent=g.dataset.message}));
document.getElementById("replay").addEventListener("click",()=>{resetPin();heartProgress=0;updateHeart();showScreen("welcome")});
const musicButton=document.getElementById("music-toggle");
let audioContext=null;
let musicTimer=null;
let activeVoices=[];
const progression=[
  [261.63,329.63,392.00,493.88],
  [220.00,261.63,329.63,392.00],
  [174.61,220.00,261.63,329.63],
  [196.00,246.94,293.66,392.00]
];
let chordIndex=0;
function playSoftChord(){
  if(!audioContext || !musicOn)return;
  const now=audioContext.currentTime;
  progression[chordIndex%progression.length].forEach((frequency,index)=>{
    const oscillator=audioContext.createOscillator();
    const gain=audioContext.createGain();
    oscillator.type="sine";
    oscillator.frequency.value=frequency;
    gain.gain.setValueAtTime(0.0001,now);
    gain.gain.exponentialRampToValueAtTime(index===0?0.009:0.006,now+0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001,now+3.3);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now+3.35);
    activeVoices.push({oscillator,gain});
  });
  chordIndex++;
  activeVoices=activeVoices.filter(v=>v.oscillator.context.state==="running");
}
musicButton.addEventListener("click",async()=>{
  if(!musicOn){
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextClass){musicButton.textContent="♫ Music unavailable";return}
    audioContext=audioContext||new AudioContextClass();
    if(audioContext.state==="suspended")await audioContext.resume();
    musicOn=true;
    chordIndex=0;
    playSoftChord();
    musicTimer=setInterval(playSoftChord,3100);
    musicButton.textContent="♫ Music: on";
    musicButton.title="Soft original piano-like ambient tones";
  }else{
    musicOn=false;
    clearInterval(musicTimer);
    if(audioContext){
      const now=audioContext.currentTime;
      activeVoices.forEach(v=>{
        try{v.gain.gain.cancelScheduledValues(now);v.gain.gain.setTargetAtTime(0.0001,now,0.08);v.oscillator.stop(now+0.35)}catch(_){}
      });
      activeVoices=[];
    }
    musicButton.textContent="♫ Music: off";
  }
});
