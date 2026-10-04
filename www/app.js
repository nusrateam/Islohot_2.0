// Islohot - Asosiy Dastur Mantiqi
// "Alloh roziligiga erishish uchun yangi harakat"

// Standart amallar (Excel fayldan olingan)
const DEFAULT_HABITS = [
  {
    id: 'tahajjud',
    title: 'Tahajjud',
    subtitle: 'Tungi namoz va munojot',
    category: 'ibodat',
    icon: 'moon',
    color: '#6366f1',
    description: "Kechasi uxlagandan so'ng turib o'qiladigan mustahab namoz."
  },
  {
    id: 'istigfor',
    title: "Istig'for",
    subtitle: "Tongda/kechda 100 tadan salovat, istig'for, tavhid va 1001 ta Ixlos",
    category: 'ibodat',
    icon: 'sparkles',
    color: '#059669',
    description: "Tongda va tunda 100 tadan salovat, istig'for, tavhid hamda 1001 ta Ixlos surasini o'qish."
  },
  {
    id: 'quron',
    title: "Qur'on",
    subtitle: "Kunlik tilovat va tafakkur",
    category: 'ibodat',
    icon: 'book-open',
    color: '#0d9488',
    description: "Kunlik Qur'oni Karim oyatlari tilovati va ma'nolarini o'rganish."
  },
  {
    id: 'mutolaa_ixyo',
    title: "Mutolaa (ixyo)",
    subtitle: "Imom G'azzoliy - Ihyou ulumiddin kitobi",
    category: 'ilm',
    icon: 'bookmark',
    color: '#d97706',
    description: "Qalblar tarbiyasi va Islom ilmlarini o'rganish bo'yicha mutolaa."
  },
  {
    id: 'mutolaa_badiiy',
    title: "Mutolaa (badiiy)",
    subtitle: "Badiiy va tarbiyaviy adabiyotlar mutolaasi",
    category: 'ilm',
    icon: 'book',
    color: '#ea580c',
    description: "Dunyoqarashni kengaytiruvchi adabiyotlar o'qish."
  },
  {
    id: 'ingliz_tili',
    title: "Ingliz tili dars",
    subtitle: "Xorijiy til grammatikasi va lug'at boyligi",
    category: 'ilm',
    icon: 'globe',
    color: '#2563eb',
    description: "Kunlik yangi so'zlar, eshitish va mashqlar."
  },
  {
    id: 'kechki_namoz',
    title: "Kechki namoz",
    subtitle: "Xufton va Vitr namozlari",
    category: 'ibodat',
    icon: 'star',
    color: '#8b5cf6',
    description: "Kunning yakuniy namozlarini ixlos bilan o'qish."
  },
  {
    id: 'uyqu',
    title: "Uyqu",
    subtitle: "Soat 22:30 da uxlab, 04:30 da turish",
    category: 'tartib',
    icon: 'clock',
    color: '#4f46e5',
    description: "Rejim: 10:30 da uxlab 4:30 da turiladi (6 soatlik barakali uyqu)."
  },
  {
    id: 'badan_tarbiya',
    title: "Badan tarbiya",
    subtitle: "Jismoniy mashqlar va sog'lom hayot",
    category: 'tartib',
    icon: 'activity',
    color: '#e11d48',
    description: "Badantarbiya, yugurish, chiniqish va faol harakat."
  },
  {
    id: 'namoz',
    title: "Namoz",
    subtitle: "Besh vaqt farz namozlari",
    category: 'ibodat',
    icon: 'sun',
    color: '#10b981',
    description: "Vaqtida, xushu va jamoat bilan ado etishga intilish."
  }
];

// Excel fayldagi kun raqamlari (8 dan boshlanib 16 gacha)
const DEFAULT_DAYS_CALENDAR = [
  8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16
];

// Dastur holati (State)
let appState = {
  currentDay: 1, // 1 to 40
  habits: [],
  matrix: {}, // { habitId: { 1: false, 2: true, ... 40: false } }
  calendarDays: DEFAULT_DAYS_CALENDAR,
  tasbeh: {},
  customZikrs: [],
  activeTasbehId: null,
  soundEnabled: false,
  vibrationEnabled: true,
  darkMode: false,
  startDate: new Date().toISOString().split('T')[0],
  profileName: '',
  profileCompleted: false,
  userGender: 'ayol',
  reminderEnabled: true,
  lastNotificationDate: null,
  cycles: [],
  activeCycleId: null,
  viewingCycleId: null
};

// LocalStorage kaliti (v9: toza boshlang'ich default holati va doimiy ma'lumotlar saqlanishi)
const STORAGE_KEY = 'islohot_tracker_data_v10';

// Ilovani yuklash
function initApp() {
  try {
    loadData();
    applyDarkMode();
    setupEventListeners();
    renderApp();
    featherIconsReplace();
    requestPersistentStorage();
    updateBackupDateBadge();
  } catch (err) {
    console.error('Ilovani yuklashda xatolik:', err);
  } finally {
    initSplashScreen();
    initDailyReminderScheduler();
    setupCapacitorLocalNotifications();
    updateReminderStatusUI();
  }
}

// ==========================================
// SPLASH EKRAN BOSHQARUVI
// ==========================================
let splashTimeout = null;
let splashCountdownInterval = null;

// Splash tugashida xush kelibsiz so'zini iconlarsiz, faqat oddiy matn sifatida chiqarish
function finishSplashWithWelcome() {
  const countdownEl = document.getElementById('splash-countdown');
  const bar = document.getElementById('splash-progress-bar');

  if (bar) bar.style.width = '100%';
  if (countdownEl) {
    countdownEl.innerText = "Xush kelibsiz";
  }

  // Silliq yopish
  setTimeout(() => {
    dismissSplashScreen();
  }, 450);
}

function setUserGender(gender, event) {
  if (event) {
    event.stopPropagation();
  }
  const cleanGender = (gender === 'ayol') ? 'ayol' : 'erkak';
  appState.userGender = cleanGender;
  localStorage.setItem('islohot_user_gender', cleanGender);
  saveData();
  updateGenderUI();
}

function updateGenderUI() {
  const g = appState.userGender || 'ayol';

  // 1. Profil modalidagi tugmalar
  const modalMale = document.getElementById('modal-gender-erkak-btn');
  const modalFemale = document.getElementById('modal-gender-ayol-btn');
  const modalBadge = document.getElementById('profile-gender-badge');
  if (modalBadge) {
    modalBadge.innerText = (g === 'ayol' ? 'Ayol' : 'Erkak');
  }
  if (modalMale && modalFemale) {
    if (g === 'erkak') {
      modalMale.className = "p-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-emerald-600 text-white border-emerald-500 shadow-sm";
      modalFemale.className = "p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200";
    } else {
      modalFemale.className = "p-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-emerald-600 text-white border-emerald-500 shadow-sm";
      modalMale.className = "p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200";
    }
  }

  // 2. Sozlamalar (Tab 5) qismidagi tugmalar
  const setMale = document.getElementById('settings-gender-erkak-btn');
  const setFemale = document.getElementById('settings-gender-ayol-btn');
  const setDesc = document.getElementById('settings-gender-desc');
  if (setDesc) {
    setDesc.innerText = (g === 'ayol' ? 'Ayol' : 'Erkak');
  }
  if (setMale && setFemale) {
    if (g === 'erkak') {
      setMale.className = "px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer bg-emerald-600 text-white shadow-sm";
      setFemale.className = "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700";
    } else {
      setFemale.className = "px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer bg-emerald-600 text-white shadow-sm";
      setMale.className = "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700";
    }
  }
}

function initSplashScreen() {
  const splash = document.getElementById('app-splash-screen');
  if (!splash) return;

  // Foydalanuvchi tanlagan jinsni olish (agar mavjud bo'lmasa ayol)
  const savedGender = localStorage.getItem('islohot_user_gender');
  if (savedGender === 'erkak' || savedGender === 'ayol') {
    appState.userGender = savedGender;
  } else if (!appState.userGender) {
    appState.userGender = 'ayol';
  }

  // Interfeys va tugmalarni jinsga moslash
  updateGenderUI();
  featherIconsReplace();

  const bar = document.getElementById('splash-progress-bar');
  const countdownEl = document.getElementById('splash-countdown');

  // Dastlabki ko'rinish: progress 0% va hisoblagich 2.5s (avtomatik silliq harakatlanadi)
    const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPLASH_TOTAL_TIME = isReducedMotion ? 0.3 : 2.5;
  const splashStartTime = Date.now();

  if (bar) {
    bar.style.transition = `width ${SPLASH_TOTAL_TIME}s cubic-bezier(0.25, 0.8, 0.25, 1)`;
    requestAnimationFrame(() => {
      bar.style.width = '100%';
    });
  }

  if (splashCountdownInterval) clearInterval(splashCountdownInterval);
  splashCountdownInterval = setInterval(() => {
    const elapsed = (Date.now() - splashStartTime) / 1000;
    const remaining = Math.max(0, SPLASH_TOTAL_TIME - elapsed);
    if (countdownEl) {
      if (remaining > 0.1) {
        countdownEl.innerText = `${remaining.toFixed(1)}s`;
      } else {
        countdownEl.innerText = 'Xush kelibsiz';
      }
    }
    if (remaining <= 0) {
      clearInterval(splashCountdownInterval);
      splashCountdownInterval = null;
    }
  }, 100);

  // Splash vaqt tugashi bilan (2.6s) silliq yakunlanadi
  if (splashTimeout) clearTimeout(splashTimeout);
  splashTimeout = setTimeout(() => {
    finishSplashWithWelcome();
  }, Math.round((SPLASH_TOTAL_TIME + 0.1) * 1000));
}

function dismissSplashScreen(event) {
  if (event) event.stopPropagation();

  if (splashTimeout) {
    clearTimeout(splashTimeout);
    splashTimeout = null;
  }
  if (splashCountdownInterval) {
    clearInterval(splashCountdownInterval);
    splashCountdownInterval = null;
  }

  const splash = document.getElementById('app-splash-screen');
  if (!splash || splash.dataset.dismissed === 'true') return;
  splash.dataset.dismissed = 'true';

  const isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) {
    splash.style.display = 'none';
  } else {
    splash.classList.add('opacity-0', 'scale-105', 'pointer-events-none');
    setTimeout(() => {
      splash.style.display = 'none';
    }, 600);
  }
}

// Ma'lumotlarni xotiradan olish
function loadData() {
  // Eski sinov kalitlarini tozalash (agar mavjud bo'lsa)
  try {
    if (localStorage.getItem('chilla_tracker_data_v2')) {
      localStorage.removeItem('chilla_tracker_data_v2');
    }
    if (localStorage.getItem('islohot_tracker_data_v3')) {
      localStorage.removeItem('islohot_tracker_data_v3');
    }
    if (localStorage.getItem('islohot_tracker_data_v4')) {
      localStorage.removeItem('islohot_tracker_data_v4');
    }
    if (localStorage.getItem('islohot_tracker_data_v5')) {
      localStorage.removeItem('islohot_tracker_data_v5');
    }
    if (localStorage.getItem('islohot_tracker_data_v6')) {
      localStorage.removeItem('islohot_tracker_data_v6');
    }
    if (localStorage.getItem('islohot_tracker_data_v7')) {
      localStorage.removeItem('islohot_tracker_data_v7');
    }
    if (localStorage.getItem('islohot_tracker_data_v8')) {
      localStorage.removeItem('islohot_tracker_data_v8');
    }
    if (localStorage.getItem('islohot_tracker_data_v9')) {
      localStorage.removeItem('islohot_tracker_data_v9');
      localStorage.removeItem('islohot_user_gender');
    }
  } catch(e) {}

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      appState = { ...appState, ...parsed };
    } catch (e) {
      console.error('Xatolik ma\'lumot yuklashda:', e);
      initDefaultState();
    }
  } else {
    initDefaultState();
  }

  const savedGender = localStorage.getItem('islohot_user_gender');
  if (savedGender === 'erkak' || savedGender === 'ayol') {
    appState.userGender = savedGender;
  } else if (!appState.userGender) {
    appState.userGender = 'ayol';
  }

  if (!Array.isArray(appState.customZikrs)) {
    appState.customZikrs = [];
  }
  if (!appState.activeTasbehId && appState.customZikrs.length > 0) {
    appState.activeTasbehId = appState.customZikrs[0].id;
  }

  // Sikllar va Matrix strukturasini to'ldiramiz
  ensureCyclesStructure();
  ensureMatrixStructure();
}

function initDefaultState() {
  const savedGender = localStorage.getItem('islohot_user_gender');
  appState.userGender = (savedGender === 'erkak' || savedGender === 'ayol') ? savedGender : 'ayol';
  appState.habits = [];
  appState.profileName = '';
  appState.profileCompleted = false;
  appState.reminderEnabled = true;
  appState.startDate = new Date().toISOString().split('T')[0];
  appState.matrix = {};
  appState.cycles = [];
  appState.activeCycleId = null;
  appState.viewingCycleId = null;
  appState.currentDay = 1;
  appState.dailyNotes = {};
  appState.tasbeh = {};
  appState.customZikrs = [];
  appState.activeTasbehId = null;
  saveData();
}

function ensureMatrixStructure() {
  if (!appState.habits) {
    appState.habits = [];
  }
  if (!appState.matrix) appState.matrix = {};

  appState.habits.forEach(h => {
    if (!appState.matrix[h.id]) {
      appState.matrix[h.id] = {};
    }
    for (let d = 1; d <= 40; d++) {
      if (appState.matrix[h.id][d] === undefined) {
        appState.matrix[h.id][d] = false;
      }
    }
  });
}

// Seanslar (Sikllar) tizimini kafolatlash (Bir vaqtda 3 tagacha faol seans)
function ensureCyclesStructure() {
  if (!Array.isArray(appState.cycles)) {
    appState.cycles = [];
  }

  // Agar umuman seanslar mavjud bo'lmasa, faol seans mavjud emas
  if (appState.cycles.length === 0) {
    appState.activeCycleId = null;
    appState.viewingCycleId = null;
    return;
  }

  // Har bir mavjud seansda maydonlar mavjudligini ta'minlash
  appState.cycles.forEach((c, idx) => {
    if (!c.totalDays || c.totalDays < 1) c.totalDays = 40;
    if (!c.currentDay || c.currentDay < 1) c.currentDay = 1;
    if (!c.title) c.title = `${c.cycleNumber || idx + 1}-seans`;
    if (!c.status) c.status = 'active';
    if (!c.startDate) c.startDate = appState.startDate || new Date().toISOString().split('T')[0];
    if (c.notes === undefined) c.notes = '';
  });

  const activeCycles = getActiveCycles();
  if (activeCycles.length === 0) {
    appState.activeCycleId = null;
    appState.viewingCycleId = appState.cycles[appState.cycles.length - 1].id;
    return;
  }

  if (!activeCycles.some(c => c.id === appState.activeCycleId)) {
    appState.activeCycleId = activeCycles[0].id;
  }

  if (!appState.viewingCycleId || !appState.cycles.some(c => c.id === appState.viewingCycleId)) {
    appState.viewingCycleId = appState.activeCycleId;
  }

  // Tanlangan faol seans ma'lumotlarini appState.matrix bilan moslash
  const activeCycle = getActiveCycle();
  if (activeCycle) {
    if (!activeCycle.matrix) {
      activeCycle.matrix = {};
    }
    if (!activeCycle.habits) {
      activeCycle.habits = [];
    }
    appState.matrix = activeCycle.matrix;
    appState.habits = activeCycle.habits;
    appState.currentDay = activeCycle.currentDay || 1;
  }
}

function getActiveCycles() {
  if (!Array.isArray(appState.cycles)) return [];
  return appState.cycles.filter(c => c.status === 'active');
}

function getActiveCycle() {
  if (!Array.isArray(appState.cycles) || appState.cycles.length === 0) {
    return null;
  }
  const activeList = getActiveCycles();
  let found = activeList.find(c => c.id === appState.activeCycleId);
  if (!found && activeList.length > 0) {
    found = activeList[0];
    appState.activeCycleId = found.id;
  }
  return found || null;
}

function getViewingCycle() {
  if (!Array.isArray(appState.cycles) || appState.cycles.length === 0) {
    return null;
  }
  let found = appState.cycles.find(c => c.id === appState.viewingCycleId);
  return found || getActiveCycle();
}

function switchActiveCycle(cycleId) {
  ensureCyclesStructure();
  const target = appState.cycles.find(c => c.id === cycleId);
  if (!target) return;

  appState.activeCycleId = cycleId;
  appState.viewingCycleId = cycleId;
  statsViewingCycleId = cycleId;
  appState.matrix = target.matrix;
  appState.habits = target.habits;
  appState.currentDay = target.currentDay || 1;
  appState.dailyViewMode = 'single';

  saveData();
  renderApp();
  featherIconsReplace();
}

function selectDailyCycle(cycleId) {
  ensureCyclesStructure();
  if (cycleId === 'all') {
    appState.dailyViewMode = 'all';
    saveData();
    renderApp();
    featherIconsReplace();
    return;
  }

  appState.dailyViewMode = 'single';
  switchActiveCycle(cycleId);
}

// Bosh sahifa (Kunlik ko'rinish) uchun Faol Seanslar paneli
function renderDailyCyclesBar() {
  const container = document.getElementById('daily-cycles-bar');
  if (!container) return;

  ensureCyclesStructure();
  const activeList = getActiveCycles();
  const viewingMode = appState.dailyViewMode || 'single';
  const activeId = appState.activeCycleId;

  if (activeList.length === 0) {
    container.innerHTML = '';
    return;
  }

  let html = `
    <div class="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm">
      <div class="flex items-center justify-between mb-2 px-1">
        <div class="flex items-center gap-1.5">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">⚡ Faol Seanslar:</span>
          <span class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold">
            ${activeList.length} / 3 ta
          </span>
        </div>
        <div class="flex items-center gap-1.5">
          ${
            activeList.length < 3
              ? `<button onclick="handleStartNewAction()" class="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer">
                   <span>+ Yangi seans</span>
                 </button>`
              : `<span class="text-xs text-slate-400 font-semibold">Slot to'lgan (3/3)</span>`
          }
        </div>
      </div>

      <!-- Seans tugmalari (Tabs) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
  `;

  activeList.forEach((cycle) => {
    const isSelected = (viewingMode === 'single' && cycle.id === activeId);
    const totalDays = cycle.totalDays || 40;
    const habitsCount = (cycle.habits && cycle.habits.length) || 0;
    const day = Math.min(Math.max(1, cycle.currentDay || 1), totalDays);

    let doneToday = 0;
    if (cycle.matrix) {
      (cycle.habits || []).forEach(h => {
        if (cycle.matrix[h.id] && cycle.matrix[h.id][day]) doneToday++;
      });
    }
    const todayPct = habitsCount > 0 ? Math.round((doneToday / habitsCount) * 100) : 0;

    let pillClasses = '';
    if (isSelected) {
      pillClasses = 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md ring-2 ring-emerald-400/60 font-bold scale-102';
    } else {
      pillClasses = 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30';
    }

    html += `
      <div class="shrink-0 flex items-center rounded-xl p-0.5 transition-all ${pillClasses}">
        <button onclick="selectDailyCycle('${cycle.id}')" 
          title="${escapeHtml(cycle.title)} (${day}/${totalDays}-kun, ${todayPct}% bugun)" 
          class="px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 text-left cursor-pointer">
          <span class="w-2 h-2 rounded-full ${isSelected ? 'bg-white animate-pulse' : 'bg-emerald-500'}"></span>
          <span class="font-bold truncate max-w-[110px]">${escapeHtml(cycle.title)}</span>
          <span class="text-xs opacity-80 font-mono">(${day}/${totalDays}k)</span>
          <span class="text-xs font-extrabold ${isSelected ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'}">${todayPct}%</span>
          <span class="text-xs opacity-70">(${habitsCount} ta)</span>
        </button>
      </div>
    `;
  });

  // Agar 1 tadan ko'p seans bo'lsa "Barchasi birga" tugmasi
  if (activeList.length > 1) {
    const isAllSelected = viewingMode === 'all';
    const allPillClasses = isAllSelected
      ? 'bg-gradient-to-r from-teal-600 to-cyan-700 text-white shadow-md ring-2 ring-teal-400/60 font-bold'
      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-teal-300 hover:bg-teal-50/30';

    html += `
      <div class="shrink-0 flex items-center rounded-xl p-0.5 transition-all ${allPillClasses}">
        <button onclick="selectDailyCycle('all')" 
          title="Barcha faol seanslarni birgalikda ko'rish" 
          class="px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
          <span>📑</span>
          <span class="font-bold">Barchasi birga</span>
        </button>
      </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function saveData() {
  try {
    const active = getActiveCycle();
    if (active) {
      active.habits = appState.habits;
      active.matrix = appState.matrix;
      active.currentDay = appState.currentDay;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (err) {
    console.error("Ma'lumotlarni saqlashda xatolik:", err);
  }
}

// Bosh sahifani chizish
function renderApp() {
  renderHeader();
  renderDailyView();
  renderMatrixView();
  renderTasbehView();
  renderStatsView();
  renderSettingsHabits();
  updateGenderUI();
  featherIconsReplace();
}

// Sarlavha qismi
function renderHeader() {
  ensureCyclesStructure();
  const activeCycles = getActiveCycles();
  const activeCycle = getActiveCycle();

  const dayBadge = document.getElementById('current-day-badge');
  const headerProgress = document.getElementById('header-progress-text');
  const progressBar = document.getElementById('header-progress-bar');
  const headerSeansBadge = document.getElementById('header-seans-title-badge');

  if (activeCycles.length === 0 || !activeCycle) {
    const isBrandNew = (!appState.cycles || appState.cycles.length === 0);
    if (dayBadge) {
      dayBadge.innerText = isBrandNew ? "Seans yo'q" : 'Tugagan';
      dayBadge.title = isBrandNew ? "Hali hech qanday seans ochilmagan" : "Barcha seanslar yakunlangan";
    }
    if (headerSeansBadge) {
      headerSeansBadge.innerText = isBrandNew ? 'Seans ochilmagan' : 'Barcha seanslar yakunlangan';
    }
    if (headerProgress) headerProgress.innerText = isBrandNew ? 'Yangi seans boshlang' : 'Faol seans mavjud emas';
    if (progressBar) progressBar.style.width = '0%';
    const progressContainer = document.getElementById('header-progress-container');
    if (progressContainer) progressContainer.setAttribute('aria-valuenow', '0');
    return;
  }

  const cycleTitle = activeCycle.title || `${activeCycle.cycleNumber}-seans`;
  const totalDays = activeCycle.totalDays || 40;

  if (dayBadge) {
    dayBadge.innerText = `${appState.currentDay}/${totalDays}-kun`;
    dayBadge.title = `${cycleTitle} (${appState.currentDay}/${totalDays}-kun)`;
  }

  if (headerSeansBadge) {
    headerSeansBadge.innerText = `${cycleTitle} · Bugungi reja`;
    headerSeansBadge.title = `${cycleTitle} (Jami ${totalDays} kunlik)`;
  }

  // Umumiy hisob
  const completedToday = getCompletedCountForDay(appState.currentDay);
  const totalHabits = (activeCycle && activeCycle.habits ? activeCycle.habits.length : appState.habits.length);
  const pct = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  if (headerProgress) {
    headerProgress.innerText = `${pct}% bajarildi (${completedToday}/${totalHabits})`;
  }

  if (progressBar) {
    progressBar.style.width = `${pct}%`;
    const progressContainer = document.getElementById('header-progress-container');
    if (progressContainer) progressContainer.setAttribute('aria-valuenow', String(pct));
  }
}

// Kun bo'yicha bajarilganlar soni
function getCompletedCountForDay(day) {
  ensureCyclesStructure();
  const activeCycle = getActiveCycle();
  let count = 0;
  const habits = (activeCycle && activeCycle.habits) || appState.habits;
  const matrix = (activeCycle && activeCycle.matrix) || appState.matrix;
  habits.forEach(h => {
    if (matrix[h.id] && matrix[h.id][day]) {
      count++;
    }
  });
  return count;
}

// Kunlik amallar ko'rinishi
function renderDailyView() {
  const container = document.getElementById('daily-habits-list');
  if (!container) return;

  ensureCyclesStructure();
  renderDailyCyclesBar();

  const activeCycles = getActiveCycles();
  const viewingMode = appState.dailyViewMode || 'single';
  const sliderContainer = document.getElementById('daily-calendar-slider-container');
  const sliderTitle = document.getElementById('daily-calendar-title');
  const quickSwitch = document.getElementById('daily-quick-switch');
  const dateLabel = document.getElementById('daily-date-label');
  const subtitleLabel = document.getElementById('daily-subtitle');
  const pctLabel = document.getElementById('daily-completion-pct');

  // AGAR SEANSLAR HALI OCHILMAGAN YOKI BARCHA SEANSLAR YAKUNLANGAN BO'LSA
  if (activeCycles.length === 0) {
    const isBrandNew = (!appState.cycles || appState.cycles.length === 0);
    if (sliderContainer) sliderContainer.classList.add('hidden');
    const summaryHeader = document.getElementById('daily-summary-header');
    if (summaryHeader) summaryHeader.classList.add('hidden');
    if (quickSwitch) {
      quickSwitch.innerHTML = '';
      quickSwitch.classList.add('hidden');
    }
    if (dateLabel) dateLabel.innerText = isBrandNew ? "Xush kelibsiz" : "Barcha seanslar yakunlangan";
    if (subtitleLabel) subtitleLabel.innerText = isBrandNew ? "Amallarni boshlash uchun yangi seans oching" : "Hozirda faol seans mavjud emas. Yangi seans boshlang!";
    if (pctLabel) pctLabel.innerText = "0%";
    showAllDoneCard(false);

    container.innerHTML = `
      <div class="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-50 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 text-center space-y-4 shadow-sm">
        <div class="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30">
          ${isBrandNew ? '🌱' : '✨'}
        </div>
        <div class="space-y-1.5">
          <h3 class="font-extrabold text-base text-slate-800 dark:text-white">
            ${isBrandNew ? "Hali hech qanday seans ochilmagan" : "Barcha seanslar muvaffaqiyatli yakunlandi!"}
          </h3>
          <p class="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            ${isBrandNew 
              ? "Ma'naviy va jismoniy rivojlanish amallaringizni tartibga solish uchun quyidagi tugma orqali birinchi seansni boshlang." 
              : "Alloh barcha amallaringizni qabul qilsin! O'tgan seanslar tarixi arxivda saqlangan. Yangi ma'naviy yuksalish uchun yangi seansni boshlang."}
          </p>
        </div>
        <div class="pt-2">
          <button onclick="handleStartNewAction()" class="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 inline-flex items-center gap-2 active:scale-95 transition-all cursor-pointer">
            <span>🚀</span>
            <span>+ Yangi seans boshlash</span>
          </button>
        </div>
      </div>
    `;
    renderDailyCustomNotes('none', [], null);
    return;
  }

  // Tezkor almashtirish tugmalari (har doim sarlavha ustida)
  if (quickSwitch) {
    if (activeCycles.length > 1) {
      let qHtml = '<div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar"><span class="text-xs text-slate-600 dark:text-slate-400 font-bold shrink-0">Seans:</span>';
      activeCycles.forEach(c => {
        const isCur = (viewingMode === 'single' && c.id === appState.activeCycleId);
        qHtml += `
          <button onclick="selectDailyCycle('${c.id}')" class="px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
            isCur ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
          }">
            <span class="w-1.5 h-1.5 rounded-full ${isCur ? 'bg-white' : 'bg-emerald-500'}"></span>
            <span>${escapeHtml(c.title)}</span>
          </button>
        `;
      });
      const isAllCur = viewingMode === 'all';
      qHtml += `
        <button onclick="selectDailyCycle('all')" class="px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
          isAllCur ? 'bg-teal-600 text-white shadow-sm ring-1 ring-teal-400' : 'bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-50'
        }">
          <span>📑 Barchasi</span>
        </button>
      </div>`;
      quickSwitch.innerHTML = qHtml;
      quickSwitch.classList.remove('hidden');
    } else {
      quickSwitch.innerHTML = '';
      quickSwitch.classList.add('hidden');
    }
  }

  // AGAR "BARCHASI BIRGA" REJIMI TANLANGAN BO'LSA
  if (viewingMode === 'all' && activeCycles.length > 1) {
    if (sliderContainer) sliderContainer.classList.add('hidden');
    const summaryHeader = document.getElementById('daily-summary-header');
    if (summaryHeader) summaryHeader.classList.remove('hidden');
    if (dateLabel) dateLabel.innerText = "Barcha faol seanslar amallari";
    if (subtitleLabel) subtitleLabel.innerText = `Jami ${activeCycles.length} ta faol seans amallarini bajaring`;

    let totalAll = 0;
    let completedAll = 0;
    let html = '';

    activeCycles.forEach(cycle => {
      const cTotalDays = cycle.totalDays || 40;
      const cDay = Math.min(Math.max(1, cycle.currentDay || 1), cTotalDays);
      const cHabits = cycle.habits || [];
      const cCalDate = appState.calendarDays[cDay - 1] || cDay;

      let cDone = 0;
      cHabits.forEach(h => {
        if (cycle.matrix && cycle.matrix[h.id] && cycle.matrix[h.id][cDay]) cDone++;
      });
      const cPct = cHabits.length > 0 ? Math.round((cDone / cHabits.length) * 100) : 0;
      totalAll += cHabits.length;
      completedAll += cDone;

      html += `
        <div class="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5">
          <div class="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-700/50">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 class="font-black text-sm text-slate-800 dark:text-white">${escapeHtml(cycle.title)}</h3>
              <span class="text-xs font-mono text-slate-500 dark:text-slate-400">(${cDay}/${cTotalDays}-kun, ${cCalDate}-sana)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold ${cPct === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}">${cPct}% (${cDone}/${cHabits.length})</span>
              <button onclick="selectDailyCycle('${cycle.id}')" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                O'tish &rarr;
              </button>
            </div>
          </div>
      `;

      if (cHabits.length === 0) {
        html += `
          <div class="p-3 text-center text-xs text-slate-500 dark:text-slate-400">
            Ushbu seansda amallar yo'q. <button onclick="goToSettingsAddHabits('${cycle.id}')" class="text-emerald-600 font-bold hover:underline cursor-pointer">+ Vazifa qo'shish</button>
          </div>
        `;
      } else {
        html += `<div class="space-y-2">`;
        cHabits.forEach(habit => {
          const isDone = !!(cycle.matrix && cycle.matrix[habit.id] && cycle.matrix[habit.id][cDay]);
          html += `
            <div onclick="toggleHabitForCycle('${cycle.id}', '${habit.id}', ${cDay})" class="group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
              isDone 
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-sm' 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/60 hover:border-emerald-200 shadow-sm'
            }">
              <div class="flex items-center gap-3 flex-1 min-w-0 pr-2">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-active:scale-90 ${
                  isDone 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }">
                  <i data-feather="${habit.icon || 'check-circle'}" class="w-4 h-4"></i>
                </div>
                <div class="min-w-0">
                  <h4 class="font-semibold text-sm leading-tight truncate ${
                    isDone ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-white'
                  }">
                    ${habit.title}
                  </h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">${habit.subtitle || ''}</p>
                </div>
              </div>

              <div class="shrink-0">
                <div class="w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                  isDone 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-slate-300 dark:border-slate-600 bg-transparent'
                }">
                  ${isDone ? '<i data-feather="check" class="w-3.5 h-3.5 stroke-[3]"></i>' : ''}
                </div>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }

      html += `</div>`;
    });

    container.innerHTML = html;
    const overallPct = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;
    if (pctLabel) pctLabel.innerText = `${overallPct}%`;
    showAllDoneCard(overallPct === 100 && totalAll > 0);
    renderDailyCustomNotes(viewingMode, activeCycles, null);
    return;
  }

  // YAGONA (TANLANGAN) SEANS REJIMI
  if (sliderContainer) sliderContainer.classList.remove('hidden');
  const summaryHeader = document.getElementById('daily-summary-header');
  if (summaryHeader) summaryHeader.classList.remove('hidden');

  const activeCycle = getActiveCycle();
  const totalDays = activeCycle.totalDays || 40;
  const day = Math.min(Math.max(1, appState.currentDay), totalDays);
  appState.currentDay = day;
  const calendarDateNumber = appState.calendarDays[day - 1] || day;

  if (sliderTitle) {
    sliderTitle.innerText = `${activeCycle.title || `${activeCycle.cycleNumber}-seans`}: Taqvim`;
  }

  // Kun tanlagich (gorizontal slider)
  renderDaySelector();

  const total = activeCycle.habits ? activeCycle.habits.length : appState.habits.length;
  const completed = getCompletedCountForDay(day);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (dateLabel) {
    dateLabel.innerText = `${activeCycle.title || `${activeCycle.cycleNumber}-seans`}: ${day}-kun / ${totalDays} kun (Oyning ${calendarDateNumber}-sanasi)`;
  }
  if (subtitleLabel) {
    subtitleLabel.innerText = "Kunlik vazifalarni ixlos bilan ado eting";
  }
  if (pctLabel) {
    pctLabel.innerText = `${pct}%`;
  }

  let html = '';
  const habitsList = activeCycle.habits || [];

  if (habitsList.length === 0) {
    container.innerHTML = `
      <div class="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
        <div class="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
          📝
        </div>
        <div>
          <h4 class="font-bold text-sm text-slate-800 dark:text-white">Ushbu seansda hali amallar yo'q</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Yangi seans toza holda boshlandi. Unga o'zingiz rejalashtirgan amallarni qo'shing.</p>
        </div>
        <button onclick="goToSettingsAddHabits('${activeCycle.id}')" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer transition-transform active:scale-95">
          + Yangi amal qo'shish
        </button>
      </div>
    `;
    showAllDoneCard(false);
    return;
  }

  habitsList.forEach((habit) => {
    const isDone = !!(activeCycle.matrix && activeCycle.matrix[habit.id] && activeCycle.matrix[habit.id][day]);

    html += `
      <div onclick="toggleHabit('${habit.id}', ${day})" class="group flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
        isDone 
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-sm' 
          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:border-emerald-200 shadow-sm'
      }">
        <div class="flex items-center gap-3.5 flex-1 min-w-0 pr-3">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-active:scale-90 ${
            isDone 
              ? 'bg-emerald-500 text-white shadow-emerald-200 dark:shadow-none shadow-md' 
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }">
            <i data-feather="${habit.icon || 'check-circle'}" class="w-5 h-5"></i>
          </div>
          <div class="min-w-0">
            <h4 class="font-semibold text-base leading-tight truncate ${
              isDone ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-white'
            }">
              ${habit.title}
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">${habit.subtitle || ''}</p>
          </div>
        </div>

        <div class="shrink-0">
          <div class="w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
            isDone 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'border-slate-300 dark:border-slate-600 bg-transparent'
          }">
            ${isDone ? '<i data-feather="check" class="w-4 h-4 stroke-[3]"></i>' : ''}
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Agar 100% bo'lsa tabriklash
  if (pct === 100 && total > 0) {
    showAllDoneCard(true);
  } else {
    showAllDoneCard(false);
  }

  // Foydalanuvchi kiritgan dinamik amallar shartlari va eslatmalarni chiqarish
  renderDailyCustomNotes(viewingMode, activeCycles, activeCycle);
}

function showAllDoneCard(show) {
  const card = document.getElementById('all-done-banner');
  if (!card) return;
  if (show) {
    card.classList.remove('hidden');
    triggerConfetti();
  } else {
    card.classList.add('hidden');
  }
}

// Foydalanuvchi o'zi kiritgan eslatmalarni Tab 1 (Bugun) ostida ko'rsatish
function renderDailyCustomNotes(viewingMode, activeCycles, activeCycle) {
  const notesContainer = document.getElementById('daily-custom-notes-container');
  if (!notesContainer) return;

  if (viewingMode === 'none' || !activeCycles || activeCycles.length === 0) {
    notesContainer.innerHTML = '';
    return;
  }

  if (viewingMode === 'all') {
    const withNotes = (activeCycles || []).filter(c => c.notes && c.notes.trim());
    if (withNotes.length === 0) {
      notesContainer.innerHTML = '';
      return;
    }
    let html = `
      <div class="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2.5">
        <div class="flex items-center gap-2">
          <span class="text-base">📝</span>
          <span class="font-extrabold text-xs uppercase tracking-wider">Amallar shartlari va eslatmalar</span>
        </div>
        <div class="space-y-2">
    `;
    withNotes.forEach(c => {
      html += `
        <div class="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-amber-500/20 text-xs">
          <div class="font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">⚡ ${escapeHtml(c.title)}:</div>
          <div class="text-[12px] leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-200">${escapeHtml(c.notes)}</div>
        </div>
      `;
    });
    html += `</div></div>`;
    notesContainer.innerHTML = html;
  } else {
    if (!activeCycle || !activeCycle.notes || !activeCycle.notes.trim()) {
      notesContainer.innerHTML = '';
      return;
    }
    notesContainer.innerHTML = `
      <div class="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-1.5 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-base">📝</span>
            <span class="font-extrabold text-xs uppercase tracking-wider">Amallar shartlari va eslatmalar</span>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold">
            ${escapeHtml(activeCycle.title || '1-seans')}
          </span>
        </div>
        <div class="text-xs leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-200 pt-1">
          ${escapeHtml(activeCycle.notes)}
        </div>
      </div>
    `;
  }
}

// Kun tanlash slayderi (Seans davomiyligiga qarab 1 dan totalDays gacha)
function renderDaySelector() {
  const selector = document.getElementById('days-horizontal-scroll');
  if (!selector) return;

  ensureCyclesStructure();
  const activeCycle = getActiveCycle();
  if (!activeCycle) {
    selector.innerHTML = '';
    return;
  }
  const totalDays = activeCycle.totalDays || 40;

  let html = '';
  for (let i = 1; i <= totalDays; i++) {
    const isSelected = i === appState.currentDay;
    const completedCount = getCompletedCountForDay(i);
    const isAllDone = completedCount === appState.habits.length && appState.habits.length > 0;
    const hasSome = completedCount > 0 && !isAllDone;
    const calDate = appState.calendarDays[i - 1] || i;

    let badgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent';
    if (isSelected) {
      badgeClass = 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400/40 shadow-lg';
    } else if (isAllDone) {
      badgeClass = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300';
    } else if (hasSome) {
      badgeClass = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200';
    }

    html += `
      <button type="button" onclick="selectDay(${i})" class="shrink-0 flex flex-col items-center justify-center min-w-[50px] h-16 px-1 rounded-xl border transition-all ${badgeClass} text-center">
        <span class="text-xs uppercase font-bold tracking-tight opacity-75">Kun</span>
        <span class="text-sm font-extrabold">${i}</span>
        <span class="text-xs opacity-70">${calDate}-sana</span>
      </button>
    `;
  }
  selector.innerHTML = html;

  // Tanlangan kunga avtomatik scroll qilish
  const activeBtn = selector.children[appState.currentDay - 1];
  if (activeBtn) {
    activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

function selectDay(day) {
  // Agar arxiv ko'rilayotgan bo'lsa, avtomatik joriy siklga qaytaramiz
  if (appState.viewingCycleId !== appState.activeCycleId) {
    appState.viewingCycleId = appState.activeCycleId;
  }
  appState.currentDay = day;
  const activeCycle = getActiveCycle();
  if (activeCycle) {
    activeCycle.currentDay = day;
  }
  saveData();
  renderHeader();
  renderDailyView();
  renderMatrixHighlight();
  featherIconsReplace();
}

// Amalni muayyan seansda bajarilgan/bajarilmagan deb belgilash
function toggleHabitForCycle(cycleId, habitId, day) {
  ensureCyclesStructure();
  const targetCycle = appState.cycles.find(c => c.id === cycleId);
  if (!targetCycle) return;

  // Agar arxiv (o'tgan sikl) ko'rilayotgan bo'lsa, tahrirlash taqiqlanadi
  if (targetCycle.status === 'completed') {
    alert("Bu o'tgan seans arxividir! Tarixiy ma'lumotlarni o'zgartirib bo'lmaydi. O'zgartirish kiritish uchun faol seansga o'ting.");
    return;
  }

  if (!targetCycle.matrix) targetCycle.matrix = {};
  if (!targetCycle.matrix[habitId]) targetCycle.matrix[habitId] = {};

  const current = !!targetCycle.matrix[habitId][day];
  targetCycle.matrix[habitId][day] = !current;

  // Agar bu joriy faol seans bo'lsa, appState.matrix bilan bir xilda saqlash
  if (targetCycle.id === appState.activeCycleId) {
    if (!appState.matrix) appState.matrix = {};
    if (!appState.matrix[habitId]) appState.matrix[habitId] = {};
    appState.matrix[habitId][day] = !current;
  }

  // Haptic & Sound
  triggerHaptic();
  if (!current) playTone(523.25, 0.08); // Cheerful pip

  saveData();
  renderHeader();
  renderDailyView();
  renderMatrixView();
  renderStatsView();
  featherIconsReplace();
}

// Joriy faol seans uchun odatiy toggle
function toggleHabit(habitId, day) {
  toggleHabitForCycle(appState.activeCycleId, habitId, day);
}

// SEANS JADVALI (EXCEL MATRITSASI)
function renderMatrixView() {
  const headerRow = document.getElementById('matrix-header-row');
  const body = document.getElementById('matrix-table-body');
  if (!headerRow || !body) return;

  ensureCyclesStructure();
  renderCyclesHistoryBar();

  const viewingCycle = getViewingCycle();
  const titleEl = document.getElementById('matrix-cycle-title');
  const archiveBanner = document.getElementById('archive-view-banner');
  const finishBanner = document.getElementById('cycle-finish-banner');

  if (!viewingCycle) {
    if (titleEl) titleEl.innerText = "Jadval: Hali seans ochilmagan";
    if (archiveBanner) archiveBanner.classList.add('hidden');
    if (finishBanner) finishBanner.classList.add('hidden');
    headerRow.innerHTML = '<th class="sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 p-2 text-left font-bold text-xs text-slate-700 dark:text-slate-300">Amallar</th>';
    body.innerHTML = `
      <tr>
        <td colspan="5" class="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
          <div class="space-y-3 max-w-xs mx-auto">
            <div class="text-3xl">📊</div>
            <div class="font-bold text-slate-700 dark:text-slate-300">Hozirda seanslar mavjud emas</div>
            <p>Jadvalni to'ldirish va amallarni belgilash uchun yangi seans boshlang.</p>
            <button onclick="handleStartNewAction()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer">
              + Yangi seans boshlash
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  const isActive = viewingCycle.id === appState.activeCycleId;
  const totalDays = viewingCycle.totalDays || 40;
  const cycleTitle = viewingCycle.title || `${viewingCycle.cycleNumber}-seans`;

  // Sarlavha matnini yangilash
  if (titleEl) {
    if (isActive) {
      titleEl.innerText = `${cycleTitle}: Jadval`;
    } else {
      titleEl.innerText = `${cycleTitle} (Arxiv)`;
    }
  }

  // O'tgan seans ko'rilayotganda ogohlantirish banneri
  if (archiveBanner) {
    if (!isActive) {
      archiveBanner.classList.remove('hidden');
      const textEl = archiveBanner.querySelector('span.font-medium');
      if (textEl) {
        textEl.innerText = `Siz "${cycleTitle}" tarixini ko'rmoqdasiz (Qulflangan arxiv).`;
      }
    } else {
      archiveBanner.classList.add('hidden');
    }
  }

  // Seansni tugatish banneri
  const finishTitleEl = document.getElementById('cycle-finish-banner-title');
  const finishSubEl = document.getElementById('cycle-finish-banner-sub');
  if (finishBanner) {
    if (!isActive) {
      finishBanner.classList.add('hidden');
    } else {
      finishBanner.classList.remove('hidden');
      if (finishTitleEl) {
        finishTitleEl.innerText = `${cycleTitle}: ${totalDays} kun yakunlash`;
      }
      if (finishSubEl) {
        finishSubEl.innerText = `Natijalarni ko'rish va yangi seanslarni boshqarish`;
      }
    }
  }

  const cycleHabits = viewingCycle.habits || appState.habits;
  const cycleMatrix = viewingCycle.matrix || {};

  // 1. Sarlavha qatori (Header): Amallar nomi + 1..totalDays kunlar + Jami
  let headerHtml = `
    <th class="sticky-corner p-3 text-left font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 min-w-[150px] text-xs uppercase tracking-wider">
      ${escapeHtml(cycleTitle)} (${totalDays}k)
    </th>
  `;

  for (let d = 1; d <= totalDays; d++) {
    const isCurrent = isActive && (d === appState.currentDay);
    const calDate = appState.calendarDays[d - 1] || d;
    headerHtml += `
      <th onclick="${isActive ? `selectDay(${d})` : ''}" class="p-2 text-center text-xs font-semibold border-b border-r border-slate-200 dark:border-slate-700 min-w-[42px] transition-colors ${
        isActive ? 'cursor-pointer' : ''
      } ${
        isCurrent 
          ? 'bg-emerald-500 text-white font-extrabold' 
          : 'bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
      }">
        <div>№${d}</div>
        <div class="text-xs font-normal opacity-80">${calDate}</div>
      </th>
    `;
  }

  headerHtml += `
    <th class="p-3 text-center text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 min-w-[70px]">
      Jami
    </th>
  `;
  headerRow.innerHTML = headerHtml;

  // 2. Qatorlar (Har bir odat uchun)
  let bodyHtml = '';

  if (cycleHabits.length === 0) {
    body.innerHTML = `
      <tr>
        <td colspan="${totalDays + 2}" class="p-8 text-center text-slate-400 text-xs italic">
          <div class="font-bold text-slate-700 dark:text-slate-300 text-sm">Ushbu seansda hozircha amallar mavjud emas</div>
          <p class="text-xs text-slate-400 mt-1">Yangi seans toza holda boshlandi. Unga vazifalar (amallar) qo'shish uchun Vazifalar bo'limiga o'ting.</p>
          <button onclick="goToSettingsAddHabits('${viewingCycle.id}')" class="mt-3 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-transform active:scale-95">
            + Yangi amal qo'shish
          </button>
        </td>
      </tr>
    `;
    return;
  }

  cycleHabits.forEach((habit) => {
    let completedInTotalDays = 0;

    let rowHtml = `
      <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
        <td class="sticky-col p-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border-b border-r border-slate-200 dark:border-slate-700 truncate max-w-[150px]" title="${escapeHtml(habit.title)}">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${habit.color || '#059669'}"></span>
            <span class="truncate font-semibold">${escapeHtml(habit.title)}</span>
          </div>
        </td>
    `;

    for (let d = 1; d <= totalDays; d++) {
      const isDone = !!(cycleMatrix[habit.id] && cycleMatrix[habit.id][d]);
      if (isDone) completedInTotalDays++;
      const isCurrent = isActive && (d === appState.currentDay);

      rowHtml += `
        <td onclick="toggleHabit('${habit.id}', ${d})" class="p-1 text-center border-b border-r border-slate-200 dark:border-slate-700/60 cursor-pointer select-none transition-colors ${
          isCurrent ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
        }">
          <div class="w-7 h-7 mx-auto rounded-md flex items-center justify-center text-xs transition-transform active:scale-75 ${
            isDone 
              ? 'bg-emerald-500 text-white font-bold shadow-sm' 
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-300 dark:text-slate-600'
          }">
            ${isDone ? '✓' : '·'}
          </div>
        </td>
      `;
    }

    const habitPct = totalDays > 0 ? Math.round((completedInTotalDays / totalDays) * 100) : 0;
    rowHtml += `
        <td class="p-2 text-center text-xs font-bold border-b border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300">
          <div>${completedInTotalDays}/${totalDays}</div>
          <div class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">${habitPct}%</div>
        </td>
      </tr>
    `;

    bodyHtml += rowHtml;
  });

  // 3. Pastki umumiy qator (Kunning jami foizi)
  let footerHtml = `
    <tr class="bg-slate-100 dark:bg-slate-800/90 font-bold text-xs text-slate-700 dark:text-slate-200">
      <td class="sticky-col p-2.5 bg-slate-100 dark:bg-slate-800 border-t border-r border-slate-300 dark:border-slate-700">
        Kunlik Foiz
      </td>
  `;

  for (let d = 1; d <= totalDays; d++) {
    let dayCount = 0;
    cycleHabits.forEach(h => {
      if (cycleMatrix[h.id] && cycleMatrix[h.id][d]) dayCount++;
    });
    const dayPct = cycleHabits.length > 0 ? Math.round((dayCount / cycleHabits.length) * 100) : 0;
    const isCurrent = isActive && (d === appState.currentDay);

    footerHtml += `
      <td class="p-1 text-center border-t border-r border-slate-300 dark:border-slate-700 ${
        isCurrent ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-black' : ''
      }">
        <span class="${dayPct === 100 ? 'text-emerald-600 font-black' : dayPct > 50 ? 'text-blue-600' : 'text-slate-500'}">
          ${dayPct}%
        </span>
      </td>
    `;
  }

  // Umumiy natija
  let totalAllDone = 0;
  let totalAllPossible = cycleHabits.length * totalDays;
  cycleHabits.forEach(h => {
    for (let d = 1; d <= totalDays; d++) {
      if (cycleMatrix[h.id] && cycleMatrix[h.id][d]) totalAllDone++;
    }
  });
  const grandTotalPct = totalAllPossible > 0 ? Math.round((totalAllDone / totalAllPossible) * 100) : 0;

  footerHtml += `
      <td class="p-2 text-center text-xs font-black border-t border-slate-300 dark:border-slate-700 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
        ${grandTotalPct}%
      </td>
    </tr>
  `;

  body.innerHTML = bodyHtml + footerHtml;
}

// SEANSLAR BOSHQARUV PANELI (Bir vaqtda 3 tagacha faol seans)
function renderCyclesHistoryBar() {
  const container = document.getElementById('cycles-history-container');
  if (!container) return;

  ensureCyclesStructure();
  const activeList = getActiveCycles();
  const archivedList = appState.cycles.filter(c => c.status === 'completed');
  const viewingId = appState.viewingCycleId;
  const activeId = appState.activeCycleId;

  let html = '';

  // Agar faol seanslar bo'lmasa
  if (activeList.length === 0) {
    if (archivedList.length === 0) {
      container.innerHTML = '';
      return;
    }
    html += `
      <div class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span>🏁</span>
          <span class="text-xs font-bold text-amber-800 dark:text-amber-200">Faol seans yo'q</span>
        </div>
        <button onclick="handleStartNewAction()" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer">
          <span>+ Yangi seans</span>
        </button>
      </div>
    `;
  } else {
    html += `
      <!-- Sarlavha va Yangi Seans Qo'shish Tugmasi -->
      <div class="flex items-center justify-between gap-2 px-1 pt-1 pb-1">
        <div class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span>⚡ Faol seanslar:</span>
          <span class="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold">
            ${activeList.length} / 3 ta
          </span>
        </div>
        
        <div class="flex items-center gap-1.5">
          ${
            activeList.length < 3
              ? `<button onclick="handleStartNewAction()" class="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer">
                   <span>+ Yangi seans</span>
                 </button>`
              : `<span class="px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 font-semibold text-xs">
                   Slot to'lgan (3/3)
                 </span>`
          }
          <button onclick="finishCycleAndShowResults()" class="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer">
            🏁 Natijalar
          </button>
        </div>
      </div>

      <!-- Faol Seanslar Kartochkalari (1 dan 3 tagacha) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
    `;

    activeList.forEach((cycle) => {
      const isViewing = cycle.id === viewingId;
      const isCurrentActive = cycle.id === activeId;
      const totalDays = cycle.totalDays || 40;
      const habitsCount = (cycle.habits && cycle.habits.length) || appState.habits.length || 10;
      const possible = habitsCount * totalDays;

      let doneCount = 0;
      if (cycle.matrix) {
        Object.keys(cycle.matrix).forEach(hId => {
          for (let d = 1; d <= totalDays; d++) {
            if (cycle.matrix[hId] && cycle.matrix[hId][d]) doneCount++;
          }
        });
      }
      const pct = possible > 0 ? Math.round((doneCount / possible) * 100) : 0;

      let pillClasses = '';
      if (isViewing && isCurrentActive) {
        pillClasses = 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/60 scale-102';
      } else if (isCurrentActive) {
        pillClasses = 'bg-emerald-500 text-white shadow-sm';
      } else {
        pillClasses = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700';
      }

      html += `
        <div class="shrink-0 flex items-center rounded-xl p-0.5 transition-all ${pillClasses}">
          <button onclick="switchActiveCycle('${cycle.id}')" 
            title="${escapeHtml(cycle.title)} (${totalDays} kunlik, ${pct}% bajarilgan)" 
            class="px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 text-left cursor-pointer">
            <span class="w-2 h-2 rounded-full ${isCurrentActive ? 'bg-white animate-pulse' : 'bg-emerald-500'}"></span>
            <span class="font-bold truncate max-w-[100px]">${escapeHtml(cycle.title)}</span>
            <span class="text-xs opacity-85 font-mono">(${cycle.currentDay || 1}/${totalDays}k)</span>
            <span class="text-xs font-extrabold opacity-95">${pct}%</span>
          </button>
          <button onclick="finishCycleAndShowResults('${cycle.id}')" title="Ushbu seans natijalarini ko'rish" class="px-1.5 py-1 text-xs opacity-75 hover:opacity-100 transition-opacity cursor-pointer">
            🏁
          </button>
        </div>
      `;
    });

    html += `</div>`;
  }

  // Agar arxivlangan (yakunlangan) seanslar mavjud bo'lsa
  // 3 tadan ko'p bo'lsa bitta tugmaga birlashtiriladi
  if (archivedList.length > 3) {
    html += `
      <div class="flex items-center gap-1.5 pt-1 overflow-x-auto pb-0.5 no-scrollbar">
        <button onclick="openArchivedCyclesModal()" class="shrink-0 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer">
          <span>📦</span>
          <span>Barcha yakunlangan seanslar (${archivedList.length} ta) &rarr;</span>
        </button>
      </div>
    `;
  } else if (archivedList.length > 0) {
    html += `
      <div class="flex items-center gap-1.5 pt-1 overflow-x-auto pb-0.5 no-scrollbar">
        <span class="text-xs text-slate-600 dark:text-slate-400 font-semibold shrink-0">📜 Arxiv:</span>
    `;

    archivedList.forEach((cycle) => {
      const isViewing = cycle.id === viewingId;
      const totalDays = cycle.totalDays || 40;
      const habitsCount = (cycle.habits && cycle.habits.length) || 10;
      const possible = habitsCount * totalDays;
      let doneCount = 0;
      if (cycle.matrix) {
        Object.keys(cycle.matrix).forEach(hId => {
          for (let d = 1; d <= totalDays; d++) {
            if (cycle.matrix[hId] && cycle.matrix[hId][d]) doneCount++;
          }
        });
      }
      const pct = possible > 0 ? Math.round((doneCount / possible) * 100) : 0;

      let archivePillClasses = isViewing 
        ? 'bg-amber-500 text-white font-bold ring-2 ring-amber-400/50' 
        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200';

      html += `
        <button onclick="switchViewingCycle('${cycle.id}')" 
          title="${escapeHtml(cycle.title)} arxivi" 
          class="shrink-0 px-2 py-0.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${archivePillClasses}">
          <span>🏆 ${escapeHtml(cycle.title)} (${totalDays}k)</span>
          <span class="font-bold opacity-80">${pct}%</span>
        </button>
      `;
    });

    html += `</div>`;
  }

  container.innerHTML = html;
}

// ==========================================
// ACCESSIBLE MODAL FRAMEWORK (WCAG 2.2 AA)
// Focus trap, Esc key listener, Backdrop click, Scroll lock, Focus restoration
// ==========================================
let activeModalStack = [];
const modalTriggerMap = new Map();

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  // Oldingi faol fokusni saqlaymiz
  if (document.activeElement && typeof document.activeElement.focus === 'function') {
    modalTriggerMap.set(modalId, document.activeElement);
  }

  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');

  if (!activeModalStack.includes(modalId)) {
    activeModalStack.push(modalId);
  }

  // Fokusni modal ichidagi birinchi fokuslanadigan elementga berish
  setTimeout(() => {
    const focusable = modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      modal.setAttribute('tabindex', '-1');
      modal.focus();
    }
  }, 40);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.add('hidden');
  activeModalStack = activeModalStack.filter(id => id !== modalId);

  if (activeModalStack.length === 0) {
    document.body.classList.remove('overflow-hidden');
  }

  // Oldingi elementga fokusni qaytarish
  const prevTrigger = modalTriggerMap.get(modalId);
  if (prevTrigger && typeof prevTrigger.focus === 'function') {
    try {
      prevTrigger.focus();
    } catch (e) {}
    modalTriggerMap.delete(modalId);
  }
}

// Global modal keyboard trap and Escape key listener (WCAG 2.2 Modal Dialog APG)
document.addEventListener('keydown', (e) => {
  if (activeModalStack.length === 0) return;
  const currentModalId = activeModalStack[activeModalStack.length - 1];
  const modal = document.getElementById(currentModalId);
  if (!modal || modal.classList.contains('hidden')) return;

  if (e.key === 'Escape' || e.key === 'Esc') {
    e.preventDefault();
    closeModal(currentModalId);
    return;
  }

  if (e.key === 'Tab') {
    const focusable = modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }
});

// Modal orqa fonini (backdrop) bosganda yopish
document.addEventListener('click', (e) => {
  if (activeModalStack.length === 0) return;
  const currentModalId = activeModalStack[activeModalStack.length - 1];
  const modal = document.getElementById(currentModalId);
  if (modal && e.target === modal) {
    closeModal(currentModalId);
  }
});

// Tugallangan seanslar modali (3 tadan oshganda)
function openArchivedCyclesModal() {
  ensureCyclesStructure();
  const modal = document.getElementById('archived-cycles-modal');
  const listContainer = document.getElementById('archived-cycles-list');
  const titleEl = document.getElementById('archived-cycles-modal-title');
  if (!modal || !listContainer) return;

  const archivedList = appState.cycles.filter(c => c.status === 'completed');
  if (titleEl) {
    titleEl.innerText = `Tugallangan Seanslar (${archivedList.length} ta)`;
  }

  if (archivedList.length === 0) {
    listContainer.innerHTML = `
      <div class="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Hozircha yakunlangan seanslar mavjud emas.
      </div>
    `;
  } else {
    let html = '';
    archivedList.forEach((cycle, idx) => {
      const totalDays = cycle.totalDays || 40;
      const habitsCount = (cycle.habits && cycle.habits.length) || 10;
      const possible = habitsCount * totalDays;
      let doneCount = 0;
      if (cycle.matrix) {
        Object.keys(cycle.matrix).forEach(hId => {
          for (let d = 1; d <= totalDays; d++) {
            if (cycle.matrix[hId] && cycle.matrix[hId][d]) doneCount++;
          }
        });
      }
      const pct = possible > 0 ? Math.round((doneCount / possible) * 100) : 0;
      const isViewing = cycle.id === appState.viewingCycleId;

      html += `
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border ${isViewing ? 'border-amber-400 ring-1 ring-amber-400/50' : 'border-slate-200 dark:border-slate-700/70'} space-y-2.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm font-black">
                ${idx + 1}
              </span>
              <div>
                <h4 class="font-extrabold text-xs text-slate-800 dark:text-white">
                  ${escapeHtml(cycle.title)}
                </h4>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  ${totalDays} kun · ${habitsCount} ta amal
                </p>
              </div>
            </div>
            <div class="text-right">
              <span class="text-xs font-black text-amber-600 dark:text-amber-400">${pct}%</span>
              <div class="text-xs text-slate-400">${doneCount}/${possible}</div>
            </div>
          </div>

          <div class="flex gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
            <button onclick="switchViewingCycle('${cycle.id}'); closeArchivedCyclesModal();" class="flex-1 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer">
              <span>📊 Jadvalni ko'rish</span>
            </button>
            <button onclick="closeArchivedCyclesModal(); finishCycleAndShowResults('${cycle.id}');" class="flex-1 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer">
              <span>🏆 Hisobot & Natijalar</span>
            </button>
          </div>
        </div>
      `;
    });
    listContainer.innerHTML = html;
  }

  openModal('archived-cycles-modal');
  featherIconsReplace();
}

function closeArchivedCyclesModal() {
  closeModal('archived-cycles-modal');
}

// O'tgan yoki boshqa seans jadvaliga o'tish (Ko'rish rejimi)
function switchViewingCycle(cycleId) {
  ensureCyclesStructure();
  const target = appState.cycles.find(c => c.id === cycleId);
  if (!target) return;

  appState.viewingCycleId = cycleId;
  renderMatrixView();
  featherIconsReplace();
}

// Joriy faol siklga qaytish
function returnToActiveCycle() {
  ensureCyclesStructure();
  appState.viewingCycleId = appState.activeCycleId;
  renderMatrixView();
  featherIconsReplace();
}

// Siklni yakunlash va to'liq natijalarni ko'rsatish
function finishCycleAndShowResults(cycleId) {
  ensureCyclesStructure();
  let targetCycle = null;
  if (cycleId) {
    targetCycle = appState.cycles.find(c => c.id === cycleId);
  }
  if (!targetCycle) {
    targetCycle = getViewingCycle() || getActiveCycle();
  }
  if (!targetCycle) {
    alert("Hozirda natijalarni ko'rsatish uchun seans mavjud emas. Avval yangi seans boshlang!");
    return;
  }

  const isTargetActive = (targetCycle.status === 'active');
  const totalDays = targetCycle.totalDays || 40;
  const currentDay = targetCycle.currentDay || appState.currentDay || 1;
  const remainingDays = totalDays - currentDay;

  // Agar seans hali yakunlanmagan bo'lsa (muddatidan oldin tugatmoqchi bo'lsa), ogohlantirish so'rovi chiqarish
  if (isTargetActive && remainingDays > 0) {
    const cycleTitle = targetCycle.title || `${targetCycle.cycleNumber}-seans`;
    const confirmed = confirm(
      `Seans tugashiga yana ${remainingDays} kun bor.\n\nHaqiqatdan ham ushbu seansni muddatidan oldin yakunlamoqchimisiz?`
    );
    if (!confirmed) {
      return;
    }
  }

  const habits = targetCycle.habits || appState.habits;
  const totalPossible = habits.length * totalDays;
  const matrix = targetCycle.matrix || appState.matrix;

  let totalDone = 0;
  const habitStats = [];

  habits.forEach(h => {
    let done = 0;
    for (let d = 1; d <= totalDays; d++) {
      if (matrix[h.id] && matrix[h.id][d]) done++;
    }
    const pct = totalDays > 0 ? Math.round((done / totalDays) * 100) : 0;
    habitStats.push({ title: h.title, color: h.color, done, pct });
    totalDone += done;
  });

  habitStats.sort((a, b) => b.pct - a.pct);
  const grandPct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  // Modal elementlarini to'ldirish
  const modal = document.getElementById('cycle-results-modal');
  if (!modal) return;

  const titleEl = document.getElementById('cycle-results-modal-title');
  const subEl = document.getElementById('cycle-results-modal-sub');
  const grandPctEl = document.getElementById('cycle-results-grand-pct');
  const totalDoneEl = document.getElementById('cycle-results-total-done');
  const topHabitsEl = document.getElementById('cycle-results-top-habits');
  const adviceEl = document.getElementById('cycle-results-advice');
  const activeBadge = document.getElementById('modal-active-seans-badge');
  const modalNameInput = document.getElementById('modal-new-seans-name');
  const modalDaysInput = document.getElementById('modal-new-seans-days');

  const activeCount = getActiveCycles().length;
  if (activeBadge) {
    activeBadge.innerText = `Faol: ${activeCount}/3 ta`;
  }

  // Mavjud seanslarni tanlash tugmalarini chizish
  const resultsTabs = document.getElementById('cycle-results-seans-tabs');
  const resultsTabsBox = document.getElementById('cycle-results-seans-tabs-box');
  if (resultsTabs) {
    const activeList = getActiveCycles();
    if (activeList.length > 0) {
      let rHtml = '';
      activeList.forEach(c => {
        const isCur = c.id === targetCycle.id;
        rHtml += `
          <button type="button" onclick="selectSeansFromResultsModal('${c.id}')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isCur
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }">
            ⚡ ${escapeHtml(c.title)}
          </button>
        `;
      });
      resultsTabs.innerHTML = rHtml;
      if (resultsTabsBox) resultsTabsBox.classList.remove('hidden');
    } else {
      if (resultsTabsBox) resultsTabsBox.classList.add('hidden');
    }
  }

  if (modalNameInput) {
    modalNameInput.value = `${appState.cycles.length + 1}-seans`;
  }
  if (modalDaysInput) {
    modalDaysInput.value = 40;
    updateModalDaysPreview(40);
  }

  const cycleTitle = targetCycle.title || `${targetCycle.cycleNumber}-seans`;
  if (titleEl) {
    titleEl.innerText = `Tabriklaymiz! ${cycleTitle} (${totalDays} kun) natijalari 🏆`;
  }
  if (subEl) {
    subEl.innerText = `Alloh qabul qilsin! Seans hisoboti tayyor.`;
  }
  if (grandPctEl) {
    grandPctEl.innerText = `${grandPct}%`;
  }
  if (totalDoneEl) {
    totalDoneEl.innerText = `${totalDone}/${totalPossible}`;
  }

  if (topHabitsEl) {
    let topHtml = '';
    const top3 = habitStats.slice(0, 3);
    top3.forEach((item, idx) => {
      topHtml += `
        <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
              #${idx + 1}
            </span>
            <span class="font-semibold text-slate-800 dark:text-slate-200">${escapeHtml(item.title)}</span>
          </div>
          <span class="font-extrabold text-emerald-600 dark:text-emerald-400">${item.pct}% (${item.done}/${totalDays})</span>
        </div>
      `;
    });
    topHabitsEl.innerHTML = topHtml;
  }

  if (adviceEl) {
    if (grandPct >= 80) {
      adviceEl.innerHTML = `<strong>A'lo daraja!</strong> Intizomingiz juda yuqori bo'ldi (${grandPct}%). Ushbu barakali amallarni yangi seansda ham davom ettiring!`;
    } else if (grandPct >= 50) {
      adviceEl.innerHTML = `<strong>Yaxshi natija!</strong> O'rtacha ${grandPct}% ko'rsatkich. Zaifroq amallarga ko'proq e'tibor qaratsangiz, yanada mukammal bo'ladi!`;
    } else {
      adviceEl.innerHTML = `<strong>Boshlanishi yomon emas!</strong> ${grandPct}% bajarildi. Muhimi to'xtamaslik. Yangi seansni yangi niyat va quvvat bilan boshlang!`;
    }
  }

  triggerConfetti();
  openModal('cycle-results-modal');
}

function closeCycleResultsModal() {
  closeModal('cycle-results-modal');
}

// Yangi Seans Yaratish Funksiyasi (Kunlar: 1 — 40, bir vaqtda 3 tagacha faol)
function createNewSeans(name, days) {
  ensureCyclesStructure();
  const activeList = getActiveCycles();
  if (activeList.length >= 3) {
    alert("Diqqat! Bir vaqtning o'zida maksimal 3 ta seans faol bo'lishi mumkin! Yangi seans boshlash uchun avval mavjud seanslardan birini yakunlang (arxivlang).");
    return false;
  }

  // Foydalanuvchi kiritgan kun: min 1, max 40
  let numDays = parseInt(days, 10);
  if (isNaN(numDays) || numDays < 1) numDays = 1;
  if (numDays > 40) numDays = 40;

  const nextNumber = appState.cycles.length + 1;
  const newId = `seans_${Date.now()}`;
  const seansTitle = name && name.trim() ? name.trim() : `${nextNumber}-seans`;

  // Yangi seans bo'sh amallar ro'yxati bilan boshlanadi (foydalanuvchi o'zi amallarni kiritadi)
  const habits = [];
  const cleanMatrix = {};

  const newSeans = {
    id: newId,
    cycleNumber: nextNumber,
    title: seansTitle,
    totalDays: numDays,
    currentDay: 1,
    startDate: new Date().toISOString().split('T')[0],
    status: 'active',
    completedAt: null,
    matrix: cleanMatrix,
    habits: habits,
    finalStats: null,
    notes: ''
  };

  appState.cycles.push(newSeans);
  appState.activeCycleId = newId;
  appState.viewingCycleId = newId;
  settingsViewingCycleId = newId;
  statsViewingCycleId = newId;
  appState.currentDay = 1;
  appState.habits = habits;
  appState.matrix = cleanMatrix;

  saveData();
  renderApp();
  triggerConfetti();

  // Yangi seans ochilgach darhol "Vazifalar qo'shish" (Sozlamalar) bo'limiga yo'naltiriladi
  goToSettingsAddHabits(newId);
  return true;
}

// Modal orqali yangi seansni boshlash
function startNewCycleFromModal() {
  const nameInput = document.getElementById('modal-new-seans-name');
  const daysInput = document.getElementById('modal-new-seans-days');
  const name = nameInput ? nameInput.value : '';
  let days = daysInput ? parseInt(daysInput.value, 10) : 40;
  if (isNaN(days) || days < 1) days = 1;
  if (days > 40) days = 40;
  if (daysInput) daysInput.value = days;

  const success = createNewSeans(name, days);
  if (success) {
    closeCycleResultsModal();
  }
}

// Seansni yakunlab arxivlash
function archiveCurrentSeansAndClose() {
  ensureCyclesStructure();
  const target = getViewingCycle();
  if (!target) return;

  target.status = 'completed';
  target.completedAt = new Date().toISOString();

  // Agar bu joriy faol seans bo'lsa, qolgan faol seanslardan biriga o'tkazamiz
  const remainingActive = getActiveCycles();
  if (remainingActive.length > 0) {
    appState.activeCycleId = remainingActive[0].id;
    appState.viewingCycleId = remainingActive[0].id;
    statsViewingCycleId = remainingActive[0].id;
    appState.matrix = remainingActive[0].matrix;
    appState.habits = remainingActive[0].habits;
    appState.currentDay = remainingActive[0].currentDay || 1;
  } else {
    statsViewingCycleId = null;
  }

  saveData();
  closeCycleResultsModal();
  renderApp();
  alert(`"${target.title || `${target.cycleNumber}-seans`}" muvaffaqiyatli arxivlandi!`);
}

// Yangi Seans Ochish Modali yordamchilari
function openCreateSeansModal() {
  ensureCyclesStructure();
  const activeList = getActiveCycles();
  const modal = document.getElementById('create-seans-modal');
  const infoEl = document.getElementById('create-seans-slots-info');
  const nameInput = document.getElementById('new-seans-name-input');
  const daysInput = document.getElementById('new-seans-days-input');

  if (activeList.length >= 3) {
    alert("Diqqat! Ayni paytda maksimal 3 ta seans faol ishlamoqda. Yangi seans boshlash uchun avval mavjud seanslardan birini yakunlang (arxivlang).");
    return;
  }

  if (infoEl) {
    if (activeList.length === 0) {
      infoEl.innerText = "Yangi seans oching va amallarni boshlang (bir vaqtda 3 tagacha seans faol bo'ladi).";
    } else {
      infoEl.innerText = `Faol seanslar: ${activeList.length}/3 ta. Yangi seans qo'shishingiz mumkin.`;
    }
  }
  if (nameInput) {
    nameInput.value = `${(appState.cycles ? appState.cycles.length : 0) + 1}-seans`;
  }
  if (daysInput) {
    daysInput.value = 40;
    updateSeansDaysPreview(40);
  }

  // Faol seanslarni tanlash tugmalarini chizish
  const tabsContainer = document.getElementById('create-modal-seans-tabs');
  const box = document.getElementById('create-modal-existing-seans-box');
  if (tabsContainer) {
    if (activeList.length > 0) {
      let tHtml = '';
      activeList.forEach(c => {
        const isCur = c.id === appState.activeCycleId;
        tHtml += `
          <button type="button" onclick="selectSeansFromCreateModal('${c.id}')" class="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            isCur
              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/50'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
          }">
            <span>⚡</span>
            <span>${escapeHtml(c.title)}</span>
            <span class="text-xs opacity-75 font-mono">(${c.currentDay || 1}/${c.totalDays || 40}k)</span>
          </button>
        `;
      });
      tabsContainer.innerHTML = tHtml;
      if (box) box.classList.remove('hidden');
    } else {
      if (box) box.classList.add('hidden');
    }
  }

  openModal('create-seans-modal');
}

function closeCreateSeansModal() {
  closeModal('create-seans-modal');
}

function setNewSeansDays(days) {
  const input = document.getElementById('new-seans-days-input');
  if (input) {
    input.value = days;
    updateSeansDaysPreview(days);
  }
}

function updateSeansDaysPreview(days) {
  const input = document.getElementById('new-seans-days-input');
  const preview = document.getElementById('new-seans-days-preview');
  if (!preview) return;

  if (days === '' || days === null || days === undefined) {
    preview.innerText = '1 — 40 kun';
    return;
  }

  let d = parseInt(days, 10);
  if (isNaN(d)) {
    preview.innerText = '1 — 40 kun';
    if (input) input.value = '';
    return;
  }

  if (d > 40) {
    d = 40;
    if (input) input.value = 40;
  } else if (d < 1) {
    d = 1;
    if (input) input.value = 1;
  } else if (input && parseInt(input.value, 10) !== d) {
    input.value = d;
  }

  preview.innerText = `${d} kun`;
}

function setModalSeansDays(days) {
  const input = document.getElementById('modal-new-seans-days');
  if (input) {
    input.value = days;
    updateModalDaysPreview(days);
  }
}

function updateModalDaysPreview(days) {
  const input = document.getElementById('modal-new-seans-days');
  const preview = document.getElementById('modal-days-preview');
  if (!preview) return;

  if (days === '' || days === null || days === undefined) {
    preview.innerText = '1 — 40 kun';
    return;
  }

  let d = parseInt(days, 10);
  if (isNaN(d)) {
    preview.innerText = '1 — 40 kun';
    if (input) input.value = '';
    return;
  }

  if (d > 40) {
    d = 40;
    if (input) input.value = 40;
  } else if (d < 1) {
    d = 1;
    if (input) input.value = 1;
  } else if (input && parseInt(input.value, 10) !== d) {
    input.value = d;
  }

  preview.innerText = `${d} kun`;
}

function confirmCreateSeansModal() {
  const nameInput = document.getElementById('new-seans-name-input');
  const daysInput = document.getElementById('new-seans-days-input');
  const name = nameInput ? nameInput.value : '';
  let days = daysInput ? parseInt(daysInput.value, 10) : 40;

  if (isNaN(days) || days < 1) days = 1;
  if (days > 40) days = 40;
  if (daysInput) daysInput.value = days;

  const success = createNewSeans(name, days);
  if (success) {
    closeCreateSeansModal();
  }
}

function renderMatrixHighlight() {
  renderMatrixView();
}

// ==========================================
// ZIKR, ISTIG'FOR VA TASBEH HISOB-KITOBI (FOYDALANUVCHI O'ZI KIRITADI)
// ==========================================
const ZIKR_TEMPLATES = {
  istigfor: {
    name: "Istig'for",
    text: "Astag'firulloh al-Aziym va atubu ilayh",
    target: 100
  },
  salovat: {
    name: "Salovat",
    text: "Allohumma solli 'ala sayyidina Muhammad",
    target: 100
  },
  subhanalloh: {
    name: "Subhanalloh",
    text: "Subhanallohi va bihamdihi, Subhanallohil-Aziym",
    target: 33
  },
  alhamdulillah: {
    name: "Alhamdulillah",
    text: "Alhamdulillah 'ala kulli hol",
    target: 33
  },
  allohu_akbar: {
    name: "Allohu Akbar",
    text: "Allohu Akbar kabiro val-hamdu lillahi kasiro",
    target: 33
  },
  tavhid: {
    name: "Tavhid kalimasi",
    text: "La ilaha illallohu vahdahu la sharika lah, lahul-mulku va lahul-hamd",
    target: 100
  },
  ixlos: {
    name: "Ixlos Surasi",
    text: "Qul huvallohu ahad. Allohus-somad. Lam yalid va lam yulad. Va lam yakun lahu kufuvan ahad.",
    target: 1001
  }
};

function checkProfileBeforeZikrAction() {
  const isProfileDone = appState.profileCompleted && appState.profileName && appState.profileName.trim().length > 0;
  if (!isProfileDone) {
    openProfileModal(true, 'tasbeh');
    return false;
  }
  return true;
}

function applyZikrTemplate(key) {
  if (!checkProfileBeforeZikrAction()) return;
  const tpl = ZIKR_TEMPLATES[key];
  if (!tpl) return;
  const nameEl = document.getElementById('new-zikr-name');
  const textEl = document.getElementById('new-zikr-text');
  const targetEl = document.getElementById('new-zikr-target');
  if (nameEl) nameEl.value = tpl.name;
  if (textEl) textEl.value = tpl.text;
  if (targetEl) targetEl.value = tpl.target;
  if (nameEl) nameEl.focus();
}

function focusNewZikrInput() {
  if (!checkProfileBeforeZikrAction()) return;
  const nameEl = document.getElementById('new-zikr-name');
  if (nameEl) {
    nameEl.focus();
    nameEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function getActiveCustomZikr() {
  if (!Array.isArray(appState.customZikrs) || appState.customZikrs.length === 0) {
    return null;
  }
  let current = appState.customZikrs.find(z => z.id === appState.activeTasbehId);
  if (!current) {
    current = appState.customZikrs[0];
    appState.activeTasbehId = current.id;
  }
  return current;
}

function switchTasbehTab(id) {
  appState.activeTasbehId = id;
  saveData();
  renderTasbehView();
  featherIconsReplace();
}

function addNewCustomZikr() {
  if (!checkProfileBeforeZikrAction()) return;

  const nameEl = document.getElementById('new-zikr-name');
  const textEl = document.getElementById('new-zikr-text');
  const targetEl = document.getElementById('new-zikr-target');

  const nameVal = nameEl ? nameEl.value.trim() : '';
  const textVal = textEl ? textEl.value.trim() : '';
  const targetVal = targetEl ? parseInt(targetEl.value, 10) : 100;

  if (!nameVal) {
    alert("Iltimos, zikr yoki amal nomini kiriting!");
    if (nameEl) nameEl.focus();
    return;
  }

  if (isNaN(targetVal) || targetVal <= 0) {
    alert("Iltimos, maqsad sonini musbat son ko'rinishida kiriting (masalan: 33 yoki 100)!");
    if (targetEl) targetEl.focus();
    return;
  }

  if (!Array.isArray(appState.customZikrs)) {
    appState.customZikrs = [];
  }

  const newZikr = {
    id: 'zikr_' + Date.now(),
    name: nameVal,
    text: textVal || `"${nameVal}"`,
    target: targetVal,
    count: 0
  };

  appState.customZikrs.push(newZikr);
  appState.activeTasbehId = newZikr.id;
  saveData();

  if (nameEl) nameEl.value = '';
  if (textEl) textEl.value = '';
  if (targetEl) targetEl.value = '100';

  renderTasbehView();
  triggerConfetti();
  playTone(880, 0.15);
}

function deleteActiveCustomZikr() {
  const current = getActiveCustomZikr();
  if (!current) return;
  if (confirm(`"${current.name}" zikrini o'chirmoqchimisiz?`)) {
    appState.customZikrs = (appState.customZikrs || []).filter(z => z.id !== current.id);
    if (appState.customZikrs.length > 0) {
      appState.activeTasbehId = appState.customZikrs[0].id;
    } else {
      appState.activeTasbehId = null;
    }
    saveData();
    renderTasbehView();
  }
}

function renderTasbehView() {
  const emptyState = document.getElementById('tasbeh-empty-state');
  const activeContainer = document.getElementById('tasbeh-active-container');
  const zikrCountBadge = document.getElementById('tasbeh-zikr-count-badge');
  const currentZikr = getActiveCustomZikr();

  const totalCount = Array.isArray(appState.customZikrs) ? appState.customZikrs.length : 0;
  if (zikrCountBadge) {
    zikrCountBadge.innerText = totalCount > 0 ? `${totalCount} ta zikr` : '';
  }

  if (!currentZikr) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (activeContainer) activeContainer.classList.add('hidden');
    checkTasbehCompletion();
    featherIconsReplace();
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (activeContainer) activeContainer.classList.remove('hidden');

  const count = currentZikr.count || 0;
  const target = currentZikr.target || 100;
  const pct = Math.min(100, Math.round((count / target) * 100));

  // Tab tugmalari
  const tabsContainer = document.getElementById('tasbeh-type-tabs');
  if (tabsContainer) {
    let tabsHtml = '';
    (appState.customZikrs || []).forEach(z => {
      const isAct = z.id === currentZikr.id;
      const c = z.count || 0;
      tabsHtml += `
        <button type="button" onclick="switchTasbehTab('${z.id}')" class="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
          isAct 
            ? 'bg-emerald-600 text-white shadow-md' 
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
        }">
          ${escapeHtml(z.name)} (${c}/${z.target})
        </button>
      `;
    });
    tabsContainer.innerHTML = tabsHtml;
  }

  // Asosiy hisoblagich
  const titleEl = document.getElementById('tasbeh-current-title');
  const textEl = document.getElementById('tasbeh-current-text');
  const countEl = document.getElementById('tasbeh-current-count');
  const targetEl = document.getElementById('tasbeh-current-target');
  const progressCircle = document.getElementById('tasbeh-circle-progress');

  if (titleEl) titleEl.innerText = currentZikr.name;
  if (textEl) textEl.innerText = currentZikr.text ? (currentZikr.text.startsWith('"') ? currentZikr.text : `"${currentZikr.text}"`) : '';
  if (countEl) countEl.innerText = count;
  if (targetEl) targetEl.innerText = `/ ${target} ta`;

  if (progressCircle) {
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = offset;
  }

  checkTasbehCompletion();
  featherIconsReplace();
}

function incrementTasbeh() {
  const currentZikr = getActiveCustomZikr();
  if (!currentZikr) return;
  const target = currentZikr.target || 100;
  let count = currentZikr.count || 0;

  if (count < target) {
    count++;
    currentZikr.count = count;
    saveData();

    // Haptic feedback & Sound
    triggerHaptic();
    playTone(440, 0.04);

    // Animatsiya
    const btn = document.getElementById('tasbeh-big-button');
    if (btn) {
      btn.classList.add('tasbeh-press');
      setTimeout(() => btn.classList.remove('tasbeh-press'), 150);
    }

    renderTasbehView();

    // Agar 100% ga yetgan bo'lsa
    if (count === target) {
      triggerConfetti();
      playTone(880, 0.25);
    }
  }
}

function resetTasbeh() {
  const currentZikr = getActiveCustomZikr();
  if (!currentZikr) return;
  if (confirm(`"${currentZikr.name}" hisoblagichini nollashtirmoqchimisiz?`)) {
    currentZikr.count = 0;
    saveData();
    renderTasbehView();
  }
}

function markIstigforHabitDone() {
  const activeCycle = getActiveCycle();
  if (!activeCycle) {
    alert("Seans mavjud emas. Avval yangi seans boshlang.");
    return;
  }
  let habit = (activeCycle.habits || []).find(h => 
    (h.id && (h.id.includes('istigfor') || h.id.includes('zikr'))) ||
    (h.name && (h.name.toLowerCase().includes('istig\'for') || h.name.toLowerCase().includes('zikr') || h.name.toLowerCase().includes('tasbeh')))
  );
  if (!habit && activeCycle.habits && activeCycle.habits.length > 0) {
    habit = activeCycle.habits[0];
  }
  if (!habit) {
    alert("Bu seansda zikr amali topilmadi.");
    return;
  }
  const day = activeCycle.currentDay || 1;
  if (!activeCycle.matrix) activeCycle.matrix = {};
  if (!activeCycle.matrix[habit.id]) activeCycle.matrix[habit.id] = {};
  activeCycle.matrix[habit.id][day] = true;
  saveData();
  triggerConfetti();
  alert(`Alhamdulillah! ${day}-kunning "${habit.name}" amali bajarildi deb belgilandi!`);
  renderApp();
}

function checkTasbehCompletion() {
  const completeBtn = document.getElementById('tasbeh-complete-habit-btn');
  if (!completeBtn) return;
  const currentZikr = getActiveCustomZikr();
  if (currentZikr && currentZikr.count >= currentZikr.target) {
    completeBtn.classList.remove('hidden');
  } else {
    completeBtn.classList.add('hidden');
  }
}

// ==========================================
// INTIZOM DINAMIKASI VIZUAL GRAFIGI (SVG CHART - HAR BIR SEANS UCHUN ALOHIDA)
// ==========================================
function renderDisciplineChart(targetCycle) {
  const container = document.getElementById('stats-chart-container');
  const bestBadge = document.getElementById('chart-best-day-badge');
  const daysBadge = document.getElementById('stats-chart-days-badge');
  const subtitleEl = document.getElementById('stats-chart-subtitle');
  const avgPctEl = document.getElementById('chart-avg-pct');
  const peakDayEl = document.getElementById('chart-peak-day');
  const activeDaysCountEl = document.getElementById('chart-active-days-count');

  if (!container) return;

  if (!targetCycle) {
    container.innerHTML = `
      <div class="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
        Grafikni ko'rish uchun avval yangi seans boshlang.
      </div>
    `;
    if (daysBadge) daysBadge.innerText = '0 kunlik';
    if (subtitleEl) subtitleEl.innerText = "Kunlik ko'tarilish va pasayish dinamikasi";
    if (bestBadge) bestBadge.innerText = 'Eng yuqori: 0%';
    if (avgPctEl) avgPctEl.innerText = '0%';
    if (peakDayEl) peakDayEl.innerText = '0-kun';
    if (activeDaysCountEl) activeDaysCountEl.innerText = '0 / 0 kun';
    return;
  }

  const totalDays = targetCycle.totalDays || 40;
  const cycleHabits = targetCycle.habits || [];
  const cycleMatrix = targetCycle.matrix || {};
  const currentDay = targetCycle.currentDay || 1;

  if (daysBadge) {
    daysBadge.innerText = `${totalDays} kunlik`;
  }
  if (subtitleEl) {
    subtitleEl.innerText = `${targetCycle.title || 'Seans'} — ${totalDays} kunlik dinamika`;
  }

  if (cycleHabits.length === 0) {
    container.innerHTML = `
      <div class="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
        Ushbu seansda hali amallar mavjud emas.
      </div>
    `;
    if (bestBadge) bestBadge.innerText = 'Eng yuqori: 0%';
    if (avgPctEl) avgPctEl.innerText = '0%';
    if (peakDayEl) peakDayEl.innerText = '0-kun';
    if (activeDaysCountEl) activeDaysCountEl.innerText = `0 / ${totalDays} kun`;
    return;
  }

  // Tanlangan seans kunlari bo'yicha hisob-kitob
  const dailyData = [];
  let bestDay = 1;
  let bestPct = 0;
  let bestCount = 0;
  let totalPctSum = 0;
  let activeDaysCount = 0;

  for (let d = 1; d <= totalDays; d++) {
    let count = 0;
    cycleHabits.forEach(h => {
      if (cycleMatrix[h.id] && cycleMatrix[h.id][d]) count++;
    });
    const pct = cycleHabits.length > 0 ? Math.round((count / cycleHabits.length) * 100) : 0;
    dailyData.push({ day: d, count, pct });
    if (pct > bestPct) {
      bestPct = pct;
      bestDay = d;
      bestCount = count;
    }
    if (count > 0) activeDaysCount++;
    totalPctSum += pct;
  }

  const avgPct = totalDays > 0 ? Math.round(totalPctSum / totalDays) : 0;

  if (bestBadge) bestBadge.innerText = `Eng yuqori: ${bestPct}% (${bestDay}-kun)`;
  if (avgPctEl) avgPctEl.innerText = `${avgPct}%`;
  if (peakDayEl) peakDayEl.innerText = `${bestDay}-kun (${bestCount} ta)`;
  if (activeDaysCountEl) activeDaysCountEl.innerText = `${activeDaysCount} / ${totalDays} kun`;

  // SVG koordinatalari
  const svgWidth = 760;
  const svgHeight = 180;
  const padLeft = 32;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 25;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const getX = (d) => padLeft + ((d - 1) / Math.max(1, totalDays - 1)) * plotWidth;
  const getY = (pct) => padTop + (1 - pct / 100) * plotHeight;

  // Grid chiziqlari (100%, 50%, 0%)
  const gridLines = [100, 50, 0].map(val => {
    const y = getY(val);
    return `
      <line x1="${padLeft}" y1="${y}" x2="${svgWidth - padRight}" y2="${y}" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="3 3"/>
      <text x="${padLeft - 6}" y="${y + 3}" fill="currentColor" opacity="0.4" font-size="9" text-anchor="end" font-weight="600">${val}%</text>
    `;
  }).join('');

  // Silliq egri chiziq va to'ldirish maydoni (Cubic Bezier Spline)
  let pathD = '';
  let areaD = '';

  dailyData.forEach((pt, i) => {
    const x = getX(pt.day);
    const y = getY(pt.pct);
    if (i === 0) {
      pathD += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      areaD += `M ${x.toFixed(1)} ${getY(0).toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    } else {
      const prevPt = dailyData[i - 1];
      const prevX = getX(prevPt.day);
      const prevY = getY(prevPt.pct);
      const cpX1 = prevX + (x - prevX) / 2;
      const cpX2 = cpX1;
      pathD += ` C ${cpX1.toFixed(1)} ${prevY.toFixed(1)}, ${cpX2.toFixed(1)} ${y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
      areaD += ` C ${cpX1.toFixed(1)} ${prevY.toFixed(1)}, ${cpX2.toFixed(1)} ${y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
  });

  areaD += ` L ${getX(totalDays).toFixed(1)} ${getY(0).toFixed(1)} Z`;

  // X o'qi matnlari (1 dan totalDays gacha mutanosib oraliqda)
  const labelDays = [];
  if (totalDays <= 7) {
    for (let d = 1; d <= totalDays; d++) labelDays.push(d);
  } else if (totalDays <= 14) {
    [1, Math.round(totalDays / 2), totalDays].forEach(d => { if (!labelDays.includes(d)) labelDays.push(d); });
  } else if (totalDays <= 28) {
    [1, Math.round(totalDays * 0.33), Math.round(totalDays * 0.66), totalDays].forEach(d => { if (!labelDays.includes(d)) labelDays.push(d); });
  } else {
    [1, Math.round(totalDays * 0.25), Math.round(totalDays * 0.5), Math.round(totalDays * 0.75), totalDays].forEach(d => { if (!labelDays.includes(d)) labelDays.push(d); });
  }

  const xAxisLabels = labelDays.map(d => {
    const x = getX(d);
    return `
      <text x="${x.toFixed(1)}" y="${svgHeight - 6}" fill="currentColor" opacity="0.5" font-size="9" text-anchor="middle" font-weight="600">${d}-kun</text>
    `;
  }).join('');

  // Nuqtalar va interaktiv ustunlar
  const colWidth = plotWidth / Math.max(1, totalDays);
  const nodes = dailyData.map(pt => {
    const x = getX(pt.day);
    const y = getY(pt.pct);
    const isCurrent = pt.day === currentDay;
    const isBest = pt.pct > 0 && pt.pct === bestPct;
    const dotColor = pt.pct >= 80 ? '#10b981' : (pt.pct >= 50 ? '#14b8a6' : (pt.pct > 0 ? '#f59e0b' : '#94a3b8'));

    return `
      <g class="cursor-pointer group" onmouseover="showStatsTooltip(${pt.day}, ${pt.count}, ${cycleHabits.length}, ${pt.pct}, this)" onmouseout="hideStatsTooltip()" onclick="showStatsTooltip(${pt.day}, ${pt.count}, ${cycleHabits.length}, ${pt.pct}, this)">
        <rect x="${(x - colWidth / 2).toFixed(1)}" y="${padTop}" width="${colWidth.toFixed(1)}" height="${plotHeight}" fill="transparent" class="hover:fill-emerald-500/10 transition-colors"/>
        ${isCurrent ? `<line x1="${x.toFixed(1)}" y1="${padTop}" x2="${x.toFixed(1)}" y2="${getY(0).toFixed(1)}" stroke="#10b981" stroke-width="1.5" stroke-dasharray="2 2" opacity="0.6"/>` : ''}
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${isCurrent ? '5' : (pt.pct > 0 ? '3.5' : '2.5')}" fill="${isCurrent ? '#059669' : dotColor}" stroke="#ffffff" stroke-width="${isCurrent ? '2' : '1.5'}" class="transition-transform group-hover:scale-150"/>
        ${isBest && pt.pct > 0 ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.7"/>` : ''}
      </g>
    `;
  }).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="w-full h-auto text-slate-700 dark:text-slate-300 overflow-visible select-none">
      <defs>
        <linearGradient id="chartGradientArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.38"/>
          <stop offset="60%" stop-color="#14b8a6" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#0f766e" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${areaD}" fill="url(#chartGradientArea)"/>
      <path d="${pathD}" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${xAxisLabels}
      ${nodes}
    </svg>
  `;
}

function showStatsTooltip(day, count, total, pct, el) {
  const tooltip = document.getElementById('stats-chart-tooltip');
  const dayEl = document.getElementById('stats-chart-tooltip-day');
  const valEl = document.getElementById('stats-chart-tooltip-val');
  if (!tooltip || !dayEl || !valEl) return;

  dayEl.innerText = `${day}-kun natijasi`;
  valEl.innerHTML = `<span class="font-bold text-white">${count} / ${total}</span> amal (<span class="font-bold text-emerald-400">${pct}%</span>)`;
  
  if (el) {
    const rect = el.getBoundingClientRect();
    const parent = tooltip.parentElement.getBoundingClientRect();
    const x = rect.left - parent.left + (rect.width / 2);
    const y = rect.top - parent.top;
    tooltip.style.left = `${Math.max(40, Math.min(parent.width - 40, x))}px`;
    tooltip.style.top = `${Math.max(5, y - 6)}px`;
    tooltip.classList.remove('hidden');
  }
}

function hideStatsTooltip() {
  const tooltip = document.getElementById('stats-chart-tooltip');
  if (tooltip) tooltip.classList.add('hidden');
}

// TAHLIL BO'LIMIDA SEANSLARNI BOSHQARISH VA ALOHIDA KO'RISH
let statsViewingCycleId = null;

function getStatsCycle() {
  ensureCyclesStructure();
  if (!statsViewingCycleId) {
    statsViewingCycleId = appState.activeCycleId;
  }
  let found = appState.cycles.find(c => c.id === statsViewingCycleId);
  if (!found) {
    statsViewingCycleId = appState.activeCycleId || (appState.cycles[0] && appState.cycles[0].id);
    found = appState.cycles.find(c => c.id === statsViewingCycleId);
  }
  return found || getActiveCycle();
}

function switchStatsCycle(cycleId) {
  statsViewingCycleId = cycleId;
  renderStatsView();
}

function renderStatsCyclesBar(selectedCycleId) {
  const container = document.getElementById('stats-cycles-bar');
  if (!container) return;

  ensureCyclesStructure();
  if (!Array.isArray(appState.cycles) || appState.cycles.length === 0) {
    container.innerHTML = '';
    return;
  }

  const allCycles = appState.cycles;
  if (allCycles.length <= 1) {
    const c = allCycles[0];
    const totalDays = c.totalDays || 40;
    container.innerHTML = `
      <div class="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
        <span class="font-bold text-slate-700 dark:text-slate-300">Seans: <span class="text-emerald-600 dark:text-emerald-400">${escapeHtml(c.title || '1-seans')}</span> (${totalDays} kunlik)</span>
        <span class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs">${c.status === 'completed' ? 'Arxivlangan' : 'Faol'}</span>
      </div>
    `;
    return;
  }

  let html = `
    <div class="flex items-center justify-between px-1 mb-1">
      <span class="text-xs font-bold text-slate-600 dark:text-slate-400">📊 Tahlil qilinadigan seans:</span>
      <span class="text-xs text-slate-400 font-medium">Jami: ${allCycles.length} ta</span>
    </div>
    <div class="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
  `;

  allCycles.forEach(c => {
    const isSelected = c.id === selectedCycleId;
    const totalDays = c.totalDays || 40;
    const habitsCount = (c.habits && c.habits.length) || 0;
    const possible = habitsCount * totalDays;

    let doneCount = 0;
    if (c.matrix) {
      Object.keys(c.matrix).forEach(hId => {
        for (let d = 1; d <= totalDays; d++) {
          if (c.matrix[hId] && c.matrix[hId][d]) doneCount++;
        }
      });
    }
    const pct = possible > 0 ? Math.round((doneCount / possible) * 100) : 0;

    let pillClasses = '';
    if (isSelected) {
      pillClasses = 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/60 font-bold';
    } else {
      pillClasses = 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700';
    }

    html += `
      <button onclick="switchStatsCycle('${c.id}')" 
        class="shrink-0 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${pillClasses}">
        <span class="w-2 h-2 rounded-full ${isSelected ? 'bg-white' : (c.status === 'completed' ? 'bg-amber-400' : 'bg-emerald-500')}"></span>
        <span class="truncate max-w-[120px]">${escapeHtml(c.title || `${c.cycleNumber || 1}-seans`)}</span>
        <span class="text-xs opacity-80 font-mono">(${totalDays}k)</span>
        <span class="text-xs font-extrabold ${isSelected ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'}">${pct}%</span>
      </button>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// STATISTIKA VA TAHLIL (HAR BIR SEANS UCHUN ALOHIDA)
function renderStatsView() {
  ensureCyclesStructure();
  const targetCycle = getStatsCycle();

  renderStatsCyclesBar(targetCycle ? targetCycle.id : null);

  const overallPctEl = document.getElementById('stats-overall-pct');
  const totalPointsEl = document.getElementById('stats-total-points');
  const cycleBadgeEl = document.getElementById('stats-cycle-badge');
  const habitsRankingContainer = document.getElementById('stats-habits-ranking');

  if (!targetCycle) {
    if (overallPctEl) overallPctEl.innerText = '0%';
    if (totalPointsEl) totalPointsEl.innerText = '0 / 0';
    if (cycleBadgeEl) cycleBadgeEl.innerText = "Seans yo'q";
    renderDisciplineChart(null);
    if (habitsRankingContainer) {
      habitsRankingContainer.innerHTML = `
        <div class="p-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
          <div class="text-2xl">📈</div>
          <div class="font-bold text-slate-700 dark:text-slate-300">Seanslar mavjud emas</div>
          <p>Tahlil va statistikani ko'rish uchun avval yangi seans boshlang.</p>
          <button onclick="handleStartNewAction()" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer">
            + Yangi seans
          </button>
        </div>
      `;
    }
    return;
  }

  const totalDays = targetCycle.totalDays || 40;
  const cycleHabits = targetCycle.habits || [];
  const cycleMatrix = targetCycle.matrix || {};

  if (cycleBadgeEl) {
    cycleBadgeEl.innerText = `${targetCycle.title || 'Seans'} (${totalDays} kunlik)`;
  }

  // 1. Umumiy hisob (Faqatgina ushbu tanlangan seans bo'yicha)
  let totalChecked = 0;
  let totalPossible = cycleHabits.length * totalDays;
  
  cycleHabits.forEach(h => {
    if (cycleMatrix[h.id]) {
      for (let d = 1; d <= totalDays; d++) {
        if (cycleMatrix[h.id][d]) totalChecked++;
      }
    }
  });
  
  const overallPct = totalPossible > 0 ? Math.round((totalChecked / totalPossible) * 100) : 0;
  
  if (overallPctEl) overallPctEl.innerText = `${overallPct}%`;
  if (totalPointsEl) totalPointsEl.innerText = `${totalChecked} / ${totalPossible}`;

  // Vizual grafikni chizamiz (Tanlangan seans ma'lumotlari bilan)
  renderDisciplineChart(targetCycle);

  // 2. Har bir amal reytingi (Aynan tanlangan seans bo'yicha)
  if (habitsRankingContainer) {
    if (cycleHabits.length === 0) {
      habitsRankingContainer.innerHTML = `
        <div class="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
          <p class="text-xs text-slate-500 dark:text-slate-400">Ushbu seansda hozircha amallar mavjud emas.</p>
          <button onclick="goToSettingsAddHabits('${targetCycle.id}')" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-transform active:scale-95">
            + Yangi amal qo'shish
          </button>
        </div>
      `;
      return;
    }

    let habitsStats = cycleHabits.map(h => {
      let count = 0;
      for (let d = 1; d <= totalDays; d++) {
        if (cycleMatrix[h.id] && cycleMatrix[h.id][d]) count++;
      }
      return {
        ...h,
        count,
        pct: totalDays > 0 ? Math.round((count / totalDays) * 100) : 0
      };
    });

    habitsStats.sort((a, b) => b.count - a.count);

    let html = '';
    habitsStats.forEach((h, index) => {
      html += `
        <div class="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/70 shadow-sm">
          <div class="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span class="flex items-center gap-2 text-slate-800 dark:text-slate-100 truncate">
              <span class="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                ${index + 1}
              </span>
              ${escapeHtml(h.title)}
            </span>
            <span class="text-emerald-600 dark:text-emerald-400 font-bold">${h.count}/${totalDays} kun (${h.pct}%)</span>
          </div>
          <div class="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" style="width: ${h.pct}%"></div>
          </div>
        </div>
      `;
    });
    habitsRankingContainer.innerHTML = html;
  }
}

// EKSPORT VA IMPORT (EXCEL CSV)
function exportToCSV() {
  ensureCyclesStructure();
  const viewingCycle = getViewingCycle();
  if (!viewingCycle) {
    alert("Eksport qilish uchun avval seans mavjud bo'lishi kerak!");
    return;
  }
  const totalDays = viewingCycle.totalDays || 40;
  const cycleTitle = viewingCycle.title || `${viewingCycle.cycleNumber}-seans`;
  const habits = viewingCycle.habits || appState.habits;
  const matrix = viewingCycle.matrix || appState.matrix;

  let csvContent = "\uFEFF"; // UTF-8 BOM for Excel in Uzbek
  
  // Raqamlar qatori
  let row1 = [""];
  for (let i = 1; i <= totalDays; i++) row1.push(i);
  csvContent += row1.join(",") + "\n";

  // Bo'sh qatorlar
  for (let b = 0; b < 5; b++) {
    csvContent += Array(totalDays + 1).fill("").join(",") + "\n";
  }

  // Sarlavha
  let rowTitle = ["", `Alloh roziligiga erishish uchun yangi harakat (${cycleTitle}, ${totalDays} kun)`];
  while (rowTitle.length < totalDays + 1) rowTitle.push("");
  csvContent += rowTitle.join(",") + "\n";

  // Amallar
  habits.forEach(h => {
    let row = [h.title];
    for (let d = 1; d <= totalDays; d++) {
      const val = !!(matrix[h.id] && matrix[h.id][d]);
      row.push(val ? "True" : "False");
    }
    csvContent += row.join(",") + "\n";
  });

  // Kun sanalari
  let rowKun = ["kun "];
  for (let d = 1; d <= totalDays; d++) {
    rowKun.push(appState.calendarDays[d - 1] || d);
  }
  csvContent += rowKun.join(",") + "\n";

  // N0 qatori
  let rowNo = ["N0"];
  for (let d = 1; d <= totalDays; d++) {
    rowNo.push(d);
  }
  csvContent += rowNo.join(",") + "\n";

  // Izohlar
  csvContent += "\n\n";
  csvContent += `istig'for,"ushbuning ichiga tongda va tunda 100 tadan - salovat, istig'for, tavhid bundan tashqari 1001 ta ixlos surasini o'qish kiradi"\n`;
  csvContent += `Uyquning tartibi ,"soat 10:30 da uhlab 4:30 da turiladi"\n`;

  // Faylni yuklab olish
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Islohot_${cycleTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${totalDays}kun_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// JSON Backup
function exportJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `chilla_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`);
  dlAnchor.click();
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.habits && parsed.matrix) {
        appState = parsed;
        saveData();
        renderApp();
        alert("Ma'lumotlar muvaffaqiyatli tiklandi!");
      } else {
        alert("Fayl formati mos kelmadi.");
      }
    } catch (err) {
      alert("Xatolik: Faylni o'qib bo'lmadi.");
    }
  };
  reader.readAsText(file);
}

// Excel CSV faylni import qilish
function importCSV(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const text = e.target.result;
      const lines = text.split(/\r?\n/);
      let matchedCount = 0;

      lines.forEach(line => {
        if (!line.trim()) return;
        const parts = line.split(',');
        const rowName = parts[0].trim().toLowerCase();

        // Amallarni qidirish
        appState.habits.forEach(h => {
          const habitName = h.title.toLowerCase();
          const habitKey = h.id.toLowerCase();
          
          if (rowName && (habitName.includes(rowName) || rowName.includes(habitKey) || habitKey.includes(rowName))) {
            matchedCount++;
            for (let d = 1; d <= 40; d++) {
              if (parts[d] !== undefined) {
                const val = parts[d].trim().toLowerCase();
                appState.matrix[h.id][d] = (val === 'true' || val === '1' || val === 'ha' || val === '✓');
              }
            }
          }
        });

        // Kun sanalari qatorini tekshirish
        if (rowName.startsWith('kun')) {
          for (let d = 1; d <= 40; d++) {
            if (parts[d] && !isNaN(parseInt(parts[d].trim()))) {
              appState.calendarDays[d - 1] = parseInt(parts[d].trim());
            }
          }
        }
      });

      saveData();
      renderApp();
      alert(`Excel CSV fayl muvaffaqiyatli yuklandi! (${matchedCount} ta amal ma'lumotlari yangilandi)`);
    } catch (err) {
      console.error(err);
      alert("Xatolik: CSV faylni o'qishda xatolik yuz berdi.");
    }
  };
  reader.readAsText(file);
}

// Odat qo'shish modalini boshqarish
function openAddHabitModal() {
  openModal('add-habit-modal');
}

function closeAddHabitModal() {
  closeModal('add-habit-modal');
}

function submitNewHabit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('new-habit-name');
  const descInput = document.getElementById('new-habit-desc');
  
  if (!nameInput.value.trim()) return;

  const newId = 'habit_' + Date.now();
  const newHabit = {
    id: newId,
    title: nameInput.value.trim(),
    subtitle: descInput.value.trim() || 'Reja',
    category: 'custom',
    icon: 'check-circle',
    color: '#059669',
    description: descInput.value.trim()
  };

  const targetCycle = getSettingsCycle() || getActiveCycle();
  if (targetCycle) {
    if (!targetCycle.habits) targetCycle.habits = [];
    targetCycle.habits.push(newHabit);
    if (!targetCycle.matrix) targetCycle.matrix = {};
    targetCycle.matrix[newId] = {};
    const totalDays = targetCycle.totalDays || 40;
    for (let d = 1; d <= totalDays; d++) {
      targetCycle.matrix[newId][d] = false;
    }

    if (targetCycle.id === appState.activeCycleId) {
      appState.habits = targetCycle.habits;
      appState.matrix = targetCycle.matrix;
    }
  }

  saveData();
  closeAddHabitModal();
  if (nameInput) nameInput.value = '';
  if (descInput) descInput.value = '';
  renderApp();
}

// ==========================================
// BOSQICH 4: XAVFSIZ NOLLASHTIRISH (SAFE RESET & UNDO)
// ==========================================
let undoTimerId = null;
let undoCountdownSec = 10;
let undoIntervalId = null;

function resetAllData() {
  openResetConfirmModal();
}

function openResetConfirmModal() {
  const input = document.getElementById('reset-confirm-input');
  const submitBtn = document.getElementById('reset-confirm-submit-btn');
  if (input) input.value = '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-40', 'cursor-not-allowed');
    submitBtn.classList.remove('hover:bg-rose-700', 'cursor-pointer');
  }
  openModal('reset-confirm-modal');
}

function closeResetConfirmModal() {
  closeModal('reset-confirm-modal');
  const input = document.getElementById('reset-confirm-input');
  if (input) input.value = '';
}

function checkResetConfirmationWord(val) {
  const submitBtn = document.getElementById('reset-confirm-submit-btn');
  if (!submitBtn) return;
  const isMatch = (val || '').trim().toUpperCase() === "O'CHIRISH";
  submitBtn.disabled = !isMatch;
  if (isMatch) {
    submitBtn.classList.remove('opacity-40', 'cursor-not-allowed');
    submitBtn.classList.add('hover:bg-rose-700', 'cursor-pointer');
  } else {
    submitBtn.classList.add('opacity-40', 'cursor-not-allowed');
    submitBtn.classList.remove('hover:bg-rose-700', 'cursor-pointer');
  }
}

function executeSafeReset() {
  // 1. Zaxira nusxani localStorage dagi alohida undo kalitiga saqlash
  try {
    const backupSnapshot = {
      appState: JSON.parse(JSON.stringify(appState)),
      userGender: localStorage.getItem('islohot_user_gender') || 'ayol',
      timestamp: Date.now()
    };
    localStorage.setItem('islohot_undo_backup', JSON.stringify(backupSnapshot));
  } catch (err) {
    console.warn("Undo zaxirasini saqlashda xatolik:", err);
  }

  // 2. Avtomatik JSON zaxira faylni yuklab olish
  try {
    exportDataToJSON();
  } catch (err) {
    console.warn("Avtomatik eksportda xatolik:", err);
  }

  // 3. Modalni yopish
  closeResetConfirmModal();

  // 4. Standart holatga keltirish
  initDefaultState();
  renderApp();
  switchTab('today');

  // 5. 10 soniyalik Undo toast'ni ko'rsatish
  showUndoToast();
}

function showUndoToast() {
  const toast = document.getElementById('undo-toast');
  const countdownEl = document.getElementById('undo-countdown');
  if (!toast) return;

  if (undoTimerId) clearTimeout(undoTimerId);
  if (undoIntervalId) clearInterval(undoIntervalId);

  undoCountdownSec = 10;
  if (countdownEl) countdownEl.innerText = undoCountdownSec;
  toast.classList.remove('hidden');

  undoIntervalId = setInterval(() => {
    undoCountdownSec--;
    if (countdownEl) countdownEl.innerText = Math.max(0, undoCountdownSec);
    if (undoCountdownSec <= 0) {
      clearInterval(undoIntervalId);
    }
  }, 1000);

  undoTimerId = setTimeout(() => {
    dismissUndoToast();
  }, 10000);
}

function dismissUndoToast() {
  const toast = document.getElementById('undo-toast');
  if (toast) toast.classList.add('hidden');
  if (undoTimerId) clearTimeout(undoTimerId);
  if (undoIntervalId) clearInterval(undoIntervalId);
  undoTimerId = null;
  undoIntervalId = null;
}

function undoResetData() {
  try {
    const raw = localStorage.getItem('islohot_undo_backup');
    if (!raw) {
      alert("Tiklash uchun zaxira ma'lumot topilmadi.");
      dismissUndoToast();
      return;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.appState) {
      alert("Zaxira ma'lumoti yaroqsiz.");
      dismissUndoToast();
      return;
    }

    appState = parsed.appState;
    if (parsed.userGender) {
      localStorage.setItem('islohot_user_gender', parsed.userGender);
    }
    saveData();
    renderApp();
    switchTab('today');
    dismissUndoToast();
    alert("Ma'lumotlar muvaffaqiyatli qayta tiklandi!");
  } catch (err) {
    console.error("Undo xatoligi:", err);
    alert("Ma'lumotlarni tiklashda xatolik yuz berdi: " + err.message);
  }
}

// TABLARNI ALMASHTIRISH (Bottom Navigation)
function switchTab(tabName) {
  if (tabName === 'tasbeh') {
    const isProfileDone = appState.profileCompleted && appState.profileName && appState.profileName.trim().length > 0;
    if (!isProfileDone) {
      openProfileModal(true, 'tasbeh');
      return;
    }
  }

  const tabs = ['today', 'matrix', 'tasbeh', 'stats', 'settings'];
  tabs.forEach(t => {
    const el = document.getElementById(`tab-content-${t}`);
    const navBtn = document.getElementById(`nav-btn-${t}`);
    if (el) {
      if (t === tabName) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
    if (navBtn) {
      if (t === tabName) {
        navBtn.classList.add('text-emerald-600', 'dark:text-emerald-400');
        navBtn.classList.remove('text-slate-600', 'dark:text-slate-400', 'text-slate-400', 'dark:text-slate-500');
        navBtn.setAttribute('aria-current', 'page');
      } else {
        navBtn.classList.remove('text-emerald-600', 'dark:text-emerald-400');
        navBtn.classList.add('text-slate-600', 'dark:text-slate-400');
        navBtn.removeAttribute('aria-current');
      }
    }
  });

  // Tab bo'yicha maxsus yangilanish
  if (tabName === 'matrix') renderMatrixView();
  if (tabName === 'tasbeh') renderTasbehView();
  if (tabName === 'stats') renderStatsView();
  if (tabName === 'settings') renderSettingsHabits();

  featherIconsReplace();
}

// Vazifalar qo'shish bo'limiga o'tkazish
function goToSettingsAddHabits(cycleId) {
  if (cycleId) {
    settingsViewingCycleId = cycleId;
  }
  switchTab('settings');

  setTimeout(() => {
    const input = document.getElementById('settings-new-habit-input');
    const habitsSection = document.getElementById('settings-habits-section') || document.getElementById('settings-habits-list');
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus();
    } else if (habitsSection) {
      habitsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 220);
}

// SOZLAMALAR: AMALLARNI BOSHQARISH VA QO'SHISH (Har bir seans uchun alohida)
let pendingSettingsDeleteId = null;
let pendingSettingsDeleteTimer = null;
let settingsViewingCycleId = null;

function getSettingsCycle() {
  ensureCyclesStructure();
  if (!settingsViewingCycleId) {
    settingsViewingCycleId = appState.activeCycleId;
  }
  let found = appState.cycles.find(c => c.id === settingsViewingCycleId);
  if (!found) {
    settingsViewingCycleId = appState.activeCycleId;
    found = getActiveCycle();
  }
  return found;
}

function switchSettingsCycle(cycleId) {
  settingsViewingCycleId = cycleId;
  renderSettingsHabits();
}

function renderSettingsHabits() {
  const container = document.getElementById('settings-habits-list');
  const countEl = document.getElementById('settings-habits-count');
  const seansLbl = document.getElementById('settings-current-seans-lbl');
  const tabsContainer = document.getElementById('settings-seans-tabs');
  const startDateInput = document.getElementById('settings-start-date');
  const startDateTabsContainer = document.getElementById('settings-startdate-seans-tabs');
  const startDateSeansLbl = document.getElementById('settings-startdate-seans-lbl');
  const startDateInfo = document.getElementById('settings-startdate-info');
  const notesInput = document.getElementById('settings-seans-notes-input');

  const profName = appState.profileName || '';
  const setProfNameEl = document.getElementById('settings-profile-name');
  const setProfAvatarEl = document.getElementById('settings-profile-avatar');
  if (setProfNameEl) {
    setProfNameEl.innerHTML = `${escapeHtml(profName || 'Foydalanuvchi')} <span class="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1 py-0.5 rounded font-semibold">${profName ? 'Faol' : 'Yangi'}</span>`;
  }
  if (setProfAvatarEl) {
    if (profName && profName.trim().length > 0) {
      setProfAvatarEl.innerHTML = `<span class="font-bold text-white text-sm">${escapeHtml(profName.trim()[0].toUpperCase())}</span>`;
    } else {
      setProfAvatarEl.innerHTML = `<i data-feather="user" class="w-5 h-5 text-white" aria-hidden="true"></i>`;
      featherIconsReplace();
    }
  }
  updateReminderStatusUI();
  updateBackupDateBadge();

  ensureCyclesStructure();
  const targetCycle = getSettingsCycle();

  if (!targetCycle) {
    if (countEl) countEl.innerText = '0 ta';
    if (seansLbl) seansLbl.innerText = "Seans yo'q";
    if (tabsContainer) tabsContainer.innerHTML = '';
    if (startDateTabsContainer) startDateTabsContainer.innerHTML = '';
    if (startDateSeansLbl) startDateSeansLbl.innerText = "Seans yo'q";
    if (startDateInfo) startDateInfo.innerText = "Seans boshlanganda sana belgilanadi.";
    if (notesInput) {
      notesInput.value = '';
      notesInput.placeholder = "Yangi seans boshlangach eslatma kiritishingiz mumkin.";
    }
    if (container) {
      container.innerHTML = `
        <div class="p-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
          <div class="text-2xl">⚙️</div>
          <div class="font-bold text-slate-700 dark:text-slate-300">Faol seans yo'q</div>
          <p>Amallarni boshqarish va yangi amallar qo'shish uchun yangi seans boshlang.</p>
          <button onclick="handleStartNewAction()" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer">
            + Yangi seans
          </button>
        </div>
      `;
    }
    return;
  }

  const habits = targetCycle.habits || [];

  if (startDateInput) {
    startDateInput.value = targetCycle.startDate || appState.startDate || new Date().toISOString().split('T')[0];
  }

  if (startDateSeansLbl) {
    startDateSeansLbl.innerText = targetCycle.title || `${targetCycle.cycleNumber}-seans`;
  }

  if (startDateInfo) {
    const totalDays = targetCycle.totalDays || 40;
    const curDay = targetCycle.currentDay || 1;
    startDateInfo.innerText = `Joriy kun: ${curDay}/${totalDays}-kun`;
  }

  if (notesInput) {
    notesInput.value = targetCycle.notes || '';
  }

  if (seansLbl) {
    seansLbl.innerText = targetCycle.title || `${targetCycle.cycleNumber}-seans`;
  }

  if (countEl) {
    countEl.innerText = `${habits.length} ta amal`;
  }

  const activeCycles = getActiveCycles();

  // 1. Boshlanish sanasi bo'limidagi seans tanlash tugmalari
  if (startDateTabsContainer) {
    let sTabsHtml = '';
    activeCycles.forEach(c => {
      const isSel = c.id === targetCycle.id;
      sTabsHtml += `
        <button type="button" onclick="switchSettingsCycle('${c.id}')" class="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          isSel 
            ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/50' 
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
        }">
          ⚡ ${escapeHtml(c.title)}
        </button>
      `;
    });
    startDateTabsContainer.innerHTML = sTabsHtml;
  }

  // 2. Amallar bo'limidagi seans tanlash tugmalari (Tabs)
  if (tabsContainer) {
    let tabsHtml = '';
    activeCycles.forEach(c => {
      const isSel = c.id === targetCycle.id;
      const cCount = (c.habits && c.habits.length) || 0;
      tabsHtml += `
        <button type="button" onclick="switchSettingsCycle('${c.id}')" class="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          isSel 
            ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/50' 
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
        }">
          ⚡ ${escapeHtml(c.title)} (${cCount} ta)
        </button>
      `;
    });
    tabsContainer.innerHTML = tabsHtml;
  }

  if (!container) return;

  let html = '';
  habits.forEach((habit) => {
    const isConfirming = pendingSettingsDeleteId === habit.id;
    html += `
      <div class="flex items-center gap-2">
        <input 
          type="text" 
          value="${escapeHtml(habit.title)}" 
          onchange="renameHabitFromSettings('${habit.id}', this.value)" 
          class="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-emerald-500 transition-colors"
        >
        <button 
          type="button"
          onclick="deleteHabitFromSettings('${habit.id}')" 
          title="${isConfirming ? 'Tasdiqlang' : 'O\'chirish'}" 
          class="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center shrink-0 border transition-all ${
            isConfirming 
              ? 'bg-rose-600 border-rose-600 text-white font-bold text-xs' 
              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-rose-500 hover:border-rose-400 text-lg'
          }"
        >
          ${isConfirming ? '✕ Ha' : '×'}
        </button>
      </div>
    `;
  });

  if (habits.length === 0) {
    html = `
      <div class="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-dashed border-emerald-300 dark:border-emerald-800 text-center space-y-2.5">
        <div class="text-xl">✨</div>
        <p class="text-xs font-bold text-emerald-800 dark:text-emerald-300">Ushbu seansda hozircha amallar mavjud emas</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Quyidagi maydonga amal nomini yozib "+ Qo'shish" tugmasini bosing yoki tavsiya etilgan amallardan birini tanlang:</p>
        <div class="pt-1 flex flex-wrap justify-center gap-1.5">
          <button type="button" onclick="addSuggestedHabit('Tahajjud')" class="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all shadow-sm cursor-pointer">+ Tahajjud</button>
          <button type="button" onclick="addSuggestedHabit('Istig\'for')" class="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all shadow-sm cursor-pointer">+ Istig'for</button>
          <button type="button" onclick="addSuggestedHabit('Qur\'on')" class="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all shadow-sm cursor-pointer">+ Qur'on</button>
          <button type="button" onclick="addSuggestedHabit('Mutolaa')" class="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all shadow-sm cursor-pointer">+ Mutolaa</button>
          <button type="button" onclick="addSuggestedHabit('Badantarbiya')" class="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all shadow-sm cursor-pointer">+ Badantarbiya</button>
          <button type="button" onclick="addSuggestedHabit('Ingliz tili')" class="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all shadow-sm cursor-pointer">+ Ingliz tili</button>
          <button type="button" onclick="addSuggestedHabit('Uyqu tartibi')" class="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all shadow-sm cursor-pointer">+ Uyqu tartibi</button>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renameHabitFromSettings(id, newTitle) {
  const targetCycle = getSettingsCycle();
  if (!targetCycle || !targetCycle.habits) return;
  const habit = targetCycle.habits.find(h => h.id === id);
  if (habit && newTitle && newTitle.trim() && habit.title !== newTitle.trim()) {
    habit.title = newTitle.trim();
    if (targetCycle.id === appState.activeCycleId) {
      appState.habits = targetCycle.habits;
    }
    saveData();
    renderApp();
  }
}

function deleteHabitFromSettings(id) {
  const targetCycle = getSettingsCycle();
  if (!targetCycle || !targetCycle.habits) return;

  if (pendingSettingsDeleteId === id) {
    if (pendingSettingsDeleteTimer) clearTimeout(pendingSettingsDeleteTimer);
    pendingSettingsDeleteId = null;

    targetCycle.habits = targetCycle.habits.filter(h => h.id !== id);
    if (targetCycle.matrix) delete targetCycle.matrix[id];

    if (targetCycle.id === appState.activeCycleId) {
      appState.habits = targetCycle.habits;
      if (appState.matrix) delete appState.matrix[id];
    }

    saveData();
    renderApp();
  } else {
    pendingSettingsDeleteId = id;
    renderSettingsHabits();
    if (pendingSettingsDeleteTimer) clearTimeout(pendingSettingsDeleteTimer);
    pendingSettingsDeleteTimer = setTimeout(() => {
      if (pendingSettingsDeleteId === id) {
        pendingSettingsDeleteId = null;
        renderSettingsHabits();
      }
    }, 4000);
  }
}

function addNewHabitFromSettings() {
  const inp = document.getElementById('settings-new-habit-input');
  if (!inp) return;
  const name = inp.value.trim();
  if (!name) {
    inp.focus();
    return;
  }

  const targetCycle = getSettingsCycle();
  if (!targetCycle) return;
  if (!targetCycle.habits) targetCycle.habits = [];
  if (!targetCycle.matrix) targetCycle.matrix = {};

  const newId = 'habit_' + Date.now();
  const newHabit = {
    id: newId,
    title: name,
    subtitle: 'Reja',
    category: 'custom',
    icon: 'check-circle',
    color: '#059669',
    description: name
  };

  targetCycle.habits.push(newHabit);
  targetCycle.matrix[newId] = {};
  const totalDays = targetCycle.totalDays || 40;
  for (let d = 1; d <= totalDays; d++) {
    targetCycle.matrix[newId][d] = false;
  }

  if (targetCycle.id === appState.activeCycleId) {
    appState.habits = targetCycle.habits;
    appState.matrix = targetCycle.matrix;
  }

  saveData();
  inp.value = '';
  renderApp();

  setTimeout(() => {
    const nextInp = document.getElementById('settings-new-habit-input');
    if (nextInp) nextInp.focus();
  }, 40);
}

// Tavsiya etilgan amalni bir bosishda qo'shish
function addSuggestedHabit(title) {
  const inp = document.getElementById('settings-new-habit-input');
  if (inp) {
    inp.value = title;
    addNewHabitFromSettings();
  }
}

function handleStartDateChange(val) {
  if (!val) return;
  const target = getSettingsCycle();
  if (target) {
    target.startDate = val;
    if (target.id === appState.activeCycleId) {
      appState.startDate = val;
    }
  } else {
    appState.startDate = val;
  }
  saveData();
  renderApp();
}

function setStartDateToday() {
  const today = new Date().toISOString().split('T')[0];
  const target = getSettingsCycle();
  if (target) {
    target.startDate = today;
    if (target.id === appState.activeCycleId) {
      appState.startDate = today;
    }
    saveData();
    renderApp();
    alert(`${target.title} uchun boshlanish sanasi bugungi kunga (${today}) o'rnatildi!`);
  } else {
    appState.startDate = today;
    saveData();
    renderApp();
    alert(`Boshlanish sanasi bugungi kunga (${today}) o'rnatildi!`);
  }
}

// Har bir seans uchun amallar shartlari va eslatmalarni saqlash
function saveCurrentSeansNotes() {
  const inp = document.getElementById('settings-seans-notes-input');
  const statusEl = document.getElementById('settings-notes-save-status');
  if (!inp) return;
  const val = inp.value.trim();
  const target = getSettingsCycle();
  if (!target) return;
  target.notes = val;
  if (target.id === appState.activeCycleId) {
    const active = getActiveCycle();
    if (active) active.notes = val;
  }
  saveData();
  if (statusEl) {
    statusEl.innerText = "✅ Eslatma muvaffaqiyatli saqlandi!";
    statusEl.className = "text-xs text-emerald-600 dark:text-emerald-400 font-bold";
    setTimeout(() => {
      if (statusEl) {
        statusEl.innerText = "Har bir seans uchun alohida saqlanadi";
        statusEl.className = "text-xs text-slate-400";
      }
    }, 3000);
  }
  renderApp();
}

// Yangi seans ochish modalidan mavjud seansga o'tish
function selectSeansFromCreateModal(cycleId) {
  closeCreateSeansModal();
  switchActiveCycle(cycleId);
  switchTab('today');
}

// Natijalar modalidan mavjud seansga o'tish
function selectSeansFromResultsModal(cycleId) {
  closeCycleResultsModal();
  switchActiveCycle(cycleId);
  switchTab('matrix');
}

// Yordamchi effektlar
function triggerHaptic() {
  if (navigator.vibrate) {
    navigator.vibrate(25);
  }
}

function playTone(freq = 440, duration = 0.1) {
  // Ovoz tizimi butunlay olib tashlangan
}

function triggerConfetti() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  if (window.confetti) {
    window.confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function featherIconsReplace() {
  if (window.feather) {
    window.feather.replace();
  }
}

// Dark mode boshqaruvi (Tailwind v3 bilan moslashgan)
function applyDarkMode() {
  const isDark = !!appState.darkMode;
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Headerdagi eski tugma (agar mavjud bo'lsa)
  const btn = document.getElementById('dark-mode-toggle-btn');
  if (btn) {
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    btn.setAttribute('aria-label', isDark ? "Yorug' rejimga o'tish" : "Qorong'i rejimga o'tish");
    btn.innerHTML = `<i data-feather="${isDark ? 'sun' : 'moon'}" class="w-4 h-4 text-emerald-100" aria-hidden="true"></i>`;
  }

  // Sozlamalar bo'limidagi yangi tungi rejim kartasi
  const settingsBtn = document.getElementById('settings-dark-mode-btn');
  const settingsIcon = document.getElementById('settings-theme-icon');
  const settingsTitle = document.getElementById('settings-theme-title');
  const settingsDesc = document.getElementById('settings-theme-desc');

  if (settingsBtn) {
    settingsBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    if (isDark) {
      if (settingsIcon) settingsIcon.innerText = '☀️';
      if (settingsTitle) settingsTitle.innerText = 'Kunduzgi rejim';
      if (settingsDesc) settingsDesc.innerText = "Yorug' mavzuga o'tish uchun bosing";
      settingsBtn.className = "px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm";
      settingsBtn.innerHTML = `<i data-feather="sun" class="w-3.5 h-3.5" aria-hidden="true"></i><span>Kunduzgi rejim</span>`;
    } else {
      if (settingsIcon) settingsIcon.innerText = '🌙';
      if (settingsTitle) settingsTitle.innerText = 'Tungi rejim';
      if (settingsDesc) settingsDesc.innerText = "Qorong'i (tungi) mavzuga o'tish";
      settingsBtn.className = "px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm";
      settingsBtn.innerHTML = `<i data-feather="moon" class="w-3.5 h-3.5" aria-hidden="true"></i><span>Tungi rejim</span>`;
    }
  }

  featherIconsReplace();
}

function toggleDarkMode() {
  appState.darkMode = !appState.darkMode;
  applyDarkMode();
  saveData();
}

// Event Listeners va Accessibility boshqaruvi
function setupEventListeners() {
  // PWA Service worker ro'yxatdan o'tkazish
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('SW register failed:', err);
    });
  }

  // Dark mode holatini qo'llash
  if (appState.darkMode === undefined && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    appState.darkMode = true;
  }
  applyDarkMode();

  // Barcha modallar uchun fon (backdrop) bosilganda yopish
  const modalIds = ['add-habit-modal', 'profile-modal', 'archived-cycles-modal', 'cycle-results-modal', 'create-seans-modal', 'reset-confirm-modal'];
  modalIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          if (id === 'profile-modal') {
            closeProfileModal();
          } else if (id === 'reset-confirm-modal') {
            closeResetConfirmModal();
          } else if (id === 'cycle-results-modal') {
            closeCycleResultsModal();
          } else if (id === 'create-seans-modal') {
            closeCreateSeansModal();
          } else if (id === 'add-habit-modal') {
            closeAddHabitModal();
          } else if (id === 'archived-cycles-modal') {
            closeArchivedCyclesModal();
          } else {
            closeModal(id);
          }
        }
      });
    }
  });

  // Global klaviatura boshqaruvi: Esc yopishi va Tab orqali focus trap (WCAG 2.2 AA)
  document.addEventListener('keydown', (e) => {
    if (activeModalStack.length === 0) return;
    const topModalId = activeModalStack[activeModalStack.length - 1];
    const topModal = document.getElementById(topModalId);
    if (!topModal) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      if (topModalId === 'profile-modal') {
        closeProfileModal();
      } else if (topModalId === 'reset-confirm-modal') {
        closeResetConfirmModal();
      } else if (topModalId === 'cycle-results-modal') {
        closeCycleResultsModal();
      } else if (topModalId === 'create-seans-modal') {
        closeCreateSeansModal();
      } else if (topModalId === 'add-habit-modal') {
        closeAddHabitModal();
      } else if (topModalId === 'archived-cycles-modal') {
        closeArchivedCyclesModal();
      } else {
        closeModal(topModalId);
      }
      return;
    }

    if (e.key === 'Tab') {
      const focusable = Array.from(topModal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (focusable.length === 0) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl || !topModal.contains(document.activeElement)) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl || !topModal.contains(document.activeElement)) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  });
}

// ==========================================
// YANGI HARAKAT ONBOARDING VA PROFIL BOSHQARUVI
// ==========================================
let isProfileModalInNewActionFlow = false;
let profileModalTargetFlow = 'seans'; // 'seans' or 'tasbeh'

function handleStartNewAction() {
  const isFirstTime = (!appState.cycles || appState.cycles.length === 0) || !appState.profileCompleted || !appState.profileName || !appState.profileName.trim();
  if (isFirstTime) {
    openProfileModal(true, 'seans');
  } else {
    openCreateSeansModal();
  }
}

function openProfileModal(isNewActionFlow = false, targetFlow = 'seans') {
  isProfileModalInNewActionFlow = !!isNewActionFlow;
  profileModalTargetFlow = targetFlow || 'seans';
  const modal = document.getElementById('profile-modal');
  if (!modal) return;
  const name = appState.profileName || '';
  const nameInput = document.getElementById('profile-fullname-input');
  const nameLabel = document.getElementById('profile-modal-name');
  const avatar = document.getElementById('profile-avatar');
  const pctEl = document.getElementById('profile-modal-pct');
  const metaEl = document.getElementById('profile-modal-meta');
  const reminderToggle = document.getElementById('profile-reminder-toggle');
  const newActionBanner = document.getElementById('profile-new-action-banner');
  const newActionButtons = document.getElementById('profile-new-action-buttons');
  const bannerIcon = document.getElementById('profile-banner-icon');
  const bannerTitle = document.getElementById('profile-banner-title');
  const bannerDesc = document.getElementById('profile-banner-desc');
  const confirmBtnText = document.getElementById('profile-confirm-action-text');

  if (nameInput) nameInput.value = appState.profileName || '';
  if (nameLabel) {
    if (appState.profileName) {
      nameLabel.innerHTML = `${escapeHtml(appState.profileName)} <span class="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-semibold">Tasdiqlangan</span>`;
    } else {
      nameLabel.innerHTML = `Foydalanuvchi <span class="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-semibold">Yangi</span>`;
    }
  }
  if (avatar) {
    if (appState.profileName && appState.profileName.trim().length > 0) {
      avatar.innerHTML = `<span class="font-black text-white text-base">${escapeHtml(appState.profileName.trim()[0].toUpperCase())}</span>`;
    } else {
      avatar.innerHTML = `<i data-feather="user" class="w-6 h-6 text-white" aria-hidden="true"></i>`;
      featherIconsReplace();
    }
  }

  ensureCyclesStructure();
  const activeCycle = getActiveCycle();
  const cycleNum = activeCycle ? activeCycle.cycleNumber : 1;

  // Intizom foizini hisoblash
  let totalChecked = 0;
  let totalPossible = (activeCycle && activeCycle.habits ? activeCycle.habits.length : appState.habits.length) * (activeCycle ? activeCycle.totalDays : 40);
  if (activeCycle) {
    for (let d = 1; d <= activeCycle.totalDays; d++) {
      totalChecked += getCompletedCountForDay(d);
    }
  }
  const overallPct = totalPossible > 0 ? Math.round((totalChecked / totalPossible) * 100) : 0;
  if (pctEl) pctEl.innerText = `${overallPct}%`;
  if (metaEl) {
    if (activeCycle) {
      metaEl.innerText = `@${(appState.profileName || 'foydalanuvchi').toLowerCase().replace(/[^a-z0-9]/g, '_')} · ${cycleNum}-seans faol`;
    } else {
      metaEl.innerText = `@${(appState.profileName || 'foydalanuvchi').toLowerCase().replace(/[^a-z0-9]/g, '_')} · Seans hali ochilmagan`;
    }
  }

  if (reminderToggle) {
    reminderToggle.checked = (appState.reminderEnabled !== false);
  }
  updateReminderStatusUI();

  if (isNewActionFlow) {
    if (newActionBanner) newActionBanner.classList.remove('hidden');
    if (newActionButtons) newActionButtons.classList.remove('hidden');

    if (profileModalTargetFlow === 'tasbeh') {
      if (bannerIcon) bannerIcon.innerText = '📿';
      if (bannerTitle) bannerTitle.innerText = "Zikr bo'limi";
      if (bannerDesc) bannerDesc.innerText = "Zikr hisoblagichidan foydalanishdan oldin profilingizni to'ldirib saqlang. Saqlaganingizdan so'ng to'g'ridan-to'g'ri Zikr bo'limiga o'tasiz.";
      if (confirmBtnText) confirmBtnText.innerText = "💾 Saqlash va Zikr bo'limiga o'tish";
    } else {
      if (bannerIcon) bannerIcon.innerText = '👤';
      if (bannerTitle) bannerTitle.innerText = "Account ma'lumotlarini sozlash";
      if (bannerDesc) bannerDesc.innerText = "Seansni boshlashdan oldin ismingiz, jinsingiz va kechki 22:00 dagi eslatmani sozlang. Saqlaganingizdan so'ng to'g'ridan-to'g'ri seans ochishga o'tasiz.";
      if (confirmBtnText) confirmBtnText.innerText = "💾 Ma'lumotlarni saqlash va Seans ochish";
    }

    if (nameInput) setTimeout(() => nameInput.focus(), 200);
  } else {
    if (newActionBanner) newActionBanner.classList.add('hidden');
    if (newActionButtons) newActionButtons.classList.add('hidden');
  }

  updateGenderUI();
  openModal('profile-modal');
  featherIconsReplace();
}

function closeProfileModal() {
  closeModal('profile-modal');
}

function confirmProfileAndOpenSeans() {
  const nameInput = document.getElementById('profile-fullname-input');
  if (nameInput && nameInput.value.trim()) {
    appState.profileName = nameInput.value.trim();
  } else if (!appState.profileName || !appState.profileName.trim()) {
    alert("Iltimos, ismingizni kiriting!");
    if (nameInput) nameInput.focus();
    return;
  }
  appState.profileCompleted = true;
  appState.reminderEnabled = true;
  saveData();
  closeProfileModal();

  if (profileModalTargetFlow === 'tasbeh') {
    switchTab('tasbeh');
  } else {
    openCreateSeansModal();
  }
}

// ==========================================
// HAR KUNI SOAT 22:00 DA ILOVADAN ESLATMA (NATIVE ALARM & WEB NOTIFICATION)
// ==========================================

// Capacitor Local Notifications (Android tizimli budilnikiga bog'lash)
async function setupCapacitorLocalNotifications() {
  const LocalNotifications = window.Capacitor?.Plugins?.LocalNotifications;
  if (!LocalNotifications) {
    console.log('Capacitor LocalNotifications mavjud emas (veb rejimida ishlaydi).');
    return false;
  }

  try {
    // 1. Ruxsat holatini tekshirish
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      perm = await LocalNotifications.requestPermissions();
      if (perm.display !== 'granted') {
        console.warn('Capacitor LocalNotifications ruxsati berilmadi');
        return false;
      }
    }

    // 2. Oldingi 2200 ID li eslatmani tozalash (dublyaj bo'lmasligi uchun)
    await LocalNotifications.cancel({
      notifications: [{ id: 2200 }]
    });

    // 3. Agar eslatma yoqilgan bo'lsa, har kuni soat 22:00 ga tizimli budilnik o'rnatish
    if (appState.reminderEnabled !== false) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 2200,
            title: "Islohot — Kunlik vazifalar eslatmasi ⏰",
            body: "Kechki soat 22:00 bo'ldi. Bugungi rejadagi amallaringizni belgilashni unutmang!",
            schedule: {
              on: {
                hour: 22,
                minute: 0
              },
              allowWhileIdle: true // Telefon uxlab yotganda yoki ilova yopiq bo'lsa ham signal beradi
            },
            sound: 'beep.wav',
            smallIcon: 'ic_launcher'
          }
        ]
      });
      console.log('Native LocalNotification har kuni 22:00 uchun rejalashtirildi!');
    }
    return true;
  } catch (err) {
    console.error('LocalNotifications rejalashtirishda xatolik:', err);
    return false;
  }
}

// ==========================================
// KUNLIK ESLATMA (IN-APP BANNER VA BILDIRISHNOMALAR)
// ==========================================

// TODO: Haqiqiy fon (Web Push) eslatmasi uchun Service Worker Push Manager hamda VAPID kalitlari bilan ishlaydigan backend server kerak. Hozirda server qismi qo'shilmagan; eslatma ilova ochiq bo'lganda in-app banner va mahalliy bildirishnoma orqali ishlaydi.

async function handleReminderToggle(el) {
  appState.reminderEnabled = el.checked;
  saveData();
  updateReminderStatusUI();
  await setupCapacitorLocalNotifications();

  if (el.checked) {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          const perm = await Notification.requestPermission();
          if (perm === 'denied') {
            checkNotificationSupport();
            alert("Bildirishnoma ruxsati berilmadi. Tizimli eslatma olish uchun sozlamalardan ruxsat bering.");
            return;
          }
        } catch(e) {
          console.warn("Notification request error:", e);
        }
      } else if (Notification.permission === 'denied') {
        checkNotificationSupport();
        alert("Brauzeringizda bildirishnomalar taqiqlangan. Sozlamalardan ruxsat berishni tavsiya qilamiz.");
        return;
      }
    }
    checkNotificationSupport();
    alert("✅ Har kuni soat 22:00 da eslatish yoqildi! Tizimli bildirishnoma ilova yopiq bo'lsa ham signal beradi.");
  } else {
    checkNotificationSupport();
    alert("22:00 dagi kunlik eslatma o'chirildi.");
  }
}

function updateReminderStatusUI() {
  const reminderPill = document.getElementById('reminder-status-pill');
  const settingsBtn = document.getElementById('settings-profile-reminder-btn');
  const settingsDesc = document.getElementById('settings-profile-reminder-desc');
  const toggleInput = document.getElementById('profile-reminder-toggle');

  const isEnabled = appState.reminderEnabled !== false;

  if (toggleInput) {
    toggleInput.checked = isEnabled;
  }

  if (reminderPill) {
    if (isEnabled) {
      reminderPill.className = 'px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1';
      reminderPill.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 22:00 da Faol';
    } else {
      reminderPill.className = 'px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold flex items-center gap-1';
      reminderPill.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> O\'chirilgan';
    }
  }

  if (settingsBtn) {
    if (isEnabled) {
      settingsBtn.className = 'px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold cursor-pointer';
      settingsBtn.innerText = "22:00 da Faol ⚙️";
    } else {
      settingsBtn.className = 'px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold cursor-pointer';
      settingsBtn.innerText = "O'chirilgan ⚙️";
    }
  }

  if (settingsDesc) {
    settingsDesc.innerText = isEnabled 
      ? "Har kuni soat 22:00 da bajarilmagan amallar haqida eslatadi (ilova yopiq bo'lsa ham)"
      : "Kunlik eslatma o'chirilgan";
  }

  checkNotificationSupport();
}

function checkNotificationSupport() {
  const warningEl = document.getElementById('notification-support-warning');
  if (!warningEl) return;

  if (!('Notification' in window)) {
    warningEl.className = 'text-xs text-amber-700 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-900/50 mt-1.5 block leading-snug';
    warningEl.innerHTML = "ℹ️ Brauzeringiz tizimli bildirishnomalarni qo'llab-quvvatlamaydi. Eslatma ilova ochiq bo'lganda ichki banner orqali ko'rsatiladi.";
    warningEl.classList.remove('hidden');
    return;
  }

  if (Notification.permission === 'denied') {
    warningEl.className = 'text-xs text-rose-700 dark:text-rose-300 font-medium bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 mt-1.5 block leading-snug';
    warningEl.innerHTML = "⚠️ Tizimli bildirishnomalar brauzer sozlamalarida bloklangan. Eslatma ilova ochiq bo'lganda ichki banner orqali ishlaydi.";
    warningEl.classList.remove('hidden');
  } else {
    warningEl.classList.add('hidden');
  }
}

// Bugungi bajarilmagan amallar soni
function getTodayUncompletedCount() {
  ensureCyclesStructure();
  const activeCycles = getActiveCycles();
  let uncompletedCount = 0;

  activeCycles.forEach(cycle => {
    const totalDays = cycle.totalDays || 40;
    const day = Math.min(Math.max(1, cycle.currentDay || 1), totalDays);
    const habits = cycle.habits || [];
    habits.forEach(h => {
      const isDone = !!(cycle.matrix && cycle.matrix[h.id] && cycle.matrix[h.id][day]);
      if (!isDone) {
        uncompletedCount++;
      }
    });
  });

  return uncompletedCount;
}

// 22:00 Eslatgichni tekshirish funksiyasi (kuniga bir marta)
function checkDailyReminderScheduler() {
  if (appState.reminderEnabled === false) return;

  const now = new Date();
  const currentHour = now.getHours();
  const todayStr = now.toISOString().split('T')[0];
  const lastShownDate = localStorage.getItem('islohot_last_reminder_date') || appState.lastNotificationDate;

  // Agar soat 22:00 yoki undan keyin bo'lsa va bugun hali eslatilmagan bo'lsa
  if (currentHour >= 22 && lastShownDate !== todayStr) {
    const uncompleted = getTodayUncompletedCount();
    if (uncompleted > 0) {
      trigger22ReminderNotification(uncompleted);
      appState.lastNotificationDate = todayStr;
      localStorage.setItem('islohot_last_reminder_date', todayStr);
      saveData();
    }
  }
}

let reminderSchedulerInterval = null;
function initDailyReminderScheduler() {
  if (reminderSchedulerInterval) clearInterval(reminderSchedulerInterval);
  // Dastur ochilganda darhol tekshirish
  setTimeout(checkDailyReminderScheduler, 2500);
  // Har 30 sekundda vaqtni tekshirib borish
  reminderSchedulerInterval = setInterval(checkDailyReminderScheduler, 30000);
}

// Eslatma bildirishnomasini ko'rsatish
function trigger22ReminderNotification(uncompletedCount) {
  const count = uncompletedCount !== undefined ? uncompletedCount : getTodayUncompletedCount();
  const message = count > 0 
    ? `Kechki sarhisob: Bugun sizda ${count} ta bajarilmagan amal qoldi. Kun yakunlanishidan oldin ularni bajarib belgilashni unutmang!`
    : `Bugungi barcha vazifalaringiz to'liq bajarildi! Mashalloh, kuningiz xayrli bo'ldi!`;

  // 1. Brauzer / Tizim bildirishnomasi
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification("🌙 Kechki Eslatma (22:00)", {
          body: message,
          icon: 'icon-192.png'
        });
      } catch (e) {
        console.warn("Notification error:", e);
      }
    }
  }

  // 2. Ilova ichidagi banner (In-App Banner)
  const banner = document.getElementById('in-app-reminder-banner');
  const textEl = document.getElementById('in-app-reminder-text');
  if (banner && textEl) {
    textEl.innerText = message;
    banner.classList.remove('hidden');
    setTimeout(() => {
      dismissInAppReminder();
    }, 12000);
  }
}

function dismissInAppReminder() {
  const banner = document.getElementById('in-app-reminder-banner');
  if (banner) {
    banner.classList.add('hidden');
  }
}

async function testNotificationNow() {
  const LocalNotifications = window.Capacitor?.Plugins?.LocalNotifications;
  if (LocalNotifications) {
    try {
      let perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        perm = await LocalNotifications.requestPermissions();
      }
      if (perm.display === 'granted') {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 9999,
              title: "Islohot — Eslatma sinovi 🔔",
              body: "Eslatma tizimi muvaffaqiyatli ishlamoqda! Soat 22:00 da signal beriladi.",
              schedule: { at: new Date(Date.now() + 1000) },
              allowWhileIdle: true,
              smallIcon: 'ic_launcher'
            }
          ]
        });
        alert("✅ Sinov eslatmasi yuborildi! Telefoningiz yuqori panelida bildirishnoma paydo bo'ladi.");
        return;
      }
    } catch (e) {
      console.warn("Native local notification error:", e);
    }
  }

  // Web fallback
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  checkNotificationSupport();

  const count = getTodayUncompletedCount();
  const testCount = count > 0 ? count : 3;
  trigger22ReminderNotification(testCount);
  alert("✅ Sinov eslatmasi yuborildi! Har kuni soat 22:00 da shunday tizimli bildirishnoma va signal keladi.");
}

// ==========================================
// ZAXIRA NUSXA: JSON EKSPORT VA TIKLASH (BACKUP & RESTORE)
// ==========================================

function requestPersistentStorage() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then(persisted => {
        console.log('Storage persistence:', persisted ? 'saqlangan' : 'cheklangan');
      }).catch(() => {});
    }
  } catch(e) {}
}

function updateBackupDateBadge() {
  const badge = document.getElementById('backup-last-date-badge');
  if (!badge) return;
  const lastDate = localStorage.getItem('islohot_last_backup_date');
  if (lastDate) {
    badge.innerText = `Oxirgi zaxira: ${lastDate}`;
    badge.className = 'px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold';
  } else {
    badge.innerText = 'Hali zaxira olinmagan';
    badge.className = 'px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 text-xs font-semibold';
  }
}

function exportDataToJSON() {
  ensureCyclesStructure();
  const exportPayload = {
    schemaVersion: 1,
    appVersion: "1.0.0",
    appName: "Alloh Roziligi - Islohot",
    exportedAt: new Date().toISOString(),
    data: {
      ...appState,
      userGender: appState.userGender || localStorage.getItem('islohot_user_gender') || 'ayol'
    }
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const filename = `harakat-zaxira-${year}-${month}-${day}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Oxirgi zaxira vaqtini qayd etish
  const formattedDate = `${day}.${month}.${year} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  localStorage.setItem('islohot_last_backup_date', formattedDate);
  updateBackupDateBadge();
}

function triggerRestoreFileInput() {
  const fileInput = document.getElementById('backup-file-input');
  if (fileInput) {
    fileInput.value = '';
    fileInput.click();
  }
}

function handleRestoreBackup(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const content = e.target.result;
      const parsed = JSON.parse(content);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error("Fayl formati noto'g'ri JSON.");
      }

      // JSON ichidan asosiy ma'lumotni ajratib olish (schemaVersion va data tuzilishi)
      const restoredData = parsed.data || parsed;
      if (!restoredData || typeof restoredData !== 'object') {
        throw new Error("Zaxira faylida ilova ma'lumotlari mavjud emas.");
      }

      // Kalit maydonlar borligini tekshirish
      const hasCycles = Array.isArray(restoredData.cycles);
      const hasHabits = Array.isArray(restoredData.habits);
      const hasTasbeh = restoredData.tasbeh !== undefined || Array.isArray(restoredData.customZikrs);
      if (!hasCycles && !hasHabits && !hasTasbeh) {
        throw new Error("Ushbu fayl 'Islohot' ilovasi zaxira nusxasi emas yoki buzilgan.");
      }

      const proceed = confirm("Diqqat! Joriy barcha ma'lumotlar ushbu zaxira nusxasidagi ma'lumotlar bilan almashtiriladi. Davom etasizmi?");
      if (!proceed) return;

      // Almashtirishdan oldin xavfsizlik uchun joriy holatning avtomatik zaxirasini olish
      try {
        localStorage.setItem('islohot_auto_backup_before_restore', JSON.stringify({
          backedUpAt: new Date().toISOString(),
          state: appState
        }));
      } catch(saveErr) {
        console.warn("Avto-zaxira saqlashda ogohlantirish:", saveErr);
      }

      // Ma'lumotlarni tiklash
      appState = {
        ...appState,
        ...restoredData
      };

      if (restoredData.userGender) {
        localStorage.setItem('islohot_user_gender', restoredData.userGender);
      }

      ensureCyclesStructure();
      ensureMatrixStructure();
      saveData();

      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      localStorage.setItem('islohot_last_backup_date', formattedDate);

      renderApp();
      updateBackupDateBadge();
      updateReminderStatusUI();
      featherIconsReplace();

      alert("Zaxira nusxasi muvaffaqiyatli tiklandi!");
    } catch(err) {
      console.error("Zaxirani tiklashda xatolik:", err);
      alert(`Xatolik: Zaxira faylini tiklab bo'lmadi.\nSababi: ${err.message || "Fayl yaroqsiz formatda."}`);
    }
  };

  reader.onerror = function() {
    alert("Faylni o'qishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
  };

  reader.readAsText(file);
}

function playNotificationChime() {
  // Ovoz tizimi butunlay olib tashlangan
}

function saveProfileName() {
  const input = document.getElementById('profile-fullname-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) {
    alert("Iltimos, ismingizni kiriting!");
    return;
  }
  appState.profileName = val;
  saveData();

  ensureCyclesStructure();
  const activeCycle = getActiveCycle();
  const cycleNum = activeCycle ? activeCycle.cycleNumber : 1;

  const nameLabel = document.getElementById('profile-modal-name');
  const avatar = document.getElementById('profile-avatar');
  const metaEl = document.getElementById('profile-modal-meta');
  const statusEl = document.getElementById('profile-save-status');

  if (nameLabel) {
    nameLabel.innerHTML = `${escapeHtml(val)} <span class="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-semibold">Tasdiqlangan</span>`;
  }
  if (avatar) {
    if (val && val.trim().length > 0) {
      avatar.innerHTML = `<span class="font-black text-white text-base">${escapeHtml(val.trim()[0].toUpperCase())}</span>`;
    } else {
      avatar.innerHTML = `<i data-feather="user" class="w-6 h-6 text-white" aria-hidden="true"></i>`;
      featherIconsReplace();
    }
  }
  if (metaEl) metaEl.innerText = `@${val.toLowerCase().replace(/[^a-z0-9]/g, '_')} · ${cycleNum}-seans faol`;

  const setProfNameEl = document.getElementById('settings-profile-name');
  const setProfAvatarEl = document.getElementById('settings-profile-avatar');
  if (setProfNameEl) {
    setProfNameEl.innerHTML = `${escapeHtml(val)} <span class="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1 py-0.5 rounded font-semibold">Faol</span>`;
  }
  if (setProfAvatarEl) {
    if (val && val.trim().length > 0) {
      setProfAvatarEl.innerHTML = `<span class="font-bold text-white text-sm">${escapeHtml(val.trim()[0].toUpperCase())}</span>`;
    } else {
      setProfAvatarEl.innerHTML = `<i data-feather="user" class="w-5 h-5 text-white" aria-hidden="true"></i>`;
      featherIconsReplace();
    }
  }

  if (statusEl) {
    statusEl.innerText = '✅ Ism muvaffaqiyatli saqlandi!';
    statusEl.className = 'text-xs text-emerald-600 dark:text-emerald-400 font-semibold';
    setTimeout(() => {
      statusEl.innerText = "ℹ️ Ma'lumotlar faqat shu qurilmaning brauzerida saqlanadi. Yo'qotmaslik uchun vaqti-vaqti bilan zaxira nusxa oling.";
      statusEl.className = 'text-xs text-slate-500 dark:text-slate-400';
    }, 4000);
  }

  // Agar yangi seans ochish jarayonida bo'lsa, to'g'ridan-to'g'ri seans ochishga o'tish
  if (isProfileModalInNewActionFlow) {
    setTimeout(() => {
      confirmProfileAndOpenSeans();
    }, 300);
  }
}

// Ishga tushirish
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
