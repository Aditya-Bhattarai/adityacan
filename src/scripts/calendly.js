// Loads the Calendly calendar only when someone scrolls to it, so the page stays fast.
const holder = document.querySelector('[data-calendly]');

if (holder) {
  function load() {
    const widget = document.createElement('div');
    widget.className = 'calendly-inline-widget';
    widget.dataset.url = holder.dataset.calendly;
    holder.replaceChildren(widget);

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.append(script);
  }

  const watcher = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      watcher.disconnect();
      load();
    }
  }, { rootMargin: '200px' });

  watcher.observe(holder);
}
