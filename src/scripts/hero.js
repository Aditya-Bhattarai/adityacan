// Homepage hero: starts the muted loop as soon as the page opens, and adds opt-in sound.
const video = document.querySelector('[data-hero-video]');
const soundButton = document.querySelector('[data-hero-sound]');
const still = document.querySelector('.hero__poster');

if (video) {
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Data saver and very slow connections keep the still picture instead of the video.
  const saving = navigator.connection?.saveData || /2g/.test(navigator.connection?.effectiveType ?? '');

  // On phones the loop starts at 3.3 seconds, the first face shot, to match the phone still.
  // The opening mountain shot is mostly sky and looks empty under the title card. It still plays later in the loop.
  const phoneStart = window.matchMedia('(max-width: 700px)').matches ? 3.3 : 0;
  if (phoneStart) video.addEventListener('loadedmetadata', () => { video.currentTime = phoneStart; }, { once: true });

  function addSources() {
    if (video.querySelector('source')) return;
    // The poster is the still the page already picked for this screen, so nothing changes until the video plays.
    if (still?.currentSrc) video.poster = still.currentSrc;
    for (const [format, type] of [['webm', 'video/webm'], ['mp4', 'video/mp4']]) {
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
    start();

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
