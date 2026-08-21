const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(window.lucide)lucide.createIcons();
/* nav state */
const nav=document.getElementById('nav');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>40),{passive:true});
/* reveals */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.18});
document.querySelectorAll('[data-reveal],.step').forEach(el=>io.observe(el));
/* manifesto scrub */
const WORDS='every app that leaves this workshop was tinkered past its breaking point, smithed back stronger, and shipped only when it sparks.'.split(' ');
const HOT=new Set(['tinkered','smithed','sparks.']);
const scrub=document.getElementById('scrub');
scrub.innerHTML=WORDS.map(w=>`<span class="w${HOT.has(w)?' hot':''}">${w}</span>`).join(' ');
const wEls=[...scrub.querySelectorAll('.w')];
/* parallax + scrub loop */
const pxEls=[...document.querySelectorAll('.px')];
let mx=0,my=0;
if(!RM)addEventListener('mousemove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
function loop(){
  if(!RM){const sy=scrollY;pxEls.forEach(el=>{const d=+el.dataset.depth;el.style.transform=`translate3d(${(mx*d*-140).toFixed(1)}px,${(sy*d+my*d*-90).toFixed(1)}px,0)`})}
  const r=scrub.getBoundingClientRect();
  const p=Math.min(1,Math.max(0,(innerHeight*.82-r.top)/(r.height+innerHeight*.28)));
  const n=Math.floor(p*wEls.length);
  wEls.forEach((w,i)=>w.classList.toggle('lit',i<n));
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
/* tilt cards */
if(!RM)document.querySelectorAll('.tilt').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const b=card.getBoundingClientRect(),x=(e.clientX-b.left)/b.width,y=(e.clientY-b.top)/b.height;
    card.style.transform=`perspective(900px) rotateX(${((y-.5)*-7).toFixed(2)}deg) rotateY(${((x-.5)*9).toFixed(2)}deg)`;
    card.style.setProperty('--mx',(x*100).toFixed(1)+'%');card.style.setProperty('--my',(y*100).toFixed(1)+'%');
  });
  card.addEventListener('mouseleave',()=>{card.style.transform='perspective(900px)'});
});
/* card navigation */
document.querySelectorAll('[data-href]').forEach(el=>el.addEventListener('click',e=>{if(!e.target.closest('a,image-slot'))location.href=el.dataset.href}));
/* ember particles */
const cv=document.getElementById('embers'),ctx=cv.getContext('2d');
let W,H,ps=[];
function sz(){W=cv.width=cv.offsetWidth*devicePixelRatio;H=cv.height=cv.offsetHeight*devicePixelRatio}
sz();addEventListener('resize',sz);
function spawn(){return{x:Math.random()*W,y:H+10,r:(Math.random()*2+.8)*devicePixelRatio,vy:(Math.random()*.7+.35)*devicePixelRatio,vx:(Math.random()-.5)*.3*devicePixelRatio,a:Math.random()*.55+.2,f:Math.random()*6.28,hue:Math.random()<.75?'255,110,50':'255,205,90'}}
if(!RM){for(let i=0;i<70;i++){const p=spawn();p.y=Math.random()*H;ps.push(p)}
(function draw(){ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
ps.forEach(p=>{p.y-=p.vy;p.x+=p.vx+Math.sin(p.f+=.02)*.25;const tw=.6+Math.sin(p.f*3)*.4;
if(p.y<-12)Object.assign(p,spawn());
const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);g.addColorStop(0,`rgba(${p.hue},${(p.a*tw).toFixed(2)})`);g.addColorStop(1,`rgba(${p.hue},0)`);
ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*4,0,6.29);ctx.fill()});
requestAnimationFrame(draw)})()}
