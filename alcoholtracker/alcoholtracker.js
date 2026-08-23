const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(window.lucide)lucide.createIcons();
const nav=document.getElementById('anav');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>40),{passive:true});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.18});
document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
/* parallax floats */
const pxEls=[...document.querySelectorAll('[data-depth]')];
let mx=0,my=0;
if(!RM){addEventListener('mousemove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
(function ploop(){const sy=scrollY;pxEls.forEach(el=>{const d=+el.dataset.depth;el.style.transform=`translate3d(${(mx*d*-160).toFixed(1)}px,${(sy*d+my*d*-100).toFixed(1)}px,0)`});requestAnimationFrame(ploop)})()}

/* ── the day ──────────────────────────────────────────────────────────
   units = ml × abv% × 0.789 ÷ 1000 — the app's one documented formula,
   printed under every pour so it can be checked on a beer mat.        */
const GOAL=2,CIRC=351.9;
const units=(ml,abv)=>ml*abv*0.789/1000;
const u1=n=>n.toFixed(1);
const drinks=[...document.querySelectorAll('.drink')];
const ring=document.getElementById('aringfg'),count=document.getElementById('acount'),left=document.getElementById('aleft'),
  mirror=document.getElementById('amirror'),working=document.getElementById('aworking'),title=document.getElementById('atitle'),
  screen=document.getElementById('ascreen'),liquid=document.getElementById('aliquid'),streak=document.getElementById('astreak'),
  toast=document.getElementById('atoast'),toastMsg=document.getElementById('atoastmsg'),undoBtn=document.getElementById('aundo'),
  dryBtn=document.getElementById('adry');
let dry=false,lastLogged=null,toastT=null,pourLevel=0,sloshUntil=0;
let repaint=()=>{};

/* every pour is priced against what's left, so the row can flag itself */
drinks.forEach(d=>{d._u=units(+d.dataset.ml,+d.dataset.abv);d.querySelector('.du').textContent='+'+u1(d._u)+' u'});

function update(){
  const total=drinks.filter(d=>d.classList.contains('logged')).reduce((s,d)=>s+d._u,0);
  const remain=GOAL-total,pct=Math.min(1,total/GOAL),over=total>GOAL,warm=!over&&pct>=.75;
  ring.style.strokeDashoffset=(CIRC*(1-pct)).toFixed(1);
  count.textContent=u1(total);
  liquid.style.height=(Math.min(1,total/GOAL)*100).toFixed(0)+'%';
  pourLevel=Math.min(1.35,total/GOAL);
  screen.classList.toggle('over',over);
  screen.classList.toggle('warm',warm);
  screen.classList.toggle('dry',dry);
  /* colour may judge — the words stay factual (design brief P2) */
  if(dry){
    title.textContent='dry day';left.textContent='banked ✓';
    mirror.textContent='banked on purpose — an empty day proves nothing, this one you marked.';
  }else if(total===0){
    title.textContent='today';left.textContent=u1(GOAL)+' within target';
    mirror.textContent='your full allowance is untouched — or simply not needed today.';
  }else if(over){
    title.textContent='today';left.textContent=u1(total-GOAL)+' past target';
    mirror.textContent=u1(total-GOAL)+' units past today’s target of '+GOAL+'.';
  }else if(remain===0){
    title.textContent='today';left.textContent='right at target';
    mirror.textContent='right at your target — a glass of water next?';
  }else{
    title.textContent='today';left.textContent=u1(remain)+' within target';
    mirror.textContent=u1(remain)+' units left within today’s target.';
  }
  /* flag pours that no longer fit what's left */
  drinks.forEach(d=>d.classList.toggle('nofit',!d.classList.contains('logged')&&d._u>remain+.001));
  streak.textContent=dry?'✦ 4 dry this week':'✦ 3 dry this week';
  if(document.hidden||RM)repaint();
}
function showWorking(d){
  working.textContent=`${d.dataset.ml} ml × ${d.dataset.abv}% × 0.789 ÷ 1000 = ${u1(d._u)} units`;
  working.classList.add('lit');
  setTimeout(()=>working.classList.remove('lit'),1600);
}
function showToast(msg,undoable){
  clearTimeout(toastT);
  toastMsg.textContent=msg;
  undoBtn.style.display=undoable?'':'none';
  toast.classList.remove('show');void toast.offsetWidth;toast.classList.add('show');
  toastT=setTimeout(()=>toast.classList.remove('show'),5000);
}
function sparks(btn){
  if(RM)return;
  for(let i=0;i<10;i++){const s=document.createElement('span');s.className='spark-bit';
    const a=Math.random()*6.28,r=22+Math.random()*26;
    s.style.setProperty('--bx',(Math.cos(a)*r).toFixed(0)+'px');s.style.setProperty('--by',(Math.sin(a)*r).toFixed(0)+'px');
    s.style.left='11px';s.style.top='11px';btn.appendChild(s);setTimeout(()=>s.remove(),750)}
}
function fizz(){
  if(RM)return;
  const box=document.getElementById('fizzbox');
  for(let i=0;i<26;i++){const f=document.createElement('span');
    f.className='fizz'+(i%3?'':' tide');
    f.style.left=(8+Math.random()*84)+'%';
    f.style.setProperty('--fx',((Math.random()-.5)*40).toFixed(0)+'px');
    f.style.animationDelay=(Math.random()*.6)+'s';
    const sc=(.5+Math.random()*.9).toFixed(2);f.style.width=f.style.height=(7*sc)+'px';
    box.appendChild(f);setTimeout(()=>f.remove(),2500)}
}
drinks.forEach(d=>d.querySelector('.dadd').addEventListener('click',()=>{
  const on=d.classList.toggle('logged');
  if(on){
    if(dry){dry=false}            /* a logged pour un-banks the day — data wins */
    sparks(d.querySelector('.dadd'));showWorking(d);
    lastLogged=d;sloshUntil=performance.now()+900;
    showToast(d.querySelector('.dtxt b').textContent+' logged, '+u1(d._u)+' u.',true);
  }else{lastLogged=null;toast.classList.remove('show')}
  update();
}));
undoBtn.addEventListener('click',()=>{
  if(lastLogged){lastLogged.classList.remove('logged');lastLogged=null;update()}
  toast.classList.remove('show');
});
dryBtn.addEventListener('click',()=>{
  if(drinks.some(d=>d.classList.contains('logged'))){
    showToast('this day already has drinks logged.',false);return;
  }
  dry=!dry;update();
  if(dry){fizz();showToast('dry day banked — quiet wins count double.',false);
    streak.classList.add('pop');streak.addEventListener('animationend',()=>streak.classList.remove('pop'),{once:true})}
});
update();

/* ── the pour — liquid rises inside the hero wordmark as the day fills ──
   the word is rendered offscreen as an alpha mask; the liquid (wave surface,
   gradient, bubbles) is drawn full-bleed then clipped to the glyphs.      */
const wEm=document.getElementById('pourword'),wHost=document.querySelector('.ahero-copy');
if(!RM&&wEm&&wHost){
  const cv=document.createElement('canvas');cv.id='wordpour-cv';cv.setAttribute('aria-hidden','true');wHost.appendChild(cv);
  const cx=cv.getContext('2d');
  const mask=document.createElement('canvas'),mk=mask.getContext('2d');
  let cw=0,ch=0,dpr=1,ready=false,bub=[],t0=performance.now(),shown=0;
  let lastL=0,lastT=0,lastW=0,lastH=0,tick=0,lastFrame=performance.now();
  function measure(){
    const er=wEm.getBoundingClientRect(),hr=wHost.getBoundingClientRect();
    if(er.width<10){setTimeout(measure,500);return}
    const cs=getComputedStyle(wEm);
    const pad=Math.ceil(parseFloat(cs.fontSize)*.18);
    cw=Math.ceil(er.width+pad*2);ch=Math.ceil(er.height+pad*2);
    dpr=Math.min(2,devicePixelRatio||1);
    cv.style.left=(er.left-hr.left-pad)+'px';cv.style.top=(er.top-hr.top-pad)+'px';
    cv.style.width=cw+'px';cv.style.height=ch+'px';
    cv.width=mask.width=cw*dpr;cv.height=mask.height=ch*dpr;
    cx.setTransform(dpr,0,0,dpr,0,0);mk.setTransform(dpr,0,0,dpr,0,0);
    /* the mask: the same word, same metrics, landing exactly on the DOM text.
       the baseline comes from font metrics inside the line box — eyeballing it
       from the ink box puts the liquid below the glyphs. */
    mk.clearRect(0,0,cw,ch);
    const fsz=parseFloat(cs.fontSize);
    mk.font=cs.fontWeight+' '+fsz+'px '+cs.fontFamily;
    mk.textBaseline='alphabetic';mk.fillStyle='#fff';
    const ls=cs.letterSpacing;
    if('letterSpacing' in mk && ls && ls!=='normal') mk.letterSpacing=ls;
    const text=wEm.textContent;
    const m=mk.measureText(text);
    const fbA=m.fontBoundingBoxAscent||fsz*.78, fbD=m.fontBoundingBoxDescent||fsz*.22;
    const baseline=pad+(er.height-(fbA+fbD))/2+fbA;
    let wid=m.width||er.width;
    if(!('letterSpacing' in mk) && ls && ls!=='normal') wid+=parseFloat(ls)*(text.length-1);
    mk.save();mk.translate(pad,0);mk.scale(er.width/Math.max(1,wid),1);
    mk.fillText(text,0,baseline);
    mk.restore();
    bub=[];for(let i=0;i<26;i++)bub.push({x:Math.random()*cw,y:Math.random()*ch,r:.9+Math.random()*2.1,v:14+Math.random()*26,f:Math.random()*6.28});
    lastL=er.left-hr.left-pad;lastT=er.top-hr.top-pad;lastW=er.width;lastH=er.height;
    ready=true;
  }
  /* the headline animates in, fonts swap, the viewport reflows — rather than
     trust one measurement, check cheaply each frame and re-pin if the word
     moved. only a size change costs a full mask re-render. */
  function reconcile(){
    const er=wEm.getBoundingClientRect(),hr=wHost.getBoundingClientRect();
    if(er.width<10)return;
    if(Math.abs(er.width-lastW)>.5||Math.abs(er.height-lastH)>.5){measure();return}
    const pad=Math.ceil(parseFloat(getComputedStyle(wEm).fontSize)*.18);
    const L=er.left-hr.left-pad,T=er.top-hr.top-pad;
    if(Math.abs(L-lastL)>.5||Math.abs(T-lastT)>.5){
      cv.style.left=L+'px';cv.style.top=T+'px';lastL=L;lastT=T;
    }
  }
  function frame(now){
    requestAnimationFrame(frame);
    if(!ready)return;
    if((tick++ & 3)===0)reconcile();
    /* time-based, not per-frame: a 120 Hz display must not pour twice as fast */
    const dt=Math.min(.05,(now-lastFrame)/1000);lastFrame=now;
    shown+=(pourLevel-shown)*(1-Math.pow(.001,dt));
    draw(now);
  }
  function draw(now){
    if(!ready)return;
    const t=(now-t0)/1000;
    const slosh=now<sloshUntil?(sloshUntil-now)/900:0;
    const surface=ch-(shown*ch*.94)-ch*.03;
    cx.clearRect(0,0,cw,ch);
    if(shown>.004){
      /* body */
      const g=cx.createLinearGradient(0,surface,0,ch);
      const over=pourLevel>1.001,warm=!over&&pourLevel>=.75;
      const top=over?'rgba(232,130,104,.95)':warm?'rgba(240,180,94,.92)':'rgba(107,193,232,.92)';
      const bot=over?'rgba(180,80,60,.98)':warm?'rgba(190,130,50,.95)':'rgba(30,110,160,.98)';
      g.addColorStop(0,top);g.addColorStop(1,bot);
      cx.fillStyle=g;
      cx.beginPath();cx.moveTo(0,ch);cx.lineTo(0,surface);
      /* two summed sine waves — a real surface, tilting when a pour lands */
      const amp=2.2+slosh*7,tilt=slosh*10;
      for(let x=0;x<=cw;x+=4){
        const y=surface+Math.sin(x*.026+t*2.1)*amp+Math.sin(x*.011-t*1.35)*amp*.6+(x/cw-.5)*tilt;
        cx.lineTo(x,y);
      }
      cx.lineTo(cw,ch);cx.closePath();cx.fill();
      /* bright meniscus */
      cx.strokeStyle=over?'rgba(255,190,170,.85)':warm?'rgba(255,225,170,.85)':'rgba(190,235,255,.85)';
      cx.lineWidth=1.6;cx.beginPath();
      for(let x=0;x<=cw;x+=4){
        const y=surface+Math.sin(x*.026+t*2.1)*amp+Math.sin(x*.011-t*1.35)*amp*.6+(x/cw-.5)*tilt;
        x?cx.lineTo(x,y):cx.moveTo(x,y);
      }
      cx.stroke();
      /* bubbles inside the liquid only */
      cx.fillStyle='rgba(255,255,255,.5)';
      for(const b of bub){
        b.y-=b.v*.016;b.f+=.03;
        if(b.y<surface-4){b.y=ch+Math.random()*20;b.x=Math.random()*cw}
        if(b.y>surface){cx.beginPath();cx.arc(b.x+Math.sin(b.f)*1.6,b.y,b.r,0,6.29);cx.fill()}
      }
    }
    /* clip everything to the glyphs */
    cx.globalCompositeOperation='destination-in';
    cx.drawImage(mask,0,0,cw,ch);
    cx.globalCompositeOperation='source-over';
  }
  /* rAF is paused in a background tab and skipped under reduced motion, so the
     pour is also painted on demand — the word always matches the phone. */
  repaint=()=>{reconcile();shown=pourLevel;draw(performance.now())};
  addEventListener('visibilitychange',()=>{if(!document.hidden)repaint()});
  /* a reflow can move the word without a window resize — stacking at mobile
     widths, a font swapping in, the copy wrapping differently. re-pin on any
     of it rather than waiting for the next animation frame. */
  if(window.ResizeObserver){
    const ro=new ResizeObserver(()=>{if(ready)reconcile()});
    ro.observe(wHost);ro.observe(document.documentElement);
  }
  let rt;addEventListener('resize',()=>{ready=false;clearTimeout(rt);rt=setTimeout(measure,280)});
  /* measure only once the hero's entrance animation has settled — the `rise`
     keyframe translates the headline 26px, and measuring mid-flight pins the
     canvas to a position the text then moves away from. */
  function settled(){
    const els=[wEm,wEm.closest('h1')].filter(Boolean);
    const anims=els.flatMap(el=>el.getAnimations?el.getAnimations():[])
      .filter(a=>{try{return a.effect.getComputedTiming().iterations!==Infinity}catch(e){return false}});
    return Promise.race([
      Promise.allSettled(anims.map(a=>a.finished)),
      new Promise(r=>setTimeout(r,2500))
    ]);
  }
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve())
    .then(settled)
    .then(()=>{
      measure();t0=performance.now();lastFrame=t0;repaint();requestAnimationFrame(frame);
      setTimeout(measure,1200);   /* belt and braces once everything is static */
    });
}

/* ── ambient: still water, bubbles drifting up through the dark ── */
const amb=document.getElementById('stillwater'),ax=amb.getContext('2d');
let W,H,ps=[];
function sz(){W=amb.width=amb.offsetWidth*devicePixelRatio;H=amb.height=amb.offsetHeight*devicePixelRatio}
sz();addEventListener('resize',sz);
function spawn(){return{x:Math.random()*W,y:H+10,r:(Math.random()*1.8+.6)*devicePixelRatio,vy:(Math.random()*.45+.2)*devicePixelRatio,vx:(Math.random()-.5)*.22*devicePixelRatio,a:Math.random()*.45+.14,f:Math.random()*6.28,hue:Math.random()<.84?'120,200,240':'127,212,154'}}
if(!RM){for(let i=0;i<58;i++){const p=spawn();p.y=Math.random()*H;ps.push(p)}
(function draw(){ax.clearRect(0,0,W,H);ax.globalCompositeOperation='lighter';
ps.forEach(p=>{p.y-=p.vy;p.x+=p.vx+Math.sin(p.f+=.014)*.28;const tw=.5+Math.sin(p.f*2.3)*.5;
if(p.y<-12)Object.assign(p,spawn());
const g=ax.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4.5);g.addColorStop(0,`rgba(${p.hue},${(p.a*tw).toFixed(2)})`);g.addColorStop(1,`rgba(${p.hue},0)`);
ax.fillStyle=g;ax.beginPath();ax.arc(p.x,p.y,p.r*4.5,0,6.29);ax.fill()});
requestAnimationFrame(draw)})()}
