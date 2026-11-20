// Phim học tập: dựng lại CẤU TRÚC EDIT của short "Đức 5-0 Hà Lan" (15 s). Ghi chú gốc: docs/hoc-ky-thuat-short-7-doi-dau-5-0.md
// Dùng: node tools/make_film_doi_dau_5_0.js [file_ra.json]
// Nhân vật: VINI thu nhỏ (tỉ lệ do chủ dự án chỉnh, data/poses/om-vini-nho.json) là nhân vật chính (có mặt vector để diễn);
//           HAALAND là người ôm/bế (dáng ôm do chủ dự án tự chỉnh); người nộm làm các vai phụ.
// Cảnh: (1) zoom vào chậm 47% + rack focus (mờ -> nét), nhân vật vào từ mép phải; (2) CẮT sang cảnh rộng đứng im;
//       (3) CẮT + punch-in, người ôm vẫy tay, người bị ôm mặt khóc; (4) xoẹt lia trái + phóng vào đám đông; (5) tối dần.
const fs = require('fs'), path = require('path');
const L = require('./film_lib.js');
const { S, clamp, mix, wrap, r2, toSceneX, toSceneY, buildActor, cleanKeys } = L;
const root = path.resolve(__dirname, '..');
const R = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const H = R('data/characters/haaland-final.json'), V = R('data/characters/vini-final.json'), P = R('data/poses/om-vini-nho.json');
const FPS = 24, DUR = 15.07, N = Math.round(DUR * FPS), o = { FPS, N };
const ease = (t, a, b) => S(clamp((t - a) / (b - a), 0, 1));
const CUT1 = 6.08, CUT2 = 8.08, WHIP = 11.6, FADE0 = 14.25;
const Z0 = 12;                                                 // độ sâu chung (mét)
// vị trí tương đối đo từ file dáng ôm của chủ dự án: Vini lệch so với Haaland (đơn vị khung -> mét)
const VX = (P.viniMeta.wx - 300) * 0.068, VZ = (640 - P.viniMeta.wy) * 0.075;   // ~(-0.38, -0.81)
const CARRY_X = 0.45;                                          // Haaland đứng lệch phải khung một chút

const mannequin = (shirt, shorts) => ({
  body: H.body,
  look: Object.assign({}, H.look, { name: 'NGUOI NOM', num: 0, skin: '#f0f2f4', shirt, numc: shirt, shorts, socks: shirt, shoes: '#7a858f', hair: '#d6dbe0' }),
  head: Object.assign(JSON.parse(JSON.stringify(H.head)), {
    shape: { enabled: true, width: 100, height: 100, cheek: 100, jaw: 87, chin: 0, ear: 100, earY: 0, eyeY: 0, eyeWidth: 100, eyeHeight: 100, eyeGap: 100, caricature: 'none', caricatureStrength: 75, extremeEyes: 0, extremeEars: 0, extremeChin: 0, nose: 'round', hair: 'curls', base: 'mannequin' },
    front: null, q45: null, side: null, q135: null, back: null, expressions: {}, size: 200, rot: 0, yaw: 0, x: 0, y: 0 }),
  face: Object.assign({}, H.face, { on: false }),
  decals: { f1: { kind: 'text', text: null, img: '', x: 0, y: 40, size: 100, rot: 0, color: null, show: false }, f2: { kind: 'image', text: '', img: '', x: -42, y: 78, size: 100, rot: 0, color: null, show: false }, f3: { kind: 'image', text: '', img: '', x: 42, y: 78, size: 100, rot: 0, color: null, show: false } },
});
const wave = (t, ph) => Math.sin(2 * Math.PI * 1.6 * t + ph);
const fixPos = (x, z) => [[0, x, z], [15, x, z]];
// chỉ hiện trong cửa sổ [t0,t1]; ngoài đó đẩy ra xa mép khung (nhiều cảnh trong cùng một sân)
const withVis = (spec, t0, t1) => { const p = spec.pos[0]; spec.pos = Array.from({ length: N + 1 }, (_, i) => { const t = i / FPS; return [t, p[1] + (t >= t0 && t < t1 ? 0 : 90), p[2]]; }); return spec; };
// đặt NGUYÊN dáng chủ dự án đã chỉnh (hông, tay, chân, khuỷu, bàn tay, tay trước/sau thân)
const applyPose = (key, pose) => {
  key.hip = pose.hip.slice(); key.rotFine = pose.rotFine; key.limbs = JSON.parse(JSON.stringify(pose.limbs)); key.poles = JSON.parse(JSON.stringify(pose.poles));
  key.ends = JSON.parse(JSON.stringify(pose.ends)); key.side = JSON.parse(JSON.stringify(pose.armSide || { hL: 'auto', hR: 'auto' }));
};

// ---- VINI thu nhỏ: nhân vật chính, có mặt vector ----
const vini = {
  pos: Array.from({ length: N + 1 }, (_, i) => { const t = i / FPS; return [t, t < CUT1 ? mix(2.6, 0.9, ease(t, 0.7, 2.3)) : CARRY_X + VX, t < CUT1 ? Z0 : Z0 + VZ]; }),
  head: [[0, 0], [15, 0]], stance: 1, runSpeed: 3.5, blink: 0.4, seed: 3, ges: [], jumps: [],
  faces: [{ t0: 0, t1: 15, e: 'sad' }],
  mod: (t, key, c) => {
    const f = key.face;
    if (t < CUT1) {                                                // cười buồn: miệng nhếch một bên, mi nặng, mắt liếc xuống, nghiêng đầu
      Object.assign(f, { browKind: 'sad', mouthKind: 'smirk', mouthOpen: 0, lidL: 30, lidR: 30, lookY: 25 });
      key.hrot = r2(-6 * ease(t, 2.0, 2.8));
      return;
    }
    applyPose(key, P.vini);                                        // ĐƯỢC ÔM: dáng chủ dự án chỉnh (chân lơ lửng, tay thõng)
    const wob = Math.sin(2 * Math.PI * 0.9 * t);
    key.hip[1] += 3 * wob; key.hrot = r2(-6 + 5 * wob);
    const cry = t > CUT2 + 0.5;
    Object.assign(f, { browKind: 'sad', mouthKind: cry ? 'sad' : 'closed', mouthOpen: 0, lidL: cry ? 35 : 20, lidR: cry ? 35 : 20, lookY: 30, browThick: 140 });
  },
};

// ---- HAALAND ôm: dáng của chủ dự án, vẫy tay trái sau cú cắt thứ hai ----
const haaland = {
  body: H.body, look: H.look, head: H.head, face: Object.assign({}, H.face, { on: true }), decals: H.decals,
  spec: {
    pos: fixPos(CARRY_X, Z0), head: [[0, 0], [15, 0]], stance: 1, runSpeed: 3.5, blink: 1, seed: 5, ges: [], jumps: [],
    faces: [{ t0: 0, t1: 15, e: 'neutral' }],
    mod: (t, key, c) => {
      applyPose(key, P.haaland);
      const w = t > CUT2 ? wave(t, 0) : 0.15 * wave(t, 0), k = c.ka;
      key.limbs.hL[1] += 14 * k * w;                                 // tay giơ lên vẫy
      key.face.browKind = 'normal'; key.face.mouthKind = 'closed'; key.face.mouthOpen = 0;
    },
  },
};
const sign = Object.assign(mannequin('#2a2a2a', '#1d1d1d'), {
  spec: { pos: fixPos(CARRY_X + 1.5, Z0 - 0.6), head: [[0, 0], [15, 0]], stance: 1, runSpeed: 3.5, blink: 2, seed: 7, ges: [], jumps: [], faces: [],
    mod: (t, key, c) => { const k = c.ka; key.limbs.hL = [-30 * k, 75 * k, 62 * k]; key.limbs.hR = [30 * k, 75 * k, 62 * k]; } },
});
const crowdX = [-2.6, -3.0, -3.4, -2.8, -3.2, -3.6, -2.4];
const crowd = crowdX.map((x, i) => Object.assign(mannequin(i % 2 ? '#1a3b8f' : '#8f1a3b', '#1a3b8f'), {
  spec: { pos: fixPos(x, Z0 - 0.4 - (i % 3) * 0.4), head: [[0, 0], [15, 0]], stance: 1, runSpeed: 3.5, blink: i, seed: 11 + i, ges: [], jumps: [], faces: [],
    mod: (t, key, c) => { const k = c.ka, w = wave(t, i * 1.3); if (t > 11.5) { key.limbs.hR = [-60 * k, -60 * k + 25 * k * w, 20 * k]; if (i % 2) key.limbs.hL = [60 * k, -60 * k + 25 * k * w, 20 * k]; } } },
}));
const mascot = Object.assign(mannequin('#f26b1d', '#ffffff'), { spec: { pos: fixPos(-0.8, Z0 + 12), head: [[0, 0], [15, 0]], stance: 1, runSpeed: 3.5, blink: 3, seed: 13, ges: [], jumps: [], faces: [] } });

// ---- camera THẬT (cam3d): dist = khoảng cách tới điểm nhắm (m), focal = tiêu cự, camH = độ cao máy, dof = làm mờ nhân vật chính (rack focus) ----
const shots = [
  [0, CUT1, t => ({ cx: 0.6, cz: Z0, theta: 0, dist: mix(2.2, 1.5, ease(t, 0, 2.6)), focal: 600, camH: 0.95, ty: 0, dof: 70 * (1 - ease(t, 3.9, 4.3)) })],
  [CUT1, CUT2, t => ({ cx: 0.5, cz: Z0 - 0.4, theta: 0, dist: 4.6 - 0.6 * ease(t, 6.62, 6.95), focal: 600, camH: 0.9, ty: 0, dof: 0 })],
  [CUT2, WHIP, t => ({ cx: 0.35, cz: Z0 - 0.4, theta: 0, dist: mix(3.5, 2.7, ease(t, CUT2, CUT2 + 0.27)), focal: 600, camH: 1.15, ty: 0, dof: 0 })],
  [WHIP, 99, t => ({ cx: mix(0.35, -2.3, ease(t, WHIP, WHIP + 0.5)), cz: Z0 - 0.4, theta: 0, dist: mix(2.7, 3.0, ease(t, WHIP, WHIP + 0.5)), focal: 600, camH: 1.15, ty: 0, dof: 0 })],
];
const camAt = t => { const s = shots.find(x => t >= x[0] && t < x[1]) || shots[shots.length - 1]; return s[2](t); };
const base = { show: true, layer: 'back', attach: 'free', style: 'night360', free: 0, cam3d: 1 };
const sceneAt = (k, c, fade) => Object.assign({}, base, { x: r2(toSceneX(k._X)), y: r2(toSceneY(k._Z)), rot: r2(k._wh), tilt: 8, size: 100, dof: r2(c.dof), camX: r2(toSceneX(c.cx)), camY: r2(toSceneY(c.cz)), camYaw: c.theta, dist: r2(c.dist), focal: c.focal, camH: c.camH, ty: c.ty, fade: r2(fade) });
const fadeAt = t => 100 * ease(t, FADE0, DUR);
const WH = 8;                                                  // hướng người trong file dáng ôm: yaw -8° so với camera

// diễn viên chính: Vini (thân nhỏ do chủ dự án chỉnh)
const mainKeys = buildActor(vini, P.viniBody, V.face, true, o);
mainKeys.forEach(k => { const c = camAt(k.t); k.yaw = r2(wrap(c.theta - (k.t >= CUT1 ? WH : k._wh))); k.props = { scene: sceneAt(k, c, fadeAt(k.t)) }; });
const mkCast = a => {
  const keys = buildActor(a.spec, a.body, a.face, !!a.face.on, o);
  keys.forEach(k => { const c = camAt(k.t); k.yaw = r2(wrap(c.theta - (a === haaland ? WH : 0))); k.props = { scene: sceneAt(k, c, fadeAt(k.t)) }; });
  return { meta: { wx: toSceneX(a.spec.pos[0][1]), wy: toSceneY(a.spec.pos[0][2]), wh: 0 }, pose: JSON.parse(JSON.stringify(H.pose)), body: a.body, look: a.look, head: a.head, decals: a.decals, face: a.face, keys: cleanKeys(keys) };
};
const film = JSON.parse(JSON.stringify(V));
film.body = P.viniBody; film.keys = cleanKeys(mainKeys); film.dur = DUR; film.loop = false; film.idle = false;
const k0 = film.keys[0];
film.pose = { type: 0, rotFine: 0, yaw: k0.yaw, hip: k0.hip, limbs: k0.limbs, poles: k0.poles, ends: k0.ends, armSide: { hL: 'auto', hR: 'auto' } };
film.props = Object.assign({}, film.props || {}, k0.props);
film.face = Object.assign({}, V.face, { on: true, browColor: '#1b1716' });
withVis(haaland.spec, CUT1, 99); withVis(sign.spec, CUT2, 99); withVis(mascot.spec, 0, CUT1); crowd.forEach(c => withVis(c.spec, CUT2, 99));
film.cast = [haaland, sign, mascot, ...crowd].map(mkCast);
const out = path.resolve(process.argv[2] || path.join(root, 'animations', 'phim-doi-dau-5-0.json'));
fs.writeFileSync(out, JSON.stringify(film));
console.log('ok', film.keys.length, 'khoa,', film.cast.length, 'dien vien phu,', (fs.statSync(out).size / 1e6).toFixed(1), 'MB ->', out);
