// Render phim (JSON có nhiều diễn viên + camera thật) ra MP4 khổ dọc 1080x1920 bằng Playwright + ffmpeg. KHÔNG cần Remotion.
// Dùng: node tools/render_film.js <phim.json> <thu_muc_ra> [fps=24] [giay_dau_tien_muon_xem] [khung_le=giay1,giay2,...]
//   khung_le: chỉ chụp vài khung PNG (để xem nhanh), không ghép video.
// Cần: Node + playwright + ffmpeg. App dùng: app/football-studio.html (file gốc, không sửa).
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const [json, out = 'out', fpsArg = '24', maxArg, only] = process.argv.slice(2);
if (!json) { console.log('Thieu file phim JSON'); process.exit(1); }
const fps = +fpsArg, app = 'file://' + path.resolve(__dirname, '../app/football-studio.html') + '?nosave';
(async () => {
  fs.mkdirSync(out, { recursive: true }); const fr = path.join(out, 'frames'); fs.mkdirSync(fr, { recursive: true });
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 600, height: 1067 }, deviceScaleFactor: 1.8 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(app);
  await p.setInputFiles('#jsonFile', json);
  await p.waitForFunction(() => window.__S && window.__S.keys && window.__S.keys.length > 5, null, { timeout: 120000 });
  await p.waitForTimeout(5000);   // chờ nạp ảnh đầu của các diễn viên
  await p.addStyleTag({ content: 'html,body,.app,.stage{background:none!important;display:block!important;padding:0!important;margin:0!important;overflow:hidden!important}.panel,#handles,#ground,#zoomBar,.hint,#tabBar,.stage>:not(svg){display:none!important}.stage svg,#svg{position:fixed!important;left:0;top:0;width:600px!important;height:1067px!important;max-height:none!important;border:0!important;border-radius:0!important;background:none!important}' });
  await p.evaluate(() => { document.getElementById('svg').setAttribute('viewBox', '0 -347 600 1067'); window.__S.showHandles = false; });
  const dur = await p.evaluate(() => window.__S.dur), secs = maxArg && maxArg !== '-' ? Math.min(+maxArg, dur) : dur;
  const times = only ? only.split(',').map(Number) : Array.from({ length: Math.ceil(secs * fps) }, (_, i) => i / fps);
  const svg = await p.$('#svg');
  for (let i = 0; i < times.length; i++) {
    await p.evaluate(t => { const s = document.getElementById('tSlider'); s.value = t; s.dispatchEvent(new Event('input')); }, times[i]);
    await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await svg.screenshot({ path: path.join(fr, (only ? 't' + times[i].toFixed(2) : String(i).padStart(5, '0')) + '.png') });
  }
  await b.close();
  if (errs.length) console.log('loi trang:', errs.slice(0, 3));
  if (only) { console.log('Da chup', times.length, 'khung ->', fr); return; }
  execFileSync('ffmpeg', ['-y', '-framerate', String(fps), '-i', path.join(fr, '%05d.png'), '-vf', 'scale=1080:1920', '-c:v', 'libx264', '-crf', '22', '-preset', 'medium', '-pix_fmt', 'yuv420p', path.join(out, 'phim.mp4')], { stdio: 'inherit' });
  console.log('Xong', times.length, 'khung ->', path.join(out, 'phim.mp4'));
})();
