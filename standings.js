// ══════════════════════════════════════════════
// standings.js — Render standings
// ══════════════════════════════════════════════

function renderStandings() {
  const stats = teams.map((t, i) => {
    let w=0, l=0, maxR=-1;
    let isChamp=false, isRunner=false, is3rd=false, isElim=false;

    for(let r=0; r<=5; r++) {
      matches[r].forEach(m => {
        if(m.s1===null) return;
        if(m.t1!==i && m.t2!==i) return;
        const rLabel = (r===5) ? 3 : r;
        maxR = Math.max(maxR, rLabel);
        if(m.win===i) {
          w++;
          if(r===4) isChamp  = true;
          if(r===5) is3rd    = true;
        } else if(m.win!==null) {
          l++;
          if(r===4) isRunner = true;
          else if(r!==3 && r!==5) isElim = true;
          if(r===5) isElim = true;
        }
      });
    }

    const status = isChamp  ? 'champ'
                 : isRunner ? 'runner'
                 : is3rd    ? '3rd'
                 : isElim   ? 'elim'
                 : maxR>=0  ? 'active'
                 : 'wait';

    return {t, i, w, l, maxR, status};
  });

  const ORDER = {champ:0, runner:1, '3rd':2, active:3, wait:4, elim:5};
  stats.sort((a,b) => {
    if(a.status!==b.status) return ORDER[a.status]-ORDER[b.status];
    if(b.maxR!==a.maxR) return b.maxR-a.maxR;
    return a.t.seed-b.t.seed;
  });

  const RSHORT = ['R32','R16','QF','SF','Final'];
  const MEDAL  = {champ:'🥇', runner:'🥈', '3rd':'🥉'};
  const PCLS   = {champ:'p1', runner:'p2', '3rd':'p3'};
  const SCLS   = {champ:'sa', runner:'sa', '3rd':'sa', active:'sa', elim:'se', wait:'sw'};
  const STXT   = {
    champ:'🥇 Champion', runner:'🥈 Runner Up', '3rd':'🥉 Juara 3',
    active:'▶ Aktif', elim:'✕ Gugur', wait:'– Menunggu'
  };

  document.getElementById('stbody').innerHTML = stats.map((s, pos) => {
    const rl    = s.maxR>=0 ? RSHORT[s.maxR] : '–';
    const medal = MEDAL[s.status]
      ? `<span class="pb ${PCLS[s.status]}" style="margin-left:6px">${MEDAL[s.status]}</span>` : '';
    const nb = pos===0?'p1':pos===1?'p2':pos===2?'p3':'';
    return `<tr>
      <td><span class="pb ${nb}">${pos+1}</span></td>
      <td><div style="display:flex;align-items:center;gap:7px">
        <div style="width:8px;height:8px;border-radius:50%;background:${s.t.color};flex-shrink:0"></div>
        <span>${h(s.t.name)}</span>${medal}
      </div></td>
      <td style="color:var(--muted);font-size:11px">${rl}</td>
      <td style="color:var(--win)">${s.w}</td>
      <td style="color:var(--lose)">${s.l}</td>
      <td><span class="sb ${SCLS[s.status]}">${STXT[s.status]}</span></td>
    </tr>`;
  }).join('');
}
