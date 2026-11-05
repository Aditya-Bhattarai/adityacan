// Rows that move sideways. Add data-row to the row.
// Phones already swipe. This adds mouse dragging, arrow buttons (data-row-prev, data-row-next)
// and, with data-row-auto, a slow move on its own that stops while someone is using the row.
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

for (const row of document.querySelectorAll('[data-row]')) {
  const box = row.closest('[data-row-box]');
  const gap = () => parseFloat(getComputedStyle(row).columnGap) || 0;
  const step = () => (row.firstElementChild?.getBoundingClientRect().width ?? 300) + gap();
  const atEnd = () => row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
  const atStart = () => row.scrollLeft <= 4;

  function move(direction) {
    const behavior = calm ? 'auto' : 'smooth';
    if (direction > 0 && atEnd()) row.scrollTo({ left: 0, behavior });
    else if (direction < 0 && atStart()) row.scrollTo({ left: row.scrollWidth, behavior });
    else row.scrollBy({ left: direction * step(), behavior });
  }

  box?.querySelector('[data-row-prev]')?.addEventListener('click', () => move(-1));
  box?.querySelector('[data-row-next]')?.addEventListener('click', () => move(1));

  // Drag with a mouse. A drag should never open the card it started on.
  let dragging = false;
  let moved = false;
  let startX = 0;
  let startLeft = 0;
  row.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dragging = true;
    moved = false;
    startX = event.clientX;
    startLeft = row.scrollLeft;
  });
  window.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const distance = event.clientX - startX;
    if (Math.abs(distance) > 4) moved = true;
    if (moved) row.scrollLeft = startLeft - distance;
  });
  window.addEventListener('pointerup', () => { dragging = false; });
  row.addEventListener('click', (event) => {
    if (moved) event.preventDefault();
    moved = false;
  }, true);
  row.addEventListener('dragstart', (event) => event.preventDefault());

  if ('rowAuto' in row.dataset && !calm) {
    let waitUntil = 0;
    const wait = () => { waitUntil = Date.now() + 8000; };
    for (const name of ['pointerenter', 'pointerdown', 'touchstart', 'focusin', 'wheel']) {
      (box ?? row).addEventListener(name, wait, { passive: true });
    }
    const onScreen = () => {
      const { top, bottom } = row.getBoundingClientRect();
      return top < window.innerHeight * 0.8 && bottom > window.innerHeight * 0.2;
    };
    setInterval(() => {
      if (onScreen() && !dragging && !document.hidden && Date.now() > waitUntil) move(1);
    }, 4000);
  }
}
