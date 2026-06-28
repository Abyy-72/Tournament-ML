// ══════════════════════════════════════════════
// main.js — UI utilities, tabs & boot
// ══════════════════════════════════════════════

// ── TOAST ──
let toastTimer = null;
function toast(msg, type='info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 3000);
}

// ── SYNC STATE ──
function setSyncState(state) {
  const dot = document.getElementById('sync-dot');
  const txt = document.getElementById('sync-txt');
  dot.className = 'sync-dot ' + state;
  txt.textContent = state==='syncing'?'Menyimpan...':state==='synced'?'Tersimpan':'Gagal sync';
}

function hideLoading() {
  document.getElementById('loading-screen').classList.add('hidden');
}

// ── TABS ──
function showTab(name, el_) {
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
  document.getElementById('panel-'+name).classList.add('on');
  el_.classList.add('on');
  if(name==='teams')     renderTeamEditor();
  if(name==='standings') renderStandings();
}

// ── RESET & EXPORT ──
async function resetAll() {
  if(!confirm('Reset semua hasil pertandingan?\nNama tim tetap tersimpan.')) return;
  setSyncState('syncing');
  const { error } = await sb.from('matches').update({
    score1:null, score2:null, winner_id:null, loser_id:null
  }).neq('id', 0);
  if(error){ setSyncState('err'); toast('Gagal reset','err'); return; }
  setSyncState('synced');
  initMatches(); renderBracket(); renderStandings();
  toast('Semua hasil direset ✓','ok');
}

function exportData() {
  const results = [];
  for(let r=0; r<=5; r++){
    matches[r].forEach((m,i)=>{
      if(m.s1===null) return;
      results.push({
        round:  r===5?'3rd Place Match':RNAMES[r],
        match:  r===5?'M32':'M'+(matchNum(r,i)),
        team1:  m.t1!==null?teams[m.t1].name:'TBD',
        team2:  m.t2!==null?teams[m.t2].name:'TBD',
        score:  `${m.s1}-${m.s2}`,
        winner: m.win!==null?teams[m.win].name:null
      });
    });
  }
  const blob = new Blob([JSON.stringify({
    exported: new Date().toISOString(),
    teams: teams.map(t=>({...t, logo: t.logo?'[logo]':null})),
    results
  }, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ml-tournament.json';
  a.click();
}

// ── KEYBOARD SHORTCUTS ──
document.addEventListener('keydown', e => {
  if (activeR === null) return;
  if (e.key === 'Enter')  submitScore();
  if (e.key === 'Escape') closeModal();
});
document.getElementById('overlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.getElementById('login-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeLogin();
});

// ── BOOT ──
async function boot() {
  document.body.classList.add('view-mode');
  try {
    const hasTeams = await dbLoadTeams();
    if (!hasTeams) await dbSeedTeams();
    initMatches();
    await dbLoadMatches();
    renderBracket();
    renderStandings();
    setSyncState('synced');
    hideLoading();
    toast('Data berhasil dimuat ✓','ok');
  } catch(e) {
    console.error(e);
    initMatches();
    renderBracket();
    hideLoading();
    toast('Mode offline — tidak terhubung ke database','err');
    setSyncState('err');
  }
}

boot();
