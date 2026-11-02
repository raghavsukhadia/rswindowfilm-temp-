(function () {
  var el = document.querySelector('.rs-wa-float');
  if (!el) return;
  var KEY = 'rsWaPos', startX, startY, baseX, baseY, moved = false, dragging = false;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function place(x, y) {
    var w = el.offsetWidth, h = el.offsetHeight;
    x = clamp(x, 0, window.innerWidth - w);
    y = clamp(y, 0, window.innerHeight - h);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    return { x: x, y: y };
  }

  try {
    var saved = JSON.parse(localStorage.getItem(KEY));
    if (saved) place(saved.x, saved.y);
  } catch (e) {}

  el.style.touchAction = 'none';
  el.setAttribute('draggable', 'false');

  el.addEventListener('pointerdown', function (e) {
    var r = el.getBoundingClientRect();
    startX = e.clientX; startY = e.clientY; baseX = r.left; baseY = r.top;
    moved = false; dragging = true;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - startX, dy = e.clientY - startY;
    if (!moved && Math.abs(dx) + Math.abs(dy) < 6) return;
    moved = true;
    el.style.animation = 'none';
    el.style.cursor = 'grabbing';
    place(baseX + dx, baseY + dy);
  });
  function end() {
    if (!dragging) return;
    dragging = false;
    el.style.cursor = '';
    if (moved) {
      var r = el.getBoundingClientRect();
      try { localStorage.setItem(KEY, JSON.stringify({ x: r.left, y: r.top })); } catch (e) {}
    }
  }
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  // a drag must not open WhatsApp
  el.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } });
  window.addEventListener('resize', function () {
    var r = el.getBoundingClientRect();
    if (el.style.left) place(r.left, r.top);
  });
})();
