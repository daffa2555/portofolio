(function(){
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- canvas starfield + scroll-reactive AI pulse ---- */
  const canvas=document.getElementById('space'),ctx=canvas.getContext('2d');
  let W,H,DPR,cx,cy,stars=[],rings=[],t=0,scrollY=0,targetScroll=0;
  function resize(){
    DPR=Math.min(devicePixelRatio||1,2);
    W=canvas.width=innerWidth*DPR;H=canvas.height=innerHeight*DPR;
    canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';
    cx=W/2;cy=H*0.5;
    const n=Math.floor((innerWidth*innerHeight)/4200);stars=[];
    for(let i=0;i<n;i++)stars.push({x:Math.random()*W,y:Math.random()*H,z:Math.random()*0.8+0.2,r:(Math.random()*1.3+.2)*DPR,a:Math.random()*0.6+0.15,tw:Math.random()*6.28,sp:Math.random()*0.015+0.004});
  }
  let lastRing=0;
  function draw(){
    t++;scrollY+=(targetScroll-scrollY)*0.08;
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*0.75);
    g.addColorStop(0,'rgba(14,20,52,0.55)');g.addColorStop(0.5,'rgba(5,9,22,0.85)');g.addColorStop(1,'rgba(4,6,14,1)');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    for(const s of stars){
      s.tw+=s.sp;const yy=(s.y-scrollY*s.z*0.4*DPR)%H;const ry=yy<0?yy+H:yy;
      const tw=0.5+0.5*Math.sin(s.tw);
      ctx.beginPath();ctx.arc(s.x,ry,s.r,0,6.28);ctx.fillStyle='rgba(205,224,255,'+(s.a*tw)+')';ctx.fill();
    }
    if(!reduce){if(t-lastRing>55){rings.push({rad:18*DPR,life:1});lastRing=t;}}
    else if(rings.length===0){rings.push({rad:18*DPR,life:1});}
    for(let i=rings.length-1;i>=0;i--){const r=rings[i];r.rad+=2*DPR;r.life-=0.006;if(r.life<=0){rings.splice(i,1);continue;}
      ctx.beginPath();ctx.ellipse(cx,cy,r.rad,r.rad*0.92,0,0,6.28);ctx.lineWidth=1.3*DPR;ctx.strokeStyle='rgba(139,92,255,'+(r.life*0.4)+')';ctx.stroke();
      ctx.beginPath();ctx.ellipse(cx,cy,r.rad*0.6,r.rad*0.55,0,0,6.28);ctx.strokeStyle='rgba(95,224,255,'+(r.life*0.25)+')';ctx.lineWidth=1*DPR;ctx.stroke();}
    const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,260*DPR);cg.addColorStop(0,'rgba(77,120,255,0.18)');cg.addColorStop(1,'rgba(77,120,255,0)');ctx.fillStyle=cg;ctx.fillRect(0,0,W,H);
    requestAnimationFrame(draw);
  }
  addEventListener('resize',resize,{passive:true});
  addEventListener('scroll',()=>{targetScroll=window.scrollY;},{passive:true});
  resize();draw();

  /* progress bar */
  const prog=document.getElementById('prog');
  addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;prog.style.width=(h>0?(window.scrollY/h)*100:0)+'%';},{passive:true});

  /* typing line in hero */
  const typed=document.getElementById('typed');
  const phrases=['> building Bord-AI','> training the next agent','> shipping > 90% and beyond','> from Mataram with code'];
  if(typed && !reduce){
    let pi=0,ci=0,del=false;
    (function type(){
      const p=phrases[pi];
      typed.textContent=p.slice(0,ci);
      if(!del){ci++;if(ci>p.length){del=true;setTimeout(type,1400);return;}}
      else{ci--;if(ci<0){del=false;pi=(pi+1)%phrases.length;ci=0;}}
      setTimeout(type,del?40:75);
    })();
  } else if(typed){ typed.textContent=phrases[0]; }

  /* split manifesto into words */
  const man=document.getElementById('manifesto');
  if(man){
    man.innerHTML=man.textContent.trim().split(' ').map(w=>{
      const hl=/run\.?|things/.test(w);
      return '<span class="w'+(hl?' hl':'')+'">'+w+'</span>';
    }).join(' ');
  }

  if(reduce || !window.gsap){
    document.querySelectorAll('.rv,.w').forEach(e=>e.style.opacity=1);
    window.gsap&&gsap.set('#orb',{xPercent:-50,yPercent:-50});
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const orb=document.getElementById('orb');
  gsap.set(orb,{xPercent:-50,yPercent:-50});
  const shift=()=>Math.min(innerWidth*0.30,420);

  /* orb choreography across the page */
  gsap.timeline({scrollTrigger:{trigger:document.documentElement,start:'top top',end:'bottom bottom',scrub:1,invalidateOnRefresh:true}})
    .to(orb,{scale:0.7,y:-10,duration:.18,ease:'none'})                         // hero -> about
    .to(orb,{x:()=>shift(),scale:0.42,rotate:120,duration:.2,ease:'none'})      // -> stack (drift right)
    .to(orb,{x:0,scale:0.9,rotate:240,duration:.2,ease:'none'})                 // -> featured (center)
    .to(orb,{x:()=>-shift(),scale:0.42,rotate:360,duration:.2,ease:'none'})     // -> work (drift left)
    .to(orb,{x:0,scale:1.35,rotate:420,opacity:.85,duration:.22,ease:'none'});  // -> contact (grow)

  /* generic reveals */
  gsap.utils.toArray('.rv').forEach(el=>{
    gsap.from(el,{opacity:0,y:42,duration:.9,ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 86%',toggleActions:'play none none none'}});
  });

  /* hero load-in */
  gsap.from('.hero .rv',{opacity:0,y:50,duration:1,stagger:.12,ease:'power3.out',delay:.2});

  /* manifesto word reveal on scroll */
  gsap.to('.about .w',{opacity:1,stagger:.1,ease:'none',
    scrollTrigger:{trigger:'.about',start:'top 70%',end:'bottom 75%',scrub:true}});

  /* smooth nav */
  document.querySelectorAll('header a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{e.preventDefault();const el=document.querySelector(a.getAttribute('href'));el&&el.scrollIntoView({behavior:'smooth'});});
  });
})();
