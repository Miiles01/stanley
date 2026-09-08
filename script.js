// State
let cart = JSON.parse(localStorage.getItem('brasserie_cart')) || [];
let user = JSON.parse(localStorage.getItem('brasserie_user')) || null;

// Menu — the three dishes you can take home
const products = [
    {
        id: 1,
        name: "The Overtime Burger",
        desc: "Double smash patty, aged cheddar, bacon jam, crisp lettuce, tomato and red onion. Hand-cut fries on the side.",
        price: 18.00,
        img: "images/menu/burger.png",
        icon: "🍔"
    },
    {
        id: 2,
        name: "Power-Play Wings",
        desc: "A dozen crispy wings tossed in sticky hot-honey BBQ, with house ranch to dip.",
        price: 15.50,
        img: "images/menu/wings.png",
        icon: "🍗"
    },
    {
        id: 3,
        name: "Centre-Ice Tartare",
        desc: "Diced salmon and tuna, cucumber, fresh mint, toasted almonds and a lime-herb yogurt.",
        price: 16.00,
        img: "images/menu/tartare.png",
        icon: "🐟"
    },
    {
        id: 4,
        name: "Faceoff Caesar",
        desc: "Crispy fried chicken over romaine, shaved parmesan, bacon bits, croutons and house Caesar.",
        price: 16.50,
        img: "images/menu/chicken-caesar.png",
        icon: "🥗"
    },
    {
        id: 5,
        name: "Slapshot Shrimp",
        desc: "Garlic-butter shrimp over herbed rice, finished with lemon and parsley.",
        price: 19.00,
        img: "images/menu/shrimp-rice.png",
        icon: "🍤"
    }
];

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
                    <span class="price">$${p.price.toFixed(2)}</span>
                    <button class="btn primary-btn add-to-cart" data-id="${p.id}">Add</button>
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
        cartItems.innerHTML = '<p style="text-align:center; color:var(--text-secondary)">Nothing on your plate yet.</p>';
        cartTotalPrice.innerText = '$0.00';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <span class="cart-item-icon">${item.icon}</span>
                <div>
                    <h4>${item.name}</h4>
                    <p>Qty: ${item.quantity}</p>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:16px;">
                <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotalPrice.innerText = `$${total.toFixed(2)}`;
}

function checkout() {
    if (cart.length === 0) return alert("Nothing on your plate yet.");
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

    alert(`Order ${order.id} placed! You earned ${points} loyalty points.`);
    updateAuthUI();
}

// Auth Logic
function updateAuthUI() {
    if (user) {
        const fresh = Store.getUserByEmail(user.email);
        if (fresh) user.points = fresh.points || 0;
        authBtn.innerText = 'Account';
        authFormContainer.classList.add('hidden');
        userDashboard.classList.remove('hidden');
        authTitle.innerText = 'Your Account';
        document.getElementById('welcome-text').innerText = `Welcome, ${user.name}!`;
        document.getElementById('loyalty-points').innerText = user.points;
    } else {
        authBtn.innerText = 'Sign In';
        authFormContainer.classList.remove('hidden');
        userDashboard.classList.add('hidden');
        authTitle.innerText = 'Sign In / Join';
    }
}

function login() {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    if (!name || !email) {
        alert("Please enter both name and email.");
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
const TEST_FIRST_NAMES = ["Alex", "Jordan", "Sam", "Taylor", "Casey", "Morgan", "Riley", "Jamie", "Avery", "Quinn", "Drew", "Reese"];
const TEST_LAST_NAMES = ["Carter", "Bennett", "Fisher", "Hayes", "Nguyen", "Patel", "Reyes", "Brooks", "Sullivan", "Foster", "Chen", "Murphy"];

function randomTestUser() {
    const first = TEST_FIRST_NAMES[Math.floor(Math.random() * TEST_FIRST_NAMES.length)];
    const last = TEST_LAST_NAMES[Math.floor(Math.random() * TEST_LAST_NAMES.length)];
    const num = Math.floor(100 + Math.random() * 900);
    return {
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${num}@example.com`
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
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
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
            ? 'Please fill in every field.'
            : 'That email doesn’t look right.';
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
    const dateStr = when.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeStr = resTime.options[resTime.selectedIndex].text;
    document.getElementById('res-summary').textContent =
        `Table for ${partySize} · ${dateStr} at ${timeStr}`;
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
// .reveal -> cards & media (menu items, feature/testimonial cards, gallery, map): fade + rise
function initAnimations() {
    const root = document.documentElement;

    // GSAP unavailable -> drop the hide class so everything is simply visible
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        root.classList.remove('gsap');
        return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // Page-wide smooth scrolling (momentum). Native scroll on touch devices.
    if (typeof ScrollSmoother !== 'undefined') {
        gsap.registerPlugin(ScrollSmoother);
        smoother = ScrollSmoother.create({
            wrapper: '#smooth-wrapper',
            content: '#smooth-content',
            smooth: 1.3,
            effects: true,
            normalizeScroll: true
        });
    }

    // ---- Footer reveal + parallax (desktop/tablet only) ----
    // The footer is position:fixed behind the content. #smooth-content gets a
    // bottom pad equal to the footer height, so the last stretch of scroll slides
    // the page up and uncovers the footer. Its inner content drifts up slowly
    // (parallax) as it's revealed. On mobile (≤768px) the footer is a normal
    // static block at the end of the page — CSS handles that; skip this.
    const footer = document.getElementById('site-footer');
    const smoothContent = document.getElementById('smooth-content');
    const footerInner = footer && footer.querySelector('.footer-inner');

    if (footer && smoothContent && footerInner && window.innerWidth > 768) {
        const syncFooterPad = () => {
            smoothContent.style.paddingBottom = footer.offsetHeight + 'px';
        };
        syncFooterPad();

        gsap.fromTo(footerInner,
            { y: 90 },
            {
                y: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: smoothContent,
                    start: 'bottom bottom',
                    end: () => '+=' + footer.offsetHeight,
                    scrub: true,
                    invalidateOnRefresh: true
                }
            });

        ScrollTrigger.addEventListener('refreshInit', syncFooterPad);
        window.addEventListener('resize', () => ScrollTrigger.refresh());
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

    ScrollTrigger.batch('.reveal', {
        start: 'top 90%',
        once: true,
        onEnter: batch => gsap.fromTo(batch,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, stagger: 0.12, duration: 0.7, ease: 'power2.out', overwrite: true }
        )
    });

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
updateCart();
updateAuthUI();
initAnimations();
