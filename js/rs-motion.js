/* RS Motion layer - shared premium animation system (all pages).
   <script src="js/rs-motion.js" data-mode="lite"> = landing pages that already run their own
   scroll animation: only the non-invasive effects (progress bar, glow, shine) are applied. */
(function () {
  'use strict';
  var D = document, R = D.documentElement, cs = D.currentScript;
  var lite = !!(cs && cs.getAttribute('data-mode') === 'lite');
  var mq = function (q) { return !!(window.matchMedia && matchMedia(q).matches); };
  var reduce = mq('(prefers-reduced-motion: reduce)');
  var fine = mq('(hover: hover) and (pointer: fine)');
  var narrow = mq('(max-width: 700px)');
  var ready = function () { R.classList.add('rs-mo-ready'); };

  if (reduce || !('IntersectionObserver' in window)) { ready(); return; }

  function boot() {
    R.classList.add('rs-mo');
    progress();
    if (!lite) { reveal(); parallax(); aura(); }
    if (fine) glow();
    shine();
  }

  /* ---------- helpers ---------- */
  function raf(fn) { var q = false; return function () { if (q) return; q = true; requestAnimationFrame(function () { q = false; fn(); }); }; }
  // content inside a horizontal scroller can never meet a vertical-scroll observer
  function inHScroll(el) {
    for (var n = el.parentElement, i = 0; n && n !== D.body && i < 10; n = n.parentElement, i++) {
      var ox = getComputedStyle(n).overflowX;
      if ((ox === 'auto' || ox === 'scroll') && n.scrollWidth > n.clientWidth + 2) return true;
    }
    return false;
  }
  function visible(el) { return !!(el.getClientRects && el.getClientRects().length); }
  function isStatic(el) { return getComputedStyle(el).position === 'static'; }

  /* ---------- scroll progress ---------- */
  function progress() {
    var bar = D.createElement('div'); bar.className = 'rs-mo-progress'; bar.setAttribute('aria-hidden', 'true'); D.body.appendChild(bar);
    var upd = raf(function () {
      var h = R.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0) + ')';
    });
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  }

  /* ---------- scroll reveal + masked headline ---------- */
  var EXCLUDE = '#navbar, header, nav, [data-rs-tl], .rs-rail, .rs-drive-intro, .reveal, [class*="animate-"], .rs-wa-float, [data-rs-no]';
  var SEL = [
    'main h2', 'main h3', 'main h4', 'main p', 'main img', 'main picture', 'main table', 'main form',
    'main .grid > *', 'main a[class*="rounded-full"]', 'main button', 'main .rs-eyebrow', 'main .rs-wf-eyebrow',
    'main .rs-cta', 'main .rs-wf-photo', 'main .rs-wf-stats > *', 'main .rs-strip-inner > *', 'main .rs-feature',
    'main .rs-pt-benefit', 'main .rs-kb-card', 'main .gv-card', 'main [class*="rounded-xl"][class*="border"]',
    'main [class*="rounded-2xl"][class*="border"]', '.rs-footer-inner > *', '.rs-footer-bottom'
  ].join(',');

  function reveal() {
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; }).sort(function (a, b) {
        return (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left);
      });
      batch.forEach(function (en, i) { io.unobserve(en.target); play(en.target, Math.min(i, 6) * 85); });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.01 });

    // headline: split into masked words unless it uses gradient-clipped text (would break the clip)
    var h1 = D.querySelector('main h1');
    var split = null;
    if (h1 && visible(h1) && !h1.matches(EXCLUDE)) {
      var clipped = [h1].concat([].slice.call(h1.querySelectorAll('*'))).some(function (n) {
        var s = getComputedStyle(n); return (s.webkitBackgroundClip || s.backgroundClip) === 'text';
      });
      if (!clipped) { splitWords(h1); h1.classList.add('rs-split'); split = h1; io.observe(h1); }
    }

    var cands = [].slice.call(D.querySelectorAll(SEL)).filter(function (el) {
      return el !== split && !el.matches(EXCLUDE) && !el.closest(EXCLUDE) && !el.closest('h1') && visible(el) && !inHScroll(el) && getComputedStyle(el).position !== 'fixed';
    });
    // long text blocks (legal pages etc.): keep headings animated, leave bodies of text-heavy sections alone
    cands = cands.filter(function (el) {
      if (el.tagName !== 'P') return true;
      var sec = el.closest('section') || el.closest('main');
      return sec.querySelectorAll('p').length <= 6;
    });
    // animate outermost blocks only
    cands.forEach(function (el) { el.setAttribute('data-rs-c', ''); });
    cands = cands.filter(function (el) { return !(el.parentElement && el.parentElement.closest('[data-rs-c]')); });
    [].forEach.call(D.querySelectorAll('[data-rs-c]'), function (el) { el.removeAttribute('data-rs-c'); });

    var y = narrow ? 18 : 30;
    cands.forEach(function (el) {
      el.style.setProperty('--rs-y', y + 'px');
      if (/^(IMG|PICTURE)$/.test(el.tagName)) el.classList.add('rs-img');
      el.classList.add('rs-pre'); io.observe(el);
    });
    // never leave anything hidden if the observer stalls (e.g. print)
    addEventListener('beforeprint', function () { [].forEach.call(D.querySelectorAll('.rs-pre'), function (el) { el.classList.remove('rs-pre'); }); });
  }

  function play(el, delay) {
    if (el.classList.contains('rs-split')) { el.classList.add('rs-hin'); return; }
    el.style.setProperty('--rs-d', delay + 'ms');
    el.classList.remove('rs-pre'); el.classList.add('rs-in');
    el.addEventListener('animationend', function done(ev) {
      if (ev.target !== el) return;
      el.removeEventListener('animationend', done);
      el.classList.remove('rs-in', 'rs-img');
      el.style.removeProperty('--rs-d'); el.style.removeProperty('--rs-y');
    });
  }

  function splitWords(root) {
    var idx = 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          if (!c.textContent.trim()) return;
          var frag = D.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(D.createTextNode(part)); return; }
            var w = D.createElement('span'), i = D.createElement('span');
            w.className = 'rs-w'; i.className = 'rs-wi'; i.style.setProperty('--i', idx++); i.textContent = part;
            w.appendChild(i); frag.appendChild(w);
          });
          c.parentNode.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(root);
  }

  /* ---------- parallax on hero media ---------- */
  function parallax() {
    if (narrow) return;
    var items = [].slice.call(D.querySelectorAll('.rs-hero-video, .rs-wf-photo img')).filter(visible);
    if (!items.length) return;
    items.forEach(function (el) { el.setAttribute('data-rs-par', ''); });
    var upd = raf(function () {
      var vh = innerHeight;
      items.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var off = (r.top + r.height / 2 - vh / 2) * -0.07;
        el.style.setProperty('--rs-py', off.toFixed(1) + 'px');
      });
    });
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  }

  /* ---------- ambient aura behind the first hero ---------- */
  function aura() {
    var hero = D.querySelector('main > section');
    if (!hero || hero.querySelector('video, canvas') || !visible(hero)) return;
    if (isStatic(hero)) hero.style.position = 'relative';
    var a = D.createElement('rs-aura'); a.setAttribute('aria-hidden', 'true'); hero.appendChild(a);
  }

  /* ---------- cursor-follow glow on cards ---------- */
  function glow() {
    var cards = [].slice.call(D.querySelectorAll([
      '.gv-card', '.rs-pt-benefit', '.rs-kb-card', '.rs-feature',
      'main [class*="rounded-xl"][class*="border"]', 'main [class*="rounded-2xl"][class*="border"]'
    ].join(','))).filter(function (el) { return visible(el) && !/^(A|BUTTON|INPUT|TEXTAREA|SELECT|IMG)$/.test(el.tagName) && !el.closest('[data-rs-tl]'); });
    cards.forEach(function (el) {
      if (isStatic(el)) el.style.position = 'relative';
      el.setAttribute('data-rs-glow', ''); el.appendChild(D.createElement('rs-glow'));
    });
    if (!cards.length) return;
    var last = null, pend = false;
    D.addEventListener('pointermove', function (e) {
      var host = e.target.closest && e.target.closest('[data-rs-glow]');
      if (!host) return; last = { host: host, x: e.clientX, y: e.clientY };
      if (pend) return; pend = true;
      requestAnimationFrame(function () {
        pend = false; var r = last.host.getBoundingClientRect();
        last.host.style.setProperty('--mx', (last.x - r.left) + 'px'); last.host.style.setProperty('--my', (last.y - r.top) + 'px');
      });
    }, { passive: true });
  }

  /* ---------- shine sweep on primary buttons ---------- */
  function shine() {
    [].forEach.call(D.querySelectorAll('.rs-cta, .rs-nav-cta, a[class*="bg-red-"][class*="rounded-full"], button[type="submit"], .gv-cta'), function (el) {
      if (!visible(el) || el.hasAttribute('data-rs-shine')) return;
      var d = getComputedStyle(el).display;
      if (d === 'inline') return;
      if (isStatic(el)) el.style.position = 'relative';
      el.style.overflow = 'hidden';
      el.setAttribute('data-rs-shine', ''); el.appendChild(D.createElement('rs-sh'));
    });
  }

  /* ---------- run (after all helpers/constants above are defined) ---------- */
  try { boot(); }
  catch (e) {
    if (window.console) console.warn('rs-motion fallback:', e);
    [].forEach.call(D.querySelectorAll('.rs-pre'), function (el) { el.classList.remove('rs-pre'); });
  }
  ready();
})();
