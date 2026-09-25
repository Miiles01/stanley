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
const menuGrid = document.getElementById('menu-grid');
const cartBtn = document.getElementById('cart-btn');
const authBtn = document.getElementById('auth-btn');
const cartModal = document.getElementById('cart-modal');
const authModal = document.getElementById('auth-modal');
const closeBtns = document.querySelectorAll('.close-btn');
const cartCount = document.getElementById('cart-count');
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

// Render Menu
function renderMenu() {
    menuGrid.innerHTML = products.map(p => `
        <div class="menu-item reveal">
            <div class="menu-item-photo">
                <img src="${p.img}" alt="${p.name}" loading="lazy" />
            </div>
            <div class="menu-item-body">
                <h3 class="text">${p.name}</h3>
                <p>${p.desc}</p>
                <div class="menu-item-footer">
                    <span class="price">${fmtPrice(p.price)}</span>
                    <button class="btn primary-btn add-to-cart" data-id="${p.id}">Ajouter</button>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            addToCart(id);
        });
    });
}

// Carrousels horizontaux : points de pagination + glisser à la souris (bureau).
// Le défilement reste celui du navigateur (scroll-snap) : swipe natif sur mobile.
function initCarousel(track) {
    if (!track || track.dataset.carousel) return;
    track.dataset.carousel = '1';
    const items = () => [...track.children];
    const label = track.getAttribute('aria-label') || 'Carrousel';

    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    dots.setAttribute('role', 'group');
    dots.setAttribute('aria-label', label + ' : aller à une image');
    track.after(dots);

    const buildDots = () => {
        dots.innerHTML = items().map((_, i) =>
            `<button type="button" class="carousel-dot" aria-label="Élément ${i + 1} sur ${items().length}"></button>`).join('');
        update();
    };
    const current = () => {
        const left = track.scrollLeft;
        let best = 0, dist = Infinity;
        items().forEach((el, i) => {
            const d = Math.abs(el.offsetLeft - track.offsetLeft - left);
            if (d < dist) { dist = d; best = i; }
        });
        // Au bout du rail, le dernier point s'allume même si l'élément ne peut pas s'aligner à gauche.
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) best = items().length - 1;
        return best;
    };
    let raf = 0;
    function update() {
        raf = 0;
        const i = current();
        [...dots.children].forEach((d, k) => d.setAttribute('aria-current', k === i ? 'true' : 'false'));
        // Pas de points si tout tient à l'écran.
        dots.hidden = track.scrollWidth <= track.clientWidth + 4;
    }
    track.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(update); });
    dots.addEventListener('click', (e) => {
        const b = e.target.closest('.carousel-dot');
        if (!b) return;
        const el = items()[[...dots.children].indexOf(b)];
        track.scrollTo({ left: el.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    });

    // Glisser à la souris (les écrans tactiles utilisent le swipe natif).
    let down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
        track.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', (e) => {
        if (!down) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 5) moved = true;
        track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
        if (!down) return;
        down = false;
        track.classList.remove('is-dragging');
        // Laisse le snap reprendre la main pour aligner la carte la plus proche.
        const el = items()[current()];
        track.scrollTo({ left: el.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    });
    // Un glisser ne doit pas déclencher le bouton « Ajouter » sous la souris.
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    track.addEventListener('dragstart', (e) => e.preventDefault());

    buildDots();
    new MutationObserver(buildDots).observe(track, { childList: true });
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
    // Simple visual feedback
    cartBtn.style.transform = 'scale(1.1)';
    setTimeout(() => cartBtn.style.transform = 'scale(1)', 200);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
    renderCartItems();
}

function updateCart() {
    localStorage.setItem('brasserie_cart', JSON.stringify(cart));
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = count;
    cartCount.classList.toggle('is-empty', count === 0);
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
        authFormContainer.classList.add('hidden');
        userDashboard.classList.remove('hidden');
        authTitle.innerText = 'Mon compte';
        document.getElementById('welcome-text').innerText = `Bienvenue, ${user.name} !`;
        document.getElementById('loyalty-points').innerText = user.points;
    } else {
        authBtn.innerText = 'Connexion';
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
cartBtn.addEventListener('click', () => {
    renderCartItems();
    cartModal.classList.remove('hidden');
});

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

// Hamburger menu (About / Gallery / Reserve) — drops open from under the navbar
const navToggle = document.getElementById('nav-toggle');
const navDrawer = document.getElementById('nav-drawer');
let drawerOpen = false;

function setNavDrawer(open) {
    if (open === drawerOpen) return;
    drawerOpen = open;
    navDrawer.classList.toggle('open', open);
    navToggle.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
}

navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setNavDrawer(!drawerOpen);
});

navDrawer.querySelectorAll('a, button').forEach(link => {
    link.addEventListener('click', () => setNavDrawer(false));
});

document.addEventListener('click', (e) => {
    if (drawerOpen && !navDrawer.contains(e.target) && !navToggle.contains(e.target)) {
        setNavDrawer(false);
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setNavDrawer(false);
});

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
    setNavDrawer(false);
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

document.getElementById('reserve-open').addEventListener('click', openReserveModal);

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

// ===== Smooth scroll for in-page anchors =====
// ScrollSmoother (set up in initAnimations) drives this when available; the rAF
// tween below is the fallback if the plugin didn't load.
let smoother = null;

function navOffset() {
    const nav = document.querySelector('.navbar');
    return (nav ? nav.offsetHeight : 0) + 8;
}

function fallbackScrollTo(target) {
    const startY = window.scrollY;
    const destY = target === 0
        ? 0
        : Math.max(0, target.getBoundingClientRect().top + startY - navOffset());
    const distance = destY - startY;
    const duration = Math.min(900, Math.max(350, Math.abs(distance) * 0.5));
    let startTime = null;
    const easeInOutQuad = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    function frame(now) {
        if (startTime === null) startTime = now;
        const progress = Math.min((now - startTime) / duration, 1);
        window.scrollTo(0, startY + distance * easeInOutQuad(progress));
        if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

function scrollToTarget(target) {
    if (smoother) {
        smoother.scrollTo(target, true, target === 0 ? 'top top' : 'top ' + navOffset() + 'px');
    } else {
        fallbackScrollTo(target);
    }
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const hash = link.getAttribute('href');
        setNavDrawer(false);
        if (hash === '#reserve' || link.hasAttribute('data-reserve')) {
            e.preventDefault();
            openReserveModal();
            return;
        }
        if (hash === '#' || hash === '') {
            e.preventDefault();
            scrollToTarget(0);
            history.replaceState(null, '', location.pathname + location.search);
            return;
        }
        const target = document.getElementById(hash.slice(1));
        if (!target) return;
        e.preventDefault();
        scrollToTarget(target);
        history.pushState(null, '', hash);
    });
});

// ===== Entrance animations (GSAP) =====
// Animatable elements start hidden via CSS (html.gsap .reveal/.line/.text { opacity:0 }),
// applied before first paint, so nothing flashes visible-then-hidden. GSAP animates
// them in on scroll with fromTo (explicit start + end, no snapshot guesswork).
// .text   -> headings (h1/h2/h3): word-by-word reveal
// .line   -> paragraphs / descriptions: rise + fade, staggered per on-screen group
// .reveal -> cards & media: fade + rise on scroll — DESKTOP/TABLET ONLY (>768px).
//            Skipped on phones on purpose (it stuttered there); mobile just renders them.
function initAnimations() {
    const root = document.documentElement;
    const isMobile = window.innerWidth <= 768;

    // GSAP unavailable -> drop the hide class so everything is simply visible
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        root.classList.remove('gsap');
        return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // Page-wide smooth scrolling (momentum), all breakpoints.
    if (typeof ScrollSmoother !== 'undefined') {
        gsap.registerPlugin(ScrollSmoother);
        smoother = ScrollSmoother.create({
            wrapper: '#smooth-wrapper',
            content: '#smooth-content',
            smooth: 1.3,
            effects: false,
            // Sur écran tactile, normalizeScroll bloquait tous les touchmove : les
            // carrousels horizontaux ne glissaient plus. On le garde au bureau seulement ;
            // smoothTouch garde un léger lissage sur mobile sans voler les gestes.
            normalizeScroll: !ScrollTrigger.isTouch,
            smoothTouch: 0.1
        });
    }

    if (typeof SplitText !== 'undefined') {
        gsap.registerPlugin(SplitText);
        gsap.utils.toArray('.text').forEach(el => {
            const split = SplitText.create(el, { type: 'words' });
            gsap.set(split.words, { opacity: 0, y: 15 });
            ScrollTrigger.create({
                trigger: el,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                    gsap.set(el, { opacity: 1 }); // clear the CSS hide on the heading itself
                    gsap.to(split.words, {
                        opacity: 1,
                        y: 0,
                        stagger: 0.06,
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                }
            });
        });
    }

    ScrollTrigger.batch('.line', {
        start: 'top 88%',
        once: true,
        onEnter: batch => gsap.fromTo(batch,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, stagger: 0.2, duration: 0.8, ease: 'power2.out', overwrite: true }
        )
    });

    // .reveal (cards & media) — desktop/tablet only, omitted on mobile.
    if (!isMobile) {
        ScrollTrigger.batch('.reveal', {
            start: 'top 90%',
            once: true,
            onEnter: batch => gsap.fromTo(batch,
                { opacity: 0, y: 24 },
                { opacity: 1, y: 0, stagger: 0.12, duration: 0.7, ease: 'power2.out', overwrite: true }
            )
        });
    }

    // Failsafe: reveal anything that is on screen but still hidden a few seconds
    // after load (e.g. a stalled tween in a throttled tab). Off-screen elements
    // are left alone so their scroll animation still plays.
    setTimeout(() => {
        document.querySelectorAll('.line, .text, .reveal').forEach(el => {
            const r = el.getBoundingClientRect();
            const onScreen = r.top < window.innerHeight && r.bottom > 0;
            if (onScreen && parseFloat(getComputedStyle(el).opacity) < 0.95) {
                gsap.set(el, { opacity: 1, y: 0 });
                el.querySelectorAll('*').forEach(child => gsap.set(child, { opacity: 1, y: 0 }));
            }
        });
    }, 4000);
}

// Init
renderMenu();
initCarousel(document.getElementById('menu-grid'));
initCarousel(document.querySelector('.reopening-gallery'));
updateCart();
updateAuthUI();
initAnimations();
