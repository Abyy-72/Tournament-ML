// ══════════════════════════════════════════════
// bracket.js — State, logika & render bracket
// ══════════════════════════════════════════════

let teams   = DEF_NAMES.map((name,i)=>({name,color:DEF_COLORS[i],seed:i+1,logo:null}));
let matches = [];
let activeR = null, activeI = null;

// ── INIT ──
function initMatches() {
  matches = [];
  const r0 = [];
  for (let i = 0; i < 16; i++) {
    const s1 = BRACKET_SEEDS[i*2];
    const s2 = BRACKET_SEEDS[i*2+1];
    r0.push({ t1: seedIdx(s1), t2: seedIdx(s2), s1:null, s2:null, win:null, lose:null });
  }
  matches.push(r0);
  [8, 4, 2, 1].forEach(n => {
    matches.push(Array.from({length:n}, ()=>({t1:null,t2:null,s1:null,s2:null,win:null,lose:null})));
  });
  matches.push([{t1:null,t2:null,s1:null,s2:null,win:null,lose:null}]);
}

function seedIdx(seed) {
  return teams.findIndex(t => t.seed === seed);
}

// ── PROPAGATE ──
function propagate() {
  for (let r = 0; r <= 3; r++) {
    matches[r].forEach((m, i) => {
      const nm = matches[r+1][Math.floor(i/2)];
      if (i % 2 === 0) nm.t1 = m.win;
      else             nm.t2 = m.win;
    });
  }
  const m3 = matches[5][0];
  m3.t1 = matches[3][0].lose;
  m3.t2 = matches[3][1].lose;
}

// ── CLEAR DOWNSTREAM ──
function clearDown(r, i) {
  if (r <= 3) {
    let ci = i;
    for (let cr = r+1; cr <= 4; cr++) {
      ci = Math.floor(ci/2);
      const nm = matches[cr][ci];
      nm.s1=null; nm.s2=null; nm.win=null; nm.lose=null;
    }
    if (r === 3) {
      const m3 = matches[5][0];
      m3.s1=null; m3.s2=null; m3.win=null; m3.lose=null;
    }
  }
}

// ── LAYOUT ──
function cardTop(r, i) {
  const spm = Math.pow(2, r);
  return HDR_H + i * spm * SLOT_H + (spm - 1) * SLOT_H / 2;
}
function cardLeft(r)      { return r * (CARD_W + COL_GAP); }
function thirdPlaceLeft() { return cardLeft(3); }
function thirdPlaceTop()  { return CANVAS_H + HDR_H + 40; }
function matchNum(r, i)   { return [0,16,24,28,30,31][r] + i + 1; }

// ── RENDER ──
function renderBracket() {
  propagate();
  const canvas = document.getElementById('bcanvas');
  canvas.innerHTML = '';

  const totalH = CANVAS_H + HDR_H + CARD_H + 80;
  const totalW = cardLeft(5) + 155 + 20;
  canvas.style.width  = totalW + 'px';
  canvas.style.height = totalH + 'px';

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','bsvg');
  svg.setAttribute('width', totalW);
  svg.setAttribute('height', totalH);
  canvas.appendChild(svg);

  for (let r = 0; r <= 4; r++) {
    const hdr = el('div','rhdr');
    hdr.style.cssText = `left:${cardLeft(r)}px;top:0`;
    hdr.innerHTML = `${RNAMES[r]}<span class="rfmt">${RFMTS[r]}</span>`;
    canvas.appendChild(hdr);

    matches[r].forEach((m, i) => {
      const card = buildCard(m, r, i, false);
      card.style.cssText = `left:${cardLeft(r)}px;top:${cardTop(r,i)}px`;
      canvas.appendChild(card);
      if (r < 4) drawConnector(svg, r, i);
    });
  }

  // 3rd place
  const tp3 = thirdPlaceTop();
  const tl3 = thirdPlaceLeft();
  const sep = el('div','rhdr bronze-hdr');
  sep.style.cssText = `left:${tl3}px;top:${tp3-28}px;width:auto;white-space:nowrap`;
  sep.innerHTML = `🥉 Perebutan Juara 3<span class="rfmt">Best of 5</span>`;
  canvas.appendChild(sep);

  const m3 = matches[5][0];
  const card3 = buildCard(m3, 5, 0, true);
  card3.style.cssText = `left:${tl3}px;top:${tp3}px`;
  canvas.appendChild(card3);
  drawThirdPlaceConnectors(svg, tp3);

  // Podium champion
  const finalM = matches[4][0];
  const champ  = finalM.win !== null ? teams[finalM.win] : null;
  const third  = m3.win    !== null ? teams[m3.win]    : null;

  const cc = el('div','podium-card champ-card');
  cc.style.cssText = `left:${cardLeft(5)}px;top:${cardTop(4,0)+CARD_H/2-65}px`;
  cc.innerHTML = `${champ&&champ.logo?`<img src="${champ.logo}" style="width:40px;height:40px;object-fit:contain;border-radius:8px;margin-bottom:5px">`:'<div class="pc-crown">🏆</div>'}
    <div class="pc-lbl">Champion</div><div class="pc-name">${champ?h(champ.name):'???'}</div>`;
  canvas.appendChild(cc);

  const bc = el('div','podium-card bronze-card');
  bc.style.cssText = `left:${tl3+CARD_W+COL_GAP}px;top:${tp3+CARD_H/2-55}px`;
  bc.innerHTML = `${third&&third.logo?`<img src="${third.logo}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;margin-bottom:5px">`:'<div class="pc-crown">🥉</div>'}
    <div class="pc-lbl">Juara 3</div><div class="pc-name">${third?h(third.name):'???'}</div>`;
  canvas.appendChild(bc);
}

function buildCard(m, r, i, isBronze) {
  const t1   = m.t1 !== null ? teams[m.t1] : null;
  const t2   = m.t2 !== null ? teams[m.t2] : null;
  const w1   = m.win !== null && m.win === m.t1;
  const w2   = m.win !== null && m.win === m.t2;
  const done = m.s1 !== null;

  const card = el('div','mc'+(done?' done':'')+(isBronze?' bronze-match':''));
  card.addEventListener('click', () => { if(isAdmin) openModal(r, i); });

  if (done) {
    const cb = el('button','clrbtn');
    cb.title = 'Hapus hasil'; cb.textContent = '✕';
    cb.addEventListener('click', e => { e.stopPropagation(); clearResult(r,i); });
    card.appendChild(cb);
  }

  const lbl = el('div','mid-lbl');
  lbl.textContent = isBronze ? 'M32 · 3RD PLACE' : `M${matchNum(r,i)}`;
  card.appendChild(lbl);
  card.appendChild(slotEl(t1, m.s1, w1, w2, isBronze));
  card.appendChild(divEl());
  card.appendChild(slotEl(t2, m.s2, w2, w1, isBronze));
  return card;
}

function slotEl(team, score, isW, isL, isBronze) {
  const color  = team ? team.color : '#475569';
  const name   = team ? h(team.name) : 'TBD';
  const sc     = score !== null ? score : '–';
  const winCls = isBronze ? 'wbr' : 'w';
  const cls    = 'tslot'+(isW?' '+winCls:'')+(isL?' l':'');

  let logoHTML;
  if (team && team.logo) {
    logoHTML = `<div class="tlogo" style="background:#0004;border:1px solid ${color}40;padding:1px">
      <img src="${team.logo}" style="width:100%;height:100%;object-fit:contain;border-radius:50%">
    </div>`;
  } else {
    const init = team ? team.name.split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase() : '?';
    logoHTML = `<div class="tlogo" style="background:${color}20;border:1px solid ${color}50;color:${color}">${init}</div>`;
  }

  const d = el('div', cls);
  d.innerHTML = `${logoHTML}<div class="tn">${name}</div><div class="ts">${sc}</div>`;
  return d;
}

function divEl() { return el('div','tdiv'); }

function drawConnector(svg, r, i) {
  const x1 = cardLeft(r) + CARD_W;
  const y1 = cardTop(r, i) + CARD_H / 2;
  const ni = Math.floor(i / 2);
  const nx = cardLeft(r+1);
  const ny = cardTop(r+1, ni) + CARD_H / 2;
  const mx = x1 + COL_GAP / 2;
  svgPath(svg, `M${x1},${y1} H${mx} V${ny} H${nx}`, '#1e3a5f', 1.5, false);
}

function drawThirdPlaceConnectors(svg, tp3) {
  [0, 1].forEach(i => {
    const sx = cardLeft(3) + CARD_W / 2;
    const sy = cardTop(3, i) + CARD_H;
    const ty = tp3 + CARD_H / 2;
    const tx = thirdPlaceLeft() + (i === 0 ? CARD_W * 0.25 : CARD_W * 0.75);
    svgPath(svg, `M${sx},${sy} V${ty} H${tx}`, '#3d2a0a', 1.5, true);
  });
}

function svgPath(svg, d, stroke, width, dashed) {
  const p = document.createElementNS('http://www.w3.org/2000/svg','path');
  p.setAttribute('d', d);
  p.setAttribute('stroke', stroke);
  p.setAttribute('stroke-width', width);
  p.setAttribute('fill', 'none');
  if (dashed) p.setAttribute('stroke-dasharray', '4 3');
  svg.appendChild(p);
}

// ── SCORE MODAL ──
function openModal(r, i) {
  const m  = matches[r][i];
  const t1 = m.t1 !== null ? teams[m.t1] : null;
  const t2 = m.t2 !== null ? teams[m.t2] : null;
  if (!t1 && !t2) return;

  activeR = r; activeI = i;
  const isBronze = (r === 5);
  const wn = r <= 4 ? RWIN[r] : WIN_3RD;

  const title = document.getElementById('mtitle');
  title.textContent = isBronze ? 'PEREBUTAN JUARA 3' : 'INPUT SKOR';
  title.className   = isBronze ? 'bronze' : '';

  document.getElementById('msub').textContent  = isBronze ? 'Best of 5 · 3rd Place Match' : `${RNAMES[r]} · ${RFMTS[r]}`;
  document.getElementById('mn1').textContent   = t1 ? t1.name : 'TBD';
  document.getElementById('mn2').textContent   = t2 ? t2.name : 'TBD';
  document.getElementById('si1').value         = m.s1 !== null ? m.s1 : 0;
  document.getElementById('si2').value         = m.s2 !== null ? m.s2 : 0;
  document.getElementById('mhint').textContent = `Menang jika skor ≥ ${wn}`;
  document.getElementById('merr').textContent  = '';
  document.getElementById('overlay').classList.add('on');
  document.getElementById('si1').focus();
}

function closeModal() {
  document.getElementById('overlay').classList.remove('on');
  activeR = null; activeI = null;
}

async function submitScore() {
  const m  = matches[activeR][activeI];
  const s1 = Math.max(0, parseInt(document.getElementById('si1').value)||0);
  const s2 = Math.max(0, parseInt(document.getElementById('si2').value)||0);
  const wn = activeR <= 4 ? RWIN[activeR] : WIN_3RD;
  const err = document.getElementById('merr');

  if (s1 > wn || s2 > wn)  { err.textContent='Skor melebihi batas seri'; return; }
  if (s1===wn && s2===wn)   { err.textContent='Tidak bisa keduanya menang'; return; }

  m.s1 = s1; m.s2 = s2;
  m.win = s1 >= wn ? m.t1 : s2 >= wn ? m.t2 : null;
  m.lose = m.win !== null ? (m.win===m.t1 ? m.t2 : m.t1) : null;

  const savedR = activeR, savedI = activeI;
  clearDown(activeR, activeI);
  closeModal();
  renderBracket();
  renderStandings();
  await dbSaveMatch(savedR, savedI);
  toast('Skor tersimpan ✓','ok');
}

async function clearResult(r, i) {
  const m = matches[r][i];
  m.s1=null; m.s2=null; m.win=null; m.lose=null;
  clearDown(r, i);
  renderBracket(); renderStandings();
  await dbClearMatch(r, i);
  toast('Hasil dihapus','info');
}

// ── UTILS ──
function el(tag, cls) {
  const e = document.createElement(tag);
  if(cls) e.className = cls;
  return e;
}

function h(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
