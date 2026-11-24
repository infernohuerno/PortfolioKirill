(() => {
  const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
  const translations=$$('[data-en]').map(el=>[el,el.textContent]);
  const images=$$('[data-alt-en]').map(el=>[el,el.alt]);
  const dialog=$('.ar-viewer'),image=$('.viewer-image'),play=$('.viewer-play');
  const controls=$$('.ar-languages button'), reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let lang='ru',group=[],index=0,running=false,returnTo=null;
  const t=(ru,en)=>lang==='en'?en:ru;
  function setLang(value) {
    lang=value;document.documentElement.lang=lang;
    for (const [el,ru] of translations) el.textContent=t(ru,el.dataset.en);
    for (const [el,ru] of images) el.alt=t(ru,el.dataset.altEn);
    for (const el of controls) el.setAttribute('aria-pressed',String(el.dataset.lang===lang));
    $('.archive-nav').setAttribute('aria-label',t('Главы','Chapters'));
    dialog.setAttribute('aria-label',t('Просмотр работы','Artwork viewer'));
    if(dialog.open) paint(false);
    try {localStorage.setItem('portfolio-language',lang);}catch{}
  }
  function paint(reset=true) {
    const link=group[index], animated=link.dataset.anim==='1';
    if(reset) running=animated&&!reduce.matches;
    image.src=running?link.href:link.dataset.still;
    image.alt=link.querySelector('img').alt;
    image.classList.toggle('paper',link.closest('figure').dataset.art==='r03-03');
    $('.viewer-caption').textContent=image.alt;
    $('.viewer-count').textContent=(index+1)+' / '+group.length;
    play.hidden=!animated;play.textContent=running?t('Стоп','Stop'):t('Воспроизвести','Play');
    for(const b of [$('.viewer-prev'),$('.viewer-next')])b.hidden=group.length<2;
  }
  function step(n){index=(index+n+group.length)%group.length;paint();}
  document.addEventListener('click',e=>{
    const link=e.target.closest('.ar-zoom');if(!link||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    e.preventDefault();returnTo=link;
    group=Array.from(link.closest('section').querySelectorAll('.ar-zoom'));index=group.indexOf(link);
    paint();dialog.showModal();document.body.classList.add('modal-open');$('.viewer-close').focus();
  });
  $('.viewer-close').addEventListener('click',()=>dialog.close());
  $('.viewer-prev').addEventListener('click',()=>step(-1));$('.viewer-next').addEventListener('click',()=>step(1));
  play.addEventListener('click',()=>{running=!running;paint(false);});
  dialog.addEventListener('close',()=>{image.removeAttribute('src');document.body.classList.remove('modal-open');returnTo?.focus({preventScroll:true});});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}});
  let touch=null;
  image.addEventListener('touchstart',e=>{touch=e.changedTouches[0];},{passive:true});
  image.addEventListener('touchend',e=>{if(!touch)return;const d=e.changedTouches[0],x=d.clientX-touch.clientX;if(Math.abs(x)>60&&Math.abs(x)>Math.abs(d.clientY-touch.clientY)*1.3)step(x<0?1:-1);touch=null;},{passive:true});
  reduce.addEventListener('change',()=>{if(dialog.open&&reduce.matches){running=false;paint(false);}});
  controls.forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
  try{if(localStorage.getItem('portfolio-language')==='en')lang='en';}catch{}
  setLang(lang);
})();
