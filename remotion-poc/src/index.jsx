const React = require('react');
const { Composition, registerRoot, AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } = require('remotion');

// Canh thu nghiem 10 giay, 1080x1920: nen san + khan dai mo (dung CSS), nhan vat la clip trong suot xuat tu Football Studio,
// bong bong thoai bat len bang spring, phu de, camera zoom cham, toi dan cuoi clip.
const Stage = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = f / fps;
  const zoom = interpolate(f, [0, durationInFrames], [1, 1.12]);
  const bubble = spring({ frame: f - 40, fps, config: { damping: 9, stiffness: 140 } });
  const sub1 = interpolate(f, [20, 30, 120, 135], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sub2 = interpolate(f, [150, 162, 270, 285], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fade = interpolate(f, [durationInFrames - 20, durationInFrames], [0, 0.85], { extrapolateLeft: 'clamp' });
  const flame = interpolate(f, [40, 140], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#0d1b3a', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: '50% 70%' }}>
        {/* khan dai mo */}
        <AbsoluteFill style={{ background: 'linear-gradient(180deg,#0a1230 0%,#2a4a8a 38%,#7ea0d8 62%)' }} />
        <AbsoluteFill style={{ filter: 'blur(22px)', opacity: 0.8, backgroundImage:
          'radial-gradient(circle at 10% 55%,#ffffff55 0 14px,transparent 15px),radial-gradient(circle at 60% 40%,#ffd9a055 0 12px,transparent 13px),radial-gradient(circle at 85% 60%,#ffffff44 0 16px,transparent 17px)',
          backgroundSize: '90px 70px, 120px 90px, 110px 80px', maskImage: 'linear-gradient(180deg,#000 0 60%,transparent 70%)' }} />
        {/* san co */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1000, bottom: 0,
          background: 'repeating-linear-gradient(0deg,#3c8c3c 0 90px,#46984a 90px 180px)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1000, height: 6, background: '#ffffffcc' }} />
        {/* nhan vat (clip trong suot tu Football Studio) */}
        <OffthreadVideo src={staticFile('actor.webm')} transparent muted
          style={{ position: 'absolute', left: 90, top: 560, width: 900, height: 1080, objectFit: 'contain' }} />
      </AbsoluteFill>
      {/* bong bong thoai */}
      <div style={{ position: 'absolute', left: 120, top: 190, width: 840, padding: '34px 40px', borderRadius: 60,
        background: '#fff', border: '10px solid #111', textAlign: 'center', fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 92, color: '#111', transform: `scale(${bubble})`, opacity: Math.min(1, bubble) }}>
        HAALAND IS HERE!
        <div style={{ fontSize: 70, opacity: flame, transform: `translateY(${(1 - flame) * 20}px)` }}>🔥🔥🔥</div>
      </div>
      {/* phu de */}
      <div style={{ position: 'absolute', left: 60, right: 60, bottom: 260, textAlign: 'center', fontFamily: 'Arial Black, sans-serif',
        fontSize: 56, color: '#fff', textShadow: '0 0 8px #000,0 4px 0 #000,0 -4px 0 #000,4px 0 0 #000,-4px 0 0 #000' }}>
        <div style={{ opacity: sub1, position: 'absolute', width: '100%' }}>Tool tao nhan vat, Remotion lo phan dung</div>
        <div style={{ opacity: sub2, position: 'absolute', width: '100%' }}>Chu, camera, nhac: sua nhanh khong ve lai</div>
      </div>
      <AbsoluteFill style={{ background: '#000', opacity: fade }} />
    </AbsoluteFill>
  );
};
const Root = () => <Composition id="FootballPOC" component={Stage} durationInFrames={300} fps={30} width={1080} height={1920} />;
registerRoot(Root);
