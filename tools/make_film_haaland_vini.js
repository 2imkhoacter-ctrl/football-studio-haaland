// Phim thử "Haaland suy nghĩ -> CẮT -> Vini ăn mừng SIUUU" (~8,4 giây, khổ dọc, câm).
// Dùng: node tools/make_film_haaland_vini.js [file_ra.json]   (mặc định animations/phim-haaland-vini.json)
// Render: node tools/render_film.js animations/phim-haaland-vini.json ra/
// Ngôn ngữ dựng (học từ ghi chú docs/hoc-ky-thuat-short-bat-chuoc-1.md): mỗi lúc một thứ động, còn lại đứng im;
// chuyển động nhanh dứt khoát; cắt cảnh thẳng; cảm xúc bằng khuôn mặt.
const fs = require('fs'), path = require('path');
const L = require('./film_lib.js');
const { S, clamp, mix, wrap, r2, wp, toSceneX, toSceneY, buildActor, cleanKeys } = L;
const root = path.resolve(__dirname, '..');
const R = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const H = R('data/characters/haaland-final.json'), V = R('data/characters/vini-final.json');
const FPS = 24, DUR = 8.4, N = Math.round(DUR * FPS), o = { FPS, N };
const CUT = 5.2;                                  // giây cắt từ Haaland sang Vini

const HP = [-0.2, 40], VP = [0, 10];             // chỗ đứng trên sân (mét). Hai người cách xa nhau để cảnh nào cũng không thấy người kia.
const ease = (t, a, b) => S(clamp((t - a) / (b - a), 0, 1));

// ---- tay chắp sau lưng (đè lên cử chỉ mặc định) ----
function handsBehind(t, key, c, w) {
  if (w <= 0) return;
  const k = c.ka, tgt = { hL: [-10 * k, 112 * k, -78 * k], hR: [10 * k, 112 * k, -78 * k] };
  for (const s of ['hL', 'hR']) key.limbs[s] = key.limbs[s].map((v, j) => mix(v, tgt[s][j], w));
}

// ---- Haaland: đi qua đi lại, mặt suy nghĩ, rồi nhìn lên ----
const hero = {
  pos: [[0, -1.6, 40], [0.4, -1.6, 40], [2.4, 1.6, 40], [2.95, 1.6, 40], [4.3, -0.2, 40], [15, -0.2, 40]],
  head: [[0, -90], [2.4, -90], [2.95, 90], [4.3, 90], [4.85, 12], [15, 12]],
  runSpeed: 3.4, blink: 0.4, seed: 1,
  ges: [], faces: [{ t0: 0, t1: 15, e: 'think' }], jumps: [],
  mod: (t, key, c) => {
    handsBehind(t, key, c, ease(t, 0.05, 0.45));                       // tay chắp sau lưng suốt cả cảnh
    const up = ease(t, 4.5, 4.75);                                      // nhìn lên (mắt lên + ngửa đầu nhẹ)
    key.face.lookY = r2(-90 * up);
    key.hrot = r2(-5 * up);
  },
};

// ---- Vini: nhảy xoay, đáp xuống, giang tay ra sau, hét SIUUU ----
const ARMS_BACK = k => ({ hL: [-128 * k, 38 * k, -92 * k], hR: [128 * k, 38 * k, -92 * k] });
const vini = {
  pos: [[0, VP[0], VP[1]], [15, VP[0], VP[1]]],
  head: [[0, 0], [CUT, 0], [CUT + 0.45, 180], [15, 180]],               // đang quay lưng, xoay 180° trên không rồi quay mặt vào máy
  stance: 2.1, runSpeed: 1.6, blink: 1.1, seed: 7,
  ges: [], faces: [{ t0: 0, t1: CUT + 0.45, e: 'grin' }, { t0: CUT + 0.45, t1: 15, e: 'scream', talk: true }],
  jumps: [[CUT - 0.12, 95, 0.58]],
  mod: (t, key, c) => {
    const w = ease(t, CUT - 0.1, CUT + 0.3), a = ARMS_BACK(c.ka);       // hai tay mở ra sau
    for (const s of ['hL', 'hR']) key.limbs[s] = key.limbs[s].map((v, j) => mix(v, a[s][j], w));
    key.rotFine = r2(mix(key.rotFine, -4, w));
    key.hyaw = r2(0);
    if (t > CUT + 0.6) { key.face.mouthOpen = r2(86 + 6 * Math.sin(t * 9)); }   // há to, rung nhẹ khi hét
  },
};

// ---- camera: 2 cảnh, CẮT thẳng ----
const shots = [
  [0, CUT, t => ({ cx: HP[0], cz: HP[1], theta: 0, size: 88, tilt: 8, waist: 372, dof: 0 })],
  [CUT, DUR + 1, t => ({ cx: VP[0], cz: VP[1], theta: 180, size: 92, tilt: 8, waist: 360, dof: 0 })],
];
const camAt = t => { const s = shots.find(x => t >= x[0] && t < x[1]) || shots[shots.length - 1], c = s[2](t), kz = 100 / c.size; return Object.assign({}, c, { ty: c.waist - (645 - 273 * kz) }); };

const heroKeys = buildActor(hero, H.body, H.face, true, o), viniKeys = buildActor(vini, V.body, V.face, true, o);
const base = { show: true, layer: 'back', attach: 'free', style: 'night360', free: 1 };
const sceneAt = (k, c, tilt) => Object.assign({}, base, { x: r2(toSceneX(k._X)), y: r2(toSceneY(k._Z)), rot: r2(k._wh), tilt: r2(tilt), size: r2(c.size), dof: r2(c.dof), camX: r2(toSceneX(c.cx)), camY: r2(toSceneY(c.cz)), ty: r2(c.ty), camH: 0 });
heroKeys.forEach(k => { const c = camAt(k.t); k.yaw = r2(wrap(c.theta - k._wh)); k.props = { scene: sceneAt(k, c, c.tilt) }; });
viniKeys.forEach(k => { const c = camAt(k.t); k.yaw = 0; k.props = { scene: sceneAt(k, c, 10) }; });

const film = JSON.parse(JSON.stringify(H));
film.keys = cleanKeys(heroKeys); film.dur = DUR; film.loop = false; film.idle = false;
const k0 = film.keys[0];
film.pose = { type: 0, rotFine: 0, yaw: k0.yaw, hip: k0.hip, limbs: k0.limbs, poles: k0.poles, ends: k0.ends, armSide: { hL: 'auto', hR: 'auto' } };
film.props = Object.assign({}, film.props || {}, k0.props);
film.face = Object.assign({}, H.face, { on: true });
film.cast = [{ meta: { wx: toSceneX(VP[0]), wy: toSceneY(VP[1]), wh: 0 }, pose: JSON.parse(JSON.stringify(V.pose)), body: V.body, look: V.look, head: V.head, decals: V.decals, face: V.face, keys: cleanKeys(viniKeys) }];
const out = path.resolve(process.argv[2] || path.join(root, 'animations', 'phim-haaland-vini.json'));
fs.writeFileSync(out, JSON.stringify(film));
console.log('ok', film.keys.length, 'khoa,', film.cast.length, 'dien vien phu,', (fs.statSync(out).size / 1e6).toFixed(1), 'MB ->', out);
