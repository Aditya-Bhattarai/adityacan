// Rows that move sideways. Add data-row to the row.
// Arrow buttons (data-row-prev, data-row-next) move one card. Phones can also swipe.
// With data-row-auto the row drifts slowly from right to left and loops forever.
// It pauses while someone hovers, taps or tabs into it, and stays still for people who ask for less motion.
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SPEED = 28; // pixels per second

for (const row of document.querySelectorAll('[data-row]')) {
  const box = row.closest('[data-row-box]');
  const gap = () => parseFloat(getComputedStyle(row).columnGap) || 0;
  const step = () => (row.firstElementChild?.getBoundingClientRect().width ?? 300) + gap();

  if (!('rowAuto' in row.dataset) || calm) {
    // A plain row: the arrows scroll it, and wrap around at the ends.
    const move = (direction) => {
      const behavior = calm ? 'auto' : 'smooth';
      const atEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
      const atStart = row.scrollLeft <= 4;
      if (direction > 0 && atEnd) row.scrollTo({ left: 0, behavior });
      else if (direction < 0 && atStart) row.scrollTo({ left: row.scrollWidth, behavior });
      else row.scrollBy({ left: direction * step(), behavior });
    };
    box?.querySelector('[data-row-prev]')?.addEventListener('click', () => move(-1));
    box?.querySelector('[data-row-next]')?.addEventListener('click', () => move(1));
    continue;
  }

  // A looping row: copy the cards once, so the end runs straight into the start.
  const originals = [...row.children];
  for (const card of originals) {
    const copy = card.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.setAttribute('tabindex', '-1');
    copy.querySelectorAll('a, button').forEach((element) => element.setAttribute('tabindex', '-1'));
    row.append(copy);
  }
  const loop = () => row.children[originals.length].offsetLeft - originals[0].offsetLeft;

  let position = row.scrollLeft;
  let target = null; // where an arrow click is heading
  let holdUntil = 0;
  let last = performance.now();
  const hold = (ms) => { holdUntil = performance.now() + ms; };

  const area = box ?? row;
  area.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') hold(Infinity); });
  area.addEventListener('pointerleave', (event) => { if (event.pointerType === 'mouse') hold(600); });
  row.addEventListener('touchstart', () => hold(Infinity), { passive: true });
  row.addEventListener('touchend', () => hold(2500), { passive: true });
  row.addEventListener('wheel', () => hold(2500), { passive: true });
  area.addEventListener('focusin', () => hold(Infinity));
  area.addEventListener('focusout', () => hold(600));

  const arrow = (direction) => {
    position = row.scrollLeft;
    target = position + direction * step();
  };
  box?.querySelector('[data-row-prev]')?.addEventListener('click', () => arrow(-1));
  box?.querySelector('[data-row-next]')?.addEventListener('click', () => arrow(1));

  const onScreen = () => {
    const { top, bottom } = row.getBoundingClientRect();
    return bottom > 0 && top < window.innerHeight;
  };

  function frame(now) {
    const seconds = Math.min(0.1, (now - last) / 1000);
    last = now;
    const width = loop();
    if (target !== null) {
      // Glide to the next card, then carry on drifting.
      const distance = target - position;
      position += distance * Math.min(1, seconds * 8);
      if (Math.abs(distance) < 1) { position = target; target = null; }
    } else if (now < holdUntil) {
      position = row.scrollLeft; // someone is swiping or reading
    } else if (onScreen() && !document.hidden) {
      position += SPEED * seconds;
    }
    if (position >= width) { position -= width; if (target !== null) target -= width; }
    if (position < 0) { position += width; if (target !== null) target += width; }
    row.scrollLeft = position;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
