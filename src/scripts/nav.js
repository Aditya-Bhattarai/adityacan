// Live Kathmandu timecode (HH:MM:SS:FF at 25 frames a second) and the phone menu.

const clocks = document.querySelectorAll('[data-timecode]');
const pad = (number) => String(number).padStart(2, '0');
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function tick() {
  const now = Date.now();
  const kathmandu = new Date(now + (5 * 60 + 45) * 60000); // GMT+5:45
  const frames = calm ? 0 : Math.floor((now % 1000) / 40);
  const text = `${pad(kathmandu.getUTCHours())}:${pad(kathmandu.getUTCMinutes())}:${pad(kathmandu.getUTCSeconds())}:${pad(frames)}`;
  clocks.forEach((clock) => { clock.textContent = text; });
}

tick();
setInterval(() => {
  if (!document.hidden) tick();
}, calm ? 1000 : 40);

const menu = document.querySelector('[data-menu]');
document.querySelector('[data-menu-open]')?.addEventListener('click', () => menu?.showModal());
document.querySelector('[data-menu-close]')?.addEventListener('click', () => menu?.close());
menu?.addEventListener('click', (event) => {
  if (event.target.closest('a')) menu.close();
});
