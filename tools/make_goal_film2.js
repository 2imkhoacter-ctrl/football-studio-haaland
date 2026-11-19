// Phim câm "Bàn thắng" bản 2: dựng theo DANH SÁCH CẢNH (cắt thẳng), nhân vật to lấp khung, camera tự do.
// Dùng: node tools/make_goal_film2.js  ->  remotion-poc/public/goal2.json   (Remotion: composition "Goal2", 24fps, khổ dọc 1080x1920)
// Cảnh: A trung cảnh ngang (hàng thủ kèm hai bên) -> B cận cú sút, bóng bốc lửa -> C cực cận khung thành, thủ môn bay người
//       -> D Haaland chạy ăn mừng -> E cận NỬA NGƯỜI Vini tức giận, Haaland ăn mừng nhỏ ở xa và mờ nhẹ -> F dí sát hơn vào mặt Vini
//       -> G lùi dần ra (zoom out) thấy cả hai.
const fs = require('fs'), path = require('path');
const L = require('./film_lib.js');
const { S, clamp, mix, wrap, r2, wp, toSceneX, toSceneY, buildActor, cleanKeys } = L;
const root = path.resolve(__dirname, '..');
const R = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const H = R('data/characters/haaland-final.json'), V = R('data/characters/vini-final.json');
const FPS = 24, DUR = 15, N = DUR * FPS, o = { FPS, N };
const deg = a => a * 180 / Math.PI, phiToward = (from, to) => { const dx = to[0] - from[0], dz = to[1] - from[1], m = Math.hypot(dx, dz); return deg(Math.atan2(-dx / m, -dz / m)); };

// ---------- mốc cảnh ----------
const SPOT = [0, 41.5], KEEPER = [0.6, 52.0], TK = 3.05, TC = 3.1, TL = 0.63, TARGET = [2.6, 54.4, 1.35];
const HK = [-0.8, 40.9];                 // chỗ Haaland sút
const HC = [6.61, 42.7];                // chỗ Haaland ăn mừng (đặt sao cho nằm sau lưng Vini ở cảnh E)
const VINI = [-2.2, 33.6];
const D1P = [-0.6, 38.6], D2P = [-1.0, 44.0];

const hero = {
  pos: [[0, -3.2, 40.4], [1.9, -1.6, 40.8], [2.6, HK[0], HK[1]], [4.4, HK[0], HK[1]], [5.2, HK[0], HK[1]], [6.9, HC[0], HC[1]], [15, HC[0], HC[1]]],
  head: [[0, phiToward([-3.2, 40.4], SPOT)], [2.0, -178], [2.7, -178], [5.0, -178], [5.5, -178], [6.3, -52], [7.0, -52], [8.2, -20], [9.5, -20], [15, -20]],
  runSpeed: 4.4, kick: TK, blink: 0.3, seed: 1,
  ges: [{ t0: 1.6, t1: 2.6, g: 'hips' }, { t0: 3.6, t1: 5.8, g: 'armsUp' }, { t0: 5.9, t1: 7.0, g: 'wide' }, { t0: 7.0, t1: 15, g: 'armsUp' }],
  faces: [{ t0: 0, t1: 3.3, e: 'focus' }, { t0: 3.3, t1: 5.6, e: 'surprised' }, { t0: 5.6, t1: 8.0, e: 'scream' }, { t0: 8.0, t1: 15, e: 'laugh' }],
  jumps: [[3.5, 110, 0.7], [7.1, 120, 0.6], [8.4, 110, 0.6], [9.7, 110, 0.6], [11.0, 110, 0.6], [12.4, 100, 0.6], [13.6, 100, 0.6]],
  hyaw: t => 6 * Math.sin(t * 1.3),
};
const vini = {
  pos: [[0, VINI[0], VINI[1]], [15, VINI[0], VINI[1]]],
  head: [[0, 60], [5.8, 60], [6.6, 10], [15, 10]],
  ges: [{ t0: 0.4, t1: 3.2, g: 'cross' }, { t0: 3.6, t1: 5.8, g: 'hips' }, { t0: 6.4, t1: 10.6, g: 'cross' }, { t0: 10.6, t1: 15, g: 'fists' }],
  faces: [{ t0: 0, t1: 3.3, e: 'smug', look: 12 }, { t0: 3.3, t1: 5.8, e: 'surprised', look: 14 }, { t0: 5.8, t1: 8.5, e: 'angry', look: -25 }, { t0: 8.5, t1: 15, e: 'angry', look: -35 }],
  jumps: [[11.6, 26, 0.35], [12.8, 26, 0.35], [13.9, 26, 0.35]], blink: 1.4, seed: 7,
  hyaw: t => (t < 7 ? 3 * Math.sin(t) : 16 * Math.sin(t * 4.6)), runSpeed: 1.6,
};
const defender = (pos, face, seed) => ({
  pos: [[0, pos[0], pos[1]], [15, pos[0], pos[1]]], head: [[0, face], [15, face]], stance: 1.6, blink: seed * 0.5, seed,
  ges: [{ t0: 0.3, t1: 3.4, g: 'defend' }, { t0: 3.8, t1: 15, g: 'head' }], faces: [], jumps: [], hyaw: t => (t < 3.6 ? 0 : 10 * Math.sin(t * 2.2 + seed)),
});
const D1 = defender(D1P, phiToward(D1P, HK), 3), D2 = defender(D2P, phiToward(D2P, HK), 4);
const DIVE0 = 3.30, DIVE1 = 4.25;
const keeper = {
  pos: [[0, KEEPER[0], KEEPER[1]], [DIVE0, KEEPER[0], KEEPER[1]], [DIVE1, 2.4, 52.2], [15, 2.4, 52.2]], head: [[0, 0], [15, 0]], stance: 1.5, blink: 0.9, seed: 9,
  ges: [{ t0: 0.3, t1: 3.3, g: 'defend' }], faces: [], jumps: [],
  mod: (t, key, c) => {
    if (t < DIVE0) return;
    const u = clamp((t - DIVE0) / (DIVE1 - DIVE0), 0, 1), w = S(u), arc = Math.sin(Math.PI * u);
    key.rotFine = 78 * w;
    key.hip = [300, mix(c.hipStand, 548, w) - 80 * arc * (1 - w * 0.3)];
    const kz = c.ka, arms = [[-40 * kz, -150 * kz, 20 * kz], [40 * kz, -150 * kz, 20 * kz]];
    key.limbs.hL = key.limbs.hL.map((v, j) => mix(v, arms[0][j], w)); key.limbs.hR = key.limbs.hR.map((v, j) => mix(v, arms[1][j], w));
    key.limbs.fL = key.limbs.fL.map((v, j) => mix(v, [-12, 0.88 * c.footY, -10][j], w)); key.limbs.fR = key.limbs.fR.map((v, j) => mix(v, [12, 0.88 * c.footY, -10][j], w));
  },
};

// ---------- camera: danh sách cảnh ----------
// mỗi cảnh: [t0, t1, hàm(t) -> {cx,cz,theta,size,tilt,waist|face,dof}]
const heroPosAt = t => L.wp2(t, hero.pos);
const shots = [
  [0, 2.6, t => ({ cx: -0.8, cz: 41.2, theta: -88, size: 75, tilt: 8, waist: 340, dof: 0 })],
  [2.6, 3.5, t => ({ cx: -0.3, cz: 41.2, theta: -88, size: 62, tilt: 8, waist: 340, dof: 0 })],
  [3.5, 6.0, t => ({ cx: KEEPER[0], cz: 52.0, theta: 0, size: mix(55, 50, (t - 3.5) / 2.5), tilt: 8, keeper: true, dof: 0 })],
  [6.0, 8.4, t => { const p = heroPosAt(t); return { cx: p[0], cz: p[1], theta: -20, size: 85, tilt: 10, waist: 370, dof: 0 }; }],
  [8.4, 10.8, t => ({ cx: VINI[0] + 1.07, cz: VINI[1] - 0.75, theta: 35, size: mix(40, 36, (t - 8.4) / 2.4), tilt: 8, face: 240, dof: 40, camH: 6.6 })],
  [10.8, 12.4, t => ({ cx: VINI[0] + 1.07, cz: VINI[1] - 0.75, theta: 35, size: mix(36, 30, S((t - 10.8) / 1.6)), tilt: 8, face: 240, dof: 40, camH: 6.6 })],
  [12.4, 15.0, t => { const u = S((t - 12.4) / 1.8); return { cx: mix(VINI[0] + 1.07, VINI[0] + (HC[0] - VINI[0]) * 0.3, u), cz: mix(VINI[1] - 0.75, VINI[1] + (HC[1] - VINI[1]) * 0.3, u), theta: 35, size: mix(30, 85, u), tilt: 10, face: 240, blend: u * 0.3, dof: mix(40, 10, u), camH: mix(6.6, 0, u) }; }],
];
const FACEY = (640 - 1.2 * V.body.shoe - 0.975 * (V.body.thigh + V.body.shin)) - 190; // độ cao mặt Vini (tọa độ hình)
function camAt(t) {
  const s = shots.find(x => t >= x[0] && t < x[1]) || shots[shots.length - 1], c = s[2](t), kz = 100 / c.size;
  let ty;
  if (c.face != null) { const tyFace = c.face - (645 + kz * (FACEY - 645)), tyWaist = 340 - (645 - 273 * kz); ty = mix(tyFace, tyWaist, c.blend || 0); }
  else if (c.keeper) { const hk = gk[clamp(Math.round(t * FPS), 0, N)].hip[1]; ty = 400 - (645 + kz * (hk - 645)); }
  else ty = c.waist - (645 - 273 * kz);
  return Object.assign({}, c, { ty });
}

// ---------- bóng ----------
function ballAt(t) {
  if (t < TC) return { x: SPOT[0], z: SPOT[1], h: 0.11, fire: 0, vx: 0, vz: 0, spin: 0 };
  const u = clamp((t - TC) / TL, 0, 1);
  if (t - TC <= TL) {
    const x = mix(SPOT[0], TARGET[0], u), z = mix(SPOT[1], TARGET[1], u), h = 0.11 + (TARGET[2] - 0.11) * Math.pow(u, 0.85) + 0.25 * Math.sin(Math.PI * u);
    return { x, z, h, fire: 100, vx: (TARGET[0] - SPOT[0]) / TL, vz: (TARGET[1] - SPOT[1]) / TL, spin: u * 40 };
  }
  const w = t - TC - TL;
  return { x: TARGET[0] + 0.12 * w, z: Math.min(54.7, TARGET[1] + 0.35 * (1 - Math.exp(-w * 4))), h: Math.max(0.11, TARGET[2] - 2.45 * w * w), fire: Math.max(0, 100 - w * 260), vx: 2, vz: 3, spin: 40 + w * 120 };
}

// ---------- dựng phím ----------
const heroKeys = buildActor(hero, H.body, H.face, true, o);
const viniKeys = buildActor(vini, V.body, V.face, true, o);
const mannBody = Object.assign({}, H.body), mannFace = Object.assign({}, H.face, { on: false });
const d1 = buildActor(D1, mannBody, mannFace, false, o), d2 = buildActor(D2, mannBody, mannFace, false, o), gk = buildActor(keeper, mannBody, mannFace, false, o);
const base = { show: true, layer: 'back', attach: 'free', style: 'night360', free: 1 };
heroKeys.forEach(k => {
  const t = k.t, c = camAt(t), b = ballAt(t);
  k.yaw = r2(wrap(c.theta - k._wh));
  k.props = {
    scene: Object.assign({}, base, { x: r2(toSceneX(k._X)), y: r2(toSceneY(k._Z)), rot: r2(k._wh), tilt: r2(c.tilt), size: r2(c.size), dof: r2(c.dof), camX: r2(toSceneX(c.cx)), camY: r2(toSceneY(c.cz)), ty: r2(c.ty), camH: r2(c.camH || 0) }),
    ball: { show: t < 5.6, layer: 'front', attach: 'pitch', x: r2(b.x), y: r2(b.z), h: r2(b.h), size: 100, rot: r2(b.spin * 9), style: 'png', fire: r2(b.fire), vx: r2(b.vx), vz: r2(b.vz) },
  };
});
for (const keys of [viniKeys, d1, d2, gk]) keys.forEach(k => {
  const c = camAt(k.t);
  k.yaw = 0;
  k.props = { scene: Object.assign({}, base, { x: r2(toSceneX(k._X)), y: r2(toSceneY(k._Z)), rot: r2(k._wh), tilt: 10, size: r2(c.size), dof: 0, camX: r2(toSceneX(c.cx)), camY: r2(toSceneY(c.cz)), ty: 0, camH: r2(c.camH || 0) }) };
});
const dHeadShape = { enabled: true, base: 'mannequin', width: 100, height: 100, cheek: 100, jaw: 87, chin: 0, ear: 100, earY: 0, eyeY: 0, eyeWidth: 100, eyeHeight: 100, eyeGap: 100, caricature: 'none', caricatureStrength: 75, extremeEyes: 0, extremeEars: 0, extremeChin: 0, nose: 'round', hair: 'curls' };
const blankDecals = Object.fromEntries(Object.entries(H.decals).map(([k, v]) => [k, Object.assign({}, v, { kind: 'text', text: '', img: null })]));
const mannequin = (name, kit, keys, start) => ({
  meta: { wx: toSceneX(start[0]), wy: toSceneY(start[1]), wh: 0 }, pose: JSON.parse(JSON.stringify(H.pose)), body: mannBody,
  look: Object.assign({ name, num: 0, skin: '#f0f2f4', numc: kit.shirt, hair: '#d6dbe0' }, kit),
  head: { expression: 'neutral', expressions: {}, front: null, q45: null, side: null, q135: null, back: null, size: 200, sink: 34, rot: 0, yaw: 0, x: 0, y: 0, shape: dHeadShape },
  decals: blankDecals, face: Object.assign({}, H.face, { on: false }), keys: cleanKeys(keys)
});
const red = { shirt: '#c62828', shorts: '#f4f4f4', socks: '#c62828', shoes: '#222222' }, green = { shirt: '#2e9e4f', shorts: '#1d1d1d', socks: '#2e9e4f', shoes: '#222222' };
const film = JSON.parse(JSON.stringify(H));
film.keys = cleanKeys(heroKeys); film.dur = DUR; film.loop = false; film.idle = false;
const k0 = film.keys[0];
film.pose = { type: 0, rotFine: 0, yaw: k0.yaw, hip: k0.hip, limbs: k0.limbs, poles: k0.poles, ends: k0.ends, armSide: { hL: 'auto', hR: 'auto' } };
film.props = Object.assign({}, film.props || {}, k0.props);
film.face = Object.assign({}, H.face, { on: true });
film.cast = [
  { meta: { wx: toSceneX(VINI[0]), wy: toSceneY(VINI[1]), wh: 60 }, pose: JSON.parse(JSON.stringify(V.pose)), body: V.body, look: V.look, head: V.head, decals: V.decals, face: V.face, keys: cleanKeys(viniKeys) },
  mannequin('HÀNG THỦ 1', red, d1, D1P), mannequin('HÀNG THỦ 2', red, d2, D2P), mannequin('THỦ MÔN', green, gk, KEEPER),
];
const out = path.join(root, 'remotion-poc', 'public', 'goal2.json');
fs.writeFileSync(out, JSON.stringify(film));
console.log('ok', film.keys.length, 'khoa/dien vien,', film.cast.length, 'dien vien phu,', (fs.statSync(out).size / 1e6).toFixed(1), 'MB');
