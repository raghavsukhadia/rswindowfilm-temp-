/* Phase 3: normal document flow, no ScrollTrigger. Reveal-on-scroll, priority-row selection, family preview, lazy YouTube embed. */
(() => {
'use strict';
const root = document.querySelector('.phase-three');
if(!root) return;

const revealEls = [...document.querySelectorAll('.reveal')];
if('IntersectionObserver' in window){
 const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
   if(entry.isIntersecting){ entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
  });
 // Positive bottom margin: start revealing an item before it reaches the visible viewport,
 // so the 0.6s fade is already finished by the time the user actually scrolls to it. A
 // negative margin here previously delayed the trigger, letting a fast scroll pass an item
 // before its fade-in completed (looked like a blank frame).
 }, {rootMargin:'0px 0px 200px 0px', threshold:0});
 revealEls.forEach(el => io.observe(el));
} else {
 revealEls.forEach(el => el.classList.add('is-visible'));
}

const priorities = [...root.querySelectorAll('.p3-priority')];
const priorityTrack = root.querySelector('.p3-priority-track-fill');
function positionTrack(row){
 if(!priorityTrack || !row) return;
 priorityTrack.style.top = row.offsetTop + 14 + 'px';
 priorityTrack.style.height = (row.offsetHeight - 28) + 'px';
}
function selectPriority(row){
 priorities.forEach(r => {
  const active = r === row;
  r.classList.toggle('is-selected', active);
  r.setAttribute('aria-selected', String(active));
 });
 positionTrack(row);
}
priorities.forEach((row, i) => {
 row.addEventListener('click', () => selectPriority(row));
 row.addEventListener('keydown', e => {
  if(e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  e.preventDefault();
  const dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
  const next = priorities[(i + dir + priorities.length) % priorities.length];
  next.focus();
  selectPriority(next);
 });
});
positionTrack(priorities.find(r => r.classList.contains('is-selected')));
let trackResizeFrame = 0;
window.addEventListener('resize', () => {
 if(trackResizeFrame) return;
 trackResizeFrame = requestAnimationFrame(() => {
  trackResizeFrame = 0;
  positionTrack(priorities.find(r => r.classList.contains('is-selected')));
 });
});

const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');

/* COMPARE THE RANGE — RS Shade Card data, transcribed exactly, no invented or derived values.
   Variants use a Map, not a plain object: object keys that look like integers ('70','50') get
   silently reordered ascending by JS regardless of insertion order, which would default GLOBAL
   to 50 and CLASSIC to 50 instead of 70/80 as shown on the shade card. Map preserves real order. */
const RANGE_DATA = {
 'uv-lite': { accent:'#3dbce7', variants: new Map([
  ['70', {vlt:70, uv:99, ir:null, heat:30}],
  ['50', {vlt:47, uv:99, ir:null, heat:33}]
 ])}
};
const FAMILY_NAMES = {'uv-lite':'UV LITE'};

/* Single source of truth: showFamily() (below) sets the family the variant/metric compare section reports.
   Two things call it: the CHOOSE YOUR RS buttons above the compare section, and whichever product is
   showing in the sequence at the end of the page (.p3-range). */

const compareSection = root.querySelector('.p3-compare');
let updateCompareFamily = () => {};
if(compareSection){
 const variantsWrap = compareSection.querySelector('.p3-compare-variants');
 const toggleBtn = compareSection.querySelector('.p3-compare-toggle');
 const dualWrap = compareSection.querySelector('.p3-compare-dual');
 const dualGrid = compareSection.querySelector('.p3-compare-dual-grid');
 const metrics = [...compareSection.querySelectorAll('.p3-metric')];
 const metricsWrap = compareSection.querySelector('.p3-metrics');
 let dualA = null, dualB = null;

 function renderMetrics(variantData){
  metrics.forEach(metric => {
   const value = variantData[metric.dataset.metric];
   // A null value (no figure supplied for this product) renders as a dash with an empty gauge instead of "null%".
   metric.querySelector('.p3-metric-number').textContent = value == null ? '—' : value;
   metric.querySelector('.p3-metric-gauge-fill').style.width = (value == null ? 0 : value) + '%';
  });
 }

 function applyVariant(familyKey, variantLabel){
  const data = RANGE_DATA[familyKey].variants.get(variantLabel);
  variantsWrap.querySelectorAll('.p3-compare-variant').forEach(btn => {
   const active = btn.dataset.variant === variantLabel;
   btn.classList.toggle('is-active', active);
   btn.setAttribute('aria-selected', String(active));
  });
  if(motionQuery.matches){ renderMetrics(data); return; }
  metricsWrap.classList.add('is-swapping');
  setTimeout(() => {
   renderMetrics(data);
   metricsWrap.classList.remove('is-swapping');
  }, 200);
 }

 function buildVariantTabs(familyKey){
  const variantKeys = [...RANGE_DATA[familyKey].variants.keys()];
  variantsWrap.innerHTML = variantKeys.map(v =>
   '<button type="button" class="p3-compare-variant" data-variant="' + v + '" role="tab" aria-selected="false">' + v + '</button>'
  ).join('');
  const buttons = [...variantsWrap.querySelectorAll('.p3-compare-variant')];
  buttons.forEach((btn, i) => {
   btn.addEventListener('click', () => applyVariant(familyKey, btn.dataset.variant));
   btn.addEventListener('keydown', e => {
    if(e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = buttons[(i + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length];
    next.focus();
    applyVariant(familyKey, next.dataset.variant);
   });
  });
  return variantKeys;
 }

 function renderDualGrid(familyKey){
  const dataA = RANGE_DATA[familyKey].variants.get(dualA);
  const dataB = RANGE_DATA[familyKey].variants.get(dualB);
  const rows = [['VISIBLE LIGHT TRANSMISSION','vlt'],['UV REJECTION','uv'],['IR REJECTION','ir'],['HEAT REJECTION','heat']];
  const name = FAMILY_NAMES[familyKey];
  const card = (label, data) =>
   '<div class="p3-cdg-card"><h4 class="p3-cdg-name">' + name + ' ' + label + '</h4>' +
   rows.filter(([, key]) => dataA[key] != null || dataB[key] != null).map(([rowLabel, key]) =>
    '<div class="p3-cdg-row"><span class="p3-cdg-label">' + rowLabel + '</span><span class="p3-cdg-value">' + data[key] + '%</span></div>'
   ).join('') + '</div>';
  dualGrid.innerHTML = card(dualA, dataA) + '<span class="p3-cdg-vs">VS</span>' + card(dualB, dataB);
 }

 // UV Lite compares its two variants side by side, fixed: 70 vs 50 (no pickers).
 function buildDualPickers(familyKey){
  dualA = '70';
  dualB = '50';
  renderDualGrid(familyKey);
 }

 updateCompareFamily = function(familyKey){
  if(!RANGE_DATA[familyKey]) familyKey = 'global';
  compareSection.style.setProperty('--family-accent', RANGE_DATA[familyKey].accent);
  const variantKeys = buildVariantTabs(familyKey);
  applyVariant(familyKey, variantKeys[0]);
  const canCompare = variantKeys.length > 1;
  toggleBtn.hidden = !canCompare;
  toggleBtn.setAttribute('aria-pressed', 'false');
  dualWrap.hidden = true;
  if(canCompare) buildDualPickers(familyKey);
 };

 toggleBtn.addEventListener('click', () => {
  const showing = dualWrap.hidden;
  dualWrap.hidden = !showing;
  toggleBtn.setAttribute('aria-pressed', String(showing));
 });
}

/* Product images stay in normal document flow: Global, Classic, then UV Kool. */
const range = root.querySelector('.p3-range');
const rangeItems = range ? [...range.querySelectorAll('.p3-range-item')] : [];
let shownFamily = null;

// Keep the variant tabs and percentages in sync with the selected family button.
const familyButtons = [...root.querySelectorAll('.p3-family')];
function markFamilyButtons(key){
 familyButtons.forEach(btn => {
  const active = btn.dataset.family === key;
  btn.classList.toggle('is-selected', active);
  btn.setAttribute('aria-selected', String(active));
 });
}
familyButtons.forEach((btn, i) => {
 btn.addEventListener('click', () => showFamily(btn.dataset.family));
 btn.addEventListener('keydown', e => {
  if(e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  e.preventDefault();
  const next = familyButtons[(i + (e.key === 'ArrowRight' ? 1 : -1) + familyButtons.length) % familyButtons.length];
  next.focus();
  showFamily(next.dataset.family);
 });
});

function showFamily(key){
 // Only re-render the compare section when the family really changes, so a variant or the
 // COMPARE VARIANTS view the visitor opened isn't reset just because they scrolled past.
 if(key === shownFamily) return;
 shownFamily = key;
 updateCompareFamily(key);
 markFamilyButtons(key);
}
showFamily(rangeItems[0]?.dataset.family || 'global');

rangeItems.forEach(item => {
 const img = item.querySelector('.p3-stage-image');
 if(!img) return;
 const showFallback = () => item.classList.add('image-failed');
 img.addEventListener('error', showFallback);
 if(img.complete && !img.naturalWidth) showFallback();
});

function isValidYouTubeId(id){
 return typeof id === 'string' && /^[\w-]{11}$/.test(id.trim());
}

let ytApiPromise = null;
let mediaUnlocked = false;

function unlockMedia(){
 const wasUnlocked = mediaUnlocked;
 mediaUnlocked = true;
 if(wasUnlocked) return;
 root.querySelectorAll('.p3-video-frame').forEach((frame) => {
  const player = frame._ytPlayer;
  if(!player || typeof player.unMute !== 'function') return;
  try{
   player.unMute();
   player.setVolume(100);
   player.playVideo();
  }catch(_){}
  frame.classList.add('is-unmuted');
  frame.classList.remove('is-muted');
 });
}

// Only events that give the browser real user activation may unlock sound. pointerdown/touchstart also fire
// when a visitor merely starts scrolling; unmuting on those makes the browser pause the autoplaying video.
['keydown', 'click'].forEach((evt) => {
 window.addEventListener(evt, unlockMedia, {passive:true});
});

function loadYouTubeApi(){
 if(window.YT && window.YT.Player) return Promise.resolve(window.YT);
 if(ytApiPromise) return ytApiPromise;
 ytApiPromise = new Promise((resolve, reject) => {
  const previous = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function(){
   if(typeof previous === 'function') previous();
   resolve(window.YT);
  };
  if(!document.getElementById('rs-youtube-api')){
   const tag = document.createElement('script');
   tag.id = 'rs-youtube-api';
   tag.src = 'https://www.youtube.com/iframe_api';
   tag.onerror = () => {
    tag.remove();
    ytApiPromise = null;
    reject(new Error('YouTube iframe API failed to load'));
   };
   document.head.appendChild(tag);
  }
 });
 return ytApiPromise;
}

function ensureUnmuteButton(videoFrame, player){
 let btn = videoFrame.querySelector('.p3-video-unmute');
 if(!btn){
  btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'p3-video-unmute';
  btn.textContent = 'TAP FOR SOUND';
  btn.addEventListener('click', () => {
   unlockMedia();
   videoFrame._soundBlocked = false;
   try{
    player.unMute();
    player.setVolume(100);
    player.playVideo();
   }catch(_){}
   videoFrame.classList.add('is-unmuted');
   videoFrame.classList.remove('is-muted');
  });
  videoFrame.appendChild(btn);
 }
 return btn;
}

function applySound(videoFrame, player){
 if(mediaUnlocked && !videoFrame._soundBlocked){
  try{
   if(player.isMuted()) videoFrame._unmutedAt = Date.now();
   player.unMute();
   player.setVolume(100);
  }catch(_){}
  videoFrame.classList.add('is-unmuted');
  videoFrame.classList.remove('is-muted');
  return;
 }
 videoFrame.classList.add('is-muted');
 videoFrame.classList.remove('is-unmuted');
 ensureUnmuteButton(videoFrame, player);
}

function forcePlay(player){
 if(!player || typeof player.playVideo !== 'function') return;
 try{
  player.mute();
  player.playVideo();
 }catch(_){}
}

function youtubeWatchUrl(id){
 return 'https://www.youtube.com/watch?v=' + encodeURIComponent(id);
}

// IFrame API onError codes, so the console says why a video fell back instead of failing silently.
const EMBED_ERRORS = {
 2:'invalid video id or player parameter',
 5:'HTML5 player error',
 100:'video not found or private',
 101:'the video owner has disabled embedding',
 150:'the video owner has disabled embedding',
 153:'YouTube could not identify the embedding page (no http(s) referrer, e.g. the page was opened from file://). Serve it over http(s)'
};

function showEmbedFallback(videoFrame, id, reason){
 if(videoFrame.classList.contains('is-embed-failed')) return;
 console.warn('[RS video] ' + id + ' cannot play inline: ' + (EMBED_ERRORS[reason] || reason || 'player did not load'));
 clearTimeout(videoFrame._ytWatchdog);
 videoFrame.dataset.ytMounting = '0';
 videoFrame.classList.remove('is-playing', 'is-live', 'is-mounting');
 videoFrame.classList.add('is-embed-failed');
 const playerHost = videoFrame.querySelector('.p3-video-player');
 if(playerHost) playerHost.remove();
 const unmuteBtn = videoFrame.querySelector('.p3-video-unmute');
 if(unmuteBtn) unmuteBtn.remove();
 videoFrame._ytPlayer = null;
 let fallback = videoFrame.querySelector('.p3-video-fallback');
 if(!fallback){
  fallback = document.createElement('div');
  fallback.className = 'p3-video-fallback';
  const link = document.createElement('a');
  link.href = youtubeWatchUrl(id);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Watch on YouTube';
  const msg = document.createElement('p');
  msg.textContent = 'Video can’t play here.';
  fallback.appendChild(msg);
  fallback.appendChild(link);
  videoFrame.appendChild(fallback);
 }
}

function mountYouTube(videoFrame){
 if(videoFrame.classList.contains('is-playing') || videoFrame.classList.contains('is-embed-failed') || videoFrame.dataset.ytMounting === '1') return;
 const id = (videoFrame.dataset.videoId || '').trim();
 if(!isValidYouTubeId(id)) return;
 videoFrame.dataset.ytMounting = '1';
 videoFrame.classList.add('is-mounting', 'is-visible');
 videoFrame.classList.remove('reveal');

 const host = document.createElement('div');
 host.className = 'p3-video-player';
 videoFrame.appendChild(host);

 const playerVars = {
  autoplay: 1,
  mute: 1,
  playsinline: 1,
  loop: 1,
  playlist: id,
  rel: 0,
  modestbranding: 1,
  cc_load_policy: 0,
  iv_load_policy: 3,
  controls: 1,
  fs: 1,
  disablekb: 0,
  enablejsapi: 1
 };
 if(/^https?:$/.test(window.location.protocol)){
  playerVars.origin = window.location.origin;
 }

 // If the API script or the iframe is blocked (network, ad blocker, CSP), neither onReady nor onError ever fires.
 videoFrame._ytWatchdog = setTimeout(() => showEmbedFallback(videoFrame, id, 'timed out waiting for the YouTube player'), 15000);

 loadYouTubeApi().then((YT) => {
  const player = new YT.Player(host, {
   videoId: id,
   width: '100%',
   height: '100%',
   playerVars,
   events: {
    onReady(event){
     clearTimeout(videoFrame._ytWatchdog);
     if(videoFrame.classList.contains('is-embed-failed')) return;
     const iframe = event.target.getIframe();
     if(iframe){
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      iframe.setAttribute('allowfullscreen', '');
      iframe.title = 'RS Heat Control Glazing video';
     }
     forcePlay(event.target);
     applySound(videoFrame, event.target);
     const retryPlay = () => { if(!videoFrame.classList.contains('is-embed-failed')) forcePlay(event.target); };
     setTimeout(retryPlay, 250);
     setTimeout(retryPlay, 800);
    },
    onStateChange(event){
     if(event.data === YT.PlayerState.PAUSED && Date.now() - (videoFrame._unmutedAt || 0) < 1500){
      // The browser refused sound without a user gesture and paused the video: resume muted and offer TAP FOR SOUND.
      videoFrame._unmutedAt = 0;
      videoFrame._soundBlocked = true;
      forcePlay(event.target);
      applySound(videoFrame, event.target);
      return;
     }
     if(event.data === YT.PlayerState.ENDED){
      // Backup for loop=1, which YouTube skips in some embed states.
      try{ event.target.seekTo(0); event.target.playVideo(); }catch(_){}
     }
     if(event.data === YT.PlayerState.PLAYING){
      videoFrame.classList.add('is-playing', 'is-live');
      videoFrame.classList.remove('is-mounting');
      applySound(videoFrame, event.target);
     }
     if(event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.CUED){
      if(!videoFrame.classList.contains('is-live') && videoFrame.dataset.ytVisible === '1'){
       forcePlay(event.target);
      }
     }
    },
    onError(event){
     showEmbedFallback(videoFrame, id, event.data);
    }
   }
  });
  videoFrame._ytPlayer = player;
 }).catch(() => {
  showEmbedFallback(videoFrame, id, 'the YouTube iframe API could not be loaded');
 });
}

// Warm the API so the first video does not wait on first intersection.
loadYouTubeApi().catch(() => {});

root.querySelectorAll('.p3-video-frame').forEach(videoFrame => {
 const playButton = videoFrame.querySelector('.p3-video-play');
 if(playButton){
  playButton.addEventListener('click', () => {
   unlockMedia();
   videoFrame.dataset.ytVisible = '1';
   mountYouTube(videoFrame);
   forcePlay(videoFrame._ytPlayer);
  }, {once:true});
 }

 if(!isValidYouTubeId((videoFrame.dataset.videoId || '').trim())) return;

 if('IntersectionObserver' in window){
  const io = new IntersectionObserver((entries) => {
   entries.forEach((entry) => {
    if(!entry.isIntersecting || entry.intersectionRatio < 0.45){
     videoFrame.dataset.ytVisible = '0';
     return;
    }
    videoFrame.dataset.ytVisible = '1';
    mountYouTube(videoFrame);
    forcePlay(videoFrame._ytPlayer);
    if(videoFrame.classList.contains('is-live')) io.disconnect();
   });
  }, {threshold: [0.45, 0.6, 0.8], rootMargin: '0px'});
  io.observe(videoFrame);
 } else {
  videoFrame.dataset.ytVisible = '1';
  mountYouTube(videoFrame);
 }
});
})();
