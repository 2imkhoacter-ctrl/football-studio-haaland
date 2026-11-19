// Sinh phim ngắn 60 giây (nhiều diễn viên, biểu cảm, cử chỉ, sân 360° chạy theo người chính).
// Dùng: node tools/make_film.js   ->  remotion-poc/public/film.json  +  remotion-poc/src/film-captions.json
// Nhân vật chính (camera bám theo) = Haaland chốt mới (data/characters/haaland-final.json, đầu 5 ảnh kiểu mới).
// Diễn viên phụ: Vini (data/characters/vini-final.json) và người nộm (ma-nơ-canh). Mọi vị trí tính bằng MÉT trên sân.
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const R = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const H = R('data/characters/haaland-final.json'), V = R('data/characters/vini-final.json');

const FPS = 24, DUR = 60, N = DUR * FPS;
const S = u => u * u * (3 - 2 * u), clamp = (x, a, b) => Math.max(a, Math.min(b, x)), mix = (a, b, u) => a + (b - a) * u;
const wrap = a => ((a + 180) % 360 + 360) % 360 - 180, r2 = v => Math.round(v * 100) / 100;
const wp = (t, pts) => { // smoothstep qua các mốc [t, v]
  if (t <= pts[0][0]) return pts[0][1]; if (t >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
  for (let i = 0; i < pts.length - 1; i++) { const [t0, v0] = pts[i], [t1, v1] = pts[i + 1]; if (t >= t0 && t <= t1) return mix(v0, v1, S((t - t0) / (t1 - t0))); }
};
const wp2 = (t, pts) => [wp(t, pts.map(p => [p[0], p[1]])), wp(t, pts.map(p => [p[0], p[2]]))];

// ---------- chuyển đổi tọa độ sân (mét) <-> trường x,y của props.scene ----------
const toSceneX = X => 300 + X / 0.068, toSceneY = Z => 640 - Z / 0.075;

// ---------- biểu cảm ----------
const EXPR = {
  neutral: { browKind: 'normal', mouthKind: 'closed', mouthOpen: 0 },
  smile: { browKind: 'happy', mouthKind: 'smile', mouthOpen: 0 },
  grin: { browKind: 'happy', mouthKind: 'grin', mouthOpen: 55 },
  laugh: { browKind: 'happy', mouthKind: 'grin', mouthOpen: 92, lidL: 28, lidR: 28 },
  angry: { browKind: 'angry', mouthKind: 'teeth', mouthOpen: 25 },
  smug: { browKind: 'smug', mouthKind: 'smirk', mouthOpen: 0 },
  surprised: { browKind: 'surprised', mouthKind: 'o', mouthOpen: 78 },
  sad: { browKind: 'sad', mouthKind: 'sad', mouthOpen: 0 },
  think: { browKind: 'skeptic', mouthKind: 'closed', mouthOpen: 0 },
  focus: { browKind: 'focus', mouthKind: 'closed', mouthOpen: 0 },
};
const hash = n => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };

// ---------- cử chỉ tay (tọa độ tay so với vai, chuẩn cánh tay 164) ----------
function gesturePose(g, t, k) { // trả {hL,hR,ends?}; k = tỉ lệ độ dài tay
  const s = (a) => a.map(v => v * k);
  const osc = (f, ph = 0) => Math.sin(2 * Math.PI * f * t + ph);
  switch (g) {
    case 'wave': return { hR: s([45 + 30 * osc(1.7), -112, 15]), hL: null, endsR: [34 * osc(1.7, 1.2), 26 * osc(1.7, .2), -35] };
    case 'pointL': return { hL: s([-60, 10, 130]), hR: null };
    case 'pointR': return { hR: s([60, 10, 130]), hL: null };
    case 'hips': return { hL: s([-70, 95, -10]), hR: s([70, 95, -10]) };
    case 'think': return { hR: s([25, -55, 75]), hL: s([-35, 110, -10]) };
    case 'armsUp': return { hL: s([-40, -140 + 10 * osc(3), 10]), hR: s([40, -140 + 10 * osc(3, 1), 10]) };
    case 'shrug': return { hL: s([-85, 60 + 8 * osc(2.5), 50]), hR: s([85, 60 + 8 * osc(2.5), 50]) };
    case 'talk': return { hR: s([60, 85 + 15 * osc(1.3), 40 + 20 * osc(1.3, 1.6)]), hL: s([-35, 120, 10]) };
    case 'thumbs': return { hR: s([45, -120 + 6 * osc(2), 20]), hL: s([-70, 95, -10]) };
    case 'dance': return { hL: s([-120 + 45 * osc(1.3), -20 + 70 * osc(2.6, 1), 15]), hR: s([120 - 45 * osc(1.3), -20 + 70 * osc(2.6, 3), 15]) };
    case 'cross': return { hL: s([20, 55, 55]), hR: s([-20, 60, 60]) };
    case 'clap': return { hL: s([-12, 40 + 8 * osc(5), 100]), hR: s([12, 40 + 8 * osc(5, 3), 100]) };
  }
  return {};
}

// ---------- một diễn viên ----------
function buildActor(spec, body, baseFace, faceOn) {
  const armL = body.upA + body.foreA, legL = body.thigh + body.shin, ka = armL / 164, kl = legL / 241;
  const hipStand = 640 - 1.2 * body.shoe - 0.975 * legL, footY = 0.975 * legL, footX = body.hipW * 0.39;
  const poles = { hL: [-0.6, 0, -1], hR: [0.6, 0, -1], fL: [-0.35, 0, 1], fR: [0.35, 0, 1] };
  const posAt = t => wp2(t, spec.pos);
  const headAt = t => wp(t, spec.head);
  // pha bước chân được tích lũy theo quãng đường thật
  let phi = 0; const samples = [];
  for (let i = 0; i <= N; i++) {
    const t = i / FPS, p0 = posAt(t - 1 / FPS), p1 = posAt(t + 1 / FPS);
    const v = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / (2 / FPS); // m/s
    const A = v < 0.12 ? 0 : clamp(v / 1.6, 0.25, 1);
    const f = A ? v / (1.852 * A * kl) : 0; // nhịp bước (Hz) để chân không trượt trên cỏ
    phi += 2 * Math.PI * f / FPS;
    samples.push({ t, v, A, phi });
  }
  const gestWeight = t => { let best = null; for (const g of spec.ges || []) { const w = Math.min(S(clamp((t - g.t0) / 0.4, 0, 1)), S(clamp((g.t1 - t) / 0.4, 0, 1))); if (w > 0 && (!best || w >= best.w)) best = { g: g.g, w }; } return best; };
  const exprAt = t => { let e = { e: 'neutral', talk: false, look: 0 }; for (const x of spec.faces || []) if (t >= x.t0 && t < x.t1) e = x; return e; };
  const jumpAt = t => { let h = 0; for (const j of spec.jumps || []) { const u = (t - j[0]) / (j[2] || 0.6); if (u > 0 && u < 1) h = Math.max(h, j[1] * 4 * u * (1 - u)); } return h; };
  const keys = [];
  for (let i = 0; i <= N; i++) {
    const { t, A, phi } = samples[i], [X, Z] = posAt(t), sw = Math.sin(phi);
    const jh = jumpAt(t) * kl;
    // ---- tay: lắc khi đi, cử chỉ đè lên
    const idleX = 0.14 * armL, rest = 0.93 * armL;
    const swing = (side) => { const sgn = side === 'R' ? 1 : -1, s = side === 'R' ? sw : -sw;
      const z = (s > 0 ? 60 : 50) * A * s * kl * 1.1 * (side === 'R' ? 1 : 1), y = Math.sqrt(Math.max(0, rest * rest - idleX * idleX - z * z)) - A * Math.max(0, s) * 30 * kl;
      return [sgn * idleX, y, z]; };
    let hL = swing('L'), hR = swing('R'); let endsR = null;
    const gw = gestWeight(t);
    if (gw) { const gp = gesturePose(gw.g, t, ka), w = S(gw.w); if (gp.hL) hL = hL.map((v, j) => mix(v, gp.hL[j], w)); if (gp.hR) hR = hR.map((v, j) => mix(v, gp.hR[j], w)); if (gp.endsR) endsR = { v: gp.endsR, w }; }
    // ---- chân
    const feet = {};
    for (const [k, x, off] of [['fL', -footX, 0], ['fR', footX, Math.PI]]) {
      const z = 55 * A * kl * Math.sin(phi + off), lift = 28 * A * kl * Math.max(0, Math.cos(phi + off));
      feet[k] = [x, footY - lift - 0.5 * jh, z + 0.15 * jh];
    }
    // ---- đá bóng (nếu có)
    let rotFine = 4 * A;
    if (spec.kick) {
      const tk = spec.kick, u = t - tk;
      if (u > -0.35 && u < 0.5) {
        const wind = S(clamp((u + 0.35) / 0.35, 0, 1)) * (1 - S(clamp((u - 0.02) / 0.1, 0, 1)));
        const strike = S(clamp((u + 0.03) / 0.08, 0, 1)) * (1 - S(clamp((u - 0.12) / 0.38, 0, 1)));
        feet.fR = [footX, footY - 18 * kl - 28 * kl * strike, -70 * kl * wind + 140 * kl * strike];
        rotFine = -6 * wind + 7 * strike;
      }
    }
    // ---- hông / hình dáng
    const hip = [300, hipStand - 5 * A * Math.cos(phi) ** 2 - jh];
    // ---- mặt
    const ex = exprAt(t), pre = EXPR[ex.e] || EXPR.neutral;
    const blink = ((t + (spec.blink || 0)) % 3.3) < 0.14 ? 100 : 0;
    const face = Object.assign({}, baseFace, pre, { on: faceOn, lookX: r2((ex.look || 0) * 1), lookY: 0 });
    if (blink && !pre.lidL) { face.lidL = blink; face.lidR = blink; }
    if (ex.talk) { face.mouthKind = (face.mouthKind === 'closed' || face.mouthKind === 'smile') ? 'a' : face.mouthKind; face.mouthOpen = r2(20 + 60 * hash(i * 0.37 + (spec.seed || 0))); }
    // ---- góc nhìn/hướng
    const wh = headAt(t) + (spec.extra ? spec.extra(t) : 0);
    const k0 = {
      t: Math.round(t * 1000) / 1000, hip: [r2(hip[0]), r2(hip[1])], type: 0, rotFine: r2(rotFine), yaw: 0,
      limbs: { hL: hL.map(r2), hR: hR.map(r2), fL: feet.fL.map(r2), fR: feet.fR.map(r2) },
      poles, ends: { hL: [-8, 0, 0], hR: endsR ? [r2(mix(-8, endsR.v[0], endsR.w)), r2(mix(0, endsR.v[1], endsR.w)), r2(mix(0, endsR.v[2], endsR.w))] : [-8, 0, 0], fL: [0, 0, 0], fR: [0, 0, 0] },
      side: { hL: 'auto', hR: 'auto' }, hyaw: r2(spec.hyaw ? spec.hyaw(t) : 0), hrot: r2(ex.talk ? 3 * Math.sin(t * 9) : 0), expression: 'neutral', face, lin: true,
      _X: X, _Z: Z, _wh: wh, _jump: jh
    };
    keys.push(k0);
  }
  return keys;
}

// ---------- kịch bản: vị trí / hướng / cử chỉ / mặt ----------
// Quy ước hướng: φ = 0 là quay mặt về phía camera; φ dương quay mặt sang TRÁI màn hình, âm sang PHẢI. Hướng nhìn thực = (-sinφ, -cosφ).
const D0 = [-2.3, 0.9];          // người nộm
const VIN = [1.05, -1.0];         // Vini (gần camera, bên phải)
const KICK_T = 28.85;
const BALL0 = [-0.62, 0.0];

const hero = {
  pos: [[0, 0, 0], [22.8, 0, 0], [24.4, 1.2, 0], [26.8, 1.2, 0], [28.7, -0.2, 0], [44, -0.2, 0], [46.5, 0, 0.4], [60, 0, 0.4]].map(p => p),
  head: [[0, 0], [4.8, 0], [5.6, 55], [9, 55], [10, -55], [22.6, -55], [23.4, -90], [24.4, -90], [24.9, 0], [25.5, 90], [31, 90], [32.5, 40], [44, 40], [46, 0], [60, 0]],
  ges: [{ t0: 1.5, t1: 4.6, g: 'wave' }, { t0: 5.6, t1: 8.6, g: 'pointL' }, { t0: 12.2, t1: 14.8, g: 'hips' }, { t0: 15.2, t1: 19, g: 'talk' }, { t0: 20, t1: 22, g: 'think' },
    { t0: 29.2, t1: 33.5, g: 'armsUp' }, { t0: 35.5, t1: 38.5, g: 'clap' }, { t0: 46.8, t1: 49.3, g: 'talk' }, { t0: 50.5, t1: 56, g: 'thumbs' }],
  faces: [{ t0: 0, t1: 1.5, e: 'neutral' }, { t0: 1.5, t1: 4.8, e: 'smile', talk: true }, { t0: 5.2, t1: 9, e: 'smug', talk: true, look: -15 }, { t0: 9.3, t1: 11.8, e: 'surprised', look: 25 },
    { t0: 12, t1: 15, e: 'focus', look: 25 }, { t0: 15.2, t1: 19.2, e: 'grin', talk: true, look: 25 }, { t0: 19.4, t1: 22.3, e: 'think', look: 25 }, { t0: 22.5, t1: 29, e: 'focus', look: -20 },
    { t0: 29, t1: 34, e: 'laugh' }, { t0: 34.2, t1: 38.8, e: 'grin', talk: true, look: 25 }, { t0: 39, t1: 46, e: 'laugh', look: 25 }, { t0: 46.5, t1: 50.3, e: 'smile', talk: true },
    { t0: 50.4, t1: 56.5, e: 'grin', talk: true }, { t0: 56.5, t1: 60, e: 'smile' }],
  jumps: [[30.1, 130, 0.7], [31.4, 90, 0.6]], kick: KICK_T, blink: 0.3, seed: 1,
  hyaw: t => 8 * Math.sin(t * 0.9),
};
const vini = {
  pos: [[0, 8, VIN[1]], [8.6, 8, VIN[1]], [12.3, VIN[0], VIN[1]], [44.8, VIN[0], VIN[1]], [48.6, 1.4, 0.4], [60, 1.4, 0.4]],
  head: [[0, 90], [8.6, 90], [12.4, 60], [44.8, 60], [46.8, 40], [48.6, 20], [50, 0], [60, 0]],
  ges: [{ t0: 12.8, t1: 15, g: 'talk' }, { t0: 19.8, t1: 22.4, g: 'shrug' }, { t0: 29.4, t1: 31.5, g: 'armsUp' }, { t0: 32.8, t1: 35.2, g: 'hips' }, { t0: 38.8, t1: 45.8, g: 'dance' }, { t0: 51, t1: 56, g: 'cross' }],
  faces: [{ t0: 0, t1: 12.6, e: 'smug' }, { t0: 12.7, t1: 15.3, e: 'smug', talk: true, look: -20 }, { t0: 15.5, t1: 19.5, e: 'angry', look: -20 }, { t0: 19.7, t1: 22.6, e: 'angry', talk: true, look: -20 },
    { t0: 22.8, t1: 29.2, e: 'smug', look: -25 }, { t0: 29.3, t1: 32.6, e: 'surprised', look: -25 }, { t0: 32.8, t1: 36, e: 'angry', talk: true, look: -20 }, { t0: 36.2, t1: 38.8, e: 'smug' },
    { t0: 39, t1: 46.3, e: 'grin', talk: true, look: -10 }, { t0: 46.5, t1: 50.5, e: 'smile', look: -20 }, { t0: 50.6, t1: 56.5, e: 'grin' }, { t0: 56.5, t1: 60, e: 'smile' }],
  jumps: [[39.2, 40, 0.5], [40.4, 40, 0.5], [41.6, 40, 0.5], [42.8, 40, 0.5], [44, 40, 0.5]], blink: 1.4, seed: 7,
};
const dummy = {
  pos: [[0, D0[0], D0[1]], [46.4, D0[0], D0[1]], [50.2, -1.4, 0.4], [60, -1.4, 0.4]],
  head: [[0, 0], [60, 0]],
  extra: t => 7 * Math.sin(t * 2.1) + 720 * S(clamp((t - 29.2) / 1.6, 0, 1)) + 540 * S(clamp((t - 42) / 2.6, 0, 1)),
  ges: [], faces: [],
  jumps: [[46.6, 38, 0.5], [47.6, 38, 0.5], [48.6, 38, 0.5], [49.6, 38, 0.5]], blink: 0, seed: 3,
};

// ---------- camera ----------
const camTheta = t => wp(t, [[0, 0], [8, 0], [14, -14], [22, -14], [27, -26], [31, -8], [36, 12], [42, -12], [46, 0], [60, 0]]);
const camTilt = t => wp(t, [[0, 10], [26, 10], [30, 16], [34, 9], [60, 10]]);

// ---------- ghép ----------
const heroKeys = buildActor(hero, H.body, H.face, true);
const viniKeys = buildActor(vini, V.body, V.face, true);
const dummyBody = Object.assign({}, H.body);
const dummyKeys = buildActor(dummy, dummyBody, Object.assign({}, H.face, { on: false }), false);

// bóng: nằm yên rồi lăn sau cú đá
const ballAt = t => {
  if (t < KICK_T + 0.02) return [BALL0[0], BALL0[1], 0];
  const u = t - KICK_T - 0.02, dir = [D0[0] - BALL0[0], D0[1] - BALL0[1]], L = Math.hypot(dir[0], dir[1]);
  const v0 = 6.2, decay = 0.9, dist = v0 * (1 - Math.exp(-decay * u)) / decay;
  return [BALL0[0] + dir[0] / L * dist, BALL0[1] + dir[1] / L * dist, dist];
};
const sceneBase = { show: true, layer: 'back', attach: 'free', size: 100, style: 'night360' };
heroKeys.forEach((k, i) => {
  const t = k.t, th = camTheta(t), phiH = k._wh;
  k.yaw = r2(wrap(th - phiH));
  const [bx, bz, bd] = ballAt(t);
  k.props = {
    scene: Object.assign({}, sceneBase, { x: r2(toSceneX(k._X)), y: r2(toSceneY(k._Z)), rot: r2(phiH), tilt: r2(camTilt(t)) }),
    ball: { show: t < KICK_T + 2.6, layer: 'front', attach: 'pitch', x: r2(bx), y: r2(bz), size: 100, rot: r2(bd * 260), style: 'png' },
  };
});
for (const keys of [viniKeys, dummyKeys]) keys.forEach(k => {
  k.yaw = 0;
  k.props = { scene: Object.assign({}, sceneBase, { x: r2(toSceneX(k._X)), y: r2(toSceneY(k._Z)), rot: r2(k._wh), tilt: 10 }) };
});
const clean = keys => keys.map(k => { const o = Object.assign({}, k); delete o._X; delete o._Z; delete o._wh; delete o._jump; return o; });

// ---------- thành phim ----------
const film = JSON.parse(JSON.stringify(H));
film.keys = clean(heroKeys); film.dur = DUR; film.loop = false; film.idle = false;
const k0 = film.keys[0];
film.pose = { type: 0, rotFine: 0, yaw: k0.yaw, hip: k0.hip, limbs: k0.limbs, poles: k0.poles, ends: k0.ends, armSide: { hL: 'auto', hR: 'auto' } };
film.props = Object.assign({}, film.props || {}, k0.props);
film.face = Object.assign({}, H.face, { on: true });

const castVini = { meta: { wx: toSceneX(8), wy: toSceneY(-1.2), wh: 90 }, pose: JSON.parse(JSON.stringify(V.pose)), body: V.body, look: V.look, head: V.head, decals: V.decals, face: V.face, keys: clean(viniKeys) };
const dHead = { expression: 'neutral', expressions: {}, front: null, q45: null, side: null, q135: null, back: null, size: 200, sink: 34, rot: 0, yaw: 0, x: 0, y: 0, shape: { enabled: true, base: 'mannequin', width: 100, height: 100, cheek: 100, jaw: 87, chin: 0, ear: 100, earY: 0, eyeY: 0, eyeWidth: 100, eyeHeight: 100, eyeGap: 100, caricature: 'none', caricatureStrength: 75, extremeEyes: 0, extremeEars: 0, extremeChin: 0, nose: 'round', hair: 'curls' } };
const dLook = { name: 'NGƯỜI NỘM', num: 0, skin: '#f0f2f4', shirt: '#d6dbe0', numc: '#d6dbe0', shorts: '#c3cad1', socks: '#d6dbe0', shoes: '#7a858f', hair: '#d6dbe0' };
const castDummy = { meta: { wx: toSceneX(D0[0]), wy: toSceneY(D0[1]), wh: 0 }, pose: JSON.parse(JSON.stringify(H.pose)), body: dummyBody, look: dLook, head: dHead, decals: Object.fromEntries(Object.entries(H.decals).map(([k, v]) => [k, Object.assign({}, v, { kind: 'text', text: '', img: null })])), face: Object.assign({}, H.face, { on: false }), keys: clean(dummyKeys) };
film.cast = [castVini, castDummy];

// ---------- phụ đề ----------
const cap = (t0, t1, who, text) => ({ t0, t1, who, text });
const captions = [
  cap(0.4, 1.4, '', 'LUYỆN SÚT ⚽'),
  cap(1.6, 4.6, 'HAALAND', 'Chào cả nhà! Mình là Haaland!'),
  cap(5.3, 8.8, 'HAALAND', 'Hôm nay mình tập sút với người nộm này.'),
  cap(9.6, 11.8, 'HAALAND', 'Ơ… ai đây nhỉ?'),
  cap(12.6, 15.2, 'VINI', 'Vini đây! Cho tôi sút thử với!'),
  cap(15.5, 19.3, 'HAALAND', 'Được thôi, sút trượt thì khao kem nhé!'),
  cap(19.8, 22.5, 'VINI', 'Dễ ợt! Xem ai trượt cho biết!'),
  cap(22.8, 25.5, 'HAALAND', 'Xem đây…'),
  cap(29.4, 32.2, 'VINI', 'Ơ! Người nộm quay như chong chóng!'),
  cap(32.8, 36, 'VINI', 'Hên thôi! Đến lượt tôi!'),
  cap(36.4, 39, 'HAALAND', 'Haha, nhảy đi nào!'),
  cap(39.4, 45.8, 'VINI', 'Điệu samba này đây!'),
  cap(46.8, 50.2, 'HAALAND', 'Giỏi lắm! Chụp ảnh chung nào!'),
  cap(50.8, 56, 'HAALAND', 'Theo dõi để xem phần 2 nhé!'),
];
fs.mkdirSync(path.join(root, 'remotion-poc', 'public'), { recursive: true });
fs.writeFileSync(path.join(root, 'remotion-poc', 'public', 'film.json'), JSON.stringify(film));
fs.writeFileSync(path.join(root, 'remotion-poc', 'src', 'film-captions.json'), JSON.stringify(captions));
console.log('ok', film.keys.length, 'khoa/dien vien,', (fs.statSync(path.join(root, 'remotion-poc', 'public', 'film.json')).size / 1e6).toFixed(1), 'MB');
