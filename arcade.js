(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const core = window.PixelPatrol, stage = $('#arcade-stage'), canvas = $('#arcade-canvas');
  if (!core || !canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  const desktop = matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine)');
  const shell = $('.desktop-shell'), dock = $('.arcade-dock'), hud = $('.arcade-hud'), prompt = $('.arcade-prompt');
  const start = $('#arcade-start'), pause = $('#arcade-pause'), back = $('#arcade-back'), resume = $('#arcade-resume');
  const keys = new Set();
  let active = false, state = null, frame = 0, previousTime = 0, pointer = null, clickShot = false, best = 0, savedBest = 0, lastMode = '', returnFocus = null;
  try { const n = Number(localStorage.getItem('pixel-patrol-best')); if (Number.isFinite(n) && n >= 0) best = Math.min(n, 9999999); } catch {}
  savedBest = best;
  const words = {
    ru: { start:'Играть на фоне', pause:'Пауза', resume:'Продолжить', back:'Вернуть портфолио', restart:'Ещё раз', score:'ОЧКИ', best:'РЕКОРД', lives:'ЖИЗНИ', wave:'ВОЛНА', paused:'ПАУЗА', over:'GAME OVER', hint:'← → / A D — движение · пробел / клик — огонь · P — пауза · Esc — портфолио', pauseHint:'Игра ждёт. Портфолио можно вернуть в любой момент.', overHint:'Битые пиксели победили. Попробуем ещё раз?', stage:'Пиксельная аркада. Стрелки или A и D — движение, пробел — огонь, P — пауза, Escape — вернуть портфолио.' },
    en: { start:'Play in background', pause:'Pause', resume:'Resume', back:'Back to portfolio', restart:'Play again', score:'SCORE', best:'BEST', lives:'LIVES', wave:'WAVE', paused:'PAUSED', over:'GAME OVER', hint:'← → / A D — move · space / click — fire · P — pause · Esc — portfolio', pauseHint:'Take your time. Your portfolio is one click away.', overHint:'The broken pixels won this time. One more round?', stage:'Pixel arcade. Arrows or A and D to move, Space to fire, P to pause, Escape to return to the portfolio.' }
  };
  const text = () => words[document.documentElement.lang === 'en' ? 'en' : 'ru'];
  const sprites = [
    ['00100100','00011000','00111100','01111110','11011011','11111111','10100101','00100100'],
    ['00111100','01111110','11011011','11111111','00100100','01011010','10100101','01000010'],
    ['00011000','00111100','01111110','11011011','11111111','00100100','01000010','10000001']
  ];
  const ship = ['00000100000','00001110000','00001110000','00111111100','01111111110','11111111111','11100100111'];
  function sprite(rows, x, y, color, animation = false) {
    ctx.fillStyle = color; const left = Math.round(x - rows[0].length / 2), top = Math.round(y - rows.length / 2);
    rows.forEach((row, yy) => [...row].forEach((pixel, xx) => { if (pixel === '1') ctx.fillRect(left + xx + (animation && yy === rows.length - 1 ? (xx % 2 ? 1 : -1) : 0), top + yy, 1, 1); }));
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!active) {
      if (desktop.matches) {
        const rect = shell.getBoundingClientRect(), gap = rect.left / 3;
        if (gap > 16) sprite(sprites[0], gap / 2, 48, '#af95d0');
        if ((innerWidth - rect.right) / 3 > 16) sprite(sprites[2], canvas.width - gap / 2, 65, '#78c9d5');
      }
      return;
    }
    const colors = ['#ff7fdb','#9df1ef','#edff3d'];
    state.enemies.forEach(e => { if (e.alive) sprite(sprites[e.type], e.x, e.y, colors[e.type], Math.floor(state.time * 3) % 2 === 1); });
    ctx.fillStyle = '#8d70b2'; ctx.fillRect(12, state.player.y + 12, canvas.width - 24, 1);
    if (state.mode !== 'gameover') {
      sprite(ship, state.player.x, state.player.y, '#edff3d');
      if (state.player.shield > 0) { ctx.strokeStyle = '#9df1ef'; ctx.strokeRect(Math.round(state.player.x - 8), Math.round(state.player.y - 6), 16, 12); }
    }
    state.bullets.forEach(b => { ctx.fillStyle = b.side === 'player' ? '#fff' : '#ff7fdb'; ctx.fillRect(Math.round(b.x), Math.round(b.y), 1, b.side === 'player' ? 4 : 3); });
    state.particles.forEach(p => { ctx.fillStyle = p.color; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); });
  }
  function paintUI() {
    const w = text();
    $('#arcade-start-text').textContent = w.start; pause.textContent = state?.mode === 'paused' ? w.resume : w.pause; back.textContent = w.back;
    pause.hidden = !active || state?.mode === 'gameover';
    $('#arcade-controls').textContent = w.hint; stage.setAttribute('aria-label', w.stage);
    ['score','best','lives','wave'].forEach(k => $(`#arcade-${k}-label`).textContent = w[k]);
    $('#arcade-score').textContent = String(state?.score || 0).padStart(5, '0');
    $('#arcade-best').textContent = String(state?.best ?? best).padStart(5, '0');
    $('#arcade-lives').textContent = String(state?.lives ?? 3); $('#arcade-wave').textContent = String(state?.wave ?? 1).padStart(2,'0');
    $('#arcade-idle-best').textContent = `HI ${String(best).padStart(5,'0')}`;
    const stopped = active && state.mode !== 'playing'; prompt.hidden = !stopped;
    if (stopped) {
      $('#arcade-message').textContent = state.mode === 'paused' ? w.paused : w.over;
      $('#arcade-prompt-text').textContent = state.mode === 'paused' ? w.pauseHint : `${w.overHint} ${w.score}: ${state.score}.`;
      resume.textContent = state.mode === 'paused' ? w.resume : w.restart;
    }
    if (state?.best > savedBest) { savedBest = best = state.best; try { localStorage.setItem('pixel-patrol-best', String(best)); } catch {} }
  }
  function size() {
    const width = Math.max(1, Math.floor(innerWidth / 3)), height = Math.max(1, Math.floor(innerHeight / 3));
    canvas.width = width; canvas.height = height; ctx.imageSmoothingEnabled = false;
    if (state && active) { core.resize(state, width, height); if (state.mode === 'playing') setPaused(true); }
    draw();
  }
  function tick(time) {
    frame = 0; if (!active || state.mode !== 'playing') return;
    const dt = previousTime ? (time - previousTime) / 1000 : 0; previousTime = time;
    const move = (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0);
    const oldScore = state.score, oldLives = state.lives, oldWave = state.wave;
    core.step(state, dt, {move, pointer, fire: keys.has('Space') || clickShot}); clickShot = false;
    if (oldScore !== state.score || oldLives !== state.lives || oldWave !== state.wave || lastMode !== state.mode) paintUI();
    lastMode = state.mode; draw();
    if (state.mode === 'playing') frame = requestAnimationFrame(tick);
    else { keys.clear(); resume.focus({preventScroll:true}); }
  }
  function loop() { cancelAnimationFrame(frame); previousTime = 0; if (active && state.mode === 'playing') frame = requestAnimationFrame(tick); }
  function setPaused(on) {
    if (!active || state.mode === 'gameover') return;
    state.mode = on ? 'paused' : 'playing'; keys.clear(); pointer = null; clickShot = false; paintUI(); draw(); loop();
    if (!on) stage.focus({preventScroll:true});
  }
  function launch() {
    if (!desktop.matches || document.querySelector('dialog[open]')) return;
    if (!active) returnFocus = document.activeElement;
    active = true; document.body.classList.add('arcade-playing'); shell.inert = true;
    stage.removeAttribute('aria-hidden');
    shell.setAttribute('aria-hidden','true'); start.hidden = true; pause.hidden = false; back.hidden = false; hud.hidden = false;
    state = core.create(canvas.width, canvas.height, best); lastMode = 'playing'; keys.clear(); pointer = null; clickShot = false;
    paintUI(); draw(); stage.focus({preventScroll:true}); loop();
  }
  function exit() {
    if (!active) return;
    active = false; cancelAnimationFrame(frame); frame = 0; keys.clear(); pointer = null; clickShot = false;
    document.body.classList.remove('arcade-playing'); shell.inert = false; shell.removeAttribute('aria-hidden');
    stage.setAttribute('aria-hidden','true');
    start.hidden = false; pause.hidden = true; back.hidden = true; hud.hidden = true; prompt.hidden = true; paintUI(); draw();
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  }
  start.addEventListener('click', launch); back.addEventListener('click', exit);
  pause.addEventListener('click', () => setPaused(state.mode === 'playing'));
  resume.addEventListener('click', () => state.mode === 'gameover' ? launch() : setPaused(false));
  document.addEventListener('keydown', e => {
    if (!active || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.code === 'Escape') { e.preventDefault(); exit(); return; }
    if (e.code === 'KeyP' && !e.repeat) { e.preventDefault(); setPaused(state.mode === 'playing'); return; }
    if (e.target.closest('button,a,input,textarea')) return;
    if (['ArrowLeft','ArrowRight','KeyA','KeyD','Space'].includes(e.code)) {
      e.preventDefault(); keys.add(e.code); if (e.code !== 'Space') pointer = null;
      if (e.code === 'Space' && !e.repeat && state.mode === 'playing') clickShot = true;
    }
  });
  document.addEventListener('keyup', e => keys.delete(e.code));
  document.addEventListener('pointermove', e => {
    if (active && state.mode === 'playing' && e.pointerType !== 'touch' && !e.target.closest('.arcade-dock,.arcade-hud,.arcade-prompt')) pointer = e.clientX / 3;
  }, {passive:true});
  document.addEventListener('pointerdown', e => {
    if (active && state.mode === 'playing' && e.button === 0 && !e.target.closest('.arcade-dock,.arcade-hud,.arcade-prompt')) { clickShot = true; stage.focus({preventScroll:true}); }
  });
  addEventListener('blur', () => { if (active && state.mode === 'playing') setPaused(true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && active && state.mode === 'playing') setPaused(true); });
  addEventListener('resize', size);
  desktop.addEventListener('change', () => { if (!desktop.matches) exit(); dock.hidden = !desktop.matches; stage.hidden = !desktop.matches; size(); });
  new MutationObserver(paintUI).observe(document.documentElement, {attributes:true,attributeFilter:['lang']});
  dock.hidden = !desktop.matches; stage.hidden = !desktop.matches; size(); paintUI();
})();
