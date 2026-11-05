// Moves the dividing line on the before/after colour slider.
document.querySelectorAll('[data-grade]').forEach((slider) => {
  const input = slider.querySelector('input');
  input.addEventListener('input', () => {
    slider.style.setProperty('--position', `${input.value}%`);
  });
});
