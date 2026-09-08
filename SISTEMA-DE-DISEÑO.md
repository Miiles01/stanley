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

- **Todo el contenido visible está en inglés.** Copy, botones, labels, alt text.
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

### 12.3 `.reveal` — tarjetas y media

Fade in de entrada con leve subida, en cascada por grupo visible
(`ScrollTrigger.batch('.reveal', ...)`):

```js
gsap.from(".reveal", {
  opacity: 0, y: 24,
  stagger: 0.12, duration: 0.7,
  ease: "power2.out"
});
```

Se aplica a: `.feature-card`, `.menu-item`, `.testimonial-card`,
`.gallery-item` (las 6 fotos), `.location-map` y `.location-details`.

### 12.4 Reglas de animación

- Clases `.text`, `.line` y `.reveal` = **solo** marcan qué anima. No llevan estilos.
- Nuevas secciones: `.text` en títulos, `.line` en párrafos, `.reveal` en
  tarjetas/imágenes → quedan animadas automáticamente (el JS las recoge, incluso
  las `.menu-item` que genera `renderMenu()`).
- No animar: logos (navbar/footer), iconos, badges, precios, controles.
- `ease` estándar del proyecto: `power2.out`.
- El failsafe de 4s en `initAnimations()` cubre `.text`, `.line` y `.reveal`:
  si un tween se cuelga, revela lo que quedó con `opacity < 0.95`.

## 13. Scroll — GSAP ScrollSmoother

- **Smooth scroll de toda la página** con
  [`ScrollSmoother`](https://gsap.com/docs/v3/Plugins/ScrollSmoother/) (plugin
  GSAP, gratis desde 3.13). Da inercia/momentum al scroll y habilita
  `data-speed` / `data-lag` para parallax (`effects: true`).
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
- Init en `initAnimations()`:
  ```js
  ScrollSmoother.create({
    wrapper: '#smooth-wrapper', content: '#smooth-content',
    smooth: 1.3, effects: true, normalizeScroll: true
  });
  ```
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
  `--primary`), `color: #fff`, `position: relative; overflow: hidden`.
- Primer hijo: `<svg class="section-crayon">` absoluto que cubre la sección
  (`inset: 0`, `pointer-events: none`). Dibujo: **1 trazo largo, fino y continuo
  tipo firma/cursiva** (`stroke: #A83600`, `stroke-width: 3`, `opacity: 0.65`)
  con bucles y swashes que cruzan la sección, + 1 trazo corto secundario. NO son
  ondas paralelas gruesas — es una línea suelta con mucho espacio negativo
  (referencia: garabato cursivo del cliente).
- **Textura de crayón/pincel** en el filtro SVG (cada instancia con `id` único
  `crayon-a`/`crayon-b`): (1) `feTurbulence` fractalNoise `baseFrequency≈0.022` +
  `feDisplacementMap scale≈9` → borde tembloroso; (2) `feTurbulence`
  `baseFrequency≈0.7` + `feColorMatrix` (última fila `0 0 0 0.9 -0.3`, saca alfa
  con huecos) + `feComposite operator="in"` → **grano perforado en el trazo**
  (se siente crayola, no vector limpio); (3) `feMerge` con la línea completa
  debajo del grano para que no se rompa en puntos. `stroke-width: 7`,
  `stroke: #9E3200`, `opacity: 0.6`.
- El contenedor de contenido (`.menu-container` / `.section-container`) lleva
  `position: relative; z-index: 1` para quedar sobre el SVG.
- `.section--crayon h2` → blanco; `.section--crayon .section-lead` → blanco 92%.
  Las tarjetas interiores siguen blancas (`--bg-color`) → buen contraste.
- **Aplicado a:** sección **Menu** (`#menu`) y **Testimonials** (`#testimonials`).
  Resultado: hero(gris) → About(blanco) → **Menu(naranja)** → Gallery(blanco) →
  **Testimonials(naranja)** → Location(blanco) → footer(oscuro).
- `section.` en el selector es a propósito: gana a `.menu-section` /
  `.testimonials-section { background-color: --bg-secondary }` sin importar el orden.

## 14. Imágenes

- **Logos** (carpeta `images/`, servidos localmente):
  - `images/logo.png` — wordmark "Stanley" naranja sobre transparente. Va en el
    **navbar** dentro de `<a class="nav-brand">`. Alto: 52px desktop / 40px móvil.
  - `images/logo-footer.png` — lockup completo (mascota Copa Stanley + "Chez
    Stanley resto • bar"). Va en el **footer** (`.footer-logo`), sobre fondo
    oscuro. Alto: 84px.
  - Originales del cliente en `~/Downloads/stanley/` (`logotipo.png`,
    `logotipo footer.png`), redimensionados con `sips` al meterlos a `images/`.
- Galería: fotos de **Pexels** por hotlink
  (`images.pexels.com/photos/<id>/...?auto=compress&cs=tinysrgb&w=800`).
  **Solo comida**, nada de interiores/venue/gente (ids: 958545 feature, 2983101,
  1600711, 1279330, 1108117, 806361).
- `loading="lazy"` en todas las imágenes de galería.
- **Antes de desplegar a Hostinger:** descargar las fotos de Pexels a `images/`
  local y cambiar los `src`, para no depender de Pexels en producción. Los logos
  ya son locales.

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

## 19. Menú (3 platillos con foto), testimonios y video de hero

- **Menú** (`products[]` en `script.js`): 3 platillos reales con foto (el cliente
  subió PNGs a `~/Downloads/stanley/platillos/`, redimensionadas a `images/menu/`
  a 520px, ~280KB c/u):
  - `burger.png` — "The Overtime Burger"
  - `wings.png` — "Power-Play Wings"
  - `tartare.png` — "Centre-Ice Tartare"
  Cada item: `{ id, name, desc, price, img, icon }`. `renderMenu()` arma
  `.menu-item-photo` (`aspect-ratio 4/3`, `object-fit: contain`) + `.menu-item-body`.
  El `icon` (emoji) se conserva solo para la mini-vista del carrito.
- **Testimonios:** avatares reales (`images/avatars/rev-1..3.jpg`, 400×400, del
  folder `~/Downloads/Avatares `). `.testimonial-avatar` pasó de círculo con
  iniciales a `<img>` `object-fit: cover` 48px. Se **quitó `.reveal` de las
  tarjetas y `.line` del `<p>`** → los testimonios son siempre visibles (el
  cliente pidió "reseñas que sean visibles").
- ⚠️ **Bug corregido:** `.section--crayon { color: #fff }` se heredaba a las
  tarjetas blancas → `h3`/`price`/quotes invisibles. Fix:
  `.section--crayon .menu-item, .section--crayon .testimonial-card { color: var(--text-color) }`.
- **Video de fondo del hero:** `<video class="hero-video" autoplay muted loop
  playsinline poster="video/hero-burgers-poster.jpg">` + `.hero-overlay`
  (gradiente oscuro `rgba(18,11,6,.55→.72)` + tinte naranja 12%). Fuente: Pexels
  video 37296040 (burgers en plancha), descargado y comprimido con ffmpeg a
  `video/hero-burgers.mp4` (720p, sin audio, ~2.1MB). El hero ahora es
  `position: relative; color: #fff; background: var(--text-color)` (fallback);
  `h1` blanco (span naranja), `p` blanco 90%, botón secundario pill blanco.
