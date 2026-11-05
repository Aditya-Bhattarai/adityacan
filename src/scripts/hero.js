// Homepage hero: starts the muted loop after the page has loaded, and adds opt-in sound.
const video = document.querySelector('[data-hero-video]');
const soundButton = document.querySelector('[data-hero-sound]');

if (video) {
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Slow connections and data saver keep the still picture instead of the video.
  const saving = navigator.connection?.saveData || /2g|3g/.test(navigator.connection?.effectiveType ?? '');

  function addSources() {
    if (video.querySelector('source')) return;
    for (const [format, type] of [['webm', 'video/webm'], ['mp4', 'video/mp4']]) {
      const source = document.createElement('source');
      source.src = video.dataset[format];
      source.type = type;
      video.append(source);
    }
    video.load();
  }

  video.addEventListener('playing', () => video.classList.add('is-playing'));

  function start() {
    addSources();
    video.play().catch(() => {});
  }

  if (!calm && !saving) {
    // Wait until the page is ready, so the video never slows the first view.
    const ready = () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 2500 }) : setTimeout(start, 1200));
    if (document.readyState === 'complete') ready();
    else window.addEventListener('load', ready, { once: true });
  }

  soundButton?.addEventListener('click', () => {
    const turnOn = video.muted;
    video.muted = !turnOn;
    soundButton.textContent = turnOn ? 'MUTE' : 'UNMUTE';
    soundButton.setAttribute('aria-pressed', String(turnOn));
    if (video.paused) start();
  });
}
