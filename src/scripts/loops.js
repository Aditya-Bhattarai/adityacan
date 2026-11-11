// Short silent clips: each one loads and plays only when it scrolls into view, and pauses when it leaves.
// People who asked their device for less motion, or who are saving data, keep the still picture.

const loops = document.querySelectorAll('video[data-loop]');
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const saving = navigator.connection?.saveData || /2g/.test(navigator.connection?.effectiveType ?? '');

if (loops.length && !calm && !saving && 'IntersectionObserver' in window) {
  const watcher = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const video = entry.target;
      // A clip that is hidden on this screen size (width 0) never loads.
      if (entry.isIntersecting && video.offsetWidth > 0) {
        if (!video.src) video.src = video.dataset.src;
        video.play().then(() => video.classList.add('is-playing')).catch(() => {});
      } else if (!video.paused) {
        video.pause();
      }
    }
  }, { rootMargin: '200px' });
  loops.forEach((video) => watcher.observe(video));
}
