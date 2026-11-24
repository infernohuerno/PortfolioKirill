(() => {
  'use strict';
  const canvas = document.querySelector('.particle-field');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = {x: 0, y: 0, active: false, down: false, speed: 0, last: 0};
  const visibleSections = new Set();
  const points = [];
  const ripples = [];
  let width = 1, height = 1, time = 0, previous = 0, frame = 0;
  const tau = Math.PI * 2;

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    points.length = 0;
    const columns = Math.max(38, Math.min(125, Math.round(width / 10)));
    const rows = width < 720 ? 15 : 25;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        points.push({
          u: (col + .25 * (row % 2)) / (columns - 1), v: row / (rows - 1),
          size: .8 + Math.random() * 1.1, phase: Math.random() * tau,
          dust: false, x: 0, y: 0, dx: 0, dy: 0, vx: 0, vy: 0
        });
      }
    }
    for (let i = 0; i < columns * 2; i++) {
      points.push({u: Math.random(), v: Math.random(), size: .7 + Math.random() * 1.6,
        phase: Math.random() * tau, dust: true, x: 0, y: 0, dx: 0, dy: 0, vx: 0, vy: 0});
    }
    paint(0);
  }

  function paint(step) {
    time += step / 60;
    while (ripples.length && time-ripples[0].at>1.8) ripples.shift();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#e8e8e8';
    const damp = Math.pow(.88, step);
    const reach = Math.min(width * .55, pointer.down ? 335 : 200);
    const reachSq = reach * reach;
    pointer.speed *= Math.pow(.88, step);
    for (const p of points) {
      const angle = p.u * 6.7 + .25 * time;
      const fold = Math.sin(angle + 1.6 * p.v);
      const strand = p.v<.5 ? -1 : 1;
      const weave = Math.sin(p.u*6.9-time*.34+1.3);
      const hem = .53 + .19 * Math.sin(4.5 * p.u - .19 * time + 1.25) + .08 * fold + strand*.13*weave;
      const spread = .17 + .09 * Math.cos(angle - .7);
      const homeX = p.dust ? p.u * width + 15 * Math.sin(.22*time+p.phase) :
        width * (p.u*1.13-.065) + (p.v-.5)*47*Math.cos(angle);
      const homeY = p.dust ? p.v * height + 12 * Math.cos(.27*time+p.phase) :
        height * (hem + (p.v-.5)*spread*2 + .055*Math.sin(2*angle+2*p.v));
      const x = homeX + p.dx, y = homeY + p.dy;
      let ax = -p.dx*.014, ay = -p.dy*.014, glow = 0;
      for (const wave of ripples) {
        const rx=x-wave.x,ry=y-wave.y,dist=Math.hypot(rx,ry)||1;
        const age=time-wave.at, crest=1-Math.abs(dist-age*360)/45;
        if(crest>0) {
          const force=crest*(1-age/1.8)*1.8;
          ax+=rx/dist*force;ay+=ry/dist*force;glow=Math.max(glow,crest*.72);
        }
      }
      if (pointer.active) {
        const rx = pointer.x - x, ry = pointer.y - y, d2 = rx*rx + ry*ry;
        if (d2 < reachSq) {
          const d = Math.max(1,Math.sqrt(d2)), weight = (1 - d/reach) ** 1.3;
          // A moving pointer parts the fabric. A still or held pointer winds it inward.
          const radius = pointer.down ? 10 + p.v*20 : 37 + p.v*30;
          const strength = pointer.down ? .11 : .04;
          const pull = ((d-radius)*strength - (pointer.down ? 0 : pointer.speed*.22)) * weight;
          const curl = weight * (pointer.down ? 1.25 : .65);
          ax += (rx*pull - ry*curl)/d;
          ay += (ry*pull + rx*curl)/d;
          glow = Math.max(glow,weight*.6);
        }
      }
      p.vx = (p.vx + ax*step)*damp; p.vy = (p.vy + ay*step)*damp;
      p.dx += p.vx*step; p.dy += p.vy*step;
      p.x = homeX+p.dx; p.y = homeY+p.dy;
      const ridge = (1+Math.cos(angle*1.6-p.v*4.4))*.5;
      const glint=Math.max(0,Math.cos(angle*2.7-time*1.35+p.v*2.3))**12;
      ctx.globalAlpha = Math.min(.95, (p.dust ? .21 : .12+.25*ridge+.19*glint) + glow);
      const size = p.size * (p.dust ? 1.05 : .73+.46*ridge) + glow*.7;
      ctx.fillRect(p.x, p.y, size, size);
      if (p.dust && p.size>2.19) {
        ctx.fillRect(p.x-size, p.y+size*.38, size*3, .7);
        ctx.fillRect(p.x+size*.38, p.y-size, .7, size*3);
      }
    }
    ctx.globalAlpha = 1;
  }
  function enabled() {
    const mode = document.documentElement.dataset.motion;
    return (mode ? mode === 'on' : !reduced.matches) && !document.hidden &&
      !document.body.matches('.arcade-playing,.modal-open') && visibleSections.size > 0;
  }
  function tick(now) {
    if (!previous || now-previous >= 1000/36-1) {
      paint(previous ? Math.min(2.5,(now-previous)*.06) : 1);
      previous=now;
    }
    frame=requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame=0; previous=0;
    if (enabled()) frame=requestAnimationFrame(tick);
    else { pointer.active=false; pointer.down=false; }
  }
  function move(e) {
    if (!frame || !e.isPrimary || (e.pointerType === 'touch' && !pointer.down)) return;
    const now = performance.now(), elapsed = Math.max(8, now-pointer.last);
    pointer.speed = pointer.active ? Math.min(80,16*Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)/elapsed) : 0;
    pointer.x=e.clientX; pointer.y=e.clientY; pointer.active=true; pointer.last=now;
  }
  function release(e) {
    if (!pointer.down || !e.isPrimary) return;
    pointer.down=false;
    for (const p of points) {
      const dx=p.x-pointer.x, dy=p.y-pointer.y, d=Math.hypot(dx,dy);
      if (d<=0 || d>=185) continue;
      const pulse=18*(1-d/185);
      p.vx+=pulse*dx/d; p.vy+=pulse*dy/d;
    }
    if (e.pointerType==='touch') pointer.active=false;
  }
  function leave() { pointer.active=false; pointer.down=false; }
  document.addEventListener('pointermove',move,{passive:true});
  document.addEventListener('pointerdown',e=>{
    if (!frame || !e.isPrimary || e.button!==0 || e.target.closest('a,button,summary,dialog,.deck-stage')) return;
    pointer.down=true; move(e);
  },{passive:true});
  window.addEventListener('pointerup',release,{passive:true});
  window.addEventListener('star-kick',e=>{
    if(!frame)return;
    if(ripples.length>=3)ripples.shift();
    ripples.push({x:e.detail.x,y:e.detail.y,at:time});
  });
  document.addEventListener('pointercancel',leave);
  document.addEventListener('pointerout',e=>{if (!e.relatedTarget) leave();});
  window.addEventListener('blur',leave);
  const sections=new IntersectionObserver(entries=>{
    for (const e of entries) {
      if (e.isIntersecting) visibleSections.add(e.target);
      else visibleSections.delete(e.target);
    }
    sync();
  });
  document.querySelectorAll('#top,#work,.impact,#experience').forEach(section=>sections.observe(section));
  new ResizeObserver(resize).observe(canvas);
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
  reduced.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
})();
