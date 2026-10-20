/* Scales the page to the screen, fills it from config.js, runs the countdown and the intro. */
const $ = id => document.getElementById(id);
const all = selector => document.querySelectorAll(selector);

history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ---------- scale the 1366px-wide design to the phone ---------- */
const page = $('page');
const fit = () => page.style.zoom = page.parentElement.clientWidth / 1366;
fit();
addEventListener('resize', fit);

/* ---------- names ---------- */
const { groom, bride } = CONFIG;
const couple = `${groom.first} & ${bride.first}`;

all('.i1').forEach(el => el.textContent = groom.first[0]);
all('.i2').forEach(el => el.textContent = bride.first[0]);
$('groomFirst').textContent = groom.first;
$('groomLast').textContent = groom.last;
$('brideFirst').textContent = bride.first;
$('brideLast').textContent = bride.last;

/* ---------- venue, date, time ---------- */
const when = new Date(CONFIG.date);
const show = options => when.toLocaleString('en-GB', { timeZone: CONFIG.timeZone, ...options });
const day = Number(show({ day: 'numeric' }));
const suffix = (day % 10 === 1 && day !== 11) ? 'st'
             : (day % 10 === 2 && day !== 12) ? 'nd'
             : (day % 10 === 3 && day !== 13) ? 'rd' : 'th';

$('venue').textContent = CONFIG.venue;
$('area').textContent = CONFIG.area;
$('date').innerHTML = `${day}<sup>${suffix}</sup> ${show({ month: 'long' })} ${show({ year: 'numeric' })}`;
$('weekday').textContent = show({ weekday: 'long' });
$('time').textContent = when.toLocaleTimeString('en-US', { timeZone: CONFIG.timeZone, hour: 'numeric', minute: '2-digit' }).replace(/\s/, '');

/* ---------- links ---------- */
$('mapLink').href = CONFIG.mapUrl;
$('rsvp').href = `https://wa.me/${CONFIG.rsvpPhone}?text=` + encodeURIComponent(CONFIG.rsvpMessage.replace('{couple}', couple));

/* ---------- countdown ---------- */
function setUnit(id, value) {
  const el = $(id), text = String(value).padStart(2, '0');
  if (el.textContent === text) return;
  el.textContent = text;
  el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
}

const timer = setInterval(tick, 1000);
tick();

function tick() {
  const left = when - Date.now();
  if (left <= 0) {
    clearInterval(timer);
    $('countdown').innerHTML = '<p class="today">Today is the day!</p>';
    return;
  }
  setUnit('cd-d', Math.floor(left / 864e5));
  setUnit('cd-h', Math.floor(left / 36e5) % 24);
  setUnit('cd-m', Math.floor(left / 6e4) % 60);
  setUnit('cd-s', Math.floor(left / 1e3) % 60);
}

/* ---------- intro: tap to open ---------- */
const gate = $('gate');
gate.addEventListener('click', () => {
  Music.start();
  gate.classList.add('open');
  document.body.classList.replace('locked', 'opened');
  setTimeout(() => gate.remove(), 2200);
  setTimeout(startReveal, 700);
}, { once: true });

// the floating ♪ button and tapping the singer both play / pause the music
$('musicBtn').addEventListener('click', Music.toggle);
document.querySelector('.tap-area').addEventListener('click', Music.toggle);

/* ---------- glide things in as they scroll into view ---------- */
function startReveal() {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  all('.reveal').forEach(el => io.observe(el));
}
