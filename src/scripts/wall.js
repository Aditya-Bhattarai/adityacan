// The Everything wall: holding a piece, and the filters by chapter and by role.

const wall = document.querySelector('[data-wall]');

if (wall) {
  const pieces = [...wall.querySelectorAll('[data-piece]')];
  const counts = wall.querySelectorAll('[data-count]');
  const empty = wall.querySelector('[data-empty]');
  const chosen = { chapter: 'All', role: 'All' };

  // A click or tap holds the wall on that piece. A click anywhere else lets it move again.
  // (The link inside a held piece still works: it is what opens the piece.)
  document.addEventListener('click', (event) => {
    const piece = event.target.closest('[data-piece]');
    const held = wall.querySelector('.is-held');
    if (event.target.closest('a')) return;
    if (held && held !== piece) held.classList.remove('is-held');
    if (piece) piece.classList.toggle('is-held', piece !== held);
    if (!piece && document.activeElement?.closest?.('[data-piece]')) document.activeElement.blur();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    wall.querySelector('.is-held')?.classList.remove('is-held');
    if (document.activeElement?.closest?.('[data-piece]')) document.activeElement.blur();
  });

  function apply() {
    let shown = 0;
    for (const piece of pieces) {
      const chapterMatches = chosen.chapter === 'All' || piece.dataset.chapter === chosen.chapter;
      const roleMatches = chosen.role === 'All' || piece.dataset.roles.split('|').includes(chosen.role);
      piece.hidden = !(chapterMatches && roleMatches);
      // Each piece is on the wall twice so it can loop. Only the first copy is counted.
      if (!piece.hidden && !piece.classList.contains('dup')) shown += 1;
    }
    const filtered = chosen.chapter !== 'All' || chosen.role !== 'All';
    wall.classList.toggle('is-filtered', filtered);
    counts.forEach((count) => { count.textContent = String(shown); });
    if (empty) empty.hidden = shown > 0;
    if (filtered) window.scrollTo({ top: wall.offsetTop });
  }

  wall.querySelector('[data-filters]')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    chosen[button.dataset.filter] = button.dataset.value;
    button.parentElement.querySelectorAll('[data-filter]').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip === button));
    });
    apply();
  });
}
