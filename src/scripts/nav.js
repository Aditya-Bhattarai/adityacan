// Live Kathmandu timecode (HH:MM:SS:FF at 25 frames a second), the sun and moon dial, and the phone menu.

const clocks = document.querySelectorAll('[data-timecode]');
const dial = document.querySelector('[data-dial]');
const pad = (number) => String(number).padStart(2, '0');
// Phones show the clock without the frame counter (as in the design), so it ticks once a second there.
const small = window.matchMedia('(max-width: 899.98px)').matches;
const calm = small || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function kathmanduNow() {
  return new Date(Date.now() + (5 * 60 + 45) * 60000); // GMT+5:45
}

function tick() {
  const kathmandu = kathmanduNow();
  const frames = calm ? 0 : Math.floor((Date.now() % 1000) / 40);
  const clock = `${pad(kathmandu.getUTCHours())}:${pad(kathmandu.getUTCMinutes())}:${pad(kathmandu.getUTCSeconds())}`;
  const text = small ? clock : `${clock}:${pad(frames)}`;
  clocks.forEach((clock) => { clock.textContent = text; });
}

// The dial is a clock face of the whole day: 06:00 on the left, noon at the top, 18:00 on the right.
// By day the dot is the gold sun above the line. By night it is the pale moon below it.
function turnDial() {
  if (!dial) return;
  const kathmandu = kathmanduNow();
  const hours = kathmandu.getUTCHours() + kathmandu.getUTCMinutes() / 60;
  const angle = ((hours - 6) / 24) * Math.PI * 2;
  dial.setAttribute('cx', (14 - Math.cos(angle) * 10.5).toFixed(1));
  dial.setAttribute('cy', (14 - Math.sin(angle) * 10.5).toFixed(1));
  dial.setAttribute('fill', hours >= 6 && hours < 18 ? '#E8B23A' : '#D9DCE4');
}

tick();
turnDial();
setInterval(() => {
  if (!document.hidden) tick();
}, calm ? 1000 : 40);
setInterval(turnDial, 60000);

const menu = document.querySelector('[data-menu]');
document.querySelector('[data-menu-open]')?.addEventListener('click', () => menu?.showModal());
document.querySelector('[data-menu-close]')?.addEventListener('click', () => menu?.close());
menu?.addEventListener('click', (event) => {
  if (event.target.closest('a')) menu.close();
});
