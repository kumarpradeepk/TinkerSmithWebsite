const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(window.lucide)lucide.createIcons();
const nav=document.getElementById('mnav');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>40),{passive:true});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.18});
document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
/* parallax floats */
const pxEls=[...document.querySelectorAll('[data-depth]')];
let mx=0,my=0;
if(!RM){addEventListener('mousemove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
(function ploop(){const sy=scrollY;pxEls.forEach(el=>{const d=+el.dataset.depth;el.style.transform=`translate3d(${(mx*d*-160).toFixed(1)}px,${(sy*d+my*d*-100).toFixed(1)}px,0)`});requestAnimationFrame(ploop)})()}
/* dose ticking */
const doses=[...document.querySelectorAll('.dose')];
const ring=document.getElementById('ringfg'),pct=document.getElementById('ringpct'),next=document.getElementById('nextup'),title=document.getElementById('mtitle');
const CIRC=326.7;let celebrated=false;
function update(){
  const done=doses.filter(d=>d.classList.contains('done')).length,p=done/doses.length;
  ring.style.strokeDashoffset=(CIRC*(1-p)).toFixed(1);
  pct.textContent=Math.round(p*100)+'%';
  const up=doses.find(d=>!d.classList.contains('done'));
  if(up){next.textContent='next up · '+up.dataset.name;title.textContent='today';title.style.color=''}
  else{next.textContent='all doses logged';title.textContent='day complete ✓';title.style.color='var(--mint)';if(!celebrated){celebrated=true;confetti()}}
  if(done<doses.length)celebrated=false;
}
function sparks(btn){
  if(RM)return;
  for(let i=0;i<10;i++){const s=document.createElement('span');s.className='spark-bit';
  const a=Math.random()*6.28,r=24+Math.random()*26;
  s.style.setProperty('--bx',(Math.cos(a)*r).toFixed(0)+'px');s.style.setProperty('--by',(Math.sin(a)*r).toFixed(0)+'px');
  s.style.left='11px';s.style.top='11px';btn.appendChild(s);setTimeout(()=>s.remove(),750)}
}
function confetti(){
  if(RM)return;
  const box=document.getElementById('confetti'),cols=['#58C48A','#7BE0A8','#FFD24A','#FFB03B','#EFE9DF'];
  for(let i=0;i<44;i++){const c=document.createElement('span');c.className='conf';
  c.style.left=Math.random()*100+'%';c.style.background=cols[i%cols.length];
  c.style.setProperty('--rot',(Math.random()*720-360).toFixed(0)+'deg');
  c.style.animationDelay=(Math.random()*.5)+'s';box.appendChild(c);setTimeout(()=>c.remove(),2600)}
}
doses.forEach(d=>d.querySelector('.dchk').addEventListener('click',()=>{
  const on=d.classList.toggle('done');if(on)sparks(d.querySelector('.dchk'));update();
}));
update();
/* fireflies */
const cv=document.getElementById('fireflies'),ctx=cv.getContext('2d');
let W,H,ps=[];
function sz(){W=cv.width=cv.offsetWidth*devicePixelRatio;H=cv.height=cv.offsetHeight*devicePixelRatio}
sz();addEventListener('resize',sz);
function spawn(){return{x:Math.random()*W,y:Math.random()*H,r:(Math.random()*1.8+.7)*devicePixelRatio,vx:(Math.random()-.5)*.35*devicePixelRatio,vy:(Math.random()-.5)*.3*devicePixelRatio,a:Math.random()*.5+.15,f:Math.random()*6.28,hue:Math.random()<.8?'123,224,168':'255,210,74'}}
if(!RM){for(let i=0;i<55;i++)ps.push(spawn());
(function draw(){ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy+Math.sin(p.f+=.015)*.15;
if(p.x<-20)p.x=W+20;if(p.x>W+20)p.x=-20;if(p.y<-20)p.y=H+20;if(p.y>H+20)p.y=-20;
const tw=.5+Math.sin(p.f*2.4)*.5;
const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*5);g.addColorStop(0,`rgba(${p.hue},${(p.a*tw).toFixed(2)})`);g.addColorStop(1,`rgba(${p.hue},0)`);
ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*5,0,6.29);ctx.fill()});
requestAnimationFrame(draw)})()}
