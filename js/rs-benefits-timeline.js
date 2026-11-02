/* Five-benefits timeline on index.html. Requires gsap + ScrollTrigger (assets/vendor).
   Desktop: section is pinned and the timeline moves horizontally with scroll.
   Mobile: vertical list, items reveal as they enter and the line draws with scroll.
   Reduced motion / no JS: static list (CSS base styles). All state is derived from scroll position, so it reverses. */
(function () {
  var root = document.querySelector('[data-rs-tl]');
  if (!root || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var viewport = root.querySelector('.rs-tl-viewport');
  var track = root.querySelector('.rs-tl-track');
  var items = [].slice.call(root.querySelectorAll('.rs-tl-item'));
  var line = root.querySelector('.rs-tl-line');
  var fill = root.querySelector('.rs-tl-fill');
  var counter = root.querySelector('.rs-tl-count b');
  var NAV = 64; // fixed navbar height (h-16)

  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function setCount(n) { if (counter) counter.textContent = '0' + Math.max(1, n); }

  var mm = gsap.matchMedia();

  // Desktop / tablet landscape: pinned horizontal timeline
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', function () {
    root.classList.add('rs-tl--js', 'rs-tl--h');
    var dist = 0, lineLen = 0, tl = null, LEAD = 320;

    function measure() {
      dist = Math.max(0, track.offsetWidth - viewport.clientWidth);
      lineLen = items[items.length - 1].offsetLeft - items[0].offsetLeft;
      line.style.setProperty('--tl-len', lineLen + 'px');
      return dist;
    }

    function render() {
      // reveal frontier: opens up over the lead-in (only item 01 at first), then holds while the track moves
      var lead = tl ? clamp(tl.time() / LEAD) : 0;
      var reading = (viewport.clientWidth - items[0].offsetWidth * 0.95) * lead - gsap.getProperty(track, 'x');
      var active = 0;
      items.forEach(function (el, i) {
        var on = el.offsetLeft <= reading;
        el.classList.toggle('is-on', on);
        if (on) active = i + 1;
      });
      setCount(active);
      // left edge fade only once the first item has started to scroll away
      viewport.style.setProperty('--tl-fl', clamp(-gsap.getProperty(track, 'x') / 80) * 4 + '%');
      gsap.set(fill, { scaleX: lineLen ? clamp((reading - items[0].offsetLeft) / lineLen) : 0 });
    }

    measure();
    gsap.set(fill, { scaleX: 0, scaleY: 1 });

    // reveal the intro items once the section scrolls into view (reverses on scroll back up)
    ScrollTrigger.create({
      trigger: root, start: 'top 75%',
      onEnter: function () { root.classList.add('is-in'); },
      onLeaveBack: function () { root.classList.remove('is-in'); }
    });

    tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root,
        start: 'top top+=' + NAV,
        end: function () { return '+=' + Math.max(1, Math.round(measure() + LEAD)); },
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true
      },
      onUpdate: render
    });
    tl.to({}, { duration: LEAD });
    tl.to(track, { x: function () { measure(); return -dist; }, duration: function () { return Math.max(1, dist); } });
    render();

    return function () {
      root.classList.remove('rs-tl--js', 'rs-tl--h', 'is-in');
      items.forEach(function (el) { el.classList.remove('is-on'); });
      gsap.set([track, fill], { clearProps: 'all' });
      line.style.removeProperty('--tl-len');
      viewport.style.removeProperty('--tl-fl');
    };
  });

  // Mobile / tablet portrait: vertical, scroll-revealed
  mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', function () {
    root.classList.add('rs-tl--js', 'rs-tl--v', 'is-in');

    function measure() {
      var len = items[items.length - 1].offsetTop - items[0].offsetTop;
      line.style.setProperty('--tl-len', len + 'px');
    }
    measure();
    gsap.set(fill, { scaleY: 0 });

    // one shared reading line (65% down the screen): an item lights up exactly when the line reaches its dot
    var DOT = 10; // dot centre sits ~10px below the item top
    items.forEach(function (el) {
      ScrollTrigger.create({
        trigger: el, start: 'top+=' + DOT + ' 65%',
        onEnter: function () { el.classList.add('is-on'); },
        onLeaveBack: function () { el.classList.remove('is-on'); }
      });
    });
    gsap.to(fill, {
      scaleY: 1, ease: 'none',
      scrollTrigger: {
        trigger: track,
        start: 'top+=' + DOT + ' 65%',
        end: function () { return 'top+=' + (DOT + items[items.length - 1].offsetTop - items[0].offsetTop) + ' 65%'; },
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: measure
      }
    });

    return function () {
      root.classList.remove('rs-tl--js', 'rs-tl--v', 'is-in');
      items.forEach(function (el) { el.classList.remove('is-on'); });
      gsap.set(fill, { clearProps: 'all' });
      line.style.removeProperty('--tl-len');
    };
  });

  // Content above the pin (lazy images) can change page height: re-measure once, debounced
  var intro = document.querySelector('.rs-drive-intro');
  if (intro && 'ResizeObserver' in window) {
    var t;
    new ResizeObserver(function () {
      clearTimeout(t);
      t = setTimeout(function () { ScrollTrigger.refresh(); }, 150);
    }).observe(intro);
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
