(function () {
  'use strict';

  // CONFIGURACION
  const CLAVE_SECRETA = 'madrid2026';
  const PARAM_NAME = 'acceso';
  const STORAGE_KEY = 'cam_access_granted';

  function tieneAcceso() {
    try {
      const params = new URLSearchParams(window.location.search);
      const claveURL = params.get(PARAM_NAME);
      if (claveURL === CLAVE_SECRETA) {
        try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
        if (window.history && window.history.replaceState) {
          params.delete(PARAM_NAME);
          const newQs = params.toString();
          const newUrl = window.location.pathname + (newQs ? '?' + newQs : '') + window.location.hash;
          window.history.replaceState({}, '', newUrl);
        }
        return true;
      }
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function renderLockScreen() {
    const overlay = document.createElement('div');
    overlay.id = 'cam-privacy-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'cam-privacy-title');
    overlay.innerHTML =
      '<div class="cam-privacy-card">' +
        '<div class="cam-privacy-lock" aria-hidden="true">🔒</div>' +
        '<div class="cam-privacy-badge">Acceso restringido</div>' +
        '<h1 id="cam-privacy-title">Contenido Protegido</h1>' +
        '<p>Este temario y los tests contienen material privado de estudio. Si eres un reclutador o tutor, solicita el enlace de acceso completo.</p>' +
        '<form class="cam-privacy-form" id="camPrivacyForm" autocomplete="off">' +
          '<label for="camPrivacyInput" class="cam-privacy-label">¿Tienes la clave de acceso?</label>' +
          '<div class="cam-privacy-input-row">' +
            '<input type="password" id="camPrivacyInput" placeholder="Introduce tu clave" autocomplete="off" spellcheck="false" aria-label="Clave de acceso">' +
            '<button type="submit" class="cam-privacy-btn">Desbloquear →</button>' +
          '</div>' +
          '<div class="cam-privacy-error" id="camPrivacyError" role="alert"></div>' +
        '</form>' +
        '<div class="cam-privacy-links">' +
          '<a href="index.html">← Volver al inicio</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    const form = document.getElementById('camPrivacyForm');
    const input = document.getElementById('camPrivacyInput');
    const err = document.getElementById('camPrivacyError');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const val = (input.value || '').trim();
      if (val === CLAVE_SECRETA) {
        try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e2) {}
        overlay.style.opacity = '0';
        document.documentElement.classList.remove('cam-locked');
        setTimeout(function () {
          overlay.remove();
          if (window.CAM_Toast && typeof window.CAM_Toast.show === 'function') {
            window.CAM_Toast.show('🔓 Acceso desbloqueado');
          }
        }, 350);
      } else {
        err.textContent = '❌ Clave incorrecta. Inténtalo de nuevo.';
        input.classList.add('cam-privacy-shake');
        input.value = '';
        input.focus();
        setTimeout(function () { input.classList.remove('cam-privacy-shake'); }, 500);
      }
    });

    setTimeout(function () { input.focus(); }, 200);
  }

  function init() {
    if (tieneAcceso()) {
      document.documentElement.classList.remove('cam-locked');
      return;
    }
    document.documentElement.classList.add('cam-locked');
    if (document.body) {
      renderLockScreen();
    } else {
      document.addEventListener('DOMContentLoaded', renderLockScreen);
    }
  }

  init();

  window.CAM_revokeAccess = function () {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    location.reload();
  };
})();
