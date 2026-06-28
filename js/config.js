// ══════════════════════════════════════════════
// config.js — Konstanta & Supabase init
// ══════════════════════════════════════════════

// Supabase
const SUPABASE_URL = 'https://gjivbsvukpepxpajmvyw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqaXZic3Z1a3BlcHhwYWptdnl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDM5ODYsImV4cCI6MjA5ODA3OTk4Nn0.lBiToMkZnXVj63TthgwlpMsR0tA13urHLlJYVIYaHy8';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Admin PIN — disimpan sebagai SHA-256 hash, bukan plaintext
// Cara generate hash:
// 1. Buka: https://emn178.github.io/online-tools/sha256.html
// 2. Ketik PIN kamu → copy hasilnya ke sini
// Contoh di bawah = hash dari PIN "1234"
const ADMIN_PIN_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';

// Bracket layout
const CARD_W  = 185;
const CARD_H  = 72;
const COL_GAP = 44;
const SLOT_H  = CARD_H + 8;
const HDR_H   = 32;
const CANVAS_H = 16 * SLOT_H;

// Round info
const RNAMES  = ['Round of 32','Round of 16','Quarterfinal','Semifinal','Final'];
const RFMTS   = ['Best of 3','Best of 3','Best of 3','Best of 5','Best of 5'];
const RWIN    = [2, 2, 2, 3, 3];
const WIN_3RD = 3;

// Standard 32-team seeding
const BRACKET_SEEDS = [
   1,32, 16,17,  8,25,  9,24,
   5,28, 12,21,  4,29, 13,20,
   3,30, 14,19,  6,27, 11,22,
   7,26, 10,23,  2,31, 15,18
];

// Default teams
const DEF_NAMES = [
  'ONIC Esports','RRQ Hoshi','Evos Legends','Bigetron Alpha',
  'Aura Fire','Alter Ego','Rebellion Zion','Natus Vincere',
  'Team Liquid','Geek Fam','Blacklist Intl','Echo',
  'RSG Philippines','AP Bren','Smart Omega','Omega Esports',
  'Falcon Esports','True Rippers','Execration','Todak',
  'Team Secret','Fnatic','TNC Predator','NXL Esports',
  'Buriram United','Dewa United','EVOS SG','Incendio Stellar',
  'Team HAQ','Laus Playbook','Amplid','Siren Esports'
];

const DEF_COLORS = [
  '#00d4ff','#7c3aed','#10b981','#f59e0b','#ef4444','#ec4899',
  '#06b6d4','#8b5cf6','#14b8a6','#f97316','#6366f1','#84cc16',
  '#22c55e','#3b82f6','#a855f7','#fb923c','#f43f5e','#2dd4bf',
  '#60a5fa','#c084fc','#34d399','#fbbf24','#818cf8','#4ade80',
  '#38bdf8','#e879f9','#a3e635','#fdba74','#fb7185','#67e8f9',
  '#d8b4fe','#bbf7d0'
];
