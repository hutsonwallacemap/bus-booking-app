/* ==========================================================================
   Islander Transit – Core JS Engine v2
   ========================================================================== */

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_ROUTES = [
    { id: 'pb-bt', from: 'Port Blair', to: 'Baratang',    distance: 100, travelTime: '3.5 hrs', baseFare: 150 },
    { id: 'pb-rt', from: 'Port Blair', to: 'Rangat',      distance: 170, travelTime: '6 hrs',   baseFare: 320 },
    { id: 'pb-mb', from: 'Port Blair', to: 'Mayabunder',  distance: 230, travelTime: '8.5 hrs', baseFare: 480 },
    { id: 'pb-dp', from: 'Port Blair', to: 'Diglipur',    distance: 300, travelTime: '11 hrs',  baseFare: 650 },
    { id: 'pb-wd', from: 'Port Blair', to: 'Wandoor',     distance: 25,  travelTime: '1 hr',    baseFare: 50  },
    { id: 'pb-ct', from: 'Port Blair', to: 'Chidiyatapu', distance: 30,  travelTime: '1 hr',    baseFare: 50  }
];

const MOCK_FERRY_ROUTES = [
    { id: 'pb-hl', from: 'Port Blair', to: 'Havelock Island', distance: 57, travelTime: '2 hrs', baseFare: 950, jettyFrom: 'Haddo Wharf Jetty', jettyTo: 'Havelock Jetty' },
    { id: 'hl-nl', from: 'Havelock Island', to: 'Neil Island', distance: 18, travelTime: '1.2 hrs', baseFare: 800, jettyFrom: 'Havelock Jetty', jettyTo: 'Neil Jetty' },
    { id: 'nl-pb', from: 'Neil Island', to: 'Port Blair', distance: 40, travelTime: '1.5 hrs', baseFare: 850, jettyFrom: 'Neil Jetty', jettyTo: 'Haddo Wharf Jetty' },
    { id: 'pb-nl', from: 'Port Blair', to: 'Neil Island', distance: 40, travelTime: '1.5 hrs', baseFare: 850, jettyFrom: 'Haddo Wharf Jetty', jettyTo: 'Neil Jetty' },
    { id: 'nl-hl', from: 'Neil Island', to: 'Havelock Island', distance: 18, travelTime: '1.2 hrs', baseFare: 800, jettyFrom: 'Neil Jetty', jettyTo: 'Havelock Jetty' },
    { id: 'hl-pb', from: 'Havelock Island', to: 'Port Blair', distance: 57, travelTime: '2 hrs', baseFare: 950, jettyFrom: 'Havelock Jetty', jettyTo: 'Haddo Wharf Jetty' }
];

const POPULAR_ROUTES = [
    { from: 'Port Blair', to: 'Diglipur',   dur: '11 hrs',  atr: true },
    { from: 'Port Blair', to: 'Baratang',   dur: '3.5 hrs', atr: true },
    { from: 'Port Blair', to: 'Rangat',     dur: '6 hrs',   atr: true },
    { from: 'Port Blair', to: 'Mayabunder', dur: '8.5 hrs', atr: true },
];

const POPULAR_FERRY_ROUTES = [
    { from: 'Port Blair', to: 'Havelock Island', dur: '2 hrs' },
    { from: 'Havelock Island', to: 'Neil Island', dur: '1.2 hrs' },
    { from: 'Neil Island', to: 'Port Blair', dur: '1.5 hrs' }
];

const BUS_OPERATORS = [
    { name: 'STS Government Service',  type: 'STS',     rating: 4.0 },
    { name: 'Anand Travels',           type: 'Private', rating: 4.5 },
    { name: 'Geeta Travels',           type: 'Private', rating: 4.2 },
    { name: 'Andaman Ocean Express',   type: 'Private', rating: 4.7 }
];

const FERRY_OPERATORS = [
    { name: 'Makruzz', rating: 4.8 },
    { name: 'Green Ocean Cruise', rating: 4.6 },
    { name: 'Coastal Cruise', rating: 4.5 }
];

const CONVOY_TIMES = {
    jirkatang:    ['06:00 AM', '09:00 AM', '12:30 PM', '02:30 PM'],
    middleStrait: ['06:30 AM', '09:30 AM', '12:30 PM', '03:00 PM']
};

// ATR node positions for the SVG map (Port Blair at bottom, Diglipur at top)
const ATR_NODES = [
    { id: 'port-blair',  label: 'Port Blair',  x: 180, y: 390 },
    { id: 'jirkatang',   label: 'Jirkatang',   x: 155, y: 300 },
    { id: 'baratang',    label: 'Baratang',    x: 120, y: 220 },
    { id: 'rangat',      label: 'Rangat',      x: 145, y: 155 },
    { id: 'mayabunder',  label: 'Mayabunder',  x: 185, y: 95  },
    { id: 'diglipur',    label: 'Diglipur',    x: 210, y: 30  },
];
const ATR_SEGMENTS = [
    ['port-blair','jirkatang'],
    ['jirkatang','baratang'],
    ['baratang','rangat'],
    ['rangat','mayabunder'],
    ['mayabunder','diglipur'],
];

// ── App State ──────────────────────────────────────────────────────────────

const AppState = {
    buses: [], // Reused for both buses and ferries
    bookings: [],
    currentUser: { name: 'Traveler', avatar: 'T' },
    theme: 'dark',
    search: { category: 'bus', from: '', to: '', date: '', passengers: 1 },
    activeBooking: {
        bus: null, // Holds selected Bus or Ferry object
        selectedSeats: [],
        selectedDeck: 'lower', // 'lower' or 'upper' for cruise ship decks
        passengers: [],
        permitInfo: { idType: 'Aadhaar', idNumber: '', islanderCard: '', hasReadGuidelines: false },
        payment: { method: 'card', status: 'pending' }
    },
    currentScreen: 'search',
    adminMetrics: { totalBookings: 0, revenue: 0, occupancyRate: 72 }
};

// ── Init ───────────────────────────────────────────────────────────────────

// ── Init ───────────────────────────────────────────────────────────────────

function initApp() {
    const savedTheme = localStorage.getItem('islander-theme');
    if (savedTheme) { AppState.theme = savedTheme; if (savedTheme === 'light') document.body.classList.add('light-theme'); }

    const savedBookings = localStorage.getItem('islander-bookings');
    if (savedBookings) AppState.bookings = JSON.parse(savedBookings);

    const savedBuses = localStorage.getItem('islander-buses');
    if (savedBuses) {
        const parsed = JSON.parse(savedBuses);
        const tom = new Date(); tom.setDate(tom.getDate() + 1);
        const tomStr = tom.toISOString().split('T')[0];
        
        const hasReturnBus = parsed.some(b => b.category === 'bus' && b.id.includes('RET'));
        // If the cache exists but doesn't have ferries, or doesn't have fresh dates, or missing return routes, regenerate
        if (parsed.length > 0 && parsed.some(b => b.category === 'ferry') && parsed.some(b => b.date === tomStr) && hasReturnBus) {
            AppState.buses = parsed;
        } else {
            generateMockBuses();
            saveBusesToStorage();
        }
    } else {
        generateMockBuses();
        saveBusesToStorage();
    }

    updateAdminMetrics();
    wireHeaderEvents();
    wireFooterEvents();
    wireModals();
    navigateTo('search');
}

function generateMockBuses() {
    AppState.buses = [];
    const busTypes = [
        { name: 'Standard Non-AC',       type: 'non-ac',   multiplier: 1.0, seats: 40 },
        { name: 'Deluxe AC Express',      type: 'ac',       multiplier: 1.5, seats: 35 },
        { name: 'Super Luxury Coach',     type: 'deluxe',   multiplier: 2.0, seats: 30 },
        { name: 'Electric Green Express', type: 'electric', multiplier: 1.6, seats: 35 }
    ];
    const today = new Date();
    for (let d = 0; d < 7; d++) {
        const cd = new Date(today); cd.setDate(today.getDate() + d);
        const dateStr = cd.toISOString().split('T')[0];
        
        // 1. Generate Bus Fleet
        MOCK_ROUTES.forEach(route => {
            const times = route.distance > 150
                ? ['05:00 AM', '07:30 AM', '09:00 AM']
                : ['07:00 AM', '10:30 AM', '02:00 PM', '05:30 PM'];
            times.forEach((time, i) => {
                const op = BUS_OPERATORS[i % BUS_OPERATORS.length];
                const bt = busTypes[i % busTypes.length];
                const fare = Math.round(route.baseFare * bt.multiplier);
                const bookedSeats = [];
                const maxBooked = Math.floor(Math.random() * (bt.seats * 0.65));
                while (bookedSeats.length < maxBooked) {
                    const n = Math.floor(Math.random() * bt.seats) + 1;
                    if (!bookedSeats.includes(n)) bookedSeats.push(n);
                }
                AppState.buses.push({
                    id: `BUS-${route.id.toUpperCase()}-${dateStr}-${i}`,
                    category: 'bus',
                    routeId: route.id, from: route.from, to: route.to,
                    date: dateStr, departureTime: time,
                    operator: op.name, busName: bt.name, busType: bt.type,
                    rating: op.rating, fare, totalSeats: bt.seats,
                    bookedSeats, travelTime: route.travelTime, distance: route.distance
                });
                
                // Add RETURN trip
                AppState.buses.push({
                    id: `BUS-RET-${route.id.toUpperCase()}-${dateStr}-${i}`,
                    category: 'bus',
                    routeId: route.id + '-ret', from: route.to, to: route.from,
                    date: dateStr, departureTime: time,
                    operator: op.name, busName: bt.name, busType: bt.type,
                    rating: op.rating, fare: fare, totalSeats: bt.seats,
                    bookedSeats: [], travelTime: route.travelTime, distance: route.distance
                });
            });
        });

        // 2. Generate Ferry/Cruise Fleet
        MOCK_FERRY_ROUTES.forEach(route => {
            const times = ['08:30 AM', '12:15 PM', '04:00 PM'];
            times.forEach((time, i) => {
                const op = FERRY_OPERATORS[i % FERRY_OPERATORS.length];
                const bookedSeats = [];
                // Cruise ships have 80 seats in our simplified model
                const maxBooked = Math.floor(Math.random() * 45);
                while (bookedSeats.length < maxBooked) {
                    const n = Math.floor(Math.random() * 80) + 1;
                    if (!bookedSeats.includes(n)) bookedSeats.push(n);
                }
                
                let opClassLabel = "Luxury Cruise";
                let opClassTag = "makruzz";
                if (op.name === 'Makruzz') {
                    opClassLabel = "Makruzz High Speed Cruise";
                    opClassTag = "makruzz";
                } else if (op.name === 'Green Ocean Cruise') {
                    opClassLabel = "Green Ocean Open Deck Cruise";
                    opClassTag = "green-ocean";
                } else {
                    opClassLabel = "Coastal Speed Catamaran";
                    opClassTag = "coastal-cruise";
                }

                AppState.buses.push({
                    id: `FERRY-${route.id.toUpperCase()}-${dateStr}-${i}`,
                    category: 'ferry',
                    routeId: route.id, from: route.from, to: route.to,
                    date: dateStr, departureTime: time,
                    operator: op.name, busName: opClassLabel, busType: opClassTag,
                    rating: op.rating, fare: route.baseFare, totalSeats: 80,
                    bookedSeats, travelTime: route.travelTime, distance: route.distance,
                    jettyFrom: route.jettyFrom, jettyTo: route.jettyTo
                });
            });
        });
    }
}

function saveBusesToStorage()    { localStorage.setItem('islander-buses', JSON.stringify(AppState.buses)); }
function saveBookingsToStorage() { localStorage.setItem('islander-bookings', JSON.stringify(AppState.bookings)); updateAdminMetrics(); }
function updateAdminMetrics() {
    AppState.adminMetrics.totalBookings = AppState.bookings.length;
    AppState.adminMetrics.revenue = AppState.bookings.reduce((s, b) => s + b.totalAmount, 0);
}

// ── Routing ────────────────────────────────────────────────────────────────

function navigateTo(screen, data = null) {
    AppState.currentScreen = screen;
    document.getElementById('mobile-nav-menu').classList.remove('show');
    updateNavSelection(screen);
    const root = document.getElementById('app-root');
    root.innerHTML = '';
    window.scrollTo(0, 0);
    switch (screen) {
        case 'search':      renderSearchScreen(root);              break;
        case 'bus-list':    renderBusListScreen(root);             break;
        case 'seat-selection': renderSeatSelectionScreen(root);    break;
        case 'passenger-details': renderPassengerDetailsScreen(root); break;
        case 'ticket-summary': renderTicketSummaryScreen(root, data); break;
        case 'history':     renderHistoryScreen(root);             break;
        case 'convoy':      renderConvoyScreen(root);              break;
        case 'admin':       renderAdminScreen(root);               break;
        default:            renderSearchScreen(root);
    }
}

function updateNavSelection(screen) {
    ['search','history','convoy','admin'].forEach(nav => {
        document.getElementById(`nav-${nav}`)?.classList.remove('active');
        document.getElementById(`m-nav-${nav}`)?.classList.remove('active');
        if (nav === screen) {
            document.getElementById(`nav-${nav}`)?.classList.add('active');
            document.getElementById(`m-nav-${nav}`)?.classList.add('active');
        }
    });
}

// ── Wire global events ─────────────────────────────────────────────────────

function wireHeaderEvents() {
    document.getElementById('btn-home-logo').addEventListener('click', () => navigateTo('search'));
    document.getElementById('nav-search').addEventListener('click',  () => navigateTo('search'));
    document.getElementById('nav-history').addEventListener('click', () => navigateTo('history'));
    document.getElementById('nav-convoy').addEventListener('click',  () => navigateTo('convoy'));
    document.getElementById('nav-admin').addEventListener('click',   () => navigateTo('admin'));

    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        AppState.theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        localStorage.setItem('islander-theme', AppState.theme);
        showToast(`Switched to ${AppState.theme} mode`, 'info');
    });

    const avatar = document.getElementById('user-avatar-btn');
    const dropdown = document.getElementById('profile-dropdown');
    avatar.addEventListener('click', e => { e.stopPropagation(); dropdown.classList.toggle('show'); });
    document.addEventListener('click', () => dropdown.classList.remove('show'));
    document.getElementById('btn-profile-bookings').addEventListener('click', () => navigateTo('history'));
    document.getElementById('btn-profile-admin').addEventListener('click',    () => navigateTo('admin'));

    const mobToggle = document.getElementById('mobile-toggle');
    const mobNav    = document.getElementById('mobile-nav-menu');
    mobToggle.addEventListener('click', () => mobNav.classList.toggle('show'));
    document.getElementById('m-nav-search').addEventListener('click',  () => navigateTo('search'));
    document.getElementById('m-nav-history').addEventListener('click', () => navigateTo('history'));
    document.getElementById('m-nav-convoy').addEventListener('click',  () => navigateTo('convoy'));
    document.getElementById('m-nav-admin').addEventListener('click',   () => navigateTo('admin'));
}

function wireFooterEvents() {
    document.getElementById('link-f-convoy').addEventListener('click',  e => { e.preventDefault(); navigateTo('convoy');  });
    document.getElementById('link-f-history').addEventListener('click', e => { e.preventDefault(); navigateTo('history'); });
    document.getElementById('link-f-admin').addEventListener('click',   e => { e.preventDefault(); navigateTo('admin');   });
}

function wireModals() {
    document.getElementById('btn-close-guidelines').addEventListener('click', () => document.getElementById('guidelines-modal').classList.remove('show'));
    document.getElementById('btn-guidelines-accept').addEventListener('click', () => {
        document.getElementById('guidelines-modal').classList.remove('show');
        showToast('ATR Guidelines accepted', 'success');
    });
}

// ── SVG seat icon generator ────────────────────────────────────────────────

function makeSeatSVG(state) {
    // state: 'available' | 'booked' | 'selected'
    const colors = {
        available: { body: 'rgba(0,200,232,0.08)', stroke: '#00c8e8', head: 'rgba(0,200,232,0.12)', arm: '#00c8e8' },
        booked:    { body: 'rgba(82,103,126,0.15)', stroke: '#52677e', head: 'rgba(82,103,126,0.2)',  arm: '#52677e' },
        selected:  { body: 'rgba(6,214,160,0.2)',   stroke: '#06d6a0', head: 'rgba(6,214,160,0.3)',   arm: '#06d6a0' }
    };
    const c = colors[state] || colors.available;
    return `<svg class="seat-svg" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Headrest -->
  <rect x="7" y="1" width="22" height="9" rx="4" fill="${c.head}" stroke="${c.stroke}" stroke-width="1.5"/>
  <!-- Seat back -->
  <rect x="5" y="9" width="26" height="18" rx="4" fill="${c.body}" stroke="${c.stroke}" stroke-width="1.5"/>
  <!-- Seat base -->
  <rect x="7" y="25" width="22" height="9" rx="3" fill="${c.body}" stroke="${c.stroke}" stroke-width="1.5"/>
  <!-- Left armrest -->
  <rect x="1" y="14" width="5" height="12" rx="2.5" fill="${c.arm}" opacity="0.7"/>
  <!-- Right armrest -->
  <rect x="30" y="14" width="5" height="12" rx="2.5" fill="${c.arm}" opacity="0.7"/>
  <!-- Legs -->
  <rect x="10" y="33" width="4" height="6" rx="2" fill="${c.stroke}" opacity="0.4"/>
  <rect x="22" y="33" width="4" height="6" rx="2" fill="${c.stroke}" opacity="0.4"/>
</svg>`;
}

// ── Screen: Search / Home ──────────────────────────────────────────────────

function renderSearchScreen(root) {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const dateVal  = tomorrow.toISOString().split('T')[0];

    const section = document.createElement('div');
    section.className = 'screen-fade-in container';

    function rebuildSearchContent() {
        const cat = AppState.search.category; // 'bus' or 'ferry'
        let locs = [];
        if (cat === 'bus') {
            locs = Array.from(new Set(MOCK_ROUTES.flatMap(r => [r.from, r.to])));
        } else {
            locs = Array.from(new Set(MOCK_FERRY_ROUTES.flatMap(r => [r.from, r.to])));
        }

        const popular = cat === 'bus' ? POPULAR_ROUTES : POPULAR_FERRY_ROUTES;
        const fromVal = AppState.search.from || '';
        const toVal = AppState.search.to || '';
        const dateValInp = AppState.search.date || dateVal;

        section.innerHTML = `
        <!-- ▸ HERO STRIP -->
        <div class="hero-strip">
          <div class="hero-text-block">
            <div class="hero-eyebrow">Andaman Island Transit Network</div>
            <h1 class="hero-headline">Book Your Journey<br>Across the Andamans</h1>
            <p class="hero-sub">Seamless transport bookings from Port Blair to Swaraj Dweep, Shaheed Dweep &amp; North Andaman. Live seat maps — all in one place.</p>
            <div class="hero-stat-row">
              <div class="hero-stat"><span class="hero-stat-num">9+</span><span class="hero-stat-label">Destinations</span></div>
              <div class="hero-stat"><span class="hero-stat-num">3+</span><span class="hero-stat-label">Cruise Lines</span></div>
              <div class="hero-stat"><span class="hero-stat-num">300<small style="font-size:14px">km</small></span><span class="hero-stat-label">ATR Length</span></div>
              <div class="hero-stat"><span class="hero-stat-num">${AppState.buses.length}+</span><span class="hero-stat-label">Daily Slots</span></div>
            </div>
          </div>
          <!-- Andaman SVG decorative island shape on the right -->
          <svg width="180" height="220" viewBox="0 0 180 220" fill="none" style="opacity:0.55;flex-shrink:0;" xmlns="http://www.w3.org/2000/svg">
            <path d="M90 10 C60 20, 30 60, 25 100 C20 140, 40 170, 70 190 C90 200, 115 195, 135 180 C160 160, 165 130, 155 100 C145 70, 125 30, 90 10Z" fill="rgba(0,200,232,0.08)" stroke="rgba(0,200,232,0.3)" stroke-width="1.5"/>
            <circle cx="90" cy="190" r="5" fill="rgba(0,200,232,0.25)"/>
            <circle cx="80" cy="205" r="4" fill="rgba(0,200,232,0.2)"/>
            <circle cx="70" cy="215" r="3" fill="rgba(0,200,232,0.15)"/>
            <text x="90" y="100" text-anchor="middle" font-size="28" fill="rgba(0,200,232,0.15)" font-family="serif">✦</text>
            <text x="90" y="70" text-anchor="middle" font-size="9" fill="rgba(0,200,232,0.35)" font-family="sans-serif" font-weight="700">ANDAMAN</text>
            <text x="90" y="83" text-anchor="middle" font-size="7" fill="rgba(0,200,232,0.25)" font-family="sans-serif">&amp; NICOBAR</text>
          </svg>
        </div>

        <!-- CATEGORY SELECTOR -->
        <div class="booking-category-selector">
          <button class="category-btn ${cat === 'bus' ? 'active' : ''}" id="btn-select-bus">
            <span>🚌</span> Bus Booking
          </button>
          <button class="category-btn ${cat === 'ferry' ? 'active' : ''}" id="btn-select-ferry">
            <span>🚢</span> Ferry Tickets
          </button>
        </div>

        <!-- ▸ POPULAR ROUTES -->
        <div class="popular-routes-section">
          <div class="section-label">Popular ${cat === 'bus' ? 'Bus' : 'Cruise'} Routes</div>
          <div class="route-chips-row" id="popular-chips-row">
            ${popular.map(r => `
              <button class="route-chip" data-from="${r.from}" data-to="${r.to}">
                <span>${r.from}</span>
                <span class="chip-arrow">→</span>
                <span>${r.to}</span>
                <span class="chip-dur">${r.dur}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- ▸ SEARCH FORM + MAP GRID -->
        <div class="search-main-grid">
          <!-- Search Form -->
          <div class="glass-panel search-form-card">
            <div class="search-form-title">
              <div class="search-form-title-icon">${cat === 'bus' ? '🚌' : '🚢'}</div>
              Find Available ${cat === 'bus' ? 'Buses' : 'Ferries &amp; Cruises'}
            </div>

            <form id="bus-search-form" autocomplete="off">
              <div class="route-selector-row">
                <div class="form-group">
                  <label>📍 From</label>
                  <select id="search-from" class="form-input" required>
                    <option value="" disabled ${!fromVal ? 'selected' : ''}>Select Origin</option>
                    ${locs.map(l => `<option value="${l}" ${fromVal === l ? 'selected' : ''}>${l}</option>`).join('')}
                  </select>
                </div>
                <button type="button" class="btn-swap" id="btn-swap" title="Swap">⇄</button>
                <div class="form-group">
                  <label>🏁 To</label>
                  <select id="search-to" class="form-input" required>
                    <option value="" disabled ${!toVal ? 'selected' : ''}>Select Destination</option>
                    ${locs.map(l => `<option value="${l}" ${toVal === l ? 'selected' : ''}>${l}</option>`).join('')}
                  </select>
                </div>
              </div>

              <div class="date-pax-row">
                <div class="form-group">
                  <label>📅 Travel Date</label>
                  <input type="date" id="search-date" class="form-input" min="${new Date().toISOString().split('T')[0]}" value="${dateValInp}" required>
                </div>
                <div class="form-group">
                  <label>👥 Passengers</label>
                  <select id="search-passengers" class="form-input">
                    ${[1,2,3,4,5].map(n => `<option value="${n}" ${AppState.search.passengers === n ? 'selected' : ''}>${n} Passenger${n>1?'s':''}</option>`).join('')}
                  </select>
                </div>
              </div>

              <!-- ATR alert -->
              <div class="atr-alert-banner" id="atr-alert" style="display:none;">
                <span class="atr-alert-icon">⚠️</span>
                <span><strong>ATR Convoy Route:</strong> This journey passes through the Jarawa Tribal Reserve. Security permits &amp; convoy compliance required.</span>
              </div>

              <!-- Ferry manifest info alert -->
              <div class="atr-alert-banner" id="ferry-alert" style="display:none;background:rgba(0,200,232,0.06);border-color:var(--primary);color:var(--primary-hover);">
                <span class="atr-alert-icon">🚢</span>
                <span><strong>Ocean Voyage:</strong> Reporting time is 1 hour before departure. Valid Photo ID (Aadhaar/Passport) is mandatory for Boarding Manifest.</span>
              </div>

              <button type="submit" class="btn-primary">
                <span>🔍</span> Search ${cat === 'bus' ? 'Buses' : 'Cruises'}
              </button>
            </form>
          </div>

          <!-- Route Map Card -->
          <div class="glass-panel route-map-card">
            ${cat === 'bus' ? `
              <div class="route-map-title">🗺️ Andaman Trunk Road (ATR) Map</div>
              <svg id="andaman-route-svg" viewBox="0 0 320 440" xmlns="http://www.w3.org/2000/svg">
                <path d="M160 420 C120 400, 80 370, 70 320 C55 260, 65 200, 80 155 C95 105, 110 65, 135 35 C150 15, 170 8, 190 20 C215 35, 230 70, 240 110 C255 160, 255 220, 245 275 C232 330, 210 380, 175 410 Z"
                      fill="rgba(0,200,232,0.04)" stroke="rgba(0,200,232,0.12)" stroke-width="1.5"/>
                ${ATR_SEGMENTS.map(([a,b]) => {
                    const na = ATR_NODES.find(n=>n.id===a);
                    const nb = ATR_NODES.find(n=>n.id===b);
                    return `<line id="seg-${a}-${b}" class="map-path-line" x1="${na.x + 60}" y1="${na.y + 20}" x2="${nb.x + 60}" y2="${nb.y + 20}"/>`;
                }).join('')}
                ${ATR_NODES.map(node => `
                  <g id="node-${node.id}" style="cursor:default;">
                    <circle id="circle-${node.id}" class="map-node-circle" cx="${node.x+60}" cy="${node.y+20}" r="9"/>
                    <text id="label-${node.id}" class="map-node-label" x="${node.x + 75}" y="${node.y + 25}">${node.label}</text>
                  </g>
                `).join('')}
                <text x="90" y="320" font-size="9" fill="rgba(255,209,102,0.6)" font-family="sans-serif">⊗ Jirkatang Gate</text>
                <text x="80" y="243" font-size="9" fill="rgba(255,209,102,0.6)" font-family="sans-serif">⊗ Middle Strait</text>
              </svg>
              <div class="map-info-chips">
                <span class="info-chip info-chip-convoy">🚔 4 Daily Convoys</span>
                <span class="info-chip info-chip-safety">🛡️ Police Escort</span>
                <span class="info-chip info-chip-id">🪪 Permit Required</span>
              </div>
            ` : `
              <div class="route-map-title">🌊 Andaman Sea Route Map</div>
              <svg id="andaman-sea-svg" viewBox="0 0 320 440" xmlns="http://www.w3.org/2000/svg">
                <rect width="320" height="440" rx="12" class="sea-route-bg"/>
                <path d="M30 60 Q50 50, 70 60 T110 60 T150 60 T190 60 T230 60" class="sea-wave"/>
                <path d="M50 180 Q70 170, 90 180 T130 180 T170 180 T210 180 T250 180" class="sea-wave"/>
                <path d="M20 300 Q40 290, 60 300 T100 300 T140 300 T180 300 T220 300" class="sea-wave"/>
                
                <line id="sea-seg-pb-hl" class="map-path-line sea-route" x1="110" y1="330" x2="200" y2="130" />
                <line id="sea-seg-hl-nl" class="map-path-line sea-route" x1="200" y1="130" x2="220" y2="250" />
                <line id="sea-seg-nl-pb" class="map-path-line sea-route" x1="220" y1="250" x2="110" y2="330" />

                <!-- South Andaman / Port Blair area -->
                <path d="M65 350 C55 330, 75 300, 90 310 C105 320, 115 340, 110 360 C105 375, 80 380, 70 370 Z" fill="rgba(6,214,160,0.18)" stroke="rgba(6,214,160,0.4)" stroke-width="1.5" />
                <!-- Havelock Island (Swaraj Dweep) -->
                <path d="M185 110 C175 100, 195 80, 210 90 C225 100, 220 120, 215 130 C210 140, 190 130, 185 110 Z" fill="rgba(6,214,160,0.18)" stroke="rgba(6,214,160,0.4)" stroke-width="1.5" />
                <!-- Neil Island (Shaheed Dweep) -->
                <path d="M210 245 C205 240, 215 230, 225 235 C235 240, 230 260, 222 260 C215 260, 212 250, 210 245 Z" fill="rgba(6,214,160,0.18)" stroke="rgba(6,214,160,0.4)" stroke-width="1.5" />

                <g id="node-pb">
                  <circle id="circle-pb" class="map-node-circle" cx="110" cy="330" r="9"/>
                  <text id="label-pb" class="map-node-label" x="40" y="335" font-weight="600">Port Blair</text>
                </g>
                <g id="node-hl">
                  <circle id="circle-hl" class="map-node-circle" cx="200" cy="130" r="9"/>
                  <text id="label-hl" class="map-node-label" x="120" y="115" font-weight="600">Havelock Island</text>
                </g>
                <g id="node-nl">
                  <circle id="circle-nl" class="map-node-circle" cx="220" cy="250" r="9"/>
                  <text id="label-nl" class="map-node-label" x="235" y="255" font-weight="600">Neil Island</text>
                </g>
                
                <text x="60" y="80" text-anchor="middle" font-size="28" fill="rgba(0,200,232,0.15)" font-family="serif">✦</text>
                <text x="60" y="105" text-anchor="middle" font-size="8" fill="rgba(0,200,232,0.35)" font-family="sans-serif" font-weight="700">ANDAMAN SEA</text>
              </svg>
              <div class="map-info-chips">
                <span class="info-chip info-chip-convoy" style="background:rgba(6,214,160,0.1);color:var(--success);border-color:rgba(6,214,160,0.25);">🚢 Premium Cruise</span>
                <span class="info-chip info-chip-safety">⚓ Port Manifest</span>
                <span class="info-chip info-chip-id">🎟️ Mobile Pass</span>
              </div>
            `}
          </div>
        </div>
        `;

        document.getElementById('btn-select-bus')?.addEventListener('click', () => {
            if (AppState.search.category !== 'bus') {
                AppState.search.category = 'bus';
                AppState.search.from = '';
                AppState.search.to = '';
                rebuildSearchContent();
            }
        });
        document.getElementById('btn-select-ferry')?.addEventListener('click', () => {
            if (AppState.search.category !== 'ferry') {
                AppState.search.category = 'ferry';
                AppState.search.from = '';
                AppState.search.to = '';
                rebuildSearchContent();
            }
        });

        const fromSel = document.getElementById('search-from');
        const toSel   = document.getElementById('search-to');
        const atrBanner = document.getElementById('atr-alert');
        const ferryBanner = document.getElementById('ferry-alert');

        function updateMapHighlight() {
            const f = fromSel.value;
            const t = toSel.value;

            if (cat === 'bus') {
                ATR_NODES.forEach(n => {
                    document.getElementById(`circle-${n.id}`)?.classList.remove('active','endpoint');
                    document.getElementById(`label-${n.id}`)?.classList.remove('active','endpoint');
                });
                ATR_SEGMENTS.forEach(([a,b]) => document.getElementById(`seg-${a}-${b}`)?.classList.remove('active'));

                if (!f || !t) return;
                const fromNodeId = f.toLowerCase().replace(' ','-');
                const toNodeId   = t.toLowerCase().replace(' ','-');

                let active = false;
                ATR_SEGMENTS.forEach(([a, b]) => {
                    if (a === fromNodeId) active = true;
                    if (active) {
                        document.getElementById(`seg-${a}-${b}`)?.classList.add('active');
                        document.getElementById(`circle-${a}`)?.classList.add('active');
                        document.getElementById(`label-${a}`)?.classList.add('active');
                        document.getElementById(`circle-${b}`)?.classList.add('active');
                        document.getElementById(`label-${b}`)?.classList.add('active');
                    }
                    if (b === toNodeId) active = false;
                });
                document.getElementById(`circle-${fromNodeId}`)?.classList.add('endpoint');
                document.getElementById(`label-${fromNodeId}`)?.classList.add('endpoint');
                document.getElementById(`circle-${toNodeId}`)?.classList.add('endpoint');
                document.getElementById(`label-${toNodeId}`)?.classList.add('endpoint');

                if (isATRRoute(f, t)) {
                    if (atrBanner) atrBanner.style.display = 'block';
                } else {
                    if (atrBanner) atrBanner.style.display = 'none';
                }
            } else {
                ['pb','hl','nl'].forEach(n => {
                    document.getElementById(`circle-${n}`)?.classList.remove('active','endpoint');
                    document.getElementById(`label-${n}`)?.classList.remove('active','endpoint');
                });
                ['pb-hl','hl-nl','nl-pb'].forEach(s => document.getElementById(`sea-seg-${s}`)?.classList.remove('active'));

                if (!f || !t) return;
                const fromCode = f.toLowerCase().includes('port') ? 'pb' : (f.toLowerCase().includes('have') ? 'hl' : 'nl');
                const toCode   = t.toLowerCase().includes('port') ? 'pb' : (t.toLowerCase().includes('have') ? 'hl' : 'nl');

                document.getElementById(`circle-${fromCode}`)?.classList.add('active', 'endpoint');
                document.getElementById(`label-${fromCode}`)?.classList.add('active', 'endpoint');
                document.getElementById(`circle-${toCode}`)?.classList.add('active', 'endpoint');
                document.getElementById(`label-${toCode}`)?.classList.add('active', 'endpoint');

                const seg1 = `${fromCode}-${toCode}`;
                const seg2 = `${toCode}-${fromCode}`;
                
                const line1 = document.getElementById(`sea-seg-${seg1}`);
                const line2 = document.getElementById(`sea-seg-${seg2}`);
                if (line1) line1.classList.add('active');
                if (line2) line2.classList.add('active');

                if (ferryBanner) ferryBanner.style.display = 'block';
            }
        }

        fromSel.addEventListener('change', updateMapHighlight);
        toSel.addEventListener('change', updateMapHighlight);

        document.getElementById('btn-swap').addEventListener('click', () => {
            const tmp = fromSel.value; fromSel.value = toSel.value; toSel.value = tmp;
            updateMapHighlight();
        });

        document.querySelectorAll('.route-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                fromSel.value = chip.dataset.from;
                toSel.value   = chip.dataset.to;
                updateMapHighlight();
                showToast(`Route set: ${chip.dataset.from} → ${chip.dataset.to}`, 'info');
            });
        });

        document.getElementById('bus-search-form').addEventListener('submit', e => {
            e.preventDefault();
            if (fromSel.value === toSel.value) { showToast('Origin and destination cannot be the same', 'error'); return; }
            AppState.search.from       = fromSel.value;
            AppState.search.to         = toSel.value;
            AppState.search.date       = document.getElementById('search-date').value;
            AppState.search.passengers = parseInt(document.getElementById('search-passengers').value);
            navigateTo('bus-list');
        });
    }

    rebuildSearchContent();
    root.appendChild(section);
}

function isATRRoute(f, t) {
    return (f==='Port Blair' && ['Baratang','Rangat','Mayabunder','Diglipur'].includes(t)) ||
           (['Baratang','Rangat','Mayabunder','Diglipur'].includes(f) && t==='Port Blair');
}

// ── Screen: Bus List ───────────────────────────────────────────────────────

function renderBusListScreen(root) {
    const section = document.createElement('div');
    section.className = 'screen-fade-in container';
    const cat = AppState.search.category;

    const matchingBuses = AppState.buses.filter(b =>
        b.category === cat &&
        b.from === AppState.search.from &&
        b.to   === AppState.search.to   &&
        b.date === AppState.search.date
    );

    const filterTagsHtml = cat === 'bus'
        ? `
      <button class="filter-chip active" data-filter="all">All</button>
      <button class="filter-chip" data-filter="ac">AC Express</button>
      <button class="filter-chip" data-filter="non-ac">Non-AC</button>
      <button class="filter-chip" data-filter="deluxe">Deluxe</button>
      <button class="filter-chip" data-filter="electric">Electric</button>
        `
        : `
      <button class="filter-chip active" data-filter="all">All Cruises</button>
      <button class="filter-chip" data-filter="makruzz">Makruzz</button>
      <button class="filter-chip" data-filter="green-ocean">Green Ocean</button>
      <button class="filter-chip" data-filter="coastal-cruise">Coastal Cruise</button>
        `;

    section.innerHTML = `
    <div class="search-results-header">
      <div>
        <button class="btn-secondary" id="btn-back-search" style="padding:6px 14px;font-size:13px;margin-bottom:10px;">← Back</button>
        <h2 style="font-size:22px;">${AppState.search.from} → ${AppState.search.to}</h2>
        <p style="color:var(--text-secondary);font-size:13px;">📅 ${formatDate(AppState.search.date)} &nbsp;|&nbsp; 👥 ${AppState.search.passengers} Passenger(s)</p>
      </div>
      <span class="filter-chip" style="background:rgba(6,214,160,0.1);color:var(--success);border-color:rgba(6,214,160,0.25);cursor:default;">
        ${matchingBuses.length} ${cat === 'bus' ? 'Buses' : 'Cruises'} Found
      </span>
    </div>

    <div class="filter-bar">
      ${filterTagsHtml}
    </div>
    <div class="bus-list" id="bus-cards-container"></div>
    `;

    root.appendChild(section);

    const container = document.getElementById('bus-cards-container');

    function renderCards(filter) {
        container.innerHTML = '';
        const list = filter === 'all' ? matchingBuses : matchingBuses.filter(b => b.busType === filter);
        if (!list.length) {
            container.innerHTML = `<div class="glass-panel" style="padding:50px;text-align:center;color:var(--text-secondary);">
              <p style="font-size:17px;margin-bottom:16px;">No ${cat === 'bus' ? 'buses' : 'cruises'} match this filter.</p>
              <button class="btn-primary" style="width:auto;margin:0 auto;" id="btn-reset">Reset Filters</button></div>`;
            document.getElementById('btn-reset')?.addEventListener('click', () => {
                document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active'));
                document.querySelector('[data-filter="all"]').classList.add('active');
                renderCards('all');
            });
            return;
        }
        list.forEach(bus => {
            const avail = bus.totalSeats - bus.bookedSeats.length;
            const card = document.createElement('div');
            card.className = 'glass-panel bus-card';
            
            const fromLocationHtml = cat === 'bus'
                ? `<p>${bus.from}</p>`
                : `<p>${bus.from}<br><small style="font-size:10px;color:var(--text-muted);">${bus.jettyFrom || 'Main Jetty'}</small></p>`;
                
            const toLocationHtml = cat === 'bus'
                ? `<p>${bus.to}</p>`
                : `<p>${bus.to}<br><small style="font-size:10px;color:var(--text-muted);">${bus.jettyTo || 'Main Jetty'}</small></p>`;

            const fareLabel = cat === 'bus' ? 'per seat' : 'starting fare';

            card.innerHTML = `
            <div class="bus-info-col">
              <div><span class="bus-type-tag tag-${bus.busType}">${bus.busName}</span></div>
              <h3 style="margin-top:6px;">${bus.operator}</h3>
              <div class="bus-rating">⭐ ${bus.rating.toFixed(1)} <span>Verified ${cat==='bus'?'STS Operator':'Cruise Line'}</span></div>
            </div>
            <div class="timeline-col">
              <div class="time-box"><h4>${bus.departureTime}</h4>${fromLocationHtml}</div>
              <div class="timeline-line"><span class="duration-tag">${bus.travelTime}</span></div>
              <div class="time-box" style="text-align:right;"><h4>${calcArrival(bus.departureTime, bus.travelTime)}</h4>${toLocationHtml}</div>
            </div>
            <div class="price-col">
              <div class="seats-left" style="color:${avail<10?'var(--accent)':'var(--success)'};">${avail} seats left</div>
              <div class="fare">₹${bus.fare}</div>
              <p style="font-size:11px;color:var(--text-muted);">${fareLabel}</p>
            </div>
            <div>
              <button class="btn-primary btn-pick-bus" data-id="${bus.id}" style="font-size:14px;padding:12px 18px;">
                Select ${cat === 'bus' ? 'Seats' : 'Cabin & Seats'}
              </button>
            </div>`;
            container.appendChild(card);
        });
        document.querySelectorAll('.btn-pick-bus').forEach(btn => {
            btn.addEventListener('click', e => {
                const bus = AppState.buses.find(b => b.id === e.currentTarget.dataset.id);
                AppState.activeBooking.bus = bus;
                AppState.activeBooking.selectedSeats = [];
                AppState.activeBooking.selectedDeck = 'lower';
                navigateTo('seat-selection');
            });
        });
    }

    renderCards('all');
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', e => {
            document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderCards(e.currentTarget.dataset.filter);
        });
    });
    document.getElementById('btn-back-search').addEventListener('click', () => navigateTo('search'));
}

// ── Screen: Seat Selection (2+3 layout) ───────────────────────────────────

function renderSeatSelectionScreen(root) {
    const bus = AppState.activeBooking.bus;
    if (!bus) { navigateTo('search'); return; }
    const cat = bus.category;

    const section = document.createElement('div');
    section.className = 'screen-fade-in container seat-selection-container';

    function getSeatFare(seatNum, baseFare) {
        if (cat === 'bus') return baseFare;
        if (seatNum <= 48) return baseFare; // Premium
        if (seatNum <= 72) return baseFare + 300; // Deluxe
        return baseFare + 850; // Royal VIP
    }
    function getSeatClass(seatNum) {
        if (cat === 'bus') return 'Standard';
        if (seatNum <= 48) return 'Premium';
        if (seatNum <= 72) return 'Deluxe';
        return 'Royal VIP';
    }

    function rebuildCabinUI() {
        const deck = AppState.activeBooking.selectedDeck; // 'lower' or 'upper'
        
        let cabinTitle = "Select Your Seats";
        let cabinSub = `${bus.operator} &nbsp;|&nbsp; ${bus.busName} &nbsp;|&nbsp; ${bus.departureTime}`;
        
        let deckSelectorHtml = '';
        if (cat === 'ferry') {
            cabinTitle = "Select Cabin Class & Seats";
            cabinSub = `${bus.operator} Cruise &nbsp;|&nbsp; ${bus.departureTime} &nbsp;|&nbsp; ${bus.jettyFrom} ➔ ${bus.jettyTo}`;
            
            deckSelectorHtml = `
            <div class="cruise-deck-selector">
              <button class="deck-btn ${deck === 'lower' ? 'active' : ''}" id="btn-deck-lower">🚢 Lower Deck (Premium)</button>
              <button class="deck-btn ${deck === 'upper' ? 'active' : ''}" id="btn-deck-upper">👑 Upper Deck (Deluxe &amp; Royal)</button>
            </div>
            <div class="ferry-deck-header">${deck === 'lower' ? 'Premium Deck (Seats 1-48)' : 'Deluxe &amp; Royal VIP Cabin (Seats 49-80)'}</div>
            <div class="ferry-cabin-info">${deck === 'lower' ? 'Standard AC comfort (Base Fare)' : 'Premium views, lounge access (+₹300 / +₹850)'}</div>
            `;
        }

        const cabinContainerHtml = cat === 'bus' ? `
        <!-- Bus Cabin Shell -->
        <div class="bus-cabin">
          <div class="bus-front">
            <div class="steering-wheel">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
                <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>
                <line x1="12" y1="3" x2="12" y2="9"/>
                <line x1="3"  y1="12" x2="9"  y2="12"/>
                <line x1="15" y1="12" x2="21" y2="12"/>
              </svg>
            </div>
            <span class="driver-label">Driver</span>
          </div>
          <div class="seating-grid" id="seat-grid"></div>
        </div>
        ` : `
        <!-- Cruise Cabin Shell -->
        <div class="cruise-cabin">
          <div class="cruise-cabin-front">
            <div class="radar-screen">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" style="margin-right:8px;">
                <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="3"/>
                <line x1="12" y1="3" x2="12" y2="21"/>
              </svg>
              Radar &amp; Sonar
            </div>
            <span class="driver-label">Bridge / Captain</span>
          </div>
          <div class="cruise-seating-grid" id="seat-grid"></div>
        </div>
        `;

        section.innerHTML = `
        <div style="margin-bottom:18px;">
          <button class="btn-secondary" id="btn-back-buses" style="padding:6px 14px;font-size:13px;">
            ${cat === 'bus' ? '← Back to Buses' : '← Back to Cruises'}
          </button>
        </div>
        <div class="grid-2col">
          <!-- Left: Cabin layout -->
          <div class="glass-panel" style="padding:28px;display:flex;flex-direction:column;align-items:center;">
            <h3 style="margin-bottom:6px;">${cabinTitle}</h3>
            <p style="color:var(--text-secondary);font-size:13px;margin-bottom:20px;text-align:center;">${cabinSub}</p>

            ${deckSelectorHtml}

            <!-- Legend -->
            <div class="seat-legend">
              <div class="legend-item">
                <div class="legend-color">${makeSeatSVG('available')}</div>Available
              </div>
              <div class="legend-item">
                <div class="legend-color">${makeSeatSVG('selected')}</div>Selected
              </div>
              <div class="legend-item">
                <div class="legend-color">${makeSeatSVG('booked')}</div>Reserved
              </div>
            </div>

            ${cabinContainerHtml}
          </div>

          <!-- Right: Summary checkout card -->
          <div class="glass-panel seat-checkout-card">
            <h3>Booking Summary</h3>
            <div class="dropdown-divider"></div>
            <div class="summary-list">
              <div class="summary-item"><span>Route</span><strong style="text-align:right">${bus.from} → ${bus.to}</strong></div>
              ${cat === 'ferry' ? `<div class="summary-item"><span>Vessel</span><strong>${bus.operator}</strong></div>` : ''}
              <div class="summary-item"><span>Departure</span><strong>${bus.departureTime}</strong></div>
              <div class="summary-item"><span>Date</span><strong>${formatDate(bus.date)}</strong></div>
              <div class="summary-item"><span>Select up to</span><strong>${AppState.search.passengers} seat(s)</strong></div>
              <div class="summary-item"><span>Selected Seats</span><strong id="sel-seats-label" style="color:var(--primary);">None</strong></div>
              <div class="summary-item total"><span>Total</span><span id="sel-total">₹0</span></div>
            </div>
            <div id="warn-max" class="alert alert-warning" style="display:none;padding:10px;font-size:12px;margin-top:10px;">
              Max ${AppState.search.passengers} seat(s) allowed.
            </div>
            <button class="btn-primary" id="btn-to-passengers" style="margin-top:20px;" disabled>
              Fill Passenger Details →
            </button>
          </div>
        </div>
        `;

        // Bind Deck Buttons
        if (cat === 'ferry') {
            document.getElementById('btn-deck-lower')?.addEventListener('click', () => {
                if (AppState.activeBooking.selectedDeck !== 'lower') {
                    AppState.activeBooking.selectedDeck = 'lower';
                    rebuildCabinUI();
                }
            });
            document.getElementById('btn-deck-upper')?.addEventListener('click', () => {
                if (AppState.activeBooking.selectedDeck !== 'upper') {
                    AppState.activeBooking.selectedDeck = 'upper';
                    rebuildCabinUI();
                }
            });
        }

        // Build Seating Grid
        const grid = document.getElementById('seat-grid');
        
        if (cat === 'bus') {
            const COLS_LEFT  = 2;
            const COLS_RIGHT = 3;
            const SEATS_PER_ROW = COLS_LEFT + COLS_RIGHT; // 5 seats
            const totalRows = Math.ceil(bus.totalSeats / SEATS_PER_ROW);

            for (let row = 0; row < totalRows; row++) {
                for (let col = 0; col < 6; col++) {
                    if (col === 2) {
                        const gap = document.createElement('div');
                        gap.className = 'walkway-gap';
                        gap.innerHTML = '<div class="walkway-line"></div>';
                        grid.appendChild(gap);
                        continue;
                    }
                    const seatOffset = col < 2 ? col : col - 1;
                    const seatNum = row * SEATS_PER_ROW + seatOffset + 1;
                    if (seatNum > bus.totalSeats) {
                        const empty = document.createElement('div');
                        grid.appendChild(empty);
                        continue;
                    }
                    renderSeatElement(grid, seatNum);
                }
            }
        } else {
            // Cruise Ship Seating Deck (2+4+2 layout = 10 columns including 2 walkways)
            const isLower = deck === 'lower';
            const startSeat = isLower ? 1 : 49;
            const endSeat   = isLower ? 48 : 80;
            const rowsCount = isLower ? 6 : 4;
            const SEATS_PER_ROW = 8; // 2 on left, 4 in center, 2 on right

            for (let row = 0; row < rowsCount; row++) {
                for (let col = 0; col < 10; col++) {
                    if (col === 2 || col === 7) {
                        // Walkways
                        const gap = document.createElement('div');
                        gap.className = 'walkway-gap';
                        gap.innerHTML = '<div class="walkway-line"></div>';
                        grid.appendChild(gap);
                        continue;
                    }
                    
                    let seatOffset = col;
                    if (col > 7) seatOffset = col - 2;
                    else if (col > 2) seatOffset = col - 1;
                    
                    const seatNum = startSeat + (row * SEATS_PER_ROW) + seatOffset;
                    if (seatNum > endSeat) {
                        const empty = document.createElement('div');
                        grid.appendChild(empty);
                        continue;
                    }
                    renderSeatElement(grid, seatNum);
                }
            }
        }

        // Bind Seat Click delegation
        grid.addEventListener('click', e => {
            const seatEl = e.target.closest('.seat.available, .seat.selected');
            if (!seatEl) return;
            const n = parseInt(seatEl.dataset.num);
            if (isNaN(n)) return;
            const idx = AppState.activeBooking.selectedSeats.indexOf(n);
            if (idx > -1) {
                AppState.activeBooking.selectedSeats.splice(idx, 1);
                seatEl.classList.remove('selected');
                seatEl.innerHTML = makeSeatSVG('available') + `<span class="seat-label">${n}</span>`;
            } else {
                if (AppState.activeBooking.selectedSeats.length >= AppState.search.passengers) {
                    showToast(`Max ${AppState.search.passengers} seat(s) per booking`, 'warning');
                    document.getElementById('warn-max').style.display = 'block';
                    return;
                }
                AppState.activeBooking.selectedSeats.push(n);
                seatEl.classList.add('selected');
                seatEl.innerHTML = makeSeatSVG('selected') + `<span class="seat-label">${n}</span>`;
            }
            syncSummary();
        });

        // Bind navigation buttons
        document.getElementById('btn-back-buses')?.addEventListener('click', () => navigateTo('bus-list'));
        document.getElementById('btn-to-passengers')?.addEventListener('click', () => navigateTo('passenger-details'));
        
        syncSummary();
    }

    function renderSeatElement(parentGrid, seatNum) {
        const isBooked = bus.bookedSeats.includes(seatNum);
        const isSelected = AppState.activeBooking.selectedSeats.includes(seatNum);
        
        const seatEl = document.createElement('div');
        seatEl.className = `seat ${isBooked ? 'booked' : (isSelected ? 'selected' : 'available')}`;
        seatEl.dataset.num = seatNum;
        
        const state = isBooked ? 'booked' : (isSelected ? 'selected' : 'available');
        seatEl.innerHTML = makeSeatSVG(state) + `<span class="seat-label">${seatNum}</span>`;
        parentGrid.appendChild(seatEl);
    }

    function syncSummary() {
        const sel = AppState.activeBooking.selectedSeats;
        
        let totalCost = 0;
        const seatLabels = [];
        sel.slice().sort((a,b)=>a-b).forEach(sNum => {
            const cost = getSeatFare(sNum, bus.fare);
            totalCost += cost;
            seatLabels.push(`${sNum} (${getSeatClass(sNum)})`);
        });

        document.getElementById('sel-seats-label').textContent = sel.length ? seatLabels.join(', ') : 'None';
        document.getElementById('sel-total').textContent = `₹${totalCost}`;
        
        const btn = document.getElementById('btn-to-passengers');
        if (sel.length === AppState.search.passengers) {
            btn.removeAttribute('disabled');
            document.getElementById('warn-max').style.display = 'none';
        } else {
            btn.setAttribute('disabled', 'true');
        }
    }

    root.appendChild(section);
    rebuildCabinUI();
}

// ── Screen: Passenger Details ──────────────────────────────────────────────

// Helpers for fare upgrades based on seat/cabin tier
function getSeatFare(category, seatNum, baseFare) {
    if (category === 'bus') return baseFare;
    if (seatNum <= 48) return baseFare; // Premium
    if (seatNum <= 72) return baseFare + 300; // Deluxe
    return baseFare + 850; // Royal VIP
}

function getSeatClass(category, seatNum) {
    if (category === 'bus') return 'Standard';
    if (seatNum <= 48) return 'Premium';
    if (seatNum <= 72) return 'Deluxe';
    return 'Royal VIP';
}

function renderPassengerDetailsScreen(root) {
    const bus  = AppState.activeBooking.bus;
    const seats = AppState.activeBooking.selectedSeats;
    if (!bus || !seats.length) { navigateTo('search'); return; }

    const isATR = bus.category === 'bus' && (
                  (bus.from === 'Port Blair' && ['Baratang','Rangat','Mayabunder','Diglipur'].includes(bus.to)) ||
                  (['Baratang','Rangat','Mayabunder','Diglipur'].includes(bus.from) && bus.to === 'Port Blair')
    );

    const totalFare = seats.reduce((s, seat) => s + getSeatFare(bus.category, seat, bus.fare), 0);

    const section = document.createElement('div');
    section.className = 'screen-fade-in container';
    section.innerHTML = `
    <div style="margin-bottom:18px;">
      <button class="btn-secondary" id="btn-back-seats" style="padding:6px 14px;font-size:13px;">← Back to Seats</button>
    </div>
    <div class="grid-2col">
      <div class="glass-panel" style="padding:28px;">
        <h3 style="margin-bottom:20px;font-size:22px;">Passenger Details</h3>
        <form id="pax-form">
          ${seats.map((seat, i) => `
            <div class="passenger-form-section">
              <div class="passenger-number">Passenger ${i+1} — Seat ${seat} (${getSeatClass(bus.category, seat)})</div>
              <div class="form-row">
                <div class="form-group"><label>Full Name</label>
                  <input type="text" class="form-input pax-name" placeholder="Full Name" required></div>
                <div class="form-group"><label>Age</label>
                  <input type="number" class="form-input pax-age" placeholder="Age" min="1" max="110" required></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Gender</label>
                  <select class="form-input pax-gender" required>
                    <option value="" disabled selected>Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select></div>
                <div class="form-group"><label>ID Number</label>
                  <input type="text" class="form-input pax-id" placeholder="Aadhaar / Passport" required></div>
              </div>
            </div>`).join('')}

          ${bus.category === 'bus' && isATR ? `
            <div class="passenger-form-section" style="border-bottom:none;margin-bottom:0;">
              <div class="passenger-number" style="color:var(--warning);">🛂 ATR Tribal Reserve Permit</div>
              <div class="form-row">
                <div class="form-group"><label>Primary ID Proof</label>
                  <input type="text" id="permit-id" class="form-input" placeholder="Aadhaar / Islander Card No." required></div>
                <div class="form-group"><label>Passenger Status</label>
                  <select id="permit-status" class="form-input">
                    <option value="No">General Tourist / Non-Islander</option>
                    <option value="Yes">A&N Island Resident (Islander)</option>
                  </select></div>
              </div>
              <label style="display:flex;gap:10px;font-size:13px;color:var(--text-secondary);cursor:pointer;margin-top:10px;">
                <input type="checkbox" id="chk-guidelines" style="width:17px;height:17px;" required>
                <span>I agree to strictly follow all <strong>Jarawa Tribal Reserve regulations</strong> including no photography, no contact with tribals, and convoy compliance.</span>
              </label>
            </div>` : ''}

          ${bus.category === 'ferry' ? `
            <div class="passenger-form-section" style="border-bottom:none;margin-bottom:0;">
              <div class="passenger-number" style="color:var(--primary);">⚓ Port Authority Passenger Manifest</div>
              <div class="form-row">
                <div class="form-group"><label>Emergency Mobile Number</label>
                  <input type="tel" id="manifest-mobile" class="form-input" placeholder="Mobile Number" required></div>
                <div class="form-group"><label>Nationality Status</label>
                  <select id="manifest-nation" class="form-input">
                    <option value="Indian">Indian National</option>
                    <option value="Foreigner">Foreign Tourist (RAP Required)</option>
                  </select></div>
              </div>
              <label style="display:flex;gap:10px;font-size:13px;color:var(--text-secondary);cursor:pointer;margin-top:10px;">
                <input type="checkbox" id="chk-manifest-agree" style="width:17px;height:17px;" required>
                <span>I agree to the maritime travel regulations. I will report 1 hour before departure at the boarding jetty and present a valid photo ID.</span>
              </label>
            </div>` : ''}

          <button type="submit" class="btn-primary" style="margin-top:24px;">
            💳 Proceed to Payment &nbsp;(₹${totalFare})
          </button>
        </form>
      </div>

      <div class="glass-panel" style="padding:24px;height:fit-content;">
        <h3 style="margin-bottom:14px;">Trip Summary</h3>
        <div class="dropdown-divider"></div>
        <div class="summary-list">
          <div class="summary-item"><span>Operator</span><strong>${bus.operator}</strong></div>
          <div class="summary-item"><span>${bus.category === 'bus' ? 'Bus' : 'Vessel'}</span><span>${bus.busName}</span></div>
          <div class="summary-item"><span>Departure</span><strong>${bus.departureTime}</strong></div>
          <div class="summary-item"><span>Date</span><strong>${formatDate(bus.date)}</strong></div>
          <div class="summary-item"><span>Seats</span><strong style="color:var(--success);">${seats.map(s => `${s} (${getSeatClass(bus.category, s)})`).join(', ')}</strong></div>
          <div class="summary-item total"><span>Total Fare</span><span>₹${totalFare}</span></div>
        </div>
      </div>
    </div>`;

    root.appendChild(section);

    document.getElementById('btn-back-seats').addEventListener('click', () => navigateTo('seat-selection'));

    document.getElementById('pax-form').addEventListener('submit', e => {
        e.preventDefault();
        const names   = [...document.querySelectorAll('.pax-name')];
        const ages    = [...document.querySelectorAll('.pax-age')];
        const genders = [...document.querySelectorAll('.pax-gender')];
        const ids     = [...document.querySelectorAll('.pax-id')];

        AppState.activeBooking.passengers = seats.map((seat, i) => ({
            seatNumber: seat, name: names[i].value,
            age: parseInt(ages[i].value), gender: genders[i].value, idProof: ids[i].value,
            seatClass: getSeatClass(bus.category, seat)
        }));

        if (bus.category === 'bus' && isATR) {
            AppState.activeBooking.permitInfo = {
                idNumber: document.getElementById('permit-id').value,
                islanderCard: document.getElementById('permit-status').value,
                hasReadGuidelines: document.getElementById('chk-guidelines').checked
            };
        } else if (bus.category === 'ferry') {
            AppState.activeBooking.permitInfo = {
                idNumber: document.getElementById('manifest-mobile').value,
                islanderCard: document.getElementById('manifest-nation').value,
                hasReadGuidelines: document.getElementById('chk-manifest-agree').checked
            };
        }
        openPaymentModal();
    });
}

// ── Payment Modal ──────────────────────────────────────────────────────────

function openPaymentModal() {
    const bus    = AppState.activeBooking.bus;
    const amount = AppState.activeBooking.selectedSeats.reduce((s, seat) => s + getSeatFare(bus.category, seat, bus.fare), 0);
    const modal  = document.getElementById('payment-modal');

    modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Secure Payment Gateway</h3>
        <button class="btn-close-modal" id="close-pay">&times;</button>
      </div>
      <div class="modal-body">
        <div style="text-align:center;margin-bottom:20px;">
          <p style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">Amount Payable</p>
          <h2 style="font-size:36px;color:var(--success);font-family:var(--font-heading);">₹${amount}</h2>
        </div>
        <div class="payment-tabs">
          <button class="payment-tab-btn active" id="tab-card">💳 Card</button>
          <button class="payment-tab-btn" id="tab-upi">📱 UPI</button>
        </div>

        <!-- Card panel -->
        <div id="panel-card">
          <div class="credit-card-preview">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div class="card-chip"></div>
              <span style="font-weight:800;font-style:italic;font-size:13px;opacity:0.8;">ISLANDER PAY</span>
            </div>
            <div class="card-num-preview" id="card-preview-num">•••• •••• •••• ••••</div>
            <div class="card-meta-preview">
              <div><div style="font-size:9px;opacity:0.6;">CARD HOLDER</div><div id="card-preview-name">YOUR NAME</div></div>
              <div style="text-align:right;"><div style="font-size:9px;opacity:0.6;">EXPIRY</div><div id="card-preview-exp">MM/YY</div></div>
            </div>
          </div>
          <form id="card-form">
            <div class="form-group" style="margin-bottom:12px;"><label>Card Number</label>
              <input type="text" id="inp-num" class="form-input" placeholder="4532 7182 9382 1029" maxlength="19" required></div>
            <div class="form-group" style="margin-bottom:12px;"><label>Card Holder Name</label>
              <input type="text" id="inp-name" class="form-input" placeholder="Name on card" required></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
              <div class="form-group"><label>Expiry</label><input type="text" id="inp-exp" class="form-input" placeholder="MM/YY" maxlength="5" required></div>
              <div class="form-group"><label>CVV</label><input type="password" id="inp-cvv" class="form-input" placeholder="•••" maxlength="3" required></div>
            </div>
            <button type="submit" class="btn-primary">Pay ₹${amount} Securely</button>
          </form>
        </div>

        <!-- UPI panel -->
        <div id="panel-upi" style="display:none;">
          <div class="upi-qr-container">
            <p style="font-size:13px;text-align:center;color:var(--text-secondary);">Scan with Google Pay, PhonePe, or Paytm</p>
            <div class="qr-box">
              <div class="qr-scan-line"></div>
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <rect x="5" y="5" width="26" height="26" fill="#000"/><rect x="10" y="10" width="16" height="16" fill="#fff"/>
                <rect x="69" y="5" width="26" height="26" fill="#000"/><rect x="74" y="10" width="16" height="16" fill="#fff"/>
                <rect x="5" y="69" width="26" height="26" fill="#000"/><rect x="10" y="74" width="16" height="16" fill="#fff"/>
                <rect x="38" y="38" width="24" height="24" fill="#000"/><rect x="43" y="43" width="14" height="14" fill="#fff"/>
                <rect x="5" y="38" width="12" height="12" fill="#000"/>
                <rect x="38" y="5" width="12" height="12" fill="#000"/>
                <rect x="84" y="84" width="12" height="12" fill="#000"/>
                <rect x="52" y="78" width="16" height="16" fill="#000"/>
                <rect x="78" y="52" width="16" height="16" fill="#000"/>
              </svg>
            </div>
            <p style="font-size:13px;font-weight:600;color:var(--warning);">Awaiting payment confirmation...</p>
            <button class="btn-primary" id="upi-simulate">✔ Simulate Successful Payment</button>
          </div>
        </div>
      </div>
    </div>`;

    modal.classList.add('show');

    document.getElementById('close-pay').addEventListener('click', () => modal.classList.remove('show'));

    // Tab switching
    document.getElementById('tab-card').addEventListener('click', () => {
        document.getElementById('tab-card').classList.add('active');
        document.getElementById('tab-upi').classList.remove('active');
        document.getElementById('panel-card').style.display = 'block';
        document.getElementById('panel-upi').style.display  = 'none';
    });
    document.getElementById('tab-upi').addEventListener('click', () => {
        document.getElementById('tab-upi').classList.add('active');
        document.getElementById('tab-card').classList.remove('active');
        document.getElementById('panel-upi').style.display  = 'flex';
        document.getElementById('panel-card').style.display = 'none';
    });

    // Live card preview
    document.getElementById('inp-num').addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g,'');
        e.target.value = v.match(/.{1,4}/g)?.join(' ') || v;
        document.getElementById('card-preview-num').textContent = e.target.value || '•••• •••• •••• ••••';
    });
    document.getElementById('inp-name').addEventListener('input', e => {
        document.getElementById('card-preview-name').textContent = e.target.value.toUpperCase() || 'YOUR NAME';
    });
    document.getElementById('inp-exp').addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g,'');
        if (v.length > 2) e.target.value = v.slice(0,2) + '/' + v.slice(2,4); else e.target.value = v;
        document.getElementById('card-preview-exp').textContent = e.target.value || 'MM/YY';
    });

    document.getElementById('card-form').addEventListener('submit', e => { e.preventDefault(); confirmBooking(); });
    document.getElementById('upi-simulate').addEventListener('click', confirmBooking);
}

function confirmBooking() {
    const modal = document.getElementById('payment-modal');
    modal.classList.remove('show');
    const bus = AppState.activeBooking.bus;
    const seats = AppState.activeBooking.selectedSeats;
    const ticketId = `TKT-${Math.floor(100000 + Math.random()*900000)}`;
    const amount = seats.reduce((s, seat) => s + getSeatFare(bus.category, seat, bus.fare), 0);

    const ticket = {
        ticketId, busId: bus.id, operator: bus.operator, busName: bus.busName,
        category: bus.category,
        from: bus.from, to: bus.to, departureTime: bus.departureTime,
        travelTime: bus.travelTime, date: bus.date,
        seats: [...seats], passengers: [...AppState.activeBooking.passengers],
        permitInfo: { ...AppState.activeBooking.permitInfo },
        totalAmount: amount,
        bookingDate: new Date().toISOString().split('T')[0],
        status: 'CONFIRMED',
        jettyFrom: bus.jettyFrom || '',
        jettyTo: bus.jettyTo || ''
    };

    AppState.bookings.unshift(ticket);
    saveBookingsToStorage();

    const bi = AppState.buses.findIndex(b => b.id === bus.id);
    if (bi > -1) { AppState.buses[bi].bookedSeats.push(...seats); saveBusesToStorage(); }

    AppState.activeBooking = {
        bus: null, selectedSeats: [], passengers: [],
        permitInfo: { idType:'Aadhaar', idNumber:'', islanderCard:'', hasReadGuidelines: false },
        payment: { method:'card', status:'pending' }
    };

    showToast('🎉 Booking confirmed! Ticket issued.', 'success');
    navigateTo('ticket-summary', ticketId);
}

// ── Screen: Ticket Summary ─────────────────────────────────────────────────

function renderTicketSummaryScreen(root, ticketId) {
    const ticket = AppState.bookings.find(t => t.ticketId === ticketId);
    if (!ticket) { navigateTo('search'); return; }
    const cat = ticket.category || 'bus';

    const section = document.createElement('div');
    section.className = 'screen-fade-in container';
    section.innerHTML = `
    <div class="ticket-container">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <button class="btn-secondary" id="btn-tkt-home">← Home</button>
        <button class="btn-primary" id="btn-tkt-print" style="width:auto;padding:10px 22px;">🖨️ Print Ticket</button>
      </div>
      <div class="ticket">
        <div class="ticket-header" style="${cat === 'ferry' ? 'background: linear-gradient(135deg, var(--secondary), #00c8e8);' : ''}">
          <div>
            <div style="font-size:11px;opacity:0.75;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">
              ${cat === 'bus' ? 'Bus Boarding Pass' : 'Marine Boarding Pass'}
            </div>
            <h2>${ticket.operator}</h2>
            <p style="font-size:13px;opacity:0.8;">${ticket.busName}</p>
          </div>
          <div class="ticket-status-stamp">${ticket.status}</div>
        </div>

        <div class="ticket-body">
          <div class="ticket-row">
            <div class="ticket-field">
              <label>Origin</label>
              <span>${ticket.from}</span>
              ${ticket.jettyFrom ? `<br><small style="font-size:10px;color:var(--text-muted);font-weight:normal;">${ticket.jettyFrom}</small>` : ''}
            </div>
            <div class="ticket-field">
              <label>Destination</label>
              <span>${ticket.to}</span>
              ${ticket.jettyTo ? `<br><small style="font-size:10px;color:var(--text-muted);font-weight:normal;">${ticket.jettyTo}</small>` : ''}
            </div>
            <div class="ticket-field"><label>Journey Date</label><span>${formatDate(ticket.date)}</span></div>
          </div>
          <div class="ticket-row">
            <div class="ticket-field"><label>Departure</label><span style="color:var(--primary);">${ticket.departureTime}</span></div>
            <div class="ticket-field"><label>Duration</label><span>${ticket.travelTime}</span></div>
            <div class="ticket-field"><label>Ticket ID</label><span style="font-family:monospace;color:var(--accent);font-size:13px;">${ticket.ticketId}</span></div>
          </div>

          <div class="ticket-cutout-divider"></div>

          <h4 style="margin-bottom:12px;color:var(--primary);">Passenger Details</h4>
          <table class="passenger-table">
            <thead><tr><th>Name</th><th>Age</th><th>Gender</th><th>Seat &amp; Class</th></tr></thead>
            <tbody>
              ${ticket.passengers.map(p => `
                <tr>
                  <td><strong>${p.name}</strong></td>
                  <td>${p.age} yrs</td>
                  <td>${p.gender}</td>
                  <td>
                    <span style="padding:3px 8px;border-radius:4px;background:rgba(0,200,232,0.1);font-weight:700;font-size:12px;">
                      Seat ${p.seatNumber} (${p.seatClass || 'Standard'})
                    </span>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>

          ${cat === 'ferry' ? `
          <div class="alert alert-info" style="margin-top:22px;margin-bottom:0;background:rgba(0,200,232,0.06);border-color:var(--primary);color:var(--primary-hover);">
            <strong>⚓ Port Authority Boarding Manifest</strong><br>
            <span style="font-size:13px;">Emergency Mobile: <strong>${ticket.permitInfo?.idNumber || '—'}</strong> &nbsp;|&nbsp; Status: <strong>${ticket.permitInfo?.islanderCard || 'Indian national'}</strong></span><br>
            <span style="font-size:11px;color:var(--text-muted);">Please report 1 hour before departure at the boarding terminal jetty. Bring original Photo ID. Baggage limit is 25 kg.</span>
          </div>` : (ticket.permitInfo?.idNumber ? `
          <div class="alert alert-warning" style="margin-top:22px;margin-bottom:0;">
            <strong>🛂 ATR Convoy Permit</strong><br>
            <span style="font-size:13px;">ID: <strong>${ticket.permitInfo.idNumber}</strong> &nbsp;|&nbsp; ${ticket.permitInfo.islanderCard === 'Yes' ? 'Islander Resident' : 'General Tourist'}</span><br>
            <span style="font-size:11px;color:var(--text-muted);">Present this code at Jirkatang / Middle Strait security gates.</span>
          </div>` : '')}
        </div>

        <div class="ticket-footer">
          <div style="font-size:13px;color:var(--text-secondary);">
            <p>Fare Paid: <strong>₹${ticket.totalAmount}</strong></p>
            <p style="font-size:11px;margin-top:4px;color:var(--text-muted);">TX: IslanderPay-${Math.floor(1e7+Math.random()*9e7)}</p>
          </div>
          <div class="ticket-qr">
            <svg viewBox="0 0 50 50" width="100%" height="100%">
              <rect x="2" y="2" width="14" height="14" fill="#000"/><rect x="4" y="4" width="10" height="10" fill="#fff"/>
              <rect x="34" y="2" width="14" height="14" fill="#000"/><rect x="36" y="4" width="10" height="10" fill="#fff"/>
              <rect x="2" y="34" width="14" height="14" fill="#000"/><rect x="4" y="36" width="10" height="10" fill="#fff"/>
              <rect x="20" y="20" width="10" height="10" fill="#000"/><rect x="22" y="22" width="6" height="6" fill="#fff"/>
              <rect x="2" y="20" width="6" height="6" fill="#000"/>
              <rect x="42" y="42" width="6" height="6" fill="#000"/>
            </svg>
          </div>
        </div>
      </div>
    </div>`;

    root.appendChild(section);
    document.getElementById('btn-tkt-home').addEventListener('click', () => navigateTo('search'));
    document.getElementById('btn-tkt-print').addEventListener('click', () => window.print());
}

// ── Screen: Booking History ────────────────────────────────────────────────

function renderHistoryScreen(root) {
    const section = document.createElement('div');
    section.className = 'screen-fade-in container';

    if (!AppState.bookings.length) {
        section.innerHTML = `
        <h2 style="margin-bottom:24px;">My Bookings</h2>
        <div class="glass-panel" style="padding:60px;text-align:center;color:var(--text-secondary);">
          <p style="font-size:18px;margin-bottom:20px;">No bookings yet under your profile.</p>
          <button class="btn-primary" style="width:auto;margin:0 auto;" id="btn-h-go">Book Your First Trip</button>
        </div>`;
        root.appendChild(section);
        document.getElementById('btn-h-go').addEventListener('click', () => navigateTo('search'));
        return;
    }

    section.innerHTML = `
    <h2 style="margin-bottom:8px;">My Bookings</h2>
    <p style="color:var(--text-secondary);margin-bottom:24px;">Review upcoming trips and download boarding passes.</p>
    <div class="history-list">
      ${AppState.bookings.map(t => `
        <div class="glass-panel history-card" style="border-left-color:${t.status==='CONFIRMED'?'var(--success)':'var(--danger)'}">
          <div class="history-details">
            <span style="font-size:10px;text-transform:uppercase;color:var(--primary);font-weight:700;letter-spacing:1px;">${t.ticketId}</span>
            <h4>${t.from} → ${t.to}</h4>
            <p>📅 ${formatDate(t.date)} &nbsp;|&nbsp; 🕐 ${t.departureTime} &nbsp;|&nbsp; ${t.operator}</p>
            <p style="margin-top:3px;">Passengers: ${t.passengers.length} &nbsp;|&nbsp; Paid: ₹${t.totalAmount}</p>
          </div>
          <div style="display:flex;gap:10px;flex-shrink:0;">
            <button class="btn-secondary btn-view" data-id="${t.ticketId}" style="padding:8px 16px;font-size:13px;">View Ticket</button>
            ${t.status==='CONFIRMED'?`<button class="btn-secondary btn-cancel" data-id="${t.ticketId}" style="padding:8px 14px;font-size:13px;color:var(--danger);border-color:rgba(239,71,111,0.3);">Cancel</button>`:''}
          </div>
        </div>`).join('')}
    </div>`;

    root.appendChild(section);

    document.querySelectorAll('.btn-view').forEach(b => b.addEventListener('click', e => navigateTo('ticket-summary', e.currentTarget.dataset.id)));
    document.querySelectorAll('.btn-cancel').forEach(b => b.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        if (!confirm(`Cancel booking ${id}?`)) return;
        const ti = AppState.bookings.findIndex(t => t.ticketId === id);
        if (ti > -1) {
            const t = AppState.bookings[ti];
            t.status = 'CANCELLED';
            const bi = AppState.buses.findIndex(b => b.id === t.busId);
            if (bi > -1) { AppState.buses[bi].bookedSeats = AppState.buses[bi].bookedSeats.filter(s => !t.seats.includes(s)); saveBusesToStorage(); }
            saveBookingsToStorage();
            showToast('Ticket cancelled. Refund initiated.', 'warning');
            navigateTo('history');
        }
    }));
}

// ── Screen: ATR Convoy Info ────────────────────────────────────────────────

function renderConvoyScreen(root) {
    const section = document.createElement('div');
    section.className = 'screen-fade-in container';
    section.innerHTML = `
    <div style="text-align:center;margin-bottom:32px;">
      <h2>Andaman Trunk Road (ATR) — Travel Guide</h2>
      <p style="color:var(--text-secondary);max-width:600px;margin:10px auto 0;">Police-escorted convoys are mandatory for passage through the protected Jarawa Tribal Reserve forest on the ATR.</p>
    </div>
    <div class="grid-2col" style="margin-bottom:26px;">
      <div class="glass-panel convoy-info-card">
        <h3 style="color:var(--primary);margin-bottom:14px;">Jirkatang Checkpost (Southbound → North)</h3>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px;">Located 45 km from Port Blair. Must reach 45 minutes before convoy time.</p>
        <table class="data-table">
          <thead><tr><th>Convoy</th><th>Gate Opens</th><th>Baratang ETA</th></tr></thead>
          <tbody>
            ${CONVOY_TIMES.jirkatang.map((t,i) => `
              <tr><td><strong>Convoy #${i+1}</strong></td>
              <td><span style="color:var(--success);font-weight:700;">${t}</span></td>
              <td>${calcArrival(t,'2 hrs')}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="glass-panel convoy-info-card">
        <h3 style="color:var(--primary);margin-bottom:14px;">Middle Strait (Northbound → South)</h3>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px;">Return convoy from Baratang Jetty back towards Port Blair.</p>
        <table class="data-table">
          <thead><tr><th>Convoy</th><th>Gate Opens</th><th>Jirkatang ETA</th></tr></thead>
          <tbody>
            ${CONVOY_TIMES.middleStrait.map((t,i) => `
              <tr><td><strong>Convoy #${i+1}</strong></td>
              <td><span style="color:var(--success);font-weight:700;">${t}</span></td>
              <td>${calcArrival(t,'2 hrs')}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div class="glass-panel" style="padding:28px;">
      <h3 style="color:var(--accent);margin-bottom:20px;">🚨 Jarawa Tribal Reserve — Legal Regulations</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;">
        <div class="guidelines-section">
          <h4 style="color:var(--success);margin-bottom:10px;">✅ What You MUST Do</h4>
          <ul>
            <li>Keep all bus windows and shutters fully closed inside the reserve.</li>
            <li>Carry original Aadhaar / Passport for verification at checkgates.</li>
            <li>Board your bus for the correct convoy slot — no switching allowed.</li>
            <li>Maintain silence and low activity inside the vehicle.</li>
          </ul>
        </div>
        <div class="guidelines-section">
          <h4 style="color:var(--danger);margin-bottom:10px;">🚫 Strictly Prohibited</h4>
          <ul>
            <li><strong>Photography / Videography</strong> of tribals — non-bailable offense.</li>
            <li><strong>Offering food, clothing, or coins</strong> to tribal members.</li>
            <li><strong>Stopping or exiting the vehicle</strong> inside forest limits.</li>
            <li><strong>Overtaking convoy vehicles</strong> inside the reserve.</li>
          </ul>
        </div>
      </div>
    </div>`;
    root.appendChild(section);
}

// ── Screen: Admin Dashboard ────────────────────────────────────────────────

function renderAdminScreen(root) {
    const section = document.createElement('div');
    section.className = 'screen-fade-in container';
    const totalSales = AppState.bookings.reduce((s,b)=>s+b.totalAmount, 0);

    const busFleetCount = AppState.buses.filter(b=>b.category==='bus').length;
    const ferryFleetCount = AppState.buses.filter(b=>b.category==='ferry').length;

    section.innerHTML = `
    <div class="admin-card-header">
      <h2>Agent &amp; Operator Dashboard</h2>
      <button class="btn-primary" id="btn-scroll-form" style="width:auto;padding:10px 20px;">➕ Register Fleet Slot</button>
    </div>
    <div class="admin-stats-row">
      <div class="glass-panel stat-card"><div class="stat-icon">💰</div><div class="stat-info"><h5>Gross Revenue</h5><p>₹${totalSales.toLocaleString()}</p></div></div>
      <div class="glass-panel stat-card"><div class="stat-icon">🎟️</div><div class="stat-info"><h5>Tickets Sold</h5><p>${AppState.bookings.length}</p></div></div>
      <div class="glass-panel stat-card"><div class="stat-icon">🚌</div><div class="stat-info"><h5>Active Fleet</h5><p>${busFleetCount} B / ${ferryFleetCount} F</p></div></div>
      <div class="glass-panel stat-card"><div class="stat-icon">📈</div><div class="stat-info"><h5>Avg Occupancy</h5><p>${AppState.adminMetrics.occupancyRate}%</p></div></div>
    </div>
    <div class="admin-sections-grid">
      <div class="glass-panel" style="padding:24px;overflow-x:auto;">
        <h3 style="margin-bottom:14px;">Recent Transactions</h3>
        ${!AppState.bookings.length ? '<p style="color:var(--text-muted);text-align:center;padding:40px;">No transactions yet.</p>' : `
        <table class="data-table" style="font-size:13px;">
          <thead><tr><th>ID</th><th>Passenger</th><th>Route</th><th>Seats</th><th>Paid</th><th>Status</th></tr></thead>
          <tbody>
            ${AppState.bookings.map(b=>`
              <tr>
                <td><strong style="font-family:monospace;">${b.ticketId}</strong></td>
                <td>${b.passengers[0]?.name||'—'}${b.passengers.length>1?` (+${b.passengers.length-1})`:''}</td>
                <td>${b.category === 'ferry' ? '🚢' : '🚌'} ${b.from} ➔ ${b.to}</td>
                <td>${b.seats.join(', ')}</td>
                <td><strong>₹${b.totalAmount}</strong></td>
                <td style="color:${b.status==='CONFIRMED'?'var(--success)':'var(--danger)'};font-weight:700;">${b.status}</td>
              </tr>`).join('')}
          </tbody>
        </table>`}
      </div>
      <div class="glass-panel" style="padding:24px;" id="bus-form-panel">
        <h3 style="margin-bottom:16px;">Register Fleet slot</h3>
        <form id="add-bus-form">
          <div class="form-group" style="margin-bottom:12px;"><label>Category</label>
            <select id="ab-category" class="form-input" required>
              <option value="bus">🚌 Bus Service</option>
              <option value="ferry">🚢 Ferry/Cruise Service</option>
            </select></div>
          <div class="form-group" style="margin-bottom:12px;"><label>Operator</label>
            <select id="ab-op" class="form-input" required>
              <!-- Populated dynamically -->
            </select></div>
          <div class="form-group" style="margin-bottom:12px;"><label>Route</label>
            <select id="ab-route" class="form-input" required>
              <!-- Populated dynamically -->
            </select></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
            <div class="form-group"><label>Service Class</label>
              <select id="ab-class" class="form-input">
                <!-- Populated dynamically -->
              </select></div>
            <div class="form-group"><label>Base Fare (₹)</label>
              <input type="number" id="ab-fare" class="form-input" placeholder="500" min="10" required></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
            <div class="form-group"><label>Date</label>
              <input type="date" id="ab-date" class="form-input" required></div>
            <div class="form-group"><label>Departure</label>
              <input type="text" id="ab-time" class="form-input" placeholder="07:30 AM" required></div>
          </div>
          <button type="submit" class="btn-primary">Register Slot</button>
        </form>
      </div>
    </div>`;

    root.appendChild(section);

    // Dynamic select options based on Category
    const catSel = document.getElementById('ab-category');
    const opSel  = document.getElementById('ab-op');
    const routeSel = document.getElementById('ab-route');
    const classSel = document.getElementById('ab-class');
    const fareInp = document.getElementById('ab-fare');

    function syncFormOptions() {
        const cat = catSel.value;
        if (cat === 'bus') {
            opSel.innerHTML = BUS_OPERATORS.map(o => `<option>${o.name}</option>`).join('');
            routeSel.innerHTML = MOCK_ROUTES.map(r => `<option value="${r.id}">${r.from} → ${r.to}</option>`).join('');
            classSel.innerHTML = `
              <option value="non-ac">Standard Non-AC</option>
              <option value="ac">Deluxe AC</option>
              <option value="deluxe">Super Luxury Coach</option>
              <option value="electric">Electric Express</option>
            `;
            fareInp.value = 150;
        } else {
            opSel.innerHTML = FERRY_OPERATORS.map(o => `<option>${o.name}</option>`).join('');
            routeSel.innerHTML = MOCK_FERRY_ROUTES.map(r => `<option value="${r.id}">${r.from} → ${r.to}</option>`).join('');
            classSel.innerHTML = `
              <option value="makruzz">Makruzz Cruise Class</option>
              <option value="green-ocean">Green Ocean Open Deck</option>
              <option value="coastal-cruise">Coastal Catamaran Class</option>
            `;
            fareInp.value = 950;
        }
    }

    catSel.addEventListener('change', syncFormOptions);
    syncFormOptions();

    // Set default date for form
    const tom = new Date(); tom.setDate(tom.getDate()+1);
    document.getElementById('ab-date').value = tom.toISOString().split('T')[0];

    document.getElementById('btn-scroll-form').addEventListener('click', () => {
        document.getElementById('bus-form-panel').scrollIntoView({ behavior:'smooth' });
    });

    document.getElementById('add-bus-form').addEventListener('submit', e => {
        e.preventDefault();
        const cat = catSel.value;
        const routeId = routeSel.value;
        const route = cat === 'bus' 
            ? MOCK_ROUTES.find(r => r.id === routeId)
            : MOCK_FERRY_ROUTES.find(r => r.id === routeId);

        const classMap = { 
            'non-ac':'Standard Non-AC', 'ac':'Deluxe AC Express', 'deluxe':'Super Luxury Coach', 'electric':'Electric Green Express',
            'makruzz':'Makruzz High Speed Cruise', 'green-ocean':'Green Ocean Open Deck Cruise', 'coastal-cruise':'Coastal Speed Catamaran'
        };
        const cl = classSel.value;

        AppState.buses.push({
            id: `${cat.toUpperCase()}-ADD-${Date.now()}`,
            category: cat,
            routeId, from: route.from, to: route.to,
            date: document.getElementById('ab-date').value,
            departureTime: document.getElementById('ab-time').value,
            operator: opSel.value,
            busName: classMap[cl], busType: cl,
            rating: 4.5, fare: parseInt(fareInp.value),
            totalSeats: cat === 'bus' ? (cl === 'deluxe' ? 30 : 35) : 80,
            bookedSeats: [], travelTime: route.travelTime, distance: route.distance,
            jettyFrom: route.jettyFrom || '', jettyTo: route.jettyTo || ''
        });
        saveBusesToStorage();
        showToast(`✅ New ${cat === 'bus' ? 'bus' : 'ferry'} registered successfully!`, 'success');
        navigateTo('admin');
    });
}

// ── Utilities ──────────────────────────────────────────────────────────────

function formatDate(str) {
    if (!str) return '';
    const d = new Date(str);
    const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
}

function calcArrival(dep, durStr) {
    try {
        const [time, ampm] = dep.split(' ');
        const [h, mn] = time.split(':').map(Number);
        let hours = h;
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        const dur = parseFloat(durStr);
        const addH = Math.floor(dur);
        const addM = Math.round((dur % 1) * 60);
        let totalH = hours + addH;
        let totalM = mn + addM;
        if (totalM >= 60) { totalH++; totalM -= 60; }
        totalH = totalH % 24;
        const ap = totalH >= 12 ? 'PM' : 'AM';
        let dh = totalH % 12; if (!dh) dh = 12;
        return `${dh}:${String(totalM).padStart(2,'0')} ${ap}`;
    } catch { return 'N/A'; }
}

function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    t.innerHTML = `<span>${icons[type]||'ℹ️'}</span> <span>${msg}</span>`;
    container.appendChild(t);
    setTimeout(() => {
        t.style.animation = 'slideLeft 0.25s ease reverse';
        setTimeout(() => t.remove(), 250);
    }, 4000);
}

// ── Boot ───────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', initApp);
