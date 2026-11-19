// Phim câm 18 giây "Bàn thắng": không một chữ, chỉ diễn xuất + hiệu ứng.
// Dùng: node tools/make_goal_film.js  ->  remotion-poc/public/goal.json
// Cảnh: Haaland đá phạt đền, bóng bốc lửa, thủ môn bay người không cản được, hàng thủ đứng nhìn, Haaland chạy ăn mừng,
// camera lùi xa dần, Vini đứng xa nhìn bằng ánh mắt tức giận trong khi Haaland (đang ăn mừng) bị mờ nhẹ.
const fs = require('fs'), path = require('path');
const L = require('./film_lib.js');
const { S, clamp, mix, wrap, r2, wp, toSceneX, toSceneY, buildActor, cleanKeys } = L;
const root = path.resolve(__dirname, '..');
const R = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const H = R('data/characters/haaland-final.json'), V = R('data/characters/vini-final.json');
const FPS = 24, DUR = 18, N = DUR * FPS, o = { FPS, N };

// ---------- bối cảnh ----------
const SPOT = [0, 41.5], GOALZ = 52.5, TK = 5.1, TC = TK + 0.05, TL = 0.63; // TK: lúc đá; TC: chạm bóng; TL: thời gian bay
const HERO_K = [-0.8, 40.8];

// ---------- Haaland ----------
const hero = {
  pos: [[0, -5.8, 36.6], [3.0, -2.8, 39.4], [4.6, HERO_K[0], HERO_K[1]], [6.3, HERO_K[0], HERO_K[1]], [11.0, 1.4, 28.5], [18, 1.4, 28.5]],
  head: [[0, -128], [4.0, -135], [4.9, -178], [6.2, -178], [6.9, -360], [8.0, -372], [11, -372], [12.3, -360], [18, -360]],
  runSpeed: 2.8, kick: TK, blink: 0.3, seed: 1,
  ges: [{ t0: 2.6, t1: 4.2, g: 'hips' }, { t0: 5.5, t1: 6.6, g: 'armsUp' }, { t0: 6.7, t1: 11.2, g: 'wide' }, { t0: 11.4, t1: 18, g: 'armsUp' }],
  faces: [{ t0: 0, t1: 5.3, e: 'focus' }, { t0: 5.3, t1: 6.7, e: 'surprised' }, { t0: 6.7, t1: 11.6, e: 'scream' }, { t0: 11.6, t1: 18, e: 'laugh' }],
  jumps: [[5.6, 120, 0.7], [11.7, 110, 0.6], [13.0, 100, 0.6], [14.4, 100, 0.6], [15.8, 100, 0.6]],
  hyaw: t => 6 * Math.sin(t * 1.3),
};
// ---------- Vini (xa, tức giận) ----------
const VINI = [-2.2, 33.6];
const vini = {
  pos: [[0, VINI[0], VINI[1]], [18, VINI[0], VINI[1]]],
  head: [[0, -48], [6.2, -48], [7.4, -35], [18, -35]],
  ges: [{ t0: 0.8, t1: 5.2, g: 'cross' }, { t0: 5.4, t1: 6.5, g: 'hips' }, { t0: 6.8, t1: 12.4, g: 'cross' }, { t0: 12.6, t1: 18, g: 'fists' }],
  faces: [{ t0: 0, t1: 5.2, e: 'smug', look: 12 }, { t0: 5.2, t1: 6.6, e: 'surprised', look: 14 }, { t0: 6.7, t1: 18, e: 'angry', look: 18 }],
  jumps: [[14.2, 26, 0.35], [15.2, 26, 0.35], [16.4, 26, 0.35]], blink: 1.4, seed: 7,
  hyaw: t => (t < 8.5 ? 4 * Math.sin(t) : 20 * Math.sin(t * 5.2)), // lắc đầu "không chịu"
  runSpeed: 1.6,
};
// ---------- hàng thủ (người nộm áo đỏ) ----------
const defender = (pos, face, seed) => ({
  pos: [[0, pos[0], pos[1]], [18, pos[0], pos[1]]], head: [[0, face], [18, face]], stance: 1.7, blink: seed * 0.5, seed,
  ges: [{ t0: 0.4, t1: 5.4, g: 'defend' }, { t0: 5.7, t1: 18, g: 'head' }],
  faces: [], jumps: [],
  hyaw: t => (t < 5.5 ? 0 : 12 * Math.sin(t * 2.2 + seed)),
});
const D1 = defender([-6.2, 44.2], -58, 3), D2 = defender([-3.6, 45.3], -32, 4), D3 = defender([4.6, 44.6], 55, 5);
// ---------- thủ môn: chờ rồi bay người, không kịp ----------
const DIVE0 = 5.32, DIVE1 = 5.97;
const keeper = {
  pos: [[0, 0.4, 52.0], [DIVE0, 0.4, 52.0], [DIVE1, 2.6, 52.2], [18, 2.6, 52.2]], head: [[0, 0], [18, 0]], stance: 1.5, blink: 0.9, seed: 9,
  ges: [{ t0: 0.4, t1: 5.3, g: 'defend' }],
  faces: [], jumps: [],
  mod: (t, key, c) => {
    if (t < DIVE0) return;
    const u = clamp((t - DIVE0) / (DIVE1 - DIVE0), 0, 1), w = S(u), arc = Math.sin(Math.PI * u);
    key.rotFine = 78 * w;
    key.hip = [300, mix(c.hipStand, 548, w) - 70 * arc * (1 - w * 0.4)];
    const kz = c.ka, arms = [[-40 * kz, -150 * kz, 20 * kz], [40 * kz, -150 * kz, 20 * kz]];
    key.limbs.hL = key.limbs.hL.map((v, j) => mix(v, arms[0][j], w)); key.limbs.hR = key.limbs.hR.map((v, j) => mix(v, arms[1][j], w));
    key.limbs.fL = key.limbs.fL.map((v, j) => mix(v, [-12, 0.88 * c.footY, -10][j], w)); key.limbs.fR = key.limbs.fR.map((v, j) => mix(v, [12, 0.88 * c.footY, -10][j], w));
  },
};
const kfaces = [{ t0: 0, t1: 5.3, e: 'focus' }, { t0: 5.3, t1: 6.5, e: 'surprised' }, { t0: 6.5, t1: 18, e: 'sad' }];
keeper.faces = kfaces;
for (const d of [D1, D2, D3]) d.faces = [{ t0: 0, t1: 5.5, e: 'focus' }, { t0: 5.5, t1: 7.2, e: 'surprised' }, { t0: 7.2, t1: 18, e: 'sad' }];

// ---------- camera ----------
const camTheta = t => wp(t, [[0, 24], [4.5, 22], [5.6, 20], [6.8, 34], [8.8, 20], [10.6, 0], [18, 0]]);
const camTilt = t => wp(t, [[0, 10], [18, 14]]);
const camSize = t => wp(t, [[0, 100], [5, 100], [7, 118], [9.2, 135], [18, 135]]);
const camDof = t => wp(t, [[0, 0], [8.8, 0], [10.2, 36], [18, 36]]); // mờ nhẹ lúc cảnh xa

// ---------- bóng bốc lửa ----------
const TARGET = [2.6, 54.4, 1.35];
function ballAt(t) {
  if (t < TC) return { x: SPOT[0], z: SPOT[1], h: 0.11, fire: 0, vx: 0, vz: 0, spin: 0 };
  const u = clamp((t - TC) / TL, 0, 1);
  if (t - TC <= TL) {
    const x = mix(SPOT[0], TARGET[0], u), z = mix(SPOT[1], TARGET[1], u), h = 0.11 + (TARGET[2] - 0.11) * Math.pow(u, 0.85) + 0.25 * Math.sin(Math.PI * u);
    return { x, z, h, fire: 100, vx: (TARGET[0] - SPOT[0]) / TL, vz: (TARGET[1] - SPOT[1]) / TL, spin: u * 40 };
  }
  const w = t - TC - TL, drop = Math.max(0.11, TARGET[2] - 4.9 * w * w * 0.5 * 1.0 + 0); // rơi xuống lưới
  const fire = Math.max(0, 100 - w * 260), z = TARGET[1] + 0.35 * (1 - Math.exp(-w * 4)), x = TARGET[0] + 0.12 * w;
  return { x, z: Math.min(z, 54.7), h: Math.max(0.11, drop), fire, vx: 2, vz: 3, spin: 40 + w * 120 };
}

// ---------- dựng phím ----------
const heroKeys = buildActor(hero, H.body, H.face, true, o);
const viniKeys = buildActor(vini, V.body, V.face, true, o);
const mannBody = Object.assign({}, H.body);
const mannFace = Object.assign({}, H.face, { on: true });
const d1 = buildActor(D1, mannBody, mannFace, false, o), d2 = buildActor(D2, mannBody, mannFace, false, o), d3 = buildActor(D3, mannBody, mannFace, false, o);
const gk = buildActor(keeper, mannBody, mannFace, false, o);
const sceneBase = { show: true, layer: 'back', attach: 'free', style: 'night360' };
heroKeys.forEach(k => {
  const t = k.t, b = ballAt(t);
  k.yaw = r2(wrap(camTheta(t) - k._wh));
  k.props = {
    scene: Object.assign({}, sceneBase, { x: r2(toSceneX(k._X)), y: r2(toSceneY(k._Z)), rot: r2(k._wh), tilt: r2(camTilt(t)), size: r2(camSize(t)), dof: r2(camDof(t)) }),
    ball: { show: t < 9, layer: 'front', attach: 'pitch', x: r2(b.x), y: r2(b.z), h: r2(b.h), size: 100, rot: r2(b.spin * 9), style: 'png', fire: r2(b.fire), vx: r2(b.vx), vz: r2(b.vz) },
  };
});
for (const keys of [viniKeys, d1, d2, d3, gk]) keys.forEach(k => {
  k.yaw = 0;
  k.props = { scene: Object.assign({}, sceneBase, { x: r2(toSceneX(k._X)), y: r2(toSceneY(k._Z)), rot: r2(k._wh), tilt: 10, size: 100, dof: 0 }) };
});

// ---------- diễn viên phụ ----------
const dHeadShape = { enabled: true, base: 'mannequin', width: 100, height: 100, cheek: 100, jaw: 87, chin: 0, ear: 100, earY: 0, eyeY: 0, eyeWidth: 100, eyeHeight: 100, eyeGap: 100, caricature: 'none', caricatureStrength: 75, extremeEyes: 0, extremeEars: 0, extremeChin: 0, nose: 'round', hair: 'curls' };
const blankDecals = Object.fromEntries(Object.entries(H.decals).map(([k, v]) => [k, Object.assign({}, v, { kind: 'text', text: '', img: null })]));
const mannequin = (name, kit, keys, start) => ({
  meta: { wx: toSceneX(start[0]), wy: toSceneY(start[1]), wh: 0 }, pose: JSON.parse(JSON.stringify(H.pose)), body: mannBody,
  look: Object.assign({ name, num: 0, skin: '#f0f2f4', numc: kit.shirt, hair: '#d6dbe0' }, kit),
  head: { expression: 'neutral', expressions: {}, front: null, q45: null, side: null, q135: null, back: null, size: 200, sink: 34, rot: 0, yaw: 0, x: 0, y: 0, shape: dHeadShape },
  decals: blankDecals, face: Object.assign({}, H.face, { on: false }), keys: cleanKeys(keys)
});
// các nhân vật nộm không có mặt thật: tắt face
const red = { shirt: '#c62828', shorts: '#f4f4f4', socks: '#c62828', shoes: '#222222' }, green = { shirt: '#2e9e4f', shorts: '#1d1d1d', socks: '#2e9e4f', shoes: '#222222' };
const film = JSON.parse(JSON.stringify(H));
film.keys = cleanKeys(heroKeys); film.dur = DUR; film.loop = false; film.idle = false;
const k0 = film.keys[0];
film.pose = { type: 0, rotFine: 0, yaw: k0.yaw, hip: k0.hip, limbs: k0.limbs, poles: k0.poles, ends: k0.ends, armSide: { hL: 'auto', hR: 'auto' } };
film.props = Object.assign({}, film.props || {}, k0.props);
film.face = Object.assign({}, H.face, { on: true });
film.cast = [
  { meta: { wx: toSceneX(VINI[0]), wy: toSceneY(VINI[1]), wh: -48 }, pose: JSON.parse(JSON.stringify(V.pose)), body: V.body, look: V.look, head: V.head, decals: V.decals, face: V.face, keys: cleanKeys(viniKeys) },
  mannequin('HÀNG THỦ 1', red, d1, D1.pos[0].slice(1)), mannequin('HÀNG THỦ 2', red, d2, D2.pos[0].slice(1)), mannequin('HÀNG THỦ 3', red, d3, D3.pos[0].slice(1)),
  mannequin('THỦ MÔN', green, gk, keeper.pos[0].slice(1)),
];
const out = path.join(root, 'remotion-poc', 'public', 'goal.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(film));
console.log('ok', film.keys.length, 'khoa/dien vien,', film.cast.length, 'dien vien phu,', (fs.statSync(out).size / 1e6).toFixed(1), 'MB');
