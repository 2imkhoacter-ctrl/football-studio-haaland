// Thư viện dựng phim dùng chung: tạo keyframe cho một diễn viên từ "kịch bản" (vị trí, hướng, cử chỉ, mặt) trên sân 360°.
// Quy ước hướng: φ = 0 là quay mặt về phía camera (khi camera nhìn về +Z); φ dương quay mặt sang TRÁI màn hình. Hướng nhìn thực = (-sinφ, -cosφ).
// Tọa độ sân tính bằng MÉT, gốc ở tâm sân; hai khung thành nằm ở z = ±52.5.
const S = u => u * u * (3 - 2 * u), clamp = (x, a, b) => Math.max(a, Math.min(b, x)), mix = (a, b, u) => a + (b - a) * u;
const wrap = a => ((a + 180) % 360 + 360) % 360 - 180, r2 = v => Math.round(v * 100) / 100;
const wp = (t, pts) => {
  if (t <= pts[0][0]) return pts[0][1]; if (t >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
  for (let i = 0; i < pts.length - 1; i++) { const [t0, v0] = pts[i], [t1, v1] = pts[i + 1]; if (t >= t0 && t <= t1) return mix(v0, v1, S((t - t0) / (t1 - t0))); }
};
const wp2 = (t, pts) => [wp(t, pts.map(p => [p[0], p[1]])), wp(t, pts.map(p => [p[0], p[2]]))];
const toSceneX = X => 300 + X / 0.068, toSceneY = Z => 640 - Z / 0.075;
const hash = n => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };

const EXPR = {
  neutral: { browKind: 'normal', mouthKind: 'closed', mouthOpen: 0 },
  smile: { browKind: 'happy', mouthKind: 'smile', mouthOpen: 0 },
  grin: { browKind: 'happy', mouthKind: 'grin', mouthOpen: 55 },
  laugh: { browKind: 'happy', mouthKind: 'grin', mouthOpen: 92, lidL: 28, lidR: 28 },
  scream: { browKind: 'happy', mouthKind: 'a', mouthOpen: 95, lidL: 40, lidR: 40 },
  angry: { browKind: 'angry', mouthKind: 'teeth', mouthOpen: 25 },
  smug: { browKind: 'smug', mouthKind: 'smirk', mouthOpen: 0 },
  surprised: { browKind: 'surprised', mouthKind: 'o', mouthOpen: 78 },
  sad: { browKind: 'sad', mouthKind: 'sad', mouthOpen: 0 },
  think: { browKind: 'skeptic', mouthKind: 'closed', mouthOpen: 0 },
  focus: { browKind: 'focus', mouthKind: 'closed', mouthOpen: 0 },
};

function gesturePose(g, t, k) {
  const s = a => a.map(v => v * k), osc = (f, ph = 0) => Math.sin(2 * Math.PI * f * t + ph);
  switch (g) {
    case 'wave': return { hR: s([45 + 30 * osc(1.7), -112, 15]) };
    case 'hips': return { hL: s([-70, 95, -10]), hR: s([70, 95, -10]) };
    case 'armsUp': return { hL: s([-40, -140 + 10 * osc(3), 10]), hR: s([40, -140 + 10 * osc(3, 1), 10]) };
    case 'wide': return { hL: s([-150, 10 + 8 * osc(2), 0]), hR: s([150, 10 + 8 * osc(2, 1), 0]) };
    case 'head': return { hL: s([-34, -88, 38]), hR: s([34, -88, 38]) };
    case 'defend': return { hL: s([-95, 55, 35]), hR: s([95, 55, 35]) };
    case 'cross': return { hL: s([20, 55, 55]), hR: s([-20, 60, 60]) };
    case 'fists': return { hL: s([-45, 80, 55]), hR: s([45, 80, 55]) };
    case 'dive': return { hL: s([-40, -150, 20]), hR: s([40, -150, 20]) };
    case 'shrug': return { hL: s([-85, 60 + 8 * osc(2.5), 50]), hR: s([85, 60 + 8 * osc(2.5), 50]) };
  }
  return {};
}

// spec: {pos:[[t,X,Z]], head:[[t,φ]], ges:[{t0,t1,g}], faces:[{t0,t1,e,talk,look}], jumps:[[t,h,dur]], kick:t, stance:1.0, mod:(t,key,ctx)=>{}, blink, seed, hyaw}
function buildActor(spec, body, baseFace, faceOn, o) {
  const { FPS, N } = o;
  const armL = body.upA + body.foreA, legL = body.thigh + body.shin, ka = armL / 164, kl = legL / 241;
  const hipStand = 640 - 1.2 * body.shoe - 0.975 * legL, footY = 0.975 * legL, footX = body.hipW * 0.39 * (spec.stance || 1);
  const poles = { hL: [-0.6, 0, -1], hR: [0.6, 0, -1], fL: [-0.35, 0, 1], fR: [0.35, 0, 1] };
  const posAt = t => wp2(t, spec.pos), headAt = t => wp(t, spec.head);
  let phi = 0; const samples = [];
  for (let i = 0; i <= N; i++) {
    const t = i / FPS, p0 = posAt(t - 1 / FPS), p1 = posAt(t + 1 / FPS);
    const v = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / (2 / FPS);
    const A = v < 0.12 ? 0 : clamp(v / (spec.runSpeed || 1.6), 0.25, 1);
    const f = A ? v / (1.852 * A * kl) : 0;
    phi += 2 * Math.PI * f / FPS; samples.push({ t, v, A, phi });
  }
  const gestWeight = t => { let best = null; for (const g of spec.ges || []) { const w = Math.min(S(clamp((t - g.t0) / 0.35, 0, 1)), S(clamp((g.t1 - t) / 0.35, 0, 1))); if (w > 0 && (!best || w >= best.w)) best = { g: g.g, w }; } return best; };
  const exprAt = t => { let e = { e: 'neutral', talk: false, look: 0 }; for (const x of spec.faces || []) if (t >= x.t0 && t < x.t1) e = x; return e; };
  const jumpAt = t => { let h = 0; for (const j of spec.jumps || []) { const u = (t - j[0]) / (j[2] || 0.6); if (u > 0 && u < 1) h = Math.max(h, j[1] * 4 * u * (1 - u)); } return h; };
  const keys = [];
  for (let i = 0; i <= N; i++) {
    const { t, A, phi } = samples[i], [X, Z] = posAt(t), sw = Math.sin(phi), jh = jumpAt(t) * kl;
    const idleX = 0.14 * armL, rest = 0.93 * armL;
    const swing = side => { const sgn = side === 'R' ? 1 : -1, s = side === 'R' ? sw : -sw;
      const z = (s > 0 ? 60 : 50) * A * s * kl * 1.1, y = Math.sqrt(Math.max(0, rest * rest - idleX * idleX - z * z)) - A * Math.max(0, s) * 30 * kl; return [sgn * idleX, y, z]; };
    let hL = swing('L'), hR = swing('R');
    const gw = gestWeight(t);
    if (gw) { const gp = gesturePose(gw.g, t, ka), w = S(gw.w); if (gp.hL) hL = hL.map((v, j) => mix(v, gp.hL[j], w)); if (gp.hR) hR = hR.map((v, j) => mix(v, gp.hR[j], w)); }
    const feet = {};
    for (const [k, x, off] of [['fL', -footX, 0], ['fR', footX, Math.PI]]) {
      const z = 55 * A * kl * Math.sin(phi + off), lift = 28 * A * kl * Math.max(0, Math.cos(phi + off));
      feet[k] = [x, footY - lift - 0.5 * jh, z + 0.15 * jh];
    }
    let rotFine = 4 * A;
    if (spec.kick) {
      const u = t - spec.kick;
      if (u > -0.35 && u < 0.5) {
        const wind = S(clamp((u + 0.35) / 0.35, 0, 1)) * (1 - S(clamp((u - 0.02) / 0.1, 0, 1)));
        const strike = S(clamp((u + 0.03) / 0.08, 0, 1)) * (1 - S(clamp((u - 0.12) / 0.38, 0, 1)));
        feet.fR = [footX, footY - 18 * kl - 28 * kl * strike, -70 * kl * wind + 140 * kl * strike];
        rotFine = -6 * wind + 7 * strike;
      }
    }
    const hip = [300, hipStand - 5 * A * Math.cos(phi) ** 2 - jh];
    const ex = exprAt(t), pre = EXPR[ex.e] || EXPR.neutral;
    const blink = ((t + (spec.blink || 0)) % 3.3) < 0.14 ? 100 : 0;
    const face = Object.assign({}, baseFace, pre, { on: faceOn, lookX: r2(ex.look || 0), lookY: 0 });
    if (blink && !pre.lidL) { face.lidL = blink; face.lidR = blink; }
    if (ex.talk) { face.mouthKind = (face.mouthKind === 'closed' || face.mouthKind === 'smile') ? 'a' : face.mouthKind; face.mouthOpen = r2(20 + 60 * hash(i * 0.37 + (spec.seed || 0))); }
    const wh = headAt(t) + (spec.extra ? spec.extra(t) : 0);
    const key = {
      t: Math.round(t * 10000) / 10000, hip, type: 0, rotFine, yaw: 0,
      limbs: { hL, hR, fL: feet.fL, fR: feet.fR }, poles, ends: { hL: [-8, 0, 0], hR: [-8, 0, 0], fL: [0, 0, 0], fR: [0, 0, 0] },
      side: { hL: 'auto', hR: 'auto' }, hyaw: spec.hyaw ? spec.hyaw(t) : 0, hrot: ex.talk ? 3 * Math.sin(t * 9) : 0, expression: 'neutral', face, lin: true,
      _X: X, _Z: Z, _wh: wh
    };
    if (spec.mod) spec.mod(t, key, { A, phi, kl, ka, footY, hipStand, X, Z });
    // làm tròn
    key.hip = key.hip.map(r2); key.rotFine = r2(key.rotFine); key.hyaw = r2(key.hyaw); key.hrot = r2(key.hrot);
    for (const k of ['hL', 'hR', 'fL', 'fR']) key.limbs[k] = key.limbs[k].map(r2);
    for (const k of ['hL', 'hR']) key.ends[k] = key.ends[k].map(r2);
    keys.push(key);
  }
  return keys;
}
const cleanKeys = keys => keys.map(k => { const o = Object.assign({}, k); delete o._X; delete o._Z; delete o._wh; return o; });
module.exports = { S, clamp, mix, wrap, r2, wp, wp2, toSceneX, toSceneY, hash, EXPR, buildActor, cleanKeys };
