/* spore page — spore drift, parallax forest floor, live scan demo, scroll-driven species morph.
   Everything pauses when off-screen or when the tab is hidden; reduced motion gets static frames. */
(() => {
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (window.lucide) lucide.createIcons();

/* ---------- nav + reveals ---------- */
const nav = document.getElementById('snav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .18 });
document.querySelectorAll('[data-reveal],.hstep').forEach(el => io.observe(el));

/* card spotlight */
document.querySelectorAll('.fcard').forEach(c => c.addEventListener('pointermove', e => {
  const b = c.getBoundingClientRect();
  c.style.setProperty('--mx', ((e.clientX - b.left) / b.width * 100).toFixed(1) + '%');
  c.style.setProperty('--my', ((e.clientY - b.top) / b.height * 100).toFixed(1) + '%');
}, { passive: true }));

/* ---------- parametric mushroom (port of the app's MushroomMorph) ---------- */
const SHAPES = {
  porcini:    { n: 'porcini',        sci: 'Boletus edulis',          cw: 78,  ch: 62,  p: 2.2,  f: 0,   wav: 0,   sh: 90,  ud: 10, sw1: 26, sw2: 29, bulb: 15, spots: 0, ring: 0, um: 0,  vo: 0,   net: 0 },
  flyagaric:  { n: 'fly agaric',     sci: 'Amanita muscaria',        cw: 88,  ch: 36,  p: 2.6,  f: 0,   wav: 0,   sh: 116, ud: 6,  sw1: 12, sw2: 16, bulb: 8,  spots: 1, ring: 1, um: 0,  vo: .5,  net: 0 },
  chanterelle:{ n: 'chanterelle',    sci: 'Cantharellus cibarius',   cw: 72,  ch: 20,  p: 3,    f: .9,  wav: 4,   sh: 72,  ud: 52, sw1: 15, sw2: 11, bulb: 0,  spots: 0, ring: 0, um: 0,  vo: 0,   net: 0 },
  morel:      { n: 'morel',          sci: 'Morchella esculenta',     cw: 40,  ch: 100, p: 1.35, f: 0,   wav: 0,   sh: 55,  ud: 3,  sw1: 22, sw2: 25, bulb: 3,  spots: 0, ring: 0, um: 0,  vo: 0,   net: 1 },
  parasol:    { n: 'parasol',        sci: 'Macrolepiota procera',    cw: 100, ch: 30,  p: 1.5,  f: 0,   wav: 0,   sh: 132, ud: 5,  sw1: 8,  sw2: 11, bulb: 7,  spots: 0, ring: 1, um: 10, vo: 0,   net: 0 },
  inkcap:     { n: 'shaggy ink cap', sci: 'Coprinus comatus',        cw: 36,  ch: 108, p: 1.9,  f: 0,   wav: 0,   sh: 62,  ud: 2,  sw1: 10, sw2: 12, bulb: 0,  spots: 0, ring: 0, um: 0,  vo: 0,   net: 0 },
  deathcap:   { n: 'death cap',      sci: 'Amanita phalloides',      cw: 70,  ch: 30,  p: 2.3,  f: 0,   wav: 0,   sh: 110, ud: 5,  sw1: 11, sw2: 13, bulb: 4,  spots: 0, ring: 1, um: 0,  vo: 1,   net: 0 },
  shiitake:   { n: 'shiitake',       sci: 'Lentinula edodes',        cw: 80,  ch: 34,  p: 2.4,  f: 0,   wav: 1.5, sh: 60,  ud: 8,  sw1: 11, sw2: 9,  bulb: 0,  spots: 0, ring: 0, um: 0,  vo: 0,   net: 0 },
  witchhat:   { n: "witch's hat",    sci: 'Hygrocybe conica',        cw: 46,  ch: 70,  p: 1.1,  f: 0,   wav: 0,   sh: 100, ud: 3,  sw1: 8,  sw2: 9,  bulb: 0,  spots: 0, ring: 0, um: 0,  vo: 0,   net: 0 },
};
const KEYS = ['cw','ch','p','f','wav','sh','ud','sw1','sw2','bulb','spots','ring','um','vo','net'];
const mix = (a, b, q) => { const o = { n: q > .5 ? b.n : a.n, sci: q > .5 ? b.sci : a.sci }; for (const k of KEYS) o[k] = a[k] + (b[k] - a[k]) * q; return o; };
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const f1 = v => v.toFixed(1);

function geometry(P, detail) {
  const cx = 155, gy = 244, y0 = gy - P.sh, rim = y0 - P.ud;
  const lerp = (a, b, t) => a + (b - a) * t;
  const hw = s => lerp(P.sw2, P.sw1, s) + P.bulb * Math.exp(-Math.pow((s - .25) / .28, 2));
  const under = u => [lerp(P.sw1, P.cw, u), y0 - P.ud * (1 - Math.pow(1 - u, 1.8))];
  const top = t => {
    const dome = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(t), P.p)), 1 / P.p);
    return [cx + t * P.cw, rim - P.ch * dome + P.f * P.ch * 1.8 * (1 - t * t) + P.wav * Math.sin(t * Math.PI * 7) * t * t - P.um * Math.exp(-Math.pow(t / .22, 2))];
  };
  const S = 8, U = 6, T = 26, pts = [];
  for (let i = 0; i <= S; i++) { const s = i / S; pts.push([cx - hw(s), gy - s * P.sh]); }
  for (let j = 1; j <= U; j++) { const [x, y] = under(j / U); pts.push([cx - x, y]); }
  for (let k = 1; k < T; k++) pts.push(top(-1 + 2 * k / T));
  for (let j = U; j >= 1; j--) { const [x, y] = under(j / U); pts.push([cx + x, y]); }
  for (let i = S; i >= 0; i--) { const s = i / S; pts.push([cx + hw(s), gy - s * P.sh]); }
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  const g = { body: d + 'Z', groundRx: P.sw2 * 2 + 30 };
  let gills = '';
  for (const m of [.38, .56, .74, .9]) for (const sg of [-1, 1]) {
    const [ux, uy] = under(m);
    gills += `M${f1(cx + sg * ux * .98)} ${f1(uy + 1.5)}L${f1(cx + sg * P.sw1 * .7)} ${f1(y0 + P.f * 18)}`;
  }
  g.gills = gills;
  const cap = top(.5), gl = under(.6);
  g.marks = [[cap[0], cap[1]], [cx - gl[0] * .9, gl[1] + 4], [cx + hw(.1), gy - 8]];
  if (!detail) return g;
  const ry = gy - .78 * P.sh, rw = hw(.78) + 6;
  g.ring = P.ring > .01 ? `M${f1(cx - rw)} ${f1(ry)}Q${cx} ${f1(ry + 10)} ${f1(cx + rw)} ${f1(ry)}` : '';
  g.spots = P.spots > .01 ? [[-.55, 10, 5], [-.15, 7, 6], [.3, 9, 5], [.62, 12, 4], [.05, 22, 4]].map(([t, dy, r]) => {
    const [x, y] = top(t); return `M${f1(x - r)} ${f1(y + dy)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`; }).join('') : '';
  const w0 = hw(0);
  g.volva = P.vo > .01 ? `M${f1(cx - w0 - 9)} ${gy - 20}C${f1(cx - w0 - 14)} ${gy + 5} ${f1(cx + w0 + 14)} ${gy + 5} ${f1(cx + w0 + 9)} ${gy - 20}` : '';
  let net = '';
  if (P.net > .01) {
    for (const lv of [.22, .44, .66]) { const tt = Math.pow(Math.max(0, 1 - Math.pow(lv, P.p)), 1 / P.p) * .92, y = rim - P.ch * lv;
      net += `M${f1(cx - tt * P.cw)} ${f1(y)}Q${cx} ${f1(y + 7)} ${f1(cx + tt * P.cw)} ${f1(y)}`; }
    for (const t0 of [-.5, 0, .5]) net += `M${f1(cx + t0 * P.cw)} ${f1(rim - 2)}Q${f1(cx + t0 * P.cw * 1.15)} ${f1(rim - P.ch * .5)} ${f1(cx + t0 * P.cw * .45)} ${f1(rim - P.ch * .88)}`;
  }
  g.net = net;
  return g;
}

/* run fn every frame only while `el` is on screen and the tab is visible */
function whileVisible(el, fn) {
  let on = false, raf = 0;
  const tick = t => { fn(t); raf = requestAnimationFrame(tick); };
  const set = v => { if (v === on) return; on = v; if (on) raf = requestAnimationFrame(tick); else cancelAnimationFrame(raf); };
  let seen = false;
  new IntersectionObserver(es => { seen = es[0].isIntersecting; set(seen && !document.hidden); }, { rootMargin: '120px' }).observe(el);
  document.addEventListener('visibilitychange', () => set(seen && !document.hidden));
}

/* ---------- spore drift (hero canvas) ---------- */
const hero = document.querySelector('.shero');
const cv = document.getElementById('sporefall');
if (cv && !RM) {
  const ctx = cv.getContext('2d');
  const DPR = Math.min(devicePixelRatio || 1, 2);
  let W = 0, H = 0, mx = -9999, my = -9999;
  const size = () => { W = cv.width = cv.offsetWidth * DPR; H = cv.height = cv.offsetHeight * DPR; };
  size(); addEventListener('resize', size, { passive: true });
  hero.addEventListener('pointermove', e => { const b = cv.getBoundingClientRect(); mx = (e.clientX - b.left) * DPR; my = (e.clientY - b.top) * DPR; }, { passive: true });
  hero.addEventListener('pointerleave', () => { mx = my = -9999; });
  // one pre-rendered glow sprite per colour — drawImage is far cheaper than a gradient per particle
  const sprite = rgb => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, `rgba(${rgb},1)`); r.addColorStop(.25, `rgba(${rgb},.55)`); r.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); return c; };
  const SPR = [sprite('201,255,217'), sprite('155,227,176'), sprite('255,214,120')];
  const N = innerWidth < 700 ? 46 : 90;
  const spawn = (anywhere) => ({ x: Math.random() * W, y: anywhere ? Math.random() * H : H + 20, r: (Math.random() * 2.2 + .8) * DPR,
    vy: (Math.random() * .35 + .12) * DPR, sway: Math.random() * 6.28, sw: Math.random() * .6 + .2, a: Math.random() * .6 + .25,
    s: Math.random() < .12 ? 2 : Math.random() < .5 ? 0 : 1, ox: 0, oy: 0 });
  const ps = Array.from({ length: N }, () => spawn(true));
  whileVisible(hero, () => {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const R = 140 * DPR;
    for (const p of ps) {
      p.sway += .012; p.y -= p.vy; p.x += Math.sin(p.sway) * p.sw * .5;
      const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
      if (d2 < R * R) { const d = Math.sqrt(d2) || 1, k = (1 - d / R) * 2.2 * DPR; p.ox += dx / d * k; p.oy += dy / d * k; }
      p.ox *= .94; p.oy *= .94;
      if (p.y < -20) Object.assign(p, spawn(false));
      const tw = .65 + Math.sin(p.sway * 3) * .35, s = p.r * 6;
      ctx.globalAlpha = p.a * tw;
      ctx.drawImage(SPR[p.s], p.x + p.ox - s / 2, p.y + p.oy - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  });
}

/* ---------- parallax: floor layers + phone ---------- */
const layers = [...document.querySelectorAll('[data-depth]')];
if (!RM && layers.length) {
  let px = 0, py = 0, cx = 0, cy = 0;
  addEventListener('pointermove', e => { px = e.clientX / innerWidth - .5; py = e.clientY / innerHeight - .5; }, { passive: true });
  whileVisible(hero, () => {
    cx += (px - cx) * .06; cy += (py - cy) * .06;
    const sy = Math.min(scrollY, innerHeight);
    for (const el of layers) { const d = +el.dataset.depth;
      el.style.transform = `translate3d(${f1(cx * d * -120)}px,${f1(sy * d + cy * d * -60)}px,0)`; }
  });
}

/* ---------- live scan demo in the phone ---------- */
const scr = document.getElementById('sscreen');
if (scr) {
  const $ = s => scr.querySelector(s);
  const main = $('#oMain'), glow = $('#oGlow'), echo = $('#oEcho'), gills = $('#oGills'), ground = $('#oGround'), cap = $('#sCaption');
  const pins = [...scr.querySelectorAll('.spin')], rows = [...scr.querySelectorAll('.srow')], dots = [...scr.querySelectorAll('.sdots i')];
  const head = $('#sHead'), look = $('.slook'), flash = $('.sflash');
  const CYCLE = ['porcini', 'flyagaric', 'morel', 'parasol', 'shiitake', 'inkcap', 'deathcap', 'witchhat'].map(k => SHAPES[k]);
  const TARGET = SHAPES.chanterelle;
  let phase = 0, t0 = performance.now(), resolveFrom = null, resolveAt = 0, echoShape = CYCLE[0], last = 0, countTimer = 0;
  const COPY = {
    1: ['Getting a good look', 'Checking focus and light'],
    2: ['Reading the details', 'Cap, ridges, stem and base'],
    3: ['Narrowing it down', '4,200 possible species'],
    4: ['Ruling out look-alikes', 'Especially the ones that could harm you'],
    5: ['Golden Chanterelle', 'Cantharellus cibarius'],
  };
  const setHead = p => {
    const [t, s] = COPY[p];
    head.className = 'shead' + (p === 5 ? ' result' : '');
    head.innerHTML = `<h5>${t.split(' ').map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(' ')}</h5><p>${s}</p>`;
  };
  const setPhase = p => {
    phase = p; scr.dataset.p = p;
    dots.forEach((d, i) => { d.className = (i + 1 < p || p === 5) ? 'on' : (i + 1 === p ? 'cur' : ''); });
    rows.forEach((r, i) => { r.classList.toggle('done', p > i + 1 || p === 5); r.classList.toggle('active', p === i + 1); });
    if (p >= 1) setHead(p);
  };
  const drawShape = (P, now) => {
    const g = geometry(P, false);
    main.setAttribute('d', g.body); glow.setAttribute('d', g.body); gills.setAttribute('d', g.gills);
    ground.setAttribute('rx', f1(g.groundRx));
    const dt = Math.min(.1, (now - (last || now)) / 1000); last = now;
    echoShape = mix(echoShape, P, 1 - Math.pow(.93, dt * 60));
    echo.setAttribute('d', geometry(echoShape, false).body);
    const toCard = ([x, y]) => [155 + (x - 155) * 1.14, 244 + (y - 244) * 1.14];
    g.marks.forEach((m, i) => { const [x, y] = toCard(m); pins[i].style.left = (x / 310 * 100).toFixed(2) + '%'; pins[i].style.top = (y / 310 * 100).toFixed(2) + '%'; });
    return P;
  };
  const frame = now => {
    if (phase === 0 || phase === 5 && now - resolveAt > 1600) return;
    let P;
    if (phase >= 5) {
      const q = ease(Math.min(1, (now - resolveAt) / 1000));
      P = mix(resolveFrom, TARGET, q);
    } else {
      const e = (now - t0) / 1000, seg = 1.45, i = Math.floor(e / seg), r = e % seg;
      const q = ease(Math.max(0, Math.min(1, (r - .45) / 1)));
      const a = CYCLE[i % CYCLE.length], b = CYCLE[(i + 1) % CYCLE.length];
      P = mix(a, b, q);
      resolveFrom = P;
      const n = (q > .5 ? b : a).n.toUpperCase();
      const txt = `LIKE ${'AEIOU'.includes(n[0]) ? 'AN' : 'A'} ${n}?`;
      if (cap.textContent !== txt) cap.textContent = txt;
    }
    drawShape(P, now);
  };
  // throttle the morph to ~30 fps: shapes read the same and it halves the work
  let acc = 0;
  whileVisible(scr, now => { if (now - acc >= 32) { acc = now; frame(now); } });

  const wait = ms => new Promise(r => setTimeout(r, ms));
  const tickCount = () => {
    const el = head.querySelector('p'); const start = performance.now();
    clearInterval(countTimer);
    countTimer = setInterval(() => {
      const t = (performance.now() - start) / 1000;
      const n = Math.round(3 + (4200 - 3) * Math.exp(-t / .8));
      if (el) el.textContent = (n <= 4 ? '3 close matches' : n.toLocaleString('en-US') + ' possible species');
      if (n <= 4) clearInterval(countTimer);
    }, 60);
  };
  async function play() {
    for (;;) {
      scr.classList.remove('focus'); look.classList.remove('ruled'); pins.forEach(p => p.classList.remove('on'));
      head.innerHTML = ''; setPhase(0); t0 = performance.now(); echoShape = CYCLE[0]; last = 0;
      await wait(400);  setPhase(1);
      await wait(1100); scr.classList.add('focus'); flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
      await wait(1300); setPhase(2);
      for (const p of pins) { await wait(550); p.classList.add('on'); }
      await wait(1200); setPhase(3); tickCount();
      await wait(2600); setPhase(4);
      await wait(1300); look.classList.add('ruled');
      await wait(1300); resolveAt = performance.now(); setPhase(5);
      await wait(6500);
    }
  }
  if (RM) {
    drawShape(TARGET, 0); setPhase(5);
  } else {
    drawShape(CYCLE[0], performance.now());
    play();
  }
}

/* ---------- scroll-driven species morph ---------- */
const morph = document.getElementById('morph');
if (morph) {
  const steps = [...morph.querySelectorAll('.mstep')];
  const seq = steps.map(s => SHAPES[s.dataset.shape]);
  const el = id => document.getElementById(id);
  const mBody = el('mBody'), mGlow = el('mGlow'), mGills = el('mGills'), mRing = el('mRing'), mSpots = el('mSpots'), mVolva = el('mVolva'), mNet = el('mNet');
  const mName = el('mName'), mSci = el('mSci'), bar = el('mBar');
  const mobile = matchMedia('(max-width:900px)');
  let lastKey = '', target = 0, shown = 0;
  const progress = () => {
    if (mobile.matches) {
      // stacked layout: progress follows whichever step is passing the middle of the screen
      // each step's text sits at the bottom of its block; it becomes active as that text rises into view
      let best = 0; const line = innerHeight * .9;
      steps.forEach((s, i) => { const r = s.getBoundingClientRect(), h = r.height || 1;
        if (r.bottom <= line + h) best = i - 1 + Math.min(1, Math.max(0, (line + h - r.bottom) / h)); });
      return Math.max(0, Math.min(seq.length - 1, best));
    }
    const r = morph.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
    return p * (seq.length - 1);
  };
  const render = v => {
    const i = Math.min(seq.length - 2, Math.floor(v)), q = ease(Math.min(1, Math.max(0, (v - i - .2) / .6)));
    const P = mix(seq[i], seq[i + 1], q), g = geometry(P, true);
    const key = g.body.length + ':' + v.toFixed(3);
    if (key === lastKey) return; lastKey = key;
    mBody.setAttribute('d', g.body); mGlow.setAttribute('d', g.body); mGills.setAttribute('d', g.gills);
    mRing.setAttribute('d', g.ring); mRing.style.opacity = P.ring; mSpots.setAttribute('d', g.spots); mSpots.style.opacity = P.spots * .6;
    mVolva.setAttribute('d', g.volva); mVolva.style.opacity = P.vo; mNet.setAttribute('d', g.net); mNet.style.opacity = P.net * .6;
    const active = Math.round(v);
    steps.forEach((s, k) => s.classList.toggle('on', k === active));
    const S = seq[active];
    if (mName.textContent !== S.n) { mName.textContent = S.n; mSci.textContent = S.sci; }
    bar.style.transform = `scaleX(${(v / (seq.length - 1)).toFixed(3)})`;
  };
  if (RM) { render(0); addEventListener('scroll', () => render(Math.round(progress())), { passive: true }); }
  else whileVisible(morph, () => { target = progress(); shown += (target - shown) * .12; render(shown); });
  render(0);
}
})();
