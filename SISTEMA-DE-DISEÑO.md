# Sistema de Diseño — Chez Stanley (demo)

**Chez Stanley** — resto-bar sportif, 1180 Rue King E, Sherbrooke, QC ·
(819) 562-3350 · IG `@chezstanleyrestobar`. Sitio de demostración
(storefront + panel de administración), sin backend.

> **Regla de oro:** todo cambio en este proyecto — lo haga una persona o una IA —
> **debe respetar las reglas de este archivo**. Si algo aquí te estorba, primero
> se discute y se actualiza este documento; no se rompe la regla en silencio.
> Este archivo vive en el repo para que cualquiera que lo abra sepa cómo se
> construye el sitio.

Última actualización: 2026-09-07

---

## 1. Stack y archivos

- **HTML + CSS + JS puro.** Sin frameworks, sin build, sin bundler.
- **GSAP** (vía CDN) es la **única** dependencia externa, y solo para animación:
  `gsap` + `ScrollTrigger` + `SplitText` (v3.13.0, jsDelivr).
- Se sirve en local con `python3 -m http.server` y se despliega por una rama
  `deploy` a Hostinger (el sitio = el contenido de esa rama, sin build).

| Archivo | Rol |
|---|---|
| `index.html` / `style.css` / `script.js` | **Storefront**: landing, menú, carrito, cuenta, lealtad |
| `store.js` | **Capa de datos compartida** (localStorage). La cargan storefront y admin |
| `admin.html` / `admin.css` / `admin.js` | **Panel de administración** (tablero de pedidos + miembros) |
| `SISTEMA-DE-DISEÑO.md` | Este documento |

- `store.js` es la fuente de verdad de usuarios y pedidos. No escribir
  `localStorage` directo desde `script.js`/`admin.js` para esos datos — usar `Store`.

## 2. Idioma

- **Todo el contenido visible está en francés (Québec).** Copy, botones, labels,
  alt text, mensajes de `alert()`, panel admin. `<html lang="fr">` en las dos páginas.
  (Cambió 7 sep 2026 — antes era inglés; el restaurante está en Sherbrooke, QC.)
- Convenciones québécoises: precios `18,00 $` (coma decimal, espacio antes del `$`);
  horas `18 h 30`; fechas con `toLocaleDateString('fr-CA', …)` / `toLocaleTimeString('fr-CA', …)`.
  Helper `fmtPrice(n)` en `script.js`, `money(n)` en `admin.js`.
- Nombres de prueba québécois en `TEST_FIRST_NAMES`/`TEST_LAST_NAMES` (script.js) y
  `SAMPLE_FIRST`/`SAMPLE_LAST` (admin.js). Los correos generados quitan acentos con
  un `slug`/`slugify` (NFD + strip diacríticos) y usan `@exemple.com`.
- La documentación interna (este archivo, comentarios de commits) va en español.

## 3. Color

| Token | Valor | Uso |
|---|---|---|
| `--primary` | `#FF6600` | Naranja de marca: botones, acentos, estrellas, avatares, hover |
| `--primary-hover` | `#E55C00` | Hover de botones primarios |
| `--bg-color` | `#FFFFFF` | Fondo base |
| `--bg-secondary` | `#F8F9FA` | Fondo alterno de secciones y tarjetas sobre blanco |
| `--text-color` | `#111111` | Texto principal / fondo del footer |
| `--text-secondary` | `#555555` | Texto de apoyo, descripciones |

- Solo naranja + blancos/grises. **No** meter colores nuevos sin actualizar esta tabla.
- El footer es la única zona oscura (`--text-color` de fondo, texto blanco).
- Las secciones alternan fondo: `#FFFFFF` → `#F8F9FA` → `#FFFFFF`…
- **Colores funcionales solo del admin** (en `admin.css`, no usar en el storefront):
  `--admin-go: #1E9E5A` (verde, estado "ready" / puntos canjeados) y
  `--admin-wait: #E0A500` (ámbar, "preparing"). Rojo `#C0392B` solo para
  acciones destructivas (cancelar, reset). Todo lo demás sigue siendo naranja/grises.

## 4. Tipografía — DOS fuentes

| Token | Fuente | Para |
|---|---|---|
| `--font-main` | **Poppins** 400/600/700, fallback `sans-serif` | Cuerpo, descripciones, párrafos, UI, botones, `h3`, y todo lo demás |
| `--font-display` | **Ultra** (peso único 400), fallback `'Georgia', serif` | `h1`, `h2`, y cualquier frase importante con la clase `.display` |

- **Ultra es una slab display muy pesada.** Solo para títulos grandes y frases
  destacadas — nunca para texto corrido ni para `h3` (ilegible en tamaños chicos).
- Regla CSS: `h1, h2, .display { font-family: var(--font-display); font-weight: 400; line-height: 1.15; letter-spacing: -0.005em; }`.
- Por su peso, los tamaños de título con Ultra son **menores** que los que había
  con Poppins: hero `h1` `clamp(2rem, 5vw, 3.6rem)`; `h2` de sección `2rem`
  (`1.6rem` en móvil). Si agregas un título nuevo, revisa que no desborde en 375px.
- El `<span>` naranja dentro del `<h1>` del hero ya solo cambia el color
  (hereda Ultra); antes era Georgia itálica.
- `h3` y cuerpo: `line-height` 1.2 / 1.6, Poppins.
- El admin sigue la misma regla (`body.admin h1, body.admin h2, .admin-brand`).

## 5. Espaciado y layout

- Padding de secciones (`section`): **`128px 5%` desktop**, **`96px 6%` tablet**
  (`≤1024px`), **`64px 5%` móvil** (`≤768px`). Ritmo vertical generoso.
- El `<footer>` no es `section` — tiene su propio padding.
- Grids con `repeat(auto-fit, minmax(...))` para que respondan solos.
- Ancho de contenido: full-bleed dentro del 5% (no hay contenedor `max-width`
  central). Mantener ese criterio en secciones nuevas.

## 6. Sin líneas separadoras

- **Prohibido** `<hr>`, `border-bottom`/`border-top` decorativos, y líneas
  divisorias entre secciones.
- La separación se logra con **espacio en blanco** y **cambio de fondo**.
- Si hace falta despegar un panel del fondo (ej. el dropdown del menú móvil),
  se usa una **sombra suave**, nunca un borde.

## 7. Botones

- Clase base `.btn`: pill (`border-radius: 50px`), `padding: 14px 28px`,
  `font-weight: 600`, sin borde.
- `.primary-btn`: fondo naranja, texto blanco.
- `.secondary-btn`: fondo `--bg-secondary`, texto oscuro.
- `.btn:active` baja a `scale(0.98)`. Hover solo cambia el fondo.
- Botones de navbar: `.nav-btn` (texto plano) y `.orange-btn` (pill naranja compacto).

## 8. Tarjetas

- `border-radius: 24px`, padding generoso (32–40px; 24–28px en móvil).
- Fondo: `--bg-secondary` si la sección es blanca; `--bg-color` si la sección
  es gris. (Siempre contraste tarjeta vs. sección.)
- Sin borde. Sombra solo si aporta (galería/hover).

## 9. Radios de esquina

- Tarjetas y paneles grandes: `24px`.
- Elementos medianos (imágenes de galería, mapa, inputs, loyalty card): `12–24px`.
- Chips / items de lista pequeños: `8–10px`.
- Botones y avatares: pill / círculo.

## 10. Breakpoints

- **768px** — corte principal móvil/desktop.
- **480px** — ajustes finos (galería a 1 columna, footer a 1 columna).
- Cada cambio se piensa para **móvil y desktop**; verificar los dos antes de dar
  algo por terminado.

## 11. Navbar y menú hamburguesa

- **Menú hamburguesa `☰` en TODOS los breakpoints** (desktop, tablet, móvil) —
  la misma lógica en todos. No hay versión "links inline".
- Siempre visibles en la barra: el **logo**, **Menu**, **Sign In**, el botón
  **plato** (§11.1) y el **☰** (`.nav-toggle`).
- Dentro del ☰ (`#nav-drawer`) **solo**: **About**, **Gallery**, **Reserve**
  (el link `Reserve` abre el modal de reservación, §11.2 — no scrollea).
- El menú del ☰ es una **sección full-width que baja pegada debajo del navbar**
  (`position: absolute; left:0; right:0; top:100%`). **Sin overlay oscuro**,
  sin panel flotante: solo el bloque con las opciones y una sombra inferior suave.
- **Animación de apertura (100% CSS, sin depender de GSAP):** el panel está
  siempre en el DOM (`visibility: hidden` + `opacity: 0` + `translateY(-14px)`);
  `.nav-drawer.open` lo baja y lo desvanece adentro (transición `cubic-bezier`),
  y cada link entra escalonado con `transition-delay` por `:nth-child`. `setNavDrawer()`
  en JS solo togglea la clase `.open`. (No usar GSAP aquí: en el preview con rAF
  congelado un tween a `clipPath` deja el panel invisible.)
- Se cierra al: elegir una opción, tocar fuera, o `Esc`.
- El icono anima a "X" cuando está abierto (`.nav-toggle.is-open`).

### 11.1 Botón "plato" (antes "Cart")

Esto es un **restaurante, no un ecommerce**: no hay carrito persistente. El
pedido se hace y se refleja, pero el botón es un **icono de plato** — un
**cloche / campana de servicio** (SVG de svgrepo #428098, `stroke: currentColor`,
`.plate-icon` ~30×26) con un **badge circular** (`.plate-count`, círculo naranja
arriba a la derecha) con el número de cosas "en el plato". `id="cart-btn"` /
`id="cart-count"` se mantienen (el JS no cambió). El badge se oculta con
`.is-empty` cuando el conteo es 0 (lo togglea `updateCart()`). El modal se
titula "Your plate", el botón es "Place order", el vacío dice "Nothing on your
plate yet." (Claves de localStorage siguen `brasserie_cart`, internas.)

### 11.2 Reservar una mesa (`#reserve-modal`, demo)

- Se abre desde: botón **"Reserve a table"** del hero (`#reserve-open`) y el link
  **Reserve** del ☰ (el anchor handler intercepta `#reserve` / `[data-reserve]`).
- Form: fecha (default mañana, `min` hoy) · hora (`<select>` 17:00–22:00) ·
  **party size** con stepper `− N +` (`.stepper`, 1–12) · nombre + email
  (pre-rellenados con `randomTestUser()`, mismo patrón que el login demo).
- Al confirmar: valida, `Store.addReservation({...})`, y cambia a la vista de
  éxito (`#reserve-success`) con "Table for N · <fecha en-US> at <hora>" +
  código `RES-XXXX`. Botón "Done" cierra.
- Nota visible: "Demo only — no table is actually held."
- El botón secundario del hero lleva `background: var(--bg-color)` (blanco) porque
  el hero ya es `--bg-secondary` y si no se pierde.
- **El navbar es `position: fixed`** (no `sticky`) porque vive FUERA de
  `#smooth-content` (ver §13 ScrollSmoother). Su alto está en `--nav-h`
  (92px desktop / 68px móvil) y `#smooth-content` lleva ese `padding-top` para
  compensar. Si cambias el alto del navbar (p.ej. el tamaño del logo), actualiza
  `--nav-h`.

## 12. Animaciones (GSAP)

El sitio **es motion-forward por decisión del cliente**: las animaciones de
entrada están **siempre activas** (no se apagan con `prefers-reduced-motion`).
Si esto cambia, actualizar aquí y en `script.js` (`initAnimations`).

Todo se dispara con **ScrollTrigger** cuando el elemento entra al viewport
(`once: true`), no todo de golpe al cargar.

**Anti-flash (importante):** los elementos animables parten ocultos ANTES del
primer paint. Un `<script>` inline en el `<head>` agrega `html.gsap`; CSS:
`html.gsap .reveal, html.gsap .line, html.gsap .text { opacity: 0 }`. GSAP los
anima con `fromTo` (estado inicial y final explícitos). Si GSAP **no** carga,
`initAnimations()` quita la clase `gsap` → todo se ve normal. Failsafe a 4s
revela lo que quede oculto y esté en pantalla (los de abajo del fold se dejan
para que su animación de scroll siga). Nunca dejar un `opacity: 0` suelto en CSS
fuera de la regla `html.gsap`.

### 12.1 `.text` — títulos (h1, h2, h3)

Reveal palabra por palabra con `SplitText`:

```js
gsap.registerPlugin(SplitText);
const split = SplitText.create(".text", { type: "words" });
gsap.from(split.words, {
  opacity: 0, y: 15,
  stagger: 0.06, duration: 0.5,
  ease: "power2.out"
});
```

Se aplica a: `h1` del hero, los `h2` de sección, y los `h3` de tarjetas
(features, menú, ubicación).

### 12.2 `.line` — párrafos / descripciones

Entrada de abajo hacia arriba con fade, en cascada por grupo visible:

```js
gsap.from(".line", {
  y: 30, opacity: 0,
  stagger: 0.2, duration: 0.8,
  ease: "power2.out"
});
```

Se aplica a: párrafo del hero, `.section-lead` de cada sección, y los `<p>` de
tarjetas (features, menú, testimonios, ubicación, footer).

### 12.3 `.reveal` — tarjetas y media: DESKTOP/TABLET solamente

- **Las tarjetas y media animan (fade + rise) solo en pantallas > 768px.** Se
  había quitado por completo el 7 sep 2026 (trababa el móvil); el 18 sep 2026
  se reactivó pero **a propósito nunca en móvil** — ahí las tarjetas siempre
  renderizan a opacidad 1 de una, sin animación ni riesgo de quedar pegadas.
- CSS: la regla que las esconde antes de que GSAP corra también está gateada
  por breakpoint —
  `@media (min-width:769px) { html.gsap .reveal { opacity: 0 } }` — así en
  móvil `.reveal` nunca se oculta, ni siquiera un instante.
- JS: en `initAnimations()`, `const isMobile = window.innerWidth <= 768;` y el
  `ScrollTrigger.batch('.reveal', …)` va dentro de `if (!isMobile) { … }`.
  Fuera de ese if, en móvil, no corre nada — coherente con el CSS de arriba.
  ```js
  if (!isMobile) {
    ScrollTrigger.batch('.reveal', {
      start: 'top 90%', once: true,
      onEnter: batch => gsap.fromTo(batch, {opacity:0,y:24},
        {opacity:1,y:0,stagger:0.12,duration:0.7,ease:'power2.out',overwrite:true})
    });
  }
  ```
- Aplicado a: `.feature-card`, `.about-video`, `.gallery-item`. (`.menu-item`,
  `.testimonial-card` NO llevan `.reveal` — ver §19.)

### 12.4 Reglas de animación

- Clases `.text` y `.line` = **solo** marcan qué anima. No llevan estilos.
  `.reveal` además solo anima ≥769px (ver 12.3).
- Nuevas secciones: `.text` en títulos, `.line` en párrafos, `.reveal` en
  tarjetas/media que SÍ deban animar en desktop.
- No animar nunca: logos (navbar/footer), iconos, badges, precios, controles.
- `ease` estándar del proyecto: `power2.out`.
- El failsafe de 4s en `initAnimations()` cubre `.text`, `.line` y `.reveal`:
  si un tween se cuelga, revela lo que quedó con `opacity < 0.95`.

## 13. Scroll — GSAP ScrollSmoother

- **Smooth scroll de toda la página** con
  [`ScrollSmoother`](https://gsap.com/docs/v3/Plugins/ScrollSmoother/) (plugin
  GSAP, gratis desde 3.13). Da inercia/momentum al scroll.
- **En TODOS los breakpoints, incluido móvil** (18 sep 2026 — el usuario pidió
  "mete smooth scroll"; había estado restringido a desktop/tablet desde el
  7 sep por jank en móvil, pero esa jank venía sobre todo de los filtros SVG
  `feTurbulence` en vivo — ya horneados a PNG — y del `.reveal` en todas las
  tarjetas — ya limitado a desktop). Si vuelve a sentirse trabado en un
  teléfono real, el fix es re-agregar el guard `window.innerWidth > 768` a la
  creación de `ScrollSmoother` en `initAnimations()`.
- `effects: false` — ya no hay elementos con `data-speed`/`data-lag`.
- **Estructura DOM obligatoria** (en `index.html`):
  ```
  <body>
    <nav class="navbar">…</nav>            ← FUERA (fixed, z-index 100)
    <div id="smooth-wrapper">
      <div id="smooth-content">
        …secciones…
        <footer id="site-footer">…</footer> ← DENTRO, normal, al final
      </div>
    </div>
    <div id="cart-modal">…</div>           ← FUERA (fixed)
    <div id="auth-modal">…</div>           ← FUERA (fixed)
    <div id="reserve-modal">…</div>        ← FUERA (fixed)
  </body>
  ```
  El contenido dentro de `#smooth-content` se transforma → **`position: sticky`
  NO funciona ahí dentro**. Por eso navbar y modales van fuera, con
  `position: fixed`. El footer sí va dentro (es un bloque normal en el flujo).
- Init en `initAnimations()` (sin guard de ancho — corre en todos los breakpoints):
  ```js
  ScrollSmoother.create({
    wrapper: '#smooth-wrapper', content: '#smooth-content',
    smooth: 1.3, effects: false,
    normalizeScroll: !ScrollTrigger.isTouch,  // ⚠️ NUNCA true en táctil
    smoothTouch: 0.1
  });
  ```
- ⚠️ **`normalizeScroll` solo en escritorio** (25 sep 2026). Con `normalizeScroll: true`
  en pantallas táctiles, GSAP cancela TODOS los `touchmove` (`preventDefault`) para
  manejar él el scroll vertical → los carruseles horizontales (`#menu-grid`,
  `.reopening-gallery`) dejaban de deslizarse en el celular. Verificado con
  `TouchEvent` sintéticos: antes 100 % de los `touchmove` cancelados, después 0 %.
  En móvil el lissage lo da `smoothTouch: 0.1` (no roba gestos). Cualquier
  elemento con scroll propio (horizontal o vertical) necesita esto.
- **Anchors internos** (`a[href^="#"]`): `smoother.scrollTo(target, true, 'top <navH>px')`.
  `href="#"` (logo) → scroll al top. Fallback `fallbackScrollTo` (rAF) si el
  plugin no cargó.
- `html { scroll-behavior: smooth }` + `scroll-padding-top: var(--nav-h)` quedan
  como respaldo para navegación con historial.
- ⚠️ **No se puede probar el scroll en el preview de Claude Code** (congela
  `requestAnimationFrame` → ScrollSmoother no corre). Verificar en navegador real.

### 13.1 Footer

- **Footer normal, sin efectos.** El `<footer id="site-footer">` va DENTRO de
  `#smooth-content`, al final, como un bloque `position: static` en el flujo.
  Scrollea con el resto de la página.
- **Nada de reveal ni parallax.** Se probó el efecto "telón" (footer fijo detrás
  del contenido) + parallax de `.footer-inner`, y el usuario pidió quitarlo
  (7 sep 2026). No hay `padding-bottom` en `#smooth-content`, ni `will-change`,
  ni ScrollTrigger para el footer.
- **El footer es oscuro** (`--text-color` #111, texto blanco). `padding: 96px 5%
  44px` desktop / `72px 5% 40px` móvil (`@media max-width:768px`).

### 13.2 Secciones "crayola" (fondo naranja fuerte con ondas dibujadas a mano)

- Inspiración: fondos tipo la referencia azul con trazos a crayón. En nuestro
  caso naranja más fuerte.
- Clase `section.section--crayon` → `background-color: #F15A0C` (más saturado que
  `--primary`), `color: #fff`, `position: relative; overflow: hidden`, +
  `background: no-repeat center / cover` para el trazo.
- **El trazo es una IMAGEN PNG pre-renderizada, NO un SVG en vivo** (7 sep 2026).
  El filtro `feTurbulence` + `feDisplacementMap` se recalculaba en cada scroll y
  trababa el móvil. Se horneó a PNG una sola vez y se sirve como `background-image`:
  - `#menu.section--crayon { background-image: url("images/crayon-menu.png") }`
  - `#testimonials.section--crayon { background-image: url("images/crayon-testimonials.png") }`
  - PNGs con alfa, 1440×640, ~30 KB c/u. Se generaron con Chrome headless
    (`--headless=new --screenshot --default-background-color=00000000`) desde un
    HTML con el SVG original. Para regenerarlos: los HTML fuente quedaron en el
    scratchpad de la sesión (`crayon-a.html` / `crayon-b.html`), con el filtro
    exacto (turbulence + displacement + grano vía `feColorMatrix` `0 0 0 0.9 -0.3`
    + `feComposite operator="in"`, `stroke #9E3200`, width 7, opacity 0.6).
- El dibujo: **1 trazo largo, fino y continuo tipo firma/cursiva** con bucles,
  mucho espacio negativo. NO ondas paralelas gruesas.
- Ya NO hay elemento `.section-crayon` en el DOM ni regla CSS para él.
- El contenedor de contenido (`.menu-container` / `.section-container`) sigue con
  `position: relative; z-index: 1`.
- `.section--crayon h2` → blanco; `.section--crayon .section-lead` → blanco 92%.
  Las tarjetas interiores siguen blancas (`--bg-color`) → buen contraste.
- **Aplicado a:** sección **Menu** (`#menu`) y **Testimonials** (`#testimonials`).
  Resultado: hero(foto) → **Reopening(oscuro)** → About(blanco) →
  **Menu(naranja)** → Gallery(blanco) → **Testimonials(naranja)** →
  Location(blanco) → footer(oscuro). (§19 tiene el detalle de Reopening.)
- `section.` en el selector es a propósito: gana a `.menu-section` /
  `.testimonials-section { background-color: --bg-secondary }` sin importar el orden.

### 13.3 Carrousels horizontaux (`initCarousel` en `script.js`)
- Aplica a `#menu-grid` y `.reopening-gallery`. El scroll sigue siendo **nativo**
  (`overflow-x:auto` + `scroll-snap`), con `touch-action: pan-x pan-y` y
  `overscroll-behavior-x: contain` → swipe nativo en móvil, sin robar el scroll vertical.
- **Puntos de paginación** (`.carousel-dots` / `.carousel-dot`, creados por JS justo
  después del carrusel): el activo es una píldora blanca de 22px, los demás puntos de
  8px al 45 %. Zona táctil de 28px. Tocar un punto lleva a esa tarjeta. Se ocultan
  solos si todo cabe en pantalla. Se reconstruyen si cambian las tarjetas
  (`MutationObserver`).
- **Escritorio:** se puede arrastrar con el mouse (`.is-dragging` apaga el snap mientras
  se arrastra y al soltar alinea la tarjeta más cercana). Un arrastre no dispara el
  botón « Ajouter » que quede debajo del cursor.
- Cada carrusel lleva `aria-label` en el HTML (se usa para el grupo de puntos).
- **Nunca tarjetas/imágenes cortadas en el borde** (25 sep 2026, el usuario: "no hagas que
  en el carrusel las imágenes se vean cortadas"). Sin "peek": los anchos se calculan para
  que quepan tarjetas enteras. `#menu-grid`: 1 por pantalla (<640px, `flex-basis:100%`),
  2 (`calc((100% - 24px)/2)`) desde 640px, 3 (`calc((100% - 48px)/3)`) desde 1024px.
  `.reopening-gallery`: 1 por pantalla en móvil, 2 lado a lado desde 768px (entonces caben
  las dos y los puntos se ocultan solos). `scroll-padding-left: 0` para que el snap alinee
  exacto. Los puntos son la pista de que hay más.

## 14. Imágenes

- **Logos** (carpeta `images/`, servidos localmente):
  - `images/logo.png` — wordmark "Stanley" naranja sobre transparente. Va en el
    **navbar** dentro de `<a class="nav-brand">`. Alto: 52px desktop / 40px móvil.
  - `images/logo-footer.png` — lockup completo (mascota Copa Stanley + "Chez
    Stanley resto • bar"). Va en el **footer** (`.footer-logo`), sobre fondo
    oscuro. Alto: 84px.
  - Originales del cliente en `~/Downloads/stanley/` (`logotipo.png`,
    `logotipo footer.png`), redimensionados con `sips` al meterlos a `images/`.
- Galería (`images/gallery/`, **fotos reales locales**, 7 sep→17 sep 2026): ya
  NO son hotlinks de Pexels. Vienen del Google Drive real del restaurante
  (shooting de menú de Simon Rancourt, feb 2024) — `combo.jpg` (burger+frites en
  canasta con branding), `pizza.jpg` (pain plat), `scallops.jpg` (pétoncles).
  Solo comida, nada de interiores/venue/gente.
- `loading="lazy"` en todas las imágenes de galería.
- Ya no hay dependencia de Pexels en ninguna sección — todo local.

## 15. Panel de administración (`admin.html`)

- **Acceso:** contraseña de demo `admin2026`, **pre-rellenada** en el input
  (igual que el autofill de usuario en el storefront). No es seguridad real —
  es una compuerta visual. La sesión se recuerda con `sessionStorage`.
- El input de contraseña tiene un **botón de ojo** (mostrar / ocultar) a la
  derecha: alterna `type` entre `password`/`text` y cambia el icono (eye /
  eye-off, SVG inline) y el `aria-label`/`aria-pressed`.
- Enlace de entrada: pie de página del storefront → "Staff login".
- Mismo lenguaje visual que el storefront (Poppins body / Ultra en `h1`/`h2`,
  naranja + grises, tarjetas redondeadas 16–18, sin líneas). `admin.html` carga
  `style.css` + `admin.css`.
- ⚠️ `admin.css` **resetea `body.admin section { padding: 0 }`** — el
  `section { padding: 128px }` del storefront no debe aplicar al admin (usa
  `<section>` para maquetar, no como bandas full-bleed).
- Detalles de pulido (v: admin.css=6, admin.js=5):
  - **KPIs:** grid `repeat(6,1fr)` desktop → `repeat(3,1fr)` ≤1024 →
    `repeat(2,1fr)` ≤680. Labels cortos ("In kitchen", "Members", "Open points",
    "Redeemed"). Alto uniforme.
  - **Tablero:** 4 columnas iguales (`align-items: start`) en desktop; en
    ≤1024px pasa a scroll horizontal con snap (patrón kanban). Tarjeta: `×` de
    cancelar aparece en hover (esquina), botón "Move to <estado>" full-width
    abajo, "Completed" en las entregadas (sin botón, atenuadas). Timestamps de
    los sample orders se backdatean (no todo "just now").
  - **Tabla de miembros:** avatar con iniciales (círculo naranja), zebra
    striping (no líneas), email en `word-break`, pills `— / ✓ N pts`, botón
    Redeem alineado a la derecha, sin recorte.
  - **Boot:** `showApp()` de auto-entrada corre al FINAL de `admin.js` (después
    de definir todos los helpers) — antes daba TDZ con `const money` al volver
    con sesión activa.
- **Estructura:**
  1. **KPIs** (6 tarjetas): Orders, Revenue, In kitchen, **Bookings**, Members,
     Open points.
  2. **Tablero de pedidos** (estilo Rappi/kanban): 4 columnas
     `New → Preparing → Ready → Delivered`. Cada pedido es una tarjeta;
     botón "Move to <estado>" y `×` de cancelar en hover. En móvil (≤1024px)
     el tablero hace scroll horizontal con snap.
  3. **Reservations** (`#res-table`): guest (avatar+nombre), when (fecha+hora),
     party, email, status (`Booked`/`Seated`/`Cancelled`), acciones **Seat** + `×`.
     Botón "+ Generate sample booking".
  4. **Tabla de miembros de lealtad:** nombre, email, puntos, si ya canjearon
     (`✓ N pts` / `—`), fecha de alta, botón **Redeem**
     (pone puntos a 0 y suma a `pointsRedeemed`).
- **Generar pedidos/reservas:** los checkouts y reservas reales del storefront
  crean registros (`Store.addOrder` / `Store.addReservation`). Los botones
  "+ Generate sample …" fabrican registros aleatorios para que las tablas no
  estén vacías en demos. "Reset demo data" borra todo (`Store.clearAll`).
- El dashboard escucha el evento `storage`: si el storefront (otra pestaña)
  registra un pedido, el admin se re-renderiza solo.

## 16. Modelo de datos (`store.js` · localStorage)

> Las claves siguen con prefijo `brasserie_` por compatibilidad — son internas,
> no visibles. No se renombran para no romper estado existente.

| Clave | Contenido |
|---|---|
| `brasserie_users` | `[{ name, email, points, pointsRedeemed, createdAt, lastRedeemedAt }]` |
| `brasserie_orders` | `[{ id, createdAt, name, email, items:[{name,qty,price,icon}], total, points, status, updatedAt }]` (más nuevo primero) |
| `brasserie_reservations` | `[{ id: RES-XXXX, createdAt, date, time, guests, name, email, status: booked\|seated\|cancelled }]` |
| `brasserie_user` | Sesión del storefront: `{ name, email, points }` |
| `brasserie_user_${email}` | Copia legada por-usuario (se mantiene en sync) |
| `brasserie_cart` | Carrito actual |

- Estados de pedido: `new` → `preparing` → `ready` → `delivered`; aparte `cancelled`.
- **Puntos:** `Math.floor(total)` por pedido. Al ganar puntos se actualizan
  las 3 fuentes a la vez (`brasserie_users`, `brasserie_user`,
  `brasserie_user_${email}`) — esto corrigió el bug de que los puntos se
  perdían al re-loguear.

## 17. Convenciones de código

- **Cache-busting:** `index.html`/`admin.html` referencian los assets como
  `archivo.ext?v=N`. **Subir `N` en cada cambio** de CSS/JS o el navegador
  sirve la versión vieja. (Storefront y admin pueden ir en números distintos.)
- Clases utilitarias existentes: `.hidden` (`display:none !important`),
  `.full-width`, `.mt-4`. Reusar antes de inventar.
- JS: `function` declarations, `const`/`let`, template literals. Sin `var`.
  Igualar el estilo del archivo.

## 18. Backups

- Carpeta hermana: `../restaurant_static_backups/`.
- Antes/después de cada cambio: `./backup.sh "descripcion-del-cambio"`
  (copia todos los archivos del proyecto, incluido este `.md`).
- El primer snapshot (`...-00-pristine-gemini`) es la versión original intacta.

## 19. Menú (5 platillos con foto real), testimonios y video de hero

- **Menú (`products[]` en `script.js`) — fotos REALES del restaurante (17 sep
  2026).** El cliente compartió su Google Drive con años de contenido; dentro
  de `nuevo menu 2024 fotos/` había un shooting profesional (Simon Rancourt,
  feb 2024) con las fotos reales de los platillos, fondo blanco. Se
  reemplazaron las 5 fotos anteriores (genéricas, generadas) por estas y se
  renombraron los platillos para que coincidan con lo fotografiado — `images/menu/`:
  - `burger-real.jpg` — "Le burger prolongation" (18,00 $)
  - `ribs.jpg` — "Côtes levées mise en échec" (21,00 $)
  - `poke-bowl.jpg` — "Le bol du gardien" (thon mi-cuit, 17,00 $)
  - `penne.jpg` — "Les penne du capitaine" (crevettes et poulet, 18,50 $)
  - `skewers.jpg` — "La brochette du défenseur" (19,00 $)
  JPG (no PNG) porque son fotos con degradés — comprime mejor. Cada item sigue
  siendo `{ id, name, desc, price, img, icon }`. `renderMenu()` arma
  `.menu-item-photo` (`aspect-ratio 4/3`, `object-fit: contain`) +
  `.menu-item-body`. El `icon` (emoji) se conserva solo para la mini-vista del
  carrito.
  - ⚠️ **Las 5 fotos se re-recortaron TODAS a 4:3 (18 sep 2026, `?v=2`/`?v=3`
    en `script.js`), con el mismo método, para que se vean del mismo "tamaño"
    en el carrusel.** Historia: primero solo la burger se recortó (para
    centrarla — venía con medio frame de espacio blanco a la derecha), pero
    quedó en **retrato** (700×914) mientras las otras 4 seguían siendo el
    frame completo sin recortar (900×600, paisaje 3:2). Con
    `object-fit:contain` en una caja `4:3`, una imagen en retrato se ajusta
    por ALTURA (llena la caja de arriba a abajo) mientras una en paisaje 3:2
    se ajusta por ANCHO (deja franjas arriba/abajo) → la burger se veía
    notablemente más grande/zoom que las demás aunque el recorte "técnicamente"
    ya centraba bien el sujeto. El usuario lo notó: *"¿por qué la imagen de la
    hamburguesa es más grande que la de los demás?"*.
  - **Fix real:** recortar las 5 fotos (desde los originales en
    `scratchpad/drive-raw/simon-0{3,6,9,18,27}.jpg`) al **mismo aspect ratio
    que la caja (4:3)**, centradas en la "masa principal" del plato — un
    script Python (Pillow, sin numpy) que: (1) samplea el color de fondo en
    las 4 esquinas, (2) para cada fila de píxeles mide el ancho del contenido
    que difiere de ese color, (3) descarta filas cuyo ancho de contenido es
    menor al 35% del máximo (así ignora el palillo delgado de la burger, que
    sobresale arriba de la masa principal, pero SÍ cuenta el plato/tazón
    entero como parte del sujeto), (4) arma un crop `4:3` centrado en el
    centro-x del sujeto y con la altura de la "masa principal" + 6% de
    padding, recortando ancho si se sale del borde de la imagen. Salida:
    900×675 (4:3 exacto) para las 5, mismo nivel de "llenado" del frame.
    **Lección:** si `object-fit:contain` se ve descentrado o de tamaño
    distinto entre imágenes de una misma grilla/carrusel, casi siempre es
    porque (a) el sujeto no está centrado DENTRO del archivo, y/o (b) las
    imágenes no comparten el mismo aspect ratio que la caja — hay que
    recortar la fuente para que ambas cosas coincidan, no pelear con CSS.
- **Cómo se obtuvieron:** conector de Google Drive (MCP) — el cliente compartió
  el link de carpeta, se buscó `parentId = '<folder>'` y se bajaron los JPG con
  `download_file_content` (límite: **10 MB por archivo** en este conector; los
  más pesados del shooting, >10MB, no se pudieron traer — para esos habría que
  pedir el original directo o exportarlo más liviano). Los que sí bajaron se
  revisaron en un contact-sheet (Pillow) antes de elegir cuáles usar.
- **`#menu-grid` es un carrusel de scroll horizontal** (18 sep 2026, el usuario
  pidió el mismo patrón que `.reopening-gallery` — ver §20): dejó de ser
  `display:grid`. Ahora `display:flex; overflow-x:auto; scroll-snap-type:x
  mandatory` + scrollbar oculto. `.menu-item { flex:0 0 78%; scroll-snap-align:
  start }` en móvil (peek de la siguiente tarjeta); `@media(min-width:640px)`
  pasa a `flex-basis:320px` (varias visibles a la vez, se sigue pudiendo
  scrollear para ver las 5). El scroll es nativo del navegador, eje X — no
  interfiere con ScrollSmoother (eje Y).
- **Testimonios:** avatares reales (`images/avatars/rev-1..3.jpg`, 400×400, del
  folder `~/Downloads/Avatares `). `.testimonial-avatar` pasó de círculo con
  iniciales a `<img>` `object-fit: cover` 48px. Se **quitó `.reveal` de las
  tarjetas y `.line` del `<p>`** → los testimonios son siempre visibles (el
  cliente pidió "reseñas que sean visibles").
- ⚠️ **Bug corregido:** `.section--crayon { color: #fff }` se heredaba a las
  tarjetas blancas → `h3`/`price`/quotes invisibles. Fix:
  `.section--crayon .menu-item, .section--crayon .testimonial-card { color: var(--text-color) }`.
- **Hero — foto estática, ya NO video (18 sep 2026).** El video se movió a
  `#about` (ver abajo). `.hero.hero--photo { background-image:
  url("video/hero-saint-tite-poster.jpg"); background-size:cover;
  background-position:center }` + `.hero-overlay` (gradiente oscuro
  `rgba(18,11,6,.55→.72)` + tinte naranja 12%) sigue igual. `h1` blanco (span
  naranja), `p` blanco 90%, botón secundario pill blanco.
- **Video REAL en `#about` — "Pourquoi nous choisir ?" (18 sep 2026).** Viene
  del Google Drive del cliente (`Publicaciones/2026-09-02-004735013.mp4`,
  47MB, vertical 1080×1920 — pesa más de los 10MB que el conector puede bajar,
  así que el cliente lo descargó él mismo desde Drive y lo dejó en
  `~/Downloads/`). Es contenido de un festival (Festival Western de
  Saint-Tite) con look vintage (grano/rayas superpuestas): abre con el banner
  de marca "Chez Stanley", luego parrilla en vivo, corte de carne y camarones
  salteados.
  - Recorte con `ffmpeg`: segundo **7.0 a 12.1** del original (el tramo con
    comida + banner de marca, antes de un corte a negro), **sin recortar el
    encuadre vertical** (`scale=720:-2`, mantiene el 9:16 original) — primero
    se probó un crop horizontal para el hero, pero el cliente pidió que el
    video se viera **vertical**, así que se re-renderizó desde el original sin
    `crop`. Sin audio, H.264, `video/about-saint-tite.mp4` (~1MB).
  - El poster (`video/hero-saint-tite-poster.jpg`, frame de los camarones,
    del recorte horizontal viejo) quedó reutilizado como fondo estático del
    hero — no se volvió a generar.
  - **Layout de `#about` (`.about-layout`):** columna de texto (`h2` +
    `.features-grid`, 1 sola columna cuando comparte fila con el video) +
    `.about-video` (`aspect-ratio: 9/16`, `border-radius:24px`,
    `object-fit:cover`). Mobile/tablet angosto: apilado, video arriba,
    `max-width:360px` centrado. **≥768px (tablet y desktop): fila, video a la
    IZQUIERDA** vía `order:1` en `.about-video` / `order:2` en
    `.features-grid` dentro de `.about-layout { flex-direction:row }` — el
    HTML no cambia de orden, solo el CSS. (Primero se puso a la derecha,
    el usuario pidió cambiarlo a la izquierda el mismo día.)
  - Se borraron `hero-burgers.mp4` / `hero-burgers-poster.jpg` (Pexels, ya no
    se usan) y el `hero-video` original (Pexels) tampoco existe más.
  - **Iconos en `.feature-card` — SVG profesional, NUNCA emoji** (18 sep
    2026). Primer intento fue con emoji (🍺🍗🏆); el usuario lo rechazó:
    *"No uses emojis, te pedí iconos, iconos profesionales."* — regla dura
    para todo el proyecto de aquí en adelante. `.feature-icon` (36×36px,
    `color: var(--primary)`) contiene un `<svg>` inline dibujado a mano,
    trazo fino (`stroke="currentColor" stroke-width="1.6"
    stroke-linecap="round" stroke-linejoin="round"`, `fill="none"`,
    `viewBox="0 0 24 24"`) — mismo lenguaje visual que `.plate-icon` del
    navbar. Los 3 iconos actuales: jarra de cerveza (microbrasserie), llama
    (ailes signature), trofeo (fidélité — referencia a la Copa Stanley).
    Los emoji de `products[]`/`SAMPLE_PRODUCTS` (🍔🍖🐟…) SÍ se quedan —
    esos son para la mini-vista del carrito/admin, no iconos de UI
    decorativos; la regla aplica a iconos, no a esos emoji funcionales.

## 20. Sección "Reopening" — anuncio de reapertura (18 sep 2026)

- **Contexto real del cliente:** el local viejo se demolió; están construyendo
  una bâtisse nueva (más grande, moderna) en Sherbrooke, todavía sin abrir.
  El usuario compartió 2 renders arquitectónicos (noche, cartel "OUVERTURE
  BIENTÔT" visible en uno) y pidió meterlos como **segunda sección**, justo
  después del hero y antes de "Pourquoi nous choisir?".
- `#reopening` (`.reopening-section`): fondo oscuro (`--text-color`, igual que
  el footer), texto centrado. `.reopening-badge` = pill naranja mayúsculas
  ("Ouverture bientôt"). `h2` blanco ("Chez Stanley fait peau neuve"), `p`
  blanco 85% explicando la demolición/reconstrucción.
- **`.reopening-gallery` es un carrusel de scroll horizontal** (el usuario lo
  pidió explícitamente — no grid estático): `display:flex; overflow-x:auto;
  scroll-snap-type:x mandatory;` + `scrollbar-width:none` /
  `::-webkit-scrollbar{display:none}` (scrollbar oculto). Cada
  `.reopening-item { scroll-snap-align:start }` — ver §13.3 para los anchos
  (sin peek: imágenes siempre enteras).
  `border-radius:24px`, `aspect-ratio:16/10`. Ambas llevan `.reveal` (anima
  solo desktop/tablet, ver §12.3). El scroll usa el nativo del navegador
  (`overflow-x:auto`), no ScrollSmoother — son ejes distintos (x vs y), no
  hay conflicto.
- Imágenes: `images/reopening/exterior-night.jpg` + `entrance-night.jpg`
  (convertidas de los PNG que compartió el cliente — `~/Downloads/resto1.png`
  / `resto2.png` — con `sips`, ~1600px de ancho, JPG calidad 85, ~230-310KB).
- No está en el drawer de navegación (☰) — es un anuncio, no un destino de
  scroll con ancla propia, igual que Location.
