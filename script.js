  // ...eksisterende kode...

  // Etter setCard:
  // NB: wordIndex skal kun deklareres én gang her!
  // Fjernet duplikat, behold kun én deklarasjon etter setCard
  function showPrevCard() {
    const arr = LANGUAGES[currentLanguage] || [];
    if (!arr.length) return;
    wordIndex = (wordIndex - 1 + arr.length) % arr.length;
    setCard(arr[wordIndex]);
  }
  function showNextCard() {
    const arr = LANGUAGES[currentLanguage] || [];
    if (!arr.length) return;
    wordIndex = (wordIndex + 1) % arr.length;
    setCard(arr[wordIndex]);
  }
  let wordIndex = 0;
  // ...eksisterende kode...

  // Flytt tastaturlisten hit, etter setCard er definert
  document.addEventListener('keydown', function(e) {
    // Ignorer hvis input, textarea eller dialog har fokus
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable) return;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // Bla i ordlisten, samme som sveip
      const arr = LANGUAGES[currentLanguage] || [];
      if (!arr.length) return;
      if (e.key === 'ArrowRight') {
        wordIndex = (wordIndex + 1) % arr.length;
      } else {
        wordIndex = (wordIndex - 1 + arr.length) % arr.length;
      }
      setCard(arr[wordIndex]);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      // Vis baksiden
      const card = document.getElementById('card');
      if (card && !card.classList.contains('flipped')) card.classList.add('flipped');
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      // Vis forsiden
      const card = document.getElementById('card');
      if (card && card.classList.contains('flipped')) card.classList.remove('flipped');
      e.preventDefault();
    } else if (e.key === ' ') {
      // Space: Start/stopp studiemodus
      const studyModeBtn = document.getElementById('studyModeBtn');
      if (studyModeBtn) studyModeBtn.click();
      e.preventDefault();
    } else if (e.key === 'Enter') {
      // Enter: Les opp ordene på gjeldende side
      const card = document.getElementById('card');
      if (card && card.classList.contains('flipped')) {
        // Baksiden
        const ru = document.getElementById('no');
        const no = document.getElementById('en');
        if (ru && no) {
          speakWord(ru.textContent, 'ru', function() {
            speakWord(no.textContent, 'no');
          });
        }
      } else {
        // Forsiden
        const ru = document.getElementById('ru');
        const no = document.getElementById('norskFront');
        if (ru && no) {
          speakWord(ru.textContent, 'ru', function() {
            speakWord(no.textContent, 'no');
          });
        }
      }
      e.preventDefault();
    }
  });
  // RENDER TABLE: Oppdaterer editor-tabellen og ordlisten
  function renderTable() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    WORDS.forEach((w, i) => {
      const tr = document.createElement('tr');
      ['ru', 'pron', 'no', 'en'].forEach(key => {
        const td = document.createElement('td');
        td.contentEditable = true;
        td.textContent = w[key] || '';
        td.addEventListener('input', e => {
          WORDS[i][key] = td.textContent;
        });
        tr.appendChild(td);
      });
      // Handling: Slett rad
      const tdAction = document.createElement('td');
      const btnDel = document.createElement('button');
      btnDel.textContent = '🗑️';
      btnDel.className = 'btn';
      btnDel.addEventListener('click', () => {
        WORDS.splice(i, 1);
        renderTable();
      });
      tdAction.appendChild(btnDel);
      tr.appendChild(tdAction);
      tbody.appendChild(tr);
    });
  }
// (Flyttet til DOMContentLoaded)
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
      // Tøm localStorage
      localStorage.clear();
    location.reload(true);
  });
// --- App JS fra russisk_ordkort_v4_pwa.html ---
// Dynamically load language data from JSON files
const LANGUAGES = {};
let currentLanguage = 'russisk';

async function loadLanguageData() {
  const files = {
    russisk: 'russisk.json',
    html: 'html.json',
    tall: 'tall.json',
    alfabet: 'alfabet.json'
  };
  return Promise.all(Object.entries(files).map(async ([key, file]) => {
    try {
      const res = await fetch(file);
      LANGUAGES[key] = await res.json();
    } catch (e) {
      LANGUAGES[key] = [];
    }
  }));
}

// Wait for language data before starting app logic
document.addEventListener('DOMContentLoaded', () => {
    // Lukk editoren når Lukk-knappen trykkes
    const closeEditorBtn = document.getElementById('closeEditor');
    const editorDialog = document.getElementById('editor');
    if (closeEditorBtn && editorDialog) {
      closeEditorBtn.addEventListener('click', () => {
        editorDialog.close();
      });
    }
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsPanel = document.getElementById('settingsPanel');
  if (!settingsToggle) console.error('Fant ikke settingsToggle!');
  if (!settingsPanel) console.error('Fant ikke settingsPanel!');
  if (settingsToggle && settingsPanel) {
    settingsPanel.setAttribute('hidden', '');
    settingsToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (settingsPanel.hasAttribute('hidden')) {
        settingsPanel.removeAttribute('hidden');
      } else {
        settingsPanel.setAttribute('hidden', '');
      }
    });
    document.addEventListener('click', function(e) {
      if (!settingsPanel.hasAttribute('hidden') && !settingsPanel.contains(e.target) && e.target !== settingsToggle) {
        settingsPanel.setAttribute('hidden', '');
      }
    });
  }

  // Legg til event listeners for tale-knappene på kortet
  const btnSpeakRu = document.getElementById('btnSpeakRu');
  const btnSpeakNo = document.getElementById('btnSpeakNo');
  const ruEl = document.getElementById('ru');
  const norskFrontEl = document.getElementById('norskFront');
  if (btnSpeakRu && ruEl) {
    btnSpeakRu.addEventListener('click', function(e) {
      e.stopPropagation();
      speakWord(ruEl.textContent, 'ru');
    });
  }
  if (btnSpeakNo && norskFrontEl) {
    btnSpeakNo.addEventListener('click', function(e) {
      e.stopPropagation();
      speakWord(norskFrontEl.textContent, 'no');
    });
  }
});

;(async function() {
  // Skjul controlbar som standard
  const controlbar = document.querySelector('.controlbar');
  if (controlbar) controlbar.setAttribute('hidden', '');

  // --- TEMA ---
  // Sett mørkt som standard
  document.documentElement.setAttribute('data-theme', 'dark');
  // Tema-knapper
  const themeSystem = document.getElementById('themeSystem');
  const themeLight = document.getElementById('themeLight');
  const themeDark = document.getElementById('themeDark');
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ordkort:theme', theme);
    // Oppdater radioknappene
    themeSystem.checked = theme === 'system';
    themeLight.checked = theme === 'light';
    themeDark.checked = theme === 'dark';
  }
  [themeSystem, themeLight, themeDark].forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (radio.checked) setTheme(radio.value);
    });
  });
  // Last valgt tema, ellers mørkt som standard
  const savedTheme = localStorage.getItem('ordkort:theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    setTheme('dark');
  }

  // --- TALESYNTESE ---
  // Vis labels og nedtrekk
  const voiceSelect = document.getElementById('voiceSelect');
  const voiceSelectNo = document.getElementById('voiceSelectNo');
  function populateVoices() {
    const voices = window.speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    voiceSelectNo.innerHTML = '';
    voices.forEach(v => {
      if (v.lang.startsWith('ru')) {
        const opt = document.createElement('option');
        opt.value = v.name;
        opt.textContent = v.name + ' (' + v.lang + ')';
        voiceSelect.appendChild(opt);
      }
      if (v.lang.startsWith('nb') || v.lang.startsWith('no')) {
        const opt = document.createElement('option');
        opt.value = v.name;
        opt.textContent = v.name + ' (' + v.lang + ')';
        voiceSelectNo.appendChild(opt);
      }
    });
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = populateVoices;
    populateVoices();
  }

  // --- REDIGER-KNAPP ---
  const btnEditor = document.getElementById('btnEditor');
  const editor = document.getElementById('editor');
  if (btnEditor && editor) {
    btnEditor.addEventListener('click', () => {
      editor.showModal();
    });
  }

  // --- LES OPP-KNAPP ---
  const btnSpeak = document.getElementById('btnSpeak');
  btnSpeak.addEventListener('click', () => {
    const w = WORDS && WORDS.length ? WORDS[Math.floor(Math.random() * WORDS.length)] : null;
    if (!w) return;
    const readFirst = localStorage.getItem('ordkort:readFirst') || 'ru';
    if (readFirst === 'ru') {
      speakWord(w.ru, 'ru', () => speakWord(w.no, 'no'));
    } else {
      speakWord(w.no, 'no', () => speakWord(w.ru, 'ru'));
    }
  });

  // --- ORDLISTE-BYTTE ---
  const languageSelect = document.getElementById('languageSelect');
  if (languageSelect) {
    languageSelect.addEventListener('change', function() {
      window.setLanguage(this.value);
    });
  }
  await loadLanguageData();
  // Definer alle DOM-elementer én gang
  const norskFront = document.getElementById('norskFront');
  const imgFront = document.getElementById('imgFront');
  const imgBack = document.getElementById('imgBack');
  const noEl = document.getElementById('no');
  const enEl = document.getElementById('en');
  const ru = document.getElementById('ru');
  const pron = document.getElementById('pron');
  function setCard(w){
    ru.textContent = w.ru || '—';
    pron.textContent = "uttale: " + (w.pron || '—');
    // Hvis alfabet-språk, vis spesialfelt og bilder
    if (currentLanguage === 'alfabet') {
      norskFront.textContent = w.no || '—';
      noEl.textContent = w.word ? (w.word + (w.pron ? ' [' + w.pron + ']': '')) : '—';
      enEl.textContent = (w.word_no || '—') + (w.number ? ' | Tall: ' + w.number : '');
      // Vis bilder hvis de finnes
      if (w.img_front) {
        imgFront.src = w.img_front;
        imgFront.alt = w.word || '';
        imgFront.style.display = '';
      } else {
        imgFront.src = '';
        imgFront.style.display = 'none';
      }
      if (w.img_back) {
        imgBack.src = w.img_back;
        imgBack.alt = w.word_no || '';
        imgBack.style.display = '';
      } else {
        imgBack.src = '';
        imgBack.style.display = 'none';
      }
    } else {
      norskFront.textContent = w.no || '—';
      noEl.textContent = w.no || '—';
      enEl.textContent = '';
      // Skjul bilder for andre språk
      if (imgFront) imgFront.style.display = 'none';
      if (imgBack) imgBack.style.display = 'none';
    }
    // Auto-opplesning
    const autoSpeak = document.getElementById('autoSpeak');
    if (autoSpeak && autoSpeak.checked) {
      const readFirst = localStorage.getItem('ordkort:readFirst') || 'ru';
      if (readFirst === 'ru') {
        speakWord(w.ru, 'ru', () => speakWord(w.no, 'no'));
      } else {
        speakWord(w.no, 'no', () => speakWord(w.ru, 'ru'));
      }
    }
  }
  // Service worker registration will be handled in HTML.

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

    // --- LES FØRST PÅ ---
    const readFirstRu = document.getElementById('readFirstRu');
    const readFirstNo = document.getElementById('readFirstNo');
    function setReadFirst(lang) {
      localStorage.setItem('ordkort:readFirst', lang);
      readFirstRu.checked = lang === 'ru';
      readFirstNo.checked = lang === 'no';
    }
    [readFirstRu, readFirstNo].forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) setReadFirst(radio.value);
      });
    });
    // Last valgt språk, ellers russisk som standard
    const savedReadFirst = localStorage.getItem('ordkort:readFirst');
    if (savedReadFirst) {
      setReadFirst(savedReadFirst);
    } else {
      setReadFirst('ru');
    }
  // ...existing code...
    // Studiemodus-innstilling
    const studyModeBox = document.getElementById('studyMode');
    const studyDelayInput = document.getElementById('studyDelay');
    const studyRepeatInput = document.getElementById('studyRepeatCount');
    let studyModeActive = false;
    let studyRepeatCount = studyRepeatInput ? parseInt(studyRepeatInput.value, 10) : 3;
    let studyDelay = studyDelayInput ? parseFloat(studyDelayInput.value) : 0.8;
    let studyCurrentRepeat = 0;
    let studyCurrentIndex = 0;
    let studyTimer = null;

    // Oppdater verdier ved endring
    if (studyRepeatInput) {
      studyRepeatInput.addEventListener('input', function() {
        studyRepeatCount = parseInt(this.value, 10) || 1;
      });
    }
    if (studyDelayInput) {
      studyDelayInput.addEventListener('input', function() {
        studyDelay = parseFloat(this.value) || 0.8;
      });
    }

    if (studyModeBox) {
      studyModeBox.addEventListener('change', function() {
        setStudyMode(studyModeBox.checked);
      });
    }

    // Synkroniser knapp og checkbox
    const studyModeBtn = document.getElementById('studyModeBtn');
    const studyModeBtnIcon = document.getElementById('studyModeBtnIcon');
    function updateStudyModeBtn() {
      if (studyModeActive) {
        studyModeBtnIcon.textContent = '⏹️';
        studyModeBtn.setAttribute('aria-label', 'Stopp studiemodus');
      } else {
        studyModeBtnIcon.textContent = '▶️';
        studyModeBtn.setAttribute('aria-label', 'Start studiemodus');
      }
    }
    function setStudyMode(active) {
      studyModeActive = !!active;
      if (studyModeBox) studyModeBox.checked = studyModeActive;
      updateStudyModeBtn();
      if (studyModeActive) {
        studyCurrentRepeat = 0;
        studyCurrentIndex = 0;
        startStudyMode();
      } else {
        stopStudyMode();
      }
    }

    if (studyModeBtn) {
      studyModeBtn.addEventListener('click', function() {
        setStudyMode(!studyModeActive);
      });
      updateStudyModeBtn();
    }

    function startStudyMode() {
      if (!WORDS.length) return;
      studyCurrentRepeat = 0;
      studyCurrentIndex = 0;
      showStudyWord();
    }

    function stopStudyMode() {
      if (studyTimer) {
        clearTimeout(studyTimer);
        studyTimer = null;
      }
    }

    function showStudyWord() {
      if (!WORDS.length) return;
      const w = WORDS[studyCurrentIndex];
      setCard(w);
      playStudyWord(w, 0);
    }

    function playStudyWord(w, repeat) {
      if (!studyModeActive) return;
      if (repeat >= studyRepeatCount) {
        studyCurrentIndex++;
        if (studyCurrentIndex >= WORDS.length) {
          studyCurrentIndex = 0; // Start på nytt
        }
        studyTimer = setTimeout(function() {
          if (studyModeActive) showStudyWord();
        }, studyDelay * 1000);
        return;
      }
      const readFirst = localStorage.getItem('ordkort:readFirst') || 'ru';
      if (readFirst === 'ru') {
        speakWord(w.ru, 'ru', function() {
          if (!studyModeActive) return;
          speakWord(w.no, 'no', function() {
            if (!studyModeActive) return;
            studyTimer = setTimeout(function() {
              if (studyModeActive) playStudyWord(w, repeat + 1);
            }, studyDelay * 1000);
          });
        });
      } else {
        speakWord(w.no, 'no', function() {
          if (!studyModeActive) return;
          speakWord(w.ru, 'ru', function() {
            if (!studyModeActive) return;
            studyTimer = setTimeout(function() {
              if (studyModeActive) playStudyWord(w, repeat + 1);
            }, studyDelay * 1000);
          });
        });
      }
    }

    window.speakWord = function(text, lang, cb) {
      if (!window.speechSynthesis || !text) { console.warn('Ingen talesyntese eller tekst'); cb && cb(); return; }
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;
      let voiceName = null;
      if (lang === 'ru') {
        const voiceSelect = document.getElementById('voiceSelect');
        voiceName = voiceSelect && voiceSelect.value;
        selectedVoice = voices.find(v => v.name === voiceName && v.lang.startsWith('ru'));
      } else {
        const voiceSelectNo = document.getElementById('voiceSelectNo');
        voiceName = voiceSelectNo && voiceSelectNo.value;
        selectedVoice = voices.find(v => v.name === voiceName && (v.lang.startsWith('nb') || v.lang.startsWith('no')));
      }
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === 'ru' ? 'ru-RU' : 'nb-NO';
      if (selectedVoice) {
        utter.voice = selectedVoice;
        console.log('Bruker valgt stemme:', selectedVoice.name, selectedVoice.lang);
      } else {
        console.warn('Fant ikke valgt stemme for', lang, 'Bruker standard:', utter.lang);
      }
      utter.onerror = function(e) { console.error('Talesyntese-feil:', e); };
      utter.onend = function() { cb && cb(); };
      window.speechSynthesis.speak(utter);
    }
  // Definer addRowBtn før bruk
  const addRowBtn = document.getElementById('addRow');
  if (addRowBtn) {
    addRowBtn.addEventListener("click", ()=>{ WORDS.push({ru:"", pron:"", no:"", en:""}); renderTable(); });
  }

  // Definer importJSONBtn og importCSVBtn før bruk
  const importJSONBtn = document.getElementById('importJSON');
  const importCSVBtn = document.getElementById('importCSV');
  const filePicker = document.getElementById('filePicker');
  if (importJSONBtn && filePicker) {
    importJSONBtn.addEventListener("click", ()=>{ filePicker.accept=".json,application/json"; filePicker.click(); filePicker.onchange=()=> handleFile("json"); });
  }
  if (importCSVBtn && filePicker) {
    importCSVBtn.addEventListener("click", ()=>{ filePicker.accept=".csv,text/csv"; filePicker.click(); filePicker.onchange=()=> handleFile("csv"); });
  }

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

  // Definer exportJSONBtn og exportCSVBtn før bruk
  const exportJSONBtn = document.getElementById('exportJSON');
  const exportCSVBtn = document.getElementById('exportCSV');
  if (exportJSONBtn) {
    exportJSONBtn.addEventListener("click", ()=> downloadFile("ordliste.json", JSON.stringify(WORDS, null, 2)));
  }
  if (exportCSVBtn) {
    exportCSVBtn.addEventListener("click", ()=> downloadFile("ordliste.csv", toCSV(WORDS)));
  }
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

  // Definer funksjonen newWord
  function newWord(force) {
    // Velg neste ord og oppdater kortet
    let arr = WORDS;
    if (!arr || !arr.length) arr = getDefaultWords();
    let idx = Math.floor(Math.random() * arr.length);
    setCard(arr[idx]);
  }
  editor.addEventListener("close", ()=>{ newWord(); });
  newWord(true);
  // Overstyr newWord hvis Studiemodus er aktiv
  function newWordStudyOverride() {
    if (studyModeActive) {
      showStudyWord();
      return;
    }
    newWord();
  }

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

  // --- SVEIP ---
  const card = document.getElementById('card');
  let touchStartX = null;
  let touchEndX = null;
  let touchStartY = null;
  let touchEndY = null;
  let wordIndex = 0;
  if (card) {
    card.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    });
    card.addEventListener('touchend', function(e) {
      if (touchStartX !== null && touchStartY !== null && e.changedTouches.length === 1) {
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        const shuffleBox = document.getElementById('shuffleWords');
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
          // Horisontal sveip: bla i ordlisten
          if (shuffleBox && !shuffleBox.checked) {
            const arr = LANGUAGES[currentLanguage] || [];
            if (!arr.length) return;
            if (dx > 0) {
              wordIndex = (wordIndex + 1) % arr.length;
            } else {
              wordIndex = (wordIndex - 1 + arr.length) % arr.length;
            }
            setCard(arr[wordIndex]);
          } else {
            newWord();
          }
        } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 40) {
          // Vertikal sveip: snu kortet
          if (dy < 0) {
            // Sveip opp: vis baksiden
            if (!card.classList.contains('flipped')) card.classList.add('flipped');
          } else {
            // Sveip ned: vis forsiden
            if (card.classList.contains('flipped')) card.classList.remove('flipped');
          }
        }
        touchStartX = null;
        touchEndX = null;
        touchStartY = null;
        touchEndY = null;
      }
    });
    // Klikk for å snu kortet
    card.addEventListener('click', function() {
      card.classList.toggle('flipped');
      // Oppdater aria-pressed og inert for tilgjengelighet
      const isFlipped = card.classList.contains('flipped');
      card.setAttribute('aria-pressed', isFlipped ? 'true' : 'false');
      document.getElementById('back').toggleAttribute('inert', !isFlipped);
      document.getElementById('front').toggleAttribute('inert', isFlipped);
    });
  }

  // ...eksisterende kode...

})();
