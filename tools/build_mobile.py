#!/usr/bin/env python3
"""Sinh app/football-studio-mobile.html (bản RIÊNG cho điện thoại) từ app/football-studio.html.

File gốc KHÔNG bị sửa. Bản điện thoại thêm:
  1. Bố cục xếp dọc (khung nhân vật trên, menu dưới cuộn riêng) cho màn hình <= 820px.
  2. Cảm ứng: hai ngón zoom + kéo khung; một ngón kéo khung khi đang zoom.
  3. Mượt hơn: dùng lại khán đài đã vẽ khi chỉ kéo tay/chân; lúc kéo thanh trượt vẽ bản nhẹ
     (bỏ làm mờ, khán giả nhỏ, cỏ), dừng tay 0,2 giây thì vẽ lại ĐẦY ĐỦ; gom lần vẽ khi kéo.
     Bản nhẹ/bộ nhớ đệm chỉ dùng cho khung xem trực tiếp, KHÔNG dùng khi xuất PNG.
Dùng: python3 tools/build_mobile.py   (gốc app/football-studio.html -> app/football-studio-mobile.html)
Mỗi chỗ vá phải khớp đúng 1 lần, nếu file gốc đổi nhiều thì script báo lỗi thay vì vá sai.
"""
import sys,os
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src=os.path.join(root,'app','football-studio.html');dst=os.path.join(root,'app','football-studio-mobile.html')
s=open(src,encoding='utf-8').read()
def rep(a,b):
    global s
    n=s.count(a)
    if n!=1: sys.exit(f'LOI: cho va khop {n} lan (can 1): {a[:70]!r}')
    s=s.replace(a,b)

# ---- 1) CSS điện thoại
rep("#tabBar button .lb{display:none}}</style></head><body>","""#tabBar button .lb{display:none}}
/* ===== ĐIỆN THOẠI (chỉ màn hình hẹp) ===== */
@media(max-width:820px){
 html,body{overflow:hidden;-webkit-text-size-adjust:100%}
 .app{grid-template-columns:minmax(0,1fr);grid-template-rows:44dvh minmax(0,1fr)}
 .stage{padding:6px;min-height:0;gap:0}
 .stage svg{max-height:none;height:100%}
 .stage .hint{display:none}
 #tabBar{grid-template-columns:repeat(8,1fr)}
 #zoomBar{top:8px!important;left:8px!important;right:8px;gap:4px!important;flex-wrap:wrap}
 #zoomBar button{padding:5px 8px;font-size:11px;line-height:1.2}
 .panel{border-left:0;border-top:1px solid var(--line);min-height:0;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
 .panel input[type=text],.panel input[type=number],.panel select,.panel textarea{font-size:16px}
 .panel button,.panel .box>h3{touch-action:manipulation;min-height:36px}
 .panel input[type=range]{height:28px}
}
</style></head><body>""")

# ---- 2) cảm ứng: zoom/kéo khung
rep("svg.addEventListener('pointerup',()=>{pan=null});svg.addEventListener('contextmenu',e=>e.preventDefault());\n})();","""svg.addEventListener('pointerup',()=>{pan=null});svg.addEventListener('contextmenu',e=>e.preventDefault());
 const tp=new Map();let tg=null;
 const onHandle=e=>!!(e.target.getAttribute&&e.target.getAttribute('data-h'));
 const tgStart=()=>{
  const a=[...tp.values()];tg=null;
  if(a.some(t=>t.h))return;
  if(a.length>=2){const[p,q]=a;tg={d:Math.hypot(q.x-p.x,q.y-p.y)||1,cx:(p.x+q.x)/2,cy:(p.y+q.y)/2,vb:vb.slice()}}
  else if(a.length===1&&vb[2]<FULL[2]-1){tg={cx:a[0].x,cy:a[0].y,vb:vb.slice(),one:1}}
 };
 svg.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch')return;tp.set(e.pointerId,{x:e.clientX,y:e.clientY,h:onHandle(e)});tgStart()});
 svg.addEventListener('pointermove',e=>{
  const t=tp.get(e.pointerId);if(!t)return;t.x=e.clientX;t.y=e.clientY;if(!tg)return;
  const r=svg.getBoundingClientRect(),a=[...tp.values()];let cx,cy,w;
  if(tg.one){cx=a[0].x;cy=a[0].y;w=tg.vb[2]}
  else{const[p,q]=a;cx=(p.x+q.x)/2;cy=(p.y+q.y)/2;w=Math.max(40,Math.min(FULL[2]*5,tg.vb[2]*tg.d/(Math.hypot(q.x-p.x,q.y-p.y)||1)))}
  const h=w*tg.vb[3]/tg.vb[2];
  const s0=Math.min(r.width/tg.vb[2],r.height/tg.vb[3]),ox0=(r.width-tg.vb[2]*s0)/2,oy0=(r.height-tg.vb[3]*s0)/2;
  const ux=tg.vb[0]+(tg.cx-r.left-ox0)/s0,uy=tg.vb[1]+(tg.cy-r.top-oy0)/s0;
  const s1=Math.min(r.width/w,r.height/h),ox1=(r.width-w*s1)/2,oy1=(r.height-h*s1)/2;
  vb=[ux-(cx-r.left-ox1)/s1,uy-(cy-r.top-oy1)/s1,w,h];apply()});
 const tEnd=e=>{if(!tp.delete(e.pointerId))return;tgStart()};
 svg.addEventListener('pointerup',tEnd);svg.addEventListener('pointercancel',tEnd);
})();""")

# ---- 3) mượt hơn (chỉ khung xem trực tiếp)
rep("function drawNightStadium(parent,scene){\n","var FS_DRAFT=false; // bản nhẹ lúc kéo thanh trượt\nvar fsNightCache={key:null,node:null};\nfunction drawNightStadium(parent,scene){\n")
rep("const blur=svgn('filter',{id:blurId,filterUnits:'userSpaceOnUse',x:-4400,y:-4400,width:9400,height:9400},defs);\n svgn('feGaussianBlur',{stdDeviation:4.1},blur);\n const stands=svgn('g',{filter:'url(#'+blurId+')'},parent);",
"let stands;\n if(FS_DRAFT)stands=svgn('g',{},parent);\n else{\n  const blur=svgn('filter',{id:blurId,filterUnits:'userSpaceOnUse',x:-4400,y:-4400,width:9400,height:9400},defs);\n  svgn('feGaussianBlur',{stdDeviation:4.1},blur);\n  stands=svgn('g',{filter:'url(#'+blurId+')'},parent);\n }")
rep("   for(let j=0;j<7;j++){\n    const a=i+(j+.15)/7","   for(let j=0;j<(FS_DRAFT?0:7);j++){\n    const a=i+(j+.15)/7")
rep(" for(let i=0;i<11200;i++){\n  // Keep each cluster"," for(let i=0;i<(FS_DRAFT?0:11200);i++){\n  // Keep each cluster")
rep(" if(layer==='back'&&scene?.show&&scene.style==='night360')drawNightStadium(svgn('g',{'data-night-stadium':'',style:'pointer-events:none'},target),scene);",
""" if(layer==='back'&&scene?.show&&scene.style==='night360'){
  // chỉ khung xem trực tiếp mới được dùng bản nhẹ/bộ nhớ đệm; bản sao khi xuất PNG luôn vẽ đầy đủ
  const live=target===svg.querySelector('#fig'),key=live?JSON.stringify([scene,S.pose.yaw,Number(S.t)||0,!!S.playing,FS_DRAFT]):null;
  if(live&&fsNightCache.node&&fsNightCache.key===key)target.appendChild(fsNightCache.node);
  else{
   const g=svgn('g',{'data-night-stadium':'',style:'pointer-events:none'},target),keep=FS_DRAFT;
   if(!live)FS_DRAFT=false;
   try{drawNightStadium(g,scene)}finally{FS_DRAFT=keep}
   if(live){fsNightCache.key=key;fsNightCache.node=g}
  }
 }""")
rep(" else setTarget(drag.h,drag.h[0]==='f'?clampFoot(t):t);\n render();\n});\nconst end=()=>{drag=null};",
" else setTarget(drag.h,drag.h[0]==='f'?clampFoot(t):t);\n if(!dragRAF)dragRAF=requestAnimationFrame(()=>{dragRAF=0;render()});\n});\nlet dragRAF=0;\nconst end=()=>{if(dragRAF){cancelAnimationFrame(dragRAF);dragRAF=0;if(drag)render()}drag=null};")
rep("window.__S=S;window.__render=render;","""let draftTimer=0;
document.addEventListener('input',e=>{
 if(!e.target||e.target.type!=='range')return;
 FS_DRAFT=true;clearTimeout(draftTimer);
 draftTimer=setTimeout(()=>{FS_DRAFT=false;render()},200);
},true);
window.__S=S;window.__render=render;""")
rep("<title>Football Studio · Nguyên mẫu dựng cầu thủ 2D</title>","<title>Football Studio · Bản điện thoại</title>")
open(dst,'w',encoding='utf-8').write(s)
print('OK ->',dst,round(len(s)/1e6,2),'MB')
