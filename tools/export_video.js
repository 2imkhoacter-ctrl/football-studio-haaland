// Xuất hoạt hình (file JSON) ra video nhẹ, không cần mở app bằng tay.
// Dùng: node tools/export_video.js animations/haaland-intro-10s.json ra/ [fps=24] [giay_toi_da]
// Cần: Node + playwright (npm i playwright) + ffmpeg. Sinh: <ra>/clip.mp4 (nền trắng, nhẹ nhất) và clip.webm (nền trong suốt).
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),{execFileSync}=require('child_process');
const [json,out='out',fpsArg='24',maxArg]=process.argv.slice(2);
if(!json){console.log('Thiếu file JSON');process.exit(1)}
const fps=+fpsArg,app='file://'+path.resolve(__dirname,'../app/football-studio.html')+'?nosave';
(async()=>{
 fs.mkdirSync(out,{recursive:true});const fr=path.join(out,'frames');fs.mkdirSync(fr,{recursive:true});
 const b=await chromium.launch(),p=await b.newPage({viewport:{width:600,height:720}});
 await p.goto(app);
 await p.setInputFiles('#jsonFile',json);await p.waitForTimeout(2500);
 await p.addStyleTag({content:'html,body,.app,.stage{background:none!important;display:block!important;padding:0!important}.panel,.stage>:not(svg),#handles,#ground,#svg>rect{display:none!important}.stage svg,#svg{position:fixed!important;left:0;top:0;width:600px!important;height:720px!important;max-height:none!important;border:0!important;border-radius:0!important;background:none!important}'});
 await p.evaluate(()=>{const s=document.getElementById('svg');s.setAttribute('viewBox','0 0 600 720')});
 const dur=await p.evaluate(()=>window.__S.dur),secs=maxArg?Math.min(+maxArg,dur):dur,n=Math.ceil(secs*fps);
 const svg=await p.$('#svg');
 for(let i=0;i<n;i++){
  await p.evaluate(t=>{const s=document.getElementById('tSlider');s.value=t;s.dispatchEvent(new Event('input'))},i/fps);
  await svg.screenshot({path:path.join(fr,String(i).padStart(5,'0')+'.png'),omitBackground:true});
 }
 await b.close();
 const inp=['-y','-framerate',String(fps),'-i',path.join(fr,'%05d.png')];
 const white=['-f','lavfi','-i','color=white:s=600x720:r='+fps];
 execFileSync('ffmpeg',[...inp,...white,'-filter_complex','[1][0]overlay=shortest=1,format=yuv420p','-c:v','libx264','-crf','23','-preset','slow',path.join(out,'clip.mp4')],{stdio:'inherit'});
 execFileSync('ffmpeg',[...inp,'-c:v','libvpx-vp9','-pix_fmt','yuva420p','-b:v','0','-crf','35',path.join(out,'clip.webm')],{stdio:'inherit'});
 console.log('Xong',n,'khung ->',out);
})();
