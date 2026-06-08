# 📚 Oposiciones CAM — Plataforma de Estudio

> Plataforma web ultraligera, instalable como app y completamente offline para preparar las oposiciones de la **Comunidad Autónoma de Madrid**. Temario íntegro, tests interactivos con múltiples modos, modo oscuro y seguimiento personal de progreso.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=flat&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?style=flat)
![Dark Mode](https://img.shields.io/badge/Dark%20Mode-✓-15090e?style=flat)
![Responsive](https://img.shields.io/badge/Responsive-✓-c0305a?style=flat)
![No Build](https://img.shields.io/badge/No_build-required-2d6a4f?style=flat)

---

## ✨ ¿Qué es?

Una **web estática + PWA** (Progressive Web App) que se puede instalar como aplicación en móvil y PC y funciona **sin conexión**. Sin servidor, sin frameworks, sin build step. Solo abre `index.html` o sirve el directorio.

---

## 📁 Estructura del proyecto

```
oposiciones-cam/
├── index.html              # Portada / landing
├── tema1.html              # Constitución Española de 1978
├── tema2.html              # Estatuto de Autonomía CAM
├── tema3.html              # Asamblea y Gobierno CAM
├── tests.html              # Tests interactivos (estudio + examen)
├── progreso.html           # Mi progreso, histórico y datos
├── assets/
│   ├── app.js              # Lógica compartida (storage, modo oscuro, toasts)
│   └── theme.css           # Modo oscuro + componentes compartidos
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
├── favicon.svg
├── og-image.png            # Preview para redes sociales
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service Worker (offline)
└── README.md
```

---

## 🎯 Funcionalidades destacadas

### 📖 Modo Estudio
- **Texto íntegro y oficial** de cada artículo (sin resúmenes)
- **Índice lateral** con scrollspy automático
- **Buscador con resaltado** de coincidencias en tiempo real + contador
- **Marcadores** 🤔 *Dudoso* y ⭐ *Importante* por artículo
- **Artículos leídos** (✓) marcados automáticamente al desplegar
- **Mini-mapa** lateral en pantallas grandes (≥1280 px)
- **Botón copiar enlace** al artículo (URL tipo `tema1.html#art-15`)
- **Restauración de scroll** entre visitas
- **Hash deep-linking** que abre y resalta el artículo de destino

### ✅ Tests Interactivos
- **3 bancos** por tema + **mixto** + **"Mis falladas"** (repaso inteligente)
- **Modo Estudio** (feedback inmediato + explicación con cita literal)
- **Modo Examen** con cronómetro configurable (15/30/45/60 min)
- **Atajos de teclado**:
  - `A`/`B`/`C`/`D` o `1`–`4` para seleccionar opción
  - `Enter` para siguiente
  - `Esc` para salir
  - `D` marcar dudosa · `I` marcar importante
- **Vista de revisión** con filtros (todas / falladas / acertadas)
- **🎉 Confeti** al sacar +90%

### 📊 Mi Progreso (página dedicada)
- Estadísticas de artículos vistos por tema con barras de progreso
- 🏆 Mejores puntuaciones por test
- Histórico de los últimos 50 tests
- Lista de artículos marcados como dudosos o importantes
- 📥 **Exportar/importar** datos JSON (backup)
- 🗑 Borrado selectivo o total

### 🌙 Modo Oscuro
- Toggle en la barra superior de cada página
- Paleta completa adaptada (no es un simple invert)
- Persistente (localStorage) y respeta `prefers-color-scheme` por defecto
- `theme-color` dinámico para la barra del navegador móvil

### 📱 PWA (instalable + offline)
- Manifest completo con shortcuts (Tests, Mi Progreso)
- Service Worker con caché de assets esenciales
- Funciona en metro/AVE sin datos
- Open Graph + Twitter Cards para preview en redes

---

## 🛠 Stack

- **HTML5** semántico
- **CSS3** con custom properties, Grid, Flexbox y `data-theme` switch
- **JavaScript Vanilla** (sin frameworks ni bundlers)
- **localStorage** para persistencia
- **Service Worker** para PWA
- **Google Fonts**: Playfair Display + Source Serif 4

---

## 🚀 Cómo usar

### Opción 1 — Servidor local (recomendado para PWA)
Para que el Service Worker funcione necesitas servir por HTTP:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .

# PHP
php -S localhost:8080
```

Visita `http://localhost:8080` → en Chrome/Edge aparecerá el botón **"Instalar app"**.

### Opción 2 — Abrir directamente
Funcionará todo salvo el modo offline (el SW requiere HTTP).

### Opción 3 — Desplegar gratis
- **GitHub Pages**: Settings → Pages → Branch `main`
- **Netlify** / **Vercel** / **Cloudflare Pages**: drag & drop

---

## 💾 Tus datos

Todo se guarda en **localStorage** de tu navegador:

| Clave | Contenido |
|---|---|
| `cam_theme` | Preferencia de tema (light/dark) |
| `cam_test_history` | Últimos 50 tests con fecha y resultado |
| `cam_test_best` | Mejor puntuación por test |
| `cam_wrong_questions` | Preguntas falladas (para repaso) |
| `cam_article_flags` | Marcadores 🤔/⭐ por artículo |
| `cam_visited_articles` | Artículos abiertos en cada tema |
| `cam_scroll_positions` | Última posición de scroll por tema |
| `cam_notes` | Notas personales por artículo |

Desde **"Mi Progreso"** → "Exportar mis datos" descargas un JSON con todo. Útil para cambiar de navegador.

---

## ⌨️ Atajos de teclado

| Donde | Tecla | Acción |
|---|---|---|
| Tests | `A`/`B`/`C`/`D` o `1`-`4` | Seleccionar opción |
| Tests | `Enter` | Siguiente pregunta |
| Tests | `Esc` | Salir del test |
| Tests | `D` | Marcar pregunta como dudosa |
| Tests | `I` | Marcar pregunta como importante |

---

## 🗺 Roadmap

- [x] Portada con selector de modo
- [x] Tema 1 — Constitución Española
- [x] Tema 2 — Estatuto de Autonomía CAM
- [x] Tema 3 — Asamblea y Gobierno
- [x] Tests interactivos con corrección
- [x] Modo Examen con temporizador
- [x] Modo oscuro
- [x] Persistencia localStorage
- [x] Página "Mi Progreso"
- [x] Buscador con resaltado
- [x] Marcadores Dudoso/Importante
- [x] Copia de enlaces a artículos
- [x] PWA instalable
- [x] Service Worker (offline)
- [x] Mini-mapa de artículos
- [x] Confeti + microanimaciones
- [x] Exportar/importar backup
- [ ] Tema 4 — Organización institucional CAM
- [ ] Tema 5 — Ley 39/2015
- [ ] Glosario interactivo con tooltips
- [ ] Esquemas visuales por tema (timeline, organigramas)
- [ ] Notificaciones push de repaso

---

## 🤝 Contribuir

Las contribuciones son bienvenidas, especialmente en:
- ✏️ Nuevas preguntas para tests
- 🔍 Corrección de erratas
- 📚 Nuevos temas del bloque común
- 🎨 Mejoras de diseño/UX

```bash
git checkout -b feature/mi-mejora
# ...cambios...
git commit -m "feat: añade X"
git push origin feature/mi-mejora
# → Abre Pull Request
```

---

## ⚠️ Aviso legal

Proyecto con **fines educativos**. Los textos normativos son de dominio público (CE, Estatuto CAM, Reglamento Asamblea, Ley 1/1983). **Verifica siempre la versión vigente** en fuentes oficiales:

- [BOE](https://www.boe.es)
- [BOCM](https://www.bocm.es)

---

## 📄 Licencia

MIT — Libre uso, modificación y distribución.

---

<p align="center">
  <sub>Hecho con ❤ para opositores. Si te resulta útil, deja una ⭐</sub>
</p>
