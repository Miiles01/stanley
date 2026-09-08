/* ============================================================================
   admin.js — Chez Stanley staff dashboard
   Client-side only. Reads/writes the same localStorage as the storefront
   through Store (store.js). No real auth — the password is a demo gate.
   ========================================================================== */

const ADMIN_PASSWORD = 'admin2026';
const SESSION_FLAG = 'chezstanley_admin_ok';

// Menu used only to fabricate sample orders from the dashboard
const SAMPLE_PRODUCTS = [
    { name: 'Classic Burger', price: 15.99, icon: '🍔' },
    { name: 'Spicy Wings', price: 12.99, icon: '🍗' },
    { name: 'Poutine', price: 9.99, icon: '🍟' },
    { name: 'Craft Beer', price: 6.99, icon: '🍺' },
    { name: 'Onion Rings', price: 7.99, icon: '🧅' },
    { name: 'Caesar Salad', price: 10.99, icon: '🥗' }
];
const SAMPLE_FIRST = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Jamie', 'Avery', 'Quinn'];
const SAMPLE_LAST = ['Carter', 'Bennett', 'Fisher', 'Hayes', 'Nguyen', 'Patel', 'Reyes', 'Brooks', 'Sullivan', 'Foster'];

/* ---------- Elements ---------- */
const gate = document.getElementById('admin-gate');
const app = document.getElementById('admin-app');
const passInput = document.getElementById('admin-pass');
const enterBtn = document.getElementById('admin-enter');
const errorMsg = document.getElementById('admin-error');

/* ---------- Auth gate ---------- */
function showApp() {
    gate.classList.add('hidden');
    app.classList.remove('hidden');
    render();
}

function tryEnter() {
    if (passInput.value === ADMIN_PASSWORD) {
        sessionStorage.setItem(SESSION_FLAG, '1');
        errorMsg.classList.add('hidden');
        showApp();
    } else {
        errorMsg.classList.remove('hidden');
        passInput.focus();
        passInput.select();
    }
}

enterBtn.addEventListener('click', tryEnter);
passInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryEnter(); });

// Show / hide password
const passToggle = document.getElementById('admin-pass-toggle');
passToggle.addEventListener('click', () => {
    const show = passInput.type === 'password';
    passInput.type = show ? 'text' : 'password';
    passToggle.setAttribute('aria-pressed', show ? 'true' : 'false');
    passToggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    passToggle.querySelector('.icon-eye').classList.toggle('hidden', show);
    passToggle.querySelector('.icon-eye-off').classList.toggle('hidden', !show);
    passInput.focus();
});

document.getElementById('admin-logout').addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_FLAG);
    location.reload();
});

/* ---------- Formatting helpers ---------- */
const money = n => '$' + Number(n || 0).toFixed(2);

function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' h ago';
    return Math.floor(s / 86400) + ' d ago';
}

function itemsSummary(items) {
    return items.map(i => `${i.icon} ${i.name}${i.qty > 1 ? ' ×' + i.qty : ''}`).join('  ·  ');
}

function initials(name) {
    return (name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

/* ---------- KPIs ---------- */
function renderKpis(orders, users, reservations) {
    const live = orders.filter(o => o.status !== 'cancelled');
    const revenue = live.reduce((s, o) => s + o.total, 0);
    const inKitchen = orders.filter(o => o.status === 'new' || o.status === 'preparing').length;
    const outstanding = users.reduce((s, u) => s + (u.points || 0), 0);
    const upcomingBookings = (reservations || []).filter(r => (r.status || 'booked') === 'booked').length;

    const cards = [
        { value: live.length, label: 'Orders' },
        { value: money(revenue), label: 'Revenue' },
        { value: inKitchen, label: 'In kitchen' },
        { value: upcomingBookings, label: 'Bookings' },
        { value: users.length, label: 'Members' },
        { value: outstanding, label: 'Open points' }
    ];

    document.getElementById('kpi-row').innerHTML = cards.map(c => `
        <div class="kpi">
            <div class="kpi-value">${c.value}</div>
            <div class="kpi-label">${c.label}</div>
        </div>
    `).join('');
}

/* ---------- Orders board ---------- */
function renderBoard(orders) {
    const board = document.getElementById('orders-board');
    const empty = document.getElementById('board-empty');
    const active = orders.filter(o => o.status !== 'cancelled');

    empty.classList.toggle('hidden', active.length > 0);

    board.innerHTML = Store.STATUSES.map(status => {
        const inCol = active.filter(o => o.status === status);
        const next = Store.STATUSES[Store.STATUSES.indexOf(status) + 1];
        const itemCount = o => o.items.reduce((s, i) => s + i.qty, 0);
        const cards = inCol.map(o => `
            <div class="order-card ${status === 'delivered' ? 'is-delivered' : ''}">
                ${status !== 'delivered'
                    ? `<button class="order-cancel" data-cancel="${o.id}" title="Cancel order" aria-label="Cancel order">&times;</button>`
                    : ''}
                <div class="order-card-top">
                    <span class="order-id">${o.id}</span>
                    <span class="order-time">${timeAgo(o.createdAt)}</span>
                </div>
                <div class="order-customer">${o.name}</div>
                <div class="order-items">${itemsSummary(o.items)}</div>
                <div class="order-meta">
                    <span class="order-total">${money(o.total)}</span>
                    <span class="order-qty">${itemCount(o)} item${itemCount(o) === 1 ? '' : 's'}</span>
                </div>
                ${next
                    ? `<button class="order-advance" data-advance="${o.id}">Move to ${Store.STATUS_LABELS[next]}</button>`
                    : `<span class="order-done">Completed</span>`}
            </div>
        `).join('');

        return `
            <div class="board-col" data-status="${status}">
                <div class="board-col-head">
                    <span class="board-col-title"><span class="dot"></span>${Store.STATUS_LABELS[status]}</span>
                    <span class="board-col-count">${inCol.length}</span>
                </div>
                <div class="board-col-body">${cards || '<p class="board-col-empty">—</p>'}</div>
            </div>
        `;
    }).join('');

    board.querySelectorAll('[data-advance]').forEach(btn => {
        btn.addEventListener('click', () => {
            Store.advanceOrder(btn.dataset.advance);
            render();
        });
    });
    board.querySelectorAll('[data-cancel]').forEach(btn => {
        btn.addEventListener('click', () => {
            Store.setOrderStatus(btn.dataset.cancel, 'cancelled');
            render();
        });
    });
}

/* ---------- Users table ---------- */
function renderUsers(users) {
    const table = document.getElementById('users-table');
    const empty = document.getElementById('users-empty');
    empty.classList.toggle('hidden', users.length > 0);

    if (!users.length) {
        table.innerHTML = '';
        return;
    }

    const rows = [...users]
        .sort((a, b) => (b.points || 0) - (a.points || 0))
        .map(u => {
            const redeemed = (u.pointsRedeemed || 0) > 0;
            return `
                <tr>
                    <td class="u-name">
                        <span class="u-avatar" aria-hidden="true">${initials(u.name)}</span>
                        <span>${u.name || '—'}</span>
                    </td>
                    <td class="u-email">${u.email}</td>
                    <td class="num">${u.points || 0}</td>
                    <td>${redeemed
                        ? `<span class="pill redeemed">✓ ${u.pointsRedeemed} pts</span>`
                        : `<span class="pill pending">—</span>`}</td>
                    <td class="u-joined">${new Date(u.createdAt).toLocaleDateString()}</td>
                    <td class="u-action"><button class="redeem-btn" data-redeem="${u.email}" ${u.points > 0 ? '' : 'disabled'}>Redeem</button></td>
                </tr>
            `;
        }).join('');

    table.innerHTML = `
        <thead>
            <tr>
                <th>Member</th><th>Email</th><th>Points</th><th>Redeemed</th><th>Joined</th><th></th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    `;

    table.querySelectorAll('[data-redeem]').forEach(btn => {
        btn.addEventListener('click', () => {
            Store.redeemPoints(btn.dataset.redeem);
            render();
        });
    });
}

/* ---------- Reservations ---------- */
const RES_STATUS_LABEL = { booked: 'Booked', seated: 'Seated', cancelled: 'Cancelled' };

function fmtResDate(dateStr, timeStr) {
    const d = new Date(dateStr + 'T' + timeStr);
    const day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const t = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return { day, t };
}

function renderReservations() {
    const table = document.getElementById('res-table');
    const empty = document.getElementById('res-empty');
    const list = Store.getReservations();
    empty.classList.toggle('hidden', list.length > 0);

    if (!list.length) {
        table.innerHTML = '';
        return;
    }

    const rows = [...list]
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        .map(r => {
            const { day, t } = fmtResDate(r.date, r.time);
            const status = r.status || 'booked';
            return `
                <tr class="${status === 'cancelled' ? 'is-off' : ''}">
                    <td class="u-name">
                        <span class="u-avatar" aria-hidden="true">${initials(r.name)}</span>
                        <span>${r.name}</span>
                    </td>
                    <td class="res-when"><strong>${day}</strong><span>${t}</span></td>
                    <td class="num">${r.guests}</td>
                    <td class="u-email">${r.email}</td>
                    <td><span class="pill res-${status}">${RES_STATUS_LABEL[status]}</span></td>
                    <td class="u-action">
                        ${status === 'booked'
                            ? `<button class="redeem-btn" data-seat="${r.id}">Seat</button>
                               <button class="order-cancel-inline" data-res-cancel="${r.id}" title="Cancel booking" aria-label="Cancel booking">&times;</button>`
                            : ''}
                    </td>
                </tr>
            `;
        }).join('');

    table.innerHTML = `
        <thead>
            <tr><th>Guest</th><th>When</th><th>Party</th><th>Email</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>${rows}</tbody>
    `;

    table.querySelectorAll('[data-seat]').forEach(btn => {
        btn.addEventListener('click', () => { Store.setReservationStatus(btn.dataset.seat, 'seated'); render(); });
    });
    table.querySelectorAll('[data-res-cancel]').forEach(btn => {
        btn.addEventListener('click', () => { Store.setReservationStatus(btn.dataset.resCancel, 'cancelled'); render(); });
    });
}

/* ---------- Sample generators ---------- */
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateSampleReservation() {
    const first = pick(SAMPLE_FIRST);
    const last = pick(SAMPLE_LAST);
    const email = `${first}.${last}${Math.floor(100 + Math.random() * 900)}@example.com`.toLowerCase();
    const daysAhead = Math.floor(Math.random() * 10);
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const times = ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
    Store.addReservation({
        id: Store.newReservationId(),
        createdAt: Date.now(),
        date: d.toISOString().slice(0, 10),
        time: pick(times),
        guests: 2 + Math.floor(Math.random() * 6),
        name: `${first} ${last}`,
        email,
        status: Math.random() < 0.15 ? 'seated' : 'booked'
    });
    render();
}

document.getElementById('gen-reservation').addEventListener('click', generateSampleReservation);

function generateSampleOrder() {
    let users = Store.getUsers();
    let customer;
    if (users.length >= 3 && Math.random() < 0.4) {
        customer = pick(users);
    } else {
        const first = pick(SAMPLE_FIRST);
        const last = pick(SAMPLE_LAST);
        const email = `${first}.${last}${Math.floor(100 + Math.random() * 900)}@example.com`.toLowerCase();
        customer = Store.upsertUser({ name: `${first} ${last}`, email });
    }

    const count = 1 + Math.floor(Math.random() * 3);
    const cart = [];
    for (let i = 0; i < count; i++) {
        const p = pick(SAMPLE_PRODUCTS);
        const existing = cart.find(c => c.name === p.name);
        if (existing) existing.quantity++;
        else cart.push({ ...p, quantity: 1 });
    }

    const order = Store.buildOrder({ name: customer.name, email: customer.email, cart });
    // Cycle starting statuses so a few sample orders fill several columns
    const cycle = ['new', 'preparing', 'ready', 'new', 'delivered'];
    order.status = cycle[Store.getOrders().length % cycle.length];
    // Backdate a little so the board doesn't read "just now" on every card
    order.createdAt = Date.now() - Math.floor(Math.random() * 90) * 60 * 1000;
    Store.addOrder(order);
    Store.addPoints(customer.email, order.points);
    render();
}

document.getElementById('gen-order').addEventListener('click', generateSampleOrder);

document.getElementById('reset-demo').addEventListener('click', () => {
    if (confirm('Wipe all demo orders and members? This cannot be undone.')) {
        Store.clearAll();
        render();
    }
});

/* ---------- Render loop ---------- */
function render() {
    const orders = Store.getOrders();
    const users = Store.getUsers();
    const reservations = Store.getReservations();
    renderKpis(orders, users, reservations);
    renderBoard(orders);
    renderReservations();
    renderUsers(users);
}

// Keep the dashboard live if the storefront (another tab) writes data
window.addEventListener('storage', () => {
    if (!app.classList.contains('hidden')) render();
});

/* ---------- Boot ---------- */
// Pre-fill the demo password; skip the gate if already unlocked this session.
// (Runs last so every render helper above is initialised first.)
passInput.value = ADMIN_PASSWORD;
if (sessionStorage.getItem(SESSION_FLAG) === '1') {
    showApp();
}
