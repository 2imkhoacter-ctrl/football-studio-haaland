const { ShortTemplate } = require('./ShortTemplate');
const React = require('react');
const { useRef, useState, useEffect } = React;
const { Composition, registerRoot, AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, delayRender, continueRender } = require('remotion');

// Nhan vat + san 360 do CHINH Football Studio ve: nhung trang studio vao iframe cung goc (same-origin),
// nap file hoat hinh JSON roi dieu khien thanh thoi gian theo tung khung cua Remotion.
const SCALE = 2.0; // khung studio 600x720 -> rong 1080
const STUDIO_CSS = 'html,body,.app,.stage{background:none!important;display:block!important;padding:0!important;margin:0!important;overflow:hidden!important}' +
  '.panel,#handles,#ground,#zoomBar,.hint,#tabBar,.stage>:not(svg){display:none!important}' +
  '.stage svg,#svg{position:fixed!important;left:0;top:0;width:600px!important;height:720px!important;max-height:none!important;border:0!important;border-radius:0!important;background:none!important}';

const Studio = ({ anim = 'anim.json', castCount = 0, tall = false }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const [boot] = useState(() => delayRender('nap studio + hoat hinh', { timeoutInMilliseconds: 120000 }));
  const booted = useRef(false);

  useEffect(() => {
    const fr = ref.current;
    const start = async () => {
      if (booted.current) return; booted.current = true;
      const win = fr.contentWindow, doc = fr.contentDocument;
      const st = doc.createElement('style'); st.textContent = STUDIO_CSS + (tall ? '.stage svg,#svg{height:1067px!important}' : ''); doc.head.appendChild(st);
      if (tall) doc.getElementById('svg').setAttribute('viewBox', '0 -347 600 1067');
      const blob = await (await fetch(staticFile(anim))).blob();
      const dt = new win.DataTransfer(); dt.items.add(new win.File([blob], 'anim.json'));
      const inp = doc.getElementById('jsonFile'); inp.files = dt.files; inp.dispatchEvent(new win.Event('change'));
      for (let i = 0; i < 200; i++) { await new Promise(r => setTimeout(r, 150)); if (win.__S && win.__S.keys && win.__S.keys.length > 5 && (win.__S.cast || []).length >= castCount) break; }
      await new Promise(r => setTimeout(r, castCount ? 4000 : 1500));
      win.__S.showHandles = false;
      setReady(true); continueRender(boot);
    };
    if (fr.contentDocument && fr.contentDocument.readyState === 'complete' && fr.contentWindow.__S) start();
    else fr.addEventListener('load', () => setTimeout(start, 800));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const h = delayRender('khung ' + f);
    const win = ref.current.contentWindow, doc = ref.current.contentDocument;
    const s = doc.getElementById('tSlider'); s.value = f / fps; s.dispatchEvent(new win.Event('input'));
    win.requestAnimationFrame(() => win.requestAnimationFrame(() => continueRender(h)));
  }, [f, ready]);

  return (
    <iframe ref={ref} src={staticFile('studio.html') + '?nosave'} width={600} height={tall ? 1067 : 720} title="studio"
      style={{ position: 'absolute', left: tall ? 0 : -60, top: tall ? 0 : 480, border: 0, transformOrigin: '0 0', transform: `scale(${tall ? 1.8 : SCALE})`, background: 'transparent', WebkitMaskImage: 'linear-gradient(180deg,transparent 0,#000 24px)', maskImage: 'linear-gradient(180deg,transparent 0,#000 24px)' }} />
  );
};

const Scene = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const bubble = spring({ frame: f - 40, fps, config: { damping: 9, stiffness: 140 } });
  const sub1 = interpolate(f, [20, 30, 120, 135], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sub2 = interpolate(f, [150, 162, 270, 285], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fade = interpolate(f, [durationInFrames - 20, durationInFrames], [0, 0.85], { extrapolateLeft: 'clamp' });
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#050a1c 0%,#0a1230 16%,#0a1230 34%,#2f7d34 72%,#2f7d34 100%)', overflow: 'hidden' }}>
      <Studio />
      <div style={{ position: 'absolute', left: 120, top: 150, width: 840, padding: '34px 40px', borderRadius: 60, background: '#fff', border: '10px solid #111', textAlign: 'center', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 92, color: '#111', transform: `scale(${bubble})`, opacity: Math.min(1, bubble) }}>
        HAALAND IS HERE!
      </div>
      <div style={{ position: 'absolute', left: 60, right: 60, bottom: 260, textAlign: 'center', fontFamily: 'Arial Black, sans-serif', fontSize: 46, color: '#fff', textShadow: '0 0 8px #000,0 4px 0 #000,0 -4px 0 #000,4px 0 0 #000,-4px 0 0 #000' }}>
        <div style={{ opacity: sub1, position: 'absolute', width: '100%' }}>San 360 do chinh tool ve</div>
        <div style={{ opacity: sub2, position: 'absolute', width: '100%' }}>Chu, camera, nhac: Remotion lo</div>
      </div>
      <AbsoluteFill style={{ background: '#000', opacity: fade }} />
    </AbsoluteFill>
  );
};

const CAPS = require('./film-captions.json');
const WHO = { HAALAND: '#6cabdd', VINI: '#ffdb28' };
const FilmScene = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = f / fps;
  const cap = CAPS.find(c => t >= c.t0 && t <= c.t1);
  const a = cap ? Math.min(interpolate(t, [cap.t0, cap.t0 + 0.18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), interpolate(t, [cap.t1 - 0.18, cap.t1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })) : 0;
  const intro = interpolate(f, [0, 12, 40, 60], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const endIn = interpolate(f, [durationInFrames - 96, durationInFrames - 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pop = spring({ frame: f - (durationInFrames - 90), fps, config: { damping: 10, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#14275c 0%,#27458a 14%,#4a74b9 32%,#6f95cf 46%,#2f7d34 74%,#2f7d34 100%)', overflow: 'hidden' }}>
      {/* khán đài mờ kéo kín lên tới đỉnh khung (thay dải trời tối trống) */}
      <div style={{ position: 'absolute', left: -40, right: -40, top: 0, height: 760, filter: 'blur(16px)', opacity: 0.95,
        backgroundImage: 'radial-gradient(circle at 12% 30%,#ffffff88 0 9px,transparent 10px),radial-gradient(circle at 48% 62%,#ffe2b088 0 8px,transparent 9px),radial-gradient(circle at 82% 22%,#ffffff77 0 10px,transparent 11px),radial-gradient(circle at 30% 85%,#cfe0ff88 0 7px,transparent 8px),radial-gradient(circle at 70% 78%,#ffffff66 0 9px,transparent 10px)',
        backgroundSize: '110px 90px,150px 110px,130px 100px,95px 80px,140px 105px',
        WebkitMaskImage: 'linear-gradient(180deg,transparent 0,#000 18%,#000 80%,transparent 100%)', maskImage: 'linear-gradient(180deg,transparent 0,#000 18%,#000 80%,transparent 100%)' }} />
      {/* vòng khán đài cong mờ làm dịu chỗ nối với sân */}
      <div style={{ position: 'absolute', left: -200, right: -200, top: 230, height: 360, borderRadius: '50%', border: '70px solid #5c86c866', filter: 'blur(26px)' }} />
      <Studio anim="film.json" castCount={2} />
      {cap && (
        <div style={{ position: 'absolute', left: 50, right: 50, bottom: 150, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 16}px)` }}>
          {cap.who ? <div style={{ display: 'inline-block', padding: '6px 26px', marginBottom: 12, borderRadius: 30, background: WHO[cap.who] || '#fff', color: '#111', fontFamily: 'Arial Black, sans-serif', fontSize: 38, border: '5px solid #111' }}>{cap.who}</div> : null}
          <div style={{ fontFamily: 'Arial Black, Impact, sans-serif', fontSize: 58, lineHeight: 1.12, color: '#fff', textShadow: '0 0 10px #000,0 5px 0 #000,0 -5px 0 #000,5px 0 0 #000,-5px 0 0 #000' }}>{cap.text}</div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', opacity: intro, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 150, color: '#fff', textShadow: '0 0 20px #000,0 8px 0 #000', transform: `scale(${0.85 + 0.15 * intro})` }}>LUYỆN SÚT ⚽</div>
      <AbsoluteFill style={{ background: 'rgba(0,0,0,0.78)', opacity: endIn, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', fontFamily: 'Impact, Arial Black, sans-serif', color: '#fff', transform: `scale(${pop})` }}>
          <div style={{ fontSize: 120 }}>HẾT PHẦN 1</div>
          <div style={{ fontSize: 70, marginTop: 30, color: '#ffdb28' }}>Theo dõi để xem phần 2 ⚽</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Phim câm: không chữ, chỉ nền khán đài + tool vẽ mọi thứ.
const GoalScene = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(180deg,#14275c 0%,#27458a 14%,#4a74b9 32%,#6f95cf 46%,#2f7d34 74%,#2f7d34 100%)', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: -40, right: -40, top: 0, height: 760, filter: 'blur(16px)', opacity: 0.95,
      backgroundImage: 'radial-gradient(circle at 12% 30%,#ffffff88 0 9px,transparent 10px),radial-gradient(circle at 48% 62%,#ffe2b088 0 8px,transparent 9px),radial-gradient(circle at 82% 22%,#ffffff77 0 10px,transparent 11px),radial-gradient(circle at 30% 85%,#cfe0ff88 0 7px,transparent 8px),radial-gradient(circle at 70% 78%,#ffffff66 0 9px,transparent 10px)',
      backgroundSize: '110px 90px,150px 110px,130px 100px,95px 80px,140px 105px',
      WebkitMaskImage: 'linear-gradient(180deg,transparent 0,#000 18%,#000 80%,transparent 100%)', maskImage: 'linear-gradient(180deg,transparent 0,#000 18%,#000 80%,transparent 100%)' }} />
    <Studio anim="goal.json" castCount={5} />
  </AbsoluteFill>
);

const Goal2Scene = () => (<AbsoluteFill style={{ background: '#101c38', overflow: 'hidden' }}><Studio anim="goal2.json" castCount={4} tall /></AbsoluteFill>);
const Root = () => (<><Composition id="FootballPOC" component={Scene} durationInFrames={300} fps={30} width={1080} height={1920} /><Composition id="Goal2" component={Goal2Scene} durationInFrames={360} fps={24} width={1080} height={1920} /><Composition id="Goal" component={GoalScene} durationInFrames={432} fps={24} width={1080} height={1920} /><Composition id="Film" component={FilmScene} durationInFrames={1440} fps={24} width={1080} height={1920} /><Composition id="ShortTemplate" component={ShortTemplate} durationInFrames={288} fps={24} width={1080} height={1920} /></>);
registerRoot(Root);