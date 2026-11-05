// Lets iPhones play the homepage video.
// An iPhone asks for a video one small piece at a time, but Cloudflare's plain file hosting
// always sends the whole file, and Safari can refuse to play it. Cloudflare's cache does answer
// those small requests properly, so this script stores the video there and replies from it.
//
// It only runs for the hero video files (see "run_worker_first" in wrangler.jsonc).
// Every other page and file skips it completely.

export default {
  async fetch(request, env) {
    if (request.method !== 'GET') return readyForCache(await env.ASSETS.fetch(request));

    const stored = await caches.default.match(request);
    if (stored) return stored;

    const wholeFile = new Request(request.url);
    const response = readyForCache(await env.ASSETS.fetch(wholeFile));
    if (!response.ok) return response;

    await caches.default.put(wholeFile, response).catch(() => {});
    return (await caches.default.match(request)) ?? readyForCache(await env.ASSETS.fetch(wholeFile));
  },
};

function readyForCache(response) {
  const copy = new Response(response.body, response);
  copy.headers.set('Accept-Ranges', 'bytes');
  copy.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return copy;
}
