# RS UV Lite page

Route: `/uv-lite` (served from `uv-lite.html`; `cleanUrls` in vercel.json drops the extension, same as `/rs-invisible-shield`).

Built from `rs-invisible-shield.html`, but fully independent: UV Lite has its own copy of every file it loads, so nothing on `/rs-invisible-shield` can be affected by editing it.

- `css/rs-uv-lite.css`, `rs-uv-lite-automotive.css`, `rs-uv-lite-phase-three.css`
- `js/rs-uv-lite.js`, `rs-uv-lite-automotive.js`, `rs-uv-lite-phase-three.js` (UV Lite variant data hardcoded here), `rs-uv-lite-top-logo.js`
- `assets/uv-lite/` (font, logo, scene and cabin images, GSAP/ScrollTrigger)

The Invisible Shield HTML, CSS, JS and assets are unchanged.

## Content source

All copy and figures come from `RS UV lite shade Card new.pdf`. UV Lite 70: VLT 70 / UV 99 / heat 30. UV Lite 50: VLT 47 / UV 99 / heat 33.

- The card has no infrared figure, so the IR metric is removed from this page (the dual-compare grid also skips rows with no data).
- UV Lite 50 heat rejection is 33% in the card's table but 35% in its donut graphic. The page uses 33%.
- The card says "For architectural use only", so the page avoids car-specific claims and carries that line and the +/-5% batch note in the footer.
- Accent colour `#3dbce7` is sampled from the card's blue.

## Still to supply

- Product image: done (`assets/uv-lite/uv-lite.webp`, from `uvlite.png`).
- Videos: set `data-video-id` (11-character YouTube ID) on the three `.p3-video-frame` elements. Empty IDs are ignored by the existing script, so the play buttons do nothing yet.
- Poster images use the shared `assets/automotive/cabin-*` files, as on Invisible Shield; replace if UV Lite gets its own.
