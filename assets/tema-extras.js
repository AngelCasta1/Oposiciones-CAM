/* ─────────────────────────────────────────
   EXTRAS DE TEMAS — notas, siguiente artículo, atajos
   Se carga adicionalmente al bloque inline en cada tema.html
───────────────────────────────────────── */
(function () {
  const TEMA_KEY = (document.body && document.body.dataset && document.body.dataset.tema) || '';
  if (!TEMA_KEY) return;
  if (typeof CAM_Notes === 'undefined' || typeof CAM_Read === 'undefined') return;

  function setupArticleExtras() {
    const articles = document.querySelectorAll('.article');

    articles.forEach((art, idx) => {
      if (!art.id || art.dataset.extrasDone) return;
      art.dataset.extrasDone = '1';

      const header = art.querySelector('.art-header');
      const body = art.querySelector('.art-body');
      if (!header || !body) return;

      /* ── 1. BOTÓN NOTAS ── */
      if (!art.querySelector('.art-note-btn')) {
        const hasNote = !!CAM_Notes.get(TEMA_KEY, art.id);
        const noteBtn = document.createElement('button');
        noteBtn.className = 'art-note-btn' + (hasNote ? ' has-note' : '');
        noteBtn.setAttribute('aria-label', 'Añadir o ver nota');
        noteBtn.innerHTML = (hasNote ? '📝 Nota' : '+ Nota');
        noteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          // Abrir el artículo si está cerrado y mostrar el panel
          if (!art.classList.contains('open')) art.classList.add('open');
          const panel = art.querySelector('.art-note-panel');
          if (panel) {
            panel.classList.toggle('open');
            if (panel.classList.contains('open')) {
              setTimeout(() => panel.querySelector('textarea')?.focus(), 50);
            }
          }
        });
        // Insertar como primer hijo del header (antes del art-num)
        const flagsWrap = art.querySelector('.art-flags');
        if (flagsWrap) flagsWrap.appendChild(noteBtn);
        else header.appendChild(noteBtn);
      }

      /* ── 2. PANEL DE NOTAS dentro del body ── */
      if (!body.querySelector('.art-note-panel')) {
        const note = CAM_Notes.get(TEMA_KEY, art.id);
        const panel = document.createElement('div');
        panel.className = 'art-note-panel' + (note ? ' open' : '');
        panel.innerHTML = `
          <div style="font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;font-weight:700;color:var(--amber);margin-bottom:8px;">📝 Mi nota personal</div>
          <textarea placeholder="Escribe aquí tus apuntes, ideas o preguntas sobre este artículo..." aria-label="Nota personal">${(note || '').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]))}</textarea>
          <div class="art-note-actions">
            <span class="note-meta">${note ? 'Nota guardada · ' + Math.ceil(note.length / 200) + ' min lectura' : 'Vacía'}</span>
            <div>
              <button class="note-cancel" data-action="cancel">Cerrar</button>
              <button class="note-save" data-action="save">Guardar</button>
            </div>
          </div>
        `;
        body.appendChild(panel);
        panel.querySelector('[data-action="save"]').addEventListener('click', (e) => {
          e.stopPropagation();
          const ta = panel.querySelector('textarea');
          const text = ta.value;
          CAM_Notes.set(TEMA_KEY, art.id, text);
          // Actualizar botón en header
          const btn = art.querySelector('.art-note-btn');
          if (btn) {
            if (text.trim()) {
              btn.classList.add('has-note');
              btn.innerHTML = '📝 Nota';
            } else {
              btn.classList.remove('has-note');
              btn.innerHTML = '+ Nota';
            }
          }
          // Actualizar meta
          const meta = panel.querySelector('.note-meta');
          if (meta) meta.textContent = text.trim() ? 'Nota guardada · ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'Vacía';
          if (typeof CAM_Toast !== 'undefined') CAM_Toast.show('📝 Nota guardada');
          if (typeof CAM_Achievements !== 'undefined') CAM_Achievements.check();
        });
        panel.querySelector('[data-action="cancel"]').addEventListener('click', (e) => {
          e.stopPropagation();
          panel.classList.remove('open');
        });
      }

      /* ── 3. BOTÓN COPIAR TEXTO ÍNTEGRO ── */
      if (!art.querySelector('.art-copy-text') && typeof CAM_copy === 'function') {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'art-copy art-copy-text';
        copyBtn.setAttribute('aria-label', 'Copiar texto del artículo');
        copyBtn.setAttribute('title', 'Copiar texto del artículo');
        copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar texto';
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          // Asegurar que está abierto para tener el texto del body
          if (!art.classList.contains('open')) art.classList.add('open');
          // Construir texto plano
          const title = art.querySelector('.art-title');
          const num = art.querySelector('.art-num');
          let txt = '';
          if (num) txt += num.textContent.trim() + ' — ';
          if (title) {
            // Clonar para limpiar
            const clone = title.cloneNode(true);
            clone.querySelectorAll('.art-preview').forEach(p => p.remove());
            txt += clone.textContent.trim() + '\n\n';
          }
          // Solo el contenido textual del body
          const bodyClone = body.cloneNode(true);
          bodyClone.querySelectorAll('.art-note-panel').forEach(n => n.remove());
          txt += bodyClone.textContent.replace(/\s+/g, ' ').trim();
          txt += '\n\nFuente: CAM Opos · ' + location.origin + location.pathname + '#' + art.id;
          CAM_copy(txt).then(() => {
            if (typeof CAM_Toast !== 'undefined') CAM_Toast.show('📋 Texto copiado al portapapeles');
          }).catch(() => {
            if (typeof CAM_Toast !== 'undefined') CAM_Toast.show('No se pudo copiar');
          });
        });
        art.appendChild(copyBtn);
      }

      /* ── 4. BOTÓN "↓ SIGUIENTE ARTÍCULO" en el body ── */
      if (!body.querySelector('.next-art-btn')) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'next-art-btn';
        nextBtn.innerHTML = 'Siguiente artículo <span style="font-size:1.05rem;">↓</span>';
        nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          // Cerrar este, abrir el siguiente NO oculto
          art.classList.remove('open');
          const allArts = Array.from(document.querySelectorAll('.article:not(.hidden)'));
          const myIdx = allArts.indexOf(art);
          const next = allArts[myIdx + 1];
          if (next) {
            next.classList.add('open');
            setTimeout(() => {
              next.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            if (typeof CAM_Read !== 'undefined') CAM_Read.mark(TEMA_KEY, next.id);
          } else {
            if (typeof CAM_Toast !== 'undefined') CAM_Toast.show('¡Has llegado al último artículo! 🎉');
          }
        });
        body.appendChild(nextBtn);
      }
    });
  }

  /* ── 5. ATAJOS DE TECLADO EN LOS TEMAS ── */
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select, [contenteditable]')) return;
      const key = e.key;

      // "/" enfoca el buscador
      if (key === '/' && !e.ctrlKey && !e.metaKey) {
        const search = document.getElementById('searchInput');
        if (search) {
          e.preventDefault();
          search.focus();
          search.select();
        }
      }
      // "?" abre ayuda con atajos
      else if (key === '?') {
        e.preventDefault();
        showShortcutsHelp();
      }
      // "↓" siguiente artículo, "↑" anterior (solo si hay uno abierto)
      else if (key === 'ArrowDown' || key === 'ArrowUp') {
        const allArts = Array.from(document.querySelectorAll('.article:not(.hidden)'));
        const openIdx = allArts.findIndex(a => a.classList.contains('open'));
        if (openIdx === -1) return;
        e.preventDefault();
        allArts[openIdx].classList.remove('open');
        const target = key === 'ArrowDown' ? allArts[openIdx + 1] : allArts[openIdx - 1];
        if (target) {
          target.classList.add('open');
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (typeof CAM_Read !== 'undefined' && target.id) CAM_Read.mark(TEMA_KEY, target.id);
        }
      }
      // ESC cierra todos los artículos abiertos
      else if (key === 'Escape') {
        const open = document.querySelectorAll('.article.open');
        if (open.length > 0) {
          e.preventDefault();
          open.forEach(a => a.classList.remove('open'));
        }
      }
    });
  }

  function showShortcutsHelp() {
    if (document.getElementById('shortcutsModal')) return;
    const modal = document.createElement('div');
    modal.id = 'shortcutsModal';
    modal.className = 'welcome-overlay';
    modal.innerHTML = `
      <div class="welcome-card">
        <span class="emoji">⌨️</span>
        <h2>Atajos de teclado</h2>
        <p style="margin-bottom:18px;">Atajos disponibles en los temas:</p>
        <div style="text-align:left;font-size:.88rem;line-height:2;color:var(--text);">
          <div><span class="kbd">/</span> Buscar artículo</div>
          <div><span class="kbd">↓</span> / <span class="kbd">↑</span> Navegar al siguiente / anterior artículo</div>
          <div><span class="kbd">Esc</span> Cerrar todos los artículos abiertos</div>
          <div><span class="kbd">?</span> Ver esta ayuda</div>
        </div>
        <button class="btn-start" style="margin-top:22px;" onclick="document.getElementById('shortcutsModal').remove()">Entendido →</button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  // Ejecutar todo tras un pequeño delay (esperar al bloque inline universal)
  function init() {
    setTimeout(() => {
      setupArticleExtras();
      setupKeyboardShortcuts();
    }, 500);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
