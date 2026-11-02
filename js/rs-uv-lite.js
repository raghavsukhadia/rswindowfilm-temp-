(() => {
'use strict';
const root=document.querySelector('.rs-shield');
if(!root)return;
const $=s=>root.querySelector(s), all=s=>[...root.querySelectorAll(s)];
const stage=$('.shield-stage'), art=$('.scene-art'), warm=$('.warm-state'), protectedLayer=$('.protected-state'), edge=$('.film-edge');
const brand=$('.brand-reveal'), discover=$('.discover');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const automotive=window.RSAutomotive?.mount(root);
const pin=$('.experience-pin') || stage;
let intro, story, ready=false, visible=true, progress=0, startPoint=null;
root.classList.add('is-enhanced');
// No comparison slider on this page: after the intro the glass is fully in its protected (with-film) state.
function compare(){
 root.style.setProperty('--split','0%');
 warm.style.clipPath='inset(0 100% 0 0)';
 protectedLayer.style.clipPath='inset(0 0 0 0%)';
}
function pauseEffects(){root.classList.toggle('is-paused',document.hidden||!visible||motion.matches||progress>.05);}
function setAvailable(available){discover.tabIndex=available?0:-1;}
function finish(){
 if(ready)return;
 ready=true;intro?.kill();
 if(window.gsap)gsap.set([art,brand,...brand.children,...all('.brand-reveal h1 span'),discover],{opacity:1,visibility:'visible'});
 edge.style.display='none';warm.style.opacity='1';protectedLayer.style.opacity='1';
 compare();setAvailable(progress<.04);if(!story)setup();
}
window.addEventListener('resize',()=>{if(ready)compare();automotive?.refresh();},{passive:true});
document.addEventListener('visibilitychange',()=>{pauseEffects();if(intro&&!ready)document.hidden?intro.pause():intro.resume();});
const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;pauseEffects();});observer.observe(stage);
const image=$('.scene-image');
function imageFailed(){image.style.opacity='0';finish();}
image.addEventListener('error',imageFailed);
function setup(){
 story?.scrollTrigger?.kill();story?.kill();story=null;root.classList.remove('is-scroll-story','is-story-complete');progress=0;setAvailable(true);
 if(window.gsap)gsap.set([$('.scene'),$('.story-overlay')],{clearProps:'opacity,visibility'});
 automotive?.setMode(false);
 if(!window.gsap||!window.ScrollTrigger||motion.matches){finish();pauseEffects();return;}
 gsap.registerPlugin(ScrollTrigger);root.classList.add('is-scroll-story');automotive?.setMode(true);
 const lines=all('.story-line');gsap.set(lines,{autoAlpha:0});
 const pinScreens=automotive?9:3;
 story=gsap.timeline({onUpdate:()=>{
  if(!story)return;
  const t=story.time();progress=t/Math.max(story.duration(),1e-6);setAvailable(t<.08);automotive?.setTime(t);pauseEffects();
 },scrollTrigger:{trigger:$('.shield'),start:'top top',end:()=>'+='+stage.clientHeight*pinScreens,pin:pin,scrub:.35,invalidateOnRefresh:true,onUpdate:self=>{
  if(self.progress>.0005)finish();
 },onLeave:()=>{if(!automotive)root.classList.add('is-story-complete');},onEnterBack:()=>{root.classList.remove('is-story-complete');}}});
 story.to([brand,discover,$('.intro-kicker')],{autoAlpha:0,duration:.16},0)
 .to($('.scene-shade'),{opacity:.62,duration:.32},0)
 .to(lines[0],{autoAlpha:1,duration:.12},.15).to(lines[0],{autoAlpha:0,duration:.1},.52)
 .to(lines[1],{autoAlpha:1,duration:.12},.65).to(lines[1],{autoAlpha:0,duration:.1},1.02)
 .to(lines[2],{autoAlpha:1,duration:.12},1.15).to(lines[2],{autoAlpha:0,duration:.1},1.52)
 .to(lines[3],{autoAlpha:1,duration:.18},1.65);
 if(automotive){
  story.to({}, {duration:.17});
  story.to($('.story-overlay'),{autoAlpha:0,duration:.15},2)
   .to($('.scene'),{opacity:0,duration:.15},2.05);
  automotive.extendTimeline(story);
 }else{
  // Hold benefits until pin ends; collapse via is-story-complete (no fade-to-black gap).
  story.to({}, {duration:1});
 }
 // ScrollTrigger normally batches its first measurement to the next animation frame; if the user
 // is already mid-scroll when setup() runs (see earlyFinish above), real scroll can advance before
 // that batched measurement lands, desyncing scroll position from pinned progress. Force it now.
 ScrollTrigger.refresh();
}
function play(){
 if(motion.matches||!window.gsap||!window.ScrollTrigger){finish();setup();return;}
 const film={amount:0};
 const updateFilm=()=>{warm.style.clipPath='inset(0 0 '+film.amount+'% 0)';protectedLayer.style.clipPath='inset('+(100-film.amount)+'% 0 0 0)';edge.style.top=(100-film.amount)+'%';};
 gsap.set(art,{opacity:.16});gsap.set([...all('.brand-reveal h1 span'),$('.rs-logo'),$('.brand-reveal p')],{autoAlpha:0});warm.style.opacity='0';updateFilm();
 intro=gsap.timeline({onComplete:finish});
 intro.to(art,{opacity:1,duration:1,ease:'power2.out'},0)
 .to(warm,{opacity:1,duration:1},1)
 .set(edge,{display:'block'},2)
 .to(film,{amount:100,duration:1.5,ease:'power2.inOut',onUpdate:updateFilm},2)
 .set(edge,{display:'none'},3.5)
 .to(all('.brand-reveal h1 span'),{autoAlpha:1,duration:.35,stagger:.12},3.5)
 .to($('.rs-logo'),{autoAlpha:1,duration:.3},3.82)
 .to($('.brand-reveal p'),{autoAlpha:1,duration:.25},4.05)
 .to(discover,{autoAlpha:1,duration:.35},4.15);
}
// Do not make the visitor wait for the cinematic to scroll or interact.
// finish()/setup() swaps the automotive section from static flow to an absolutely-positioned pin,
// changing total document height by several thousand px. Doing that mid-gesture (after the browser
// has already started applying a touch/wheel scroll against the old, shorter height) can desync the
// scroll position from ScrollTrigger's pinned progress. Trigger it on gesture START instead, before
// any scroll delta from that gesture is applied.
function earlyFinish(){if(!ready)finish();}
window.addEventListener('wheel',earlyFinish,{passive:true,once:true});
window.addEventListener('touchstart',earlyFinish,{passive:true,once:true});
window.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','PageDown','PageUp',' ','End','Home'].includes(e.key))earlyFinish();});
window.addEventListener('scroll',()=>{if(!ready&&window.scrollY>2){finish();}},{passive:true});
motion.addEventListener('change',()=>{finish();if(window.gsap){gsap.set([brand,discover,$('.intro-kicker')],{clearProps:'opacity,visibility'});gsap.set($('.scene-shade'),{opacity:0});}setup();compare();});
discover.addEventListener('click',e=>{if(story){e.preventDefault();finish();window.scrollTo({top:story.scrollTrigger.start+stage.clientHeight*(automotive?9:3),behavior:motion.matches?'instant':'smooth'});}});
play();if(image.complete&&!image.naturalWidth)imageFailed();pauseEffects();
})();
