/* Contact hero: cursor-follow spotlight on the contact cards (pointer devices only). */
(function () {
  'use strict';
  if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  [].forEach.call(document.querySelectorAll('.rs-ct-card'), function (card) {
    var pending = false, x = 0, y = 0;
    card.addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (x - r.left) + 'px');
        card.style.setProperty('--my', (y - r.top) + 'px');
      });
    }, { passive: true });
  });
})();
