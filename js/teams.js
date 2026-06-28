// ══════════════════════════════════════════════
// teams.js — Editor tim & logo
// ══════════════════════════════════════════════

function renderTeamEditor() {
  const g = document.getElementById('tgrid');
  g.innerHTML = '';
  teams.forEach((t, i) => {
    const c = el('div','tecard');
    const logoContent = t.logo
      ? `<img src="${t.logo}" alt="logo">`
      : `<span class="upload-hint">🖼️</span>`;
    const removeBtn = t.logo
      ? `<button class="logo-remove" title="Hapus logo" onclick="event.stopPropagation();removeLogo(${i})">✕</button>`
      : '';
    c.innerHTML = `
      <div class="sbadge">#${t.seed}</div>
      <div class="logo-upload">
        <div class="logo-preview" onclick="document.getElementById('lf${i}').click()" title="Upload logo">
          ${logoContent}
        </div>
        ${removeBtn}
        <input type="file" id="lf${i}" accept="image/*" onchange="uploadLogo(${i},this)">
      </div>
      <div class="cwrap">
        <div class="cdot" id="cd${i}" style="background:${t.color}"
          onclick="document.getElementById('cp${i}').click()" title="Warna tim"></div>
        <input type="color" id="cp${i}" value="${t.color}" oninput="setColor(${i},this.value)">
      </div>
      <input class="ninp" type="text" value="${h(t.name)}"
        oninput="setName(${i},this.value)" placeholder="Nama Tim">`;
    g.appendChild(c);
  });
}

let nameTimer  = null;
let colorTimer = null;

function setName(i, v) {
  teams[i].name = v || `Tim ${i+1}`;
  renderBracket(); renderStandings();
  clearTimeout(nameTimer);
  nameTimer = setTimeout(()=>dbSaveTeams(), 800);
}

function setColor(i, v) {
  teams[i].color = v;
  const d = document.getElementById('cd'+i);
  if(d) d.style.background = v;
  renderBracket();
  clearTimeout(colorTimer);
  colorTimer = setTimeout(()=>dbSaveTeams(), 500);
}

async function uploadLogo(i, input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { toast('Maksimal 2MB','err'); return; }

  // Preview langsung pakai base64
  const reader = new FileReader();
  reader.onload = e => { teams[i].logo = e.target.result; renderTeamEditor(); renderBracket(); };
  reader.readAsDataURL(file);

  // Upload ke Supabase Storage
  const url = await dbUploadLogo(i, file);
  if (url) {
    teams[i].logo = url;
    renderTeamEditor(); renderBracket();
  }
}

async function removeLogo(i) {
  teams[i].logo = null;
  renderTeamEditor(); renderBracket();
  await dbRemoveLogo(i);
}

async function randomSeeds() {
  for(let i=teams.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [teams[i],teams[j]]=[teams[j],teams[i]];
  }
  teams.forEach((t,i)=>t.seed=i+1);
  initMatches();
  renderBracket(); renderTeamEditor(); renderStandings();
  await dbSaveTeams();
  toast('Seeding diacak & tersimpan ✓','ok');
}

async function resetNames() {
  if(!confirm('Reset semua nama, warna & logo ke default?')) return;
  teams.forEach((t,i)=>{ t.name=DEF_NAMES[i]; t.color=DEF_COLORS[i]; t.seed=i+1; t.logo=null; });
  initMatches();
  renderBracket(); renderTeamEditor(); renderStandings();
  await dbSaveTeams();
  toast('Data direset ✓','ok');
}
