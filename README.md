# 📚 Oposiciones CAM — Plataforma de Estudio

> Plataforma web ultraligera, instalable como app y completamente offline para preparar las oposiciones de la **Comunidad Autónoma de Madrid**. Temario íntegro cifrado, +200 preguntas tipo test, modo oscuro y seguimiento personal de progreso.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=flat&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?style=flat)
![AES-GCM](https://img.shields.io/badge/AES--GCM-256-2d6a4f?style=flat)
![Dark Mode](https://img.shields.io/badge/Dark%20Mode-✓-15090e?style=flat)
![Responsive](https://img.shields.io/badge/Responsive-✓-c0305a?style=flat)
![No Build](https://img.shields.io/badge/No_build-required-f06292?style=flat)

🔗 **Web pública**: [angelcasta1.github.io/Oposiciones-CAM](https://angelcasta1.github.io/Oposiciones-CAM/)

---

## ✨ ¿Qué es?

Una **web estática + PWA** (Progressive Web App) que se puede instalar como aplicación en móvil y PC y funciona **sin conexión**. Sin servidor, sin frameworks, sin build step.

El contenido del temario está **cifrado con AES‑GCM 256** y solo se descifra en el navegador al introducir la clave de acceso, de forma que el código fuente público en GitHub no expone el material de estudio.

---

## 🔐 Privacidad y cifrado

El proyecto utiliza un **doble candado**:

1. **Pantalla de bloqueo (privacy.js)** — la web pide una clave antes de mostrar nada. Se desbloquea por URL mágica (`?acceso=...`) o por formulario, y el estado se guarda en `localStorage`.
2. **Cifrado AES del contenido (crypto.js)** — el contenido de cada tema viaja cifrado en archivos `.json` dentro de `temas-cifrados/` y se descifra en el navegador con **Web Crypto API nativa**:
   - Algoritmo: **AES‑GCM** con clave de **256 bits**
   - Derivación de clave: **PBKDF2 + SHA‑256**, 100 000 iteraciones
   - Formato: `salt (16 B) + IV (12 B) + ciphertext`, codificado en base64

> 💡 La clave nunca se sube al repositorio. El acceso se gestiona compartiendo la URL con el parámetro de acceso únicamente con personas autorizadas.

---

## 📁 Estructura del proyecto

```
oposiciones-cam/
├── index.html                  # Portada / landing
├── tema1.html                  # Constitución Española de 1978
├── tema2.html                  # Estatuto de Autonomía CAM
├── tema3.html                  # Asamblea y Gobierno CAM
├── tema4.html                  # Administración de la CAM
├── tests.html                  # Tests interactivos (estudio + examen + flashcards)
├── progreso.html               # Racha, logros, gráfico y diagnóstico
├── 404.html                    # Página de error personalizada
├── assets/
│   ├── app.js                  # Storage, modo oscuro, toasts, racha, logros, notas
│   ├── crypto.js               # Cifrado/descifrado AES‑GCM + PBKDF2
│   ├── privacy.js              # Pantalla de bloqueo con clave
│   ├── privacy.css             # Estilos pantalla de bloqueo
│   ├── tema-extras.js          # Copiar texto, siguiente artículo, atajos
│   └── theme.css               # Paleta + componentes + modo oscuro
├── temas-cifrados/
│   ├── canary.json
│   ├── tema1.json              # Contenido cifrado del Tema 1
│   ├── tema2.json              # Contenido cifrado del Tema 2
│   ├── tema3.json              # Contenido cifrado del Tema 3
│   └── tema4.json              # Contenido cifrado del Tema 4
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
├── favicon.svg
├── og-image.png                # Preview para redes sociales
├── manifest.webmanifest        # PWA manifest
├── sw.js                       # Service Worker (offline cache v7)
└── README.md
```

---

## 🎯 Funcionalidades destacadas

### 📖 Modo Estudio
- **Texto íntegro y oficial** de cada artículo (sin resúmenes ni recortes)
- **Acordeón** por artículo, con índice lateral + scrollspy
- **Buscador** con resaltado de coincidencias en tiempo real + contador
- **Marcadores** 🤔 *Dudoso* y ⭐ *Importante* persistentes
- **Auto‑marcado** de artículos como leídos al pasar 1,5 s en pantalla
- **Notas personales** por artículo
- **Mini‑mapa lateral** en pantallas ≥ 1280 px
- **Atajos de teclado**: `/` buscar · `↑/↓` navegar · `Esc` cerrar · `?` ayuda
- **Botón copiar texto** y **Siguiente artículo** dentro de cada art‑body
- **Hash deep‑linking** que abre y resalta el artículo de destino

### ✅ Tests Interactivos (162 preguntas)
- **3 bancos** por tema + **Mixto** + **Mis falladas** (repaso inteligente)
- **Modo Estudio** con feedback inmediato y explicación
- **Modo Examen** con cronómetro configurable (15/30/45/60 min)
- **Modo Flashcards 🎴** con atajos `Space` / `S` / `N`
- Marcas 🤔 / ⭐ persistentes también en preguntas
- **Atajos de teclado**: `A`/`B`/`C`/`D` o `1`–`4`, `Enter`, `Esc`, `D`, `I`
- **Vista de revisión** con filtros (todas / falladas / acertadas)
- 🎉 **Confeti** al sacar +90 %

### 📊 Mi Progreso
- 🔥 **Racha de estudio** con calendario de 30 días
- 🏆 **Sistema de logros** (14 hitos desbloqueables)
- 📈 **Gráfico SVG** con la evolución de los últimos 15 tests
- Mejores puntuaciones por test e histórico de los últimos 50
- Estadísticas reales: **3 temas · 273 artículos · 162 preguntas**
- 📥 **Exportar/importar** datos en JSON (backup)
- 🗑 Borrado selectivo o total

### 🌙 Modo Oscuro
- Toggle en la barra superior de cada página
- Paleta completa adaptada (no es un simple invert)
- Persistente y respeta `prefers-color-scheme` por defecto
- `theme-color` dinámico para la barra del navegador móvil

### 📱 PWA
- Manifest completo con shortcuts (Tests, Mi Progreso)
- Service Worker con caché de assets esenciales y JSON cifrados
- Funciona en metro / AVE / sin datos
- Detector de conexión integrado
- Open Graph + Twitter Cards para preview en redes

---

## 🛠 Stack

- **HTML5** semántico
- **CSS3** con custom properties, Grid, Flexbox y `data-theme` switch
- **JavaScript Vanilla** (sin frameworks ni bundlers)
- **Web Crypto API** (AES‑GCM 256 + PBKDF2 SHA‑256 100 k)
- **localStorage** para persistencia
- **Service Worker** para PWA y caché offline
- **Google Fonts**: Playfair Display + Source Serif 4

---

## 🎨 Paleta

| Token | Color | Uso |
|---|---|---|
| `#fce4ec` | 🌸 Rosa pastel | Fondos suaves |
| `#f06292` | 🌷 Rosa medio | Acentos y botones |
| `#e05a80` | 🌹 Rosa intenso | Hover / acciones |
| `#c0305a` | 🍷 Burdeos | Títulos y enlaces |

---

## 🚀 Uso local

```bash
# Clona el repo
git clone https://github.com/AngelCasta1/Oposiciones-CAM.git
cd Oposiciones-CAM

# Sirve la carpeta (cualquier servidor estático sirve)
python3 -m http.server 8080
# o:  npx serve .

# Abre en el navegador
http://localhost:8080/?acceso=TU_CLAVE
```

> Para descifrar el contenido necesitas conocer la clave de acceso. Si no la tienes, contacta con el autor.

---

## 📜 Licencia

Uso personal. El temario referencia normativa de dominio público (BOE, BOCM); la transcripción, maquetación, código y diseño de esta plataforma son de autoría propia.

---

## 👤 Autor

**Ángel Castaño** · [@AngelCasta1](https://github.com/AngelCasta1)

Hecho con 🌸 para opositar a la Comunidad de Madrid.
