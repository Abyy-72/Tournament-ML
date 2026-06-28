// ══════════════════════════════════════════════
// auth.js — Sistem PIN admin
// ══════════════════════════════════════════════

let isAdmin = false;

function toggleAdminLogin() {
  if (isAdmin) {
    if (!confirm('Keluar dari mode admin?')) return;
    isAdmin = false;
    document.body.classList.add('view-mode');
    document.getElementById('admin-btn').classList.remove('active');
    document.getElementById('admin-btn').textContent = '🔐';
    // Balik ke bracket kalau lagi di tab teams
    if (document.getElementById('panel-teams').classList.contains('on')) {
      document.querySelectorAll('.panel').forEach(p=>p.classList.remove('on'));
      document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
      document.getElementById('panel-bracket').classList.add('on');
      document.querySelector('.tab').classList.add('on');
    }
    toast('Keluar dari mode admin','info');
  } else {
    document.getElementById('login-overlay').classList.add('on');
    [0,1,2,3].forEach(i => document.getElementById('p'+i).value='');
    document.getElementById('pin-err').textContent = '';
    setTimeout(()=>document.getElementById('p0').focus(), 100);
  }
}

function closeLogin() {
  document.getElementById('login-overlay').classList.remove('on');
}

function pinInput(idx) {
  const val = document.getElementById('p'+idx).value;
  if (val && idx < 3) document.getElementById('p'+(idx+1)).focus();
  const pin = [0,1,2,3].map(i=>document.getElementById('p'+i).value).join('');
  if (pin.length === 4) setTimeout(submitPin, 100);
}

function pinKey(e, idx) {
  if (e.key==='Backspace' && !document.getElementById('p'+idx).value && idx>0)
    document.getElementById('p'+(idx-1)).focus();
  if (e.key==='Enter') submitPin();
}

async function submitPin() {
  const pin = [0,1,2,3].map(i=>document.getElementById('p'+i).value).join('');

  // Hash PIN yang diinput lalu bandingkan dengan hash di config
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2,'0')).join('');

  if (hashHex === ADMIN_PIN_HASH) {
    isAdmin = true;
    document.body.classList.remove('view-mode');
    document.getElementById('admin-btn').classList.add('active');
    document.getElementById('admin-btn').textContent = '✓';
    closeLogin();
    toast('Mode admin aktif ✓','ok');
  } else {
    document.getElementById('pin-err').textContent = 'PIN salah, coba lagi';
    [0,1,2,3].forEach(i=>document.getElementById('p'+i).value='');
    document.getElementById('p0').focus();
    const modal = document.querySelector('.login-modal');
    modal.style.animation = 'none';
    modal.offsetHeight;
    modal.style.animation = 'shake .3s ease';
  }
}
