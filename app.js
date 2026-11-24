/* MYES English — PWA personale. Dati nel dispositivo (IndexedDB), sincronizzazione facoltativa con un Gist privato. */
'use strict';
const APP_VERSION = '1.2.0';

/* ---------- icone ---------- */
const I = {
  home:'<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',
  words:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  review:'<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
  grammar:'<path d="M4 19V5l8 3 8-3v14l-8 3z"/><path d="M12 8v14"/>',
  diary:'<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M8 2v4M16 2v4M4 10h16"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  speak:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',
  cards:'<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
  quiz:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/>',
  bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  sync:'<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>',
  down:'<path d="M12 4v12M6 10l6 6 6-6M5 20h14"/>',
  up:'<path d="M12 20V8M6 14l6-6 6 6M5 4h14"/>',
  paste:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6"/>'
};
const ico = (n, fill) => `<svg viewBox="0 0 24 24" fill="${fill?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;

/* ---------- utilità ---------- */
const GRAMMAR = window.GRAMMAR || [];
const CATS = ['Parola','Phrasal verb','Espressione','Trappola'];
const OLD_CATS = {'Vocabolo':'Parola','Agg. composto':'Parola','Idioma':'Espressione','Collocazione':'Espressione','Colloquiale':'Espressione','Struttura':'Espressione','Coppia confondibile':'Trappola'};
const catClass = c => 'c-' + ({'Parola':'Parola','Phrasal verb':'Phrasal','Espressione':'Espressione','Trappola':'Trappola'}[c] || 'Parola');
const NEW_PER_DAY = 10, SESSION_MAX = 30;
const INT = [0,1,3,7,14,30,60];
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ymd = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today = () => ymd(new Date());
const addDays = n => { const d = new Date(); d.setDate(d.getDate()+n); return ymd(d); };
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const isNew = w => !w.due;
const isDue = w => !!w.due && w.due <= today();
const shuffle = a => { a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const fmtDate = d => { try{ return new Date(d+'T12:00').toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'}); }catch(e){ return d; } };
const ago = ms => { if(!ms) return 'mai'; const m = Math.round((Date.now()-ms)/60000); if(m<1) return 'adesso'; if(m<60) return m+' min fa'; const h=Math.round(m/60); if(h<24) return h+' h fa'; const g=Math.round(h/24); return g===1?'ieri':g+' giorni fa'; };

/* ---------- coda del ripasso ---------- */
function todayQueue(){
  const words = live('words');
  const reviews = words.filter(isDue).sort((a,b)=>a.due.localeCompare(b.due) || (a.box||0)-(b.box||0)).slice(0, SESSION_MAX);
  const introduced = words.filter(w=>w.firstSeen===today()).length;
  const room = Math.min(Math.max(0, NEW_PER_DAY - introduced), SESSION_MAX - reviews.length);
  const fresh = words.filter(isNew).sort((a,b)=>(b.created||0)-(a.created||0)).slice(0, Math.max(0, room));
  return {reviews, fresh, all:[...reviews, ...fresh]};
}
function gStat(id){ const g = S.gstats[id]; if(!g || !(g.r+g.w)) return null; return {...g, rate:g.w/(g.r+g.w)}; }
function weakTopics(){ return GRAMMAR.map(t=>({t, g:gStat(t.id)})).filter(x=>x.g && x.g.w>0).sort((a,b)=>b.g.rate-a.g.rate || b.g.w-a.g.w); }

/* ---------- archivio locale (IndexedDB) ---------- */
const STORES = ['words'];
const DB_STORES = ['words','lessons','errors'];
const Store = {
  db:null,
  open(){
    return new Promise((res,rej)=>{
      const r = indexedDB.open('myes-english', 1);
      r.onupgradeneeded = () => { const d = r.result; DB_STORES.forEach(s=>{ if(!d.objectStoreNames.contains(s)) d.createObjectStore(s,{keyPath:'id'}); }); if(!d.objectStoreNames.contains('meta')) d.createObjectStore('meta'); };
      r.onsuccess = () => { this.db = r.result; res(); };
      r.onerror = () => rej(r.error);
    });
  },
  tx(store, mode, fn){
    return new Promise((res,rej)=>{ const t = this.db.transaction(store, mode); const s = t.objectStore(store); const out = fn(s); t.oncomplete = () => res(out && out.result !== undefined ? out.result : undefined); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); });
  },
  all(store){ return new Promise((res,rej)=>{ const r = this.db.transaction(store).objectStore(store).getAll(); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); },
  put(store, obj){ return this.tx(store,'readwrite', s=>{ s.put(obj); }); },
  putMany(store, arr){ return this.tx(store,'readwrite', s=>{ arr.forEach(o=>s.put(o)); }); },
  getMeta(k){ return new Promise((res,rej)=>{ const r = this.db.transaction('meta').objectStore('meta').get(k); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); },
  setMeta(k,v){ return this.tx('meta','readwrite', s=>{ s.put(v,k); }); }
};

/* ---------- stato ---------- */
const S = {
  data:{words:[]}, stats:{reviewDays:[], updatedAt:0}, gstats:{},
  sync:{token:'', gistId:'', last:0, state:'off', msg:''}, lastBackup:0, persisted:false,
  route:'oggi', q:'', cat:'Tutte', open:null, sort:'recenti',
  gTopic:null, reveal:{}, session:null, quiz:null, gq:null, pack:null, ready:false
};
const live = c => S.data[c].filter(x=>!x.deleted);

async function loadAll(){
  await Store.open();
  S.data.words = await Store.all('words');
  S.stats = (await Store.getMeta('stats')) || {reviewDays:[], updatedAt:0};
  S.gstats = (await Store.getMeta('gstats')) || {};
  S.sync = {...S.sync, ...((await Store.getMeta('sync')) || {})};
  S.lastBackup = (await Store.getMeta('lastBackup')) || 0;
  const seedV = (await Store.getMeta('seedVersion')) || ((await Store.getMeta('seeded')) ? 1 : 0);
  if(window.SEED && seedV < window.SEED.version){
    const byId = new Map(S.data.words.map(w=>[w.id,w]));
    const write = [];
    for(const sw of window.SEED.words){
      const cur = byId.get(sw.id);
      if(!cur){ write.push(sw); continue; }
      if(!cur.updatedAt && !cur.deleted){ write.push({...sw, box:cur.box||0, due:cur.due||'', star:!!cur.star, firstSeen:cur.firstSeen}); }
    }
    // voci modificate dall'utente con le vecchie categorie: ricolloca
    for(const w of S.data.words){ if(OLD_CATS[w.cat] && w.updatedAt && !write.find(x=>x.id===w.id)){ write.push({...w, cat:OLD_CATS[w.cat], syn: w.syn || (w.cat==='Colloquiale'?'colloquiale':''), updatedAt:Date.now()}); } }
    if(write.length){ await Store.putMany('words', write); const m = new Map(S.data.words.map(w=>[w.id,w])); write.forEach(w=>m.set(w.id,w)); S.data.words=[...m.values()]; }
    await Store.setMeta('seedVersion', window.SEED.version);
    if(!(await Store.getMeta('seeded'))) await Store.setMeta('seeded', Date.now());
  }
  S.seededAt = (await Store.getMeta('seeded')) || Date.now();
  try{ if(navigator.storage && navigator.storage.persist){ S.persisted = await navigator.storage.persisted() || await navigator.storage.persist(); } }catch(e){}
}
async function put(coll, id, data){
  const doc = {...data, id, updatedAt:Date.now()};
  const arr = S.data[coll]; const i = arr.findIndex(x=>x.id===id);
  if(i>=0) arr[i] = doc; else arr.push(doc);
  render();
  try{ await Store.put(coll, doc); }catch(e){ toast('Salvataggio non riuscito: '+(e && e.name || 'errore')); }
  scheduleSync();
}
async function del(coll, id){
  const x = S.data[coll].find(o=>o.id===id); if(!x) return;
  await put(coll, id, {...x, deleted:true});
}
async function markDay(){
  const d = today(); const days = S.stats.reviewDays||[];
  if(days.includes(d)) return;
  S.stats = {reviewDays:[...days, d].slice(-400), updatedAt:Date.now()};
  await Store.setMeta('stats', S.stats); scheduleSync();
}
function streak(){
  const days = new Set(S.stats.reviewDays||[]); let n=0; const off = days.has(today()) ? 0 : 1;
  while(days.has(addDays(-off-n))) n++;
  return n;
}

/* ---------- sincronizzazione con Gist privato ---------- */
const GIST_FILE = 'myes-english-data.json';
let syncing = false, syncAgain = false, syncTimer = null;
async function gh(method, path, body){
  const r = await fetch('https://api.github.com'+path, {method, headers:{'Authorization':'Bearer '+S.sync.token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28', ...(body?{'Content-Type':'application/json'}:{})}, body: body?JSON.stringify(body):undefined, cache:'no-store'});
  if(r.status===401) throw new Error('Token non valido o scaduto. Creane uno nuovo e ricollegalo.');
  if(r.status===403||r.status===404) throw new Error('Il token non ha il permesso sui Gist. Ricrealo con lo scope "gist".');
  if(!r.ok) throw new Error('GitHub ha risposto con errore '+r.status+'. Riprova più tardi.');
  return r.status===204 ? null : r.json();
}
function payload(){ return {app:'myes-english', v:2, savedAt:Date.now(), words:S.data.words, stats:S.stats, gstats:S.gstats}; }
function mergeG(a,b){ const out = {...a}; Object.entries(b||{}).forEach(([k,v])=>{ if(!out[k] || (v.t||0) > (out[k].t||0)) out[k]=v; }); return out; }
const snapKey = () => JSON.stringify({w:S.data.words,s:S.stats,g:S.gstats});
function mergeColl(a,b){ const m = new Map(); [...a,...b].forEach(r=>{ if(!r||!r.id) return; const o = m.get(r.id); if(!o || (r.updatedAt||0) > (o.updatedAt||0)) m.set(r.id, r); }); return [...m.values()]; }
function mergeStats(a,b){ const days = [...new Set([...(a.reviewDays||[]), ...(b.reviewDays||[])])].sort().slice(-400); return {reviewDays:days, updatedAt:Math.max(a.updatedAt||0, b.updatedAt||0)}; }
async function saveSync(){ const {state, msg, ...keep} = S.sync; await Store.setMeta('sync', keep); }
async function findOrCreateGist(){
  for(let page=1; page<=5; page++){
    const list = await gh('GET', `/gists?per_page=100&page=${page}`);
    const hit = list.find(g=>g.files && g.files[GIST_FILE]);
    if(hit) return hit.id;
    if(list.length<100) break;
  }
  const g = await gh('POST','/gists',{description:'MYES English: dati dell\'app (non modificare a mano)', public:false, files:{[GIST_FILE]:{content:JSON.stringify(payload())}}});
  return g.id;
}
function scheduleSync(){ if(!S.sync.token) return; clearTimeout(syncTimer); syncTimer = setTimeout(()=>doSync(false), 4000); }
async function doSync(manual){
  if(!S.sync.token) return;
  if(!navigator.onLine){ S.sync.state='offline'; setSyncNote(); if(manual) toast('Sei offline: sincronizzo appena torna la rete.'); return; }
  if(syncing){ syncAgain = true; return; }
  syncing = true; S.sync.state='syncing'; setSyncNote(); if(S.route==='impostazioni') render();
  try{
    if(!S.sync.gistId){ S.sync.gistId = await findOrCreateGist(); await saveSync(); }
    const g = await gh('GET','/gists/'+S.sync.gistId);
    const f = g.files && g.files[GIST_FILE];
    let remote = null;
    if(f){ const text = f.truncated ? await (await fetch(f.raw_url,{cache:'no-store'})).text() : f.content; try{ remote = JSON.parse(text); }catch(e){ remote = null; } }
    const before = snapKey();
    if(remote && remote.app==='myes-english'){
      for(const c of STORES){
        const merged = mergeColl(S.data[c], remote[c]||[]);
        const localMap = new Map(S.data[c].map(x=>[x.id,x]));
        const changed = merged.filter(x=>{ const o = localMap.get(x.id); return !o || (x.updatedAt||0) > (o.updatedAt||0); });
        if(changed.length) await Store.putMany(c, changed);
        S.data[c] = merged;
      }
      S.stats = mergeStats(S.stats, remote.stats||{}); await Store.setMeta('stats', S.stats);
      S.gstats = mergeG(S.gstats, remote.gstats); await Store.setMeta('gstats', S.gstats);
    }
    const remoteSame = remote && JSON.stringify({w:remote.words,s:remote.stats,g:remote.gstats}) === snapKey();
    if(!remoteSame) await gh('PATCH','/gists/'+S.sync.gistId,{files:{[GIST_FILE]:{content:JSON.stringify(payload())}}});
    S.sync.last = Date.now(); S.sync.state='ok'; S.sync.msg=''; await saveSync();
    if(manual) toast('Sincronizzato');
    if(snapKey() !== before && !S.session && !S.quiz && !S.gq) render();
  }catch(e){
    S.sync.state='error'; S.sync.msg = e.message || 'Sincronizzazione non riuscita.';
    if(manual) toast(S.sync.msg);
  }
  syncing = false; setSyncNote(); if(S.route==='impostazioni' || S.route==='oggi') render();
  if(syncAgain){ syncAgain=false; doSync(false); }
}
async function connectSync(token){
  S.sync = {token:token.trim(), gistId:'', last:0, state:'syncing', msg:''};
  try{ await gh('GET','/user'); }catch(e){ S.sync = {token:'', gistId:'', last:0, state:'error', msg:e.message}; render(); return; }
  await saveSync(); await doSync(true);
}
async function disconnectSync(){ S.sync = {token:'', gistId:'', last:0, state:'off', msg:''}; await saveSync(); setSyncNote(); render(); toast('Sincronizzazione scollegata. I dati restano nel dispositivo.'); }
function setSyncNote(){
  const n = $('#syncnote'); if(!n) return;
  const t = !S.sync.token ? 'Dati salvati nel dispositivo' : {syncing:'Sincronizzazione…', ok:'Sincronizzato '+ago(S.sync.last), error:'Sincronizzazione non riuscita', offline:'Offline: sincronizzo al ritorno della rete'}[S.sync.state] || 'Sincronizzazione attiva';
  n.textContent = t;
}
window.addEventListener('online', ()=>doSync(false));
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible' && S.sync.token && Date.now()-(S.sync.last||0) > 60000) doSync(false); });

/* ---------- backup su file ---------- */
function exportBackup(){
  const blob = new Blob([JSON.stringify({...payload(), kind:'backup'}, null, 1)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `myes-english-backup-${today()}.json`;
  document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  S.lastBackup = Date.now(); Store.setMeta('lastBackup', S.lastBackup); toast('Backup salvato nei Download'); render();
}
async function importBackup(text){
  let o; try{ o = JSON.parse(text); }catch(e){ toast('Il file non è un backup valido.'); return; }
  if(o.type==='myes-pack'){ openPackPreview(o); return; }
  if(o.app!=='myes-english'){ toast('Il file non è un backup di MYES English.'); return; }
  for(const c of STORES){ const merged = mergeColl(S.data[c], o[c]||[]); await Store.putMany(c, merged); S.data[c] = merged; }
  S.stats = mergeStats(S.stats, o.stats||{}); await Store.setMeta('stats', S.stats);
  S.gstats = mergeG(S.gstats, o.gstats); await Store.setMeta('gstats', S.gstats);
  toast('Backup importato e unito ai dati attuali'); render(); scheduleSync();
}
const needsBackup = () => { const covered = S.sync.token && S.sync.state!=='error' && Date.now()-(S.sync.last||0) < 14*864e5; return !covered && Date.now()-Math.max(S.lastBackup||0, S.seededAt||0) > 14*864e5; };

/* ---------- pacchetto lezione ---------- */
function parsePack(text){
  let t = String(text||'').trim();
  const m = t.match(/\{[\s\S]*\}/); if(m) t = m[0];
  let o; try{ o = JSON.parse(t); }catch(e){ return {error:'Il testo non è un pacchetto valido. Incolla tutto il blocco che ti ho preparato, dalla prima { all\'ultima }.'}; }
  if(o.app==='myes-english'){ return {error:'Questo è un backup completo: usa "Importa backup" nelle Impostazioni.'}; }
  if(!Array.isArray(o.words) || !o.words.length) return {error:'Il pacchetto non contiene parole.'};
  return {pack:o};
}
function openPackPreview(o){
  const words = (o.words||[]).filter(w=>w && w.term && w.it);
  const existing = new Set(live('words').map(w=>w.term.trim().toLowerCase()));
  const fresh = words.filter(w=>!existing.has(String(w.term).trim().toLowerCase()));
  const dup = words.length - fresh.length;
  S.pack = {o, fresh};
  sheet(`${sheetHead('Importa pacchetto')}
    <div class="preview">
      ${o.source?`<div><b>Fonte</b>: ${esc(o.source)}</div>`:''}
      <div><b>${fresh.length}</b> ${fresh.length===1?'parola nuova':'parole nuove'}${dup?` · ${dup} già ${dup===1?'presente (saltata)':'presenti (saltate)'}`:''}</div>
    </div>
    ${fresh.length?`<div style="max-height:220px;overflow:auto;font-size:14px;display:grid;gap:4px">${fresh.map(w=>`<div><b>${esc(w.term)}</b> <span class="muted">· ${esc(w.it)}</span></div>`).join('')}</div>`:''}
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-act="close-sheet">Annulla</button><button class="btn primary" data-act="pack-confirm" ${fresh.length?'':'disabled'}>Importa</button></div>`);
}
async function confirmPack(){
  const {o, fresh} = S.pack; const now = Date.now(); const src = o.source || '';
  for(let i=0;i<fresh.length;i++){ const w = fresh[i]; const cat = CATS.includes(w.cat) ? w.cat : (OLD_CATS[w.cat] || 'Parola');
    await put('words', uid('w'), {term:String(w.term).trim(), it:String(w.it).trim(), ex:w.ex||'', cat, note:w.note||'', ipa:w.ipa||'', syn:w.syn||'', src:w.src||src, box:0, due:'', star:false, created:now+i}); }
  S.pack = null; closeSheet(); toast(fresh.length===1?'Importata 1 parola':`Importate ${fresh.length} parole`);
}
/* ---------- voce ---------- */
function speak(text){
  try{
    const u = new SpeechSynthesisUtterance(text); u.lang='en-GB'; u.rate=.92;
    const vs = speechSynthesis.getVoices(); const v = vs.find(v=>/en[-_]GB/i.test(v.lang)) || vs.find(v=>/^en/i.test(v.lang));
    if(v) u.voice=v; speechSynthesis.cancel(); speechSynthesis.speak(u);
  }catch(e){ toast('La lettura ad alta voce non è disponibile su questo dispositivo.'); }
}
const clean = t => String(t).split(/\s+\/\s+|\s+vs\s+/)[0].replace(/\(.*?\)/g,'').trim();

/* ---------- navigazione ---------- */
const ROUTES = [['oggi','Oggi','home'],['parole','Parole','words'],['ripasso','Ripasso','review'],['grammatica','Grammatica','grammar']];
const ALL_ROUTES = [...ROUTES.map(r=>r[0]), 'impostazioni'];
function navHTML(side){
  const due = todayQueue().all.length;
  const items = ROUTES.map(([k,l,i])=>`<button class="${side?'nav':''}" data-go="${k}" ${S.route===k?'aria-current="page"':''}>${ico(i)}<span>${l}</span>${k==='ripasso'&&due?`<span class="count">${due}</span>`:''}</button>`).join('');
  return side ? items + `<button class="nav" data-go="impostazioni" ${S.route==='impostazioni'?'aria-current="page"':''} style="margin-top:8px">${ico('gear')}<span>Impostazioni</span></button>` : items;
}
function go(r){ if(location.hash!=='#'+r) location.hash = r; else { S.route=r; render(); } }
window.addEventListener('hashchange', ()=>{ const h = location.hash.slice(1); if(ALL_ROUTES.includes(h)){ S.route=h; S.gTopic=null; render(); $('main').scrollTop=0; window.scrollTo(0,0); } });
const gearBtn = () => `<button class="icon-btn gear" data-go="impostazioni" aria-label="Impostazioni">${ico('gear')}</button>`;

/* ---------- viste ---------- */
function bannerHTML(){
  if(needsBackup() && live('words').length) return `<div class="banner row" style="justify-content:space-between"><span>Non fai un backup da più di 14 giorni.</span><button class="btn sm" data-act="export">${ico('down')} Fai backup</button></div>`;
  if(S.sync.token && S.sync.state==='error') return `<div class="banner row" style="justify-content:space-between"><span>${esc(S.sync.msg)}</span><button class="btn sm" data-go="impostazioni">Apri impostazioni</button></div>`;
  return '';
}
function vOggi(){
  const words = live('words'); const q = todayQueue();
  const tot = words.length, n = q.all.length;
  const mastered = words.filter(w=>(w.box||0)>=3).length;
  const pct = tot ? Math.round(mastered/tot*100) : 0;
  const st = streak();
  const seed = Number(today().split('-').join(''));
  let pool = words.filter(w=>w.firstSeen && (w.box||0)<=1).sort((a,b)=>a.id<b.id?-1:1);
  if(!pool.length) pool = words.filter(isNew).sort((a,b)=>(b.created||0)-(a.created||0)).slice(0,30);
  if(!pool.length) pool = words.slice().sort((a,b)=>a.id<b.id?-1:1);
  const w = pool.length ? pool[seed % pool.length] : null;
  const weak = weakTopics()[0];
  const untouched = GRAMMAR.find(t=>!gStat(t.id));
  const h = new Date().getHours(); const hi = h<13?'Good morning':h<18?'Good afternoon':'Good evening';
  const dt = new Date().toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'});
  return `
  <header class="topbar">
    <div><div class="eyebrow">${esc(dt)}</div><h1>${hi}, Cetto</h1><div class="muted" style="font-size:14px;margin-top:4px">${st?`<b style="color:var(--ink)">${st} ${st===1?'giorno':'giorni'}</b> di fila`:'Inizia la serie oggi'}${navigator.onLine?'':' · <span class="offline-dot"></span>offline'}</div></div>
    ${gearBtn()}
  </header>
  ${bannerHTML()}
  <section class="hero">
    <div class="card today">
      <div class="eyebrow">Ripasso di oggi</div>
      <h2>${n ? `${n} ${n===1?'parola':'parole'}` : (tot ? 'Sei in pari' : 'Il glossario è vuoto')}</h2>
      <p>${n ? `${q.reviews.length} da ripassare · ${q.fresh.length} ${q.fresh.length===1?'nuova':'nuove'}. Circa ${Math.max(1,Math.round(n*0.3))} minuti.` : (tot ? 'Per oggi hai finito. Puoi fare un quiz o esercitarti sulla grammatica.' : 'Aggiungi le prime parole con il tasto +.')}</p>
      <div class="row">${n?`<button class="btn" data-act="start-review">${ico('cards')} Inizia ripasso</button>`:`<button class="btn" data-act="start-quiz">${ico('quiz')} Fai un quiz</button>`}</div>
    </div>
    ${w ? `<div class="card wod">
      <div class="row" style="justify-content:space-between"><span class="eyebrow">Parola del giorno</span><button class="icon-btn" data-act="speak" data-t="${esc(clean(w.term))}" aria-label="Ascolta">${ico('speak')}</button></div>
      <div class="term">${esc(w.term)}</div>
      ${w.ipa?`<div class="ipa">${esc(w.ipa)}</div>`:''}
      <div class="muted">${esc(w.it)}</div>
      ${w.ex?`<div class="ex" style="margin-top:10px">${esc(w.ex)}</div>`:''}
    </div>` : `<div class="card wod"><span class="eyebrow">Parola del giorno</span><p class="muted">Comparirà quando il glossario avrà qualche voce.</p></div>`}
  </section>
  <section class="card" style="display:grid;gap:10px">
    <div class="eyebrow">Grammatica da rinforzare</div>
    ${weak ? `<h2>${esc(weak.t.title)}</h2><p class="muted" style="margin:0;font-size:15px">${weak.g.w} ${weak.g.w===1?'errore':'errori'} su ${weak.g.r+weak.g.w} esercizi. ${esc(weak.t.sub)}</p>`
      : untouched ? `<h2>${esc(untouched.title)}</h2><p class="muted" style="margin:0;font-size:15px">Non ti sei ancora esercitato su questa scheda. ${esc(untouched.sub)}</p>`
      : `<h2>Nessuna scheda debole</h2><p class="muted" style="margin:0;font-size:15px">Negli esercizi fatti finora non hai errori. Un giro misto tiene tutto fresco.</p>`}
    <div class="row">${(weak||untouched)?`<button class="btn primary sm" data-act="g-start" data-id="${(weak?weak.t:untouched).id}">${ico('bolt')} Esercitati</button><button class="btn sm" data-act="topic-open" data-id="${(weak?weak.t:untouched).id}">Apri la scheda</button>`:`<button class="btn primary sm" data-act="g-start">${ico('bolt')} Giro misto</button>`}</div>
  </section>
  <section class="grid g3 stats">
    <div class="card stat"><b>${tot}</b><span>parole nel glossario</span></div>
    <div class="card stat"><b>${pct}%</b><span>consolidate (livello 3+)</span></div>
    <div class="card stat"><b>${st}</b><span>giorni di fila</span></div>
  </section>`;
}
function filteredWords(){
  const q = S.q.trim().toLowerCase();
  let ws = live('words').filter(w => (S.cat==='Tutte' || (S.cat==='★ Preferite' ? w.star : w.cat===S.cat)) &&
    (!q || [w.term,w.it,w.ex,w.note,w.src,w.syn].some(x=>String(x||'').toLowerCase().includes(q))));
  if(S.sort==='az') ws.sort((a,b)=>a.term.localeCompare(b.term,'en',{sensitivity:'base'}));
  else if(S.sort==='deboli') ws.sort((a,b)=>(a.box||0)-(b.box||0));
  else ws.sort((a,b)=>(b.created||0)-(a.created||0));
  return ws;
}
function vParole(){
  const words = live('words'); const ws = filteredWords();
  const counts = {}; words.forEach(w=>counts[w.cat]=(counts[w.cat]||0)+1);
  const stars = words.filter(w=>w.star).length;
  const chips = ['Tutte', ...(stars?['★ Preferite']:[]), ...CATS.filter(c=>counts[c])];
  return `
  <header class="topbar">
    <div><div class="eyebrow">Glossario</div><h1>Le mie parole</h1></div>
    <button class="btn primary" data-act="add-word">${ico('plus')} Nuova</button>
  </header>
  <div class="row">
    <label class="search">${ico('search')}<input id="q" type="search" placeholder="Cerca in inglese o in italiano" value="${esc(S.q)}" aria-label="Cerca" autocomplete="off"></label>
    <label class="field" style="min-width:150px"><select id="sort" aria-label="Ordina">
      <option value="recenti" ${S.sort==='recenti'?'selected':''}>Più recenti</option>
      <option value="az" ${S.sort==='az'?'selected':''}>A → Z</option>
      <option value="deboli" ${S.sort==='deboli'?'selected':''}>Da rinforzare</option>
    </select></label>
  </div>
  <div class="chips" role="toolbar" aria-label="Categorie">${chips.map(c=>`<button class="chip" data-cat="${esc(c)}" aria-pressed="${S.cat===c}">${esc(c)}<span class="n">${c==='Tutte'?words.length:c==='★ Preferite'?stars:counts[c]}</span></button>`).join('')}</div>
  <div id="wordlist">${wordListHTML(ws)}</div>`;
}
function wordListHTML(ws){
  if(!live('words').length) return `<div class="card empty">Il glossario è vuoto. Aggiungi la prima parola con <b>Nuova</b>.</div>`;
  if(!ws.length) return `<div class="card empty">Nessuna parola corrisponde alla ricerca.</div>`;
  return `<div class="list">${ws.map(w=>{
    const open = S.open===w.id; const b = w.box||0;
    return `<div class="item">
      <button class="item-head" data-act="toggle" data-id="${w.id}" aria-expanded="${open}">
        <div><div class="t">${esc(w.term)}</div><div class="it">${esc(w.it)}</div></div>
        <div class="row" style="gap:8px">${w.star?`<span style="color:#D9A400;display:inline-flex">${ico('star',1).replace('<svg','<svg width="16" height="16"')}</span>`:''}<span class="pill ${catClass(w.cat)}">${esc(w.cat)}</span></div>
      </button>
      ${open?`<div class="item-body">
        ${w.ipa?`<div class="ipa">${esc(w.ipa)}</div>`:''}
        ${w.ex?`<div class="ex">${esc(w.ex)}</div>`:''}
        ${w.syn?`<div style="font-size:15px"><b>Sinonimi / registro:</b> ${esc(w.syn)}</div>`:''}
        ${w.note?`<div class="note">${esc(w.note)}</div>`:''}
        <div class="meta"><span>Livello <span class="dots">${[1,2,3,4,5,6].map(i=>`<i class="${b>=i?'f':''}"></i>`).join('')}</span></span>${w.src?`<span>Fonte: ${esc(w.src)}</span>`:''}<span>${isNew(w)?'Nuova, non ancora studiata':'Prossimo ripasso: '+(isDue(w)?'oggi':esc(fmtDate(w.due)))}</span></div>
        <div class="row" style="gap:4px">
          <button class="btn sm" data-act="speak" data-t="${esc(clean(w.term))}">${ico('speak')} Ascolta</button>
          ${w.ex?`<button class="btn sm ghost" data-act="speak" data-t="${esc(w.ex)}">Esempio</button>`:''}
          <span style="flex:1"></span>
          <button class="icon-btn ${w.star?'on':''}" data-act="star" data-id="${w.id}" aria-label="Preferita">${ico('star',w.star)}</button>
          <button class="icon-btn" data-act="edit-word" data-id="${w.id}" aria-label="Modifica">${ico('edit')}</button>
          <button class="icon-btn" data-act="ask-del" data-coll="words" data-id="${w.id}" aria-label="Elimina">${ico('trash')}</button>
        </div>
      </div>`:''}
    </div>`;}).join('')}</div>`;
}

function vRipasso(){
  if(S.session) return vSession();
  if(S.quiz) return vQuiz();
  if(S.gq) return vGQ();
  const words = live('words'); const q = todayQueue();
  const boxes = [0,1,2,3,4,5,6].map(b=>words.filter(w=>(w.box||0)===b && !isNew(w)).length);
  const nNew = words.filter(isNew).length;
  const max = Math.max(1, nNew, ...boxes);
  const weak = weakTopics().slice(0,3);
  return `
  <header class="topbar"><div><div class="eyebrow">Ripasso</div><h1>Allenati</h1></div>${gearBtn()}</header>
  <section class="grid g2">
    <button class="card mode" data-act="start-review" ${!words.length?'disabled':''}><div class="ico">${ico('cards')}</div><h2>Flashcard</h2><p class="muted" style="margin:0">${q.all.length?`Oggi: ${q.reviews.length} da ripassare e ${q.fresh.length} nuove. Ogni parola torna quando stai per dimenticarla.`:'Per oggi sei in pari: parte un ripasso libero di 10 parole già viste.'}</p></button>
    <button class="card mode" data-act="start-reverse" ${!words.length?'disabled':''}><div class="ico">${ico('bolt')}</div><h2>Dall'italiano</h2><p class="muted" style="margin:0">La stessa coda, al contrario: vedi l'italiano e devi produrre l'inglese. È la più difficile.</p></button>
    <button class="card mode" data-act="start-quiz" ${words.length<4?'disabled':''}><div class="ico">${ico('quiz')}</div><h2>Quiz a scelta</h2><p class="muted" style="margin:0">10 domande: leggi l'italiano e scegli l'espressione inglese giusta tra quattro.</p></button>
    <button class="card mode" data-act="g-start"><div class="ico">${ico('grammar')}</div><h2>Grammatica</h2><p class="muted" style="margin:0">10 esercizi presi dalle ${GRAMMAR.length} schede, più spesso da quelle su cui sbagli. Pensi la risposta, poi ti autovaluti.</p></button>
  </section>
  ${weak.length?`<section class="card" style="display:grid;gap:10px"><h2>Schede da rinforzare</h2>${weak.map(x=>`<div class="set-row"><div><b>${esc(x.t.title)}</b><div class="muted" style="font-size:14px">${x.g.w} errori su ${x.g.r+x.g.w}</div></div><button class="btn sm" data-act="g-start" data-id="${x.t.id}">Esercitati</button></div>`).join('')}</section>`:''}
  <section class="card" style="display:grid;gap:12px">
    <h2>A che punto sei</h2>
    <p class="muted" style="margin:0;font-size:14px">Ogni giorno entrano al massimo ${NEW_PER_DAY} parole nuove. Una parola sale di livello quando la sai e torna a zero quando la sbagli: livello 1 la rivedi domani, livello 6 tra due mesi.</p>
    <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px;align-items:end;height:150px">
      ${[nNew,...boxes].map((n,i)=>`<div style="display:grid;gap:4px;height:100%;grid-template-rows:1fr auto auto"><div style="align-self:end;height:${Math.max(4,n/max*100)}%;background:${i===0?'var(--marker)':i===1?'var(--line)':i>=4?'var(--good)':'var(--accent)'};border-radius:6px 6px 2px 2px;opacity:${i<2?1:.55+i*.06}"></div><b style="text-align:center;font:600 13px var(--mono)">${n}</b><span class="muted" style="text-align:center;font-size:11px">${i===0?'Nuove':i===1?'Da rifare':'Liv. '+(i-1)}</span></div>`).join('')}
    </div>
  </section>`;
}
function startReview(reverse){
  let q = todayQueue().all; let free = false;
  if(!q.length){ const seen = live('words').filter(w=>!isNew(w)); q = shuffle(seen.length?seen:live('words')).slice(0,10); free = true; }
  S.session = {ids:q.map(w=>w.id), i:0, flipped:false, right:0, wrong:0, again:new Set(), reverse:!!reverse, free};
  render();
}
function vSession(){
  const s = S.session; const total = s.ids.length;
  if(s.i>=total){
    return `<div class="flash-wrap"><div class="card" style="text-align:center;display:grid;gap:10px;padding:32px">
      <div class="eyebrow">Ripasso completato</div><h1>Well done!</h1>
      <p class="muted" style="margin:0">${s.right} giuste al primo colpo · ${s.wrong} da rivedere${s.free?' · ripasso libero':''}</p>
      <div class="row" style="justify-content:center;margin-top:8px"><button class="btn primary" data-act="end-session">Torna al ripasso</button><button class="btn" data-go="oggi">Vai a Oggi</button></div>
    </div></div>`;
  }
  const w = live('words').find(x=>x.id===s.ids[s.i]);
  if(!w){ s.i++; return vSession(); }
  const front = s.reverse ? `<div class="big">${esc(w.it)}</div><div class="hint">Come si dice in inglese?</div>` : `<div class="big">${esc(w.term)}</div><div class="hint">Cosa significa? Prova a usarla in una frase.</div>`;
  const back = (s.reverse ? `<div class="big">${esc(w.term)}</div>` : `<div class="big">${esc(w.it)}</div>`) + (w.ipa?`<div class="ipa">${esc(w.ipa)}</div>`:'') + (w.syn?`<div style="font-size:14px;text-align:left"><b>Sinonimi / registro:</b> ${esc(w.syn)}</div>`:'');
  return `<div class="flash-wrap">
    <div class="row" style="justify-content:space-between"><button class="btn ghost sm" data-act="end-session">${ico('close')} Esci</button><span class="muted" style="font:600 13px var(--mono)">${s.i+1} / ${total}</span></div>
    <div class="progress"><i style="width:${s.i/total*100}%"></i></div>
    <div class="card flash" data-act="flip" role="button" tabindex="0" aria-label="Gira la carta">
      <span class="pill ${catClass(w.cat)}">${isNew(w)?'Nuova · ':''}${esc(w.cat)}</span>
      ${front}
      ${s.flipped ? `<div class="ans">${back}${w.ex?`<div class="ex" style="text-align:left">${esc(w.ex)}</div>`:''}${w.note?`<div class="note" style="text-align:left">${esc(w.note)}</div>`:''}</div>` : `<div class="hint" style="margin-top:14px">Tocca per vedere la risposta</div>`}
    </div>
    ${s.flipped ? `<div class="grade"><button class="btn no" data-act="grade" data-ok="0">Da rivedere</button><button class="btn yes" data-act="grade" data-ok="1">La sapevo</button></div>
      <button class="btn ghost sm" data-act="speak" data-t="${esc(clean(w.term))}" style="justify-self:center">${ico('speak')} Ascolta la pronuncia</button>` : ''}
  </div>`;
}
function grade(ok){
  const s = S.session; const id = s.ids[s.i]; const w = live('words').find(x=>x.id===id);
  if(w){
    let box = w.box||0, due;
    if(ok){ box = Math.min(box+1, 6); due = addDays(INT[box]); if(!s.again.has(id)) s.right++; }
    else { box = 0; due = today(); if(!s.again.has(id)){ s.wrong++; s.again.add(id); s.ids.push(id); } }
    const {id:_, ...rest} = w; put('words', id, {...rest, box, due, firstSeen: w.firstSeen || today()});
  }
  s.i++; s.flipped=false;
  if(s.i>=s.ids.length) markDay();
  render();
}
function startQuiz(){
  const words = live('words');
  const qs = shuffle(words).slice(0,10).map(w=>{
    const same = shuffle(words.filter(x=>x.id!==w.id && x.cat===w.cat));
    const other = shuffle(words.filter(x=>x.id!==w.id && x.cat!==w.cat));
    return {w, opts:shuffle([w, ...[...same, ...other].slice(0,3)]), pick:null};
  });
  S.quiz = {qs, i:0, score:0}; render();
}
function vQuiz(){
  const z = S.quiz;
  if(z.i>=z.qs.length){
    const missed = z.qs.filter(q=>q.pick!==q.w.id);
    return `<div class="flash-wrap"><div class="card" style="display:grid;gap:12px;padding:28px">
      <div class="eyebrow" style="text-align:center">Quiz completato</div><h1 style="text-align:center">${z.score} / ${z.qs.length}</h1>
      ${missed.length?`<h3>Da ripassare</h3>${missed.map(q=>`<div><b>${esc(q.w.term)}</b> <span class="muted">· ${esc(q.w.it)}</span></div>`).join('')}`:'<p class="muted" style="text-align:center">Tutto giusto. Ottimo lavoro.</p>'}
      <div class="row" style="justify-content:center"><button class="btn primary" data-act="start-quiz">Nuovo quiz</button><button class="btn" data-act="end-quiz">Fine</button></div>
    </div></div>`;
  }
  const q = z.qs[z.i];
  return `<div class="flash-wrap">
    <div class="row" style="justify-content:space-between"><button class="btn ghost sm" data-act="end-quiz">${ico('close')} Esci</button><span class="muted" style="font:600 13px var(--mono)">${z.i+1} / ${z.qs.length} · punti ${z.score}</span></div>
    <div class="progress"><i style="width:${z.i/z.qs.length*100}%"></i></div>
    <div class="card" style="text-align:center;padding:28px;display:grid;gap:6px"><div class="eyebrow">Come si dice</div><div style="font:800 28px/1.15 var(--display)">${esc(q.w.it)}</div></div>
    <div style="display:grid;gap:8px">${q.opts.map(o=>{
      let c=''; if(q.pick){ if(o.id===q.w.id) c='right'; else if(o.id===q.pick) c='wrong'; }
      return `<button class="opt ${c}" data-act="pick" data-id="${o.id}" ${q.pick?'disabled':''}>${esc(o.term)}</button>`;}).join('')}</div>
    ${q.pick?`${q.w.ex?`<div class="ex">${esc(q.w.ex)}</div>`:''}<button class="btn primary" data-act="next-q">${z.i+1<z.qs.length?'Avanti':'Vedi il risultato'}</button>`:''}
  </div>`;
}

function startGrammar(topicId){
  let items;
  if(topicId){ const t = GRAMMAR.find(x=>x.id===topicId); items = t.drill.map(d=>({tid:t.id, title:t.title, q:d[0], a:d[1]})); }
  else {
    const all = GRAMMAR.flatMap(t=>t.drill.map(d=>({tid:t.id, title:t.title, q:d[0], a:d[1]})));
    const weight = it => { const g = gStat(it.tid); return g ? 1 + 4*g.rate : 2; };
    items = all.map(it=>({it, k:-Math.log(Math.random())/weight(it)})).sort((a,b)=>a.k-b.k).slice(0,10).map(x=>x.it);
  }
  S.session=null; S.quiz=null; S.gq = {items:shuffle(items), i:0, shown:false, right:0, wrong:0, topic:topicId||null, missed:[]};
  if(S.route!=='ripasso') go('ripasso'); else render();
}
async function gradeG(ok){
  const z = S.gq; const it = z.items[z.i];
  const g = S.gstats[it.tid] || {r:0, w:0};
  S.gstats = {...S.gstats, [it.tid]:{r:g.r+(ok?1:0), w:g.w+(ok?0:1), t:Date.now()}};
  if(ok) z.right++; else { z.wrong++; z.missed.push(it); }
  z.i++; z.shown=false;
  if(z.i>=z.items.length) markDay();
  render();
  try{ await Store.setMeta('gstats', S.gstats); }catch(e){}
  scheduleSync();
}
function vGQ(){
  const z = S.gq; const total = z.items.length;
  if(z.i>=total){
    const tids = [...new Set(z.missed.map(m=>m.tid))];
    return `<div class="flash-wrap"><div class="card" style="display:grid;gap:12px;padding:28px">
      <div class="eyebrow" style="text-align:center">Esercizi completati</div><h1 style="text-align:center">${z.right} / ${total}</h1>
      ${tids.length?`<h3>Da rivedere</h3>${tids.map(id=>{ const t=GRAMMAR.find(x=>x.id===id); return `<div class="set-row" style="flex-wrap:nowrap"><b>${esc(t.title)}</b><button class="btn sm" data-act="topic-open" data-id="${id}" style="flex:none">Apri</button></div>`; }).join('')}`:'<p class="muted" style="text-align:center">Tutto giusto. Ottimo lavoro.</p>'}
      <div class="row" style="justify-content:center"><button class="btn primary" data-act="g-start" ${z.topic?`data-id="${z.topic}"`:''}>Ancora</button><button class="btn" data-act="g-end">Fine</button></div>
    </div></div>`;
  }
  const it = z.items[z.i];
  return `<div class="flash-wrap">
    <div class="row" style="justify-content:space-between"><button class="btn ghost sm" data-act="g-end">${ico('close')} Esci</button><span class="muted" style="font:600 13px var(--mono)">${z.i+1} / ${total}</span></div>
    <div class="progress"><i style="width:${z.i/total*100}%"></i></div>
    <div class="card" style="display:grid;gap:12px;padding:24px">
      <span class="tag" style="font:600 11px var(--mono);color:var(--muted);text-transform:uppercase;letter-spacing:.06em">${esc(it.title)}</span>
      <div style="font:700 21px/1.35 var(--display)">${esc(it.q)}</div>
      ${z.shown?`<div class="drill" style="border-color:var(--good)"><div class="a">${esc(it.a)}</div></div>`:`<div class="hint muted" style="font-size:14px">Pensa la risposta (o dilla ad alta voce), poi controlla.</div>`}
    </div>
    ${z.shown?`<div class="grade"><button class="btn no" data-act="g-grade" data-ok="0">Sbagliata</button><button class="btn yes" data-act="g-grade" data-ok="1">Giusta</button></div>`:`<button class="btn primary" data-act="g-show">Mostra soluzione</button>`}
  </div>`;
}

function vGrammatica(){
  if(S.gTopic) return vTopic(GRAMMAR.find(t=>t.id===S.gTopic));
  return `
  <header class="topbar"><div><div class="eyebrow">Grammatica</div><h1>Schede</h1><p class="muted" style="margin:6px 0 0">${GRAMMAR.length} argomenti del corso e delle dispense MYES, con formula, trappole per chi parla italiano ed esercizi.</p></div>${gearBtn()}</header>
  <section class="grid g2">
    ${GRAMMAR.map(t=>{ const g=gStat(t.id); const badge = !g ? '' : g.rate>=0.34 ? '<span class="status err" style="justify-self:start"><i></i>Da rinforzare</span>' : '<span class="status ok" style="justify-self:start"><i></i>'+g.r+'/'+(g.r+g.w)+' giuste</span>'; return `<button class="card topic" data-act="topic" data-id="${t.id}"><span class="tag">${esc(t.tag)}</span><h3>${esc(t.title)}</h3><p>${esc(t.sub)}</p>${badge}</button>`; }).join('')}
  </section>`;
}
function tableHTML(rows){
  return `<div class="tbl-wrap"><table class="ctab"><thead><tr>${rows[0].map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(r=>`<tr>${r.map((c,i)=>`<td${i===0?' style="font-weight:700"':''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function vTopic(t){
  if(!t){ S.gTopic=null; return vGrammatica(); }
  const idx = GRAMMAR.indexOf(t); const nx = GRAMMAR[idx+1];
  return `
  <button class="btn ghost sm" data-act="topics" style="justify-self:start;margin-left:-8px">${ico('back')} Tutte le schede</button>
  <header><div class="eyebrow">${esc(t.tag)}</div><h1>${esc(t.title)}</h1><p class="muted" style="margin:6px 0 0">${esc(t.sub)}</p></header>
  <section class="card sec">
    <h3>Formula</h3>
    ${(t.formula||[]).map(f=>`<div class="formula">${esc(f)}</div>`).join('')}
    ${t.table?tableHTML(t.table):''}
  </section>
  <section class="card sec"><h3>Quando si usa</h3><ul class="uses">${t.uses.map(u=>`<li>${u}</li>`).join('')}</ul></section>
  <section class="card sec"><h3>Esempi</h3>
    <table class="extab"><tbody>${t.ex.map(e=>`<tr><td>${esc(e[0])} <button class="icon-btn" style="display:inline-grid;width:28px;height:28px;vertical-align:middle" data-act="speak" data-t="${esc(e[0].replace(/^"[^"]*"\s*→\s*/,''))}" aria-label="Ascolta">${ico('speak')}</button></td><td>${esc(e[1])}</td></tr>`).join('')}</tbody></table>
  </section>
  <section class="grid g2">
    <div class="trap"><b>Trappole</b>${t.traps.map(x=>`<div>${x}</div>`).join('')}</div>
    <div class="trick"><b>Trucco</b><div style="margin-top:6px">${t.trick}</div></div>
  </section>
  <section class="card sec"><div class="set-row"><h3>Mettiti alla prova</h3><button class="btn sm primary" data-act="g-start" data-id="${t.id}">${ico('bolt')} Esercitati</button></div>
    ${t.drill.map((d,i)=>{ const k=t.id+i; const r=S.reveal[k]; return `<div class="drill"><div>${esc(d[0])}</div>${r?`<div class="a">${esc(d[1])}</div>`:`<button class="btn sm" data-act="reveal" data-k="${k}" style="justify-self:start">Mostra soluzione</button>`}</div>`;}).join('')}
  </section>
  ${nx?`<button class="card topic" data-act="topic" data-id="${nx.id}"><span class="tag">Prossima scheda</span><h3>${esc(nx.title)}</h3></button>`:''}`;
}

function vImpostazioni(){
  const theme = (()=>{ try{ return localStorage.getItem('myes-theme')||'system'; }catch(e){ return 'system'; } })();
  const st = S.sync; const on = !!st.token;
  const badge = !on ? '<span class="status"><i></i>Non collegata</span>' : st.state==='error' ? '<span class="status err"><i></i>Errore</span>' : st.state==='syncing' ? '<span class="status"><i></i>In corso…</span>' : st.state==='offline' ? '<span class="status"><i></i>Offline</span>' : '<span class="status ok"><i></i>Attiva</span>';
  return `
  <button class="btn ghost sm" data-go="oggi" style="justify-self:start;margin-left:-8px">${ico('back')} Oggi</button>
  <header><div class="eyebrow">Impostazioni</div><h1>Dati e app</h1></header>
  <section class="card sec">
    <div class="set-row"><h2>Sincronizzazione con il PC</h2>${badge}</div>
    ${on ? `
      <p class="muted" style="margin:0;font-size:15px">I dati si sincronizzano con un Gist privato sul tuo GitHub: all'apertura, dopo ogni modifica e quando torna la rete. Ultima sincronizzazione: <b>${esc(ago(st.last))}</b>.</p>
      ${st.state==='error'?`<div class="trap"><b>Problema</b><div>${esc(st.msg)}</div></div>`:''}
      <div class="row"><button class="btn primary" data-act="sync-now">${ico('sync')} Sincronizza ora</button><button class="btn danger" data-act="sync-off">Scollega</button></div>
    ` : `
      <p class="muted" style="margin:0;font-size:15px">Gratis, senza account nuovi. I dati vanno in un Gist privato sul tuo GitHub, visibile solo a te. Si fa una volta sul telefono e una sul PC.</p>
      <ol class="steps">
        <li>Apri <a href="https://github.com/settings/tokens/new?scopes=gist&description=MYES%20English" target="_blank" rel="noopener">questa pagina di GitHub</a> (è già impostata con il solo permesso <code>gist</code>).</li>
        <li>In <b>Expiration</b> scegli <b>No expiration</b>, poi premi <b>Generate token</b> in fondo.</li>
        <li>Copia il codice che inizia con <code>ghp_</code> e incollalo qui sotto. Sul secondo dispositivo incolla lo stesso codice.</li>
      </ol>
      <div class="field"><label for="tok">Token GitHub</label><input id="tok" type="password" autocomplete="off" placeholder="ghp_…"></div>
      ${st.state==='error'&&st.msg?`<div class="trap"><b>Problema</b><div>${esc(st.msg)}</div></div>`:''}
      <button class="btn primary" data-act="sync-on" style="justify-self:start">${ico('sync')} Collega e sincronizza</button>
    `}
  </section>
  <section class="card sec">
    <h2>Backup su file</h2>
    <p class="muted" style="margin:0;font-size:15px">Una copia di tutto (parole, livelli, progressi di grammatica) in un file nella cartella Download. Importandolo, i dati vengono uniti a quelli presenti: non si perde niente. Ultimo backup: <b>${esc(ago(S.lastBackup))}</b>.</p>
    <div class="row"><button class="btn" data-act="export">${ico('down')} Esporta backup</button><button class="btn" data-act="import-file">${ico('up')} Importa backup</button></div>
  </section>
  <section class="card sec">
    <h2>Pacchetto lezione</h2>
    <p class="muted" style="margin:0;font-size:15px">A fine sessione con Claude ricevi un blocco di testo con le parole nuove: incollalo qui.</p>
    <button class="btn" data-act="paste-pack" style="justify-self:start">${ico('paste')} Incolla pacchetto</button>
  </section>
  <section class="card sec">
    <h2>Aspetto</h2>
    <div class="seg theme-seg" role="group" aria-label="Tema">${[['system','Come il telefono'],['light','Chiaro'],['dark','Scuro']].map(([k,l])=>`<button data-theme-set="${k}" aria-pressed="${theme===k}">${l}</button>`).join('')}</div>
  </section>
  <section class="card sec">
    <h2>Informazioni</h2>
    <div class="muted" style="font-size:14px;display:grid;gap:4px">
      <div>Versione ${APP_VERSION} · ${live('words').length} parole · ${GRAMMAR.length} schede di grammatica</div>
      <div>Archivio ${S.persisted?'protetto: Android non lo cancella da solo':'non ancora protetto: installa l\'app sulla Home per renderlo persistente'}.</div>
      <div>Funziona offline dopo la prima apertura.</div>
    </div>
  </section>`;
}

/* ---------- form e fogli ---------- */
function sheet(html){ $('#layer').innerHTML = `<div class="scrim" data-act="close-sheet"><div class="sheet" role="dialog" aria-modal="true">${html}</div></div>`; const f = $('#layer input:not([type=hidden]), #layer textarea'); if(f) setTimeout(()=>f.focus(),60); }
function closeSheet(){ $('#layer').innerHTML=''; }
const fld = (id,label,val,type='text',ph='') => type==='textarea' ? `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" placeholder="${esc(ph)}">${esc(val)}</textarea></div>` : `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${esc(val)}" placeholder="${esc(ph)}" autocomplete="off"></div>`;
const sheetHead = t => `<div class="row" style="justify-content:space-between"><h2>${t}</h2><button class="icon-btn" data-act="close-sheet" aria-label="Chiudi">${ico('close')}</button></div>`;
const formBtns = `<div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-act="close-sheet">Annulla</button><button class="btn primary" type="submit">Salva</button></div>`;
function wordForm(w){
  w = w || {cat:'Parola', src:''};
  sheet(`<form id="wf" data-id="${w.id||''}" style="display:grid;gap:12px">${sheetHead(w.id?'Modifica parola':'Nuova parola')}
    ${fld('f-term','Inglese *',w.term,'text','es. follow up on')}
    ${fld('f-it','Italiano *',w.it,'text','es. dare seguito a')}
    ${fld('f-ex','Esempio d\'uso',w.ex,'text','I\'ll follow up on the quote tomorrow.')}
    <div class="field"><label for="f-cat">Categoria</label><select id="f-cat">${CATS.map(c=>`<option ${w.cat===c?'selected':''}>${c}</option>`).join('')}</select></div>
    ${fld('f-ipa','Pronuncia (IPA)',w.ipa,'text','es. /ˈwɒndə/')}
    ${fld('f-syn','Sinonimi / registro',w.syn,'text','es. worn out (informale), shattered (BrE)')}
    ${fld('f-note','Nota (uso, trappole)',w.note,'textarea')}
    ${fld('f-src','Fonte',w.src,'text','Lezione, film, lavoro…')}
    ${formBtns}</form>`);
}
function packForm(){
  sheet(`<form id="pf" style="display:grid;gap:12px">${sheetHead('Importa pacchetto')}
    <p class="muted" style="margin:0;font-size:15px">Incolla qui il blocco di parole che ti ho preparato a fine sessione. Prima di importare vedi cosa contiene.</p>
    <div class="field"><label for="p-text">Pacchetto</label><textarea id="p-text" style="min-height:160px;font:13px var(--mono)" placeholder='{"type":"myes-pack","words":[…]}'></textarea></div>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-act="close-sheet">Annulla</button><button class="btn primary" type="submit">Controlla</button></div></form>`);
}
function addMenu(){
  sheet(`${sheetHead('Aggiungi')}
    <div style="display:grid;gap:8px">
      <button class="opt" data-act="add-word">Una parola o espressione nel glossario</button>
      <button class="opt" data-act="paste-pack">Un pacchetto di parole preparato da Claude</button>
    </div>`);
}
function askDel(coll,id){
  const x = live(coll).find(o=>o.id===id); if(!x) return;
  const name = x.term;
  sheet(`${sheetHead('Eliminare?')}<p style="margin:0">Stai per eliminare <b>${esc(name)}</b>. Non si può annullare.</p>
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-act="close-sheet">Annulla</button><button class="btn danger" data-act="do-del" data-coll="${coll}" data-id="${id}">Elimina</button></div>`);
}
let toastT;
function toast(m){ clearTimeout(toastT); let t=$('.toast'); if(!t){ t=document.createElement('div'); t.className='toast'; t.setAttribute('role','status'); document.body.appendChild(t);} t.textContent=m; toastT=setTimeout(()=>t.remove(),2600); }

/* ---------- render ---------- */
function render(){
  if(!S.ready) return;
  $('#sidenav').innerHTML = navHTML(true);
  $('#tabbar').innerHTML = navHTML(false);
  const views = {oggi:vOggi, parole:vParole, ripasso:vRipasso, grammatica:vGrammatica, impostazioni:vImpostazioni};
  const active = document.activeElement; const keepId = active && (active.id==='q' || active.id==='tok') ? active.id : null;
  const pos = keepId ? active.selectionStart : 0; const tokVal = $('#tok') ? $('#tok').value : '';
  $('#view').innerHTML = (views[S.route]||vOggi)();
  if($('#tok') && tokVal) $('#tok').value = tokVal;
  if(keepId && $('#'+keepId)){ const q=$('#'+keepId); q.focus(); try{ q.setSelectionRange(pos,pos); }catch(e){} }
  $('#fab').style.display = (S.session||S.quiz||S.gq||S.route==='impostazioni'||S.route==='grammatica') ? 'none' : '';
  setSyncNote();
}

/* ---------- eventi ---------- */
document.addEventListener('click', async ev=>{
  const g = ev.target.closest('[data-go]');
  if(g){ S.session=null; S.quiz=null; S.gq=null; go(g.dataset.go); return; }
  const th = ev.target.closest('[data-theme-set]');
  if(th){ const v = th.dataset.themeSet; try{ if(v==='system') localStorage.removeItem('myes-theme'); else localStorage.setItem('myes-theme', v); }catch(e){} if(v==='system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', v); render(); return; }
  const c = ev.target.closest('[data-cat]'); if(c){ S.cat=c.dataset.cat; S.open=null; render(); return; }
  const a = ev.target.closest('[data-act]'); if(!a) return;
  const act = a.dataset.act, id = a.dataset.id;
  if(act==='close-sheet'){ if(ev.target===a || a.tagName==='BUTTON') closeSheet(); return; }
  switch(act){
    case 'toggle': S.open = S.open===id?null:id; render(); break;
    case 'speak': ev.stopPropagation(); speak(a.dataset.t); break;
    case 'star': { const w=live('words').find(x=>x.id===id); const {id:_,...r}=w; put('words',id,{...r,star:!w.star}); break; }
    case 'add-word': closeSheet(); wordForm(); break;
    case 'edit-word': wordForm(live('words').find(x=>x.id===id)); break;
    case 'paste-pack': closeSheet(); packForm(); break;
    case 'pack-confirm': confirmPack(); break;
    case 'ask-del': askDel(a.dataset.coll, id); break;
    case 'do-del': closeSheet(); del(a.dataset.coll, id); toast('Eliminato'); break;
    case 'start-review': S.quiz=null; S.gq=null; startReview(false); if(S.route!=='ripasso') go('ripasso'); break;
    case 'start-reverse': S.quiz=null; S.gq=null; startReview(true); break;
    case 'start-quiz': S.session=null; S.gq=null; startQuiz(); if(S.route!=='ripasso') go('ripasso'); break;
    case 'flip': if(S.session && !S.session.flipped){ S.session.flipped=true; render(); } break;
    case 'grade': grade(a.dataset.ok==='1'); break;
    case 'end-session': S.session=null; render(); doSync(false); break;
    case 'pick': { const q=S.quiz.qs[S.quiz.i]; if(q.pick) break; q.pick=id; if(id===q.w.id) S.quiz.score++; render(); break; }
    case 'next-q': S.quiz.i++; if(S.quiz.i>=S.quiz.qs.length) markDay(); render(); break;
    case 'end-quiz': S.quiz=null; render(); break;
    case 'topic': S.gTopic=id; render(); $('main').scrollTop=0; window.scrollTo(0,0); break;
    case 'topics': S.gTopic=null; render(); break;
    case 'reveal': S.reveal[a.dataset.k]=true; render(); break;
    case 'g-start': startGrammar(id); break;
    case 'g-show': S.gq.shown=true; render(); break;
    case 'g-grade': gradeG(a.dataset.ok==='1'); break;
    case 'g-end': S.gq=null; render(); doSync(false); break;
    case 'topic-open': S.gq=null; S.gTopic=id; go('grammatica'); setTimeout(()=>{ S.gTopic=id; render(); window.scrollTo(0,0); $('main').scrollTop=0; },0); break;
    case 'export': exportBackup(); break;
    case 'import-file': $('#file-in').click(); break;
    case 'sync-on': { const t = ($('#tok')?.value||'').trim(); if(!/^(ghp_|github_pat_)/.test(t)){ toast('Incolla il token: inizia con ghp_ oppure github_pat_'); break; } connectSync(t); break; }
    case 'sync-now': doSync(true); break;
    case 'sync-off': disconnectSync(); break;
  }
});
$('#file-in').addEventListener('change', async ev=>{ const f = ev.target.files[0]; if(!f) return; const t = await f.text(); ev.target.value=''; importBackup(t); });
document.addEventListener('submit', ev=>{
  ev.preventDefault(); const f = ev.target; const v = id => ($('#'+id)?.value||'').trim();
  if(f.id==='wf'){
    if(!v('f-term')||!v('f-it')){ toast('Inglese e italiano sono obbligatori'); return; }
    const old = live('words').find(x=>x.id===f.dataset.id);
    const id = old?old.id:uid('w'); const base = old?(({id:_,...r})=>r)(old):{box:0,due:'',created:Date.now(),star:false};
    put('words', id, {...base, term:v('f-term'), it:v('f-it'), ex:v('f-ex'), cat:v('f-cat'), ipa:v('f-ipa'), syn:v('f-syn'), note:v('f-note'), src:v('f-src')});
    closeSheet(); toast(old?'Parola aggiornata':'Parola aggiunta al glossario');
  }
  if(f.id==='pf'){
    const r = parsePack(v('p-text'));
    if(r.error){ toast(r.error); return; }
    openPackPreview(r.pack);
  }
});
document.addEventListener('input', ev=>{
  if(ev.target.id==='q'){ S.q = ev.target.value; S.open=null; $('#wordlist').innerHTML = wordListHTML(filteredWords()); }
});
document.addEventListener('change', ev=>{ if(ev.target.id==='sort'){ S.sort=ev.target.value; render(); } });
document.addEventListener('keydown', ev=>{
  if(ev.key==='Escape' && $('#layer').innerHTML){ closeSheet(); return; }
  if(S.route==='ripasso' && S.gq && !$('#layer').innerHTML && !ev.target.matches('input,textarea,select') && S.gq.i<S.gq.items.length){
    if(ev.key===' '||ev.key==='Enter'){ ev.preventDefault(); if(!S.gq.shown){ S.gq.shown=true; render(); } return; }
    if(S.gq.shown && (ev.key==='1'||ev.key==='ArrowLeft')){ gradeG(false); return; }
    if(S.gq.shown && (ev.key==='2'||ev.key==='ArrowRight')){ gradeG(true); return; }
  }
  if(S.route!=='ripasso' || !S.session || $('#layer').innerHTML) return;
  if(ev.target.matches('input,textarea,select')) return;
  if(ev.key===' '||ev.key==='Enter'){ ev.preventDefault(); if(!S.session.flipped){ S.session.flipped=true; render(); } }
  else if(S.session.flipped && (ev.key==='1'||ev.key==='ArrowLeft')) grade(false);
  else if(S.session.flipped && (ev.key==='2'||ev.key==='ArrowRight')) grade(true);
});
$('#fab').addEventListener('click', addMenu);
window.addEventListener('offline', ()=>{ if(S.route==='oggi') render(); });

/* ---------- aggiornamenti (service worker) ---------- */
function showUpdate(reg){
  if($('.update')) return;
  const d = document.createElement('div'); d.className='update'; d.setAttribute('role','status');
  d.innerHTML = '<span style="flex:1">È disponibile una nuova versione dell\'app.</span><button class="btn sm">Aggiorna</button>';
  d.querySelector('button').onclick = () => { if(reg.waiting) reg.waiting.postMessage('skip-waiting'); else location.reload(); };
  document.body.appendChild(d);
}
if('serviceWorker' in navigator){
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', ()=>{ if(reloading) return; reloading = true; location.reload(); });
  window.addEventListener('load', async ()=>{
    try{
      const reg = await navigator.serviceWorker.register('sw.js');
      if(reg.waiting && navigator.serviceWorker.controller) showUpdate(reg);
      reg.addEventListener('updatefound', ()=>{ const nw = reg.installing; nw && nw.addEventListener('statechange', ()=>{ if(nw.state==='installed' && navigator.serviceWorker.controller) showUpdate(reg); }); });
      setInterval(()=>reg.update().catch(()=>{}), 60*60*1000);
    }catch(e){}
  });
}

/* ---------- avvio ---------- */
(async function(){
  const h = location.hash.slice(1); if(ALL_ROUTES.includes(h)) S.route = h;
  try{ speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = ()=>{}; }catch(e){}
  try{ await loadAll(); }
  catch(e){ $('#view').innerHTML = `<div class="card"><h2>Archivio non disponibile</h2><p class="muted">Il browser non permette di salvare dati (forse sei in navigazione in incognito). Apri l'app normalmente da Chrome.</p></div>`; return; }
  S.ready = true; render();
  if(S.sync.token) doSync(false);
})();
