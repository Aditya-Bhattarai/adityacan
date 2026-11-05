// Work page filters: by chapter and by role. Also updates the project count.
const cards = [...document.querySelectorAll('[data-card]')];
const countLabel = document.querySelector('[data-count]');
const emptyMessage = document.querySelector('[data-empty]');
const chosen = { chapter: 'All', role: 'All' };

function apply() {
  let shown = 0;
  for (const card of cards) {
    const chapterMatches = chosen.chapter === 'All' || card.dataset.chapter === chosen.chapter;
    const roleMatches = chosen.role === 'All' || card.dataset.roles.split('|').includes(chosen.role);
    card.hidden = !(chapterMatches && roleMatches);
    if (!card.hidden) shown += 1;
  }
  countLabel.textContent = String(shown).padStart(2, '0');
  emptyMessage.hidden = shown > 0;
}

document.querySelector('[data-filters]')?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  chosen[button.dataset.filter] = button.dataset.value;
  button.parentElement.querySelectorAll('[data-filter]').forEach((chip) => {
    chip.setAttribute('aria-pressed', String(chip === button));
  });
  apply();
});
