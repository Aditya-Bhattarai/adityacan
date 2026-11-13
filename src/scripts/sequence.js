// Two small helpers used on Near Mountains.
//
// 1. A clip player: [data-seq] plays a list of short silent clips one after another.
//    It starts by itself when it scrolls into view, and its play button pauses and resumes it.
// 2. A strip you can slide sideways: [data-slide] with arrow buttons.

const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const saving = navigator.connection?.saveData || /2g/.test(navigator.connection?.effectiveType ?? '');

for (const player of document.querySelectorAll('[data-seq]')) {
  const video = player.querySelector('[data-seq-video]');
  const button = player.querySelector('[data-seq-toggle]');
  const fill = player.querySelector('[data-seq-fill]');
  const clips = JSON.parse(player.dataset.seq);
  let at = 0;
  let wanted = !calm && !saving; // plays by itself unless the visitor asked for less motion or data
  let visible = false;

  const paint = () => {
    player.classList.toggle('is-paused', video.paused);
    button?.setAttribute('aria-label', video.paused ? 'Play' : 'Pause');
  };
  const load = (index) => {
    at = (index + clips.length) % clips.length;
    video.src = clips[at];
  };
  const play = () => {
    if (!video.src) load(0);
    video.play().then(() => { video.classList.add('is-playing'); paint(); }).catch(paint);
  };

  video.addEventListener('ended', () => { load(at + 1); if (wanted && visible) play(); });
  video.addEventListener('pause', paint);
  video.addEventListener('timeupdate', () => {
    if (!fill || !video.duration) return;
    fill.style.width = `${(((at + video.currentTime / video.duration) / clips.length) * 100).toFixed(2)}%`;
  });
  button?.addEventListener('click', (event) => {
    event.preventDefault();
    wanted = video.paused;
    if (wanted) play(); else video.pause();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible && wanted) play();
      else if (!visible) video.pause();
    }, { threshold: 0.3 }).observe(player);
  }
  paint();
}

for (const strip of document.querySelectorAll('[data-slide]')) {
  const row = strip.querySelector('[data-slide-row]');
  const step = () => Math.max(240, row.clientWidth * 0.45);
  strip.querySelector('[data-slide-back]')?.addEventListener('click', () => row.scrollBy({ left: -step(), behavior: calm ? 'auto' : 'smooth' }));
  strip.querySelector('[data-slide-on]')?.addEventListener('click', () => row.scrollBy({ left: step(), behavior: calm ? 'auto' : 'smooth' }));
  const mark = () => {
    strip.classList.toggle('at-start', row.scrollLeft < 8);
    strip.classList.toggle('at-end', row.scrollLeft + row.clientWidth > row.scrollWidth - 8);
  };
  row.addEventListener('scroll', mark, { passive: true });
  mark();
}
