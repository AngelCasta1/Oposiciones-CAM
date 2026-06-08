/* ─────────────────────────────────────────────────────────
   CAM OPOSICIONES — APP SHARED LOGIC
   Modo oscuro · localStorage · Progreso · Toasts · Notas
───────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const STORAGE_KEYS = {
    THEME: 'cam_theme',
    TEST_HISTORY: 'cam_test_history',
    TEST_BEST: 'cam_test_best',
    WRONG_QUESTIONS: 'cam_wrong_questions',
    ARTICLE_FLAGS: 'cam_article_flags',
    VISITED_ARTICLES: 'cam_visited_articles',
    SCROLL_POSITIONS: 'cam_scroll_positions',
    NOTES: 'cam_notes',
    READ_PROGRESS: 'cam_read_progress',
    STREAK: 'cam_streak',
    ACHIEVEMENTS: 'cam_achievements',
    UNFINISHED_TEST: 'cam_unfinished_test',
    WELCOME_SEEN: 'cam_welcome_seen',
    TOTAL_CORRECT: 'cam_total_correct'
  };

  /* ── Storage helpers ── */
  const Store = {
    get(key, def) {
      try {
        const v = localStorage.getItem(key);
        return v === null ? def : JSON.parse(v);
      } catch (e) { return def; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (e) { }
    }
  };
  window.CAM_Store = Store;
  window.CAM_KEYS = STORAGE_KEYS;

  /* ─────────────────────────────────
     1. MODO OSCURO
  ───────────────────────────────── */
  function getPreferredTheme() {
    const saved = Store.get(STORAGE_KEYS.THEME);
    if (saved) return saved;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute('title', theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    }
    // Actualizar meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#1a0f14' : '#c0305a');
  }

  function toggleTheme() {
    const next = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
    Store.set(STORAGE_KEYS.THEME, next);
    applyTheme(next);
    Toast.show(next === 'dark' ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado');
  }
  window.CAM_toggleTheme = toggleTheme;

  // Aplicar inmediatamente para evitar parpadeo
  applyTheme(getPreferredTheme());

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getPreferredTheme());
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', toggleTheme);
  });

  /* ─────────────────────────────────
     2. SISTEMA DE TOASTS (notificaciones)
  ───────────────────────────────── */
  const Toast = {
    container: null,
    init() {
      if (this.container) return;
      this.container = document.createElement('div');
      this.container.id = 'cam-toast-container';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(this.container);
    },
    show(message, duration = 2500) {
      this.init();
      const t = document.createElement('div');
      t.className = 'cam-toast';
      t.textContent = message;
      this.container.appendChild(t);
      requestAnimationFrame(() => t.classList.add('visible'));
      setTimeout(() => {
        t.classList.remove('visible');
        setTimeout(() => t.remove(), 350);
      }, duration);
    }
  };
  window.CAM_Toast = Toast;

  /* ─────────────────────────────────
     3. HISTORIAL DE TESTS
  ───────────────────────────────── */
  const History = {
    add(entry) {
      const list = Store.get(STORAGE_KEYS.TEST_HISTORY, []);
      list.unshift({
        ...entry,
        ts: Date.now()
      });
      // Limitar a últimos 50
      Store.set(STORAGE_KEYS.TEST_HISTORY, list.slice(0, 50));
      // Mejor puntuación por tema
      const best = Store.get(STORAGE_KEYS.TEST_BEST, {});
      const pct = Math.round((entry.score / entry.total) * 100);
      if (!best[entry.key] || best[entry.key].pct < pct) {
        best[entry.key] = { pct, ts: Date.now() };
        Store.set(STORAGE_KEYS.TEST_BEST, best);
      }
    },
    all() { return Store.get(STORAGE_KEYS.TEST_HISTORY, []); },
    best() { return Store.get(STORAGE_KEYS.TEST_BEST, {}); },
    clear() {
      Store.remove(STORAGE_KEYS.TEST_HISTORY);
      Store.remove(STORAGE_KEYS.TEST_BEST);
    }
  };
  window.CAM_History = History;

  /* ─────────────────────────────────
     4. PREGUNTAS FALLADAS (repaso inteligente)
  ───────────────────────────────── */
  const Wrong = {
    add(testKey, questionText) {
      const all = Store.get(STORAGE_KEYS.WRONG_QUESTIONS, {});
      if (!all[testKey]) all[testKey] = {};
      all[testKey][questionText] = (all[testKey][questionText] || 0) + 1;
      Store.set(STORAGE_KEYS.WRONG_QUESTIONS, all);
    },
    remove(testKey, questionText) {
      const all = Store.get(STORAGE_KEYS.WRONG_QUESTIONS, {});
      if (all[testKey] && all[testKey][questionText]) {
        all[testKey][questionText] = Math.max(0, all[testKey][questionText] - 1);
        if (all[testKey][questionText] === 0) delete all[testKey][questionText];
        Store.set(STORAGE_KEYS.WRONG_QUESTIONS, all);
      }
    },
    getAll() { return Store.get(STORAGE_KEYS.WRONG_QUESTIONS, {}); },
    count() {
      const all = this.getAll();
      let n = 0;
      Object.values(all).forEach(t => n += Object.keys(t).length);
      return n;
    },
    clear() { Store.remove(STORAGE_KEYS.WRONG_QUESTIONS); }
  };
  window.CAM_Wrong = Wrong;

  /* ─────────────────────────────────
     5. MARCADORES DE ARTÍCULOS (Dudoso / Importante)
  ───────────────────────────────── */
  const Flags = {
    get(temaKey, artId) {
      const all = Store.get(STORAGE_KEYS.ARTICLE_FLAGS, {});
      return (all[temaKey] && all[temaKey][artId]) || {};
    },
    set(temaKey, artId, flag, value) {
      const all = Store.get(STORAGE_KEYS.ARTICLE_FLAGS, {});
      if (!all[temaKey]) all[temaKey] = {};
      if (!all[temaKey][artId]) all[temaKey][artId] = {};
      if (value) all[temaKey][artId][flag] = true;
      else delete all[temaKey][artId][flag];
      if (Object.keys(all[temaKey][artId]).length === 0) delete all[temaKey][artId];
      Store.set(STORAGE_KEYS.ARTICLE_FLAGS, all);
    },
    all() { return Store.get(STORAGE_KEYS.ARTICLE_FLAGS, {}); }
  };
  window.CAM_Flags = Flags;

  /* ─────────────────────────────────
     6. PROGRESO DE LECTURA (artículos vistos)
  ───────────────────────────────── */
  const Read = {
    mark(temaKey, artId) {
      const all = Store.get(STORAGE_KEYS.VISITED_ARTICLES, {});
      if (!all[temaKey]) all[temaKey] = {};
      all[temaKey][artId] = Date.now();
      Store.set(STORAGE_KEYS.VISITED_ARTICLES, all);
    },
    isRead(temaKey, artId) {
      const all = Store.get(STORAGE_KEYS.VISITED_ARTICLES, {});
      return !!(all[temaKey] && all[temaKey][artId]);
    },
    count(temaKey) {
      const all = Store.get(STORAGE_KEYS.VISITED_ARTICLES, {});
      return all[temaKey] ? Object.keys(all[temaKey]).length : 0;
    }
  };
  window.CAM_Read = Read;

  /* ─────────────────────────────────
     7. POSICIÓN DE SCROLL POR TEMA
  ───────────────────────────────── */
  const Scroll = {
    save(temaKey) {
      const all = Store.get(STORAGE_KEYS.SCROLL_POSITIONS, {});
      all[temaKey] = window.scrollY;
      Store.set(STORAGE_KEYS.SCROLL_POSITIONS, all);
    },
    restore(temaKey) {
      const all = Store.get(STORAGE_KEYS.SCROLL_POSITIONS, {});
      const y = all[temaKey];
      if (typeof y === 'number' && y > 100) {
        // Solo restaurar si no se está navegando a un hash específico
        if (!location.hash) {
          setTimeout(() => window.scrollTo({ top: y, behavior: 'auto' }), 50);
        }
      }
    }
  };
  window.CAM_Scroll = Scroll;

  /* ─────────────────────────────────
     8. NOTAS RÁPIDAS POR ARTÍCULO
  ───────────────────────────────── */
  const Notes = {
    get(temaKey, artId) {
      const all = Store.get(STORAGE_KEYS.NOTES, {});
      return (all[temaKey] && all[temaKey][artId]) || '';
    },
    set(temaKey, artId, text) {
      const all = Store.get(STORAGE_KEYS.NOTES, {});
      if (!all[temaKey]) all[temaKey] = {};
      if (text && text.trim()) all[temaKey][artId] = text.trim();
      else if (all[temaKey][artId]) delete all[temaKey][artId];
      if (all[temaKey] && Object.keys(all[temaKey]).length === 0) delete all[temaKey];
      Store.set(STORAGE_KEYS.NOTES, all);
    },
    all() { return Store.get(STORAGE_KEYS.NOTES, {}); }
  };
  window.CAM_Notes = Notes;

  /* ─────────────────────────────────
     8.5 AUTO-MARK ARTÍCULOS COMO LEÍDOS AL HACER SCROLL
     Si un artículo está visible >2 segundos lo marcamos como leído.
  ───────────────────────────────── */
  function autoMarkVisibleArticles() {
    const temaKey = document.body && document.body.dataset.tema;
    if (!temaKey) return;
    const articles = document.querySelectorAll('.article');
    if (!articles.length) return;

    const visibleTimers = new Map();

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const art = entry.target;
        if (!art.id) return;
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          // Lleva visible: arrancar timer de 1.5 s
          if (!visibleTimers.has(art)) {
            const t = setTimeout(() => {
              Read.mark(temaKey, art.id);
              art.classList.add('read');
              visibleTimers.delete(art);
              // Actualizar mini-mapa si existe
              const bar = document.querySelector('.minimap-bar[data-target="' + art.id + '"]');
              if (bar) bar.classList.add('read');
              obs.unobserve(art);
            }, 1500);
            visibleTimers.set(art, t);
          }
        } else {
          // Ya no visible: cancelar timer
          if (visibleTimers.has(art)) {
            clearTimeout(visibleTimers.get(art));
            visibleTimers.delete(art);
          }
        }
      });
    }, { threshold: [0, 0.5, 1] });

    articles.forEach((art) => {
      if (!art.id) return;
      if (Read.isRead(temaKey, art.id)) {
        art.classList.add('read');
      } else {
        obs.observe(art);
      }
    });
  }
  // Ejecutar después de que el bloque "MEJORAS UNIVERSALES" haya asignado IDs (delay 400ms)
  function deferredAutoMark() {
    setTimeout(autoMarkVisibleArticles, 400);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', deferredAutoMark);
  } else {
    deferredAutoMark();
  }
  window.CAM_autoMarkVisible = autoMarkVisibleArticles;

  /* ─────────────────────────────────
     9. FORMATEO DE FECHAS RELATIVAS
  ───────────────────────────────── */
  function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'hace unos segundos';
    if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
    if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
    if (s < 2592000) return `hace ${Math.floor(s / 86400)} días`;
    return new Date(ts).toLocaleDateString('es-ES');
  }
  window.CAM_timeAgo = timeAgo;

  /* ─────────────────────────────────
     10. CONTADOR ANIMADO
  ───────────────────────────────── */
  function animateCount(el, target, duration = 1200, suffix = '') {
    const start = performance.now();
    const startVal = 0;
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      // Easing easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.floor(startVal + (target - startVal) * eased);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(frame);
  }
  window.CAM_animateCount = animateCount;

  /* ─────────────────────────────────
     11. CONFETI (al sacar +90% en un test)
  ───────────────────────────────── */
  function confetti() {
    const colors = ['#c0305a', '#e05a80', '#fce8ef', '#2d6a4f', '#9a5c1a'];
    const container = document.createElement('div');
    container.className = 'cam-confetti';
    document.body.appendChild(container);
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('span');
      p.style.background = colors[i % colors.length];
      p.style.left = (Math.random() * 100) + 'vw';
      p.style.animationDelay = (Math.random() * 0.5) + 's';
      p.style.animationDuration = (2 + Math.random() * 1.5) + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(p);
    }
    setTimeout(() => container.remove(), 4500);
  }
  window.CAM_confetti = confetti;

  /* ─────────────────────────────────
     12. COPIAR AL PORTAPAPELES
  ───────────────────────────────── */
  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); ta.remove(); resolve(); }
      catch (e) { ta.remove(); reject(e); }
    });
  }
  window.CAM_copy = copyToClipboard;

  /* ─────────────────────────────────
     13. RACHA DE ESTUDIO 🔥
  ───────────────────────────────── */
  const Streak = {
    today() {
      const d = new Date();
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    },
    record() {
      const s = Store.get(STORAGE_KEYS.STREAK, { current: 0, best: 0, last: null, days: [] });
      const t = this.today();
      if (s.last === t) return s; // ya registrado hoy

      if (s.last) {
        // Si la última fecha fue ayer, sumamos a la racha
        const yest = new Date(); yest.setDate(yest.getDate() - 1);
        const yestStr = yest.getFullYear() + '-' + String(yest.getMonth() + 1).padStart(2, '0') + '-' + String(yest.getDate()).padStart(2, '0');
        if (s.last === yestStr) {
          s.current += 1;
        } else {
          s.current = 1; // reinicia
        }
      } else {
        s.current = 1;
      }
      s.last = t;
      if (s.current > s.best) s.best = s.current;
      s.days = (s.days || []);
      if (!s.days.includes(t)) s.days.push(t);
      s.days = s.days.slice(-365); // limitar a 365 días
      Store.set(STORAGE_KEYS.STREAK, s);

      // Check de logros relacionados
      Achievements.check();
      return s;
    },
    get() { return Store.get(STORAGE_KEYS.STREAK, { current: 0, best: 0, last: null, days: [] }); },
    isActiveToday() { return this.get().last === this.today(); }
  };
  window.CAM_Streak = Streak;

  /* ─────────────────────────────────
     14. SISTEMA DE LOGROS 🏆
  ───────────────────────────────── */
  const ACHIEVEMENTS_LIST = [
    { id: 'first_test', name: 'Primer paso', desc: 'Completa tu primer test', icon: '🎯', check: () => History.all().length >= 1 },
    { id: 'five_tests', name: 'Constante', desc: 'Completa 5 tests', icon: '📊', check: () => History.all().length >= 5 },
    { id: 'twenty_tests', name: 'Maratoniano', desc: 'Completa 20 tests', icon: '🏃', check: () => History.all().length >= 20 },
    { id: 'perfect_score', name: 'Sobresaliente', desc: 'Saca 100% en un test', icon: '💯', check: () => History.all().some(h => h.score === h.total && h.total > 0) },
    { id: 'good_score', name: 'Notable', desc: 'Saca al menos 75% en un test', icon: '🎖', check: () => History.all().some(h => h.total > 0 && (h.score / h.total) >= 0.75) },
    { id: 'streak_3', name: 'En forma', desc: '3 días de racha', icon: '🔥', check: () => Streak.get().best >= 3 },
    { id: 'streak_7', name: 'Semana completa', desc: '7 días de racha', icon: '⚡', check: () => Streak.get().best >= 7 },
    { id: 'streak_30', name: 'Imparable', desc: '30 días de racha', icon: '🌟', check: () => Streak.get().best >= 30 },
    { id: 'reader_50', name: 'Lector', desc: 'Lee 50 artículos', icon: '📖', check: () => {
      const v = Store.get(STORAGE_KEYS.VISITED_ARTICLES, {});
      let n = 0; Object.values(v).forEach(o => n += Object.keys(o).length); return n >= 50;
    }},
    { id: 'reader_200', name: 'Erudito', desc: 'Lee 200 artículos', icon: '🎓', check: () => {
      const v = Store.get(STORAGE_KEYS.VISITED_ARTICLES, {});
      let n = 0; Object.values(v).forEach(o => n += Object.keys(o).length); return n >= 200;
    }},
    { id: 'examen_mode', name: 'A examen', desc: 'Completa un test en modo Examen', icon: '⏱', check: () => History.all().some(h => h.mode === 'Examen') },
    { id: 'mark_first', name: 'Organizado', desc: 'Marca un artículo como dudoso o importante', icon: '🔖', check: () => {
      const f = Store.get(STORAGE_KEYS.ARTICLE_FLAGS, {});
      return Object.keys(f).length > 0;
    }},
    { id: 'notes_first', name: 'Apuntador', desc: 'Escribe tu primera nota', icon: '📝', check: () => {
      const n = Store.get(STORAGE_KEYS.NOTES, {});
      return Object.keys(n).length > 0;
    }},
    { id: 'dark_mode', name: 'Modo nocturno', desc: 'Activa el modo oscuro', icon: '🌙', check: () => Store.get(STORAGE_KEYS.THEME) === 'dark' }
  ];

  const Achievements = {
    list: ACHIEVEMENTS_LIST,
    unlocked() { return Store.get(STORAGE_KEYS.ACHIEVEMENTS, {}); },
    check() {
      const unlocked = this.unlocked();
      let changed = false;
      const newOnes = [];
      ACHIEVEMENTS_LIST.forEach(a => {
        if (!unlocked[a.id]) {
          try {
            if (a.check()) {
              unlocked[a.id] = Date.now();
              changed = true;
              newOnes.push(a);
            }
          } catch (e) { /* silencioso */ }
        }
      });
      if (changed) {
        Store.set(STORAGE_KEYS.ACHIEVEMENTS, unlocked);
        // Mostrar toasts secuencialmente
        newOnes.forEach((a, i) => {
          setTimeout(() => {
            Toast.show(a.icon + ' Logro desbloqueado: ' + a.name, 3500);
          }, 600 + i * 700);
        });
      }
      return newOnes;
    },
    reset() { Store.remove(STORAGE_KEYS.ACHIEVEMENTS); }
  };
  window.CAM_Achievements = Achievements;

  /* ─────────────────────────────────
     15. TEST INACABADO (resumir)
  ───────────────────────────────── */
  const Unfinished = {
    save(state) { Store.set(STORAGE_KEYS.UNFINISHED_TEST, { ...state, ts: Date.now() }); },
    get() { return Store.get(STORAGE_KEYS.UNFINISHED_TEST, null); },
    clear() { Store.remove(STORAGE_KEYS.UNFINISHED_TEST); },
    exists() {
      const u = this.get();
      if (!u) return false;
      // Caduca a las 24 h
      if (Date.now() - u.ts > 24 * 60 * 60 * 1000) { this.clear(); return false; }
      return true;
    }
  };
  window.CAM_Unfinished = Unfinished;

  /* ─────────────────────────────────
     16. DETECTOR DE CONEXIÓN
  ───────────────────────────────── */
  function setupOfflineDetector() {
    if (typeof window === 'undefined' || !('addEventListener' in window)) return;
    let banner = null;
    function ensureBanner() {
      if (banner) return banner;
      banner = document.createElement('div');
      banner.id = 'cam-offline-banner';
      banner.innerHTML = '<span>⚠ Sin conexión — usando versión guardada</span>';
      banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#9a5c1a;color:#fff;padding:8px 16px;text-align:center;font-family:\'Source Serif 4\',Georgia,serif;font-size:.84rem;z-index:9999;transform:translateY(-100%);transition:transform .3s;font-weight:600;letter-spacing:.02em;box-shadow:0 4px 14px rgba(0,0,0,.18);';
      document.body.appendChild(banner);
      return banner;
    }
    function update() {
      const b = ensureBanner();
      if (!navigator.onLine) {
        b.style.transform = 'translateY(0)';
      } else {
        b.style.transform = 'translateY(-100%)';
      }
    }
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => { if (!navigator.onLine) update(); });
    } else {
      if (!navigator.onLine) update();
    }
  }
  setupOfflineDetector();

  /* ─────────────────────────────────
     17. REGISTRAR ACTIVIDAD (llamada cuando se hace algo "útil")
  ───────────────────────────────── */
  function recordActivity() {
    Streak.record();
  }
  window.CAM_recordActivity = recordActivity;

  // Auto-registrar al cargar página de tema o test
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.body && document.body.dataset && document.body.dataset.tema) recordActivity();
    });
  } else {
    if (document.body && document.body.dataset && document.body.dataset.tema) recordActivity();
  }

})();
