# Use path: web app development

**When** — the result is a web application or a change to one: a page, a
component, a route, an API endpoint a browser or client calls.

**Consumer & interface** — an end user in a browser (the rendered page and
its interactions) and, for an API, the client program that calls it (HTTP
request → response). The real interface is the running app over HTTP, not
the source or the bundler output.

**How to drive it in-session:**

- Start the app the way it actually runs (`npm run dev`, the prod build, the
  server process) and drive it against a real port, not a mock.
- For an endpoint: send the real request (`curl`, the test client) and
  assert on status code, headers, and body — drive the 4xx/5xx branches too,
  not only 200.
- For a page or interaction: drive it in a real browser with Playwright
  (headless is fine) — navigate, click, fill, read the rendered DOM and the
  network panel. Prefer a background headless browser.
- Check the browser console for errors after the interaction; a clean render
  with a console exception is not done.
- Assert on what the user sees (rendered text, visible state), not on
  component internals.

**Forks that matter:**

- Empty state vs populated (no records vs a list); first load vs revisit.
- The form's valid submit vs its validation-error branch; the request's
  success vs its auth-failure and not-found branches.
- Slow/failed network (offline, 500 from a dependency) and the app's recovery.
- Viewport differences only when the change is responsive-specific (a
  mechanism fork, not every breakpoint).

**The honest limit:** a headless browser drives structure, behavior, and
network fully — DOM, console, requests, and interaction all observable. What
it cannot settle: visual correctness (layout, spacing, color, does it *look*
right), animation smoothness, and cross-browser rendering beyond the engine
in use. Drive everything above, take a screenshot as partial evidence, then
report the visual qualities unverified — a human or a visual-diff tool owns
them.
