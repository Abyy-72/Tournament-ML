// ══════════════════════════════════════════════
// db.js — Semua fungsi database Supabase
// ══════════════════════════════════════════════

async function dbLoadTeams() {
  const { data, error } = await sb.from('teams').select('*').order('seed');
  if (error) { console.error(error); return false; }
  if (data && data.length === 32) {
    teams = data.map(row => ({
      id:    row.id,
      name:  row.name,
      color: row.color,
      seed:  row.seed,
      logo:  row.logo_url || null
    }));
    return true;
  }
  return false;
}

async function dbSaveTeams() {
  setSyncState('syncing');
  const toUpdate = teams.filter(t => t.id);
  const toInsert = teams.filter(t => !t.id);

  if (toUpdate.length > 0) {
    for (const t of toUpdate) {
      const { error } = await sb.from('teams').update({
        name: t.name, color: t.color, seed: t.seed, logo_url: t.logo || null
      }).eq('id', t.id);
      if (error) { setSyncState('err'); toast('Gagal simpan tim: '+error.message,'err'); return false; }
    }
  }

  if (toInsert.length > 0) {
    const rows = toInsert.map(t => ({
      name: t.name, color: t.color, seed: t.seed, logo_url: t.logo || null
    }));
    const { data, error } = await sb.from('teams').insert(rows).select();
    if (error) { setSyncState('err'); toast('Gagal simpan tim: '+error.message,'err'); return false; }
    if (data) data.forEach((row, i) => { toInsert[i].id = row.id; });
  }

  setSyncState('synced');
  return true;
}

async function dbSeedTeams() {
  setSyncState('syncing');
  const rows = DEF_NAMES.map((name,i) => ({
    name, color: DEF_COLORS[i], seed: i+1, logo_url: null
  }));
  const { data, error } = await sb.from('teams').insert(rows).select();
  if (error) { setSyncState('err'); toast('Gagal init tim: '+error.message,'err'); return false; }
  teams = data.map(row => ({ id:row.id, name:row.name, color:row.color, seed:row.seed, logo:null }));
  setSyncState('synced');
  return true;
}

async function dbLoadMatches() {
  const { data, error } = await sb.from('matches').select('*').order('round').order('position');
  if (error) { console.error(error); return false; }
  if (!data || data.length === 0) return false;

  initMatches();
  data.forEach(row => {
    const r = row.round;
    const i = row.position;
    if (r > 5 || !matches[r] || !matches[r][i]) return;

    const t1idx   = row.team1_id  !== null ? teams.findIndex(t=>t.id===row.team1_id)  : null;
    const t2idx   = row.team2_id  !== null ? teams.findIndex(t=>t.id===row.team2_id)  : null;
    const winIdx  = row.winner_id !== null ? teams.findIndex(t=>t.id===row.winner_id) : null;
    const loseIdx = row.loser_id  !== null ? teams.findIndex(t=>t.id===row.loser_id)  : null;

    matches[r][i] = {
      dbId: row.id,
      t1:   t1idx   >= 0 ? t1idx   : null,
      t2:   t2idx   >= 0 ? t2idx   : null,
      s1:   row.score1 !== null ? row.score1 : null,
      s2:   row.score2 !== null ? row.score2 : null,
      win:  winIdx  >= 0 ? winIdx  : null,
      lose: loseIdx >= 0 ? loseIdx : null,
    };
  });
  return true;
}

async function dbSaveMatch(r, i) {
  const m      = matches[r][i];
  const t1     = m.t1   !== null ? teams[m.t1]   : null;
  const t2     = m.t2   !== null ? teams[m.t2]   : null;
  const winner = m.win  !== null ? teams[m.win]  : null;
  const loser  = m.lose !== null ? teams[m.lose] : null;

  const row = {
    round:     r,
    position:  i,
    team1_id:  t1     ? t1.id     : null,
    team2_id:  t2     ? t2.id     : null,
    score1:    m.s1,
    score2:    m.s2,
    winner_id: winner ? winner.id : null,
    loser_id:  loser  ? loser.id  : null,
  };

  setSyncState('syncing');
  let error;
  if (m.dbId) {
    ({ error } = await sb.from('matches').update(row).eq('id', m.dbId));
  } else {
    const { data, error: e } = await sb.from('matches').insert(row).select().single();
    error = e;
    if (!error && data) matches[r][i].dbId = data.id;
  }

  if (error) { setSyncState('err'); toast('Gagal simpan match: '+error.message,'err'); return false; }
  setSyncState('synced');
  return true;
}

async function dbClearMatch(r, i) {
  const m = matches[r][i];
  if (!m.dbId) return;
  setSyncState('syncing');
  const { error } = await sb.from('matches').update({
    score1:null, score2:null, winner_id:null, loser_id:null
  }).eq('id', m.dbId);
  if (error) { setSyncState('err'); toast('Gagal hapus hasil: '+error.message,'err'); return; }
  setSyncState('synced');
}

async function dbUploadLogo(teamIdx, file) {
  const t    = teams[teamIdx];
  const ext  = file.name.split('.').pop();
  const path = `team-${t.id || teamIdx}.${ext}`;

  setSyncState('syncing');
  const { error: upErr } = await sb.storage.from('team-logos').upload(path, file, { upsert: true });
  if (upErr) { setSyncState('err'); toast('Gagal upload logo: '+upErr.message,'err'); return null; }

  const { data } = sb.storage.from('team-logos').getPublicUrl(path);
  const url = data.publicUrl;

  const { error: dbErr } = await sb.from('teams').update({ logo_url: url }).eq('id', t.id);
  if (dbErr) { setSyncState('err'); toast('Gagal simpan URL logo','err'); return null; }

  setSyncState('synced');
  toast('Logo berhasil diupload ✓', 'ok');
  return url;
}

async function dbRemoveLogo(teamIdx) {
  const t = teams[teamIdx];
  setSyncState('syncing');
  const { error } = await sb.from('teams').update({ logo_url: null }).eq('id', t.id);
  if (error) { setSyncState('err'); toast('Gagal hapus logo','err'); return; }
  setSyncState('synced');
}
