(() => {
  'use strict';
  const outline = window.mascotOutline, tau = 2*Math.PI;
  const field = document.querySelector('.star-world'), print = document.querySelector('.mascot-poster');
  const pause = document.querySelector('.motion-control'), launch = document.querySelector('.star-launch');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const stars = [], visible = new Set();
  let width=1,height=1,dpr=1,frame=0,last=0,clock=0,playing=!reduce.matches;
  let renderer, ready=false, heroVisible=false, held=null, pointerId=null, lastPointer=null;
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

  function rotation(x,y,z) {
    const a=Math.cos(x),b=Math.sin(x),c=Math.cos(y),d=Math.sin(y),e=Math.cos(z),f=Math.sin(z);
    return [e*c,f*c,-d,e*d*b-f*a,f*d*b+e*a,c*b,e*d*a+f*b,f*d*a-e*b,c*a];
  }
  function geometry() {
    const vertices=[], indices=[];
    function ring(scale,z,face,bevel,material) {
      const start=vertices.length/9;
      outline.forEach(([x,y],i)=>{
        const prev=outline[(i+outline.length-1)%outline.length],next=outline[(i+1)%outline.length];
        const ex=next[1]-prev[1],ey=prev[0]-next[0],len=Math.hypot(ex,ey)||1;
        const nx=ex/len*bevel,ny=ey/len*bevel;
        vertices.push(x*scale,y*scale,z,nx,ny,face,(1+x*scale)/2,(1+y*scale)/2,material);
      });
      return start;
    }
    function join(a,b) {
      for (let i=0;i<outline.length;i++) {
        const j=(i+1)%outline.length;
        indices.push(a+i,b+i,b+j,a+i,b+j,a+j);
      }
    }
    for (const sign of [-1,1]) {
      const center=vertices.length/9;
      vertices.push(0,0,.20*sign,0,0,sign,.5,.5,0);
      const mid=ring(.56,.183*sign,sign,.06,0),face=ring(.968,.145*sign,sign,.13,0);
      for(let i=0;i<outline.length;i++) indices.push(center,mid+i,mid+(i+1)%outline.length);
      join(mid,face);
      const lip=ring(.968,.145*sign,.88*sign,.4,1);
      const bevel=ring(.994,.111*sign,.46*sign,.9,1);
      const edge=ring(1,.073*sign,.07*sign,1,1);
      join(lip,bevel);join(bevel,edge);
    }
    join(ring(1,-.073,-.03,1,2),ring(1,.073,.03,1,2));
    return {vertices:new Float32Array(vertices),indices:new Uint16Array(indices)};
  }
  function gpu(canvas) {
    if(location.protocol==='file:') return null;
    const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'});
    if(!gl) return null;
    const program=gl.createProgram();
    const vs=`
      attribute vec3 position, normal;
      attribute vec2 uv;
      attribute float part;
      uniform mat3 rotation;
      uniform vec2 center, scale;
      uniform float layer;
      varying vec3 N;
      varying vec2 tex;
      varying float surface;
      void main(){
        vec3 p=rotation*position; N=rotation*normal; tex=uv; surface=part;
        gl_Position=vec4(center+p.xy*scale, -layer*.65-p.z*.045,1.);
      }`;
    const fs=`
      precision mediump float;
      uniform sampler2D ink;
      varying vec3 N;
      varying vec2 tex;
      varying float surface;
      void main(){
        vec3 n=normalize(N), l=normalize(vec3(-.38,.68,1.));
        vec3 albedo=surface<.5 ? texture2D(ink,tex).rgb : (surface<1.5 ? vec3(1.,.945,.78) : vec3(.87,.64,.20));
        float light=.62+.38*max(0.,dot(n,l));
        float shine=pow(max(0.,dot(reflect(-l,n),vec3(0.,0.,1.))),23.);
        gl_FragColor=vec4(albedo*light+vec3(shine*(surface<.5?.14:.44)),1.);
      }`;
    for(const [type,src] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]) {
      const shader=gl.createShader(type);gl.shaderSource(shader,src);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) return null;
      gl.attachShader(program,shader);
    }
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) return null;
    gl.useProgram(program);
    const shape=geometry();
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,shape.vertices,gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,shape.indices,gl.STATIC_DRAW);
    for(const [name,count,offset] of [['position',3,0],['normal',3,12],['uv',2,24],['part',1,32]]) {
      const at=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,count,gl.FLOAT,false,36,offset);
    }
    const texture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,print);
    for(const flag of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D,flag,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.enable(gl.DEPTH_TEST);
    const uniforms={};
    for(const name of ['rotation','center','scale','layer']) uniforms[name]=gl.getUniformLocation(program,name);
    return bodies=>{
      gl.viewport(0,0,canvas.width,canvas.height); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      for(const b of bodies) {
        gl.uniformMatrix3fv(uniforms.rotation,false,b.matrix);
        gl.uniform2f(uniforms.center,2*b.x/width-1,1-2*b.y/height);
        gl.uniform2f(uniforms.scale,2*b.r/width,2*b.r/height);
        gl.uniform1f(uniforms.layer,b.depth);
        gl.drawElements(gl.TRIANGLES,shape.indices.length,gl.UNSIGNED_SHORT,0);
      }
    };
  }
  function software(canvas) {
    const ctx=canvas.getContext('2d');
    const path=new Path2D();
    outline.forEach(([x,y],i)=>i ? path.lineTo(x,-y) : path.moveTo(x,-y));path.closePath();
    return bodies=>{
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      for(const b of bodies) {
        const r=b.r,m=b.matrix,sign=m[8]>=0?1:-1;
        for(let i=0;i<=10;i++) {
          const z=(i/10-.5)*.30*sign;
          ctx.setTransform(dpr*r*m[0],-dpr*r*m[1],-dpr*r*m[3],dpr*r*m[4],dpr*(b.x+r*m[6]*z),dpr*(b.y-r*m[7]*z));
          ctx.fillStyle=i<2?'#a5803b':i<8?'#dba93d':'#fff0c8';ctx.fill(path);
          if(i===10)ctx.drawImage(print,-.97,-.97,1.94,1.94);
        }
      }
    };
  }
  let canvas=field.querySelector('canvas');
  function useSoftware() {
    const replacement=document.createElement('canvas');
    canvas.replaceWith(replacement);canvas=replacement;renderer=software(canvas);size();
  }
  function init() {
    try {renderer=gpu(canvas);} catch {renderer=null;}
    if(!renderer) useSoftware();
    else canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useSoftware();},{once:true});
    ready=true;root.classList.add('stars-ready');size();sync();
  }
  // Anchors keep the main composition readable. A kick detaches a star from its orbit.
  const formation=[
    [.735,.40,.195], [.89,.66,.082], [.55,.25,.07], [.92,.18,.064],
    [.57,.68,.054], [.41,.12,.037], [.24,.76,.048], [.08,.66,.035],
    [.15,.17,.025], [.69,.08,.037], [.99,.48,.043], [.44,.48,.032],
    [.81,.84,.036], [.035,.36,.027], [.34,.87,.024], [.61,.91,.029],
    [.84,.29,.03], [.45,.71,.022]
  ];
  function size() {
    const w=field.clientWidth,h=field.clientHeight;
    if(!w||!h) return;
    const sx=w/width,sy=h/height,compact=w<761, count=compact?10:formation.length;
    width=w;height=h;dpr=Math.min(devicePixelRatio||1,1.6);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    const hero=document.querySelector('.sculpture').getBoundingClientRect();
    const sceneY=hero.top+scrollY, central=clamp(sceneY+hero.height*.43,100,h*.8)/h;
    for(let i=0;i<count;i++) {
      const [u,v,k]=formation[i],r=clamp(k*Math.min(w,h)*(.98+(i===0?.12:0)),9,i===0?178:82);
      const atX=compact?(i===0?.61:u):u;
      const atY=compact ? clamp(central+(v-.4)*.77,.12,.94) : clamp(central+(v-.4)*.92,.1,.94);
      const b=stars[i]||{x:atX*w/sx,y:atY*h/sy,vx:0,vy:0,rx:Math.sin(i)*.56-.24,
        ry:i===0?-.44:Math.sin(i*1.7)*1.12,rz:Math.cos(i*2.7)*.34,pitch:0,yaw:0,roll:0,free:0,phase:i*2.4};
      b.x*=sx;b.y*=sy;b.r=r;b.ax=atX*w;b.ay=atY*h;b.depth=k*4+.02;b.matrix=rotation(b.rx,b.ry,b.rz);
      stars[i]=b;
    }
    stars.length=count;
    if(renderer)draw();
  }
  function draw() {renderer([...stars].sort((a,b)=>a.depth-b.depth));}
  function step(dt) {
    clock+=dt;
    for (const b of stars) {
      if(b!==held) {
        const drift=b.r*.20+15,atX=b.ax+drift*Math.sin(clock*.55+b.phase),atY=b.ay+drift*Math.cos(clock*.67+b.phase);
        b.free=Math.max(0,b.free-dt);
        const pull=b.free>0?.06:.83, drag=Math.exp(-(b.free>0?.42:1.04)*dt);
        b.vx=(b.vx+(atX-b.x)*pull*dt)*drag;b.vy=(b.vy+(atY-b.y)*pull*dt)*drag;
        b.x+=b.vx*dt;b.y+=b.vy*dt;
      }
      const boundary=b.r*.78;
      if(b.x<boundary||b.x>width-boundary){b.x=clamp(b.x,boundary,width-boundary);b.vx*=-.79;}
      if(b.y<boundary||b.y>height-boundary){b.y=clamp(b.y,boundary,height-boundary);b.vy*=-.79;}
      const decay=Math.exp(-1.1*dt);
      b.pitch*=decay;b.yaw*=decay;b.roll*=decay;
      b.rx+=(.14*Math.cos(clock*.40+b.phase)+b.pitch)*dt;
      b.ry+=(.28*Math.cos(clock*.32+b.phase)+b.yaw)*dt;
      b.rz+=(.13*Math.sin(clock*.44+b.phase)+b.roll)*dt;
      if (b===stars[0] && b!==held && !b.free) {
        const settle=1-Math.exp(-1.3*dt);
        b.rx+=Math.sin(-.13+.20*Math.sin(clock*.44)-b.rx)*settle;
        b.ry+=Math.sin(-.23+.40*Math.sin(clock*.37)-b.ry)*settle;
        b.rz+=Math.sin(.12+.14*Math.sin(clock*.48)-b.rz)*settle;
      }
      b.matrix=rotation(b.rx,b.ry,b.rz);
    }
    for(let i=0;i<stars.length;i++)for(let j=i+1;j<stars.length;j++){
      const a=stars[i],b=stars[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
      const overlap=(a.r+b.r)*.68-d;
      if(overlap<=0)continue;
      const nx=dx/d,ny=dy/d,weight=b.r*b.r/(a.r*a.r+b.r*b.r);
      const impulse=Math.max(0,-((b.vx-a.vx)*nx+(b.vy-a.vy)*ny))*1.6;
      if(a!==held){a.x-=nx*overlap*weight;a.y-=ny*overlap*weight;a.vx-=nx*impulse*weight;a.vy-=ny*impulse*weight;}
      if(b!==held){b.x+=nx*overlap*(1-weight);b.y+=ny*overlap*(1-weight);b.vx+=nx*impulse*(1-weight);b.vy+=ny*impulse*(1-weight);}
    }
  }
  function tick(now) {
    step(last?Math.min(.04,(now-last)/1000):0);last=now;draw();frame=requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);frame=0;last=0;
    root.dataset.motion=playing?'on':'off';
    const en=root.lang==='en';
    pause.textContent=playing?(en?'Pause motion':'Пауза моушна'):(en?'Play motion':'Включить моушн');
    launch.hidden=!ready;pause.hidden=false;
    field.classList.toggle('distant',!heroVisible);
    if(ready&&visible.size&&!document.hidden&&!document.body.matches('.arcade-playing,.modal-open')&&playing) frame=requestAnimationFrame(tick);
    if(!frame){held=null;pointerId=null;}
  }
  function hit(x,y) {
    const ordered=[...stars].sort((a,b)=>b.depth-a.depth);
    return ordered.find(b=>{
      const m=b.matrix,det=m[0]*m[4]-m[3]*m[1],dx=(x-b.x)/b.r,dy=-(y-b.y)/b.r;
      if(dx*dx+dy*dy>1.06)return false;
      if(Math.abs(det)<.21)return dx*dx+dy*dy<.32;
      const px=(m[4]*dx-m[3]*dy)/det,py=(-m[1]*dx+m[0]*dy)/det;
      let inside=false;
      for(let i=0,j=outline.length-1;i<outline.length;j=i++) {
        const a=outline[i],c=outline[j];
        if((a[1]>py)!==(c[1]>py)&&px<(c[0]-a[0])*(py-a[1])/(c[1]-a[1])+a[0])inside=!inside;
      }
      return inside;
    });
  }
  function kick(b,dx,dy) {
    const angle=Math.atan2(dy,dx),force=Math.max(250,Math.min(width,height)*.72);
    b.vx=Math.cos(angle)*force;b.vy=Math.sin(angle)*force;b.yaw=4.5;b.roll=Math.cos(angle)*3.3;b.free=2.7;
    window.dispatchEvent(new CustomEvent('star-kick',{detail:{x:b.x,y:b.y}}));
  }
  function interactive(target) {
    return target.closest('#top,#work,.impact,#experience') && !target.closest('a,button,summary,dialog,nav,.deck-stage');
  }
  document.addEventListener('pointerdown',e=>{
    if(!frame||!e.isPrimary||e.button!==0||!interactive(e.target))return;
    const b=hit(e.clientX,e.clientY);if(!b)return;
    held=b;pointerId=e.pointerId;
    lastPointer={x:e.clientX,y:e.clientY,originX:e.clientX,originY:e.clientY,t:performance.now(),drag:false};
  },{passive:true});
  document.addEventListener('pointermove',e=>{
    if(!held||e.pointerId!==pointerId)return;
    const p=lastPointer,now=performance.now(),dt=Math.max(.012,(now-p.t)/1000);
    if(Math.hypot(e.clientX-p.originX,e.clientY-p.originY)>5)p.drag=true;
    if(p.drag){
      held.x+=e.clientX-p.x;held.y+=e.clientY-p.y;
      held.vx=clamp((e.clientX-p.x)/dt,-1200,1200);held.vy=clamp((e.clientY-p.y)/dt,-1200,1200);
    }
    p.x=e.clientX;p.y=e.clientY;p.t=now;
  },{passive:true});
  window.addEventListener('pointerup',e=>{
    if(!held||e.pointerId!==pointerId)return;
    if(!lastPointer.drag)kick(held,held.x-e.clientX+3,held.y-e.clientY-4);
    else {held.free=3.1;held.roll=held.vx*.008;held.yaw=held.vy*.005;window.dispatchEvent(new CustomEvent('star-kick',{detail:{x:held.x,y:held.y}}));}
    held=null;pointerId=null;
  },{passive:true});
  const cancel=()=>{held=null;pointerId=null;};
  window.addEventListener('blur',cancel);document.addEventListener('pointercancel',cancel);
  pause.addEventListener('click',()=>{playing=!playing;sync();});
  launch.addEventListener('click',()=>{
    if(!playing){playing=true;sync();}
    kick(stars[0],Math.random()>.5?1:-1,-.5);
  });
  reduce.addEventListener('change',()=>{playing=!reduce.matches;sync();});
  const observer=new IntersectionObserver(entries=>{
    for(const e of entries){if(e.isIntersecting)visible.add(e.target);else visible.delete(e.target);if(e.target.id==='top')heroVisible=e.isIntersecting;}
    sync();
  });
  document.querySelectorAll('#top,#work,.impact,#experience').forEach(el=>observer.observe(el));
  new ResizeObserver(size).observe(field);
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['lang']});
  document.addEventListener('visibilitychange',sync);
  if(print.complete&&print.naturalWidth)init();else print.addEventListener('load',init,{once:true});
})();
