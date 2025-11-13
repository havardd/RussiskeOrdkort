  // Innstillinger-meny toggle
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsPanel = document.getElementById('settingsPanel');
  if (settingsToggle && settingsPanel) {
    settingsToggle.addEventListener('click', () => {
      const isOpen = !settingsPanel.hasAttribute('hidden');
      if (isOpen) {
        settingsPanel.setAttribute('hidden', '');
      } else {
        settingsPanel.removeAttribute('hidden');
      }
    });
  }
  // Slett cache og last inn nyeste versjon
  document.getElementById('btnClearCache').addEventListener('click', async function() {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    // Tøm localStorage hvis ønskelig (valgfritt)
    // localStorage.clear();
    location.reload(true);
  });
// --- App JS fra russisk_ordkort_v4_pwa.html ---
import { WORDS_RU } from './russisk.js';
import { WORDS_HTML } from './html.js';
import { WORDS_TALL } from './tall.js';
import { WORDS_ALFABET } from './alfabet.js';
(function(){
  // Service worker registration will be handled in HTML.

  // Språkvalg
  const LANGUAGES = {
    russisk: WORDS_RU,
    html: WORDS_HTML,
    tall: WORDS_TALL,
    alfabet: WORDS_ALFABET
  };
  let currentLanguage = 'russisk';

  function getDefaultWords() {
    let arr = LANGUAGES[currentLanguage] || [];
    const shuffleBox = document.getElementById('shuffleWords');
    if (shuffleBox && shuffleBox.checked) {
      arr = arr.slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    return arr;
  }

  const STORAGE_WORDS = "ordkort:words";
  let WORDS = [];
  let shuffledWords = [];
  try { WORDS = JSON.parse(localStorage.getItem(STORAGE_WORDS) || '[]'); } catch(e){ WORDS = []; }
  if (!Array.isArray(WORDS) || WORDS.length === 0) WORDS = getDefaultWords().slice();

  // DOM elements
  const card = document.getElementById("card");
  const ru = document.getElementById("ru");
  const pron = document.getElementById("pron");
  const noEl = document.getElementById("no");
  const enEl = document.getElementById("en");
  const btnFlip = document.getElementById("btnFlip");
  const btnNew = document.getElementById("btnNew");
  const btnSpeak = document.getElementById("btnSpeak");
  const voiceSelect = document.getElementById("voiceSelect");
  const btnSystem = document.getElementById("themeSystem");
  const btnLight  = document.getElementById("themeLight");
  const btnDark   = document.getElementById("themeDark");
  const chkAuto = document.getElementById("autoSpeak");
  const btnEditor = document.getElementById("btnEditor");

  let lastIndex = -1, flipped = false;
  let orderedIndex = 0;

  function pickIndex(first = false){
    const shuffleBox = document.getElementById('shuffleWords');
    const arr = (shuffleBox && shuffleBox.checked) ? shuffledWords : WORDS;
    if (!arr.length) return -1;
    if (shuffleBox && shuffleBox.checked) {
      // Shuffle: tilfeldig
      let i = Math.floor(Math.random() * arr.length);
      if (arr.length > 1 && i === lastIndex) i = (i + 1) % arr.length;
      return i;
    } else {
      // Ikke shuffle: sekvensiell
      if (first) {
        return 0;
      } else {
        orderedIndex = (orderedIndex + 1) % arr.length;
        return orderedIndex;
      }
    }
  }
  function setCard(w){
    ru.textContent = w.ru || '—';
    pron.textContent = "uttale: " + (w.pron || '—');
    var norskFront = document.getElementById('norskFront');
    // Hvis alfabet-språk, vis spesialfelt
    if (currentLanguage === 'alfabet') {
      // Forside: bokstav og norsk kobling
      norskFront.textContent = w.no || '—';
      // Bakside: eksempelord, norsk oversettelse, uttale, tall
      noEl.textContent = w.word ? (w.word + (w.pron ? ' [' + w.pron + ']': '')) : '—';
      enEl.textContent = (w.word_no || '—') + (w.number ? ' | Tall: ' + w.number : '');
    } else {
      // Standard visning
      norskFront.textContent = w.no || '—';
      noEl.textContent = w.no || '—';
      enEl.textContent = '';
    }
  }
  function setFlipped(v){ flipped=v; card.classList.toggle("is-flipped", flipped); card.setAttribute("aria-pressed", String(flipped)); }
  function toggleFlip(){
    setFlipped(!flipped);
    if (lastIndex >= 0 && WORDS[lastIndex]) setCard(WORDS[lastIndex]);
  }
  function newWord(first = false){
    const shuffleBox = document.getElementById('shuffleWords');
    const arr = LANGUAGES[currentLanguage] || [];
    if (shuffleBox && shuffleBox.checked) {
      // Bland ord kun i shuffledWords
      shuffledWords = arr.slice();
      for (let i = shuffledWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
      }
    } else {
      WORDS = arr.slice();
      if (first) orderedIndex = 0;
    }
    const i = pickIndex(first);
    if (i < 0) return;
    const useArr = (shuffleBox && shuffleBox.checked) ? shuffledWords : WORDS;
    lastIndex = i;
    setCard(useArr[i]);
    setFlipped(false);
    if (chkAuto && chkAuto.checked) speak();
  }

  let startX=0,startY=0;
  card.addEventListener("touchstart", e=>{ const t=e.changedTouches[0]; startX=t.clientX; startY=t.clientY; }, {passive:true});
  card.addEventListener("touchend", e=>{ const t=e.changedTouches[0]; const dx=t.clientX-startX; const dy=t.clientY-startY; const isSwipe=Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy); if(isSwipe) newWord(); else toggleFlip(); }, {passive:true});
  card.addEventListener("click", toggleFlip);

  window.addEventListener("keydown", (e)=>{
    const tag=(e.target&&e.target.tagName)||"";
    if(["INPUT","TEXTAREA","SELECT"].includes(tag)) return;
    // Enter for nytt ord
    if(e.key === "Enter") { newWord(); e.preventDefault(); return; }
    // Space for flip
    if(e.code === "Space" || e.key === " ") { toggleFlip(); e.preventDefault(); return; }
    // Venstre Shift for les opp
    if(e.key === "Shift" && e.location === 1) { speak(); e.preventDefault(); return; }
    // Tema
    const k=(e.key||"").toLowerCase();
    if(k==="l") setTheme("light");
    if(k==="m") setTheme("dark");
    if(k==="s") setTheme("system");
  });

  const STORAGE_THEME="ordkort:theme";
  function setTheme(mode){ const html=document.documentElement; if (mode==="system") html.removeAttribute("data-theme"); else html.setAttribute("data-theme", mode);
    btnSystem.setAttribute("aria-pressed", String(mode==="system")); btnLight.setAttribute("aria-pressed", String(mode==="light")); btnDark.setAttribute("aria-pressed", String(mode==="dark"));
    try{ localStorage.setItem(STORAGE_THEME, mode); }catch(e){} }
  (function initTheme(){ let mode="dark"; try{ mode=localStorage.getItem(STORAGE_THEME)||"dark"; }catch(e){} setTheme(mode); })();
  btnSystem.addEventListener("click", ()=> setTheme("system"));
  btnLight.addEventListener("click",  ()=> setTheme("light"));
  btnDark.addEventListener("click",   ()=> setTheme("dark"));

  const synth = window.speechSynthesis;
  const STORAGE_VOICE = "ordkort:voice";
  let voices = [];
  function populateVoices(){
    if (!('speechSynthesis' in window)) { voiceSelect.innerHTML = "<option>Opplesning ikke støttet</option>"; return; }
    voices = synth.getVoices() || [];
    // Russisk stemmer
    const ruVoices = voices.filter(v => (v.lang||"").toLowerCase().startsWith("ru"));
    const listRu = ruVoices.length ? ruVoices : voices;
    voiceSelect.innerHTML = "";
    listRu.forEach(v => { const opt=document.createElement("option"); opt.value=v.name; opt.textContent=(v.lang?`[${v.lang}] `:"")+v.name; voiceSelect.appendChild(opt); });
    let savedRu=null; try{ savedRu=localStorage.getItem(STORAGE_VOICE); }catch(e){}
    if (savedRu && Array.from(voiceSelect.options).some(o=>o.value===savedRu)) voiceSelect.value=savedRu;
    else if (ruVoices.length) voiceSelect.value=ruVoices[0].name;

    // Norsk stemmer
    const noVoices = voices.filter(v => (v.lang||"").toLowerCase().startsWith("no"));
    const listNo = noVoices.length ? noVoices : voices.filter(v => (v.lang||"").toLowerCase().includes("no"));
    const voiceSelectNo = document.getElementById("voiceSelectNo");
    voiceSelectNo.innerHTML = "";
    listNo.forEach(v => { const opt=document.createElement("option"); opt.value=v.name; opt.textContent=(v.lang?`[${v.lang}] `:"")+v.name; voiceSelectNo.appendChild(opt); });
    let savedNo=null; try{ savedNo=localStorage.getItem("ordkort:voiceNo"); }catch(e){}
    if (savedNo && Array.from(voiceSelectNo.options).some(o=>o.value===savedNo)) voiceSelectNo.value=savedNo;
    else if (listNo.length) voiceSelectNo.value=listNo[0].name;
  }
  if (typeof speechSynthesis!=="undefined") speechSynthesis.onvoiceschanged = populateVoices;
  populateVoices();
  function speak(){
    if (!('speechSynthesis' in window)) { alert("Opplesning støttes ikke i denne nettleseren."); return; }
    synth.cancel();
    // Russisk først
    const uRu = new SpeechSynthesisUtterance(ru.textContent);
    uRu.lang = "ru-RU"; uRu.rate = 0.95; uRu.pitch = 1.0;
    const chosenRu = voiceSelect.value; const vRu=(voices||[]).find(v=>v.name===chosenRu); if (vRu) uRu.voice = vRu;
    synth.speak(uRu);
    // Norsk etter 2 sekunder
    setTimeout(() => {
      const uNo = new SpeechSynthesisUtterance(noEl.textContent);
      uNo.lang = "no-NO"; uNo.rate = 1.0; uNo.pitch = 1.0;
      const voiceSelectNo = document.getElementById("voiceSelectNo");
      const chosenNo = voiceSelectNo.value; const vNo=(voices||[]).find(v=>v.name===chosenNo); if (vNo) uNo.voice = vNo;
      synth.speak(uNo);
    }, 2000);
  }
  btnSpeak.addEventListener("click", speak);
  voiceSelect.addEventListener("change", ()=>{ try{ localStorage.setItem(STORAGE_VOICE, voiceSelect.value); }catch(e){} });
  document.getElementById("voiceSelectNo").addEventListener("change", ()=>{ try{ localStorage.setItem("ordkort:voiceNo", document.getElementById("voiceSelectNo").value); }catch(e){} });

  (function initAuto(){ let saved="true"; try{ saved=localStorage.getItem("ordkort:auto")||"true"; }catch(e){} const on=(saved==="true"); const chk=document.getElementById("autoSpeak"); chk.checked=on; chk.setAttribute("aria-checked", String(on)); })();
  document.getElementById("autoSpeak").addEventListener("change", (e)=>{ const on=e.target.checked; e.target.setAttribute("aria-checked", String(on)); try{ localStorage.setItem("ordkort:auto", String(on)); }catch(e){} });

  const editor = document.getElementById("editor");
  const tableBody = document.getElementById("tableBody");
  const addRowBtn = document.getElementById("addRow");
  const filePicker = document.getElementById("filePicker");
  const importJSONBtn = document.getElementById("importJSON");
  const importCSVBtn = document.getElementById("importCSV");
  const exportJSONBtn = document.getElementById("exportJSON");
  const exportCSVBtn = document.getElementById("exportCSV");
  const loadLocalBtn = document.getElementById("loadLocal");
  const resetDefaultsBtn = document.getElementById("resetDefaults");
  const saveLocalBtn = document.getElementById("saveLocal");
  const closeEditorBtn = document.getElementById("closeEditor");

  function openEditor(){ renderTable(); if (typeof editor.showModal === "function") editor.showModal(); else editor.setAttribute("open",""); }
  function closeEditor(){ if (typeof editor.close === "function") editor.close(); else editor.removeAttribute("open"); }
  btnEditor.addEventListener("click", openEditor);
  closeEditorBtn.addEventListener("click", closeEditor);

  function renderTable(){
    tableBody.innerHTML = "";
    WORDS.forEach((w, idx) => {
      const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><input data-idx="${idx}" data-key="ru"   value="${w.ru || ""}"></td>
          <td><input data-idx="${idx}" data-key="pron" value="${w.pron || ""}"></td>
          <td><input data-idx="${idx}" data-key="no"   value="${w.no || ""}"></td>
          <td><input data-idx="${idx}" data-key="en"   value="${w.en || ""}"></td>
          <td class="row-actions"><button data-action="del" data-idx="${idx}">Slett</button></td>
        `;
      tableBody.appendChild(tr);
    });
  }

  tableBody.addEventListener("input", (e)=>{ const t=e.target; if (t.tagName!=="INPUT") return; const idx=+t.getAttribute("data-idx"); const key=t.getAttribute("data-key"); if (!WORDS[idx]) return; WORDS[idx][key]=t.value; });
  tableBody.addEventListener("click", (e)=>{ const btn=e.target.closest("button[data-action='del']"); if (!btn) return; const idx=+btn.getAttribute("data-idx"); WORDS.splice(idx,1); renderTable(); });
  addRowBtn.addEventListener("click", ()=>{ WORDS.push({ru:"", pron:"", no:"", en:""}); renderTable(); });

  importJSONBtn.addEventListener("click", ()=>{ filePicker.accept=".json,application/json"; filePicker.click(); filePicker.onchange=()=> handleFile("json"); });
  importCSVBtn.addEventListener("click", ()=>{ filePicker.accept=".csv,text/csv"; filePicker.click(); filePicker.onchange=()=> handleFile("csv"); });

  function handleFile(kind){
    const f = filePicker.files && filePicker.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (kind === "json") {
          const arr = JSON.parse(reader.result);
          if (Array.isArray(arr)) WORDS = sanitizeWords(arr);
        } else {
          WORDS = parseCSV(reader.result);
        }
        renderTable();
      } catch (err) {
        alert("Kunne ikke lese filen: " + err.message);
      }
      filePicker.value = "";
    };
    reader.readAsText(f, "utf-8");
  }

  function sanitizeWords(arr){ return arr.map(x => ({ ru: x.ru||"", pron: x.pron||"", no: x.no||"", en: x.en||"" })); }
  function parseCSV(text){
    const lines = text.split(/\r?\n/).filter(l => l.trim().length);
    if (!lines.length) return [];
    const head = lines[0].split(",").map(h => h.trim().toLowerCase());
    const idx = {};
    ["ru","pron","no","en"].forEach(k => idx[k] = head.indexOf(k));
    const out = [];
    for (let i=1;i<lines.length;i++){ const cols = splitCSVLine(lines[i]); out.push({ ru: take(cols, idx.ru), pron: take(cols, idx.pron), no: take(cols, idx.no), en: take(cols, idx.en) }); }
    return out;
  }
  function take(cols, i){ return (i>=0 && i<cols.length) ? cols[i] : ""; }
  function splitCSVLine(line){ const res=[], re=/\s*(?:"([^"]*)"|([^,]*))\s*(?:,|$)/g; let m; while ((m=re.exec(line))){ res.push(m[1]!==undefined?m[1]:m[2]); } return res; }

  exportJSONBtn.addEventListener("click", ()=> downloadFile("ordliste.json", JSON.stringify(WORDS, null, 2)));
  exportCSVBtn.addEventListener("click", ()=> downloadFile("ordliste.csv", toCSV(WORDS)));
  function toCSV(arr){ const head=["ru","pron","no","en"]; const rows=[head.join(",")]; arr.forEach(o=>rows.push(head.map(k=>csvEscape(o[k]||"")).join(","))); return rows.join("\n"); }
  function csvEscape(v){ const s=String(v).replace(/"/g,'""'); return /[",\n]/.test(s) ? '"' + s + '"' : s; }
  function downloadFile(name, content){ const blob=new Blob([content], {type: "text/plain;charset=utf-8"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1000); }

  document.getElementById("loadLocal").addEventListener("click", ()=>{
    try{ const v=JSON.parse(localStorage.getItem(STORAGE_WORDS)||"[]"); if (Array.isArray(v) && v.length) { WORDS=sanitizeWords(v); renderTable(); alert("Lastet fra lokal lagring."); } else alert("Fant ingen lagret liste."); }catch(e){ alert("Kunne ikke lese lokal lagring."); }
  });
  document.getElementById("resetDefaults").addEventListener("click", ()=>{ WORDS = DEFAULT_WORDS.slice(); renderTable(); });
  document.getElementById("saveLocal").addEventListener("click", ()=>{
    try{ localStorage.setItem(STORAGE_WORDS, JSON.stringify(WORDS)); alert("Lagret til lokal lagring."); }catch(e){ alert("Kunne ikke lagre."); }
  });

  editor.addEventListener("close", ()=>{ newWord(); });
  newWord(true);

  // Eksempel på språkbytte (legg til en enkel språkvelger hvis ønsket)
  window.setLanguage = function(lang) {
    if (LANGUAGES[lang]) {
      currentLanguage = lang;
      const shuffleBox = document.getElementById('shuffleWords');
      const arr = LANGUAGES[lang] || [];
      if (shuffleBox && shuffleBox.checked) {
        shuffledWords = arr.slice();
        for (let i = shuffledWords.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
        }
      } else {
        WORDS = arr.slice();
        orderedIndex = 0;
      }
      if (typeof renderTable === 'function') renderTable();
      if (typeof newWord === 'function') newWord(true);
    }
  };
  // Oppdater ordlisten når shuffle-boksen endres
  const shuffleBox = document.getElementById('shuffleWords');
  if (shuffleBox) {
    shuffleBox.addEventListener('change', function() {
      window.setLanguage(currentLanguage);
    });
  }

  // Legg til visuell språkvelger
  const languageSelect = document.createElement('select');
  languageSelect.id = 'languageSelect';
  languageSelect.style.margin = '0 1em 0 0';
  languageSelect.style.fontSize = '1em';
  languageSelect.style.borderRadius = '8px';
  languageSelect.style.padding = '0.5em 1em';
  languageSelect.style.border = '1px solid var(--border)';
  languageSelect.setAttribute('aria-label', 'Velg språk');
  languageSelect.innerHTML = '<option value="russisk">Russisk</option><option value="html">HTML</option><option value="tall">Russiske tall</option><option value="alfabet">Russisk alfabet</option>';
  const controlbar = document.querySelector('.controlbar');
  if (controlbar) controlbar.insertBefore(languageSelect, controlbar.firstChild);
  languageSelect.addEventListener('change', function() {
    window.setLanguage(this.value);
  });

})();
