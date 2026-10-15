(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const svg = (name, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const t = (ru, en) => lang === 'en' ? en : ru;
  let lang = 'ru', filter = 'all', activeCase = null, galleryIndex = 0, lastCaseTrigger = null, lastImageTrigger = null;
  const dialog = $('.case-dialog'), lightbox = $('.lightbox');
  const translations = {
    skip:'Skip to work',navWork:'Work <sup>04</sup>',navAbout:'About',navExp:'Experience',navContact:'Contact',talk:'Let’s talk',available:'Open to opportunities',
    heroLine1:'KIRILL',heroLine2:'KATIN',heroNote:'Branding. Digital. AI.<br>Good taste. Strange ideas.',openFolder:'Open my project folder',heroCaption:'BRAND IDENTITY. DIGITAL EXPERIENCE. NEW POSSIBILITIES.',heroIntro:'I’m Kirill Katin. I bring together strategy, visual culture and AI to create design that stays with you.',explore:'My work',trusted:'PROJECTS & COLLABORATIONS',selected:'SELECTED WORK',workHeading:'My work<span class="serif">/ selected_works /</span>',all:'All <sup>04</sup>',
    impactLabel:'AESTHETICS WITH IMPACT',impactTitle:'Good design<br>works for business.',impactNote:'Project results from my work with NIKIFILINI, OTHERS / SOMBRA and Charlie’s.',stat1:'conversion growth at OTHERS / SOMBRA<br>after introducing AI photography',stat2:'faster collection uploads<br>at NIKIFILINI',stat3:'increase in visits to Charlie’s<br>after the branded lookbook launch',aboutLabel:'THE PERSON BEHIND THE DESIGN',portrait:'DESIGNER / 23 YEARS OLD',years:'YEARS<br>IN DESIGN',aboutHeading:'The human<br>behind the pixels.<span class="serif">about_me.txt</span>',aboutLead:'I’m interested in what makes a brand itself. I find that character and turn it into identity, product and digital experience.',aboutText:'Over 5 years, I’ve worked with apparel, e-commerce and service brands. I build visual systems, create AI content and help teams bring new tools into their workflow.',relocate:'Available for relocation and business travel',meet:'Let’s get to know each other',s1:'A brand with its own DNA',s1text:'Identity, art direction, packaging, apparel and merchandise. From the first idea to a complete visual system.',s2:'An experience that feels right',s2text:'UI/UX, e-commerce and web design. Clear structure, distinctive presentation and attention to detail.',s3:'New ways to create',s3text:'AI photography, lookbooks and marketplace content. Tool implementation and team training.',expLabel:'THE PROFESSIONAL JOURNEY',expYears:'5 YEARS OF EXPERIENCE',expHeading:'My experience<span class="serif">work_history.log</span>',expIntro:'From early visual communications to complete brand identities and AI implementation for teams.',contactLabel:'COULD YOUR PROJECT BE NEXT?',contactHeading:'YOU’VE GOT<br><span>AN IDEA?</span>',contactText:'Looking for a team and projects that value<br>strong ideas and bold design.',write:'GET IN TOUCH',back:'Back to top',close:'Close'
  };
  const ruContent = new Map($$('[data-i18n]').map(el => [el, el.innerHTML]));
  const projects = [
    {id:'nikifilini',name:'NIKIFILINI',category:'digital',year:'01 / E-COMMERCE & AI',cover:'nikifilini-rostics',wordmark:'NIKIFILINI × ROSTIC’S',tags:['E-commerce','Product design','AI content'],role:'Product / UI/UX / AI Designer',scope:'Product design, UI/UX, AI lookbooks, team training',
      short:['Коллаборация с ROSTIC’S, цифровой опыт и AI-контент для стритвир-бренда.','The ROSTIC’S collaboration, digital experience and AI content for a streetwear brand.'],
      summary:['Участвовал в разработке продуктов и UI/UX для лимитированного дропа NIKIFILINI × ROSTIC’S (KFC). Создавал визуальные коммуникации для e-commerce и внедрял AI-фотосессии — от первых лукбуков до обучения команд OTHERS и SOMBRA.','Contributed to product development and UI/UX for the limited NIKIFILINI × ROSTIC’S (KFC) drop. Created e-commerce visual communications and introduced AI photography, from the first lookbooks to training the OTHERS and SOMBRA teams.'],
      results:['+150% к скорости добавления коллекций в NIKIFILINI. +60% к конверсии OTHERS / SOMBRA после внедрения AI-фотосессий. Оптимизация расходов на съёмки и обучение сотрудников.','+150% faster collection uploads at NIKIFILINI. +60% conversion growth at OTHERS / SOMBRA after adopting AI photography. Streamlined photography costs and trained employees.'],
      images:[['nikifilini-rostics','NIKIFILINI × ROSTIC’S — лимитированная коллаборация','NIKIFILINI × ROSTIC’S — limited collaboration'],['nikifilini-ai-records','AI-лукбуки и визуальный контент для соцсетей бренда','AI lookbooks and visual content for the brand’s social media'],['nikifilini-banners','Веб-баннеры и визуальные коммуникации NIKIFILINI','NIKIFILINI web banners and visual communications'],['brand-others','OTHERS — AI-фотосессии для маркетплейсов','OTHERS — AI photography for marketplaces'],['brand-sombra','SOMBRA — AI-фотосессии для маркетплейсов','SOMBRA — AI photography for marketplaces']],
      links:[['https://nikifilini.com/product-category/rostic-s/?utm_source=telegram&utm_medium=channel&utm_content=11_09_25&utm_campaign=post','Дроп NIKIFILINI × ROSTIC’S','NIKIFILINI × ROSTIC’S drop'],['https://t.me/nikifilini/7595','AI-контент в Telegram','AI content on Telegram'],['https://t.me/nikifilini','Канал NIKIFILINI','NIKIFILINI channel'],['https://www.wildberries.ru/brands/others','OTHERS на Wildberries','OTHERS on Wildberries'],['https://www.wildberries.ru/brands/310905528-sombra','SOMBRA на Wildberries','SOMBRA on Wildberries']]},
    {id:'inferno',name:'INFERNO',category:'brand',year:'02 / IDENTITY & APPAREL',cover:'inferno-gallery-3',wordmark:'INFERNO®',tags:['Art direction','Identity','3D & Apparel'],role:'Art Direction & Brand Identity',scope:'Branding, 3D assets, merchandise, digital lookbook',
      short:['Авангардная айдентика, 3D-графика и мерч для бренда одежды с тёмным характером.','Avant-garde identity, 3D graphics and merchandise for an apparel brand with a dark attitude.'],
      summary:['Концептуальная айдентика авангардной линейки одежды. Соединил графику, 3D и дизайн мерча в единый визуальный язык, а затем перенёс его в цифровую презентацию бренда.','A conceptual identity for an avant-garde apparel line. Brought graphics, 3D and merchandise design together in one visual language and carried it into the brand’s digital presentation.'],
      results:['Цельная система: айдентика, 3D-материалы, одежда и концепт цифрового лукбука.','A cohesive system spanning identity, 3D assets, apparel and a digital lookbook concept.'],
      images:[['inferno-gallery-1','INFERNO — визуальная система и дизайн одежды','INFERNO — visual system and apparel design'],['inferno-gallery-2','Графика для мерча: звезда INFERNO','Merchandise graphics: the INFERNO star'],['inferno-gallery-3','Типографика в коллекции INFERNO','Typography in the INFERNO collection'],['inferno-cover','Логотип INFERNO','INFERNO logo']],
      links:[['https://inferno-paralyzed.tilda.ws/','Сайт проекта','Project website']]},
    {id:'otserdca',name:'OTSERDCA',category:'brand',year:'03 / BRAND FROM SCRATCH',cover:'otserdca-gallery-3',wordmark:'',tags:['Brand strategy','Identity','Packaging'],role:'Product & Graphic Designer',scope:'Brand identity, packaging, apparel, merchandise',
      short:['Бренд с нуля: живая айдентика, упаковка и фирменная продукция.','A brand built from scratch: a vivid identity, packaging and branded products.'],
      summary:['Разработка полного брендинга компании с нуля. Создал визуальную основу бренда и развил её в упаковочных решениях, одежде, сувенирной продукции и PR-материалах.','Complete company branding from scratch. Created the brand’s visual foundation and developed it across packaging, apparel, merchandise and PR materials.'],
      results:['Единый визуальный язык для бренда, продукции и коммуникаций — от логотипа до физических носителей.','A unified visual language for the brand, products and communications, from the logo to physical applications.'],
      images:[['otserdca-gallery-1','OTSERDCA — образ и визуальный характер бренда','OTSERDCA — brand image and visual character'],['otserdca-gallery-2','Типографика и визуальные коммуникации','Typography and visual communications'],['otserdca-gallery-3','Цвет, графические элементы и арт-дирекшн','Colour, graphic elements and art direction'],['otserdca-cover','Логотип OTSERDCA','OTSERDCA logo']],
      links:[['https://otserdca.com/','Сайт бренда','Brand website']]},
    {id:'charlies',name:'CHARLIE’S',category:'brand',year:'04 / BRAND & COMMUNICATION',cover:'charlies-gallery-1',wordmark:'',tags:['Lead design','Marketing','Merchandise'],role:'Lead Product & Graphic Designer',scope:'Brand communications, lookbooks, campaigns, merchandise',
      short:['Визуальная коммуникация барбершопа и тату-студии, которая привела к росту посещаемости.','Visual communication for a barbershop and tattoo studio that helped increase customer traffic.'],
      summary:['Вёл продуктовый и графический дизайн Charlie’s Barbershop & Tattoo. Создавал фирменный лукбук, ежедневные Stories и промокампании. Разработал проект коллаборации Charlie’s × RobRoyBar: автобус для вечеринок и мерч.','Led product and graphic design for Charlie’s Barbershop & Tattoo. Created a branded lookbook, daily Stories and promotional campaigns. Developed the Charlie’s × RobRoyBar collaboration project, including a party bus and merchandise.'],
      results:['+35% к заказам мастеров за счёт Stories и промокампаний. +50% к посещаемости после создания фирменного лукбука.','+35% in barber appointments through Stories and promotional campaigns. +50% in customer traffic after creating the branded lookbook.'],
      images:[['charlies-gallery-1','Charlie’s — фирменная визуальная система','Charlie’s — branded visual system'],['charlies-gallery-2','Промокампания тату-студии','Tattoo studio promotional campaign'],['charlies-gallery-3','Фирменный лукбук Charlie’s','Charlie’s branded lookbook'],['charlies-cover','Логотип Charlie’s','Charlie’s logo']],
      links:[['https://vk.ru/mr.charlies','Charlie’s во ВКонтакте','Charlie’s on VK'],['https://inferno-paralyzed.tilda.ws/','Проект на сайте — внизу страницы','Project website — at the bottom of the page']]}
  ];
  const experience = [
    {company:'OTSERDCA',period:['Июль 2026 — настоящее время','July 2026 — present'],role:['Продуктовый / графический дизайнер','Product / Graphic Designer'],bullets:[['Полный брендинг компании с нуля: одежда, сувенирная продукция и PR-материалы.','Complete company branding from scratch: apparel, merchandise and PR materials.']]},
    {company:'NIKIFILINI',period:['Май 2024 — настоящее время','May 2024 — present'],role:['Product / Graphic / Web / AI Designer','Product / Graphic / Web / AI Designer'],bullets:[['Участие в разработке продуктов и UI/UX для коллаборации NIKIFILINI × ROSTIC’S (KFC).','Contributed to product development and UI/UX for NIKIFILINI × ROSTIC’S (KFC).'],['Внедрение AI в бренде и обучение сотрудников. Оптимизация расходов на съёмки, +150% к скорости добавления коллекций и рекорды вовлечённости в соцсетях.','Introduced AI and trained employees. Streamlined photography costs, accelerated collection uploads by 150% and achieved social engagement records.'],['Переход OTHERS и SOMBRA на AI-фотосессии для Wildberries и обучение коллег. Рост конверсии на 60%.','Moved OTHERS and SOMBRA to AI photography for Wildberries and trained colleagues. Conversion increased by 60%.'],['Веб-баннеры для официального сайта и визуальные коммуникации в соцсетях.','Web banners for the official website and visual communications for social media.']]},
    {company:'KODALIFE',period:['Ноябрь 2025 — февраль 2026','November 2025 — February 2026'],role:['AI-креатор / графический дизайнер','AI Creator / Graphic Designer'],bullets:[['AI-контент для товарных карточек на Ozon и Wildberries.','AI content for product listings on Ozon and Wildberries.'],['Новые визуальные идеи и разработка структурированного брендбука.','New visual concepts and development of a structured brand book.']]},
    {company:'NEONLOVE',period:['Январь 2025 — январь 2026','January 2025 — January 2026'],role:['Бренд-дизайнер','Brand Designer'],bullets:[['Логотип и фирменный стиль розничной сети одежды и аксессуаров.','Logo and visual identity for an apparel and accessories retail chain.'],['Карточки товаров для маркетплейсов, которые повысили конверсию и видимость в ленте.','Marketplace product listings that improved conversion and feed visibility.'],['Маркетинговые идеи для новых продуктов, которые повысили выручку компании на 100%.','Marketing concepts for new products that increased company revenue by 100%.']]},
    {company:'CHARLIE’S BARBERSHOP & TATTOO',period:['Август 2021 — март 2025','August 2021 — March 2025'],role:['Главный продуктовый / графический дизайнер','Lead Product / Graphic Designer'],bullets:[['Ежедневные Stories и промокампании увеличили количество заказов у мастеров на 35%.','Daily Stories and promotional campaigns increased barber appointments by 35%.'],['Фирменный лукбук повысил посещаемость на 50%.','A branded lookbook increased customer traffic by 50%.'],['Проект Charlie’s × RobRoyBar: автобус для вечеринок и фирменный мерч.','Charlie’s × RobRoyBar collaboration project: a party bus and branded merchandise.']]}
  ];
  function renderProjects() {
    $('#project-grid').classList.toggle('filtered', filter !== 'all');
    $('#project-grid').innerHTML = projects.map(p => `<article class="project project-${p.id} reveal" ${filter !== 'all' && p.category !== filter ? 'hidden' : ''}><button class="project-button" data-case="${p.id}" aria-label="${t('Открыть кейс','Open case study')}: ${p.name}"><div class="project-titlebar">${svg('folder')}<span>${p.id.toUpperCase()}.CASE</span><span aria-hidden="true">□</span></div><div class="project-visual"><span class="project-badge">${p.year}</span><img class="project-cover" src="images/${p.cover}.webp" alt="${t(...p.short)}" loading="lazy" width="1200" height="1100">${p.wordmark ? `<span class="project-wordmark">${p.wordmark}</span>` : ''}<span class="project-open">${svg('arrow')}</span></div><div class="project-info"><div class="project-title-row"><h3>${p.name}</h3><span class="micro">${t('СМОТРЕТЬ КЕЙС','VIEW CASE')}</span></div><p class="project-description">${t(...p.short)}</p><div class="project-tags">${p.tags.map(tag => `<span>${tag}</span>`).join('')}</div></div></button></article>`).join('');
    refreshReveals();
  }
  function renderExperience() {
    const opened = $$('.experience-item').map((d,i) => d.open ? i : -1);
    $('#experience-list').innerHTML = experience.map((e,i) => `<details class="experience-item reveal" ${(opened.length ? opened.includes(i) : i === 1) ? 'open' : ''}><summary><span class="experience-number">0${i+1}</span><span><strong class="experience-company">${e.company}</strong><span class="experience-role">${t(...e.role)}</span></span><span class="experience-period">${t(...e.period)}</span>${svg('plus')}</summary><div class="experience-content">${e.bullets.map(b => `<p>${t(...b)}</p>`).join('')}</div></details>`).join('');
    refreshReveals();
  }
  function renderCase() {
    const p = projects.find(p => p.id === activeCase); if (!p) return;
    const next = projects[(projects.indexOf(p)+1)%projects.length];
    $('#case-content').innerHTML = `<div class="case-shell"><span class="case-eyebrow micro">${p.year}</span><h2 id="case-title">${p.id === 'charlies' ? 'CHARLIE’S<br>BARBERSHOP & TATTOO' : p.name}</h2><div class="case-summary"><p>${t(...p.summary)}</p><div class="case-details"><div><span class="micro">${t('РОЛЬ','ROLE')}</span><span>${p.role}</span></div><div><span class="micro">${t('НАПРАВЛЕНИЯ','SCOPE')}</span><span>${p.scope}</span></div></div></div><div class="case-results"><strong>${t('РЕЗУЛЬТАТ','OUTCOME')}</strong><br>${t(...p.results)}</div><div class="case-images">${p.images.map((im,i) => `<figure class="case-figure"><button class="case-image-button" data-image="${i}" aria-label="${t('Увеличить','Enlarge')}: ${t(im[1],im[2])}"><img src="images/${im[0]}.webp" alt="${t(im[1],im[2])}" loading="lazy"><span class="project-open">${svg('plus')}</span></button><figcaption><span class="micro">0${i+1} / </span>${t(im[1],im[2])}</figcaption></figure>`).join('')}</div><div class="case-links">${p.links.map(l => `<a href="${l[0].replaceAll('&','&amp;')}" target="_blank" rel="noopener">${t(l[1],l[2])}${svg('arrow')}</a>`).join('')}</div><button class="case-next" data-case="${next.id}"><span><span class="micro">${t('СЛЕДУЮЩИЙ ПРОЕКТ','NEXT PROJECT')}</span><strong>${next.name}</strong></span>${svg('arrow')}</button></div>`;
  }
  function openCase(id, push = true) {
    if (!projects.some(p => p.id === id)) return;
    lastCaseTrigger = dialog.open ? lastCaseTrigger : document.activeElement;
    activeCase = id; renderCase();
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0; document.body.classList.add('modal-open');
    $('.case-close').focus({preventScroll:true});
    if (push && location.hash !== '#case-'+id) history.pushState(null,'','#case-'+id);
  }
  function closeCase() { if (lightbox.open) lightbox.close(); if (dialog.open) dialog.close(); }
  dialog.addEventListener('close', () => {
    activeCase = null; document.body.classList.remove('modal-open');
    if(location.hash.startsWith('#case-')) history.replaceState(null,'','#work');
    if(lastCaseTrigger?.isConnected) lastCaseTrigger.focus({preventScroll:true});
  });
  $('.case-close').addEventListener('click',closeCase);
  function paintImage() {
    const p = projects.find(p => p.id === activeCase), im = p.images[galleryIndex];
    $('.lightbox-stage img').src = `images/${im[0]}.jpg`;
    $('.lightbox-stage img').alt = t(im[1],im[2]);
    $('.lightbox-caption').textContent = `${p.name} / ${t(im[1],im[2])}`;
    $('.lightbox-count').textContent = `${String(galleryIndex+1).padStart(2,'0')} / ${String(p.images.length).padStart(2,'0')}`;
  }
  function openImage(i) { galleryIndex = i; lastImageTrigger = document.activeElement; paintImage(); lightbox.showModal(); $('.lightbox-close').focus(); }
  function stepImage(n) { const p=projects.find(p=>p.id===activeCase); galleryIndex=(galleryIndex+n+p.images.length)%p.images.length; paintImage(); }
  $('.lightbox-close').addEventListener('click',()=>lightbox.close());
  $('.lightbox-prev').addEventListener('click',()=>stepImage(-1));
  $('.lightbox-next').addEventListener('click',()=>stepImage(1));
  lightbox.addEventListener('close',()=>{if(lastImageTrigger?.isConnected) lastImageTrigger.focus({preventScroll:true});});
  lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();stepImage(1);}if(e.key==='ArrowLeft'){e.preventDefault();stepImage(-1);}});
  let touchX=0;
  $('.lightbox-stage').addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;},{passive:true});
  $('.lightbox-stage').addEventListener('touchend',e=>{const delta=e.changedTouches[0].clientX-touchX;if(Math.abs(delta)>60)stepImage(delta<0?1:-1);},{passive:true});
  document.addEventListener('click',e=>{
    const caseBtn=e.target.closest('[data-case]'); if(caseBtn){openCase(caseBtn.dataset.case);return;}
    const imageBtn=e.target.closest('[data-image]');if(imageBtn)openImage(Number(imageBtn.dataset.image));
  });
  $$('.filter').forEach(btn=>btn.addEventListener('click',()=>{
    filter=btn.dataset.filter; $$('.filter').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn));});renderProjects();
  }));
  function setLanguage(value) {
    lang=value; document.documentElement.lang=value;
    ruContent.forEach((ru,el)=>{el.innerHTML=value==='en'?(translations[el.dataset.i18n]??ru):ru;});
    $$('.lang').forEach(b=>{b.classList.toggle('active',b.dataset.lang===lang);b.setAttribute('aria-pressed',String(b.dataset.lang===lang));});
    $('.copy-email').setAttribute('aria-label',t('Скопировать email','Copy email'));
    $('.menu-toggle').setAttribute('aria-label',t('Открыть меню','Open menu'));
    $('.lightbox-close').setAttribute('aria-label',t('Закрыть изображение','Close image'));
    $('.lightbox-prev').setAttribute('aria-label',t('Предыдущее изображение','Previous image'));
    $('.lightbox-next').setAttribute('aria-label',t('Следующее изображение','Next image'));
    document.title='KIRILL KATIN ★ Personal Cyberspace';
    $('.copy-status').textContent=''; renderProjects(); renderExperience(); if(activeCase)renderCase();
    try{localStorage.setItem('portfolio-language',lang);}catch{}
  }
  $$('.lang').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang)));
  $('.menu-toggle').addEventListener('click',()=>{
    const nav=$('.mobile-nav'), open=nav.hidden; nav.hidden=!open; $('.menu-toggle').setAttribute('aria-expanded',String(open));$('.menu-toggle use').setAttribute('href',open?'#i-close':'#i-menu');
  });
  $$('.mobile-nav a').forEach(a=>a.addEventListener('click',()=>{ $('.mobile-nav').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle use').setAttribute('href','#i-menu');}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('.mobile-nav').hidden){$('.mobile-nav').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle use').setAttribute('href','#i-menu');$('.menu-toggle').focus();}});
  let copyTimer;
  $('.copy-email').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText('infernoggc@yandex.ru');$('.copy-status').textContent=t('Email скопирован','Email copied');}
    catch{ $('.copy-status').textContent=t('Email: infernoggc@yandex.ru — выделите и скопируйте адрес.','Email: infernoggc@yandex.ru — select and copy the address.'); }
    clearTimeout(copyTimer); copyTimer=setTimeout(()=>{$('.copy-status').textContent='';},7000);
  });
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  if('IntersectionObserver' in window && !reduced.matches) {
    document.body.classList.add('motion');
    observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.05});
  }
  function refreshReveals() { $$('.reveal:not(.visible)').forEach(el=>{if(observer)observer.observe(el);else el.classList.add('visible');}); }
  reduced.addEventListener?.('change',e=>{if(e.matches){document.body.classList.remove('motion');observer?.disconnect();}});
  let scrollTick=false;
  addEventListener('scroll',()=>{if(scrollTick)return;scrollTick=true;requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;$('.scroll-progress').style.transform=`scaleX(${max>0?scrollY/max:0})`;scrollTick=false;});},{passive:true});
  function syncHash() { const match=location.hash.match(/^#case-(.+)$/); if(match)openCase(match[1],false);else if(dialog.open)closeCase(); }
  addEventListener('popstate',syncHash);addEventListener('hashchange',syncHash);
  let stored='ru';try{if(localStorage.getItem('portfolio-language')==='en')stored='en';}catch{}
  setLanguage(stored);$('#year').textContent=new Date().getFullYear();refreshReveals();syncHash();
})();
