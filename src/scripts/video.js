// Swaps a video's poster for the real player, only after a click.
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-video]');
  if (!button) return;

  const player = document.createElement('iframe');
  player.src = button.dataset.video;
  player.title = button.dataset.title || 'Video player';
  player.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
  player.allowFullscreen = true;
  player.style.cssText = `display:block;width:100%;aspect-ratio:${button.style.aspectRatio || '16/9'};border:0;border-radius:6px;background:#000`;
  button.replaceWith(player);
  player.focus();
});
