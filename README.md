# 📚 Oposiciones CAM — Plataforma de Estudio

> Plataforma web ultraligera, instalable como app y completamente offline para preparar las oposiciones de la **Comunidad Autónoma de Madrid**. Temario íntegro cifrado con AES-256, +420 preguntas tipo test, modo oscuro y seguimiento personal de progreso.

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

1. **Pantalla de bloqueo (privacy.js)** — la web pide una clave antes de mostrar el contenido. Se desbloquea por URL mágica (`?acceso=...`) o por formulario modal, validándose contra un archivo *canary* cifrado, y el estado se guarda en `localStorage`.
2. **Cifrado AES del contenido (crypto.js)** — el contenido de cada tema viaja cifrado en archivos `.json` dentro de `temas-cifrados/` y se descifra en el navegador con **Web Crypto API nativa**:
   - Algoritmo: **AES‑GCM** con clave de **256 bits**
   - Derivación de clave: **PBKDF2 + SHA‑256**, 100 000 iteraciones
   - Formato: `salt (16 B) + IV (12 B) + ciphertext + authTag (16 B)`, codificado en base64

> 💡 La clave nunca se sube al repositorio en texto plano. El acceso se gestiona compartiendo la URL con el parámetro de acceso únicamente con personas autorizadas.

---

## 📁 Estructura del proyecto

```
oposiciones-cam/
├── index.html                  # Portada / landing con estadísticas globales
├── tema1.html                  # Tema 1: Constitución Española de 1978 (61 arts)
├── tema2.html                  # Tema 2: Estatuto de Autonomía CAM (28 arts)
├── tema3.html                  # Tema 3: Asamblea, Procedimiento Leg. y Gobierno CAM (184 arts)
├── tema4.html                  # Tema 4: La Administración de la CAM (94 arts)
├── tema5.html                  # Tema 5: Info y Administración Electrónica (71 arts)
├── tema6.html                  # Tema 6: Protección de Datos Personales — RGPD y LOPDGDD (191 arts)
├── tests.html                  # Tests interactivos (estudio + examen + flashcards + falladas)
├── progreso.html               # Racha, logros, gráfico SVG y diagnóstico por tema
├── 404.html                    # Página de error personalizada
├── assets/
│   ├── app.js                  # Storage, modo oscuro, toasts, racha, logros, notas
│   ├── crypto.js               # Cifrado/descifrado AES‑GCM + PBKDF2
│   ├── privacy.js              # Validación de acceso y pantalla de bloqueo
│   ├── privacy.css             # Estilos de pantalla de bloqueo
│   ├── tema-extras.js          # Copiar texto, siguiente artículo, atajos
│   └── theme.css               # Paleta rosa pastel + componentes + modo oscuro
├── temas-cifrados/
│   ├── canary.json             # Testigo para validar la clave de acceso
│   ├── tema1.json              # Contenido cifrado del Tema 1
│   ├── tema2.json              # Contenido cifrado del Tema 2
│   ├── tema3.json              # Contenido cifrado del Tema 3
│   ├── tema4.json              # Contenido cifrado del Tema 4
│   ├── tema5.json              # Contenido cifrado del Tema 5
│   └── tema6.json              # Contenido cifrado del Tema 6
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
├── favicon.svg
├── og-image.png                # Preview para redes sociales
├── manifest.webmanifest        # PWA manifest
├── sw.js                       # Service Worker (offline cache v21)
└── README.md
```

---

## 🎯 Funcionalidades destacadas

### 📖 Modo Estudio
- **Texto íntegro y oficial** de cada artículo (sin resúmenes ni recortes)
- **Acordeón** por artículo, con índice lateral + scrollspy
- **Buscador** con resaltado de coincidencias en tiempo real + contador
- **Marcadores** 🤔 *Dudoso* y ⭐ *Importante* persistentes
- **Auto‑marcado** de artículos como leídos al interactuar con ellos
- **Notas personales** por artículo
- **Mini‑mapa lateral** en pantallas amplias
- **Atajos de teclado**: `/` buscar · `↑/↓` navegar · `Esc` cerrar · `?` ayuda
- **Botón copiar texto** y navegación rápida dentro de cada artículo
- **Hash deep‑linking** que abre y resalta el artículo de destino

### ✅ Tests Interactivos (422 preguntas)
- **6 bancos específicos** por tema + **Test Mixto** (20 aleatorias) + **Mis falladas** (repaso inteligente)
- **Modo Estudio** con feedback inmediato y fundamentación legal detallada
- **Modo Examen** con cronómetro configurable (15/30/45/60 min) y minimapa interactivo
- **Modo Flashcards 🎴** para memorización rápida con atajos `Space` / `S` / `N`
- Marcas 🤔 / ⭐ persistentes también en las preguntas del test
- **Atajos de teclado**: `A`/`B`/`C`/`D` o `1`–`4`, `Enter`, `Esc`, `D`, `I`
- **Vista de revisión** con filtros (todas / falladas / acertadas / marcadas)
- 🎉 **Confeti** al superar el 90 % de aciertos

### 📊 Mi Progreso
- 🔥 **Racha de estudio** con calendario visual de actividad
- 🏆 **Sistema de logros** desbloqueables
- 📈 **Gráfico SVG** con la evolución de los últimos tests
- Histórico detallado de puntuaciones e intentos
- Estadísticas reales en vivo: **6 temas · 629 artículos · 422 preguntas**
- 📥 **Exportar/importar** datos en JSON (copia de seguridad)
- 🗑 Borrado selectivo o reinicio de estadísticas

### 🌙 Modo Oscuro
- Selector en la barra superior de cada página
- Paleta completa adaptada a tonos noche/burdeos suaves
- Persistente y respeta `prefers-color-scheme` por defecto
- `theme-color` dinámico para la barra del navegador móvil

### 📱 PWA (Offline)
- Manifest completo con accesos directos (*Shortcuts*)
- Service Worker con caché de todos los assets esenciales y JSON cifrados
- Funciona en metro / tren / modo avión sin conexión
- Detector de conexión integrado
- Open Graph y Twitter Cards configurados

---

## 🛠 Stack

- **HTML5** semántico
- **CSS3** con custom properties, Grid, Flexbox y `data-theme` switch
- **JavaScript Vanilla** (sin dependencias externas ni compilación)
- **Web Crypto API** (AES‑GCM 256 + PBKDF2 SHA‑256 100 k)
- **localStorage** para persistencia total en el cliente
- **Service Worker** para PWA y soporte offline
- **Google Fonts**: Playfair Display + Source Serif 4

---

## 🎨 Paleta de Color

| Token | Color | Muestra | Uso |
|---|---|:---:|---|
| `#fce4ec` | Rosa pastel | 🌸 | Fondos suaves y tarjetas |
| `#f06292` | Rosa medio | 🌷 | Acentos, tags y bordes |
| `#e05a80` | Rosa intenso | 🌹 | Hover y botones de acción |
| `#c0305a` | Burdeos | 🍷 | Títulos principales, marcas y enlaces |

---

## 🚀 Uso local

```bash
# Clona el repo
git clone https://github.com/AngelCasta1/Oposiciones-CAM.git
cd Oposiciones-CAM

# Inicia un servidor estático local
python3 -m http.server 8080
# o bien:  npx serve .

# Abre en el navegador
http://localhost:8080/?acceso=TU_CLAVE
```

> Para descifrar el contenido necesitas la clave de acceso. Si no la tienes, contacta con el autor.

---

## 📜 Licencia

Uso personal. El temario referencia normativa de dominio público (BOE, BOCM, DOUE); la transcripción, estructuración, maquetación, banco de preguntas y diseño de esta plataforma son de autoría propia.

---

## 👤 Autor

**Ángel Castaño** · [@AngelCasta1](https://github.com/AngelCasta1)

Hecho con 🌸 para preparar las oposiciones a la Comunidad de Madrid.
