# RS Invisible Shield preview

Open /rs-invisible-shield.html through any static HTTP server rooted at this project. The page requires no build step. Existing routes and the existing landing page are untouched.

## Structure

- rs-invisible-shield.html: accessible markup and static fallback.
- css/rs-invisible-shield.css: isolated .rs-shield styles.
- js/rs-invisible-shield.js: intro, comparison input, scroll story and motion preferences.
- js/rs-top-logo.js: fixed top-left RS logo (links to rswindowfilm.com) that hides on scroll down and returns on scroll up.
- assets/invisible-shield/: locally served scene, font, logo and GSAP dependencies. Asset README contains generation prompt and license provenance.

The opening runs once per page load, approximately 4.5 seconds. Horizontal drag, range keyboard controls or scrolling can end it early. The scroll story pins for twice the stage height. Returning to the top preserves the comparison value. Reduced-motion mode skips the cinematic and pinning. JavaScript failure leaves the brand and benefits readable.

## Validation

Existing npm run build passed (Browserslist prints a stale-data advisory). Generated changes to the unrelated shared CSS were restored. Browser checks used installed Microsoft Edge through Playwright.

Passed: 390x844, 360x640, 430x932, 844x390 and 1440x900; no horizontal overflow or mobile text collisions; timed film sweep; keyboard Home/End/arrows; mouse dragging; touch dragging and vertical swiping; pinned story and reverse restoration; early scroll interruption; live reduced-motion changes; JavaScript disabled; blocked GSAP; delayed and failed image loads. No page JavaScript errors in these tests.

640px scene: 24,838 bytes AVIF, 45,508 bytes WebP. Largest-source initial resources total approximately 159 KiB with gzip for text/fonts, below the 600 KB goal. This is a resource-size calculation, not a real-device network benchmark. Safari/iOS and physical-device frame rates have not been verified.
