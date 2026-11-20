const React = require('react');
const { AbsoluteFill, Sequence, useVideoConfig } = require('remotion');
const {
  ScrollingPattern,
  PanZoomLayer,
  SlideInActor,
  SpeechBubble,
  ScoreBoard,
  HeldSign,
  SparkleParticles,
  WhiteFlash,
  EndFadeWithWatermark,
} = require('./cartoonKit');
const { HaalandPose, ViniPose } = require('./CartoonActors');

const ShortTemplate = () => {
  const { fps } = useVideoConfig();
  const s1 = Math.round(4.5 * fps);
  const s2 = Math.round(4.5 * fps);
  const s3 = Math.round(3.0 * fps);

  return (
    <AbsoluteFill style={{ background: '#111', overflow: 'hidden' }}>
      <Sequence from={0} durationInFrames={s1}>
        <ScrollingPattern colors={['#7da11d', '#389e28']} speed={75} />
        <ScoreBoard leftBadge="DE" score="5 - 0" rightBadge="NL" y={200} />

        <SlideInActor enterAt={0.15} enterDur={0.45} fromX={820} toX={0} maxBlur={10}>
          <div style={{ position: 'absolute', left: 240, top: 560, width: 600, height: 980 }}>
            <HaalandPose />
          </div>
        </SlideInActor>
      </Sequence>

      <Sequence from={s1} durationInFrames={s2}>
        <PanZoomLayer
          parallax={0.45}
          moves={[{ t0: 1.8, t1: 2.35, x0: 0, x1: -420, scale0: 1, scale1: 1.04 }]}
        >
          <ScrollingPattern
            colors={['#0c6aa8', '#13885c']}
            items={['BALL', 'CUP', 'STAR', 'FIRE']}
            speed={50}
          />
        </PanZoomLayer>

        <PanZoomLayer
          parallax={1}
          moves={[{ t0: 1.8, t1: 2.35, x0: 0, x1: -420, scale0: 1, scale1: 1.04 }]}
        >
          <div style={{ position: 'absolute', left: 250, top: 580, width: 600, height: 980 }}>
            <ViniPose />
          </div>
          <SpeechBubble
            showAt={0.35}
            flag="ENG"
            text="WHAT IS GOING ON?!"
            x={110}
            y={230}
          />
          <HeldSign text="AGE: 39" subtext="STILL ON TOP" x={640} y={1040} rotate={-7} />
        </PanZoomLayer>
      </Sequence>

      <Sequence from={s1 + s2} durationInFrames={s3}>
        <ScrollingPattern colors={['#13885c', '#0c6aa8']} speed={40} opacity={0.1} />
        <SparkleParticles count={26} />
        <div
          style={{
            position: 'absolute',
            left: 80,
            right: 80,
            top: 520,
            textAlign: 'center',
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: 88,
            lineHeight: 1.15,
            color: '#ffffff',
            textShadow: '0 6px 0 #111111, 0 0 24px rgba(0,0,0,0.6)',
          }}
        >
          WHO IS NUMBER 1?
        </div>
        <WhiteFlash atFrame={0} frames={4} />
      </Sequence>

      <EndFadeWithWatermark fadeFrames={10} watermarkText="HAMID / STUDIO" position="bottom-left" />
    </AbsoluteFill>
  );
};

module.exports = { ShortTemplate };