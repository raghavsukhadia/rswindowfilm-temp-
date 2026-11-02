/* Phase 2 shares the existing GSAP instance and pin; no runtime imports. */
(() => {
  'use strict';
  window.RSAutomotive = {
    mount(root) {
      const host = root.querySelector('.automotive-experience');
      if (!host) return null;
      const $ = selector => host.querySelector(selector);
      const all = selector => [...host.querySelectorAll(selector)];
      const scene = $('.auto-scene'), camera = $('.car-camera');
      const standard = $('.car-standard'), protectedLayer = $('.car-protected');
      const control = $('.car-control'), track = $('.car-track'), range = $('#car-comparison');
      const result = $('.car-result'), panels = all('.auto-content');
      const motion = matchMedia('(prefers-reduced-motion: reduce)');
      let cinematic = false, time = 0, interacted = false, loading = false, frame = 0, pointer;
      let nearObserver, visible = true;
      const clamp = (x, a=0, b=1) => Math.max(a, Math.min(b, x));
      const blend = (a,b,t) => a+(b-a)*clamp(t);
      const ranges = [
        ['.car-transition .auto-content',2,2.66],
        ['[data-problem="heat"]',2.7,3.02],['[data-problem="uv"]',3.03,3.35],
        ['[data-problem="glare"]',3.36,3.68],['[data-problem="fading"]',3.69,4.03],
        ['.car-compare-content',4.07,5.48],['.car-result',4.07,5.48],
        ['[data-benefit="heat"]',5.52,5.95],['[data-benefit="glare"]',5.97,6.40],
        ['[data-benefit="uv"]',6.42,6.85],['[data-benefit="signal"]',6.87,7.30],
        ['.car-comfort .auto-content',7.35,8.23],['.car-products .auto-content',8.28,9.1]
      ].map(([selector,start,end])=>({node:$(selector),start,end}));
      function load() {
        if (loading) return;
        loading = true;
        all('[data-srcset]').forEach(el => { el.srcset = el.dataset.srcset; });
        const img = $('.car-image'); img.src = img.dataset.src;
      }
      const img = $('.car-image');
      img.addEventListener('error',()=>{img.style.opacity='0';});
      function compare() {
        const value = Number(range.value);
        host.style.setProperty('--car-split',value+'%');
        range.setAttribute('aria-valuenow',String(value));
        range.setAttribute('aria-valuetext',value+'% standard glass, '+(100-value)+'% with RS');
        if(cinematic && (time<4.07 || time>5.48)) return;
        const a=camera.getBoundingClientRect(), t=track.getBoundingClientRect();
        const split=value===0?0:value===100?100:clamp((t.left-a.left+t.width*value/100)/a.width)*100;
        standard.style.clipPath='inset(0 '+(100-split)+'% 0 0)';
        protectedLayer.style.clipPath='inset(0 0 0 '+split+'%)';
      }
      function revealResult() {
        const show=!cinematic || ((interacted || time>=5.08) && time>=4.07 && time<5.48);
        result.style.opacity=show?'1':'0'; result.style.visibility=show?'visible':'hidden';
        result.setAttribute('aria-hidden',String(!show));
      }
      function updateFromInput() {
        interacted=true;
        if(!frame) frame=requestAnimationFrame(()=>{frame=0;compare();revealResult();});
      }
      range.addEventListener('input',updateFromInput);
      function pointerValue(e){const box=track.getBoundingClientRect();range.value=Math.round(clamp((e.clientX-box.left)/box.width)*100);updateFromInput();}
      track.addEventListener('pointerdown',e=>{
        if(e.button!==0 || control.inert)return;
        pointer={id:e.pointerId,x:e.clientX,y:e.clientY,dragging:e.pointerType==='mouse'};
        if(pointer.dragging){e.preventDefault();track.setPointerCapture(e.pointerId);range.focus({preventScroll:true});pointerValue(e);}
      });
      track.addEventListener('pointermove',e=>{
        if(!pointer || e.pointerId!==pointer.id)return;
        const dx=Math.abs(e.clientX-pointer.x),dy=Math.abs(e.clientY-pointer.y);
        if(!pointer.dragging && dy>dx && dy>6){pointer=null;return;}
        if(dx>6)pointer.dragging=true;
        if(pointer.dragging){e.preventDefault();pointerValue(e);}
      });
      track.addEventListener('pointerup',e=>{if(pointer){pointerValue(e);pointer=null;}});
      track.addEventListener('pointercancel',()=>{pointer=null;});
      const radios=all('input[name="rs-family"]'), strips=all('.family-strip');
      function selectFamily() {
        const index=radios.findIndex(r=>r.checked),strip=strips[index];
        root.style.setProperty('--family-accent',getComputedStyle(strip).getPropertyValue('--family-color'));
        strips.forEach((s,i)=>s.classList.toggle('is-selected',i===index));
      }
      radios.forEach(r=>r.addEventListener('change',selectFamily));
      let swipe, suppressClickUntil=0;
      $('.family-selector').addEventListener('click',e=>{if(performance.now()<suppressClickUntil)e.preventDefault();},{capture:true});
      $('.family-selector').addEventListener('pointerdown',e=>{swipe={x:e.clientX,y:e.clientY};});
      $('.family-selector').addEventListener('pointerup',e=>{
        if(!swipe)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;swipe=null;
        if(Math.abs(dx)<35 || Math.abs(dy)>Math.abs(dx))return;
        const next=clamp(radios.findIndex(r=>r.checked)+(dx<0?1:-1),0,2);
        radios[next].checked=true;radios[next].focus({preventScroll:true});selectFamily();
        // Suppress the synthetic click that otherwise selects the strip under the release point.
        suppressClickUntil=performance.now()+400;
      });
      $('.family-selector').addEventListener('pointercancel',()=>{swipe=null;});
      function effects(values) {
        const defaults={warm:.9,glare:.8,uv:.5,solar:.7,exposure:0,shimmer:0,air:.4,signal:0};
        const v={...defaults,...values};
        $('.cabin-warmth').style.opacity=v.warm;$('.cabin-glare').style.opacity=v.glare;
        $('.violet-paths').style.opacity=v.uv;$('.solar-paths').style.opacity=v.solar;
        $('.surface-exposure').style.opacity=v.exposure;$('.heat-shimmer').style.opacity=v.shimmer;
        $('.car-standard .airflow').style.opacity=v.air;$('.connectivity').style.opacity=v.signal;
      }
      function pause() { host.classList.toggle('effects-paused',document.hidden||!visible||motion.matches||!cinematic); }
      new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;pause();}).observe(root.querySelector('.experience-pin'));
      document.addEventListener('visibilitychange',pause);
      function setTime(value) {
        time=value;
        if(!cinematic)return;
        if(time>1.25)load();
        const compareActive=time>=4.07 && time<=5.48;
        control.inert=!compareActive;
        ranges.forEach(({node,start,end})=>{const active=time>=start&&time<end;node.inert=!active;node.dataset.active=String(active);node.setAttribute('aria-hidden',String(!active));});
        if(compareActive){standard.style.opacity='1';protectedLayer.style.opacity='1';compare();effects({});}
        else {
          standard.style.clipPath='inset(0)';protectedLayer.style.clipPath='inset(0)';
          standard.style.opacity='1';protectedLayer.style.opacity='0';
          effects({warm:.8,glare:.45,uv:0,solar:.3,air:0});
          if(time>=2.7&&time<3.03)effects({warm:1,glare:.45,uv:0,solar:.65,shimmer:.8,air:0});
          if(time>=3.03&&time<3.36)effects({warm:.6,glare:.3,uv:.7,solar:.1,air:0});
          if(time>=3.36&&time<3.69)effects({warm:.4,glare:1,uv:0,solar:0,air:0});
          if(time>=3.69&&time<4.07)effects({warm:.6,glare:.35,uv:0,solar:0,exposure:1,air:0});
          if(time>=5.52&&time<7.35){
            standard.style.opacity='1';protectedLayer.style.opacity='1';
            const heat=1-clamp((time-5.52)/.33),glare=1-clamp((time-5.97)/.33),uv=1-clamp((time-6.42)/.33);
            effects({warm:time<5.95?heat:0,glare:time>=5.97&&time<6.40?glare:0,uv:time>=6.42&&time<6.85?uv*.5:0,solar:time<5.95?heat*.4:0,air:0,signal:time>=6.87?1:0});
          }
          if(time>=7.35){
            standard.style.opacity=String(1-clamp((time-7.55)/.45));protectedLayer.style.opacity='1';
            effects({warm:1,glare:.35,uv:0,solar:.3,air:.7});
          }
          if(time>=8.28){standard.style.opacity='0';protectedLayer.style.opacity='1';}
        }
        revealResult();pause();
      }
      function setMode(enabled) {
        cinematic=enabled;nearObserver?.disconnect();
        if(!enabled){
          panels.forEach(p=>{p.inert=false;p.dataset.active='true';p.removeAttribute('aria-hidden');p.style.opacity='';p.style.visibility='';});
          control.inert=false;scene.style.opacity='';camera.style.transform='';
          standard.style.opacity='1';protectedLayer.style.opacity='1';effects({});compare();revealResult();
          nearObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){load();nearObserver.disconnect();}},{rootMargin:'600px'});
          nearObserver.observe(scene);
        } else {setTime(time);}
        pause();
      }
      function extendTimeline(timeline) {
        const gsap=window.gsap;
        gsap.set(scene,{opacity:0});gsap.set(camera,{scale:1024/620});gsap.set(panels,{autoAlpha:0});
        timeline.to(scene,{opacity:1,duration:.16,ease:'none'},2)
          .to(camera,{scale:1,duration:.55,ease:'power2.inOut'},2.04);
        for(const {node,start,end} of ranges){
          if(node===result)continue;
          timeline.to(node,{autoAlpha:1,duration:.10,ease:'none'},start);
          if(end<9)timeline.to(node,{autoAlpha:0,duration:.08,ease:'none'},end-.08);
        }
        timeline.to($('.family-light'),{opacity:1,duration:.3},8.28).to({}, {duration:.42},8.58);
        return timeline;
      }
      root.classList.add('has-car-controls');control.hidden=false;compare();selectFamily();setMode(false);
      return {extendTimeline,setTime,setMode,load,refresh:compare};
    }
  };
})();
