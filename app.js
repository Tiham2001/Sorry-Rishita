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

// Original ambient music is synthesised in the browser; no external audio file is required.
const musicButton=document.getElementById("music-toggle");
let audioContext=null;
let masterGain=null;
let musicTimer=null;
const progression=[
  [261.63,329.63,392.00,493.88],
  [220.00,261.63,329.63,392.00],
  [174.61,220.00,261.63,329.63],
  [196.00,246.94,293.66,392.00]
];
let chordIndex=0;
function playSoftChord(){
  if(!audioContext || !musicOn || audioContext.state!=="running")return;
  const now=audioContext.currentTime;
  const notes=progression[chordIndex%progression.length];
  notes.forEach((frequency,index)=>{
    const oscillator=audioContext.createOscillator();
    const noteGain=audioContext.createGain();
    oscillator.type=index===0?"triangle":"sine";
    oscillator.frequency.setValueAtTime(frequency,now);
    noteGain.gain.setValueAtTime(0.0001,now);
    noteGain.gain.exponentialRampToValueAtTime(index===0?0.055:0.032,now+0.35);
    noteGain.gain.setValueAtTime(index===0?0.055:0.032,now+2.0);
    noteGain.gain.exponentialRampToValueAtTime(0.0001,now+2.8);
    oscillator.connect(noteGain);
    noteGain.connect(masterGain);
    oscillator.start(now);
    oscillator.stop(now+2.85);
  });
  // A soft arpeggio gives the chords a recognisable musical movement.
  [0,2,1,3].forEach((note,i)=>{
    const start=now+0.45+i*0.42;
    const oscillator=audioContext.createOscillator();
    const noteGain=audioContext.createGain();
    oscillator.type="sine";
    oscillator.frequency.value=notes[note]*2;
    noteGain.gain.setValueAtTime(0.0001,start);
    noteGain.gain.exponentialRampToValueAtTime(0.018,start+0.08);
    noteGain.gain.exponentialRampToValueAtTime(0.0001,start+0.55);
    oscillator.connect(noteGain);
    noteGain.connect(masterGain);
    oscillator.start(start);
    oscillator.stop(start+0.58);
  });
  chordIndex++;
}
async function startMusic(){
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextClass){musicButton.textContent="♫ Audio unavailable";return}
  try{
    audioContext=audioContext||new AudioContextClass();
    if(!masterGain){
      masterGain=audioContext.createGain();
      masterGain.gain.value=0.72;
      masterGain.connect(audioContext.destination);
    }
    if(audioContext.state!=="running")await audioContext.resume();
    if(audioContext.state!=="running")throw new Error("Audio is still suspended");
    musicOn=true;
    chordIndex=0;
    playSoftChord();
    clearInterval(musicTimer);
    musicTimer=setInterval(playSoftChord,2900);
    musicButton.textContent="♫ Music: on";
    musicButton.title="Soft original ambient melody — click to turn off";
  }catch(error){
    musicOn=false;
    musicButton.textContent="♫ Tap to retry music";
  }
}
musicButton.addEventListener("click",()=>{
  if(!musicOn){startMusic();return}
  musicOn=false;
  clearInterval(musicTimer);
  if(masterGain&&audioContext){
    masterGain.gain.cancelScheduledValues(audioContext.currentTime);
    masterGain.gain.setTargetAtTime(0.0001,audioContext.currentTime,0.12);
    setTimeout(()=>{
      if(!musicOn&&audioContext){
        masterGain.gain.setValueAtTime(0.72,audioContext.currentTime);
      }
    },500);
  }
  musicButton.textContent="♫ Music: off";
  musicButton.title="Turn on the original ambient melody";
});
