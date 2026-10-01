(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const extra = {
    ru: {available:'Открыт к проектам',hero_new_desc:'Создаю визуальный характер брендов. От первой идеи — до цифрового опыта, который хочется запомнить.',hero_cta:'Смотреть проекты',hero_bottom:'5 лет опыта. Один фокус — сильный дизайн.',scroll_label:'Листай, дальше интереснее',selected_label:'01 / ИЗБРАННЫЕ РАБОТЫ',selected_title:'Меньше слов.\nБольше характера.',work_intro:'Разные задачи. Один подход: сделать заметно.',filter_all:'Все работы',experience_label:'02 / ОПЫТ',about_label:'03 / ЧЕЛОВЕК ЗА ДИЗАЙНОМ',contact_label:'04 / СОЗДАДИМ ЧТО-ТО КЛАССНОЕ',copy_email:'Скопировать email',back_top:'Наверх ↑',contact_title:'Есть идея?\nДавай создадим.'},
    en: {available:'Open for projects',hero_new_desc:'Building a visual character for brands. From the first idea to a digital experience worth remembering.',hero_cta:'Explore projects',hero_bottom:'5 years of experience. One focus — great design.',scroll_label:'Scroll to discover',selected_label:'01 / SELECTED WORK',selected_title:'Less talk.\nMore character.',work_intro:'Different challenges. One approach: make it memorable.',filter_all:'All work',experience_label:'02 / EXPERIENCE',about_label:'03 / BEHIND THE DESIGN',contact_label:'04 / LET’S MAKE SOMETHING GREAT',copy_email:'Copy email',back_top:'Back to top ↑',contact_title:'Have an idea?\nLet’s make it real.'}
  };
  Object.assign(i18n.ru,extra.ru); Object.assign(i18n.en,extra.en);
  let savedLanguage = 'ru';
  try { const saved = localStorage.getItem('portfolio-language'); if (saved === 'en') savedLanguage = saved; } catch {}
  setLanguage(savedLanguage);
  // Progressive enhancement: all content remains visible if motion APIs are unavailable.
  let observer;
  if ('IntersectionObserver' in window && !reduced.matches) {
    document.body.classList.add('motion-ready');
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}
    }),{threshold:.08});
  }
  window.refreshMotion = () => {
    $$('.section-heading,.case-card,.case-detail-header,.case-meta-grid,.sub-card,.gallery-img,.timeline-item,.about-grid').forEach(el => {
      if (!el.classList.contains('reveal')) {el.classList.add('reveal');if(observer) observer.observe(el);}
    });
  };
  refreshMotion();
  $$('.filter').forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    $$('.filter').forEach(b => {b.classList.toggle('active',b === button);b.setAttribute('aria-pressed',String(b === button));});
    renderCases();refreshMotion();
  }));
  // Compact, keyboard accessible experience rows.
  $$('.timeline-item').forEach((item, index) => {
    const head = $('.timeline-header', item), list = $('.timeline-bullets',item);
    const toggle = document.createElement('button');toggle.className = 'timeline-toggle';toggle.type = 'button';
    list.id = `experience-description-${index}`;list.hidden = index !== 1;
    toggle.setAttribute('aria-expanded',String(!list.hidden));toggle.setAttribute('aria-controls',list.id);
    head.before(toggle);toggle.append(head);
    toggle.addEventListener('click',()=>{list.hidden = !list.hidden;toggle.setAttribute('aria-expanded',String(!list.hidden));});
  });
  // All project imagery can be viewed in its original proportions.
  const gallery = [];
  $$('.gallery-img,.sub-card-img,.brand-thumb').forEach(el => {
    const path = el.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
    if (!path) return;
    const section = el.closest('section');
    const caption = $('.case-detail-title',section)?.textContent || 'Selected work';
    const index = gallery.push({src:path,caption}) - 1;
    let host = el;
    if(el.closest('a')) {host = document.createElement('div');host.className = 'zoom-host';el.parentElement.insertBefore(host,el);host.append(el);host.style.position='relative';}
    const btn = document.createElement('button');btn.type='button';btn.className='zoom-button';btn.textContent='↗';btn.setAttribute('aria-label',`View image: ${caption}`);
    btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openImage(index);});
    host.append(btn);
  });
  const lightbox = $('.lightbox');let imageIndex = 0,previousFocus;
  function paintImage(){const item = gallery[imageIndex];$('.lightbox-stage img').src=item.src;$('.lightbox-stage img').alt=item.caption;$('.lightbox-caption').textContent=item.caption;$('.lightbox-counter').textContent=`${String(imageIndex+1).padStart(2,'0')} / ${String(gallery.length).padStart(2,'0')}`;}
  function openImage(index){imageIndex=index;previousFocus=document.activeElement;paintImage();lightbox.showModal();document.body.style.overflow='hidden';$('.lightbox-close').focus();}
  function step(n){imageIndex=(imageIndex+n+gallery.length)%gallery.length;paintImage();}
  $('.lightbox-close').addEventListener('click',()=>lightbox.close());
  $('.lightbox-prev').addEventListener('click',()=>step(-1));$('.lightbox-next').addEventListener('click',()=>step(1));
  lightbox.addEventListener('close',()=>{document.body.style.overflow='';previousFocus?.focus();});
  lightbox.addEventListener('click',e=>{if(e.target===lightbox || e.target===$('.lightbox-stage'))lightbox.close();});
  lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();step(1);}if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}});
  let touchX;
  lightbox.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;},{passive:true});
  lightbox.addEventListener('touchend',e=>{const delta=e.changedTouches[0].clientX-touchX;if(Math.abs(delta)>60)step(delta<0?1:-1);},{passive:true});
  $('.copy-email').addEventListener('click',async()=>{
    const email='infernoggc@yandex.ru';
    try{await navigator.clipboard.writeText(email);$('.copy-status').textContent=currentLang==='ru'?'Email скопирован. До связи!':'Email copied. Talk soon!';}
    catch{$('.copy-status').textContent=currentLang==='ru'?`Скопируй адрес: ${email}`:`Copy this address: ${email}`;}
  });
  document.addEventListener('languagechange',()=>{$('.copy-status').textContent='';});
  // One RAF loop batches pointer and scroll effects, without scroll hijacking.
  const art=$('.hero-art'), cursor=$('.cursor-label');let frame=0, px=0,py=0,moveArt=false;
  function update(){frame=0;const max=document.documentElement.scrollHeight-innerHeight;$('.scroll-progress').style.transform=`scaleX(${max>0?scrollY/max:0})`;
    if(moveArt && !reduced.matches && fine.matches){const r=art.getBoundingClientRect();art.style.setProperty('--mx',`${((px-r.left)/r.width-.5)*22}px`);art.style.setProperty('--my',`${((py-r.top)/r.height-.5)*22}px`);}
    cursor.style.left=`${px}px`;cursor.style.top=`${py}px`;
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  document.addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;schedule();},{passive:true});
  art.addEventListener('pointerenter',()=>{moveArt=true;});art.addEventListener('pointerleave',()=>{moveArt=false;art.style.setProperty('--mx','0px');art.style.setProperty('--my','0px');});
  const grid=$('#cases-grid');grid.addEventListener('pointerover',e=>{if(fine.matches && !reduced.matches && e.target.closest('.case-image-wrap'))cursor.style.display='block';});
  grid.addEventListener('pointerout',e=>{if(!e.relatedTarget?.closest('.case-image-wrap'))cursor.style.display='none';});
  reduced.addEventListener('change',()=>{document.body.classList.toggle('motion-ready',!reduced.matches);if(!reduced.matches)$$('.reveal').forEach(el=>el.classList.add('visible'));});
  schedule();
})();
