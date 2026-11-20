const React = require('react');
const {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} = require('remotion');

const ScrollingPattern = ({
  colors = ['#7da11d', '#5c8214'],
  items = ['⚽', '🏆', '⭐', '🇧🇷', '🔥'],
  speed = 65,
  opacity = 0.14,
  blur = 1.5,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const tileW = 360;
  const shift = -((t * speed) % tileW);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors[0]} 0%, ${colors[1] || colors[0]} 100%)`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: shift,
          top: -40,
          width: 1080 + tileW * 2,
          height: 2000,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 360px)',
          gridAutoRows: '240px',
          alignItems: 'center',
          justifyItems: 'center',
          opacity,
          filter: blur ? `blur(${blur}px)` : 'none',
          fontSize: 96,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {Array.from({ length: 36 }).map((_, idx) => (
          <div
            key={idx}
            style={{
              transform: `rotate(${((idx * 29) % 40) - 20}deg) scale(${0.85 + (idx % 3) * 0.15})`,
            }}
          >
            {items[idx % items.length]}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const PanZoomLayer = ({ moves = [], parallax = 1, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;

  let x = 0;
  let y = 0;
  let scale = 1;

  for (const m of moves) {
    if (t < m.t0) break;
    const u = interpolate(t, [m.t0, m.t1], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    });
    x = (m.x0 ?? 0) + ((m.x1 ?? 0) - (m.x0 ?? 0)) * u;
    y = (m.y0 ?? 0) + ((m.y1 ?? 0) - (m.y0 ?? 0)) * u;
    scale = (m.scale0 ?? 1) + ((m.scale1 ?? 1) - (m.scale0 ?? 1)) * u;
  }

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${x * parallax}px, ${y * parallax}px) scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const SlideInActor = ({
  enterAt = 0,
  enterDur = 0.35,
  fromX = 750,
  toX = 0,
  fromY = 0,
  toY = 0,
  maxBlur = 8,
  holdShakeAmp = 2.5,
  holdShakeHz = 4,
  children,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;

  const u = interpolate(t, [enterAt, enterAt + enterDur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const isMoving = t >= enterAt && t < enterAt + enterDur;
  const blur = isMoving ? (1 - u) * maxBlur : 0;
  const bobY =
    t >= enterAt + enterDur && holdShakeAmp
      ? Math.sin((t - enterAt) * Math.PI * 2 * holdShakeHz) * holdShakeAmp
      : 0;

  const x = fromX + (toX - fromX) * u;
  const y = fromY + (toY - fromY) * u + bobY;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        transform: `translate(${x}px, ${y}px)`,
        filter: blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : 'none',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
};

const SpeechBubble = ({
  showAt = 0,
  text = '',
  flag = '',
  x = 120,
  y = 220,
  width = 840,
  tailSide = 'left',
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const startFrame = Math.round(showAt * fps);
  if (f < startFrame) return null;

  const pop = spring({
    frame: f - startFrame,
    fps,
    config: { damping: 12, stiffness: 260, mass: 0.6 },
  });

  const tailLeft =
    tailSide === 'left' ? 140 : tailSide === 'right' ? width - 200 : width / 2 - 30;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        padding: '28px 36px',
        borderRadius: 48,
        background: '#ffffff',
        border: '9px solid #111111',
        boxShadow: '0 12px 0 rgba(0,0,0,0.22)',
        transform: `scale(${pop})`,
        transformOrigin: `${tailLeft}px bottom`,
        textAlign: 'center',
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 64,
        lineHeight: 1.12,
        color: '#111111',
      }}
    >
      {flag ? <span style={{ marginRight: 16 }}>{flag}</span> : null}
      <span>{text}</span>
      <div
        style={{
          position: 'absolute',
          left: tailLeft,
          bottom: -36,
          width: 0,
          height: 0,
          borderLeft: '24px solid transparent',
          borderRight: '24px solid transparent',
          borderTop: '36px solid #111111',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: tailLeft + 6,
          bottom: -23,
          width: 0,
          height: 0,
          borderLeft: '18px solid transparent',
          borderRight: '18px solid transparent',
          borderTop: '27px solid #ffffff',
        }}
      />
    </div>
  );
};

const ScoreBoard = ({ leftBadge = '🇩🇪', score = '5 - 0', rightBadge = '🇳🇱', y = 180 }) => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      top: y,
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 28,
      padding: '18px 42px',
      background: '#ffffff',
      border: '8px solid #111111',
      borderRadius: 28,
      boxShadow: '0 10px 0 rgba(0,0,0,0.25)',
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: 78,
      color: '#111111',
    }}
  >
    <span>{leftBadge}</span>
    <span style={{ letterSpacing: 4 }}>{score}</span>
    <span>{rightBadge}</span>
  </div>
);

const HeldSign = ({ text = 'AGE: 39', subtext = '', x = 620, y = 980, rotate = -6 }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      padding: '18px 28px',
      background: '#fffdf5',
      border: '7px solid #111111',
      borderRadius: 16,
      transform: `rotate(${rotate}deg)`,
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: 44,
      lineHeight: 1.1,
      color: '#111111',
      textAlign: 'center',
      boxShadow: '0 8px 0 rgba(0,0,0,0.2)',
    }}
  >
    <div>{text}</div>
    {subtext ? <div style={{ fontSize: 32, color: '#d32f2f', marginTop: 4 }}>{subtext}</div> : null}
  </div>
);

const SparkleParticles = ({ count = 22 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: count }).map((_, i) => {
        const seedX = ((i * 197) % 980) + 50;
        const speed = 140 + (i % 5) * 45;
        const y = 1920 - (((t * speed + i * 130) % 1920));
        const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(t * 5 + i));
        const size = 10 + (i % 4) * 6;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: seedX,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: i % 2 === 0 ? '#ffe869' : '#ffffff',
              boxShadow: '0 0 14px #ffe869',
              opacity: twinkle,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const WhiteFlash = ({ atFrame = 0, frames = 4 }) => {
  const f = useCurrentFrame();
  if (f < atFrame || f >= atFrame + frames) return null;
  const opacity = interpolate(f, [atFrame, atFrame + frames], [0.85, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <AbsoluteFill style={{ background: '#ffffff', opacity, pointerEvents: 'none' }} />;
};

const EndFadeWithWatermark = ({
  fadeFrames = 12,
  watermarkText = 'FOOTBALL STUDIO',
  position = 'bottom-left',
}) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fade = interpolate(
    f,
    [durationInFrames - fadeFrames - 4, durationInFrames - 4],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const posStyle =
    position === 'top-left' ? { left: 42, top: 44 } : { left: 42, bottom: 48 };

  return (
    <>
      <AbsoluteFill style={{ background: '#000000', opacity: fade, pointerEvents: 'none' }} />
      <div
        style={{
          position: 'absolute',
          ...posStyle,
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: 38,
          letterSpacing: 2,
          color: 'rgba(255,255,255,0.82)',
          textShadow: '0 3px 0 rgba(0,0,0,0.65)',
          pointerEvents: 'none',
        }}
      >
        ⚽ {watermarkText}
      </div>
    </>
  );
};

module.exports = {
  ScrollingPattern,
  PanZoomLayer,
  SlideInActor,
  SpeechBubble,
  ScoreBoard,
  HeldSign,
  SparkleParticles,
  WhiteFlash,
  EndFadeWithWatermark,
};