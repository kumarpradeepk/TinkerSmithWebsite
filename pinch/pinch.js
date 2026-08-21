const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(window.lucide)lucide.createIcons();
const nav=document.getElementById('pnav');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>40),{passive:true});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.18});
document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
/* parallax floats */
const pxEls=[...document.querySelectorAll('[data-depth]')];
let mx=0,my=0;
if(!RM){addEventListener('mousemove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
(function ploop(){const sy=scrollY;pxEls.forEach(el=>{const d=+el.dataset.depth;el.style.transform=`translate3d(${(mx*d*-160).toFixed(1)}px,${(sy*d+my*d*-100).toFixed(1)}px,0)`});requestAnimationFrame(ploop)})()}
/* budget demo */
const BUDGET=1500,CIRC=351.9;
const foods=[...document.querySelectorAll('.food')];
const ring=document.getElementById('pringfg'),cons=document.getElementById('pcons'),left=document.getElementById('pleft'),
coach=document.getElementById('pcoach'),title=document.getElementById('ptitle'),screen=document.getElementById('pscreen'),
masc=document.getElementById('pmasc'),salt=document.getElementById('pmsalt'),mouth=document.getElementById('pmouth');
const SMILE='M-3.6 8.5 Q0 12 3.6 8.5',FLAT='M-3.4 9.5 L3.4 9.5',OHNO='M-2.3 9.5 A2.3 2.6 0 1 0 2.3 9.5 A2.3 2.6 0 1 0 -2.3 9.5';
const fmt=n=>n.toLocaleString('en-US');
let celebrated=false,wasOver=false;
function update(){
  const total=foods.filter(f=>f.classList.contains('logged')).reduce((s,f)=>s+ +f.dataset.mg,0);
  const remain=BUDGET-total,pct=Math.min(1,total/BUDGET),over=total>BUDGET;
  ring.style.strokeDashoffset=(CIRC*(1-pct)).toFixed(1);
  cons.textContent=fmt(total);
  left.textContent=over?fmt(total-BUDGET)+' mg over':fmt(remain)+' mg left';
  /* pinch rides the arc, fills with salt, reacts */
  const a=(-90+pct*360)*Math.PI/180;
  masc.style.transform=`translate(${(70+56*Math.cos(a)).toFixed(1)}px,${(70+56*Math.sin(a)).toFixed(1)}px)`;
  salt.style.transform=`translateY(${(-23*pct).toFixed(1)}px)`;
  mouth.setAttribute('d',over?OHNO:pct>=.72?FLAT:SMILE);
  screen.classList.toggle('over',over);
  if(over&&!wasOver&&!RM){screen.classList.add('shake');screen.addEventListener('animationend',()=>screen.classList.remove('shake'),{once:true})}
  wasOver=over;
  /* flag what won't fit anymore */
  foods.forEach(f=>f.classList.toggle('nofit',!f.classList.contains('logged')&&+f.dataset.mg>remain));
  /* coach */
  const dayDone=foods.filter(f=>+f.dataset.mg<BUDGET).every(f=>f.classList.contains('logged'));
  if(over){coach.textContent='over budget — salt-free to the finish. the streak’s on the line!';title.textContent='over budget';title.style.color='var(--gold)'}
  else if(dayDone){coach.textContent='day logged with '+fmt(remain)+' mg to spare — streak +1 ✦';title.textContent='under budget ✓';title.style.color='var(--brine-hi)';if(!celebrated){celebrated=true;confetti()}}
  else if(total===0){coach.textContent='1,500 mg to spend today — log the day, i’ll keep count.';title.textContent='today';title.style.color=''}
  else if(pct<.72){coach.textContent='on pace — '+fmt(remain)+' mg still on the table.';title.textContent='today';title.style.color=''}
  else{coach.textContent='getting salty — '+fmt(remain)+' mg left. choose dinner wisely.';title.textContent='today';title.style.color=''}
  if(!dayDone||over)celebrated=false;
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
  const box=document.getElementById('confetti'),cols=['#EAF4FF','#7FB3E8','#4F8DCC','#E5B54B','#F4EFE4'];
  for(let i=0;i<44;i++){const c=document.createElement('span');c.className='conf';
  c.style.left=Math.random()*100+'%';c.style.background=cols[i%cols.length];
  c.style.setProperty('--rot',(Math.random()*720-360).toFixed(0)+'deg');
  c.style.animationDelay=(Math.random()*.5)+'s';box.appendChild(c);setTimeout(()=>c.remove(),2600)}
}
foods.forEach(f=>f.querySelector('.fadd').addEventListener('click',()=>{
  const on=f.classList.toggle('logged');if(on)sparks(f.querySelector('.fadd'));update();
}));
update();
/* ── word salt — crystals snow onto the wordmark, pile up, and pinch shakes them off ── */
const wEm=document.querySelector('.phero-copy h1 em'),wHost=document.querySelector('.phero-copy');
if(!RM&&wEm&&wHost){
const wcv=document.createElement('canvas');wcv.id='wordsalt';wcv.setAttribute('aria-hidden','true');wHost.appendChild(wcv);
const wx=wcv.getContext('2d');
const COLW=2,HEAD=150,FOOT=70,CYCLE=13000,SHAKE_AT=10000,BURST_DELAY=420;
let cw=0,ch=0,surf=null,pile=null,ncols=0,glyphCols=[],grainH=3,fsz=100,active=false;
let grains=[],burst=[],t0=performance.now(),lastT=t0,spawnAcc=0,shakeStart=0,burstDone=true,cycleShaken=-1;
function measure(){
  const er=wEm.getBoundingClientRect(),hr=wHost.getBoundingClientRect();
  if(er.width<10){setTimeout(measure,600);return}
  const cs=getComputedStyle(wEm);
  fsz=parseFloat(cs.fontSize);grainH=Math.max(2,fsz*.032);
  const padX=Math.ceil(fsz*.25);
  cw=Math.ceil(er.width+padX*2);ch=Math.ceil(HEAD+er.height+FOOT);
  const dpr=Math.min(2,devicePixelRatio||1);
  wcv.style.left=(er.left-hr.left-padX)+'px';wcv.style.top=(er.top-hr.top-HEAD)+'px';
  wcv.style.width=cw+'px';wcv.style.height=ch+'px';
  wcv.width=cw*dpr;wcv.height=ch*dpr;wx.setTransform(dpr,0,0,dpr,0,0);
  /* build the letter-top heightmap by rendering the same word offscreen */
  const off=document.createElement('canvas');off.width=cw;off.height=Math.ceil(fsz*2);
  const oc=off.getContext('2d');
  oc.font=cs.fontWeight+' '+fsz+'px '+cs.fontFamily;oc.textBaseline='alphabetic';oc.fillStyle='#fff';
  const text=wEm.textContent,ls=parseFloat(cs.letterSpacing)||0,base=Math.round(fsz*1.2);
  let tot=0;const adv=[];
  for(const chq of text){const w=oc.measureText(chq).width;adv.push(w);tot+=w+ls}
  const scale=er.width/tot;
  oc.setTransform(scale,0,0,1,0,0);
  let lx=padX/scale;
  for(let i=0;i<text.length;i++){oc.fillText(text[i],lx,base);lx+=adv[i]+ls}
  const m=oc.measureText(text);
  const fbA=m.fontBoundingBoxAscent||fsz*.78,fbD=m.fontBoundingBoxDescent||fsz*.22;
  const lh=parseFloat(getComputedStyle(wEm.parentElement).lineHeight)||fsz*.95;
  const domBase=HEAD+(lh-(fbA+fbD))/2+fbA;
  ncols=Math.floor(cw/COLW);
  surf=new Float32Array(ncols).fill(NaN);pile=new Float32Array(ncols);glyphCols=[];
  const img=oc.getImageData(0,0,off.width,off.height).data;
  for(let c=0;c<ncols;c++){
    scan:for(let y=0;y<off.height;y++)for(let x=c*COLW;x<Math.min((c+1)*COLW,off.width);x++)
      if(img[(y*off.width+x)*4+3]>60){surf[c]=domBase+(y-base);glyphCols.push(c);break scan}
  }
  grains=[];burst=[];active=glyphCols.length>0;
}
const solid=c=>c>=0&&c<ncols&&!isNaN(surf[c]);
function shed(c,x){grains.push({x,y:surf[c]-pile[c],vy:40+Math.random()*30,vx:0,f:Math.random()*6.28,r:1+Math.random(),drop:true})}
function relax(c0){
  for(let pass=0;pass<2;pass++)for(let c=Math.max(1,c0-4);c<Math.min(ncols-1,c0+4);c++){
    if(!solid(c)||pile[c]<=0)continue;
    if(pile[c]>30){const q=Math.min(grainH,pile[c]);pile[c]-=q;shed(c,c*COLW+Math.random()*COLW)}
    for(const d of[-1,1]){const n=c+d;
      if(pile[c]<=0)break;
      if(!solid(n)){if(pile[c]>grainH*5){const q=Math.min(grainH,pile[c]);pile[c]-=q;shed(c,(c+d*.6)*COLW)}continue}
      const diff=(surf[c]-pile[c])-(surf[n]-pile[n]);
      if(diff<-grainH*3.2){const q=Math.min(grainH*.6,pile[c],-diff/2);pile[c]-=q;pile[n]+=q}
    }
  }
}
function eject(){
  for(let c=0;c<ncols;c++){
    if(!solid(c)||pile[c]<=0)continue;
    const n=Math.max(1,Math.round(pile[c]/grainH));
    for(let i=0;i<n;i++)burst.push({x:c*COLW+Math.random()*COLW,y:surf[c]-Math.random()*pile[c],
      vx:((c*COLW-cw/2)/cw)*150+(Math.random()-.5)*130,vy:-(60+Math.random()*170),
      a:1,sq:Math.random()<.2,rot:Math.random()*6.28,spin:(Math.random()-.5)*7,r:1+Math.random()*1.1});
    pile[c]=0;
  }
}
function wframe(now){
  requestAnimationFrame(wframe);
  if(!active)return;
  const dt=Math.min(.05,(now-lastT)/1000);lastT=now;
  const el=now-t0,t=el%CYCLE,cyc=Math.floor(el/CYCLE);
  /* snow falls all cycle, pausing only around the shake so the burst reads clearly */
  if(t<SHAKE_AT-600||t>SHAKE_AT+1200){
    const rate=t<1500?10+50*(t/1500):60;
    spawnAcc+=dt*rate;
    while(spawnAcc>1){spawnAcc--;
      const onGlyph=Math.random()<.72&&glyphCols.length;
      const x=onGlyph?glyphCols[Math.random()*glyphCols.length|0]*COLW+Math.random()*COLW:Math.random()*cw;
      grains.push({x,y:-8-Math.random()*40,vy:(46+Math.random()*44)*(.6+fsz/250),vx:0,f:Math.random()*6.28,r:1+Math.random()*.9,gold:Math.random()<.06})
    }
  }
  /* the shake */
  if(t>=SHAKE_AT&&cycleShaken!==cyc){cycleShaken=cyc;shakeStart=now;burstDone=false;
    wEm.classList.add('wither');
    wEm.addEventListener('animationend',e=>{if(e.animationName==='word-wither')wEm.classList.remove('wither')},{once:true})}
  if(!burstDone&&now-shakeStart>=BURST_DELAY){burstDone=true;eject()}
  /* falling grains */
  for(let i=grains.length-1;i>=0;i--){const p=grains[i];
    p.f+=dt*3;p.y+=p.vy*dt;p.x+=Math.sin(p.f)*.22;
    const c=Math.floor(p.x/COLW);
    if(!p.drop&&solid(c)&&p.y>=surf[c]-pile[c]-1){pile[c]+=grainH*(1+Math.random()*.5);relax(c);grains.splice(i,1);continue}
    if(p.y>ch+12)grains.splice(i,1);
  }
  /* burst grains */
  for(let i=burst.length-1;i>=0;i--){const p=burst[i];
    p.vy+=520*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.spin*dt;p.a-=dt*.55;
    if(p.a<=0||p.y>ch+20)burst.splice(i,1);
  }
  /* draw */
  wx.clearRect(0,0,cw,ch);
  for(const p of grains){const tw=.55+Math.sin(p.f*2.6)*.35;
    wx.fillStyle=p.gold?`rgba(255,210,74,${tw})`:`rgba(226,240,255,${tw})`;
    wx.beginPath();wx.arc(p.x,p.y,p.r,0,6.29);wx.fill()}
  wx.fillStyle='rgba(216,232,250,.92)';
  for(let c=0;c<ncols;c++){const p=pile[c];if(!solid(c)||p<=0)continue;
    const sm=(p+(solid(c-1)?pile[c-1]:p)+(solid(c+1)?pile[c+1]:p))/3;
    wx.fillRect(c*COLW,surf[c]-sm,COLW,sm)}
  wx.fillStyle='rgba(255,255,255,.55)';
  for(let c=0;c<ncols;c++){const p=pile[c];if(!solid(c)||p<=1.5)continue;
    const sm=(p+(solid(c-1)?pile[c-1]:p)+(solid(c+1)?pile[c+1]:p))/3;
    wx.fillRect(c*COLW,surf[c]-sm,COLW,1.2)}
  for(const p of burst){
    wx.fillStyle=`rgba(226,240,255,${Math.max(0,p.a).toFixed(2)})`;
    if(p.sq){wx.save();wx.translate(p.x,p.y);wx.rotate(p.rot);wx.fillRect(-1.4,-1.4,2.8,2.8);wx.restore()}
    else{wx.beginPath();wx.arc(p.x,p.y,p.r,0,6.29);wx.fill()}
  }
}
let wrs;addEventListener('resize',()=>{active=false;clearTimeout(wrs);wrs=setTimeout(measure,300)});
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>setTimeout(()=>{measure();t0=performance.now();lastT=t0;requestAnimationFrame(wframe)},1400));
}
/* salt fall */
const cv=document.getElementById('saltfall'),ctx=cv.getContext('2d');
let W,H,ps=[];
function sz(){W=cv.width=cv.offsetWidth*devicePixelRatio;H=cv.height=cv.offsetHeight*devicePixelRatio}
sz();addEventListener('resize',sz);
function spawn(){return{x:Math.random()*W,y:-10,r:(Math.random()*1.7+.7)*devicePixelRatio,vy:(Math.random()*.5+.25)*devicePixelRatio,vx:(Math.random()-.5)*.25*devicePixelRatio,a:Math.random()*.5+.15,f:Math.random()*6.28,hue:Math.random()<.82?'214,235,255':'255,210,74'}}
if(!RM){for(let i=0;i<65;i++){const p=spawn();p.y=Math.random()*H;ps.push(p)}
(function draw(){ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
ps.forEach(p=>{p.y+=p.vy;p.x+=p.vx+Math.sin(p.f+=.015)*.3;const tw=.5+Math.sin(p.f*2.4)*.5;
if(p.y>H+12)Object.assign(p,spawn());
const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4.5);g.addColorStop(0,`rgba(${p.hue},${(p.a*tw).toFixed(2)})`);g.addColorStop(1,`rgba(${p.hue},0)`);
ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*4.5,0,6.29);ctx.fill()});
requestAnimationFrame(draw)})()}
