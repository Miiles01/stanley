// State
let cart = JSON.parse(localStorage.getItem('brasserie_cart')) || [];
let user = JSON.parse(localStorage.getItem('brasserie_user')) || null;

// Menu — les vrais plats de la maison (photos du shooting menu 2024)
const products = [
    {
        id: 1,
        name: "Le burger prolongation",
        desc: "Double galette smash, cheddar vieilli, confit de bacon, laitue croquante, tomate et oignon rouge. Frites coupées à la main.",
        price: 18.00,
        img: "images/menu/burger-real.jpg?v=3",
        icon: "🍔"
    },
    {
        id: 2,
        name: "Côtes levées mise en échec",
        desc: "Demi-carré de côtes levées fumées, glacées BBQ maison, servies avec frites maison et salade de chou crémeuse.",
        price: 21.00,
        img: "images/menu/ribs.jpg?v=2",
        icon: "🍖"
    },
    {
        id: 3,
        name: "Le bol du gardien",
        desc: "Thon mi-cuit en croûte de sésame sur riz, edamames, carottes marinées et pickles maison.",
        price: 17.00,
        img: "images/menu/poke-bowl.jpg?v=2",
        icon: "🐟"
    },
    {
        id: 4,
        name: "Les penne du capitaine",
        desc: "Penne aux crevettes et au poulet, sauce rosée, poivrons grillés et parmesan, pain à l'ail sur le côté.",
        price: 18.50,
        img: "images/menu/penne.jpg?v=2",
        icon: "🍝"
    },
    {
        id: 5,
        name: "La brochette du défenseur",
        desc: "Brochette de poulet et légumes grillés, riz pilaf et salade César.",
        price: 19.00,
        img: "images/menu/skewers.jpg?v=2",
        icon: "🍢"
    }
];

// Prix en format québécois : « 18,00 $ »
function fmtPrice(n) {
    return `${Number(n).toFixed(2).replace('.', ',')} $`;
}


// DOM Elements
const track = document.getElementById('track');
const trackEnd = document.getElementById('track-end');
const authBtn = document.getElementById('auth-btn');
const drawerAuthBtn = document.querySelector('[data-open-auth]');
const cartModal = document.getElementById('cart-modal');
const authModal = document.getElementById('auth-modal');
const closeBtns = document.querySelectorAll('.close-btn');
const cartCounts = document.querySelectorAll('[data-cart-count]');
const cartItems = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');

const authFormContainer = document.getElementById('auth-form-container');
const userDashboard = document.getElementById('user-dashboard');
const authTitle = document.getElementById('auth-title');
const loginSubmitBtn = document.getElementById('login-submit-btn');
const logoutBtn = document.getElementById('logout-btn');
const nameInput = document.getElementById('auth-name');
const emailInput = document.getElementById('auth-email');

// Menu : une carte par plat dans le rail horizontal (entre « Comment ça marche » et la carte de fin)
function renderMenu() {
    const cards = products.map((p, i) => `
        <article class="card card--dish">
            <p class="card__index">${String(i + 2).padStart(2, '0')}</p>
            <div class="card__photo"><img src="${p.img}" alt="${p.name}" loading="lazy" draggable="false" /></div>
            <div class="card__top">
                <h3 class="card__title">${p.name}</h3>
                <p class="card__desc">${p.desc}</p>
            </div>
            <div class="card__bottom">
                <span class="card__price">${fmtPrice(p.price)}</span>
                <button type="button" class="ring add-to-cart" data-id="${p.id}" aria-label="Ajouter ${p.name} à mon assiette"><svg aria-hidden="true"><use href="#i-plus"/></svg></button>
            </div>
        </article>
    `).join('');
    trackEnd.insertAdjacentHTML('beforebegin', cards);

    track.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart');
        if (!btn) return;
        addToCart(parseInt(btn.dataset.id, 10));
        btn.classList.add('is-added');
        btn.innerHTML = '<svg aria-hidden="true"><use href="#i-check"/></svg>';
        setTimeout(() => {
            btn.classList.remove('is-added');
            btn.innerHTML = '<svg aria-hidden="true"><use href="#i-plus"/></svg>';
        }, 1200);
    });
}

// Petit message en bas de l'écran
const toast = document.getElementById('toast');
let toastTimer = 0;
function showToast(msg) {
    toast.innerHTML = `<svg aria-hidden="true"><use href="#i-check"/></svg><span></span>`;
    toast.querySelector('span').textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2200);
}


// Cart Logic
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCart();
    cartCounts.forEach(el => {
        el.classList.remove('is-bump');
        void el.offsetWidth; // relance l'animation
        el.classList.add('is-bump');
    });
    showToast(`${product.name} — ajouté à ton assiette`);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
    renderCartItems();
}

function updateCart() {
    localStorage.setItem('brasserie_cart', JSON.stringify(cart));
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCounts.forEach(el => {
        el.textContent = count;
        el.classList.toggle('is-empty', count === 0);
    });
}

function renderCartItems() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align:center; color:var(--text-secondary)">Rien dans ton assiette pour l\'instant.</p>';
        cartTotalPrice.innerText = '0,00 $';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <span class="cart-item-icon">${item.icon}</span>
                <div>
                    <h4>${item.name}</h4>
                    <p>Qté : ${item.quantity}</p>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:16px;">
                <strong>${fmtPrice(item.price * item.quantity)}</strong>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Retirer</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotalPrice.innerText = fmtPrice(total);
}

function checkout() {
    if (cart.length === 0) return alert("Rien dans ton assiette pour l'instant.");
    if (!user) {
        cartModal.classList.add('hidden');
        openAuthModal();
        return;
    }
    
    // Persist the order so the admin panel (admin.html) can see it
    const order = Store.buildOrder({ name: user.name, email: user.email, cart });
    Store.addOrder(order);

    // Award points in every store that holds this user (keeps them in sync)
    const points = order.points;
    const updated = Store.addPoints(user.email, points);
    user.points = updated ? updated.points : (user.points || 0) + points;
    localStorage.setItem('brasserie_user', JSON.stringify(user));
    localStorage.setItem(`brasserie_user_${user.email}`, JSON.stringify(user));

    cart = [];
    updateCart();
    cartModal.classList.add('hidden');

    alert(`Commande ${order.id} passée ! Tu as gagné ${points} points de fidélité.`);
    updateAuthUI();
}

// Auth Logic
function updateAuthUI() {
    if (user) {
        const fresh = Store.getUserByEmail(user.email);
        if (fresh) user.points = fresh.points || 0;
        authBtn.innerText = 'Mon compte';
        drawerAuthBtn.innerText = 'Mon compte';
        authFormContainer.classList.add('hidden');
        userDashboard.classList.remove('hidden');
        authTitle.innerText = 'Mon compte';
        document.getElementById('welcome-text').innerText = `Bienvenue, ${user.name} !`;
        document.getElementById('loyalty-points').innerText = user.points;
    } else {
        authBtn.innerText = 'Connexion';
        drawerAuthBtn.innerText = 'Connexion';
        authFormContainer.classList.remove('hidden');
        userDashboard.classList.add('hidden');
        authTitle.innerText = 'Connexion / Inscription';
    }
}

function login() {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    if (!name || !email) {
        alert("Veuillez entrer votre nom et votre courriel.");
        return;
    }
    // Store is the source of truth; create the account if it's new
    const record = Store.getUserByEmail(email) || Store.upsertUser({ name, email });
    // Keep the display name fresh if they typed a new one
    if (record.name !== name) Store.upsertUser({ email, name });

    user = { name, email, points: record.points || 0 };
    localStorage.setItem('brasserie_user', JSON.stringify(user));
    localStorage.setItem(`brasserie_user_${email}`, JSON.stringify(user));
    updateAuthUI();
}

function logout() {
    user = null;
    localStorage.removeItem('brasserie_user');
    updateAuthUI();
    authModal.classList.add('hidden');
}

// Event Listeners
document.querySelectorAll('[data-open-cart]').forEach(btn => btn.addEventListener('click', () => {
    closeMobileMenu();
    renderCartItems();
    cartModal.classList.remove('hidden');
}));

// Demo helper: prefill the join/login form with a random test user
const TEST_FIRST_NAMES = ["Gabriel", "Léa", "Félix", "Camille", "Antoine", "Rosalie", "Olivier", "Charlotte", "Émile", "Florence", "Simon", "Maude"];
const TEST_LAST_NAMES = ["Tremblay", "Gagné", "Roy", "Bouchard", "Côté", "Gauthier", "Lavoie", "Fortin", "Bergeron", "Nguyen", "Girard", "Pelletier"];

function randomTestUser() {
    const first = TEST_FIRST_NAMES[Math.floor(Math.random() * TEST_FIRST_NAMES.length)];
    const last = TEST_LAST_NAMES[Math.floor(Math.random() * TEST_LAST_NAMES.length)];
    const num = Math.floor(100 + Math.random() * 900);
    const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return {
        name: `${first} ${last}`,
        email: `${slug(first)}.${slug(last)}${num}@exemple.com`
    };
}

function fillRandomTestUser() {
    const u = randomTestUser();
    nameInput.value = u.name;
    emailInput.value = u.email;
}

function openAuthModal() {
    updateAuthUI();
    if (!user) fillRandomTestUser();
    authModal.classList.remove('hidden');
}


authBtn.addEventListener('click', openAuthModal);
drawerAuthBtn.addEventListener('click', () => { closeMobileMenu(); openAuthModal(); });


closeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.closest('.modal').classList.add('hidden');
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.add('hidden');
    }
});

checkoutBtn.addEventListener('click', checkout);
loginSubmitBtn.addEventListener('click', login);
logoutBtn.addEventListener('click', logout);

// Menu mobile (burger) : panneau de verre sous l'en-tête
const navToggle = document.getElementById('nav-toggle');
const navDrawer = document.getElementById('nav-drawer');

function closeMobileMenu() {
    if (navDrawer.hidden) return;
    navDrawer.hidden = true;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Ouvrir le menu');
}

navToggle.addEventListener('click', () => {
    const open = navDrawer.hidden;
    navDrawer.hidden = !open;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileMenu(); });
document.addEventListener('click', (e) => { if (!e.target.closest('#nav-drawer, #nav-toggle')) closeMobileMenu(); });


// ===== Reserve a table (demo) =====
const reserveModal = document.getElementById('reserve-modal');
const reserveForm = document.getElementById('reserve-form');
const reserveSuccess = document.getElementById('reserve-success');
const resDate = document.getElementById('res-date');
const resTime = document.getElementById('res-time');
const resGuestsEl = document.getElementById('res-guests');
const resName = document.getElementById('res-name');
const resEmail = document.getElementById('res-email');
const resError = document.getElementById('res-error');

let partySize = 2;

function setParty(n) {
    partySize = Math.max(1, Math.min(12, n));
    resGuestsEl.textContent = partySize;
}

document.getElementById('res-minus').addEventListener('click', () => setParty(partySize - 1));
document.getElementById('res-plus').addEventListener('click', () => setParty(partySize + 1));

function openReserveModal() {
    closeMobileMenu();
    reserveForm.classList.remove('hidden');
    reserveSuccess.classList.add('hidden');
    resError.classList.add('hidden');
    setParty(2);

    const now = new Date();
    resDate.min = now.toISOString().slice(0, 10);
    resDate.value = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
    resTime.value = '18:30';

    const u = randomTestUser();
    resName.value = u.name;
    resEmail.value = u.email;

    reserveModal.classList.remove('hidden');
}


reserveForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = resName.value.trim();
    const email = resEmail.value.trim();
    const validEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

    if (!resDate.value || !resTime.value || !name || !validEmail) {
        resError.textContent = (!email || validEmail)
            ? 'Veuillez remplir tous les champs.'
            : 'Ce courriel semble invalide.';
        resError.classList.remove('hidden');
        return;
    }
    resError.classList.add('hidden');

    const res = {
        id: Store.newReservationId(),
        createdAt: Date.now(),
        date: resDate.value,
        time: resTime.value,
        guests: partySize,
        name,
        email,
        status: 'booked'
    };
    Store.addReservation(res);

    const when = new Date(res.date + 'T' + res.time);
    const dateStr = when.toLocaleDateString('fr-CA', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeStr = resTime.options[resTime.selectedIndex].text;
    document.getElementById('res-summary').textContent =
        `Table pour ${partySize} · ${dateStr} à ${timeStr}`;
    document.getElementById('res-code').textContent = res.id;

    reserveForm.classList.add('hidden');
    reserveSuccess.classList.remove('hidden');
});

document.getElementById('res-done').addEventListener('click', () => {
    reserveModal.classList.add('hidden');
});
// =====================================================================
// Landing — mise en scène reprise de Flamme Up (GSAP + ScrollTrigger + ScrollSmoother)
// Preloader → hero mot à mot → photo qui s'agrandit → menu en rail épinglé →
// « La maison » glisse par-dessus avec compteurs → rail glissable épinglé →
// « Nous trouver » glisse par-dessus.
// =====================================================================
const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
let smoother = null;

document.getElementById('year').textContent = new Date().getFullYear();

// ----- Ancres internes et boutons « Réserver » -----
function scrollToTarget(target) {
    const go = () => {
        if (smoother) smoother.scrollTo(target, true, 'top top');
        else target.scrollIntoView({ behavior: 'smooth' });
    };
    go();
}

document.addEventListener('click', (e) => {
    const reserve = e.target.closest('[data-reserve], #reserve-open');
    if (reserve) {
        e.preventDefault();
        closeMobileMenu();
        openReserveModal();
        return;
    }
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    closeMobileMenu();
    scrollToTarget(target);
    history.replaceState(null, '', a.getAttribute('href'));
});

// Une modale ouverte met le scroll lissé en pause (sinon la page défile derrière).
const modals = $$('.modal');
const modalWatch = new MutationObserver(() => {
    const open = modals.some(m => !m.classList.contains('hidden'));
    if (smoother) smoother.paused(open);
});
modals.forEach(m => modalWatch.observe(m, { attributes: true, attributeFilter: ['class'] }));

// ----- Heures : la ligne du jour en gras -----
(function markToday() {
    const today = new Date().getDay();
    $$('#hours li').forEach(li => {
        li.classList.toggle('is-today', li.dataset.days.split(',').map(Number).includes(today));
    });
})();

// ----- Texte mot à mot -----
function splitWords(el) {
    if (el.dataset.split) return $$('.wi', el);
    el.dataset.split = '1';
    const walk = (node) => {
        [...node.childNodes].forEach((child) => {
            if (child.nodeType === 3) {
                const frag = document.createDocumentFragment();
                child.textContent.split(/(\s+)/).forEach((part) => {
                    if (!part) return;
                    if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
                    const w = document.createElement('span'); w.className = 'w';
                    const i = document.createElement('span'); i.className = 'wi'; i.textContent = part;
                    w.appendChild(i); frag.appendChild(w);
                });
                child.replaceWith(frag);
            } else if (child.nodeType === 1) walk(child);
        });
    };
    walk(el);
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    return $$('.wi', el);
}

const WORD_FROM = { yPercent: 110, opacity: 0, filter: 'blur(10px)' };
const WORD_TO = { yPercent: 0, opacity: 1, filter: 'blur(0px)', ease: 'power3.out' };

function wordTween(el, delay = 0) {
    const words = splitWords(el);
    const heading = /^H[1-3]$/.test(el.tagName);
    gsap.set(words, WORD_FROM);
    return gsap.to(words, { ...WORD_TO, duration: heading ? 1 : 0.8, stagger: heading ? 0.055 : 0.02, delay, paused: true });
}

function setupReveals() {
    // Titres et paragraphes (hors hero, qui attend le rideau).
    // Les textes dans une section épinglée déclarent leur conteneur, sinon le départ est mal mesuré.
    $$('[data-words]').filter(el => !el.closest('[data-hero]')).forEach(el => {
        const tw = wordTween(el);
        const pinned = el.closest('#track-stage, #pourquoi');
        ScrollTrigger.create({
            trigger: el, start: 'top 88%', pinnedContainer: pinned || undefined,
            onEnter: () => tw.play(), onLeaveBack: () => tw.reverse()
        });
    });
    $$('[data-reveal]').forEach(el => {
        gsap.set(el, { opacity: 0, y: 20, filter: 'blur(10px)' });
        ScrollTrigger.create({
            trigger: el, start: 'top 90%',
            onEnter: () => gsap.to(el, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }),
            onLeaveBack: () => gsap.to(el, { opacity: 0, y: 20, filter: 'blur(10px)', duration: 0.4 })
        });
    });
}

function prepareHero() {
    $$('[data-hero] [data-words]').forEach(el => gsap.set(splitWords(el), WORD_FROM));
    gsap.set('[data-hero-el]', { opacity: 0, y: 20, filter: 'blur(10px)' });
}

function heroEntrance() {
    $$('[data-hero] [data-words]').forEach((el, i) => wordTween(el, i * 0.12).play());
    $$('[data-hero-el]').forEach(el => {
        gsap.to(el, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', delay: Number(el.dataset.heroEl) / 1000 + 0.15 });
    });
}

// ----- Menu : rail horizontal épinglé -----
function setupTrack() {
    const runway = $('#track-runway');
    const stage = $('#track-stage');
    const OVERLAY = 1, DWELL = 1; // écrans : « La maison » glisse par-dessus pendant le dernier

    ScrollTrigger.create({ trigger: runway, start: 'top top', end: 'bottom bottom', pin: stage, pinSpacing: false });

    gsap.to(track, {
        x: () => -Math.max(track.scrollWidth - (stage.clientWidth - track.offsetLeft), 0),
        ease: 'none',
        scrollTrigger: {
            trigger: runway,
            start: 'top top',
            end: () => `+=${runway.offsetHeight - window.innerHeight * (1 + OVERLAY + DWELL)}`,
            scrub: 0.8,
            invalidateOnRefresh: true
        }
    });
}

// ----- Photo de la cantine qui s'agrandit -----
function setupReel() {
    const frame = $('#reel-frame');
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const from = mobile ? 'inset(24% 8% 24% 8% round 24px)' : 'inset(22% 28% 22% 28% round 24px)';
    const tl = gsap.timeline({
        scrollTrigger: { trigger: '#reel-stage', start: 'top top', end: '+=140%', pin: true, scrub: 0.6, anticipatePin: 1 }
    });
    tl.fromTo(frame, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', duration: 1 })
        .fromTo('#reel-media', { scale: 1.18 }, { scale: 1, ease: 'none', duration: 1 }, 0)
        .fromTo('#reel-caption', { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.3 }, 0.75)
        .to({}, { duration: 0.25 }); // petite pause en plein écran avant de reprendre le scroll
}

// ----- Bannière en parallaxe -----
function setupBanner() {
    gsap.fromTo('#about-banner-inner', { yPercent: -8 }, {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: '#about-banner', start: 'top bottom', end: 'bottom top', scrub: true }
    });
}

// ----- Compteurs -----
function setupCounters() {
    $$('[data-count]').forEach(el => {
        const m = /^(\D*)(\d+)(.*)$/.exec(el.dataset.count);
        if (!m) return;
        const [, pre, num, suf] = m;
        const obj = { v: 0 };
        el.setAttribute('aria-label', el.dataset.count);
        const render = () => { el.textContent = `${pre}${Math.round(obj.v)}${suf}`; };
        render();
        ScrollTrigger.create({
            trigger: el, start: 'top 90%',
            onEnter: () => gsap.to(obj, { v: Number(num), duration: 1.8, ease: 'power2.out', onUpdate: render }),
            onLeaveBack: () => gsap.to(obj, { v: 0, duration: 0.6, onUpdate: render })
        });
    });
}

// ----- « Pourquoi nous » : rail glissable (souris) + swipe natif (tactile) -----
function setupRail() {
    const rail = $('#rail');
    const fill = $('#rail-fill');
    const MIN = 0.3;
    let dragging = false, moved = false, startX = 0, startScroll = 0, target = null, vel = 0, lastX = 0, raf = 0;

    const sync = () => {
        const max = rail.scrollWidth - rail.clientWidth;
        if (max > 0) fill.style.transform = `scaleX(${MIN + (1 - MIN) * (rail.scrollLeft / max)})`;
    };
    const clamp = (v) => Math.min(Math.max(v, 0), rail.scrollWidth - rail.clientWidth);
    const loop = () => {
        raf = 0;
        if (target === null) return;
        const d = target - rail.scrollLeft;
        if (!dragging && Math.abs(d) < 0.5) { target = null; return; }
        rail.scrollLeft += d * 0.18;
        raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

    rail.addEventListener('scroll', sync, { passive: true });
    rail.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        e.preventDefault();
        dragging = true; moved = false;
        startX = lastX = e.clientX; startScroll = rail.scrollLeft; target = rail.scrollLeft; vel = 0;
        rail.setPointerCapture(e.pointerId); rail.classList.add('is-dragging');
        kick();
    });
    rail.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 4) moved = true;
        vel = lastX - e.clientX; lastX = e.clientX;
        target = clamp(startScroll - dx);
    });
    const end = (e) => {
        if (!dragging) return;
        dragging = false; rail.classList.remove('is-dragging');
        if (rail.hasPointerCapture(e.pointerId)) rail.releasePointerCapture(e.pointerId);
        target = clamp((target ?? rail.scrollLeft) + vel * 14);
        kick();
    };
    rail.addEventListener('pointerup', end);
    rail.addEventListener('pointercancel', end);
    // Un glisser ne doit pas déclencher le lien sous la souris.
    rail.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    sync();

    if (hasGsap) {
        // Section épinglée : « Nous trouver » glisse par-dessus.
        ScrollTrigger.create({ trigger: '#pourquoi', start: 'top top', end: '+=100%', pin: true, pinSpacing: false });
    }
}

// ----- CTA de l'en-tête : se cache quand « Nous trouver » est à l'écran -----
function setupHeaderCta() {
    const cta = $('.header-cta');
    new IntersectionObserver(([e]) => cta.classList.toggle('is-hidden', e.isIntersecting), { threshold: 0.35 }).observe($('#nous-trouver'));
}

// ----- Preloader -----
function boot() {
    const pre = $('#preloader');
    const ring = $('#preloader-progress');
    const fillMark = $('#preloader-fill');
    const pct = $('#preloader-pct');
    const CIRC = 2 * Math.PI * 180;
    const prog = { v: 0 };
    const paint = () => {
        ring.style.strokeDashoffset = CIRC * (1 - prog.v);
        fillMark.style.clipPath = `inset(${(1 - prog.v) * 100}% 0 0 0)`;
        pct.textContent = `${Math.round(prog.v * 100)}%`;
    };

    if (!hasGsap) { pre.remove(); return; }

    // Toujours repartir du haut au rechargement (le rideau révèle le hero).
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add('is-locked');
    prepareHero();
    const creep = gsap.to(prog, { v: 0.85, duration: 2.6, ease: 'power1.out', onUpdate: paint });

    let firstFrame;
    const flameReady = new Promise(r => { firstFrame = r; });
    $$('canvas[data-flame]').forEach(c => {
        const isHero = c.dataset.flame === 'hero';
        // Canvas masqué (mobile) : pas de contexte WebGL, rien à rendre.
        if (!c.offsetParent) { if (isHero) firstFrame(); return; }
        const scene = window.FlameScene && window.FlameScene.createFlame(c, {
            scale: isHero ? 0.82 : 0.75,
            onFirstFrame: isHero ? firstFrame : null
        });
        if (isHero && !scene) firstFrame();
    });

    const timeout = new Promise(r => setTimeout(r, 3500));
    const loaded = Promise.all([flameReady, document.fonts ? document.fonts.ready : null]);

    Promise.race([loaded, timeout]).then(() => {
        if (typeof ScrollSmoother !== 'undefined') {
            gsap.registerPlugin(ScrollSmoother);
            smoother = ScrollSmoother.create({
                wrapper: '#smooth-wrapper',
                content: '#smooth-content',
                smooth: 1.3,
                effects: false,
                // Sur écran tactile, normalizeScroll bloquait tous les touchmove : le rail
                // horizontal ne glissait plus. On le garde au bureau seulement.
                normalizeScroll: !ScrollTrigger.isTouch,
                smoothTouch: 0.1
            });
            smoother.paused(true);
        }
        setupReel();
        setupTrack();
        setupBanner();
        setupCounters();
        setupReveals();
        setupRail();
        setupHeaderCta();
        ScrollTrigger.refresh();

        // Lien profond (#menu, etc.) une fois tout mesuré.
        const deep = location.hash && document.getElementById(location.hash.slice(1));

        creep.kill();
        gsap.to(prog, {
            v: 1, duration: 0.5, ease: 'power2.out', onUpdate: paint,
            onComplete: () => {
                let released = false;
                gsap.to(pre, {
                    clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'power3.inOut', delay: 0.25,
                    onUpdate() {
                        if (released || this.progress() <= 0.45) return;
                        released = true;
                        document.body.classList.remove('is-locked');
                        if (smoother) smoother.paused(false);
                        // Le navigateur peut restaurer l'ancienne position : on repart du hero.
                        if (!deep) { if (smoother) smoother.scrollTop(0); else window.scrollTo(0, 0); }
                        heroEntrance();
                        if (deep) setTimeout(() => scrollToTarget(deep), 50);
                    },
                    onComplete: () => pre.remove()
                });
            }
        });
    });
}

// Init
renderMenu();
updateCart();
updateAuthUI();
boot();
