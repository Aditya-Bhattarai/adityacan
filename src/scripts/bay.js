// The edit bay on For creators: the timeline plays by itself, one clip after another.
// A video clip plays to its end, a still holds for a few seconds, then the next clip starts.
// Clicking a clip jumps to it and the timeline carries on from there.

const bay = document.querySelector('[data-bay]');

if (bay) {
  const video = bay.querySelector('[data-bay-video]');
  const head = bay.querySelector('[data-bay-head]');
  const buttons = [...bay.querySelectorAll('[data-clip]')];
  const panels = [...bay.querySelectorAll('[data-panel]')];
  const says = [...bay.querySelectorAll('[data-say].say')];
  const kicker = bay.querySelector('[data-bay-kicker]');
  const line = bay.querySelector('[data-bay-line]');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saving = navigator.connection?.saveData || /2g/.test(navigator.connection?.effectiveType ?? '');
  const phone = window.matchMedia('(max-width: 899.98px)').matches;
  // How long a clip that is not a video stays up, in seconds.
  const HOLD = { still: 3.5, thumbs: 7, count: 4.5 };

  // The order the timeline plays in. Phones only show the monitor, so they play the video clips.
  const order = buttons.filter((button) => !phone || button.dataset.kind === 'video');
  let at = 0;
  let timer = 0;
  let visible = false;
  let hovering = false;

  function show(index, play = true) {
    at = (index + order.length) % order.length;
    const button = order[at];
    clearTimeout(timer);
    buttons.forEach((item) => item.classList.toggle('on', item === button));
    panels.forEach((panel) => panel.classList.toggle('on', panel.dataset.panel === button.dataset.clip));
    const say = says.find((item) => item.dataset.say === button.dataset.say);
    says.forEach((item) => item.classList.toggle('on', item === say));
    if (say && kicker && line) { kicker.textContent = say.dataset.kicker; line.textContent = say.dataset.line; }
    if (head) head.style.left = button.dataset.at;

    video.classList.remove('is-playing');
    video.pause();
    if (!play) return;
    if (button.dataset.kind === 'video' && !saving) {
      video.src = button.dataset.src;
      video.play().then(() => video.classList.add('is-playing')).catch(() => { timer = setTimeout(next, 4000); });
    } else if (!calm) {
      timer = setTimeout(next, (HOLD[button.dataset.kind] ?? 4) * 1000);
    }
  }

  function next() {
    // The thumbnails stay up while someone is pointing at them.
    if (hovering && order[at].dataset.kind === 'thumbs') { timer = setTimeout(next, 1500); return; }
    if (visible && !calm) show(at + 1);
  }

  video.addEventListener('ended', next);
  bay.querySelector('.viewer')?.addEventListener('pointerenter', () => { hovering = true; });
  bay.querySelector('.viewer')?.addEventListener('pointerleave', () => { hovering = false; });
  buttons.forEach((button) => button.addEventListener('click', () => show(order.indexOf(button))));

  // Play only while the edit bay is on screen.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible && !calm) show(at);
      else { clearTimeout(timer); video.pause(); }
    }, { threshold: 0.25 }).observe(bay.querySelector('.viewer'));
  }
}
