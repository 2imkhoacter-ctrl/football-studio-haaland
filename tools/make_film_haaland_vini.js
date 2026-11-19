// Phim thử "Haaland suy nghĩ -> CẮT -> Vini ăn mừng SIUUU" (~8,6 giây, khổ dọc, câm). BẢN 2.
// Dùng: node tools/make_film_haaland_vini.js [file_ra.json]   (mặc định animations/phim-haaland-vini.json)
// Render: node tools/render_film.js animations/phim-haaland-vini.json ra/
// Ngôn ngữ dựng (xem docs/hoc-ky-thuat-short-bat-chuoc-1.md): mỗi lúc một thứ động, còn lại đứng im;
// chuyển động nhanh dứt khoát; cắt cảnh thẳng; cảm xúc bằng khuôn mặt.
// Bản 2 sửa: tay chắp thật sau lưng (vào cảnh đã sẵn tư thế), có cú dừng suy nghĩ trước khi quay, nhìn lên rõ hơn,
// camera đi theo và nhân vật to hơn, Vini mắt mở to + tay chúc xuống + cú "đập" cuối, tay chỉ mở khi đã quay mặt vào máy.
const fs = require('fs'), path = require('path');
const L = require('./film_lib.js');
const { S, clamp, mix, wrap, r2, wp, toSceneX, toSceneY, buildActor, cleanKeys } = L;
const root = path.resolve(__dirname, '..');
const R = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const H = R('data/characters/haaland-final.json'), V = R('data/characters/vini-final.json');
const FPS = 24, CUT = 5.4, DUR = 8.6, N = Math.round(DUR * FPS), o = { FPS, N };
const THETA_A = process.env.VIEW_THETA != null ? +process.env.VIEW_THETA : 0;   // chỉ để thử góc (xem tay sau lưng)

const HP = [0, 40], VP = [0, 10];             // chỗ đứng trên sân (mét). Hai người cách xa nhau để cảnh nào cũng không thấy người kia.
const ease = (t, a, b) => S(clamp((t - a) / (b - a), 0, 1));

// ---- tay chắp sau lưng: hai bàn tay gặp nhau ở giữa lưng dưới ----
function handsBehind(t, key, c) {
  const k = c.ka, tgt = { hL: [38 * k, 108 * k, -64 * k], hR: [-38 * k, 108 * k, -64 * k] };
  for (const s of ['hL', 'hR']) key.limbs[s] = tgt[s].slice();
  key.ends.hL = [-22, 0, 0]; key.ends.hR = [-22, 0, 0];
}

// ---- Haaland: đi sang phải, DỪNG nghĩ, quay nhanh, đi về, dừng, rồi NHÌN LÊN ----
const hero = {
  pos: [[0, -1.3, 40], [0.3, -1.3, 40], [2.0, 1.3, 40], [3.0, 1.3, 40], [4.3, -0.4, 40], [15, -0.4, 40]],
  head: [[0, -90], [2.95, -90], [3.2, 90], [4.3, 90], [4.45, 90], [4.72, 12], [15, 12]],
  runSpeed: 3.0, blink: 0.4, seed: 1,
  ges: [], faces: [{ t0: 0, t1: 15, e: 'think' }], jumps: [],
  mod: (t, key, c) => {
    handsBehind(t, key, c);                                              // tay chắp sau lưng suốt cả cảnh, ngay từ khung đầu
    const up = ease(t, 4.85, 5.0);                                       // NHÌN LÊN: mắt lên + lông mày nhướn
    key.face.lookY = r2(-100 * up);
    if (up > 0.5) { key.face.browKind = 'surprised'; }
    key.hrot = r2(-7 * up);
    key.rotFine = r2(key.rotFine - 4 * up);                               // ngả người nhẹ ra sau
  },
};

// ---- Vini: nhảy xoay (tay còn ở thấp), đáp xuống quay mặt vào máy rồi MỞ TAY "bụp", hét SIUUU, ưỡn ngực ----
const ARMS = {
  down: k => ({ hL: [-58 * k, 118 * k, -34 * k], hR: [58 * k, 118 * k, -34 * k] }),   // tay buông hơi ra sau lúc đang nhảy
  open: k => ({ hL: [-120 * k, 78 * k, -66 * k], hR: [120 * k, 78 * k, -66 * k] }),  // giang ra sau, chúc xuống
  pump: k => ({ hL: [-134 * k, 40 * k, -72 * k], hR: [134 * k, 40 * k, -72 * k] }),  // cú đập cuối: tay lên ngang
};
const T_LAND = CUT + 0.46, T_PUMP = CUT + 1.7;
const vini = {
  pos: [[0, VP[0], VP[1]], [15, VP[0], VP[1]]],
  head: [[0, 0], [CUT, 0], [CUT + 0.34, 180], [15, 180]],
  stance: 2.0, runSpeed: 1.6, blink: 1.1, seed: 7,
  ges: [], faces: [{ t0: 0, t1: T_LAND, e: 'grin' }, { t0: T_LAND, t1: 15, e: 'scream' }],
  jumps: [[CUT - 0.1, 95, 0.56]],
  mod: (t, key, c) => {
    const down = ARMS.down(c.ka), open = ARMS.open(c.ka), pump = ARMS.pump(c.ka);
    const wOpen = ease(t, T_LAND - 0.04, T_LAND + 0.1), wPump = ease(t, T_PUMP, T_PUMP + 0.1);
    for (const s of ['hL', 'hR']) {
      const a = down[s].map((v, j) => mix(v, open[s][j], wOpen));
      key.limbs[s] = a.map((v, j) => mix(v, pump[s][j], wPump));
    }
    key.hyaw = 0;
    if (t >= T_LAND) {                                                   // mặt SIUUU: mắt MỞ TO, hét to
      key.face.lidL = 0; key.face.lidR = 0; key.face.browKind = 'surprised'; key.face.mouthKind = 'a';
      key.face.mouthOpen = r2(t > T_PUMP ? 96 : 84); key.face.lookY = r2(-30 * wPump);
    }
    key.hrot = r2(5 * wPump);                                            // ngửa đầu nhẹ ở cú đập
    key.rotFine = r2(-3 * wOpen - 3 * wPump);
  },
};

// ---- camera: 2 cảnh, CẮT thẳng. Cảnh A đi theo Haaland (nhẹ), cảnh B đứng yên ----
const heroX = t => L.wp2(t, hero.pos)[0];
const shots = [
  [0, CUT, t => ({ cx: 0.85 * heroX(t), cz: HP[1], theta: THETA_A, size: 80, tilt: 8, waist: 330, dof: 0 })],
  [CUT, DUR + 1, t => ({ cx: VP[0], cz: VP[1], theta: 180, size: 72, tilt: 8, waist: 330, dof: 0 })],
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
