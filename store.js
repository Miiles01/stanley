/* ============================================================================
   store.js — shared localStorage data layer for the storefront + admin panel
   Loaded by BOTH index.html and admin.html (before their own scripts).
   No backend: everything lives in the visitor's browser.
   ========================================================================== */

const Store = {
    KEYS: {
        users: 'brasserie_users',
        orders: 'brasserie_orders',
        reservations: 'brasserie_reservations',
        session: 'brasserie_user',
        cart: 'brasserie_cart'
    },

    // Order lifecycle (the admin board columns, in order)
    STATUSES: ['new', 'preparing', 'ready', 'delivered'],
    STATUS_LABELS: {
        new: 'Nouvelle',
        preparing: 'En préparation',
        ready: 'Prête',
        delivered: 'Livrée',
        cancelled: 'Annulée'
    },

    _read(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw == null ? fallback : JSON.parse(raw);
        } catch (e) {
            return fallback;
        }
    },
    _write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            /* storage full / blocked — demo tolerates this */
        }
    },

    /* ---------- Users ---------- */
    getUsers() {
        return this._read(this.KEYS.users, []);
    },
    getUserByEmail(email) {
        return this.getUsers().find(u => u.email === email) || null;
    },
    upsertUser(patch) {
        const users = this.getUsers();
        const i = users.findIndex(u => u.email === patch.email);
        if (i >= 0) {
            users[i] = { ...users[i], ...patch };
        } else {
            users.push({
                points: 0,
                pointsRedeemed: 0,
                createdAt: Date.now(),
                ...patch
            });
        }
        this._write(this.KEYS.users, users);
        return this.getUserByEmail(patch.email);
    },
    addPoints(email, amount) {
        const u = this.getUserByEmail(email);
        if (!u) return null;
        return this.upsertUser({ email, points: (u.points || 0) + amount });
    },
    redeemPoints(email) {
        const u = this.getUserByEmail(email);
        if (!u || !(u.points > 0)) return u;
        return this.upsertUser({
            email,
            points: 0,
            pointsRedeemed: (u.pointsRedeemed || 0) + u.points,
            lastRedeemedAt: Date.now()
        });
    },

    /* ---------- Orders ---------- */
    getOrders() {
        return this._read(this.KEYS.orders, []);
    },
    addOrder(order) {
        const orders = this.getOrders();
        orders.unshift(order);
        this._write(this.KEYS.orders, orders);
        return order;
    },
    setOrderStatus(id, status) {
        const orders = this.getOrders();
        const o = orders.find(x => x.id === id);
        if (o) {
            o.status = status;
            o.updatedAt = Date.now();
            this._write(this.KEYS.orders, orders);
        }
        return o;
    },
    advanceOrder(id) {
        const o = this.getOrders().find(x => x.id === id);
        if (!o || o.status === 'cancelled') return o;
        const idx = this.STATUSES.indexOf(o.status);
        if (idx < 0 || idx >= this.STATUSES.length - 1) return o;
        return this.setOrderStatus(id, this.STATUSES[idx + 1]);
    },

    /* ---------- Reservations ---------- */
    getReservations() {
        return this._read(this.KEYS.reservations, []);
    },
    addReservation(res) {
        const list = this.getReservations();
        list.unshift(res);
        this._write(this.KEYS.reservations, list);
        return res;
    },
    setReservationStatus(id, status) {
        const list = this.getReservations();
        const r = list.find(x => x.id === id);
        if (r) {
            r.status = status;
            r.updatedAt = Date.now();
            this._write(this.KEYS.reservations, list);
        }
        return r;
    },
    newReservationId() {
        return 'RES-' +
            Date.now().toString(36).toUpperCase().slice(-4) +
            Math.random().toString(36).slice(2, 4).toUpperCase();
    },

    /* ---------- Helpers ---------- */
    newOrderId() {
        return 'ORD-' +
            Date.now().toString(36).toUpperCase().slice(-4) +
            Math.random().toString(36).slice(2, 4).toUpperCase();
    },

    // Build an order object from a cart (array of {name, quantity, price, icon}).
    buildOrder({ name, email, cart }) {
        const items = cart.map(i => ({
            name: i.name,
            qty: i.quantity,
            price: i.price,
            icon: i.icon || ''
        }));
        const total = items.reduce((s, i) => s + i.price * i.qty, 0);
        return {
            id: this.newOrderId(),
            createdAt: Date.now(),
            name,
            email,
            items,
            total,
            points: Math.floor(total),
            status: 'new'
        };
    },

    // Wipe everything the demo owns (used by the admin "reset" button).
    clearAll() {
        Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
    }
};
