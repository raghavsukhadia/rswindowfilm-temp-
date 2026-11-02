/* Top-left RS logo: hides while scrolling down, returns on any scroll up and at the top of the page. */
(() => {
'use strict';
const logo = document.querySelector('.top-logo');
if(!logo) return;

const STEP = 4;
let lastY = window.scrollY;
let ticking = false;

function update(){
 ticking = false;
 const y = window.scrollY;
 const dy = y - lastY;
 if(y <= 8){
  logo.classList.remove('is-hidden');
  lastY = y;
 }else if(dy > STEP){
  logo.classList.add('is-hidden');
  lastY = y;
 }else if(dy < -STEP){
  logo.classList.remove('is-hidden');
  lastY = y;
 }
}

window.addEventListener('scroll', () => {
 if(ticking) return;
 ticking = true;
 requestAnimationFrame(update);
}, { passive: true });
})();
