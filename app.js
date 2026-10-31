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
const music=document.getElementById("music");
const musicButton=document.getElementById("music-toggle");
musicButton.addEventListener("click",()=>{
  if(!musicOn){musicButton.textContent="♫ Music: unavailable";musicButton.title="No music track has been added yet.";return}
  musicOn=!musicOn;
  if(musicOn)music.play().catch(()=>{});else music.pause();
  musicButton.textContent=musicOn?"♫ Music: on":"♫ Music: off";
});
