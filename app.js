// Giờ cưới: 11h00 thứ Bảy 28/11/2026, giờ Việt Nam (UTC+7)
const WEDDING = new Date('2026-11-28T11:00:00+07:00').getTime();
const LIVE_WINDOW = 6 * 3600 * 1000; // coi là "đang diễn ra" trong 6 giờ

const $ = id => document.getElementById(id);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Đếm ngược ----------
const els = { d: $('d'), h: $('h'), m: $('m'), s: $('s') };
const statusEl = $('status');

function setNum(el, value) {
    const text = String(value).padStart(2, '0');
    if (el.textContent === text) return;
    el.textContent = text;
    if (!reduced) {
        el.classList.remove('tick');
        void el.offsetWidth; // chạy lại animation
        el.classList.add('tick');
    }
}

function update() {
    const now = Date.now();
    const total = Math.floor(Math.max(0, WEDDING - now) / 1000);
    setNum(els.d, Math.floor(total / 86400));
    setNum(els.h, Math.floor(total % 86400 / 3600));
    setNum(els.m, Math.floor(total % 3600 / 60));
    setNum(els.s, total % 60);

    if (now < WEDDING) {
        statusEl.textContent = 'Còn lại đến Lễ Thành Hôn';
        statusEl.classList.remove('is-live');
    } else if (now < WEDDING + LIVE_WINDOW) {
        statusEl.textContent = 'Hôm nay là ngày cưới!';
        statusEl.classList.add('is-live');
    } else {
        statusEl.textContent = 'Cảm ơn mọi người đã đến chung vui!';
        statusEl.classList.add('is-live');
    }
}
update();
setInterval(update, 1000);

// ---------- Slide ảnh ----------
const slides = [...document.querySelectorAll('.slide')];
const dotsBox = $('dots');
const INTERVAL = 6000;
let current = 0;
let timer = null;

slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Ảnh ' + (i + 1));
    b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    b.addEventListener('click', () => { go(i); restart(); });
    dotsBox.appendChild(b);
});

function go(n) {
    const target = (n + slides.length) % slides.length;
    if (target === current) return;
    const prev = slides[current];
    const next = slides[target];
    current = target;
    prev.classList.remove('is-active');
    prev.classList.add('is-leaving');
    setTimeout(() => prev.classList.remove('is-leaving'), 1700);
    next.classList.remove('is-leaving');
    next.classList.add('is-active');
    [...dotsBox.children].forEach((b, i) => b.setAttribute('aria-selected', i === current ? 'true' : 'false'));
}
function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(current + 1), INTERVAL);
}
restart();
document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(timer); else restart();
});

// ---------- Cánh hoa rơi ----------
(function petals() {
    if (reduced) return;
    const box = $('petals');
    const colors = ['#c8283a', '#e04a5b', '#f2a0a8', '#b31b2b', '#e2b455'];
    for (let i = 0; i < 16; i++) {
        const p = document.createElement('i');
        const size = 10 + Math.random() * 12;
        p.className = 'petal';
        p.style.left = Math.random() * 100 + '%';
        p.style.width = size + 'px';
        p.style.height = size * 1.3 + 'px';
        p.style.background = colors[i % colors.length];
        p.style.setProperty('--t', (10 + Math.random() * 8).toFixed(1) + 's');
        p.style.setProperty('--dl', (Math.random() * 10).toFixed(1) + 's');
        p.style.setProperty('--x', (30 + Math.random() * 60).toFixed(0) + 'px');
        box.appendChild(p);
    }
})();

// ---------- Nhạc: tự phát ngay khi mở trang ----------
// Trình duyệt thường chặn tự phát khi chưa có thao tác. Nếu bị chặn, nhạc sẽ
// phát ở lần chạm / cuộn / bấm phím đầu tiên của người xem.
const audio = $('audio');
const musicBtn = $('music');

function setPlaying(on) {
    musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    musicBtn.setAttribute('aria-label', on ? 'Tắt nhạc' : 'Bật nhạc');
}
audio.addEventListener('play', () => setPlaying(true));
audio.addEventListener('pause', () => setPlaying(false));

const unlockEvents = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'];
function removeUnlock() {
    unlockEvents.forEach(e => window.removeEventListener(e, unlock, true));
}
function unlock(ev) {
    if (ev.target === musicBtn || musicBtn.contains(ev.target)) return; // nút nhạc tự xử lý
    audio.play().then(removeUnlock).catch(() => {});
}
function tryAutoplay() {
    audio.play().catch(() => {
        unlockEvents.forEach(e => window.addEventListener(e, unlock, true));
    });
}
tryAutoplay();

musicBtn.addEventListener('click', () => {
    removeUnlock();
    if (audio.paused) audio.play().catch(() => {}); else audio.pause();
});
