const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* rAF chains do not survive a tab freeze/thaw (Chrome drops the pending
   callback), so every loop runs through this: a watchdog re-kicks it. */
function resilientRaf(fn){let id=0;const tick=t=>{id=requestAnimationFrame(tick);fn(t)};
  id=requestAnimationFrame(tick);
  setInterval(()=>{if(!document.hidden){cancelAnimationFrame(id);id=requestAnimationFrame(tick)}},2200);}
if(window.lucide)lucide.createIcons();
const nav=document.getElementById('anav');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>40),{passive:true});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.18});
document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
/* parallax floats */
const pxEls=[...document.querySelectorAll('[data-depth]')];
let mx=0,my=0;
if(!RM){addEventListener('mousemove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
resilientRaf(()=>{const sy=scrollY;pxEls.forEach(el=>{const d=+el.dataset.depth;el.style.transform=`translate3d(${(mx*d*-160).toFixed(1)}px,${(sy*d+my*d*-100).toFixed(1)}px,0)`})})}

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

/* entries — the diary below the card, rebuilt from state each update */
const entriesEl=document.getElementById('aentries'),poursEl=document.getElementById('apours'),
  emptyEl=document.getElementById('aempty'),todayBar=document.getElementById('abartoday');
const ETIMES=['12:40 pm','2:05 pm','5:12 pm','7:48 pm'];
function syncEntries(total){
  const logged=drinks.filter(d=>d.classList.contains('logged'));
  poursEl.textContent=logged.length+(logged.length===1?' pour':' pours');
  emptyEl.style.display=logged.length?'none':'';
  entriesEl.querySelectorAll('.entry').forEach(e=>e.remove());
  logged.forEach((d,i)=>{
    const row=document.createElement('div');row.className='entry';
    const pip=Math.min(96,Math.round(d._u/GOAL*100));
    row.innerHTML='<span class="gpip"><i style="height:'+pip+'%"></i></span><div class="dtxt"><b>'
      +d.querySelector('.dtxt b').textContent+'</b><span>'
      +d.querySelector('.dtxt span').textContent+' · '+ETIMES[i%4]+'</span></div><span class="edu">'
      +u1(d._u)+'<i>drinks</i></span>';
    entriesEl.appendChild(row);
  });
  if(todayBar)todayBar.style.setProperty('--h',Math.min(1,total/GOAL).toFixed(2));
}
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
    title.textContent='today';left.textContent=u1(GOAL)+' drinks left today';
    mirror.textContent='your full allowance is untouched — or simply not needed today.';
  }else if(over){
    title.textContent='today';left.textContent=u1(total-GOAL)+' past target — noted';
    mirror.textContent=u1(total-GOAL)+' units past today’s target of '+GOAL+'.';
  }else if(remain===0){
    title.textContent='today';left.textContent='right at target';
    mirror.textContent='right at your target — a glass of water next?';
  }else{
    title.textContent='today';left.textContent=u1(remain)+' drinks left today';
    mirror.textContent=u1(remain)+' units left within today’s target.';
  }
  /* flag pours that no longer fit what's left */
  drinks.forEach(d=>d.classList.toggle('nofit',!d.classList.contains('logged')&&d._u>remain+.001));
  streak.textContent=dry?'✦ 4 dry this week':'✦ 3 dry this week';
  syncEntries(total);
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
  let wdrips=[],wsplash=[],wrings=[],nextDrip=performance.now()+2600,idleSlosh=0;
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
    idleSlosh*=.95;
    if(now>nextDrip){
      wdrips.push({x:cw*(.1+Math.random()*.8),y:-8,v:0});
      nextDrip=now+3800+Math.random()*3800;
    }
    const surface=ch-(shown*ch*.94)-ch*.03;
    const amp=2.2+slosh*7+idleSlosh*3.2,tilt=slosh*10;
    const surfY=x=>surface+Math.sin(x*.026+t*2.1)*amp+Math.sin(x*.011-t*1.35)*amp*.6+(x/cw-.5)*tilt;
    cx.clearRect(0,0,cw,ch);
    if(shown>.004){
      /* body */
      const g=cx.createLinearGradient(0,surface,0,ch);
      const over=pourLevel>1.001,warm=!over&&pourLevel>=.75;
      const top=over?'rgba(194,53,36,.95)':warm?'rgba(217,154,43,.92)':'rgba(224,100,60,.92)';
      const bot=over?'rgba(180,80,60,.98)':warm?'rgba(190,130,50,.95)':'rgba(150,58,30,.98)';
      g.addColorStop(0,top);g.addColorStop(1,bot);
      cx.fillStyle=g;
      cx.beginPath();cx.moveTo(0,ch);cx.lineTo(0,surface);
      /* two summed sine waves — a real surface, tilting when a pour lands */
      for(let x=0;x<=cw;x+=4){
        const y=surface+Math.sin(x*.026+t*2.1)*amp+Math.sin(x*.011-t*1.35)*amp*.6+(x/cw-.5)*tilt;
        cx.lineTo(x,y);
      }
      cx.lineTo(cw,ch);cx.closePath();cx.fill();
      /* bright meniscus */
      cx.strokeStyle=over?'rgba(255,190,170,.85)':warm?'rgba(255,225,170,.85)':'rgba(255,205,180,.85)';
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
    /* idle drips — a droplet falls through the letterforms every few
       seconds, splashes on the liquid (or the floor of an empty word),
       sloshes the surface, and leaves a ring. */
    wdrips=wdrips.filter(d=>{
      d.v+=.5;d.y+=d.v;
      const land=shown>.004?surfY(d.x):ch-3;
      if(d.y>=land){
        idleSlosh=Math.min(1.6,idleSlosh+1);
        for(let i=0;i<3;i++)wsplash.push({x:d.x,y:land,vx:(Math.random()-.5)*2.4,vy:-(1.2+Math.random()*1.8)});
        wrings.push({x:d.x,y:land,r:1.5,a:.6});
        return false;
      }
      cx.fillStyle='rgba(238,150,110,.95)';
      cx.beginPath();cx.arc(d.x,d.y,2.1,0,6.29);cx.fill();
      cx.beginPath();cx.moveTo(d.x-1.2,d.y-1);cx.quadraticCurveTo(d.x,d.y-6-d.v*2.2,d.x+1.2,d.y-1);cx.closePath();cx.fill();
      return true;
    });
    wsplash=wsplash.filter(s=>{s.vy+=.28;s.x+=s.vx;s.y+=s.vy;
      if(s.y>ch||s.vy>6)return false;
      cx.fillStyle='rgba(255,205,180,.9)';cx.beginPath();cx.arc(s.x,s.y,1.2,0,6.29);cx.fill();return true});
    wrings=wrings.filter(r=>{r.r+=1.1;r.a-=.03;
      if(r.a<=0)return false;
      cx.strokeStyle='rgba(255,215,190,'+r.a.toFixed(2)+')';cx.lineWidth=1.1;
      cx.beginPath();cx.ellipse(r.x,r.y,r.r,r.r*.32,0,0,6.29);cx.stroke();return true});
    /* a glint sliding along the meniscus */
    if(shown>.004){
      const gx=((t*.07)%1)*cw,gy=surfY(gx);
      const gg=cx.createRadialGradient(gx,gy,0,gx,gy,14);
      gg.addColorStop(0,'rgba(255,240,225,.8)');gg.addColorStop(1,'rgba(255,240,225,0)');
      cx.fillStyle=gg;cx.beginPath();cx.arc(gx,gy,14,0,6.29);cx.fill();
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
      measure();t0=performance.now();lastFrame=t0;repaint();resilientRaf(frame);
      setTimeout(measure,1200);   /* belt and braces once everything is static */
    });
}

/* ── ambient: the pour — a live liquid surface across the hero floor.
   a 1-D wave field the page actually feeds: every pour logged on the phone
   lands in it as a splash, the level tracks the day, the tint follows the
   screen's verdict, and the cursor drags ripples across the meniscus.   */
const amb=document.getElementById('stillwater'),ax=amb.getContext('2d');
const heroEl=document.querySelector('.ahero');
let W=0,H=0,DPR=1,N=0,cols=[],vels=[];
function sz(){DPR=Math.min(2,devicePixelRatio||1);W=amb.offsetWidth;H=amb.offsetHeight;
  amb.width=W*DPR;amb.height=H*DPR;ax.setTransform(DPR,0,0,DPR,0,0);
  N=Math.max(90,Math.round(W/9));cols=new Array(N).fill(0);vels=new Array(N).fill(0)}
sz();addEventListener('resize',()=>{sz();if(RM)draw(0)});
let level=0,drops=[],ringsFx=[],bubs=[],lastPourT=0;
const baseY=()=>H*(.875-.075*Math.min(1.2,level));
function poke(x,f){const i=Math.max(1,Math.min(N-2,Math.round(x/W*(N-1))));
  vels[i]+=f;vels[i-1]+=f*.55;vels[i+1]+=f*.55}
function splashAt(x,big){
  poke(x,big?-13:-6);
  for(let i=0,n=big?14:7;i<n;i++)drops.push({x:x+(Math.random()-.5)*16,y:baseY()-2,
    vx:(Math.random()-.5)*(big?3.4:2.2),vy:-(1.8+Math.random()*(big?3.4:2.1)),r:1+Math.random()*2});
  ringsFx.push({x,y:baseY(),r:2,a:.5,w:big?2:1.2});
}
function tint(){
  if(screen.classList.contains('over'))return['194,53,36','120,26,16'];
  if(screen.classList.contains('warm'))return['217,154,43','130,84,18'];
  if(screen.classList.contains('dry'))return['97,138,94','44,72,44'];
  return['224,100,60','130,48,24'];
}
function draw(t){
  ax.clearRect(0,0,W,H);
  const c=tint(),cA=c[0],cB=c[1],by=baseY();
  const Y=i=>by+cols[i]+Math.sin(i*.55+t*1.1)*1.1;
  /* the room borrows the liquid's colour */
  const glow=ax.createLinearGradient(0,by-130,0,by);
  glow.addColorStop(0,'rgba('+cA+',0)');glow.addColorStop(1,'rgba('+cA+',.10)');
  ax.fillStyle=glow;ax.fillRect(0,by-130,W,130);
  /* body */
  const g=ax.createLinearGradient(0,by-14,0,H);
  g.addColorStop(0,'rgba('+cA+',.34)');g.addColorStop(.25,'rgba('+cB+',.30)');g.addColorStop(1,'rgba(10,8,7,.55)');
  ax.beginPath();ax.moveTo(0,H);ax.lineTo(0,Y(0));
  for(let i=1;i<N;i++)ax.lineTo(i/(N-1)*W,Y(i));
  ax.lineTo(W,H);ax.closePath();ax.fillStyle=g;ax.fill();
  /* meniscus + sheen */
  ax.beginPath();ax.moveTo(0,Y(0));for(let i=1;i<N;i++)ax.lineTo(i/(N-1)*W,Y(i));
  ax.strokeStyle='rgba('+cA+',.8)';ax.lineWidth=1.5;ax.stroke();
  ax.beginPath();ax.moveTo(0,Y(0)+5);
  for(let i=1;i<N;i++)ax.lineTo(i/(N-1)*W,Y(i)+5+Math.sin(i*.3+t*2)*1.4);
  ax.strokeStyle='rgba(255,235,225,.13)';ax.lineWidth=1;ax.stroke();
  /* reflection shards + bubbles, additively */
  ax.save();ax.globalCompositeOperation='lighter';
  for(let k=0;k<5;k++){const sx=W*(.14+k*.18)+Math.sin(t*.7+k*2.1)*14;
    const sg=ax.createLinearGradient(0,by,0,by+90+k*12);
    sg.addColorStop(0,'rgba('+cA+',.20)');sg.addColorStop(1,'rgba('+cA+',0)');
    ax.fillStyle=sg;ax.fillRect(sx-1.5+Math.sin(t*3+k)*2,by+3,3,90+k*12)}
  bubs.forEach(b=>{b.y-=b.v*.0016;if(b.y<0)b.y=1;
    const bx=b.x*W+Math.sin(b.f+=.02)*6,byy=by+(H-by)*b.y;
    ax.strokeStyle='rgba('+cA+',.35)';ax.lineWidth=1;
    ax.beginPath();ax.arc(bx,byy,b.r,0,6.29);ax.stroke()});
  ax.restore();
  /* droplets fall back in and re-ring the surface */
  drops=drops.filter(d=>{d.vy+=.16;d.x+=d.vx;d.y+=d.vy;
    if(d.y>=baseY()){poke(d.x,-1.6);return false}
    ax.fillStyle='rgba('+cA+',.85)';ax.beginPath();ax.arc(d.x,d.y,d.r,0,6.29);ax.fill();return true});
  ringsFx=ringsFx.filter(r=>{r.r+=1.6;r.a-=.012;if(r.a<=0)return false;
    ax.strokeStyle='rgba(255,240,230,'+r.a.toFixed(3)+')';ax.lineWidth=r.w;
    ax.beginPath();ax.ellipse(r.x,r.y,r.r,r.r*.26,0,0,6.29);ax.stroke();return true});
}
if(!RM){
  heroEl.addEventListener('pointermove',e=>{const r=amb.getBoundingClientRect();
    const x=e.clientX-r.left,y=e.clientY-r.top;
    if(Math.abs(y-baseY())<70)poke(x,(e.movementX||0)*.06)},{passive:true});
  heroEl.addEventListener('pointerdown',e=>{const r=amb.getBoundingClientRect();
    splashAt(e.clientX-r.left,false)});
  for(let i=0;i<26;i++)bubs.push({x:Math.random(),y:Math.random(),r:.8+Math.random()*1.8,v:9+Math.random()*16,f:Math.random()*6.28});
  let last=performance.now();
  resilientRaf(function ambLoop(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;
    level+=(pourLevel-level)*(1-Math.pow(.02,dt));
    if(now<sloshUntil&&now-lastPourT>90){splashAt(W*.72+Math.sin(now*.02)*10,true);lastPourT=now}
    for(let p=0;p<2;p++){
      for(let i=1;i<N-1;i++)vels[i]+=(cols[i-1]+cols[i+1]-2*cols[i])*.14;
      for(let i=1;i<N-1;i++){vels[i]*=.985;cols[i]+=vels[i]}
      cols[0]=cols[1];cols[N-1]=cols[N-2];
    }
    draw(now/1000);
  });
}else{level=0;draw(0)}

/* ── carbonation — "alcohol" fizzes. nucleation sites along the glyph
   floor stream tiny bubbles that wobble up, brighten, and pop with a
   ring; a logged pour excites the whole word. masked to the letterforms
   with the same trick as the liquid. */
let fizzpaint=()=>{};
{
  const fEm=document.getElementById('fizzword'),fHost=document.querySelector('.ahero-copy');
  if(!RM&&fEm&&fHost){
    const fcv=document.createElement('canvas');fcv.id='fizz-cv';fcv.setAttribute('aria-hidden','true');fHost.appendChild(fcv);
    const fx=fcv.getContext('2d');
    const fmask=document.createElement('canvas'),fmk=fmask.getContext('2d');
    let fcw=0,fch=0,fdpr=1,fready=false,fpad=0;
    let sites=[],fizz=[],fpops=[],fL=0,fT=0,fW=0,fH=0,ftick=0,fLast=performance.now();
    function fmeasure(){
      const er=fEm.getBoundingClientRect(),hr=fHost.getBoundingClientRect();
      if(er.width<10){setTimeout(fmeasure,500);return}
      const cs=getComputedStyle(fEm);
      fpad=Math.ceil(parseFloat(cs.fontSize)*.16);
      fcw=Math.ceil(er.width+fpad*2);fch=Math.ceil(er.height+fpad*2);
      fdpr=Math.min(2,devicePixelRatio||1);
      fcv.style.left=(er.left-hr.left-fpad)+'px';fcv.style.top=(er.top-hr.top-fpad)+'px';
      fcv.style.width=fcw+'px';fcv.style.height=fch+'px';
      fcv.width=fmask.width=fcw*fdpr;fcv.height=fmask.height=fch*fdpr;
      fx.setTransform(fdpr,0,0,fdpr,0,0);fmk.setTransform(fdpr,0,0,fdpr,0,0);
      fmk.clearRect(0,0,fcw,fch);
      const fsz=parseFloat(cs.fontSize);
      fmk.font=cs.fontWeight+' '+fsz+'px '+cs.fontFamily;
      fmk.textBaseline='alphabetic';fmk.fillStyle='#fff';
      const ls=cs.letterSpacing;
      if('letterSpacing' in fmk&&ls&&ls!=='normal')fmk.letterSpacing=ls;
      const text=fEm.textContent,m=fmk.measureText(text);
      const fbA=m.fontBoundingBoxAscent||fsz*.78,fbD=m.fontBoundingBoxDescent||fsz*.22;
      const baseline=fpad+(er.height-(fbA+fbD))/2+fbA;
      let wid=m.width||er.width;
      fmk.save();fmk.translate(fpad,0);fmk.scale(er.width/Math.max(1,wid),1);
      fmk.fillText(text,0,baseline);fmk.restore();
      sites=[];const n=11;
      for(let i=0;i<n;i++)sites.push({x:fpad+((i+.5+(Math.random()-.5)*.6)/n)*(fcw-fpad*2),
        next:performance.now()+Math.random()*900,period:380+Math.random()*750});
      fL=er.left-hr.left-fpad;fT=er.top-hr.top-fpad;fW=er.width;fH=er.height;
      fready=true;
    }
    function freconcile(){
      const er=fEm.getBoundingClientRect(),hr=fHost.getBoundingClientRect();
      if(er.width<10)return;
      if(Math.abs(er.width-fW)>.5||Math.abs(er.height-fH)>.5){fmeasure();return}
      const L=er.left-hr.left-fpad,T=er.top-hr.top-fpad;
      if(Math.abs(L-fL)>.5||Math.abs(T-fT)>.5){fcv.style.left=L+'px';fcv.style.top=T+'px';fL=L;fT=T}
    }
    function fframe(now){
      if(!fready)return;
      if((ftick++&3)===0)freconcile();
      const dt=Math.min(.05,(now-fLast)/1000);fLast=now;
      const excited=now<sloshUntil;
      sites.forEach(s=>{if(now>s.next&&fizz.length<70){
        fizz.push({x:s.x,y:fch-2,r:.7+Math.random()*1.5,w:Math.random()*6.28,
          wf:8+Math.random()*9,wa:.8+Math.random()*1.4,a:0,
          popY:fpad+fch*.06+Math.random()*fch*.38});
        s.next=now+(excited?s.period*.28:s.period)*(.7+Math.random()*.6)}});
      fx.clearRect(0,0,fcw,fch);
      fizz=fizz.filter(b=>{
        b.a=Math.min(1,b.a+dt*3);
        b.w+=b.wf*dt;
        b.y-=(15+b.r*17)*dt*(excited?1.7:1);
        const bx=b.x+Math.sin(b.w)*b.wa;
        if(b.y<=b.popY){fpops.push({x:bx,y:b.y,r:b.r,a:.7});return false}
        const al=(.34+b.r*.16)*b.a;
        fx.strokeStyle='rgba(112,46,24,'+al.toFixed(2)+')';fx.lineWidth=1;
        fx.beginPath();fx.arc(bx,b.y,b.r,0,6.29);fx.stroke();
        fx.fillStyle='rgba(255,255,255,'+(al*.9).toFixed(2)+')';
        fx.beginPath();fx.arc(bx-b.r*.35,b.y-b.r*.35,b.r*.32,0,6.29);fx.fill();
        return true});
      fpops=fpops.filter(p=>{p.r+=dt*26;p.a-=dt*5;
        if(p.a<=0)return false;
        fx.strokeStyle='rgba(112,46,24,'+p.a.toFixed(2)+')';fx.lineWidth=.9;
        fx.beginPath();fx.arc(p.x,p.y,p.r,0,6.29);fx.stroke();return true});
      fx.globalCompositeOperation='destination-in';
      fx.drawImage(fmask,0,0,fcw,fch);
      fx.globalCompositeOperation='source-over';
    }
    fizzpaint=t=>{if(!fready)fmeasure();fframe(t)};
    let frt;addEventListener('resize',()=>{fready=false;clearTimeout(frt);frt=setTimeout(fmeasure,300)});
    document.fonts.ready.then(()=>{setTimeout(()=>{fmeasure();resilientRaf(fframe)},1200)});
  }
}
