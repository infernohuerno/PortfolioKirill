(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PixelPatrol = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  function random(s) { s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0; return s.seed / 4294967296; }
  function spawn(s) {
    const columns = Math.min(9, Math.max(5, Math.floor((s.width - 50) / 28)));
    const spacing = Math.min(28, (s.width - 50) / columns);
    const left = (s.width - (columns - 1) * spacing) / 2;
    s.enemies = [];
    for (let row = 0; row < 3; row++) for (let col = 0; col < columns; col++) {
      s.enemies.push({ x: left + col * spacing, y: 45 + row * 18, type: row, alive: true });
    }
    s.bullets = []; s.direction = 1; s.moveClock = 0; s.enemyClock = .8;
    s.player.y = s.height - 30;
  }
  function create(width, height, best = 0, seed = Date.now()) {
    const s = { width, height, best, seed: seed >>> 0, mode: 'playing', score: 0, lives: 3, wave: 1, time: 0,
      player: { x: width / 2, y: height - 30, shield: 1 }, bullets: [], particles: [], enemies: [], cooldown: 0 };
    spawn(s); return s;
  }
  function shoot(s) {
    if (s.mode !== 'playing' || s.cooldown > 0) return false;
    s.bullets.push({ x: s.player.x, y: s.player.y - 7, side: 'player' });
    s.cooldown = .19; return true;
  }
  function burst(s, x, y, color) {
    for (let i = 0; i < 9; i++) s.particles.push({ x, y, vx: (random(s) - .5) * 55, vy: (random(s) - .5) * 55, life: .35, color });
  }
  function step(s, elapsed, input = {}) {
    if (s.mode !== 'playing') return;
    const dt = clamp(elapsed, 0, .05);
    s.time += dt; s.cooldown = Math.max(0, s.cooldown - dt); s.player.shield = Math.max(0, s.player.shield - dt);
    if (input.move) s.player.x += input.move * 145 * dt;
    else if (Number.isFinite(input.pointer)) s.player.x = input.pointer;
    s.player.x = clamp(s.player.x, 12, s.width - 12);
    if (input.fire) shoot(s);
    const living = s.enemies.filter(e => e.alive);
    s.moveClock += dt;
    const interval = Math.max(.07, .36 - s.wave * .023 - (s.enemies.length - living.length) * .005);
    if (s.moveClock >= interval && living.length) {
      s.moveClock = 0;
      const edge = living.some(e => e.x + s.direction * 4 < 12 || e.x + s.direction * 4 > s.width - 12);
      if (edge) s.direction *= -1;
      living.forEach(e => { e.x += s.direction * 4; if (edge) e.y += 6; });
    }
    s.enemyClock -= dt;
    if (s.enemyClock <= 0 && living.length) {
      const front = living.filter(e => !living.some(other => Math.abs(other.x - e.x) < 8 && other.y > e.y));
      const e = front[Math.floor(random(s) * front.length)];
      s.bullets.push({ x: e.x, y: e.y + 6, side: 'enemy' });
      s.enemyClock = Math.max(.27, .9 - s.wave * .05) + random(s) * .3;
    }
    for (const b of s.bullets) {
      const previousY = b.y;
      b.y += (b.side === 'player' ? -230 : 66 + Math.min(35, s.wave * 4)) * dt;
      if (b.side === 'player') {
        const target = living.find(e => e.alive && Math.abs(e.x - b.x) < 6 && e.y + 5 >= b.y && e.y - 5 <= previousY);
        if (target) {
          target.alive = false; b.dead = true; s.score += 10 * s.wave; burst(s, target.x, target.y, ['#ff7fdb', '#9df1ef', '#edff3d'][target.type]);
        }
      } else if (Math.abs(b.x - s.player.x) < 6 && b.y >= s.player.y - 5 && previousY <= s.player.y + 5) {
        b.dead = true;
        if (s.player.shield === 0) {
          s.lives--; s.player.shield = 1.5; burst(s, s.player.x, s.player.y, '#fff');
          if (s.lives <= 0) s.mode = 'gameover';
        }
      }
    }
    s.bullets = s.bullets.filter(b => !b.dead && b.y > 20 && b.y < s.height - 15);
    for (const p of s.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
    s.particles = s.particles.filter(p => p.life > 0);
    if (living.some(e => e.alive && e.y >= s.player.y - 10)) { s.lives = 0; s.mode = 'gameover'; }
    if (s.mode === 'playing' && !s.enemies.some(e => e.alive)) { s.score += 100; s.wave++; spawn(s); s.player.shield = 1; }
    s.best = Math.max(s.best, s.score);
  }
  function resize(s, width, height) {
    const xRatio = width / s.width, yRatio = height / s.height;
    s.player.x = clamp(s.player.x * xRatio, 12, width - 12); s.player.y = height - 30;
    s.enemies.forEach(e => { e.x = clamp(e.x * xRatio, 12, width - 12); e.y = Math.min(e.y * yRatio, s.player.y - 18); });
    s.bullets = []; s.width = width; s.height = height;
  }
  return { create, shoot, step, resize };
});
