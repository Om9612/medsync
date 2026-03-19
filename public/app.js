/* ─────────────────────────────────────────
   MedSync — app.js
   Frontend logic: API calls, UI rendering,
   notifications, alarm checker
   ───────────────────────────────────────── */

// ─── State ───────────────────────────────
let medicines    = [];
let historyLog   = [];
let takenToday   = {};     // { medicineId: [time, time...] }
let editingId    = null;
let selectedEmoji = '💊';
let selectedColor = 'rgba(0,229,255,0.12)';
let histFilter   = 'all';

// ─── Constants ───────────────────────────
const EMOJIS = ['💊','🩺','💉','🫀','🧠','🦷','👁️','🧪','🌡️','💪','🍃','⚕️','🏥','🩹','🔬','🫁'];
const COLORS  = [
  { val:'rgba(0,229,255,0.12)',   border:'rgba(0,229,255,0.35)',   hex:'#00e5ff' },
  { val:'rgba(124,58,237,0.12)',  border:'rgba(124,58,237,0.35)',  hex:'#7c3aed' },
  { val:'rgba(16,185,129,0.12)',  border:'rgba(16,185,129,0.35)',  hex:'#10b981' },
  { val:'rgba(245,158,11,0.12)',  border:'rgba(245,158,11,0.35)',  hex:'#f59e0b' },
  { val:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.35)',   hex:'#ef4444' },
  { val:'rgba(59,130,246,0.12)',  border:'rgba(59,130,246,0.35)',  hex:'#3b82f6' },
  { val:'rgba(236,72,153,0.12)',  border:'rgba(236,72,153,0.35)',  hex:'#ec4899' },
  { val:'rgba(234,179,8,0.12)',   border:'rgba(234,179,8,0.35)',   hex:'#eab308' },
];

// ─── API helpers ──────────────────────────
async function apiFetch(url, options = {}) {
  try {
    const res = await fetch('/api' + url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    return await res.json();
  } catch (err) {
    console.error('API error:', err);
    return { success: false, error: err.message };
  }
}

async function loadMedicines() {
  const r = await apiFetch('/medicines');
  medicines = r.success ? r.data : [];
}

async function loadHistory() {
  const r = await apiFetch('/history');
  historyLog = r.success ? r.data : [];
}

// ─── LocalStorage for takenToday ─────────
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
function loadTakenToday() {
  const raw = localStorage.getItem('ms_taken_' + todayKey());
  takenToday = raw ? JSON.parse(raw) : {};
}
function saveTakenToday() {
  localStorage.setItem('ms_taken_' + todayKey(), JSON.stringify(takenToday));
}

// ─── Clock ───────────────────────────────
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true });
  document.getElementById('dateStr').textContent =
    now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}
setInterval(updateClock, 1000);
updateClock();

// ─── Notifications ────────────────────────
function checkNotifBanner() {
  if (Notification.permission === 'granted')
    document.getElementById('notifBanner').classList.add('hidden');
}
async function requestNotifPermission() {
  const p = await Notification.requestPermission();
  if (p === 'granted') {
    document.getElementById('notifBanner').classList.add('hidden');
    showToast('🔔', 'Notifications enabled', 'You will receive timely medicine reminders.', 'success');
  }
}

// ─── Toast messages ───────────────────────
function showToast(icon, title, msg, type = '') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>
    <button class="toast-close" onclick="removeToast(this.parentElement)">✕</button>`;
  c.appendChild(t);
  setTimeout(() => removeToast(t), 5000);
}
function removeToast(el) {
  if (!el?.parentElement) return;
  el.classList.add('out');
  setTimeout(() => el.remove(), 300);
}

// ─── Tab switching ────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');

  if (tab === 'dashboard') renderDashboard();
  if (tab === 'history')   renderHistory();
  if (tab === 'add' && !editingId) resetForm();
}

// ─── Dashboard rendering ──────────────────
function renderDashboard() {
  const takenCount   = medicines.filter(m => (takenToday[m.id] || []).length >= m.times.length).length;
  const pendingCount = medicines.filter(m => (takenToday[m.id] || []).length  < m.times.length).length;
  const bestStreak   = medicines.reduce((mx, m) => Math.max(mx, m.streak || 0), 0);

  document.getElementById('statTotal').textContent   = medicines.length;
  document.getElementById('statTaken').textContent   = takenCount;
  document.getElementById('statPending').textContent = pendingCount;
  document.getElementById('statStreak').textContent  = bestStreak;
  document.getElementById('totalBadge').textContent  = medicines.length + ' total';

  const grid = document.getElementById('medGrid');

  if (medicines.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💊</div>
        <div class="empty-title">No medicines yet</div>
        <div class="empty-sub">Click <strong>Add Medicine</strong> to start tracking your daily doses.</div>
      </div>`;
    return;
  }

  const now     = new Date();
  const curMins = now.getHours() * 60 + now.getMinutes();

  grid.innerHTML = medicines.map(m => {
    const taken    = takenToday[m.id] || [];
    const allTaken = taken.length >= m.times.length;
    const colorObj = COLORS.find(c => c.val === m.color) || COLORS[0];

    const timesHtml = m.times.map(t => {
      const [hh, mm] = t.split(':').map(Number);
      const isNext   = !allTaken && (hh * 60 + mm) > curMins;
      const wasTaken = taken.includes(t);
      return `<div class="time-chip ${isNext ? 'next' : ''}">
        <div class="dot ${wasTaken ? 'green' : ''}"></div>
        ${fmt12(t)}${wasTaken ? ' ✓' : ''}
      </div>`;
    }).join('') || '<span style="font-size:0.8rem;color:var(--muted)">No times set</span>';

    return `
      <div class="med-card" style="border-color:${allTaken ? 'rgba(16,185,129,0.35)' : colorObj.border}">
        <div class="med-card-header">
          <div class="med-header-left">
            <div class="med-icon" style="background:${m.color};border:1px solid ${colorObj.border}">${m.emoji}</div>
            <div>
              <div class="med-name">${esc(m.name)}</div>
              <div class="med-dosage">${esc(m.dosage)}${m.notes ? ' · ' + esc(m.notes.slice(0,30)) : ''}</div>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn-icon edit" title="Edit"   onclick="editMedicine('${m.id}')">✏️</button>
            <button class="btn-icon"      title="Delete" onclick="deleteMedicine('${m.id}')">🗑️</button>
          </div>
        </div>
        <div class="med-times">${timesHtml}</div>
        <div class="med-card-footer">
          <div class="streak">🔥 Streak: <span>${m.streak || 0} days</span></div>
          <button class="btn-take" ${allTaken ? 'disabled' : ''} onclick="markTaken('${m.id}')">
            ${allTaken ? '✓ All Taken' : '✓ Mark Taken'}
          </button>
        </div>
      </div>`;
  }).join('');
}

// ─── Format time 12h ─────────────────────
function fmt12(t) {
  const [h, m] = t.split(':').map(Number);
  const ampm   = h >= 12 ? 'PM' : 'AM';
  const h12    = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
}

// ─── Escape HTML ─────────────────────────
function esc(s) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(s || ''));
  return d.innerHTML;
}

// ─── Mark dose taken ─────────────────────
async function markTaken(id) {
  const med = medicines.find(m => m.id === id);
  if (!med) return;

  if (!takenToday[id]) takenToday[id] = [];

  const now       = new Date();
  const nowTime   = now.toTimeString().slice(0, 5);
  const nextSlot  = med.times.find(t => !takenToday[id].includes(t)) || nowTime;

  // Call backend
  const r = await apiFetch(`/medicines/${id}/take`, {
    method: 'POST',
    body: JSON.stringify({ scheduledTime: nextSlot }),
  });

  if (!r.success) {
    showToast('❌', 'Error', r.error || 'Could not record dose.', 'warn');
    return;
  }

  takenToday[id].push(nextSlot);
  saveTakenToday();

  // Update streak locally
  const idx = medicines.findIndex(m => m.id === id);
  if (idx !== -1) medicines[idx].streak = (medicines[idx].streak || 0) + 1;

  renderDashboard();
  showToast(med.emoji, 'Dose recorded!', `${med.name} marked taken at ${fmt12(nextSlot)}.`, 'success');

  // Browser notification
  if (Notification.permission === 'granted')
    new Notification('✅ MedSync — Dose Recorded', { body: `${med.name} (${med.dosage}) taken at ${fmt12(nextSlot)}` });
}

// ─── Delete medicine ─────────────────────
async function deleteMedicine(id) {
  if (!confirm('Delete this medicine?')) return;
  const r = await apiFetch('/medicines/' + id, { method: 'DELETE' });
  if (r.success) {
    medicines = medicines.filter(m => m.id !== id);
    delete takenToday[id];
    saveTakenToday();
    renderDashboard();
    showToast('🗑️', 'Deleted', 'Medicine removed.');
  }
}

// ─── Form helpers ─────────────────────────
function buildEmojiPicker() {
  document.getElementById('emojiPicker').innerHTML = EMOJIS.map(e =>
    `<div class="emoji-opt ${e === selectedEmoji ? 'selected' : ''}"
       onclick="selectEmoji(this,'${e}')">${e}</div>`
  ).join('');
}

function buildColorPicker() {
  document.getElementById('colorPicker').innerHTML = COLORS.map(c =>
    `<div class="color-opt ${c.val === selectedColor ? 'selected' : ''}"
       style="background:${c.hex}"
       onclick="selectColor(this,'${c.val}')"></div>`
  ).join('');
}

function selectEmoji(el, e) {
  document.querySelectorAll('.emoji-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedEmoji = e;
}
function selectColor(el, v) {
  document.querySelectorAll('.color-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedColor = v;
}

function addTimeSlot(val = '') {
  const div  = document.createElement('div');
  div.className = 'time-entry';
  div.innerHTML = `
    <input type="time" class="form-input" value="${val}"/>
    <button class="btn-remove-time" onclick="this.parentElement.remove()">✕</button>`;
  document.getElementById('timesList').appendChild(div);
}

function resetForm() {
  editingId = null;
  document.getElementById('formTitle').innerHTML = 'Add <span>New Medicine</span>';
  document.getElementById('medName').value    = '';
  document.getElementById('medDosage').value  = '';
  document.getElementById('medNotes').value   = '';
  document.getElementById('timesList').innerHTML = '';
  selectedEmoji = '💊';
  selectedColor = COLORS[0].val;
  addTimeSlot('08:00');
  buildEmojiPicker();
  buildColorPicker();
}

// ─── Edit medicine ────────────────────────
function editMedicine(id) {
  const med = medicines.find(m => m.id === id);
  if (!med) return;
  editingId = id;
  document.getElementById('medName').value   = med.name;
  document.getElementById('medDosage').value = med.dosage;
  document.getElementById('medNotes').value  = med.notes || '';
  document.getElementById('timesList').innerHTML = '';
  med.times.forEach(t => addTimeSlot(t));
  selectedEmoji = med.emoji;
  selectedColor = med.color;
  buildEmojiPicker();
  buildColorPicker();
  document.getElementById('formTitle').innerHTML = 'Edit <span>Medicine</span>';
  switchTab('add');
}

// ─── Save medicine ────────────────────────
async function saveMedicine() {
  const name   = document.getElementById('medName').value.trim();
  const dosage = document.getElementById('medDosage').value.trim();
  const notes  = document.getElementById('medNotes').value.trim();
  const times  = [...document.querySelectorAll('#timesList input[type=time]')]
              .map(i => i.value).filter(Boolean);

  if (!name)         { showToast('⚠️','Name required','Enter a medicine name.','warn'); return; }
  if (!dosage)       { showToast('⚠️','Dosage required','Enter the dosage.','warn'); return; }
  if (!times.length) { showToast('⚠️','Time required','Add at least one reminder time.','warn'); return; }

  const payload = { name, dosage, notes, times, emoji: selectedEmoji, color: selectedColor };

  let r;
  if (editingId) {
    r = await apiFetch('/medicines/' + editingId, { method:'PUT', body:JSON.stringify(payload) });
  } else {
    r = await apiFetch('/medicines', { method:'POST', body:JSON.stringify(payload) });
  }

  if (!r.success) {
    showToast('❌','Error', r.error || 'Something went wrong.','warn');
    return;
  }

  await loadMedicines();
  editingId = null;
  resetForm();
  switchTab('dashboard');
  showToast(selectedEmoji, editingId ? 'Updated!' : 'Medicine added!',
    `${name} will remind you at ${times.map(fmt12).join(', ')}.`, 'success');
}

// ─── History rendering ────────────────────
async function renderHistory() {
  await loadHistory();

  let entries = [...historyLog];
  if (histFilter === 'taken')  entries = entries.filter(e => e.status === 'taken');
  if (histFilter === 'missed') entries = entries.filter(e => e.status === 'missed');
  if (histFilter === 'today')  entries = entries.filter(e => e.takenAt.startsWith(todayKey()));

  document.getElementById('histBadge').textContent = entries.length + ' records';
  const list = document.getElementById('historyList');

  if (!entries.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📜</div>
        <div class="empty-title">No records</div>
        <div class="empty-sub">Your dose history will appear here once you start taking medicines.</div>
      </div>`;
    return;
  }

  list.innerHTML = entries.map(e => {
    const d = new Date(e.takenAt);
    return `
      <div class="history-item ${e.status}-record">
        <div class="hist-icon">${e.emoji || '💊'}</div>
        <div class="hist-info">
          <div class="hist-name">${esc(e.medicineName)}</div>
          <div class="hist-detail">${esc(e.dose)} · Scheduled: ${fmt12(e.scheduledTime)}</div>
        </div>
        <span class="hist-status ${e.status}">${e.status === 'taken' ? '✅ Taken' : '❌ Missed'}</span>
        <div class="hist-time">
          ${d.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}<br/>
          ${d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})}
        </div>
      </div>`;
  }).join('');
}

function filterHistory(f, btn) {
  histFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderHistory();
}

// ─── Alarm checker ────────────────────────
function checkAlarms() {
  const now  = new Date();
  const hh   = String(now.getHours()).padStart(2,'0');
  const mm   = String(now.getMinutes()).padStart(2,'0');
  const curr = `${hh}:${mm}`;

  medicines.forEach(med => {
    med.times.forEach(t => {
      if (t !== curr) return;
      const already = (takenToday[med.id] || []).includes(t);
      if (already) return;

      showToast(med.emoji, `⏰ Time for ${med.name}!`, `Take your ${med.dosage} dose now.`, 'warn');
      if (Notification.permission === 'granted')
        new Notification(`⏰ Time for ${med.name}`, { body: `Take your ${med.dosage} dose now.`, requireInteraction: true });
      playAlarm();
    });
  });
}

function playAlarm() {
  try {
    const ctx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
    [0, 220, 440].forEach(delay => {
      setTimeout(() => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }, delay);
    });
  } catch (err) {
    console.error('Alarm sound error:', err);
  }
}

setInterval(checkAlarms, 30000);

// ─── Bootstrap ───────────────────────────
async function init() {
  loadTakenToday();
  checkNotifBanner();
  await loadMedicines();
  resetForm();
  renderDashboard();
}

await init();