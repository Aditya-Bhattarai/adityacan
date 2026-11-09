// Homepage hero: starts the muted loop as soon as the page has loaded, and adds opt-in sound.
const video = document.querySelector('[data-hero-video]');
const soundButton = document.querySelector('[data-hero-sound]');
const still = document.querySelector('.hero__poster');

if (video) {
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Data saver and very slow connections keep the still picture instead of the video.
  const saving = navigator.connection?.saveData || /2g/.test(navigator.connection?.effectiveType ?? '');

  function addSources() {
    if (video.querySelector('source')) return;
    // The poster is the still the page already picked for this screen, so nothing changes until the video plays.
    const stillSrc = still?.currentSrc || still?.src;
    if (stillSrc) video.poster = stillSrc;
    // All three are the same 1080p video. Browsers take the first one they can play:
    // WebM (Chrome, Android, Firefox), then HEVC (iPhone and Mac Safari, half the size), then plain MP4.
    for (const [format, type] of [['webm', 'video/webm'], ['hevc', 'video/mp4; codecs="hvc1"'], ['mp4', 'video/mp4']]) {
      const source = document.createElement('source');
      source.src = video.dataset[format];
      source.type = type;
      video.append(source);
    }
    video.autoplay = true;
    video.load();
  }

  function start() {
    addSources();
    video.play().catch(() => {});
  }

  if (!calm && !saving) {
    // Start once the words, fonts and first pictures are in, so the video never slows the page itself.
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });

    // Some phones hold back a muted video until enough of it is on screen. Try again whenever it comes into view.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting) && video.paused) video.play().catch(() => {});
      }).observe(video);
    }

    // iPhones in Low Power Mode only play after a touch, so the first touch anywhere starts it.
    const nudge = () => { if (video.paused) video.play().catch(() => {}); };
    for (const name of ['touchstart', 'pointerdown', 'keydown']) {
      window.addEventListener(name, nudge, { once: true, passive: true });
    }
  }

  soundButton?.addEventListener('click', () => {
    const turnOn = video.muted;
    video.muted = !turnOn;
    soundButton.textContent = turnOn ? 'MUTE' : 'UNMUTE';
    soundButton.setAttribute('aria-pressed', String(turnOn));
    if (video.paused) start();
  });
}
